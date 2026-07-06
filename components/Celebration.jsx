'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

function Firework({ x, y, hue }) {
  const shards = 22;
  return (
    <div className="absolute" style={{ left: x, top: y }}>
      {[...Array(shards)].map((_, i) => {
        const a = (i / shards) * Math.PI * 2;
        return (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{ background: `hsl(${hue}, 90%, 65%)`, boxShadow: `0 0 12px hsl(${hue}, 90%, 65%)` }}
            initial={{ x: 0, y: 0, opacity: 1 }}
            animate={{ x: Math.cos(a) * (80 + Math.random() * 80), y: Math.sin(a) * (80 + Math.random() * 80), opacity: 0 }}
            transition={{ duration: 1.4 + Math.random() * 0.6, ease: 'easeOut' }}
          />
        );
      })}
    </div>
  );
}

export default function Celebration({ message, onDone }) {
  const [fireworks, setFireworks] = useState([]);
  const [balloons, setBalloons] = useState([]);
  const [shake, setShake] = useState(true);

  useEffect(() => {
    // spawn fireworks over time
    const spawn = setInterval(() => {
      setFireworks((prev) => [
        ...prev.slice(-14),
        {
          id: Math.random(),
          x: window.innerWidth * (0.1 + Math.random() * 0.8),
          y: window.innerHeight * (0.15 + Math.random() * 0.55),
          hue: 300 + Math.random() * 60,
        },
      ]);
    }, 500);
    // spawn balloons
    setBalloons(
      Array.from({ length: 14 }, () => ({
        id: Math.random(),
        x: Math.random() * 100,
        delay: Math.random() * 2,
        hue: 320 + Math.random() * 60,
      }))
    );
    const t = setTimeout(() => setShake(false), 900);
    return () => { clearInterval(spawn); clearTimeout(t); };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, x: shake ? [0, -8, 8, -6, 6, 0] : 0 }}
      transition={{ duration: 0.9 }}
      className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden py-24"
    >
      {/* Fireworks */}
      {fireworks.map((f) => <Firework key={f.id} x={f.x} y={f.y} hue={f.hue} />)}

      {/* Balloons */}
      {balloons.map((b) => (
        <motion.div
          key={b.id}
          className="absolute bottom-0"
          style={{ left: `${b.x}%` }}
          initial={{ y: 200, opacity: 0 }}
          animate={{ y: -1200, opacity: [0, 1, 1, 0] }}
          transition={{ duration: 9 + Math.random() * 4, delay: b.delay, ease: 'easeOut', repeat: Infinity }}
        >
          <div
            className="w-14 h-16 rounded-full"
            style={{
              background: `radial-gradient(circle at 30% 30%, white, hsl(${b.hue}, 90%, 70%))`,
              boxShadow: '0 6px 30px rgba(255, 105, 180, 0.4)',
            }}
          />
          <div className="w-px h-14 mx-auto bg-white/60" />
        </motion.div>
      ))}

      {/* Confetti-ish falling dots */}
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-3 rounded-sm"
          style={{
            left: `${Math.random() * 100}%`,
            top: -20,
            background: `hsl(${300 + Math.random() * 60}, 85%, 65%)`,
          }}
          initial={{ y: -20, rotate: 0, opacity: 0 }}
          animate={{ y: window.innerHeight + 40, rotate: 720, opacity: [0, 1, 1, 0] }}
          transition={{ duration: 4 + Math.random() * 3, delay: Math.random() * 3, repeat: Infinity }}
        />
      ))}

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 16 }}
        className="relative z-10 text-center px-6"
      >
        <div className="text-7xl md:text-9xl mb-6 drop-shadow-lg">💖</div>
        <h1 className="font-script text-5xl md:text-7xl gradient-text mb-6">{message}</h1>
        <p className="font-serif-fancy italic text-xl md:text-2xl text-rose-900/80">
          Now scroll down — there's more of us to remember.
        </p>
      </motion.div>
    </motion.div>
  );
}
