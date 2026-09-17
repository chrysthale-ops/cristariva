/* CRISTARIVA — intégration de l'Oracle Amour pour le domaine Sentimental */
(function(){
  'use strict';
  if(typeof AMOUR_DATA==='undefined') return;
  const LOVE_DOMAIN='Sentimental';
  const isLove=()=>state && state.domain===LOVE_DOMAIN;
  const activeDeck=()=>isLove()?AMOUR_DATA:DATA;

  /* Ajout du domaine Sentimental sans modifier les autres domaines. */
  const domainSelect=document.querySelector('#domain');
  if(domainSelect && ![...domainSelect.options].some(o=>o.value===LOVE_DOMAIN)){
    const opt=document.createElement('option'); opt.value=LOVE_DOMAIN; opt.textContent='Sentimental';
    domainSelect.insertBefore(opt,domainSelect.options[1]||null);
  }
  if(domainSelect){
    const wrap=domainSelect.closest('div');
    if(wrap && !document.querySelector('#oracleContext')){
      const p=document.createElement('p'); p.id='oracleContext'; p.className='muted'; p.style.marginTop='8px'; p.setAttribute('aria-live','polite'); wrap.appendChild(p);
    }
  }
  function updateOracleContext(){
    const el=document.querySelector('#oracleContext'); if(!el)return;
    if(isLove()) el.innerHTML='<b>Oracle actif : Oracle Amour CRISTARIVA</b><br>60 cartes générales · 10 cartes Relation · 10 cartes Datation';
    else el.textContent='';
    const relText=document.querySelector('#relationBtn')?.previousElementSibling;
    const dateText=document.querySelector('#dateBtn')?.previousElementSibling;
    if(relText) relText.textContent=isLove()?'Une carte parmi 10 cartes Relation de l’Oracle Amour pour préciser la personne ou le type de lien.':(state.lang==='en'?'One card among 20 distinct roles to clarify who or what kind of bond is involved.':'Une carte parmi 20 rôles distincts pour préciser qui ou quel type de lien intervient.');
    if(dateText) dateText.textContent=isLove()?'Une carte parmi 10 cartes Datation de l’Oracle Amour pour préciser le rythme.':(state.lang==='en'?'One card among 15 symbolic time windows to clarify timing.':'Une carte parmi 15 fenêtres temporelles symboliques pour préciser le rythme.');
  }
  domainSelect?.addEventListener('change',()=>{
    state.domain=domainSelect.value;
    state.relation=null; state.date=null;
    const rr=document.querySelector('#relationResult'); if(rr)rr.innerHTML='';
    const dr=document.querySelector('#dateResult'); if(dr)dr.innerHTML='';
    updateOracleContext();
  });

  /* Les lectures du nouvel oracle utilisent leur définition sentimentale propre. */
  if(typeof domainReading==='function'){
    const previousDomainReading=domainReading;
    domainReading=function(c){
      if(c?.oracle==='amour') return c.reading_relationnel||c.meaning||c.definition||'';
      return previousDomainReading(c);
    };
  }
  if(typeof preciseReading==='function'){
    const previousPreciseReading=preciseReading;
    preciseReading=function(c,focus,en){
      if(c?.oracle==='amour') return en?(c.en?.definition||c.definition||''):(c.reading_relationnel||c.definition||'');
      return previousPreciseReading(c,focus,en);
    };
  }

  /* Le moteur de tirage reste identique ; seul le jeu de cartes change en mode Sentimental. */
  document.querySelector('#drawBtn')?.addEventListener('click',function(ev){
    if(domainSelect) state.domain=domainSelect.value;
    if(!isLove()) return;
    ev.stopImmediatePropagation(); ev.preventDefault();
    state.question=document.querySelector('#question').value.trim();
    const n=parseInt(state.format||1,10);
    state.draw=rand(AMOUR_DATA.main,n);
    state.relation=null; state.date=null;
    const rr=document.querySelector('#relationResult'); if(rr)rr.innerHTML='';
    const dr=document.querySelector('#dateResult'); if(dr)dr.innerHTML='';
    const pset=(state.lang==='en'?POSITIONS_EN:POSITIONS_FR)[n];
    const pos=pset.map(x=>x[0]);
    document.querySelector('#drawCards').innerHTML=state.draw.map((c,i)=>cardHTML(c,pos[i])).join('');
    document.querySelector('#reading').innerHTML=interpretation(state.draw);
    document.querySelector('#results').classList.remove('hidden');
    document.querySelector('#deepening').classList.remove('hidden');
    updateOracleContext();
    document.querySelector('#results').scrollIntoView({behavior:'smooth',block:'start'});
  },true);
  document.querySelector('#relationBtn')?.addEventListener('click',function(ev){
    if(!isLove())return;
    ev.stopImmediatePropagation(); ev.preventDefault();
    state.relation=rand(AMOUR_DATA.relation,1)[0];
    document.querySelector('#relationResult').innerHTML=cardHTML(state.relation,t('Relation'));
    if(!document.querySelector('#synthesis').classList.contains('hidden'))renderSynthesis();
  },true);
  document.querySelector('#dateBtn')?.addEventListener('click',function(ev){
    if(!isLove())return;
    ev.stopImmediatePropagation(); ev.preventDefault();
    state.date=rand(AMOUR_DATA.dating,1)[0];
    document.querySelector('#dateResult').innerHTML=cardHTML(state.date,t('Datation'));
    if(!document.querySelector('#synthesis').classList.contains('hidden'))renderSynthesis();
  },true);

  /* Le sélecteur de langue actuel possède trois libellés de domaine : préserver Sentimental. */
  if(typeof applyLanguage==='function'){
    const previousApplyLanguage=applyLanguage;
    applyLanguage=function(){
      previousApplyLanguage();
      const labels=state.lang==='en'?{'Relations':'Relationships','Sentimental':'Love / Romance','Professionnelle / Projet':'Professional / Project','Général / spirituel':'General / Spiritual'}:{'Relations':'Relations','Sentimental':'Sentimental','Professionnelle / Projet':'Professionnelle / Projet','Général / spirituel':'Général / spirituel'};
      [...domainSelect.options].forEach(o=>{if(labels[o.value])o.textContent=labels[o.value];});
      updateOracleContext(); renderLoveCatalog();
    };
  }

  /* Catalogue complet de l'Oracle Amour, ajouté à la fin du site. */
  const main=document.querySelector('main');
  if(main && !document.querySelector('#oracle-amour-catalog')){
    main.insertAdjacentHTML('beforeend',`<section class="shell panel" id="oracle-amour-catalog">
      <div class="section-title"><span class="eyebrow">Oracle Amour CRISTARIVA</span><h2>Les 80 cartes de l’Oracle Amour</h2>
      <p class="muted">60 cartes générales · 10 cartes Relation · 10 cartes Datation. Cliquez sur une carte pour consulter sa définition.</p></div>
      <div class="catalog-tools"><label class="sr-only" for="loveCatalogSearch">Rechercher une carte de l’Oracle Amour</label>
      <input autocomplete="off" id="loveCatalogSearch" placeholder="Rechercher dans l’Oracle Amour…" type="search"/>
      <label class="sr-only" for="loveCatalogFilter">Type de carte</label><select id="loveCatalogFilter"><option value="all">Toutes les cartes Amour</option><option value="main">Cartes générales</option><option value="relation">Cartes Relation</option><option value="dating">Cartes Datation</option></select></div>
      <p aria-live="polite" class="muted" id="loveCatalogCount"></p><div class="cards catalog-grid" id="loveCatalogGrid"></div></section>`);
  }
  const LOVE_ALL=[...AMOUR_DATA.main,...AMOUR_DATA.relation,...AMOUR_DATA.dating];
  function renderLoveCatalog(){
    const f=document.querySelector('#loveCatalogFilter'),s=document.querySelector('#loveCatalogSearch'),grid=document.querySelector('#loveCatalogGrid'),count=document.querySelector('#loveCatalogCount');
    if(!f||!s||!grid||!count)return;
    const group=f.value,q=s.value.trim().toLocaleLowerCase();
    const filtered=LOVE_ALL.filter(c=>(group==='all'||c.group===group)&&(!q||c.name.toLocaleLowerCase().includes(q)||String(c.id).includes(q)||String(c.keywords||'').toLocaleLowerCase().includes(q)));
    count.textContent=`${filtered.length} / 80 cartes affichées`;
    grid.innerHTML=filtered.map(c=>{const key=readingEscape(c.group+'-'+c.id),name=readingEscape(cardName(c));return `<button type="button" class="catalog-item" data-love-card-key="${key}" aria-label="Voir la carte : ${name}"><span class="catalog-image"><img src="${readingEscape(cardImage(c))}" alt="${name}" loading="lazy"></span><span class="catalog-name">${String(c.id).padStart(2,'0')} · ${name}</span></button>`;}).join('')||'<p class="muted">Aucune carte trouvée.</p>';
  }
  document.querySelector('#loveCatalogSearch')?.addEventListener('input',renderLoveCatalog);
  document.querySelector('#loveCatalogFilter')?.addEventListener('change',renderLoveCatalog);
  document.querySelector('#loveCatalogGrid')?.addEventListener('click',e=>{
    const b=e.target.closest('[data-love-card-key]'); if(!b)return;
    const [group,id]=b.dataset.loveCardKey.split('-');
    const c=AMOUR_DATA[group].find(x=>x.id===Number(id)); if(!c)return;
    const body=document.querySelector('#cardDialogBody');
    const name=readingEscape(cardName(c)), image=readingEscape(cardImage(c));
    body.innerHTML=`<div class="card-detail-layout"><div><img class="card-detail-image" src="${image}" alt="${name}"></div><div><p class="muted">Oracle Amour CRISTARIVA · Carte ${String(c.id).padStart(2,'0')}</p><h2 id="cardDialogTitle">${name}</h2><p><b>Type</b><br>${c.group==='main'?'Carte générale':c.group==='relation'?'Carte Relation':'Carte Datation'}</p><p><b>Définition</b><br>${readingEscape(c.definition)}</p>${c.keywords?`<p><b>Mots-clés</b><br>${readingEscape(c.keywords)}</p>`:''}</div></div>`;
    document.querySelector('#cardDialog').showModal();
  });

  updateOracleContext(); renderLoveCatalog();
})();
