/* CRISTARIVA — intelligence contextuelle, Reflets croisés et suivi local. */
(function(root){
  'use strict';

  const HISTORY_KEY='cristariva-reading-history-v1';
  const NUMEROLOGY_RESULT_KEY='cristariva-numerologie-last-reading';
  const MAX_HISTORY=12;

  function normalize(value){
    return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g,' ').trim();
  }
  function escapeHtml(value){
    return String(value||'').replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':'&quot;',"'":'&#39;'}[c]));
  }
  function relationAnalysis(question){
    const relation=root.CR_RELATION_CONTEXT;
    if(relation&&typeof relation.analyze==='function')return relation.analyze(question);
    return {kind:'ambiguous',roles:[]};
  }

  const DOMAIN_RULES=[
    {value:'Sentimental',key:'sentimental',weight:4,rule:/\b(?:amour|amoureux|amoureuse|sentiment|attirance|attire|desir|désir|couple|partenaire|conjoint|conjointe|mari|femme|ex|crush|romance|love|romantic|feelings?|attraction|partner|spouse)\b/},
    {value:'Relations',key:'relations',weight:3,rule:/\b(?:relation|lien|ami|amie|famille|frere|frère|soeur|sœur|parent|enfant|proche|entourage|connaissance|friend|family|relationship|bond)\b/},
    {value:'Professionnelle / Projet',key:'professional',weight:4,rule:/\b(?:travail|profession|emploi|carriere|carrière|projet|entreprise|client|responsable|manager|patron|chef|collegue|collègue|poste|contrat|business|work|career|job|project|colleague|coworker|boss)\b/},
    {value:'Général / spirituel',key:'general',weight:1,rule:/\b(?:vie|avenir|chemin|spirituel|spiritualite|spiritualité|sens|evolution personnelle|évolution personnelle|life|future|spiritual|personal path)\b/}
  ];
  const INTENT_RULES=[
    {key:'return',weight:6,rule:/\b(?:retour|revenir|revient|reprendre contact|reprise de contact|recontact|retrouver|retrouvailles|reconciliation|réconciliation|silence radio|attends? (?:un )?(?:appel|message|contact|reponse|réponse)|en attente (?:d'un|de) (?:appel|message|contact|reponse|réponse)|rappeler|me rappeler|repondre|répondre|come back|return|reconnect|reconciliation|radio silence|waiting for (?:a )?(?:call|message|reply)|call me back|reply)\b/},
    {key:'new_relation',weight:5,rule:/\b(?:nouvelle? rencontre|nouvelle? personne|rencontrer quelqu|prochaine? rencontre|futur(?:e)? partenaire|someone new|new person|new relationship|meet someone)\b/},
    {key:'feelings',weight:4,rule:/\b(?:pense de moi|pense-t-il|pense-t-elle|sentiment|ressent|aime|m'aime|attir|desir|désir|feel|feelings|think of me|love me|attract)\b/},
    {key:'timing',weight:4,rule:/\b(?:quand|quelle date|quelle periode|quelle période|combien de temps|bientot|bientôt|prochainement|when|what date|what period|how long|soon)\b/},
    {key:'decision',weight:4,rule:/\b(?:dois-je|devrais-je|choisir|choix|decision|décision|accepter|refuser|quitter|rester|should i|choose|decision|accept|refuse|leave|stay)\b/},
    {key:'evolution',weight:3,rule:/\b(?:evolution|évolution|avenir|suite|devenir|va-t-il|va-t-elle|comment va|future|next|develop|evolve|where is .* going)\b/},
    {key:'project',weight:3,rule:/\b(?:projet|lancer|developper|développer|reussir|réussir|emploi|poste|contrat|project|launch|succeed|job|career|contract)\b/}
  ];

  function scoreRules(text,rules){
    return rules.map(item=>({...item,score:item.rule.test(text)?item.weight:0})).sort((a,b)=>b.score-a.score);
  }
  function domainRule(value){return DOMAIN_RULES.find(item=>item.value===value)||null;}
  function namedKnownPerson(question,context=''){
    const q=normalize(question),ctx=normalize(context),text=(q+' '+ctx).trim();
    const personToken="(?!il\\b|elle\\b|on\\b|ils\\b|elles\\b|qui\\b|quoi\\b|comment\\b|quand\\b|ou\\b|maintenant\\b|actuellement\\b|ce\\b|cet\\b|cette\\b|cela\\b|ca\\b|mon\\b|ma\\b|mes\\b|ton\\b|ta\\b|tes\\b|son\\b|sa\\b|ses\\b|notre\\b|votre\\b|leur\\b|un\\b|une\\b|quelqu)([a-z][a-z'-]{2,})\\b";
    const namedContact=/(?:appel|message|contact|reponse|réponse|nouvelles?)\s+(?:de|d'|avec|from|with)\s+(?!mon\b|ma\b|mes\b|son\b|sa\b|ses\b|un\b|une\b|quelqu)([a-z][a-z'-]{2,})\b/.test(q);
    const directNamed=/(?:avec|de|d'|concernant|about|with)\s+(?!mon\b|ma\b|mes\b|son\b|sa\b|ses\b|un\b|une\b|quelqu)([a-z][a-z'-]{2,})\b/.test(q);
    const subjectNamed=new RegExp("\\b(?:que\\s+)?(?:fait|pense|ressent|veut|souhaite|vit|travaille|prepare|cherche|attend|devient|revient|repond|aime|envisage|decide)\\s+"+personToken).test(q);
    const stateNamed=new RegExp("\\b(?:comment\\s+va|ou\\s+est)\\s+"+personToken).test(q);
    const leadingNamed=new RegExp("\\b"+personToken+"\\s+(?:fait|pense|ressent|veut|souhaite|vit|travaille|prepare|cherche|attend|devient|revient|repond|aime|envisage|decide|va-t-il|va-t-elle|est-il|est-elle)\\b").test(q);
    const nominalNamed=new RegExp("\\b(?:travail|emploi|poste|carriere|projet|entreprise|avenir|vie|situation|relation|couple|sentiments?|amour|retour|message|contact|nouvelles?|sante|famille|finances?|argent|evolution|decision|choix)\\s+(?:de|d')\\s*"+personToken).test(q);
    const priorLink=/\b(?:silence radio|plus de nouvelles|ne me parle plus|ne repond plus|ne répond plus|attends? (?:un )?(?:appel|message|reponse|réponse)|reprendre contact|radio silence|no longer replies|waiting for (?:a )?(?:call|message|reply)|reconnect)\b/.test(text);
    return namedContact||subjectNamed||stateNamed||leadingNamed||nominalNamed||(directNamed&&priorLink);
  }
  function questionProfile(question,extraContext='',explicitDomain=''){
    const q=normalize(question),ctx=normalize(extraContext),text=(q+' '+ctx).trim();
    const domainScores=scoreRules(text,DOMAIN_RULES);
    const selectedDomain=domainRule(explicitDomain);
    let domain=selectedDomain||domainScores[0];
    if(!domain||(!selectedDomain&&domain.score===0))domain=DOMAIN_RULES[3];
    const intentScores=scoreRules(text,INTENT_RULES);
    const intents=intentScores.filter(x=>x.score>0).map(x=>x.key);
    const primaryIntent=intents[0]||'general';
    let relation=relationAnalysis(question);
    const namedKnown=namedKnownPerson(question,extraContext);
    if(namedKnown&&relation.kind==='ambiguous')relation={...relation,kind:'known',source:'named-context'};
    const hasPerson=relation.kind!=='ambiguous'||relation.roles.length>0;
    if(!selectedDomain&&domain.key==='general'&&hasPerson)domain=DOMAIN_RULES[1];
    if(!selectedDomain&&(primaryIntent==='feelings'||primaryIntent==='return'||primaryIntent==='new_relation')&&domain.key==='relations')domain=DOMAIN_RULES[0];
    const explicitTiming=intents.includes('timing');
    const complexity=(ctx.length>120?2:0)+(q.length>95?1:0)+(intents.length>1?1:0)+(hasPerson?1:0);
    let cardCount=3;
    if(primaryIntent==='general'&&complexity===0&&q.length<55)cardCount=1;
    if(['return','decision','evolution','project'].includes(primaryIntent)||complexity>=3)cardCount=5;
    const reasons=[];
    if(selectedDomain)reasons.push('explicit_domain');
    else if(domain.key!=='general')reasons.push('domain');
    if(primaryIntent!=='general')reasons.push(primaryIntent);
    if(relation.kind==='known')reasons.push('known_person');
    if(relation.kind==='new')reasons.push('new_person');
    if(relation.kind==='mixed')reasons.push('mixed_relation');
    if(relation.roles.length)reasons.push('role:'+relation.roles.join(','));
    if(namedKnown)reasons.push('named_known_person');
    if(explicitTiming)reasons.push('timing');
    const confidence=selectedDomain||domainScores[0]?.score>0||primaryIntent!=='general'||hasPerson?'contextual':'open';
    return {domain:domain.value,domainKey:domain.key,intent:primaryIntent,intents,relation,explicitTiming,recommendedFormat:cardCount,reasons,confidence};
  }

  function adaptivePlan(question,extraContext='',explicitDomain=''){
    const profile=questionProfile(question,extraContext,explicitDomain);
    const positions=profile.recommendedFormat===1?['essential']:
      profile.recommendedFormat===3?['before','now','momentum']:
      ['origin','obstacle','strength','evolution','synthesis'];
    return {...profile,positions};
  }

  const POSITIVE=/\b(?:favorable|ouverture|rapprochement|harmonie|confiance|accord|reconciliation|réconciliation|reprise|progres|progrès|constructif|stabilisation|opportunite|opportunité|soutien|apaisement|amour|partage|opening|favourable|favorable|rapprochement|harmony|trust|agreement|reconcile|progress|constructive|opportunity|support|stability)\b/;
  const NEGATIVE=/\b(?:blocage|rupture|eloignement|éloignement|distance|fermeture|conflit|tension|echec|échec|trahison|mensonge|peur|retard|frein|obstacle|separation|séparation|rejet|impasse|block|breakup|distance|closure|conflict|tension|failure|betrayal|fear|delay|obstacle|separation|rejection)\b/;
  function toneFromText(text){
    const s=normalize(text);
    const p=(s.match(new RegExp(POSITIVE.source,'g'))||[]).length;
    const n=(s.match(new RegExp(NEGATIVE.source,'g'))||[]).length;
    if(!p&&!n)return 'neutral';
    if(p>=n+2)return 'positive';
    if(n>=p+2)return 'negative';
    return 'mixed';
  }
  function convergence(lenses){
    const usable=(lenses||[]).filter(x=>x&&x.available!==false).map(x=>({...x,tone:x.tone||toneFromText(x.text||'')}));
    const directional=usable.filter(x=>x.tone==='positive'||x.tone==='negative');
    const positives=directional.filter(x=>x.tone==='positive').length;
    const negatives=directional.filter(x=>x.tone==='negative').length;
    let level='insufficient',direction='undetermined';
    if(directional.length>=2){
      if(positives===directional.length){level='strong';direction='positive';}
      else if(negatives===directional.length){level='strong';direction='negative';}
      else if(Math.max(positives,negatives)>=2&&Math.abs(positives-negatives)>=1){level='nuanced';direction=positives>negatives?'positive':'negative';}
      else {level='weak';direction='mixed';}
    }else if(directional.length===1){level='insufficient';direction=directional[0].tone;}
    else if(usable.length>=2){level='nuanced';direction='neutral';}
    return {level,direction,lenses:usable,availableCount:usable.length};
  }

  function timingSummary(input={}){
    const astrology=String(input.astrology||'').trim();
    const symbolic=String(input.symbolic||'').trim();
    if(astrology)return {status:'astrological',text:astrology,disclaimer:'Astrological window, not a guaranteed event date.'};
    if(symbolic)return {status:'symbolic',text:symbolic,disclaimer:'Symbolic timing only, not a guaranteed deadline.'};
    return {status:'unavailable',text:'',disclaimer:'No temporal window has been calculated.'};
  }

  function crossReflections(input={}){
    const candidates=[
      {key:'cards',label:'Cartes',text:input.cards||'',available:!!String(input.cards||'').trim()},
      {key:'astrology',label:'Astrologie',text:input.astrology||'',available:!!String(input.astrology||'').trim()},
      {key:'numerology',label:'Numérologie',text:input.numerology||'',available:!!String(input.numerology||'').trim()}
    ];
    const result=convergence(candidates);
    return {questionProfile:questionProfile(input.question||'',input.context||'',input.domain||''),lenses:candidates.map(x=>({...x,tone:x.available?toneFromText(x.text):'unavailable'})),convergence:result,timing:timingSummary({astrology:input.astrologicalTiming||'',symbolic:input.symbolicTiming||''})};
  }

  function storageRead(storage,key,fallback){
    try{const value=storage&&storage.getItem(key);return value?JSON.parse(value):fallback;}catch(e){return fallback;}
  }
  function storageWrite(storage,key,value){try{storage&&storage.setItem(key,JSON.stringify(value));return true;}catch(e){return false;}}
  function history(storage){const rows=storageRead(storage,HISTORY_KEY,[]);return Array.isArray(rows)?rows:[];}
  function comparableQuestion(value){return normalize(value).replace(/[?!.,;:]+$/g,'');}
  function saveHistory(storage,entry){
    const q=String(entry?.question||'').trim();
    if(!q)return {saved:false,entries:history(storage)};
    const rows=history(storage);
    const next={id:String(entry.id||Date.now()),savedAt:entry.savedAt||new Date().toISOString(),question:q,questionKey:comparableQuestion(q),domain:String(entry.domain||''),oracle:String(entry.oracle||''),format:Number(entry.format||0)||null,summary:String(entry.summary||'').slice(0,1800),direction:String(entry.direction||'undetermined')};
    rows.unshift(next);
    const deduped=[];
    for(const row of rows){if(!deduped.some(x=>x.id===row.id))deduped.push(row);if(deduped.length>=MAX_HISTORY)break;}
    const saved=storageWrite(storage,HISTORY_KEY,deduped);
    return {saved,entry:next,entries:deduped};
  }
  function previousForQuestion(storage,question){
    const key=comparableQuestion(question);if(!key)return null;
    return history(storage).find(row=>row.questionKey===key)||null;
  }
  function compareHistory(previous,current){
    if(!previous)return {status:'first'};
    const now=String(current?.direction||'undetermined'),before=String(previous.direction||'undetermined');
    if(now==='undetermined'||before==='undetermined')return {status:'not-comparable'};
    if(now===before)return {status:'stable',direction:now};
    return {status:'changed',from:before,to:now};
  }

  function lang(){return root.document&&root.document.documentElement.lang==='en'?'en':'fr';}
  function text(fr,en){return lang()==='en'?en:fr;}
  function relationLabel(info){
    if(info.kind==='known')return text('personne déjà connue','person already known');
    if(info.kind==='new')return text('nouvelle personne','new person');
    if(info.kind==='mixed')return text('plusieurs possibilités relationnelles','several relationship possibilities');
    return text('relation non déterminée','relationship not determined');
  }
  function intentLabel(intent){
    const fr={return:'contact / reprise de lien',new_relation:'nouvelle rencontre',feelings:'sentiments / attirance',timing:'temporalité',decision:'choix ou décision',evolution:'évolution',project:'projet / évolution professionnelle',general:'lecture ouverte'};
    const en={return:'contact / reconnection',new_relation:'new encounter',feelings:'feelings / attraction',timing:'timing',decision:'choice or decision',evolution:'development',project:'project / professional development',general:'open reading'};
    return (lang()==='en'?en:fr)[intent]||intent;
  }
  function domainLabel(value){
    if(lang()!=='en')return value;
    return {'Sentimental':'Romantic','Relations':'Relationships','Professionnelle / Projet':'Professional / Project','Général / spirituel':'General / Spiritual'}[value]||value;
  }
  function convergenceLabel(c){
    const fr={strong:'Forte',nuanced:'Nuancée',weak:'Faible / contradictoire',insufficient:'À compléter'};
    const en={strong:'Strong',nuanced:'Nuanced',weak:'Weak / contradictory',insufficient:'Needs more input'};
    return (lang()==='en'?en:fr)[c.level];
  }
  function directionLabel(direction){
    const fr={positive:'orientation plutôt favorable',negative:'orientation plutôt restrictive',mixed:'signaux contradictoires',neutral:'signaux surtout nuancés',undetermined:'orientation non déterminée'};
    const en={positive:'rather favourable direction',negative:'rather restrictive direction',mixed:'contradictory signals',neutral:'mostly nuanced signals',undetermined:'undetermined direction'};
    return (lang()==='en'?en:fr)[direction]||direction;
  }

  function loadNumerologyResult(){
    let value=storageRead(root.localStorage,NUMEROLOGY_RESULT_KEY,null);
    if(!value)return null;
    const age=Date.now()-Number(value.savedAt||0);
    if(!Number.isFinite(age)||age>6*60*60*1000)return null;
    return value;
  }
  function readDomInput(){
    const doc=root.document;
    if(!doc)return {};
    const q=doc.getElementById('question')?.value||'';
    const context=doc.getElementById('readingContext')?.value||'';
    const domain=doc.getElementById('domain')?.value||'';
    const cards=doc.getElementById('reading')?.textContent||'';
    const astro=[doc.getElementById('astroResult')?.textContent||'',doc.getElementById('relationAstroResult')?.textContent||''].filter(Boolean).join(' ');
    const symbolicTiming=doc.getElementById('dateResult')?.textContent||'';
    const periodNodes=doc.querySelectorAll('[data-period-window], .cr3-period-result, .period-window-result');
    const astrologicalTiming=Array.from(periodNodes).map(n=>n.textContent||'').filter(Boolean).join(' ');
    const numerology=loadNumerologyResult();
    return {question:q,context,domain,cards,astrology:astro,numerology:numerology?.text||'',symbolicTiming,astrologicalTiming};
  }

  function assistantMarkup(plan){
    const roles=plan.relation.roles.length?` · ${escapeHtml(plan.relation.roles.join(', '))}`:'';
    return `<div class="cr-intelligence-head"><strong>${text('Ce que CRISTARIVA comprend de votre question','What CRISTARIVA understands from your question')}</strong><span>${text('Analyse contextuelle','Context analysis')}</span></div>`+
      `<div class="cr-intelligence-grid"><div><b>${text('Domaine','Domain')}</b><span>${escapeHtml(domainLabel(plan.domain))}</span></div><div><b>${text('Intention','Intent')}</b><span>${escapeHtml(intentLabel(plan.intent))}</span></div><div><b>${text('Contexte relationnel','Relationship context')}</b><span>${escapeHtml(relationLabel(plan.relation))}${roles}</span></div><div><b>${text('Format conseillé','Suggested format')}</b><span>${plan.recommendedFormat} ${text(plan.recommendedFormat>1?'cartes':'carte',plan.recommendedFormat>1?'cards':'card')}</span></div></div>`+
      `<button type="button" class="btn ghost cr-apply-plan">${text('Appliquer ces suggestions','Apply these suggestions')}</button>`+
      `<small>${text('Les choix explicites du tirage restent prioritaires. CRISTARIVA complète leur contexte sans les contredire.','Explicit reading choices remain authoritative. CRISTARIVA adds context without contradicting them.')}</small>`;
  }
  function installStyle(){
    const doc=root.document;if(!doc||doc.getElementById('cristariva-intelligence-style'))return;
    const style=doc.createElement('style');style.id='cristariva-intelligence-style';style.textContent=`
      .cr-intelligence{margin:18px 0;padding:18px;border:1px solid rgba(181,133,69,.45);border-radius:18px;background:linear-gradient(135deg,#fffaf1,#f3eadb);color:#172033}.cr-intelligence-head{display:flex;gap:10px;align-items:baseline;justify-content:space-between;flex-wrap:wrap;margin-bottom:12px}.cr-intelligence-head strong{font:1.08rem Georgia,serif}.cr-intelligence-head span{font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;color:#8a6839}.cr-intelligence-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin-bottom:12px}.cr-intelligence-grid>div{padding:10px;border-radius:12px;background:#fff;border:1px solid #e4d8c6}.cr-intelligence-grid b,.cr-intelligence-grid span{display:block}.cr-intelligence-grid b{font-size:.72rem;color:#6c5a42;margin-bottom:4px}.cr-intelligence-grid span{font-size:.88rem}.cr-intelligence small{display:block;margin-top:9px;color:#6d7580}.cr-cross{margin-top:18px;padding:20px;border:1px solid rgba(181,133,69,.45);border-radius:18px;background:linear-gradient(135deg,#fbf5ea,#eef3f6);color:#172033}.cr-cross h3{font-family:Georgia,serif;margin:0 0 6px}.cr-cross-lenses{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:14px 0}.cr-cross-lens{padding:12px;background:white;border:1px solid #d9dfe5;border-radius:13px}.cr-cross-lens b,.cr-cross-lens span{display:block}.cr-cross-lens span{margin-top:4px;font-size:.84rem;color:#596572}.cr-cross-convergence{padding:13px;border-left:4px solid #b58545;background:#fff;border-radius:0 12px 12px 0}.cr-history{margin-top:12px}.cr-history-status{font-size:.85rem;color:#596572;margin-top:8px}@media(max-width:800px){.cr-intelligence-grid,.cr-cross-lenses{grid-template-columns:1fr 1fr}}@media(max-width:520px){.cr-intelligence-grid,.cr-cross-lenses{grid-template-columns:1fr}}`;
    doc.head.appendChild(style);
  }
  function setupQuestionAssistant(){
    const doc=root.document,q=doc?.getElementById('question'),ctx=doc?.getElementById('readingContext'),domainSelect=doc?.getElementById('domain');if(!q)return;
    const fields=q.closest('.reading-fields')||doc.querySelector('.reading-fields');if(!fields)return;
    let box=doc.getElementById('cristarivaQuestionInsight');
    if(!box){box=doc.createElement('aside');box.id='cristarivaQuestionInsight';box.className='cr-intelligence';fields.insertAdjacentElement('afterend',box);}
    let timer=null;
    const render=()=>{const question=q.value.trim();if(!question){box.hidden=true;return;}box.hidden=false;const plan=adaptivePlan(question,ctx?.value||'',domainSelect?.value||'');box.innerHTML=assistantMarkup(plan);box.querySelector('.cr-apply-plan')?.addEventListener('click',()=>{
      const domain=doc.getElementById('domain');if(domain&&[...domain.options].some(o=>o.value===plan.domain)){domain.value=plan.domain;domain.dispatchEvent(new Event('change',{bubbles:true}));}
      const format=doc.querySelector(`.choice[data-group="format"][data-value="${plan.recommendedFormat}"]`);if(format)format.click();
    });};
    const schedule=()=>{clearTimeout(timer);timer=setTimeout(render,140);};
    q.addEventListener('input',schedule);ctx?.addEventListener('input',schedule);domainSelect?.addEventListener('change',schedule);doc.getElementById('langBtn')?.addEventListener('click',()=>setTimeout(render,0));render();
  }
  function crossMarkup(result){
    const available=result.lenses.filter(x=>x.available);
    const lensHtml=result.lenses.map(l=>`<div class="cr-cross-lens"><b>${escapeHtml(l.label)}</b><span>${l.available?escapeHtml(directionLabel(l.tone==='mixed'?'mixed':l.tone==='neutral'?'neutral':l.tone)) : text('Non utilisé dans cette synthèse','Not used in this synthesis')}</span></div>`).join('');
    const timing=result.timing.status==='astrological'?text('Une fenêtre astrologique calculée est disponible dans la consultation.','A calculated astrological window is available in the consultation.'):result.timing.status==='symbolic'?text('La datation disponible reste symbolique ; elle ne constitue pas une échéance garantie.','The available timing remains symbolic; it is not a guaranteed deadline.'):text('Aucune fenêtre temporelle n’est encore calculée.','No temporal window has been calculated yet.');
    return `<h3>${text('Les Reflets croisés','Crossed Reflections')}</h3><p>${text('CRISTARIVA confronte uniquement les méthodes réellement utilisées dans votre consultation.','CRISTARIVA compares only the methods actually used in your consultation.')}</p><div class="cr-cross-lenses">${lensHtml}</div><div class="cr-cross-convergence"><b>${text('Convergence','Convergence')} : ${escapeHtml(convergenceLabel(result.convergence))}</b><div>${escapeHtml(directionLabel(result.convergence.direction))}</div><small>${available.length<2?text('Ajoutez un autre reflet (astrologie ou numérologie) pour mesurer un accord entre méthodes.','Add another reflection (astrology or numerology) to compare methods.'):text('Cet indice décrit l’accord entre lectures symboliques ; ce n’est pas une probabilité qu’un événement se produise.','This indicator describes agreement between symbolic readings; it is not the probability of an event occurring.')}</small></div><p><b>${text('Temporalité','Timing')}.</b> ${escapeHtml(timing)}</p><div class="cr-history"><button type="button" class="btn ghost cr-track-question">${text('Suivre cette question dans le temps','Track this question over time')}</button><div class="cr-history-status" aria-live="polite"></div></div>`;
  }
  function setupCrossReflections(){
    const doc=root.document,synthesis=doc?.getElementById('synthesis');if(!synthesis)return;
    let box=doc.getElementById('cristarivaCrossReflections');
    if(!box){box=doc.createElement('section');box.id='cristarivaCrossReflections';box.className='cr-cross';box.hidden=true;synthesis.insertAdjacentElement('afterend',box);}
    let rendering=false;
    const render=()=>{
      if(rendering)return;rendering=true;
      try{
        const input=readDomInput();
        if(!input.question||!(input.cards||synthesis.textContent.trim())){box.hidden=true;return;}
        const result=crossReflections(input);box.hidden=false;box.innerHTML=crossMarkup(result);
        const previous=previousForQuestion(root.localStorage,input.question);
        const status=box.querySelector('.cr-history-status');
        if(previous&&status){const date=new Date(previous.savedAt);status.textContent=text(`Un suivi existe déjà pour cette question (${date.toLocaleDateString('fr-FR')}).`,`A previous entry exists for this question (${date.toLocaleDateString('en-GB')}).`);}
        box.querySelector('.cr-track-question')?.addEventListener('click',()=>{
          const domain=doc.getElementById('domain')?.value||result.questionProfile.domain;
          const oracle=doc.getElementById('oracleChoice')?.value||'';
          const selected=doc.querySelector('.choice[data-group="format"].selected');
          const current={question:input.question,domain,oracle,format:selected?.dataset.value||result.questionProfile.recommendedFormat,summary:(synthesis.textContent||input.cards).trim(),direction:result.convergence.direction};
          const comparison=compareHistory(previous,current);const saved=saveHistory(root.localStorage,current);
          if(status)status.textContent=saved.saved?(comparison.status==='first'?text('Première étape enregistrée uniquement dans ce navigateur.','First entry saved only in this browser.'):comparison.status==='stable'?text('Nouvelle étape enregistrée : l’orientation générale reste cohérente avec le suivi précédent.','New entry saved: the overall direction remains consistent with the previous entry.'):comparison.status==='changed'?text('Nouvelle étape enregistrée : l’orientation a changé depuis le suivi précédent.','New entry saved: the direction has changed since the previous entry.'):text('Nouvelle étape enregistrée dans ce navigateur.','New entry saved in this browser.')):text('Le navigateur n’autorise pas l’enregistrement local.','This browser does not allow local storage.');
        });
      }finally{rendering=false;}
    };
    doc.getElementById('synthesisBtn')?.addEventListener('click',()=>setTimeout(render,60));
    const observer=new MutationObserver(()=>{if(!synthesis.classList.contains('hidden')&&synthesis.textContent.trim())setTimeout(render,0);});
    observer.observe(synthesis,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class']});
    doc.getElementById('langBtn')?.addEventListener('click',()=>setTimeout(render,0));
  }
  function initBrowser(){installStyle();setupQuestionAssistant();setupCrossReflections();}

  const api={normalize,questionProfile,adaptivePlan,toneFromText,convergence,timingSummary,crossReflections,history,saveHistory,previousForQuestion,compareHistory,HISTORY_KEY,NUMEROLOGY_RESULT_KEY};
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.CRISTARIVA_INTELLIGENCE=api;
  if(root.document){if(root.document.readyState==='loading')root.document.addEventListener('DOMContentLoaded',initBrowser,{once:true});else initBrowser();}
})(typeof window==='undefined'?globalThis:window);