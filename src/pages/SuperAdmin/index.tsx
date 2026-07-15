import React from 'react';
import { Building2, Users, DollarSign, LifeBuoy, TrendingUp, ShieldCheck, Globe, Activity } from 'lucide-react';
import { KPICard } from '@/components/ui/KPICard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useCurrency } from '@/hooks/useCurrency';
import { cn } from '@/utils';

const revenueData = [
  { name: 'Jan', revenue: 45000 },
  { name: 'Feb', revenue: 52000 },
  { name: 'Mar', revenue: 48000 },
  { name: 'Apr', revenue: 61000 },
  { name: 'May', revenue: 59000 },
  { name: 'Jun', revenue: 68000 },
  { name: 'Jul', revenue: 75000 },
  { name: 'Aug', revenue: 82000 },
  { name: 'Sep', revenue: 95000 },
];

const subscriptionData = [
  { name: 'Enterprise', value: 35 },
  { name: 'Professional', value: 45 },
  { name: 'Standard', value: 30 },
  { name: 'Basic', value: 18 },
];

const COLORS = ['#2563eb', '#8b5cf6', '#10b981', '#f59e0b'];

export default function SuperAdminDashboard() {
  const { format } = useCurrency();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Platform Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Global monitoring and health metrics for EduPlatform.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-800">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">System Healthy</span>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Total Schools" 
          value="128" 
          icon={Building2} 
          iconBgClass="bg-blue-50 dark:bg-blue-900/20"
          iconColorClass="text-blue-600 dark:text-blue-400"
          trend={{ value: 4.2, isPositive: true, label: "this month" }}
        />
        <KPICard 
          title="Total Users" 
          value="24,568" 
          icon={Users} 
          iconBgClass="bg-indigo-50 dark:bg-indigo-900/20"
          iconColorClass="text-indigo-600 dark:text-indigo-400"
          trend={{ value: 1.8, isPositive: true, label: "this month" }}
        />
        <KPICard 
          title="Monthly Revenue" 
          value={125680} 
          isCurrency={true}
          icon={DollarSign} 
          iconBgClass="bg-emerald-50 dark:bg-emerald-900/20"
          iconColorClass="text-emerald-600 dark:text-emerald-400"
          trend={{ value: 12.5, isPositive: true, label: "vs last month" }}
        />
        <KPICard 
          title="Support Tickets" 
          value="23" 
          icon={LifeBuoy} 
          iconBgClass="bg-rose-50 dark:bg-rose-900/20"
          iconColorClass="text-rose-600 dark:text-rose-400"
          trend={{ value: 5, isPositive: false, label: "open tickets" }}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Global Revenue Growth</h3>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-emerald-500">+12.5%</span>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                  tickFormatter={(value) => format(value).split('.')[0]} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#0f172a', color: '#fff' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 700 }}
                  formatter={(value: number) => [format(value), 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subscriptions Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 text-center">Plan Distribution</h3>
          <div className="flex-1 min-h-[250px] relative">
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
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">128</span>
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
        </div>
      </div>
      
      {/* Bottom Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Top Performing Schools</h3>
            <button className="text-xs font-bold text-blue-600 hover:underline">View Rankings</button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {[
              { name: 'Greenfield International School', rev: 12680, location: 'London, UK' },
              { name: 'Bright Future Academy', rev: 9450, location: 'New York, USA' },
              { name: 'Sunrise International School', rev: 8200, location: 'Dubai, UAE' },
            ].map((school, i) => (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                    {school.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{school.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{school.location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900 dark:text-white">{format(school.rev)}</p>
                  <p className="text-[10px] font-bold text-emerald-500 uppercase">Premium</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Platform Health</h3>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="p-6 space-y-6">
             <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
               <div className="flex items-center gap-3">
                 <Globe className="w-5 h-5 text-blue-500" />
                 <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Region: Global</span>
               </div>
               <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest rounded-full">Active</span>
             </div>
             
             <div className="space-y-4">
               <div>
                 <div className="flex justify-between items-center mb-2">
                   <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cloud Storage</span>
                   <span className="text-xs font-bold text-slate-900 dark:text-white">2.45 TB / 5 TB</span>
                 </div>
                 <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                   <div className="bg-blue-600 h-full rounded-full transition-all duration-1000" style={{ width: '49%' }}></div>
                 </div>
               </div>
               <div>
                 <div className="flex justify-between items-center mb-2">
                   <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Server Load</span>
                   <span className="text-xs font-bold text-slate-900 dark:text-white">24%</span>
                 </div>
                 <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                   <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: '24%' }}></div>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
