import React from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, UserMinus, FileText, Calendar } from 'lucide-react';
import { KPICard } from '@/components/ui/KPICard';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { AnimatedPage, StaggerContainer, StaggerItem } from '@/components/ui/motion';
import { CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { useDataStore } from '@/store/useDataStore';
import { useCurrency } from '@/hooks/useCurrency';

export default function HRDashboard() {
  const staff = useDataStore((s) => s.staff);
  const attendance = useDataStore((s) => s.attendance);
  const payroll = useDataStore((s) => s.payroll);
  const { format } = useCurrency();

  const totalEmployees = staff.length;
  const activeStaff = staff.filter(s => s.status === 'Active').length;
  const totalPayroll = payroll.reduce((sum, p) => sum + p.net, 0);

  const todayStr = new Date().toISOString().split('T')[0];
  const presentToday = attendance.filter(a => a.date === todayStr && a.status === 'Present').length;
  const onLeave = attendance.filter(a => a.date === todayStr && a.status === 'Excused').length;
  const absentToday = attendance.filter(a => a.date === todayStr && a.status === 'Absent').length;
  const attendanceRate = totalEmployees > 0 ? ((presentToday / totalEmployees) * 100).toFixed(1) : '0';

  const attendanceData = [
    { name: 'Present', value: Number(attendanceRate) },
    { name: 'Absent', value: totalEmployees > 0 ? ((absentToday / totalEmployees) * 100) : 0 },
    { name: 'Leave', value: totalEmployees > 0 ? ((onLeave / totalEmployees) * 100) : 0 },
  ];
  const ATTENDANCE_COLORS = ['#3b82f6', '#ef4444', '#10b981'];

  const payrollData = [
    { name: 'Total', value: totalPayroll },
  ];

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
            <h1 className="text-2xl font-bold text-slate-900">Welcome back, HR Manager 👋</h1>
            <p className="text-slate-500 text-sm mt-1">Here's the HR overview.</p>
          </div>
        </motion.div>

        {/* KPIs */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4" staggerDelay={0}>
          <StaggerItem variant="fadeUp">
            <KPICard
              title="Total Employees"
              value={totalEmployees}
              icon={Users}
              iconBgClass="bg-blue-50"
              iconColorClass="text-blue-600"
              delay={0}
              trend={{ value: activeStaff, label: "Active" }}
              to="/hr/employees"
            />
          </StaggerItem>
          <StaggerItem variant="fadeUp">
            <KPICard
              title="Present Today"
              value={presentToday}
              icon={UserCheck}
              iconBgClass="bg-emerald-50"
              iconColorClass="text-emerald-600"
              delay={0.08}
              to="/hr/attendance"
            />
          </StaggerItem>
          <StaggerItem variant="fadeUp">
            <KPICard
              title="On Leave"
              value={onLeave}
              icon={UserMinus}
              iconBgClass="bg-rose-50"
              iconColorClass="text-rose-600"
              delay={0.16}
              to="/hr/leaves"
            />
          </StaggerItem>
          <StaggerItem variant="fadeUp">
            <KPICard
              title="Pending Leaves"
              value={onLeave}
              icon={FileText}
              iconBgClass="bg-amber-50"
              iconColorClass="text-amber-600"
              delay={0.24}
              to="/hr/leaves"
            />
          </StaggerItem>
          <StaggerItem variant="fadeUp">
            <KPICard
              title="Total Payroll"
              value={totalPayroll}
              isCurrency={true}
              icon={Calendar}
              iconBgClass="bg-purple-50"
              iconColorClass="text-purple-600"
              delay={0.32}
              to="/hr/payroll"
            />
          </StaggerItem>
        </StaggerContainer>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Attendance Pie */}
          <AnimatedCard delay={0.1} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Attendance Overview</h3>
            <p className="text-xs text-slate-500 mb-4">This Month</p>
            <div className="h-[200px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={attendanceData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" stroke="none">
                    {attendanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={ATTENDANCE_COLORS[index % ATTENDANCE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-slate-900">{attendanceRate}%</span>
                <span className="text-[10px] text-slate-500">Present</span>
              </div>
            </div>
            <StaggerContainer className="grid grid-cols-3 gap-2 mt-4" staggerDelay={0.08}>
              {attendanceData.map((item, i) => (
                <StaggerItem key={i} variant="scaleIn">
                  <div className="flex flex-col items-center text-center">
                    <div className="flex items-center gap-1 mb-1">
                      <div className="w-2 h-2 rounded-full" style={{backgroundColor: ATTENDANCE_COLORS[i]}}></div>
                      <span className="text-[10px] text-slate-600">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold">{item.value}%</span>
                    <div className="w-full bg-slate-100 rounded-full overflow-hidden h-1 mt-1">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: ATTENDANCE_COLORS[i] }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(item.value, 100)}%` }}
                        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.4 + i * 0.1 }}
                      />
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </AnimatedCard>

          {/* Leave Requests */}
          <AnimatedCard delay={0.2} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Leave Requests</h3>
            </div>
            <StaggerContainer className="space-y-4" staggerDelay={0.1}>
              {[
                { name: 'Sarah Wilson', dates: 'May 24 - May 25', days: '2 days' },
                { name: 'Michael Brown', dates: 'May 26', days: '1 day' },
                { name: 'David Smith', dates: 'May 27 - May 29', days: '3 days' },
              ].map((leave, i) => (
                <StaggerItem key={i} variant="fadeUp">
                  <div className="flex items-center justify-between p-3 border border-slate-100 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                        {leave.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{leave.name}</p>
                        <p className="text-[10px] text-slate-500">{leave.dates}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-medium text-slate-700">{leave.days}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">Pending</span>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </AnimatedCard>

          {/* Payroll Overview */}
          <AnimatedCard delay={0.3} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Payroll Overview</h3>
            <p className="text-xs text-slate-500 mb-6">This Month</p>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="mb-4"
            >
              <p className="text-sm text-slate-500">Total Payroll</p>
              <div className="flex items-end gap-3">
                <h2 className="text-3xl font-bold text-slate-900">{format(totalPayroll)}</h2>
              </div>
            </motion.div>
            <div className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={payrollData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <Tooltip cursor={{fill: '#f1f5f9'}} formatter={(val) => format(val)} />
                  <Bar dataKey="value" fill="#60a5fa" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </AnimatedCard>
        </div>
      </div>
    </AnimatedPage>
  );
}
