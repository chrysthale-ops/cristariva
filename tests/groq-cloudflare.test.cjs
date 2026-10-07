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
  assert.equal(prompts.length,2);
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

test('external-only risky draft is rewritten once before it is returned',async()=>{
 const {default:worker}=await import('../cloudflare/groq-worker.mjs');
 const data={lang:'fr',question:'Quelle évolution de ce lien ?',domain:'Sentimental',oracle:'tarot',cards:[{index:0,name:'Direction',role:'outcome',meaning:'Une perspective plus large invite à considérer une direction et un choix.',local:'',reversed:false}]};
 const request=new Request('https://relay.workers.dev/',{method:'POST',headers:{Origin:'https://chrysthale-ops.github.io','Content-Type':'application/json'},body:JSON.stringify(data)});
 const calls=[],original=global.fetch;
 try{
  global.fetch=async(_url,options)=>{
   const payload=JSON.parse(options.body);calls.push(payload);
   const text=calls.length===1
    ? 'Vous bénéficiez d’un horizon nouveau et il faut préparer une expansion plus ambitieuse du lien.'
    : 'Le tirage peut évoquer un moment où la direction du lien demande davantage de clarté. Une possibilité consiste à regarder ce qui pourrait évoluer sans présumer du choix final.';
   return {ok:true,json:async()=>({choices:[{finish_reason:'stop',message:{content:JSON.stringify({segments:[{index:0,text}]})}}]})};
  };
  const response=await worker.fetch(request,{GROQ_API_KEY:'test-key'});
  assert.equal(response.status,200);
  const body=await response.json();
  assert.equal(calls.length,2);
  assert.match(calls[1].messages[0].content,/Corrective editing pass/);
  assert.match(calls[1].messages[1].content,/draft_to_rewrite/);
  const edit=JSON.parse(calls[1].messages[1].content);
  assert.equal(edit.sentence_feedback.length,1);
  assert.deepEqual(edit.sentence_feedback[0].issues,['domain_vocabulary','prescriptive_wording','unsupported_fact']);
  assert.match(calls[1].messages[0].content,/Rewrite each flagged sentence completely/);
  assert.doesNotMatch(calls[1].messages[0].content,/all five card contributions/);
  assert.doesNotMatch(body.text,/horizon|expansion|il faut|vous bénéficiez/i);
  assert.match(body.text,/pourrait évoluer/);
 }finally{global.fetch=original;}
});

test('repairable editorial defects no longer reject a reading after the corrective pass',async()=>{
 const {default:worker}=await import('../cloudflare/groq-worker.mjs');
 const drafts=[
  'Une expansion du lien pourrait offrir une direction à envisager avec prudence.',
  'Il faut envisager la suite du lien avec prudence et sans présumer de la réponse.',
  'Une position renforcée pourrait donner une autre lecture de ce lien.',
  'Un malaise persiste dans ce lien et demande de regarder la situation avec attention.',
  'Un rapprochement se profile dans ce lien et pourrait permettre un échange.'
 ];
 const original=global.fetch;
 try{
  for(const text of drafts){
   let calls=0;
   global.fetch=async()=>{calls++;return {ok:true,json:async()=>({choices:[{finish_reason:'stop',message:{content:JSON.stringify({segments:[{index:0,text}]})}}]})};};
   const data={lang:'fr',question:'Quelle évolution ?',domain:'Sentimental',oracle:'tarot',cards:[{index:0,name:'Direction',role:'outcome',meaning:'Choix et clarification.',local:'',reversed:false}]};
   const request=new Request('https://relay.workers.dev/',{method:'POST',headers:{Origin:'https://chrysthale-ops.github.io'},body:JSON.stringify(data)});
   const response=await worker.fetch(request,{GROQ_API_KEY:'test-key'});
   assert.equal(response.status,200,text);
   assert.equal((await response.json()).text,text);
   assert.equal(calls,2,'One corrective call is attempted before accepting a residual editorial defect');
  }
 }finally{global.fetch=original;}
});

test('clearly invented factual events still reject a failed rewrite',async()=>{
 const {default:worker}=await import('../cloudflare/groq-worker.mjs');
 const drafts=[
  'Vous avez reçu une réponse qui change la façon de regarder ce lien.',
  'Votre effort a été remarqué et cela a renforcé le lien entre vous.'
 ];
 const original=global.fetch;
 try{
  for(const text of drafts){
   let calls=0;
   global.fetch=async()=>{calls++;return {ok:true,json:async()=>({choices:[{finish_reason:'stop',message:{content:JSON.stringify({segments:[{index:0,text}]})}}]})};};
   const data={lang:'fr',question:'Quelle évolution ?',domain:'Sentimental',oracle:'tarot',cards:[{index:0,name:'Direction',role:'outcome',meaning:'Choix et clarification.',local:'',reversed:false}]};
   const request=new Request('https://relay.workers.dev/',{method:'POST',headers:{Origin:'https://chrysthale-ops.github.io'},body:JSON.stringify(data)});
   const response=await worker.fetch(request,{GROQ_API_KEY:'test-key'});
   assert.equal(response.status,502,text);
   assert.deepEqual(await response.json(),{error:'quality',reason:'external_grounding'});
   assert.equal(calls,2,'Only one corrective call is allowed');
  }
 }finally{global.fetch=original;}
});

test('targeted editing preserves three cards, their roles, reversal and final contribution',async()=>{
 const {default:worker}=await import('../cloudflare/groq-worker.mjs');
 const data={lang:'fr',question:'Quelle évolution ?',domain:'Sentimental',oracle:'tarot',cards:[
  {index:0,name:'Initiative',role:'origin',meaning:'Un élan irrégulier.',local:'',reversed:true},
  {index:1,name:'Clarté',role:'evolution',meaning:'Clarté et chaleur.',local:'',reversed:false},
  {index:2,name:'Repos',role:'outcome',meaning:'Pause et recul.',local:'',reversed:false}
 ]};
 const accepted=[
  'Un élan irrégulier pourrait inviter à examiner la constance de votre démarche.',
  'Une parole plus claire pourrait aider à envisager ce lien avec davantage de chaleur.',
  'Cette ouverture invite toutefois à respecter une pause pour retrouver du recul.'
 ];
 const original=global.fetch;let calls=0;
 try{
  global.fetch=async(_url,options)=>{
   calls++;
   const payload=JSON.parse(options.body);
   if(calls===2){
    const edit=JSON.parse(payload.messages[1].content);
    assert.deepEqual(edit.cards,data.cards.map(({local,...card})=>card));
    assert.equal(edit.sentence_feedback.length,1);
    assert.deepEqual(edit.sentence_feedback[0].issues,['unsupported_time']);
    assert.equal(edit.cards.length,3);
   }
   const texts=calls===1?[accepted[0],'Une clarté pourrait récemment ouvrir une perspective plus chaleureuse pour ce lien.',accepted[2]]:accepted;
   return {ok:true,json:async()=>({choices:[{finish_reason:'stop',message:{content:JSON.stringify({segments:texts.map((text,index)=>({index,text}))})}}]})};
  };
  const request=new Request('https://relay.workers.dev/',{method:'POST',headers:{Origin:'https://chrysthale-ops.github.io'},body:JSON.stringify(data)});
  const response=await worker.fetch(request,{GROQ_API_KEY:'test-key'});
  assert.equal(response.status,200);
  assert.equal((await response.json()).text,accepted.join(' '));
  assert.equal(calls,2);
 }finally{global.fetch=original;}
});
