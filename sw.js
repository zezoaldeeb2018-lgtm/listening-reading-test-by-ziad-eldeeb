
const CACHE_APP = 'eldeeb-app-v21';
const CACHE_LEVELS = 'eldeeb-levels-v17';
const CACHE_AUDIO = 'eldeeb-audio-v3';

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
    await Promise.all(keys.map(k=>{
      if(k.startsWith('eldeeb-app-') && k!==CACHE_APP) return caches.delete(k);
      if(k.startsWith('audio-levels-') || k.startsWith('audio-')) return caches.delete(k);
      if(k.startsWith('eldeeb-audio-') && k!==CACHE_AUDIO) return caches.delete(k);
      if(k.startsWith('eldeeb-levels-') && k!==CACHE_LEVELS) return caches.delete(k);
      return null;
    }));
    self.clients.claim();
  })());
});

async function handleRangeRequest(request, cachedResponse){
  const rangeHeader = request.headers.get('Range');
  if(!rangeHeader) return cachedResponse;
  const m = rangeHeader.match(/bytes=(\d*)-(\d*)/);
  if(!m) return cachedResponse;
  const buffer = await cachedResponse.clone().arrayBuffer();
  const total = buffer.byteLength;
  let start = m[1] ? parseInt(m[1]) : 0;
  let end = m[2] ? parseInt(m[2]) : total - 1;
  if(start >= total) start = 0;
  if(end >= total) end = total - 1;
  const sliced = buffer.slice(start, end+1);
  return new Response(sliced, {
    status: 206,
    statusText: 'Partial Content',
    headers: {
      'Content-Type': cachedResponse.headers.get('content-type') || 'audio/mpeg',
      'Content-Length': (end-start+1).toString(),
      'Content-Range': `bytes ${start}-${end}/${total}`,
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
      if(cached && e.request.headers.has('Range')) return handleRangeRequest(e.request, cached);
      if(cached) return cached;
      try{
        const res = await fetch(e.request);
        if(res.ok && !e.request.headers.has('Range')) cache.put(e.request, res.clone());
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
      if(e.request.destination==='document') return caches.match('./index.html') || caches.match('./');
    }
  })());
});

