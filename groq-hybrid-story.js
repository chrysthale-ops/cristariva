/* CRISTARIVA: official external-only narrative, validated by the relay. */
(function(){
'use strict';
const endpoint='https://cristariva.sauvete.workers.dev/';
const cache=new Map(),pending=new Map();
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function requestData(cards){
 const en=state.lang==='en';
 const roles=cards.length===1?['outcome']:cards.length===2?['origin','outcome']:cards.length===3?['origin','evolution','outcome']:cards.length===4?['origin','obstacle','evolution','outcome']:['origin','obstacle','resource',...Array(Math.max(0,cards.length-4)).fill('evolution'),'outcome'];
 return {lang:en?'en':'fr',question:String(state.question||''),domain:String(state.domain||''),oracle:String(state.oracle||''),cards:cards.map((c,i)=>{
 const reversed=state.oracle==='tarot'&&state.draw?.[i]===c&&state.tarotReversed?.[i]===true;
 const l=en?(c.en||c):c;
 const domain=String(state.domain||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const field=/profession|travail|projet|work|career/.test(domain)?'reading_professionnel':/sentiment|relation|romantic|love/.test(domain)?'reading_relationnel':'reading_spirituel';
 const rev=window.CR_TAROT_REVERSED?.[c.id];
 return {index:i,name:String(l.name||c.name||''),role:roles[i],reversed,meaning:String(reversed?(rev?.[en?'en':'fr']||l.definition||l.meaning||''):(l[field]||l.definition||l.meaning||l.keywords||'')),local:''};
 })};
}
function apply(key,text,status='external'){
 document.querySelectorAll('[data-hybrid-key]').forEach(el=>{
 if(el.getAttribute('data-hybrid-key')!==key)return;
 const p=el.querySelector('.story-continuous');
 if(p){p.textContent=text;el.dataset.storyEngine=status;}
 });
}
function hybrid(cards){
 if(!Array.isArray(cards)||!cards.length||cards.length>15)return '';
 const en=state.lang==='en';
 const waiting=en?'Your reading is being written…':'Votre récit est en cours de rédaction…';
 const failure=en?'The reading could not be generated. Please try again later.':'Le récit n’a pas pu être généré. Veuillez réessayer plus tard.';
 const rejected=en?'The reading did not meet the quality requirements. Please try again.':'Le récit ne satisfait pas aux exigences de qualité. Veuillez réessayer.';
 const shell=text=>'<div class="story-reading" data-story-engine="external-pending"><h3>'+(en?'The story told by your cards':'L’histoire racontée par vos cartes')+'</h3>'+(state.question?'<p>'+ (en?'Your question: ':'Votre question : ')+escape(state.question)+'</p>':'')+'<p class="story-continuous" role="status" aria-live="polite">'+escape(text)+'</p></div>';
 let data;try{data=requestData(cards);}catch{return shell(failure);}
 const html=shell(waiting);
 const key=JSON.stringify(data);
 const doc=document.createElement('template');doc.innerHTML=html;
 const node=doc.content.querySelector('.story-reading');if(!node)return html;
 node.setAttribute('data-hybrid-key',key);
 if(cache.has(key)){node.querySelector('.story-continuous').textContent=cache.get(key);node.dataset.storyEngine='external';}
 else if(!pending.has(key)){
 pending.set(key,true);
 // Wait for caller to insert the pending story container.
 setTimeout(async()=>{
 try{
 const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:key,signal:AbortSignal.timeout(45000)});
 if(!response.ok){apply(key,response.status===429?(en?'Too many requests. Please wait a minute.':'Trop de demandes. Veuillez patienter une minute.'):response.status===502?rejected:failure,'external-error');return;}
 const result=await response.json();
 // Also protect clients while an older relay deployment is still running.
 if(!window.CR_STORY_QUALITY||window.CR_STORY_QUALITY.validate(result.text,data)){apply(key,rejected,'external-error');return;}
 cache.set(key,result.text);if(cache.size>30)cache.delete(cache.keys().next().value);
 apply(key,result.text);
 }catch{apply(key,failure,'external-error');}finally{pending.delete(key);}
 },0);
 }
 return doc.innerHTML;
}
storyInterpretation=hybrid;interpretation=hybrid;
window.CR_UNIVERSAL_FLUID_STORY=hybrid;
})();
