import { useState, useMemo } from 'react';
import { Hash, Loader2, ClipboardList } from 'lucide-react';
import { cn } from '@/utils';
import { useDataStore } from '@/store/useDataStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';
import { resolveSchoolProfile } from '@/utils/schoolProfile';
import {
  allocateAdmissionNumbers,
  parseAdmissionNumber,
} from '@/utils/admissionNumbers';

const ALLOWED_ROLES = new Set(['ADMIN', 'REGISTRAR']);

export default function AllocateAdmissionNumbersButton() {
  const { students, admissionApplications, updateStudent, schools } = useDataStore();
  const user = useAuthStore((state) => state.user);
  const showToast = useToastStore((state) => state.showToast);
  const [allocating, setAllocating] = useState(false);

  const schoolProfile = resolveSchoolProfile(user ?? null, schools);
  const schoolCode = (schoolProfile.code || 'BRC').toUpperCase();
  const allowed = user ? ALLOWED_ROLES.has(user.role) : false;

  const pending = useMemo(() => {
    if (!allowed) return [];
    return students.filter((s) => !s.admissionNumber || !String(s.admissionNumber).trim());
  }, [students, allowed]);

  const { maxYear, nextPreview } = useMemo(() => {
    let maxYear = '';
    for (const student of students) {
      const parsed = parseAdmissionNumber(student.admissionNumber || '');
      if (parsed && parsed.schoolCode === schoolCode && parsed.year > maxYear) {
        maxYear = parsed.year;
      }
    }
    const year = maxYear || String(new Date().getFullYear());
    const numbered = pending.map((s) => {
      const parsed = parseAdmissionNumber(s.admissionNumber || '');
      return parsed && parsed.year === year ? parsed.seq : 0;
    });
    const nextSeq = (numbered.length > 0 ? Math.max(...numbered) : 0) + 1;
    return { maxYear: year, nextPreview: `${schoolCode}/${year}/${String(nextSeq).padStart(3, '0')}` };
  }, [students, pending, schoolCode]);

  if (!allowed) return null;

  const handleAllocate = () => {
    const allocations = allocateAdmissionNumbers(students, admissionApplications, schoolCode);
    if (allocations.length === 0) {
      showToast({ title: 'Nothing to allocate', description: 'Every student already has an admission number.', variant: 'info' });
      return;
    }
    if (!confirm(
      `Allocate admission numbers for ${allocations.length} newly admitted student(s) (e.g. ${allocations[0].admissionNumber})?`,
    )) return;

    setAllocating(true);
    let done = 0;
    let failed = 0;
    for (const allocation of allocations) {
      const res = updateStudent(allocation.id, { admissionNumber: allocation.admissionNumber });
      if (res.success) done += 1;
      else failed += 1;
    }
    setAllocating(false);
    if (done > 0) {
      showToast({
        title: `${done} admission number(s) allocated`,
        description: `Example: ${allocations[0].admissionNumber}${failed > 0 ? ` (${failed} failed)` : ''}`,
        variant: 'success',
      });
    } else {
      showToast({ title: 'Allocation failed', description: 'No records could be updated. Please try again.', variant: 'error' });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex-shrink-0">
          <ClipboardList className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Allocate Admission Numbers</span>
            <span className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold",
              pending.length > 0
                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
            )}>
              {pending.length > 0 ? `${pending.length} pending` : 'ALL ALLOCATED'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Assigns <span className="font-mono text-slate-500">{schoolCode}/COURSE/{maxYear}/###</span> to newly admitted students without a number.
          </p>
        </div>
        <button
          onClick={handleAllocate}
          disabled={allocating || pending.length === 0}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
            pending.length === 0 || allocating
              ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20"
          )}
        >
          {allocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Hash className="w-4 h-4" />}
          {allocating ? 'Allocating...' : 'Allocate Now'}
        </button>
      </div>
    </div>
  );
}