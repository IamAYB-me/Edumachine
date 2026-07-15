import React from 'react';
import { Users, GraduationCap, DollarSign, Calendar, MessageSquare, CreditCard, Clock, FileText, BookOpen, CheckCircle, Bell, ShieldCheck } from 'lucide-react';
import { KPICard } from '@/components/ui/KPICard';
import { cn } from '@/utils';
import { useCurrency } from '@/hooks/useCurrency';
import { useNavigate } from 'react-router-dom';
import { useToastStore } from '@/store/useToastStore';

export default function ParentDashboard() {
  const { format } = useCurrency();
  const isFinanciallyCleared = false; // Mock data logic
  const navigate = useNavigate();
  const showToast = useToastStore((state) => state.showToast);

  const handleChildProfile = (childId: string, childName: string) => {
    navigate('/parent/children', { state: { childId } });
    showToast({
      title: 'Child profile opened',
      description: `${childName}'s profile is ready for review.`,
      variant: 'success',
    });
  };

  const handleQuickAccess = (action: string) => {
    if (action === 'fees') {
      navigate('/parent/fees');
      return;
    }

    if (action === 'messages') {
      navigate('/parent/messages');
      return;
    }

    if (action === 'attendance') {
      navigate('/parent/attendance');
      return;
    }

    navigate('/parent/children');
    showToast({
      title: 'Children overview opened',
      description:
        action === 'results'
          ? 'Review results and academic performance from your children overview.'
          : action === 'report'
            ? 'Report card details can be reviewed from the children overview page.'
            : action === 'homework'
              ? 'Homework tracking is available from the children overview page.'
              : 'The requested parent action is now available from the linked page.',
      variant: 'info',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, Mrs. Sarah Johnson! 👋</h1>
          <p className="text-slate-500 text-sm mt-1">Here's what's happening with your children today.</p>
        </div>

        {/* Financial Clearance Notice */}
        <div className={cn(
          "flex items-center gap-3 px-4 py-2 rounded-xl border animate-pulse shadow-sm",
          isFinanciallyCleared 
            ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400"
            : "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400"
        )}>
          {isFinanciallyCleared ? <ShieldCheck className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider">Financial Status</p>
            <p className="text-sm font-bold">{isFinanciallyCleared ? 'All Fees Cleared' : 'Outstanding Balance Found'}</p>
          </div>
        </div>
      </div>

      {/* Children Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-colors">
          <button
            onClick={() => handleChildProfile('4', 'Emma Johnson')}
            className="absolute top-6 right-6 text-blue-600 opacity-100 transition-opacity text-sm font-medium"
          >
            View Profile &rarr;
          </button>
          <div className="flex items-center gap-4 mb-6">
            <img src="https://ui-avatars.com/api/?name=Emma+Johnson&background=fdf4ff&color=9333ea" alt="Emma" className="w-16 h-16 rounded-full border-2 border-white shadow-sm" />
            <div>
              <h3 className="text-lg font-bold text-slate-900">Emma Johnson</h3>
              <p className="text-sm text-slate-500">Grade 6 - A</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Attendance</p>
              <p className="text-lg font-bold text-emerald-600">92%</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Average Grade</p>
              <p className="text-lg font-bold text-blue-600">A-</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Fees Balance</p>
              <p className="text-lg font-bold text-rose-600">{format(120.00)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-colors">
          <button
            onClick={() => handleChildProfile('2', 'Liam Johnson')}
            className="absolute top-6 right-6 text-blue-600 opacity-100 transition-opacity text-sm font-medium"
          >
            View Profile &rarr;
          </button>
          <div className="flex items-center gap-4 mb-6">
            <img src="https://ui-avatars.com/api/?name=Liam+Johnson&background=eff6ff&color=2563eb" alt="Liam" className="w-16 h-16 rounded-full border-2 border-white shadow-sm" />
            <div>
              <h3 className="text-lg font-bold text-slate-900">Liam Johnson</h3>
              <p className="text-sm text-slate-500">Grade 3 - B</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Attendance</p>
              <p className="text-lg font-bold text-emerald-600">88%</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Average Grade</p>
              <p className="text-lg font-bold text-blue-600">B+</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Fees Balance</p>
              <p className="text-lg font-bold text-emerald-600">{format(0.00)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Access */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Quick Access</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { name: 'Pay Fees', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', action: 'fees' },
              { name: 'View Results', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50', action: 'results' },
              { name: 'Report Card', icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-50', action: 'report' },
              { name: 'Homework', icon: BookOpen, color: 'text-amber-600', bg: 'bg-amber-50', action: 'homework' },
              { name: 'School Bus', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50', action: 'attendance' },
              { name: 'Book PTM', icon: Calendar, color: 'text-rose-600', bg: 'bg-rose-50', action: 'messages' },
            ].map((action, i) => (
              <button key={i} onClick={() => handleQuickAccess(action.action)} className="flex flex-col items-center gap-2 group">
                <div className={cn("p-4 rounded-xl transition-transform group-hover:scale-105", action.bg, action.color)}>
                  <action.icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-slate-700 text-center">{action.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Attendance Overview */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Attendance Overview</h3>
            <span className="text-xs text-slate-500">This Month</span>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs">E</div>
                  <span className="text-sm font-medium text-slate-700">Emma Johnson</span>
                </div>
                <span className="text-sm font-bold text-slate-900">92%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs">L</div>
                  <span className="text-sm font-medium text-slate-700">Liam Johnson</span>
                </div>
                <span className="text-sm font-bold text-slate-900">88%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '88%' }}></div>
              </div>
            </div>
            
            <div className="p-4 bg-emerald-50 rounded-lg flex gap-3 mt-4">
              <div className="text-emerald-600 mt-0.5"><CheckCircle className="w-5 h-5" /></div>
              <p className="text-sm text-emerald-800">Great! Both of your children have good attendance this month.</p>
            </div>
          </div>
        </div>

        {/* Fees Summary */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Fees Summary</h3>
            <button
              onClick={() => navigate('/parent/fees')}
              className="text-sm text-blue-600 font-medium"
            >
              View Details
            </button>
          </div>
          
          <div className="flex-1 flex flex-col justify-center mb-6">
            <p className="text-sm text-slate-500 mb-1">Total Payable</p>
            <h2 className="text-4xl font-bold text-slate-900 mb-6">{format(1560.00)}</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Total Paid</p>
                <p className="text-lg font-bold text-emerald-600">{format(1440.00)}</p>
              </div>
              <div className="p-4 bg-rose-50 rounded-lg border border-rose-100">
                <p className="text-xs text-rose-600 mb-1">Balance</p>
                <p className="text-lg font-bold text-rose-700">{format(120.00)}</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/parent/fees', { state: { openPayment: true } })}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
          >
            <CreditCard className="w-5 h-5" />
            Make a Payment
          </button>
        </div>
      </div>

    </div>
  );
}
