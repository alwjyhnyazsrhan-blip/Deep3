import { runTransaction, doc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { ShipState, CrewMember } from '../types';
import { getLocalSessionId, getOrCreateDeviceId } from './sessionManager';

/**
 * Checks if the browser currently has an active internet connection.
 */
export const isNetworkOnline = (): boolean => {
  if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') {
    return navigator.onLine;
  }
  return true;
};

/**
 * Dispatches a global event and displays an alert when a financial operation is blocked due to offline status.
 */
export const notifyOfflineBlocked = (actionDescription?: string): void => {
  const message = actionDescription 
    ? `⚠️ تعذر إتمام [${actionDescription}] لعدم وجود اتصال نشط بالإنترنت!\nتم إيقاف العملية فوراً لحماية أصولك ورصيدك من التضارب.`
    : `⚠️ لا يوجد اتصال نشط بالإنترنت!\nتم إيقاف العملية المالية تماماً لمنع التضارب وضمان مزامنة رصيدك مع السيرفر السحابي. يرجى التحقق من اتصالك والمحاولة مجدداً.`;

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('financial-offline-blocked', {
      detail: { message, timestamp: Date.now() }
    }));
  }
  alert(message);
};

export interface FinancialTransactionParams {
  /** Gold delta: negative to deduct (spend/buy/upgrade), positive to add (sell/reward) */
  goldDelta?: number;
  /** Gems delta: negative to deduct, positive to add */
  gemsDelta?: number;
  /** Optional red gems delta */
  redGemsDelta?: number;
  /** Direct ship array modification */
  ships?: ShipState[];
  /** Updated crew array modification */
  crew?: CrewMember[];
  /** Updated crew services modification */
  crewServices?: Record<string, any>;
  /** Updated crew inventory stocks */
  crewInventory?: Record<string, number>;
  /** Updated shield inventory stocks */
  shieldInventory?: Record<string, number>;
  /** Updated fish inventory */
  fishInventory?: Record<string, number>;
  /** Updated ship tower level */
  shipTowerLevel?: number;
  /** Updated fish storage level */
  fishStorageLevel?: number;
  /** Updated weapons arsenal */
  weapons?: Record<string, number>;
  /** Description for logging and user messages */
  reason: string;
  /** Fallback local state callbacks if necessary */
  onLocalApply?: (result: {
    newGold: number;
    newGems: number;
  }) => void;
}

export interface FinancialTransactionResult {
  success: boolean;
  newGold?: number;
  newGems?: number;
  error?: string;
  isOffline?: boolean;
}

/**
 * Executes a financial transaction atomically using Firebase Firestore runTransaction
 * with strict online connection verification to prevent desync exploits.
 */
