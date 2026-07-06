'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// -- 25 popup taunt messages with a sad/angry emoji --
const POPUPS = [
  { msg: 'No', emoji: '😒' },
  { msg: 'Are you sure?', emoji: '🥺' },
  { msg: 'Really?', emoji: '😢' },
  { msg: 'Think again...', emoji: '🤨' },
  { msg: 'Last chance', emoji: '😔' },
  { msg: 'Surely not?', emoji: '😞' },
  { msg: 'Please?', emoji: '🥺' },
  { msg: "You'll regret this", emoji: '😤' },
  { msg: "I don't believe you", emoji: '🙄' },
  { msg: 'Read the question again', emoji: '😑' },
  { msg: 'Wrong button', emoji: '😾' },
  { msg: 'Seriously?', emoji: '😠' },
  { msg: 'Fine...', emoji: '😩' },
  { msg: "Don't break my heart", emoji: '💔' },
  { msg: "No doesn't suit you", emoji: '🥲' },
  { msg: 'Try again', emoji: '😢' },
  { msg: 'Ouch, that hurt', emoji: '😭' },
  { msg: 'One more try?', emoji: '🥺' },
  { msg: 'My heart is crying', emoji: '💔' },
  { msg: 'Look at me and press YES', emoji: '🥹' },
  { msg: 'Come on Sameer...', emoji: '😔' },
  { msg: 'Are you kidding?', emoji: '😾' },
  { msg: "That's not the answer", emoji: '😒' },
  { msg: 'Pretty please 💕', emoji: '🥺' },
  { msg: 'The other one, love', emoji: '🙄' },
];

export default function Proposal({ question, yesButton, noTexts, onYes }) {
  const containerRef = useRef(null);
  const noRef = useRef(null);
  const [isTouch, setIsTouch] = useState(false);
  const [mode, setMode] = useState(null); // 'runaway' | 'popup' | 'mobile'
  const [stage, setStage] = useState(0);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [rot, setRot] = useState(0);
  const [popups, setPopups] = useState([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const touch = matchMedia('(hover: none)').matches;
    setIsTouch(touch);
    if (touch) setMode('mobile');
    else setMode(Math.random() < 0.5 ? 'runaway' : 'popup');
  }, []);

  // Desktop cursor-chase (only for 'runaway' mode)
  useEffect(() => {
    if (mode !== 'runaway') return;
    const onMove = (e) => {
      if (!noRef.current || !containerRef.current) return;
      const rect = noRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      const trigger = 150;
      if (dist < trigger) {
        const box = containerRef.current.getBoundingClientRect();
        const maxX = box.width / 2 - 100;
        const maxY = box.height / 2 - 80;
        const angle = Math.atan2(-dy, -dx) + (Math.random() - 0.5) * 1.2;
        const strength = 220 + Math.random() * 80;
        let nx = pos.x + Math.cos(angle) * strength;
        let ny = pos.y + Math.sin(angle) * strength;
        nx = Math.max(-maxX, Math.min(maxX, nx));
        ny = Math.max(-maxY, Math.min(maxY, ny));
        if (Math.abs(nx) > maxX - 20 || Math.abs(ny) > maxY - 20) {
          nx = (Math.random() * 2 - 1) * maxX * 0.9;
          ny = (Math.random() * 2 - 1) * maxY * 0.9;
        }
        setPos({ x: nx, y: ny });
        setRot((Math.random() - 0.5) * 30);
      }
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [mode, pos]);

  const spawnPopup = () => {
    if (!containerRef.current) return;
    const box = containerRef.current.getBoundingClientRect();
    const p = POPUPS[Math.floor(Math.random() * POPUPS.length)];
    // random position within middle 80% of the container
    const w = box.width, h = box.height;
    const x = w * (0.1 + Math.random() * 0.8) - w / 2;
    const y = h * (0.15 + Math.random() * 0.7) - h / 2;
    const id = Math.random().toString(36).slice(2);
    setPopups((prev) => [...prev.slice(-6), { id, x, y, ...p }]);
    setTimeout(() => setPopups((prev) => prev.filter((pp) => pp.id !== id)), 2500);
  };

  const onNoClick = () => {
    // MOBILE: teleport / shrink / rotate / rename dance (unchanged)
    if (mode === 'mobile') {
      if (!containerRef.current) return;
      const box = containerRef.current.getBoundingClientRect();
      const maxX = box.width / 2 - 100;
      const maxY = box.height / 2 - 80;
      setStage((s) => Math.min(s + 1, noTexts.length - 1));
      setPos({ x: (Math.random() * 2 - 1) * maxX, y: (Math.random() * 2 - 1) * maxY });
      setRot(Math.random() * 90 - 45);
      return;
    }
    // POPUP mode (desktop behaviour 2)
    if (mode === 'popup') {
      spawnPopup();
      // YES grows with every press. NO stays put.
      setStage((s) => s + 1);
      return;
    }
    // RUNAWAY mode click: also nudge as extra feedback
    if (mode === 'runaway') {
      setStage((s) => s + 1);
      const box = containerRef.current.getBoundingClientRect();
      const maxX = box.width / 2 - 100;
      const maxY = box.height / 2 - 80;
      setPos({ x: (Math.random() * 2 - 1) * maxX, y: (Math.random() * 2 - 1) * maxY });
      setRot(Math.random() * 90 - 45);
    }
  };

  // Sizing:
  // YES grows with stage; NO shrinks a bit ONLY in mobile (not in popup mode NO stays same size)
  const yesScale = useMemo(() => 1 + Math.min(stage, 18) * 0.14, [stage]);
  const noScale = useMemo(() => {
    if (mode === 'popup') return 1; // stays put and same size
    return Math.max(0.28, 1 - stage * 0.055);
  }, [mode, stage]);
  const noText = useMemo(() => {
    if (mode === 'popup') return 'NO';
    return noTexts[Math.min(stage, noTexts.length - 1)];
  }, [mode, stage, noTexts]);

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

      <div className="relative w-full max-w-3xl h-[340px] md:h-[380px] flex items-center justify-center gap-6">
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
          onClick={onNoClick}
          animate={mode === 'popup' ? { x: 0, y: 0, rotate: 0, scale: 1 } : { x: pos.x, y: pos.y, rotate: rot, scale: noScale }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          className="px-6 py-3 rounded-full bg-white/85 text-rose-800 font-serif-fancy text-lg md:text-xl border border-rose-200 shadow-lg z-20"
          style={{ minWidth: 90 }}
        >
          {noText}
        </motion.button>

        {/* Popup taunts (only in 'popup' behaviour) */}
        <AnimatePresence>
          {mode === 'popup' && popups.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 0.6, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.7, y: -10 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              className="absolute pointer-events-none"
              style={{ left: '50%', top: '50%', transform: `translate(calc(-50% + ${p.x}px), calc(-50% + ${p.y}px))` }}
            >
              <div className="relative px-4 py-2 rounded-2xl bg-white shadow-2xl border border-rose-100 flex items-center gap-2">
                <span className="text-xl">{p.emoji}</span>
                <span className="font-serif-fancy text-rose-950 whitespace-nowrap">{p.msg}</span>
                <span className="absolute -bottom-1.5 left-6 w-3 h-3 bg-white rotate-45 border-r border-b border-rose-100" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <p className="mt-10 text-rose-800/70 text-sm md:text-base italic">
        {mode === 'runaway' && '(good luck catching that one)'}
        {mode === 'popup' && '(press NO if you dare... I have things to say)'}
        {mode === 'mobile' && '(tap NO if you dare)'}
      </p>
    </div>
  );
}
