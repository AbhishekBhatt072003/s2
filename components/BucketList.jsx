'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

export default function BucketList({ items }) {
  const [list, setList] = useState(items);

  const toggle = (i) => {
    setList((prev) => prev.map((it, k) => (k === i ? { ...it, done: !it.done } : it)));
  };

  const done = list.filter((i) => i.done).length;
  const pct = Math.round((done / list.length) * 100);

  return (
    <section className="relative py-24 px-6">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center font-script text-5xl md:text-6xl gradient-text mb-4"
      >
        Our bucket list
      </motion.h2>
      <p className="text-center text-rose-900/70 font-serif-fancy italic mb-8">{done} / {list.length} done — {pct}% of forever</p>

      <div className="max-w-2xl mx-auto glass rounded-3xl p-6 md:p-8">
        <div className="h-2 rounded-full bg-white/60 overflow-hidden mb-6">
          <motion.div
            className="h-full bg-gradient-to-r from-pink-400 to-purple-400"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1 }}
          />
        </div>

        <ul className="space-y-3">
          <AnimatePresence>
            {list.map((it, i) => (
              <motion.li
                key={it.text}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                <button
                  onClick={() => toggle(i)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-colors ${
                    it.done
                      ? 'bg-gradient-to-br from-pink-400 to-purple-400 border-transparent text-white'
                      : 'border-rose-300 bg-white/70'
                  }`}
                >
                  {it.done && <Check className="w-4 h-4" />}
                </button>
                <span className={`font-serif-fancy text-lg md:text-xl ${it.done ? 'line-through text-rose-800/50' : 'text-rose-950'}`}>
                  {it.text}
                </span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </section>
  );
}
