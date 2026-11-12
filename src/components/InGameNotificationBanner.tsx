import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Swords, ShieldCheck, Trophy, X, Volume2, VolumeX, Sparkles, Flame } from 'lucide-react';
import { GlobalNotification } from '../types';

interface InGameNotificationBannerProps {
  notification: GlobalNotification | null;
  onDismiss: () => void;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
  onRevenge?: (attackerName: string) => void;
  onOpenWarLog?: () => void;
}

export const InGameNotificationBanner: React.FC<InGameNotificationBannerProps> = ({
  notification,
  onDismiss,
  isSoundEnabled,
  onToggleSound,
  onRevenge,
  onOpenWarLog,
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!notification) {
      setProgress(100);
      return;
    }

    const durationMs = 4500;
    const intervalTime = 50;
    const step = (intervalTime / durationMs) * 100;

    setProgress(100);

    const timer = setTimeout(() => {
      onDismiss();
    }, durationMs);

    const interval = setInterval(() => {
      setProgress((prev) => Math.max(0, prev - step));
    }, intervalTime);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [notification?.id, notification?.createdAt, onDismiss]);

  if (!notification) return null;

  const isAttack = notification.type === 'ATTACK';
  const isSupport = notification.type === 'SUPPORT';
  const isMilestone = notification.type === 'MILESTONE';

  // Styling configurations
  const theme = isAttack
    ? {
        bg: 'bg-gradient-to-r from-red-950 via-rose-950 to-neutral-950',
        border: 'border-2 border-red-500',
        shadow: 'shadow-[0_12px_45px_rgba(239,68,68,0.6),0_0_25px_rgba(239,68,68,0.3)]',
        badgeBg: 'bg-red-500/35 border border-red-400 text-red-200',
        badgeText: 'إنذار اشتباك ⚔️',
        iconBg: 'bg-gradient-to-br from-red-600/35 to-rose-950 text-red-200 border-2 border-red-500/70 shadow-[0_0_16px_rgba(239,68,68,0.45)]',
        barColor: 'from-red-500 via-rose-400 to-amber-400',
        glowColor: 'bg-red-500/15',
        titleColor: 'text-red-100',
        Icon: Swords,
      }
    : isSupport
    ? {
        bg: 'bg-gradient-to-r from-emerald-950 via-teal-950 to-neutral-950',
        border: 'border-2 border-emerald-400',
        shadow: 'shadow-[0_12px_45px_rgba(16,185,129,0.55),0_0_25px_rgba(16,185,129,0.3)]',
        badgeBg: 'bg-emerald-500/35 border border-emerald-400 text-emerald-200',
        badgeText: 'دعم ومساندة 🛡️',
        iconBg: 'bg-gradient-to-br from-emerald-600/35 to-teal-950 text-emerald-200 border-2 border-emerald-400/70 shadow-[0_0_16px_rgba(16,185,129,0.45)]',
        barColor: 'from-emerald-400 via-teal-300 to-cyan-300',
        glowColor: 'bg-emerald-500/15',
        titleColor: 'text-emerald-100',
        Icon: ShieldCheck,
      }
    : {
        bg: 'bg-gradient-to-r from-amber-950 via-yellow-950/95 to-neutral-950',
        border: 'border-2 border-amber-400',
        shadow: 'shadow-[0_12px_45px_rgba(245,158,11,0.6),0_0_25px_rgba(245,158,11,0.3)]',
        badgeBg: 'bg-amber-500/35 border border-amber-400 text-amber-200',
        badgeText: 'إنجاز وتقدم 🏆',
        iconBg: 'bg-gradient-to-br from-amber-600/35 to-yellow-950 text-amber-200 border-2 border-amber-400/70 shadow-[0_0_16px_rgba(245,158,11,0.45)]',
        barColor: 'from-amber-400 via-yellow-300 to-amber-200',
        glowColor: 'bg-amber-500/15',
        titleColor: 'text-amber-100',
        Icon: Trophy,
      };

  const IconComponent = theme.Icon;

  return (
    <div
      id="in-game-notification-container"
      className="fixed top-3 sm:top-5 left-0 right-0 z-[999999] flex justify-center pointer-events-none px-3 sm:px-6 select-none font-['Cairo',_sans-serif]"
      dir="rtl"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={notification.id || notification.createdAt}
          initial={{ y: -80, opacity: 0, scale: 0.92 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -70, opacity: 0, scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 450, damping: 28 }}
          className={`pointer-events-auto relative w-full max-w-xl sm:max-w-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-5 backdrop-blur-2xl ${theme.bg} ${theme.border} ${theme.shadow} overflow-hidden`}
        >
          {/* Subtle Ambient Background Pulse */}
          <div className={`absolute inset-0 ${theme.glowColor} pointer-events-none animate-pulse`} />

          <div className="relative flex items-center justify-between gap-3.5 sm:gap-4 z-10">
            {/* Left/Start Icon with Custom Emblem or Emoji */}
            <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
              <div
                className={`relative flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-inner ${theme.iconBg}`}
              >
                {notification.icon ? (
                  <span className="leading-none drop-shadow">{notification.icon}</span>
                ) : (
                  <IconComponent className="w-7 h-7 sm:w-8 sm:h-8 animate-bounce" />
                )}
                {isMilestone && (
                  <Sparkles className="absolute -top-1.5 -right-1.5 w-5 h-5 text-yellow-300 animate-spin" />
                )}
                {isAttack && (
                  <Flame className="absolute -top-1.5 -right-1.5 w-5 h-5 text-red-400 animate-pulse" />
                )}
              </div>

              {/* Title & Message Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-black tracking-wide shadow-sm ${theme.badgeBg}`}
                  >
                    {theme.badgeText}
                  </span>
                  <h4 className={`text-base sm:text-lg md:text-xl font-black truncate drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] ${theme.titleColor}`}>
                    {notification.title}
                  </h4>
                </div>

                <p className="text-sm sm:text-base font-bold text-slate-100 line-clamp-2 leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                  {notification.message}
                </p>

                {isAttack && onRevenge && (
                  <button
                    type="button"
                    onClick={() => {
                      const attacker = notification.authorName || notification.senderName || 'رماس محمد';
                      onDismiss();
                      onRevenge(attacker);
                    }}
                    className="mt-2.5 px-3.5 py-1.5 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs sm:text-sm rounded-xl border border-yellow-300 shadow-[0_0_15px_rgba(239,68,68,0.7)] flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
                  >
                    <span>⚡ هل تريد رد الهجوم لها؟ اضغط هنا لتفجير محيطها الآن 🚀</span>
                  </button>
                )}
              </div>
            </div>

            {/* Action Buttons: Sound Mute Toggle & Dismiss */}
            <div className="flex items-center gap-2 flex-shrink-0 mr-1 sm:mr-2">
              <button
                type="button"
                id="toggle-notif-sound-btn"
                onClick={onToggleSound}
                title={isSoundEnabled ? 'كتم صوت الإشعارات' : 'تشغيل صوت الإشعارات'}
                className="p-2 sm:p-2.5 rounded-xl bg-black/60 hover:bg-black/80 text-neutral-200 hover:text-white transition border border-white/20 shadow-md active:scale-95 cursor-pointer"
              >
                {isSoundEnabled ? (
                  <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
                ) : (
                  <VolumeX className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-400" />
                )}
              </button>

              <button
                type="button"
                id="dismiss-notif-btn"
                onClick={onDismiss}
                title="إغلاق الإشعار"
                className="p-2 sm:p-2.5 rounded-xl bg-black/60 hover:bg-black/80 text-neutral-200 hover:text-white transition border border-white/20 shadow-md active:scale-95 cursor-pointer"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>

          {/* Auto-Dismiss Linear Countdown Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 sm:h-2 bg-black/60 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${theme.barColor} transition-all duration-75 ease-linear shadow-[0_0_10px_rgba(255,255,255,0.6)]`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
