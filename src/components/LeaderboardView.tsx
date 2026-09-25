import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  Anchor, 
  Swords, 
  Search, 
  Flame, 
  Coins, 
  Gem, 
  Users, 
  Scroll, 
  Ship, 
  Fish, 
  X, 
  Share2, 
  Check, 
  Shield, 
  Sparkles,
  Wifi,
  BatteryCharging,
  Compass
} from 'lucide-react';

interface LeaderboardViewProps {
  realPlayers: any[];
  currentUser: any;
  currentGold?: number;
  currentGems?: number;
  leaderboardFilter: string;
  setLeaderboardFilter: (filter: any) => void;
  leaderboardSearchQuery: string;
  setLeaderboardSearchQuery: (query: string) => void;
  handleOpenProfile: (player: any) => void;
  handleCopyGameLink: () => void;
  setActiveTab: (tab: any) => void;
  onOpenAttacksList?: () => void;
}

// Sample benchmark deep-sea champions to ensure 10 full ranks match the reference screenshot
const BENCHMARK_CHAMPIONS = [
  {
    id: 'legend-1',
    userId: 'legend-1',
    username: 'ملك الأعماق',
    clan: 'أساطير الأعماق',
    country: '🇸🇦',
    power: 12458763,
    avatar: '👑',
    avatarImg: 'poseidon',
    fish: 48500,
    gold: 8500000,
    gems: 3200,
    exp: 285000
  },
  {
    id: 'legend-2',
    userId: 'legend-2',
    username: 'المحيط الأزرق',
    clan: 'أساطير',
    country: '🇸🇦',
    power: 10286421,
    avatar: '🦈',
    avatarImg: 'shark',
    fish: 41200,
    gold: 7100000,
    gems: 2600,
    exp: 240000
  },
  {
    id: 'legend-3',
    userId: 'legend-3',
    username: 'صائد العناد',
    clan: 'الموج الأزرق',
    country: '🇸🇦',
    power: 8954337,
    avatar: '🐉',
    avatarImg: 'dragon',
    fish: 35800,
    gold: 6200000,
    gems: 2100,
    exp: 210000
  },
  {
    id: 'legend-4',
    userId: 'legend-4',
    username: 'قاهر البحار',
    clan: 'المحيط',
    country: '🇸🇦',
    power: 7862110,
    avatar: '🔱',
    fish: 31000,
    gold: 5400000,
    gems: 1800,
    exp: 185000
  },
  {
    id: 'legend-5',
    userId: 'legend-5',
    username: 'زعيم',
    clan: 'الموج الأزرق',
    country: '🇸🇦',
    power: 6731554,
    avatar: '⚔️',
    fish: 27500,
    gold: 4700000,
    gems: 1500,
    exp: 160000
  },
  {
    id: 'legend-6',
    userId: 'legend-6',
    username: 'فارس الأعماق',
    clan: 'أسياد البحر',
    country: '🇸🇦',
    power: 5964223,
    avatar: '🛡️',
    fish: 24000,
    gold: 4100000,
    gems: 1300,
    exp: 140000
  },
  {
    id: 'legend-7',
    userId: 'legend-7',
    username: 'سيف البحر',
    clan: 'المحيط',
    country: '🇸🇦',
    power: 5247889,
    avatar: '⚡',
    fish: 21500,
    gold: 3600000,
    gems: 1100,
    exp: 125000
  },
  {
    id: 'legend-8',
    userId: 'legend-8',
    username: 'الشيخ',
    clan: 'النجوم',
    country: '🇸🇦',
    power: 4862301,
    avatar: '⚓',
    fish: 19800,
    gold: 3300000,
    gems: 950,
    exp: 110000
  },
  {
    id: 'legend-9',
    userId: 'legend-9',
    username: 'القرش الأبيض',
    clan: 'الموج الأزرق',
    country: '🇸🇦',
    power: 4376992,
    avatar: '🦈',
    fish: 17600,
    gold: 2950000,
    gems: 820,
    exp: 98000
  },
  {
    id: 'legend-10',
    userId: 'legend-10',
    username: 'المالك',
    clan: 'الأساطير',
    country: '🇸🇦',
    power: 3985776,
    avatar: '👑',
    fish: 16200,
    gold: 2700000,
    gems: 750,
    exp: 88000
  }
];

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  realPlayers,
  currentUser,
  currentGold = 56,
  currentGems = 12,
  leaderboardFilter,
  setLeaderboardFilter,
  leaderboardSearchQuery,
  setLeaderboardSearchQuery,
  handleOpenProfile,
  handleCopyGameLink,
  setActiveTab,
  onOpenAttacksList
}) => {
  const [copied, setCopied] = useState(false);
  const [currentTime, setCurrentTime] = useState('3:54 ص');
  const [selectedSubTab, setSelectedSubTab] = useState<'ranking' | 'clan'>('ranking');
  const [showBoomPopup, setShowBoomPopup] = useState(false);

  // Keep a live clock formatted in Arabic style
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const isPm = hours >= 12;
      hours = hours % 12 || 12;
      setCurrentTime(`${hours}:${minutes} ${isPm ? 'م' : 'ص'}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  // Compute power and properties for each player
  const calculatePlayerPower = (p: any, fallbackPower: number) => {
    if (typeof p.combatPower === 'number' && p.combatPower > 0) return p.combatPower;
    if (typeof p.power === 'number' && p.power > 0) return p.power;

    const shipsPower = Array.isArray(p.ships)
      ? p.ships.reduce((acc: number, s: any) => acc + (s.power || ((s.level || 1) * 350000)), 0)
      : 0;
    const goldPower = Math.floor((p.gold || 0) * 1.5);
    const gemPower = (p.gems || 0) * 200;
    const expPower = (p.exp || 0) * 100;
    const total = shipsPower + goldPower + gemPower + expPower;

    return total > 100000 ? total : fallbackPower;
  };

  // Build unified ranked list blending real Firestore players with benchmark champions
  const getRankedPlayers = () => {
    // 1. Convert real players
    const processedRealPlayers = realPlayers.map((p, idx) => {
      const totalFish = Object.values(p.fishInventory || {}).reduce(
        (sum: number, val: any) => sum + (typeof val === 'number' ? val : 0),
        0
      ) as number;
      const power = calculatePlayerPower(p, 5000000 - idx * 250000);
      return {
        ...p,
        id: p.id || p.userId || `rp-${idx}`,
        userId: p.userId || p.id,
        username: p.username || 'قبطان_الأعماق',
        clan: p.tribeName || 'أساطير الأعماق',
        country: '🇸🇦',
        power,
        avatar: p.avatar || '⚓',
        gold: p.gold || 0,
        gems: p.gems || 0,
        exp: p.exp || 0,
        totalFish,
        isRealUser: true
      };
    });

    // 2. Supplement with benchmark champions if real players are fewer than 10
    const combined: any[] = [...processedRealPlayers];
    const existingIds = new Set(processedRealPlayers.map(p => p.userId || p.id));
    const existingNames = new Set(processedRealPlayers.map(p => p.username.toLowerCase()));

    for (const champ of BENCHMARK_CHAMPIONS) {
      if (!existingIds.has(champ.userId) && !existingNames.has(champ.username.toLowerCase())) {
        combined.push({
          ...champ,
          totalFish: champ.fish,
          isRealUser: false
        });
      }
    }

    // 3. Apply search filter if active
    let filtered = combined;
    if (leaderboardFilter === 'search' && leaderboardSearchQuery.trim()) {
      const q = leaderboardSearchQuery.trim().toLowerCase();
      filtered = filtered.filter(p =>
        (p.username && p.username.toLowerCase().includes(q)) ||
        (p.clan && p.clan.toLowerCase().includes(q))
      );
    }

    // 4. Sort based on active criteria
    filtered.sort((a, b) => {
      if (leaderboardFilter === 'fish') {
        return (b.totalFish || 0) - (a.totalFish || 0) || (b.power || 0) - (a.power || 0);
      } else if (leaderboardFilter === 'gold') {
        return (b.gold || 0) - (a.gold || 0);
      } else if (leaderboardFilter === 'gems') {
        return (b.gems || 0) - (a.gems || 0);
      } else if (leaderboardFilter === 'xp') {
        return (b.exp || 0) - (a.exp || 0);
      } else {
        // Default: Sort by Combat Power
        return (b.power || 0) - (a.power || 0);
      }
    });

    return filtered;
  };

  const rankedList = getRankedPlayers();
  const top1 = rankedList[0];
  const top2 = rankedList[1];
  const top3 = rankedList[2];

  const handleCopy = () => {
    handleCopyGameLink();
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div 
      className="tab-overlay relative w-full min-h-screen text-slate-100 flex flex-col items-center select-none overflow-x-hidden font-sans"
      style={{
        backgroundImage: `
          radial-gradient(ellipse at center top, rgba(7, 34, 64, 0.78) 0%, rgba(3, 15, 30, 0.94) 85%, rgba(1, 6, 14, 0.98) 100%),
          url('/backgrounds/leaderboard_bg.jpg'),
          url('/settings_pirate_bg.jpg')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundAttachment: 'fixed',
        direction: 'rtl'
      }}
    >
      {/* Decorative Nautical Left & Right Rope and Lantern Borders */}
      <div className="absolute top-0 right-0 bottom-0 w-4 md:w-8 pointer-events-none z-10 opacity-70"
           style={{
             background: 'repeating-linear-gradient(180deg, #1e1308 0px, #3d2611 12px, #1e1308 24px)',
             borderLeft: '2px solid rgba(202, 138, 4, 0.4)',
             boxShadow: 'inset -2px 0 8px rgba(0,0,0,0.8)'
           }}>
        {/* Glowing Lantern Effect */}
        <div className="absolute top-28 right-1 w-5 h-8 bg-amber-500/20 rounded-full blur-md" />
        <div className="absolute top-96 right-1 w-5 h-8 bg-amber-500/20 rounded-full blur-md" />
      </div>

      <div className="absolute top-0 left-0 bottom-0 w-4 md:w-8 pointer-events-none z-10 opacity-70"
           style={{
             background: 'repeating-linear-gradient(180deg, #1e1308 0px, #3d2611 12px, #1e1308 24px)',
             borderRight: '2px solid rgba(202, 138, 4, 0.4)',
             boxShadow: 'inset 2px 0 8px rgba(0,0,0,0.8)'
           }}>
        <div className="absolute top-28 left-1 w-5 h-8 bg-amber-500/20 rounded-full blur-md" />
        <div className="absolute top-96 left-1 w-5 h-8 bg-amber-500/20 rounded-full blur-md" />
      </div>

      {/* Main Container - Mobile-first width matching standard game viewport */}
      <div className="w-full max-w-[520px] px-3 pt-2 pb-24 flex flex-col items-center relative z-20">

        {/* 1. TOP STATUS BAR (56 Gold | Gems | Wifi | Bluetooth | Battery 2.7v | Time) */}
        <div className="w-full flex items-center justify-between px-2 py-1 mb-2 text-xs font-bold text-sky-200 bg-slate-950/60 backdrop-blur-md rounded-lg border border-sky-900/40 shadow-inner">
          {/* Right side (RTL start): Coins & Diamonds */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-600/50">
              <span className="text-amber-400 text-sm">🪙</span>
              <span className="text-amber-300 font-extrabold">{currentGold.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1 bg-cyan-950/50 px-2 py-0.5 rounded-full border border-cyan-500/50">
              <span className="text-cyan-400 text-sm">💎</span>
              <span className="text-cyan-300 font-extrabold">{currentGems.toLocaleString()}</span>
            </div>
          </div>

          {/* Left side (RTL end): Signal, Bluetooth, Battery, Clock */}
          <div className="flex items-center gap-2 text-[11px] text-slate-300">
            <Wifi className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-blue-400 font-mono text-[10px]">ᛒ</span>
            <div className="flex items-center gap-0.5 text-emerald-400 font-mono">
              <BatteryCharging className="w-3.5 h-3.5" />
              <span>2.7v</span>
            </div>
            <span className="font-mono text-slate-200">{currentTime}</span>
          </div>
        </div>

        {/* 2. GRAND HEADER TITLE BANNER ("ملوك الأعماق - KINGS OF THE DEPTHS") */}
        <div className="relative w-full flex flex-col items-center mb-3">
          {/* Poseidon Sea King Artwork & Emblem */}
          <div className="relative w-full max-w-[420px] h-[110px] flex flex-col items-center justify-center rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-500/40"
               style={{
                 background: 'radial-gradient(circle at center, rgba(16, 68, 115, 0.9) 0%, rgba(6, 26, 48, 0.95) 75%, rgba(2, 10, 20, 0.99) 100%)',
                 boxShadow: '0 8px 30px rgba(0,0,0,0.9), 0 0 20px rgba(234, 179, 8, 0.25)'
               }}>
            
            {/* Background artwork texture */}
            <div 
              className="absolute inset-0 opacity-40 bg-cover bg-center pointer-events-none"
              style={{ backgroundImage: `url('/backgrounds/kings_depths_banner.jpg')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-cyan-950/40 pointer-events-none" />

            {/* Glowing Golden Trident & Crown Ornament */}
            <div className="relative flex items-center justify-center gap-2 mb-0.5">
              <span className="text-amber-400 text-lg drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]">🔱</span>
              <div className="relative">
                <Crown className="w-7 h-7 text-amber-400 filter drop-shadow-[0_0_10px_rgba(245,158,11,0.9)]" />
              </div>
              <span className="text-amber-400 text-lg drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]">🔱</span>
            </div>

            {/* Arabic Embossed 3D Title */}
            <h1 
              className="relative text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-300 to-amber-600 drop-shadow-[0_3px_5px_rgba(0,0,0,0.9)] tracking-wide"
              style={{
                textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 0 15px rgba(245,158,11,0.4)',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}
            >
              ملوك الأعماق
            </h1>

            {/* English Subtitle: KINGS OF THE DEPTHS */}
            <div className="relative flex items-center gap-2 text-[10px] md:text-[11px] font-bold tracking-widest text-amber-300/90 mt-0.5 uppercase">
              <Anchor className="w-3 h-3 text-amber-400" />
              <span>✦ KINGS OF THE DEPTHS ✦</span>
              <Anchor className="w-3 h-3 text-amber-400" />
            </div>
          </div>
        </div>

        {/* 3. QUICK ACTION BUTTONS ROW (سوق السفن | السمك | البحث | الفعاليات | BOOM | الذهب | الجواهر) */}
        <div className="w-full flex items-center justify-between gap-1 px-1 mb-3 overflow-x-auto no-scrollbar py-1">
          
          {/* سوق السفن (Ship Market) */}
          <button
            onClick={() => setActiveTab('shop')}
            className="flex-1 min-w-[58px] h-[64px] flex flex-col items-center justify-center rounded-xl transition-all transform active:scale-95 shadow-md relative group border"
            style={{
              background: 'linear-gradient(180deg, #103b60 0%, #071f33 100%)',
              borderColor: 'rgba(56, 189, 248, 0.45)',
              boxShadow: '0 4px 10px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.2)'
            }}
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-sky-900/60 border border-sky-400/40 mb-0.5">
              <Ship className="w-5 h-5 text-sky-300 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[10px] font-bold text-sky-100 whitespace-nowrap">سوق السفن</span>
          </button>

          {/* السمك (Fish) */}
          <button
            onClick={() => setLeaderboardFilter('fish')}
            className={`flex-1 min-w-[58px] h-[64px] flex flex-col items-center justify-center rounded-xl transition-all transform active:scale-95 shadow-md relative group border ${
              leaderboardFilter === 'fish' ? 'ring-2 ring-cyan-400 scale-105' : ''
            }`}
            style={{
              background: leaderboardFilter === 'fish' 
                ? 'linear-gradient(180deg, #0e5a8a 0%, #07314d 100%)' 
                : 'linear-gradient(180deg, #103b60 0%, #071f33 100%)',
              borderColor: leaderboardFilter === 'fish' ? '#38bdf8' : 'rgba(56, 189, 248, 0.45)',
              boxShadow: '0 4px 10px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.2)'
            }}
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-cyan-900/60 border border-cyan-400/40 mb-0.5">
              <Fish className="w-5 h-5 text-cyan-300 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[10px] font-bold text-sky-100 whitespace-nowrap">السمك</span>
          </button>

          {/* البحث على لاعبين (Search Players) */}
          <button
            onClick={() => setLeaderboardFilter(leaderboardFilter === 'search' ? 'xp' : 'search')}
            className={`flex-1 min-w-[58px] h-[64px] flex flex-col items-center justify-center rounded-xl transition-all transform active:scale-95 shadow-md relative group border ${
              leaderboardFilter === 'search' ? 'ring-2 ring-cyan-400 scale-105' : ''
            }`}
            style={{
              background: leaderboardFilter === 'search' 
                ? 'linear-gradient(180deg, #0e5a8a 0%, #07314d 100%)' 
                : 'linear-gradient(180deg, #103b60 0%, #071f33 100%)',
              borderColor: leaderboardFilter === 'search' ? '#38bdf8' : 'rgba(56, 189, 248, 0.45)',
              boxShadow: '0 4px 10px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.2)'
            }}
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-900/60 border border-blue-400/40 mb-0.5">
              <Search className="w-4 h-4 text-blue-300 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[9.5px] font-bold text-sky-100 whitespace-nowrap">البحث</span>
          </button>

          {/* الفعاليات (Events) */}
          <button
            onClick={() => setLeaderboardFilter('events')}
            className={`flex-1 min-w-[58px] h-[64px] flex flex-col items-center justify-center rounded-xl transition-all transform active:scale-95 shadow-md relative group border ${
              leaderboardFilter === 'events' ? 'ring-2 ring-amber-400 scale-105' : ''
            }`}
            style={{
              background: leaderboardFilter === 'events' 
                ? 'linear-gradient(180deg, #5c3506 0%, #301b02 100%)' 
                : 'linear-gradient(180deg, #103b60 0%, #071f33 100%)',
              borderColor: leaderboardFilter === 'events' ? '#f59e0b' : 'rgba(56, 189, 248, 0.45)',
              boxShadow: '0 4px 10px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.2)'
            }}
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-amber-900/60 border border-amber-400/40 mb-0.5">
              <Scroll className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[10px] font-bold text-sky-100 whitespace-nowrap">الفعاليات</span>
          </button>

          {/* BOOM 💥 (Attacks & Explosions) */}
          <button
            onClick={() => {
              if (onOpenAttacksList) onOpenAttacksList();
              setShowBoomPopup(true);
            }}
            className="flex-1 min-w-[58px] h-[64px] flex flex-col items-center justify-center rounded-xl transition-all transform active:scale-95 shadow-md relative group border"
            style={{
              background: 'linear-gradient(180deg, #7f1d1d 0%, #450a0a 100%)',
              borderColor: '#ef4444',
              boxShadow: '0 4px 10px rgba(239, 68, 68, 0.3), inset 0 1px 1px rgba(255,255,255,0.2)'
            }}
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-900/60 border border-red-400/50 mb-0.5 animate-pulse">
              <Flame className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-[10px] font-black text-amber-300 whitespace-nowrap">💥 BOOM</span>
          </button>

          {/* الذهب (Gold Ranking) */}
          <button
            onClick={() => setLeaderboardFilter('gold')}
            className={`flex-1 min-w-[58px] h-[64px] flex flex-col items-center justify-center rounded-xl transition-all transform active:scale-95 shadow-md relative group border ${
              leaderboardFilter === 'gold' ? 'ring-2 ring-amber-400 scale-105' : ''
            }`}
            style={{
              background: leaderboardFilter === 'gold' 
                ? 'linear-gradient(180deg, #633c02 0%, #381f01 100%)' 
                : 'linear-gradient(180deg, #103b60 0%, #071f33 100%)',
              borderColor: leaderboardFilter === 'gold' ? '#eab308' : 'rgba(56, 189, 248, 0.45)',
              boxShadow: '0 4px 10px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.2)'
            }}
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-amber-950/60 border border-amber-400/50 mb-0.5">
              <Coins className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[10px] font-bold text-sky-100 whitespace-nowrap">الذهب</span>
          </button>

          {/* الجواهر (Gems Ranking) */}
          <button
            onClick={() => setLeaderboardFilter('gems')}
            className={`flex-1 min-w-[58px] h-[64px] flex flex-col items-center justify-center rounded-xl transition-all transform active:scale-95 shadow-md relative group border ${
              leaderboardFilter === 'gems' ? 'ring-2 ring-cyan-400 scale-105' : ''
            }`}
            style={{
              background: leaderboardFilter === 'gems' 
                ? 'linear-gradient(180deg, #0e5a8a 0%, #07314d 100%)' 
                : 'linear-gradient(180deg, #103b60 0%, #071f33 100%)',
              borderColor: leaderboardFilter === 'gems' ? '#06b6d4' : 'rgba(56, 189, 248, 0.45)',
              boxShadow: '0 4px 10px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.2)'
            }}
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-cyan-950/60 border border-cyan-400/50 mb-0.5">
              <Gem className="w-4 h-4 text-cyan-300 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[10px] font-bold text-sky-100 whitespace-nowrap">الجواهر</span>
          </button>
        </div>

        {/* 4. DUAL TAB SWITCHER (الترتيب 👑 vs القبيلة 👥) */}
        <div className="w-full flex items-center justify-center gap-2 mb-3 px-2">
          {/* الترتيب (Ranking Tab - Active) */}
          <button
            onClick={() => setSelectedSubTab('ranking')}
            className="flex-1 max-w-[200px] h-[44px] flex items-center justify-center gap-2 rounded-xl font-black text-sm transition-all shadow-lg border-2"
            style={{
              background: selectedSubTab === 'ranking' 
                ? 'linear-gradient(180deg, #164e7d 0%, #0a2742 100%)'
                : 'linear-gradient(180deg, #0d2338 0%, #05121f 100%)',
              borderColor: selectedSubTab === 'ranking' ? '#38bdf8' : '#1e3a5f',
              color: selectedSubTab === 'ranking' ? '#fef08a' : '#94a3b8',
              boxShadow: selectedSubTab === 'ranking' ? '0 0 14px rgba(56, 189, 248, 0.4)' : 'none'
            }}
          >
            <Crown className="w-5 h-5 text-amber-400" />
            <span>الترتيب</span>
          </button>

          {/* القبيلة (Clan Tab) */}
          <button
            onClick={() => {
              setSelectedSubTab('clan');
              setActiveTab('tribes');
            }}
            className="flex-1 max-w-[200px] h-[44px] flex items-center justify-center gap-2 rounded-xl font-black text-sm transition-all shadow-lg border-2"
            style={{
              background: selectedSubTab === 'clan' 
                ? 'linear-gradient(180deg, #164e7d 0%, #0a2742 100%)'
                : 'linear-gradient(180deg, #0d2338 0%, #05121f 100%)',
              borderColor: selectedSubTab === 'clan' ? '#38bdf8' : '#1e3a5f',
              color: selectedSubTab === 'clan' ? '#fef08a' : '#94a3b8',
              boxShadow: selectedSubTab === 'clan' ? '0 0 14px rgba(56, 189, 248, 0.4)' : 'none'
            }}
          >
            <Users className="w-5 h-5 text-sky-400" />
            <span>القبيلة</span>
          </button>
        </div>

        {/* 5. SECTION TITLE BANNER (⚓ ترتيب اللاعبين ⚓) */}
        <div className="w-full flex items-center justify-center gap-3 my-2">
          <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-amber-500/50 to-amber-500" />
          <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-slate-950/80 border border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
            <Anchor className="w-4 h-4 text-amber-400" />
            <h2 className="text-base md:text-lg font-black text-amber-300 tracking-wide">
              ترتيب اللاعبين
            </h2>
            <Anchor className="w-4 h-4 text-amber-400" />
          </div>
          <div className="h-0.5 flex-1 bg-gradient-to-l from-transparent via-amber-500/50 to-amber-500" />
        </div>

        {/* Search Input Box if Search is Selected */}
        {leaderboardFilter === 'search' && (
          <div className="w-full my-2 animate-fadeIn">
            <div className="relative flex items-center">
              <Search className="absolute right-3 w-5 h-5 text-cyan-400 pointer-events-none" />
              <input
                type="text"
                placeholder="اكتب اسم القبطان أو القبيلة للبحث..."
                value={leaderboardSearchQuery}
                onChange={(e) => setLeaderboardSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 bg-slate-900/90 border-2 border-cyan-500/60 rounded-xl text-white text-sm font-bold focus:outline-none focus:border-cyan-300 placeholder-slate-400 shadow-lg"
              />
              {leaderboardSearchQuery && (
                <button 
                  onClick={() => setLeaderboardSearchQuery('')}
                  className="absolute left-3 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* 6. TOP 3 PODIUM DISPLAY (منصة التتويج للثلاثة الأوائل) */}
        <div className="w-full flex items-end justify-center gap-2 md:gap-4 my-4 pt-4 px-1">
          
          {/* RANK #2 (Silver/Ice Blue - Left) */}
          {top2 && (
            <div 
              onClick={() => handleOpenProfile(top2)}
              className="flex-1 max-w-[130px] flex flex-col items-center cursor-pointer transition-transform hover:scale-105 active:scale-95 group"
            >
              {/* Ornate Silver/Ice Crest */}
              <div className="relative mb-2 flex flex-col items-center">
                {/* Rank #2 Badge on top of Crest */}
                <div className="relative z-10 w-9 h-9 rounded-full bg-gradient-to-b from-sky-400 to-slate-700 border-2 border-slate-200 flex items-center justify-center shadow-lg -mb-3">
                  <span className="text-white font-black text-sm">2</span>
                </div>

                {/* Jagged Silver Frame */}
                <div 
                  className="w-20 h-20 md:w-22 md:h-22 rounded-2xl flex items-center justify-center p-1 relative shadow-xl"
                  style={{
                    background: 'radial-gradient(circle, #1e3a5f 0%, #0a192b 100%)',
                    border: '3px solid #94a3b8',
                    boxShadow: '0 0 15px rgba(148, 163, 184, 0.4), inset 0 0 10px rgba(56, 189, 248, 0.3)'
                  }}
                >
                  {/* Avatar Icon */}
                  <div className="w-full h-full rounded-xl bg-slate-900/90 border border-sky-400/40 flex items-center justify-center text-3xl">
                    {top2.avatar || '🦈'}
                  </div>
                </div>

                {/* Hanging Anchor Ornament at bottom */}
                <div className="absolute -bottom-3 z-10">
                  <Anchor className="w-4 h-4 text-slate-300 filter drop-shadow" />
                </div>
              </div>

              {/* Player Name Badge */}
              <div className="w-full bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-400/60 rounded-lg py-1 px-2 text-center shadow-md mb-1">
                <span className="text-xs font-black text-slate-100 truncate block">
                  {top2.username}
                </span>
              </div>

              {/* Total Combat Power ⚔️ */}
              <div className="flex items-center gap-1 text-[11px] font-black text-sky-200">
                <Swords className="w-3.5 h-3.5 text-sky-400" />
                <span>{(top2.power || 10286421).toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* RANK #1 (Center - Majestic Gold Crown) */}
          {top1 && (
            <div 
              onClick={() => handleOpenProfile(top1)}
              className="flex-1 max-w-[150px] flex flex-col items-center cursor-pointer transition-transform hover:scale-105 active:scale-95 -mt-3 z-10 group"
            >
              {/* Ornate Gold Crown Crest */}
              <div className="relative mb-2 flex flex-col items-center">
                {/* Crown + Rank #1 Badge */}
                <Crown className="w-7 h-7 text-amber-400 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.9)] -mb-1 animate-bounce" />
                <div className="relative z-10 w-10 h-10 rounded-full bg-gradient-to-b from-amber-400 to-amber-700 border-2 border-amber-200 flex items-center justify-center shadow-xl -mb-3">
                  <span className="text-amber-950 font-black text-base">1</span>
                </div>

                {/* Grand Laurel Golden Frame */}
                <div 
                  className="w-24 h-24 md:w-26 md:h-26 rounded-2xl flex items-center justify-center p-1.5 relative shadow-2xl"
                  style={{
                    background: 'radial-gradient(circle, #3b2204 0%, #150a01 100%)',
                    border: '3.5px solid #facc15',
                    boxShadow: '0 0 20px rgba(250, 204, 21, 0.5), inset 0 0 12px rgba(250, 204, 21, 0.3)'
                  }}
                >
                  {/* Avatar Icon */}
                  <div className="w-full h-full rounded-xl bg-slate-950/90 border border-amber-400/50 flex items-center justify-center text-4xl">
                    {top1.avatar || '👑'}
                  </div>
                </div>

                {/* Hanging Golden Anchor Ornament at bottom */}
                <div className="absolute -bottom-3 z-10">
                  <Anchor className="w-5 h-5 text-amber-400 filter drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
                </div>
              </div>

              {/* Player Name Badge */}
              <div className="w-full bg-gradient-to-b from-amber-950/90 to-slate-950 border-2 border-amber-400/80 rounded-lg py-1 px-2 text-center shadow-lg mb-1">
                <span className="text-xs md:text-sm font-black text-amber-200 truncate block">
                  {top1.username}
                </span>
              </div>

              {/* Total Combat Power ⚔️ */}
              <div className="flex items-center gap-1 text-xs md:text-sm font-black text-amber-300">
                <Swords className="w-4 h-4 text-amber-400" />
                <span>{(top1.power || 12458763).toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* RANK #3 (Bronze/Ruby - Right) */}
          {top3 && (
            <div 
              onClick={() => handleOpenProfile(top3)}
              className="flex-1 max-w-[130px] flex flex-col items-center cursor-pointer transition-transform hover:scale-105 active:scale-95 group"
            >
              {/* Ornate Bronze/Ruby Crest */}
              <div className="relative mb-2 flex flex-col items-center">
                {/* Rank #3 Badge on top of Crest */}
                <div className="relative z-10 w-9 h-9 rounded-full bg-gradient-to-b from-amber-600 to-orange-950 border-2 border-amber-300 flex items-center justify-center shadow-lg -mb-3">
                  <span className="text-amber-100 font-black text-sm">3</span>
                </div>

                {/* Jagged Bronze Frame */}
                <div 
                  className="w-20 h-20 md:w-22 md:h-22 rounded-2xl flex items-center justify-center p-1 relative shadow-xl"
                  style={{
                    background: 'radial-gradient(circle, #3d1405 0%, #170701 100%)',
                    border: '3px solid #b45309',
                    boxShadow: '0 0 15px rgba(180, 83, 9, 0.4), inset 0 0 10px rgba(249, 115, 22, 0.3)'
                  }}
                >
                  {/* Avatar Icon */}
                  <div className="w-full h-full rounded-xl bg-slate-900/90 border border-amber-600/40 flex items-center justify-center text-3xl">
                    {top3.avatar || '🐉'}
                  </div>
                </div>

                {/* Hanging Anchor Ornament at bottom */}
                <div className="absolute -bottom-3 z-10">
                  <Anchor className="w-4 h-4 text-amber-600 filter drop-shadow" />
                </div>
              </div>

              {/* Player Name Badge */}
              <div className="w-full bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-600/60 rounded-lg py-1 px-2 text-center shadow-md mb-1">
                <span className="text-xs font-black text-amber-100 truncate block">
                  {top3.username}
                </span>
              </div>

              {/* Total Combat Power ⚔️ */}
              <div className="flex items-center gap-1 text-[11px] font-black text-amber-200">
                <Swords className="w-3.5 h-3.5 text-amber-500" />
                <span>{(top3.power || 8954337).toLocaleString()}</span>
              </div>
            </div>
          )}

        </div>

        {/* 7. LEADERBOARD TABLE (جدول الترتيب: الترتيب | اللاعب | القبيلة | الدولة | القوة الإجمالية) */}
        <div className="w-full flex flex-col rounded-xl overflow-hidden border border-sky-800/40 shadow-2xl backdrop-blur-md mb-4 bg-slate-950/75">
          
          {/* Table Header Row */}
          <div 
            className="w-full grid grid-cols-12 items-center px-3 py-2 text-xs font-black text-sky-200 border-b border-sky-800/50"
            style={{
              background: 'linear-gradient(90deg, #092542 0%, #06182a 100%)'
            }}
          >
            <div className="col-span-2 text-center">الترتيب</div>
            <div className="col-span-3 text-right">اللاعب</div>
            <div className="col-span-3 text-center">القبيلة</div>
            <div className="col-span-1 text-center">الدولة</div>
            <div className="col-span-3 text-left pl-1">القوة الإجمالية</div>
          </div>

          {/* Table Rows (Ranks 1 to 10+) */}
          <div className="w-full flex flex-col divide-y divide-sky-900/30 max-h-[380px] overflow-y-auto no-scrollbar">
            {rankedList.slice(0, 20).map((player, index) => {
              const rank = index + 1;
              const isCurrentUser = currentUser?.uid && (player.userId === currentUser.uid || player.id === currentUser.uid);

              return (
                <div
                  key={player.id || index}
                  onClick={() => handleOpenProfile(player)}
                  className={`w-full grid grid-cols-12 items-center px-3 py-2 text-xs font-bold transition-all cursor-pointer hover:bg-sky-950/40 active:scale-[0.99] ${
                    isCurrentUser ? 'bg-amber-950/30 border-r-4 border-amber-400' : ''
                  }`}
                  style={{
                    background: index % 2 === 0 ? 'rgba(5, 20, 36, 0.6)' : 'rgba(3, 13, 24, 0.75)'
                  }}
                >
                  {/* Rank Column: Badge + Mini Avatar */}
                  <div className="col-span-2 flex items-center justify-center gap-1">
                    {/* Rank Badge with Laurel wreath aesthetic */}
                    <div 
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shadow-sm ${
                        rank === 1 ? 'bg-amber-400 text-amber-950 border border-amber-200' :
                        rank === 2 ? 'bg-slate-300 text-slate-900 border border-white' :
                        rank === 3 ? 'bg-amber-700 text-amber-100 border border-amber-400' :
                        'bg-slate-800 text-sky-200 border border-slate-700'
                      }`}
                    >
                      {rank}
                    </div>

                    {/* Small Player Avatar Icon */}
                    <div className="w-6 h-6 rounded-full bg-slate-900/80 border border-sky-600/40 flex items-center justify-center text-xs">
                      {player.avatar || '⚓'}
                    </div>
                  </div>

                  {/* Player Column: Name */}
                  <div className="col-span-3 text-right truncate pr-1">
                    <span className={`text-xs font-extrabold ${isCurrentUser ? 'text-amber-300' : 'text-slate-100'}`}>
                      {player.username}
                    </span>
                    {isCurrentUser && <span className="mr-1 text-[9px] text-amber-400 font-bold">(أنت)</span>}
                  </div>

                  {/* Clan Column: Clan name badge */}
                  <div className="col-span-3 text-center truncate px-1">
                    <span className="text-[10px] text-sky-300 bg-sky-950/70 border border-sky-800/50 px-1.5 py-0.5 rounded">
                      {player.clan || 'أساطير الأعماق'}
                    </span>
                  </div>

                  {/* Country Column: Flag 🇸🇦 */}
                  <div className="col-span-1 text-center text-sm">
                    {player.country || '🇸🇦'}
                  </div>

                  {/* Total Power Column: ⚔️ Value */}
                  <div className="col-span-3 text-left pl-1 flex items-center justify-start gap-1">
                    <Swords className="w-3 h-3 text-amber-400 flex-shrink-0" />
                    <span className="text-[11px] font-black text-amber-200 tracking-tight">
                      {(player.power || 3985776).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Table Footer: Update Notice ⚓ يتم تحديث الترتيب كل 5 دقائق ⚓ */}
          <div 
            className="w-full flex items-center justify-center gap-2 py-2 text-[11px] font-bold text-amber-300/90 border-t border-sky-800/50"
            style={{
              background: 'linear-gradient(90deg, #06182a 0%, #092542 50%, #06182a 100%)'
            }}
          >
            <Anchor className="w-3.5 h-3.5 text-amber-400" />
            <span>يتم تحديث الترتيب كل 5 دقائق</span>
            <Anchor className="w-3.5 h-3.5 text-amber-400" />
          </div>
        </div>

        {/* 8. SHARE & MULTIPLAYER BANNER & CLOSE BUTTON */}
        <div className="w-full flex items-center justify-between gap-2 px-1 mb-2">
          {/* Share Game Link button */}
          <button
            onClick={handleCopy}
            className="flex-1 py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-lg border transition-all active:scale-95"
            style={{
              background: copied 
                ? 'linear-gradient(180deg, #16a34a 0%, #15803d 100%)' 
                : 'linear-gradient(180deg, #ca8a04 0%, #854d0e 100%)',
              borderColor: '#fef08a',
              color: '#000'
            }}
          >
            {copied ? <Check className="w-4 h-4 text-white" /> : <Share2 className="w-4 h-4" />}
            <span>{copied ? 'تم نسخ الرابط بنجاح!' : 'مشاركة ودعوة الأصدقاء'}</span>
          </button>

          {/* Close / Return to Harbor button */}
          <button
            onClick={() => setActiveTab('harbor')}
            className="py-2.5 px-6 rounded-xl font-black text-xs shadow-lg border transition-all active:scale-95"
            style={{
              background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
              borderColor: '#64748b',
              color: '#f1f5f9'
            }}
          >
            إغلاق
          </button>
        </div>

      </div>

      {/* BOOM Popup Modal (Last 5 Attacks / Weapons Quick Access) */}
      {showBoomPopup && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowBoomPopup(false)}
        >
          <div 
            className="w-full max-w-sm rounded-2xl p-5 border-2 border-red-500/70 shadow-2xl relative"
            style={{
              background: 'linear-gradient(180deg, #1a0808 0%, #0d0404 100%)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 border-b border-red-900/50 pb-2">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-500 animate-pulse" />
                <h3 className="text-base font-black text-red-400">سجل هجمات BOOM التكتيكية</h3>
              </div>
              <button 
                onClick={() => setShowBoomPopup(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800/40 text-slate-200">
                <div className="flex justify-between font-bold text-red-300 mb-1">
                  <span>💥 قصف نووي استراتيجي</span>
                  <span className="text-[10px] text-slate-400">منذ دقيقتين</span>
                </div>
                <div>تم توجيه ضربة ناجحة لأسطول القبطان المتصدر وإحداث أضرار بالغة!</div>
              </div>

              <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800/40 text-slate-200">
                <div className="flex justify-between font-bold text-amber-300 mb-1">
                  <span>🚀 صاروخ مضاد للسفن</span>
                  <span className="text-[10px] text-slate-400">منذ 8 دقائق</span>
                </div>
                <div>إطلاق صاروخ كاسح اخترق دروع العدو وحصد غنائم المعركة.</div>
              </div>

              <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800/40 text-slate-200">
                <div className="flex justify-between font-bold text-cyan-300 mb-1">
                  <span>⚓ غارة أساطيل الأعماق</span>
                  <span className="text-[10px] text-slate-400">منذ 15 دقيقة</span>
                </div>
                <div>تحالف المحيط الأزرق استولى على شحنة ذهب ضخمة.</div>
              </div>
            </div>

            <button
              onClick={() => setShowBoomPopup(false)}
              className="w-full mt-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
            >
              إغلاق السجل
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
