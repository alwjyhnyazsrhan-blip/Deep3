import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';

export interface ActiveSessionInfo {
  sessionId: string;
  deviceId: string;
  deviceInfo: string;
  sessionStatus: 'ACTIVE' | 'EXPIRED';
  createdAt: string;
  lastActiveAt: string;
}

export interface DeviceDetails {
  deviceId: string;
  deviceType: string;
  browserName: string;
  formatted: string;
}

const SESSION_STORAGE_KEY = 'pirate_game_active_session_id';
const DEVICE_STORAGE_KEY = 'pirate_game_device_id';
const SESSION_DEVICE_KEY = 'pirate_game_device_name';
const SESSION_STATUS_KEY = 'pirate_game_session_status';

/**
 * Generates a cryptographically strong, unique identifier.
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Retrieves or generates a permanent unique device ID for this browser.
 * Persists across page reloads and tab closures in localStorage.
 */
export function getOrCreateDeviceId(): string {
  try {
    let devId = localStorage.getItem(DEVICE_STORAGE_KEY);
    if (!devId || devId.trim() === '') {
      devId = `dev_${Date.now()}_${generateUUID()}`;
      localStorage.setItem(DEVICE_STORAGE_KEY, devId);
    }
    return devId;
  } catch (e) {
    return `dev_fallback_${Date.now()}`;
  }
}

/**
 * Returns structured details about the current device and browser.
 */
export function getDeviceDetails(): DeviceDetails {
  const deviceId = getOrCreateDeviceId();
  if (typeof navigator === 'undefined') {
    return {
      deviceId,
      deviceType: 'جهاز غير معروف',
      browserName: 'متصفح ويب',
      formatted: 'جهاز غير معروف (متصفح ويب)'
    };
  }

  const ua = navigator.userAgent || '';
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);

  let browserName = 'متصفح ويب';
  if (/Edg/i.test(ua)) browserName = 'Edge';
  else if (/Chrome/i.test(ua)) browserName = 'Chrome';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browserName = 'Safari';
  else if (/Firefox/i.test(ua)) browserName = 'Firefox';
  else if (/Opera|OPR/i.test(ua)) browserName = 'Opera';

  let deviceType = 'كمبيوتر';
  if (/Android/i.test(ua)) deviceType = 'هاتف أندرويد';
  else if (/iPhone/i.test(ua)) deviceType = 'هاتف آيفون';
  else if (/iPad/i.test(ua)) deviceType = 'آيباد';
  else if (/Windows/i.test(ua)) deviceType = 'كمبيوتر (Windows)';
  else if (/Macintosh/i.test(ua)) deviceType = 'ماك';
  else if (/Linux/i.test(ua)) deviceType = 'لينكس';

  const formatted = `${isMobile ? '📱' : '💻'} ${deviceType} (${browserName})`;

  return {
    deviceId,
    deviceType,
    browserName,
    formatted
  };
}

/**
 * Returns human-readable device/browser information for UI diagnostics (e.g. "هاتف أندرويد (Chrome)").
 */
export function getClientDeviceInfo(): string {
  return getDeviceDetails().formatted;
}

/**
 * Generates a cryptographically strong, unique session identifier.
 */
export function generateSessionId(): string {
  return `sess_${Date.now()}_${generateUUID()}`;
}

/**
 * Retrieves the currently stored local sessionId.
 */
export function getLocalSessionId(): string | null {
  try {
    return localStorage.getItem(SESSION_STORAGE_KEY);
  } catch (e) {
    return null;
  }
}

/**
 * Stores the local sessionId and session status.
 */
export function setLocalSessionId(sessionId: string): void {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    localStorage.setItem(SESSION_DEVICE_KEY, getClientDeviceInfo());
    localStorage.setItem(SESSION_STATUS_KEY, 'ACTIVE');
  } catch (e) {
    console.warn('Failed to store session ID in localStorage', e);
  }
}

/**
 * Clears the local sessionId on logout or termination.
 */
