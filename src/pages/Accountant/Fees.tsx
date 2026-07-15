import React, { useMemo, useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  CreditCard,
  Download,
  Paperclip,
  TrendingUp,
  Wallet,
  Users,
  X,
  Edit2,
  Trash2,
  Printer,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/utils';
import { KPICard } from '@/components/ui/KPICard';
import { FeeStructureManager } from '@/components/ui/FeeStructureManager';
import { useCurrency } from '@/hooks/useCurrency';
import { useDataStore, FeeRecord } from '@/store/useDataStore';
import { useToastStore } from '@/store/useToastStore';
import { downloadFromUrl, readFileAsDataUrl } from '@/utils/fileHelpers';
import { useAuthStore } from '@/store/useAuthStore';
import { resolveSchoolProfile } from '@/utils/schoolProfile';

export default function AccountantFees() {
  const { format } = useCurrency();
  const showToast = useToastStore((state) => state.showToast);
  const {
    feeRecords,
    feeStructures,
    addFeeRecord,
    updateFeeRecord,
    deleteFeeRecord,
    students,
    schools,
  } = useDataStore();
  const { user } = useAuthStore();
  const schoolProfile = resolveSchoolProfile(user ?? null, schools);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<FeeRecord | null>(null);
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

  const filteredFees = useMemo(() => {
    return feeRecords.filter(
      (fee) =>
        fee.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fee.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fee.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [feeRecords, searchTerm]);

  const stats = useMemo(() => {
    const totalPaid = feeRecords
      .filter((item) => item.status === 'Paid')
      .reduce((sum, item) => sum + item.amount, 0);
    const totalPending = feeRecords
      .filter((item) => item.status !== 'Paid')
      .reduce((sum, item) => sum + item.amount, 0);
    const uniquePayers = new Set(feeRecords.map((item) => item.studentId)).size;
    const today = new Date().toISOString().split('T')[0];
    const todaysCollection = feeRecords
      .filter((item) => item.status === 'Paid' && item.date === today)
      .reduce((sum, item) => sum + item.amount, 0);
    const collectionProgress =
      feeRecords.length > 0
        ? Math.round((feeRecords.filter((item) => item.status === 'Paid').length / feeRecords.length) * 100)
        : 0;

    return { totalPaid, totalPending, uniquePayers, todaysCollection, collectionProgress };
  }, [feeRecords]);

  const feeStatusData = [
    { name: 'Collected', value: stats.collectionProgress, color: '#10b981' },
    { name: 'Pending', value: 100 - stats.collectionProgress, color: '#f59e0b' },
  ];

  const resetForm = () => {
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
  };

  const handlePrint = () => {
    showToast({
      title: 'Preparing fee report',
      description: 'The accountant fee report is opening in the print dialog.',
      variant: 'info',
    });
    window.print();
  };

  const handleOpenModal = (fee?: FeeRecord) => {
    if (fee) {
      setEditingFee(fee);
      setFormData({ ...fee });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const student = students.find((item) => item.id === formData.studentId);
    const dataToSave = {
      ...formData,
      studentName: student ? student.name : formData.studentName,
    };

    if (editingFee) {
      updateFeeRecord(editingFee.id, dataToSave);
    } else {
      addFeeRecord(dataToSave);
    }

    setIsModalOpen(false);
    showToast({
      title: editingFee ? 'Fee record updated' : 'Payment recorded',
      description: `${dataToSave.type} for ${dataToSave.studentName} has been saved.`,
      variant: 'success',
    });
    resetForm();
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

  const handleDelete = (fee: FeeRecord) => {
    deleteFeeRecord(fee.id);
    showToast({
      title: 'Fee record deleted',
      description: `${fee.type} for ${fee.studentName} has been removed.`,
      variant: 'warning',
    });
  };

  const handleSendReminder = () => {
    showToast({
      title: 'Reminder sent',
      description: 'Outstanding fee reminder has been queued for the selected student.',
      variant: 'success',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-slate-900 dark:text-white">
            Finance Management
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
            Track payments and manage fee categories by class.
          </p>
        </div>
        <div className="flex items-center gap-3 print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <Printer className="h-4 w-4" />
            Print Report
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition-all hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Record Payment
          </button>
        </div>
      </div>

      <div className="hidden border-b-2 border-slate-900 pb-8 print:block">
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
              <h1 className="mb-2 text-3xl font-black uppercase tracking-tighter text-slate-900">{schoolProfile.name}</h1>
              <h2 className="mb-3 text-xl font-bold uppercase tracking-widest text-slate-700">Official Financial Fee Report</h2>
              <div className="space-y-1 text-sm text-slate-600">
                {schoolProfile.address ? <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {schoolProfile.address}</p> : null}
                {schoolProfile.phone ? <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> {schoolProfile.phone}</p> : null}
                {schoolProfile.email ? <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> {schoolProfile.email}</p> : null}
              </div>
            </div>
          </div>
          <div className="min-w-[240px] rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p><span className="font-bold text-slate-900">Department:</span> Accounts & Finance</p>
            <p><span className="font-bold text-slate-900">Officer:</span> {user?.name}</p>
            <p><span className="font-bold text-slate-900">Date:</span> {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 print:block">
        <div className="space-y-6 lg:col-span-2">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 print:grid-cols-3 print:gap-2">
            <KPICard
              title="Today's Collection"
              value={stats.todaysCollection}
              isCurrency={true}
              icon={TrendingUp}
              iconBgClass="bg-emerald-50 dark:bg-emerald-900/20"
              iconColorClass="text-emerald-600 dark:text-emerald-400"
              trend={{ value: 12, label: 'vs yesterday' }}
            />
            <KPICard
              title="Global Pending"
              value={stats.totalPending}
              isCurrency={true}
              icon={Wallet}
              iconBgClass="bg-amber-50 dark:bg-amber-900/20"
              iconColorClass="text-amber-600 dark:text-amber-400"
              trend={{ value: -5, label: 'vs last month' }}
            />
            <KPICard
              title="Active Payers"
              value={stats.uniquePayers.toString()}
              icon={Users}
              iconBgClass="bg-blue-50 dark:bg-blue-900/20"
              iconColorClass="text-blue-600 dark:text-blue-400"
              trend={{ value: 8, label: 'new students' }}
            />
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col justify-between gap-4 border-b border-slate-200 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-800/50 sm:flex-row">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student, ID, or fee type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm shadow-sm outline-none transition-all focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <button
                onClick={() =>
                  showToast({
                    title: 'Status filter ready',
                    description: 'You can now review paid, pending, or partial fee records from the table.',
                    variant: 'info',
                  })
                }
                className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                <Filter className="h-4 w-4" />
                Filter Status
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:border-slate-800 dark:text-slate-500">
                    <th className="px-8 py-5">Student Details</th>
                    <th className="px-8 py-5">Fee Category</th>
                    <th className="px-8 py-5 text-right">Amount</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
                  {filteredFees.map((fee) => (
                    <tr key={fee.id} className="group transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-8 py-5">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{fee.studentName}</p>
                          <p className="text-[10px] font-bold uppercase tracking-tight text-slate-400">
                            ID: {fee.studentId}
                          </p>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="font-medium text-slate-600 dark:text-slate-400">{fee.type}</span>
                      </td>
                      <td className="px-8 py-5 text-right font-black text-slate-900 dark:text-white">
                        {format(fee.amount)}
                      </td>
                      <td className="px-8 py-5">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-wider',
                            fee.status === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                              : fee.status === 'Pending'
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                : 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                          )}
                        >
                          {fee.status}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          {fee.attachmentUrl ? (
                            <button
                              onClick={() => downloadFromUrl(fee.attachmentUrl!, fee.attachmentName || `${fee.studentName}-receipt`)}
                              className="rounded-xl p-2 text-slate-400 transition-all hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/30"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          ) : null}
                          <button
                            onClick={() => handleOpenModal(fee)}
                            className="rounded-xl p-2 text-slate-400 transition-all hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(fee)}
                            className="rounded-xl p-2 text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30"
                          >
                            <Trash2 className="h-4 w-4" />
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

        <div className="space-y-6 print:hidden">
          <FeeStructureManager
            title="Class Fee Categories"
            description="Add different fee categories and payable amounts for each class."
          />

          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-8 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Collection Progress
            </h3>
            <div className="relative h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={feeStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {feeStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '16px',
                      border: 'none',
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                      backgroundColor: '#0f172a',
                      color: '#fff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  {stats.collectionProgress}%
                </span>
                <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Collected
                </span>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] bg-slate-900 p-8 text-white shadow-xl">
            <h3 className="relative z-10 mb-2 flex items-center gap-2 text-lg font-bold">
              <CreditCard className="h-6 w-6 text-blue-400" />
              Quick Invoice
            </h3>
            <p className="relative z-10 mb-8 text-xs text-slate-400">
              Send instant fee reminders to students with outstanding balances.
            </p>
            <div className="relative z-10 space-y-4">
              <input
                type="text"
                placeholder="Enter Student ID..."
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <button
                onClick={handleSendReminder}
                className="w-full rounded-2xl bg-blue-600 py-4 text-sm font-bold text-white shadow-lg shadow-blue-900/40 transition-all hover:bg-blue-700"
              >
                Send Notification
              </button>
            </div>
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-500/5 blur-3xl"></div>
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

      {isModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md"
          onClick={() => {
            setIsModalOpen(false);
            resetForm();
          }}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-slate-50/95 px-10 py-8 backdrop-blur dark:border-slate-800 dark:bg-slate-800/95">
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {editingFee ? 'Edit Fee Record' : 'Record New Payment'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="rounded-2xl p-3 transition-all hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                <X className="h-6 w-6 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto p-10">
              <div className="space-y-2">
                <label className="px-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Select Student
                </label>
                <select
                  required
                  value={formData.studentId}
                  onChange={(e) => handleStudentChange(e.target.value)}
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-3.5 text-sm font-medium outline-none transition-all focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="">Select a student...</option>
                  {students.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.regNo})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="px-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Fee Type
                </label>
                {studentFeeOptions.length > 0 ? (
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => handleFeeCategoryChange(e.target.value)}
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-3.5 text-sm font-medium outline-none transition-all focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    placeholder="e.g. Tuition Fee - Semester 1"
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-3.5 text-sm font-medium outline-none transition-all focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                )}
                {selectedStudent ? (
                  <p className="px-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {studentFeeOptions.length > 0
                      ? `Using configured fee categories for ${selectedStudent.class}.`
                      : `No class fee setup found for ${selectedStudent.class} yet.`}
                  </p>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="px-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Amount
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-3.5 text-sm font-bold outline-none transition-all focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="px-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as FeeRecord['status'] })}
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-3.5 text-sm font-medium outline-none transition-all focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Partial">Partial</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="px-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-3.5 text-sm font-medium outline-none transition-all focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="px-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Attach Receipt
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-600 transition-all hover:border-blue-400 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-blue-700 dark:hover:bg-blue-900/20">
                  <Paperclip className="h-4 w-4" />
                  <span>{formData.attachmentName || 'Upload transaction receipt or proof of payment'}</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => handleAttachmentChange(e.target.files?.[0])}
                  />
                </label>
              </div>

              <div className="flex gap-4 pt-8">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="flex-1 rounded-2xl border border-slate-200 px-6 py-4 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-blue-600 px-6 py-4 text-sm font-bold text-white shadow-xl shadow-blue-900/20 transition-all hover:bg-blue-700"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
