'use client';
import { useEffect, useRef } from 'react';

// Lightweight canvas-based floating hearts with mouse parallax
export default function FloatingHearts({ count = 22 }) {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const hearts = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 6 + Math.random() * 18,
      vy: 0.2 + Math.random() * 0.6,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.005 + Math.random() * 0.01,
      alpha: 0.35 + Math.random() * 0.5,
      hue: 330 + Math.random() * 40,
    }));

    const drawHeart = (x, y, size, alpha, hue) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(size / 20, size / 20);
      ctx.beginPath();
      ctx.moveTo(0, 6);
      ctx.bezierCurveTo(-10, -6, -18, 6, 0, 16);
      ctx.bezierCurveTo(18, 6, 10, -6, 0, 6);
      ctx.closePath();
      ctx.fillStyle = `hsla(${hue}, 90%, 70%, ${alpha})`;
      ctx.shadowColor = `hsla(${hue}, 90%, 65%, ${alpha})`;
      ctx.shadowBlur = 18;
      ctx.fill();
      ctx.restore();
    };

    let raf;
    const tick = () => {
      ctx.clearRect(0, 0, width, height);
      hearts.forEach((h) => {
        h.sway += h.swaySpeed;
        h.y -= h.vy;
        const parallax = (mouse.current.x - width / 2) * 0.006;
        const px = h.x + Math.sin(h.sway) * 20 + parallax * (h.size / 12);
        const py = h.y;
        if (h.y < -30) {
          h.y = height + 20;
          h.x = Math.random() * width;
        }
        drawHeart(px, py, h.size, h.alpha, h.hue);
      });
      raf = requestAnimationFrame(tick);
    };
    tick();

    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    const onMouse = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMouse);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouse);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}
