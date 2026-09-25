import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import firebaseAppletConfig from '../../firebase-applet-config.json';

export const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID || firebaseAppletConfig.projectId || 'kingofdeep',
};

let adminAppInstance: App | null = null;
let adminAuthInstance: Auth | null = null;
let adminDbInstance: Firestore | null = null;

export function getAdminApp(): App {
  if (!adminAppInstance) {
    const apps = getApps();
    if (apps.length > 0) {
      adminAppInstance = apps[0];
    } else {
      adminAppInstance = initializeApp(firebaseAdminConfig);
    }
  }
  return adminAppInstance;
}

export function getAdminAuth(): Auth {
  if (!adminAuthInstance) {
    adminAuthInstance = getAuth(getAdminApp());
  }
  return adminAuthInstance;
}

export function getAdminDb(): Firestore {
  if (!adminDbInstance) {
    const dbId = firebaseAppletConfig.firestoreDatabaseId && firebaseAppletConfig.firestoreDatabaseId !== '(default)' 
      ? firebaseAppletConfig.firestoreDatabaseId 
      : undefined;
    adminDbInstance = dbId ? getFirestore(getAdminApp(), dbId) : getFirestore(getAdminApp());
  }
  return adminDbInstance;
}

export const adminAuth = new Proxy({} as Auth, {
  get(_target, prop) {
    const instance = getAdminAuth();
    const value = (instance as any)[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  }
});

export const adminDb = new Proxy({} as Firestore, {
  get(_target, prop) {
    const instance = getAdminDb();
    const value = (instance as any)[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  }
});


