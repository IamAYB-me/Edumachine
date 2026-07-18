import React, { useState } from 'react';
import { useDataStore } from '@/store/useDataStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Search, Calendar, CheckCircle, XCircle, AlertCircle, Clock, Save, Users, UserCheck } from 'lucide-react';
import { cn } from '@/utils';
import { KPICard } from '@/components/ui/KPICard';
import { useToastStore } from '@/store/useToastStore';

export default function MarkAttendance() {
  const { classes, students, markAttendance } = useDataStore();
  const { user } = useAuthStore();
  const showToast = useToastStore((state) => state.showToast);
  
  const [selectedClass, setSelectedClass] = useState<string>(classes[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'Present' | 'Absent' | 'Late' | 'Excused'>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const currentClass = classes.find(c => c.id === selectedClass);
  const classStudents = students.filter(s => s.class === currentClass?.name);
  const filteredStudents = classStudents.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.regNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: classStudents.length,
    present: Object.values(attendanceMap).filter(v => v === 'Present').length,
    absent: Object.values(attendanceMap).filter(v => v === 'Absent').length,
    late: Object.values(attendanceMap).filter(v => v === 'Late').length
  };

  const handleBulkMark = (status: 'Present' | 'Absent' | 'Late' | 'Excused') => {
    const newMap = { ...attendanceMap };
    classStudents.forEach(s => {
      newMap[s.id] = status;
    });
    setAttendanceMap(newMap);
  };

  const handleMark = (studentId: string, status: 'Present' | 'Absent' | 'Late' | 'Excused') => {
    setAttendanceMap({ ...attendanceMap, [studentId]: status });
  };

  const handleSave = () => {
    if (!currentClass || classStudents.length === 0) {
      showToast({
        title: 'No class roster available',
        description: 'Select a class with enrolled students before saving attendance.',
        variant: 'warning',
      });
      return;
    }

    const records = classStudents.map(s => ({
      targetId: s.id,
      targetName: s.name,
      type: 'Student' as const,
      status: attendanceMap[s.id] || 'Present',
      date: date,
      classId: selectedClass,
      markedBy: user?.name || 'Teacher'
    }));

    markAttendance(records);
    showToast({
      title: 'Attendance saved',
      description: `${records.length} student records captured for ${currentClass.name} on ${date}.`,
      variant: 'success',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Daily Attendance</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Mark and track student attendance for your classes.</p>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all"
        >
          <Save className="w-4 h-4" />
          Save Attendance
        </button>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Total Students" 
          value={stats.total.toString()} 
          icon={Users} 
          iconBgClass="bg-blue-50 dark:bg-blue-900/20"
          iconColorClass="text-blue-600 dark:text-blue-400"
        />
        <KPICard 
          title="Marked Present" 
          value={stats.present.toString()} 
          icon={CheckCircle} 
          iconBgClass="bg-emerald-50 dark:bg-emerald-900/20"
          iconColorClass="text-emerald-600 dark:text-emerald-400"
        />
        <KPICard 
          title="Marked Absent" 
          value={stats.absent.toString()} 
          icon={XCircle} 
          iconBgClass="bg-rose-50 dark:bg-rose-900/20"
          iconColorClass="text-rose-600 dark:text-rose-400"
        />
        <KPICard 
          title="Late / Excused" 
          value={(stats.late + Object.values(attendanceMap).filter(v => v === 'Excused').length).toString()} 
          icon={Clock} 
          iconBgClass="bg-amber-50 dark:bg-amber-900/20"
          iconColorClass="text-amber-600 dark:text-amber-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Select Class</label>
              <select 
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm"
              >
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm" 
                />
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 block">Quick Actions</label>
              <div className="grid grid-cols-1 gap-2">
                <button onClick={() => handleBulkMark('Present')} className="w-full py-2.5 px-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-xl hover:bg-emerald-100 font-bold text-xs transition-colors text-left flex items-center gap-2">
                   <CheckCircle className="w-4 h-4" /> Mark All Present
                </button>
                <button onClick={() => handleBulkMark('Absent')} className="w-full py-2.5 px-4 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 rounded-xl hover:bg-rose-100 font-bold text-xs transition-colors text-left flex items-center gap-2">
                   <XCircle className="w-4 h-4" /> Mark All Absent
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Student List */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600" />
              Student List ({filteredStudents.length})
            </h3>
            <div className="relative w-64">
               <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
               <input 
                 type="text" 
                 placeholder="Quick search..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pl-9 pr-4 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs" 
               />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50/30 dark:bg-slate-800/10">
                  <th className="py-4 px-6">Student Information</th>
                  <th className="py-4 px-6">Roll No</th>
                  <th className="py-4 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img 
                          src={`https://ui-avatars.com/api/?name=${student.name.replace(' ', '+')}&background=random&bold=true`} 
                          alt="" 
                          className="w-9 h-9 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-sm">{student.name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs font-bold text-slate-500">{student.regNo}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        {[
                          { label: 'Present', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                          { label: 'Absent', icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20' },
                          { label: 'Late', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                          { label: 'Excused', icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                        ].map((status) => (
                          <button
                            key={status.label}
                            onClick={() => handleMark(student.id, status.label as any)}
                            className={cn(
                              "p-2 rounded-lg transition-all border-2",
                              (attendanceMap[student.id] || 'Present') === status.label 
                                ? `border-current ${status.bg} ${status.color} scale-110 shadow-sm`
                                : "border-transparent text-slate-300 dark:text-slate-600 hover:text-slate-400"
                            )}
                            title={status.label}
                          >
                            <status.icon className="w-5 h-5" />
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredStudents.length === 0 && (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
                <Users className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-sm font-medium">No students found for this class.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
