import React, { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Award, UserCheck, Bell, Download, DollarSign, ShieldCheck, FileText, Camera, GraduationCap, Mail, IdCard, Lock, Pencil, X } from 'lucide-react';
import { KPICard } from '@/components/ui/KPICard';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { AnimatedPage, StaggerContainer, StaggerItem, AnimatedButton } from '@/components/ui/motion';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/utils';
import { useToastStore } from '@/store/useToastStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useDataStore } from '@/store/useDataStore';
import { getPortalLevelLabels, resolveSchoolProfile } from '@/utils/schoolProfile';
import { friendlyErrorMessage } from '@/utils/errors';
import { uploadImage } from '@/services/storageService';
import { deriveStudentFees, checkFeeGate } from '@/utils/feeGating';
import { useCurrency } from '@/hooks/useCurrency';
import Pagination from '@/components/ui/Pagination';
import { usePagination } from '@/hooks/usePagination';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { format } = useCurrency();
  const showToast = useToastStore((state) => state.showToast);
  const user = useAuthStore((state) => state.user);
  const schools = useDataStore((state) => state.schools);
  const feeRecords = useDataStore((state) => state.feeRecords);
  const attendance = useDataStore((state) => state.attendance);
  const notifications = useDataStore((state) => state.notifications);
  const examResults = useDataStore((state) => state.examResults);
  const courseRegistrations = useDataStore((state) => state.courseRegistrations);
  const subjects = useDataStore((state) => state.subjects);
  const schoolProfile = resolveSchoolProfile(user, schools);
  const labels = getPortalLevelLabels(schoolProfile.portalLevel);

  const todayStr = new Date().toISOString().split('T')[0];
  const myAttendance = attendance.filter(a => a.targetId === user?.id);
  const presentDays = myAttendance.filter(a => a.status === 'Present').length;
  const totalDays = myAttendance.length || 1;
  const attendanceRate = Math.round((presentDays / totalDays) * 100);

  const myResults = examResults.filter(r => r.studentId === user?.id);
  const avgScore =
    myResults.length > 0
      ? Math.round((myResults.reduce((sum, r) => sum + (r.totalMarks > 0 ? r.score / r.totalMarks * 100 : 0), 0) / myResults.length))
      : null;

  const feeStructures = useDataStore((state) => state.feeStructures);
  const students = useDataStore((state) => state.students);
  const academicSessions = useDataStore((state) => state.academicSessions);
  const updateStudent = useDataStore((state) => state.updateStudent);
  const myStudent = students.find((s) => s.id === user?.id);
  const passportUrl = myStudent?.passportUrl || user?.avatarUrl;
  const activeSession = academicSessions.find((s) => s.active) || academicSessions[academicSessions.length - 1];
  const stageValue = activeSession ? `${activeSession.name}${activeSession.semester ? ` • ${activeSession.semester}` : ''}` : labels.stageValue;

  const currentSemester = activeSession?.semester || null;
  const myCourses = useMemo(() => {
    const list: { id: string; name: string; code: string; type?: string }[] = [];
    const seen = new Set<string>();
    courseRegistrations
      .filter((r) => r.studentId === user?.id)
      .filter((r) => (currentSemester ? r.session === currentSemester : true))
      .forEach((r) => {
        r.courses.forEach((c) => {
          if (seen.has(c.subjectId)) return;
          seen.add(c.subjectId);
          const sub = subjects.find((s) => s.id === c.subjectId);
          list.push({ id: c.subjectId, name: sub?.name || c.name, code: sub?.code || c.code, type: sub?.type || c.type });
        });
      });
    return list;
  }, [courseRegistrations, subjects, user?.id, currentSemester]);

  const myCoursesPagination = usePagination(myCourses, 5);

  const myFeeRecords = feeRecords.filter(f => f.studentId === user?.id);
  const derivedFees = deriveStudentFees(feeStructures, myFeeRecords, myStudent?.class);
  const courseRegStructure = derivedFees.find((f) => f.gatedAction === 'course_registration');
  const courseRegGate = checkFeeGate(feeStructures, myFeeRecords, myStudent?.class, 'course_registration');
  const courseRegLocked = !!courseRegGate && !courseRegGate.isAllowed;
  const programmeText = myStudent?.programme || myStudent?.classDepartment || myStudent?.class || '';
  const courseRegEnabled = useSettingsStore((s) => s.globalSettings.courseRegistrationEnabled) !== false;
  const resultGate = checkFeeGate(feeStructures, myFeeRecords, myStudent?.class, 'result_access');
  const resultLocked = !!resultGate && !resultGate.isAllowed;
  const pendingFeeTotal = derivedFees
    .filter(f => f.status === 'Pending' || f.status === 'Partial')
    .reduce((sum, f) => sum + f.remaining, 0);
  const isFinanciallyCleared = pendingFeeTotal === 0;
  const unreadNotifs = notifications.filter(n => n.userId === user?.id && !n.read).length;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      showToast({ title: 'Invalid file', description: 'Please choose an image file.', variant: 'error' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast({ title: 'File too large', description: 'Passport photo must be under 5MB.', variant: 'error' });
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `students/${user.id}/passport-${Date.now()}.${ext}`;
      const url = await uploadImage(path, file);
      const res = updateStudent(user.id, { passportUrl: url });
      if (res.success) {
        showToast({ title: 'Passport updated', description: 'Your passport photo has been saved to your student profile.', variant: 'success' });
      } else {
        showToast({ title: 'Save failed', description: res.error || 'Could not save your passport photo.', variant: 'error' });
      }
    } catch (err) {
      showToast({ title: 'Upload failed', description: friendlyErrorMessage(err, 'Could not upload your passport photo.'), variant: 'error' });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const [editOpen, setEditOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [form, setForm] = useState({ phone: '', residentialAddress: '', townCity: '', state: '', lga: '', guardianName: '', guardianRelationship: '', guardianPhone: '', guardianAddress: '' });

  const openEdit = () => {
    setForm({
      phone: myStudent?.phone || '',
      residentialAddress: myStudent?.residentialAddress || '',
      townCity: myStudent?.townCity || '',
      state: myStudent?.state || '',
      lga: myStudent?.lga || '',
      guardianName: myStudent?.guardianName || '',
      guardianRelationship: myStudent?.guardianRelationship || '',
      guardianPhone: myStudent?.guardianPhone || '',
      guardianAddress: myStudent?.guardianAddress || '',
    });
    setEditOpen(true);
  };

  const lastSelfUpdate = myStudent?.profileSelfUpdateAt;
  const nowMonthKey = todayStr.slice(0, 7);
  const canSelfUpdate = !lastSelfUpdate || lastSelfUpdate.slice(0, 7) !== nowMonthKey;

  const handleSaveProfile = async () => {
    if (!user || !myStudent) return;
    if (savingProfile) return;
    setSavingProfile(true);
    try {
      const res = updateStudent(user.id, {
        ...form,
        profileSelfUpdateAt: new Date().toISOString(),
      });
      if (res.success) {
        setEditOpen(false);
        showToast({ title: 'Profile updated', description: 'Your contact and next of kin details have been saved.', variant: 'success' });
      } else {
        showToast({ title: 'Save failed', description: res.error || 'Could not save your profile.', variant: 'error' });
      }
    } catch (err) {
      showToast({ title: 'Save failed', description: friendlyErrorMessage(err, 'Could not save your profile.'), variant: 'error' });
    } finally {
      setSavingProfile(false);
    }
  };

  const fieldCls = "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
  const labelCls = "block text-xs font-semibold text-slate-600 mb-1";

return (
    <AnimatedPage>
      <div className="space-y-4 sm:space-y-6">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white p-4 sm:p-6 shadow-lg shadow-indigo-900/20"
        >
          <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-6 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

          <div className="relative flex items-center gap-3 sm:gap-4">
            <div className="relative shrink-0">
              <img
                src={passportUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Student')}&size=256&background=2563eb&color=fff&bold=true`}
                alt={user?.name || 'Student'}
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl border-2 border-white/50 object-cover shadow-md"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
                title="Upload passport photo"
                className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-blue-600 shadow-md transition-transform hover:scale-110 disabled:opacity-60"
              >
                {isUploadingPhoto ? (
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
                ) : (
                  <Camera className="h-3 w-3" />
                )}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70 sm:text-[11px]">Welcome back</p>
              <h1 className="mt-0.5 truncate text-lg font-bold leading-tight sm:text-2xl">{user?.name || 'Student'}</h1>
              <p className="mt-0.5 truncate text-xs text-white/85 sm:text-sm">{(programmeText || stageValue || 'Student Portal').trim()}</p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {stageValue && programmeText && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold sm:text-[11px]">
                    <GraduationCap className="h-3 w-3" />
                    {stageValue}
                  </span>
                )}
                {myStudent?.regNo && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold sm:text-[11px]">
                    <IdCard className="h-3 w-3" />
                    {myStudent.regNo || myStudent.matricNumber}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div
            className={cn(
              "relative mt-3.5 flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold sm:text-sm",
              isFinanciallyCleared
                ? "border-emerald-300/40 bg-emerald-400/20 text-emerald-50"
                : "border-rose-300/40 bg-rose-400/20 text-rose-50"
            )}
          >
            {isFinanciallyCleared ? <ShieldCheck className="h-4 w-4 shrink-0" /> : <Bell className="h-4 w-4 shrink-0" />}
            <span className="truncate">
              {isFinanciallyCleared
                ? 'Financial clearance — Cleared for exams'
                : `Outstanding balance — ${format(pendingFeeTotal)} remaining`}
            </span>
          </div>
        </motion.div>

        {/* ── Course registration CTAs ─────────────────────────────────────── */}
        {courseRegStructure && courseRegEnabled && courseRegLocked && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
            className="flex flex-col gap-3 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-3.5 shadow-sm sm:flex-row sm:items-center sm:gap-4 sm:p-5 dark:border-blue-800 dark:from-blue-950/30 dark:to-indigo-950/20"
          >
            <div className="flex items-center gap-3 sm:items-start">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 sm:h-12 sm:w-12 dark:bg-blue-900/40">
                <GraduationCap className="h-5 w-5 text-blue-700 sm:h-6 sm:w-6 dark:text-blue-300" />
              </div>
              <div className="flex-1 sm:hidden">
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-900 dark:text-white">Course Registration Locked</h3>
                <p className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-300">
                  Pay at least {format(courseRegStructure.minPayable)} ({courseRegStructure.requiredPercentage}% of {courseRegStructure.category}) to unlock registration.
                </p>
              </div>
            </div>
            <div className="hidden sm:block sm:flex-1">
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white">Course Registration Locked — Fees Required</h3>
              <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">
                Pay at least {format(courseRegStructure.minPayable)} (the required {courseRegStructure.requiredPercentage}% of {courseRegStructure.category}) to unlock course registration and begin lectures.
              </p>
            </div>
            <button
              onClick={() => navigate(`/student/fees?pay=${encodeURIComponent(courseRegStructure.category)}`)}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-900/20 transition-all hover:bg-blue-700 active:scale-95 sm:text-sm"
            >
              <DollarSign className="h-4 w-4" />
              Pay Now
            </button>
          </motion.div>
        )}

        {courseRegStructure && courseRegEnabled && !courseRegLocked && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
            className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-3.5 shadow-sm sm:flex-row sm:items-center sm:gap-4 sm:p-5 dark:border-emerald-800 dark:from-emerald-950/30 dark:to-teal-950/20"
          >
            <div className="flex items-center gap-3 sm:items-start">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 sm:h-12 sm:w-12 dark:bg-emerald-900/40">
                <GraduationCap className="h-5 w-5 text-emerald-700 sm:h-6 sm:w-6 dark:text-emerald-300" />
              </div>
              <div className="flex-1 sm:hidden">
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-900 dark:text-white">Course Registration Is Open</h3>
                <p className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-300">
                  You have met the fee requirement for {stageValue}. Choose your {labels.subjectPlural.toLowerCase()} now.
                </p>
              </div>
            </div>
            <div className="hidden sm:block sm:flex-1">
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white">Course Registration Is Open</h3>
              <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">
                You have met the fee requirement for {stageValue}. Select your {labels.subjectPlural.toLowerCase()} now to complete your registration.
              </p>
            </div>
            <button
              onClick={() => navigate('/student/courses')}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-900/20 transition-all hover:bg-emerald-700 active:scale-95 sm:text-sm"
            >
              <GraduationCap className="h-4 w-4" />
              Start Registration
            </button>
          </motion.div>
        )}

        {courseRegStructure && !courseRegEnabled && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
            className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-3.5 shadow-sm sm:p-4 dark:border-amber-800 dark:from-amber-950/30 dark:to-orange-950/20"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 sm:h-11 sm:w-11 dark:bg-amber-900/40">
              <Lock className="h-5 w-5 text-amber-700 sm:h-5.5 sm:w-5.5 dark:text-amber-300" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-900 sm:text-sm dark:text-white">Course Registration Closed</h3>
              <p className="mt-0.5 text-[11px] text-slate-600 sm:text-sm dark:text-slate-300">
                The school has temporarily closed registration. Your registered courses remain available.
              </p>
            </div>
          </motion.div>
        )}

        {/* ── Stat tiles ───────────────────────────────────────────────────── */}
        <StaggerContainer className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
          <StaggerItem className="col-span-2 lg:col-span-1">
            <div className="flex h-full flex-col justify-between rounded-xl border border-sky-200 bg-sky-50 p-3.5 shadow-sm sm:p-4 dark:border-sky-900 dark:bg-sky-950/40">
              <p className="text-[10px] font-bold uppercase tracking-wider text-sky-700 sm:text-xs dark:text-sky-300">{labels.stageLabel}</p>
              <div className="mt-2">
                <h3 className="text-sm font-bold leading-snug text-sky-900 sm:text-base dark:text-sky-100">{stageValue}</h3>
                {programmeText && <p className="mt-1 truncate text-[10px] text-sky-600 sm:text-xs dark:text-sky-400">{programmeText}</p>}
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <KPICard
              title={labels.scoreMetricLabel}
              value={resultLocked ? 'Locked' : (avgScore === null ? '—' : `${avgScore}%`)}
              icon={Award}
              toneClass="border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950/40"
              iconBgClass="bg-purple-100 dark:bg-purple-900/40"
              iconColorClass="text-purple-600 dark:text-purple-300"
              trend={{ value: 0, label: resultLocked ? 'Pay fees to unlock' : (avgScore === null ? 'No results yet' : labels.scoreMetricTrend) }}
              to={resultLocked ? undefined : "/student/exams"}
              delay={0.08}
            />
          </StaggerItem>
          <StaggerItem>
            <KPICard
              title="Attendance"
              value={`${attendanceRate}%`}
              icon={UserCheck}
              toneClass="border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40"
              iconBgClass="bg-emerald-100 dark:bg-emerald-900/40"
              iconColorClass="text-emerald-600 dark:text-emerald-300"
              trend={{ value: 0, label: "This Month" }}
              to="/student/attendance"
              delay={0.16}
            />
          </StaggerItem>
          <StaggerItem>
            <KPICard
              title="Pending Fees"
              value={pendingFeeTotal}
              isCurrency={true}
              icon={Bell}
              toneClass="border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/40"
              iconBgClass="bg-rose-100 dark:bg-rose-900/40"
              iconColorClass="text-rose-600 dark:text-rose-300"
              to="/student/fees"
              delay={0.24}
            />
          </StaggerItem>
          <StaggerItem>
            <KPICard
              title="Unread Notices"
              value={unreadNotifs}
              icon={Bell}
              toneClass="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40"
              iconBgClass="bg-amber-100 dark:bg-amber-900/40"
              iconColorClass="text-amber-600 dark:text-amber-300"
              delay={0.32}
            />
          </StaggerItem>
        </StaggerContainer>

        {/* ── Main grid ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
          {/* My Courses */}
          <AnimatedCard delay={0.1} className="rounded-xl border border-indigo-100 bg-gradient-to-b from-indigo-50/70 to-white shadow-sm dark:border-indigo-900/50 dark:from-indigo-950/30 dark:to-slate-900">
            <div className="flex items-center justify-between px-4 pt-4 sm:px-6 sm:pt-6">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/50">
                  <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {labels.studyLabel}{currentSemester ? ` · ${currentSemester}` : ''}
                </h3>
              </div>
              {myCourses.length > 0 && (
                <span className="rounded-lg bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 sm:text-xs dark:bg-indigo-900/50 dark:text-indigo-300">
                  {myCourses.length} registered
                </span>
              )}
            </div>

            <div className="px-4 py-4 sm:px-6 sm:py-5">
              <StaggerContainer className="space-y-2.5">
                {myCourses.length > 0 ? myCoursesPagination.slice.map((course) => (
                  <StaggerItem key={course.id}>
                    <div className="flex items-center justify-between rounded-lg border bg-white p-2.5 transition-colors hover:border-indigo-200 dark:border-slate-800 dark:bg-slate-900/70">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
                          <BookOpen className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-slate-900 sm:text-sm" title={course.name}>{course.name}</p>
                          <p className="text-[10px] text-slate-500 sm:text-xs">{course.code}</p>
                        </div>
                      </div>
                      <div className="ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">
                        ✓
                      </div>
                    </div>
                  </StaggerItem>
                )) : (
                  <div className="rounded-lg bg-white/70 px-4 py-6 text-center dark:bg-slate-900/70">
                    <p className="text-xs font-medium text-slate-500 sm:text-sm">No registered {labels.subjectPlural.toLowerCase()} for {currentSemester || 'this session'} yet.</p>
                    {courseRegEnabled && (
                      <Link to="/student/courses" className="mt-1.5 inline-block text-[11px] font-bold text-blue-600 hover:underline sm:text-xs">
                        Register {labels.subjectPlural.toLowerCase()}
                      </Link>
                    )}
                  </div>
                )}
              </StaggerContainer>
              {myCourses.length > 0 && (
                <Pagination
                  page={myCoursesPagination.page}
                  totalPages={myCoursesPagination.totalPages}
                  total={myCoursesPagination.total}
                  start={myCoursesPagination.start}
                  pageSize={myCoursesPagination.pageSize}
                  onPageChange={myCoursesPagination.setPage}
                  className="mt-3"
                />
              )}
            </div>
          </AnimatedCard>

          {/* Today's Schedule */}
          <AnimatedCard delay={0.18} className="rounded-xl border border-sky-100 bg-gradient-to-b from-sky-50/70 to-white shadow-sm dark:border-sky-900/50 dark:from-sky-950/30 dark:to-slate-900">
            <div className="flex items-center justify-between px-4 pt-4 sm:px-6 sm:pt-6">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-900/50">
                  <GraduationCap className="h-4 w-4 text-sky-600 dark:text-sky-300" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Today's Schedule</h3>
              </div>
            </div>

            <div className="px-4 py-4 sm:px-6 sm:py-5">
              <StaggerContainer className="space-y-2.5">
                {labels.scheduleList.map((schedule, i) => (
                  <StaggerItem key={i}>
                    <div className="flex items-start gap-2.5">
                      <div className="w-14 shrink-0 pt-1.5 text-[10px] font-semibold text-sky-600 sm:text-xs">{schedule.time}</div>
                      <div className="relative flex-1 overflow-hidden rounded-lg border bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900/70">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-500"></div>
                        <p className="text-xs font-medium text-slate-900 sm:text-sm">{schedule.course}</p>
                        <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-500 sm:text-xs">
                          <span>{schedule.room}</span>
                          <span className="h-0.5 w-0.5 rounded-full bg-slate-300"></span>
                          <span>{schedule.type}</span>
                        </div>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="mt-3 w-full"
              >
                <Link
                  to="/student/exams"
                  state={{ tab: 'timetable' }}
                  className="block w-full rounded-lg bg-sky-50 py-2 text-center text-[11px] font-semibold text-sky-700 transition-colors hover:bg-sky-100 sm:text-sm dark:bg-sky-900/40 dark:text-sky-300"
                >
                  View Full Timetable
                </Link>
              </motion.div>
            </div>
          </AnimatedCard>

          {/* Right column */}
          <div className="space-y-4 sm:space-y-6">
            {/* Quick Links */}
            <AnimatedCard delay={0.26} className="rounded-xl border border-purple-100 bg-gradient-to-b from-purple-50/70 to-white shadow-sm dark:border-purple-900/50 dark:from-purple-950/30 dark:to-slate-900">
              <div className="flex items-center gap-2 px-4 pt-4 sm:px-6 sm:pt-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/50">
                  <Download className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Quick Links</h3>
              </div>
              <div className="px-4 py-4 sm:px-6 sm:py-5">
                <StaggerContainer className="grid grid-cols-4 gap-1.5 sm:gap-2">
                  {[
                    { name: 'Course Material', icon: BookOpen, bg: 'bg-indigo-100 dark:bg-indigo-900/50', color: 'text-indigo-600 dark:text-indigo-300', path: '/student/courses' },
                    { name: 'Pay Fees', icon: DollarSign, bg: 'bg-emerald-100 dark:bg-emerald-900/50', color: 'text-emerald-600 dark:text-emerald-300', path: '/student/fees' },
                    { name: 'Admission Letter', icon: FileText, bg: 'bg-blue-100 dark:bg-blue-900/50', color: 'text-blue-600 dark:text-blue-300', path: '/student/admission-letter' },
                    { name: 'Library', icon: BookOpen, bg: 'bg-purple-100 dark:bg-purple-900/50', color: 'text-purple-600 dark:text-purple-300', path: '/librarian' },
                    { name: labels.hallPassLabel, icon: Download, bg: 'bg-amber-100 dark:bg-amber-900/50', color: 'text-amber-600 dark:text-amber-300', action: 'hallpass' as const },
                  ].map((link, i) => (
                    <StaggerItem key={i}>
                      {link.path ? (
                        <Link to={link.path} className="group flex flex-col items-center gap-1.5 text-center">
                          <div className={cn("rounded-xl p-2.5 transition-transform group-hover:-translate-y-1 sm:p-3", link.bg, link.color)}>
                            <link.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                          </div>
                          <span className="text-[9px] font-medium leading-tight text-slate-600 sm:text-[10px] dark:text-slate-300">{link.name}</span>
                        </Link>
                      ) : (
                        <button
                          onClick={() => { showToast({ title: 'Hall Pass', description: 'Hall pass download is being prepared...', variant: 'info' }); }}
                          className="group flex flex-col items-center gap-1.5 text-center"
                        >
                          <div className={cn("rounded-xl p-2.5 transition-transform group-hover:-translate-y-1 sm:p-3", link.bg, link.color)}>
                            <link.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                          </div>
                          <span className="text-[9px] font-medium leading-tight text-slate-600 sm:text-[10px] dark:text-slate-300">{link.name}</span>
                        </button>
                      )}
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </div>
            </AnimatedCard>

            {/* My Profile */}
            <AnimatedCard delay={0.34} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">My Profile</h3>
                <button
                  onClick={openEdit}
                  disabled={!canSelfUpdate}
                  title={canSelfUpdate ? 'Update your contact and next of kin details' : 'You can update your details again next month'}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-2.5 py-1.5 text-[10px] font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 sm:text-xs dark:disabled:bg-slate-800 dark:disabled:text-slate-500"
                >
                  <Pencil className="h-3 w-3" />
                  {canSelfUpdate ? 'Edit Profile' : 'Updated'}
                </button>
              </div>
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 sm:text-xs dark:text-slate-400">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{user?.email}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 sm:text-xs dark:text-slate-400">
                  <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{user?.schoolName ? resolveSchoolProfile(user, schools).portalLevel : 'Student'}</span>
                </div>
                {myStudent?.phone && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 sm:text-xs dark:text-slate-400">
                    <IdCard className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{myStudent.phone}</span>
                  </div>
                )}
              </div>
            </AnimatedCard>

            {/* Results */}
            <AnimatedCard delay={0.42} className={cn(
              "rounded-xl border shadow-sm p-4 sm:p-6",
              resultLocked
                ? "border-amber-200 bg-gradient-to-b from-amber-50/80 to-white dark:border-amber-900/50 dark:from-amber-950/30 dark:to-slate-900"
                : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", resultLocked ? "bg-amber-100 dark:bg-amber-900/50" : "bg-slate-100 dark:bg-slate-800")}>
                    <Award className={cn("h-4 w-4", resultLocked ? "text-amber-600 dark:text-amber-300" : "text-slate-500")} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{labels.resultsLabel}</h3>
                </div>
                {!resultLocked && (
                  <AnimatedButton
                    onClick={() => navigate('/student/exams')}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 sm:text-sm"
                  >
                    View All
                  </AnimatedButton>
                )}
              </div>
              <div className="mt-3">
                {resultLocked ? (
                  <div className="flex items-center gap-3 rounded-lg bg-white/70 px-3 py-2.5 dark:bg-slate-900/70">
                    <Lock className="h-4 w-4 shrink-0 text-amber-500" />
                    <p className="text-[11px] text-slate-500 sm:text-xs">
                      {labels.resultsLabel} locked. Complete the required fee payments to view your {labels.resultsLabel.toLowerCase()}.
                    </p>
                  </div>
                ) : (
                  <p className="py-1 text-center text-xs text-slate-400 sm:text-sm">No results yet</p>
                )}
              </div>
            </AnimatedCard>
          </div>
        </div>

        {editOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setEditOpen(false)}>
            <div
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Update My Profile</h3>
                <button onClick={() => setEditOpen(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Update your contact and next of kin details. You can edit these once per month.
              </p>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Phone Number</label>
                  <input className={fieldCls} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Your phone number" />
                </div>
                <div>
                  <label className={labelCls}>Residential Address</label>
                  <input className={fieldCls} value={form.residentialAddress} onChange={(e) => setForm({ ...form, residentialAddress: e.target.value })} placeholder="Home address" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Town / City</label>
                    <input className={fieldCls} value={form.townCity} onChange={(e) => setForm({ ...form, townCity: e.target.value })} placeholder="Town / city" />
                  </div>
                  <div>
                    <label className={labelCls}>State</label>
                    <input className={fieldCls} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="State" />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>LGA</label>
                  <input className={fieldCls} value={form.lga} onChange={(e) => setForm({ ...form, lga: e.target.value })} placeholder="Local Government Area" />
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Next of Kin / Guardian</p>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Full Name</label>
                        <input className={fieldCls} value={form.guardianName} onChange={(e) => setForm({ ...form, guardianName: e.target.value })} placeholder="Name" />
                      </div>
                      <div>
                        <label className={labelCls}>Relationship</label>
                        <input className={fieldCls} value={form.guardianRelationship} onChange={(e) => setForm({ ...form, guardianRelationship: e.target.value })} placeholder="e.g. Mother" />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Phone Number</label>
                      <input className={fieldCls} value={form.guardianPhone} onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })} placeholder="Guardian phone" />
                    </div>
                    <div>
                      <label className={labelCls}>Address</label>
                      <input className={fieldCls} value={form.guardianAddress} onChange={(e) => setForm({ ...form, guardianAddress: e.target.value })} placeholder="Guardian address" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-6 flex gap-3">
                <button
                  onClick={() => setEditOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all disabled:opacity-60"
                >
                  {savingProfile ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AnimatedPage>
  );
}