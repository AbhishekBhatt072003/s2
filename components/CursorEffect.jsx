'use client';
import { useEffect, useState } from 'react';

export default function CursorEffect() {
  const [dots, setDots] = useState([]);

  useEffect(() => {
    // Disable on touch devices
    if (typeof window === 'undefined') return;
    const isTouch = matchMedia('(hover: none)').matches;
    if (isTouch) return;

    let idCounter = 0;
    const onMove = (e) => {
      const id = ++idCounter;
      const dot = { id, x: e.clientX, y: e.clientY, born: Date.now() };
      setDots((prev) => [...prev.slice(-24), dot]);
    };
    const interval = setInterval(() => {
      const now = Date.now();
      setDots((prev) => prev.filter((d) => now - d.born < 900));
    }, 100);
    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mousemove', onMove);
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      {dots.map((d, i) => {
        const age = (Date.now() - d.born) / 900;
        const scale = 1 - age;
        return (
          <div
            key={d.id}
            className="sparkle-dot"
            style={{
              left: d.x - 5,
              top: d.y - 5,
              opacity: Math.max(0, 1 - age),
              transform: `scale(${Math.max(0.2, scale * 2)})`,
              transition: 'opacity 0.4s linear, transform 0.4s ease-out',
            }}
          />
        );
      })}
    </>
  );
}
