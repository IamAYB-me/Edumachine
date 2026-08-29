import React, { useState, useMemo } from 'react';
import {
  Search, Users, GraduationCap, UserCheck, UserMinus, Plus,
  Trash2, X, Edit, Filter, Download, UserCog, RefreshCw,
} from 'lucide-react';
import { cn } from '@/utils';
import { useDataStore, Student, Teacher, Parent, Staff, PlatformUser } from '@/store/useDataStore';
import { useToastStore } from '@/store/useToastStore';
import { KPICard } from '@/components/ui/KPICard';
import { logActivity } from '@/utils/activityLogger';
import { getPortalLevelLabels } from '@/utils/schoolProfile';
import { addDocumentWithId } from '@/services/firestoreService';

type Tab = 'students' | 'teachers' | 'parents' | 'staff' | 'users';

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'students', label: 'Students', icon: GraduationCap },
  { key: 'teachers', label: 'Teachers', icon: UserCheck },
  { key: 'parents', label: 'Parents', icon: Users },
  { key: 'staff', label: 'Staff', icon: UserMinus },
  { key: 'users', label: 'Portal Users', icon: UserCog },
];

export default function SchoolUsers() {
  const {
    students, teachers, parents, staff, schools, platformUsers,
    addStudent, updateStudent, deleteStudent,
    addTeacher, updateTeacher, deleteTeacher,
    addParent, updateParent, deleteParent,
    addStaff, updateStaff, deleteStaff,
    deletePlatformUser,
  } = useDataStore();
  const showToast = useToastStore((s) => s.showToast);

  const [activeTab, setActiveTab] = useState<Tab>('students');
  const [searchTerm, setSearchTerm] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('All');

  const [deleteTarget, setDeleteTarget] = useState<{ type: Tab; item: Student | Teacher | Parent | Staff | PlatformUser } | null>(null);
  const [editTarget, setEditTarget] = useState<{ type: Tab; item: Student | Teacher | Parent | Staff } | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const allSchoolNames = useMemo(() => {
    const names = new Set(schools.map((s) => s.name));
    return Array.from(names).sort();
  }, [schools]);

  const selectedSchool = useMemo(
    () => schools.find((s) => s.name === schoolFilter),
    [schools, schoolFilter],
  );
  const termsLabels = getPortalLevelLabels(selectedSchool?.portalLevel || 'Secondary');

  const formatUserRole = (u: PlatformUser) => {
    const school = schools.find((s) => s.name === u.schoolName);
    const labels = getPortalLevelLabels(school?.portalLevel || 'Secondary');
    const key = (u.role || '').toUpperCase();
    if (key === 'TEACHER') return labels.teacherSingular;
    if (key === 'STUDENT') return labels.learnerSingular;
    const roleMap: Record<string, string> = {
      SUPER_ADMIN: 'Platform Admin',
      ADMIN: 'School Admin',
      PARENT: 'Parent',
      STAFF: 'Staff',
    };
    return u.roleLabel || roleMap[key] || u.role;
  };

  const filterBySchool = <T extends { name?: string }>(items: T[]): T[] => {
    if (schoolFilter === 'All') return items;
    return items.filter((item) => {
      const name = item.name || '';
      return name;
    });
  };

  const filteredStudents = useMemo(() => {
    let list = students;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter((s) =>
        s.name?.toLowerCase().includes(q) ||
        s.regNo?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.class?.toLowerCase().includes(q)
      );
    }
    return filterBySchool(list);
  }, [students, searchTerm, schoolFilter]);

  const filteredTeachers = useMemo(() => {
    let list = teachers;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter((t) =>
        t.name?.toLowerCase().includes(q) ||
        t.employeeId?.toLowerCase().includes(q) ||
        t.email?.toLowerCase().includes(q) ||
        t.subject?.toLowerCase().includes(q)
      );
    }
    return filterBySchool(list);
  }, [teachers, searchTerm, schoolFilter]);

  const filteredParents = useMemo(() => {
    let list = parents;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter((p) =>
        p.name?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.phone?.toLowerCase().includes(q)
      );
    }
    return filterBySchool(list);
  }, [parents, searchTerm, schoolFilter]);

  const filteredStaff = useMemo(() => {
    let list = staff;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter((s) =>
        s.name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.role?.toLowerCase().includes(q)
      );
    }
    return filterBySchool(list);
  }, [staff, searchTerm, schoolFilter]);

  const filteredPlatformUsers = useMemo(() => {
    let list = [...platformUsers];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter((u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q) ||
        (u.schoolName || '').toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => a.role.localeCompare(b.role) || a.name.localeCompare(b.name));
  }, [platformUsers, searchTerm]);

  const pendingStudentUsers = useMemo(() => {
    const existing = new Set(students.map((s) => s.id));
    return platformUsers.filter((u) => {
      if ((u.role || '').toUpperCase() !== 'STUDENT') return false;
      const uid = u.uid || u.id;
      return Boolean(uid) && !existing.has(uid);
    });
  }, [platformUsers, students]);

  const handleSyncStudents = async () => {
    if (pendingStudentUsers.length === 0 || isSyncing) return;
    setIsSyncing(true);
    let created = 0;
    let failed = 0;
    for (const u of pendingStudentUsers) {
      const uid = u.uid || u.id;
      if (!uid) continue;
      const school = schools.find((s) => s.name === u.schoolName);
      try {
        await addDocumentWithId('students', uid, {
          name: u.name,
          email: u.email || '',
          phone: u.phone || '',
          regNo: '',
          class: '',
          parentName: '',
          status: 'Active',
          portalLevel: school?.portalLevel || 'Secondary',
        });
        created += 1;
      } catch (error) {
        failed += 1;
        console.error('Failed to sync portal student:', uid, error);
      }
    }
    setIsSyncing(false);
    if (created > 0) {
      showToast({ title: 'Students synced', description: `${created} registered ${termsLabels.learnerPlural.toLowerCase()} added to the ${termsLabels.learnerPlural.toLowerCase()} directory.`, variant: 'success' });
      logActivity({ action: 'CREATE', module: 'students', description: `Backfilled ${created} registered students from portal users`, targetId: 'bulk' }).catch(console.error);
    }
    if (failed > 0) {
      showToast({ title: 'Partial sync', description: `${failed} record(s) could not be synced.`, variant: 'warning' });
    }
  };

  const getFiltered = () => {
    switch (activeTab) {
      case 'students': return filteredStudents;
      case 'teachers': return filteredTeachers;
      case 'parents': return filteredParents;
      case 'staff': return filteredStaff;
      case 'users': return filteredPlatformUsers;
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const { type, item } = deleteTarget;
    if (type === 'students') deleteStudent(item.id);
    else if (type === 'teachers') deleteTeacher(item.id);
    else if (type === 'parents') deleteParent(item.id);
    else if (type === 'staff') deleteStaff(item.id);
    else if (type === 'users') deletePlatformUser((item as PlatformUser).id);
    logActivity({ action: 'DELETE', module: type, description: `Deleted ${type} record: ${(item as any).name}`, targetId: item.id, targetName: (item as any).name }).catch(console.error);
    showToast({ title: 'Deleted', description: `${(item as any).name || 'Record'} has been removed.`, variant: 'success' });
    setDeleteTarget(null);
  };

  const handleExport = () => {
    const rows: string[][] = [['Name', 'Email', 'Phone', 'Role/Class', 'Status', 'Type']];
    filteredStudents.forEach((s) => rows.push([s.name, s.email || '', s.phone || '', s.class || '', s.status || '', 'Student']));
    filteredTeachers.forEach((t) => rows.push([t.name, t.email || '', t.phone || '', t.subject || '', t.status || '', termsLabels.teacherSingular]));
    filteredParents.forEach((p) => rows.push([p.name, p.email || '', p.phone || '', p.occupation || '', 'Active', 'Parent']));
    filteredStaff.forEach((s) => rows.push([s.name, s.email || '', s.phone || '', s.role || '', s.status || '', 'Staff']));
    filteredPlatformUsers.forEach((u) => rows.push([u.name, u.email || '', u.phone || '', u.role || '', u.status || 'Active', 'Portal User']));
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `school-users-${activeTab}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast({ title: 'Export Complete', description: `${getFiltered().length} records exported.`, variant: 'success' });
  };

  const inputClass = "w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:text-white";

  const getInitials = (name: string) =>
    name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '??';

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">School Users</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">View and manage all users across registered schools.</p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'users' && (
            <button
              onClick={handleSyncStudents}
              disabled={pendingStudentUsers.length === 0 || isSyncing}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
              {isSyncing ? 'Syncing...' : `Sync Students (${pendingStudentUsers.length})`}
            </button>
          )}
          <button onClick={handleExport} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
          {activeTab !== 'users' && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add {activeTab === 'teachers' ? termsLabels.teacherSingular : TABS.find((t) => t.key === activeTab)?.label?.slice(0, -1)}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <KPICard title="Students" value={students.length} icon={GraduationCap} iconColorClass="text-blue-600" iconBgClass="bg-blue-50 dark:bg-blue-900/20" />
        <KPICard title={termsLabels.teacherPlural} value={teachers.length} icon={UserCheck} iconColorClass="text-indigo-600" iconBgClass="bg-indigo-50 dark:bg-indigo-900/20" />
        <KPICard title="Parents" value={parents.length} icon={Users} iconColorClass="text-emerald-600" iconBgClass="bg-emerald-50 dark:bg-emerald-900/20" />
        <KPICard title="Staff" value={staff.length} icon={UserMinus} iconColorClass="text-amber-600" iconBgClass="bg-amber-50 dark:bg-amber-900/20" />
        <KPICard title="Portal Users" value={platformUsers.length} icon={UserCog} iconColorClass="text-purple-600" iconBgClass="bg-purple-50 dark:bg-purple-900/20" />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="border-b border-slate-200 dark:border-slate-800 flex overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const count = tab.key === 'students' ? students.length : tab.key === 'teachers' ? teachers.length : tab.key === 'parents' ? parents.length : tab.key === 'staff' ? staff.length : platformUsers.length;
            return (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setSearchTerm(''); }}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                  activeTab === tab.key
                    ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.key === 'teachers' ? termsLabels.teacherPlural : tab.label}
                <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-all dark:text-white"
            />
          </div>
          <div className="relative w-full sm:w-60">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={schoolFilter}
              onChange={(e) => setSchoolFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-all dark:text-white appearance-none"
            >
              <option value="All">All Schools</option>
              {allSchoolNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          {getFiltered().length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">No {activeTab} found</h3>
              <p className="text-sm text-slate-500">No records match your search criteria.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-10">
                <tr className="border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-6">Name</th>
                  <th className="py-3 px-6">Contact</th>
                  {activeTab === 'students' && <th className="py-3 px-6">Class / Reg No</th>}
                  {activeTab === 'teachers' && <th className="py-3 px-6">Subject</th>}
                  {activeTab === 'parents' && <th className="py-3 px-6">Children</th>}
                  {activeTab === 'staff' && <th className="py-3 px-6">Role / Category</th>}
                  {activeTab === 'users' && <th className="py-3 px-6">Role / School</th>}
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
                {getFiltered().map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {getInitials((item as any).name)}
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">{(item as any).name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-slate-700 dark:text-slate-300">{(item as any).email || '-'}</p>
                      <p className="text-xs text-slate-500">{(item as any).phone || ''}</p>
                    </td>
                    {activeTab === 'students' && (
                      <td className="py-4 px-6">
                        <p className="text-slate-700 dark:text-slate-300">{(item as Student).class || '-'}</p>
                        <p className="text-xs text-slate-500">{(item as Student).regNo || ''}</p>
                      </td>
                    )}
                    {activeTab === 'teachers' && (
                      <td className="py-4 px-6 text-slate-700 dark:text-slate-300">{(item as Teacher).subject || '-'}</td>
                    )}
                    {activeTab === 'parents' && (
                      <td className="py-4 px-6 text-slate-700 dark:text-slate-300">{(item as Parent).children?.length || 0} child(ren)</td>
                    )}
{activeTab === 'staff' && (
                    <td className="py-4 px-6">
                      <p className="text-slate-700 dark:text-slate-300">{(item as Staff).role || '-'}</p>
                      <p className="text-xs text-slate-500">{(item as Staff).category || ''}</p>
                    </td>
                  )}
                  {activeTab === 'users' && (
                    <td className="py-4 px-6">
                      <p className="text-slate-700 dark:text-slate-300">{formatUserRole(item as PlatformUser)}</p>
                      <p className="text-xs text-slate-500">{(item as PlatformUser).schoolName || ''}</p>
                    </td>
                  )}
                    <td className="py-4 px-6">
                      <span className={cn("inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold",
                        ((item as any).status || 'Active') === 'Active' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                      )}>
                        {(item as any).status || 'Active'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
<div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {activeTab !== 'users' && (
                          <button
                            onClick={() => setEditTarget({ type: activeTab, item: item as Student | Teacher | Parent | Staff })}
                            title="Edit"
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteTarget({ type: activeTab, item })}
                          title="Delete"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Confirm Delete</h2>
            <p className="text-sm text-slate-500 mb-6">Are you sure you want to delete <strong>{(deleteTarget.item as any).name}</strong>? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {(isCreateOpen || editTarget) && (
        <UserFormModal
          mode={isCreateOpen ? 'create' : 'edit'}
          type={editTarget?.type || activeTab}
          item={editTarget?.item || null}
          inputClass={inputClass}
          onClose={() => { setIsCreateOpen(false); setEditTarget(null); }}
          onSave={(type, data) => {
            if (isCreateOpen) {
              const id = (Math.random().toString(36).substring(2, 11));
              if (type === 'students') {
                addStudent({ ...data, id } as Omit<Student, 'id'>);
              } else if (type === 'teachers') {
                addTeacher({ ...data, id } as Omit<Teacher, 'id'>);
              } else if (type === 'parents') {
                addParent({ ...data, id } as Omit<Parent, 'id'>);
              } else {
                addStaff({ ...data, id } as Omit<Staff, 'id'>);
              }
              logActivity({ action: 'CREATE', module: type, description: `Created ${type} record: ${(data as any).name}`, targetId: id, targetName: (data as any).name }).catch(console.error);
              showToast({ title: 'Created', description: `${(data as any).name || 'Record'} has been added.`, variant: 'success' });
            } else if (editTarget) {
              if (type === 'students') updateStudent(editTarget.item.id, data as Partial<Student>);
              else if (type === 'teachers') updateTeacher(editTarget.item.id, data as Partial<Teacher>);
              else if (type === 'parents') updateParent(editTarget.item.id, data as Partial<Parent>);
              else updateStaff(editTarget.item.id, data as Partial<Staff>);
              logActivity({ action: 'UPDATE', module: type, description: `Updated ${type} record: ${(data as any).name || (editTarget.item as any).name}`, targetId: editTarget.item.id }).catch(console.error);
              showToast({ title: 'Updated', description: `Record has been updated.`, variant: 'success' });
            }
            setIsCreateOpen(false);
            setEditTarget(null);
          }}
        />
      )}
    </div>
  );
}

function UserFormModal({
  mode, type, item, inputClass, onClose, onSave,
}: {
  mode: 'create' | 'edit';
  type: Tab;
  item: Student | Teacher | Parent | Staff | null;
  inputClass: string;
  onClose: () => void;
  onSave: (type: Tab, data: any) => void;
}) {
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    if (item) return { ...item };
    if (type === 'students') return { name: '', email: '', phone: '', class: '', regNo: '', parentName: '', status: 'Active' };
    if (type === 'teachers') return { name: '', email: '', phone: '', subject: '', employeeId: '', status: 'Active' };
    if (type === 'parents') return { name: '', email: '', phone: '', occupation: '', children: [] };
    return { name: '', email: '', phone: '', role: '', category: 'Non-Academic', status: 'Active', joinDate: new Date().toISOString().split('T')[0] };
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(type, formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-lg flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {mode === 'create' ? 'Add New' : 'Edit'} {type.charAt(0).toUpperCase() + type.slice(1, -1)}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
            <input type="text" required value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
              <input type="email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Phone</label>
              <input type="text" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={inputClass} />
            </div>
          </div>

          {type === 'students' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Class</label>
                  <input type="text" value={formData.class || ''} onChange={(e) => setFormData({ ...formData, class: e.target.value })} className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Reg No</label>
                  <input type="text" value={formData.regNo || ''} onChange={(e) => setFormData({ ...formData, regNo: e.target.value })} className={inputClass} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Parent Name</label>
                <input type="text" value={formData.parentName || ''} onChange={(e) => setFormData({ ...formData, parentName: e.target.value })} className={inputClass} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                <select value={formData.status || 'Active'} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={inputClass}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Graduated">Graduated</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Withdrawn">Withdrawn</option>
                </select>
              </div>
            </>
          )}

          {type === 'teachers' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Employee ID</label>
                  <input type="text" value={formData.employeeId || ''} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Subject</label>
                  <input type="text" value={formData.subject || ''} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className={inputClass} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                <select value={formData.status || 'Active'} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={inputClass}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </>
          )}

          {type === 'parents' && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Occupation</label>
              <input type="text" value={formData.occupation || ''} onChange={(e) => setFormData({ ...formData, occupation: e.target.value })} className={inputClass} />
            </div>
          )}

          {type === 'staff' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Role</label>
                  <input type="text" value={formData.role || ''} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                  <select value={formData.category || 'Non-Academic'} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className={inputClass}>
                    <option value="Academic">Academic</option>
                    <option value="Non-Academic">Non-Academic</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                <select value={formData.status || 'Active'} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={inputClass}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </>
          )}

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all">
              {mode === 'create' ? 'Create' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
