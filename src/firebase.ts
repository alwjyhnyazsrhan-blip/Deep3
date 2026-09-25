import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, getFirestore, doc } from 'firebase/firestore';
import firebaseAppletConfig from '../firebase-applet-config.json';

export const firebaseConfig = {
  apiKey: firebaseAppletConfig.apiKey || "AIzaSyANi1hKBMLRQk2keakcLjLv9PsQAxJTQN8",
  authDomain: firebaseAppletConfig.authDomain || "kingofdeep.firebaseapp.com",
  projectId: firebaseAppletConfig.projectId || "kingofdeep",
  storageBucket: firebaseAppletConfig.storageBucket || "kingofdeep.firebasestorage.app",
  messagingSenderId: firebaseAppletConfig.messagingSenderId || "865058774465",
  appId: firebaseAppletConfig.appId || "1:865058774465:web:083d2a7ee22f2d61b92340",
  measurementId: firebaseAppletConfig.measurementId || "G-MSXXJSVC15",
  firestoreDatabaseId: firebaseAppletConfig.firestoreDatabaseId || "(default)",
  recaptchaSiteKey: firebaseAppletConfig.recaptchaSiteKey || ""
};

// Initialize Firebase App only once
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth and Cloud Firestore instances strictly once
export const auth = getAuth(app);

const customDbId = (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)') 
  ? firebaseConfig.firestoreDatabaseId 
  : undefined;

// Initialize Firestore with auto-detect long-polling
if (customDbId) {
  initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
  }, customDbId);
} else {
  initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
  });
}

export const db = customDbId ? getFirestore(app, customDbId) : getFirestore(app); /* CRITICAL: The app will break without this line */

console.log("[FIREBASE] Initialized Firebase Auth and Cloud Firestore with database:", customDbId || '(default)');

// Graceful connection test without throwing unhandled exceptions
export async function testConnection() {
  try {
    const { getDoc } = await import('firebase/firestore');
    await getDoc(doc(db, 'test', 'connection')).catch(() => null);
  } catch {
    // Offline or connection pending - Firestore automatically handles offline persistence
  }
}
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Operation Info: ', JSON.stringify(errInfo));
  return errInfo;
}
