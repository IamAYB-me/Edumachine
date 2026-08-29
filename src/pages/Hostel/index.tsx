import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { Users, BedDouble, Key, AlertTriangle, Building, DollarSign } from 'lucide-react';
import { KPICard } from '@/components/ui/KPICard';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { AnimatedPage, AnimatedButton, StaggerContainer, StaggerItem } from '@/components/ui/motion';
import { cn } from '@/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '@/hooks/useCurrency';
import { useToastStore } from '@/store/useToastStore';
import { useDataStore } from '@/store/useDataStore';
import { useAuthStore } from '@/store/useAuthStore';
import { resolveSchoolProfile, getPortalLevelLabels } from '@/utils/schoolProfile';

const listItemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

export default function HostelDashboard() {
  const navigate = useNavigate();
  const { format } = useCurrency();
  const showToast = useToastStore((state) => state.showToast);
  const students = useDataStore((s) => s.students);
  const feeRecords = useDataStore((s) => s.feeRecords);
  const schools = useDataStore((s) => s.schools);
  const authUser = useAuthStore((state) => state.user);
  const schoolProfile = resolveSchoolProfile(authUser, schools);
  const labels = getPortalLevelLabels(schoolProfile.portalLevel);

  const hostelStudents = students.filter(s => s.hostel);
  const totalHostelStudents = hostelStudents.length;
  const pendingFees = feeRecords.filter(f => f.status === 'Pending' || f.status === 'Partial').reduce((sum, f) => sum + f.amount, 0);

  const occupancyData = [
    { name: 'Occupied', value: totalHostelStudents },
    { name: 'Available', value: Math.max(0, 128 - totalHostelStudents) },
  ];
  const OCCUPANCY_COLORS = ['#10b981', '#3b82f6'];

  return (
    <AnimatedPage>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex justify-between items-end"
        >
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome back, Hostel Warden 👋</h1>
            <p className="text-slate-500 text-sm mt-1">Here's the hostel overview.</p>
          </div>
        </motion.div>

        {/* KPIs */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StaggerItem variant="fadeUp">
            <KPICard
              title={`Total ${labels.learnerPlural}`}
              value={totalHostelStudents}
              icon={Users}
              iconBgClass="bg-blue-50"
              iconColorClass="text-blue-600"
              trend={{ value: 0, label: "In Hostels" }}
              delay={0}
              to="/hostel/students"
            />
          </StaggerItem>
          <StaggerItem variant="fadeUp">
            <KPICard
              title="Total Rooms"
              value="128"
              icon={BedDouble}
              iconBgClass="bg-emerald-50"
              iconColorClass="text-emerald-600"
              delay={0.08}
              to="/hostel/rooms"
            />
          </StaggerItem>
          <StaggerItem variant="fadeUp">
            <KPICard
              title="Occupied Rooms"
              value={totalHostelStudents}
              icon={Key}
              iconBgClass="bg-emerald-50"
              iconColorClass="text-emerald-600"
              delay={0.16}
              to="/hostel/rooms"
            />
          </StaggerItem>
          <StaggerItem variant="fadeUp">
            <KPICard
              title="Available Rooms"
              value={Math.max(0, 128 - totalHostelStudents)}
              icon={Key}
              iconBgClass="bg-blue-50"
              iconColorClass="text-blue-600"
              delay={0.24}
              to="/hostel/rooms"
            />
          </StaggerItem>
          <StaggerItem variant="fadeUp">
            <KPICard
              title="Pending Fees"
              value={format(pendingFees)}
              icon={DollarSign}
              iconBgClass="bg-rose-50"
              iconColorClass="text-rose-600"
              delay={0.32}
              to="/accountant/fees"
            />
          </StaggerItem>
        </StaggerContainer>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Occupancy Chart */}
          <AnimatedCard delay={0.08} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Room Occupancy</h3>
            <div className="flex-1 relative min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={occupancyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {occupancyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={OCCUPANCY_COLORS[index % OCCUPANCY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-slate-900">{totalHostelStudents > 0 ? Math.round((totalHostelStudents / 128) * 100) : 0}%</span>
                <span className="text-xs text-slate-500">Occupied</span>
              </div>
            </div>
            <div className="flex flex-col gap-3 mt-4 px-4">
              {occupancyData.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="flex justify-between items-center text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: OCCUPANCY_COLORS[i]}}></div>
                    <span className="text-slate-600">{item.name} Rooms</span>
                  </div>
                  <span className="font-semibold text-slate-900">{item.value} ({Math.round((item.value/128)*100)}%)</span>
                </motion.div>
              ))}
            </div>
          </AnimatedCard>

          {/* Students by Hostel */}
          <AnimatedCard delay={0.16} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">{labels.learnerPlural} by Hostel</h3>
            <div className="space-y-4">
              {[
                { name: 'Maple Hostel', count: 98 },
                { name: 'Oak Hostel', count: 72 },
                { name: 'Pine Hostel', count: 54 },
                { name: 'Cedar Hostel', count: 32 },
              ].map((hostel, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={listItemVariants}
                  className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <Building className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-slate-900 text-sm">{hostel.name}</span>
                  </div>
                  <span className="font-bold text-slate-700">{hostel.count}</span>
                </motion.div>
              ))}
            </div>
          </AnimatedCard>

          {/* Recent Check-ins */}
          <AnimatedCard delay={0.24} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Recent Check-ins</h3>
              <AnimatedButton
                onClick={() => navigate('/hostel/students')}
                className="text-sm text-blue-600 font-medium hover:text-blue-700"
              >
                View All
              </AnimatedButton>
            </div>
            <div className="space-y-4">
              {[
                { name: 'Maple Wilson', room: 'Room 202, Maple Hostel', date: 'May 28, 2025' },
                { name: 'Daniel Brown', room: 'Room 305, Oak Hostel', date: 'May 23, 2025' },
                { name: 'William Smith', room: 'Room 102, Pine Hostel', date: 'May 20, 2025' },
              ].map((student, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={listItemVariants}
                  className="flex justify-between items-start pb-4 border-b border-slate-100 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">{student.name.charAt(0)}</div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{student.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{student.room}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1">{student.date}</span>
                </motion.div>
              ))}
            </div>
          </AnimatedCard>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Maintenance Requests */}
          <AnimatedCard delay={0.32} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Maintenance Requests</h3>
            <div className="space-y-3">
              {[
                { issue: 'Fan not working', room: 'Room 205', hostel: 'Maple Hostel', priority: 'High', color: 'text-rose-700', bg: 'bg-rose-100' },
                { issue: 'Water leaking', room: 'Room 310', hostel: 'Oak Hostel', priority: 'Medium', color: 'text-amber-700', bg: 'bg-amber-100' },
                { issue: 'Light not working', room: 'Room 101', hostel: 'Pine Hostel', priority: 'Low', color: 'text-emerald-700', bg: 'bg-emerald-100' },
              ].map((req, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={listItemVariants}
                  className="flex justify-between items-center p-3 border border-slate-100 rounded-lg"
                >
                  <div className="flex gap-3 items-start">
                    <AlertTriangle className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{req.issue} - {req.room}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{req.hostel}</p>
                    </div>
                  </div>
                  <span className={cn("text-[10px] font-semibold px-2 py-1 rounded-full", req.bg, req.color)}>
                    {req.priority}
                  </span>
                </motion.div>
              ))}
            </div>
          </AnimatedCard>

          {/* Fees Overview */}
          <AnimatedCard delay={0.4} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Hostel Fees Overview</h3>
              <AnimatedButton
                onClick={() => navigate('/accountant/fees')}
                className="text-sm text-blue-600 font-medium"
              >
                View Details
              </AnimatedButton>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="p-4 bg-emerald-50 rounded-xl border border-emerald-100"
              >
                <p className="text-xs font-medium text-emerald-800 mb-2">{labels.learnerPlural} Hosted</p>
                <h3 className="text-2xl font-bold text-emerald-600 mb-2">{totalHostelStudents}</h3>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.58, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="p-4 bg-rose-50 rounded-xl border border-rose-100"
              >
                <p className="text-xs font-medium text-rose-800 mb-2">Pending Fees</p>
                <h3 className="text-2xl font-bold text-rose-600 mb-2">{format(pendingFees)}</h3>
              </motion.div>
            </div>
          </AnimatedCard>
        </div>
      </div>
    </AnimatedPage>
  );
}
