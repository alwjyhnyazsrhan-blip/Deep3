import React, { useEffect, useState } from 'react';

interface LargeRocketExplosionProps {
  x: string | number; // Target coordinate (e.g. "45%" or pixels)
  y: string | number; // Target coordinate (e.g. "50%" or pixels)
  onComplete?: () => void;
  damage?: number;
}

export const LargeRocketExplosion: React.FC<LargeRocketExplosionProps> = ({
  x,
  y,
  onComplete,
  damage = 18000
}) => {
  const [phase, setPhase] = useState<'detonate' | 'billow' | 'smoke' | 'fade'>('detonate');

  useEffect(() => {
    // Progression of explosion animation phases
    const t1 = setTimeout(() => setPhase('billow'), 120);
    const t2 = setTimeout(() => setPhase('smoke'), 450);
    const t3 = setTimeout(() => setPhase('fade'), 1100);
    const t4 = setTimeout(() => {
      if (onComplete) onComplete();
    }, 1600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div
      style={{
        position: 'absolute',
        left: typeof x === 'number' ? `${x}px` : x,
        top: typeof y === 'number' ? `${y}px` : y,
        transform: 'translate(-50%, -50%)',
        zIndex: 9998,
        pointerEvents: 'none',
        width: '320px',
        height: '320px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <style>{`
        @keyframes explosion-burst-core {
          0% {
            transform: scale(0.15) rotate(-10deg);
            opacity: 0.2;
            filter: brightness(3.5);
          }
          20% {
            transform: scale(1.15) rotate(0deg);
            opacity: 1;
            filter: brightness(2.0);
          }
          45% {
            transform: scale(1.35) rotate(4deg);
            opacity: 0.98;
            filter: brightness(1.2);
          }
          75% {
            transform: scale(1.45) rotate(8deg);
            opacity: 0.75;
            filter: brightness(0.9) saturate(0.85);
          }
          100% {
            transform: scale(1.55) rotate(12deg);
            opacity: 0;
            filter: blur(12px) brightness(0.4);
          }
        }

        @keyframes blast-spike-expand {
          0% {
            transform: scale(0.2) rotate(0deg);
            opacity: 0;
          }
          25% {
            transform: scale(1.3) rotate(15deg);
            opacity: 1;
          }
          60% {
            transform: scale(1.55) rotate(25deg);
            opacity: 0.5;
          }
          100% {
            transform: scale(1.7) rotate(35deg);
            opacity: 0;
          }
        }

        @keyframes shockwave-ring-blast {
          0% {
            transform: scale(0.1);
            opacity: 1;
            border-width: 18px;
          }
          50% {
            opacity: 0.8;
            border-width: 8px;
          }
          100% {
            transform: scale(2.6);
            opacity: 0;
            border-width: 1px;
          }
        }

        @keyframes flying-spark-1 {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(85px, -90px) scale(0); opacity: 0; }
        }
        @keyframes flying-spark-2 {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(-95px, -80px) scale(0); opacity: 0; }
        }
        @keyframes flying-spark-3 {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(110px, 30px) scale(0); opacity: 0; }
        }
        @keyframes flying-spark-4 {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(-105px, 40px) scale(0); opacity: 0; }
        }
        @keyframes flying-spark-5 {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(30px, -115px) scale(0); opacity: 0; }
        }
        @keyframes flying-spark-6 {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(-40px, -110px) scale(0); opacity: 0; }
        }
        @keyframes smoke-cloud-rise {
          0% { transform: scale(0.7) translateY(0); opacity: 0; }
          30% { transform: scale(1.1) translateY(-15px); opacity: 0.85; }
          70% { transform: scale(1.3) translateY(-35px); opacity: 0.6; }
          100% { transform: scale(1.5) translateY(-55px); opacity: 0; filter: blur(10px); }
        }
      `}</style>

      {/* 1. Detonation Flash (Radial Water Glow) */}
      <div
        style={{
          position: 'absolute',
          inset: '-60px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(254, 240, 138, 0.95) 0%, rgba(249, 115, 22, 0.7) 40%, rgba(220, 38, 38, 0.4) 65%, transparent 80%)',
          animation: 'fade-in-out 0.45s ease-out forwards',
          zIndex: 1,
        }}
      />

      {/* 2. Expanding Shockwave Ring */}
      <div
        style={{
          position: 'absolute',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          border: '12px solid #facc15',
          boxShadow: '0 0 25px #f97316, inset 0 0 15px #fef08a',
          animation: 'shockwave-ring-blast 0.65s cubic-bezier(0.1, 0.7, 0.1, 1) forwards',
          zIndex: 2,
        }}
      />

      {/* 3. Comic Blast Spikes / Starburst Needles */}
      <div
        style={{
          position: 'absolute',
          width: '280px',
          height: '280px',
          animation: 'blast-spike-expand 0.7s cubic-bezier(0.15, 0.85, 0.35, 1) forwards',
          zIndex: 3,
        }}
      >
        <svg viewBox="0 0 200 200" width="100%" height="100%">
          <defs>
            <linearGradient id="spikeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="35%" stopColor="#fde047" />
              <stop offset="70%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
          </defs>
          {/* 12 Sharp Starburst Spikes radiating outward */}
          <polygon
            points="
              100,20 108,82 165,35 120,92 185,90 122,108 175,160 108,122 100,185 92,122 
              25,165 80,108 15,95 82,92 35,35 92,82
            "
            fill="url(#spikeGrad)"
            stroke="#451a03"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* 4. Multi-Lobed Scalloped Cartoon Explosion Clouds (Matches Video Exactly) */}
      <div
        style={{
          position: 'absolute',
          width: '290px',
          height: '290px',
          animation: 'explosion-burst-core 1.25s cubic-bezier(0.12, 0.8, 0.32, 1) forwards',
          zIndex: 4,
          filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.65))',
        }}
      >
        <svg viewBox="0 0 300 300" width="100%" height="100%">
          <defs>
            {/* Primary Golden-Yellow Fireball Gradient */}
            <radialGradient id="cloudFireGrad" cx="45%" cy="40%" r="55%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="25%" stopColor="#fef08a" />
              <stop offset="55%" stopColor="#facc15" />
              <stop offset="80%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#c2410c" />
            </radialGradient>

            {/* Inner Highlight Gradient */}
            <radialGradient id="innerBubbleGrad" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#fef9c3" />
              <stop offset="100%" stopColor="#fde047" />
            </radialGradient>

            {/* Orange Flame Accent Gradient */}
            <linearGradient id="flameShadeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="60%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#9a3412" />
            </linearGradient>
          </defs>

          {/* Background Shadow Silhouette for High Comic Contrast */}
          <path
            d="
              M 150 50
              C 180 40, 215 65, 220 95
              C 255 105, 265 145, 245 175
              C 260 210, 230 245, 195 240
              C 175 258, 130 260, 110 240
              C 75 250, 45 220, 55 185
              C 30 155, 45 115, 75 100
              C 75 65, 120 45, 150 50 Z
            "
            fill="#3f1a04"
            transform="scale(1.04) translate(-6, -6)"
          />

          {/* Main Scalloped Cloud Mass */}
          <path
            d="
              M 150 55
              C 180 45, 210 70, 215 95
              C 248 105, 258 142, 240 170
              C 252 205, 225 238, 192 232
              C 172 250, 128 252, 108 232
              C 75 242, 48 212, 58 180
              C 35 152, 48 112, 78 98
              C 78 68, 120 48, 150 55 Z
            "
            fill="url(#cloudFireGrad)"
            stroke="#451a03"
            strokeWidth="5"
            strokeLinejoin="round"
          />

          {/* Secondary Internal Billow Lobe Arcs (Cartoon Depth) */}
          {/* Top-Right Bubble */}
          <circle cx="185" cy="100" r="38" fill="url(#innerBubbleGrad)" stroke="#78350f" strokeWidth="2.5" />
          {/* Center Main Core */}
          <circle cx="145" cy="145" r="52" fill="url(#innerBubbleGrad)" stroke="#78350f" strokeWidth="3" />
          {/* Left Bubble */}
          <circle cx="95" cy="135" r="36" fill="url(#innerBubbleGrad)" stroke="#78350f" strokeWidth="2.5" />
          {/* Right Bubble */}
          <circle cx="205" cy="155" r="34" fill="url(#innerBubbleGrad)" stroke="#78350f" strokeWidth="2.5" />
          {/* Bottom-Center Bubble */}
          <circle cx="145" cy="190" r="36" fill="url(#flameShadeGrad)" stroke="#451a03" strokeWidth="2.5" />
          {/* Bottom-Left Bubble */}
          <circle cx="100" cy="185" r="28" fill="url(#flameShadeGrad)" stroke="#451a03" strokeWidth="2" />
          {/* Bottom-Right Bubble */}
          <circle cx="190" cy="195" r="28" fill="url(#flameShadeGrad)" stroke="#451a03" strokeWidth="2" />

          {/* Bright Hot White Highlights Inside Bubbles */}
          <ellipse cx="140" cy="130" rx="22" ry="14" fill="#ffffff" opacity="0.9" />
          <ellipse cx="180" cy="92" rx="14" ry="8" fill="#ffffff" opacity="0.85" />
          <ellipse cx="92" cy="125" rx="12" ry="7" fill="#ffffff" opacity="0.85" />
        </svg>
      </div>

      {/* 5. Secondary Rising Charcoal Smoke Clouds (Phase 2) */}
      {(phase === 'smoke' || phase === 'fade') && (
        <div
          style={{
            position: 'absolute',
            width: '260px',
            height: '260px',
            animation: 'smoke-cloud-rise 1.1s cubic-bezier(0.2, 0.6, 0.35, 1) forwards',
            zIndex: 5,
          }}
        >
          <svg viewBox="0 0 200 200" width="100%" height="100%">
            <defs>
              <radialGradient id="smokeDarkGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="60%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </radialGradient>
            </defs>
            <path
              d="
                M 100 40
                C 125 35, 145 50, 150 70
                C 175 78, 180 105, 168 125
                C 175 150, 155 170, 132 165
                C 118 178, 85 178, 72 165
                C 50 170, 32 150, 40 128
                C 25 108, 35 80, 55 70
                C 58 50, 85 38, 100 40 Z
              "
              fill="url(#smokeDarkGrad)"
              opacity="0.85"
            />
          </svg>
        </div>
      )}

      {/* 6. Flying Fiery Embers & Sparks */}
      <div style={{ position: 'absolute', width: '10px', height: '10px', zIndex: 6 }}>
        <div style={{ position: 'absolute', width: '12px', height: '12px', borderRadius: '50%', background: '#fef08a', boxShadow: '0 0 10px #f97316', animation: 'flying-spark-1 0.7s ease-out forwards' }} />
        <div style={{ position: 'absolute', width: '10px', height: '10px', borderRadius: '50%', background: '#facc15', boxShadow: '0 0 8px #ea580c', animation: 'flying-spark-2 0.75s ease-out forwards' }} />
        <div style={{ position: 'absolute', width: '14px', height: '14px', borderRadius: '50%', background: '#ffffff', boxShadow: '0 0 12px #facc15', animation: 'flying-spark-3 0.8s ease-out forwards' }} />
        <div style={{ position: 'absolute', width: '9px', height: '9px', borderRadius: '50%', background: '#f97316', boxShadow: '0 0 8px #dc2626', animation: 'flying-spark-4 0.65s ease-out forwards' }} />
        <div style={{ position: 'absolute', width: '11px', height: '11px', borderRadius: '50%', background: '#fef08a', boxShadow: '0 0 10px #f97316', animation: 'flying-spark-5 0.7s ease-out forwards' }} />
        <div style={{ position: 'absolute', width: '8px', height: '8px', borderRadius: '50%', background: '#facc15', boxShadow: '0 0 6px #ea580c', animation: 'flying-spark-6 0.85s ease-out forwards' }} />
      </div>

      {/* 7. Floating Combat Damage Numbers */}
      <div
        style={{
          position: 'absolute',
          top: '-35px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(185, 28, 28, 0.95))',
          border: '2.5px solid #fde047',
          borderRadius: '12px',
          padding: '6px 18px',
          color: '#ffffff',
          fontWeight: 900,
          fontSize: '18px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.8), 0 0 15px rgba(249, 115, 22, 0.6)',
          zIndex: 10,
          whiteSpace: 'nowrap',
          animation: 'fade-in-out 1.4s ease-out forwards',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          direction: 'rtl',
        }}
      >
        <span>💥</span>
        <span>-{damage.toLocaleString()} HP</span>
      </div>
    </div>
  );
};

export default LargeRocketExplosion;
