import React from 'react';
import { GraduationCap, DollarSign, Calendar, CreditCard, Clock, FileText, BookOpen, CheckCircle } from 'lucide-react';
import { cn } from '@/utils';
import { useCurrency } from '@/hooks/useCurrency';
import { useNavigate } from 'react-router-dom';
import { useToastStore } from '@/store/useToastStore';
import { useAuthStore } from '@/store/useAuthStore';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { motion } from 'framer-motion';
import { AnimatedPage, AnimatedButton, StaggerContainer, StaggerItem, AnimatedProgress } from '@/components/ui/motion';

export default function ParentDashboard() {
  const { format } = useCurrency();
  const user = useAuthStore((state) => state.user);
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

    if (action === 'ptm') {
      showToast({
        title: 'PTM Scheduling',
        description: 'PTM scheduling is coming soon. You\'ll be able to book a meeting with your child\'s teachers.',
        variant: 'info',
      });
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
    <AnimatedPage>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex justify-between items-end"
        >
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name || 'Parent'}! 👋</h1>
            <p className="text-slate-500 text-sm mt-1">Here's what's happening with your children today.</p>
          </div>


        </motion.div>

        {/* Children Overview Cards */}
        <AnimatedCard delay={0} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
          <p className="text-slate-500 text-sm">No children profiles available yet.</p>
        </AnimatedCard>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Quick Access */}
          <AnimatedCard delay={0.08} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Quick Access</h3>
            <StaggerContainer className="grid grid-cols-3 gap-4">
              {[
                { name: 'Pay Fees', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', action: 'fees' },
                { name: 'View Results', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50', action: 'results' },
                { name: 'Report Card', icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-50', action: 'report' },
                { name: 'Homework', icon: BookOpen, color: 'text-amber-600', bg: 'bg-amber-50', action: 'homework' },
                { name: 'School Bus', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50', action: 'attendance' },
                { name: 'Book PTM', icon: Calendar, color: 'text-rose-600', bg: 'bg-rose-50', action: 'ptm' },
              ].map((action, i) => (
                <StaggerItem key={i} variant="scaleIn">
                  <AnimatedButton
                    onClick={() => handleQuickAccess(action.action)}
                    className="flex flex-col items-center gap-2 group w-full bg-transparent border-none p-0 cursor-pointer"
                  >
                    <div className={cn("p-4 rounded-xl transition-transform group-hover:scale-105", action.bg, action.color)}>
                      <action.icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-medium text-slate-700 text-center">{action.name}</span>
                  </AnimatedButton>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </AnimatedCard>

          {/* Attendance Overview */}
          <AnimatedCard delay={0.16} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Attendance Overview</h3>
              <span className="text-xs text-slate-500">This Month</span>
            </div>
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs">E</div>
                    <span className="text-sm font-medium text-slate-700">Emma Johnson</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">92%</span>
                </div>
                <AnimatedProgress value={92} colorClass="bg-emerald-500" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs">L</div>
                    <span className="text-sm font-medium text-slate-700">Liam Johnson</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">88%</span>
                </div>
                <AnimatedProgress value={88} colorClass="bg-emerald-500" />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="p-4 bg-emerald-50 rounded-lg flex gap-3 mt-4"
              >
                <div className="text-emerald-600 mt-0.5"><CheckCircle className="w-5 h-5" /></div>
                <p className="text-sm text-emerald-800">Great! Both of your children have good attendance this month.</p>
              </motion.div>
            </div>
          </AnimatedCard>

          {/* Fees Summary */}
          <AnimatedCard delay={0.24} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Fees Summary</h3>
              <AnimatedButton
                onClick={() => navigate('/parent/fees')}
                className="text-sm text-blue-600 font-medium bg-transparent border-none p-0 cursor-pointer"
              >
                View Details
              </AnimatedButton>
            </div>
            
            <div className="flex-1 flex flex-col justify-center mb-6">
              <p className="text-sm text-slate-500 mb-1">Total Payable</p>
              <h2 className="text-4xl font-bold text-slate-900 mb-6">{format(0)}</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="p-4 bg-slate-50 rounded-lg border border-slate-100"
                >
                  <p className="text-xs text-slate-500 mb-1">Total Paid</p>
                  <p className="text-lg font-bold text-emerald-600">{format(0)}</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="p-4 bg-rose-50 rounded-lg border border-rose-100"
                >
                  <p className="text-xs text-rose-600 mb-1">Balance</p>
                  <p className="text-lg font-bold text-rose-700">{format(0)}</p>
                </motion.div>
              </div>
            </div>

            <AnimatedButton
              onClick={() => navigate('/parent/fees', { state: { openPayment: true } })}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
            >
              <CreditCard className="w-5 h-5" />
              Make a Payment
            </AnimatedButton>
          </AnimatedCard>
        </div>

      </div>
    </AnimatedPage>
  );
}
