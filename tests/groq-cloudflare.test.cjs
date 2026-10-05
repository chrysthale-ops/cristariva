const {test}=require('node:test');const assert=require('node:assert/strict');
test('Cloudflare relay keeps the key server-side and checks coverage',async()=>{
 const {default:worker}=await import('../cloudflare/groq-worker.mjs');
 const data={lang:'fr',question:'Quelle évolution ?',domain:'Sentimental',oracle:'tarot',cards:[{index:0,name:'Le Soleil',role:'outcome',meaning:'Clarté',local:'Une clarification possible.',reversed:false}]};
 const request=()=>new Request('https://relay.workers.dev/',{method:'POST',headers:{Origin:'https://chrysthale-ops.github.io','Content-Type':'application/json'},body:JSON.stringify(data)});
 assert.equal((await worker.fetch(request(),{})).status,503);
 const health=await worker.fetch(new Request('https://relay.workers.dev/health'),{GROQ_API_KEY:'test-key'});assert.deepEqual(await health.json(),{service:'cristariva-groq',configured:true});
 const original=global.fetch;
 try{
 global.fetch=async()=>({ok:true,json:async()=>({choices:[{finish_reason:'stop',message:{content:JSON.stringify({segments:[{index:0,text:'Une clarification devient possible et permet de regarder la relation avec davantage de confiance.'}]})}}]})});
 const result=await worker.fetch(request(),{GROQ_API_KEY:'test-key'});assert.equal(result.status,200);assert.equal(result.headers.get('Access-Control-Allow-Origin'),'https://chrysthale-ops.github.io');assert.ok(!(await result.text()).includes('test-key'));
 assert.equal((await worker.fetch(request(),{GROQ_API_KEY:'test-key',GROQ_LIMITER:{limit:async()=>({success:false})}})).status,429);
 global.fetch=async()=>({ok:true,json:async()=>({choices:[{finish_reason:'stop',message:{content:'{"segments":[]}'}}]})});
 assert.equal((await worker.fetch(request(),{GROQ_API_KEY:'test-key'})).status,502);
 }finally{global.fetch=original;}
});

test('external-only readings get stricter grounding without changing the hybrid prompt',async()=>{
 const {default:worker}=await import('../cloudflare/groq-worker.mjs');
 const quality=require('../story-quality.js');
 const makeData=local=>({lang:'fr',question:'Quelle évolution ?',domain:'Sentimental',oracle:'tarot',cards:[{index:0,name:'Clarté',role:'outcome',meaning:'Une vérité se précise et une parole nette peut dissiper une confusion.',local,reversed:false}]});
 const request=data=>new Request('https://relay.workers.dev/',{method:'POST',headers:{Origin:'https://chrysthale-ops.github.io','Content-Type':'application/json'},body:JSON.stringify(data)});
 const prompts=[],original=global.fetch;
 try{
  global.fetch=async(_url,options)=>{prompts.push(JSON.parse(options.body).messages[0].content);return {ok:true,json:async()=>({choices:[{finish_reason:'stop',message:{content:JSON.stringify({segments:[{index:0,text:'Une clarification pourrait devenir possible si une parole nette permet de dissiper la confusion actuelle.'}]})}}]})};};
  assert.equal((await worker.fetch(request(makeData('Une clarification possible.')),{GROQ_API_KEY:'test-key'})).status,200);
  assert.equal((await worker.fetch(request(makeData('')),{GROQ_API_KEY:'test-key'})).status,200);
  assert.equal(prompts[0],quality.system);
  assert.match(prompts[1],/^You write CRISTARIVA/);
  assert.match(prompts[1],/External-only test profile/);
  assert.match(prompts[1],/Never turn symbolic possibilities into factual history/);
  assert.match(prompts[1],/card role is an interpretive lens/);
  assert.match(prompts[1],/la situation a commencé/);
  assert.match(prompts[1],/cela a renforcé le lien/);
  assert.match(prompts[1],/un malaise persiste/);
  assert.match(prompts[1],/prise de conscience récente/);
  assert.match(prompts[1],/Never create causality between cards/);
  assert.match(prompts[1],/expansion du lien/);
  assert.match(prompts[1],/il faut/);
  assert.match(prompts[1],/Le point de départ/);
  assert.match(prompts[1],/Sentimental or Relations/);
 }finally{global.fetch=original;}
});
