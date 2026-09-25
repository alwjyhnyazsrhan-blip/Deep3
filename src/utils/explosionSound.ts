// Professional Realistic Audio Engine for Weapons & Explosions
// Combines authentic recorded acoustic samples with real-time physical sub-bass pressure waves
// Includes zero-latency AudioBuffer pre-caching and procedural Web Audio fallback.

let audioCtx: AudioContext | null = null;
const audioBufferCache = new Map<string, AudioBuffer>();
const audioLoadingPromises = new Map<string, Promise<AudioBuffer | null>>();

export const WEAPON_AUDIO_URLS = {
  smallRocketIncoming: '/audio/small_rocket_incoming.mp3',
  smallRocketExplosion: '/audio/small_rocket_explosion.mp3',
  mediumRocketIncoming: '/audio/medium_rocket_incoming.mp3',
  mediumRocketExplosion: '/audio/medium_rocket_explosion.mp3',
  largeRocketIncoming: '/audio/large_rocket_incoming.mp3',
  largeRocketExplosion: '/audio/large_rocket_explosion.mp3',
  atomicBombDrop: '/audio/atomic_bomb_drop.mp3',
  atomicBombExplosion: '/audio/atomic_bomb_explosion.mp3',
  mediaBombExplosion: '/audio/media_bomb_explosion.mp3',
};

export function getAudioContext(): AudioContext | null {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch (e) {
    console.warn('Explosion AudioContext not available:', e);
    return null;
  }
}

export function isAudioMuted(): boolean {
  try {
    const isGlobalMuted = localStorage.getItem('pirate_is_muted') === 'true';
    const isSfxMuted = localStorage.getItem('pirate_sfx_muted') === 'true';
    return isGlobalMuted || isSfxMuted;
  } catch {
    return false;
  }
}

/**
 * Preloads and decodes an audio buffer into RAM for zero-latency playback
 */
async function loadAudioBuffer(ctx: AudioContext, url: string): Promise<AudioBuffer | null> {
  if (audioBufferCache.has(url)) {
    return audioBufferCache.get(url)!;
  }
  if (audioLoadingPromises.has(url)) {
    return audioLoadingPromises.get(url)!;
  }

  const promise = (async () => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const arrayBuffer = await res.arrayBuffer();
      const decoded = await ctx.decodeAudioData(arrayBuffer);
      audioBufferCache.set(url, decoded);
      return decoded;
    } catch (err) {
      console.debug(`Audio sample load notice (${url}):`, err);
      return null;
    } finally {
      audioLoadingPromises.delete(url);
    }
  })();

  audioLoadingPromises.set(url, promise);
  return promise;
}

/**
 * Preload all realistic weapon audio files
 */
export function preloadWeaponSounds() {
  const ctx = getAudioContext();
  if (!ctx) return;
  Object.values(WEAPON_AUDIO_URLS).forEach(url => {
    loadAudioBuffer(ctx, url).catch(() => {});
  });
}

// Auto-warm and unlock audio context on first user interaction
if (typeof window !== 'undefined') {
  const warmUp = () => {
    preloadWeaponSounds();
    window.removeEventListener('click', warmUp);
    window.removeEventListener('touchstart', warmUp);
    window.removeEventListener('keydown', warmUp);
  };
  window.addEventListener('click', warmUp, { passive: true, once: true });
  window.addEventListener('touchstart', warmUp, { passive: true, once: true });
  window.addEventListener('keydown', warmUp, { passive: true, once: true });
  // Initial passive preload attempt
  setTimeout(() => preloadWeaponSounds(), 1500);
}

/**
 * Generates an acoustic saturation curve for distortion
 */
function makeDistortionCurve(amount = 18): Float32Array {
  const k = amount;
  const n_samples = 22050;
  const curve = new Float32Array(n_samples);
  const deg = Math.PI / 180;
  for (let i = 0; i < n_samples; ++i) {
    const x = (i * 2) / n_samples - 1;
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

/**
 * Creates pink/white noise buffer for procedural fallback
 */
function createNoiseBuffer(ctx: AudioContext, durationSeconds = 2.5): AudioBuffer {
  const bufferSize = Math.floor(ctx.sampleRate * durationSeconds);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
    b6 = white * 0.115926;
    data[i] = (pink * 0.12) + (white * 0.08);
  }
  return buffer;
}

/**
 * Physical sub-bass pressure wave (infrasonic chest punch)
 */
function playSubBassConcussion(
  ctx: AudioContext,
  now: number,
  startFreq: number,
  endFreq: number,
  duration: number,
  peakGain: number
) {
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const distortion = ctx.createWaveShaper();
    distortion.curve = makeDistortionCurve(12);
    distortion.oversample = '2x';

    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(16, endFreq), now + duration * 0.85);

    gain.gain.setValueAtTime(peakGain, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(distortion);
    distortion.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.05);
  } catch {
    // Ignore sub-bass errors
  }
}

