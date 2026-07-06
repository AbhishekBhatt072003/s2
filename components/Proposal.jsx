'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const POPUP_MESSAGES = [
  { msg: 'Are you sure?', emoji: '🥺' },
  { msg: 'Think again...', emoji: '😢' },
  { msg: 'Really?', emoji: '😟' },
  { msg: 'Last chance...', emoji: '😔' },
  { msg: 'Please?', emoji: '🥹' },
  { msg: "Don't break my heart", emoji: '💔' },
  { msg: 'That hurts...', emoji: '😭' },
  { msg: "I don't believe you", emoji: '😶' },
  { msg: 'Read the question again', emoji: '😅' },
  { msg: 'Wrong button', emoji: '😏' },
  { msg: 'Surely not?', emoji: '🥺' },
  { msg: "No doesn't suit you", emoji: '😌' },
  { msg: 'Try again', emoji: '❤️' },
  { msg: 'Seriously?', emoji: '😑' },
  { msg: 'Fine...', emoji: '😤' },
  { msg: "You're making me sad", emoji: '😞' },
  { msg: 'My heart just skipped a beat', emoji: '💔' },
  { msg: 'I spent so long making this', emoji: '🥹' },
  { msg: 'Give it one more thought', emoji: '😊' },
  { msg: 'I know you want to click YES', emoji: '😏' },
  { msg: "Don't be so mean", emoji: '😭' },
  { msg: 'Is that your final answer?', emoji: '🤨' },
  { msg: "I'll ask again...", emoji: '🥺' },
  { msg: "You're impossible", emoji: '😂' },
  { msg: 'Pretty please?', emoji: '🥹' },
];

const MAX_NO_CLICKS = 25;

// Rough popup card size (used for overlap avoidance)
const POPUP_W = 260;
const POPUP_H = 60;

function rectsOverlap(a, b, pad = 20) {
  return !(a.right + pad < b.left || a.left - pad > b.right || a.bottom + pad < b.top || a.top - pad > b.bottom);
}

