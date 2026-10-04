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
