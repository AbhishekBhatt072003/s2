'use client';
import { useMemo } from 'react';
import { motion } from 'framer-motion';

function Tape({ className = '', color = 'rgba(255, 223, 100, 0.75)' }) {
  return (
    <span className={`absolute ${className}`} style={{
      width: 70, height: 18,
      background: `repeating-linear-gradient(45deg, ${color} 0 6px, rgba(255,255,255,0.35) 6px 10px)`,
      boxShadow: '0 4px 8px rgba(0,0,0,0.08)', borderRadius: 2,
    }} />
  );
}

function CoffeeStain({ style }) {
  return (
    <div className="absolute rounded-full pointer-events-none" style={{
      width: 120, height: 120,
      background: 'radial-gradient(circle at 40% 40%, rgba(120, 72, 40, 0.28), rgba(120, 72, 40, 0.14) 55%, rgba(120,72,40,0.04) 70%, transparent 78%)',
      filter: 'blur(0.5px)', ...style,
    }} />
  );
}

function Doodle({ style, path, color = '#ff5f8f' }) {
  return (
    <svg className="absolute pointer-events-none" viewBox="0 0 100 100" style={{ width: 90, height: 90, ...style }}>
      <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="200" strokeDashoffset="0" style={{ animation: 'doodleDraw 4s ease-in-out infinite alternate' }} />
    </svg>
  );
}

function Polaroid({ src, caption, location, rotate = -3, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: 0 }}
      whileInView={{ opacity: 1, y: 0, rotate }}
      whileHover={{ rotate: 0, y: -6, scale: 1.03 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.7, delay }}
      className="relative bg-white p-3 pb-10 shadow-2xl"
      style={{ width: 220 }}
    >
      <Tape className="-top-3 left-1/2 -translate-x-1/2 rotate-2" />
      <div className="w-full aspect-square overflow-hidden bg-neutral-100">
        <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
      </div>
      <div className="absolute bottom-1 left-0 right-0 text-center">
        <div className="font-script text-lg text-rose-950 leading-tight">{caption}</div>
        {location && <div className="text-[10px] text-rose-800/70 tracking-wide">• {location}</div>}
      </div>
    </motion.div>
  );
}

function StickyNote({ text, color = '#ffe4a1', rotate = 3, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotate: 0 }}
      whileInView={{ opacity: 1, y: 0, rotate }}
      whileHover={{ rotate: 0, scale: 1.05 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="relative p-4 shadow-xl"
      style={{ width: 200, height: 200, background: color, boxShadow: '4px 8px 20px rgba(0,0,0,0.12)' }}
    >
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-14 h-4 bg-white/60 rounded-sm" />
      <p className="font-script text-2xl text-rose-950 leading-tight">{text}</p>
    </motion.div>
  );
}

function Ticket({ title, subtitle, delay = 0, rotate = 2 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotate: 0 }}
      whileInView={{ opacity: 1, y: 0, rotate }}
      whileHover={{ rotate: 0, y: -4 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="relative bg-white shadow-2xl overflow-hidden"
      style={{ width: 260 }}
    >
      <div className="flex">
        <div className="px-4 py-3 text-white" style={{ background: 'linear-gradient(135deg, #ff5f8f, #b46aff)' }}>
          <div className="font-mono text-xs">ADMIT ONE</div>
          <div className="font-serif-fancy text-lg">❤️</div>
        </div>
        <div className="flex-1 px-4 py-3">
          <div className="font-serif-fancy text-lg text-rose-950 leading-tight">{title}</div>
          <div className="text-xs text-rose-800/70">{subtitle}</div>
        </div>
      </div>
      <div className="absolute inset-y-0 left-[86px] w-[1px] border-l border-dashed border-rose-300" />
    </motion.div>
  );
}

