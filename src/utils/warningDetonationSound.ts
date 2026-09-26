// Warning & Detonation Audio Engine (صوت الرجل الحقيقي المصاحب لرسالة التفجير)
// تشغيل التسجيل الصوتي الحقيقي للرجل فقط ومنع أي صوت اصطناعي أو SpeechSynthesis نهائياً

let activeAudioElement: HTMLAudioElement | null = null;

export function playDetonationWarningVoiceAndSound() {
  try {
    // 1. إيقاف أي صوت سابق فوراً، وإلغاء أي صوت للذكاء الاصطناعي تماماً
    if (activeAudioElement) {
      try {
        activeAudioElement.pause();
        activeAudioElement.currentTime = 0;
      } catch (e) {
        // ignore
      }
      activeAudioElement = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        // ignore
      }
    }

    // 2. تشغيل صوت الرجل الحقيقي فقط حصراً من الملف الصوتي المسجل عالي الجودة
    try {
      const audio = new Audio('/audio/detonation_warning_voice.wav');
      audio.volume = 1.0;
      activeAudioElement = audio;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("Direct male voice audio playback failed:", err);
        });
      }
    } catch (err) {
      console.warn("Audio element initialization failed:", err);
    }

    // 3. تشغيل مؤثرات سنث درامية تكتيكية عميقة في الخلفية (Sub-bass Tremor)
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }

        const now = ctx.currentTime;

        // هزّة عملاقة أرضية (Sub-bass Rumble)
        const subOsc = ctx.createOscillator();
        const subGain = ctx.createGain();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(120, now);
        subOsc.frequency.exponentialRampToValueAtTime(28, now + 2.5);
        subGain.gain.setValueAtTime(0.7, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 2.8);
        subOsc.connect(subGain);
        subGain.connect(ctx.destination);
        subOsc.start(now);
        subOsc.stop(now + 2.9);

        // إنذار هابط متدرج (Warning Staccato Siren)
        [0, 0.4, 0.8].forEach((delay, idx) => {
          const warnOsc = ctx.createOscillator();
          const warnGain = ctx.createGain();
          warnOsc.type = 'sawtooth';
          warnOsc.frequency.setValueAtTime(800 - idx * 70, now + delay);
          warnOsc.frequency.exponentialRampToValueAtTime(320, now + delay + 0.35);
          warnGain.gain.setValueAtTime(0, now + delay);
          warnGain.gain.linearRampToValueAtTime(0.22, now + delay + 0.04);
          warnGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.36);
          warnOsc.connect(warnGain);
          warnGain.connect(ctx.destination);
          warnOsc.start(now + delay);
          warnOsc.stop(now + delay + 0.38);
        });
      }
    } catch (e) {
      // ignore web audio errors
    }

  } catch (err) {
    console.warn("Detonation sound engine error:", err);
  }
}
