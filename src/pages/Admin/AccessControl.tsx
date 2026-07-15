import React, { useMemo, useState } from 'react';
import { ShieldCheck, Plus, X, Edit, Trash2, Search, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils';
import { DelegatedPortalAccess, PortalPrivilegeKey, useDataStore } from '@/store/useDataStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';

const privilegeOptions: Array<{ key: PortalPrivilegeKey; label: string; description: string; path: string }> = [
  { key: 'manage_students', label: 'Students', description: 'Handle student directory and registration.', path: '/admin/students' },
  { key: 'manage_teachers', label: 'Teachers', description: 'Manage teacher records and staffing.', path: '/admin/teachers' },
  { key: 'manage_parents', label: 'Parents', description: 'Handle parent accounts and support.', path: '/admin/parents' },
  { key: 'manage_classes', label: 'Classes', description: 'Maintain classes or departments.', path: '/admin/classes' },
  { key: 'manage_timetable', label: 'Timetable', description: 'Manage school timetable scheduling.', path: '/admin/timetable' },
  { key: 'manage_curriculum', label: 'Curriculum', description: 'Handle subjects, programmes, and curriculum.', path: '/admin/academic' },
  { key: 'manage_results', label: 'Results', description: 'Access result sheets and academic records.', path: '/admin/results' },
  { key: 'manage_exam_timetable', label: 'Exam Timetable', description: 'Manage exam and test schedules.', path: '/admin/exam-timetable' },
  { key: 'manage_fees', label: 'Fee Collection', description: 'Record and review fee payments.', path: '/admin/fees' },
  { key: 'manage_finance', label: 'Finance', description: 'Access finance overview and analytics.', path: '/admin/finance' },
  { key: 'manage_payroll', label: 'Payroll', description: 'Approve payroll and salary processing.', path: '/admin/payroll' },
  { key: 'manage_notices', label: 'Notices', description: 'Create and publish school notices.', path: '/admin/notices' },
  { key: 'manage_transport', label: 'Transport', description: 'Use the transport portal and routes.', path: '/transport' },
  { key: 'manage_library', label: 'Library', description: 'Use the library portal and circulation desk.', path: '/librarian' },
  { key: 'manage_hostel', label: 'Hostel', description: 'Use hostel allocation and maintenance pages.', path: '/hostel' },
  { key: 'manage_hr', label: 'HR', description: 'Use employee, attendance, and leave modules.', path: '/hr' },
];

const createEmptyForm = () => ({
  userName: '',
  userEmail: '',
  userRole: '',
  department: '',
  privileges: [] as PortalPrivilegeKey[],
  status: 'Active' as DelegatedPortalAccess['status'],
  note: '',
});

export default function AdminAccessControl() {
  const { teachers, staff, delegatedAccess, addDelegatedAccess, updateDelegatedAccess, deleteDelegatedAccess } = useDataStore();
  const user = useAuthStore((state) => state.user);
  const showToast = useToastStore((state) => state.showToast);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccess, setEditingAccess] = useState<DelegatedPortalAccess | null>(null);
  const [formData, setFormData] = useState(createEmptyForm());

  const filteredAccess = useMemo(() => delegatedAccess.filter((entry) =>
    [entry.userName, entry.userEmail, entry.userRole, entry.department]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(searchTerm.toLowerCase()))
  ), [delegatedAccess, searchTerm]);

  const suggestedUsers = useMemo(() => {
    const combined = [
      ...teachers.map((teacher) => ({
        name: teacher.name,
        email: teacher.email,
        role: 'Teacher',
        department: teacher.subject,
      })),
      ...staff.map((member) => ({
        name: member.name,
        email: member.email,
        role: member.role,
        department: member.category,
      })),
    ];

    return combined.filter((candidate, index, source) =>
      source.findIndex((item) => item.email === candidate.email) === index
    );
  }, [staff, teachers]);

  const handleOpenModal = (entry?: DelegatedPortalAccess) => {
    if (entry) {
      setEditingAccess(entry);
      setFormData({
        userName: entry.userName,
        userEmail: entry.userEmail,
        userRole: entry.userRole,
        department: entry.department || '',
        privileges: entry.privileges,
        status: entry.status,
        note: entry.note || '',
      });
    } else {
      setEditingAccess(null);
      setFormData(createEmptyForm());
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (formData.privileges.length === 0) {
      showToast({
        title: 'Select privileges',
        description: 'Choose at least one work area to delegate before saving.',
        variant: 'warning',
      });
      return;
    }

    const payload = {
      ...formData,
      assignedBy: user?.name || 'Administrator',
    };

    if (editingAccess) {
      updateDelegatedAccess(editingAccess.id, payload);
    } else {
      addDelegatedAccess(payload);
    }

    showToast({
      title: editingAccess ? 'Privileges updated' : 'Privileges assigned',
      description: `${formData.userName} can now access the selected portal work areas.`,
      variant: 'success',
    });
    setIsModalOpen(false);
  };

  const togglePrivilege = (privilege: PortalPrivilegeKey) => {
    setFormData((current) => ({
      ...current,
      privileges: current.privileges.includes(privilege)
        ? current.privileges.filter((item) => item !== privilege)
        : [...current.privileges, privilege],
    }));
  };

  const handleSuggestedUser = (email: string) => {
    const selected = suggestedUsers.find((candidate) => candidate.email === email);
    if (!selected) return;
    setFormData((current) => ({
      ...current,
      userName: selected.name,
      userEmail: selected.email,
      userRole: selected.role,
      department: selected.department,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Privilege Control</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Assign portal work areas to users so they can handle specific tasks without being full administrators.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-900/20"
        >
          <Plus className="w-4 h-4" />
          Assign Privileges
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Active Delegations</p>
          <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">
            {delegatedAccess.filter((entry) => entry.status === 'Active').length}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Protected Work Areas</p>
          <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{privilegeOptions.length}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Suggested Users</p>
          <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{suggestedUsers.length}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search delegated users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 dark:text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[980px]">
            <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0">
              <tr className="border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-6">User</th>
                <th className="py-3 px-6">Role</th>
                <th className="py-3 px-6">Department</th>
                <th className="py-3 px-6">Privileges</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Updated</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAccess.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group">
                  <td className="py-4 px-6">
                    <p className="font-bold text-slate-900 dark:text-white">{entry.userName}</p>
                    <p className="text-xs text-slate-500">{entry.userEmail}</p>
                  </td>
                  <td className="py-4 px-6 font-medium text-slate-700 dark:text-slate-300">{entry.userRole}</td>
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-400">{entry.department || 'General'}</td>
                  <td className="py-4 px-6">
                    <div className="flex flex-wrap gap-2">
                      {entry.privileges.map((privilege) => {
                        const match = privilegeOptions.find((option) => option.key === privilege);
                        return (
                          <span key={privilege} className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            {match?.label || privilege}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={cn(
                      "inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      entry.status === 'Active'
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                    )}>
                      {entry.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-500">{entry.updatedAt}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenModal(entry)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteDelegatedAccess(entry.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredAccess.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
              <ShieldCheck className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm font-medium">No delegated access records match your search.</p>
            </div>
          ) : null}
        </div>
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl overflow-hidden" onClick={(event) => event.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingAccess ? 'Update Delegated Access' : 'Assign Portal Privileges'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="max-h-[85vh] overflow-y-auto p-6 space-y-6">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/30 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">User Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="space-y-1">
                    <span className="text-xs font-bold text-slate-500 uppercase">Suggested Portal User</span>
                    <select
                      value=""
                      onChange={(e) => handleSuggestedUser(e.target.value)}
                      className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white"
                    >
                      <option value="">Pick from teachers or staff</option>
                      {suggestedUsers.map((candidate) => (
                        <option key={candidate.email} value={candidate.email}>
                          {candidate.name} - {candidate.role}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="rounded-2xl bg-blue-50 dark:bg-blue-900/20 px-4 py-3 text-sm text-blue-700 dark:text-blue-300">
                    Use the selector above or type a portal user's details manually if they are not yet listed in the directory.
                  </div>
                  <label className="space-y-1">
                    <span className="text-xs font-bold text-slate-500 uppercase">User Name</span>
                    <input value={formData.userName} onChange={(e) => setFormData((current) => ({ ...current, userName: e.target.value }))} required className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white" />
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs font-bold text-slate-500 uppercase">User Email</span>
                    <input type="email" value={formData.userEmail} onChange={(e) => setFormData((current) => ({ ...current, userEmail: e.target.value }))} required className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white" />
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs font-bold text-slate-500 uppercase">Role Label</span>
                    <input value={formData.userRole} onChange={(e) => setFormData((current) => ({ ...current, userRole: e.target.value }))} required className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white" />
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs font-bold text-slate-500 uppercase">Department</span>
                    <input value={formData.department} onChange={(e) => setFormData((current) => ({ ...current, department: e.target.value }))} className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white" />
                  </label>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/30 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Delegated Work Areas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {privilegeOptions.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => togglePrivilege(option.key)}
                      className={cn(
                        "rounded-2xl border p-4 text-left transition-all",
                        formData.privileges.includes(option.key)
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{option.label}</p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{option.description}</p>
                          <p className="mt-2 text-[11px] font-mono text-slate-400">{option.path}</p>
                        </div>
                        {formData.privileges.includes(option.key) ? (
                          <CheckCircle2 className="w-5 h-5 text-blue-600" />
                        ) : null}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase">Status</span>
                  <select value={formData.status} onChange={(e) => setFormData((current) => ({ ...current, status: e.target.value as DelegatedPortalAccess['status'] }))} className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white">
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase">Internal Note</span>
                  <textarea value={formData.note} onChange={(e) => setFormData((current) => ({ ...current, note: e.target.value }))} rows={3} className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white" />
                </label>
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all">
                  {editingAccess ? 'Update Privileges' : 'Assign Privileges'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
