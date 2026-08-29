import { create } from 'zustand';
import { subscribeToDocument, setDocument, deleteFieldsFromDocument } from '@/services/firestoreService';

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
    fromEmail: string;
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
  admissionsEnabled: boolean;
  admissionsEmail: string;
}

const DEFAULT_GLOBAL_SETTINGS: GlobalSettings = {
  appName: 'BROCHEST Portal',
  appTagline: 'School Management',
  supportEmail: '',
  contactPhone: '',
  language: 'English (US)',
  timezone: '(GMT+01:00) Lagos',
  maintenanceMode: false,
  passwordPolicy: {
    minLength: 8,
    requireCapital: true,
    requireNumbers: true,
    requireSymbols: true,
    expiryDays: 0,
  },
  authMethods: {
    enforce2FA: true,
    googleOAuth: false,
    sessionTimeout: true,
    ipWhitelisting: false,
  },
  smtpSettings: {
    host: '',
    port: '',
    encryption: '',
    username: '',
    fromEmail: '',
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
  admissionFormPrefix: 'BRO',
  admissionFormNextSequence: 1,
  admissionsEnabled: true,
  admissionsEmail: 'admissions@brochest.com.ng',
};

const STALE_FIELDS: string[] = [];

function detectStaleFields(doc: Record<string, unknown>): string[] {
  const fields: string[] = [];
  for (const key of ['logoUrl', 'faviconUrl']) {
    const val = doc[key];
    if (typeof val === 'string' && val.startsWith('data:') && val.length > 50_000) {
      fields.push(key);
    }
  }
  return fields;
}

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
  currency: 'NGN',
  globalSettings: DEFAULT_GLOBAL_SETTINGS,
  _hasHydrated: false,

  initSettingsSubscription: () => {
    subscribeToDocument('settings', 'global', (doc) => {
      if (doc) {
        const stale = detectStaleFields(doc);
        const clean: Record<string, unknown> = { ...doc };
        for (const f of stale) {
          delete clean[f];
        }
        set({
          globalSettings: { ...DEFAULT_GLOBAL_SETTINGS, ...clean },
          _hasHydrated: true,
        });
        if (stale.length > 0) {
          deleteFieldsFromDocument('settings', 'global', stale)
            .then(() => {})
            .catch((e) => console.error('Failed to clean stale base64:', e));
        }
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
      await setDocument('settings', 'global', updates);
    } catch (err) {
      console.error('Failed to save settings to Firestore:', err);
      set({ globalSettings });
      throw err;
    }
  },
}));
