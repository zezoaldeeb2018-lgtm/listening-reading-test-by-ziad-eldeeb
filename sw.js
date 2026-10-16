const CACHE_NAME = 'eldeeb-offline-v6'; // غيرته لـ v6 عشان تظبط الصوتيات
const APP_SHELL = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

const LEVEL_FILES = [
  './level/level4.js','./level/level5.js','./level/level6.js','./level/level7.js',
  './level/level8.js','./level/level9.js','./level/level10.js','./level/level11.js',
  './level/level12.js','./level/level13.js','./level/level14.js','./level/level15.js',
  './level/level16.js','./level/level17.js','./level/level18.js'
];

self.addEventListener('install', e => {
  console.log('[SW] Installing:', CACHE_NAME);
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => {
      return c.addAll([...APP_SHELL,...LEVEL_FILES]).catch(() => c.addAll(APP_SHELL));
    }).then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(k => {
        if(k !== CACHE_NAME && k !== 'audio-levels-v2') {
          return caches.delete(k);
        }
      })
    )).then(async () => {
      const cache = await caches.open(CACHE_NAME);
      const requests = await cache.keys();
      for (let req of requests) {
        if (req.url.includes('/level/') && (req.url.includes('level19') || !LEVEL_FILES.some(f => req.url.includes(f.replace('./',''))))) {
          await cache.delete(req);
        }
      }
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  const cleanUrl = url.origin + url.pathname;

  // === 1- الصوتيات: Cache First + تحديث في الخلفية ===
  // ده اللي هيحل التهنيج
  if(url.pathname.includes('/audio/') || url.pathname.endsWith('.mp3')){
    e.respondWith(
      (async () => {
        const audioCache = await caches.open('audio-levels-v2');
        const cached = await audioCache.match(cleanUrl, {ignoreSearch: true}) || await audioCache.match(e.request, {ignoreSearch: true});

        // لو في كاش، رجعه فورا للمشغل عشان الليسننج يشتغل بدون تهنيج
        // واعمل تحديث في الخلفية
        const networkUpdate = fetch(e.request, {cache: 'no-store'}).then(res => {
          if(res.ok){
            // قارن الحجم مثلا عشان تعرف لو في تحديث بجد
            // هنا بنحدث الكاش بس لو الريسبونس مختلف (ممكن تضيف check بـ ETag لو عايز ادق)
            audioCache.put(cleanUrl, res.clone());
            caches.open(CACHE_NAME).then(c => c.put(cleanUrl, res.clone()));
          } else if(res.status === 404){
            audioCache.delete(cleanUrl);
          }
          return res;
        }).catch(()=>null);

        if(cached){
          // شغل من الكاش فورا، وسيب التحديث شغال في الخلفية
          networkUpdate;
          return cached;
        }
        // مفيش كاش خالص، استنى النت
        const netRes = await networkUpdate;
        return netRes || new Response('offline', {status: 503});
      })()
    );
    return;
  }

  // === 2- ملفات الليفلات level/*.js: برضه Cache First عشان تفتح بسرعة ===
  if(url.pathname.includes('/level/')){
    e.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(cleanUrl, {ignoreSearch: true}) || await cache.match(e.request, {ignoreSearch: true});
        
        const networkUpdate = fetch(e.request, {cache: 'no-store'}).then(res => {
          if(!res.ok && res.status === 404){
            cache.delete(cleanUrl);
            return new Response('deleted', {status: 404});
          }
          if(res.ok){
            cache.put(cleanUrl, res.clone());
          }
          return res;
        }).catch(()=>null);

        if(cached){
          networkUpdate;
          return cached;
        }
        const netRes = await networkUpdate;
        return netRes || cached || new Response('offline', {status: 503});
      })()
    );
    return;
  }

  // === 3- ملفات التطبيق الاساسية: Network First عشان التحديثات توصلك ===
  const isAppShell = url.pathname.endsWith('app.js') || url.pathname.endsWith('index.html') || url.pathname.endsWith('style.css') || url.pathname === '/' || url.pathname.endsWith('/');
  if(isAppShell){
    e.respondWith(
      fetch(e.request, {cache: 'no-store'}).then(res => {
        if(res.ok){
          caches.open(CACHE_NAME).then(c => c.put(e.request, res.clone()));
        }
        return res;
      }).catch(()=> caches.match(e.request, {ignoreSearch: true}).then(c => c || caches.match('./index.html')))
    );
    return;
  }

  // === 4- الباقي: Cache First ===
  e.respondWith(
    caches.match(e.request, {ignoreSearch: true}).then(cached => {
      if(cached) return cached;
      return fetch(e.request).then(res => {
        if(res.ok){
          caches.open(CACHE_NAME).then(c => c.put(e.request, res.clone()));
        }
        return res;
      }).catch(()=> caches.match('./index.html'));
    })
  );
});

self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});
