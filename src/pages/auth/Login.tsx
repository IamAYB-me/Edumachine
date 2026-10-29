import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Eye, EyeOff, LogIn, KeyRound } from 'lucide-react';
import { AnimatedButton, StaggerContainer, StaggerItem } from '@/components/ui/motion';
import { useAuthStore, ROLE_DASHBOARD_MAP } from '@/store/useAuthStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { sendForgotPasswordEmail } from '@/services/authService';

export default function LoginPage() {
  const navigate = useNavigate();
  const loginWithCredentials = useAuthStore((s) => s.loginWithCredentials);
  const { globalSettings } = useSettingsStore();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [showForgot, setShowForgot] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    await new Promise((r) => setTimeout(r, 500));

    const result = await loginWithCredentials(identifier, password);

    if (!result.success) {
      setError(result.error || 'Login failed. Please try again.');
      setIsLoading(false);
      return;
    }

    const user = useAuthStore.getState().user;
    if (user) {
      const dashboard = ROLE_DASHBOARD_MAP[user.role] || '/admin';
      navigate(dashboard);
    }
    setIsLoading(false);
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMessage('');
    setForgotError('');
    setIsSending(true);

    const result = await sendForgotPasswordEmail(forgotIdentifier);

    setIsSending(false);
    if (!result.success) {
      setForgotError(result.error || 'Could not send reset email. Please try again.');
      return;
    }
    setForgotMessage('If an account exists with those details, a password reset link has been sent to the email on file.');
  };

  const openForgot = () => {
    setForgotMessage('');
    setForgotError('');
    setShowForgot(true);
  };

  const closeForgot = () => {
    setShowForgot(false);
    setForgotMessage('');
    setForgotError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <StaggerContainer>
            <StaggerItem variant="fadeUp">
              <div className="text-center mb-8">
                <a href="https://www.brochest.com.ng" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 mb-4">
                  {globalSettings.logoUrl ? (
                    <img src={globalSettings.logoUrl} alt="Logo" className="w-12 h-12 rounded-xl object-contain shadow-lg" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/30">
                      <GraduationCap className="w-7 h-7 text-white" />
                    </div>
                  )}
                  <div className="text-left">
                    <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">{globalSettings.appName || 'BROCHEST Portal'}</h1>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-widest">{globalSettings.appTagline || 'School Management System'}</p>
                  </div>
                </a>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-6">{showForgot ? 'Reset your password' : 'Welcome back'}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {showForgot ? 'Enter your email or matric number to receive a reset link' : 'Sign in with your email or matric number'}
                </p>
              </div>
            </StaggerItem>

            <StaggerItem variant="scaleIn">
              <motion.div
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6"
              >
                <AnimatePresence mode="wait">
                  {showForgot ? (
                    <motion.form
                      key="forgot-form"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      onSubmit={handleForgotSubmit}
                      className="space-y-4"
                    >
                      <AnimatePresence>
                        {forgotError && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-xl"
                          >
                            {forgotError}
                          </motion.div>
                        )}
                        {forgotMessage && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm px-4 py-3 rounded-xl"
                          >
                            {forgotMessage}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Email or Matric Number</label>
                        <input
                          type="text"
                          required
                          value={forgotIdentifier}
                          onChange={(e) => setForgotIdentifier(e.target.value)}
                          placeholder="you@example.com or matric number"
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all"
                        />
                      </div>

                      <AnimatedButton
                        type="submit"
                        disabled={isSending}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all"
                      >
                        {isSending ? (
                          <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <KeyRound className="w-4 h-4" />
                            Send Reset Link
                          </>
                        )}
                      </AnimatedButton>

                      <button
                        type="button"
                        onClick={closeForgot}
                        className="w-full text-center text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 py-1"
                      >
                        Back to Sign In
                      </button>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="login-form"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      onSubmit={handleSubmit}
                      className="space-y-4"
                    >
                      <AnimatePresence>
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: [0, -6, 6, -4, 4, -2, 2, 0] }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-xl"
                          >
                            {error}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <StaggerContainer className="space-y-4" staggerDelay={0.05}>
                        <StaggerItem variant="fadeUp">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Email or Matric Number</label>
                            <input
                              type="text"
                              required
                              value={identifier}
                              onChange={(e) => setIdentifier(e.target.value)}
                              placeholder="you@example.com or matric number"
                              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all"
                            />
                          </div>
                        </StaggerItem>

                        <StaggerItem variant="fadeUp">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-slate-500 uppercase">Password</label>
                              <button
                                type="button"
                                onClick={openForgot}
                                className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                              >
                                Forgot password?
                              </button>
                            </div>
                            <div className="relative">
                              <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all pr-10"
                              />
                              <motion.button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                animate={{ rotate: showPassword ? 180 : 0 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                              >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </motion.button>
                            </div>
                          </div>
                        </StaggerItem>
                        <StaggerItem variant="fadeUp">
                          <AnimatedButton
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all"
                          >
                            {isLoading ? (
                              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <>
                                <LogIn className="w-4 h-4" />
                                Sign In
                              </>
                            )}
                          </AnimatedButton>
                        </StaggerItem>
                      </StaggerContainer>
                    </motion.form>
                  )}
                </AnimatePresence>

                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-bold">
                      Sign Up
                    </Link>
                  </p>
                </div>
              </motion.div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </div>
    </div>
  );
}
