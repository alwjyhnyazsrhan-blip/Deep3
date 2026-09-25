import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { ShipState, ChatMessage, Tribe, CrewMember, Quest, BattleReport, GlobalNotification, NotificationEventType } from './types';
import { SHOP_SHIPS, FISH_REWARD_DATA, getHarborImageUrl, FISH_HOUSE_LEVELS, getFishHouseImageUrl, getFishHouseCapacity, getShipCapacity, GOLD_COIN_ICON, GEM_ICON, WAREHOUSE_BG, WEAPON_SMALL_MISSILE_ICON, WEAPON_SMALL_MISSILE_BG, WEAPON_MEDIUM_MISSILE_ICON, WEAPON_MEDIUM_MISSILE_BG, WEAPON_LARGE_MISSILE_ICON, WEAPON_LARGE_MISSILE_BG, WEAPON_MEDIA_BOMB_ICON, WEAPON_MEDIA_BOMB_BG, WEAPON_ATOMIC_BOMB_ICON, WEAPON_ATOMIC_BOMB_BG, SHIP_GUARDIAN_ICON, SHIP_GUARDIAN_BG, FIXER_SMALL_ICON, FIXER_SMALL_BG, FIXER_MEDIUM_ICON, FIXER_MEDIUM_BG, FIXER_LARGE_ICON, FIXER_LARGE_BG, FIXER_LEGENDARY_ICON, FIXER_LEGENDARY_BG, SAILOR_ICON, SAILOR_BG, GOLDEN_HUNTER_ICON, GOLDEN_HUNTER_BG, MARKET_EXPERT_ICON, MARKET_EXPERT_BG, LUCK_PIRATE_ICON, LUCK_PIRATE_BG, SHIP_PILOT_ICON, SHIP_PILOT_BG, SHIP_THIEF_ICON, SHIP_THIEF_BG, CREW_SHOP_ITEMS, WEAPONS_DATA } from './data';
import FishHouseComponent from './components/FishHouseComponent';
import GoogleAccountSelector from './components/GoogleAccountSelector';
import LandingScreen from './components/LandingScreen';
import SigninScreen from './components/SigninScreen';
import RegisterScreen from './components/RegisterScreen';
import ShipWarehouse from './components/ShipWarehouse';
import PirateShop from './components/PirateShop';
import InventoryComponent from './components/InventoryComponent';
import CrewTavernModal from './components/CrewTavernModal';
import ParticlesEffect from './components/ParticlesEffect';
import { InGameNotificationBanner } from './components/InGameNotificationBanner';
import { playNotificationSound } from './utils/notificationSound';
import { LargeRocketExplosion } from './components/LargeRocketExplosion';
import { MediumRocketExplosion } from './components/MediumRocketExplosion';
import { SmallRocketExplosion } from './components/SmallRocketExplosion';
import { AtomicBombExplosion } from './components/AtomicBombExplosion';
import { 
  playLargeRocketIncomingSound, 
  playLargeRocketExplosionSound,
  playMediumRocketIncomingSound,
  playMediumRocketExplosionSound,
  playSmallRocketIncomingSound,
  playSmallRocketExplosionSound,
  playAtomicBombDropSound,
  playAtomicBombExplosionSound,
  playMediaBombExplosionSound
} from './utils/explosionSound';
import { playDetonationWarningVoiceAndSound } from './utils/warningDetonationSound';

import ShipImage from './components/ShipImage';
import ShipCrewMember, { CREW_VISUAL_MAP, sanitizeShipCrew } from './components/ShipCrewMember';
import { SettingsView } from './components/SettingsView';
import { LeaderboardView } from './components/LeaderboardView';
// @ts-ignore
import destroyedPortImg from './assets/images/destroyed_port_1784900250438.jpg';

import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { executeFinancialTransaction, isNetworkOnline, notifyOfflineBlocked } from './services/financialTransaction';
import { 
  getLocalSessionId, 
  setLocalSessionId, 
  clearLocalSessionId, 
  registerNewUserSession, 
  verifyActiveSession,
  getClientDeviceInfo,
  getOrCreateDeviceId,
  recoverSessionFromDevice
} from './services/sessionManager';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  getDocs,
  setDoc, 
  updateDoc,
  deleteDoc,
  collection, 
  addDoc, 
  query, 
  where,
  orderBy, 
  onSnapshot, 
  limit,
  serverTimestamp
} from 'firebase/firestore';

function normalizeString(str?: string): string {
  if (!str) return '';
  return str.toLowerCase().trim()
    .replace(/[أإآا]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u0652]/g, '')
    .replace(/\s+/g, '');
}

const getFishEmoji = (fullName: string): string => {
  if (!fullName) return '🐟';
  const emojis = ['🐠', '🦐', '🦀', '🦑', '🐙', '🦞', '🐍', '⚔️', '🦈', '⛵', '🐋', '🐉', '🏮', '🐟'];
  for (const emoji of emojis) {
    if (fullName.includes(emoji)) {
      return emoji;
    }
  }
  return '🐟';
};

function GoogleLoginTunnelHelper() {
  const [status, setStatus] = useState<'initiating' | 'loading' | 'success' | 'error'>('initiating');
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    const runTunnel = async () => {
      setStatus('loading');
      try {
        const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        if (user && user.email) {
          const credential = GoogleAuthProvider.credentialFromResult(result);
          const googleIdToken = credential?.idToken;
          
          if (!googleIdToken) {
            throw new Error('لم يتم استرجاع رمز Google (idToken). يرجى التأكد من تسجيل الدخول بشكل صحيح.');
          }

          const parentOrigin = new URLSearchParams(window.location.search).get('parent_origin') || '*';
          
          if (window.opener) {
            window.opener.postMessage({
              type: 'GOOGLE_TUNNEL_SUCCESS',
              idToken: googleIdToken,
              email: user.email,
              displayName: user.displayName || user.email.split('@')[0],
              photoURL: user.photoURL
            }, parentOrigin);
          }
          
          setStatus('success');
          setTimeout(() => {
            window.close();
          }, 1200);
        } else {
          throw new Error('لم يتم استرجاع معلومات المستخدم.');
        }
      } catch (err: any) {
        console.error('Tunnel OAuth Error:', err);
        const parentOrigin = new URLSearchParams(window.location.search).get('parent_origin') || '*';
        if (window.opener) {
          window.opener.postMessage({
            type: 'GOOGLE_TUNNEL_ERROR',
            error: err.message || String(err)
          }, parentOrigin);
        }
        setStatus('error');
        setErrMsg(err.message || 'خطأ غير معروف');
      }
    };
    
    runTunnel();
  }, []);

  return (
    <div className="min-h-screen bg-[#04060b] text-white flex flex-col items-center justify-center p-6 text-center font-['Cairo',_sans-serif]">
      <div className="bg-[#0b101d] border border-amber-600/30 rounded-2xl p-8 max-w-sm w-full shadow-[0_0_50px_rgba(217,119,6,0.25)] flex flex-col items-center">
        <span className="text-4xl mb-4">⚓</span>
        {status === 'loading' && (
          <>
            <h3 className="text-lg font-bold text-amber-500 mb-2">جاري الاتصال بـ Google...</h3>
            <p className="text-xs text-gray-400">يرجى تسجيل الدخول من النافذة المنبثقة لإكمال الإبحار.</p>
            <div className="mt-4 w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </>
        )}
        {status === 'success' && (
          <>
            <h3 className="text-lg font-bold text-green-500 mb-2">تم تسجيل الدخول بنجاح!</h3>
            <p className="text-xs text-gray-400">جاري نقل البيانات الآمنة إلى سفينتك...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <h3 className="text-lg font-bold text-red-500 mb-2">فشل تسجيل الدخول</h3>
            <p className="text-xs text-red-400 font-mono mb-4 break-all">{errMsg}</p>
            <button 
              onClick={() => window.close()} 
              className="bg-gray-800 hover:bg-gray-700 text-white text-xs px-4 py-2 rounded-lg font-bold cursor-pointer"
            >
              إغلاق النافذة
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  // --- Google Login Tunnel Interceptor ---
  const [isTunnel] = useState<boolean>(() => {
    return new URLSearchParams(window.location.search).get('google_login_tunnel') === 'true';
  });

  // --- Authentication State ---
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('pirate_is_logged_in') === 'true';
  });
  const [currentUser, setCurrentUser] = useState<any>(() => auth.currentUser);

  if (isTunnel) {
    return <GoogleLoginTunnelHelper />;
  }

  const [authScreen, setAuthScreen] = useState<'landing' | 'login' | 'register'>('landing');

  const [loadingFirebase, setLoadingFirebase] = useState<boolean>(true);
  const isLoadedFromFirebase = useRef(false);
  const isDeletingAccount = useRef(false);
  const unsubUserSnapshot = useRef<(() => void) | null>(null);
  const lastDbData = useRef<any>(null);
  const justLoadedFromFirestore = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- Multi-Device / Concurrent Session Management ---
  const [sessionTerminationNotice, setSessionTerminationNotice] = useState<{
    newDevice: string;
    lastLoginAt?: string;
  } | null>(null);
  const [isRecoveringSession, setIsRecoveringSession] = useState(false);
  const isSessionTerminated = useRef(false);

  const handleTerminateOldSession = async (info: { newDevice: string; lastLoginAt?: string }) => {
    if (isSessionTerminated.current) return;
    isSessionTerminated.current = true;

    console.warn('[SESSION MANAGER] Session superseded by another device/browser:', info);

    // Cancel pending auto-save timeout so old state is never flushed to Firestore
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    // Unsubscribe from real-time listener temporarily while terminated
    if (unsubUserSnapshot.current) {
      try {
        unsubUserSnapshot.current();
      } catch (e) {}
      unsubUserSnapshot.current = null;
    }

    // Clear local active session credentials and mark status expired
    clearLocalSessionId();
    localStorage.setItem('pirate_is_logged_in', 'false');

    // Show persistent warning notice to user and disable actions
    setSessionTerminationNotice(info);
    setIsLoggedIn(false);
  };

  const handleRecoverSessionFromThisDevice = async () => {
    setIsRecoveringSession(true);
    try {
      const targetUid = auth.currentUser?.uid || localStorage.getItem('google_auth_uid');
      if (!targetUid) {
        setSessionTerminationNotice(null);
        isSessionTerminated.current = false;
        setIsLoggedIn(false);
        setAuthScreen('login');
        return;
      }

      // 1. Invalidate and freeze the previous session on the other device and register this device as ACTIVE
      const { sessionId, deviceId, userDocData } = await recoverSessionFromDevice(targetUid);

      // 2. Direct Re-fetch of User Progress (gold, gems, levels, buildings, quests, inventory)
      const userDocRef = doc(db, 'users', targetUid);
      let data = userDocData;
      if (!data) {
        const freshSnap = await getDoc(userDocRef);
        if (freshSnap.exists()) {
          data = freshSnap.data();
        }
      }

      if (data) {
        lastDbData.current = data;
        justLoadedFromFirestore.current = true;

        if (data.username) setUsername(data.username);
        if (data.avatar) setAvatar(data.avatar);
        if (data.server) setServer(data.server);
        if (data.pirateClass) setPirateClass(data.pirateClass);
        
        if (typeof data.gold === 'number') setGold(data.gold);
        if (typeof data.gems === 'number') setGems(data.gems);
        if (typeof data.exp === 'number') setExp(data.exp);
        if (typeof data.redGems === 'number') setRedGems(data.redGems);
        if (typeof data.fishStorageLevel === 'number') setFishStorageLevel(data.fishStorageLevel);
        if (typeof data.shipTowerLevel === 'number') setShipTowerLevel(data.shipTowerLevel);
        
        if (data.ships && Array.isArray(data.ships) && data.ships.length > 0) {
          setShips(data.ships);
          localStorage.setItem('pirate_ships', JSON.stringify(data.ships));
        }
        if (data.crew) setCrew(data.crew);
        if (data.quests) setQuests(data.quests);
        if (data.battleReports) setBattleReports(data.battleReports);
        if (data.fishInventory) setFishInventory(data.fishInventory);
        if (data.weapons) setWeapons(data.weapons);
        if (data.crewServices) setCrewServices(data.crewServices);
        if (data.crewInventory) setCrewInventory(data.crewInventory);
        if (data.shieldInventory) setShieldInventory(data.shieldInventory);
        if (Array.isArray(data.friends)) setFriends(data.friends);
        if (Array.isArray(data.friendRequests)) setFriendRequests(data.friendRequests);
        if (data.tribeId) setTribeId(data.tribeId);
        if (data.tribeName) setTribeName(data.tribeName);
        if (typeof data.portDestroyed === 'boolean') {
          setPortDestroyed(data.portDestroyed);
          localStorage.setItem('pirate_port_destroyed', data.portDestroyed.toString());
        }
      }

      // 3. Clear termination state and return immediately to game
      isSessionTerminated.current = false;
      setSessionTerminationNotice(null);
      setIsLoggedIn(true);
      localStorage.setItem('pirate_is_logged_in', 'true');

      // 4. Re-attach real-time listener for future multi-device conflicts
      if (unsubUserSnapshot.current) {
        try { unsubUserSnapshot.current(); } catch (e) {}
      }
      unsubUserSnapshot.current = onSnapshot(userDocRef, (docSnap) => {
        if (isDeletingAccount.current || docSnap.metadata.hasPendingWrites) return;
        if (docSnap.exists()) {
          const snapData = docSnap.data();
          const serverDeviceId = snapData.currentDeviceId;
          const localDevId = getOrCreateDeviceId();
          const serverStatus = snapData.sessionStatus;

          if ((serverDeviceId && localDevId && serverDeviceId !== localDevId) || serverStatus === 'EXPIRED') {
            handleTerminateOldSession({
              newDevice: snapData.lastLoginDevice || 'جهاز أو متصفح آخر',
              lastLoginAt: snapData.lastLoginAt
            });
            return;
          }

          lastDbData.current = snapData;
          justLoadedFromFirestore.current = true;
          
          if (typeof snapData.gold === 'number') setGold(snapData.gold);
          if (typeof snapData.gems === 'number') setGems(snapData.gems);
          if (typeof snapData.exp === 'number') setExp(snapData.exp);
          if (typeof snapData.redGems === 'number') setRedGems(snapData.redGems);
          if (typeof snapData.fishStorageLevel === 'number') setFishStorageLevel(snapData.fishStorageLevel);
          if (typeof snapData.shipTowerLevel === 'number') setShipTowerLevel(snapData.shipTowerLevel);
          if (snapData.ships && Array.isArray(snapData.ships)) setShips(snapData.ships.map((s: any) => ({ ...s, moving: false })));
          if (snapData.quests) setQuests(snapData.quests);
        }
      }, (err) => {
        console.warn("Real-time listener after recovery warning:", err);
      });

      console.log(`[SESSION RECOVERY] Successfully recovered session ${sessionId} for user ${targetUid} on device ${deviceId}`);
    } catch (err: any) {
      console.error('Failed to recover session:', err);
      alert('تعذر استعادة الجلسة في الوقت الحالي. يرجى إعادة المحاولة.');
    } finally {
      setIsRecoveringSession(false);
    }
  };

  const areFieldsEqual = (a: any, b: any) => {
    if (!a || !b) return false;
    
    // Compare primitives
    const primitives = [
      'username', 'avatar', 'server', 'pirateClass', 'gold', 'gems', 'exp', 
      'redGems', 'fishStorageLevel', 'shipTowerLevel', 'portDestroyed'
    ];
    for (const key of primitives) {
      const valA = a[key];
      const valB = b[key];
      if ((valA ?? '') !== (valB ?? '')) {
        if (typeof valA === 'number' && typeof valB === 'number' && valA === valB) continue;
        return false;
      }
    }
    
    // JSON stringify comparison for structured objects/arrays, normalizing undefined/null to defaults
    const structured = [
      'ships', 'crew', 'quests', 'battleReports', 'fishInventory', 'weapons', 'crewServices'
    ];
    for (const key of structured) {
      const valA = a[key] || (['ships', 'crew', 'quests', 'battleReports'].includes(key) ? [] : {});
      const valB = b[key] || (['ships', 'crew', 'quests', 'battleReports'].includes(key) ? [] : {});
      if (JSON.stringify(valA) !== JSON.stringify(valB)) {
        return false;
      }
    }
    
    return true;
  };
  const videoRefA = useRef<HTMLVideoElement | null>(null);
  const videoRefB = useRef<HTMLVideoElement | null>(null);
  const [activeVideo, setActiveVideo] = useState<'A' | 'B'>('A');
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  // --- Leaping Sea Creatures State ---
  const [creatures, setCreatures] = useState(() => [
    { id: 1, type: 'humpback', left: 42, top: 43, zIndex: 1, alt: 'Humpback Whale', src: 'https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/whale-humpback.png' },
    { id: 2, type: 'humpback', left: 78, top: 58, zIndex: 4, alt: 'Humpback Whale', src: 'https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/whale-humpback.png' },
    { id: 3, type: 'humpback', left: 56, top: 64, zIndex: 1, alt: 'Humpback Whale', src: 'https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/whale-humpback.png' },
    { id: 4, type: 'humpback', left: 38, top: 40, zIndex: 1, alt: 'Humpback Whale', src: 'https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/whale-humpback.png' },
    { id: 5, type: 'humpback', left: 74, top: 55, zIndex: 4, alt: 'Humpback Whale', src: 'https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/whale-humpback.png' },
    { id: 6, type: 'humpback', left: 52, top: 61, zIndex: 1, alt: 'Humpback Whale', src: 'https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/whale-humpback.png' },
  ]);

  const handleCreatureIteration = (id: number) => {
    // Only handle leaders (1, 2, 3) to keep leader and follower positions perfectly aligned
    if (id !== 1 && id !== 2 && id !== 3) return;

    // Choose one of 4 zones randomly to distribute creatures widely:
    // Zone 0: Behind/around the docked ships (left/background)
    // Zone 1: In front of/next to the docked ships (middle area)
    // Zone 2: Between the ships vertically (vertical gaps)
    // Zone 3: Deep sea / fishing spots area (right side)
    const zone = Math.floor(Math.random() * 4);
    let randomLeft = 70;
    let randomTop = 50;
    let randomZIndex = 4;

    if (zone === 0) {
      // Behind/next to docked ships (Dock is left: 45%)
      randomLeft = Math.floor(Math.random() * 12) + 32; // 32% to 44%
      randomTop = Math.floor(Math.random() * 35) + 35;  // 35% to 70%
      randomZIndex = 1; // Always behind ships (ships are z-index: 2)
    } else if (zone === 1) {
      // In front of/beside the docked ships (Middle area)
      randomLeft = Math.floor(Math.random() * 18) + 46; // 46% to 64%
      randomTop = Math.floor(Math.random() * 35) + 35;  // 35% to 70%
      randomZIndex = Math.random() > 0.4 ? 4 : 1;      // Sometimes in front, sometimes behind
    } else if (zone === 2) {
      // Between the ships vertically
      randomLeft = Math.floor(Math.random() * 30) + 40; // 40% to 70%
      // Vertical gaps: choose between top rows (38%-49% -> 42%-45%) or middle rows (49%-60% -> 53%-56%)
      const gapChoice = Math.random() > 0.5 ? 0 : 1;
      randomTop = gapChoice === 0 
        ? Math.floor(Math.random() * 4) + 42  // 42% to 45% (between s1 and s2)
        : Math.floor(Math.random() * 4) + 53; // 53% to 56% (between s2 and s3)
      randomZIndex = Math.random() > 0.5 ? 4 : 1;      // Mixed layering
    } else {
      // Deep sea / Fishing area (Right side)
      randomLeft = Math.floor(Math.random() * 24) + 68; // 68% to 92%
      randomTop = Math.floor(Math.random() * 45) + 33;  // 33% to 78%
      randomZIndex = Math.random() > 0.3 ? 4 : 1;      // Mostly in front, sometimes behind
    }

    setCreatures(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          left: randomLeft,
          top: randomTop,
          zIndex: randomZIndex
        };
      }
      if (c.id === id + 3) {
        // Follower is slightly offset (behind and above/below the leader)
        return {
          ...c,
          left: randomLeft - 4, // 4% to the left (behind in a left-to-right jump)
          top: randomTop - 3,  // 3% higher
          zIndex: randomZIndex
        };
      }
      return c;
    }));
  };

  // --- Initial Game State Defaults ---
  const DEFAULT_GOLD = 500;
  const DEFAULT_GEMS = 25;
  const DEFAULT_EXP = 0;
  const DEFAULT_RED_GEMS = 2450;
  const DEFAULT_FISH_STORAGE_LEVEL = 1;
  const DEFAULT_SHIP_TOWER_LEVEL = 1;
  const DEFAULT_SHIPS: ShipState[] = [
    { id: 's1', name: 'قارب خشبي متهالك', status: 'docked', left: '45%', top: '38%', scaleX: 1, moving: false, exists: true, crewPower: 0, hasNetUpgrade: false, hasEngineUpgrade: false, level: 0, hook: 25, cargo: 2000, heart: 200, durationStr: '00:30', power: 5, armor: 5, fishTypes: ['سردين', 'أنشوجة'], imgEmoji: '🛶' },
    { id: 's2', name: 'قارب خشبي متهالك', status: 'docked', left: '45%', top: '49%', scaleX: 1, moving: false, exists: true, crewPower: 0, hasNetUpgrade: false, hasEngineUpgrade: false, level: 0, hook: 25, cargo: 2000, heart: 200, durationStr: '00:30', power: 5, armor: 5, fishTypes: ['سردين', 'أنشوجة'], imgEmoji: '🛶' },
    { id: 's3', name: 'قارب خشبي متهالك', status: 'docked', left: '45%', top: '60%', scaleX: 1, moving: false, exists: true, crewPower: 0, hasNetUpgrade: false, hasEngineUpgrade: false, level: 0, hook: 25, cargo: 2000, heart: 200, durationStr: '00:30', power: 5, armor: 5, fishTypes: ['سردين', 'أنشوجة'], imgEmoji: '🛶' }
  ];
  const DEFAULT_CREW: CrewMember[] = [
    { id: 'c1', name: 'القبطان صخر', role: 'قبطان البحار', power: 30, cost: 150, avatar: '👨‍✈️', hired: false },
    { id: 'c2', name: 'الملاح رعد', role: 'ملاح الميناء', power: 15, cost: 80, avatar: '🧭', hired: false },
    { id: 'c3', name: 'المدفعجي غضب', role: 'رئيس المدفعية', power: 45, cost: 250, avatar: '💣', hired: false },
    { id: 'c4', name: 'البحار سندباد', role: 'مستكشف الجزر', power: 20, cost: 120, avatar: '🌊', image: SAILOR_ICON, hired: false },
  ];
  const DEFAULT_QUESTS: Quest[] = [
    { id: 'q1', title: 'صياد الأنشوجة النشيط', target: 'أرسل السفن للصيد 3 مرات', progress: 0, max: 3, rewardGold: 100, rewardGems: 2, completed: false, claimed: false },
    { id: 'q2', title: 'توسيع طاقم القيادة', target: 'قم بتعيين بحار واحد على الأقل', progress: 0, max: 1, rewardGold: 150, rewardGems: 5, completed: false, claimed: false },
    { id: 'q3', title: 'دعم التحالف الحليف', target: 'تبرع للتحالف بـ 50 ذهب', progress: 0, max: 50, rewardGold: 80, rewardGems: 1, completed: false, claimed: false },
  ];
  const DEFAULT_FISH_INVENTORY = {
    'أنشوجة المياه الدافئة 🐟': 15,
    'سردين ملوك الأعماق 🐟': 8,
  };
  const DEFAULT_WEAPONS = {
    smallRocket: 320,
    mediumRocket: 902,
    largeRocket: 6435,
    atomicBomb: 795,
    adBomb: 101,
    antiRocketDisabler: 6,
    antiNukeDisabler: 6,
    antiAdDisabler: 7,
    smallRepair: 2,
    mediumRepair: 0,
    largeRepair: 0,
    legendaryRepair: 0,
  };
  const DEFAULT_CREW_SERVICES = {
    luck: false,
    sailors: false,
    guide: false,
    police: false,
    thief: false,
    merchant: false,
    repairer_small: 5,
    repairer_medium: 3,
    repairer_large: 1,
    repairer_legendary: 0,
  };

  const resetStateToDefaults = () => {
    // Reset React States
    setGold(DEFAULT_GOLD);
    setGems(DEFAULT_GEMS);
    setExp(DEFAULT_EXP);
    setRedGems(DEFAULT_RED_GEMS);
    setFishStorageLevel(DEFAULT_FISH_STORAGE_LEVEL);
    setShipTowerLevel(DEFAULT_SHIP_TOWER_LEVEL);
    setShips(DEFAULT_SHIPS);
    setCrew(DEFAULT_CREW);
    setQuests(DEFAULT_QUESTS);
    setBattleReports([]);
    setFishInventory(DEFAULT_FISH_INVENTORY);
    setWeapons(DEFAULT_WEAPONS);
    setCrewServices(DEFAULT_CREW_SERVICES);
    setPortDestroyed(false);
    setUsername('سياف_البحار');
    setAvatar('☠️');
    setServer('سيرفر الأسطورة 1');
    setPirateClass('صياد البحار');
    setFriends([]);
    setFriendRequests([]);
    setTribeId('');
    setTribeName('');
    setChatMessages([]);
    setInspectedPlayer(null);
    setSelectedVisitedShip(null);
    lastDbData.current = null;
    
    // Clear LocalStorage of game data and user tokens
    const keysToRemove = [
      'gold', 'gems', 'pirate_exp', 'pirate_port_destroyed',
      'pirate_username', 'pirate_avatar', 'pirate_server', 'pirate_class',
      'pirate_crew_services', 'pirate_bg_theme', 'pirate_profile_theme',
      'pirate_ships_v2', 'pirate_battle_reports', 'fish_storage_level',
      'ship_tower_level', 'pirate_fish_inventory', 'pirate_red_gems',
      'pirate_weapons', 'google_auth_token', 'google_auth_email',
      'google_auth_name', 'google_auth_avatar', 'pirate_is_logged_in'
    ];
    keysToRemove.forEach(key => localStorage.removeItem(key));
  };

  const getTotalFish = (): number => {
    return Object.values(fishInventory || {}).reduce<number>((sum, count) => sum + (Number(count) || 0), 0);
  };

  // --- Game Currencies & Captain Stats ---
  const [gold, setGold] = useState<number>(() => {
    return parseInt(localStorage.getItem('gold') || '500');
  });
  const [gems, setGems] = useState<number>(() => {
    return parseInt(localStorage.getItem('gems') || '25');
  });
  const [exp, setExp] = useState<number>(() => {
    return parseInt(localStorage.getItem('pirate_exp') || '0');
  });
  const [portDestroyed, setPortDestroyed] = useState<boolean>(() => {
    return localStorage.getItem('pirate_port_destroyed') === 'true';
  });

  // --- Network Online Connectivity & Anti-Desync State ---
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean' ? navigator.onLine : true;
  });
  const [offlineNotice, setOfflineNotice] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setOfflineNotice(null);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setOfflineNotice('⚠️ انقطع الاتصال بالإنترنت! تم تجميد العمليات المالية مؤقتاً لحماية رصيدك وأصولك ومنع حدوث تضارب في البيانات.');
    };
    const handleFinancialBlocked = (e: any) => {
      const msg = e.detail?.message || '⚠️ تم إيقاف العملية المالية لعدم وجود اتصال بالإنترنت.';
      setOfflineNotice(msg);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('financial-offline-blocked', handleFinancialBlocked);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('financial-offline-blocked', handleFinancialBlocked);
    };
  }, []);

  // --- Profile Settings ---
  const [username, setUsername] = useState(() => localStorage.getItem('pirate_username') || 'سياف_البحار');
  const [avatar, setAvatar] = useState(() => localStorage.getItem('pirate_avatar') || '☠️');
  const [server, setServer] = useState(() => localStorage.getItem('pirate_server') || 'سيرفر الأسطورة 1');
  const [pirateClass, setPirateClass] = useState(() => localStorage.getItem('pirate_class') || 'صياد البحار');

  // --- Active Tab ---
  const [activeTab, setActiveTab] = useState<'harbor' | 'battle' | 'shop' | 'tribes' | 'chat' | 'leaderboard' | 'reports' | 'settings' | 'inventory' | 'warehouse' | 'friends'>('harbor');
  const [shopSubTab, setShopSubTab] = useState<'recharge' | 'backgrounds' | 'vip' | 'share' | 'crew_services' | 'hamour' | 'defense' | 'thihn'>('recharge');
  const [shopBoard, setShopBoard] = useState<'board1' | 'board2'>('board1');
  const [shopSubFilter, setShopSubFilter] = useState<'all' | 'offers' | 'gems' | 'gold' | 'crew' | 'weapons' | 'shields' | 'bundles'>('all');
  const [payingItem, setPayingItem] = useState<any | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentStep, setPaymentStep] = useState<'details' | 'loading' | 'success'>('details');
  const [bgTheme, setBgTheme] = useState<string>(() => {
    const saved = localStorage.getItem('pirate_bg_theme') || 'classic';
    return ['classic', 'destroyed'].includes(saved) ? saved : 'classic';
  });
  const [profileTheme, setProfileTheme] = useState<string>(() => localStorage.getItem('pirate_profile_theme') || 'default');

  // --- Crew Services ---
  const [crewServices, setCrewServices] = useState<Record<string, any>>(() => {
    const saved = localStorage.getItem('pirate_crew_services');
    return saved ? JSON.parse(saved) : {
      luck: false,
      sailors: false,
      guide: false,
      police: false,
      thief: false,
      merchant: false,
      repairer_small: 5,
      repairer_medium: 3,
      repairer_large: 1,
      repairer_legendary: 0,
    };
  });

  useEffect(() => {
    localStorage.setItem('pirate_crew_services', JSON.stringify(crewServices));
  }, [crewServices]);

  // --- Crew Inventory State (المخزن - أفراد الطاقم والشخصيات) ---
  const [crewInventory, setCrewInventory] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('pirate_crew_inventory');
    return saved ? JSON.parse(saved) : {
      guide: 1,
      luck: 1,
      sailor: 0,
      thief: 1,
      cop: 1,
      merchant: 0,
      fixer_sm: 5,
      fixer_md: 3,
      fixer_lg: 1,
      fixer_epic: 0,
      market_expert: 1,
      gold_fisher: 1,
    };
  });

  useEffect(() => {
    localStorage.setItem('pirate_crew_inventory', JSON.stringify(crewInventory));
  }, [crewInventory]);

  // --- Shield Inventory State (المخزن - دروع الحماية) ---
  const [shieldInventory, setShieldInventory] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('pirate_shield_inventory');
    return saved ? JSON.parse(saved) : {
      shield_4h: 1,
      shield_1d: 0,
      shield_2d: 0,
      anti_nuke: 0,
      anti_emp: 0,
      disable_anti_range: 0,
      disable_anti_core: 0,
    };
  });

  useEffect(() => {
    localStorage.setItem('pirate_shield_inventory', JSON.stringify(shieldInventory));
  }, [shieldInventory]);

  useEffect(() => {
    localStorage.setItem('pirate_bg_theme', bgTheme);
  }, [bgTheme]);

  useEffect(() => {
    localStorage.setItem('pirate_profile_theme', profileTheme);
  }, [profileTheme]);

  // --- Ships State ---
  const [ships, setShips] = useState<ShipState[]>(() => {
    const saved = localStorage.getItem('pirate_ships_v2');
    if (saved) {
      try {
        const loaded = JSON.parse(saved);
        if (Array.isArray(loaded)) {
          // Keep exactly 3 ships, and ensure they all exist by default if not set
          const sanitized = loaded.slice(0, 3).map((s: any) => {
            const validCrew = sanitizeShipCrew(s.assignedCrew);
            return {
              ...s,
              exists: s.exists !== undefined ? s.exists : true,
              assignedCrew: validCrew,
              crewPower: validCrew.length * 15,
              moving: false
            };
          });
          if (sanitized.length > 0) {
            while (sanitized.length < 3) {
              const defaults = [
                { id: 's1', name: 'قارب خشبي متهالك', status: 'docked', left: '45%', top: '38%', scaleX: 1, moving: false, exists: true, crewPower: 0, hasNetUpgrade: false, hasEngineUpgrade: false, level: 0, hook: 25, cargo: 2000, heart: 200, durationStr: '00:30', power: 5, armor: 5, fishTypes: ['سردين', 'أنشوجة'], imgEmoji: '🛶' },
                { id: 's2', name: 'قارب خشبي متهالك', status: 'docked', left: '45%', top: '49%', scaleX: 1, moving: false, exists: true, crewPower: 0, hasNetUpgrade: false, hasEngineUpgrade: false, level: 0, hook: 25, cargo: 2000, heart: 200, durationStr: '00:30', power: 5, armor: 5, fishTypes: ['سردين', 'أنشوجة'], imgEmoji: '🛶' },
                { id: 's3', name: 'قارب خشبي متهالك', status: 'docked', left: '45%', top: '60%', scaleX: 1, moving: false, exists: true, crewPower: 0, hasNetUpgrade: false, hasEngineUpgrade: false, level: 0, hook: 25, cargo: 2000, heart: 200, durationStr: '00:30', power: 5, armor: 5, fishTypes: ['سردين', 'أنشوجة'], imgEmoji: '🛶' }
              ];
              const missingIdx = sanitized.length;
              sanitized.push(defaults[missingIdx]);
            }
            return sanitized;
          }
        }
      } catch (e) {
        console.error("Error parsing ships storage:", e);
      }
    }
    return [
      { id: 's1', name: 'قارب خشبي متهالك', status: 'docked', left: '45%', top: '38%', scaleX: 1, moving: false, exists: true, crewPower: 0, hasNetUpgrade: false, hasEngineUpgrade: false, level: 0, hook: 25, cargo: 2000, heart: 200, durationStr: '00:30', power: 5, armor: 5, fishTypes: ['سردين', 'أنشوجة'], imgEmoji: '🛶' },
      { id: 's2', name: 'قارب خشبي متهالك', status: 'docked', left: '45%', top: '49%', scaleX: 1, moving: false, exists: true, crewPower: 0, hasNetUpgrade: false, hasEngineUpgrade: false, level: 0, hook: 25, cargo: 2000, heart: 200, durationStr: '00:30', power: 5, armor: 5, fishTypes: ['سردين', 'أنشوجة'], imgEmoji: '🛶' },
      { id: 's3', name: 'قارب خشبي متهالك', status: 'docked', left: '45%', top: '60%', scaleX: 1, moving: false, exists: true, crewPower: 0, hasNetUpgrade: false, hasEngineUpgrade: false, level: 0, hook: 25, cargo: 2000, heart: 200, durationStr: '00:30', power: 5, armor: 5, fishTypes: ['سردين', 'أنشوجة'], imgEmoji: '🛶' },
    ];
  });

  // Ensure crewServices are strictly in sync with ships' assignedCrew
  useEffect(() => {
    const allAssigned = ships.flatMap(s => s.assignedCrew || []);
    const anyHasGH = allAssigned.includes('golden_hunter') || allAssigned.includes('gold_fisher');
    const anyHasLuck = allAssigned.includes('luck');
    const anyHasSailor = allAssigned.includes('sailor') || allAssigned.includes('sailors');
    const anyHasGuide = allAssigned.includes('guide');
    const anyHasCop = allAssigned.includes('cop') || allAssigned.includes('police');
    const anyHasThief = allAssigned.includes('thief');

    let changed = false;
    const updated = { ...crewServices };

    if (!anyHasGH && (updated.golden_hunter || updated.gold_fisher)) {
      updated.golden_hunter = false;
      updated.gold_fisher = false;
      changed = true;
    }
    if (!anyHasLuck && updated.luck) {
      updated.luck = false;
      changed = true;
    }
    if (!anyHasSailor && (updated.sailor || updated.sailors)) {
      updated.sailor = false;
      updated.sailors = false;
      changed = true;
    }
    if (!anyHasGuide && updated.guide) {
      updated.guide = false;
      changed = true;
    }
    if (!anyHasCop && (updated.cop || updated.police)) {
      updated.cop = false;
      updated.police = false;
      changed = true;
    }
    if (!anyHasThief && updated.thief) {
      updated.thief = false;
      changed = true;
    }

    if (changed) {
      setCrewServices(updated);
      localStorage.setItem('pirate_crew_services', JSON.stringify(updated));
    }
  }, [ships]);

  // --- Crew State ---
  const [crew, setCrew] = useState<CrewMember[]>([
    { id: 'c1', name: 'القبطان صخر', role: 'قبطان البحار', power: 30, cost: 150, avatar: '👨‍✈️', hired: false },
    { id: 'c2', name: 'الملاح رعد', role: 'ملاح الميناء', power: 15, cost: 80, avatar: '🧭', hired: false },
    { id: 'c3', name: 'المدفعجي غضب', role: 'رئيس المدفعية', power: 45, cost: 250, avatar: '💣', hired: false },
    { id: 'c4', name: 'البحار سندباد', role: 'مستكشف الجزر', power: 20, cost: 120, avatar: '🌊', image: SAILOR_ICON, hired: false },
  ]);

  // --- Real Multiplayer Friends & Tribe States ---
  const [friends, setFriends] = useState<string[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [tribeId, setTribeId] = useState<string>('');
  const [tribeName, setTribeName] = useState<string>('');
  const [tribes, setTribes] = useState<any[]>([]);
  const [showCreateTribeModal, setShowCreateTribeModal] = useState(false);
  const [newTribeName, setNewTribeName] = useState('');
  const [newTribeDesc, setNewTribeDesc] = useState('');
  const [newTribeEmblem, setNewTribeEmblem] = useState('🏴‍☠️');
  const [friendSearchQuery, setFriendSearchQuery] = useState('');

  // --- Quests State ---
  const [quests, setQuests] = useState<Quest[]>([
    { id: 'q1', title: 'صياد الأنشوجة النشيط', target: 'أرسل السفن للصيد 3 مرات', progress: 0, max: 3, rewardGold: 100, rewardGems: 2, completed: false, claimed: false },
    { id: 'q2', title: 'توسيع طاقم القيادة', target: 'قم بتعيين بحار واحد على الأقل', progress: 0, max: 1, rewardGold: 150, rewardGems: 5, completed: false, claimed: false },
    { id: 'q3', title: 'دعم التحالف الحليف', target: 'تبرع للتحالف بـ 50 ذهب', progress: 0, max: 50, rewardGold: 80, rewardGems: 1, completed: false, claimed: false },
  ]);

  // --- Battle Reports State ---
  const [battleReports, setBattleReports] = useState<BattleReport[]>(() => {
    const saved = localStorage.getItem('pirate_battle_reports');
    return saved ? JSON.parse(saved) : [];
  });

  // --- Real-time Real Players (Multiplayer) ---
  const [realPlayers, setRealPlayers] = useState<any[]>([]);
  const [leaderboardFilter, setLeaderboardFilter] = useState<'search' | 'donate' | 'tribes' | 'shop' | 'fish' | 'gold' | 'gems' | 'xp' | 'events'>('fish');
  const [leaderboardSearchQuery, setLeaderboardSearchQuery] = useState('');
  const [donationTargetPlayer, setDonationTargetPlayer] = useState<any | null>(null);
  const [donationAmount, setDonationAmount] = useState<number>(100);

  // --- Visited Player Profiles & Sea Interactions ---
  const [inspectedPlayer, setInspectedPlayer] = useState<any | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(false);
  const [inspectedPlayerShipVisit, setInspectedPlayerShipVisit] = useState<boolean>(false);
  const [selectedVisitedShip, setSelectedVisitedShip] = useState<any | null>(null);
  const [visitedBuildingModal, setVisitedBuildingModal] = useState<{ type: 'fish' | 'shipTower'; title: string; level: number; details: string; capacity?: number; image: string } | null>(null);
  const [activeInteractionType, setActiveInteractionType] = useState<'details' | 'steal' | 'repair' | null>(null);
  const [selectedOwnShipId, setSelectedOwnShipId] = useState<string>('s1');

  // --- Tactical Nuclear Strike States & Methods ---
  const [showWeaponSelector, setShowWeaponSelector] = useState<boolean>(false);
  const [isAtomicBombActive, setIsAtomicBombActive] = useState<boolean>(false);
  const [showAtomicExplosion, setShowAtomicExplosion] = useState<boolean>(false);
  const [showAtomicBombXp, setShowAtomicBombXp] = useState<boolean>(false);
  const [showLootSelector, setShowLootSelector] = useState<boolean>(false);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [gainedXpAnim, setGainedXpAnim] = useState<boolean>(false);
  const [selectedLootCard, setSelectedLootCard] = useState<number | null>(null);
  const [lootResultText, setLootResultText] = useState<string>('');

  // --- Custom Advanced Weapons States ---
  const [showGlobalMessageModal, setShowGlobalMessageModal] = useState<boolean>(false);
  const [globalMessageText, setGlobalMessageText] = useState<string>('');
  const [isLargeRocketActive, setIsLargeRocketActive] = useState<boolean>(false);
  const [showLargeRocketExplosion, setShowLargeRocketExplosion] = useState<boolean>(false);
  const [isMediumRocketActive, setIsMediumRocketActive] = useState<boolean>(false);
  const [showMediumRocketExplosion, setShowMediumRocketExplosion] = useState<boolean>(false);
  const [isSmallRocketActive, setIsSmallRocketActive] = useState<boolean>(false);
  const [showSmallRocketExplosion, setShowSmallRocketExplosion] = useState<boolean>(false);
  const [rocketTargetPos, setRocketTargetPos] = useState<{ l: string; t: string }>({ l: '45%', t: '49%' });
  const [showRocketXp, setShowRocketXp] = useState<boolean>(false);
  const [rocketXpText, setRocketXpText] = useState<string>('XP +100');
  const [showSmokeExplosion, setShowSmokeExplosion] = useState<boolean>(false);
  const [showAdSelectorModal, setShowAdSelectorModal] = useState<boolean>(false);
  const [showLegendaryRepairSparkles, setShowLegendaryRepairSparkles] = useState<boolean>(false);

  // Helper to dynamically calculate launch trajectory angle from bottom-right corner (96%, 96%) to target
  const getRocketLaunchAngle = (targetLeftStr: string, targetTopStr: string) => {
    const startX = 96;
    const startY = 96;
    const targetX = parseFloat(targetLeftStr) || 45;
    const targetY = parseFloat(targetTopStr) || 49;
    const dx = targetX - startX;
    const dy = targetY - startY;
    const deg = (Math.atan2(dy, dx) * 180 / Math.PI) + 90;
    return `${deg.toFixed(1)}deg`;
  };

  // --- In-Game Real-time Notification Banner States & Queue ---
  const [currentNotification, setCurrentNotification] = useState<GlobalNotification | null>(null);
  const [notificationQueue, setNotificationQueue] = useState<GlobalNotification[]>([]);
  const displayedNotifIds = useRef<Set<string>>(new Set());

  // Audio notification playback using imported synthesizer
  const triggerNotificationSound = (type: NotificationEventType) => {
    try {
      playNotificationSound(type, isMuted || isSfxMuted);
    } catch (e) {
      console.debug('Notification sound playback notice:', e);
    }
  };

  // Queue listener effect: when currentNotification is null and queue has items, advance queue cleanly outside render
  useEffect(() => {
    if (!currentNotification && notificationQueue.length > 0) {
      const next = notificationQueue[0];
      setNotificationQueue(prev => prev.slice(1));
      setCurrentNotification(next);
      triggerNotificationSound(next.type);
    }
  }, [currentNotification, notificationQueue]);

  const queueNotification = (notif: GlobalNotification) => {
    const key = notif.id || `${notif.type}_${notif.title}_${notif.message}`;
    if (displayedNotifIds.current.has(key)) return;
    displayedNotifIds.current.add(key);

    setNotificationQueue(prev => [...prev, notif]);
  };

  const showInGameBanner = (notif: GlobalNotification) => {
    queueNotification(notif);
  };

  const handleDismissNotification = () => {
    setCurrentNotification(null);
  };

  const handleToggleNotifSound = () => {
    setIsSfxMuted(prev => {
      const next = !prev;
      localStorage.setItem('pirate_sfx_muted', String(next));
      return next;
    });
  };

  const triggerGlobalNotification = async (params: {
    type: NotificationEventType;
    title: string;
    message: string;
    icon?: string;
    targetName?: string;
    targetId?: string;
    details?: string;
  }) => {
    const currentUser = auth.currentUser;
    const notifPayload: GlobalNotification = {
      type: params.type,
      title: params.title,
      message: params.message,
      icon: params.icon || (params.type === 'ATTACK' ? '⚔️' : params.type === 'SUPPORT' ? '🛡️' : '🏆'),
      authorId: currentUser?.uid || 'anonymous',
      senderId: currentUser?.uid || 'anonymous',
      authorName: username || 'قبطان_مجهول',
      senderName: username || 'قبطان_مجهول',
      targetName: params.targetName || '',
      targetId: params.targetId || '',
      details: params.details || '',
      createdAt: new Date().toISOString()
    };

    // Immediate visual presentation
    queueNotification(notifPayload);

    // Broadcast live to /globalNotifications collection for all connected players
    if (currentUser) {
      try {
        await addDoc(collection(db, 'globalNotifications'), notifPayload);
      } catch (err) {
        console.error("Error creating global notification:", err);
      }
    }
  };

  const sendGlobalNotification = async (
    type: NotificationEventType,
    title: string,
    message: string,
    targetName?: string,
    icon?: string
  ) => {
    return triggerGlobalNotification({ type, title, message, targetName, icon });
  };

  const playNuclearExplosionSound = () => {
    playAtomicBombDropSound();
    setTimeout(() => {
      playAtomicBombExplosionSound();
    }, 1350);
  };

  const playLuffyAdSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      if (ctx.state === 'suspended') ctx.resume();
      
      const now = ctx.currentTime;
      
      // Heroic anime brassy chord notes
      const notes = [
        { f: 261.63, d: 0.15 }, // C4
        { f: 329.63, d: 0.15 }, // E4
        { f: 392.00, d: 0.15 }, // G4
        { f: 523.25, d: 0.25 }, // C5
        { f: 659.25, d: 0.25 }, // E5
        { f: 783.99, d: 0.35 }, // G5
        { f: 1046.50, d: 0.60 } // C6
      ];
      
      let time = now;
      notes.forEach(note => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(note.f, time);
        
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.2, time + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, time + note.d);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + note.d);
        
        time += note.d - 0.05;
      });
      
      // Luffy's signature laugh sweep sequence
      let laughTime = time + 0.1;
      for (let i = 0; i < 6; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        
        osc.frequency.setValueAtTime(600 + i * 80, laughTime);
        osc.frequency.exponentialRampToValueAtTime(1200 + i * 80, laughTime + 0.12);
        
        gain.gain.setValueAtTime(0, laughTime);
        gain.gain.linearRampToValueAtTime(0.25, laughTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, laughTime + 0.12);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(laughTime);
        osc.stop(laughTime + 0.15);
        laughTime += 0.14;
      }
    } catch(e) {
      console.error(e);
    }
  };

  const playAdPoemSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      if (ctx.state === 'suspended') ctx.resume();
      
      const now = ctx.currentTime;
      
      // Majestic Middle Eastern Scale melody
      const notes = [
        { f: 293.66, d: 0.3 }, // D4
        { f: 311.13, d: 0.3 }, // Eb4
        { f: 349.23, d: 0.4 }, // F4
        { f: 392.00, d: 0.4 }, // G4
        { f: 440.00, d: 0.3 }, // A4
        { f: 466.16, d: 0.3 }, // Bb4
        { f: 554.37, d: 0.5 }, // C#5
        { f: 587.33, d: 0.8 }  // D5
      ];
      
      let time = now;
      notes.forEach(note => {
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.f, time);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, time);
        
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.2, time + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, time + note.d);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(time);
        osc.stop(time + note.d);
        time += note.d - 0.05;
      });
    } catch(e) {
      console.error(e);
    }
  };

  const playLegendaryRepairSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      if (ctx.state === 'suspended') ctx.resume();
      
      const now = ctx.currentTime;
      
      const notes = [
        { f: 261.63, d: 0.15 }, // C4
        { f: 329.63, d: 0.15 }, // E4
        { f: 392.00, d: 0.15 }, // G4
        { f: 523.25, d: 0.15 }, // C5
        { f: 659.25, d: 0.15 }, // E5
        { f: 783.99, d: 0.15 }, // G5
        { f: 1046.50, d: 0.3 }  // C6
      ];
      
      let time = now;
      notes.forEach((note) => {
        const osc = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.f, time);
        
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(note.f * 2, time);
        
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(note.f * 1.5, time);
        filter.Q.setValueAtTime(5, time);
        
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.12, time + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, time + note.d);
        
        osc.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(time);
        osc2.start(time);
        osc.stop(time + note.d);
        osc2.stop(time + note.d);
        time += 0.08;
      });
    } catch (e) {
      console.error(e);
    }
  };

  // --- Secure Real-Time Global Chat Notification Helper ---
  const sendSecureChatMessage = async (sender: string, avatarIcon: string, text: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    try {
      await addDoc(collection(db, 'chats'), {
        sender,
        senderId: currentUser.uid,
        userId: currentUser.uid,
        avatar: avatarIcon || '⚓',
        text,
        time: timeStr,
        createdAt: now.toISOString()
      });
    } catch (err: any) {
      console.error("Error sending secure chat message:", err);
    }
  };

  // --- Secure Multiplayer Harbor Event Dispatcher Helper ---
  const createHarborEvent = async (defenderId: string, type: string, payload: Record<string, any>) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      showToast('يجب تسجيل الدخول للتفاعل مع موانئ القراصنة', 'error');
      return;
    }
    if (defenderId === currentUser.uid) {
      showToast('لا يمكنك استهداف مينائك الخاص!', 'error');
      return;
    }
    try {
      await addDoc(collection(db, 'harborEvents'), {
        attackerId: currentUser.uid,
        attackerName: username || 'قبطان_مجهول',
        attackerAvatar: avatar || '☠️',
        defenderId,
        type,
        payload,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      });

      // Target player identification
      const targetName = payload?.targetName || payload?.defenderName || inspectedPlayer?.username || inspectedPlayer?.name || 'قبطان آخر';

      // Auto-broadcast in-game event to all players
      let eventType: NotificationEventType = 'ATTACK';
      let eventTitle = '⚔️ اشتباك بحري!';
      let eventMsg = `قام القبطان @${username || 'قبطان'} بعملية بحرية ضد ميناء القبطان @${targetName}!`;
      let eventIcon = '⚔️';

      if (type === 'ATOMIC_BOMB') {
        eventType = 'ATTACK';
        eventTitle = '☢️ كارثة نووية ذرية!';
        eventMsg = `شن القبطان @${username || 'قبطان'} ضربة نووية شاملة دمّرت ميناء القبطان @${targetName}!`;
        eventIcon = '☢️';
      } else if (type === 'AD_BOMB') {
        eventType = 'ATTACK';
        eventTitle = '⚡ قصف إعلاني مدمّر!';
        eventMsg = `فجّر القبطان @${username || 'قبطان'} قنبلة إعلانية دمّرت دفاعات ميناء القبطان @${targetName}!`;
        eventIcon = '💥';
      } else if (type === 'ROCKET_SMALL') {
        eventType = 'ATTACK';
        eventTitle = '⚔️ غارة صاروخية بحرية!';
        eventMsg = `استهدف القبطان @${username || 'قبطان'} سفينة في ميناء القبطان @${targetName} بصاروخ حربي!`;
        eventIcon = '🚀';
      } else if (type === 'ROCKET_MEDIUM') {
        eventType = 'ATTACK';
        eventTitle = '⚔️ قصف بصاروخ متوسط!';
        eventMsg = `قصف القبطان @${username || 'قبطان'} أسطول القبطان @${targetName} بصاروخ حربي متطور!`;
        eventIcon = '🚀';
      } else if (type === 'ROCKET_LARGE') {
        eventType = 'ATTACK';
        eventTitle = '⚔️ قصف بصاروخ ثقيل مدمر!';
        eventMsg = `شن القبطان @${username || 'قبطان'} قصفاً صاروخياً فتاكاً على ميناء القبطان @${targetName}!`;
        eventIcon = '🚀';
      } else if (type === 'STEAL') {
        eventType = 'ATTACK';
        eventTitle = '🏴‍☠️ تسلل ولصوصية بحرية!';
        eventMsg = `تسلل القبطان @${username || 'قبطان'} وسرق خزائن ميناء القبطان @${targetName}!`;
        eventIcon = '🏴‍☠️';
      } else if (type === 'LOOT') {
        eventType = 'ATTACK';
        eventTitle = '⚔️ غنائم وقرصنة بحرية!';
        eventMsg = `غنم القبطان @${username || 'قبطان'} موارد من ميناء القبطان @${targetName}!`;
        eventIcon = '💰';
      } else if (type === 'REPAIR') {
        eventType = 'SUPPORT';
        eventTitle = '🛡️ دعم وصيانة أسطول!';
        eventMsg = `أرسل القبطان الحليف @${username || 'قبطان'} طاقم صيانة لإصلاح سفن القبطان @${targetName}!`;
        eventIcon = '🛠️';
      } else if (type === 'DONATION' || type === 'GIFT') {
        eventType = 'SUPPORT';
        eventTitle = '🛡️ تعزيزات ومؤن بحرية!';
        const amt = payload?.amount ? ` 🪙 ${payload.amount.toLocaleString()}` : '';
        eventMsg = `أرسل القبطان @${username || 'قبطان'} دعماً ومؤناً بحرية${amt} للقبطان @${targetName}!`;
        eventIcon = '🎁';
      }

      await triggerGlobalNotification({
        type: eventType,
        title: eventTitle,
        message: eventMsg,
        icon: eventIcon,
        targetName,
        targetId: defenderId
      });
    } catch (err: any) {
      console.error("Error creating harbor event:", err);
      showToast('⚠️ تعذر إرسال حدث الميناء إلى السيرفر: ' + (err.message || 'خطأ في الاتصال'), 'error');
    }
  };

  // --- Attack & Steal Validation Function (دالة التحقق من شروط الهجوم والسرقة) ---
  const getShipEffectiveLevel = (s: any): number => {
    if (!s) return 0;
    if (typeof s.level === 'number') return s.level;
    const spec = SHOP_SHIPS.find((shopShip: any) => shopShip.name === s.name);
    return spec?.level ?? 0;
  };

  /**
   * التحقق من شروط الهجوم والسرقة:
   * 1. السماح بعمليات الهجوم والسرقة (التفجير) فقط إذا كانت سفن اللاعب بمستوى 6 وما فوق.
   * 2. التحقق برمجياً من أن مستوى السفينة/السفن يبلغ 6 أو أعلى قبل تنفيذ أي هجوم أو سرقة.
   * 3. إذا حاول اللاعب الهجوم وسفنه أقل من مستوى 6، يتم إظهار رسالة تنبيه تمنعه من ذلك.
   */
  const validateAttackOrSteal = (specificShipId?: string): { allowed: boolean; message: string } => {
    const activeShips = ships.filter(s => s.exists);
    if (activeShips.length === 0) {
      return {
        allowed: false,
        message: 'يجب أن تمتلك سفينة نشطة واحدة على الأقل لتتمكن من الهجوم أو السرقة!'
      };
    }

    // إذا تم تحديد سفينة معينة لتنفيذ الهجوم/السرقة (مثل اختيار سفينة في شاشة السرقة)
    if (specificShipId) {
      const chosenShip = activeShips.find(s => s.id === specificShipId);
      if (chosenShip) {
        const lvl = getShipEffectiveLevel(chosenShip);
        if (lvl < 6) {
          return {
            allowed: false,
            message: 'يجب أن تكون سفنك بمستوى 6 وما فوق لتتمكن من الهجوم أو السرقة'
          };
        }
        return { allowed: true, message: '' };
      }
    }

    // التحقق من أن مستوى سفن اللاعب يبلغ 6 وما فوق
    const maxLevel = Math.max(...activeShips.map(s => getShipEffectiveLevel(s)), 0);
    if (maxLevel < 6) {
      return {
        allowed: false,
        message: 'يجب أن تكون سفنك بمستوى 6 وما فوق لتتمكن من الهجوم أو السرقة'
      };
    }

    return { allowed: true, message: '' };
  };

  const handleLaunchSmallRocket = (targetShipOverride?: any) => {
    if (!inspectedPlayer) return;

    // التحقق من شرط مستوى السفن (مستوى 6 وما فوق)
    const validation = validateAttackOrSteal();
    if (!validation.allowed) {
      alert(validation.message);
      showToast(validation.message, 'error');
      return;
    }
    
    // Ensure all menus are closed so the battlefield is completely unobstructed
    setSelectedVisitedShip(null);
    setShowWeaponSelector(false);

    // Determine the targeted ship and calculate its exact screen coordinates
    const baseShips = (inspectedPlayer.ships && Array.isArray(inspectedPlayer.ships) && inspectedPlayer.ships.length > 0)
      ? inspectedPlayer.ships
      : getInspectedPlayerShips(inspectedPlayer);
    const targetShip = targetShipOverride || selectedVisitedShip || baseShips[0];

    let targetLeft = '45%';
    let targetTop = '49%';
    if (targetShip) {
      if (targetShip.left && targetShip.top) {
        targetLeft = targetShip.left;
        targetTop = targetShip.top;
      } else {
        const idx = baseShips.findIndex((s: any) => s.id === targetShip.id);
        const dockKey = `s${targetShip.id || (idx >= 0 ? idx + 1 : 1)}`;
        const fallbackPos = docks[dockKey] || docks[`s${(idx >= 0 ? idx + 1 : 1)}`] || { l: '45%', t: '49%' };
        targetLeft = fallbackPos.l;
        targetTop = fallbackPos.t;
      }
    }

    setRocketTargetPos({ l: targetLeft, t: targetTop });

    // Play fast agile incoming Doppler flight sound
    playSmallRocketIncomingSound();

    setIsSmallRocketActive(true);

    setWeapons(prev => {
      const updated = { ...prev, smallRocket: Math.max(0, (prev.smallRocket || 320) - 1) };
      localStorage.setItem('pirate_weapons', JSON.stringify(updated));
      return updated;
    });

    // Fly small rocket (lasts 0.75s matching user video)
    setTimeout(() => {
      setIsSmallRocketActive(false);
      setShowSmallRocketExplosion(true);
      setIsShaking(true);
      setRocketXpText('XP +100');
      setShowRocketXp(true);

      // Play authentic small rocket explosion sound
      playSmallRocketExplosionSound();

      const targetDocId = inspectedPlayer.userId || inspectedPlayer.id;

      if (targetShip && targetDocId) {
        let allDestroyed = false;
        const updatedShips = baseShips.map((s: any) => {
          if (s.id === targetShip.id) {
            const maxH = s.maxHeart || (typeof s.level === 'number' ? (s.level * 1000) + 10000 : 10000);
            const currentHeart = typeof s.heart === 'number' ? s.heart : maxH;
            const newHeart = Math.max(0, currentHeart - 1000);
            return { ...s, heart: newHeart, ...(newHeart <= 0 ? { moving: false, status: 'docked' } : {}) };
          }
          return s;
        });

        allDestroyed = updatedShips.length > 0 && updatedShips.every((s: any) => typeof s.heart === 'number' && s.heart <= 0);

        const existingReports = Array.isArray(inspectedPlayer.battleReports) ? inspectedPlayer.battleReports : [];
        const newReport = {
          id: `rocket_small_${Date.now()}`,
          opponent: username,
          opponentAvatar: avatar || '☠️',
          type: 'defense',
          result: 'defeat',
          goldChange: 0,
          date: new Date().toISOString(),
          title: allDestroyed ? '🚨 تم تدمير أسطولك ومينائك بالكامل!' : '🚀 استهداف سفينتك بصاروخ صغير!',
          log: [
            `🚀 قام القبطان @${username} باستهداف سفينتك (${targetShip.name || 'سفينة الأسطول'}) بصاروخ صغير ملحقاً 1,000 نقطة ضرر!`,
            allDestroyed ? `🔥 دُمرت جميع سفن أسطولك وأصبح الميناء محترقاً ومدمراً بالكامل!` : `⚠️ قم بصيانة وإصلاح أضرار هيكل السفينة فوراً.`
          ]
        };

        // Secure collection-based dispatch to /harborEvents
        createHarborEvent(targetDocId, 'ROCKET_SMALL', {
          damage: 1000,
          targetShipId: targetShip.id,
          allDestroyed,
          newReport
        });

        // Direct persistent update to target user profile document in Firestore
        if (targetDocId && db) {
          updateDoc(doc(db, 'users', targetDocId), {
            portDestroyed: allDestroyed || Boolean(inspectedPlayer.portDestroyed),
            ships: updatedShips,
            battleReports: [newReport, ...(Array.isArray(inspectedPlayer.battleReports) ? inspectedPlayer.battleReports.slice(0, 19) : [])],
            updatedAt: new Date().toISOString()
          }).catch((err) => {
            console.warn("Direct update to target user doc failed, harborEvent will handle it:", err);
          });
        }

        // Synchronize inspected player locally for immediate visual feedback
        setInspectedPlayer((prev: any) => prev ? {
          ...prev,
          portDestroyed: allDestroyed || prev.portDestroyed,
          ships: updatedShips
        } : prev);

        setRealPlayers(prev => prev.map(p => {
          if (p.id === targetDocId || p.userId === targetDocId) {
            return { ...p, portDestroyed: allDestroyed || p.portDestroyed, ships: updatedShips };
          }
          return p;
        }));
      }
      
      sendSecureChatMessage(
        'القوات الصاروخية 🚀',
        '🚀',
        `🚀 صاروخ صغير! قصف القبطان @${username} سفينة القبطان @${inspectedPlayer.username} وألحق بها 1,000 ضرر!`
      );

      showToast("💥 تم إطلاق الصاروخ الصغير وإصابة السفينة بـ 1,000 ضرر!", "success");

      // Reset screen shake after short punch
      setTimeout(() => {
        setIsShaking(false);
      }, 450);

      // Hide XP badge after 2.8s
      setTimeout(() => {
        setShowRocketXp(false);
      }, 2800);
    }, 750);
  };

  const handleLaunchMediumRocket = (targetShipOverride?: any) => {
    if (!inspectedPlayer) return;

    // التحقق من شرط مستوى السفن (مستوى 6 وما فوق)
    const validation = validateAttackOrSteal();
    if (!validation.allowed) {
      alert(validation.message);
      showToast(validation.message, 'error');
      return;
    }
    
    // Ensure all menus are closed so the battlefield is completely unobstructed
    setSelectedVisitedShip(null);
    setShowWeaponSelector(false);

    // Determine the targeted ship and calculate its exact screen coordinates
    const baseShips = (inspectedPlayer.ships && Array.isArray(inspectedPlayer.ships) && inspectedPlayer.ships.length > 0)
      ? inspectedPlayer.ships
      : getInspectedPlayerShips(inspectedPlayer);
    const targetShip = targetShipOverride || selectedVisitedShip || baseShips[0];

    let targetLeft = '45%';
    let targetTop = '49%';
    if (targetShip) {
      if (targetShip.left && targetShip.top) {
        targetLeft = targetShip.left;
        targetTop = targetShip.top;
      } else {
        const idx = baseShips.findIndex((s: any) => s.id === targetShip.id);
        const dockKey = `s${targetShip.id || (idx >= 0 ? idx + 1 : 1)}`;
        const fallbackPos = docks[dockKey] || docks[`s${(idx >= 0 ? idx + 1 : 1)}`] || { l: '45%', t: '49%' };
        targetLeft = fallbackPos.l;
        targetTop = fallbackPos.t;
      }
    }

    setRocketTargetPos({ l: targetLeft, t: targetTop });

    // Play medium rocket incoming sound
    playMediumRocketIncomingSound();

    setIsMediumRocketActive(true);

    setWeapons(prev => {
      const updated = { ...prev, mediumRocket: Math.max(0, (prev.mediumRocket || 902) - 1) };
      localStorage.setItem('pirate_weapons', JSON.stringify(updated));
      return updated;
    });

    // Fly medium rocket (lasts 0.9s matching user video)
    setTimeout(() => {
      setIsMediumRocketActive(false);
      setShowMediumRocketExplosion(true);
      setIsShaking(true);
      setRocketXpText('XP +1,000');
      setShowRocketXp(true);

      // Play authentic medium rocket explosion sound
      playMediumRocketExplosionSound();

      const targetDocId = inspectedPlayer.userId || inspectedPlayer.id;

      if (targetShip && targetDocId) {
        let allDestroyed = false;
        const updatedShips = baseShips.map((s: any) => {
          if (s.id === targetShip.id) {
            const maxH = s.maxHeart || (typeof s.level === 'number' ? (s.level * 1000) + 10000 : 10000);
            const currentHeart = typeof s.heart === 'number' ? s.heart : maxH;
            const newHeart = Math.max(0, currentHeart - 5000);
            return { ...s, heart: newHeart, ...(newHeart <= 0 ? { moving: false, status: 'docked' } : {}) };
          }
          return s;
        });

        allDestroyed = updatedShips.length > 0 && updatedShips.every((s: any) => typeof s.heart === 'number' && s.heart <= 0);

        const existingReports = Array.isArray(inspectedPlayer.battleReports) ? inspectedPlayer.battleReports : [];
        const newReport = {
          id: `rocket_med_${Date.now()}`,
          opponent: username,
          opponentAvatar: avatar || '☠️',
          type: 'defense',
          result: 'defeat',
          goldChange: 0,
          date: new Date().toISOString(),
          title: allDestroyed ? '🚨 تم تدمير أسطولك ومينائك بالكامل!' : '🚀 استهداف سفينتك بصاروخ متوسط!',
          log: [
            `🚀 قام القبطان @${username} باستهداف سفينتك (${targetShip.name || 'سفينة الأسطول'}) بصاروخ متوسط ملحقاً 5,000 نقطة ضرر!`,
            allDestroyed ? `🔥 دُمرت جميع سفن أسطولك وأصبح الميناء محترقاً ومدمراً بالكامل!` : `⚠️ قم بصيانة وإصلاح أضرار هيكل السفينة فوراً.`
          ]
        };

        // Secure collection-based dispatch to /harborEvents
        createHarborEvent(targetDocId, 'ROCKET_MEDIUM', {
          damage: 5000,
          targetShipId: targetShip.id,
          allDestroyed,
          newReport
        });

        // Direct persistent update to target user profile document in Firestore
        if (targetDocId && db) {
          updateDoc(doc(db, 'users', targetDocId), {
            portDestroyed: allDestroyed || Boolean(inspectedPlayer.portDestroyed),
            ships: updatedShips,
            battleReports: [newReport, ...(Array.isArray(inspectedPlayer.battleReports) ? inspectedPlayer.battleReports.slice(0, 19) : [])],
            updatedAt: new Date().toISOString()
          }).catch((err) => {
            console.warn("Direct update to target user doc failed, harborEvent will handle it:", err);
          });
        }

        // Synchronize inspected player locally
        setInspectedPlayer((prev: any) => prev ? {
          ...prev,
          portDestroyed: allDestroyed || prev.portDestroyed,
          ships: updatedShips
        } : prev);

        setRealPlayers(prev => prev.map(p => {
          if (p.id === targetDocId || p.userId === targetDocId) {
            return { ...p, portDestroyed: allDestroyed || p.portDestroyed, ships: updatedShips };
          }
          return p;
        }));
      }
      
      sendSecureChatMessage(
        'القوات الصاروخية 🚀',
        '🚀',
        `🚀 صاروخ متوسط! قصف القبطان @${username} سفينة القبطان @${inspectedPlayer.username} بـ 5,000 ضرر!`
      );

      showToast("💥 تم إطلاق الصاروخ المتوسط وإصابة السفينة بـ 5,000 ضرر!", "success");

      // Reset screen shake after explosion punch
      setTimeout(() => {
        setIsShaking(false);
      }, 500);

      // Hide XP badge after 2.8s
      setTimeout(() => {
        setShowRocketXp(false);
      }, 2800);
    }, 900);
  };

  const handleLaunchLargeRocket = (targetShipOverride?: any) => {
    if (!inspectedPlayer) return;

    // التحقق من شرط مستوى السفن (مستوى 6 وما فوق)
    const validation = validateAttackOrSteal();
    if (!validation.allowed) {
      alert(validation.message);
      showToast(validation.message, 'error');
      return;
    }
    
    // Ensure all menus are closed immediately so nothing obstructs rocket trajectory or explosion
    setSelectedVisitedShip(null);
    setShowWeaponSelector(false);

    // Determine the targeted ship and calculate its exact screen coordinates
    const baseShips = (inspectedPlayer.ships && Array.isArray(inspectedPlayer.ships) && inspectedPlayer.ships.length > 0)
      ? inspectedPlayer.ships
      : getInspectedPlayerShips(inspectedPlayer);
    const targetShip = targetShipOverride || selectedVisitedShip || baseShips[0];

    let targetLeft = '45%';
    let targetTop = '49%';
    if (targetShip) {
      if (targetShip.left && targetShip.top) {
        targetLeft = targetShip.left;
        targetTop = targetShip.top;
      } else {
        const idx = baseShips.findIndex((s: any) => s.id === targetShip.id);
        const dockKey = `s${targetShip.id || (idx >= 0 ? idx + 1 : 1)}`;
        const fallbackPos = docks[dockKey] || docks[`s${(idx >= 0 ? idx + 1 : 1)}`] || { l: '45%', t: '49%' };
        targetLeft = fallbackPos.l;
        targetTop = fallbackPos.t;
      }
    }

    setRocketTargetPos({ l: targetLeft, t: targetTop });

    // Play authentic rocket launch & incoming Doppler flight sound
    playLargeRocketIncomingSound();

    setIsLargeRocketActive(true);
    
    setWeapons(prev => {
      const updated = {
        ...prev,
        largeRocket: Math.max(0, (prev.largeRocket || 6435) - 1)
      };
      localStorage.setItem('pirate_weapons', JSON.stringify(updated));
      return updated;
    });

    // Fly rocket (lasts 1.25 seconds)
    setTimeout(() => {
      setIsLargeRocketActive(false);
      setShowLargeRocketExplosion(true);
      setIsShaking(true);
      setRocketXpText('XP +1,200');
      setShowRocketXp(true);
      
      // Play heavy cinematic explosion sound matching user reference
      playLargeRocketExplosionSound();

      // Deal 100,000 damage
      const targetDocId = inspectedPlayer.userId || inspectedPlayer.id;

      if (targetShip && targetDocId) {
        let allDestroyed = false;
        const updatedShips = baseShips.map((s: any) => {
          const maxH = s.maxHeart || (typeof s.level === 'number' ? (s.level * 1000) + 10000 : 10000);
          const currentHeart = typeof s.heart === 'number' ? s.heart : maxH;
          const dmg = (s.id === targetShip.id) ? 100000 : 25000;
          const newHeart = Math.max(0, currentHeart - dmg);
          return {
            ...s,
            heart: newHeart,
            ...(newHeart <= 0 ? { moving: false, status: 'docked' } : {})
          };
        });

        allDestroyed = updatedShips.length > 0 && updatedShips.every((s: any) => typeof s.heart === 'number' && s.heart <= 0);

        const existingReports = Array.isArray(inspectedPlayer.battleReports) ? inspectedPlayer.battleReports : [];
        const newReport = {
          id: `rocket_large_${Date.now()}`,
          opponent: username,
          opponentAvatar: avatar || '☠️',
          type: 'defense',
          result: 'defeat',
          goldChange: 0,
          date: new Date().toISOString(),
          title: allDestroyed ? '🚨 تم تدمير أسطولك ومينائك بالكامل!' : '🚀 قصف صاروخي فتاك على سفينتك!',
          log: [
            `🚀 قصف القبطان @${username} سفينتك (${targetShip.name || 'سفينة الأسطول'}) بصاروخ كبير مدمّر بـ 100,000 ضرر!`,
            allDestroyed ? `🔥 دُمرت جميع سفن أسطولك بالكامل وأصبح الميناء محترقاً ومدمراً!` : `⚠️ تعرضت سفن الأسطول لأضرار جسيمة، توجه للصيانة والإصلاح فوراً.`
          ]
        };

        // Secure collection-based dispatch to /harborEvents
        createHarborEvent(targetDocId, 'ROCKET_LARGE', {
          damage: 100000,
          targetShipId: targetShip.id,
          allDestroyed,
          newReport
        });

        // Direct persistent update to target user profile document in Firestore
        if (targetDocId && db) {
          updateDoc(doc(db, 'users', targetDocId), {
            portDestroyed: allDestroyed || Boolean(inspectedPlayer.portDestroyed),
            ships: updatedShips,
            battleReports: [newReport, ...(Array.isArray(inspectedPlayer.battleReports) ? inspectedPlayer.battleReports.slice(0, 19) : [])],
            updatedAt: new Date().toISOString()
          }).catch((err) => {
            console.warn("Direct update to target user doc failed, harborEvent will handle it:", err);
          });
        }

        // Synchronize inspected player locally
        setInspectedPlayer((prev: any) => prev ? {
          ...prev,
          portDestroyed: allDestroyed || prev.portDestroyed,
          ships: updatedShips
        } : prev);

        setRealPlayers(prev => prev.map(p => {
          if (p.id === targetDocId || p.userId === targetDocId) {
            return { ...p, portDestroyed: allDestroyed || p.portDestroyed, ships: updatedShips };
          }
          return p;
        }));
      }

      sendSecureChatMessage(
        'القوات الصاروخية 🚀',
        '🚀',
        `🚀 صاروخ كبير فتاك! قصف القبطان @${username} سفن القبطان @${inspectedPlayer.username} بقوة تدميرية بلغت 100,000 ضرر!`
      );

      showToast("💥 تم إطلاق الصاروخ الكبير وإصابة الهدف بـ 100,000 ضرر!", "success");

      // Impact camera shake lasts 650ms for realistic punch
      setTimeout(() => {
        setIsShaking(false);
      }, 650);

      // Hide XP pill after 2.8 seconds
      setTimeout(() => {
        setShowRocketXp(false);
      }, 2800);

    }, 1250);

    setTimeout(() => {
      setShowLargeRocketExplosion(false);
    }, 2800);
  };

  const handleDisableDefense = (type: 'rocket' | 'nuke' | 'ad') => {
    if (!inspectedPlayer) return;

    let weaponKey = '';
    let message = '';
    
    if (type === 'rocket') {
      weaponKey = 'antiRocketDisabler';
      message = `⚠️ مضاد الصواريخ معطل\nعطلت مضاد الصواريخ لدى القبطان @${inspectedPlayer.username} لمدة 10 دقائق.`;
    } else if (type === 'nuke') {
      weaponKey = 'antiNukeDisabler';
      message = `⚠️ مضاد القنبلة الذرية معطل\nعطلت مضاد القنبلة الذرية لدى القبطان @${inspectedPlayer.username} لمدة 10 دقائق.`;
    } else if (type === 'ad') {
      weaponKey = 'antiAdDisabler';
      message = `⚠️ مضاد القنبلة الإعلانية معطل\nعطلت مضاد القنبلة الإعلانية لدى القبطان @${inspectedPlayer.username} لمدة 10 دقائق.`;
    }

    setWeapons(prev => {
      const updated = {
        ...prev,
        [weaponKey]: Math.max(0, (prev[weaponKey] || 6) - 1)
      };
      localStorage.setItem('pirate_weapons', JSON.stringify(updated));
      return updated;
    });

    alert(message);
  };

  const handleLaunchAdBomb = async (selectedAdKey: string) => {
    if (!inspectedPlayer) return;

    // التحقق من شرط مستوى السفن (مستوى 6 وما فوق)
    const validation = validateAttackOrSteal();
    if (!validation.allowed) {
      alert(validation.message);
      showToast(validation.message, 'error');
      return;
    }

    // Ensure all menus are closed immediately
    setSelectedVisitedShip(null);
    setShowWeaponSelector(false);
    setShowAdSelectorModal(false);

    // Deduct Ad Bomb
    setWeapons(prev => {
      const updated = {
        ...prev,
        adBomb: Math.max(0, (prev.adBomb || 101) - 1)
      };
      localStorage.setItem('pirate_weapons', JSON.stringify(updated));
      return updated;
    });

    // Trigger smoke explosion animation
    setShowSmokeExplosion(true);
    setIsShaking(true);
    playMediaBombExplosionSound();

    // Get Ad Title Arabic
    let adTitle = '';
    if (selectedAdKey === 'luffy_king') adTitle = '☠️ لوفي ملك القراصنة';
    else if (selectedAdKey === 'jack_sabro' || selectedAdKey === 'deep_dragon') adTitle = '🦎 تنين الأعماق';
    else if (selectedAdKey === 'luffy_grandeur') adTitle = '🔥 فخامة لوفي';
    else if (selectedAdKey === 'anf') adTitle = '👑 وإذا سطا خاف الأنام';

    setTimeout(async () => {
      setShowSmokeExplosion(false);
      setIsShaking(false);

      // تشغيل الصوت الملحمي المطلوب بعد ما يتم التفجير برسالة التفجير مباشرة
      playDetonationWarningVoiceAndSound();

      const targetDocId = inspectedPlayer.userId || inspectedPlayer.id;
      if (targetDocId && db) {
        const baseShips = (inspectedPlayer.ships && Array.isArray(inspectedPlayer.ships) && inspectedPlayer.ships.length > 0)
          ? inspectedPlayer.ships
          : getInspectedPlayerShips(inspectedPlayer);

        // Deal 20,000 damage to all ships
        let allDestroyed = false;
        const updatedShips = baseShips.map((s: any) => {
          const maxH = s.maxHeart || (typeof s.level === 'number' ? (s.level * 1000) + 10000 : 10000);
          const currentHeart = typeof s.heart === 'number' ? s.heart : maxH;
          const newHeart = Math.max(0, currentHeart - 20000);
          return {
            ...s,
            heart: newHeart,
            ...(newHeart <= 0 ? { moving: false, status: 'docked' } : {})
          };
        });

        allDestroyed = updatedShips.length > 0 && updatedShips.every((s: any) => typeof s.heart === 'number' && s.heart <= 0);

        const existingReports = Array.isArray(inspectedPlayer.battleReports) ? inspectedPlayer.battleReports : [];
        const newReport = {
          id: `ad_bomb_${Date.now()}`,
          opponent: username,
          opponentAvatar: avatar || '📡',
          type: 'defense',
          result: 'defeat',
          goldChange: 0,
          date: new Date().toISOString(),
          title: allDestroyed ? '🚨 رسالة التفجير: تم تدمير أسطولك ومينائك بالكامل!' : '📡 هجوم رسالة التفجير!',
          log: [
            `📡 قام القبطان @${username} بإطلاق رسالة التفجير [${adTitle}] على مينائك ملحقاً 20,000 نقطة ضرر بكل سفينة!`,
            allDestroyed ? `🔥 دُمرت جميع سفن أسطولك بالكامل ودُمر الميناء وأصبح محترقاً ومشتعلاً!` : `⚠️ أصيبت سفن أسطولك بأضرار جسيمة، توجه للصيانة والترميم فوراً.`,
            `⚠️ توجه فوراً إلى الميناء واضغط على [إعادة إعمار الميناء وترميم الأسطول].`
          ]
        };

        // Secure collection-based dispatch to /harborEvents
        createHarborEvent(targetDocId, 'AD_BOMB', {
          damage: 20000,
          allDestroyed,
          adKey: selectedAdKey,
          adTitle,
          newReport
        });

        // Direct persistent update to target user profile document in Firestore
        if (targetDocId && db) {
          updateDoc(doc(db, 'users', targetDocId), {
            portDestroyed: allDestroyed || Boolean(inspectedPlayer.portDestroyed),
            activeAd: selectedAdKey,
            ships: updatedShips,
            battleReports: [newReport, ...(Array.isArray(inspectedPlayer.battleReports) ? inspectedPlayer.battleReports.slice(0, 19) : [])],
            updatedAt: new Date().toISOString()
          }).catch((err) => {
            console.warn("Direct update to target user doc failed, harborEvent will handle it:", err);
          });
        }

        // Synchronize local inspectedPlayer
        setInspectedPlayer((prev: any) => prev ? {
          ...prev,
          portDestroyed: allDestroyed || prev.portDestroyed,
          activeAd: selectedAdKey,
          ships: updatedShips
        } : prev);

        // Synchronize realPlayers
        setRealPlayers(prev => prev.map(p => {
          if (p.id === targetDocId || p.userId === targetDocId) {
            return { ...p, portDestroyed: allDestroyed || p.portDestroyed, ships: updatedShips };
          }
          return p;
        }));
      }

      // Secure Chat Announcement in Firestore
      sendSecureChatMessage(
        'رسالة التفجير 📡',
        '📡',
        `📡 رسالة التفجير! أطلق القبطان @${username} رسالة التفجير [${adTitle}] على أسطول القبطان @${inspectedPlayer.username} ملحقاً 20,000 ضرر بالسفن!`
      );

      showToast("💥 تم إطلاق رسالة التفجير وإلحاق 20,000 ضرر بالأسطول!", "success");

    }, 1800);
  };

  const handleLaunchAtomicBomb = async () => {
    if (!inspectedPlayer) return;

    // التحقق من شرط مستوى السفن (مستوى 6 وما فوق)
    const validation = validateAttackOrSteal();
    if (!validation.allowed) {
      alert(validation.message);
      showToast(validation.message, 'error');
      return;
    }
    
    // Ensure all menus are closed immediately so nothing obstructs falling bomb or nuclear explosion
    setSelectedVisitedShip(null);
    setShowWeaponSelector(false);

    // Play falling bomb whistle sound matching video reference
    playAtomicBombDropSound();
    setIsAtomicBombActive(true);
    setShowAtomicBombXp(true);

    // Deduct bomb
    setWeapons(prev => {
      const updated = {
        ...prev,
        atomicBomb: Math.max(0, (prev.atomicBomb || 795) - 1)
      };
      localStorage.setItem('pirate_weapons', JSON.stringify(updated));
      return updated;
    });

    // Stage 1: Fall down & plunge inside sea depths before detonating (1.35s)
    setTimeout(() => {
      setIsShaking(true);
      
      // Play heavy nuclear detonation boom matching video reference
      playAtomicBombExplosionSound();
      
      setExp(prev => prev + 2500);

      const targetDocId = inspectedPlayer.userId || inspectedPlayer.id;
      if (targetDocId && db) {
        const baseShips = (inspectedPlayer.ships && Array.isArray(inspectedPlayer.ships) && inspectedPlayer.ships.length > 0)
          ? inspectedPlayer.ships
          : getInspectedPlayerShips(inspectedPlayer);

        // Apply 70,000 damage to all ships
        let allDestroyed = false;
        const updatedShips = baseShips.map((s: any) => {
          const maxH = s.maxHeart || (typeof s.level === 'number' ? (s.level * 1000) + 10000 : 10000);
          const currentHeart = typeof s.heart === 'number' ? s.heart : maxH;
          const newHeart = Math.max(0, currentHeart - 70000);
          return {
            ...s,
            heart: newHeart,
            ...(newHeart <= 0 ? { moving: false, status: 'docked' } : {})
          };
        });

        allDestroyed = updatedShips.length > 0 && updatedShips.every((s: any) => typeof s.heart === 'number' && s.heart <= 0);

        const existingReports = Array.isArray(inspectedPlayer.battleReports) ? inspectedPlayer.battleReports : [];
        const newReport = {
          id: `atomic_${Date.now()}`,
          opponent: username,
          opponentAvatar: avatar || '💣',
          type: 'defense',
          result: 'defeat',
          goldChange: 0,
          date: new Date().toISOString(),
          title: allDestroyed ? '🚨 كارثة الموت الأسود: تم تدمير أسطولك ومينائك بالكامل!' : '💣 قصف بقنبلة الموت الأسود!',
          log: [
            `💣 شن القبطان @${username} هجوماً فتاكاً بقنبلة الموت الأسود على مينائك ملحقاً 70,000 نقطة ضرر بكل سفينة!`,
            allDestroyed ? `🔥 دُمرت جميع سفن أسطولك بالكامل وغرقت في المياه وأصبح الميناء محترقاً ومدمراً!` : `⚠️ تعرضت سفن الأسطول لأضرار جسيمة للغاية، توجه للصيانة وترميم الهيكل فوراً.`,
            `⚠️ اضغط على زر [إعادة إعمار الميناء وترميم الأسطول] لإصلاح الأضرار واستعادة أسطولك.`
          ]
        };

        // Secure collection-based dispatch to /harborEvents
        createHarborEvent(targetDocId, 'ATOMIC_BOMB', {
          damage: 70000,
          allDestroyed,
          newReport
        });

        // Direct persistent update to target user profile document in Firestore
        if (targetDocId && db) {
          updateDoc(doc(db, 'users', targetDocId), {
            portDestroyed: allDestroyed || Boolean(inspectedPlayer.portDestroyed),
            ships: updatedShips,
            battleReports: [newReport, ...(Array.isArray(inspectedPlayer.battleReports) ? inspectedPlayer.battleReports.slice(0, 19) : [])],
            updatedAt: new Date().toISOString()
          }).catch((err) => {
            console.warn("Direct update to target user doc failed, harborEvent will handle it:", err);
          });
        }

        // Synchronize local inspectedPlayer
        setInspectedPlayer((prev: any) => prev ? {
          ...prev,
          portDestroyed: allDestroyed || prev.portDestroyed,
          ships: updatedShips
        } : prev);

        // Synchronize realPlayers
        setRealPlayers(prev => prev.map(p => {
          if (p.id === targetDocId || p.userId === targetDocId) {
            return { ...p, portDestroyed: allDestroyed || p.portDestroyed, ships: updatedShips };
          }
          return p;
        }));
      }

      // Secure Chat Announcement in Firestore
      sendSecureChatMessage(
        'قنبلة الموت الأسود 💣',
        '💣',
        `💣 قنبلة الموت الأسود! أطلق القبطان مباغتاً @${username} قنبلة الموت الأسود الفتاكة على ميناء القبطان @${inspectedPlayer.username} ملحقاً 70,000 ضرر بجميع سفن الأسطول!`
      );

      showToast("💥 تم إطلاق قنبلة الموت الأسود وإلحاق 70,000 ضرر بسفن الخصم!", "success");

      // Camera shake lasts 950ms for solid nuclear impact punch
      setTimeout(() => {
        setIsShaking(false);
      }, 950);

      // Hide XP pill after 2.8s
      setTimeout(() => {
        setShowAtomicBombXp(false);
      }, 2800);

    }, 1350);

    // Stage 2: Stop atomic bomb sequence after 4.8s
    setTimeout(() => {
      setIsAtomicBombActive(false);
      setShowAtomicExplosion(false);
    }, 4800);

    // Stage 3: Reset XP anim
    setTimeout(() => {
      setGainedXpAnim(false);
    }, 5000);

    // Stage 4: Reset state (do NOT auto-open loot selector or global message modal)
    setTimeout(() => {
      setSelectedLootCard(null);
      setLootResultText('');
    }, 3500);
  };

  const handleOpenProfile = async (player: any) => {
    setIsProfileLoading(true);
    let freshPlayer = realPlayers.find(p => p.userId === player.userId || p.id === player.id) || player;
    
    // Fetch direct from Firestore to ensure 100% real-time data for inspected player
    const targetDocId = player?.id || player?.userId;
    if (targetDocId && db) {
      try {
        const snap = await getDoc(doc(db, 'users', targetDocId));
        if (snap.exists()) {
          const d = snap.data();
          freshPlayer = {
            ...freshPlayer,
            id: snap.id,
            userId: d.userId || snap.id,
            username: d.username || freshPlayer.username,
            avatar: d.avatar || freshPlayer.avatar,
            gold: typeof d.gold === 'number' ? d.gold : (freshPlayer.gold || 0),
            gems: typeof d.gems === 'number' ? d.gems : (freshPlayer.gems || 0),
            redGems: typeof d.redGems === 'number' ? d.redGems : (freshPlayer.redGems || 0),
            exp: typeof d.exp === 'number' ? d.exp : (freshPlayer.exp || 0),
            ships: Array.isArray(d.ships) && d.ships.length > 0 ? d.ships : (freshPlayer.ships || []),
            shipTowerLevel: typeof d.shipTowerLevel === 'number' ? d.shipTowerLevel : (freshPlayer.shipTowerLevel || 1),
            fishStorageLevel: typeof d.fishStorageLevel === 'number' ? d.fishStorageLevel : (freshPlayer.fishStorageLevel || 1),
            portDestroyed: !!d.portDestroyed,
            crewServices: d.crewServices || freshPlayer.crewServices || {},
            fishInventory: d.fishInventory || freshPlayer.fishInventory || {},
            server: d.server || freshPlayer.server || 'سيرفر الأسطورة 1',
            pirateClass: d.pirateClass || freshPlayer.pirateClass || 'صياد البحار',
            tribeId: d.tribeId || freshPlayer.tribeId || '',
            tribeName: d.tribeName || freshPlayer.tribeName || '',
            updatedAt: d.updatedAt || new Date().toISOString()
          };
        }
      } catch (err) {
        console.warn("Could not fetch fresh user profile snapshot directly, falling back to cache:", err);
      }
    }
    
    setInspectedPlayer(freshPlayer);
    setTimeout(() => {
      setIsProfileLoading(false);
    }, 400);
  };

  const getDestroyedShipStyles = (shipId: string | number) => {
    const idStr = String(shipId);
    if (idStr.endsWith('1') || idStr === 's1') {
      return {
        transform: 'rotate(-32deg) translateY(38px)',
        statusLabel: 'مدمّرة بالكامل 🔥',
        flames: [
          { top: '10%', left: '20%', size: '30px', anim: 'bounce 0.8s infinite alternate' },
          { top: '35%', left: '60%', size: '20px', anim: 'pulse 0.7s infinite alternate' }
        ]
      };
    } else if (idStr.endsWith('2') || idStr === 's2') {
      return {
        transform: 'rotate(58deg) translateY(48px)',
        statusLabel: 'غارقة جزئياً 🌊',
        flames: [
          { top: '20%', left: '50%', size: '36px', anim: 'pulse 0.9s infinite alternate' },
          { top: '5%', left: '30%', size: '18px', anim: 'bounce 0.6s infinite alternate' }
        ]
      };
    } else {
      return {
        transform: 'rotate(-18deg) translateY(28px)',
        statusLabel: 'حطام محترق 💀',
        flames: [
          { top: '15%', left: '40%', size: '32px', anim: 'bounce 0.7s infinite alternate' },
          { top: '40%', left: '15%', size: '22px', anim: 'pulse 0.5s infinite alternate' }
        ]
      };
    }
  };

  const getInspectedPlayerShips = (player: any) => {
    if (!player) return [];
    
    // If the inspected player is the current logged-in user, always use the active local ships state
    if (auth.currentUser && player.userId === auth.currentUser.uid) {
      return ships;
    }
    
    // Return their real ships exactly as stored in Firestore if they have any
    if (player.ships && Array.isArray(player.ships) && player.ships.length > 0) {
      return player.ships.map((s: any) => {
        let shipLevel = 0;
        if (typeof s.level === 'number' && !isNaN(s.level)) {
          shipLevel = s.level;
        } else if (s.name) {
          const specByName = SHOP_SHIPS.find(spec => spec.name === s.name);
          if (specByName) shipLevel = specByName.level;
        }
        const spec = SHOP_SHIPS.find(spec => spec.level === shipLevel) || SHOP_SHIPS[0];

        return {
          ...s,
          name: s.name || spec.name,
          level: shipLevel,
          hook: s.hook || spec.hook,
          cargo: s.cargo || getShipCapacity(shipLevel),
          heart: s.heart !== undefined ? s.heart : spec.heart,
          durationStr: s.durationStr || spec.durationStr,
          power: s.power || spec.power,
          armor: s.armor || spec.armor,
          fishTypes: s.fishTypes || spec.fishTypes,
          imgEmoji: s.imgEmoji || spec.emoji,
          exists: s.exists !== false
        };
      });
    }

    // Default starter ships fallback so their ocean is never empty/mock
    return [
      { id: 's1', name: 'قارب خشبي متهالك', status: 'docked', left: '45%', top: '38%', scaleX: 1, moving: false, exists: true, crewPower: 0, hasNetUpgrade: false, hasEngineUpgrade: false, level: 0, hook: 25, cargo: 2000, heart: 200, durationStr: '00:30', power: 5, armor: 5, fishTypes: ['سردين', 'أنشوجة'], imgEmoji: '🛶' },
      { id: 's2', name: 'قارب خشبي متهالك', status: 'docked', left: '45%', top: '49%', scaleX: 1, moving: false, exists: true, crewPower: 0, hasNetUpgrade: false, hasEngineUpgrade: false, level: 0, hook: 25, cargo: 2000, heart: 200, durationStr: '00:30', power: 5, armor: 5, fishTypes: ['سردين', 'أنشوجة'], imgEmoji: '🛶' },
      { id: 's3', name: 'قارب خشبي متهالك', status: 'docked', left: '45%', top: '60%', scaleX: 1, moving: false, exists: true, crewPower: 0, hasNetUpgrade: false, hasEngineUpgrade: false, level: 0, hook: 25, cargo: 2000, heart: 200, durationStr: '00:30', power: 5, armor: 5, fishTypes: ['سردين', 'أنشوجة'], imgEmoji: '🛶' }
    ];
  };

  // --- Chat Messages ---
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // --- Selection and Overlay states ---
  const [currentShipId, setCurrentShipId] = useState<string | null>(null);
  const [menu, setMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    shipId: string;
    status: 'docked' | 'fishing';
  }>({
    visible: false,
    x: 0,
    y: 0,
    shipId: '',
    status: 'docked'
  });

  const [confirmModal, setConfirmModal] = useState(false);
  const [repairModalShip, setRepairModalShip] = useState<ShipState | null>(null);
  const shipMenuRef = useRef<HTMLDivElement>(null);
  const [rewardModal, setRewardModal] = useState(false);
  const [questsExpanded, setQuestsExpanded] = useState(true);
  const [rewardFish, setRewardFish] = useState<{ name: string; amount: number; value: number; luckDoubled?: boolean; guided?: boolean }>({ name: 'أنشوجة', amount: 80, value: 120 });
  const [crewModal, setCrewModal] = useState(false);
  const [crewTab, setCrewTab] = useState<'sailors' | 'special'>('sailors');
  const [activeReport, setActiveReport] = useState<BattleReport | null>(null);

  // --- Warehouses & Tower ---
  const [fishStorageLevel, setFishStorageLevel] = useState<number>(() => {
    return parseInt(localStorage.getItem('fish_storage_level') || '1');
  });
  const [shipTowerLevel, setShipTowerLevel] = useState<number>(() => {
    return parseInt(localStorage.getItem('ship_tower_level') || '1');
  });
  const [fishStorageModal, setFishStorageModal] = useState<boolean>(false);
  const [fishInventory, setFishInventory] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('pirate_fish_inventory');
    if (saved) return JSON.parse(saved);
    return {
      'أنشوجة المياه الدافئة 🐟': 15,
      'سردين ملوك الأعماق 🐟': 8,
    };
  });

  // --- Weapons and Red Gems States (Shabek 360 Shop) ---
  const [redGems, setRedGems] = useState<number>(() => {
    return parseInt(localStorage.getItem('pirate_red_gems') || '2450');
  });
  const [weapons, setWeapons] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('pirate_weapons');
    const parsed = saved ? JSON.parse(saved) : {};
    return {
      smallRocket: parsed.smallRocket !== undefined ? parsed.smallRocket : 320,
      mediumRocket: parsed.mediumRocket !== undefined ? parsed.mediumRocket : 902,
      largeRocket: parsed.largeRocket !== undefined ? parsed.largeRocket : 6435,
      atomicBomb: parsed.atomicBomb !== undefined ? parsed.atomicBomb : 795,
      adBomb: parsed.adBomb !== undefined ? parsed.adBomb : 101,
      antiRocketDisabler: parsed.antiRocketDisabler !== undefined ? parsed.antiRocketDisabler : 6,
      antiNukeDisabler: parsed.antiNukeDisabler !== undefined ? parsed.antiNukeDisabler : 6,
      antiAdDisabler: parsed.antiAdDisabler !== undefined ? parsed.antiAdDisabler : 7,
      smallRepair: parsed.smallRepair !== undefined ? parsed.smallRepair : 2,
      mediumRepair: parsed.mediumRepair !== undefined ? parsed.mediumRepair : 0,
      largeRepair: parsed.largeRepair !== undefined ? parsed.largeRepair : 0,
      legendaryRepair: parsed.legendaryRepair !== undefined ? parsed.legendaryRepair : 0,
    };
  });

  // --- Audio Settings ---
  const [isMuted, setIsMuted] = useState(false);
  const [isMusicMuted, setIsMusicMuted] = useState(() => {
    const saved = localStorage.getItem('pirate_music_muted');
    return saved !== null ? saved === 'true' : false;
  });
  const [isSfxMuted, setIsSfxMuted] = useState(() => {
    const saved = localStorage.getItem('pirate_sfx_muted');
    return saved !== null ? saved === 'true' : false;
  });

  // --- Graphics & Visual Settings ---
  const [showNets, setShowNets] = useState(() => {
    const saved = localStorage.getItem('pirate_show_nets');
    return saved !== null ? saved === 'true' : true;
  });
  const [lowGraphics, setLowGraphics] = useState(() => {
    const saved = localStorage.getItem('pirate_low_graphics');
    return saved !== null ? saved === 'true' : false;
  });

  // --- Customized Settings Menu States ---
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('pirate_language') || 'ar';
  });
  const [showDeathBanners, setShowDeathBanners] = useState(() => {
    const saved = localStorage.getItem('pirate_show_death_banners');
    return saved !== null ? saved === 'true' : true;
  });
  const [showAttackNotifications, setShowAttackNotifications] = useState(() => {
    const saved = localStorage.getItem('pirate_show_attack_notifications');
    return saved !== null ? saved === 'true' : true;
  });
  const [showChestNotifications, setShowChestNotifications] = useState(() => {
    const saved = localStorage.getItem('pirate_show_chest_notifications');
    return saved !== null ? saved === 'true' : true;
  });
  const [showPopupAlerts, setShowPopupAlerts] = useState(() => {
    const saved = localStorage.getItem('pirate_show_popup_alerts');
    return saved !== null ? saved === 'true' : true;
  });
  const [disableAnimatedBackground, setDisableAnimatedBackground] = useState(() => {
    const saved = localStorage.getItem('pirate_disable_animated_bg');
    return saved !== null ? saved === 'true' : false;
  });
  const [powerSaver, setPowerSaver] = useState(() => {
    const saved = localStorage.getItem('pirate_power_saver');
    return saved !== null ? saved === 'true' : false;
  });
  const [showSoundTones, setShowSoundTones] = useState(() => {
    const saved = localStorage.getItem('pirate_show_sound_tones');
    return saved !== null ? saved === 'true' : true;
  });
  const [customizeIconFunctions, setCustomizeIconFunctions] = useState(() => {
    const saved = localStorage.getItem('pirate_customize_icon_functions');
    return saved !== null ? saved === 'true' : true;
  });
  const [showRelatedAlerts, setShowRelatedAlerts] = useState(() => {
    const saved = localStorage.getItem('pirate_show_related_alerts');
    return saved !== null ? saved === 'true' : true;
  });
  const [disableQuickChat, setDisableQuickChat] = useState(() => {
    const saved = localStorage.getItem('pirate_disable_quick_chat');
    return saved !== null ? saved === 'true' : false;
  });
  const [powerSaverLogin, setPowerSaverLogin] = useState(() => {
    const saved = localStorage.getItem('pirate_power_saver_login');
    return saved !== null ? saved === 'true' : false;
  });
  const [stopRogueAlliances, setStopRogueAlliances] = useState(() => {
    const saved = localStorage.getItem('pirate_stop_rogue_alliances');
    return saved !== null ? saved === 'true' : false;
  });
  const [heatingEnergyIndex, setHeatingEnergyIndex] = useState(() => {
    const saved = localStorage.getItem('pirate_heating_energy_index');
    return saved !== null ? saved === 'true' : false;
  });

  // --- Preloading & Optimization (Lazy & Deferred) ---
  useEffect(() => {
    // 1. Immediately preload ONLY critical UI icons for instant rendering
    const criticalAssets = [
      GOLD_COIN_ICON,
      GEM_ICON,
      "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/harbor_sprite_final.png"
    ];

    criticalAssets.forEach(url => {
      if (!url) return;
      const img = new Image();
      img.decoding = 'async';
      img.src = url;
    });

    // 2. Defer heavy background asset preloading until 3 seconds after boot
    const deferredTimer = setTimeout(() => {
      // Preload current building levels
      const harborUrl = getHarborImageUrl(shipTowerLevel || 1);
      const fishUrl = getFishHouseImageUrl(fishStorageLevel || 1);
      [harborUrl, fishUrl].forEach(url => {
        const img = new Image();
        img.decoding = 'async';
        img.src = url;
      });

      // Preload remaining UI assets in background
      const githubAssets = [
        "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/settings.png",
        "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/chat.png",
        "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/shop.png",
        "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/storage.png",
        "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/friends.png",
        "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/rank.png",
        "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/clan.png"
      ];

      githubAssets.forEach(url => {
        const img = new Image();
        img.decoding = 'async';
        img.src = url;
      });
    }, 3000);

    return () => clearTimeout(deferredTimer);
  }, []);

  // Persistence effects for new settings
  useEffect(() => {
    localStorage.setItem('pirate_language', language);
  }, [language]);
  useEffect(() => {
    localStorage.setItem('pirate_show_death_banners', showDeathBanners.toString());
  }, [showDeathBanners]);
  useEffect(() => {
    localStorage.setItem('pirate_show_attack_notifications', showAttackNotifications.toString());
  }, [showAttackNotifications]);
  useEffect(() => {
    localStorage.setItem('pirate_show_chest_notifications', showChestNotifications.toString());
  }, [showChestNotifications]);
  useEffect(() => {
    localStorage.setItem('pirate_show_popup_alerts', showPopupAlerts.toString());
  }, [showPopupAlerts]);
  useEffect(() => {
    localStorage.setItem('pirate_disable_animated_bg', disableAnimatedBackground.toString());
  }, [disableAnimatedBackground]);
  useEffect(() => {
    localStorage.setItem('pirate_power_saver', powerSaver.toString());
  }, [powerSaver]);
  useEffect(() => {
    localStorage.setItem('pirate_show_sound_tones', showSoundTones.toString());
  }, [showSoundTones]);
  useEffect(() => {
    localStorage.setItem('pirate_customize_icon_functions', customizeIconFunctions.toString());
  }, [customizeIconFunctions]);
  useEffect(() => {
    localStorage.setItem('pirate_show_related_alerts', showRelatedAlerts.toString());
  }, [showRelatedAlerts]);
  useEffect(() => {
    localStorage.setItem('pirate_disable_quick_chat', disableQuickChat.toString());
  }, [disableQuickChat]);
  useEffect(() => {
    localStorage.setItem('pirate_power_saver_login', powerSaverLogin.toString());
  }, [powerSaverLogin]);
  useEffect(() => {
    localStorage.setItem('pirate_stop_rogue_alliances', stopRogueAlliances.toString());
  }, [stopRogueAlliances]);
  useEffect(() => {
    localStorage.setItem('pirate_heating_energy_index', heatingEnergyIndex.toString());
  }, [heatingEnergyIndex]);

  // Sub-modals for settings interactions
  const [activeSettingsModal, setActiveSettingsModal] = useState<'email' | 'password' | 'ticket' | 'icons' | 'delete' | null>(null);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState<boolean>(false);
  const [ticketSubject, setTicketSubject] = useState<string>('');
  const [ticketMessage, setTicketMessage] = useState<string>('');
  const [newEmailInput, setNewEmailInput] = useState<string>('');
  const [settingsToast, setSettingsToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setSettingsToast({ message, type });
    setTimeout(() => {
      setSettingsToast(null);
    }, 4000);
  };

  const handleSendPasswordReset = async () => {
    const email = auth.currentUser?.email || 'neyazyyyyy@gmail.com';
    try {
      const { sendPasswordResetEmail } = await import('firebase/auth');
      await sendPasswordResetEmail(auth, email);
      showToast('🔑 تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني بنجاح!', 'success');
    } catch (err: any) {
      console.error(err);
      showToast('❌ حدث خطأ أثناء إرسال الرابط: ' + (err.message || String(err)), 'error');
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmailInput || !newEmailInput.includes('@')) {
      showToast('❌ الرجاء إدخال بريد إلكتروني صحيح!', 'error');
      return;
    }
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const { verifyBeforeUpdateEmail } = await import('firebase/auth');
        await verifyBeforeUpdateEmail(currentUser, newEmailInput);
        
        showToast('✉️ تم إرسال رابط تأكيد إلى بريدك الجديد. سيتم تحديث بريدك الإلكتروني تلقائياً بعد النقر على الرابط.', 'success');
        setActiveSettingsModal(null);
        setNewEmailInput('');
      } else {
        showToast('❌ يجب تسجيل الدخول لتغيير البريد الإلكتروني', 'error');
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/requires-recent-login') {
        showToast('❌ يرجى إعادة تسجيل الدخول لتغيير البريد الإلكتروني (إجراء أمني)', 'error');
      } else {
        showToast('❌ فشل تحديث البريد الإلكتروني: ' + (err.message || 'خطأ أمني'), 'error');
      }
    }
  };

  const handleCreateSupportTicket = async () => {
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      showToast('❌ الرجاء ملء جميع الحقول لكتابة تذكرة الدعم!', 'error');
      return;
    }
    try {
      const currentUser = auth.currentUser;
      const ticketData = {
        userId: currentUser?.uid || 'anonymous',
        username: username,
        email: currentUser?.email || 'neyazyyyyy@gmail.com',
        subject: ticketSubject,
        message: ticketMessage,
        status: 'open',
        createdAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'support_tickets'), ticketData);
      showToast('🎫 تم إنشاء تذكرة الدعم الفني بنجاح رقم #' + Math.floor(1000 + Math.random() * 9000), 'success');
      setActiveSettingsModal(null);
      setTicketSubject('');
      setTicketMessage('');
    } catch (err: any) {
      console.error(err);
      showToast('❌ فشل إنشاء تذكرة الدعم: ' + err.message, 'error');
    }
  };




  const [updatingGame, setUpdatingGame] = useState<boolean>(false);
  const handleUpdateGameVersion = () => {
    setUpdatingGame(true);
    showToast('🔄 جاري التحقق من وجود تحديثات للألعاب والملفات...', 'success');
    setTimeout(() => {
      setUpdatingGame(false);
      showToast('✅ اللعبة محدثة لأحدث إصدار ومستقرة تماماً!', 'success');
    }, 2500);
  };

  // --- Dynamic Weather States & Engine ---
  const [weather, setWeather] = useState<'clear' | 'rain' | 'fog' | 'storm'>(() => {
    return (localStorage.getItem('pirate_weather') as 'clear' | 'rain' | 'fog' | 'storm') || 'clear';
  });
  const [weatherNotify, setWeatherNotify] = useState<string | null>(null);
  const [lightningActive, setLightningActive] = useState<boolean>(false);

  const changeWeather = (newWeather: 'clear' | 'rain' | 'fog' | 'storm') => {
    setWeather(newWeather);
    localStorage.setItem('pirate_weather', newWeather);

    let message = '';
    switch (newWeather) {
      case 'clear':
        message = 'انقشعت الغيوم وعاد الطقس صافياً ومشرقاً على مينائنا الهادئ! ☀️';
        break;
      case 'rain':
        message = 'أجواء ماطرة تسود الأجواء.. بدأت حبات المطر بالهطول على مياه الميناء 🌧️';
        break;
      case 'fog':
        message = 'ضباب بحري كثيف يغلف السواحل ويحجب الرؤية عن الأساطيل البعيدة! 🌫️';
        break;
      case 'storm':
        message = '🚨 تحذير: عاصفة بحرية رعدية هائجة تضرب الميناء الآن! تماسكوا يا قراصنة! ⛈️';
        break;
    }

    setWeatherNotify(message);
    setTimeout(() => {
      setWeatherNotify(prev => prev === message ? null : prev);
    }, 6000);
  };

  const rainStreaks = React.useMemo(() => {
    return Array.from({ length: 35 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
      dur: `${0.6 + Math.random() * 0.4}s`,
      opacity: 0.3 + Math.random() * 0.4,
      height: `${40 + Math.random() * 40}px`
    }));
  }, []);

  // --- Random Dynamic Weather Loop ---
  useEffect(() => {
    const interval = setInterval(() => {
      const weathers: ('clear' | 'rain' | 'fog' | 'storm')[] = ['clear', 'rain', 'fog', 'storm'];
      const rand = Math.random();
      let nextWeather: 'clear' | 'rain' | 'fog' | 'storm' = 'clear';
      if (rand < 0.45) {
        nextWeather = 'clear';
      } else if (rand < 0.65) {
        nextWeather = 'rain';
      } else if (rand < 0.85) {
        nextWeather = 'fog';
      } else {
        nextWeather = 'storm';
      }
      
      if (nextWeather !== weather) {
        changeWeather(nextWeather);
      }
    }, 70000); // changes every 70 seconds randomly

    return () => clearInterval(interval);
  }, [weather]);

  // --- Lightning flash interval for storms ---
  useEffect(() => {
    if (weather !== 'storm' || lowGraphics) {
      setLightningActive(false);
      return;
    }

    let lightningTimeout: any;
    const triggerLightning = () => {
      setLightningActive(true);
      setTimeout(() => {
        setLightningActive(false);
      }, 450);

      const nextDelay = 8000 + Math.random() * 14000;
      lightningTimeout = setTimeout(triggerLightning, nextDelay);
    };

    lightningTimeout = setTimeout(triggerLightning, 6000 + Math.random() * 6000);

    return () => clearTimeout(lightningTimeout);
  }, [weather, lowGraphics]);

  // --- Dynamic Tide & Ebb (المد والجزر) ---
  const [tide, setTide] = useState<'low' | 'incoming' | 'high' | 'outgoing'>(() => {
    return (localStorage.getItem('pirate_tide') as 'low' | 'incoming' | 'high' | 'outgoing') || 'high';
  });
  const [tideNotify, setTideNotify] = useState<string | null>(null);

  const changeTide = (newTide: 'low' | 'incoming' | 'high' | 'outgoing') => {
    setTide(newTide);
    localStorage.setItem('pirate_tide', newTide);

    let message = '';
    switch (newTide) {
      case 'high':
        message = '🌊 المد العالي يغمر شواطئ الميناء ويرفع مستوى مياه البحر!';
        break;
      case 'outgoing':
        message = '📉 تراجع البحر.. بدأت مياه الخليج بالانحسار التدريجي نحو الجزر';
        break;
      case 'low':
        message = '🐚 الجزر التام يكشف رمال الشاطئ والمنحدرات الصخرية للميناء!';
        break;
      case 'incoming':
        message = '📈 فيضان المد البحري.. مستوى المياه يرتفع تدريجياً لترسو السفن بأمان';
        break;
    }

    setTideNotify(message);
    setTimeout(() => {
      setTideNotify(prev => prev === message ? null : prev);
    }, 6000);
  };

  // --- Automatic Tide Cycle ---
  useEffect(() => {
    const interval = setInterval(() => {
      const phases: ('low' | 'incoming' | 'high' | 'outgoing')[] = ['low', 'incoming', 'high', 'outgoing'];
      const nextIndex = (phases.indexOf(tide) + 1) % phases.length;
      changeTide(phases[nextIndex]);
    }, 60000); // Changes tide phase every 60 seconds

    return () => clearInterval(interval);
  }, [tide]);

  // --- High-precision Seamless Background Video Monitor ---
  useEffect(() => {
    if (portDestroyed || bgTheme === 'destroyed' || disableAnimatedBackground || powerSaver) {
      try {
        if (videoRefA.current) videoRefA.current.pause();
        if (videoRefB.current) videoRefB.current.pause();
      } catch (e) {}
      return;
    }

    const intervalId = setInterval(() => {
      if (isTransitioning) return;

      const activeRef = activeVideo === 'A' ? videoRefA : videoRefB;
      const nextRef = activeVideo === 'A' ? videoRefB : videoRefA;
      const video = activeRef.current;
      const nextVideo = nextRef.current;

      if (video && video.duration && nextVideo) {
        // Trigger a 1.5 seconds cross-fade 1.8 seconds before the current video ends
        if (video.currentTime >= video.duration - 1.8) {
          setIsTransitioning(true);
          nextVideo.currentTime = 0;
          
          // Align initial audio status before playback starts
          nextVideo.muted = isMusicMuted;
          nextVideo.volume = isMusicMuted ? 0 : 0;
          video.muted = isMusicMuted;
          video.volume = isMusicMuted ? 0 : 1;

          nextVideo.play().then(() => {
            // Smoothly crossfade volumes
            const startTime = Date.now();
            const fadeDuration = 1500;
            const fadeInterval = setInterval(() => {
              const elapsed = Date.now() - startTime;
              const progress = Math.min(elapsed / fadeDuration, 1);
              
              if (!isMusicMuted) {
                video.volume = 1 - progress;
                nextVideo.volume = progress;
              } else {
                video.volume = 0;
                nextVideo.volume = 0;
              }

              if (progress >= 1) {
                clearInterval(fadeInterval);
              }
            }, 50);

            // After 1.5 seconds, finalize the swap (Smart State Swap)
            setTimeout(() => {
              setActiveVideo(activeVideo === 'A' ? 'B' : 'A');
              setIsTransitioning(false);
              
              // Smart State Swap: pause and reset previous video
              try {
                video.pause();
                video.currentTime = 0;
                // safety reset volume
                if (!isMusicMuted) {
                  nextVideo.volume = 1;
                  video.volume = 0;
                }
              } catch (e) {
                console.log("Error resetting previous video:", e);
              }
            }, 1500);
          }).catch(err => {
            console.log("Failed to play next video buffer:", err);
            setIsTransitioning(false);
          });
        }
      }
    }, 50);

    return () => clearInterval(intervalId);
  }, [activeVideo, isTransitioning, portDestroyed, bgTheme, isMusicMuted, disableAnimatedBackground, powerSaver]);

  // Pause videos when animated background is disabled or power saver is active
  useEffect(() => {
    if (disableAnimatedBackground || powerSaver) {
      if (videoRefA.current) {
        try { videoRefA.current.pause(); } catch (e) {}
      }
      if (videoRefB.current) {
        try { videoRefB.current.pause(); } catch (e) {}
      }
    } else {
      const activeRef = activeVideo === 'A' ? videoRefA : videoRefB;
      if (activeRef.current) {
        activeRef.current.play().catch(() => {});
      }
    }
  }, [disableAnimatedBackground, powerSaver, activeVideo]);

  // Synchronize mute/unmute state instantly on user toggle
  useEffect(() => {
    if (disableAnimatedBackground || powerSaver) return;
    const videoA = videoRefA.current;
    const videoB = videoRefB.current;
    if (videoA) {
      videoA.muted = isMusicMuted;
      if (!isMusicMuted && activeVideo === 'A') videoA.volume = 1;
    }
    if (videoB) {
      videoB.muted = isMusicMuted;
      if (!isMusicMuted && activeVideo === 'B') videoB.volume = 1;
    }
  }, [isMusicMuted, activeVideo, disableAnimatedBackground, powerSaver]);

  // --- Background Video Audio Autoplay Handler ---
  useEffect(() => {
    if (disableAnimatedBackground || powerSaver) return;
    const activeRef = activeVideo === 'A' ? videoRefA : videoRefB;
    const video = activeRef.current;
    if (video) {
      video.muted = isMusicMuted;
      video.volume = isMusicMuted ? 0 : 1;
      video.play().catch(err => {
        console.log("Video playback control error. Forcing muted fallback...", err);
        video.muted = true;
        video.play().catch(() => {});
      });
    }
  }, [activeVideo, bgTheme, isMusicMuted, disableAnimatedBackground, powerSaver]);

  useEffect(() => {
    if (disableAnimatedBackground || powerSaver) return;
    const handleFirstInteraction = () => {
      const activeRef = activeVideo === 'A' ? videoRefA : videoRefB;
      const video = activeRef.current;
      if (video) {
        video.muted = isMusicMuted;
        video.volume = isMusicMuted ? 0 : 1;
        video.play().catch(() => {});
      }
    };
    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true });
    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [activeVideo, bgTheme, isMusicMuted]);

  // --- Captain Level Calculation ---
  const playerLevel = Math.floor(exp / 100) + 1;
  const expToNextLevel = playerLevel * 100;

  // --- Player Power calculation ---
  const activeShipsCount = ships.filter(s => s.exists).length;
  const crewPowerTotal = ships.filter(s => s.exists).reduce((acc, s) => acc + s.crewPower, 0);
  const shipUpgradesPower = ships
    .filter(s => s.exists)
    .reduce((acc, s) => acc + ((s.speedLevel || 1) - 1) * 1 + ((s.capacityLevel || 1) - 1) * 1 + ((s.defenseLevel || 1) - 1) * 4, 0);
  const playerPower = 10 + activeShipsCount * 5 + crewPowerTotal + (pirateClass === 'مقاتل الأساطيل' ? 15 : 0) + (shipTowerLevel - 1) * 10 + shipUpgradesPower;

  // --- Save states on change ---
  useEffect(() => {
    localStorage.setItem('gold', gold.toString());
  }, [gold]);

  useEffect(() => {
    localStorage.setItem('gems', gems.toString());
  }, [gems]);

  useEffect(() => {
    localStorage.setItem('pirate_exp', exp.toString());
  }, [exp]);

  useEffect(() => {
    const cleanToStore = ships.map(s => ({ ...s, moving: false }));
    localStorage.setItem('pirate_ships_v2', JSON.stringify(cleanToStore));
  }, [ships]);

  useEffect(() => {
    localStorage.setItem('pirate_username', username);
  }, [username]);

  useEffect(() => {
    localStorage.setItem('pirate_avatar', avatar);
  }, [avatar]);

  useEffect(() => {
    localStorage.setItem('pirate_server', server);
  }, [server]);

  useEffect(() => {
    localStorage.setItem('pirate_class', pirateClass);
  }, [pirateClass]);

  useEffect(() => {
    localStorage.setItem('pirate_is_logged_in', isLoggedIn.toString());
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('fish_storage_level', fishStorageLevel.toString());
  }, [fishStorageLevel]);

  useEffect(() => {
    localStorage.setItem('ship_tower_level', shipTowerLevel.toString());
  }, [shipTowerLevel]);

  useEffect(() => {
    localStorage.setItem('pirate_fish_inventory', JSON.stringify(fishInventory));
  }, [fishInventory]);

  useEffect(() => {
    localStorage.setItem('pirate_red_gems', redGems.toString());
  }, [redGems]);

  useEffect(() => {
    localStorage.setItem('pirate_weapons', JSON.stringify(weapons));
  }, [weapons]);

  useEffect(() => {
    localStorage.setItem('pirate_music_muted', isMusicMuted.toString());
  }, [isMusicMuted]);

  useEffect(() => {
    localStorage.setItem('pirate_sfx_muted', isSfxMuted.toString());
  }, [isSfxMuted]);

  useEffect(() => {
    localStorage.setItem('pirate_show_nets', showNets.toString());
  }, [showNets]);

  useEffect(() => {
    localStorage.setItem('pirate_low_graphics', lowGraphics.toString());
  }, [lowGraphics]);

  useEffect(() => {
    localStorage.setItem('pirate_port_destroyed', portDestroyed.toString());
  }, [portDestroyed]);

  useEffect(() => {
    if (portDestroyed && activeTab === 'harbor') {
      const triggerPortExplosions = () => {
        // Core center explosion
        window.dispatchEvent(new CustomEvent('spawn-pirate-particles', {
          detail: { x: 45, y: 48, type: 'explosion', count: 45 }
        }));
        
        // Random multi-bursts slightly delayed
        const delayBurst = (x: number, y: number, ms: number) => {
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('spawn-pirate-particles', {
              detail: { x, y, type: 'destroy', count: 35 }
            }));
          }, ms);
        };
        
        delayBurst(15, 30, 200);
        delayBurst(74, 18, 400);
        delayBurst(35, 52, 650);
        delayBurst(60, 40, 900);
      };
      
      triggerPortExplosions();
    }
  }, [portDestroyed, activeTab]);

  // --- Dock & Fishing spot positions ---
  const docks: Record<string, { l: string; t: string }> = {
    s1: { l: '45%', t: '38%' },
    s2: { l: '45%', t: '49%' },
    s3: { l: '45%', t: '60%' },
    s4: { l: '45%', t: '52%' },
    s5: { l: '45%', t: '68%' },
  };

  const fishSpots: Record<string, { l: string; t: string }> = {
    s1: { l: '70%', t: '38%' },
    s2: { l: '70%', t: '49%' },
    s3: { l: '70%', t: '60%' },
    s4: { l: '70%', t: '52%' },
    s5: { l: '70%', t: '68%' },
  };

  const sunSparklesList = [
    { id: 1, left: '55%', top: '35%', size: '6px', delay: '0s', dur: '3s' },
    { id: 2, left: '52%', top: '38%', size: '8px', delay: '0.5s', dur: '4s' },
    { id: 3, left: '58%', top: '42%', size: '5px', delay: '1s', dur: '2.5s' },
    { id: 4, left: '50%', top: '45%', size: '7px', delay: '1.5s', dur: '3.5s' },
    { id: 5, left: '54%', top: '48%', size: '9px', delay: '0.2s', dur: '4.2s' },
    { id: 6, left: '56%', top: '52%', size: '6px', delay: '1.2s', dur: '2.8s' },
    { id: 7, left: '48%', top: '50%', size: '8px', delay: '0.8s', dur: '3.8s' },
    { id: 8, left: '51%', top: '55%', size: '5px', delay: '2.2s', dur: '3.1s' },
    { id: 9, left: '55%', top: '58%', size: '7px', delay: '1.7s', dur: '2.9s' },
    { id: 10, left: '59%', top: '62%', size: '9px', delay: '0.4s', dur: '4.5s' },
    { id: 11, left: '53%', top: '65%', size: '6px', delay: '1.1s', dur: '3.3s' },
    { id: 12, left: '47%', top: '60%', size: '8px', delay: '2.5s', dur: '3.7s' },
    { id: 13, left: '56%', top: '70%', size: '5px', delay: '0.3s', dur: '2.4s' },
    { id: 14, left: '51%', top: '72%', size: '7px', delay: '1.9s', dur: '3.9s' },
    { id: 15, left: '58%', top: '75%', size: '9px', delay: '0.7s', dur: '4.1s' },
    { id: 16, left: '54%', top: '78%', size: '6px', delay: '1.4s', dur: '2.7s' },
    { id: 17, left: '49%', top: '74%', size: '8px', delay: '2.1s', dur: '3.6s' },
    { id: 18, left: '52%', top: '82%', size: '5px', delay: '0.9s', dur: '3.2s' },
    { id: 19, left: '57%', top: '85%', size: '7px', delay: '1.6s', dur: '2.8s' },
    { id: 20, left: '55%', top: '88%', size: '10px', delay: '0.1s', dur: '4.6s' },
    { id: 21, left: '50%', top: '84%', size: '6px', delay: '2.4s', dur: '3.4s' },
    { id: 22, left: '60%', top: '48%', size: '7px', delay: '1.3s', dur: '3s' },
    { id: 23, left: '46%', top: '53%', size: '5px', delay: '0.6s', dur: '2.6s' },
    { id: 24, left: '48%', top: '42%', size: '8px', delay: '1.8s', dur: '4s' },
    { id: 25, left: '62%', top: '56%', size: '6px', delay: '0.2s', dur: '3.2s' }
  ];

  // --- Automatic ship coordinate & state migration ---
  useEffect(() => {
    setShips(prev => prev.map(s => {
      const correctDock = docks[s.id] || { l: '45%', t: '48%' };
      const correctFish = fishSpots[s.id] || { l: '70%', t: '48%' };
      const nextPos = s.status === 'fishing' ? correctFish : correctDock;
      return {
        ...s,
        moving: false,
        left: nextPos.l,
        top: nextPos.t
      };
    }));
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('pirate_battle_reports', JSON.stringify(battleReports));
  }, [battleReports]);

  // --- Handle global clicks to close custom menus ---
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('#ship-menu')) return;
      setMenu(prev => ({ ...prev, visible: false }));
    };
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  // --- Auto-clamp Ship Action Menu so it is NEVER cut off on any screen edge ---
  useLayoutEffect(() => {
    if (menu.visible && shipMenuRef.current) {
      const el = shipMenuRef.current;
      const rect = el.getBoundingClientRect();
      const padding = 12;
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;

      let adjustedX = menu.x;
      let adjustedY = menu.y;

      // Ensure menu never overflows right edge
      if (rect.right > screenW - padding) {
        adjustedX = Math.max(padding, screenW - rect.width - padding);
      }
      // Ensure menu never overflows left edge
      if (adjustedX < padding) {
        adjustedX = padding;
      }

      // Ensure menu never overflows below bottom nav (reserve 115px for bottom bar)
      if (rect.bottom > screenH - 115) {
        adjustedY = Math.max(75, screenH - rect.height - 115);
      }
      // Ensure menu never hides behind top resource bar
      if (adjustedY < 75) {
        adjustedY = 75;
      }

      if (Math.round(adjustedX) !== Math.round(menu.x) || Math.round(adjustedY) !== Math.round(menu.y)) {
        setMenu(prev => ({
          ...prev,
          x: Math.round(adjustedX),
          y: Math.round(adjustedY)
        }));
      }
    }
  }, [menu.visible, menu.shipId, menu.x, menu.y]);

  // --- Firebase Loading Effect with real-time onSnapshot ---
  useEffect(() => {
    let unsubSnapshot: (() => void) | null = null;

    // Fast fallback timer: never block the user on loading screen for more than 200ms
    const quickTimer = setTimeout(() => {
      setLoadingFirebase(false);
    }, 200);

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          
          // 1. Initial Load / Migration (Runs once on auth state change)
          const initialSnap = await getDoc(userDocRef);
          if (initialSnap.exists()) {
            const data = initialSnap.data();

            // Check if active session on server differs from this browser's session
            const serverDeviceId = data.currentDeviceId;
            const localDeviceId = getOrCreateDeviceId();
            const serverSessionId = data.currentSessionId;
            const serverStatus = data.sessionStatus;
            let localSessionId = getLocalSessionId();

            if (!serverDeviceId || !serverSessionId) {
              const res = await registerNewUserSession(user.uid);
              localSessionId = res.sessionId;
            } else if (serverDeviceId === localDeviceId) {
              // Same device: seamlessly resume session across page reloads and tab closures
              if (serverStatus === 'EXPIRED') {
                const res = await registerNewUserSession(user.uid);
                localSessionId = res.sessionId;
              } else {
                setLocalSessionId(serverSessionId);
                localSessionId = serverSessionId;
              }
            } else {
              // Different device has active session
              await handleTerminateOldSession({
                newDevice: data.lastLoginDevice || 'جهاز أو متصفح آخر',
                lastLoginAt: data.lastLoginAt
              });
              setLoadingFirebase(false);
              return;
            }

            lastDbData.current = data;
            justLoadedFromFirestore.current = true;

            const currentCleanEmail = (user.email || localStorage.getItem('google_auth_email') || '').toLowerCase().trim();
            if (currentCleanEmail && data.email !== currentCleanEmail) {
              setDoc(userDocRef, { email: currentCleanEmail, updatedAt: new Date().toISOString() }, { merge: true }).catch(() => {});
            }

            if (data.username) setUsername(data.username);
            if (data.avatar) setAvatar(data.avatar);
            if (data.server) setServer(data.server);
            if (data.pirateClass) setPirateClass(data.pirateClass);
            
            if (typeof data.gold === 'number') setGold(data.gold);
            if (typeof data.gems === 'number') setGems(data.gems);
            if (typeof data.exp === 'number') setExp(data.exp);
            if (typeof data.redGems === 'number') setRedGems(data.redGems);
            if (typeof data.fishStorageLevel === 'number') setFishStorageLevel(data.fishStorageLevel);
            if (typeof data.shipTowerLevel === 'number') setShipTowerLevel(data.shipTowerLevel);
            
            if (data.ships && Array.isArray(data.ships)) setShips(data.ships.map((s: any) => ({ ...s, moving: false })));
            if (data.crew) setCrew(data.crew);
            if (data.quests) setQuests(data.quests);
            if (data.battleReports) setBattleReports(data.battleReports);
            if (data.fishInventory) setFishInventory(data.fishInventory);
            if (data.weapons) setWeapons(data.weapons);
            if (data.crewServices) setCrewServices(data.crewServices);
            if (data.crewInventory) setCrewInventory(data.crewInventory);
            if (data.shieldInventory) setShieldInventory(data.shieldInventory);
            if (Array.isArray(data.friends)) setFriends(data.friends);
            if (Array.isArray(data.friendRequests)) setFriendRequests(data.friendRequests);
            if (data.tribeId) setTribeId(data.tribeId);
            if (data.tribeName) setTribeName(data.tribeName);
            if (typeof data.portDestroyed === 'boolean') setPortDestroyed(data.portDestroyed);

            isLoadedFromFirebase.current = true;
          } else if (!isDeletingAccount.current) {
            // New user: strictly initialize fresh isolated state for this unique user.uid
            const cleanEmail = (user.email || localStorage.getItem('google_auth_email') || '').toLowerCase().trim();
            const storedName = localStorage.getItem('google_auth_name') || '';
            const initialUsername = user.displayName || storedName || (cleanEmail ? cleanEmail.split('@')[0] : '') || 'سياف_البحار';

            const initialData = {
              userId: user.uid,
              googleUid: user.uid,
              authProvider: user.providerData?.[0]?.providerId || 'firebase',
              username: initialUsername,
              email: cleanEmail,
              avatar: '⚓',
              server: 'سيرفر الأسطورة 1',
              pirateClass: 'صياد البحار',
              gold: DEFAULT_GOLD,
              gems: DEFAULT_GEMS,
              exp: DEFAULT_EXP,
              redGems: DEFAULT_RED_GEMS,
              fishStorageLevel: DEFAULT_FISH_STORAGE_LEVEL,
              shipTowerLevel: DEFAULT_SHIP_TOWER_LEVEL,
              ships: DEFAULT_SHIPS,
              crew: DEFAULT_CREW,
              quests: DEFAULT_QUESTS,
              battleReports: [],
              fishInventory: DEFAULT_FISH_INVENTORY,
              weapons: DEFAULT_WEAPONS,
              crewServices: DEFAULT_CREW_SERVICES,
              crewInventory: {
                guide: 1,
                luck: 1,
                sailor: 0,
                thief: 1,
                cop: 1,
                merchant: 0,
                fixer_sm: 5,
                fixer_md: 3,
                fixer_lg: 1,
                fixer_epic: 0,
                market_expert: 1,
                gold_fisher: 1,
              },
              shieldInventory: {
                shield_4h: 1,
                shield_1d: 0,
                shield_2d: 0,
                anti_nuke: 0,
                anti_emp: 0,
                disable_anti_range: 0,
                disable_anti_core: 0,
              },
              friends: [],
              friendRequests: [],
              tribeId: '',
              tribeName: '',
              portDestroyed: false,
              updatedAt: new Date().toISOString()
            };

            // Set React state to isolated initial defaults
            setUsername(initialData.username);
            setAvatar(initialData.avatar);
            setServer(initialData.server);
            setPirateClass(initialData.pirateClass);
            setGold(initialData.gold);
            setGems(initialData.gems);
            setExp(initialData.exp);
            setRedGems(initialData.redGems);
            setFishStorageLevel(initialData.fishStorageLevel);
            setShipTowerLevel(initialData.shipTowerLevel);
            setShips(initialData.ships);
            setCrew(initialData.crew);
            setQuests(initialData.quests);
            setBattleReports([]);
            setFishInventory(initialData.fishInventory);
            setWeapons(initialData.weapons);
            setCrewServices(initialData.crewServices);
            setCrewInventory(initialData.crewInventory);
            setShieldInventory(initialData.shieldInventory);
            setFriends([]);
            setFriendRequests([]);
            setTribeId('');
            setTribeName('');
            setPortDestroyed(false);

            await setDoc(userDocRef, initialData).catch((err) => {
              console.error("Error creating initial user document:", err);
            });
            lastDbData.current = initialData;
            isLoadedFromFirebase.current = true;
          }

          // 2. Set up real-time listener for current user updates from other tabs/clients
          unsubSnapshot = onSnapshot(userDocRef, (docSnap) => {
            clearTimeout(quickTimer);
            if (isDeletingAccount.current || docSnap.metadata.hasPendingWrites) {
              return;
            }
            if (docSnap.exists()) {
              const data = docSnap.data();

              // Concurrency check: if another device or browser logs in, terminate this session immediately
              const serverDeviceId = data.currentDeviceId;
              const localDeviceId = getOrCreateDeviceId();
              const serverSessionId = data.currentSessionId;
              const localSessionId = getLocalSessionId();
              const serverStatus = data.sessionStatus;

              if ((serverDeviceId && localDeviceId && serverDeviceId !== localDeviceId) || serverStatus === 'EXPIRED') {
                handleTerminateOldSession({
                  newDevice: data.lastLoginDevice || 'جهاز أو متصفح آخر',
                  lastLoginAt: data.lastLoginAt
                });
                return;
              }

              // Synchronize localSessionId for same device
              if (serverDeviceId === localDeviceId && serverSessionId && localSessionId !== serverSessionId) {
                setLocalSessionId(serverSessionId);
              }

              lastDbData.current = data;
              justLoadedFromFirestore.current = true;

              if (data.username) setUsername(data.username);
              if (data.avatar) setAvatar(data.avatar);
              if (data.server) setServer(data.server);
              if (data.pirateClass) setPirateClass(data.pirateClass);
              
              setGold(prev => typeof data.gold === 'number' && data.gold !== prev ? data.gold : prev);
              setGems(prev => typeof data.gems === 'number' && data.gems !== prev ? data.gems : prev);
              setExp(prev => typeof data.exp === 'number' && data.exp !== prev ? data.exp : prev);
              setRedGems(prev => typeof data.redGems === 'number' && data.redGems !== prev ? data.redGems : prev);
              setFishStorageLevel(prev => typeof data.fishStorageLevel === 'number' && data.fishStorageLevel !== prev ? data.fishStorageLevel : prev);
              setShipTowerLevel(prev => typeof data.shipTowerLevel === 'number' && data.shipTowerLevel !== prev ? data.shipTowerLevel : prev);
              
              if (data.ships && Array.isArray(data.ships) && data.ships.length > 0) {
                setShips(data.ships.map((s: any) => ({ ...s, moving: false })));
                localStorage.setItem('pirate_ships', JSON.stringify(data.ships));
              }
              if (data.crew) setCrew(data.crew);
              if (data.quests) setQuests(data.quests);
              if (data.battleReports) setBattleReports(data.battleReports);
              if (data.fishInventory) setFishInventory(data.fishInventory);
              if (data.weapons) setWeapons(data.weapons);
              if (data.crewServices) setCrewServices(data.crewServices);
              if (data.crewInventory) setCrewInventory(data.crewInventory);
              if (data.shieldInventory) setShieldInventory(data.shieldInventory);
              if (Array.isArray(data.friends)) setFriends(data.friends);
              if (Array.isArray(data.friendRequests)) setFriendRequests(data.friendRequests);
              if (data.tribeId) setTribeId(data.tribeId);
              if (data.tribeName) setTribeName(data.tribeName);
              if (typeof data.portDestroyed === 'boolean') {
                setPortDestroyed(data.portDestroyed);
                localStorage.setItem('pirate_port_destroyed', data.portDestroyed.toString());
              }
            }
            // Note: If !docSnap.exists(), we do NOT recreate it, respecting account deletion!
            setLoadingFirebase(false);
          }, (err) => {
            console.error("Error in real-time user document listener:", err);
            clearTimeout(quickTimer);
            setLoadingFirebase(false);
          });
          unsubUserSnapshot.current = unsubSnapshot;

          setIsLoggedIn(true);
          setLoadingFirebase(false);
        } catch (error) {
          console.error("Error loading user profile from Firestore:", error);
          try {
            handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
          } catch (e) {}
          clearTimeout(quickTimer);
          setLoadingFirebase(false);
        }
      } else {
        // User not logged into Firebase: do NOT wipe localStorage so local progress is preserved!
        setCurrentUser(null);
        setIsLoggedIn(false);
        isLoadedFromFirebase.current = false;
        clearTimeout(quickTimer);
        setLoadingFirebase(false);
        if (unsubSnapshot) {
          unsubSnapshot();
          unsubSnapshot = null;
        }
      }
    });

    return () => {
      clearTimeout(quickTimer);
      unsubscribeAuth();
      if (unsubSnapshot) {
        unsubSnapshot();
      }
    };
  }, []);

  // --- Flush data to Firestore before page unload / refresh ---
  useEffect(() => {
    const handleBeforeUnload = () => {
      const user = auth.currentUser;
      if (!user || !isLoadedFromFirebase.current || isDeletingAccount.current || isSessionTerminated.current) return;
      const cleanUserEmail = user.email?.toLowerCase().trim() || (localStorage.getItem('google_auth_email') || '').toLowerCase().trim();
      const currentData = {
        username, email: cleanUserEmail, avatar, server, pirateClass, gold, gems, exp, redGems,
        fishStorageLevel, shipTowerLevel, ships, crew, quests, battleReports,
        fishInventory, weapons, crewServices, crewInventory, shieldInventory, portDestroyed, friends, friendRequests, tribeId, tribeName,
        updatedAt: new Date().toISOString()
      };
      const userDocRef = doc(db, 'users', user.uid);
      setDoc(userDocRef, { userId: user.uid, ...currentData }, { merge: true }).catch(() => {});
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [
    username, avatar, server, pirateClass, gold, gems, exp, redGems,
    fishStorageLevel, shipTowerLevel, ships, crew, quests, battleReports,
    fishInventory, weapons, crewServices, crewInventory, shieldInventory, portDestroyed
  ]);

  // --- Active Session Continuous Validation (Interval + Tab Focus + Event) ---
  useEffect(() => {
    const checkSessionActivity = async () => {
      const user = auth.currentUser;
      if (!user || isSessionTerminated.current) return;
      const res = await verifyActiveSession(user.uid);
      if (!res.isValid) {
        handleTerminateOldSession({
          newDevice: res.deviceInfo || 'جهاز أو متصفح آخر'
        });
      }
    };

    const handleFocusOrVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkSessionActivity();
      }
    };

    const handleSessionTerminatedEvent = (e: any) => {
      const detail = e?.detail || {};
      handleTerminateOldSession({
        newDevice: detail.device || 'جهاز أو متصفح آخر'
      });
    };

    window.addEventListener('focus', handleFocusOrVisibility);
    document.addEventListener('visibilitychange', handleFocusOrVisibility);
    window.addEventListener('session-terminated-by-other-device', handleSessionTerminatedEvent);

    const interval = setInterval(checkSessionActivity, 15000);

    return () => {
      window.removeEventListener('focus', handleFocusOrVisibility);
      document.removeEventListener('visibilitychange', handleFocusOrVisibility);
      window.removeEventListener('session-terminated-by-other-device', handleSessionTerminatedEvent);
      clearInterval(interval);
    };
  }, []);

  // --- Firebase Auto-Save Effect ---
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    const user = auth.currentUser;
    if (!user || !isLoadedFromFirebase.current || isDeletingAccount.current) return;

    if (justLoadedFromFirestore.current) {
      justLoadedFromFirestore.current = false;
      return;
    }

    const cleanUserEmail = user.email?.toLowerCase().trim() || (localStorage.getItem('google_auth_email') || '').toLowerCase().trim();

    const currentData = {
      username,
      email: cleanUserEmail,
      avatar,
      server,
      pirateClass,
      gold,
      gems,
      exp,
      redGems,
      fishStorageLevel,
      shipTowerLevel,
      ships,
      crew,
      quests,
      battleReports,
      fishInventory,
      weapons,
      crewServices,
      portDestroyed,
      friends,
      friendRequests,
      tribeId,
      tribeName
    };

    if (lastDbData.current && areFieldsEqual(lastDbData.current, currentData)) {
      // Data is exactly the same as in DB, skip saving
      return;
    }

    const saveData = async () => {
      if (isDeletingAccount.current || !isLoadedFromFirebase.current || !auth.currentUser || isSessionTerminated.current) return;
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
          userId: user.uid,
          ...currentData,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        lastDbData.current = currentData;
      } catch (error) {
        console.error("Error saving user profile to Firestore:", error);
        try {
          handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
        } catch (e) {}
      }
    };

    saveTimeoutRef.current = setTimeout(() => {
      saveData();
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [
    username, avatar, server, pirateClass, gold, gems, exp, redGems,
    fishStorageLevel, shipTowerLevel, ships, crew, quests, battleReports,
    fishInventory, weapons, crewServices, portDestroyed, friends, friendRequests, tribeId, tribeName
  ]);

  // --- Active Account & Email Cloud Synchronization ---
  const handleSyncAccount = async () => {
    const user = auth.currentUser;
    const userEmail = user?.email || localStorage.getItem('google_auth_email') || '';
    
    if (!user && !userEmail) {
      showToast('⚠️ يرجى تسجيل الدخول أولاً لمزامنة الحساب والبريد.', 'error');
      return;
    }

    showToast('🔄 جاري مزامنة بيانات الحساب والبريد الإلكتروني مع السحابة...', 'success');

    try {
      let targetUid = user?.uid;
      let userDocRef = targetUid ? doc(db, 'users', targetUid) : null;
      let docSnap = userDocRef ? await getDoc(userDocRef) : null;

      const cleanUserEmail = userEmail.toLowerCase().trim();

      // If docSnap doesn't exist by UID, search by email in Firestore
      if ((!docSnap || !docSnap.exists()) && cleanUserEmail) {
        const q = query(collection(db, 'users'), where('email', '==', cleanUserEmail));
        const snap = await getDocs(q);
        if (!snap.empty) {
          docSnap = snap.docs[0];
          userDocRef = docSnap.ref;
        }
      }

      if (docSnap && docSnap.exists()) {
        const data = docSnap.data();
        if (data.username) setUsername(data.username);
        if (data.avatar) setAvatar(data.avatar);
        if (data.server) setServer(data.server);
        if (data.pirateClass) setPirateClass(data.pirateClass);
        if (typeof data.gold === 'number') setGold(data.gold);
        if (typeof data.gems === 'number') setGems(data.gems);
        if (typeof data.exp === 'number') setExp(data.exp);
        if (typeof data.redGems === 'number') setRedGems(data.redGems);
        if (typeof data.fishStorageLevel === 'number') setFishStorageLevel(data.fishStorageLevel);
        if (typeof data.shipTowerLevel === 'number') setShipTowerLevel(data.shipTowerLevel);
        if (data.ships && Array.isArray(data.ships)) setShips(data.ships.map((s: any) => ({ ...s, moving: false })));
        if (data.crew) setCrew(data.crew);
        if (data.quests) setQuests(data.quests);
        if (data.battleReports) setBattleReports(data.battleReports);
        if (data.fishInventory) setFishInventory(data.fishInventory);
        if (data.weapons) setWeapons(data.weapons);
        if (data.crewServices) setCrewServices(data.crewServices);
        if (data.crewInventory) setCrewInventory(data.crewInventory);
        if (data.shieldInventory) setShieldInventory(data.shieldInventory);
        if (Array.isArray(data.friends)) setFriends(data.friends);
        if (Array.isArray(data.friendRequests)) setFriendRequests(data.friendRequests);
        if (data.tribeId) setTribeId(data.tribeId);
        if (data.tribeName) setTribeName(data.tribeName);

        // Always sync email & userId onto the document
        if (userDocRef) {
          await setDoc(userDocRef, {
            userId: user?.uid || data.userId,
            email: cleanUserEmail || data.email || '',
            username: data.username || username,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }

        if (cleanUserEmail) {
          localStorage.setItem('google_auth_email', cleanUserEmail);
        }

        showToast('✅ تم مزامنة بيانات الحساب والبريد الإلكتروني بنجاح مع السحابة!', 'success');
      } else if (targetUid) {
        // Save current game state to cloud
        const currentData = {
          userId: targetUid,
          username,
          email: cleanUserEmail,
          avatar, server, pirateClass, gold, gems, exp, redGems,
          fishStorageLevel, shipTowerLevel, ships, crew, quests, battleReports,
          fishInventory, weapons, crewServices, portDestroyed, friends, friendRequests, tribeId, tribeName,
          updatedAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'users', targetUid), currentData, { merge: true });
        showToast('✅ تم إنشاء وحفظ وثيقة الحساب السحابي بنجاح!', 'success');
      }
    } catch (err: any) {
      console.error('Account sync error:', err);
      showToast('❌ تعذرت المزامنة المباشرة: ' + (err.message || 'حاول لاحقاً'), 'error');
    }
  };

  // --- Live Firestore Chat Subscription ---
  useEffect(() => {
    if (!isLoggedIn || !currentUser) return;
    // Querying with limit avoids missing index or missing field errors on old chat entries
    const q = query(collection(db, 'chats'), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: ChatMessage[] = [];
      const currentUid = currentUser.uid || localStorage.getItem('pirate_local_uid') || '';
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        msgs.push({
          id: docSnap.id,
          sender: data.sender || 'مجهول',
          avatar: data.avatar || '⚓',
          text: data.text || '',
          time: data.time || '',
          userId: data.userId || '',
          createdAt: data.createdAt || '',
          isMe: (!!currentUid && data.userId === currentUid) || (!!data.sender && data.sender === username)
        });
      });

      // Sort in-memory chronologically
      msgs.sort((a, b) => {
        const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (tA && tB) return tA - tB;
        return a.id.localeCompare(b.id);
      });

      setChatMessages(msgs);
    }, (err) => {
      console.warn("Could not fetch chats from Firestore:", err.message || err);
    });
    return () => unsubscribe();
  }, [isLoggedIn, currentUser, username]);

  // --- Auto-scroll Chat to bottom when new messages arrive or when chat tab opens ---
  useEffect(() => {
    if (activeTab === 'chat' && chatScrollRef.current) {
      setTimeout(() => {
        if (chatScrollRef.current) {
          chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
      }, 50);
    }
  }, [chatMessages.length, activeTab]);

  // --- Live Tribes Subscription ---
  useEffect(() => {
    if (!isLoggedIn || !currentUser) return;
    // Querying with limit and sorting in-memory avoids missing-field exclusion and index requirements
    const q = query(collection(db, 'tribes'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          name: data.name || 'تحالف بلا اسم',
          description: data.description || '',
          emblem: data.emblem || '🏴‍☠️',
          leaderId: data.leaderId || '',
          leaderName: data.leaderName || 'قائد التحالف',
          level: typeof data.level === 'number' ? data.level : 1,
          power: typeof data.power === 'number' ? data.power : 0,
          donations: typeof data.donations === 'number' ? data.donations : 0,
          membersCount: typeof data.membersCount === 'number' ? data.membersCount : (data.members?.length || 1),
          members: Array.isArray(data.members) ? data.members : [],
          createdAt: data.createdAt || new Date().toISOString()
        });
      });
      // Sort in-memory by power descending
      list.sort((a, b) => (b.power || 0) - (a.power || 0));
      setTribes(list);
    }, (err) => {
      console.warn("Could not fetch tribes from Firestore:", err.message || err);
    });
    return () => unsubscribe();
  }, [isLoggedIn, currentUser]);

  // --- Live Players & Leaderboard Subscription ---
  useEffect(() => {
    if (!isLoggedIn || !currentUser) return;
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const playerList: any[] = [];

      snapshot.forEach((docSnap) => {
        if (!docSnap.exists()) return;
        const data = docSnap.data();
        const docUserId = data.userId || docSnap.id;
        const docEmail = (data.email || '').toLowerCase().trim();
        const rawUsername = (data.username || '').trim();
        const isPlaceholder = rawUsername === 'قبطان_البحار' || rawUsername === 'قبطان_الأعماق' || rawUsername === 'قبطان_مجهول';
        const docUsername = !isPlaceholder && rawUsername !== ''
          ? rawUsername
          : (docEmail ? docEmail.split('@')[0] : (data.displayName || 'لاعب'));

        playerList.push({
          id: docSnap.id,
          userId: docUserId,
          username: docUsername,
          email: docEmail,
          avatar: data.avatar || '⚓',
          gold: typeof data.gold === 'number' ? data.gold : 0,
          gems: typeof data.gems === 'number' ? data.gems : 0,
          redGems: typeof data.redGems === 'number' ? data.redGems : 0,
          exp: typeof data.exp === 'number' ? data.exp : 0,
          ships: data.ships || [],
          crew: data.crew || [],
          weapons: data.weapons || {},
          battleReports: data.battleReports || [],
          fishInventory: data.fishInventory || {},
          shipTowerLevel: typeof data.shipTowerLevel === 'number' ? data.shipTowerLevel : 1,
          fishStorageLevel: typeof data.fishStorageLevel === 'number' ? data.fishStorageLevel : 1,
          portDestroyed: !!data.portDestroyed,
          crewServices: data.crewServices || {},
          pirateClass: data.pirateClass || 'صياد البحار',
          server: data.server || 'سيرفر الأسطورة 1',
          tribeId: data.tribeId || '',
          tribeName: data.tribeName || '',
          friends: data.friends || [],
          friendRequests: data.friendRequests || [],
          updatedAt: data.updatedAt || new Date().toISOString()
        });
      });

      // Map deduplication by document UID so every active account in Firestore appears cleanly
      const uniquePlayersMap = new Map<string, any>();
      for (const p of playerList) {
        const key = p.userId || p.id;
        if (!uniquePlayersMap.has(key) || ((p.gold || 0) > (uniquePlayersMap.get(key)?.gold || 0))) {
          uniquePlayersMap.set(key, p);
        }
      }

      const deduplicatedList = Array.from(uniquePlayersMap.values());
      deduplicatedList.sort((a, b) => (b.gold || 0) - (a.gold || 0));

      setRealPlayers(deduplicatedList);
    }, (err) => {
      console.warn("Could not listen to user profiles for leaderboard:", err.message || err);
    });
    return () => unsubscribe();
  }, [isLoggedIn, currentUser]);

  // --- Live Firestore Global Notifications Listener ---
  useEffect(() => {
    if (!isLoggedIn || !currentUser) return;
    const mountTime = Date.now() - 4000;
    const qNotifs = query(
      collection(db, 'globalNotifications'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(qNotifs, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data() as GlobalNotification;
          const createdAtTime = new Date(data.createdAt).getTime();
          // Only pop toast if created within this active session window
          if (createdAtTime >= mountTime) {
            queueNotification({
              ...data,
              id: change.doc.id
            });
          }
        }
      });
    }, (err) => {
      console.warn("Error subscribing to globalNotifications:", err);
    });

    return () => unsubscribe();
  }, [isLoggedIn, currentUser]);

  // --- Automated Milestone Tracker for Player Level & Facility Upgrades ---
  const prevPlayerLevel = useRef<number>(playerLevel);
  const prevFishStorage = useRef<number>(fishStorageLevel);
  const prevShipTowerLevel = useRef<number>(shipTowerLevel);

  useEffect(() => {
    if (playerLevel > prevPlayerLevel.current && prevPlayerLevel.current > 0) {
      sendGlobalNotification(
        'MILESTONE',
        '⭐ ارتقاء رتبة القبطان!',
        `بلغ القبطان @${username} المستوى ${playerLevel} ونال تقدير أساطيل البحار!`,
        undefined,
        '🏆'
      );
    }
    prevPlayerLevel.current = playerLevel;
  }, [playerLevel, username]);

  useEffect(() => {
    if (fishStorageLevel > prevFishStorage.current && prevFishStorage.current > 0) {
      sendGlobalNotification(
        'MILESTONE',
        '🐟 توسعة ميناء الصيد!',
        `قام القبطان @${username} بترقية بيت السمك إلى المستوى ${fishStorageLevel}!`,
        undefined,
        '🏛️'
      );
    }
    prevFishStorage.current = fishStorageLevel;
  }, [fishStorageLevel, username]);

  useEffect(() => {
    if (shipTowerLevel > prevShipTowerLevel.current && prevShipTowerLevel.current > 0) {
      sendGlobalNotification(
        'MILESTONE',
        '🏰 ترقية صرح الأسطول!',
        `قام القبطان @${username} بترقية برج السفن إلى المستوى ${shipTowerLevel}!`,
        undefined,
        '⚓'
      );
    }
    prevShipTowerLevel.current = shipTowerLevel;
  }, [shipTowerLevel, username]);

  // --- Live Firestore Harbor Events & Defender Defense Engine ---
  useEffect(() => {
    if (!isLoggedIn || !currentUser) return;

    const qEvents = query(
      collection(db, 'harborEvents'),
      where('defenderId', '==', currentUser.uid),
      where('status', '==', 'PENDING')
    );

    const unsubscribe = onSnapshot(qEvents, async (snapshot) => {
      for (const change of snapshot.docChanges()) {
        if (change.type === 'added') {
          const evDoc = change.doc;
          const ev = evDoc.data();
          const evId = evDoc.id;

          try {
            const userDocRef = doc(db, 'users', currentUser.uid);

            if (ev.type === 'ROCKET_SMALL' || ev.type === 'ROCKET_MEDIUM' || ev.type === 'ROCKET_LARGE' || ev.type === 'ATOMIC_BOMB' || ev.type === 'AD_BOMB') {
              const damage = ev.payload?.damage || (ev.type === 'ATOMIC_BOMB' ? 999999 : 800);
              const targetShipId = ev.payload?.targetShipId;
              const attackerName = ev.attackerName || 'قبطان معادٍ';

              setShips(prevShips => {
                const updated = prevShips.map(s => {
                  if (!targetShipId || s.id === targetShipId || ev.type === 'ATOMIC_BOMB' || ev.type === 'AD_BOMB') {
                    const maxH = s.maxHeart || ((s.level || 1) * 1000) + 10000;
                    const curH = typeof s.heart === 'number' ? s.heart : maxH;
                    const newH = Math.max(0, curH - damage);
                    return { ...s, heart: newH, ...(newH <= 0 ? { moving: false, status: 'docked' as const } : {}) };
                  }
                  return s;
                });
                const isAllDestroyed = updated.length > 0 && updated.every(s => typeof s.heart === 'number' && s.heart <= 0);
                if (isAllDestroyed || ev.type === 'ATOMIC_BOMB' || ev.type === 'AD_BOMB') {
                  setPortDestroyed(true);
                }

                const newReport = ev.payload?.newReport || {
                  id: `report_${Date.now()}`,
                  opponent: attackerName,
                  opponentAvatar: ev.attackerAvatar || '☠️',
                  type: 'defense',
                  result: 'defeat',
                  goldChange: 0,
                  date: new Date().toISOString(),
                  title: '🚨 هجوم معادٍ على مينائك!',
                  log: [`قام القبطان @${attackerName} بمهاجمة أسطولك ومينائك!`]
                };

                setBattleReports(prev => [newReport, ...prev.slice(0, 19)]);

                updateDoc(userDocRef, {
                  ships: updated,
                  portDestroyed: isAllDestroyed || ev.type === 'ATOMIC_BOMB' || ev.type === 'AD_BOMB',
                  ...(ev.payload?.adKey ? { activeAd: ev.payload.adKey } : {}),
                  battleReports: [newReport, ...battleReports.slice(0, 19)],
                  updatedAt: new Date().toISOString()
                }).catch(console.error);

                return updated;
              });

              queueNotification({
                id: 'hb_' + evId,
                type: 'ATTACK',
                title: '🚨 هجوم معادٍ مباشر!',
                message: `تعرض ميناؤك لقصف مباشر من القبطان @${attackerName}!`,
                icon: '💥',
                createdAt: new Date().toISOString()
              });
              showToast(`🚨 قصف معادٍ! هاجم القبطان @${attackerName} ميناءك وسفنك!`, 'error');

              if (ev.type === 'AD_BOMB') {
                playMediaBombExplosionSound();
                setTimeout(() => {
                  playDetonationWarningVoiceAndSound();
                }, 1800);
              }
            } else if (ev.type === 'STEAL') {
              const stolenAmount = ev.payload?.amount || 0;
              const attackerName = ev.attackerName || 'لص';
              setGold(prev => {
                const newGold = Math.max(0, prev - stolenAmount);
                updateDoc(userDocRef, { gold: newGold, updatedAt: new Date().toISOString() }).catch(console.error);
                return newGold;
              });
              queueNotification({
                id: 'hb_' + evId,
                type: 'ATTACK',
                title: '🏴‍☠️ تسلل ولصوص!',
                message: `تسلل القبطان @${attackerName} وسرق 🪙 ${stolenAmount.toLocaleString()} ذهبة من مينائك!`,
                icon: '🥷',
                createdAt: new Date().toISOString()
              });
              showToast(`🏴‍☠️ تسلل ولصوص! تسلل القبطان @${attackerName} وسرق 🪙 ${stolenAmount.toLocaleString()} ذهبة من مينائك!`, 'error');
            } else if (ev.type === 'REPAIR') {
              const healAmount = ev.payload?.healAmount || 500;
              const helperName = ev.attackerName || 'صديق';
              setShips(prevShips => {
                const updated = prevShips.map(s => {
                  const maxH = s.maxHeart || ((s.level || 1) * 1000) + 10000;
                  const curH = typeof s.heart === 'number' ? s.heart : maxH;
                  const newH = Math.min(maxH, curH + healAmount);
                  return { ...s, heart: newH };
                });
                updateDoc(userDocRef, { ships: updated, updatedAt: new Date().toISOString() }).catch(console.error);
                return updated;
              });
              queueNotification({
                id: 'hb_' + evId,
                type: 'SUPPORT',
                title: '🛡️ دعم وصيانة حليفة!',
                message: `أرسل القبطان الشهم @${helperName} طاقم صيانة وقام بترميم سفنك! ✨`,
                icon: '🔧',
                createdAt: new Date().toISOString()
              });
              showToast(`🤝 صيانة صديقة! قام القبطان @${helperName} بإصلاح وترميم سفنك! ✨`, 'success');
            } else if (ev.type === 'DONATION' || ev.type === 'GIFT') {
              const giftAmount = ev.payload?.amount || 500;
              const senderName = ev.attackerName || ev.payload?.senderName || 'صديق';
              setGold(prev => {
                const newGold = prev + giftAmount;
                updateDoc(userDocRef, { gold: newGold, updatedAt: new Date().toISOString() }).catch(console.error);
                return newGold;
              });
              queueNotification({
                id: 'hb_' + evId,
                type: 'SUPPORT',
                title: '🎁 وصول دعم مالي!',
                message: `أرسل لك القبطان @${senderName} هدية مالية بقيمة 🪙 ${giftAmount.toLocaleString()} ذهبة! 🎉`,
                icon: '🤝',
                createdAt: new Date().toISOString()
              });
              showToast(`🎁 هدية ذهب! أرسل لك القبطان @${senderName} مبلغ 🪙 ${giftAmount.toLocaleString()} ذهبة! 🎉`, 'success');
            } else if (ev.type === 'LOOT') {
              const lootType = ev.payload?.lootType || 'gold';
              const lootAmt = ev.payload?.amount || 1000;
              if (lootType === 'gold') {
                setGold(prev => {
                  const newGold = Math.max(0, prev - lootAmt);
                  updateDoc(userDocRef, { gold: newGold, updatedAt: new Date().toISOString() }).catch(console.error);
                  return newGold;
                });
              } else if (lootType === 'gems') {
                setGems(prev => {
                  const newGems = Math.max(0, prev - lootAmt);
                  updateDoc(userDocRef, { gems: newGems, updatedAt: new Date().toISOString() }).catch(console.error);
                  return newGems;
                });
              } else if (lootType === 'redGems') {
                setRedGems(prev => {
                  const newRedGems = Math.max(0, prev - lootAmt);
                  updateDoc(userDocRef, { redGems: newRedGems, updatedAt: new Date().toISOString() }).catch(console.error);
                  return newRedGems;
                });
              }
            }

            // Mark event as PROCESSED in /harborEvents
            await updateDoc(doc(db, 'harborEvents', evId), { status: 'PROCESSED' });
          } catch (procErr) {
            console.error("Error processing harbor event:", procErr);
          }
        }
      }
    }, (err) => {
      console.warn("Could not subscribe to harborEvents:", err.message || err);
    });

    return () => unsubscribe();
  }, [isLoggedIn, currentUser, battleReports]);

  // --- Live Firestore Friend Requests Subscription ---
  useEffect(() => {
    if (!isLoggedIn || !currentUser) return;

    // 1. Listen to incoming pending requests
    const qIncoming = query(
      collection(db, 'friendRequests'),
      where('receiverId', '==', currentUser.uid),
      where('status', '==', 'PENDING')
    );

    const unsubIncoming = onSnapshot(qIncoming, (snap) => {
      const list: any[] = [];
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data() });
      });
      setFriendRequests(list);
    }, (err) => {
      console.warn("Could not subscribe to incoming friend requests:", err.message || err);
    });

    // 2. Listen to outgoing requests accepted by target players
    const qAccepted = query(
      collection(db, 'friendRequests'),
      where('senderId', '==', currentUser.uid),
      where('status', '==', 'ACCEPTED')
    );

    const unsubAccepted = onSnapshot(qAccepted, async (snap) => {
      for (const d of snap.docs) {
        const data = d.data();
        const newFriendId = data.receiverId;
        if (newFriendId && !friends.includes(newFriendId)) {
          const updated = Array.from(new Set([...friends, newFriendId]));
          setFriends(updated);
          try {
            await updateDoc(doc(db, 'users', currentUser.uid), { friends: updated });
          } catch (e) {
            console.warn("Could not update accepted friends locally:", e);
          }
        }
        // Remove processed accepted request
        deleteDoc(doc(db, 'friendRequests', d.id)).catch(() => {});
      }
    }, (err) => {
      console.warn("Could not subscribe to accepted friend requests:", err.message || err);
    });

    return () => {
      unsubIncoming();
      unsubAccepted();
    };
  }, [isLoggedIn, currentUser, friends]);

  // --- Synchronize Inspected Player State in Real-Time ---
  useEffect(() => {
    if (inspectedPlayer) {
      const updated = realPlayers.find(p => p.userId === inspectedPlayer.userId);
      if (updated) {
        setInspectedPlayer(updated);
        
        // Update selected visited ship details if open
        if (selectedVisitedShip) {
          const updatedShip = updated.ships?.find((s: any) => s.id === selectedVisitedShip.id);
          if (updatedShip) {
            setSelectedVisitedShip(updatedShip);
          }
        }
      }
    }
  }, [realPlayers, inspectedPlayer?.userId, selectedVisitedShip?.id]);

  // --- Handle Login ---
  const handleLoginSuccess = async (user: string, av: string, serv: string, pCl: string) => {
    isSessionTerminated.current = false;
    setSessionTerminationNotice(null);
    setUsername(user);
    setAvatar(av);
    setServer(serv);
    setPirateClass(pCl);
    setIsLoggedIn(true);

    if (auth.currentUser) {
      await registerNewUserSession(auth.currentUser.uid);
    }
  };

  // --- Handle Logout ---
  const handleLogout = async () => {
    setActiveSettingsModal(null);
    setActiveTab('harbor');
    clearLocalSessionId();
    isSessionTerminated.current = false;
    setSessionTerminationNotice(null);
    
    isDeletingAccount.current = true;
    isLoadedFromFirebase.current = false;

    // Cancel any pending auto-save timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    if (unsubUserSnapshot.current) {
      unsubUserSnapshot.current();
      unsubUserSnapshot.current = null;
    }

    const user = auth.currentUser;
    const token = localStorage.getItem('google_auth_token') || '';
    const cleanEmail = (user?.email || localStorage.getItem('google_auth_email') || '').toLowerCase().trim();

    // 1. Ensure latest player progress is securely preserved in Firestore database
    if (user) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const currentData = {
          userId: user.uid,
          username,
          email: cleanEmail,
          avatar,
          server,
          pirateClass,
          gold,
          gems,
          exp,
          redGems,
          fishStorageLevel,
          shipTowerLevel,
          ships,
          crew,
          quests,
          battleReports,
          fishInventory,
          weapons,
          crewServices,
          portDestroyed,
          friends,
          friendRequests,
          tribeId,
          tribeName,
          isOnline: false,
          lastActive: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(userDocRef, currentData, { merge: true });
      } catch (saveErr) {
        console.warn("Error saving snapshot before logout:", saveErr);
      }
    }

    // 2. Send API request to server to terminate current session
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          userId: user?.uid,
          email: cleanEmail,
          token
        })
      });
    } catch (apiErr) {
      console.warn("Logout API call error:", apiErr);
    }

    // 3. Clear user tokens and session keys from localStorage
    localStorage.setItem('pirate_is_logged_in', 'false');
    localStorage.removeItem('google_auth_token');
    localStorage.removeItem('google_auth_email');
    localStorage.removeItem('google_auth_name');
    localStorage.removeItem('google_auth_avatar');

    // 4. Reset React states to defaults
    resetStateToDefaults();

    // 5. Sign out from Firebase Auth
    try {
      await auth.signOut();
    } catch (err) {
      console.error("Error signing out from Firebase:", err);
    }

    setIsLoggedIn(false);
    setAuthScreen('login');
    isDeletingAccount.current = false;

    showToast('✅ تم تسجيل الخروج بنجاح. تم حفظ كافة بيانات حسابك وتقدمك في السيرفر ويمكنك استرجاعها من أي جهاز.', 'success');
  };

  // --- Permanent Account Deletion ---
  const handleDeleteAccountPermanently = async () => {
    const user = auth.currentUser;
    const storedEmail = localStorage.getItem('google_auth_email') || '';
    const token = localStorage.getItem('google_auth_token') || '';

    if (!user && !storedEmail) {
      showToast('⚠️ لا يوجد حساب متصل لحذفه.', 'error');
      return;
    }

    try {
      isDeletingAccount.current = true;
      isLoadedFromFirebase.current = false;

      // Cancel any pending auto-save immediately
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }

      if (unsubUserSnapshot.current) {
        unsubUserSnapshot.current();
        unsubUserSnapshot.current = null;
      }

      const uid = user ? user.uid : '';
      const cleanEmail = (user?.email || storedEmail || '').toLowerCase().trim();

      // 1. Send API request to server to execute/log permanent deletion
      try {
        await fetch('/api/auth/delete-account', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            userId: uid,
            email: cleanEmail,
            token
          })
        });
      } catch (apiDelErr) {
        console.warn("Delete account server API error:", apiDelErr);
      }

      // 2. Clean up user from tribe if member or leader
      if (tribeId) {
        try {
          const tribeDocRef = doc(db, 'tribes', tribeId);
          const tribeSnap = await getDoc(tribeDocRef);
          if (tribeSnap.exists()) {
            const tData = tribeSnap.data();
            const updatedMembers = (tData.members || []).filter((m: any) => m !== uid && (typeof m === 'string' ? m !== uid : m.userId !== uid && m.id !== uid));
            if (updatedMembers.length === 0) {
              await deleteDoc(tribeDocRef).catch(() => {});
            } else {
              await setDoc(tribeDocRef, {
                members: updatedMembers,
                membersCount: updatedMembers.length
              }, { merge: true }).catch(() => {});
            }
          }
        } catch (tErr) {
          console.error("Error removing user from tribe on deletion:", tErr);
        }
      }

      // 3. Delete user document from Firestore (keyed by UID)
      if (uid) {
        try {
          await deleteDoc(doc(db, 'users', uid));
        } catch (delErr) {
          console.error("Error deleting user doc by UID:", delErr);
        }
      }

      // 4. Remove user from all other players' friends and friendRequests, and delete any residual documents
      try {
        const allUsersSnap = await getDocs(collection(db, 'users'));
        for (const d of allUsersSnap.docs) {
          const data = d.data();
          const dEmail = (data.email || '').toLowerCase().trim();
          const docUserId = data.userId || d.id;

          // Delete residual user document if it belongs to this player
          if (docUserId === uid || d.id === uid || (cleanEmail && dEmail && dEmail === cleanEmail)) {
            await deleteDoc(doc(db, 'users', d.id)).catch(() => {});
          }
        }
      } catch (scanErr) {
        console.error("Error scanning and cleaning up friends/residual documents:", scanErr);
      }

      // 5. Update leaderboard UI and friends lists immediately
      setRealPlayers(prev => prev.filter(p => p.id !== uid && p.userId !== uid && (!cleanEmail || p.email !== cleanEmail)));
      setFriends([]);
      setFriendRequests([]);

      // 6. Clear all storage keys completely
      localStorage.setItem('pirate_is_logged_in', 'false');
      localStorage.removeItem('google_auth_token');
      localStorage.removeItem('google_auth_email');
      localStorage.removeItem('google_auth_name');
      localStorage.removeItem('google_auth_avatar');

      // 7. Reset React states completely
      resetStateToDefaults();

      // 8. Delete Firebase Auth User & Sign Out
      if (user) {
        try {
          await user.delete();
        } catch (authDelErr) {
          console.warn("Firebase auth delete fallback to signOut:", authDelErr);
          await auth.signOut();
        }
      } else {
        await auth.signOut().catch(() => {});
      }

      setIsLoggedIn(false);
      setAuthScreen('login');
      setActiveSettingsModal(null);

      showToast('✅ تم حذف الحساب نهائياً وإزالته من الترتيب العام وقوائم الأصدقاء وقاعدة البيانات.', 'success');
    } catch (err: any) {
      console.error("Error deleting account permanently:", err);
      showToast('❌ حدث خطأ أثناء حذف الحساب: ' + (err.message || 'حاول مجدداً'), 'error');
    } finally {
      setTimeout(() => {
        isDeletingAccount.current = false;
      }, 3000);
    }
  };

  // --- Open Action Menu for ship ---
  const showMenu = (event: React.MouseEvent, ship: ShipState) => {
    event.stopPropagation();
    setCurrentShipId(ship.id);

    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const shipCenterX = rect.left + rect.width / 2;

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const isMobile = false; // Always use desktop mode layout (وضع مصمم الكمبيوتر)

    // Accurate calculation of menu width based on active ship buttons
    const activeShip = ships.find(s => s.id === ship.id);
    const hasGH = activeShip?.assignedCrew?.some(c => c === 'golden_hunter' || c === 'gold_fisher');
    const buttonCount = hasGH ? 4 : 3;
    const estimatedWidth = isMobile ? (buttonCount * 65 + 24) : (buttonCount * 80 + 36);
    const estimatedHeight = isMobile ? 82 : 94;
    const safeMargin = 12;

    // Center horizontally over ship, safely clamped inside viewport
    let x = shipCenterX - estimatedWidth / 2;
    if (x + estimatedWidth > screenW - safeMargin) {
      x = screenW - estimatedWidth - safeMargin;
    }
    if (x < safeMargin) {
      x = safeMargin;
    }

    // Place vertically: preferentially above the ship, but if too close to top bar, place below
    let y = rect.top - estimatedHeight - 14;
    if (y < 75) {
      y = rect.bottom + 14;
    }
    if (y + estimatedHeight > screenH - 115) {
      y = Math.max(75, screenH - 115 - estimatedHeight);
    }

    setMenu({
      visible: true,
      x: Math.round(x),
      y: Math.round(y),
      shipId: ship.id,
      status: ship.status
    });
  };

  // --- Helper to calculate catch rewards for a single ship ---
  const calculateShipCatch = useCallback((selectedShip: ShipState) => {
    const shipCrew = selectedShip.assignedCrew || [];
    const isNetUpgraded = selectedShip.hasNetUpgrade;
    const crewPowerBonus = selectedShip.crewPower || 0;
    const isLuckActive = shipCrew.includes('luck');
    const isGuidedActive = shipCrew.includes('guide');

    const capacityLvl = selectedShip.capacityLevel || 1;
    const capacityMultiplier = 1 + (capacityLvl - 1) * 0.15;
    const cargo = Math.floor((selectedShip.cargo || 80) * capacityMultiplier);
    const shipFishTypes = selectedShip.fishTypes && selectedShip.fishTypes.length > 0 
      ? selectedShip.fishTypes 
      : ['السردين'];

    // 🧭 مرشد السفينة: يركز الصيد على أفضل نوع سمك تصطاده السفينة
    const randomFishName = isGuidedActive 
      ? shipFishTypes[shipFishTypes.length - 1] 
      : shipFishTypes[Math.floor(Math.random() * shipFishTypes.length)];
    
    const fishInfo = FISH_REWARD_DATA[randomFishName] || { 
      fullName: `${randomFishName} 🐟`, 
      valPerFish: 1,
      emoji: '🐟'
    };

    const baseAmount = Math.max(20, Math.floor(cargo * (0.25 + Math.random() * 0.35)));
    let totalAmount = (isNetUpgraded ? baseAmount * 2 : baseAmount) + crewPowerBonus;
    if (pirateClass === 'صياد البحار') {
      totalAmount = Math.floor(totalAmount * 1.15);
    }

    // 🍀 الحظ السعيد: مضاعفة صيد السفينة 2x بنسبة 100%
    if (isLuckActive) {
      totalAmount = totalAmount * 2;
    }

    let expReward = Math.floor(5 + Math.random() * 5);
    if (isGuidedActive) {
      expReward = expReward * 2;
    }

    return {
      fishInfo,
      totalAmount,
      expReward,
      isLuckActive,
      isGuidedActive
    };
  }, [pirateClass]);

  // --- Dedicated Single-Ship Action Handlers (supports manual & autonomous Golden Hunter) ---
  const startShipFishing = (targetShipId: string, isAuto = false) => {
    if (!targetShipId) return;

    const selectedShip = ships.find(s => s.id === targetShipId);
    if (selectedShip && (portDestroyed || (typeof selectedShip.heart === 'number' && selectedShip.heart <= 0))) {
      showToast('⚠️ هذه السفينة مدمّرة بنيران المعارك! يرجى صيانتها وإصلاح هيكلها لتتمكن من الإبحار.', 'error');
      setRepairModalShip(selectedShip);
      return;
    }

    updateQuestProgress('q1', 1);

    const shipCrew = selectedShip?.assignedCrew || [];
    const isAutoActive = isAuto || (!selectedShip?.autoFishingPaused && (shipCrew.includes('golden_hunter') || shipCrew.includes('gold_fisher')));

    const isEngineUpgraded = selectedShip?.hasEngineUpgrade;
    const speedLvl = selectedShip?.speedLevel || 1;
    const speedMultiplier = 1 + (speedLvl - 1) * 0.08;
    const isSailorActive = shipCrew.includes('sailor') || shipCrew.includes('sailors');

    // Calculate sail-out duration: normally 1.8s (1800ms)
    // When auto-fishing is active, sail smoothly with balanced speed (reduced by 60%)
    let sailOutDuration = isAutoActive ? (isEngineUpgraded ? 1300 : 1950) : (isEngineUpgraded ? 900 : 1800);
    sailOutDuration = Math.max(700, Math.floor(sailOutDuration / speedMultiplier));
    if (isSailorActive) {
      sailOutDuration = Math.floor(sailOutDuration * 0.5);
    }

    setShips(prev =>
      prev.map(s => {
        if (s.id === targetShipId) {
          return {
            ...s,
            scaleX: 1,
            moving: true,
            lastMoveTime: Date.now(),
            status: 'fishing',
            left: fishSpots[s.id]?.l || '80%',
            top: fishSpots[s.id]?.t || '41%',
            transitionDuration: `${sailOutDuration}ms`
          };
        }
        return s;
      })
    );

    // Settle ship at fishing spot once sailing movement completes
    setTimeout(() => {
      setShips(prev =>
        prev.map(s => {
          if (s.id === targetShipId && s.status === 'fishing') {
            return {
              ...s,
              moving: false,
              lastMoveTime: 0
            };
          }
          return s;
        })
      );
    }, sailOutDuration);
  };

  const collectShipFish = (targetShipId: string, isAuto = false) => {
    if (!targetShipId) return;
    const selectedShip = ships.find(s => s.id === targetShipId);
    if (!selectedShip) return;

    const isEngineUpgraded = selectedShip.hasEngineUpgrade;
    const isNetUpgraded = selectedShip.hasNetUpgrade;
    const crewPowerBonus = selectedShip.crewPower || 0;
    const shipCrew = selectedShip.assignedCrew || [];
    const isAutoActive = isAuto || (!selectedShip.autoFishingPaused && (shipCrew.includes('golden_hunter') || shipCrew.includes('gold_fisher')));

    const flipDuration = isAutoActive ? 550 : 500;

    // Start the return action: Flip direction facing left
    setShips(prev =>
      prev.map(s => {
        if (s.id === targetShipId) {
          return {
            ...s,
            moving: true,
            lastMoveTime: Date.now(),
            scaleX: -1,
            transitionDuration: `${flipDuration}ms`
          };
        }
        return s;
      })
    );

    let returnTripDuration = isAutoActive ? (isEngineUpgraded ? 1300 : 1950) : (isEngineUpgraded ? 800 : 1800);
    const speedLvl = selectedShip.speedLevel || 1;
    const speedMultiplier = 1 + (speedLvl - 1) * 0.08;
    returnTripDuration = Math.max(700, Math.floor(returnTripDuration / speedMultiplier));

    const isSailorActive = shipCrew.includes('sailor') || shipCrew.includes('sailors');
    const isLuckActive = shipCrew.includes('luck');
    const isGuidedActive = shipCrew.includes('guide');

    // ⚓ البحار: يسرع صيد السفينة ويقلص مدة رحلة العودة والصيد بنسبة 50%
    if (isSailorActive) {
      returnTripDuration = Math.floor(returnTripDuration * 0.5);
    }

    // After flip animation finished, start physical sailing glide to the dock coordinates
    setTimeout(() => {
      setShips(prev =>
        prev.map(s => {
          if (s.id === targetShipId) {
            return {
              ...s,
              moving: true,
              lastMoveTime: Date.now(),
              left: docks[s.id]?.l || '44%',
              top: docks[s.id]?.t || '41%',
              transitionDuration: `${returnTripDuration}ms`
            };
          }
          return s;
        })
      );

      // After the sailing trip finishes, settle the ship at dock, face right, and stop moving
      setTimeout(() => {
        // Trigger water splash and gold particles at dock coordinates
        const dockPos = docks[targetShipId] || { l: '45%', t: '48%' };
        const sx = parseFloat(dockPos.l) || 45;
        const sy = parseFloat(dockPos.t) || 48;
        
        window.dispatchEvent(new CustomEvent('spawn-pirate-particles', {
          detail: { x: sx, y: sy, type: 'water-splash', count: 15 }
        }));
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('spawn-pirate-particles', {
            detail: { x: sx, y: sy, type: 'gold-gain', count: 12 }
          }));
        }, isAutoActive ? 700 : 300);

        setShips(prev =>
          prev.map(s => {
            if (s.id === targetShipId) {
              return {
                ...s,
                scaleX: 1,
                status: 'docked',
                moving: false,
                lastMoveTime: 0,
                transitionDuration: isAutoActive ? '1.75s' : '1.8s'
              };
            }
            return s;
          })
        );

        const catchData = calculateShipCatch(selectedShip);
        const fishInfo = catchData.fishInfo;
        const totalAmount = catchData.totalAmount;
        const expReward = catchData.expReward;
        const isLuckActive = catchData.isLuckActive;
        const isGuidedActive = catchData.isGuidedActive;

        // Add all caught fish directly to fish inventory without any automatic selling
        if (totalAmount > 0) {
          setFishInventory(prev => {
            const nextInv = {
              ...prev,
              [fishInfo.fullName]: ((prev[fishInfo.fullName] as number) || 0) + (totalAmount as number)
            };
            localStorage.setItem('pirate_fish_inventory', JSON.stringify(nextInv));
            return nextInv;
          });
        }

        setExp(prev => prev + expReward);

        if (!isAuto) {
          setRewardFish({
            name: fishInfo.fullName,
            amount: totalAmount,
            value: 0,
            luckDoubled: isLuckActive,
            guided: isGuidedActive,
          });
          setRewardModal(true);
        }
      }, returnTripDuration);
    }, flipDuration);
  };

  // --- Offline Auto-Fishing & Gathering Progress Catch-Up Engine ---
  const processOfflineAutoHarvest = useCallback(() => {
    const lastActiveStr = localStorage.getItem('pirate_last_active_time');
    const now = Date.now();
    localStorage.setItem('pirate_last_active_time', String(now));

    if (!lastActiveStr) return;
    const lastActive = Number(lastActiveStr);
    if (!lastActive || isNaN(lastActive)) return;

    const elapsedSeconds = Math.floor((now - lastActive) / 1000);
    // If less than 4 seconds elapsed, normal online loop handles it
    if (elapsedSeconds < 4) return;

    const cappedSeconds = Math.min(86400, elapsedSeconds); // Process up to 24 hours of offline activity

    const autoShips = ships.filter(s =>
      s.exists &&
      !s.autoFishingPaused &&
      (s.assignedCrew?.includes('golden_hunter') || s.assignedCrew?.includes('gold_fisher'))
    );

    if (autoShips.length === 0) return;

    // Auto-fishing takes ~6.2 seconds per complete synchronized trip (sail out, collect, return, dock - reduced speed by 60%)
    const cyclesPerShip = Math.floor(cappedSeconds / 6.2);
    if (cyclesPerShip <= 0) return;

    let totalGainedGold = 0;
    let totalGainedExp = 0;
    let totalFittingFish = 0;
    const inventoryUpdates: Record<string, number> = {};

    let currentTotal = getTotalFish();
    const maxCapacity = getFishHouseCapacity(fishStorageLevel);

    autoShips.forEach(ship => {
      const shipCrew = ship.assignedCrew || [];
      const isLuckActive = shipCrew.includes('luck');
      const isSailorActive = shipCrew.includes('sailor') || shipCrew.includes('sailors');
      const isGuidedActive = shipCrew.includes('guide');
      const isEngineUpgraded = ship.hasEngineUpgrade;
      const isNetUpgraded = ship.hasNetUpgrade;
      const crewPowerBonus = ship.crewPower || 0;

      const capacityLvl = ship.capacityLevel || 1;
      const capacityMultiplier = 1 + (capacityLvl - 1) * 0.15;
      const cargo = Math.floor((ship.cargo || 80) * capacityMultiplier);
      const shipFishTypes = ship.fishTypes && ship.fishTypes.length > 0
        ? ship.fishTypes
        : ['السردين'];

      const randomFishName = isGuidedActive
        ? shipFishTypes[shipFishTypes.length - 1]
        : shipFishTypes[0];

      const fishInfo = FISH_REWARD_DATA[randomFishName] || {
        fullName: `${randomFishName} 🐟`,
        valPerFish: 1,
        emoji: '🐟'
      };

      const baseAmount = Math.max(20, Math.floor(cargo * 0.35));
      let singleCatchAmount = (isNetUpgraded ? baseAmount * 2 : baseAmount) + crewPowerBonus;
      if (pirateClass === 'صياد البحار') {
        singleCatchAmount = Math.floor(singleCatchAmount * 1.15);
      }
      if (isLuckActive) {
        singleCatchAmount = singleCatchAmount * 2;
      }

      let storageMultiplier = 1 + (fishStorageLevel - 1) * 0.1;
      if (isLuckActive) storageMultiplier += 0.20;
      if (isSailorActive) storageMultiplier += 0.15;

      const totalShipFish = singleCatchAmount * cyclesPerShip;

      if (totalShipFish > 0) {
        totalFittingFish += totalShipFish;
        inventoryUpdates[fishInfo.fullName] = (inventoryUpdates[fishInfo.fullName] || 0) + totalShipFish;
      }

      const expPerCatch = isGuidedActive ? 14 : 7;
      totalGainedExp += expPerCatch * cyclesPerShip;
    });

    if (Object.keys(inventoryUpdates).length > 0) {
      setFishInventory(prev => {
        const nextInv = { ...prev };
        Object.entries(inventoryUpdates).forEach(([name, count]) => {
          nextInv[name] = (nextInv[name] || 0) + count;
        });
        localStorage.setItem('pirate_fish_inventory', JSON.stringify(nextInv));
        return nextInv;
      });
    }

    if (totalGainedExp > 0) {
      setExp(prev => {
        const nextExp = prev + totalGainedExp;
        localStorage.setItem('pirate_exp', String(nextExp));
        return nextExp;
      });
    }

    if (totalFittingFish > 0) {
      const awayMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
      const msg = `🔱 مرحباً بعودتك أيها القبطان! واصل أسطولك الصيد التلقائي أثناء غيابك (${awayMinutes} دقيقة) وتم جمع 🐟 +${totalFittingFish.toLocaleString()} سمكة وحفظها في بيت السمك لبيعها لاحقاً! ✨`;
      showToast(msg, 'success');
    }
  }, [ships, fishStorageLevel, pirateClass, getTotalFish, showToast]);

  // Trigger offline progress on initial load
  const hasProcessedOfflineRef = useRef(false);
  useEffect(() => {
    if (!hasProcessedOfflineRef.current && ships.length > 0) {
      hasProcessedOfflineRef.current = true;
      processOfflineAutoHarvest();
    }
  }, [ships, processOfflineAutoHarvest]);

  // Catch up and unfreeze ships when switching tabs or reopening window
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        processOfflineAutoHarvest();
        // Unfreeze any ship that got throttled while tab was in background
        setShips(prev => prev.map(s => ({ ...s, moving: false, lastMoveTime: 0 })));
      } else {
        localStorage.setItem('pirate_last_active_time', String(Date.now()));
      }
    };

    const handleBeforeUnload = () => {
      localStorage.setItem('pirate_last_active_time', String(Date.now()));
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [processOfflineAutoHarvest]);

  // --- Synchronized Global Fleet Autonomous Fishing & Collecting Engine ---
  // بدلاً من حساب التقدم (progress) لكل سفينة بشكل منفصل بناءً على وقت انطلاقها المحلي،
  // يتم توحيد حساب التقدم بحيث تعتمد جميع السفن على نفس النسبة المئوية أو التوقيت العام:
  // const globalProgress = (currentTime - startTimestamp) / totalDuration;
  // وتتطابق نسبة تقدم كل سفينة تماماً مع القيمة العامة لضمان التزامن الكامل بين جميع السفن.

  const FLEET_SAIL_OUT_MS = 1950;
  const FLEET_FLIP_MS = 550;
  const FLEET_RETURN_MS = 1950;
  const FLEET_DOCK_PAUSE_MS = 1750;

  const shipsRef = useRef(ships);
  useEffect(() => {
    shipsRef.current = ships;
  }, [ships]);

  const portDestroyedRef = useRef(portDestroyed);
  useEffect(() => {
    portDestroyedRef.current = portDestroyed;
  }, [portDestroyed]);

  const fleetCycleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const runSynchronizedFleetCycle = () => {
      if (isCancelled) return;

      // Identify all eligible autonomous ships with Golden Hunter
      const activeAutoShips = shipsRef.current.filter(s =>
        s.exists &&
        !s.autoFishingPaused &&
        (!portDestroyedRef.current && (typeof s.heart !== 'number' || s.heart > 0)) &&
        (s.assignedCrew?.includes('golden_hunter') || s.assignedCrew?.includes('gold_fisher'))
      );

      if (activeAutoShips.length === 0) {
        fleetCycleTimeoutRef.current = setTimeout(runSynchronizedFleetCycle, 400);
        return;
      }

      const activeIds = activeAutoShips.map(s => s.id);

      // Verify that all active ships are at dock and idle. If any was left moving or fishing from a past state, align all to dock first!
      const anyMisaligned = activeAutoShips.some(s => s.status !== 'docked' || s.moving);
      if (anyMisaligned) {
        setShips(prev =>
          prev.map(s => {
            if (activeIds.includes(s.id)) {
              return {
                ...s,
                status: 'docked',
                moving: false,
                lastMoveTime: 0,
                scaleX: 1,
                progress: 0,
                left: docks[s.id]?.l || '45%',
                top: docks[s.id]?.t || '41%',
                transitionDuration: '0.2s'
              };
            }
            return s;
          })
        );
        fleetCycleTimeoutRef.current = setTimeout(runSynchronizedFleetCycle, 260);
        return;
      }

      const currentTime = Date.now();
      const startTimestamp = currentTime;
      const totalDuration = FLEET_SAIL_OUT_MS;

      // Record heartbeat for offline catch-up
      localStorage.setItem('pirate_last_active_time', String(currentTime));

      // حساب التقدم الموحد لجميع السفن معاً:
      const globalProgress = (currentTime - startTimestamp) / totalDuration;

      updateQuestProgress('q1', activeIds.length);

      // 1. Unified Sail Out: All ships embark simultaneously with identical timing & progress
      setShips(prev =>
        prev.map(s => {
          if (activeIds.includes(s.id)) {
            return {
              ...s,
              scaleX: 1,
              moving: true,
              lastMoveTime: startTimestamp,
              status: 'fishing',
              // تطابق نسبة تقدم كل سفينة مع القيمة العامة لضمان التزامن
              progress: Math.min(1, globalProgress),
              left: fishSpots[s.id]?.l || '70%',
              top: fishSpots[s.id]?.t || '41%',
              transitionDuration: `${FLEET_SAIL_OUT_MS}ms`
            };
          }
          return s;
        })
      );

      // 2. Synchronized Fishing Spot Arrival & Turn (الوصول والالتفاف المتزامن لجميع السفن)
      fleetCycleTimeoutRef.current = setTimeout(() => {
        if (isCancelled) return;
        const flipStart = Date.now();

        setShips(prev =>
          prev.map(s => {
            if (activeIds.includes(s.id)) {
              return {
                ...s,
                scaleX: -1,
                moving: true,
                lastMoveTime: flipStart,
                progress: 1,
                transitionDuration: `${FLEET_FLIP_MS}ms`
              };
            }
            return s;
          })
        );

        // 3. Unified Sail Return (رحلة العودة المتزامنة لكافة سفن الأسطول)
        fleetCycleTimeoutRef.current = setTimeout(() => {
          if (isCancelled) return;
          const returnStart = Date.now();

          setShips(prev =>
            prev.map(s => {
              if (activeIds.includes(s.id)) {
                return {
                  ...s,
                  scaleX: -1,
                  moving: true,
                  lastMoveTime: returnStart,
                  left: docks[s.id]?.l || '45%',
                  top: docks[s.id]?.t || '41%',
                  transitionDuration: `${FLEET_RETURN_MS}ms`
                };
              }
              return s;
            })
          );

          // 4. Unified Dock & Collect All (الرسو وتفريغ وجمع الصيد لكل الأسطول معاً)
          fleetCycleTimeoutRef.current = setTimeout(() => {
            if (isCancelled) return;

            setShips(prev =>
              prev.map(s => {
                if (activeIds.includes(s.id)) {
                  return {
                    ...s,
                    scaleX: 1,
                    status: 'docked',
                    moving: false,
                    lastMoveTime: 0,
                    progress: 1,
                    transitionDuration: `${FLEET_DOCK_PAUSE_MS}ms`
                  };
                }
                return s;
              })
            );

            // Collect catch for all active ships in a single batch
            let batchExp = 0;
            const invDeltas: Record<string, number> = {};

            activeIds.forEach(id => {
              const currentShip = shipsRef.current.find(s => s.id === id);
              if (!currentShip) return;
              const catchData = calculateShipCatch(currentShip);
              if (catchData.totalAmount > 0) {
                invDeltas[catchData.fishInfo.fullName] = (invDeltas[catchData.fishInfo.fullName] || 0) + catchData.totalAmount;
              }
              batchExp += catchData.expReward;

              // Spawn particles at dock
              const dockPos = docks[id] || { l: '45%', t: '48%' };
              const sx = parseFloat(dockPos.l) || 45;
              const sy = parseFloat(dockPos.t) || 48;
              window.dispatchEvent(new CustomEvent('spawn-pirate-particles', {
                detail: { x: sx, y: sy, type: 'water-splash', count: 12 }
              }));
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent('spawn-pirate-particles', {
                  detail: { x: sx, y: sy, type: 'gold-gain', count: 10 }
                }));
              }, 200);
            });

            if (Object.keys(invDeltas).length > 0) {
              setFishInventory(prev => {
                const nextInv = { ...prev };
                Object.entries(invDeltas).forEach(([name, amt]) => {
                  nextInv[name] = ((nextInv[name] as number) || 0) + amt;
                });
                localStorage.setItem('pirate_fish_inventory', JSON.stringify(nextInv));
                return nextInv;
              });
            }

            if (batchExp > 0) {
              setExp(prev => {
                const nextExp = prev + batchExp;
                localStorage.setItem('pirate_exp', String(nextExp));
                return nextExp;
              });
            }

            // 5. Rest at dock, then repeat synchronized cycle
            fleetCycleTimeoutRef.current = setTimeout(() => {
              if (!isCancelled) {
                runSynchronizedFleetCycle();
              }
            }, FLEET_DOCK_PAUSE_MS);

          }, FLEET_RETURN_MS);
        }, FLEET_FLIP_MS);
      }, FLEET_SAIL_OUT_MS);
    };

    runSynchronizedFleetCycle();

    return () => {
      isCancelled = true;
      if (fleetCycleTimeoutRef.current) {
        clearTimeout(fleetCycleTimeoutRef.current);
      }
    };
  }, [calculateShipCatch]);

  // --- Ship Repair Handler (Manual & Kit Repairs) ---
  const handleRepairShip = async (
    targetShipId: string, 
    type: 'small' | 'medium' | 'large' | 'legendary' | 'gold' | 'gems'
  ) => {
    const targetShip = ships.find(s => s.id === targetShipId);
    if (!targetShip) return;

    const maxH = targetShip.maxHeart || ((targetShip.level || 0) * 1000) + 10000;
    const curH = typeof targetShip.heart === 'number' ? targetShip.heart : maxH;

    if (type !== 'legendary' && type !== 'gems' && curH >= maxH) {
      showToast('⚠️ هيكل هذه السفينة سليم بالكامل ولا يحتاج لصيانة!', 'info');
      return;
    }

    let updatedCrewServices = { ...crewServices };
    let newGold = gold;
    let newGems = gems;
    let healAmount = 0;
    let repairAll = false;

    if (type === 'small') {
      const count = crewServices.repairer_small || 0;
      if (count <= 0) {
        showToast('⚠️ ليس لديك مصلح صغير في المستودع! يمكنك شراؤه من المتجر أو الإصلاح بالذهب.', 'error');
        return;
      }
      updatedCrewServices.repairer_small = count - 1;
      healAmount = 500;
    } else if (type === 'medium') {
      const count = crewServices.repairer_medium || 0;
      if (count <= 0) {
        showToast('⚠️ ليس لديك مصلح وسط في المستودع! يمكنك شراؤه من المتجر أو الإصلاح بالذهب.', 'error');
        return;
      }
      updatedCrewServices.repairer_medium = count - 1;
      healAmount = curH <= 0 ? 1000 : Math.max(1000, Math.floor(maxH * 0.5));
    } else if (type === 'large') {
      const count = crewServices.repairer_large || 0;
      if (count <= 0) {
        showToast('⚠️ ليس لديك مصلح كبير في المستودع! يمكنك شراؤه من المتجر أو الإصلاح بالذهب.', 'error');
        return;
      }
      updatedCrewServices.repairer_large = count - 1;
      healAmount = maxH - curH;
    } else if (type === 'legendary') {
      const count = crewServices.repairer_legendary || 0;
      if (count <= 0) {
        showToast('⚠️ ليس لديك مصلح أسطوري في المستودع! يمكنك شراؤه من المتجر أو الصيانة بالجواهر.', 'error');
        return;
      }
      updatedCrewServices.repairer_legendary = count - 1;
      repairAll = true;
    } else if (type === 'gold') {
      const cost = 500;
      if (gold < cost) {
        showToast(`❌ الذهب غير كافٍ للصيانة! تحتاج إلى ${cost} 🪙 ذهب.`, 'error');
        return;
      }
      newGold = gold - cost;
      healAmount = maxH - curH;
    } else if (type === 'gems') {
      const cost = 10;
      if (gems < cost) {
        showToast(`❌ الجواهر غير كافية للصيانة! تحتاج إلى ${cost} 💎 جوهرة.`, 'error');
        return;
      }
      newGems = gems - cost;
      repairAll = true;
    }

    let updatedShips: ShipState[];
    if (repairAll) {
      updatedShips = ships.map(s => {
        const mH = s.maxHeart || ((s.level || 0) * 1000) + 10000;
        return {
          ...s,
          heart: mH,
          status: 'docked' as const,
          moving: false
        };
      });
      setPortDestroyed(false);
      localStorage.setItem('pirate_port_destroyed', 'false');
    } else {
      updatedShips = ships.map(s => {
        if (s.id === targetShipId) {
          const newH = Math.min(maxH, curH + healAmount);
          return {
            ...s,
            heart: newH,
            status: 'docked' as const,
            moving: false
          };
        }
        return s;
      });
    }

    setShips(updatedShips);
    setCrewServices(updatedCrewServices);
    setGold(newGold);
    setGems(newGems);

    localStorage.setItem('pirate_ships_v2', JSON.stringify(updatedShips));
    localStorage.setItem('pirate_ships', JSON.stringify(updatedShips));
    localStorage.setItem('pirate_crew_services', JSON.stringify(updatedCrewServices));

    // Persist immediately to Firestore
    if (auth.currentUser && db) {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      updateDoc(userRef, {
        ships: updatedShips,
        crewServices: updatedCrewServices,
        gold: newGold,
        gems: newGems,
        portDestroyed: repairAll ? false : portDestroyed,
        updatedAt: new Date().toISOString()
      }).catch(console.error);
    }

    if (repairModalShip && repairModalShip.id === targetShipId) {
      const refreshedTarget = updatedShips.find(s => s.id === targetShipId);
      setRepairModalShip(refreshedTarget || null);
    }

    showToast(
      repairAll 
        ? '👑 تم صيانة وترميم كامل أسطول السفن بنسبة 100% بنجاح!' 
        : `🔧 تم صيانة وترميم هيكل [${targetShip.name}] بنجاح!`,
      'success'
    );
  };

  // --- Perform Ship Actions ---
  const act = (type: 'crew' | 'sell' | 'fish' | 'collect' | 'repair') => {
    setMenu(prev => ({ ...prev, visible: false }));
    if (!currentShipId) return;

    if (type === 'sell') {
      setConfirmModal(true);
    } else if (type === 'crew') {
      setCrewModal(true);
    } else if (type === 'repair') {
      const shipToRepair = ships.find(s => s.id === currentShipId);
      if (shipToRepair) {
        setRepairModalShip(shipToRepair);
      }
    } else if (type === 'fish') {
      const shipObj = ships.find(s => s.id === currentShipId);
      if (shipObj && (portDestroyed || (typeof shipObj.heart === 'number' && shipObj.heart <= 0))) {
        showToast('⚠️ هذه السفينة مدمّرة بنيران المعارك! يرجى صيانتها وإصلاح هيكلها أولاً لتتمكن من الإبحار والصيد.', 'error');
        setRepairModalShip(shipObj);
        return;
      }
      startShipFishing(currentShipId);
    } else if (type === 'collect') {
      collectShipFish(currentShipId, false);
    }
  };

  const confirmSell = async () => {
    if (!currentShipId) return;
    if (!isNetworkOnline()) {
      notifyOfflineBlocked('بيع وإلغاء السفينة');
      return;
    }

    const updatedShips = ships.map(s => {
      if (s.id === currentShipId) {
        return {
          ...s,
          exists: false,
          assignedCrew: [],
          crewPower: 0,
          autoFishingPaused: false
        };
      }
      return s;
    });

    const remainingAssigned = updatedShips.filter(s => s.exists).flatMap(s => s.assignedCrew || []);
    const updatedCrewServices = {
      ...crewServices,
      golden_hunter: remainingAssigned.includes('golden_hunter') || remainingAssigned.includes('gold_fisher'),
      gold_fisher: remainingAssigned.includes('golden_hunter') || remainingAssigned.includes('gold_fisher'),
      luck: remainingAssigned.includes('luck'),
      sailor: remainingAssigned.includes('sailor') || remainingAssigned.includes('sailors'),
      sailors: remainingAssigned.includes('sailor') || remainingAssigned.includes('sailors'),
      guide: remainingAssigned.includes('guide'),
      cop: remainingAssigned.includes('cop') || remainingAssigned.includes('police'),
      police: remainingAssigned.includes('cop') || remainingAssigned.includes('police'),
      thief: remainingAssigned.includes('thief'),
    };

    const res = await executeFinancialTransaction({
      goldDelta: 250,
      ships: updatedShips,
      crewServices: updatedCrewServices,
      reason: 'بيع سفينة وإلغاؤها وإخلاء طواقمها (+250 ذهب)',
      onLocalApply: () => {
        setGold(prev => prev + 250);
        setShips(updatedShips);
        setCrewServices(updatedCrewServices);
        localStorage.setItem('pirate_ships_v2', JSON.stringify(updatedShips));
        localStorage.setItem('pirate_crew_services', JSON.stringify(updatedCrewServices));
      }
    });

    if (res.success) {
      if (typeof res.newGold === 'number') {
        setGold(res.newGold);
      }
      setShips(updatedShips);
      setCrewServices(updatedCrewServices);
      localStorage.setItem('pirate_ships_v2', JSON.stringify(updatedShips));
      localStorage.setItem('pirate_crew_services', JSON.stringify(updatedCrewServices));
      setConfirmModal(false);

      // Trigger ship destruction/sell explosion at its coordinate
      const targetShip = ships.find(s => s.id === currentShipId);
      if (targetShip) {
        const sx = parseFloat(targetShip.left) || 45;
        const sy = parseFloat(targetShip.top) || 48;
        
        window.dispatchEvent(new CustomEvent('spawn-pirate-particles', {
          detail: { x: sx, y: sy, type: 'destroy', count: 35 }
        }));
      }
      alert('💵 تم بيع وتفكيك السفينة وإخلاء كافة طواقمها بنجاح وإضافة 250 🪙 ذهب عبر المعاملة الذرية!');
    }
  };

  const hireCrew = async (cMember: CrewMember) => {
    if (!currentShipId) return;
    if (!isNetworkOnline()) {
      notifyOfflineBlocked(`تعيين البحار ${cMember.name}`);
      return;
    }

    if (gold < cMember.cost) {
      alert('الذهب غير كافٍ لتعيين هذا البحار!');
      return;
    }

    const updatedCrew = crew.map(item => item.id === cMember.id ? { ...item, hired: true, shipId: currentShipId } : item);
    const updatedShips = ships.map(s => {
      if (s.id === currentShipId) {
        return {
          ...s,
          crewPower: s.crewPower + cMember.power
        };
      }
      return s;
    });

    const res = await executeFinancialTransaction({
      goldDelta: -cMember.cost,
      ships: updatedShips,
      reason: `تعيين بحار ${cMember.name}`,
      onLocalApply: () => {
        setGold(prev => prev - cMember.cost);
        setCrew(updatedCrew);
        setShips(updatedShips);
      }
    });

    if (res.success) {
      if (typeof res.newGold === 'number') {
        setGold(res.newGold);
      }
      setCrew(updatedCrew);
      setShips(updatedShips);
      updateQuestProgress('q2', 1);
      alert(`🎉 تم تعيين البحار [${cMember.name}] بنجاح وتأكيد العملية في السحابة!`);
    }
  };

  const buyShopItem = async (type: 'ship' | 'net' | 'engine' | 'gold_pack', costGold: number, costGems: number, extraId?: string) => {
    if (!isNetworkOnline()) {
      notifyOfflineBlocked('شراء عناصر المتجر');
      return;
    }

    if (gold < costGold) {
      alert('الذهب غير كافٍ!');
      return;
    }
    if (gems < costGems) {
      alert('الجواهر غير كافية!');
      return;
    }

    let updatedShips = ships;
    let goldGain = 0;

    if (type === 'ship') {
      const activeCount = ships.filter(s => s.exists).length;
      if (activeCount >= 3) {
        alert('لقد وصلت للحد الأقصى من السفن في الميناء (3 سفن)!');
        return;
      }

      const existingInactive = ships.find(s => !s.exists);
      if (existingInactive) {
        updatedShips = ships.map(s => s.id === existingInactive.id ? {
          ...s,
          exists: true,
          status: 'docked',
          left: docks[s.id].l,
          top: docks[s.id].t,
          scaleX: 1,
          moving: false,
          crewPower: 0,
          assignedCrew: [],
          autoFishingPaused: false,
          hasNetUpgrade: false,
          hasEngineUpgrade: false
        } : s);
      } else {
        const nextId = `s${ships.length + 1}`;
        const newShip: ShipState = {
          id: nextId,
          name: extraId === 'royal' ? 'المدمرة الملكية الأسطورية' : 'سفينة المغامر المطورة',
          status: 'docked',
          left: docks[nextId]?.l || '45%',
          top: docks[nextId]?.t || '68%',
          scaleX: 1,
          moving: false,
          exists: true,
          crewPower: 0,
          assignedCrew: [],
          autoFishingPaused: false,
          hasNetUpgrade: false,
          hasEngineUpgrade: false
        };
        updatedShips = [...ships, newShip];
      }
    } else if (type === 'net') {
      updatedShips = ships.map(s => ({ ...s, hasNetUpgrade: true }));
    } else if (type === 'engine') {
      updatedShips = ships.map(s => ({ ...s, hasEngineUpgrade: true }));
    } else if (type === 'gold_pack') {
      goldGain = 1500;
    }

    const netGoldDelta = -costGold + goldGain;

    const res = await executeFinancialTransaction({
      goldDelta: netGoldDelta,
      gemsDelta: -costGems,
      ships: updatedShips,
      reason: `شراء متجر (${type})`,
      onLocalApply: () => {
        setGold(prev => prev + netGoldDelta);
        setGems(prev => prev - costGems);
        setShips(updatedShips);
      }
    });

    if (res.success) {
      if (typeof res.newGold === 'number') {
        setGold(res.newGold);
      }
      if (typeof res.newGems === 'number') {
        setGems(res.newGems);
      }
      setShips(updatedShips);

      if (type === 'ship') {
        alert('تم شراء سفينة جديدة بنجاح في الميناء عبر المعاملة الذرية!');
      } else if (type === 'net') {
        alert('تمت ترقية شباك جميع السفن إلى شباك هامور شابك المزدوجة!');
      } else if (type === 'engine') {
        alert('تمت ترقية المحركات لجميع السفن بنجاح! زادت سرعة الإياب بشكل مضاعف.');
      } else if (type === 'gold_pack') {
        alert('تم شراء باقة ذهب ملوك الأعماق (+1500 ذهب) وتأكيدها في السحابة!');
      }
    }
  };

  const [upgradeTargetSpec, setUpgradeTargetSpec] = useState<any | null>(null);

  const buyShipLevel = (spec: any) => {
    if (!isNetworkOnline()) {
      notifyOfflineBlocked('شراء سفينة جديدة');
      return;
    }
    const isSubmarine = spec.level >= 32;
    const isLockedByTower = isSubmarine ? (shipTowerLevel < 31) : (spec.level > 0 && spec.level > shipTowerLevel);
    if (isLockedByTower) {
      if (isSubmarine) {
        alert(`⚠️ لا يمكنك شراء الغواصة الأسطورية! يجب أولاً ترقية بيت السفن إلى أقصى مستوى (المستوى 31).`);
      } else {
        alert(`⚠️ لا يمكنك شراء هذه السفينة! يجب أولاً ترقية بيت السفن إلى المستوى ${spec.level}.`);
      }
      return;
    }
    if (gold < spec.price) {
      alert(`⚠️ الذهب غير كافٍ! تحتاج إلى ${spec.price.toLocaleString('ar-EG')} ذهب لترقية إحدى سفنك إلى هذا المستوى.`);
      return;
    }

    // Trigger choice of which of the 3 active ships to upgrade
    setUpgradeTargetSpec(spec);
  };

  const confirmUpgradeShip = async (shipId: string, spec: any) => {
    if (!isNetworkOnline()) {
      notifyOfflineBlocked(`ترقية السفينة إلى ${spec.name}`);
      return;
    }
    if (gold < spec.price) {
      alert(`⚠️ الذهب غير كافٍ!`);
      return;
    }

    const updatedShips = ships.map(s => {
      if (s.id === shipId) {
        return {
          ...s,
          name: spec.name,
          level: spec.level,
          hook: spec.hook,
          cargo: spec.cargo,
          heart: spec.heart,
          durationStr: spec.durationStr,
          power: spec.power,
          armor: spec.armor,
          fishTypes: spec.fishTypes,
          imgEmoji: spec.emoji,
          exists: true,
          status: s.exists ? s.status : 'docked',
          left: s.exists ? s.left : (docks[s.id]?.l || s.left),
          top: s.exists ? s.top : (docks[s.id]?.t || s.top),
          scaleX: 1,
          moving: s.exists ? s.moving : false,
          crewPower: 0,
          assignedCrew: [],
          autoFishingPaused: false,
        };
      }
      return s;
    });

    const remainingAssigned = updatedShips.filter(s => s.exists).flatMap(s => s.assignedCrew || []);
    const updatedCrewServices = {
      ...crewServices,
      golden_hunter: remainingAssigned.includes('golden_hunter') || remainingAssigned.includes('gold_fisher'),
      gold_fisher: remainingAssigned.includes('golden_hunter') || remainingAssigned.includes('gold_fisher'),
      luck: remainingAssigned.includes('luck'),
      sailor: remainingAssigned.includes('sailor') || remainingAssigned.includes('sailors'),
      sailors: remainingAssigned.includes('sailor') || remainingAssigned.includes('sailors'),
      guide: remainingAssigned.includes('guide'),
      cop: remainingAssigned.includes('cop') || remainingAssigned.includes('police'),
      police: remainingAssigned.includes('cop') || remainingAssigned.includes('police'),
      thief: remainingAssigned.includes('thief'),
    };

    const res = await executeFinancialTransaction({
      goldDelta: -spec.price,
      ships: updatedShips,
      crewServices: updatedCrewServices,
      reason: `شراء/ترقية سفينة إلى ${spec.name} بدون طواقم سابقة`,
      onLocalApply: () => {
        setGold(prev => prev - spec.price);
        setShips(updatedShips);
        setCrewServices(updatedCrewServices);
        localStorage.setItem('pirate_ships_v2', JSON.stringify(updatedShips));
        localStorage.setItem('pirate_crew_services', JSON.stringify(updatedCrewServices));
      }
    });

    if (res.success) {
      if (typeof res.newGold === 'number') {
        setGold(res.newGold);
      }
      setShips(updatedShips);
      setCrewServices(updatedCrewServices);
      localStorage.setItem('pirate_ships_v2', JSON.stringify(updatedShips));
      localStorage.setItem('pirate_crew_services', JSON.stringify(updatedCrewServices));
      setUpgradeTargetSpec(null);
      if (spec.level === 0) {
        alert(`🎉 تم تفكيك وإعادة تعيين السفينة بنجاح إلى ${spec.name} (مستوى 0) وإخلاء طواقمها!`);
      } else {
        const sameLevelCount = updatedShips.filter(s => s.exists && s.level === spec.level).length;
        if (sameLevelCount === 3) {
          alert(`🎉 تهانينا الجبارة! تم تنزيل سفينتك الجديدة [${spec.name}] (مستوى ${spec.level})! أصبح أسطولك بالكامل يمتلك 3 سفن بنفس هذا المستوى المتطابق (3/3) بنجاح! ⚓👑`);
        } else if (sameLevelCount > 1) {
          alert(`🎉 تهانينا! تم شراء وتنزيل سفينتك الجديدة [${spec.name}] (مستوى ${spec.level})! أصبح لديك الآن (${sameLevelCount}/3) سفن بنفس هذا المستوى في أسطولك! ⚓`);
        } else {
          alert(`🎉 تهانينا! تم شراء وتنزيل سفينتك الجديدة [${spec.name}] (مستوى ${spec.level}) بنجاح وبدون طواقم عبر المعاملة الذرية!`);
        }
      }
    }
  };

  const handleUpgradeSubmarine = async (shipId: string, currentLevel: number) => {
    if (!isNetworkOnline()) {
      notifyOfflineBlocked('ترقية الغواصة الأسطورية');
      return;
    }
    const nextLevel = currentLevel + 1;
    const nextSpec = SHOP_SHIPS.find(s => s.level === nextLevel);
    if (!nextSpec) return;

    if (gold < nextSpec.price) {
      alert(`⚠️ الذهب غير كافٍ! تحتاج إلى 🪙 ${nextSpec.price.toLocaleString('ar-EG')} ذهب للترقية.`);
      return;
    }

    const updatedShips = ships.map(s => {
      if (s.id === shipId) {
        return {
          ...s,
          name: nextSpec.name,
          level: nextSpec.level,
          hook: nextSpec.hook,
          cargo: nextSpec.cargo,
          heart: nextSpec.heart,
          durationStr: nextSpec.durationStr,
          power: nextSpec.power,
          armor: nextSpec.armor,
          fishTypes: nextSpec.fishTypes,
          imgEmoji: nextSpec.emoji,
          exists: true,
        };
      }
      return s;
    });

    const res = await executeFinancialTransaction({
      goldDelta: -nextSpec.price,
      ships: updatedShips,
      reason: `ترقية الغواصة إلى ${nextSpec.name}`,
      onLocalApply: () => {
        setGold(prev => prev - nextSpec.price);
        setShips(updatedShips);
      }
    });

    if (res.success) {
      if (typeof res.newGold === 'number') {
        setGold(res.newGold);
      }
      setShips(updatedShips);
      alert(`🎉 تهانينا! تم ترقية غواصتك الأسطورية بنجاح إلى ليفل ${nextLevel - 31} (${nextSpec.name}) عبر المعاملة الذرية!`);
    }
  };

  /**
   * دالة الشراء المركزية والمعاملة الذرية الموحدة (Unified Atomic Purchase Engine)
   * تضمن:
   * 1. التحقق من الرصيد والاتصال بالإنترنت قبل أي إجراء.
   * 2. إضافة العنصر المشتري فوراً إلى المخزن المناسب (الأسلحة، أفراد الطاقم، الدروع).
   * 3. مزامنة فورية بين المتجر والمخزن (React state + Firestore + localStorage).
   * 4. الحفاظ الصارم على الرصيد وعدم خصم أي ذهب أو جواهر إذا تعثرت العملية.
   */
  const handlePurchase = async (params: {
    category: 'weapon' | 'crew' | 'shield' | 'ship' | 'service' | 'item';
    itemId: string;
    itemName: string;
    costType: 'gold' | 'gems' | 'blueGems';
    price: number;
    quantity?: number;
    targetShipId?: string;
  }): Promise<boolean> => {
    const { category, itemId, itemName, costType, price, quantity = 1, targetShipId } = params;

    if (!isNetworkOnline()) {
      notifyOfflineBlocked(`شراء [${itemName}]`);
      return false;
    }

    const isGold = costType === 'gold';
    if (isGold && gold < price) {
      alert(`❌ الذهب غير كافٍ لإتمام عملية الشراء!\nتحتاج إلى: ${price.toLocaleString('ar-EG')} 🪙 ذهب.\nرصيدك المتوفر: ${gold.toLocaleString('ar-EG')} 🪙 ذهب.`);
      return false;
    }
    if (!isGold && gems < price) {
      alert(`❌ الجواهر غير كافية لإتمام عملية الشراء!\nتحتاج إلى: ${price.toLocaleString('ar-EG')} 💎 جوهرة.\nرصيدك المتوفر: ${gems.toLocaleString('ar-EG')} 💎 جوهرة.`);
      return false;
    }

    // 1. حساب حالات المخازن المحدثة
    let updatedWeapons = { ...weapons };
    let updatedCrewInventory = { ...crewInventory };
    let updatedShieldInventory = { ...shieldInventory };
    let updatedCrewServices = { ...crewServices };
    let updatedShips = [...ships];

    const normKey = itemId === 'police' ? 'cop' 
      : itemId === 'sailors' ? 'sailor' 
      : itemId === 'gold_fisher' ? 'golden_hunter' 
      : (itemId === 'repairer_small' || itemId === 'smallRepair') ? 'fixer_sm'
      : (itemId === 'repairer_medium' || itemId === 'mediumRepair') ? 'fixer_md'
      : (itemId === 'repairer_large' || itemId === 'largeRepair') ? 'fixer_lg'
      : (itemId === 'repairer_legendary' || itemId === 'legendaryRepair') ? 'fixer_epic'
      : itemId;

    // A) عناصر الأسلحة والترسانة الحربية
    if (category === 'weapon' || WEAPONS_DATA.some(w => w.key === itemId || w.id === itemId)) {
      const curQty = weapons[itemId] || 0;
      const newQty = curQty + quantity;
      updatedWeapons[itemId] = newQty;

      if (itemId === 'adBomb' || itemId === 'emp_bomb') {
        const dualQty = (weapons.emp_bomb || weapons.adBomb || 0) + quantity;
        updatedWeapons.adBomb = dualQty;
        updatedWeapons.emp_bomb = dualQty;
      } else if (itemId === 'atomicBomb' || itemId === 'nuke_bomb') {
        const dualQty = (weapons.nuke_bomb || weapons.atomicBomb || 0) + quantity;
        updatedWeapons.atomicBomb = dualQty;
        updatedWeapons.nuke_bomb = dualQty;
      } else if (itemId === 'smallRocket' || itemId === 'small_missile') {
        const dualQty = (weapons.small_missile || weapons.smallRocket || 0) + quantity;
        updatedWeapons.smallRocket = dualQty;
        updatedWeapons.small_missile = dualQty;
      } else if (itemId === 'mediumRocket' || itemId === 'medium_missile') {
        const dualQty = (weapons.medium_missile || weapons.mediumRocket || 0) + quantity;
        updatedWeapons.mediumRocket = dualQty;
        updatedWeapons.medium_missile = dualQty;
      } else if (itemId === 'largeRocket' || itemId === 'large_missile') {
        const dualQty = (weapons.large_missile || weapons.largeRocket || 0) + quantity;
        updatedWeapons.largeRocket = dualQty;
        updatedWeapons.large_missile = dualQty;
      }
    }

    // B) عناصر الطاقم والشخصيات وحزم الصيانة
    if (category === 'crew' || CREW_SHOP_ITEMS.some(c => c.id === itemId || c.id === normKey)) {
      const curCrewQty = crewInventory[itemId] || crewInventory[normKey] || 0;
      const newCrewQty = curCrewQty + quantity;
      updatedCrewInventory[itemId] = newCrewQty;
      updatedCrewInventory[normKey] = newCrewQty;

      if (normKey === 'golden_hunter' || normKey === 'gold_fisher') {
        updatedCrewInventory.golden_hunter = newCrewQty;
        updatedCrewInventory.gold_fisher = newCrewQty;
        updatedCrewServices.golden_hunter = true;
        updatedCrewServices.gold_fisher = true;
      } else if (normKey === 'cop' || normKey === 'police') {
        updatedCrewInventory.cop = newCrewQty;
        updatedCrewInventory.police = newCrewQty;
        updatedCrewServices.cop = true;
        updatedCrewServices.police = true;
      } else if (normKey === 'sailor' || normKey === 'sailors') {
        updatedCrewInventory.sailor = newCrewQty;
        updatedCrewInventory.sailors = newCrewQty;
        updatedCrewServices.sailor = true;
        updatedCrewServices.sailors = true;
      } else if (normKey === 'thief') {
        updatedCrewInventory.thief = newCrewQty;
        updatedCrewServices.thief = true;
      } else if (normKey === 'guide') {
        updatedCrewInventory.guide = newCrewQty;
        updatedCrewServices.guide = true;
      } else if (normKey === 'luck') {
        updatedCrewInventory.luck = newCrewQty;
        updatedCrewServices.luck = true;
      } else if (normKey === 'market_expert') {
        updatedCrewInventory.market_expert = newCrewQty;
        updatedCrewServices.market_expert = true;
      }

      // مزامنة حزم الصيانة في كافة الجداول
      if (itemId === 'fixer_sm' || itemId === 'smallRepair' || itemId === 'repairer_small') {
        const smQty = (crewInventory.fixer_sm || 0) + quantity;
        updatedCrewInventory.fixer_sm = smQty;
        updatedCrewServices.repairer_small = (crewServices.repairer_small || 0) + quantity;
        updatedCrewServices.fixer_sm = true;
        updatedWeapons.smallRepair = (weapons.smallRepair || 0) + quantity;
      } else if (itemId === 'fixer_md' || itemId === 'mediumRepair' || itemId === 'repairer_medium') {
        const mdQty = (crewInventory.fixer_md || 0) + quantity;
        updatedCrewInventory.fixer_md = mdQty;
        updatedCrewServices.repairer_medium = (crewServices.repairer_medium || 0) + quantity;
        updatedCrewServices.fixer_md = true;
        updatedWeapons.mediumRepair = (weapons.mediumRepair || 0) + quantity;
      } else if (itemId === 'fixer_lg' || itemId === 'largeRepair' || itemId === 'repairer_large') {
        const lgQty = (crewInventory.fixer_lg || 0) + quantity;
        updatedCrewInventory.fixer_lg = lgQty;
        updatedCrewServices.repairer_large = (crewServices.repairer_large || 0) + quantity;
        updatedCrewServices.fixer_lg = true;
        updatedWeapons.largeRepair = (weapons.largeRepair || 0) + quantity;
      } else if (itemId === 'fixer_epic' || itemId === 'legendaryRepair' || itemId === 'repairer_legendary') {
        const epQty = (crewInventory.fixer_epic || 0) + quantity;
        updatedCrewInventory.fixer_epic = epQty;
        updatedCrewServices.repairer_legendary = (crewServices.repairer_legendary || 0) + quantity;
        updatedCrewServices.fixer_epic = true;
        updatedWeapons.legendaryRepair = (weapons.legendaryRepair || 0) + quantity;
      }

      // تعيين الطاقم والمصلحين على السفينة إن لم يكن معيناً
      const assignedShipId = targetShipId || currentShipId || (ships.find(s => s.exists)?.id || 's1');
      if (normKey === 'golden_hunter') {
        updatedShips = ships.map(s => {
          if (s.exists) {
            const currentCrew = s.assignedCrew || [];
            const newCrew = currentCrew.includes('golden_hunter') ? currentCrew : [...currentCrew, 'golden_hunter'];
            return {
              ...s,
              assignedCrew: newCrew,
              crewPower: (s.crewPower || 0) + (currentCrew.includes('golden_hunter') ? 0 : 15),
              autoFishingPaused: false
            };
          }
          return s;
        });
      } else {
        updatedShips = ships.map(s => {
          if (s.id === assignedShipId) {
            const currentCrew = s.assignedCrew || [];
            const newCrew = currentCrew.includes(normKey) ? currentCrew : [...currentCrew, normKey];
            let newHeart = s.heart;
            const maxHp = s.maxHeart || 1000;
            if (normKey === 'fixer_sm') {
              newHeart = Math.min(maxHp, (s.heart ?? maxHp) + 500);
            } else if (normKey === 'fixer_md') {
              const heal = Math.max(1000, Math.floor(maxHp * 0.5));
              newHeart = Math.min(maxHp, (s.heart ?? maxHp) + heal);
            } else if (normKey === 'fixer_lg' || normKey === 'fixer_epic') {
              newHeart = maxHp;
            }
            return {
              ...s,
              heart: typeof newHeart === 'number' ? newHeart : s.heart,
              assignedCrew: newCrew,
              crewPower: (s.crewPower || 0) + (currentCrew.includes(normKey) ? 0 : 15)
            };
          }
          if (normKey === 'fixer_epic' && s.exists) {
            return {
              ...s,
              heart: s.maxHeart || 1000
            };
          }
          return s;
        });
      }
    }

    // C) عناصر الدروع
    if (category === 'shield' || itemId.startsWith('shield_')) {
      const curShieldQty = shieldInventory[itemId] || 0;
      updatedShieldInventory[itemId] = curShieldQty + quantity;
    }

    // 2. تنفيذ المعاملة المالية الذرية في Firestore وقاعدة البيانات
    const res = await executeFinancialTransaction({
      goldDelta: isGold ? -price : 0,
      gemsDelta: !isGold ? -price : 0,
      weapons: updatedWeapons,
      crewInventory: updatedCrewInventory,
      shieldInventory: updatedShieldInventory,
      crewServices: updatedCrewServices,
      ships: updatedShips,
      reason: `شراء [${itemName}] وإضافته للمخزن`,
      onLocalApply: () => {
        if (isGold) setGold(prev => Math.max(0, prev - price));
        else setGems(prev => Math.max(0, prev - price));
        setWeapons(updatedWeapons);
        setCrewInventory(updatedCrewInventory);
        setShieldInventory(updatedShieldInventory);
        setCrewServices(updatedCrewServices);
        setShips(updatedShips);
      }
    });

    // 3. فحص نجاح المعاملة: في حالة الفشل لن يتم خصم أي رصيد
    if (!res.success) {
      alert(`⚠️ فشلت عملية الشراء! لم يتم خصم أي رصيد من حسابك.`);
      return false;
    }

    // 4. تطبيق الأرصدة المؤكدة وتحديث كافة الحالات والمخازن فوراً
    if (typeof res.newGold === 'number') setGold(res.newGold);
    if (typeof res.newGems === 'number') setGems(res.newGems);
    setWeapons(updatedWeapons);
    setCrewInventory(updatedCrewInventory);
    setShieldInventory(updatedShieldInventory);
    setCrewServices(updatedCrewServices);
    setShips(updatedShips);

    localStorage.setItem('pirate_weapons', JSON.stringify(updatedWeapons));
    localStorage.setItem('pirate_crew_inventory', JSON.stringify(updatedCrewInventory));
    localStorage.setItem('pirate_shield_inventory', JSON.stringify(updatedShieldInventory));
    localStorage.setItem('pirate_crew_services', JSON.stringify(updatedCrewServices));
    localStorage.setItem('pirate_ships_v2', JSON.stringify(updatedShips));

    alert(`🎉 تم الشراء بنجاح عبر المعاملة الذرية!\nتم خصم الرصيد وإضافة [${itemName}] مباشرة إلى مخزنك.`);
    return true;
  };

  const buyItem = handlePurchase;

  const buyWeaponItem = async (itemId: string, costType: 'gold' | 'blueGems', costValue: number) => {
    const spec = WEAPONS_DATA.find(w => w.key === itemId || w.id === itemId);
    const name = spec?.name || itemId;
    await handlePurchase({
      category: 'weapon',
      itemId,
      itemName: name,
      costType: costType === 'gold' ? 'gold' : 'blueGems',
      price: costValue
    });
  };

  const buyCrewService = async (
    key: string,
    name: string,
    price: number,
    incrementCount: number = 0,
    costType?: 'gold' | 'gems',
    targetShipId?: string
  ) => {
    const spec = CREW_SHOP_ITEMS.find(item => item.id === key);
    const actualCostType = costType || (spec ? spec.costType : 'gems');
    const actualPrice = spec ? spec.price : price;
    await handlePurchase({
      category: 'crew',
      itemId: key,
      itemName: name,
      costType: actualCostType,
      price: actualPrice,
      targetShipId
    });
  };

  const toggleAutoFishing = (shipId: string) => {
    setShips(prev => {
      let isPausedNow = false;
      const updated = prev.map(s => {
        if (s.id === shipId) {
          isPausedNow = !s.autoFishingPaused;
          return {
            ...s,
            autoFishingPaused: isPausedNow
          };
        }
        return s;
      });
      localStorage.setItem('pirate_ships_v2', JSON.stringify(updated));
      return updated;
    });
  };

  const normalizeCrewMemberKey = (key: string): string => {
    if (key === 'police') return 'cop';
    if (key === 'sailors') return 'sailor';
    if (key === 'gold_fisher') return 'golden_hunter';
    if (key === 'repairer_small' || key === 'smallRepair') return 'fixer_sm';
    if (key === 'repairer_medium' || key === 'mediumRepair') return 'fixer_md';
    if (key === 'repairer_large' || key === 'largeRepair') return 'fixer_lg';
    if (key === 'repairer_legendary' || key === 'legendaryRepair') return 'fixer_epic';
    return key;
  };

  const assignCrewToAllShips = (key: string) => {
    const normalizedKey = normalizeCrewMemberKey(key);
    setShips(prev => {
      const updated = prev.map(s => {
        if (s.exists) {
          const currentCrew = s.assignedCrew || [];
          const newCrew = currentCrew.includes(normalizedKey) ? currentCrew : [...currentCrew, normalizedKey];
          return {
            ...s,
            assignedCrew: newCrew,
            crewPower: (s.crewPower || 0) + (currentCrew.includes(normalizedKey) ? 0 : 15),
            autoFishingPaused: false
          };
        }
        return s;
      });
      localStorage.setItem('pirate_ships_v2', JSON.stringify(updated));
      return updated;
    });

    setCrewServices(prev => {
      const updated = {
        ...prev,
        [normalizedKey]: true,
        [key]: true,
        ...(normalizedKey === 'cop' ? { police: true } : {}),
        ...(normalizedKey === 'sailor' ? { sailors: true } : {}),
        ...(normalizedKey === 'golden_hunter' ? { gold_fisher: true } : {}),
      };
      localStorage.setItem('pirate_crew_services', JSON.stringify(updated));
      return updated;
    });
  };

  const unassignCrewFromAllShips = (key: string) => {
    const normalizedKey = normalizeCrewMemberKey(key);
    setShips(prev => {
      const updated = prev.map(s => {
        const currentCrew = s.assignedCrew || [];
        return {
          ...s,
          assignedCrew: currentCrew.filter(c => c !== normalizedKey && c !== key),
          crewPower: Math.max(0, (s.crewPower || 0) - (currentCrew.includes(normalizedKey) ? 15 : 0))
        };
      });
      localStorage.setItem('pirate_ships_v2', JSON.stringify(updated));
      return updated;
    });

    setCrewServices(cs => {
      const newCs = {
        ...cs,
        [normalizedKey]: false,
        [key]: false,
        ...(normalizedKey === 'golden_hunter' ? { gold_fisher: false } : {})
      };
      localStorage.setItem('pirate_crew_services', JSON.stringify(newCs));
      return newCs;
    });
  };

  const unassignCrewFromShip = (key: string, shipId: string) => {
    const normalizedKey = normalizeCrewMemberKey(key);
    setShips(prev => {
      const updated = prev.map(s => {
        if (s.id === shipId) {
          const currentCrew = s.assignedCrew || [];
          return {
            ...s,
            assignedCrew: currentCrew.filter(c => c !== normalizedKey && c !== key),
            crewPower: Math.max(0, (s.crewPower || 0) - 15)
          };
        }
        return s;
      });
      localStorage.setItem('pirate_ships_v2', JSON.stringify(updated));

      // If removing Golden Hunter, check if any other ship still has it
      if (normalizedKey === 'golden_hunter') {
        const stillAssignedElsewhere = updated.some(s => s.assignedCrew?.includes('golden_hunter') || s.assignedCrew?.includes('gold_fisher'));
        if (!stillAssignedElsewhere) {
          setCrewServices(cs => {
            const newCs = { ...cs, golden_hunter: false, gold_fisher: false };
            localStorage.setItem('pirate_crew_services', JSON.stringify(newCs));
            return newCs;
          });
        }
      }

      return updated;
    });
  };

  const transferCrewToShip = (key: string, fromShipId: string, toShipId: string) => {
    const normalizedKey = key === 'police' ? 'cop' : key === 'sailors' ? 'sailor' : key === 'gold_fisher' ? 'golden_hunter' : key;
    const targetShip = ships.find(s => s.id === toShipId);
    const targetName = targetShip?.name || 'السفينة الجديدة';
    setShips(prev => {
      const updated = prev.map(s => {
        if (s.id === fromShipId) {
          const currentCrew = s.assignedCrew || [];
          return {
            ...s,
            assignedCrew: currentCrew.filter(c => c !== normalizedKey && c !== key),
            crewPower: Math.max(0, (s.crewPower || 0) - 15)
          };
        }
        if (s.id === toShipId) {
          const currentCrew = s.assignedCrew || [];
          const newCrew = currentCrew.includes(normalizedKey) ? currentCrew : [...currentCrew, normalizedKey];
          return {
            ...s,
            assignedCrew: newCrew,
            crewPower: (s.crewPower || 0) + 15
          };
        }
        return s;
      });
      localStorage.setItem('pirate_ships_v2', JSON.stringify(updated));
      return updated;
    });
    alert(`⚓ تم نقل الطاقم بنجاح إلى ظهر سفينة [${targetName}]!`);
  };

  // --- Stealing / Pirate Raid Simulation (الشرطي حارس من السرقة) - تم إيقاف المحاكاة والاشعارات الوهمية تماماً تلبية لرغبة المستخدم ---
  useEffect(() => {
    // تم إلغاء محاكاة سرقة الذهب والاشعارات الوهمية تماماً لمنع أي إزعاج أو تنبيهات غير حقيقية.
    return () => {};
  }, []);

  // --- Real Multiplayer Tribe Handlers ---
  const handleCreateTribe = async () => {
    if (!newTribeName.trim()) {
      alert("يرجى إدخال اسم التحالف!");
      return;
    }
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      const tribeData = {
        name: newTribeName.trim(),
        description: newTribeDesc.trim() || 'تحالف أبطال البحار والأعماق',
        emblem: newTribeEmblem || '🏴‍☠️',
        leaderId: currentUser.uid,
        leaderName: username,
        level: 1,
        power: exp || 100,
        donations: 0,
        membersCount: 1,
        members: [currentUser.uid],
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'tribes'), tribeData);
      setTribeId(docRef.id);
      setTribeName(newTribeName.trim());
      
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        tribeId: docRef.id,
        tribeName: newTribeName.trim()
      });

      sendSecureChatMessage(
        'إشعار التحالفات 🛡️',
        '🛡️',
        `🎉 قام القبطان @${username} بتأسيس تحالف جديد باسم [${newTribeName.trim()}] ${newTribeEmblem}! انضموا الآن!`
      );

      setShowCreateTribeModal(false);
      setNewTribeName('');
      setNewTribeDesc('');
      alert("🎉 تم إنشاء التحالف بنجاح وأصبحت القائد!");
    } catch (err) {
      console.error("Error creating tribe:", err);
      alert("حدث خطأ أثناء إنشاء التحالف!");
    }
  };

  const joinTribe = async (targetTribe: any) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const isMember = targetTribe.members?.includes(currentUser.uid);

    try {
      const tribeRef = doc(db, 'tribes', targetTribe.id);
      const userDocRef = doc(db, 'users', currentUser.uid);

      if (isMember) {
        if (targetTribe.leaderId === currentUser.uid && (targetTribe.membersCount || 1) > 1) {
          alert("أنت قائد التحالف! لا يمكنك مغادرة التحالف إلا إذا قمت بنقل القيادة أو كان التحالف خالياً.");
          return;
        }
        const updatedMembers = (targetTribe.members || []).filter((m: string) => m !== currentUser.uid);
        await updateDoc(tribeRef, {
          members: updatedMembers,
          membersCount: Math.max(0, updatedMembers.length)
        });
        await updateDoc(userDocRef, {
          tribeId: '',
          tribeName: ''
        });
        setTribeId('');
        setTribeName('');
        alert(`تمت مغادرة التحالف [${targetTribe.name}].`);
      } else {
        if (tribeId) {
          alert("أنت بالفعل في تحالف آخر! يرجى مغادرة تحالفك الحالي أولاً للانضمام إلى هذا التحالف.");
          return;
        }
        const updatedMembers = [...(targetTribe.members || []), currentUser.uid];
        await updateDoc(tribeRef, {
          members: updatedMembers,
          membersCount: updatedMembers.length
        });
        await updateDoc(userDocRef, {
          tribeId: targetTribe.id,
          tribeName: targetTribe.name
        });
        setTribeId(targetTribe.id);
        setTribeName(targetTribe.name);

        sendSecureChatMessage(
          'إشعار التحالفات 🛡️',
          '🛡️',
          `⚔️ انضم القبطان @${username} إلى التحالف [${targetTribe.name}]! مرحباً به!`
        );

        alert(`🎉 تهانينا! انضممت بنجاح إلى التحالف [${targetTribe.name}].`);
      }
    } catch (err) {
      console.error("Error joining/leaving tribe:", err);
      alert("حدث خطأ أثناء معالجة الطلب!");
    }
  };

  const donateToTribe = async (targetTribe: any) => {
    if (gold < 100) {
      alert('الذهب غير كافٍ للتبرع (يتطلب 100 ذهب)!');
      return;
    }
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      setGold(prev => Math.max(0, prev - 100));
      const tribeRef = doc(db, 'tribes', targetTribe.id);
      const nextDonations = (targetTribe.donations || 0) + 100;
      const nextPower = (targetTribe.power || 0) + 2000;
      const nextLevel = Math.floor(nextDonations / 3000) + 1;

      await updateDoc(tribeRef, {
        donations: nextDonations,
        power: nextPower,
        level: nextLevel
      });

      updateQuestProgress('q3', 100);
      alert(`🪙 شكرًا لتبرعك بـ 100 ذهب! ارتفعت قوة تحالف [${targetTribe.name}] إلى 🛡️ ${nextPower.toLocaleString()}.`);
    } catch (err) {
      console.error("Error donating to tribe:", err);
    }
  };

  // --- Real Multiplayer Friend Handlers ---
  const handleSendFriendRequest = async (targetPlayer: any) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      showToast('يجب تسجيل الدخول لإرسال طلب صداقة', 'error');
      return;
    }
    const targetId = targetPlayer.userId || targetPlayer.id;
    if (!targetId || targetId === currentUser.uid) return;

    try {
      if (friends.includes(targetId)) {
        showToast(`القبطان @${targetPlayer.username} صديقك بالفعل! 🌟`, 'success');
        return;
      }

      await addDoc(collection(db, 'friendRequests'), {
        senderId: currentUser.uid,
        senderName: username || 'قبطان_مجهول',
        senderAvatar: avatar || '⚓',
        receiverId: targetId,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      });

      showToast(`✉️ تم إرسال طلب الصداقة إلى القبطان @${targetPlayer.username} بنجاح!`, 'success');
    } catch (err: any) {
      console.error("Error sending friend request:", err);
      showToast("تعذر إرسال طلب الصداقة: " + (err.message || 'خطأ غير متوقع'), "error");
    }
  };

  const handleAcceptFriendRequest = async (req: any) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      const updatedMyFriends = Array.from(new Set([...friends, req.senderId]));
      setFriends(updatedMyFriends);
      setFriendRequests(prev => prev.filter(r => r.id !== req.id && r.senderId !== req.senderId));

      // 1. Update own user document
      await updateDoc(doc(db, 'users', currentUser.uid), {
        friends: updatedMyFriends
      });

      // 2. Mark friend request as ACCEPTED in /friendRequests
      if (req.id) {
        await updateDoc(doc(db, 'friendRequests', req.id), {
          status: 'ACCEPTED'
        });
      }

      showToast(`🎉 أصبحت أنت والقبطان @${req.senderName} صديقين الآن!`, 'success');
    } catch (err: any) {
      console.error("Error accepting friend request:", err);
      showToast("حدث خطأ أثناء قبول الصداقة!", "error");
    }
  };

  const handleDeclineFriendRequest = async (req: any) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      setFriendRequests(prev => prev.filter(r => r.id !== req.id && r.senderId !== req.senderId));
      if (req.id) {
        await deleteDoc(doc(db, 'friendRequests', req.id));
      }
      showToast(`تم رفض طلب الصداقة من @${req.senderName}`, 'info');
    } catch (err: any) {
      console.error("Error declining friend request:", err);
    }
  };

  const handleSendGiftToFriend = async (friendPlayer: any) => {
    if (gold < 500) {
      showToast("الذهب غير كافٍ لإرسال هدية الصداقة (تتطلب 500 ذهب)!", "error");
      return;
    }
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    const friendId = friendPlayer.userId || friendPlayer.id;
    if (!friendId) return;

    try {
      setGold(prev => Math.max(0, prev - 500));
      await updateDoc(doc(db, 'users', currentUser.uid), {
        gold: Math.max(0, gold - 500)
      });

      // Secure collection-based dispatch to /harborEvents
      await createHarborEvent(friendId, 'GIFT', {
        amount: 500,
        senderName: username
      });

      sendSecureChatMessage(
        'هدية الصداقة 🎁',
        '🎁',
        `🎁 أرسل القبطان @${username} هدية صيد قيمة تحتوي على 500 ذهب إلى صديقه القبطان @${friendPlayer.username}!`
      );

      showToast(`🎁 تم إرسال 500 ذهب بنجاح إلى القبطان @${friendPlayer.username}!`, 'success');
    } catch (err: any) {
      console.error("Error sending gift:", err);
      showToast("تعذر إرسال الهدية: " + (err.message || ''), "error");
    }
  };

  const handleCopyGameLink = () => {
    const gameUrl = window.location.href;
    navigator.clipboard.writeText(gameUrl).then(() => {
      alert("🔗 تم نسخ رابط اللعبة بنجاح!\n\nشارك الرابط مع أصدقائك في أي دولة ليدخلوا اللعبة ويلتقوا بك في الميناء والدردشة والتحدي المباشر! 🏴‍☠️");
    }).catch(() => {
      alert(`رابط اللعبة هو:\n${gameUrl}`);
    });
  };

  // --- Update Quest Progress ---
  const updateQuestProgress = (id: string, amount: number) => {
    setQuests(prev => prev.map(q => {
      if (q.id === id && !q.completed) {
        const nextProgress = Math.min(q.progress + amount, q.max);
        return {
          ...q,
          progress: nextProgress,
          completed: nextProgress >= q.max
        };
      }
      return q;
    }));
  };

  // --- Claim Quest Rewards ---
  const claimQuestReward = (qId: string, rGold: number, rGems: number) => {
    setQuests(prev => prev.map(q => q.id === qId ? { ...q, claimed: true } : q));
    setGold(prev => prev + rGold);
    setGems(prev => prev + rGems);
    alert(`تهانينا! حصلت على ${rGold} ذهب و ${rGems} جواهر.`);
  };

  // --- Send Chat Message ---
  const sendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const msgText = chatInput.trim();
    if (!msgText) return;

    const currentUser = auth.currentUser;
    if (!currentUser) {
      showToast('يجب تسجيل الدخول لإرسال رسائل في الدردشة العالمية', 'error');
      return;
    }

    const currentUid = currentUser.uid;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    // 1. Optimistic instant UI update: display message right away for sender
    const tempId = 'temp_' + Date.now();
    const optimisticMsg: ChatMessage = {
      id: tempId,
      sender: username || 'القبطان',
      senderId: currentUid,
      avatar: avatar || '⚓',
      text: msgText,
      time: timeStr,
      userId: currentUid,
      createdAt: now.toISOString(),
      isMe: true
    };
    setChatMessages(prev => [...prev, optimisticMsg]);
    setChatInput('');

    // 2. Persist to Firestore for all players
    try {
      await addDoc(collection(db, 'chats'), {
        sender: username || 'القبطان',
        senderId: currentUid,
        avatar: avatar || '⚓',
        text: msgText,
        time: timeStr,
        userId: currentUid,
        createdAt: now.toISOString()
      });
    } catch (err: any) {
      console.error("Error sending message to Firestore:", err);
      showToast('⚠️ تعذر إرسال الرسالة إلى السيرفر: ' + (err.message || 'مشكلة في الاتصال'), 'error');
    }
  };

  // --- Calculate User Rank based on Gold ---
  const getUserRank = () => {
    const currentUser = auth.currentUser;
    if (!currentUser || realPlayers.length === 0) return 'جاري الحساب...';
    const index = realPlayers.findIndex(p => p.userId === currentUser.uid);
    if (index === -1) return 'جاري الحساب...';
    const rank = index + 1;
    if (rank === 1) return 'الأول 🥇';
    if (rank === 2) return 'الثاني 🥈';
    if (rank === 3) return 'الثالث 🥉';
    return `الترتيب ${rank}`;
  };

  // --- Handle Battle Complete ---
  const handleBattleEnd = (report: BattleReport) => {
    setBattleReports(prev => [report, ...prev]);
    const addedExp = crewServices.guide ? report.expGained * 2 : report.expGained;
    setExp(prev => prev + addedExp);
    updateQuestProgress('q1', 1);
    if (!report.isVictory) {
      setPortDestroyed(true);
    }
  };

  if (loadingFirebase) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        background: '#0b1329',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontFamily: '"Cairo", sans-serif'
      }}>
        <div style={{
          border: '4px solid rgba(250, 204, 21, 0.1)',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          borderLeftColor: '#facc15',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }}></div>
        <p>جاري تحميل أسطولك من السحابة...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // --- Render Impassable Modal If Session Was Terminated by Another Device ---
  if (sessionTerminationNotice) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 5, 8, 0.96)',
        backdropFilter: 'blur(12px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        direction: 'rtl',
        fontFamily: '"Cairo", sans-serif'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '520px',
          background: 'linear-gradient(145deg, #181118, #0d0a10)',
          border: '2px solid #ef4444',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.35), 0 0 40px rgba(239, 68, 68, 0.2)',
          padding: '28px 24px',
          color: '#f8fafc',
          textAlign: 'center'
        }}>
          <div style={{
            width: '76px',
            height: '76px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '2px solid #ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px',
            margin: '0 auto 18px',
            boxShadow: '0 0 25px rgba(239, 68, 68, 0.4)'
          }}>
            🔒
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#fca5a5', margin: '0 0 10px' }}>
            تم إنهاء الجلسة تلقائياً
          </h2>

          <p style={{ fontSize: '14px', lineHeight: '1.7', color: '#cbd5e1', margin: '0 0 20px' }}>
            تم تسجيل الدخول إلى هذا الحساب من جهاز أو متصفح آخر. للحفاظ على أمان بياناتك وتقدمك في اللعبة ومنع تضارب البيانات، لا يُسمح بتشغيل نفس الحساب في وقت واحد على جهازين.
          </p>

          <div style={{
            background: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '14px 16px',
            textAlign: 'right',
            margin: '0 0 24px',
            fontSize: '13px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#94a3b8' }}>الجهاز النشط الجديد:</span>
              <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{sessionTerminationNotice.newDevice}</span>
            </div>
            {sessionTerminationNotice.lastLoginAt && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#94a3b8' }}>وقت تسجيل الدخول:</span>
                <span style={{ color: '#facc15' }}>
                  {new Date(sessionTerminationNotice.lastLoginAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#94a3b8' }}>حالة هذه الجلسة:</span>
              <span style={{ color: '#f87171', fontWeight: 'bold' }}>منتهية ومحظورة من تنفيذ أي عمليات</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={handleRecoverSessionFromThisDevice}
              disabled={isRecoveringSession}
              style={{
                width: '100%',
                padding: '13px 20px',
                background: isRecoveringSession 
                  ? 'linear-gradient(135deg, #713f12, #854d0e)' 
                  : 'linear-gradient(135deg, #e11d48, #be123c)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 'bold',
                cursor: isRecoveringSession ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 15px rgba(225, 29, 72, 0.4)',
                transition: 'transform 0.15s, filter 0.15s',
                opacity: isRecoveringSession ? 0.8 : 1
              }}
              onMouseEnter={(e) => { if (!isRecoveringSession) e.currentTarget.style.filter = 'brightness(1.1)'; }}
              onMouseLeave={(e) => { if (!isRecoveringSession) e.currentTarget.style.filter = 'brightness(1)'; }}
            >
              {isRecoveringSession ? '⏳ جاري استعادة الجلسة ومزامنة الأسطول...' : '🔄 استعادة الجلسة وتسجيل الدخول من هذا الجهاز'}
            </button>

            <button
              onClick={async () => {
                setSessionTerminationNotice(null);
                isSessionTerminated.current = false;
                setIsLoggedIn(false);
                setAuthScreen('landing');
                try {
                  await auth.signOut();
                } catch (e) {}
              }}
              style={{
                width: '100%',
                padding: '11px 18px',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#94a3b8',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              العودة للشاشة الرئيسية
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    const handleSelectAccount = (name: string, email: string) => {
      let selectedAvatar = '⚓';
      if (email.toLowerCase().includes('neyaz')) {
        selectedAvatar = '🧔';
      } else if (email.toLowerCase().includes('aseel')) {
        selectedAvatar = '🐙';
      } else if (email.toLowerCase().includes('nyaz')) {
        selectedAvatar = '⚔️';
      }
      handleLoginSuccess(name, selectedAvatar, 'سيرفر الأسطورة 1', 'صياد البحار');
    };

    if (authScreen === 'landing') {
      return (
        <LandingScreen
          onStartFree={() => setAuthScreen('register')}
          onLogin={() => setAuthScreen('login')}
        />
      );
    }

    if (authScreen === 'login') {
      return (
        <SigninScreen
          onSuccess={handleSelectAccount}
          onNavigateToRegister={() => setAuthScreen('register')}
          onNavigateToLanding={() => setAuthScreen('landing')}
        />
      );
    }

    if (authScreen === 'register') {
      return (
        <RegisterScreen
          onSuccess={handleSelectAccount}
          onNavigateToLogin={() => setAuthScreen('login')}
          onNavigateToLanding={() => setAuthScreen('landing')}
        />
      );
    }
  }

  return (
    <div style={{ margin: 0, background: '#080604', overflow: 'hidden', width: '100vw', minWidth: '1024px', height: '100dvh', position: 'relative' }}>
      <style>{`
        :root {
            --ship-render-width: 290px;
            --bottom-nav-height: 180px;
            --overlay-top: 85px;
            --overlay-bottom: 180px;
            --overlay-left: 2.5%;
            --overlay-width: 95%;
            --overlay-radius: 16px;
            --overlay-border: 4px solid #ca8a04;
            --shop-border-width: 8px;
            --shop-flex-direction: row;
            --shop-sidebar-width: 230px;
            --shop-sidebar-direction: column;
            --shop-sidebar-border-right: 2px solid #5c3a21;
            --shop-sidebar-border-bottom: none;
            --shop-sidebar-overflow-x: visible;
            --shop-sidebar-padding: 14px;
            --shop-item-min-width: 260px;
            --shop-max-height: 92vh;
            --grid-columns: 1fr 1fr;
        }

        /* وضع مصمم الكمبيوتر الدائم (Always Desktop Site Mode) - تكبير النصوص والأيقونات بنسبة 40% */

        #harbor-viewport { 
            position: fixed; 
            top: 0;
            left: 0;
            width: 100vw; 
            min-width: 1024px;
            height: calc(100vh - var(--bottom-nav-height)); 
            height: calc(100dvh - var(--bottom-nav-height)); 
            z-index: 1;
            background: #080604;
            overflow: hidden;
        }

        #map-canvas { 
            position: absolute; 
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            background-image: url('https://drive.google.com/thumbnail?id=1yxJhSwIyEV7b1X9Pe6k5Bdw_qXV6AibT&sz=w1600');
            background-position: center bottom;
            background-size: 100% 100%;
            background-repeat: no-repeat;
        }

        .building-hotspot {
            position: absolute;
            cursor: pointer;
            z-index: 5;
            transition: transform 0.2s ease, filter 0.2s ease;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .building-hotspot:hover {
            transform: scale(1.1);
            filter: drop-shadow(0 0 10px rgba(254, 240, 138, 0.8));
        }
        .building-label {
            background: rgba(30, 15, 5, 0.98);
            border: 5px solid #ca8a04;
            color: #fef08a;
            border-radius: 24px;
            padding: 18px 42px;
            font-size: 38px;
            font-weight: 1000;
            white-space: nowrap;
            box-shadow: 0 8px 24px rgba(0,0,0,0.95);
            display: flex;
            align-items: center;
            gap: 18px;
            direction: rtl;
            text-shadow: 0 2px 5px #000;
        }
        .building-icon {
            font-size: 100px;
            filter: drop-shadow(0 5px 10px rgba(0,0,0,0.75));
            margin-bottom: 6px;
        }

        .top-bar { position: fixed; top: 18px; width: 95%; left: 2.5%; display: flex; justify-content: space-between; z-index: 15; }
        .resource-box { background: rgba(40, 30, 20, 0.94); border: 4px solid #ca8a04; padding: 20px 38px; border-radius: 24px; display: flex; flex-direction: column; align-items: center; min-width: 270px; color: #fff; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 8px 24px rgba(0,0,0,0.8); }
        .resource-box:hover { background: rgba(55, 40, 30, 0.98); transform: scale(1.05); }
        .res-icon { width: 115px; height: 115px; }
        .res-label { font-size: 38px; border-top: 3px solid #5d4037; padding-top: 10px; margin-top: 10px; width: 100%; text-align: center; font-weight: 900; color: #fef08a; text-shadow: 0 2px 4px rgba(0,0,0,0.9); }

        .ship { 
            position: absolute; 
            width: var(--ship-render-width); 
            z-index: 2; 
            cursor: pointer; 
            transition: left 2s ease-in-out, top 2s ease-in-out, transform 0.5s ease-in-out; 
            filter: drop-shadow(0 8px 6px rgba(0,0,0,0.5));
            will-change: left, top, transform;
            transform: translate3d(0, 0, 0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
        }

        /* Continuous realistic swaying for ALL ships */
        .ship-inner {
            animation: ship-float-real 6s infinite ease-in-out;
            transform-origin: bottom center;
            will-change: transform;
            transform: translate3d(0, 0, 0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
        }

        /* Staggered delay for each ship so they don't sway perfectly in sync */
        .ship:nth-of-type(1) .ship-inner { animation-delay: 0s; animation-duration: 5.5s; }
        .ship:nth-of-type(2) .ship-inner { animation-delay: -1.5s; animation-duration: 6.2s; }
        .ship:nth-of-type(3) .ship-inner { animation-delay: -3.2s; animation-duration: 4.8s; }
        .ship:nth-of-type(4) .ship-inner { animation-delay: -4.5s; animation-duration: 5.8s; }

        @keyframes ship-float-real {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-5px) rotate(1.2deg); }
        }

        /* Moving ships sway slightly faster with larger amplitude */
        .ship.moving .ship-inner {
            animation: ship-float-fast-real 2.8s infinite ease-in-out;
        }

        @keyframes ship-float-fast-real {
            0%, 100% { transform: translateY(0) rotate(-1.5deg); }
            50% { transform: translateY(-7px) rotate(2deg); }
        }

        /* Ship wake ripple behind moving ships */
        .ship-wake {
            position: absolute;
            bottom: -6px;
            left: 50%;
            transform: translateX(-50%);
            width: 90px;
            height: 24px;
            background: radial-gradient(ellipse at center, rgba(34, 211, 238, 0.45) 0%, rgba(34, 211, 238, 0.15) 40%, transparent 75%);
            border-radius: 50%;
            animation: wake-pulse-real 1.2s infinite ease-out;
            z-index: -1;
            pointer-events: none;
        }

        @keyframes wake-pulse-real {
            0% { transform: translateX(-50%) scale(0.7); opacity: 0.9; }
            100% { transform: translateX(-50%) scale(1.5); opacity: 0; }
        }

        /* Underwater drag and sway animation for the fishing nets */
        @keyframes net-sway-anim {
            0%, 100% { transform: translateX(-50%) rotate(-4deg) scaleY(1); opacity: 0.95; }
            50% { transform: translateX(-50%) rotate(4deg) scaleY(0.95) skewX(2deg); opacity: 0.85; }
        }
        .fishing-net-animation {
            animation: net-sway-anim 4.5s infinite ease-in-out;
            transform-origin: top center;
            transition: opacity 0.5s ease-in-out;
        }

        /* High-quality Isolated Sea Overlay with real waving effect */
        .sea-isolated-overlay {
            position: absolute;
            top: -4px;
            left: -12px;
            width: calc(100% + 24px);
            height: calc(100% + 8px);
            background-image: url('https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/4eee85b9-7879-468c-a3d9-320c60432771.png');
            background-position: center bottom;
            background-size: 100% 100%;
            background-repeat: no-repeat;
            pointer-events: none;
            z-index: 1;
            filter: url(#water-filter);
            animation: sea-waves-shake 14s infinite alternate ease-in-out;
            will-change: transform;
        }

        @keyframes sea-waves-shake {
            0% {
                transform: translate3d(-3px, -1px, 0) scaleX(1.005) scaleY(1.005) rotate(-0.1deg);
            }
            50% {
                transform: translate3d(4px, 1.5px, 0) scaleX(1.015) scaleY(1.01) rotate(0.1deg);
            }
            100% {
                transform: translate3d(-2px, 2px, 0) scaleX(0.995) scaleY(1.005) rotate(-0.05deg);
            }
        }

        /* Dynamic Weather System Effects */
        .weather-rain-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 15;
            background-image: repeating-linear-gradient(110deg, rgba(14, 116, 144, 0.12) 0px, rgba(14, 116, 144, 0.12) 1.5px, transparent 1.5px, transparent 35px),
                              repeating-linear-gradient(110deg, rgba(255, 255, 255, 0.08) 0px, rgba(255, 255, 255, 0.08) 1px, transparent 1px, transparent 45px);
            animation: rain-fall 0.6s linear infinite;
        }

        @keyframes rain-fall {
            0% { background-position: 0px 0px; }
            100% { background-position: 120px 800px; }
        }

        .rain-streak {
            position: absolute;
            top: -100px;
            background: linear-gradient(transparent, rgba(165, 243, 252, 0.45));
            width: 1px;
            height: 50px;
            pointer-events: none;
            animation: rain-fall-streak 0.7s linear infinite;
        }

        @keyframes rain-fall-streak {
            0% {
                transform: translateY(0) translateX(0) rotate(15deg);
                opacity: 0;
            }
            10% {
                opacity: 0.6;
            }
            90% {
                opacity: 0.6;
            }
            100% {
                transform: translateY(110vh) translateX(180px) rotate(15deg);
                opacity: 0;
            }
        }

        .weather-fog-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 15;
            background: rgba(224, 242, 254, 0.12);
            backdrop-filter: blur(0.6px);
            mix-blend-mode: overlay;
            animation: fog-pulse 10s ease-in-out infinite alternate;
        }

        @keyframes fog-pulse {
            0% { opacity: 0.5; }
            100% { opacity: 0.9; }
        }

        .fog-cloud {
            position: absolute;
            background: radial-gradient(circle, rgba(241, 245, 249, 0.38) 0%, rgba(241, 245, 249, 0.12) 50%, transparent 75%);
            width: 650px;
            height: 450px;
            filter: blur(30px);
            pointer-events: none;
            z-index: 16;
            opacity: 0.7;
            animation: fog-drift 35s linear infinite;
        }

        .fog-cloud-1 {
            top: 15%;
            left: -300px;
            animation-duration: 40s;
        }

        .fog-cloud-2 {
            top: 45%;
            left: -400px;
            animation-duration: 50s;
            animation-delay: -12s;
        }

        .fog-cloud-3 {
            top: 75%;
            left: -200px;
            animation-duration: 45s;
            animation-delay: -22s;
        }

        @keyframes fog-drift {
            0% { transform: translateX(-650px); }
            100% { transform: translateX(110vw); }
        }

        .weather-storm-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 15;
            background: rgba(15, 23, 42, 0.35);
            mix-blend-mode: multiply;
        }

        .weather-lightning-flash {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 25;
            background: #ffffff;
            opacity: 0;
        }

        .lightning-strike-anim {
            animation: lightning-strike 0.4s ease-out;
        }

        @keyframes lightning-strike {
            0% { opacity: 0; }
            10% { opacity: 0.8; }
            15% { opacity: 0.25; }
            20% { opacity: 0.9; }
            25% { opacity: 0.1; }
            30% { opacity: 0.75; }
            45% { opacity: 0; }
            100% { opacity: 0; }
        }

        @keyframes fade-in-slide-down {
            0% { opacity: 0; transform: translate(-50%, -20px); }
            100% { opacity: 1; transform: translate(-50%, 0); }
        }

        /* High-quality Real Sea & Animated Waves Overlay */
        .sea-waves-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            overflow: hidden;
            z-index: 2;
        }

        /* Gentle rolling wave lines on the water surface */
        .sea-wave-crest {
            position: absolute;
            background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.35) 40%, rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0.3) 60%, transparent);
            border-top: 1.5px solid rgba(255, 255, 255, 0.7);
            border-radius: 50%;
            height: 12px;
            filter: blur(1px);
            pointer-events: none;
            z-index: 2;
            opacity: 0;
            box-shadow: 0 -2px 6px rgba(255, 255, 255, 0.2);
        }

        .wave-crest-1 {
            width: 150px;
            left: 60%;
            top: 48%;
            animation: wave-roll 7s infinite ease-in-out;
        }
        .wave-crest-2 {
            width: 200px;
            left: 52%;
            top: 62%;
            animation: wave-roll 9s infinite ease-in-out;
            animation-delay: 2s;
        }
        .wave-crest-3 {
            width: 170px;
            left: 68%;
            top: 76%;
            animation: wave-roll 8s infinite ease-in-out;
            animation-delay: 4.5s;
        }
        .wave-crest-4 {
            width: 220px;
            left: 45%;
            top: 55%;
            animation: wave-roll 10s infinite ease-in-out;
            animation-delay: 1s;
        }
        .wave-crest-5 {
            width: 160px;
            left: 58%;
            top: 86%;
            animation: wave-roll 7.5s infinite ease-in-out;
            animation-delay: 3s;
        }

        @keyframes wave-roll {
            0% {
                transform: translate3d(30px, -15px, 0) scaleX(0.7) scaleY(0.4);
                opacity: 0;
            }
            30% {
                opacity: 0.7;
            }
            70% {
                opacity: 0.5;
            }
            100% {
                transform: translate3d(-45px, 22px, 0) scaleX(1.2) scaleY(1.3);
                opacity: 0;
            }
        }

        /* Ambient water shimmer covering the water area on map */
        .water-shimmer {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
                radial-gradient(circle at 55% 45%, rgba(253, 224, 71, 0.14) 0%, transparent 45%),
                radial-gradient(circle at 30% 40%, rgba(14, 116, 144, 0.15) 0%, transparent 60%),
                radial-gradient(circle at 75% 55%, rgba(8, 145, 178, 0.12) 0%, transparent 50%);
            mix-blend-mode: screen;
            animation: water-shimmer-anim-real 12s infinite alternate ease-in-out;
            pointer-events: none;
            z-index: 2;
            will-change: transform, opacity;
            transform: translate3d(0, 0, 0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
        }

        @keyframes water-shimmer-anim-real {
            0% { opacity: 0.4; transform: translate3d(0, 0, 0) scale(1); }
            100% { opacity: 0.9; transform: translate3d(2px, -3px, 0) scale(1.04); }
        }

        /* Sunset Sun Sparkles that dynamically glint along the light path */
        .sun-sparkle {
            position: absolute;
            background: #fff;
            border-radius: 50%;
            box-shadow: 0 0 10px 3px rgba(253, 224, 71, 0.95), 0 0 4px 1px #fff;
            mix-blend-mode: screen;
            opacity: 0;
            pointer-events: none;
            z-index: 3;
            animation: sparkle-glow infinite ease-in-out;
        }

        @keyframes sparkle-glow {
            0%, 100% { opacity: 0; transform: scale(0.3) rotate(0deg); }
            50% { opacity: 0.95; transform: scale(1.15) rotate(180deg); }
        }

        /* Additional random floating wave ripples on the map to give life to other parts of the water */
        .floating-ripple-1 {
            position: absolute;
            left: 20%;
            top: 40%;
            width: 140px;
            height: 35px;
            opacity: 0.28;
            background: radial-gradient(ellipse at center, rgba(34, 211, 238, 0.35) 0%, transparent 70%);
            border-radius: 50%;
            animation: ripple-swell-real 4s infinite ease-in-out;
            z-index: 2;
        }

        .floating-ripple-2 {
            position: absolute;
            right: 25%;
            top: 35%;
            width: 200px;
            height: 45px;
            opacity: 0.22;
            background: radial-gradient(ellipse at center, rgba(34, 211, 238, 0.3) 0%, transparent 70%);
            border-radius: 50%;
            animation: ripple-swell-real 5s infinite ease-in-out -1.5s;
            z-index: 2;
        }

        .floating-ripple-3 {
            position: absolute;
            left: 55%;
            top: 60%;
            width: 160px;
            height: 38px;
            opacity: 0.25;
            background: radial-gradient(ellipse at center, rgba(34, 211, 238, 0.32) 0%, transparent 70%);
            border-radius: 50%;
            animation: ripple-swell-real 4.5s infinite ease-in-out -3s;
            z-index: 2;
        }

        @keyframes ripple-swell-real {
            0%, 100% { transform: scale(0.85) translateY(0); opacity: 0.15; }
            50% { transform: scale(1.15) translateY(-3px); opacity: 0.38; }
        }

        /* Clouds floating in the sky */
        .sky-cloud {
            position: absolute;
            pointer-events: none;
            z-index: 2;
            filter: drop-shadow(0 4px 10px rgba(0,0,0,0.15)) blur(0.5px);
            mix-blend-mode: color-dodge;
            will-change: transform;
            transform: translate3d(0, 0, 0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
        }
        .sky-cloud-1 {
            top: 2%;
            left: -200px;
            width: 160px;
            height: auto;
            opacity: 0.38;
            animation: float-cloud 110s linear infinite;
        }
        .sky-cloud-2 {
            top: 6%;
            left: -200px;
            width: 220px;
            height: auto;
            opacity: 0.28;
            animation: float-cloud 160s linear infinite;
            animation-delay: -35s;
        }
        .sky-cloud-3 {
            top: 13%;
            left: -200px;
            width: 140px;
            height: auto;
            opacity: 0.42;
            animation: float-cloud 85s linear infinite;
            animation-delay: -10s;
        }
        @keyframes float-cloud {
            0% { transform: translateX(-200px); }
            100% { transform: translateX(calc(100vw + 350px)); }
        }

        /* Seagulls flying in the sky */
        .seagull-container {
            position: absolute;
            width: 36px;
            height: 16px;
            pointer-events: none;
            z-index: 6;
            will-change: transform;
            transform: translate3d(0, 0, 0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
        }
        .seagull-1 {
            top: 5%;
            left: -100px;
            animation: fly-r 24s linear infinite;
        }
        .seagull-2 {
            top: 10%;
            left: -100px;
            animation: fly-r 30s linear infinite;
            animation-delay: -9s;
        }
        .seagull-3 {
            top: 3%;
            right: -100px;
            animation: fly-l 27s linear infinite;
            animation-delay: -14s;
        }
        @keyframes fly-r {
            0% { transform: translate3d(-100px, 0, 0) scale(0.6); }
            50% { transform: translate3d(50vw, -20px, 0) scale(0.68); }
            100% { transform: translate3d(calc(100vw + 100px), 10px, 0) scale(0.6); }
        }
        @keyframes fly-l {
            0% { transform: translate3d(100px, 0, 0) scale(0.55) scaleX(-1); }
            50% { transform: translate3d(-50vw, 25px, 0) scale(0.5) scaleX(-1); }
            100% { transform: translate3d(calc(-100vw - 100px), -10px, 0) scale(0.55) scaleX(-1); }
        }
        .left-wing {
            transform-origin: 12px 5px;
            animation: flap-l 0.5s ease-in-out infinite alternate;
            will-change: transform;
        }
        .right-wing {
            transform-origin: 12px 5px;
            animation: flap-r 0.5s ease-in-out infinite alternate;
            will-change: transform;
        }
        @keyframes flap-l {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(-35deg); }
        }
        @keyframes flap-r {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(35deg); }
        }

        /* Waves washing ashore (foam effect on the beach) */
        .shore-wave-layer {
            position: absolute;
            top: 25%;
            left: -5%;
            width: 35%;
            height: 60%;
            pointer-events: none;
            z-index: 2;
            mix-blend-mode: screen;
            opacity: 0;
            transform-origin: left bottom;
            animation: shore-wash 5s infinite ease-in-out;
            will-change: transform, opacity;
            transform: translate3d(0, 0, 0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
        }
        .shore-wave-layer-2 {
            animation-delay: 2.5s;
        }
        @keyframes shore-wash {
            0% {
                transform: scale(0.96) translate(4px, -4px);
                opacity: 0;
            }
            25% {
                opacity: 0.65;
            }
            55% {
                transform: scale(1.025) translate(-10px, 10px);
                opacity: 0.25;
            }
            100% {
                transform: scale(1.045) translate(-15px, 15px);
                opacity: 0;
            }
        }

        /* Jumping dolphins/orcas */
        .dolphin-wrapper {
            position: absolute;
            pointer-events: none;
            z-index: 3;
            width: 240px;
            height: 120px;
            will-change: transform, opacity;
            transform: translate3d(0, 0, 0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
        }
        .dolphin-1 {
            animation-name: whale-swim-8s;
            animation-duration: 8s;
            animation-iteration-count: infinite;
            animation-timing-function: linear;
            animation-delay: 0s;
        }
        .dolphin-4 {
            animation-name: whale-swim-8s-follower;
            animation-duration: 8s;
            animation-iteration-count: infinite;
            animation-timing-function: linear;
            animation-delay: 0.3s;
        }
        .dolphin-2 {
            animation-name: whale-swim-10s;
            animation-duration: 10s;
            animation-iteration-count: infinite;
            animation-timing-function: linear;
            animation-delay: -3s;
        }
        .dolphin-5 {
            animation-name: whale-swim-10s-follower;
            animation-duration: 10s;
            animation-iteration-count: infinite;
            animation-timing-function: linear;
            animation-delay: -2.7s;
        }
        .dolphin-3 {
            animation-name: whale-swim-12s;
            animation-duration: 12s;
            animation-iteration-count: infinite;
            animation-timing-function: linear;
            animation-delay: -6s;
        }
        .dolphin-6 {
            animation-name: whale-swim-12s-follower;
            animation-duration: 12s;
            animation-iteration-count: infinite;
            animation-timing-function: linear;
            animation-delay: -5.7s;
        }

        .dolphin-graphic {
            position: absolute;
            width: 180px;
            height: 90px;
            transform-origin: center center;
            filter: drop-shadow(0 6px 12px rgba(3, 40, 58, 0.55));
            mix-blend-mode: normal;
            opacity: 0.95;
        }

        /* Splash effects synchronized with leap cycles */
        .splash-start, .splash-end {
            position: absolute;
            pointer-events: none;
            width: 50px;
            height: 20px;
        }
        .splash-start {
            left: -10px;
            top: 55px;
        }
        .splash-end {
            left: 190px;
            top: 55px;
        }

        .splash-ring {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            border: 2px solid rgba(255, 255, 255, 0.95);
            border-radius: 50%;
            transform: scale(0.1);
            opacity: 0;
            box-shadow: 0 0 8px rgba(255, 255, 255, 0.4);
        }
        .splash-foam {
            position: absolute;
            left: 5%;
            top: 5%;
            width: 90%;
            height: 90%;
            background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.4) 40%, transparent 75%);
            border-radius: 50%;
            transform: scale(0.1);
            opacity: 0;
        }
        .splash-droplet {
            position: absolute;
            background: #ffffff;
            border-radius: 50%;
            width: 3px;
            height: 3px;
            opacity: 0;
            box-shadow: 0 0 3px #fff;
        }

        /* Hide leap splashes completely for realistic and sleek swimming motion */
        .splash-start, .splash-end {
            display: none !important;
        }

        /* Continuous majestic underwater-surface swimming, tilting, and swaying for Humpback Whales (8s cycle) */
        @keyframes whale-swim-8s {
            0% {
                opacity: 0.25;
                transform: translate3d(-60px, 15px, 0) rotate(-4deg) scale(1.15) skewY(-2.5deg);
                filter: blur(1.5px) brightness(0.65);
            }
            20% {
                opacity: 0.95;
                transform: translate3d(20px, -5px, 0) rotate(3deg) scale(1.15) skewY(1.5deg);
                filter: blur(0px) brightness(1.05);
            }
            40% {
                opacity: 0.35;
                transform: translate3d(100px, 10px, 0) rotate(-3deg) scale(1.15) skewY(-1.5deg);
                filter: blur(1.8px) brightness(0.55);
            }
            60% {
                opacity: 0.95;
                transform: translate3d(180px, -4px, 0) rotate(3deg) scale(1.15) skewY(1.8deg);
                filter: blur(0px) brightness(1.05);
            }
            80% {
                opacity: 0.3;
                transform: translate3d(260px, 12px, 0) rotate(-4deg) scale(1.15) skewY(-2deg);
                filter: blur(2px) brightness(0.5);
            }
            100% {
                opacity: 0;
                transform: translate3d(340px, 2px, 0) rotate(2deg) scale(1.15) skewY(1deg);
                filter: blur(1px) brightness(0.7);
            }
        }
        @keyframes whale-swim-8s-follower {
            0% {
                opacity: 0.2;
                transform: translate3d(-80px, 20px, 0) rotate(-4deg) scale(0.85) skewY(-2.5deg);
                filter: blur(1.8px) brightness(0.6);
            }
            20% {
                opacity: 0.9;
                transform: translate3d(0px, 0px, 0) rotate(3deg) scale(0.85) skewY(1.5deg);
                filter: blur(0px) brightness(1.05);
            }
            40% {
                opacity: 0.3;
                transform: translate3d(80px, 15px, 0) rotate(-3deg) scale(0.85) skewY(-1.5deg);
                filter: blur(2px) brightness(0.5);
            }
            60% {
                opacity: 0.9;
                transform: translate3d(160px, 1px, 0) rotate(3deg) scale(0.85) skewY(1.8deg);
                filter: blur(0px) brightness(1.05);
            }
            80% {
                opacity: 0.25;
                transform: translate3d(240px, 17px, 0) rotate(-4deg) scale(0.85) skewY(-2deg);
                filter: blur(2.2px) brightness(0.45);
            }
            100% {
                opacity: 0;
                transform: translate3d(320px, 7px, 0) rotate(2deg) scale(0.85) skewY(1deg);
                filter: blur(1.2px) brightness(0.65);
            }
        }

        /* Continuous majestic underwater-surface swimming, tilting, and swaying for Humpback Whales (10s cycle) */
        @keyframes whale-swim-10s {
            0% {
                opacity: 0.25;
                transform: translate3d(-50px, 10px, 0) rotate(-3deg) scale(1.15) skewY(-1.8deg);
                filter: blur(1.5px) brightness(0.65);
            }
            20% {
                opacity: 0.9;
                transform: translate3d(30px, -4px, 0) rotate(3deg) scale(1.15) skewY(1.5deg);
                filter: blur(0px) brightness(1.05);
            }
            40% {
                opacity: 0.35;
                transform: translate3d(110px, 8px, 0) rotate(-4deg) scale(1.15) skewY(-2deg);
                filter: blur(1.7px) brightness(0.55);
            }
            60% {
                opacity: 0.95;
                transform: translate3d(190px, -3px, 0) rotate(2deg) scale(1.15) skewY(1deg);
                filter: blur(0px) brightness(1.05);
            }
            80% {
                opacity: 0.3;
                transform: translate3d(270px, 10px, 0) rotate(-3deg) scale(1.15) skewY(-1.5deg);
                filter: blur(2px) brightness(0.5);
            }
            100% {
                opacity: 0;
                transform: translate3d(350px, 0px, 0) rotate(3deg) scale(1.15) skewY(1.5deg);
                filter: blur(1.2px) brightness(0.7);
            }
        }
        @keyframes whale-swim-10s-follower {
            0% {
                opacity: 0.2;
                transform: translate3d(-75px, 15px, 0) rotate(-3deg) scale(0.9) skewY(-1.8deg);
                filter: blur(1.8px) brightness(0.6);
            }
            20% {
                opacity: 0.85;
                transform: translate3d(5px, 0px, 0) rotate(3deg) scale(0.9) skewY(1.5deg);
                filter: blur(0px) brightness(1.05);
            }
            40% {
                opacity: 0.3;
                transform: translate3d(85px, 13px, 0) rotate(-4deg) scale(0.9) skewY(-2deg);
                filter: blur(2px) brightness(0.5);
            }
            60% {
                opacity: 0.9;
                transform: translate3d(165px, 1px, 0) rotate(2deg) scale(0.9) skewY(1deg);
                filter: blur(0px) brightness(1.05);
            }
            80% {
                opacity: 0.25;
                transform: translate3d(245px, 15px, 0) rotate(-3deg) scale(0.9) skewY(-1.5deg);
                filter: blur(2.2px) brightness(0.45);
            }
            100% {
                opacity: 0;
                transform: translate3d(325px, 4px, 0) rotate(3deg) scale(0.9) skewY(1.5deg);
                filter: blur(1.4px) brightness(0.65);
            }
        }

        /* Continuous majestic underwater-surface swimming, tilting, and swaying for Humpback Whales (12s cycle) */
        @keyframes whale-swim-12s {
            0% {
                opacity: 0.25;
                transform: translate3d(-40px, 8px, 0) rotate(-2deg) scale(1.1) skewY(-1.5deg);
                filter: blur(1.5px) brightness(0.6);
            }
            25% {
                opacity: 0.95;
                transform: translate3d(50px, -5px, 0) rotate(3deg) scale(1.1) skewY(1.8deg);
                filter: blur(0px) brightness(1.05);
            }
            50% {
                opacity: 0.35;
                transform: translate3d(140px, 6px, 0) rotate(-3deg) scale(1.1) skewY(-2deg);
                filter: blur(1.8px) brightness(0.55);
            }
            75% {
                opacity: 0.9;
                transform: translate3d(230px, -2px, 0) rotate(2deg) scale(1.1) skewY(1deg);
                filter: blur(0px) brightness(1.05);
            }
            100% {
                opacity: 0;
                transform: translate3d(320px, 4px, 0) rotate(-2deg) scale(1.1) skewY(-1deg);
                filter: blur(1.2px) brightness(0.7);
            }
        }
        @keyframes whale-swim-12s-follower {
            0% {
                opacity: 0.2;
                transform: translate3d(-65px, 12px, 0) rotate(-2deg) scale(0.85) skewY(-1.5deg);
                filter: blur(1.8px) brightness(0.55);
            }
            25% {
                opacity: 0.9;
                transform: translate3d(25px, -1px, 0) rotate(3deg) scale(0.85) skewY(1.8deg);
                filter: blur(0px) brightness(1.05);
            }
            50% {
                opacity: 0.3;
                transform: translate3d(115px, 10px, 0) rotate(-3deg) scale(0.85) skewY(-2deg);
                filter: blur(2px) brightness(0.5);
            }
            75% {
                opacity: 0.85;
                transform: translate3d(205px, 2px, 0) rotate(2deg) scale(0.85) skewY(1deg);
                filter: blur(0px) brightness(1.05);
            }
            100% {
                opacity: 0;
                transform: translate3d(295px, 8px, 0) rotate(-2deg) scale(0.85) skewY(-1deg);
                filter: blur(1.4px) brightness(0.65);
            }
        }

        #ship-menu { position: absolute; display: none; background: rgba(20, 12, 6, 0.98); border: 4.5px solid #ca8a04; border-radius: 24px; padding: 22px; z-index: 25; flex-direction: row; gap: 22px; width: auto; box-shadow: 0 6px 25px rgba(0,0,0,0.9); }
        .menu-btn { display: flex; flex-direction: column; align-items: center; color: #fff; font-size: 32px; font-weight: bold; cursor: pointer; min-width: 135px; transition: transform 0.1s; }
        .menu-btn:hover { transform: scale(1.1); }
        .menu-icon { width: 98px; height: 98px; background: #854d0e; border-radius: 22px; margin-bottom: 12px; display: flex; align-items: center; justify-content: center; font-size: 50px; border: 4px solid #fef08a; }

        .modal { display: none; position: absolute; z-index: 100; left: 50%; top: 50%; transform: translate(-50%, -50%); background: #1c1917; border: 4px solid #ca8a04; padding: 32px; border-radius: 24px; color: #fff; text-align: center; width: 480px; box-shadow: 0 8px 28px rgba(0,0,0,0.85); font-size: 30px; }
        
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          width: 100%;
          height: 180px !important;
          background: url("https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/Aamaaq/refs/heads/main/background.jpg.png") center bottom/100% 100% no-repeat !important;
          border-top: 3.5px solid rgba(234, 179, 8, 0.8) !important;
          box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.95), inset 0 1px 0 rgba(254, 240, 138, 0.3) !important;
          display: flex !important;
          direction: ltr !important;
          align-items: center !important;
          justify-content: space-evenly !important;
          z-index: 100 !important;
          padding: 4px 10px 16px 10px !important;
          gap: 8px !important;
          overflow: visible !important;
          user-select: none !important;
          box-sizing: border-box !important;
        }

        .nav-item {
          flex: 1 1 0% !important;
          min-width: 0 !important;
          height: 100% !important;
          cursor: pointer !important;
          position: relative !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          overflow: visible !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        .nav-item::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 125px;
          height: 125px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(234, 179, 8, 0.22) 0%, rgba(202, 138, 4, 0.07) 50%, transparent 72%);
          pointer-events: none;
          transition: all 0.25s ease;
          z-index: 0;
        }

        .nav-item:hover::before {
          width: 140px;
          height: 140px;
          background: radial-gradient(circle, rgba(250, 204, 21, 0.42) 0%, rgba(202, 138, 4, 0.15) 55%, transparent 75%);
        }

        .nav-item.active::before {
          width: 145px;
          height: 145px;
          background: radial-gradient(circle, rgba(56, 189, 248, 0.48) 0%, rgba(14, 165, 233, 0.18) 55%, transparent 75%);
        }

        .nav-item img {
          position: relative !important;
          z-index: 1 !important;
          max-width: 100% !important;
          object-fit: contain !important;
          image-rendering: -webkit-optimize-contrast !important;
          image-rendering: high-quality !important;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 6px rgba(250, 204, 21, 0.45)) brightness(1.26) contrast(1.16) saturate(1.2) !important;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.2s ease !important;
          pointer-events: none !important;
        }

        /* 40% enlarged navigation icons */
        .nav-item-clan img {
          height: 160px !important;
          width: auto !important;
        }
        .nav-item-rank img {
          height: 140px !important;
          width: auto !important;
        }
        .nav-item-friends img {
          height: 140px !important;
          width: auto !important;
        }
        .nav-item-storage img {
          height: 140px !important;
          width: auto !important;
        }
        .nav-item-shop img {
          height: 140px !important;
          width: auto !important;
        }
        .nav-item-chat img {
          height: 170px !important;
          width: auto !important;
        }
        .nav-item-settings img {
          height: 175px !important;
          width: auto !important;
        }

        .nav-item:hover img {
          transform: translateY(-6px) !important;
          filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 12px rgba(250, 204, 21, 0.9)) brightness(1.38) contrast(1.2) saturate(1.25) !important;
        }

        .nav-item.active img {
          transform: translateY(-7px) !important;
          filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 16px rgba(56, 189, 248, 0.95)) drop-shadow(0 0 4px #ffffff) brightness(1.42) contrast(1.22) saturate(1.22) !important;
        }

        @keyframes pulseMedallion {
          0% { box-shadow: 0 0 10px #0284c7, inset 0 0 8px rgba(56, 189, 248, 0.5); }
          100% { box-shadow: 0 0 20px #38bdf8, inset 0 0 16px rgba(56, 189, 248, 0.9); }
        }

        .nav-item.active .plaque-btn {
          border-color: #38bdf8 !important;
          color: #38bdf8 !important;
          background: linear-gradient(180deg, #0284c7 0%, #075985 100%) !important;
          box-shadow: 0 0 12px rgba(56, 189, 248, 0.8) !important;
        }

        .medallion-box {
          position: relative;
          width: 82px;
          height: 82px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .medallion-ring {
          width: 78px;
          height: 78px;
          border-radius: 50%;
          border: 3.5px solid #ca8a04;
          background: radial-gradient(circle at 35% 30%, #1e293b 0%, #0f172a 60%, #020617 100%);
          box-shadow: 0 4px 12px rgba(0,0,0,0.85), inset 0 0 10px rgba(250, 204, 21, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: all 0.2s ease;
        }

        .jewel-top-diamond {
          position: absolute;
          top: -9px;
          left: 50%;
          transform: translateX(-50%);
          width: 11px;
          height: 11px;
          background: #38bdf8;
          clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
          box-shadow: 0 0 8px #38bdf8;
          border: 1.5px solid #e0f2fe;
          z-index: 2;
        }

        .jewel-bottom-diamond {
          position: absolute;
          bottom: -9px;
          left: 50%;
          transform: translateX(-50%);
          width: 11px;
          height: 11px;
          background: #38bdf8;
          clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
          box-shadow: 0 0 8px #38bdf8;
          border: 1.5px solid #e0f2fe;
          z-index: 2;
        }

        .plaque-btn {
          margin-top: 5px;
          width: 100%;
          max-width: 110px;
          padding: 4px 0;
          background: linear-gradient(180deg, #1f1912 0%, #0a0805 100%);
          border: 2.5px solid #ca8a04;
          border-radius: 8px;
          color: #fef08a;
          font-size: 21px;
          font-weight: 900;
          text-align: center;
          text-shadow: 0 2px 3px #000;
          box-shadow: 0 3px 6px rgba(0,0,0,0.85);
          white-space: nowrap;
          transition: all 0.2s ease;
        }

        .tab-overlay {
            position: fixed;
            top: var(--overlay-top);
            bottom: var(--overlay-bottom);
            left: var(--overlay-left);
            width: var(--overlay-width);
            background: rgba(15, 12, 9, 0.95);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: var(--overlay-border);
            border-radius: var(--overlay-radius);
            z-index: 20;
            color: #fff;
            padding: 26px;
            padding-bottom: calc(var(--bottom-nav-height) + 26px);
            overflow-y: auto;
            direction: rtl;
            box-shadow: 0 18px 40px rgba(0,0,0,0.92);
            box-sizing: border-box;
            font-size: 30px;
        }
        .tab-title {
            font-size: 44px;
            font-weight: 900;
            color: #facc15;
            text-align: center;
            border-bottom: 4px solid #ca8a04;
            padding-bottom: 16px;
            margin-bottom: 28px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            text-shadow: 0 3px 6px rgba(0,0,0,0.9);
        }
        .close-tab-btn {
            background: linear-gradient(180deg, #b91c1c 0%, #7f1d1d 100%);
            color: #fff;
            border: 2.5px solid #ef4444;
            border-radius: 14px;
            padding: 10px 28px;
            font-size: 29px;
            font-weight: 900;
            cursor: pointer;
            box-shadow: 0 3px 8px rgba(0,0,0,0.5);
            transition: all 0.15s ease;
        }
        .close-tab-btn:hover {
            background: #dc2626;
            transform: scale(1.05);
        }

        .grid-cards {
            display: grid;
            grid-template-columns: var(--grid-columns);
            gap: 22px;
        }
        .shop-card {
            background: rgba(30, 24, 18, 0.95);
            border: 2px solid #a16207;
            border-radius: 20px;
            padding: 24px;
            display: flex;
            align-items: center;
            gap: 22px;
            box-shadow: 0 6px 16px rgba(0,0,0,0.55);
            font-size: 28px;
        }
        .upgrade-btn {
            background: linear-gradient(180deg, #ca8a04 0%, #a16207 100%);
            color: #fff;
            border: 2px solid #fef08a;
            border-radius: 14px;
            padding: 15px 30px;
            font-size: 28px;
            cursor: pointer;
            font-weight: 900;
            text-shadow: 0 1px 2px #000;
            box-shadow: 0 3px 10px rgba(202,138,4,0.45);
            transition: all 0.2s;
        }
        .upgrade-btn:hover {
            background: #eab308;
            transform: scale(1.04);
        }
      `}</style>



      {/* ----------------- GAME BACKGROUND AND HARBOR VIEW ----------------- */}
      <div id="harbor-viewport">
        <div 
          id="map-canvas" 
          style={(() => {
            if (portDestroyed || bgTheme === 'destroyed') {
              return { 
                backgroundImage: `url('/backgrounds/destroyed_port.webp')`,
                backgroundSize: '100% 100%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              };
            }
            return { backgroundImage: `url('/backgrounds/harbor_main.webp')`, backgroundSize: '100% 100%' };
          })()}
        >
          {/* Apocalyptic Dark Fire & Smoke Atmosphere for Destroyed Port */}
          {portDestroyed && (
            <>
              <div 
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'radial-gradient(ellipse at center, rgba(239, 68, 68, 0.28) 0%, rgba(40, 15, 5, 0.65) 70%, rgba(15, 5, 0, 0.9) 100%)',
                  pointerEvents: 'none',
                  zIndex: 5,
                  mixBlendMode: 'multiply'
                }}
              />
              <div 
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '50%',
                  background: 'linear-gradient(to bottom, rgba(185, 28, 28, 0.45) 0%, rgba(239, 68, 68, 0.15) 70%, transparent 100%)',
                  pointerEvents: 'none',
                  zIndex: 6
                }}
              />
            </>
          )}

          {!portDestroyed && !disableAnimatedBackground && !powerSaver && (
            <>
              <video
                ref={videoRefA}
                src="/background_video.mp4"
                playsInline
                muted
                preload="auto"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  zIndex: activeVideo === 'A' ? 2 : 1,
                  pointerEvents: 'none',
                  opacity: (activeVideo === 'A' && !isTransitioning) ? 1 :
                           (activeVideo === 'A' && isTransitioning) ? 0 :
                           (activeVideo === 'B' && isTransitioning) ? 1 : 0,
                  transition: 'opacity 1.5s ease-in-out',
                }}
              />
              <video
                ref={videoRefB}
                src="/background_video.mp4"
                playsInline
                muted
                preload="auto"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  zIndex: activeVideo === 'B' ? 2 : 1,
                  pointerEvents: 'none',
                  opacity: (activeVideo === 'B' && !isTransitioning) ? 1 :
                           (activeVideo === 'B' && isTransitioning) ? 0 :
                           (activeVideo === 'A' && isTransitioning) ? 1 : 0,
                  transition: 'opacity 1.5s ease-in-out',
                }}
              />
            </>
          )}
          {/* Particles Effect System Overlay */}
          <ParticlesEffect portDestroyed={portDestroyed} />

          {/* Dynamic Weather System Overlays */}
          {!lowGraphics && (
            <>
              {/* Fog Weather Layer */}
              {weather === 'fog' && (
                <>
                  <div className="weather-fog-overlay" />
                  <div className="fog-cloud fog-cloud-1" />
                  <div className="fog-cloud fog-cloud-2" />
                  <div className="fog-cloud fog-cloud-3" />
                </>
              )}

              {/* Storm Sky Darkener Layer */}
              {weather === 'storm' && (
                <div className="weather-storm-overlay" />
              )}

              {/* Lightning Flash Layer */}
              {weather === 'storm' && lightningActive && (
                <div className="weather-lightning-flash lightning-strike-anim" />
              )}

              {/* Rain/Storm Streaks Layer */}
              {(weather === 'rain' || weather === 'storm') && (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 17, overflow: 'hidden' }}>
                  <div className="weather-rain-overlay" style={{ animationDuration: weather === 'storm' ? '0.4s' : '0.6s' }} />
                  {rainStreaks.map(streak => (
                    <div 
                      key={streak.id}
                      className="rain-streak"
                      style={{
                        left: streak.left,
                        animationDelay: streak.delay,
                        animationDuration: weather === 'storm' ? `${parseFloat(streak.dur) * 0.7}s` : streak.dur,
                        opacity: streak.opacity,
                        height: streak.height,
                        willChange: 'transform',
                        transform: 'translateZ(0)'
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Clean pure video background has replaced all old cartoon/SVG background overlays */}

          {/* SVG liquid displacement filters for realistic undulating water effect */}
          <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }} aria-hidden="true">
            <filter id="water-filter" colorInterpolationFilters="sRGB">
              <feTurbulence type="fractalNoise" baseFrequency="0.02 0.04" numOctaves="2" result="noise" />
              {/* Scroll the noise map horizontally and vertically over time to simulate a continuous water current */}
              <feOffset in="noise" dx="0" dy="0" result="offsetNoise">
                <animate attributeName="dx" from="0" to="500" dur="25s" repeatCount="indefinite" />
                <animate attributeName="dy" from="0" to="250" dur="25s" repeatCount="indefinite" />
              </feOffset>
              <feDisplacementMap in="SourceGraphic" in2="offsetNoise" scale="11" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </svg>

          {activeTab === 'harbor' && (
            <>
              {/* Interactive Building Hotspots - بيت السمك */}
              <div 
                className="building-hotspot group cursor-pointer" 
                style={{ 
                  position: 'absolute',
                  left: '8%', 
                  top: '36%', 
                  width: '180px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 25,
                  willChange: 'transform'
                }} 
                onClick={() => {
                  if (portDestroyed) {
                    alert("⚠️ بيت السمك تعرض للقصف والاحتراق الشديد! أعد إعمار الميناء والأسطول لترميم المنشآت.");
                    return;
                  }
                  setFishStorageModal(true);
                }}
                title={portDestroyed ? "بيت السمك (محترق ومدمر)" : `بيت السمك - المستوى ${fishStorageLevel}`}
              >
                <div className="building-label" style={{ 
                  marginBottom: '8px', 
                  background: portDestroyed ? 'rgba(50, 10, 10, 0.95)' : 'rgba(0,0,0,0.85)', 
                  padding: '6px 17px', 
                  borderRadius: '14px', 
                  border: portDestroyed ? '1.5px solid #ef4444' : '1px solid #ca8a04', 
                  whiteSpace: 'nowrap', 
                  boxShadow: portDestroyed ? '0 4px 14px rgba(239, 68, 68, 0.7)' : '0 4px 14px rgba(0,0,0,0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '21px', fontWeight: '900', color: portDestroyed ? '#fca5a5' : '#facc15', fontFamily: 'Cairo, sans-serif' }}>
                    {portDestroyed ? `🔥 بيت السمك (محترق ومدمر)` : `🐟 بيت السمك (مستوى ${fishStorageLevel})`}
                  </span>
                </div>

                <div style={{
                  width: '238px',
                  height: '238px',
                  position: 'relative',
                  filter: portDestroyed
                    ? 'grayscale(0.9) brightness(0.22) contrast(1.5) sepia(0.8) hue-rotate(-20deg) drop-shadow(0 0 16px rgba(239, 68, 68, 0.9))'
                    : 'drop-shadow(0 14px 22px rgba(0,0,0,0.65))',
                  transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center'
                }} className="hover:scale-110 active:scale-95">
                  <img 
                    key={`beach-fish-house-img-${fishStorageLevel}`}
                    src={getFishHouseImageUrl(fishStorageLevel)} 
                    alt={`بيت السمك - مستوى ${fishStorageLevel}`}
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      pointerEvents: 'none',
                      transition: 'opacity 0.4s ease-in-out, transform 0.3s ease',
                      filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.7))',
                      transform: 'scaleX(-1)'
                    }}
                    loading="eager"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/FISH/refs/heads/main/level-01.png";
                    }}
                  />

                  {/* Fire and smoke rising from burned fish house */}
                  {portDestroyed && (
                    <div style={{ position: 'absolute', inset: 0, zIndex: 12, pointerEvents: 'none' }}>
                      <span style={{ position: 'absolute', top: '-15px', left: '20%', fontSize: '28px', animation: 'bounce 0.7s infinite alternate' }}>🔥</span>
                      <span style={{ position: 'absolute', top: '10px', left: '60%', fontSize: '24px', animation: 'pulse 0.6s infinite alternate' }}>🔥</span>
                      <span style={{ position: 'absolute', top: '-30px', left: '40%', fontSize: '28px', opacity: 0.85, animation: 'pulse 1.8s infinite' }}>💨</span>
                    </div>
                  )}
                </div>
              </div>

              <div 
                className="building-hotspot" 
                style={{ 
                  position: 'absolute',
                  left: '73%', 
                  top: '26%', 
                  width: '216px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 20,
                  willChange: 'transform'
                }} 
                onClick={() => {
                  if (portDestroyed) {
                    alert("⚠️ بيت السفن والبرج تعرض للتفجير والاحتراق! أعد إعمار الميناء لترميم الترسانة والأسطول.");
                    return;
                  }
                  setActiveTab('warehouse');
                }}
                title={portDestroyed ? "بيت السفن (محترق ومدمر)" : "بيت السفن"}
              >
                <div className="building-label" style={{ 
                  marginBottom: '8px', 
                  background: portDestroyed ? 'rgba(50, 10, 10, 0.95)' : 'rgba(0,0,0,0.85)', 
                  padding: '7px 17px', 
                  borderRadius: '14px', 
                  border: portDestroyed ? '1.5px solid #ef4444' : '1.5px solid #ca8a04', 
                  whiteSpace: 'nowrap', 
                  boxShadow: portDestroyed ? '0 4px 14px rgba(239, 68, 68, 0.7)' : '0 4px 12px rgba(0,0,0,0.6)' 
                }}>
                  <span style={{ fontSize: '18px', fontWeight: '900', color: portDestroyed ? '#fca5a5' : '#facc15', fontFamily: 'Cairo, sans-serif' }}>
                    {portDestroyed ? `🔥 بيت السفن (محترق ومدمر)` : `⚓ بيت السفن (مستوى ${shipTowerLevel})`}
                  </span>
                </div>
                
                <div style={{
                  width: '192px',
                  height: '192px',
                  position: 'relative',
                  filter: portDestroyed
                    ? 'grayscale(0.9) brightness(0.22) contrast(1.5) sepia(0.8) hue-rotate(-20deg) drop-shadow(0 0 16px rgba(239, 68, 68, 0.9))'
                    : 'drop-shadow(0 12px 20px rgba(0,0,0,0.5))',
                  transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  transform: 'none'
                }} className="hover:scale-110 active:scale-95">
                  <img 
                    src={getHarborImageUrl(shipTowerLevel)} 
                    alt="بيت السفن"
                    loading="eager"
                    decoding="async"
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      pointerEvents: 'none',
                      imageRendering: 'auto',
                      transition: 'opacity 0.4s ease-in-out',
                      willChange: 'transform',
                      transform: 'translateZ(0)',
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden'
                    }}
                  />

                  {/* Fire and smoke rising from burned ship tower */}
                  {portDestroyed && (
                    <div style={{ position: 'absolute', inset: 0, zIndex: 12, pointerEvents: 'none' }}>
                      <span style={{ position: 'absolute', top: '-12px', left: '20%', fontSize: '28px', animation: 'pulse 0.7s infinite alternate' }}>🔥</span>
                      <span style={{ position: 'absolute', top: '15px', left: '55%', fontSize: '24px', animation: 'bounce 0.6s infinite alternate' }}>🔥</span>
                      <span style={{ position: 'absolute', top: '-32px', left: '35%', fontSize: '28px', opacity: 0.85, animation: 'pulse 1.8s infinite' }}>💨</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Active Ships swimming on Harbor Map */}
              {ships.map((ship) => {
                if (!ship.exists) return null;
                const sSpeed = ship.speedLevel || 1;
                const sCap = ship.capacityLevel || 1;
                const sDef = ship.defenseLevel || 1;
                const isUpgraded = sSpeed > 1 || sCap > 1 || sDef > 1;

                let mapAuraFilter = 'drop-shadow(0 10px 8px rgba(0,0,0,0.5))';
                if (isUpgraded) {
                  if (sSpeed >= sCap && sSpeed >= sDef) {
                    mapAuraFilter = `drop-shadow(0 0 8px rgba(6, 182, 212, 0.95)) drop-shadow(0 6px 6px rgba(0,0,0,0.6))`;
                  } else if (sCap >= sSpeed && sCap >= sDef) {
                    mapAuraFilter = `drop-shadow(0 0 8px rgba(234, 179, 8, 0.95)) drop-shadow(0 6px 6px rgba(0,0,0,0.6))`;
                  } else {
                    mapAuraFilter = `drop-shadow(0 0 8px rgba(16, 185, 129, 0.95)) drop-shadow(0 6px 6px rgba(0,0,0,0.6))`;
                  }
                }

                const isShipDestroyed = portDestroyed || (typeof ship.heart === 'number' && ship.heart <= 0);

                return (
                  <React.Fragment key={ship.id}>
                    <div
                      id={ship.id}
                      className={`ship ${ship.moving ? 'moving' : ''}`}
                      style={{
                        left: ship.left,
                        top: ship.top,
                        filter: isShipDestroyed 
                          ? 'grayscale(0.9) brightness(0.18) contrast(1.5) sepia(0.6) hue-rotate(-20deg) drop-shadow(0 0 12px rgba(239,68,68,0.9))' 
                          : mapAuraFilter,
                        transition: `left ${ship.transitionDuration || '2s'} ease-in-out, top ${ship.transitionDuration || '2s'} ease-in-out, transform 0.25s ease-in-out`,
                        willChange: 'left, top, transform',
                        transform: `scaleX(${ship.scaleX}) ${isShipDestroyed ? getDestroyedShipStyles(ship.id).transform : ''} translateZ(0)`,
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden'
                      }}
                      onClick={(e) => showMenu(e, ship)}
                    >
                      {/* Wake animation behind moving ships */}
                      {ship.moving && <div className="ship-wake" />}

                      {/* Floating realistic boat image inside inner wrapper with status overlaid */}
                      <div className="relative ship-inner" style={{ width: 'var(--ship-render-width)', height: 'calc(var(--ship-render-width) * 0.95)', margin: '0 auto' }}>
                        <div style={{
                          position: 'relative',
                          width: '100%',
                          height: '100%',
                          filter: isShipDestroyed ? 'grayscale(1) brightness(0.25) contrast(1.3) sepia(1) hue-rotate(-20deg)' : 'none',
                          transition: 'filter 1.2s ease'
                        }}>
                          <ShipImage level={typeof ship.level === 'number' ? ship.level : 0} width={280} plain={true} fill={true} />
                          
                          {/* Ship Assigned Crew Overlay */}
                          {ship.assignedCrew && ship.assignedCrew.length > 0 && (
                            <ShipCrewMember assignedCrew={ship.assignedCrew} shipLevel={typeof ship.level === 'number' ? ship.level : 0} />
                          )}

                          {/* Autonomous Golden Hunter Fishing Status Badge & Direct Pause/Play Clickable Toggle */}
                          {ship.assignedCrew && (ship.assignedCrew.includes('golden_hunter') || ship.assignedCrew.includes('gold_fisher')) && !isShipDestroyed && (
                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleAutoFishing(ship.id);
                              }}
                              title={ship.autoFishingPaused ? "الصيد التلقائي متوقف حالياً - اضغط للتشغيل" : "الصيد التلقائي يعمل - اضغط للإيقاف مؤقتاً"}
                              className={`cursor-pointer absolute -top-7 left-1/2 flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black border shadow-lg whitespace-nowrap z-30 transition-all hover:scale-105 active:scale-95 ${
                                ship.autoFishingPaused 
                                  ? 'bg-slate-900/95 text-slate-300 border-slate-500 shadow-slate-950/60' 
                                  : 'bg-amber-950/95 text-amber-200 border-amber-400/90 shadow-amber-500/40 animate-pulse'
                              }`}
                              style={{
                                transform: `translateX(-50%) scaleX(${ship.scaleX < 0 ? -1 : 1})`,
                              }}
                            >
                              <span style={{ fontSize: '14px' }}>🔱</span>
                              <span>{ship.autoFishingPaused ? 'صيد تلقائي [متوقف]' : 'صيد تلقائي [شغال]'}</span>
                              <span className={`text-[11px] px-2 py-0.5 rounded font-black ${ship.autoFishingPaused ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                                {ship.autoFishingPaused ? '▶️ تشغيل' : '⏸️ إيقاف'}
                              </span>
                            </div>
                          )}
                          
                          {/* Fire & Smoke overlay for destroyed local ship */}
                          {isShipDestroyed && (
                            <div style={{
                              position: 'absolute',
                              inset: 0,
                              zIndex: 15,
                              pointerEvents: 'none'
                            }}>
                              {/* Dynamic Flames */}
                              {getDestroyedShipStyles(ship.id).flames.map((f, i) => (
                                <span
                                  key={i}
                                  style={{
                                    position: 'absolute',
                                    top: f.top,
                                    left: f.left,
                                    fontSize: f.size,
                                    animation: f.anim,
                                    filter: 'drop-shadow(0 0 5px #f97316)',
                                    lineHeight: 1
                                  }}
                                >
                                  🔥
                                </span>
                              ))}
                              {/* Rising smoke */}
                              <span style={{
                                position: 'absolute',
                                top: '-15px',
                                left: '45%',
                                fontSize: '24px',
                                opacity: 0.7,
                                animation: 'pulse 2s infinite'
                              }}>
                                💨
                              </span>
                              {/* Status Label Badge & Repair Button */}
                              <div 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRepairModalShip(ship);
                                }}
                                title="اضغط لفتح ورشة إصلاح وصيانة السفينة فوراً"
                                style={{
                                  position: 'absolute',
                                  bottom: '-12px',
                                  left: '50%',
                                  transform: 'translateX(-50%)',
                                  fontSize: '11px',
                                  fontWeight: 'bold',
                                  color: '#fff',
                                  background: 'linear-gradient(135deg, #b91c1c, #7f1d1d)',
                                  padding: '3px 10px',
                                  borderRadius: '16px',
                                  border: '1.5px solid #f87171',
                                  whiteSpace: 'nowrap',
                                  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.75)',
                                  zIndex: 35,
                                  cursor: 'pointer',
                                  pointerEvents: 'auto',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  animation: 'pulse 1.5s infinite'
                                }}
                              >
                                <span>{getDestroyedShipStyles(ship.id).statusLabel}</span>
                                <span style={{ background: '#10b981', color: '#fff', padding: '1px 6px', borderRadius: '8px', fontSize: '10px' }}>
                                  🔧 إصلاح
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Interactive Damaged Ship Indicator (when damaged but not fully destroyed) */}
                          {(() => {
                            const maxH = ship.maxHeart || ((ship.level || 0) * 1000) + 10000;
                            const curH = typeof ship.heart === 'number' ? ship.heart : maxH;
                            if (!isShipDestroyed && curH < maxH) {
                              return (
                                <div 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setRepairModalShip(ship);
                                  }}
                                  title="اضغط لصيانة وترميم السفينة"
                                  style={{
                                    position: 'absolute',
                                    top: '-24px',
                                    left: '50%',
                                    transform: `translateX(-50%) scaleX(${ship.scaleX < 0 ? -1 : 1})`,
                                    cursor: 'pointer',
                                    pointerEvents: 'auto',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    fontSize: '10px',
                                    fontWeight: 'bold',
                                    color: '#fef08a',
                                    background: 'rgba(24, 18, 12, 0.92)',
                                    border: '1px solid #eab308',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    whiteSpace: 'nowrap',
                                    zIndex: 25,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.6)'
                                  }}
                                >
                                  <span>❤️ {curH.toLocaleString()} / {maxH.toLocaleString()} HP</span>
                                  <span style={{ color: '#34d399', fontWeight: 'bold' }}>🔧 صيانة</span>
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                        
                        {/* Fishing Net hanging down under the boat when fishing or returning with catch */}
                        {ship.status === 'fishing' && showNets && (
                          <div 
                            className="fishing-net-animation"
                            style={{
                              position: 'absolute',
                              bottom: 'calc(var(--ship-render-width) * -0.25)', // Hangs down realistically from the hull
                              left: '50%',
                              transform: 'translateX(-50%)',
                              width: 'calc(var(--ship-render-width) * 0.68)', // Perfectly scaled for the ship's width
                              zIndex: -1, // Places the net behind/underneath the ship's body
                              pointerEvents: 'none',
                            }}
                          >
                            <img 
                              src="https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/copilot_image_1784650557500.jpeg"
                              alt="شبكة صيد"
                              referrerPolicy="no-referrer"
                              style={{
                                width: '100%',
                                height: 'auto',
                                display: 'block',
                                mixBlendMode: 'multiply',
                                filter: 'contrast(1.4) brightness(1.15) drop-shadow(0 4px 6px rgba(0,0,0,0.5))',
                              }}
                            />
                          </div>
                        )}

                        {/* Level floating badge overlaid on ship */}
                        <span style={{
                          position: 'absolute',
                          bottom: '-5px',
                          right: '10px',
                          background: 'rgba(133, 77, 14, 0.95)',
                          color: '#fff',
                          border: '2px solid #fef08a',
                          borderRadius: '8px',
                          fontSize: '15px',
                          padding: '3px 9px',
                          fontWeight: 'bold',
                          zIndex: 5,
                          whiteSpace: 'nowrap',
                          direction: 'rtl',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.85)'
                        }}>
                          {ship.imgEmoji || '⛵'} م.{ship.level ?? 1}
                        </span>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </>
          )}
        </div>
      </div>



      {/* ----------------- INVENTORY TAB (المخزن - العتاد والمعدات والأسلحة وسجل المكتشفات) ----------------- */}
      {activeTab === 'inventory' && (
        <InventoryComponent 
          gold={gold}
          setGold={setGold}
          gems={gems}
          setGems={setGems}
          weapons={weapons}
          setWeapons={setWeapons}
          crewServices={crewServices}
          setCrewServices={setCrewServices}
          crewInventory={crewInventory}
          setCrewInventory={setCrewInventory}
          shieldInventory={shieldInventory}
          setShieldInventory={setShieldInventory}
          handlePurchase={handlePurchase}
          onClose={() => setActiveTab('harbor')}
        />
      )}

      {/* ----------------- FLEET WAREHOUSE TAB (بيت السفن / مستودع الأسطول) ----------------- */}
      {activeTab === 'warehouse' && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 200,
          background: 'linear-gradient(to bottom, #080f24, #040817)',
          overflowY: 'auto',
          paddingBottom: '100px'
        }}>
          <ShipWarehouse
            shipTowerLevel={shipTowerLevel}
            setShipTowerLevel={setShipTowerLevel}
            gold={gold}
            setGold={setGold}
            gems={gems}
            setGems={setGems}
            ships={ships}
            setShips={setShips}
            buyShipLevel={buyShipLevel}
            crewServices={crewServices}
            setCrewServices={setCrewServices}
            onClose={() => setActiveTab('harbor')}
          />
        </div>
      )}

      {/* ----------------- PORTFOLIO / SETTINGS TAB (البروفايل) ----------------- */}
      {activeTab === 'settings' && (
        <div style={{ position: 'relative', width: '100%', minHeight: '100%' }}>
          <SettingsView
            language={language}
            setLanguage={setLanguage}
            userEmail={auth.currentUser?.email || localStorage.getItem('google_auth_email') || 'ttwk29818@gmail.com'}
            handleSyncAccount={handleSyncAccount}
            isMusicMuted={isMusicMuted}
            setIsMusicMuted={setIsMusicMuted}
            isSfxMuted={isSfxMuted}
            setIsSfxMuted={setIsSfxMuted}
            showSoundTones={showSoundTones}
            setShowSoundTones={setShowSoundTones}
            showAttackNotifications={showAttackNotifications}
            setShowAttackNotifications={setShowAttackNotifications}
            showChestNotifications={showChestNotifications}
            setShowChestNotifications={setShowChestNotifications}
            customizeIconFunctions={customizeIconFunctions}
            setCustomizeIconFunctions={setCustomizeIconFunctions}
            showRelatedAlerts={showRelatedAlerts}
            setShowRelatedAlerts={setShowRelatedAlerts}
            disableQuickChat={disableQuickChat}
            setDisableQuickChat={setDisableQuickChat}
            powerSaverLogin={powerSaverLogin}
            setPowerSaverLogin={setPowerSaverLogin}
            setPowerSaver={setPowerSaver}
            showPopupAlerts={showPopupAlerts}
            setShowPopupAlerts={setShowPopupAlerts}
            stopRogueAlliances={stopRogueAlliances}
            setStopRogueAlliances={setStopRogueAlliances}
            heatingEnergyIndex={heatingEnergyIndex}
            setHeatingEnergyIndex={setHeatingEnergyIndex}
            setActiveSettingsModal={setActiveSettingsModal}
            handleSendPasswordReset={handleSendPasswordReset}
            handleLogout={handleLogout}
            showToast={showToast}
            onClose={() => setActiveTab('harbor')}
            handleUpdateGameVersion={handleUpdateGameVersion}
          />

          {/* Interactive Modal Popups / Overlays inside settings */}
          {activeSettingsModal === 'ticket' && (
            <div style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.85)',
              zIndex: 100000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              direction: 'rtl'
            }}>
              <div style={{
                background: '#071524',
                border: '2px solid #ca8a04',
                borderRadius: '20px',
                width: '100%',
                maxWidth: '450px',
                padding: '24px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
                fontFamily: 'Cairo, sans-serif'
              }}>
                <h3 style={{ margin: '0 0 12px 0', color: '#facc15', fontSize: '18px', fontWeight: 'bold' }}>🛠️ إنشاء تذكرة دعم فني جديدة</h3>
                <p style={{ margin: '0 0 16px 0', fontSize: '11px', color: '#94a3b8' }}>اكتب تفاصيل مشكلتك وسيقوم فريق الدعم بالرد عليك مباشرة.</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 'bold' }}>عنوان المشكلة:</label>
                    <input
                      type="text"
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      placeholder="مثال: مشكلة في شحن الجواهر"
                      style={{ background: '#040d17', border: '1px solid rgba(250, 204, 21, 0.2)', padding: '10px', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 'bold' }}>تفاصيل المشكلة والرسالة:</label>
                    <textarea
                      rows={4}
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      placeholder="اكتب هنا ما يواجهك من مشاكل بكل تفصيل..."
                      style={{ background: '#040d17', border: '1px solid rgba(250, 204, 21, 0.2)', padding: '10px', borderRadius: '8px', color: '#fff', fontSize: '13px', resize: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={handleCreateSupportTicket}
                    style={{ flex: 1, background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
                  >
                    إرسال التذكرة 🚀
                  </button>
                  <button
                    onClick={() => setActiveSettingsModal(null)}
                    style={{ flex: 1, background: '#1e293b', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSettingsModal === 'email' && (
            <div style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.85)',
              zIndex: 100000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              direction: 'rtl'
            }}>
              <div style={{
                background: '#071524',
                border: '2px solid #ca8a04',
                borderRadius: '20px',
                width: '100%',
                maxWidth: '400px',
                padding: '24px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
                fontFamily: 'Cairo, sans-serif'
              }}>
                <h3 style={{ margin: '0 0 12px 0', color: '#facc15', fontSize: '18px', fontWeight: 'bold' }}>✉️ تعديل البريد الإلكتروني</h3>
                <p style={{ margin: '0 0 16px 0', fontSize: '11px', color: '#94a3b8' }}>أدخل البريد الإلكتروني الجديد لحسابك لتلقي الإشعارات وتوثيق اللعبة.</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
                  <label style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 'bold' }}>البريد الإلكتروني الجديد:</label>
                  <input
                    type="email"
                    value={newEmailInput}
                    onChange={(e) => setNewEmailInput(e.target.value)}
                    placeholder="new_email@example.com"
                    style={{ background: '#040d17', border: '1px solid rgba(250, 204, 21, 0.2)', padding: '10px', borderRadius: '8px', color: '#fff', fontSize: '13px', textAlign: 'left' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={handleChangeEmail}
                    style={{ flex: 1, background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
                  >
                    تحديث البريد 💾
                  </button>
                  <button
                    onClick={() => setActiveSettingsModal(null)}
                    style={{ flex: 1, background: '#1e293b', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSettingsModal === 'icons' && (
            <div style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.85)',
              zIndex: 100000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              direction: 'rtl'
            }}>
              <div style={{
                background: '#071524',
                border: '2px solid #6366f1',
                borderRadius: '20px',
                width: '100%',
                maxWidth: '420px',
                padding: '24px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
                fontFamily: 'Cairo, sans-serif',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '32px' }}>🎯</span>
                <h3 style={{ margin: '8px 0 12px 0', color: '#facc15', fontSize: '18px', fontWeight: 'bold' }}>تخصيص مواقع الأيقونات واختصارات الشاشة</h3>
                <p style={{ margin: '0 0 20px 0', fontSize: '12px', color: '#cbd5e1', lineHeight: '1.6' }}>
                  هذه الميزة الفريدة تتيح لك ترتيب وترصيف أيقونات اللوحة الرئيسية واختيار المفاتيح الأنسب لشاشتك لتسهيل الصيد والتحصين.
                  <br />
                  <strong style={{ color: '#6366f1' }}>ستتوفر كاملة في التحديث التلقائي القادم للأساطيل!</strong>
                </p>
                
                <button
                  onClick={() => setActiveSettingsModal(null)}
                  style={{ width: '100%', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
                >
                  حسناً، فهمت 👍
                </button>
              </div>
            </div>
          )}

          {activeSettingsModal === 'delete' && (
            <div style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.85)',
              zIndex: 100000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              direction: 'rtl'
            }}>
              <div style={{
                background: '#1e0c0f',
                border: '2px solid #ef4444',
                borderRadius: '20px',
                width: '100%',
                maxWidth: '400px',
                padding: '24px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
                fontFamily: 'Cairo, sans-serif',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '36px' }}>⚠️</span>
                <h3 style={{ margin: '8px 0 12px 0', color: '#f87171', fontSize: '18px', fontWeight: 'bold' }}>حذف الحساب نهائياً</h3>
                <p style={{ margin: '0 0 20px 0', fontSize: '12px', color: '#fda4af', lineHeight: '1.6' }}>
                  هل أنت متأكد تماماً من رغبتك في حذف حسابك وجميع سجلات صيدك وأساطيلك وذهبك بشكل كامل ودائم من الخوادم؟ لا يمكن التراجع عن هذا القرار بعد تنفيذه.
                </p>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={handleDeleteAccountPermanently}
                    style={{ flex: 1, background: 'linear-gradient(135deg, #dc2626, #b91c1c)', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
                  >
                    تأكيد الحذف النهائي 🗑️
                  </button>
                  <button
                    onClick={() => setActiveSettingsModal(null)}
                    style={{ flex: 1, background: '#1e293b', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
                  >
                    تراجع وإلغاء
                  </button>
                </div>
              </div>
            </div>
          )}

          {settingsToast && (
            <div style={{
              position: 'fixed',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 999999,
              background: settingsToast.type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '13px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5), 0 0 10px rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              animation: 'fade-in-scale 0.25s ease-out',
              direction: 'rtl'
            }}>
              <span>{settingsToast.type === 'success' ? '✅' : '❌'}</span>
              <span>{settingsToast.message}</span>
            </div>
          )}

        </div>
      )}

      {/* ----------------- SHOP TAB (متجر شابك 360) ----------------- */}
      {activeTab === 'shop' && (
        <PirateShop
          gold={gold}
          setGold={setGold}
          gems={gems}
          setGems={setGems}
          redGems={redGems}
          setRedGems={setRedGems}
          weapons={weapons}
          setWeapons={setWeapons}
          crewServices={crewServices}
          setCrewServices={setCrewServices}
          crewInventory={crewInventory}
          setCrewInventory={setCrewInventory}
          shieldInventory={shieldInventory}
          setShieldInventory={setShieldInventory}
          ships={ships}
          setShips={setShips}
          bgTheme={bgTheme}
          setBgTheme={setBgTheme}
          profileTheme={profileTheme}
          setProfileTheme={setProfileTheme}
          setActiveTab={setActiveTab}
          playerLevel={playerLevel}
          exp={exp}
          buyShipLevel={buyShipLevel}
          buyWeaponItem={buyWeaponItem}
          buyCrewService={buyCrewService}
          buyShopItem={buyShopItem}
          handlePurchase={handlePurchase}
          buyItem={handlePurchase}
          confirmUpgradeShip={confirmUpgradeShip}
          upgradeTargetSpec={upgradeTargetSpec}
          setUpgradeTargetSpec={setUpgradeTargetSpec}
        />
      )}

      {/* ----------------- OLD SHOP TAB (DEACTIVATED) ----------------- */}
      {activeTab === 'shop' && false && (
        <div className="tab-overlay" style={{
          zIndex: 105,
          maxWidth: '1080px',
          margin: '0 auto',
          background: '#1d0f04',
          border: '8px solid #5c3a21',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9)',
          padding: '0',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh'
        }} dir="rtl">
          
          {/* Header Bar */}
          <div style={{
            background: 'linear-gradient(to bottom, #7f1d1d, #450a0a)',
            borderBottom: '4px solid #b45309',
            padding: '12px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '24px' }}>🎪</span>
              <h2 style={{
                margin: 0,
                color: '#fff',
                fontSize: '22px',
                fontWeight: 'bold',
                fontFamily: 'Cairo, sans-serif',
                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                letterSpacing: '1px'
              }}>متجر شابك 360 الإمبراطوري</h2>
            </div>
            
            {/* Close Button (X) */}
            <button 
              onClick={() => setActiveTab('harbor')}
              style={{
                background: '#991b1b',
                color: '#fff',
                border: '3px solid #fecaca',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(0,0,0,0.4)',
                transition: 'all 0.2s',
                zIndex: 10
              }}
            >
              ✕
            </button>
          </div>

          {/* Currencies Plaques bar */}
          <div style={{
            background: '#2b1a09',
            padding: '10px 20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            borderBottom: '2px solid #78350f'
          }}>
            {/* Gold Plaque */}
            <div style={{
              background: '#451a03',
              border: '2px solid #ca8a04',
              borderRadius: '8px',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)'
            }}>
              <span style={{ color: '#fcd34d', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <img src={GOLD_COIN_ICON} alt="ذهب" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                الذهب:
              </span>
              <strong style={{ color: '#fff', fontSize: '15px' }}>{gold.toLocaleString('ar-EG')}</strong>
            </div>

            {/* Blue Gems Plaque */}
            <div style={{
              background: '#0c223c',
              border: '2px solid #3b82f6',
              borderRadius: '8px',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)'
            }}>
              <span style={{ color: '#93c5fd', fontWeight: 'bold', fontSize: '13px' }}>💎 الجواهر الزرقاء:</span>
              <strong style={{ color: '#fff', fontSize: '15px' }}>{gems.toLocaleString('ar-EG')}</strong>
            </div>

            {/* Red Gems Plaque */}
            <div style={{
              background: '#450a0a',
              border: '2px solid #ef4444',
              borderRadius: '8px',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)'
            }}>
              <span style={{ color: '#fca5a5', fontWeight: 'bold', fontSize: '13px' }}>🔴 الجواهر الحمراء:</span>
              <strong style={{ color: '#fff', fontSize: '15px' }}>{redGems.toLocaleString('ar-EG')}</strong>
            </div>
          </div>

          {/* Main Body */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            flex: 1,
            background: 'linear-gradient(135deg, #f7e1bd 0%, #e1bd8d 100%)',
            overflowY: 'auto',
            minHeight: '380px'
          }}>
            
            {/* LEFT AREA: Items Grid */}
            <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
              {shopSubTab === 'hamour' && (
                <div>
                  <div style={{ color: '#3d2314', fontWeight: 'bold', fontSize: '16px', marginBottom: '14px', borderBottom: '2px solid #a16207', paddingBottom: '4px' }}>
                    🚀 ترسانة الأسلحة النشطة وأدوات صيانة أسطول شابك
                  </div>
                  
                  {/* Grid of 8 Items */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                    gap: '16px'
                  }}>
                    {/* Item 1: صاروخ صغير */}
                    <div style={{
                      background: '#eedcb3',
                      border: '2px solid #854d0e',
                      borderRadius: '12px',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      position: 'relative',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                      <div style={{ color: '#451a03', fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>صاروخ صغير</div>
                      
                      {/* Small Rocket Image */}
                      <div style={{
                        height: '70px',
                        width: '70px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '6px 0',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        backgroundImage: `url(${WEAPON_SMALL_MISSILE_BG})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        border: '1.5px solid rgba(180, 83, 9, 0.5)',
                        boxShadow: 'inset 0 0 8px rgba(0,0,0,0.5)'
                      }}>
                        <img 
                          src={WEAPON_SMALL_MISSILE_ICON} 
                          alt="صاروخ صغير" 
                          referrerPolicy="no-referrer"
                          style={{ maxHeight: '56px', maxWidth: '56px', objectFit: 'contain', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.35))' }}
                        />
                      </div>

                      {/* Power Circle Badge */}
                      <div style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        background: '#fef08a',
                        border: '2.5px dashed #ca8a04',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '9px',
                        fontWeight: 'bold',
                        color: '#78350f',
                        margin: '6px 0'
                      }}>
                        <span>⚔️</span>
                        <span>100K</span>
                      </div>

                      {/* Buy Button */}
                      <button 
                        onClick={() => buyWeaponItem('smallRocket', 'gold', 250000)}
                        style={{
                          width: '100%',
                          background: 'linear-gradient(to bottom, #d97706, #b45309)',
                          color: '#fff',
                          border: '1.5px solid #fef08a',
                          borderRadius: '8px',
                          padding: '6px 8px',
                          fontWeight: 'bold',
                          fontSize: '12px',
                          cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                          marginTop: '8px'
                        }}
                      >
                        250,000 ذهب
                      </button>
                      <div style={{ fontSize: '10px', color: '#78350f', marginTop: '4px' }}>لديك: <strong>{weapons.smallRocket || 0}</strong></div>
                    </div>

                    {/* Item 2: صاروخ متوسط */}
                    <div style={{
                      background: '#eedcb3',
                      border: '2px solid #854d0e',
                      borderRadius: '12px',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      position: 'relative',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                      <div style={{ color: '#451a03', fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>صاروخ متوسط</div>
                      
                      {/* Medium Rocket Image */}
                      <div style={{
                        height: '70px',
                        width: '70px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '6px 0',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        backgroundImage: `url(${WEAPON_MEDIUM_MISSILE_BG})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        border: '1.5px solid rgba(194, 65, 12, 0.5)',
                        boxShadow: 'inset 0 0 8px rgba(0,0,0,0.5)'
                      }}>
                        <img 
                          src={WEAPON_MEDIUM_MISSILE_ICON} 
                          alt="صاروخ متوسط" 
                          referrerPolicy="no-referrer"
                          style={{ maxHeight: '56px', maxWidth: '56px', objectFit: 'contain', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }}
                        />
                      </div>

                      {/* Power Circle Badge */}
                      <div style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        background: '#fef08a',
                        border: '2.5px dashed #ca8a04',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '9px',
                        fontWeight: 'bold',
                        color: '#78350f',
                        margin: '6px 0'
                      }}>
                        <span>⚔️</span>
                        <span>500K</span>
                      </div>

                      {/* Buy Button */}
                      <button 
                        onClick={() => buyWeaponItem('mediumRocket', 'gold', 500000)}
                        style={{
                          width: '100%',
                          background: 'linear-gradient(to bottom, #d97706, #b45309)',
                          color: '#fff',
                          border: '1.5px solid #fef08a',
                          borderRadius: '8px',
                          padding: '6px 8px',
                          fontWeight: 'bold',
                          fontSize: '12px',
                          cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                          marginTop: '8px'
                        }}
                      >
                        500,000 ذهب
                      </button>
                      <div style={{ fontSize: '10px', color: '#78350f', marginTop: '4px' }}>لديك: <strong>{weapons.mediumRocket || 0}</strong></div>
                    </div>

                    {/* Item 3: صاروخ كبير */}
                    <div style={{
                      background: '#eedcb3',
                      border: '2px solid #854d0e',
                      borderRadius: '12px',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      position: 'relative',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                      <div style={{ color: '#451a03', fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>صاروخ كبير</div>
                      
                      {/* Large Rocket Image */}
                      <div style={{
                        height: '70px',
                        width: '70px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '6px 0',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        backgroundImage: `url(${WEAPON_LARGE_MISSILE_BG})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        border: '1.5px solid rgba(133, 77, 14, 0.5)',
                        boxShadow: 'inset 0 0 8px rgba(0,0,0,0.5)'
                      }}>
                        <img 
                          src={WEAPON_LARGE_MISSILE_ICON} 
                          alt="صاروخ كبير" 
                          referrerPolicy="no-referrer"
                          style={{ maxHeight: '56px', maxWidth: '56px', objectFit: 'contain', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }}
                        />
                      </div>

                      {/* Power Circle Badge */}
                      <div style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        background: '#fef08a',
                        border: '2.5px dashed #ca8a04',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '9px',
                        fontWeight: 'bold',
                        color: '#78350f',
                        margin: '6px 0'
                      }}>
                        <span>⚔️</span>
                        <span>1.5M</span>
                      </div>

                      {/* Buy Button */}
                      <button 
                        onClick={() => buyWeaponItem('largeRocket', 'gold', 1000000)}
                        style={{
                          width: '100%',
                          background: 'linear-gradient(to bottom, #d97706, #b45309)',
                          color: '#fff',
                          border: '1.5px solid #fef08a',
                          borderRadius: '8px',
                          padding: '6px 8px',
                          fontWeight: 'bold',
                          fontSize: '12px',
                          cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                          marginTop: '8px'
                        }}
                      >
                        1,000,000 ذهب
                      </button>
                      <div style={{ fontSize: '10px', color: '#78350f', marginTop: '4px' }}>لديك: <strong>{weapons.largeRocket || 0}</strong></div>
                    </div>

                    {/* Item 4: قنبلة ذرية */}
                    <div style={{
                      background: '#eedcb3',
                      border: '2px solid #854d0e',
                      borderRadius: '12px',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      position: 'relative',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                      <div style={{ color: '#451a03', fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>قنبلة ذرية</div>
                      
                      {/* Atomic Bomb Image */}
                      <div style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '6px 0' }}>
                        <img 
                          src={WEAPON_ATOMIC_BOMB_ICON} 
                          alt="قنبلة ذرية" 
                          referrerPolicy="no-referrer"
                          style={{ maxHeight: '68px', maxWidth: '68px', objectFit: 'contain', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.35))' }}
                        />
                      </div>

                      {/* Power Circle Badge */}
                      <div style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        background: '#93c5fd',
                        border: '2.5px dashed #1d4ed8',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '9px',
                        fontWeight: 'bold',
                        color: '#1e3a8a',
                        margin: '6px 0'
                      }}>
                        <span>💥</span>
                        <span>10M</span>
                      </div>

                      {/* Buy Button */}
                      <button 
                        onClick={() => buyWeaponItem('atomicBomb', 'blueGems', 100)}
                        style={{
                          width: '100%',
                          background: 'linear-gradient(to bottom, #1d4ed8, #1e3a8a)',
                          color: '#fff',
                          border: '1.5px solid #93c5fd',
                          borderRadius: '8px',
                          padding: '6px 8px',
                          fontWeight: 'bold',
                          fontSize: '12px',
                          cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                          marginTop: '8px'
                        }}
                      >
                        100 جوهرة
                      </button>
                      <div style={{ fontSize: '10px', color: '#1e3a8a', marginTop: '4px' }}>لديك: <strong>{weapons.atomicBomb || 0}</strong></div>
                    </div>

                    {/* Item 5: مصلح صغير */}
                    <div style={{
                      background: '#eedcb3',
                      border: '2px solid #854d0e',
                      borderRadius: '12px',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      position: 'relative',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                      <div style={{ color: '#451a03', fontWeight: 'bold', fontSize: '14px', marginBottom: '2px' }}>1 - مصلح صغير</div>
                      <div style={{ color: '#78350f', fontSize: '10px', marginBottom: '4px' }}>يصلح ويزيد 500 نقطة من الصفر</div>
                      
                      {/* Mechanic Image */}
                      <div style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(6, 35, 28, 0.9) 100%)',
                        border: '2px solid #10b981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        margin: '8px 0',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                      }}>
                        <img 
                          src={FIXER_SMALL_ICON} 
                          alt="مصلح صغير" 
                          referrerPolicy="no-referrer" 
                          style={{ maxHeight: '60px', maxWidth: '60px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }} 
                        />
                      </div>

                      {/* Power Badge */}
                      <div style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        background: '#fef08a',
                        border: '2.5px dashed #ca8a04',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '9px',
                        fontWeight: 'bold',
                        color: '#78350f',
                        margin: '6px 0'
                      }}>
                        <span>❤️</span>
                        <span>500</span>
                      </div>

                      {/* Buy Button */}
                      <button 
                        onClick={() => buyWeaponItem('smallRepair', 'gold', 250000)}
                        style={{
                          width: '100%',
                          background: 'linear-gradient(to bottom, #d97706, #b45309)',
                          color: '#fff',
                          border: '1.5px solid #fef08a',
                          borderRadius: '8px',
                          padding: '6px 8px',
                          fontWeight: 'bold',
                          fontSize: '12px',
                          cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                          marginTop: '8px'
                        }}
                      >
                        250,000 ذهب
                      </button>
                      <div style={{ fontSize: '10px', color: '#78350f', marginTop: '4px' }}>لديك: <strong>{weapons.smallRepair || 0}</strong></div>
                    </div>

                    {/* Item 6: مصلح وسط */}
                    <div style={{
                      background: '#eedcb3',
                      border: '2px solid #854d0e',
                      borderRadius: '12px',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      position: 'relative',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                      <div style={{ color: '#451a03', fontWeight: 'bold', fontSize: '14px', marginBottom: '2px' }}>2 - مصلح وسط</div>
                      <div style={{ color: '#78350f', fontSize: '10px', marginBottom: '4px' }}>يصلح نصف السفينة (50%) أو 1,000 نقطة</div>
                      
                      {/* Mechanic Image */}
                      <div style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(6, 35, 28, 0.9) 100%)',
                        border: '2px solid #10b981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        margin: '8px 0',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                      }}>
                        <img 
                          src={FIXER_MEDIUM_ICON} 
                          alt="مصلح وسط" 
                          referrerPolicy="no-referrer" 
                          style={{ maxHeight: '60px', maxWidth: '60px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }} 
                        />
                      </div>

                      {/* Power Badge */}
                      <div style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        background: '#fef08a',
                        border: '2.5px dashed #ca8a04',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '8.5px',
                        fontWeight: 'bold',
                        color: '#78350f',
                        margin: '6px 0',
                        textAlign: 'center'
                      }}>
                        <span>❤️</span>
                        <span>50% / 1k</span>
                      </div>

                      {/* Buy Button */}
                      <button 
                        onClick={() => buyWeaponItem('mediumRepair', 'gold', 500000)}
                        style={{
                          width: '100%',
                          background: 'linear-gradient(to bottom, #d97706, #b45309)',
                          color: '#fff',
                          border: '1.5px solid #fef08a',
                          borderRadius: '8px',
                          padding: '6px 8px',
                          fontWeight: 'bold',
                          fontSize: '12px',
                          cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                          marginTop: '8px'
                        }}
                      >
                        500,000 ذهب
                      </button>
                      <div style={{ fontSize: '10px', color: '#78350f', marginTop: '4px' }}>لديك: <strong>{weapons.mediumRepair || 0}</strong></div>
                    </div>

                    {/* Item 7: مصلح كبير */}
                    <div style={{
                      background: '#eedcb3',
                      border: '2px solid #854d0e',
                      borderRadius: '12px',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      position: 'relative',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                      {/* NEW RIBBON */}
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        left: '-8px',
                        background: '#ef4444',
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: '9px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        boxShadow: '2px 2px 4px rgba(0,0,0,0.25)',
                        transform: 'rotate(-10deg)',
                        border: '1px solid #fecaca'
                      }}>جديد</div>

                      <div style={{ color: '#451a03', fontWeight: 'bold', fontSize: '14px', marginBottom: '2px' }}>3 - مصلح كبير</div>
                      <div style={{ color: '#78350f', fontSize: '10px', marginBottom: '4px' }}>يصلح سفينة واحدة بالكامل 100%</div>
                      
                      {/* Fixer Large Image with Custom Background */}
                      <div style={{
                        width: '74px',
                        height: '74px',
                        borderRadius: '50%',
                        background: `url(${FIXER_LARGE_BG}) center/cover no-repeat`,
                        border: '2px solid #eab308',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        margin: '6px 0',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.35)',
                        position: 'relative'
                      }}>
                        <img 
                          src={FIXER_LARGE_ICON} 
                          alt="مصلح كبير" 
                          referrerPolicy="no-referrer" 
                          style={{ maxHeight: '64px', maxWidth: '64px', objectFit: 'contain', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.85))' }} 
                        />
                      </div>

                      {/* Power Badge */}
                      <div style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        background: '#fef08a',
                        border: '2.5px dashed #ca8a04',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '9px',
                        fontWeight: 'bold',
                        color: '#78350f',
                        margin: '6px 0'
                      }}>
                        <span>❤️</span>
                        <span>100%</span>
                      </div>

                      {/* Buy Button */}
                      <button 
                        onClick={() => buyWeaponItem('largeRepair', 'gold', 1000000)}
                        style={{
                          width: '100%',
                          background: 'linear-gradient(to bottom, #d97706, #b45309)',
                          color: '#fff',
                          border: '1.5px solid #fef08a',
                          borderRadius: '8px',
                          padding: '6px 8px',
                          fontWeight: 'bold',
                          fontSize: '12px',
                          cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                          marginTop: '8px'
                        }}
                      >
                        1,000,000 ذهب
                      </button>
                      <div style={{ fontSize: '10px', color: '#78350f', marginTop: '4px' }}>لديك: <strong>{weapons.largeRepair || 0}</strong></div>
                    </div>

                    {/* Item 8: مصلح اسطوري */}
                    <div style={{
                      background: '#eedcb3',
                      border: '2px solid #854d0e',
                      borderRadius: '12px',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      position: 'relative',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                      <div style={{ color: '#451a03', fontWeight: 'bold', fontSize: '14px', marginBottom: '2px' }}>4 - مصلح اسطوري</div>
                      <div style={{ color: '#78350f', fontSize: '10px', marginBottom: '4px' }}>يرفع ويصلح كل السفن دفعة واحدة 100%</div>
                      
                      {/* Legendary Fixer Image with Custom Background */}
                      <div style={{
                        width: '74px',
                        height: '74px',
                        borderRadius: '50%',
                        background: `url(${FIXER_LEGENDARY_BG}) center/cover no-repeat`,
                        border: '2px solid #a855f7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        margin: '6px 0',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.35)',
                        position: 'relative'
                      }}>
                        <img 
                          src={FIXER_LEGENDARY_ICON} 
                          alt="مصلح أسطوري" 
                          referrerPolicy="no-referrer" 
                          style={{ maxHeight: '64px', maxWidth: '64px', objectFit: 'contain', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.85))' }} 
                        />
                      </div>

                      {/* Power Badge */}
                      <div style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        background: '#93c5fd',
                        border: '2.5px dashed #1d4ed8',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '8.5px',
                        fontWeight: 'bold',
                        color: '#1e3a8a',
                        margin: '6px 0',
                        textAlign: 'center'
                      }}>
                        <span>👑</span>
                        <span>كل السفن</span>
                      </div>

                      {/* Buy Button */}
                      <button 
                        onClick={() => buyWeaponItem('legendaryRepair', 'blueGems', 60)}
                        style={{
                          width: '100%',
                          background: 'linear-gradient(to bottom, #1d4ed8, #1e3a8a)',
                          color: '#fff',
                          border: '1.5px solid #93c5fd',
                          borderRadius: '8px',
                          padding: '6px 8px',
                          fontWeight: 'bold',
                          fontSize: '12px',
                          cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                          marginTop: '8px'
                        }}
                      >
                        60 جوهرة
                      </button>
                      <div style={{ fontSize: '10px', color: '#1e3a8a', marginTop: '4px' }}>لديك: <strong>{weapons.legendaryRepair || 0}</strong></div>
                    </div>
                  </div>
                </div>
              )}

              {shopSubTab === 'thihn' && (
                <div>
                  <div style={{ color: '#3d2314', fontWeight: 'bold', fontSize: '15px', marginBottom: '10px', borderBottom: '1.5px solid #a16207', paddingBottom: '4px' }}>
                    ⚙️ ترقيات أسطول الصيد ومخازن الذهب
                  </div>
                  
                  <div className="grid-cards">
                    {/* Upgrade 1: شباك هامور شابك الأسطورية */}
                    <div className="shop-card">
                      <span style={{ fontSize: '36px' }}>🕸️</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', color: '#451a03', fontSize: '13px' }}>شباك هامور شابك المزدوجة</div>
                        <div style={{ color: '#78350f', fontSize: '11px' }}>تضاعف صيد الأسماك والذهب لجميع السفن بنسبة 100%!</div>
                        <div style={{ marginTop: '4px', fontWeight: 'bold', color: '#ca8a04', fontSize: '12px' }}>السعر: 150 ذهب</div>
                      </div>
                      <button onClick={() => buyShopItem('net', 150, 0)} className="upgrade-btn">شراء</button>
                    </div>

                    {/* Upgrade 2: محركات الدفع التوربيني */}
                    <div className="shop-card">
                      <span style={{ fontSize: '36px' }}>⚙️</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', color: '#451a03', fontSize: '13px' }}>محركات الدفع التوربيني</div>
                        <div style={{ color: '#78350f', fontSize: '11px' }}>تزيد من سرعة عودة السفينة من رحلة الصيد بمقدار الضعف!</div>
                        <div style={{ marginTop: '4px', fontWeight: 'bold', color: '#3b82f6', fontSize: '12px' }}>السعر: 5 جواهر</div>
                      </div>
                      <button onClick={() => buyShopItem('engine', 0, 5)} className="upgrade-btn" style={{ background: '#3b82f6' }}>شراء</button>
                    </div>

                    {/* Upgrade 3: خزنة الذهب العملاقة */}
                    <div className="shop-card">
                      <span style={{ fontSize: '36px' }}>🪙</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', color: '#451a03', fontSize: '13px' }}>خزنة الذهب المليئة</div>
                        <div style={{ color: '#78350f', fontSize: '11px' }}>تحتوي على 1500 عملة ذهبية لتطوير التحالف والأسطول.</div>
                        <div style={{ marginTop: '4px', fontWeight: 'bold', color: '#3b82f6', fontSize: '12px' }}>السعر: 10 جواهر</div>
                      </div>
                      <button onClick={() => buyShopItem('gold_pack', 0, 10)} className="upgrade-btn" style={{ background: '#16a34a' }}>استبدال</button>
                    </div>
                  </div>
                </div>
              )}

              {shopSubTab === 'share' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#3d2314', fontWeight: 'bold', fontSize: '15px', marginBottom: '10px', borderBottom: '1.5px solid #a16207', paddingBottom: '4px' }}>
                    <span>🚢 أسطول الشراء الإمبراطوري (34 مستوى صيد وحرب)</span>
                    <span style={{ fontSize: '11px', background: '#451a03', color: '#fcd34d', padding: '2px 8px', borderRadius: '8px' }}>
                      النشطة بالميناء: {ships.filter(s => s.exists).length} / 5
                    </span>
                  </div>

                  {/* Board Selection Toggle Buttons */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', justifyContent: 'center' }}>
                    <button 
                      onClick={() => setShopBoard('board1')}
                      style={{
                        flex: 1,
                        background: shopBoard === 'board1' ? '#ca8a04' : '#292524',
                        color: '#fff',
                        border: '1px solid #ca8a04',
                        borderRadius: '6px',
                        padding: '6px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      🛶 مستويات السفن 1-17
                    </button>
                    <button 
                      onClick={() => setShopBoard('board2')}
                      style={{
                        flex: 1,
                        background: shopBoard === 'board2' ? '#7c3aed' : '#292524',
                        color: '#fff',
                        border: '1px solid #7c3aed',
                        borderRadius: '6px',
                        padding: '6px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      🔮 مستويات السفن 18-34
                    </button>
                  </div>

                  {/* Cards Grid */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
                    gap: '12px',
                    maxHeight: '440px',
                    overflowY: 'auto',
                    padding: '12px',
                    background: 'rgba(29,15,4,0.3)',
                    border: '2px solid #5c3a21',
                    borderRadius: '12px',
                    boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.5)'
                  }}>
                    {SHOP_SHIPS
                      .filter(spec => shopBoard === 'board1' ? spec.level <= 17 : (spec.level >= 18 && spec.level < 33))
                      .map((spec) => {
                        const isSubmarineCard = spec.level === 32;
                        const ownedSubmarine = isSubmarineCard 
                          ? ships.find((s) => s.exists && s.level !== undefined && s.level >= 32 && s.level <= 35)
                          : null;

                        const currentLevel = ownedSubmarine ? (ownedSubmarine.level || 32) : spec.level;
                        const currentSpec = isSubmarineCard && ownedSubmarine
                          ? (SHOP_SHIPS.find((s) => s.level === currentLevel) || spec)
                          : spec;

                        const ownedCount = isSubmarineCard
                          ? (ownedSubmarine ? 1 : 0)
                          : ships.filter(s => s.exists && s.level === spec.level).length;
                        const isEpicOrLegendary = spec.level >= 18;
                        const isLocked = isSubmarineCard ? (shipTowerLevel < 31) : (spec.level > 0 && spec.level > shipTowerLevel);

                        const nextLevelForUpgrade = currentLevel + 1;
                        const nextSpecForUpgrade = SHOP_SHIPS.find(s => s.level === nextLevelForUpgrade);

                        return (
                          <div 
                            key={spec.level} 
                            style={{
                              background: isEpicOrLegendary ? 'linear-gradient(to bottom, #111827, #1e1b4b)' : 'linear-gradient(to bottom, #2b1a0a, #0f0803)',
                              border: isEpicOrLegendary ? '3px solid #818cf8' : '2px solid #ca8a04',
                              borderRadius: '14px',
                              padding: '12px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              position: 'relative',
                              boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                              transition: 'all 0.2s',
                              gap: '6px'
                            }}
                          >
                            {/* Owned Ship Count Badge */}
                            {ownedCount > 0 && (
                              <div style={{
                                position: 'absolute',
                                top: '-6px',
                                right: '-6px',
                                background: '#16a34a',
                                color: '#fff',
                                borderRadius: '50%',
                                width: '24px',
                                height: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                border: '2px solid #fff',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                                zIndex: 10
                              }}>
                                {ownedCount}
                              </div>
                            )}

                            {/* Beautiful Clean Sprite Illustration as the Card itself */}
                            <div style={{
                              margin: '4px 0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <ShipImage level={currentLevel} width={180} />
                            </div>

                            <div style={{ textAlign: 'center', marginBottom: '4px' }}>
                              <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#fff' }}>
                                {isSubmarineCard && ownedSubmarine
                                  ? `غواصة الأعماق (مستوى ${currentLevel - 31} 🤿)`
                                  : currentSpec.name
                                }
                              </div>
                            </div>

                            {/* Action Button */}
                            {isSubmarineCard && ownedSubmarine ? (
                              nextSpecForUpgrade ? (
                                <button 
                                  onClick={() => handleUpgradeSubmarine(ownedSubmarine.id, currentLevel)}
                                  style={{
                                    width: '100%',
                                    background: 'linear-gradient(to bottom, #10b981, #059669)',
                                    color: '#fff',
                                    border: '2px solid #34d399',
                                    borderRadius: '10px',
                                    padding: '10px 4px',
                                    fontSize: '11px',
                                    fontWeight: '900',
                                    fontFamily: 'Cairo, sans-serif',
                                    cursor: 'pointer',
                                    boxShadow: '0 0 12px rgba(16, 185, 129, 0.6)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '4px',
                                    animation: 'pulse 2s infinite'
                                  }}
                                >
                                  <span style={{ fontSize: '14px' }}>⚡</span>
                                  ترقية لـ ليفل {nextLevelForUpgrade - 31} بـ {nextSpecForUpgrade.price.toLocaleString('ar-EG')} 🪙
                                </button>
                              ) : (
                                <button 
                                  disabled
                                  style={{
                                    width: '100%',
                                    background: 'rgba(16, 185, 129, 0.2)',
                                    color: '#34d399',
                                    border: '1px solid #10b981',
                                    borderRadius: '8px',
                                    padding: '8px 4px',
                                    fontSize: '11px',
                                    fontWeight: 'bold',
                                    cursor: 'not-allowed'
                                  }}
                                >
                                  ⭐ أقصى مستوى
                                </button>
                              )
                            ) : isLocked ? (
                              <button 
                                disabled
                                style={{
                                  width: '100%',
                                  background: '#241a12',
                                  color: '#a1a1aa',
                                  border: '1px solid #3e2b1d',
                                  borderRadius: '8px',
                                  padding: '8px 4px',
                                  fontSize: '11px',
                                  fontWeight: 'bold',
                                  fontFamily: 'Cairo, sans-serif',
                                  cursor: 'not-allowed',
                                  marginTop: '8px'
                                }}
                              >
                                {isSubmarineCard ? '🔒 يتطلب أقصى مستوى لبيت السفن (31)' : `🔒 يتطلب بيت السفن ليفل ${spec.level}`}
                              </button>
                            ) : (
                              <button 
                                onClick={() => buyShipLevel(spec)}
                                style={{
                                  width: '100%',
                                  background: isSubmarineCard 
                                    ? 'linear-gradient(to bottom, #4f46e5, #3730a3)' 
                                    : (isEpicOrLegendary ? 'linear-gradient(to bottom, #8b5cf6, #5b21b6)' : 'linear-gradient(to bottom, #f59e0b, #d97706)'),
                                  color: '#fff',
                                  border: isSubmarineCard 
                                    ? '1.5px solid #818cf8' 
                                    : (isEpicOrLegendary ? '1.5px solid #c084fc' : '1.5px solid #fef08a'),
                                  borderRadius: '8px',
                                  padding: '8px 4px',
                                  fontSize: '12px',
                                  fontWeight: 'bold',
                                  fontFamily: 'Cairo, sans-serif',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  boxShadow: isSubmarineCard ? '0 2px 8px rgba(79, 70, 229, 0.4)' : '0 2px 4px rgba(0,0,0,0.3)',
                                  marginTop: '8px'
                                }}
                              >
                                {isSubmarineCard ? `🤿 شراء الغواصة بـ 🪙 ${spec.price.toLocaleString('ar-EG')}` : `شراء بـ 🪙 ${spec.price.toLocaleString('ar-EG')} 🚢`}
                              </button>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {shopSubTab === 'crew_services' && (
                <div>
                  <div style={{ color: '#064e3b', fontWeight: 'bold', fontSize: '15px', marginBottom: '10px', borderBottom: '1.5px solid #057857', paddingBottom: '4px' }}>
                    🍀 توظيف طواقم الدعم وخدمات الحظ لحماية وتسريع الصيد
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                    {/* Item 1: الحظ */}
                    <div style={{ background: '#d1fae5', border: '1.5px solid #057857', borderRadius: '8px', padding: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
                      {crewServices.luck && <div style={{ position: 'absolute', top: '4px', left: '4px', background: '#10b981', color: '#fff', fontSize: '8px', padding: '1px 5px', borderRadius: '8px' }}>نشط</div>}
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(5, 120, 87, 0.2)', border: '1px solid #057857', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                          <img src={LUCK_PIRATE_ICON} alt="قرصان الحظ" referrerPolicy="no-referrer" style={{ maxHeight: '34px', maxWidth: '34px', objectFit: 'contain' }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 'bold', color: '#064e3b', fontSize: '13px' }}>🎁 تميمة الحظ البحري</div>
                          <p style={{ color: '#047857', fontSize: '10px', margin: '3px 0' }}>تزيد كمية صيد الأسماك بنسبة +30% والذهب بنسبة +20%!</p>
                        </div>
                      </div>
                      <button onClick={() => buyCrewService('luck', 'تميمة الحظ البحري', 10)} disabled={crewServices.luck} style={{ background: crewServices.luck ? '#9ca3af' : '#10b981', color: '#fff', border: 'none', borderRadius: '4px', padding: '5px', fontSize: '10px', cursor: 'pointer', fontWeight: 'bold', width: '100%', marginTop: '6px' }}>
                        {crewServices.luck ? 'مفعّل' : 'تفعيل 💎 10'}
                      </button>
                    </div>

                    {/* Item 2: البحارة */}
                    <div style={{ background: '#d1fae5', border: '1.5px solid #057857', borderRadius: '8px', padding: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
                      {crewServices.sailors && <div style={{ position: 'absolute', top: '4px', left: '4px', background: '#10b981', color: '#fff', fontSize: '8px', padding: '1px 5px', borderRadius: '8px' }}>نشط</div>}
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(5, 120, 87, 0.2)', border: '1px solid #057857', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                          <img src={SAILOR_ICON} alt="بحار" referrerPolicy="no-referrer" style={{ maxHeight: '34px', maxWidth: '34px', objectFit: 'contain' }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 'bold', color: '#064e3b', fontSize: '13px' }}>👥 طاقم الملاحة السريع</div>
                          <p style={{ color: '#047857', fontSize: '10px', margin: '3px 0' }}>يسرع رحلات العودة والجمع بنسبة 50% ويضيف +15% ذهب!</p>
                        </div>
                      </div>
                      <button onClick={() => buyCrewService('sailors', 'طاقم الملاحة السريع', 15)} disabled={crewServices.sailors} style={{ background: crewServices.sailors ? '#9ca3af' : '#10b981', color: '#fff', border: 'none', borderRadius: '4px', padding: '5px', fontSize: '10px', cursor: 'pointer', fontWeight: 'bold', width: '100%', marginTop: '6px' }}>
                        {crewServices.sailors ? 'مفعّل' : 'تفعيل 💎 15'}
                      </button>
                    </div>

                    {/* Item 3: المرشد */}
                    <div style={{ background: '#d1fae5', border: '1.5px solid #057857', borderRadius: '8px', padding: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
                      {crewServices.guide && <div style={{ position: 'absolute', top: '4px', left: '4px', background: '#10b981', color: '#fff', fontSize: '8px', padding: '1px 5px', borderRadius: '8px' }}>نشط</div>}
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(5, 120, 87, 0.2)', border: '1px solid #057857', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                          <img src={SHIP_PILOT_ICON} alt="مرشد السفن" referrerPolicy="no-referrer" style={{ maxHeight: '34px', maxWidth: '34px', objectFit: 'contain' }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 'bold', color: '#064e3b', fontSize: '13px' }}>🧭 المرشد البحري الخبير</div>
                          <p style={{ color: '#047857', fontSize: '10px', margin: '3px 0' }}>يضاعف نقاط الخبرة (EXP x2) بالكامل لجميع عمليات الصيد!</p>
                        </div>
                      </div>
                      <button onClick={() => buyCrewService('guide', 'المرشد البحري الخبير', 12)} disabled={crewServices.guide} style={{ background: crewServices.guide ? '#9ca3af' : '#10b981', color: '#fff', border: 'none', borderRadius: '4px', padding: '5px', fontSize: '10px', cursor: 'pointer', fontWeight: 'bold', width: '100%', marginTop: '6px' }}>
                        {crewServices.guide ? 'مفعّل' : 'تفعيل 💎 12'}
                      </button>
                    </div>

                    {/* Item 4: حارس السفن */}
                    <div style={{ background: '#d1fae5', border: '1.5px solid #057857', borderRadius: '8px', padding: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
                      {crewServices.police && <div style={{ position: 'absolute', top: '4px', left: '4px', background: '#10b981', color: '#fff', fontSize: '8px', padding: '1px 5px', borderRadius: '8px' }}>حارس</div>}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={SHIP_GUARDIAN_ICON} alt="حارس السفن" referrerPolicy="no-referrer" style={{ width: '48px', height: '48px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
                        <div>
                          <div style={{ fontWeight: 'bold', color: '#064e3b', fontSize: '13px' }}>حارس السفن والمرفأ</div>
                          <p style={{ color: '#047857', fontSize: '10px', margin: '3px 0' }}>يحمي خزائن الذهب ومخازنك وأسطولك من السرقة والنهب بنسبة 100%!</p>
                        </div>
                      </div>
                      <button onClick={() => buyCrewService('police', 'حارس السفن والمرفأ', 18)} disabled={crewServices.police} style={{ background: crewServices.police ? '#9ca3af' : '#10b981', color: '#fff', border: 'none', borderRadius: '4px', padding: '5px', fontSize: '10px', cursor: 'pointer', fontWeight: 'bold', width: '100%', marginTop: '6px' }}>
                        {crewServices.police ? 'مفعّل ومحمي' : 'تفعيل 💎 18'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN */}
            <div style={{ width: '180px', background: '#23150b', borderRight: '2px solid #5c3a21', display: 'flex', flexDirection: 'column', padding: '10px', gap: '8px' }}>
              <div style={{ textAlign: 'center', background: 'linear-gradient(135deg, #b45309 0%, #78350f 100%)', border: '1px solid #fcd34d', borderRadius: '4px', padding: '6px 2px', color: '#fff', fontWeight: 'bold', fontSize: '12px' }}>
                ⚓ أسطول شابك 360 🔱
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                <button onClick={() => setShopSubTab('hamour')} style={{ background: shopSubTab === 'hamour' ? '#ca8a04' : '#3a200e', color: '#fff', border: '1px solid #5c3a21', borderRadius: '4px', padding: '8px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>
                  🔱 أسلحة الهامور
                </button>

                <button onClick={() => setShopSubTab('thihn')} style={{ background: shopSubTab === 'thihn' ? '#ca8a04' : '#3a200e', color: '#fff', border: '1px solid #5c3a21', borderRadius: '4px', padding: '8px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>
                  ⚙️ ترقيات الذهن
                </button>

                <button onClick={() => setShopSubTab('share')} style={{ background: shopSubTab === 'share' ? '#ca8a04' : '#3a200e', color: '#fff', border: '1px solid #5c3a21', borderRadius: '4px', padding: '8px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>
                  🚢 أسطول الشراء
                </button>

                <button onClick={() => setShopSubTab('crew_services')} style={{ background: shopSubTab === 'crew_services' ? '#10b981' : '#3a200e', color: '#fff', border: '1px solid #5c3a21', borderRadius: '4px', padding: '8px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>
                  🍀 خدمات الحظ والشرطي
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TRIBES TAB (القبائل والتحالفات) ----------------- */}
      {activeTab === 'tribes' && (
        <div className="tab-overlay" style={{ maxHeight: '85vh', overflowY: 'auto' }}>
          <div className="tab-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>🛡️ تحالفات وقبائل الميناء (Multiplayer)</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setShowCreateTribeModal(true)}
                style={{ background: 'linear-gradient(180deg, #16a34a 0%, #15803d 100%)', color: '#fff', border: '1px solid #86efac', borderRadius: '6px', padding: '6px 12px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>
                ➕ إنشاء تحالف جديد
              </button>
              <button className="close-tab-btn" onClick={() => setActiveTab('harbor')}>إغلاق</button>
            </div>
          </div>

          <p style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '14px' }}>
            انضم مع لاعبين حقيقيين من جميع أنحاء العالم لإنشاء تحالفات قوية، التبرع، وبناء أساطيل لا تقهر!
          </p>

          {/* Current Tribe Status if User in Tribe */}
          {tribeId && (
            <div style={{ background: 'rgba(234, 179, 8, 0.12)', border: '1.5px solid #ca8a04', padding: '12px', borderRadius: '12px', marginBottom: '16px' }}>
              <div style={{ fontWeight: 'bold', color: '#fef08a', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🛡️ تحالفك الحالي: {tribeName}</span>
              </div>
              <div style={{ fontSize: '12px', color: '#e2e8f0', marginTop: '6px' }}>
                أنت الآن عضو رسمي في هذا التحالف. يمكنك التبرع بالذهب لرفع مستواه أو التنسيق مع باقي الأعضاء في الشات العام!
              </div>
            </div>
          )}

          {/* Tribes List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {tribes.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '24px 12px', background: 'rgba(0,0,0,0.4)', borderRadius: '12px', border: '1px dashed #78350f' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏴‍☠️</div>
                <div style={{ fontWeight: 'bold', color: '#fef08a', marginBottom: '4px' }}>لا توجد تحالفات حالياً</div>
                <div style={{ fontSize: '12px' }}>كن أول قبطان يؤسس تحالفاً جديداً ويدعو اللاعبين للانضمام إليه!</div>
                <button 
                  onClick={() => setShowCreateTribeModal(true)}
                  style={{ marginTop: '12px', background: '#ca8a04', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>
                  إنشاء أول تحالف ➕
                </button>
              </div>
            ) : (
              tribes.map(t => {
                const currentUser = auth.currentUser;
                const isMember = t.members?.includes(currentUser?.uid);
                return (
                  <div key={t.id} style={{ background: isMember ? 'rgba(234, 179, 8, 0.15)' : 'rgba(28, 25, 23, 0.95)', border: isMember ? '2px solid #facc15' : '1px solid #78350f', padding: '14px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '12px' }}>
                      <div style={{ fontWeight: 'bold', color: '#fef08a', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{t.emblem}</span>
                        <span>{t.name}</span>
                        <span style={{ fontSize: '10px', background: '#ca8a04', color: '#000', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>مستوى {t.level}</span>
                      </div>
                      <div style={{ color: '#cbd5e1', marginTop: '4px' }}>
                        القائد: <span style={{ color: '#38bdf8' }}>@{t.leaderName}</span> | الأعضاء: <span style={{ color: '#facc15' }}>{t.membersCount || t.members?.length || 1}/50</span>
                      </div>
                      <div style={{ color: '#94a3b8', marginTop: '2px', fontSize: '11px' }}>
                        قوة التحالف: 🛡️ {(t.power || 0).toLocaleString()} | التبرعات: 🪙 {(t.donations || 0).toLocaleString()}
                      </div>
                      {t.description && (
                        <div style={{ color: '#a1a1aa', fontSize: '11px', marginTop: '4px', fontStyle: 'italic' }}>
                          "{t.description}"
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      {isMember && (
                        <button 
                          onClick={() => donateToTribe(t)}
                          style={{ background: '#ca8a04', color: '#000', border: '1px solid #fef08a', borderRadius: '6px', padding: '6px 12px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>
                          تبرع (100🪙)
                        </button>
                      )}
                      <button 
                        onClick={() => joinTribe(t)}
                        style={{ background: isMember ? '#991b1b' : '#1e3a8a', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>
                        {isMember ? 'مغادرة' : 'انضمام'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Create Tribe Modal Overlay */}
          {showCreateTribeModal && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
              <div style={{ background: '#1c1917', border: '2px solid #ca8a04', borderRadius: '16px', padding: '20px', maxWidth: '420px', width: '100%', color: '#fff', direction: 'rtl' }}>
                <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#fef08a', marginBottom: '12px', textAlign: 'center' }}>
                  🏴‍☠️ تأسيس تحالف جديد للميناء
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>اسم التحالف:</label>
                    <input 
                      type="text"
                      placeholder="مثال: تحالف أسياد الكاريبي"
                      value={newTribeName}
                      onChange={(e) => setNewTribeName(e.target.value)}
                      style={{ width: '100%', background: '#292524', border: '1px solid #ca8a04', borderRadius: '6px', padding: '8px', color: '#fff', fontSize: '12px', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>وصف التحالف:</label>
                    <textarea 
                      placeholder="اكتب شعار أو هدف التحالف..."
                      value={newTribeDesc}
                      onChange={(e) => setNewTribeDesc(e.target.value)}
                      rows={3}
                      style={{ width: '100%', background: '#292524', border: '1px solid #ca8a04', borderRadius: '6px', padding: '8px', color: '#fff', fontSize: '12px', outline: 'none', resize: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>شعار/أيقونة التحالف:</label>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '20px' }}>
                      {['🏴‍☠️', '⚓', '🦈', '🐉', '⚔️', '👑', '🦁'].map(emoji => (
                        <div 
                          key={emoji}
                          onClick={() => setNewTribeEmblem(emoji)}
                          style={{ cursor: 'pointer', padding: '6px', background: newTribeEmblem === emoji ? '#ca8a04' : '#292524', borderRadius: '6px', border: newTribeEmblem === emoji ? '2px solid #fff' : '1px solid #78350f' }}>
                          {emoji}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={() => setShowCreateTribeModal(false)}
                    style={{ background: '#64748b', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                    إلغاء
                  </button>
                  <button 
                    onClick={handleCreateTribe}
                    style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                    تأسيس التحالف 🎉
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ----------------- CHAT TAB (الشات والدردشة العامة) ----------------- */}
      {activeTab === 'chat' && (
        <div className="tab-overlay" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="tab-title">
            <span>💬 الدردشة العامة الحية (Multiplayer Chat)</span>
            <button className="close-tab-btn" onClick={() => setActiveTab('harbor')}>إغلاق</button>
          </div>

          <div ref={chatScrollRef} style={{ flex: 1, background: '#1c1917', borderRadius: '12px', padding: '14px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '260px', maxHeight: '380px', border: '1.5px solid #78350f' }}>
            {chatMessages.length === 0 ? (
              <div style={{ margin: 'auto', textAlign: 'center', color: '#a8a29e', fontSize: '15px', fontWeight: 'bold', padding: '24px' }}>
                <div style={{ fontSize: '40px', marginBottom: '8px' }}>💬</div>
                💬 الشات العام للميناء خالٍ حالياً.<br />كن أول من يكتب رسالة للترحيب باللاعبين من جميع أنحاء العالم!
              </div>
            ) : (
              chatMessages.map(msg => (
                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignSelf: msg.isMe ? 'flex-end' : 'flex-start', maxWidth: '85%', background: msg.isMe ? 'linear-gradient(180deg, #ca8a04 0%, #a16207 100%)' : '#292524', padding: '10px 14px', borderRadius: '14px', color: msg.isMe ? '#000' : '#fff', boxShadow: '0 3px 8px rgba(0,0,0,0.4)', border: msg.isMe ? '1.5px solid #fef08a' : '1px solid #44403c' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '900', color: msg.isMe ? '#1e1b4b' : '#facc15' }}>
                    <span style={{ fontSize: '20px' }}>{msg.avatar}</span>
                    <span>{msg.sender}</span>
                    <span style={{ fontSize: '11.5px', opacity: 0.8, marginRight: 'auto' }}>{msg.time}</span>
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: '700', lineHeight: '1.55', wordBreak: 'break-word', marginTop: '4px' }}>{msg.text}</div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={sendChatMessage} style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              placeholder="اكتب رسالة عامة ليراها جميع اللاعبين الحقيقيين..." 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              style={{ flex: 1, background: '#292524', border: '1.5px solid #ca8a04', borderRadius: '10px', padding: '12px 14px', color: '#fff', fontSize: '15px', fontWeight: 'bold', outline: 'none' }}
            />
            <button 
              type="submit" 
              style={{ background: 'linear-gradient(180deg, #ca8a04 0%, #a16207 100%)', border: '1px solid #fef08a', borderRadius: '10px', padding: '12px 24px', color: '#000', fontWeight: '900', cursor: 'pointer', fontSize: '15px', textShadow: '0 1px 2px rgba(255,255,255,0.4)', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>
              إرسال
            </button>
          </form>
        </div>
      )}

      {/* ----------------- FRIENDS TAB (قائمة الأصدقاء الحقيقيين) ----------------- */}
      {activeTab === 'friends' && (
        <div className="tab-overlay" style={{ maxHeight: '85vh', overflowY: 'auto' }}>
          <div className="tab-title">
            <span>👥 قائمة أصدقاء الميناء (Real Players)</span>
            <button className="close-tab-btn" onClick={() => setActiveTab('harbor')}>إغلاق</button>
          </div>
          <p style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '14px' }}>
            تواصل مع صيادين وقراصنة حقيقيين سجلوا في اللعبة، أرسل لهم هدايا الذهب، وزر موانئهم في أي وقت!
          </p>

          {/* Pending Friend Requests Section */}
          {friendRequests.length > 0 && (
            <div style={{ background: 'rgba(202, 138, 4, 0.15)', border: '1.5px solid #ca8a04', borderRadius: '12px', padding: '12px', marginBottom: '16px' }}>
              <div style={{ fontWeight: 'bold', color: '#fef08a', fontSize: '13px', marginBottom: '10px' }}>
                ✉️ طلبات الصداقة الواردة ({friendRequests.length}):
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {friendRequests.map((req, idx) => (
                  <div key={idx} style={{ background: '#1c1917', border: '1px solid #78350f', padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                      <span style={{ fontSize: '18px' }}>{req.senderAvatar || '⚓'}</span>
                      <span style={{ fontWeight: 'bold', color: '#38bdf8' }}>@{req.senderName}</span>
                      <span style={{ color: '#94a3b8', fontSize: '10px' }}>يريد إضافتك كصديق</span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        onClick={() => handleAcceptFriendRequest(req)}
                        style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>
                        قبول ✅
                      </button>
                      <button 
                        onClick={() => handleDeclineFriendRequest(req)}
                        style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>
                        رفض ❌
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Real Friends Section */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontWeight: 'bold', color: '#fef08a', fontSize: '13px', marginBottom: '10px' }}>
              🌟 أصدقائي الحاليون ({realPlayers.filter(p => friends.includes(p.userId)).length}):
            </div>
            {realPlayers.filter(p => friends.includes(p.userId)).length === 0 ? (
              <div style={{ textShadow: 'none', background: 'rgba(0,0,0,0.3)', border: '1px dashed #78350f', borderRadius: '8px', padding: '14px', textAlign: 'center', color: '#a8a29e', fontSize: '12px' }}>
                ليس لديك أصدقاء مضافون بعد.<br />اختر صياداً من القائمة بالأسفل وأرسل له طلب صداقة!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {realPlayers.filter(p => friends.includes(p.userId)).map(friend => {
                  const isOnline = friend.updatedAt && (new Date().getTime() - new Date(friend.updatedAt).getTime() < 600000);
                  return (
                    <div key={friend.userId} style={{ background: 'rgba(15, 23, 42, 0.95)', border: '1.5px solid #ca8a04', padding: '10px 14px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ fontSize: '22px', background: '#0284c7', width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #38bdf8' }}>
                          {friend.avatar || '⚓'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 'bold', color: '#fef08a', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {friend.username}
                            <span style={{ fontSize: '9px', background: isOnline ? '#22c55e' : '#64748b', color: '#fff', padding: '1px 5px', borderRadius: '4px' }}>
                              {isOnline ? 'متصل الآن 🟢' : 'غير متصل 🔴'}
                            </span>
                          </div>
                          <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '2px' }}>
                            الذهب: 🪙 {(friend.gold || 0).toLocaleString()} | سيرفر: {friend.server || 'الأسطورة 1'}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                          onClick={() => handleSendGiftToFriend(friend)}
                          style={{ background: 'linear-gradient(180deg, #ca8a04 0%, #854d0e 100%)', color: '#fff', border: '1px solid #fef08a', borderRadius: '6px', padding: '6px 10px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>
                          إرسال هدية (500🪙) 🎁
                        </button>
                        <button 
                          onClick={() => {
                            handleOpenProfile(friend);
                            setInspectedPlayerShipVisit(true);
                          }}
                          style={{ background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 10px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>
                          زيارة الميناء ⚓
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Search & Add Registered Real Players */}
          <div style={{ background: '#1c1917', border: '1px solid #78350f', borderRadius: '12px', padding: '12px' }}>
            <div style={{ fontWeight: 'bold', color: '#fef08a', fontSize: '13px', marginBottom: '8px' }}>
              🔍 البحث عن صايدي وقراصنة الميناء وإضافتهم:
            </div>
            <input 
              type="text"
              placeholder="اكتب اسم القبطان للبحث عنه..."
              value={friendSearchQuery}
              onChange={(e) => setFriendSearchQuery(e.target.value)}
              style={{ width: '100%', background: '#292524', border: '1px solid #ca8a04', borderRadius: '6px', padding: '8px', color: '#fff', fontSize: '12px', outline: 'none', marginBottom: '10px' }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
              {realPlayers
                .filter(p => p.userId !== auth.currentUser?.uid && !friends.includes(p.userId))
                .filter(p => !friendSearchQuery || p.username?.toLowerCase().includes(friendSearchQuery.toLowerCase()))
                .slice(0, 10)
                .map(p => (
                  <div key={p.userId} style={{ background: '#292524', padding: '8px 10px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{p.avatar || '⚓'}</span>
                      <span style={{ fontWeight: 'bold', color: '#fef08a' }}>@{p.username}</span>
                      <span style={{ color: '#94a3b8', fontSize: '10px' }}>🪙 {(p.gold || 0).toLocaleString()}</span>
                    </div>
                    <button 
                      onClick={() => handleSendFriendRequest(p)}
                      style={{ background: '#15803d', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                      إضافة صديق ➕
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

            {/* ----------------- LEADERBOARD TAB (لوحة الترتيب والمتصدرين - ملوك الأعماق) ----------------- */}
      {activeTab === 'leaderboard' && (
        <>
          <LeaderboardView
            realPlayers={realPlayers}
            currentUser={currentUser}
            currentGold={gold}
            currentGems={gems}
            leaderboardFilter={leaderboardFilter}
            setLeaderboardFilter={setLeaderboardFilter}
            leaderboardSearchQuery={leaderboardSearchQuery}
            setLeaderboardSearchQuery={setLeaderboardSearchQuery}
            handleOpenProfile={handleOpenProfile}
            setActiveTab={setActiveTab}
          />

          {/* Real Donation Modal Popup */}
          {donationTargetPlayer && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 999,
              direction: 'rtl',
              padding: '16px'
            }}>
              <div style={{
                background: 'linear-gradient(to bottom, #1c130c, #0f0a06)',
                border: '2px solid #ca8a04',
                borderRadius: '14px',
                width: '100%',
                maxWidth: '400px',
                padding: '20px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.8)'
              }}>
                <h3 style={{ margin: '0 0 12px 0', color: '#facc15', fontSize: '18px', textAlign: 'center' }}>
                  🪙 إرسال دعم ذهبي للقبطان
                </h3>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#130d09', padding: '10px', borderRadius: '10px', border: '1px solid #3c2919', marginBottom: '16px' }}>
                  <span style={{ fontSize: '32px' }}>{donationTargetPlayer.avatar || '⚓'}</span>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#fff' }}>@{donationTargetPlayer.username}</div>
                    <div style={{ fontSize: '11px', color: '#a8a29e' }}>رصيده الحالي: 🪙 {(donationTargetPlayer.gold || 0).toLocaleString()} ذهبة</div>
                  </div>
                </div>

                <div style={{ fontSize: '13px', color: '#cbd5e1', marginBottom: '12px' }}>
                  رصيدك الحالي المتاح للإرسال: <span style={{ color: '#22c55e', fontWeight: 'bold' }}>🪙 {gold.toLocaleString()} ذهبة</span>
                </div>

                <label style={{ display: 'block', fontSize: '12px', color: '#fef08a', marginBottom: '6px' }}>حدد مبلغ الدعم الذهبي:</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '14px' }}>
                  {[500, 2500, 10000, 50000].map(amt => (
                    <button
                      key={amt}
                      onClick={() => setDonationAmount(amt)}
                      style={{
                        background: donationAmount === amt ? '#ca8a04' : '#130d09',
                        color: donationAmount === amt ? '#000' : '#facc15',
                        border: '1px solid #ca8a04',
                        borderRadius: '6px',
                        padding: '6px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      {amt >= 1000 ? `${amt / 1000}K` : amt}
                    </button>
                  ))}
                </div>

                <input 
                  type="number"
                  min="1"
                  max={gold}
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{
                    width: '100%',
                    background: '#130d09',
                    border: '1.5px solid #3c2919',
                    borderRadius: '8px',
                    padding: '8px',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none',
                    textAlign: 'center',
                    marginBottom: '16px'
                  }}
                />

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={async () => {
                      if (donationAmount <= 0) {
                        alert("الرجاء تحديد مبلغ دعم صحيح!");
                        return;
                      }
                      if (gold < donationAmount) {
                        alert("⚠️ رصيدك من الذهب لا يكفي لإتمام عملية التبرع!");
                        return;
                      }
                      if (donationTargetPlayer.userId === auth.currentUser?.uid) {
                        alert("⚠️ لا يمكنك إرسال ذهب لنفسك!");
                        return;
                      }

                      try {
                        const targetRef = doc(db, 'users', donationTargetPlayer.id || donationTargetPlayer.userId);
                        const senderRef = doc(db, 'users', auth.currentUser!.uid);

                        await updateDoc(targetRef, {
                          gold: (donationTargetPlayer.gold || 0) + donationAmount
                        });

                        await updateDoc(senderRef, {
                          gold: gold - donationAmount
                        });

                        setGold(prev => prev - donationAmount);
                        showToast(`🪙 تم إرسال ${donationAmount.toLocaleString()} ذهب بنجاح إلى القبطان @${donationTargetPlayer.username}!`, 'success');
                        setDonationTargetPlayer(null);
                      } catch (err: any) {
                        console.error("Error doing donation transfer: ", err);
                        showToast("فشلت عملية التبرع: " + (err.message || 'خطأ في الاتصال'), 'error');
                      }
                    }}
                    style={{
                      flex: 1,
                      background: 'linear-gradient(to bottom, #10b981, #047857)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    تأكيد الإرسال 🚢
                  </button>
                  <button
                    onClick={() => setDonationTargetPlayer(null)}
                    style={{
                      flex: 1,
                      background: '#1f1610',
                      color: '#a8a29e',
                      border: '1px solid #3c2919',
                      borderRadius: '8px',
                      padding: '10px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ----------------- LOADING STATE OVERLAY (جاري فتح الملف الشخصي) ----------------- */}
      {isProfileLoading && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: '#090604',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Cairo, sans-serif'
        }}>
          <div style={{
            fontSize: '64px',
            animation: 'spin 2.5s infinite linear',
            marginBottom: '16px',
            filter: 'drop-shadow(0 0 10px rgba(250, 204, 21, 0.5))'
          }}>
            🧭
          </div>
          <div style={{
            color: '#facc15',
            fontSize: '20px',
            fontWeight: 'bold',
            animation: 'pulse 1.5s infinite ease-in-out'
          }}>
            جاري فتح الملف الشخصي...
          </div>
        </div>
      )}

      {/* ----------------- PLAYER PROFILE MODAL (الملف الشخصي للقبطان) ----------------- */}
      {inspectedPlayer && !isProfileLoading && !inspectedPlayerShipVisit && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          direction: 'rtl',
          fontFamily: 'Cairo, sans-serif'
        }}>
          <div style={{
            background: 'linear-gradient(to bottom, #110c08 0%, #1c130d 100%)',
            border: '2.5px solid #ca8a04',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '620px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.9), inset 0 0 30px rgba(202,138,4,0.15)',
            color: '#fff',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '90vh'
          }}>
            {/* Modal Header/Banner */}
            <div style={{
              background: 'radial-gradient(circle at center, #3c2514 0%, #150d06 100%)',
              borderBottom: '2px solid #ca8a04',
              padding: '24px 20px 20px 20px',
              position: 'relative',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              {/* Close Button */}
              <button 
                onClick={() => setInspectedPlayer(null)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  background: 'rgba(0,0,0,0.5)',
                  border: '1.5px solid #ef4444',
                  color: '#fca5a5',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  zIndex: 10
                }}
              >
                ✕
              </button>

              {/* Large Gold Framed User Avatar */}
              <div style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                border: '4px solid #facc15',
                background: '#0c0704',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px',
                boxShadow: '0 0 20px rgba(250, 204, 21, 0.4)',
                marginBottom: '12px'
              }}>
                {inspectedPlayer.avatar || '⚓'}
              </div>

              {/* Username & Class */}
              <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#facc15', margin: '0 0 4px 0', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                {inspectedPlayer.username}
              </h2>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px', color: '#cbd5e1' }}>
                <span style={{ background: '#78350f', border: '1px solid #ca8a04', borderRadius: '4px', padding: '2px 8px', fontWeight: 'bold' }}>
                  {inspectedPlayer.pirateClass || 'قبطان مغامر'}
                </span>
                <span>•</span>
                <span style={{ color: '#a8a29e' }}>
                  {inspectedPlayer.server || 'سيرفر الأسطورة 1'}
                </span>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div style={{
              padding: '20px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              backgroundColor: '#0a0604'
            }} className="no-scrollbar">
              
              {/* Stats Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '10px'
              }}>
                {/* Level Stat */}
                <div style={{
                  background: 'rgba(202,138,4,0.05)',
                  border: '1.5px solid #2d1e12',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span style={{ fontSize: '24px' }}>⭐</span>
                  <div>
                    <div style={{ fontSize: '11px', color: '#a8a29e', fontWeight: 'bold' }}>المستوى والقوة العامة</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#facc15' }}>
                      مستوى {Math.max(1, Math.floor(Math.sqrt(inspectedPlayer.exp || 0) / 10) + 1)}
                    </div>
                  </div>
                </div>

                {/* Gold Stat */}
                <div style={{
                  background: 'rgba(202,138,4,0.05)',
                  border: '1.5px solid #2d1e12',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span style={{ fontSize: '24px' }}>🪙</span>
                  <div>
                    <div style={{ fontSize: '11px', color: '#a8a29e', fontWeight: 'bold' }}>الرصيد الذهبي</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#34d399' }}>
                      {(inspectedPlayer.gold || 0).toLocaleString()} ذهبة
                    </div>
                  </div>
                </div>

                {/* Gems Stat */}
                <div style={{
                  background: 'rgba(202,138,4,0.05)',
                  border: '1.5px solid #2d1e12',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span style={{ fontSize: '24px' }}>💎</span>
                  <div>
                    <div style={{ fontSize: '11px', color: '#a8a29e', fontWeight: 'bold' }}>الجواهر الزرقاء</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#60a5fa' }}>
                      {(inspectedPlayer.gems || 0).toLocaleString()} جوهرة
                    </div>
                  </div>
                </div>

                {/* Tower Stat */}
                <div style={{
                  background: 'rgba(202,138,4,0.05)',
                  border: '1.5px solid #2d1e12',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span style={{ fontSize: '24px' }}>🏰</span>
                  <div>
                    <div style={{ fontSize: '11px', color: '#a8a29e', fontWeight: 'bold' }}>بيت السفن والبرج</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fb923c' }}>
                      مستوى {inspectedPlayer.shipTowerLevel || 1}
                    </div>
                  </div>
                </div>

                {/* Fish Storage Stat */}
                <div style={{
                  background: 'rgba(202,138,4,0.05)',
                  border: '1.5px solid #2d1e12',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span style={{ fontSize: '24px' }}>🐟</span>
                  <div>
                    <div style={{ fontSize: '11px', color: '#a8a29e', fontWeight: 'bold' }}>بيت السمك</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#38bdf8' }}>
                      مستوى {inspectedPlayer.fishStorageLevel || 1}
                    </div>
                  </div>
                </div>

                {/* Active Ships Stat */}
                <div style={{
                  background: 'rgba(202,138,4,0.05)',
                  border: '1.5px solid #2d1e12',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span style={{ fontSize: '24px' }}>⛵</span>
                  <div>
                    <div style={{ fontSize: '11px', color: '#a8a29e', fontWeight: 'bold' }}>الأسطول الحقيقي</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#a78bfa' }}>
                      {getInspectedPlayerShips(inspectedPlayer).filter((s: any) => s.exists !== false).length} سفن نشطة
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px',
                borderTop: '1.5px solid #2d1e12',
                borderBottom: '1.5px solid #2d1e12',
                padding: '14px 0'
              }}>
                <button 
                  onClick={() => {
                    setIsProfileLoading(true);
                    setTimeout(() => {
                      setIsProfileLoading(false);
                      setInspectedPlayerShipVisit(true);
                    }, 400);
                  }}
                  style={{
                    background: 'linear-gradient(to bottom, #0284c7, #0369a1)',
                    border: '1px solid #38bdf8',
                    borderRadius: '8px',
                    padding: '10px',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 10px rgba(2, 132, 199, 0.3)'
                  }}
                >
                  <span>⚓</span> زيارة الميناء والسفن
                </button>

                <button 
                  onClick={async () => {
                    const text = prompt(`💬 اكتب رسالتك السريعة لتبثها باسم القبطان @${username} إلى القبطان @${inspectedPlayer.username}:`);
                    if (!text || !text.trim()) return;
                    try {
                      await sendSecureChatMessage(username, avatar, `@${inspectedPlayer.username} ${text}`);
                      showToast(`🎉 تم بث رسالتك بنجاح في الجزيرة!`, 'success');
                    } catch (e) {
                      console.error("Error messaging player:", e);
                    }
                  }}
                  style={{
                    background: 'linear-gradient(to bottom, #7c3aed, #6d28d9)',
                    border: '1px solid #a78bfa',
                    borderRadius: '8px',
                    padding: '10px',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 10px rgba(124, 58, 237, 0.3)'
                  }}
                >
                  <span>💬</span> رسالة
                </button>

                <button 
                  onClick={() => {
                    alert(`✨ تم إرسال طلب صداقة رسمي إلى القبطان @${inspectedPlayer.username} بنجاح!`);
                  }}
                  style={{
                    background: 'linear-gradient(to bottom, #059669, #047857)',
                    border: '1px solid #34d399',
                    borderRadius: '8px',
                    padding: '10px',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 10px rgba(5, 150, 105, 0.3)'
                  }}
                >
                  <span>➕</span> إضافة صديق
                </button>
              </div>

              {/* Alliance Section */}
              <div style={{
                background: '#150e09',
                border: '1px solid #2d1e12',
                borderRadius: '10px',
                padding: '14px'
              }}>
                <h4 style={{ color: '#facc15', fontSize: '13px', fontWeight: 'bold', margin: '0 0 6px 0' }}>🏴‍☠️ التحالف البحري الحالي</h4>
                <p style={{ color: '#e7e5e4', fontSize: '12.5px', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🛡️</span>
                  <span>مستقل / لا ينتمي لأي حلف حالياً في جزيرة الكاريبي.</span>
                </p>
              </div>

              {/* Owned Ships List Section */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <h4 style={{ color: '#facc15', fontSize: '13.5px', fontWeight: 'bold', margin: '4px 0 2px 0', borderBottom: '1px solid #2d1e12', paddingBottom: '6px' }}>
                  🚢 أسطول سفن القبطان النشطة
                </h4>
                
                {getInspectedPlayerShips(inspectedPlayer).filter((s: any) => s.exists).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '16px', color: '#a8a29e', background: '#110c08', border: '1px dashed #2d1e12', borderRadius: '10px', fontSize: '12px' }}>
                    ⚠️ القبطان لا يملك أي سفن نشطة في الوقت الحالي.
                  </div>
                ) : (
                  getInspectedPlayerShips(inspectedPlayer).filter((s: any) => s.exists).map((ship: any, index: number) => (
                    <div 
                      key={index}
                      style={{
                        background: '#120a05',
                        border: '1.5px solid #2d1e12',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '32px' }}>{ship.imgEmoji || '🛶'}</span>
                        <div>
                          <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '14px' }}>{ship.name}</div>
                          <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '2px' }}>
                            المستوى: {ship.level} • قوة تدمير السفن: {ship.power || 5} • قوة التحمل: {ship.heart || 200} HP
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ----------------- VISITING SHIPS SEA VIEW ----------------- */}
      {inspectedPlayer && inspectedPlayerShipVisit && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'radial-gradient(circle, #022340 0%, #010f1c 100%)',
          zIndex: 9999,
          direction: 'rtl',
          fontFamily: 'Cairo, sans-serif',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Wave backgrounds using gentle css sway/movement to simulate realistic sea water */}
          <div style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.25,
            backgroundImage: 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, rgba(0,0,0,0) 70%)',
            pointerEvents: 'none'
          }} />

          {/* Glowing Top Floating Header */}
          <div style={{
            background: 'linear-gradient(to bottom, rgba(20, 14, 8, 0.96), rgba(12, 8, 5, 0.92))',
            borderBottom: '2.5px solid #ca8a04',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            zIndex: 30,
            boxShadow: '0 8px 30px rgba(0,0,0,0.6)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                border: '2px solid #facc15',
                background: '#0a0604',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                boxShadow: '0 0 12px rgba(250, 204, 21, 0.4)'
              }}>
                {inspectedPlayer.avatar || '⚓'}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '15px', fontWeight: '900', color: '#facc15' }}>
                    ميناء القبطان @{inspectedPlayer.username}
                  </span>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 'bold',
                    background: inspectedPlayer.portDestroyed ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                    color: inspectedPlayer.portDestroyed ? '#ef4444' : '#22c55e',
                    border: inspectedPlayer.portDestroyed ? '1px solid #ef4444' : '1px solid #22c55e',
                    padding: '2px 8px',
                    borderRadius: '12px'
                  }}>
                    {inspectedPlayer.portDestroyed ? '🔥 الميناء متضرر' : '🛡️ ميناء سليم'}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <span>🏴‍☠️ {inspectedPlayer.pirateClass || 'صياد البحار'}</span>
                  <span>🌐 {inspectedPlayer.server || 'سيرفر الأسطورة 1'}</span>
                  {inspectedPlayer.tribeName && <span>🚩 قبيلة: {inspectedPlayer.tribeName}</span>}
                </div>
              </div>
            </div>

            {/* Quick Harbor Stat Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid #ca8a04', borderRadius: '8px', padding: '4px 10px', fontSize: '11px', color: '#fef08a' }}>
                🏰 بيت السفن: <strong style={{ color: '#fb923c' }}>م.{inspectedPlayer.shipTowerLevel || 1}</strong>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid #ca8a04', borderRadius: '8px', padding: '4px 10px', fontSize: '11px', color: '#fef08a' }}>
                🐟 بيت السمك: <strong style={{ color: '#60a5fa' }}>م.{inspectedPlayer.fishStorageLevel || 1}</strong>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid #3c2919', borderRadius: '8px', padding: '4px 10px', fontSize: '11px', color: '#cbd5e1' }}>
                🪙 {(inspectedPlayer.gold || 0).toLocaleString()}
              </div>
              <div style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid #3c2919', borderRadius: '8px', padding: '4px 10px', fontSize: '11px', color: '#cbd5e1' }}>
                💎 {(inspectedPlayer.gems || 0).toLocaleString()}
              </div>
              
              <button 
                onClick={() => {
                  setIsProfileLoading(true);
                  setTimeout(() => {
                    setIsProfileLoading(false);
                    setInspectedPlayerShipVisit(false);
                  }, 400);
                }}
                style={{
                  background: 'linear-gradient(to bottom, #ca8a04, #854d0e)',
                  border: '1px solid #fef08a',
                  color: '#fff',
                  borderRadius: '8px',
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                🚪 العودة لمينائي
              </button>
            </div>
          </div>

            {/* Custom keyframe styles injection for nuclear bomb effects */}
            <style>{`
              @keyframes fade-in-out {
                0% { opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { opacity: 0; }
              }
              @keyframes fly-rocket {
                0% {
                  bottom: -100px;
                  right: 10%;
                  transform: rotate(-45deg) scale(0.6);
                  opacity: 0;
                }
                15% {
                  opacity: 1;
                }
                100% {
                  bottom: 45%;
                  right: 45%;
                  transform: rotate(-45deg) scale(1.3);
                }
              }
              @keyframes fly-rocket-targeted {
                0% {
                  left: 96%;
                  top: 96%;
                  transform: translate(-50%, -50%) rotate(var(--rocket-angle, -48deg)) scale(0.6);
                  opacity: 0;
                }
                6% {
                  opacity: 1;
                }
                100% {
                  left: var(--rocket-target-x, 45%);
                  top: var(--rocket-target-y, 49%);
                  transform: translate(-50%, -50%) rotate(var(--rocket-angle, -48deg)) scale(1.25);
                  opacity: 1;
                }
              }
              @keyframes fly-rocket-small-targeted {
                0% {
                  left: 96%;
                  top: 96%;
                  transform: translate(-50%, -50%) rotate(var(--rocket-angle, -48deg)) scale(0.5);
                  opacity: 0;
                }
                6% {
                  opacity: 1;
                }
                100% {
                  left: var(--rocket-target-x, 45%);
                  top: var(--rocket-target-y, 49%);
                  transform: translate(-50%, -50%) rotate(var(--rocket-angle, -48deg)) scale(0.95);
                  opacity: 1;
                }
              }
              @keyframes fly-rocket-med-targeted {
                0% {
                  left: 96%;
                  top: 96%;
                  transform: translate(-50%, -50%) rotate(var(--rocket-angle, -48deg)) scale(0.55);
                  opacity: 0;
                }
                6% {
                  opacity: 1;
                }
                100% {
                  left: var(--rocket-target-x, 45%);
                  top: var(--rocket-target-y, 49%);
                  transform: translate(-50%, -50%) rotate(var(--rocket-angle, -48deg)) scale(1.1);
                  opacity: 1;
                }
              }
              @keyframes rocket-launch-flash {
                0% {
                  transform: translate(-50%, -50%) scale(0.2);
                  opacity: 1;
                }
                50% {
                  transform: translate(-50%, -50%) scale(1.35);
                  opacity: 0.9;
                }
                100% {
                  transform: translate(-50%, -50%) scale(1.9);
                  opacity: 0;
                }
              }
              @keyframes float-xp-topleft {
                0% {
                  transform: translateY(-20px) scale(0.85);
                  opacity: 0;
                }
                15% {
                  transform: translateY(0) scale(1.05);
                  opacity: 1;
                }
                25% {
                  transform: translateY(0) scale(1);
                  opacity: 1;
                }
                80% {
                  transform: translateY(0) scale(1);
                  opacity: 1;
                }
                100% {
                  transform: translateY(-12px) scale(0.95);
                  opacity: 0;
                }
              }
              @keyframes fall-down {
                0% {
                  top: -140px;
                  transform: translateX(-50%) scale(0.65) rotate(4deg);
                  filter: brightness(1);
                  opacity: 0;
                }
                10% {
                  opacity: 1;
                }
                58% {
                  top: 48%;
                  transform: translateX(-50%) scale(0.95) rotate(0deg);
                  filter: brightness(1.2) drop-shadow(0 0 16px rgba(255, 152, 0, 0.85));
                }
                64% {
                  top: 52%;
                  transform: translateX(-50%) scale(1.0) rotate(0deg);
                  filter: brightness(1.35) drop-shadow(0 0 20px #38bdf8);
                }
                82% {
                  top: 59%;
                  transform: translateX(-50%) scale(0.9) rotate(0deg);
                  filter: hue-rotate(170deg) brightness(0.7) contrast(1.2) drop-shadow(0 0 25px #0284c7);
                }
                100% {
                  top: 65%;
                  transform: translateX(-50%) scale(1.05) rotate(0deg);
                  filter: hue-rotate(170deg) brightness(2.4) drop-shadow(0 0 45px #ffffff);
                }
              }
              @keyframes water-landing-splash {
                0% {
                  transform: translate(-50%, -50%) scale(0.1);
                  opacity: 0;
                }
                56% {
                  transform: translate(-50%, -50%) scale(0.15);
                  opacity: 0;
                }
                66% {
                  transform: translate(-50%, -50%) scale(1.0);
                  opacity: 0.95;
                }
                100% {
                  transform: translate(-50%, -50%) scale(2.4);
                  opacity: 0;
                }
              }
              @keyframes underwater-bubbles-rise {
                0% {
                  opacity: 0;
                  transform: scale(0.2);
                }
                62% {
                  opacity: 0;
                  transform: scale(0.3);
                }
                72% {
                  opacity: 1;
                  transform: scale(0.9) translateY(-10px);
                }
                100% {
                  opacity: 0.85;
                  transform: scale(1.4) translateY(-35px);
                }
              }
              @keyframes thruster-flame {
                0% { transform: scaleY(0.9) scaleX(0.95); opacity: 0.95; }
                100% { transform: scaleY(1.45) scaleX(1.15); opacity: 0.85; filter: brightness(1.6); }
              }
              @keyframes shake-viewport-extreme {
                0% { transform: translate(0, 0) scale(1) rotate(0deg); }
                5% { transform: translate(-18px, -14px) scale(1.05) rotate(-3deg); }
                10% { transform: translate(14px, 16px) scale(0.96) rotate(2.5deg); }
                15% { transform: translate(-16px, -12px) scale(1.04) rotate(-2deg); }
                20% { transform: translate(12px, -15px) scale(1.02) rotate(2deg); }
                25% { transform: translate(-10px, 12px) scale(0.98) rotate(-1.5deg); }
                30% { transform: translate(9px, 8px) scale(1.03) rotate(1.2deg); }
                35% { transform: translate(-7px, -9px) scale(0.99) rotate(-1deg); }
                40% { transform: translate(6px, -6px) scale(1.01) rotate(0.8deg); }
                45% { transform: translate(-5px, 5px) scale(1.02) rotate(-0.5deg); }
                50% { transform: translate(4px, -4px) scale(1.0) rotate(0.4deg); }
                60% { transform: translate(-3px, 3px) scale(1.01) rotate(-0.3deg); }
                70% { transform: translate(2px, -2px) scale(1.0) rotate(0.2deg); }
                80% { transform: translate(-1px, 1px) scale(1.01) rotate(-0.1deg); }
                90% { transform: translate(1px, 0px) scale(1.0) rotate(0deg); }
                100% { transform: translate(0, 0) scale(1) rotate(0deg); }
              }
              @keyframes camera-flash-and-grade {
                0% { filter: contrast(1) brightness(1) saturate(1); }
                1% { filter: contrast(3.5) brightness(4.0) saturate(0) invert(0.1); }
                8% { filter: contrast(2.5) brightness(2.5) saturate(0.5) hue-rotate(-15deg); }
                25% { filter: contrast(1.8) brightness(1.6) saturate(2.2) hue-rotate(-5deg); }
                50% { filter: contrast(1.4) brightness(1.2) saturate(1.6); }
                100% { filter: contrast(1) brightness(1) saturate(1); }
              }
              @keyframes nuclear-flash {
                0% { opacity: 0; background: #ffffff; }
                1% { opacity: 1; background: #ffffff; }
                15% { opacity: 1; background: radial-gradient(circle, #ffffff 15%, #fef08a 45%, #ea580c 75%, #000000 100%); }
                35% { opacity: 0.9; background: radial-gradient(circle, #f97316 20%, #7c2d12 65%, rgba(0,0,0,0.95) 100%); }
                75% { opacity: 0.55; background: radial-gradient(circle, #ea580c 10%, rgba(30,41,59,0.95) 75%, rgba(0,0,0,0.98) 100%); }
                100% { opacity: 0; background: transparent; }
              }
              @keyframes shockwave-expand-realistic {
                0% {
                  width: 10px;
                  height: 10px;
                  opacity: 1;
                  border-width: 32px;
                  filter: blur(1px) brightness(3);
                }
                15% {
                  opacity: 0.95;
                  border-width: 20px;
                  filter: blur(3px) brightness(2.2);
                }
                60% {
                  opacity: 0.6;
                  border-width: 6px;
                  filter: blur(8px) brightness(1.2);
                }
                100% {
                  width: 1700px;
                  height: 1700px;
                  opacity: 0;
                  border-width: 0.5px;
                  filter: blur(25px) brightness(0.5);
                }
              }
              @keyframes mushroom-cap-billow {
                0% {
                  transform: translate(-50%, -50%) scale(0.08);
                  opacity: 0;
                  filter: blur(2px) brightness(3) contrast(1.5);
                }
                6% {
                  opacity: 1;
                  filter: blur(0px) brightness(2.2) contrast(1.2);
                }
                35% {
                  transform: translate(-50%, -72%) scale(1.2);
                  opacity: 0.98;
                  filter: brightness(1.4) contrast(1.1);
                }
                70% {
                  transform: translate(-50%, -85%) scale(1.6) rotate(3deg);
                  opacity: 0.85;
                  filter: brightness(0.85) contrast(0.9) grayscale(0.2);
                }
                100% {
                  transform: translate(-50%, -95%) scale(2.0) rotate(6deg);
                  opacity: 0;
                  filter: blur(40px) brightness(0.2) grayscale(0.8);
                }
              }
              @keyframes stem-rise-volumetric {
                0% {
                  height: 0px;
                  transform: translateX(-50%) scaleX(0.1);
                  opacity: 0;
                  filter: brightness(3);
                }
                10% {
                  height: 40px;
                  transform: translateX(-50%) scaleX(0.6);
                  opacity: 1;
                }
                40% {
                  height: 250px;
                  transform: translateX(-50%) scaleX(1.3);
                  opacity: 0.95;
                  filter: brightness(1.5);
                }
                100% {
                  height: 310px;
                  transform: translateX(-50%) scaleX(1.8);
                  opacity: 0;
                  filter: blur(25px) brightness(0.1);
                }
              }
              @keyframes central-fire-core {
                0% { transform: scale(0.5) rotate(0deg); opacity: 1; filter: brightness(3); }
                50% { transform: scale(1.15) rotate(180deg); opacity: 0.95; filter: brightness(2) contrast(1.4); }
                100% { transform: scale(1.3) rotate(360deg); opacity: 0; filter: blur(20px) brightness(0.2); }
              }
              @keyframes base-dust-ring {
                0% { transform: translate(-50%, -10%) scale(0.1); opacity: 0; filter: blur(3px); }
                15% { opacity: 0.9; }
                100% { transform: translate(-50%, -30%) scale(2.4); opacity: 0; filter: blur(35px); }
              }
              @keyframes float-xp {
                0% { transform: translate(-50%, 40px) scale(0.7); opacity: 0; }
                15% { opacity: 1; }
                80% { opacity: 1; }
                100% { transform: translate(-50%, -140px) scale(1.2); opacity: 0; }
              }
              @keyframes spin-vortex {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>

          {/* Sea View Playground where Ships sit on the water */}
          <div 
            onClick={(e) => {
              if (isAtomicBombActive || showAtomicExplosion || isLargeRocketActive || showLargeRocketExplosion || isMediumRocketActive || showMediumRocketExplosion || isSmallRocketActive || showSmallRocketExplosion || showSmokeExplosion) {
                return;
              }
              const target = e.target as HTMLElement;
              // If clicked directly on the playground or video/background layer (clicking the port/harbor)
              const isPortClick = target === e.currentTarget || target.tagName === 'VIDEO' || target.getAttribute('data-harbor-bg') === 'true';
              if (isPortClick) {
                const baseShips = (inspectedPlayer.ships && Array.isArray(inspectedPlayer.ships) && inspectedPlayer.ships.length > 0)
                  ? inspectedPlayer.ships
                  : getInspectedPlayerShips(inspectedPlayer);
                const firstShip = baseShips[0] || { name: 'سفينة الأسطول', level: 1, power: 10, cargo: 2000, heart: inspectedPlayer.portDestroyed ? 0 : 10000 };
                const shipSpec = SHOP_SHIPS.find(s => s.level === firstShip.level) || SHOP_SHIPS[0];
                const firstLevel = firstShip.level || shipSpec.level || 1;
                setSelectedVisitedShip({
                  ...firstShip,
                  name: firstShip.name || shipSpec.name,
                  level: firstLevel,
                  cargo: firstShip.cargo || getShipCapacity(firstLevel) || 2000,
                  heart: typeof firstShip.heart === 'number' ? firstShip.heart : (inspectedPlayer.portDestroyed ? 0 : (shipSpec.heart || 10000)),
                  power: firstShip.power || shipSpec.power || 10
                });
                setActiveInteractionType('details');
              }
            }}
            style={{
              flex: 1,
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              animation: isShaking 
                ? 'shake-viewport-extreme 3.5s cubic-bezier(0.1, 0.8, 0.2, 1) infinite, camera-flash-and-grade 3.0s cubic-bezier(0.1, 0.9, 0.3, 1) forwards' 
                : 'none'
            }}
          >
            {/* Real animated water background video - only if port is not destroyed */}
            {!inspectedPlayer.portDestroyed && (
              <video
                src="/background_video.mp4"
                playsInline
                muted
                autoPlay
                loop
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  zIndex: 1,
                  pointerEvents: 'none',
                }}
              />
            )}
            
            {/* Fallback/Main background image - shows destroyed port if visited port is destroyed */}
            <div 
              data-harbor-bg="true"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: inspectedPlayer.portDestroyed 
                  ? "url('/backgrounds/destroyed_port.webp')" 
                  : "url('/backgrounds/harbor_main.webp')",
                backgroundSize: '100% 100%',
                backgroundPosition: 'center bottom',
                backgroundRepeat: 'no-repeat',
                zIndex: 0,
                pointerEvents: 'none'
              }} 
            />

            {/* Ambient water tint layer */}
            <div 
              data-harbor-bg="true"
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 3,
                background: inspectedPlayer.portDestroyed ? 'rgba(0,0,0,0.45)' : 'rgba(2, 35, 64, 0.15)',
                pointerEvents: 'none'
              }} 
            />

            {/* Real-time particles overlay if the visited port is destroyed */}
            {inspectedPlayer.portDestroyed && (
              <div style={{ position: 'absolute', inset: 0, zIndex: 4, pointerEvents: 'none' }}>
                <ParticlesEffect portDestroyed={true} />
              </div>
            )}

            {/* ----------------- REAL HARBOR BUILDINGS OF THE VISITED PLAYER ----------------- */}
            
            {/* 1. Fish House (بيت السمك) */}
            <div
              style={{
                position: 'absolute',
                left: '8%',
                top: '36%',
                width: '160px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 20,
                willChange: 'transform'
              }}
              onClick={() => {
                const lvl = inspectedPlayer.fishStorageLevel || 1;
                const cap = getFishHouseCapacity(lvl);
                setVisitedBuildingModal({
                  type: 'fish',
                  title: `بيت السمك للقبطان @${inspectedPlayer.username}`,
                  level: lvl,
                  capacity: cap,
                  image: getFishHouseImageUrl(lvl),
                  details: `مخزن الأسماك الحقيقي للقبطان @${inspectedPlayer.username}. تم ترقيته إلى المستوى ${lvl} بسعة تخزينية تبلغ ${cap.toLocaleString()} سمكة.`
                });
              }}
              title="بيت السمك"
            >
              <div style={{
                marginBottom: '6px',
                background: 'rgba(0,0,0,0.85)',
                padding: '4px 10px',
                borderRadius: '12px',
                border: '1px solid #38bdf8',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{ fontSize: '11px', fontWeight: '900', color: '#38bdf8', fontFamily: 'Cairo, sans-serif' }}>
                  🐟 بيت السمك (مستوى {inspectedPlayer.fishStorageLevel || 1})
                </span>
              </div>

              <div style={{
                width: '160px',
                height: '160px',
                position: 'relative',
                filter: inspectedPlayer.portDestroyed 
                  ? 'grayscale(0.8) brightness(0.3) drop-shadow(0 0 10px rgba(239,68,68,0.7))'
                  : 'drop-shadow(0 14px 22px rgba(0,0,0,0.65))',
                transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center'
              }}>
                <img
                  src={getFishHouseImageUrl(inspectedPlayer.fishStorageLevel || 1)}
                  alt={`بيت السمك - مستوى ${inspectedPlayer.fishStorageLevel || 1}`}
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    pointerEvents: 'none',
                    filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.7))',
                    transform: 'scaleX(-1)'
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/FISH/refs/heads/main/level-01.png";
                  }}
                />
              </div>
            </div>

            {/* 2. Ship House / Tower (بيت السفن) */}
            <div
              style={{
                position: 'absolute',
                left: '73%',
                top: '26%',
                width: '170px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 20,
                willChange: 'transform'
              }}
              onClick={() => {
                const lvl = inspectedPlayer.shipTowerLevel || 1;
                const activeShipsCount = getInspectedPlayerShips(inspectedPlayer).filter((s: any) => s.exists !== false).length;
                setVisitedBuildingModal({
                  type: 'shipTower',
                  title: `بيت السفن والبرج الساحلي للقبطان @${inspectedPlayer.username}`,
                  level: lvl,
                  image: getHarborImageUrl(lvl),
                  details: `برج قيادة الميناء وترسانة السفن الحقيقية للقبطان @${inspectedPlayer.username}. المستوى الحالي هو ${lvl}، ويحتوي على ${activeShipsCount} سفن نشطة في أسطوله.`
                });
              }}
              title="بيت السفن"
            >
              <div style={{
                marginBottom: '6px',
                background: 'rgba(0,0,0,0.85)',
                padding: '4px 10px',
                borderRadius: '12px',
                border: '1px solid #ca8a04',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
              }}>
                <span style={{ fontSize: '11px', fontWeight: '900', color: '#facc15', fontFamily: 'Cairo, sans-serif' }}>
                  ⚓ بيت السفن (مستوى {inspectedPlayer.shipTowerLevel || 1})
                </span>
              </div>

              <div style={{
                width: '160px',
                height: '160px',
                position: 'relative',
                filter: inspectedPlayer.portDestroyed
                  ? 'grayscale(0.8) brightness(0.3) drop-shadow(0 0 10px rgba(239,68,68,0.7))'
                  : 'drop-shadow(0 12px 20px rgba(0,0,0,0.5))',
                transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center'
              }}>
                <img
                  src={getHarborImageUrl(inspectedPlayer.shipTowerLevel || 1)}
                  alt="بيت السفن"
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    pointerEvents: 'none',
                    filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.7))'
                  }}
                />
              </div>
            </div>

            {/* ----------------- REAL SHIPS OF THE VISITED PLAYER ----------------- */}
            {getInspectedPlayerShips(inspectedPlayer).filter((s: any) => s.exists !== false).length === 0 ? (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#cbd5e1',
                background: 'rgba(15, 10, 5, 0.9)',
                border: '2px solid #ca8a04',
                borderRadius: '16px',
                padding: '30px',
                textAlign: 'center',
                maxWidth: '400px',
                zIndex: 10,
                boxShadow: '0 10px 30px rgba(0,0,0,0.8)'
              }}>
                <span style={{ fontSize: '48px' }}>🌊</span>
                <h4 style={{ margin: '14px 0 6px 0', fontWeight: 'bold', color: '#facc15' }}>المياه هادئة تماماً</h4>
                <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5' }}>لا توجد أي سفن نشطة للقبطان راسية في مياهه الإقليمية في هذه اللحظة.</p>
              </div>
            ) : (
              getInspectedPlayerShips(inspectedPlayer).filter((s: any) => s.exists !== false).map((ship: any, index: number) => {
                // Get real-time position coordinates matching docks object as fallback
                const dockKey = `s${ship.id || index + 1}`;
                const fallbackPos = docks[dockKey] || docks[`s${index + 1}`] || { l: '45%', t: '49%' };
                
                const shipLeft = ship.left || fallbackPos.l;
                const shipTop = ship.top || fallbackPos.t;
                const shipScaleX = typeof ship.scaleX === 'number' ? ship.scaleX : 1;
                const shipLevel = typeof ship.level === 'number' ? ship.level : (SHOP_SHIPS.find(s => s.name === ship.name)?.level ?? 0);
                const shipSpec = SHOP_SHIPS.find(s => s.level === shipLevel) || SHOP_SHIPS[0];
                const shipCapacity = ship.cargo || getShipCapacity(shipLevel);

                // Determine ship aura filter based on upgrades
                const sSpeed = ship.speedLevel || 1;
                const sCap = ship.capacityLevel || 1;
                const sDef = ship.defenseLevel || 1;
                const isUpgraded = sSpeed > 1 || sCap > 1 || sDef > 1;

                let shipAuraFilter = 'drop-shadow(0 12px 10px rgba(0,0,0,0.65))';
                if (isUpgraded) {
                  if (sSpeed >= sCap && sSpeed >= sDef) {
                    shipAuraFilter = `drop-shadow(0 0 8px rgba(6, 182, 212, 0.95)) drop-shadow(0 6px 6px rgba(0,0,0,0.6))`;
                  } else if (sCap >= sSpeed && sCap >= sDef) {
                    shipAuraFilter = `drop-shadow(0 0 8px rgba(234, 179, 8, 0.95)) drop-shadow(0 6px 6px rgba(0,0,0,0.6))`;
                  } else {
                    shipAuraFilter = `drop-shadow(0 0 8px rgba(16, 185, 129, 0.95)) drop-shadow(0 6px 6px rgba(0,0,0,0.6))`;
                  }
                }

                const isShipDestroyed = Boolean(inspectedPlayer.portDestroyed || (typeof ship.heart === 'number' && ship.heart <= 0));

                return (
                  <div
                    key={ship.id || index}
                    className={`ship ${ship.moving ? 'moving' : ''}`}
                    style={{
                      position: 'absolute',
                      left: shipLeft,
                      top: shipTop,
                      transform: `scaleX(${shipScaleX}) ${isShipDestroyed ? 'rotate(12deg) translateY(24px)' : ''}`,
                      zIndex: 5,
                      cursor: 'pointer',
                      filter: isShipDestroyed 
                        ? 'grayscale(0.85) brightness(0.22) contrast(1.4) sepia(0.5) hue-rotate(-15deg) drop-shadow(0 0 10px rgba(239,68,68,0.85))' 
                        : shipAuraFilter,
                      transition: `left ${ship.transitionDuration || '2s'} ease-in-out, top ${ship.transitionDuration || '2s'} ease-in-out, transform 0.5s ease-in-out`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isAtomicBombActive || showAtomicExplosion || isLargeRocketActive || showLargeRocketExplosion || isMediumRocketActive || showMediumRocketExplosion || isSmallRocketActive || showSmallRocketExplosion || showSmokeExplosion) {
                        return;
                      }
                      setSelectedVisitedShip({
                        ...ship,
                        name: ship.name || shipSpec.name,
                        level: shipLevel,
                        cargo: shipCapacity,
                        heart: ship.heart !== undefined ? ship.heart : (inspectedPlayer.portDestroyed ? 0 : shipSpec.heart),
                        power: ship.power || shipSpec.power
                      });
                      setActiveInteractionType('details');
                    }}
                  >
                    {/* Glowing dock water ring */}
                    <div style={{
                      position: 'absolute',
                      bottom: '-4px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '120px',
                      height: '24px',
                      background: 'radial-gradient(ellipse at center, rgba(234, 179, 8, 0.25) 0%, rgba(234, 179, 8, 0) 70%)',
                      borderRadius: '50%',
                      zIndex: -1,
                      pointerEvents: 'none'
                    }} />

                    {/* Floating realistic boat image inside inner wrapper with status overlaid */}
                    <div className="relative ship-inner" style={{ width: 'var(--ship-render-width)', height: 'calc(var(--ship-render-width) * 0.95)', margin: '0 auto' }}>
                      
                      {/* Floating HP Overlay Bar */}
                      <div style={{
                        position: 'absolute',
                        top: '-46px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2px',
                        zIndex: 7,
                        pointerEvents: 'none'
                      }}>
                        {(() => {
                          const maxHeart = ship.maxHeart || shipSpec.heart || 200;
                          const currentHeart = typeof ship.heart === 'number' ? Math.min(ship.heart, maxHeart) : (inspectedPlayer.portDestroyed ? 0 : maxHeart);
                          const heartPercent = Math.min(100, Math.max(0, (currentHeart / maxHeart) * 100));
                          return (
                            <>
                              <div style={{
                                fontSize: '10px',
                                fontWeight: 'bold',
                                color: '#fff',
                                textShadow: '0 1px 2px #000',
                                background: 'rgba(0,0,0,0.6)',
                                padding: '1px 5px',
                                borderRadius: '4px',
                                whiteSpace: 'nowrap'
                              }}>
                                {currentHeart.toLocaleString()} / {maxHeart.toLocaleString()} HP
                              </div>
                              <div style={{
                                width: '60px',
                                height: '5px',
                                background: 'rgba(0,0,0,0.7)',
                                border: '1px solid #000',
                                borderRadius: '3px',
                                overflow: 'hidden'
                              }}>
                                <div style={{
                                  width: `${heartPercent}%`,
                                  height: '100%',
                                  background: currentHeart === 0 ? '#ef4444' : (heartPercent < 35 ? '#f59e0b' : '#22c55e'),
                                  transition: 'width 1.2s ease-in-out'
                                }} />
                              </div>
                            </>
                          );
                        })()}
                      </div>

                      <div style={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        filter: isShipDestroyed ? 'grayscale(1) brightness(0.25) contrast(1.3) sepia(1) hue-rotate(-20deg)' : 'none',
                        transition: 'filter 1.2s ease'
                      }}>
                        <ShipImage level={shipLevel} width={280} plain={true} fill={true} />
                        
                        {/* Burning smoke & fire for wrecked ships */}
                        {isShipDestroyed && (
                          <div style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            gap: '4px',
                            zIndex: 10,
                            pointerEvents: 'none'
                          }}>
                            <span style={{ fontSize: '28px', animation: 'bounce 0.8s infinite alternate' }}>🔥</span>
                            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#fca5a5', background: 'rgba(0,0,0,0.85)', padding: '2px 6px', borderRadius: '4px', border: '1px solid #ef4444' }}>مدمّرة 💀</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Tiny level floating badge overlaid elegantly */}
                      <span style={{
                        position: 'absolute',
                        bottom: '-4px',
                        right: '8px',
                        background: 'rgba(133, 77, 14, 0.95)',
                        color: '#fff',
                        border: '1px solid #fef08a',
                        borderRadius: '4px',
                        fontSize: '10px',
                        padding: '1px 4px',
                        fontWeight: 'bold',
                        zIndex: 5,
                        whiteSpace: 'nowrap',
                        direction: 'rtl',
                      }}>
                        {ship.imgEmoji || shipSpec.emoji || '⛵'} م.{shipLevel}
                      </span>

                      {/* Floating Name Overlay */}
                      <span style={{
                        position: 'absolute',
                        top: '-24px',
                        left: '50%',
                        transform: 'translateX(-50%) scaleX(1)', // Keep text readable even when ship is flipped left
                        background: 'rgba(15, 10, 5, 0.95)',
                        border: '1px solid #ca8a04',
                        borderRadius: '8px',
                        padding: '4px 12px',
                        fontSize: '11px',
                        color: '#fef08a',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        zIndex: 6,
                        boxShadow: '0 4px 10px rgba(0,0,0,0.6)'
                      }}>
                        {ship.name || shipSpec.name}
                      </span>
                    </div>
                  </div>
                );
              })
            )}

            {/* Red Swirling Portal Back Button (Bottom Left) */}
            <div 
              onClick={() => {
                setIsProfileLoading(true);
                setTimeout(() => {
                  setIsProfileLoading(false);
                  setInspectedPlayerShipVisit(false);
                }, 600);
              }}
              style={{
                position: 'absolute',
                bottom: '30px',
                left: '30px',
                width: '74px',
                height: '74px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #ef4444 0%, #7f1d1d 70%, #450a0a 100%)',
                border: '3.5px solid #ca8a04',
                boxShadow: '0 0 25px #ef4444, inset 0 0 15px rgba(255,255,255,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                cursor: 'pointer',
                animation: 'pulse 1.8s infinite ease-in-out',
                zIndex: 100
              }}
              title="العودة للميناء الرئيسي"
            >
              🌀
            </div>

            {/* Seamless Authentic Atomic Bomb Sky Descent, Sea Water Penetration & Underwater Detonation */}
            {isAtomicBombActive && (
              <AtomicBombExplosion
                x="45%"
                surfaceY="48%"
                depthY="64%"
                onComplete={() => {
                  setIsAtomicBombActive(false);
                  setShowAtomicExplosion(false);
                }}
              />
            )}

            {/* Real-time Floating XP Badge for Atomic Bomb Matching Video */}
            {showAtomicBombXp && (
              <div
                style={{
                  position: 'absolute',
                  top: '18px',
                  left: '18px',
                  zIndex: 9999,
                  background: 'rgba(15, 10, 5, 0.94)',
                  border: '2px solid #ca8a04',
                  borderRadius: '24px',
                  padding: '6px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.85), 0 0 14px rgba(202, 138, 4, 0.5)',
                  animation: 'float-xp-topleft 2.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                  pointerEvents: 'none',
                  direction: 'ltr',
                }}
              >
                <span style={{ fontSize: '15px' }}>⭐</span>
                <span style={{ fontSize: '14px', fontWeight: 900, color: '#fde047', letterSpacing: '0.5px' }}>
                  XP +2500
                </span>
              </div>
            )}

            {/* Real-time Floating XP Badge Matching Video */}
            {showRocketXp && (
              <div
                style={{
                  position: 'absolute',
                  top: '18px',
                  left: '18px',
                  zIndex: 9999,
                  background: 'rgba(15, 10, 5, 0.94)',
                  border: '2px solid #ca8a04',
                  borderRadius: '24px',
                  padding: '6px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.85), 0 0 14px rgba(202, 138, 4, 0.5)',
                  animation: 'float-xp-topleft 2.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                  pointerEvents: 'none',
                  direction: 'ltr',
                }}
              >
                <span style={{ fontSize: '15px' }}>⭐</span>
                <span style={{ fontSize: '14px', fontWeight: 900, color: '#fde047', letterSpacing: '0.5px' }}>
                  {rocketXpText || 'XP +100'}
                </span>
              </div>
            )}

            {/* Rocket Launch Flash & Exhaust Ring Effect at Bottom-Right Corner */}
            {(isSmallRocketActive || isMediumRocketActive || isLargeRocketActive) && (
              <div 
                style={{
                  position: 'absolute',
                  left: '96%',
                  top: '96%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 9998,
                  pointerEvents: 'none'
                }}
              >
                <div 
                  style={{
                    width: '74px',
                    height: '74px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, #ffffff 15%, #fde047 40%, #ea580c 70%, transparent 100%)',
                    animation: 'rocket-launch-flash 0.45s ease-out forwards',
                    filter: 'drop-shadow(0 0 18px #f97316)'
                  }} 
                />
              </div>
            )}

            {/* Small Rocket Flying Animation (Launching from Bottom Right) */}
            {isSmallRocketActive && (
              <div 
                style={{
                  position: 'absolute',
                  zIndex: 9999,
                  pointerEvents: 'none',
                  animation: 'fly-rocket-small-targeted 0.75s cubic-bezier(0.2, 0.7, 0.35, 1) forwards',
                  '--rocket-target-x': rocketTargetPos.l,
                  '--rocket-target-y': rocketTargetPos.t,
                  '--rocket-angle': getRocketLaunchAngle(rocketTargetPos.l, rocketTargetPos.t),
                } as React.CSSProperties}
              >
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img 
                    src={WEAPON_SMALL_MISSILE_ICON} 
                    alt="صاروخ صغير طائر" 
                    referrerPolicy="no-referrer"
                    style={{ 
                      width: '48px', 
                      height: '48px', 
                      objectFit: 'contain', 
                      filter: 'drop-shadow(0 0 12px rgba(250, 204, 21, 0.95)) drop-shadow(0 2px 8px rgba(0,0,0,0.8))' 
                    }} 
                  />
                  {/* Thruster exhaust flame behind the small missile */}
                  <div style={{
                    position: 'absolute',
                    bottom: '-10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '15px',
                    height: '24px',
                    borderRadius: '50% 50% 20% 20%',
                    background: 'radial-gradient(ellipse at top, #ffffff 10%, #fef08a 35%, #f97316 70%, transparent 100%)',
                    animation: 'thruster-flame 0.1s infinite alternate',
                    filter: 'drop-shadow(0 0 8px #f97316)',
                    zIndex: -1
                  }} />
                </div>
              </div>
            )}

            {/* Medium Rocket Flying Animation (Launching from Bottom Right) */}
            {isMediumRocketActive && (
              <div 
                style={{
                  position: 'absolute',
                  zIndex: 9999,
                  pointerEvents: 'none',
                  animation: 'fly-rocket-med-targeted 0.9s cubic-bezier(0.18, 0.72, 0.35, 1) forwards',
                  '--rocket-target-x': rocketTargetPos.l,
                  '--rocket-target-y': rocketTargetPos.t,
                  '--rocket-angle': getRocketLaunchAngle(rocketTargetPos.l, rocketTargetPos.t),
                } as React.CSSProperties}
              >
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img 
                    src={WEAPON_MEDIUM_MISSILE_ICON} 
                    alt="صاروخ متوسط طائر" 
                    referrerPolicy="no-referrer"
                    style={{ 
                      width: '58px', 
                      height: '58px', 
                      objectFit: 'contain', 
                      filter: 'drop-shadow(0 0 14px rgba(251, 146, 60, 0.95)) drop-shadow(0 2px 8px rgba(0,0,0,0.8))' 
                    }} 
                  />
                  {/* Thruster exhaust flame behind the medium missile */}
                  <div style={{
                    position: 'absolute',
                    bottom: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '18px',
                    height: '28px',
                    borderRadius: '50% 50% 20% 20%',
                    background: 'radial-gradient(ellipse at top, #ffffff 10%, #fef08a 30%, #f97316 65%, #dc2626 90%, transparent 100%)',
                    animation: 'thruster-flame 0.1s infinite alternate',
                    filter: 'drop-shadow(0 0 10px #f97316)',
                    zIndex: -1
                  }} />
                </div>
              </div>
            )}

            {/* Large Rocket Flying Animation (Launching from Bottom Right) */}
            {isLargeRocketActive && (
              <div 
                style={{
                  position: 'absolute',
                  zIndex: 9999,
                  pointerEvents: 'none',
                  animation: 'fly-rocket-targeted 1.25s cubic-bezier(0.18, 0.72, 0.35, 1) forwards',
                  '--rocket-target-x': rocketTargetPos.l,
                  '--rocket-target-y': rocketTargetPos.t,
                  '--rocket-angle': getRocketLaunchAngle(rocketTargetPos.l, rocketTargetPos.t),
                } as React.CSSProperties}
              >
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img 
                    src={WEAPON_LARGE_MISSILE_ICON} 
                    alt="صاروخ كبير طائر" 
                    referrerPolicy="no-referrer"
                    style={{ 
                      width: '78px', 
                      height: '78px', 
                      objectFit: 'contain', 
                      filter: 'drop-shadow(0 0 16px rgba(239, 68, 68, 0.95)) drop-shadow(0 4px 10px rgba(0,0,0,0.8))' 
                    }} 
                  />
                  {/* Thruster exhaust flame behind the missile */}
                  <div style={{
                    position: 'absolute',
                    bottom: '-14px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '22px',
                    height: '36px',
                    borderRadius: '50% 50% 20% 20%',
                    background: 'radial-gradient(ellipse at top, #ffffff 10%, #fef08a 35%, #f97316 70%, transparent 100%)',
                    animation: 'thruster-flame 0.12s infinite alternate',
                    filter: 'drop-shadow(0 0 10px #f97316)',
                    zIndex: -1
                  }} />
                </div>
              </div>
            )}

            {/* Small Rocket Comic Cloud Explosion Exactly Matching User Reference Video */}
            {showSmallRocketExplosion && (
              <SmallRocketExplosion
                x={rocketTargetPos.l}
                y={rocketTargetPos.t}
                damage={800}
                onComplete={() => setShowSmallRocketExplosion(false)}
              />
            )}

            {/* Medium Rocket Comic Cloud Explosion Exactly Matching User Reference Video */}
            {showMediumRocketExplosion && (
              <MediumRocketExplosion
                x={rocketTargetPos.l}
                y={rocketTargetPos.t}
                damage={4000}
                onComplete={() => setShowMediumRocketExplosion(false)}
              />
            )}

            {/* Realistic Multi-Cloud Comic Explosion Exactly Matching User Reference Video */}
            {showLargeRocketExplosion && (
              <LargeRocketExplosion
                x={rocketTargetPos.l}
                y={rocketTargetPos.t}
                damage={18000}
                onComplete={() => setShowLargeRocketExplosion(false)}
              />
            )}

            {/* Ad Bomb Smoke Explosion */}
            {showSmokeExplosion && (
              <div style={{
                position: 'absolute',
                left: '50%',
                top: '55%',
                transform: 'translate(-50%, -50%)',
                zIndex: 998,
                width: '320px',
                height: '320px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(161, 161, 170, 0.8) 0%, rgba(63, 63, 70, 0.6) 60%, rgba(0,0,0,0) 80%)',
                boxShadow: '0 0 50px rgba(161,161,170,0.6)',
                animation: 'zoom-in-out 1.8s ease-out forwards',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '96px'
              }}>
                💨📺💨
              </div>
            )}

            {/* Active Advertisement Billboard */}
            {inspectedPlayer?.activeAd && (
              <div style={{
                position: 'absolute',
                top: '12%',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 990,
                background: 'rgba(9, 9, 11, 0.95)',
                border: '3px solid #22c55e',
                borderRadius: '16px',
                padding: '12px 18px',
                width: '90%',
                maxWidth: '340px',
                boxShadow: '0 0 25px rgba(34, 197, 94, 0.65)',
                textAlign: 'center',
                direction: 'rtl',
                fontFamily: 'Cairo, sans-serif',
                animation: 'pulse 2s infinite alternate'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '10px', background: '#14532d', color: '#4ade80', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>📺 إعلان نشط</span>
                  <span style={{ fontSize: '10px', color: '#a1a1aa' }}>بث مباشر 🔴</span>
                </div>
                
                <div style={{ padding: '8px', background: '#18181b', borderRadius: '8px', border: '1px solid #27272a', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  {inspectedPlayer.activeAd === 'luffy_king' && (
                    <>
                      <div style={{ fontSize: '40px', animation: 'bounce 2s infinite' }}>☠️</div>
                      <div style={{ fontSize: '14px', fontWeight: '900', color: '#facc15' }}>لوفي ملك القراصنة 🏴‍☠️</div>
                      <div style={{ fontSize: '11px', color: '#cbd5e1' }}>"سأصبح ملك القراصنة! ههههههاا!"</div>
                    </>
                  )}
                  {(inspectedPlayer.activeAd === 'jack_sabro' || inspectedPlayer.activeAd === 'deep_dragon') && (
                    <>
                      <div style={{ fontSize: '40px', animation: 'bounce 2s infinite' }}>🦎</div>
                      <div style={{ fontSize: '14px', fontWeight: '900', color: '#38bdf8' }}>تنين الأعماق</div>
                      <div style={{ fontSize: '11px', color: '#cbd5e1' }}>مغامرات الزواحف المائية الكبرى!</div>
                    </>
                  )}
                  {inspectedPlayer.activeAd === 'luffy_grandeur' && (
                    <>
                      <div style={{ fontSize: '40px', animation: 'pulse 1s infinite' }}>🔥</div>
                      <div style={{ fontSize: '14px', fontWeight: '900', color: '#f97316' }}>فخامة لوفي</div>
                      <div style={{ fontSize: '11px', color: '#cbd5e1' }}>قوة الجير الخامس اللانهائية الهزلية!</div>
                    </>
                  )}
                  {inspectedPlayer.activeAd === 'anf' && (
                    <>
                      <div style={{ fontSize: '40px', animation: 'pulse 1s infinite' }}>👑</div>
                      <div style={{ fontSize: '14px', fontWeight: '900', color: '#a855f7' }}>وإذا سطا خاف الأنام</div>
                      <div style={{ fontSize: '11px', color: '#cbd5e1' }}>من هيبته وهاب البواسل مبسمه!</div>
                    </>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button 
                    onClick={() => {
                      playDetonationWarningVoiceAndSound();
                    }}
                    style={{
                      flex: 1,
                      background: 'linear-gradient(to bottom, #22c55e, #15803d)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '4px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    🔊 تشغيل الصوت
                  </button>
                  <button 
                    onClick={async () => {
                      setInspectedPlayer((prev: any) => prev ? ({ ...prev, activeAd: null }) : null);
                      if (inspectedPlayer?.userId && auth.currentUser && inspectedPlayer.userId === auth.currentUser.uid) {
                        try {
                          await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                            activeAd: null
                          });
                        } catch(e) { console.error(e); }
                      }
                    }}
                    style={{
                      background: '#27272a',
                      color: '#cbd5e1',
                      border: '1px solid #3f3f46',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontSize: '10px',
                      cursor: 'pointer'
                    }}
                  >
                    إخفاء ❌
                  </button>
                </div>
              </div>
            )}

            {/* Legendary Repair Sparkles Overlay */}
            {showLegendaryRepairSparkles && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(16, 185, 129, 0.25)',
                zIndex: 9999,
                pointerEvents: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'fade-in-out 3.5s ease-in-out forwards',
                fontFamily: 'Cairo, sans-serif'
              }}>
                {/* Huge shining aura circle in the center */}
                <div style={{
                  position: 'relative',
                  width: '300px',
                  height: '300px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(52, 211, 153, 0.8) 0%, rgba(16, 185, 129, 0) 70%)',
                  boxShadow: '0 0 100px rgba(52, 211, 153, 0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'zoom-in-out 3s ease-out forwards'
                }}>
                  <div style={{ fontSize: '120px', filter: 'drop-shadow(0 0 20px #34d399)', animation: 'pulse 1.5s infinite' }}>👑✨</div>
                  
                  {/* Surrounding orbit rings */}
                  <div style={{
                    position: 'absolute',
                    inset: '-20px',
                    border: '3px dashed #34d399',
                    borderRadius: '50%',
                    animation: 'spin-vortex 4s linear infinite'
                  }} />
                  <div style={{
                    position: 'absolute',
                    inset: '-40px',
                    border: '1.5px solid rgba(52, 211, 153, 0.4)',
                    borderRadius: '50%',
                    animation: 'spin-vortex 8s linear infinite reverse'
                  }} />
                </div>

                {/* Sparkling healing words */}
                <div style={{
                  background: 'linear-gradient(to right, #059669, #10b981, #34d399)',
                  border: '3px solid #fbbf24',
                  borderRadius: '16px',
                  padding: '16px 32px',
                  color: '#fff',
                  fontSize: '24px',
                  fontWeight: '900',
                  boxShadow: '0 10px 30px rgba(16, 185, 129, 0.6)',
                  marginTop: '20px',
                  animation: 'zoom-in-out 2.5s ease-out forwards',
                  textAlign: 'center'
                }}>
                  👑 صيانة أسطورية 100% 🔧
                  <div style={{ fontSize: '13px', color: '#fef08a', marginTop: '4px', fontWeight: 'bold' }}>
                    تم إصلاح وترميم كامل الأسطول بالكامل فورياً!
                  </div>
                </div>
              </div>
            )}

            {/* Floating Companion / Sea Pet (Bottom Left) */}
            <div style={{
              position: 'absolute',
              bottom: '120px',
              left: '30px',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              pointerEvents: 'none'
            }}>
              {/* Spinning Magic Circle */}
              <div style={{
                position: 'relative',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(6, 182, 212, 0.35) 0%, rgba(6, 182, 212, 0) 70%)',
                boxShadow: '0 0 20px rgba(6, 182, 212, 0.5), inset 0 0 15px rgba(6, 182, 212, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'pulse 2s infinite ease-in-out'
              }}>
                {/* Outer spinning runes/glow ring */}
                <div style={{
                  position: 'absolute',
                  inset: '-4px',
                  border: '2px dashed #06b6d4',
                  borderRadius: '50%',
                  animation: 'spin-vortex 12s linear infinite',
                  opacity: 0.7
                }} />
                
                {/* The cute Pet avatar */}
                <div style={{
                  fontSize: '44px',
                  animation: 'bounce 1.5s infinite alternate ease-in-out',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))'
                }}>
                  👾
                </div>
              </div>
              
              {/* Pet Name tag */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid #06b6d4',
                color: '#22d3ee',
                fontSize: '10px',
                fontWeight: 'bold',
                padding: '2px 8px',
                borderRadius: '6px',
                marginTop: '6px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.5)',
                whiteSpace: 'nowrap'
              }}>
                مرافق الجليد الأسطوري ❄️
              </div>
            </div>
          </div>

          {/* ----------------- VISITED BUILDING MODAL (تفاصيل مبنى بيت السمك / بيت السفن للميناء المزار) ----------------- */}
          {visitedBuildingModal && (
            <div style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.85)',
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              fontFamily: 'Cairo, sans-serif'
            }} dir="rtl">
              <div style={{
                background: '#150d06',
                border: '3px solid #ca8a04',
                borderRadius: '16px',
                padding: '24px',
                width: '100%',
                maxWidth: '460px',
                boxShadow: '0 15px 40px rgba(0,0,0,0.9)',
                color: '#fff',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                maxHeight: '90vh',
                overflowY: 'auto'
              }}>
                <div style={{
                  width: '140px',
                  height: '140px',
                  margin: '0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'radial-gradient(circle, rgba(202, 138, 4, 0.15) 0%, rgba(0,0,0,0.5) 70%)',
                  borderRadius: '16px',
                  border: '1px solid #ca8a04',
                  padding: '10px'
                }}>
                  <img
                    src={visitedBuildingModal.image}
                    alt={visitedBuildingModal.title}
                    style={{
                      maxHeight: '100%',
                      maxWidth: '100%',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.7))'
                    }}
                  />
                </div>

                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#facc15', margin: '0 0 4px 0' }}>
                    {visitedBuildingModal.title}
                  </h3>
                  <div style={{ fontSize: '13px', color: '#38bdf8', fontWeight: 'bold' }}>
                    المستوى الحالي: مستوى {visitedBuildingModal.level}
                  </div>
                </div>

                <div style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid #3c2919',
                  borderRadius: '10px',
                  padding: '14px',
                  fontSize: '13px',
                  color: '#cbd5e1',
                  textAlign: 'right',
                  lineHeight: '1.6'
                }}>
                  {visitedBuildingModal.details}
                  {visitedBuildingModal.capacity && (
                    <div style={{ marginTop: '8px', color: '#22c55e', fontWeight: 'bold' }}>
                      📦 السعة التخزينية: {visitedBuildingModal.capacity.toLocaleString()} سمكة
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setVisitedBuildingModal(null)}
                  style={{
                    background: 'linear-gradient(to bottom, #ca8a04, #854d0e)',
                    border: '1px solid #fef08a',
                    color: '#000',
                    borderRadius: '8px',
                    padding: '10px',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  إغلاق
                </button>
              </div>
            </div>
          )}

          {/* ----------------- VISITED SHIP DETAILS MODAL (بوابة خيارات السفينة المحددة) ----------------- */}
          {selectedVisitedShip && !isAtomicBombActive && !showAtomicExplosion && !isLargeRocketActive && !showLargeRocketExplosion && !isMediumRocketActive && !showMediumRocketExplosion && !isSmallRocketActive && !showSmallRocketExplosion && !showSmokeExplosion && (
            <div style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.85)',
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              fontFamily: 'Cairo, sans-serif'
            }} dir="rtl">
              <div style={{
                background: '#150d06',
                border: '3px solid #ca8a04',
                borderRadius: '16px',
                padding: '24px',
                width: '100%',
                maxWidth: '460px',
                boxShadow: '0 15px 40px rgba(0,0,0,0.9)',
                color: '#fff',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                maxHeight: '90vh',
                overflowY: 'auto'
              }}>
                {activeInteractionType === 'details' && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'center', margin: '0 auto', maxHeight: '140px' }}>
                      <ShipImage level={typeof selectedVisitedShip.level === 'number' ? selectedVisitedShip.level : 0} width={180} plain={true} />
                    </div>
                    
                    <div>
                      <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#facc15', margin: '0 0 4px 0' }}>
                        {selectedVisitedShip.name} (مستوى {selectedVisitedShip.level ?? 0})
                      </h3>
                      <div style={{ fontSize: '13px', color: '#a8a29e', fontWeight: 'bold' }}>
                        المالك: القبطان @{inspectedPlayer.username}
                      </div>
                    </div>

                    {/* Specs List */}
                    <div style={{
                      background: 'rgba(0,0,0,0.4)',
                      border: '1px solid #3c2919',
                      borderRadius: '10px',
                      padding: '12px 16px',
                      fontSize: '13.5px',
                      color: '#cbd5e1',
                      textAlign: 'right',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>❤️ قوة تحمل الهيكل (الدم):</span>
                        {(() => {
                          const visitedSpec = SHOP_SHIPS.find(s => s.level === selectedVisitedShip.level) || SHOP_SHIPS[0];
                          const maxHeart = selectedVisitedShip.maxHeart || visitedSpec.heart || 200;
                          const currentHeart = typeof selectedVisitedShip.heart === 'number' ? Math.min(selectedVisitedShip.heart, maxHeart) : (inspectedPlayer.portDestroyed ? 0 : maxHeart);
                          return (
                            <span style={{ color: '#ef4444', fontWeight: 'bold' }}>
                              {currentHeart.toLocaleString()} / {maxHeart.toLocaleString()} HP
                            </span>
                          );
                        })()}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>⚔️ قوة تدمير المدافع:</span>
                        <span style={{ color: '#ca8a04', fontWeight: 'bold' }}>{(selectedVisitedShip.power || 5).toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>📦 سعة الشحن:</span>
                        <span style={{ color: '#22c55e', fontWeight: 'bold' }}>{(selectedVisitedShip.cargo || 2000).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Attack / Shelling Action Button */}
                    {!inspectedPlayer.portDestroyed && (
                      <button
                        onClick={() => {
                          const validation = validateAttackOrSteal();
                          if (!validation.allowed) {
                            alert(validation.message);
                            showToast(validation.message, 'error');
                            return;
                          }
                          setShowWeaponSelector(true);
                        }}
                        style={{
                          background: 'linear-gradient(to bottom, #ef4444, #b91c1c)',
                          border: '1.5px solid #fca5a5',
                          color: '#fff',
                          borderRadius: '8px',
                          padding: '12px',
                          fontWeight: 'bold',
                          fontSize: '14px',
                          cursor: 'pointer',
                          boxShadow: '0 4px 15px rgba(239, 68, 68, 0.45)',
                          marginTop: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          animation: 'pulse 1.5s infinite'
                        }}
                      >
                        🚀 هجوم وقصف الميناء بالأسلحة
                      </button>
                    )}

                    {/* Post-Attack / Destroyed Port Actions */}
                    {Boolean(inspectedPlayer.portDestroyed || (typeof selectedVisitedShip.heart === 'number' && selectedVisitedShip.heart <= 0)) && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                        <div style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid #ef4444',
                          color: '#fca5a5',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          🔥 تم إحراق وتدمير الأسطول والميناء بنجاح!
                        </div>
                        <button
                          onClick={() => {
                            const validation = validateAttackOrSteal();
                            if (!validation.allowed) {
                              alert(validation.message);
                              showToast(validation.message, 'error');
                              return;
                            }
                            setSelectedLootCard(null);
                            setLootResultText('');
                            setShowLootSelector(true);
                          }}
                          style={{
                            background: 'linear-gradient(to bottom, #eab308, #ca8a04)',
                            border: '1.5px solid #fef08a',
                            color: '#000',
                            borderRadius: '8px',
                            padding: '12px',
                            fontWeight: '900',
                            fontSize: '14px',
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(234, 179, 8, 0.45)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                          }}
                        >
                          🪙 سرقة ونهب حطام الأسطول
                        </button>
                        <button
                          onClick={() => {
                            setShowGlobalMessageModal(true);
                          }}
                          style={{
                            background: 'linear-gradient(to bottom, #6366f1, #4f46e5)',
                            border: '1.5px solid #a5b4fc',
                            color: '#fff',
                            borderRadius: '8px',
                            padding: '10px',
                            fontWeight: 'bold',
                            fontSize: '13px',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                          }}
                        >
                          📢 بث رسالة عالمية عن النصر
                        </button>
                      </div>
                    )}

                    {/* Actions Grid */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '10px',
                      marginTop: '10px'
                    }}>
                      {/* Steal Button */}
                      <button 
                        onClick={() => {
                          const validation = validateAttackOrSteal();
                          if (!validation.allowed) {
                            alert(validation.message);
                            showToast(validation.message, 'error');
                            return;
                          }
                          setActiveInteractionType('steal');
                        }}
                        style={{
                          background: 'linear-gradient(to bottom, #ca8a04, #a16207)',
                          border: '1px solid #fef08a',
                          color: '#000',
                          borderRadius: '8px',
                          padding: '10px',
                          fontWeight: 'bold',
                          fontSize: '13px',
                          cursor: 'pointer',
                          boxShadow: '0 4px 10px rgba(202, 138, 4, 0.3)'
                        }}
                      >
                        سرقة وتسلل 🏴‍☠️
                      </button>

                      {/* Support Repair Button */}
                      <button 
                        onClick={() => setActiveInteractionType('repair')}
                        style={{
                          background: 'linear-gradient(to bottom, #10b981, #047857)',
                          border: '1px solid #6ee7b7',
                          color: '#fff',
                          borderRadius: '8px',
                          padding: '10px',
                          fontWeight: 'bold',
                          fontSize: '13px',
                          cursor: 'pointer',
                          boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)'
                        }}
                      >
                        دعم وإصلاح الهيكل 🔧
                      </button>
                    </div>

                    <button 
                      onClick={() => setSelectedVisitedShip(null)}
                      style={{
                        background: '#292524',
                        border: '1px solid #444',
                        color: '#cbd5e1',
                        borderRadius: '8px',
                        padding: '8px',
                        fontWeight: 'bold',
                        fontSize: '13px',
                        cursor: 'pointer',
                        marginTop: '6px'
                      }}
                    >
                      إغلاق
                    </button>
                  </>
                )}

                {activeInteractionType === 'steal' && (
                  <>
                    <div style={{ fontSize: '48px' }}>🏴‍☠️</div>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#facc15', margin: '0 0 4px 0' }}>
                        عملية التسلل والسرقة الكبرى
                      </h3>
                      <div style={{ fontSize: '11px', color: '#a8a29e' }}>
                        مستهدفاً أسطول القبطان: @{inspectedPlayer.username}
                      </div>
                    </div>

                    {/* Step 1: Choose Own Ship */}
                    <div style={{ textAlign: 'right', fontSize: '12px' }}>
                      <div style={{ fontWeight: 'bold', color: '#fcd34d', marginBottom: '6px' }}>1. اختر سفينتك المنفذة للغزو:</div>
                      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                        {ships.filter(s => s.exists).map(s => {
                          const isSelected = selectedOwnShipId === s.id;
                          const sLevel = getShipEffectiveLevel(s);
                          const isLevelValid = sLevel >= 6;
                          return (
                            <div 
                              key={s.id}
                              onClick={() => setSelectedOwnShipId(s.id)}
                              style={{
                                background: isSelected ? 'rgba(202, 138, 4, 0.25)' : 'rgba(0,0,0,0.5)',
                                border: isSelected ? '2px solid #facc15' : '1px solid #444',
                                borderRadius: '8px',
                                padding: '8px',
                                cursor: 'pointer',
                                minWidth: '100px',
                                textAlign: 'center',
                                flexShrink: 0,
                                transition: 'all 0.2s'
                              }}
                            >
                              <div style={{ fontSize: '20px' }}>{s.imgEmoji || '⛵'}</div>
                              <div style={{ fontWeight: 'bold', fontSize: '10px', color: isSelected ? '#fcd34d' : '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                              <div style={{ fontSize: '9px', color: isLevelValid ? '#4ade80' : '#f87171', fontWeight: 'bold', marginTop: '2px' }}>
                                مستوى {sLevel} {isLevelValid ? '✓' : '(أقل من 6)'}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Ship Level Requirement Warning Banner */}
                      {(() => {
                        const curShip = ships.find(s => s.id === selectedOwnShipId);
                        const curLvl = curShip ? getShipEffectiveLevel(curShip) : 0;
                        if (curLvl < 6) {
                          return (
                            <div style={{
                              background: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid #ef4444',
                              borderRadius: '6px',
                              padding: '6px 10px',
                              color: '#fca5a5',
                              fontSize: '11px',
                              textAlign: 'center',
                              marginTop: '6px',
                              fontWeight: 'bold'
                            }}>
                              ⚠️ يجب أن تكون سفنك بمستوى 6 وما فوق لتتمكن من الهجوم أو السرقة! (مستوى هذه السفينة: {curLvl})
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>

                    {/* Step 2: Thief Status & Target Cop Status */}
                    {(() => {
                      const hasThief = !!crewServices.thief;
                      const hasPolice = !!(inspectedPlayer.crewServices?.police || inspectedPlayer.crewServices?.cop);

                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {/* Player Thief Status */}
                          <div style={{
                            background: 'rgba(0,0,0,0.4)',
                            border: '1px solid #3c2919',
                            borderRadius: '8px',
                            padding: '10px 14px',
                            textAlign: 'right',
                            fontSize: '12px'
                          }}>
                            <div style={{ fontWeight: 'bold', color: '#fcd34d', marginBottom: '6px' }}>2. طاقم السارق (Thief):</div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(202, 138, 4, 0.2)', border: '1px solid #ca8a04', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                                  <img src={SHIP_THIEF_ICON} alt="السارق" referrerPolicy="no-referrer" style={{ maxHeight: '32px', maxWidth: '32px', objectFit: 'contain' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                  {hasThief ? (
                                    <span style={{ color: '#22c55e', fontWeight: 'bold' }}>🥷 السارق مفعّل على سفنك: يتيح لك التسلل والسرقة من أساطيل الآخرين!</span>
                                  ) : (
                                    <span style={{ color: '#ef4444', fontWeight: 'bold' }}>⚠️ السارق غير معين على سفنك! لا يمكنك التسلل أو السرقة من أحد إلا بعد توظيف السارق.</span>
                                  )}
                                </div>
                              </div>
                              {!hasThief && (
                                <button 
                                  onClick={() => buyCrewService('thief', 'السارق (حرامي السفن)', 30)}
                                  style={{
                                    background: '#ca8a04',
                                    color: '#000',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '5px 10px',
                                    fontWeight: 'bold',
                                    fontSize: '11px',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  توظيف السارق 💎 30
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Target Cop Status */}
                          <div style={{
                            background: hasPolice ? 'rgba(30, 58, 138, 0.25)' : 'rgba(0,0,0,0.3)',
                            border: hasPolice ? '1px solid #3b82f6' : '1px solid #444',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            textAlign: 'right',
                            fontSize: '11.5px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <span style={{ fontSize: '20px' }}>{hasPolice ? '👮‍♂️' : '🔓'}</span>
                            <div style={{ flex: 1 }}>
                              {hasPolice ? (
                                <span style={{ color: '#93c5fd', fontWeight: 'bold' }}>
                                  الشرطي حارس الأسطول نشط لدى @{inspectedPlayer.username}! حماية الشرطي تحبط السرقة 100% وتمنع أي سرقة.
                                </span>
                              ) : (
                                <span style={{ color: '#cbd5e1' }}>
                                  القبطان المستهدف لا يمتلك شرطياً لحماية سفنه، سفنه مكشوفة للسرقة!
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Start Steal Button */}
                    <button
                      onClick={async () => {
                        // التحقق من شرط مستوى السفينة/السفن (مستوى 6 وما فوق)
                        const validation = validateAttackOrSteal(selectedOwnShipId);
                        if (!validation.allowed) {
                          alert(validation.message);
                          showToast(validation.message, 'error');
                          return;
                        }

                        const hasThief = !!crewServices.thief;
                        
                        // 1. Check if player has Thief
                        if (!hasThief) {
                          alert(`⚠️ يجب تعيين وتوظيف (السارق) على سفنك أولاً للتمكن من التسلل والسرقة من أساطيل وقراصنة الآخرين!`);
                          return;
                        }

                        const cooldownKey = `last_steal_${inspectedPlayer.userId}`;
                        const lastSteal = localStorage.getItem(cooldownKey);
                        const now = Date.now();
                        if (lastSteal && now - parseInt(lastSteal) < 60000) {
                          alert(`⚠️ لا يمكنك سرقة هذا القبطان مجدداً إلا بعد مرور دقيقة واحدة للحماية!`);
                          return;
                        }

                        setSelectedVisitedShip(null);
                        localStorage.setItem(cooldownKey, now.toString());

                        const hasPolice = !!(inspectedPlayer.crewServices?.police || inspectedPlayer.crewServices?.cop);

                        // 2. Hard Counter: If target has Cop, theft is 100% BLOCKED ("مايقدر يسرق تسرقه")
                        if (hasPolice) {
                          sendSecureChatMessage(
                            'شرطة الميناء 👮',
                            '👮',
                            `👮 أحبط شرطي أسطول القبطان @${inspectedPlayer.username} محاولة تسلل وسرقة من قِبل لصوص القبطان @${username}! حماية الشرطي تمنع سرقة السفن تماماً.`
                          );
                          showToast(`👮‍♂️ تصدى شرطي أسطول القبطان @${inspectedPlayer.username} لمحاولة التسلل والسرقة وأحبطها بالكامل! أسطول القبطان محمي 100% بالشرطي ولا يمكن سرقته.`, 'error');
                          return;
                        }

                        // 3. Target does NOT have Cop -> Steal succeeds!
                        const targetGold = inspectedPlayer.gold || 0;
                        const maxStolen = Math.min(150000, Math.max(2000, Math.floor(targetGold * 0.15)));
                        const amount = Math.floor(2000 + Math.random() * maxStolen);
                        
                        setGold(prev => prev + amount);

                        try {
                          // Update attacker's own user document
                          if (auth.currentUser) {
                            await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                              gold: gold + amount
                            });
                          }

                          // Secure collection-based dispatch to /harborEvents
                          await createHarborEvent(inspectedPlayer.userId, 'STEAL', {
                            amount
                          });

                          sendSecureChatMessage(
                            'السارق 🏴‍☠️',
                            '🥷',
                            `🏴‍☠️ نجحت عملية السرقة والتسلل! استولى لصوص القبطان @${username} على 🪙 ${amount.toLocaleString()} ذهبة من أسطول القبطان @${inspectedPlayer.username} لعدم وجود شرطي يحميه!`
                          );

                          showToast(`🎉 نجحت عملية السرقة والتسلل! استولى سارق أسطولك على 🪙 ${amount.toLocaleString()} ذهبة من أسطول القبطان @${inspectedPlayer.username}!`, 'success');
                        } catch (e) {
                          console.error(e);
                        }
                      }}
                      style={{
                        background: 'linear-gradient(to bottom, #ca8a04, #a16207)',
                        border: '1.5px solid #fef08a',
                        color: '#000',
                        borderRadius: '8px',
                        padding: '12px',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(202, 138, 4, 0.45)',
                        marginTop: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      🏴‍☠️ إطلاق عملية السرقة والتسلل
                    </button>

                    <button 
                      onClick={() => setActiveInteractionType('details')}
                      style={{
                        background: '#292524',
                        border: '1px solid #444',
                        color: '#cbd5e1',
                        borderRadius: '8px',
                        padding: '8px',
                        fontWeight: 'bold',
                        fontSize: '13px',
                        cursor: 'pointer',
                        marginTop: '6px'
                      }}
                    >
                      العودة للتفاصيل
                    </button>
                  </>
                )}

                {activeInteractionType === 'repair' && (
                  <>
                    <div style={{ fontSize: '48px' }}>🔧</div>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#10b981', margin: '0 0 4px 0' }}>
                        دعم وصيانة أسطول القراصنة الحلفاء
                      </h3>
                      <div style={{ fontSize: '11px', color: '#a8a29e' }}>
                        مستهدفاً سفينة القبطان: @{inspectedPlayer.username}
                      </div>
                      {(() => {
                        const currentHeart = selectedVisitedShip.heart !== undefined ? selectedVisitedShip.heart : (inspectedPlayer.portDestroyed ? 0 : 13000);
                        const maxHeart = selectedVisitedShip.maxHeart || (selectedVisitedShip.level * 1000) + 10000;
                        return (
                          <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: 'bold', marginTop: '4px' }}>
                            ❤️ الدم الحالي للسفينة: {currentHeart.toLocaleString()} / {maxHeart.toLocaleString()} HP
                          </div>
                        );
                      })()}
                    </div>

                    {/* Step 1: Choose Own Support Ship */}
                    <div style={{ textAlign: 'right', fontSize: '12px' }}>
                      <div style={{ fontWeight: 'bold', color: '#34d399', marginBottom: '6px' }}>1. اختر سفينتك المانحة للدعم:</div>
                      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                        {ships.filter(s => s.exists).map(s => {
                          const isSelected = selectedOwnShipId === s.id;
                          return (
                            <div 
                              key={s.id}
                              onClick={() => setSelectedOwnShipId(s.id)}
                              style={{
                                background: isSelected ? 'rgba(16, 185, 129, 0.25)' : 'rgba(0,0,0,0.5)',
                                border: isSelected ? '2px solid #34d399' : '1px solid #444',
                                borderRadius: '8px',
                                padding: '8px',
                                cursor: 'pointer',
                                minWidth: '100px',
                                textAlign: 'center',
                                flexShrink: 0,
                                transition: 'all 0.2s'
                              }}
                            >
                              <div style={{ fontSize: '20px' }}>{s.imgEmoji || '⛵'}</div>
                              <div style={{ fontWeight: 'bold', fontSize: '10px', color: isSelected ? '#34d399' : '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                              <div style={{ fontSize: '9px', color: '#cbd5e1' }}>مستوى {s.level}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Step 2: Choose Repairer from inventory */}
                    <div style={{ textAlign: 'right', fontSize: '12px' }}>
                      <div style={{ fontWeight: 'bold', color: '#34d399', marginBottom: '6px' }}>2. أرسل طاقم صيانة مجهزاً:</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[
                          { key: 'repairer_small', name: 'مصلح صغير', desc: 'يصلح ويزيد 500 نقطة من الصفر فوراً', power: 500, cost: 5, increment: 5, image: FIXER_SMALL_ICON },
                          { key: 'repairer_medium', name: 'مصلح وسط', desc: 'يصلح نصف السفينة (50%) أو 1,000 نقطة', power: 1000, cost: 10, increment: 3, image: FIXER_MEDIUM_ICON },
                          { key: 'repairer_large', name: 'مصلح كبير', desc: 'يصلح سفينة واحدة بالكامل 100%', power: 999999999, cost: 20, increment: 2, image: FIXER_LARGE_ICON },
                          { key: 'repairer_legendary', name: 'مصلح أسطوري', desc: 'يرفع ويصلح جميع سفن الأسطول دفعة واحدة 100%', power: 999999999, cost: 40, increment: 1, image: FIXER_LEGENDARY_ICON }
                        ].map(rep => {
                          const count = crewServices[rep.key] || 0;
                          return (
                            <div 
                              key={rep.key}
                              style={{
                                background: 'rgba(0,0,0,0.4)',
                                border: '1px solid #27272a',
                                borderRadius: '8px',
                                padding: '8px 12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '10px'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {rep.image && (
                                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(6, 35, 28, 0.9) 100%)', border: '1.5px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                                    <img src={rep.image} alt={rep.name} referrerPolicy="no-referrer" style={{ maxHeight: '36px', maxWidth: '36px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }} />
                                  </div>
                                )}
                                <div>
                                  <div style={{ fontWeight: 'bold', color: '#fff' }}>{rep.name} <span style={{ color: '#34d399' }}>({count} قطعة)</span></div>
                                  <div style={{ fontSize: '9.5px', color: '#a1a1aa' }}>{rep.desc}</div>
                                </div>
                              </div>
                              <div>
                                {count > 0 ? (
                                  <button
                                    onClick={async () => {
                                      const isLegendary = rep.key === 'repairer_legendary';
                                      const isLarge = rep.key === 'repairer_large';
                                      const isMedium = rep.key === 'repairer_medium';

                                      if (isLegendary) {
                                        const anyNeedsHeal = inspectedPlayer.ships.some((s: any) => {
                                          const current = s.heart !== undefined ? s.heart : (inspectedPlayer.portDestroyed ? 0 : 13000);
                                          const max = s.maxHeart || (s.level * 1000) + 10000;
                                          return current < max;
                                        });
                                        if (!anyNeedsHeal) {
                                          alert(`⚠️ جميع سفن القبطان سليمة بالكامل بنسبة 100% ولا تحتاج إلى صيانة أسطورية!`);
                                          return;
                                        }
                                      } else {
                                        const currentHeart = selectedVisitedShip.heart !== undefined ? selectedVisitedShip.heart : (inspectedPlayer.portDestroyed ? 0 : 13000);
                                        const maxHeart = selectedVisitedShip.maxHeart || (selectedVisitedShip.level * 1000) + 10000;
                                        if (currentHeart >= maxHeart) {
                                          alert(`⚠️ هيكل السفينة سليم بالكامل بنسبة 100% ولا يحتاج إلى صيانة وإصلاح!`);
                                          return;
                                        }
                                      }

                                      // Deduct repairer count
                                      setCrewServices(prev => {
                                        const updated = {
                                          ...prev,
                                          [rep.key]: Math.max(0, (prev[rep.key] || 0) - 1)
                                        };
                                        localStorage.setItem('pirate_crew_services', JSON.stringify(updated));
                                        return updated;
                                      });

                                      if (isLegendary) {
                                        playLegendaryRepairSound();
                                        setShowLegendaryRepairSparkles(true);
                                        setTimeout(() => {
                                          setShowLegendaryRepairSparkles(false);
                                        }, 3500);

                                        if (selectedVisitedShip) {
                                          const maxH = selectedVisitedShip.maxHeart || (selectedVisitedShip.level * 1000) + 10000;
                                          setSelectedVisitedShip((prev: any) => ({
                                            ...prev,
                                            heart: maxH
                                          }));
                                        }

                                        try {
                                          const updatedTargetShips = inspectedPlayer.ships.map((s: any) => {
                                            const max = s.maxHeart || (s.level * 1000) + 10000;
                                            return {
                                              ...s,
                                              heart: max
                                            };
                                          });

                                          const targetUid = inspectedPlayer.userId || inspectedPlayer.id;
                                          if (targetUid && db) {
                                            updateDoc(doc(db, 'users', targetUid), {
                                              ships: updatedTargetShips,
                                              portDestroyed: false,
                                              updatedAt: new Date().toISOString()
                                            }).catch((err) => console.warn("Friend repair doc update failed:", err));
                                          }

                                          await createHarborEvent(inspectedPlayer.userId, 'REPAIR', {
                                            healAmount: 999999
                                          });

                                          sendSecureChatMessage(
                                            'مساعد الصيانة الأسطوري 🤝',
                                            '👑',
                                            `🤝 أرسل القبطان الشهم @${username} طاقم صيانة أسطورياً وقاموا بصيانة وإصلاح كامل أسطول القبطان @${inspectedPlayer.username} بنسبة 100% بنجاح! 👑🔧`
                                          );

                                          showToast(`👑 تم إرسال المصلح الأسطوري بنجاح! تم صيانة وإصلاح كامل أسطول القبطان @${inspectedPlayer.username} بنسبة 100%! ✨🔧`, 'success');
                                        } catch (e) {
                                          console.error(e);
                                        }
                                      } else {
                                        const currentHeart = selectedVisitedShip.heart !== undefined ? selectedVisitedShip.heart : (inspectedPlayer.portDestroyed ? 0 : 13000);
                                        const maxHeart = selectedVisitedShip.maxHeart || (selectedVisitedShip.level * 1000) + 10000;
                                        
                                        let healAmount = 500;
                                        if (isLarge) {
                                          // مصلح كبير: يصلح سفينة واحدة بالكامل 100%
                                          healAmount = maxHeart - currentHeart;
                                        } else if (isMedium) {
                                          // مصلح وسط: يصلح نصف السفينة (50%) أو 1,000 نقطة إذا كانت 0
                                          if (currentHeart <= 0) {
                                            healAmount = 1000;
                                          } else {
                                            healAmount = Math.max(1000, Math.floor(maxHeart * 0.5));
                                          }
                                        } else {
                                          // مصلح صغير: يعطيك 500 نقطة من الصفر
                                          healAmount = 500;
                                        }

                                        const newHeart = Math.min(maxHeart, currentHeart + healAmount);

                                        setSelectedVisitedShip((prev: any) => ({
                                          ...prev,
                                          heart: newHeart
                                        }));

                                        try {
                                          const updatedTargetShips = inspectedPlayer.ships.map((s: any) => {
                                            if (s.id === selectedVisitedShip.id) {
                                              return {
                                                ...s,
                                                heart: newHeart
                                              };
                                            }
                                            return s;
                                          });

                                          const targetUid = inspectedPlayer.userId || inspectedPlayer.id;
                                          const anyShipAlive = updatedTargetShips.some((s: any) => typeof s.heart === 'number' && s.heart > 0);
                                          if (targetUid && db) {
                                            updateDoc(doc(db, 'users', targetUid), {
                                              ships: updatedTargetShips,
                                              portDestroyed: anyShipAlive ? false : Boolean(inspectedPlayer.portDestroyed),
                                              updatedAt: new Date().toISOString()
                                            }).catch((err) => console.warn("Friend ship repair doc update failed:", err));
                                          }

                                          await createHarborEvent(inspectedPlayer.userId, 'REPAIR', {
                                            healAmount,
                                            targetShipId: selectedVisitedShip.id
                                          });

                                          sendSecureChatMessage(
                                            'دعم الأصدقاء 🤝',
                                            '🔧',
                                            `🤝 أرسل القبطان الشهم @${username} طاقم صيانة مجهزاً [${rep.name}] وقاموا بصيانة هيكل سفينة القبطان @${inspectedPlayer.username} بمقدار +${(Math.min(healAmount, maxHeart - currentHeart)).toLocaleString()} HP بنجاح!`
                                          );

                                          showToast(`🔧 تم إرسال المصلح بنجاح! تم صيانة وإصلاح هيكل سفينة القبطان @${inspectedPlayer.username} بمقدار +${(Math.min(healAmount, maxHeart - currentHeart)).toLocaleString()} HP!`, 'success');
                                        } catch (e) {
                                          console.error(e);
                                        }
                                      }
                                    }}
                                    style={{
                                      background: '#10b981',
                                      color: '#fff',
                                      border: 'none',
                                      borderRadius: '4px',
                                      padding: '5px 12px',
                                      fontSize: '11px',
                                      fontWeight: 'bold',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    إرسال صيانة
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => buyCrewService(rep.key, rep.name, rep.cost, rep.increment)}
                                    style={{
                                      background: '#ca8a04',
                                      color: '#000',
                                      border: 'none',
                                      borderRadius: '4px',
                                      padding: '5px 8px',
                                      fontSize: '10px',
                                      fontWeight: 'bold',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    شراء +{rep.increment} 💎{rep.cost}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <button 
                      onClick={() => setActiveInteractionType('details')}
                      style={{
                        background: '#292524',
                        border: '1px solid #444',
                        color: '#cbd5e1',
                        borderRadius: '8px',
                        padding: '8px',
                        fontWeight: 'bold',
                        fontSize: '13px',
                        cursor: 'pointer',
                        marginTop: '6px'
                      }}
                    >
                      العودة للتفاصيل
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Weapon Selector Modal */}
          {showWeaponSelector && !isAtomicBombActive && !showAtomicExplosion && !isLargeRocketActive && !showLargeRocketExplosion && !isMediumRocketActive && !showMediumRocketExplosion && !isSmallRocketActive && !showSmallRocketExplosion && !showSmokeExplosion && (
            <div style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.85)',
              zIndex: 10100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              direction: 'rtl',
              fontFamily: 'Cairo, sans-serif'
            }}>
              <div style={{
                background: 'linear-gradient(to bottom, #111827, #09090b)',
                border: '3px solid #ca8a04',
                borderRadius: '16px',
                padding: '24px',
                width: '100%',
                maxWidth: '480px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 20px 50px rgba(0,0,0,0.95)',
                color: '#fff',
                textAlign: 'center'
              }}>
                {/* Header containing inspected player's active ship details */}
                {(() => {
                  const activeVisitedShip = selectedVisitedShip || inspectedPlayer?.ships?.[0] || { name: 'سفينة المنتقم', heart: 190000, maxHeart: 190000 };
                  const currentHeart = activeVisitedShip.heart !== undefined ? activeVisitedShip.heart : (inspectedPlayer?.portDestroyed ? 0 : 190000);
                  const maxHeart = activeVisitedShip.maxHeart || 190000;
                  return (
                    <div style={{
                      background: 'rgba(24, 24, 27, 0.85)',
                      border: '1.5px solid #27272a',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      marginBottom: '20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      direction: 'rtl'
                    }}>
                      <div style={{ textAlign: 'right' }}>
                        <h4 style={{ fontSize: '15px', fontWeight: 'bold', color: '#facc15', margin: '0 0 4px 0' }}>
                          {activeVisitedShip.name}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{
                            width: '100px',
                            height: '8px',
                            background: '#27272a',
                            borderRadius: '4px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${(currentHeart / maxHeart) * 100}%`,
                              height: '100%',
                              background: 'linear-gradient(to left, #ef4444, #f87171)'
                            }} />
                          </div>
                          <span style={{ fontSize: '12px', color: '#f87171', fontWeight: 'bold' }}>
                            {currentHeart.toLocaleString()} / {maxHeart.toLocaleString()} ❤️
                          </span>
                        </div>
                      </div>
                      <div style={{
                        background: '#14532d',
                        color: '#4ade80',
                        border: '1px solid #22c55e',
                        borderRadius: '8px',
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer'
                      }} onClick={() => alert("⚓ طاقمك جاهز للإبحار والصيد في مياهه الإقليمية!")}>
                        <span>⚓</span>
                        <span>تصيد في البحر</span>
                      </div>
                    </div>
                  );
                })()}

                <h4 style={{ textAlign: 'right', fontSize: '14px', color: '#cbd5e1', marginBottom: '12px', fontWeight: 'bold' }}>
                  اختر صاروخ من مخزنك:
                </h4>

                {/* Weapons List Container */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* 1. رسالة التفجير */}
                  <div 
                    onClick={() => {
                      const validation = validateAttackOrSteal();
                      if (!validation.allowed) {
                        alert(validation.message);
                        showToast(validation.message, 'error');
                        return;
                      }
                      const qty = weapons.adBomb || weapons.emp_bomb || 0;
                      if (qty <= 0) {
                        alert("❌ لا تملك هذا السلاح!");
                        return;
                      }
                      setShowWeaponSelector(false);
                      setShowAdSelectorModal(true);
                    }}
                    style={{
                      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(0,0,0,0.4) 100%)',
                      border: '1.5px solid #22c55e',
                      borderRadius: '12px',
                      padding: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.2s',
                      boxShadow: '0 4px 15px rgba(34,197,94,0.1)'
                    }}
                    className="hover:bg-[rgba(34,197,94,0.2)]"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span style={{ fontSize: '12px', color: '#4ade80', background: '#14532d', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>{(weapons.adBomb !== undefined ? weapons.adBomb : (weapons.emp_bomb !== undefined ? weapons.emp_bomb : 0))}x</span>
                      <div style={{
                        position: 'relative',
                        width: '50px',
                        height: '50px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        border: '1.5px solid rgba(74, 222, 128, 0.5)',
                        backgroundImage: `url(${WEAPON_MEDIA_BOMB_BG})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'inset 0 0 8px rgba(0,0,0,0.6)'
                      }}>
                        <img src={WEAPON_MEDIA_BOMB_ICON} alt="رسالة التفجير" referrerPolicy="no-referrer" style={{ width: '40px', height: '40px', objectFit: 'contain', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.85))', position: 'relative', zIndex: 2 }} />
                      </div>
                    </div>
                    <div style={{ textAlign: 'left', flex: 1, paddingRight: '12px' }}>
                      <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#4ade80' }}>رسالة التفجير</div>
                      <div style={{ fontSize: '12px', color: '#86efac', fontWeight: 'bold' }}>ضرر 20,000 💥 (50 💎)</div>
                      <div style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: '1.3', marginTop: '2px' }}>
                        إلحاق 20,000 ضرر بأسطول الخصم مع بث رسالة وتثبيتها
                      </div>
                    </div>
                  </div>

                  {/* 2. قنبلة الموت الأسود */}
                  <div 
                    onClick={() => {
                      const qty = weapons.atomicBomb || weapons.nuke_bomb || 0;
                      if (qty <= 0) {
                        alert("❌ لا تملك هذا السلاح الفتاك!");
                        return;
                      }
                      setShowWeaponSelector(false);
                      handleLaunchAtomicBomb();
                    }}
                    style={{
                      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(0,0,0,0.4) 100%)',
                      border: '1.5px solid #ef4444',
                      borderRadius: '12px',
                      padding: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.2s',
                      boxShadow: '0 4px 15px rgba(239,68,68,0.1)'
                    }}
                    className="hover:bg-[rgba(239,68,68,0.2)]"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span style={{ fontSize: '12px', color: '#fca5a5', background: '#7f1d1d', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>{(weapons.atomicBomb !== undefined ? weapons.atomicBomb : (weapons.nuke_bomb !== undefined ? weapons.nuke_bomb : 0))}x</span>
                      <div style={{
                        position: 'relative',
                        width: '50px',
                        height: '50px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        border: '1.5px solid rgba(239, 68, 68, 0.5)',
                        backgroundImage: `url(${WEAPON_ATOMIC_BOMB_BG})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'inset 0 0 8px rgba(0,0,0,0.6)'
                      }}>
                        <img src={WEAPON_ATOMIC_BOMB_ICON} alt="قنبلة الموت الأسود" referrerPolicy="no-referrer" style={{ width: '40px', height: '40px', objectFit: 'contain', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.85))', position: 'relative', zIndex: 2 }} />
                      </div>
                    </div>
                    <div style={{ textAlign: 'left', flex: 1, paddingRight: '12px' }}>
                      <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fca5a5' }}>قنبلة الموت الأسود</div>
                      <div style={{ fontSize: '12px', color: '#fca5a5', fontWeight: 'bold' }}>ضرر 70,000 💥 (150 💎)</div>
                      <div style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: '1.3', marginTop: '2px' }}>
                        قنبلة فتاكة تلحق 70,000 ضرر بجميع سفن الأسطول
                      </div>
                    </div>
                  </div>

                  {/* 3. صاروخ صغير */}
                  <div 
                    onClick={() => {
                      const qty = weapons.smallRocket || weapons.small_missile || 0;
                      if (qty <= 0) {
                        alert("❌ لا تملك قذائف من هذا السلاح!");
                        return;
                      }
                      setShowWeaponSelector(false);
                      handleLaunchSmallRocket(selectedVisitedShip);
                    }}
                    style={{
                      background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.12) 0%, rgba(24, 24, 27, 0.6) 100%)',
                      border: '1.5px solid rgba(234, 88, 12, 0.4)',
                      borderRadius: '12px',
                      padding: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.2s',
                      boxShadow: '0 4px 15px rgba(234, 88, 12, 0.1)'
                    }}
                    className="hover:bg-[rgba(234,88,12,0.2)] hover:border-amber-600"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span style={{ fontSize: '12px', color: '#ffedd5', background: '#7c2d12', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>{(weapons.smallRocket !== undefined ? weapons.smallRocket : (weapons.small_missile !== undefined ? weapons.small_missile : 0))}x</span>
                      <div style={{
                        position: 'relative',
                        width: '50px',
                        height: '50px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        border: '1.5px solid rgba(234, 88, 12, 0.5)',
                        backgroundImage: `url(${WEAPON_SMALL_MISSILE_BG})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'inset 0 0 8px rgba(0,0,0,0.6)'
                      }}>
                        <img src={WEAPON_SMALL_MISSILE_ICON} alt="صاروخ صغير" referrerPolicy="no-referrer" style={{ width: '40px', height: '40px', objectFit: 'contain', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.85))', position: 'relative', zIndex: 2 }} />
                      </div>
                    </div>
                    <div style={{ textAlign: 'left', flex: 1, paddingRight: '12px' }}>
                      <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fed7aa' }}>صاروخ صغير</div>
                      <div style={{ fontSize: '12px', color: '#facc15', fontWeight: 'bold' }}>ضرر 1,000 ⚔️ (100,000 🪙)</div>
                      <div style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: '1.3', marginTop: '2px' }}>
                        صاروخ صغير وسريع لتوجيه ضربة مباشرة تلحق 1,000 ضرر
                      </div>
                    </div>
                  </div>

                  {/* 4. صاروخ المتوسط */}
                  <div 
                    onClick={() => {
                      const qty = weapons.mediumRocket || weapons.medium_missile || 0;
                      if (qty <= 0) {
                        alert("❌ لا تملك قذائف من هذا السلاح!");
                        return;
                      }
                      setShowWeaponSelector(false);
                      handleLaunchMediumRocket(selectedVisitedShip);
                    }}
                    style={{
                      background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.12) 0%, rgba(24, 24, 27, 0.6) 100%)',
                      border: '1.5px solid rgba(249, 115, 22, 0.4)',
                      borderRadius: '12px',
                      padding: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.2s',
                      boxShadow: '0 4px 15px rgba(249, 115, 22, 0.1)'
                    }}
                    className="hover:bg-[rgba(249,115,22,0.2)] hover:border-orange-500"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span style={{ fontSize: '12px', color: '#fed7aa', background: '#9a3412', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>{(weapons.mediumRocket !== undefined ? weapons.mediumRocket : (weapons.medium_missile !== undefined ? weapons.medium_missile : 0))}x</span>
                      <div style={{
                        position: 'relative',
                        width: '50px',
                        height: '50px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        border: '1.5px solid rgba(249, 115, 22, 0.5)',
                        backgroundImage: `url(${WEAPON_MEDIUM_MISSILE_BG})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'inset 0 0 8px rgba(0,0,0,0.6)'
                      }}>
                        <img src={WEAPON_MEDIUM_MISSILE_ICON} alt="صاروخ المتوسط" referrerPolicy="no-referrer" style={{ width: '40px', height: '40px', objectFit: 'contain', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.85))', position: 'relative', zIndex: 2 }} />
                      </div>
                    </div>
                    <div style={{ textAlign: 'left', flex: 1, paddingRight: '12px' }}>
                      <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fed7aa' }}>صاروخ المتوسط</div>
                      <div style={{ fontSize: '12px', color: '#facc15', fontWeight: 'bold' }}>ضرر 5,000 ⚔️ (200,000 🪙)</div>
                      <div style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: '1.3', marginTop: '2px' }}>
                        صاروخ متوسط القوة يخترق الدروع ويلحق 5,000 ضرر بهيكل السفينة
                      </div>
                    </div>
                  </div>

                  {/* 5. صاروخ كبير */}
                  <div 
                    onClick={() => {
                      const qty = weapons.largeRocket || weapons.large_missile || 0;
                      if (qty <= 0) {
                        alert("❌ لا تملك قذائف من هذا السلاح!");
                        return;
                      }
                      setShowWeaponSelector(false);
                      handleLaunchLargeRocket(selectedVisitedShip);
                    }}
                    style={{
                      background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.12) 0%, rgba(24, 24, 27, 0.6) 100%)',
                      border: '1.5px solid rgba(234, 179, 8, 0.4)',
                      borderRadius: '12px',
                      padding: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.2s',
                      boxShadow: '0 4px 15px rgba(234, 179, 8, 0.1)'
                    }}
                    className="hover:bg-[rgba(234,179,8,0.2)] hover:border-yellow-500"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span style={{ fontSize: '12px', color: '#fef08a', background: '#854d0e', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>{(weapons.largeRocket !== undefined ? weapons.largeRocket : (weapons.large_missile !== undefined ? weapons.large_missile : 0))}x</span>
                      <div style={{
                        position: 'relative',
                        width: '50px',
                        height: '50px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        border: '1.5px solid rgba(234, 179, 8, 0.5)',
                        backgroundImage: `url(${WEAPON_LARGE_MISSILE_BG})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'inset 0 0 8px rgba(0,0,0,0.6)'
                      }}>
                        <img src={WEAPON_LARGE_MISSILE_ICON} alt="صاروخ كبير" referrerPolicy="no-referrer" style={{ width: '40px', height: '40px', objectFit: 'contain', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.85))', position: 'relative', zIndex: 2 }} />
                      </div>
                    </div>
                    <div style={{ textAlign: 'left', flex: 1, paddingRight: '12px' }}>
                      <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fef08a' }}>صاروخ كبير</div>
                      <div style={{ fontSize: '12px', color: '#facc15', fontWeight: 'bold' }}>ضرر 100,000 💥 (300,000 🪙)</div>
                      <div style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: '1.3', marginTop: '2px' }}>
                        صاروخ فتاك يزلزل الدفاعات ويلحق 100,000 ضرر
                      </div>
                    </div>
                  </div>

                  {/* 6. معطل مضاد الصواريخ */}
                  <div 
                    onClick={() => {
                      if ((weapons.antiRocketDisabler || 0) <= 0) {
                        alert("❌ لا تملك هذا العنصر!");
                        return;
                      }
                      handleDisableDefense('rocket');
                    }}
                    style={{
                      background: 'rgba(251, 191, 36, 0.05)',
                      border: '1px solid #fbbf24',
                      borderRadius: '12px',
                      padding: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.2s'
                    }}
                    className="hover:bg-[rgba(251,191,36,0.15)]"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '11px', color: '#fcd34d', background: '#78350f', padding: '2px 6px', borderRadius: '4px' }}>{weapons.antiRocketDisabler !== undefined ? weapons.antiRocketDisabler : 6}x</span>
                      <span style={{ fontSize: '24px' }}>⚡</span>
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fcd34d' }}>صاروخ تعطيل مضاد الصواريخ</div>
                      <div style={{ fontSize: '11px', color: '#cbd5e1' }}>يعطل مضاد الصواريخ 10 دقائق</div>
                    </div>
                  </div>

                  {/* 7. معطل مضاد الذري */}
                  <div 
                    onClick={() => {
                      if ((weapons.antiNukeDisabler || 0) <= 0) {
                        alert("❌ لا تملك هذا العنصر!");
                        return;
                      }
                      handleDisableDefense('nuke');
                    }}
                    style={{
                      background: 'rgba(251, 191, 36, 0.05)',
                      border: '1px solid #fbbf24',
                      borderRadius: '12px',
                      padding: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.2s'
                    }}
                    className="hover:bg-[rgba(251,191,36,0.15)]"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '11px', color: '#fcd34d', background: '#78350f', padding: '2px 6px', borderRadius: '4px' }}>{weapons.antiNukeDisabler !== undefined ? weapons.antiNukeDisabler : 6}x</span>
                      <span style={{ fontSize: '24px' }}>⚡</span>
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fcd34d' }}>صاروخ تعطيل مضاد الذري</div>
                      <div style={{ fontSize: '11px', color: '#cbd5e1' }}>يعطل مضاد القنبلة الذرية 10 دقائق</div>
                    </div>
                  </div>

                  {/* 8. معطل مضاد الإعلانية */}
                  <div 
                    onClick={() => {
                      if ((weapons.antiAdDisabler || 0) <= 0) {
                        alert("❌ لا تملك هذا العنصر!");
                        return;
                      }
                      handleDisableDefense('ad');
                    }}
                    style={{
                      background: 'rgba(251, 191, 36, 0.05)',
                      border: '1px solid #fbbf24',
                      borderRadius: '12px',
                      padding: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.2s'
                    }}
                    className="hover:bg-[rgba(251,191,36,0.15)]"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '11px', color: '#fcd34d', background: '#78350f', padding: '2px 6px', borderRadius: '4px' }}>{weapons.antiAdDisabler !== undefined ? weapons.antiAdDisabler : 7}x</span>
                      <span style={{ fontSize: '24px' }}>⚡</span>
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fcd34d' }}>صاروخ تعطيل مضاد الإعلانية</div>
                      <div style={{ fontSize: '11px', color: '#cbd5e1' }}>يعطل مضاد القنبلة الإعلانية 10 دقائق</div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setShowWeaponSelector(false)}
                  style={{
                    background: '#27272a',
                    border: '1px solid #3f3f46',
                    color: '#cbd5e1',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    cursor: 'pointer',
                    marginTop: '18px',
                    width: '100%'
                  }}
                >
                  رجوع 🔙
                </button>
              </div>
            </div>
          )}

          {/* Global Message Modal */}
          {showGlobalMessageModal && !isAtomicBombActive && !showAtomicExplosion && !isLargeRocketActive && !showLargeRocketExplosion && !isMediumRocketActive && !showMediumRocketExplosion && !isSmallRocketActive && !showSmallRocketExplosion && !showSmokeExplosion && (
            <div style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.85)',
              zIndex: 10200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              direction: 'rtl',
              fontFamily: 'Cairo, sans-serif'
            }}>
              <div style={{
                background: 'linear-gradient(to bottom, #1e1b4b, #09090b)',
                border: '3px solid #a855f7',
                borderRadius: '16px',
                padding: '24px',
                width: '100%',
                maxWidth: '440px',
                boxShadow: '0 0 35px rgba(168, 85, 247, 0.55)',
                color: '#fff',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '8px', animation: 'pulse 1.5s infinite' }}>📢</div>
                <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#c084fc', marginBottom: '8px' }}>
                  بث رسالة عالمية في المحيط 🌐
                </h3>
                <p style={{ fontSize: '13px', color: '#cbd5e1', marginBottom: '16px', lineHeight: '1.5' }}>
                  لقد دمرت الخصم للتو! يتاح لك الآن إرسال رسالة تظهر لجميع القراصنة في غرف الدردشة كشعار نصر مهيب!
                </p>

                <textarea 
                  value={globalMessageText}
                  onChange={(e) => setGlobalMessageText(e.target.value)}
                  placeholder="مثال: تم تدمير الميناء بنجاح! القوة الضاربة للقبطان تكتسح الجميع! 🏴‍☠️🔥"
                  style={{
                    width: '100%',
                    height: '90px',
                    background: '#09090b',
                    border: '1px solid #4b5563',
                    borderRadius: '8px',
                    color: '#fff',
                    padding: '10px',
                    fontSize: '13px',
                    textAlign: 'right',
                    resize: 'none',
                    outline: 'none',
                    marginBottom: '16px'
                  }}
                />

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={async () => {
                      if (!globalMessageText.trim()) {
                        alert("⚠️ الرجاء كتابة نص الرسالة أولاً!");
                        return;
                      }
                      try {
                        sendSecureChatMessage(
                          `إعلان نصر من @${username} 📢`,
                          '👑',
                          `👑 [رسالة عالمية] 📢 القبطان مباغتاً يعلن: "${globalMessageText}"`
                        );
                        
                        setGlobalMessageText('');
                        setShowGlobalMessageModal(false);
                        showToast("🚀 تم بث رسالتك بنجاح لجميع القراصنة!", 'success');
                      } catch(e) {
                        console.error(e);
                      }
                    }}
                    style={{
                      flex: 1,
                      background: 'linear-gradient(to right, #a855f7, #6366f1)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 16px',
                      fontWeight: 'bold',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    بث الرسالة الآن 🌐
                  </button>

                  <button 
                    onClick={() => setShowGlobalMessageModal(false)}
                    style={{
                      background: '#27272a',
                      border: '1px solid #3f3f46',
                      color: '#cbd5e1',
                      borderRadius: '8px',
                      padding: '10px 16px',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    تخطي ❌
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Ad Selector Modal */}
          {showAdSelectorModal && (
            <div style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.85)',
              zIndex: 10150,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              direction: 'rtl',
              fontFamily: 'Cairo, sans-serif'
            }}>
              <div style={{
                background: 'linear-gradient(to bottom, #09090b, #18181b)',
                border: '3px solid #22c55e',
                borderRadius: '16px',
                padding: '24px',
                width: '100%',
                maxWidth: '420px',
                boxShadow: '0 10px 40px rgba(34, 197, 94, 0.35)',
                color: '#fff',
                textAlign: 'center'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#4ade80', marginBottom: '8px' }}>
                  📺 اختر الفيديو الإعلاني للقنبلة الإعلانية:
                </h3>
                <p style={{ fontSize: '12px', color: '#a1a1aa', marginBottom: '20px' }}>
                  سيستمر الإعلان معروضاً على محيط المحيط الهادئ للخصم لمدة ساعة كاملة مع تشغيل التأثير الصوتي الملحمي!
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
                  {/* 1. تنين الأعماق */}
                  <div 
                    onClick={() => handleLaunchAdBomb('deep_dragon')}
                    style={{
                      background: '#1e293b',
                      border: '1.5px solid #38bdf8',
                      borderRadius: '10px',
                      padding: '14px',
                      cursor: 'pointer',
                      textAlign: 'right',
                      fontWeight: 'bold',
                      color: '#38bdf8',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <span style={{ fontSize: '24px' }}>🦎</span>
                    <span>تنين الأعماق</span>
                  </div>

                  {/* 2. لوفي ملك القراصنة */}
                  <div 
                    onClick={() => handleLaunchAdBomb('luffy_king')}
                    style={{
                      background: '#1c1917',
                      border: '1.5px solid #facc15',
                      borderRadius: '10px',
                      padding: '14px',
                      cursor: 'pointer',
                      textAlign: 'right',
                      fontWeight: 'bold',
                      color: '#facc15',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <span style={{ fontSize: '24px' }}>☠️</span>
                    <span>لوفي ملك القراصنة 🏴‍☠️</span>
                  </div>

                  {/* 3. فخامة لوفي */}
                  <div 
                    onClick={() => handleLaunchAdBomb('luffy_grandeur')}
                    style={{
                      background: '#2d0606',
                      border: '1.5px solid #f97316',
                      borderRadius: '10px',
                      padding: '14px',
                      cursor: 'pointer',
                      textAlign: 'right',
                      fontWeight: 'bold',
                      color: '#f97316',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <span style={{ fontSize: '24px' }}>🔥</span>
                    <span>فخامة لوفي</span>
                  </div>

                  {/* 4. وإذا سطا خاف الأنام */}
                  <div 
                    onClick={() => handleLaunchAdBomb('anf')}
                    style={{
                      background: '#2e1065',
                      border: '1.5px solid #c084fc',
                      borderRadius: '10px',
                      padding: '14px',
                      cursor: 'pointer',
                      textAlign: 'right',
                      fontWeight: 'bold',
                      color: '#c084fc',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <span style={{ fontSize: '24px' }}>👑</span>
                    <span>وإذا سطا خاف الأنام</span>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setShowAdSelectorModal(false);
                    setShowWeaponSelector(true);
                  }}
                  style={{
                    background: '#27272a',
                    border: '1px solid #3f3f46',
                    color: '#cbd5e1',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  رجوع 🔙
                </button>
              </div>
            </div>
          )}

          {/* Loot Selector Modal */}
          {showLootSelector && !isAtomicBombActive && !showAtomicExplosion && !isLargeRocketActive && !showLargeRocketExplosion && !isMediumRocketActive && !showMediumRocketExplosion && !isSmallRocketActive && !showSmallRocketExplosion && !showSmokeExplosion && (
            <div style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.92)',
              zIndex: 10200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              direction: 'rtl',
              fontFamily: 'Cairo, sans-serif'
            }}>
              <div style={{
                background: 'linear-gradient(to bottom, #1e1b4b, #0f0b29)', // Deep mysterious purplish-blue pirate cave color
                border: '3px solid #eab308',
                borderRadius: '20px',
                padding: '24px',
                width: '100%',
                maxWidth: '500px',
                boxShadow: '0 25px 60px rgba(234, 179, 8, 0.25)',
                color: '#fff',
                textAlign: 'center',
                position: 'relative'
              }}>
                {/* Close button */}
                <button 
                  onClick={() => setShowLootSelector(false)}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: '#fff',
                    fontSize: '18px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ✕
                </button>

                <span style={{ fontSize: '48px', animation: 'bounce 1s infinite' }}>🪙</span>
                <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#fbbf24', margin: '8px 0 4px 0' }}>
                  سرقة ونهب حطام الأسطول
                </h3>
                <p style={{ fontSize: '13px', color: '#cbd5e1', marginBottom: '24px' }}>
                  اختر إحدى السفن المدمرة لنهب محتويات خزينتها وحمولتها المتبقية!
                </p>

                {/* Three cards styled exactly like the video at 0:04 */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '16px',
                  marginBottom: '24px'
                }}>
                  {[1, 2, 3].map((cardId) => {
                    const isSelected = selectedLootCard === cardId;
                    const isAnySelected = selectedLootCard !== null;

                    return (
                      <div
                        key={cardId}
                        onClick={async () => {
                          if (isAnySelected) return;
                          
                          // Perform loot calculations
                          setSelectedLootCard(cardId);
                          
                          const rand = Math.random();
                          let result = '';
                          let amt = 0;
                          
                          if (rand < 0.7) {
                            // Gold
                            amt = Math.floor(2500 + Math.random() * 12500);
                            setGold(prev => prev + amt);
                            result = `🪙 +${amt.toLocaleString()} ذهبة`;
                            
                            try {
                              if (auth.currentUser) {
                                await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                                  gold: gold + amt
                                });
                              }
                              await createHarborEvent(inspectedPlayer.userId, 'LOOT', {
                                lootType: 'gold',
                                amount: amt
                              });
                            } catch (e) { console.error(e); }
                          } else if (rand < 0.9) {
                            // Blue Gems
                            amt = Math.floor(5 + Math.random() * 20);
                            setGems(prev => prev + amt);
                            result = `💎 +${amt} جوهرة`;

                            try {
                              if (auth.currentUser) {
                                await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                                  gems: gems + amt
                                });
                              }
                              await createHarborEvent(inspectedPlayer.userId, 'LOOT', {
                                lootType: 'gems',
                                amount: amt
                              });
                            } catch (e) { console.error(e); }
                          } else {
                            // Red Gems
                            amt = Math.floor(2 + Math.random() * 10);
                            setRedGems(prev => prev + amt);
                            result = `🔴 +${amt} جوهرة حمراء`;

                            try {
                              if (auth.currentUser) {
                                await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                                  redGems: redGems + amt
                                });
                              }
                              await createHarborEvent(inspectedPlayer.userId, 'LOOT', {
                                lootType: 'redGems',
                                amount: amt
                              });
                            } catch (e) { console.error(e); }
                          }

                          setLootResultText(result);

                          // Play sound effect
                          try {
                            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                            if (AudioContext) {
                              const ctx = new AudioContext();
                              // Synthesize positive coin sound
                              const osc = ctx.createOscillator();
                              const gain = ctx.createGain();
                              osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
                              osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
                              osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.2); // D6
                              gain.gain.setValueAtTime(0.15, ctx.currentTime);
                              gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.4);
                              osc.connect(gain);
                              gain.connect(ctx.destination);
                              osc.start();
                              osc.stop(ctx.currentTime + 0.4);
                            }
                          } catch (err) {}
                        }}
                        style={{
                          width: '110px',
                          height: '160px',
                          background: isSelected 
                            ? 'linear-gradient(135deg, #10b981 0%, #064e3b 100%)' // Green win background
                            : 'linear-gradient(135deg, #475569 0%, #1e293b 100%)',
                          border: isSelected 
                            ? '3.5px solid #10b981'
                            : '2.5px solid #eab308',
                          borderRadius: '16px',
                          cursor: isAnySelected ? 'default' : 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '12px',
                          position: 'relative',
                          boxShadow: isSelected 
                            ? '0 0 20px #10b981' 
                            : '0 8px 16px rgba(0,0,0,0.4)',
                          transform: isSelected ? 'scale(1.05)' : 'none',
                          transition: 'transform 0.3s ease, background 0.3s ease, border-color 0.3s ease',
                          opacity: isAnySelected && !isSelected ? 0.45 : 1
                        }}
                      >
                        {!isSelected ? (
                          <>
                            {/* Red shield/ship crest from video */}
                            <div style={{
                              width: '64px',
                              height: '84px',
                              background: 'radial-gradient(circle, #dc2626 0%, #7f1d1d 100%)',
                              border: '2px solid #fbbf24',
                              borderRadius: '10px',
                              boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '32px',
                            }}>
                              ⛵
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#fef08a', marginTop: '10px' }}>سفينة غامضة</span>
                          </>
                        ) : (
                          <>
                            <div style={{ fontSize: '40px', animation: 'bounce 0.5s infinite alternate' }}>🎁</div>
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff', marginTop: '8px' }}>تم النهب!</span>
                            <span style={{ fontSize: '13px', fontWeight: '900', color: '#fef08a', marginTop: '4px', textAlign: 'center' }}>
                              {lootResultText}
                            </span>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

                {selectedLootCard !== null && (
                  <button 
                    onClick={() => setShowLootSelector(false)}
                    style={{
                      background: 'linear-gradient(to bottom, #f59e0b, #d97706)',
                      border: '1.5px solid #fef08a',
                      color: '#000',
                      borderRadius: '10px',
                      padding: '12px 24px',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      cursor: 'pointer',
                      width: '100%',
                      boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)',
                      animation: 'pulse 1.5s infinite'
                    }}
                  >
                    تأكيد الغنائم والعودة ⚔️
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ----------------- REPORTS TAB (مركز التنبيهات والسرقات والقتال) ----------------- */}
      {activeTab === 'reports' && (
        <div className="tab-overlay">
          <div className="tab-title">
            <span>🔔 مركز التنبيهات (القصف والسرقات والقتال)</span>
            <button className="close-tab-btn" onClick={() => setActiveTab('harbor')}>إغلاق</button>
          </div>
          <p style={{ fontSize: '12.5px', color: '#ffffff', marginBottom: '14px', lineHeight: '1.6' }}>
            سجل الهجمات والقصف والغارات ومحاولات التسلل أو السرقة التي تعرضت لها، بالإضافة لنتائج معاركك السابقة!
          </p>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            <button 
              onClick={() => {
                if (window.confirm("🗑️ هل أنت متأكد من مسح جميع التنبيهات والتقارير؟")) {
                  setBattleReports([]);
                }
              }}
              style={{ flex: 1, background: '#7f1d1d', color: '#fca5a5', border: '1px solid #ef4444', borderRadius: '8px', padding: '10px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', textAlign: 'center' }}
            >
              🗑️ مسح جميع التنبيهات والتقارير
            </button>
          </div>

          {battleReports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#cbd5e1', background: '#1c1917', borderRadius: '12px', border: '1.5px dashed #444' }}>
              🔔 لا توجد أي تنبيهات أو بلاغات حالياً. ميناؤك البحري آمن ومستقر!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '420px', overflowY: 'auto', paddingRight: '2px' }}>
              {battleReports.map(report => {
                // Determine if this is a theft/raid alert or a standard battle
                const isRaid = report.id?.includes('raid');
                const isSecure = report.id?.includes('secure');
                const isPvPDefense = report.log && report.log[0] && (report.log[0].includes('غزو مباغت') || report.log[0].includes('نصر دفاعي'));
                
                let alertColor = 'rgba(22, 163, 74, 0.1)';
                let alertBorder = '1px solid #16a34a';
                let typeBadge = '🏆 معركة ناجحة';
                
                if (isRaid) {
                  alertColor = 'rgba(239, 68, 68, 0.15)';
                  alertBorder = '2px solid #ef4444';
                  typeBadge = '🏴‍☠️ تسلل وسرقة ذهب!';
                } else if (isSecure) {
                  alertColor = 'rgba(59, 130, 246, 0.15)';
                  alertBorder = '2px solid #3b82f6';
                  typeBadge = '🛡️ إحباط سرقة';
                } else if (isPvPDefense) {
                  if (report.isVictory) {
                    alertColor = 'rgba(16, 185, 129, 0.15)';
                    alertBorder = '1px solid #10b981';
                    typeBadge = '🛡️ دفاع ناجح ضد غزو';
                  } else {
                    alertColor = 'rgba(220, 38, 38, 0.2)';
                    alertBorder = '2px dashed #ef4444';
                    typeBadge = '💥 قصف وتدمير الميناء!';
                  }
                } else {
                  alertColor = report.isVictory ? 'rgba(22, 163, 74, 0.1)' : 'rgba(220, 38, 38, 0.1)';
                  alertBorder = report.isVictory ? '1px solid #16a34a' : '1px solid #dc2626';
                  typeBadge = report.isVictory ? '🏆 غزوة ناجحة' : '💀 معركة خاسرة';
                }

                return (
                  <div 
                    key={report.id} 
                    onClick={() => setActiveReport(report)}
                    style={{ 
                      background: alertColor, 
                      border: alertBorder, 
                      padding: '12px', 
                      borderRadius: '10px', 
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                    className="report-item-hover"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '26px' }}>{report.opponentAvatar || '🔔'}</span>
                      <div>
                        <div style={{ fontWeight: 'black', fontSize: '13px', color: '#fff' }}>{report.opponentName}</div>
                        <div style={{ fontSize: '10px', color: '#cbd5e1', marginTop: '2px' }}>التوقيت: {report.time}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <span style={{ fontSize: '9px', background: report.isVictory ? '#16a34a' : '#dc2626', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                        {typeBadge}
                      </span>
                      {report.goldChange !== 0 && (
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: report.goldChange > 0 ? '#22c55e' : '#ef4444' }}>
                          {report.goldChange > 0 ? `+${report.goldChange}` : report.goldChange} 🪙
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ----------------- QUESTS MENU DRAWER ----------------- */}
      {activeTab === 'harbor' && (
        <div style={{
          position: 'fixed',
          top: '70px',
          left: '2.5%',
          width: questsExpanded ? '210px' : '40px',
          height: questsExpanded ? 'auto' : '40px',
          background: 'rgba(15, 12, 9, 0.95)',
          border: '2px solid #ca8a04',
          borderRadius: '8px',
          padding: questsExpanded ? '8px' : '0',
          zIndex: 10,
          color: '#fff',
          fontSize: '11px',
          maxHeight: questsExpanded ? '240px' : '40px',
          overflowY: questsExpanded ? 'auto' : 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: questsExpanded ? 'stretch' : 'center',
          justifyContent: questsExpanded ? 'flex-start' : 'center',
          cursor: questsExpanded ? 'default' : 'pointer',
          boxShadow: '0 8px 16px rgba(0,0,0,0.6)',
        }} 
        onClick={() => { if (!questsExpanded) setQuestsExpanded(true); }}
        dir="rtl"
        title={questsExpanded ? "" : "فتح المهمات اليومية"}
        >
          {questsExpanded ? (
            <>
              <div style={{ fontWeight: 'bold', color: '#facc15', borderBottom: '1px solid #ca8a04', paddingBottom: '3px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>🎯 المهمات اليومية</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); setQuestsExpanded(false); }} 
                  style={{ background: 'transparent', border: 'none', color: '#ca8a04', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', padding: '0 4px' }}
                  title="تصغير"
                >
                  ✕
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {quests.map(q => (
                  <div key={q.id} style={{ background: '#292524', padding: '5px', borderRadius: '4px', border: '1px solid #57534e' }}>
                    <div style={{ fontWeight: 'bold', color: '#fef08a' }}>{q.title}</div>
                    <div style={{ color: '#ffffff', fontSize: '9.5px', fontWeight: 'bold' }}>{q.target}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3px' }}>
                      <span>{q.progress}/{q.max}</span>
                      {q.completed && !q.claimed && (
                        <button 
                          onClick={() => claimQuestReward(q.id, q.rewardGold, q.rewardGems)}
                          style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: '3px', padding: '1px 4px', fontSize: '9px', cursor: 'pointer', fontWeight: 'bold' }}>
                          اجمع
                        </button>
                      )}
                      {q.claimed && <span style={{ color: '#16a34a', fontWeight: 'bold' }}>تم ✓</span>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <span style={{ fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>🎯</span>
          )}
        </div>
      )}

      {/* ----------------- TAVERN / CREW RECRUITMENT MODAL ----------------- */}
      <CrewTavernModal
        isOpen={crewModal}
        onClose={() => setCrewModal(false)}
        gold={gold}
        setGold={setGold}
        gems={gems}
        setGems={setGems}
        crewServices={crewServices}
        setCrewServices={setCrewServices}
        ships={ships}
        setShips={setShips}
        currentShipId={currentShipId}
        onSelectShip={setCurrentShipId}
        buyCrewService={buyCrewService}
        unassignCrewFromShip={unassignCrewFromShip}
        unassignCrewFromAllShips={unassignCrewFromAllShips}
        assignCrewToAllShips={assignCrewToAllShips}
        onToggleAutoFishing={toggleAutoFishing}
      />

      {/* ----------------- VIEW REPORT DETAILED MODAL ----------------- */}
      {activeReport && (
        <div className="tab-overlay" style={{ zIndex: 110, maxWidth: '450px', margin: '0 auto' }}>
          <div className="tab-title">
            <span>📜 تفاصيل تقرير المعركة</span>
            <button className="close-tab-btn" onClick={() => setActiveReport(null)}>إغلاق</button>
          </div>
          <div style={{ background: '#1c1917', border: '1px solid #ca8a04', borderRadius: '8px', padding: '12px', fontSize: '12px' }}>
            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
              <div style={{ fontSize: '40px' }}>{activeReport.opponentAvatar}</div>
              <h3 style={{ margin: '4px 0', color: '#facc15' }}>معركة ضد: {activeReport.opponentName}</h3>
              <span style={{ fontSize: '10px', background: activeReport.isVictory ? '#16a34a' : '#dc2626', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>
                {activeReport.isVictory ? 'نصر ساحق 🏆' : 'هزيمة 💀'}
              </span>
            </div>

            <div style={{ borderTop: '1px solid #292524', paddingTop: '8px', marginBottom: '10px' }}>
              <div style={{ fontWeight: 'bold', color: '#ca8a04' }}>💰 الغنائم الحربية:</div>
              <div>الذهب: <span style={{ color: '#facc15' }}>+{activeReport.goldChange} ذهب</span></div>
              <div>الجواهر: <span style={{ color: '#60a5fa' }}>+{activeReport.gemsChange} جواهر</span></div>
              <div>الخبرة: <span style={{ color: '#10b981' }}>+{activeReport.expGained} XP</span></div>
            </div>

            <div style={{ fontWeight: 'bold', color: '#ca8a04' }}>📝 مجريات المعركة بالتفصيل:</div>
            <div style={{ background: '#0a0806', border: '1px solid #78350f', padding: '6px', borderRadius: '4px', maxHeight: '120px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '10px' }}>
              {activeReport.log.map((line, idx) => (
                <div key={idx} style={{ color: '#fff', borderBottom: '1px solid #1a1510', paddingBottom: '2px', marginTop: '2px' }}>{line}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ----------------- SHIP REPAIR & RESTORATION MODAL ----------------- */}
      {repairModalShip && (
        <div 
          id="ship-repair-modal" 
          className="modal" 
          style={{ 
            display: 'block', 
            maxWidth: '460px', 
            width: '92%', 
            padding: '16px', 
            background: 'rgba(18, 14, 10, 0.98)', 
            border: '2px solid #ca8a04', 
            borderRadius: '16px', 
            boxShadow: '0 12px 40px rgba(0,0,0,0.9), 0 0 20px rgba(202, 138, 4, 0.3)',
            direction: 'rtl',
            fontFamily: '"Cairo", sans-serif',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #332715', paddingBottom: '10px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '24px' }}>🛠️</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#facc15', fontWeight: '900' }}>ورشة صيانة وترميم السفن</h3>
                <div style={{ fontSize: '11px', color: '#a8a29e' }}>إصلاح أضرار المعارك واستعادة جاهزية الأسطول</div>
              </div>
            </div>
            <button 
              onClick={() => setRepairModalShip(null)}
              style={{ background: 'transparent', border: 'none', color: '#a8a29e', fontSize: '20px', cursor: 'pointer', padding: '4px' }}
            >
              ✕
            </button>
          </div>

          {/* Ship Details Card */}
          {(() => {
            const ship = ships.find(s => s.id === repairModalShip.id) || repairModalShip;
            const maxH = ship.maxHeart || ((ship.level || 0) * 1000) + 10000;
            const curH = typeof ship.heart === 'number' ? ship.heart : maxH;
            const isDestroyed = curH <= 0 || portDestroyed;
            const healthPct = Math.min(100, Math.max(0, Math.round((curH / maxH) * 100)));

            return (
              <div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  background: 'rgba(30, 24, 18, 0.9)', 
                  border: isDestroyed ? '1.5px solid #ef4444' : '1px solid #78350f', 
                  borderRadius: '12px', 
                  padding: '10px 14px', 
                  marginBottom: '14px' 
                }}>
                  <div style={{ width: '60px', height: '50px', position: 'relative', flexShrink: 0 }}>
                    <ShipImage level={typeof ship.level === 'number' ? ship.level : 0} width={60} plain={true} fill={true} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '900', color: '#fde047' }}>{ship.name || 'سفينة الأسطول'}</span>
                      <span style={{ 
                        fontSize: '10px', 
                        padding: '2px 8px', 
                        borderRadius: '8px', 
                        fontWeight: 'bold',
                        background: isDestroyed ? 'rgba(239, 68, 68, 0.25)' : 'rgba(34, 197, 94, 0.2)',
                        color: isDestroyed ? '#fca5a5' : '#86efac',
                        border: isDestroyed ? '1px solid #ef4444' : '1px solid #22c55e'
                      }}>
                        {isDestroyed ? '🔥 مدمّرة بالكامل' : curH < maxH ? '⚠️ متضررة' : '✅ سليمة'}
                      </span>
                    </div>

                    {/* Health bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#e5e7eb', marginBottom: '3px' }}>
                      <span>نقاط الهيكل (HP):</span>
                      <span style={{ fontWeight: 'bold', color: isDestroyed ? '#ef4444' : healthPct < 50 ? '#f59e0b' : '#10b981' }}>
                        {curH.toLocaleString()} / {maxH.toLocaleString()} ({healthPct}%)
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#262626', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ 
                        width: `${healthPct}%`, 
                        height: '100%', 
                        background: isDestroyed ? '#ef4444' : healthPct < 50 ? 'linear-gradient(90deg, #ef4444, #f59e0b)' : 'linear-gradient(90deg, #10b981, #059669)',
                        transition: 'width 0.4s ease'
                      }} />
                    </div>
                  </div>
                </div>

                {/* Section 1: Crew services / repairers from warehouse */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#facc15', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>📦</span>
                    <span>طواقم الصيانة من مستودعك:</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                    {/* Small Repairer */}
                    <div style={{ 
                      background: 'rgba(25, 20, 15, 0.85)', 
                      border: '1px solid #443425', 
                      borderRadius: '10px', 
                      padding: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <img src={FIXER_SMALL_ICON} alt="مصلح صغير" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                        <div>
                          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#fef08a' }}>مصلح صغير</div>
                          <div style={{ fontSize: '9.5px', color: '#a8a29e' }}>+500 HP</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                        <span style={{ fontSize: '10px', color: '#d1d5db' }}>لديك: <strong style={{ color: (crewServices.repairer_small || 0) > 0 ? '#4ade80' : '#ef4444' }}>{crewServices.repairer_small || 0}</strong></span>
                        <button 
                          disabled={(crewServices.repairer_small || 0) <= 0 || curH >= maxH}
                          onClick={() => handleRepairShip(ship.id, 'small')}
                          style={{
                            padding: '4px 10px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: ((crewServices.repairer_small || 0) > 0 && curH < maxH) ? 'pointer' : 'not-allowed',
                            background: ((crewServices.repairer_small || 0) > 0 && curH < maxH) ? '#16a34a' : '#4b5563',
                            color: '#fff'
                          }}
                        >
                          استخدام
                        </button>
                      </div>
                    </div>

                    {/* Medium Repairer */}
                    <div style={{ 
                      background: 'rgba(25, 20, 15, 0.85)', 
                      border: '1px solid #443425', 
                      borderRadius: '10px', 
                      padding: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <img src={FIXER_MEDIUM_ICON} alt="مصلح وسط" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                        <div>
                          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#fef08a' }}>مصلح وسط</div>
                          <div style={{ fontSize: '9.5px', color: '#a8a29e' }}>+1,000 HP (أو 50%)</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                        <span style={{ fontSize: '10px', color: '#d1d5db' }}>لديك: <strong style={{ color: (crewServices.repairer_medium || 0) > 0 ? '#4ade80' : '#ef4444' }}>{crewServices.repairer_medium || 0}</strong></span>
                        <button 
                          disabled={(crewServices.repairer_medium || 0) <= 0 || curH >= maxH}
                          onClick={() => handleRepairShip(ship.id, 'medium')}
                          style={{
                            padding: '4px 10px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: ((crewServices.repairer_medium || 0) > 0 && curH < maxH) ? 'pointer' : 'not-allowed',
                            background: ((crewServices.repairer_medium || 0) > 0 && curH < maxH) ? '#16a34a' : '#4b5563',
                            color: '#fff'
                          }}
                        >
                          استخدام
                        </button>
                      </div>
                    </div>

                    {/* Large Repairer */}
                    <div style={{ 
                      background: 'rgba(25, 20, 15, 0.85)', 
                      border: '1px solid #443425', 
                      borderRadius: '10px', 
                      padding: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <img src={FIXER_LARGE_ICON} alt="مصلح كبير" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                        <div>
                          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#fef08a' }}>مصلح كبير</div>
                          <div style={{ fontSize: '9.5px', color: '#a8a29e' }}>100% إصلاح كامل</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                        <span style={{ fontSize: '10px', color: '#d1d5db' }}>لديك: <strong style={{ color: (crewServices.repairer_large || 0) > 0 ? '#4ade80' : '#ef4444' }}>{crewServices.repairer_large || 0}</strong></span>
                        <button 
                          disabled={(crewServices.repairer_large || 0) <= 0 || curH >= maxH}
                          onClick={() => handleRepairShip(ship.id, 'large')}
                          style={{
                            padding: '4px 10px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: ((crewServices.repairer_large || 0) > 0 && curH < maxH) ? 'pointer' : 'not-allowed',
                            background: ((crewServices.repairer_large || 0) > 0 && curH < maxH) ? '#16a34a' : '#4b5563',
                            color: '#fff'
                          }}
                        >
                          استخدام
                        </button>
                      </div>
                    </div>

                    {/* Legendary Repairer */}
                    <div style={{ 
                      background: 'rgba(25, 20, 15, 0.85)', 
                      border: '1px solid #443425', 
                      borderRadius: '10px', 
                      padding: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <img src={FIXER_LEGENDARY_ICON} alt="مصلح أسطوري" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                        <div>
                          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#fef08a' }}>مصلح أسطوري</div>
                          <div style={{ fontSize: '9.5px', color: '#a8a29e' }}>100% كامل الأسطول</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                        <span style={{ fontSize: '10px', color: '#d1d5db' }}>لديك: <strong style={{ color: (crewServices.repairer_legendary || 0) > 0 ? '#4ade80' : '#ef4444' }}>{crewServices.repairer_legendary || 0}</strong></span>
                        <button 
                          disabled={(crewServices.repairer_legendary || 0) <= 0}
                          onClick={() => handleRepairShip(ship.id, 'legendary')}
                          style={{
                            padding: '4px 10px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: (crewServices.repairer_legendary || 0) > 0 ? 'pointer' : 'not-allowed',
                            background: (crewServices.repairer_legendary || 0) > 0 ? '#eab308' : '#4b5563',
                            color: (crewServices.repairer_legendary || 0) > 0 ? '#000' : '#fff'
                          }}
                        >
                          استخدام
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Instant Harbor Workshop Options */}
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#facc15', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>⚡</span>
                    <span>الصيانة الفورية بورشة الميناء:</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {/* Gold Repair */}
                    <button
                      disabled={curH >= maxH || gold < 500}
                      onClick={() => handleRepairShip(ship.id, 'gold')}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 14px',
                        background: (curH < maxH && gold >= 500) ? 'linear-gradient(135deg, #1e293b, #0f172a)' : 'rgba(30, 25, 20, 0.6)',
                        border: (curH < maxH && gold >= 500) ? '1px solid #facc15' : '1px solid #4b5563',
                        borderRadius: '10px',
                        cursor: (curH < maxH && gold >= 500) ? 'pointer' : 'not-allowed',
                        color: '#fff'
                      }}
                    >
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#fde047' }}>إصلاح وترميم هذه السفينة بالكامل 100%</div>
                        <div style={{ fontSize: '10px', color: '#94a3b8' }}>استعادة كامل نقاط الصحة وإطفاء النيران فوراً</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#ca8a04', color: '#000', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' }}>
                        <span>🪙 500</span>
                        <span>ذهب</span>
                      </div>
                    </button>

                    {/* Gems Fleet Repair */}
                    <button
                      disabled={gems < 10}
                      onClick={() => handleRepairShip(ship.id, 'gems')}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 14px',
                        background: gems >= 10 ? 'linear-gradient(135deg, #1e1b4b, #312e81)' : 'rgba(30, 25, 20, 0.6)',
                        border: gems >= 10 ? '1px solid #818cf8' : '1px solid #4b5563',
                        borderRadius: '10px',
                        cursor: gems >= 10 ? 'pointer' : 'not-allowed',
                        color: '#fff'
                      }}
                    >
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#c7d2fe' }}>ترميم كامل أسطول السفن دفعة واحدة 100%</div>
                        <div style={{ fontSize: '10px', color: '#94a3b8' }}>صيانة شاملة لجميع السفن وإعادة جاهزية الإبحار</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#4f46e5', color: '#fff', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' }}>
                        <span>💎 10</span>
                        <span>جواهر</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ----------------- CONFIRM SELL MODAL ----------------- */}
      {confirmModal && (
        <div id="confirm-modal" className="modal" style={{ display: 'block' }}>
          <div style={{ fontSize: '24px' }}>⚓</div>
          <h3>بيع السفينة</h3>
          <p style={{ fontSize: '11.5px', color: '#ffffff', fontWeight: 'bold' }}>هل أنت متأكد من بيع هذه السفينة لصالح ميناء ملوك الأعماق؟</p>
          <div style={{ margin: '10px 0', fontWeight: 'bold', color: '#fcd34d' }}>+ 250 ذهب</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setConfirmModal(false)} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '5px', background: '#444', color: '#fff', cursor: 'pointer', fontSize: '11px' }}>إلغاء</button>
            <button onClick={confirmSell} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '5px', background: '#ca8a04', color: '#000', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>تأكيد</button>
          </div>
        </div>
      )}

      {/* ----------------- REWARD COLLECT MODAL ----------------- */}
      {rewardModal && (
        <div id="reward-modal" className="modal" style={{ display: 'block' }}>
          <div style={{ fontSize: '11px', marginBottom: '3px' }}>نتيجة رحلة الصيد بنجاح</div>
          <div style={{ fontSize: '40px' }}>{getFishEmoji(rewardFish.name)}</div>
          <h3 style={{ fontSize: '14px', color: '#facc15', margin: '4px 0' }}>{rewardFish.name}</h3>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fcd34d' }}>{rewardFish.amount?.toLocaleString()}x سمكة</div>
          {rewardFish.luckDoubled && (
            <div style={{ margin: '6px 0', padding: '4px 10px', background: 'rgba(34, 197, 94, 0.2)', border: '1px solid #22c55e', borderRadius: '6px', color: '#86efac', fontSize: '11px', fontWeight: 'bold' }}>
              🍀 الحظ السعيد: تم مضاعفة صيد السفينة 2x بنجاح!
            </div>
          )}
          {rewardFish.guided && (
            <div style={{ margin: '6px 0', padding: '4px 10px', background: 'rgba(56, 189, 248, 0.2)', border: '1px solid #38bdf8', borderRadius: '6px', color: '#7dd3fc', fontSize: '11px', fontWeight: 'bold' }}>
              🧭 مرشد السفينة: صيد موحد ومتوقع لجميع سفن الأسطول!
            </div>
          )}
          <div style={{ margin: '6px 0', fontWeight: 'bold', color: '#38bdf8', fontSize: '12px' }}>📦 تمت إضافة الأسماك إلى بيت السمك لبيعها!</div>
          <button onClick={() => setRewardModal(false)} style={{ width: '100%', padding: '8px', marginTop: '8px', border: 'none', borderRadius: '5px', background: '#16a34a', color: '#fff', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>موافق</button>
        </div>
      )}

      {/* ----------------- FISH STORAGE MODAL (بيت السمك) ----------------- */}
      {fishStorageModal && (
        <FishHouseComponent 
          userLevel={fishStorageLevel} 
          gold={gold}
          gems={gems}
          redGems={redGems}
          fishInventory={fishInventory}
          onClose={() => setFishStorageModal(false)}
          onUpgrade={async () => {
            if (!isNetworkOnline()) {
              notifyOfflineBlocked('ترقية بيت السمك');
              return;
            }
            const cost = fishStorageLevel * 500;
            if (fishStorageLevel >= 31) {
              alert('لقد وصلت للحد الأقصى من المستويات (المستوى 31)! السعة القصوى 24,000,000.');
              return;
            }
            if (gold < cost) {
              alert(`الذهب غير كافٍ! تحتاج إلى ${cost.toLocaleString()} 🪙 ذهب لترقية بيت السمك إلى المستوى ${fishStorageLevel + 1}.`);
              return;
            }

            const nextLevel = fishStorageLevel + 1;
            const res = await executeFinancialTransaction({
              goldDelta: -cost,
              fishStorageLevel: nextLevel,
              reason: `ترقية بيت السمك إلى المستوى ${nextLevel}`,
              onLocalApply: () => {
                setGold(prev => prev - cost);
                setFishStorageLevel(nextLevel);
              }
            });

            if (res.success) {
              if (typeof res.newGold === 'number') {
                setGold(res.newGold);
              }
              setFishStorageLevel(nextLevel);
              window.dispatchEvent(new CustomEvent('spawn-pirate-particles', {
                detail: { x: window.innerWidth / 2, y: window.innerHeight / 2, type: 'gold-gain', count: 25 }
              }));
              alert(`🎉 تم ترقية بيت السمك بنجاح إلى المستوى ${nextLevel} عبر المعاملة الذرية!`);
            }
          }}
          onSellFish={async (fishName, amount, totalEarned) => {
            if (!isNetworkOnline()) {
              notifyOfflineBlocked(`بيع سمك ${fishName}`);
              return;
            }

            const currentCount = fishInventory[fishName] || 0;
            const newCount = Math.max(0, currentCount - amount);
            const nextInv = { ...fishInventory };
            if (newCount > 0) {
              nextInv[fishName] = newCount;
            } else {
              delete nextInv[fishName];
            }

            const res = await executeFinancialTransaction({
              goldDelta: totalEarned,
              fishInventory: nextInv,
              reason: `بيع ${amount.toLocaleString()} من سمك ${fishName}`,
              onLocalApply: () => {
                setFishInventory(nextInv);
                setGold(prev => prev + totalEarned);
                localStorage.setItem('pirate_fish_inventory', JSON.stringify(nextInv));
              }
            });

            if (res.success) {
              if (typeof res.newGold === 'number') {
                setGold(res.newGold);
              }
              setFishInventory(nextInv);
              localStorage.setItem('pirate_fish_inventory', JSON.stringify(nextInv));
              window.dispatchEvent(new CustomEvent('spawn-pirate-particles', {
                detail: { x: window.innerWidth / 2, y: window.innerHeight / 2, type: 'gold-gain', count: 30 }
              }));
            }
          }}
          onSellAllFish={async (totalEarned) => {
            if (!isNetworkOnline()) {
              notifyOfflineBlocked('بيع كل الأسماك');
              return;
            }

            const emptyInv: Record<string, number> = {};
            const res = await executeFinancialTransaction({
              goldDelta: totalEarned,
              fishInventory: emptyInv,
              reason: `بيع كل الأسماك بالمخزن بمبلغ ${totalEarned.toLocaleString()} ذهب`,
              onLocalApply: () => {
                setFishInventory(emptyInv);
                setGold(prev => prev + totalEarned);
                localStorage.setItem('pirate_fish_inventory', JSON.stringify(emptyInv));
              }
            });

            if (res.success) {
              if (typeof res.newGold === 'number') {
                setGold(res.newGold);
              }
              setFishInventory(emptyInv);
              localStorage.setItem('pirate_fish_inventory', JSON.stringify(emptyInv));
              window.dispatchEvent(new CustomEvent('spawn-pirate-particles', {
                detail: { x: window.innerWidth / 2, y: window.innerHeight / 2, type: 'gold-gain', count: 40 }
              }));
            }
          }}
        />
      )}

      {/* ----------------- SHIP SELECTION ACTION MENU ----------------- */}
      {menu.visible && (
        <div 
          id="ship-menu" 
          ref={shipMenuRef}
          dir="rtl"
          style={{ 
            display: 'flex', 
            position: 'fixed',
            left: `${menu.x}px`, 
            top: `${menu.y}px`,
            maxWidth: 'calc(100vw - 24px)',
            boxSizing: 'border-box',
            zIndex: 120 
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {menu.status === 'docked' ? (
            <div className="menu-btn" onClick={() => act('fish')}><div className="menu-icon">🎣</div>صيد</div>
          ) : (
            <div className="menu-btn" onClick={() => act('collect')}><div className="menu-icon">🪣</div>اجمع</div>
          )}

          {/* Golden Hunter Auto-Fishing Pause/Play Quick Toggle in Action Menu */}
          {(() => {
            const activeShip = ships.find(s => s.id === (currentShipId || menu.shipId));
            const hasGH = activeShip?.assignedCrew?.some(c => c === 'golden_hunter' || c === 'gold_fisher');
            if (hasGH && activeShip) {
              return (
                <div 
                  className="menu-btn" 
                  onClick={() => {
                    toggleAutoFishing(activeShip.id);
                    setMenu(prev => ({ ...prev, visible: false }));
                  }}
                  style={{
                    background: activeShip.autoFishingPaused ? 'linear-gradient(135deg, #059669, #047857)' : 'linear-gradient(135deg, #b45309, #78350f)',
                    color: '#fff',
                    border: activeShip.autoFishingPaused ? '1px solid #34d399' : '1px solid #fde047'
                  }}
                  title={activeShip.autoFishingPaused ? "تشغيل الصيد التلقائي" : "إيقاف الصيد التلقائي"}
                >
                  <div className="menu-icon">{activeShip.autoFishingPaused ? '▶️' : '⏸️'}</div>
                  {activeShip.autoFishingPaused ? 'تشغيل الآلي' : 'إيقاف الآلي'}
                </div>
              );
            }
            return null;
          })()}

          {/* Repair / Maintenance Button in Action Menu */}
          {(() => {
            const activeShip = ships.find(s => s.id === (currentShipId || menu.shipId));
            const maxH = activeShip?.maxHeart || ((activeShip?.level || 0) * 1000) + 10000;
            const curH = typeof activeShip?.heart === 'number' ? activeShip.heart : maxH;
            const isDamaged = activeShip && (portDestroyed || curH < maxH);
            if (isDamaged) {
              const isDestroyed = portDestroyed || curH <= 0;
              return (
                <div 
                  className="menu-btn" 
                  onClick={() => act('repair')}
                  style={{
                    background: isDestroyed ? 'linear-gradient(135deg, #b91c1c, #991b1b)' : 'linear-gradient(135deg, #059669, #047857)',
                    color: '#fff',
                    border: isDestroyed ? '1px solid #fca5a5' : '1px solid #6ee7b7'
                  }}
                  title="صيانة وترميم هيكل السفينة"
                >
                  <div className="menu-icon">🔧</div>
                  {isDestroyed ? 'إصلاح وترميم' : 'صيانة'}
                </div>
              );
            }
            return null;
          })()}

          <div className="menu-btn" onClick={() => act('crew')}><div className="menu-icon">👥</div>طاقم</div>
          <div className="menu-btn" onClick={() => act('sell')}><div className="menu-icon">💰</div>بيع</div>
        </div>
      )}

      {/* ----------------- TOP BAR / RESOURCES HUD ----------------- */}
      <div className="top-bar" dir="rtl">
        <div className="resource-box" onClick={() => setActiveTab('settings')}>
          <img className="res-icon" src="https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/IMG_20260702_004120.jpg" alt="Menu" />
          <div className="res-label">القائمة (ليفل {playerLevel})</div>
        </div>
        <div className="resource-box" onClick={() => setActiveTab('shop')}>
          <img className="res-icon" src="https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/IMG_20260702_004010.png" alt="Gems" />
          <div className="res-label">جواهر: <span id="gems-count">{gems}</span></div>
        </div>
        <div className="resource-box" onClick={() => setActiveTab('shop')}>
          <img className="res-icon" src="https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/copilot_image_1782936949624.jpeg" alt="Gold" />
          <div className="res-label">ذهب: <span id="gold-count">{gold}</span></div>
        </div>

        {!isOnline && (
          <div 
            onClick={() => setOfflineNotice('⚠️ انقطع الاتصال بالإنترنت! تم تجميد العمليات المالية مؤقتاً لحماية رصيدك وأصولك ومنع حدوث تضارب في البيانات.')}
            style={{
              background: 'rgba(239, 68, 68, 0.25)',
              border: '1.5px solid #ef4444',
              borderRadius: '20px',
              padding: '4px 10px',
              color: '#fca5a5',
              fontSize: '11px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
            title="انقر لعرض تفاصيل التنبيه"
          >
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></span>
            <span>الإنترنت مفصول (المعاملات مجمدة)</span>
          </div>
        )}
      </div>

      {/* ----------------- OFFLINE FINANCIAL NOTICE BANNER ----------------- */}
      {offlineNotice && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 99999,
          maxWidth: '92%',
          width: '460px',
          background: 'linear-gradient(135deg, #1e1b4b, #2b0b1e)',
          border: '2px solid #ef4444',
          borderRadius: '16px',
          boxShadow: '0 12px 35px rgba(239, 68, 68, 0.45), 0 0 25px rgba(0,0,0,0.85)',
          padding: '16px 20px',
          color: '#fff',
          direction: 'rtl',
          fontFamily: 'Cairo, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '24px' }}>📡❌</span>
              <span style={{ fontWeight: 'bold', fontSize: '15px', color: '#fca5a5' }}>
                تنبيه أمان العمليات المالية
              </span>
            </div>
            <button
              onClick={() => setOfflineNotice(null)}
              style={{
                background: 'rgba(255,255,255,0.12)',
                border: 'none',
                color: '#cbd5e1',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>
          </div>
          <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.6', color: '#f1f5f9' }}>
            {offlineNotice}
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(0, 0, 0, 0.35)',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '11.5px',
            color: '#fde047'
          }}>
            <span>🔒 أمان المعاملات الذرية (Firebase Transactions)</span>
            <span style={{ color: !isOnline ? '#f87171' : '#4ade80', fontWeight: 'bold' }}>
              {!isOnline ? 'مفصول حالياً' : 'متصل'}
            </span>
          </div>
        </div>
      )}





      {/* ----------------- WEATHER ANNOUNCEMENT BANNER ----------------- */}
      {weatherNotify && activeTab === 'harbor' && (
        <div style={{
          position: 'fixed',
          top: '125px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 105,
          background: 'linear-gradient(to bottom, #1c1917, #0c0a09)',
          border: '2px solid #eab308',
          borderRadius: '8px',
          padding: '10px 20px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.8), 0 0 10px rgba(234, 179, 8, 0.2)',
          color: '#fef08a',
          fontWeight: 'bold',
          fontSize: '12.5px',
          textAlign: 'center',
          animation: 'fade-in-slide-down 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          direction: 'rtl',
          fontFamily: '"Cairo", sans-serif',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}>
          {weatherNotify}
        </div>
      )}



      {portDestroyed && activeTab === 'harbor' && (
        <div style={{
          position: 'fixed',
          top: '75px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 40,
          background: 'rgba(28, 15, 10, 0.96)',
          border: '2px solid #ef4444',
          borderRadius: '16px',
          padding: '16px 20px',
          width: '92%',
          maxWidth: '460px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.9), 0 0 25px rgba(239, 68, 68, 0.5)',
          textAlign: 'center',
          fontFamily: '"Cairo", sans-serif',
          direction: 'rtl',
          animation: 'pulse 2s infinite'
        }}>
          <div style={{ fontSize: '18px', fontWeight: '900', color: '#fca5a5', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span>🚨</span>
            <span>تحذير عاجل: تم تدمير وإحراق مينائك بالكامل!</span>
            <span>🔥</span>
          </div>
          <div style={{ fontSize: '12px', color: '#fed7aa', marginBottom: '14px', lineHeight: '1.5' }}>
            لقد تعرض ميناؤك البحري لقصف ناري مدمّر؛ احترقت المنشآت وتفحمت سفن أسطولك بالكامل وغرقت في مياه الميناء. أعد إعمار الميناء وترميم هياكل السفن لتبحر مجدداً!
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button
              onClick={async () => {
                const REBUILD_COST_GEMS = 200;
                if (gems < REBUILD_COST_GEMS) {
                  alert(`❌ لا تملك جواهر كافية! تكلفة إعادة إعمار الميناء وترميم الأسطول هي ${REBUILD_COST_GEMS} 💎 جوهرة.\nرصيدك الحالي: ${gems.toLocaleString()} 💎`);
                  return;
                }

                const newGems = Math.max(0, gems - REBUILD_COST_GEMS);
                setGems(newGems);
                localStorage.setItem('gems', newGems.toString());

                setPortDestroyed(false);
                localStorage.setItem('pirate_port_destroyed', 'false');

                const restoredShips = ships.map(s => {
                  const maxH = s.maxHeart || (typeof s.level === 'number' ? (s.level * 1000) + 10000 : 10000);
                  return {
                    ...s,
                    heart: maxH,
                    status: 'docked' as const,
                    moving: false
                  };
                });
                setShips(restoredShips);
                localStorage.setItem('pirate_ships', JSON.stringify(restoredShips));

                // Cancel any pending auto-save to avoid race conditions
                if (saveTimeoutRef.current) {
                  clearTimeout(saveTimeoutRef.current);
                }

                // Synchronize lastDbData immediately
                if (lastDbData.current) {
                  lastDbData.current = {
                    ...lastDbData.current,
                    portDestroyed: false,
                    ships: restoredShips,
                    gems: newGems
                  };
                }

                // Explicit direct persistence to Firestore
                if (auth.currentUser) {
                  try {
                    const userDocRef = doc(db, 'users', auth.currentUser.uid);
                    await setDoc(userDocRef, {
                      portDestroyed: false,
                      ships: restoredShips,
                      gems: newGems,
                      updatedAt: new Date().toISOString()
                    }, { merge: true });
                  } catch (e) {
                    console.error("Error rebuilding port in Firestore:", e);
                  }
                }

                alert(`🎉 تم إعادة إعمار الميناء وصيانة كافة سفن الأسطول بنجاح! تم خصم ${REBUILD_COST_GEMS} 💎 جوهرة، وأسطولك جاهز للإبحار.`);
              }}
              style={{
                background: 'linear-gradient(to bottom, #22c55e, #15803d)',
                color: '#fff',
                border: '1.5px solid #86efac',
                borderRadius: '10px',
                padding: '10px 20px',
                fontWeight: '900',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)'
              }}
            >
              <span>🏗️</span>
              <span>إعادة إعمار الميناء وترميم الأسطول (💎 200 جوهرة)</span>
            </button>
          </div>
        </div>
      )}

      {/* Partial Ship Destruction Alert Banner (when port is intact but ships are destroyed/damaged) */}
      {!portDestroyed && ships.some(s => s.exists && typeof s.heart === 'number' && s.heart <= 0) && activeTab === 'harbor' && (
        <div style={{
          position: 'fixed',
          top: '75px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 40,
          background: 'rgba(28, 15, 10, 0.96)',
          border: '2px solid #f97316',
          borderRadius: '16px',
          padding: '12px 18px',
          width: '92%',
          maxWidth: '460px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.9), 0 0 20px rgba(249, 115, 22, 0.4)',
          textAlign: 'center',
          fontFamily: '"Cairo", sans-serif',
          direction: 'rtl',
          animation: 'pulse 2.2s infinite'
        }}>
          <div style={{ fontSize: '15px', fontWeight: '900', color: '#fed7aa', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span>⚠️</span>
            <span>تنبيه عاجل: تعرضت بعض سفنك للتدمير والاحتراق!</span>
            <span>🔥</span>
          </div>
          <div style={{ fontSize: '11.5px', color: '#cbd5e1', marginBottom: '10px', lineHeight: '1.5' }}>
            استهدفت نيران المعارك هيكل سفينتك حتى تفحم وعجز عن الإبحار والصيد. توجه لصيانتها وترميمها فوراً.
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button
              onClick={() => {
                const destroyedShip = ships.find(s => s.exists && typeof s.heart === 'number' && s.heart <= 0);
                if (destroyedShip) {
                  setRepairModalShip(destroyedShip);
                }
              }}
              style={{
                background: 'linear-gradient(to bottom, #16a34a, #15803d)',
                color: '#fff',
                border: '1.5px solid #86efac',
                borderRadius: '10px',
                padding: '8px 18px',
                fontWeight: '900',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 15px rgba(22, 163, 74, 0.4)'
              }}
            >
              <span>🔧</span>
              <span>فتح ورشة صيانة وترميم السفن</span>
            </button>
          </div>
        </div>
      )}

      {/* ----------------- BOTTOM NAV TABS ----------------- */}
      <div className="bottom-nav">
        {/* 1. قبيلة (Tribe) */}
        <div className={`nav-item nav-item-clan ${activeTab === 'tribes' ? 'active' : ''}`} onClick={() => setActiveTab('tribes')} title="قبيلة">
          <img 
            src="https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/clan.png" 
            alt="قبيلة" 
          />
        </div>

        {/* 2. ترتيب (Leaderboard) */}
        <div className={`nav-item nav-item-rank ${activeTab === 'leaderboard' ? 'active' : ''}`} onClick={() => setActiveTab('leaderboard')} title="ترتيب">
          <img 
            src="https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/rank.png" 
            alt="ترتيب" 
          />
        </div>

        {/* 3. أصدقاء (Friends) */}
        <div className={`nav-item nav-item-friends ${activeTab === 'friends' ? 'active' : ''}`} onClick={() => setActiveTab('friends')} title="أصدقاء">
          <img 
            src="https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/friends.png" 
            alt="أصدقاء" 
          />
        </div>

        {/* 4. مخزن (Storage / Inventory) */}
        <div className={`nav-item nav-item-storage ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')} title="مخزن">
          <img 
            src="https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/storage.png" 
            alt="مخزن" 
          />
        </div>

        {/* 5. متجر (Shop) */}
        <div className={`nav-item nav-item-shop ${activeTab === 'shop' ? 'active' : ''}`} onClick={() => setActiveTab('shop')} title="متجر">
          <img 
            src="https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/shop.png" 
            alt="متجر" 
          />
        </div>

        {/* 6. شات (Chat) */}
        <div className={`nav-item nav-item-chat ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')} title="شات">
          <img 
            src="https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/chat.png" 
            alt="شات" 
          />
        </div>

        {/* 7. إعدادات (Settings) */}
        <div className={`nav-item nav-item-settings ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')} title="إعدادات">
          <img 
            src="https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/settings.png" 
            alt="إعدادات" 
          />
        </div>
      </div>

      {/* ----------------- CHOOSE SHIP TO UPGRADE MODAL (3-SHIP LIMIT) ----------------- */}
      {upgradeTargetSpec && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Cairo, sans-serif'
        }} dir="rtl">
          <div style={{
            background: '#1c120c',
            border: '3px solid #ca8a04',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
            textAlign: 'center',
            color: '#cbd5e1'
          }}>
            <h3 style={{ color: '#facc15', margin: '0 0 10px 0', fontSize: '20px', fontWeight: '900' }}>
              ⚓ ترقية أسطول السفن (أقصى حد: 3 سفن)
            </h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px', lineHeight: '1.6' }}>
              لقد اخترت شراء/ترقية سفينة إلى <strong style={{ color: '#fff' }}>{upgradeTargetSpec.name} (ليفل {upgradeTargetSpec.level})</strong>.
              <br />
              الرجاء تحديد إحدى سفنك الثلاث لتنزيل أو ترقية سفينتك فيها:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {ships.slice(0, 3).map((ship) => {
                const isAlreadyThisLevel = ship.exists && ship.level === upgradeTargetSpec.level;
                return (
                  <button
                    key={ship.id}
                    onClick={() => {
                      if (isAlreadyThisLevel) {
                        alert('⚠️ هذا القارب يمتلك نفس هذا المستوى بالفعل! يرجى اختيار إحدى سفنك الأخرى لتنزيل هذا المستوى عليها، حيث يمكنك امتلاك حتى 3 سفن بنفس المستوى.');
                        return;
                      }
                      confirmUpgradeShip(ship.id, upgradeTargetSpec);
                    }}
                    style={{
                      background: isAlreadyThisLevel 
                        ? 'rgba(30, 41, 59, 0.6)'
                        : ship.exists 
                          ? 'linear-gradient(to bottom, #2b1a0a, #140c06)'
                          : 'linear-gradient(to bottom, #1e1b4b, #0f172a)',
                      border: isAlreadyThisLevel 
                        ? '1.5px solid #475569'
                        : ship.exists ? '2px solid #ca8a04' : '2px dashed #3b82f6',
                      borderRadius: '12px',
                      padding: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: isAlreadyThisLevel ? 'not-allowed' : 'pointer',
                      opacity: isAlreadyThisLevel ? 0.75 : 1,
                      transition: 'all 0.2s',
                      textAlign: 'right',
                      width: '100%'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '24px' }}>{ship.exists ? (ship.imgEmoji || '⛵') : '➕'}</span>
                      <div>
                        <div style={{ color: isAlreadyThisLevel ? '#94a3b8' : ship.exists ? '#fff' : '#3b82f6', fontWeight: 'bold', fontSize: '14px' }}>
                          {ship.exists ? ship.name : 'مكان فارغ (سفينة مباعة)'}
                          {isAlreadyThisLevel && <span style={{ color: '#f59e0b', fontSize: '11px', marginRight: '6px' }}>(بهذا المستوى بالفعل ✔)</span>}
                        </div>
                        <div style={{ color: isAlreadyThisLevel ? '#eab308' : '#94a3b8', fontSize: '11px' }}>
                          {isAlreadyThisLevel 
                            ? `هذه السفينة في المستوى ${ship.level} بالفعل - اختر سفينة أخرى لامتلاك أكثر من سفينة بنفس المستوى`
                            : ship.exists ? `المستوى الحالي: ${ship.level} ➔ سيصبح: ${upgradeTargetSpec.level}` : 'انقر لشراء وتنزيل السفينة هنا'}
                        </div>
                      </div>
                    </div>
                    <div style={{
                      background: isAlreadyThisLevel ? '#334155' : ship.exists ? '#16a34a' : '#2563eb',
                      color: isAlreadyThisLevel ? '#94a3b8' : '#fff',
                      borderRadius: '8px',
                      padding: '4px 12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      boxShadow: isAlreadyThisLevel ? 'none' : ship.exists ? '0 2px 4px rgba(22, 163, 74, 0.3)' : '0 2px 4px rgba(37, 99, 235, 0.3)'
                    }}>
                      {isAlreadyThisLevel ? 'مملوك بالفعل ✔' : ship.exists ? 'ترقية هذه السفينة ⚡' : 'شراء وتنزيل هنا ➕'}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setUpgradeTargetSpec(null)}
              style={{
                background: '#475569',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 20px',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              إلغاء العملية
            </button>
          </div>
        </div>
      )}

      {/* Global In-Game Real-time Event Notification / Toast Banner */}
      <InGameNotificationBanner
        notification={currentNotification}
        onDismiss={handleDismissNotification}
        isSoundEnabled={!isSfxMuted && !isMuted}
        onToggleSound={handleToggleNotifSound}
      />
    </div>
  );
}
