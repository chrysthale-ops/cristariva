/* CRISTARIVA — service worker Oracle Amour / domaine Sentimental — correctif Android 17 septembre 2026 */
const CACHE_NAME='cristariva-oracle-amour-v4-20260917';
const LOVE_SCRIPTS=[
 './oracle-amour-images-01-05.js?v=1.0',
 './oracle-amour-images-06-10.js?v=1.0',
 './oracle-amour-cards-01-20.js?v=3.0',
 './oracle-amour-cards-21-40.js?v=3.0',
 './oracle-amour-cards-41-60.js?v=3.0',
 './oracle-amour-cards-61-80.js?v=3.0',
 './oracle-amour-data.js?v=3.0',
 './oracle-amour-integration.js?v=3.0',
 './oracle-amour-compat.js?v=3.0'
];
const SHELL=['./','./index.html','./manifest.webmanifest','./manifest-en.webmanifest','./icon-192.png','./icon-512.png',...LOVE_SCRIPTS];

function responseWithText(response,text,version){
  const headers=new Headers(response.headers);
  headers.delete('content-length');
  headers.delete('content-encoding');
  if(version)headers.set('x-cristariva-version',version);
  return new Response(text,{status:response.status,statusText:response.statusText,headers});
}

async function injectOracleAmour(response){
  if(!response)return response;
  const type=response.headers.get('content-type')||'';
  if(!response.ok||!type.includes('text/html'))return response;
  const source=await response.text();
  if(source.includes('oracle-amour-integration.js')){
    return responseWithText(response,source,'oracle-amour-v4-20260917');
  }
  const tags=LOVE_SCRIPTS.map(src=>`<script src="${src}"></script>`).join('');
  const html=source.replace('</body>',tags+'</body>');
  return responseWithText(response,html,'oracle-amour-v4-20260917');
}

function androidBootstrap(){
  const files=LOVE_SCRIPTS;
  return `\n/* CRISTARIVA Android bootstrap Oracle Amour */\n(function(){\n if(window.__CRISTARIVA_LOVE_BOOTSTRAP__)return;\n window.__CRISTARIVA_LOVE_BOOTSTRAP__=true;\n const files=${JSON.stringify(files)};\n const load=(src)=>new Promise((resolve,reject)=>{\n   if([...document.scripts].some(s=>s.src&&s.src.includes(src.split('?')[0].replace('./',''))))return resolve();\n   const el=document.createElement('script');el.src=src;el.async=false;el.onload=resolve;el.onerror=reject;document.body.appendChild(el);\n });\n (async()=>{for(const src of files){try{await load(src);}catch(e){console.error('CRISTARIVA Oracle Amour',src,e);}}})();\n})();\n`;
}

async function injectBootstrapIntoExistingScript(response,url){
  if(!response||!response.ok)return response;
  if(!url.pathname.endsWith('/relation-astrology.js'))return response;
  const type=response.headers.get('content-type')||'';
  if(type&&!type.includes('javascript')&&!type.includes('text/plain'))return response;
  const source=await response.text();
  if(source.includes('__CRISTARIVA_LOVE_BOOTSTRAP__'))return responseWithText(response,source,'oracle-amour-v4-20260917');
  return responseWithText(response,source+androidBootstrap(),'oracle-amour-v4-20260917');
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

  if(url.pathname.endsWith('/relation-astrology.js')){
    event.respondWith((async()=>{
      try{
        const net=await fetch(request,{cache:'no-store'});
        return injectBootstrapIntoExistingScript(net,url);
      }catch(e){
        const cached=await caches.match(request,{ignoreSearch:true});
        return cached?injectBootstrapIntoExistingScript(cached,url):Response.error();
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
