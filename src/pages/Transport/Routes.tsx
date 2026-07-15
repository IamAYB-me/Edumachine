import React, { useState } from 'react';
import { Search, Filter, Plus, MapPin, Navigation, Users, Clock, ChevronRight, MoreVertical, X } from 'lucide-react';
import { cn } from '@/utils';
import { KPICard } from '@/components/ui/KPICard';
import { useToastStore } from '@/store/useToastStore';

export default function TransportRoutes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [driverFilter, setDriverFilter] = useState<'All Drivers' | 'Robert Brown' | 'Sarah Jenkins' | 'John Wick' | 'Mike Tyson'>('All Drivers');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    start: 'Main Campus',
    end: '',
    stops: 6,
    students: 0,
    driver: 'Robert Brown',
  });
  const showToast = useToastStore((state) => state.showToast);

  const [routes, setRoutes] = useState([
    { id: 'RT-01', name: 'Downtown Express', start: 'Main Campus', end: 'Central Station', stops: 8, students: 42, driver: 'Robert Brown' },
    { id: 'RT-02', name: 'West Side Loop', start: 'Main Campus', end: 'West Mall', stops: 12, students: 38, driver: 'Sarah Jenkins' },
    { id: 'RT-03', name: 'Staff Route A', start: 'Staff Quarters', end: 'Main Campus', stops: 4, students: 15, driver: 'John Wick' },
    { id: 'RT-04', name: 'Suburban North', start: 'Main Campus', end: 'North Hill', stops: 15, students: 54, driver: 'Mike Tyson' },
  ]);

  const filteredRoutes = routes.filter((route) => {
    const matchesSearch =
      route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.start.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.end.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.driver.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDriver = driverFilter === 'All Drivers' || route.driver === driverFilter;

    return matchesSearch && matchesDriver;
  });

  const cycleDriverFilter = () => {
    setDriverFilter((current) => {
      const order: Array<'All Drivers' | 'Robert Brown' | 'Sarah Jenkins' | 'John Wick' | 'Mike Tyson'> = [
        'All Drivers',
        'Robert Brown',
        'Sarah Jenkins',
        'John Wick',
        'Mike Tyson',
      ];
      const nextValue = order[(order.indexOf(current) + 1) % order.length];

      showToast({
        title: 'Driver filter updated',
        description: `Showing routes for ${nextValue.toLowerCase()}.`,
        variant: 'info',
      });

      return nextValue;
    });
  };

  const handleCreateRoute = () => {
    if (!formData.name.trim() || !formData.end.trim()) {
      showToast({
        title: 'Complete route details',
        description: 'Route name and destination are required.',
        variant: 'warning',
      });
      return;
    }

    const newRoute = {
      id: `RT-${String(routes.length + 1).padStart(2, '0')}`,
      ...formData,
    };

    setRoutes((current) => [newRoute, ...current]);
    setShowModal(false);
    setFormData({
      name: '',
      start: 'Main Campus',
      end: '',
      stops: 6,
      students: 0,
      driver: 'Robert Brown',
    });
    showToast({
      title: 'Route created',
      description: `${newRoute.name} has been added to the route registry.`,
      variant: 'success',
    });
  };

  const handleRouteAction = (routeName: string, driver: string, students: number) => {
    showToast({
      title: `${routeName} selected`,
      description: `${driver} is assigned to ${students} transport users on this route.`,
      variant: 'info',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Transport Routes</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Design and manage school bus routes and stop points.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Route
        </button>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Active Routes" 
          value="8" 
          icon={Navigation} 
          iconBgClass="bg-blue-50 dark:bg-blue-900/20"
          iconColorClass="text-blue-600 dark:text-blue-400"
        />
        <KPICard 
          title="Total Stops" 
          value="64" 
          icon={MapPin} 
          iconBgClass="bg-emerald-50 dark:bg-emerald-900/20"
          iconColorClass="text-emerald-600 dark:text-emerald-400"
        />
        <KPICard 
          title="Students Using" 
          value="148" 
          icon={Users} 
          iconBgClass="bg-indigo-50 dark:bg-indigo-900/20"
          iconColorClass="text-indigo-600 dark:text-indigo-400"
        />
        <KPICard 
          title="Avg. Time" 
          value="45m" 
          icon={Clock} 
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
                  placeholder="Search routes..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all dark:text-white"
                />
              </div>
              <button
                onClick={cycleDriverFilter}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all"
              >
                <Filter className="w-4 h-4" />
                {driverFilter}
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    <th className="py-4 px-6">Route Name / ID</th>
                    <th className="py-4 px-6">Coverage</th>
                    <th className="py-4 px-6">Stops</th>
                    <th className="py-4 px-6">Students</th>
                    <th className="py-4 px-6 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredRoutes.map((rt, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-900 dark:text-white">{rt.name}</p>
                        <p className="text-[10px] font-mono font-bold text-slate-400">{rt.id}</p>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                          <span className="truncate max-w-[100px]">{rt.start}</span>
                          <ChevronRight className="w-3 h-3 shrink-0" />
                          <span className="truncate max-w-[100px]">{rt.end}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-700 dark:text-slate-300">{rt.stops}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-bold text-slate-900 dark:text-white">{rt.students}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleRouteAction(rt.name, rt.driver, rt.students)}
                          className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                        >
                          <MoreVertical className="w-4 h-4" />
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
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Traffic Analysis</h3>
            <div className="space-y-6">
              {[
                { route: 'Downtown', delay: '5m', status: 'Moderate', color: 'bg-amber-500' },
                { route: 'West Side', delay: '0m', status: 'Clear', color: 'bg-emerald-500' },
                { route: 'Suburban', delay: '12m', status: 'Heavy', color: 'bg-rose-500' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-slate-500 uppercase tracking-wider">{item.route}</span>
                    <span className={cn(
                      "text-[10px] uppercase",
                      item.status === 'Clear' ? "text-emerald-600" :
                      item.status === 'Moderate' ? "text-amber-600" : "text-rose-600"
                    )}>{item.status} (+{item.delay})</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-1000", item.color)} style={{ width: item.status === 'Clear' ? '10%' : item.status === 'Moderate' ? '40%' : '85%' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-2xl text-white shadow-xl">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <Navigation className="w-5 h-5" />
              Live Tracking
            </h3>
            <p className="text-indigo-100 text-xs mb-6">Monitor the real-time location of all active school buses and vans.</p>
            <button
              onClick={() =>
                showToast({
                  title: 'Live map ready',
                  description: 'Current traffic and route conditions are summarized in the transport dashboard cards.',
                  variant: 'info',
                })
              }
              className="w-full py-3 bg-white text-indigo-600 font-bold rounded-xl text-sm hover:bg-blue-50 transition-all shadow-lg"
            >
              Open Live Map
            </button>
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
                <h2 className="text-lg font-bold text-slate-900">Create Route</h2>
                <p className="text-sm text-slate-500">Add a route, destination, and assigned driver.</p>
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
                  <span>Route Name</span>
                  <input
                    value={formData.name}
                    onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                    placeholder="e.g. East Campus Loop"
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Starting Point</span>
                  <input
                    value={formData.start}
                    onChange={(event) => setFormData((current) => ({ ...current, start: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Destination</span>
                  <input
                    value={formData.end}
                    onChange={(event) => setFormData((current) => ({ ...current, end: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                    placeholder="e.g. East Junction"
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Assigned Driver</span>
                  <select
                    value={formData.driver}
                    onChange={(event) => setFormData((current) => ({ ...current, driver: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  >
                    <option>Robert Brown</option>
                    <option>Sarah Jenkins</option>
                    <option>John Wick</option>
                    <option>Mike Tyson</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Number of Stops</span>
                  <input
                    type="number"
                    min={1}
                    value={formData.stops}
                    onChange={(event) => setFormData((current) => ({ ...current, stops: Number(event.target.value) || 1 }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Students Assigned</span>
                  <input
                    type="number"
                    min={0}
                    value={formData.students}
                    onChange={(event) => setFormData((current) => ({ ...current, students: Number(event.target.value) || 0 }))}
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
                onClick={handleCreateRoute}
                className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Save Route
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
