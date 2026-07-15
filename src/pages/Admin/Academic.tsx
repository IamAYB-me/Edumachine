import React, { useState } from 'react';
import { BookOpen, GraduationCap, Plus, Search, Edit, Trash2, X, Layers, Code, Bookmark, Award } from 'lucide-react';
import { cn } from '@/utils';
import { useDataStore, Faculty, Subject } from '@/store/useDataStore';
import { KPICard } from '@/components/ui/KPICard';

export default function AcademicManagement() {
  const [activeTab, setActiveTab] = useState<'faculties' | 'subjects'>('subjects');
  const [searchTerm, setSearchTerm] = useState('');
  const { faculties, addFaculty, updateFaculty, deleteFaculty, subjects, addSubject, updateSubject, deleteSubject } = useDataStore();
  
  const stats = {
    totalFaculties: faculties.length,
    totalSubjects: subjects.length,
    coreSubjects: subjects.filter(s => s.type === 'Core').length,
    electiveSubjects: subjects.filter(s => s.type === 'Elective').length
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  // Form States
  const [facultyForm, setFacultyForm] = useState({ name: '', headName: '', code: '' });
  const [subjectForm, setSubjectForm] = useState({ name: '', code: '', type: 'Core' as any, creditHours: 3 });

  const filteredFaculties = faculties.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.code.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredSubjects = subjects.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.code.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleOpenModal = (item?: any) => {
    if (activeTab === 'faculties') {
      if (item) {
        setEditingItem(item);
        setFacultyForm({ name: item.name, headName: item.headName, code: item.code });
      } else {
        setEditingItem(null);
        setFacultyForm({ name: '', headName: '', code: '' });
      }
    } else {
      if (item) {
        setEditingItem(item);
        setSubjectForm({ name: item.name, code: item.code, type: item.type, creditHours: item.creditHours || 3 });
      } else {
        setEditingItem(null);
        setSubjectForm({ name: '', code: '', type: 'Core', creditHours: 3 });
      }
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'faculties') {
      if (editingItem) updateFaculty(editingItem.id, facultyForm);
      else addFaculty(facultyForm);
    } else {
      if (editingItem) updateSubject(editingItem.id, subjectForm);
      else addSubject(subjectForm);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Academic Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage faculties, departments, and course subjects.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-900/20"
        >
          <Plus className="w-4 h-4" />
          {activeTab === 'faculties' ? 'Add Faculty' : 'Add Subject'}
        </button>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Total Subjects" 
          value={stats.totalSubjects.toString()} 
          icon={BookOpen} 
          iconBgClass="bg-blue-50 dark:bg-blue-900/20"
          iconColorClass="text-blue-600 dark:text-blue-400"
        />
        <KPICard 
          title="Core Courses" 
          value={stats.coreSubjects.toString()} 
          icon={Bookmark} 
          iconBgClass="bg-emerald-50 dark:bg-emerald-900/20"
          iconColorClass="text-emerald-600 dark:text-emerald-400"
        />
        <KPICard 
          title="Electives" 
          value={stats.electiveSubjects.toString()} 
          icon={Layers} 
          iconBgClass="bg-amber-50 dark:bg-amber-900/20"
          iconColorClass="text-amber-600 dark:text-amber-400"
        />
        <KPICard 
          title="Faculties" 
          value={stats.totalFaculties.toString()} 
          icon={GraduationCap} 
          iconBgClass="bg-indigo-50 dark:bg-indigo-900/20"
          iconColorClass="text-indigo-600 dark:text-indigo-400"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 bg-slate-50/50 dark:bg-slate-800/30">
          <button 
            onClick={() => setActiveTab('subjects')}
            className={cn(
              "px-6 py-4 text-sm font-bold transition-all border-b-2",
              activeTab === 'subjects' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            Subjects / Courses
          </button>
          <button 
            onClick={() => setActiveTab('faculties')}
            className={cn(
              "px-6 py-4 text-sm font-bold transition-all border-b-2",
              activeTab === 'faculties' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            Faculties / Schools
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between gap-4 bg-white dark:bg-slate-900">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder={`Search ${activeTab}...`} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all dark:text-white"
            />
          </div>
        </div>

        {/* Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              {activeTab === 'faculties' ? (
                <tr className="border-b border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-800/30">
                  <th className="py-4 px-6">Faculty Name</th>
                  <th className="py-4 px-6">Faculty Code</th>
                  <th className="py-4 px-6">Head of Faculty</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              ) : (
                <tr className="border-b border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-800/30">
                  <th className="py-4 px-6">Subject Information</th>
                  <th className="py-4 px-6">Code</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Credit Hours</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              )}
            </thead>
            <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
              {activeTab === 'faculties' ? (
                filteredFaculties.map((f) => (
                  <tr key={f.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white tracking-tight">{f.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                        {f.code}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-700 dark:text-slate-300 font-medium">{f.headName}</td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenModal(f)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => deleteFaculty(f.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                filteredSubjects.map((s) => (
                  <tr key={s.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white tracking-tight">{s.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                        {s.code}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                        s.type === 'Core' ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-100 dark:border-blue-800" :
                        s.type === 'Elective' ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800" :
                        "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-100 dark:border-purple-800"
                      )}>
                        {s.type}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                         <span className="text-slate-700 dark:text-slate-300 font-bold">{s.creditHours} Units</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenModal(s)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => deleteSubject(s.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {(activeTab === 'faculties' ? filteredFaculties.length : filteredSubjects.length) === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
              <Layers className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm font-medium">No items found matching your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingItem ? 'Edit' : 'Add New'} {activeTab === 'faculties' ? 'Faculty' : 'Subject'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {activeTab === 'faculties' ? (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Faculty Name</label>
                    <input type="text" required value={facultyForm.name} onChange={(e) => setFacultyForm({...facultyForm, name: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl dark:text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Faculty Code</label>
                    <input type="text" required value={facultyForm.code} onChange={(e) => setFacultyForm({...facultyForm, code: e.target.value.toUpperCase()})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl dark:text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Head of Faculty</label>
                    <input type="text" required value={facultyForm.headName} onChange={(e) => setFacultyForm({...facultyForm, headName: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl dark:text-white" />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Subject Name</label>
                    <input type="text" required value={subjectForm.name} onChange={(e) => setSubjectForm({...subjectForm, name: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl dark:text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Subject Code</label>
                    <input type="text" required value={subjectForm.code} onChange={(e) => setSubjectForm({...subjectForm, code: e.target.value.toUpperCase()})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl dark:text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                      <select value={subjectForm.type} onChange={(e) => setSubjectForm({...subjectForm, type: e.target.value as any})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl dark:text-white">
                        <option value="Core">Core</option>
                        <option value="Elective">Elective</option>
                        <option value="Vocational">Vocational</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Credit Hours</label>
                      <input type="number" required value={subjectForm.creditHours} onChange={(e) => setSubjectForm({...subjectForm, creditHours: parseInt(e.target.value)})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl dark:text-white" />
                    </div>
                  </div>
                </div>
              )}
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg">{editingItem ? 'Save Changes' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
