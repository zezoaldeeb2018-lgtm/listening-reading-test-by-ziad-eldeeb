const CACHE_APP = 'eldeeb-app-v16';
const CACHE_LEVELS = 'eldeeb-levels-v16';
const CACHE_AUDIO = 'eldeeb-audio-v2';

const APP_SHELL = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_APP).then(c => c.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => {
      if (k.startsWith('eldeeb-app-') && k !== CACHE_APP) return caches.delete(k);
      if (k.startsWith('eldeeb-levels-') && k !== CACHE_LEVELS) return caches.delete(k);
      if (k.startsWith('eldeeb-audio-') && k !== CACHE_AUDIO) return caches.delete(k);
    }))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.headers.has('Range')) return;
  if (e.request.method !== 'GET') return;
  const url = e.request.url;
  if (!url.startsWith(self.location.origin)) return;

  // 1- الصوتيات: كاش اولا
  if (url.includes('/audio/') || url.endsWith('.mp3')) {
    e.respondWith(
      caches.open(CACHE_AUDIO).then(async cache => {
        const cached = await cache.match(e.request, {ignoreSearch: true});
        if (cached) return cached;
        const res = await fetch(e.request, {cache: 'no-store'});
        if (res.ok) cache.put(e.request, res.clone());
        return res;
      })
    );
    return;
  }

  // 2- الليفلات: نت اولا، لو فشل كاش
  if (url.includes('/level/')) {
    e.respondWith(
      caches.open(CACHE_LEVELS).then(async cache => {
        try {
          const res = await fetch(e.request, {cache: 'no-store'});
          if (res.ok) cache.put(e.request, res.clone());
          return res;
        } catch {
          const cached = await cache.match(e.request, {ignoreSearch: true});
          return cached || new Response('offline', {status: 504});
        }
      })
    );
    return;
  }

  // 3- باقي الموقع (app.js, index.html): نت اولا، لو فشل كاش
  e.respondWith(
    (async () => {
      try {
        const res = await fetch(e.request, {cache: 'no-store'});
        if (res.ok) {
          const cache = await caches.open(CACHE_APP);
          cache.put(e.request, res.clone());
        }
        return res;
      } catch {
        const cached = await caches.match(e.request, {ignoreSearch: true});
        return cached || caches.match('./index.html');
      }
    })()
  );
});
