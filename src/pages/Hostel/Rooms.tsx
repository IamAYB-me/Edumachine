import React, { useMemo, useState } from 'react';
import { Search, Plus, Edit, Trash2, Building, BedDouble, Filter, X } from 'lucide-react';
import { cn } from '@/utils';
import { useToastStore } from '@/store/useToastStore';
import { useDataStore, type HostelRoom } from '@/store/useDataStore';

type RoomType = HostelRoom['type'];
type RoomStatus = HostelRoom['status'];

const emptyRoomForm = (hostelName: string) => ({
  roomNo: '',
  hostelId: '',
  hostelName,
  type: 'Double' as RoomType,
  capacity: 2,
  status: 'Available' as RoomStatus,
});

export default function RoomsManagement() {
  const hostelRooms = useDataStore((state) => state.hostelRooms);
  const hostels = useDataStore((state) => state.hostels);
  const students = useDataStore((state) => state.students);
  const addHostel = useDataStore((state) => state.addHostel);
  const deleteHostel = useDataStore((state) => state.deleteHostel);
  const addHostelRoom = useDataStore((state) => state.addHostelRoom);
  const updateHostelRoom = useDataStore((state) => state.updateHostelRoom);
  const deleteHostelRoom = useDataStore((state) => state.deleteHostelRoom);
  const showToast = useToastStore((state) => state.showToast);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | RoomStatus>('All');
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showHostelModal, setShowHostelModal] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [hostelForm, setHostelForm] = useState({ name: '', gender: 'Mixed' as 'Male' | 'Female' | 'Mixed' });
  const [formData, setFormData] = useState(() => emptyRoomForm(hostels[0]?.name ?? ''));

  const occupancyFor = (room: HostelRoom) =>
    students.filter(
      (student) =>
        student.roomNumber === room.roomNo &&
        (student.hostelName === room.hostelName || student.hostel === room.hostelName),
    ).length;

  const effectiveStatus = (room: HostelRoom): RoomStatus => {
    if (room.status === 'Maintenance') return 'Maintenance';
    return occupancyFor(room) >= room.capacity ? 'Full' : 'Available';
  };

  const filteredRooms = useMemo(
    () =>
      hostelRooms.filter((room) => {
        const term = searchTerm.toLowerCase();
        const matchesTerm =
          room.roomNo.toLowerCase().includes(term) || room.hostelName.toLowerCase().includes(term);
        return matchesTerm && (statusFilter === 'All' || effectiveStatus(room) === statusFilter);
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hostelRooms, students, searchTerm, statusFilter],
  );

  const resetRoomForm = () => {
    setFormData(emptyRoomForm(hostels[0]?.name ?? ''));
    setEditingRoomId(null);
  };

  const openCreateModal = () => {
    if (hostels.length === 0) {
      showToast({
        title: 'Add a hostel first',
        description: 'Create at least one hostel before adding rooms.',
        variant: 'warning',
      });
      setShowHostelModal(true);
      return;
    }
    resetRoomForm();
    setShowRoomModal(true);
  };

  const openEditModal = (room: HostelRoom) => {
    setEditingRoomId(room.id);
    setFormData({
      roomNo: room.roomNo,
      hostelId: room.hostelId,
      hostelName: room.hostelName,
      type: room.type,
      capacity: room.capacity,
      status: room.status,
    });
    setShowRoomModal(true);
  };

  const handleSaveRoom = () => {
    if (!formData.roomNo.trim()) {
      showToast({ title: 'Room number required', description: 'Enter a room number before saving.', variant: 'warning' });
      return;
    }
    const hostel = hostels.find((h) => h.id === formData.hostelId) ?? hostels.find((h) => h.name === formData.hostelName);
    if (!hostel) {
      showToast({ title: 'Hostel required', description: 'Choose the hostel this room belongs to.', variant: 'warning' });
      return;
    }

    const duplicate = hostelRooms.find(
      (room) =>
        room.id !== editingRoomId &&
        room.hostelId === hostel.id &&
        room.roomNo.trim().toLowerCase() === formData.roomNo.trim().toLowerCase(),
    );
    if (duplicate) {
      showToast({
        title: 'Room already exists',
        description: `${hostel.name} already has room ${formData.roomNo}.`,
        variant: 'error',
      });
      return;
    }

    const payload = {
      roomNo: formData.roomNo.trim(),
      hostelId: hostel.id,
      hostelName: hostel.name,
      type: formData.type,
      capacity: Math.max(1, formData.capacity),
      status: formData.status,
    };

    if (editingRoomId) {
      updateHostelRoom(editingRoomId, payload);
    } else {
      addHostelRoom(payload);
    }

    showToast({
      title: editingRoomId ? 'Room updated' : 'Room added',
      description: `${hostel.name} room ${payload.roomNo} saved.`,
      variant: 'success',
    });
    setShowRoomModal(false);
    resetRoomForm();
  };

  const handleDeleteRoom = (room: HostelRoom) => {
    const occupants = occupancyFor(room);
    if (occupants > 0) {
      showToast({
        title: 'Room has residents',
        description: `Move the ${occupants} resident(s) out before deleting this room.`,
        variant: 'error',
      });
      return;
    }
    deleteHostelRoom(room.id);
    showToast({ title: 'Room removed', description: `${room.hostelName} ${room.roomNo} removed.`, variant: 'warning' });
  };

  const handleAddHostel = () => {
    if (!hostelForm.name.trim()) {
      showToast({ title: 'Hostel name required', variant: 'warning' });
      return;
    }
    addHostel({ name: hostelForm.name.trim(), gender: hostelForm.gender, active: true });
    showToast({ title: 'Hostel added', description: `${hostelForm.name.trim()} is now available.`, variant: 'success' });
    setHostelForm({ name: '', gender: 'Mixed' });
    setShowHostelModal(false);
  };

  const handleDeleteHostel = (id: string) => {
    const rooms = hostelRooms.filter((room) => room.hostelId === id);
    if (rooms.length > 0) {
      showToast({
        title: 'Hostel has rooms',
        description: 'Delete or reassign its rooms first.',
        variant: 'error',
      });
      return;
    }
    deleteHostel(id);
    showToast({ title: 'Hostel removed', variant: 'warning' });
  };

  const cycleFilter = () => {
    const options: Array<'All' | RoomStatus> = ['All', 'Available', 'Full', 'Maintenance'];
    setStatusFilter(options[(options.indexOf(statusFilter) + 1) % options.length]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Room Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Manage hostels, rooms, capacity and availability.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowHostelModal(true)}
            className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Building className="w-4 h-4" />
            Add Hostel
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New Room
          </button>
        </div>
      </div>

      {hostels.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {hostels.map((hostel) => (
            <span
              key={hostel.id}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300"
            >
              <Building className="w-3 h-3 text-slate-400" />
              {hostel.name}
              <span className="text-slate-400">· {hostel.gender}</span>
              <button
                onClick={() => handleDeleteHostel(hostel.id)}
                className="text-slate-300 hover:text-rose-500"
                aria-label={`Delete ${hostel.name}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center text-sm text-slate-500">
          No hostels yet. Add a hostel (e.g. “Female Hostel A”) to start creating rooms.
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by room no or hostel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 dark:text-white"
            />
          </div>
          <button
            onClick={cycleFilter}
            className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Filter className="w-4 h-4" />
            {statusFilter === 'All' ? 'All Rooms' : statusFilter}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr className="border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-6 text-center w-16">#</th>
                <th className="py-3 px-6">Room No</th>
                <th className="py-3 px-6">Hostel</th>
                <th className="py-3 px-6">Room Type</th>
                <th className="py-3 px-6">Occupancy</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRooms.map((room, idx) => {
                const occupied = occupancyFor(room);
                const status = effectiveStatus(room);
                return (
                  <tr key={room.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="py-4 px-6 text-center text-slate-500">{idx + 1}</td>
                    <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">{room.roomNo}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <Building className="w-4 h-4 text-slate-400" />
                        {room.hostelName}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <BedDouble className="w-4 h-4 text-slate-400" />
                        {room.type}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1.5 w-32">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500">
                          <span>
                            {occupied} / {room.capacity}
                          </span>
                          <span>{Math.round((occupied / Math.max(1, room.capacity)) * 100)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all',
                              occupied / Math.max(1, room.capacity) > 0.8 ? 'bg-rose-500' : 'bg-emerald-500',
                            )}
                            style={{ width: `${Math.min(100, (occupied / Math.max(1, room.capacity)) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={cn(
                          'inline-block px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
                          status === 'Available'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30'
                            : status === 'Full'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30',
                        )}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(room)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          aria-label="Edit room"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRoom(room)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          aria-label="Delete room"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredRooms.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-sm text-slate-500">
                    No rooms yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {showRoomModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onClick={() => setShowRoomModal(false)}>
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{editingRoomId ? 'Edit Room' : 'Add New Room'}</h2>
                <p className="text-sm text-slate-500">Set the hostel, capacity and availability.</p>
              </div>
              <button onClick={() => setShowRoomModal(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-6">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Room Number</span>
                  <input
                    value={formData.roomNo}
                    onChange={(event) => setFormData((current) => ({ ...current, roomNo: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                    placeholder="e.g. 204"
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Hostel</span>
                  <select
                    value={formData.hostelId}
                    onChange={(event) => {
                      const hostel = hostels.find((h) => h.id === event.target.value);
                      setFormData((current) => ({
                        ...current,
                        hostelId: event.target.value,
                        hostelName: hostel?.name ?? current.hostelName,
                      }));
                    }}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  >
                    <option value="">Select hostel…</option>
                    {hostels.map((hostel) => (
                      <option key={hostel.id} value={hostel.id}>
                        {hostel.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Room Type</span>
                  <select
                    value={formData.type}
                    onChange={(event) => setFormData((current) => ({ ...current, type: event.target.value as RoomType }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  >
                    <option>Single</option>
                    <option>Double</option>
                    <option>Triple</option>
                    <option>Quad</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Status</span>
                  <select
                    value={formData.status}
                    onChange={(event) => setFormData((current) => ({ ...current, status: event.target.value as RoomStatus }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  >
                    <option>Available</option>
                    <option>Full</option>
                    <option>Maintenance</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Capacity (beds)</span>
                  <input
                    type="number"
                    min={1}
                    value={formData.capacity}
                    onChange={(event) =>
                      setFormData((current) => ({ ...current, capacity: Math.max(1, Number(event.target.value) || 1) }))
                    }
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  />
                </label>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                onClick={() => setShowRoomModal(false)}
                className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRoom}
                className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                {editingRoomId ? 'Save Changes' : 'Create Room'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showHostelModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onClick={() => setShowHostelModal(false)}>
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-bold text-slate-900">Add Hostel</h2>
              <button onClick={() => setShowHostelModal(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-5 px-6 py-6">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Hostel Name</span>
                <input
                  value={hostelForm.name}
                  onChange={(event) => setHostelForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="e.g. Female Hostel A"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Accepts</span>
                <select
                  value={hostelForm.gender}
                  onChange={(event) =>
                    setHostelForm((current) => ({ ...current, gender: event.target.value as 'Male' | 'Female' | 'Mixed' }))
                  }
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                >
                  <option value="Mixed">Male & Female</option>
                  <option value="Male">Male only</option>
                  <option value="Female">Female only</option>
                </select>
              </label>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                onClick={() => setShowHostelModal(false)}
                className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddHostel}
                className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Create Hostel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
