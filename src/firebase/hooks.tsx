
'use client';

import { useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { FirebaseContext } from './provider';

/**
 * Custom hook to get the Firebase context values (app, auth, firestore).
 * Throws an error if used outside of a FirebaseProvider.
 */
function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}

export const useFirebaseApp = () => useFirebase().firebaseApp;
export const useAuth = () => useFirebase().auth;
export const useFirestore = () => useFirebase().firestore;

interface UserData {
  // Define the shape of your user data in Firestore
  [key: string]: any;
}

/**
 * Custom hook to get the current authenticated user object along with their
 * Firestore document data.
 * @returns An object with the user, their data, loading state, and any error.
 */
export function useUser() {
  const auth = useAuth();
  const firestore = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!auth) {
      // Firebase might not be initialized yet
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setUser(user);
          // If there's a user, fetch their corresponding Firestore document
          if (firestore) {
            const userDocRef = doc(firestore, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              setUserData(userDoc.data());
            } else {
              // Handle case where user exists in Auth but not Firestore
              console.warn("User document doesn't exist in Firestore.");
              setUserData(null);
            }
          }
        } else {
          // No user logged in
          setUser(null);
          setUserData(null);
        }
      } catch (e: any) {
        setError(e);
      } finally {
        setIsUserLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth, firestore]);

  // We combine the auth user object and the firestore data into a single user object
  const enhancedUser = user ? { ...user, ...userData } : null;

  return { user: enhancedUser, isUserLoading, error };
}
    