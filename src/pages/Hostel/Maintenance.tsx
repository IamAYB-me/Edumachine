import React, { useMemo, useState } from 'react';
import { Search, Filter, Plus, Wrench, Clock, CheckCircle, ShieldAlert, ChevronRight, Trash2, X } from 'lucide-react';
import { cn } from '@/utils';
import { KPICard } from '@/components/ui/KPICard';
import { useToastStore } from '@/store/useToastStore';
import { useDataStore, type HostelMaintenanceRequest } from '@/store/useDataStore';

export default function HostelMaintenance() {
  const requests = useDataStore((state) => state.hostelMaintenance);
  const hostelRooms = useDataStore((state) => state.hostelRooms);
  const addRequest = useDataStore((state) => state.addHostelMaintenance);
  const updateRequest = useDataStore((state) => state.updateHostelMaintenance);
  const deleteRequest = useDataStore((state) => state.deleteHostelMaintenance);
  const showToast = useToastStore((state) => state.showToast);

  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    roomId: '',
    title: '',
    priority: 'Medium' as 'High' | 'Medium' | 'Low',
  });

  const filteredRequests = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return requests.filter((request) => {
      const matchesSearch =
        request.title.toLowerCase().includes(term) ||
        request.roomNo.toLowerCase().includes(term) ||
        request.hostelName.toLowerCase().includes(term) ||
        request.id.toLowerCase().includes(term);
      return matchesSearch && (priorityFilter === 'All' || request.priority === priorityFilter);
    });
  }, [requests, searchTerm, priorityFilter]);

  const stats = useMemo(
    () => ({
      open: requests.filter((r) => r.status !== 'Completed').length,
      pending: requests.filter((r) => r.status === 'Pending').length,
      inProgress: requests.filter((r) => r.status === 'In Progress').length,
      completed: requests.filter((r) => r.status === 'Completed').length,
      critical: requests.filter((r) => r.priority === 'High' && r.status !== 'Completed').length,
    }),
    [requests],
  );

  const byHostel = useMemo(() => {
    const map = new Map<string, number>();
    requests
      .filter((r) => r.status !== 'Completed')
      .forEach((r) => map.set(r.hostelName, (map.get(r.hostelName) ?? 0) + 1));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [requests]);

  const cyclePriorityFilter = () => {
    const order: Array<'All' | 'High' | 'Medium' | 'Low'> = ['All', 'High', 'Medium', 'Low'];
    setPriorityFilter(order[(order.indexOf(priorityFilter) + 1) % order.length]);
  };

  const handleCreateRequest = () => {
    if (!formData.title.trim()) {
      showToast({ title: 'Issue title required', description: 'Describe the maintenance issue before saving.', variant: 'warning' });
      return;
    }
    const room = hostelRooms.find((r) => r.id === formData.roomId);
    if (!room) {
      showToast({ title: 'Room required', description: 'Choose the room that needs attention.', variant: 'warning' });
      return;
    }
    addRequest({
      hostelName: room.hostelName,
      roomNo: room.roomNo,
      title: formData.title.trim(),
      priority: formData.priority,
      status: 'Pending',
    });
    showToast({
      title: 'Request logged',
      description: `${formData.title.trim()} — ${room.hostelName} ${room.roomNo}.`,
      variant: 'success',
    });
    setShowModal(false);
    setFormData({ roomId: '', title: '', priority: 'Medium' });
  };

  const advanceStatus = (request: HostelMaintenanceRequest) => {
    const next: HostelMaintenanceRequest['status'] =
      request.status === 'Pending' ? 'In Progress' : 'Completed';
    updateRequest(request.id, { status: next });
    showToast({ title: 'Request updated', description: `${request.id} → ${next}.`, variant: 'success' });
  };

  const handleDelete = (request: HostelMaintenanceRequest) => {
    deleteRequest(request.id);
    showToast({ title: 'Request removed', description: request.title, variant: 'warning' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Maintenance Requests</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Track and manage facility repairs across all hostels.</p>
        </div>
        <button
          onClick={() => {
            if (hostelRooms.length === 0) {
              showToast({ title: 'No rooms yet', description: 'Add rooms in Room Management first.', variant: 'warning' });
              return;
            }
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-rose-900/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Request
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Open Requests" value={String(stats.open)} icon={Wrench} iconBgClass="bg-blue-50 dark:bg-blue-900/20" iconColorClass="text-blue-600 dark:text-blue-400" />
        <KPICard title="Pending" value={String(stats.pending)} icon={Clock} iconBgClass="bg-amber-50 dark:bg-amber-900/20" iconColorClass="text-amber-600 dark:text-amber-400" />
        <KPICard title="In Progress" value={String(stats.inProgress)} icon={CheckCircle} iconBgClass="bg-indigo-50 dark:bg-indigo-900/20" iconColorClass="text-indigo-600 dark:text-indigo-400" />
        <KPICard title="Critical Open" value={String(stats.critical)} icon={ShieldAlert} iconBgClass="bg-rose-50 dark:bg-rose-900/20" iconColorClass="text-rose-600 dark:text-rose-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/50">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search request, hostel or room..."
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
                  {filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-900 dark:text-white">{req.title}</p>
                        <p className="text-[10px] font-mono font-bold text-slate-400">{req.id}</p>
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-600 dark:text-slate-400">
                        {req.hostelName} — {req.roomNo}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={cn(
                            'text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded',
                            req.priority === 'High'
                              ? 'text-rose-600 bg-rose-50 dark:bg-rose-900/20'
                              : req.priority === 'Medium'
                                ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/20'
                                : 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
                          )}
                        >
                          {req.priority}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider',
                            req.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                              : req.status === 'In Progress'
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                          )}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-1">
                          {req.status !== 'Completed' ? (
                            <button
                              onClick={() => advanceStatus(req)}
                              className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                              title={req.status === 'Pending' ? 'Start work' : 'Mark completed'}
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          ) : null}
                          <button
                            onClick={() => handleDelete(req)}
                            className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-all"
                            title="Delete request"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-sm text-slate-500">
                        No maintenance requests logged.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Open by Hostel</h3>
            {byHostel.length === 0 ? (
              <p className="text-xs text-slate-400">Nothing outstanding.</p>
            ) : (
              <div className="space-y-4">
                {byHostel.map(([hostel, count]) => (
                  <div key={hostel} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{hostel}</p>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600">{count} open</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl text-white shadow-xl border border-slate-800">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Completed</h3>
            <p className="text-3xl font-bold text-emerald-400">{stats.completed}</p>
            <p className="text-xs text-slate-400 mt-1">requests closed so far.</p>
          </div>
        </div>
      </div>

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">New Maintenance Request</h2>
                <p className="text-sm text-slate-500">Log a repair for a specific hostel room.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-6">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Room</span>
                <select
                  value={formData.roomId}
                  onChange={(event) => setFormData((current) => ({ ...current, roomId: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-rose-500"
                >
                  <option value="">Select room…</option>
                  {hostelRooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.hostelName} — {room.roomNo}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Issue</span>
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
                  onChange={(event) => setFormData((current) => ({ ...current, priority: event.target.value as 'High' | 'Medium' | 'Low' }))}
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
