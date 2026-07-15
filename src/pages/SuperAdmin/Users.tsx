import React, { useMemo, useState } from 'react';
import { Users, UserPlus, Search, Filter, Shield, Mail, MoreVertical, X, Trash2 } from 'lucide-react';
import { KPICard } from '@/components/ui/KPICard';
import { cn } from '@/utils';
import { useDataStore } from '@/store/useDataStore';
import { useToastStore } from '@/store/useToastStore';

export default function UsersManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const { schools } = useDataStore();
  const showToast = useToastStore((state) => state.showToast);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [users, setUsers] = useState([
    { id: 'USR-001', name: 'John Smith', email: 'john@greenfield.edu', role: 'School Admin', school: 'Greenfield Intl', status: 'Active' as 'Active' | 'Inactive' },
    { id: 'USR-002', name: 'Sarah Wilson', email: 'sarah@bluecrest.edu', role: 'School Admin', school: 'Bluecrest Academy', status: 'Active' as 'Active' | 'Inactive' },
    { id: 'USR-003', name: 'Michael Brown', email: 'mike@techhigh.edu', role: 'Accountant', school: 'Tech High', status: 'Inactive' as 'Active' | 'Inactive' },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'School Admin',
    school: schools[0]?.name ?? 'Greenfield Intl',
    status: 'Active' as 'Active' | 'Inactive',
  });

  const filteredUsers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return users;
    return users.filter((user) => {
      return (
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.role.toLowerCase().includes(q) ||
        user.school.toLowerCase().includes(q)
      );
    });
  }, [searchTerm, users]);

  const handleOpenModal = () => {
    setFormData({
      name: '',
      email: '',
      role: 'School Admin',
      school: schools[0]?.name ?? 'Greenfield Intl',
      status: 'Active',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `USR-${Math.floor(100 + Math.random() * 900)}`;
    setUsers((current) => [{ id, ...formData }, ...current]);
    setIsModalOpen(false);
    showToast({
      title: 'Platform user created',
      description: `${formData.name} has been added as ${formData.role}.`,
      variant: 'success',
    });
  };

  const handleDelete = (id: string) => {
    setUsers((current) => current.filter((user) => user.id !== id));
    showToast({
      title: 'User removed',
      description: 'The platform user has been removed successfully.',
      variant: 'warning',
    });
  };

  return (
    <div className="space-y-6">
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create Platform User</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-blue-500 dark:text-white text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-blue-500 dark:text-white text-sm"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Platform Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-blue-500 dark:text-white text-sm"
                  >
                    <option>School Admin</option>
                    <option>Accountant</option>
                    <option>Teacher</option>
                    <option>HR</option>
                    <option>Transport Officer</option>
                    <option>Librarian</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Assigned School</label>
                  <select
                    value={formData.school}
                    onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-blue-500 dark:text-white text-sm"
                  >
                    {schools.map((school) => (
                      <option key={school.id} value={school.name}>
                        {school.name}
                      </option>
                    ))}
                    {schools.length === 0 && <option value="Greenfield Intl">Greenfield Intl</option>}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-blue-500 dark:text-white text-sm"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-sm font-bold shadow-lg active:scale-95 transition-all"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Platform Users</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage all administrative users across registered schools.</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-lg"
        >
          <UserPlus className="w-4 h-4" />
          Create Platform User
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard title="Total Admins" value="42" icon={Shield} iconBgClass="bg-blue-50" iconColorClass="text-blue-600" />
        <KPICard title="Active Sessions" value="12" icon={Users} iconBgClass="bg-emerald-50" iconColorClass="text-emerald-600" />
        <KPICard title="Pending Invites" value="5" icon={Mail} iconBgClass="bg-amber-50" iconColorClass="text-amber-600" />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <button
            onClick={() =>
              showToast({
                title: 'Filter ready',
                description: 'Use the search box to filter by name, email, role, or school.',
                variant: 'info',
              })
            }
            className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
          >
            <Filter className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-800/50">
              <th className="py-4 px-6">User Details</th>
              <th className="py-4 px-6">Platform Role</th>
              <th className="py-4 px-6">Assigned School</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                      {user.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{user.name}</p>
                      <p className="text-[10px] text-slate-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-sm font-medium text-slate-600 dark:text-slate-400">{user.role}</td>
                <td className="py-4 px-6 text-sm font-medium text-slate-600 dark:text-slate-400">{user.school}</td>
                <td className="py-4 px-6">
                  <span className={cn(
                    "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                    user.status === 'Active' ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"
                  )}>
                    {user.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() =>
                        showToast({
                          title: 'User actions',
                          description: `Selected ${user.name}.`,
                          variant: 'info',
                        })
                      }
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-slate-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
