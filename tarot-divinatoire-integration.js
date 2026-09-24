/* CRISTARIVA — compatibilité ancienne intégration : redirection vers le Tarot 78 cartes. */
(async function(){
'use strict';

function loadScript(src){
  return new Promise((resolve,reject)=>{
    const base=src.split('?')[0];
    const existing=[...document.scripts].find(s=>String(s.src||'').includes(base));
    if(existing){
      if(existing.dataset.crLoaded==='1')return resolve();
      existing.addEventListener('load',resolve,{once:true});
      existing.addEventListener('error',reject,{once:true});
      /* Si le script est déjà exécuté, ne pas rester bloqué. */
      setTimeout(resolve,0);
      return;
    }
    const s=document.createElement('script');
    s.src=src;s.async=false;
    s.onload=()=>{s.dataset.crLoaded='1';resolve();};
    s.onerror=reject;
    document.head.appendChild(s);
  });
}

try{
  if(!window.TAROT_DATA||!Array.isArray(window.TAROT_DATA.main)){
    await loadScript('./tarot-divinatoire-data.js?v=20260924-tarot78-base-r4');
  }
  /* Ne jamais conserver l'ancien marqueur 32 cartes. */
  if(window.CR_TAROT_INTEGRATION_VERSION==='2026.09.22-tarot32'){
    delete window.__CRISTARIVA_TAROT_READY__;
  }
  await loadScript('./tarot-divinatoire-integration-v78.js?v=20260924-tarot78-r4');
}catch(e){
  console.error('CRISTARIVA : échec du passage du Tarot 32 au Tarot 78.',e);
}
})();