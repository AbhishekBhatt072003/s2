'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Escaping NO button with all the stages and mobile-friendly behavior.
export default function Proposal({ question, yesButton, noTexts, onYes }) {
  const [stage, setStage] = useState(0);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [rot, setRot] = useState(0);
  const [isTouch, setIsTouch] = useState(false);
  const containerRef = useRef(null);
  const noRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsTouch(matchMedia('(hover: none)').matches);
    }
  }, []);

  // Desktop: cursor-chase
  useEffect(() => {
    if (isTouch) return;
    const onMove = (e) => {
      if (!noRef.current || stage < 1) return;
      const rect = noRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      const trigger = 140;
      if (dist < trigger) {
        const box = containerRef.current?.getBoundingClientRect();
        if (!box) return;
        // move opposite
        const strength = stage >= 3 ? 260 : 120;
        let nx = pos.x - (dx / (dist || 1)) * strength;
        let ny = pos.y - (dy / (dist || 1)) * strength;
        const maxX = box.width / 2 - 80;
        const maxY = box.height / 2 - 60;
        nx = Math.max(-maxX, Math.min(maxX, nx));
        ny = Math.max(-maxY, Math.min(maxY, ny));
        // stage 4: teleport
        if (stage === 3) {
          nx = (Math.random() * 2 - 1) * maxX * 0.9;
          ny = (Math.random() * 2 - 1) * maxY * 0.9;
        }
        setPos({ x: nx, y: ny });
        if (stage >= 4) setRot((r) => r + 25);
      }
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [isTouch, stage, pos]);

  const bumpStage = () => setStage((s) => Math.min(s + 1, noTexts.length - 1));

  const handleNoTap = () => {
    bumpStage();
    if (!containerRef.current) return;
    const box = containerRef.current.getBoundingClientRect();
    const maxX = box.width / 2 - 80;
    const maxY = box.height / 2 - 60;
    setPos({
      x: (Math.random() * 2 - 1) * maxX,
      y: (Math.random() * 2 - 1) * maxY,
    });
    setRot(Math.random() * 90 - 45);
  };

  // Sizing:
  // yes button grows with stage; no button shrinks
  const yesScale = 1 + Math.min(stage, 12) * 0.18;
  const noScale = Math.max(0.35, 1 - stage * 0.06);
  const noText = noTexts[Math.min(stage, noTexts.length - 1)];

  return (
    <div ref={containerRef} className="relative w-full min-h-[70vh] flex flex-col items-center justify-center px-6">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-4xl md:text-6xl text-center font-serif-fancy italic gradient-text mb-14"
      >
        {question}
      </motion.h2>

      <div className="relative w-full max-w-3xl h-[280px] md:h-[320px] flex items-center justify-center">
        {/* YES button */}
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

        {/* NO button */}
        <motion.button
          ref={noRef}
          onMouseEnter={() => !isTouch && stage === 0 && bumpStage()}
          onClick={handleNoTap}
          animate={{ x: pos.x, y: pos.y, rotate: rot, scale: noScale }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          className="absolute px-6 py-3 rounded-full bg-white/80 text-rose-800 font-serif-fancy text-lg md:text-xl border border-rose-200 shadow-lg"
        >
          {noText}
        </motion.button>
      </div>

      <p className="mt-10 text-rose-800/70 text-sm md:text-base italic">(hint: there's only one right answer)</p>
    </div>
  );
}
