/* CRISTARIVA — réparation forcée du Tarot divinatoire 78 cartes — 2026-09-25. */
(function(){
  'use strict';

  const VERSION='20260926-card-size-r2';

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

      const majors=(window.TAROT_DATA?.main||[]).filter(c=>Number(c.id)>=1&&Number(c.id)<=22);
      window.TAROT_DATA={main:majors,all:majors.slice()};

      delete window.CR_TAROT_MINOR_IMAGES_READY;
      delete window.CR_TAROT_MINOR_SPRITE_INFO;
      window.CR_TAROT_MINOR_IMAGES={};
      await appendScript('./tarot-minor-sprite-loader.js?v='+VERSION);
      if(window.CR_TAROT_MINOR_IMAGES_READY)await window.CR_TAROT_MINOR_IMAGES_READY;

      const imageCount=Object.keys(window.CR_TAROT_MINOR_IMAGES||{}).filter(k=>Number(k)>=23&&Number(k)<=78).length;
      if(imageCount!==56){
        throw new Error('Seulement '+imageCount+'/56 illustrations mineures sont disponibles.');
      }

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

      delete window.__CRISTARIVA_TAROT_READY__;
      await appendScript('./tarot-divinatoire-integration-v78.js?v='+VERSION);
      await appendScript('./tarot-story-fluid-v6.2.js?v=6.6-'+VERSION);

      window.CR_TAROT_HOTFIX_VERSION='2026.09.26-card-size-r2';
      document.documentElement.dataset.cristarivaTarot='78';
      document.documentElement.dataset.cristarivaTarotImages='56';
      document.documentElement.dataset.cristarivaTarotStory='6.2';
    }catch(e){
      console.error('CRISTARIVA : impossible d’activer le Tarot 78 cartes.',e);
    }
  }

  activateTarot78();
})();