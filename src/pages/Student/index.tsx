import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Award, UserCheck, Bell, Download, Calendar, DollarSign, ShieldCheck, Search, RotateCcw, BellRing } from 'lucide-react';
import { KPICard } from '@/components/ui/KPICard';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { AnimatedPage, StaggerContainer, StaggerItem, AnimatedButton } from '@/components/ui/motion';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/utils';
import { useToastStore } from '@/store/useToastStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useDataStore } from '@/store/useDataStore';
import { getPortalLevelLabels, resolveSchoolProfile } from '@/utils/schoolProfile';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const showToast = useToastStore((state) => state.showToast);
  const user = useAuthStore((state) => state.user);
  const schools = useDataStore((state) => state.schools);
  const feeRecords = useDataStore((state) => state.feeRecords);
  const attendance = useDataStore((state) => state.attendance);
  const notifications = useDataStore((state) => state.notifications);
  const schoolProfile = resolveSchoolProfile(user, schools);
  const labels = getPortalLevelLabels(schoolProfile.portalLevel);

  const todayStr = new Date().toISOString().split('T')[0];
  const myAttendance = attendance.filter(a => a.targetId === user?.id);
  const presentDays = myAttendance.filter(a => a.status === 'Present').length;
  const totalDays = myAttendance.length || 1;
  const attendanceRate = Math.round((presentDays / totalDays) * 100);

  const myFees = feeRecords.filter(f => f.studentId === user?.id);
  const pendingFees = myFees.filter(f => f.status === 'Pending' || f.status === 'Partial').reduce((sum, f) => sum + f.amount, 0);
  const isFinanciallyCleared = pendingFees === 0;
  const unreadNotifs = notifications.filter(n => !n.read).length;

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
            <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name || 'Student'} 👋</h1>
            <p className="text-slate-500 text-sm mt-1">Here's what's happening in your academic journey.</p>
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

        {/* KPIs */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StaggerItem>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm col-span-1 lg:col-span-1">
              <p className="text-sm font-medium text-slate-500 mb-1">{labels.stageLabel}</p>
              <h3 className="text-xl font-bold text-blue-600 mb-1">{labels.stageValue}</h3>
              <p className="text-xs text-slate-500">{labels.programmeValue}</p>
            </div>
          </StaggerItem>
          <StaggerItem>
            <KPICard 
              title={labels.scoreMetricLabel} 
              value={labels.scoreMetricValue} 
              icon={Award} 
              iconBgClass="bg-purple-50"
              iconColorClass="text-purple-600"
              trend={{ value: 0, label: labels.scoreMetricTrend }}
              to="/student/exams"
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
              value={pendingFees} 
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
              <h3 className="text-lg font-semibold text-slate-900">{labels.studyLabel}</h3>
            </div>
            <StaggerContainer className="space-y-4">
              {labels.courseList.map((course, i) => (
                <StaggerItem key={i}>
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
                      {course.grade}
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
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
            {/* Quick Links */}
            <AnimatedCard delay={0.26} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Links</h3>
              <StaggerContainer className="grid grid-cols-4 gap-2">
                {[
                  { name: 'Course Material', icon: BookOpen, bg: 'bg-indigo-50', color: 'text-indigo-600', path: '/student/courses' },
                  { name: 'Pay Fees', icon: DollarSign, bg: 'bg-emerald-50', color: 'text-emerald-600', path: '/student/fees' },
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
            <AnimatedButton
              onClick={() => navigate('/student/exams')}
              className="text-sm text-blue-600 font-medium hover:text-blue-700"
            >
              View All
            </AnimatedButton>
          </div>
          <div className="space-y-3">
             <p className="text-sm text-slate-400 text-center py-4">No results yet</p>
          </div>
        </AnimatedCard>
      </div>

    </div>
    </AnimatedPage>
  );
}
