const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.join(__dirname,'..');

test('Reflets : activation avec état lexical, catalogue et tirages 1/3/5',async()=>{
 const dom=new JSDOM('<main><section id="catalogue"><select id="catalogGame"><option value="cristariva">Oracle</option><option value="reflets">Reflets</option><option value="tarot">Tarot</option></select><input id="catalogSearch"><select id="catalogFilter"><option value="all">Tout</option></select><div id="catalogGrid"></div><p id="catalogCount"></p></section></main><select id="oracleChoice"><option value="tarot">Tarot</option></select><button id="drawBtn"></button><input id="question"><div id="drawCards"></div><div id="reading"></div><div id="results" class="hidden"></div><div id="deepening" class="hidden"></div><dialog id="cardDialog"><div id="cardDialogBody"></div></dialog>',{runScripts:'dangerously',url:'https://cristariva.test/'});
 const w=dom.window;
 try{
 w.HTMLElement.prototype.scrollIntoView=()=>{};
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
 w.fetch=async()=>{throw Error('Le catalogue doit rester accessible sans réseau');};
 const setup=w.document.createElement('script');setup.textContent=`let state={oracle:'reflets',lang:'fr',format:1};const POSITIONS_FR={1:[['Éclairage']],3:[['Avant'],['Maintenant'],['Élan']],5:[['Origine'],['Obstacle'],['Force'],['Évolution'],['Synthèse']]};const POSITIONS_EN=POSITIONS_FR;function rand(cards,n){return cards.slice(0,n);}function readingEscape(s){return String(s);}function interpretation(cards){return cards.map(c=>domainReading(c)).join(' ');}function domainReading(){return 'ancien';}`;w.document.head.appendChild(setup);
 w.cardName=()=> 'Ancien titre';
 assert.equal(w.state,undefined,'state is a lexical global as in the actual page');
 const page=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const catalogSource=page.slice(page.indexOf('function renderCatalog(){'),page.indexOf('function renderCardDialog(){'));
 w.eval(`const $=s=>document.querySelector(s);const CATALOG_ALL=[];function t(s){return s;}${catalogSource}`);
 w.document.querySelector('#catalogGame').addEventListener('change',w.renderCatalog);
 w.document.querySelector('#catalogSearch').addEventListener('input',w.renderCatalog);
 w.eval(fs.readFileSync(path.join(root,'oracle-reflets-data.js'),'utf8'));
 w.eval(fs.readFileSync(path.join(root,'oracle-reflets-integration.js'),'utf8'));
 await new Promise(r=>setTimeout(r,30));
 assert.equal(w.document.documentElement.dataset.cristarivaReflets,'50');
 assert.equal(w.document.querySelectorAll('[data-reflets-id]').length,0,'aucune vignette avant sélection du jeu');
 assert.ok(w.document.querySelector('option[value="reflets"]'));
 const section=w.document.querySelector('#oracle-reflets-catalog');
 assert.equal(section.parentElement.id,'catalogue');
 assert.equal(section.hidden,true);
 const game=w.document.querySelector('#catalogGame');game.value='reflets';game.dispatchEvent(new w.Event('change'));
 assert.equal(section.hidden,false);
 assert.equal(w.document.querySelectorAll('#refletsCatalogGrid img[loading="lazy"]').length,44);
 assert.equal(w.document.querySelectorAll('#refletsCatalogGrid img[loading="eager"]').length,6);
 assert.equal(w.document.querySelectorAll('#refletsCatalogGrid img[fetchpriority="high"]').length,2);
 assert.match(w.document.querySelector('#refletsCatalogGrid img').src,/thumbs-v1\/01.webp$/);
 const firstImage=w.document.querySelector('#refletsCatalogGrid img');w.renderCatalog();
 assert.equal(w.document.querySelector('#refletsCatalogGrid img'),firstImage,'ne pas reconstruire un catalogue inchangé');
 assert.equal(w.document.querySelector('#catalogGrid').hidden,true);
 const commonSearch=w.document.querySelector('#catalogSearch');commonSearch.value='SECRET';commonSearch.dispatchEvent(new w.Event('input'));
 assert.equal(w.document.querySelectorAll('[data-reflets-id]').length,1);
 w.document.querySelector('[data-reflets-id="38"]').click();
 assert.match(w.document.querySelector('#cardDialogBody img').src,/v2\/38.webp$/,'fiche détaillée en grande résolution');
 assert.match(w.document.querySelector('#cardDialogBody').textContent,/Neutre — contexte/);
 assert.match(w.document.querySelector('#cardDialogBody').textContent,/ni sentiment caché ni tromperie/);
 commonSearch.value='';commonSearch.dispatchEvent(new w.Event('input'));
 assert.ok(!w.document.body.innerHTML.includes('reflets-sprite'));
 for(const n of [1,3,5]){
 w.eval(`state.format=${n}`);w.document.querySelector('#drawBtn').click();
 assert.equal(w.eval('state.draw.length'),n);
 assert.equal(w.document.querySelectorAll('.reflets-card').length,n);
 assert.match(w.document.querySelector('.reflets-card h3').textContent,/Aurore sur le lac/);
 assert.equal(w.document.querySelectorAll('.reflets-card img[loading="eager"]').length,n);
 assert.match(w.document.querySelector('#reading').textContent,/contact neuf/);
 w.document.querySelector('.reflets-card button').click();
 assert.match(w.document.querySelector('#cardDialogBody').textContent,/Force symbolique/);
 }
 const search=w.document.querySelector('#refletsCatalogSearch');search.value='RUPTURE';search.dispatchEvent(new w.Event('input'));
 assert.equal(w.document.querySelectorAll('#refletsCatalogGrid [data-reflets-id]').length,1);
 w.document.querySelector('#refletsCatalogGrid [data-reflets-id]').click();
 assert.match(w.document.querySelector('#cardDialogBody').textContent,/Fil rompu/);
 assert.match(w.document.querySelector('#cardDialogBody').textContent,/Négative — ombre/);
 assert.match(w.document.querySelector('#cardDialogBody').textContent,/Très forte/);
 assert.equal(w.document.querySelector('#cardDialog').open,true);
 for(const [domain,field] of [['Sentimental','reading_sentimental'],['Relations','reading_relationnel'],['Professionnelle / Projet','reading_professionnel'],['Général / spirituel','reading_spirituel']]){
   w.eval(`state.domain=${JSON.stringify(domain)}`);
   assert.equal(w.domainReading(w.REFLETS_DATA.all[37]),w.REFLETS_DATA.all[37][field]);
 }
 for(const c of w.REFLETS_DATA.all){
   assert.ok(['positive','negative','neutral'].includes(c.polarity));
   assert.ok(['Douce','Modérée','Forte','Très forte'].includes(c.intensity));
   const readings=['reading_sentimental','reading_relationnel','reading_professionnel','reading_spirituel'].map(f=>c[f]);
   assert.equal(new Set(readings).size,4,`Carte ${c.id} : quatre lectures distinctes`);
   assert.ok(readings.every(s=>s.length>70));
 }
 }finally{w.close();}
});
