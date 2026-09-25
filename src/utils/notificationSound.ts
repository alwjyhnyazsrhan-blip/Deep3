import { NotificationEventType } from '../types';

let cachedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!cachedAudioCtx || cachedAudioCtx.state === 'closed') {
      cachedAudioCtx = new AudioContextClass();
    }
    if (cachedAudioCtx.state === 'suspended') {
      cachedAudioCtx.resume().catch(() => {});
    }
    return cachedAudioCtx;
  } catch (e) {
    console.warn('AudioContext not available:', e);
    return null;
  }
}

export function playNotificationSound(type: NotificationEventType, isMutedOverride?: boolean) {
  try {
    if (isMutedOverride === true) return;
    const isGlobalMuted = localStorage.getItem('pirate_is_muted') === 'true';
    const isSfxMuted = localStorage.getItem('pirate_sfx_muted') === 'true';
    const isNotifSound = localStorage.getItem('kingofdeep_notif_sound') !== 'false';
    if (isGlobalMuted || isSfxMuted || !isNotifSound) return;

    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    if (type === 'ATTACK') {
      // Crisp combat warning dual alert
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sawtooth';

      osc1.frequency.setValueAtTime(740, now);
      osc1.frequency.exponentialRampToValueAtTime(480, now + 0.28);

      osc2.frequency.setValueAtTime(370, now);
      osc2.frequency.exponentialRampToValueAtTime(240, now + 0.28);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);

      // Second strike pulse
      const osc3 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc3.type = 'sawtooth';
      osc3.frequency.setValueAtTime(880, now + 0.12);
      osc3.frequency.exponentialRampToValueAtTime(520, now + 0.38);

      gain2.gain.setValueAtTime(0, now);
      gain2.gain.setValueAtTime(0.1, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

      osc3.connect(gain2);
      gain2.connect(ctx.destination);

      osc3.start(now + 0.12);
      osc3.stop(now + 0.45);

    } else if (type === 'SUPPORT') {
      // Warm, melodic reinforcement chime (A4 -> C#5 -> E5 arpeggio)
      const freqs = [440, 554.37, 659.25];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);

        const startTime = now + idx * 0.09;
        gain.gain.setValueAtTime(0, now);
        gain.gain.setValueAtTime(0.14, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.5);
      });

    } else if (type === 'MILESTONE') {
      // Celebratory fanfare (C5 -> E5 -> G5 -> C6) with sparkle
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = idx === notes.length - 1 ? 'triangle' : 'sine';
        const startTime = now + idx * 0.08;
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, now);
        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.65);
      });
    }
  } catch (err) {
    console.debug('Notification sound playback notice:', err);
  }
}
