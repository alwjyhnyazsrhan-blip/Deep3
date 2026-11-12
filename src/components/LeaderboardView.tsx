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

export function formatCombatPower(val: number): string {
  if (!val || isNaN(val)) return '0';
  if (val >= 1e18) return (val / 1e18).toFixed(2).replace(/\.00$/, '') + ' Qt';
  if (val >= 1e15) return (val / 1e15).toFixed(2).replace(/\.00$/, '') + ' Q';
  if (val >= 1e12) return (val / 1e12).toFixed(2).replace(/\.00$/, '') + ' T';
  if (val >= 1e9) return (val / 1e9).toFixed(2).replace(/\.00$/, '') + ' B';
  return val.toLocaleString();
}

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
      className="fixed inset-0 z-[120] w-full h-full text-slate-100 flex flex-col items-center select-none overflow-y-auto overflow-x-hidden font-sans"
      style={{
        backgroundImage: `
          radial-gradient(ellipse at center top, rgba(7, 34, 64, 0.92) 0%, rgba(3, 15, 30, 0.98) 85%, rgba(1, 6, 14, 1) 100%),
          url('/backgrounds/leaderboard_bg.jpg'),
          url('/settings_pirate_bg.jpg')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundAttachment: 'fixed',
        direction: 'rtl'
      }}
    >
      {/* Main Container - Scaled up, expansive, high-contrast typography */}
      <div className="w-full max-w-[850px] px-2.5 sm:px-4 pt-3 pb-32 flex flex-col items-center relative z-20">

        {/* 1. TOP STATUS BAR (Large, Bold, High Contrast) */}
        <div className="w-full flex items-center justify-between px-4 py-2.5 mb-3 text-base sm:text-lg font-black text-sky-200 bg-slate-950/85 backdrop-blur-md rounded-2xl border-2 border-sky-800/80 shadow-2xl">
          {/* Right side (RTL start): Coins & Diamonds */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <div className="flex items-center gap-2 bg-amber-950/80 px-3.5 py-1.5 rounded-xl border border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
              <span className="text-xl">🪙</span>
              <span className="text-amber-300 font-black text-base sm:text-lg">{currentGold.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 bg-cyan-950/80 px-3.5 py-1.5 rounded-xl border border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
              <span className="text-xl">💎</span>
              <span className="text-cyan-300 font-black text-base sm:text-lg">{currentGems.toLocaleString()}</span>
            </div>
          </div>

          {/* Left side (RTL end): Signal, Bluetooth, Battery, Clock */}
          <div className="flex items-center gap-3 text-sm sm:text-base text-slate-200 font-bold">
            <Wifi className="w-5 h-5 text-cyan-400" />
            <span className="text-blue-400 font-mono text-sm font-black">ᛒ</span>
            <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-black">
              <BatteryCharging className="w-5 h-5" />
              <span>2.7v</span>
            </div>
            <span className="font-mono text-slate-100 font-black text-base">{currentTime}</span>
          </div>
        </div>

        {/* 2. GRAND HEADER TITLE BANNER (Enlarged & 3D Embossed) */}
        <div className="relative w-full flex flex-col items-center mb-4">
          <div 
            className="relative w-full max-w-[620px] h-[145px] sm:h-[160px] flex flex-col items-center justify-center rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-400/80"
            style={{
              background: 'radial-gradient(circle at center, rgba(16, 75, 128, 0.95) 0%, rgba(6, 28, 52, 0.98) 75%, rgba(2, 10, 22, 1) 100%)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.95), 0 0 35px rgba(234, 179, 8, 0.45)'
            }}
          >
            <div 
              className="absolute inset-0 opacity-40 bg-cover bg-center pointer-events-none"
              style={{ backgroundImage: `url('/backgrounds/kings_depths_banner.jpg')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-cyan-950/40 pointer-events-none" />

            {/* Glowing Golden Trident & Crown Ornament */}
            <div className="relative flex items-center justify-center gap-3 mb-1">
              <span className="text-amber-400 text-2xl drop-shadow-[0_0_12px_rgba(250,204,21,1)]">🔱</span>
              <div className="relative">
                <Crown className="w-12 h-12 text-amber-400 filter drop-shadow-[0_0_18px_rgba(245,158,11,1)]" />
              </div>
              <span className="text-amber-400 text-2xl drop-shadow-[0_0_12px_rgba(250,204,21,1)]">🔱</span>
            </div>

            {/* Arabic Embossed 3D Title */}
            <h1 
              className="relative text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-300 to-amber-500 drop-shadow-[0_4px_8px_rgba(0,0,0,0.95)] tracking-wide"
              style={{
                textShadow: '0 4px 8px rgba(0,0,0,0.95), 0 0 25px rgba(245,158,11,0.6)',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}
            >
              ملوك الأعماق
            </h1>

            {/* English Subtitle */}
            <div className="relative flex items-center gap-2 text-xs sm:text-sm font-black tracking-widest text-amber-300 mt-1 uppercase">
              <Anchor className="w-4.5 h-4.5 text-amber-400" />
              <span>✦ KINGS OF THE DEPTHS ✦</span>
              <Anchor className="w-4.5 h-4.5 text-amber-400" />
            </div>
          </div>
        </div>

        {/* 3. QUICK ACTION BUTTONS ROW (Enlarged with Big Icons & Crisp Text) */}
        <div className="w-full flex items-center justify-between gap-2 px-1 mb-4 overflow-x-auto no-scrollbar py-1">
          
          {/* سوق السفن */}
          <button
            onClick={() => setActiveTab('shop')}
            className="flex-1 min-w-[78px] sm:min-w-[95px] h-[90px] sm:h-[98px] flex flex-col items-center justify-center rounded-2xl transition-all transform active:scale-95 shadow-xl relative group border-2"
            style={{
              background: 'linear-gradient(180deg, #134875 0%, #07233a 100%)',
              borderColor: 'rgba(56, 189, 248, 0.7)',
              boxShadow: '0 6px 16px rgba(0,0,0,0.65), inset 0 1px 3px rgba(255,255,255,0.3)'
            }}
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl bg-sky-900/80 border border-sky-400/60 mb-1">
              <Ship className="w-7 h-7 text-sky-200 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-xs sm:text-sm font-black text-white whitespace-nowrap drop-shadow">سوق السفن</span>
          </button>

          {/* السمك */}
          <button
            onClick={() => setLeaderboardFilter('fish')}
            className={`flex-1 min-w-[78px] sm:min-w-[95px] h-[90px] sm:h-[98px] flex flex-col items-center justify-center rounded-2xl transition-all transform active:scale-95 shadow-xl relative group border-2 ${
              leaderboardFilter === 'fish' ? 'ring-2 ring-cyan-300 scale-105' : ''
            }`}
            style={{
              background: leaderboardFilter === 'fish' 
                ? 'linear-gradient(180deg, #116fa9 0%, #083c5e 100%)' 
                : 'linear-gradient(180deg, #134875 0%, #07233a 100%)',
              borderColor: leaderboardFilter === 'fish' ? '#38bdf8' : 'rgba(56, 189, 248, 0.7)',
              boxShadow: '0 6px 16px rgba(0,0,0,0.65), inset 0 1px 3px rgba(255,255,255,0.3)'
            }}
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl bg-cyan-900/80 border border-cyan-400/60 mb-1">
              <Fish className="w-7 h-7 text-cyan-200 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-xs sm:text-sm font-black text-white whitespace-nowrap drop-shadow">السمك</span>
          </button>

          {/* البحث */}
          <button
            onClick={() => setLeaderboardFilter(leaderboardFilter === 'search' ? 'xp' : 'search')}
            className={`flex-1 min-w-[78px] sm:min-w-[95px] h-[90px] sm:h-[98px] flex flex-col items-center justify-center rounded-2xl transition-all transform active:scale-95 shadow-xl relative group border-2 ${
              leaderboardFilter === 'search' ? 'ring-2 ring-cyan-300 scale-105' : ''
            }`}
            style={{
              background: leaderboardFilter === 'search' 
                ? 'linear-gradient(180deg, #116fa9 0%, #083c5e 100%)' 
                : 'linear-gradient(180deg, #134875 0%, #07233a 100%)',
              borderColor: leaderboardFilter === 'search' ? '#38bdf8' : 'rgba(56, 189, 248, 0.7)',
              boxShadow: '0 6px 16px rgba(0,0,0,0.65), inset 0 1px 3px rgba(255,255,255,0.3)'
            }}
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl bg-blue-900/80 border border-blue-400/60 mb-1">
              <Search className="w-6.5 h-6.5 text-blue-200 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-xs sm:text-sm font-black text-white whitespace-nowrap drop-shadow">البحث</span>
          </button>

          {/* الفعاليات */}
          <button
            onClick={() => setLeaderboardFilter('events')}
            className={`flex-1 min-w-[78px] sm:min-w-[95px] h-[90px] sm:h-[98px] flex flex-col items-center justify-center rounded-2xl transition-all transform active:scale-95 shadow-xl relative group border-2 ${
              leaderboardFilter === 'events' ? 'ring-2 ring-amber-400 scale-105' : ''
            }`}
            style={{
              background: leaderboardFilter === 'events' 
                ? 'linear-gradient(180deg, #784507 0%, #3e2202 100%)' 
                : 'linear-gradient(180deg, #134875 0%, #07233a 100%)',
              borderColor: leaderboardFilter === 'events' ? '#f59e0b' : 'rgba(56, 189, 248, 0.7)',
              boxShadow: '0 6px 16px rgba(0,0,0,0.65), inset 0 1px 3px rgba(255,255,255,0.3)'
            }}
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl bg-amber-900/80 border border-amber-400/60 mb-1">
              <Scroll className="w-6.5 h-6.5 text-amber-200 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-xs sm:text-sm font-black text-white whitespace-nowrap drop-shadow">الفعاليات</span>
          </button>

          {/* BOOM 💥 */}
          <button
            onClick={() => {
              if (onOpenAttacksList) onOpenAttacksList();
              setShowBoomPopup(true);
            }}
            className="flex-1 min-w-[78px] sm:min-w-[95px] h-[90px] sm:h-[98px] flex flex-col items-center justify-center rounded-2xl transition-all transform active:scale-95 shadow-xl relative group border-2"
            style={{
              background: 'linear-gradient(180deg, #991b1b 0%, #520909 100%)',
              borderColor: '#ef4444',
              boxShadow: '0 6px 16px rgba(239, 68, 68, 0.5), inset 0 1px 3px rgba(255,255,255,0.3)'
            }}
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl bg-red-900/80 border border-red-400/70 mb-1 animate-pulse">
              <Flame className="w-7 h-7 text-amber-300" />
            </div>
            <span className="text-xs sm:text-sm font-black text-amber-200 whitespace-nowrap drop-shadow">💥 BOOM</span>
          </button>

          {/* الذهب */}
          <button
            onClick={() => setLeaderboardFilter('gold')}
            className={`flex-1 min-w-[78px] sm:min-w-[95px] h-[90px] sm:h-[98px] flex flex-col items-center justify-center rounded-2xl transition-all transform active:scale-95 shadow-xl relative group border-2 ${
              leaderboardFilter === 'gold' ? 'ring-2 ring-amber-400 scale-105' : ''
            }`}
            style={{
              background: leaderboardFilter === 'gold' 
                ? 'linear-gradient(180deg, #7c4c02 0%, #452601 100%)' 
                : 'linear-gradient(180deg, #134875 0%, #07233a 100%)',
              borderColor: leaderboardFilter === 'gold' ? '#eab308' : 'rgba(56, 189, 248, 0.7)',
              boxShadow: '0 6px 16px rgba(0,0,0,0.65), inset 0 1px 3px rgba(255,255,255,0.3)'
            }}
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl bg-amber-950/80 border border-amber-400/70 mb-1">
              <Coins className="w-6.5 h-6.5 text-amber-300 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-xs sm:text-sm font-black text-white whitespace-nowrap drop-shadow">الذهب</span>
          </button>

          {/* الجواهر */}
          <button
            onClick={() => setLeaderboardFilter('gems')}
            className={`flex-1 min-w-[78px] sm:min-w-[95px] h-[90px] sm:h-[98px] flex flex-col items-center justify-center rounded-2xl transition-all transform active:scale-95 shadow-xl relative group border-2 ${
              leaderboardFilter === 'gems' ? 'ring-2 ring-cyan-300 scale-105' : ''
            }`}
            style={{
              background: leaderboardFilter === 'gems' 
                ? 'linear-gradient(180deg, #116fa9 0%, #083c5e 100%)' 
                : 'linear-gradient(180deg, #134875 0%, #07233a 100%)',
              borderColor: leaderboardFilter === 'gems' ? '#06b6d4' : 'rgba(56, 189, 248, 0.7)',
              boxShadow: '0 6px 16px rgba(0,0,0,0.65), inset 0 1px 3px rgba(255,255,255,0.3)'
            }}
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl bg-cyan-950/80 border border-cyan-400/70 mb-1">
              <Gem className="w-6.5 h-6.5 text-cyan-300 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-xs sm:text-sm font-black text-white whitespace-nowrap drop-shadow">الجواهر</span>
          </button>
        </div>

        {/* 4. DUAL TAB SWITCHER (الترتيب vs القبيلة) - Big & Bold */}
        <div className="w-full flex items-center justify-center gap-4 mb-4 px-1">
          {/* الترتيب */}
          <button
            onClick={() => setSelectedSubTab('ranking')}
            className="flex-1 max-w-[280px] h-[58px] sm:h-[64px] flex items-center justify-center gap-3 rounded-2xl font-black text-base sm:text-lg transition-all shadow-2xl border-2 cursor-pointer active:scale-95"
            style={{
              background: selectedSubTab === 'ranking' 
                ? 'linear-gradient(180deg, #1c5e96 0%, #0b3052 100%)'
                : 'linear-gradient(180deg, #0d263e 0%, #061524 100%)',
              borderColor: selectedSubTab === 'ranking' ? '#38bdf8' : '#1e3a5f',
              color: selectedSubTab === 'ranking' ? '#fef08a' : '#cbd5e1',
              boxShadow: selectedSubTab === 'ranking' ? '0 0 22px rgba(56, 189, 248, 0.6)' : 'none'
            }}
          >
            <Crown className="w-7 h-7 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
            <span className="drop-shadow">الترتيب</span>
          </button>

          {/* القبيلة */}
          <button
            onClick={() => {
              setSelectedSubTab('clan');
              setActiveTab('tribes');
            }}
            className="flex-1 max-w-[280px] h-[58px] sm:h-[64px] flex items-center justify-center gap-3 rounded-2xl font-black text-base sm:text-lg transition-all shadow-2xl border-2 cursor-pointer active:scale-95"
            style={{
              background: selectedSubTab === 'clan' 
                ? 'linear-gradient(180deg, #1c5e96 0%, #0b3052 100%)'
                : 'linear-gradient(180deg, #0d263e 0%, #061524 100%)',
              borderColor: selectedSubTab === 'clan' ? '#38bdf8' : '#1e3a5f',
              color: selectedSubTab === 'clan' ? '#fef08a' : '#cbd5e1',
              boxShadow: selectedSubTab === 'clan' ? '0 0 22px rgba(56, 189, 248, 0.6)' : 'none'
            }}
          >
            <Users className="w-7 h-7 text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
            <span className="drop-shadow">القبيلة</span>
          </button>
        </div>

        {/* 5. SECTION TITLE BANNER (⚓ ترتيب اللاعبين ⚓) */}
        <div className="w-full flex items-center justify-center gap-3 my-3">
          <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-amber-500/80 to-amber-400" />
          <div className="flex items-center gap-3 px-6 py-2 rounded-full bg-slate-950/90 border-2 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)]">
            <Anchor className="w-6 h-6 text-amber-400 drop-shadow" />
            <h2 className="text-xl sm:text-2xl font-black text-amber-300 tracking-wide drop-shadow">
              ترتيب اللاعبين
            </h2>
            <Anchor className="w-6 h-6 text-amber-400 drop-shadow" />
          </div>
          <div className="h-0.5 flex-1 bg-gradient-to-l from-transparent via-amber-500/80 to-amber-400" />
        </div>

        {/* Search Input Box */}
        {leaderboardFilter === 'search' && (
          <div className="w-full my-3.5 animate-fadeIn">
            <div className="relative flex items-center">
              <Search className="absolute right-4 w-7 h-7 text-cyan-400 pointer-events-none" />
              <input
                type="text"
                placeholder="اكتب اسم القبطان أو القبيلة للبحث الحقيقي..."
                value={leaderboardSearchQuery}
                onChange={(e) => setLeaderboardSearchQuery(e.target.value)}
                className="w-full pr-14 pl-4 py-3.5 bg-slate-900/95 border-2 border-cyan-400 rounded-2xl text-white text-base sm:text-lg font-bold focus:outline-none focus:border-cyan-300 placeholder-slate-400 shadow-2xl"
              />
              {leaderboardSearchQuery && (
                <button 
                  onClick={() => setLeaderboardSearchQuery('')}
                  className="absolute left-4 text-slate-400 hover:text-white p-1"
                >
                  <X className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* 6. TOP 3 PODIUM DISPLAY (Significantly Larger & Clear) */}
        {rankedList.length > 0 ? (
          <div className="w-full flex items-end justify-center gap-3 sm:gap-6 my-5 pt-6 px-1">
            
            {/* RANK #2 (Silver/Ice Blue - Left) */}
            {top2 && (
              <div 
                onClick={() => handleOpenProfile(top2)}
                className="flex-1 max-w-[170px] sm:max-w-[210px] flex flex-col items-center cursor-pointer transition-transform hover:scale-105 active:scale-95 group"
              >
                <div className="relative mb-2.5 flex flex-col items-center">
                  <div className="relative z-10 w-12 h-12 rounded-full bg-gradient-to-b from-sky-400 to-slate-700 border-2 border-white flex items-center justify-center shadow-xl -mb-4">
                    <span className="text-white font-black text-lg">2</span>
                  </div>

                  <div 
                    className="w-28 h-28 sm:w-34 sm:h-34 rounded-2xl flex items-center justify-center p-2 relative shadow-2xl"
                    style={{
                      background: 'radial-gradient(circle, #22436d 0%, #0a1c30 100%)',
                      border: '3.5px solid #cbd5e1',
                      boxShadow: '0 0 20px rgba(203, 213, 225, 0.5), inset 0 0 12px rgba(56, 189, 248, 0.4)'
                    }}
                  >
                    <div className="w-full h-full rounded-xl bg-slate-900/90 border border-sky-400/50 flex items-center justify-center text-4xl sm:text-5xl">
                      {top2.avatar || '⚓'}
                    </div>
                  </div>

                  <div className="absolute -bottom-3.5 z-10">
                    <Anchor className="w-6 h-6 text-slate-200 filter drop-shadow" />
                  </div>
                </div>

                <div className="w-full bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-slate-400 rounded-xl py-1.5 px-2 text-center shadow-md mb-1.5">
                  <span className="text-sm sm:text-base font-black text-slate-100 truncate block">
                    {top2.username}
                  </span>
                </div>

                <div 
                  className="flex items-center justify-center gap-1.5 text-sm sm:text-base font-black text-sky-200 w-full px-1 overflow-hidden"
                  title={(top2.power || 0).toLocaleString()}
                >
                  <Swords className="w-5 h-5 text-sky-400 flex-shrink-0" />
                  <span className="truncate whitespace-nowrap">{formatCombatPower(top2.power || 0)}</span>
                </div>
              </div>
            )}

            {/* RANK #1 (Center - Majestic Gold Crown) */}
            {top1 && (
              <div 
                onClick={() => handleOpenProfile(top1)}
                className="flex-1 max-w-[200px] sm:max-w-[250px] flex flex-col items-center cursor-pointer transition-transform hover:scale-105 active:scale-95 -mt-6 z-10 group"
              >
                <div className="relative mb-2.5 flex flex-col items-center">
                  <Crown className="w-12 h-12 text-amber-400 filter drop-shadow-[0_0_16px_rgba(245,158,11,1)] -mb-1 animate-bounce" />
                  <div className="relative z-10 w-14 h-14 rounded-full bg-gradient-to-b from-amber-400 to-amber-700 border-2 border-amber-100 flex items-center justify-center shadow-2xl -mb-4">
                    <span className="text-amber-950 font-black text-2xl">1</span>
                  </div>

                  <div 
                    className="w-34 h-34 sm:w-42 sm:h-42 rounded-3xl flex items-center justify-center p-2 relative shadow-2xl"
                    style={{
                      background: 'radial-gradient(circle, #482903 0%, #1a0c01 100%)',
                      border: '4px solid #facc15',
                      boxShadow: '0 0 30px rgba(250, 204, 21, 0.7), inset 0 0 16px rgba(250, 204, 21, 0.45)'
                    }}
                  >
                    <div className="w-full h-full rounded-2xl bg-slate-950/90 border-2 border-amber-400/80 flex items-center justify-center text-5xl sm:text-6xl">
                      {top1.avatar || '⚓'}
                    </div>
                  </div>

                  <div className="absolute -bottom-4 z-10">
                    <Anchor className="w-7 h-7 text-amber-400 filter drop-shadow-[0_0_10px_rgba(245,158,11,1)]" />
                  </div>
                </div>

                <div className="w-full bg-gradient-to-b from-amber-950 to-slate-950 border-2 border-amber-400 rounded-xl py-1.5 px-2.5 text-center shadow-2xl mb-1.5">
                  <span className="text-base sm:text-lg font-black text-amber-200 truncate block">
                    {top1.username}
                  </span>
                </div>

                <div 
                  className="flex items-center justify-center gap-1.5 text-base sm:text-lg font-black text-amber-300 w-full px-1 overflow-hidden"
                  title={(top1.power || 0).toLocaleString()}
                >
                  <Swords className="w-6 h-6 text-amber-400 flex-shrink-0 drop-shadow" />
                  <span className="truncate whitespace-nowrap">{formatCombatPower(top1.power || 0)}</span>
                </div>
              </div>
            )}

            {/* RANK #3 (Bronze/Ruby - Right) */}
            {top3 && (
              <div 
                onClick={() => handleOpenProfile(top3)}
                className="flex-1 max-w-[170px] sm:max-w-[210px] flex flex-col items-center cursor-pointer transition-transform hover:scale-105 active:scale-95 group"
              >
                <div className="relative mb-2.5 flex flex-col items-center">
                  <div className="relative z-10 w-12 h-12 rounded-full bg-gradient-to-b from-amber-600 to-orange-950 border-2 border-amber-300 flex items-center justify-center shadow-xl -mb-4">
                    <span className="text-amber-100 font-black text-lg">3</span>
                  </div>

                  <div 
                    className="w-28 h-28 sm:w-34 sm:h-34 rounded-2xl flex items-center justify-center p-2 relative shadow-2xl"
                    style={{
                      background: 'radial-gradient(circle, #451705 0%, #1a0801 100%)',
                      border: '3.5px solid #d97706',
                      boxShadow: '0 0 20px rgba(217, 119, 6, 0.5), inset 0 0 12px rgba(249, 115, 22, 0.4)'
                    }}
                  >
                    <div className="w-full h-full rounded-xl bg-slate-900/90 border border-amber-500/60 flex items-center justify-center text-4xl sm:text-5xl">
                      {top3.avatar || '⚓'}
                    </div>
                  </div>

                  <div className="absolute -bottom-3.5 z-10">
                    <Anchor className="w-6 h-6 text-amber-500 filter drop-shadow" />
                  </div>
                </div>

                <div className="w-full bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-600 rounded-xl py-1.5 px-2 text-center shadow-md mb-1.5">
                  <span className="text-sm sm:text-base font-black text-amber-100 truncate block">
                    {top3.username}
                  </span>
                </div>

                <div 
                  className="flex items-center justify-center gap-1.5 text-sm sm:text-base font-black text-amber-200 w-full px-1 overflow-hidden"
                  title={(top3.power || 0).toLocaleString()}
                >
                  <Swords className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <span className="truncate whitespace-nowrap">{formatCombatPower(top3.power || 0)}</span>
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="w-full py-8 text-center bg-slate-950/80 border-2 border-sky-800 rounded-2xl my-4 px-4 text-slate-200 font-black text-base sm:text-lg">
            لا توجد حسابات أو لاعبين مسجلين في هذا الترتيب حالياً. كن أول قبطان يعتلي الصدارة! ⚓
          </div>
        )}

        {/* 7. LEADERBOARD TABLE (Enlarged Rows & Big Clear Text) */}
        <div className="w-full flex flex-col rounded-2xl overflow-hidden border-2 border-sky-700/80 shadow-2xl backdrop-blur-md mb-5 bg-slate-950/90">
          
          {/* Table Header Row */}
          <div 
            className="w-full grid grid-cols-12 items-center px-4 py-3.5 text-base sm:text-lg font-black text-sky-100 border-b-2 border-sky-700/80"
            style={{
              background: 'linear-gradient(90deg, #0d3257 0%, #08223c 100%)'
            }}
          >
            <div className="col-span-2 text-center">الترتيب</div>
            <div className="col-span-4 text-right pr-2">اللاعب</div>
            <div className="col-span-2 text-center">القبيلة</div>
            <div className="col-span-1 text-center">الدولة</div>
            <div className="col-span-3 text-center">القوة الإجمالية</div>
          </div>

          {/* Table Rows */}
          <div className="w-full flex flex-col divide-y-2 divide-sky-950 max-h-[500px] overflow-y-auto no-scrollbar">
            {rankedList.length === 0 ? (
              <div className="w-full py-8 text-center text-slate-300 font-black text-base sm:text-lg">
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
                    className={`w-full grid grid-cols-12 items-center px-3.5 py-3.5 text-base sm:text-lg font-bold transition-all cursor-pointer hover:bg-sky-950/70 active:scale-[0.99] ${
                      isCurrentUser ? 'bg-amber-950/50 border-r-4 border-amber-400' : ''
                    }`}
                    style={{
                      background: index % 2 === 0 ? 'rgba(6, 24, 44, 0.75)' : 'rgba(3, 15, 28, 0.9)'
                    }}
                  >
                    {/* Rank Column */}
                    <div className="col-span-2 flex items-center justify-center gap-2">
                      <div 
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-base sm:text-lg font-black shadow-md ${
                          rank === 1 ? 'bg-amber-400 text-amber-950 border-2 border-amber-200' :
                          rank === 2 ? 'bg-slate-200 text-slate-900 border-2 border-white' :
                          rank === 3 ? 'bg-amber-700 text-amber-100 border-2 border-amber-400' :
                          'bg-slate-800 text-sky-200 border border-slate-600'
                        }`}
                      >
                        {rank}
                      </div>

                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900/95 border-2 border-sky-500/70 flex items-center justify-center text-xl">
                        {player.avatar || '⚓'}
                      </div>
                    </div>

                    {/* Player Column */}
                    <div className="col-span-4 text-right truncate pr-2">
                      <span className={`text-base sm:text-lg font-black ${isCurrentUser ? 'text-amber-300' : 'text-slate-100'}`}>
                        {player.username}
                      </span>
                      {isCurrentUser && <span className="mr-1.5 text-xs sm:text-sm text-amber-400 font-extrabold">(أنت)</span>}
                    </div>

                    {/* Clan Column */}
                    <div className="col-span-2 text-center truncate px-1">
                      <span className="text-xs sm:text-sm text-sky-200 bg-sky-950 border border-sky-600/70 px-3 py-1 rounded-lg font-black">
                        {player.clan || '-'}
                      </span>
                    </div>

                    {/* Country Column */}
                    <div className="col-span-1 text-center text-2xl">
                      {player.country || '🇸🇦'}
                    </div>

                    {/* Total Power Column */}
                    <div 
                      className="col-span-3 flex items-center justify-center gap-1.5 px-1 overflow-hidden"
                      title={(player.power || 0).toLocaleString()}
                    >
                      <Swords className="w-5 h-5 text-amber-400 flex-shrink-0" />
                      <span className="text-base sm:text-lg font-black text-amber-300 tracking-tight whitespace-nowrap drop-shadow">
                        {formatCombatPower(player.power || 0)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Table Footer */}
          <div 
            className="w-full flex items-center justify-center gap-2.5 py-3 text-sm sm:text-base font-black text-amber-300 border-t-2 border-sky-700/80"
            style={{
              background: 'linear-gradient(90deg, #071f37 0%, #0d3358 50%, #071f37 100%)'
            }}
          >
            <Anchor className="w-5 h-5 text-amber-400" />
            <span>يتم تحديث الترتيب الحقيقي تلقائياً مع حركة السفن والذهب</span>
            <Anchor className="w-5 h-5 text-amber-400" />
          </div>
        </div>

        {/* 8. CLOSE AND RETURN BUTTON (Prominent & Easy to Click) */}
        <div className="w-full flex items-center justify-center px-1 mb-2 mt-2">
          <button
            onClick={() => setActiveTab('harbor')}
            className="w-full py-4 px-6 rounded-2xl font-black text-base sm:text-lg shadow-2xl border-2 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-3"
            style={{
              background: 'linear-gradient(180deg, #1e3a5f 0%, #0f1f33 100%)',
              borderColor: '#38bdf8',
              color: '#ffffff',
              boxShadow: '0 8px 25px rgba(0,0,0,0.8), 0 0 15px rgba(56, 189, 248, 0.4)'
            }}
          >
            <Anchor className="w-6 h-6 text-amber-400" />
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
                <Flame className="w-8 h-8 text-red-500 animate-pulse" />
                <h3 className="text-xl font-black text-red-400">سجل هجمات BOOM التكتيكية</h3>
              </div>
              <button 
                onClick={() => setShowBoomPopup(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-7 h-7" />
              </button>
            </div>

            <div className="space-y-3.5 text-base">
              {currentUser?.battleReports && currentUser.battleReports.length > 0 ? (
                currentUser.battleReports.slice(0, 5).map((report: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-slate-200">
                    <div className="flex justify-between font-black text-red-300 mb-1">
                      <span>{report.title || '💥 غارة بحرية'}</span>
                      <span className="text-xs text-slate-400">{report.time || 'مؤخراً'}</span>
                    </div>
                    <div className="text-sm sm:text-base">{report.description || report.message}</div>
                  </div>
                ))
              ) : (
                <div className="p-5 rounded-xl bg-red-950/40 border border-red-800 text-center text-slate-200 font-bold text-base">
                  لا توجد هجمات تكتيكية مسجلة على أسطولك حتى الآن. الميناء آمن! 🛡️
                </div>
              )}
            </div>

            <button
              onClick={() => setShowBoomPopup(false)}
              className="w-full mt-5 py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-lg shadow-lg active:scale-95"
            >
              إغلاق السجل
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
