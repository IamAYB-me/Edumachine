import { create } from 'zustand';
import { subscribeToCollection, setDocument } from '@/services/firestoreService';

interface GlobalSettings {
  appName: string;
  appTagline: string;
  supportEmail: string;
  contactPhone: string;
  language: string;
  timezone: string;
  logoUrl?: string;
  faviconUrl?: string;
  maintenanceMode: boolean;
  passwordPolicy: {
    minLength: number;
    requireCapital: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
    expiryDays: number;
  };
  authMethods: {
    enforce2FA: boolean;
    googleOAuth: boolean;
    sessionTimeout: boolean;
    ipWhitelisting: boolean;
  };
  smtpSettings: {
    host: string;
    port: string;
    encryption: string;
    username: string;
  };
  timetableSettings: {
    startDay: string;
    endDay: string;
    periodDuration: number;
    periodsPerDay: number;
    breakStart: string;
    breakDuration: number;
  };
  admissionFee: number;
  admissionFormPrefix: string;
  admissionFormNextSequence: number;
}

const DEFAULT_GLOBAL_SETTINGS: GlobalSettings = {
  appName: 'EduPlatform SaaS',
  appTagline: 'The Future of School Management',
  supportEmail: 'support@myskulbot.com',
  contactPhone: '+1 (555) 000-0000',
  language: 'English (US)',
  timezone: '(GMT+01:00) Lagos',
  maintenanceMode: false,
  passwordPolicy: {
    minLength: 8,
    requireCapital: true,
    requireNumbers: true,
    requireSymbols: true,
    expiryDays: 90,
  },
  authMethods: {
    enforce2FA: true,
    googleOAuth: false,
    sessionTimeout: true,
    ipWhitelisting: false,
  },
  smtpSettings: {
    host: 'smtp.sendgrid.net',
    port: '587',
    encryption: 'STARTTLS',
    username: 'apikey',
  },
  timetableSettings: {
    startDay: 'Monday',
    endDay: 'Friday',
    periodDuration: 40,
    periodsPerDay: 8,
    breakStart: '11:00 AM',
    breakDuration: 30,
  },
  admissionFee: 5000,
  admissionFormPrefix: 'EMS',
  admissionFormNextSequence: 1,
};

interface SettingsState {
  theme: 'light' | 'dark';
  currency: string;
  globalSettings: GlobalSettings;
  _hasHydrated: boolean;
  initSettingsSubscription: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  setCurrency: (currency: string) => void;
  updateGlobalSettings: (updates: Partial<GlobalSettings>) => void;
}

export const useSettingsStore = create<SettingsState>()((set, get) => ({
  theme: 'light',
  currency: 'USD',
  globalSettings: DEFAULT_GLOBAL_SETTINGS,
  _hasHydrated: false,

  initSettingsSubscription: () => {
    subscribeToCollection('settings', (docs) => {
      if (docs.length > 0) {
        const settingsDoc = docs[0];
        set({
          globalSettings: { ...DEFAULT_GLOBAL_SETTINGS, ...settingsDoc },
          _hasHydrated: true,
        });
      } else {
        set({ _hasHydrated: true });
      }
    }, () => {
      set({ _hasHydrated: true });
    });
  },

  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  setCurrency: (currency) => set({ currency }),
  updateGlobalSettings: async (updates) => {
    const { globalSettings } = get();
    const merged = { ...globalSettings, ...updates };
    set({ globalSettings: merged });
    try {
      await setDocument('settings', 'global', merged);
    } catch (err) {
      console.error('Failed to save settings to Firestore:', err);
    }
  },
}));