export default function Proposal({ question, yesButton, onYes }) {
  const containerRef = useRef(null);
  const noRef = useRef(null);
  const yesRef = useRef(null);
  const lastMsgIdxRef = useRef(-1);
  const recentPositionsRef = useRef([]);

  const [mode, setMode] = useState(null); // 'runaway' | 'popup'
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [rot, setRot] = useState(0);
  const [popups, setPopups] = useState([]);
  const [noClicks, setNoClicks] = useState(0);
  const [showFinal, setShowFinal] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const touch = matchMedia('(hover: none)').matches;
    if (touch) setMode('popup');
    else setMode(Math.random() < 0.5 ? 'runaway' : 'popup');
  }, []);

  // Behavior 1 — runaway cursor chase (unchanged)
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
      if (dist < 150) {
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

  // Pick a random message avoiding immediate repeat (ref keeps this consistent across rapid clicks)
  const pickMessage = () => {
    let idx = Math.floor(Math.random() * POPUP_MESSAGES.length);
    if (idx === lastMsgIdxRef.current) idx = (idx + 1) % POPUP_MESSAGES.length;
    lastMsgIdxRef.current = idx;
    return POPUP_MESSAGES[idx];
  };

  // Pick a viewport position that:
  //   - is inside the visible viewport (with margin)
  //   - does NOT overlap the YES or NO button rects
  //   - is far from recent popup positions (uses ref, not state, to avoid batching issues)
  const pickViewportPosition = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // Try to place popup around the section — but if user is on desktop the section is tall,
    // we want popups scattered across the visible viewport (fixed positioning)
    const margin = 24;
    const minX = margin;
    const maxX = vw - POPUP_W - margin;
    const minY = margin + 80;         // avoid top nav / edge
    const maxY = vh - POPUP_H - margin;

    const yesRect = yesRef.current?.getBoundingClientRect();
    const noRect = noRef.current?.getBoundingClientRect();

    let best = null;
    let bestScore = -Infinity;
    const candidates = 30;

    for (let i = 0; i < candidates; i++) {
      const x = minX + Math.random() * Math.max(1, maxX - minX);
      const y = minY + Math.random() * Math.max(1, maxY - minY);
      const rect = { left: x, top: y, right: x + POPUP_W, bottom: y + POPUP_H };

      // Reject overlapping YES/NO buttons
      if (yesRect && rectsOverlap(rect, yesRect, 24)) continue;
      if (noRect && rectsOverlap(rect, noRect, 24)) continue;

      // Score by distance from recent popup positions
      const recent = recentPositionsRef.current;
      let minDist = Infinity;
      for (const p of recent) {
        const d = Math.hypot(p.x - x, p.y - y);
        if (d < minDist) minDist = d;
      }
      const score = minDist;
      if (score > bestScore) { bestScore = score; best = { x, y }; }
    }

    // Fallback: if every candidate overlapped, use a safe location above the buttons
    if (!best) {
      best = {
        x: Math.max(minX, Math.min(maxX, vw / 2 - POPUP_W / 2 + (Math.random() - 0.5) * 200)),
        y: Math.max(minY, (yesRect?.top ?? vh / 2) - POPUP_H - 40),
      };
    }
    return best;
  };

  const spawnPopup = () => {
    const { x, y } = pickViewportPosition();
    const { msg, emoji } = pickMessage();
    const id = Math.random().toString(36).slice(2);

    setPopups((prev) => [...prev.slice(-8), { id, x, y, msg, emoji }]);

    // Track in ref (never stale)
    recentPositionsRef.current = [...recentPositionsRef.current.slice(-5), { x, y }];

    setTimeout(() => {
      setPopups((prev) => prev.filter((p) => p.id !== id));
      recentPositionsRef.current = recentPositionsRef.current.filter((p) => !(p.x === x && p.y === y));
    }, 2500);
  };

  const onNoClick = () => {
    if (mode === 'runaway') {
      const box = containerRef.current?.getBoundingClientRect();
      if (!box) return;
      const maxX = box.width / 2 - 100;
      const maxY = box.height / 2 - 80;
      setPos({ x: (Math.random() * 2 - 1) * maxX, y: (Math.random() * 2 - 1) * maxY });
      setRot((Math.random() - 0.5) * 30);
      return;
    }
    // popup mode
    const next = noClicks + 1;
    setNoClicks(next);
    if (next >= MAX_NO_CLICKS) {
      setPopups([]);
      setShowFinal(true);
    } else {
      spawnPopup();
    }
  };

  const noHidden = mode === 'popup' && (noClicks >= MAX_NO_CLICKS || showFinal);

  return (
    <div ref={containerRef} className="relative w-full min-h-[70vh] flex flex-col items-center justify-center px-6 overflow-visible">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-4xl md:text-6xl text-center font-serif-fancy italic gradient-text mb-8"
      >
        {question}
      </motion.h2>

      {/* Final centered message after 25 clicks — sits ABOVE the buttons so YES stays fully visible */}
      <AnimatePresence>
        {mode === 'popup' && showFinal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
            className="mb-6 flex items-center justify-center px-4"
          >
            <div className="px-6 py-4 rounded-3xl bg-white/95 backdrop-blur border border-rose-100 shadow-2xl flex items-center gap-3 max-w-[92%]">
              <span className="text-3xl">😏</span>
              <span className="font-serif-fancy text-rose-950 text-lg md:text-xl">
                Ok fine... then I&apos;m forcing you to stay hehe <span className="text-rose-500">❤️</span>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative w-full max-w-3xl h-[340px] md:h-[380px] flex items-center justify-center gap-6">
        <button
          ref={yesRef}
          onClick={onYes}
          className="relative px-10 py-5 rounded-full text-white font-serif-fancy text-2xl md:text-3xl shadow-2xl z-10"
          style={{
            background: 'linear-gradient(120deg, #ff5f8f 0%, #b46aff 100%)',
            boxShadow: '0 0 40px rgba(255, 95, 143, 0.55), 0 20px 40px rgba(180, 106, 255, 0.25)',
          }}
        >
          <span className="relative z-10">{yesButton}</span>
          <span className="absolute inset-0 rounded-full ring-2 ring-white/40 animate-pulse pointer-events-none" />
        </button>

        {!noHidden && (
          <motion.button
            ref={noRef}
            onClick={onNoClick}
            animate={mode === 'runaway' ? { x: pos.x, y: pos.y, rotate: rot } : { x: 0, y: 0, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="px-6 py-3 rounded-full bg-white/85 text-rose-800 font-serif-fancy text-lg md:text-xl border border-rose-200 shadow-lg z-20"
            style={{ minWidth: 90 }}
          >
            NO
          </motion.button>
        )}
      </div>

      {/* Popups positioned in the viewport (fixed) so they can scatter across the whole screen */}
      <AnimatePresence>
        {mode === 'popup' && popups.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, scale: 0.6, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: -8 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="fixed pointer-events-none z-[80]"
            style={{ left: p.x, top: p.y }}
          >
            <div className="relative px-4 py-2 rounded-2xl bg-white shadow-2xl border border-rose-100 flex items-center gap-2">
              <span className="text-xl">{p.emoji}</span>
              <span className="font-serif-fancy text-rose-950 whitespace-nowrap">{p.msg}</span>
              <span className="absolute -bottom-1.5 left-6 w-3 h-3 bg-white rotate-45 border-r border-b border-rose-100" />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <p className="mt-10 text-rose-800/70 text-sm md:text-base italic">
        {mode === 'runaway' && '(good luck catching that one)'}
        {mode === 'popup' && !showFinal && '(press NO if you dare... I have things to say)'}
      </p>
    </div>
  );
}
