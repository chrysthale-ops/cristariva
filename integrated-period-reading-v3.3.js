/* CRISTARIVA — lecture intégrée et synthèse générale v3.6 */
const CRISTARIVA_INTEGRATED_PERIOD_VERSION='3.6';

function cr33CardLabel(card,en=cr3En()){
  if(!card)return '';
  try{return typeof cardName==='function'?cardName(card):(en?(card.en?.name||card.name):card.name);}catch(e){return card.name||'';}
}
function cr33RelationText(en=cr3En()){
  const card=state.relation;if(!card)return '';
  try{
    if(en&&typeof RELATION_SYNTHESIS_EN!=='undefined'&&RELATION_SYNTHESIS_EN[card.id])return RELATION_SYNTHESIS_EN[card.id];
    if(!en&&typeof RELATION_SYNTHESIS_FR!=='undefined'&&RELATION_SYNTHESIS_FR[card.id])return RELATION_SYNTHESIS_FR[card.id];
  }catch(e){}
  return en?(card.en?.definition||card.definition||''):(card.definition||'');
}
function cr33DateText(en=cr3En()){
  const card=state.date;if(!card)return '';
  try{
    if(en&&typeof DATING_SYNTHESIS_EN!=='undefined'&&DATING_SYNTHESIS_EN[card.id])return DATING_SYNTHESIS_EN[card.id];
    if(!en&&typeof DATING_SYNTHESIS_FR!=='undefined'&&DATING_SYNTHESIS_FR[card.id])return DATING_SYNTHESIS_FR[card.id];
  }catch(e){}
  return en?(card.en?.definition||card.definition||''):(card.definition||'');
}
function cr33Intent(){
  const q=(state.question||'').toLowerCase(),d=(state.domain||'').toLowerCase(),relationId=Number(state.relation?.id||0);
  return {
    sexual:/sex|sexuel|sexuelle|sexual|intimit|coucher|physique|désir|desir|passion/.test(q),
    newPerson:/nouvel|nouveau|nouvelle|inconnu|rencontr|personne nouvelle|someone new|new person|stranger|meet/.test(q)||[100,106].includes(relationId),
    past:/ex\b|ancien|ancienne|retour|revenir|revient|reprise|past|former|return/.test(q)||[102,112].includes(relationId),
    couple:/couple|partenaire|relation amoureuse|amour|sentimental|romant|partner|relationship|love/.test(q)||d.includes('relation'),
    work:/profession|travail|emploi|projet|carri|business|work|job|career/.test(q)||d.includes('profession'),
    spiritual:/spirit|éveil|eveil|intuition|chemin|sens de ma vie|spiritual/.test(q)||d.includes('spirit'),
    relationId
  };
}
function cr33HitScore(hit,intent){
  let score=hit.tone==='support'?12:hit.tone==='intensify'?5:-4;
  score+=(hit.priority||0)*1.5+Math.max(0,6-(hit.bestOrb||6));
  const tr=hit.tr,na=hit.na;
  if(intent.sexual){if(tr==='Vénus'||tr==='Mars')score+=12;if(na==='Vénus'||na==='Mars')score+=8;}
  if(intent.newPerson){if(tr==='Uranus'||tr==='Jupiter'||tr==='Vénus')score+=7;if(na==='Vénus'||na==='Soleil')score+=4;}
  if(intent.past){if(tr==='Saturne'||tr==='Vénus')score+=6;if(na==='Vénus'||na==='Lune')score+=5;}
  if(intent.work){if(tr==='Jupiter'||tr==='Saturne'||tr==='Mars')score+=7;if(na==='Soleil'||na==='Mercure'||na==='Mars')score+=4;}
  if(intent.spiritual){if(tr==='Neptune'||tr==='Uranus'||tr==='Jupiter')score+=6;if(na==='Lune'||na==='Soleil')score+=4;}
  const days=Math.max(0,(hit.last-hit.first)/86400000);if(days>150)score-=4;if(days>=2&&days<=75)score+=3;
  return score;
}
function cr33BestWindow(period,intent){
  const hits=(period?.hits||[]).filter(h=>h.tone!=='challenge');
  return hits.length?[...hits].sort((a,b)=>cr33HitScore(b,intent)-cr33HitScore(a,intent))[0]:null;
}
function cr33WindowText(hit,en=cr3En()){
  if(!hit)return '';
  const days=Math.abs((hit.last-hit.first)/86400000);
  if(days<1.2)return en?`around ${cr3Date(hit.bestDate,true)}`:`autour du ${cr3Date(hit.bestDate)}`;
  return en?`between ${cr3Date(hit.first,true)} and ${cr3Date(hit.last,true)}`:`entre le ${cr3Date(hit.first)} et le ${cr3Date(hit.last)}`;
}
function cr33ExpectedDevelopment(intent,en=cr3En()){
  const id=intent.relationId;
  if(en){
    if(intent.sexual&&[100,106].includes(id))return 'a new encounter with someone not yet clearly identified, with a stronger possibility of physical or sexual closeness';
    if(intent.sexual&&id===109)return 'a physical or sexual rapprochement with someone toward whom attraction is already present';
    if(intent.sexual&&[102,112].includes(id))return 'renewed physical intimacy with a person or bond from the past';
    if(intent.sexual)return 'a physical or sexual rapprochement';
    if([100,106].includes(id))return 'the arrival of a new person and the beginning of a bond that can become more concrete';
    if([102,112].includes(id))return 'a return, renewed contact or new development involving a past bond';
    if(id===109)return 'an attraction becoming more concrete';
    if(id===98)return 'a clearer development in an existing or potential partnership';
    if(intent.work)return 'a concrete opening, contact, decision or step forward connected with the professional question';
    if(intent.spiritual)return 'a period of clearer perception, inner movement or meaningful change';
    return 'a more concrete development in the situation asked about';
  }
  if(intent.sexual&&[100,106].includes(id))return 'une rencontre avec une personne encore inconnue ou nouvellement entrée dans votre vie, avec une possibilité plus marquée de rapprochement physique ou sexuel';
  if(intent.sexual&&id===109)return 'un rapprochement physique ou sexuel avec une personne pour laquelle une attirance existe déjà';
  if(intent.sexual&&[102,112].includes(id))return 'une reprise d’intimité physique avec une personne ou un lien appartenant au passé';
  if(intent.sexual)return 'un rapprochement physique ou sexuel';
  if([100,106].includes(id))return 'l’entrée d’une personne nouvelle dans votre vie et le début d’un lien susceptible de devenir plus concret';
  if([102,112].includes(id))return 'un retour, une reprise de contact ou une nouvelle évolution concernant un lien du passé';
  if(id===109)return 'une attirance qui peut devenir plus concrète';
  if(id===98)return 'une évolution plus nette d’un partenariat existant ou potentiel';
  if(intent.work)return 'une ouverture concrète, un contact, une décision ou une avancée en rapport avec la question professionnelle';
  if(intent.spiritual)return 'une phase de compréhension plus claire, de mouvement intérieur ou de changement porteur de sens';
  return 'une évolution plus concrète de la situation sur laquelle porte votre question';
}
function cr33OverallTone(period,intent,en=cr3En()){
  const hits=period?.hits||[],supports=hits.filter(h=>h.tone==='support').length,challenges=hits.filter(h=>h.tone==='challenge').length;
  // Ne pas ajouter de phrase générique quand les indications sont équilibrées.
  // Le texte doit alors aller directement vers le ou les moments astrologiques réellement significatifs.
  if(supports>=2&&supports>=challenges+2){
    return en
      ?'Several supportive aspects reinforce the possibility of movement during this period.'
      :'Plusieurs aspects favorables se renforcent au cours de cette période.';
  }
  if(challenges>=2&&challenges>=supports+2){
    return en
      ?'Several demanding aspects make timing and circumstances especially important during this period.'
      :'Plusieurs aspects plus exigeants rendent le choix du moment et les circonstances particulièrement importants.';
  }
  return '';
}
function cr33IntegratedPeriodNarrative(a,en=cr3En()){
  if(!state.date)return `<div class="cr3-empty">${en?'Draw a Timing card to define the period covered by this reading.':'Tirez une carte Datation afin de définir la période couverte par cette lecture.'}</div>`;
  if(!state.relation)return `<div class="cr3-empty">${en?'Draw a Relationship card so this reading can connect the question, the bond involved and the timing.':'Tirez une carte Relation afin que cette lecture puisse relier la question, le type de lien concerné et la datation.'}</div>`;
  const intent=cr33Intent(),theme=cr3DominantTheme(state.draw||[],en),window=cr3TimingWindow(state.date,cr3ReadingMoment(),en),period=cr3PeriodSummary(a,theme,window,en),best=cr33BestWindow(period,intent);
  const q=(state.question||'').trim(),domain=en?((typeof DOMAIN_EN!=='undefined'&&DOMAIN_EN[state.domain])||state.domain):state.domain;
  const relName=cr33CardLabel(state.relation,en),dateName=cr33CardLabel(state.date,en),relMeaning=cr33RelationText(en),development=cr33ExpectedDevelopment(intent,en),overall=cr33OverallTone(period,intent,en);
  if(en){
    return `<div class="cr33-integrated"><p>${q?`For your question “${cr3Escape(q)}”, in the ${cr3Escape(domain)} area, `:''}the Relationship card <b>${cr3Escape(relName)}</b> points toward ${cr3Escape(relMeaning)}. The Timing card <b>${cr3Escape(dateName)}</b> defines the period considered. ${overall} ${best?`Within it, <b>${cr3Escape(cr33WindowText(best,true))}</b> stands out as a more receptive window for ${cr3Escape(development)}.`:'No single window stands out strongly enough to isolate a precise opportunity.'}</p></div>`;
  }
  return `<div class="cr33-integrated"><p>${q?`Pour votre question « ${cr3Escape(q)} », dans le domaine <b>${cr3Escape(domain)}</b>, `:''}la carte Relation <b>${cr3Escape(relName)}</b> oriente la lecture vers ${cr3Escape(relMeaning)}. La carte Datation <b>${cr3Escape(dateName)}</b> définit la période prise en compte. ${overall} ${best?`À l’intérieur de celle-ci, <b>${cr3Escape(cr33WindowText(best,false))}</b> ressort comme un passage plus réceptif pour ${cr3Escape(development)}.`:'Aucun créneau unique ne ressort suffisamment pour isoler une échéance précise.'}</p></div>`;
}

