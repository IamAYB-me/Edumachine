import React, { useState, useMemo } from 'react';
import {
  Search, Eye, CheckCircle, XCircle, Clock, UserCheck, Trash2,
  X, GraduationCap, ChevronDown,
} from 'lucide-react';
import { cn } from '@/utils';
import { useDataStore, AdmissionApplication } from '@/store/useDataStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';
import { resolveSchoolProfile, getPortalLevelLabels } from '@/utils/schoolProfile';
import { friendlyErrorMessage } from '@/utils/errors';
import { promoteApplicantToStudent } from '@/services/authService';
import { buildStudentPayloadFromApplication } from '@/utils/applicantMapper';
import { KPICard } from '@/components/ui/KPICard';
import CourseRegistrationToggle from '@/components/ui/CourseRegistrationToggle';
import Pagination from '@/components/ui/Pagination';
import AllocateAdmissionNumbersButton from '@/components/ui/AllocateAdmissionNumbersButton';
import { usePagination } from '@/hooks/usePagination';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/config/firebase';

export default function RegistrarAdmissions() {
  const { admissionApplications, updateAdmissionApplication, deleteAdmissionApplication, addStudent, schools, platformUsers, updatePlatformUser } = useDataStore();
  const user = useAuthStore((s) => s.user);
  const showToast = useToastStore((s) => s.showToast);
  const schoolProfile = resolveSchoolProfile(user ?? null, schools);
  const labels = getPortalLevelLabels(schoolProfile.portalLevel);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<AdmissionApplication | null>(null);
  const [admitting, setAdmitting] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const filtered = useMemo(() => {
    let result = admissionApplications;
    if (statusFilter !== 'all') {
      result = result.filter((a) => a.applicationStatus === statusFilter);
    }
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      result = result.filter((a) =>
        `${a.surname} ${a.firstName}`.toLowerCase().includes(t) ||
        a.email.toLowerCase().includes(t) ||
        (a.courseOfStudy || '').toLowerCase().includes(t) ||
        (a.applicationFormNumber || '').toLowerCase().includes(t)
      );
    }
    return result.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }, [admissionApplications, searchTerm, statusFilter]);

  const pages = usePagination(filtered, 10);

  const stats = useMemo(() => ({
    total: admissionApplications.length,
    pending: admissionApplications.filter((a) => a.applicationStatus === 'Pending').length,
    approved: admissionApplications.filter((a) => a.applicationStatus === 'Approved').length,
    admitted: admissionApplications.filter((a) => a.applicationStatus === 'Admitted').length,
  }), [admissionApplications]);

  const statusColors: Record<string, string> = {
    Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'Under Review': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    Admitted: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    Rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  };

  const handleStatusChange = (id: string, status: AdmissionApplication['applicationStatus']) => {
    updateAdmissionApplication(id, {
      applicationStatus: status,
      reviewedAt: new Date().toISOString().split('T')[0],
      reviewedBy: user?.name || 'Registrar',
    });
    showToast({ title: `Application ${status.toLowerCase()}`, variant: status === 'Rejected' ? 'warning' : 'success' });
  };

  const promoteApplicant = async (app: AdmissionApplication, regNo: string, classValue: string, portalLevel: string) => {
    const applicantUser = platformUsers.find(
      (u) => u.email && app.email && u.email.toLowerCase() === app.email.toLowerCase(),
    );
    const applicantUid = applicantUser?.id || applicantUser?.uid;
    if (applicantUid) {
      const res = await promoteApplicantToStudent(applicantUid, {
        name: `${app.surname} ${app.firstName}`,
        email: app.email,
        schoolName: user?.schoolName || schoolProfile.name,
        phone: app.phone,
        portalLevel,
        surname: app.surname,
        firstName: app.firstName,
        middleName: app.middleName,
        regNo,
        class: classValue,
      });
      if (res.success) {
        updatePlatformUser(applicantUid, {
          name: `${app.surname} ${app.firstName}`,
          role: 'STUDENT',
          roleLabel: 'Student',
        });
        return true;
      }
    }
    return false;
  };

  const handleAdmit = async (app: AdmissionApplication) => {
    setAdmitting(true);
    const regNo = 'REG-' + Date.now().toString(36).toUpperCase();
    const classValue = app.courseOfStudy || app.firstChoiceCourse || '';
    const portalLevel = schoolProfile.portalLevel;

    addStudent(
      buildStudentPayloadFromApplication(app, {
        regNo,
        portalLevel,
        dateOfAdmission: new Date().toISOString().split('T')[0],
      }),
    );

    await promoteApplicant(app, regNo, classValue, portalLevel);

    updateAdmissionApplication(app.id, {
      applicationStatus: 'Admitted',
      reviewedAt: new Date().toISOString().split('T')[0],
      reviewedBy: user?.name || 'Registrar',
    });

    showToast({
      title: `${labels.learnerSingular} admitted`,
      description: `${app.surname} ${app.firstName} has been added to the ${labels.learnerPlural.toLowerCase()} directory.`,
      variant: 'success',
    });
    setSelectedApp(null);
    setAdmitting(false);
  };

  const handleDeleteAccount = async (app: AdmissionApplication) => {
    const applicantUser = platformUsers.find(
      (u) => u.email && app.email && u.email.toLowerCase() === app.email.toLowerCase(),
    );
    const uid = applicantUser?.id || applicantUser?.uid;
    if (!confirm(`Permanently delete ${app.surname} ${app.firstName}'s account? This cannot be undone.`)) return;

    setDeletingAccount(true);
    try {
      const deleteAccount = httpsCallable(functions, 'deleteUserAccount');
      const res = await deleteAccount({ uid: uid || '', email: app.email });
      const result = res.data as { success: boolean; deleted: string[]; errors: string[] };
      if (result.success) {
        showToast({ title: 'Account deleted', description: `Removed: ${result.deleted.length} record(s).`, variant: 'success' });
        setSelectedApp(null);
      } else {
        showToast({ title: 'Deletion incomplete', description: result.errors.join(', '), variant: 'warning' });
      }
    } catch (error) {
      showToast({ title: 'Deletion failed', description: friendlyErrorMessage(error, 'Could not delete the account. Please try again.'), variant: 'error' });
    } finally {
      setDeletingAccount(false);
    }
  };

  const DetailRow = ({ label, value }: { label: string; value?: string | number | null }) => (
    <div>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium text-slate-900 dark:text-white">{value || '—'}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Admissions</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">
          Review applications, approve or reject, and process admissions.
        </p>
      </div>

      {/* Admission Number Allocation */}
      <div className="max-w-2xl">
        <AllocateAdmissionNumbersButton />
      </div>

      {/* Registration Controls */}
      <div className="max-w-2xl">
        <CourseRegistrationToggle />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Total Applications" value={stats.total} icon={GraduationCap} iconBgClass="bg-blue-50 dark:bg-blue-900/20" iconColorClass="text-blue-600 dark:text-blue-400" />
        <KPICard title="Pending Review" value={stats.pending} icon={Clock} iconBgClass="bg-amber-50 dark:bg-amber-900/20" iconColorClass="text-amber-600 dark:text-amber-400" />
        <KPICard title="Approved" value={stats.approved} icon={CheckCircle} iconBgClass="bg-emerald-50 dark:bg-emerald-900/20" iconColorClass="text-emerald-600 dark:text-emerald-400" />
        <KPICard title="Admitted" value={stats.admitted} icon={UserCheck} iconBgClass="bg-violet-50 dark:bg-violet-900/20" iconColorClass="text-violet-600 dark:text-violet-400" />
      </div>

      {/* Search & Filter */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, form number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-violet-500 dark:text-white"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-violet-500 dark:text-white appearance-none pr-8"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Admitted">Admitted</option>
              <option value="Rejected">Rejected</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr className="border-b border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Applicant</th>
                <th className="py-3 px-4">Form Number</th>
                <th className="py-3 px-4">{labels.structureSingular}</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
              {pages.slice.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 group transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {app.passportUrl ? (
                        <img src={app.passportUrl} alt="" className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                          <UserCheck className="w-4 h-4 text-slate-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{app.surname} {app.firstName}</p>
                        <p className="text-[10px] text-slate-500">{app.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 px-2 py-1 rounded-md">
                      {app.applicationFormNumber || '—'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">{app.courseOfStudy || '—'}</td>
                  <td className="py-3 px-4">
                    <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold",
                      app.paymentStatus === 'Paid' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    )}>{app.paymentStatus}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold", statusColors[app.applicationStatus] || '')}>
                      {app.applicationStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-500 font-medium">{app.submittedAt}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setSelectedApp(app)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg" title="View Details">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {app.applicationStatus === 'Pending' && (
                        <>
                          <button onClick={() => handleStatusChange(app.id, 'Approved')} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg" title="Approve">
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleStatusChange(app.id, 'Rejected')} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg" title="Reject">
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      <button onClick={() => { deleteAdmissionApplication(app.id); showToast({ title: 'Application deleted', variant: 'info' }); }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="py-16 text-center text-slate-400">
                  <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">No admission applications found.</p>
                  <p className="text-xs text-slate-400 mt-1">Applications will appear here once {labels.learnerPlural.toLowerCase()} submit the form.</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={pages.page} totalPages={pages.totalPages} total={pages.total} start={pages.start} pageSize={pages.pageSize} onPageChange={pages.setPage} />
      </div>

      {/* Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSelectedApp(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl flex flex-col overflow-hidden max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50">
              <div className="flex items-center gap-3">
                {selectedApp.passportUrl ? (
                  <img src={selectedApp.passportUrl} alt="" className="w-11 h-11 rounded-xl object-cover border-2 border-white dark:border-slate-700 shadow" />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">{selectedApp.surname} {selectedApp.firstName}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-xs font-bold text-violet-600 dark:text-violet-400">{selectedApp.applicationFormNumber}</span>
                    <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-bold", statusColors[selectedApp.applicationStatus] || '')}>
                      {selectedApp.applicationStatus}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedApp(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Student Personal Info */}
              <Section title={`${labels.learnerSingular} Information`}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <DetailRow label="Surname" value={selectedApp.surname} />
                  <DetailRow label="First Name" value={selectedApp.firstName} />
                  <DetailRow label="Middle Name" value={selectedApp.middleName} />
                  <DetailRow label="Gender" value={selectedApp.gender} />
                  <DetailRow label="Date of Birth" value={selectedApp.dateOfBirth} />
                  <DetailRow label="Place of Birth" value={selectedApp.placeOfBirth} />
                  <DetailRow label="LGA" value={selectedApp.lga} />
                  <DetailRow label="State of Origin" value={selectedApp.stateOfOrigin} />
                  <DetailRow label="Nationality" value={selectedApp.nationality} />
                  <DetailRow label="Phone" value={selectedApp.phone} />
                  <DetailRow label="Email" value={selectedApp.email} />
                  <DetailRow label="Marital Status" value={selectedApp.maritalStatus} />
                  <DetailRow label={`${labels.structureSingular} Applying For`} value={selectedApp.courseOfStudy} />
                </div>
              </Section>

              {/* Course Choices */}
              <Section title={`${labels.subjectSingular} Choices`}>
                <div className="grid grid-cols-2 gap-4">
                  <DetailRow label="1st Choice" value={selectedApp.firstChoiceCourse} />
                  <DetailRow label="2nd Choice" value={selectedApp.secondChoiceCourse} />
                </div>
              </Section>

              {/* Sponsor */}
              <Section title="Sponsor Information">
                <div className="grid grid-cols-2 gap-4">
                  <DetailRow label="Full Name" value={selectedApp.sponsorFullName} />
                  <DetailRow label="Phone" value={selectedApp.sponsorPhone} />
                  <DetailRow label="Address" value={selectedApp.sponsorAddress} />
                </div>
              </Section>

              {/* Next of Kin */}
              <Section title="Next of Kin">
                <div className="grid grid-cols-2 gap-4">
                  <DetailRow label="Name" value={selectedApp.nextOfKinName} />
                  <DetailRow label="Phone" value={selectedApp.nextOfKinPhone} />
                  <DetailRow label="Relationship" value={selectedApp.nextOfKinRelationship} />
                  <DetailRow label="Address" value={selectedApp.nextOfKinAddress} />
                </div>
              </Section>

              {/* Academic History */}
              <Section title="Academic History — First Sitting">
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <DetailRow label="Reg. Number" value={selectedApp.firstSittingRegNumber} />
                  <DetailRow label="Exam Body" value={selectedApp.firstSittingExamBody} />
                  <DetailRow label="Year" value={selectedApp.firstSittingExamYear} />
                </div>
                {selectedApp.firstSittingSubjects && selectedApp.firstSittingSubjects.length > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 space-y-1">
                    {selectedApp.firstSittingSubjects.map((sg, i) => (
                      <div key={i} className="flex justify-between text-xs py-1 px-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
                        <span className="text-slate-600 dark:text-slate-400">{sg.subject}</span>
                        <span className="font-bold text-slate-900 dark:text-white">{sg.grade}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              {selectedApp.secondSittingSubjects && selectedApp.secondSittingSubjects.length > 0 && (
                <Section title="Academic History — Second Sitting">
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <DetailRow label="Reg. Number" value={selectedApp.secondSittingRegNumber} />
                    <DetailRow label="Exam Body" value={selectedApp.secondSittingExamBody} />
                    <DetailRow label="Year" value={selectedApp.secondSittingExamYear} />
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 space-y-1">
                    {selectedApp.secondSittingSubjects.map((sg, i) => (
                      <div key={i} className="flex justify-between text-xs py-1 px-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
                        <span className="text-slate-600 dark:text-slate-400">{sg.subject}</span>
                        <span className="font-bold text-slate-900 dark:text-white">{sg.grade}</span>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Payment */}
              <Section title="Payment">
                <div className="grid grid-cols-3 gap-4">
                  <DetailRow label="Amount" value={`₦${(selectedApp.admissionFee || 0).toLocaleString()}`} />
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Status</p>
                    <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold",
                      selectedApp.paymentStatus === 'Paid' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    )}>{selectedApp.paymentStatus}</span>
                  </div>
                  {selectedApp.paymentReference && (
                    <DetailRow label="Reference" value={selectedApp.paymentReference} />
                  )}
                </div>
              </Section>

              {/* Actions */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-5 flex gap-3">
                {selectedApp.applicationStatus === 'Pending' && (
                  <>
                    <button onClick={() => { handleStatusChange(selectedApp.id, 'Approved'); setSelectedApp({ ...selectedApp, applicationStatus: 'Approved' }); }}
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                    <button onClick={() => { handleStatusChange(selectedApp.id, 'Rejected'); setSelectedApp(null); }}
                      className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </>
                )}
                {selectedApp.applicationStatus === 'Approved' && selectedApp.paymentStatus === 'Paid' && (
                  <button onClick={() => handleAdmit(selectedApp)} disabled={admitting}
                    className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                    <UserCheck className="w-4 h-4" /> {admitting ? 'Admitting...' : `Admit as ${labels.learnerSingular}`}
                  </button>
                )}
              </div>
              <button onClick={() => handleDeleteAccount(selectedApp)} disabled={deletingAccount}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 mt-3">
                <Trash2 className="w-4 h-4" /> {deletingAccount ? 'Deleting account...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
      <p className="text-[10px] font-bold text-slate-500 uppercase mb-3 tracking-wider">{title}</p>
      {children}
    </div>
  );
}