export function clearLocalSessionId(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(SESSION_DEVICE_KEY);
    localStorage.setItem(SESSION_STATUS_KEY, 'EXPIRED');
  } catch (e) {
    console.warn('Failed to clear session ID from localStorage', e);
  }
}

/**
 * Registers a new session in Firestore when the user logs in from this device.
 * This sets `currentDeviceId` and `currentSessionId` in Firestore with 'ACTIVE' status,
 * rendering any prior devices/sessions obsolete and expired.
 */
export async function registerNewUserSession(userId: string): Promise<{ sessionId: string; deviceId: string }> {
  const newSessionId = generateSessionId();
  const deviceId = getOrCreateDeviceId();
  const deviceInfo = getClientDeviceInfo();
  const now = new Date().toISOString();

  setLocalSessionId(newSessionId);

  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, {
      currentSessionId: newSessionId,
      currentDeviceId: deviceId,
      sessionStatus: 'ACTIVE',
      lastLoginDevice: deviceInfo,
      lastLoginAt: now,
      sessionUpdatedAt: now
    }, { merge: true });
    
    console.log(`[SESSION] New session registered: ${newSessionId} for user ${userId} on device ${deviceId} (${deviceInfo})`);
  } catch (error: any) {
    const isOffline = error?.code === 'unavailable' || 
                      error?.message?.toLowerCase().includes('offline');
    if (isOffline) {
      console.warn('[SESSION] Client is offline; session registration will sync when connection is restored.');
    } else {
      console.warn('[SESSION] Notice registering session in Firestore:', error?.message || error);
    }
  }

  return { sessionId: newSessionId, deviceId };
}

/**
 * Recovers an expired session from this device.
 * Freezes the other device's session, assigns currentDeviceId and new sessionId as the sole
 * authorized session in Firestore with status 'ACTIVE'.
 */
export async function recoverSessionFromDevice(userId: string): Promise<{ sessionId: string; deviceId: string; userDocData?: any }> {
  const newSessionId = generateSessionId();
  const deviceId = getOrCreateDeviceId();
  const deviceInfo = getClientDeviceInfo();
  const now = new Date().toISOString();

  setLocalSessionId(newSessionId);

  const userDocRef = doc(db, 'users', userId);
  await setDoc(userDocRef, {
    currentSessionId: newSessionId,
    currentDeviceId: deviceId,
    sessionStatus: 'ACTIVE',
    lastLoginDevice: deviceInfo,
    lastLoginAt: now,
    sessionUpdatedAt: now
  }, { merge: true });

  console.log(`[SESSION] Session successfully recovered on device ${deviceId} (${deviceInfo}) for user ${userId}`);

  // Direct fetch of latest database data
  let userDocData: any = null;
  try {
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      userDocData = snap.data();
    }
  } catch (err) {
    console.warn('[SESSION] Error fetching fresh user doc after recovery:', err);
  }

  return { sessionId: newSessionId, deviceId, userDocData };
}

/**
 * Verifies if the current browser/device holds the active session recorded in Firestore.
 * Seamlessly allows reloads/refreshes from the SAME deviceId.
 */
