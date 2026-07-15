import React from 'react';
import { Users, BedDouble, Key, Settings, AlertTriangle, Building, FileText, DollarSign } from 'lucide-react';
import { KPICard } from '@/components/ui/KPICard';
import { cn } from '@/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '@/hooks/useCurrency';
import { useToastStore } from '@/store/useToastStore';

const occupancyData = [
  { name: 'Occupied', value: 112 },
  { name: 'Available', value: 16 },
];
const OCCUPANCY_COLORS = ['#10b981', '#3b82f6'];

export default function HostelDashboard() {
  const navigate = useNavigate();
  const { format } = useCurrency();
  const showToast = useToastStore((state) => state.showToast);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, Hostel Warden 👋</h1>
          <p className="text-slate-500 text-sm mt-1">Here's the hostel overview.</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard 
          title="Total Students" 
          value="256" 
          icon={Users} 
          iconBgClass="bg-blue-50"
          iconColorClass="text-blue-600"
          trend={{ value: 0, label: "In Hostels" }}
        />
        <KPICard 
          title="Total Rooms" 
          value="128" 
          icon={BedDouble} 
          iconBgClass="bg-emerald-50"
          iconColorClass="text-emerald-600"
          trend={{ value: 0, label: "Across 4 Blocks" }}
        />
        <KPICard 
          title="Occupied Rooms" 
          value="112" 
          icon={Key} 
          iconBgClass="bg-emerald-50"
          iconColorClass="text-emerald-600"
          trend={{ value: 87.5, isPositive: true, label: "" }}
        />
        <KPICard 
          title="Available Rooms" 
          value="16" 
          icon={Key} 
          iconBgClass="bg-blue-50"
          iconColorClass="text-blue-600"
          trend={{ value: 12.5, isPositive: true, label: "" }}
        />
        <KPICard 
          title="Pending Fees" 
          value={format(4320)} 
          icon={DollarSign} 
          iconBgClass="bg-rose-50"
          iconColorClass="text-rose-600"
          trend={{ value: 0, label: "From 18 Students" }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Occupancy Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
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
              <span className="text-2xl font-bold text-slate-900">87.5%</span>
              <span className="text-xs text-slate-500">Occupied</span>
            </div>
          </div>
          <div className="flex flex-col gap-3 mt-4 px-4">
             {occupancyData.map((item, i) => (
               <div key={i} className="flex justify-between items-center text-sm">
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full" style={{backgroundColor: OCCUPANCY_COLORS[i]}}></div>
                   <span className="text-slate-600">{item.name} Rooms</span>
                 </div>
                 <span className="font-semibold text-slate-900">{item.value} ({Math.round((item.value/128)*100)}%)</span>
               </div>
             ))}
          </div>
        </div>

        {/* Students by Hostel */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Students by Hostel</h3>
          <div className="space-y-4">
            {[
              { name: 'Maple Hostel', count: 98 },
              { name: 'Oak Hostel', count: 72 },
              { name: 'Pine Hostel', count: 54 },
              { name: 'Cedar Hostel', count: 32 },
            ].map((hostel, i) => (
              <div key={i} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Building className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-slate-900 text-sm">{hostel.name}</span>
                </div>
                <span className="font-bold text-slate-700">{hostel.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Check-ins */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Recent Check-ins</h3>
            <button
              onClick={() => navigate('/hostel/students')}
              className="text-sm text-blue-600 font-medium hover:text-blue-700"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {[
              { name: 'Maple Wilson', room: 'Room 202, Maple Hostel', date: 'May 28, 2025' },
              { name: 'Daniel Brown', room: 'Room 305, Oak Hostel', date: 'May 23, 2025' },
              { name: 'William Smith', room: 'Room 102, Pine Hostel', date: 'May 20, 2025' },
            ].map((student, i) => (
              <div key={i} className="flex justify-between items-start pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">{student.name.charAt(0)}</div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{student.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{student.room}</p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 mt-1">{student.date}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maintenance Requests */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Maintenance Requests</h3>
          <div className="space-y-3">
             {[
               { issue: 'Fan not working', room: 'Room 205', hostel: 'Maple Hostel', priority: 'High', color: 'text-rose-700', bg: 'bg-rose-100' },
               { issue: 'Water leaking', room: 'Room 310', hostel: 'Oak Hostel', priority: 'Medium', color: 'text-amber-700', bg: 'bg-amber-100' },
               { issue: 'Light not working', room: 'Room 101', hostel: 'Pine Hostel', priority: 'Low', color: 'text-emerald-700', bg: 'bg-emerald-100' },
             ].map((req, i) => (
               <div key={i} className="flex justify-between items-center p-3 border border-slate-100 rounded-lg">
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
               </div>
             ))}
          </div>
        </div>

        {/* Fees Overview */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Hostel Fees Overview</h3>
            <button
              onClick={() =>
                showToast({
                  title: 'Fees overview ready',
                  description: 'Current hostel collections and pending balances are displayed in the selected currency.',
                  variant: 'info',
                })
              }
              className="text-sm text-blue-600 font-medium"
            >
              View Details
            </button>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <p className="text-xs font-medium text-emerald-800 mb-2">Collected (This Month)</p>
              <h3 className="text-2xl font-bold text-emerald-600 mb-2">{format(18750)}</h3>
              <span className="text-[10px] px-2 py-0.5 bg-emerald-200 text-emerald-800 rounded-full font-medium">+15.2%</span>
            </div>
            <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
              <p className="text-xs font-medium text-rose-800 mb-2">Pending</p>
              <h3 className="text-2xl font-bold text-rose-600 mb-2">{format(4320)}</h3>
              <span className="text-[10px] px-2 py-0.5 bg-rose-200 text-rose-800 rounded-full font-medium">-2.4%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
