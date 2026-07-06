'use client';
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

function Popup({ memory, onClose }) {
  const [i, setI] = useState(0);
  if (!memory) return null;
  const photos = memory.photos || [];
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-md flex items-end md:items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 60, scale: 0.95, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 240, damping: 24 }}
          className="glass rounded-3xl w-full max-w-lg overflow-hidden relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={onClose} className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/70 hover:bg-white"><X className="w-4 h-4 text-rose-800" /></button>
          {photos.length > 0 && (
            <div className="relative aspect-[4/3] bg-black">
              <img src={photos[i]} alt="" className="w-full h-full object-cover" />
              {photos.length > 1 && (
                <>
                  <button onClick={() => setI((v) => (v - 1 + photos.length) % photos.length)} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80"><ChevronLeft className="w-4 h-4 text-rose-800" /></button>
                  <button onClick={() => setI((v) => (v + 1) % photos.length)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80"><ChevronRight className="w-4 h-4 text-rose-800" /></button>
                </>
              )}
            </div>
          )}
          <div className="p-5">
            <div className="flex items-center gap-2 text-rose-800/80 text-sm mb-1">
              <Calendar className="w-3.5 h-3.5" />{memory.date}
              {memory.location && (<><span>·</span><MapPin className="w-3.5 h-3.5" />{memory.location}</>)}
            </div>
            <div className="font-script text-3xl gradient-text">{memory.emoji} {memory.title}</div>
            <p className="mt-2 font-serif-fancy text-rose-950 leading-relaxed">{memory.description}</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function bubbleIcon(photo, emoji) {
  const html = `
    <div class="map-bubble">
      <div class="map-bubble-ring"></div>
      ${photo ? `<img src="${photo}" />` : `<div class="map-bubble-emoji">${emoji || '💖'}</div>`}
      <div class="map-bubble-tail"></div>
    </div>`;
  return L.divIcon({ html, className: 'map-bubble-wrap', iconSize: [64, 74], iconAnchor: [32, 74] });
}

export default function WorldMapInner({ memories }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return;
    // Guard against React 18 StrictMode double-mount: reuse the map instance if it exists on the DOM node.
    if (containerRef.current._leaflet_map) {
      mapRef.current = containerRef.current._leaflet_map;
    } else {
      const withCoords = (memories || []).filter((m) => typeof m.lat === 'number' && typeof m.lng === 'number');
      const center = withCoords.length ? [withCoords[0].lat, withCoords[0].lng] : [20, 0];
      const map = L.map(containerRef.current, {
        center,
        zoom: 2,
        minZoom: 2,
        maxZoom: 12,
        scrollWheelZoom: false,
        worldCopyJump: true,
        zoomControl: true,
      });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>',
      }).addTo(map);

      const markers = [];
      withCoords.forEach((m) => {
        const marker = L.marker([m.lat, m.lng], { icon: bubbleIcon(m.photos?.[0], m.emoji) });
        marker.on('click', () => setSelected(m));
        marker.addTo(map);
        markers.push(marker);
      });
      // Fit to bounds if multiple pins
      if (withCoords.length > 1) {
        const group = L.featureGroup(markers);
        try { map.fitBounds(group.getBounds().pad(0.35)); } catch (e) {}
      }
      mapRef.current = map;
      containerRef.current._leaflet_map = map;
    }
    // Give the map a small delay to recompute size (in case parent transitions)
    setTimeout(() => mapRef.current?.invalidateSize(), 300);

    return () => {
      // Do NOT destroy on unmount in dev (StrictMode double-mount would remove it before the second mount can re-use).
      // But do destroy if the DOM node is going away for real (React actually removes the node).
    };
  }, [memories]);

  return (
    <>
      <div ref={containerRef} className="w-full" style={{ height: 'min(70vh, 560px)', background: '#fdf2f8' }} />
      {selected && <Popup memory={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
