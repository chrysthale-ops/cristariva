/* CRISTARIVA — sélection et récit des pics astrologiques v3.9
   Présente les transits comme un récit court et fluide :
   1 pic jusqu'à 2 semaines, 2 pics maximum jusqu'à 3 mois, 3 au-delà.
   Ne montre plus les longues fenêtres : seules les dates de pic sont signalées.
   Diversifie les influences retenues pour éviter les répétitions d'une même planète.
   Conserve aussi le texte d'impact concis et l'ouverture spirituelle sans phrase générique. */
const CRISTARIVA_PERIOD_WINDOW_LIMIT_VERSION='3.9';

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

(function cr38Refresh(){
  const out=document.getElementById('astroResult');
  if(out&&state?.astro&&typeof formatAstroResult==='function')out.innerHTML=formatAstroResult();
  if(typeof renderSynthesis==='function')renderSynthesis();
})();
