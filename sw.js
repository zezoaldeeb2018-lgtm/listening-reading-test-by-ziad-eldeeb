
const CACHE_NAME = 'eldeeb-offline-v3';
const APP_SHELL = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './level/level4.js',
  './level/level5.js',
  './level/level6.js',
  './level/level7.js',
  './level/level8.js',
  './level/level9.js',
  './level/level10.js',
  './level/level11.js',
  './level/level12.js',
  './level/level13.js',
  './level/level14.js',
  './level/level15.js',
  './level/level16.js',
  './level/level17.js',
  './level/level18.js',
  './level/level19.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(APP_SHELL)).then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE_NAME && k !== 'audio-levels-v2' ? caches.delete(k) : null)))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  // استراتيجية: Cache first لكل حاجة تبع المنصة
  if (url.includes('/level/') || url.includes('/audio/') || url.includes('.mp3') || url.includes('.js') || url.includes('.css') || url.includes('.png')) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          // خزن نسخة
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
          // لو صوت خزنه كمان في كاش الصوت الخاص
          if (url.includes('/audio/') || url.includes('.mp3')) {
            caches.open('audio-levels-v2').then(c => c.put(e.request, res.clone()));
          }
          return res;
        }).catch(() => {
          return caches.match('./index.html');
        });
      })
    );
  } else {
    // للباقي: Network first
    e.respondWith(
      fetch(e.request).catch(()=>caches.match(e.request))
    );
  }
});
