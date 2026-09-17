import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Users, ClipboardList, Clock, CheckCircle, AlertCircle, GraduationCap } from 'lucide-react';
import { KPICard } from '@/components/ui/KPICard';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { StaggerContainer, StaggerItem } from '@/components/ui/motion';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '@/store/useDataStore';
import { useAuthStore } from '@/store/useAuthStore';
import { resolveSchoolProfile, getPortalLevelLabels } from '@/utils/schoolProfile';

export default function RegistrarDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const schools = useDataStore((state) => state.schools);
  const { admissionApplications, students } = useDataStore();
  const schoolProfile = resolveSchoolProfile(user, schools);
  const labels = getPortalLevelLabels(schoolProfile.portalLevel);

  const stats = useMemo(() => ({
    totalApplications: admissionApplications.length,
    pendingReview: admissionApplications.filter((a) => a.applicationStatus === 'Pending').length,
    approved: admissionApplications.filter((a) => a.applicationStatus === 'Approved').length,
    admitted: admissionApplications.filter((a) => a.applicationStatus === 'Admitted').length,
    totalStudents: students.length,
    activeStudents: students.filter((s) => s.status === 'Active').length,
    rejected: admissionApplications.filter((a) => a.applicationStatus === 'Rejected').length,
  }), [admissionApplications, students]);

  const recentApplications = useMemo(
    () =>
      admissionApplications
        .slice()
        .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
        .slice(0, 6),
    [admissionApplications],
  );

  const statusBadge: Record<string, string> = {
    Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'Under Review': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    Admitted: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    Rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back, Registrar</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Manage {labels.learnerPlural.toLowerCase()} admissions and student records.
        </p>
      </motion.div>

      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StaggerItem>
          <KPICard title="Total Applications" value={String(stats.totalApplications)} icon={ClipboardList} iconBgClass="bg-blue-50 dark:bg-blue-900/20" iconColorClass="text-blue-600 dark:text-blue-400" delay={0} />
        </StaggerItem>
        <StaggerItem>
          <KPICard title="Pending Review" value={String(stats.pendingReview)} icon={Clock} iconBgClass="bg-amber-50 dark:bg-amber-900/20" iconColorClass="text-amber-600 dark:text-amber-400" delay={0.08} />
        </StaggerItem>
        <StaggerItem>
          <KPICard title="Admitted" value={String(stats.admitted)} icon={UserPlus} iconBgClass="bg-emerald-50 dark:bg-emerald-900/20" iconColorClass="text-emerald-600 dark:text-emerald-400" delay={0.16} />
        </StaggerItem>
        <StaggerItem>
          <KPICard title={`Active ${labels.learnerPlural}`} value={String(stats.activeStudents)} icon={Users} iconBgClass="bg-violet-50 dark:bg-violet-900/20" iconColorClass="text-violet-600 dark:text-violet-400" delay={0.24} />
        </StaggerItem>
      </StaggerContainer>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnimatedCard delay={0.1} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Applications</h3>
            <button
              onClick={() => navigate('/registrar/admissions')}
              className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline"
            >
              View all →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 px-4">Applicant</th>
                  <th className="pb-3 px-4">Form No.</th>
                  <th className="pb-3 px-4">{labels.structureSingular}</th>
                  <th className="pb-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentApplications.map((app) => (
                  <tr
                    key={app.id}
                    className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    onClick={() => navigate('/registrar/admissions')}
                  >
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-900 dark:text-white">{app.surname} {app.firstName}</p>
                      <p className="text-[10px] text-slate-500">{app.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 px-2 py-1 rounded-md">
                        {app.applicationFormNumber || '—'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">{app.courseOfStudy || '—'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-bold ${statusBadge[app.applicationStatus] || ''}`}>
                        {app.applicationStatus}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentApplications.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400">
                      <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-20" />
                      <p className="text-sm font-medium">No applications yet</p>
                      <p className="text-xs text-slate-400 mt-1">Applications will appear here once {labels.learnerPlural.toLowerCase()} submit.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </AnimatedCard>

        <div className="space-y-6">
          <AnimatedCard delay={0.2} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/registrar/admissions')}
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Review Applications</p>
                  <p className="text-[11px] text-slate-500">{stats.pendingReview} pending</p>
                </div>
              </button>
              <button
                onClick={() => navigate('/registrar/students')}
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{labels.learnerPlural} Records</p>
                  <p className="text-[11px] text-slate-500">{stats.totalStudents} enrolled</p>
                </div>
              </button>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={0.3} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Summary</h3>
            <div className="space-y-3">
              {[
                { label: 'Pending Review', value: stats.pendingReview, icon: Clock, color: 'text-amber-600' },
                { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'text-emerald-600' },
                { label: 'Admitted', value: stats.admitted, icon: UserPlus, color: 'text-violet-600' },
                { label: 'Rejected', value: stats.rejected, icon: AlertCircle, color: 'text-rose-600' },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <row.icon className={`w-4 h-4 ${row.color}`} />
                    <span className="text-sm text-slate-600 dark:text-slate-400">{row.label}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{row.value}</span>
                </div>
              ))}
            </div>
          </AnimatedCard>
        </div>
      </div>
    </div>
  );
}
