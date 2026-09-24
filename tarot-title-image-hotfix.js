/* CRISTARIVA — activation fiable du Tarot divinatoire 78 cartes — 2026-09-24. */
(function(){
  'use strict';

  const VERSION='20260924-tarot78-r4';

  function loadScript(src){
    return new Promise((resolve,reject)=>{
      const base=src.split('?')[0];
      if([...document.scripts].some(s=>String(s.src||'').includes(base)))return resolve();
      const s=document.createElement('script');
      s.src=src;
      s.async=false;
      s.onload=resolve;
      s.onerror=()=>reject(new Error('Impossible de charger '+base));
      document.head.appendChild(s);
    });
  }

  async function activateTarot78(){
    try{
      if(!window.TAROT_DATA||!Array.isArray(window.TAROT_DATA.main)){
        await loadScript('./tarot-divinatoire-data.js?v=20260924-tarot78-base-r4');
      }

      /* Une ancienne intégration 32 cartes peut avoir posé ce marqueur.
         Elle ne doit plus empêcher le chargement de la version 78. */
      if(window.CR_TAROT_INTEGRATION_VERSION==='2026.09.22-tarot32'){
        delete window.__CRISTARIVA_TAROT_READY__;
      }
      await loadScript('./tarot-divinatoire-integration-v78.js?v='+VERSION);

      if(window.CR_TAROT_MINOR_IMAGES_READY){
        try{await window.CR_TAROT_MINOR_IMAGES_READY;}catch(e){console.error('CRISTARIVA Tarot images:',e);}
      }
    }catch(e){
      console.error('CRISTARIVA : impossible d’activer le Tarot 78 cartes.',e);
    }
  }

  activateTarot78();
  window.CR_TAROT_HOTFIX_VERSION='2026.09.24-tarot78-r4';
})();