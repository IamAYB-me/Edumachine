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
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
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
