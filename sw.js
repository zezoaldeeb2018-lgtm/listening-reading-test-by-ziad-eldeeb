const CACHE_NAME = 'eldeeb-offline-v4';
const APP_SHELL = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// حاول تجيب كل ملفات الليفلات لو موجودة - شيلت level19 من هنا
const LEVEL_FILES = [
  './level/level4.js','./level/level5.js','./level/level6.js','./level/level7.js',
  './level/level8.js','./level/level9.js','./level/level10.js','./level/level11.js',
  './level/level12.js','./level/level13.js','./level/level14.js','./level/level15.js',
  './level/level16.js','./level/level17.js','./level/level18.js'
];

self.addEventListener('install', e => {
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
        if(k!== CACHE_NAME && k!== 'audio-levels-v2') {
          return caches.delete(k);
        }
      })
    )).then(async () => {
      // ==== التعديل الوحيد هنا ====
      // امسح اي ملف محذوف من الكاش
      const cache = await caches.open(CACHE_NAME);
      const requests = await cache.keys();
      for (let req of requests) {
        const url = req.url;
        // لو ده ليفل 19 او اي ليفل مش موجود في LEVEL_FILES امسحه
        if (url.includes('/level/')) {
          const fileName = './level/' + url.split('/level/').pop().split('?')[0];
          const isStillExist = LEVEL_FILES.some(f => url.includes(f.replace('./','')));
          if (!isStillExist || url.includes('level19')) {
            console.log('بمسح ملف محذوف من الكاش:', fileName);
            await cache.delete(req);
            await cache.delete(req.url, {ignoreSearch: true});
          }
        }
      }
      // ============================
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', e => {
  let url = new URL(e.request.url);
  let request = e.request;

  if(url.pathname.includes('/level/') || url.pathname.includes('/audio/')){
    let cleanUrl = url.origin + url.pathname;
    e.respondWith(
      // الاول جرب النت عشان تعرف لو الملف اتمسح
      fetch(e.request, {cache: 'no-store'}).then(res => {
        if (!res.ok) { // لو 404 يعني اتمسح من جيت هاب
          console.log('ملف محذوف من السيرفر، بمسحه من الكاش:', cleanUrl);
          caches.open(CACHE_NAME).then(c => c.delete(cleanUrl));
          caches.open(CACHE_NAME).then(c => c.delete(e.request));
          caches.open(CACHE_NAME).then(c => c.delete(cleanUrl, {ignoreSearch: true}));
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
        // مفيش نت، هاته من الكاش
        return caches.match(cleanUrl, {ignoreSearch: true}).then(cached => {
          if(cached) return cached;
          return caches.match(e.request, {ignoreSearch: true});
        });
      })
    );
    return;
  }

  e.respondWith(
    caches.match(request, {ignoreSearch: true}).then(cached => {
      if(cached) return cached;
      return fetch(request).then(res => {
        if(res.ok && (url.pathname.endsWith('.js') || url.pathname.endsWith('.css') || url.pathname.endsWith('.html') || url.pathname.endsWith('.png'))){
          let clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return res;
      }).catch(()=> {
        if(request.destination === 'document'){
          return caches.match('./index.html');
        }
      });
    })
  );
});
