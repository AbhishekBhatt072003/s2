'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart } from 'lucide-react';

export default function SecretMemory({ open, memory, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[95] bg-black/70 backdrop-blur-md flex items-center justify-center p-6"
          onClick={onClose}>
          <motion.div initial={{ scale: 0.85, y: 20 }} animate={{ scale: 1, y: 0 }}
            className="glass max-w-lg w-full rounded-3xl p-8 relative"
            onClick={(e) => e.stopPropagation()}>
            <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-full hover:bg-white/60"><X className="w-5 h-5 text-rose-800" /></button>
            <Heart className="w-10 h-10 fill-rose-500 text-rose-500 mb-3" />
            <div className="font-script text-4xl gradient-text mb-3">{memory?.title || 'A secret 💖'}</div>
            {memory?.photo && <img src={memory.photo} alt="" className="w-full rounded-2xl mb-3 max-h-80 object-cover" />}
            <p className="font-serif-fancy text-lg text-rose-950 leading-relaxed whitespace-pre-line">{memory?.description}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
