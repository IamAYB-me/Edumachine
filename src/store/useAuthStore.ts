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

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  login: (role: Role) => void;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

// Mock users database to simulate authentication
const MOCK_USERS: Record<Role, User> = {
  SUPER_ADMIN: { 
    id: '1', name: 'Super Admin', email: 'admin@eduplatform.com', 
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

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,
      setHasHydrated: (value) => set({ _hasHydrated: value }),
      login: (role) => {
        // In a real app, this would be an API call verifying credentials
        set({ user: MOCK_USERS[role], isAuthenticated: true });
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
