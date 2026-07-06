'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

// Very small markdown → html renderer (bold, italic, newlines)
function render(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>');
}

export default function LoveLetter({ title, body }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-120px' });
  const [chars, setChars] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let id;
    const step = () => {
      setChars((c) => {
        if (c >= body.length) return c;
        id = setTimeout(step, 22);
        return c + 2;
      });
    };
    step();
    return () => clearTimeout(id);
  }, [inView, body]);

  const shown = body.slice(0, chars);

  return (
    <section ref={ref} className="relative py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center font-script text-5xl md:text-6xl gradient-text mb-10"
        >
          {title}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 30, rotate: -1 }}
          whileInView={{ opacity: 1, y: 0, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="relative glass rounded-3xl p-8 md:p-12 shadow-2xl"
          style={{ backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.75), rgba(255,240,245,0.75))' }}
        >
          <div
            className="font-script text-2xl md:text-3xl leading-relaxed text-rose-950 whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: render(shown) + (chars < body.length ? '<span class="opacity-60">|</span>' : '') }}
          />
        </motion.div>
      </div>
    </section>
  );
}
