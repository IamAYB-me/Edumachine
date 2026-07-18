import React, { useState } from 'react';
import { GraduationCap, Users, DoorOpen, Search, Filter, BookOpen, Clock, Calendar, User, X } from 'lucide-react';
import { cn } from '@/utils';
import { useDataStore } from '@/store/useDataStore';
import { KPICard } from '@/components/ui/KPICard';
import { useToastStore } from '@/store/useToastStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { getPortalLevelLabels, resolveSchoolProfile } from '@/utils/schoolProfile';

export default function TeacherClasses() {
  const { classes, students, schools } = useDataStore();
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'students' | 'room'>('name');
  const [showTimetable, setShowTimetable] = useState(false);
  const showToast = useToastStore((state) => state.showToast);
  const schoolProfile = resolveSchoolProfile(user, schools);
  const labels = getPortalLevelLabels(schoolProfile.portalLevel);

  // Filter classes for the logged-in teacher (simulated as 'Teacher 1')
  const teacherClasses = [...classes.filter(cls => cls.teacherName.includes('Teacher') || cls.id === '1')].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'students') return b.studentsCount - a.studentsCount;
    return a.room.localeCompare(b.room);
  });

  const stats = {
    totalClasses: teacherClasses.length,
    totalStudents: teacherClasses.reduce((acc, c) => acc + c.studentsCount, 0),
    avgStudents: Math.round(teacherClasses.reduce((acc, c) => acc + c.studentsCount, 0) / (teacherClasses.length || 1)),
    periods: 24 // Weekly periods
  };

  const weeklySlots = [
    { day: 'Monday', entries: teacherClasses.slice(0, 2).map((cls, index) => ({ time: index === 0 ? '08:00 - 09:30' : '11:00 - 12:30', className: cls.name, subject: 'Mathematics', room: cls.room })) },
    { day: 'Tuesday', entries: teacherClasses.slice(1, 3).map((cls, index) => ({ time: index === 0 ? '09:00 - 10:30' : '12:00 - 13:30', className: cls.name, subject: 'Logic', room: cls.room })) },
    { day: 'Wednesday', entries: teacherClasses.slice(0, 2).map((cls, index) => ({ time: index === 0 ? '08:30 - 10:00' : '10:30 - 12:00', className: cls.name, subject: 'Further Mathematics', room: cls.room })) },
    { day: 'Thursday', entries: teacherClasses.slice(0, 1).map((cls) => ({ time: '11:00 - 12:30', className: cls.name, subject: 'Revision Lab', room: cls.room })) },
    { day: 'Friday', entries: teacherClasses.slice(1, 2).map((cls) => ({ time: '09:30 - 11:00', className: cls.name, subject: 'Assessment Clinic', room: cls.room })) },
  ];

  return (
    <div className="space-y-6">
      {showTimetable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-8 py-6 dark:border-slate-800 dark:bg-slate-800/50">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Weekly Timetable</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Your teaching schedule for the current academic week.</p>
              </div>
              <button onClick={() => setShowTimetable(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto p-8">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
              {weeklySlots.map((slot) => (
                <div key={slot.day} className="rounded-3xl border border-slate-200 p-5 dark:border-slate-800">
                  <p className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">{slot.day}</p>
                  <div className="mt-4 space-y-3">
                    {slot.entries.length > 0 ? slot.entries.map((entry) => (
                      <div key={`${slot.day}-${entry.time}-${entry.className}`} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{entry.time}</p>
                        <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">{entry.className}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{entry.subject}</p>
                        <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">Room {entry.room}</p>
                      </div>
                    )) : (
                      <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-xs font-medium text-slate-400 dark:border-slate-700">
                        No scheduled class
                      </div>
                    )}
                  </div>
                </div>
              ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Assigned {labels.structurePlural}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your academic {labels.curriculumLabel.toLowerCase()} and {labels.learnerPlural.toLowerCase()} lists.</p>
        </div>
        <button onClick={() => setShowTimetable(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-900/20">
          <Calendar className="w-4 h-4" />
          Weekly Timetable
        </button>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title={`Total ${labels.structurePlural}`} 
          value={stats.totalClasses.toString()} 
          icon={GraduationCap} 
          iconBgClass="bg-blue-50 dark:bg-blue-900/20"
          iconColorClass="text-blue-600 dark:text-blue-400"
        />
        <KPICard 
          title={`Total ${labels.learnerPlural}`} 
          value={stats.totalStudents.toString()} 
          icon={Users} 
          iconBgClass="bg-emerald-50 dark:bg-emerald-900/20"
          iconColorClass="text-emerald-600 dark:text-emerald-400"
        />
        <KPICard 
          title={`Avg. ${labels.structureSingular} Size`} 
          value={stats.avgStudents.toString()} 
          icon={User} 
          iconBgClass="bg-amber-50 dark:bg-amber-900/20"
          iconColorClass="text-amber-600 dark:text-amber-400"
        />
        <KPICard 
          title="Weekly Periods" 
          value={stats.periods.toString()} 
          icon={Clock} 
          iconBgClass="bg-indigo-50 dark:bg-indigo-900/20"
          iconColorClass="text-indigo-600 dark:text-indigo-400"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder={`Search ${labels.structurePlural.toLowerCase()} or ${labels.curriculumLabel.toLowerCase()}...`} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const options: Array<'name' | 'students' | 'room'> = ['name', 'students', 'room'];
                setSortBy(options[(options.indexOf(sortBy) + 1) % options.length]);
              }}
              className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Sort By: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
            </button>
          </div>
        </div>

        {/* Grid of Classes */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto">
          {teacherClasses.map((cls) => (
            <div key={cls.id} className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-900/50 transition-all group relative">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded uppercase">Active</div>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">{cls.name}</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Mathematics & Logic
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="text-slate-500 font-medium">Room No</span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                    <DoorOpen className="w-4 h-4 text-slate-400" />
                    {cls.room}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <span className="text-slate-500 font-medium">Enrolled {labels.learnerPlural}</span>
                  <div className="flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400">
                    <Users className="w-4 h-4" />
                    {cls.studentsCount}
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button onClick={() => navigate('/teacher/attendance')} className="py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-xl text-[10px] font-bold hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors shadow-md">
                  View {labels.learnerPlural}
                </button>
                <button onClick={() => navigate('/teacher/attendance')} className="py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl text-[10px] font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  Take Attendance
                </button>
              </div>
            </div>
          ))}
          {teacherClasses.length === 0 && (
             <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
               <GraduationCap className="w-12 h-12 mb-4 opacity-20" />
               <p className="text-sm font-medium">No {labels.structurePlural.toLowerCase()} assigned to you yet.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
