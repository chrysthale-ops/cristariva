/* CRISTARIVA — sélection et récit des pics astrologiques v3.9.5
   Présente les transits comme un récit court et fluide :
   1 pic jusqu'à 2 semaines, 2 pics maximum jusqu'à 3 mois, 3 au-delà.
   Ne montre plus les longues fenêtres : seules les dates de pic sont signalées.
   Diversifie les influences retenues pour éviter les répétitions d'une même planète.
   Conserve aussi le texte d'impact concis et l'ouverture spirituelle sans phrase générique.
   Supprime les conclusions automatiques ajoutées après le récit des cartes.
   Pour la carte Déclencheur, recherche prospectivement les prochains vrais pics
   au lieu d'utiliser automatiquement le jour du tirage. */
const CRISTARIVA_PERIOD_WINDOW_LIMIT_VERSION='3.9.5';

function cr38WindowLimit(window){
  if(!window?.end)return 1;
  const days=Math.max(0,(window.end-window.start)/86400000);
  if(days<=14.5)return 1;
  // Jusqu'à trois mois calendaires : deux pics maximum.
  if(days<=93.5)return 2;
  return 3;
}

// Version concise des impacts : on conserve l'effet du transit lui-même,
// sans ajouter la terminaison « en lien avec [planète natale] ».
cr37ImpactText=function(hit,intent,en=false){
  const trFr={Jupiter:'l’ouverture, la confiance et les possibilités',Saturne:'les limites, la patience et la construction durable',Uranus:'les changements soudains, la liberté et les retournements',Neptune:'l’intuition, l’idéalisation et les zones floues',Mars:'le désir, l’initiative et le passage à l’action','Vénus':'l’attirance, le lien et l’harmonie'};
  const trEn={Jupiter:'openness, confidence and possibilities',Saturne:'limits, patience and long-term construction',Uranus:'sudden change, freedom and reversals',Neptune:'intuition, idealisation and ambiguity',Mars:'desire, initiative and action','Vénus':'attraction, bonding and harmony'};
  const trArea=(en?trEn:trFr)[hit.tr]||cr3Planet(hit.tr,en);
  if(en){
    const verb=hit.tone==='support'?'can support':hit.tone==='challenge'?'can put pressure on':'can strongly activate';
    let text=`${verb} ${trArea}`;
    if(intent?.sexual&&(['Vénus','Mars'].includes(hit.tr)||['Vénus','Mars'].includes(hit.na)))text+='; this may affect attraction, desire or initiative, but it does not establish another person’s consent';
    return text;
  }
  const verb=hit.tone==='support'?'peut soutenir':hit.tone==='challenge'?'peut mettre sous tension':'peut activer fortement';
  let text=`${verb} ${trArea}`;
  if(intent?.sexual&&(['Vénus','Mars'].includes(hit.tr)||['Vénus','Mars'].includes(hit.na)))text+=' ; cette période peut donc agir sur l’attirance, le désir ou l’initiative, sans permettre de déduire le consentement d’une autre personne';
  return text;
};

// Le récit Général / spirituel commence directement par les cartes.
// On conserve les introductions spécifiques Relations et Professionnel / Projet.
const cr382PreviousStoryOpening=typeof cr51Opening==='function'?cr51Opening:null;
if(cr382PreviousStoryOpening){
  cr51Opening=function(scope,en=false){
    if(scope==='spirit')return '';
    return cr382PreviousStoryOpening(scope,en);
  };
}

// Le récit doit se terminer avec ce qu'apporte réellement la dernière carte.
// Aucune phrase générique ou morale n'est ajoutée automatiquement après elle.
if(typeof cr51Closing==='function'){
  cr51Closing=function(){return '';};
}

