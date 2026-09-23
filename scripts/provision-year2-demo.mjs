import { readFileSync, existsSync } from 'node:fs';

const PASSWORD = 'Test@Year2#2026';
const ORPHAN_EMAIL = 'year2test@myskulboot.web.app';
const CANDIDATES = [
  'y2test@myskulboot.web.app',
  'year2demo@myskulboot.web.app',
  'y2demo@myskulboot.web.app',
];
const STUDENT_ID = 'REG-TEST-Y2-001';
const STUDENT_NAME = 'Ade Test Year Two';

function loadConfig() {
  const raw = readFileSync(new URL('../.env', import.meta.url), 'utf8');
  const cfg = {};
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) cfg[m[1]] = m[2].trim();
  }
  return cfg;
}

async function identitytoolkit(config, path, body) {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/${path}?key=${config.VITE_FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );
  const json = await res.json();
  if (!res.ok) return { ok: false, code: json?.error?.message || `HTTP ${res.status}`, detail: json };
  return { ok: true, data: json };
}

async function signInProbe(config, email) {
  const r = await identitytoolkit(config, 'accounts:signInWithPassword', {
    email,
    password: PASSWORD,
    returnSecureToken: true,
  });
  if (r.ok) return { exists: true, matched: true, uid: r.data.localId };
  if (r.code === 'EMAIL_NOT_FOUND') return { exists: false, code: r.code };
  return { exists: true, matched: false, code: r.code };
}

function tokensFromJson() {
  const explicit = process.env.FIREBASE_TOOLS_JSON;
  const path =
    explicit && existsSync(explicit)
      ? explicit
      : `${process.env.USERPROFILE || process.env.HOME}\\.config\\configstore\\firebase-tools.json`;
  if (!existsSync(path)) throw new Error('No FIREBASE_TOOLS_JSON found; cannot reach Firestore.');
  return { path, tokens: JSON.parse(readFileSync(path, 'utf8')).tokens };
}

async function getFreshAccessToken(tokens) {
  const nowMs = Date.now();
  if (tokens.access_token && tokens.expires_at > nowMs + 60_000) {
    return { access_token: tokens.access_token };
  }
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:
        process.env.FIREBASE_CLIENT_ID ||
        '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com',
      client_secret: process.env.FIREBASE_CLIENT_SECRET || '',
      refresh_token: tokens.refresh_token,
      grant_type: 'refresh_token',
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Token refresh failed: ${JSON.stringify(json)}`);
  return { access_token: json.access_token };
}

const field = (value) => {
  if (typeof value === 'boolean') return { booleanValue: value };
  return { stringValue: String(value) };
};

async function patchStudentsEmail(at, projectId, email) {
  const url =
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/students/${encodeURIComponent(STUDENT_ID)}` +
    '?updateMask.fieldPaths=email';
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${at}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: { email: field(email) } }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`students email PATCH failed: ${JSON.stringify(body)}`);
  const get = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/students/${encodeURIComponent(STUDENT_ID)}`,
    { headers: { Authorization: `Bearer ${at}` } },
  );
  const got = await get.json();
  if (!get.ok) throw new Error(`students GET failed: ${JSON.stringify(got)}`);
  const persisted = got.fields?.email?.stringValue;
  if (persisted !== email) throw new Error(`students email not persisted (got "${persisted}")`);
  return persisted;
}

async function resolveSchoolName(at, projectId) {
  try {
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/schools`,
      { headers: { Authorization: `Bearer ${at}` } },
    );
    const json = await res.json();
    const name = json?.documents?.map((d) => d.fields?.name?.stringValue).find(Boolean);
    return name || 'myskulboot';
  } catch {
    return 'myskulboot';
  }
}

