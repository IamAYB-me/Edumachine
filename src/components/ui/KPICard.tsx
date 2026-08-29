import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform, type Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
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
  delay?: number;
  to?: string;
  onClick?: () => void;
  trend?: {
    value: number;
    label?: string;
    isPositive?: boolean;
  };
}

const kpiVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay,
      duration: 0.45,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

function AnimatedNumber({ value, isCurrency, format }: { value: number; isCurrency: boolean; format: (v: number) => string }) {
  const spring = useSpring(0, { stiffness: 80, damping: 20 });
  const display = useTransform(spring, (latest) =>
    isCurrency ? format(Math.round(latest)) : Math.round(latest).toLocaleString()
  );
  const [displayValue, setDisplayValue] = useState(isCurrency ? format(0) : '0');

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(() => {
    const unsubscribe = display.on('change', (latest) => {
      setDisplayValue(latest);
    });
    return unsubscribe;
  }, [display]);

  return <>{displayValue}</>;
}

export function KPICard({
  title,
  value,
  icon: Icon,
  iconColorClass = "text-blue-600",
  iconBgClass = "bg-blue-50 dark:bg-blue-900/20",
  isCurrency = false,
  delay = 0,
  to,
  onClick,
  trend
}: KPICardProps) {
  const { format } = useCurrency();
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) || 0 : value;
  const hasNumericValue = typeof value === 'number' || /^\d[\d,.]*$/.test(String(value).replace(/[^0-9.-]/g, ''));
  const isClickable = Boolean(to) || Boolean(onClick);

  const card = (
    <motion.div
      initial="hidden"
      animate="visible"
      custom={delay}
      variants={kpiVariants}
      whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.04)' }}
      whileTap={{ scale: isClickable ? 0.97 : 1 }}
      onClick={onClick}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        "bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col transition-colors",
        isClickable
          ? "cursor-pointer hover:border-blue-400/60 dark:hover:border-blue-500/60 group"
          : "cursor-default"
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            {hasNumericValue && numericValue !== 0 ? (
              <AnimatedNumber value={numericValue} isCurrency={isCurrency} format={format} />
            ) : (
              value
            )}
          </h3>
        </div>
        <motion.div
          whileHover={{ rotate: 12, scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          className={cn("p-3 rounded-lg", iconBgClass)}
        >
          <Icon className={cn("w-6 h-6", iconColorClass)} />
        </motion.div>
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

      {isClickable && (
        <div className="mt-auto pt-3 text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          View details
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}
    </motion.div>
  );

  if (to) {
    return <Link to={to} className="block h-full">{card}</Link>;
  }

  return card;
}