/**
 * Core realistic sample player with physical acoustic layer and procedural fallback
 */
function playRealisticSample(
  url: string,
  options: {
    volume?: number;
    subFreqStart?: number;
    subFreqEnd?: number;
    subDuration?: number;
    subGain?: number;
    fallbackFn?: () => void;
  } = {}
) {
  if (isAudioMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) {
    // Attempt standard HTMLAudio fallback
    try {
      const audio = new Audio(url);
      audio.volume = Math.min(1.0, options.volume ?? 1.0);
      audio.play().catch(() => {
        if (options.fallbackFn) options.fallbackFn();
      });
    } catch {
      if (options.fallbackFn) options.fallbackFn();
    }
    return;
  }

  const {
    volume = 1.0,
    subFreqStart = 80,
    subFreqEnd = 24,
    subDuration = 1.0,
    subGain = 0.5,
    fallbackFn,
  } = options;

  const now = ctx.currentTime;

  // Add physical sub-bass acoustic pressure wave
  if (subGain > 0) {
    playSubBassConcussion(ctx, now, subFreqStart, subFreqEnd, subDuration, subGain);
  }

  // If buffer is already decoded in memory, play with sample-level accuracy
  const cached = audioBufferCache.get(url);
  if (cached) {
    try {
      const source = ctx.createBufferSource();
      source.buffer = cached;
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(volume, now);
      source.connect(gainNode);
      gainNode.connect(ctx.destination);
      source.start(now);
      return;
    } catch {
      // fallback below
    }
  }

  // Not in RAM yet: play HTML5 audio immediately for zero-lag sound, and warm the buffer cache
  try {
    const audio = new Audio(url);
    audio.volume = Math.min(1.0, volume);
    audio.play().catch(() => {
      if (fallbackFn) fallbackFn();
    });
  } catch {
    if (fallbackFn) fallbackFn();
  }

  // Background decode for future shots
  loadAudioBuffer(ctx, url).catch(() => {});
}

/* =========================================================================
   1. SMALL ROCKET (صاروخ صغير)
   Real missile flight whoosh + crisp tactical detonation & flying debris
   ========================================================================= */

export function playSmallRocketIncomingSound() {
  playRealisticSample(WEAPON_AUDIO_URLS.smallRocketIncoming, {
    volume: 0.95,
    subGain: 0,
    fallbackFn: synthesizeSmallRocketIncoming,
  });
}

export function playSmallRocketExplosionSound() {
  playRealisticSample(WEAPON_AUDIO_URLS.smallRocketExplosion, {
    volume: 1.0,
    subFreqStart: 160,
    subFreqEnd: 36,
    subDuration: 0.7,
    subGain: 0.75,
    fallbackFn: synthesizeSmallRocketExplosion,
  });
}

/* =========================================================================
   2. MEDIUM ROCKET (صاروخ متوسط)
   Cruise missile jet roar + heavy ordnance booming explosion & rolling shockwave
   ========================================================================= */

export function playMediumRocketIncomingSound() {
  playRealisticSample(WEAPON_AUDIO_URLS.mediumRocketIncoming, {
    volume: 0.95,
    subGain: 0,
    fallbackFn: synthesizeMediumRocketIncoming,
  });
}

export function playMediumRocketExplosionSound() {
  playRealisticSample(WEAPON_AUDIO_URLS.mediumRocketExplosion, {
    volume: 1.0,
    subFreqStart: 140,
    subFreqEnd: 28,
    subDuration: 1.2,
    subGain: 0.9,
    fallbackFn: synthesizeMediumRocketExplosion,
  });
}

