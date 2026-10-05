const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const {handler}=require('../netlify/lib/groq.cjs');

test('relay validates requests and provider coverage',async()=>{
 const event={httpMethod:'POST',headers:{origin:'https://cristariva.netlify.app'},body:JSON.stringify({lang:'fr',question:'Quelle évolution ?',domain:'Sentimental',oracle:'tarot',cards:[{index:0,name:'Le Soleil',role:'outcome',meaning:'Clarté',local:'Une clarification possible.',reversed:false}]})};
 const saved=global.fetch;const secret=process.env.GROQ_API_KEY;
 try{
  delete process.env.GROQ_API_KEY;assert.equal((await handler(event)).statusCode,503);
  process.env.GROQ_API_KEY='test-only';
  assert.equal((await handler({...event,headers:{origin:'https://example.org'}})).statusCode,403);
  assert.equal((await handler({...event,body:'{'})).statusCode,400);
  assert.equal((await handler({...event,httpMethod:'OPTIONS'})).statusCode,204);
  let outgoing;
  global.fetch=async(url,opts)=>{outgoing=JSON.parse(opts.body);return {ok:true,json:async()=>({choices:[{finish_reason:'stop',message:{content:JSON.stringify({segments:[{index:0,text:'La situation peut devenir plus claire et vous permettre de dialoguer avec davantage de confiance.'}]})}}]})};};
  const result=await handler(event);assert.equal(result.statusCode,200);assert.equal(outgoing.messages.length,2);assert.match(JSON.parse(result.body).text,/plus claire/);assert.ok(!result.body.includes('test-only'));
  global.fetch=async()=>({ok:true,json:async()=>({choices:[{finish_reason:'stop',message:{content:'{\"segments\":[]}'}}]})});assert.equal((await handler(event)).statusCode,502);
  global.fetch=async()=>({ok:false,status:429});assert.equal((await handler(event)).statusCode,429);
  global.fetch=async()=>{throw Error('network');};assert.equal((await handler(event)).statusCode,502);
 }finally{global.fetch=saved;if(secret===undefined)delete process.env.GROQ_API_KEY;else process.env.GROQ_API_KEY=secret;}
});

test('browser hybrid reports status and retries one transient provider failure',async()=>{
 const dom=new JSDOM('<!doctype html><body></body>',{runScripts:'outside-only',url:'https://cristariva.netlify.app/'});
 const {window}=dom;
 const card={id:1,name:'Six d’Épées',definition:'Une transition progressive.',reading_relationnel:'Un passage demande de quitter une tension sans précipiter la suite.'};
 window.state={lang:'fr',question:'Retour ou nouvelle rencontre ?',domain:'Sentimental',oracle:'tarot',draw:[card],tarotReversed:[false]};
 window.CR_UNIVERSAL_ROLE_SUMMARY=()=> 'Le passage reste progressif et demande de ne pas forcer la suite.';
 window.CR_STORY_QUALITY={validate:()=>''};
 window.CR_UNIVERSAL_FLUID_STORY=()=>'<div class="story-reading"><p class="story-continuous">Récit local conservé.</p></div>';
 window.storyInterpretation=window.interpretation=()=>'';
 window.AbortSignal={timeout:()=>undefined};
 let calls=0;
 window.fetch=async()=>{
  calls++;
  if(calls===1)return {ok:false,status:502,json:async()=>({error:'provider_unavailable'})};
  return {ok:true,status:200,json:async()=>({text:'Une clarification pourrait ouvrir un échange plus lisible, sans garantir à elle seule la forme que prendra la suite.'})};
 };
 const source=fs.readFileSync(path.join(__dirname,'..','groq-hybrid-story.js'),'utf8');
 window.eval(source);
 window.document.body.innerHTML=window.CR_UNIVERSAL_FLUID_STORY([card]);
 assert.match(window.document.body.textContent,/Moteur externe : connexion en cours/);
 await new Promise(resolve=>setTimeout(resolve,650));
 assert.equal(calls,2);
 assert.match(window.document.querySelector('.story-continuous').textContent,/clarification pourrait ouvrir/);
 assert.match(window.document.querySelector('.story-engine-status').textContent,/Moteur externe : actif/);
 assert.equal(window.document.querySelector('.story-reading').dataset.storyEngine,'groq-hybrid-v2');
 assert.equal(window.CR_EXTERNAL_ENGINE_LAST_STATUS.code,'success');
 dom.window.close();
});

test('browser hybrid keeps the local story and exposes a quality rejection',async()=>{
 const dom=new JSDOM('<!doctype html><body></body>',{runScripts:'outside-only',url:'https://cristariva.netlify.app/'});
 const {window}=dom;
 const card={id:2,name:'Le Soleil',definition:'Clarté.',reading_relationnel:'Une clarification est possible.'};
 window.state={lang:'fr',question:'Quelle évolution ?',domain:'Sentimental',oracle:'tarot',draw:[card],tarotReversed:[false]};
 window.CR_UNIVERSAL_ROLE_SUMMARY=()=> 'Une clarification est possible.';
 window.CR_STORY_QUALITY={validate:()=> 'unsupported_reciprocity'};
 window.CR_UNIVERSAL_FLUID_STORY=()=>'<div class="story-reading"><p class="story-continuous">Récit local conservé.</p></div>';
 window.storyInterpretation=window.interpretation=()=>'';
 window.AbortSignal={timeout:()=>undefined};
 window.fetch=async()=>({ok:true,status:200,json:async()=>({text:'Les sentiments sont réciproques.'})});
 const source=fs.readFileSync(path.join(__dirname,'..','groq-hybrid-story.js'),'utf8');
 window.eval(source);
 window.document.body.innerHTML=window.CR_UNIVERSAL_FLUID_STORY([card]);
 await new Promise(resolve=>setTimeout(resolve,40));
 assert.equal(window.document.querySelector('.story-continuous').textContent,'Récit local conservé.');
 assert.match(window.document.querySelector('.story-engine-status').textContent,/rejetée par le contrôle qualité/);
 assert.equal(window.document.querySelector('.story-reading').dataset.storyEngine,'local-fallback');
 assert.equal(window.CR_EXTERNAL_ENGINE_LAST_STATUS.code,'quality');
 dom.window.close();
});
