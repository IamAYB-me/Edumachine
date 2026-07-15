import React from 'react';
import { Check, Zap, Shield, Rocket, Building2, Users } from 'lucide-react';
import { cn } from '@/utils';
import { useDataStore } from '@/store/useDataStore';
import { useCurrency } from '@/hooks/useCurrency';

export default function SubscriptionPlans() {
  const { plans } = useDataStore();
  const { format } = useCurrency();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Subscription Plans</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Configure and manage software subscription tiers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className={cn(
              "bg-white dark:bg-slate-900 rounded-2xl border p-6 flex flex-col transition-all hover:shadow-xl",
              plan.name === 'Professional' 
                ? "border-blue-500 dark:border-blue-500 ring-4 ring-blue-500/10 scale-105 relative z-10" 
                : "border-slate-200 dark:border-slate-800"
            )}
          >
            {plan.name === 'Professional' && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                Most Popular
              </div>
            )}
            
            <div className="mb-6">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                plan.name === 'Basic' ? "bg-slate-100 text-slate-600 dark:bg-slate-800" :
                plan.name === 'Standard' ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20" :
                plan.name === 'Professional' ? "bg-blue-100 text-blue-600 dark:bg-blue-900/20" :
                "bg-purple-100 text-purple-600 dark:bg-purple-900/20"
              )}>
                {plan.name === 'Basic' && <Shield className="w-6 h-6" />}
                {plan.name === 'Standard' && <Zap className="w-6 h-6" />}
                {plan.name === 'Professional' && <Rocket className="w-6 h-6" />}
                {plan.name === 'Enterprise' && <Building2 className="w-6 h-6" />}
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">{format(plan.price)}</span>
                <span className="text-slate-500 text-sm">/month</span>
              </div>
            </div>

            <div className="space-y-4 mb-8 flex-1">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                <Users className="w-4 h-4" />
                Up to {plan.studentsLimit.toLocaleString()} students
              </div>
              <div className="h-px bg-slate-100 dark:bg-slate-800" />
              {plan.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1 p-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-full">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">{feature}</span>
                </div>
              ))}
            </div>

            <button className={cn(
              "w-full py-3 rounded-xl text-sm font-bold transition-all",
              plan.name === 'Professional'
                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20 hover:bg-blue-700"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            )}>
              Edit Plan
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-blue-600 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-900/20">
        <div>
          <h3 className="text-2xl font-bold">Need a Custom Enterprise Solution?</h3>
          <p className="text-blue-100 mt-1">We offer tailor-made features for large school districts and universities.</p>
        </div>
        <button className="px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors whitespace-nowrap">
          Contact Sales Team
        </button>
      </div>
    </div>
  );
}
