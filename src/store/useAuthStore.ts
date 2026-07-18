import { create } from 'zustand';
import {
  registerUser,
  loginUser,
  logoutUser,
  onAuthStateChange,
  getUserProfile,
  updateUserProfile,
  type FirestoreUser,
} from '@/services/authService';

export type Role =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'TEACHER'
  | 'STUDENT'
  | 'PARENT'
  | 'HR'
  | 'WARDEN'
  | 'ACCOUNTANT'
  | 'TRANSPORT'
  | 'LIBRARIAN';

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
  TEACHER: 'Teacher',
  STUDENT: 'Student',
  PARENT: 'Parent',
  HR: 'HR Manager',
  WARDEN: 'Warden',
  ACCOUNTANT: 'Accountant',
  TRANSPORT: 'Transport Officer',
  LIBRARIAN: 'Librarian',
};

const ROLE_DASHBOARDS: Record<Role, string> = {
  SUPER_ADMIN: '/super-admin',
  ADMIN: '/admin',
  TEACHER: '/teacher',
  STUDENT: '/student',
  PARENT: '/parent',
  HR: '/hr',
  WARDEN: '/hostel',
  ACCOUNTANT: '/accountant',
  TRANSPORT: '/transport',
  LIBRARIAN: '/librarian',
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
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  _hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  initAuthListener: () => void;
  loginWithCredentials: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { name: string; email: string; password: string; role: Role; schoolName: string; phone?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  _hasHydrated: true,

  setHasHydrated: () => {},

  initAuthListener: () => {
    onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid);
        if (profile) {
          set({ user: firestoreUserToUser(profile), isAuthenticated: true, isLoading: false });
        } else {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    });
  },

  loginWithCredentials: async (email, password) => {
    const result = await loginUser(email, password);
    if (result.success && result.user) {
      set({ user: firestoreUserToUser(result.user), isAuthenticated: true });
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
      ROLE_LABELS[data.role],
      data.schoolName,
      data.phone,
    );
  },

  logout: async () => {
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
    });
    set({ user: { ...user, ...updates } });
  },
}));
