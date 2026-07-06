'use client';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

// Star position data (relative to constellation centre)
const TAURUS = {
  stars: [
    { x: 0,   y: 0,   r: 4.8, bright: true,  name: 'Aldebaran' },
    { x: -34, y: -8,  r: 2.4 },
    { x: -52, y: -30, r: 2.0 },
    { x: -18, y: -22, r: 2.2 },
    { x: 22,  y: -20, r: 2.6 },
    { x: 46,  y: -58, r: 3.6, bright: true, name: 'El Nath' },  // horn tip
    { x: -70, y: -78, r: 3.2, bright: true },                    // other horn
  ],
  edges: [[0, 1], [1, 2], [1, 3], [0, 3], [0, 4], [4, 5], [3, 6]],
};

const SAGITTARIUS = {
  stars: [
    { x: -22, y: 14,  r: 3.4, bright: true, name: 'Kaus Australis' },
    { x: 22,  y: 14,  r: 3.0, bright: true, name: 'Nunki' },
    { x: 22,  y: -14, r: 2.6 },
    { x: -22, y: -14, r: 2.4 },
    { x: 0,   y: -34, r: 3.6, bright: true, name: 'Kaus Borealis' },
    { x: 46,  y: -6,  r: 2.0 },
    { x: -46, y: -6,  r: 2.0 },
    { x: 0,   y: 30,  r: 2.4 },
  ],
  edges: [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [2, 4], [1, 5], [0, 6], [0, 7], [1, 7]],
};

// A single "sparkle" star with a 4-point twinkle for bright stars, or a soft glow for dim ones
function Star({ cx, cy, r, bright, color, glow, delay = 0 }) {
  const glowR = r + (bright ? 10 : 5);
  return (
    <g>
      {/* soft outer halo */}
      <motion.circle cx={cx} cy={cy} r={glowR + 4} fill={glow} opacity={bright ? 0.12 : 0.08}
        animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 3 + (r % 2), delay, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: `${cx}px ${cy}px` }} />
      <circle cx={cx} cy={cy} r={glowR} fill={glow} opacity={bright ? 0.28 : 0.18} />
      {/* 4-point sparkle rays for bright stars */}
      {bright && (
        <>
          <line x1={cx - r * 3.6} y1={cy} x2={cx + r * 3.6} y2={cy} stroke={color} strokeOpacity="0.55" strokeWidth="0.6" />
          <line x1={cx} y1={cy - r * 3.6} x2={cx} y2={cy + r * 3.6} stroke={color} strokeOpacity="0.55" strokeWidth="0.6" />
          <line x1={cx - r * 1.8} y1={cy - r * 1.8} x2={cx + r * 1.8} y2={cy + r * 1.8} stroke={color} strokeOpacity="0.25" strokeWidth="0.4" />
          <line x1={cx + r * 1.8} y1={cy - r * 1.8} x2={cx - r * 1.8} y2={cy + r * 1.8} stroke={color} strokeOpacity="0.25" strokeWidth="0.4" />
        </>
      )}
      {/* core */}
      <circle cx={cx} cy={cy} r={r} fill={color} />
      <motion.circle cx={cx} cy={cy} r={r * 0.5} fill="#ffffff"
        animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2.5 + (r % 3), delay, repeat: Infinity, ease: 'easeInOut' }} />
    </g>
  );
}

function Constellation({ data, color, glow, label, sub }) {
  return (
    <g>
      {/* connecting lines — soft dashed */}
      {data.edges.map(([a, b], i) => {
        const A = data.stars[a], B = data.stars[b];
        return (
          <line key={i} x1={A.x} y1={A.y} x2={B.x} y2={B.y}
            stroke={color} strokeOpacity="0.32" strokeWidth="0.7" strokeDasharray="1.5 3" strokeLinecap="round" />
        );
      })}
      {data.stars.map((s, i) => (
        <Star key={i} cx={s.x} cy={s.y} r={s.r} bright={s.bright} color={color} glow={glow} delay={i * 0.3} />
      ))}
      <text x="0" y="70" textAnchor="middle" fill={color} fontSize="8.5" fontFamily="'Cormorant Garamond', serif" opacity="0.85" letterSpacing="4">{label}</text>
      <text x="0" y="84" textAnchor="middle" fill={glow} fontSize="9" fontFamily="'Dancing Script', cursive" opacity="0.95">{sub}</text>
    </g>
  );
}

