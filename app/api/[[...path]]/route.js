import { NextResponse } from 'next/server';
import { sbAdmin } from '@/lib/supabase';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const DEFAULT_CONFIG_ID = 'main';

const DEFAULT_QUIZ = [
  { q: 'Where did we first meet?', options: ['A coffee shop', 'A concert', 'Online', 'A friend\'s party'], answer: 2, image: '' },
  { q: 'What\'s my favorite thing about you?', options: ['Your smile', 'Your laugh', 'Everything', 'Your eyes'], answer: 2, image: '' },
  { q: 'What color were you wearing on our first date?', options: ['Red', 'Black', 'Blue', 'I don\'t remember, I was staring at your face'], answer: 3, image: '' },
];

const DEFAULT_SCRATCH = [
  { id: 'sc1', title: 'Scratch me!', reveal: 'I love you ❤️', image: '' },
  { id: 'sc2', title: 'A hidden note', reveal: 'You are my favorite hello and hardest goodbye.', image: '' },
];

const DEFAULT_CONFIG = {
  memoriesOverride: null,
  playlist: [],
  quiz: DEFAULT_QUIZ,
  scratchCards: DEFAULT_SCRATCH,
  photoWall: [],
  photoWallUsername: 'abheer',
  scrapbook: [],
  unlockMemoryId: 'secret1',
  secretMemory: {
    title: 'You unlocked a secret 💕',
    description: 'This memory is only for people who play games for love. Which is you. Only you.',
    photo: '',
  },
};

async function getConfig() {
  const sb = sbAdmin();
  const { data, error } = await sb.from('config').select('data').eq('id', DEFAULT_CONFIG_ID).maybeSingle();
  if (error) throw error;
  if (!data) {
    const { error: insErr } = await sb.from('config').insert({ id: DEFAULT_CONFIG_ID, data: DEFAULT_CONFIG });
    if (insErr) throw insErr;
    return DEFAULT_CONFIG;
  }
  return { ...DEFAULT_CONFIG, ...(data.data || {}) };
}

async function saveConfig(patch) {
  const sb = sbAdmin();
  const current = await getConfig();
  const merged = { ...current, ...patch };
  const { error } = await sb.from('config').upsert({ id: DEFAULT_CONFIG_ID, data: merged, updated_at: new Date().toISOString() });
  if (error) throw error;
  return merged;
}

function json(data, status = 200) { return NextResponse.json(data, { status }); }

async function saveUpload(file, subfolder) {
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = (file.name?.split('.').pop() || 'bin').toLowerCase();
  const safeExt = /^[a-z0-9]+$/.test(ext) ? ext : 'bin';
  const fname = `${randomUUID()}.${safeExt}`;
  const dir = path.join(process.cwd(), 'public', 'assets', subfolder);
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });
  const full = path.join(dir, fname);
  await writeFile(full, buf);
  return `/assets/${subfolder}/${fname}`;
}

// ---------- Google Drive helpers ----------
async function getGoogleToken() {
  const sb = sbAdmin();
  const { data } = await sb.from('google_tokens').select('*').eq('id', 'main').maybeSingle();
  return data || null;
}

