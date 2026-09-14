/* CRISTARIVA — lecture globale de la période astrologique v3.2
   Remplace la liste détaillée des transits par une synthèse continue,
   centrée sur la question posée et les points réellement marquants. */
const CRISTARIVA_PERIOD_OVERVIEW_VERSION='3.2';

function cr32QuestionContext(en=cr3En()){
  const q=(state.question||'').trim();
  const domain=state.domain||'';
  const theme=cr3DominantTheme(state.draw||[],en);
  const domainLabel=en?({'Relations':'relationships','Professionnelle / Projet':'work or project matters','Général / spirituel':'the general or spiritual dimension'}[domain]||'the question asked'):domain;
  return {q,domain,domainLabel,theme};
}

function cr32AreaForHit(hit,en=cr3En()){
  const tr=hit.tr,na=hit.na;
  const trArea={
    Jupiter:en?'growth, confidence and widening possibilities':'expansion, confiance et ouverture des possibilités',
    Saturne:en?'structure, limits and long-term decisions':'structure, limites et décisions qui engagent dans la durée',
    Uranus:en?'change, freedom and the need to break old patterns':'changement, liberté et besoin de sortir d’anciens schémas',
    Neptune:en?'intuition, ideals and the need to distinguish inspiration from projection':'intuition, idéal et nécessité de distinguer inspiration et projection',
    Mars:en?'initiative, desire and the way action is taken':'initiative, désir et manière de passer à l’action',
    'Vénus':en?'bonds, attraction, values and relational harmony':'liens, attirance, valeurs et harmonie relationnelle'
  }[tr]||tr;
  const natalArea={
    Soleil:en?'identity and personal direction':'identité et direction personnelle',
    Lune:en?'emotional security and inner reactions':'sécurité émotionnelle et réactions intérieures',
    Mercure:en?'thinking, communication and decisions':'pensée, communication et décisions',
    'Vénus':en?'attachment, affection and values':'attachement, affectivité et valeurs',
    Mars:en?'will, desire and capacity to act':'volonté, désir et capacité d’action'
  }[na]||na;
  return {trArea,natalArea};
}

function cr32HitSentence(hit,en=cr3En()){
  const {trArea,natalArea}=cr32AreaForHit(hit,en);
  if(en){
    if(hit.tone==='support')return `${trArea} can work constructively with ${natalArea}`;
    if(hit.tone==='challenge')return `${trArea} puts pressure on ${natalArea} and calls for adjustment`;
    return `${trArea} strongly activates ${natalArea}`;
  }
  if(hit.tone==='support')return `${trArea} peut soutenir de manière constructive ${natalArea}`;
  if(hit.tone==='challenge')return `${trArea} met ${natalArea} sous tension et demande un ajustement`;
  return `${trArea} active fortement ${natalArea}`;
}

function cr32DurationDays(hit){return Math.max(0,(hit.last-hit.first)/86400000);}
function cr32SelectHighlights(hits){
  if(!hits?.length)return [];
  const sorted=[...hits].sort((a,b)=>{
    const long=cr32DurationDays(b)-cr32DurationDays(a);
    if(Math.abs(long)>7)return long;
    return (b.priority||0)-(a.priority||0)||(a.bestOrb||99)-(b.bestOrb||99);
  });
  const out=[];
  const used=new Set();
  for(const h of sorted){
    const key=h.tr+'|'+h.na+'|'+h.tone;
    if(used.has(key))continue;
    used.add(key);out.push(h);
    if(out.length>=3)break;
  }
  return out;
}

function cr32GeneralTone(period,en=cr3En()){
  const hits=period.hits||[];
  const support=hits.filter(h=>h.tone==='support').length;
  const challenge=hits.filter(h=>h.tone==='challenge').length;
  if(en){
    if(challenge>support+1)return 'This is primarily a period of adjustment and repositioning rather than effortless continuity.';
    if(support>challenge+1)return 'The period contains more openings and supportive currents than major points of friction.';
    return 'The period mixes openings with adjustment points: progress is possible, but it is unlikely to be completely linear.';
  }
  if(challenge>support+1)return 'L’ensemble décrit surtout une période de réajustement et de repositionnement plutôt qu’une évolution parfaitement fluide.';
  if(support>challenge+1)return 'L’ensemble fait apparaître davantage d’ouvertures et de courants favorables que de tensions majeures.';
  return 'La période mêle ouvertures et ajustements : une évolution est possible, mais elle ne semble pas devoir être parfaitement linéaire.';
}

function cr32QuestionLink(ctx,en=cr3En()){
  const q=ctx.q?`« ${cr3Escape(ctx.q)} »`:'';
  if(en){
    if(ctx.domain==='Relations')return `For the relationship question ${q}, the important point is less to predict a single event than to see how feelings, freedom, expectations and the capacity to act evolve together.`;
    if(ctx.domain==='Professionnelle / Projet')return `For the work/project question ${q}, the period mainly tests how ambition, adaptation, decisions and concrete action can be brought into alignment.`;
    return `For the question ${q}, these movements describe the background climate in which choices, perceptions and developments are likely to unfold.`;
  }
  if(ctx.domain==='Relations')return `Pour la question relationnelle ${q}, l’enjeu principal n’est pas de prédire un événement isolé, mais de voir comment évoluent ensemble les sentiments, le besoin de liberté, les attentes et la capacité à agir.`;
  if(ctx.domain==='Professionnelle / Projet')return `Pour la question professionnelle ou de projet ${q}, la période met surtout à l’épreuve la manière d’accorder ambition, adaptation, décisions et passage concret à l’action.`;
  return `Pour la question ${q}, ces mouvements décrivent le climat de fond dans lequel les choix, les perceptions et les évolutions peuvent se déployer.`;
}

