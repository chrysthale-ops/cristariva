/* CRISTARIVA — intégration Oracle des Reflets du Lac. */
(function(){
'use strict';
if(!window.REFLETS_DATA?.main?.length)return;
const oracle=document.querySelector('#oracleChoice'),drawBtn=document.querySelector('#drawBtn'),catalogGame=document.querySelector('#catalogGame'),catalogue=document.querySelector('#catalogue');
if(!oracle||!drawBtn)return;
function addOption(select,value,fr,en){if(!select||select.querySelector(`[value="${value}"]`))return;const o=new Option(state?.lang==='en'?en:fr,value);o.dataset.fr=fr;o.dataset.en=en;select.appendChild(o);}
addOption(oracle,'reflets','Oracle CRISTARIVA des Reflets du Lac','CRISTARIVA Oracle of Lake Reflections');
addOption(catalogGame,'reflets','Oracle CRISTARIVA des Reflets du Lac','CRISTARIVA Oracle of Lake Reflections');
function syncLabels(){for(const s of [oracle,catalogGame]){const o=s?.querySelector('[value="reflets"]');if(o)o.textContent=state.lang==='en'?o.dataset.en:o.dataset.fr;}}
oracle.addEventListener('change',()=>{state.oracle=oracle.value;});
drawBtn.addEventListener('click',function(ev){
 if(oracle.value!=='reflets')return;
 ev.preventDefault();ev.stopImmediatePropagation();
 state.oracle='reflets';state.question=document.querySelector('#question').value.trim();state.domain=document.querySelector('#domain').value;
 const n=parseInt(state.format||1,10);state.draw=rand(REFLETS_DATA.main,n);state.relation=null;state.date=null;
 const rr=document.querySelector('#relationResult'),dr=document.querySelector('#dateResult');if(rr)rr.innerHTML='';if(dr)dr.innerHTML='';
 const pos=(state.lang==='en'?POSITIONS_EN:POSITIONS_FR)[n].map(x=>x[0]);
 document.querySelector('#drawCards').innerHTML=state.draw.map((c,i)=>cardHTML(c,pos[i])).join('');
 document.querySelector('#reading').innerHTML=interpretation(state.draw);
 document.querySelector('#results').classList.remove('hidden');document.querySelector('#deepening').classList.remove('hidden');
 document.querySelector('#results').scrollIntoView({behavior:'smooth',block:'start'});
},true);
function esc(v){return typeof readingEscape==='function'?readingEscape(String(v??'')):String(v??'');}
if(catalogue&&!document.querySelector('#oracle-reflets-catalog')){
 const sec=document.createElement('section');sec.id='oracle-reflets-catalog';sec.className='embedded-game-catalog';sec.hidden=true;
 sec.innerHTML='<div class="section-title"><span class="eyebrow">Oracle CRISTARIVA des Reflets du Lac</span><h2>Les 50 cartes</h2><p class="muted">50 cartes · Favorables, neutres et d’ombre.</p></div><div class="catalog-tools"><input id="refletsCatalogSearch" type="search" placeholder="Rechercher dans les Reflets du Lac…" autocomplete="off"></div><p class="muted" id="refletsCatalogCount"></p><div class="cards catalog-grid" id="refletsCatalogGrid"></div>';
 catalogue.appendChild(sec);
}
function renderReflets(){
 syncLabels();const sec=document.querySelector('#oracle-reflets-catalog');if(!sec)return;
 const active=catalogGame?.value==='reflets';sec.hidden=!active;if(!active)return;
 const q=(document.querySelector('#refletsCatalogSearch')?.value||document.querySelector('#catalogSearch')?.value||'').trim().toLocaleLowerCase();
 const list=REFLETS_DATA.main.filter(c=>!q||c.name.toLocaleLowerCase().includes(q)||String(c.id).includes(q)||c.keywords.includes(q));
 document.querySelector('#refletsCatalogCount').textContent=`${list.length} / 50 cartes affichées`;
 document.querySelector('#refletsCatalogGrid').innerHTML=list.map(c=>{const name=state.lang==='en'?(c.en?.name||c.name):c.name;return `<button type="button" class="catalog-item" data-reflets-id="${c.id}"><span class="catalog-image"><img src="${esc(c.image)}" alt="${esc(name)}" loading="lazy"></span><span class="catalog-name">${String(c.id).padStart(2,'0')} · ${esc(name)}</span></button>`;}).join('');
}
catalogGame?.addEventListener('change',()=>setTimeout(renderReflets,0));
document.querySelector('#catalogSearch')?.addEventListener('input',renderReflets);
document.querySelector('#refletsCatalogSearch')?.addEventListener('input',renderReflets);
document.querySelector('#refletsCatalogGrid')?.addEventListener('click',e=>{
 const b=e.target.closest('[data-reflets-id]');if(!b)return;const c=REFLETS_DATA.main.find(x=>x.id===Number(b.dataset.refletsId));if(!c)return;
 const name=state.lang==='en'?(c.en?.name||c.name):c.name,def=state.lang==='en'?(c.en?.definition||c.definition):c.definition,cat=state.lang==='en'?(c.en?.category||c.category):c.category;
 document.querySelector('#cardDialogBody').innerHTML=`<div class="card-detail-layout"><div><img class="card-detail-image" src="${esc(c.image)}" alt="${esc(name)}"></div><div><p class="muted">Oracle des Reflets du Lac · Carte ${String(c.id).padStart(2,'0')}</p><h2 id="cardDialogTitle">${esc(name)}</h2><p><b>${state.lang==='en'?'Category':'Catégorie'}</b><br>${esc(cat)}</p><p><b>${state.lang==='en'?'Meaning':'Signification'}</b><br>${esc(def)}</p></div></div>`;
 document.querySelector('#cardDialog').showModal();
});
document.querySelector('#langBtn')?.addEventListener('click',()=>setTimeout(()=>{syncLabels();renderReflets();},0));
syncLabels();renderReflets();
})();
