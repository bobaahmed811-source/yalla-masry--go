
'use client';

import { useState, useEffect } from 'react';
import {
  doc,
  onSnapshot,
  DocumentReference,
  DocumentData,
  FirestoreError,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase/hooks';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/** Utility type to add an 'id' field to a given type T. */
export type WithId<T> = T & { id: string };

/**
 * Interface for the return value of the useDocument hook.
 * @template T Type of the document data.
 */
export interface UseDocumentResult<T> {
  data: WithId<T> | null;
  isLoading: boolean;
  error: FirestoreError | Error | null;
}

/**
 * React hook to subscribe to a Firestore document in real-time.
 *
 * IMPORTANT! YOU MUST MEMOIZE the inputted memoizedDocRef or BAD THINGS WILL HAPPEN
 * use useMemo to memoize it per React guidence.  Also make sure that it's dependencies are stable
 * references
 *
 * @template T Optional type for document data. Defaults to any.
 * @param {string | null | undefined} path - The path to the document in Firestore.
 * @returns {UseDocumentResult<T>} Object with data, isLoading, error.
 */
export function useDocument<T = any>(
  memoizedDocRef: (DocumentReference<DocumentData> & { __memo?: boolean }) | null
): UseDocumentResult<T> {
  type ResultItemType = WithId<T>;
  type StateDataType = ResultItemType | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<FirestoreError | Error | null>(null);
  const firestore = useFirestore();

  useEffect(() => {
    if (!memoizedDocRef || !firestore) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      memoizedDocRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          setData({ ...(docSnapshot.data() as T), id: docSnapshot.id });
        } else {
          // Document does not exist
          setData(null);
        }
        setError(null);
        setIsLoading(false);
      },
      (error: FirestoreError) => {
        const contextualError = new FirestorePermissionError({
          path: memoizedDocRef.path,
          operation: 'get',
        });
        setError(contextualError);
        setData(null);
        setIsLoading(false);
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    return () => unsubscribe();
  }, [memoizedDocRef, firestore]);

  if (memoizedDocRef && !memoizedDocRef.__memo) {
    throw new Error(
      memoizedDocRef + ' was not properly memoized using useMemoFirebase'
    );
  }
  return { data, isLoading, error };
}
    