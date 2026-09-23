/* Domaine et jeu sont deux choix indépendants dans l'espace de tirage. */
(function(){
  'use strict';
  const domain=document.querySelector('#domain');
  const oracle=document.querySelector('#oracleChoice');
  if(!domain||!oracle)return;
  const love=oracle.querySelector('[value="amour"]');

  /*
   * Oracle Amour : les anciennes versions pouvaient encore construire
   * « L’histoire racontée par vos cartes » en concaténant les définitions.
   * Ce moteur, chargé après les autres couches narratives, synthétise
   * directement les cartes à partir de leur tonalité, de leurs mots-clés,
   * de leur position et de la question. Aucune définition n’est réutilisée.
   */
  const LOVE_STORY_VERSION='6.0';
  function esc(v){
    try{return typeof readingEscape==='function'?readingEscape(String(v??'')):String(v??'').replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
    catch(e){return String(v??'');}
  }
  function norm(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();}
  function tone(card){
    const c=norm(card?.category||'');
    if(/diffic|negativ|rupture|blocage|tension/.test(c))return 'negative';
    if(/positiv|favorable/.test(c))return 'positive';
    return 'nuanced';
  }
  function keywords(card){
    let raw=card?.keywords;
    if(Array.isArray(raw))return raw.filter(Boolean).slice(0,3);
    let a=String(raw||'').split(/[,;|]/).map(x=>x.trim()).filter(Boolean);
    if(!a.length)a=[String(card?.name||'évolution').toLowerCase()];
    return a.slice(0,3);
  }
  function join(a){
    a=(a||[]).filter(Boolean);
    if(!a.length)return 'l’évolution du lien';
    if(a.length===1)return a[0];
    if(a.length===2)return `${a[0]} et ${a[1]}`;
    return `${a.slice(0,-1).join(', ')} et ${a[a.length-1]}`;
  }
  function questionIntent(){
    const q=norm(state?.question||'');
    if(/nouvel|nouveau|nouvelle|prochain/.test(q)&&/rencontre|personne|amour|relation|crush/.test(q))return 'new';
    if(/rencontrer|faire une rencontre/.test(q))return 'new';
    if(/retour|revenir|revient|reprendre|reprise|recontact|retrouver|reconciliation|ex\b/.test(q))return 'return';
    if(/avenir|suite|evolution|devenir|futur/.test(q))return 'future';
    if(/pense|sentiment|ressent|aime|amour|attir/.test(q))return 'feelings';
    return 'general';
  }
  function stage(card,role){
    const k=join(keywords(card)),t=tone(card);
    if(role==='origin'){
      if(t==='negative')return `Au départ, le climat est marqué par ${k}. Cette première étape décrit surtout une fermeture, une attente ou une fragilité qui a ralenti le mouvement affectif.`;
      if(t==='positive')return `Au départ, le tirage met en avant ${k}. Cela constitue un terrain affectif plutôt favorable sur lequel la suite peut s’appuyer.`;
      return `Au départ, le tirage met l’accent sur ${k}. La situation reste encore mobile et demande de voir comment cet élan se transforme réellement.`;
    }
    if(role==='evolution'){
      if(t==='negative')return `Aujourd’hui, ${k} occupent le premier plan. Le lien demande donc davantage de clarté avant qu’un rapprochement puisse devenir naturel.`;
      if(t==='positive')return `Aujourd’hui, le registre change : ${k} prennent davantage de place et réintroduisent une qualité de lien plus chaleureuse, plus simple ou plus rassurante.`;
      return `Aujourd’hui, la dynamique se déplace vers ${k}. Quelque chose évolue, mais la forme exacte du lien n’est pas encore complètement fixée.`;
    }
    if(role==='outcome'){
      if(t==='negative')return `Pour la suite, la direction reste freinée par ${k}. Une évolution durable demanderait donc un changement concret plutôt qu’une simple prolongation de la situation actuelle.`;
      if(t==='positive')return `L’élan se dirige ensuite vers ${k}. La suite devient plus ouverte à un rapprochement, à condition que cette dynamique se confirme dans les actes et dans le temps.`;
      return `L’élan gagne ensuite en intensité autour de ${k}. La suite peut devenir plus vive ou plus rapide, mais elle demande encore de distinguer ce qui s’installe vraiment de ce qui relève de l’emballement.`;
    }
    if(role==='obstacle'){
      if(t==='negative')return `La difficulté principale se concentre autour de ${k}. Tant que ce point reste actif, il risque de brouiller ou de ralentir l’évolution du lien.`;
      if(t==='positive')return `Le point de vigilance concerne ${k} : même favorable, cette énergie doit rester réciproque et concrète pour ne pas devenir une simple attente.`;
      return `Ce qui complique la situation tient surtout à ${k}. Cette zone intermédiaire demande d’être clarifiée plutôt que laissée dans l’ambiguïté.`;
    }
    if(role==='resource'){
      if(t==='positive')return `Le meilleur point d’appui se trouve dans ${k}. C’est là que le tirage place la ressource la plus constructive pour faire évoluer le lien.`;
      if(t==='negative')return `Le point d’appui consiste à reconnaître clairement ${k}, afin de ne plus laisser cette difficulté décider seule de la suite.`;
      return `Une ressource existe autour de ${k}, à condition de la transformer en choix, en paroles ou en gestes réellement observables.`;
    }
    return '';
  }
  function conclusion(cards){
    const intent=questionIntent();
    const first=cards[0],mid=cards[Math.floor(cards.length/2)],last=cards[cards.length-1];
    const t1=tone(first),t2=tone(mid),t3=tone(last);
    if(intent==='new'){
      if(t1==='negative'&&t2==='positive'&&t3!=='negative'){
        return `Pour une nouvelle rencontre, l’ensemble raconte donc un passage d’une phase de retrait ou d’attente vers une ouverture affective plus douce, avant qu’une attraction beaucoup plus vive ne puisse apparaître. Le mouvement le plus cohérent est celui d’un lien qui crée d’abord de la sécurité et de la proximité, puis laisse l’intensité grandir sans confondre vitesse et solidité.`;
      }
      if(t3==='positive')return `Pour une nouvelle rencontre, l’ensemble décrit une ouverture progressive : ce qui se met en place gagne en chaleur et peut conduire vers un lien plus clairement partagé. La qualité de la rencontre dépendra surtout de la réciprocité et de la continuité des actes.`;
      if(t3==='negative')return `Pour une nouvelle rencontre, le tirage montre surtout qu’une ouverture ne suffira pas à elle seule : un frein ou une fragilité devra être dépassé avant qu’un nouveau lien puisse réellement prendre sa place.`;
      return `Pour une nouvelle rencontre, l’ensemble suggère une ouverture possible mais progressive. L’intérêt peut naître, puis s’intensifier, à condition de laisser le lien révéler sa solidité au lieu de conclure trop vite sur ses premières sensations.`;
    }
    if(intent==='return'){
      if(t3==='negative')return `Pour la question d’un retour, le tirage ne décrit pas une simple reprise de l’ancienne histoire : il montre surtout ce qui devrait changer pour éviter de reproduire la même difficulté.`;
      if(t1==='negative'&&t3!=='negative')return `Pour la question d’un retour, l’ensemble décrit un passage possible d’une période plus fermée vers une dynamique plus ouverte. Une reprise n’aurait cependant de sens que si elle se construit autrement, avec davantage de clarté et de réciprocité.`;
      return `Pour la question d’un retour, la lecture parle moins d’un retour automatique que d’une possibilité de recréer le lien sous une forme différente. La suite se vérifierait surtout dans la qualité des échanges et dans les initiatives réellement partagées.`;
    }
    if(intent==='feelings')return `Pris ensemble, les trois temps du tirage montrent surtout comment le climat affectif se transforme. La lecture gagne donc à être comprise comme une dynamique entre réserve, rapprochement et intensité, plutôt que comme trois définitions séparées.`;
    if(intent==='future')return `L’évolution générale se lit comme un mouvement : la situation quitte progressivement son état initial, traverse un changement de climat, puis se dirige vers une nouvelle manière de vivre le lien. La cohérence de cette évolution se mesurera dans les faits et la réciprocité.`;
    return `Pris ensemble, les cartes racontent une progression plutôt qu’une succession de significations isolées : le point de départ explique le climat actuel, et l’élan final montre la direction que pourrait prendre le lien si cette dynamique se confirme.`;
  }
  function loveStory(cards){
    if(!Array.isArray(cards)||!cards.length)return '';
    const q=String(state?.question||'').trim();
    const roles=cards.length===1?['outcome']:cards.length===3?['origin','evolution','outcome']:['origin','obstacle','resource','evolution','outcome'];
    const parts=cards.slice(0,roles.length).map((c,i)=>stage(c,roles[i])).filter(Boolean);
    if(cards.length>1)parts.push(conclusion(cards));
    const question=q?`<p class="reading-question">Votre question : « ${esc(q)} »</p>`:'';
    return `<div class="story-reading" data-story-engine="love-${LOVE_STORY_VERSION}"><h3>L’histoire racontée par vos cartes</h3>${question}<p class="story-continuous">${parts.join(' ')}</p></div>`;
  }

  /* Priorité absolue du moteur Amour, y compris si une couche narrative ancienne
     est encore présente dans le navigateur. */
  const previousStory=typeof storyInterpretation==='function'?storyInterpretation:null;
  storyInterpretation=function(cards){
    if(state?.oracle==='amour'&&state?.lang!=='en')return loveStory(cards);
    return previousStory?previousStory(cards):'';
  };
  interpretation=function(cards){return storyInterpretation(cards);};
  window.CRISTARIVA_LOVE_STORY_VERSION=LOVE_STORY_VERSION;

  /* Le dépôt contient les fichiers de l’Oracle Amour. Si une ancienne page
     ne les charge pas explicitement, on les charge à la demande. */
  let loveLoadPromise=null;
  function loadScript(src){
    return new Promise((resolve,reject)=>{
      if([...document.scripts].some(s=>String(s.src||'').includes(src.split('?')[0])))return resolve();
      const s=document.createElement('script');s.src=src;s.async=false;s.onload=resolve;s.onerror=reject;document.head.appendChild(s);
    });
  }
  function ensureLoveLoaded(){
    if(typeof AMOUR_DATA!=='undefined')return Promise.resolve();
    if(loveLoadPromise)return loveLoadPromise;
    loveLoadPromise=loadScript('./oracle-amour-data.js?v=20260923-story6')
      .then(()=>loadScript('./oracle-amour-card62-fix.js?v=20260923-story6'))
      .then(()=>loadScript('./oracle-amour-integration.js?v=20260923-story6'))
      .then(()=>loadScript('./oracle-amour-compat.js?v=20260923-story6'))
      .catch(()=>{});
    return loveLoadPromise;
  }

  function clearReading(){
    state.draw=[];state.relation=null;state.date=null;
    for(const id of ['drawCards','reading','relationResult','dateResult']){
      const node=document.getElementById(id);if(node)node.innerHTML='';
    }
    for(const id of ['results','deepening','synthesis'])document.getElementById(id)?.classList.add('hidden');
  }
  function refresh(){
    const sentimental=domain.value==='Sentimental';
    love.hidden=!sentimental;love.disabled=!sentimental;
    if(!sentimental&&oracle.value==='amour')oracle.value='cristariva';
    state.domain=domain.value;state.oracle=oracle.value;
    const en=state.lang==='en';
    document.getElementById('oracleChoiceLabel').textContent=en?'Choose an oracle':'Oracle à questionner';
    oracle.querySelector('[value="cristariva"]').textContent='Oracle CRISTARIVA';
    love.textContent=en?'CRISTARIVA Love Oracle':'Oracle sentimental CRISTARIVA';
    oracle.querySelector('[value="tarot"]').textContent=en?'CRISTARIVA Tarot':'Tarot CRISTARIVA';
    if(state.oracle==='amour')ensureLoveLoaded();
  }
  domain.addEventListener('change',()=>{clearReading();refresh();});
  oracle.addEventListener('change',()=>{clearReading();refresh();});
  const originalApplyLanguage=applyLanguage;
  applyLanguage=function(){originalApplyLanguage();refresh();};
  refresh();
})();
