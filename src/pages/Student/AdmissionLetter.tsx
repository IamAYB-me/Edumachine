import React, { useMemo, useState } from 'react';
import { Printer, FileText, Lock, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useDataStore } from '@/store/useDataStore';
import { resolveSchoolProfile } from '@/utils/schoolProfile';
import { checkFeeGate, filterFeeRecordsForStudent } from '@/utils/feeGating';
import { getDocumentsWhere } from '@/services/firestoreService';
import type { AdmissionApplication } from '@/store/useDataStore';
import {
  buildAdmissionLetterHtml,
  openAdmissionLetterWindow,
  type AdmissionLetterData,
} from '@/components/admission/AdmissionLetter';

export default function StudentAdmissionLetter() {
  const user = useAuthStore((s) => s.user);
  const { students, schools, feeStructures, feeRecords } = useDataStore();
  const schoolProfile = resolveSchoolProfile(user, schools);

  const [directApplication, setDirectApplication] = useState<AdmissionApplication | null>(null);
  const [loaded, setLoaded] = useState(false);

  React.useEffect(() => {
    if (!user?.email) return;
    let cancelled = false;
    getDocumentsWhere('admissionApplications', 'email', '==', user.email)
      .then((rows) => {
        if (cancelled) return;
        setDirectApplication((rows[0] as AdmissionApplication) || null);
      })
      .catch(() => {
        if (cancelled) return;
        setDirectApplication(null);
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.email]);

  const application = directApplication;

  const myStudent = useMemo(
    () =>
      students.find((s) => s.id === user?.id) ||
      students.find((s) => s.email === user?.email),
    [students, user?.id, user?.email],
  );

  const isAdmitted = application?.applicationStatus === 'Admitted';

  const myFeeRecords = useMemo(
    () => filterFeeRecordsForStudent(feeRecords, [
      user?.id,
      user?.email,
      myStudent?.id,
      myStudent?.regNo,
      application?.email,
    ]),
    [feeRecords, user?.id, user?.email, myStudent?.id, myStudent?.regNo, application?.email],
  );

  const admissionLetterGate = useMemo(
    () => checkFeeGate(feeStructures, myFeeRecords, application?.courseOfStudy, 'admission_letter', myStudent),
    [feeStructures, myFeeRecords, application?.courseOfStudy, myStudent],
  );

  const acceptancePaid = admissionLetterGate?.isAllowed ?? false;
  const admissionLocked = !!admissionLetterGate && !admissionLetterGate.isAllowed;

  const formatLongDate = (date: Date) =>
    date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const letterData = useMemo<AdmissionLetterData | null>(() => {
    if (!application || !myStudent) return null;
    const fullName = `${application.surname} ${application.firstName} ${application.middleName || ''}`.trim();
    const yearShort = new Date().getFullYear();
    const academicSession = `${yearShort}/${yearShort + 1}`;

    const ref = application.applicationFormNumber || application.id || `${user?.email || ''}`;
    let hash = 0;
    for (let i = 0; i < ref.length; i += 1) {
      hash = ((hash << 5) - hash + ref.charCodeAt(i)) | 0;
    }
    const verificationCode = (Math.abs(hash) >>> 0).toString(16).toUpperCase().padStart(12, '0').slice(0, 12);

    const matricNumber =
      myStudent?.matricNumber ||
      myStudent?.admissionNumber ||
      myStudent?.regNo ||
      `BRC/CHW/${yearShort}/${String(ref).replace(/[^0-9]/g, '').slice(-3) || '001'}`;

    return {
      documentType: 'ORIGINAL',
      college: {
        name: schoolProfile.name,
        acronym: schoolProfile.code || 'BROCHEST',
        location: 'IKARE-AKOKO, ONDO STATE, NIGERIA',
        address: 'Ikare-Akoko, Ondo State, Nigeria',
        logo: schoolProfile.logoUrl,
        registrarName: schoolProfile.principalSignatoryName || 'Mrs. T.B. ATANSUYI',
        registrarCredentials: 'B.Sc., MSc., PhD (in View)',
      },
      student: {
        fullName,
        firstName: application.firstName,
        lastName: application.surname,
        matricNumber,
        passportPhoto: myStudent?.passportUrl || application.passportUrl,
      },
      admission: {
        applicationReference: application.applicationFormNumber || application.id,
        programme: application.courseOfStudy || application.firstChoiceCourse || '',
        academicSession,
        level: '100',
        department: application.courseOfStudy || application.firstChoiceCourse || '',
        admissionDate: formatLongDate(new Date()),
        resumptionDate: formatLongDate(new Date(`${yearShort + 1}-01-12`)),
        verificationCode,
        status: 'ADMITTED',
        acceptanceFeeStatus: 'PAID / CLEARED',
      },
    };
  }, [application, myStudent, user?.email, schoolProfile]);

  const [previewOpen, setPreviewOpen] = useState(false);

  if (!loaded) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading your admission details...</p>
        </div>
      </div>
    );
  }

  if (!application || !myStudent || !isAdmitted || admissionLocked) {
    const awaitingReview = !application || !myStudent || !isAdmitted;
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Admission Letter</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">
              Official admission document for BROCHEST.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-10 sm:p-14 text-center">
          <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
            {awaitingReview ? 'Admission Letter Not Yet Available' : 'Acceptance Fee Required'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            {awaitingReview
              ? 'Your admission letter will be available once your application has been reviewed and you are admitted. Please check your application status.'
              : 'You must complete your acceptance fee payment before you can view or print your admission letter. Please pay the acceptance fee to unlock access.'}
          </p>
          {!awaitingReview && admissionLetterGate && (
            <a
              href={`/admission/pay-acceptance${application?.applicationFormNumber ? `?form=${encodeURIComponent(application.applicationFormNumber)}` : ''}`}
              className="mt-6 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20 transition-all active:scale-95"
            >
              Pay Acceptance Fees Now
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Admission Letter</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">
            View, print, or download your official BROCHEST provisional admission letter.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPreviewOpen(!previewOpen)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            <FileText className="w-4 h-4" />
            {previewOpen ? 'Hide Preview' : 'Preview'}
          </button>
          <button
            onClick={() => letterData && openAdmissionLetterWindow({ ...letterData, documentType: 'ORIGINAL' })}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20 transition-all"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {!acceptancePaid && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/30 p-5 flex items-start gap-4">
          <div className="shrink-0 w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
            <Lock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wide">
              Acceptance Fee Required
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
              You must complete your acceptance fee payment before you can print your admission letter.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Letter Details</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Field label="Candidate" value={application.surname + ' ' + application.firstName} />
            <Field label="Application Ref" value={application.applicationFormNumber || '—'} />
            <Field label="Matriculation No" value={myStudent?.matricNumber || myStudent?.regNo || '—'} />
          </div>
          <div className="space-y-3">
            <Field label="Programme" value={application.courseOfStudy || application.firstChoiceCourse || '—'} />
            <Field label="Session" value={`${new Date().getFullYear()}/${new Date().getFullYear() + 1}`} />
            <Field label="Acceptance Fee" value={acceptancePaid ? 'PAID / CLEARED' : 'NOT PAID'} paid={acceptancePaid} />
          </div>
        </div>
      </div>

      {previewOpen && letterData && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Document Preview</h3>
            <button
              onClick={() => letterData && openAdmissionLetterWindow(letterData)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
          </div>
          <iframe
            title="Admission Letter Preview"
            srcDoc={buildAdmissionLetterHtml(letterData)}
            className="w-full bg-slate-200"
            style={{ height: 900 }}
          />
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  paid,
}: {
  label: string;
  value: string;
  paid?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</span>
      <span className="text-sm font-medium text-slate-900 dark:text-white text-right">
        {paid ? (
          <span className="inline-flex items-center gap-1.5 text-emerald-600">
            <CheckCircle className="w-4 h-4" /> {value}
          </span>
        ) : (
          value
        )}
      </span>
    </div>
  );
}