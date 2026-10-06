/* CRISTARIVA — service worker v47 — format du tirage légèrement remonté. */
const CACHE_NAME='cristariva-v118-20261006-format-up-r13';
const APP_VERSION='2026.10.06-format-up-r13';
const IMMERSIVE_URL='./immersive-reading-ui.js?v=20261006-format-up-r13';
const TAROT_INTEGRATION_URL='./tarot-divinatoire-integration-v78.js?v=20261006-reversal-cartouche-r2';
const SHELL=[
  './',
  './index.html',
  IMMERSIVE_URL,
  './story-quality.js?v=3-card-name-context',
  './groq-hybrid-story.js?v=5-external-diagnostics',
  './manifest.webmanifest',
  './manifest-en.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './story-fluid-v5.1.js?v=5.30',
  './tarot-reversals.js?v=20260929-r2',
  './universal-fluid-story-v6.3.js?v=6.49-unicode-r1',
  './question-context-story-v5.2.js?v=5.2.2',
  './question-intent-story-v5.3.js?v=5.6',
  './question-project-story-v5.5.js?v=5.21',
  './oracle-selection.js?v=20261003-domains-restored-r1',
  './oracle-amour-data.js?v=20260923-love-story6',
  './oracle-amour-card62-fix.js?v=20260923-love-story6',
  './oracle-amour-integration.js?v=20260923-love-story6',
  './oracle-amour-compat.js?v=20260923-love-story6',
  './tarot-divinatoire-data.js?v=20260924-tarot78-base-r9',
  './tarot-divinatoire-integration.js?v=20260924-tarot78-r4-compat',
  './tarot-title-image-hotfix.js?v=20260928-tarot78-png-r1',
  TAROT_INTEGRATION_URL,
  './tarot-minor-sprite-loader.js?v=20260926-minor-hd-r1',
  './tarot-minors-data-batons.js?v=20260924-tarot78-r9',
  './tarot-minors-data-coupes.js?v=20260924-tarot78-r9',
  './tarot-minors-data-epees.js?v=20260924-tarot78-r9',
  './tarot-minors-data-deniers.js?v=20260924-tarot78-r9',
  './tarot-minors-v1.js?v=20260924-tarot78-r9',
  './relation-astrology.js?v=20261002-cross-analysis-restore-r1'
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
        if(client.url){
          const target=new URL(client.url);
          target.searchParams.set('crv',APP_VERSION);
          await client.navigate(target.href);
        }
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

  if(url.pathname.endsWith('/immersive-reading-ui.js')){
    const forced=new Request(new URL(IMMERSIVE_URL,self.location.href),{cache:'no-store',credentials:'same-origin'});
    event.respondWith(networkFirst(forced));
    return;
  }

  if(url.pathname.endsWith('/tarot-divinatoire-integration-v78.js')){
    const forced=new Request(new URL(TAROT_INTEGRATION_URL,self.location.href),{cache:'no-store',credentials:'same-origin'});
    event.respondWith(networkFirst(forced));
    return;
  }

  if(/\.(?:js|html|json|webmanifest)$/.test(url.pathname)||url.pathname.includes('.cristariva-tarot78-sprite/')){
    event.respondWith(networkFirst(request));
    return;
  }

  if(url.pathname.includes('/cards/tarot/cartes%20mineures%20HD/') || url.pathname.includes('/cards/tarot/cartes mineures HD/')){
    event.respondWith(networkFirst(request));
    return;
  }

  if(url.pathname.includes('/cards/')){
    event.respondWith(networkFirst(request));
    return;
  }

  if(/\.(?:webp|png|jpg|jpeg|svg|ico)$/.test(url.pathname)){
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(networkFirst(request));
});