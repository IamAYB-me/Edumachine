import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, LifeBuoy, ShieldCheck, Globe } from 'lucide-react';
import { KPICard } from '@/components/ui/KPICard';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useCurrency } from '@/hooks/useCurrency';
import { useDataStore } from '@/store/useDataStore';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import {
  AnimatedPage,
  AnimatedProgress,
  StaggerContainer,
  StaggerItem,
} from '@/components/ui/motion';
import { fadeUpVariants } from '@/components/ui/motion';

const COLORS = ['#2563eb', '#8b5cf6', '#10b981', '#f59e0b'];

const headerVariants = {
  hidden: { opacity: 0, y: -12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

export default function SuperAdminDashboard() {
  const { format } = useCurrency();
  const schools = useDataStore((s) => s.schools);
  const students = useDataStore((s) => s.students);
  const teachers = useDataStore((s) => s.teachers);
  const staff = useDataStore((s) => s.staff);
  const parents = useDataStore((s) => s.parents);

  const totalSchools = schools.length;
  const totalUsers = students.length + teachers.length + staff.length + parents.length;
  const activeSchools = schools.filter((s) => s.status === 'Active').length;

  const planCounts = schools.reduce(
    (acc, school) => {
      acc[school.subscriptionPlan] = (acc[school.subscriptionPlan] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const subscriptionData = [
    { name: 'Enterprise', value: planCounts['Enterprise'] || 0 },
    { name: 'Professional', value: planCounts['Professional'] || 0 },
    { name: 'Standard', value: planCounts['Standard'] || 0 },
    { name: 'Basic', value: planCounts['Basic'] || 0 },
  ];

  const userBreakdown = [
    { label: 'Students', count: students.length, color: 'bg-blue-500' },
    { label: 'Teachers', count: teachers.length, color: 'bg-indigo-500' },
    { label: 'Parents', count: parents.length, color: 'bg-emerald-500' },
    { label: 'Staff', count: staff.length, color: 'bg-amber-500' },
  ];

  return (
    <AnimatedPage>
      <div className="space-y-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={headerVariants}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Platform Overview</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Global monitoring and health metrics for BROCHEST Portal.</p>
          </div>
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-800"
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">System Healthy</span>
            </motion.div>
          </div>
        </motion.div>

        {/* KPIs */}
        <StaggerContainer staggerDelay={0.08} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StaggerItem variant="scaleIn">
            <KPICard 
              title="Total Schools" 
              value={totalSchools} 
              icon={Building2} 
              iconBgClass="bg-blue-50 dark:bg-blue-900/20"
              iconColorClass="text-blue-600 dark:text-blue-400"
              to="/super-admin/schools"
              delay={0}
            />
          </StaggerItem>
          <StaggerItem variant="scaleIn">
            <KPICard 
              title="Total Users" 
              value={totalUsers.toLocaleString()} 
              icon={Users} 
              iconBgClass="bg-indigo-50 dark:bg-indigo-900/20"
              iconColorClass="text-indigo-600 dark:text-indigo-400"
              to="/super-admin/users"
              delay={0.08}
            />
          </StaggerItem>
          <StaggerItem variant="scaleIn">
            <KPICard 
              title="Active Schools" 
              value={activeSchools} 
              icon={Globe} 
              iconBgClass="bg-emerald-50 dark:bg-emerald-900/20"
              iconColorClass="text-emerald-600 dark:text-emerald-400"
              to="/super-admin/schools"
              delay={0.16}
            />
          </StaggerItem>
          <StaggerItem variant="scaleIn">
            <KPICard 
              title="Total Students" 
              value={students.length.toLocaleString()} 
              icon={LifeBuoy} 
              iconBgClass="bg-rose-50 dark:bg-rose-900/20"
              iconColorClass="text-rose-600 dark:text-rose-400"
              to="/super-admin/users"
              delay={0.24}
            />
          </StaggerItem>
        </StaggerContainer>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Subscriptions Chart */}
          <AnimatedCard delay={0.1} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 text-center">Plan Distribution</h3>
            <div className="flex-1 min-h-[250px] relative">
              {totalSchools > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subscriptionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {subscriptionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#0f172a', color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-sm">No data yet</div>
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{totalSchools}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Schools</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-6">
              {subscriptionData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.name}</div>
                </div>
              ))}
            </div>
          </AnimatedCard>

          {/* Schools List */}
          <AnimatedCard delay={0.2} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Registered Schools</h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[350px] overflow-y-auto">
              {schools.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">No schools registered yet</p>
              ) : (
                <StaggerContainer staggerDelay={0.04} className="divide-y divide-slate-100 dark:divide-slate-800">
                  {schools.slice(0, 10).map((school) => (
                    <StaggerItem key={school.id} variant="slideLeft">
                      <div className="flex items-center justify-between p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                            {school.name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-sm">{school.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{school.portalLevel} • {school.code}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${school.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {school.status}
                          </span>
                        </div>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              )}
            </div>
          </AnimatedCard>
        </div>
        
        {/* Bottom Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatedCard delay={0.3} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Platform Health</h3>
            </div>
            <div className="p-6 space-y-6">
               <motion.div
                 initial="hidden"
                 animate="visible"
                 variants={fadeUpVariants}
                 custom={0}
                 className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl"
               >
                 <div className="flex items-center gap-3">
                   <Globe className="w-5 h-5 text-blue-500" />
                   <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Region: Global</span>
                 </div>
                 <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest rounded-full">Active</span>
               </motion.div>
               <div className="grid grid-cols-2 gap-4">
                 <motion.div
                   initial="hidden"
                   animate="visible"
                   variants={fadeUpVariants}
                   custom={1}
                   className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center"
                 >
                   <p className="text-2xl font-bold text-slate-900 dark:text-white">{teachers.length}</p>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Teachers</p>
                 </motion.div>
                 <motion.div
                   initial="hidden"
                   animate="visible"
                   variants={fadeUpVariants}
                   custom={2}
                   className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center"
                 >
                   <p className="text-2xl font-bold text-slate-900 dark:text-white">{staff.length}</p>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Staff</p>
                 </motion.div>
               </div>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={0.4} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">User Breakdown</h3>
            </div>
            <div className="p-6 space-y-4">
              <StaggerContainer staggerDelay={0.06}>
                {userBreakdown.map((item) => (
                  <StaggerItem key={item.label} variant="fadeUp">
                    <div className="mb-4 last:mb-0">
                      <div className="flex justify-between text-xs font-bold mb-2">
                        <span className="text-slate-500 uppercase tracking-wider">{item.label}</span>
                        <span className="text-slate-900 dark:text-white">{item.count}</span>
                      </div>
                      <AnimatedProgress
                        value={totalUsers > 0 ? (item.count / totalUsers) * 100 : 0}
                        colorClass={item.color}
                        height="h-1.5"
                      />
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </AnimatedCard>
        </div>
      </div>
    </AnimatedPage>
  );
}
