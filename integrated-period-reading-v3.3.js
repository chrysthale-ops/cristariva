/* CRISTARIVA — lecture intégrée de la période v3.3
   Les calculs astrologiques restent entièrement en arrière-plan.
   Le consultant reçoit un texte unique qui croise la question, le domaine,
   la carte Relation, la carte Datation et le climat calculé sur la période. */
const CRISTARIVA_INTEGRATED_PERIOD_VERSION='3.3';

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
  const q=(state.question||'').toLowerCase();
  const d=(state.domain||'').toLowerCase();
  const relationId=Number(state.relation?.id||0);
  const sexual=/sex|sexuel|sexuelle|sexual|intimit|coucher|physique|désir|desir|passion/.test(q);
  const newPerson=/nouvel|nouveau|nouvelle|inconnu|rencontr|personne nouvelle|someone new|new person|stranger|meet/.test(q)||[100,106].includes(relationId);
  const past=/ex\b|ancien|ancienne|retour|revenir|revient|reprise|past|former|return/.test(q)||[102,112].includes(relationId);
  const couple=/couple|partenaire|relation amoureuse|amour|sentimental|romant|partner|relationship|love/.test(q)||d.includes('relation');
  const work=/profession|travail|emploi|projet|carri|business|work|job|career/.test(q)||d.includes('profession');
  const spiritual=/spirit|éveil|eveil|intuition|chemin|sens de ma vie|spiritual/.test(q)||d.includes('spirit');
  return {sexual,newPerson,past,couple,work,spiritual,relationId};
}

function cr33HitScore(hit,intent){
  let score=0;
  if(hit.tone==='support')score+=12;
  else if(hit.tone==='intensify')score+=5;
  else score-=4;
  score+=(hit.priority||0)*1.5;
  score+=Math.max(0,6-(hit.bestOrb||6));
  const tr=hit.tr,na=hit.na;
  if(intent.sexual){if(tr==='Vénus'||tr==='Mars')score+=12;if(na==='Vénus'||na==='Mars')score+=8;}
  if(intent.newPerson){if(tr==='Uranus'||tr==='Jupiter'||tr==='Vénus')score+=7;if(na==='Vénus'||na==='Soleil')score+=4;}
  if(intent.past){if(tr==='Saturne'||tr==='Vénus')score+=6;if(na==='Vénus'||na==='Lune')score+=5;}
  if(intent.work){if(tr==='Jupiter'||tr==='Saturne'||tr==='Mars')score+=7;if(na==='Soleil'||na==='Mercure'||na==='Mars')score+=4;}
  if(intent.spiritual){if(tr==='Neptune'||tr==='Uranus'||tr==='Jupiter')score+=6;if(na==='Lune'||na==='Soleil')score+=4;}
  const days=Math.max(0,(hit.last-hit.first)/86400000);
  if(days>150)score-=4;
  if(days>=2&&days<=75)score+=3;
  return score;
}
function cr33BestWindow(period,intent){
  const hits=(period?.hits||[]).filter(h=>h.tone!=='challenge');
  if(!hits.length)return null;
  return [...hits].sort((a,b)=>cr33HitScore(b,intent)-cr33HitScore(a,intent))[0]||null;
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
  const hits=period?.hits||[];
  const supports=hits.filter(h=>h.tone==='support').length;
  const challenges=hits.filter(h=>h.tone==='challenge').length;
  if(en){
    if(supports>challenges)return 'The period is not uniformly favourable, but it contains genuine openings that can make the situation easier to move forward.';
    if(challenges>supports+1)return 'The period looks more selective and uneven: progress is possible, but it is likely to depend on timing, clarity and the right circumstances.';
    return 'The period alternates between openings and moments of adjustment, so the situation is more likely to develop in stages than all at once.';
  }
  if(supports>challenges)return 'La période n’est pas uniformément favorable, mais elle comporte de véritables ouvertures susceptibles de faciliter une évolution de la situation.';
  if(challenges>supports+1)return 'La période paraît plus sélective et irrégulière : une évolution reste possible, mais elle dépend davantage du bon moment, de la clarté de la situation et des circonstances.';
  return 'La période alterne ouvertures et moments d’ajustement : la situation paraît donc davantage susceptible d’évoluer par étapes que d’un seul mouvement.';
}

