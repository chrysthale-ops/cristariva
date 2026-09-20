/* CRISTARIVA — chargeur Android/Web + finition narrative finale, 20 septembre 2026.
   - charge l’astrologie relationnelle et la cohérence de période ;
   - charge l’Oracle Amour ;
   - corrige en dernier ressort les phrases sans sujet dans le récit ;
   - supprime les amorces mécaniques avec « alors » ;
   - conserve une progression avant / maintenant / élan pour les tirages à 3 cartes.
*/
(function(){
  'use strict';

  function loadScript(src,marker,force){
    return new Promise(function(resolve,reject){
      if(!force){
        const exists=[...document.scripts].some(function(s){
          return (marker&&s.dataset&&s.dataset.cristariva===marker)||
            (s.src&&s.src.indexOf(src.split('?')[0].replace('./',''))!==-1);
        });
        if(exists)return resolve();
      }
      const el=document.createElement('script');
      el.src=src;
      el.async=false;
      if(marker)el.dataset.cristariva=marker;
      el.onload=resolve;
      el.onerror=function(){reject(new Error('Impossible de charger '+src));};
      document.body.appendChild(el);
    });
  }

  loadScript('./relation-astrology-core-v1.4.js?v=1.4','relation-astrology-core')
    .then(function(){
      return loadScript('./relation-period-consistency-v1.5.js?v=1.6','relation-period-consistency-v1.6',false);
    })
    .catch(function(e){console.error('CRISTARIVA astrologie relationnelle',e);});

  loadScript('./synthesis-fluid-v3.7.js?v=3.7','synthesis-fluid-v3.7',false)
    .catch(function(e){console.error('CRISTARIVA synthèse fluide',e);});

  const LOVE_SCRIPTS=[
    './oracle-amour-data.js?v=20260918-pdf80',
    './oracle-amour-card62-fix.js?v=20260919-card62',
    './oracle-amour-integration.js?v=20260918-pdf80',
    './oracle-amour-compat.js?v=20260918-pdf80'
  ];

  async function ensureOracleAmour(){
    if(window.__CRISTARIVA_LOVE_DIRECT_BOOTSTRAP__)return window.__CRISTARIVA_LOVE_DIRECT_BOOTSTRAP__;
    window.__CRISTARIVA_LOVE_DIRECT_BOOTSTRAP__=(async function(){
      const hasSentimental=function(){return !!document.querySelector('#domain option[value="Sentimental"]');};
      if(window.AMOUR_DATA&&hasSentimental())return true;
      for(const src of LOVE_SCRIPTS){
        try{await loadScript(src,'love-'+src.split('/').pop().split('?')[0],false);}
        catch(e){console.error('CRISTARIVA Oracle Amour',e);}
      }
      if(window.AMOUR_DATA&&!hasSentimental()){
        try{await loadScript('./oracle-amour-integration.js?v=20260918-pdf80-repair','love-integration-repair',true);}
        catch(e){console.error('CRISTARIVA réparation Sentimental',e);}
      }
      return !!(window.AMOUR_DATA&&hasSentimental());
    })();
    return window.__CRISTARIVA_LOVE_DIRECT_BOOTSTRAP__;
  }

  const BARE_VERBS='Parle|Confirme|Décrit|Decrit|Souligne|Signale|Indique|Invite|Évoque|Evoque|Représente|Represente|Montre|Révèle|Revele|Traduit|Marque|Favorise|Exprime|Valorise|Encourage|Renforce|Permet|Apporte|Ouvre|Annonce|Oriente|Protège|Protege|Crée|Cree|Maintient|Aide';

  function polishRepeatedStoryOpeners(html){
    try{
      if(!html||document.documentElement.lang==='en')return html;
      const tpl=document.createElement('template');
      tpl.innerHTML=String(html);
      const p=tpl.content.querySelector('.story-continuous');
      if(!p)return html;
      let s=String(p.innerHTML||'').replace(/\s+/g,' ').trim();

      s=s
        .replace(/(Concernant\s+(?:(?:<b>|<strong>).*?(?:<\/b>|<\/strong>)|[^,]+),\s*)Interroge\s+/gi,'$1la situation vous amène à interroger ')
        .replace(/(Concernant\s+(?:(?:<b>|<strong>).*?(?:<\/b>|<\/strong>)|[^,]+),\s*)Confronte\s+à\s+/gi,'$1la situation vous confronte à ')
        .replace(
          /(Concernant\s+(?:(?:<b>|<strong>).*?(?:<\/b>|<\/strong>)|[^,]+),\s*)(?=(?:exprime|valorise|encourage|renforce|permet|apporte|ouvre|annonce|souligne|décrit|révèle|montre|traduit|représente|represente|évoque|evoque|marque|indique|signale|invite|favorise|protège|protege|oriente|pousse|appelle|dévoile|devoile|présente|presente|crée|cree|maintient|accroît|accroit|réduit|reduit|aide|peut|parle|confirme)\b)/gi,
          '$1la situation '
        );

      s=s
        .replace(/(^|[.!?]\s+)Interroge\s+/g,'$1Cette situation vous amène à interroger ')
        .replace(/(^|[.!?]\s+)Confronte\s+à\s+/g,'$1La situation vous confronte à ')
        .replace(new RegExp('(^|[.!?]\\s+)('+BARE_VERBS+')\\b','g'),function(_,sep,verb){
          return sep+'Le tirage '+verb.toLocaleLowerCase();
        });

      s=s
        .replace(/(^|[.!?]\s+)Regarder\s+/g,'$1Le fait de regarder ')
        .replace(/(^|[.!?]\s+)Comprendre\s+/g,'$1Le fait de comprendre ')
        .replace(/(^|[.!?]\s+)Identifier\s+/g,'$1Le fait d’identifier ')
        .replace(/(^|[.!?]\s+)Accepter\s+/g,'$1Le fait d’accepter ')
        .replace(/(^|[.!?]\s+)Observer\s+/g,'$1Le fait d’observer ')
        .replace(/(^|[.!?]\s+)Écouter\s+/g,'$1Le fait d’écouter ')
        .replace(/(^|[.!?]\s+)(?:Eviter|Éviter)\s+/g,'$1Le fait d’éviter ');

      s=s
        .replace(/\bde\s+([aeiouyàâäéèêëîïôöùûüœ][a-zà-ÿœæ-]*)/gi,'d’$1')
        .replace(/\s*;\s*L[’']enjeu\s+est\s+/g,'. L’enjeu est ')
        .replace(/\bLe tirage (ne [^.!?]{0,160}), mais elle\b/gi,'Le tirage $1, mais il')
        .replace(/\bLe tirage ([^.!?]{0,160}), mais elle\b/gi,'Le tirage $1, mais il');

      /* « alors » est devenu une amorce trop visible dans les récits générés.
         On le retire au dernier passage, puis on nettoie la ponctuation. */
      s=s.replace(/\balors\b\s*/gi,'');

      let enjeuCount=0;
      const enjeuVariants=[
        'L’enjeu consiste à ',
        'Il devient ensuite important de ',
        'Il faut également ',
        'Un autre point consiste à ',
        'Dans le même mouvement, il importe de ',
        'La suite demande aussi de '
      ];
      s=s.replace(/L[’']enjeu est\s+de\s+/gi,function(){
        const replacement=enjeuVariants[Math.min(enjeuCount,enjeuVariants.length-1)];
        enjeuCount+=1;
        return replacement;
      });

      let elementCount=0;
      const elementVariants=[
        'Un élément important apparaît : ',
        'Un autre aspect se précise : ',
        'La situation fait ensuite ressortir : '
      ];
      s=s.replace(/Un élément important apparaît\s*:\s*/gi,function(){
        const replacement=elementVariants[Math.min(elementCount,elementVariants.length-1)];
        elementCount+=1;
        return replacement;
      });

      s=s
        .replace(/\s+([,.;:!?])/g,'$1')
        .replace(/,\s*,/g,', ')
        .replace(/\.\s*\./g,'.')
        .replace(/\s{2,}/g,' ')
        .trim();

      p.innerHTML=s;
      return tpl.innerHTML;
    }catch(e){return html;}
  }

  function threeCardPolarity(card){
    const raw=String(card?.category||'').toLowerCase();
    if(raw.includes('positive'))return 1;
    if(raw.includes('négative')||raw.includes('negative'))return -1;
    return 0;
  }

  function threeCardClause(card){
    try{
      const scope=typeof cr51Scope==='function'?cr51Scope():'relation';
      if(typeof cr51Meaning==='function')return String(cr51Meaning(card,scope,false)||'').trim();
    }catch(e){}
    try{
      const d=String(state?.domain||'').toLowerCase();
      const raw=d.includes('profession')?card?.reading_professionnel:d.includes('relation')?card?.reading_relationnel:card?.reading_spirituel;
      const value=String(raw||card?.meaning||card?.definition||'').trim();
      return typeof cr51Esc==='function'?cr51Esc(value):value;
    }catch(e){return '';}
  }

  function threeCardClean(text){
    return String(text||'')
      .replace(/\balors\b/gi,'')
      .replace(/\s+/g,' ')
      .replace(/\s+([,.;:!?])/g,'$1')
      .trim();
  }

  function threeCardLowerFirst(text){
    const s=String(text||'').trim();
    return s?s.charAt(0).toLocaleLowerCase()+s.slice(1):s;
  }

  function subjectifyClause(text){
    let s=threeCardClean(text);
    const rx=new RegExp('^('+BARE_VERBS+')\\b','i');
    if(rx.test(s))s=s.replace(rx,function(v){return 'Le tirage '+v.toLocaleLowerCase();});
    return s;
  }

  function threeCardOpening(text){
    let s=subjectifyClause(text)
      .replace(/^On voit\s+se dessiner\s+/i,'')
      .replace(/^La situation décrit\s+/i,'');
    return 'Au départ, '+threeCardLowerFirst(s);
  }

  function threeCardPresent(text){
    let s=subjectifyClause(text)
      .replace(/^Peu à peu,\s*/i,'')
      .replace(/^Dans cette dynamique,\s*/i,'');
    return 'Aujourd’hui, '+threeCardLowerFirst(s);
  }

  function threeCardMomentum(text,previousCard,currentCard){
    let s=threeCardClean(text),direct=false;
    const starters=[
      /^On voit\s+se dessiner\s+/i,
      /^La suite peut\s+faire apparaître\s+/i,
      /^Peu à peu,\s*on voit apparaître\s+/i,
      /^Une nouvelle possibilité peut\s+s’ouvrir autour de\s+/i,
      /^(?:Le tirage|La situation|Cette carte)\s+(?:signale|décrit|confirme|représente|montre|révèle|indique|évoque)\s+/i,
      /^(?:Signale|Décrit|Confirme|Représente|Montre|Révèle|Indique|Évoque)\s+/i
    ];
    for(const rx of starters){if(rx.test(s)){s=s.replace(rx,'');direct=true;break;}}
    const before=threeCardPolarity(previousCard),after=threeCardPolarity(currentCard);
    const transition=before<0&&after>0?'Pourtant, ':before>0&&after<0?'Cependant, ':'À partir de là, ';
    if(direct)return transition+'l’élan qui se dégage va vers '+threeCardLowerFirst(s);
    return transition+'l’élan qui se dégage conduit vers une évolution où '+threeCardLowerFirst(subjectifyClause(s));
  }

  function enforceThreeCardArc(html,cards){
    try{
      if(!html||document.documentElement.lang==='en'||!Array.isArray(cards)||cards.length!==3)return html;
      const tpl=document.createElement('template');
      tpl.innerHTML=String(html);
      const p=tpl.content.querySelector('.story-continuous');
      if(!p)return html;
      const first=threeCardClause(cards[0]),present=threeCardClause(cards[1]),momentum=threeCardClause(cards[2]);
      if(!first||!present||!momentum)return html;
      p.innerHTML=[threeCardOpening(first),threeCardPresent(present),threeCardMomentum(momentum,cards[1],cards[2])].join(' ');
      return tpl.innerHTML;
    }catch(e){return html;}
  }

  let installedBase=null;
  function installStoryPolish(){
    try{
      if(typeof window.storyInterpretation!=='function')return false;
      if(window.storyInterpretation.__cristarivaFinalPolish20260920)return true;
      const base=window.storyInterpretation;
      installedBase=base;
      const wrapped=function(cards){
        let html=base.apply(this,arguments);
        html=polishRepeatedStoryOpeners(html);
        html=enforceThreeCardArc(html,cards);
        /* IMPORTANT : l’arc à trois cartes repart des définitions brutes ;
           on repasse donc la finition après lui pour éviter « Parle… » etc. */
        return polishRepeatedStoryOpeners(html);
      };
      wrapped.__cristarivaFinalPolish20260920=true;
      window.storyInterpretation=wrapped;
      window.interpretation=function(cards){return window.storyInterpretation(cards);};
      if(window.state&&Array.isArray(state.draw)&&state.draw.length){
        const target=document.getElementById('reading');
        if(target&&/L’histoire racontée par vos cartes|The story told by your cards/.test(target.textContent||'')){
          target.innerHTML=window.storyInterpretation(state.draw);
        }
      }
      return true;
    }catch(e){console.error('CRISTARIVA finition narrative',e);return false;}
  }

  installStoryPolish();

  async function boot(){
    await ensureOracleAmour();
    /* Certains scripts de l’Oracle Amour peuvent redéfinir l’interprétation.
       On réinstalle donc la finition après leur chargement. */
    if(typeof window.storyInterpretation==='function'&&window.storyInterpretation!==installedBase){installStoryPolish();}
    setTimeout(installStoryPolish,50);
    setTimeout(installStoryPolish,250);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();