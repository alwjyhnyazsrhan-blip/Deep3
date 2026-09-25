import React, { useState, useMemo } from 'react';
import { FISH_REWARD_DATA, getFishHouseImageUrl, GOLD_COIN_ICON, getFishHouseCapacity } from '../data';

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

const FishHouseComponent: React.FC<FishHouseComponentProps> = ({ 
  userLevel, 
  gold = 0,
  gems = 0,
  redGems = 0,
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
  const [freezeTimer, setFreezeTimer] = useState<string>('23:56:34');
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

  // Filter available fish from inventory
  const displayInventory = useMemo(() => {
    const validItems: Record<string, number> = {};
    Object.entries(fishInventory).forEach(([name, count]) => {
      if (typeof count === 'number' && count > 0) {
        validItems[name] = count;
      }
    });

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

  // Helper for fish icon
  const getFishIcon = (name: string) => {
    if (FISH_REWARD_DATA[name]?.emoji) return FISH_REWARD_DATA[name].emoji;
    const clean = name.replace(/^ال/, '').trim();
    if (FISH_REWARD_DATA[clean]?.emoji) return FISH_REWARD_DATA[clean].emoji;
    if (name.includes('قرش') || name.includes('مارلن') || name.includes('براكودا')) return '🦈';
    if (name.includes('حوت') || name.includes('أوركا')) return '🐋';
    if (name.includes('أخطبوط') || name.includes('كراكن') || name.includes('حبار')) return '🐙';
    if (name.includes('روبيان')) return '🦐';
    if (name.includes('سلطعون') || name.includes('كركند')) return '🦀';
    return '🐟';
  };

  // Generated price history chart data for Screen 2
  const chartData = useMemo(() => {
    if (!selectedFish) return [];
    const baseVal = getFishUnitVal(selectedFish);
    const times = ['5 pm', '6 pm', '7 pm', '8 pm', '9 pm', '10 pm', '11 pm', '12 am', '1 am', '2 am', '3 am', '4 am'];
    const multipliers = [1.02, 1.01, 0.99, 0.88, 0.98, 0.90, 0.95, 0.92, 0.89, 0.97, 0.94, 0.86];
    
    return times.map((time, idx) => {
      const val = (baseVal * multipliers[idx]).toFixed(2);
      return { time, val: parseFloat(val) };
    });
  }, [selectedFish]);

  // Current market price per fish unit
  const currentPricePerUnit = chartData.length > 0 ? chartData[chartData.length - 1].val : (selectedFish ? getFishUnitVal(selectedFish) : 2.44);

  // Calculated sell income
  const totalEarnedGold = Math.round(sellAmount * currentPricePerUnit);

  // Trigger sell process -> opens receipt modal
  const handleInitiateSell = () => {
    if (!selectedFish || sellAmount <= 0) return;
    const basePrice = Math.round(sellAmount * getFishUnitVal(selectedFish));
    const freshnessPenalty = isFrozen ? 0 : 0;
    const finalIncome = totalEarnedGold;

    setReceiptData({
      fishName: selectedFish,
      amount: sellAmount,
      basePrice,
      freshnessPenalty,
      finalIncome,
      stars: finalIncome >= basePrice ? 3 : 2,
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
    <div className="fixed inset-0 z-[120] bg-slate-950/90 backdrop-blur-md flex flex-col justify-between text-white font-['Cairo',_sans-serif] overflow-hidden" dir="rtl">
      
      {/* ------------------ TOP NAVIGATION HUD BAR ------------------ */}
      <div className="w-full bg-slate-900/90 border-b border-amber-500/30 px-4 py-2.5 flex items-center justify-between shadow-md z-20">
        
        {/* Right side: Back / Close button */}
        <button 
          onClick={onClose} 
          className="bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 p-2 rounded-xl border border-amber-500/40 flex items-center gap-1 text-sm font-bold transition-all active:scale-95"
          title="الرجوع إلى الميناء"
        >
          <span className="text-lg">➔</span>
          <span className="hidden sm:inline">خروج</span>
        </button>

        {/* Center: Main Title Badge */}
        <div className="bg-sky-900/80 border-2 border-sky-400/60 rounded-xl px-4 py-1 text-center shadow-lg backdrop-blur-sm">
          <div className="text-sky-200 font-extrabold text-sm sm:text-base flex items-center justify-center gap-1.5">
            <span>مخزن السمك</span>
            <span className="text-amber-400">lvl {building.level}</span>
          </div>
          <div className="text-[11px] text-sky-300/90 font-bold">
            {totalFishCount.toLocaleString()} / {building.capacity.toLocaleString()} السعة
          </div>
        </div>

        {/* Left side: Resources Bar */}
        <div className="flex items-center gap-3 bg-slate-950/85 px-3.5 py-1.5 rounded-xl border border-slate-700/80 text-sm font-extrabold">
          <div className="flex items-center gap-1.5 text-amber-400">
            <img src={GOLD_COIN_ICON} alt="ذهب" className="w-6 h-6 object-contain inline-block" />
            <span>{gold.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 text-sky-400 border-r border-slate-700 pr-2">
            <span>💠</span>
            <span>{gems}</span>
          </div>
          {redGems > 0 && (
            <div className="flex items-center gap-1 text-rose-400 border-r border-slate-700 pr-2">
              <span>💎</span>
              <span>{redGems}</span>
            </div>
          )}
        </div>
      </div>

      {/* ------------------ MAIN CONTENT AREA (SCREEN 1) ------------------ */}
      {!selectedFish && (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between max-w-2xl mx-auto w-full relative">
          
          {/* Background Pirate Atmosphere */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500 via-sky-900 to-black" />

          {/* Fish Inventory Grid */}
          <div className="relative z-10 my-auto">
            <h3 className="text-amber-400 font-extrabold text-center text-base sm:text-lg mb-4 flex items-center justify-center gap-2 bg-slate-900/70 py-2 rounded-xl border border-amber-500/30">
              <span className="text-xl">🐟</span> اختر نوع السمك للبيع أو المعاينة
            </h3>

            {Object.keys(displayInventory).length === 0 ? (
              <div className="bg-slate-900/90 border-2 border-dashed border-amber-500/30 rounded-2xl p-8 text-center my-4 shadow-xl">
                <div className="text-5xl mb-3">📦 ⚓</div>
                <h4 className="text-amber-400 font-bold text-lg mb-1">المخزن فارغ حالياً</h4>
                <p className="text-slate-300 text-sm leading-relaxed max-w-xs mx-auto">
                  أرسل سفنك للصيد من الميناء، وعند اصتياد الأسماك واختيار "جمع" ستضاف حصيلتك من الأسماك إلى المخزن لبيعها هنا في السوق!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {Object.entries(displayInventory).map(([name, count]) => (
                  <div 
                    key={name}
                    onClick={() => handleSelectFish(name)}
                    className="group relative bg-gradient-to-b from-slate-800/90 to-slate-900/95 border-2 border-sky-500/40 hover:border-amber-400 rounded-2xl p-4 flex flex-col items-center justify-between shadow-xl cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    {/* Quantity Badge Top Right */}
                    <div className="absolute top-2 right-2 bg-sky-950/90 border border-sky-400/50 text-sky-200 text-sm font-black px-3 py-1 rounded-lg shadow-sm">
                      X{count.toLocaleString()}
                    </div>

                    {/* Fish Icon / Illustration */}
                    <div className="my-3 text-5xl sm:text-6xl group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_4px_10px_rgba(56,189,248,0.3)]">
                      {getFishIcon(name)}
                    </div>

                    {/* Fish Name Badge */}
                    <div className="w-full bg-slate-950/80 border border-slate-700 group-hover:border-amber-400/60 text-amber-300 text-center text-sm font-extrabold py-2 rounded-xl transition-colors">
                      {name}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Capacity Progress Bar */}
            <div className="mt-6 bg-slate-900/90 border border-amber-500/30 p-4 rounded-2xl shadow-lg">
              <div className="flex justify-between items-center text-sm font-extrabold mb-1.5">
                <span className="text-amber-400">سعة المخزن الإجمالية</span>
                <span className="text-slate-200">{totalFishCount.toLocaleString()} / {building.capacity.toLocaleString()}</span>
              </div>
              <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-sky-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                  style={{ width: `${Math.min(100, Math.max(4, (totalFishCount / building.capacity) * 100))}%` }}
                />
              </div>
            </div>

            {/* زر بيع الكل - تحت شريط سعة المخزن الإجمالية تماماً */}
            <div className="mt-3 w-full">
              <button 
                id="sell-all-fish-btn"
                onClick={() => {
                  if (totalFishCount === 0) return;
                  setShowConfirmSellAll(true);
                }}
                disabled={totalFishCount === 0}
                className={`w-full py-3.5 px-4 rounded-2xl font-black text-base sm:text-lg flex items-center justify-between shadow-xl border-2 transition-all active:scale-[0.98] ${
                  totalFishCount > 0
                    ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 border-amber-300 shadow-amber-950/60 cursor-pointer'
                    : 'bg-slate-900/60 text-slate-500 border-slate-800/80 cursor-not-allowed opacity-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💰</span>
                  <span>بيع الكل</span>
                  {totalFishCount > 0 && (
                    <span className="text-xs bg-slate-950/20 px-2.5 py-0.5 rounded-md font-bold text-slate-900">
                      {totalFishCount.toLocaleString()} سمكة
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-sm sm:text-base font-black">
                  <span>{totalSellAllValue.toLocaleString()}</span>
                  <span className="text-lg">🪙</span>
                </div>
              </button>
            </div>
          </div>

          {/* Bottom Bar: Upgrade Button & Stat Timer */}
          <div className="relative z-10 mt-4 bg-slate-900/95 border-t border-amber-500/30 p-3 rounded-2xl flex items-center justify-between gap-3 shadow-2xl">
            <button 
              onClick={() => setShowConfirmUpgrade(true)}
              className="flex-1 py-3.5 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-xl shadow-lg border border-amber-300 transition-all active:scale-95 text-center text-base flex items-center justify-center gap-2"
            >
              <span>ترقية</span>
              <span className="text-xs bg-slate-950/20 px-2 py-0.5 rounded-md font-bold">lvl {building.level + 1}</span>
            </button>

            <div className="bg-slate-950/90 border border-amber-500/30 px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-extrabold text-amber-300">
              <span className="text-lg">🪙</span>
              <span>7,937</span>
              <span className="text-slate-500">|</span>
              <span className="text-sky-300">⏱️ 07:30</span>
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
          <div className="w-full bg-gradient-to-r from-sky-900/90 via-sky-800/90 to-sky-900/90 border-2 border-sky-400/60 rounded-3xl p-4 text-center mt-6 shadow-xl relative overflow-hidden">
            <div className="w-20 h-20 mx-auto bg-sky-950/80 border-2 border-sky-300/80 rounded-full flex items-center justify-center text-4xl shadow-inner mb-2">
              {getFishIcon(selectedFish)}
            </div>
            <div className="bg-sky-950/90 text-sky-200 border border-sky-400/50 inline-block px-6 py-1 rounded-full font-black text-base shadow-sm">
              {selectedFish}
            </div>
          </div>

          {/* Status Row */}
          <div className="w-full flex items-center justify-between gap-2 my-3 text-sm font-extrabold">
            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-amber-500/40 px-3 py-2 rounded-xl text-amber-300">
              <span className="text-base">⏱️</span>
              <span>{freezeTimer}</span>
              <span className="bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-md mr-1">10H</span>
            </div>

            <div className="bg-sky-950/90 border border-sky-400/40 text-sky-300 px-3.5 py-2 rounded-xl">
              الجودة: {isFrozen ? '100% (مجمد)' : '100%'}
            </div>

            <button 
              onClick={() => setIsFrozen(!isFrozen)}
              className={`px-4 py-2 rounded-xl text-sm font-black transition-all border active:scale-95 ${
                isFrozen 
                  ? 'bg-sky-600 border-sky-300 text-white shadow-sky-500/30' 
                  : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-300 text-white'
              }`}
            >
              {isFrozen ? '❄️ مجمد' : 'تجميد'}
            </button>
          </div>

          {/* Price Market Chart ("سعر السوق") */}
          <div className="w-full bg-slate-900/90 border-2 border-amber-500/40 rounded-2xl p-3.5 shadow-2xl relative my-1">
            <div className="flex justify-between items-center mb-2">
              <span className="text-amber-400 font-extrabold text-sm sm:text-base">سعر السوق</span>
              <span className="text-emerald-400 font-bold text-xs sm:text-sm">مباشر 🔥</span>
            </div>

            {/* SVG Line Graph */}
            <div className="w-full h-36 relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 120">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                <line x1="20" y1="20" x2="280" y2="20" stroke="#334155" strokeDasharray="3 3" />
                <line x1="20" y1="50" x2="280" y2="50" stroke="#334155" strokeDasharray="3 3" />
                <line x1="20" y1="80" x2="280" y2="80" stroke="#334155" strokeDasharray="3 3" />

                {/* Y-axis Labels */}
                <text x="10" y="24" fill="#94a3b8" fontSize="10" textAnchor="end">2.45$</text>
                <text x="10" y="54" fill="#94a3b8" fontSize="10" textAnchor="end">2.30$</text>
                <text x="10" y="84" fill="#94a3b8" fontSize="10" textAnchor="end">2.15$</text>

                {/* Filled Area */}
                <polygon 
                  points="25,100 25,25 48,27 71,35 94,80 117,38 140,70 163,50 186,60 209,72 232,40 255,55 278,90 278,100" 
                  fill="url(#chartGradient)" 
                />

                {/* Line Path */}
                <path 
                  d="M 25 25 L 48 27 L 71 35 L 94 80 L 117 38 L 140 70 L 163 50 L 186 60 L 209 72 L 232 40 L 255 55 L 278 90" 
                  fill="none" 
                  stroke="#38bdf8" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />

                {/* Key Data Dots & Price Labels */}
                {[
                  { x: 25, y: 25, label: '2.44' },
                  { x: 48, y: 27, label: '2.43' },
                  { x: 71, y: 35, label: '2.39' },
                  { x: 94, y: 80, label: '2.12' },
                  { x: 117, y: 38, label: '2.35' },
                  { x: 140, y: 70, label: '2.17' },
                  { x: 232, y: 40, label: '2.35' },
                  { x: 278, y: 90, label: '2.12' },
                ].map((pt, i) => (
                  <g key={i}>
                    <circle cx={pt.x} cy={pt.y} r="3.5" fill="#facc15" stroke="#0284c7" strokeWidth="1.5" />
                    <text x={pt.x} y={pt.y - 6} fill="#facc15" fontSize="8.5" fontWeight="bold" textAnchor="middle">{pt.label}</text>
                  </g>
                ))}
              </svg>
            </div>

            {/* X-axis Hours Labels */}
            <div className="flex justify-between items-center text-[10.5px] font-bold text-slate-300 mt-1 border-t border-slate-800 pt-1">
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
          <div className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 my-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-extrabold text-slate-200">كمية البيع:</span>
              <span className="text-base font-black text-sky-300 bg-sky-950 px-3.5 py-1 rounded-lg border border-sky-400/40">
                {sellAmount.toLocaleString()} / {(displayInventory[selectedFish] || 0).toLocaleString()}
              </span>
            </div>

            <input 
              type="range"
              min="1"
              max={displayInventory[selectedFish] || 1}
              value={sellAmount}
              onChange={(e) => setSellAmount(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-2.5 bg-slate-950 rounded-lg my-1"
            />

            <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-800">
              <span className="text-sm text-slate-200 font-bold">العائد المتوقع:</span>
              <span className="text-lg font-black text-amber-400 flex items-center gap-1.5">
                <span className="text-xl">🪙</span>
                <span>{totalEarnedGold.toLocaleString()}</span>
              </span>
            </div>
          </div>

          {/* Sell Button */}
          <button 
            onClick={handleInitiateSell}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-2xl shadow-xl border-2 border-amber-300 text-xl transition-all active:scale-95"
          >
            بيع
          </button>
        </div>
      )}

      {/* ------------------ SCREEN 3: FINAL SALE RECEIPT MODAL ------------------ */}
      {showReceipt && receiptData && (
        <div className="fixed inset-0 z-[150] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500/80 rounded-3xl p-5 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 font-['Cairo',_sans-serif]" dir="rtl">
            
            <h3 className="text-amber-400 font-extrabold text-2xl mb-3 border-b border-amber-500/30 pb-2">
              السعر النهائي
            </h3>

            {/* Banner Illustration */}
            <div className="bg-gradient-to-r from-amber-950 via-sky-950 to-amber-950 border border-amber-500/40 rounded-2xl p-4 mb-3 relative overflow-hidden">
              <div className="text-4xl mb-1">🏴‍☠️ ⚓ 🪙</div>
              <div className="text-sm font-bold text-amber-300">ملاحظات سوق الميناء</div>
            </div>

            {/* Star Rating */}
            <div className="flex justify-center gap-1.5 text-2xl mb-3">
              <span className="text-amber-400">⭐</span>
              <span className="text-amber-400">⭐</span>
              <span className="text-slate-600">★</span>
            </div>

            {/* Receipt Breakdown */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-sm flex flex-col gap-2.5 mb-3">
              <div className="flex justify-between items-center text-slate-300">
                <span>السعر الإجمالي:</span>
                <span className="font-bold text-amber-300">{receiptData.basePrice.toLocaleString()} ذهب</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>صلاحية السمك:</span>
                <span className="font-bold text-rose-400">-{receiptData.freshnessPenalty} ذهب</span>
              </div>
              <div className="flex justify-between items-center text-base pt-2 border-t border-slate-800 font-extrabold">
                <span className="text-slate-200">الدخل:</span>
                <span className="text-emerald-400 text-lg font-black">{receiptData.finalIncome.toLocaleString()} ذهب</span>
              </div>
            </div>

            {/* Narrative Feedback */}
            <p className="text-xs text-slate-300 bg-amber-950/30 border border-amber-500/20 p-3 rounded-xl mb-4 leading-relaxed">
              لقد بعت سمكك بسعر متوسط، لحسن حظك أن سمكك مازال طازجاً، مازال لديك فرصة في الحصول على أرباح قليلة.
            </p>

            {/* Main Action Button */}
            <button 
              onClick={handleFinalizeSell}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-2xl shadow-lg border border-amber-300 transition-all active:scale-95 text-lg"
            >
              الرئيسية
            </button>
          </div>
        </div>
      )}

      {/* ------------------ SELL ALL CONFIRMATION MODAL ------------------ */}
      {showConfirmSellAll && (
        <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500/80 rounded-3xl p-5 max-w-sm w-full text-center shadow-2xl font-['Cairo',_sans-serif] animate-in zoom-in-95" dir="rtl">
            <div className="w-16 h-16 mx-auto bg-amber-500/20 border-2 border-amber-400 rounded-full flex items-center justify-center text-3xl mb-3 shadow-inner">
              💰
            </div>
            <h4 className="text-amber-400 font-extrabold text-xl mb-2">بيع كل الأسماك</h4>
            <p className="text-slate-200 text-sm mb-3">
              هل أنت متأكد من رغبتك في بيع جميع الأسماك الموجودة بالمخزن دفعة واحدة؟
            </p>
            
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 text-sm flex flex-col gap-2 mb-4">
              <div className="flex justify-between items-center text-slate-300">
                <span>إجمالي الأسماك:</span>
                <span className="font-extrabold text-sky-300">{totalFishCount.toLocaleString()} سمكة</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>أنواع الأسماك:</span>
                <span className="font-extrabold text-amber-200">{Object.keys(displayInventory).length} أنواع</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-base font-extrabold">
                <span className="text-slate-200">العائد الإجمالي:</span>
                <span className="text-emerald-400 text-lg font-black flex items-center gap-1">
                  <span>+{totalSellAllValue.toLocaleString()}</span>
                  <span className="text-amber-300">🪙</span>
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                id="confirm-sell-all-btn"
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
                className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black rounded-xl shadow-lg transition-all active:scale-95 text-base flex items-center justify-center gap-2"
              >
                <span>تأكيد البيع</span>
                <span>💰</span>
              </button>
              <button
                id="cancel-sell-all-btn"
                onClick={() => setShowConfirmSellAll(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all active:scale-95 text-base"
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
          <div className="bg-slate-900 border-2 border-amber-500/80 rounded-2xl p-5 max-w-sm w-full text-center shadow-2xl font-['Cairo',_sans-serif]" dir="rtl">
            <h4 className="text-amber-400 font-bold text-lg mb-2">ترقية سوق السمك</h4>
            <p className="text-slate-200 text-sm mb-3">
              هل تريد بدء ترقية سوق السمك إلى المستوى {building.level + 1}؟
            </p>
            <div className="text-xs text-amber-300 bg-amber-950/50 p-2.5 rounded-xl border border-amber-500/30 mb-4">
              التكلفة: {building.cost.toLocaleString()} 🪙 ذهب | السعة الجديدة: {building.nextCapacity.toLocaleString()}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmUpgrade(false);
                  onUpgrade();
                }}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-all active:scale-95"
              >
                ترقية
              </button>
              <button
                onClick={() => setShowConfirmUpgrade(false)}
                className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-xl transition-all active:scale-95"
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
