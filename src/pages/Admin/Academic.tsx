import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit, Trash2, X, BookOpen, GraduationCap, Filter, ChevronDown, ChevronRight, Building2 } from 'lucide-react';
import { cn } from '@/utils';
import { useDataStore, Subject, Faculty, Department, AcademicSession, PortalLevel } from '@/store/useDataStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';
import { resolveSchoolProfile, getPortalLevelLabels, isTertiaryLevel } from '@/utils/schoolProfile';
import { filterDepartmentsByPortal } from '@/utils/portalProgrammes';

type TabKey = 'subjects' | 'courses' | 'faculties' | 'sessions';
type ModalKind = 'subject' | 'faculty' | 'department' | 'session' | null;

export default function AcademicManagement() {
  const { subjects, addSubject, updateSubject, deleteSubject, faculties, addFaculty, updateFaculty, deleteFaculty, departments, addDepartment, updateDepartment, deleteDepartment, academicSessions, addAcademicSession, updateAcademicSession, deleteAcademicSession, schools } = useDataStore();
  const user = useAuthStore((state) => state.user);
  const showToast = useToastStore((state) => state.showToast);

  const schoolProfile = resolveSchoolProfile(user, schools);
  const labels = getPortalLevelLabels(schoolProfile.portalLevel);
  const isCollege = isTertiaryLevel(schoolProfile.portalLevel);
  const structureLabel = isCollege ? 'Faculty/School' : 'Department';

  const [activeTab, setActiveTab] = useState<TabKey>(isCollege ? 'faculties' : 'subjects');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTerm, setFilterTerm] = useState('all');
  const [modalKind, setModalKind] = useState<ModalKind>(null);
  const [editingItem, setEditingItem] = useState<Subject | Faculty | Department | AcademicSession | null>(null);

  const subjectTerms = labels.termOptions;
  const courseSessions = labels.termOptions;

  const safeSubjects = useMemo(() => (subjects || []).filter(Boolean), [subjects]);
  const safeFaculties = useMemo(() => (faculties || []).filter(Boolean), [faculties]);
  const safeDepartments = useMemo(() => filterDepartmentsByPortal((departments || []).filter(Boolean), schoolProfile.portalLevel), [departments, schoolProfile.portalLevel]);

  const primarySubjects = useMemo(() => safeSubjects.filter((s) => s.term && !s.session), [safeSubjects]);
  const collegeCourses = useMemo(() => safeSubjects.filter((s) => s.session && !s.term), [safeSubjects]);

  const [expandedFaculty, setExpandedFaculty] = useState<Record<string, boolean>>({});

  const toggleFaculty = (id: string) => setExpandedFaculty((prev) => ({ ...prev, [id]: !prev[id] }));

  const [filterFacultyId, setFilterFacultyId] = useState('');
  const [filterDeptId, setFilterDeptId] = useState('');

  const filteredPrimarySubjects = useMemo(() => {
    let result = primarySubjects;
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(t) || s.code.toLowerCase().includes(t));
    }
    if (filterTerm !== 'all') result = result.filter((s) => s.term === filterTerm);
    return result;
  }, [primarySubjects, searchTerm, filterTerm]);

  const filteredCollegeCourses = useMemo(() => {
    let result = collegeCourses;
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(t) || s.code.toLowerCase().includes(t));
    }
    if (filterTerm !== 'all') result = result.filter((s) => s.session === filterTerm);
    if (filterFacultyId) result = result.filter((s) => s.facultyId === filterFacultyId);
    if (filterDeptId) result = result.filter((s) => s.departmentId === filterDeptId);
    return result;
  }, [collegeCourses, searchTerm, filterTerm, filterFacultyId, filterDeptId]);

  const filteredFaculties = useMemo(() => {
    if (!searchTerm) return safeFaculties;
    const t = searchTerm.toLowerCase();
    return safeFaculties.filter((f) => f.name.toLowerCase().includes(t) || f.code.toLowerCase().includes(t));
  }, [safeFaculties, searchTerm]);

  const filteredSessions = useMemo(() => {
    if (!searchTerm) return academicSessions;
    const t = searchTerm.toLowerCase();
    return academicSessions.filter((s) => s.name.toLowerCase().includes(t));
  }, [academicSessions, searchTerm]);

  const departmentsByFaculty = useMemo(() => {
    const map: Record<string, Department[]> = {};
    safeDepartments.forEach((d) => {
      if (!map[d.facultyId]) map[d.facultyId] = [];
      map[d.facultyId].push(d);
    });
    return map;
  }, [safeDepartments]);

  const coursesByDepartment = useMemo(() => {
    const map: Record<string, number> = {};
    collegeCourses.forEach((c) => {
      const key = c.departmentId || '_none';
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [collegeCourses]);

  const [subjectForm, setSubjectForm] = useState({ name: '', code: '', type: 'Core' as 'Core' | 'Elective', creditHours: 3, term: '', session: '', facultyId: '', departmentId: '' });
  const [facultyForm, setFacultyForm] = useState({ name: '', code: '', headName: '' });
  const [deptForm, setDeptForm] = useState<{ name: string; code: string; headName: string; facultyId: string; portalLevel: PortalLevel }>({ name: '', code: '', headName: '', facultyId: '', portalLevel: schoolProfile.portalLevel });
  const [sessionForm, setSessionForm] = useState({ name: '' });

  const coreCount = safeSubjects.filter((s) => s.type === 'Core').length;
  const electiveCount = safeSubjects.filter((s) => s.type === 'Elective').length;

  const openSubjectModal = (subject?: Subject, mode?: TabKey) => {
    if (subject) {
      setEditingItem(subject);
      setSubjectForm({ name: subject.name, code: subject.code, type: subject.type, creditHours: subject.creditHours, term: subject.term || '', session: subject.session || '', facultyId: subject.facultyId || '', departmentId: subject.departmentId || '' });
    } else {
      setEditingItem(null);
      const tab = mode || activeTab;
      if (tab === 'subjects') {
        setSubjectForm({ name: '', code: '', type: 'Core', creditHours: 1, term: subjectTerms[0], session: '', facultyId: '', departmentId: '' });
      } else {
        setSubjectForm({ name: '', code: '', type: 'Core', creditHours: 3, term: '', session: courseSessions[0], facultyId: '', departmentId: '' });
      }
    }
    setModalKind('subject');
  };

  const openFacultyModal = (faculty?: Faculty) => {
    if (faculty) {
      setEditingItem(faculty);
      setFacultyForm({ name: faculty.name, code: faculty.code, headName: faculty.headName });
    } else {
      setEditingItem(null);
      setFacultyForm({ name: '', code: '', headName: '' });
    }
    setModalKind('faculty');
  };

  const openDeptModal = (dept?: Department, preselectedFacultyId?: string) => {
    if (dept) {
      setEditingItem(dept);
      setDeptForm({ name: dept.name, code: dept.code, headName: dept.headName, facultyId: dept.facultyId, portalLevel: dept.portalLevel || schoolProfile.portalLevel });
    } else {
      setEditingItem(null);
      setDeptForm({ name: '', code: '', headName: '', facultyId: preselectedFacultyId || '', portalLevel: schoolProfile.portalLevel });
    }
    setModalKind('department');
  };

  const openSessionModal = (session?: AcademicSession) => {
    if (session) {
      setEditingItem(session);
      setSessionForm({ name: session.name });
    } else {
      setEditingItem(null);
      setSessionForm({ name: '' });
    }
    setModalKind('session');
  };

  const closeModal = () => { setModalKind(null); setEditingItem(null); };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem && 'creditHours' in editingItem) {
      updateSubject(editingItem.id, subjectForm);
      showToast({ title: 'Updated', description: `${subjectForm.name} (${subjectForm.code}) has been saved.`, variant: 'success' });
    } else {
      addSubject({ ...subjectForm, assignedClasses: [] });
      showToast({ title: 'Created', description: `${subjectForm.name} (${subjectForm.code}) has been saved.`, variant: 'success' });
    }
    closeModal();
  };

  const handleSaveFaculty = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem && 'headName' in editingItem && modalKind === 'faculty') {
      updateFaculty(editingItem.id, facultyForm);
    } else {
      addFaculty(facultyForm);
    }
    showToast({
      title: editingItem ? 'Updated' : 'Created',
      description: `${facultyForm.name} (${facultyForm.code}) has been saved.`,
      variant: 'success',
    });
    closeModal();
  };

  const handleSaveDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem && modalKind === 'department') {
      updateDepartment(editingItem.id, deptForm);
      showToast({ title: 'Updated', description: `${deptForm.name} has been saved.`, variant: 'success' });
    } else {
      addDepartment(deptForm);
      showToast({ title: 'Created', description: `${deptForm.name} has been saved.`, variant: 'success' });
    }
    closeModal();
  };

  const handleSaveSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem && modalKind === 'session') {
      updateAcademicSession(editingItem.id, sessionForm);
      showToast({ title: 'Updated', description: `${sessionForm.name} has been saved.`, variant: 'success' });
    } else {
      addAcademicSession(sessionForm);
      showToast({ title: 'Created', description: `${sessionForm.name} has been saved.`, variant: 'success' });
    }
    closeModal();
  };

  const switchTab = (tab: TabKey) => {
    setActiveTab(tab);
    setSearchTerm('');
    setFilterTerm('all');
    setFilterFacultyId('');
    setFilterDeptId('');
  };

  const currentFilterOptions = activeTab === 'subjects' ? subjectTerms : activeTab === 'courses' ? courseSessions : [];

  const deptsForSubjectFaculty = filterFacultyId
    ? safeDepartments.filter((d) => d.facultyId === filterFacultyId)
    : [];

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{labels.curriculumLabel} Management</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Manage {labels.subjectPlural.toLowerCase()} and academic structure for your {schoolProfile.portalLevel.toLowerCase()} institution.
        </p>
      </div>

      <div className={cn("grid gap-4", isCollege ? "grid-cols-2 md:grid-cols-5" : "grid-cols-2 md:grid-cols-3")}>
        {[
          ...(isCollege
            ? [{ label: `Total ${labels.subjectPlural}`, value: collegeCourses.length, color: 'emerald' as const }]
            : [{ label: `Total ${labels.subjectPlural}`, value: primarySubjects.length, color: 'blue' as const }]
          ),
          { label: 'Core', value: coreCount, color: 'amber' as const },
          { label: 'Elective', value: electiveCount, color: 'purple' as const },
          ...(isCollege ? [
            { label: `${structureLabel}s`, value: safeFaculties.length, color: 'blue' as const },
            { label: 'Departments', value: safeDepartments.length, color: 'emerald' as const },
          ] : []),
          ...(isCollege && labels.creditLabel
            ? [{ label: `Total ${labels.creditLabel}`, value: safeSubjects.reduce((sum, s) => sum + (s.creditHours || 0), 0), color: 'blue' as const }]
            : []
          ),
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

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex gap-2 flex-wrap">
            {!isCollege && (
              <button onClick={() => switchTab('subjects')} className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", activeTab === 'subjects' ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700")}>
                <BookOpen className="w-4 h-4 inline mr-1.5" />{labels.subjectPlural}
              </button>
            )}
            {isCollege && (
              <button onClick={() => switchTab('faculties')} className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", activeTab === 'faculties' ? "bg-purple-600 text-white shadow-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700")}>
                <Building2 className="w-4 h-4 inline mr-1.5" />{structureLabel}s & Depts
              </button>
            )}
            {isCollege && (
              <button onClick={() => switchTab('courses')} className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", activeTab === 'courses' ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700")}>
                <GraduationCap className="w-4 h-4 inline mr-1.5" />{labels.subjectPlural}
              </button>
            )}
            {isCollege && (
              <button onClick={() => switchTab('sessions')} className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", activeTab === 'sessions' ? "bg-amber-600 text-white shadow-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700")}>
                Academic Sessions
              </button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {(activeTab === 'subjects' || activeTab === 'courses') && (
              <div className="relative">
                <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select value={filterTerm} onChange={(e) => setFilterTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 dark:text-white appearance-none">
                  <option value="all">All {labels.termLabel}s</option>
                  {currentFilterOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            )}
            {activeTab === 'courses' && (
              <>
                <select value={filterFacultyId} onChange={(e) => { setFilterFacultyId(e.target.value); setFilterDeptId(''); }}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 dark:text-white appearance-none">
                  <option value="">All {structureLabel}s</option>
                  {safeFaculties.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
                {filterFacultyId && (
                  <select value={filterDeptId} onChange={(e) => setFilterDeptId(e.target.value)}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 dark:text-white appearance-none">
                    <option value="">All Departments</option>
                    {deptsForSubjectFaculty.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                )}
              </>
            )}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder={`Search...`}
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-48 pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 dark:text-white" />
            </div>
            <button onClick={() => {
              if (activeTab === 'faculties') openFacultyModal();
              else if (activeTab === 'sessions') openSessionModal();
              else openSubjectModal(undefined, activeTab);
            }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
              <Plus className="w-4 h-4" />
              Add {activeTab === 'subjects' ? labels.subjectSingular : activeTab === 'courses' ? 'Course' : activeTab === 'sessions' ? 'Session' : structureLabel}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          {activeTab === 'subjects' && (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-10">
                <tr className="border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-6">{labels.subjectSingular} Name</th>
                  <th className="py-3 px-6">Code</th>
                  <th className="py-3 px-6">Type</th>
                  <th className="py-3 px-6">{labels.termLabel}</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
                {filteredPrimarySubjects.map((subject) => (
                  <tr key={subject.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg"><BookOpen className="w-4 h-4" /></div>
                        <span className="font-bold text-slate-900 dark:text-white">{subject.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-6 font-mono text-xs text-slate-500">{subject.code}</td>
                    <td className="py-3 px-6">
                      <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        subject.type === 'Core' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      )}>{subject.type}</span>
                    </td>
                    <td className="py-3 px-6 text-sm text-slate-600 dark:text-slate-400">{subject.term || '—'}</td>
                    <td className="py-3 px-6">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openSubjectModal(subject, 'subjects')} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded" title="Edit"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => { deleteSubject(subject.id); showToast({ title: 'Deleted', description: `${subject.name} has been removed.`, variant: 'info' }); }} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredPrimarySubjects.length === 0 && (
                  <tr><td colSpan={5} className="py-12 text-center text-slate-400">No {labels.subjectPlural.toLowerCase()} found.</td></tr>
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'courses' && (
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-10">
                <tr className="border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-6">{labels.subjectSingular} Name</th>
                  <th className="py-3 px-6">Code</th>
                  <th className="py-3 px-6">Type</th>
                  {labels.creditLabel && <th className="py-3 px-6">{labels.creditLabel}</th>}
                  <th className="py-3 px-6">{structureLabel}</th>
                  <th className="py-3 px-6">Department</th>
                  <th className="py-3 px-6">{labels.termLabel}</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCollegeCourses.map((course) => {
                  const fac = safeFaculties.find((f) => f.id === course.facultyId);
                  const dept = safeDepartments.find((d) => d.id === course.departmentId);
                  return (
                    <tr key={course.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg"><GraduationCap className="w-4 h-4" /></div>
                          <span className="font-bold text-slate-900 dark:text-white">{course.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-6 font-mono text-xs text-slate-500">{course.code}</td>
                      <td className="py-3 px-6">
                        <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          course.type === 'Core' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        )}>{course.type}</span>
                      </td>
                      {labels.creditLabel && <td className="py-3 px-6 text-sm font-bold text-slate-900 dark:text-white">{course.creditHours}</td>}
                      <td className="py-3 px-6 text-sm text-slate-600 dark:text-slate-400">{fac?.name || '—'}</td>
                      <td className="py-3 px-6 text-sm text-slate-600 dark:text-slate-400">{dept?.name || '—'}</td>
                      <td className="py-3 px-6 text-sm text-slate-600 dark:text-slate-400">{course.session || '—'}</td>
                      <td className="py-3 px-6">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openSubjectModal(course, 'courses')} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded" title="Edit"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => { deleteSubject(course.id); showToast({ title: 'Deleted', description: `${course.name} has been removed.`, variant: 'info' }); }} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded" title="Delete"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredCollegeCourses.length === 0 && (
                  <tr><td colSpan={labels.creditLabel ? 8 : 7} className="py-12 text-center text-slate-400">No {labels.subjectPlural.toLowerCase()} found.</td></tr>
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'faculties' && (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredFaculties.length === 0 && (
                <div className="py-12 text-center text-slate-400">No {structureLabel.toLowerCase()}s found. Add one using the button above.</div>
              )}
              {filteredFaculties.map((faculty) => {
                const isExpanded = !!expandedFaculty[faculty.id];
                const depts = departmentsByFaculty[faculty.id] || [];
                return (
                  <div key={faculty.id}>
                    <div className="flex items-center gap-3 px-6 py-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                      <button onClick={() => toggleFaculty(faculty.id)} className="p-1 text-slate-400 hover:text-slate-600">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                      <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-lg"><Building2 className="w-4 h-4" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white">{faculty.name}</p>
                        <p className="text-xs text-slate-500">{faculty.code} {faculty.headName ? `• Dean: ${faculty.headName}` : ''}</p>
                      </div>
                      <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                        {depts.length} dept{depts.length !== 1 ? 's' : ''} • {coursesByDepartment[faculty.id] || 0} {labels.subjectPlural.toLowerCase()}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openDeptModal(undefined, faculty.id)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded" title="Add Department"><Plus className="w-4 h-4" /></button>
                        <button onClick={() => openFacultyModal(faculty)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded" title="Edit"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => { deleteFaculty(faculty.id); showToast({ title: 'Deleted', description: `${faculty.name} has been removed.`, variant: 'info' }); }} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
                        {depts.length === 0 ? (
                          <div className="px-16 py-4 text-sm text-slate-400 italic">No departments yet. Click the + icon to add one.</div>
                        ) : (
                          <table className="w-full text-left min-w-[600px]">
                            <thead>
                              <tr className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                <th className="py-2 px-6 pl-16">Department</th>
                                <th className="py-2 px-6">Code</th>
                                <th className="py-2 px-6">Head</th>
                                <th className="py-2 px-6">{labels.subjectPlural}</th>
                                <th className="py-2 px-6 text-center">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800/50">
                              {depts.map((dept) => (
                                <tr key={dept.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors group/dept">
                                  <td className="py-2.5 px-6 pl-16">
                                    <div className="flex items-center gap-2">
                                      <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded"><GraduationCap className="w-3.5 h-3.5" /></div>
                                      <span className="font-bold text-slate-800 dark:text-slate-200">{dept.name}</span>
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-6 font-mono text-xs text-slate-500">{dept.code}</td>
                                  <td className="py-2.5 px-6 text-sm text-slate-600 dark:text-slate-400">{dept.headName || '—'}</td>
                                  <td className="py-2.5 px-6 text-sm text-slate-600 dark:text-slate-400">{coursesByDepartment[dept.id] || 0}</td>
                                  <td className="py-2.5 px-6">
                                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover/dept:opacity-100 transition-opacity">
                                      <button onClick={() => openDeptModal(dept)} className="p-1 text-slate-400 hover:text-amber-600 rounded" title="Edit"><Edit className="w-3.5 h-3.5" /></button>
                                      <button onClick={() => { deleteDepartment(dept.id); showToast({ title: 'Deleted', description: `${dept.name} has been removed.`, variant: 'info' }); }} className="p-1 text-slate-400 hover:text-rose-600 rounded" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'sessions' && (
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-10">
                <tr className="border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-6">Session Name</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
                {filteredSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-lg"><GraduationCap className="w-4 h-4" /></div>
                        <span className="font-bold text-slate-900 dark:text-white">{session.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-6">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openSessionModal(session)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded" title="Edit"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => { deleteAcademicSession(session.id); showToast({ title: 'Deleted', description: `${session.name} has been removed.`, variant: 'info' }); }} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredSessions.length === 0 && (
                  <tr><td colSpan={2} className="py-12 text-center text-slate-400">No academic sessions found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modalKind === 'subject' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={closeModal}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-lg flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingItem?.id ? 'Edit' : 'Add'} {labels.subjectSingular}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <form onSubmit={handleSaveSubject} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">{labels.subjectSingular} Name</label>
                <input type="text" required value={subjectForm.name} onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Code</label>
                  <input type="text" required value={subjectForm.code} onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white font-mono" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                  <select value={subjectForm.type} onChange={(e) => setSubjectForm({ ...subjectForm, type: e.target.value as 'Core' | 'Elective' })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white">
                    <option value="Core">Core</option>
                    <option value="Elective">Elective</option>
                  </select>
                </div>
              </div>
              {activeTab === 'courses' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">{structureLabel}</label>
                      <select value={subjectForm.facultyId} onChange={(e) => setSubjectForm({ ...subjectForm, facultyId: e.target.value, departmentId: '' })}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white">
                        <option value="">Select {structureLabel}</option>
                        {safeFaculties.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Department</label>
                      <select value={subjectForm.departmentId} onChange={(e) => setSubjectForm({ ...subjectForm, departmentId: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white"
                        disabled={!subjectForm.facultyId}>
                        <option value="">Select Department</option>
                        {safeDepartments.filter((d) => d.facultyId === subjectForm.facultyId).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">{labels.creditLabel}</label>
                    <input type="number" min={1} max={10} required value={subjectForm.creditHours}
                      onChange={(e) => setSubjectForm({ ...subjectForm, creditHours: Number(e.target.value) })}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white" />
                  </div>
                </>
              )}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">{labels.termLabel}</label>
                <select
                  value={activeTab === 'courses' ? subjectForm.session : subjectForm.term}
                  onChange={(e) => activeTab === 'courses'
                    ? setSubjectForm({ ...subjectForm, session: e.target.value })
                    : setSubjectForm({ ...subjectForm, term: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white">
                  {(activeTab === 'courses' ? courseSessions : subjectTerms).map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all">
                  {editingItem?.id ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalKind === 'faculty' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={closeModal}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-lg flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingItem?.id ? 'Edit' : 'Add'} {structureLabel}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <form onSubmit={handleSaveFaculty} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">{structureLabel} Name</label>
                <input type="text" required value={facultyForm.name} onChange={(e) => setFacultyForm({ ...facultyForm, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Code</label>
                  <input type="text" required value={facultyForm.code} onChange={(e) => setFacultyForm({ ...facultyForm, code: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white font-mono" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Dean / Head</label>
                  <input type="text" value={facultyForm.headName} onChange={(e) => setFacultyForm({ ...facultyForm, headName: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white" />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all">
                  {editingItem?.id ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalKind === 'department' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={closeModal}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-lg flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingItem?.id ? 'Edit' : 'Add'} Department
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <form onSubmit={handleSaveDept} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Parent {structureLabel}</label>
                <select required value={deptForm.facultyId} onChange={(e) => setDeptForm({ ...deptForm, facultyId: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white">
                  <option value="">Select {structureLabel}</option>
                  {safeFaculties.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Department Name</label>
                <input type="text" required value={deptForm.name} onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white" />
              </div>
              {isCollege && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Institution Type</label>
                  <select value={deptForm.portalLevel} onChange={(e) => setDeptForm({ ...deptForm, portalLevel: e.target.value as PortalLevel })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white">
                    <option value="College">College</option>
                    <option value="Polytechnic">Polytechnic</option>
                    <option value="University">University</option>
                  </select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Code</label>
                  <input type="text" required value={deptForm.code} onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white font-mono" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Head of Department</label>
                  <input type="text" value={deptForm.headName} onChange={(e) => setDeptForm({ ...deptForm, headName: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white" />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all">
                  {editingItem?.id ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalKind === 'session' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={closeModal}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-lg flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingItem?.id ? 'Edit' : 'Add'} Academic Session
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <form onSubmit={handleSaveSession} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Session Name</label>
                <input type="text" required value={sessionForm.name} onChange={(e) => setSessionForm({ ...sessionForm, name: e.target.value })}
                  placeholder="e.g. 2024/2025"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-amber-900/20 transition-all">
                  {editingItem?.id ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
