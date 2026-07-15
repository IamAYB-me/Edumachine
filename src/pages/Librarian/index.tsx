import React, { useMemo, useState } from 'react';
import { BookOpen, Users, UserCheck, AlertCircle, Search, Filter } from 'lucide-react';
import { KPICard } from '@/components/ui/KPICard';
import { useNavigate } from 'react-router-dom';
import { useToastStore } from '@/store/useToastStore';

export default function LibrarianDashboard() {
  const navigate = useNavigate();
  const showToast = useToastStore((state) => state.showToast);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Issued' | 'Returned' | 'Overdue'>('All');

  const circulationRecords = [
    { book: 'Introduction to Algorithms', author: 'Thomas H. Cormen', member: 'John Doe (STD-001)', date: 'Today, 10:30 AM', status: 'Issued', isIssued: true },
    { book: 'Clean Code', author: 'Robert C. Martin', member: 'Emma Johnson (STD-045)', date: 'Today, 09:15 AM', status: 'Returned', isIssued: false },
    { book: 'Design Patterns', author: 'Erich Gamma', member: 'Dr. Emily Carter (FAC-012)', date: 'Yesterday', status: 'Issued', isIssued: true },
    { book: 'Computer Networks', author: 'Andrew S. Tanenbaum', member: 'Liam Smith (STD-089)', date: 'Yesterday', status: 'Returned', isIssued: false },
    { book: 'Database System Concepts', author: 'Abraham Silberschatz', member: 'Noah Williams (STD-102)', date: 'Oct 22, 2025', status: 'Overdue', overdue: true },
  ];

  const filteredRecords = useMemo(
    () =>
      circulationRecords.filter((record) => {
        const matchesSearch =
          record.book.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.member.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || record.status === statusFilter;

        return matchesSearch && matchesStatus;
      }),
    [searchTerm, statusFilter]
  );

  const cycleStatusFilter = () => {
    setStatusFilter((current) => {
      const order: Array<'All' | 'Issued' | 'Returned' | 'Overdue'> = ['All', 'Issued', 'Returned', 'Overdue'];
      const nextValue = order[(order.indexOf(current) + 1) % order.length];

      showToast({
        title: 'Circulation filter updated',
        description: `Showing ${nextValue.toLowerCase()} records.`,
        variant: 'info',
      });

      return nextValue;
    });
  };

  const handleQuickAction = (action: 'issue' | 'return' | 'catalog' | 'reminders') => {
    if (action === 'issue' || action === 'return') {
      navigate('/librarian/issue');
      return;
    }

    if (action === 'catalog') {
      navigate('/librarian/books');
      return;
    }

    showToast({
      title: 'Reminder queue ready',
      description: 'Overdue notices can now be sent directly from the circulation records.',
      variant: 'info',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, Librarian 👋</h1>
          <p className="text-slate-500 text-sm mt-1">Here's the library overview and circulation status.</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Total Books" 
          value="12,450" 
          icon={BookOpen} 
          iconBgClass="bg-blue-50"
          iconColorClass="text-blue-600"
          trend={{ value: 0, label: "In Catalog" }}
        />
        <KPICard 
          title="Books Issued" 
          value="845" 
          icon={UserCheck} 
          iconBgClass="bg-emerald-50"
          iconColorClass="text-emerald-600"
          trend={{ value: 0, label: "Currently borrowed" }}
        />
        <KPICard 
          title="Overdue Books" 
          value="42" 
          icon={AlertCircle} 
          iconBgClass="bg-rose-50"
          iconColorClass="text-rose-600"
          trend={{ value: 0, label: "Needs follow-up" }}
        />
        <KPICard 
          title="Active Members" 
          value="1,850" 
          icon={Users} 
          iconBgClass="bg-indigo-50"
          iconColorClass="text-indigo-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Issued/Returned */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Recent Circulation</h3>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search books or members..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 w-64"
                />
              </div>
              <button
                onClick={cycleStatusFilter}
                className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                title={statusFilter === 'All' ? 'All records' : statusFilter}
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-sm font-semibold text-slate-500">
                  <th className="pb-3 px-4">Book Title</th>
                  <th className="pb-3 px-4">Member</th>
                  <th className="pb-3 px-4">Date</th>
                  <th className="pb-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredRecords.map((record, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-900">{record.book}</p>
                      <p className="text-xs text-slate-500">{record.author}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{record.member}</td>
                    <td className="py-3 px-4 text-slate-500">{record.date}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-semibold ${
                        record.overdue ? 'bg-rose-100 text-rose-700' :
                        record.isIssued ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredRecords.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-500">
              No circulation records match the current search and filter.
            </div>
          ) : null}
        </div>

        {/* Quick Actions & Reminders */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleQuickAction('issue')}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors gap-2"
              >
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-medium text-slate-700">Issue Book</span>
              </button>
              <button
                onClick={() => handleQuickAction('return')}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors gap-2"
              >
                <UserCheck className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-medium text-slate-700">Return Book</span>
              </button>
              <button
                onClick={() => handleQuickAction('catalog')}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors gap-2"
              >
                <Search className="w-5 h-5 text-purple-600" />
                <span className="text-xs font-medium text-slate-700">Search Catalog</span>
              </button>
              <button
                onClick={() => handleQuickAction('reminders')}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors gap-2"
              >
                <AlertCircle className="w-5 h-5 text-rose-600" />
                <span className="text-xs font-medium text-slate-700">Send Reminders</span>
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Most Borrowed</h3>
            </div>
            <div className="space-y-4">
              {[
                { title: 'Clean Code', count: 45 },
                { title: 'Introduction to Algorithms', count: 38 },
                { title: 'Design Patterns', count: 32 },
                { title: 'Database System Concepts', count: 28 },
              ].map((book, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-400 w-4">{i + 1}</span>
                    <span className="text-sm font-medium text-slate-700 truncate max-w-[180px]" title={book.title}>{book.title}</span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-600 rounded-md">{book.count} times</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
