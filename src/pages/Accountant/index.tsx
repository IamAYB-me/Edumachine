import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, FileText, CreditCard, Receipt, Wallet } from 'lucide-react';
import { KPICard } from '@/components/ui/KPICard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useCurrency } from '@/hooks/useCurrency';
import { cn } from '@/utils';
import { useNavigate } from 'react-router-dom';

const cashFlowData = [
  { name: 'Jan', in: 45000, out: 28000 },
  { name: 'Feb', in: 52000, out: 30000 },
  { name: 'Mar', in: 48000, out: 29000 },
  { name: 'Apr', in: 61000, out: 32000 },
  { name: 'May', in: 59000, out: 34000 },
  { name: 'Jun', in: 68000, out: 35000 },
];

export default function AccountantDashboard() {
  const { format } = useCurrency();
  const navigate = useNavigate();
  const handleGenerateReport = () => {
    navigate('/accountant/fees');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back, Finance Team 👋</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Here's the financial overview for the current academic year.</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Total Revenue" 
          value={845250} 
          isCurrency={true}
          icon={TrendingUp} 
          iconBgClass="bg-emerald-50 dark:bg-emerald-900/20"
          iconColorClass="text-emerald-600 dark:text-emerald-400"
          trend={{ value: 12.5, isPositive: true, label: "vs last year" }}
        />
        <KPICard 
          title="Total Expenses" 
          value={324100} 
          isCurrency={true}
          icon={TrendingDown} 
          iconBgClass="bg-rose-50 dark:bg-rose-900/20"
          iconColorClass="text-rose-600 dark:text-rose-400"
          trend={{ value: 4.2, isPositive: false, label: "vs last year" }}
        />
        <KPICard 
          title="Net Profit" 
          value={521150} 
          isCurrency={true}
          icon={DollarSign} 
          iconBgClass="bg-blue-50 dark:bg-blue-900/20"
          iconColorClass="text-blue-600 dark:text-blue-400"
          trend={{ value: 8.4, isPositive: true, label: "Margin: 61%" }}
        />
        <KPICard 
          title="Pending Receivables" 
          value={45800} 
          isCurrency={true}
          icon={FileText} 
          iconBgClass="bg-amber-50 dark:bg-amber-900/20"
          iconColorClass="text-amber-600 dark:text-amber-400"
          trend={{ value: 0, label: "From 142 Students" }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Cash Flow (Last 6 Months)</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Inflow</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Outflow</span>
              </div>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} tickFormatter={(val) => format(val)} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc', opacity: 0.5 }} 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#0f172a', color: '#fff' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 700 }}
                  formatter={(val: number) => [format(val), 'Amount']} 
                />
                <Bar dataKey="in" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={30} />
                <Bar dataKey="out" fill="#fb7185" radius={[6, 6, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions & Summaries */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Financial Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => navigate('/accountant/fees')}
                className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-emerald-200 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all gap-2 group"
              >
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                  <Receipt className="w-6 h-6 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Record Fee</span>
              </button>
              <button 
                onClick={() => navigate('/accountant/expenses')}
                className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-rose-200 hover:bg-rose-50/50 dark:hover:bg-rose-900/10 transition-all gap-2 group"
              >
                <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
                  <CreditCard className="w-6 h-6 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Add Expense</span>
              </button>
              <button 
                onClick={() => navigate('/accountant/payroll')}
                className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all gap-2 group"
              >
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Run Payroll</span>
              </button>
              <button
                onClick={handleGenerateReport}
                className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-200 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all gap-2 group"
              >
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                  <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Generate Report</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Expense Breakdown</h3>
            <div className="space-y-6">
              {[
                { label: 'Staff Salaries', value: 65, color: 'bg-blue-500' },
                { label: 'Infrastructure', value: 20, color: 'bg-amber-500' },
                { label: 'Events & Activities', value: 10, color: 'bg-purple-500' },
                { label: 'Miscellaneous', value: 5, color: 'bg-slate-400' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-slate-500 uppercase tracking-wider">{item.label}</span>
                    <span className="text-slate-900 dark:text-white">{item.value}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-1000", item.color)} style={{ width: `${item.value}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Recent Transactions</h3>
          <button onClick={() => navigate('/accountant/fees')} className="text-xs font-bold text-blue-600 hover:underline">View All Records</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                <th className="py-4 px-6">Transaction ID</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Description</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6 text-right">Amount</th>
                <th className="py-4 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
              {[
                { id: 'TXN-8923', date: 'Oct 24, 2025', desc: 'Tuition Fee - Emma Johnson', cat: 'Income', amount: 1200.00, status: 'Completed', isPos: true },
                { id: 'TXN-8922', date: 'Oct 24, 2025', desc: 'Library Books Purchase', cat: 'Expense', amount: 450.00, status: 'Completed', isPos: false },
                { id: 'TXN-8921', date: 'Oct 23, 2025', desc: 'Transport Fee - Liam Smith', cat: 'Income', amount: 150.00, status: 'Pending', isPos: true, pending: true },
                { id: 'TXN-8920', date: 'Oct 23, 2025', desc: 'Electricity Bill Payment', cat: 'Expense', amount: 890.50, status: 'Completed', isPos: false },
                { id: 'TXN-8919', date: 'Oct 22, 2025', desc: 'Tuition Fee - Noah Williams', cat: 'Income', amount: 1200.00, status: 'Completed', isPos: true },
              ].map((txn, i) => (
                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="py-4 px-6 font-mono text-[10px] font-bold text-slate-500">{txn.id}</td>
                  <td className="py-4 px-6 text-slate-500 text-xs font-medium">{txn.date}</td>
                  <td className="py-4 px-6 font-bold text-slate-700 dark:text-slate-300">{txn.desc}</td>
                  <td className="py-4 px-6">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{txn.cat}</span>
                  </td>
                  <td className={`py-4 px-6 text-right font-bold ${txn.isPos ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {txn.isPos ? '+' : '-'}{format(txn.amount)}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                      txn.pending 
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-100 dark:border-amber-800" 
                        : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800"
                    )}>
                      {txn.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
