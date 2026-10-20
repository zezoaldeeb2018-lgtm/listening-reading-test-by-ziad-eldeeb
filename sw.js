// sw.js - v18 - يرجع الاوفلاين 100% - حتى لو manifest والايكونات مش موجودة
const CACHE_APP = 'eldeeb-app-v18';
const CACHE_LEVELS = 'eldeeb-levels-v17';
const CACHE_AUDIO = 'eldeeb-audio-v2';

const APP_SHELL = [
  './',
  './index.html',
  './style.css',
  './app.js'
  // شيلت manifest والايكونات من هنا عشان لو مش موجودين ميوقعوش الكاش
  // هنحاول نخزنهم لوحدهم بعد كده
];

const OPTIONAL_FILES = [
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_APP);
      // 1- خزن الاساسي - كل ملف لوحده عشان لو واحد فشل الباقي يكمل
      for (let url of APP_SHELL) {
        try {
          const res = await fetch(url, {cache: 'no-store'});
          if (res.ok) await cache.put(url, res.clone());
          else await cache.add(url).catch(()=>{});
        } catch {
          try { await cache.add(url); } catch {}
        }
      }
      // 2- حاول تخزن الاختياري - لو مش موجود مش مشكلة
      for (let url of OPTIONAL_FILES) {
        try {
          const res = await fetch(url, {cache: 'no-store'});
          if (res.ok) await cache.put(url, res.clone());
        } catch {}
      }
    })()
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => {
      if (k.startsWith('eldeeb-app-') && k !== CACHE_APP) return caches.delete(k);
      // سيب الليفلات والصوت القديم لو موجود عشان الاوفلاين
      // بس امسح النسخ القديمة جدا
      if (k.startsWith('eldeeb-levels-') && k !== CACHE_LEVELS && k !== 'eldeeb-levels-v15') return caches.delete(k);
    }))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.headers.has('Range')) return;
  if (e.request.method !== 'GET') return;
  const url = e.request.url;
  if (!url.startsWith(self.location.origin)) return;

  // الصوتيات: كاش اولا
  if (url.includes('/audio/') || url.endsWith('.mp3')) {
    e.respondWith(
      caches.match(e.request, {ignoreSearch: true}).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          if (res.ok) caches.open(CACHE_AUDIO).then(c => c.put(e.request, res.clone()));
          return res;
        });
      })
    );
    return;
  }

  // الليفلات: نت اولا، لو فشل كاش (متجاهل ?v=)
  if (url.includes('/level/')) {
    e.respondWith(
      (async () => {
        try {
          const res = await fetch(e.request, {cache: 'no-store'});
          if (res.ok) {
            const cache = await caches.open(CACHE_LEVELS);
            cache.put(e.request, res.clone());
          }
          return res;
        } catch {
          const cached = await caches.match(e.request, {ignoreSearch: true});
          if (cached) return cached;
          // دور على اي نسخة من نفس الليفل
          const cache = await caches.open(CACHE_LEVELS);
          const keys = await cache.keys();
          const fileName = url.split('/').pop().split('?')[0];
          for (let k of keys) {
            if (k.url.includes(fileName)) {
              const m = await cache.match(k);
              if (m) return m;
            }
          }
          return new Response('offline', {status: 504});
        }
      })()
    );
    return;
  }

  // الصور وال CSS و JS: نت اولا عشان يحدث الصورة القديمة، لو مفيش نت كاش
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
        if (cached) return cached;
        if (e.request.destination === 'document') {
          return caches.match('./index.html') || caches.match('./');
        }
      }
    })()
  );
});
