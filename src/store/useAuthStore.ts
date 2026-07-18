import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

const MOCK_USERS: Record<Role, User> = {
  SUPER_ADMIN: {
    id: '1', name: 'Super Admin', email: 'admin@myskulbot.com',
    role: 'SUPER_ADMIN', roleLabel: 'System Admin', schoolName: 'Global Platform',
    phone: '+1 (555) 001-0001', address: '123 Tech Ave, Silicon Valley', isTwoFactorEnabled: true
  },
  ADMIN: {
    id: '2', name: 'Admin', email: 'admin@greenfield.edu',
    role: 'ADMIN', roleLabel: 'Administrator', schoolName: 'Greenfield International School',
    phone: '+1 (555) 002-0002', address: '456 School Ln, Education City', isTwoFactorEnabled: false
  },
  TEACHER: {
    id: '3', name: 'Dr. Emily Carter', email: 'ecarter@greenfield.edu',
    role: 'TEACHER', roleLabel: 'Lecturer', schoolName: 'Greenfield International School',
    phone: '+1 (555) 003-0003', address: '789 Faculty Rd, Academic Village', isTwoFactorEnabled: false
  },
  STUDENT: {
    id: '4', name: 'John Doe', email: 'jdoe@greenfield.edu',
    role: 'STUDENT', roleLabel: 'Student', schoolName: 'Greenfield University',
    phone: '+1 (555) 004-0004', address: '101 Dorm St, Campus Town', isTwoFactorEnabled: false
  },
  PARENT: {
    id: '5', name: 'Mrs. Sarah Johnson', email: 'sjohnson@email.com',
    role: 'PARENT', roleLabel: 'Parent', schoolName: 'Greenfield International School',
    phone: '+1 (555) 005-0005', address: '202 Family Cir, Residential Heights', isTwoFactorEnabled: true
  },
  HR: {
    id: '6', name: 'HR Manager', email: 'hr@greenfield.edu',
    role: 'HR', roleLabel: 'Manager', schoolName: 'Greenfield International School',
    phone: '+1 (555) 006-0006', address: '303 Office Blk, Business District', isTwoFactorEnabled: false
  },
  WARDEN: {
    id: '7', name: 'Hostel Warden', email: 'warden@greenfield.edu',
    role: 'WARDEN', roleLabel: 'Warden', schoolName: 'Greenfield University',
    phone: '+1 (555) 007-0007', address: '404 Warden House, Hostel Complex', isTwoFactorEnabled: false
  },
  ACCOUNTANT: {
    id: '8', name: 'Accountant', email: 'finance@greenfield.edu',
    role: 'ACCOUNTANT', roleLabel: 'Finance', schoolName: 'Greenfield International School',
    phone: '+1 (555) 008-0008', address: '505 Finance Wing, Admin Building', isTwoFactorEnabled: true
  },
  TRANSPORT: {
    id: '9', name: 'Transport Officer', email: 'transport@greenfield.edu',
    role: 'TRANSPORT', roleLabel: 'Transport', schoolName: 'Greenfield International School',
    phone: '+1 (555) 009-0009', address: '606 Fleet Yard, Transit Area', isTwoFactorEnabled: false
  },
  LIBRARIAN: {
    id: '10', name: 'Librarian', email: 'library@greenfield.edu',
    role: 'LIBRARIAN', roleLabel: 'Library', schoolName: 'Greenfield International School',
    phone: '+1 (555) 010-0010', address: '707 Library St, Knowledge Square', isTwoFactorEnabled: false
  },
};

const STORAGE_KEY = 'edu-platform-registered-users';
const VERIFICATION_KEY = 'edu-platform-verifications';

