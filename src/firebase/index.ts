
'use client';

// This file serves as the main entry point for Firebase-related modules.
// By re-exporting, we can organize our Firebase logic into separate files
// while providing a single, consistent import path for our components.

export * from './client';
export * from './provider';
export * from './hooks';
export * from './firestore/use-collection';
export * from './firestore/use-document';
export * from './firestore/use-memo-firebase';

// NOTE: non-blocking-login is NOT exported from here as it creates a circular dependency
// It should be imported directly: import { ... } from '@/firebase/non-blocking-login';
    