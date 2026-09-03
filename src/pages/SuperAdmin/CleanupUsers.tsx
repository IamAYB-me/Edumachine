import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckSquare, Loader2, Mail, Search, Trash2, UserCog, Flame } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/config/firebase';
import { cn } from '@/utils';
import { useDataStore, PlatformUser } from '@/store/useDataStore';
import { useToastStore } from '@/store/useToastStore';
import { KPICard } from '@/components/ui/KPICard';

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  ADMIN: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  TEACHER: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  STUDENT: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  PARENT: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  STAFF: 'bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300',
};

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'School Admin',
  TEACHER: 'Teacher',
  STUDENT: 'Student',
  PARENT: 'Parent',
  STAFF: 'Staff',
};

function isLikelyTest(u: PlatformUser): boolean {
  const hay = `${u.email || ''} ${u.name || ''}`.toLowerCase();
  return (
    hay.includes('test') ||
    hay.includes('testing') ||
    hay.includes('demo') ||
    hay.includes('sample') ||
    hay.includes('test@') ||
    /test\d*@/.test(u.email || '')
  );
}

export default function CleanupUsers() {
  const { platformUsers } = useDataStore();
  const showToast = useToastStore((s) => s.showToast);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [testOnly, setTestOnly] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectAllOnFilter, setSelectAllOnFilter] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [resultLog, setResultLog] = useState<string[]>([]);

  const roleOptions = useMemo(() => {
    const set = new Set(platformUsers.map((u) => u.role));
    return Array.from(set).sort();
  }, [platformUsers]);

  const filtered = useMemo(() => {
    return platformUsers.filter((u) => {
      if (roleFilter !== 'All' && u.role !== roleFilter) return false;
      if (testOnly && !isLikelyTest(u)) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const match =
          u.email?.toLowerCase().includes(q) ||
          u.name?.toLowerCase().includes(q) ||
          u.schoolName?.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [platformUsers, roleFilter, testOnly, searchTerm]);

  const protectedUids = useMemo(() => {
    const set = new Set<string>();
    platformUsers
      .filter((u) => u.role === 'SUPER_ADMIN')
      .forEach((u) => set.add(u.id || u.uid || ''));
    return set;
  }, [platformUsers]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectAllOnFilter) {
      setSelected(new Set());
      setSelectAllOnFilter(false);
      return;
    }
    const next = new Set<string>();
    filtered.forEach((u) => {
      const uidKey = u.id || u.uid || '';
      if (!protectedUids.has(uidKey)) next.add(uidKey);
    });
    setSelected(next);
    setSelectAllOnFilter(true);
  };

  const doDelete = async () => {
    if (selected.size === 0) return;
    setDeleting(true);
    setResultLog([]);
    const deleteAccount = httpsCallable(functions, 'deleteUserAccount');
    const uidMap = new Map(platformUsers.map((u) => [(u.id || u.uid || ''), u]));

    const logs: string[] = [];
    let ok = 0;
    let failed = 0;
    for (const key of Array.from(selected)) {
      const user = uidMap.get(key);
      const email = user?.email || '';
      try {
        const res = await deleteAccount({ uid: key, email });
        const result = res.data as { success: boolean; deleted: string[]; errors: string[] };
        if (result.success) {
          ok++;
          logs.push(`Deleted ${email}: ${result.deleted.length} record(s)`);
        } else {
          failed++;
          logs.push(`Partial delete for ${email}: ${result.errors.join(', ')}`);
        }
      } catch (err: any) {
        failed++;
        logs.push(`Failed ${email}: ${err?.message || err}`);
      }
    }
    setResultLog(logs);
    setSelected(new Set());
    setSelectAllOnFilter(false);
    setDeleting(false);
    setConfirmOpen(false);
    showToast({
      title: 'Cleanup finished',
      description: `${ok} deleted, ${failed} failed. See the result log below.`,
      variant: failed ? 'error' : 'success',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Delete Test Users</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          List and bulk-delete test / unwanted user accounts. This permanently removes the login, profile,
          student/teacher/parent/staff record, admission applications and fee records.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KPICard title="Total Users" value={platformUsers.length} icon={UserCog} />
        <KPICard title="Filtered" value={filtered.length} icon={Search} />
        <KPICard title="Selected" value={selected.size} icon={CheckSquare} />
        <KPICard
          title="Likely Test Users"
          value={platformUsers.filter(isLikelyTest).length}
          icon={Flame}
        />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or school..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none"
          >
            <option value="All">All Roles</option>
            {roleOptions.map((r) => (
              <option key={r} value={r}>{ROLE_LABELS[r] || r}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={testOnly}
              onChange={(e) => setTestOnly(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300"
            />
            Test users only
          </label>
        </div>

        {resultLog.length > 0 && (
          <div className="mx-4 mt-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-4 max-h-40 overflow-auto text-xs font-mono space-y-1">
            {resultLog.map((l, i) => (
              <div key={i} className="text-slate-600 dark:text-slate-300">{l}</div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <button
            onClick={toggleSelectAll}
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            <CheckSquare className="w-4 h-4" />
            {selectAllOnFilter ? 'Clear selection' : `Select all (${filtered.length})`}
          </button>
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={selected.size === 0 || deleting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete Selected ({selected.size})
          </button>
        </div>

        <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800/80 text-left text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 w-10"></th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">School</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                    No users match these filters.
                  </td>
                </tr>
              )}
              {filtered.map((u) => {
                const key = u.id || u.uid || '';
                const isProtected = protectedUids.has(key);
                const checked = selected.has(key);
                return (
                  <tr key={key} className={cn('hover:bg-slate-50 dark:hover:bg-slate-800/40', isProtected && 'opacity-50')}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={isProtected}
                        onChange={() => toggle(key)}
                        className="w-4 h-4 rounded border-slate-300 disabled:opacity-40"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs shrink-0">
                          {(u.name || u.email || '?').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{u.name || '—'}</p>
                          {isLikelyTest(u) && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                              <Flame className="w-3 h-3" /> likely test
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <Mail className="w-3.5 h-3.5" /> {u.email}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2.5 py-1 rounded-lg text-[11px] font-bold', ROLE_COLORS[u.role] || 'bg-slate-100 text-slate-600')}>
                        {ROLE_LABELS[u.role] || u.roleLabel || u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{u.schoolName || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs font-semibold', (u.status || 'Active') === 'Inactive' ? 'text-rose-500' : 'text-emerald-600')}>
                        {u.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">Delete {selected.size} user(s)?</h2>
                <p className="text-sm text-slate-500">This cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              Permanently removes each account's login, portal profile, student/teacher/parent/staff record,
              admission applications and fee records. Super Admin accounts are protected.
            </p>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 max-h-40 overflow-auto text-xs text-slate-600 dark:text-slate-300 font-mono">
              {Array.from(selected).map((k) => {
                const u = platformUsers.find((x) => (x.id || x.uid) === k);
                return <div key={k}>• {u?.email || k}</div>;
              })}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setConfirmOpen(false)}
                disabled={deleting}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-300 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={doDelete}
                disabled={deleting}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold disabled:opacity-50"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {deleting ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
