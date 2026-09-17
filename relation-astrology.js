/* CRISTARIVA — chargeur direct Android/Web pour l'Oracle Amour.
   Ce fichier remplace l'ancien point d'entrée relation-astrology.js.
   Le code astrologique original est conservé dans relation-astrology-core-v1.4.js. */
(function(){
  'use strict';

  function loadScript(src, marker, force){
    return new Promise(function(resolve,reject){
      if(!force){
        const exists=[...document.scripts].some(function(s){
          return (marker && s.dataset && s.dataset.cristariva===marker) ||
                 (s.src && s.src.indexOf(src.split('?')[0].replace('./',''))!==-1);
        });
        if(exists) return resolve();
      }
      const el=document.createElement('script');
      el.src=src;
      el.async=false;
      if(marker) el.dataset.cristariva=marker;
      el.onload=resolve;
      el.onerror=function(){reject(new Error('Impossible de charger '+src));};
      document.body.appendChild(el);
    });
  }

  /* Préserver toutes les fonctions astrologiques existantes. */
  loadScript('./relation-astrology-core-v1.4.js?v=1.4','relation-astrology-core').catch(function(e){
    console.error('CRISTARIVA astrologie relationnelle',e);
  });

  const LOVE_SCRIPTS=[
    './oracle-amour-images-01-05.js?v=1.1',
    './oracle-amour-images-06-10.js?v=1.1',
    './oracle-amour-cards-01-20.js?v=4.0',
    './oracle-amour-cards-21-40.js?v=4.0',
    './oracle-amour-cards-41-60.js?v=4.0',
    './oracle-amour-cards-61-80.js?v=4.0',
    './oracle-amour-data.js?v=4.1',
    './oracle-amour-integration.js?v=4.1',
    './oracle-amour-compat.js?v=4.1'
  ];

  async function ensureOracleAmour(){
    if(window.__CRISTARIVA_LOVE_DIRECT_BOOTSTRAP__) return window.__CRISTARIVA_LOVE_DIRECT_BOOTSTRAP__;
    window.__CRISTARIVA_LOVE_DIRECT_BOOTSTRAP__=(async function(){
      /* Si l'ancien service worker a déjà injecté et exécuté l'Oracle Amour,
         ne rien charger une seconde fois. */
      const hasSentimental=function(){
        return !!document.querySelector('#domain option[value="Sentimental"]');
      };
      if(window.AMOUR_DATA && hasSentimental()) return true;

      for(const src of LOVE_SCRIPTS){
        try{ await loadScript(src,'love-'+src.split('/').pop().split('?')[0],false); }
        catch(e){ console.error('CRISTARIVA Oracle Amour',e); }
      }

      /* Réparer le cas où les données étaient présentes mais où l'intégration
         n'avait pas encore ajouté le domaine Sentimental. */
      if(window.AMOUR_DATA && !hasSentimental()){
        try{ await loadScript('./oracle-amour-integration.js?v=4.1-repair','love-integration-repair',true); }
        catch(e){ console.error('CRISTARIVA réparation Sentimental',e); }
      }
      return !!(window.AMOUR_DATA && hasSentimental());
    })();
    return window.__CRISTARIVA_LOVE_DIRECT_BOOTSTRAP__;
  }

  /* Attendre la fin du parsing évite les doubles chargements avec une ancienne
     version du service worker Android encore active pendant la transition. */
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',function(){ setTimeout(ensureOracleAmour,0); },{once:true});
  }else{
    setTimeout(ensureOracleAmour,0);
  }
})();
