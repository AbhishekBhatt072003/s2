'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, MapPin, Calendar, X, Maximize2 } from 'lucide-react';

// Map "from-X to-Y" tags → actual CSS gradient (bypasses Tailwind JIT purge for dynamic values)
const COLOR_GRADIENTS = {
  'from-pink-300 to-rose-400':       'linear-gradient(90deg, #f9a8d4, #fb7185)',
  'from-purple-300 to-fuchsia-400':  'linear-gradient(90deg, #d8b4fe, #e879f9)',
  'from-rose-300 to-pink-400':       'linear-gradient(90deg, #fda4af, #f472b6)',
  'from-indigo-300 to-purple-400':   'linear-gradient(90deg, #a5b4fc, #c084fc)',
  'from-amber-300 to-rose-400':      'linear-gradient(90deg, #fcd34d, #fb7185)',
  'from-pink-400 to-purple-400':     'linear-gradient(90deg, #f472b6, #c084fc)',
  'from-fuchsia-400 to-purple-400':  'linear-gradient(90deg, #e879f9, #c084fc)',
  'from-rose-400 to-pink-400':       'linear-gradient(90deg, #fb7185, #f472b6)',
  'from-purple-400 to-pink-400':     'linear-gradient(90deg, #c084fc, #f472b6)',
};
const DEFAULT_GRADIENT = 'linear-gradient(90deg, #f472b6, #c084fc)';

function Carousel({ photos }) {
  const [i, setI] = useState(0);
  const [full, setFull] = useState(false);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto || full) return;
    const t = setInterval(() => setI((v) => (v + 1) % photos.length), 3500);
    return () => clearInterval(t);
  }, [auto, full, photos.length]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') setI((v) => (v - 1 + photos.length) % photos.length);
      if (e.key === 'ArrowRight') setI((v) => (v + 1) % photos.length);
      if (e.key === 'Escape') setFull(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [photos.length]);

  if (!photos?.length) return null;

  return (
    <>
      <div className="relative rounded-2xl overflow-hidden aspect-[4/3] group" onMouseEnter={() => setAuto(false)} onMouseLeave={() => setAuto(true)}>
        <AnimatePresence mode="wait">
          <motion.img
            key={i}
            src={photos[i]}
            alt="memory"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.7 }}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </AnimatePresence>

        {photos.length > 1 && (
          <>
            <button onClick={() => setI((v) => (v - 1 + photos.length) % photos.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 backdrop-blur hover:bg-white shadow">
              <ChevronLeft className="w-5 h-5 text-rose-700" />
            </button>
            <button onClick={() => setI((v) => (v + 1) % photos.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 backdrop-blur hover:bg-white shadow">
              <ChevronRight className="w-5 h-5 text-rose-700" />
            </button>
          </>
        )}

        <button onClick={() => setFull(true)} className="absolute top-2 right-2 p-2 rounded-full bg-white/80 backdrop-blur hover:bg-white shadow">
          <Maximize2 className="w-4 h-4 text-rose-700" />
        </button>

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {photos.map((_, k) => (
            <button key={k} onClick={() => setI(k)}
              className={`h-1.5 rounded-full transition-all ${k === i ? 'w-6 bg-white' : 'w-2.5 bg-white/60'}`} />
          ))}
        </div>

        <div className="absolute top-2 left-2 text-xs font-mono px-2 py-0.5 rounded-full bg-black/40 text-white backdrop-blur">
          {i + 1} / {photos.length}
        </div>
      </div>

      <AnimatePresence>
        {full && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[90] flex items-center justify-center p-4"
            onClick={() => setFull(false)}
          >
            <img src={photos[i]} alt="full" className="max-w-full max-h-full rounded-xl" />
            <button onClick={() => setFull(false)} className="absolute top-4 right-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20">
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function MemoryTimeline({ memories }) {
  return (
    <section className="relative py-24 px-6">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center font-script text-5xl md:text-7xl gradient-text mb-4"
      >
        Our story, so far
      </motion.h2>
      <p className="text-center text-rose-900/70 font-serif-fancy italic mb-14">every card is a chapter</p>

      <div className="relative max-w-6xl mx-auto">
        {/* center line */}
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-pink-300 via-purple-300 to-rose-300 md:-translate-x-1/2" />

        <div className="space-y-16">
          {memories.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, delay: 0.05 }}
              className={`relative flex flex-col md:flex-row items-stretch gap-6 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
            >
              {/* dot */}
              <div className="absolute left-4 md:left-1/2 top-6 md:top-1/2 -translate-y-1/2 md:-translate-x-1/2 w-4 h-4 rounded-full bg-white ring-4 ring-pink-300 shadow-lg" />

              <div className="md:w-1/2 md:px-10 pl-12 md:pl-0">
                <Carousel photos={m.photos} />
              </div>

              <div className="md:w-1/2 md:px-10 pl-12 md:pl-0">
                <div className="glass rounded-3xl p-6 md:p-8">
                  <div className="inline-block px-3 py-1 rounded-full text-white text-xs"
                    style={{ background: COLOR_GRADIENTS[m.color] || DEFAULT_GRADIENT }}>
                    <span className="mr-1">{m.emoji}</span>{m.title}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-rose-900/70 text-sm">
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{m.date}</span>
                    {m.location && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{m.location}</span>}
                  </div>
                  <p className="mt-4 text-rose-950 leading-relaxed font-serif-fancy text-lg">{m.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
