const CACHE_APP = 'eldeeb-app-v8';
const CACHE_LEVELS = 'eldeeb-levels-v3';
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
    caches.open(CACHE_APP).then(c => c.addAll(APP_SHELL).catch(()=>{})).then(() => self.skipWaiting())
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
  if (e.request.headers.has('Range')) return; // سطر الايفون بتاع الصوت سيبه

  if (e.request.method !== 'GET') return;
  const url = e.request.url;
  if (!url.startsWith(self.location.origin)) return;

  // الصوتيات
  if (url.includes('/audio/') || url.endsWith('.mp3')) {
    e.respondWith(
      caches.open(CACHE_AUDIO).then(async cache => {
        const cached = await cache.match(e.request, {ignoreSearch: true});
        if (cached) return cached;
        try {
          const res = await fetch(e.request);
          if (res.ok) cache.put(e.request, res.clone());
          return res;
        } catch {
          return cached || new Response('', {status: 503});
        }
      })
    );
    return;
  }

  // الليفلات - ده اللي كان عامل المشكلة
  if (url.includes('/level/')) {
    e.respondWith(
      caches.open(CACHE_LEVELS).then(async cache => {
        const cached = await cache.match(e.request, {ignoreSearch: true});
        
        // هات الجديد في الخلفية وحدث الكاش
        const fetchPromise = fetch(e.request).then(res => {
          if (res.ok) cache.put(e.request, res.clone());
          return res;
        }).catch(()=>{});

        // لو فيه كاش رجعه فورا (عشان الايفون اوفلاين)
        // لو مفيش استنى النت
        if (cached) {
          fetchPromise; // بيحدث في الخلفية للمرة الجاية
          return cached;
        }
        return fetchPromise;
      })
    );
    return;
  }

  // باقي الموقع
  e.respondWith(
    caches.match(e.request, {ignoreSearch: true}).then(cached => {
      return cached || fetch(e.request).then(res => {
        if (res.ok) caches.open(CACHE_APP).then(c => c.put(e.request, res.clone()));
        return res;
      }).catch(() => cached);
    })
  );
});

self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});
