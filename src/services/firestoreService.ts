import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  type Unsubscribe,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '@/config/firebase';

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export async function addDocument(collectionName: string, data: DocumentData): Promise<string> {
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function addDocumentWithId(
  collectionName: string,
  id: string,
  data: DocumentData,
): Promise<void> {
  await setDoc(doc(db, collectionName, id), {
    ...data,
    id,
    createdAt: serverTimestamp(),
  });
}

import { setDoc } from 'firebase/firestore';

export async function updateDocument(
  collectionName: string,
  id: string,
  data: Partial<DocumentData>,
): Promise<void> {
  const docRef = doc(db, collectionName, id);
  const { id: _id, createdAt: _createdAt, ...updateData } = data as DocumentData & { id: string; createdAt: unknown };
  await updateDoc(docRef, { ...updateData, updatedAt: serverTimestamp() });
}

export async function deleteDocument(collectionName: string, id: string): Promise<void> {
  await deleteDoc(doc(db, collectionName, id));
}

export async function getDocuments(collectionName: string): Promise<DocumentData[]> {
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getDocumentsWhere(
  collectionName: string,
  field: string,
  op: '==' | '!=' | '<' | '<=' | '>' | '>=',
  value: string | number | boolean,
): Promise<DocumentData[]> {
  const q = query(collection(db, collectionName), where(field, op, value));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function subscribeToCollection(
  collectionName: string,
  callback: (data: DocumentData[]) => void,
  errorCallback?: (error: Error) => void,
): Unsubscribe {
  const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(data);
    },
    (error) => {
      errorCallback?.(error as Error);
    },
  );
}

export function subscribeToCollectionWhere(
  collectionName: string,
  field: string,
  op: '==' | '!=' | '<' | '<=' | '>' | '>=',
  value: string | number | boolean,
  callback: (data: DocumentData[]) => void,
  errorCallback?: (error: Error) => void,
): Unsubscribe {
  const q = query(
    collection(db, collectionName),
    where(field, op, value),
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(data);
    },
    (error) => {
      errorCallback?.(error as Error);
    },
  );
}

export async function setDocument(
  collectionName: string,
  id: string,
  data: DocumentData,
): Promise<void> {
  await setDoc(doc(db, collectionName, id), data, { merge: true });
}