function cr37RelevantWindows(a,theme,window,intent){
  const all=cr37AllTransitWindows(a,theme,window);
  const ranked=all.map(h=>({hit:h,weight:cr37QuestionWeight(h,intent)}))
    .filter(x=>x.weight>=5||x.hit.priority>=2)
    .sort((a,b)=>
      b.weight-a.weight ||
      (b.hit.priority||0)-(a.hit.priority||0) ||
      (a.hit.bestOrb||99)-(b.hit.bestOrb||99) ||
      (b.hit.points||0)-(a.hit.points||0)
    );

  const seen=new Set(),unique=[];
  for(const item of ranked){
    const h=item.hit;
    const key=[h.tr,h.name,h.na,+h.first,+h.last].join('|');
    if(seen.has(key))continue;
    seen.add(key);
    unique.push(h);
  }

  const limit=cr38WindowLimit(window);

  // On privilégie d'abord des planètes transitantes différentes afin d'éviter
  // deux phrases successives qui répètent exactement le même thème.
  const selected=[],usedTransit=new Set();
  for(const h of unique){
    if(selected.length>=limit)break;
    if(usedTransit.has(h.tr))continue;
    selected.push(h);
    usedTransit.add(h.tr);
  }
  // Si la diversité ne suffit pas, on complète avec le meilleur transit restant.
  if(selected.length<limit){
    for(const h of unique){
      if(selected.length>=limit)break;
      if(selected.includes(h))continue;
      selected.push(h);
    }
  }
  return selected.sort((a,b)=>a.bestDate-b.bestDate);
}

function cr38PeakDate(hit,en=false){
  return en?`around ${cr3Date(hit.bestDate,true)}`:`autour du ${cr3Date(hit.bestDate,false)}`;
}

function cr38PeakSentence(hit,index,en=false){
  const when=cr38PeakDate(hit,en);
  const aspect=cr37AspectLabel(hit,en);
  const impact=cr37ImpactText(hit,cr33Intent(),en);
  if(en){
    const lead=index===0?'A first significant point appears':'A second significant point appears';
    return `${lead} ${when}: ${aspect} ${impact}.`;
  }
  const lead=index===0?'Un premier moment significatif ressort':'Un second moment ressort';
  return `${lead} ${when} : ${aspect} ${impact}.`;
}

function cr37WindowsText(a,en=false){
  if(!a||!state?.date)return '';
  const intent=cr33Intent(),theme=cr3DominantTheme(state.draw||[],en),window=cr3TimingWindow(state.date,cr3ReadingMoment(),en);
  const relevant=cr37RelevantWindows(a,theme,window,intent);
  if(!relevant.length){
    if(!window.end)return en?'No clearly question-relevant planetary peak is identifiable at the reading date.':'Aucun pic planétaire clairement lié à votre question n’est identifiable au moment du tirage.';
    return en?'No sufficiently significant planetary peak stands out within the period defined by the Timing card.':'Aucun pic planétaire suffisamment significatif ne ressort à l’intérieur de la période définie par la carte Datation.';
  }
  return relevant.map((h,i)=>cr38PeakSentence(h,i,en)).join(' ');
}

function cr37WindowsMarkup(a,en=false){
  if(!a||!state?.date)return '';
  const text=cr37WindowsText(a,en);
  return `<p class="cr37-peaks">${cr3Escape(text)}</p>`;
}

/* Déclencheur : la carte ne donne aucune date fixe. On recherche donc les
   prochains minima d'orbe réels après le tirage, dans un horizon technique de
   deux mois, sans transformer le jour du tirage en pic par défaut. */
function cr395IsTriggerWindow(window){
  const card=window?.card||state?.date;
  return Number(card?.id||0)===129;
}

function cr395CloneHit(hit){
  return {...hit,first:new Date(hit.first),last:new Date(hit.last),bestDate:new Date(hit.bestDate)};
}

