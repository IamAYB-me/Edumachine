import React, { useState, useMemo } from 'react';
import { Search, Filter, Plus, Wallet, Download, Users, TrendingUp, Clock, ArrowUpRight, X, Edit2 } from 'lucide-react';
import { cn } from '@/utils';
import { KPICard } from '@/components/ui/KPICard';
import { useCurrency } from '@/hooks/useCurrency';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useDataStore, Payroll } from '@/store/useDataStore';
import { useToastStore } from '@/store/useToastStore';
import { downloadTextFile } from '@/utils/fileHelpers';

export default function AccountantPayroll() {
  const { format } = useCurrency();
  const { payroll, addPayroll, updatePayroll, staff } = useDataStore();
  const showToast = useToastStore((state) => state.showToast);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<'All' | 'Academic' | 'Non-Academic' | 'Admin'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState<Payroll | null>(null);

  const [formData, setFormData] = useState<Omit<Payroll, 'id'>>({
    staffId: '',
    staffName: '',
    role: '',
    category: 'Academic',
    basic: 0,
    bonus: 0,
    tax: 0,
    net: 0,
    status: 'Pending',
    month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
  });

  const handleOpenModal = (pay?: Payroll) => {
    if (pay) {
      setEditingPayroll(pay);
      setFormData({ ...pay });
    } else {
      setEditingPayroll(null);
      setFormData({
        staffId: '',
        staffName: '',
        role: '',
        category: 'Academic',
        basic: 0,
        bonus: 0,
        tax: 0,
        net: 0,
        status: 'Pending',
        month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
      });
    }
    setIsModalOpen(true);
  };

  const calculateNet = (basic: number, bonus: number, tax: number) => {
    return basic + bonus - tax;
  };

  const handleFormChange = (updates: Partial<typeof formData>) => {
    const newData = { ...formData, ...updates };
    if ('basic' in updates || 'bonus' in updates || 'tax' in updates) {
      newData.net = calculateNet(newData.basic, newData.bonus, newData.tax);
    }
    if ('staffId' in updates) {
      const selectedStaff = staff.find(s => s.id === updates.staffId);
      if (selectedStaff) {
        newData.staffName = selectedStaff.name;
        newData.role = selectedStaff.role;
        newData.category = selectedStaff.category;
      }
    }
    setFormData(newData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPayroll) {
      updatePayroll(editingPayroll.id, formData);
    } else {
      addPayroll(formData);
    }
    setIsModalOpen(false);
  };

  const filteredPayroll = useMemo(() => {
    return payroll.filter(pay => {
      const matchesSearch = pay.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pay.role.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = departmentFilter === 'All' || pay.category === departmentFilter;
      return matchesSearch && matchesDept;
    });
  }, [payroll, searchTerm, departmentFilter]);

  const handleBulkPayslipExport = () => {
    if (filteredPayroll.length === 0) {
      showToast({
        title: 'No payroll records',
        description: 'There are no payroll entries available for bulk payslip export.',
        variant: 'warning',
      });
      return;
    }

    const content = [
      'EduPlatform Payroll Payslip Bulk Export',
      `Generated: ${new Date().toLocaleString()}`,
      '',
      ...filteredPayroll.map((pay) =>
        [
          `Staff: ${pay.staffName}`,
          `Role: ${pay.role}`,
          `Category: ${pay.category}`,
          `Month: ${pay.month}`,
          `Basic Salary: ${format(pay.basic)}`,
          `Bonus: ${format(pay.bonus)}`,
          `Tax / Deductions: ${format(pay.tax)}`,
          `Net Pay: ${format(pay.net)}`,
          `Status: ${pay.status}`,
          '---',
        ].join('\n')
      ),
    ].join('\n');

    downloadTextFile(`payslip-bulk-${new Date().toISOString().split('T')[0]}.txt`, content);
    showToast({
      title: 'Bulk payslip exported',
      description: `${filteredPayroll.length} payroll record(s) exported successfully.`,
      variant: 'success',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Payroll Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage staff salaries, bonuses, and tax deductions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleBulkPayslipExport} className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-all">
            <Download className="w-4 h-4" />
            Payslip Bulk
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-900/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Run New Payroll
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <KPICard 
              title="Total Monthly Payroll" 
              value={45250} 
              isCurrency={true}
              icon={Wallet} 
              iconBgClass="bg-indigo-50 dark:bg-indigo-900/20"
              iconColorClass="text-indigo-600 dark:text-indigo-400"
            />
            <KPICard 
              title="Staff Count" 
              value="126" 
              icon={Users} 
              iconBgClass="bg-blue-50 dark:bg-blue-900/20"
              iconColorClass="text-blue-600 dark:text-blue-400"
            />
            <KPICard 
              title="Tax Liabilities" 
              value={4200} 
              isCurrency={true}
              icon={ArrowUpRight} 
              iconBgClass="bg-rose-50 dark:bg-rose-900/20"
              iconColorClass="text-rose-600 dark:text-rose-400"
            />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/50">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search staff..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all dark:text-white"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setDepartmentFilter(current => {
                      const order = ['All', 'Academic', 'Non-Academic', 'Admin'] as const;
                      return order[(order.indexOf(current) + 1) % order.length];
                    });
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all"
                >
                  <Filter className="w-4 h-4" />
                  {departmentFilter}
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    <th className="py-4 px-6">Staff Name / Role</th>
                    <th className="py-4 px-6">Basic Salary</th>
                    <th className="py-4 px-6">Bonus</th>
                    <th className="py-4 px-6">Tax / Ded.</th>
                    <th className="py-4 px-6 text-right">Net Pay</th>
                    <th className="py-4 px-6 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredPayroll.map((pay, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            pay.category === 'Academic' ? "bg-indigo-500" : "bg-amber-500"
                          )} title={pay.category} />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{pay.staffName}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{pay.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-400 font-medium">{format(pay.basic)}</td>
                      <td className="py-4 px-6 text-emerald-600 font-medium">+{format(pay.bonus)}</td>
                      <td className="py-4 px-6 text-rose-500 font-medium">-{format(pay.tax)}</td>
                      <td className="py-4 px-6 text-right font-bold text-slate-900 dark:text-white">{format(pay.net)}</td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                            pay.status === 'Paid' ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                            pay.status === 'Processing' ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                            "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          )}>
                            {pay.status}
                          </span>
                          <button 
                            onClick={() => handleOpenModal(pay)}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded-md transition-colors"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Analysis Sidebar */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 text-center">Payroll Trend</h3>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Feb', amount: 42000 },
                  { name: 'Mar', amount: 42500 },
                  { name: 'Apr', amount: 43000 },
                  { name: 'May', amount: 42800 },
                  { name: 'Jun', amount: 44000 },
                  { name: 'Jul', amount: payroll.reduce((acc, p) => acc + p.net, 0) },
                ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} tickFormatter={(val) => format(val).split('.')[0]} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc', opacity: 0.5 }} 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#0f172a', color: '#fff' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 700 }}
                    formatter={(val: number) => [format(val), 'Total']} 
                  />
                  <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 mb-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Analysis</span>
              </div>
              <p className="text-xs text-indigo-600 dark:text-indigo-300 leading-relaxed font-medium">
                Payroll costs for <span className="font-bold">{formData.month}</span> are being processed.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Upcoming Tasks
            </h3>
            <div className="space-y-4">
              {[
                { task: 'August Salary Batch', date: 'July 25', status: 'Upcoming' },
                { task: 'Tax Filing Q3', date: 'July 30', status: 'Due Soon' },
                { task: 'Bonus Review', date: 'Aug 02', status: 'Scheduled' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center p-3 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{item.task}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{item.date}</p>
                  </div>
                  <span className="text-[10px] font-bold text-blue-600">{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Run New Payroll Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col transition-all transform scale-100">
            <div className="px-10 py-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {editingPayroll ? 'Edit Payroll Record' : 'Run New Payroll'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-2xl transition-all">
                <X className="w-6 h-6 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">Select Staff</label>
                <select 
                  required 
                  value={formData.staffId} 
                  onChange={(e) => handleFormChange({ staffId: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:border-blue-500 transition-all dark:text-white"
                >
                  <option value="">Select a staff member...</option>
                  {staff.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">Basic Salary</label>
                  <input 
                    type="number" 
                    required 
                    value={formData.basic} 
                    onChange={(e) => handleFormChange({ basic: parseFloat(e.target.value) })}
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:border-blue-500 transition-all dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">Bonus</label>
                  <input 
                    type="number" 
                    value={formData.bonus} 
                    onChange={(e) => handleFormChange({ bonus: parseFloat(e.target.value) })}
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:border-blue-500 transition-all dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">Tax / Deductions</label>
                  <input 
                    type="number" 
                    value={formData.tax} 
                    onChange={(e) => handleFormChange({ tax: parseFloat(e.target.value) })}
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:border-blue-500 transition-all dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">Net Pay</label>
                  <div className="w-full px-5 py-3.5 bg-slate-100 dark:bg-slate-700 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white">
                    {format(formData.net)}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">Status</label>
                  <select 
                    value={formData.status} 
                    onChange={(e) => handleFormChange({ status: e.target.value as any })}
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:border-blue-500 transition-all dark:text-white"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">Payroll Month</label>
                  <input 
                    type="text" 
                    value={formData.month} 
                    onChange={(e) => handleFormChange({ month: e.target.value })}
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:border-blue-500 transition-all dark:text-white"
                  />
                </div>
              </div>
              <div className="pt-8 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all">Cancel</button>
                <button type="submit" className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-xl shadow-indigo-900/20 hover:bg-indigo-700 transition-all">Save Payroll</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
