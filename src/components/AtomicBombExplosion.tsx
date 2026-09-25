import React, { useEffect, useState } from 'react';
import { WEAPON_ATOMIC_BOMB_ICON } from '../data';
import { playWaterPlungeSound } from '../utils/explosionSound';

interface AtomicBombExplosionProps {
  x?: string | number; // Horizontal center (e.g. "46%")
  surfaceY?: string | number; // Sea water surface level (e.g. "48%")
  depthY?: string | number; // Underwater detonation depth (e.g. "64%")
  onDetonate?: () => void;
  onComplete?: () => void;
}

export const AtomicBombExplosion: React.FC<AtomicBombExplosionProps> = ({
  x = '46%',
  surfaceY = '48%',
  depthY = '64%',
  onDetonate,
  onComplete
}) => {
  // Phase sequence:
  // 1. 'descent': Bomb falls from high sky down to the sea surface (0ms - 650ms)
  // 2. 'penetrating': Bomb pierces surface, splashes, and dives deep underwater (650ms - 1350ms)
  // 3. 'detonating': Bomb detonates deep underwater, hydro-spout blasts, mushroom cloud rises (1350ms - 3400ms)
  // 4. 'dissipating': Clouds and foam disperse (3400ms - 4500ms)
  const [phase, setPhase] = useState<'descent' | 'penetrating' | 'detonating' | 'dissipating'>('descent');

  useEffect(() => {
    // 1. Impact the water surface at 650ms
    const tSurfaceImpact = setTimeout(() => {
      setPhase('penetrating');
      playWaterPlungeSound();
    }, 650);

    // 2. Reach terminal depth in the sea & detonate at 1350ms
    const tDetonate = setTimeout(() => {
      setPhase('detonating');
      if (onDetonate) onDetonate();
    }, 1350);

    // 3. Begin dissipation at 3400ms
    const tDissipate = setTimeout(() => {
      setPhase('dissipating');
    }, 3400);

    // 4. Fully finish at 4500ms
    const tComplete = setTimeout(() => {
      if (onComplete) onComplete();
    }, 4500);

    return () => {
      clearTimeout(tSurfaceImpact);
      clearTimeout(tDetonate);
      clearTimeout(tDissipate);
      clearTimeout(tComplete);
    };
  }, [onDetonate, onComplete]);

  const centerX = typeof x === 'number' ? `${x}px` : x;
  const surfaceTop = typeof surfaceY === 'number' ? `${surfaceY}px` : surfaceY;
  const depthTop = typeof depthY === 'number' ? `${depthY}px` : depthY;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 9998,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}
    >
      <style>{`
        /* 1. Bomb Descent from Sky and Deep Sea Water Penetration */
        @keyframes atomic-bomb-plunge-path {
          0% {
            top: -140px;
            transform: translate(-50%, -50%) scale(1.05) rotate(0deg);
            filter: drop-shadow(0 0 16px rgba(255, 152, 0, 0.85)) drop-shadow(0 4px 10px rgba(0,0,0,0.8));
            opacity: 1;
          }
          48% {
            /* Hits Sea Surface */
            top: ${surfaceTop};
            transform: translate(-50%, -50%) scale(1.0) rotate(0deg);
            filter: drop-shadow(0 0 20px rgba(255, 180, 50, 0.95)) drop-shadow(0 4px 14px rgba(0,0,0,0.9));
          }
          58% {
            /* Penetrating below surface into sea water */
            top: calc((${surfaceTop} + ${depthTop}) / 2);
            transform: translate(-50%, -50%) scale(0.92) rotate(0deg);
            filter: hue-rotate(180deg) brightness(0.65) contrast(1.3) drop-shadow(0 0 25px #0284c7);
          }
          88% {
            /* Reaching deep ocean depth */
            top: ${depthTop};
            transform: translate(-50%, -50%) scale(0.86) rotate(0deg);
            filter: hue-rotate(185deg) brightness(0.55) contrast(1.4) drop-shadow(0 0 35px #0369a1);
          }
          96% {
            /* Warhead begins nuclear core ignition in sea depths */
            top: ${depthTop};
            transform: translate(-50%, -50%) scale(0.96) rotate(0deg);
            filter: hue-rotate(185deg) brightness(3.0) drop-shadow(0 0 60px #ffffff);
            opacity: 1;
          }
          100% {
            top: ${depthTop};
            transform: translate(-50%, -50%) scale(1.5) rotate(0deg);
            filter: brightness(5.0) drop-shadow(0 0 90px #ffffff);
            opacity: 0;
          }
        }

        /* 2. Sea Surface Water Entry Splash Geysers (Shoots up when bomb hits surface) */
        @keyframes surface-entry-splash-burst {
          0% {
            transform: translate(-50%, -100%) scaleY(0.1) scaleX(0.2);
            opacity: 0;
          }
          20% {
            transform: translate(-50%, -100%) scaleY(1.15) scaleX(1.1);
            opacity: 1;
          }
          60% {
            transform: translate(-50%, -100%) scaleY(1.35) scaleX(1.25);
            opacity: 0.9;
          }
          100% {
            transform: translate(-50%, -100%) scaleY(1.45) scaleX(1.4);
            opacity: 0;
          }
        }

        /* 3. Expanding Foaming Water Ring on Surface upon Impact */
        @keyframes surface-entry-crown-ripple {
          0% {
            transform: translate(-50%, -50%) scale(0.2);
            opacity: 0.95;
            border-width: 8px;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.6);
            opacity: 0.75;
            border-width: 4px;
          }
          100% {
            transform: translate(-50%, -50%) scale(2.8);
            opacity: 0;
            border-width: 1px;
          }
        }

        /* 4. Trailing Underwater Cavitation Bubble Tunnel connecting submerged bomb to surface */
        @keyframes cavitation-stream-wake {
          0% {
            opacity: 0;
            transform: translate(-50%, 0) scaleX(0.4);
          }
          30% {
            opacity: 0.95;
            transform: translate(-50%, 0) scaleX(1.0);
          }
          85% {
            opacity: 0.85;
            transform: translate(-50%, 0) scaleX(1.15);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, 0) scaleX(1.3);
          }
        }

        /* 5. Submerged Bubbles Rising to Surface */
        @keyframes cavitation-bubbles-rise {
          0% {
            transform: translateY(0) scale(0.6);
            opacity: 0.8;
          }
          100% {
            transform: translateY(-80px) scale(1.2);
            opacity: 0;
          }
        }

        /* 6. Full-screen blinding detonation flash */
        @keyframes nuke-screen-flash {
          0% {
            opacity: 0;
          }
          8% {
            opacity: 1;
            background-color: rgba(230, 248, 255, 0.98);
          }
          30% {
            opacity: 0.75;
            background-color: rgba(255, 230, 160, 0.65);
          }
          100% {
            opacity: 0;
            background-color: transparent;
          }
        }

        /* 7. Underwater incandescent luminous dome expanding from beneath the sea */
        @keyframes nuke-underwater-dome {
          0% {
            transform: translate(-50%, -40%) scale(0.1);
            opacity: 0;
          }
          15% {
            transform: translate(-50%, -40%) scale(1.1);
            opacity: 1;
            filter: drop-shadow(0 0 50px #38bdf8) drop-shadow(0 0 90px #0284c7);
          }
          45% {
            transform: translate(-50%, -40%) scale(1.4);
            opacity: 0.85;
          }
          80% {
            transform: translate(-50%, -40%) scale(1.7);
            opacity: 0.25;
          }
          100% {
            transform: translate(-50%, -40%) scale(1.9);
            opacity: 0;
          }
        }

        /* 8. Colossal vertical foaming water spout / geyser erupting from ocean depths */
        @keyframes nuke-water-spout-eruption {
          0% {
            transform: translate(-50%, 0%) scaleY(0.05) scaleX(0.4);
            opacity: 0.2;
          }
          15% {
            transform: translate(-50%, -100%) scaleY(1.05) scaleX(1.0);
            opacity: 1;
          }
          35% {
            transform: translate(-50%, -100%) scaleY(1.18) scaleX(1.15);
            opacity: 0.95;
          }
          70% {
            transform: translate(-50%, -100%) scaleY(1.12) scaleX(1.25);
            opacity: 0.8;
          }
          100% {
            transform: translate(-50%, -95%) scaleY(0.9) scaleX(1.35);
            opacity: 0;
          }
        }

        /* 9. Primary expanding sea surface shockwave & foaming tidal ring */
        @keyframes nuke-water-shockwave {
          0% {
            transform: translate(-50%, -50%) scale(0.1);
            opacity: 1;
            border-width: 16px;
          }
          55% {
            opacity: 0.9;
            border-width: 9px;
          }
          100% {
            transform: translate(-50%, -50%) scale(3.2);
            opacity: 0;
            border-width: 2px;
          }
        }

        /* 10. Secondary deep sea tsunami swell ring */
        @keyframes nuke-secondary-water-ripple {
          0% {
            transform: translate(-50%, -50%) scale(0.2);
            opacity: 0;
            border-width: 14px;
          }
          20% {
            opacity: 0.95;
          }
          70% {
            opacity: 0.7;
            border-width: 7px;
          }
          100% {
            transform: translate(-50%, -50%) scale(2.6);
            opacity: 0;
            border-width: 1px;
          }
        }

        /* 11. Sharp golden starburst blast spike breaking the water surface */
        @keyframes nuke-starburst-blast {
          0% {
            transform: translate(-50%, -50%) scale(0.1);
            opacity: 0;
          }
          18% {
            transform: translate(-50%, -50%) scale(1.15);
            opacity: 1;
            filter: drop-shadow(0 0 35px #ffe033) drop-shadow(0 0 60px #ff9800);
          }
          55% {
            transform: translate(-50%, -50%) scale(1.35);
            opacity: 0.9;
          }
          85% {
            transform: translate(-50%, -50%) scale(1.45);
            opacity: 0.3;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.55);
            opacity: 0;
          }
        }

        /* 12. Massive billowing cartoon mushroom cloud expansion rising above the water plume */
        @keyframes nuke-mushroom-growth {
          0% {
            transform: translate(-50%, -40%) scale(0.2);
            opacity: 0.4;
          }
          18% {
            transform: translate(-50%, -50%) scale(1.05);
            opacity: 1;
          }
          35% {
            transform: translate(-50%, -56%) scale(1.22);
            opacity: 1;
          }
          70% {
            transform: translate(-50%, -60%) scale(1.35);
            opacity: 0.95;
          }
          100% {
            transform: translate(-50%, -66%) scale(1.42);
            opacity: 0;
          }
        }

        /* 13. Fiery boiling core inside the cloud */
        @keyframes nuke-fire-pulse {
          0% {
            opacity: 1;
            transform: scale(0.9);
            filter: brightness(2.2);
          }
          50% {
            opacity: 0.95;
            transform: scale(1.1);
            filter: brightness(1.6);
          }
          100% {
            opacity: 0.4;
            transform: scale(1.25);
            filter: brightness(1.1);
          }
        }

        /* 14. Rolling billows animation for the mushroom ash clouds */
        @keyframes nuke-billow-roll {
          0% {
            transform: rotate(0deg) scale(1);
          }
          50% {
            transform: rotate(1.5deg) scale(1.03);
          }
          100% {
            transform: rotate(-1.5deg) scale(0.99);
          }
        }
      `}</style>

      {/* =========================================================================
          SECTION A: FALLING & SEA WATER PENETRATION SEQUENCE (0ms to 1350ms)
          ========================================================================= */}
      {(phase === 'descent' || phase === 'penetrating') && (
        <>
          {/* 1. The Descending Atomic Bomb Penetrating into the Sea */}
          <div
            style={{
              position: 'absolute',
              left: centerX,
              top: 0,
              zIndex: 9999,
              animation: 'atomic-bomb-plunge-path 1.35s cubic-bezier(0.28, 0.4, 0.35, 1) forwards',
              pointerEvents: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* The Atomic Bomb Image with heavy realistic ordnance detailing */}
            <img
              src={WEAPON_ATOMIC_BOMB_ICON}
              alt="قنبلة ذرية تخترق البحر"
              referrerPolicy="no-referrer"
              style={{
                width: '86px',
                height: '86px',
                objectFit: 'contain',
              }}
            />

            {/* Aerodynamic wind streaks when falling in air */}
            <div
              style={{
                position: 'absolute',
                top: '-35px',
                width: '3px',
                height: '40px',
                background: 'linear-gradient(to top, rgba(255,255,255,0.8), transparent)',
                borderRadius: '2px',
                filter: 'drop-shadow(0 0 6px #fff)',
              }}
            />
          </div>

          {/* 2. Sea Surface Entry Splash & Displacement Erupting when Bomb Hits Surface */}
          {phase === 'penetrating' && (
            <>
              {/* Massive Twin Water Splash Wings shooting upward from entry point */}
              <div
                style={{
                  position: 'absolute',
                  left: centerX,
                  top: surfaceTop,
                  width: '180px',
                  height: '140px',
                  animation: 'surface-entry-splash-burst 0.75s cubic-bezier(0.1, 0.85, 0.25, 1) forwards',
                  pointerEvents: 'none',
                  zIndex: 9995,
                }}
              >
                <svg viewBox="0 0 180 140" width="100%" height="100%" style={{ overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="entrySplashGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#0284c7" stopOpacity="0.9" />
                      <stop offset="40%" stopColor="#7dd3fc" stopOpacity="0.95" />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
                    </linearGradient>
                  </defs>

                  {/* Left erupting water splash wing */}
                  <path
                    d="M 90,140 Q 60,80 20,25 Q 45,50 65,95 Q 80,45 88,140 Z"
                    fill="url(#entrySplashGrad)"
                    filter="drop-shadow(0 0 8px rgba(56, 189, 248, 0.8))"
                  />
                  {/* Right erupting water splash wing */}
                  <path
                    d="M 90,140 Q 120,80 160,25 Q 135,50 115,95 Q 100,45 92,140 Z"
                    fill="url(#entrySplashGrad)"
                    filter="drop-shadow(0 0 8px rgba(56, 189, 248, 0.8))"
                  />
                  {/* Center vertical water burst */}
                  <path
                    d="M 85,140 Q 82,60 90,10 Q 98,60 95,140 Z"
                    fill="#ffffff"
                    filter="drop-shadow(0 0 10px #fff)"
                  />
                  {/* Water spray droplets */}
                  <circle cx="25" cy="15" r="4.5" fill="#ffffff" filter="drop-shadow(0 0 4px #7dd3fc)" />
                  <circle cx="155" cy="18" r="4.5" fill="#ffffff" filter="drop-shadow(0 0 4px #7dd3fc)" />
                  <circle cx="50" cy="35" r="3.5" fill="#e0f2fe" />
                  <circle cx="130" cy="38" r="3.5" fill="#e0f2fe" />
                  <circle cx="90" cy="5" r="4" fill="#ffffff" />
                </svg>
              </div>

              {/* Expanding Surface Water Entry Foaming Crown Ripple */}
              <div
                style={{
                  position: 'absolute',
                  left: centerX,
                  top: surfaceTop,
                  width: '140px',
                  height: '65px',
                  borderRadius: '50%',
                  border: '6px solid #ffffff',
                  boxShadow: '0 0 25px #38bdf8, inset 0 0 15px #0284c7',
                  animation: 'surface-entry-crown-ripple 0.75s ease-out forwards',
                  pointerEvents: 'none',
                  zIndex: 9994,
                }}
              />

              {/* 3. Trailing Underwater Cavitation Bubble Tunnel inside Sea Water */}
              <div
                style={{
                  position: 'absolute',
                  left: centerX,
                  top: surfaceTop,
                  width: '60px',
                  height: `calc(${depthTop} - ${surfaceTop})`,
                  animation: 'cavitation-stream-wake 0.7s cubic-bezier(0.2, 0.8, 0.3, 1) forwards',
                  pointerEvents: 'none',
                  zIndex: 9993,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                {/* Frothing white cavitation wake column */}
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(to bottom, rgba(255,255,255,0.85) 0%, rgba(125,211,252,0.7) 40%, rgba(14,165,233,0.4) 80%, rgba(2,132,199,0.15) 100%)',
                    borderRadius: '30px',
                    filter: 'blur(2px)',
                    boxShadow: '0 0 20px rgba(56, 189, 248, 0.75)',
                  }}
                />

                {/* Rising Cavitation Bubbles inside water */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    overflow: 'hidden',
                    display: 'flex',
                    justifyContent: 'space-around',
                  }}
                >
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#ffffff',
                      boxShadow: '0 0 8px #7dd3fc',
                      animation: 'cavitation-bubbles-rise 0.6s infinite ease-out',
                    }}
                  />
                  <div
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#e0f2fe',
                      boxShadow: '0 0 6px #38bdf8',
                      animation: 'cavitation-bubbles-rise 0.5s 0.1s infinite ease-out',
                    }}
                  />
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: '#ffffff',
                      boxShadow: '0 0 10px #7dd3fc',
                      animation: 'cavitation-bubbles-rise 0.7s 0.2s infinite ease-out',
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* =========================================================================
          SECTION B: DEEP-SEA NUCLEAR DETONATION SEQUENCE (1350ms to 4500ms)
          ========================================================================= */}
      {(phase === 'detonating' || phase === 'dissipating') && (
        <>
          {/* 1. BLINDING ATMOSPHERIC FLASH OVERLAY */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              animation: 'nuke-screen-flash 0.9s cubic-bezier(0.05, 0.9, 0.15, 1) forwards',
              zIndex: 9999,
              pointerEvents: 'none',
            }}
          />

          {/* 2. UNDERWATER LUMINOUS INCANDESCENT DOME (Glowing inside ocean depths) */}
          <div
            style={{
              position: 'absolute',
              left: centerX,
              top: depthTop,
              width: '420px',
              height: '260px',
              borderRadius: '50%',
              background: 'radial-gradient(ellipse at 50% 60%, rgba(255, 255, 255, 0.98) 0%, rgba(125, 211, 252, 0.92) 25%, rgba(14, 165, 233, 0.78) 55%, rgba(2, 132, 199, 0.45) 75%, transparent 100%)',
              animation: 'nuke-underwater-dome 2.4s ease-out forwards',
              pointerEvents: 'none',
              filter: 'blur(3px)',
            }}
          />

          {/* 3. PRIMARY SEA SURFACE FOAMING SHOCKWAVE */}
          <div
            style={{
              position: 'absolute',
              left: centerX,
              top: depthTop,
              width: '320px',
              height: '160px',
              borderRadius: '50%',
              border: '14px solid #ffffff',
              boxShadow: '0 0 50px #38bdf8, inset 0 0 40px #0284c7',
              animation: 'nuke-water-shockwave 2.0s cubic-bezier(0.12, 0.85, 0.28, 1) forwards',
              pointerEvents: 'none',
            }}
          />

          {/* 4. SECONDARY DEEP SEA TSUNAMI SWELL RING */}
          <div
            style={{
              position: 'absolute',
              left: centerX,
              top: depthTop,
              width: '360px',
              height: '180px',
              borderRadius: '50%',
              border: '9px solid rgba(224, 242, 254, 0.85)',
              boxShadow: '0 0 35px #0284c7, inset 0 0 25px rgba(255, 255, 255, 0.7)',
              animation: 'nuke-secondary-water-ripple 2.6s 0.2s cubic-bezier(0.16, 0.8, 0.3, 1) forwards',
              pointerEvents: 'none',
            }}
          />

          {/* 5. MAMMOTH FOAMING WATER SPOUT & HYDRO-GEYSER (Erupting straight out of the ocean depths) */}
          <div
            style={{
              position: 'absolute',
              left: centerX,
              top: depthTop,
              width: '280px',
              height: '420px',
              animation: 'nuke-water-spout-eruption 2.9s cubic-bezier(0.1, 0.82, 0.25, 1) forwards',
              pointerEvents: 'none',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-end',
            }}
          >
            <svg
              viewBox="0 0 260 400"
              width="100%"
              height="100%"
              style={{ overflow: 'visible', filter: 'drop-shadow(0 0 22px rgba(56, 189, 248, 0.7))' }}
            >
              <defs>
                <linearGradient id="waterSpoutGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="25%" stopColor="#e0f2fe" />
                  <stop offset="60%" stopColor="#7dd3fc" />
                  <stop offset="100%" stopColor="#0284c7" />
                </linearGradient>
                <linearGradient id="foamWhiteGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="70%" stopColor="#f0f9ff" />
                  <stop offset="100%" stopColor="#bae6fd" />
                </linearGradient>
              </defs>

              {/* Core vertical erupting water spout column */}
              <path
                d="
                  M 90,400 
                  C 105,280 95,160 70,80 
                  C 110,60 150,60 190,80 
                  C 165,160 155,280 170,400 
                  Z
                "
                fill="url(#waterSpoutGrad)"
                opacity="0.92"
              />

              {/* Churning outer sea foam jets flanking the geyser */}
              <path
                d="
                  M 130,400 
                  C 80,300 40,240 20,160 
                  C 45,185 75,225 105,280 
                  Z
                "
                fill="url(#foamWhiteGrad)"
                opacity="0.95"
              />
              <path
                d="
                  M 130,400 
                  C 180,300 220,240 240,160 
                  C 215,185 185,225 155,280 
                  Z
                "
                fill="url(#foamWhiteGrad)"
                opacity="0.95"
              />

              {/* Spray droplets around geyser */}
              <circle cx="30" cy="120" r="7" fill="#ffffff" filter="drop-shadow(0 0 5px #7dd3fc)" />
              <circle cx="55" cy="65" r="8" fill="#ffffff" filter="drop-shadow(0 0 5px #7dd3fc)" />
              <circle cx="205" cy="70" r="8" fill="#ffffff" filter="drop-shadow(0 0 5px #7dd3fc)" />
              <circle cx="230" cy="130" r="7" fill="#ffffff" filter="drop-shadow(0 0 5px #7dd3fc)" />
              <circle cx="130" cy="40" r="10" fill="#ffffff" filter="drop-shadow(0 0 8px #fff)" />
            </svg>
          </div>

          {/* 6. Comic Style Bright Yellow Detonation Starburst */}
          <div
            style={{
              position: 'absolute',
              left: centerX,
              top: surfaceTop,
              width: '320px',
              height: '320px',
              transform: 'translate(-50%, -50%)',
              animation: 'nuke-starburst-blast 0.65s cubic-bezier(0.1, 0.9, 0.2, 1) forwards',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg viewBox="0 0 300 300" width="100%" height="100%">
              <defs>
                <radialGradient id="starburstGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="35%" stopColor="#fff176" />
                  <stop offset="70%" stopColor="#ffeb3b" />
                  <stop offset="100%" stopColor="#f57f17" />
                </radialGradient>
              </defs>
              <polygon
                points="
                  150,15 
                  166,95 
                  235,50 
                  190,118 
                  285,125 
                  205,160 
                  270,225 
                  185,198 
                  170,285 
                  142,205 
                  85,270 
                  112,185 
                  25,185 
                  100,140 
                  35,75 
                  122,105
                "
                fill="url(#starburstGrad)"
                stroke="#ffffff"
                strokeWidth="3"
                filter="drop-shadow(0 0 16px rgba(255,224,51,0.9))"
              />
              <polygon
                points="150,5 162,110 138,110"
                fill="#ffffff"
                filter="drop-shadow(0 0 12px #fff)"
              />
            </svg>
          </div>

          {/* 7. Colossal Mushroom Cloud Rising Above the Water Spout */}
          <div
            style={{
              position: 'absolute',
              left: centerX,
              top: depthTop,
              width: '560px',
              maxWidth: '100vw',
              height: '560px',
              animation: 'nuke-mushroom-growth 3.4s cubic-bezier(0.12, 0.88, 0.22, 1) forwards',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              viewBox="0 0 500 500"
              width="100%"
              height="100%"
              style={{
                overflow: 'visible',
                animation: 'nuke-billow-roll 3.0s ease-in-out infinite alternate',
                filter: 'drop-shadow(0 15px 35px rgba(0,0,0,0.65))',
              }}
            >
              <defs>
                <linearGradient id="ashGradTop" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ede8e3" />
                  <stop offset="45%" stopColor="#d5cdc5" />
                  <stop offset="85%" stopColor="#a79c92" />
                  <stop offset="100%" stopColor="#544941" />
                </linearGradient>
                <linearGradient id="ashGradDark" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#40362f" />
                  <stop offset="60%" stopColor="#251f1b" />
                  <stop offset="100%" stopColor="#120e0c" />
                </linearGradient>
                <radialGradient id="nukeFireGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                  <stop offset="25%" stopColor="#ffe600" stopOpacity="0.95" />
                  <stop offset="60%" stopColor="#ff5722" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#bf360c" stopOpacity="0" />
                </radialGradient>
                <filter id="cloudShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#1a1410" floodOpacity="0.5" />
                </filter>
              </defs>

              {/* STEM OF THE MUSHROOM CLOUD */}
              <g id="cloud-stem">
                <path
                  d="
                    M 200,440 
                    C 215,360 220,290 210,210 
                    L 290,210 
                    C 280,290 285,360 300,440 
                    Z
                  "
                  fill="url(#ashGradDark)"
                />
                <path
                  d="
                    M 218,440 
                    C 228,360 232,290 226,210 
                    L 274,210 
                    C 268,290 272,360 282,440 
                    Z
                  "
                  fill="url(#ashGradTop)"
                  opacity="0.8"
                />
                {/* Fire light inside the stem */}
                <path
                  d="M 220,435 C 232,350 235,270 230,215 L 270,215 C 265,270 268,350 280,435 Z"
                  fill="url(#nukeFireGlow)"
                  opacity="0.9"
                />
              </g>

              {/* BASE WATER SPLASH & SMOKE RING */}
              <g id="base-ring">
                <circle cx="170" cy="435" r="28" fill="url(#ashGradDark)" filter="url(#cloudShadow)" />
                <circle cx="215" cy="445" r="32" fill="url(#ashGradTop)" filter="url(#cloudShadow)" />
                <circle cx="250" cy="448" r="35" fill="#f5ede6" filter="url(#cloudShadow)" />
                <circle cx="285" cy="445" r="32" fill="url(#ashGradTop)" filter="url(#cloudShadow)" />
                <circle cx="330" cy="435" r="28" fill="url(#ashGradDark)" filter="url(#cloudShadow)" />
              </g>

              {/* GIANT MUSHROOM CAP - MULTI-LOBED BILLOWING CUMULUS CLOUDS */}
              <g id="mushroom-cap">
                <circle cx="140" cy="210" r="58" fill="url(#ashGradDark)" />
                <circle cx="360" cy="210" r="58" fill="url(#ashGradDark)" />
                <circle cx="100" cy="165" r="65" fill="url(#ashGradDark)" />
                <circle cx="400" cy="165" r="65" fill="url(#ashGradDark)" />
                <circle cx="160" cy="115" r="70" fill="url(#ashGradDark)" />
                <circle cx="340" cy="115" r="70" fill="url(#ashGradDark)" />

                <circle cx="130" cy="180" r="55" fill="url(#ashGradTop)" filter="url(#cloudShadow)" />
                <circle cx="370" cy="180" r="55" fill="url(#ashGradTop)" filter="url(#cloudShadow)" />
                <circle cx="180" cy="170" r="68" fill="url(#ashGradTop)" filter="url(#cloudShadow)" />
                <circle cx="320" cy="170" r="68" fill="url(#ashGradTop)" filter="url(#cloudShadow)" />
                <circle cx="250" cy="180" r="72" fill="url(#ashGradTop)" filter="url(#cloudShadow)" />

                <path
                  d="M 170,225 Q 250,250 330,225 Q 250,210 170,225 Z"
                  fill="#ffe082"
                  filter="blur(4px)"
                  opacity="0.85"
                />

                <circle cx="135" cy="120" r="56" fill="#f0eae4" filter="url(#cloudShadow)" />
                <circle cx="365" cy="120" r="56" fill="#f0eae4" filter="url(#cloudShadow)" />
                <circle cx="190" cy="85" r="65" fill="#f5ede6" filter="url(#cloudShadow)" />
                <circle cx="310" cy="85" r="65" fill="#f5ede6" filter="url(#cloudShadow)" />
                <circle cx="250" cy="70" r="75" fill="#ffffff" filter="url(#cloudShadow)" />

                <circle cx="85" cy="135" r="42" fill="url(#ashGradTop)" filter="url(#cloudShadow)" />
                <circle cx="415" cy="135" r="42" fill="url(#ashGradTop)" filter="url(#cloudShadow)" />
                <circle cx="225" cy="50" r="50" fill="#ffffff" filter="url(#cloudShadow)" />
                <circle cx="275" cy="50" r="50" fill="#ffffff" filter="url(#cloudShadow)" />

                <ellipse
                  cx="250"
                  cy="165"
                  rx="90"
                  ry="50"
                  fill="url(#nukeFireGlow)"
                  opacity="0.85"
                  style={{ animation: 'nuke-fire-pulse 1.8s ease-in-out infinite alternate' }}
                />
              </g>

              {/* FLYING BURNING ASH PARTICLES & EMBER SPARKS */}
              <g id="embers">
                <circle cx="120" cy="90" r="3.5" fill="#ffe082" filter="drop-shadow(0 0 4px #ff9800)" />
                <circle cx="380" cy="100" r="4" fill="#fff59d" filter="drop-shadow(0 0 5px #ff9800)" />
                <circle cx="160" cy="45" r="3" fill="#ffb74d" filter="drop-shadow(0 0 4px #f57c00)" />
                <circle cx="330" cy="40" r="3.5" fill="#ffe082" filter="drop-shadow(0 0 4px #ff9800)" />
                <circle cx="250" cy="25" r="4.5" fill="#ffffff" filter="drop-shadow(0 0 6px #ffe082)" />
                <circle cx="80" cy="180" r="3" fill="#ff9800" />
                <circle cx="420" cy="185" r="3.5" fill="#ff9800" />
              </g>
            </svg>
          </div>
        </>
      )}
    </div>
  );
};

export default AtomicBombExplosion;
