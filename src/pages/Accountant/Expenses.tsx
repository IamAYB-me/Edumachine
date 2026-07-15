import React, { useState, useMemo } from 'react';
import { Search, Filter, Plus, CreditCard, Download, TrendingDown, Wallet, FileText, PieChart as PieChartIcon, X, Edit2, Trash2, Paperclip } from 'lucide-react';
import { cn } from '@/utils';
import { KPICard } from '@/components/ui/KPICard';
import { useCurrency } from '@/hooks/useCurrency';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useDataStore, Expense } from '@/store/useDataStore';
import { useToastStore } from '@/store/useToastStore';
import { downloadFromUrl, readFileAsDataUrl } from '@/utils/fileHelpers';

export default function AccountantExpenses() {
  const { format } = useCurrency();
  const { expenses, addExpense, updateExpense, deleteExpense } = useDataStore();
  const showToast = useToastStore((state) => state.showToast);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [formData, setFormData] = useState<Omit<Expense, 'id'>>({
    title: '',
    category: 'Utilities',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    status: 'Pending',
    method: 'Cash',
    attachmentName: '',
    attachmentUrl: '',
  });

  const handleOpenModal = (expense?: Expense) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({ ...expense });
    } else {
      setEditingExpense(null);
      setFormData({
        title: '',
        category: 'Utilities',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        status: 'Pending',
        method: 'Cash',
        attachmentName: '',
        attachmentUrl: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingExpense) {
      updateExpense(editingExpense.id, formData);
    } else {
      addExpense(formData);
    }
    setIsModalOpen(false);
    showToast({
      title: editingExpense ? 'Expense updated' : 'Expense recorded',
      description: `${formData.title} has been saved successfully.`,
      variant: 'success',
    });
  };

  const handleAttachmentChange = async (file?: File) => {
    if (!file) return;
    const attachmentUrl = await readFileAsDataUrl(file);
    setFormData((current) => ({
      ...current,
      attachmentName: file.name,
      attachmentUrl,
    }));
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => 
      exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [expenses, searchTerm]);

  const expenseCategoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    expenses.forEach(exp => {
      categories[exp.category] = (categories[exp.category] || 0) + exp.amount;
    });
    const total = expenses.reduce((acc, exp) => acc + exp.amount, 0);
    return Object.entries(categories).map(([name, value]) => ({
      name,
      value: Math.round((value / total) * 100) || 0,
      color: name === 'Academic' ? '#3b82f6' : name === 'Utilities' ? '#f59e0b' : '#8b5cf6'
    }));
  }, [expenses]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Expenses Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Track and authorize school expenditures.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-all">
            <Download className="w-4 h-4" />
            Download Logs
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-rose-900/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Record Expense
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <KPICard 
              title="Month's Expenses" 
              value={12450} 
              isCurrency={true}
              icon={TrendingDown} 
              iconBgClass="bg-rose-50 dark:bg-rose-900/20"
              iconColorClass="text-rose-600 dark:text-rose-400"
            />
            <KPICard 
              title="Pending Approval" 
              value={4200} 
              isCurrency={true}
              icon={Wallet} 
              iconBgClass="bg-amber-50 dark:bg-amber-900/20"
              iconColorClass="text-amber-600 dark:text-amber-400"
            />
            <KPICard 
              title="Expense Reports" 
              value="24" 
              icon={FileText} 
              iconBgClass="bg-blue-50 dark:bg-blue-900/20"
              iconColorClass="text-blue-600 dark:text-blue-400"
            />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/50">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search expenses..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all dark:text-white"
                />
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all">
                  <Filter className="w-4 h-4" />
                  Category
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    <th className="py-4 px-6">Expense Title</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6 text-right">Amount</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredExpenses.map((exp, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-900 dark:text-white">{exp.title}</p>
                        <p className="text-[10px] font-mono font-bold text-slate-400">{exp.id}</p>
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-600 dark:text-slate-400">{exp.category}</td>
                      <td className="py-4 px-6 text-right font-bold text-rose-600">{format(exp.amount)}</td>
                      <td className="py-4 px-6">
                        <span className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                          exp.status === 'Paid' ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                          exp.status === 'Approved' ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                          "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        )}>
                          {exp.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-500 font-medium">{exp.date}</td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {exp.attachmentUrl ? (
                            <button
                              onClick={() => downloadFromUrl(exp.attachmentUrl!, exp.attachmentName || `${exp.title}-receipt`)}
                              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          ) : null}
                          <button 
                            onClick={() => handleOpenModal(exp)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deleteExpense(exp.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
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
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 text-center">Expenditure Mix</h3>
            <div className="h-[240px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {expenseCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#0f172a', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {expenseCategoryData.find(d => d.name === 'Salaries')?.value || 0}%
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Salaries</span>
              </div>
            </div>
            <div className="space-y-3 mt-6">
              {expenseCategoryData.map((item) => (
                <div key={item.name} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-rose-600 to-rose-700 p-6 rounded-2xl text-white shadow-xl shadow-rose-900/20">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Budget Watch
            </h3>
            <p className="text-rose-100 text-xs mb-6">You have used 78% of your allocated budget for this academic term.</p>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-rose-200">
                <span>Usage</span>
                <span>78%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
                <div className="bg-white h-full rounded-full transition-all duration-1000" style={{ width: '78%' }}></div>
              </div>
              <p className="text-[10px] text-rose-200 font-medium pt-2">Remaining: {format(45000)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Record Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col transition-all transform scale-100">
            <div className="px-10 py-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {editingExpense ? 'Edit Expense' : 'Record New Expense'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-2xl transition-all">
                <X className="w-6 h-6 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">Expense Title</label>
                <input 
                  type="text" 
                  required 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Monthly Electricity Bill"
                  className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:border-blue-500 transition-all dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">Category</label>
                <select 
                  required 
                  value={formData.category} 
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:border-blue-500 transition-all dark:text-white"
                >
                  <option value="Utilities">Utilities</option>
                  <option value="Academic">Academic</option>
                  <option value="Administrative">Administrative</option>
                  <option value="Events">Events</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">Amount</label>
                  <input 
                    type="number" 
                    required 
                    value={formData.amount} 
                    onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})}
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:border-blue-500 transition-all dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">Status</label>
                  <select 
                    value={formData.status} 
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:border-blue-500 transition-all dark:text-white"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">Attach Receipt</label>
                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-3.5 text-sm font-medium text-slate-600 transition-all hover:border-blue-400 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-blue-700 dark:hover:bg-blue-900/20">
                  <Paperclip className="w-4 h-4" />
                  <span>{formData.attachmentName || 'Upload expense receipt or invoice'}</span>
                  <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => handleAttachmentChange(e.target.files?.[0])} />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">Payment Method</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.method} 
                    onChange={(e) => setFormData({...formData, method: e.target.value})}
                    placeholder="e.g. Bank Transfer"
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:border-blue-500 transition-all dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">Date</label>
                  <input 
                    type="date" 
                    required 
                    value={formData.date} 
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:border-blue-500 transition-all dark:text-white"
                  />
                </div>
              </div>
              <div className="pt-8 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all">Cancel</button>
                <button type="submit" className="flex-1 px-6 py-4 bg-rose-600 text-white rounded-2xl text-sm font-bold shadow-xl shadow-rose-900/20 hover:bg-rose-700 transition-all">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