/* =========================================================================
   3. LARGE ROCKET (صاروخ كبير)
   Supersonic ballistic missile scream + massive anti-ship warhead blast & ocean rumble
   ========================================================================= */

export function playLargeRocketIncomingSound() {
  playRealisticSample(WEAPON_AUDIO_URLS.largeRocketIncoming, {
    volume: 1.0,
    subGain: 0,
    fallbackFn: synthesizeLargeRocketIncoming,
  });
}

export function playLargeRocketExplosionSound() {
  playRealisticSample(WEAPON_AUDIO_URLS.largeRocketExplosion, {
    volume: 1.0,
    subFreqStart: 120,
    subFreqEnd: 22,
    subDuration: 1.8,
    subGain: 1.1,
    fallbackFn: synthesizeLargeRocketExplosion,
  });
}

/* =========================================================================
   4. ATOMIC BOMB (قنبلة ذرية)
   High-altitude atmospheric falling whistle + colossal thermonuclear shockwave
   ========================================================================= */

export function playAtomicBombDropSound() {
  playRealisticSample(WEAPON_AUDIO_URLS.atomicBombDrop, {
    volume: 1.0,
    subGain: 0,
    fallbackFn: synthesizeAtomicBombDrop,
  });
}

export function playAtomicBombExplosionSound() {
  playRealisticSample(WEAPON_AUDIO_URLS.atomicBombExplosion, {
    volume: 1.0,
    subFreqStart: 95,
    subFreqEnd: 16,
    subDuration: 3.2,
    subGain: 1.25,
    fallbackFn: synthesizeAtomicBombExplosion,
  });
}

/* =========================================================================
   5. MEDIA / SMOKE BOMB (قنبلة إعلانية / دخانية)
   Concussive dispersion pop + pressurized expanding smoke release
   ========================================================================= */

export function playMediaBombExplosionSound() {
  playRealisticSample(WEAPON_AUDIO_URLS.mediaBombExplosion, {
    volume: 0.9,
    subFreqStart: 140,
    subFreqEnd: 45,
    subDuration: 0.5,
    subGain: 0.5,
    fallbackFn: synthesizeSmallRocketExplosion,
  });
}

/* =========================================================================
   PROCEDURAL SYNTHESIS FALLBACKS
   High-quality multi-layer synthesis fallback if audio files cannot load
   ========================================================================= */

function synthesizeSmallRocketIncoming() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const duration = 0.75;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1750, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + duration);
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.18, now + duration * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  } catch (e) {
    console.debug(e);
  }
}

function synthesizeSmallRocketExplosion() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  try {
    const crackOsc = ctx.createOscillator();
    const crackGain = ctx.createGain();
    crackOsc.type = 'triangle';
    crackOsc.frequency.setValueAtTime(390, now);
    crackOsc.frequency.exponentialRampToValueAtTime(50, now + 0.05);
    crackGain.gain.setValueAtTime(0.7, now);
    crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    crackOsc.connect(crackGain);
    crackGain.connect(ctx.destination);
    crackOsc.start(now);
    crackOsc.stop(now + 0.07);

    const noiseBuffer = createNoiseBuffer(ctx, 1.2);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2600, now);
    filter.frequency.exponentialRampToValueAtTime(120, now + 0.8);
    filter.Q.setValueAtTime(3.5, now);
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.9, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    noiseSource.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseSource.start(now);
    noiseSource.stop(now + 0.95);
  } catch (e) {
    console.debug(e);
  }
}

function synthesizeMediumRocketIncoming() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const duration = 0.9;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1550, now);
    osc.frequency.exponentialRampToValueAtTime(310, now + duration);
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.2, now + duration * 0.75);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  } catch (e) {
    console.debug(e);
  }
}

function synthesizeMediumRocketExplosion() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  try {
    const crackOsc = ctx.createOscillator();
    const crackGain = ctx.createGain();
    crackOsc.type = 'sawtooth';
    crackOsc.frequency.setValueAtTime(320, now);
    crackOsc.frequency.exponentialRampToValueAtTime(35, now + 0.08);
    crackGain.gain.setValueAtTime(0.8, now);
    crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    crackOsc.connect(crackGain);
    crackGain.connect(ctx.destination);
    crackOsc.start(now);
    crackOsc.stop(now + 0.1);

    const noiseBuffer = createNoiseBuffer(ctx, 1.8);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000, now);
    filter.frequency.exponentialRampToValueAtTime(90, now + 1.1);
    filter.Q.setValueAtTime(3.8, now);
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.95, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    noiseSource.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseSource.start(now);
    noiseSource.stop(now + 1.25);
  } catch (e) {
    console.debug(e);
  }
}

