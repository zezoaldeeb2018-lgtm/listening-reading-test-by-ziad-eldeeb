const CACHE_NAME = 'eldeeb-offline-v5'; // غيرت لـ v5 عشان يمسح القديم
const AUDIO_CACHE = 'audio-levels-v3';
const APP_SHELL = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// شيلت level19 من هنا خلاص
const LEVEL_FILES = [
  './level/level4.js','./level/level5.js','./level/level6.js','./level/level7.js',
  './level/level8.js','./level/level9.js','./level/level10.js','./level/level11.js',
  './level/level12.js','./level/level13.js','./level/level14.js','./level/level15.js',
  './level/level16.js','./level/level17.js','./level/level18.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(async c => {
      // حمل الاساسيات الاول
      await c.addAll(APP_SHELL);
      // حمل الليفلات واحد واحد عشان لو واحد ناقص ميبوظش كله
      for (let file of LEVEL_FILES) {
        try { await c.add(file); } catch(err) { console.log('skip', file); }
      }
    }).then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(k => {
        if(k!== CACHE_NAME && k!== AUDIO_CACHE) {
          console.log('بمسح كاش قديم:', k);
          return caches.delete(k);
        }
      })
    )).then(async () => {
      // اهم حتة: امسح ليفل 19 من الكاش الجديد لو لسه موجود
      const cache = await caches.open(CACHE_NAME);
      const allReqs = await cache.keys();
      for (let req of allReqs) {
        if (req.url.includes('level19')) {
          console.log('بمسح level19 المحذوف من الكاش');
          await cache.delete(req);
        }
      }
      // ولو فيه ملف في الكاش مش موجود في LEVEL_FILES امسحه
      for (let req of allReqs) {
        let url = new URL(req.url);
        if(url.pathname.includes('/level/')){
          let clean = './level/' + url.pathname.split('/level/').pop().split('?')[0];
          if(!LEVEL_FILES.includes(clean) &&!LEVEL_FILES.includes('.'+clean)){
             await cache.delete(req);
          }
        }
      }
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', e => {
  let url = new URL(e.request.url);

  if(url.pathname.includes('/level/')){
    let cleanUrl = url.origin + url.pathname;
    e.respondWith(
      // جرب النت الاول
      fetch(e.request, {cache: 'no-store'}).then(res => {
        if(!res.ok){ // لو الملف اتمسح من السيرفر (404)
          // امسحه من الكاش كمان
          caches.open(CACHE_NAME).then(c => c.delete(cleanUrl));
          caches.open(CACHE_NAME).then(c => c.delete(e.request));
          return Promise.reject('deleted');
        }
        // لو موجود، حدثه في الكاش
        let clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(cleanUrl, clone));
        return res;
      }).catch(() => {
        // لو مفيش نت، هاته من الكاش
        return caches.match(cleanUrl, {ignoreSearch: true})
         .then(cached => cached || caches.match(e.request, {ignoreSearch: true}));
      })
    );
    return;
  }

  if(url.pathname.includes('/audio/') || url.pathname.endsWith('.mp3')){
    e.respondWith(
      caches.match(e.request, {ignoreSearch: true}).then(cached => {
        if(cached) return cached;
        return fetch(e.request).then(res => {
          if(res.ok){
            caches.open(AUDIO_CACHE).then(c => c.put(url.origin + url.pathname, res.clone()));
          }
          return res;
        });
      })
    );
    return;
  }

  // باقي الملفات: cache first
  e.respondWith(
    caches.match(e.request, {ignoreSearch: true}).then(cached => {
      if(cached) return cached;
      return fetch(e.request);
    })
  );
});
