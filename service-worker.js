/* CRISTARIVA — service worker v10 — Android/Web stable, 21 septembre 2026.
   Force la mise à jour grammaticale des récits v5.19 et conserve
   l’Oracle Amour ainsi que la correction visuelle de la carte Relation 62. */
const CACHE_NAME='cristariva-v10-20260921-narrative-519';
const SHELL=[
 './',
 './index.html',
 './manifest.webmanifest',
 './manifest-en.webmanifest',
 './icon-192.png',
 './icon-512.png',
 './relation-astrology.js',
 './story-fluid-v5.1.js',
 './question-context-story-v5.2.js',
 './question-project-story-v5.5.js',
 './relation-astrology-core-v1.4.js',
 './relation-period-consistency-v1.5.js',
 './oracle-amour-data.js',
 './oracle-amour-card62-fix.js',
 './oracle-amour-integration.js',
 './oracle-amour-compat.js',
 './cards/amour/001.webp?v=20260918',
 './cards/amour/002.webp?v=20260918',
 './cards/amour/003.webp?v=20260918',
 './cards/amour/004.webp?v=20260918',
 './cards/amour/005.webp?v=20260918',
 './cards/amour/006.webp?v=20260918',
 './cards/amour/007.webp?v=20260918',
 './cards/amour/008.webp?v=20260918',
 './cards/amour/009.webp?v=20260918',
 './cards/amour/010.webp?v=20260918',
 './cards/amour/011.webp?v=20260918',
 './cards/amour/012.webp?v=20260918',
 './cards/amour/013.webp?v=20260918',
 './cards/amour/014.webp?v=20260918',
 './cards/amour/015.webp?v=20260918',
 './cards/amour/016.webp?v=20260918',
 './cards/amour/017.webp?v=20260918',
 './cards/amour/018.webp?v=20260918',
 './cards/amour/019.webp?v=20260918',
 './cards/amour/020.webp?v=20260918',
 './cards/amour/021.webp?v=20260918',
 './cards/amour/022.webp?v=20260918',
 './cards/amour/023.webp?v=20260918',
 './cards/amour/024.webp?v=20260918',
 './cards/amour/025.webp?v=20260918',
 './cards/amour/026.webp?v=20260918',
 './cards/amour/027.webp?v=20260918',
 './cards/amour/028.webp?v=20260918',
 './cards/amour/029.webp?v=20260918',
 './cards/amour/030.webp?v=20260918',
 './cards/amour/031.webp?v=20260918',
 './cards/amour/032.webp?v=20260918',
 './cards/amour/033.webp?v=20260918',
 './cards/amour/034.webp?v=20260918',
 './cards/amour/035.webp?v=20260918',
 './cards/amour/036.webp?v=20260918',
 './cards/amour/037.webp?v=20260918',
 './cards/amour/038.webp?v=20260918',
 './cards/amour/039.webp?v=20260918',
 './cards/amour/040.webp?v=20260918',
 './cards/amour/041.webp?v=20260918',
 './cards/amour/042.webp?v=20260918',
 './cards/amour/043.webp?v=20260918',
 './cards/amour/044.webp?v=20260918',
 './cards/amour/045.webp?v=20260918',
 './cards/amour/046.webp?v=20260918',
 './cards/amour/047.webp?v=20260918',
 './cards/amour/048.webp?v=20260918',
 './cards/amour/049.webp?v=20260918',
 './cards/amour/050.webp?v=20260918',
 './cards/amour/051.webp?v=20260918',
 './cards/amour/052.webp?v=20260918',
 './cards/amour/053.webp?v=20260918',
 './cards/amour/054.webp?v=20260918',
 './cards/amour/055.webp?v=20260918',
 './cards/amour/056.webp?v=20260918',
 './cards/amour/057.webp?v=20260918',
 './cards/amour/058.webp?v=20260918',
 './cards/amour/059.webp?v=20260918',
 './cards/amour/060.webp?v=20260918',
 './cards/amour/061.webp?v=20260918',
 './cards/amour/062.webp?v=20260919b',
 './cards/amour/063.webp?v=20260918',
 './cards/amour/064.webp?v=20260918',
 './cards/amour/065.webp?v=20260918',
 './cards/amour/066.webp?v=20260918',
 './cards/amour/067.webp?v=20260918',
 './cards/amour/068.webp?v=20260918',
 './cards/amour/069.webp?v=20260918',
 './cards/amour/070.webp?v=20260918',
 './cards/amour/071.webp?v=20260918',
 './cards/amour/072.webp?v=20260918',
 './cards/amour/073.webp?v=20260918',
 './cards/amour/074.webp?v=20260918',
 './cards/amour/075.webp?v=20260918',
 './cards/amour/076.webp?v=20260918',
 './cards/amour/077.webp?v=20260918',
 './cards/amour/078.webp?v=20260918',
 './cards/amour/079.webp?v=20260918',
 './cards/amour/080.webp?v=20260918'
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
      try{
        client.postMessage({type:'CRISTARIVA_UPDATED',version:'2026.09.21-narrative-519'});
        if(client.url)await client.navigate(client.url);
      }catch(e){}
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