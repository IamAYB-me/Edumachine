import React, { useState } from 'react';
import { Clock, Calendar, Plus, Save, Download, Filter, Search, MoreVertical, Trash2, Edit2, CheckCircle2 } from 'lucide-react';
import { KPICard } from '@/components/ui/KPICard';
import { cn } from '@/utils';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const periods = [
  { id: 1, time: '08:00 AM - 08:40 AM', label: 'Period 1' },
  { id: 2, time: '08:40 AM - 09:20 AM', label: 'Period 2' },
  { id: 3, time: '09:20 AM - 10:00 AM', label: 'Period 3' },
  { id: 4, time: '10:00 AM - 10:40 AM', label: 'Period 4' },
  { id: 'break', time: '10:40 AM - 11:10 AM', label: 'Short Break', isBreak: true },
  { id: 5, time: '11:10 AM - 11:50 AM', label: 'Period 5' },
  { id: 6, time: '11:50 AM - 12:30 PM', label: 'Period 6' },
];

export default function AdminTimetable() {
  const [selectedClass, setSelectedClass] = useState('Grade 10A');
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Academic Timetable</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Configure and manage class schedules and subject allocations.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all">
            <Download className="w-4 h-4" />
            Export PDF
          </button>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className={cn(
              "flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95",
              isEditing ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/20" : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-900/20"
            )}
          >
            {isEditing ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            {isEditing ? 'Save Changes' : 'Configure Timetable'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard title="Active Classes" value="24" icon={Calendar} iconBgClass="bg-blue-50" iconColorClass="text-blue-600" />
        <KPICard title="Avg. Periods/Day" value="8" icon={Clock} iconBgClass="bg-indigo-50" iconColorClass="text-indigo-600" />
        <KPICard title="Total Teachers" value="45" icon={CheckCircle2} iconBgClass="bg-emerald-50" iconColorClass="text-emerald-600" />
        <KPICard title="Break Slots" value="2" icon={Clock} iconBgClass="bg-amber-50" iconColorClass="text-amber-600" />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex items-center gap-4">
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option>Grade 10A</option>
              <option>Grade 10B</option>
              <option>Grade 11C</option>
              <option>Grade 12A</option>
            </select>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Academic Year 2025/2026</p>
          </div>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <Filter className="w-4 h-4 text-slate-500" />
            </button>
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <Plus className="w-4 h-4 text-blue-600" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/30 dark:bg-slate-800/10">
                <th className="py-4 px-6 border-b border-r border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left w-48">Time Slot</th>
                {days.map(day => (
                  <th key={day} className="py-4 px-6 border-b border-r border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {periods.map((period) => (
                <tr key={period.id} className={cn(period.isBreak && "bg-slate-50/50 dark:bg-slate-800/20")}>
                  <td className="py-4 px-6 border-r border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{period.label}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{period.time}</p>
                  </td>
                  {days.map(day => (
                    <td key={day} className="py-3 px-3 border-r border-slate-100 dark:border-slate-800 group">
                      {period.isBreak ? (
                        <div className="text-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Break</span>
                        </div>
                      ) : (
                        <div className={cn(
                          "p-3 rounded-2xl border transition-all cursor-pointer relative",
                          isEditing 
                            ? "border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/30" 
                            : "border-transparent bg-slate-50/50 dark:bg-slate-800/40 hover:scale-[1.02] hover:shadow-md"
                        )}>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Mathematics</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Dr. Emily Carter</p>
                          {isEditing && (
                            <button className="absolute -top-1 -right-1 p-1 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-6 bg-blue-600 rounded-3xl text-white shadow-xl shadow-blue-900/20 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Smart Conflict Detection</h3>
            <p className="text-blue-100 text-sm">The system automatically prevents double-booking teachers or classrooms.</p>
          </div>
        </div>
        <button className="w-full sm:w-auto px-8 py-3 bg-white text-blue-600 font-bold rounded-2xl text-sm hover:bg-blue-50 transition-all shadow-lg active:scale-95">
          Run Conflict Check
        </button>
      </div>
    </div>
  );
}
