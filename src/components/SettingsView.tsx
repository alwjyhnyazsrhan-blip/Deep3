import React, { useState } from 'react';
import { 
  Globe, 
  ChevronDown, 
  ChevronRight, 
  Swords, 
  BatteryCharging, 
  Thermometer, 
  Music, 
  Lock, 
  Mail, 
  Send, 
  Power, 
  AlertTriangle, 
  X,
  Compass
} from 'lucide-react';

interface SettingsViewProps {
  language: string;
  setLanguage: (lang: string) => void;
  userEmail?: string;
  handleSyncAccount: () => void;
  isMusicMuted: boolean;
  setIsMusicMuted: (val: boolean) => void;
  isSfxMuted: boolean;
  setIsSfxMuted: (val: boolean) => void;
  showSoundTones: boolean;
  setShowSoundTones: (val: boolean) => void;
  showAttackNotifications: boolean;
  setShowAttackNotifications: (val: boolean) => void;
  showChestNotifications: boolean;
  setShowChestNotifications: (val: boolean) => void;
  customizeIconFunctions: boolean;
  setCustomizeIconFunctions: (val: boolean) => void;
  showRelatedAlerts: boolean;
  setShowRelatedAlerts: (val: boolean) => void;
  disableQuickChat: boolean;
  setDisableQuickChat: (val: boolean) => void;
  powerSaverLogin: boolean;
  setPowerSaverLogin: (val: boolean) => void;
  setPowerSaver: (val: boolean) => void;
  showPopupAlerts: boolean;
  setShowPopupAlerts: (val: boolean) => void;
  stopRogueAlliances: boolean;
  setStopRogueAlliances: (val: boolean) => void;
  heatingEnergyIndex: boolean;
  setHeatingEnergyIndex: (val: boolean) => void;
  setActiveSettingsModal: (modal: 'email' | 'password' | 'ticket' | 'icons' | 'delete' | null) => void;
  handleSendPasswordReset: () => void;
  handleLogout: () => void;
  showToast: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  onClose: () => void;
  handleUpdateGameVersion?: () => void;
}

const SETTINGS_PIRATE_BG = "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/pirate-background-extracted.jpg%20(1).png";

