import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';
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

async function getConfig() {
  const db = await getDb();
  let cfg = await db.collection('config').findOne({ _id: DEFAULT_CONFIG_ID });
  if (!cfg) {
    cfg = {
      _id: DEFAULT_CONFIG_ID,
      memoriesOverride: null,
      playlist: [],
      quiz: DEFAULT_QUIZ,
      scratchCards: DEFAULT_SCRATCH,
      unlockMemoryId: 'secret1',
      secretMemory: {
        title: 'You unlocked a secret 💕',
        description: 'This memory is only for people who play games for love. Which is you. Only you.',
        photo: '',
      },
    };
    await db.collection('config').insertOne(cfg);
  }
  return cfg;
}

function json(data, status = 200) {
  return NextResponse.json(data, { status });
}

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

async function handler(request, ctx) {
  const params = await ctx.params;
  const segments = params?.path || [];
  const route = segments.join('/');
  const method = request.method;

  try {
    // Health
    if (route === '' && method === 'GET') return json({ ok: true, message: 'For you ❤️' });

    // Site auth
    if (route === 'auth' && method === 'POST') {
      const { password } = await request.json();
      const ok = password === (process.env.SITE_PASSWORD || 'myheart');
      return json({ ok });
    }
    if (route === 'admin-auth' && method === 'POST') {
      const { password } = await request.json();
      const ok = password === (process.env.ADMIN_PASSWORD || 'admin123');
      return json({ ok });
    }

    // Get config (public)
    if (route === 'config' && method === 'GET') {
      const cfg = await getConfig();
      return json(cfg);
    }
    // Save config (public in MVP)
    if (route === 'config' && method === 'PUT') {
      const body = await request.json();
      const db = await getDb();
      const update = { ...body };
      delete update._id;
      await db.collection('config').updateOne({ _id: DEFAULT_CONFIG_ID }, { $set: update }, { upsert: true });
      return json({ ok: true });
    }

    // File upload
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