export default function Constellations() {
  // Denser twinkling star field for the deep zoom-in
  const bgStars = useMemo(() => Array.from({ length: 140 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    r: Math.random() * 1.4 + 0.3,
    delay: Math.random() * 5,
    dur: 2.5 + Math.random() * 4,
    color: Math.random() < 0.15 ? '#ffe4a1' : Math.random() < 0.35 ? '#dcd6ff' : '#ffffff',
  })), []);

  // Occasional shooting stars
  const shootingStars = useMemo(() => Array.from({ length: 3 }, (_, i) => ({
    top: 10 + Math.random() * 40,
    left: -20,
    duration: 12 + i * 8,
    delay: i * 6,
  })), []);

  return (
    <section className="relative py-24 px-4 md:px-6 overflow-hidden">
      <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="text-center font-script text-5xl md:text-7xl mb-3 relative z-10"
        style={{ color: '#f9d3ff' }}>
        Written in the stars
      </motion.h2>
      <p className="text-center font-serif-fancy italic mb-10 relative z-10" style={{ color: 'rgba(255, 223, 240, 0.8)' }}>
        my Taurus and your Sagittarius, quietly orbiting each other since forever — <span className="whitespace-nowrap">Sonu ♡ Sameer</span>
      </p>

      <div className="relative max-w-5xl mx-auto rounded-[2rem] overflow-hidden"
        style={{
          background:
            'radial-gradient(1000px 500px at 30% 30%, #23134a 0%, transparent 55%),\
             radial-gradient(900px 500px at 70% 70%, #351b6a 0%, transparent 55%),\
             linear-gradient(180deg, #100826 0%, #150a2e 55%, #0e0620 100%)',
          boxShadow: '0 30px 80px rgba(20, 8, 40, 0.35), inset 0 0 100px rgba(180, 106, 255, 0.08)',
        }}>
        {/* Background stars */}
        <div className="absolute inset-0">
          {bgStars.map((s, i) => (
            <motion.div key={i} className="absolute rounded-full" style={{
              left: `${s.x}%`, top: `${s.y}%`,
              width: s.r * 2, height: s.r * 2,
              background: s.color,
              boxShadow: `0 0 ${s.r * 4}px ${s.color}`,
            }}
              animate={{ opacity: [0.15, 0.95, 0.15] }}
              transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }} />
          ))}
        </div>

        {/* Shooting stars */}
        {shootingStars.map((s, i) => (
          <motion.div key={`ss-${i}`} className="absolute h-px pointer-events-none"
            style={{
              top: `${s.top}%`, left: `${s.left}%`,
              width: 140,
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.9) 50%, transparent 100%)',
              filter: 'blur(0.5px)',
            }}
            animate={{ x: ['-10vw', '130vw'], opacity: [0, 1, 0] }}
            transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: 'easeInOut', repeatDelay: 6 }} />
        ))}

        {/* Nebula clouds */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background:
            'radial-gradient(400px 220px at 25% 30%, rgba(255, 130, 190, 0.16), transparent 70%),\
             radial-gradient(500px 250px at 70% 70%, rgba(180, 106, 255, 0.20), transparent 70%),\
             radial-gradient(300px 200px at 85% 20%, rgba(255, 200, 130, 0.06), transparent 70%)',
        }} />

        <div className="relative flex items-center justify-center" style={{ height: 'min(72vh, 580px)' }}>
          <svg viewBox="-260 -220 520 440" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
            {/* Faint orbit rings */}
            <ellipse cx="0" cy="0" rx="180" ry="95" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" strokeDasharray="1.5 5" />
            <ellipse cx="0" cy="0" rx="155" ry="82" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" strokeDasharray="1.5 5" />

            {/* Central heart */}
            <motion.g animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }} style={{ transformOrigin: '0 0' }}>
              <circle cx="0" cy="0" r="26" fill="rgba(255, 130, 190, 0.06)" />
              <circle cx="0" cy="0" r="14" fill="rgba(255, 130, 190, 0.14)" />
              <text x="0" y="4" textAnchor="middle" fontSize="12" fill="#ffb1cf">♥</text>
            </motion.g>

            {/* Taurus (Sonu) orbits at ~90s */}
            <motion.g animate={{ rotate: 360 }} transition={{ duration: 90, ease: 'linear', repeat: Infinity }} style={{ transformOrigin: '0 0' }}>
              <g transform="translate(-170, 0)">
                <motion.g animate={{ rotate: -360 }} transition={{ duration: 90, ease: 'linear', repeat: Infinity }} style={{ transformOrigin: '0 0' }}>
                  <Constellation data={TAURUS} color="#fff4f8" glow="#ff8fb1" label="TAURUS" sub="Sonu" />
                </motion.g>
              </g>
            </motion.g>

            {/* Sagittarius (Sameer) orbits opposite direction at ~120s */}
            <motion.g animate={{ rotate: -360 }} transition={{ duration: 120, ease: 'linear', repeat: Infinity }} style={{ transformOrigin: '0 0' }}>
              <g transform="translate(170, 0)">
                <motion.g animate={{ rotate: 360 }} transition={{ duration: 120, ease: 'linear', repeat: Infinity }} style={{ transformOrigin: '0 0' }}>
                  <Constellation data={SAGITTARIUS} color="#f4ecff" glow="#c48bff" label="SAGITTARIUS" sub="Sameer" />
                </motion.g>
              </g>
            </motion.g>
          </svg>
        </div>

        <div className="relative z-10 text-center pb-10 px-6 italic text-sm font-serif-fancy" style={{ color: 'rgba(255, 223, 240, 0.7)' }}>
          slow. quiet. certain. — like us.
        </div>
      </div>
    </section>
  );
}
