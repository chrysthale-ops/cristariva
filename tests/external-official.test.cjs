const {test}=require('node:test');
const assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../groq-hybrid-story.js'),'utf8');
const quality=require('../story-quality.js');

test('Reflets : le moteur externe reçoit la signification du domaine choisi',async()=>{
 const dom=new JSDOM('<main></main>',{runScripts:'outside-only'}),w=dom.window;
 try{
 w.eval(fs.readFileSync(path.join(__dirname,'../oracle-reflets-data.js'),'utf8'));
 const cards=[w.REFLETS_DATA.all[37]];
 w.state={lang:'fr',question:'Essai domaines',context:'Je suis célibataire.',oracle:'reflets',draw:cards};
 w.storyInterpretation=()=>{};w.interpretation=()=>{};w.AbortSignal=AbortSignal;w.CR_STORY_QUALITY=quality;
 const timers=[];w.setTimeout=fn=>timers.push(fn);
 let sent;w.fetch=async(_url,options)=>{sent=JSON.parse(options.body);return {ok:true,status:200,json:async()=>({text:'Une information manque encore pour comprendre la situation.'})};};
 w.eval(source);
 for(const [domain,field] of [['Sentimental','reading_sentimental'],['Relations','reading_relationnel'],['Professionnelle / Projet','reading_professionnel'],['Général / spirituel','reading_spirituel']]){
 w.state.domain=domain;w.document.querySelector('main').innerHTML=w.CR_UNIVERSAL_FLUID_STORY(cards);
 await timers.shift()();
 assert.equal(sent.cards[0].meaning,cards[0][field],domain);
 assert.equal(sent.oracle,'reflets');
 assert.equal(sent.context,'Je suis célibataire.');
 }
 }finally{w.close();}
});

