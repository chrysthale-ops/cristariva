/* CRISTARIVA — chargeur direct Android/Web pour l'Oracle Amour.
   Ce fichier remplace l'ancien point d'entrée relation-astrology.js.
   Le code astrologique original est conservé dans relation-astrology-core-v1.4.js.

   Finition narrative 2026-09-20 : corrige les répétitions d'amorces, les
   phrases qui commencent abruptement par un verbe après « Concernant… » ou
   après une phrase précédente (« Interroge… », « Confronte… »), les élisions
   françaises (« de identifier » -> « d’identifier ») et certaines amorces
   infinitives trop mécaniques dans L’histoire racontée par vos cartes.

   Cohérence astrologique v1.5 : l’analyse croisée de période met en regard les
   transits individuels simultanés sans transformer automatiquement un carré ou
   une opposition individuel en conflit relationnel commun.

   Correction 2026-09-19 : la carte Relation 62 utilise son cartouche corrigé
   sans chevauchement entre « Nouvelle rencontre » et « Personne nouvelle ».
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

  /* Préserver toutes les fonctions astrologiques existantes, puis installer la
     garde de cohérence de l’analyse croisée une fois le moteur chargé. */
  loadScript('./relation-astrology-core-v1.4.js?v=1.4','relation-astrology-core')
    .then(function(){
      return loadScript('./relation-period-consistency-v1.5.js?v=1.5','relation-period-consistency-v1.5',false);
    })
    .catch(function(e){
      console.error('CRISTARIVA astrologie relationnelle',e);
    });

  /* La synthèse générale est désormais formulée comme une réponse continue à
     la question, sans « point de départ », « au cœur du tirage », « issue », etc. */
  loadScript('./synthesis-fluid-v3.7.js?v=3.7','synthesis-fluid-v3.7',false).catch(function(e){
    console.error('CRISTARIVA synthèse fluide',e);
  });

  const LOVE_SCRIPTS=[
    './oracle-amour-data.js?v=20260918-pdf80',
    './oracle-amour-card62-fix.js?v=20260919-card62',
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

  /* Finition générale du récit. Cette fonction s'exécute en dernier et corrige
     donc aussi les formulations produites par les surcouches narratives v5.x. */
  function polishRepeatedStoryOpeners(html){
    try{
      if(!html || document.documentElement.lang==='en') return html;
      const tpl=document.createElement('template');
      tpl.innerHTML=String(html);
      const p=tpl.content.querySelector('.story-continuous');
      if(!p) return html;

      let s=String(p.innerHTML||'').replace(/\s+/g,' ').trim();

      /* 1. Cas particuliers où le verbe réclame un complément grammatical
         explicite lorsque le nom de la carte a été retiré du récit. */
      s=s
        .replace(/(Concernant\s+(?:(?:<b>|<strong>).*?(?:<\/b>|<\/strong>)|[^,]+),\s*)Interroge\s+/gi,'$1la situation vous amène à interroger ')
        .replace(/(Concernant\s+(?:(?:<b>|<strong>).*?(?:<\/b>|<\/strong>)|[^,]+),\s*)Confronte\s+à\s+/gi,'$1la situation vous confronte à ');

      /* 2. Après « Concernant votre… », aucune autre phrase ne doit démarrer
         par un verbe sans sujet : « Concernant…, exprime… » devient
         « Concernant…, la situation exprime… ». */
      s=s.replace(
        /(Concernant\s+(?:(?:<b>|<strong>).*?(?:<\/b>|<\/strong>)|[^,]+),\s*)(?=(?:exprime|valorise|encourage|renforce|permet|apporte|ouvre|annonce|souligne|décrit|révèle|montre|traduit|représente|represente|évoque|evoque|marque|indique|signale|invite|favorise|protège|protege|oriente|pousse|appelle|dévoile|devoile|présente|presente|crée|cree|maintient|accroît|accroit|réduit|reduit|aide|peut)\b)/gi,
        '$1la situation '
      );

      /* 3. Toute nouvelle phrase doit avoir un sujet explicite. */
      s=s
        .replace(/(^|[.!?]\s+)Interroge\s+/g,'$1Cette situation vous amène à interroger ')
        .replace(/(^|[.!?]\s+)Confronte\s+à\s+/g,'$1La situation vous confronte à ');

      /* 4. Éviter les amorces infinitives isolées que l'utilisateur perçoit
         comme des fragments de définition plutôt que comme un récit. */
      s=s
        .replace(/(^|[.!?]\s+)Regarder\s+/g,'$1Le fait de regarder ')
        .replace(/(^|[.!?]\s+)Comprendre\s+/g,'$1Le fait de comprendre ')
        .replace(/(^|[.!?]\s+)Identifier\s+/g,'$1Le fait d’identifier ')
        .replace(/(^|[.!?]\s+)Accepter\s+/g,'$1Le fait d’accepter ')
        .replace(/(^|[.!?]\s+)Observer\s+/g,'$1Le fait d’observer ')
        .replace(/(^|[.!?]\s+)Écouter\s+/g,'$1Le fait d’écouter ')
        .replace(/(^|[.!?]\s+)Eviter\s+/g,'$1Le fait d’éviter ')
        .replace(/(^|[.!?]\s+)Éviter\s+/g,'$1Le fait d’éviter ');

      /* 5. Élisions françaises. Cela corrige notamment « L’enjeu est de
         identifier » en « L’enjeu est d’identifier ». */
      s=s.replace(/\bde\s+([aeiouyàâäéèêëîïôöùûüœ][a-zà-ÿœæ-]*)/gi,'d’$1');

      /* 6. Après un point-virgule, éviter une majuscule artificielle du type
         « ; L’enjeu… ». */
      s=s.replace(/\s*;\s*L[’']enjeu\s+est\s+/g,'. L’enjeu est ');

      /* 7. Varier les amorces répétées. */
      let enjeuCount=0;
      const enjeuVariants=[
        'L’enjeu est alors de ',
        'Il devient ensuite important de ',
        'Il faut également ',
        'Un autre point consiste à ',
        'Dans le même mouvement, il importe de ',
        'La suite demande aussi de '
      ];
      s=s.replace(/L[’']enjeu est alors de\s+/gi,function(){
        const replacement=enjeuVariants[Math.min(enjeuCount,enjeuVariants.length-1)];
        enjeuCount+=1;
        return replacement;
      });

      let elementCount=0;
      const elementVariants=[
        'Un élément important apparaît alors : ',
        'Un autre aspect se précise : ',
        'La situation fait ensuite ressortir : '
      ];
      s=s.replace(/Un élément important apparaît alors\s*:\s*/gi,function(){
        const replacement=elementVariants[Math.min(elementCount,elementVariants.length-1)];
        elementCount+=1;
        return replacement;
      });

      p.innerHTML=s;
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
