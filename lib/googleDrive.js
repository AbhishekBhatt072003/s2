'use client';
// Google Drive Picker helper using Google Identity Services + Picker API.
// One-time script loader + admin token flow.

let gapiLoaded = false;
let pickerLoaded = false;
let gisLoaded = false;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src; s.async = true; s.defer = true;
    s.onload = () => resolve();
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

async function ensureGapi() {
  if (gapiLoaded && pickerLoaded) return;
  await loadScript('https://apis.google.com/js/api.js');
  await new Promise((resolve) => window.gapi.load('picker', resolve));
  gapiLoaded = true; pickerLoaded = true;
}

async function ensureGis() {
  if (gisLoaded) return;
  await loadScript('https://accounts.google.com/gsi/client');
  gisLoaded = true;
}

// Get / refresh an access token via GIS.
export async function getAccessToken({ interactive = true } = {}) {
  await ensureGis();
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/drive.readonly',
      prompt: interactive ? 'consent' : '',
      callback: async (resp) => {
        if (resp.error) return reject(new Error(resp.error));
        // Persist to server so it can proxy files
        try {
          await fetch('/api/google/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              access_token: resp.access_token,
              expires_in: resp.expires_in,
              scope: resp.scope,
            }),
          });
        } catch {}
        resolve(resp.access_token);
      },
      error_callback: (err) => reject(new Error(err?.message || 'auth error')),
    });
    client.requestAccessToken({ prompt: interactive ? 'consent' : '' });
  });
}

// Open the Drive picker; resolves with an array of picked file objects.
export async function openDrivePicker({ accept = 'image', multiple = true } = {}) {
  await ensureGapi();
  await ensureGis();

  const token = await getAccessToken({ interactive: true });
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
  const appId = process.env.NEXT_PUBLIC_GOOGLE_APP_ID;

  const mimeMap = {
    image: 'image/png,image/jpeg,image/webp,image/gif',
    video: 'video/mp4,video/quicktime,video/webm',
    audio: 'audio/mpeg,audio/wav,audio/mp3,audio/x-wav,audio/ogg',
    any: '',
  };

  return new Promise((resolve) => {
    const view = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS)
      .setIncludeFolders(true)
      .setSelectFolderEnabled(false)
      .setOwnedByMe(true);
    if (mimeMap[accept]) view.setMimeTypes(mimeMap[accept]);

    const sharedView = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS)
      .setIncludeFolders(true)
      .setEnableDrives(true);
    if (mimeMap[accept]) sharedView.setMimeTypes(mimeMap[accept]);

    const builder = new window.google.picker.PickerBuilder()
      .setDeveloperKey(apiKey)
      .setAppId(appId)
      .setOAuthToken(token)
      .addView(view)
      .addView(sharedView)
      .setCallback((data) => {
        if (data.action === window.google.picker.Action.PICKED) {
          resolve(data.docs || []);
        } else if (data.action === window.google.picker.Action.CANCEL) {
          resolve([]);
        }
      });

    if (multiple) builder.enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED);
    builder.build().setVisible(true);
  });
}

// Extract Google Drive file id from any common share URL.
export function extractDriveFileId(url) {
  if (!url) return null;
  const s = String(url).trim();
  // Direct id
  if (/^[A-Za-z0-9_-]{20,}$/.test(s)) return s;
  const patterns = [
    /\/file\/d\/([A-Za-z0-9_-]{20,})/,
    /\/document\/d\/([A-Za-z0-9_-]{20,})/,
    /\/presentation\/d\/([A-Za-z0-9_-]{20,})/,
    /\/spreadsheets\/d\/([A-Za-z0-9_-]{20,})/,
    /[?&]id=([A-Za-z0-9_-]{20,})/,
    /\/folders\/([A-Za-z0-9_-]{20,})/,
  ];
  for (const p of patterns) {
    const m = s.match(p);
    if (m) return m[1];
  }
  return null;
}

// Given a drive file id, return a proxy URL that server-fetches with our stored token.
export function driveProxyUrl(fileId) {
  return `/api/drive/${fileId}`;
}
export function driveThumbUrl(fileId) {
  return `/api/drive/${fileId}/thumb`;
}