function cr32HighlightParagraph(highlights,en=cr3En()){
  if(!highlights.length)return en?'No single major transit dominates the interval strongly enough to justify isolating it.':'Aucun transit majeur ne domine suffisamment la période pour justifier de l’isoler.';
  const parts=highlights.map((h,i)=>{
    const when=cr3RangeLabel(h,en);
    const sentence=cr32HitSentence(h,en);
    const label=`${cr3Planet(h.tr,en)} ${cr3Aspect(h.name,en)} ${cr3Planet(h.na,en)}`;
    if(en)return `<b>${cr3Escape(label)}</b> (${cr3Escape(when)}): ${sentence}`;
    return `<b>${cr3Escape(label)}</b> (${cr3Escape(when)}) : ${sentence}`;
  });
  if(en)return `The most significant background influences are ${parts.join('; ')}. These are the markers that most colour the whole period; the other detected transits are treated as secondary nuances.`;
  return `Les influences de fond les plus marquantes sont ${parts.join(' ; ')}. Ce sont elles qui colorent le plus l’ensemble de la période ; les autres transits détectés restent intégrés comme nuances secondaires.`;
}

function cr32PeriodNarrative(a,theme,window,en=cr3En()){
  const period=cr3PeriodSummary(a,theme,window,en);
  const ctx=cr32QuestionContext(en);
  const highlights=cr32SelectHighlights(period.hits);
  if(!state.date)return `<div class="cr3-empty">${en?'Draw a Timing card above; this second section will then analyse the whole corresponding period.':'Tirez une carte Datation ci-dessus : cette seconde partie analysera alors toute la période correspondante.'}</div>`;
  if(!period.hits.length)return `<div class="cr32-overview"><p><b>${en?'Overall climate':'Climat général'}</b> — ${period.text}</p><p>${cr32QuestionLink(ctx,en)}</p></div>`;
  return `<div class="cr32-overview">
    <p><b>${en?'Overall climate':'Climat général'}</b> — ${cr32GeneralTone(period,en)}</p>
    <p>${cr32QuestionLink(ctx,en)}</p>
    <p><b>${en?'Key influences':'Points marquants'}</b> — ${cr32HighlightParagraph(highlights,en)}</p>
    <p><b>${en?'Reading of the whole period':'Lecture de l’ensemble de la période'}</b> — ${en?'The astrology therefore describes a sequence rather than a succession of isolated predictions: the long transits establish the background, while the faster planets temporarily activate emotional, relational or action-oriented points. The answer to the question should be read through this overall movement, together with the cards drawn.':'L’astrologie décrit donc ici une dynamique d’ensemble plutôt qu’une succession de prédictions isolées : les transits lents installent le climat de fond, tandis que les planètes plus rapides activent ponctuellement des enjeux émotionnels, relationnels ou liés à l’action. La réponse à la question doit se lire à travers ce mouvement global, en lien avec les cartes tirées.'}</p>
  </div>`;
}

const cr32OriginalAstroMarkup=cr3AstroMarkup;
cr3AstroMarkup=function(a){
  const html=cr32OriginalAstroMarkup(a);
  if(!a)return html;
  const tpl=document.createElement('template');tpl.innerHTML=html;
  const parts=tpl.content.querySelectorAll('.cr3-astro-part');
  const second=parts[1];
  if(second){
    const en=cr3En(),window=cr3TimingWindow(state.date,cr3ReadingMoment(),en),theme=cr3DominantTheme(state.draw||[],en);
    second.innerHTML=`<div class="cr3-kicker">${en?'2 · Planetary influences during the reading period':'2 · Position des astres et influences sur la période du tirage'}</div><h4>${en?'Overall astrological climate until the Timing-card horizon':'Vision astrologique d’ensemble jusqu’à l’horizon de la carte Datation'}</h4><p class="cr3-period-label">${cr3Escape(window.label)}</p>${cr32PeriodNarrative(a,theme,window,en)}`;
  }
  return tpl.innerHTML;
};
formatAstroResult=function(){return state.astro?cr3AstroMarkup(state.astro):'';};

(function cr32Refresh(){
  const style=document.createElement('style');
  style.textContent=`.cr32-overview{line-height:1.72}.cr32-overview p{margin:.8rem 0}.cr32-overview b{color:#6b4b1f}`;
  document.head.appendChild(style);
  const out=document.getElementById('astroResult');
  if(out&&state.astro)out.innerHTML=formatAstroResult();
  if(typeof renderSynthesis==='function')renderSynthesis();
})();
