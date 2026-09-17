import { GraduationCap } from 'lucide-react';
import { cn } from '@/utils';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useToastStore } from '@/store/useToastStore';

export default function CourseRegistrationToggle() {
  const { globalSettings, updateGlobalSettings } = useSettingsStore();
  const showToast = useToastStore((state) => state.showToast);
  const enabled = globalSettings.courseRegistrationEnabled !== false;

  const handleToggle = async () => {
    try {
      await updateGlobalSettings({ courseRegistrationEnabled: !enabled });
      showToast({
        title: !enabled ? 'Course registration opened' : 'Course registration closed',
        description: !enabled
          ? 'Students can now register their courses on the portal.'
          : 'Students can no longer register courses until it is turned back on.',
        variant: 'success',
      });
    } catch {
      showToast({
        title: 'Update failed',
        description: 'Could not update course registration settings. Please try again.',
        variant: 'error',
      });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg flex-shrink-0">
          <GraduationCap className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Course Registration</span>
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
            {enabled
              ? 'Students can register their courses on the student portal.'
              : 'Course registration is closed — students cannot register until turned back on.'}
          </p>
        </div>
        <button
          onClick={handleToggle}
          aria-label="Toggle course registration"
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