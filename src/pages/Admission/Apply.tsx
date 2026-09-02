import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap, ArrowRight, ArrowLeft, CheckCircle, CreditCard, User,
  Users, BookOpen, FileText, Loader2, AlertCircle, Camera, Upload, Mail, Phone,
  Printer, ShieldCheck,
} from 'lucide-react';
import { cn } from '@/utils';
import { useDataStore, type PortalLevel } from '@/store/useDataStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useCurrency } from '@/hooks/useCurrency';
import { getPortalProgrammes } from '@/utils/portalProgrammes';
import { subscribeToCollection } from '@/services/firestoreService';
import { usePaystackPayment } from 'react-paystack';
import { functions } from '@/config/firebase';
import { httpsCallable } from 'firebase/functions';

const STEPS = [
  { label: 'Student Info', icon: User },
  { label: 'Course Selection', icon: BookOpen },
  { label: 'Sponsor', icon: Users },
  { label: 'Next of Kin', icon: Users },
  { label: 'Academic History', icon: FileText },
  { label: 'Payment', icon: CreditCard },
];

const GENDER_OPTIONS = ['Male', 'Female'];
const MARITAL_STATUS_OPTIONS = ['Single', 'Married', 'Divorced', 'Widowed', 'Other'];
const RELATIONSHIP_OPTIONS = ['Father', 'Mother', 'Brother', 'Sister', 'Guardian', 'Uncle', 'Aunt', 'Husband', 'Wife', 'Other'];
const EXAM_BODIES = ['WAEC', 'NECO', 'NABTEB'];
const GRADE_OPTIONS = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'];
const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
  'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
];

const COMMON_SUBJECTS = [
  'English Language', 'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'Economics', 'Government', 'Literature in English', 'History', 'Geography',
  'Agricultural Science', 'Computer Studies', 'Further Mathematics',
  'Technical Drawing', 'Food & Nutrition', 'French', 'Yoruba', 'Igbo', 'Hausa',
  'Christian Religious Studies', 'Islamic Religious Studies', 'Civic Education',
  'Data Processing', 'Commerce', 'Principle of Accounts', 'Marketing',
];

const CLASS_OPTIONS = [
  'Nursery 1', 'Nursery 2', 'Nursery 3',
  'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
  'JSS 1', 'JSS 2', 'JSS 3',
  'SSS 1', 'SSS 2', 'SSS 3',
  'Year 1', 'Year 2', 'Year 3', 'Year 4',
  '100 Level', '200 Level', '300 Level', '400 Level',
];

interface SubjectGrade {
  subject: string;
  grade: string;
}

interface FormData {
  // Student Info
  applicationFormNumber: string;
  passportFile: string;
  surname: string;
  firstName: string;
  middleName: string;
  dateOfBirth: string;
  placeOfBirth: string;
  gender: string;
  lga: string;
  stateOfOrigin: string;
  nationality: string;
  residentialAddress: string;
  phone: string;
  email: string;
  password: string;
  passwordConfirm: string;
  maritalStatus: string;
  // Course Choices
  faculty: string;
  department: string;
  firstChoiceCourse: string;
  secondChoiceCourse: string;

  // Sponsor
  sponsorFullName: string;
  sponsorAddress: string;
  sponsorPhone: string;
  sponsorSignatureUrl: string;

  // Next of Kin
  nextOfKinName: string;
  nextOfKinAddress: string;
  nextOfKinPhone: string;
  nextOfKinRelationship: string;

  // Academic - First Sitting
  firstSittingRegNumber: string;
  firstSittingExamBody: string;
  firstSittingExamYear: string;
  firstSittingSubjects: SubjectGrade[];

  // Academic - Second Sitting
  secondSittingRegNumber: string;
  secondSittingExamBody: string;
  secondSittingExamYear: string;
  secondSittingSubjects: SubjectGrade[];
  useSecondSitting: boolean;
}

const emptySubjects = (): SubjectGrade[] => {
  const arr: SubjectGrade[] = Array.from({ length: 8 }, () => ({ subject: '', grade: '' }));
  arr[0] = { subject: 'English Language', grade: '' };
  arr[1] = { subject: 'Mathematics', grade: '' };
  return arr;
};

function generateFormNumber(prefix: string, nextSeq: number): string {
  const year = new Date().getFullYear();
  const seq = String(nextSeq).padStart(4, '0');
  return `${prefix.toUpperCase()}/${year}/${seq}`;
}

