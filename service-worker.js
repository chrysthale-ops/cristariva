/* CRISTARIVA — service worker v19 — moteur de récit synthétique v5.31. */
const CACHE_NAME='cristariva-v19-20260923-story-semantic';
const SHELL=[
 "./tarot-divinatoire-data.js?v=20260922-tarot32",
 "./tarot-divinatoire-integration.js?v=20260922-tarot32",
 "./tarot-title-image-hotfix.js?v=20260922-tarot32",
 "./cards/tarot/major-001.webp?v=20260922-tarot32",
 "./cards/tarot/major-002.webp?v=20260922-tarot32",
 "./cards/tarot/major-003.webp?v=20260922-tarot32",
 "./cards/tarot/major-004.webp?v=20260922-tarot32",
 "./cards/tarot/major-005.webp?v=20260922-tarot32",
 "./cards/tarot/major-006.webp?v=20260922-tarot32",
 "./cards/tarot/major-007.webp?v=20260922-tarot32",
 "./cards/tarot/major-008.webp?v=20260922-tarot32",
 "./cards/tarot/major-009.webp?v=20260922-tarot32",
 "./cards/tarot/major-010.webp?v=20260922-tarot32",
 "./cards/tarot/major-011.webp?v=20260922-tarot32",
 "./cards/tarot/major-012.webp?v=20260922-tarot32",
 "./cards/tarot/major-013.webp?v=20260922-tarot32",
 "./cards/tarot/major-014.webp?v=20260922-tarot32",
 "./cards/tarot/major-015.webp?v=20260922-tarot32",
 "./cards/tarot/major-016.webp?v=20260922-tarot32",
 "./cards/tarot/major-017.webp?v=20260922-tarot32",
 "./cards/tarot/major-018.webp?v=20260922-tarot32",
 "./cards/tarot/major-019.webp?v=20260922-tarot32",
 "./cards/tarot/major-020.webp?v=20260922-tarot32",
 "./cards/tarot/major-021.webp?v=20260922-tarot32",
 "./cards/tarot/major-022.webp?v=20260922-tarot32",
 "./cards/tarot/001.webp?v=20260922-tarot32",
 "./cards/tarot/002.webp?v=20260922-tarot32",
 "./cards/tarot/003.webp?v=20260922-tarot32",
 "./cards/tarot/004.webp?v=20260922-tarot32",
 "./cards/tarot/005.webp?v=20260922-tarot32",
 "./cards/tarot/006.webp?v=20260922-tarot32",
 "./cards/tarot/007.webp?v=20260922-tarot32",
 "./cards/tarot/008.webp?v=20260922-tarot32",
 "./cards/tarot/009.webp?v=20260922-tarot32",
 "./cards/tarot/010.webp?v=20260922-tarot32",
 './',
 './index.html',
 './oracle-selection.js?v=20260923',
 './manifest.webmanifest',
 './manifest-en.webmanifest',
 './icon-192.png',
 './icon-512.png',
 './relation-astrology.js?v=20260923-relation-button',
 './story-fluid-v5.1.js?v=5.30',
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

/* Patch sémantique ajouté au moteur actuel après chargement.
   Il ne reprend jamais les définitions : il transforme les titres en notions de synthèse. */
const STORY_SEMANTIC_PATCH=`
;(function(){
  var previous=typeof cr51Keywords==='function'?cr51Keywords:null;
  function norm(v){return String(v||'').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
  var fr={
    'dissimulation':['non-dits','zones d’ombre','besoin de transparence'],
    'origines':['racines du lien','schémas anciens','histoire commune'],
    'signe':['indices concrets','répétitions','comportements révélateurs'],
    'equilibre':['équilibre','réciprocité','juste échange'],
    'equite':['équilibre','juste répartition','réciprocité'],
    'complicite':['complicité','entente naturelle','plaisir partagé'],
    'liberte':['autonomie','espace personnel','liberté de chacun'],
    'retour':['reprise de contact','réapparition du passé','nouvelle lecture du lien'],
    'communication':['échanges directs','paroles claires','mise au point'],
    'clarte':['clarification','intentions lisibles','cohérence'],
    'reconciliation':['reprise du dialogue','apaisement','réparation du lien'],
    'amour':['sentiments','attachement','ouverture affective'],
    'peur':['craintes','besoin de sécurité','frein au rapprochement'],
    'regrets':['regrets','passé encore actif','désir de réparation'],
    'cycles':['schémas répétitifs','alternance','retour d’une ancienne dynamique'],
    'memoire':['souvenirs partagés','empreinte du passé','réactions anciennes'],
    'empreinte':['marque du passé','réactions persistantes','histoire encore active'],
    'reciprocite':['initiatives mutuelles','réponse de l’autre','équilibre des efforts'],
    'progression':['avancée concrète','échanges plus réguliers','construction progressive'],
    'blocage':['frein précis','immobilité','obstacle à clarifier'],
    'eloignement':['distance','retrait','baisse de proximité'],
    'juste distance':['proximité ajustée','limites respectées','autonomie'],
    'transformation':['changement de forme','nouveaux repères','redéfinition du lien'],
    'renouveau':['nouvel élan','seconde chance','fonctionnement différent'],
    'naissance':['nouveau départ','émergence','dynamique nouvelle'],
    'connexion':['connexion','compréhension mutuelle','envie de rapprochement'],
    'sincerite':['parole honnête','authenticité','cohérence entre mots et actes'],
    'mensonge':['vérité fragilisée','omissions','besoin de vérification'],
    'trahison':['confiance blessée','loyauté rompue','besoin de réparation'],
    'instabilite':['irrégularité','alternance de proximité et de retrait','manque de continuité'],
    'patience':['temps nécessaire','maturation','progression régulière'],
    'rythme':['tempo du lien','phases de rapprochement','maturation affective']
  };
  var en={
    'dissimulation':['unspoken issues','hidden elements','need for transparency'],
    'origines':['roots of the bond','older patterns','shared history'],
    'signe':['concrete clues','repeated facts','revealing behaviour'],
    'equilibre':['balance','reciprocity','fair exchange'],
    'complicite':['complicity','natural understanding','shared pleasure'],
    'liberte':['autonomy','personal space','freedom']
  };
  cr51Keywords=function(card,isEn){
    var name=norm(isEn?(card&&card.en&&card.en.name||card&&card.name):(card&&card.name));
    var map=isEn?en:fr;
    if(map[name])return map[name].slice();
    return previous?previous(card,isEn):[isEn?'evolution':'évolution'];
  };
  self.CRISTARIVA_STORY_SEMANTIC_PATCH='5.31';
})();
`;

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
        client.postMessage({type:'CRISTARIVA_UPDATED',version:'2026.09.23-story-semantic-v5.31'});
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

async function storyEngineResponse(request){
  let response=null;
  try{response=await fetch(request,{cache:'no-store'});}catch(e){}
  if(!response||!response.ok)response=await caches.match(request,{ignoreSearch:true});
  if(!response)return Response.error();
  try{
    const text=await response.text();
    const headers=new Headers(response.headers);
    headers.delete('content-length');
    headers.delete('content-encoding');
    return new Response(text+STORY_SEMANTIC_PATCH,{status:response.status,statusText:response.statusText,headers});
  }catch(e){return response;}
}

self.addEventListener('fetch',event=>{
  const request=event.request;
  const url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin)return;

  /* Même si index.html demande encore ?v=5.20, le navigateur reçoit le fichier actuel
     depuis le réseau et le patch sémantique v5.31. */
  if(url.pathname.endsWith('/story-fluid-v5.1.js')){
    event.respondWith(storyEngineResponse(request));
    return;
  }

  if(request.mode==='navigate'){
    event.respondWith(networkFirst(request));
    return;
  }

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