'use client';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { ChevronDown } from 'lucide-react';

// Star position data (relative to constellation centre in the SVG viewbox)
const TAURUS = {
  stars: [
    { x: 0,    y: 0,   r: 5.5, bright: true,  name: 'Aldebaran' },
    { x: -34,  y: -8,  r: 2.6 },
    { x: -52,  y: -30, r: 2.2 },
    { x: -18,  y: -22, r: 2.4 },
    { x: 22,   y: -20, r: 2.8 },
    { x: 46,   y: -58, r: 4.2, bright: true, name: 'El Nath' },
    { x: -70,  y: -78, r: 3.6, bright: true },
    { x: -22,  y: 20,  r: 2.2 },
    { x: -50,  y: 8,   r: 2.0 },
  ],
  edges: [[0, 1], [1, 2], [1, 3], [0, 3], [0, 4], [4, 5], [3, 6], [0, 7], [7, 8]],
};

const SAGITTARIUS = {
  stars: [
    { x: -22, y: 14,  r: 4.0, bright: true, name: 'Kaus Australis' },
    { x: 22,  y: 14,  r: 3.6, bright: true, name: 'Nunki' },
    { x: 22,  y: -14, r: 2.8 },
    { x: -22, y: -14, r: 2.6 },
    { x: 0,   y: -34, r: 4.2, bright: true, name: 'Kaus Borealis' },
    { x: 46,  y: -6,  r: 2.2 },
    { x: -46, y: -6,  r: 2.2 },
    { x: 0,   y: 30,  r: 2.6 },
    { x: 32,  y: 34,  r: 2.0 },
    { x: -32, y: 34,  r: 2.0 },
  ],
  edges: [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [2, 4], [1, 5], [0, 6], [0, 7], [1, 7], [7, 8], [7, 9]],
};

function BigStar({ cx, cy, r, delay = 0 }) {
  const flare = r * 5.5;
  return (
    <g>
      {/* soft outer halo */}
      <circle cx={cx} cy={cy} r={r * 4.5} fill="url(#warmGlow)" opacity="0.75" />
      {/* long cross flare */}
      <motion.g animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 3 + (r % 2), delay, repeat: Infinity, ease: 'easeInOut' }}>
        <line x1={cx - flare} y1={cy} x2={cx + flare} y2={cy} stroke="#fff5db" strokeWidth="0.5" strokeLinecap="round" opacity="0.85" filter="url(#softBlur)" />
        <line x1={cx} y1={cy - flare} x2={cx} y2={cy + flare} stroke="#fff5db" strokeWidth="0.5" strokeLinecap="round" opacity="0.85" filter="url(#softBlur)" />
        <line x1={cx - flare * 0.55} y1={cy - flare * 0.55} x2={cx + flare * 0.55} y2={cy + flare * 0.55} stroke="#ffe6a3" strokeWidth="0.35" opacity="0.5" filter="url(#softBlur)" />
        <line x1={cx + flare * 0.55} y1={cy - flare * 0.55} x2={cx - flare * 0.55} y2={cy + flare * 0.55} stroke="#ffe6a3" strokeWidth="0.35" opacity="0.5" filter="url(#softBlur)" />
      </motion.g>
      {/* core */}
      <circle cx={cx} cy={cy} r={r} fill="#fffbe8" />
      <circle cx={cx} cy={cy} r={r * 0.5} fill="#ffffff" />
    </g>
  );
}

function DimStar({ cx, cy, r, delay = 0 }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r * 2.4} fill="url(#warmGlow)" opacity="0.5" />
      <motion.circle cx={cx} cy={cy} r={r} fill="#fff5db"
        animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2.5 + (r % 2), delay, repeat: Infinity, ease: 'easeInOut' }} />
    </g>
  );
}

function Constellation({ data }) {
  return (
    <g>
      {/* connecting lines (subtle golden) */}
      {data.edges.map(([a, b], i) => {
        const A = data.stars[a], B = data.stars[b];
        return (
          <line key={i} x1={A.x} y1={A.y} x2={B.x} y2={B.y}
            stroke="#ffe6a3" strokeOpacity="0.38" strokeWidth="0.5" strokeLinecap="round" />
        );
      })}
      {data.stars.map((s, i) => (
        s.bright
          ? <BigStar key={i} cx={s.x} cy={s.y} r={s.r} delay={i * 0.3} />
          : <DimStar key={i} cx={s.x} cy={s.y} r={s.r} delay={i * 0.4} />
      ))}
    </g>
  );
}

