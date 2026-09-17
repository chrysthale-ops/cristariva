/* CRISTARIVA — service worker Oracle Amour / domaine Sentimental — 17 septembre 2026 */
const CACHE_NAME='cristariva-oracle-amour-v2-20260917';
const LOVE_SCRIPTS=[
 './oracle-amour-cards-01-20.js?v=1.0',
 './oracle-amour-cards-21-40.js?v=1.0',
 './oracle-amour-cards-41-60.js?v=1.0',
 './oracle-amour-cards-61-80.js?v=1.0',
 './oracle-amour-data.js?v=1.1',
 './oracle-amour-integration.js?v=1.0',
 './oracle-amour-compat.js?v=1.0'
];
const SHELL=['./','./index.html','./manifest.webmanifest','./manifest-en.webmanifest','./icon-192.png','./icon-512.png',...LOVE_SCRIPTS];

async function injectOracleAmour(response){
  if(!response)return response;
  const type=response.headers.get('content-type')||'';
  if(!response.ok||!type.includes('text/html'))return response;
  const source=await response.text();
  if(source.includes('oracle-amour-integration.js')){
    return new Response(source,{status:response.status,statusText:response.statusText,headers:response.headers});
  }
  const tags=LOVE_SCRIPTS.map(src=>`<script src="${src}"></script>`).join('');
  const html=source.replace('</body>',tags+'</body>');
  const headers=new Headers(response.headers);
  headers.delete('content-length');
  headers.delete('content-encoding');
  headers.set('x-cristariva-version','oracle-amour-v2-20260917');
  return new Response(html,{status:response.status,statusText:response.statusText,headers});
}

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith('cristariva-')&&k!==CACHE_NAME).map(k=>caches.delete(k)));
    await self.clients.claim();
    const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    for(const client of clients){
      try{await client.navigate(client.url);}catch(e){}
    }
  })());
});

self.addEventListener('fetch',event=>{
  const request=event.request;
  const url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin)return;

  if(request.mode==='navigate'){
    event.respondWith((async()=>{
      try{
        const net=await fetch(request,{cache:'no-store'});
        const enhanced=await injectOracleAmour(net);
        if(enhanced&&enhanced.ok){
          const copy=enhanced.clone();
          caches.open(CACHE_NAME).then(cache=>cache.put('./index.html',copy));
        }
        return enhanced;
      }catch(e){
        const cached=await caches.match('./index.html');
        return cached?injectOracleAmour(cached):Response.error();
      }
    })());
    return;
  }

  event.respondWith((async()=>{
    const cached=await caches.match(request,{ignoreSearch:true});
    if(cached)return cached;
    try{
      const net=await fetch(request);
      if(net&&net.ok){
        const copy=net.clone();
        caches.open(CACHE_NAME).then(cache=>cache.put(request,copy));
      }
      return net;
    }catch(e){
      return cached||Response.error();
    }
  })());
});
