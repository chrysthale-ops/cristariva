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
const returnInput={lang:'fr',question:"Un retour d'une personne",context:'',domain:'Relations',oracle:'tarot',cards:[{index:0,name:'Roi d’Épées',role:'origin',meaning:'Rigidité ; confronter les points de vue.',local:'',reversed:true},{index:1,name:'La Maison Dieu',role:'obstacle',meaning:'Structure fragile.',local:'',reversed:true},{index:2,name:'As de Bâtons',role:'resource',meaning:'Élan dispersé.',local:'',reversed:true},{index:3,name:'La Force',role:'evolution',meaning:'Épuisement du contrôle.',local:'',reversed:true},{index:4,name:'Le Pendu',role:'outcome',meaning:'Attente sans recul.',local:'',reversed:true}]};
test('reported reversed card labels are rejected without rejecting ordinary words',()=>{
 for(const text of ['Le Roi d’Épées inversé indique un jugement rigide.','La Maison Dieu inversée montre une structure fragile.','L’As de Bâtons renversé révèle un élan dispersé.','La Force à l’envers indique une tension qui épuise.','Le Pendu inversé signale une attente prolongée.'])assert.equal(quality.validate(text,returnInput),'card_names',text);
 assert.equal(quality.validate('Une force intérieure peut vous aider à poser vos limites sans contrôler la décision de cette personne.',returnInput),'');
});
test('return must not depend on user blame or invented relationship causes',()=>{
 assert.equal(quality.validate('Un retour ne pourra se concrétiser que si vous passez d’une attitude rigide à une action décisive.',returnInput),'user_controls_return');
 assert.equal(quality.validate('La structure du lien semble encore maintenue par la peur d’une rupture.',returnInput),'invented_relationship_cause');
 assert.equal(quality.validate('Ce lien est maintenu par la peur d’une rupture.',{...returnInput,context:'Nous maintenons ce lien par peur de la rupture.'}),'');
 assert.equal(quality.validate('Ce tirage ne soutient pas clairement un retour. Un rapprochement reste incertain et demanderait des signes concrets venant aussi de cette personne.',returnInput),'');
});
test('both relays rewrite the reported return condition and reject it if it persists',async()=>{
 const {default:worker}=await import('../cloudflare/groq-worker.mjs');
 const saved=global.fetch,secret=process.env.GROQ_API_KEY;
 const data={...returnInput,cards:[returnInput.cards[0]]};
 const draft='Un retour ne pourra se concrétiser que si vous passez d’une attitude rigide à une action décisive.';
 const corrected='Ce tirage laisse le retour incertain. Une ouverture demanderait des signes concrets de cette personne ; vos choix ne peuvent garantir sa décision.';
 try{process.env.GROQ_API_KEY='test-only';for(const relay of ['netlify','cloudflare'])for(const persists of [false,true]){
 let calls=0;global.fetch=async(_url,options)=>{calls++;const body=JSON.parse(options.body);if(calls===2)assert.ok(JSON.parse(body.messages[1].content).detected_issues.some(x=>x.includes('user_controls_return')));return {ok:true,json:async()=>({choices:[{finish_reason:'stop',message:{content:JSON.stringify({segments:[{index:0,text:calls===1||persists?draft:corrected}]})}}]})};};
 const event={httpMethod:'POST',headers:{origin:'https://chrysthale-ops.github.io'},body:JSON.stringify(data)};
 const result=relay==='netlify'?await handler(event):await worker.fetch(new Request('https://relay.workers.dev/',{method:'POST',headers:{Origin:event.headers.origin},body:event.body}),{GROQ_API_KEY:'test-only'});
 assert.equal(relay==='netlify'?result.statusCode:result.status,persists?502:200);assert.equal(calls,2);
 }}finally{global.fetch=saved;if(secret===undefined)delete process.env.GROQ_API_KEY;else process.env.GROQ_API_KEY=secret;}
});
