import React, { useState, useMemo } from 'react';
import { DollarSign, FileText, CreditCard, TrendingUp, ArrowUpRight, Wallet, Download, Plus, Search, Filter, Users, X, Edit2, Printer, Paperclip, Mail, Phone, MapPin } from 'lucide-react';
import { KPICard } from '@/components/ui/KPICard';
import { FeeStructureManager } from '@/components/ui/FeeStructureManager';
import { cn } from '@/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { useCurrency } from '@/hooks/useCurrency';
import { useDataStore, FeeRecord } from '@/store/useDataStore';
import { useToastStore } from '@/store/useToastStore';
import { downloadFromUrl, readFileAsDataUrl } from '@/utils/fileHelpers';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { resolveSchoolProfile } from '@/utils/schoolProfile';

export default function AdminFinanceDashboard() {
  const { format, currency } = useCurrency();
  const navigate = useNavigate();
  const { feeRecords, feeStructures, expenses, addFeeRecord, updateFeeRecord, addExpense, students, schools } = useDataStore();
  const { user } = useAuthStore();
  const showToast = useToastStore((state) => state.showToast);
  const schoolProfile = resolveSchoolProfile(user ?? null, schools);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAddTx, setShowAddTx] = useState(false);
  const [showRecordFee, setShowRecordFee] = useState(false);
  const [viewMode, setViewMode] = useState<'summary' | 'all'>('summary');
  const [editingFee, setEditingFee] = useState<FeeRecord | null>(null);
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    category: 'Maintenance',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    status: 'Pending' as 'Paid' | 'Pending' | 'Approved',
    method: 'Bank Transfer',
    attachmentName: '',
    attachmentUrl: '',
  });

  const handlePrint = () => {
    showToast({
      title: 'Preparing print view',
      description: 'The financial summary is opening in the browser print dialog.',
      variant: 'info',
    });
    window.print();
  };

  const [formData, setFormData] = useState<Omit<FeeRecord, 'id'>>({
    studentId: '',
    studentName: '',
    amount: 0,
    status: 'Pending',
    date: new Date().toISOString().split('T')[0],
    type: 'Tuition Fee',
    attachmentName: '',
    attachmentUrl: '',
  });

  const selectedStudent = students.find((item) => item.id === formData.studentId);
  const studentFeeOptions = feeStructures.filter(
    (item) => item.className === selectedStudent?.class && item.status === 'Active'
  );

  const handleOpenFeeModal = (fee?: FeeRecord) => {
    if (fee) {
      setEditingFee(fee);
      setFormData({ ...fee });
    } else {
      setEditingFee(null);
      setFormData({
        studentId: '',
        studentName: '',
        amount: 0,
        status: 'Pending',
        date: new Date().toISOString().split('T')[0],
        type: 'Tuition Fee',
        attachmentName: '',
        attachmentUrl: '',
      });
    }
    setShowRecordFee(true);
  };

  const handleFeeAttachmentChange = async (file?: File) => {
    if (!file) return;
    const attachmentUrl = await readFileAsDataUrl(file);
    setFormData((current) => ({ ...current, attachmentName: file.name, attachmentUrl }));
  };

  const handleExpenseAttachmentChange = async (file?: File) => {
    if (!file) return;
    const attachmentUrl = await readFileAsDataUrl(file);
    setExpenseForm((current) => ({ ...current, attachmentName: file.name, attachmentUrl }));
  };

  const handleStudentChange = (studentId: string) => {
    const student = students.find((item) => item.id === studentId);
    const availableStructures = feeStructures.filter(
      (item) => item.className === student?.class && item.status === 'Active'
    );
    const defaultStructure = availableStructures[0];

    setFormData((current) => ({
      ...current,
      studentId,
      studentName: student?.name ?? '',
      type: defaultStructure?.category ?? current.type,
      amount: defaultStructure?.amount ?? current.amount,
    }));
  };

  const handleFeeCategoryChange = (category: string) => {
    const matchedStructure = studentFeeOptions.find((item) => item.category === category);

    setFormData((current) => ({
      ...current,
      type: category,
      amount: matchedStructure?.amount ?? current.amount,
    }));
  };

  const handleFeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.id === formData.studentId);
    const dataToSave = {
      ...formData,
      studentName: student ? student.name : formData.studentName
    };

    if (editingFee) {
      updateFeeRecord(editingFee.id, dataToSave);
    } else {
      addFeeRecord(dataToSave);
    }
    setShowRecordFee(false);
    showToast({
      title: editingFee ? 'Fee record updated' : 'Fee payment recorded',
      description: `${dataToSave.studentName || 'Student'} ${editingFee ? 'record' : 'payment'} saved successfully.`,
      variant: 'success',
    });
  };

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      showToast({
        title: 'Report generated',
        description: 'The finance report is ready for printing or PDF export.',
        variant: 'success',
      });
      window.print();
    }, 1500);
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addExpense(expenseForm);
    setShowAddTx(false);
    setExpenseForm({
      title: '',
      category: 'Maintenance',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      method: 'Bank Transfer',
      attachmentName: '',
      attachmentUrl: '',
    });
    showToast({
      title: 'Expense transaction added',
      description: `${expenseForm.title} has been added to the school expense ledger.`,
      variant: 'success',
    });
  };

  const stats = useMemo(() => {
    const totalRevenue = feeRecords.reduce((acc, curr) => acc + curr.amount, 0);
    const pendingFees = feeRecords.filter(f => f.status === 'Pending').reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    return { totalRevenue, pendingFees, totalExpenses };
  }, [expenses, feeRecords]);

  const revenueData = useMemo(() => ([
    { name: 'Jan', revenue: 45000, expenses: 32000 },
    { name: 'Feb', revenue: 52000, expenses: 34000 },
    { name: 'Mar', revenue: 48000, expenses: 31000 },
    { name: 'Apr', revenue: 61000, expenses: 38000 },
    { name: 'May', revenue: 55000, expenses: 35000 },
    { name: 'Jun', revenue: stats.totalRevenue, expenses: stats.totalExpenses || 40000 },
  ]), [stats.totalExpenses, stats.totalRevenue]);

  const feeData = useMemo(() => ([
    { name: 'Collected', value: stats.totalRevenue - stats.pendingFees },
    { name: 'Pending', value: stats.pendingFees },
  ]), [stats.pendingFees, stats.totalRevenue]);

  const FEE_COLORS = ['#3b82f6', '#f59e0b'];

  return (
    <div className="space-y-6">
      {/* Modals */}
      {showRecordFee && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowRecordFee(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingFee ? 'Edit Fee Record' : 'Record Student Fee'}
              </h2>
              <button onClick={() => setShowRecordFee(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleFeeSubmit} className="p-8 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Student</label>
                  <select 
                    required 
                    value={formData.studentId} 
                    onChange={(e) => handleStudentChange(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-emerald-500 dark:text-white text-sm"
                  >
                    <option value="">Select Student...</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fee Category</label>
                  {studentFeeOptions.length > 0 ? (
                    <select
                      required
                      value={formData.type}
                      onChange={(e) => handleFeeCategoryChange(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-emerald-500 dark:text-white text-sm"
                    >
                      {studentFeeOptions.map((item) => (
                        <option key={item.id} value={item.category}>
                          {item.category} ({item.term})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input 
                      type="text" 
                      required 
                      value={formData.type} 
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      placeholder="e.g. Tuition Fee"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-emerald-500 dark:text-white text-sm"
                    />
                  )}
                  {selectedStudent ? (
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      {studentFeeOptions.length > 0
                        ? `Configured class fees loaded for ${selectedStudent.class}.`
                        : `No fee setup found for ${selectedStudent.class} yet.`}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">{({ USD: '$', EUR: '€', GBP: '£', NGN: '₦' } as Record<string, string>)[currency] || currency}</span>
                    <input 
                      type="number" 
                      required 
                      value={formData.amount} 
                      onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})}
                      placeholder="0.00" 
                      className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-emerald-500 dark:text-white text-sm font-bold" 
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</label>
                  <select 
                    value={formData.status} 
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-emerald-500 dark:text-white text-sm"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Partial">Partial</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</label>
                <input 
                  type="date" 
                  required 
                  value={formData.date} 
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-emerald-500 dark:text-white text-sm" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Attach Receipt</label>
                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600 transition-all hover:border-emerald-400 hover:bg-emerald-50/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-emerald-700 dark:hover:bg-emerald-900/20">
                  <Paperclip className="w-4 h-4" />
                  <span>{formData.attachmentName || 'Upload payment receipt or transaction proof'}</span>
                  <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => handleFeeAttachmentChange(e.target.files?.[0])} />
                </label>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowRecordFee(false)} className="flex-1 px-6 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-900/20 transition-all">
                  {editingFee ? 'Update Record' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg flex flex-col overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add Expense Transaction</h2>
              <button onClick={() => setShowAddTx(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleExpenseSubmit} className="p-8 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Expense Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Utility Bills - July"
                  value={expenseForm.title}
                  onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-rose-500 dark:text-white text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Category</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-rose-500 dark:text-white text-sm"
                  >
                    <option>Maintenance</option>
                    <option>Welfare</option>
                    <option>Supplies</option>
                    <option>Utility</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Amount</label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="0.00"
                      value={expenseForm.amount}
                      onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-rose-500 dark:text-white text-sm font-bold"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Payment Method</label>
                <input
                  type="text"
                  value={expenseForm.method}
                  onChange={(e) => setExpenseForm({ ...expenseForm, method: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-rose-500 dark:text-white text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Attach Receipt</label>
                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600 transition-all hover:border-rose-400 hover:bg-rose-50/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-rose-700 dark:hover:bg-rose-900/20">
                  <Paperclip className="w-4 h-4" />
                  <span>{expenseForm.attachmentName || 'Upload expense receipt or invoice'}</span>
                  <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => handleExpenseAttachmentChange(e.target.files?.[0])} />
                </label>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowAddTx(false)} className="flex-1 px-6 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-rose-900/20 transition-all">Add Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Finance Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage school fees, revenue, and expenses.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={handlePrint}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
          <button 
            onClick={() => setShowAddTx(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Print Header - Only visible during print */}
      <div className="hidden print:block mb-10 border-b-2 border-slate-900 pb-8">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            {schoolProfile.logoUrl ? (
              <img src={schoolProfile.logoUrl} alt={`${schoolProfile.name} logo`} className="h-20 w-20 rounded-2xl border border-slate-200 object-cover" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-2xl font-bold text-slate-500">
                {(schoolProfile.name || 'S').slice(0, 1)}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-2">{schoolProfile.name}</h1>
              <h2 className="text-xl font-bold text-slate-700 uppercase tracking-widest mb-3">Official Financial Summary Report</h2>
              <div className="space-y-1 text-sm text-slate-600">
                {schoolProfile.address ? <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {schoolProfile.address}</p> : null}
                {schoolProfile.phone ? <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> {schoolProfile.phone}</p> : null}
                {schoolProfile.email ? <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> {schoolProfile.email}</p> : null}
              </div>
            </div>
          </div>
          <div className="min-w-[240px] rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p><span className="font-bold text-slate-900">Role:</span> Administrator</p>
            <p><span className="font-bold text-slate-900">Academic Year:</span> 2026/2027</p>
            <p><span className="font-bold text-slate-900">Date:</span> {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
        <KPICard 
          title="Total Revenue" 
          value={stats.totalRevenue} 
          isCurrency={true}
          icon={DollarSign} 
          iconBgClass="bg-emerald-50 dark:bg-emerald-900/20"
          iconColorClass="text-emerald-600 dark:text-emerald-400"
        />
        <KPICard 
          title="Pending Fees" 
          value={stats.pendingFees} 
          isCurrency={true}
          icon={FileText} 
          iconBgClass="bg-amber-50 dark:bg-amber-900/20"
          iconColorClass="text-amber-600 dark:text-amber-400"
        />
        <KPICard 
          title="Total Expenses" 
          value={stats.totalExpenses} 
          isCurrency={true}
          icon={TrendingUp} 
          iconBgClass="bg-rose-50 dark:bg-rose-900/20"
          iconColorClass="text-rose-600 dark:text-rose-400"
        />
        <KPICard 
          title="Net Balance" 
          value={stats.totalRevenue - stats.totalExpenses} 
          isCurrency={true}
          icon={Wallet} 
          iconBgClass="bg-blue-50 dark:bg-blue-900/20"
          iconColorClass="text-blue-600 dark:text-blue-400"
        />
      </div>

      {/* Quick Actions & Revenue vs Expenses Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
        {/* Financial Actions Grid */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 px-1">Financial Actions</h3>
          <div className="grid grid-cols-2 gap-4 flex-1">
            {[
              { name: 'Record Fee', icon: CreditCard, color: 'text-emerald-500', bg: 'bg-emerald-500/10', onClick: () => handleOpenFeeModal() },
              { name: 'Add Expense', icon: Wallet, color: 'text-rose-500', bg: 'bg-rose-500/10', onClick: () => setShowAddTx(true) },
              { name: 'Run Payroll', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10', onClick: () => navigate('/admin/payroll') },
              { name: 'Generate Report', icon: FileText, iconColor: 'text-indigo-500', color: 'text-indigo-500', bg: 'bg-indigo-500/10', onClick: handleGenerateReport },
            ].map((action, i) => (
              <button 
                key={i} 
                onClick={action.onClick}
                className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-500/50 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all gap-3 group text-center active:scale-95"
              >
                <div className={cn("p-3 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3", action.bg, action.color)}>
                  <action.icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors tracking-tight">{action.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Revenue vs Expenses Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Revenue vs Expenses</h3>
            <select className="bg-slate-50 dark:bg-slate-800 border-none text-xs font-medium rounded-lg px-3 py-1.5 focus:ring-0">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => format(val).split('.')[0]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => format(value)}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="print:hidden">
        <FeeStructureManager
          title="Class Fee Categories"
          description="Create different fee categories and set the amount each class should pay."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:block">
        {/* Recent Transactions */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2 print:border-none print:shadow-none">
          <div className="flex justify-between items-center mb-6 print:mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white uppercase tracking-tight">
              {viewMode === 'summary' ? 'Recent Transactions' : 'All Transactions'}
            </h3>
            <button 
              onClick={() => setViewMode(viewMode === 'summary' ? 'all' : 'summary')}
              className="text-sm text-blue-600 font-bold hover:text-blue-700 transition-colors flex items-center gap-1 print:hidden"
            >
              {viewMode === 'summary' ? 'View All' : 'Show Summary'}
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          
          {viewMode === 'all' && (
            <div className="mb-4 flex gap-2 print:hidden">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="text" placeholder="Search transactions..." className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <button onClick={() => showToast({ title: 'Transaction filter', description: 'Filter panel for transactions is being prepared.', variant: 'info' })} className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                <Filter className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          )}

          <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-1 print:max-h-none print:overflow-visible">
            {feeRecords.slice(0, viewMode === 'summary' ? 5 : undefined).map((tx, i) => (
              <div key={i} className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group print:border-slate-200 print:py-3">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-2 rounded-lg transition-transform group-hover:scale-110 print:hidden", 
                    tx.status === 'Paid' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600'
                  )}>
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{tx.type} - {tx.studentName}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{tx.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={cn("font-bold text-sm", tx.status === 'Paid' ? 'text-emerald-600' : 'text-amber-600')}>
                    +{format(tx.amount)}
                  </span>
                  {tx.attachmentUrl ? (
                    <button
                      onClick={() => downloadFromUrl(tx.attachmentUrl!, tx.attachmentName || `${tx.studentName}-receipt`)}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors print:hidden"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  ) : null}
                  <button 
                    onClick={() => handleOpenFeeModal(tx)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors print:hidden"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fee Collection Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col print:hidden">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Fee Collection</h3>
          <div className="flex-1 relative min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={feeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {feeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={FEE_COLORS[index % FEE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => format(value)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
              <span className="text-xl font-bold text-slate-900 dark:text-white">{format(Math.max(stats.totalRevenue - stats.pendingFees, 0))}</span>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Collected</span>
            </div>
          </div>
          <div className="space-y-3 mt-6">
            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Collected</span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white">92.2%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Pending</span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white">7.8%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden print:block mt-10 pt-6 border-t border-slate-200">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Class Teacher', name: schoolProfile.teacherSignatoryName || 'Teacher Signatory', signatureUrl: schoolProfile.teacherSignatureUrl },
            { label: 'Head of Department', name: schoolProfile.hodSignatoryName || 'HOD Signatory', signatureUrl: schoolProfile.hodSignatureUrl },
            { label: 'Principal', name: schoolProfile.principalSignatoryName || 'Principal Signatory', signatureUrl: schoolProfile.principalSignatureUrl },
          ].map((signatory) => (
            <div key={signatory.label} className="rounded-2xl border border-slate-200 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{signatory.label}</p>
              <div className="mt-4 flex h-16 items-end justify-center rounded-xl border-b border-dashed border-slate-300 bg-slate-50">
                {signatory.signatureUrl ? (
                  <img src={signatory.signatureUrl} alt={`${signatory.label} signature`} className="max-h-12 object-contain" />
                ) : (
                  <span className="pb-3 text-[10px] text-slate-400">No signature uploaded</span>
                )}
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-900">{signatory.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
