import quality from '../story-quality.js';
// CRISTARIVA Groq relay for Cloudflare Workers. No secret in this file.
const ALLOWED = new Set(['https://cristariva.netlify.app','https://chrysthale-ops.github.io']);
const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const EXTERNAL_ONLY_GUIDANCE=`External-only test profile: Ground every sentence in the user's question, the selected domain, the card role and the supplied card meaning. Never turn symbolic possibilities into factual history. Do not assert that an event already happened, that someone said, did, felt or wanted something, or that an expectation exists unless that fact is explicit in the question or supplied card text. If a connection is plausible but not directly supported, phrase it as a possibility (for example peut, pourrait, semble or invite à envisager in French) or omit it. Do not invent motives, hidden expectations, third parties, messages, meetings, reconciliations or commitments. Build the segments as consecutive parts of one narrative: each segment must connect naturally to what precedes and follows through meaning, tension, contrast or consequence. Do not announce card roles with mechanical phrases such as Le point de départ, L'obstacle, Comme ressource, L'évolution or Le résultat. Use vocabulary natural to the selected domain. In Sentimental or Relations, prefer concrete relational language such as lien, échange, rapprochement, distance, confiance, clarification, parole and choix relationnel; avoid abstract business or project wording such as expansion, horizon or stratégie unless the supplied text genuinely requires it. In Professionnelle / Projet, use work and project vocabulary. In Général / spirituel, use language about inner movement, choices and perspective. Before returning, silently audit every concrete claim: if it cannot be traced to the question or supplied card text, soften it into a possibility or delete it. Keep the conclusion cautious and conditional.`;
async function interpret(event,env){
 const origin=event.headers.origin||event.headers.Origin;
 const headers={'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin'};
 if(ALLOWED.has(origin))headers['Access-Control-Allow-Origin']=origin;
 const reply=(statusCode,data)=>({statusCode,headers,body:JSON.stringify(data)});
 if(!ALLOWED.has(origin))return reply(403,{error:'origin'});
 if(event.httpMethod==='OPTIONS'){headers['Access-Control-Allow-Headers']='Content-Type';headers['Access-Control-Allow-Methods']='POST, OPTIONS';return reply(204,{});}
 if(event.httpMethod!=='POST')return reply(405,{error:'method'});
 if(!env.GROQ_API_KEY)return reply(503,{error:'not_configured'});
 if(!event.body||event.body.length>60000)return reply(413,{error:'size'});
 let input;
 try{input=JSON.parse(event.body);}catch{return reply(400,{error:'json'});}
 const bounded=(s,n)=>typeof s==='string'&&s.length<=n;
 if(!['fr','en'].includes(input.lang)||!bounded(input.question,2000)||!bounded(input.domain,100)||!bounded(input.oracle,100)||!Array.isArray(input.cards)||input.cards.length<1||input.cards.length>15||input.cards.some((c,i)=>c.index!==i||!bounded(c.name,150)||!bounded(c.meaning,4000)||!bounded(c.role,100)||!bounded(c.local,4000)||typeof c.reversed!=='boolean'))return reply(400,{error:'input'});
 const schema={type:'object',additionalProperties:false,required:['segments'],properties:{segments:{type:'array',items:{type:'object',additionalProperties:false,required:['index','text'],properties:{index:{type:'integer'},text:{type:'string'}}}}}};
 // The isolated external test deliberately sends no local interpretation.
 // Keep the hybrid prompt byte-for-byte unchanged whenever local guidance is present.
 const externalOnly=input.cards.every(c=>!c.local.trim());
 const system=externalOnly?quality.system+' '+EXTERNAL_ONLY_GUIDANCE:quality.system;
 try{
 const response=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{Authorization:'Bearer '+env.GROQ_API_KEY,'Content-Type':'application/json'},signal:AbortSignal.timeout(18000),body:JSON.stringify({model:env.GROQ_MODEL||'openai/gpt-oss-120b',messages:[{role:'system',content:system},{role:'user',content:JSON.stringify(input)}],response_format:{type:'json_schema',json_schema:{name:'reading',strict:true,schema}},max_completion_tokens:6000})});
 if(!response.ok)return reply(response.status===429?429:502,{error:'provider_unavailable'});
 const data=await response.json();
 if(data.choices?.[0]?.finish_reason!=='stop')return reply(502,{error:'incomplete'});
 const result=JSON.parse(data.choices[0].message.content);
 if(!Array.isArray(result.segments)||result.segments.length!==input.cards.length||result.segments.some((s,i)=>s.index!==i||!bounded(s.text,3500)||s.text.trim().length<40))return reply(502,{error:'coverage'});
 const text=result.segments.map(s=>s.text.trim()).join(' ');
 // Multiword card titles must not leak into the continuous story.
 if(input.cards.some(c=>c.name.trim().split(/\s+/).length>1&&normalize(text).includes(normalize(c.name))))return reply(502,{error:'card_names'});
 const qualityError=quality.validate(text,input);
 if(qualityError)return reply(502,{error:'quality',reason:qualityError});
 return reply(200,{text,engine:'groq-hybrid-v2'});
 }catch{return reply(502,{error:'provider_unavailable'});}
};

export default {
 async fetch(request,env){
  if(request.method==='GET'&&new URL(request.url).pathname==='/health')
   return Response.json({service:'cristariva-groq',configured:Boolean(env.GROQ_API_KEY)});
  // Optional Cloudflare rate-limiter binding configured via wrangler.jsonc.
  if(request.method==='POST'&&env.GROQ_LIMITER){
   const {success}=await env.GROQ_LIMITER.limit({key:request.headers.get('CF-Connecting-IP')||'unknown'});
   if(!success)return Response.json({error:'rate_limit'},{status:429});
  }
  const event={httpMethod:request.method,headers:Object.fromEntries(request.headers),body:request.method==='POST'?await request.text():''};
  const result=await interpret(event,env);
  return new Response(result.statusCode===204?null:result.body,{status:result.statusCode,headers:result.headers});
 }
};
