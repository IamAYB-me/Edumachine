import React, { useState, useMemo } from 'react';
import { ScrollText, Search, Trash2, Filter, Clock, Users, AlertTriangle, Download, X } from 'lucide-react';
import { cn } from '@/utils';
import { KPICard } from '@/components/ui/KPICard';
import { useDataStore, type ActivityLog, type ActivityAction } from '@/store/useDataStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';

const ACTION_COLORS: Record<ActivityAction, string> = {
  CREATE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  UPDATE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  DELETE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  LOGIN: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  LOGOUT: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  EXPORT: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  IMPORT: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

const MODULE_OPTIONS = [
  'auth', 'students', 'teachers', 'parents', 'staff', 'classes', 'fees',
  'exams', 'attendance', 'admissions', 'settings', 'notices', 'assignments',
  'hostel', 'transport', 'library', 'hr', 'accountant', 'payroll', 'delegatedAccess',
];

const ACTION_OPTIONS: ActivityAction[] = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'IMPORT'];

function getLogTime(log: ActivityLog): number {
  const v = log.createdAt;
  if (typeof v === 'string') {
    const t = new Date(v).getTime();
    return Number.isNaN(t) ? 0 : t;
  }
  if (v && typeof v === 'object') {
    const obj = v as { toMillis?: () => number; seconds?: number };
    if (typeof obj.toMillis === 'function') return obj.toMillis();
    if (typeof obj.seconds === 'number') return obj.seconds * 1000;
  }
  return 0;
}

function formatDate(ts: number): string {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' +
    d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
}

