
'use client';

import {
  Auth,
  signOut,
  updateProfile,
  User,
  UserInfo,
} from 'firebase/auth';

/**
 * A non-blocking wrapper for Firebase's updateProfile function.
 * It initiates the profile update but does not wait for it to complete.
 * Instead, it takes a callback to handle the result (success or failure).
 *
 * @param user The Firebase user object to update.
 * @param profile The new profile data (e.g., { displayName: 'New Name' }).
 * @param callback A function to be called with the result of the operation.
 */
export function updateProfileNonBlocking(
  user: User,
  profile: Partial<UserInfo>,
  callback: (result: { success: boolean; error?: Error }) => void
): void {
  updateProfile(user, profile)
    .then(() => {
      callback({ success: true });
    })
    .catch((error) => {
      callback({ success: false, error });
    });
}

/**
 * A non-blocking wrapper for Firebase's signOut function.
 * It initiates the sign-out process and immediately calls the provided callback.
 *
 * @param auth The Firebase Auth instance.
 * @param callback A function to be called after the sign-out process is initiated.
 */
export function initiateSignOut(
  auth: Auth,
  callback: () => void
): void {
  signOut(auth);
  // The callback is called immediately, allowing the UI to update
  // without waiting for the sign-out to be fully confirmed by the backend.
  callback();
}
    