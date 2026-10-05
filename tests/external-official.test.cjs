const {test}=require('node:test');
const assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../groq-hybrid-story.js'),'utf8');
const quality=require('../story-quality.js');
test('official story uses only external prose, handles rejection and keeps roles and reversals',async()=>{
 const dom=new JSDOM('<main></main>',{runScripts:'outside-only'}),w=dom.window;
 const cards=[{id:1,name:'Première',reading_relationnel:'Initiative'},{id:2,name:'Deuxième',reading_relationnel:'Clarté'},{id:3,name:'Dernière',reading_relationnel:'Pause'}];
 w.state={lang:'fr',question:'<img src=x onerror=alert(1)>',domain:'Sentimental',oracle:'tarot',draw:cards,tarotReversed:[true,false,false]};
 w.CR_TAROT_REVERSED={1:{fr:'Une initiative irrégulière.'}};
 w.CR_UNIVERSAL_FLUID_STORY=()=>{throw Error('Internal story must not run');};
 w.CR_UNIVERSAL_ROLE_SUMMARY=()=>{throw Error('Internal summary must not run');};
 w.storyInterpretation=()=>{};w.interpretation=()=>{};
 w.CR_STORY_QUALITY=quality;w.AbortSignal=AbortSignal;
 const timers=[];w.setTimeout=fn=>timers.push(fn);
 const good='Une clarification pourrait aider à envisager le lien avec davantage de recul.';
 let sent,calls=0;
 w.fetch=async(_url,options)=>{calls++;sent=JSON.parse(options.body);return {ok:true,json:async()=>({text:good})};};
 w.eval(source);
 const render=()=>{w.document.querySelector('main').innerHTML=w.CR_UNIVERSAL_FLUID_STORY(cards);};
 render();assert.match(w.document.body.textContent,/cours de rédaction/);
 assert.equal(w.document.querySelector('img'),null);
 await timers.shift()();
 assert.equal(w.document.querySelector('.story-continuous').textContent,good);
 assert.deepEqual(sent.cards.map(c=>c.local),['','','']);
 assert.deepEqual(sent.cards.map(c=>c.role),['origin','evolution','outcome']);
 assert.equal(sent.cards[0].reversed,true);assert.equal(sent.cards[0].meaning,'Une initiative irrégulière.');
 render();assert.equal(calls,1);assert.equal(w.document.querySelector('.story-continuous').textContent,good);
 for(const status of [429,502,503]){
  w.state.question='Échec '+status;w.fetch=async()=>({ok:false,status});render();await timers.shift()();
  assert.equal(w.document.querySelector('.story-reading').dataset.storyEngine,'external-error');
  assert.doesNotMatch(w.document.querySelector('.story-continuous').textContent,/cours de rédaction/);
 }
 w.state.question='Texte invalide';w.fetch=async()=>({ok:true,json:async()=>({text:'fragment'})});render();await timers.shift()();
 assert.equal(w.document.querySelector('.story-reading').dataset.storyEngine,'external-error');
 dom.window.close();
});
