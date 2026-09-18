/* CRISTARIVA — chargeur direct Android/Web pour l'Oracle Amour.
   Ce fichier remplace l'ancien point d'entrée relation-astrology.js.
   Le code astrologique original est conservé dans relation-astrology-core-v1.4.js.

   Finition narrative 2026-09-18 : évite les répétitions successives d'amorces
   telles que « L’enjeu est alors de… » dans L’histoire racontée par vos cartes.
*/
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
    './oracle-amour-data.js?v=20260918-pdf80',
    './oracle-amour-integration.js?v=20260918-pdf80',
    './oracle-amour-compat.js?v=20260918-pdf80'
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
        try{ await loadScript('./oracle-amour-integration.js?v=20260918-pdf80-repair','love-integration-repair',true); }
        catch(e){ console.error('CRISTARIVA réparation Sentimental',e); }
      }
      return !!(window.AMOUR_DATA && hasSentimental());
    })();
    return window.__CRISTARIVA_LOVE_DIRECT_BOOTSTRAP__;
  }

  /* Finition générale du récit : lorsque plusieurs cartes aboutissent à la
     même amorce, on conserve la première puis on varie les suivantes afin que
     le paragraphe reste naturel et réellement narratif. */
  function polishRepeatedStoryOpeners(html){
    try{
      if(!html || document.documentElement.lang==='en') return html;
      const tpl=document.createElement('template');
      tpl.innerHTML=String(html);
      const p=tpl.content.querySelector('.story-continuous');
      if(!p) return html;

      let count=0;
      const variants=[
        'L’enjeu est alors de ',
        'Il devient ensuite important de ',
        'Il faut également ',
        'Un autre point consiste à ',
        'Dans le même mouvement, il importe de ',
        'La suite demande aussi de '
      ];

      p.innerHTML=p.innerHTML.replace(/L[’']enjeu est alors de\s+/gi,function(){
        const replacement=variants[Math.min(count,variants.length-1)];
        count+=1;
        return replacement;
      });

      return tpl.innerHTML;
    }catch(e){
      return html;
    }
  }

  /* relation-astrology.js est chargé après les moteurs narratifs : cette
     surcouche agit donc sur tous les récits, quel que soit le domaine choisi. */
  try{
    if(typeof storyInterpretation==='function'){
      const baseStoryInterpretation=storyInterpretation;
      storyInterpretation=function(cards){
        return polishRepeatedStoryOpeners(baseStoryInterpretation(cards));
      };
      interpretation=function(cards){return storyInterpretation(cards);};

      if(window.state && Array.isArray(state.draw) && state.draw.length){
        const target=document.getElementById('reading');
        if(target && /L’histoire racontée par vos cartes|The story told by your cards/.test(target.textContent||'')){
          target.innerHTML=storyInterpretation(state.draw);
        }
      }
    }
  }catch(e){
    console.error('CRISTARIVA finition narrative',e);
  }

  /* Attendre la fin du parsing évite les doubles chargements avec une ancienne
     version du service worker Android encore active pendant la transition. */
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',function(){ setTimeout(ensureOracleAmour,0); },{once:true});
  }else{
    setTimeout(ensureOracleAmour,0);
  }
})();
