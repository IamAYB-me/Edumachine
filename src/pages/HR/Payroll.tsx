import React, { useMemo, useState } from 'react';
import { Search, Filter, Plus, Download, Wallet, Users, TrendingUp, Clock, CreditCard, ChevronRight, FileText } from 'lucide-react';
import { cn } from '@/utils';
import { KPICard } from '@/components/ui/KPICard';
import { useCurrency } from '@/hooks/useCurrency';
import { useToastStore } from '@/store/useToastStore';
import { downloadTextFile } from '@/utils/fileHelpers';

export default function HRPayroll() {
  const { format } = useCurrency();
  const [searchTerm, setSearchTerm] = useState('');
  const [payrollSummary, setPayrollSummary] = useState([
    { department: 'Academic', staff: 84, total: 285600, status: 'Ready' as 'Ready' | 'Processing' | 'Draft' },
    { department: 'Administration', staff: 12, total: 42000, status: 'Ready' as 'Ready' | 'Processing' | 'Draft' },
    { department: 'Support Staff', staff: 22, total: 38500, status: 'Processing' as 'Ready' | 'Processing' | 'Draft' },
    { department: 'Security', staff: 8, total: 14400, status: 'Draft' as 'Ready' | 'Processing' | 'Draft' },
  ]);
  const showToast = useToastStore((state) => state.showToast);

  const filteredSummary = useMemo(() => {
    return payrollSummary.filter((dept) => dept.department.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [payrollSummary, searchTerm]);

  const handleSalaryReport = () => {
    const content = filteredSummary
      .map((dept) => `${dept.department}, Staff ${dept.staff}, Total ${format(dept.total)}, Status ${dept.status}`)
      .join('\n');
    downloadTextFile('hr-salary-report.txt', content);
    showToast({
      title: 'Salary report exported',
      description: `${filteredSummary.length} department payroll row(s) exported.`,
      variant: 'success',
    });
  };

  const handleDepartmentAction = (department: string) => {
    showToast({
      title: 'Department payroll opened',
      description: `${department} payroll detail is ready for review.`,
      variant: 'info',
    });
  };

  const handleApproveAllReady = () => {
    const readyCount = payrollSummary.filter((item) => item.status === 'Ready').length;
    setPayrollSummary((current) =>
      current.map((item) => (item.status === 'Ready' ? { ...item, status: 'Processing' } : item))
    );
    showToast({
      title: 'Ready payroll approved',
      description: `${readyCount} department payroll batch(es) moved to processing.`,
      variant: readyCount > 0 ? 'success' : 'warning',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Payroll Administration</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Oversee salary structures, benefits, and payroll approvals.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleSalaryReport} className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-all">
            <Download className="w-4 h-4" />
            Salary Report
          </button>
          <button
            onClick={() =>
              showToast({
                title: 'Configure salary structure',
                description: 'Opening the salary structure editor where you can define pay grades, allowances, and benefit tiers.',
                variant: 'info',
              })
            }
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Configure Structure
          </button>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Monthly Budget" 
          value={380500} 
          isCurrency={true}
          icon={Wallet} 
          iconBgClass="bg-blue-50 dark:bg-blue-900/20"
          iconColorClass="text-blue-600 dark:text-blue-400"
        />
        <KPICard 
          title="Active Contracts" 
          value="126" 
          icon={Users} 
          iconBgClass="bg-indigo-50 dark:bg-indigo-900/20"
          iconColorClass="text-indigo-600 dark:text-indigo-400"
        />
        <KPICard 
          title="Avg. Salary" 
          value={3020} 
          isCurrency={true}
          icon={TrendingUp} 
          iconBgClass="bg-emerald-50 dark:bg-emerald-900/20"
          iconColorClass="text-emerald-600 dark:text-emerald-400"
        />
        <KPICard 
          title="Next Payout" 
          value="7 Days" 
          icon={Clock} 
          iconBgClass="bg-amber-50 dark:bg-amber-900/20"
          iconColorClass="text-amber-600 dark:text-amber-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Departmental Breakdown</h3>
              <button onClick={() => showToast({ title: 'All departments loaded', description: 'Showing consolidated payroll controls for all departments. You can approve, edit, or export each batch.', variant: 'info' })} className="text-xs font-bold text-blue-600 hover:underline">Manage All</button>
            </div>
            
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSummary.map((dept, i) => (
                <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{dept.department}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{dept.staff} Staff Members</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{format(dept.total)}</p>
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest",
                        dept.status === 'Ready' ? "text-emerald-600" :
                        dept.status === 'Processing' ? "text-blue-600" : "text-slate-400"
                      )}>
                        {dept.status}
                      </span>
                    </div>
                    <button onClick={() => handleDepartmentAction(dept.department)} className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Quick Actions</h3>
            <div className="space-y-3">
              <button onClick={() => showToast({ title: 'Update salary structures', description: 'Launching the salary structure wizard to adjust pay grades, cost-of-living increments, and grade mappings.', variant: 'info' })} className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Update Structures</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
              </button>
              <button onClick={() => showToast({ title: 'Manage deduction rules', description: 'Opening the deduction rules panel to configure tax withholdings, loan repayments, and voluntary contributions.', variant: 'info' })} className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Deduction Rules</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
              </button>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-xl shadow-slate-900/20 border border-slate-800">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Total Disbursement</h3>
            <div className="space-y-2">
              <h2 className="text-4xl font-bold">{format(380500)}</h2>
              <p className="text-xs text-slate-400">Projected for July 2026 payroll run.</p>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-800">
              <button onClick={handleApproveAllReady} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-900/20">
                Approve All Ready
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
