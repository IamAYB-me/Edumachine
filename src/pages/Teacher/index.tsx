import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, UserCheck, FileText, Clock, ChevronRight, GraduationCap, PenTool } from 'lucide-react';
import { KPICard } from '@/components/ui/KPICard';
import { cn } from '@/utils';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useDataStore } from '@/store/useDataStore';
import { useAuthStore } from '@/store/useAuthStore';
import { resolveSchoolProfile, getPortalLevelLabels } from '@/utils/schoolProfile';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { AnimatedPage, AnimatedButton, StaggerContainer, StaggerItem } from '@/components/ui/motion';

const performanceData: { name: string; score: number; average: number }[] = [];

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const classes = useDataStore((s) => s.classes);
  const students = useDataStore((s) => s.students);
  const attendance = useDataStore((s) => s.attendance);
  const exams = useDataStore((s) => s.exams);
  const schools = useDataStore((s) => s.schools);
  const user = useAuthStore((state) => state.user);
  const schoolProfile = resolveSchoolProfile(user, schools);
  const labels = getPortalLevelLabels(schoolProfile.portalLevel);

  const todayStr = new Date().toISOString().split('T')[0];
  const presentToday = attendance.filter(a => a.date === todayStr && a.status === 'Present').length;
  const totalToday = attendance.filter(a => a.date === todayStr).length;
  const attendanceRate = totalToday > 0 ? Math.round((presentToday / totalToday) * 100) : 0;
  const pendingGrades = exams.filter(e => e.status === 'Draft').length;

  return (
    <AnimatedPage className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex justify-between items-end"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{labels.teacherSingular} Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your {labels.structurePlural.toLowerCase()}, {labels.learnerPlural.toLowerCase()}, and academic records.</p>
        </div>
        <div className="flex gap-3">
          <AnimatedButton onClick={() => navigate('/teacher/exams?tab=scores')} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold transition-colors shadow-sm">
            <PenTool className="w-4 h-4" />
            Record Results
          </AnimatedButton>
          <AnimatedButton onClick={() => navigate('/teacher/departments')} className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
            View Schedule
          </AnimatedButton>
        </div>
      </motion.div>

      {/* KPIs */}
      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StaggerItem>
          <KPICard
            title={`Assigned ${labels.structurePlural}`}
            value={classes.length}
            icon={BookOpen}
            iconBgClass="bg-blue-50 dark:bg-blue-900/20"
            iconColorClass="text-blue-600 dark:text-blue-400"
            to="/teacher/departments"
            delay={0}
          />
        </StaggerItem>
        <StaggerItem>
          <KPICard
            title={`Total ${labels.learnerPlural}`}
            value={students.length}
            icon={Users}
            iconBgClass="bg-indigo-50 dark:bg-indigo-900/20"
            iconColorClass="text-indigo-600 dark:text-indigo-400"
            to="/teacher/attendance"
            delay={0.08}
          />
        </StaggerItem>
        <StaggerItem>
          <KPICard
            title="Avg. Attendance"
            value={`${attendanceRate}%`}
            icon={UserCheck}
            iconBgClass="bg-emerald-50 dark:bg-emerald-900/20"
            iconColorClass="text-emerald-600 dark:text-emerald-400"
            to="/teacher/attendance"
            delay={0.16}
          />
        </StaggerItem>
        <StaggerItem>
          <KPICard
            title="Pending Grades"
            value={pendingGrades}
            icon={FileText}
            iconBgClass="bg-amber-50 dark:bg-amber-900/20"
            iconColorClass="text-amber-600 dark:text-amber-400"
            to="/teacher/exams?tab=scores"
            delay={0.24}
          />
        </StaggerItem>
      </StaggerContainer>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <AnimatedCard delay={0.1} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Today's Schedule</h3>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">July 07, 2026</span>
          </div>
          <div className="space-y-4">
            {([] as { time: string; course: string; class: string; room: string; status: string }[]).map((schedule, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.08, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="flex items-center gap-4 p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors relative group"
              >
                <div className={cn(
                  "w-1 h-10 rounded-full",
                  schedule.status === 'Completed' ? "bg-emerald-500" :
                  schedule.status === 'Ongoing' ? "bg-blue-500 animate-pulse" : "bg-slate-300 dark:bg-slate-700"
                )} />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{schedule.time}</span>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter",
                      schedule.status === 'Completed' ? "bg-emerald-50 text-emerald-700" :
                      schedule.status === 'Ongoing' ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"
                    )}>{schedule.status}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{schedule.course}</h4>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" /> {schedule.class}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {schedule.room}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <AnimatedButton onClick={() => navigate('/teacher/departments')} className="w-full mt-6 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700">
            View Full Timetable
          </AnimatedButton>
        </AnimatedCard>

        {/* Performance Overview */}
        <AnimatedCard delay={0.2} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Class Performance Analysis</h3>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 15 }}
                  className="w-3 h-3 rounded-full bg-blue-500"
                /> Class Score
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: 'spring', stiffness: 300, damping: 15 }}
                  className="w-3 h-3 rounded-full bg-slate-300"
                /> Average
              </div>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="average" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AnimatedCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <AnimatedCard delay={0.1} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Recent Academic Activities</h3>
          <div className="space-y-4">
            {([] as { text: string; time: string; icon: any; color: string; bg: string }[]).map((activity, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.06, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("p-2.5 rounded-lg", activity.bg, activity.color)}>
                    <activity.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{activity.text}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{activity.time}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
              </motion.div>
            ))}
          </div>
        </AnimatedCard>

        {/* Quick Task List */}
        <AnimatedCard delay={0.2} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">To-Do List</h3>
            <AnimatedButton onClick={() => navigate('/teacher/assignments')} className="text-xs font-bold text-blue-600 hover:text-blue-700">
              Add Task
            </AnimatedButton>
          </div>
          <div className="space-y-3 flex-1">
            {([] as { task: string; deadline: string; priority: string }[]).map((todo, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.06, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="p-3 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-blue-200 transition-all group cursor-pointer"
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600">{todo.task}</h4>
                  <span className={cn(
                    "text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter",
                    todo.priority === 'High' ? "bg-rose-50 text-rose-600" :
                    todo.priority === 'Medium' ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-600"
                  )}>{todo.priority}</span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">{todo.deadline}</p>
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mt-6 p-4 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl text-white shadow-lg shadow-indigo-900/20"
          >
            <h4 className="font-bold text-sm mb-1">Ready for CBT?</h4>
            <p className="text-[10px] text-indigo-100 mb-4 opacity-80">You have a scheduled exam for Grade 12-Science tomorrow.</p>
            <AnimatedButton onClick={() => navigate('/teacher/exams')} className="w-full py-2 bg-white text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-colors">
              Manage Exams
            </AnimatedButton>
          </motion.div>
        </AnimatedCard>
      </div>
    </AnimatedPage>
  );
}