cr32PeriodNarrative=function(a,theme,window,en=cr3En()){return cr33IntegratedPeriodNarrative(a,en);};
const cr33PreviousAstroMarkup=cr3AstroMarkup;
cr3AstroMarkup=function(a){
  const html=cr33PreviousAstroMarkup(a);if(!a)return html;
  const tpl=document.createElement('template');tpl.innerHTML=html;
  const parts=tpl.content.querySelectorAll('.cr3-astro-part'),second=parts[1];
  if(second){const en=cr3En();second.innerHTML=`<div class="cr3-kicker">${en?'2 · Reading-period outlook':'2 · Évolution sur la période du tirage'}</div><h4>${en?'What the period suggests for your question':'Ce que la période suggère pour votre question'}</h4>${cr33IntegratedPeriodNarrative(a,en)}`;}
  tpl.content.querySelectorAll('.cr3-method').forEach(n=>n.remove());
  return tpl.innerHTML;
};
formatAstroResult=function(){return state.astro?cr3AstroMarkup(state.astro):'';};

function cr33GlobalSynthesis(a){
  const en=cr3En(),cards=state.draw||[];if(!cards.length)return '';
  const q=(state.question||'').trim(),domain=en?((typeof DOMAIN_EN!=='undefined'&&DOMAIN_EN[state.domain])||state.domain):state.domain;
  let theme='';try{theme=cr3DominantTheme(cards,en)?.label||'';}catch(e){}
  let relation='';try{if(state.relation)relation=cr33RelationText(en);}catch(e){}
  let personality='';
  if(a&&typeof cr34BigThree==='function'&&typeof cr34SignProfile==='function'){
    try{
      const big=cr34BigThree(a,false),sun=big.sun?cr34SignProfile(big.sun):null,moon=big.moon?cr34SignProfile(big.moon):null;
      if(en)personality='Your personality profile shows that your own way of feeling, deciding and reacting strongly colours how you experience this situation.';
      else personality=`Votre tempérament ${sun?.core||'personnel'} et votre sensibilité ${moon?.emotion||'profonde'} influencent directement votre manière de vivre cette situation et les choix que vous êtes susceptible de faire.`;
      if(typeof cr34SpecialFeatures==='function'&&cr34SpecialFeatures(a)?.length)personality+=en?' A marked feature of your birth chart reinforces this tendency.':' Une particularité marquée de votre thème renforce encore cette tendance.';
    }catch(e){}
  }
  let timing='';
  if(a&&state.date){
    try{
      const intent=cr33Intent(),t=cr3DominantTheme(cards,en),window=cr3TimingWindow(state.date,cr3ReadingMoment(),en),period=cr3PeriodSummary(a,t,window,en),best=cr33BestWindow(period,intent);
      timing=cr33OverallTone(period,intent,en);
      if(best)timing+=` ${en?'A particularly receptive phase appears':'Un passage particulièrement réceptif ressort'} ${cr33WindowText(best,en)} ${en?'for':'pour'} ${cr33ExpectedDevelopment(intent,en)}.`;
    }catch(e){}
  }
  let text='';
  if(en){
    text=`${q?`For your question “${cr3Escape(q)}” in the ${cr3Escape(domain)} area, `:`For this ${cr3Escape(domain)} question, `}${theme?`the reading points mainly toward ${cr3Escape(theme)}. `:''}${relation?`The relationship dimension gives this movement a more concrete direction toward ${cr3Escape(relation)}. `:''}${personality} ${timing} Taken together, the three analyses form one coherent answer: the direction suggested by the cards, your personal way of experiencing the situation and the more receptive moments of the period reinforce or temper one another. The conclusion is therefore an overall tendency, not a repetition of the three readings.`;
  }else{
    text=`${q?`Pour votre question « ${cr3Escape(q)} », dans le domaine ${cr3Escape(domain)}, `:`Pour cette question relevant du domaine ${cr3Escape(domain)}, `}${theme?`le tirage oriente principalement l’histoire vers ${cr3Escape(theme)}. `:''}${relation?`La dimension relationnelle donne à cette évolution une direction plus concrète autour de ${cr3Escape(relation)}. `:''}${personality} ${timing} Pris ensemble, les trois éclairages forment une seule réponse cohérente : la direction indiquée par les cartes, votre manière personnelle de vivre la situation et les moments les plus réceptifs de la période se renforcent ou se tempèrent mutuellement. La conclusion porte donc sur la tendance d’ensemble, et non sur la répétition des trois lectures.`;
  }
  return `<div class="story-reading cr3-global" data-astro-engine="${CRISTARIVA_INTEGRATED_PERIOD_VERSION}"><h3>${en?'Cristariva — overall conclusion':'CRISTARIVA — synthèse générale'}</h3><p>${text.replace(/\s+/g,' ').trim()}</p></div>`;
}
cr3Synthesis=function(a){return cr33GlobalSynthesis(a);};
renderSynthesis=function(){
  if(!state.draw?.length)return;
  const box=document.getElementById('synthesis');if(box)box.innerHTML=cr33GlobalSynthesis(state.astro||null);
};

(function cr33Refresh(){
  const style=document.createElement('style');
  style.textContent=`.cr33-integrated p{font-size:1rem;line-height:1.82;margin:.7rem 0}.cr33-integrated b{color:#6b4b1f}.cr3-global>p{font-size:1.02rem;line-height:1.82;margin-bottom:0}`;
  document.head.appendChild(style);
  const out=document.getElementById('astroResult');if(out&&state.astro)out.innerHTML=formatAstroResult();
  if(typeof renderSynthesis==='function')renderSynthesis();
})();