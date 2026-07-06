'use client';
import { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MusicPlayer({ playlist = [] }) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.45);
  const [muted, setMuted] = useState(false);
  const [loop, setLoop] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [autoTried, setAutoTried] = useState(false);
  const audioRef = useRef(null);

  const hasSongs = playlist.length > 0;
  const current = hasSongs ? playlist[idx] : null;
  const currentTitle = current?.title || current?.name || (current?.src ? current.src.split('/').pop().replace(/\.[^.]+$/, '') : 'No song');

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);

  // Autoplay first track once after mount (the "Begin" click already granted the user gesture).
  useEffect(() => {
    if (!hasSongs || autoTried) return;
    setAutoTried(true);
    const el = audioRef.current;
    if (!el) return;
    el.volume = volume;
    const attempt = el.play();
    if (attempt && typeof attempt.then === 'function') {
      attempt.then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  }, [hasSongs, autoTried, volume]);

  const toggle = () => {
    if (!audioRef.current || !hasSongs) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play().catch(() => {}); setPlaying(true); }
  };

  const next = () => {
    if (!hasSongs) return;
    const n = shuffle ? Math.floor(Math.random() * playlist.length) : (idx + 1) % playlist.length;
    setIdx(n);
    setTimeout(() => audioRef.current?.play().catch(() => {}), 60);
    setPlaying(true);
  };
  const prev = () => {
    if (!hasSongs) return;
    setIdx((i) => (i - 1 + playlist.length) % playlist.length);
    setTimeout(() => audioRef.current?.play().catch(() => {}), 60);
    setPlaying(true);
  };

  return (
    <div className="fixed bottom-5 right-5 z-[70]">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            className="glass rounded-3xl p-4 mb-3 w-72 shadow-2xl"
          >
            <div className="flex items-center gap-2">
              {playing && (
                <div className="flex items-end gap-0.5 h-4">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-0.5 bg-rose-500 rounded-full" style={{ animation: `mpBar 0.8s ${i * 0.2}s ease-in-out infinite alternate`, height: '30%' }} />
                  ))}
                </div>
              )}
              <div className="font-serif-fancy text-rose-950 truncate flex-1">
                {hasSongs ? currentTitle : 'No songs yet'}
              </div>
            </div>
            {!hasSongs && (
              <div className="text-xs text-rose-800/60 mt-1">Upload songs in admin to play them here.</div>
            )}

            <div className="flex items-center justify-between mt-4">
              <button onClick={prev} className="p-2 rounded-full hover:bg-white/60"><SkipBack className="w-4 h-4" /></button>
              <button onClick={toggle} className="p-3 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 text-white shadow-lg">
                {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <button onClick={next} className="p-2 rounded-full hover:bg-white/60"><SkipForward className="w-4 h-4" /></button>
            </div>

            <div className="flex items-center gap-2 mt-3">
              <button onClick={() => setMuted((m) => !m)} className="p-2 rounded-full hover:bg-white/60">
                {muted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input type="range" min={0} max={1} step={0.01} value={volume}
                onChange={(e) => { setVolume(parseFloat(e.target.value)); setMuted(false); }}
                className="flex-1 accent-pink-500" />
            </div>

            <div className="flex items-center justify-between mt-3">
              <button onClick={() => setLoop((l) => !l)} className={`p-2 rounded-full ${loop ? 'bg-pink-200' : 'hover:bg-white/60'}`}>
                <Repeat className="w-4 h-4" />
              </button>
              <button onClick={() => setShuffle((s) => !s)} className={`p-2 rounded-full ${shuffle ? 'bg-pink-200' : 'hover:bg-white/60'}`}>
                <Shuffle className="w-4 h-4" />
              </button>
              <div className="text-xs text-rose-900/60">{hasSongs ? `${idx + 1} / ${playlist.length}` : '0 songs'}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((o) => !o)}
        className="w-14 h-14 rounded-full text-white shadow-2xl flex items-center justify-center relative"
        style={{ background: 'linear-gradient(135deg, #ff8fb1, #b46aff)' }}
      >
        <Music className="w-6 h-6" />
        {playing && <span className="absolute inset-0 rounded-full ring-2 ring-white/40 animate-ping" />}
      </button>

      {current && (
        <audio
          ref={audioRef}
          src={current.src}
          loop={loop}
          onEnded={() => (loop ? null : next())}
        />
      )}

      <style jsx global>{`
        @keyframes mpBar {
          0% { height: 20%; }
          100% { height: 100%; }
        }
      `}</style>
    </div>
  );
}
