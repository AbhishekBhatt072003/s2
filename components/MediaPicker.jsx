'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Cloud, Link as LinkIcon, X, Loader2 } from 'lucide-react';
import { openDrivePicker, extractDriveFileId, driveProxyUrl } from '@/lib/googleDrive';

/*
  <MediaPicker onPick={(item) => ...} accept="image|video|audio|any" folder="photos|music|videos|voice" section="..." label="..." />
  Callback receives an object: { url, name, source: 'local' | 'drive', fileId? }
  Multiple: onPick is called once per file.
*/
export default function MediaPicker({ onPick, accept = 'image', folder = 'photos', section = '', label = 'Add media' }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('local');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [linkInput, setLinkInput] = useState('');

  const localAccept = accept === 'image' ? 'image/*' : accept === 'video' ? 'video/*' : accept === 'audio' ? 'audio/*' : 'image/*,video/*,audio/*';

  const handleLocal = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setLoading(true); setError('');
    for (const file of files) {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', folder);
      try {
        const r = await fetch('/api/upload', { method: 'POST', body: fd });
        const j = await r.json();
        if (j.ok) onPick({ url: j.url, name: j.name, source: 'local' });
      } catch (err) { setError(err.message); }
    }
    setLoading(false);
    setOpen(false);
    e.target.value = '';
  };

  const handleDrive = async () => {
    setLoading(true); setError('');
    try {
      const docs = await openDrivePicker({ accept, multiple: true });
      if (docs.length > 0) {
        // save metadata to drive_media table
        const files = docs.map((d) => ({ id: d.id, name: d.name, mimeType: d.mimeType, thumbnailLink: d.iconUrl }));
        await fetch('/api/google/save-media', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ files, section }),
        });
        docs.forEach((d) => {
          onPick({ url: driveProxyUrl(d.id), name: d.name, source: 'drive', fileId: d.id, mimeType: d.mimeType });
        });
        setOpen(false);
      }
    } catch (err) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLink = async () => {
    setError('');
    const id = extractDriveFileId(linkInput);
    if (!id) return setError('Could not find a Drive file ID in that link.');
    setLoading(true);
    try {
      // fetch metadata
      const r = await fetch('/api/google/meta', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileIds: [id] }),
      });
      const j = await r.json();
      const meta = j.files?.[0] || { id, name: 'Drive file', mimeType: '' };
      await fetch('/api/google/save-media', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: [meta], section }),
      });
      onPick({ url: driveProxyUrl(id), name: meta.name || 'Drive file', source: 'drive', fileId: id, mimeType: meta.mimeType });
      setLinkInput('');
      setOpen(false);
    } catch (err) {
      // Even if meta failed (not signed in), still save the URL — will need re-auth to render.
      onPick({ url: driveProxyUrl(id), name: 'Drive file', source: 'drive', fileId: id });
      setLinkInput('');
      setOpen(false);
    } finally { setLoading(false); }
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-rose-500 text-white text-sm">
        <Upload className="w-4 h-4" /> {label}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[95] bg-black/60 backdrop-blur flex items-center justify-center p-4"
            onClick={() => !loading && setOpen(false)}>
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-lg p-5 relative"
              onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setOpen(false)} className="absolute top-3 right-3 p-1 rounded-full hover:bg-neutral-100"><X className="w-4 h-4" /></button>
              <div className="font-serif-fancy text-2xl gradient-text mb-4">Add media</div>

              <div className="flex gap-2 border-b mb-4">
                {[
                  { id: 'local', label: 'Upload', Icon: Upload },
                  { id: 'drive', label: 'Google Drive', Icon: Cloud },
                  { id: 'link', label: 'Drive link', Icon: LinkIcon },
                ].map((t) => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={`px-3 py-2 text-sm flex items-center gap-2 border-b-2 ${tab === t.id ? 'border-rose-500 text-rose-700' : 'border-transparent text-neutral-600'}`}>
                    <t.Icon className="w-4 h-4" />{t.label}
                  </button>
                ))}
              </div>

              {tab === 'local' && (
                <div>
                  <label className="block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:bg-rose-50">
                    <Upload className="w-8 h-8 mx-auto text-rose-500" />
                    <div className="mt-2 text-sm text-neutral-700">Click to choose files from your computer</div>
                    <input type="file" multiple accept={localAccept} className="hidden" onChange={handleLocal} />
                  </label>
                </div>
              )}

              {tab === 'drive' && (
                <div className="text-center py-6">
                  <Cloud className="w-10 h-10 mx-auto text-rose-500 mb-2" />
                  <p className="text-sm text-neutral-700 mb-3">Open Google Drive and pick one or more files.</p>
                  <button onClick={handleDrive} disabled={loading}
                    className="px-4 py-2 rounded-full bg-rose-500 text-white text-sm inline-flex items-center gap-2 disabled:opacity-60">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cloud className="w-4 h-4" />}
                    {loading ? 'Opening...' : 'Open Drive Picker'}
                  </button>
                  <p className="text-xs text-neutral-500 mt-3">You'll be asked to sign in the first time.</p>
                </div>
              )}

              {tab === 'link' && (
                <div>
                  <label className="text-sm text-neutral-700">Paste a Google Drive share link</label>
                  <input value={linkInput} onChange={(e) => setLinkInput(e.target.value)}
                    placeholder="https://drive.google.com/file/d/..."
                    className="mt-2 w-full px-3 py-2 rounded-lg border" />
                  <button onClick={handleLink} disabled={loading || !linkInput}
                    className="mt-3 px-4 py-2 rounded-full bg-rose-500 text-white text-sm inline-flex items-center gap-2 disabled:opacity-60">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LinkIcon className="w-4 h-4" />}
                    Add
                  </button>
                  <p className="text-xs text-neutral-500 mt-2">I'll extract the file ID automatically.</p>
                </div>
              )}

              {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
