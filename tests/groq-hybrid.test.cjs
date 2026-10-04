const {test}=require('node:test');const assert=require('node:assert/strict');const {handler}=require('../netlify/lib/groq.cjs');
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
 global.fetch=async()=>({ok:true,json:async()=>({choices:[{finish_reason:'stop',message:{content:'{"segments":[]}'}}]})});assert.equal((await handler(event)).statusCode,502);
 global.fetch=async()=>({ok:false,status:429});assert.equal((await handler(event)).statusCode,429);
 global.fetch=async()=>{throw Error('network');};assert.equal((await handler(event)).statusCode,502);
 }finally{global.fetch=saved;if(secret===undefined)delete process.env.GROQ_API_KEY;else process.env.GROQ_API_KEY=secret;}
});
