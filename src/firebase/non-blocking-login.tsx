'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  User,
  NextOrObserver,
  onAuthStateChanged,
  // Assume getAuth and app are initialized elsewhere
} from 'firebase/auth';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  // CRITICAL: Call signInAnonymously directly. Do NOT use 'await signInAnonymously(...)'.
  signInAnonymously(authInstance);
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string, callback?: (user: User | null) => void): void {
  // CRITICAL: Call createUserWithEmailAndPassword directly. Do NOT use 'await createUserWithEmailAndPassword(...)'.
  createUserWithEmailAndPassword(authInstance, email, password)
    .then(userCredential => {
        if (callback) {
            callback(userCredential.user);
        }
    })
    .catch(error => {
        console.error("Error signing up:", error);
        if (callback) {
            callback(null);
        }
    });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string, callback?: (user: User | null) => void): void {
  // CRITICAL: Call signInWithEmailAndPassword directly. Do NOT use 'await signInWithEmailAndPassword(...)'.
  signInWithEmailAndPassword(authInstance, email, password)
    .then(userCredential => {
        if (callback) {
            callback(userCredential.user);
        }
    })
    .catch(error => {
        console.error("Error signing in:", error);
        if (callback) {
            callback(null);
        }
    });
}


/** Update user profile (non-blocking). */
export function updateProfileNonBlocking(user: User, profileData: { displayName?: string; photoURL?: string; }): void {
    updateProfile(user, profileData).catch(error => {
        console.error("Error updating profile:", error);
    });
}