function cr33IntegratedPeriodNarrative(a,en=cr3En()){
  if(!state.date)return `<div class="cr3-empty">${en?'Draw a Timing card to define the period covered by this reading.':'Tirez une carte Datation afin de définir la période couverte par cette lecture.'}</div>`;
  if(!state.relation)return `<div class="cr3-empty">${en?'Draw a Relationship card so this reading can connect the question, the person or type of bond involved, and the timing.':'Tirez une carte Relation afin que cette lecture puisse relier la question, la personne ou le type de lien concerné et la datation.'}</div>`;

  const intent=cr33Intent();
  const theme=cr3DominantTheme(state.draw||[],en);
  const window=cr3TimingWindow(state.date,cr3ReadingMoment(),en);
  const period=cr3PeriodSummary(a,theme,window,en);
  const best=cr33BestWindow(period,intent);
  const q=(state.question||'').trim();
  const domain=en?((typeof DOMAIN_EN!=='undefined'&&DOMAIN_EN[state.domain])||state.domain):state.domain;
  const relName=cr33CardLabel(state.relation,en),dateName=cr33CardLabel(state.date,en);
  const relMeaning=cr33RelationText(en),development=cr33ExpectedDevelopment(intent,en);
  const timing=best?cr33WindowText(best,en):'';
  const overall=cr33OverallTone(period,intent,en);

  if(en){
    const opening=q?`For your question “${cr3Escape(q)}”, in the ${cr3Escape(domain)} area,`:`For this question, in the ${cr3Escape(domain)} area,`;
    const relation=`the Relationship card <b>${cr3Escape(relName)}</b> points toward ${cr3Escape(relMeaning)}.`;
    const date=`The Timing card <b>${cr3Escape(dateName)}</b> sets the observation period ${window.end?`from ${cr3Date(window.start,true)} to ${cr3Date(window.end,true)}`:cr33DateText(true)}.`;
    const opportunity=best?`Within that interval, <b>${cr3Escape(timing)}</b> stands out as the most receptive window for ${cr3Escape(development)}.`:`No single window stands out strongly enough to isolate a precise opportunity; the situation is better read across the period as a whole.`;
    return `<div class="cr33-integrated"><p>${opening} ${relation} ${date} ${overall} ${opportunity} This is the point at which the different parts of the reading converge most clearly; it describes a more favourable symbolic window rather than a guaranteed event.</p></div>`;
  }

  const opening=q?`Pour votre question « ${cr3Escape(q)} », dans le domaine <b>${cr3Escape(domain)}</b>,`:`Pour cette question, dans le domaine <b>${cr3Escape(domain)}</b>,`;
  const relation=`la carte Relation <b>${cr3Escape(relName)}</b> oriente la lecture vers ${cr3Escape(relMeaning)}.`;
  const date=`La carte Datation <b>${cr3Escape(dateName)}</b> fixe ici la période d’observation ${window.end?`du ${cr3Date(window.start)} au ${cr3Date(window.end)}`:cr33DateText(false)}.`;
  const opportunity=best?`À l’intérieur de cette période, <b>${cr3Escape(timing)}</b> ressort comme le créneau le plus réceptif pour ${cr3Escape(development)}.`:`Aucun créneau unique ne ressort suffisamment pour isoler une échéance précise ; la situation se lit plutôt sur l’ensemble de la période.`;
  return `<div class="cr33-integrated"><p>${opening} ${relation} ${date} ${overall} ${opportunity} C’est à ce moment que les différents éléments de la lecture convergent le plus nettement ; il s’agit d’une fenêtre symboliquement plus favorable, et non de la garantie qu’un événement se produira.</p></div>`;
}

/* Remplace la narration v3.2 : aucun transit, planète, aspect ou jargon technique n’est affiché. */
cr32PeriodNarrative=function(a,theme,window,en=cr3En()){
  return cr33IntegratedPeriodNarrative(a,en);
};

