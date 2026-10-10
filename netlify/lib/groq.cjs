const quality=require('../../story-quality.js');
'use strict';
const ALLOWED = new Set(['https://cristariva.netlify.app','https://chrysthale-ops.github.io']);
exports.handler=async function(event){
 const origin=event.headers.origin||event.headers.Origin;
 const headers={'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin'};
 if(ALLOWED.has(origin))headers['Access-Control-Allow-Origin']=origin;
 const reply=(statusCode,data)=>({statusCode,headers,body:JSON.stringify(data)});
 if(!ALLOWED.has(origin))return reply(403,{error:'origin'});
 if(event.httpMethod==='OPTIONS'){headers['Access-Control-Allow-Headers']='Content-Type';headers['Access-Control-Allow-Methods']='POST, OPTIONS';return reply(204,{});}
 if(event.httpMethod!=='POST')return reply(405,{error:'method'});
 if(!process.env.GROQ_API_KEY)return reply(503,{error:'not_configured'});
 if(!event.body||event.body.length>60000)return reply(413,{error:'size'});
 let input;
 try{input=JSON.parse(event.body);}catch{return reply(400,{error:'json'});}
 const bounded=(s,n)=>typeof s==='string'&&s.length<=n;
 if(!['fr','en'].includes(input.lang)||!bounded(input.question,2000)||(input.context!==undefined&&!bounded(input.context,2000))||!bounded(input.domain,100)||!bounded(input.oracle,100)||!Array.isArray(input.cards)||input.cards.length<1||input.cards.length>15||input.cards.some((c,i)=>c.index!==i||!bounded(c.name,150)||!bounded(c.meaning,4000)||!bounded(c.role,100)||!bounded(c.local,4000)||typeof c.reversed!=='boolean'))return reply(400,{error:'input'});
 const schema={type:'object',additionalProperties:false,required:['segments'],properties:{segments:{type:'array',items:{type:'object',additionalProperties:false,required:['index','text'],properties:{index:{type:'integer'},text:{type:'string'}}}}}};
 const system=quality.system;
 try{
 const callProvider=async(systemPrompt,payload)=>{
  const response=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{Authorization:'Bearer '+process.env.GROQ_API_KEY,'Content-Type':'application/json'},signal:AbortSignal.timeout(18000),body:JSON.stringify({model:process.env.GROQ_MODEL||'openai/gpt-oss-120b',messages:[{role:'system',content:systemPrompt},{role:'user',content:JSON.stringify(payload)}],response_format:{type:'json_schema',json_schema:{name:'reading',strict:true,schema}},max_completion_tokens:6000})});
  if(!response.ok)return {status:response.status===429?429:502,error:'provider_unavailable'};
  const data=await response.json();
  if(data.choices?.[0]?.finish_reason!=='stop')return {status:502,error:'incomplete'};
  return {result:JSON.parse(data.choices[0].message.content)};
 };
 const readText=result=>{
  if(!Array.isArray(result?.segments)||result.segments.length!==input.cards.length||result.segments.some((s,i)=>s.index!==i||!bounded(s.text,3500)||s.text.trim().length<40))return null;
  return result.segments.map(s=>s.text.trim()).join(' ');
 };
 let call=await callProvider(system,input);
 if(call.error)return reply(call.status,{error:call.error});
 let text=readText(call.result);
 if(!text)return reply(502,{error:'coverage'});
 const issues=quality.editorialIssues(text,input),initialError=quality.validate(text,input);
 if(initialError)issues.push('shared_'+initialError);
 if(issues.length){
  // One corrective attempt; no fallback or replacement of prose fragments.
  call=await callProvider(system+' '+quality.rewriteGuidance,{...input,draft_to_rewrite:text,detected_issues:[...new Set(issues)]});
  if(call.error)return reply(call.status,{error:call.error});
  text=readText(call.result);
  if(!text)return reply(502,{error:'coverage'});
 }
 const qualityError=quality.validate(text,input);
 if(qualityError)return reply(502,{error:'quality',reason:qualityError});
 return reply(200,{text,engine:'groq-hybrid-v2'});
 }catch{return reply(502,{error:'provider_unavailable'});}
};
