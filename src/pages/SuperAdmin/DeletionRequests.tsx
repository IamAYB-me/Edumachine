import React, { useState, useMemo } from 'react';
import { ShieldAlert, CheckCircle, XCircle, Clock, Trash2, Eye, X } from 'lucide-react';
import { cn } from '@/utils';
import { KPICard } from '@/components/ui/KPICard';
import { useDataStore, type ActivityLog } from '@/store/useDataStore';
import { useToastStore } from '@/store/useToastStore';

function formatDate(dateStr?: unknown): string {
  if (!dateStr || typeof dateStr !== 'string') return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' +
    d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
}

export default function SuperAdminDeletionRequests() {
  const { activityLogs, approveLogDeletion, rejectLogDeletion } = useDataStore();
  const showToast = useToastStore((state) => state.showToast);

  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [rejectModalLog, setRejectModalLog] = useState<ActivityLog | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [detailLog, setDetailLog] = useState<ActivityLog | null>(null);

  const pendingRequests = useMemo(
    () => activityLogs.filter((log) => log.deletionRequested && !log.deletionApproved && !log.deletionRejected)
      .sort((a, b) => {
        const tsA = typeof a.deletionRequestedAt === 'string' ? a.deletionRequestedAt : '';
        const tsB = typeof b.deletionRequestedAt === 'string' ? b.deletionRequestedAt : '';
        return tsB.localeCompare(tsA);
      }),
    [activityLogs],
  );

  const historyLogs = useMemo(
    () => activityLogs.filter((log) => log.deletionApproved || log.deletionRejected)
      .sort((a, b) => {
        const tsA = typeof a.deletionApprovedAt === 'string' ? a.deletionApprovedAt : typeof a.deletionRejectedAt === 'string' ? a.deletionRejectedAt : '';
        const tsB = typeof b.deletionApprovedAt === 'string' ? b.deletionApprovedAt : typeof b.deletionRejectedAt === 'string' ? b.deletionRejectedAt : '';
        return tsB.localeCompare(tsA);
      }),
    [activityLogs],
  );

  const stats = {
    pending: pendingRequests.length,
    approvedToday: historyLogs.filter((log) => {
      const ts = typeof log.deletionApprovedAt === 'string' ? log.deletionApprovedAt : '';
      return ts.startsWith(new Date().toISOString().split('T')[0]);
    }).length,
    rejectedToday: historyLogs.filter((log) => {
      const ts = typeof log.deletionRejectedAt === 'string' ? log.deletionRejectedAt : '';
      return ts.startsWith(new Date().toISOString().split('T')[0]);
    }).length,
    totalLogs: activityLogs.length,
  };

  const handleApprove = (log: ActivityLog) => {
    if (!confirm(`Approve deletion of this log entry by ${log.userName}?`)) return;
    approveLogDeletion(log.id);
    showToast({ title: 'Deletion approved — log entry removed', variant: 'success' });
  };

  const handleReject = () => {
    if (!rejectModalLog) return;
    if (!rejectReason.trim()) {
      showToast({ title: 'Please provide a rejection reason', variant: 'error' });
      return;
    }
    rejectLogDeletion(rejectModalLog.id, rejectReason.trim());
    setRejectModalLog(null);
    setRejectReason('');
    showToast({ title: 'Deletion request rejected', variant: 'info' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Deletion Requests</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Review and approve/reject activity log deletion requests from admins.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Pending Requests" value={stats.pending} icon={Clock} iconBgClass="bg-amber-50 dark:bg-amber-900/20" iconColorClass="text-amber-600 dark:text-amber-400" />
        <KPICard title="Approved Today" value={stats.approvedToday} icon={CheckCircle} iconBgClass="bg-emerald-50 dark:bg-emerald-900/20" iconColorClass="text-emerald-600 dark:text-emerald-400" />
        <KPICard title="Rejected Today" value={stats.rejectedToday} icon={XCircle} iconBgClass="bg-red-50 dark:bg-red-900/20" iconColorClass="text-red-600 dark:text-red-400" />
        <KPICard title="Total Logs" value={stats.totalLogs} icon={ShieldAlert} iconBgClass="bg-blue-50 dark:bg-blue-900/20" iconColorClass="text-blue-600 dark:text-blue-400" />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button onClick={() => setActiveTab('pending')}
            className={cn("flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2",
              activeTab === 'pending' ? "border-amber-500 text-amber-600 dark:text-amber-400" : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400")}>
            <Clock className="w-4 h-4" />Pending ({pendingRequests.length})
          </button>
          <button onClick={() => setActiveTab('history')}
            className={cn("flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2",
              activeTab === 'history' ? "border-blue-500 text-blue-600 dark:text-blue-400" : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400")}>
            <Eye className="w-4 h-4" />History ({historyLogs.length})
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="text-left p-4 font-medium text-slate-500 dark:text-slate-400">Requested By</th>
                <th className="text-left p-4 font-medium text-slate-500 dark:text-slate-400">Log Details</th>
                <th className="text-left p-4 font-medium text-slate-500 dark:text-slate-400">Requested At</th>
                {activeTab === 'history' && <th className="text-left p-4 font-medium text-slate-500 dark:text-slate-400">Outcome</th>}
                <th className="text-right p-4 font-medium text-slate-500 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(activeTab === 'pending' ? pendingRequests : historyLogs).length === 0 ? (
                <tr>
                  <td colSpan={activeTab === 'history' ? 5 : 4} className="p-12 text-center text-slate-400 dark:text-slate-500">
                    {activeTab === 'pending' ? 'No pending deletion requests.' : 'No deletion history yet.'}
                  </td>
                </tr>
              ) : (
                (activeTab === 'pending' ? pendingRequests : historyLogs).map((log) => (
                  <tr key={log.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-slate-900 dark:text-white">{log.deletionRequestedByName}</div>
                      <div className="text-xs text-slate-400">{(log.userRole || 'System').replace('_', ' ')}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-700 dark:text-slate-200 max-w-sm truncate">{log.description}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        <span className="capitalize">{log.module}</span> · {log.action} · {log.targetName || log.targetId || '—'}
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {formatDate(log.deletionRequestedAt)}
                    </td>
                    {activeTab === 'history' && (
                      <td className="p-4">
                        {log.deletionApproved ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Approved</span>
                        ) : log.deletionRejected ? (
                          <div>
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Rejected</span>
                            {log.deletionRejectionReason && (
                              <p className="text-xs text-slate-400 mt-1 max-w-xs truncate">{log.deletionRejectionReason}</p>
                            )}
                          </div>
                        ) : null}
                      </td>
                    )}
                    <td className="p-4 text-right">
                      {activeTab === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleApprove(log)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20 rounded-lg transition-colors">
                            <CheckCircle className="w-3.5 h-3.5" />Approve
                          </button>
                          <button onClick={() => { setRejectModalLog(log); setRejectReason(''); }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                            <XCircle className="w-3.5 h-3.5" />Reject
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setDetailLog(log)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-700 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 rounded-lg transition-colors">
                          <Eye className="w-3.5 h-3.5" />View
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModalLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Reject Deletion Request</h2>
              <button onClick={() => setRejectModalLog(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm">
                <p className="text-slate-500 dark:text-slate-400">Requested by <span className="font-medium text-slate-900 dark:text-white">{rejectModalLog.deletionRequestedByName}</span></p>
                <p className="text-slate-700 dark:text-slate-200 mt-1">{rejectModalLog.description}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Rejection Reason *</label>
                <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} placeholder="Provide a reason for rejecting this deletion request..."
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-all dark:text-white resize-none" />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t border-slate-200 dark:border-slate-700">
              <button onClick={() => setRejectModalLog(null)} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                Cancel
              </button>
              <button onClick={handleReject} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Log Details</h2>
              <button onClick={() => setDetailLog(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">User</span><span className="font-medium text-slate-900 dark:text-white">{detailLog.userName}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Role</span><span className="font-medium text-slate-900 dark:text-white">{(detailLog.userRole || 'System').replace('_', ' ')}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Action</span><span className="font-medium text-slate-900 dark:text-white">{detailLog.action}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Module</span><span className="font-medium text-slate-900 dark:text-white capitalize">{detailLog.module}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Target</span><span className="font-medium text-slate-900 dark:text-white">{detailLog.targetName || detailLog.targetId || '—'}</span></div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Description</span>
                <p className="mt-1 text-slate-700 dark:text-slate-200">{detailLog.description}</p>
              </div>
              <div className="flex justify-between"><span className="text-slate-500">Requested By</span><span className="font-medium text-slate-900 dark:text-white">{detailLog.deletionRequestedByName}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Requested At</span><span className="font-medium text-slate-900 dark:text-white">{formatDate(detailLog.deletionRequestedAt)}</span></div>
              {detailLog.deletionApproved && (
                <div className="flex justify-between"><span className="text-slate-500">Approved At</span><span className="font-medium text-emerald-600">{formatDate(detailLog.deletionApprovedAt)}</span></div>
              )}
              {detailLog.deletionRejected && (
                <>
                  <div className="flex justify-between"><span className="text-slate-500">Rejected At</span><span className="font-medium text-red-600">{formatDate(detailLog.deletionRejectedAt)}</span></div>
                  {detailLog.deletionRejectionReason && (
                    <div><span className="text-slate-500">Reason</span><p className="mt-1 text-red-600">{detailLog.deletionRejectionReason}</p></div>
                  )}
                </>
              )}
            </div>
            <div className="flex justify-end p-5 border-t border-slate-200 dark:border-slate-700">
              <button onClick={() => setDetailLog(null)} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
