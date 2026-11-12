import React, { useState, useMemo } from 'react';
import { FISH_REWARD_DATA, getFishHouseImageUrl, getFishHouseCapacity } from '../data';

interface FishHouseComponentProps {
  userLevel: number;
  gold: number;
  gems?: number;
  redGems?: number;
  fishInventory: Record<string, number>;
  onUpgrade: () => void;
  onSellFish: (fishName: string, amount: number, totalGold: number) => void;
  onSellAllFish?: (totalGold: number) => void;
  onClose: () => void;
}

export const getFishHouseData = (level: number) => {
  const currentLevel = Math.max(1, Math.min(Number(level) || 1, 31));
  const capacity = getFishHouseCapacity(currentLevel);
  const cost = currentLevel * 500;
  const imageUrl = getFishHouseImageUrl(currentLevel);
  const isMaxLevel = currentLevel >= 31;

  return {
    level: currentLevel,
    capacity,
    cost,
    imageUrl,
    isMaxLevel,
    nextCapacity: isMaxLevel ? capacity : getFishHouseCapacity(currentLevel + 1),
  };
};

// Visual characteristics for each fish card matching the royal warehouse aesthetic
const getFishVisualSpec = (name: string) => {
  const n = name.trim();
  if (n.includes('برق')) {
    return {
      symbol: '⚡🐟',
      rarity: 'أسطوري' as const,
      rarityStyle: 'bg-purple-900/90 border border-purple-400 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.7)]',
      cardBorder: 'border-2 border-purple-500 shadow-[0_0_18px_rgba(168,85,247,0.45)]',
      bgGlow: 'radial-gradient(circle at 50% 30%, rgba(147, 51, 234, 0.35) 0%, rgba(10, 15, 35, 0.95) 75%)',
    };
  }
  if (n.includes('نار')) {
    return {
      symbol: '🔥🐟',
      rarity: 'أسطوري' as const,
      rarityStyle: 'bg-purple-900/90 border border-purple-400 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.7)]',
      cardBorder: 'border-2 border-purple-500 shadow-[0_0_18px_rgba(168,85,247,0.45)]',
      bgGlow: 'radial-gradient(circle at 50% 30%, rgba(220, 38, 38, 0.35) 0%, rgba(20, 10, 25, 0.95) 75%)',
    };
  }
  if (n.includes('ذهبي') || n.includes('تنين')) {
    return {
      symbol: '👑🐉',
      rarity: 'أسطوري' as const,
      rarityStyle: 'bg-purple-900/90 border border-purple-400 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.7)]',
      cardBorder: 'border-2 border-purple-500 shadow-[0_0_18px_rgba(168,85,247,0.45)]',
      bgGlow: 'radial-gradient(circle at 50% 30%, rgba(234, 179, 8, 0.35) 0%, rgba(20, 15, 30, 0.95) 75%)',
    };
  }
  if (n.includes('جليدي')) {
    return {
      symbol: '❄️🐉',
      rarity: 'أسطوري' as const,
      rarityStyle: 'bg-purple-900/90 border border-purple-400 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.7)]',
      cardBorder: 'border-2 border-purple-500 shadow-[0_0_18px_rgba(168,85,247,0.45)]',
      bgGlow: 'radial-gradient(circle at 50% 30%, rgba(6, 182, 212, 0.35) 0%, rgba(10, 20, 40, 0.95) 75%)',
    };
  }
  if (n.includes('أزرق') && n.includes('حوت') || n.includes('حوت') || n.includes('أسطوري')) {
    return {
      symbol: '🐋',
      rarity: 'أسطوري' as const,
      rarityStyle: 'bg-purple-900/90 border border-purple-400 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.7)]',
      cardBorder: 'border-2 border-purple-500 shadow-[0_0_18px_rgba(168,85,247,0.45)]',
      bgGlow: 'radial-gradient(circle at 50% 30%, rgba(59, 130, 246, 0.35) 0%, rgba(10, 15, 35, 0.95) 75%)',
    };
  }
  if (n.includes('قمر') || n.includes('أحمر')) {
    return {
      symbol: '🐠',
      rarity: 'نادر' as const,
      rarityStyle: 'bg-sky-600/90 border border-sky-300 text-white shadow-[0_0_8px_rgba(56,189,248,0.6)]',
      cardBorder: 'border-2 border-sky-400 shadow-[0_0_14px_rgba(56,189,248,0.35)]',
      bgGlow: 'radial-gradient(circle at 50% 30%, rgba(239, 68, 68, 0.25) 0%, rgba(5, 20, 45, 0.95) 75%)',
    };
  }
  if (n.includes('قرش') || n.includes('مارلن') || n.includes('براكودا')) {
    return {
      symbol: '🦈',
      rarity: 'نادر' as const,
      rarityStyle: 'bg-sky-600/90 border border-sky-300 text-white shadow-[0_0_8px_rgba(56,189,248,0.6)]',
      cardBorder: 'border-2 border-sky-400 shadow-[0_0_14px_rgba(56,189,248,0.35)]',
      bgGlow: 'radial-gradient(circle at 50% 30%, rgba(14, 165, 233, 0.25) 0%, rgba(3, 20, 45, 0.95) 75%)',
    };
  }
  if (n.includes('سيف')) {
    return {
      symbol: '🗡️🦈',
      rarity: 'نادر' as const,
      rarityStyle: 'bg-sky-600/90 border border-sky-300 text-white shadow-[0_0_8px_rgba(56,189,248,0.6)]',
      cardBorder: 'border-2 border-sky-400 shadow-[0_0_14px_rgba(56,189,248,0.35)]',
      bgGlow: 'radial-gradient(circle at 50% 30%, rgba(14, 165, 233, 0.25) 0%, rgba(3, 20, 45, 0.95) 75%)',
    };
  }
  if (n.includes('شفنين')) {
    return {
      symbol: '🌊🐡',
      rarity: 'نادر' as const,
      rarityStyle: 'bg-sky-600/90 border border-sky-300 text-white shadow-[0_0_8px_rgba(56,189,248,0.6)]',
      cardBorder: 'border-2 border-sky-400 shadow-[0_0_14px_rgba(56,189,248,0.35)]',
      bgGlow: 'radial-gradient(circle at 50% 30%, rgba(6, 182, 212, 0.25) 0%, rgba(3, 20, 45, 0.95) 75%)',
    };
  }
  if (n.includes('صفراء') || n.includes('ذهب')) {
    return {
      symbol: '🐟',
      rarity: 'نادر' as const,
      rarityStyle: 'bg-sky-600/90 border border-sky-300 text-white shadow-[0_0_8px_rgba(56,189,248,0.6)]',
      cardBorder: 'border-2 border-sky-400 shadow-[0_0_14px_rgba(56,189,248,0.35)]',
      bgGlow: 'radial-gradient(circle at 50% 30%, rgba(234, 179, 8, 0.25) 0%, rgba(3, 20, 45, 0.95) 75%)',
    };
  }
  if (n.includes('هامور')) {
    return {
      symbol: '🐠',
      rarity: 'عادي' as const,
      rarityStyle: 'bg-slate-800/90 border border-slate-500 text-slate-200',
      cardBorder: 'border border-sky-500/40 hover:border-sky-400 shadow-[0_4px_12px_rgba(0,0,0,0.6)]',
      bgGlow: 'radial-gradient(circle at 50% 30%, rgba(51, 65, 85, 0.3) 0%, rgba(4, 15, 30, 0.95) 75%)',
    };
  }
  return {
    symbol: '🐟',
    rarity: 'عادي' as const,
    rarityStyle: 'bg-slate-800/90 border border-slate-500 text-slate-200',
    cardBorder: 'border border-sky-500/40 hover:border-sky-400 shadow-[0_4px_12px_rgba(0,0,0,0.6)]',
    bgGlow: 'radial-gradient(circle at 50% 30%, rgba(14, 165, 233, 0.15) 0%, rgba(4, 15, 30, 0.95) 75%)',
  };
};

