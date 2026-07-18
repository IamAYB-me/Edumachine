import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  onAuthStateChanged,
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
  createdAt: unknown;
}

export async function registerUser(
  email: string,
  password: string,
  name: string,
  role: string,
  roleLabel: string,
  schoolName: string,
  phone?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    await sendEmailVerification(firebaseUser);

    await setDoc(doc(db, 'users', firebaseUser.uid), {
      uid: firebaseUser.uid,
      name,
      email,
      role,
      roleLabel,
      schoolName,
      phone: phone || '',
      isVerified: false,
      createdAt: serverTimestamp(),
    } satisfies FirestoreUser);

    return { success: true };
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err.code === 'auth/email-already-in-use') {
      return { success: false, error: 'An account with this email already exists.' };
    }
    return { success: false, error: (error as Error).message || 'Registration failed.' };
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
  await setDoc(doc(db, 'users', uid), safeUpdates, { merge: true });
}

export function onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}
