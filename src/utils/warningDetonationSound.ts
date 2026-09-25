// Warning & Detonation Cinematic Audio Engine (الصوت الملحمي المصاحب لرسالة التفجير)
// يشمل تشغيل التسجيل الملحمي عالي الدقة:
// "أنا وقت يلي بدي بحذر حدا، بحذرو مرة وحدة، وما عاد عيدها أبداً.. مرة وحدة! أنا بالمرة الثانية بحط وردة على قبره! لازم يكون فعلك أكبر من حكيك بكثير!"
// مصحوباً بمؤثرات صوتية هادرة وضخمة تناسب أجواء التفجير البحري وهيبة القبطان.

let activeAudioElement: HTMLAudioElement | null = null;

export function playDetonationWarningVoiceAndSound() {
  try {
    // 1. إيقاف أي صوت سابق إذا كان قيد التشغيل
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

    // 2. تشغيل الملف الصوتي المسجل عالي الدقة
    let audioPlayed = false;
    try {
      const audio = new Audio('/audio/detonation_warning_voice.wav');
      audio.volume = 1.0;
      activeAudioElement = audio;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            audioPlayed = true;
          })
          .catch((err) => {
            console.warn("Direct audio playback failed or was blocked by browser policy, falling back to Web Speech:", err);
            triggerWebSpeechFallback();
          });
      }
    } catch (err) {
      console.warn("Audio element initialization failed:", err);
      triggerWebSpeechFallback();
    }

    // 3. تشغيل مؤثرات سنث درامية تكتيكية مصاحبة (Sub-bass Tremor & Tension Synth)
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

    function triggerWebSpeechFallback() {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const speechText = "أنا وقت يلي بدي بحذر حدا، بحذرو مرة واحدة، وما عاد عيدها أبداً.. مرة واحدة! أنا بالمرة الثانية بحط وردة على قبره! لازم يكون فعلك أكبر من حكيك بكثير!";
        const utterance = new SpeechSynthesisUtterance(speechText);
        utterance.lang = 'ar-SA';
        utterance.rate = 0.92;
        utterance.pitch = 0.82;

        const voices = window.speechSynthesis.getVoices();
        const arabicVoice = voices.find(v => 
          v.lang.startsWith('ar') || 
          v.name.toLowerCase().includes('arabic') || 
          v.name.toLowerCase().includes('maged') || 
          v.name.toLowerCase().includes('tariq')
        );
        if (arabicVoice) {
          utterance.voice = arabicVoice;
        }

        try {
          window.speechSynthesis.speak(utterance);
        } catch (e) {
          console.debug("Speech synthesis trigger error:", e);
        }
      }
    }

  } catch (err) {
    console.warn("Detonation sound engine error:", err);
  }
}
