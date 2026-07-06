'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';

export default function IntroSequence({ lines, onBegin }) {
  const [phase, setPhase] = useState(0); // 0 black, 1 heart draw, 2 heart glow, 3 lines, 4 button
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1500);      // start drawing
    const t2 = setTimeout(() => setPhase(2), 4200);      // heart glow + particles
    const t3 = setTimeout(() => setPhase(3), 5400);      // start typing lines
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  useEffect(() => {
    if (phase < 3) return;
    if (visibleLines >= lines.length) {
      const t = setTimeout(() => setPhase(4), 800);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setVisibleLines((v) => v + 1), 1300);
    return () => clearTimeout(t);
  }, [phase, visibleLines, lines.length]);

  return (
    <div className="fixed inset-0 z-[100] bg-black overflow-hidden flex items-center justify-center">
      {/* Neon heart SVG that draws itself */}
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence>
          {phase >= 1 && (
            <motion.svg
              key="heart"
              width="220"
              height="200"
              viewBox="0 0 200 180"
              className={phase >= 2 ? 'heart-glow' : ''}
              initial={{ opacity: 1, scale: 1 }}
              animate={{ opacity: phase >= 3 ? 0 : 1, scale: phase >= 2 ? 1.06 : 1 }}
              transition={{ duration: 0.9 }}
            >
              <defs>
                <linearGradient id="neonGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ff5f8f" />
                  <stop offset="100%" stopColor="#b46aff" />
                </linearGradient>
              </defs>
              <motion.path
                d="M100 160 C 20 100, 20 30, 70 30 C 90 30, 100 50, 100 70 C 100 50, 110 30, 130 30 C 180 30, 180 100, 100 160 Z"
                fill={phase >= 2 ? 'url(#neonGrad)' : 'transparent'}
                stroke="url(#neonGrad)"
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2.6, ease: 'easeInOut' }}
                style={{ fillOpacity: phase >= 2 ? 0.95 : 0 }}
              />
            </motion.svg>
          )}
        </AnimatePresence>

        {/* Particle burst when heart glows */}
        {phase >= 2 && phase < 3 && (
          <div className="absolute">
            {[...Array(28)].map((_, i) => {
              const angle = (i / 28) * Math.PI * 2;
              return (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full"
                  style={{ background: 'radial-gradient(circle, #ffd1dc, transparent)' }}
                  initial={{ x: 0, y: 0, opacity: 1 }}
                  animate={{
                    x: Math.cos(angle) * 220,
                    y: Math.sin(angle) * 220,
                    opacity: 0,
                  }}
                  transition={{ duration: 1.4, ease: 'easeOut' }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Line-by-line story */}
      <AnimatePresence>
        {phase >= 3 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-6">
            {lines.slice(0, visibleLines).map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                className={`text-white text-center font-serif-fancy ${
                  i === lines.length - 1 ? 'text-3xl md:text-5xl italic' : 'text-2xl md:text-4xl'
                }`}
                style={{ textShadow: '0 0 24px rgba(255,105,180,0.35)' }}
              >
                {line}
              </motion.p>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Begin button */}
      <AnimatePresence>
        {phase >= 4 && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8 }}
            onClick={onBegin}
            className="absolute bottom-24 md:bottom-28 group"
          >
            <div className="relative flex items-center gap-3 px-10 py-4 rounded-full text-white font-serif-fancy text-xl md:text-2xl"
                 style={{
                   background: 'linear-gradient(120deg, #ff5f8f, #b46aff)',
                   boxShadow: '0 0 40px rgba(255, 95, 143, 0.7), 0 0 80px rgba(180, 106, 255, 0.35)',
                 }}>
              <Heart className="w-6 h-6 fill-white" />
              <span>Begin</span>
              <span className="absolute inset-0 rounded-full ring-2 ring-white/40 animate-ping" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
