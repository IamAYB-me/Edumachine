import React, { useMemo, useState } from 'react';
import { Search, Home, Key, UserCheck, Clock, X } from 'lucide-react';
import { cn } from '@/utils';
import { KPICard } from '@/components/ui/KPICard';
import { useToastStore } from '@/store/useToastStore';
import { useDataStore } from '@/store/useDataStore';
import { useAuthStore } from '@/store/useAuthStore';
import { resolveSchoolProfile, getPortalLevelLabels } from '@/utils/schoolProfile';

export default function RoomAllocation() {
  const students = useDataStore((state) => state.students);
  const hostelRooms = useDataStore((state) => state.hostelRooms);
  const allocateRoom = useDataStore((state) => state.allocateRoom);
  const vacateRoom = useDataStore((state) => state.vacateRoom);
  const schools = useDataStore((state) => state.schools);
  const authUser = useAuthStore((state) => state.user);
  const schoolProfile = resolveSchoolProfile(authUser, schools);
  const labels = getPortalLevelLabels(schoolProfile.portalLevel);
  const showToast = useToastStore((state) => state.showToast);

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ studentId: '', roomId: '' });

  const occupantsOf = (roomId: string) => {
    const room = hostelRooms.find((r) => r.id === roomId);
    if (!room) return [];
    return students.filter(
      (student) =>
        student.roomNumber === room.roomNo &&
        (student.hostelName === room.hostelName || student.hostel === room.hostelName),
    );
  };

  const occupiedBeds = hostelRooms.reduce((total, room) => total + occupantsOf(room.id).length, 0);
  const totalBeds = hostelRooms.reduce((total, room) => total + room.capacity, 0);
  const freeBeds = Math.max(0, totalBeds - occupiedBeds);
  const unallocated = students.filter((student) => student.status === 'Active' && !student.roomNumber);

  const roomsWithSpace = hostelRooms.filter(
    (room) => room.status !== 'Maintenance' && occupantsOf(room.id).length < room.capacity,
  );

  const filteredRooms = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return hostelRooms.filter((room) => {
      const residents = occupantsOf(room.id).map((s) => s.name.toLowerCase()).join(' ');
      return (
        room.roomNo.toLowerCase().includes(term) ||
        room.hostelName.toLowerCase().includes(term) ||
        residents.includes(term)
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hostelRooms, students, searchTerm]);

  const handleAllocate = () => {
    const student = students.find((s) => s.id === formData.studentId);
    const room = hostelRooms.find((r) => r.id === formData.roomId);
    if (!student || !room) {
      showToast({ title: 'Choose a student and a room', variant: 'warning' });
      return;
    }
    const result = allocateRoom(student.id, room);
    if (!result.success) {
      showToast({ title: 'Allocation failed', description: result.error, variant: 'error' });
      return;
    }
    showToast({
      title: 'Room allocated',
      description: `${student.name} → ${room.hostelName} ${room.roomNo}.`,
      variant: 'success',
    });
    setShowModal(false);
    setFormData({ studentId: '', roomId: '' });
  };

  const handleVacate = (studentId: string, studentName: string) => {
    const result = vacateRoom(studentId);
    if (!result.success) {
      showToast({ title: 'Could not vacate', description: result.error, variant: 'error' });
      return;
    }
    showToast({ title: 'Room released', description: `${studentName} has been checked out.`, variant: 'info' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Room Allocation</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Assign residents to hostel rooms and track vacancies.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all"
        >
          <UserCheck className="w-4 h-4" />
          New Allocation
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Rooms" value={String(hostelRooms.length)} icon={Home} iconBgClass="bg-blue-50 dark:bg-blue-900/20" iconColorClass="text-blue-600 dark:text-blue-400" />
        <KPICard title="Beds Occupied" value={String(occupiedBeds)} icon={UserCheck} iconBgClass="bg-emerald-50 dark:bg-emerald-900/20" iconColorClass="text-emerald-600 dark:text-emerald-400" />
        <KPICard title="Beds Free" value={String(freeBeds)} icon={Key} iconBgClass="bg-indigo-50 dark:bg-indigo-900/20" iconColorClass="text-indigo-600 dark:text-indigo-400" />
        <KPICard title="Awaiting Room" value={String(unallocated.length)} icon={Clock} iconBgClass="bg-amber-50 dark:bg-amber-900/20" iconColorClass="text-amber-600 dark:text-amber-400" />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Allocation Registry</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search room, hostel or resident..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                <th className="py-4 px-6">Room / Hostel</th>
                <th className="py-4 px-6">Residents</th>
                <th className="py-4 px-6">Type</th>
                <th className="py-4 px-6">Beds</th>
                <th className="py-4 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRooms.map((room) => {
                const residents = occupantsOf(room.id);
                const isFull = residents.length >= room.capacity;
                return (
                  <tr key={room.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-900 dark:text-white">{room.roomNo}</p>
                      <p className="text-[10px] font-mono font-bold text-slate-400">{room.hostelName}</p>
                    </td>
                    <td className="py-4 px-6">
                      {residents.length === 0 ? (
                        <span className="text-slate-400">—</span>
                      ) : (
                        <div className="space-y-1">
                          {residents.map((resident) => (
                            <div key={resident.id} className="flex items-center gap-2">
                              <span className="font-medium text-slate-600 dark:text-slate-300">
                                {resident.name}
                                {resident.bedSpace ? ` (bed ${resident.bedSpace})` : ''}
                              </span>
                              <button
                                onClick={() => handleVacate(resident.id, resident.name)}
                                className="text-slate-300 hover:text-rose-500"
                                aria-label={`Check out ${resident.name}`}
                                title="Check out"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500 font-bold uppercase tracking-wider">{room.type}</td>
                    <td className="py-4 px-6 text-xs font-bold text-slate-600 dark:text-slate-300">
                      {residents.length} / {room.capacity}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider',
                          room.status === 'Maintenance'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                            : isFull
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                        )}
                      >
                        {room.status === 'Maintenance' ? 'Maintenance' : isFull ? 'Full' : 'Available'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filteredRooms.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-slate-500">
                    No rooms yet — add rooms from Room Management.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">New Allocation</h2>
                <p className="text-sm text-slate-500">Assign a {labels.learnerSingular.toLowerCase()} to a room with a free bed.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-5 px-6 py-6">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>{labels.learnerSingular}</span>
                <select
                  value={formData.studentId}
                  onChange={(event) => setFormData((current) => ({ ...current, studentId: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                >
                  <option value="">Select {labels.learnerSingular.toLowerCase()}…</option>
                  {[...unallocated, ...students.filter((s) => s.roomNumber)].map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                      {student.roomNumber ? ` — currently ${student.hostelName || ''} ${student.roomNumber}` : ''}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Room (with free beds)</span>
                <select
                  value={formData.roomId}
                  onChange={(event) => setFormData((current) => ({ ...current, roomId: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                >
                  <option value="">Select room…</option>
                  {roomsWithSpace.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.hostelName} — {room.roomNo} ({room.capacity - occupantsOf(room.id).length} free)
                    </option>
                  ))}
                </select>
              </label>
              {roomsWithSpace.length === 0 ? (
                <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-700">
                  No rooms have free beds. Add rooms or increase capacity in Room Management.
                </p>
              ) : null}
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAllocate}
                className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Allocate Room
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
