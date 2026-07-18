import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { GraduationCap, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useSettingsStore } from '@/store/useSettingsStore';

type VerifyState = 'loading' | 'success' | 'error';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const verifyEmail = useAuthStore((s) => s.verifyEmail);
  const { globalSettings } = useSettingsStore();
  const [state, setState] = useState<VerifyState>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const hasVerified = useRef(false);

  useEffect(() => {
    if (hasVerified.current) return;
    hasVerified.current = true;

    const token = searchParams.get('token');
    if (!token) {
      setState('error');
      setErrorMessage('No verification token provided. Please check your email for the correct link.');
      return;
    }

    const result = verifyEmail(token);
    if (result.success) {
      setState('success');
    } else {
      setState('error');
      setErrorMessage(result.error || 'Verification failed.');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            {globalSettings.logoUrl ? (
              <img src={globalSettings.logoUrl} alt="Logo" className="w-12 h-12 rounded-xl object-contain shadow-lg" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/30">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
            )}
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 text-center">
          {state === 'loading' && (
            <>
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-6" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Verifying your email...</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Please wait a moment.</p>
            </>
          )}

          {state === 'success' && (
            <>
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Email Verified!</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
                Your email has been successfully verified. You can now sign in to your account.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all"
              >
                Sign In to Your Account
              </Link>
            </>
          )}

          {state === 'error' && (
            <>
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Verification Failed</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
                {errorMessage}
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all"
                >
                  Register Again
                </Link>
                <Link
                  to="/login"
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-bold"
                >
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
