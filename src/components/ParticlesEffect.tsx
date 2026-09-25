import React, { useEffect, useRef } from 'react';

export interface ParticlesEffectProps {
  // Option to auto-emit harbor damage if active
  portDestroyed?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  gravity: number;
  life: number;
  maxLife: number;
  type: 'fire' | 'smoke' | 'spark' | 'water' | 'gold';
}

export default function ParticlesEffect({ portDestroyed }: ParticlesEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);

  // Resize handler to keep canvas aligned with its parent
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial sizing

    // Trigger after a tiny delay as well, in case DOM is still rendering
    const timer = setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  // Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;

      // Update and Draw Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.life -= 1;

        // Apply decay to alpha or size depending on particle type
        if (p.type === 'smoke') {
          p.size += 0.2; // Smoke expands
          p.alpha = Math.max(0, p.life / p.maxLife);
        } else if (p.type === 'fire') {
          p.size = Math.max(0.1, p.size * 0.96);
          p.alpha = Math.max(0, p.life / p.maxLife);
        } else {
          p.alpha = Math.max(0, p.life / p.maxLife);
        }

        if (p.life <= 0 || p.size <= 0.1 || p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;

        if (p.type === 'fire') {
          // Glow effect for fire
          ctx.shadowBlur = p.size * 1.5;
          ctx.shadowColor = p.color;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'smoke') {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'spark') {
          // Shiny line streak for sparks
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.size;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 1.5, p.y - p.vy * 1.5);
          ctx.stroke();
        } else if (p.type === 'gold') {
          ctx.shadowBlur = 4;
          ctx.shadowColor = '#fbbf24';
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Water splash
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Function to spawn particles at dynamic coordinates
  const spawnExplosion = (pctX: number, pctY: number, count = 30, type: string = 'explosion') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Convert percentages or read direct pixels
    const px = (pctX / 100) * canvas.width;
    const py = (pctY / 100) * canvas.height;

    const particles = particlesRef.current;

    if (type === 'explosion' || type === 'destroy') {
      // Big explosion: fire, smoke, and sparks
      const actualCount = type === 'destroy' ? count * 2.5 : count;

      // 1. Spark Particles (fast and sharp)
      for (let i = 0; i < actualCount * 0.8; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 8;
        particles.push({
          x: px,
          y: py,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (1 + Math.random() * 2), // slightly upwards bias
          size: 1 + Math.random() * 3,
          color: Math.random() > 0.4 ? '#fbbf24' : '#ffffff',
          alpha: 1,
          decay: 0.02,
          gravity: 0.15,
          life: 20 + Math.random() * 30,
          maxLife: 50,
          type: 'spark'
        });
      }

      // 2. Fire Particles (expanding and hot)
      for (let i = 0; i < actualCount * 0.6; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.5 + Math.random() * 4;
        const colors = ['#ef4444', '#f97316', '#facc15', '#ffffff'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        particles.push({
          x: px + (Math.random() - 0.5) * 15,
          y: py + (Math.random() - 0.5) * 15,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1,
          size: 6 + Math.random() * 12,
          color,
          alpha: 1,
          decay: 0.03,
          gravity: -0.05, // fire rises
          life: 15 + Math.random() * 20,
          maxLife: 35,
          type: 'fire'
        });
      }

      // 3. Smoke Particles (slow and dark)
      for (let i = 0; i < actualCount * 0.5; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.2 + Math.random() * 2;
        const shade = 40 + Math.floor(Math.random() * 60);
        const color = `rgb(${shade}, ${shade}, ${shade})`;
        particles.push({
          x: px + (Math.random() - 0.5) * 20,
          y: py + (Math.random() - 0.5) * 20,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.8, // rises faster
          size: 10 + Math.random() * 15,
          color,
          alpha: 0.8,
          decay: 0.01,
          gravity: -0.08, // smoke rises
          life: 30 + Math.random() * 40,
          maxLife: 70,
          type: 'smoke'
        });
      }
    } else if (type === 'fire-ember') {
      // Small continuous fire embers
      for (let i = 0; i < count; i++) {
        particles.push({
          x: px + (Math.random() - 0.5) * 40,
          y: py + (Math.random() - 0.5) * 10,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -1.5 - Math.random() * 2,
          size: 4 + Math.random() * 6,
          color: Math.random() > 0.5 ? '#f97316' : '#ef4444',
          alpha: 0.9,
          decay: 0.02,
          gravity: -0.03,
          life: 20 + Math.random() * 25,
          maxLife: 45,
          type: 'fire'
        });

        // Associated smoke
        if (Math.random() > 0.6) {
          particles.push({
            x: px + (Math.random() - 0.5) * 45,
            y: py - 10,
            vx: (Math.random() - 0.5) * 1,
            vy: -0.8 - Math.random() * 1,
            size: 8 + Math.random() * 10,
            color: 'rgba(70, 65, 60, 0.5)',
            alpha: 0.5,
            decay: 0.01,
            gravity: -0.05,
            life: 30 + Math.random() * 30,
            maxLife: 60,
            type: 'smoke'
          });
        }
      }
    } else if (type === 'water-splash') {
      // Splash particles
      for (let i = 0; i < count; i++) {
        const angle = -Math.PI / 4 - Math.random() * Math.PI / 2; // general upwards spread
        const speed = 1.5 + Math.random() * 5;
        const color = Math.random() > 0.5 ? '#e0f2fe' : '#7dd3fc';
        particles.push({
          x: px,
          y: py,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2 + Math.random() * 5,
          color,
          alpha: 0.9,
          decay: 0.02,
          gravity: 0.18, // falls back down
          life: 25 + Math.random() * 20,
          maxLife: 45,
          type: 'water'
        });
      }
    } else if (type === 'gold-gain') {
      // Splendor gold gain coins flying up
      for (let i = 0; i < count; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
        const speed = 2 + Math.random() * 4;
        particles.push({
          x: px,
          y: py,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 3 + Math.random() * 3,
          color: '#fbbf24',
          alpha: 1,
          decay: 0.015,
          gravity: 0.12,
          life: 30 + Math.random() * 25,
          maxLife: 55,
          type: 'gold'
        });
      }
    }
  };

  // Listen to custom window events for dynamic triggerings across app
  useEffect(() => {
    const handleSpawnRequest = (e: Event) => {
      const customEvent = e as CustomEvent<{ x: number; y: number; type: string; count?: number }>;
      const { x, y, type, count } = customEvent.detail;
      spawnExplosion(x, y, count || 25, type);
    };

    window.addEventListener('spawn-pirate-particles', handleSpawnRequest);
    return () => {
      window.removeEventListener('spawn-pirate-particles', handleSpawnRequest);
    };
  }, []);

  // Continuous effect if the port is destroyed or background is destroyed
  useEffect(() => {
    if (!portDestroyed) return;

    // Periodically spawn fire and smoke at the hotspots/docks of the harbor to show active destruction
    const interval = setInterval(() => {
      // Let's spawn fires at random strategic coordinate points
      // 1. Left dock / Fish Market: x: 15%, y: 32%
      // 2. Right dock / Ship Market: x: 76%, y: 20%
      // 3. Center dock: x: 45%, y: 48%
      const locations = [
        { x: 12, y: 35 },
        { x: 74, y: 22 },
        { x: 45, y: 48 },
        { x: 50, y: 55 },
        { x: 30, y: 42 }
      ];

      const loc = locations[Math.floor(Math.random() * locations.length)];
      // Spawn small fire embers
      spawnExplosion(loc.x, loc.y, 3, 'fire-ember');
    }, 400);

    return () => clearInterval(interval);
  }, [portDestroyed]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 99, // Highly visible above other background layers but below UI controls
      }}
    />
  );
}
