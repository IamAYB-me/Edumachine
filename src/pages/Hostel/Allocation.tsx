import React, { useState } from 'react';
import { Search, Filter, Plus, Home, Key, UserCheck, ChevronRight, LayoutGrid, Clock, X } from 'lucide-react';
import { cn } from '@/utils';
import { KPICard } from '@/components/ui/KPICard';
import { useToastStore } from '@/store/useToastStore';

export default function RoomAllocation() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Allocated' | 'Pending' | 'Available'>('All');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    room: 'Block A - 101',
    student: '',
    type: 'Single',
    status: 'Allocated' as 'Allocated' | 'Pending' | 'Available',
  });
  const showToast = useToastStore((state) => state.showToast);

  const [allocations, setAllocations] = useState([
    { id: 'ALC-001', room: 'Block A - 101', student: 'John Doe', type: 'Single', status: 'Allocated', date: '2026-07-01' },
    { id: 'ALC-002', room: 'Block A - 102', student: 'Liam Smith', type: 'Double', status: 'Allocated', date: '2026-07-01' },
    { id: 'ALC-003', room: 'Block B - 201', student: 'Emma Johnson', type: 'Single', status: 'Pending', date: '-' },
    { id: 'ALC-004', room: 'Block B - 205', student: '-', type: 'Double', status: 'Available', date: '-' },
  ]);

  const filteredAllocations = allocations.filter((allocation) => {
    const matchesSearch =
      allocation.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
      allocation.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
      allocation.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || allocation.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const cycleStatusFilter = () => {
    setStatusFilter((current) => {
      const order: Array<'All' | 'Allocated' | 'Pending' | 'Available'> = ['All', 'Allocated', 'Pending', 'Available'];
      const nextValue = order[(order.indexOf(current) + 1) % order.length];

      showToast({
        title: 'Allocation filter updated',
        description: `Showing ${nextValue.toLowerCase()} room allocations.`,
        variant: 'info',
      });

      return nextValue;
    });
  };

  const handleCreateAllocation = () => {
    if (!formData.student.trim() && formData.status !== 'Available') {
      showToast({
        title: 'Student name required',
        description: 'Enter a student name unless the room remains available.',
        variant: 'warning',
      });
      return;
    }

    const newAllocation = {
      id: `ALC-${String(allocations.length + 1).padStart(3, '0')}`,
      room: formData.room,
      student: formData.status === 'Available' ? '-' : formData.student,
      type: formData.type,
      status: formData.status,
      date: formData.status === 'Allocated' ? new Date().toISOString().split('T')[0] : '-',
    };

    setAllocations((current) => [newAllocation, ...current]);
    setShowModal(false);
    setFormData({
      room: 'Block A - 101',
      student: '',
      type: 'Single',
      status: 'Allocated',
    });
    showToast({
      title: 'Allocation saved',
      description: `${newAllocation.room} has been added to the allocation registry.`,
      variant: 'success',
    });
  };

  const handleViewAllocation = (allocationId: string, room: string, status: string) => {
    showToast({
      title: `Allocation ${allocationId}`,
      description: `${room} is currently marked ${status.toLowerCase()}.`,
      variant: 'info',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Room Allocation</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage and track student room assignments.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Allocation
        </button>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Total Rooms" 
          value="120" 
          icon={Home} 
          iconBgClass="bg-blue-50 dark:bg-blue-900/20"
          iconColorClass="text-blue-600 dark:text-blue-400"
        />
        <KPICard 
          title="Allocated" 
          value="108" 
          icon={UserCheck} 
          iconBgClass="bg-emerald-50 dark:bg-emerald-900/20"
          iconColorClass="text-emerald-600 dark:text-emerald-400"
        />
        <KPICard 
          title="Available" 
          value="12" 
          icon={Key} 
          iconBgClass="bg-indigo-50 dark:bg-indigo-900/20"
          iconColorClass="text-indigo-600 dark:text-indigo-400"
        />
        <KPICard 
          title="Pending Request" 
          value="5" 
          icon={Clock} 
          iconBgClass="bg-amber-50 dark:bg-amber-900/20"
          iconColorClass="text-amber-600 dark:text-amber-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Allocation Registry</h3>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search room or occupant..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <button
                  onClick={cycleStatusFilter}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                >
                  <Filter className="h-4 w-4" />
                  {statusFilter === 'All' ? 'All Statuses' : statusFilter}
                </button>
                <button
                  onClick={() => setViewMode((current) => (current === 'table' ? 'cards' : 'table'))}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>

            {viewMode === 'table' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      <th className="py-4 px-6">Room / Block</th>
                      <th className="py-4 px-6">Occupant</th>
                      <th className="py-4 px-6">Type</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredAllocations.map((alc, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                        <td className="py-4 px-6">
                          <p className="font-bold text-slate-900 dark:text-white">{alc.room}</p>
                          <p className="text-[10px] font-mono font-bold text-slate-400">{alc.id}</p>
                        </td>
                        <td className="py-4 px-6 font-medium text-slate-600 dark:text-slate-400">{alc.student}</td>
                        <td className="py-4 px-6 text-xs text-slate-500 font-bold uppercase tracking-wider">{alc.type}</td>
                        <td className="py-4 px-6">
                          <span className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                            alc.status === 'Allocated' ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                            alc.status === 'Available' ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                            "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          )}>
                            {alc.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => handleViewAllocation(alc.id, alc.room, alc.status)}
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
            ) : (
              <div className="grid gap-4 p-4 md:grid-cols-2">
                {filteredAllocations.map((alc) => (
                  <button
                    key={alc.id}
                    onClick={() => handleViewAllocation(alc.id, alc.room, alc.status)}
                    className="rounded-2xl border border-slate-200 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50/40 dark:border-slate-800 dark:hover:bg-slate-800"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{alc.room}</p>
                        <p className="text-xs font-mono text-slate-400">{alc.id}</p>
                      </div>
                      <span className="text-xs font-semibold text-blue-600">{alc.status}</span>
                    </div>
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{alc.student}</p>
                    <p className="mt-1 text-xs uppercase tracking-wider text-slate-400">{alc.type}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Block Distribution</h3>
            <div className="space-y-6">
              {[
                { label: 'Block A (Boys)', value: 92, color: 'bg-blue-500' },
                { label: 'Block B (Girls)', value: 88, color: 'bg-rose-500' },
                { label: 'Block C (Senior)', value: 75, color: 'bg-emerald-500' },
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

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl text-white shadow-xl">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Vacant Spaces</span>
                <span className="text-sm font-bold text-emerald-400">24</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Cleaning Today</span>
                <span className="text-sm font-bold text-blue-400">Block B</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-xs text-slate-400 font-medium">Safety Check</span>
                <span className="text-sm font-bold text-emerald-400">Passed</span>
              </div>
            </div>
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
                <h2 className="text-lg font-bold text-slate-900">New Allocation</h2>
                <p className="text-sm text-slate-500">Assign a student to a room or reserve a room as available.</p>
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
                <span>Room</span>
                <select
                  value={formData.room}
                  onChange={(event) => setFormData((current) => ({ ...current, room: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                >
                  <option>Block A - 101</option>
                  <option>Block A - 102</option>
                  <option>Block B - 201</option>
                  <option>Block B - 205</option>
                  <option>Block C - 310</option>
                </select>
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Student Name</span>
                <input
                  value={formData.student}
                  onChange={(event) => setFormData((current) => ({ ...current, student: event.target.value }))}
                  placeholder="Enter resident name"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                />
              </label>
              <div className="grid gap-5 md:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Room Type</span>
                  <select
                    value={formData.type}
                    onChange={(event) => setFormData((current) => ({ ...current, type: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  >
                    <option>Single</option>
                    <option>Double</option>
                    <option>Triple</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Status</span>
                  <select
                    value={formData.status}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        status: event.target.value as 'Allocated' | 'Pending' | 'Available',
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  >
                    <option>Allocated</option>
                    <option>Pending</option>
                    <option>Available</option>
                  </select>
                </label>
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
                onClick={handleCreateAllocation}
                className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Save Allocation
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