async function saveGoogleToken({ access_token, expires_in, scope }) {
  const sb = sbAdmin();
  const expires_at = new Date(Date.now() + (Number(expires_in) - 60) * 1000).toISOString();
  const { error } = await sb.from('google_tokens').upsert({
    id: 'main',
    access_token,
    expires_at,
    scope,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
  return { expires_at };
}

async function driveFetch(fileIdOrUrl, init = {}) {
  const tok = await getGoogleToken();
  if (!tok?.access_token) return { status: 401, error: 'Google not connected' };
  const url = fileIdOrUrl.startsWith('http')
    ? fileIdOrUrl
    : `https://www.googleapis.com/drive/v3/files/${fileIdOrUrl}?alt=media&supportsAllDrives=true`;
  const r = await fetch(url, {
    ...init,
    headers: { ...(init.headers || {}), Authorization: `Bearer ${tok.access_token}` },
  });
  return r;
}

// ---------- HANDLER ----------
async function handler(request, ctx) {
  const params = await ctx.params;
  const segments = params?.path || [];
  const route = segments.join('/');
  const method = request.method;

  try {
    if (route === '' && method === 'GET') return json({ ok: true, message: 'For you ❤️' });

    if (route === 'auth' && method === 'POST') {
      const { password } = await request.json();
      return json({ ok: password === (process.env.SITE_PASSWORD || 'myheart') });
    }
    if (route === 'admin-auth' && method === 'POST') {
      const { password } = await request.json();
      return json({ ok: password === (process.env.ADMIN_PASSWORD || 'admin123') });
    }

    if (route === 'config' && method === 'GET') return json(await getConfig());
    if (route === 'config' && method === 'PUT') {
      const body = await request.json();
      delete body._id;
      delete body.id;
      const merged = await saveConfig(body);
      return json({ ok: true, data: merged });
    }

    if (route === 'upload' && method === 'POST') {
      const form = await request.formData();
      const file = form.get('file');
      const folder = form.get('folder') || 'photos';
      const allowed = ['photos', 'music', 'voice', 'videos', 'stickers', 'backgrounds'];
      const sub = allowed.includes(folder) ? folder : 'photos';
      if (!file || typeof file === 'string') return json({ error: 'no file' }, 400);
      const url = await saveUpload(file, sub);
      return json({ ok: true, url, name: file.name, size: file.size });
    }

    // ---- Google Drive ----
    if (route === 'google/token' && method === 'POST') {
      const body = await request.json();
      const { expires_at } = await saveGoogleToken(body);
      return json({ ok: true, expires_at });
    }
    if (route === 'google/status' && method === 'GET') {
      const tok = await getGoogleToken();
      if (!tok?.access_token) return json({ connected: false });
      const expired = tok.expires_at && new Date(tok.expires_at).getTime() < Date.now();
      return json({ connected: !expired, expires_at: tok.expires_at });
    }
    if (route === 'google/disconnect' && method === 'POST') {
      const sb = sbAdmin();
      await sb.from('google_tokens').delete().eq('id', 'main');
      return json({ ok: true });
    }
    if (route === 'google/meta' && method === 'POST') {
      // fetch metadata for a list of file ids
      const { fileIds } = await request.json();
      if (!Array.isArray(fileIds)) return json({ error: 'fileIds required' }, 400);
      const tok = await getGoogleToken();
      if (!tok?.access_token) return json({ error: 'Google not connected' }, 401);
      const out = [];
      for (const fid of fileIds) {
        const r = await fetch(`https://www.googleapis.com/drive/v3/files/${fid}?fields=id,name,mimeType,thumbnailLink,size&supportsAllDrives=true`, {
          headers: { Authorization: `Bearer ${tok.access_token}` },
        });
        if (r.ok) out.push(await r.json());
      }
      return json({ files: out });
    }
    if (route === 'google/save-media' && method === 'POST') {
      // Persist selected files to drive_media
      const { files, section, associatedId } = await request.json();
      if (!Array.isArray(files)) return json({ error: 'files required' }, 400);
      const sb = sbAdmin();
      const rows = files.map((f, i) => ({
        drive_file_id: f.id,
        file_name: f.name || null,
        mime_type: f.mimeType || null,
        section: section || null,
        associated_id: associatedId || null,
        display_order: i,
        thumbnail_link: f.thumbnailLink || null,
      }));
      const { error } = await sb.from('drive_media').upsert(rows, { onConflict: 'drive_file_id' });
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true, count: rows.length });
    }

    // Drive file proxy: /api/drive/FILE_ID (used as <img src=>, <video src=>, <audio src=>)
    if (segments[0] === 'drive' && segments[1] && method === 'GET') {
      const fid = segments[1];
      // Try thumbnail sub-route: /api/drive/FILE_ID/thumb
      const isThumb = segments[2] === 'thumb';
      const tok = await getGoogleToken();
      if (!tok?.access_token) return json({ error: 'Google not connected' }, 401);

      // Get metadata to know mime type
      const metaR = await fetch(`https://www.googleapis.com/drive/v3/files/${fid}?fields=id,name,mimeType,thumbnailLink&supportsAllDrives=true`, {
        headers: { Authorization: `Bearer ${tok.access_token}` },
      });
      if (!metaR.ok) return json({ error: 'Drive meta failed', status: metaR.status }, metaR.status);
      const meta = await metaR.json();

      if (isThumb && meta.thumbnailLink) {
        // large thumb
        const bigThumb = meta.thumbnailLink.replace(/=s\d+/, '=s1600');
        const tr = await fetch(bigThumb, { headers: { Authorization: `Bearer ${tok.access_token}` } });
        const buf = await tr.arrayBuffer();
        return new NextResponse(buf, { headers: { 'Content-Type': tr.headers.get('content-type') || 'image/jpeg', 'Cache-Control': 'public, max-age=3600' } });
      }

      const range = request.headers.get('range');
      const dr = await fetch(`https://www.googleapis.com/drive/v3/files/${fid}?alt=media&supportsAllDrives=true`, {
        headers: {
          Authorization: `Bearer ${tok.access_token}`,
          ...(range ? { Range: range } : {}),
        },
      });
      if (!dr.ok && dr.status !== 206) return json({ error: 'Drive fetch failed', status: dr.status }, dr.status);

      // Pipe streaming response
      const headers = new Headers();
      headers.set('Content-Type', meta.mimeType || 'application/octet-stream');
      const cl = dr.headers.get('content-length'); if (cl) headers.set('Content-Length', cl);
      const cr = dr.headers.get('content-range'); if (cr) headers.set('Content-Range', cr);
      const ar = dr.headers.get('accept-ranges'); if (ar) headers.set('Accept-Ranges', ar);
      headers.set('Cache-Control', 'public, max-age=3600');
      return new NextResponse(dr.body, { status: dr.status, headers });
    }

    return json({ error: 'not_found', route }, 404);
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const runtime = 'nodejs';
