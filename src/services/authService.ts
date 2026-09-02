import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  onAuthStateChanged,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword as firebaseUpdatePassword,
  deleteUser,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';

export interface FirestoreUser {
  uid: string;
  name: string;
  email: string;
  role: string;
  roleLabel: string;
  schoolName: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
  isTwoFactorEnabled?: boolean;
  isVerified: boolean;
  portalLevel?: string;
  createdAt: unknown;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function writeDocWithRetry(write: () => Promise<void>): Promise<void> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await write();
      return;
    } catch (error) {
      lastError = error;
      const err = error as { code?: string; message?: string };
      const retryable =
        err.code === 'permission-denied' ||
        /permission-denied|network-error|network timeout/i.test(err.message || '');
      if (attempt < 2 && retryable) {
        await sleep(2000);
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

export async function registerUser(
  email: string,
  password: string,
  name: string,
  role: string,
  roleLabel: string,
  schoolName: string,
  phone?: string,
  portalLevel?: string,
  surname?: string,
  firstName?: string,
  middleName?: string,
): Promise<{ success: boolean; error?: string }> {
  let createdUser: FirebaseUser | null = null;
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    createdUser = userCredential.user;

    await writeDocWithRetry(() =>
      setDoc(doc(db, 'users', createdUser!.uid), {
        uid: createdUser!.uid,
        name,
        email,
        role,
        roleLabel,
        schoolName,
        phone: phone || '',
        isVerified: false,
        portalLevel: portalLevel || '',
        createdAt: serverTimestamp(),
      } satisfies FirestoreUser),
    );

    if (role === 'STUDENT') {
      await writeDocWithRetry(() =>
        setDoc(doc(db, 'students', createdUser!.uid), {
          id: createdUser!.uid,
          name,
          surname: surname || '',
          firstName: firstName || '',
          middleName: middleName || '',
          email,
          phone: phone || '',
          regNo: '',
          class: '',
          parentName: '',
          status: 'Active',
          portalLevel: portalLevel || 'Secondary',
        }),
      );
    }

    if (role === 'TEACHER') {
      await writeDocWithRetry(() =>
        setDoc(doc(db, 'teachers', createdUser!.uid), {
          id: createdUser!.uid,
          name,
          email,
          phone: phone || '',
          employeeId: '',
          subject: '',
          status: 'Active',
        }),
      );
    }

    try {
      await sendEmailVerification(createdUser!);
    } catch (mailError: unknown) {
      console.warn('[authService] Email verification send failed (account remains active):', mailError);
    }

    return { success: true };
  } catch (error: unknown) {
    if (createdUser) {
      try {
        await deleteUser(createdUser);
      } catch (rollbackError) {
        console.warn('[authService] Could not roll back newly created account:', rollbackError);
      }
    }
    const err = error as { code?: string };
    if (err.code === 'auth/email-already-in-use') {
      return { success: false, error: 'An account with this email already exists.' };
    }
    return { success: false, error: (error as Error).message || 'Registration failed.' };
  }
}

export async function adminCreateUser(
  email: string,
  password: string,
  name: string,
  role: string,
  roleLabel: string,
  schoolName: string,
  phone?: string,
  portalLevel?: string,
): Promise<{ success: boolean; error?: string; uid?: string }> {
  let createdUser: FirebaseUser | null = null;
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    createdUser = userCredential.user;

    await writeDocWithRetry(() =>
      setDoc(doc(db, 'users', createdUser!.uid), {
        uid: createdUser!.uid,
        name,
        email,
        role,
        roleLabel,
        schoolName,
        phone: phone || '',
        isVerified: true,
        portalLevel: portalLevel || '',
        createdAt: serverTimestamp(),
      } satisfies FirestoreUser),
    );

    return { success: true, uid: createdUser.uid };
  } catch (error: unknown) {
    if (createdUser) {
      try {
        await deleteUser(createdUser);
      } catch (rollbackError) {
        console.warn('[authService] Could not roll back newly created account:', rollbackError);
      }
    }
    const err = error as { code?: string };
    if (err.code === 'auth/email-already-in-use') {
      return { success: false, error: 'An account with this email already exists.' };
    }
    return { success: false, error: (error as Error).message || 'Account creation failed.' };
  }
}

export async function loginUser(
  email: string,
  password: string,
): Promise<{ success: boolean; error?: string; user?: FirestoreUser }> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (!userDoc.exists()) {
      return { success: false, error: 'User profile not found in database.' };
    }

    const userData = userDoc.data() as FirestoreUser;

    return { success: true, user: userData };
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err.code === 'auth/user-not-found') {
      return { success: false, error: 'No account found with this email address.' };
    }
    if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
      return { success: false, error: 'Incorrect email or password.' };
    }
    return { success: false, error: (error as Error).message || 'Login failed.' };
  }
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * If the signed-in user is an APPLICANT who has an application with status
 * 'Admitted', upgrades their account role to STUDENT automatically (and creates
 * their student profile). Returns the freshly-read profile so the caller can
 * reflect the promoted role without a full re-login.
 */
