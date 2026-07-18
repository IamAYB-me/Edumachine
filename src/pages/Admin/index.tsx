import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, GraduationCap, Bell, UserPlus, BookOpen, 
  Award, CheckCircle, Briefcase, Clock, Calendar, 
  ShieldCheck, BedDouble, Bus, Library,
} from 'lucide-react';
import { KPICard } from '@/components/ui/KPICard';
import { cn } from '@/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useDataStore } from '@/store/useDataStore';
import { useCurrency } from '@/hooks/useCurrency';
import { useAuthStore } from '@/store/useAuthStore';
import { getPortalLevelLabels, resolveSchoolProfile } from '@/utils/schoolProfile';

const admissionData = [
  { name: 'Jan', students: 65 },
  { name: 'Feb', students: 160 },
  { name: 'Mar', students: 250 },
  { name: 'Apr', students: 245 },
  { name: 'May', students: 300 },
  { name: 'Jun', students: 210 },
  { name: 'Jul', students: 250 },
  { name: 'Aug', students: 370 },
  { name: 'Sep', students: 340 },
  { name: 'Oct', students: 370 },
];

const classPerformance = [
  { name: 'Grade 1', score: 85 },
  { name: 'Grade 2', score: 78 },
  { name: 'Grade 3', score: 92 },
  { name: 'Grade 4', score: 88 },
  { name: 'Grade 5', score: 95 },
  { name: 'Grade 6', score: 82 },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { staff, schools } = useDataStore();
  const user = useAuthStore((state) => state.user);
  const { format } = useCurrency();
  const schoolProfile = resolveSchoolProfile(user, schools);
  const labels = getPortalLevelLabels(schoolProfile.portalLevel);
  
  const academicStaff = staff.filter(s => s.category === 'Academic').length;
  const nonAcademicStaff = staff.filter(s => s.category === 'Non-Academic').length;
  
  const staffingData = [
    { name: 'Academic', value: academicStaff },
    { name: 'Non-Academic', value: nonAcademicStaff },
  ];
  
  const STAFF_COLORS = ['#6366f1', '#f59e0b'];
  const structurePerformance = classPerformance.map((entry) => ({
    ...entry,
    name: schoolProfile.portalLevel === 'Primary'
      ? entry.name.replace('Grade', 'Primary')
      : schoolProfile.portalLevel === 'Secondary'
        ? entry.name
        : entry.name.replace('Grade', 'Dept'),
  }));
  const topPerformers = schoolProfile.portalLevel === 'Primary'
    ? [
        { name: 'Primary 5 - Gold', score: '96%' },
        { name: 'Primary 4 - Blue', score: '93%' },
        { name: 'Primary 6 - Gold', score: '91%' },
      ]
    : schoolProfile.portalLevel === 'Secondary'
      ? [
          { name: 'SS 2 - Science', score: '98%' },
          { name: 'JSS 3 - Blue', score: '93%' },
          { name: 'SS 3 - Arts', score: '91%' },
        ]
      : schoolProfile.portalLevel === 'College'
        ? [
            { name: 'Computer Science', score: '89%' },
            { name: 'Accountancy', score: '86%' },
            { name: 'Mass Communication', score: '84%' },
          ]
        : [
            { name: 'Computer Science', score: '91%' },
            { name: 'Software Engineering', score: '89%' },
            { name: 'Information Systems', score: '87%' },
          ];
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Academy Overview 👋</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Overview of {schoolProfile.portalLevel.toLowerCase()} academic performance and institutional growth.</p>
        </div>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title={`Total ${labels.learnerPlural}`} 
          value="2,450" 
          icon={Users} 
          iconBgClass="bg-blue-50 dark:bg-blue-900/20"
          iconColorClass="text-blue-600 dark:text-blue-400"
        />
        <KPICard 
          title="Total Teachers" 
          value="156" 
          icon={UserPlus} 
          iconBgClass="bg-indigo-50 dark:bg-indigo-900/20"
          iconColorClass="text-indigo-600 dark:text-indigo-400"
        />
        <KPICard 
          title={`Total ${labels.structurePlural}`} 
          value="85" 
          icon={GraduationCap} 
          iconBgClass="bg-emerald-50 dark:bg-emerald-900/20"
          iconColorClass="text-emerald-600 dark:text-emerald-400"
        />
        <KPICard 
          title={labels.scoreMetricLabel} 
          value={labels.scoreMetricValue} 
          icon={Award} 
          iconBgClass="bg-amber-50 dark:bg-amber-900/20"
          iconColorClass="text-amber-600 dark:text-amber-400"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Admission Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2">
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
        </div>

        {/* Grade Distribution */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
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
        </div>

        {/* Staffing Overview */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
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
              <div key={i} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STAFF_COLORS[i] }} />
                  <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tighter">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Departmental Glimpse Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-2">
          <div className="h-6 w-1 bg-blue-600 rounded-full"></div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">Operational Glimpse</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* HR Glimpse */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm group hover:border-blue-500/50 transition-all">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <Link to="/hr" className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline">HR Portal</Link>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">HR & Payroll</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Total Staff</span>
                <span className="font-bold text-slate-900 dark:text-white">126</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Attendance</span>
                <span className="font-bold text-emerald-600">77.8%</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Monthly Payroll</span>
                <span className="font-bold text-slate-900 dark:text-white">{format(42560)}</span>
              </div>
            </div>
          </div>

          {/* Hostel Glimpse */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm group hover:border-emerald-500/50 transition-all">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <BedDouble className="w-6 h-6" />
              </div>
              <Link to="/hostel" className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest hover:underline">Hostel Portal</Link>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Facility & Hostel</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Occupancy</span>
                <span className="font-bold text-slate-900 dark:text-white">87.5%</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Available Rooms</span>
                <span className="font-bold text-blue-600">16</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Pending Issues</span>
                <span className="font-bold text-rose-600">3 Alerts</span>
              </div>
            </div>
          </div>

          {/* Transport Glimpse */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm group hover:border-amber-500/50 transition-all">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                <Bus className="w-6 h-6" />
              </div>
              <Link to="/transport" className="text-[10px] font-bold text-amber-600 uppercase tracking-widest hover:underline">Fleet Portal</Link>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Transport & Logistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Active Fleet</span>
                <span className="font-bold text-slate-900 dark:text-white">24 Vehicles</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Students Covered</span>
                <span className="font-bold text-indigo-600">856</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Route Efficiency</span>
                <span className="font-bold text-emerald-600">94%</span>
              </div>
            </div>
          </div>

          {/* Library Glimpse */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm group hover:border-rose-500/50 transition-all">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-2xl text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
                <Library className="w-6 h-6" />
              </div>
              <Link to="/librarian" className="text-[10px] font-bold text-rose-600 uppercase tracking-widest hover:underline">Library Portal</Link>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Library & Resources</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Catalog Size</span>
                <span className="font-bold text-slate-900 dark:text-white">12,450 Books</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Active Borrows</span>
                <span className="font-bold text-blue-600">845</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Overdue</span>
                <span className="font-bold text-rose-600">42 Items</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tighter">{labels.topStructureLabel}</h3>
            <button onClick={() => navigate('/admin/results')} className="text-xs text-blue-600 font-bold hover:text-blue-700 uppercase tracking-widest">View Report</button>
          </div>
          <div className="space-y-4">
            {topPerformers.map((cls, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                    {i+1}
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{cls.name}</span>
                </div>
                <span className="font-bold text-emerald-600">{cls.score}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-tighter">Academic Actions</h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Faculty', icon: UserPlus, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', path: '/admin/teachers', desc: 'Staffing' },
              { name: labels.curriculumLabel, icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20', path: '/admin/academic', desc: 'Subjects' },
              { name: labels.structurePlural, icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', path: '/admin/classes', desc: 'Sections' },
              { name: 'Periods', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', path: '/admin/timetable', desc: 'Timetable' },
              { name: 'Exams', icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20', path: '/admin/exam-timetable', desc: 'Schedule' },
              { name: 'Notice', icon: Bell, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', path: '/admin/notices', desc: 'Broadcast' },
            ].map((action, i) => (
              <Link 
                key={i} 
                to={action.path}
                className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all gap-2 group text-center shadow-sm active:scale-95"
              >
                <div className={cn("p-3 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3", action.bg, action.color)}>
                  <action.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{action.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-tighter">Academic Health</h3>
          <div className="space-y-5">
             <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800/50">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg"><CheckCircle className="w-4 h-4" /></div>
                 <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Attendance Rate</span>
               </div>
               <span className="font-bold text-slate-900 dark:text-white">94%</span>
             </div>
             <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800/50">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg"><Award className="w-4 h-4" /></div>
                 <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Pass Rate</span>
               </div>
               <span className="font-bold text-slate-900 dark:text-white">88%</span>
             </div>
             <div className="flex justify-between items-center">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg"><BookOpen className="w-4 h-4" /></div>
                 <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Syllabus Covered</span>
               </div>
               <span className="font-bold text-slate-900 dark:text-white">72%</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
