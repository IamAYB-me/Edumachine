import React from 'react';
import { BookOpen, Award, UserCheck, Bell, Download, Calendar, DollarSign, ShieldCheck, Search, RotateCcw, BellRing } from 'lucide-react';
import { KPICard } from '@/components/ui/KPICard';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/utils';
import { useToastStore } from '@/store/useToastStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useDataStore } from '@/store/useDataStore';
import { getPortalLevelLabels, resolveSchoolProfile } from '@/utils/schoolProfile';

export default function StudentDashboard() {
  const isFinanciallyCleared = false; // This would come from real data logic
  const navigate = useNavigate();
  const showToast = useToastStore((state) => state.showToast);
  const user = useAuthStore((state) => state.user);
  const schools = useDataStore((state) => state.schools);
  const schoolProfile = resolveSchoolProfile(user, schools);
  const labels = getPortalLevelLabels(schoolProfile.portalLevel);

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
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name || 'Student'} 👋</h1>
          <p className="text-slate-500 text-sm mt-1">Here's what's happening in your academic journey.</p>
        </div>
        
        {/* Financial Clearance Notice */}
        <div className={cn(
          "flex items-center gap-3 px-4 py-2 rounded-xl border animate-pulse shadow-sm",
          isFinanciallyCleared 
            ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400"
            : "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400"
        )}>
          {isFinanciallyCleared ? <ShieldCheck className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider">Financial Status</p>
            <p className="text-sm font-bold">{isFinanciallyCleared ? 'Cleared for Exams' : 'Outstanding Balance - Clearance Required'}</p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm col-span-1 lg:col-span-1">
          <p className="text-sm font-medium text-slate-500 mb-1">{labels.stageLabel}</p>
          <h3 className="text-xl font-bold text-blue-600 mb-1">{labels.stageValue}</h3>
          <p className="text-xs text-slate-500">{labels.programmeValue}</p>
        </div>
        <KPICard 
          title={labels.scoreMetricLabel} 
          value={labels.scoreMetricValue} 
          icon={Award} 
          iconBgClass="bg-purple-50"
          iconColorClass="text-purple-600"
          trend={{ value: 0, label: labels.scoreMetricTrend }}
        />
        <KPICard 
          title="Attendance" 
          value="92%" 
          icon={UserCheck} 
          iconBgClass="bg-emerald-50"
          iconColorClass="text-emerald-600"
          trend={{ value: 0, label: "This Month" }}
        />
        <KPICard 
          title="Pending Fees" 
          value={120.00} 
          isCurrency={true}
          icon={Bell} 
          iconBgClass="bg-rose-50"
          iconColorClass="text-rose-600"
          trend={{ value: 0, label: "Due on 30 May" }}
        />
        <KPICard 
          title="Unread Notices" 
          value="3" 
          icon={Bell} 
          iconBgClass="bg-amber-50"
          iconColorClass="text-amber-600"
          trend={{ value: 0, label: "New updates" }}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Courses */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-900">{labels.studyLabel}</h3>
          </div>
          <div className="space-y-4">
            {labels.courseList.map((course, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-blue-100 hover:bg-blue-50/50 transition-colors">
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
            ))}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Today's Schedule</h3>
          </div>
          <div className="space-y-4">
            {[
              ...labels.scheduleList,
            ].map((schedule, i) => (
              <div key={i} className="flex items-start gap-4">
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
            ))}
          </div>
          <Link
            to="/student/exams"
            state={{ tab: 'timetable' }}
            className="block w-full mt-4 text-sm text-blue-600 font-medium py-2 hover:bg-blue-50 rounded-lg transition-colors text-center"
          >
            View Full Timetable
          </Link>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Links */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Links</h3>
            <div className="grid grid-cols-4 gap-2">
              {[
                { name: 'Course Material', icon: BookOpen, bg: 'bg-indigo-50', color: 'text-indigo-600', path: '/student/courses' },
                { name: 'Pay Fees', icon: DollarSign, bg: 'bg-emerald-50', color: 'text-emerald-600', path: '/student/fees' },
                { name: 'Library', icon: BookOpen, bg: 'bg-purple-50', color: 'text-purple-600', path: '/librarian' },
                { name: labels.hallPassLabel, icon: Download, bg: 'bg-amber-50', color: 'text-amber-600', action: 'hallpass' as const },
              ].map((link, i) => (
                link.path ? (
                  <Link key={i} to={link.path} className="flex flex-col items-center text-center gap-2 group">
                    <div className={cn("p-3 rounded-xl transition-transform group-hover:-translate-y-1", link.bg, link.color)}>
                      <link.icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-medium text-slate-600 leading-tight">{link.name}</span>
                  </Link>
                ) : (
                  <button key={i} onClick={() => { showToast({ title: 'Hall Pass', description: 'Hall pass download is being prepared...', variant: 'info' }); }} className="flex flex-col items-center text-center gap-2 group">
                    <div className={cn("p-3 rounded-xl transition-transform group-hover:-translate-y-1", link.bg, link.color)}>
                      <link.icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-medium text-slate-600 leading-tight">{link.name}</span>
                  </button>
                )
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'Issue Book', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50', action: 'issue' as const },
                { name: 'Return Book', icon: RotateCcw, color: 'text-emerald-600', bg: 'bg-emerald-50', action: 'return' as const },
                { name: 'Search Catalog', icon: Search, color: 'text-purple-600', bg: 'bg-purple-50', action: 'catalog' as const },
                { name: 'Send Reminders', icon: BellRing, color: 'text-rose-600', bg: 'bg-rose-50', action: 'reminder' as const },
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleQuickAction(item.action)}
                  className="rounded-2xl border border-slate-200 p-5 text-center transition-all hover:border-blue-200 hover:bg-slate-50"
                >
                  <div className={cn('mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl', item.bg, item.color)}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-slate-800">{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Announcements */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Announcements</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg h-fit"><Bell className="w-4 h-4" /></div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Internal Hackathon 2025</p>
                  <p className="text-xs text-slate-500 mt-0.5">May 20, 2025</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg h-fit"><Calendar className="w-4 h-4" /></div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Mid-Term Exam Schedule</p>
                  <p className="text-xs text-slate-500 mt-0.5">May 18, 2025</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg h-fit"><BookOpen className="w-4 h-4" /></div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Workshop on AI/ML</p>
                  <p className="text-xs text-slate-500 mt-0.5">May 15, 2025</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">{labels.assessmentLabel} Countdown</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">{labels.courseList[0]?.name} {schoolProfile.portalLevel === 'Primary' ? 'Mid-Term Test' : 'Mid-Term'}</h3>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">5</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Days Left</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-900">{labels.resultsLabel}</h3>
            <button onClick={() => navigate('/student/exams')} className="text-sm text-blue-600 font-medium hover:text-blue-700">View All</button>
          </div>
          <div className="space-y-3">
             <div className="flex justify-between items-center pb-3 border-b border-slate-100">
               <div>
                 <p className="text-sm font-medium text-slate-900">Database Systems Quiz</p>
                 <p className="text-xs text-slate-500 mt-0.5">May 18, 2025</p>
               </div>
               <div className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">18/20</div>
             </div>
             <div className="flex justify-between items-center">
               <div>
                 <p className="text-sm font-medium text-slate-900">Operating Systems Assignment</p>
                 <p className="text-xs text-slate-500 mt-0.5">May 16, 2025</p>
               </div>
               <div className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">16/20</div>
             </div>
          </div>
        </div>
      </div>

    </div>
  );
}
