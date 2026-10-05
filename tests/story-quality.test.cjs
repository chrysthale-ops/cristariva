const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM}=require('jsdom');
const quality=require('../story-quality.js');
const {handler}=require('../netlify/lib/groq.cjs');
const input={lang:'fr',question:'Le retour de Kinya',domain:'Sentimental',oracle:'tarot',cards:[{index:0,name:'Valet de Bâtons',role:'origin',reversed:true,meaning:'Une initiative manque de constance.',local:'Un élan de rapprochement manque de constance.'}]};
const valid='Un élan de rapprochement peut manquer de constance. Des échanges réguliers permettraient de savoir si cette ouverture peut se concrétiser.';
const broken='Dans le passé, une idée pleine d promise a manqué de constance, créant une dynamique hésitante.';
test('quality gate rejects damaged or unsupported prose but only flags repairable editorial defects',()=>{
 for(const text of [broken,valid.replace('rapprochement','rapprochement d promise'),valid.slice(0,-1),'La joie partagée et la confiance naissante permettent aux sentiments de s’exprimer simplement.'])assert.ok(quality.validate(text,input),text);
 for(const text of [valid,'Aujourd’hui, '+valid,'Un échange semble possible. Pour l’avenir, le silence reste nécessaire.',valid+' '+valid,'Une idée pleine de promesses peut avoir un coût élevé. Il reste utile de vérifier son intérêt concret.',"L'élan d’un rapprochement mérite d’être observé avant de conclure."])assert.equal(quality.validate(text,input),'',text);
 assert.deepEqual(quality.editorialIssues('Aujourd’hui, '+valid),['stock_opening']);
 assert.deepEqual(quality.editorialIssues(valid+' '+valid),['repetition']);
 assert.equal(quality.validate('La joie partagée et la confiance naissante permettent aux sentiments de s’exprimer simplement.',{...input,cards:[{...input.cards[0],local:'Sans établir la réciprocité des sentiments.'}]}),'unsupported_reciprocity');
 assert.equal(quality.validate('A promising idea needs to be tried in practice before making a lasting commitment.',{...input,lang:'en'}),'');
});
test('natural multiword card-title phrases are allowed but explicit card labels are rejected',()=>{
 const sample={lang:'fr',question:'ma sexualité',domain:'Sentimental',oracle:'cristariva',cards:[
  {index:0,name:'Âme jumelle',role:'obstacle',reversed:false,meaning:'Relation miroir.',local:''},
  {index:1,name:'Nouveau départ',role:'resource',reversed:false,meaning:'Cycle neuf.',local:''}
 ]};
 const natural='Votre désir peut s’ouvrir à un nouveau départ sans effacer vos besoins actuels. L’idée d’une âme jumelle peut aussi inviter à distinguer fantasme, projection et relation vécue.';
 assert.equal(quality.validate(natural,sample),'');
 assert.equal(quality.validate('La carte Nouveau départ indique une ouverture possible dans votre rapport au désir et à l’intimité.',sample),'card_names');
 assert.equal(quality.validate('Âme jumelle : cette image peut inviter à observer les projections affectives dans votre intimité.',sample),'card_names');
});
test('both relays reject the reported malformed response and accept grammatical prose',async()=>{
 const {default:worker}=await import('../cloudflare/groq-worker.mjs');
 const original=global.fetch,secret=process.env.GROQ_API_KEY;
 try{
 process.env.GROQ_API_KEY='test-only';
 for(const text of [broken,valid]){
 global.fetch=async()=>({ok:true,json:async()=>({choices:[{finish_reason:'stop',message:{content:JSON.stringify({segments:[{index:0,text}]})}}]})});
 const event={httpMethod:'POST',headers:{origin:'https://chrysthale-ops.github.io'},body:JSON.stringify(input)};
 assert.equal((await handler(event)).statusCode,text===valid?200:502);
 const req=new Request('https://relay.workers.dev/',{method:'POST',headers:{Origin:event.headers.origin},body:event.body});
 assert.equal((await worker.fetch(req,{GROQ_API_KEY:'test-only'})).status,text===valid?200:502);
 }
 }finally{global.fetch=original;if(secret===undefined)delete process.env.GROQ_API_KEY;else process.env.GROQ_API_KEY=secret;}
});
test('both relays accept a natural phrase that matches a multiword card title',async()=>{
 const {default:worker}=await import('../cloudflare/groq-worker.mjs');
 const original=global.fetch,secret=process.env.GROQ_API_KEY;
 const sample={lang:'fr',question:'ma sexualité',domain:'Sentimental',oracle:'cristariva',cards:[{index:0,name:'Nouveau départ',role:'outcome',reversed:false,meaning:'Ouvre un cycle neuf.',local:'Une évolution intime peut ouvrir un cycle neuf.'}]};
 const text='Votre rapport au désir peut s’ouvrir à un nouveau départ, à votre rythme, sans transformer cette possibilité symbolique en certitude.';
 try{
  process.env.GROQ_API_KEY='test-only';
  global.fetch=async()=>({ok:true,json:async()=>({choices:[{finish_reason:'stop',message:{content:JSON.stringify({segments:[{index:0,text}]})}}]})});
  const event={httpMethod:'POST',headers:{origin:'https://chrysthale-ops.github.io'},body:JSON.stringify(sample)};
  assert.equal((await handler(event)).statusCode,200);
  const req=new Request('https://relay.workers.dev/',{method:'POST',headers:{Origin:event.headers.origin},body:event.body});
  assert.equal((await worker.fetch(req,{GROQ_API_KEY:'test-only'})).status,200);
 }finally{global.fetch=original;if(secret===undefined)delete process.env.GROQ_API_KEY;else process.env.GROQ_API_KEY=secret;}
});
test('browser rejects malformed external prose and uses domain meaning',async()=>{
 for(const text of [broken,valid]){
 const dom=new JSDOM('<div id="reading"></div>',{runScripts:'outside-only'}),w=dom.window;
 try{
 w.state={lang:'fr',domain:'Sentimental',question:'Le retour de Kinya',oracle:'cristariva',draw:[]};
 w.CR_UNIVERSAL_FLUID_STORY=()=>'<div class="story-reading"><p class="story-continuous">Récit local complet.</p></div>';
 w.CR_UNIVERSAL_ROLE_SUMMARY=()=>input.cards[0].local;
 let sent,finish;
 const fetched=new Promise(resolve=>finish=resolve);
 w.fetch=async(url,opts)=>{sent=JSON.parse(opts.body);return {ok:true,json:async()=>{finish();return {text};}};};
 w.eval(fs.readFileSync(require.resolve('../story-quality.js'),'utf8'));
 w.eval(fs.readFileSync(require.resolve('../groq-hybrid-story.js'),'utf8'));
 const cards=[{id:1,name:'Clarté',definition:'Idée générale.',reading_relationnel:'Un échange sentimental se précise.'}];
 w.state.draw=cards;
 w.document.getElementById('reading').innerHTML=w.CR_UNIVERSAL_FLUID_STORY(cards);
 await fetched;await new Promise(resolve=>setImmediate(resolve));
 assert.equal(sent.cards[0].meaning,cards[0].reading_relationnel);
 assert.equal(w.document.querySelector('.story-continuous').textContent,text===valid?valid:'Le récit ne satisfait pas aux exigences de qualité. Veuillez réessayer.');
 }finally{w.close();}
 }
});