const initialForm: FormData = {
  applicationFormNumber: '',
  passportFile: '',
  surname: '', firstName: '', middleName: '', dateOfBirth: '', placeOfBirth: '',
  gender: '', lga: '', stateOfOrigin: '', nationality: 'Nigerian',
  residentialAddress: '', phone: '', email: '', password: '', passwordConfirm: '', maritalStatus: 'Single',

  faculty: '', department: '', firstChoiceCourse: '', secondChoiceCourse: '',
  sponsorFullName: '', sponsorAddress: '', sponsorPhone: '',
  sponsorSignatureUrl: '',
  nextOfKinName: '', nextOfKinAddress: '', nextOfKinPhone: '',
  nextOfKinRelationship: '',
  firstSittingRegNumber: '', firstSittingExamBody: '', firstSittingExamYear: '',
  firstSittingSubjects: emptySubjects(),
  secondSittingRegNumber: '', secondSittingExamBody: '', secondSittingExamYear: '',
  secondSittingSubjects: emptySubjects(),
  useSecondSitting: false,
};

export default function AdmissionApply() {
  const { subjects, classes, schools } = useDataStore();
  const { globalSettings } = useSettingsStore();
  const { format } = useCurrency();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [paymentSucceeded, setPaymentSucceeded] = useState(false);
  const [paymentReference, setPaymentReference] = useState('');
  const [applicationId, setApplicationId] = useState('');
  const [error, setError] = useState('');
  const [remoteSubjects, setRemoteSubjects] = useState<{ name: string; code: string; facultyId?: string; departmentId?: string }[]>([]);
  const [remoteFaculties, setRemoteFaculties] = useState<{ id: string; name: string; code: string }[]>([]);
  const [remoteDepartments, setRemoteDepartments] = useState<{ id: string; name: string; code: string; facultyId: string }[]>([]);

  useEffect(() => {
    const unsubSubjects = subscribeToCollection('subjects', (data) => {
      setRemoteSubjects(data.map((d: any) => ({ name: d.name, code: d.code, facultyId: d.facultyId || '', departmentId: d.departmentId || '' })));
    }, (err) => console.error('[Apply] subjects subscription error:', err));
    const unsubFaculties = subscribeToCollection('faculties', (data) => {
      setRemoteFaculties(data.map((d: any) => ({ id: d.id, name: d.name, code: d.code })));
    }, (err) => console.error('[Apply] faculties subscription error:', err));
    const unsubDepts = subscribeToCollection('departments', (data) => {
      setRemoteDepartments(data.map((d: any) => ({ id: d.id, name: d.name, code: d.code, facultyId: d.facultyId || '' })));
    }, (err) => console.error('[Apply] departments subscription error:', err));
    return () => { unsubSubjects(); unsubFaculties(); unsubDepts(); };
  }, []);

  const prefix = globalSettings.admissionFormPrefix || 'BRO';
  const nextSeq = globalSettings.admissionFormNextSequence || 1;
  const formNumber = generateFormNumber(prefix, nextSeq);

  const availableSubjects = remoteSubjects.length > 0
    ? remoteSubjects.map((s) => s.name).filter((n, i, a) => a.indexOf(n) === i)
    : subjects.length > 0
      ? subjects.map((s) => s.name).filter((n, i, a) => a.indexOf(n) === i)
      : COMMON_SUBJECTS;
  const availableFaculties = remoteFaculties;
  const availableClasses = classes.length > 0
    ? classes.map((c) => c.name).filter((n, i, a) => a.indexOf(n) === i)
    : CLASS_OPTIONS;

  const [form, setForm] = useState<FormData>({
    ...initialForm,
    applicationFormNumber: formNumber,
  });

  useEffect(() => {
    setForm((prev) => ({ ...prev, applicationFormNumber: formNumber }));
  }, [formNumber]);

  const ADMISSION_FEE = globalSettings.admissionFee || 5000;

  const availableDepartments = form.faculty
    ? remoteDepartments.filter((d) => d.facultyId === form.faculty)
    : remoteDepartments;

  // Resolve the portal level for the school this admission form serves, so the
  // course/programme list reflects College vs Polytechnic vs University.
  const resolveAdmissionPortalLevel = useMemo(() => {
    const normalize = (value?: string) => (value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const schoolName = globalSettings.appName || 'School';
    const matched =
      schools.find((s) => normalize(s.name) === normalize(schoolName)) ??
      schools.find((s) => normalize(s.name).includes(normalize(schoolName)) || normalize(schoolName).includes(normalize(s.name))) ??
      (schools.length === 1 ? schools[0] : undefined);
    return (matched?.portalLevel ?? 'Secondary') as PortalLevel;
  }, [schools, globalSettings.appName]);

  const filteredCourses = useMemo(() => {
    if (remoteDepartments.length === 0) return getPortalProgrammes(resolveAdmissionPortalLevel);
    return remoteDepartments.map((d) => d.code ? `${d.name} (${d.code})` : d.name).filter((n, i, a) => a.indexOf(n) === i);
  }, [remoteDepartments, resolveAdmissionPortalLevel]);

  const update = (field: keyof FormData, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const updateFirstSittingSubject = (index: number, field: 'subject' | 'grade', value: string) => {
    const subjects = [...form.firstSittingSubjects];
    subjects[index] = { ...subjects[index], [field]: value };
    setForm((prev) => ({ ...prev, firstSittingSubjects: subjects }));
  };

  const updateSecondSittingSubject = (index: number, field: 'subject' | 'grade', value: string) => {
    const subjects = [...form.secondSittingSubjects];
    subjects[index] = { ...subjects[index], [field]: value };
    setForm((prev) => ({ ...prev, secondSittingSubjects: subjects }));
  };

  const handlePassportUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => update('passportFile', reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => update('sponsorSignatureUrl', reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const submitApplication = useCallback(async (reference: string) => {
    setPaying(true);
    setError('');
    try {
      // Step 1: Persist application + create applicant account + send emails (server-side).
      const submitAdmission = httpsCallable(functions, 'submitAdmissionApplication');
      const res = await submitAdmission({
        schoolName: globalSettings.appName || 'BROCHEST Portal',
        passportUrl: form.passportFile,
        surname: form.surname,
        firstName: form.firstName,
        middleName: form.middleName,
        dateOfBirth: form.dateOfBirth,
        placeOfBirth: form.placeOfBirth,
        gender: form.gender,
        lga: form.lga,
        stateOfOrigin: form.stateOfOrigin,
        nationality: form.nationality,
        residentialAddress: form.residentialAddress,
        phone: form.phone,
        email: form.email,
        maritalStatus: form.maritalStatus,
        password: form.password,
        courseOfStudy: form.department
          ? `${remoteDepartments.find((d) => d.id === form.department)?.name || form.department} — ${remoteFaculties.find((f) => f.id === form.faculty)?.name || form.faculty}`
          : remoteFaculties.find((f) => f.id === form.faculty)?.name || form.faculty,
        firstChoiceCourse: form.firstChoiceCourse,
        secondChoiceCourse: form.secondChoiceCourse,
        sponsorFullName: form.sponsorFullName,
        sponsorAddress: form.sponsorAddress,
        sponsorPhone: form.sponsorPhone,
        sponsorSignatureUrl: form.sponsorSignatureUrl,
        nextOfKinName: form.nextOfKinName,
        nextOfKinAddress: form.nextOfKinAddress,
        nextOfKinPhone: form.nextOfKinPhone,
        nextOfKinRelationship: form.nextOfKinRelationship,
        firstSittingRegNumber: form.firstSittingRegNumber,
        firstSittingExamBody: form.firstSittingExamBody,
        firstSittingExamYear: form.firstSittingExamYear,
        firstSittingSubjects: form.firstSittingSubjects.filter((s) => s.subject),
        secondSittingRegNumber: form.secondSittingRegNumber,
        secondSittingExamBody: form.secondSittingExamBody,
        secondSittingExamYear: form.secondSittingExamYear,
        secondSittingSubjects: form.useSecondSitting ? form.secondSittingSubjects.filter((s) => s.subject) : [],
        admissionFee: ADMISSION_FEE,
        parentName: form.sponsorFullName,
        parentPhone: form.sponsorPhone,
        reference,
        progressUrl: `${window.location.origin}/admission/progress`,
      });

      const result = res.data as { applicationFormNumber: string };

      // Step 2: Verify payment via Cloud Function (server-side with secret key)
      try {
        const verifyPayment = httpsCallable(functions, 'verifyPaystackPayment');
        await verifyPayment({ reference, applicationFormNumber: result.applicationFormNumber });
      } catch (err) {
        console.warn('[Apply] Cloud verification failed, payment will be verified via webhook:', err);
        // Application is already saved — Paystack webhook will handle verification as fallback
      }

      setApplicationId(result.applicationFormNumber);
      setPaymentDone(true);
      setPaying(false);
      setSubmitted(true);
    } catch (err: any) {
      console.error('[Apply] Submission failed:', err);
      setError(err?.message || 'Your application could not be submitted. Please try again.');
      setPaying(false);
    }
  }, [form, remoteDepartments, remoteFaculties, ADMISSION_FEE, globalSettings]);

  const paystackConfig = useMemo(() => ({
    reference: `ADM-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    email: form.email || 'applicant@example.com',
    amount: ADMISSION_FEE * 100, // Paystack expects amount in kobo
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string,
  }), [form.email, ADMISSION_FEE]);

  const onPaystackSuccess = useCallback((reference: any) => {
    const ref = reference?.reference;
    setPaymentReference(ref);
    setPaymentSucceeded(true);
    setError('');
    submitApplication(ref);
  }, [submitApplication]);

  const onPaystackClose = useCallback(() => {
    setError('Payment cancelled. Your application has not been submitted yet.');
  }, []);

  const initializePayment = usePaystackPayment(paystackConfig);

  if (globalSettings.admissionsEnabled === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-8 sm:p-10">
            <div className="w-20 h-20 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-rose-600 dark:text-rose-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Admissions Currently Closed</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
              The admission application portal is not accepting new submissions at this time. Please check back later or contact the school for more information.
            </p>
            <a
              href="https://www.brochest.com.ng"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  const handlePayment = () => {
    setPaying(true);
    setError('');
    initializePayment({
      onSuccess: onPaystackSuccess,
      onClose: onPaystackClose,
    });
  };

  const validateStep = (): { ok: boolean; message?: string } => {
    if (step === 0) {
      if (!form.surname || !form.firstName || !form.gender || !form.phone || !form.email) {
        return { ok: false, message: 'Please fill in all required fields.' };
      }
      const policy = globalSettings.passwordPolicy;
      if (!form.password) {
        return { ok: false, message: 'Please create a password for your applicant account.' };
      }
      if (form.password !== form.passwordConfirm) {
        return { ok: false, message: 'Passwords do not match.' };
      }
      if (form.password.length < (policy.minLength || 8)) {
        return { ok: false, message: `Password must be at least ${policy.minLength || 8} characters.` };
      }
      if (policy.requireCapital && !/[A-Z]/.test(form.password)) {
        return { ok: false, message: 'Password must include at least one capital letter.' };
      }
      if (policy.requireNumbers && !/\d/.test(form.password)) {
        return { ok: false, message: 'Password must include at least one number.' };
      }
      if (policy.requireSymbols && !/[^A-Za-z0-9]/.test(form.password)) {
        return { ok: false, message: 'Password must include at least one special character.' };
      }
      return { ok: true };
    }
    if (step === 1) {
      return form.firstChoiceCourse ? { ok: true } : { ok: false, message: 'Please select a first choice course.' };
    }
    if (step === 2) {
      return (form.sponsorFullName && form.sponsorPhone)
        ? { ok: true }
        : { ok: false, message: 'Please fill in all required fields.' };
    }
    if (step === 3) {
      return (form.nextOfKinName && form.nextOfKinPhone)
        ? { ok: true }
        : { ok: false, message: 'Please fill in all required fields.' };
    }
    if (step === 4) {
      const filledSubjects = form.firstSittingSubjects.filter((s) => s.subject && s.grade).length;
      return (form.firstSittingRegNumber && form.firstSittingExamBody && form.firstSittingExamYear && filledSubjects >= 5)
        ? { ok: true }
        : { ok: false, message: 'Please complete your first sitting results (minimum 5 subjects).' };
    }
    return { ok: true };
  };

  const inputClass = "w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:text-white transition-colors";
  const labelClass = "text-xs font-bold text-slate-500 uppercase tracking-wide";

  // ─── SUCCESS / PRINT PAGE ───
  if (submitted) {
    const handlePrint = () => window.print();

    return (
      <>
        {/* Print-only receipt */}
        <div className="print-only">
          <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '700px', margin: '0 auto', padding: '10px 30px 30px', color: '#1e293b' }}>
            <div style={{ textAlign: 'center', borderBottom: '3px solid #2563eb', paddingBottom: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '10px' }}>
                {globalSettings.logoUrl && (
                  <img src={globalSettings.logoUrl} alt="Logo" style={{ height: '50px' }} />
                )}
                <h1 style={{ fontSize: '22px', fontWeight: 'bold', margin: 0 }}>{globalSettings.appName || 'BROCHEST Portal'}</h1>
              </div>
              <p style={{ fontSize: '11px', color: '#64748b', margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>Student Admission Application Receipt</p>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <p style={{ fontSize: '12px', color: '#16a34a', fontWeight: 'bold', margin: '0 0 4px' }}>APPLICATION SUBMITTED SUCCESSFULLY</p>
              <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#2563eb', fontFamily: 'monospace', margin: 0 }}>{applicationId}</p>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '13px' }}>
              <tbody>
                {[
                  ['Applicant Name', `${form.surname} ${form.firstName} ${form.middleName}`],
                  ['Date of Birth', form.dateOfBirth],
                  ['Gender', form.gender],
                  ['Phone', form.phone],
                  ['Email', form.email],
                  ['State of Origin', form.stateOfOrigin],
                  ['Nationality', form.nationality],
                  ['Residential Address', form.residentialAddress],
                  ['Faculty / School', remoteFaculties.find((f) => f.id === form.faculty)?.name || ''],
                  ['Department', remoteDepartments.find((d) => d.id === form.department)?.name || ''],
                  ['First Choice Course', form.firstChoiceCourse],
                  ['Second Choice Course', form.secondChoiceCourse],
                  ['Sponsor Name', form.sponsorFullName],
                  ['Sponsor Phone', form.sponsorPhone],
                  ['Next of Kin', form.nextOfKinName],
                  ['Next of Kin Relationship', form.nextOfKinRelationship],
                  ['Exam Body', form.firstSittingExamBody],
                  ['Exam Year', form.firstSittingExamYear],
                ].filter(([, v]) => v).map(([label, value]) => (
                  <tr key={label} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 'bold', color: '#475569', width: '40%', backgroundColor: '#f8fafc' }}>{label}</td>
                    <td style={{ padding: '8px 12px' }}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ border: '2px solid #2563eb', borderRadius: '8px', padding: '16px', marginBottom: '20px', backgroundColor: '#eff6ff' }}>
              <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#2563eb', margin: '0 0 8px' }}>Payment Information</p>
              <table style={{ width: '100%', fontSize: '13px' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '4px 0', color: '#475569' }}>Amount Paid</td>
                    <td style={{ padding: '4px 0', fontWeight: 'bold', textAlign: 'right' }}>{format(ADMISSION_FEE)}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px 0', color: '#475569' }}>Payment Status</td>
                    <td style={{ padding: '4px 0', fontWeight: 'bold', color: '#16a34a', textAlign: 'right' }}>PAID</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px 0', color: '#475569' }}>Payment Date</td>
                    <td style={{ padding: '4px 0', textAlign: 'right' }}>{new Date().toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '12px', marginBottom: '20px' }}>
              <p style={{ fontSize: '12px', color: '#92400e', margin: 0, lineHeight: '1.6' }}>
                <strong>Important:</strong> The school registrar will contact you via your email or phone number with further instructions. Please keep this receipt and your application number safe.
              </p>
            </div>

            <div style={{ textAlign: 'center', borderTop: '2px solid #e2e8f0', paddingTop: '16px', fontSize: '11px', color: '#94a3b8' }}>
              <p style={{ margin: '0 0 4px' }}>Generated on {new Date().toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              <p style={{ margin: 0 }}>{globalSettings.appName || 'BROCHEST Portal'} — Admission Portal</p>
            </div>
          </div>
        </div>

        {/* Screen-only success page */}
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center px-4 no-print">
          <div className="w-full max-w-lg text-center">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-8 sm:p-10">
              <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Application Submitted Successfully!</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 leading-relaxed">
                Your admission application has been received and payment confirmed.
              </p>
              <p className="text-sm font-bold text-blue-600 dark:text-blue-400 font-mono mb-6">{applicationId}</p>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-6 text-left">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-900 dark:text-blue-300">What Happens Next?</p>
                    <p className="text-[11px] text-blue-600 dark:text-blue-400">Important information</p>
                  </div>
                </div>
                <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed mb-4">
                  The school registrar will contact you shortly via your <strong>email</strong> or <strong>phone number</strong> to inform you of the next steps in the admission process.
                </p>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Application No.</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">{applicationId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Applicant</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{form.surname} {form.firstName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Email</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{form.email}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Phone</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{form.phone}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Payment</span>
                    <span className="font-bold text-emerald-600">Paid — {format(ADMISSION_FEE)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 mb-6">
                <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
                  Your login credentials and a link to track this application have been sent to <strong>{form.email}</strong>. Sign in with your password to follow your application status.
                </p>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
                <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                  Please keep your application number safe. Check your email and phone regularly for updates from the registrar.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white rounded-xl text-sm font-bold shadow-lg transition-all"
                >
                  <Printer className="w-4 h-4" /> Print Receipt
                </button>
                <Link
                  to="/admission/progress"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-900/20 transition-all"
                >
                  <ShieldCheck className="w-4 h-4" /> Track Application
                </Link>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ─── FORM ───
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            {globalSettings.logoUrl ? (
              <img src={globalSettings.logoUrl} alt="Logo" className="w-10 h-10 rounded-xl object-contain shadow-lg" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/30">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">{globalSettings.appName || 'BROCHEST Portal'}</h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Student Admission Application</p>
            </div>
          </Link>
          <div className="hidden sm:block text-right">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Application Fee</p>
            <p className="text-lg font-bold text-blue-600">{format(ADMISSION_FEE)}</p>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <React.Fragment key={s.label}>
                <div className="flex flex-col items-center gap-1.5 min-w-0">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0",
                    i < step ? "bg-emerald-500 text-white" :
                    i === step ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30" :
                    "bg-slate-200 dark:bg-slate-700 text-slate-400"
                  )}>
                    {i < step ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={cn(
                    "text-[9px] font-bold uppercase tracking-wider text-center hidden sm:block",
                    i <= step ? "text-blue-600 dark:text-blue-400" : "text-slate-400"
                  )}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn(
                    "flex-1 h-0.5 mx-1 sm:mx-2 mt-[-20px] sm:mt-[-10px] rounded-full min-w-[8px]",
                    i < step ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"
                  )} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{STEPS[step].label}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            {step === 0 && 'Provide the student\'s personal and contact information.'}
            {step === 1 && 'Select preferred courses and class.'}
            {step === 2 && 'Provide sponsor details and signature.'}
            {step === 3 && 'Provide next of kin information.'}
            {step === 4 && 'Enter examination results (WAEC, NECO, or NABTEB).'}
            {step === 5 && 'Pay the non-refundable admission processing fee.'}
          </p>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          {/* ─── STEP 0: Student Information ─── */}
          {step === 0 && (
            <div className="space-y-5">
              {/* Application Number + Passport */}
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="space-y-1 flex-1">
                  <label className={labelClass}>Application Form Number</label>
                  <div className="relative">
                    <input type="text" value={form.applicationFormNumber} readOnly
                      className={cn(inputClass, "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700 cursor-not-allowed font-mono font-bold text-blue-700 dark:text-blue-300 text-base tracking-wide")} />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <span className="text-[9px] font-bold text-blue-400 dark:text-blue-500 uppercase bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-700">Auto-generated</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">This number is assigned automatically and cannot be changed.</p>
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Passport Photograph *</label>
                  <div className="relative">
                    <input type="file" accept="image/*" onChange={handlePassportUpload} className="hidden" id="passport-upload" />
                    <label htmlFor="passport-upload" className={cn(
                      "flex flex-col items-center justify-center w-28 h-28 rounded-xl border-2 border-dashed cursor-pointer transition-all",
                      form.passportFile
                        ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20"
                        : "border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 hover:border-blue-400"
                    )}>
                      {form.passportFile ? (
                        <img src={form.passportFile} alt="Passport" className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <>
                          <Camera className="w-6 h-6 text-slate-400 mb-1" />
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Upload</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className={labelClass}>Surname *</label>
                  <input type="text" value={form.surname} onChange={(e) => update('surname', e.target.value)}
                    placeholder="Surname" className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>First Name *</label>
                  <input type="text" value={form.firstName} onChange={(e) => update('firstName', e.target.value)}
                    placeholder="First Name" className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Middle Name</label>
                  <input type="text" value={form.middleName} onChange={(e) => update('middleName', e.target.value)}
                    placeholder="Middle Name" className={inputClass} />
                </div>
              </div>

              {/* DOB, Place, Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className={labelClass}>Date of Birth *</label>
                  <input type="date" value={form.dateOfBirth} onChange={(e) => update('dateOfBirth', e.target.value)} className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Place of Birth</label>
                  <input type="text" value={form.placeOfBirth} onChange={(e) => update('placeOfBirth', e.target.value)}
                    placeholder="Town/City" className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Gender *</label>
                  <select value={form.gender} onChange={(e) => update('gender', e.target.value)} className={inputClass}>
                    <option value="">Select Gender</option>
                    {GENDER_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              {/* LGA, State, Nationality */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className={labelClass}>Local Government Area</label>
                  <input type="text" value={form.lga} onChange={(e) => update('lga', e.target.value)}
                    placeholder="LGA" className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>State of Origin</label>
                  <select value={form.stateOfOrigin} onChange={(e) => update('stateOfOrigin', e.target.value)} className={inputClass}>
                    <option value="">Select State</option>
                    {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Nationality</label>
                  <input type="text" value={form.nationality} onChange={(e) => update('nationality', e.target.value)}
                    placeholder="e.g. Nigerian" className={inputClass} />
                </div>
              </div>

              {/* Address, Phone, Email */}
              <div className="space-y-1">
                <label className={labelClass}>Residential Address</label>
                <input type="text" value={form.residentialAddress} onChange={(e) => update('residentialAddress', e.target.value)}
                  placeholder="Full residential address" className={inputClass} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelClass}>Phone Number *</label>
                  <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)}
                    placeholder="+234 xxx xxx xxxx" className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Email Address *</label>
                  <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)}
                    placeholder="student@email.com" className={inputClass} />
                </div>
              </div>

              {/* Account Password */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <p className="text-xs font-bold text-blue-800 dark:text-blue-300 mb-1 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Create Your Applicant Account
                </p>
                <p className="text-[11px] text-blue-600 dark:text-blue-400 mb-4">
                  Your account lets you log in and track the status of this application.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className={labelClass}>Password *</label>
                    <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)}
                      placeholder="Create a password" className={inputClass} />
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass}>Confirm Password *</label>
                    <input type="password" value={form.passwordConfirm} onChange={(e) => update('passwordConfirm', e.target.value)}
                      placeholder="Re-enter password" className={inputClass} />
                  </div>
                </div>
                {form.password && form.passwordConfirm && form.password !== form.passwordConfirm && (
                  <p className="text-[11px] font-bold text-rose-600 mt-2">Passwords do not match.</p>
                )}
                <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-3">
                  Use at least {globalSettings.passwordPolicy.minLength || 8} characters
                  {globalSettings.passwordPolicy.requireCapital ? ' with a capital letter' : ''}
                  {globalSettings.passwordPolicy.requireNumbers ? ' and a number' : ''}
                  {globalSettings.passwordPolicy.requireSymbols ? ' and a special character' : ''}.
                </p>
              </div>

              {/* Marital Status */}
              <div className="space-y-1">
                <label className={labelClass}>Marital Status</label>
                <select value={form.maritalStatus} onChange={(e) => update('maritalStatus', e.target.value)} className={inputClass}>
                  {MARITAL_STATUS_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* ─── STEP 1: Course Selection ─── */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <label className={labelClass}>First Choice Course *</label>
                <select value={form.firstChoiceCourse} onChange={(e) => update('firstChoiceCourse', e.target.value)} className={inputClass}>
                  <option value="">Select First Choice</option>
                  {filteredCourses.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Second Choice Course</label>
                <select value={form.secondChoiceCourse} onChange={(e) => update('secondChoiceCourse', e.target.value)} className={inputClass}>
                  <option value="">Select Second Choice</option>
                  {filteredCourses.filter((c) => c !== form.firstChoiceCourse).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* ─── STEP 2: Sponsor Information ─── */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <label className={labelClass}>Sponsor Full Name *</label>
                <input type="text" value={form.sponsorFullName} onChange={(e) => update('sponsorFullName', e.target.value)}
                  placeholder="Full name of sponsor" className={inputClass} />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Sponsor Address</label>
                <input type="text" value={form.sponsorAddress} onChange={(e) => update('sponsorAddress', e.target.value)}
                  placeholder="Full address" className={inputClass} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelClass}>Sponsor Phone Number *</label>
                  <input type="tel" value={form.sponsorPhone} onChange={(e) => update('sponsorPhone', e.target.value)}
                    placeholder="+234 xxx xxx xxxx" className={inputClass} />
                </div>
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Sponsor Signature</label>
                <div className="relative">
                  <input type="file" accept="image/*" onChange={handleSignatureUpload} className="hidden" id="signature-upload" />
                  <label htmlFor="signature-upload" className={cn(
                    "flex items-center gap-3 w-full px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-all",
                    form.sponsorSignatureUrl
                      ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20"
                      : "border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 hover:border-blue-400"
                  )}>
                    {form.sponsorSignatureUrl ? (
                      <img src={form.sponsorSignatureUrl} alt="Signature" className="h-12 object-contain" />
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-slate-400" />
                        <span className="text-sm text-slate-500">Click to upload signature image</span>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP 3: Next of Kin ─── */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <label className={labelClass}>Name of Next of Kin *</label>
                <input type="text" value={form.nextOfKinName} onChange={(e) => update('nextOfKinName', e.target.value)}
                  placeholder="Full name" className={inputClass} />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Address of Next of Kin</label>
                <input type="text" value={form.nextOfKinAddress} onChange={(e) => update('nextOfKinAddress', e.target.value)}
                  placeholder="Full address" className={inputClass} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelClass}>Phone Number *</label>
                  <input type="tel" value={form.nextOfKinPhone} onChange={(e) => update('nextOfKinPhone', e.target.value)}
                    placeholder="+234 xxx xxx xxxx" className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Relationship *</label>
                  <select value={form.nextOfKinRelationship} onChange={(e) => update('nextOfKinRelationship', e.target.value)} className={inputClass}>
                    <option value="">Select Relationship</option>
                    {RELATIONSHIP_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP 4: Academic History ─── */}
          {step === 4 && (
            <div className="space-y-6">
              {/* First Sitting */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">1</span>
                  First Sitting Results
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className={labelClass}>Registration Number *</label>
                    <input type="text" required value={form.firstSittingRegNumber} onChange={(e) => update('firstSittingRegNumber', e.target.value)}
                      placeholder="e.g. 4012345678" className={inputClass} />
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass}>Examination Body *</label>
                    <select value={form.firstSittingExamBody} onChange={(e) => update('firstSittingExamBody', e.target.value)} className={inputClass}>
                      <option value="">Select Body</option>
                      {EXAM_BODIES.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass}>Examination Year *</label>
                    <input type="text" value={form.firstSittingExamYear} onChange={(e) => update('firstSittingExamYear', e.target.value)}
                      placeholder="e.g. 2024" maxLength={4} className={inputClass} />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Subjects & Grades (English & Mathematics are compulsory)</p>
                  {form.firstSittingSubjects.map((sg, i) => (
                    <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <select value={sg.subject} onChange={(e) => updateFirstSittingSubject(i, 'subject', e.target.value)}
                        disabled={i < 2}
                        className={cn(inputClass, i < 2 && "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700")}>
                        <option value="">{i === 0 ? 'English Language (Compulsory)' : i === 1 ? 'Mathematics (Compulsory)' : `Subject ${i + 1}`}</option>
                        {i < 2 ? (
                          <option value={i === 0 ? 'English Language' : 'Mathematics'}>{i === 0 ? 'English Language' : 'Mathematics'}</option>
                        ) : (
                          availableSubjects.filter((s) => !form.firstSittingSubjects.some((x, j) => j !== i && x.subject === s)).map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))
                        )}
                      </select>
                      <select value={sg.grade} onChange={(e) => updateFirstSittingSubject(i, 'grade', e.target.value)}
                        className={cn(inputClass, i < 2 && "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700")}>
                        <option value="">Grade</option>
                        {GRADE_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Second Sitting Toggle */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => update('useSecondSitting', !form.useSecondSitting)}
                  className={cn(
                    "relative w-11 h-6 rounded-full transition-colors flex-shrink-0",
                    form.useSecondSitting ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600"
                  )}
                >
                  <div className={cn(
                    "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform",
                    form.useSecondSitting ? "translate-x-[22px]" : "translate-x-0.5"
                  )} />
                </button>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Add Second Sitting Results</span>
              </div>

              {/* Second Sitting */}
              {form.useSecondSitting && (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">2</span>
                    Second Sitting Results
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className={labelClass}>Registration Number</label>
                      <input type="text" value={form.secondSittingRegNumber} onChange={(e) => update('secondSittingRegNumber', e.target.value)}
                        placeholder="e.g. 4012345678" className={inputClass} />
                    </div>
                    <div className="space-y-1">
                      <label className={labelClass}>Examination Body *</label>
                      <select value={form.secondSittingExamBody} onChange={(e) => update('secondSittingExamBody', e.target.value)} className={inputClass}>
                        <option value="">Select Body</option>
                        {EXAM_BODIES.map((b) => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className={labelClass}>Examination Year *</label>
                      <input type="text" value={form.secondSittingExamYear} onChange={(e) => update('secondSittingExamYear', e.target.value)}
                        placeholder="e.g. 2024" maxLength={4} className={inputClass} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Subjects & Grades</p>
                    {form.secondSittingSubjects.map((sg, i) => (
                      <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <select value={sg.subject} onChange={(e) => updateSecondSittingSubject(i, 'subject', e.target.value)}
                          disabled={i < 2}
                          className={cn(inputClass, i < 2 && "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700")}>
                          <option value="">{i === 0 ? 'English Language (Compulsory)' : i === 1 ? 'Mathematics (Compulsory)' : `Subject ${i + 1}`}</option>
                          {i < 2 ? (
                            <option value={i === 0 ? 'English Language' : 'Mathematics'}>{i === 0 ? 'English Language' : 'Mathematics'}</option>
                          ) : (
                            availableSubjects.filter((s) => !form.secondSittingSubjects.some((x, j) => j !== i && x.subject === s)).map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))
                          )}
                        </select>
                        <select value={sg.grade} onChange={(e) => updateSecondSittingSubject(i, 'grade', e.target.value)} className={inputClass}>
                          <option value="">Grade</option>
                          {GRADE_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── STEP 5: Payment ─── */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Admission Processing Fee</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Applicant</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{form.surname} {form.firstName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Application No.</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300 font-mono">{form.applicationFormNumber}</span>
                  </div>
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Total</span>
                    <span className="text-lg font-bold text-blue-600">{format(ADMISSION_FEE)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1">Secure Payment via Paystack</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                      You can pay with Card, Bank Transfer, USSD, or Mobile Money. After payment, your application will be submitted automatically.
                    </p>
                  </div>
                </div>
              </div>

              {!paymentDone ? (
                <>
                  {!paymentSucceeded ? (
                    <button onClick={handlePayment} disabled={paying}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-900/20 transition-all">
                      {paying ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Processing Payment...</>
                      ) : (
                        <><CreditCard className="w-4 h-4" /> Pay {format(ADMISSION_FEE)} Now</>
                      )}
                    </button>
                  ) : (
                    <button onClick={() => submitApplication(paymentReference)} disabled={paying}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all">
                      {paying ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Submitting Application...</>
                      ) : error ? (
                        <><AlertCircle className="w-4 h-4" /> Retry Submission</>
                      ) : (
                        <><CheckCircle className="w-4 h-4" /> Confirm & Submit</>
                      )}
                    </button>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2 justify-center text-emerald-600 font-bold text-sm">
                  <CheckCircle className="w-5 h-5" /> Payment Confirmed
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
            {step > 0 ? (
              <button onClick={() => setStep(step - 1)}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold transition-all">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : <div />}
            {step < STEPS.length - 1 ? (
              <button onClick={() => { const v = validateStep(); if (v.ok) { setError(''); setStep(step + 1); } else { setError(v.message || 'Please fill in all required fields.'); } }}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : null}
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Already have an account? <Link to="/login" className="text-blue-600 hover:text-blue-700 font-bold">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
