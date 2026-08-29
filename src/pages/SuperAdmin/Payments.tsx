import { useMemo } from 'react';
import { DollarSign, ArrowUpRight, CreditCard, Download, Filter } from 'lucide-react';
import { KPICard } from '@/components/ui/KPICard';
import { cn } from '@/utils';
import { useCurrency } from '@/hooks/useCurrency';
import { useDataStore } from '@/store/useDataStore';

const PLAN_PRICES: Record<string, number> = {
  Basic: 5000,
  Standard: 12000,
  Professional: 25000,
  Enterprise: 50000,
};

export default function PaymentsManagement() {
  const { format } = useCurrency();
  const { schools, plans } = useDataStore();

  const planPriceMap = useMemo(() => {
    const map: Record<string, number> = {};
    plans.forEach((p) => { map[p.name] = p.price; });
    return map;
  }, [plans]);

  const subscriptionEntries = useMemo(() => {
    return schools
      .filter((s) => s.status === 'Active')
      .map((s) => ({
        id: `SUB-${s.code}`,
        school: s.name,
        plan: `${s.subscriptionPlan} Plan`,
        amount: planPriceMap[s.subscriptionPlan] || PLAN_PRICES[s.subscriptionPlan] || 0,
        expiry: s.expiryDate,
        status: new Date(s.expiryDate) >= new Date() ? 'Active' : 'Expired',
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [schools, planPriceMap]);

  const totalRevenue = subscriptionEntries.reduce((sum, e) => sum + e.amount, 0);
  const activeSubscriptions = subscriptionEntries.filter((e) => e.status === 'Active').length;
  const avgOrderValue = subscriptionEntries.length > 0 ? Math.round(totalRevenue / subscriptionEntries.length) : 0;

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
        <KPICard title="Total Revenue" value={totalRevenue} isCurrency={true} icon={DollarSign} iconBgClass="bg-emerald-50" iconColorClass="text-emerald-600" />
        <KPICard title="Active Subscriptions" value={activeSubscriptions} icon={CreditCard} iconBgClass="bg-amber-50" iconColorClass="text-amber-600" />
        <KPICard title="Avg. Order Value" value={avgOrderValue} isCurrency={true} icon={ArrowUpRight} iconBgClass="bg-blue-50" iconColorClass="text-blue-600" />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-slate-900 dark:text-white">Subscription Records</h3>
          <button className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <Filter className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {subscriptionEntries.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-500">No subscription records yet.</p>
            <p className="text-xs text-slate-400 mt-1">Records will appear once schools register.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {subscriptionEntries.map((tx) => (
              <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-2 rounded-xl",
                    tx.status === 'Active' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                  )}>
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{tx.school}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">{tx.plan} &bull; {tx.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{format(tx.amount)}</p>
                  <p className="text-[10px] font-medium" style={{ color: tx.status === 'Active' ? '#16a34a' : '#d97706' }}>
                    Expires {tx.expiry}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}