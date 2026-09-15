const APP_VERSION='2026.09.15-51';
const CACHE_NAME='cristariva-v51-20260915-desire-intent-story-531';
const SHELL=['./','./index.html','./manifest.webmanifest','./manifest-en.webmanifest','./icon-192.png','./icon-512.png','./interpretation-engine-v2.js','./natal-influences-v3.1.js','./period-overview-v3.2.js','./integrated-period-reading-v3.3.js','./natal-profile-v3.4.js','./natal-special-plain-v3.4.2.js','./synthesis-cleanup-v3.5.2.js','./synthesis-french-fix-v3.6.3.js','./story-conclusion-v3.6.js','./validated-card-titles-v3.6.3.js','./story-narrative-v4.js','./story-fluid-v5.1.js','./question-context-story-v5.2.js','./question-intent-story-v5.3.js','./period-windows-v3.7.js','./period-window-limit-v3.8.js','./peak-label-fix-v3.9.2.js','./trigger-date-guard-v3.9.7.js','./cards/014.webp','./cards/024.webp','./cards/109.webp'];
const ENGINE_TAG='<script src="./interpretation-engine-v2.js?v=3.0"></script><script src="./natal-influences-v3.1.js?v=3.1"></script><script src="./period-overview-v3.2.js?v=3.2"></script><script src="./integrated-period-reading-v3.3.js?v=3.5.1"></script><script src="./natal-profile-v3.4.js?v=3.4.1"></script><script src="./natal-special-plain-v3.4.2.js?v=3.4.2"></script><script src="./synthesis-cleanup-v3.5.2.js?v=3.6.3"></script><script src="./synthesis-french-fix-v3.6.3.js?v=3.6.3"></script><script src="./story-conclusion-v3.6.js?v=3.6.2"></script><script src="./validated-card-titles-v3.6.3.js?v=3.6.3"></script><script src="./story-narrative-v4.js?v=5.0"></script><script src="./story-fluid-v5.1.js?v=5.1"></script><script src="./question-context-story-v5.2.js?v=5.2"></script><script src="./question-intent-story-v5.3.js?v=5.3.1"></script><script src="./period-windows-v3.7.js?v=3.7"></script><script src="./period-window-limit-v3.8.js?v=3.9.1"></script><script src="./peak-label-fix-v3.9.2.js?v=3.9.4"></script><script src="./trigger-date-guard-v3.9.7.js?v=3.9.7"></script>';
const LAYOUT_FIX='<style id="cristariva-layout-fix">.reading-start + .home-links{margin:18px auto 70px!important}#drawCards:has(> .card:only-child){grid-template-columns:minmax(0,220px)!important;justify-content:center!important}#drawCards>.card:only-child{width:100%;max-width:220px;justify-self:center}@media(max-width:800px){.reading-start + .home-links{margin:14px auto 42px!important}#drawCards:has(> .card:only-child){grid-template-columns:minmax(0,190px)!important}#drawCards>.card:only-child{max-width:190px}}</style>';