function getRegisteredUsers(): RegisteredUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRegisteredUsers(users: RegisteredUser[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function getVerifications(): Record<string, { token: string; email: string; expiresAt: number }> {
  try {
    const raw = localStorage.getItem(VERIFICATION_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveVerifications(v: Record<string, { token: string; email: string; expiresAt: number }>) {
  localStorage.setItem(VERIFICATION_KEY, JSON.stringify(v));
}

function generateToken(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  login: (role: Role) => void;
  loginWithCredentials: (email: string, password: string) => { success: boolean; error?: string };
  register: (data: { name: string; email: string; password: string; role: Role; schoolName: string; phone?: string }) => { success: boolean; error?: string; verificationToken?: string };
  verifyEmail: (token: string) => { success: boolean; error?: string };
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

export const ROLE_DASHBOARD_MAP = ROLE_DASHBOARDS;

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,
      setHasHydrated: (value) => set({ _hasHydrated: value }),

      login: (role) => {
        set({ user: MOCK_USERS[role], isAuthenticated: true });
      },

      loginWithCredentials: (email, password) => {
        const normalizedEmail = email.trim().toLowerCase();

        const mockEntry = Object.values(MOCK_USERS).find(
          (u) => u.email.toLowerCase() === normalizedEmail
        );
        if (mockEntry) {
          const mockPasswords: Record<string, string> = {
            'admin@myskulbot.com': 'admin123',
            'admin@greenfield.edu': 'admin123',
            'ecarter@greenfield.edu': 'teacher123',
            'jdoe@greenfield.edu': 'student123',
            'sjohnson@email.com': 'parent123',
            'hr@greenfield.edu': 'hr123',
            'warden@greenfield.edu': 'warden123',
            'finance@greenfield.edu': 'accountant123',
            'transport@greenfield.edu': 'transport123',
            'library@greenfield.edu': 'librarian123',
          };
          if (password === (mockPasswords[normalizedEmail] || '')) {
            set({ user: mockEntry, isAuthenticated: true });
            return { success: true };
          }
        }

        const registered = getRegisteredUsers();
        const found = registered.find((u) => u.email.toLowerCase() === normalizedEmail);

        if (!found) {
          return { success: false, error: 'No account found with this email address.' };
        }

        if (found.password !== password) {
          return { success: false, error: 'Incorrect password. Please try again.' };
        }

        if (!found.isVerified) {
          return { success: false, error: 'Please verify your email before logging in. Check your inbox for the verification link.' };
        }

        const authUser: User = {
          id: found.id,
          name: found.name,
          email: found.email,
          role: found.role,
          roleLabel: ROLE_LABELS[found.role],
          schoolName: found.schoolName,
          phone: found.phone,
        };

        set({ user: authUser, isAuthenticated: true });
        return { success: true };
      },

      register: (data) => {
        const normalizedEmail = data.email.trim().toLowerCase();
        const registered = getRegisteredUsers();

        const existingMock = Object.values(MOCK_USERS).find(
          (u) => u.email.toLowerCase() === normalizedEmail
        );
        if (existingMock) {
          return { success: false, error: 'An account with this email already exists.' };
        }

        const existingRegistered = registered.find(
          (u) => u.email.toLowerCase() === normalizedEmail
        );
        if (existingRegistered) {
          return { success: false, error: 'An account with this email already exists.' };
        }

        const token = generateToken();
        const newUser: RegisteredUser = {
          id: Math.random().toString(36).slice(2, 11),
          name: data.name.trim(),
          email: normalizedEmail,
          password: data.password,
          role: data.role,
          schoolName: data.schoolName.trim(),
          phone: data.phone,
          isVerified: false,
          verificationToken: token,
          createdAt: new Date().toISOString(),
        };

        registered.push(newUser);
        saveRegisteredUsers(registered);

        const verifications = getVerifications();
        verifications[token] = {
          token,
          email: normalizedEmail,
          expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        };
        saveVerifications(verifications);

        console.log(`[EduMachine] Verification email sent to ${normalizedEmail}`);
        console.log(`[EduMachine] Verification link: /verify-email?token=${token}`);

        return { success: true, verificationToken: token };
      },

      verifyEmail: (token) => {
        const verifications = getVerifications();
        const record = verifications[token];

        if (!record) {
          return { success: false, error: 'Invalid or expired verification link.' };
        }

        if (Date.now() > record.expiresAt) {
          delete verifications[token];
          saveVerifications(verifications);
          return { success: false, error: 'This verification link has expired. Please request a new one.' };
        }

        const registered = getRegisteredUsers();
        const userIndex = registered.findIndex(
          (u) => u.email.toLowerCase() === record.email
        );

        if (userIndex === -1) {
          return { success: false, error: 'User account not found.' };
        }

        registered[userIndex].isVerified = true;
        registered[userIndex].verificationToken = undefined;
        saveRegisteredUsers(registered);

        delete verifications[token];
        saveVerifications(verifications);

        return { success: true };
      },

      logout: () => set({ user: null, isAuthenticated: false }),

      updateProfile: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),
    }),
    {
      name: 'edu-platform-auth',
      version: 1,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
