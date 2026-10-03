(function(root){
 'use strict';
 function parseDate(value){
  const m=/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/.exec(String(value||'').trim());
  if(!m)return null;
  const d=+m[1],month=+m[2],year=+m[3];
  const check=new Date(Date.UTC(year,month-1,d));
  if(year<1900||year>2100||check.getUTCFullYear()!==year||check.getUTCMonth()!==month-1||check.getUTCDate()!==d)return null;
  return `${year.toString().padStart(4,'0')}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
 }
 function formatTyping(value,deleting=false){
  const digits=String(value||'').replace(/\D/g,'').slice(0,8);
  if(!/^\d*$/.test(String(value||'').replace(/[\s\/.\-]/g,'')))return String(value||'');
  if(digits.length<=2)return digits+(digits.length===2&&!deleting?'/':'');
  if(digits.length<=4)return digits.slice(0,2)+'/'+digits.slice(2)+(digits.length===4&&!deleting?'/':'');
  return digits.slice(0,2)+'/'+digits.slice(2,4)+'/'+digits.slice(4);
 }
 function displayDate(iso){
  const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(iso||'');
  return m?`${m[3]}/${m[2]}/${m[1]}`:'';
 }
 const api={parseDate,displayDate,formatTyping};
 if(typeof module==='object'&&module.exports)module.exports=api;
 root.CristarivaDateEntry=api;
 if(!root.document)return;
 const ids=['birthdate','relationBirthdate','numDate','numOtherDate'];
 function install(){
  const pairs=[];
  for(const id of ids){
   const original=document.getElementById(id);
   if(!original)return;
   const input=document.createElement('input');
   input.type='text';input.id=id+'Direct';input.placeholder='JJ/MM/AAAA';input.inputMode='numeric';
   input.autocomplete='bday';input.maxLength=10;
   input.setAttribute('aria-label',document.documentElement.lang==='en'?'Birth date (DD/MM/YYYY)':'Date de naissance (JJ/MM/AAAA)');
   input.value=displayDate(original.value);
   const hint=document.createElement('small');hint.id=id+'DateHelp';hint.className='date-entry-help';
   input.setAttribute('aria-describedby',hint.id);
   original.removeAttribute('required');original.type='hidden';original.insertAdjacentElement('afterend',input);
   input.insertAdjacentElement('afterend',hint);
   const required=id==='numDate'||id==='relationBirthdate';
   if(required)input.required=true;
   const help=error=>{const en=document.documentElement.lang==='en';hint.textContent=error?(en?'Check this date (example: 05/03/1987).':'Vérifiez cette date (exemple : 05/03/1987).'):(en?'Type 8 digits; slashes appear automatically. Example: 05/03/1987.':'Tapez 8 chiffres : les barres s’ajoutent. Exemple : 05/03/1987.');hint.classList.toggle('date-entry-error',!!error);};
   help(false);
   const sync=()=>{
    if(!input.value.trim()&&original.value){input.value=displayDate(original.value);return !!input.value;}
    const iso=parseDate(input.value);
    original.value=iso||'';
    const invalid=!!input.value.trim()&&!iso;
    input.setCustomValidity(invalid?(document.documentElement.lang==='en'?'Enter a valid date as DD/MM/YYYY.':'Saisissez une date valide au format JJ/MM/AAAA.'):'');
    help(invalid&&input.value.replace(/\D/g,'').length>=8);
    original.dispatchEvent(new Event('change',{bubbles:true}));
    return !!iso;
   };
   input.addEventListener('input',event=>{
    if(input.selectionStart===input.value.length)input.value=formatTyping(input.value,event.inputType==='deleteContentBackward');
    sync();
   });
   input.addEventListener('blur',()=>{if(sync())input.value=displayDate(original.value);else if(input.value.trim())help(true);});
   original.addEventListener('change',()=>{const formatted=displayDate(original.value);if(formatted&&input.value!==formatted)input.value=formatted;});
   pairs.push({id,input,original,sync,help});
  }
  // The astrology controls use click handlers rather than native form validation.
  for(const [buttonId,fieldId] of [['astroBtn','birthdate'],['relationAstroBtn','relationBirthdate']]){
   const button=document.getElementById(buttonId),pair=pairs.find(p=>p.id===fieldId);
   if(!button||!pair)continue;
   button.addEventListener('click',event=>{
    if(!pair.sync()&&(pair.input.value.trim()||fieldId==='relationBirthdate')){
     event.preventDefault();event.stopImmediatePropagation();pair.input.reportValidity();
    }
   },true);
  }
  document.getElementById('langBtn')?.addEventListener('click',()=>queueMicrotask(()=>{
   for(const p of pairs){p.input.setAttribute('aria-label',document.documentElement.lang==='en'?'Birth date (DD/MM/YYYY)':'Date de naissance (JJ/MM/AAAA)');p.help(document.getElementById(p.id+'DateHelp').classList.contains('date-entry-error'));}
  }));
 }
 document.addEventListener('DOMContentLoaded',install);
})(typeof window!=='undefined'?window:globalThis);
