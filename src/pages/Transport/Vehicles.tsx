import React, { useState } from 'react';
import { Search, Filter, Plus, Truck, Gauge, User, ShieldCheck, ChevronRight, Fuel, AlertCircle, X } from 'lucide-react';
import { cn } from '@/utils';
import { KPICard } from '@/components/ui/KPICard';
import { useToastStore } from '@/store/useToastStore';

export default function TransportVehicles() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Maintenance'>('All');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    plate: '',
    driver: '',
    status: 'Active' as 'Active' | 'Maintenance',
    fuel: '100%',
    nextService: '',
  });
  const showToast = useToastStore((state) => state.showToast);

  const [vehicles, setVehicles] = useState([
    { id: 'BUS-001', name: 'School Bus 01', plate: 'ABC-123-XY', driver: 'Robert Brown', status: 'Active', fuel: '75%', nextService: '2026-08-15' },
    { id: 'BUS-002', name: 'School Bus 02', plate: 'XYZ-789-AB', driver: 'Sarah Jenkins', status: 'Active', fuel: '40%', nextService: '2026-08-20' },
    { id: 'BUS-003', name: 'Mini Van 01', plate: 'LMN-456-CD', driver: 'Mike Tyson', status: 'Maintenance', fuel: '10%', nextService: '2026-07-10' },
    { id: 'BUS-004', name: 'Staff Bus 01', plate: 'PQR-321-EF', driver: 'John Wick', status: 'Active', fuel: '90%', nextService: '2026-09-01' },
  ]);

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || vehicle.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const cycleStatusFilter = () => {
    setStatusFilter((current) => {
      const order: Array<'All' | 'Active' | 'Maintenance'> = ['All', 'Active', 'Maintenance'];
      const nextValue = order[(order.indexOf(current) + 1) % order.length];

      showToast({
        title: 'Vehicle filter updated',
        description: `Showing ${nextValue.toLowerCase()} vehicles.`,
        variant: 'info',
      });

      return nextValue;
    });
  };

  const handleAddVehicle = () => {
    if (!formData.name.trim() || !formData.plate.trim() || !formData.driver.trim()) {
      showToast({
        title: 'Complete vehicle details',
        description: 'Vehicle name, plate number, and driver are required.',
        variant: 'warning',
      });
      return;
    }

    const newVehicle = {
      id: `BUS-${String(vehicles.length + 1).padStart(3, '0')}`,
      ...formData,
    };

    setVehicles((current) => [newVehicle, ...current]);
    setShowModal(false);
    setFormData({
      name: '',
      plate: '',
      driver: '',
      status: 'Active',
      fuel: '100%',
      nextService: '',
    });
    showToast({
      title: 'Vehicle added',
      description: `${newVehicle.name} has been added to the fleet.`,
      variant: 'success',
    });
  };

  const handleVehicleAction = (vehicleName: string, status: string, nextService: string) => {
    showToast({
      title: `${vehicleName} selected`,
      description: `${vehicleName} is ${status.toLowerCase()} and next service is ${nextService}.`,
      variant: 'info',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Vehicle Fleet</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage and track school transport vehicles and drivers.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Vehicle
        </button>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Total Vehicles" 
          value="12" 
          icon={Truck} 
          iconBgClass="bg-blue-50 dark:bg-blue-900/20"
          iconColorClass="text-blue-600 dark:text-blue-400"
        />
        <KPICard 
          title="Active Now" 
          value="9" 
          icon={ShieldCheck} 
          iconBgClass="bg-emerald-50 dark:bg-emerald-900/20"
          iconColorClass="text-emerald-600 dark:text-emerald-400"
        />
        <KPICard 
          title="Under Service" 
          value="2" 
          icon={AlertCircle} 
          iconBgClass="bg-rose-50 dark:bg-rose-900/20"
          iconColorClass="text-rose-600 dark:text-rose-400"
        />
        <KPICard 
          title="Avg. Fuel Level" 
          value="68%" 
          icon={Fuel} 
          iconBgClass="bg-amber-50 dark:bg-amber-900/20"
          iconColorClass="text-amber-600 dark:text-amber-400"
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
                  placeholder="Search vehicle or driver..." 
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
                    <th className="py-4 px-6">Vehicle / Plate</th>
                    <th className="py-4 px-6">Driver</th>
                    <th className="py-4 px-6">Fuel Level</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredVehicles.map((vh, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-900 dark:text-white">{vh.name}</p>
                        <p className="text-[10px] font-mono font-bold text-slate-400">{vh.plate}</p>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-medium text-slate-600 dark:text-slate-400">{vh.driver}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full rounded-full",
                                parseInt(vh.fuel) < 20 ? "bg-rose-500" :
                                parseInt(vh.fuel) < 50 ? "bg-amber-500" : "bg-emerald-500"
                              )}
                              style={{ width: vh.fuel }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-slate-500">{vh.fuel}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                          vh.status === 'Active' ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                        )}>
                          {vh.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleVehicleAction(vh.name, vh.status, vh.nextService)}
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
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Service Reminders</h3>
            <div className="space-y-4">
              {[
                { vehicle: 'Bus 03', task: 'Brake Check', date: 'Overdue', color: 'text-rose-600 bg-rose-50' },
                { vehicle: 'Bus 01', task: 'Oil Change', date: 'Aug 15', color: 'text-blue-600 bg-blue-50' },
                { vehicle: 'Van 02', task: 'Tire Rotation', date: 'Aug 22', color: 'text-amber-600 bg-amber-50' },
              ].map((rem, i) => (
                <div key={i} className="flex justify-between items-center p-3 border border-slate-100 dark:border-slate-800 rounded-xl">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{rem.vehicle}</p>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{rem.task}</p>
                  </div>
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded", rem.color)}>
                    {rem.date}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl text-white shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/10 rounded-lg">
                <Gauge className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold">Fleet Performance</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                  <span>Usage Today</span>
                  <span>82%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '82%' }}></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                <div className="text-center">
                  <p className="text-xl font-bold">1,240</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">KM Today</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold">14.2</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">KM/L Avg</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onClick={() => setShowModal(false)}>
          <div
            className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Add Vehicle</h2>
                <p className="text-sm text-slate-500">Register a bus or van and assign a driver.</p>
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
                  <span>Vehicle Name</span>
                  <input
                    value={formData.name}
                    onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                    placeholder="e.g. School Bus 06"
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Plate Number</span>
                  <input
                    value={formData.plate}
                    onChange={(event) => setFormData((current) => ({ ...current, plate: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                    placeholder="e.g. AAA-111-BB"
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Assigned Driver</span>
                  <input
                    value={formData.driver}
                    onChange={(event) => setFormData((current) => ({ ...current, driver: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                    placeholder="Driver name"
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Status</span>
                  <select
                    value={formData.status}
                    onChange={(event) =>
                      setFormData((current) => ({ ...current, status: event.target.value as 'Active' | 'Maintenance' }))
                    }
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  >
                    <option>Active</option>
                    <option>Maintenance</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Fuel Level</span>
                  <input
                    value={formData.fuel}
                    onChange={(event) => setFormData((current) => ({ ...current, fuel: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                    placeholder="e.g. 80%"
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Next Service Date</span>
                  <input
                    type="date"
                    value={formData.nextService}
                    onChange={(event) => setFormData((current) => ({ ...current, nextService: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  />
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
                onClick={handleAddVehicle}
                className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Save Vehicle
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
