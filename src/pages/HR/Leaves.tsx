import React, { useMemo, useState } from 'react';
import { Search, Filter, Plus, Calendar, CheckCircle, XCircle, Clock, FileText, User, ChevronRight, X } from 'lucide-react';
import { cn } from '@/utils';
import { KPICard } from '@/components/ui/KPICard';
import { useToastStore } from '@/store/useToastStore';

export default function HRLeaves() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All Status' | 'Pending' | 'Approved' | 'Rejected'>('All Status');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const showToast = useToastStore((state) => state.showToast);

  const [leaves, setLeaves] = useState([
    { id: 'LEV-001', staff: 'Sarah Wilson', role: 'Mathematics Teacher', type: 'Sick Leave', duration: '2 Days', start: '2026-07-10', status: 'Approved' },
    { id: 'LEV-002', staff: 'Michael Brown', role: 'Science Teacher', type: 'Casual Leave', duration: '1 Day', start: '2026-07-12', status: 'Pending' },
    { id: 'LEV-003', staff: 'David Smith', role: 'Librarian', type: 'Annual Leave', duration: '5 Days', start: '2026-07-15', status: 'Approved' },
    { id: 'LEV-004', staff: 'Emily Davis', role: 'Admin Staff', type: 'Sick Leave', duration: '3 Days', start: '2026-07-08', status: 'Rejected' },
  ]);
  const [formData, setFormData] = useState({
    staff: '',
    role: '',
    type: 'Sick Leave',
    duration: '1 Day',
    start: new Date().toISOString().split('T')[0],
  });

  const filteredLeaves = useMemo(() => {
    return leaves.filter((leave) => {
      const matchesSearch =
        leave.staff.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.role.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All Status' || leave.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [leaves, searchTerm, statusFilter]);

  const handleCycleStatus = () => {
    const options: Array<typeof statusFilter> = ['All Status', 'Pending', 'Approved', 'Rejected'];
    const next = options[(options.indexOf(statusFilter) + 1) % options.length];
    setStatusFilter(next);
    showToast({
      title: 'Leave filter updated',
      description: `Showing ${next.toLowerCase()} leave requests.`,
      variant: 'info',
    });
  };

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    setLeaves((current) => [
      {
        id: `LEV-${100 + current.length + 1}`,
        ...formData,
        status: 'Pending',
      },
      ...current,
    ]);
    setIsApplyModalOpen(false);
    setFormData({
      staff: '',
      role: '',
      type: 'Sick Leave',
      duration: '1 Day',
      start: new Date().toISOString().split('T')[0],
    });
    showToast({
      title: 'Leave request submitted',
      description: 'The leave application has been created and marked pending review.',
      variant: 'success',
    });
  };

  const handleStatusUpdate = (id: string, status: 'Approved' | 'Rejected', staff: string) => {
    setLeaves((current) => current.map((leave) => (leave.id === id ? { ...leave, status } : leave)));
    showToast({
      title: `Leave ${status.toLowerCase()}`,
      description: `${staff}'s leave request has been ${status.toLowerCase()}.`,
      variant: status === 'Approved' ? 'success' : 'warning',
    });
  };

  return (
    <div className="space-y-6">
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <form onSubmit={handleApplyLeave} className="space-y-4 p-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Apply Leave</h2>
                <button type="button" onClick={() => setIsApplyModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <input required value={formData.staff} onChange={(e) => setFormData({ ...formData, staff: e.target.value })} placeholder="Staff name" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              <input required value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} placeholder="Role" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              <div className="grid grid-cols-2 gap-4">
                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                  <option>Sick Leave</option>
                  <option>Casual Leave</option>
                  <option>Annual Leave</option>
                </select>
                <input value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} placeholder="Duration" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              </div>
              <input type="date" value={formData.start} onChange={(e) => setFormData({ ...formData, start: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsApplyModalOpen(false)} className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 dark:border-slate-700 dark:text-slate-300">Cancel</button>
                <button type="submit" className="flex-1 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white">Submit Leave</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Leave Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage and approve staff leave requests.</p>
        </div>
        <button onClick={() => setIsApplyModalOpen(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all">
          <Plus className="w-4 h-4" />
          Apply Leave
        </button>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="On Leave Today" 
          value="15" 
          icon={User} 
          iconBgClass="bg-blue-50 dark:bg-blue-900/20"
          iconColorClass="text-blue-600 dark:text-blue-400"
        />
        <KPICard 
          title="Pending Approval" 
          value="7" 
          icon={Clock} 
          iconBgClass="bg-amber-50 dark:bg-amber-900/20"
          iconColorClass="text-amber-600 dark:text-amber-400"
        />
        <KPICard 
          title="Sick Leaves" 
          value="4" 
          icon={Plus} 
          iconBgClass="bg-rose-50 dark:bg-rose-900/20"
          iconColorClass="text-rose-600 dark:text-rose-400"
        />
        <KPICard 
          title="Total This Month" 
          value="28" 
          icon={Calendar} 
          iconBgClass="bg-indigo-50 dark:bg-indigo-900/20"
          iconColorClass="text-indigo-600 dark:text-indigo-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/50">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search staff or leave type..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all dark:text-white"
                />
              </div>
              <button onClick={handleCycleStatus} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all">
                <Filter className="w-4 h-4" />
                {statusFilter}
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    <th className="py-4 px-6">Staff Member</th>
                    <th className="py-4 px-6">Leave Type</th>
                    <th className="py-4 px-6">Duration</th>
                    <th className="py-4 px-6">Start Date</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredLeaves.map((leave, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img 
                            src={`https://ui-avatars.com/api/?name=${leave.staff.replace(' ', '+')}&background=eff6ff&color=2563eb&bold=true`} 
                            className="w-8 h-8 rounded-lg"
                            alt={leave.staff}
                          />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{leave.staff}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">{leave.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-600 dark:text-slate-400">{leave.type}</td>
                      <td className="py-4 px-6 font-bold text-slate-700 dark:text-slate-300">{leave.duration}</td>
                      <td className="py-4 px-6 text-xs text-slate-500 font-medium">{leave.start}</td>
                      <td className="py-4 px-6">
                        <span className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                          leave.status === 'Approved' ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                          leave.status === 'Pending' ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                          "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                        )}>
                          {leave.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleStatusUpdate(leave.id, 'Approved', leave.staff)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleStatusUpdate(leave.id, 'Rejected', leave.staff)} className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors">
                            <XCircle className="w-4 h-4" />
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
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Leave Distribution</h3>
            <div className="space-y-6">
              {[
                { label: 'Sick Leave', value: 45, color: 'bg-rose-500' },
                { label: 'Casual Leave', value: 30, color: 'bg-blue-500' },
                { label: 'Annual Leave', value: 20, color: 'bg-emerald-500' },
                { label: 'Maternity', value: 5, color: 'bg-purple-500' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-slate-500 uppercase tracking-wider">{item.label}</span>
                    <span className="text-slate-900 dark:text-white">{item.value}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className={cn("h-full rounded-full", item.color)} style={{ width: `${item.value}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-2xl text-white shadow-xl shadow-blue-900/20">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Policy Quick Link
            </h3>
            <p className="text-indigo-100 text-xs mb-6">Review the updated school leave and attendance policies for the 2026 session.</p>
            <button
              onClick={() =>
                showToast({
                  title: 'Policy document opened',
                  description: 'The current leave and attendance policy is ready for HR review.',
                  variant: 'info',
                })
              }
              className="w-full py-3 bg-white text-indigo-600 font-bold rounded-xl text-sm hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
            >
              View Policy Document
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
