import React, { useState } from 'react';
import { Search, Filter, Plus, Wrench, Clock, CheckCircle, ShieldAlert, ChevronRight, MessageSquare, X } from 'lucide-react';
import { cn } from '@/utils';
import { KPICard } from '@/components/ui/KPICard';
import { useToastStore } from '@/store/useToastStore';

export default function HostelMaintenance() {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    room: 'Block A - 105',
    title: '',
    priority: 'Medium' as 'High' | 'Medium' | 'Low',
  });
  const showToast = useToastStore((state) => state.showToast);

  const [requests, setRequests] = useState([
    { id: 'MNT-401', room: 'Block A - 105', title: 'Leaking Tap', priority: 'High', status: 'In Progress', date: '2026-07-06' },
    { id: 'MNT-402', room: 'Block B - 212', title: 'Fan Not Working', priority: 'Medium', status: 'Pending', date: '2026-07-07' },
    { id: 'MNT-403', room: 'Block A - 301', title: 'Broken Window Pane', priority: 'High', status: 'Completed', date: '2026-07-05' },
    { id: 'MNT-404', room: 'Block C - 102', title: 'Light Bulb Replacement', priority: 'Low', status: 'Pending', date: '2026-07-07' },
  ]);

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'All' || request.priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  const cyclePriorityFilter = () => {
    setPriorityFilter((current) => {
      const order: Array<'All' | 'High' | 'Medium' | 'Low'> = ['All', 'High', 'Medium', 'Low'];
      const nextValue = order[(order.indexOf(current) + 1) % order.length];

      showToast({
        title: 'Maintenance filter updated',
        description: `Showing ${nextValue.toLowerCase()} priority requests.`,
        variant: 'info',
      });

      return nextValue;
    });
  };

  const handleCreateRequest = () => {
    if (!formData.title.trim()) {
      showToast({
        title: 'Issue title required',
        description: 'Describe the maintenance issue before saving the request.',
        variant: 'warning',
      });
      return;
    }

    const newRequest = {
      id: `MNT-${400 + requests.length + 1}`,
      room: formData.room,
      title: formData.title,
      priority: formData.priority,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
    };

    setRequests((current) => [newRequest, ...current]);
    setShowModal(false);
    setFormData({
      room: 'Block A - 105',
      title: '',
      priority: 'Medium',
    });
    showToast({
      title: 'Request submitted',
      description: `${newRequest.title} has been logged for ${newRequest.room}.`,
      variant: 'success',
    });
  };

  const handleRequestAction = (requestId: string) => {
    let nextStatus = '';

    setRequests((current) =>
      current.map((request) => {
        if (request.id !== requestId) {
          return request;
        }

        nextStatus =
          request.status === 'Pending'
            ? 'In Progress'
            : request.status === 'In Progress'
              ? 'Completed'
              : 'Completed';

        return { ...request, status: nextStatus };
      })
    );

    showToast({
      title: 'Request updated',
      description: `${requestId} moved to ${nextStatus || 'completed'}.`,
      variant: 'success',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Maintenance Requests</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Track and manage facility repairs across all hostel blocks.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-rose-900/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Request
        </button>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Open Requests" 
          value="12" 
          icon={Wrench} 
          iconBgClass="bg-blue-50 dark:bg-blue-900/20"
          iconColorClass="text-blue-600 dark:text-blue-400"
        />
        <KPICard 
          title="Pending" 
          value="8" 
          icon={Clock} 
          iconBgClass="bg-amber-50 dark:bg-amber-900/20"
          iconColorClass="text-amber-600 dark:text-amber-400"
        />
        <KPICard 
          title="Completed (M)" 
          value="42" 
          icon={CheckCircle} 
          iconBgClass="bg-emerald-50 dark:bg-emerald-900/20"
          iconColorClass="text-emerald-600 dark:text-emerald-400"
        />
        <KPICard 
          title="Critical Issues" 
          value="3" 
          icon={ShieldAlert} 
          iconBgClass="bg-rose-50 dark:bg-rose-900/20"
          iconColorClass="text-rose-600 dark:text-rose-400"
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
                  placeholder="Search request or room..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all dark:text-white"
                />
              </div>
              <button
                onClick={cyclePriorityFilter}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all"
              >
                <Filter className="w-4 h-4" />
                {priorityFilter === 'All' ? 'All Priorities' : priorityFilter}
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    <th className="py-4 px-6">Issue / ID</th>
                    <th className="py-4 px-6">Location</th>
                    <th className="py-4 px-6">Priority</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredRequests.map((req, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-900 dark:text-white">{req.title}</p>
                        <p className="text-[10px] font-mono font-bold text-slate-400">{req.id}</p>
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-600 dark:text-slate-400">{req.room}</td>
                      <td className="py-4 px-6">
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded",
                          req.priority === 'High' ? "text-rose-600 bg-rose-50 dark:bg-rose-900/20" :
                          req.priority === 'Medium' ? "text-amber-600 bg-amber-50 dark:bg-amber-900/20" :
                          "text-blue-600 bg-blue-50 dark:bg-blue-900/20"
                        )}>
                          {req.priority}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                          req.status === 'Completed' ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                          req.status === 'In Progress' ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                          "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        )}>
                          {req.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleRequestAction(req.id)}
                          className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
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
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Staff Availability</h3>
            <div className="space-y-4">
              {[
                { name: 'John Plumber', role: 'Plumbing', status: 'On Duty' },
                { name: 'Mike Electrician', role: 'Electrical', status: 'Busy' },
                { name: 'Robert Carpenter', role: 'Furniture', status: 'On Leave' },
              ].map((staff, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{staff.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{staff.role}</p>
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest",
                    staff.status === 'On Duty' ? "text-emerald-600" :
                    staff.status === 'Busy' ? "text-amber-600" : "text-slate-400"
                  )}>
                    {staff.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl text-white shadow-xl border border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/10 rounded-lg">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold">Maintenance Chat</h3>
            </div>
            <p className="text-slate-400 text-xs mb-6">Send quick updates or photos of issues directly to the maintenance team.</p>
            <button
              onClick={() =>
                showToast({
                  title: 'Team chat opened',
                  description: 'Maintenance coordination thread is ready for photos, status updates, and follow-up notes.',
                  variant: 'info',
                })
              }
              className="w-full py-3 bg-white text-slate-900 font-bold rounded-xl text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              Open Team Chat
            </button>
          </div>
        </div>
      </div>

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onClick={() => setShowModal(false)}>
          <div
            className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">New Maintenance Request</h2>
                <p className="text-sm text-slate-500">Log repairs and route them to the maintenance team.</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-6">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Room / Block</span>
                <select
                  value={formData.room}
                  onChange={(event) => setFormData((current) => ({ ...current, room: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-rose-500"
                >
                  <option>Block A - 105</option>
                  <option>Block A - 301</option>
                  <option>Block B - 212</option>
                  <option>Block C - 102</option>
                </select>
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Issue Title</span>
                <input
                  value={formData.title}
                  onChange={(event) => setFormData((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Describe the issue"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-rose-500"
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Priority</span>
                <select
                  value={formData.priority}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      priority: event.target.value as 'High' | 'Medium' | 'Low',
                    }))
                  }
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-rose-500"
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </label>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRequest}
                className="rounded-2xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
              >
                Save Request
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
