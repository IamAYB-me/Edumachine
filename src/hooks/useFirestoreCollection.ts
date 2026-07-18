import { useState, useEffect } from 'react';
import { subscribeToCollection } from '@/services/firestoreService';
import type { DocumentData } from 'firebase/firestore';

export function useFirestoreCollection(collectionName: string) {
  const [data, setData] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToCollection(
      collectionName,
      (docs) => {
        setData(docs);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [collectionName]);

  return { data, loading, error };
}
