const NETWORK_RE =
  /auth\/network-request-failed|auth\/network-error|network request failed|network error|network timeout|failed to fetch|fetch failed|unable to reach|unable to connect|could not reach|connection (was|is) (interrupted|reset|refused)|client is offline|you are offline|internet connection|is offline|err_network|enotfound|econn(const|refused|reset)|took too long/i;

const AUTH_CODE_MESSAGES: Record<string, string> = {
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/operation-not-allowed': 'This sign-in option is not available right now. Please try another method.',
  'auth/requires-recent-login': 'For security, please sign in again before making this change.',
  'auth/internal-error': 'Something went wrong. Please try again.',
  'auth/account-exists-with-different-credential': 'An account already exists with this email address.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-disabled': 'This account has been disabled. Please contact your administrator.',
  'auth/expired-action-code': 'This link has expired. Please request a new one.',
  'auth/invalid-action-code': 'This link is invalid or has already been used.',
  'auth/invalid-verification-code': 'The verification code you entered is incorrect.',
  'auth/missing-verification-code': 'Please enter your verification code.',
  'auth/quota-exceeded': 'Our system is busy right now. Please try again shortly.',
  'auth/app-deleted': 'This session is no longer valid. Please sign out and sign back in.',
};

const STORAGE_CODE_MESSAGES: Record<string, string> = {
  'storage/unauthorized': 'You do not have permission to upload this file.',
  'storage/quota-exceeded': 'Storage limit reached. Please contact your administrator.',
  'storage/object-not-found': 'The file you are looking for was not found.',
  'storage/invalid-argument': 'The file could not be processed. Please choose a different file.',
};

const FIRESTORE_CODE_MESSAGES: Record<string, string> = {
  'permission-denied': 'You do not have permission to perform this action.',
  'resource-exhausted': 'Too many requests. Please try again shortly.',
  unavailable: "We couldn't reach our servers. Please check your internet connection and try again.",
};

function stripFirebasePrefix(message: string): string {
  return message
    .replace(/^Firebase:\s*/i, '')
    .replace(/\s*\((auth|storage|internal)\/[^)]*\)\.?\s*$/i, '')
    .replace(/\s*\[cloaked\]/i, '')
    .trim();
}

/**
 * Maps Firebase/Auth/Firestore/Storage errors to friendly, human-readable
 * messages so users never see raw platform errors like
 * "Firebase: Error (auth/network-request-failed)."
 */
export function friendlyErrorMessage(error: unknown, fallback: string): string {
  const err = (error ?? {}) as { code?: unknown; message?: unknown };
  const code = typeof err.code === 'string' ? err.code : '';
  const message = typeof err.message === 'string' ? err.message : '';

  if (NETWORK_RE.test(code) || NETWORK_RE.test(message)) {
    return "We couldn't reach our servers. Please check your internet connection and try again.";
  }

  const mapped =
    AUTH_CODE_MESSAGES[code] ??
    STORAGE_CODE_MESSAGES[code] ??
    FIRESTORE_CODE_MESSAGES[code];
  if (mapped) return mapped;

  return stripFirebasePrefix(message) || fallback;
}