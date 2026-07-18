import { useState } from 'react';
import { Search, Filter, Plus, BookOpen, Clock, CheckCircle, AlertCircle, ChevronRight, RotateCcw, Send, X } from 'lucide-react';
import { cn } from '@/utils';
import { KPICard } from '@/components/ui/KPICard';
import { useToastStore } from '@/store/useToastStore';

export default function IssueReturn() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Issued' | 'Completed' | 'Overdue'>('All');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'Issue' | 'Return'>('Issue');
  const [formData, setFormData] = useState({
    book: '',
    member: '',
    idNo: '',
    due: '',
  });
  const showToast = useToastStore((state) => state.showToast);

  const [transactions, setTransactions] = useState([
    { id: 'ISS-201', book: 'Advanced Physics', member: 'Emma Johnson', idNo: 'STU-001', type: 'Issue', date: '2026-07-01', due: '2026-07-15', status: 'Issued' },
    { id: 'ISS-202', book: 'World History', member: 'Liam Smith', idNo: 'STU-042', type: 'Issue', date: '2026-06-20', due: '2026-07-04', status: 'Overdue' },
    { id: 'ISS-203', book: 'Data Structures', member: 'Noah Williams', idNo: 'STU-015', type: 'Return', date: '2026-07-05', due: '-', status: 'Completed' },
    { id: 'ISS-204', book: 'The Great Gatsby', member: 'Ava Brown', idNo: 'STU-088', type: 'Issue', date: '2026-07-06', due: '2026-07-20', status: 'Issued' },
  ]);

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.book.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.member.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.idNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || transaction.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const cycleStatusFilter = () => {
    setStatusFilter((current) => {
      const order: Array<'All' | 'Issued' | 'Completed' | 'Overdue'> = ['All', 'Issued', 'Completed', 'Overdue'];
      const nextValue = order[(order.indexOf(current) + 1) % order.length];

      showToast({
        title: 'Circulation status updated',
        description: `Showing ${nextValue.toLowerCase()} transactions.`,
        variant: 'info',
      });

      return nextValue;
    });
  };

  const openModal = (type: 'Issue' | 'Return') => {
    setModalType(type);
    setFormData({
      book: '',
      member: '',
      idNo: '',
      due: '',
    });
    setShowModal(true);
  };

  const handleSaveTransaction = () => {
    if (!formData.book.trim() || !formData.member.trim() || !formData.idNo.trim()) {
      showToast({
        title: 'Complete circulation details',
        description: 'Book title, member name, and ID are required.',
        variant: 'warning',
      });
      return;
    }

    if (modalType === 'Issue' && !formData.due) {
      showToast({
        title: 'Due date required',
        description: 'Select a due date before issuing a book.',
        variant: 'warning',
      });
      return;
    }

    const newTransaction = {
      id: `ISS-${200 + transactions.length + 1}`,
      book: formData.book,
      member: formData.member,
      idNo: formData.idNo,
      type: modalType,
      date: new Date().toISOString().split('T')[0],
      due: modalType === 'Issue' ? formData.due : '-',
      status: modalType === 'Issue' ? 'Issued' : 'Completed',
    };

    setTransactions((current) => [newTransaction, ...current]);
    setShowModal(false);
    showToast({
      title: modalType === 'Issue' ? 'Book issued' : 'Book returned',
      description: `${formData.book} has been recorded successfully.`,
      variant: 'success',
    });
  };

  const handleSendReminder = (member: string, book: string) => {
    showToast({
      title: 'Reminder prepared',
      description: `${member} is ready to receive a reminder for ${book}.`,
      variant: 'info',
    });
  };

  const handleViewTransaction = (transactionId: string, status: string) => {
    showToast({
      title: `Transaction ${transactionId}`,
      description: `This circulation record is currently marked ${status.toLowerCase()}.`,
      variant: 'info',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Issue & Return</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage book circulation and tracking for students and staff.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => openModal('Return')}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-900/20 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Return Book
          </button>
          <button
            onClick={() => openModal('Issue')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Issue Book
          </button>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Books Issued" 
          value={String(transactions.filter(t => t.status === 'Issued').length)} 
          icon={BookOpen} 
          iconBgClass="bg-blue-50 dark:bg-blue-900/20"
          iconColorClass="text-blue-600 dark:text-blue-400"
        />
        <KPICard 
          title="Returned Today" 
          value={String(transactions.filter(t => t.status === 'Completed').length)} 
          icon={CheckCircle} 
          iconBgClass="bg-emerald-50 dark:bg-emerald-900/20"
          iconColorClass="text-emerald-600 dark:text-emerald-400"
        />
        <KPICard 
          title="Pending Returns" 
          value={String(transactions.filter(t => t.status === 'Issued').length)} 
          icon={Clock} 
          iconBgClass="bg-amber-50 dark:bg-amber-900/20"
          iconColorClass="text-amber-600 dark:text-amber-400"
        />
        <KPICard 
          title="Overdue Books" 
          value={String(transactions.filter(t => t.status === 'Overdue').length)} 
          icon={AlertCircle} 
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
              placeholder="Search by book, member or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all dark:text-white"
            />
          </div>
          <button
            onClick={cycleStatusFilter}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all"
          >
            <Filter className="w-4 h-4" />
            {statusFilter === 'All' ? 'All Statuses' : statusFilter}
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                <th className="py-4 px-6">Book Title / ID</th>
                <th className="py-4 px-6">Member Name</th>
                <th className="py-4 px-6">Issue Date</th>
                <th className="py-4 px-6">Due Date</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTransactions.map((tx, i) => (
                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="py-4 px-6">
                    <p className="font-bold text-slate-900 dark:text-white">{tx.book}</p>
                    <p className="text-[10px] font-mono font-bold text-slate-400">{tx.id}</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-medium text-slate-700 dark:text-slate-300">{tx.member}</p>
                    <p className="text-[10px] font-bold text-slate-400">{tx.idNo}</p>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-500 font-medium">{tx.date}</td>
                  <td className="py-4 px-6 text-xs font-bold text-slate-700 dark:text-slate-300">{tx.due}</td>
                  <td className="py-4 px-6">
                    <span className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                      tx.status === 'Completed' ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                      tx.status === 'Issued' ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                      "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                    )}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleSendReminder(tx.member, tx.book)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleViewTransaction(tx.id, tx.status)}
                        className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredTransactions.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
            No transactions match the current search and status filter.
          </div>
        ) : null}
      </div>

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onClick={() => setShowModal(false)}>
          <div
            className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{modalType === 'Issue' ? 'Issue Book' : 'Return Book'}</h2>
                <p className="text-sm text-slate-500">Record a library circulation transaction for a member.</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-6">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Book Title</span>
                  <input
                    value={formData.book}
                    onChange={(event) => setFormData((current) => ({ ...current, book: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                    placeholder="Book title"
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Member Name</span>
                  <input
                    value={formData.member}
                    onChange={(event) => setFormData((current) => ({ ...current, member: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                    placeholder="Member name"
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Member ID</span>
                  <input
                    value={formData.idNo}
                    onChange={(event) => setFormData((current) => ({ ...current, idNo: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                    placeholder="e.g. STU-101"
                  />
                </label>
                {modalType === 'Issue' ? (
                  <label className="space-y-2 text-sm font-medium text-slate-700">
                    <span>Due Date</span>
                    <input
                      type="date"
                      value={formData.due}
                      onChange={(event) => setFormData((current) => ({ ...current, due: event.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                    />
                  </label>
                ) : null}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTransaction}
                className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Save Transaction
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
