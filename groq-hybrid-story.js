/* CRISTARIVA: official external-only narrative with visible diagnostics and one guarded retry. */
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
function labels(en){
 return en?{
  connecting:'External engine: connecting…',active:'External engine: active.',retrying:'External engine: temporary issue — retrying once…',
  rate_limit:'External engine unavailable: temporary limit reached (429).',timeout:'External engine unavailable: request timed out.',
  network:'External engine unavailable: network error.',quality:'External engine response rejected by quality control.',
  config:'External engine unavailable: configuration error.',error:'External engine unavailable.'
 }:{
  connecting:'Moteur externe : connexion…',active:'Moteur externe : actif.',retrying:'Moteur externe : incident temporaire — seconde tentative…',
  rate_limit:'Moteur externe indisponible : limite temporaire atteinte (429).',timeout:'Moteur externe indisponible : délai dépassé.',
  network:'Moteur externe indisponible : erreur réseau.',quality:'Moteur externe : réponse rejetée par le contrôle qualité.',
  config:'Moteur externe indisponible : erreur de configuration.',error:'Moteur externe indisponible.'
 };
}
function remember(stateName,code='',reason='',attempt=0){
 window.CR_EXTERNAL_ENGINE_LAST_STATUS={state:stateName,code:String(code||''),reason:String(reason||''),attempt:Number(attempt||0),at:new Date().toISOString()};
}
function statusText(en,stateName){return labels(en)[stateName]||labels(en).error;}
function updateStatus(key,en,stateName,code='',reason='',attempt=0){
 remember(stateName,code,reason,attempt);
 document.querySelectorAll('[data-hybrid-key]').forEach(el=>{
  if(el.getAttribute('data-hybrid-key')!==key)return;
  el.dataset.externalStatus=stateName;
  if(code)el.dataset.externalCode=String(code);else delete el.dataset.externalCode;
  if(reason)el.dataset.externalReason=String(reason);else delete el.dataset.externalReason;
  const s=el.querySelector('.story-engine-status');if(s)s.textContent=statusText(en,stateName);
 });
}
function apply(key,text,status='external'){
 document.querySelectorAll('[data-hybrid-key]').forEach(el=>{
  if(el.getAttribute('data-hybrid-key')!==key)return;
  const p=el.querySelector('.story-continuous');
  if(p){p.textContent=text;el.dataset.storyEngine=status;}
 });
}
function safeErrorBody(response){
 return response.json().catch(()=>({}));
}
function reasonFrom(body,status){return String(body?.reason||body?.error||('http_'+status));}
function qualityFailure(reason){return /^(?:quality|coverage|length|incomplete|language|card_names|unsupported_reciprocity|external_grounding|quality_unavailable)$/.test(reason);}
function retryableHttp(status,reason){
 if(status===429||status===504)return true;
 if(status===503)return reason!=='not_configured';
 if(status===502)return qualityFailure(reason)||/provider_unavailable|upstream|timeout|http_502/i.test(reason);
 return status>=500&&status<600;
}
function finalStateForHttp(status,reason){
 if(status===429)return 'rate_limit';
 if(status===503&&reason==='not_configured')return 'config';
 if(qualityFailure(reason))return 'quality';
 return 'error';
}
function finishError(key,en,stateName,message,code='',reason='',attempt=1,data,messages){
 apply(key,message,'external-error');updateStatus(key,en,stateName,code,reason,attempt);pending.delete(key);
 if(!data||!messages||stateName==='config')return;
 document.querySelectorAll('[data-hybrid-key]').forEach(el=>{
  if(el.getAttribute('data-hybrid-key')!==key||el.querySelector('.story-retry'))return;
  const button=document.createElement('button');button.type='button';button.className='story-retry';
  button.textContent=en?'Retry this reading':'Réessayer le récit';
  button.addEventListener('click',()=>{
   if(pending.has(key))return;
   document.querySelectorAll('[data-hybrid-key]').forEach(node=>{if(node.getAttribute('data-hybrid-key')===key)node.querySelector('.story-retry')?.remove();});
   pending.set(key,true);apply(key,messages.waiting,'external-pending');updateStatus(key,en,'connecting');
   scheduleAttempt(key,data,en,messages,1);
  });el.appendChild(button);
 });
}
function scheduleAttempt(key,data,en,messages,attempt){
 const delay=attempt===1?0:1500;
 setTimeout(async()=>{
  try{
   const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:key,signal:AbortSignal.timeout(45000)});
   if(!response.ok){
    const body=await safeErrorBody(response),reason=reasonFrom(body,response.status);
    if(attempt===1&&retryableHttp(response.status,reason)){
     updateStatus(key,en,'retrying',response.status,reason,2);
     scheduleAttempt(key,data,en,messages,2);return;
    }
    const stateName=finalStateForHttp(response.status,reason);
    const text=stateName==='rate_limit'?messages.rate_limit:stateName==='quality'?messages.rejected:messages.failure;
    finishError(key,en,stateName,text,response.status,reason,attempt,data,messages);return;
   }
   const result=await response.json();
   const qualityReason=!window.CR_STORY_QUALITY?'quality_unavailable':window.CR_STORY_QUALITY.validate(result.text,data);
   if(qualityReason){
    if(attempt===1){updateStatus(key,en,'retrying',response.status||200,qualityReason,2);scheduleAttempt(key,data,en,messages,2);return;}
    finishError(key,en,'quality',messages.rejected,response.status||200,qualityReason,attempt,data,messages);return;
   }
   cache.set(key,result.text);if(cache.size>30)cache.delete(cache.keys().next().value);
   apply(key,result.text,'external');updateStatus(key,en,'active',response.status||200,'',attempt);pending.delete(key);
  }catch(error){
   const name=String(error?.name||''),isTimeout=/AbortError|TimeoutError/i.test(name);
   if(attempt===1){
    updateStatus(key,en,'retrying','',isTimeout?'timeout':'network',2);
    scheduleAttempt(key,data,en,messages,2);return;
   }
   finishError(key,en,isTimeout?'timeout':'network',isTimeout?messages.timeout:messages.failure,'',isTimeout?'timeout':'network',attempt,data,messages);
  }
 },delay);
}
function hybrid(cards){
 if(!Array.isArray(cards)||!cards.length||cards.length>15)return '';
 const en=state.lang==='en';
 const messages={
  waiting:en?'Your reading is being written…':'Votre récit est en cours de rédaction…',
  failure:en?'The reading could not be generated. Please try again later.':'Le récit n’a pas pu être généré. Veuillez réessayer plus tard.',
  rejected:en?'The reading did not meet the quality requirements. Please try again.':'Le récit ne satisfait pas aux exigences de qualité. Veuillez réessayer.',
  rate_limit:en?'Too many requests. Please wait a minute and try again.':'Trop de demandes. Veuillez patienter une minute puis réessayer.',
  timeout:en?'The external engine took too long to respond. Please try again.':'Le moteur externe a mis trop de temps à répondre. Veuillez réessayer.'
 };
 const shell=(text,statusName='connecting')=>'<div class="story-reading" data-story-engine="external-pending" data-external-status="'+escape(statusName)+'"><h3>'+(en?'The story told by your cards':'L’histoire racontée par vos cartes')+'</h3>'+(state.question?'<p>'+ (en?'Your question: ':'Votre question : ')+escape(state.question)+'</p>':'')+'<p class="story-engine-status muted" aria-live="polite">'+escape(statusText(en,statusName))+'</p><p class="story-continuous" role="status" aria-live="polite">'+escape(text)+'</p></div>';
 let data;try{data=requestData(cards);}catch{remember('error','','request_data',0);return shell(messages.failure,'error');}
 const html=shell(messages.waiting);
 const key=JSON.stringify(data);
 const doc=document.createElement('template');doc.innerHTML=html;
 const node=doc.content.querySelector('.story-reading');if(!node)return html;
 node.setAttribute('data-hybrid-key',key);
 if(cache.has(key)){
  node.querySelector('.story-continuous').textContent=cache.get(key);node.dataset.storyEngine='external';node.dataset.externalStatus='active';
  const s=node.querySelector('.story-engine-status');if(s)s.textContent=statusText(en,'active');remember('active','200','cache',0);
 }else if(!pending.has(key)){
  pending.set(key,true);remember('connecting','','',1);scheduleAttempt(key,data,en,messages,1);
 }
 return doc.innerHTML;
}
storyInterpretation=hybrid;interpretation=hybrid;
window.CR_UNIVERSAL_FLUID_STORY=hybrid;
})();
