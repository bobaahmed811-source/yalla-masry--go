
'use client';
import { useMemo } from 'react';
import {
  DocumentReference,
  Query,
  collection,
  doc,
  query,
} from 'firebase/firestore';

/**
 * Custom hook to memoize Firestore queries.
 * This prevents re-running queries on every render, which can lead to
 * infinite loops and unnecessary Firestore reads.
 *
 * It works by attaching a `__memo` property to the returned query/document
 * object, which is then checked by `useCollection` and `useDocument` to ensure
 * memoization is being used correctly.
 *
 * @param factory A function that returns a Firestore query or document reference.
 * @param deps The dependency array for the `useMemo` hook.
 * @returns The memoized Firestore query or document reference.
 */
export function useMemoFirebase<
  T extends DocumentReference<any> | Query<any> | null
>(factory: () => T, deps: React.DependencyList): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoized = useMemo(factory, deps);

  if (memoized) {
    // This is a bit of a hack to enforce the use of this hook.
    // We attach a property to the memoized object, which our other hooks
    // will check for. If it's missing, they'll throw an error.
    (memoized as any).__memo = true;
  }
  return memoized;
}
    