const FishHouseComponent: React.FC<FishHouseComponentProps> = ({ 
  userLevel, 
  gold = 0,
  fishInventory = {},
  onUpgrade,
  onSellFish,
  onSellAllFish,
  onClose
}) => {
  const building = getFishHouseData(userLevel);
  const [selectedFish, setSelectedFish] = useState<string | null>(null);
  const [sellAmount, setSellAmount] = useState<number>(0);
  const [isFrozen, setIsFrozen] = useState<boolean>(false);
  const [freezeTimer] = useState<string>('23:56:34');
  const [showConfirmUpgrade, setShowConfirmUpgrade] = useState<boolean>(false);
  const [showConfirmSellAll, setShowConfirmSellAll] = useState<boolean>(false);
  const [showReceipt, setShowReceipt] = useState<boolean>(false);
  const [receiptData, setReceiptData] = useState<{
    fishName: string;
    amount: number;
    basePrice: number;
    freshnessPenalty: number;
    finalIncome: number;
    stars: number;
  } | null>(null);

  // Filter available fish strictly from actual inventory. If empty, it remains empty!
  const displayInventory = useMemo(() => {
    const validItems: Record<string, number> = {};
    if (fishInventory && typeof fishInventory === 'object') {
      Object.entries(fishInventory).forEach(([name, count]) => {
        if (typeof count === 'number' && count > 0) {
          validItems[name] = count;
        }
      });
    }
    return validItems;
  }, [fishInventory]);

  const totalFishCount = useMemo(() => {
    return Object.values(displayInventory).reduce((sum: number, val: number) => sum + val, 0);
  }, [displayInventory]);

  // Base value calculation
  const getFishUnitVal = (name: string) => {
    const info = FISH_REWARD_DATA[name];
    if (info) return info.valPerFish;
    const clean = name.replace(/^ال/, '').trim();
    if (FISH_REWARD_DATA[clean]) return FISH_REWARD_DATA[clean].valPerFish;
    return 1;
  };

  // Total value for selling all fish in storage
  const totalSellAllValue = useMemo(() => {
    return Object.entries(displayInventory).reduce((sum: number, [name, count]) => {
      return sum + Math.round((Number(count) || 0) * getFishUnitVal(name));
    }, 0);
  }, [displayInventory]);

  // Handle clicking on a fish card to open Market Detail view
  const handleSelectFish = (fishName: string) => {
    const count = displayInventory[fishName] || 0;
    setSelectedFish(fishName);
    setSellAmount(count);
    setIsFrozen(false);
  };

  // Trigger sell process -> opens receipt modal
  const handleInitiateSell = () => {
    if (!selectedFish || sellAmount <= 0) return;
    const currentPricePerUnit = getFishUnitVal(selectedFish);
    const basePrice = Math.round(sellAmount * currentPricePerUnit);
    const freshnessPenalty = isFrozen ? 0 : 0;
    const finalIncome = basePrice;

    setReceiptData({
      fishName: selectedFish,
      amount: sellAmount,
      basePrice,
      freshnessPenalty,
      finalIncome,
      stars: 3,
    });
    setShowReceipt(true);
  };

  // Finalize sale after reviewing receipt
  const handleFinalizeSell = () => {
    if (receiptData && receiptData.fishName !== 'جميع أسماك المخزن') {
      onSellFish(receiptData.fishName, receiptData.amount, receiptData.finalIncome);
    }
    setShowReceipt(false);
    setReceiptData(null);
    setSelectedFish(null);
  };

  return (
    <div 
      className="fixed inset-0 z-[120] bg-slate-950 flex flex-col justify-between text-white font-['Cairo',_sans-serif] overflow-hidden select-none" 
      dir="rtl"
      style={{
        backgroundImage: 'linear-gradient(rgba(2, 6, 23, 0.75), rgba(2, 6, 23, 0.88)), url("/backgrounds/warehouse_bg.webp")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Dynamic Water Caustic Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-25 z-0"
        style={{
          background: 'radial-gradient(circle at 50% 20%, rgba(56, 189, 248, 0.18) 0%, transparent 70%)',
        }}
      />

      {/* ------------------ TOP NAVIGATION HUD BAR ------------------ */}
      {/* Notice: As requested by the user, the top-left resource bar is completely removed! */}
      <div className="w-full px-4 py-3 flex items-center justify-between z-20 relative">
        {/* Empty left spacer so title and top-right elements align cleanly */}
        <div className="w-12 sm:w-20" />

        {/* Right Corner Info & Exit Button (مخزن السمك 31 + السعة + زر خروج) */}
        <div className="flex items-center gap-2.5">
          <div 
            className="px-3.5 py-1.5 rounded-xl border border-sky-500/40 flex flex-col items-center justify-center shadow-lg"
            style={{
              background: 'linear-gradient(180deg, rgba(8, 47, 85, 0.85) 0%, rgba(3, 20, 45, 0.95) 100%)',
              boxShadow: '0 0 15px rgba(56, 189, 248, 0.25)'
            }}
          >
            <span className="text-sky-300 font-black text-xs sm:text-sm">مخزن السمك {building.level}</span>
            <span className="text-[10.5px] text-sky-100 font-bold">{totalFishCount.toLocaleString()} / {building.capacity.toLocaleString()}</span>
          </div>

          <button 
            onClick={onClose} 
            className="px-3 py-1.5 rounded-xl border border-amber-400/80 text-amber-300 hover:text-white flex items-center gap-1.5 text-xs sm:text-sm font-black transition-all active:scale-95 shadow-lg"
            style={{
              background: 'linear-gradient(180deg, #78350f 0%, #451a03 100%)',
              boxShadow: '0 0 12px rgba(245, 158, 11, 0.3)'
            }}
            title="الرجوع إلى الميناء"
          >
            <span>خروج</span>
            <span className="text-base">➔</span>
          </button>
        </div>
      </div>

      {/* ------------------ MAIN FISH STORAGE CONTENT (SCREEN 1) ------------------ */}
      {!selectedFish && (
        <div className="flex-1 overflow-y-auto px-3 sm:px-5 pb-2 flex flex-col justify-between max-w-4xl mx-auto w-full relative z-10 no-scrollbar">
          
          {/* 1. GRAND 3D ROYAL EMBLEM ("مخزن السمك - ملوك الأعماق") */}
          <div className="relative w-full flex flex-col items-center mb-3">
            <div className="relative flex flex-col items-center justify-center">
              {/* Glowing Crown on Top */}
              <div className="relative z-10 -mb-2 filter drop-shadow-[0_0_14px_rgba(250,204,21,0.9)]">
                <span className="text-3xl sm:text-4xl">👑</span>
              </div>

              {/* Ornate Royal Shield Frame */}
              <div 
                className="relative px-8 sm:px-14 py-2 sm:py-2.5 rounded-2xl flex flex-col items-center justify-center border-2 border-amber-400 shadow-[0_8px_32px_rgba(0,0,0,0.95)]"
                style={{
                  background: 'radial-gradient(circle at center, #0284c7 0%, #0369a1 40%, #082847 75%, #03101f 100%)',
                  boxShadow: '0 0 25px rgba(56, 189, 248, 0.7), inset 0 0 18px rgba(250, 204, 21, 0.35)'
                }}
              >
                {/* 3D Fish Silhouette Icon */}
                <div className="text-2xl sm:text-3xl filter drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] -mt-1 mb-0.5">
                  🐟
                </div>

                {/* Main Title: مخزن السمك */}
                <h1 
                  className="text-2xl sm:text-3xl font-black text-amber-300 tracking-wide"
                  style={{
                    textShadow: '0 3px 8px rgba(0,0,0,0.95), 0 0 15px rgba(250, 204, 21, 0.6)',
                  }}
                >
                  مخزن السمك
                </h1>

                {/* Subtitle: •— ملوك الأعماق —• */}
                <div 
                  className="text-xs sm:text-sm font-bold text-sky-300 tracking-wider flex items-center gap-1 -mt-0.5"
                  style={{
                    textShadow: '0 0 10px rgba(56, 189, 248, 0.8)'
                  }}
                >
                  <span>•—</span>
                  <span>ملوك الأعماق</span>
                  <span>—•</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. FISH INVENTORY GRID */}
          <div className="w-full flex-1 mb-2">
            {Object.keys(displayInventory).length === 0 ? (
              <div className="w-full py-16 px-4 flex flex-col items-center justify-center text-center">
                <div 
                  className="w-20 h-20 rounded-full border-2 border-sky-400/40 flex items-center justify-center text-4xl mb-3 shadow-lg"
                  style={{
                    background: 'radial-gradient(circle, rgba(14, 116, 144, 0.3) 0%, rgba(2, 6, 23, 0.8) 100%)',
                    boxShadow: '0 0 25px rgba(56, 189, 248, 0.25)'
                  }}
                >
                  <span>🐟</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-sky-200 mb-1.5 drop-shadow">
                  مخزن الأسماك فارغ حالياً
                </h3>
                <p className="text-xs sm:text-sm text-sky-300/70 max-w-xs leading-relaxed">
                  لا توجد أسماك في المخزن الآن. أرسل سفنك في رحلات صيد في الميناء لجلب الأسماك وملء المخزن!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3.5">
                {Object.entries(displayInventory).map(([name, count]) => {
                  const spec = getFishVisualSpec(name);
                  return (
                    <div 
                      key={name}
                      onClick={() => handleSelectFish(name)}
                      className={`relative rounded-xl p-2.5 sm:p-3 flex flex-col items-center justify-between cursor-pointer transition-all duration-200 hover:scale-[1.03] active:scale-95 ${spec.cardBorder}`}
                      style={{
                        background: spec.bgGlow,
                        minHeight: '155px',
                      }}
                    >
                      {/* Top Rarity Badge */}
                      <div className={`px-2.5 py-0.5 rounded-full text-xs font-black ${spec.rarityStyle}`}>
                        {spec.rarity}
                      </div>

                      {/* Fish Graphic / Emoji Illustration */}
                      <div className="my-1.5 flex items-center justify-center text-4xl sm:text-5xl filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)]">
                        <span>{spec.symbol}</span>
                      </div>

                      {/* Fish Name */}
                      <div className="text-white text-center text-sm sm:text-base font-black mb-1.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] truncate w-full">
                        {name}
                      </div>

                      {/* Bottom Quantity Pill */}
                      <div 
                        className="w-full py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 border border-sky-400/30"
                        style={{
                          background: 'rgba(2, 6, 23, 0.75)',
                          backdropFilter: 'blur(4px)',
                        }}
                      >
                        <span className="text-sm">🐟</span>
                        <span className="text-xs sm:text-sm font-black text-sky-200">
                          x {count.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. BOTTOM CAPACITY & ACTIONS CONTROL BAR */}
          <div className="w-full mt-auto pt-2 pb-3 flex flex-col gap-2.5">
            {/* Capacity Progress Subsection */}
            <div 
              className="w-full px-3.5 py-2.5 rounded-xl border border-sky-500/40 flex items-center justify-between gap-3 shadow-lg"
              style={{
                background: 'linear-gradient(90deg, rgba(8, 47, 85, 0.85) 0%, rgba(3, 20, 45, 0.95) 100%)',
              }}
            >
              {/* Chest Icon in Blue Frame */}
              <div className="w-10 h-10 rounded-lg bg-sky-950 border border-sky-400 flex items-center justify-center text-xl shadow-[0_0_10px_rgba(56,189,248,0.35)] shrink-0">
                📦
              </div>

              {/* Capacity Labels & Progress Bar */}
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex justify-between items-center text-sm font-black">
                  <span className="text-sky-200">سعة المخزن</span>
                  <span className="text-amber-300">{totalFishCount.toLocaleString()} / {building.capacity.toLocaleString()}</span>
                </div>
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-sky-800/60 p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-sky-400 to-cyan-300 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(56,189,248,0.8)]"
                    style={{ width: `${Math.min(100, Math.max(0, (totalFishCount / building.capacity) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Upgrade Capacity Button */}
              <button 
                onClick={() => setShowConfirmUpgrade(true)}
                className="px-3.5 py-2.5 rounded-xl font-black text-xs sm:text-sm text-slate-950 flex items-center gap-1 border border-amber-300 shadow-md transition-all active:scale-95 shrink-0"
                style={{
                  background: 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)',
                  boxShadow: '0 0 10px rgba(245, 158, 11, 0.4)'
                }}
              >
                <span>⬆️</span>
                <span>زيادة السعة</span>
              </button>
            </div>

            {/* Bottom Twin Royal Action Buttons */}
            <div className="w-full grid grid-cols-2 gap-3">
              {/* Button 1: بيع الأسماك (Blue Gradient) */}
              <button 
                onClick={() => {
                  if (totalFishCount > 0) setShowConfirmSellAll(true);
                }}
                disabled={totalFishCount <= 0}
                className={`py-3.5 px-4 rounded-xl font-black text-base sm:text-lg flex items-center justify-center gap-2 border-2 text-white shadow-xl transition-all ${
                  totalFishCount > 0 
                    ? 'border-sky-400 active:scale-[0.98] cursor-pointer' 
                    : 'border-slate-700 opacity-40 cursor-not-allowed'
                }`}
                style={{
                  background: totalFishCount > 0 
                    ? 'linear-gradient(180deg, #0284c7 0%, #0369a1 100%)' 
                    : 'rgba(30, 41, 59, 0.6)',
                  boxShadow: totalFishCount > 0 ? '0 4px 16px rgba(2, 132, 199, 0.45)' : 'none'
                }}
              >
                <span className="text-xl">🗑️</span>
                <span>بيع الأسماك</span>
              </button>

              {/* Button 2: إدارة المخزن (Gold Gradient) */}
              <button 
                onClick={() => {
                  const first = Object.keys(displayInventory)[0];
                  if (first) handleSelectFish(first);
                }}
                disabled={totalFishCount <= 0}
                className={`py-3.5 px-4 rounded-xl font-black text-base sm:text-lg flex items-center justify-center gap-2 border-2 text-slate-950 shadow-xl transition-all ${
                  totalFishCount > 0 
                    ? 'border-amber-300 active:scale-[0.98] cursor-pointer' 
                    : 'border-slate-700 opacity-40 cursor-not-allowed text-slate-400'
                }`}
                style={{
                  background: totalFishCount > 0 
                    ? 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)' 
                    : 'rgba(30, 41, 59, 0.6)',
                  boxShadow: totalFishCount > 0 ? '0 4px 16px rgba(245, 158, 11, 0.45)' : 'none'
                }}
              >
                <span className="text-lg">🐟</span>
                <span>إدارة المخزن</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------ SCREEN 2: FISH MARKET & PRICE GRAPH ------------------ */}
      {selectedFish && !showReceipt && (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-between max-w-md mx-auto w-full relative z-10">
          
          {/* Header Close Button (X) */}
          <button 
            onClick={() => setSelectedFish(null)}
            className="absolute top-2 right-2 z-30 bg-rose-600 hover:bg-rose-500 text-white w-8 h-8 rounded-full border-2 border-white/60 font-bold flex items-center justify-center shadow-lg transition-all active:scale-90"
          >
            ✕
          </button>

          {/* Top Fish Badge */}
          <div className="w-full bg-gradient-to-r from-sky-900/90 via-sky-800/90 to-sky-900/90 border-2 border-sky-400/60 rounded-3xl p-5 text-center mt-6 shadow-xl relative overflow-hidden">
            <div className="w-24 h-24 mx-auto bg-sky-950/80 border-2 border-sky-300/80 rounded-full flex items-center justify-center text-5xl shadow-inner mb-2.5">
              {getFishVisualSpec(selectedFish).symbol}
            </div>
            <div className="bg-sky-950/90 text-sky-200 border border-sky-400/60 inline-block px-7 py-1.5 rounded-full font-black text-lg shadow-sm">
              {selectedFish}
            </div>
          </div>

          {/* Status Row */}
          <div className="w-full flex items-center justify-between gap-2.5 my-3.5 text-base font-extrabold">
            <div className="flex items-center gap-2 bg-slate-900/95 border border-amber-500/50 px-3.5 py-2.5 rounded-xl text-amber-300 text-sm sm:text-base">
              <span className="text-lg">⏱️</span>
              <span className="font-mono font-bold tracking-wider">{freezeTimer}</span>
              <span className="bg-emerald-600 text-white text-xs font-black px-2 py-0.5 rounded-md mr-1">10H</span>
            </div>

            <div className="bg-sky-950/95 border border-sky-400/50 text-sky-300 px-4 py-2.5 rounded-xl text-sm sm:text-base font-black">
              الجودة: {isFrozen ? '100% (مجمد)' : '100%'}
            </div>

            <button 
              onClick={() => setIsFrozen(!isFrozen)}
              className={`px-5 py-2.5 rounded-xl text-sm sm:text-base font-black transition-all border active:scale-95 shadow-md ${
                isFrozen 
                  ? 'bg-sky-600 border-sky-300 text-white shadow-sky-500/40' 
                  : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-300 text-white'
              }`}
            >
              {isFrozen ? '❄️ مجمد' : 'تجميد'}
            </button>
          </div>

          {/* Price Market Chart ("سعر السوق") - Enlarge & Clarify */}
          <div className="w-full bg-slate-900/95 border-2 border-amber-400/70 rounded-2xl p-4 sm:p-5 shadow-2xl relative my-2">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">📊</span>
                <span className="text-amber-300 font-black text-base sm:text-lg tracking-wide">سعر السوق</span>
              </div>
              <span className="text-rose-400 font-black text-xs sm:text-sm px-3 py-1 bg-rose-950/80 border border-rose-500/50 rounded-full flex items-center gap-1 shadow-sm">
                <span className="animate-pulse">🔥</span> مباشر
              </span>
            </div>

            {/* SVG Line Graph with enhanced contrast and enlarged labels */}
            <div className="w-full h-44 sm:h-52 relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 320 140">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0.05" />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#38bdf8" floodOpacity="0.6"/>
                  </filter>
                </defs>

                {/* Horizontal Grid lines */}
                <line x1="32" y1="25" x2="310" y2="25" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="32" y1="65" x2="310" y2="65" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="32" y1="105" x2="310" y2="105" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />

                {/* Y-axis Labels with larger, bolder font */}
                <text x="26" y="29" fill="#cbd5e1" fontSize="12" fontWeight="800" textAnchor="end">2.45$</text>
                <text x="26" y="69" fill="#cbd5e1" fontSize="12" fontWeight="800" textAnchor="end">2.30$</text>
                <text x="26" y="109" fill="#cbd5e1" fontSize="12" fontWeight="800" textAnchor="end">2.15$</text>

                {/* Filled Area */}
                <polygon 
                  points="35,120 35,28 62,31 90,40 120,95 152,45 184,82 216,58 250,70 275,48 305,108 305,120" 
                  fill="url(#chartGradient)" 
                />

                {/* Line Path */}
                <path 
                  d="M 35 28 L 62 31 L 90 40 L 120 95 L 152 45 L 184 82 L 216 58 L 250 70 L 275 48 L 305 108" 
                  fill="none" 
                  stroke="#38bdf8" 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  filter="url(#glow)"
                />

                {/* Key Data Dots & Price Labels with background badges for sharp readability */}
                {[
                  { x: 35, y: 28, label: '2.44' },
                  { x: 62, y: 31, label: '2.43' },
                  { x: 90, y: 40, label: '2.39' },
                  { x: 120, y: 95, label: '2.12' },
                  { x: 152, y: 45, label: '2.35' },
                  { x: 184, y: 82, label: '2.17' },
                  { x: 275, y: 48, label: '2.35' },
                  { x: 305, y: 108, label: '2.12' },
                ].map((pt, i) => (
                  <g key={i}>
                    {/* Badge background pill */}
                    <rect 
                      x={pt.x - 14} 
                      y={pt.y - 18} 
                      width="28" 
                      height="13" 
                      rx="3.5" 
                      fill="#09111e" 
                      stroke="#38bdf8" 
                      strokeWidth="1" 
                    />
                    <circle cx={pt.x} cy={pt.y} r="4" fill="#facc15" stroke="#0284c7" strokeWidth="2" />
                    <text 
                      x={pt.x} 
                      y={pt.y - 8} 
                      fill="#fef08a" 
                      fontSize="10" 
                      fontWeight="900" 
                      textAnchor="middle"
                    >
                      {pt.label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            {/* X-axis Hours Labels */}
            <div className="flex justify-between items-center text-xs sm:text-sm font-black text-amber-200/90 mt-2 border-t border-slate-700/80 pt-2 px-1">
              <span>5 pm</span>
              <span>6 pm</span>
              <span>7 pm</span>
              <span>8 pm</span>
              <span>9 pm</span>
              <span>10 pm</span>
              <span>11 pm</span>
              <span>12 am</span>
              <span>1 am</span>
              <span>2 am</span>
              <span>3 am</span>
              <span>4 am</span>
            </div>
          </div>

          {/* Quantity Controls & Earned Gold Display */}
          <div className="w-full bg-slate-900/95 border border-slate-700/80 rounded-2xl p-4 sm:p-5 my-2.5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-base sm:text-lg font-black text-slate-200">كمية البيع:</span>
              <span className="text-base sm:text-lg font-black text-sky-300 bg-sky-950 px-4 py-1.5 rounded-xl border border-sky-400/40">
                {sellAmount.toLocaleString()} / {(displayInventory[selectedFish] || 0).toLocaleString()}
              </span>
            </div>

            <input 
              type="range"
              min="1"
              max={displayInventory[selectedFish] || 1}
              value={sellAmount}
              onChange={(e) => setSellAmount(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-3 bg-slate-950 rounded-lg my-2"
            />

            <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-slate-800">
              <span className="text-base sm:text-lg text-slate-200 font-extrabold">العائد المتوقع:</span>
              <span className="text-xl sm:text-2xl font-black text-amber-400 flex items-center gap-1.5">
                <span className="text-2xl">🪙</span>
                <span>{(Math.round(sellAmount * getFishUnitVal(selectedFish))).toLocaleString()}</span>
              </span>
            </div>
          </div>

          {/* Sell Button */}
          <button 
            onClick={handleInitiateSell}
            className="w-full py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-2xl shadow-xl border-2 border-amber-300 text-2xl transition-all active:scale-95"
          >
            بيع
          </button>
        </div>
      )}

      {/* ------------------ SCREEN 3: FINAL SALE RECEIPT MODAL ------------------ */}
      {showReceipt && receiptData && (
        <div className="fixed inset-0 z-[150] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-3 border-amber-400 rounded-3xl p-6 sm:p-8 max-w-md w-[95%] text-center shadow-[0_0_50px_rgba(245,158,11,0.25)] animate-in zoom-in-95 font-['Cairo',_sans-serif]" dir="rtl">
            
            <h3 className="text-amber-300 font-black text-2xl sm:text-3xl mb-4 border-b-2 border-amber-500/40 pb-3">
              السعر النهائي
            </h3>

            {/* Banner Illustration */}
            <div className="bg-gradient-to-r from-amber-950/90 via-sky-950/90 to-amber-950/90 border-2 border-amber-500/50 rounded-2xl p-4 sm:p-5 mb-4 relative overflow-hidden">
              <div className="text-4xl sm:text-5xl mb-2 flex justify-center items-center gap-3">
                <span>🌕</span>
                <span>⚓</span>
                <span>🏴‍☠️</span>
              </div>
              <div className="text-base sm:text-lg font-black text-amber-300">ملاحظات سوق الميناء</div>
            </div>

            {/* Star Rating */}
            <div className="flex justify-center gap-2 text-3xl sm:text-4xl mb-4">
              <span className="text-amber-400 drop-shadow">⭐</span>
              <span className="text-amber-400 drop-shadow">⭐</span>
              <span className="text-slate-600">★</span>
            </div>

            {/* Receipt Breakdown */}
            <div className="bg-slate-950/90 border-2 border-slate-800 rounded-2xl p-4 sm:p-5 text-base sm:text-lg flex flex-col gap-3.5 mb-4">
              <div className="flex justify-between items-center text-slate-200">
                <span className="font-bold">السعر الإجمالي:</span>
                <span className="font-black text-amber-300 text-lg sm:text-xl">{receiptData.basePrice.toLocaleString()} ذهب</span>
              </div>
              <div className="flex justify-between items-center text-slate-200">
                <span className="font-bold">صلاحية السمك:</span>
                <span className="font-black text-rose-400 text-base sm:text-lg">-{receiptData.freshnessPenalty} ذهب</span>
              </div>
              <div className="flex justify-between items-center text-lg sm:text-xl pt-3 border-t-2 border-slate-800/80 font-black">
                <span className="text-slate-100">الدخل:</span>
                <span className="text-emerald-400 text-2xl sm:text-3xl font-black">{receiptData.finalIncome.toLocaleString()} ذهب</span>
              </div>
            </div>

            {/* Note box from game port market */}
            <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-3.5 sm:p-4 text-amber-100 text-xs sm:text-sm font-bold leading-relaxed mb-5 text-center shadow-inner">
              لقد بعت سمكك بسعر متوسط، لحسن حظك أن سمكك مازال طازجاً، مازال لديك فرصة في الحصول على أرباح قليلة.
            </div>

            {/* Main Action Button */}
            <button 
              onClick={handleFinalizeSell}
              className="w-full py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-black rounded-2xl shadow-xl border-2 border-amber-300 transition-all active:scale-95 text-xl sm:text-2xl"
            >
              الرئيسية
            </button>
          </div>
        </div>
      )}

      {/* ------------------ SELL ALL CONFIRMATION MODAL ------------------ */}
      {showConfirmSellAll && (
        <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-3 border-amber-400/90 rounded-3xl p-6 sm:p-7 max-w-md w-[95%] text-center shadow-2xl font-['Cairo',_sans-serif] animate-in zoom-in-95" dir="rtl">
            <div className="w-18 h-18 mx-auto bg-amber-500/20 border-2 border-amber-400 rounded-full flex items-center justify-center text-4xl mb-3 shadow-inner">
              💰
            </div>
            <h4 className="text-amber-400 font-black text-2xl mb-2">بيع كل الأسماك</h4>
            <p className="text-slate-200 text-base mb-4 font-bold">
              هل أنت متأكد من رغبتك في بيع جميع الأسماك الموجودة بالمخزن دفعة واحدة؟
            </p>
            
            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 text-base flex flex-col gap-2.5 mb-5">
              <div className="flex justify-between items-center text-slate-300">
                <span>إجمالي الأسماك:</span>
                <span className="font-black text-sky-300 text-lg">{totalFishCount.toLocaleString()} سمكة</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>أنواع الأسماك:</span>
                <span className="font-black text-amber-200 text-lg">{Object.keys(displayInventory).length} أنواع</span>
              </div>
              <div className="flex justify-between items-center pt-2.5 border-t border-slate-800 text-lg font-black">
                <span className="text-slate-200">العائد الإجمالي:</span>
                <span className="text-emerald-400 text-2xl font-black flex items-center gap-1.5">
                  <span>+{totalSellAllValue.toLocaleString()}</span>
                  <span className="text-amber-300 text-xl">🪙</span>
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmSellAll(false);
                  if (onSellAllFish) {
                    onSellAllFish(totalSellAllValue);
                  } else {
                    Object.entries(displayInventory).forEach(([fName, count]) => {
                      const numericCount = Number(count) || 0;
                      onSellFish(fName, numericCount, Math.round(numericCount * getFishUnitVal(fName)));
                    });
                  }
                  setReceiptData({
                    fishName: 'جميع أسماك المخزن',
                    amount: totalFishCount,
                    basePrice: totalSellAllValue,
                    freshnessPenalty: 0,
                    finalIncome: totalSellAllValue,
                    stars: 3,
                  });
                  setShowReceipt(true);
                }}
                className="flex-1 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95 text-lg flex items-center justify-center gap-2"
              >
                <span>تأكيد البيع</span>
                <span>💰</span>
              </button>
              <button
                onClick={() => setShowConfirmSellAll(false)}
                className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl transition-all active:scale-95 text-lg"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------ UPGRADE CONFIRMATION MODAL ------------------ */}
      {showConfirmUpgrade && (
        <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-3 border-amber-400 rounded-3xl p-6 sm:p-8 max-w-md w-[95%] text-center shadow-2xl font-['Cairo',_sans-serif]" dir="rtl">
            <h4 className="text-amber-300 font-black text-2xl sm:text-3xl mb-3">ترقية سوق السمك</h4>
            <p className="text-slate-200 text-base sm:text-lg mb-4 font-bold leading-relaxed">
              هل تريد بدء ترقية سوق السمك إلى المستوى {building.level + 1}؟
            </p>
            <div className="text-sm sm:text-base font-black text-amber-200 bg-amber-950/60 p-4 rounded-2xl border-2 border-amber-500/40 mb-6 shadow-inner">
              التكلفة: {building.cost.toLocaleString()} 🪙 ذهب | السعة الجديدة: {building.nextCapacity.toLocaleString()}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmUpgrade(false);
                  onUpgrade();
                }}
                className="flex-1 py-3.5 sm:py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95 text-lg sm:text-xl"
              >
                ترقية
              </button>
              <button
                onClick={() => setShowConfirmUpgrade(false)}
                className="flex-1 py-3.5 sm:py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl transition-all active:scale-95 text-lg sm:text-xl"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FishHouseComponent;
