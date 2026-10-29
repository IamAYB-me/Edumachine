import React, { useMemo } from 'react';
import { Lock, CalendarClock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '@/store/useDataStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useCurrency } from '@/hooks/useCurrency';
import { resolveSchoolProfile, getPortalLevelLabels } from '@/utils/schoolProfile';
import { checkFeeGate, gatingBlockerMessage, filterFeeRecordsForStudent } from '@/utils/feeGating';

export default function StudentAccessGate({ children }: { children: React.ReactNode }) {
  const { students, schools, feeStructures, feeRecords } = useDataStore();
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const { format } = useCurrency();

  const schoolProfile = resolveSchoolProfile(user, schools);
  const labels = getPortalLevelLabels(schoolProfile.portalLevel);

  const myStudent = useMemo(() => students.find((s) => s.id === user?.id || s.email === user?.email), [students, user?.id, user?.email]);

  const myFeeRecords = useMemo(
    () => filterFeeRecordsForStudent(feeRecords, [user?.id, myStudent?.id, myStudent?.regNo, myStudent?.email]),
    [feeRecords, user?.id, myStudent?.id, myStudent?.regNo, myStudent?.email],
  );

  const gating = useMemo(
    () => checkFeeGate(feeStructures, myFeeRecords, myStudent?.class, 'course_registration', myStudent),
    [feeStructures, myFeeRecords, myStudent],
  );
  const registrationBlocked = !gating.isAllowed;
  const registrationClosed = useSettingsStore((s) => s.globalSettings.courseRegistrationEnabled) === false;
  const locked = registrationBlocked || registrationClosed;

  if (!locked) return <>{children}</>;

  const blockers = gating.blockers;
  const isFeeIssue = registrationBlocked;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-full max-w-xl">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-900/30">
          {isFeeIssue ? <Lock className="h-8 w-8 text-rose-500 dark:text-rose-400" /> : <CalendarClock className="h-8 w-8 text-amber-500 dark:text-amber-400" />}
        </div>

        {isFeeIssue ? (
          <>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Portal Locked — Fees Required
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              {gatingBlockerMessage('course_registration', myStudent?.class)} Complete your required fee payments below to activate this page.
            </p>

            {blockers.length > 0 && (
              <div className="mt-6 space-y-2 text-left">
                {blockers.map((b) => (
                  <div
                    key={b.structure.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-rose-100 dark:border-rose-900/30 bg-rose-50/40 dark:bg-rose-950/20 px-4 py-2.5"
                  >
                    <div className="text-left">
                      <p className="text-[13px] font-bold text-slate-900 dark:text-white">{b.structure.category}</p>
                      <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                        Paid {format(b.studentsPaid)} / Required {format(b.required)} ({b.structure.requiredPercentage ?? 100}%)
                      </p>
                    </div>
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400">{Math.round(b.percentagePaid)}%</span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => {
                const cat = blockers?.[0]?.structure?.category;
                navigate(cat ? `/student/fees?pay=${encodeURIComponent(cat)}` : '/student/fees');
              }}
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-900/20 transition-colors hover:bg-rose-700"
            >
              Pay Fees Now
              <ArrowRight className="h-4 w-4" />
            </button>
            <p className="mt-3 text-xs text-slate-400">Visit the Fees page to make or complete your payment.</p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Portal Locked
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Course registration for this {labels.termLabel} is currently closed by your school. Please check back later.
            </p>
          </>
        )}
      </div>
    </div>
  );
}