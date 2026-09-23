// Provisions a REAL Firebase Auth login for the Year-2 (continuing) demo
// student "Ade Test Year Two" (students/REG-TEST-Y2-001) so the deployed
// portal can sign in as that seeded student for an end-to-end Paystack fee
// payment test.
//
// All operations are idempotent. The script NEVER creates or modifies a
// Firebase Auth account unless `accounts:signInWithPassword` for the demo
// email returns EMAIL_NOT_FOUND (i.e. the account truly does not exist):
//   - EMAIL_NOT_FOUND            -> create via identitytoolkit accounts:signUp
//   - any other auth error (e.g. INVALID_LOGIN_CREDENTIALS: the email already
//     exists under a different/unknown password) -> AUTH IS BLOCKED; the
//     script does NOT touch the existing account, and reports it loudly.
// Either way the script also stamps `students/REG-TEST-Y2-001.email` =
// AUTH_EMAIL (the prescribed data fix so the portal resolves the demo login
// to Ade Test Year Two).
//
// Usage (from the repo root), mirroring seed-year2-student.mjs:
//   FIREBASE_TOOLS_JSON="%USERPROFILE%\.config\configstore\firebase-tools.json" node scripts/seed-auth-year2.mjs
//   or
//   ADMIN_PASSWORD=<password> node scripts/seed-auth-year2.mjs

import { readFileSync, existsSync } from 'node:fs';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

const AUTH_EMAIL = 'year2test@myskulboot.web.app';
const AUTH_PASSWORD = 'Test@Year2#2026';
const STUDENT_ID = 'REG-TEST-Y2-001';
const STUDENT_NAME = 'Ade Test Year Two';

function loadConfig() {
  const raw = readFileSync(new URL('../.env', import.meta.url), 'utf8');
  const cfg = {};
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) cfg[m[1]] = m[2].trim();
  }
  return {
    apiKey: cfg.VITE_FIREBASE_API_KEY,
    authDomain: cfg.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: cfg.VITE_FIREBASE_PROJECT_ID,
    storageBucket: cfg.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: cfg.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: cfg.VITE_FIREBASE_APP_ID,
  };
}

async function identitytoolkit(config, path, body) {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/${path}?key=${config.apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );
  const json = await res.json();
  if (!res.ok) {
    const message = json?.error?.message || `HTTP ${res.status}`;
    return { ok: false, code: message, detail: json };
  }
  return { ok: true, data: json };
}

async function signIn(config) {
  return identitytoolkit(config, 'accounts:signInWithPassword', {
    email: AUTH_EMAIL,
    password: AUTH_PASSWORD,
    returnSecureToken: true,
  });
}

// Returns { uid|null, created, blocked?: true } — creates ONLY on EMAIL_NOT_FOUND.
async function ensureAuthUser(config) {
  const existing = await signIn(config);
  if (existing.ok) {
    return { uid: existing.data.localId, email: existing.data.email, created: false };
  }
  if (existing.code === 'EMAIL_NOT_FOUND') {
    const created = await identitytoolkit(config, 'accounts:signUp', {
      email: AUTH_EMAIL,
      password: AUTH_PASSWORD,
      returnSecureToken: true,
    });
    if (!created.ok) throw new Error(`signUp failed: ${created.code}`);
    return { uid: created.data.localId, email: created.data.email, created: true };
  }
  // Account already exists under an unknown password / disabled state. We must
  // NOT hijack it. Report the blocker; the caller can still stamp the student
  // email (a Firestore data fix, not an auth change).
  return { uid: null, email: AUTH_EMAIL, created: false, blocked: true, code: existing.code };
}

async function getFreshAccessToken(tokens, projectId) {
  const nowMs = Date.now();
  if (tokens.access_token && tokens.expires_at > nowMs + 60_000) {
    return { access_token: tokens.access_token, projectId };
  }
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.FIREBASE_CLIENT_ID || '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com',
      client_secret: process.env.FIREBASE_CLIENT_SECRET || '',
      refresh_token: tokens.refresh_token,
      grant_type: 'refresh_token',
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Token refresh failed: ${JSON.stringify(json)}`);
  return { access_token: json.access_token, projectId };
}

const field = (value) => {
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') return { integerValue: String(value) };
  return { stringValue: String(value) };
};

async function ensureUsersDocRest(accessToken, projectId, uid, schoolName) {
  const url =
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${encodeURIComponent(uid)}` +
    '?updateMask.fieldPaths=uid&updateMask.fieldPaths=name&updateMask.fieldPaths=email&updateMask.fieldPaths=role' +
    '&updateMask.fieldPaths=roleLabel&updateMask.fieldPaths=schoolName&updateMask.fieldPaths=phone' +
    '&updateMask.fieldPaths=isVerified&updateMask.fieldPaths=portalLevel&updateMask.fieldPaths=createdAt';
  const body = {
    fields: {
      uid: field(uid),
      name: field(STUDENT_NAME),
      email: field(AUTH_EMAIL),
      role: field('STUDENT'),
      roleLabel: field('Student'),
      schoolName: field(schoolName),
      phone: field('08030000001'),
      isVerified: field(false),
      portalLevel: field('College'),
      createdAt: field(new Date().toISOString()),
    },
  };
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`users doc write failed: ${JSON.stringify(await res.json())}`);
}

