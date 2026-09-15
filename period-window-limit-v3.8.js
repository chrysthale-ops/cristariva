/* CRISTARIVA — sélection des fenêtres astrologiques v3.8.1
   Limite le nombre de fenêtres aux plus significatives pour la question :
   1 fenêtre jusqu'à 2 semaines, 2 fenêtres jusqu'à 2 mois calendaires, 3 au-delà.
   Simplifie aussi le texte d'impact en supprimant la terminaison « en lien avec… ». */
const CRISTARIVA_PERIOD_WINDOW_LIMIT_VERSION='3.8.1';

function cr38WindowLimit(window){
  if(!window?.end)return 1;
  const days=Math.max(0,(window.end-window.start)/86400000);
  if(days<=14.5)return 1;
  // Deux mois calendaires peuvent représenter jusqu'à 62 jours.
  if(days<=62.5)return 2;
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
  if(intent?.sexual&&(['Vénus','Mars'].includes(hit.tr)||['Vénus','Mars'].includes(hit.na)))text+=' ; cette fenêtre peut donc agir sur l’attirance, le désir ou l’initiative, sans permettre de déduire le consentement d’une autre personne';
  return text;
};

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
  return unique.slice(0,limit).sort((a,b)=>a.first-b.first||a.bestDate-b.bestDate);
}

function cr38WindowHeading(count,en=false){
  if(en)return count===1?'Most significant astrological window for your question':'Most significant astrological windows for your question';
  return count===1?'Fenêtre astrologique la plus significative pour votre question':'Fenêtres astrologiques les plus significatives pour votre question';
}

function cr37WindowsText(a,en=false){
  if(!a||!state?.date)return '';
  const intent=cr33Intent(),theme=cr3DominantTheme(state.draw||[],en),window=cr3TimingWindow(state.date,cr3ReadingMoment(),en);
  const relevant=cr37RelevantWindows(a,theme,window,intent);
  if(!relevant.length){
    if(!window.end)return en?'The Timing card has no fixed endpoint, and no clearly question-relevant planetary window is identifiable at the reading date.':'La carte Datation n’ayant pas de borne finale, aucune fenêtre planétaire clairement liée à votre question n’est identifiable au moment du tirage.';
    return en?'No distinct planetary window with a sufficiently clear link to the question is detected within the Timing-card period.':'Aucune fenêtre planétaire distincte présentant un lien suffisamment net avec votre question n’est détectée à l’intérieur de la période définie par la carte Datation.';
  }
  const parts=relevant.map(h=>`${cr37WhenText(h,en)} — ${cr37AspectLabel(h,en)} : ${cr37ImpactText(h,intent,en)}`);
  if(en){
    const intro=relevant.length===1?'The most significant planetary window for your question is':'The most significant planetary windows for your question are';
    return `${intro}: ${parts.join('; ')}.`;
  }
  const intro=relevant.length===1?'La fenêtre astrologique la plus significative par rapport à votre question est':'Les fenêtres astrologiques les plus significatives par rapport à votre question sont';
  return `${intro} : ${parts.join(' ; ')}.`;
}

function cr37WindowsMarkup(a,en=false){
  if(!a||!state?.date)return '';
  const intent=cr33Intent(),theme=cr3DominantTheme(state.draw||[],en),window=cr3TimingWindow(state.date,cr3ReadingMoment(),en);
  const relevant=cr37RelevantWindows(a,theme,window,intent);
  if(!relevant.length)return `<p class="cr37-none"><b>${en?'Relevant planetary windows':'Fenêtres astrologiques liées à la question'}</b> — ${cr37WindowsText(a,en)}</p>`;
  const items=relevant.map(h=>`<li><b>${cr3Escape(cr37WhenText(h,en))}</b> — <strong>${cr3Escape(cr37AspectLabel(h,en))}</strong> : ${cr3Escape(cr37ImpactText(h,intent,en))}.</li>`).join('');
  return `<div class="cr37-windows"><p><b>${cr38WindowHeading(relevant.length,en)}</b></p><ul>${items}</ul></div>`;
}

(function cr38Refresh(){
  const out=document.getElementById('astroResult');
  if(out&&state?.astro&&typeof formatAstroResult==='function')out.innerHTML=formatAstroResult();
  if(typeof renderSynthesis==='function')renderSynthesis();
})();
