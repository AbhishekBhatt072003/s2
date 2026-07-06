'use client';
import { useEffect, useState } from 'react';
import { Heart, Upload, Trash2, Plus, Save, Music, ImagePlus, Lock } from 'lucide-react';

async function api(url, method = 'GET', body) {
  const opts = { method, headers: {} };
  if (body instanceof FormData) opts.body = body;
  else if (body) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
  const r = await fetch(url, opts);
  return r.json();
}

function Section({ title, children }) {
  return (
    <div className="glass rounded-3xl p-6 mb-6">
      <h3 className="font-script text-3xl gradient-text mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Login({ onOk }) {
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    const r = await api('/api/admin-auth', 'POST', { password: pwd });
    if (r.ok) onOk();
    else setErr('Wrong password');
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={submit} className="glass rounded-3xl p-8 w-full max-w-md">
        <div className="flex items-center gap-2 text-rose-800 mb-4"><Lock className="w-5 h-5" /><span className="font-serif-fancy text-xl">Admin</span></div>
        <input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="admin password"
          className="w-full px-4 py-3 rounded-full bg-white/80 border border-rose-200 outline-none focus:border-rose-500" />
        {err && <div className="text-red-600 text-sm mt-2">{err}</div>}
        <button className="mt-4 w-full py-3 rounded-full text-white" style={{ background: 'linear-gradient(120deg, #ff5f8f, #b46aff)' }}>Enter</button>
      </form>
    </div>
  );
}

function UploadButton({ folder = 'photos', onUploaded, label = 'Upload' }) {
  const [loading, setLoading] = useState(false);
  const onChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', folder);
    const r = await api('/api/upload', 'POST', fd);
    setLoading(false);
    if (r.ok) onUploaded(r.url, file.name);
    e.target.value = '';
  };
  return (
    <label className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-rose-500 text-white text-sm cursor-pointer">
      <Upload className="w-4 h-4" /> {loading ? 'Uploading...' : label}
      <input type="file" className="hidden" onChange={onChange} accept={folder === 'music' ? 'audio/*' : 'image/*,video/*'} />
    </label>
  );
}

function MemoriesEditor({ cfg, setCfg }) {
  const list = cfg.memoriesOverride || [];
  const update = (i, patch) => {
    const l = list.map((m, k) => (k === i ? { ...m, ...patch } : m));
    setCfg({ ...cfg, memoriesOverride: l });
  };
  const add = () => setCfg({ ...cfg, memoriesOverride: [...list, { id: `m_${Date.now()}`, date: '', title: 'New memory', emoji: '💖', description: '', photos: [], location: '', color: 'from-pink-400 to-purple-400' }] });
  const remove = (i) => setCfg({ ...cfg, memoriesOverride: list.filter((_, k) => k !== i) });

  return (
    <Section title="Memories">
      <p className="text-sm text-rose-800/70 mb-3">Turn on override to fully replace the default demo memories.</p>
      <button onClick={add} className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/80 text-rose-800 text-sm mb-3"><Plus className="w-4 h-4" /> Add memory</button>
      {list.length === 0 && <div className="text-rose-800/60 italic">No custom memories yet. Add one to override the demo timeline.</div>}
      <div className="space-y-4">
        {list.map((m, i) => (
          <div key={m.id} className="bg-white/60 rounded-2xl p-4 border border-rose-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input value={m.title} onChange={(e) => update(i, { title: e.target.value })} placeholder="Title" className="px-3 py-2 rounded-lg bg-white border" />
              <input value={m.date} onChange={(e) => update(i, { date: e.target.value })} placeholder="Date (e.g. May 12, 2023)" className="px-3 py-2 rounded-lg bg-white border" />
              <input value={m.emoji} onChange={(e) => update(i, { emoji: e.target.value })} placeholder="Emoji" className="px-3 py-2 rounded-lg bg-white border" />
              <input value={m.location} onChange={(e) => update(i, { location: e.target.value })} placeholder="Location" className="px-3 py-2 rounded-lg bg-white border" />
            </div>
            <textarea value={m.description} onChange={(e) => update(i, { description: e.target.value })} placeholder="Description" rows={3} className="mt-2 w-full px-3 py-2 rounded-lg bg-white border" />
            <div className="mt-3">
              <div className="text-sm mb-2 text-rose-800/80">Photos</div>
              <div className="flex flex-wrap gap-2">
                {m.photos.map((p, k) => (
                  <div key={k} className="relative w-24 h-24 rounded-lg overflow-hidden group">
                    <img src={p} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => update(i, { photos: m.photos.filter((_, x) => x !== k) })}
                      className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100"><Trash2 className="w-3 h-3" /></button>
                  </div>
                ))}
                <UploadButton folder="photos" onUploaded={(url) => update(i, { photos: [...m.photos, url] })} label="Add photo" />
              </div>
            </div>
            <button onClick={() => remove(i)} className="mt-3 inline-flex items-center gap-1 text-red-600 text-sm"><Trash2 className="w-3 h-3" /> Delete memory</button>
          </div>
        ))}
      </div>
    </Section>
  );
}

