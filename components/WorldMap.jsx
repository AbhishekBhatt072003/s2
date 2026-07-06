'use client';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

const WorldMapInner = dynamic(() => import('./WorldMapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full flex items-center justify-center text-rose-800/70 font-serif-fancy italic" style={{ height: 'min(70vh, 560px)' }}>
      Loading our little map...
    </div>
  ),
});

export default function WorldMap({ memories }) {
  return (
    <section className="relative py-24 px-4 md:px-6">
      <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="text-center font-script text-5xl md:text-7xl gradient-text mb-3">
        Our little map
      </motion.h2>
      <p className="text-center text-rose-900/70 font-serif-fancy italic mb-8">every pin is a place we made ours</p>

      <div className="max-w-5xl mx-auto glass rounded-3xl overflow-hidden shadow-2xl border border-white/70">
        <WorldMapInner memories={memories} />
      </div>
    </section>
  );
}
