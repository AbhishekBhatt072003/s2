'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function OpenWhen({ envelopes }) {
  const [open, setOpen] = useState(null);

  return (
    <section className="relative py-24 px-6">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center font-script text-5xl md:text-6xl gradient-text mb-4"
      >
        Open when...
      </motion.h2>
      <p className="text-center text-rose-900/70 font-serif-fancy italic mb-12">tap a letter when you need it</p>

      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-5">
        {envelopes.map((e, i) => (
          <motion.button
            key={e.id}
            initial={{ opacity: 0, y: 20, rotate: -3 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -8, rotate: [-2, 2, 0][i % 3] }}
            onClick={() => setOpen(e)}
            className="relative aspect-[4/3] rounded-2xl p-4 text-left shadow-xl overflow-hidden"
            style={{
              background:
                'linear-gradient(160deg, #fff0f5 0%, #ffe4ec 50%, #f3e8ff 100%)',
              border: '1px solid rgba(255, 182, 193, 0.6)',
            }}
          >
            <div className="absolute inset-x-0 top-0 h-1/2"
              style={{ background: 'linear-gradient(180deg, rgba(255,182,193,0.5), transparent)', clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
            <div className="absolute top-2 right-3 text-2xl">{e.emoji}</div>
            <div className="absolute bottom-3 left-4 right-4 font-serif-fancy text-rose-950 text-lg md:text-xl italic">
              Open when you're<br />
              <span className="font-semibold not-italic">{e.title.replace(/^You'?re? /i, '').replace(/^You /i, '')}</span>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[85] bg-black/60 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setOpen(null)}
          >
            <motion.div
              initial={{ scale: 0.85, rotate: -4, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 22 }}
              className="glass max-w-lg w-full rounded-3xl p-8 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setOpen(null)} className="absolute top-3 right-3 p-2 rounded-full hover:bg-white/60">
                <X className="w-5 h-5 text-rose-800" />
              </button>
              <div className="text-5xl mb-3">{open.emoji}</div>
              <div className="font-script text-3xl gradient-text mb-4">{open.title}</div>
              <p className="font-serif-fancy text-lg text-rose-950 leading-relaxed">{open.message}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
