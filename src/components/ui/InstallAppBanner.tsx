import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Plus, Share, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

declare global {
  interface Window {
    __deferredInstallPrompt?: BeforeInstallPromptEvent | null;
  }
}

const DISMISS_KEY = 'brochest-install-banner-dismissed';
const DISMISS_DAYS = 7;

const isStandalone = () => {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
};

const isIOS = () => {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return true;
  return window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1;
};

const isDismissed = () => {
  try {
    const raw = window.localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    return Number.isFinite(ts) && Date.now() - ts < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
};

export default function InstallAppBanner() {
  const [visible, setVisible] = useState(false);
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (isStandalone() || isDismissed()) return;

    const iosDevice = isIOS();
    setIos(iosDevice);

    const existing = window.__deferredInstallPrompt;
    if (existing) {
      setPrompt(existing);
      setVisible(true);
    }

    const onPromptReady = () => {
      const deferred = window.__deferredInstallPrompt;
      if (deferred) {
        setPrompt(deferred);
        setVisible(true);
      }
    };
    const onInstalled = () => {
      setVisible(false);
      setPrompt(null);
      window.__deferredInstallPrompt = null;
    };

    window.addEventListener('installpromptready', onPromptReady);
    window.addEventListener('appinstalled', onInstalled);

    // iOS Safari never fires beforeinstallprompt, so surface the manual steps.
    if (iosDevice) setVisible(true);

    return () => {
      window.removeEventListener('installpromptready', onPromptReady);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const dismiss = useCallback(() => {
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // ignore storage failures (private mode)
    }
    setVisible(false);
  }, []);

  const install = useCallback(async () => {
    if (!prompt) {
      setShowHelp(true);
      return;
    }
    await prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === 'accepted') {
      window.__deferredInstallPrompt = null;
      setVisible(false);
    }
  }, [prompt]);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 sm:inset-x-auto sm:right-4 sm:pb-4"
      role="dialog"
      aria-label="Install the BROCHEST app"
    >
      <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800 sm:w-[380px]">
        <div className="flex items-start gap-3 p-4">
          <img src="/icon-192.png" alt="" className="h-12 w-12 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1 pr-6">
            <p className="text-sm font-bold text-slate-900 dark:text-white">Get the BROCHEST app</p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Install the portal on your device for faster, full-screen access straight from your home screen.
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss"
            className="absolute right-3 top-3 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {showHelp && (
          <div className="mx-4 mb-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-900/40 dark:text-slate-300">
            {ios ? (
              <ol className="space-y-1.5">
                <li className="flex items-center gap-2">
                  <Share className="h-3.5 w-3.5 shrink-0 text-blue-500" /> Tap the <strong>Share</strong> icon in
                  Safari&rsquo;s toolbar.
                </li>
                <li className="flex items-center gap-2">
                  <Plus className="h-3.5 w-3.5 shrink-0 text-blue-500" /> Choose <strong>Add to Home Screen</strong>.
                </li>
                <li className="flex items-center gap-2">
                  <Download className="h-3.5 w-3.5 shrink-0 text-blue-500" /> Tap <strong>Add</strong> — the app
                  appears on your home screen.
                </li>
              </ol>
            ) : (
              <ol className="space-y-1.5">
                <li>1. Open your browser menu (the ⋮ or ☰ button).</li>
                <li>
                  2. Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>.
                </li>
                <li>3. Confirm to add BROCHEST to your device.</li>
              </ol>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 px-4 pb-4">
          <button
            type="button"
            onClick={install}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            {prompt ? 'Install app' : 'How to install'}
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Not now
          </button>
        </div>
      </div>
    </motion.div>
  );
}
