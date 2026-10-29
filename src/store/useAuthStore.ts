import { create } from 'zustand';
import {
  registerUser,
  loginUser,
  logoutUser,
  onAuthStateChange,
  getUserProfile,
  updateUserProfile,
  autoPromoteApplicantIfAdmitted,
  type FirestoreUser,
} from '@/services/authService';
import { logActivity } from '@/utils/activityLogger';

const AUTH_SESSION_KEY = 'brochest:auth-session-v1';

function readCachedUser(): User | null {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function writeCachedUser(user: User | null) {
  try {
    if (user) {
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_SESSION_KEY);
    }
  } catch {
    /* localStorage unavailable */
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error('Request timed out')), ms);
    promise.then(
      (v) => { window.clearTimeout(timer); resolve(v); },
      (e) => { window.clearTimeout(timer); reject(e); },
    );
  });
}

export type Role =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'REGISTRAR'
  | 'TEACHER'
  | 'STUDENT'
  | 'PARENT'
  | 'HR'
  | 'WARDEN'
  | 'ACCOUNTANT'
  | 'TRANSPORT'
  | 'LIBRARIAN'
  | 'APPLICANT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  roleLabel: string;
  schoolName: string;
  avatarUrl?: string;
  phone?: string;
  address?: string;
  isTwoFactorEnabled?: boolean;
  portalLevel?: string;
  /** Set only while a session-level role switch is active (e.g. SUPER_ADMIN acting as ADMIN). */
  baseRole?: Role;
}

export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  schoolName: string;
  phone?: string;
  isVerified: boolean;
  verificationToken?: string;
  createdAt: string;
}

const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: 'System Admin',
  ADMIN: 'Administrator',
  REGISTRAR: 'Registrar',
  TEACHER: 'Teacher',
  STUDENT: 'Student',
  PARENT: 'Parent',
  HR: 'HR Manager',
  WARDEN: 'Warden',
  ACCOUNTANT: 'Accountant',
  TRANSPORT: 'Transport Officer',
  LIBRARIAN: 'Librarian',
  APPLICANT: 'Applicant',
};

const ROLE_DASHBOARDS: Record<Role, string> = {
  SUPER_ADMIN: '/super-admin',
  ADMIN: '/admin',
  REGISTRAR: '/registrar',
  TEACHER: '/teacher',
  STUDENT: '/student',
  PARENT: '/parent',
  HR: '/hr',
  WARDEN: '/hostel',
  ACCOUNTANT: '/accountant',
  TRANSPORT: '/transport',
  LIBRARIAN: '/librarian',
  APPLICANT: '/admission/progress',
};

export const ROLE_DASHBOARD_MAP = ROLE_DASHBOARDS;

