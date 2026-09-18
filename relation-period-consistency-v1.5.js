/* CRISTARIVA — cohérence de l’analyse croisée de période v1.5
   L’analyse croisée n°2 met en regard les transits individuels simultanés.
   Elle ne transforme plus automatiquement un transit individuel difficile
   (carré/opposition) en conflit relationnel entre les deux personnes. */
(function(){
  'use strict';
  if(window.__CRISTARIVA_RELATION_PERIOD_CONSISTENCY_V15__) return;
  window.__CRISTARIVA_RELATION_PERIOD_CONSISTENCY_V15__=true;

  const isEn=()=>window.state?.lang==='en';
  const text=(fr,en)=>isEn()?en:fr;
  const DAY=86400000;

  function dval(v){
    const d=v instanceof Date?v:new Date(v);
    return Number.isFinite(+d)?+d:0;
  }

  function dateLabel(v){
    const d=v instanceof Date?v:new Date(v);
    if(!Number.isFinite(+d)) return '';
    try{
      if(typeof cr3Date==='function') return cr3Date(d,isEn());
    }catch(e){}
    return new Intl.DateTimeFormat(isEn()?'en-GB':'fr-FR',{day:'numeric',month:'long',year:'numeric'}).format(d);
  }

  function profileHits(profile){
    if(!profile) return [];
    try{
      if(window.state?.date && typeof cr37RelevantWindows==='function' && typeof cr3DominantTheme==='function' && typeof cr3TimingWindow==='function' && typeof cr3ReadingMoment==='function'){
        const intent=typeof cr33Intent==='function'?cr33Intent():undefined;
        return cr37RelevantWindows(
          profile,
          cr3DominantTheme(state.draw||[],isEn()),
          cr3TimingWindow(state.date,cr3ReadingMoment(),isEn()),
          intent
        )||[];
      }
    }catch(e){
      console.warn('CRISTARIVA cohérence période : lecture des transits',e);
    }
    return [];
  }

  function near(a,b){
    const a0=dval(a.first||a.bestDate),a1=dval(a.last||a.bestDate),b0=dval(b.first||b.bestDate),b1=dval(b.last||b.bestDate);
    if(!a0||!b0) return false;
    if(Math.max(a0,b0)<=Math.min(a1||a0,b1||b0)) return true;
    return Math.abs(dval(a.bestDate)-dval(b.bestDate))<=21*DAY;
  }

  function pairDate(p){
    const a=dval(p.a.bestDate),b=dval(p.b.bestDate);
    if(!a&&!b) return 0;
    if(!a) return b;
    if(!b) return a;
    return Math.round((a+b)/2);
  }

  function when(p){
    const a=dval(p.a.bestDate),b=dval(p.b.bestDate);
    if(!a&&!b) return text('Sur une même phase de la période','During the same phase of the period');
    if(!a||!b) return text(`Autour du ${dateLabel(a||b)}`,`Around ${dateLabel(a||b)}`);
    if(Math.abs(a-b)<=3*DAY) return text(`Autour du ${dateLabel(new Date((a+b)/2))}`,`Around ${dateLabel(new Date((a+b)/2))}`);
    return text(`Entre le ${dateLabel(new Date(Math.min(a,b)))} et le ${dateLabel(new Date(Math.max(a,b)))}`,`Between ${dateLabel(new Date(Math.min(a,b)))} and ${dateLabel(new Date(Math.max(a,b)))}`);
  }

  function pairScore(a,b){
    const days=Math.abs(dval(a.bestDate)-dval(b.bestDate))/DAY;
    const sameTransit=a.tr&&b.tr&&a.tr===b.tr;
    const orbA=a.bestOrb??a.orb??6,orbB=b.bestOrb??b.orb??6;
    return Math.max(0,14-Math.min(days,14)) + Math.max(0,6-orbA) + Math.max(0,6-orbB) + (sameTransit?10:0);
  }

  function sharedPairs(c,r){
    const out=[];
    for(const a of profileHits(c)) for(const b of profileHits(r)){
      if(!near(a,b)) continue;
      out.push({a,b,score:pairScore(a,b)});
    }
    return out.sort((x,y)=>y.score-x.score);
  }

  const TARGET_FR={
    Soleil:'vos repères personnels, votre volonté et votre manière de vous positionner',
    Lune:'votre sensibilité et vos réactions émotionnelles',
    Mercure:'votre pensée, vos échanges et vos décisions',
    'Vénus':'vos sentiments, vos valeurs et votre manière de vous rapprocher',
    Mars:'votre initiative, votre désir et votre manière d’agir'
  };
  const TARGET_OTHER_FR={
    Soleil:'ses repères personnels, sa volonté et sa manière de se positionner',
    Lune:'sa sensibilité et ses réactions émotionnelles',
    Mercure:'sa pensée, ses échanges et ses décisions',
    'Vénus':'ses sentiments, ses valeurs et sa manière de se rapprocher',
    Mars:'son initiative, son désir et sa manière d’agir'
  };
  const TARGET_EN={
    Soleil:'your personal bearings, will and way of positioning yourself',
    Lune:'your sensitivity and emotional reactions',
    Mercure:'your thinking, exchanges and decisions',
    'Vénus':'your feelings, values and way of moving closer',
    Mars:'your initiative, desire and way of acting'
  };
  const TARGET_OTHER_EN={
    Soleil:'their personal bearings, will and way of positioning themselves',
    Lune:'their sensitivity and emotional reactions',
    Mercure:'their thinking, exchanges and decisions',
    'Vénus':'their feelings, values and way of moving closer',
    Mars:'their initiative, desire and way of acting'
  };

  function target(h,other=false){
    const map=isEn()?(other?TARGET_OTHER_EN:TARGET_EN):(other?TARGET_OTHER_FR:TARGET_FR);
    return map[h?.na]||text(other?'son fonctionnement personnel':'votre fonctionnement personnel',other?'their personal functioning':'your personal functioning');
  }

  function toneWord(h){
    if(h?.tone==='support') return text('soutient','supports');
    if(h?.tone==='challenge') return text('bouscule','challenges');
    return text('active','activates');
  }

  const PLANET_COMMON={
    Uranus:[
      'Le point commun est une période plus mobile et imprévisible, avec un besoin accru de liberté, de changement ou de renouvellement. Cette simultanéité peut accélérer l’évolution de la situation, mais elle ne signifie pas à elle seule que vous êtes en désaccord.',
      'The common theme is a more mobile and unpredictable period, with a stronger need for freedom, change or renewal. This simultaneity can accelerate developments, but it does not by itself mean that you are in conflict.'
    ],
    Jupiter:[
      'Le point commun est une phase d’ouverture, de confiance ou d’élargissement des possibilités. La manière dont chacun la vit peut différer, mais le climat général est davantage tourné vers l’expansion que vers la fermeture.',
      'The common theme is a phase of openness, confidence or expanding possibilities. Each person may experience it differently, but the overall climate is more expansive than restrictive.'
    ],
    Saturne:[
      'Le point commun est une phase de structuration, de responsabilité et de clarification des limites. Elle peut ralentir certains mouvements tout en rendant les choix plus concrets et plus durables.',
      'The common theme is a phase of structure, responsibility and clearer limits. It may slow some developments while making choices more concrete and durable.'
    ],
    Neptune:[
      'Le point commun est une sensibilité accrue, avec davantage d’intuition mais aussi un besoin de vérifier ce qui reste flou. Cette influence demande surtout de distinguer ressenti, attente et faits observables.',
      'The common theme is heightened sensitivity, with more intuition but also a need to verify what remains unclear. This influence mainly calls for distinguishing feelings, expectations and observable facts.'
    ],
    Mars:[
      'Le point commun est une accélération de l’initiative et de la réactivité. La période peut faire bouger les choses plus vite, à condition de laisser une place suffisante au rythme de chacun.',
      'The common theme is faster initiative and reactivity. The period can move things forward more quickly, provided each person’s pace has enough room.'
    ],
    'Vénus':[
      'Le point commun est une attention accrue portée aux sentiments, au plaisir d’être ensemble et à la qualité du lien. Cette influence peut faciliter l’expression affective sans garantir à elle seule la forme future de la relation.',
      'The common theme is greater attention to feelings, enjoyment of being together and the quality of the bond. This influence can make affection easier to express without determining the relationship’s future form by itself.'
    ]
  };

  function sameTransitNarrative(p){
    const planet=p.a.tr||p.b.tr||'';
    const common=PLANET_COMMON[planet]||[
      'Vos deux thèmes sont donc activés au même moment par une influence de même nature. Cela décrit une phase commune de mouvement, sans suffire à conclure à un rapprochement ou à un éloignement.',
      'Both charts are therefore activated at the same time by the same type of influence. This describes a shared period of movement without being enough to conclude rapprochement or distancing.'
    ];
    if(isEn()){
      return `${when(p)}, ${planet} ${toneWord(p.a)} ${target(p.a,false)}, while in the other chart it ${toneWord(p.b)} ${target(p.b,true)}. ${common[1]}`;
    }
    return `${when(p)}, ${planet} ${toneWord(p.a)} ${target(p.a,false)}, tandis que dans l’autre thème il ${toneWord(p.b)} ${target(p.b,true)}. ${common[0]}`;
  }

  function mixedTransitNarrative(p){
    const bothSupport=p.a.tone==='support'&&p.b.tone==='support';
    const bothChallenge=p.a.tone==='challenge'&&p.b.tone==='challenge';
    if(isEn()){
      let end='These simultaneous individual influences can change the relationship’s pace, but they do not by themselves establish agreement, conflict, rapprochement or distancing.';
      if(bothSupport) end='Both charts are receiving relatively supportive influences at the same time, which can make the period more available to movement or dialogue without predetermining the outcome.';
      else if(bothChallenge) end='Both charts are going through a more demanding phase at the same time. This may require more flexibility, but it does not by itself mean that the two of you are in conflict.';
      return `${when(p)}, ${p.a.tr||'one influence'} ${toneWord(p.a)} ${target(p.a,false)}, while ${p.b.tr||'another influence'} ${toneWord(p.b)} ${target(p.b,true)}. ${end}`;
    }
    let end='Ces influences individuelles simultanées peuvent modifier le rythme du lien, mais elles ne suffisent pas à établir un accord, un conflit, un rapprochement ou un éloignement.';
    if(bothSupport) end='Les deux thèmes reçoivent donc simultanément des influences plutôt porteuses, ce qui peut rendre la période plus disponible au mouvement ou au dialogue sans prédéterminer l’issue.';
    else if(bothChallenge) end='Les deux thèmes traversent donc simultanément une phase plus exigeante. Cela peut demander davantage de souplesse, mais ne signifie pas à lui seul que vous êtes en conflit.';
    return `${when(p)}, ${p.a.tr||'une influence'} ${toneWord(p.a)} ${target(p.a,false)}, tandis que ${p.b.tr||'une autre influence'} ${toneWord(p.b)} ${target(p.b,true)}. ${end}`;
  }

  function periodNarrative(c,r){
    const pairs=sharedPairs(c,r);
    if(!pairs.length){
      return text(
        'Sur la période étudiée, les transits retenus pour chacun ne se recouvrent pas assez nettement pour dégager une phase commune fiable. Les deux évolutions individuelles restent donc à lire séparément.',
        'Over the period studied, the selected transits for each person do not overlap clearly enough to define a reliable shared phase. The two individual developments should therefore be read separately.'
      );
    }

    const selected=[],seenDate=new Set(),seenTransit=new Set();
    for(const p of pairs){
      const d=Math.round(pairDate(p)/(4*DAY));
      const same=p.a.tr&&p.b.tr&&p.a.tr===p.b.tr?p.a.tr:'';
      const key=`${d}|${same||p.a.tr+'-'+p.b.tr}`;
      if(seenDate.has(d)&&(!same||seenTransit.has(same))) continue;
      if(seenDate.has(key)) continue;
      selected.push(p);
      seenDate.add(d);
      if(same) seenTransit.add(same);
      if(selected.length===2) break;
    }
    selected.sort((a,b)=>pairDate(a)-pairDate(b));
    return selected.map(p=>p.a.tr&&p.b.tr&&p.a.tr===p.b.tr?sameTransitNarrative(p):mixedTransitNarrative(p)).join(' ');
  }

  function rewriteCrossPeriod(){
    try{
      const box=document.getElementById('synthesis');
      const section=box?.querySelector('.cr-cross-transits');
      if(!section||!window.state?.astro||!window.state?.relationAstro||!window.state?.date) return;
      const ps=section.querySelectorAll('p');
      if(ps[0]) ps[0].textContent=text(
        'Cette seconde lecture met en regard les influences qui touchent chacun de vos thèmes sur la période définie par la carte Datation. Elle recherche les moments où vos deux rythmes astrologiques sont activés simultanément, sans transformer un transit individuel en aspect relationnel entre vous.',
        'This second reading compares the influences affecting each chart over the period defined by the Timing card. It looks for moments when both astrological rhythms are activated at the same time, without turning an individual transit into a relationship aspect between you.'
      );
      if(ps[1]) ps[1].textContent=periodNarrative(state.astro,state.relationAstro);
      section.dataset.periodConsistency='1.5';
    }catch(e){
      console.warn('CRISTARIVA cohérence analyse croisée',e);
    }
  }

  function install(){
    if(typeof window.renderSynthesis!=='function') return false;
    if(window.renderSynthesis.__cristarivaPeriodConsistencyV15) return true;
    const base=window.renderSynthesis;
    const wrapped=function(){
      const out=base.apply(this,arguments);
      setTimeout(rewriteCrossPeriod,0);
      return out;
    };
    wrapped.__cristarivaPeriodConsistencyV15=true;
    window.renderSynthesis=wrapped;
    rewriteCrossPeriod();
    return true;
  }

  if(!install()){
    let tries=0;
    const timer=setInterval(function(){
      tries+=1;
      if(install()||tries>40) clearInterval(timer);
    },50);
  }
})();
