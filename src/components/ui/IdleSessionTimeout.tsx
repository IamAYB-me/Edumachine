import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, LogOut, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

const IDLE_LIMIT_MS = 10 * 60 * 1000;
const WARNING_AHEAD_MS = 60 * 1000;

const ACTIVITY_EVENTS: Array<keyof WindowEventMap> = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'mousemove'];

const SESSION_LEASE_KEY = 'brochest:portal-session-lease';
const LEASE_STALE_MS = 3000;
const TAB_ID = Math.random().toString(36).slice(2, 12);

function readLease(): { tabId?: string; updatedAt?: number } {
  try {
    const raw = localStorage.getItem(SESSION_LEASE_KEY);
    return raw ? (JSON.parse(raw) as { tabId?: string; updatedAt?: number }) : {};
  } catch {
    return {};
  }
}

function claimLease() {
  try {
    localStorage.setItem(SESSION_LEASE_KEY, JSON.stringify({ tabId: TAB_ID, updatedAt: Date.now() }));
  } catch {
    /* localStorage unavailable */
  }
}

function releaseLease() {
  try {
    const lease = readLease();
    if (lease.tabId === TAB_ID) {
      localStorage.removeItem(SESSION_LEASE_KEY);
    }
  } catch {
    /* localStorage unavailable */
  }
}

export default function IdleSessionTimeout() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(Math.round(WARNING_AHEAD_MS / 1000));

  const secondsRef = useRef(Math.round(WARNING_AHEAD_MS / 1000));
  const warningTimerRef = useRef<number | null>(null);
  const logoutTimerRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);
  const lastActivityRef = useRef(Date.now());

  const clearTimers = useCallback(() => {
    if (warningTimerRef.current !== null) window.clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current !== null) window.clearTimeout(logoutTimerRef.current);
    if (countdownRef.current !== null) window.clearInterval(countdownRef.current);
    warningTimerRef.current = null;
    logoutTimerRef.current = null;
    countdownRef.current = null;
  }, []);

  const handleForceLogout = useCallback(async () => {
    clearTimers();
    setShowWarning(false);
    await logout();
    navigate('/login', { replace: true });
  }, [clearTimers, logout, navigate]);

  const schedule = useCallback(() => {
    clearTimers();
    lastActivityRef.current = Date.now();
    setShowWarning(false);
    secondsRef.current = Math.round(WARNING_AHEAD_MS / 1000);
    setSecondsLeft(secondsRef.current);
    const now = Date.now();
    const expiresAt = now + IDLE_LIMIT_MS;
    const warningAt = expiresAt - WARNING_AHEAD_MS;

    warningTimerRef.current = window.setTimeout(() => {
      secondsRef.current = Math.round(WARNING_AHEAD_MS / 1000);
      setSecondsLeft(secondsRef.current);
      setShowWarning(true);
      countdownRef.current = window.setInterval(() => {
        secondsRef.current -= 1;
        setSecondsLeft(secondsRef.current);
        if (secondsRef.current <= 0) {
          handleForceLogout();
        }
      }, 1000);
    }, Math.max(0, warningAt - now));

    logoutTimerRef.current = window.setTimeout(handleForceLogout, IDLE_LIMIT_MS);
  }, [clearTimers, handleForceLogout]);

  const onActivity = useCallback(() => {
    const now = Date.now();
    if (now - lastActivityRef.current < 2000) return;
    schedule();
  }, [schedule]);

  useEffect(() => {
    schedule();
    ACTIVITY_EVENTS.forEach((ev) => window.addEventListener(ev, onActivity, { passive: true }));
    window.addEventListener('scroll', onActivity, { passive: true });
    return () => {
      ACTIVITY_EVENTS.forEach((ev) => window.removeEventListener(ev, onActivity));
      window.removeEventListener('scroll', onActivity);
      clearTimers();
    };
  }, [schedule, onActivity, clearTimers]);

  useEffect(() => {
    const pageHideHandler = () => releaseLease();
    const visibilityHandler = () => {
      if (document.visibilityState === 'hidden') releaseLease();
    };
    const pageShowHandler = () => claimLease();

    const existing = readLease();
    const anotherTabIsLive = Boolean(
      existing.tabId && existing.tabId !== TAB_ID && Date.now() - (existing.updatedAt || 0) < LEASE_STALE_MS,
    );
    if (anotherTabIsLive) {
      void logout();
      navigate('/login', { replace: true });
      return;
    }

    claimLease();
    const heartbeat = window.setInterval(claimLease, 1500);

    window.addEventListener('pagehide', pageHideHandler);
    document.addEventListener('visibilitychange', visibilityHandler);
    window.addEventListener('pageshow', pageShowHandler);

    return () => {
      window.removeEventListener('pagehide', pageHideHandler);
      document.removeEventListener('visibilitychange', visibilityHandler);
      window.removeEventListener('pageshow', pageShowHandler);
      window.clearInterval(heartbeat);
      releaseLease();
    };
  }, [logout, navigate]);

  const continueSession = useCallback(() => {
    schedule();
  }, [schedule]);

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6">
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Session Expiring Soon</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              You've been inactive. For your security you'll be signed out in{' '}
              <span className="font-bold text-slate-900 dark:text-white">{secondsLeft}s</span> unless you continue.
            </p>
          </div>
        </div>
        <div className="mt-6">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Auto sign-out countdown</span>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{secondsLeft}s</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-1000"
              style={{ width: `${(secondsLeft / Math.round(WARNING_AHEAD_MS / 1000)) * 100}%` }}
            />
          </div>
        </div>
        <div className="pt-6 flex gap-3">
          <button
            type="button"
            onClick={() => { void logout(); navigate('/login', { replace: true }); }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
          <button
            type="button"
            onClick={continueSession}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            Continue Session
          </button>
        </div>
      </div>
    </div>
  );
}