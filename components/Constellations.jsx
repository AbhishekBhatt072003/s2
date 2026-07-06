'use client';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

// A dreamy night-sky section where Abheer's Taurus and Sameer's Sagittarius
// slowly orbit a shared centre. Very slow. Very elegant. No cheese.

// star positions relative to constellation centre (0,0)
const TAURUS = {
  stars: [
    { x: 0, y: 0, r: 3.5, name: 'Aldebaran' },
    { x: -34, y: -8, r: 1.8 },
    { x: -52, y: -30, r: 1.6 },
    { x: -18, y: -22, r: 1.6 },
    { x: 22, y: -20, r: 1.8 },
    { x: 46, y: -58, r: 2.4 },  // horn tip
    { x: -70, y: -78, r: 2.2 },  // other horn
  ],
  edges: [[0, 1], [1, 2], [1, 3], [0, 3], [0, 4], [4, 5], [3, 6]],
};

const SAGITTARIUS = {
  // simplified 'teapot' asterism
  stars: [
    { x: -22, y: 14, r: 2.4, name: 'Kaus Australis' },
    { x: 22, y: 14, r: 2.2, name: 'Nunki' },
    { x: 22, y: -14, r: 2.0 },
    { x: -22, y: -14, r: 2.0 },
    { x: 0, y: -34, r: 2.6, name: 'Kaus Borealis' },   // lid
    { x: 46, y: -6, r: 1.6 },                          // spout
    { x: -46, y: -6, r: 1.6 },                         // handle
    { x: 0, y: 30, r: 1.8 },                           // base center
  ],
  edges: [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [2, 4], [1, 5], [0, 6], [0, 7], [1, 7]],
};

function Constellation({ data, color = '#ffe6f0', glow = '#ff9ac2', label, sub }) {
  return (
    <g>
      {/* connecting lines */}
      {data.edges.map(([a, b], i) => {
        const A = data.stars[a], B = data.stars[b];
        return (
          <line key={i} x1={A.x} y1={A.y} x2={B.x} y2={B.y}
            stroke={color} strokeOpacity="0.35" strokeWidth="0.8" />
        );
      })}
      {/* stars */}
      {data.stars.map((s, i) => (
        <g key={i}>
          <circle cx={s.x} cy={s.y} r={s.r + 5} fill={glow} opacity="0.18" />
          <circle cx={s.x} cy={s.y} r={s.r + 2} fill={glow} opacity="0.35" />
          <circle cx={s.x} cy={s.y} r={s.r} fill={color} />
        </g>
      ))}
      {/* label */}
      <text x="0" y="60" textAnchor="middle" fill={color} fontSize="9" fontFamily="'Cormorant Garamond', serif" opacity="0.85" letterSpacing="3">{label}</text>
      <text x="0" y="74" textAnchor="middle" fill={glow} fontSize="8" fontFamily="'Dancing Script', cursive" opacity="0.9">{sub}</text>
    </g>
  );
}

export default function Constellations() {
  // Twinkling star field
  const bgStars = useMemo(() => Array.from({ length: 80 }, (_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    r: Math.random() * 1.2 + 0.4,
    delay: Math.random() * 4,
    dur: 3 + Math.random() * 4,
  })), []);

  return (
    <section className="relative py-24 px-4 md:px-6 overflow-hidden">
      <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="text-center font-script text-5xl md:text-7xl gradient-text mb-3 relative z-10">
        Written in the stars
      </motion.h2>
      <p className="text-center text-rose-900/70 font-serif-fancy italic mb-10 relative z-10">
        my Taurus and your Sagittarius, quietly orbiting each other since forever
      </p>

      <div className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl"
        style={{
          background:
            'radial-gradient(1200px 400px at 30% 30%, #1a1240 0%, transparent 60%),\
             radial-gradient(900px 500px at 70% 70%, #2b1750 0%, transparent 60%),\
             linear-gradient(180deg, #0b0722 0%, #150a2e 60%, #1c0c3a 100%)',
        }}>
        {/* Background stars */}
        <div className="absolute inset-0">
          {bgStars.map((s, i) => (
            <motion.div key={i} className="absolute rounded-full" style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.r * 2, height: s.r * 2, background: 'white' }}
              animate={{ opacity: [0.15, 0.9, 0.15] }} transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }} />
          ))}
        </div>

        {/* soft nebula clouds */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background:
            'radial-gradient(400px 220px at 25% 30%, rgba(255, 105, 180, 0.14), transparent 70%),\
             radial-gradient(500px 250px at 70% 65%, rgba(180, 106, 255, 0.14), transparent 70%)',
        }} />

        <div className="relative flex items-center justify-center" style={{ height: 'min(70vh, 560px)' }}>
          <svg viewBox="-260 -220 520 440" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
            {/* Faint orbit rings */}
            <ellipse cx="0" cy="0" rx="170" ry="90" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" strokeDasharray="2 4" />
            <ellipse cx="0" cy="0" rx="150" ry="80" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" strokeDasharray="2 4" />

            {/* Tiny centre heart */}
            <g>
              <circle cx="0" cy="0" r="22" fill="rgba(255, 105, 180, 0.08)" />
              <circle cx="0" cy="0" r="10" fill="rgba(255, 105, 180, 0.16)" />
              <text x="0" y="3" textAnchor="middle" fontSize="9" fill="#ffb1cf">♥</text>
            </g>

            {/* Taurus (Abheer) orbits at ~90s */}
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: 90, ease: 'linear', repeat: Infinity }}
              style={{ transformOrigin: '0 0' }}
            >
              <g transform="translate(-170, 0)">
                {/* Counter-rotate so labels stay upright */}
                <motion.g animate={{ rotate: -360 }} transition={{ duration: 90, ease: 'linear', repeat: Infinity }} style={{ transformOrigin: '0 0' }}>
                  <Constellation data={TAURUS} color="#ffe4ec" glow="#ff8fb1" label="TAURUS" sub="Abheer" />
                </motion.g>
              </g>
            </motion.g>

            {/* Sagittarius (Sameer) orbits opposite direction at ~120s */}
            <motion.g
              animate={{ rotate: -360 }}
              transition={{ duration: 120, ease: 'linear', repeat: Infinity }}
              style={{ transformOrigin: '0 0' }}
            >
              <g transform="translate(170, 0)">
                <motion.g animate={{ rotate: 360 }} transition={{ duration: 120, ease: 'linear', repeat: Infinity }} style={{ transformOrigin: '0 0' }}>
                  <Constellation data={SAGITTARIUS} color="#e8d9ff" glow="#b46aff" label="SAGITTARIUS" sub="Sameer" />
                </motion.g>
              </g>
            </motion.g>
          </svg>
        </div>

        <div className="relative z-10 text-center pb-8 px-6 text-white/70 font-serif-fancy italic text-sm">
          slow. quiet. certain. — like us.
        </div>
      </div>
    </section>
  );
}
