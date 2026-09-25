import React, { useEffect, useState } from 'react';

interface MediumRocketExplosionProps {
  x: string | number; // Target coordinate (e.g. "45%" or pixels)
  y: string | number; // Target coordinate (e.g. "50%" or pixels)
  onComplete?: () => void;
  damage?: number;
}

export const MediumRocketExplosion: React.FC<MediumRocketExplosionProps> = ({
  x,
  y,
  onComplete,
  damage = 4000
}) => {
  const [phase, setPhase] = useState<'detonate' | 'expand' | 'billow' | 'dissolve'>('detonate');

  useEffect(() => {
    // Precise timing matching the medium rocket cartoon explosion in the video (~1.0s total)
    const t1 = setTimeout(() => setPhase('expand'), 70);
    const t2 = setTimeout(() => setPhase('billow'), 280);
    const t3 = setTimeout(() => setPhase('dissolve'), 680);
    const t4 = setTimeout(() => {
      if (onComplete) onComplete();
    }, 1020);

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
        @keyframes medium-cloud-burst {
          0% {
            transform: scale(0.18) rotate(-6deg);
            opacity: 0.35;
            filter: brightness(3.0);
          }
          20% {
            transform: scale(1.15) rotate(2deg);
            opacity: 1;
            filter: brightness(1.7);
          }
          48% {
            transform: scale(1.32) rotate(4deg);
            opacity: 0.98;
            filter: brightness(1.15);
          }
          75% {
            transform: scale(1.42) rotate(6deg);
            opacity: 0.8;
            filter: brightness(0.95);
          }
          100% {
            transform: scale(1.50) translateY(-10px) rotate(8deg);
            opacity: 0;
            filter: blur(10px) brightness(0.55);
          }
        }

        @keyframes medium-shockwave-1 {
          0% {
            transform: scale(0.15);
            opacity: 0.95;
            border-width: 12px;
          }
          45% {
            opacity: 0.8;
            border-width: 6px;
          }
          100% {
            transform: scale(2.4);
            opacity: 0;
            border-width: 1px;
          }
        }

        @keyframes medium-shockwave-2 {
          0% {
            transform: scale(0.1);
            opacity: 0;
          }
          15% {
            opacity: 0.85;
            border-width: 8px;
          }
          100% {
            transform: scale(2.0);
            opacity: 0;
            border-width: 1px;
          }
        }

        @keyframes medium-starburst-expand {
          0% {
            transform: scale(0.15) rotate(0deg);
            opacity: 0.2;
          }
          22% {
            transform: scale(1.3) rotate(18deg);
            opacity: 1;
          }
          50% {
            transform: scale(1.48) rotate(28deg);
            opacity: 0.7;
          }
          100% {
            transform: scale(1.62) rotate(38deg);
            opacity: 0;
          }
        }

        @keyframes puff-med-1 {
          0% { transform: translate(0, 0) scale(0.35); opacity: 1; }
          100% { transform: translate(95px, -75px) scale(1.2); opacity: 0; }
        }
        @keyframes puff-med-2 {
          0% { transform: translate(0, 0) scale(0.35); opacity: 1; }
          100% { transform: translate(-95px, -70px) scale(1.15); opacity: 0; }
        }
        @keyframes puff-med-3 {
          0% { transform: translate(0, 0) scale(0.35); opacity: 1; }
          100% { transform: translate(110px, 30px) scale(1.1); opacity: 0; }
        }
        @keyframes puff-med-4 {
          0% { transform: translate(0, 0) scale(0.35); opacity: 1; }
          100% { transform: translate(-105px, 35px) scale(1.1); opacity: 0; }
        }
        @keyframes puff-med-5 {
          0% { transform: translate(0, 0) scale(0.3); opacity: 1; }
          100% { transform: translate(0px, -110px) scale(1.25); opacity: 0; }
        }
        @keyframes puff-med-6 {
          0% { transform: translate(0, 0) scale(0.3); opacity: 1; }
          100% { transform: translate(65px, 85px) scale(1.0); opacity: 0; }
        }
        @keyframes puff-med-7 {
          0% { transform: translate(0, 0) scale(0.3); opacity: 1; }
          100% { transform: translate(-70px, 80px) scale(1.0); opacity: 0; }
        }
        @keyframes puff-med-8 {
          0% { transform: translate(0, 0) scale(0.25); opacity: 1; }
          100% { transform: translate(0px, 95px) scale(0.95); opacity: 0; }
        }

        @keyframes med-damage-float {
          0% {
            transform: translateY(12px) scale(0.7);
            opacity: 0;
          }
          18% {
            transform: translateY(-20px) scale(1.25);
            opacity: 1;
          }
          65% {
            transform: translateY(-48px) scale(1.15);
            opacity: 1;
          }
          100% {
            transform: translateY(-75px) scale(0.9);
            opacity: 0;
          }
        }
      `}</style>

      {/* 1. Detonation Flash */}
      <div
        style={{
          position: 'absolute',
          inset: '-45px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(254, 240, 138, 0.98) 0%, rgba(249, 115, 22, 0.65) 35%, rgba(220, 38, 38, 0.35) 60%, transparent 80%)',
          animation: 'fade-in-out 0.4s ease-out forwards',
          zIndex: 1,
        }}
      />

      {/* 2. Primary Expanding Shockwave Ring */}
      <div
        style={{
          position: 'absolute',
          width: '140px',
          height: '140px',
          borderRadius: '50%',
          border: '9px solid #fde047',
          boxShadow: '0 0 20px #f97316, inset 0 0 12px #fef08a',
          animation: 'medium-shockwave-1 0.6s cubic-bezier(0.1, 0.7, 0.1, 1) forwards',
          zIndex: 2,
        }}
      />

      {/* 3. Secondary Outer Shockwave Ring */}
      <div
        style={{
          position: 'absolute',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          border: '5px solid #ffffff',
          boxShadow: '0 0 15px rgba(255,255,255,0.8)',
          animation: 'medium-shockwave-2 0.7s cubic-bezier(0.15, 0.65, 0.25, 1) forwards',
          zIndex: 2,
        }}
      />

      {/* 4. Comic Starburst Flash Behind Smoke */}
      <div
        style={{
          position: 'absolute',
          width: '260px',
          height: '260px',
          animation: 'medium-starburst-expand 0.65s cubic-bezier(0.15, 0.85, 0.35, 1) forwards',
          zIndex: 3,
        }}
      >
        <svg viewBox="0 0 260 260" width="100%" height="100%">
          <defs>
            <linearGradient id="medSpikeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="25%" stopColor="#fef08a" />
              <stop offset="60%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>
          </defs>
          <polygon
            points="
              130,12 138,88 205,32 154,102 235,98 158,128 220,190 142,150 
              130,236 118,150 40,195 102,128 25,98 106,102 55,32 122,88
            "
            fill="url(#medSpikeGrad)"
            stroke="#1c1917"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* 5. Medium Comic Multi-Lobed Cloud Mass (Matches Video Reference) */}
      <div
        style={{
          position: 'absolute',
          width: '290px',
          height: '290px',
          animation: 'medium-cloud-burst 1.0s cubic-bezier(0.12, 0.8, 0.32, 1) forwards',
          zIndex: 4,
          filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.7))',
        }}
      >
        <svg viewBox="0 0 300 300" width="100%" height="100%">
          <defs>
            {/* Main Rich Cream / Yellow Gradient */}
            <radialGradient id="medCloudGrad" cx="44%" cy="36%" r="62%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="25%" stopColor="#fffbeb" />
              <stop offset="52%" stopColor="#fef08a" />
              <stop offset="78%" stopColor="#fde047" />
              <stop offset="96%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ca8a04" />
            </radialGradient>

            {/* Underside Amber/Chestnut Shading */}
            <linearGradient id="medPuffShade" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="40%" stopColor="#f59e0b" />
              <stop offset="80%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>

            {/* Core highlight */}
            <radialGradient id="medCoreHighlight" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="55%" stopColor="#fffdf5" />
              <stop offset="100%" stopColor="#fef9c3" />
            </radialGradient>
          </defs>

          {/* Dark Silhouette Shadow */}
          <path
            d="
              M 150 40
              C 188 32, 222 55, 230 90
              C 265 102, 276 142, 256 178
              C 270 215, 240 252, 202 246
              C 182 266, 134 268, 112 246
              C 76 256, 45 226, 54 190
              C 26 156, 40 114, 76 100
              C 76 62, 118 42, 150 40 Z
            "
            fill="#1c1917"
            transform="scale(1.05) translate(-7, -7)"
          />

          {/* Main Scalloped Cloud Mass */}
          <path
            d="
              M 150 46
              C 185 38, 218 60, 225 94
              C 258 106, 268 142, 248 174
              C 262 208, 232 242, 196 238
              C 176 258, 132 260, 110 238
              C 76 246, 48 218, 56 184
              C 30 152, 44 112, 78 98
              C 78 64, 118 44, 150 46 Z
            "
            fill="url(#medCloudGrad)"
            stroke="#1c1917"
            strokeWidth="4.5"
            strokeLinejoin="round"
          />

          {/* Internal Bulging Lobes with Dark Comic Inking */}
          <circle cx="186" cy="98" r="38" fill="url(#medCoreHighlight)" stroke="#292524" strokeWidth="3" />
          <circle cx="148" cy="142" r="54" fill="url(#medCoreHighlight)" stroke="#292524" strokeWidth="3.2" />
          <circle cx="96" cy="132" r="36" fill="url(#medCoreHighlight)" stroke="#292524" strokeWidth="3" />
          <circle cx="210" cy="154" r="34" fill="url(#medCoreHighlight)" stroke="#292524" strokeWidth="3" />
          
          {/* Lower Shaded Lobes */}
          <circle cx="148" cy="195" r="38" fill="url(#medPuffShade)" stroke="#1c1917" strokeWidth="3" />
          <circle cx="102" cy="190" r="28" fill="url(#medPuffShade)" stroke="#1c1917" strokeWidth="2.8" />
          <circle cx="196" cy="198" r="28" fill="url(#medPuffShade)" stroke="#1c1917" strokeWidth="2.8" />

          {/* Highlights */}
          <ellipse cx="142" cy="126" rx="24" ry="14" fill="#ffffff" opacity="0.95" />
          <ellipse cx="182" cy="88" rx="15" ry="9" fill="#ffffff" opacity="0.9" />
          <ellipse cx="92" cy="122" rx="13" ry="8" fill="#ffffff" opacity="0.9" />

          {/* Comic Crease Curves */}
          <path d="M 124 108 Q 148 122 172 108" fill="none" stroke="#d97706" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M 174 158 Q 195 172 212 160" fill="none" stroke="#d97706" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M 88 152 Q 106 166 122 154" fill="none" stroke="#d97706" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      </div>

      {/* 6. Eight Flying Comic Smoke Puffs Radiating Outward */}
      <div
        style={{
          position: 'absolute',
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: '#fef08a',
          border: '2.5px solid #1c1917',
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          animation: 'puff-med-1 0.82s ease-out forwards',
          zIndex: 5,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: '#fffbeb',
          border: '2.5px solid #1c1917',
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          animation: 'puff-med-2 0.85s ease-out forwards',
          zIndex: 5,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '26px',
          height: '26px',
          borderRadius: '50%',
          background: '#fde047',
          border: '2px solid #1c1917',
          boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
          animation: 'puff-med-3 0.8s ease-out forwards',
          zIndex: 5,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '26px',
          height: '26px',
          borderRadius: '50%',
          background: '#fef08a',
          border: '2px solid #1c1917',
          boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
          animation: 'puff-med-4 0.82s ease-out forwards',
          zIndex: 5,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          background: '#fef9c3',
          border: '2.8px solid #1c1917',
          boxShadow: '0 3px 8px rgba(0,0,0,0.45)',
          animation: 'puff-med-5 0.9s ease-out forwards',
          zIndex: 5,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: '#fde047',
          border: '2px solid #1c1917',
          boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
          animation: 'puff-med-6 0.78s ease-out forwards',
          zIndex: 5,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: '#fef08a',
          border: '2px solid #1c1917',
          boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
          animation: 'puff-med-7 0.8s ease-out forwards',
          zIndex: 5,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          background: '#fffbeb',
          border: '2px solid #1c1917',
          boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
          animation: 'puff-med-8 0.76s ease-out forwards',
          zIndex: 5,
        }}
      />

      {/* 7. Floating Impact Damage Number (e.g. -4,000) */}
      <div
        style={{
          position: 'absolute',
          top: '25px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          fontFamily: '"Cairo", sans-serif',
          fontWeight: 900,
          fontSize: '26px',
          color: '#ef4444',
          textShadow: '0 0 6px #fff, 0 0 14px #f87171, 0 2px 8px #000, -1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000',
          animation: 'med-damage-float 1.0s cubic-bezier(0.2, 0.8, 0.4, 1) forwards',
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

export default MediumRocketExplosion;
