/* CRISTARIVA — Tarot divinatoire 78 cartes : 22 majeurs + 56 mineurs. */
(async function(){
'use strict';
if(!window.TAROT_DATA||!Array.isArray(window.TAROT_DATA.main))return;

function loadScript(src){
  return new Promise((resolve,reject)=>{
    if([...document.scripts].some(s=>String(s.src||'').includes(src.split('?')[0])))return resolve();
    const s=document.createElement('script');s.src=src;s.async=false;s.onload=resolve;s.onerror=reject;document.head.appendChild(s);
  });
}
try{await loadScript('./tarot-minor-sprite-loader.js?v=20260924-red');if(window.CR_TAROT_MINOR_IMAGES_READY)await window.CR_TAROT_MINOR_IMAGES_READY;for(const src of ['./tarot-minors-data-batons.js?v=20260924','./tarot-minors-data-coupes.js?v=20260924','./tarot-minors-data-epees.js?v=20260924','./tarot-minors-data-deniers.js?v=20260924'])await loadScript(src);await loadScript('./tarot-minors-v1.js?v=20260924-tarot78-red');}catch(e){console.error('CRISTARIVA Tarot 78:',e);}
if(!window.TAROT_DATA||!Array.isArray(window.TAROT_DATA.main))return;

const tarotCards=window.TAROT_DATA.main;
const tarotCount=tarotCards.length;
const domainSelect=document.querySelector('#domain');
const isTarot=()=>typeof state==='object'&&state&&state.oracle==='tarot';
const esc=value=>typeof readingEscape==='function'?readingEscape(value):String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

/* La refonte conserve les anciennes valeurs techniques afin de ne casser
   aucune lecture existante, mais tous les libellés visibles utilisent les
   nouveaux noms demandés. */
function syncDomainDisplayLabels(){
  if(!domainSelect)return;
  const en=state?.lang==='en';
  const labels=en?{
    'Sentimental':'Romantic',
    'Relations':'Relationships',
    'Professionnelle / Projet':'Professional / Project',
    'Général / spirituel':'General / Spiritual'
  }:{
    'Sentimental':'Sentimental',
    'Relations':'Relationnel',
    'Professionnelle / Projet':'Professionnel / projet',
    'Général / spirituel':'Général / spirituel'
  };
  [...domainSelect.options].forEach(option=>{if(labels[option.value])option.textContent=labels[option.value];});
}
function syncCardDetailDisplayLabels(root=document){
  if(state?.lang==='en')return;
  root.querySelectorAll?.('.card-detail-row h4').forEach(node=>{
    node.textContent=node.textContent
      .replace(/Relations/g,'Relationnel')
      .replace(/Professionnelle\s*\/\s*Projet/g,'Professionnel / projet');
  });
}
const cardDialogBody=document.querySelector('#cardDialogBody');
if(cardDialogBody){
  syncCardDetailDisplayLabels(cardDialogBody);
  new MutationObserver(()=>syncCardDetailDisplayLabels(cardDialogBody)).observe(cardDialogBody,{childList:true,subtree:true});
}

function fixTarotCard(card){
  if(!card||card.oracle!=='tarot')return card;
  const identity=window.CR_TAROT_IDENTITIES?.[Number(card.id)];
  if(identity){
    card.name=identity.name;
    if(card.en)card.en.name=identity.enName;
    card.image=identity.image;
    card.imageEn=identity.imageEn;
  }
  return card;
}
(window.TAROT_DATA.main||[]).forEach(fixTarotCard);
(window.TAROT_DATA.all||[]).forEach(fixTarotCard);

try{
  if(typeof window.cr363Title==='function'){
    const prev=window.cr363Title;
    window.cr363Title=function(card){
      if(card?.oracle==='tarot'){fixTarotCard(card);return state?.lang==='en'?(card.en?.name||card.name):card.name;}
      return prev(card);
    };
  }
  if(typeof window.cardName==='function'){
    const prev=window.cardName;
    window.cardName=function(card){
      if(card?.oracle==='tarot'){fixTarotCard(card);return state?.lang==='en'?(card.en?.name||card.name):card.name;}
      return prev(card);
    };
  }
}catch(e){}

function ensureContext(){
  if(!domainSelect)return null;
  let c=document.querySelector('#tarotContext');
  if(!c){
    c=document.createElement('p');c.id='tarotContext';c.className='muted';c.style.marginTop='8px';c.setAttribute('aria-live','polite');
    domainSelect.closest('div')?.appendChild(c);
  }
  return c;
}
function updateContext(){
  syncDomainDisplayLabels();
  const c=ensureContext();if(!c)return;
  c.hidden=!isTarot();
  c.innerHTML=state?.lang==='en'
    ?'<b>Active deck: CRISTARIVA Divinatory Tarot</b><br>78 cards: 22 Major Arcana and 56 Minor Arcana · Wands, Cups, Swords and Pentacles.'
    :'<b>Jeu actif : Tarot divinatoire CRISTARIVA</b><br>78 cartes : 22 arcanes majeurs et 56 arcanes mineurs · Bâtons, Coupes, Épées et Deniers.';
}
function clearComplementaryCards(){
  state.relation=null;state.date=null;
  const r=document.querySelector('#relationResult'),d=document.querySelector('#dateResult');
  if(r)r.innerHTML='';if(d)d.innerHTML='';
}
function localizedTarotReading(card,en=false){
  fixTarotCard(card);const local=en?(card?.en||{}):(card||{});let scope='spirit';
  try{if(typeof cr51Scope==='function')scope=cr51Scope();}catch(e){}
  if(scope==='work')return local.reading_professionnel||local.meaning||local.definition||'';
  if(scope==='relation')return local.reading_relationnel||local.meaning||local.definition||'';
  return local.reading_spirituel||local.reading_tarot||local.meaning||local.definition||'';
}
if(typeof domainReading==='function'){
  const old=domainReading;
  domainReading=function(card){if(card?.oracle==='tarot'){fixTarotCard(card);return card.reading_tarot||card.meaning||card.definition||'';}return old(card);};
}
if(typeof preciseReading==='function'){
  const old=preciseReading;
  preciseReading=function(card,focus,en){if(card?.oracle==='tarot')return localizedTarotReading(card,Boolean(en));return old(card,focus,en);};
}

const drawBtn=document.querySelector('#drawBtn');
drawBtn?.addEventListener('click',event=>{
  if(domainSelect)state.domain=domainSelect.value;
  if(!isTarot())return;
  event.stopImmediatePropagation();event.preventDefault();
  state.question=document.querySelector('#question')?.value.trim()||'';
  const count=parseInt(state.format||1,10);
  state.draw=rand(window.TAROT_DATA.main,count).map(fixTarotCard);
  clearComplementaryCards();
  const positions=(state.lang==='en'?POSITIONS_EN:POSITIONS_FR)[count].map(x=>x[0]);
  const drawCards=document.querySelector('#drawCards');
  if(drawCards)drawCards.innerHTML=state.draw.map((card,i)=>cardHTML(card,positions[i])).join('');
  const reading=document.querySelector('#reading');if(reading)reading.innerHTML=interpretation(state.draw);
  document.querySelector('#results')?.classList.remove('hidden');
  document.querySelector('#deepening')?.classList.remove('hidden');
  updateContext();document.querySelector('#results')?.scrollIntoView({behavior:'smooth',block:'start'});
},true);

document.querySelector('#oracleChoice')?.addEventListener('change',updateContext);
domainSelect?.addEventListener('change',updateContext);

const main=document.querySelector('main');
if(main&&!document.querySelector('#tarot-divinatoire-catalog'))main.insertAdjacentHTML('beforeend',`<section class="shell panel" id="tarot-divinatoire-catalog"><div class="section-title"><span class="eyebrow" id="tarotCatalogEyebrow">Tarot divinatoire CRISTARIVA</span><h2 id="tarotCatalogTitle">Les 78 cartes du Tarot divinatoire</h2><p class="muted" id="tarotCatalogIntro">22 arcanes majeurs et 56 arcanes mineurs. Cliquez sur une carte pour consulter sa définition et son message essentiel.</p></div><div class="catalog-tools"><label class="sr-only" for="tarotCatalogSearch" id="tarotCatalogSearchLabel">Rechercher une carte du Tarot divinatoire</label><input autocomplete="off" id="tarotCatalogSearch" placeholder="Rechercher dans le Tarot divinatoire…" type="search"/></div><p aria-live="polite" class="muted" id="tarotCatalogCount"></p><div class="cards catalog-grid" id="tarotCatalogGrid"></div></section>`);

function renderTarotCatalog(){
  const search=document.querySelector('#tarotCatalogSearch'),grid=document.querySelector('#tarotCatalogGrid'),count=document.querySelector('#tarotCatalogCount');
  if(!search||!grid||!count)return;
  const en=state?.lang==='en',q=search.value.trim().toLocaleLowerCase(en?'en':'fr');
  const cards=window.TAROT_DATA.main.map(fixTarotCard).filter(card=>{
    const l=en?(card.en||{}):card;
    return !q||String(l.name||'').toLocaleLowerCase().includes(q)||String(l.keywords||'').toLocaleLowerCase().includes(q)||String(card.suit||'').toLocaleLowerCase().includes(q)||String(card.id).includes(q);
  });
  const title=document.querySelector('#tarotCatalogTitle'),intro=document.querySelector('#tarotCatalogIntro'),label=document.querySelector('#tarotCatalogSearchLabel');
  if(title)title.textContent=en?'The 78 Divinatory Tarot cards':'Les 78 cartes du Tarot divinatoire';
  if(intro)intro.textContent=en?'22 Major Arcana and 56 Minor Arcana. Select a card to read its definition and essential message.':'22 arcanes majeurs et 56 arcanes mineurs. Cliquez sur une carte pour consulter sa définition et son message essentiel.';
  if(label)label.textContent=en?'Search the Divinatory Tarot':'Rechercher une carte du Tarot divinatoire';
  search.placeholder=en?'Search the Divinatory Tarot…':'Rechercher dans le Tarot divinatoire…';
  count.textContent=en?`${cards.length} / ${tarotCount} cards displayed`:`${cards.length} / ${tarotCount} cartes affichées`;
  grid.innerHTML=cards.map(card=>{
    const name=esc(en?(card.en?.name||card.name):card.name);
    return `<button type="button" class="catalog-item" data-tarot-card-id="${card.id}" aria-label="${esc(en?'View card':'Voir la carte')} : ${name}"><span class="catalog-image"><img src="${esc(cardImage(card))}" alt="${name}" loading="lazy"></span><span class="catalog-name">${String(card.id).padStart(2,'0')} · ${name}</span></button>`;
  }).join('')||(en?'<p class="muted">No card found.</p>':'<p class="muted">Aucune carte trouvée.</p>');
}
document.querySelector('#tarotCatalogSearch')?.addEventListener('input',renderTarotCatalog);
document.querySelector('#tarotCatalogGrid')?.addEventListener('click',event=>{
  const b=event.target.closest('[data-tarot-card-id]');if(!b)return;
  const card=fixTarotCard(window.TAROT_DATA.main.find(x=>x.id===Number(b.dataset.tarotCardId)));if(!card)return;
  const en=state.lang==='en',local=en?(card.en||{}):card,name=esc(local.name||card.name);
  const family=card.arcana==='minor'?(en?((card.en?.name||'').split(' of ').pop()||'Minor Arcana'):card.suit):(en?'Major Arcana':'Arcane majeur');
  document.querySelector('#cardDialogBody').innerHTML=`<div class="card-detail-layout"><div><img class="card-detail-image" src="${esc(cardImage(card))}" alt="${name}"></div><div><p class="muted">${en?'CRISTARIVA Divinatory Tarot':'Tarot divinatoire CRISTARIVA'} · ${family} · ${en?'Card':'Carte'} ${String(card.id).padStart(2,'0')}</p><h2 id="cardDialogTitle">${name}</h2><p><b>${en?'Definition':'Définition'}</b><br>${esc(local.definition)}</p><p><b>${en?'Essential message':'Message essentiel'}</b><br>${esc(local.message)}</p><p><b>${en?'Keywords':'Mots-clés'}</b><br>${esc(local.keywords)}</p></div></div>`;
  const dialog=document.querySelector('#cardDialog');if(dialog&&!dialog.open)dialog.showModal();
});

if(typeof applyLanguage==='function'){
  const old=applyLanguage;
  applyLanguage=function(){old();(window.TAROT_DATA.main||[]).forEach(fixTarotCard);syncDomainDisplayLabels();syncCardDetailDisplayLabels(cardDialogBody||document);updateContext();renderTarotCatalog();};
}
syncDomainDisplayLabels();
updateContext();renderTarotCatalog();
window.__CRISTARIVA_TAROT_READY__=true;
window.CR_TAROT_INTEGRATION_VERSION='2026.09.26-card-size-r2';
})();
