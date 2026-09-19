import { Award, ScrollText } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils';
import { useSettingsStore, type GlobalSettings } from '@/store/useSettingsStore';
import { useToastStore } from '@/store/useToastStore';

interface FeatureDef {
  title: string;
  description: string;
  enabledNote: string;
  disabledNote: string;
  icon: LucideIcon;
}

type StudentAccessFeature = 'results' | 'reportCard';
type StudentAccessSettingKey = 'resultsEnabledForStudents' | 'reportCardEnabledForStudents';

const FEATURE_DEFS: Record<StudentAccessFeature, FeatureDef> = {
  results: {
    title: 'Academic Results',
    description: 'Students can view their exam scores and performance on the portal.',
    enabledNote: 'Students can view their academic results on the portal.',
    disabledNote: 'Academic results are hidden from students until turned back on.',
    icon: Award,
  },
  reportCard: {
    title: 'Report Cards',
    description: 'Students can view and print their report cards on the portal.',
    enabledNote: 'Students (and their parents) can view report cards on the portal.',
    disabledNote: 'Report cards are hidden from students until turned back on.',
    icon: ScrollText,
  },
};

const SETTING_KEYS: Record<StudentAccessFeature, StudentAccessSettingKey> = {
  results: 'resultsEnabledForStudents',
  reportCard: 'reportCardEnabledForStudents',
};

export default function StudentAccessToggle({ feature }: { feature: StudentAccessFeature }) {
  const { globalSettings, updateGlobalSettings } = useSettingsStore();
  const showToast = useToastStore((state) => state.showToast);
  const def = FEATURE_DEFS[feature];
  const Icon = def.icon;
  const enabled = globalSettings[SETTING_KEYS[feature]] !== false;

  const handleToggle = async () => {
    try {
      await updateGlobalSettings({ [SETTING_KEYS[feature]]: !enabled } as Partial<GlobalSettings>);
      showToast({
        title: enabled ? `${def.title} hidden from students` : `${def.title} opened to students`,
        description: enabled ? def.disabledNote : def.enabledNote,
        variant: 'success',
      });
    } catch {
      showToast({
        title: 'Update failed',
        description: 'Could not update this setting. Please try again.',
        variant: 'error',
      });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg flex-shrink-0">
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{def.title}</span>
            <span className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold",
              enabled
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
            )}>
              {enabled ? 'ON' : 'OFF'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {enabled ? def.description : `${def.title} are currently hidden from students.`}
          </p>
        </div>
        <button
          onClick={handleToggle}
          aria-label={`Toggle ${def.title} for students`}
          className={cn(
            "relative w-11 h-6 rounded-full transition-colors flex-shrink-0",
            enabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
          )}
        >
          <div className={cn(
            "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform",
            enabled ? "translate-x-[22px]" : "translate-x-0.5"
          )} />
        </button>
      </div>
    </div>
  );
}