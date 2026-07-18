import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/utils';
import { useCurrency } from '@/hooks/useCurrency';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColorClass?: string;
  iconBgClass?: string;
  isCurrency?: boolean;
  trend?: {
    value: number;
    label?: string;
    isPositive?: boolean;
  };
}

export function KPICard({ 
  title, 
  value, 
  icon: Icon, 
  iconColorClass = "text-blue-600", 
  iconBgClass = "bg-blue-50 dark:bg-blue-900/20", 
  isCurrency = false,
  trend 
}: KPICardProps) {
  const { format } = useCurrency();
  const displayValue = isCurrency ? format(value) : value;

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{displayValue}</h3>
        </div>
        <div className={cn("p-3 rounded-lg", iconBgClass)}>
          <Icon className={cn("w-6 h-6", iconColorClass)} />
        </div>
      </div>
      
      {trend && trend.value !== 0 && (
        <div className="mt-auto flex items-center gap-2">
          <span className={cn(
            "text-xs font-semibold px-2 py-1 rounded-full",
            trend.isPositive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
          )}>
            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
          </span>
          {trend.label && (
            <span className="text-xs text-slate-500 dark:text-slate-400">{trend.label}</span>
          )}
        </div>
      )}
    </div>
  );
}
