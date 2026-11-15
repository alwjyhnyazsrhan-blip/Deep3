import React, { useState } from 'react';
import { ShipState } from '../types';
import { FIXER_SMALL_ICON, FIXER_MEDIUM_ICON, FIXER_LARGE_ICON, FIXER_LEGENDARY_ICON } from '../data';
import ShipImage from './ShipImage';

interface ShipWorkshopModalProps {
  ship: ShipState;
  allShips: ShipState[];
  crewServices: {
    repairer_small?: number;
    repairer_medium?: number;
    repairer_large?: number;
    repairer_legendary?: number;
    [key: string]: any;
  };
  onClose: () => void;
  onRepair: (shipId: string, type: 'small' | 'medium' | 'large' | 'legendary' | 'gold' | 'gems') => void;
  onSelectShip?: (ship: ShipState) => void;
  gold: number;
  gems: number;
}

export const ShipWorkshopModal: React.FC<ShipWorkshopModalProps> = ({
  ship,
  allShips,
  crewServices,
  onClose,
  onRepair,
  onSelectShip,
  gold,
  gems
}) => {
  const [selectedShipId, setSelectedShipId] = useState<string>(ship.id);

  // Active ship in workshop
  const activeShip = allShips.find(s => s.id === selectedShipId) || ship;

  const maxH = activeShip.maxHeart || ((activeShip.level || 0) * 1000) + 10000;
  const curH = typeof activeShip.heart === 'number' ? Math.max(0, activeShip.heart) : maxH;
  const healthPct = Math.min(100, Math.max(0, Math.round((curH / maxH) * 100)));
  const hasDamage = curH < maxH;

  // Real crew count for each repairer from warehouse
  const smallCount = crewServices.repairer_small || 0;
  const mediumCount = crewServices.repairer_medium || 0;
  const largeCount = crewServices.repairer_large || 0;
  const legendaryCount = crewServices.repairer_legendary || 0;

  const handleSelectShip = (targetShip: ShipState) => {
    setSelectedShipId(targetShip.id);
    if (onSelectShip) onSelectShip(targetShip);
  };

  return (
    /* 100% Transparent Backdrop so game background and harbor remain fully visible */
    <div 
      className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 bg-transparent overflow-y-auto"
      style={{ 
        direction: 'rtl', 
        fontFamily: '"Cairo", "Tajawal", system-ui, sans-serif'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Centered Modal Card matching the user's preferred layout */}
      <div 
        className="relative w-full max-w-[800px] my-auto rounded-2xl overflow-hidden text-white"
        style={{
          background: 'linear-gradient(180deg, #050f1c 0%, #030812 100%)',
          border: '2px solid #0284c7',
          boxShadow: '0 20px 50px rgba(0,0,0,0.85), 0 0 35px rgba(2, 132, 199, 0.45)',
        }}
      >
        {/* ===================== HEADER BANNER ===================== */}
        {/* Exact aspect ratio 1206x245 with object-fill so letter 'و' and 'ورشة' are 100% intact and NEVER cut off */}
        <div className="relative w-full aspect-[1206/245] max-h-[220px] overflow-hidden select-none bg-[#020b16]">
          <img 
            src="/assets/ship_workshop_header.jpg" 
            alt="ورشة ملوك الأعماق" 
            className="w-full h-full object-fill pointer-events-none"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />

          {/* Close button on top-left (over the harbor dock scene) */}
          <button 
            onClick={onClose}
            aria-label="إغلاق الورشة"
            className="absolute top-2 left-2 sm:top-3 sm:left-3 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white text-base sm:text-xl font-black bg-black/50 hover:bg-black/80 border border-white/40 hover:border-white transition-all shadow-lg z-20 cursor-pointer active:scale-95"
          >
            ✕
          </button>
        </div>

        {/* Fleet quick switcher (if user has multiple ships) */}
        {allShips.length > 1 && (
          <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-cyan-900/40 bg-black/40">
            <span className="text-xs text-amber-300 font-bold whitespace-nowrap">السفينة النشطة:</span>
            {allShips.map((s) => {
              const sMax = s.maxHeart || ((s.level || 0) * 1000) + 10000;
              const sCur = typeof s.heart === 'number' ? s.heart : sMax;
              const isDamaged = sCur < sMax;
              const isSelected = s.id === activeShip.id;

              return (
                <button
                  key={s.id}
                  onClick={() => handleSelectShip(s)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-900/80 border-cyan-400 text-cyan-200 shadow-sm shadow-cyan-500/30'
                      : 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <span>{s.name || 'سفينة'}</span>
                  {isDamaged && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
                </button>
              );
            })}
          </div>
        )}

        {/* ===================== BODY CONTENT ===================== */}
        <div className="p-3 sm:p-5 space-y-4">

          {/* Ship Status & Health Card */}
          <div 
            className="relative rounded-xl p-3.5 sm:p-4 overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #091a2e 0%, #040d18 100%)',
              border: '2px solid #0284c7',
              boxShadow: 'inset 0 0 15px rgba(2, 132, 199, 0.2), 0 8px 25px rgba(0,0,0,0.6)'
            }}
          >
            {/* Top row: Status on Left (in RTL), Ship Name and boat on Right */}
            <div className="flex items-center justify-between gap-4 mb-3">
              
              {/* Left side (in RTL): Badge + HP percentage and ratio */}
              <div className="flex flex-col items-start gap-1">
                {hasDamage ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#16a34a] text-white border border-[#22c55e] shadow-sm shadow-green-500/30">
                    <span className="text-amber-300 text-sm">⚠️</span>
                    <span>عندك ضرر</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-950/80 text-emerald-300 border border-emerald-500/50">
                    <span>✅ جاهزة للإبحار</span>
                  </div>
                )}

                {/* HP ratio text matching reference: (2%) 10,000 / 200 */}
                <div 
                  className="text-amber-400 font-black text-sm sm:text-base tracking-wide mt-0.5" 
                  style={{ textShadow: '0 0 10px rgba(251, 191, 36, 0.6)' }}
                >
                  ({healthPct}%) {maxH.toLocaleString()} / {curH.toLocaleString()}
                </div>
              </div>

              {/* Right side (in RTL): Ship Name + نقاط الهيكل (HP): + Boat render */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <h4 className="text-amber-400 font-black text-base sm:text-xl tracking-wide drop-shadow-md">
                    {activeShip.name || 'قارب خشبيّ متهالك'}
                  </h4>
                  <div className="text-slate-100 text-xs sm:text-sm font-bold mt-0.5">
                    نقاط الهيكل (HP):
                  </div>
                </div>

                {/* Boat Silhouette / Render */}
                <div className="w-16 h-12 sm:w-20 sm:h-14 flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {activeShip.level && activeShip.level > 0 ? (
                    <ShipImage level={activeShip.level} width={76} plain={true} fill={true} />
                  ) : (
                    <img 
                      src="/assets/workshop_boat_crop.png" 
                      alt={activeShip.name}
                      className="max-w-full max-h-full object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  )}
                </div>
              </div>

            </div>

            {/* Glowing HP Progress Bar with neon cap */}
            <div className="relative w-full h-3 sm:h-3.5 bg-[#030712] rounded-full overflow-visible border border-[#0284c7]/90 p-[1.5px] shadow-inner">
              <div 
                className="h-full rounded-full transition-all duration-500 relative flex items-center justify-end"
                style={{
                  width: `${Math.max(2, healthPct)}%`,
                  background: 'linear-gradient(90deg, #0369a1 0%, #0284c7 40%, #38bdf8 100%)',
                  boxShadow: '0 0 10px rgba(56, 189, 248, 0.7)'
                }}
              >
                {/* Glowing orange/gold end cap */}
                {healthPct > 0 && (
                  <span 
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 shadow-[0_0_8px_#f97316] absolute -left-1"
                    style={{ transform: 'translateX(-50%)' }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Section Title */}
          <div className="flex items-center justify-start gap-2 pt-1 text-slate-100 font-black text-sm sm:text-base">
            <span className="text-xl">📦</span>
            <span className="text-amber-300">متوفر في ورشة ملوك الأعماق:</span>
          </div>

          {/* ===================== 2x2 GRID OF TECHNICIANS ===================== */}
          {/* Note: with direction: rtl, item 1 is top-right, item 2 is top-left, item 3 is bottom-right, item 4 is bottom-left */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            
            {/* CARD 1: مُصْلِح صغِير (Top Right in RTL) */}
            <div 
              className="rounded-xl p-3 sm:p-3.5 flex items-center justify-between gap-3 min-h-[140px] sm:min-h-[155px]"
              style={{
                background: 'linear-gradient(180deg, #091a2e 0%, #040c17 100%)',
                border: '1.5px solid #0284c7',
                boxShadow: 'inset 0 0 12px rgba(2, 132, 199, 0.15), 0 4px 15px rgba(0,0,0,0.5)'
              }}
            >
              {/* Left Column (in RTL): Title, HP value, and button */}
              <div className="flex-1 flex flex-col justify-between items-start h-full py-1">
                <div>
                  <h5 className="text-amber-400 font-black text-base sm:text-lg leading-tight">
                    مُصْلِح صغِير
                  </h5>
                  <div className="text-cyan-400 font-bold text-xs sm:text-sm mt-0.5">
                    (HP +200)
                  </div>
                </div>

                <button
                  disabled={smallCount <= 0 || !hasDamage}
                  onClick={() => onRepair(activeShip.id, 'small')}
                  className={`mt-3 px-5 py-2 rounded-lg font-black text-xs sm:text-sm transition-all shadow-md flex items-center justify-center cursor-pointer min-w-[95px] sm:min-w-[115px] ${
                    smallCount > 0 && hasDamage
                      ? 'bg-gradient-to-b from-[#22c55e] to-[#16a34a] hover:from-[#16a34a] hover:to-[#15803d] text-white border border-[#4ade80] shadow-green-600/40 active:scale-[0.98]'
                      : 'bg-gradient-to-b from-slate-700 to-slate-800 text-slate-400 border border-slate-600 cursor-not-allowed opacity-80'
                  }`}
                >
                  استخدم
                </button>
              </div>

              {/* Right Column (in RTL): Large, uncropped character portrait + Level */}
              <div className="flex flex-col items-center justify-center gap-1 min-w-[95px] sm:min-w-[110px]">
                <div className="w-22 h-22 sm:w-26 sm:h-26 flex items-center justify-center overflow-visible">
                  <img 
                    src="/assets/mechanic_small_photo.png" 
                    alt="مُصْلِح صغِير"
                    className="max-w-full max-h-full object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.85)]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = FIXER_SMALL_ICON;
                    }}
                  />
                </div>
                <div className="text-xs sm:text-sm font-bold text-cyan-300 whitespace-nowrap">
                  ليفل <span className={smallCount > 0 ? "text-emerald-400 font-black" : "text-red-400 font-black"}>{smallCount}</span>
                </div>
              </div>
            </div>

            {/* CARD 2: مُصْلِح وسِيط (Top Left in RTL) */}
            <div 
              className="rounded-xl p-3 sm:p-3.5 flex items-center justify-between gap-3 min-h-[140px] sm:min-h-[155px]"
              style={{
                background: 'linear-gradient(180deg, #091a2e 0%, #040c17 100%)',
                border: '1.5px solid #0284c7',
                boxShadow: 'inset 0 0 12px rgba(2, 132, 199, 0.15), 0 4px 15px rgba(0,0,0,0.5)'
              }}
            >
              {/* Left Column (in RTL): Title, HP value, and button */}
              <div className="flex-1 flex flex-col justify-between items-start h-full py-1">
                <div>
                  <h5 className="text-amber-400 font-black text-base sm:text-lg leading-tight">
                    مُصْلِح وسِيط
                  </h5>
                  <div className="text-cyan-400 font-bold text-xs sm:text-sm mt-0.5">
                    (HP +500)
                  </div>
                </div>

                <button
                  disabled={mediumCount <= 0 || !hasDamage}
                  onClick={() => onRepair(activeShip.id, 'medium')}
                  className={`mt-3 px-5 py-2 rounded-lg font-black text-xs sm:text-sm transition-all shadow-md flex items-center justify-center cursor-pointer min-w-[95px] sm:min-w-[115px] ${
                    mediumCount > 0 && hasDamage
                      ? 'bg-gradient-to-b from-[#22c55e] to-[#16a34a] hover:from-[#16a34a] hover:to-[#15803d] text-white border border-[#4ade80] shadow-green-600/40 active:scale-[0.98]'
                      : 'bg-gradient-to-b from-slate-700 to-slate-800 text-slate-400 border border-slate-600 cursor-not-allowed opacity-80'
                  }`}
                >
                  استخدم
                </button>
              </div>

              {/* Right Column (in RTL): Large, uncropped character portrait + Level */}
              <div className="flex flex-col items-center justify-center gap-1 min-w-[95px] sm:min-w-[110px]">
                <div className="w-22 h-22 sm:w-26 sm:h-26 flex items-center justify-center overflow-visible">
                  <img 
                    src="/assets/mechanic_medium_photo.png" 
                    alt="مُصْلِح وسِيط"
                    className="max-w-full max-h-full object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.85)]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = FIXER_MEDIUM_ICON;
                    }}
                  />
                </div>
                <div className="text-xs sm:text-sm font-bold text-cyan-300 whitespace-nowrap">
                  ليفل <span className={mediumCount > 0 ? "text-emerald-400 font-black" : "text-red-400 font-black"}>{mediumCount}</span>
                </div>
              </div>
            </div>

            {/* CARD 3: مُصْلِح كبِير (Bottom Right in RTL) */}
            <div 
              className="rounded-xl p-3 sm:p-3.5 flex items-center justify-between gap-3 min-h-[140px] sm:min-h-[155px]"
              style={{
                background: 'linear-gradient(180deg, #091a2e 0%, #040c17 100%)',
                border: '1.5px solid #0284c7',
                boxShadow: 'inset 0 0 12px rgba(2, 132, 199, 0.15), 0 4px 15px rgba(0,0,0,0.5)'
              }}
            >
              {/* Left Column (in RTL): Title, HP value, and button */}
              <div className="flex-1 flex flex-col justify-between items-start h-full py-1">
                <div>
                  <h5 className="text-amber-400 font-black text-base sm:text-lg leading-tight">
                    مُصْلِح كبِير
                  </h5>
                  <div className="text-cyan-400 font-bold text-xs sm:text-sm mt-0.5">
                    (HP +300)
                  </div>
                </div>

                <button
                  disabled={largeCount <= 0 || !hasDamage}
                  onClick={() => onRepair(activeShip.id, 'large')}
                  className={`mt-3 px-5 py-2 rounded-lg font-black text-xs sm:text-sm transition-all shadow-md flex items-center justify-center cursor-pointer min-w-[95px] sm:min-w-[115px] ${
                    largeCount > 0 && hasDamage
                      ? 'bg-gradient-to-b from-[#22c55e] to-[#16a34a] hover:from-[#16a34a] hover:to-[#15803d] text-white border border-[#4ade80] shadow-green-600/40 active:scale-[0.98]'
                      : 'bg-gradient-to-b from-slate-700 to-slate-800 text-slate-400 border border-slate-600 cursor-not-allowed opacity-80'
                  }`}
                >
                  استخدم
                </button>
              </div>

              {/* Right Column (in RTL): Large, uncropped character portrait + Level */}
              <div className="flex flex-col items-center justify-center gap-1 min-w-[95px] sm:min-w-[110px]">
                <div className="w-22 h-22 sm:w-26 sm:h-26 flex items-center justify-center overflow-visible">
                  <img 
                    src="/assets/mechanic_large_photo.png" 
                    alt="مُصْلِح كبِير"
                    className="max-w-full max-h-full object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.85)]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = FIXER_LARGE_ICON;
                    }}
                  />
                </div>
                <div className="text-xs sm:text-sm font-bold text-cyan-300 whitespace-nowrap">
                  ليفل <span className={largeCount > 0 ? "text-emerald-400 font-black" : "text-red-400 font-black"}>{largeCount}</span>
                </div>
              </div>
            </div>

            {/* CARD 4: مُصْلِح أسطوري (Bottom Left in RTL) */}
            <div 
              className="rounded-xl p-3 sm:p-3.5 flex items-center justify-between gap-3 min-h-[140px] sm:min-h-[155px]"
              style={{
                background: 'linear-gradient(180deg, #091a2e 0%, #040c17 100%)',
                border: '1.5px solid #0284c7',
                boxShadow: 'inset 0 0 12px rgba(2, 132, 199, 0.15), 0 4px 15px rgba(0,0,0,0.5)'
              }}
            >
              {/* Left Column (in RTL): Title, HP value, and button */}
              <div className="flex-1 flex flex-col justify-between items-start h-full py-1">
                <div>
                  <h5 className="text-amber-400 font-black text-base sm:text-lg leading-tight">
                    مُصْلِح أسطوري
                  </h5>
                  <div className="text-cyan-400 font-bold text-xs sm:text-sm mt-0.5">
                    (HP +1000)
                  </div>
                </div>

                {/* Steel grey disabled button when level is 0 */}
                <button
                  disabled={legendaryCount <= 0 || !hasDamage}
                  onClick={() => onRepair(activeShip.id, 'legendary')}
                  className={`mt-3 px-5 py-2 rounded-lg font-black text-xs sm:text-sm transition-all shadow-md flex items-center justify-center min-w-[95px] sm:min-w-[115px] ${
                    legendaryCount > 0 && hasDamage
                      ? 'bg-gradient-to-b from-[#22c55e] to-[#16a34a] hover:from-[#16a34a] hover:to-[#15803d] text-white border border-[#4ade80] shadow-green-600/40 cursor-pointer active:scale-[0.98]'
                      : 'bg-gradient-to-b from-[#475569] to-[#334155] text-[#94a3b8] border border-[#64748b] cursor-not-allowed opacity-90'
                  }`}
                >
                  استخدم
                </button>
              </div>

              {/* Right Column (in RTL): Large, uncropped character portrait + Level (0 in red!) */}
              <div className="flex flex-col items-center justify-center gap-1 min-w-[95px] sm:min-w-[110px]">
                <div className="w-22 h-22 sm:w-26 sm:h-26 flex items-center justify-center overflow-visible">
                  <img 
                    src="/assets/mechanic_legendary_photo.png" 
                    alt="مُصْلِح أسطوري"
                    className="max-w-full max-h-full object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.85)]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = FIXER_LEGENDARY_ICON;
                    }}
                  />
                </div>
                <div className="text-xs sm:text-sm font-bold text-cyan-300 whitespace-nowrap">
                  ليفل <span className={legendaryCount > 0 ? "text-emerald-400 font-black" : "text-red-500 font-black"}>{legendaryCount}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Quick emergency gold repair option if no mechanics are available in warehouse */}
          {hasDamage && smallCount === 0 && mediumCount === 0 && largeCount === 0 && legendaryCount === 0 && (
            <div className="mt-2 p-3 rounded-xl bg-amber-950/40 border border-amber-600/40 flex items-center justify-between text-xs sm:text-sm">
              <span className="text-amber-200">
                ⚠️ لا يوجد طواقم صيانة في المستودع؟ يمكنك إجراء صيانة طارئة:
              </span>
              <button
                onClick={() => onRepair(activeShip.id, 'gold')}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-900 font-black cursor-pointer shadow-md transition-all whitespace-nowrap"
              >
                صيانة بالذهب (500 🪙)
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
