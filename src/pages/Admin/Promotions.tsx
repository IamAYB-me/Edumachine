import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  ArrowRightLeft,
  Check,
  GraduationCap,
  Search,
  UserCheck,
  Users,
} from 'lucide-react';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { useDataStore, type Student } from '@/store/useDataStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';
import { resolveSchoolProfile, getPortalLevelLabels, getPromotionPath, promotesByClass } from '@/utils/schoolProfile';
import { cn } from '@/utils';

const GRADUATE_VALUE = '__graduate__';
const UNASSIGNED_VALUE = '__unassigned__';

const departmentOf = (student: Student) => (student.classDepartment || student.class || '').trim();

export default function Promotions() {
  const students = useDataStore((state) => state.students);
  const schools = useDataStore((state) => state.schools);
  const bulkUpdateStudentLevel = useDataStore((state) => state.bulkUpdateStudentLevel);
  const bulkUpdateStudentClass = useDataStore((state) => state.bulkUpdateStudentClass);
  const bulkGraduateStudents = useDataStore((state) => state.bulkGraduateStudents);
  const user = useAuthStore((state) => state.user);
  const showToast = useToastStore((state) => state.showToast);

  const schoolProfile = resolveSchoolProfile(user ?? null, schools);
  const labels = getPortalLevelLabels(schoolProfile.portalLevel);
  const isClassBased = promotesByClass(schoolProfile.portalLevel);
  const promotionPath = useMemo(() => getPromotionPath(schoolProfile.portalLevel), [schoolProfile.portalLevel]);

  const [sourceLevel, setSourceLevel] = useState('');
  const [targetLevel, setTargetLevel] = useState('');
  const [department, setDepartment] = useState('');
  const [includeInactive, setIncludeInactive] = useState(false);
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');
  const [confirming, setConfirming] = useState(false);

  const fieldValue = useMemo(
    () => (student: Student) => ((isClassBased ? student.class : student.level) || '').trim(),
    [isClassBased],
  );

  const stepLabel = isClassBased ? labels.structureSingular : 'Year / Level';
  const sourceLabel = sourceLevel === UNASSIGNED_VALUE ? 'Unassigned' : sourceLevel;

  const departments = useMemo(() => {
    const names = new Set<string>();
    students.forEach((student) => {
      const dept = departmentOf(student);
      if (dept) names.add(dept);
    });
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [students]);

  const levelNames = useMemo(() => {
    const names = new Set<string>(promotionPath);
    students.forEach((student) => {
      const value = fieldValue(student);
      if (value) names.add(value);
    });
    const extras = Array.from(names)
      .filter((name) => !promotionPath.includes(name))
      .sort((a, b) => a.localeCompare(b));
    return [...promotionPath, ...extras];
  }, [promotionPath, students, fieldValue]);

  const countFor = (name: string) =>
    students.filter((student) => fieldValue(student) === name && (includeInactive || student.status === 'Active')).length;

  const unassignedCount = useMemo(
    () => students.filter((student) => !fieldValue(student) && (includeInactive || student.status === 'Active')).length,
    [students, includeInactive, fieldValue],
  );

  const levelOptions = useMemo(
    () => levelNames.map((name) => ({ value: name, label: name, sublabel: `${countFor(name)} student(s)` })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [levelNames, students, includeInactive, fieldValue],
  );

  const sourceOptions = useMemo(
    () =>
      unassignedCount > 0
        ? [
            { value: UNASSIGNED_VALUE, label: 'Unassigned', sublabel: `${unassignedCount} student(s) with no ${stepLabel.toLowerCase()}` },
            ...levelOptions,
          ]
        : levelOptions,
    [levelOptions, unassignedCount, stepLabel],
  );

  const departmentOptions = useMemo(
    () => [
      { value: '', label: `All ${labels.structurePlural.toLowerCase()}` },
      ...departments.map((name) => ({ value: name, label: name })),
    ],
    [departments, labels.structurePlural],
  );

  const targetOptions = useMemo(
    () => [
      ...levelOptions.filter((option) => option.value !== sourceLevel),
      { value: GRADUATE_VALUE, label: 'Graduated', sublabel: 'Complete programme & mark as graduated' },
    ],
    [levelOptions, sourceLevel],
  );

  const suggestedTarget = useMemo(() => {
    if (sourceLevel === UNASSIGNED_VALUE) return promotionPath[0] ?? '';
    const index = promotionPath.indexOf(sourceLevel);
    if (index === -1) return '';
    return promotionPath[index + 1] ?? GRADUATE_VALUE;
  }, [promotionPath, sourceLevel]);

  const missingValueCount = useMemo(
    () => students.filter((student) => student.status === 'Active' && !fieldValue(student)).length,
    [students, fieldValue],
  );

  const candidates = useMemo(() => {
    if (!sourceLevel) return [];
    return students
      .filter((student) =>
        sourceLevel === UNASSIGNED_VALUE ? !fieldValue(student) : fieldValue(student) === sourceLevel,
      )
      .filter((student) => isClassBased || !department || departmentOf(student) === department)
      .filter((student) => includeInactive || student.status === 'Active')
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [students, sourceLevel, department, includeInactive, fieldValue, isClassBased]);

  const visibleCandidates = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return candidates;
    return candidates.filter(
      (student) =>
        student.name.toLowerCase().includes(q) ||
        (student.regNo?.toLowerCase().includes(q) ?? false) ||
        (student.admissionNumber?.toLowerCase().includes(q) ?? false) ||
        departmentOf(student).toLowerCase().includes(q),
    );
  }, [candidates, query]);

  const selectedIds = useMemo(
    () => candidates.filter((student) => !excluded.has(student.id)).map((student) => student.id),
    [candidates, excluded],
  );

  const allVisibleSelected = visibleCandidates.length > 0 && visibleCandidates.every((s) => !excluded.has(s.id));

  const toggleStudent = (id: string) => {
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllVisible = () => {
    setExcluded((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        visibleCandidates.forEach((student) => next.add(student.id));
      } else {
        visibleCandidates.forEach((student) => next.delete(student.id));
      }
      return next;
    });
  };

  const handleSourceChange = (value: string) => {
    setSourceLevel(value);
    setExcluded(new Set());
    setQuery('');
    if (value === UNASSIGNED_VALUE) {
      setTargetLevel(promotionPath[0] ?? '');
      return;
    }
    const index = promotionPath.indexOf(value);
    setTargetLevel(index === -1 ? '' : promotionPath[index + 1] ?? GRADUATE_VALUE);
  };

  const handlePromote = () => {
    if (!sourceLevel || !targetLevel || selectedIds.length === 0) return;
    const isGraduating = targetLevel === GRADUATE_VALUE;
    const moved = isGraduating
      ? bulkGraduateStudents(selectedIds)
      : isClassBased
        ? bulkUpdateStudentClass(selectedIds, targetLevel)
        : bulkUpdateStudentLevel(selectedIds, targetLevel);

    showToast({
      title: moved > 0 ? 'Promotion complete' : 'Nothing to promote',
      description:
        moved > 0
          ? `${moved} ${labels.learnerSingular.toLowerCase()}${moved === 1 ? '' : 's'} ${
              isGraduating
                ? 'marked as graduated'
                : `promoted from ${sourceLabel} to ${targetLevel}${
                    isClassBased ? '' : '. Their department was not changed.'
                  }`
            }`
          : 'No student records were updated.',
      variant: moved > 0 ? 'success' : 'warning',
    });

    setConfirming(false);
    setExcluded(new Set());
  };

  const targetLabel = targetLevel === GRADUATE_VALUE ? 'Graduated' : targetLevel;
  const title = isClassBased ? `${labels.structureSingular} Promotion` : 'Year Promotion';

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {isClassBased
            ? `Move learners to the next ${labels.structureSingular.toLowerCase()} (e.g. JSS 1 to JSS 2, or SSS 3 to Graduation).`
            : 'Move learners to the next year of study (e.g. Year 1 to Year 2). Their department stays the same.'}
        </p>
      </motion.div>

      {promotionPath.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-slate-100 bg-white p-3 dark:border-slate-700/60 dark:bg-slate-800/60">
          <span className="mr-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Path</span>
          {promotionPath.map((step, index) => (
            <span key={step} className="flex items-center gap-1.5">
              {index > 0 && <ArrowRight className="h-3 w-3 text-slate-300 dark:text-slate-600" />}
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-700/70 dark:text-slate-300">
                {step}
              </span>
            </span>
          ))}
          <span className="flex items-center gap-1.5">
            <ArrowRight className="h-3 w-3 text-slate-300 dark:text-slate-600" />
            <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-semibold text-violet-600 dark:bg-violet-900/40 dark:text-violet-300">
              Graduation
            </span>
          </span>
        </div>
      )}

      {missingValueCount > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-900/20">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
            {missingValueCount} active {labels.learnerSingular.toLowerCase()}
            {missingValueCount === 1 ? '' : 's'} have no {stepLabel.toLowerCase()} set. Choose{' '}
            <span className="font-bold">Unassigned</span> as the source above to assign their {stepLabel.toLowerCase()}{' '}
            in bulk.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AnimatedCard className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
              <Users className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Promote from</p>
              <p className="text-xs text-slate-400">Select the current {stepLabel.toLowerCase()}</p>
            </div>
          </div>
          <SearchableSelect
            options={sourceOptions}
            value={sourceLevel}
            onChange={handleSourceChange}
            placeholder={`Select a ${stepLabel.toLowerCase()}...`}
            emptyText="No options found"
          />
          {sourceLevel && (
            <p className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">
              {candidates.length} eligible {labels.learnerSingular.toLowerCase()}
              {candidates.length === 1 ? '' : 's'} in {sourceLabel}
            </p>
          )}
        </AnimatedCard>

        <AnimatedCard className="p-5" delay={0.05}>
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300">
                <ArrowRight className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Promote to</p>
                <p className="text-xs text-slate-400">Select the next step</p>
              </div>
            </div>
            {suggestedTarget && sourceLevel && (
              <button
                type="button"
                onClick={() => setTargetLevel(suggestedTarget)}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 transition-colors hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:text-slate-400 dark:hover:text-blue-300"
              >
                Suggest: {suggestedTarget === GRADUATE_VALUE ? 'Graduated' : suggestedTarget}
              </button>
            )}
          </div>
          <SearchableSelect
            options={targetOptions}
            value={targetLevel}
            onChange={setTargetLevel}
            placeholder="Select destination..."
            emptyText="No options found"
            disabled={!sourceLevel}
          />
        </AnimatedCard>
      </div>

      <AnimatedCard className="p-5" delay={0.1}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          {!isClassBased && (
            <div className="w-full lg:max-w-xs">
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                {labels.structureSingular} (optional)
              </label>
              <SearchableSelect
                options={departmentOptions}
                value={department}
                onChange={(value) => {
                  setDepartment(value);
                  setExcluded(new Set());
                }}
                placeholder={`All ${labels.structurePlural.toLowerCase()}`}
                emptyText="None found"
                disabled={!sourceLevel}
              />
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                className="h-3.5 w-3.5 accent-blue-600"
                checked={includeInactive}
                onChange={(e) => {
                  setIncludeInactive(e.target.checked);
                  setExcluded(new Set());
                }}
              />
              Include inactive
            </label>
            <button
              type="button"
              onClick={toggleAllVisible}
              disabled={visibleCandidates.length === 0}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-blue-400 hover:text-blue-600 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:text-blue-300"
            >
              {allVisibleSelected ? 'Unselect all' : 'Select all'}
            </button>
          </div>
        </div>

        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, reg no, admission no or department..."
            className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-3 pl-11 pr-4 text-sm font-medium outline-none transition-all focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div className="mt-4 max-h-[26rem] overflow-y-auto rounded-2xl border border-slate-100 dark:border-slate-700/60">
          {!sourceLevel ? (
            <p className="px-4 py-10 text-center text-sm font-medium text-slate-400">
              Select a {stepLabel.toLowerCase()} to see the {labels.learnerPlural.toLowerCase()}.
            </p>
          ) : visibleCandidates.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm font-medium text-slate-400">
              No {labels.learnerPlural.toLowerCase()} match this selection.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {visibleCandidates.map((student) => {
                const checked = !excluded.has(student.id);
                const secondaryLine = isClassBased
                  ? student.regNo || 'No reg no'
                  : `${student.regNo || 'No reg no'}${departmentOf(student) ? ` • ${departmentOf(student)}` : ''}`;
                return (
                  <li key={student.id}>
                    <button
                      type="button"
                      onClick={() => toggleStudent(student.id)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    >
                      <span
                        className={cn(
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors',
                          checked
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800',
                        )}
                      >
                        {checked && <Check className="h-3.5 w-3.5" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {student.name}
                        </span>
                        <span className="block truncate text-xs text-slate-400">{secondaryLine}</span>
                      </span>
                      <span
                        className={cn(
                          'shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold',
                          student.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-700/60 dark:text-slate-300',
                        )}
                      >
                        {student.status}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </AnimatedCard>

      <AnimatedCard className="p-5" delay={0.15}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300">
              <ArrowRightLeft className="h-5 w-5" />
            </span>
            <div className="text-sm">
              {sourceLevel && targetLevel ? (
                <p className="font-semibold text-slate-800 dark:text-slate-100">
                  Promote <span className="text-blue-600 dark:text-blue-300">{selectedIds.length}</span>{' '}
                  {labels.learnerSingular.toLowerCase()}
                  {selectedIds.length === 1 ? '' : 's'} from{' '}
                  <span className="text-slate-500 dark:text-slate-400">{sourceLabel}</span> to{' '}
                  <span className="text-slate-500 dark:text-slate-400">{targetLabel}</span>
                </p>
              ) : (
                <p className="font-medium text-slate-400">
                  Choose a current and next {stepLabel.toLowerCase()} to continue.
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            disabled={!sourceLevel || !targetLevel || selectedIds.length === 0}
            onClick={() => setConfirming(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {targetLevel === GRADUATE_VALUE ? <GraduationCap className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
            {targetLevel === GRADUATE_VALUE ? 'Graduate selected' : 'Promote selected'}
          </button>
        </div>
      </AnimatedCard>

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <AnimatedCard className="w-full max-w-md p-6" noEntrance>
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div>
                <p className="text-base font-bold text-slate-900 dark:text-white">Confirm promotion</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  You are about to {targetLevel === GRADUATE_VALUE ? 'mark' : 'promote'}{' '}
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedIds.length}</span>{' '}
                  {labels.learnerSingular.toLowerCase()}
                  {selectedIds.length === 1 ? '' : 's'} from{' '}
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{sourceLabel}</span> to{' '}
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{targetLabel}</span>.
                  {isClassBased ? '' : ' Their department will not change.'} This updates their records immediately.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePromote}
                className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-700"
              >
                Yes, confirm
              </button>
            </div>
          </AnimatedCard>
        </div>
      )}
    </div>
  );
}