function cr395MergeTriggerHits(hits){
  const merged=new Map();
  for(const hit of hits){
    const key=[hit.tr,hit.name,hit.na].join('|');
    const current=merged.get(key);
    if(!current){
      merged.set(key,cr395CloneHit(hit));
      continue;
    }
    if(hit.first<current.first)current.first=new Date(hit.first);
    if(hit.last>current.last)current.last=new Date(hit.last);
    current.points=(current.points||0)+(hit.points||0);
    current.priority=Math.max(current.priority||0,hit.priority||0);
    if((hit.bestOrb??99)<(current.bestOrb??99)){
      current.bestOrb=hit.bestOrb;
      current.bestDate=new Date(hit.bestDate);
      current.tone=hit.tone;
    }
  }
  return [...merged.values()];
}

function cr395TriggerTransitWindows(a,theme,window){
  const start=new Date(window.start);
  const end=cr3AddMonths(start,2);
  const totalDays=Math.max(1,Math.ceil((end-start)/86400000));
  const hits=[];
  // Tranches de dix jours : cr3SampleDates travaille alors au pas quotidien,
  // ce qui évite de confondre le début de la recherche avec le vrai pic.
  for(let offset=0;offset<totalDays;offset+=10){
    const subStart=cr3AddDays(start,offset);
    const subEnd=cr3AddDays(start,Math.min(offset+10,totalDays));
    hits.push(...cr37AllTransitWindows(a,theme,{...window,start:subStart,end:subEnd,open:false}));
  }
  return cr395MergeTriggerHits(hits);
}

function cr395AspectOrbAt(a,hit,date){
  try{
    const natal=a?.planets||{};
    const sky=planetLongitudes(date);
    if(!Number.isFinite(sky[hit.tr])||!Number.isFinite(natal[hit.na]))return null;
    const q=aspect(sky[hit.tr],natal[hit.na]);
    if(!q||q.name!==hit.name)return null;
    return q.orb;
  }catch(e){return null;}
}

function cr395IsLocalPeak(a,hit,date){
  const current=cr395AspectOrbAt(a,hit,date);
  if(!Number.isFinite(current))return false;
  const before=cr395AspectOrbAt(a,hit,cr3AddDays(date,-1));
  const after=cr395AspectOrbAt(a,hit,cr3AddDays(date,1));
  const b=Number.isFinite(before)?before:Infinity;
  const n=Number.isFinite(after)?after:Infinity;
  // Petite tolérance pour les transits très lents dont l'orbe varie peu sur 24 h.
  return current<=b+0.02&&current<=n+0.02;
}

const cr395BaseRelevantWindows=cr37RelevantWindows;
cr37RelevantWindows=function(a,theme,window,intent){
  if(!cr395IsTriggerWindow(window))return cr395BaseRelevantWindows(a,theme,window,intent);

  const all=cr395TriggerTransitWindows(a,theme,window);
  const ranked=all.map(h=>({hit:h,weight:cr37QuestionWeight(h,intent)}))
    .filter(x=>(x.weight>=5||x.hit.priority>=2))
    // Un vrai point d'activation doit correspondre à un minimum d'orbe proche,
    // pas simplement à un aspect encore actif au premier ou au dernier jour observé.
    .filter(x=>(x.hit.bestOrb??99)<=1.25&&cr395IsLocalPeak(a,x.hit,x.hit.bestDate))
    .sort((a,b)=>
      a.hit.bestDate-b.hit.bestDate ||
      b.weight-a.weight ||
      (b.hit.priority||0)-(a.hit.priority||0) ||
      (a.hit.bestOrb||99)-(b.hit.bestOrb||99)
    );

  const seen=new Set(),selected=[];
  for(const item of ranked){
    const h=item.hit;
    const key=[h.tr,h.name,h.na,+h.bestDate].join('|');
    if(seen.has(key))continue;
    seen.add(key);
    selected.push(h);
    if(selected.length>=2)break;
  }
  return selected;
};

