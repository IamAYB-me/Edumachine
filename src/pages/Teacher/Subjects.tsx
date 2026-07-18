import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit, Trash2, X, BookOpen, Users, BarChart3, Filter } from 'lucide-react';
import { cn } from '@/utils';
import { useDataStore, Subject } from '@/store/useDataStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';
import { resolveSchoolProfile, getPortalLevelLabels } from '@/utils/schoolProfile';

export default function TeacherSubjects() {
  const { subjects, addSubject, updateSubject, deleteSubject, classes, schools } = useDataStore();
  const user = useAuthStore((state) => state.user);
  const showToast = useToastStore((state) => state.showToast);

  const schoolProfile = resolveSchoolProfile(user, schools);
  const labels = getPortalLevelLabels(schoolProfile.portalLevel);
  const isCollege = schoolProfile.portalLevel === 'College' || schoolProfile.portalLevel === 'University';

  const [searchTerm, setSearchTerm] = useState('');
  const [filterTerm, setFilterTerm] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [form, setForm] = useState({ name: '', code: '', type: 'Core' as 'Core' | 'Elective', creditHours: 3, term: '', session: '' });

  const filteredSubjects = useMemo(() => {
    let result = subjects;
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(t) || s.code.toLowerCase().includes(t));
    }
    if (filterTerm !== 'all') {
      result = result.filter((s) => isCollege ? s.session === filterTerm : s.term === filterTerm);
    }
    return result;
  }, [subjects, searchTerm, filterTerm, isCollege]);

  const termOptions = labels.termOptions;
  const totalStudents = classes.reduce((sum, c) => sum + c.studentsCount, 0);

  const handleOpenModal = (subject?: Subject) => {
    if (subject) {
      setEditingSubject(subject);
      setForm({ name: subject.name, code: subject.code, type: subject.type, creditHours: subject.creditHours, term: subject.term || '', session: subject.session || '' });
    } else {
      setEditingSubject(null);
      setForm({ name: '', code: '', type: 'Core', creditHours: 3, term: termOptions[0] || '', session: termOptions[0] || '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSubject) {
      updateSubject(editingSubject.id, form);
    } else {
      addSubject({ ...form, assignedClasses: [] });
    }
    showToast({
      title: editingSubject ? `${labels.subjectSingular} updated` : `${labels.subjectSingular} created`,
      description: `${form.name} (${form.code}) has been saved.`,
      variant: 'success',
    });
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    deleteSubject(id);
    showToast({ title: `${labels.subjectSingular} deleted`, description: `${name} has been removed.`, variant: 'info' });
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{labels.studyLabel}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Manage your assigned {labels.subjectPlural.toLowerCase()} and track {labels.structurePlural.toLowerCase()}.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: `Total ${labels.subjectPlural}`, value: subjects.length, icon: BookOpen, color: 'blue' },
          { label: `Active ${labels.structurePlural}`, value: classes.length, icon: Users, color: 'emerald' },
          { label: `Total ${labels.learnerPlural}`, value: totalStudents, icon: Users, color: 'purple' },
          { label: 'Avg. Performance', value: '84%', icon: BarChart3, color: 'amber' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg",
                kpi.color === 'blue' && "bg-blue-50 dark:bg-blue-900/20 text-blue-600",
                kpi.color === 'emerald' && "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600",
                kpi.color === 'purple' && "bg-purple-50 dark:bg-purple-900/20 text-purple-600",
                kpi.color === 'amber' && "bg-amber-50 dark:bg-amber-900/20 text-amber-600",
              )}>
                <kpi.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{kpi.label}</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{kpi.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            {(['all', ...termOptions] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterTerm(t)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold transition-all border",
                  filterTerm === t
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-400"
                )}
              >
                {t === 'all' ? `All ${labels.termLabel}s` : t}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={`Search ${labels.subjectPlural.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 dark:text-white"
              />
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add {labels.subjectSingular}
            </button>
          </div>
        </div>

        {/* Subject Cards Grid */}
        <div className="p-4 flex-1 overflow-y-auto">
          {filteredSubjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-lg font-bold text-slate-700 dark:text-slate-300">No {labels.subjectPlural.toLowerCase()} found</p>
              <p className="text-sm text-slate-400 mt-1">Click "Add {labels.subjectSingular}" to create one.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSubjects.map((subject) => (
                <div key={subject.id} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:shadow-md transition-shadow group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                      <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenModal(subject)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(subject.id, subject.name)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs font-mono text-slate-400 mb-1">{subject.code}</p>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">{subject.name}</h3>
                  <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full",
                      subject.type === 'Core' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    )}>{subject.type}</span>
                    {isCollege && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        {subject.creditHours} {labels.creditLabel}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                      {isCollege ? (subject.session || 'N/A') : (subject.term || 'N/A')}
                    </span>
                  </div>
                  {subject.assignedClasses && subject.assignedClasses.length > 0 && (
                    <p className="text-xs text-slate-400 mt-3">
                      Assigned to: {subject.assignedClasses.length} {labels.structurePlural.toLowerCase()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-lg flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingSubject ? `Edit ${labels.subjectSingular}` : `Add ${labels.subjectSingular}`}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">{labels.subjectSingular} Name</label>
                <input
                  type="text" required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white"
                  placeholder={isCollege ? 'e.g. Database Management Systems' : 'e.g. Mathematics'}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Code</label>
                  <input
                    type="text" required value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white font-mono"
                    placeholder={isCollege ? 'CSC101' : 'MTH101'}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as 'Core' | 'Elective' })}
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
                    <label className="text-xs font-bold text-slate-500 uppercase">{labels.creditLabel}</label>
                    <input
                      type="number" min={1} max={10} required value={form.creditHours}
                      onChange={(e) => setForm({ ...form, creditHours: Number(e.target.value) })}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white"
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">{labels.termLabel}</label>
                  <select
                    value={isCollege ? form.session : form.term}
                    onChange={(e) => isCollege
                      ? setForm({ ...form, session: e.target.value })
                      : setForm({ ...form, term: e.target.value })
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
                  {editingSubject ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
