/* CRISTARIVA — activation fiable du Tarot divinatoire 78 cartes — 2026-09-24. */
(function(){
  'use strict';

  const VERSION='20260924-tarot78-r3';

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
      /* La page publique ne chargeait pas toujours les données Tarot avant
         l'intégration 78 cartes. On garantit maintenant cet ordre. */
      if(!window.TAROT_DATA||!Array.isArray(window.TAROT_DATA.main)){
        await loadScript('./tarot-divinatoire-data.js?v=20260924-tarot78-base');
      }

      if(!window.__CRISTARIVA_TAROT_READY__){
        await loadScript('./tarot-divinatoire-integration-v78.js?v='+VERSION);
      }

      /* L'intégration 78 construit ensuite exactement 22 majeurs + 56 mineurs. */
      if(window.CR_TAROT_MINOR_IMAGES_READY){
        try{await window.CR_TAROT_MINOR_IMAGES_READY;}catch(e){console.error('CRISTARIVA Tarot images:',e);}
      }
    }catch(e){
      console.error('CRISTARIVA : impossible d’activer le Tarot 78 cartes.',e);
    }
  }

  activateTarot78();
  window.CR_TAROT_HOTFIX_VERSION='2026.09.24-tarot78-r3';
})();