
'use client';
import { getAuth, type User } from 'firebase/auth';

/**
 * The context of a Firestore operation that failed due to security rules.
 * This is the input needed to construct a FirestorePermissionError.
 */
export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any; // The data being written/updated
};

/**
 * A simplified representation of the `request.auth.token` object in security rules.
 */
interface FirebaseAuthToken {
  name: string | null;
  email: string | null;
  email_verified: boolean;
  phone_number: string | null;
  sub: string; // This is the user's UID
  firebase: {
    identities: Record<string, string[]>;
    sign_in_provider: string;
    tenant: string | null;
  };
}

/**
 * A simplified representation of the `request.auth` object in security rules.
 */
interface FirebaseAuthObject {
  uid: string;
  token: FirebaseAuthToken;
}

/**
 * A simplified representation of the `request` object in security rules.
 * This structure is designed to be serialized into the error message.
 */
interface SecurityRuleRequest {
  auth: FirebaseAuthObject | null;
  method: string;
  path: string;
  resource?: {
    data: any;
  };
}

/**
 * Builds a security-rule-compliant auth object from the Firebase User object.
 * This function mirrors how `request.auth` is structured in Firestore Security Rules.
 * @param currentUser The currently authenticated Firebase user.
 * @returns An object that mirrors `request.auth` in security rules, or null if no user.
 */
function buildAuthObject(currentUser: User | null): FirebaseAuthObject | null {
  if (!currentUser) {
    return null;
  }

  const token: FirebaseAuthToken = {
    name: currentUser.displayName,
    email: currentUser.email,
    email_verified: currentUser.emailVerified,
    phone_number: currentUser.phoneNumber,
    sub: currentUser.uid,
    firebase: {
      identities: currentUser.providerData.reduce((acc, p) => {
        if (p.providerId) {
          acc[p.providerId] = [p.uid];
        }
        return acc;
      }, {} as Record<string, string[]>),
      sign_in_provider: currentUser.providerData[0]?.providerId || 'custom',
      tenant: currentUser.tenantId,
    },
  };

  return {
    uid: currentUser.uid,
    token: token,
  };
}

/**
 * Builds the complete, simulated request object for the error message.
 * It safely tries to get the current authenticated user to include in the context.
 * @param context The context of the failed Firestore operation (path, method, data).
 * @returns A structured request object ready for serialization.
 */
function buildRequestObject(context: SecurityRuleContext): SecurityRuleRequest {
  let authObject: FirebaseAuthObject | null = null;
  try {
    // Safely attempt to get the current user. This may fail if Firebase isn't
    // fully initialized when the error is constructed.
    const firebaseAuth = getAuth();
    const currentUser = firebaseAuth.currentUser;
    if (currentUser) {
      authObject = buildAuthObject(currentUser);
    }
  } catch {
    // This will catch errors if the Firebase app is not yet initialized.
    // In this case, we'll proceed without auth information, which is a valid state.
  }

  return {
    auth: authObject,
    method: context.operation,
    path: `/databases/(default)/documents/${context.path}`,
    resource: context.requestResourceData ? { data: context.requestResourceData } : undefined,
  };
}

/**
 * Builds the final, human-readable and machine-parseable error message.
 * @param requestObject The simulated request object.
 * @returns A string containing the error message and the JSON payload.
 */
function buildErrorMessage(requestObject: SecurityRuleRequest): string {
  return `FirestoreError: Missing or insufficient permissions: The following request was denied by Firestore Security Rules:
${JSON.stringify(requestObject, null, 2)}`;
}

/**
 * A custom error class designed to be consumed by both developers and an LLM for debugging.
 * It captures the full context of a failed Firestore operation and structures it
 * to mimic the `request` object available within Firestore Security Rules.
 * When thrown, this error provides a rich, actionable payload for diagnosing permission issues.
 */
export class FirestorePermissionError extends Error {
  public readonly request: SecurityRuleRequest;

  constructor(context: SecurityRuleContext) {
    const requestObject = buildRequestObject(context);
    // The message is formatted to be immediately useful in the console.
    super(buildErrorMessage(requestObject));
    this.name = 'FirestorePermissionError';
    // The `request` property holds the structured data for programmatic access.
    this.request = requestObject;
  }
}
    