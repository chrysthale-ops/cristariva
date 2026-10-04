/* CRISTARIVA: asynchronous enrichment, local reading always available. */
(function(){
'use strict';
const endpoint='https://cristariva.sauvete.workers.dev/';
const cache=new Map(),pending=new Map();
const local=window.CR_UNIVERSAL_FLUID_STORY;
if(typeof local!=='function')return;
function requestData(cards){
 const en=state.lang==='en';
 const roles=cards.length===1?['outcome']:cards.length===2?['origin','outcome']:cards.length===3?['origin','evolution','outcome']:cards.length===4?['origin','obstacle','evolution','outcome']:['origin','obstacle','resource',...Array(Math.max(0,cards.length-4)).fill('evolution'),'outcome'];
 return {lang:en?'en':'fr',question:String(state.question||''),domain:String(state.domain||''),oracle:String(state.oracle||''),cards:cards.map((c,i)=>{
 const reversed=state.oracle==='tarot'&&state.draw?.[i]===c&&state.tarotReversed?.[i]===true;
 const l=en?(c.en||c):c;
 const domain=String(state.domain||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const field=/profession|travail|projet|work|career/.test(domain)?'reading_professionnel':/sentiment|relation|romantic|love/.test(domain)?'reading_relationnel':'reading_spirituel';
 const rev=window.CR_TAROT_REVERSED?.[c.id];
 return {index:i,name:String(l.name||c.name||''),role:roles[i],reversed,meaning:String(reversed?(rev?.[en?'en':'fr']||l.definition||l.meaning||''):(l[field]||l.definition||l.meaning||l.keywords||'')),local:String(window.CR_UNIVERSAL_ROLE_SUMMARY?.(c,roles[i],en)||'')};
 })};
}
function apply(key,text){
 document.querySelectorAll('[data-hybrid-key]').forEach(el=>{
 if(el.getAttribute('data-hybrid-key')!==key)return;
 const p=el.querySelector('.story-continuous');
 if(p){p.textContent=text;el.dataset.storyEngine='groq-hybrid-v2';}
 });
}
function hybrid(cards){
 const html=local(cards);
 if(!html||!Array.isArray(cards)||cards.length>15)return html;
 let data;try{data=requestData(cards);}catch{return html;}
 const key=JSON.stringify(data);
 const doc=document.createElement('template');doc.innerHTML=html;
 const node=doc.content.querySelector('.story-reading');if(!node)return html;
 node.setAttribute('data-hybrid-key',key);
 if(cache.has(key))node.querySelector('.story-continuous').textContent=cache.get(key);
 else if(!pending.has(key)){
 pending.set(key,true);
 // Wait for caller to insert its synchronous local result.
 setTimeout(async()=>{
 try{
 const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:key,signal:AbortSignal.timeout(22000)});
 if(!response.ok)return;
 const result=await response.json();
 // Also protect clients while an older relay deployment is still running.
 if(!window.CR_STORY_QUALITY||window.CR_STORY_QUALITY.validate(result.text,data))return;
 cache.set(key,result.text);if(cache.size>30)cache.delete(cache.keys().next().value);
 apply(key,result.text);
 }catch{}finally{pending.delete(key);}
 },0);
 }
 return doc.innerHTML;
}
storyInterpretation=hybrid;interpretation=hybrid;
window.CR_UNIVERSAL_FLUID_STORY=hybrid;
})();
