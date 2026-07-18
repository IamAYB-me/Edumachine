import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, Menu, Moon, Sun, X } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Link, useNavigate } from 'react-router-dom';

interface HeaderProps {
  userName: string;
  userRole: string;
  schoolName: string;
  avatarUrl?: string;
  onMenuToggle?: () => void;
}

const currencies = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'NGN', symbol: '₦' },
];

const mockNotifications = [
  { id: '1', title: 'New student enrolled', description: 'Adeola Ogunlami has been registered.', time: '2 min ago', read: false },
  { id: '2', title: 'Fee payment received', description: '₦120,000 payment from John Obi.', time: '15 min ago', read: false },
  { id: '3', title: 'Exam schedule published', description: 'Mid-term exam timetable is now live.', time: '1 hr ago', read: true },
  { id: '4', title: 'Teacher on leave', description: 'Mrs. Balogun requested sick leave.', time: '3 hrs ago', read: true },
];

export default function Header({ userName, userRole, schoolName, avatarUrl, onMenuToggle }: HeaderProps) {
  const { theme, toggleTheme, currency, setCurrency, globalSettings } = useSettingsStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const showCurrencySwitcher = user && ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT', 'PARENT', 'STUDENT', 'WARDEN'].includes(user.role);
  const displayName = user?.role === 'SUPER_ADMIN' ? globalSettings.appName : schoolName;
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const term = searchValue.trim().toLowerCase();
    if (!term) return;
    if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
      if (term.includes('student')) navigate('/admin/students');
      else if (term.includes('teacher')) navigate('/admin/teachers');
      else if (term.includes('class')) navigate('/admin/classes');
      else if (term.includes('exam')) navigate('/admin/exams');
      else if (term.includes('fee') || term.includes('finance')) navigate('/admin/finance');
      else if (term.includes('notice')) navigate('/admin/notices');
      else if (term.includes('parent')) navigate('/admin/parents');
      else if (term.includes('timetable')) navigate('/admin/timetable');
      else if (term.includes('result')) navigate('/admin/results');
    } else if (user?.role === 'TEACHER') {
      if (term.includes('class')) navigate('/teacher/classes');
      else if (term.includes('assignment')) navigate('/teacher/assignments');
      else if (term.includes('exam')) navigate('/teacher/exams');
      else if (term.includes('attendance')) navigate('/teacher/attendance');
    } else if (user?.role === 'STUDENT') {
      if (term.includes('course')) navigate('/student/courses');
      else if (term.includes('assignment')) navigate('/student/assignments');
      else if (term.includes('exam')) navigate('/student/exams');
      else if (term.includes('fee')) navigate('/student/fees');
      else if (term.includes('attendance')) navigate('/student/attendance');
    } else if (user?.role === 'PARENT') {
      if (term.includes('child')) navigate('/parent/children');
      else if (term.includes('fee')) navigate('/parent/fees');
      else if (term.includes('message')) navigate('/parent/messages');
      else if (term.includes('attendance')) navigate('/parent/attendance');
    }
    setSearchValue('');
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-10 transition-colors">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
          {displayName}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <form onSubmit={handleSearch} className="hidden md:flex items-center relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3" />
          <input
            type="text"
            placeholder="Search anything..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-64 transition-all dark:text-slate-200"
          />
        </form>

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

        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifications((prev) => !prev)}
            className="relative p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h3>
                <button onClick={() => setShowNotifications(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {mockNotifications.map((notif) => (
                  <div key={notif.id} className={`px-4 py-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${!notif.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                    <div className="flex items-start gap-3">
                      {!notif.read && <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{notif.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{notif.description}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{notif.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Link
          to="/profile"
          className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700 hover:opacity-80 transition-opacity"
        >
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{userName}</span>
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{userRole}</span>
          </div>
          <img
            src={avatarUrl || "https://ui-avatars.com/api/?name=" + encodeURIComponent(userName) + "&background=2563eb&color=fff"}
            alt={userName}
            className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm"
          />
        </Link>
      </div>
    </header>
  );
}