const cr395BaseWindowsText=cr37WindowsText;
cr37WindowsText=function(a,en=false){
  if(!a||!state?.date)return '';
  const window=cr3TimingWindow(state.date,cr3ReadingMoment(),en);
  if(!cr395IsTriggerWindow(window))return cr395BaseWindowsText(a,en);
  const intent=cr33Intent(),theme=cr3DominantTheme(state.draw||[],en);
  const relevant=cr37RelevantWindows(a,theme,window,intent);
  if(!relevant.length){
    return en
      ?'No sufficiently clear question-relevant astrological peak stands out in the two months following the reading. The Trigger card therefore remains tied to a concrete event, decision or initiative rather than to an artificially fixed date.'
      :'Aucun pic astrologique suffisamment net et pertinent pour votre question ne ressort dans les deux mois suivant le tirage. La carte Déclencheur reste donc liée à un événement concret, une décision ou une initiative plutôt qu’à une date artificiellement fixée.';
  }
  return relevant.map((h,i)=>cr38PeakSentence(h,i,en)).join(' ');
};

function cr395TriggerTone(hits,en=false){
  if(!hits?.length)return '';
  const supports=hits.filter(h=>h.tone==='support').length;
  const challenges=hits.filter(h=>h.tone==='challenge').length;
  if(en){
    if(supports>challenges)return 'The next significant activations contain more openings than friction.';
    if(challenges>supports)return 'The next significant activations call more for adjustment than for effortless progress.';
    return 'The next significant activations mix openings with points of adjustment.';
  }
  if(supports>challenges)return 'Les prochains points d’activation significatifs comportent davantage d’ouvertures que de tensions.';
  if(challenges>supports)return 'Les prochains points d’activation significatifs demandent davantage d’ajustement qu’ils n’offrent de fluidité.';
  return 'Les prochains points d’activation significatifs mêlent ouvertures et ajustements.';
}

const cr395PreviousIntegratedPeriodNarrative=typeof cr33IntegratedPeriodNarrative==='function'?cr33IntegratedPeriodNarrative:null;
if(cr395PreviousIntegratedPeriodNarrative){
  cr33IntegratedPeriodNarrative=function(a,en=cr3En()){
    if(!state?.date)return cr395PreviousIntegratedPeriodNarrative(a,en);
    const window=cr3TimingWindow(state.date,cr3ReadingMoment(),en);
    if(!cr395IsTriggerWindow(window))return cr395PreviousIntegratedPeriodNarrative(a,en);

    const intent=cr33Intent(),theme=cr3DominantTheme(state.draw||[],en);
    const relevant=cr37RelevantWindows(a,theme,window,intent);
    const q=(state.question||'').trim();
    const dateName=typeof cr33CardLabel==='function'?cr33CardLabel(state.date,en):(state.date?.name||'');
    const tone=cr395TriggerTone(relevant,en);
    const intro=en
      ?`${q?`For your question “${cr3Escape(q)}”, `:''}the Timing card <b>${cr3Escape(dateName)}</b> does not set a precise date: it indicates that a concrete event must first trigger movement. Astrology therefore looks forward from the reading for the next genuinely significant activation points.${tone?` ${tone}`:''}`
      :`${q?`Pour votre question « ${cr3Escape(q)} », `:''}la carte Datation <b>${cr3Escape(dateName)}</b> ne fixe pas une date précise : elle indique qu’un événement concret doit d’abord mettre la situation en mouvement. L’astrologie recherche donc, après le tirage, les prochains points d’activation réellement significatifs.${tone?` ${tone}`:''}`;
    return `<div class="cr33-integrated cr37-integrated"><p>${intro}</p>${cr37WindowsMarkup(a,en)}</div>`;
  };
}

(function cr38Refresh(){
  const out=document.getElementById('astroResult');
  if(out&&state?.astro&&typeof formatAstroResult==='function')out.innerHTML=formatAstroResult();
  if(typeof renderSynthesis==='function')renderSynthesis();
})();
