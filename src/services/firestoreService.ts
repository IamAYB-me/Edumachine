import {
  collection,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  deleteField,
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

export async function updateDocument(
  collectionName: string,
  id: string,
  data: Partial<DocumentData>,
): Promise<void> {
  const docRef = doc(db, collectionName, id);
  const { id: _id, createdAt: _createdAt, ...updateData } = data as DocumentData & { id: string; createdAt: unknown };
  await setDoc(docRef, { ...updateData, updatedAt: serverTimestamp() }, { merge: true });
}

export async function deleteDocument(collectionName: string, id: string): Promise<void> {
  await deleteDoc(doc(db, collectionName, id));
}

export async function clearCollection(collectionName: string): Promise<number> {
  const snapshot = await getDocs(collection(db, collectionName));
  let count = 0;
  const batch = snapshot.docs.map(async (d) => {
    await deleteDoc(d.ref);
    count += 1;
  });
  await Promise.all(batch);
  return count;
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
  const colRef = collection(db, collectionName);
  return onSnapshot(
    colRef,
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

export async function replaceDocument(
  collectionName: string,
  id: string,
  data: DocumentData,
): Promise<void> {
  await setDoc(doc(db, collectionName, id), data);
}

export async function deleteFieldsFromDocument(
  collectionName: string,
  id: string,
  fieldNames: string[],
): Promise<void> {
  const updates: Record<string, unknown> = {};
  for (const f of fieldNames) {
    updates[f] = deleteField();
  }
  await updateDoc(doc(db, collectionName, id), updates);
}

export function subscribeToDocument(
  collectionName: string,
  docId: string,
  callback: (data: DocumentData | null) => void,
  errorCallback?: (error: Error) => void,
): Unsubscribe {
  const docRef = doc(db, collectionName, docId);
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: snapshot.id, ...snapshot.data() });
      } else {
        callback(null);
      }
    },
    (error) => {
      errorCallback?.(error as Error);
    },
  );
}
