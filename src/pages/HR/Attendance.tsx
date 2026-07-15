import React, { useMemo, useState } from 'react';
import { Search, Filter, Download, Calendar, CheckCircle, XCircle, Clock, MoreVertical } from 'lucide-react';
import { cn } from '@/utils';
import { useToastStore } from '@/store/useToastStore';
import { downloadTextFile } from '@/utils/fileHelpers';

const mockAttendance = [
  { id: 'EMP-101', name: 'Dr. Emily Carter', role: 'Senior Lecturer', dept: 'CS', status: 'Present', checkIn: '08:45 AM', checkOut: '05:30 PM', workHours: '8h 45m' },
  { id: 'EMP-102', name: 'Prof. Alan Turing', role: 'HOD', dept: 'CS', status: 'Present', checkIn: '09:00 AM', checkOut: '05:00 PM', workHours: '8h 00m' },
  { id: 'EMP-145', name: 'Sarah Wilson', role: 'Accountant', dept: 'Finance', status: 'On Leave', checkIn: '-', checkOut: '-', workHours: '-' },
  { id: 'EMP-156', name: 'Michael Brown', role: 'Transport', dept: 'Facilities', status: 'Present', checkIn: '07:30 AM', checkOut: '04:00 PM', workHours: '8h 30m' },
  { id: 'EMP-189', name: 'Jessica Taylor', role: 'Librarian', dept: 'Library', status: 'Late', checkIn: '09:45 AM', checkOut: '06:00 PM', workHours: '8h 15m' },
  { id: 'EMP-192', name: 'David Smith', role: 'Lab Asst', dept: 'CS', status: 'Absent', checkIn: '-', checkOut: '-', workHours: '-' },
];

export default function HRAttendance() {
  const [selectedDate, setSelectedDate] = useState('2025-10-24');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<'All' | 'CS' | 'Finance' | 'Facilities' | 'Library'>('All');
  const showToast = useToastStore((state) => state.showToast);

  const filteredAttendance = useMemo(() => {
    return mockAttendance.filter((emp) => {
      const matchesSearch =
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = departmentFilter === 'All' || emp.dept === departmentFilter;
      return matchesSearch && matchesDept;
    });
  }, [departmentFilter, searchTerm]);

  const handleExportReport = () => {
    const content = [
      `HR Attendance Report - ${selectedDate}`,
      '',
      ...filteredAttendance.map((emp) =>
        `${emp.name} | ${emp.id} | ${emp.dept} | ${emp.status} | ${emp.checkIn} | ${emp.checkOut} | ${emp.workHours}`
      ),
    ].join('\n');
    downloadTextFile(`attendance-report-${selectedDate}.txt`, content);
    showToast({
      title: 'Attendance report exported',
      description: `${filteredAttendance.length} attendance row(s) exported for ${selectedDate}.`,
      variant: 'success',
    });
  };

  const handleCycleDepartment = () => {
    const options: Array<typeof departmentFilter> = ['All', 'CS', 'Finance', 'Facilities', 'Library'];
    const next = options[(options.indexOf(departmentFilter) + 1) % options.length];
    setDepartmentFilter(next);
    showToast({
      title: 'Attendance filter updated',
      description: `Showing ${next === 'All' ? 'all departments' : next} attendance records.`,
      variant: 'info',
    });
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Staff Attendance</h1>
          <p className="text-slate-500 text-sm mt-1">Track and manage daily attendance for all employees.</p>
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm"
          />
          <button onClick={handleExportReport} className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-medium text-slate-500">Total Staff</p>
            <div className="p-2 bg-slate-50 rounded-lg text-slate-400 font-bold text-xs">126</div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">100%</h3>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-medium text-slate-500">Present</p>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">98</h3>
          <p className="text-xs text-emerald-600 font-semibold mt-1">77.8% of total</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-rose-500">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-medium text-slate-500">Absent</p>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">15</h3>
          <p className="text-xs text-rose-600 font-semibold mt-1">11.9% of total</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-amber-500">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-medium text-slate-500">Late</p>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">8</h3>
          <p className="text-xs text-amber-600 font-semibold mt-1">6.3% of total</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
              type="text" 
              placeholder="Search staff..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleCycleDepartment} className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              <Filter className="w-4 h-4" />
              {departmentFilter}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-6">Employee</th>
                <th className="py-3 px-6">Dept</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Check In</th>
                <th className="py-3 px-6">Check Out</th>
                <th className="py-3 px-6">Work Hours</th>
                <th className="py-3 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {filteredAttendance.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{emp.name}</p>
                        <p className="text-[10px] text-slate-500">{emp.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-slate-600 font-medium">{emp.dept}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      emp.status === 'Present' ? "bg-emerald-100 text-emerald-700" :
                      emp.status === 'Late' ? "bg-amber-100 text-amber-700" :
                      emp.status === 'Absent' ? "bg-rose-100 text-rose-700" : "bg-blue-100 text-blue-700"
                    )}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-600 font-medium">{emp.checkIn}</td>
                  <td className="py-4 px-6 text-slate-600 font-medium">{emp.checkOut}</td>
                  <td className="py-4 px-6 text-slate-600 font-medium">{emp.workHours}</td>
                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() =>
                        showToast({
                          title: 'Attendance details',
                          description: `${emp.name} is marked ${emp.status} for ${selectedDate}.`,
                          variant: 'info',
                        })
                      }
                      className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded"
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
  );
}
