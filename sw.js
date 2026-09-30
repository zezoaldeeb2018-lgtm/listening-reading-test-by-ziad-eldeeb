
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

// حاول تجيب كل ملفات الليفلات لو موجودة
const LEVEL_FILES = [
  './level/level4.js','./level/level5.js','./level/level6.js','./level/level7.js',
  './level/level8.js','./level/level9.js','./level/level10.js','./level/level11.js',
  './level/level12.js','./level/level13.js','./level/level14.js','./level/level15.js',
  './level/level16.js','./level/level17.js','./level/level18.js','./level/level19.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => {
      return c.addAll([...APP_SHELL, ...LEVEL_FILES]).catch(err => {
        // لو فشل تحميل ليفل مش مشكلة، حمل الاساسيات بس
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
          return caches.delete(k);
        }
      })
    )).then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  let url = new URL(e.request.url);
  let request = e.request;
  
  // شيل الـ ?v= و ?t= من ملفات الليفلات عشان الكاش يشتغل اوفلاين
  if(url.pathname.includes('/level/') || url.pathname.includes('/audio/')){
    // اعمل request جديد من غير query params
    let cleanUrl = url.origin + url.pathname;
    // حاول تجيب من الكاش ب ignoreSearch
    e.respondWith(
      caches.match(cleanUrl, {ignoreSearch: true}).then(cached => {
        if(cached) return cached;
        return caches.match(e.request, {ignoreSearch: true}).then(c2 => {
          if(c2) return c2;
          return fetch(e.request).then(res => {
            if(res.ok){
              let clone = res.clone();
              caches.open(CACHE_NAME).then(cache => cache.put(cleanUrl, clone));
              if(url.pathname.includes('/audio/') || url.pathname.endsWith('.mp3')){
                caches.open('audio-levels-v2').then(c => c.put(cleanUrl, res.clone()));
              }
            }
            return res;
          }).catch(()=>{
            return caches.match(cleanUrl, {ignoreSearch: true});
          });
        });
      })
    );
    return;
  }

  // باقي الملفات: Cache first
  e.respondWith(
    caches.match(request, {ignoreSearch: true}).then(cached => {
      if(cached) return cached;
      return fetch(request).then(res => {
        // خزن ملفات المشروع فقط
        if(res.ok && (url.pathname.endsWith('.js') || url.pathname.endsWith('.css') || url.pathname.endsWith('.html') || url.pathname.endsWith('.png'))){
          let clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return res;
      }).catch(()=> {
        // لو مفيش نت رجع index
        if(request.destination === 'document'){
          return caches.match('./index.html');
        }
      });
    })
  );
});
