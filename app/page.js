'use client';
import { useState, useEffect, useMemo } from 'react';
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
import GamesSection from '@/components/games/GamesSection';
import SecretMemory from '@/components/SecretMemory';
import WorldMap from '@/components/WorldMap';
import Scrapbook from '@/components/Scrapbook';
import PhotoWall from '@/components/PhotoWall';
import Constellations from '@/components/Constellations';
import loveData from '@/lib/loveData';
import { Heart, ChevronDown } from 'lucide-react';

function App() {
  const [introDone, setIntroDone] = useState(false);
  const [saidYes, setSaidYes] = useState(false);
  const [config, setConfig] = useState({ playlist: [], quiz: [], scratchCards: [], memoriesOverride: null, secretMemory: null, photoWall: [], photoWallUsername: 'abheer' });
  const [secretOpen, setSecretOpen] = useState(false);

  useEffect(() => {
    if (!introDone) return;
    fetch('/api/config').then((r) => r.json()).then((c) => setConfig(c)).catch(() => {});
  }, [introDone]);

  useEffect(() => {
    if (saidYes) {
      setTimeout(() => document.getElementById('celebration')?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [saidYes]);

  const memories = (config.memoriesOverride && config.memoriesOverride.length > 0) ? config.memoriesOverride : loveData.memories;
  const playlist = (config.playlist && config.playlist.length > 0) ? config.playlist : loveData.playlist;

  // Fallback photo wall: use memory photos when admin hasn't uploaded any
  const photoWallPhotos = useMemo(() => {
    if (config.photoWall && config.photoWall.length > 0) return config.photoWall;
    const seen = new Set();
    const out = [];
    (memories || []).forEach((m) => (m.photos || []).forEach((p) => { if (!seen.has(p)) { seen.add(p); out.push(p); } }));
    return out;
  }, [config.photoWall, memories]);

  return (
    <main className="relative min-h-screen">
      <div className="mesh-bg" />

      {introDone && (<><FloatingHearts /><CursorEffect /><MusicPlayer playlist={playlist} /></>)}

      <AnimatePresence>
        {!introDone && (<IntroSequence lines={loveData.introLines} onBegin={() => setIntroDone(true)} />)}
      </AnimatePresence>

      {introDone && (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2 }} className="relative z-10">
          {/* Hero */}
          <section className="relative min-h-[92vh] flex flex-col items-center justify-center px-4 md:px-6 text-center">
            <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1, delay: 0.2 }} className="mb-6">
              <Heart className="w-16 h-16 md:w-20 md:h-20 fill-rose-400 text-rose-500 mx-auto drop-shadow-lg" />
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.4 }}
              className="font-script text-5xl sm:text-6xl md:text-8xl gradient-text px-2" style={{ lineHeight: 1.05 }}>
              For Sameer, my everything
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.1 }}
              className="mt-6 max-w-xl mx-auto text-lg sm:text-xl md:text-2xl font-serif-fancy italic text-rose-900/80">
              A little universe I built just for us. Scroll gently. Every corner remembers you.
            </motion.p>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, y: [0, 8, 0] }} transition={{ delay: 1.6, duration: 1.8, repeat: Infinity }}
              className="absolute bottom-10 text-rose-800/70 flex flex-col items-center gap-1">
              <span className="text-sm italic font-serif-fancy">scroll</span>
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </section>

          <LoveStats stats={loveData.stats} />
          <MemoryTimeline memories={memories} />

          {/* Map sits inside a soft pink→purple fade band; Constellations owns its own full-immersive background right after */}
          <div className="relative">
            <div className="absolute inset-0 pointer-events-none -z-0" aria-hidden style={{
              background:
                'linear-gradient(180deg, rgba(20, 10, 45, 0) 0%, rgba(30, 15, 60, 0.35) 20%, rgba(30, 15, 60, 0.55) 55%, rgba(30, 15, 60, 0.35) 82%, rgba(20, 10, 45, 0) 100%)',
            }} />
            <div className="relative z-10">
              <WorldMap memories={memories} pins={config.scrapbook || []} />
            </div>
          </div>

          <Constellations />

          <Scrapbook items={config.scrapbook || []} memories={memories} />
          <PhotoWall photos={photoWallPhotos} username={config.photoWallUsername || 'abheer'} />
          <LoveLetter title={loveData.loveLetter.title} body={loveData.loveLetter.body} />
          <OpenWhen envelopes={loveData.openWhen} />
          <BucketList items={loveData.bucketList} />
          <GamesSection config={config} onUnlockMemory={() => setSecretOpen(true)} />

          {/* Proposal — always the last section */}
          {!saidYes && (
            <section className="relative py-16">
              <Proposal question={loveData.proposal.question} yesButton={loveData.proposal.yesButton}
                onYes={() => setSaidYes(true)} />
            </section>
          )}
          {saidYes && (<section id="celebration"><Celebration message={loveData.proposal.celebration} /></section>)}

          <footer className="relative py-16 text-center text-rose-900/70 font-serif-fancy italic px-4">
            <div className="text-4xl mb-2">❤️</div>
            <p>Made with every ounce of love in me.</p>
            <p className="text-sm mt-1 opacity-60"><a href="/admin" className="underline">sonu</a></p>
          </footer>

          <SecretMemory open={secretOpen} memory={config.secretMemory} onClose={() => setSecretOpen(false)} />
        </motion.div>
      )}
    </main>
  );
}

export default App;
