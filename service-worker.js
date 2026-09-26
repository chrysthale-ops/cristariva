/* CRISTARIVA — service worker v29 — récit professionnel développé.
   Force 22 arcanes majeurs + 56 arcanes mineurs HD sur PC et Android
   et recharge la planche validée complète des arcanes mineurs. */
const CACHE_NAME='cristariva-v29-20260926-story-length';
const APP_VERSION='2026.09.26-story-length';
const SHELL=[
  './',
  './index.html',
  './manifest.webmanifest',
  './manifest-en.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './story-fluid-v5.1.js?v=5.30',
  './question-context-story-v5.2.js?v=5.2.2',
  './question-intent-story-v5.3.js?v=5.6',
  './question-project-story-v5.5.js?v=5.21',
  './oracle-selection.js?v=20260923-tarot-story61',
  './oracle-amour-data.js?v=20260923-love-story6',
  './oracle-amour-card62-fix.js?v=20260923-love-story6',
  './oracle-amour-integration.js?v=20260923-love-story6',
  './oracle-amour-compat.js?v=20260923-love-story6',
  './tarot-divinatoire-data.js?v=20260924-tarot78-base-r9',
  './tarot-divinatoire-integration.js?v=20260924-tarot78-r4-compat',
  './tarot-title-image-hotfix.js?v=20260924-tarot78-r9',
  './tarot-divinatoire-integration-v78.js?v=20260924-tarot78-r9',
  './tarot-minor-sprite-loader.js?v=20260924-tarot78-r9',
  './tarot-minors-data-batons.js?v=20260924-tarot78-r9',
  './tarot-minors-data-coupes.js?v=20260924-tarot78-r9',
  './tarot-minors-data-epees.js?v=20260924-tarot78-r9',
  './tarot-minors-data-deniers.js?v=20260924-tarot78-r9',
  './tarot-minors-v1.js?v=20260924-tarot78-r9',
  './.cristariva-tarot78-sprite/part-00a?v=20260924-r9',
  './.cristariva-tarot78-sprite/part-00b?v=20260924-r9',
  './.cristariva-tarot78-sprite/part-00c?v=20260924-r9',
  './.cristariva-tarot78-sprite/part-01?v=20260924-r9',
  './.cristariva-tarot78-sprite/part-02?v=20260924-r9',
  './.cristariva-tarot78-sprite/part-03?v=20260924-r9',
  './.cristariva-tarot78-sprite/part-04?v=20260924-r9',
  './.cristariva-tarot78-sprite/part-05?v=20260924-r9',
  './.cristariva-tarot78-sprite/part-06?v=20260924-r9',
  './.cristariva-tarot78-sprite/part-07?v=20260924-r9',
  './relation-astrology.js?v=20260923-relation-button'
];

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE_NAME);
    for(const url of SHELL){
      try{await cache.add(new Request(url,{cache:'reload'}));}catch(e){}
    }
    await self.skipWaiting();
  })());
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
        client.postMessage({type:'CRISTARIVA_UPDATED',version:APP_VERSION});
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
      caches.open(CACHE_NAME).then(cache=>cache.put(request,copy)).catch(()=>{});
    }
    return response;
  }catch(e){
    return (await caches.match(request,{ignoreSearch:true}))||Response.error();
  }
}

async function cacheFirst(request){
  const cached=await caches.match(request,{ignoreSearch:true});
  if(cached)return cached;
  try{
    const response=await fetch(request);
    if(response&&response.ok){
      const copy=response.clone();
      caches.open(CACHE_NAME).then(cache=>cache.put(request,copy)).catch(()=>{});
    }
    return response;
  }catch(e){return Response.error();}
}

self.addEventListener('fetch',event=>{
  const request=event.request;
  const url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin)return;

  if(request.mode==='navigate'){
    event.respondWith(networkFirst(request));
    return;
  }

  if(/\.(?:js|html|json|webmanifest)$/.test(url.pathname)||url.pathname.includes('.cristariva-tarot78-sprite/')){
    event.respondWith(networkFirst(request));
    return;
  }

  if(/\.(?:webp|png|jpg|jpeg|svg|ico)$/.test(url.pathname)){
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(networkFirst(request));
});