export default function AdminActivityLogs() {
  const { activityLogs, requestLogDeletion, purgeOldLogs } = useDataStore();
  const user = useAuthStore((state) => state.user);
  const showToast = useToastStore((state) => state.showToast);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterModule, setFilterModule] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredLogs = useMemo(() => {
    let result = [...activityLogs];

    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      result = result.filter(
        (log) =>
          log.userName.toLowerCase().includes(t) ||
          log.description.toLowerCase().includes(t) ||
          log.module.toLowerCase().includes(t) ||
          (log.targetName && log.targetName.toLowerCase().includes(t)),
      );
    }

    if (filterRole) {
      result = result.filter((log) => log.userRole === filterRole);
    }

    if (filterAction) {
      result = result.filter((log) => log.action === filterAction);
    }

    if (filterModule) {
      result = result.filter((log) => log.module === filterModule);
    }

    if (dateFrom) {
      const from = new Date(dateFrom + 'T00:00:00').getTime();
      result = result.filter((log) => getLogTime(log) >= from);
    }

    if (dateTo) {
      const to = new Date(dateTo + 'T23:59:59').getTime();
      result = result.filter((log) => getLogTime(log) <= to);
    }

    return result.sort((a, b) => getLogTime(b) - getLogTime(a));
  }, [activityLogs, searchTerm, filterRole, filterAction, filterModule, dateFrom, dateTo]);

  const stats = {
    total: activityLogs.length,
    today: activityLogs.filter((log) => {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      return getLogTime(log) >= todayStart;
    }).length,
    pendingDeletions: activityLogs.filter((log) => log.deletionRequested && !log.deletionApproved && !log.deletionRejected).length,
    uniqueUsers: new Set(activityLogs.map((log) => log.userId)).size,
  };

  const handleRequestDeletion = (log: ActivityLog) => {
    if (log.deletionRequested) return;
    requestLogDeletion(log.id);
    showToast({ title: 'Deletion request sent to Super Admin', variant: 'success' });
  };

  const handlePurge = async () => {
    if (!confirm('This will permanently delete all activity logs older than 12 months. Continue?')) return;
    const count = await purgeOldLogs();
    showToast({ title: `Purged ${count} old log(s)`, variant: 'info' });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterRole('');
    setFilterAction('');
    setFilterModule('');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters = filterRole || filterAction || filterModule || dateFrom || dateTo;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Activity Logs</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Audit trail of all actions across the portal.</p>
        </div>
        <button onClick={handlePurge}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-amber-900/20">
          <Trash2 className="w-4 h-4" />Purge Old Logs (12m+)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Logs" value={stats.total} icon={ScrollText} iconBgClass="bg-blue-50 dark:bg-blue-900/20" iconColorClass="text-blue-600 dark:text-blue-400" />
        <KPICard title="Today's Activity" value={stats.today} icon={Clock} iconBgClass="bg-emerald-50 dark:bg-emerald-900/20" iconColorClass="text-emerald-600 dark:text-emerald-400" />
        <KPICard title="Pending Deletions" value={stats.pendingDeletions} icon={AlertTriangle} iconBgClass="bg-rose-50 dark:bg-rose-900/20" iconColorClass="text-rose-600 dark:text-rose-400" />
        <KPICard title="Unique Users" value={stats.uniqueUsers} icon={Users} iconBgClass="bg-indigo-50 dark:bg-indigo-900/20" iconColorClass="text-indigo-600 dark:text-indigo-400" />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search logs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-all dark:text-white" />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowFilters(!showFilters)}
              className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border",
                showFilters ? "bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-400" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300")}>
              <Filter className="w-4 h-4" />Filters{hasActiveFilters && ` (${[filterRole, filterAction, filterModule, dateFrom, dateTo].filter(Boolean).length})`}
            </button>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                <X className="w-3 h-3" />Clear
              </button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white">
              <option value="">All Roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="ADMIN">Admin</option>
              <option value="TEACHER">Teacher</option>
              <option value="STUDENT">Student</option>
              <option value="PARENT">Parent</option>
              <option value="HR">HR</option>
              <option value="WARDEN">Warden</option>
              <option value="ACCOUNTANT">Accountant</option>
              <option value="TRANSPORT">Transport</option>
              <option value="LIBRARIAN">Librarian</option>
            </select>
            <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white">
              <option value="">All Actions</option>
              {ACTION_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            <select value={filterModule} onChange={(e) => setFilterModule(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white">
              <option value="">All Modules</option>
              {MODULE_OPTIONS.map((m) => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
            </select>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} placeholder="From"
              className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white" />
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} placeholder="To"
              className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white" />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="text-left p-4 font-medium text-slate-500 dark:text-slate-400">Timestamp</th>
                <th className="text-left p-4 font-medium text-slate-500 dark:text-slate-400">User</th>
                <th className="text-left p-4 font-medium text-slate-500 dark:text-slate-400">Action</th>
                <th className="text-left p-4 font-medium text-slate-500 dark:text-slate-400">Module</th>
                <th className="text-left p-4 font-medium text-slate-500 dark:text-slate-400">Description</th>
                <th className="text-left p-4 font-medium text-slate-500 dark:text-slate-400">Status</th>
                <th className="text-right p-4 font-medium text-slate-500 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400 dark:text-slate-500">
                    No activity logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.slice(0, 200).map((log) => {
                  const pendingDeletion = log.deletionRequested && !log.deletionApproved && !log.deletionRejected;
                  const deletionRejected = log.deletionRejected;
                  return (
                    <tr key={log.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {formatDate(getLogTime(log))}
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-slate-900 dark:text-white">{log.userName}</div>
                        <div className="text-xs text-slate-400">{(log.userRole || 'System').replace('_', ' ')}</div>
                      </td>
                      <td className="p-4">
                        <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold", ACTION_COLORS[log.action])}>
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300 capitalize">{log.module}</td>
                      <td className="p-4 text-slate-700 dark:text-slate-200 max-w-xs truncate">{log.description}</td>
                      <td className="p-4">
                        {pendingDeletion && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                            Pending Deletion
                          </span>
                        )}
                        {deletionRejected && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                            Deletion Rejected
                          </span>
                        )}
                        {!pendingDeletion && !deletionRejected && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {!log.deletionRequested && !log.deletionApproved && (
                          <button onClick={() => handleRequestDeletion(log)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />Request Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filteredLogs.length > 200 && (
          <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
            Showing 200 of {filteredLogs.length} logs. Use filters to narrow results.
          </div>
        )}
      </div>
    </div>
  );
}
