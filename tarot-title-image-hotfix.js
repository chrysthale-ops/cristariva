/* CRISTARIVA — réparation forcée du Tarot divinatoire 78 cartes — 2026-09-24. */
(function(){
  'use strict';

  const VERSION='20260924-tarot78-r6';

  function appendScript(src){
    return new Promise((resolve,reject)=>{
      const s=document.createElement('script');
      s.src=src;
      s.async=false;
      s.onload=resolve;
      s.onerror=()=>reject(new Error('Impossible de charger '+src));
      document.head.appendChild(s);
    });
  }

  async function activateTarot78(){
    try{
      if(!window.TAROT_DATA||!Array.isArray(window.TAROT_DATA.main)){
        await appendScript('./tarot-divinatoire-data.js?v='+VERSION+'-base');
      }

      /* Repartir proprement des 22 majeurs : les 10 cartes spéciales ne doivent
         plus appartenir au Tarot actif. */
      const majors=(window.TAROT_DATA?.main||[]).filter(c=>Number(c.id)>=1&&Number(c.id)<=22);
      window.TAROT_DATA={main:majors,all:majors.slice()};

      /* Recharger les illustrations des mineurs. Le dossier de planche commence
         par un point et peut être ignoré par GitHub Pages ; le loader possède
         donc maintenant un secours via raw.githubusercontent.com. */
      try{
        delete window.CR_TAROT_MINOR_IMAGES_READY;
        window.CR_TAROT_MINOR_IMAGES={};
        await appendScript('./tarot-minor-sprite-loader.js?v='+VERSION);
        if(window.CR_TAROT_MINOR_IMAGES_READY)await window.CR_TAROT_MINOR_IMAGES_READY;
      }catch(e){
        console.error('CRISTARIVA Tarot images mineures :',e);
      }

      /* Reconstruire les 56 mineurs sans dépendre d'un ancien état du navigateur. */
      window.CR_TAROT_MINOR_ROWS=[];
      for(const file of [
        'tarot-minors-data-batons.js',
        'tarot-minors-data-coupes.js',
        'tarot-minors-data-epees.js',
        'tarot-minors-data-deniers.js'
      ]){
        await appendScript('./'+file+'?v='+VERSION);
      }
      await appendScript('./tarot-minors-v1.js?v='+VERSION);

      if(!window.TAROT_DATA||window.TAROT_DATA.main.length!==78){
        throw new Error('Le Tarot reconstruit contient '+(window.TAROT_DATA?.main?.length||0)+' cartes au lieu de 78.');
      }

      /* Réexécuter l'intégration d'affichage avec le jeu désormais correct. */
      delete window.__CRISTARIVA_TAROT_READY__;
      await appendScript('./tarot-divinatoire-integration-v78.js?v='+VERSION);

      window.CR_TAROT_HOTFIX_VERSION='2026.09.24-tarot78-r6';
      document.documentElement.dataset.cristarivaTarot='78';
    }catch(e){
      console.error('CRISTARIVA : impossible d’activer le Tarot 78 cartes.',e);
    }
  }

  activateTarot78();
})();