const {test}=require('node:test');
const assert=require('node:assert/strict');
const quality=require('../story-quality.js');
const {handler}=require('../netlify/lib/groq.cjs');
const input={lang:'fr',question:'Est-ce que Kinya envisage de me recontacter ?',context:'Silence radio actuellement. Amicale pour lui et sentimentale pour moi.',domain:'Sentimental',oracle:'reflets',cards:[{index:0,name:'Silence',role:'outcome',meaning:'Absence de réponse ; ne pas inventer sa cause.',local:'',reversed:false}]};
test('reported card announcements are rejected, common prose remains valid',()=>{
 const sample={...input,cards:[{name:'Âme sœur'},{name:'Épreuve'},{name:'Éloignement'},{name:'Silence'},{name:'Lien amoureux'}]};
 for(const text of ['Le thème de l’Âme sœur suggère une familiarité profonde.','L’Épreuve indique une période de tension dans ce lien.','L’Éloignement, présenté comme ressource, apparaît comme un avertissement.','Le Silence reflète une absence de réponse dans ce lien.','Le Lien amoureux confirme une proximité affective dans ce lien.'])assert.equal(quality.validate(text,sample),'card_names',text);
 for(const text of ['Le silence peut laisser une question ouverte sans permettre de connaître sa cause.','La distance peut inviter à respecter les limites de chacun sans garantir une reprise de contact.','Cette épreuve peut inviter à examiner ce qui limite une ouverture affective.'])assert.equal(quality.validate(text,sample),'',text);
});
test('review flags private intentions and invented explanations without rejecting all cautious prose',()=>{
 assert.ok(quality.editorialIssues('Il se peut que Kinya envisage de reprendre contact.',input).includes('private_intention'));
 assert.ok(quality.editorialIssues('Le silence semble être un moment de réflexion.',input).includes('invented_silence_explanation'));
 assert.ok(!quality.editorialIssues('Le silence semble être un moment de réflexion.',{...input,context:'Il a demandé un temps de réflexion.'}).includes('invented_silence_explanation'));
 assert.ok(quality.editorialIssues('Le détachement pourrait préparer le terrain à son retour.',input).includes('return_lever'));
 assert.deepEqual(quality.editorialIssues('Ce tirage évoque une ouverture limitée par la distance. Un éventuel message ne prouverait pas un changement de sentiments.',input),[]);
});
test('both relays rewrite flagged draft once with context and preserve coverage',async()=>{
 const {default:worker}=await import('../cloudflare/groq-worker.mjs');
 const saved=global.fetch,secret=process.env.GROQ_API_KEY;
 const revised='Ce tirage laisse la reprise de contact incertaine. Selon votre contexte, un éventuel échange amical ne prouverait pas une réciprocité sentimentale.';
 try{
 process.env.GROQ_API_KEY='test-only';
 for(const relay of ['netlify','cloudflare']){
 let calls=0;
 global.fetch=async(_url,options)=>{
  calls++;const payload=JSON.parse(options.body);
  if(calls===2){const edit=JSON.parse(payload.messages[1].content);assert.equal(edit.context,input.context);assert.equal(edit.cards[0].role,'outcome');assert.equal(edit.cards[0].reversed,false);assert.ok(edit.detected_issues.includes('private_intention'));assert.ok(payload.messages[0].content.includes(quality.rewriteGuidance));}
  return {ok:true,json:async()=>({choices:[{finish_reason:'stop',message:{content:JSON.stringify({segments:[{index:0,text:calls===1?'Il se peut que Kinya envisage de reprendre contact. Une clarification de ses sentiments pourrait permettre un échange.':revised}]})}}]})};
 };
 const event={httpMethod:'POST',headers:{origin:'https://chrysthale-ops.github.io'},body:JSON.stringify(input)};
 const result=relay==='netlify'?await handler(event):await worker.fetch(new Request('https://relay.workers.dev/',{method:'POST',headers:{Origin:event.headers.origin},body:event.body}),{GROQ_API_KEY:'test-only'});
 assert.equal(relay==='netlify'?result.statusCode:result.status,200);
 assert.equal((relay==='netlify'?JSON.parse(result.body):await result.json()).text,revised);
 assert.equal(calls,2);
 }
 }finally{global.fetch=saved;if(secret===undefined)delete process.env.GROQ_API_KEY;else process.env.GROQ_API_KEY=secret;}
});
