/* CRISTARIVA — intégration Oracle des Reflets du Lac */
(function(){
'use strict';
if(typeof window==='undefined')return;
function start(){
 if(!window.REFLETS_DATA||!window.state)return;
 const oracle=document.querySelector('#oracleChoice');
 if(!oracle)return;
 if(!oracle.querySelector('[value="reflets"]')){
   const o=new Option(state.lang==='en'?'Lake Reflections Oracle':'Oracle des Reflets du Lac','reflets');
   oracle.insertBefore(o,oracle.querySelector('[value="tarot"]')||null);
 }
 if(Array.isArray(window.CRISTARIVA_GAMES)&&!window.CRISTARIVA_GAMES.some(g=>g.id==='reflets')){
   window.CRISTARIVA_GAMES.splice(Math.max(0,window.CRISTARIVA_GAMES.length-1),0,{id:'reflets',nameFr:'Oracle des Reflets du Lac',nameEn:'Lake Reflections Oracle',count:50});
 }
 const isReflets=()=>state.oracle==='reflets';
 const sprite='./cards/reflets/reflets-sprite.webp?v=20261008-v1';
 function spriteStyle(c){
   const i=Math.max(0,Number(c.spriteIndex)||0),col=i%5,row=Math.floor(i/5);
   return `background-image:url('${sprite}');background-size:500% 1000%;background-position:${col*25}% ${row*(100/9)}%;background-repeat:no-repeat;`;
 }
 function refletsCardHTML(c,pos){
   const name=(typeof cardName==='function'?cardName(c):c.name)||c.name;
   const safe=typeof readingEscape==='function'?readingEscape:String;
   return `<article class="card reflets-card"><div class="art"><div role="img" aria-label="${safe(name)}" style="width:100%;height:100%;${spriteStyle(c)}"></div></div><div class="body"><div class="num">${String(c.id).padStart(2,'0')} · ${safe(c.title||'')}</div><h3>${safe(name)}</h3>${pos?`<p><b>${safe(pos)}</b></p>`:''}</div></article>`;
 }
 if(typeof domainReading==='function'){
   const prev=domainReading; domainReading=function(c){return c?.oracle==='reflets'?(c.definition||c.meaning||''):prev(c);};
 }
 if(typeof preciseReading==='function'){
   const prev=preciseReading; preciseReading=function(c,focus,en){return c?.oracle==='reflets'?(c.definition||c.meaning||''):prev(c,focus,en);};
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
   main.insertAdjacentHTML('beforeend',`<section class="shell panel" id="oracle-reflets-catalog"><div class="section-title"><span class="eyebrow">Oracle CRISTARIVA</span><h2>L’Oracle des Reflets du Lac</h2><p class="muted">50 cartes. Cliquez sur une carte pour consulter sa signification.</p></div><div class="catalog-tools"><input id="refletsCatalogSearch" type="search" placeholder="Rechercher dans les Reflets du Lac…" autocomplete="off"></div><p class="muted" id="refletsCatalogCount"></p><div class="cards catalog-grid" id="refletsCatalogGrid"></div></section>`);
 }
 function renderCatalog(){
   const grid=document.querySelector('#refletsCatalogGrid'),q=(document.querySelector('#refletsCatalogSearch')?.value||'').toLocaleLowerCase(),count=document.querySelector('#refletsCatalogCount');if(!grid)return;
   const list=REFLETS_DATA.all.filter(c=>!q||c.name.toLocaleLowerCase().includes(q)||c.title.toLocaleLowerCase().includes(q)||c.keywords.toLocaleLowerCase().includes(q)||String(c.id).includes(q));
   if(count)count.textContent=`${list.length} / 50 cartes affichées`;
   grid.innerHTML=list.map(c=>`<button type="button" class="catalog-item" data-reflets-id="${c.id}"><span class="catalog-image"><span style="position:absolute;inset:0;${spriteStyle(c)}"></span></span><span class="catalog-name">${String(c.id).padStart(2,'0')} · ${readingEscape(c.title)} — ${readingEscape(c.name)}</span></button>`).join('');
 }
 document.querySelector('#refletsCatalogSearch')?.addEventListener('input',renderCatalog);
 document.querySelector('#refletsCatalogGrid')?.addEventListener('click',e=>{
   const b=e.target.closest('[data-reflets-id]');if(!b)return;const c=REFLETS_DATA.all.find(x=>x.id===Number(b.dataset.refletsId));if(!c)return;
   const body=document.querySelector('#cardDialogBody');if(!body)return;
   body.innerHTML=`<div class="card-detail-layout"><div style="aspect-ratio:1055/1491;${spriteStyle(c)};background-size:500% 1000%;"></div><div><p class="muted">Oracle des Reflets du Lac · Carte ${String(c.id).padStart(2,'0')}</p><h2 id="cardDialogTitle">${readingEscape(c.title)} — ${readingEscape(c.name)}</h2><p><b>Signification</b><br>${readingEscape(c.definition)}</p><p><b>Mots-clés</b><br>${readingEscape(c.keywords)}</p></div></div>`;document.querySelector('#cardDialog')?.showModal();
 });
 renderCatalog();
 const oldApply=window.applyLanguage;
 if(typeof oldApply==='function')window.applyLanguage=function(){oldApply();const o=oracle.querySelector('[value="reflets"]');if(o)o.textContent=state.lang==='en'?'Lake Reflections Oracle':'Oracle des Reflets du Lac';renderCatalog();};
 document.documentElement.dataset.cristarivaReflets='50';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else setTimeout(start,0);
})();
