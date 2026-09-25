import React, { useEffect, useState } from 'react';

interface SmallRocketExplosionProps {
  x: string | number; // Target coordinate (e.g. "45%" or pixels)
  y: string | number; // Target coordinate (e.g. "50%" or pixels)
  onComplete?: () => void;
  damage?: number;
}

export const SmallRocketExplosion: React.FC<SmallRocketExplosionProps> = ({
  x,
  y,
  onComplete,
  damage = 800
}) => {
  const [phase, setPhase] = useState<'detonate' | 'expand' | 'billow' | 'dissolve'>('detonate');

  useEffect(() => {
    // Precise timing matching the fast, snappy comic explosion in the video (~0.85s total)
    const t1 = setTimeout(() => setPhase('expand'), 60);
    const t2 = setTimeout(() => setPhase('billow'), 220);
    const t3 = setTimeout(() => setPhase('dissolve'), 550);
    const t4 = setTimeout(() => {
      if (onComplete) onComplete();
    }, 850);

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
        width: '240px',
        height: '240px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <style>{`
        @keyframes small-cloud-burst {
          0% {
            transform: scale(0.18) rotate(-8deg);
            opacity: 0.3;
            filter: brightness(2.8);
          }
          22% {
            transform: scale(1.12) rotate(2deg);
            opacity: 1;
            filter: brightness(1.6);
          }
          50% {
            transform: scale(1.28) rotate(4deg);
            opacity: 0.98;
            filter: brightness(1.1);
          }
          75% {
            transform: scale(1.36) rotate(6deg);
            opacity: 0.75;
            filter: brightness(0.95);
          }
          100% {
            transform: scale(1.42) translateY(-8px) rotate(8deg);
            opacity: 0;
            filter: blur(8px) brightness(0.6);
          }
        }

        @keyframes small-shockwave {
          0% {
            transform: scale(0.15);
            opacity: 0.95;
            border-width: 10px;
          }
          50% {
            opacity: 0.7;
            border-width: 5px;
          }
          100% {
            transform: scale(2.0);
            opacity: 0;
            border-width: 1px;
          }
        }

        @keyframes small-starburst-expand {
          0% {
            transform: scale(0.15) rotate(0deg);
            opacity: 0.2;
          }
          25% {
            transform: scale(1.25) rotate(15deg);
            opacity: 1;
          }
          55% {
            transform: scale(1.4) rotate(25deg);
            opacity: 0.6;
          }
          100% {
            transform: scale(1.55) rotate(35deg);
            opacity: 0;
          }
        }

        @keyframes puff-fly-1 {
          0% { transform: translate(0, 0) scale(0.4); opacity: 1; }
          100% { transform: translate(65px, -55px) scale(1.1); opacity: 0; }
        }
        @keyframes puff-fly-2 {
          0% { transform: translate(0, 0) scale(0.4); opacity: 1; }
          100% { transform: translate(-65px, -50px) scale(1.05); opacity: 0; }
        }
        @keyframes puff-fly-3 {
          0% { transform: translate(0, 0) scale(0.4); opacity: 1; }
          100% { transform: translate(75px, 35px) scale(0.95); opacity: 0; }
        }
        @keyframes puff-fly-4 {
          0% { transform: translate(0, 0) scale(0.4); opacity: 1; }
          100% { transform: translate(-70px, 40px) scale(0.95); opacity: 0; }
        }
        @keyframes puff-fly-5 {
          0% { transform: translate(0, 0) scale(0.3); opacity: 1; }
          100% { transform: translate(0px, -75px) scale(1.2); opacity: 0; }
        }

        @keyframes damage-float-up {
          0% {
            transform: translateY(10px) scale(0.7);
            opacity: 0;
          }
          20% {
            transform: translateY(-15px) scale(1.2);
            opacity: 1;
          }
          65% {
            transform: translateY(-38px) scale(1.1);
            opacity: 1;
          }
          100% {
            transform: translateY(-60px) scale(0.9);
            opacity: 0;
          }
        }
      `}</style>

      {/* 1. Detonation Flash */}
      <div
        style={{
          position: 'absolute',
          inset: '-30px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(254, 240, 138, 0.95) 0%, rgba(249, 115, 22, 0.6) 35%, rgba(220, 38, 38, 0.3) 60%, transparent 75%)',
          animation: 'fade-in-out 0.35s ease-out forwards',
          zIndex: 1,
        }}
      />

      {/* 2. Rapid Expanding Shockwave Ring */}
      <div
        style={{
          position: 'absolute',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          border: '8px solid #fde047',
          boxShadow: '0 0 16px #f97316, inset 0 0 10px #fef08a',
          animation: 'small-shockwave 0.5s cubic-bezier(0.1, 0.7, 0.1, 1) forwards',
          zIndex: 2,
        }}
      />

      {/* 3. Comic Starburst Flash Behind Smoke */}
      <div
        style={{
          position: 'absolute',
          width: '200px',
          height: '200px',
          animation: 'small-starburst-expand 0.55s cubic-bezier(0.15, 0.85, 0.35, 1) forwards',
          zIndex: 3,
        }}
      >
        <svg viewBox="0 0 200 200" width="100%" height="100%">
          <defs>
            <linearGradient id="smallSpikeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="30%" stopColor="#fef08a" />
              <stop offset="65%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>
          <polygon
            points="
              100,15 106,75 160,30 118,85 180,85 120,105 170,155 106,120 100,180 94,120 
              30,160 82,105 20,90 82,85 40,30 94,75
            "
            fill="url(#smallSpikeGrad)"
            stroke="#292524"
            strokeWidth="3"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* 4. Multi-Lobed Cream/Yellow Comic Smoke Cloud Cluster (Matches User Video Exactly) */}
      <div
        style={{
          position: 'absolute',
          width: '220px',
          height: '220px',
          animation: 'small-cloud-burst 0.85s cubic-bezier(0.12, 0.8, 0.32, 1) forwards',
          zIndex: 4,
          filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.65))',
        }}
      >
        <svg viewBox="0 0 260 260" width="100%" height="100%">
          <defs>
            {/* Main Cream / Butter-Yellow Cloud Gradient */}
            <radialGradient id="smallCloudGrad" cx="45%" cy="38%" r="60%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="28%" stopColor="#fffbeb" />
              <stop offset="55%" stopColor="#fef08a" />
              <stop offset="82%" stopColor="#fde047" />
              <stop offset="98%" stopColor="#eab308" />
            </radialGradient>

            {/* Puff Shading Gradient for underside of lobes */}
            <linearGradient id="puffUnderShade" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="45%" stopColor="#f59e0b" />
              <stop offset="85%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>

            {/* Inner Core Light Gradient */}
            <radialGradient id="innerPuffHighlight" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#fffdf5" />
              <stop offset="100%" stopColor="#fef9c3" />
            </radialGradient>
          </defs>

          {/* Dark Comic Silhouette Base Shadow */}
          <path
            d="
              M 130 45
              C 160 38, 190 58, 195 85
              C 225 95, 235 130, 218 158
              C 230 188, 205 218, 175 212
              C 158 228, 118 230, 100 212
              C 70 220, 45 195, 52 165
              C 30 138, 42 102, 70 90
              C 70 58, 105 40, 130 45 Z
            "
            fill="#1c1917"
            transform="scale(1.05) translate(-6, -6)"
          />

          {/* Main Scalloped Bubbly Cloud Mass */}
          <path
            d="
              M 130 50
              C 158 42, 185 62, 190 88
              C 218 98, 228 128, 212 154
              C 222 182, 198 210, 170 205
              C 154 220, 116 222, 98 205
              C 70 212, 48 188, 55 160
              C 34 135, 45 100, 72 88
              C 72 60, 105 42, 130 50 Z
            "
            fill="url(#smallCloudGrad)"
            stroke="#1c1917"
            strokeWidth="4"
            strokeLinejoin="round"
          />

          {/* Internal Bulging Lobes with Dark Comic Inking */}
          {/* Top-Right Lobe */}
          <circle cx="160" cy="92" r="32" fill="url(#innerPuffHighlight)" stroke="#292524" strokeWidth="2.5" />
          {/* Center Main Core Lobe */}
          <circle cx="128" cy="128" r="44" fill="url(#innerPuffHighlight)" stroke="#292524" strokeWidth="2.8" />
          {/* Left Lobe */}
          <circle cx="85" cy="120" r="30" fill="url(#innerPuffHighlight)" stroke="#292524" strokeWidth="2.5" />
          {/* Right Lobe */}
          <circle cx="178" cy="138" r="28" fill="url(#innerPuffHighlight)" stroke="#292524" strokeWidth="2.5" />
          {/* Bottom-Center Lobe */}
          <circle cx="128" cy="168" r="32" fill="url(#puffUnderShade)" stroke="#1c1917" strokeWidth="2.5" />
          {/* Bottom-Left Lobe */}
          <circle cx="88" cy="164" r="24" fill="url(#puffUnderShade)" stroke="#1c1917" strokeWidth="2.2" />
          {/* Bottom-Right Lobe */}
          <circle cx="168" cy="172" r="24" fill="url(#puffUnderShade)" stroke="#1c1917" strokeWidth="2.2" />

          {/* Bright Crisp White Highlights */}
          <ellipse cx="124" cy="116" rx="18" ry="11" fill="#ffffff" opacity="0.95" />
          <ellipse cx="156" cy="85" rx="12" ry="7" fill="#ffffff" opacity="0.9" />
          <ellipse cx="82" cy="112" rx="10" ry="6" fill="#ffffff" opacity="0.9" />

          {/* Inner Comic Crease Curves */}
          <path d="M 110 100 Q 128 112 146 100" fill="none" stroke="#d97706" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M 148 140 Q 165 152 178 142" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
          <path d="M 78 135 Q 92 148 106 138" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      {/* 5. Small Flying Comic Smoke Puffs Expanding Outward */}
      <div
        style={{
          position: 'absolute',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: '#fef08a',
          border: '2px solid #1c1917',
          boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
          animation: 'puff-fly-1 0.7s ease-out forwards',
          zIndex: 5,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: '#fffbeb',
          border: '2px solid #1c1917',
          boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
          animation: 'puff-fly-2 0.72s ease-out forwards',
          zIndex: 5,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: '#fde047',
          border: '2px solid #1c1917',
          boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
          animation: 'puff-fly-3 0.68s ease-out forwards',
          zIndex: 5,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          background: '#fef08a',
          border: '2px solid #1c1917',
          boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
          animation: 'puff-fly-4 0.7s ease-out forwards',
          zIndex: 5,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '26px',
          height: '26px',
          borderRadius: '50%',
          background: '#fef9c3',
          border: '2.5px solid #1c1917',
          boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
          animation: 'puff-fly-5 0.75s ease-out forwards',
          zIndex: 5,
        }}
      />

      {/* 6. Floating Impact Damage Number (e.g. -800) */}
      <div
        style={{
          position: 'absolute',
          top: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          fontFamily: '"Cairo", sans-serif',
          fontWeight: 900,
          fontSize: '22px',
          color: '#ef4444',
          textShadow: '0 0 4px #fff, 0 0 10px #f87171, 0 2px 6px #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
          animation: 'damage-float-up 0.9s cubic-bezier(0.2, 0.8, 0.4, 1) forwards',
          whiteSpace: 'nowrap',
          direction: 'ltr',
          pointerEvents: 'none'
        }}
      >
        -{damage.toLocaleString()}
      </div>
    </div>
  );
};

export default SmallRocketExplosion;