function synthesizeLargeRocketIncoming() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const duration = 1.3;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1350, now);
    osc.frequency.exponentialRampToValueAtTime(360, now + duration);
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.22, now + duration * 0.75);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  } catch (e) {
    console.debug(e);
  }
}

function synthesizeLargeRocketExplosion() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  try {
    const crackOsc = ctx.createOscillator();
    const crackGain = ctx.createGain();
    crackOsc.type = 'triangle';
    crackOsc.frequency.setValueAtTime(280, now);
    crackOsc.frequency.exponentialRampToValueAtTime(40, now + 0.08);
    crackGain.gain.setValueAtTime(0.6, now);
    crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    crackOsc.connect(crackGain);
    crackGain.connect(ctx.destination);
    crackOsc.start(now);
    crackOsc.stop(now + 0.1);

    const noiseBuffer = createNoiseBuffer(ctx, 2.5);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, now);
    filter.frequency.exponentialRampToValueAtTime(75, now + 1.6);
    filter.Q.setValueAtTime(4.0, now);
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.95, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
    noiseSource.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseSource.start(now);
    noiseSource.stop(now + 2.1);
  } catch (e) {
    console.debug(e);
  }
}

function synthesizeAtomicBombDrop() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const duration = 1.18;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1280, now);
    osc.frequency.exponentialRampToValueAtTime(260, now + duration);
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.2, now + duration * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  } catch (e) {
    console.debug(e);
  }
}

function synthesizeAtomicBombExplosion() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  try {
    const crackOsc = ctx.createOscillator();
    const crackGain = ctx.createGain();
    crackOsc.type = 'triangle';
    crackOsc.frequency.setValueAtTime(320, now);
    crackOsc.frequency.exponentialRampToValueAtTime(30, now + 0.1);
    crackGain.gain.setValueAtTime(0.8, now);
    crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    crackOsc.connect(crackGain);
    crackGain.connect(ctx.destination);
    crackOsc.start(now);
    crackOsc.stop(now + 0.13);

    const noiseBuffer = createNoiseBuffer(ctx, 4.0);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, now);
    filter.frequency.exponentialRampToValueAtTime(45, now + 3.0);
    filter.Q.setValueAtTime(4.8, now);
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(1.2, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 3.8);
    noiseSource.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseSource.start(now);
    noiseSource.stop(now + 4.0);
  } catch (e) {
    console.debug(e);
  }
}

/**
 * Realistic heavy ordnance ocean water plunge & penetration splash sound
 */
export function playWaterPlungeSound() {
  if (isAudioMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  try {
    // 1. Water displacement gulp / dive tone
    const diveOsc = ctx.createOscillator();
    const diveGain = ctx.createGain();
    diveOsc.type = 'sine';
    diveOsc.frequency.setValueAtTime(580, now);
    diveOsc.frequency.exponentialRampToValueAtTime(95, now + 0.38);
    diveGain.gain.setValueAtTime(0.45, now);
    diveGain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
    diveOsc.connect(diveGain);
    diveGain.connect(ctx.destination);
    diveOsc.start(now);
    diveOsc.stop(now + 0.45);

    // 2. Foaming water surface splash spray noise
    const splashBuffer = createNoiseBuffer(ctx, 0.65);
    const splashSource = ctx.createBufferSource();
    splashSource.buffer = splashBuffer;
    const splashFilter = ctx.createBiquadFilter();
    splashFilter.type = 'bandpass';
    splashFilter.frequency.setValueAtTime(2200, now);
    splashFilter.frequency.exponentialRampToValueAtTime(380, now + 0.55);
    splashFilter.Q.setValueAtTime(2.2, now);
    const splashGain = ctx.createGain();
    splashGain.gain.setValueAtTime(0.7, now);
    splashGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    splashSource.connect(splashFilter);
    splashFilter.connect(splashGain);
    splashGain.connect(ctx.destination);
    splashSource.start(now);
    splashSource.stop(now + 0.65);
  } catch (e) {
    console.debug(e);
  }
}
