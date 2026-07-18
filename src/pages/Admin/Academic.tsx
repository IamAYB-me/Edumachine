import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit, Trash2, X, BookOpen, GraduationCap, Filter } from 'lucide-react';
import { cn } from '@/utils';
import { useDataStore, Subject, Faculty } from '@/store/useDataStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';
import { resolveSchoolProfile, getPortalLevelLabels } from '@/utils/schoolProfile';

export default function AcademicManagement() {
  const { subjects, addSubject, updateSubject, deleteSubject, faculties, addFaculty, updateFaculty, deleteFaculty, schools } = useDataStore();
  const user = useAuthStore((state) => state.user);
  const showToast = useToastStore((state) => state.showToast);

  const schoolProfile = resolveSchoolProfile(user, schools);
  const labels = getPortalLevelLabels(schoolProfile.portalLevel);
  const isCollege = schoolProfile.portalLevel === 'College' || schoolProfile.portalLevel === 'University';

  const [activeTab, setActiveTab] = useState<'subjects' | 'faculties'>('subjects');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTerm, setFilterTerm] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Subject | Faculty | null>(null);

  const [subjectForm, setSubjectForm] = useState({ name: '', code: '', type: 'Core' as 'Core' | 'Elective', creditHours: 3, term: '', session: '' });
  const [facultyForm, setFacultyForm] = useState({ name: '', code: '', headName: '' });

  const filteredSubjects = useMemo(() => {
    let result = subjects;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(term) || s.code.toLowerCase().includes(term));
    }
    if (filterTerm !== 'all') {
      result = result.filter((s) => isCollege ? s.session === filterTerm : s.term === filterTerm);
    }
    return result;
  }, [subjects, searchTerm, filterTerm, isCollege]);

  const filteredFaculties = useMemo(() => {
    if (!searchTerm) return faculties;
    const term = searchTerm.toLowerCase();
    return faculties.filter((f) => f.name.toLowerCase().includes(term) || f.code.toLowerCase().includes(term));
  }, [faculties, searchTerm]);

  const termOptions = labels.termOptions;
  const coreCount = subjects.filter((s) => s.type === 'Core').length;
  const electiveCount = subjects.filter((s) => s.type === 'Elective').length;

  const handleOpenSubjectModal = (subject?: Subject) => {
    if (subject) {
      setEditingItem(subject);
      setSubjectForm({
        name: subject.name,
        code: subject.code,
        type: subject.type,
        creditHours: subject.creditHours,
        term: subject.term || '',
        session: subject.session || '',
      });
    } else {
      setEditingItem(null);
      setSubjectForm({ name: '', code: '', type: 'Core', creditHours: 3, term: termOptions[0] || '', session: termOptions[0] || '' });
    }
    setIsModalOpen(true);
  };

  const handleOpenFacultyModal = (faculty?: Faculty) => {
    if (faculty) {
      setEditingItem(faculty);
      setFacultyForm({ name: faculty.name, code: faculty.code, headName: faculty.headName });
    } else {
      setEditingItem(null);
      setFacultyForm({ name: '', code: '', headName: '' });
    }
    setIsModalOpen(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem && 'creditHours' in editingItem) {
      updateSubject(editingItem.id, subjectForm);
    } else {
      addSubject({ ...subjectForm, assignedClasses: [] });
    }
    showToast({
      title: editingItem ? `${labels.subjectSingular} updated` : `${labels.subjectSingular} created`,
      description: `${subjectForm.name} (${subjectForm.code}) has been saved.`,
      variant: 'success',
    });
    setIsModalOpen(false);
  };

  const handleSaveFaculty = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem && 'headName' in editingItem) {
      updateFaculty(editingItem.id, facultyForm);
    } else {
      addFaculty(facultyForm);
    }
    showToast({
      title: editingItem ? `${labels.structureSingular} updated` : `${labels.structureSingular} created`,
      description: `${facultyForm.name} (${facultyForm.code}) has been saved.`,
      variant: 'success',
    });
    setIsModalOpen(false);
  };

  const handleDeleteSubject = (id: string, name: string) => {
    deleteSubject(id);
    showToast({ title: `${labels.subjectSingular} deleted`, description: `${name} has been removed.`, variant: 'info' });
  };

  const handleDeleteFaculty = (id: string, name: string) => {
    deleteFaculty(id);
    showToast({ title: `${labels.structureSingular} deleted`, description: `${name} has been removed.`, variant: 'info' });
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{labels.curriculumLabel} Management</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Manage {labels.subjectPlural.toLowerCase()}, {labels.structurePlural.toLowerCase()}, and academic structure.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: `Total ${labels.subjectPlural}`, value: subjects.length, color: 'blue' },
          { label: isCollege ? 'Core Courses' : 'Core Subjects', value: coreCount, color: 'emerald' },
          { label: isCollege ? 'Elective Courses' : 'Elective Subjects', value: electiveCount, color: 'amber' },
          { label: labels.structurePlural, value: faculties.length, color: 'purple' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{kpi.label}</p>
            <p className={cn("text-2xl font-bold mt-1",
              kpi.color === 'blue' && "text-blue-600 dark:text-blue-400",
              kpi.color === 'emerald' && "text-emerald-600 dark:text-emerald-400",
              kpi.color === 'amber' && "text-amber-600 dark:text-amber-400",
              kpi.color === 'purple' && "text-purple-600 dark:text-purple-400",
            )}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs + Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => { setActiveTab('subjects'); setSearchTerm(''); setFilterTerm('all'); }}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                activeTab === 'subjects'
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              )}
            >
              {labels.subjectPlural}
            </button>
            <button
              onClick={() => { setActiveTab('faculties'); setSearchTerm(''); }}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                activeTab === 'faculties'
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              )}
            >
              {labels.structurePlural}
            </button>
          </div>
          <div className="flex gap-2">
            {activeTab === 'subjects' && (
              <div className="relative">
                <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={filterTerm}
                  onChange={(e) => setFilterTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 dark:text-white appearance-none"
                >
                  <option value="all">All {labels.termLabel}s</option>
                  {termOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            )}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={`Search ${activeTab === 'subjects' ? labels.subjectPlural.toLowerCase() : labels.structurePlural.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 dark:text-white"
              />
            </div>
            <button
              onClick={() => activeTab === 'subjects' ? handleOpenSubjectModal() : handleOpenFacultyModal()}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add {activeTab === 'subjects' ? labels.subjectSingular : labels.structureSingular}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          {activeTab === 'subjects' ? (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-10">
                <tr className="border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-6">{labels.subjectSingular} Name</th>
                  <th className="py-3 px-6">Code</th>
                  <th className="py-3 px-6">Type</th>
                  {isCollege && <th className="py-3 px-6">Credit Hours</th>}
                  <th className="py-3 px-6">{labels.termLabel}</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
                {filteredSubjects.map((subject) => (
                  <tr key={subject.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">{subject.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-6 font-mono text-xs text-slate-500">{subject.code}</td>
                    <td className="py-3 px-6">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        subject.type === 'Core' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                        subject.type === 'Elective' ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      )}>{subject.type}</span>
                    </td>
                    {isCollege && <td className="py-3 px-6 text-sm">{subject.creditHours}</td>}
                    <td className="py-3 px-6 text-sm text-slate-600 dark:text-slate-400">
                      {isCollege ? (subject.session || '—') : (subject.term || '—')}
                    </td>
                    <td className="py-3 px-6">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenSubjectModal(subject)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteSubject(subject.id, subject.name)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredSubjects.length === 0 && (
                  <tr><td colSpan={isCollege ? 6 : 5} className="py-12 text-center text-slate-400">No {labels.subjectPlural.toLowerCase()} found.</td></tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-10">
                <tr className="border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-6">{labels.structureSingular} Name</th>
                  <th className="py-3 px-6">Code</th>
                  <th className="py-3 px-6">Head of {labels.structureSingular}</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
                {filteredFaculties.map((faculty) => (
                  <tr key={faculty.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-lg">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">{faculty.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-6 font-mono text-xs text-slate-500">{faculty.code}</td>
                    <td className="py-3 px-6 text-sm text-slate-600 dark:text-slate-400">{faculty.headName || '—'}</td>
                    <td className="py-3 px-6">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenFacultyModal(faculty)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteFaculty(faculty.id, faculty.name)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredFaculties.length === 0 && (
                  <tr><td colSpan={4} className="py-12 text-center text-slate-400">No {labels.structurePlural.toLowerCase()} found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Subject Modal */}
      {isModalOpen && editingItem && 'creditHours' in editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-lg flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingItem.id ? `Edit ${labels.subjectSingular}` : `Add ${labels.subjectSingular}`}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleSaveSubject} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">{labels.subjectSingular} Name</label>
                <input
                  type="text" required value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Code</label>
                  <input
                    type="text" required value={subjectForm.code}
                    onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                  <select
                    value={subjectForm.type}
                    onChange={(e) => setSubjectForm({ ...subjectForm, type: e.target.value as 'Core' | 'Elective' })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white"
                  >
                    <option value="Core">Core</option>
                    <option value="Elective">Elective</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {isCollege && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Credit Hours</label>
                    <input
                      type="number" min={1} max={10} required value={subjectForm.creditHours}
                      onChange={(e) => setSubjectForm({ ...subjectForm, creditHours: Number(e.target.value) })}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white"
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">{labels.termLabel}</label>
                  <select
                    value={isCollege ? subjectForm.session : subjectForm.term}
                    onChange={(e) => isCollege
                      ? setSubjectForm({ ...subjectForm, session: e.target.value })
                      : setSubjectForm({ ...subjectForm, term: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white"
                  >
                    {termOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all">
                  {editingItem.id ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Faculty Modal */}
      {isModalOpen && editingItem && 'headName' in editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-lg flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingItem.id ? `Edit ${labels.structureSingular}` : `Add ${labels.structureSingular}`}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleSaveFaculty} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">{labels.structureSingular} Name</label>
                <input
                  type="text" required value={facultyForm.name}
                  onChange={(e) => setFacultyForm({ ...facultyForm, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Code</label>
                  <input
                    type="text" required value={facultyForm.code}
                    onChange={(e) => setFacultyForm({ ...facultyForm, code: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Head of {labels.structureSingular}</label>
                  <input
                    type="text" value={facultyForm.headName}
                    onChange={(e) => setFacultyForm({ ...facultyForm, headName: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white"
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all">
                  {editingItem.id ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