export async function autoPromoteApplicantIfAdmitted(
  uid: string,
  profile: FirestoreUser,
): Promise<FirestoreUser> {
  if (profile.role !== 'APPLICANT') return profile;

  try {
    const q = query(
      collection(db, 'admissionApplications'),
      where('email', '==', profile.email),
      where('applicationStatus', '==', 'Admitted'),
    );
    const snap = await getDocs(q);
    if (snap.empty) return profile;

    const app = snap.docs[0].data() as Record<string, unknown>;
    const surname = String(app.surname || '').trim();
    const firstName = String(app.firstName || '').trim();
    const middleName = String(app.middleName || '').trim();
    const courseOfStudy = String(app.courseOfStudy || '').trim();
    const phone = String(app.phone || profile.phone || '');
    const portalLevel = profile.portalLevel || 'College';
    const regNo = 'REG-' + Date.now().toString(36).toUpperCase();

    // If a student record already exists for this user, only upgrade the role
    // instead of overwriting the (possibly richer) student doc.
    const existingStudent = await getDoc(doc(db, 'students', uid));
    if (existingStudent.exists()) {
      await setDoc(doc(db, 'users', uid), { role: 'STUDENT', roleLabel: 'Student' }, { merge: true });
    } else {
      const res = await promoteApplicantToStudent(uid, {
        name: `${surname} ${firstName}`.trim() || profile.name,
        email: profile.email,
        schoolName: profile.schoolName,
        phone,
        portalLevel,
        surname,
        firstName,
        middleName,
        regNo,
        class: courseOfStudy,
      });
      if (!res.success) return profile;
    }
  } catch (error) {
    console.warn('[authService] Auto-promote check failed:', error);
    return profile;
  }

  return { ...profile, role: 'STUDENT', roleLabel: 'Student' };
}

export async function getUserProfile(uid: string): Promise<FirestoreUser | null> {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (!userDoc.exists()) return null;
  return userDoc.data() as FirestoreUser;
}

export async function updateUserProfile(
  uid: string,
  updates: Partial<FirestoreUser>,
): Promise<void> {
  const { uid: _uid, createdAt: _createdAt, ...safeUpdates } = updates;
  const cleanUpdates = Object.fromEntries(
    Object.entries(safeUpdates).filter(([, value]) => value !== undefined),
  );
  await setDoc(doc(db, 'users', uid), cleanUpdates, { merge: true });
}

/**
 * Promotes an admitted applicant's auth record to a STUDENT role and creates
 * their student profile record. Once admitted, the applicant no longer keeps
 * the APPLICANT account role.
 */
export async function promoteApplicantToStudent(
  uid: string,
  studentData: {
    name: string;
    email: string;
    schoolName: string;
    phone?: string;
    portalLevel?: string;
    surname?: string;
    firstName?: string;
    middleName?: string;
    regNo?: string;
    class?: string;
  },
): Promise<{ success: boolean; error?: string }> {
  try {
    await writeDocWithRetry(() =>
      setDoc(
        doc(db, 'users', uid),
        {
          role: 'STUDENT',
          roleLabel: 'Student',
        },
        { merge: true },
      ),
    );

    await writeDocWithRetry(() =>
      setDoc(doc(db, 'students', uid), {
        id: uid,
        name: studentData.name,
        surname: studentData.surname || '',
        firstName: studentData.firstName || '',
        middleName: studentData.middleName || '',
        email: studentData.email,
        phone: studentData.phone || '',
        regNo: studentData.regNo || '',
        class: studentData.class || '',
        parentName: '',
        status: 'Active',
        portalLevel: studentData.portalLevel || 'College',
      }),
    );

    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: (error as Error).message || 'Could not promote applicant.' };
  }
}

export async function changeUserPassword(
  currentPassword: string,
  newPassword: string,
): Promise<{ success: boolean; error?: string }> {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser || !firebaseUser.email) {
    return { success: false, error: 'No authenticated user found.' };
  }
  try {
    const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword);
    await reauthenticateWithCredential(firebaseUser, credential);
    await firebaseUpdatePassword(firebaseUser, newPassword);
    return { success: true };
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
      return { success: false, error: 'Current password is incorrect.' };
    }
    if (err.code === 'auth/weak-password') {
      return { success: false, error: 'New password is too weak. Use at least 6 characters.' };
    }
    return { success: false, error: (error as Error).message || 'Password update failed.' };
  }
}

export function onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}
