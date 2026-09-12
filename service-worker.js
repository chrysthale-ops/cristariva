const CACHE_NAME='cristariva-interpretation-v2-20260912-2';
const ENGINE_SCRIPT='./interpretation-engine-v2.js';
const SHELL=['./','./index.html',ENGINE_SCRIPT,'./manifest.webmanifest','./manifest-en.webmanifest','./icon-192.png','./icon-512.png'];
async function injectInterpretationEngine(response){
 if(!response)return response;
 const contentType=response.headers.get('content-type')||'';
 if(!response.ok||contentType.indexOf('text/html')<0)return response;
 const source=await response.text();
 const tag='<script src="'+ENGINE_SCRIPT+'"></script>';
 const html=source.indexOf('interpretation-engine-v2.js')>=0?source:source.replace('</body>',tag+'</body>');
 const headers=new Headers(response.headers);
 headers.delete('content-length');
 headers.delete('content-encoding');
 return new Response(html,{status:response.status,statusText:response.statusText,headers:headers});
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
 if(request.mode==='navigate'){
  event.respondWith(fetch(request).then(async response=>{
   const enhanced=await injectInterpretationEngine(response);
   if(enhanced&&enhanced.ok){const copy=enhanced.clone();caches.open(CACHE_NAME).then(cache=>cache.put(request,copy));}
   return enhanced;
  }).catch(async()=>{
   const cached=await caches.match(request)||await caches.match('./index.html');
   return cached?injectInterpretationEngine(cached):Response.error();
  }));
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
