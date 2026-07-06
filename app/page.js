'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import IntroSequence from '@/components/IntroSequence';
import FloatingHearts from '@/components/FloatingHearts';
import CursorEffect from '@/components/CursorEffect';
import MusicPlayer from '@/components/MusicPlayer';
import LoveStats from '@/components/LoveStats';
import MemoryTimeline from '@/components/MemoryTimeline';
import Proposal from '@/components/Proposal';
import Celebration from '@/components/Celebration';
import LoveLetter from '@/components/LoveLetter';
import OpenWhen from '@/components/OpenWhen';
import BucketList from '@/components/BucketList';
import loveData from '@/lib/loveData';
import { Heart, ChevronDown } from 'lucide-react';

function App() {
  const [introDone, setIntroDone] = useState(false);
  const [saidYes, setSaidYes] = useState(false);

  // Ensure we can scroll to celebration on YES
  useEffect(() => {
    if (saidYes) {
      setTimeout(() => {
        const el = document.getElementById('celebration');
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [saidYes]);

  return (
    <main className="relative min-h-screen">
      {/* Animated gradient mesh background */}
      <div className="mesh-bg" />

      {/* Floating hearts and cursor effects */}
      {introDone && (
        <>
          <FloatingHearts />
          <CursorEffect />
          <MusicPlayer playlist={loveData.playlist} />
        </>
      )}

      {/* Intro */}
      <AnimatePresence>
        {!introDone && (
          <IntroSequence lines={loveData.introLines} onBegin={() => setIntroDone(true)} />
        )}
      </AnimatePresence>

      {/* Main experience */}
      {introDone && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          className="relative z-10"
        >
          {/* Hero */}
          <section className="relative min-h-[92vh] flex flex-col items-center justify-center px-6 text-center">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="mb-6"
            >
              <Heart className="w-16 h-16 md:w-20 md:h-20 fill-rose-400 text-rose-500 mx-auto drop-shadow-lg" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.4 }}
              className="font-script text-6xl md:text-8xl gradient-text"
              style={{ lineHeight: 1.05 }}
            >
              For you, my everything
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.1 }}
              className="mt-6 max-w-xl mx-auto text-xl md:text-2xl font-serif-fancy italic text-rose-900/80"
            >
              A little universe I built just for us. Scroll gently. Every corner remembers you.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, y: [0, 8, 0] }}
              transition={{ delay: 1.6, duration: 1.8, repeat: Infinity }}
              className="absolute bottom-10 text-rose-800/70 flex flex-col items-center gap-1"
            >
              <span className="text-sm italic font-serif-fancy">scroll</span>
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </section>

          {/* Stats */}
          <LoveStats stats={loveData.stats} />

          {/* Timeline */}
          <MemoryTimeline memories={loveData.memories} />

          {/* Love letter */}
          <LoveLetter title={loveData.loveLetter.title} body={loveData.loveLetter.body} />

          {/* Open when */}
          <OpenWhen envelopes={loveData.openWhen} />

          {/* Bucket list */}
          <BucketList items={loveData.bucketList} />

          {/* Proposal */}
          {!saidYes && (
            <section className="relative py-16">
              <Proposal
                question={loveData.proposal.question}
                yesButton={loveData.proposal.yesButton}
                noTexts={loveData.proposal.noTexts}
                onYes={() => setSaidYes(true)}
              />
            </section>
          )}

          {/* Celebration */}
          {saidYes && (
            <section id="celebration">
              <Celebration message={loveData.proposal.celebration} />
            </section>
          )}

          {/* Footer */}
          <footer className="relative py-16 text-center text-rose-900/70 font-serif-fancy italic">
            <div className="text-4xl mb-2">❤️</div>
            <p>Made with every ounce of love in me.</p>
            <p className="text-sm mt-1 opacity-60">psst — open lib/loveData.js to make this yours</p>
          </footer>
        </motion.div>
      )}
    </main>
  );
}

export default App;
