const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM}=require('jsdom');
async function page(context,query=''){
 const dom=new JSDOM(fs.readFileSync('numerologie.html','utf8'),{url:'https://example.test/cristariva/numerologie.html'+query,runScripts:'outside-only'});
 await new Promise(resolve=>dom.window.addEventListener('DOMContentLoaded',resolve));
 if(context)dom.window.sessionStorage.setItem('cristariva-numerologie-context',JSON.stringify({...context,savedAt:Date.now()}));
 for(const file of ['numerologie-navigation.js','date-entry.js','numerologie.js'])dom.window.eval(fs.readFileSync(file,'utf8'));
 dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
 return dom;
}
function input(w,id,value){const el=w.document.getElementById(id);el.value=value;el.dispatchEvent(new w.Event('input',{bubbles:true}));}
function mode(w,value){const el=w.document.getElementById('numMode');el.value=value;el.dispatchEvent(new w.Event('change'));}
function submit(w){w.document.getElementById('numForm').dispatchEvent(new w.Event('submit',{cancelable:true}));return w.document.getElementById('numResult').textContent;}
test('page autonome : quatre parcours, dates et langue sans contrôles astrologiques',async()=>{
 const dom=await page();const w=dom.window,d=w.document;
 assert.ok(d.getElementById('numDateDirect'));
 assert.equal(d.querySelector('label[for="numDateDirect"]').textContent,'Votre date de naissance');
 input(w,'numDateDirect','11071990');input(w,'numName','Élodie Dupont');
 assert.match(submit(w),/Chemin de vie/);
 mode(w,'annee');input(w,'numYear','2026');assert.match(submit(w),/2026 : 1/);
 assert.equal(d.querySelectorAll('.num-months>div').length,12);
 mode(w,'relation');input(w,'numOtherDateDirect','05031987');assert.match(submit(w),/Nos nombres/);
 input(w,'numOtherDateDirect','31021987');assert.equal(d.getElementById('numOtherDateDirect').checkValidity(),false);
 mode(w,'annee');assert.equal(d.getElementById('numForm').checkValidity(),true);
 mode(w,'tirage');assert.match(submit(w),/Effectuez d’abord un tirage/);
 mode(w,'annee');submit(w);d.getElementById('langBtn').click();await Promise.resolve();
 assert.equal(d.documentElement.lang,'en');assert.match(d.getElementById('numResult').textContent,/Your personal year/);
 assert.match(d.querySelector('nav a').href,/lang=en/);
 input(w,'numDateDirect','');assert.equal(d.getElementById('numDate').value,'');
 dom.window.close();
});
test('transfert du tirage et de la date astrale dans le même onglet',async()=>{
 const dom=await page({hasDraw:true,date:{id:119},drawnAt:'2026-12-28T12:00:00Z',birthdate:'1990-07-11'},'?mode=tirage&lang=en');
 const w=dom.window,d=w.document;
 assert.equal(w.sessionStorage.getItem('cristariva-numerologie-context'),null);
 d.getElementById('numUseBirth').click();
 assert.equal(d.getElementById('numDateDirect').value,'11/07/1990');
 assert.match(submit(w),/December 2026/);assert.match(d.getElementById('numResult').textContent,/January 2027/);
 dom.window.close();
});
test('accueil : lien vers la page dédiée, dates astrales et transfert sans formulaire numérologique',async()=>{
 const html=fs.readFileSync('index.html','utf8');
 const dom=new JSDOM(html,{url:'https://example.test/cristariva/index.html',runScripts:'outside-only'}),w=dom.window,d=w.document;
 await new Promise(resolve=>w.addEventListener('DOMContentLoaded',resolve));
 assert.equal(d.getElementById('numForm'),null);
 const link=d.querySelector('.main-navigation a[href="./numerologie.html"]');assert.ok(link);
 w.state={draw:[{id:1}],date:{id:119}};
 for(const file of ['date-entry.js','numerologie-navigation.js'])w.eval(fs.readFileSync(file,'utf8'));
 d.dispatchEvent(new w.Event('DOMContentLoaded'));
 assert.ok(d.getElementById('birthdateDirect'));assert.ok(d.getElementById('relationBirthdateDirect'));
 input(w,'birthdateDirect','11071990');
 link.addEventListener('click',e=>e.preventDefault());link.click();
 const context=JSON.parse(w.sessionStorage.getItem('cristariva-numerologie-context'));
 assert.equal(context.birthdate,'1990-07-11');assert.equal(context.hasDraw,true);assert.equal(context.date.id,119);
 dom.window.close();
});
