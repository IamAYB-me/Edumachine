import React from 'react';
import { Users, UserCheck, UserMinus, FileText, Calendar, TrendingUp } from 'lucide-react';
import { KPICard } from '@/components/ui/KPICard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const attendanceData = [
  { name: 'Present', value: 77.8 },
  { name: 'Absent', value: 15.9 },
  { name: 'Leave', value: 6.3 },
];
const ATTENDANCE_COLORS = ['#3b82f6', '#ef4444', '#10b981'];

const payrollData = [
  { name: 'Jan', value: 38000 },
  { name: 'Feb', value: 39000 },
  { name: 'Mar', value: 39500 },
  { name: 'Apr', value: 41000 },
  { name: 'May', value: 42560 },
];

export default function HRDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, HR Manager 👋</h1>
          <p className="text-slate-500 text-sm mt-1">Here's the HR overview.</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard 
          title="Total Employees" 
          value="126" 
          icon={Users} 
          iconBgClass="bg-blue-50"
          iconColorClass="text-blue-600"
          trend={{ value: 0, label: "Active" }}
        />
        <KPICard 
          title="Present Today" 
          value="98" 
          icon={UserCheck} 
          iconBgClass="bg-emerald-50"
          iconColorClass="text-emerald-600"
          trend={{ value: 77.8, label: "", isPositive: true }}
        />
        <KPICard 
          title="On Leave" 
          value="15" 
          icon={UserMinus} 
          iconBgClass="bg-rose-50"
          iconColorClass="text-rose-600"
          trend={{ value: 0, label: "Today" }}
        />
        <KPICard 
          title="Pending Leaves" 
          value="7" 
          icon={FileText} 
          iconBgClass="bg-amber-50"
          iconColorClass="text-amber-600"
          trend={{ value: 0, label: "Requests" }}
        />
        <KPICard 
          title="Upcoming Birthdays" 
          value="3" 
          icon={Calendar} 
          iconBgClass="bg-purple-50"
          iconColorClass="text-purple-600"
          trend={{ value: 0, label: "This Week" }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Pie */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
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
              <span className="text-2xl font-bold text-slate-900">77.8%</span>
              <span className="text-[10px] text-slate-500">Present</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
             {attendanceData.map((item, i) => (
               <div key={i} className="flex flex-col items-center text-center">
                 <div className="flex items-center gap-1 mb-1">
                   <div className="w-2 h-2 rounded-full" style={{backgroundColor: ATTENDANCE_COLORS[i]}}></div>
                   <span className="text-[10px] text-slate-600">{item.name}</span>
                 </div>
                 <span className="text-sm font-semibold">{item.value}%</span>
               </div>
             ))}
          </div>
        </div>

        {/* Leave Requests */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Leave Requests</h3>
          </div>
          <div className="space-y-4">
            {[
              { name: 'Sarah Wilson', dates: 'May 24 - May 25', days: '2 days' },
              { name: 'Michael Brown', dates: 'May 26', days: '1 day' },
              { name: 'David Smith', dates: 'May 27 - May 29', days: '3 days' },
            ].map((leave, i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg">
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
            ))}
          </div>
        </div>

        {/* Payroll Overview */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Payroll Overview</h3>
          <p className="text-xs text-slate-500 mb-6">This Month</p>
          <div className="mb-4">
            <p className="text-sm text-slate-500">Total Payroll</p>
            <div className="flex items-end gap-3">
              <h2 className="text-3xl font-bold text-slate-900">$42,560</h2>
              <span className="text-sm font-medium text-emerald-600 mb-1">+4.2%</span>
            </div>
          </div>
          <div className="h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={payrollData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <Tooltip cursor={{fill: '#f1f5f9'}} formatter={(val) => `$${val}`} />
                <Bar dataKey="value" fill="#60a5fa" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
