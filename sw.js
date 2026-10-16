
const CACHE_NAME = 'eldeeb-offline-v5'; // <--- اهم حاجة غيرت v4 لـ v5 عشان يجبر المتصفح يحدث
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
  console.log('[SW] Installing new version:', CACHE_NAME);
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => {
      return c.addAll([...APP_SHELL,...LEVEL_FILES]).catch(err => {
        console.log('Some level files failed', err);
        return c.addAll(APP_SHELL);
      });
    }).then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(k => {
        if(k !== CACHE_NAME && k !== 'audio-levels-v2') {
          console.log('[SW] Deleting old cache:', k);
          return caches.delete(k);
        }
      })
    )).then(async () => {
      // امسح اي ليفل محذوف
      const cache = await caches.open(CACHE_NAME);
      const requests = await cache.keys();
      for (let req of requests) {
        const url = req.url;
        if (url.includes('/level/')) {
          const isStillExist = LEVEL_FILES.some(f => url.includes(f.replace('./','')));
          if (!isStillExist || url.includes('level19')) {
            console.log('بمسح ملف محذوف من الكاش:', url);
            await cache.delete(req);
          }
        }
      }
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  
  // لو طلب خارجي (google sheets مثلا) سيبه يعدي
  if (url.origin !== location.origin) return;

  const isAppShell = url.pathname.endsWith('app.js') || 
                     url.pathname.endsWith('index.html') || 
                     url.pathname.endsWith('style.css') ||
                     url.pathname === '/' ||
                     url.pathname.endsWith('/');

  // 1- ملفات الليفلات والاوديو: جرب النت الاول عشان تعرف لو اتمسح
  if(url.pathname.includes('/level/') || url.pathname.includes('/audio/')){
    let cleanUrl = url.origin + url.pathname;
    e.respondWith(
      fetch(e.request, {cache: 'no-store'}).then(res => {
        if (!res.ok) {
          console.log('ملف محذوف من السيرفر:', cleanUrl);
          caches.open(CACHE_NAME).then(c => c.delete(cleanUrl));
          return new Response('deleted', {status: 404});
        }
        if(res.ok){
          let clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(cleanUrl, clone));
          if(url.pathname.includes('/audio/') || url.pathname.endsWith('.mp3')){
            caches.open('audio-levels-v2').then(c => c.put(cleanUrl, res.clone()));
          }
        }
        return res;
      }).catch(()=>{
        return caches.match(cleanUrl, {ignoreSearch: true}).then(cached => {
          if(cached) return cached;
          return caches.match(e.request, {ignoreSearch: true});
        });
      })
    );
    return;
  }

  // 2- ملفات التطبيق الاساسية app.js و index.html: لازم Network First
  if(isAppShell){
    e.respondWith(
      fetch(e.request, {cache: 'no-store'}).then(res => {
        if(res.ok){
          let clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return res;
      }).catch(()=> {
        return caches.match(e.request, {ignoreSearch: true}).then(cached => {
          if(cached) return cached;
          if(e.request.destination === 'document'){
            return caches.match('./index.html');
          }
        });
      })
    );
    return;
  }

  // 3- باقي الملفات (صور، ايقونات): Cache First عادي
  e.respondWith(
    caches.match(e.request, {ignoreSearch: true}).then(cached => {
      if(cached) return cached;
      return fetch(e.request).then(res => {
        if(res.ok && (url.pathname.endsWith('.js') || url.pathname.endsWith('.css') || url.pathname.endsWith('.html') || url.pathname.endsWith('.png'))){
          let clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return res;
      }).catch(()=> {
        if(e.request.destination === 'document'){
          return caches.match('./index.html');
        }
      });
    })
  );
});

// اسمع لرسالة تحديث اجباري من الصفحة
self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

