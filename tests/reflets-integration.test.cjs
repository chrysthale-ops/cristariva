const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.join(__dirname,'..');

test('Reflets : activation avec état lexical, catalogue et tirages 1/3/5',async()=>{
 const dom=new JSDOM('<main></main><select id="oracleChoice"><option value="tarot">Tarot</option></select><button id="drawBtn"></button><input id="question"><div id="drawCards"></div><div id="reading"></div><div id="results" class="hidden"></div><div id="deepening" class="hidden"></div><dialog id="cardDialog"><div id="cardDialogBody"></div></dialog>',{runScripts:'dangerously',url:'https://cristariva.test/'});
 const w=dom.window;
 try{
 w.HTMLElement.prototype.scrollIntoView=()=>{};
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
 w.fetch=async url=>{assert.match(url,/v2\/manifest\.json$/);return {ok:true,json:async()=>({count:50})};};
 const setup=w.document.createElement('script');setup.textContent=`let state={oracle:'reflets',lang:'fr',format:1};const POSITIONS_FR={1:[['Éclairage']],3:[['Avant'],['Maintenant'],['Élan']],5:[['Origine'],['Obstacle'],['Force'],['Évolution'],['Synthèse']]};const POSITIONS_EN=POSITIONS_FR;function rand(cards,n){return cards.slice(0,n);}function readingEscape(s){return String(s);}function interpretation(cards){return cards.map(c=>domainReading(c)).join(' ');}function domainReading(){return 'ancien';}`;w.document.head.appendChild(setup);
 w.cardName=()=> 'Ancien titre';
 assert.equal(w.state,undefined,'state is a lexical global as in the actual page');
 w.eval(fs.readFileSync(path.join(root,'oracle-reflets-data.js'),'utf8'));
 w.eval(fs.readFileSync(path.join(root,'oracle-reflets-integration.js'),'utf8'));
 await new Promise(r=>setTimeout(r,30));
 assert.equal(w.document.documentElement.dataset.cristarivaReflets,'50');
 assert.equal(w.document.querySelectorAll('[data-reflets-id]').length,50);
 assert.ok(w.document.querySelector('option[value="reflets"]'));
 assert.equal(w.document.querySelectorAll('#refletsCatalogGrid img[loading="lazy"]').length,50);
 assert.ok(!w.document.body.innerHTML.includes('reflets-sprite'));
 for(const n of [1,3,5]){
 w.eval(`state.format=${n}`);w.document.querySelector('#drawBtn').click();
 assert.equal(w.eval('state.draw.length'),n);
 assert.equal(w.document.querySelectorAll('.reflets-card').length,n);
 assert.match(w.document.querySelector('.reflets-card h3').textContent,/Aurore sur le lac/);
 assert.equal(w.document.querySelectorAll('.reflets-card img[loading="eager"]').length,n);
 assert.match(w.document.querySelector('#reading').textContent,/mouvement neuf/);
 }
 const search=w.document.querySelector('#refletsCatalogSearch');search.value='RUPTURE';search.dispatchEvent(new w.Event('input'));
 assert.equal(w.document.querySelectorAll('[data-reflets-id]').length,1);
 w.document.querySelector('[data-reflets-id]').click();
 assert.match(w.document.querySelector('#cardDialogBody').textContent,/Fil rompu/);
 assert.equal(w.document.querySelector('#cardDialog').open,true);
 }finally{w.close();}
});