/* Nettoie aussi les intitulés et la note méthodologique de la section visible. */
const cr33PreviousAstroMarkup=cr3AstroMarkup;
cr3AstroMarkup=function(a){
  const html=cr33PreviousAstroMarkup(a);
  if(!a)return html;
  const tpl=document.createElement('template');tpl.innerHTML=html;
  const parts=tpl.content.querySelectorAll('.cr3-astro-part');
  const second=parts[1];
  if(second){
    const en=cr3En();
    second.innerHTML=`<div class="cr3-kicker">${en?'2 · Reading-period outlook':'2 · Évolution sur la période du tirage'}</div><h4>${en?'What the period suggests for your question':'Ce que la période suggère pour votre question'}</h4>${cr33IntegratedPeriodNarrative(a,en)}`;
  }
  tpl.content.querySelectorAll('.cr3-method').forEach(n=>n.remove());
  return tpl.innerHTML;
};
formatAstroResult=function(){return state.astro?cr3AstroMarkup(state.astro):'';};

/* Synthèse générale : conserve le récit des cartes et le thème natal, mais remplace
   toute exposition technique de l’évolution planétaire par le même texte intégré. */
function cr33GlobalSynthesis(a){
  const en=cr3En(),cards=state.draw||[];
  if(!cards.length)return '';
  const question=cr3Escape(state.question||(en?'Open question':'Question ouverte'));
  const domain=cr3Escape(en?((typeof DOMAIN_EN!=='undefined'&&DOMAIN_EN[state.domain])||state.domain):state.domain);
  const first=cards[0],last=cards[cards.length-1];
  const firstName=cr33CardLabel(first,en),lastName=cr33CardLabel(last,en);
  const firstRead=typeof cr3CardReading==='function'?cr3CardReading(first,en):'';
  const lastRead=cards.length>1&&typeof cr3CardReading==='function'?cr3CardReading(last,en):'';
  let html=`<div class="story-reading cr3-global" data-astro-engine="${CRISTARIVA_INTEGRATED_PERIOD_VERSION}"><h3>${en?'Cristariva — global synthesis':'CRISTARIVA — synthèse générale'}</h3><div class="reading-context"><b>${en?'Question':'Question'} :</b> « ${question} »<br><b>${en?'Area':'Domaine'} :</b> ${domain}</div>`;
  html+=`<h4>${en?'What the cards are telling':'Ce que racontent les cartes'}</h4><p>${en?'The reading begins with':'Le récit s’ouvre avec'} <b>${cr3Escape(firstName)}</b>${firstRead?` : ${cr3Escape(firstRead)}`:''}${cards.length>1?` ${en?'and develops toward':'et évolue vers'} <b>${cr3Escape(lastName)}</b>${lastRead?` : ${cr3Escape(lastRead)}`:''}`:''}</p>`;
  if(a){
    html+=`<h4>${en?'1 · Birth chart: how you experience the question':'1 · Thème natal : votre manière de vivre la question'}</h4><p>${cr3TraitSentence(a,en)}</p>`;
    html+=`<h4>${en?'2 · Outlook over the selected period':'2 · Évolution possible sur la période retenue'}</h4>${cr33IntegratedPeriodNarrative(a,en)}`;
  }else{
    html+=`<p class="muted">${en?'Add your birth data to include the period outlook in the global synthesis.':'Ajoutez vos données de naissance pour intégrer l’éclairage de la période à la synthèse générale.'}</p>`;
  }
  html+='</div>';
  return html;
}
cr3Synthesis=function(a){return cr33GlobalSynthesis(a);};
renderSynthesis=function(){
  if(!state.draw?.length)return;
  const box=document.getElementById('synthesis');
  if(box)box.innerHTML=cr33GlobalSynthesis(state.astro||null);
};

(function cr33Refresh(){
  const style=document.createElement('style');
  style.textContent=`.cr33-integrated p{font-size:1rem;line-height:1.82;margin:.7rem 0}.cr33-integrated b{color:#6b4b1f}`;
  document.head.appendChild(style);
  const out=document.getElementById('astroResult');
  if(out&&state.astro)out.innerHTML=formatAstroResult();
  if(typeof renderSynthesis==='function')renderSynthesis();
})();
