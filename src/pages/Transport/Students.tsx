import React, { useMemo, useState } from 'react';
import { Search, Filter, Users, MapPin, Truck, Mail, Phone, Download, Clock, TrendingUp } from 'lucide-react';
import { KPICard } from '@/components/ui/KPICard';
import { useDataStore } from '@/store/useDataStore';
import { useToastStore } from '@/store/useToastStore';
import { downloadTextFile } from '@/utils/fileHelpers';

export default function TransportStudents() {
  const { students } = useDataStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [routeFilter, setRouteFilter] = useState<'All Routes' | 'Route RT-01' | 'Route RT-02' | 'Route RT-03' | 'Route RT-04'>('All Routes');
  const showToast = useToastStore((state) => state.showToast);

  const stops = ['Central Park', 'West Mall', 'North Hill', 'Downtown'] as const;
  const routes = ['Route RT-01', 'Route RT-02', 'Route RT-03', 'Route RT-04'] as const;

  const transportStudents = useMemo(
    () =>
      students.slice(0, 15).map((student, index) => ({
        ...student,
        route: routes[index % routes.length],
        stop: stops[index % stops.length],
        pickupTime: '07:45 AM',
        status: index % 5 === 0 ? 'On Leave' : 'Active',
      })),
    [students]
  );

  const filteredStudents = transportStudents.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.stop.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRoute = routeFilter === 'All Routes' || student.route === routeFilter;

    return matchesSearch && matchesRoute;
  });

  const cycleRouteFilter = () => {
    setRouteFilter((current) => {
      const order: Array<'All Routes' | 'Route RT-01' | 'Route RT-02' | 'Route RT-03' | 'Route RT-04'> = [
        'All Routes',
        'Route RT-01',
        'Route RT-02',
        'Route RT-03',
        'Route RT-04',
      ];
      const nextValue = order[(order.indexOf(current) + 1) % order.length];

      showToast({
        title: 'Route filter updated',
        description: `Showing ${nextValue.toLowerCase()}.`,
        variant: 'info',
      });

      return nextValue;
    });
  };

  const handlePassengerList = () => {
    if (filteredStudents.length === 0) {
      showToast({
        title: 'No passengers to export',
        description: 'Adjust the current search or route filter and try again.',
        variant: 'warning',
      });
      return;
    }

    const content = [
      'EduPlatform Transport Passenger List',
      `Generated: ${new Date().toLocaleString()}`,
      `Filter: ${routeFilter}`,
      '',
      ...filteredStudents.map((student) =>
        [
          `Name: ${student.name}`,
          `Student ID: ${student.studentId}`,
          `Route: ${student.route}`,
          `Bus Stop: ${student.stop}`,
          `Pickup Time: ${student.pickupTime}`,
          `Status: ${student.status}`,
        ].join('\n')
      ),
    ].join('\n\n');

    downloadTextFile('transport-passenger-list.txt', content);
    showToast({
      title: 'Passenger list exported',
      description: `${filteredStudents.length} transport users were exported successfully.`,
      variant: 'success',
    });
  };

  const handleContactAction = (studentName: string, method: 'email' | 'phone') => {
    showToast({
      title: `${method === 'email' ? 'Email' : 'Call'} ready`,
      description: `${studentName}'s transport contact details are ready for ${method === 'email' ? 'a pickup update email' : 'a guardian follow-up call'}.`,
      variant: 'info',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Transport Users</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage students using the school transportation system.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePassengerList}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-all"
          >
            <Download className="w-4 h-4" />
            Passenger List
          </button>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Total Users" 
          value="148" 
          icon={Users} 
          iconBgClass="bg-blue-50 dark:bg-blue-900/20"
          iconColorClass="text-blue-600 dark:text-blue-400"
        />
        <KPICard 
          title="Picked Up Today" 
          value="132" 
          icon={Truck} 
          iconBgClass="bg-emerald-50 dark:bg-emerald-900/20"
          iconColorClass="text-emerald-600 dark:text-emerald-400"
        />
        <KPICard 
          title="Pending Pickup" 
          value="16" 
          icon={MapPin} 
          iconBgClass="bg-amber-50 dark:bg-amber-900/20"
          iconColorClass="text-amber-600 dark:text-amber-400"
        />
        <KPICard 
          title="Avg. Occupancy" 
          value="84%" 
          icon={TrendingUp} 
          iconBgClass="bg-indigo-50 dark:bg-indigo-900/20"
          iconColorClass="text-indigo-600 dark:text-indigo-400"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search student or route..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all dark:text-white"
            />
          </div>
          <button
            onClick={cycleRouteFilter}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all"
          >
            <Filter className="w-4 h-4" />
            {routeFilter}
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                <th className="py-4 px-6">Student Name</th>
                <th className="py-4 px-6">Assigned Route</th>
                <th className="py-4 px-6">Bus Stop</th>
                <th className="py-4 px-6">Pickup Time</th>
                <th className="py-4 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.map((student, i) => (
                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img 
                        src={`https://ui-avatars.com/api/?name=${student.name.replace(' ', '+')}&background=eff6ff&color=2563eb&bold=true`} 
                        className="w-8 h-8 rounded-lg"
                        alt={student.name}
                      />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{student.name}</p>
                        <p className="text-[10px] font-mono font-bold text-slate-400">{student.studentId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-bold text-blue-600">{student.route}</td>
                  <td className="py-4 px-6 font-medium text-slate-600 dark:text-slate-400">{student.stop}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-slate-500 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-xs">{student.pickupTime}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleContactAction(student.name, 'email')}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleContactAction(student.name, 'phone')}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-all"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredStudents.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
            No transport users match the current search and route filter.
          </div>
        ) : null}
      </div>
    </div>
  );
}
