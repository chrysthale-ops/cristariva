/* CRISTARIVA — qualité des pics astrologiques v4.0
   1. Déclencheur : jamais le jour civil du tirage.
   2. Cartes Datation finies : sauf « Immédiat », la section Évolution ne retient
      que des pics postérieurs au jour du tirage et affine la vraie date du minimum d’orbe.
   3. Une question sur un désir/envie n’est plus automatiquement classée sexuelle.
   4. Les impacts successifs sont reformulés selon la question afin d’éviter les répétitions. */
const CRISTARIVA_TRIGGER_DATE_GUARD_VERSION='4.0';

(function(){
  if(typeof cr37RelevantWindows!=='function')return;

  function cr400CardId(window){
    return Number((window?.card||state?.date)?.id||0);
  }
  function cr400IsTrigger(window){return cr400CardId(window)===129;}
  function cr400IsFinite(window){const id=cr400CardId(window);return id>=116&&id<=128&&!!window?.end;}
  function cr400IsImmediate(window){return cr400CardId(window)===116;}
  function cr400NextCalendarDay(date){
    const d=new Date(date);
    return new Date(d.getFullYear(),d.getMonth(),d.getDate()+1,0,0,0,0);
  }
  function cr400ClampDate(date,min,max){
    const t=Math.max(+min,Math.min(+max,+date));
    return new Date(t);
  }

  /* Le scanner de base peut travailler au pas de deux ou quatre jours.
     On ré-affine chaque candidat autour de sa meilleure date échantillonnée
     afin de retrouver le véritable minimum d’orbe au jour près. */
  function cr400RefinePeak(a,hit,window){
    if(typeof cr395AspectOrbAt!=='function')return hit;
    const center=new Date(hit.bestDate);
    let bestDate=new Date(center),bestOrb=Number.isFinite(hit.bestOrb)?hit.bestOrb:99;
    for(let delta=-3;delta<=3;delta++){
      const d=cr400ClampDate(cr3AddDays(center,delta),window.start,window.end);
      const orb=cr395AspectOrbAt(a,hit,d);
      if(Number.isFinite(orb)&&orb<bestOrb){bestOrb=orb;bestDate=new Date(d);}
    }
    return {...hit,bestDate,bestOrb};
  }

  function cr400RankFutureFinite(a,theme,window,intent){
    const cutoff=cr400NextCalendarDay(window.start);
    const all=cr37AllTransitWindows(a,theme,window).map(h=>cr400RefinePeak(a,h,window));
    const ranked=all.map(h=>({hit:h,weight:cr37QuestionWeight(h,intent)}))
      .filter(x=>x.weight>=5||x.hit.priority>=2)
      .filter(x=>new Date(x.hit.bestDate)>=cutoff)
      .filter(x=>typeof cr395IsLocalPeak!=='function'||cr395IsLocalPeak(a,x.hit,x.hit.bestDate))
      .sort((a,b)=>
        b.weight-a.weight ||
        (b.hit.priority||0)-(a.hit.priority||0) ||
        (a.hit.bestOrb||99)-(b.hit.bestOrb||99) ||
        a.hit.bestDate-b.hit.bestDate
      );

    const seen=new Set(),unique=[];
    for(const item of ranked){
      const h=item.hit,key=[h.tr,h.name,h.na].join('|');
      if(seen.has(key))continue;
      seen.add(key);unique.push(h);
    }

    const limit=typeof cr38WindowLimit==='function'?cr38WindowLimit(window):2;
    const selected=[],usedTransit=new Set();
    for(const h of unique){
      if(selected.length>=limit)break;
      if(usedTransit.has(h.tr))continue;
      selected.push(h);usedTransit.add(h.tr);
    }
    if(selected.length<limit){
      for(const h of unique){
        if(selected.length>=limit)break;
        if(selected.includes(h))continue;
        selected.push(h);
      }
    }
    return selected.sort((a,b)=>a.bestDate-b.bestDate);
  }

  function cr400FutureTriggerWindows(a,theme,window,intent){
    if(typeof cr395TriggerTransitWindows!=='function'||typeof cr395IsLocalPeak!=='function')return [];
    const all=cr395TriggerTransitWindows(a,theme,window),cutoff=cr400NextCalendarDay(window.start);
    const ranked=all.map(h=>({hit:h,weight:cr37QuestionWeight(h,intent)}))
      .filter(x=>x.weight>=5||x.hit.priority>=2)
      .filter(x=>new Date(x.hit.bestDate)>=cutoff)
      .filter(x=>(x.hit.bestOrb??99)<=1.25&&cr395IsLocalPeak(a,x.hit,x.hit.bestDate))
      .sort((a,b)=>
        a.hit.bestDate-b.hit.bestDate ||
        b.weight-a.weight ||
        (b.hit.priority||0)-(a.hit.priority||0) ||
        (a.hit.bestOrb||99)-(b.hit.bestOrb||99)
      );
    const seen=new Set(),selected=[];
    for(const item of ranked){
      const h=item.hit,key=[h.tr,h.name,h.na,+new Date(h.bestDate)].join('|');
      if(seen.has(key))continue;
      seen.add(key);selected.push(h);
      if(selected.length>=2)break;
    }
    return selected;
  }

  const previousRelevant=cr37RelevantWindows;
  cr37RelevantWindows=function(a,theme,window,intent){
    if(cr400IsTrigger(window))return cr400FutureTriggerWindows(a,theme,window,intent);
    if(cr400IsFinite(window)&&!cr400IsImmediate(window))return cr400RankFutureFinite(a,theme,window,intent);
    return previousRelevant(a,theme,window,intent);
  };

  /* « désir » ou « envie » seuls ne signifient pas automatiquement sexualité.
     Le classement sexuel reste réservé à une formulation explicitement sexuelle,
     physique, charnelle ou intime. */
  if(typeof cr33Intent==='function'){
    const previousIntent=cr33Intent;
    cr33Intent=function(){
      const intent=previousIntent(),q=String(state?.question||'').toLowerCase();
      const desireFocused=/\b(désir\w*|desir\w*|envie\w*|souhait\w*|aspiration\w*|ce que je veux)\b/i.test(q);
      const explicitSex=/\b(sex\w*|sexuel\w*|sexual\w*|intimit\w*|coucher|rapport\s+sexuel|physique\w*|charnel\w*|attirance\s+sexuelle)\b/i.test(q);
      if(desireFocused&&!explicitSex)intent.sexual=false;
      intent.desireFocused=desireFocused&&!explicitSex;
      return intent;
    };
  }

  if(typeof cr37ImpactText==='function'){
    const previousImpact=cr37ImpactText;
    cr37ImpactText=function(hit,intent,en=false){
      if(!intent?.desireFocused)return previousImpact(hit,intent,en);
      const tr=hit.tr,tone=hit.tone;
      if(en){
        const map={
          'Vénus':tone==='challenge'?'can make it harder to distinguish genuine attraction from the wish to feel reassured':'can highlight what genuinely attracts you and what feels naturally satisfying',
          'Mars':tone==='challenge'?'can create impatience or pressure around what you want':'can strengthen the drive to recognise, own and express what you want',
          'Jupiter':tone==='challenge'?'can enlarge expectations beyond what is currently realistic':'can broaden your sense of what is possible and give more confidence to your aspirations',
          'Saturne':tone==='challenge'?'can confront your wishes with limits, delays or necessary choices':'can help distinguish a lasting desire from a passing impulse',
          'Uranus':tone==='challenge'?'can unsettle an old desire by introducing an unexpected need for change':'can bring out a new or previously unacknowledged desire',
          'Neptune':tone==='challenge'?'can blur the line between deep desire and idealisation':'can intensify imagination and intuition around what you long for'
        };
        return map[tr]||previousImpact(hit,intent,en);
      }
      const map={
        'Vénus':tone==='challenge'?'peut rendre plus difficile la distinction entre une attirance authentique et le besoin d’être rassuré':'peut mettre en lumière ce qui vous attire réellement et ce qui vous procure un accord intérieur naturel',
        'Mars':tone==='challenge'?'peut créer de l’impatience ou une pression autour de ce que vous voulez':'peut renforcer l’élan nécessaire pour reconnaître, assumer et exprimer ce que vous voulez',
        'Jupiter':tone==='challenge'?'peut amplifier vos attentes au-delà de ce qui est actuellement réaliste':'peut élargir votre perception des possibles et donner davantage d’ampleur à vos aspirations',
        'Saturne':tone==='challenge'?'peut confronter vos envies à des limites, des délais ou des choix nécessaires':'peut aider à distinguer un désir durable d’une impulsion passagère',
        'Uranus':tone==='challenge'?'peut bousculer une envie ancienne en faisant émerger un besoin inattendu de changement':'peut faire apparaître une envie nouvelle ou jusque-là difficile à reconnaître',
        'Neptune':tone==='challenge'?'peut brouiller la frontière entre désir profond et idéalisation':'peut intensifier l’imaginaire et l’intuition autour de ce que vous désirez'
      };
      return map[tr]||previousImpact(hit,intent,en);
    };
  }

  if(typeof cr33OverallTone==='function'){
    const previousTone=cr33OverallTone;
    cr33OverallTone=function(period,intent,en=cr3En()){
      if(!intent?.desireFocused)return previousTone(period,intent,en);
      const hits=period?.hits||[],supports=hits.filter(h=>h.tone==='support').length,challenges=hits.filter(h=>h.tone==='challenge').length;
      if(en){
        if(supports>challenges)return 'The period offers useful support for clarifying what you want and owning it more fully.';
        if(challenges>supports+1)return 'The period calls mainly for sorting deep desire from expectation, impatience or projection.';
        return 'The period alternates between momentum and reassessment, helping you refine what you truly want.';
      }
      if(supports>challenges)return 'La période offre plusieurs appuis pour clarifier ce que vous voulez et mieux l’assumer.';
      if(challenges>supports+1)return 'La période demande surtout de distinguer le désir profond de l’attente, de l’impatience ou de la projection.';
      return 'La période alterne élan et remise en question, ce qui peut vous aider à préciser ce que vous voulez réellement.';
    };
  }

  if(typeof cr362Timing==='function'&&typeof cr37WindowsText==='function'){
    cr362Timing=function(a,en=false){return cr37WindowsText(a,en);};
  }

  const out=document.getElementById('astroResult');
  if(out&&state?.astro&&typeof formatAstroResult==='function')out.innerHTML=formatAstroResult();
  if(typeof renderSynthesis==='function')renderSynthesis();
})();