async function patchUsersDoc(at, projectId, uid, email, schoolName) {
  const url =
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${encodeURIComponent(uid)}` +
    '?updateMask.fieldPaths=uid&updateMask.fieldPaths=name&updateMask.fieldPaths=email' +
    '&updateMask.fieldPaths=role&updateMask.fieldPaths=roleLabel&updateMask.fieldPaths=schoolName' +
    '&updateMask.fieldPaths=phone&updateMask.fieldPaths=isVerified&updateMask.fieldPaths=portalLevel' +
    '&updateMask.fieldPaths=createdAt';
  const body = {
    fields: {
      uid: field(uid),
      name: field(STUDENT_NAME),
      email: field(email),
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
    headers: { Authorization: `Bearer ${at}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const resBody = await res.json();
  if (!res.ok) throw new Error(`users doc PATCH failed: ${JSON.stringify(resBody)}`);
  const get = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${encodeURIComponent(uid)}`,
    { headers: { Authorization: `Bearer ${at}` } },
  );
  const got = await get.json();
  if (!get.ok) throw new Error(`users doc GET failed: ${JSON.stringify(got)}`);
  const f = got.fields;
  return { role: f?.role?.stringValue, email: f?.email?.stringValue };
}

async function main() {
  const config = loadConfig();
  if (!config.VITE_FIREBASE_API_KEY) throw new Error('Could not read .env firebase config.');
  const projectId = config.VITE_FIREBASE_PROJECT_ID || 'myskulboot';

  const lookupAttempt = await identitytoolkit(config, 'accounts:lookup', {
    email: ORPHAN_EMAIL,
  });
  console.log(`ORPHAN accounts:lookup[byEmail] real response: ${lookupAttempt.ok ? JSON.stringify(lookupAttempt.data) : lookupAttempt.code}`);

  const orphan = await signInProbe(config, ORPHAN_EMAIL);
  if (orphan.exists) {
    console.log(`ORPHAN EXISTS email=${ORPHAN_EMAIL} passwordMismatch=${!orphan.matched} signInCode=${orphan.code} uid=UNOBTAINABLE-via-public-REST emailVerified=UNOBTAINABLE-via-public-REST`);
  } else {
    console.log(`ORPHAN not found: EMAIL_NOT_FOUND (no longer exists)`);
  }

  let winning = null;
  let uid = null;
  for (const email of CANDIDATES) {
    const attempt = await identitytoolkit(config, 'accounts:signUp', {
      email,
      password: PASSWORD,
      returnSecureToken: true,
    });
    if (attempt.ok) {
      winning = email;
      uid = attempt.data.localId;
      console.log(`LOOKUP ${email} -> signUp OK (was free, created)`);
      break;
    }
    console.log(`LOOKUP ${email} -> signUp ${attempt.code}; taken, trying next`);
  }
  if (!winning) {
    console.log('NO-CREATE: all demo candidates are taken; refusing to overwrite any existing account.');
    console.log('[see above] signUp returned EMAIL_EXISTS for every candidate.');
    process.exit(1);
  }
  console.log(`WINNER ${winning}`);
  console.log(`SIGNUP-OK uid=${uid} email=${winning}`);

  const verify = await identitytoolkit(config, 'accounts:signInWithPassword', {
    email: winning,
    password: PASSWORD,
    returnSecureToken: true,
  });
  if (!verify.ok) {
    console.log(`SIGNIN after signUp FAILED: ${verify.code}`);
    console.log(JSON.stringify(verify.detail));
    process.exit(1);
  }
  console.log(`SIGNIN-OK uid=${verify.data.localId} email=${verify.data.email} emailVerified=${verify.data.emailVerified} ${verify.data.emailVerified ? '' : '(unverified email - signIn still works)'}`);

  const { tokens } = tokensFromJson();
  const { access_token: at } = await getFreshAccessToken(tokens);

  const persisted = await patchStudentsEmail(at, projectId, winning);
  console.log(`STUDENT-EMAIL-OK students/${STUDENT_ID} email=${persisted}`);

  const schoolName = await resolveSchoolName(at, projectId);
  const usersDoc = await patchUsersDoc(at, projectId, uid, winning, schoolName);
  console.log(`USERS-DOC-OK users/${uid} role=${usersDoc.role} email=${usersDoc.email} schoolName=${schoolName}`);

  console.log(`credentials for the user: ${winning} / ${PASSWORD}`);
}

main().catch((e) => {
  console.error('\nError:', e.message || e);
  process.exit(1);
});