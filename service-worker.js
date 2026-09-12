const CACHE_NAME='cristariva-modele-a-v3-20260912-card24';
const SHELL=['./','./index.html','./manifest.webmanifest','./manifest-en.webmanifest','./icon-192.png','./icon-512.png','./cards/024.new.b64'];

let card24BytesPromise=null;
async function getCard24Bytes(){
 if(card24BytesPromise)return card24BytesPromise;
 card24BytesPromise=(async()=>{
  const cached=await caches.match('./cards/024.new.b64');
  const response=cached||await fetch('./cards/024.new.b64',{cache:'no-store'});
  if(!response||!response.ok)throw new Error('Carte 24 indisponible');
  const b64=(await response.text()).trim();
  const binary=atob(b64);
  const bytes=new Uint8Array(binary.length);
  for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
  return bytes;
 })();
 return card24BytesPromise;
}

self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('cristariva-')&&k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});

self.addEventListener('message',event=>{if(event.data==='SKIP_WAITING')self.skipWaiting();});

self.addEventListener('fetch',event=>{
 const request=event.request;
 const url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin)return;

 if(url.pathname.endsWith('/cards/024.webp')){
  event.respondWith(getCard24Bytes().then(bytes=>new Response(bytes.slice(),{
   status:200,
   headers:{'Content-Type':'image/webp','Cache-Control':'no-store, max-age=0'}
  })).catch(()=>fetch(request)));
  return;
 }

 if(request.mode==='navigate'){
  event.respondWith(fetch(request).then(response=>{
   if(response.ok){const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(request,copy));}
   return response;
  }).catch(()=>caches.match(request).then(response=>response||caches.match('./index.html'))));
  return;
 }

 event.respondWith(caches.match(request).then(cached=>{
  if(cached)return cached;
  return fetch(request).then(response=>{
   if(response.ok){const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(request,copy));}
   return response;
  });
 }));
});