const STICKY_NOTES = [
  { text: 'my favorite thing today → you', color: '#ffe4a1', rotate: 4 },
  { text: 'remember when we got lost — best turn ever', color: '#f9b8c8', rotate: -3 },
  { text: 'if lost — return to me 💌', color: '#c8e0ff', rotate: 5 },
  { text: 'you + me = my favorite equation', color: '#d9f5c0', rotate: -2 },
];

export default function Scrapbook({ items = [], memories = [] }) {
  // Use admin-configured scrapbook items if any; otherwise derive from memories.
  const cards = useMemo(() => {
    if (items && items.length > 0) {
      return items.map((it) => ({ src: it.photo, caption: it.caption || '', location: it.location || '' }));
    }
    const flat = [];
    (memories || []).forEach((m) => (m.photos || []).forEach((p) => flat.push({ src: p, caption: m.title, location: m.location || '' })));
    return flat.slice(0, 6);
  }, [items, memories]);

  // interleave polaroids with sticky notes / ticket every ~3rd position
  const layout = useMemo(() => {
    const out = [];
    let noteI = 0;
    cards.forEach((c, i) => {
      out.push({ kind: 'polaroid', ...c, rotate: [-4, 5, -2, 3, -3, 4][i % 6], delay: i * 0.05 });
      if ((i + 1) % 3 === 0 && cards.length > i + 1) {
        const n = STICKY_NOTES[noteI % STICKY_NOTES.length];
        out.push({ kind: 'sticky', ...n, delay: i * 0.06 });
        noteI++;
      }
    });
    if (out.length > 3) out.splice(3, 0, { kind: 'ticket', title: 'Our first show, front row', subtitle: 'Row F · Seat 12 & 13', rotate: -3, delay: 0.15 });
    return out;
  }, [cards]);

  return (
    <section className="relative py-24 px-4 md:px-6 overflow-hidden">
      <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="text-center font-script text-5xl md:text-7xl gradient-text mb-3">
        Our scrapbook
      </motion.h2>
      <p className="text-center text-rose-900/70 font-serif-fancy italic mb-10">taped by hand — stained with love (and coffee)</p>

      <div className="relative max-w-6xl mx-auto rounded-3xl p-6 md:p-10"
        style={{
          background:
            'linear-gradient(180deg, #f7ecd7 0%, #f2e4c6 100%), url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'40\' height=\'40\'%3E%3Cpath d=\'M0 20h40M20 0v40\' stroke=\'%23e6d3a3\' stroke-width=\'0.5\'/%3E%3C/svg%3E")',
          backgroundBlendMode: 'multiply',
          boxShadow: 'inset 0 0 80px rgba(120, 72, 40, 0.18)',
        }}
      >
        <CoffeeStain style={{ top: 20, right: 40 }} />
        <CoffeeStain style={{ bottom: 60, left: 30, transform: 'scale(0.8)' }} />
        <Doodle path="M10,80 C 20,20 60,20 90,60 M75,50 L90,60 L80,70" style={{ top: 40, left: 50 }} />
        <Doodle path="M10,50 Q50,10 90,50 T170,50" style={{ bottom: 40, right: 60 }} color="#b46aff" />

        <div className="relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-10 place-items-center">
          {layout.map((it, i) => {
            if (it.kind === 'sticky') return <StickyNote key={i} text={it.text} color={it.color} rotate={it.rotate} delay={it.delay} />;
            if (it.kind === 'ticket') return <Ticket key={i} title={it.title} subtitle={it.subtitle} rotate={it.rotate} delay={it.delay} />;
            return <Polaroid key={i} src={it.src} caption={it.caption} location={it.location} rotate={it.rotate} delay={it.delay} />;
          })}
          {layout.length === 0 && (
            <div className="col-span-full text-center text-rose-800/70 font-serif-fancy italic py-8">
              Add scrapbook photos from the admin panel to fill this page.
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes doodleDraw {
          0%   { stroke-dashoffset: 200; }
          100% { stroke-dashoffset: 0; }
        }
      `}</style>
    </section>
  );
}
