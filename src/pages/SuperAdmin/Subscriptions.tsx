import React, { useState } from 'react';
import { Check, Zap, Shield, Rocket, Building2, Users, X } from 'lucide-react';
import { cn } from '@/utils';
import { useDataStore } from '@/store/useDataStore';
import { useCurrency } from '@/hooks/useCurrency';
import { useToastStore } from '@/store/useToastStore';

export default function SubscriptionPlans() {
  const { plans, updatePlan } = useDataStore();
  const { format } = useCurrency();
  const showToast = useToastStore((s) => s.showToast);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editName, setEditName] = useState<string>('');
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editStudentsLimit, setEditStudentsLimit] = useState<number>(0);
  const [editFeatures, setEditFeatures] = useState<string>('');

  const handleOpenEdit = (plan: typeof plans[number]) => {
    setEditName(plan.name);
    setEditPrice(plan.price);
    setEditStudentsLimit(plan.studentsLimit);
    setEditFeatures(plan.features.join('\n'));
    setIsModalOpen(true);
  };

  const handleSave = () => {
    const plan = plans.find((p) => p.name === editName);
    if (!plan) return;

    updatePlan(plan.id, {
      price: editPrice,
      studentsLimit: editStudentsLimit,
      features: editFeatures.split('\n').map((f) => f.trim()).filter(Boolean),
    });

    showToast({ title: 'Plan Updated', description: `${editName} plan has been updated successfully.`, variant: 'success' });
    setIsModalOpen(false);
  };

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

            <button
              onClick={() => handleOpenEdit(plan)}
              className={cn(
                "w-full py-3 rounded-xl text-sm font-bold transition-all",
                plan.name === 'Professional'
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20 hover:bg-blue-700"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              )}
            >
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-lg flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Edit {editName} Plan</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Update pricing, limits, and features for this subscription tier.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Monthly Price</label>
                <input
                  type="number"
                  min="0"
                  value={editPrice}
                  onChange={(e) => setEditPrice(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Students Limit</label>
                <input
                  type="number"
                  min="0"
                  value={editStudentsLimit}
                  onChange={(e) => setEditStudentsLimit(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Features (one per line)</label>
                <textarea
                  rows={6}
                  value={editFeatures}
                  onChange={(e) => setEditFeatures(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white text-sm resize-none"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-3 justify-end flex-shrink-0">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
