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
 function displayDate(iso){
  const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(iso||'');
  return m?`${m[3]}/${m[2]}/${m[1]}`:'';
 }
 const api={parseDate,displayDate};
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
   original.removeAttribute('required');original.type='hidden';original.insertAdjacentElement('afterend',input);
   const required=id==='numDate'||id==='relationBirthdate';
   if(required)input.required=true;
   const sync=()=>{
    if(!input.value.trim()&&original.value){input.value=displayDate(original.value);return !!input.value;}
    const iso=parseDate(input.value);
    original.value=iso||'';
    input.setCustomValidity(input.value.trim()&&!iso?(document.documentElement.lang==='en'?'Enter a valid date as DD/MM/YYYY.':'Saisissez une date valide au format JJ/MM/AAAA.'):(''));
    original.dispatchEvent(new Event('change',{bubbles:true}));
    return !!iso;
   };
   input.addEventListener('input',sync);
   input.addEventListener('blur',()=>{if(sync())input.value=displayDate(original.value);});
   original.addEventListener('change',()=>{const formatted=displayDate(original.value);if(formatted&&input.value!==formatted)input.value=formatted;});
   pairs.push({id,input,original,sync});
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
   for(const p of pairs)p.input.setAttribute('aria-label',document.documentElement.lang==='en'?'Birth date (DD/MM/YYYY)':'Date de naissance (JJ/MM/AAAA)');
  }));
 }
 document.addEventListener('DOMContentLoaded',install);
})(typeof window!=='undefined'?window:globalThis);