function HeartDivider() {
  return (
    <div className="flex items-center justify-center gap-4 my-6 relative z-10">
      <span className="h-px w-24 md:w-40 bg-gradient-to-r from-transparent via-rose-300/70 to-rose-300/70" />
      <svg width="22" height="20" viewBox="0 0 22 20">
        <path d="M11 18 C 2 12, 2 3, 7 3 C 9 3, 11 5, 11 7 C 11 5, 13 3, 15 3 C 20 3, 20 12, 11 18 Z"
          fill="none" stroke="#e88fa9" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
      <span className="h-px w-24 md:w-40 bg-gradient-to-l from-transparent via-rose-300/70 to-rose-300/70" />
    </div>
  );
}

export default function Constellations() {
  // Dense twinkling star field
  const bgStars = useMemo(() => Array.from({ length: 220 }, () => ({
    x: Math.random() * 100,
    y: 15 + Math.random() * 85,
    r: Math.random() * 1.4 + 0.2,
    delay: Math.random() * 6,
    dur: 2 + Math.random() * 5,
    color: Math.random() < 0.12 ? '#ffe4a1' : Math.random() < 0.30 ? '#e0d5ff' : '#ffffff',
  })), []);

  const shootingStars = useMemo(() => Array.from({ length: 3 }, (_, i) => ({
    top: 22 + Math.random() * 30,
    duration: 8 + i * 4,
    delay: i * 5 + 2,
  })), []);

  return (
    <section className="relative overflow-hidden">
      {/* Fully transparent at top & bottom edges so the pink mesh-bg blends through — no visible seam */}
      <div className="absolute inset-0 -z-10" style={{
        background:
          'linear-gradient(180deg,\
            rgba(232, 180, 217, 0) 0%,\
            rgba(140, 90, 155, 0.18) 6%,\
            rgba(90, 55, 130, 0.55) 14%,\
            rgba(45, 22, 85, 0.88) 26%,\
            rgba(20, 10, 45, 0.96) 42%,\
            rgba(20, 10, 45, 0.96) 60%,\
            rgba(45, 22, 85, 0.88) 76%,\
            rgba(90, 55, 130, 0.55) 88%,\
            rgba(180, 130, 190, 0.18) 96%,\
            rgba(232, 180, 217, 0) 100%)',
      }} />

      {/* Milky Way — left cloud (soft, low opacity near edges) */}
      <div className="absolute inset-y-16 md:inset-y-32 left-0 w-1/3 pointer-events-none opacity-70" style={{
        background:
          'radial-gradient(ellipse 60% 50% at 20% 70%, rgba(180, 106, 255, 0.55) 0%, rgba(255, 130, 190, 0.15) 40%, transparent 70%),\
           radial-gradient(ellipse 40% 30% at 10% 50%, rgba(220, 180, 255, 0.35) 0%, transparent 70%)',
        filter: 'blur(2px)',
      }} />
      {/* Milky Way — right cloud */}
      <div className="absolute inset-y-16 md:inset-y-32 right-0 w-1/3 pointer-events-none opacity-70" style={{
        background:
          'radial-gradient(ellipse 60% 50% at 80% 60%, rgba(180, 106, 255, 0.55) 0%, rgba(255, 130, 190, 0.15) 40%, transparent 70%),\
           radial-gradient(ellipse 40% 30% at 90% 40%, rgba(255, 180, 220, 0.3) 0%, transparent 70%)',
        filter: 'blur(2px)',
      }} />

      {/* Background twinkling stars */}
      <div className="absolute inset-0 pointer-events-none">
        {bgStars.map((s, i) => (
          <motion.div key={i} className="absolute rounded-full"
            style={{
              left: `${s.x}%`, top: `${s.y}%`,
              width: s.r * 2, height: s.r * 2,
              background: s.color,
              boxShadow: `0 0 ${s.r * 5}px ${s.color}`,
            }}
            animate={{ opacity: [0.15, 0.95, 0.15] }}
            transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }} />
        ))}
      </div>

      {/* Occasional shooting star */}
      {shootingStars.map((s, i) => (
        <motion.div key={`ss-${i}`} className="absolute h-px pointer-events-none"
          style={{
            top: `${s.top}%`, left: '-10%',
            width: 160,
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.9) 45%, rgba(255,220,180,0.8) 60%, transparent 100%)',
            filter: 'blur(0.4px)',
          }}
          animate={{ x: ['0vw', '130vw'], opacity: [0, 1, 0] }}
          transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: 'easeInOut', repeatDelay: 10 }} />
      ))}

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 pt-24 pb-20">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center font-script text-5xl md:text-7xl italic"
          style={{ color: '#3a1d5b', textShadow: '0 2px 24px rgba(255, 255, 255, 0.35)' }}>
          Written in the stars
        </motion.h2>
        <p className="text-center font-serif-fancy mt-4" style={{ color: '#3a1d5b' }}>
          my Taurus and your Sagittarius,<br />
          quietly orbiting each other since forever
        </p>
        <p className="text-center font-script text-xl md:text-2xl mt-3" style={{ color: '#e88fa9' }}>
          — Sonu ♡ Sameer
        </p>

        <HeartDivider />

        {/* SVG constellation stage */}
        <div className="relative" style={{ height: 'min(70vh, 620px)' }}>
          <svg viewBox="-320 -220 640 440" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
            <defs>
              <radialGradient id="warmGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fff8d4" stopOpacity="0.95" />
                <stop offset="25%" stopColor="#ffe6a3" stopOpacity="0.75" />
                <stop offset="55%" stopColor="#ff9ac2" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#ff9ac2" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="heartGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffd6e5" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#ff9ac2" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#ff9ac2" stopOpacity="0" />
              </radialGradient>
              <filter id="softBlur">
                <feGaussianBlur stdDeviation="0.5" />
              </filter>
            </defs>

            {/* Faint dashed orbit ellipse */}
            <ellipse cx="0" cy="0" rx="240" ry="90" fill="none"
              stroke="rgba(255, 220, 190, 0.35)" strokeWidth="0.6" strokeDasharray="2 4" />
            <ellipse cx="0" cy="0" rx="200" ry="72" fill="none"
              stroke="rgba(255, 220, 190, 0.22)" strokeWidth="0.4" strokeDasharray="1.5 5" />

            {/* Central heart */}
            <motion.g animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }} style={{ transformOrigin: '0 0' }}>
              <circle cx="0" cy="0" r="26" fill="url(#heartGlow)" />
              <path d="M0 12 C -10 4, -10 -6, -5 -6 C -3 -6, 0 -4, 0 -2 C 0 -4, 3 -6, 5 -6 C 10 -6, 10 4, 0 12 Z"
                fill="#ffb1cf" stroke="#ff8fb1" strokeWidth="0.6" />
            </motion.g>

            {/* Taurus (Sonu) — orbits at 90s */}
            <motion.g animate={{ rotate: 360 }} transition={{ duration: 90, ease: 'linear', repeat: Infinity }} style={{ transformOrigin: '0 0' }}>
              <g transform="translate(-200, 0)">
                <motion.g animate={{ rotate: -360 }} transition={{ duration: 90, ease: 'linear', repeat: Infinity }} style={{ transformOrigin: '0 0' }}>
                  <Constellation data={TAURUS} />
                </motion.g>
              </g>
            </motion.g>

            {/* Sagittarius (Sameer) — orbits opposite direction at 120s */}
            <motion.g animate={{ rotate: -360 }} transition={{ duration: 120, ease: 'linear', repeat: Infinity }} style={{ transformOrigin: '0 0' }}>
              <g transform="translate(200, 0)">
                <motion.g animate={{ rotate: 360 }} transition={{ duration: 120, ease: 'linear', repeat: Infinity }} style={{ transformOrigin: '0 0' }}>
                  <Constellation data={SAGITTARIUS} />
                </motion.g>
              </g>
            </motion.g>
          </svg>
        </div>

        {/* Labels row */}
        <div className="grid grid-cols-2 mt-2 md:mt-4">
          <div className="text-center">
            <div className="tracking-[0.35em] text-sm md:text-base" style={{ color: '#fff5db' }}>T A U R U S</div>
            <div className="font-script text-xl md:text-2xl mt-1" style={{ color: '#ffb1cf' }}>Sonu</div>
          </div>
          <div className="text-center">
            <div className="tracking-[0.35em] text-sm md:text-base" style={{ color: '#fff5db' }}>S A G I T T A R I U S</div>
            <div className="font-script text-xl md:text-2xl mt-1" style={{ color: '#ffb1cf' }}>Sameer</div>
          </div>
        </div>

        <p className="text-center italic mt-14 font-serif-fancy" style={{ color: 'rgba(255, 240, 250, 0.85)' }}>
          slow. quiet. certain… like us.
        </p>

        <motion.div className="mt-14 flex flex-col items-center gap-1"
          animate={{ y: [0, 8, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ color: 'rgba(255, 220, 240, 0.75)' }}>
          <span className="italic font-serif-fancy text-sm">scroll to explore our universe</span>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </div>
    </section>
  );
}