export const SettingsView: React.FC<SettingsViewProps> = ({
  language,
  setLanguage,
  isMusicMuted,
  setIsMusicMuted,
  showAttackNotifications,
  setShowAttackNotifications,
  powerSaverLogin,
  setPowerSaverLogin,
  setPowerSaver,
  heatingEnergyIndex,
  setHeatingEnergyIndex,
  setActiveSettingsModal,
  handleSendPasswordReset,
  handleLogout,
  showToast,
  onClose,
}) => {
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  return (
    <div 
      className="tab-overlay relative w-full min-h-screen text-slate-100 flex flex-col items-center select-none overflow-x-hidden"
      style={{
        backgroundImage: `radial-gradient(ellipse at center, rgba(3, 15, 30, 0.50) 0%, rgba(1, 6, 15, 0.88) 100%), url('${SETTINGS_PIRATE_BG}'), url('/settings_pirate_bg.png'), url('/settings_pirate_bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundAttachment: 'fixed',
        fontFamily: "'Cairo', system-ui, -apple-system, sans-serif",
        padding: '10px 4px 50px 4px'
      }}
    >
      {/* Subtle Close Button Top Left */}
      <button 
        onClick={onClose}
        aria-label="إغلاق الإعدادات"
        className="fixed top-3 left-3 z-50 w-8 h-8 rounded-full flex items-center justify-center bg-black/75 border border-amber-500/40 text-amber-300/90 hover:text-white hover:bg-amber-600/70 shadow-xl backdrop-blur-md transition-all active:scale-90 cursor-pointer"
      >
        <X size={16} />
      </button>

      {/* Main Container mirroring image_3.png exactly */}
      <div className="w-full max-w-[430px] relative px-2 sm:px-3 flex flex-col items-center">

        {/* --- LEFT SHIP MAST & HANGING AMBER LANTERN --- */}
        <div className="absolute -left-2 sm:-left-1 top-0 bottom-0 w-6 pointer-events-none z-20 flex flex-col items-center">
          {/* Mast Timber */}
          <div className="w-3 sm:w-4 h-full rounded-full bg-gradient-to-r from-[#140b04] via-[#331c0a] to-[#0d0703] border-r border-[#633a11]/50 shadow-[3px_0_15px_rgba(0,0,0,0.95)] relative">
            <div className="absolute top-12 left-0 right-0 h-3 border-y-2 border-dashed border-[#b45309]/60" />
            <div className="absolute top-56 left-0 right-0 h-3 border-y-2 border-dashed border-[#b45309]/60" />
            <div className="absolute bottom-24 left-0 right-0 h-3 border-y-2 border-dashed border-[#b45309]/60" />
          </div>

          {/* Left Hanging Amber Lantern */}
          <div className="absolute top-14 -right-2 flex flex-col items-center animate-pulse">
            <div className="w-2.5 h-2 bg-neutral-900 border border-amber-600/70 rounded-t" />
            <div 
              className="w-5 h-7 rounded-md border border-amber-400 bg-gradient-to-b from-amber-100 via-amber-500 to-orange-600 flex items-center justify-center shadow-[0_0_25px_#f59e0b,0_0_55px_rgba(245,158,11,0.7)]"
            >
              <div className="w-2 h-4 bg-white/95 rounded-full blur-[1px]" />
            </div>
            <div className="w-3 h-1.5 bg-neutral-950 rounded-b border border-amber-700/70" />
          </div>

          {/* Bottom Left Heavy Anchor */}
          <div className="absolute bottom-4 -left-1 text-2xl filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.95)] opacity-95">
            <span className="text-3xl text-amber-700 filter drop-shadow">⚓</span>
          </div>
        </div>

        {/* --- RIGHT SHIP MAST & HANGING AMBER LANTERN --- */}
        <div className="absolute -right-2 sm:-right-1 top-0 bottom-0 w-6 pointer-events-none z-20 flex flex-col items-center">
          {/* Mast Timber */}
          <div className="w-3 sm:w-4 h-full rounded-full bg-gradient-to-r from-[#0d0703] via-[#331c0a] to-[#140b04] border-l border-[#633a11]/50 shadow-[-3px_0_15px_rgba(0,0,0,0.95)] relative">
            <div className="absolute top-12 left-0 right-0 h-3 border-y-2 border-dashed border-[#b45309]/60" />
            <div className="absolute top-56 left-0 right-0 h-3 border-y-2 border-dashed border-[#b45309]/60" />
            <div className="absolute bottom-24 left-0 right-0 h-3 border-y-2 border-dashed border-[#b45309]/60" />
          </div>

          {/* Right Hanging Amber Lantern */}
          <div className="absolute top-14 -left-2 flex flex-col items-center animate-pulse">
            <div className="w-2.5 h-2 bg-neutral-900 border border-amber-600/70 rounded-t" />
            <div 
              className="w-5 h-7 rounded-md border border-amber-400 bg-gradient-to-b from-amber-100 via-amber-500 to-orange-600 flex items-center justify-center shadow-[0_0_25px_#f59e0b,0_0_55px_rgba(245,158,11,0.7)]"
            >
              <div className="w-2 h-4 bg-white/95 rounded-full blur-[1px]" />
            </div>
            <div className="w-3 h-1.5 bg-neutral-950 rounded-b border border-amber-700/70" />
          </div>

          {/* Bottom Right Brass Compass */}
          <div className="absolute bottom-4 -right-1 text-2xl filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.95)] opacity-95">
            <Compass size={28} className="text-amber-500 filter drop-shadow" />
          </div>
        </div>

        {/* --- 1. TOP HEADER: PIRATE TRIDENT FLAG (LEFT), SKULL & CROWN (CENTER), SAUDI ARABIA FLAG (RIGHT) --- */}
        <div className="w-full flex items-center justify-between px-3 pt-0.5 relative z-10" dir="ltr">
          {/* Left: Black Pirate Flag with Golden Trident */}
          <div className="flex items-center gap-1 filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            <span className="text-2xl">🏴‍☠️</span>
            <span className="text-lg text-amber-400 font-bold -ml-1">🔱</span>
          </div>

          {/* Center: Crowned Skull and Captain Ship Wheel */}
          <div className="relative flex flex-col items-center justify-center">
            <div className="text-2xl filter drop-shadow-[0_0_15px_rgba(234,179,8,0.85)]">
              👑
            </div>
            <div className="text-xl -mt-2 filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] text-amber-200">
              💀
            </div>
          </div>

          {/* Right: Saudi Arabia Flag 🇸🇦 fluttering proudly */}
          <div className="flex items-center gap-1 filter drop-shadow-[0_2px_12px_rgba(16,185,129,0.75)]">
            <span className="text-3xl">🇸🇦</span>
          </div>
        </div>

        {/* --- 2. GOTHIC ORNATE ARCHED TITLE PLAQUE: الإعدادات --- */}
        <div 
          className="w-full max-w-[325px] py-1.5 px-6 rounded-2xl text-center relative border-[2.5px] border-[#926017] shadow-[0_12px_30px_rgba(0,0,0,0.95),inset_0_2px_4px_rgba(255,255,255,0.25),inset_0_-4px_8px_rgba(0,0,0,0.85)] mt-0.5 mb-2.5"
          style={{
            background: 'linear-gradient(180deg, #281b0f 0%, #150d07 50%, #0a0603 100%)',
          }}
        >
          {/* Corner gold studs */}
          <div className="absolute top-1.5 left-2 w-1.5 h-1.5 rounded-full bg-amber-400 border border-amber-200" />
          <div className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-amber-400 border border-amber-200" />
          <div className="absolute bottom-1.5 left-2 w-1.5 h-1.5 rounded-full bg-amber-400 border border-amber-200" />
          <div className="absolute bottom-1.5 right-2 w-1.5 h-1.5 rounded-full bg-amber-400 border border-amber-200" />

          <h1 
            className="text-3xl sm:text-4xl font-black tracking-wide leading-none m-0 py-0.5"
            style={{
              background: 'linear-gradient(180deg, #fffbeb 0%, #fde047 32%, #d97706 72%, #78350f 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.95)) drop-shadow(0 0 16px rgba(234,179,8,0.5))'
            }}
          >
            الإعدادات
          </h1>
        </div>

        {/* --- MAIN GOTHIC CARD FRAME (ALL ROWS INSIDE) --- */}
        <div 
          className="w-full rounded-2xl border-2 border-sky-900/60 p-2 sm:p-2.5 flex flex-col gap-2 relative shadow-[0_16px_40px_rgba(0,0,0,0.95),inset_0_0_20px_rgba(1,10,22,0.8)]"
          style={{
            background: 'linear-gradient(180deg, rgba(6, 18, 36, 0.94) 0%, rgba(2, 8, 18, 0.98) 100%)',
          }}
        >
          {/* Corner decorative bracket notches */}
          <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-sky-400/50 rounded-tl pointer-events-none" />
          <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-sky-400/50 rounded-tr pointer-events-none" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-sky-400/50 rounded-bl pointer-events-none" />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-sky-400/50 rounded-br pointer-events-none" />

          {/* --- ROW 0: LANGUAGE SELECTOR (العربية مع علم السعودية 🇸🇦 كما في الطلب والصورة) --- */}
          <div className="w-full relative" dir="ltr">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="w-full h-11 px-3.5 rounded-xl border border-sky-700/60 flex items-center justify-between transition-all shadow-[0_4px_12px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.12)] hover:border-sky-400/80 active:scale-[0.99] cursor-pointer"
              style={{
                background: 'linear-gradient(180deg, #0a2140 0%, #031020 100%)',
              }}
            >
              {/* Left side: Globe 🌐, العربية, Saudi Flag 🇸🇦 */}
              <div className="flex items-center gap-2.5">
                <Globe size={18} className="text-sky-300" />
                <span className="text-sm font-bold text-slate-100 tracking-wide">العربية</span>
                <span className="text-xl leading-none" title="المملكة العربية السعودية">🇸🇦</span>
              </div>

              {/* Right side: Dropdown arrow ▼ */}
              <div className="text-sky-300/80">
                <ChevronDown size={17} className={`transition-transform duration-200 ${langDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {/* Dropdown Options */}
            {langDropdownOpen && (
              <div 
                className="absolute top-12 left-0 right-0 z-50 rounded-xl border border-sky-500/70 shadow-2xl p-1.5 flex flex-col gap-1 backdrop-blur-md animate-fadeIn"
                style={{
                  background: 'linear-gradient(180deg, #0a2140 0%, #030d1a 100%)',
                }}
              >
                <button
                  onClick={() => {
                    setLanguage('ar');
                    setLangDropdownOpen(false);
                    showToast('تم اختيار العربية 🇸🇦', 'success');
                  }}
                  className="w-full px-3 py-2 rounded-lg flex items-center justify-between text-xs sm:text-sm font-bold text-amber-200 bg-amber-950/40 border border-amber-500/40 hover:bg-amber-900/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Globe size={15} className="text-amber-400" />
                    <span>العربية (المملكة العربية السعودية)</span>
                  </div>
                  <span className="text-lg">🇸🇦</span>
                </button>

                <button
                  onClick={() => {
                    setLanguage('en');
                    setLangDropdownOpen(false);
                    showToast('Language set to English 🇺🇸', 'success');
                  }}
                  className="w-full px-3 py-2 rounded-lg flex items-center justify-between text-xs sm:text-sm font-bold text-slate-300 hover:bg-sky-950/60 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Globe size={15} className="text-sky-400" />
                    <span>English</span>
                  </div>
                  <span className="text-lg">🇺🇸</span>
                </button>
              </div>
            )}
          </div>

          {/* --- ROW 1: 'التنبيهات وقت الهجوم' (أيقونة السيفين المتقاطعين) | التبديل يسار، النص والأيقونة يمين --- */}
          <div 
            dir="ltr"
            onClick={() => {
              setShowAttackNotifications(!showAttackNotifications);
              showToast(!showAttackNotifications ? '❌ تم إيقاف التنبيهات وقت الهجوم' : '⚔️ تم تفعيل التنبيهات وقت الهجوم', 'success');
            }}
            className="w-full h-12 px-3.5 rounded-xl border border-sky-800/50 flex items-center justify-between cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all hover:bg-sky-950/35 active:scale-[0.99]"
            style={{
              background: 'linear-gradient(180deg, #07192f 0%, #030d1b 100%)',
            }}
          >
            {/* Left side: Green switch (ON) */}
            <div 
              className="w-12 h-6 rounded-full relative transition-all duration-200 border border-white/15 shadow-inner"
              style={{
                backgroundColor: showAttackNotifications ? '#22c55e' : '#1e293b',
                boxShadow: showAttackNotifications ? '0 0 10px rgba(34,197,94,0.55)' : 'none'
              }}
            >
              <div 
                className="w-4 h-4 rounded-full bg-white absolute top-1 transition-all duration-200 shadow-md"
                style={{
                  left: showAttackNotifications ? '28px' : '4px'
                }}
              />
            </div>

            {/* Right side: Arabic text then crossed swords on the far right */}
            <div className="flex items-center gap-2.5" dir="rtl">
              <span className="text-xs sm:text-sm font-bold text-slate-100">
                التبينات وقت الهجوم
              </span>
              <div className="w-6 h-6 flex items-center justify-center">
                <Swords size={21} className="text-amber-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]" />
              </div>
            </div>
          </div>

          {/* --- ROW 2: 'مؤثر الطاقة' (أيقونة البطارية) | التبديل يسار، النص والأيقونة يمين --- */}
          <div 
            dir="ltr"
            onClick={() => {
              setPowerSaverLogin(!powerSaverLogin);
              setPowerSaver(!powerSaverLogin);
              showToast(!powerSaverLogin ? '🔋 تم تشغيل مؤثر الطاقة' : '❌ تم إيقاف مؤثر الطاقة', 'success');
            }}
            className="w-full h-12 px-3.5 rounded-xl border border-sky-800/50 flex items-center justify-between cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all hover:bg-sky-950/35 active:scale-[0.99]"
            style={{
              background: 'linear-gradient(180deg, #07192f 0%, #030d1b 100%)',
            }}
          >
            {/* Left side: Green switch (ON) */}
            <div 
              className="w-12 h-6 rounded-full relative transition-all duration-200 border border-white/15 shadow-inner"
              style={{
                backgroundColor: powerSaverLogin ? '#22c55e' : '#1e293b',
                boxShadow: powerSaverLogin ? '0 0 10px rgba(34,197,94,0.55)' : 'none'
              }}
            >
              <div 
                className="w-4 h-4 rounded-full bg-white absolute top-1 transition-all duration-200 shadow-md"
                style={{
                  left: powerSaverLogin ? '28px' : '4px'
                }}
              />
            </div>

            {/* Right side: Arabic text then battery on the far right */}
            <div className="flex items-center gap-2.5" dir="rtl">
              <span className="text-xs sm:text-sm font-bold text-slate-100">
                مؤثر الطاقة
              </span>
              <div className="w-6 h-6 flex items-center justify-center">
                <BatteryCharging size={21} className="text-emerald-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]" />
              </div>
            </div>
          </div>

          {/* --- ROW 3: 'مانع التسخين' (أيقونة درجة الحرارة) | التبديل يسار، النص والأيقونة يمين --- */}
          <div 
            dir="ltr"
            onClick={() => {
              setHeatingEnergyIndex(!heatingEnergyIndex);
              showToast(!heatingEnergyIndex ? '🌡️ تم تفعيل مانع التسخين' : '❌ تم إيقاف مانع التسخين', 'success');
            }}
            className="w-full h-12 px-3.5 rounded-xl border border-sky-800/50 flex items-center justify-between cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all hover:bg-sky-950/35 active:scale-[0.99]"
            style={{
              background: 'linear-gradient(180deg, #07192f 0%, #030d1b 100%)',
            }}
          >
            {/* Left side: Green switch (ON) */}
            <div 
              className="w-12 h-6 rounded-full relative transition-all duration-200 border border-white/15 shadow-inner"
              style={{
                backgroundColor: heatingEnergyIndex ? '#22c55e' : '#1e293b',
                boxShadow: heatingEnergyIndex ? '0 0 10px rgba(34,197,94,0.55)' : 'none'
              }}
            >
              <div 
                className="w-4 h-4 rounded-full bg-white absolute top-1 transition-all duration-200 shadow-md"
                style={{
                  left: heatingEnergyIndex ? '28px' : '4px'
                }}
              />
            </div>

            {/* Right side: Arabic text then red thermometer on the far right */}
            <div className="flex items-center gap-2.5" dir="rtl">
              <span className="text-xs sm:text-sm font-bold text-slate-100">
                مانع التسخين
              </span>
              <div className="w-6 h-6 flex items-center justify-center relative">
                <Thermometer size={21} className="text-rose-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]" />
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-rose-500 bg-rose-950 flex items-center justify-center">
                  <div className="w-1.5 h-0.5 bg-rose-400 rotate-45" />
                </div>
              </div>
            </div>
          </div>

          {/* --- ROW 4: 'ضيف الموسيقى المحيط' (أيقونة الموسيقى) | التبديل يسار، النص والأيقونة يمين --- */}
          <div 
            dir="ltr"
            onClick={() => {
              setIsMusicMuted(!isMusicMuted);
              showToast(!isMusicMuted ? '🔇 تم كتم موسيقى المحيط' : '🎵 تم تشغيل موسيقى المحيط', 'success');
            }}
            className="w-full h-12 px-3.5 rounded-xl border border-sky-800/50 flex items-center justify-between cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all hover:bg-sky-950/35 active:scale-[0.99]"
            style={{
              background: 'linear-gradient(180deg, #07192f 0%, #030d1b 100%)',
            }}
          >
            {/* Left side: Green switch (ON) */}
            <div 
              className="w-12 h-6 rounded-full relative transition-all duration-200 border border-white/15 shadow-inner"
              style={{
                backgroundColor: !isMusicMuted ? '#22c55e' : '#1e293b',
                boxShadow: !isMusicMuted ? '0 0 10px rgba(34,197,94,0.55)' : 'none'
              }}
            >
              <div 
                className="w-4 h-4 rounded-full bg-white absolute top-1 transition-all duration-200 shadow-md"
                style={{
                  left: !isMusicMuted ? '28px' : '4px'
                }}
              />
            </div>

            {/* Right side: Arabic text then music note on the far right */}
            <div className="flex items-center gap-2.5" dir="rtl">
              <span className="text-xs sm:text-sm font-bold text-slate-100">
                ضيف الموسيقى المحيط
              </span>
              <div className="w-6 h-6 flex items-center justify-center text-cyan-300">
                <Music size={21} className="text-sky-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]" />
              </div>
            </div>
          </div>

          {/* --- ROW 5: 'تغيير كلمة السر' (أيقونة القفل) | سهم > في اليسار، النص والقفل في اليمين --- */}
          <button
            dir="ltr"
            onClick={() => setActiveSettingsModal('password')}
            className="w-full h-12 px-3.5 rounded-xl border border-sky-800/60 flex items-center justify-between cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all hover:border-sky-400/60 active:scale-[0.99]"
            style={{
              background: 'linear-gradient(180deg, #071a32 0%, #030d1c 100%)',
            }}
          >
            {/* Left: Chevron > pointing towards right */}
            <ChevronRight size={19} className="text-slate-300 drop-shadow" />

            {/* Right: Text and Lock Icon */}
            <div className="flex items-center gap-2.5" dir="rtl">
              <span className="text-xs sm:text-sm font-bold text-slate-100">
                تغيير كلمة السر
              </span>
              <Lock size={19} className="text-sky-200 drop-shadow" />
            </div>
          </button>

          {/* --- ROW 6: 'تغيير كلمة السر حق البريد' (أيقونة البريد) | سهم > في اليسار، النص والبريد في اليمين --- */}
          <button
            dir="ltr"
            onClick={() => handleSendPasswordReset()}
            className="w-full h-12 px-3.5 rounded-xl border border-sky-800/60 flex items-center justify-between cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all hover:border-sky-400/60 active:scale-[0.99]"
            style={{
              background: 'linear-gradient(180deg, #071a32 0%, #030d1c 100%)',
            }}
          >
            {/* Left: Chevron > pointing towards right */}
            <ChevronRight size={19} className="text-slate-300 drop-shadow" />

            {/* Right: Text and Mail Icon */}
            <div className="flex items-center gap-2.5" dir="rtl">
              <span className="text-xs sm:text-sm font-bold text-slate-100">
                تغيير كلمة السر حق البريد
              </span>
              <Mail size={19} className="text-sky-200 drop-shadow" />
            </div>
          </button>

          {/* --- ROW 7: 'قناتي ملوك الأعماق' (أيقونة تيليجرام يسار، نص بالمنتصف، وسهم > يمين، بإطار ذهبي ملكي) --- */}
          <button
            dir="ltr"
            onClick={() => {
              window.open('https://t.me/hycsp', '_blank');
              showToast('جاري توجيهك إلى قناة ملوك الأعماق على تيليجرام 📢', 'success');
            }}
            className="w-full h-13 px-4 rounded-2xl border-2 border-[#eab308] flex items-center justify-between cursor-pointer shadow-[0_6px_22px_rgba(234,179,8,0.4),inset_0_1px_3px_rgba(255,255,255,0.3)] transition-all hover:brightness-110 active:scale-[0.99] relative overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #0d284a 0%, #041224 100%)',
            }}
          >
            {/* Left: Circular blue Telegram icon with white paper airplane */}
            <div className="w-8 h-8 rounded-full bg-[#0088cc] flex items-center justify-center text-white shadow-md border border-white/20">
              <Send size={16} className="-translate-x-0.5 translate-y-0.5" />
            </div>

            {/* Center: قناتي ملوك الأعماق */}
            <span 
              className="text-base sm:text-lg font-black tracking-wide"
              style={{
                background: 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 65%, #cbd5e1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.85))'
              }}
            >
              قناتي ملوك الأعماق
            </span>

            {/* Right: Chevron > as in image */}
            <ChevronRight size={20} className="text-amber-400 drop-shadow" />
          </button>

          {/* --- ROW 8: 'تسجيل الخروج' (زر الطاقة الأحمر يسار، نص بالمنتصف، وسهم > يمين) --- */}
          <button
            dir="ltr"
            onClick={() => {
              if (window.confirm('هل تريد حقاً تسجيل الخروج والعودة للشاشة الرئيسية؟')) {
                handleLogout();
              }
            }}
            className="w-full h-12 px-3.5 rounded-xl border border-sky-800/60 flex items-center justify-between cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all hover:border-rose-500/60 active:scale-[0.99]"
            style={{
              background: 'linear-gradient(180deg, #071a32 0%, #030d1c 100%)',
            }}
          >
            {/* Left: Glowing red circular power icon */}
            <div className="w-8 h-8 rounded-full border-2 border-rose-500 bg-rose-950/60 flex items-center justify-center text-rose-400 shadow-[0_0_14px_rgba(244,63,94,0.7)]">
              <Power size={17} className="text-rose-400" />
            </div>

            {/* Center: تسجيل الخروج */}
            <span className="text-sm font-bold text-slate-100">
              تسجيل الخروج
            </span>

            {/* Right: Chevron > as in image */}
            <ChevronRight size={19} className="text-slate-300 drop-shadow" />
          </button>

          {/* --- 3. THE EMBOSSED NAVY MARINER COMPASS ROSE MEDALLION (CENTERED) --- */}
          <div className="w-full py-3 flex items-center justify-center relative">
            <div 
              className="w-44 h-44 rounded-full border border-sky-700/30 flex items-center justify-center relative shadow-[inset_0_0_35px_rgba(0,0,0,0.95)] opacity-85"
              style={{
                background: 'radial-gradient(circle, rgba(14, 45, 85, 0.45) 0%, rgba(3, 14, 28, 0.85) 70%, transparent 100%)'
              }}
            >
              {/* Outer dotted nautical track */}
              <div className="absolute inset-2.5 rounded-full border border-dashed border-sky-400/25 animate-[spin_80s_linear_infinite]" />
              
              {/* Inner ring */}
              <div className="absolute inset-6 rounded-full border border-sky-500/20" />

              {/* 8-Point Compass Star */}
              <div className="relative flex items-center justify-center">
                <Compass size={96} className="text-sky-400/35 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]" />
              </div>

              {/* Anchors flanking */}
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 text-sky-400/30 text-xs select-none">⚓</div>
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 text-sky-400/30 text-xs select-none">⚓</div>
            </div>
          </div>

        </div>

        {/* --- 4. BOTTOM ORNATE GOLDEN CARTOUCHE: '⚠️ تغيير كلمة المرور >' --- */}
        <div className="w-full flex flex-col items-center pt-3 pb-2" dir="ltr">
          <button
            onClick={() => setActiveSettingsModal('password')}
            className="w-full max-w-[320px] py-2 px-5 rounded-xl border-2 border-[#d97706] flex items-center justify-between cursor-pointer shadow-[0_6px_20px_rgba(217,119,6,0.4),inset_0_1px_2px_rgba(255,255,255,0.25)] transition-all hover:brightness-115 active:scale-[0.98]"
            style={{
              background: 'linear-gradient(180deg, #24170c 0%, #0e0904 100%)',
            }}
          >
            {/* Left: Yellow Warning Triangle ⚠️ */}
            <div className="flex items-center justify-center text-amber-400">
              <AlertTriangle size={18} className="text-amber-400 drop-shadow" />
            </div>

            {/* Center: 'تغيير كلمة المرور' in bold gold font */}
            <span 
              className="text-xs sm:text-sm font-black tracking-wide"
              style={{
                background: 'linear-gradient(180deg, #fffbeb 0%, #fde047 40%, #f59e0b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.9))'
              }}
            >
              تغيير كلمة المرور
            </span>

            {/* Right: Gold Chevron > */}
            <ChevronRight size={18} className="text-amber-400 drop-shadow" />
          </button>
        </div>

      </div>
    </div>
  );
};