function MusicEditor({ cfg, setCfg }) {
  const list = cfg.playlist || [];
  return (
    <Section title="Music">
      <p className="text-sm text-rose-800/70 mb-3">Upload audio files. They\'ll appear in the player automatically.</p>
      <UploadButton folder="music" onUploaded={(url, name) => setCfg({ ...cfg, playlist: [...list, { title: name.replace(/\.[^.]+$/, ''), src: url }] })} label="Upload song" />
      <ul className="mt-4 space-y-2">
        {list.map((s, i) => (
          <li key={i} className="flex items-center gap-2 bg-white/60 rounded-lg p-2">
            <Music className="w-4 h-4 text-rose-700" />
            <input value={s.title} onChange={(e) => { const l = list.map((x, k) => k === i ? { ...x, title: e.target.value } : x); setCfg({ ...cfg, playlist: l }); }}
              className="flex-1 px-2 py-1 rounded bg-white border text-sm" />
            <span className="text-xs text-rose-800/60 truncate max-w-[220px]">{s.src}</span>
            <button onClick={() => setCfg({ ...cfg, playlist: list.filter((_, k) => k !== i) })} className="p-1 text-red-600"><Trash2 className="w-4 h-4" /></button>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function QuizEditor({ cfg, setCfg }) {
  const list = cfg.quiz || [];
  const update = (i, patch) => setCfg({ ...cfg, quiz: list.map((q, k) => k === i ? { ...q, ...patch } : q) });
  const updateOpt = (i, oi, v) => update(i, { options: list[i].options.map((o, k) => k === oi ? v : o) });
  const add = () => setCfg({ ...cfg, quiz: [...list, { q: '', options: ['', '', '', ''], answer: 0, image: '' }] });
  const remove = (i) => setCfg({ ...cfg, quiz: list.filter((_, k) => k !== i) });

  return (
    <Section title="Memory Quiz Questions">
      <button onClick={add} className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/80 text-rose-800 text-sm mb-3"><Plus className="w-4 h-4" /> Add question</button>
      <div className="space-y-4">
        {list.map((q, i) => (
          <div key={i} className="bg-white/60 rounded-2xl p-4 border border-rose-100">
            <textarea value={q.q} onChange={(e) => update(i, { q: e.target.value })} placeholder="Question" rows={2} className="w-full px-3 py-2 rounded-lg bg-white border" />
            {q.image ? (
              <div className="relative w-40 h-28 mt-2 rounded overflow-hidden">
                <img src={q.image} alt="" className="w-full h-full object-cover" />
                <button onClick={() => update(i, { image: '' })} className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full"><Trash2 className="w-3 h-3" /></button>
              </div>
            ) : (
              <div className="mt-2"><UploadButton folder="photos" label="Add image/gif" onUploaded={(url) => update(i, { image: url })} /></div>
            )}
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
              {q.options.map((opt, oi) => (
                <label key={oi} className={`flex items-center gap-2 rounded-lg border px-2 py-1 ${q.answer === oi ? 'border-green-400 bg-green-50' : 'border-rose-100 bg-white'}`}>
                  <input type="radio" checked={q.answer === oi} onChange={() => update(i, { answer: oi })} />
                  <input value={opt} onChange={(e) => updateOpt(i, oi, e.target.value)} placeholder={`Option ${oi + 1}`} className="flex-1 px-2 py-1 bg-transparent outline-none" />
                </label>
              ))}
            </div>
            <button onClick={() => remove(i)} className="mt-3 inline-flex items-center gap-1 text-red-600 text-sm"><Trash2 className="w-3 h-3" /> Delete</button>
          </div>
        ))}
      </div>
    </Section>
  );
}

function ScratchEditor({ cfg, setCfg }) {
  const list = cfg.scratchCards || [];
  const update = (i, patch) => setCfg({ ...cfg, scratchCards: list.map((s, k) => k === i ? { ...s, ...patch } : s) });
  const add = () => setCfg({ ...cfg, scratchCards: [...list, { id: `sc_${Date.now()}`, title: 'New card', reveal: '', image: '' }] });
  const remove = (i) => setCfg({ ...cfg, scratchCards: list.filter((_, k) => k !== i) });

  return (
    <Section title="Scratch Cards">
      <p className="text-sm text-rose-800/70 mb-3">Each card can hide text and/or an image (photo, gift card, coupon, etc).</p>
      <button onClick={add} className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/80 text-rose-800 text-sm mb-3"><Plus className="w-4 h-4" /> Add card</button>
      <div className="space-y-4">
        {list.map((s, i) => (
          <div key={s.id} className="bg-white/60 rounded-2xl p-4 border border-rose-100">
            <input value={s.title} onChange={(e) => update(i, { title: e.target.value })} placeholder="Card title" className="w-full px-3 py-2 rounded-lg bg-white border mb-2" />
            <textarea value={s.reveal} onChange={(e) => update(i, { reveal: e.target.value })} placeholder="Text to reveal" rows={2} className="w-full px-3 py-2 rounded-lg bg-white border" />
            <div className="mt-2 flex items-center gap-2">
              {s.image ? (
                <div className="relative w-40 h-28 rounded overflow-hidden">
                  <img src={s.image} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => update(i, { image: '' })} className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full"><Trash2 className="w-3 h-3" /></button>
                </div>
              ) : (
                <UploadButton folder="photos" label="Add hidden image" onUploaded={(url) => update(i, { image: url })} />
              )}
            </div>
            <button onClick={() => remove(i)} className="mt-3 inline-flex items-center gap-1 text-red-600 text-sm"><Trash2 className="w-3 h-3" /> Delete</button>
          </div>
        ))}
      </div>
    </Section>
  );
}

function SecretEditor({ cfg, setCfg }) {
  const s = cfg.secretMemory || { title: '', description: '', photo: '' };
  const upd = (patch) => setCfg({ ...cfg, secretMemory: { ...s, ...patch } });
  return (
    <Section title="Unlockable Secret Memory (Catch Hearts reward)">
      <input value={s.title} onChange={(e) => upd({ title: e.target.value })} placeholder="Title" className="w-full px-3 py-2 rounded-lg bg-white border mb-2" />
      <textarea value={s.description} onChange={(e) => upd({ description: e.target.value })} placeholder="Description" rows={3} className="w-full px-3 py-2 rounded-lg bg-white border" />
      <div className="mt-2">
        {s.photo ? (
          <div className="relative w-48 h-32 rounded overflow-hidden">
            <img src={s.photo} className="w-full h-full object-cover" alt="" />
            <button onClick={() => upd({ photo: '' })} className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full"><Trash2 className="w-3 h-3" /></button>
          </div>
        ) : (
          <UploadButton folder="photos" onUploaded={(url) => upd({ photo: url })} label="Add photo" />
        )}
      </div>
    </Section>
  );
}

function App() {
  const [ok, setOk] = useState(false);
  const [cfg, setCfg] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    if (!ok) return;
    api('/api/config').then(setCfg);
  }, [ok]);

  const save = async () => {
    setSaving(true);
    await api('/api/config', 'PUT', cfg);
    setSaving(false);
    setSavedAt(new Date().toLocaleTimeString());
  };

  if (!ok) return <Login onOk={() => setOk(true)} />;
  if (!cfg) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <div className="mesh-bg" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 fill-rose-500 text-rose-500" />
            <h1 className="font-script text-4xl gradient-text">Admin</h1>
          </div>
          <div className="flex items-center gap-3">
            {savedAt && <span className="text-sm text-rose-800/70">Saved at {savedAt}</span>}
            <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white"
              style={{ background: 'linear-gradient(120deg, #ff5f8f, #b46aff)' }}>
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save all'}
            </button>
          </div>
        </div>

        <MemoriesEditor cfg={cfg} setCfg={setCfg} />
        <MusicEditor cfg={cfg} setCfg={setCfg} />
        <QuizEditor cfg={cfg} setCfg={setCfg} />
        <ScratchEditor cfg={cfg} setCfg={setCfg} />
        <SecretEditor cfg={cfg} setCfg={setCfg} />

        <div className="text-center py-6">
          <a href="/" className="text-rose-800 underline">← Back to site</a>
        </div>
      </div>
    </div>
  );
}

export default App;
