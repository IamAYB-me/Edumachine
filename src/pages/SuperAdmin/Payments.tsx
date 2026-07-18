import React from 'react';
import { DollarSign, ArrowUpRight, CreditCard, Download, Filter } from 'lucide-react';
import { KPICard } from '@/components/ui/KPICard';
import { cn } from '@/utils';
import { useCurrency } from '@/hooks/useCurrency';

export default function PaymentsManagement() {
  const { format } = useCurrency();

  const transactions = [
    { id: 'TXN-1001', school: 'Greenfield Intl', plan: 'Enterprise Plan', amount: 2500, date: 'Today, 09:00 AM', status: 'Completed' },
    { id: 'TXN-1002', school: 'Bluecrest Academy', plan: 'Standard Plan', amount: 1200, date: 'Yesterday', status: 'Pending' },
    { id: 'TXN-1003', school: 'Tech High School', plan: 'Enterprise Plan', amount: 2500, date: '2 days ago', status: 'Completed' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Subscription Payments</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Monitor all incoming subscription revenue and transaction history.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all">
          <Download className="w-4 h-4" />
          Export Ledger
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard title="Monthly Revenue" value={85400} isCurrency={true} icon={DollarSign} iconBgClass="bg-emerald-50" iconColorClass="text-emerald-600" />
        <KPICard title="Pending Payments" value={3200} isCurrency={true} icon={CreditCard} iconBgClass="bg-amber-50" iconColorClass="text-amber-600" />
        <KPICard title="Avg. Order Value" value={1850} isCurrency={true} icon={ArrowUpRight} iconBgClass="bg-blue-50" iconColorClass="text-blue-600" />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-slate-900 dark:text-white">Recent Transactions</h3>
          <button className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <Filter className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {transactions.map((tx) => (
            <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "p-2 rounded-xl",
                  tx.status === 'Completed' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                )}>
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{tx.school}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">{tx.plan} • {tx.id}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900 dark:text-white text-sm">{format(tx.amount)}</p>
                <p className="text-[10px] text-slate-400 font-medium">{tx.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