function firestoreUserToUser(fu: FirestoreUser): User {
  return {
    id: fu.uid,
    name: fu.name,
    email: fu.email,
    role: fu.role as Role,
    roleLabel: fu.roleLabel || ROLE_LABELS[fu.role as Role] || fu.role,
    schoolName: fu.schoolName,
    avatarUrl: fu.avatarUrl,
    phone: fu.phone,
    address: fu.address,
    isTwoFactorEnabled: fu.isTwoFactorEnabled,
    portalLevel: fu.portalLevel,
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  _hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  initAuthListener: () => void;
  loginWithCredentials: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { name: string; email: string; password: string; role: Role; schoolName: string; phone?: string; portalLevel?: string; roleLabel?: string; surname?: string; firstName?: string; middleName?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  setRoleSwitch: (role: Role) => Promise<void>;
  clearRoleSwitch: () => Promise<void>;
}

const cachedSession = readCachedUser();

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: cachedSession,
  isAuthenticated: !!cachedSession,
  isLoading: false,
  _hasHydrated: !!cachedSession,

  setHasHydrated: () => {},

  initAuthListener: () => {
    const cachedUser = readCachedUser();
    if (cachedUser) {
      set({
        user: cachedUser,
        isAuthenticated: true,
        isLoading: false,
        _hasHydrated: true,
      });
    }

    onAuthStateChange(async (firebaseUser) => {
      let nextUser: User | null = null;
      if (firebaseUser) {
        try {
          const profile = await withTimeout(getUserProfile(firebaseUser.uid), 8000);
          if (profile) {
            const promotedUser = await autoPromoteApplicantIfAdmitted(firebaseUser.uid, profile);
            nextUser = firestoreUserToUser(promotedUser);
            // Preserve an active session-level role switch across auth refreshes:
            // the switched role is session-scoped (stored in the cache only) and
            // must survive Firebase re-firing auth state without touching Firestore.
            const cached = readCachedUser();
            if (cached?.baseRole && cached.baseRole === nextUser.role) {
              nextUser = { ...nextUser, role: cached.role, roleLabel: cached.roleLabel, baseRole: cached.baseRole };
            }
          } else {
            nextUser = cachedUser;
          }
        } catch {
          nextUser = cachedUser;
        }
      }
      writeCachedUser(nextUser);
      set({
        user: nextUser,
        isAuthenticated: !!nextUser,
        isLoading: false,
        _hasHydrated: true,
      });
    });
  },

  loginWithCredentials: async (identifier, password) => {
    const result = await loginUser(identifier, password);
    if (result.success && result.user) {
      const promotedUser = await autoPromoteApplicantIfAdmitted(result.user.uid, result.user);
      const user = firestoreUserToUser(promotedUser);
      set({ user, isAuthenticated: true });
      writeCachedUser(user);
      logActivity({ action: 'LOGIN', module: 'auth', description: `User logged in: ${user.email}`, user: { id: user.id, name: user.name, role: user.role } });
      return { success: true };
    }
    return { success: false, error: result.error };
  },

  register: async (data) => {
    return registerUser(
      data.email,
      data.password,
      data.name,
      data.role,
      data.roleLabel || ROLE_LABELS[data.role],
      data.schoolName,
      data.phone,
      data.portalLevel,
      data.surname,
      data.firstName,
      data.middleName,
    );
  },

  logout: async () => {
    const { user } = get();
    if (user) {
      logActivity({ action: 'LOGOUT', module: 'auth', description: `User logged out: ${user.email}`, user: { id: user.id, name: user.name, role: user.role } });
    }
    writeCachedUser(null);
    await logoutUser();
    set({ user: null, isAuthenticated: false });
  },

  updateProfile: async (updates) => {
    const { user } = get();
    if (!user) return;
    await updateUserProfile(user.id, {
      name: updates.name,
      phone: updates.phone,
      address: updates.address,
      avatarUrl: updates.avatarUrl,
      portalLevel: updates.portalLevel,
    });
    const nextUser = { ...user, ...updates };
    set({ user: nextUser });
    writeCachedUser(nextUser);
  },

  setRoleSwitch: async (role: Role) => {
    const { user } = get();
    if (!user || user.role !== 'SUPER_ADMIN') return;
    if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') return;
    if (user.role === role) return;
    const nextUser: User = {
      ...user,
      role,
      roleLabel: ROLE_LABELS[role],
      baseRole: user.baseRole || 'SUPER_ADMIN',
    };
    logActivity({ action: 'UPDATE', module: 'auth', description: `Role switch: ${user.email} acting as ${role}`, user: { id: user.id, name: user.name, role: user.role } }).catch(console.error);
    set({ user: nextUser });
    writeCachedUser(nextUser);
  },

  clearRoleSwitch: async () => {
    const { user } = get();
    if (!user?.baseRole) return;
    const nextUser: User = {
      ...user,
      role: user.baseRole,
      roleLabel: ROLE_LABELS[user.baseRole],
      baseRole: undefined,
    };
    logActivity({ action: 'UPDATE', module: 'auth', description: `Role switch: ${user.email} restored to ${user.baseRole}`, user: { id: user.id, name: user.name, role: user.role } }).catch(console.error);
    set({ user: nextUser });
    writeCachedUser(nextUser);
  },
}));
