import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, Building, BedDouble, Filter, X } from 'lucide-react';
import { cn } from '@/utils';
import { useToastStore } from '@/store/useToastStore';

interface Room {
  id: string;
  roomNo: string;
  hostel: string;
  type: 'Single' | 'Double' | 'Triple' | 'Quad';
  capacity: number;
  occupied: number;
  status: 'Available' | 'Full' | 'Maintenance';
}

const INITIAL_ROOMS: Room[] = [
  { id: '1', roomNo: '101', hostel: 'Maple Hostel', type: 'Double', capacity: 2, occupied: 2, status: 'Full' },
  { id: '2', roomNo: '102', hostel: 'Maple Hostel', type: 'Double', capacity: 2, occupied: 1, status: 'Available' },
  { id: '3', roomNo: '201', hostel: 'Oak Hostel', type: 'Single', capacity: 1, occupied: 0, status: 'Available' },
  { id: '4', roomNo: '305', hostel: 'Pine Hostel', type: 'Quad', capacity: 4, occupied: 4, status: 'Full' },
  { id: '5', roomNo: '110', hostel: 'Cedar Hostel', type: 'Triple', capacity: 3, occupied: 0, status: 'Maintenance' },
];

export default function RoomsManagement() {
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | Room['status']>('All');
  const [showModal, setShowModal] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    roomNo: '',
    hostel: 'Maple Hostel',
    type: 'Double' as Room['type'],
    capacity: 2,
    occupied: 0,
    status: 'Available' as Room['status'],
  });
  const showToast = useToastStore((state) => state.showToast);

  const filteredRooms = rooms.filter(room => 
    (room.roomNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.hostel.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === 'All' || room.status === statusFilter)
  );

  const resetForm = () => {
    setFormData({
      roomNo: '',
      hostel: 'Maple Hostel',
      type: 'Double',
      capacity: 2,
      occupied: 0,
      status: 'Available',
    });
    setEditingRoomId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (room: Room) => {
    setEditingRoomId(room.id);
    setFormData({
      roomNo: room.roomNo,
      hostel: room.hostel,
      type: room.type,
      capacity: room.capacity,
      occupied: room.occupied,
      status: room.status,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const cycleFilter = () => {
    setStatusFilter((current) => {
      const options: Array<'All' | Room['status']> = ['All', 'Available', 'Full', 'Maintenance'];
      const nextValue = options[(options.indexOf(current) + 1) % options.length];

      showToast({
        title: 'Room filter updated',
        description: `Showing ${nextValue.toLowerCase()} rooms.`,
        variant: 'info',
      });

      return nextValue;
    });
  };

  const handleSaveRoom = () => {
    if (!formData.roomNo.trim()) {
      showToast({
        title: 'Room number required',
        description: 'Enter a room number before saving.',
        variant: 'warning',
      });
      return;
    }

    const payload: Room = {
      id: editingRoomId ?? `room-${Date.now()}`,
      ...formData,
      occupied: Math.min(formData.occupied, formData.capacity),
    };

    setRooms((current) =>
      editingRoomId
        ? current.map((room) => (room.id === editingRoomId ? payload : room))
        : [payload, ...current]
    );

    showToast({
      title: editingRoomId ? 'Room updated' : 'Room added',
      description: `${payload.hostel} room ${payload.roomNo} is now saved.`,
      variant: 'success',
    });
    closeModal();
  };

  const handleDeleteRoom = (roomId: string) => {
    const room = rooms.find((item) => item.id === roomId);
    setRooms((current) => current.filter((item) => item.id !== roomId));
    showToast({
      title: 'Room removed',
      description: room ? `${room.hostel} room ${room.roomNo} has been removed from inventory.` : 'The room has been removed.',
      variant: 'warning',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Room Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage hostel rooms, capacity, and availability.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add New Room
        </button>
      </div>

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
              {filteredRooms.map((room, idx) => (
                <tr key={room.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="py-4 px-6 text-center text-slate-500">{idx + 1}</td>
                  <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">{room.roomNo}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Building className="w-4 h-4 text-slate-400" />
                      {room.hostel}
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
                        <span>{room.occupied} / {room.capacity}</span>
                        <span>{Math.round((room.occupied / room.capacity) * 100)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all",
                            (room.occupied / room.capacity) > 0.8 ? "bg-rose-500" : "bg-emerald-500"
                          )}
                          style={{ width: `${(room.occupied / room.capacity) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={cn(
                      "inline-block px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      room.status === 'Available' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30" :
                      room.status === 'Full' ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30" :
                      "bg-rose-100 text-rose-700 dark:bg-rose-900/30"
                    )}>
                      {room.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(room)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{editingRoomId ? 'Edit Room' : 'Add New Room'}</h2>
                <p className="text-sm text-slate-500">Update room details, occupancy, and current availability.</p>
              </div>
              <button
                onClick={closeModal}
                className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
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
                    value={formData.hostel}
                    onChange={(event) => setFormData((current) => ({ ...current, hostel: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  >
                    <option>Maple Hostel</option>
                    <option>Oak Hostel</option>
                    <option>Pine Hostel</option>
                    <option>Cedar Hostel</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Room Type</span>
                  <select
                    value={formData.type}
                    onChange={(event) => setFormData((current) => ({ ...current, type: event.target.value as Room['type'] }))}
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
                    onChange={(event) => setFormData((current) => ({ ...current, status: event.target.value as Room['status'] }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  >
                    <option>Available</option>
                    <option>Full</option>
                    <option>Maintenance</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Capacity</span>
                  <input
                    type="number"
                    min={1}
                    value={formData.capacity}
                    onChange={(event) =>
                      setFormData((current) => ({ ...current, capacity: Number(event.target.value) || 1 }))
                    }
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Occupied Beds</span>
                  <input
                    type="number"
                    min={0}
                    max={formData.capacity}
                    value={formData.occupied}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        occupied: Math.min(Number(event.target.value) || 0, current.capacity),
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  />
                </label>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                onClick={closeModal}
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
    </div>
  );
}
