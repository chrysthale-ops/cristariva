/* CRISTARIVA — activation du Tarot divinatoire 78 cartes — 2026-09-24. */
(function(){
  'use strict';

  function repairExistingMajors(){
    try{
      if(!window.TAROT_DATA)return;
      const repair=card=>{
        if(!card||card.oracle!=='tarot'||Number(card.id)>22)return card;
        const identity=window.CR_TAROT_IDENTITIES?.[Number(card.id)];
        if(identity){
          card.name=identity.name;
          if(card.en)card.en.name=identity.enName;
          card.image=identity.image;
          card.imageEn=identity.imageEn;
        }
        return card;
      };
      (window.TAROT_DATA.main||[]).forEach(repair);
      (window.TAROT_DATA.all||[]).forEach(repair);
    }catch(e){}
  }

  function loadTarot78(){
    if(window.__CRISTARIVA_TAROT_READY__)return;
    if([...document.scripts].some(s=>String(s.src||'').includes('tarot-divinatoire-integration-v78.js')))return;
    const s=document.createElement('script');
    s.src='./tarot-divinatoire-integration-v78.js?v=20260924-tarot78-red2';
    s.async=false;
    s.onerror=()=>console.error('CRISTARIVA : impossible de charger le Tarot 78 cartes.');
    document.head.appendChild(s);
  }

  repairExistingMajors();
  loadTarot78();
  window.CR_TAROT_HOTFIX_VERSION='2026.09.24-tarot78';
})();
