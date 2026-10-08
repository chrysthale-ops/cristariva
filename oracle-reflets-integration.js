/* CRISTARIVA — intégration Oracle des Reflets du Lac */
(function(){
'use strict';
if(typeof window==='undefined')return;
const imageBase='./cards/reflets/v2/';
const imageURL=c=>(c.id===33?'./cards/reflets/v3/':imageBase)+String(c.id).padStart(2,'0')+'.webp';
const thumbnailURL=c=>'./cards/reflets/thumbs-v1/'+String(c.id).padStart(2,'0')+'.webp';
function start(){
 if(!window.REFLETS_DATA||typeof state==='undefined')return;
 const oracle=document.querySelector('#oracleChoice');
 if(!oracle)return;
 const style=document.createElement('style');
 style.textContent='.reflets-card .art,#refletsCatalogGrid .catalog-image{aspect-ratio:1055/1491;height:auto;}';
 document.head.appendChild(style);
 if(!oracle.querySelector('[value="reflets"]')){
   const o=new Option(state.lang==='en'?'Lake Reflections Oracle':'Oracle des Reflets du Lac','reflets');
   oracle.insertBefore(o,oracle.querySelector('[value="tarot"]')||null);
 }
 if(Array.isArray(window.CRISTARIVA_GAMES)&&!window.CRISTARIVA_GAMES.some(g=>g.id==='reflets')){
   window.CRISTARIVA_GAMES.splice(Math.max(0,window.CRISTARIVA_GAMES.length-1),0,{id:'reflets',nameFr:'Oracle des Reflets du Lac',nameEn:'Lake Reflections Oracle',count:50});
 }
 const isReflets=()=>state.oracle==='reflets';
 function reading(c,domain){
   const field=domain==='Sentimental'?'reading_sentimental':domain==='Professionnelle / Projet'?'reading_professionnel':domain==='Général / spirituel'?'reading_spirituel':'reading_relationnel';
   return c[field]||c.definition||c.meaning||'';
 }
 if(typeof cardName==='function'){
   const previousName=cardName;
   cardName=function(c){return c?.oracle==='reflets'?c.name:previousName(c);};
 }
 function refletsCardHTML(c,pos){
   const name=(typeof cardName==='function'?cardName(c):c.name)||c.name;
   const safe=typeof readingEscape==='function'?readingEscape:String;
   return `<article class="card reflets-card"><div class="art"><img src="${imageURL(c)}" alt="${safe(name)}" width="640" height="904" loading="eager" decoding="async" fetchpriority="high"></div><div class="body"><div class="num">${String(c.id).padStart(2,'0')} · ${safe(c.title||'')}</div><h3>${safe(name)}</h3>${pos?`<p><b>${safe(pos)}</b></p>`:''}<p><b>${safe(state.domain||'Relations')}</b><br>${safe(reading(c,state.domain))}</p><button type="button" data-reflets-id="${c.id}">Consulter la fiche complète</button></div></article>`;
 }
 if(typeof domainReading==='function'){
   const prev=domainReading; domainReading=function(c){return c?.oracle==='reflets'?reading(c,state.domain):prev(c);};
 }
 if(typeof preciseReading==='function'){
   const prev=preciseReading; preciseReading=function(c,focus,en){return c?.oracle==='reflets'?reading(c,state.domain):prev(c,focus,en);};
 }
 document.querySelector('#drawBtn')?.addEventListener('click',function(ev){
   if(!isReflets())return;
   ev.stopImmediatePropagation();ev.preventDefault();
   state.question=document.querySelector('#question')?.value.trim()||'';
   const n=parseInt(state.format||1,10);
   state.draw=rand(REFLETS_DATA.main,n);state.relation=null;state.date=null;
   const pset=(state.lang==='en'?POSITIONS_EN:POSITIONS_FR)[n];const pos=pset.map(x=>x[0]);
   document.querySelector('#drawCards').innerHTML=state.draw.map((c,i)=>refletsCardHTML(c,pos[i])).join('');
   document.querySelector('#reading').innerHTML=interpretation(state.draw);
   document.querySelector('#results').classList.remove('hidden');document.querySelector('#deepening').classList.remove('hidden');
   document.querySelector('#results').scrollIntoView({behavior:'smooth',block:'start'});
 },true);
 const main=document.querySelector('main');
 if(main&&!document.querySelector('#oracle-reflets-catalog')){
   const catalogue=document.querySelector('#catalogue');
   (catalogue||main).insertAdjacentHTML('beforeend',`<section class="${catalogue?'embedded-game-catalog':'shell panel'}" id="oracle-reflets-catalog"><div class="section-title"><span class="eyebrow">Oracle CRISTARIVA</span><h2>L’Oracle des Reflets du Lac</h2><p class="muted">50 cartes. Consultez leur définition, leur tonalité, leur force et leurs significations dans les quatre domaines.</p><p class="muted">La force indique l’intensité symbolique : douce, modérée, forte ou très forte. Elle ne représente pas une probabilité. Une carte neutre décrit un contexte ou une transition ; la position et les cartes voisines nuancent toujours la lecture.</p></div><div class="catalog-tools"><label class="sr-only" for="refletsCatalogSearch">Rechercher une carte des Reflets du Lac</label><input id="refletsCatalogSearch" type="search" placeholder="Nom, numéro, mot-clé…" autocomplete="off"></div><p class="muted" aria-live="polite" id="refletsCatalogCount"></p><div class="cards catalog-grid" id="refletsCatalogGrid"></div></section>`);
 }
 let renderedQuery=null;
 function renderCatalog(){
   const grid=document.querySelector('#refletsCatalogGrid'),q=(document.querySelector('#refletsCatalogSearch')?.value||'').toLocaleLowerCase(),count=document.querySelector('#refletsCatalogCount');if(!grid)return;
   // Aucun chargement de vignettes tant que ce jeu n'est pas sélectionné.
   const game=document.querySelector('#catalogGame');if(game&&game.value!=='reflets')return;
   if(renderedQuery===q&&grid.childElementCount)return;
   renderedQuery=q;
   const list=REFLETS_DATA.all.filter(c=>!q||c.name.toLocaleLowerCase().includes(q)||c.title.toLocaleLowerCase().includes(q)||c.keywords.toLocaleLowerCase().includes(q)||String(c.id).includes(q));
   if(count)count.textContent=`${list.length} / 50 cartes affichées`;
   grid.innerHTML=list.map((c,i)=>`<button type="button" class="catalog-item" data-reflets-id="${c.id}" aria-label="Consulter la carte ${String(c.id).padStart(2,'0')} : ${readingEscape(c.name)}"><span class="catalog-image"><img src="${thumbnailURL(c)}" alt="${readingEscape(c.name)}" width="320" height="452" loading="${i<6?'eager':'lazy'}" decoding="async" fetchpriority="${i<2?'high':'auto'}"></span><span class="catalog-name">${String(c.id).padStart(2,'0')} · ${readingEscape(c.title)} — ${readingEscape(c.name)}</span></button>`).join('')||'<p class="muted">Aucune carte trouvée.</p>';
 }
 document.querySelector('#refletsCatalogSearch')?.addEventListener('input',renderCatalog);
 function openRefletsCard(e){
   const b=e.target.closest('[data-reflets-id]');if(!b)return;const c=REFLETS_DATA.all.find(x=>x.id===Number(b.dataset.refletsId));if(!c)return;
   const body=document.querySelector('#cardDialogBody');if(!body)return;
   const row=(label,value)=>`<div class="card-detail-row"><h4>${readingEscape(label)}</h4><p>${readingEscape(value)}</p></div>`;
   const tone=c.polarity==='positive'?'Positive — favorable':c.polarity==='negative'?'Négative — ombre / difficulté':'Neutre — contexte / transition';
   const fields=row('Définition générale',c.definition)+row('Tonalité',tone)+row('Force symbolique',c.intensity+' — '+c.strengthNote)+row('Mots-clés',c.keywords)+row('Sentimental',c.reading_sentimental)+row('Relationnel',c.reading_relationnel)+row('Professionnel / projet',c.reading_professionnel)+row('Général / spirituel',c.reading_spirituel)+row('Conseil',c.message);
   body.innerHTML=`<div class="card-detail-layout"><div><img class="card-detail-image" src="${imageURL(c)}" alt="${readingEscape(c.name)}" width="640" height="904" decoding="async" style="width:100%;height:auto;aspect-ratio:1055/1491;object-fit:contain;"></div><div><p class="muted">Oracle des Reflets du Lac · Carte ${String(c.id).padStart(2,'0')}</p><h2 id="cardDialogTitle">${readingEscape(c.title)} — ${readingEscape(c.name)}</h2>${fields}</div></div>`;
   // Empêche le rafraîchissement de langue d'afficher une ancienne fiche d'un autre jeu.
   if(typeof catalogSelected!=='undefined')catalogSelected=null;
   const dialog=document.querySelector('#cardDialog');if(dialog&&!dialog.open)dialog.showModal();
 }
 document.querySelector('#refletsCatalogGrid')?.addEventListener('click',openRefletsCard);
 document.querySelector('#drawCards')?.addEventListener('click',openRefletsCard);
 renderCatalog();
 const oldApply=window.applyLanguage;
 if(typeof oldApply==='function')window.applyLanguage=function(){oldApply();const o=oracle.querySelector('[value="reflets"]');if(o)o.textContent=state.lang==='en'?'Lake Reflections Oracle':'Oracle des Reflets du Lac';renderCatalog();};
 document.documentElement.dataset.cristarivaReflets='50';
 if(typeof window.renderCatalog==='function')window.renderCatalog();
}
function boot(){
 // Les définitions restent consultables même si une illustration ne se charge pas.
 start();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else setTimeout(boot,0);
})();
