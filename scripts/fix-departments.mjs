import { readFileSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, deleteDoc, addDoc, updateDoc } from 'firebase/firestore';

const FACULTY_NAME = 'HEALTH SCI. & TECH.';

const TARGET_DEPARTMENTS = [
  { name: 'Community Health', code: 'CHEW' },
  { name: 'Medical Laboratory Technician', code: 'MLT' },
  { name: 'Pharmacy Technician', code: 'PHT' },
  { name: 'Health Information Management', code: 'HIM' },
  { name: 'Health Education Technician', code: 'HET' },
  { name: 'Health Caregivers', code: 'HCG' },
];

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

function ask(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (answer) => {
    rl.close();
    resolve(answer.trim());
  }));
}

function matches(className, deptName) {
  const c = className.toLowerCase();
  const d = deptName.toLowerCase();
  return c.includes(d) || d.includes(c);
}

async function main() {
  const config = loadConfig();
  if (!config.apiKey) throw new Error('Could not read .env firebase config.');

  const email = process.env.ADMIN_EMAIL || (await ask('Admin email: '));
  const password = process.env.ADMIN_PASSWORD || (await ask('Admin password: '));

  const app = initializeApp(config);
  const auth = getAuth(app);
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  const db = getFirestore(app);
  console.log(`Signed in as ${user.email} (${user.uid})\n`);

  const facultySnap = await getDocs(collection(db, 'faculties'));
  const faculty = facultySnap.docs.find(
    (d) => (d.data().name || '').toLowerCase() === FACULTY_NAME.toLowerCase(),
  );
  if (!faculty) throw new Error(`Faculty "${FACULTY_NAME}" not found in faculties collection.`);
  console.log(`Faculty: ${faculty.id} (${faculty.data().name})\n`);

  const deptSnap = await getDocs(collection(db, 'departments'));
  console.log(`Current departments (${deptSnap.size}):`);
  for (const d of deptSnap.docs) {
    console.log(`  - ${d.id}  ${d.data().name || '(no name)'}  (faculty: ${d.data().facultyId || 'none'})`);
  }

  const classesSnap = await getDocs(collection(db, 'classes'));
  console.log(`\nClasses found (${classesSnap.size}):`);
  for (const c of classesSnap.docs) {
    const d = c.data();
    console.log(`  - ${c.id}  ${d.name || '(no name)'}  (faculty: ${d.facultyId || 'none'}, dept: ${d.departmentId || 'none'})`);
  }

  console.log(`\nPlan: delete all ${deptSnap.size} existing departments and create ${TARGET_DEPARTMENTS.length} correct ones under "${FACULTY_NAME}".`);
  const confirm = await ask('Type YES to proceed (or anything else to abort): ');
  if (confirm !== 'YES') {
    console.log('Aborted. No changes were made.');
    return;
  }

  for (const d of deptSnap.docs) {
    await deleteDoc(d.ref);
    console.log(`Deleted department ${d.id}`);
  }

  const created = [];
  for (const t of TARGET_DEPARTMENTS) {
    const ref = await addDoc(collection(db, 'departments'), {
      name: t.name,
      code: t.code,
      headName: '',
      facultyId: faculty.id,
    });
    created.push({ id: ref.id, ...t });
    console.log(`Created department ${ref.id} ${t.name} (${t.code}) -> ${FACULTY_NAME}`);
  }

  let relinked = 0;
  for (const c of classesSnap.docs) {
    const data = c.data();
    const className = data.name || '';
    const match = created.find((dep) => matches(className, dep.name));
    const patch = {};
    if (data.facultyId !== faculty.id) patch.facultyId = faculty.id;
    if (match && data.departmentId !== match.id) patch.departmentId = match.id;
    if (Object.keys(patch).length > 0) {
      await updateDoc(c.ref, patch);
      relinked += 1;
      console.log(`Relinked class ${c.id} (${className}) -> dept ${match ? match.name + ' (' + match.id + ')' : 'unchanged'}, faculty ${faculty.id}`);
    }
  }
  console.log(`\nRelinked ${relinked} class(es).`);
  console.log('Done.');
}

main().catch((error) => {
  console.error('\nError:', error.message || error);
  process.exitCode = 1;
});