async function ensureStudentEmailRest(accessToken, projectId) {
  const url =
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/students/${encodeURIComponent(STUDENT_ID)}` +
    '?updateMask.fieldPaths=email';
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: { email: field(AUTH_EMAIL) } }),
  });
  if (!res.ok) throw new Error(`students email write failed: ${JSON.stringify(await res.json())}`);

  const check = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/students/${encodeURIComponent(STUDENT_ID)}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  const checkJson = await check.json();
  if (!check.ok) throw new Error(`students read failed: ${JSON.stringify(checkJson)}`);
  const email = checkJson.fields?.email?.stringValue;
  const name = checkJson.fields?.name?.stringValue;
  if (email !== AUTH_EMAIL) throw new Error(`student email not persisted (got "${email}")`);
  return { email, name };
}

async function resolveSchoolNameRest(accessToken, projectId, fallback) {
  try {
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/schools`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    const json = await res.json();
    const name = json?.documents?.map((d) => d.fields?.name?.stringValue).find(Boolean);
    return name || fallback;
  } catch {
    return fallback;
  }
}

async function seedViaRest(tokens, projectId) {
  const { access_token } = await getFreshAccessToken(tokens, projectId);
  const config = loadConfig();
  const authResult = await ensureAuthUser(config);

  const schoolName = await resolveSchoolNameRest(access_token, projectId, 'myskulboot');

  if (authResult.uid) {
    await ensureUsersDocRest(access_token, projectId, authResult.uid, schoolName);
  }
  const student = await ensureStudentEmailRest(access_token, projectId);

  if (authResult.uid) {
    const verify = await signIn(config);
    if (!verify.ok) throw new Error(`verification signIn failed: ${verify.code}`);
    console.log(`[seed] auth ${authResult.created ? 'CREATED' : 'EXISTS'} (uid=${authResult.uid}, email=${authResult.email})`);
    console.log(`[seed] users/${authResult.uid} ensured: role=STUDENT, schoolName=${schoolName}`);
    console.log(`Verification: signInWithPassword OK uid=${verify.data.localId} email=${verify.data.email}`);
  } else {
    console.log(`[seed] AUTH BLOCKED: signInWithPassword failed with "${authResult.code}".`);
    console.log(`[seed] The Firebase Auth account ${AUTH_EMAIL} already exists under a different/unknown password.`);
    console.log(`[seed] NOT creating and NOT modifying that account (per EMAIL_NOT_FOUND-only policy).`);
    console.log(`[seed] To finish provisioning: delete that orphaned Auth user in Firebase Console (Authentication -> Users) for project ${projectId}, then re-run this script.`);
  }
  console.log(`[seed] students/${STUDENT_ID} name="${student.name}" email now "${student.email}"`);
}

async function seedViaSdk(config) {
  const email = process.env.ADMIN_EMAIL || 'edumachine.school@gmail.com';
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error('Set ADMIN_PASSWORD env var (or FIREBASE_TOOLS_JSON to re-use firebase login).');

  const app = initializeApp(config);
  const auth = getAuth(app);
  const db = getFirestore(app);

  await signInWithEmailAndPassword(auth, email, password);
  console.log(`[seed] signed in as ${email}`);

  const authResult = await ensureAuthUser(config);

  if (authResult.uid) {
    await setDoc(
      doc(db, 'users', authResult.uid),
      {
        uid: authResult.uid,
        name: STUDENT_NAME,
        email: AUTH_EMAIL,
        role: 'STUDENT',
        roleLabel: 'Student',
        schoolName: 'myskulboot',
        phone: '08030000001',
        isVerified: false,
        portalLevel: 'College',
        createdAt: new Date().toISOString(),
      },
      { merge: true },
    );
  }
  await setDoc(doc(db, 'students', STUDENT_ID), { email: AUTH_EMAIL }, { merge: true });

  const studentDoc = await getDoc(doc(db, 'students', STUDENT_ID));
  if (!studentDoc.exists()) throw new Error('students/REG-TEST-Y2-001 not found after update.');
  const studentEmail = studentDoc.data()?.email;
  if (studentEmail !== AUTH_EMAIL) throw new Error(`student email not persisted (got "${studentEmail}")`);

  if (authResult.uid) {
    const verify = await signIn(config);
    if (!verify.ok) throw new Error(`verification signIn failed: ${verify.code}`);
    console.log(`[seed] auth ${authResult.created ? 'CREATED' : 'EXISTS'} (uid=${authResult.uid}, email=${authResult.email})`);
    console.log(`[seed] users/${authResult.uid} ensured: role=STUDENT`);
    console.log(`Verification: signInWithPassword OK uid=${verify.data.localId} email=${verify.data.email}`);
  } else {
    console.log(`[seed] AUTH BLOCKED: signInWithPassword failed with "${authResult.code}".`);
    console.log(`[seed] The Firebase Auth account ${AUTH_EMAIL} already exists under a different/unknown password.`);
    console.log(`[seed] NOT creating and NOT modifying that account (per EMAIL_NOT_FOUND-only policy).`);
    console.log(`[seed] To finish provisioning: delete that orphaned Auth user in Firebase Console (Authentication -> Users) for project ${config.projectId}, then re-run this script.`);
  }
  console.log(`[seed] students/${STUDENT_ID} email now "${studentEmail}"`);
}

async function main() {
  const config = loadConfig();
  if (!config.apiKey) throw new Error('Could not read the .env firebase config.');

  if (process.env.FIREBASE_TOOLS_JSON && existsSync(process.env.FIREBASE_TOOLS_JSON)) {
    const tokens = JSON.parse(readFileSync(process.env.FIREBASE_TOOLS_JSON, 'utf8')).tokens;
    const { projectId } = tokens;
    await seedViaRest(tokens, config.projectId || projectId);
    return;
  }

  await seedViaSdk(config);
}

main().catch((e) => {
  console.error('\nError:', e.message || e);
  process.exit(1);
});