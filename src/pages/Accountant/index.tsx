import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown, FileText, CreditCard, Receipt, Wallet } from 'lucide-react';
import { KPICard } from '@/components/ui/KPICard';
import { useCurrency } from '@/hooks/useCurrency';
import { cn } from '@/utils';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '@/store/useDataStore';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { AnimatedPage, StaggerContainer, StaggerItem, AnimatedButton, AnimatedProgress } from '@/components/ui/motion';

export default function AccountantDashboard() {
  const { format } = useCurrency();
  const navigate = useNavigate();
  const feeRecords = useDataStore((s) => s.feeRecords);
  const expenses = useDataStore((s) => s.expenses);
  const payroll = useDataStore((s) => s.payroll);

  const totalRevenue = feeRecords.filter(f => f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0) + payroll.reduce((sum, p) => sum + p.net, 0);
  const netProfit = totalRevenue - totalExpenses;
  const pendingReceivables = feeRecords.filter(f => f.status === 'Pending' || f.status === 'Partial').reduce((sum, f) => sum + f.amount, 0);

  const recentTransactions = [
    ...feeRecords.filter(f => f.status === 'Paid').slice(0, 5).map(f => ({
      id: f.id.slice(0, 12),
      date: f.date,
      desc: `Fee Payment - ${f.studentName}`,
      amount: f.amount,
      isPos: true,
      pending: false,
    })),
    ...expenses.slice(0, 5).map(e => ({
      id: e.id.slice(0, 12),
      date: e.date,
      desc: e.title,
      amount: e.amount,
      isPos: false,
      pending: e.status === 'Pending',
    })),
  ].slice(0, 5);

  const handleGenerateReport = () => {
    navigate('/accountant/fees');
  };

  return (
    <AnimatedPage className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex justify-between items-end"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back, Finance Team 👋</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Here's the financial overview for the current academic year.</p>
        </div>
      </motion.div>

      {/* KPIs */}
      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" staggerDelay={0.08}>
        <StaggerItem>
          <KPICard
            title="Total Revenue"
            value={totalRevenue}
            isCurrency={true}
            icon={TrendingUp}
            iconBgClass="bg-emerald-50 dark:bg-emerald-900/20"
            iconColorClass="text-emerald-600 dark:text-emerald-400"
            to="/accountant/fees"
            delay={0}
          />
        </StaggerItem>
        <StaggerItem>
          <KPICard
            title="Total Expenses"
            value={totalExpenses}
            isCurrency={true}
            icon={TrendingDown}
            iconBgClass="bg-rose-50 dark:bg-rose-900/20"
            iconColorClass="text-rose-600 dark:text-rose-400"
            to="/accountant/expenses"
            delay={0.08}
          />
        </StaggerItem>
        <StaggerItem>
          <KPICard
            title="Net Profit"
            value={netProfit}
            isCurrency={true}
            icon={DollarSign}
            iconBgClass="bg-blue-50 dark:bg-blue-900/20"
            iconColorClass="text-blue-600 dark:text-blue-400"
            to="/accountant/fees"
            delay={0.16}
          />
        </StaggerItem>
        <StaggerItem>
          <KPICard
            title="Pending Receivables"
            value={pendingReceivables}
            isCurrency={true}
            icon={FileText}
            iconBgClass="bg-amber-50 dark:bg-amber-900/20"
            iconColorClass="text-amber-600 dark:text-amber-400"
            to="/accountant/fees"
            delay={0.24}
          />
        </StaggerItem>
      </StaggerContainer>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expense Breakdown */}
        <AnimatedCard delay={0.3} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Expense Breakdown</h3>
          <div className="space-y-6">
            {[
              { label: 'Staff Salaries', amount: payroll.reduce((sum, p) => sum + p.net, 0), color: 'bg-blue-500' },
              { label: 'Other Expenses', amount: expenses.reduce((sum, e) => sum + e.amount, 0), color: 'bg-amber-500' },
            ].map((item) => {
              const total = totalExpenses || 1;
              const pct = Math.round((item.amount / total) * 100);
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-slate-500 uppercase tracking-wider">{item.label}</span>
                    <span className="text-slate-900 dark:text-white">{format(item.amount)} ({pct}%)</span>
                  </div>
                  <AnimatedProgress value={pct} colorClass={item.color} height="h-1.5" />
                </motion.div>
              );
            })}
          </div>
        </AnimatedCard>

        {/* Quick Actions & Summaries */}
        <div className="space-y-6">
          <AnimatedCard delay={0.4} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Financial Actions</h3>
            <StaggerContainer className="grid grid-cols-2 gap-4" staggerDelay={0.06}>
              <StaggerItem variant="scaleIn">
                <AnimatedButton
                  onClick={() => navigate('/accountant/fees')}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-emerald-200 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all gap-2 group w-full"
                >
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                    <Receipt className="w-6 h-6 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Record Fee</span>
                </AnimatedButton>
              </StaggerItem>
              <StaggerItem variant="scaleIn">
                <AnimatedButton
                  onClick={() => navigate('/accountant/expenses')}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-rose-200 hover:bg-rose-50/50 dark:hover:bg-rose-900/10 transition-all gap-2 group w-full"
                >
                  <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
                    <CreditCard className="w-6 h-6 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Add Expense</span>
                </AnimatedButton>
              </StaggerItem>
              <StaggerItem variant="scaleIn">
                <AnimatedButton
                  onClick={() => navigate('/accountant/payroll')}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all gap-2 group w-full"
                >
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Run Payroll</span>
                </AnimatedButton>
              </StaggerItem>
              <StaggerItem variant="scaleIn">
                <AnimatedButton
                  onClick={handleGenerateReport}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-200 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all gap-2 group w-full"
                >
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                    <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Generate Report</span>
                </AnimatedButton>
              </StaggerItem>
            </StaggerContainer>
          </AnimatedCard>
        </div>
      </div>

      {/* Recent Transactions */}
      <AnimatedCard delay={0.5} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Recent Transactions</h3>
          <AnimatedButton onClick={() => navigate('/accountant/fees')} className="text-xs font-bold text-blue-600 hover:underline">
            View All Records
          </AnimatedButton>
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
              {recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-slate-400">No transactions yet</td>
                </tr>
              ) : recentTransactions.map((txn, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + i * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group"
                >
                  <td className="py-4 px-6 font-mono text-[10px] font-bold text-slate-500">{txn.id}</td>
                  <td className="py-4 px-6 text-slate-500 text-xs font-medium">{txn.date}</td>
                  <td className="py-4 px-6 font-bold text-slate-700 dark:text-slate-300">{txn.desc}</td>
                  <td className="py-4 px-6">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{txn.isPos ? 'Income' : 'Expense'}</span>
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
                      {txn.pending ? 'Pending' : 'Completed'}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </AnimatedCard>
    </AnimatedPage>
  );
}
