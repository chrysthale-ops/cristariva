const CACHE_NAME='cristariva-modele-a-v21-20260914-astro-v3-4';
const SHELL=['./','./index.html','./manifest.webmanifest','./manifest-en.webmanifest','./icon-192.png','./icon-512.png','./interpretation-engine-v2.js','./natal-influences-v3.1.js','./period-overview-v3.2.js','./integrated-period-reading-v3.3.js','./natal-profile-v3.4.js','./cards/024.webp','./cards/109.webp'];
const ENGINE_TAG='<script src="./interpretation-engine-v2.js?v=3.0"></script><script src="./natal-influences-v3.1.js?v=3.1"></script><script src="./period-overview-v3.2.js?v=3.2"></script><script src="./integrated-period-reading-v3.3.js?v=3.3"></script><script src="./natal-profile-v3.4.js?v=3.4"></script>';

async function pageWithAstroEngine(response){
  if(!response)return response;
  const type=response.headers.get('content-type')||'';
  if(!type.includes('text/html'))return response;
  let html=await response.text();
  if(!html.includes('interpretation-engine-v2.js'))html=html.replace('</body>',ENGINE_TAG+'</body>');
  else{
    if(!html.includes('natal-influences-v3.1.js'))html=html.replace('</body>','<script src="./natal-influences-v3.1.js?v=3.1"></script></body>');
    if(!html.includes('period-overview-v3.2.js'))html=html.replace('</body>','<script src="./period-overview-v3.2.js?v=3.2"></script></body>');
    if(!html.includes('integrated-period-reading-v3.3.js'))html=html.replace('</body>','<script src="./integrated-period-reading-v3.3.js?v=3.3"></script></body>');
    if(!html.includes('natal-profile-v3.4.js'))html=html.replace('</body>','<script src="./natal-profile-v3.4.js?v=3.4"></script></body>');
  }
  const headers=new Headers(response.headers);
  headers.delete('content-length');
  headers.set('content-type','text/html; charset=utf-8');
  return new Response(html,{status:response.status,statusText:response.statusText,headers});
}

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k.startsWith('cristariva-')&&k!==CACHE_NAME).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('message',event=>{if(event.data==='SKIP_WAITING')self.skipWaiting();});

self.addEventListener('fetch',event=>{
  const request=event.request;
  const url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin)return;

  if(request.mode==='navigate'){
    event.respondWith((async()=>{
      try{
        const network=await fetch(request,{cache:'no-cache'});
        const transformed=await pageWithAstroEngine(network);
        if(transformed?.ok){const copy=transformed.clone();caches.open(CACHE_NAME).then(cache=>cache.put(request,copy));}
        return transformed;
      }catch(e){
        const cached=await caches.match(request)||await caches.match('./index.html');
        return pageWithAstroEngine(cached);
      }
    })());
    return;
  }

  if(/\/cards\/\d{3}\.webp$/.test(url.pathname)){
    event.respondWith(
      fetch(request,{cache:'no-cache'}).then(response=>{
        if(response.ok){const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(request,copy));}
        return response;
      }).catch(()=>caches.match(request))
    );
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