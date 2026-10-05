/* CRISTARIVA: asynchronous enrichment, local reading always available. */
(function(){
'use strict';
const endpoint='https://cristariva.sauvete.workers.dev/';
const cache=new Map(),pending=new Map();
const local=window.CR_UNIVERSAL_FLUID_STORY;
if(typeof local!=='function')return;
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
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
function statusText(code,detail,en){
 const fr={pending:'Moteur externe : connexion en cours…',retry:'Moteur externe : incident temporaire, nouvelle tentative…',success:'Moteur externe : actif.',rate_limit:'Moteur externe indisponible : limite temporaire atteinte (429).',timeout:'Moteur externe indisponible : délai dépassé.',quality:'Moteur externe non utilisé : réponse rejetée par le contrôle qualité.',not_configured:'Moteur externe indisponible : service non configuré.',provider_unavailable:'Moteur externe indisponible : fournisseur externe inaccessible.',http:'Moteur externe indisponible : erreur du service externe.',network:'Moteur externe indisponible : erreur réseau.'};
 const eg={pending:'External engine: connecting…',retry:'External engine: temporary issue, retrying…',success:'External engine: active.',rate_limit:'External engine unavailable: temporary rate limit reached (429).',timeout:'External engine unavailable: request timed out.',quality:'External engine not used: response rejected by quality control.',not_configured:'External engine unavailable: service is not configured.',provider_unavailable:'External engine unavailable: provider could not be reached.',http:'External engine unavailable: external service error.',network:'External engine unavailable: network error.'};
 let text=(en?eg:fr)[code]||(en?eg.http:fr.http);
 if(detail&&code==='quality')text+=' '+detail;
 return text;
}
function recordStatus(key,status){
 const snapshot={...status,key,timestamp:new Date().toISOString()};
 window.CR_EXTERNAL_ENGINE_LAST_STATUS=snapshot;
 try{window.dispatchEvent(new CustomEvent('cristariva:external-engine',{detail:snapshot}));}catch{}
 if(status.code!=='success'&&status.code!=='pending'&&status.code!=='retry')console.warn('[CRISTARIVA external engine]',snapshot);
}
function ensureStatus(node,en){
 let el=node.querySelector('.story-engine-status');
 if(!el){
  el=document.createElement('p');
  el.className='story-engine-status';
  el.setAttribute('role','status');
  el.setAttribute('aria-live','polite');
  el.style.cssText='margin:.55rem 0 0;font-size:.78rem;line-height:1.35;opacity:.72';
  node.appendChild(el);
 }
 el.textContent=statusText('pending','',en);
 el.dataset.engineStatus='pending';
 return el;
}
function applyStatus(key,status){
 document.querySelectorAll('[data-hybrid-key]').forEach(el=>{
  if(el.getAttribute('data-hybrid-key')!==key)return;
  const statusEl=el.querySelector('.story-engine-status');
  if(statusEl){statusEl.textContent=status.text;statusEl.dataset.engineStatus=status.code;if(status.detail)statusEl.title=status.detail;else statusEl.removeAttribute('title');}
  el.dataset.storyEngineStatus=status.code;
  if(status.error)el.dataset.storyEngineError=status.error;else delete el.dataset.storyEngineError;
  if(status.code!=='success')el.dataset.storyEngine='local-fallback';
 });
 recordStatus(key,status);
}
function apply(key,text,en){
 document.querySelectorAll('[data-hybrid-key]').forEach(el=>{
  if(el.getAttribute('data-hybrid-key')!==key)return;
  const p=el.querySelector('.story-continuous');
  if(p){p.textContent=text;el.dataset.storyEngine='groq-hybrid-v2';el.dataset.storyEngineStatus='success';delete el.dataset.storyEngineError;}
  const statusEl=el.querySelector('.story-engine-status');
  if(statusEl){statusEl.textContent=statusText('success','',en);statusEl.dataset.engineStatus='success';statusEl.removeAttribute('title');}
 });
 recordStatus(key,{code:'success',text:statusText('success','',en),error:''});
}
async function readResponse(response){
 try{return await response.json();}catch{return {};}
}
function classifyFailure(status,body,caught){
 if(caught){
  const name=String(caught?.name||'');
  return name==='TimeoutError'||name==='AbortError'?{code:'timeout',error:'timeout',transient:true}:{code:'network',error:name||'network',transient:true};
 }
 const error=String(body?.error||'');
 const reason=String(body?.reason||'');
 if(status===429||error==='rate_limit')return {code:'rate_limit',error:error||'rate_limit',transient:true};
 if(error==='quality'||error==='coverage'||error==='card_names')return {code:'quality',error:error,detail:reason||error,transient:false};
 if(error==='not_configured')return {code:'not_configured',error,transient:false};
 if(error==='provider_unavailable'||error==='incomplete')return {code:'provider_unavailable',error,transient:true};
 return {code:'http',error:error||String(status||'http'),detail:reason||'',transient:status>=500&&status<600};
}
async function requestExternal(key,data,en){
 for(let attempt=0;attempt<2;attempt++){
  let response,body,caught;
  try{
   response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:key,signal:AbortSignal.timeout(22000)});
   body=await readResponse(response);
  }catch(error){caught=error;}
  if(response?.ok){
   const text=body?.text;
   const qualityError=!window.CR_STORY_QUALITY?'quality_module_missing':window.CR_STORY_QUALITY.validate(text,data);
   if(!qualityError&&typeof text==='string'&&text.trim())return {ok:true,text};
   const failure={code:'quality',error:'quality',detail:qualityError||'invalid_text',transient:false};
   return {ok:false,...failure};
  }
  const failure=classifyFailure(response?.status,body,caught);
  if(attempt===0&&failure.transient){
   const retryDelay=failure.code==='rate_limit'?10000:450;
   applyStatus(key,{code:'retry',text:statusText('retry','',en),error:failure.error,detail:failure.detail||''});
   await wait(retryDelay);
   continue;
  }
  return {ok:false,...failure};
 }
 return {ok:false,code:'http',error:'unknown',transient:false};
}
function hybrid(cards){
 const html=local(cards);
 if(!html||!Array.isArray(cards)||cards.length>15)return html;
 let data;try{data=requestData(cards);}catch{return html;}
 const key=JSON.stringify(data),en=data.lang==='en';
 const doc=document.createElement('template');doc.innerHTML=html;
 const node=doc.content.querySelector('.story-reading');if(!node)return html;
 node.setAttribute('data-hybrid-key',key);
 ensureStatus(node,en);
 if(cache.has(key)){
  const p=node.querySelector('.story-continuous');if(p)p.textContent=cache.get(key);
  node.dataset.storyEngine='groq-hybrid-v2';node.dataset.storyEngineStatus='success';
  const statusEl=node.querySelector('.story-engine-status');if(statusEl){statusEl.textContent=statusText('success','',en);statusEl.dataset.engineStatus='success';}
 }else if(!pending.has(key)){
  pending.set(key,true);
  // Wait for caller to insert its synchronous local result.
  setTimeout(async()=>{
   try{
    const result=await requestExternal(key,data,en);
    if(result.ok){cache.set(key,result.text);if(cache.size>30)cache.delete(cache.keys().next().value);apply(key,result.text,en);}
    else applyStatus(key,{code:result.code,text:statusText(result.code,result.detail,en),error:result.error||result.code,detail:result.detail||''});
   }finally{pending.delete(key);}
  },0);
 }
 return doc.innerHTML;
}
storyInterpretation=hybrid;interpretation=hybrid;
window.CR_UNIVERSAL_FLUID_STORY=hybrid;
})();
