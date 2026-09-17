import React, { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Award, UserCheck, Bell, Download, Calendar, DollarSign, ShieldCheck, Search, RotateCcw, BellRing, FileText, Camera, GraduationCap, Mail, IdCard, Lock, Pencil, X } from 'lucide-react';
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

  const handleQuickAction = (action: 'issue' | 'return' | 'catalog' | 'reminder') => {
    if (action === 'issue') {
      navigate('/librarian/issue');
      showToast({
        title: 'Library issue desk opened',
        description: 'You can now proceed to request a book issue.',
        variant: 'info',
      });
      return;
    }

    if (action === 'return') {
      navigate('/librarian/issue');
      showToast({
        title: 'Book return opened',
        description: 'Use the library desk to process your return request.',
        variant: 'info',
      });
      return;
    }

    if (action === 'catalog') {
      navigate('/librarian/books');
      showToast({
        title: 'Catalog opened',
        description: 'Search the library catalog for available books and materials.',
        variant: 'success',
      });
      return;
    }

    navigate('/student/attendance');
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
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex justify-between items-end"
        >
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back, {user?.name || 'Student'} 👋</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Here's what's happening in your academic journey.</p>
          </div>
          
          {/* Financial Clearance Notice */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
            className={cn(
              "flex items-center gap-3 px-4 py-2 rounded-xl border animate-pulse shadow-sm",
              isFinanciallyCleared 
                ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400"
                : "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400"
            )}
          >
            {isFinanciallyCleared ? <ShieldCheck className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider">Financial Status</p>
              <p className="text-sm font-bold">{isFinanciallyCleared ? 'Cleared for Exams' : 'Outstanding Balance - Clearance Required'}</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Start Course Registration CTA */}
        {courseRegStructure && courseRegEnabled && courseRegLocked && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.15 }}
            className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:border-blue-800 dark:from-blue-950/30 dark:to-indigo-950/20 p-5 shadow-sm"
          >
            <div className="shrink-0 w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-blue-700 dark:text-blue-300" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                Course Registration Locked — Fees Required
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                Pay at least {format(courseRegStructure.minPayable)} (the required {courseRegStructure.requiredPercentage}% of {courseRegStructure.category}) to unlock course registration and begin lectures.
              </p>
            </div>
            <button
              onClick={() => navigate(`/student/fees?pay=${encodeURIComponent(courseRegStructure.category)}`)}
              className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all active:scale-95"
            >
              <DollarSign className="w-4 h-4" />
              Pay Now
            </button>
          </motion.div>
        )}

        {/* Courses Open CTA */}
        {courseRegStructure && courseRegEnabled && !courseRegLocked && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.15 }}
            className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 dark:border-emerald-800 dark:from-emerald-950/30 dark:to-teal-950/20 p-5 shadow-sm"
          >
            <div className="shrink-0 w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-emerald-700 dark:text-emerald-300" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                Course Registration Is Open
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                You have met the fee requirement for {stageValue}. Select your {labels.subjectPlural.toLowerCase()} now to complete your registration.
              </p>
            </div>
            <button
              onClick={() => navigate('/student/courses')}
              className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
            >
              <GraduationCap className="w-5 h-5" />
              Start Registration
            </button>
          </motion.div>
        )}

        {/* Courses Closed CTA */}
        {courseRegStructure && !courseRegEnabled && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.15 }}
            className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 dark:border-amber-800 dark:from-amber-950/30 dark:to-orange-950/20 p-5 shadow-sm"
          >
            <div className="shrink-0 w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
              <Lock className="w-6 h-6 text-amber-700 dark:text-amber-300" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                Course Registration Closed
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                The school has temporarily closed course registration. Your registered courses remain available until it reopens.
              </p>
            </div>
          </motion.div>
        )}

        {/* KPIs */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StaggerItem>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm col-span-1 lg:col-span-1">
              <p className="text-sm font-medium text-slate-500 mb-1">{labels.stageLabel}</p>
              <h3 className="text-xl font-bold text-blue-600 mb-1">{stageValue}</h3>
              {programmeText && <p className="text-xs text-slate-500">{programmeText}</p>}
            </div>
          </StaggerItem>
          <StaggerItem>
            <KPICard 
              title={labels.scoreMetricLabel} 
              value={resultLocked ? 'Locked' : (avgScore === null ? '—' : `${avgScore}%`)} 
              icon={Award} 
              iconBgClass="bg-purple-50"
              iconColorClass="text-purple-600"
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
              iconBgClass="bg-emerald-50"
              iconColorClass="text-emerald-600"
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
              iconBgClass="bg-rose-50"
              iconColorClass="text-rose-600"
              to="/student/fees"
              delay={0.24}
            />
          </StaggerItem>
          <StaggerItem>
            <KPICard 
              title="Unread Notices" 
              value={unreadNotifs} 
              icon={Bell} 
              iconBgClass="bg-amber-50"
              iconColorClass="text-amber-600"
              delay={0.32}
            />
          </StaggerItem>
        </StaggerContainer>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* My Courses */}
          <AnimatedCard delay={0.1} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-900">{labels.studyLabel}{currentSemester ? ` · ${currentSemester}` : ''}</h3>
              {myCourses.length > 0 && (
                <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold">{myCourses.length} registered</span>
              )}
            </div>
            <StaggerContainer className="space-y-4">
              {myCourses.length > 0 ? myCoursesPagination.slice.map((course) => (
                <StaggerItem key={course.id}>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-blue-100 hover:bg-blue-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 truncate max-w-[150px]" title={course.name}>{course.name}</p>
                        <p className="text-xs text-slate-500">{course.code}</p>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                      ✓
                    </div>
                  </div>
                </StaggerItem>
              )) : (
                <div className="text-center py-8">
                  <p className="text-sm font-medium text-slate-500">No registered {labels.subjectPlural.toLowerCase()} for {currentSemester || 'this session'} yet.</p>
                  {courseRegEnabled && (
                    <Link to="/student/courses" className="inline-block mt-2 text-xs font-bold text-blue-600 hover:underline">Register {labels.subjectPlural.toLowerCase()}</Link>
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
                className="mt-4"
              />
            )}
          </AnimatedCard>

          {/* Today's Schedule */}
          <AnimatedCard delay={0.18} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Today's Schedule</h3>
            </div>
            <StaggerContainer className="space-y-4">
              {[
                ...labels.scheduleList,
              ].map((schedule, i) => (
                <StaggerItem key={i}>
                  <div className="flex items-start gap-4">
                    <div className="text-xs font-semibold text-blue-600 w-16 pt-1 shrink-0">{schedule.time}</div>
                    <div className="flex-1 bg-slate-50 p-3 rounded-lg border border-slate-100 relative overflow-hidden group hover:shadow-sm transition-all cursor-pointer">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-sm text-slate-900">{schedule.course}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span>{schedule.room}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
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
              className="w-full mt-4"
            >
              <Link
                to="/student/exams"
                state={{ tab: 'timetable' }}
                className="block w-full text-sm text-blue-600 font-medium py-2 hover:bg-blue-50 rounded-lg transition-colors text-center"
              >
                View Full Timetable
              </Link>
            </motion.div>
          </AnimatedCard>

          {/* Right Column */}
          <div className="space-y-6">
            {/* My Profile / Passport */}
            <AnimatedCard delay={0.26} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-900">My Profile</h3>
                <button
                  onClick={openEdit}
                  disabled={!canSelfUpdate}
                  title={canSelfUpdate ? 'Update your contact and next of kin details' : 'You can update your details again next month'}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  {canSelfUpdate ? 'Edit Profile' : 'Updated'}
                </button>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative group shrink-0">
                  <img
                    src={passportUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Student')}&size=256&background=2563eb&color=fff&bold=true`}
                    alt={user?.name || 'Student'}
                    className="w-24 h-24 rounded-xl border-4 border-slate-100 object-cover shadow-sm transition-transform duration-500 group-hover:scale-105"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm disabled:cursor-not-allowed"
                    title="Upload passport photo"
                  >
                    {isUploadingPhoto ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Camera className="w-6 h-6" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-base font-bold text-slate-900 truncate">{user?.name || 'Student'}</p>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{user?.schoolName ? resolveSchoolProfile(user, schools).portalLevel : 'Student'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{user?.email}</span>
                  </div>
                  {myStudent?.regNo && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <IdCard className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{myStudent.regNo || myStudent.matricNumber}</span>
                    </div>
                  )}
                  <p className="text-[10px] text-slate-400 mt-2">Hover the photo to upload your passport.</p>
                </div>
              </div>
            </AnimatedCard>

            {/* Quick Links */}
            <AnimatedCard delay={0.26} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Links</h3>
              <StaggerContainer className="grid grid-cols-4 gap-2">
                {[
                  { name: 'Course Material', icon: BookOpen, bg: 'bg-indigo-50', color: 'text-indigo-600', path: '/student/courses' },
                  { name: 'Pay Fees', icon: DollarSign, bg: 'bg-emerald-50', color: 'text-emerald-600', path: '/student/fees' },
                  { name: 'Admission Letter', icon: FileText, bg: 'bg-blue-50', color: 'text-blue-600', path: '/student/admission-letter' },
                  { name: 'Library', icon: BookOpen, bg: 'bg-purple-50', color: 'text-purple-600', path: '/librarian' },
                  { name: labels.hallPassLabel, icon: Download, bg: 'bg-amber-50', color: 'text-amber-600', action: 'hallpass' as const },
                ].map((link, i) => (
                  <StaggerItem key={i}>
                    {link.path ? (
                      <Link to={link.path} className="flex flex-col items-center text-center gap-2 group">
                        <div className={cn("p-3 rounded-xl transition-transform group-hover:-translate-y-1", link.bg, link.color)}>
                          <link.icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-medium text-slate-600 leading-tight">{link.name}</span>
                      </Link>
                    ) : (
                      <button onClick={() => { showToast({ title: 'Hall Pass', description: 'Hall pass download is being prepared...', variant: 'info' }); }} className="flex flex-col items-center text-center gap-2 group">
                        <div className={cn("p-3 rounded-xl transition-transform group-hover:-translate-y-1", link.bg, link.color)}>
                          <link.icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-medium text-slate-600 leading-tight">{link.name}</span>
                      </button>
                    )}
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </AnimatedCard>

            <AnimatedCard delay={0.34} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
              <StaggerContainer className="grid grid-cols-2 gap-3">
                {[
                  { name: 'Issue Book', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50', action: 'issue' as const },
                  { name: 'Return Book', icon: RotateCcw, color: 'text-emerald-600', bg: 'bg-emerald-50', action: 'return' as const },
                  { name: 'Search Catalog', icon: Search, color: 'text-purple-600', bg: 'bg-purple-50', action: 'catalog' as const },
                  { name: 'Send Reminders', icon: BellRing, color: 'text-rose-600', bg: 'bg-rose-50', action: 'reminder' as const },
                ].map((item) => (
                  <StaggerItem key={item.name}>
                    <AnimatedButton
                      onClick={() => handleQuickAction(item.action)}
                      className="rounded-2xl border border-slate-200 p-5 text-center transition-all hover:border-blue-200 hover:bg-slate-50 w-full"
                    >
                      <div className={cn('mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl', item.bg, item.color)}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-medium text-slate-800">{item.name}</span>
                    </AnimatedButton>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </AnimatedCard>

            {/* Announcements */}
            <AnimatedCard delay={0.42} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Announcements</h3>
              <div className="space-y-4">
                <p className="text-sm text-slate-400 text-center py-4">No recent announcements</p>
              </div>
            </AnimatedCard>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatedCard delay={0.5} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">{labels.assessmentLabel} Countdown</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">No upcoming exams</h3>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">0</div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Days Left</div>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={0.58} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-900">{labels.resultsLabel}</h3>
            {!resultLocked && (
              <AnimatedButton
                onClick={() => navigate('/student/exams')}
                className="text-sm text-blue-600 font-medium hover:text-blue-700"
              >
                View All
              </AnimatedButton>
            )}
          </div>
          <div className="space-y-3">
            {resultLocked ? (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <Lock className="w-8 h-8 text-amber-500 mb-2" />
                <p className="text-sm text-slate-500">{labels.resultsLabel} locked. Complete the required fee payments to view your {labels.resultsLabel.toLowerCase()}.</p>
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">No results yet</p>
            )}
          </div>
        </AnimatedCard>
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