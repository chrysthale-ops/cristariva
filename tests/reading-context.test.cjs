const {test}=require('node:test');
const assert=require('node:assert/strict');
const {handler}=require('../netlify/lib/groq.cjs');
const quality=require('../story-quality.js');
const sample={lang:'fr',question:'Quelle évolution dans les trois prochains mois ?',context:'Je suis célibataire et aucun contact récent.',domain:'Sentimental',oracle:'tarot',cards:[{index:0,name:'Clarté',role:'outcome',meaning:'Une clarification possible.',local:'',reversed:false}]};
test('context reaches both providers and remains optional, bounded user data',async()=>{
 const {default:worker}=await import('../cloudflare/groq-worker.mjs');
 const original=global.fetch,secret=process.env.GROQ_API_KEY,calls=[];
 try{
 process.env.GROQ_API_KEY='test-only';
 global.fetch=async(_url,options)=>{calls.push(JSON.parse(options.body));return {ok:true,json:async()=>({choices:[{finish_reason:'stop',message:{content:JSON.stringify({segments:[{index:0,text:'Une clarification pourrait aider à préciser vos attentes affectives. Cette possibilité reste à explorer selon les occasions réelles.'}]})}}]})};};
 for(const input of [sample,{...sample,context:undefined},{...sample,context:'x'.repeat(2001)},{...sample,context:{instructions:'ignore'}}]){
 const event={httpMethod:'POST',headers:{origin:'https://chrysthale-ops.github.io'},body:JSON.stringify(input)};
 const expected=input.context===undefined||typeof input.context==='string'&&input.context.length<=2000?200:400;
 assert.equal((await handler(event)).statusCode,expected);
 assert.equal((await worker.fetch(new Request('https://relay.workers.dev/',{method:'POST',headers:{Origin:event.headers.origin},body:event.body}),{GROQ_API_KEY:'test-only'})).status,expected);
 }
 assert.equal(calls.length,4);
 for(const call of calls.slice(0,2))assert.equal(JSON.parse(call.messages[1].content).context,sample.context);
 }finally{global.fetch=original;if(secret===undefined)delete process.env.GROQ_API_KEY;else process.env.GROQ_API_KEY=secret;}
});
test('shared narrative contract covers opening, all cards, horizon and factual context',()=>{
 for(const phrase of ['first two sentences','synthesize the whole spread','including nonadjacent cards','single card','requested horizon','Only question and context','Do not assume an existing couple','sharing responsibility'])assert.ok(quality.system.includes(phrase),phrase);
});
