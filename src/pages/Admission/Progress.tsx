import React from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle, Clock, XCircle, GraduationCap, FileText, CreditCard,
  User, Calendar, ArrowRight, ClipboardList,
} from 'lucide-react';
import { cn } from '@/utils';
import { useAuthStore } from '@/store/useAuthStore';
import { useDataStore } from '@/store/useDataStore';
import { useCurrency } from '@/hooks/useCurrency';

const TIMELINE = [
  { key: 'Pending', label: 'Application Submitted', desc: 'Your application was received and payment confirmed.' },
  { key: 'Under Review', label: 'Under Review', desc: 'The admissions office is reviewing your application.' },
  { key: 'Approved', label: 'Approved', desc: 'Your application has been approved by the admissions office.' },
  { key: 'Admitted', label: 'Admitted', desc: 'Congratulations! You have been admitted.' },
];

export default function AdmissionProgress() {
  const user = useAuthStore((s) => s.user);
  const applications = useDataStore((s) => s.admissionApplications);
  const { format } = useCurrency();

  const application = applications.find(
    (a) => a.email && user?.email && a.email.toLowerCase() === user.email.toLowerCase(),
  );

  if (!application) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 sm:p-10">
            <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-6">
              <ClipboardList className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">No Application Found</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
              We could not find an admission application linked to <strong>{user?.email}</strong>. If you have not submitted one yet, you can start a new application below.
            </p>
            <Link
              to="/admissions/apply"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all"
            >
              Apply Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentIndex = TIMELINE.findIndex((s) => s.key === application.applicationStatus);
  const isRejected = application.applicationStatus === 'Rejected';
  const completedThrough = isRejected ? -1 : Math.max(currentIndex, 0);

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      'Under Review': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      Approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      Admitted: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      Rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    };
    return colors[status] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  };

  const DetailRow = ({ label, value }: { label: string; value?: string | number | null }) => (
    <div className="flex justify-between gap-4 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</span>
      <span className="text-sm font-medium text-slate-900 dark:text-white text-right">{value || '—'}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">My Application</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">
          Track the status of your admission application.
        </p>
      </div>

      {isRejected ? (
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-2xl p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0">
            <XCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-rose-900 dark:text-rose-300">Application Not Successful</h3>
            <p className="text-sm text-rose-700 dark:text-rose-400 mt-1 leading-relaxed">
              Unfortunately, your admission application ({application.applicationFormNumber}) was not accepted. Please contact the admissions office for more information.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/30">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{application.surname} {application.firstName}</p>
                <p className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{application.applicationFormNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold", statusBadge(application.applicationStatus))}>
                {application.applicationStatus}
              </span>
              <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold",
                application.paymentStatus === 'Paid'
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              )}>
                Payment: {application.paymentStatus}
              </span>
            </div>
          </div>

          {/* Timeline */}
          <div className="px-6 py-6">
            {TIMELINE.map((step, i) => {
              const isDone = i < completedThrough;
              const isCurrent = i === currentIndex;
              const isLast = i === TIMELINE.length - 1;
              return (
                <div key={step.key} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all",
                      isDone ? "bg-emerald-500 text-white" :
                      isCurrent ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30" :
                      "bg-slate-200 dark:bg-slate-700 text-slate-400"
                    )}>
                      {isDone ? <CheckCircle className="w-4 h-4" /> : isCurrent ? <Clock className="w-4 h-4" /> : <span className="text-xs font-bold">{i + 1}</span>}
                    </div>
                    {!isLast && (
                      <div className={cn("w-0.5 flex-1 my-1", i < currentIndex ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700")} />
                    )}
                  </div>
                  <div className="pb-6 flex-1">
                    <p className={cn(
                      "text-sm font-bold",
                      isDone ? "text-slate-900 dark:text-white" :
                      isCurrent ? "text-blue-700 dark:text-blue-300" :
                      "text-slate-400 dark:text-slate-500"
                    )}>
                      {step.label}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{step.desc}</p>
                    {isCurrent && (
                      <span className="inline-flex mt-2 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                        Current stage
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Application Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" /> Applicant Information
          </h3>
          <DetailRow label="Full Name" value={`${application.surname} ${application.firstName} ${application.middleName || ''}`} />
          <DetailRow label="Email" value={application.email} />
          <DetailRow label="Phone" value={application.phone} />
          <DetailRow label="Date of Birth" value={application.dateOfBirth} />
          <DetailRow label="Gender" value={application.gender} />
          <DetailRow label="State of Origin" value={application.stateOfOrigin} />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" /> Application Details
          </h3>
          <DetailRow label="Application No." value={application.applicationFormNumber} />
          <DetailRow label="Course of Study" value={application.courseOfStudy} />
          <DetailRow label="1st Choice" value={application.firstChoiceCourse} />
          <DetailRow label="2nd Choice" value={application.secondChoiceCourse} />
          <DetailRow label="Sponsor" value={application.sponsorFullName} />
          <DetailRow label="Submitted" value={application.submittedAt} />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 lg:col-span-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-600" /> Payment Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Processing Fee</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{format(application.admissionFee)}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Status</p>
              <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold",
                application.paymentStatus === 'Paid'
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              )}>{application.paymentStatus}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Submitted
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{application.submittedAt}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