test('official external story exposes status, retries temporary failures and keeps roles and reversals',async()=>{
 const dom=new JSDOM('<main></main>',{runScripts:'outside-only'}),w=dom.window;
 const cards=[{id:1,name:'Première',reading_relationnel:'Initiative'},{id:2,name:'Deuxième',reading_relationnel:'Clarté'},{id:3,name:'Dernière',reading_relationnel:'Pause'}];
 w.state={lang:'fr',question:'<img src=x onerror=alert(1)>',domain:'Sentimental',oracle:'tarot',draw:cards,tarotReversed:[true,false,false]};
 w.CR_TAROT_REVERSED={1:{fr:'Une initiative irrégulière.'}};
 w.CR_UNIVERSAL_FLUID_STORY=()=>{throw Error('Internal story must not run');};
 w.CR_UNIVERSAL_ROLE_SUMMARY=()=>{throw Error('Internal summary must not run');};
 w.storyInterpretation=()=>{};w.interpretation=()=>{};
 w.CR_STORY_QUALITY=quality;w.AbortSignal=AbortSignal;
 const timers=[];w.setTimeout=(fn,delay)=>{timers.push({fn,delay});return timers.length;};
 const runNext=async()=>{const item=timers.shift();assert.ok(item,'expected a scheduled attempt');await item.fn();};
 const good='Une clarification pourrait aider à envisager le lien avec davantage de recul.';
 let sent,calls=0;
 w.fetch=async(_url,options)=>{calls++;sent=JSON.parse(options.body);return {ok:true,status:200,json:async()=>({text:good})};};
 w.eval(source);
 const render=()=>{w.document.querySelector('main').innerHTML=w.CR_UNIVERSAL_FLUID_STORY(cards);};

 render();
 assert.match(w.document.body.textContent,/Moteur externe : connexion/);
 assert.match(w.document.body.textContent,/cours de rédaction/);
 assert.equal(w.document.querySelector('img'),null);
 await runNext();
 assert.equal(w.document.querySelector('.story-continuous').textContent,good);
 assert.match(w.document.querySelector('.story-engine-status').textContent,/actif/);
 assert.equal(w.CR_EXTERNAL_ENGINE_LAST_STATUS.state,'active');
 assert.deepEqual(sent.cards.map(c=>c.local),['','','']);
 assert.deepEqual(sent.cards.map(c=>c.role),['origin','evolution','outcome']);
 assert.equal(sent.cards[0].reversed,true);
 assert.equal(sent.cards[0].meaning,'Une initiative irrégulière.');
 render();
 assert.equal(calls,1);
 assert.equal(w.document.querySelector('.story-continuous').textContent,good);
 assert.match(w.document.querySelector('.story-engine-status').textContent,/actif/);

 w.state.question='Relance 429';calls=0;
 w.fetch=async(_url,options)=>{
  calls++;sent=JSON.parse(options.body);
  if(calls===1)return {ok:false,status:429,json:async()=>({error:'rate_limit'})};
  return {ok:true,status:200,json:async()=>({text:good})};
 };
 render();await runNext();
 assert.equal(calls,1);
 assert.equal(w.document.querySelector('.story-reading').dataset.externalStatus,'retrying');
 assert.match(w.document.querySelector('.story-engine-status').textContent,/seconde tentative/);
 assert.equal(w.CR_EXTERNAL_ENGINE_LAST_STATUS.state,'retrying');
 await runNext();
 assert.equal(calls,2);
 assert.equal(w.document.querySelector('.story-reading').dataset.storyEngine,'external');
 assert.equal(w.CR_EXTERNAL_ENGINE_LAST_STATUS.state,'active');

 w.state.question='Configuration absente';calls=0;
 w.fetch=async()=>{calls++;return {ok:false,status:503,json:async()=>({error:'not_configured'})};};
 render();await runNext();
 assert.equal(calls,1);
 assert.equal(w.document.querySelector('.story-reading').dataset.storyEngine,'external-error');
 assert.equal(w.document.querySelector('.story-reading').dataset.externalStatus,'config');
 assert.equal(w.CR_EXTERNAL_ENGINE_LAST_STATUS.reason,'not_configured');
 assert.equal(timers.length,0);

 w.state.question='Erreur réseau';calls=0;
 w.fetch=async()=>{calls++;throw Object.assign(new Error('offline'),{name:'TypeError'});};
 render();await runNext();
 assert.equal(w.document.querySelector('.story-reading').dataset.externalStatus,'retrying');
 await runNext();
 assert.equal(calls,2);
 assert.equal(w.document.querySelector('.story-reading').dataset.storyEngine,'external-error');
 assert.equal(w.document.querySelector('.story-reading').dataset.externalStatus,'network');
 assert.equal(w.CR_EXTERNAL_ENGINE_LAST_STATUS.state,'network');

 w.state.question='Texte invalide';calls=0;
 w.fetch=async()=>{calls++;return {ok:true,status:200,json:async()=>({text:'fragment'})};};
 render();await runNext();
 assert.equal(calls,1);
 assert.equal(w.document.querySelector('.story-reading').dataset.externalStatus,'retrying');
 await runNext();
 assert.equal(calls,2);
 assert.equal(w.document.querySelector('.story-reading').dataset.storyEngine,'external-error');
 assert.equal(w.document.querySelector('.story-reading').dataset.externalStatus,'quality');
 assert.match(w.document.querySelector('.story-engine-status').textContent,/contrôle qualité/);
 assert.equal(w.CR_EXTERNAL_ENGINE_LAST_STATUS.state,'quality');

 const savedCards=JSON.stringify(w.state.draw);
 w.fetch=async()=>({ok:true,status:200,json:async()=>({text:good})});
 w.document.querySelector('.story-retry').click();await runNext();
 assert.equal(w.CR_EXTERNAL_ENGINE_LAST_STATUS.state,'active');
 assert.equal(JSON.stringify(w.state.draw),savedCards);

 w.state.question='Rejet serveur corrigé';calls=0;const payloads=[];
 w.fetch=async(_url,options)=>{payloads.push(options.body);calls++;return calls===1?{ok:false,status:502,json:async()=>({error:'quality',reason:'external_grounding'})}:{ok:true,status:200,json:async()=>({text:good})};};
 render();await runNext();assert.equal(w.CR_EXTERNAL_ENGINE_LAST_STATUS.state,'retrying');await runNext();
 assert.equal(w.CR_EXTERNAL_ENGINE_LAST_STATUS.state,'active');assert.equal(calls,2);assert.equal(payloads[0],payloads[1]);
 dom.window.close();
});
