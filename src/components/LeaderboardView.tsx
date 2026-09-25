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
  Wifi,
  BatteryCharging
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
  setActiveTab: (tab: any) => void;
  onOpenAttacksList?: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  realPlayers,
  currentUser,
  currentGold = 0,
  currentGems = 0,
  leaderboardFilter,
  setLeaderboardFilter,
  leaderboardSearchQuery,
  setLeaderboardSearchQuery,
  handleOpenProfile,
  setActiveTab,
  onOpenAttacksList
}) => {
  const [currentTime, setCurrentTime] = useState('12:00 م');
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

  // Compute power and properties for each player based purely on authentic user stats
  const calculatePlayerPower = (p: any) => {
    if (typeof p.combatPower === 'number' && p.combatPower > 0) return p.combatPower;
    if (typeof p.power === 'number' && p.power > 0) return p.power;

    const shipsPower = Array.isArray(p.ships)
      ? p.ships.reduce((acc: number, s: any) => acc + (s.power || ((s.level || 1) * 350000)), 0)
      : 0;
    const goldPower = Math.floor((p.gold || 0) * 1.5);
    const gemPower = (p.gems || 0) * 200;
    const expPower = (p.exp || 0) * 100;
    const total = shipsPower + goldPower + gemPower + expPower;

    return total;
  };

  // Build unified ranked list strictly using real Firestore players with ZERO dummy or test names
  const getRankedPlayers = () => {
    const processedRealPlayers = realPlayers.map((p, idx) => {
      const totalFish = Object.values(p.fishInventory || {}).reduce(
        (sum: number, val: any) => sum + (typeof val === 'number' ? val : 0),
        0
      ) as number;
      const power = calculatePlayerPower(p);
      
      // Determine authentic username: Never use fake names like 'قبطان_الأعماق' or 'قبطان_البحار'
      const rawName = (p.username || '').trim();
      const isPlaceholder = rawName === 'قبطان_الأعماق' || rawName === 'قبطان_البحار' || rawName === 'قبطان_مجهول';
      let cleanUsername = !isPlaceholder && rawName !== '' ? rawName : '';
      if (!cleanUsername) {
        if (p.email) {
          cleanUsername = p.email.split('@')[0];
        } else if (p.userId) {
          cleanUsername = `لاعب_${p.userId.slice(0, 4)}`;
        } else {
          cleanUsername = `قبطان_${idx + 1}`;
        }
      }

      // Determine clan: If player has no tribe, show '-' instead of fake clan name
      const rawClan = (p.tribeName || '').trim();
      const isFakeClan = rawClan === 'أساطير الأعماق';
      const cleanClan = !isFakeClan && rawClan !== '' ? rawClan : '-';

      return {
        ...p,
        id: p.id || p.userId || `rp-${idx}`,
        userId: p.userId || p.id,
        username: cleanUsername,
        clan: cleanClan,
        country: p.country || '🇸🇦',
        power,
        avatar: p.avatar || '⚓',
        gold: typeof p.gold === 'number' ? p.gold : 0,
        gems: typeof p.gems === 'number' ? p.gems : 0,
        exp: typeof p.exp === 'number' ? p.exp : 0,
        totalFish,
        isRealUser: true
      };
    });

    let filtered = processedRealPlayers;

    // Apply search filter if active
    if (leaderboardFilter === 'search' && leaderboardSearchQuery.trim()) {
      const q = leaderboardSearchQuery.trim().toLowerCase();
      filtered = filtered.filter(p =>
        (p.username && p.username.toLowerCase().includes(q)) ||
        (p.clan && p.clan !== '-' && p.clan.toLowerCase().includes(q))
      );
    }

    // Sort based on active criteria
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
      {/* Decorative Nautical Left & Right Rope Borders */}
      <div className="absolute top-0 right-0 bottom-0 w-6 md:w-10 pointer-events-none z-10 opacity-70"
           style={{
             background: 'repeating-linear-gradient(180deg, #1e1308 0px, #3d2611 16px, #1e1308 32px)',
             borderLeft: '2.5px solid rgba(202, 138, 4, 0.5)',
             boxShadow: 'inset -2px 0 10px rgba(0,0,0,0.85)'
           }}>
        <div className="absolute top-28 right-1 w-6 h-10 bg-amber-500/25 rounded-full blur-md" />
        <div className="absolute top-96 right-1 w-6 h-10 bg-amber-500/25 rounded-full blur-md" />
      </div>

      <div className="absolute top-0 left-0 bottom-0 w-6 md:w-10 pointer-events-none z-10 opacity-70"
           style={{
             background: 'repeating-linear-gradient(180deg, #1e1308 0px, #3d2611 16px, #1e1308 32px)',
             borderRight: '2.5px solid rgba(202, 138, 4, 0.5)',
             boxShadow: 'inset 2px 0 10px rgba(0,0,0,0.85)'
           }}>
        <div className="absolute top-28 left-1 w-6 h-10 bg-amber-500/25 rounded-full blur-md" />
        <div className="absolute top-96 left-1 w-6 h-10 bg-amber-500/25 rounded-full blur-md" />
      </div>

      {/* Main Container - 40% Enlarged Typography & Icon Support */}
      <div className="w-full max-w-[760px] px-4 pt-3 pb-32 flex flex-col items-center relative z-20">

        {/* 1. TOP STATUS BAR (+40% text & icons) */}
        <div className="w-full flex items-center justify-between px-4 py-2.5 mb-3 text-base md:text-lg font-black text-sky-200 bg-slate-950/75 backdrop-blur-md rounded-2xl border-2 border-sky-900/60 shadow-xl">
          {/* Right side (RTL start): Coins & Diamonds */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-amber-950/60 px-3 py-1 rounded-xl border border-amber-500/60">
              <span className="text-xl">🪙</span>
              <span className="text-amber-300 font-black">{currentGold.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 bg-cyan-950/60 px-3 py-1 rounded-xl border border-cyan-500/60">
              <span className="text-xl">💎</span>
              <span className="text-cyan-300 font-black">{currentGems.toLocaleString()}</span>
            </div>
          </div>

          {/* Left side (RTL end): Signal, Bluetooth, Battery, Clock */}
          <div className="flex items-center gap-3 text-sm md:text-base text-slate-300">
            <Wifi className="w-5 h-5 text-cyan-400" />
            <span className="text-blue-400 font-mono text-sm">ᛒ</span>
            <div className="flex items-center gap-1 text-emerald-400 font-mono">
              <BatteryCharging className="w-5 h-5" />
              <span>2.7v</span>
            </div>
            <span className="font-mono text-slate-200 font-bold">{currentTime}</span>
          </div>
        </div>

        {/* 2. GRAND HEADER TITLE BANNER (+40% enlarged) */}
        <div className="relative w-full flex flex-col items-center mb-4">
          <div className="relative w-full max-w-[580px] h-[140px] flex flex-col items-center justify-center rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-500/50"
               style={{
                 background: 'radial-gradient(circle at center, rgba(16, 68, 115, 0.92) 0%, rgba(6, 26, 48, 0.96) 75%, rgba(2, 10, 20, 0.99) 100%)',
                 boxShadow: '0 10px 35px rgba(0,0,0,0.95), 0 0 25px rgba(234, 179, 8, 0.35)'
               }}>
            
            <div 
              className="absolute inset-0 opacity-40 bg-cover bg-center pointer-events-none"
              style={{ backgroundImage: `url('/backgrounds/kings_depths_banner.jpg')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-cyan-950/40 pointer-events-none" />

            {/* Glowing Golden Trident & Crown Ornament */}
            <div className="relative flex items-center justify-center gap-3 mb-1">
              <span className="text-amber-400 text-2xl drop-shadow-[0_0_10px_rgba(250,204,21,0.9)]">🔱</span>
              <div className="relative">
                <Crown className="w-10 h-10 text-amber-400 filter drop-shadow-[0_0_14px_rgba(245,158,11,0.95)]" />
              </div>
              <span className="text-amber-400 text-2xl drop-shadow-[0_0_10px_rgba(250,204,21,0.9)]">🔱</span>
            </div>

            {/* Arabic Embossed 3D Title (+40% larger) */}
            <h1 
              className="relative text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-300 to-amber-600 drop-shadow-[0_4px_6px_rgba(0,0,0,0.95)] tracking-wide"
              style={{
                textShadow: '0 3px 6px rgba(0,0,0,0.95), 0 0 20px rgba(245,158,11,0.5)',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}
            >
              ملوك الأعماق
            </h1>

            {/* English Subtitle */}
            <div className="relative flex items-center gap-2 text-xs md:text-sm font-black tracking-widest text-amber-300/90 mt-1 uppercase">
              <Anchor className="w-4.5 h-4.5 text-amber-400" />
              <span>✦ KINGS OF THE DEPTHS ✦</span>
              <Anchor className="w-4.5 h-4.5 text-amber-400" />
            </div>
          </div>
        </div>

        {/* 3. QUICK ACTION BUTTONS ROW (+40% enlarged texts & icons) */}
        <div className="w-full flex items-center justify-between gap-2 px-1 mb-4 overflow-x-auto no-scrollbar py-1">
          
          {/* سوق السفن */}
          <button
            onClick={() => setActiveTab('shop')}
            className="flex-1 min-w-[76px] h-[86px] flex flex-col items-center justify-center rounded-2xl transition-all transform active:scale-95 shadow-lg relative group border-2"
            style={{
              background: 'linear-gradient(180deg, #103b60 0%, #071f33 100%)',
              borderColor: 'rgba(56, 189, 248, 0.55)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.25)'
            }}
          >
            <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-sky-900/70 border border-sky-400/50 mb-1">
              <Ship className="w-7 h-7 text-sky-300 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-xs md:text-sm font-black text-sky-100 whitespace-nowrap">سوق السفن</span>
          </button>

          {/* السمك */}
          <button
            onClick={() => setLeaderboardFilter('fish')}
            className={`flex-1 min-w-[76px] h-[86px] flex flex-col items-center justify-center rounded-2xl transition-all transform active:scale-95 shadow-lg relative group border-2 ${
              leaderboardFilter === 'fish' ? 'ring-2 ring-cyan-400 scale-105' : ''
            }`}
            style={{
              background: leaderboardFilter === 'fish' 
                ? 'linear-gradient(180deg, #0e5a8a 0%, #07314d 100%)' 
                : 'linear-gradient(180deg, #103b60 0%, #071f33 100%)',
              borderColor: leaderboardFilter === 'fish' ? '#38bdf8' : 'rgba(56, 189, 248, 0.55)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.25)'
            }}
          >
            <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-cyan-900/70 border border-cyan-400/50 mb-1">
              <Fish className="w-7 h-7 text-cyan-300 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-xs md:text-sm font-black text-sky-100 whitespace-nowrap">السمك</span>
          </button>

          {/* البحث */}
          <button
            onClick={() => setLeaderboardFilter(leaderboardFilter === 'search' ? 'xp' : 'search')}
            className={`flex-1 min-w-[76px] h-[86px] flex flex-col items-center justify-center rounded-2xl transition-all transform active:scale-95 shadow-lg relative group border-2 ${
              leaderboardFilter === 'search' ? 'ring-2 ring-cyan-400 scale-105' : ''
            }`}
            style={{
              background: leaderboardFilter === 'search' 
                ? 'linear-gradient(180deg, #0e5a8a 0%, #07314d 100%)' 
                : 'linear-gradient(180deg, #103b60 0%, #071f33 100%)',
              borderColor: leaderboardFilter === 'search' ? '#38bdf8' : 'rgba(56, 189, 248, 0.55)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.25)'
            }}
          >
            <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-blue-900/70 border border-blue-400/50 mb-1">
              <Search className="w-6 h-6 text-blue-300 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-xs md:text-sm font-black text-sky-100 whitespace-nowrap">البحث</span>
          </button>

          {/* الفعاليات */}
          <button
            onClick={() => setLeaderboardFilter('events')}
            className={`flex-1 min-w-[76px] h-[86px] flex flex-col items-center justify-center rounded-2xl transition-all transform active:scale-95 shadow-lg relative group border-2 ${
              leaderboardFilter === 'events' ? 'ring-2 ring-amber-400 scale-105' : ''
            }`}
            style={{
              background: leaderboardFilter === 'events' 
                ? 'linear-gradient(180deg, #5c3506 0%, #301b02 100%)' 
                : 'linear-gradient(180deg, #103b60 0%, #071f33 100%)',
              borderColor: leaderboardFilter === 'events' ? '#f59e0b' : 'rgba(56, 189, 248, 0.55)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.25)'
            }}
          >
            <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-amber-900/70 border border-amber-400/50 mb-1">
              <Scroll className="w-6 h-6 text-amber-300 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-xs md:text-sm font-black text-sky-100 whitespace-nowrap">الفعاليات</span>
          </button>

          {/* BOOM 💥 */}
          <button
            onClick={() => {
              if (onOpenAttacksList) onOpenAttacksList();
              setShowBoomPopup(true);
            }}
            className="flex-1 min-w-[76px] h-[86px] flex flex-col items-center justify-center rounded-2xl transition-all transform active:scale-95 shadow-lg relative group border-2"
            style={{
              background: 'linear-gradient(180deg, #7f1d1d 0%, #450a0a 100%)',
              borderColor: '#ef4444',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4), inset 0 1px 2px rgba(255,255,255,0.25)'
            }}
          >
            <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-red-900/70 border border-red-400/60 mb-1 animate-pulse">
              <Flame className="w-7 h-7 text-amber-400" />
            </div>
            <span className="text-xs md:text-sm font-black text-amber-300 whitespace-nowrap">💥 BOOM</span>
          </button>

          {/* الذهب */}
          <button
            onClick={() => setLeaderboardFilter('gold')}
            className={`flex-1 min-w-[76px] h-[86px] flex flex-col items-center justify-center rounded-2xl transition-all transform active:scale-95 shadow-lg relative group border-2 ${
              leaderboardFilter === 'gold' ? 'ring-2 ring-amber-400 scale-105' : ''
            }`}
            style={{
              background: leaderboardFilter === 'gold' 
                ? 'linear-gradient(180deg, #633c02 0%, #381f01 100%)' 
                : 'linear-gradient(180deg, #103b60 0%, #071f33 100%)',
              borderColor: leaderboardFilter === 'gold' ? '#eab308' : 'rgba(56, 189, 248, 0.55)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.25)'
            }}
          >
            <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-amber-950/70 border border-amber-400/60 mb-1">
              <Coins className="w-6 h-6 text-amber-300 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-xs md:text-sm font-black text-sky-100 whitespace-nowrap">الذهب</span>
          </button>

          {/* الجواهر */}
          <button
            onClick={() => setLeaderboardFilter('gems')}
            className={`flex-1 min-w-[76px] h-[86px] flex flex-col items-center justify-center rounded-2xl transition-all transform active:scale-95 shadow-lg relative group border-2 ${
              leaderboardFilter === 'gems' ? 'ring-2 ring-cyan-400 scale-105' : ''
            }`}
            style={{
              background: leaderboardFilter === 'gems' 
                ? 'linear-gradient(180deg, #0e5a8a 0%, #07314d 100%)' 
                : 'linear-gradient(180deg, #103b60 0%, #071f33 100%)',
              borderColor: leaderboardFilter === 'gems' ? '#06b6d4' : 'rgba(56, 189, 248, 0.55)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.25)'
            }}
          >
            <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-cyan-950/70 border border-cyan-400/60 mb-1">
              <Gem className="w-6 h-6 text-cyan-300 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-xs md:text-sm font-black text-sky-100 whitespace-nowrap">الجواهر</span>
          </button>
        </div>

        {/* 4. DUAL TAB SWITCHER (الترتيب vs القبيلة) (+40% enlarged) */}
        <div className="w-full flex items-center justify-center gap-4 mb-4 px-2">
          {/* الترتيب */}
          <button
            onClick={() => setSelectedSubTab('ranking')}
            className="flex-1 max-w-[260px] h-[58px] flex items-center justify-center gap-3 rounded-2xl font-black text-base md:text-lg transition-all shadow-xl border-2"
            style={{
              background: selectedSubTab === 'ranking' 
                ? 'linear-gradient(180deg, #164e7d 0%, #0a2742 100%)'
                : 'linear-gradient(180deg, #0d2338 0%, #05121f 100%)',
              borderColor: selectedSubTab === 'ranking' ? '#38bdf8' : '#1e3a5f',
              color: selectedSubTab === 'ranking' ? '#fef08a' : '#94a3b8',
              boxShadow: selectedSubTab === 'ranking' ? '0 0 18px rgba(56, 189, 248, 0.5)' : 'none'
            }}
          >
            <Crown className="w-7 h-7 text-amber-400" />
            <span>الترتيب</span>
          </button>

          {/* القبيلة */}
          <button
            onClick={() => {
              setSelectedSubTab('clan');
              setActiveTab('tribes');
            }}
            className="flex-1 max-w-[260px] h-[58px] flex items-center justify-center gap-3 rounded-2xl font-black text-base md:text-lg transition-all shadow-xl border-2"
            style={{
              background: selectedSubTab === 'clan' 
                ? 'linear-gradient(180deg, #164e7d 0%, #0a2742 100%)'
                : 'linear-gradient(180deg, #0d2338 0%, #05121f 100%)',
              borderColor: selectedSubTab === 'clan' ? '#38bdf8' : '#1e3a5f',
              color: selectedSubTab === 'clan' ? '#fef08a' : '#94a3b8',
              boxShadow: selectedSubTab === 'clan' ? '0 0 18px rgba(56, 189, 248, 0.5)' : 'none'
            }}
          >
            <Users className="w-7 h-7 text-sky-400" />
            <span>القبيلة</span>
          </button>
        </div>

        {/* 5. SECTION TITLE BANNER (⚓ ترتيب اللاعبين ⚓) */}
        <div className="w-full flex items-center justify-center gap-3 my-3">
          <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-amber-500/60 to-amber-500" />
          <div className="flex items-center gap-3 px-6 py-2 rounded-full bg-slate-950/85 border-2 border-amber-500/70 shadow-[0_0_16px_rgba(245,158,11,0.35)]">
            <Anchor className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl md:text-2xl font-black text-amber-300 tracking-wide">
              ترتيب اللاعبين
            </h2>
            <Anchor className="w-6 h-6 text-amber-400" />
          </div>
          <div className="h-0.5 flex-1 bg-gradient-to-l from-transparent via-amber-500/60 to-amber-500" />
        </div>

        {/* Search Input Box */}
        {leaderboardFilter === 'search' && (
          <div className="w-full my-3 animate-fadeIn">
            <div className="relative flex items-center">
              <Search className="absolute right-4 w-7 h-7 text-cyan-400 pointer-events-none" />
              <input
                type="text"
                placeholder="اكتب اسم القبطان أو القبيلة للبحث الحقيقي..."
                value={leaderboardSearchQuery}
                onChange={(e) => setLeaderboardSearchQuery(e.target.value)}
                className="w-full pr-14 pl-5 py-3.5 bg-slate-900/95 border-2 border-cyan-500/70 rounded-2xl text-white text-base md:text-lg font-bold focus:outline-none focus:border-cyan-300 placeholder-slate-400 shadow-xl"
              />
              {leaderboardSearchQuery && (
                <button 
                  onClick={() => setLeaderboardSearchQuery('')}
                  className="absolute left-4 text-slate-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* 6. TOP 3 PODIUM DISPLAY (Strictly real players, ZERO dummy or fake values) */}
        {rankedList.length > 0 ? (
          <div className="w-full flex items-end justify-center gap-3 md:gap-6 my-5 pt-6 px-1">
            
            {/* RANK #2 (Silver/Ice Blue - Left) */}
            {top2 && (
              <div 
                onClick={() => handleOpenProfile(top2)}
                className="flex-1 max-w-[170px] flex flex-col items-center cursor-pointer transition-transform hover:scale-105 active:scale-95 group"
              >
                <div className="relative mb-2 flex flex-col items-center">
                  <div className="relative z-10 w-12 h-12 rounded-full bg-gradient-to-b from-sky-400 to-slate-700 border-2 border-slate-200 flex items-center justify-center shadow-lg -mb-4">
                    <span className="text-white font-black text-lg">2</span>
                  </div>

                  <div 
                    className="w-26 h-26 md:w-30 md:h-30 rounded-2xl flex items-center justify-center p-1.5 relative shadow-xl"
                    style={{
                      background: 'radial-gradient(circle, #1e3a5f 0%, #0a192b 100%)',
                      border: '3.5px solid #94a3b8',
                      boxShadow: '0 0 18px rgba(148, 163, 184, 0.45), inset 0 0 12px rgba(56, 189, 248, 0.35)'
                    }}
                  >
                    <div className="w-full h-full rounded-xl bg-slate-900/90 border border-sky-400/40 flex items-center justify-center text-4xl md:text-5xl">
                      {top2.avatar || '🦈'}
                    </div>
                  </div>

                  <div className="absolute -bottom-3.5 z-10">
                    <Anchor className="w-6 h-6 text-slate-300 filter drop-shadow" />
                  </div>
                </div>

                <div className="w-full bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-400/70 rounded-xl py-1.5 px-2 text-center shadow-md mb-1.5">
                  <span className="text-sm md:text-base font-black text-slate-100 truncate block">
                    {top2.username}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-sm md:text-base font-black text-sky-200">
                  <Swords className="w-5 h-5 text-sky-400" />
                  <span>{(top2.power || 0).toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* RANK #1 (Center - Majestic Gold Crown) */}
            {top1 && (
              <div 
                onClick={() => handleOpenProfile(top1)}
                className="flex-1 max-w-[200px] flex flex-col items-center cursor-pointer transition-transform hover:scale-105 active:scale-95 -mt-5 z-10 group"
              >
                <div className="relative mb-2 flex flex-col items-center">
                  <Crown className="w-10 h-10 text-amber-400 filter drop-shadow-[0_0_12px_rgba(245,158,11,0.95)] -mb-1 animate-bounce" />
                  <div className="relative z-10 w-14 h-14 rounded-full bg-gradient-to-b from-amber-400 to-amber-700 border-2 border-amber-200 flex items-center justify-center shadow-2xl -mb-4">
                    <span className="text-amber-950 font-black text-xl">1</span>
                  </div>

                  <div 
                    className="w-32 h-32 md:w-36 md:h-36 rounded-2xl flex items-center justify-center p-2 relative shadow-2xl"
                    style={{
                      background: 'radial-gradient(circle, #3b2204 0%, #150a01 100%)',
                      border: '4px solid #facc15',
                      boxShadow: '0 0 25px rgba(250, 204, 21, 0.55), inset 0 0 14px rgba(250, 204, 21, 0.35)'
                    }}
                  >
                    <div className="w-full h-full rounded-xl bg-slate-950/90 border border-amber-400/60 flex items-center justify-center text-5xl md:text-6xl">
                      {top1.avatar || '👑'}
                    </div>
                  </div>

                  <div className="absolute -bottom-4 z-10">
                    <Anchor className="w-7 h-7 text-amber-400 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.85)]" />
                  </div>
                </div>

                <div className="w-full bg-gradient-to-b from-amber-950/95 to-slate-950 border-2 border-amber-400 rounded-xl py-1.5 px-2 text-center shadow-xl mb-1.5">
                  <span className="text-base md:text-lg font-black text-amber-200 truncate block">
                    {top1.username}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-base md:text-lg font-black text-amber-300">
                  <Swords className="w-6 h-6 text-amber-400" />
                  <span>{(top1.power || 0).toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* RANK #3 (Bronze/Ruby - Right) */}
            {top3 && (
              <div 
                onClick={() => handleOpenProfile(top3)}
                className="flex-1 max-w-[170px] flex flex-col items-center cursor-pointer transition-transform hover:scale-105 active:scale-95 group"
              >
                <div className="relative mb-2 flex flex-col items-center">
                  <div className="relative z-10 w-12 h-12 rounded-full bg-gradient-to-b from-amber-600 to-orange-950 border-2 border-amber-300 flex items-center justify-center shadow-lg -mb-4">
                    <span className="text-amber-100 font-black text-lg">3</span>
                  </div>

                  <div 
                    className="w-26 h-26 md:w-30 md:h-30 rounded-2xl flex items-center justify-center p-1.5 relative shadow-xl"
                    style={{
                      background: 'radial-gradient(circle, #3d1405 0%, #170701 100%)',
                      border: '3.5px solid #b45309',
                      boxShadow: '0 0 18px rgba(180, 83, 9, 0.45), inset 0 0 12px rgba(249, 115, 22, 0.35)'
                    }}
                  >
                    <div className="w-full h-full rounded-xl bg-slate-900/90 border border-amber-600/50 flex items-center justify-center text-4xl md:text-5xl">
                      {top3.avatar || '🐉'}
                    </div>
                  </div>

                  <div className="absolute -bottom-3.5 z-10">
                    <Anchor className="w-6 h-6 text-amber-600 filter drop-shadow" />
                  </div>
                </div>

                <div className="w-full bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-600/70 rounded-xl py-1.5 px-2 text-center shadow-md mb-1.5">
                  <span className="text-sm md:text-base font-black text-amber-100 truncate block">
                    {top3.username}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-sm md:text-base font-black text-amber-200">
                  <Swords className="w-5 h-5 text-amber-500" />
                  <span>{(top3.power || 0).toLocaleString()}</span>
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="w-full py-8 text-center bg-slate-950/70 border border-sky-900/50 rounded-2xl my-4 px-4 text-slate-300 font-bold text-base md:text-lg">
            لا توجد حسابات أو لاعبين مسجلين في هذا الترتيب حالياً. كن أول قبطان يعتلي الصدارة! ⚓
          </div>
        )}

        {/* 7. LEADERBOARD TABLE (+40% enlarged text & icons) */}
        <div className="w-full flex flex-col rounded-2xl overflow-hidden border-2 border-sky-800/60 shadow-2xl backdrop-blur-md mb-5 bg-slate-950/80">
          
          {/* Table Header Row */}
          <div 
            className="w-full grid grid-cols-12 items-center px-4 py-3 text-sm md:text-base font-black text-sky-200 border-b-2 border-sky-800/60"
            style={{
              background: 'linear-gradient(90deg, #092542 0%, #06182a 100%)'
            }}
          >
            <div className="col-span-2 text-center">الترتيب</div>
            <div className="col-span-3 text-right">اللاعب</div>
            <div className="col-span-3 text-center">القبيلة</div>
            <div className="col-span-1 text-center">الدولة</div>
            <div className="col-span-3 text-left pl-2">القوة الإجمالية</div>
          </div>

          {/* Table Rows (Strictly real Firestore players) */}
          <div className="w-full flex flex-col divide-y divide-sky-900/40 max-h-[460px] overflow-y-auto no-scrollbar">
            {rankedList.length === 0 ? (
              <div className="w-full py-8 text-center text-slate-400 font-bold text-base md:text-lg">
                لا توجد نتائج مطابقة لبحثك في قاعدة البيانات الحقيقية.
              </div>
            ) : (
              rankedList.slice(0, 30).map((player, index) => {
                const rank = index + 1;
                const isCurrentUser = currentUser?.uid && (player.userId === currentUser.uid || player.id === currentUser.uid);

                return (
                  <div
                    key={player.id || index}
                    onClick={() => handleOpenProfile(player)}
                    className={`w-full grid grid-cols-12 items-center px-4 py-3 text-sm md:text-base font-bold transition-all cursor-pointer hover:bg-sky-950/50 active:scale-[0.99] ${
                      isCurrentUser ? 'bg-amber-950/40 border-r-4 border-amber-400' : ''
                    }`}
                    style={{
                      background: index % 2 === 0 ? 'rgba(5, 20, 36, 0.65)' : 'rgba(3, 13, 24, 0.8)'
                    }}
                  >
                    {/* Rank Column */}
                    <div className="col-span-2 flex items-center justify-center gap-2">
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm md:text-base font-black shadow-md ${
                          rank === 1 ? 'bg-amber-400 text-amber-950 border border-amber-200' :
                          rank === 2 ? 'bg-slate-300 text-slate-900 border border-white' :
                          rank === 3 ? 'bg-amber-700 text-amber-100 border border-amber-400' :
                          'bg-slate-800 text-sky-200 border border-slate-700'
                        }`}
                      >
                        {rank}
                      </div>

                      <div className="w-8 h-8 rounded-full bg-slate-900/90 border border-sky-600/50 flex items-center justify-center text-base">
                        {player.avatar || '⚓'}
                      </div>
                    </div>

                    {/* Player Column */}
                    <div className="col-span-3 text-right truncate pr-1">
                      <span className={`text-sm md:text-base font-black ${isCurrentUser ? 'text-amber-300' : 'text-slate-100'}`}>
                        {player.username}
                      </span>
                      {isCurrentUser && <span className="mr-1.5 text-xs text-amber-400 font-extrabold">(أنت)</span>}
                    </div>

                    {/* Clan Column */}
                    <div className="col-span-3 text-center truncate px-1">
                      <span className="text-xs md:text-sm text-sky-300 bg-sky-950/80 border border-sky-800/60 px-2.5 py-1 rounded-lg">
                        {player.clan}
                      </span>
                    </div>

                    {/* Country Column */}
                    <div className="col-span-1 text-center text-lg md:text-xl">
                      {player.country || '🇸🇦'}
                    </div>

                    {/* Total Power Column */}
                    <div className="col-span-3 text-left pl-2 flex items-center justify-start gap-1.5">
                      <Swords className="w-4.5 h-4.5 text-amber-400 flex-shrink-0" />
                      <span className="text-sm md:text-base font-black text-amber-200 tracking-tight">
                        {(player.power || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Table Footer */}
          <div 
            className="w-full flex items-center justify-center gap-2.5 py-2.5 text-xs md:text-sm font-black text-amber-300/90 border-t-2 border-sky-800/60"
            style={{
              background: 'linear-gradient(90deg, #06182a 0%, #092542 50%, #06182a 100%)'
            }}
          >
            <Anchor className="w-5 h-5 text-amber-400" />
            <span>يتم تحديث الترتيب الحقيقي تلقائياً مع حركة السفن والذهب</span>
            <Anchor className="w-5 h-5 text-amber-400" />
          </div>
        </div>

        {/* 8. CLOSE AND RETURN BUTTON (NO SHARE / NO INVITE BUTTON AS REQUESTED) */}
        <div className="w-full flex items-center justify-center px-1 mb-2 mt-2">
          <button
            onClick={() => setActiveTab('harbor')}
            className="w-full py-4 px-8 rounded-2xl font-black text-base md:text-lg shadow-2xl border-2 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-3"
            style={{
              background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
              borderColor: '#64748b',
              color: '#f1f5f9',
              boxShadow: '0 6px 20px rgba(0,0,0,0.7)'
            }}
          >
            <span>إغلاق والعودة للميناء</span>
            <Anchor className="w-6 h-6 text-amber-400" />
          </button>
        </div>

      </div>

      {/* BOOM Popup Modal (Only real attack events) */}
      {showBoomPopup && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowBoomPopup(false)}
        >
          <div 
            className="w-full max-w-md rounded-3xl p-6 border-2 border-red-500/80 shadow-2xl relative"
            style={{
              background: 'linear-gradient(180deg, #1a0808 0%, #0d0404 100%)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 border-b-2 border-red-900/60 pb-3">
              <div className="flex items-center gap-3">
                <Flame className="w-7 h-7 text-red-500 animate-pulse" />
                <h3 className="text-lg md:text-xl font-black text-red-400">سجل هجمات BOOM التكتيكية</h3>
              </div>
              <button 
                onClick={() => setShowBoomPopup(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3 text-sm md:text-base">
              {currentUser?.battleReports && currentUser.battleReports.length > 0 ? (
                currentUser.battleReports.slice(0, 5).map((report: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-red-950/50 border border-red-800/50 text-slate-200">
                    <div className="flex justify-between font-black text-red-300 mb-1">
                      <span>{report.title || '💥 غارة بحرية'}</span>
                      <span className="text-xs text-slate-400">{report.time || 'مؤخراً'}</span>
                    </div>
                    <div className="text-xs md:text-sm">{report.description || report.message}</div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-red-950/30 border border-red-800/40 text-center text-slate-300 font-bold text-sm">
                  لا توجد هجمات تكتيكية مسجلة على أسطولك حتى الآن. الميناء آمن! 🛡️
                </div>
              )}
            </div>

            <button
              onClick={() => setShowBoomPopup(false)}
              className="w-full mt-5 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-base shadow-lg"
            >
              إغلاق السجل
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
