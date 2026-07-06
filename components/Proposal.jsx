'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// Two possible desktop modes: 'runaway' (button flees from cursor around section) or 'staged' (transforms over stages)
// Mobile: tap-driven (teleport/shrink/rotate/rename with growing YES)
export default function Proposal({ question, yesButton, noTexts, onYes }) {
  const containerRef = useRef(null);
  const noRef = useRef(null);
  const [isTouch, setIsTouch] = useState(false);
  const [mode, setMode] = useState(null); // 'runaway' | 'staged' | 'mobile'
  const [stage, setStage] = useState(0);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [rot, setRot] = useState(0);

  // Randomly pick desktop behavior once
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const touch = matchMedia('(hover: none)').matches;
    setIsTouch(touch);
    if (touch) setMode('mobile');
    else setMode(Math.random() < 0.5 ? 'runaway' : 'staged');
  }, []);

  // Desktop cursor tracking
  useEffect(() => {
    if (!mode || mode === 'mobile') return;
    const onMove = (e) => {
      if (!noRef.current || !containerRef.current) return;
      const rect = noRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      const trigger = mode === 'runaway' ? 150 : 130;
      if (dist < trigger) {
        const box = containerRef.current.getBoundingClientRect();
        const maxX = box.width / 2 - 100;
        const maxY = box.height / 2 - 80;

        if (mode === 'runaway') {
          // Fly to a random corner-ish location every time cursor gets near
          const angle = Math.atan2(-dy, -dx) + (Math.random() - 0.5) * 1.2;
          const strength = 220 + Math.random() * 80;
          let nx = pos.x + Math.cos(angle) * strength;
          let ny = pos.y + Math.sin(angle) * strength;
          nx = Math.max(-maxX, Math.min(maxX, nx));
          ny = Math.max(-maxY, Math.min(maxY, ny));
          // if hit border, jump elsewhere
          if (Math.abs(nx) > maxX - 20 || Math.abs(ny) > maxY - 20) {
            nx = (Math.random() * 2 - 1) * maxX * 0.9;
            ny = (Math.random() * 2 - 1) * maxY * 0.9;
          }
          setPos({ x: nx, y: ny });
          setRot((Math.random() - 0.5) * 30);
        } else {
          // staged mode
          setStage((s) => Math.min(s + 1, noTexts.length - 1));
          let nx, ny;
          if (stage < 2) {
            nx = pos.x - (dx / (dist || 1)) * 90;
            ny = pos.y - (dy / (dist || 1)) * 90;
          } else if (stage < 4) {
            nx = pos.x - (dx / (dist || 1)) * 220;
            ny = pos.y - (dy / (dist || 1)) * 220;
          } else {
            // teleport
            nx = (Math.random() * 2 - 1) * maxX * 0.9;
            ny = (Math.random() * 2 - 1) * maxY * 0.9;
          }
          nx = Math.max(-maxX, Math.min(maxX, nx));
          ny = Math.max(-maxY, Math.min(maxY, ny));
          setPos({ x: nx, y: ny });
          if (stage >= 4) setRot((r) => r + 25);
        }
      }
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [mode, pos, stage, noTexts.length]);

  const onNoTap = () => {
    // Mobile-only behavior on tap (desktop click also works fine)
    if (!containerRef.current) return;
    const box = containerRef.current.getBoundingClientRect();
    const maxX = box.width / 2 - 100;
    const maxY = box.height / 2 - 80;
    setStage((s) => Math.min(s + 1, noTexts.length - 1));
    setPos({
      x: (Math.random() * 2 - 1) * maxX,
      y: (Math.random() * 2 - 1) * maxY,
    });
    setRot(Math.random() * 90 - 45);
  };

  const yesScale = useMemo(() => 1 + Math.min(stage, 14) * 0.16, [stage]);
  const noScale = useMemo(() => Math.max(0.28, 1 - stage * 0.055), [stage]);
  const noText = noTexts[Math.min(stage, noTexts.length - 1)];

  return (
    <div ref={containerRef} className="relative w-full min-h-[70vh] flex flex-col items-center justify-center px-6 overflow-hidden">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-4xl md:text-6xl text-center font-serif-fancy italic gradient-text mb-14"
      >
        {question}
      </motion.h2>

      <div className="relative w-full max-w-3xl h-[320px] md:h-[360px] flex items-center justify-center gap-6">
        {/* Static neutral positions so both are visible at start */}
        <motion.button
          onClick={onYes}
          animate={{ scale: yesScale }}
          transition={{ type: 'spring', stiffness: 220, damping: 18 }}
          className="relative px-10 py-5 rounded-full text-white font-serif-fancy text-2xl md:text-3xl shadow-2xl z-10"
          style={{
            background: 'linear-gradient(120deg, #ff5f8f 0%, #b46aff 100%)',
            boxShadow: '0 0 40px rgba(255, 95, 143, 0.55), 0 20px 40px rgba(180, 106, 255, 0.25)',
          }}
        >
          <span className="relative z-10">{yesButton}</span>
          <span className="absolute inset-0 rounded-full ring-2 ring-white/40 animate-pulse pointer-events-none" />
        </motion.button>

        <motion.button
          ref={noRef}
          onClick={onNoTap}
          animate={{ x: pos.x, y: pos.y, rotate: rot, scale: noScale }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          className="px-6 py-3 rounded-full bg-white/85 text-rose-800 font-serif-fancy text-lg md:text-xl border border-rose-200 shadow-lg z-20"
          style={{ minWidth: 90 }}
        >
          {noText}
        </motion.button>
      </div>

      <p className="mt-10 text-rose-800/70 text-sm md:text-base italic">
        {mode === 'runaway' && '(good luck catching that one)'}
        {mode === 'staged' && '(the more you try, the more it changes)'}
        {mode === 'mobile' && '(tap NO if you dare)'}
      </p>
    </div>
  );
}