export const executeFinancialTransaction = async (
  params: FinancialTransactionParams
): Promise<FinancialTransactionResult> => {
  // 1. Strict internet connectivity pre-check
  if (!isNetworkOnline()) {
    notifyOfflineBlocked(params.reason);
    return {
      success: false,
      isOffline: true,
      error: 'الإنترنت مفصول. تم إيقاف العملية لمنع التضارب.'
    };
  }

  const user = auth.currentUser;

  // 2. If user is authenticated in Firebase: Execute Atomic Firestore Transaction
  if (user) {
    const userDocRef = doc(db, 'users', user.uid);
    try {
      const result = await runTransaction(db, async (transaction) => {
        const userDocSnap = await transaction.get(userDocRef);

        if (!userDocSnap.exists()) {
          throw new Error('لم يتم العثور على ملف المستخدم في قاعدة البيانات.');
        }

        const data = userDocSnap.data() || {};

        // Concurrent multi-device session check
        const serverDeviceId = data.currentDeviceId;
        const localDeviceId = getOrCreateDeviceId();
        const serverSessionId = data.currentSessionId;
        const localSessionId = getLocalSessionId();
        const sessionStatus = data.sessionStatus;

        if ((serverDeviceId && localDeviceId && serverDeviceId !== localDeviceId) || sessionStatus === 'EXPIRED') {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('session-terminated-by-other-device', {
              detail: {
                message: 'تم تسجيل الدخول إلى هذا الحساب من جهاز أو متصفح آخر.',
                device: data.lastLoginDevice || 'جهاز آخر',
                lastLoginAt: data.lastLoginAt
              }
            }));
          }
          throw new Error('SESSION_TERMINATED_BY_OTHER_DEVICE: تم تسجيل الدخول إلى حسابك من جهاز آخر. تم إنهاء جلستك الحالية ومنع هذه العملية.');
        }

        const currentGold = typeof data.gold === 'number' ? data.gold : 0;
        const currentGems = typeof data.gems === 'number' ? data.gems : 0;
        const currentRedGems = typeof data.redGems === 'number' ? data.redGems : 0;

        const goldDelta = Math.round(params.goldDelta || 0);
        const gemsDelta = Math.round(params.gemsDelta || 0);
        const redGemsDelta = Math.round(params.redGemsDelta || 0);

        // Enforce balance sufficiency on the server side
        if (goldDelta < 0 && currentGold < Math.abs(goldDelta)) {
          throw new Error(`⚠️ الذهب غير كافٍ لإتمام هذه العملية! الرصيد الفعلي المتوفر: ${currentGold.toLocaleString('ar-EG')} 🪙 ذهب.`);
        }

        if (gemsDelta < 0 && currentGems < Math.abs(gemsDelta)) {
          throw new Error(`⚠️ الجواهر غير كافية لإتمام هذه العملية! الرصيد الفعلي المتوفر: ${currentGems.toLocaleString('ar-EG')} 💎 جوهرة.`);
        }

        const calculatedGold = Math.max(0, currentGold + goldDelta);
        const calculatedGems = Math.max(0, currentGems + gemsDelta);
        const calculatedRedGems = Math.max(0, currentRedGems + redGemsDelta);

        const updatePayload: Record<string, any> = {
          gold: calculatedGold,
          gems: calculatedGems,
          redGems: calculatedRedGems,
          updatedAt: new Date().toISOString()
        };

        if (params.ships !== undefined) {
          updatePayload.ships = params.ships;
        }

        if (params.fishInventory !== undefined) {
          updatePayload.fishInventory = params.fishInventory;
        }

        if (typeof params.shipTowerLevel === 'number') {
          updatePayload.shipTowerLevel = params.shipTowerLevel;
        }

        if (typeof params.fishStorageLevel === 'number') {
          updatePayload.fishStorageLevel = params.fishStorageLevel;
        }

        if (params.weapons !== undefined) {
          updatePayload.weapons = params.weapons;
        }

        if (params.crew !== undefined) {
          updatePayload.crew = params.crew;
        }

        if (params.crewServices !== undefined) {
          updatePayload.crewServices = params.crewServices;
        }

        if (params.crewInventory !== undefined) {
          updatePayload.crewInventory = params.crewInventory;
        }

        if (params.shieldInventory !== undefined) {
          updatePayload.shieldInventory = params.shieldInventory;
        }

        // Atomic commit to Firestore
        transaction.update(userDocRef, updatePayload);

        return {
          newGold: calculatedGold,
          newGems: calculatedGems
        };
      });

      return {
        success: true,
        newGold: result.newGold,
        newGems: result.newGems
      };
    } catch (error: any) {
      console.error('Financial transaction failed:', error);

      // Check for offline / network errors during execution
      const errMsg = error?.message || String(error);
      const isNetworkErr = 
        errMsg.includes('offline') || 
        errMsg.includes('unavailable') || 
        errMsg.includes('network') ||
        errMsg.includes('failed to fetch');

      if (isNetworkErr || !isNetworkOnline()) {
        notifyOfflineBlocked(params.reason);
        return {
          success: false,
          isOffline: true,
          error: 'انقطع الاتصال بالإنترنت أثناء تنفيذ العملية. تم إلغاء المعاملة بأمان.'
        };
      }

      // Handle standard Firestore error tracking if needed
      try {
        handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
      } catch (e) {}

      alert(errMsg.startsWith('⚠️') ? errMsg : `❌ حدث خطأ أثناء إتمام المعاملة: ${errMsg}`);
      return {
        success: false,
        error: errMsg
      };
    }
  }

  // 3. Guest / Local session (when online)
  // Still strictly verifies navigator.onLine
  if (params.onLocalApply) {
    params.onLocalApply({
      newGold: 0,
      newGems: 0
    });
  }

  return {
    success: true
  };
};