export async function verifyActiveSession(userId?: string): Promise<{
  isValid: boolean;
  activeSessionId?: string;
  localSessionId?: string | null;
  deviceInfo?: string;
  isSameDevice?: boolean;
  error?: string;
}> {
  const targetUid = userId || auth.currentUser?.uid;
  if (!targetUid) {
    return { isValid: true };
  }

  const localDeviceId = getOrCreateDeviceId();
  const localSessionId = getLocalSessionId();

  try {
    const userDocRef = doc(db, 'users', targetUid);
    const snap = await getDoc(userDocRef);

    if (!snap.exists()) {
      return { isValid: true };
    }

    const data = snap.data();
    const serverDeviceId = data.currentDeviceId;
    const serverSessionId = data.currentSessionId;
    const serverStatus = data.sessionStatus;
    const deviceInfo = data.lastLoginDevice || 'جهاز / متصفح آخر';

    // If server has no device/session recorded yet, bind it to this device
    if (!serverDeviceId || !serverSessionId) {
      const newSessionId = localSessionId || generateSessionId();
      await updateDoc(userDocRef, {
        currentSessionId: newSessionId,
        currentDeviceId: localDeviceId,
        sessionStatus: 'ACTIVE',
        lastLoginDevice: getClientDeviceInfo(),
        sessionUpdatedAt: new Date().toISOString()
      }).catch(() => {});
      setLocalSessionId(newSessionId);
      return { isValid: true, activeSessionId: newSessionId, isSameDevice: true };
    }

    // 1. Same device check (seamless page refresh / tab reopen)
    if (serverDeviceId === localDeviceId) {
      // If server is active and matches deviceId, update localSessionId if needed
      if (serverSessionId && (!localSessionId || localSessionId !== serverSessionId)) {
        setLocalSessionId(serverSessionId);
      }
      return {
        isValid: serverStatus !== 'EXPIRED',
        activeSessionId: serverSessionId,
        localSessionId: serverSessionId,
        deviceInfo,
        isSameDevice: true
      };
    }

    // 2. Different device logged in or session expired
    return {
      isValid: false,
      activeSessionId: serverSessionId,
      localSessionId,
      deviceInfo,
      isSameDevice: false
    };
  } catch (error: any) {
    const isOffline = error?.code === 'unavailable' || 
                      error?.message?.toLowerCase().includes('offline') ||
                      (typeof navigator !== 'undefined' && !navigator.onLine);
    if (isOffline) {
      console.warn('[SESSION] Client is offline; maintaining current local session state seamlessly.');
    } else {
      console.warn('[SESSION] Note while checking session status in Firestore:', error?.message || error);
    }
    return {
      isValid: true,
      localSessionId,
      isSameDevice: true,
      error: error?.message
    };
  }
}

/**
 * Listens in real-time to the user document in Firestore to immediately detect
 * if a newer session has been registered by another device/browser.
 */
export function listenToActiveSession(
  userId: string,
  onTerminated: (info: { newDevice: string; lastLoginAt?: string; browser?: string }) => void
): () => void {
  const userDocRef = doc(db, 'users', userId);

  const unsubscribe = onSnapshot(
    userDocRef,
    (snapshot: any) => {
      if (!snapshot.exists()) return;

      const data = snapshot.data();
      const serverDeviceId = data?.currentDeviceId;
      const serverSessionId = data?.currentSessionId;
      const sessionStatus = data?.sessionStatus;
      const localDeviceId = getOrCreateDeviceId();
      const localSessionId = getLocalSessionId();

      // If another device has registered as active, immediately terminate this session
      if (serverDeviceId && localDeviceId && serverDeviceId !== localDeviceId) {
        console.warn(`[SESSION CONFLICT] Active session transferred to another device: ${serverDeviceId} (local: ${localDeviceId})`);
        onTerminated({
          newDevice: data?.lastLoginDevice || 'جهاز أو متصفح آخر',
          lastLoginAt: data?.lastLoginAt
        });
        return;
      }

      // If explicitly marked EXPIRED on the server
      if (sessionStatus === 'EXPIRED') {
        console.warn(`[SESSION EXPIRED] Session status is EXPIRED on server`);
        onTerminated({
          newDevice: data?.lastLoginDevice || 'جهاز أو متصفح آخر',
          lastLoginAt: data?.lastLoginAt
        });
        return;
      }

      // If on the same device, adopt the server session ID if locally absent
      if (serverDeviceId === localDeviceId && (!localSessionId || localSessionId !== serverSessionId)) {
        if (serverSessionId) {
          setLocalSessionId(serverSessionId);
        }
      }
    },
    (err: any) => {
      console.warn('[SESSION] Real-time session listener error:', err);
    }
  );

  return unsubscribe;
}

