(function(root){
 'use strict';
 function parseTime(value){
  const raw=String(value||'').trim();
  const m=/^(\d{1,2}):(\d{2})$/.exec(raw)||/^(\d{2})(\d{2})$/.exec(raw);
  if(!m)return null;
  const hour=Number(m[1]),minute=Number(m[2]);
  if(hour>23||minute>59)return null;
  return `${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}`;
 }
 function formatTyping(value,deleting=false){
  const raw=String(value||'');
  if(!/^[\d:\s]*$/.test(raw))return raw;
  const digits=raw.replace(/\D/g,'').slice(0,4);
  return digits.length<=2?digits+(digits.length===2&&!deleting?':':''):digits.slice(0,2)+':'+digits.slice(2);
 }
 const api={parseTime,formatTyping};
 if(typeof module==='object'&&module.exports)module.exports=api;
 root.CristarivaTimeEntry=api;
 if(!root.document)return;
 document.addEventListener('DOMContentLoaded',()=>{
  const pairs=[];
  for(const id of ['birthtime','relationBirthtime']){
   const original=document.getElementById(id);
   if(!original)continue;
   const input=document.createElement('input');
   input.type='text';input.id=id+'Direct';input.inputMode='numeric';input.maxLength=5;
   input.placeholder='HH:MM';input.value=original.value||'';
   input.setAttribute('aria-label',document.documentElement.lang==='en'?'Birth time (HH:MM)':'Heure de naissance (HH:MM)');
   const hint=document.createElement('small');hint.id=id+'TimeHelp';hint.className='time-entry-help';
   input.setAttribute('aria-describedby',[original.getAttribute('aria-describedby'),hint.id].filter(Boolean).join(' '));
   original.type='hidden';original.insertAdjacentElement('afterend',input);input.insertAdjacentElement('afterend',hint);
   const help=error=>{const en=document.documentElement.lang==='en';hint.textContent=error?(en?'Check the time: use 00:00 to 23:59.':'Vérifiez l’heure : de 00:00 à 23:59.'):(en?'Type 4 digits; the colon appears automatically. Example: 09:30. Leave blank if unknown.':'Tapez 4 chiffres : les deux-points s’ajoutent. Exemple : 09:30. Laissez vide si l’heure est inconnue.');hint.classList.toggle('time-entry-error',!!error);};
   help(false);
   const sync=()=>{
    if(!input.value.trim()&&original.value){input.value=original.value;return true;}
    const value=input.value.trim(),time=value?parseTime(value):null;
    original.value=time||'';
    const error=!!value&&!time;
    input.setCustomValidity(error?(document.documentElement.lang==='en'?'Enter a valid time as HH:MM.':'Saisissez une heure valide au format HH:MM.'):'');
    help(error&&value.replace(/\D/g,'').length>=4);
    original.dispatchEvent(new Event('change',{bubbles:true}));
    return !error;
   };
   input.addEventListener('input',event=>{if(input.selectionStart===input.value.length)input.value=formatTyping(input.value,event.inputType==='deleteContentBackward');sync();});
   input.addEventListener('blur',()=>{if(sync()&&original.value)input.value=original.value;else if(input.value.trim())help(true);});
   original.addEventListener('change',()=>{if(original.value&&input.value!==original.value)input.value=original.value;});
   pairs.push({id,input,hint,help,sync});
  }
  for(const [buttonId,fieldId] of [['astroBtn','birthtime'],['relationAstroBtn','relationBirthtime']]){
   const button=document.getElementById(buttonId),pair=pairs.find(p=>p.id===fieldId);
   button?.addEventListener('click',event=>{if(!pair.sync()){event.preventDefault();event.stopImmediatePropagation();pair.input.reportValidity();}},true);
  }
  document.getElementById('langBtn')?.addEventListener('click',()=>queueMicrotask(()=>{
   for(const p of pairs){p.input.setAttribute('aria-label',document.documentElement.lang==='en'?'Birth time (HH:MM)':'Heure de naissance (HH:MM)');p.help(p.hint.classList.contains('time-entry-error'));}
  }));
 });
})(typeof window!=='undefined'?window:globalThis);
