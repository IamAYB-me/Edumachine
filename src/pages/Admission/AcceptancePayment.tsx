import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { usePaystackPayment } from 'react-paystack';
import { functions } from '@/config/firebase';
import { httpsCallable } from 'firebase/functions';
import { useAuthStore } from '@/store/useAuthStore';
import { useDataStore } from '@/store/useDataStore';
import { useCurrency } from '@/hooks/useCurrency';
import { cn } from '@/utils';
import { getDocumentsWhere } from '@/services/firestoreService';
import type { AdmissionApplication } from '@/store/useDataStore';
import {
  ShieldCheck, CheckCircle, Lock, CreditCard, Loader2, AlertTriangle, LogIn, ArrowRight,
} from 'lucide-react';

export const ACCEPTANCE_PATH = '/admission/pay-acceptance';

export default function AcceptancePayment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const formNumber = searchParams.get('form');
  const user = useAuthStore((s) => s.user);
  const applications = useDataStore((s) => s.admissionApplications);
  const feeStructures = useDataStore((s) => s.feeStructures);
  const { format } = useCurrency();

  const [paying, setPaying] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState<{ reference: string; amount: number } | null>(null);
  const [error, setError] = useState('');
  const [directApplication, setDirectApplication] = useState<AdmissionApplication | null>(null);
  const [directLoaded, setDirectLoaded] = useState(false);

  useEffect(() => {
    if (!user?.email) {
      setDirectLoaded(true);
      return;
    }
    let cancelled = false;
    const findOnServer = async () => {
      try {
        if (formNumber) {
          const rows = await getDocumentsWhere(
            'admissionApplications',
            'applicationFormNumber',
            '==',
            formNumber,
          );
          if (!cancelled) setDirectApplication((rows[0] as AdmissionApplication) || null);
          return;
        }
        const rows = await getDocumentsWhere('admissionApplications', 'email', '==', user.email);
        if (!cancelled) setDirectApplication((rows[0] as AdmissionApplication) || null);
      } catch {
        if (!cancelled) setDirectApplication(null);
      } finally {
        if (!cancelled) setDirectLoaded(true);
      }
    };
    findOnServer();
    return () => {
      cancelled = true;
    };
  }, [user?.email, formNumber]);

  const application = useMemo(() => {
    if (!user?.email) return null;
    return (
      directApplication ||
      (formNumber
        ? applications.find((a) => a.applicationFormNumber === formNumber) || null
        : applications.find(
            (a) => a.email && a.email.toLowerCase() === user.email!.toLowerCase(),
          ) ||
          null)
    );
  }, [applications, user?.email, directApplication, formNumber]);

  const acceptanceStructure = useMemo(() => {
    const candidates = feeStructures.filter(
      (s) => s.status === 'Active' && s.gatedAction === 'admission_letter' && !s.isOptional,
    );
    return candidates.find((s) => s.isUniversal) || candidates[0] || null;
  }, [feeStructures]);

  const amount = acceptanceStructure?.amount || 0;

  const alreadyPaid = application?.acceptancePaid === true;

  const paystackConfig = useMemo(() => ({
    reference: `ACC-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    email: user?.email || '',
    amount: Math.round(amount * 100),
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string,
  }), [user?.email, amount]);

  const initializePayment = usePaystackPayment(paystackConfig);

  const handlePaystackSuccess = async (ref: any) => {
    const reference = ref?.reference;
    if (!reference) return;
    setPaying(false);
    setProcessing(true);
    setError('');
    try {
      const payAcceptanceFee = httpsCallable(functions, 'payAcceptanceFee');
      const res = await payAcceptanceFee({
        reference,
        applicationFormNumber: application?.applicationFormNumber,
      });
      const result = res.data as { success: boolean; amount: number };
      setSuccess({ reference, amount: result.amount });
    } catch (err: any) {
      console.error('[AcceptancePayment] Failed:', err);
      setError(err?.message || 'Your acceptance fee could not be confirmed. Please try again.');
      setProcessing(false);
    }
  };

  const handlePaystackClose = () => {
    setPaying(false);
    setError('Payment was cancelled. You can try again when you are ready.');
  };

  const handlePay = () => {
    setError('');
    setPaying(true);
    initializePayment({ onSuccess: handlePaystackSuccess, onClose: handlePaystackClose });
  };

  if (!user) {
    return (
      <Shell>
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6">
            <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Please Log In</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
            To pay your acceptance fee, please log in with the email and password you used when you applied.
          </p>
          <Link to="/login" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all">
            <LogIn className="w-4 h-4" /> Log In
          </Link>
        </div>
      </Shell>
    );
  }

  if (!application) {
    if (!directLoaded) {
      return (
        <Shell>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading your application...</p>
          </div>
        </Shell>
      );
    }
    return (
      <Shell>
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Application Not Found</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
            We could not find an admitted application linked to <strong>{user?.email}</strong>.
          </p>
          <Link to="/admission/progress" className="inline-flex gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all">
            Back to My Application
          </Link>
        </div>
      </Shell>
    );
  }

  if (application.applicationStatus !== 'Admitted') {
    return (
      <Shell>
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Not Admitted Yet</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
            Your application is currently <strong>{application.applicationStatus}</strong>. Acceptance fees are only payable once you have been admitted.
          </p>
          <Link to="/admission/progress" className="inline-flex gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all">
            Back to My Application
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="max-w-lg mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 sm:p-10">
          {success ? (
            <div className="text-center space-y-6">
              <div className="mx-auto w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Acceptance Fee Paid!</h2>
                <p className="text-sm text-slate-500 mt-2">
                  Your account has been activated as a student. Please log in to access your student dashboard.
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 text-left space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Amount</span><span className="font-bold text-slate-900 dark:text-white">{format(success.amount)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Reference</span><span className="font-mono text-xs text-slate-700 dark:text-slate-300 break-all">{success.reference}</span></div>
              </div>
              <button
                onClick={() => navigate('/student')}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all"
              >
                <LogIn className="w-4 h-4" /> Go to My Student Dashboard
              </button>
              <p className="text-xs text-slate-400">If you are not redirected, use the "Log In" button at the top and sign in with your application email and password.</p>
            </div>
          ) : alreadyPaid ? (
            <div className="text-center space-y-6">
              <div className="mx-auto w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Acceptance Fee Already Paid</h2>
                <p className="text-sm text-slate-500 mt-2">Your acceptance fee has been confirmed. Log in to access your student dashboard.</p>
              </div>
              <button
                onClick={() => navigate('/student')}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all"
              >
                <LogIn className="w-4 h-4" /> Go to My Student Dashboard
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-4">
                  <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Pay Acceptance Fee</h2>
                <p className="text-sm text-slate-500 mt-2">
                  Complete your acceptance fee to activate your student account and register for courses.
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-900/20 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">Applicant</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{application.surname} {application.firstName}</p>
                    <p className="text-xs text-slate-500">{application.applicationFormNumber}</p>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-blue-600">
                    <CreditCard className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-6 border-t border-blue-100 dark:border-blue-900/20 pt-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{acceptanceStructure?.category || 'Acceptance Fee'}</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{format(amount)}</span>
                </div>
              </div>

              {acceptanceStructure && (
                <p className="text-xs text-slate-400 -mt-2">
                  {acceptanceStructure.description || 'One-time acceptance fee.'}
                </p>
              )}

              {error && (
                <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 dark:border-rose-900/40 dark:bg-rose-950/30 p-4 text-sm text-rose-700 dark:text-rose-300">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={handlePay}
                  disabled={paying || processing || !amount}
                  className={cn(
                    "w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-sm font-bold shadow-lg transition-all active:scale-[0.98]",
                    paying || processing || !amount
                      ? "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed shadow-transparent"
                      : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-900/20",
                  )}
                >
                  {paying || processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                  {processing ? 'Confirming payment...' : paying ? 'Processing...' : `Pay ${format(amount)} Now`}
                </button>
                <Link
                  to="/admission/progress"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Back to My Application
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-900/30">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <span className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Acceptance Fee</span>
        </div>
        {children}
        <p className="text-center text-xs text-slate-400 mt-8">
          <Link to="/" className="hover:underline inline-flex items-center gap-1"><ArrowRight className="w-3 h-3 rotate-180" /> Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
