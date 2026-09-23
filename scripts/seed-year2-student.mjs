// Seeds ONE clearly-labelled Year-2 (continuing) test student into the live
// Firestore `students` collection so it appears in every registrar / admin
// continuing-student surface (Registrar directory, Admin directory, Registrar
// dashboard "Recent Students") for end-to-end testing of fee payment and the
// admission-letter / ID-card grant toggles.
//
// The store has NO static student seed (useDataStore.ts initialises
// `students: []` and hydrates from Firestore `subscribeToCollection`), so the
// seed is a Firestore write — the exact mechanism the deployed app reads.
//
// Usage (from the repo root):
//   ADMIN_PASSWORD=<password> node scripts/seed-year2-student.mjs
//   or, to re-use the local `firebase login` credentials instead:
//   FIREBASE_TOOLS_JSON="%USERPROFILE%\.config\configstore\firebase-tools.json" node scripts/seed-year2-student.mjs
//
// The script is idempotent: it skips when a student with the fixed regNo
// `REG-TEST-Y2-001` already exists.

import { readFileSync, existsSync } from 'node:fs';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, setDoc, doc, query, where } from 'firebase/firestore';

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

const STUDENT_ID = 'REG-TEST-Y2-001';
const REG_NO = 'REG-TEST-Y2-001';

/**
 * Shape mirrors buildStudentPayloadFromApplication() (src/utils/applicantMapper.ts)
 * plus the required `Student` interface fields and the shared document-access
 * flag. `dateOfAdmission` is BEFORE the current session start, so fee-gating
 * ("isNewEntrantStudent") treats this record as a continuing student and skips
 * new-entrant-only fees — exactly like a real Year-2 student.
 */
const TEST_YEAR2_STUDENT = {
  id: STUDENT_ID,
  name: 'Ade Test Year Two',
  email: 'adetestyear2@brochest.test',
  regNo: REG_NO,
  admissionNumber: 'BRC/CHW/2024/Y2-001',
  matricNumber: 'BRC/CHW/2024/Y2-001',
  class: 'Computer Science',
  level: 'Year 2',
  parentName: 'Mrs. Bisi Test',
  status: 'Active',
  surname: 'Ade',
  firstName: 'Test',
  middleName: 'Year Two',
  gender: 'Male',
  dateOfBirth: '2005-03-14',
  placeOfBirth: 'Ikare',
  nationality: 'Nigerian',
  stateOfOrigin: 'Ondo',
  lga: 'Akoko North-West',
  state: 'Ondo',
  townCity: 'Ikare-Akoko',
  maritalStatus: 'Single',
  phone: '08030000001',
  residentialAddress: '12 Test Street, Ikare-Akoko, Ondo State',
  sponsorName: 'Mrs. Bisi Test',
  sponsorPhone: '08030000002',
  sponsorEmail: 'testguardian@example.com',
  sponsorOccupation: 'Civil Servant',
  guardianName: 'Mrs. Bisi Test',
  guardianRelationship: 'Mother',
  guardianPhone: '08030000002',
  guardianAddress: '12 Test Street, Ikare-Akoko',
  previousSchoolName: 'Federal Polytechnic, Ado-Ekiti',
  classDepartment: 'Computer Science',
  department: 'Computer Science',
  programme: 'Computer Science',
  portalLevel: 'College',
  feeCategory: '',
  feePaymentPlan: 'Full Payment',
  dateOfAdmission: '2024-09-16',
  admissionStatus: 'Admitted',
  academicSession: '2026/2027',
  semester: 'First Semester',
  // Shared document-access gate: view-only until a Registrar/Admin grants print
  // access. The single grant toggle unlocks BOTH the admission letter and the
  // student ID card print.
  admissionLetterAccessGranted: false,
};

async function main() {
  const config = loadConfig();
  if (!config.apiKey) throw new Error('Could not read the .env firebase config.');

  const app = initializeApp(config);
  const db = getFirestore(app);

  if (process.env.FIREBASE_TOOLS_JSON && existsSync(process.env.FIREBASE_TOOLS_JSON)) {
    const tokens = JSON.parse(readFileSync(process.env.FIREBASE_TOOLS_JSON, 'utf8')).tokens;
    const { access_token, projectId } = await getFreshAccessToken(tokens, config.projectId);
    await seedViaRest(access_token, projectId);
    return;
  }

  const email = process.env.ADMIN_EMAIL || 'edumachine.school@gmail.com';
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error('Set ADMIN_PASSWORD env var (or FIREBASE_TOOLS_JSON to re-use firebase login).');

  const { user } = await signInWithEmailAndPassword(getAuth(app), email, password);
  console.log(`Signed in as ${user.email}`);

  const existing = await getDocs(
    query(collection(db, 'students'), where('regNo', '==', REG_NO)),
  );
  if (!existing.empty) {
    console.log(`Skipping — test student already exists (${existing.docs[0].id}).`);
    return;
  }

  await setDoc(doc(db, 'students', STUDENT_ID), { ...TEST_YEAR2_STUDENT, id: STUDENT_ID });
  console.log(`Seeded Year-2 test student ${TEST_YEAR2_STUDENT.name} (${REG_NO}).`);
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

async function seedViaRest(accessToken, projectId) {
  const fields = {};
  for (const [key, value] of Object.entries(TEST_YEAR2_STUDENT)) {
    fields[key] = typeof value === 'boolean' ? { booleanValue: value } : { stringValue: String(value) };
  }

  const existing = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/students?pageSize=1`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  ).then((r) => r.json());

  const already = existing.documents?.some((d) => d.fields?.regNo?.stringValue === REG_NO);
  if (already) {
    console.log(`Skipping — test student already exists (${REG_NO}).`);
    return;
  }

  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/students?documentId=${encodeURIComponent(STUDENT_ID)}`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields }),
    },
  );
  const body = await res.json();
  if (!res.ok) throw new Error(`Firestore create failed: ${JSON.stringify(body)}`);
  console.log(`Seeded Year-2 test student ${TEST_YEAR2_STUDENT.name} (${REG_NO}) via Firestore REST.`);
}

main().catch((e) => {
  console.error('\nError:', e.message || e);
  process.exit(1);
});