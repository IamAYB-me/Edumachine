import React, { useState } from 'react';
import { Search, Plus, GraduationCap, Edit, Trash2, X, Users, DoorOpen, LayoutGrid, List, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/utils';
import { useDataStore, Class } from '@/store/useDataStore';
import { KPICard } from '@/components/ui/KPICard';

export default function ClassesManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { classes, addClass, updateClass, deleteClass, teachers, students, feeRecords } = useDataStore();
  
  const stats = {
    totalClasses: classes.length,
    avgStudents: Math.round(classes.reduce((acc, c) => acc + c.studentsCount, 0) / (classes.length || 1)),
    maxCapacity: Math.max(...classes.map(c => c.studentsCount), 0),
    totalTeachers: new Set(classes.map(c => c.teacherId)).size
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [reportClass, setReportClass] = useState<Class | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    teacherId: '',
    teacherName: '',
    studentsCount: 0,
    room: ''
  });

  const filteredClasses = classes.filter(cls => 
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.room.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (cls?: Class) => {
    if (cls) {
      setEditingClass(cls);
      setFormData({
        name: cls.name,
        teacherId: cls.teacherId,
        teacherName: cls.teacherName,
        studentsCount: cls.studentsCount,
        room: cls.room
      });
    } else {
      setEditingClass(null);
      setFormData({
        name: '',
        teacherId: teachers[0]?.id || '',
        teacherName: teachers[0]?.name || '',
        studentsCount: 0,
        room: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedTeacher = teachers.find(t => t.id === formData.teacherId);
    const data = {
      ...formData,
      teacherName: selectedTeacher ? selectedTeacher.name : formData.teacherName
    };
    
    if (editingClass) {
      updateClass(editingClass.id, data);
    } else {
      addClass(data);
    }
    setIsModalOpen(false);
  };

  const reportStudents = reportClass
    ? students.filter((student) => student.class === reportClass.name)
    : [];
  const paidStudents = reportStudents.filter((student) =>
    feeRecords.some((record) => record.studentId === student.id && record.status === 'Paid')
  ).length;
  const outstandingStudents = Math.max(reportStudents.length - paidStudents, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Classes Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage school classes, assigned teachers, and rooms.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-900/20"
        >
          <Plus className="w-4 h-4" />
          Create New Class
        </button>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Total Classes" 
          value={stats.totalClasses.toString()} 
          icon={GraduationCap} 
          iconBgClass="bg-blue-50 dark:bg-blue-900/20"
          iconColorClass="text-blue-600 dark:text-blue-400"
        />
        <KPICard 
          title="Avg Students" 
          value={stats.avgStudents.toString()} 
          icon={Users} 
          iconBgClass="bg-emerald-50 dark:bg-emerald-900/20"
          iconColorClass="text-emerald-600 dark:text-emerald-400"
        />
        <KPICard 
          title="Peak Capacity" 
          value={stats.maxCapacity.toString()} 
          icon={CheckCircle} 
          iconBgClass="bg-amber-50 dark:bg-amber-900/20"
          iconColorClass="text-amber-600 dark:text-amber-400"
        />
        <KPICard 
          title="Active Teachers" 
          value={stats.totalTeachers.toString()} 
          icon={AlertCircle} 
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
              placeholder="Search classes..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
              <button onClick={() => setViewMode('grid')} className={cn("p-1.5 rounded-md", viewMode === 'grid' ? "bg-slate-100 dark:bg-slate-700 text-blue-600" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300")}>
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('list')} className={cn("p-1.5 rounded-md", viewMode === 'list' ? "bg-slate-100 dark:bg-slate-700 text-blue-600" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300")}>
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Grid / List of Classes */}
        <div className={cn("p-6 gap-6 overflow-y-auto flex-1",
          viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "flex flex-col"
        )}>
          {filteredClasses.map((cls) => (
            <div key={cls.id} className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-900/50 transition-all group relative">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleOpenModal(cls)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => deleteClass(cls.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">{cls.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1.5">
                <DoorOpen className="w-4 h-4 text-slate-400" /> {cls.room}
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="text-slate-500 font-medium">Class Teacher</span>
                  <span className="font-bold text-slate-900 dark:text-white">{cls.teacherName}</span>
                </div>
                <div className="flex items-center justify-between text-sm p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="text-slate-500 font-medium">Enrolled</span>
                  <div className="flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400">
                    <Users className="w-4 h-4" />
                    {cls.studentsCount} Students
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  onClick={() => setReportClass(cls)}
                  className="w-full py-2.5 bg-slate-900 dark:bg-slate-700 text-white rounded-xl text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors shadow-md"
                >
                  View Performance Report
                </button>
              </div>
            </div>
          ))}
          {filteredClasses.length === 0 && (
             <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
               <GraduationCap className="w-12 h-12 mb-4 opacity-20" />
               <p className="text-sm font-medium">No classes found matching your search.</p>
             </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-md flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingClass ? 'Edit Class' : 'Create New Class'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Class Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Grade 10 - A"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Class Teacher</label>
                  <select 
                    value={formData.teacherId}
                    onChange={(e) => setFormData({...formData, teacherId: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white"
                  >
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.subject})</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Room / Lab</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Room 101"
                      value={formData.room}
                      onChange={(e) => setFormData({...formData, room: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Student Capacity</label>
                    <input 
                      type="number" 
                      required
                      value={formData.studentsCount}
                      onChange={(e) => setFormData({...formData, studentsCount: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white"
                    />
                  </div>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all"
                >
                  {editingClass ? 'Save Changes' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {reportClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setReportClass(null)}>
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{reportClass.name} Performance Report</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Live class overview for academic and operational monitoring.</p>
              </div>
              <button onClick={() => setReportClass(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/70 dark:bg-slate-800/40">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Assigned Teacher</p>
                  <p className="mt-2 text-lg font-black text-slate-900 dark:text-white">{reportClass.teacherName}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/70 dark:bg-slate-800/40">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Enrolled Students</p>
                  <p className="mt-2 text-lg font-black text-slate-900 dark:text-white">{reportStudents.length || reportClass.studentsCount}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/70 dark:bg-slate-800/40">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Room</p>
                  <p className="mt-2 text-lg font-black text-slate-900 dark:text-white">{reportClass.room}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/40 p-4 bg-emerald-50/70 dark:bg-emerald-900/10">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Fee Cleared</p>
                  <p className="mt-2 text-2xl font-black text-emerald-700 dark:text-emerald-400">{paidStudents}</p>
                </div>
                <div className="rounded-2xl border border-amber-200 dark:border-amber-900/40 p-4 bg-amber-50/70 dark:bg-amber-900/10">
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Outstanding</p>
                  <p className="mt-2 text-2xl font-black text-amber-700 dark:text-amber-400">{outstandingStudents}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Class Roster Snapshot</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {reportStudents.length > 0 ? reportStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/50 px-4 py-3">
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{student.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{student.regNo} • {student.email}</p>
                      </div>
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        student.status === 'Active'
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      )}>
                        {student.status}
                      </span>
                    </div>
                  )) : (
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 px-4 py-6 text-center text-sm text-slate-500">
                      No students are currently linked to this class record.
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setReportClass(null)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors"
                >
                  Close Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
