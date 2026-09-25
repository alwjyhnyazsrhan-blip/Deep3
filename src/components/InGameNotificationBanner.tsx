import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Swords, ShieldCheck, Trophy, X, Volume2, VolumeX, Sparkles, Flame } from 'lucide-react';
import { GlobalNotification } from '../types';

interface InGameNotificationBannerProps {
  notification: GlobalNotification | null;
  onDismiss: () => void;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
}

export const InGameNotificationBanner: React.FC<InGameNotificationBannerProps> = ({
  notification,
  onDismiss,
  isSoundEnabled,
  onToggleSound,
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
        bg: 'bg-gradient-to-r from-red-950/95 via-rose-950/90 to-neutral-950/95',
        border: 'border-red-500/70',
        shadow: 'shadow-[0_10px_35px_-5px_rgba(239,68,68,0.5)]',
        badgeBg: 'bg-red-500/25 border-red-500/50 text-red-300',
        badgeText: 'إنذار اشتباك ⚔️',
        iconBg: 'bg-red-500/20 text-red-400 border border-red-500/40',
        barColor: 'from-red-500 via-rose-400 to-amber-500',
        glowColor: 'bg-red-500/10',
        Icon: Swords,
      }
    : isSupport
    ? {
        bg: 'bg-gradient-to-r from-emerald-950/95 via-teal-950/90 to-neutral-950/95',
        border: 'border-emerald-500/70',
        shadow: 'shadow-[0_10px_35px_-5px_rgba(16,185,129,0.45)]',
        badgeBg: 'bg-emerald-500/25 border-emerald-500/50 text-emerald-300',
        badgeText: 'دعم ومساندة 🛡️',
        iconBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.3)]',
        barColor: 'from-emerald-400 via-teal-300 to-cyan-400',
        glowColor: 'bg-emerald-500/10',
        Icon: ShieldCheck,
      }
    : {
        bg: 'bg-gradient-to-r from-amber-950/95 via-blue-950/90 to-neutral-950/95',
        border: 'border-amber-400/80',
        shadow: 'shadow-[0_10px_35px_-5px_rgba(245,158,11,0.5)]',
        badgeBg: 'bg-amber-500/25 border-amber-400/50 text-amber-200',
        badgeText: 'إنجاز وتقدم 🏆',
        iconBg: 'bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.35)]',
        barColor: 'from-amber-400 via-sky-400 to-amber-200',
        glowColor: 'bg-amber-500/10',
        Icon: Trophy,
      };

  const IconComponent = theme.Icon;

  return (
    <div
      id="in-game-notification-container"
      className="fixed top-2 sm:top-4 left-0 right-0 z-[999999] flex justify-center pointer-events-none px-3 select-none"
      dir="rtl"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={notification.id || notification.createdAt}
          initial={{ y: -70, opacity: 0, scale: 0.94 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -60, opacity: 0, scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 450, damping: 28 }}
          className={`pointer-events-auto relative w-full max-w-lg rounded-2xl p-3.5 backdrop-blur-xl border ${theme.bg} ${theme.border} ${theme.shadow} overflow-hidden`}
        >
          {/* Subtle Ambient Background Pulse */}
          <div className={`absolute inset-0 ${theme.glowColor} pointer-events-none animate-pulse`} />

          <div className="relative flex items-center justify-between gap-3 z-10">
            {/* Left/Start Icon with Custom Emblem or Emoji */}
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`relative flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xl shadow-inner ${theme.iconBg}`}
              >
                {notification.icon ? (
                  <span>{notification.icon}</span>
                ) : (
                  <IconComponent className="w-6 h-6 animate-bounce" />
                )}
                {isMilestone && (
                  <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-300 animate-spin" />
                )}
                {isAttack && (
                  <Flame className="absolute -top-1 -right-1 w-3.5 h-3.5 text-red-400 animate-pulse" />
                )}
              </div>

              {/* Title & Message Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide border shadow-sm ${theme.badgeBg}`}
                  >
                    {theme.badgeText}
                  </span>
                  <h4 className="text-xs sm:text-sm font-black text-white truncate drop-shadow-sm">
                    {notification.title}
                  </h4>
                </div>

                <p className="text-[11px] sm:text-xs text-neutral-200 line-clamp-2 leading-snug drop-shadow">
                  {notification.message}
                </p>
              </div>
            </div>

            {/* Action Buttons: Sound Mute Toggle & Dismiss */}
            <div className="flex items-center gap-1.5 flex-shrink-0 mr-1">
              <button
                type="button"
                id="toggle-notif-sound-btn"
                onClick={onToggleSound}
                title={isSoundEnabled ? 'كتم صوت الإشعارات' : 'تشغيل صوت الإشعارات'}
                className="p-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-neutral-300 hover:text-white transition border border-white/10"
              >
                {isSoundEnabled ? (
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-neutral-400" />
                )}
              </button>

              <button
                type="button"
                id="dismiss-notif-btn"
                onClick={onDismiss}
                title="إغلاق الإشعار"
                className="p-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-neutral-300 hover:text-white transition border border-white/10"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Auto-Dismiss Linear Countdown Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${theme.barColor} transition-all duration-75 ease-linear`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