async function pageWithAstroEngine(response){
  if(!response)return response;
  const type=response.headers.get('content-type')||'';
  if(!type.includes('text/html'))return response;
  let html=await response.text();

  html=html.replace(/<script src="\.\/integrated-period-reading-v3\.3\.js\?v=[^"]+"><\/script>/g,'<script src="./integrated-period-reading-v3.3.js?v=3.5.1"></script>');
  html=html.replace(/<script src="\.\/natal-profile-v3\.4\.js\?v=[^"]+"><\/script>/g,'<script src="./natal-profile-v3.4.js?v=3.4.1"></script>');
  html=html.replace(/<script src="\.\/natal-special-plain-v3\.4\.2\.js\?v=[^"]+"><\/script>/g,'<script src="./natal-special-plain-v3.4.2.js?v=3.4.2"></script>');
  html=html.replace(/<script src="\.\/synthesis-cleanup-v3\.5\.2\.js\?v=[^"]+"><\/script>/g,'<script src="./synthesis-cleanup-v3.5.2.js?v=3.6.3"></script>');
  html=html.replace(/<script src="\.\/synthesis-french-fix-v3\.6\.3\.js\?v=[^"]+"><\/script>/g,'<script src="./synthesis-french-fix-v3.6.3.js?v=3.6.3"></script>');
  html=html.replace(/<script src="\.\/story-conclusion-v3\.6\.js\?v=[^"]+"><\/script>/g,'<script src="./story-conclusion-v3.6.js?v=3.6.2"></script>');
  html=html.replace(/<script src="\.\/validated-card-titles-v3\.6\.3\.js\?v=[^"]+"><\/script>/g,'<script src="./validated-card-titles-v3.6.3.js?v=3.6.3"></script>');
  html=html.replace(/<script src="\.\/story-narrative-v4\.js\?v=[^"]+"><\/script>/g,'<script src="./story-narrative-v4.js?v=5.0"></script>');
  html=html.replace(/<script src="\.\/story-fluid-v5\.1\.js\?v=[^"]+"><\/script>(?:<script src="\.\/question-context-story-v5\.2\.js\?v=[^"]+"><\/script>)?(?:<script src="\.\/question-intent-story-v5\.3\.js\?v=[^"]+"><\/script>)?/g,'<script src="./story-fluid-v5.1.js?v=5.1"></script><script src="./question-context-story-v5.2.js?v=5.2"></script><script src="./question-intent-story-v5.3.js?v=5.3.1"></script>');
  html=html.replace(/<script src="\.\/period-windows-v3\.7\.js\?v=[^"]+"><\/script>/g,'<script src="./period-windows-v3.7.js?v=3.7"></script>');
  html=html.replace(/<script src="\.\/period-window-limit-v3\.8\.js\?v=[^"]+"><\/script>/g,'<script src="./period-window-limit-v3.8.js?v=3.9.1"></script>');
  html=html.replace(/<script src="\.\/peak-label-fix-v3\.9\.2\.js\?v=[^"]+"><\/script>/g,'<script src="./peak-label-fix-v3.9.2.js?v=3.9.4"></script><script src="./trigger-date-guard-v3.9.7.js?v=3.9.7"></script>');

  if(!html.includes('cristariva-layout-fix')){
    html=html.replace('</head>',LAYOUT_FIX+'</head>');
  }

  if(!html.includes('interpretation-engine-v2.js')){
    html=html.replace('</body>',ENGINE_TAG+'</body>');
  }else{
    if(!html.includes('natal-influences-v3.1.js'))html=html.replace('</body>','<script src="./natal-influences-v3.1.js?v=3.1"></script></body>');
    if(!html.includes('period-overview-v3.2.js'))html=html.replace('</body>','<script src="./period-overview-v3.2.js?v=3.2"></script></body>');
    if(!html.includes('integrated-period-reading-v3.3.js?v=3.5.1'))html=html.replace('</body>','<script src="./integrated-period-reading-v3.3.js?v=3.5.1"></script></body>');
    if(!html.includes('natal-profile-v3.4.js?v=3.4.1'))html=html.replace('</body>','<script src="./natal-profile-v3.4.js?v=3.4.1"></script></body>');
    if(!html.includes('natal-special-plain-v3.4.2.js?v=3.4.2'))html=html.replace('</body>','<script src="./natal-special-plain-v3.4.2.js?v=3.4.2"></script></body>');
    if(!html.includes('synthesis-cleanup-v3.5.2.js?v=3.6.3'))html=html.replace('</body>','<script src="./synthesis-cleanup-v3.5.2.js?v=3.6.3"></script></body>');
    if(!html.includes('synthesis-french-fix-v3.6.3.js?v=3.6.3'))html=html.replace('</body>','<script src="./synthesis-french-fix-v3.6.3.js?v=3.6.3"></script></body>');
    if(!html.includes('story-conclusion-v3.6.js?v=3.6.2'))html=html.replace('</body>','<script src="./story-conclusion-v3.6.js?v=3.6.2"></script></body>');
    if(!html.includes('validated-card-titles-v3.6.3.js?v=3.6.3'))html=html.replace('</body>','<script src="./validated-card-titles-v3.6.3.js?v=3.6.3"></script></body>');
    if(!html.includes('story-narrative-v4.js?v=5.0'))html=html.replace('</body>','<script src="./story-narrative-v4.js?v=5.0"></script></body>');
    if(!html.includes('story-fluid-v5.1.js?v=5.1'))html=html.replace('</body>','<script src="./story-fluid-v5.1.js?v=5.1"></script></body>');
    if(!html.includes('question-context-story-v5.2.js'))html=html.replace('</body>','<script src="./question-context-story-v5.2.js?v=5.2"></script></body>');
    if(!html.includes('question-intent-story-v5.3.js'))html=html.replace('</body>','<script src="./question-intent-story-v5.3.js?v=5.3.1"></script></body>');
    if(!html.includes('period-windows-v3.7.js?v=3.7'))html=html.replace('</body>','<script src="./period-windows-v3.7.js?v=3.7"></script></body>');
    if(!html.includes('period-window-limit-v3.8.js?v=3.9.1'))html=html.replace('</body>','<script src="./period-window-limit-v3.8.js?v=3.9.1"></script></body>');
    if(!html.includes('peak-label-fix-v3.9.2.js?v=3.9.4'))html=html.replace('</body>','<script src="./peak-label-fix-v3.9.2.js?v=3.9.4"></script><script src="./trigger-date-guard-v3.9.7.js?v=3.9.7"></script></body>');
  }

  const headers=new Headers(response.headers);
  headers.delete('content-length');
  headers.set('content-type','text/html; charset=utf-8');
  return new Response(html,{status:response.status,statusText:response.statusText,headers});
}

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE_NAME);
    await Promise.allSettled(SHELL.map(url=>cache.add(new Request(url,{cache:'reload'}))));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith('cristariva-')&&k!==CACHE_NAME).map(k=>caches.delete(k)));
    await self.clients.claim();
    const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    windows.forEach(client=>client.postMessage({type:'CRISTARIVA_UPDATED',version:APP_VERSION}));
  })());
});

self.addEventListener('message',event=>{if(event.data==='SKIP_WAITING')self.skipWaiting();});

self.addEventListener('fetch',event=>{
  const request=event.request;
  const url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin)return;

  if(request.mode==='navigate'){
    event.respondWith((async()=>{
      try{
        const network=await fetch(request,{cache:'reload'});
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

  if(/\/(interpretation-engine-v2|natal-influences-v3\.1|period-overview-v3\.2|integrated-period-reading-v3\.3|natal-profile-v3\.4|natal-special-plain-v3\.4\.2|synthesis-cleanup-v3\.5\.2|synthesis-french-fix-v3\.6\.3|story-conclusion-v3\.6|validated-card-titles-v3\.6\.3|story-narrative-v4|story-fluid-v5\.1|question-context-story-v5\.2|question-intent-story-v5\.3|period-windows-v3\.7|period-window-limit-v3\.8|peak-label-fix-v3\.9\.2|trigger-date-guard-v3\.9\.7)\.js$/.test(url.pathname)){
    event.respondWith(
      fetch(request,{cache:'reload'}).then(response=>{
        if(response.ok){const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(request,copy));}
        return response;
      }).catch(()=>caches.match(request))
    );
    return;
  }

  if(/\/cards\/\d{3}\.webp$/.test(url.pathname)){
    event.respondWith(
      fetch(request,{cache:'reload'}).then(response=>{
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