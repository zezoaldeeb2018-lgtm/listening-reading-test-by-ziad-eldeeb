
// sw.js - v20 - بيمسح الكاشات القديمة البايظة تلقائيا من كل يوزر
const CACHE_APP = 'eldeeb-app-v20';
const CACHE_LEVELS = 'eldeeb-levels-v17';
const CACHE_AUDIO = 'eldeeb-audio-v3'; // v3 الجديد النضيف

const APP_SHELL = ['./','./index.html','./style.css','./app.js'];
const OPTIONAL_FILES = ['./manifest.json','./icon-192.png','./icon-512.png'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil((async()=>{
    const cache = await caches.open(CACHE_APP);
    for(let url of APP_SHELL){
      try{
        const res = await fetch(url,{cache:'no-store'});
        if(res.ok) await cache.put(url,res.clone());
      }catch{ try{await cache.add(url);}catch{} }
    }
    for(let url of OPTIONAL_FILES){
      try{
        const res = await fetch(url,{cache:'no-store'});
        if(res.ok) await cache.put(url,res.clone());
      }catch{}
    }
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async()=>{
    const keys = await caches.keys();
    // امسح اي كاش قديم بايظ تلقائيا من جهاز اليوزر
    await Promise.all(keys.map(k=>{
      // امسح اي app قديم
      if(k.startsWith('eldeeb-app-') && k!==CACHE_APP){
        console.log('SW v20: delete old app cache', k);
        return caches.delete(k);
      }
      // امسح اي audio قديم - ده المهم - كان اسمه audio-levels-v2 و eldeeb-audio-v2
      if(k.startsWith('audio-levels-') || k.startsWith('audio-')){
        console.log('SW v20: delete old buggy audio cache', k);
        return caches.delete(k);
      }
      if(k.startsWith('eldeeb-audio-') && k!==CACHE_AUDIO){
        console.log('SW v20: delete old audio cache', k);
        return caches.delete(k);
      }
      // امسح ليفلات قديمة جدا
      if(k.startsWith('eldeeb-levels-') && k!==CACHE_LEVELS && k!=='eldeeb-levels-v15'){
        return caches.delete(k);
      }
      return null;
    }));
    
    // امسح localStorage flags البايظة؟ لا نقدر من SW، هنعملها من app.js
    // بس نبلغ كل الصفحات ان فيه تحديث
    self.clients.claim();
    const clients = await self.clients.matchAll();
    clients.forEach(c=>c.postMessage({type:'SW_UPDATED', version:'v20'}));
  })());
});

// دعم Range للاندرويد اوفلاين
async function handleRangeRequest(request, cachedResponse){
  const rangeHeader = request.headers.get('Range');
  if(!rangeHeader) return cachedResponse;
  const match = rangeHeader.match(/bytes=(\d*)-(\d*)/);
  if(!match) return cachedResponse;
  const buffer = await cachedResponse.clone().arrayBuffer();
  const realTotal = buffer.byteLength;
  let start = match[1] ? parseInt(match[1]) : 0;
  let end = match[2] ? parseInt(match[2]) : realTotal - 1;
  if(start >= realTotal) start = 0;
  if(end >= realTotal) end = realTotal - 1;
  const sliced = buffer.slice(start, end+1);
  return new Response(sliced, {
    status: 206,
    statusText: 'Partial Content',
    headers: {
      'Content-Type': cachedResponse.headers.get('content-type') || 'audio/mpeg',
      'Content-Length': (end-start+1).toString(),
      'Content-Range': `bytes ${start}-${end}/${realTotal}`,
      'Accept-Ranges': 'bytes'
    }
  });
}

self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  const url = e.request.url;
  if(!url.startsWith(self.location.origin)) return;

  if(url.includes('/audio/') || url.endsWith('.mp3')){
    e.respondWith((async()=>{
      const cache = await caches.open(CACHE_AUDIO);
      const cached = await cache.match(e.request, {ignoreSearch:true});
      if(cached && e.request.headers.has('Range')){
        return handleRangeRequest(e.request, cached);
      }
      if(cached) return cached;
      try{
        const res = await fetch(e.request);
        if(res.ok && !e.request.headers.has('Range')){
          cache.put(e.request, res.clone());
        }
        return res;
      }catch{
        if(cached) return cached;
        return new Response('offline', {status: 504});
      }
    })());
    return;
  }

  if(url.includes('/level/')){
    e.respondWith((async()=>{
      try{
        const res = await fetch(e.request,{cache:'no-store'});
        if(res.ok){
          const cache = await caches.open(CACHE_LEVELS);
          cache.put(e.request, res.clone());
        }
        return res;
      }catch{
        const cached = await caches.match(e.request,{ignoreSearch:true});
        if(cached) return cached;
        const cache = await caches.open(CACHE_LEVELS);
        const keys = await cache.keys();
        const fileName = url.split('/').pop().split('?')[0];
        for(let k of keys){
          if(k.url.includes(fileName)){
            const m = await cache.match(k);
            if(m) return m;
          }
        }
        return new Response('offline',{status:504});
      }
    })());
    return;
  }

  e.respondWith((async()=>{
    try{
      const res = await fetch(e.request,{cache:'no-store'});
      if(res.ok){
        const cache = await caches.open(CACHE_APP);
        cache.put(e.request, res.clone());
      }
      return res;
    }catch{
      const cached = await caches.match(e.request,{ignoreSearch:true});
      if(cached) return cached;
      if(e.request.destination==='document'){
        return caches.match('./index.html') || caches.match('./');
      }
    }
  })());
});

