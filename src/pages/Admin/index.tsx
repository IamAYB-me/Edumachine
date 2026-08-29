import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, GraduationCap, Bell, UserPlus, BookOpen, 
  Award, CheckCircle, Briefcase, Clock, Calendar, 
  ShieldCheck, BedDouble, Bus, Library,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { KPICard } from '@/components/ui/KPICard';
import { cn } from '@/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useDataStore } from '@/store/useDataStore';
import { useCurrency } from '@/hooks/useCurrency';
import { useAuthStore } from '@/store/useAuthStore';
import { getPortalLevelLabels, resolveSchoolProfile } from '@/utils/schoolProfile';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { AnimatedPage, AnimatedButton, StaggerContainer, StaggerItem } from '@/components/ui/motion';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { staff, schools, students, teachers, classes, expenses, payroll, attendance, examResults, examTimetable } = useDataStore();
  const user = useAuthStore((state) => state.user);
  const { format } = useCurrency();
  const schoolProfile = resolveSchoolProfile(user, schools);
  const labels = getPortalLevelLabels(schoolProfile.portalLevel);
  
  const academicStaff = staff.filter(s => s.category === 'Academic').length;
  const nonAcademicStaff = staff.filter(s => s.category === 'Non-Academic').length;
  const totalPayroll = payroll.reduce((sum, p) => sum + p.net, 0);
  const totalStaffCount = staff.length;
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  const todayStr = new Date().toISOString().split('T')[0];
  const presentToday = attendance.filter(a => a.date === todayStr && a.status === 'Present').length;
  const attendanceRate = totalStaffCount > 0 ? ((presentToday / totalStaffCount) * 100).toFixed(1) : '0';
  
  const staffingData = [
    { name: 'Academic', value: academicStaff },
    { name: 'Non-Academic', value: nonAcademicStaff },
  ];
  
  const STAFF_COLORS = ['#6366f1', '#f59e0b'];

  const admissionData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 10 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 9 + i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
      const count = students.filter((s) => {
        const dt = s.dateOfAdmission;
        if (!dt) return false;
        return dt.startsWith(key);
      }).length;
      return { name: MONTH_NAMES[d.getMonth()], students: count };
    });
  }, [students]);

  const structurePerformance = useMemo(() => {
    if (classes.length === 0) return [];
    const studentClassMap = new Map<string, string>();
    students.forEach((s) => {
      const cls = s.class || s.classDepartment || '';
      if (cls) studentClassMap.set(s.id, cls);
      if (s.regNo) studentClassMap.set(s.regNo, cls);
    });
    const classScoreMap = new Map<string, { total: number; count: number }>();
    examResults.forEach((r) => {
      const cls = studentClassMap.get(r.studentId) || studentClassMap.get(r.regNo || '') || '';
      if (!cls) return;
      const existing = classScoreMap.get(cls) || { total: 0, count: 0 };
      const pct = r.totalMarks > 0 ? (r.score / r.totalMarks) * 100 : r.score;
      existing.total += pct;
      existing.count += 1;
      classScoreMap.set(cls, existing);
    });
    const result = Array.from(classScoreMap.entries())
      .map(([name, { total, count }]) => ({ name, score: Math.round(total / count) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
    if (result.length === 0) {
      return classes.slice(0, 6).map((c) => ({ name: c.name, score: 0 }));
    }
    return result;
  }, [classes, students, examResults]);

  const topPerformers = useMemo(() => {
    const studentClassMap = new Map<string, string>();
    students.forEach((s) => {
      const cls = s.class || s.classDepartment || '';
      if (cls) studentClassMap.set(s.id, cls);
      if (s.regNo) studentClassMap.set(s.regNo, cls);
    });
    const classScoreMap = new Map<string, { total: number; count: number }>();
    examResults.forEach((r) => {
      const cls = studentClassMap.get(r.studentId) || studentClassMap.get(r.regNo || '') || '';
      if (!cls) return;
      const existing = classScoreMap.get(cls) || { total: 0, count: 0 };
      const pct = r.totalMarks > 0 ? (r.score / r.totalMarks) * 100 : r.score;
      existing.total += pct;
      existing.count += 1;
      classScoreMap.set(cls, existing);
    });
    const ranked = Array.from(classScoreMap.entries())
      .map(([name, { total, count }]) => ({ name, score: `${Math.round(total / count)}%` }))
      .sort((a, b) => parseInt(b.score) - parseInt(a.score))
      .slice(0, 3);
    if (ranked.length === 0) {
      return classes.slice(0, 3).map((c) => ({ name: c.name, score: '—' }));
    }
    return ranked;
  }, [classes, students, examResults]);
  return (
    <AnimatedPage className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex justify-between items-end"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Academy Overview 👋</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Overview of {schoolProfile.portalLevel.toLowerCase()} academic performance and institutional growth.</p>
        </div>
      </motion.div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title={`Total ${labels.learnerPlural}`} 
          value={students.length.toLocaleString()} 
          icon={Users} 
          iconBgClass="bg-blue-50 dark:bg-blue-900/20"
          iconColorClass="text-blue-600 dark:text-blue-400"
          to="/admin/students"
          delay={0}
        />
        <KPICard 
          title={`Total ${labels.teacherPlural}`} 
          value={teachers.length} 
          icon={UserPlus} 
          iconBgClass="bg-indigo-50 dark:bg-indigo-900/20"
          iconColorClass="text-indigo-600 dark:text-indigo-400"
          to="/admin/teachers"
          delay={0.08}
        />
        <KPICard 
          title={`Total ${labels.structurePlural}`} 
          value={classes.length} 
          icon={GraduationCap} 
          iconBgClass="bg-emerald-50 dark:bg-emerald-900/20"
          iconColorClass="text-emerald-600 dark:text-emerald-400"
          to="/admin/classes"
          delay={0.16}
        />
        <KPICard 
          title="Total Staff" 
          value={totalStaffCount} 
          icon={Briefcase} 
          iconBgClass="bg-amber-50 dark:bg-amber-900/20"
          iconColorClass="text-amber-600 dark:text-amber-400"
          to="/hr/employees"
          delay={0.24}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Admission Chart */}
        <AnimatedCard delay={0.1} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">{labels.learnerSingular} Admission Growth</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={admissionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '5 5' }}
                />
                <Line type="monotone" dataKey="students" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, fill: '#4f46e5' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </AnimatedCard>

        {/* Grade Distribution */}
        <AnimatedCard delay={0.18} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">{labels.performanceByLabel}</h3>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={structurePerformance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip 
                   cursor={{ fill: '#f1f5f9' }}
                   contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AnimatedCard>

        {/* Staffing Overview */}
        <AnimatedCard delay={0.26} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-500" />
            Staffing Mix
          </h3>
          <div className="flex-1 min-h-[200px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={staffingData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {staffingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STAFF_COLORS[index % STAFF_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {staffingData.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.3 }}
                className="flex justify-between items-center text-xs"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STAFF_COLORS[i] }} />
                  <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tighter">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{item.value}</span>
              </motion.div>
            ))}
          </div>
        </AnimatedCard>
      </div>

      {/* Departmental Glimpse Section */}
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="flex items-center gap-3 px-2"
        >
          <div className="h-6 w-1 bg-blue-600 rounded-full"></div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">Operational Glimpse</h2>
        </motion.div>
        
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.08}>
          {/* HR Glimpse */}
          <StaggerItem variant="scaleIn">
            <AnimatedCard noEntrance className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm group hover:border-blue-500/50 transition-all">
              <div className="flex items-center justify-between mb-6">
                <motion.div 
                  whileHover={{ scale: 1.15, rotate: 8 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600 dark:text-blue-400"
                >
                  <ShieldCheck className="w-6 h-6" />
                </motion.div>
                <Link to="/hr" className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline">HR Portal</Link>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">HR & Payroll</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Total Staff</span>
                  <span className="font-bold text-slate-900 dark:text-white">{totalStaffCount}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Attendance</span>
                  <span className="font-bold text-emerald-600">{attendanceRate}%</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Monthly Payroll</span>
                  <span className="font-bold text-slate-900 dark:text-white">{format(totalPayroll)}</span>
                </div>
              </div>
            </AnimatedCard>
          </StaggerItem>

          {/* Hostel Glimpse */}
          <StaggerItem variant="scaleIn">
            <AnimatedCard noEntrance className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm group hover:border-emerald-500/50 transition-all">
              <div className="flex items-center justify-between mb-6">
                <motion.div 
                  whileHover={{ scale: 1.15, rotate: 8 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-emerald-600 dark:text-emerald-400"
                >
                  <BedDouble className="w-6 h-6" />
                </motion.div>
                <Link to="/hostel" className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest hover:underline">Hostel Portal</Link>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Facility & Hostel</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Rooms</span>
                  <span className="font-bold text-slate-900 dark:text-white">Manage via Portal</span>
                </div>
              </div>
            </AnimatedCard>
          </StaggerItem>

          {/* Transport Glimpse */}
          <StaggerItem variant="scaleIn">
            <AnimatedCard noEntrance className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm group hover:border-amber-500/50 transition-all">
              <div className="flex items-center justify-between mb-6">
                <motion.div 
                  whileHover={{ scale: 1.15, rotate: 8 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl text-amber-600 dark:text-amber-400"
                >
                  <Bus className="w-6 h-6" />
                </motion.div>
                <Link to="/transport" className="text-[10px] font-bold text-amber-600 uppercase tracking-widest hover:underline">Fleet Portal</Link>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Transport & Logistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Fleet</span>
                  <span className="font-bold text-slate-900 dark:text-white">Manage via Portal</span>
                </div>
              </div>
            </AnimatedCard>
          </StaggerItem>

          {/* Library Glimpse */}
          <StaggerItem variant="scaleIn">
            <AnimatedCard noEntrance className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm group hover:border-rose-500/50 transition-all">
              <div className="flex items-center justify-between mb-6">
                <motion.div 
                  whileHover={{ scale: 1.15, rotate: 8 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-2xl text-rose-600 dark:text-rose-400"
                >
                  <Library className="w-6 h-6" />
                </motion.div>
                <Link to="/librarian" className="text-[10px] font-bold text-rose-600 uppercase tracking-widest hover:underline">Library Portal</Link>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Library & Resources</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Books</span>
                  <span className="font-bold text-slate-900 dark:text-white">Manage via Portal</span>
                </div>
              </div>
            </AnimatedCard>
          </StaggerItem>
        </StaggerContainer>
      </div>
      
      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnimatedCard delay={0.2} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tighter">{labels.topStructureLabel}</h3>
            <AnimatedButton
              onClick={() => navigate('/admin/results')}
              className="text-xs text-blue-600 font-bold hover:text-blue-700 uppercase tracking-widest"
            >
              View Report
            </AnimatedButton>
          </div>
          <div className="space-y-4">
            {topPerformers.map((cls, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.35 }}
                className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                    {i+1}
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{cls.name}</span>
                </div>
                <span className="font-bold text-emerald-600">{cls.score}</span>
              </motion.div>
            ))}
          </div>
        </AnimatedCard>
        
        <AnimatedCard delay={0.28} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-tighter">Academic Actions</h3>
          <StaggerContainer className="grid grid-cols-2 lg:grid-cols-3 gap-4" staggerDelay={0.05}>
            {[
              { name: labels.teacherPlural, icon: UserPlus, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', path: '/admin/teachers', desc: 'Staffing' },
              { name: labels.curriculumLabel, icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20', path: '/admin/academic', desc: labels.subjectPlural },
              { name: labels.structurePlural, icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', path: '/admin/classes', desc: 'Sections' },
              { name: 'Periods', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', path: '/admin/timetable', desc: 'Timetable' },
              { name: labels.assessmentLabel, icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20', path: '/admin/exam-timetable', desc: 'Schedule' },
              { name: 'Notice', icon: Bell, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', path: '/admin/notices', desc: 'Broadcast' },
            ].map((action, i) => (
              <StaggerItem key={i} variant="scaleIn">
                <Link 
                  to={action.path}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all gap-2 group text-center shadow-sm"
                >
                  <motion.div 
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    className={cn("p-3 rounded-xl", action.bg, action.color)}
                  >
                    <action.icon className="w-5 h-5" />
                  </motion.div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{action.name}</p>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </AnimatedCard>

        <AnimatedCard delay={0.36} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-tighter">Academic Health</h3>
          <div className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800/50"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg"><CheckCircle className="w-4 h-4" /></div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{labels.structurePlural} Count</span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white">{classes.length}</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.3 }}
              className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800/50"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg"><Award className="w-4 h-4" /></div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Active {labels.learnerPlural}</span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white">{students.filter(s => s.status === 'Active').length}</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.3 }}
              className="flex justify-between items-center"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg"><BookOpen className="w-4 h-4" /></div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Total Expenses</span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white">{format(totalExpense)}</span>
            </motion.div>
          </div>
        </AnimatedCard>
      </div>
    </AnimatedPage>
  );
}
