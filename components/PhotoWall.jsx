'use client';
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Send, Bookmark, Grid3x3, X } from 'lucide-react';

const commentSamples = [
  { u: 'sunlit.thoughts', t: 'okay this is the cutest thing i\'ve seen today 😭' },
  { u: 'mira.k', t: 'the way he looks at her 🥺💕' },
  { u: 'aditya_writes', t: 'goals fr' },
  { u: 'itsraya', t: 'need this energy in my life immediately' },
  { u: 'kbytes', t: 'stop, i\'m crying at work' },
  { u: 'noor.ali', t: 'you two invented love apparently' },
  { u: 'zenaida', t: 'the softest thing on my feed today ✨' },
  { u: 'tashh', t: 'okay okay this is precious' },
];

function randomLikes() {
  return 300 + Math.floor(Math.random() * 4200);
}
function shuffle(a) { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }

export default function PhotoWall({ photos = [], username = 'abheer' }) {
  const [open, setOpen] = useState(null);

  // Precompute per-photo meta so it's stable during a session
  const meta = useMemo(() => photos.map((p, i) => ({
    src: p,
    likes: randomLikes(),
    comments: shuffle(commentSamples).slice(0, 3 + Math.floor(Math.random() * 3)),
    caption: [
      'our whole world in one frame ✨',
      'small moment, big feeling 💖',
      'day #' + (i + 1) + ' of loving her out loud',
      'unreleased b-side: my favorite person',
      'she said something funny, i took a picture',
    ][i % 5],
  })), [photos]);

  const followers = 1284; // fun random number
  const posts = photos.length;

  return (
    <section className="relative py-24 px-4 md:px-6">
      <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="text-center font-script text-5xl md:text-7xl gradient-text mb-3">
        Our photo wall
      </motion.h2>
      <p className="text-center text-rose-900/70 font-serif-fancy italic mb-10">a little corner of the internet just for us</p>

      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-rose-100">
        {/* profile header */}
        <div className="p-5 md:p-7">
          <div className="flex items-center gap-5 md:gap-8">
            <div className="relative shrink-0">
              <div className="w-20 h-20 md:w-28 md:h-28 rounded-full p-[3px]" style={{ background: 'conic-gradient(from 220deg, #ff5f8f, #b46aff, #ff9aa2, #ff5f8f)' }}>
                <div className="w-full h-full rounded-full bg-white p-1">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center text-3xl md:text-4xl">
                    <Heart className="w-8 h-8 md:w-10 md:h-10 fill-rose-500 text-rose-500" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <div className="text-xl md:text-2xl text-neutral-900 font-medium">{username}</div>
                <button className="px-4 py-1.5 rounded-lg text-white text-sm bg-gradient-to-r from-pink-500 to-purple-500">Following</button>
              </div>
              <div className="flex gap-6 mt-3 text-neutral-800 text-sm md:text-base">
                <span><b>{posts}</b> posts</span>
                <span><b>{followers.toLocaleString()}</b> followers</span>
                <span><b>431</b> following</span>
              </div>
              <div className="mt-3 hidden md:block">
                <div className="font-serif-fancy text-neutral-900">Abheer · ❤️</div>
                <div className="text-sm text-neutral-600">collecting memories with my favorite human. dm for the good ones.</div>
              </div>
            </div>
          </div>
          <div className="mt-3 md:hidden">
            <div className="font-serif-fancy text-neutral-900">Abheer · ❤️</div>
            <div className="text-sm text-neutral-600">collecting memories with my favorite human.</div>
          </div>
        </div>

        <div className="border-t border-neutral-200">
          <div className="flex justify-center gap-2 py-3 text-neutral-700"><Grid3x3 className="w-4 h-4" /><span className="text-xs tracking-widest">POSTS</span></div>
        </div>

        {/* Grid */}
        {photos.length === 0 ? (
          <div className="p-10 text-center text-neutral-500">Upload photos from <a href="/admin" className="underline">admin</a> to build the wall.</div>
        ) : (
          <div className="grid grid-cols-3 gap-1 p-1">
            {meta.map((m, i) => (
              <button key={i} onClick={() => setOpen(m)} className="relative aspect-square group overflow-hidden bg-neutral-100">
                <img src={m.src} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-semibold">
                  <span className="flex items-center gap-1"><Heart className="w-4 h-4 fill-white" />{m.likes.toLocaleString()}</span>
                  <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" />{m.comments.length}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Post modal */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setOpen(null)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl overflow-hidden w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative bg-black aspect-square md:aspect-auto">
                <img src={open.src} alt="" className="w-full h-full object-cover" />
                <button onClick={() => setOpen(null)} className="absolute top-3 right-3 p-2 rounded-full bg-white/80"><X className="w-4 h-4 text-neutral-800" /></button>
              </div>
              <div className="flex flex-col min-h-0">
                <div className="flex items-center gap-3 p-3 border-b">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-500" />
                  <div className="font-medium text-neutral-900">{username}</div>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-3 text-sm">
                  <div><b>{username}</b> <span className="text-neutral-800">{open.caption}</span></div>
                  {open.comments.map((c, k) => (
                    <div key={k}><b>{c.u}</b> <span className="text-neutral-800">{c.t}</span></div>
                  ))}
                </div>
                <div className="border-t p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
                    <MessageCircle className="w-6 h-6 text-neutral-700" />
                    <Send className="w-6 h-6 text-neutral-700" />
                    <Bookmark className="w-6 h-6 text-neutral-700 ml-auto" />
                  </div>
                  <div className="text-sm font-medium text-neutral-900">{open.likes.toLocaleString()} likes</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
