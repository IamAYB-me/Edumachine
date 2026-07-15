import React from 'react';
import { useDataStore } from '@/store/useDataStore';
import { Calendar, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils';

export default function ChildrenAttendance() {
  const { students } = useDataStore();
  const myChildren = students.slice(0, 2);

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const currentMonth = "July 2026";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Attendance Tracker</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Monitor your children's daily attendance records.</p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2">
          <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold min-w-[100px] text-center">{currentMonth}</span>
          <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {myChildren.map((child) => (
          <div key={child.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <img 
                  src={`https://ui-avatars.com/api/?name=${child.name.replace(' ', '+')}&background=eff6ff&color=2563eb&bold=true`} 
                  alt={child.name} 
                  className="w-8 h-8 rounded-lg"
                />
                <span className="font-bold text-slate-900 dark:text-white">{child.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Present: 22</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Absent: 1</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-14 lg:grid-cols-16 gap-2">
                {days.map(day => {
                  const isWeekend = day % 7 === 0 || (day + 1) % 7 === 0;
                  const isAbsent = day === 15;
                  const isFuture = day > 7;
                  
                  return (
                    <div 
                      key={day}
                      className={cn(
                        "aspect-square rounded-lg flex flex-col items-center justify-center border transition-all cursor-help relative group",
                        isWeekend ? "bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-400" :
                        isFuture ? "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-300" :
                        isAbsent ? "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-600" :
                        "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-600"
                      )}
                    >
                      <span className="text-[10px] font-bold">{day}</span>
                      {!isFuture && !isWeekend && (
                        isAbsent ? <XCircle className="w-3 h-3 mt-1" /> : <CheckCircle className="w-3 h-3 mt-1" />
                      )}
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        {isFuture ? 'Upcoming' : isWeekend ? 'Weekend' : isAbsent ? 'Absent' : 'Present'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
