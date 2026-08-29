import { useState } from 'react';
import { Search, Users as UsersIcon, Trash2, X, Mail, Shield, Download } from 'lucide-react';
import { cn } from '@/utils';
import { useDataStore, PlatformUser } from '@/store/useDataStore';
import { useToastStore } from '@/store/useToastStore';
import { KPICard } from '@/components/ui/KPICard';

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
};

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

export default function Users() {
  const { platformUsers, deletePlatformUser } = useDataStore();
  const showToast = useToastStore((s) => s.showToast);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [deleteTarget, setDeleteTarget] = useState<PlatformUser | null>(null);
  const [viewTarget, setViewTarget] = useState<PlatformUser | null>(null);

  const superAdminUsers = platformUsers.filter((u) => u.role === 'SUPER_ADMIN');

  const filtered = superAdminUsers.filter((u) => {
    const matchSearch =
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.schoolName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  const totalUsers = superAdminUsers.length;
  const activeUsers = superAdminUsers.filter((u) => u.status !== 'Inactive').length;

  const getInitials = (name: string) =>
    name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '??';

  const handleDelete = () => {
    if (!deleteTarget) return;
    deletePlatformUser(deleteTarget.id);
    showToast({ title: 'User Deleted', description: `${deleteTarget.name} has been removed.`, variant: 'success' });
    setDeleteTarget(null);
  };

  const handleExport = () => {
    const csv = [
      ['Name', 'Email', 'Role', 'Status', 'School'].join(','),
      ...filtered.map((u) => [u.name, u.email, u.role, u.status || 'Active', u.schoolName || ''].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast({ title: 'Export Complete', description: `${filtered.length} users exported.`, variant: 'success' });
  };

  const inputClass = "w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:text-white";

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Platform Admins</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage super admin accounts for the platform.</p>
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <KPICard title="Total Admins" value={String(totalUsers)} icon={UsersIcon} iconColorClass="text-blue-600" iconBgClass="bg-blue-50 dark:bg-blue-900/20" />
        <KPICard title="Active Admins" value={String(activeUsers)} icon={Shield} iconColorClass="text-emerald-600" iconBgClass="bg-emerald-50 dark:bg-emerald-900/20" />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-all dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('table')}
                className={cn("px-3 py-2 text-xs font-medium transition-colors", viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400')}
              >Table</button>
              <button
                onClick={() => setViewMode('grid')}
                className={cn("px-3 py-2 text-xs font-medium transition-colors", viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400')}
              >Grid</button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          {platformUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <UsersIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">No Super Admins Yet</h3>
              <p className="text-sm text-slate-500">No super admin accounts are registered.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-3" />
              <h3 className="text-base font-medium text-slate-700 dark:text-slate-300">No matching users</h3>
              <p className="text-sm text-slate-500">Try adjusting your search or filter.</p>
            </div>
          ) : viewMode === 'table' ? (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-10">
                <tr className="border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-6">User</th>
                  <th className="py-3 px-6">School</th>
                  <th className="py-3 px-6">Role</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{user.name}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1"><Mail className="w-3 h-3" />{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-400">{user.schoolName || '-'}</td>
                    <td className="py-4 px-6">
                      <span className={cn("inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider", ROLE_COLORS[user.role] || 'bg-slate-100 text-slate-600')}>
                        {ROLE_LABELS[user.role] || user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={cn("inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold",
                        (user.status || 'Active') === 'Active' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                      )}>
                        {user.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setViewTarget(user)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded" title="View">
                          <UsersIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(user)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {filtered.map((user) => (
                <div key={user.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:shadow-md transition-shadow group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {getInitials(user.name)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">{user.name}</h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1"><Mail className="w-3 h-3" />{user.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setDeleteTarget(user)} className="p-1 text-slate-400 hover:text-rose-600 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  {user.schoolName && <p className="text-xs text-slate-500 flex items-center gap-2 mb-2"><Shield className="w-3 h-3" />{user.schoolName}</p>}
                  <div className="flex items-center justify-between pt-2">
                    <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider", ROLE_COLORS[user.role] || 'bg-slate-100 text-slate-600')}>
                      {ROLE_LABELS[user.role] || user.role}
                    </span>
                    <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-semibold",
                      (user.status || 'Active') === 'Active' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                    )}>
                      {user.status || 'Active'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* View Detail Modal */}
      {viewTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setViewTarget(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">User Details</h2>
              <button onClick={() => setViewTarget(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 flex items-center justify-center text-xl font-bold">{getInitials(viewTarget.name)}</div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{viewTarget.name}</h3>
                  <p className="text-sm text-slate-500">{viewTarget.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-slate-500 mb-1">Role</p><span className={cn("inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider", ROLE_COLORS[viewTarget.role] || 'bg-slate-100 text-slate-600')}>{ROLE_LABELS[viewTarget.role] || viewTarget.role}</span></div>
                <div><p className="text-xs text-slate-500 mb-1">Status</p><span className={cn("inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold", (viewTarget.status || 'Active') === 'Active' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700")}>{viewTarget.status || 'Active'}</span></div>
                <div><p className="text-xs text-slate-500 mb-1">School</p><p className="text-sm font-medium text-slate-700 dark:text-slate-300">{viewTarget.schoolName || 'N/A'}</p></div>
                <div><p className="text-xs text-slate-500 mb-1">Phone</p><p className="text-sm font-medium text-slate-700 dark:text-slate-300">{viewTarget.phone || 'N/A'}</p></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Confirm Delete</h2>
            <p className="text-sm text-slate-500 mb-6">Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}