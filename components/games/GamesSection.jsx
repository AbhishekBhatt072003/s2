'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, HeartCrack, X, Gift, Puzzle, Brain, Sparkles } from 'lucide-react';

// ------------------- 1) CATCH HEARTS -------------------
function CatchHearts({ onWin, onClose }) {
  const [items, setItems] = useState([]);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(30);
  const [ended, setEnded] = useState(false);
  const [won, setWon] = useState(false);
  const boardRef = useRef(null);
  const target = 15;

  useEffect(() => {
    if (ended) return;
    const spawn = setInterval(() => {
      const bad = Math.random() < 0.28;
      setItems((prev) => [
        ...prev,
        {
          id: Math.random(),
          x: Math.random() * 90 + 5,
          y: -6,
          v: 0.5 + Math.random() * 0.9,
          bad,
        },
      ]);
    }, 550);
    return () => clearInterval(spawn);
  }, [ended]);

  useEffect(() => {
    if (ended) return;
    const tick = setInterval(() => {
      setItems((prev) => prev.map((it) => ({ ...it, y: it.y + it.v })).filter((it) => it.y < 108));
    }, 40);
    return () => clearInterval(tick);
  }, [ended]);

  useEffect(() => {
    if (ended) return;
    const t = setInterval(() => {
      setTime((v) => {
        if (v <= 1) {
          setEnded(true);
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [ended]);

  useEffect(() => {
    if (score >= target && !ended) {
      setEnded(true);
      setWon(true);
      setTimeout(() => onWin(), 900);
    }
  }, [score, ended, onWin]);

  const pop = (id, bad) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setScore((s) => Math.max(0, s + (bad ? -2 : 1)));
  };

  return (
    <GameModal title="Catch Hearts" onClose={onClose}>
      <div className="flex justify-between items-center mb-2 text-rose-950 font-serif-fancy">
        <div>Score: <b>{score}</b> / {target}</div>
        <div>Time: <b>{time}s</b></div>
      </div>
      <div ref={boardRef} className="relative w-full h-[440px] rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(180deg, #ffe4ec, #f3e8ff)' }}>
        {items.map((it) => (
          <button key={it.id} onClick={() => pop(it.id, it.bad)}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${it.x}%`, top: `${it.y}%` }}>
            {it.bad ? <HeartCrack className="w-8 h-8 text-slate-500 drop-shadow" /> : <Heart className="w-8 h-8 fill-rose-500 text-rose-500 drop-shadow" />}
          </button>
        ))}
        {ended && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur">
            <div className="text-center">
              <div className="text-5xl mb-2">{won ? '💖' : '🥺'}</div>
              <div className="font-script text-3xl gradient-text">{won ? 'You unlocked a memory!' : 'Try again, my love'}</div>
            </div>
          </div>
        )}
      </div>
      <p className="text-xs mt-3 text-rose-800/70 italic">Tap the pink hearts. Avoid the broken ones. Reach {target} to unlock a secret memory.</p>
    </GameModal>
  );
}

// ------------------- 2) PHOTO PUZZLE -------------------
function PhotoPuzzle({ onClose }) {
  const [difficulty, setDifficulty] = useState(3);
  const [image, setImage] = useState('');
  const [tiles, setTiles] = useState([]);
  const [solved, setSolved] = useState(false);

  const upload = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setImage(url);
    startPuzzle(difficulty);
  };

  const startPuzzle = (d) => {
    const n = d * d;
    const arr = Array.from({ length: n }, (_, i) => i);
    // shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setTiles(arr);
    setSolved(false);
  };

  useEffect(() => { if (image) startPuzzle(difficulty); }, [difficulty]); // eslint-disable-line

  const [sel, setSel] = useState(null);
  const clickTile = (idx) => {
    if (sel === null) return setSel(idx);
    const nt = [...tiles];
    [nt[sel], nt[idx]] = [nt[idx], nt[sel]];
    setTiles(nt);
    setSel(null);
    if (nt.every((v, i) => v === i)) setSolved(true);
  };

  return (
    <GameModal title="Photo Puzzle" onClose={onClose}>
      <div className="flex flex-wrap gap-2 items-center mb-3">
        <label className="px-3 py-2 rounded-full bg-pink-500 text-white text-sm cursor-pointer">
          Upload photo
          <input type="file" accept="image/*" className="hidden" onChange={upload} />
        </label>
        {[{ l: 'Easy', d: 3 }, { l: 'Medium', d: 4 }, { l: 'Hard', d: 5 }].map((o) => (
          <button key={o.d} onClick={() => setDifficulty(o.d)}
            className={`px-3 py-2 rounded-full text-sm ${difficulty === o.d ? 'bg-rose-900 text-white' : 'bg-white/80'}`}>{o.l}</button>
        ))}
        {image && <button onClick={() => startPuzzle(difficulty)} className="px-3 py-2 rounded-full text-sm bg-white/80">Shuffle</button>}
      </div>
      {!image ? (
        <div className="h-72 rounded-2xl border-2 border-dashed border-rose-300 flex items-center justify-center text-rose-800/70 font-serif-fancy">
          Upload any photo to turn it into a puzzle 🧩
        </div>
      ) : (
        <>
          <div className="grid gap-1 rounded-2xl overflow-hidden" style={{ gridTemplateColumns: `repeat(${difficulty}, 1fr)`, aspectRatio: '1 / 1' }}>
            {tiles.map((t, i) => {
              const row = Math.floor(t / difficulty);
              const col = t % difficulty;
              return (
                <button key={i} onClick={() => clickTile(i)}
                  className={`relative overflow-hidden ${sel === i ? 'ring-4 ring-pink-500' : ''}`}
                  style={{
                    backgroundImage: `url(${image})`,
                    backgroundSize: `${difficulty * 100}% ${difficulty * 100}%`,
                    backgroundPosition: `${(col / (difficulty - 1)) * 100}% ${(row / (difficulty - 1)) * 100}%`,
                  }}
                />
              );
            })}
          </div>
          {solved && (
            <div className="mt-3 p-3 rounded-2xl bg-gradient-to-r from-pink-100 to-purple-100 text-center font-script text-2xl gradient-text">💖 You did it!</div>
          )}
        </>
      )}
    </GameModal>
  );
}

// ------------------- 3) MEMORY QUIZ -------------------
function MemoryQuiz({ questions, onClose }) {
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(null);
  const q = questions[i];

  if (!questions.length) {
    return <GameModal title="Memory Quiz" onClose={onClose}><div className="p-6 text-center text-rose-800">No questions yet. Add some in Admin.</div></GameModal>;
  }

  const pick = (idx) => {
    if (picked !== null) return;
    setPicked(idx);
    if (idx === q.answer) setScore((s) => s + 1);
    setTimeout(() => {
      if (i + 1 < questions.length) {
        setI(i + 1); setPicked(null);
      } else {
        setI(i + 1); // triggers end
      }
    }, 900);
  };

  const done = i >= questions.length;

  return (
    <GameModal title="Memory Quiz" onClose={onClose}>
      {done ? (
        <div className="text-center py-6">
          <div className="text-6xl mb-2">{score === questions.length ? '🏆' : score >= questions.length / 2 ? '💖' : '🤍'}</div>
          <div className="font-script text-4xl gradient-text">{score} / {questions.length}</div>
          <p className="mt-3 font-serif-fancy italic text-rose-800">{score === questions.length ? 'You know me by heart.' : 'Not bad. Study more, my love.'}</p>
        </div>
      ) : (
        <>
          <div className="flex justify-between text-sm text-rose-800/80 mb-2">
            <span>Question {i + 1} / {questions.length}</span>
            <span>Score: {score}</span>
          </div>
          {q.image && <img src={q.image} alt="" className="w-full max-h-56 object-cover rounded-2xl mb-3" />}
          <div className="font-serif-fancy text-xl md:text-2xl text-rose-950 mb-4">{q.q}</div>
          <div className="grid grid-cols-1 gap-2">
            {q.options.map((opt, k) => {
              const isRight = picked !== null && k === q.answer;
              const isWrong = picked === k && k !== q.answer;
              return (
                <button key={k} onClick={() => pick(k)}
                  className={`text-left px-4 py-3 rounded-xl border transition
                    ${isRight ? 'bg-green-100 border-green-400' : isWrong ? 'bg-red-100 border-red-400' : 'bg-white/70 border-rose-200 hover:bg-white'}`}>
                  {opt}
                </button>
              );
            })}
          </div>
        </>
      )}
    </GameModal>
  );
}

// ------------------- 4) SCRATCH CARD -------------------
function ScratchCard({ cards, onClose }) {
  const [i, setI] = useState(0);
  const canvasRef = useRef(null);
  const [pct, setPct] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const card = cards[i];

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    setPct(0); setRevealed(false);
    const ctx = c.getContext('2d');
    const w = c.width = c.offsetWidth * 2;
    const h = c.height = c.offsetHeight * 2;
    // scratch layer
    const grd = ctx.createLinearGradient(0, 0, w, h);
    grd.addColorStop(0, '#c084fc');
    grd.addColorStop(1, '#f472b6');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 40px serif';
    ctx.textAlign = 'center';
    ctx.fillText('SCRATCH ME', w / 2, h / 2 + 12);

    let drawing = false;
    const scratch = (x, y) => {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 40, 0, Math.PI * 2);
      ctx.fill();
    };
    const point = (e) => {
      const r = c.getBoundingClientRect();
      const t = e.touches?.[0] ?? e;
      return { x: (t.clientX - r.left) * 2, y: (t.clientY - r.top) * 2 };
    };
    const down = (e) => { drawing = true; const p = point(e); scratch(p.x, p.y); };
    const move = (e) => { if (!drawing) return; const p = point(e); scratch(p.x, p.y); computePct(); };
    const up = () => { drawing = false; computePct(); };
    const computePct = () => {
      const img = ctx.getImageData(0, 0, w, h).data;
      let cleared = 0;
      for (let k = 3; k < img.length; k += 4 * 40) if (img[k] === 0) cleared++;
      const total = img.length / (4 * 40);
      const p = Math.round((cleared / total) * 100);
      setPct(p);
      if (p > 55 && !revealed) setRevealed(true);
    };
    c.addEventListener('mousedown', down); c.addEventListener('mousemove', move); window.addEventListener('mouseup', up);
    c.addEventListener('touchstart', down); c.addEventListener('touchmove', move); window.addEventListener('touchend', up);
    return () => {
      c.removeEventListener('mousedown', down); c.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up);
      c.removeEventListener('touchstart', down); c.removeEventListener('touchmove', move); window.removeEventListener('touchend', up);
    };
  }, [i, revealed]);

  if (!cards.length) return <GameModal title="Scratch Card" onClose={onClose}><div className="p-6 text-center text-rose-800">No cards yet. Add some in Admin.</div></GameModal>;

  return (
    <GameModal title="Scratch Card" onClose={onClose}>
      <div className="flex gap-2 mb-3 flex-wrap">
        {cards.map((_, k) => (
          <button key={k} onClick={() => setI(k)} className={`px-3 py-1 rounded-full text-sm ${i === k ? 'bg-rose-900 text-white' : 'bg-white/70'}`}>#{k + 1}</button>
        ))}
      </div>
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-pink-100 to-purple-100">
        <div className="absolute inset-0 flex items-center justify-center text-center p-6">
          {card.image && <img src={card.image} alt="" className="absolute inset-0 w-full h-full object-cover" />}
          <div className="relative z-10 font-serif-fancy text-2xl md:text-3xl text-rose-950 drop-shadow">{card.reveal}</div>
        </div>
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full cursor-crosshair touch-none" style={{ opacity: revealed ? 0 : 1, transition: 'opacity 0.6s' }} />
      </div>
      <p className="text-xs mt-2 text-rose-800/70">{card.title} — scratched {pct}%</p>
    </GameModal>
  );
}

// ------------------- MODAL SHELL -------------------
function GameModal({ title, onClose, children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[95] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        className="glass w-full max-w-2xl rounded-3xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-full hover:bg-white/60"><X className="w-5 h-5 text-rose-800" /></button>
        <div className="font-script text-3xl gradient-text mb-3">{title}</div>
        {children}
      </motion.div>
    </motion.div>
  );
}

// ------------------- SECTION -------------------
export default function GamesSection({ config, onUnlockMemory }) {
  const [open, setOpen] = useState(null);
  const games = [
    { id: 'catch', title: 'Catch Hearts', desc: 'Collect the pink hearts. Avoid the broken ones.', color: 'from-pink-400 to-rose-400', Icon: Heart },
    { id: 'puzzle', title: 'Photo Puzzle', desc: 'Upload any photo. I\'ll shatter it into a puzzle.', color: 'from-fuchsia-400 to-purple-400', Icon: Puzzle },
    { id: 'quiz', title: 'Memory Quiz', desc: 'How well do you know us? Prove it.', color: 'from-rose-400 to-pink-400', Icon: Brain },
    { id: 'scratch', title: 'Scratch Card', desc: 'A little something hidden under the shimmer.', color: 'from-purple-400 to-pink-400', Icon: Gift },
  ];

  return (
    <section className="relative py-24 px-6">
      <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="text-center font-script text-5xl md:text-7xl gradient-text mb-4">
        Little games
      </motion.h2>
      <p className="text-center text-rose-900/70 font-serif-fancy italic mb-14">win one, unlock a secret memory <Sparkles className="inline w-4 h-4" /></p>

      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-5">
        {games.map((g, i) => (
          <motion.button key={g.id}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }}
            transition={{ delay: i * 0.05 }} whileHover={{ y: -6, scale: 1.02 }}
            onClick={() => setOpen(g.id)}
            className="glass rounded-3xl p-6 text-left"
          >
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${g.color} text-white flex items-center justify-center mb-3 shadow-lg`}>
              <g.Icon className="w-6 h-6" />
            </div>
            <div className="font-serif-fancy text-2xl text-rose-950">{g.title}</div>
            <div className="text-rose-800/70 mt-1">{g.desc}</div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {open === 'catch' && <CatchHearts onClose={() => setOpen(null)} onWin={() => { setOpen(null); onUnlockMemory?.(); }} />}
        {open === 'puzzle' && <PhotoPuzzle onClose={() => setOpen(null)} />}
        {open === 'quiz' && <MemoryQuiz questions={config.quiz || []} onClose={() => setOpen(null)} />}
        {open === 'scratch' && <ScratchCard cards={config.scratchCards || []} onClose={() => setOpen(null)} />}
      </AnimatePresence>
    </section>
  );
}
