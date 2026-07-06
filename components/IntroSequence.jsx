'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Heart, Lock } from 'lucide-react';

export default function IntroSequence({ lines, onBegin }) {
  const [phase, setPhase] = useState(0); // 0 black, 1 heart draw, 2 heart glow, 3 lines, 4 password
  const [visibleLines, setVisibleLines] = useState(0);
  const [password, setPassword] = useState('');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1500);
    const t2 = setTimeout(() => setPhase(2), 4200);
    const t3 = setTimeout(() => setPhase(3), 5400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  useEffect(() => {
    if (phase < 3) return;
    if (visibleLines >= lines.length) {
      // Give a good long pause so the last line ("I hope this makes you smile") sinks in
      const t = setTimeout(() => setPhase(4), 3200);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setVisibleLines((v) => v + 1), 1500);
    return () => clearTimeout(t);
  }, [phase, visibleLines, lines.length]);

  const submit = async (e) => {
    e.preventDefault();
    setChecking(true);
    setError('');
    try {
      const r = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await r.json();
      if (data.ok) onBegin();
      else setError('Not quite. Try again 💞');
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence>
          {phase >= 1 && (
            <motion.svg
              key="heart" width="220" height="200" viewBox="0 0 200 180"
              className={phase >= 2 ? 'heart-glow' : ''}
              initial={{ opacity: 1, scale: 1 }}
              animate={{ opacity: phase >= 3 ? 0 : 1, scale: phase >= 2 ? 1.06 : 1 }}
              transition={{ duration: 0.9 }}
            >
              <defs>
                <linearGradient id="neonGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ff5f8f" /><stop offset="100%" stopColor="#b46aff" />
                </linearGradient>
              </defs>
              <motion.path
                d="M100 160 C 20 100, 20 30, 70 30 C 90 30, 100 50, 100 70 C 100 50, 110 30, 130 30 C 180 30, 180 100, 100 160 Z"
                fill={phase >= 2 ? 'url(#neonGrad)' : 'transparent'} stroke="url(#neonGrad)" strokeWidth="3" strokeLinecap="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 2.6, ease: 'easeInOut' }}
                style={{ fillOpacity: phase >= 2 ? 0.95 : 0 }}
              />
            </motion.svg>
          )}
        </AnimatePresence>

        {phase >= 2 && phase < 3 && (
          <div className="absolute">
            {[...Array(28)].map((_, i) => {
              const a = (i / 28) * Math.PI * 2;
              return (
                <motion.div key={i} className="absolute w-1.5 h-1.5 rounded-full"
                  style={{ background: 'radial-gradient(circle, #ffd1dc, transparent)' }}
                  initial={{ x: 0, y: 0, opacity: 1 }}
                  animate={{ x: Math.cos(a) * 220, y: Math.sin(a) * 220, opacity: 0 }}
                  transition={{ duration: 1.4, ease: 'easeOut' }}
                />
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {phase >= 3 && phase < 4 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-6">
            {lines.slice(0, visibleLines).map((line, i) => (
              <motion.p key={i}
                initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                className={`text-white text-center font-serif-fancy ${i === lines.length - 1 ? 'text-3xl md:text-5xl italic' : 'text-2xl md:text-4xl'}`}
                style={{ textShadow: '0 0 24px rgba(255,105,180,0.35)' }}
              >{line}</motion.p>
            ))}
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase >= 4 && (
          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-3 text-pink-200"
            >
              <Heart className="w-6 h-6 fill-pink-400 text-pink-400" />
              <span className="font-serif-fancy text-xl md:text-2xl italic">but first — whisper the password</span>
              <Heart className="w-6 h-6 fill-pink-400 text-pink-400" />
            </motion.div>

            <div className="relative w-full max-w-sm">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="our little secret"
                autoFocus
                className="w-full pl-11 pr-4 py-4 rounded-full bg-white/10 border border-white/25 backdrop-blur text-white placeholder-white/40 outline-none focus:border-pink-300 text-center font-serif-fancy tracking-wider"
              />
            </div>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-rose-300 text-sm italic">{error}</motion.div>
            )}

            <button
              type="submit"
              disabled={checking || !password}
              className="group relative flex items-center gap-3 px-10 py-4 rounded-full text-white font-serif-fancy text-xl md:text-2xl disabled:opacity-60"
              style={{
                background: 'linear-gradient(120deg, #ff5f8f, #b46aff)',
                boxShadow: '0 0 40px rgba(255, 95, 143, 0.7), 0 0 80px rgba(180, 106, 255, 0.35)',
              }}
            >
              <Heart className="w-6 h-6 fill-white" />
              <span>{checking ? 'Opening...' : 'Begin'}</span>
              <span className="absolute inset-0 rounded-full ring-2 ring-white/40 animate-ping pointer-events-none" />
            </button>

            <p className="text-white/40 text-xs italic">hint: it starts with &quot;my&quot; and ends with a beat</p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
