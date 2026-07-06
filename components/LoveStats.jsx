'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Calendar, Clock, MessageCircle, Camera, Phone, Map, Smile, Heart } from 'lucide-react';

const iconMap = {
  calendar: Calendar, clock: Clock, message: MessageCircle,
  camera: Camera, phone: Phone, map: Map, smile: Smile, heart: Heart,
};

function Counter({ target }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target]);
  return <span ref={ref}>{value.toLocaleString()}</span>;
}

export default function LoveStats({ stats }) {
  return (
    <section className="relative py-24 px-6">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center font-script text-5xl md:text-7xl gradient-text mb-14"
      >
        Us, in numbers
      </motion.h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 max-w-6xl mx-auto">
        {stats.map((s, i) => {
          const Icon = iconMap[s.icon] || Heart;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 24, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: i * 0.06 }}
              className="glass rounded-3xl p-6 text-center"
            >
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                     style={{ background: 'linear-gradient(135deg, #ff8fb1, #b46aff)' }}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="font-serif-fancy text-3xl md:text-4xl text-rose-900 tracking-tight">
                <Counter target={s.value} />
              </div>
              <div className="mt-1 text-rose-800/70 text-sm md:text-base">{s.label}</div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
