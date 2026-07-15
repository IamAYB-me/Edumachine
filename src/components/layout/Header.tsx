import React from 'react';
import { Bell, Search, Menu, Moon, Sun, DollarSign, User as UserIcon } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Link } from 'react-router-dom';

interface HeaderProps {
  userName: string;
  userRole: string;
  schoolName: string;
  avatarUrl?: string;
}

const currencies = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'NGN', symbol: '₦' },
];

export default function Header({ userName, userRole, schoolName, avatarUrl }: HeaderProps) {
  const { theme, toggleTheme, currency, setCurrency, globalSettings } = useSettingsStore();
  const { user } = useAuthStore();

  const showCurrencySwitcher = user && ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT', 'PARENT', 'STUDENT', 'WARDEN'].includes(user.role);
  const displayName = user?.role === 'SUPER_ADMIN' ? globalSettings.appName : schoolName;

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-10 transition-colors">
      <div className="flex items-center gap-4">
        <button className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden">
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
          {displayName}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Search */}
        <div className="hidden md:flex items-center relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3" />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-64 transition-all dark:text-slate-200"
          />
        </div>

        {/* Currency Switcher */}
        {showCurrencySwitcher && (
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <select 
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-600 dark:text-slate-300 focus:outline-none px-2 cursor-pointer"
            >
              {currencies.map(c => (
                <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
              ))}
            </select>
          </div>
        )}

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <button className="relative p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
        </button>

        {/* Profile */}
        <Link 
          to="/profile"
          className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700 hover:opacity-80 transition-opacity"
        >
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{userName}</span>
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{userRole}</span>
          </div>
          <img 
            src={avatarUrl || "https://ui-avatars.com/api/?name=" + userName.replace(' ', '+') + "&background=2563eb&color=fff"} 
            alt={userName} 
            className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm"
          />
        </Link>
      </div>
    </header>
  );
}
