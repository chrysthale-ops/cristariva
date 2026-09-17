/* CRISTARIVA — service worker v5 — Android/Web stable, 17 septembre 2026.
   L'Oracle Amour est désormais chargé directement par relation-astrology.js :
   le service worker ne modifie plus le HTML ni le JavaScript à la volée. */
const CACHE_NAME='cristariva-v5-20260917';
const SHELL=[
 './','./index.html','./manifest.webmanifest','./manifest-en.webmanifest','./icon-192.png','./icon-512.png',
 './relation-astrology.js','./relation-astrology-core-v1.4.js',
 './oracle-amour-images-01-05.js','./oracle-amour-images-06-10.js',
 './oracle-amour-cards-01-20.js','./oracle-amour-cards-21-40.js','./oracle-amour-cards-41-60.js','./oracle-amour-cards-61-80.js',
 './oracle-amour-data.js','./oracle-amour-integration.js','./oracle-amour-compat.js'
];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});

self.addEventListener('message',event=>{
  if(event.data==='SKIP_WAITING'||event.data?.type==='SKIP_WAITING')self.skipWaiting();
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith('cristariva-')&&k!==CACHE_NAME).map(k=>caches.delete(k)));
    await self.clients.claim();
    const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    for(const client of clients){
      try{client.postMessage({type:'CRISTARIVA_UPDATED',version:'2026.09.17-v5'});}catch(e){}
    }
  })());
});

async function networkFirst(request){
  try{
    const response=await fetch(request,{cache:'no-store'});
    if(response&&response.ok){
      const copy=response.clone();
      caches.open(CACHE_NAME).then(cache=>cache.put(request,copy));
    }
    return response;
  }catch(e){
    return (await caches.match(request,{ignoreSearch:true}))||Response.error();
  }
}

self.addEventListener('fetch',event=>{
  const request=event.request;
  const url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin)return;

  if(request.mode==='navigate'){
    event.respondWith(networkFirst(request));
    return;
  }

  /* Les fichiers applicatifs doivent suivre les mises à jour immédiatement sur Android. */
  if(/\.(?:js|html|webmanifest)$/.test(url.pathname)){
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith((async()=>{
    const cached=await caches.match(request,{ignoreSearch:true});
    if(cached)return cached;
    try{
      const response=await fetch(request);
      if(response&&response.ok){
        const copy=response.clone();
        caches.open(CACHE_NAME).then(cache=>cache.put(request,copy));
      }
      return response;
    }catch(e){
      return Response.error();
    }
  })());
});
