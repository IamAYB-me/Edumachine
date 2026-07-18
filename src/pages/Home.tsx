import { Link } from 'react-router-dom';
import { GraduationCap, Users, BookOpen, DollarSign, Calendar, Shield, ArrowRight } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';

const features = [
  { icon: Users, title: 'Student Management', description: 'Register, track, and manage student records with comprehensive profiles.' },
  { icon: BookOpen, title: 'Academic Programs', description: 'Organize curricula, classes, subjects, and faculty assignments.' },
  { icon: Calendar, title: 'Exam & Results', description: 'Schedule exams, record grades, and generate result sheets.' },
  { icon: DollarSign, title: 'Fee & Finance', description: 'Track fee payments, expenses, payroll, and financial reports.' },
  { icon: Shield, title: 'Role-Based Access', description: 'Granular permissions for admin, teachers, parents, and staff.' },
  { icon: GraduationCap, title: 'Multi-Level Support', description: 'Primary, Secondary, College, and University portal levels.' },
];

export default function Home() {
  const { globalSettings } = useSettingsStore();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          {globalSettings.logoUrl ? (
            <img src={globalSettings.logoUrl} alt="Logo" className="w-10 h-10 rounded-xl object-contain shadow-lg" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/30">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
          )}
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">{globalSettings.appName || 'EduMachine'}</h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">{globalSettings.appTagline || 'School Management System'}</p>
          </div>
        </div>
        <Link
          to="/login"
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all"
        >
          Sign In
          <ArrowRight className="w-4 h-4" />
        </Link>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight">
          Modern School Management
          <span className="block text-blue-600 dark:text-blue-400 mt-1">Made Simple</span>
        </h2>
        <p className="mt-6 text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          A comprehensive platform for managing students, teachers, academics, finances, and operations across any educational level.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/login"
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-xl shadow-blue-900/25 transition-all flex items-center gap-2"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-8 text-center">
        <p className="text-xs text-slate-400 dark:text-slate-500">{globalSettings.appName || 'EduMachine'} &copy; {new Date().getFullYear()}. All rights reserved.</p>
      </footer>
    </div>
  );
}
