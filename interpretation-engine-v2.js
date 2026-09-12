const INTERPRETATION_ENGINE_VERSION='2.0';
const ENGINE_THEME_RULES=[
 {key:'separation',pattern:/rupture|fin\b|perte|abandon|rejet|eloign|distance|indifference|incompatibil|porte fermee|separat/,fr:'la distance, la séparation ou la fin d’un cycle',en:'distance, separation or the end of a cycle'},
 {key:'truth',pattern:/mensong|trahison|manipul|emprise|fausse promesse|masque|desillusion|sincerite|verite|aveu/,fr:'la vérité, la confiance et ce qui doit être clarifié',en:'truth, trust and what needs to be clarified'},
 {key:'block',pattern:/conflit|opposition|impasse|echec|epuis|instabil|dependance|doute|peur|tempete|noeud|labyrinthe|retard|obstacle|critique|jalous/,fr:'le frein, la tension ou la résistance à traverser',en:'the obstacle, tension or resistance to work through'},
 {key:'bond',pattern:/reconcil|main tendue|lien|accord|union|ensemble|partag|recipro|communication|pont|confiance|relation|partenaire/,fr:'le lien, la réciprocité et la possibilité d’un rapprochement',en:'connection, reciprocity and the possibility of rapprochement'},
 {key:'opening',pattern:/naissance|graine|nouveau|neuve|aube|possibil|ouverture|arrivee|cadeau|abondance|richesse|succes|bonheur|joie|liberation/,fr:'l’ouverture, le renouveau et ce qui peut commencer',en:'opening, renewal and what may begin'},
 {key:'choice',pattern:/choix|carrefour|priorite|integrite|balance|equite|boussole|cap|direction|decision/,fr:'le choix, l’orientation et la décision à prendre',en:'choice, direction and the decision to be made'},
 {key:'past',pattern:/passe|memoire|ancien|echo|regret|retour|transmission|racine/,fr:'le passé, la mémoire et ce qui revient demander du sens',en:'the past, memory and what returns to be understood'},
 {key:'time',pattern:/patience|sablier|rythme|maree|tortue|neige|etape|attente|delai|temps|maturation/,fr:'le temps, la patience et le rythme nécessaire',en:'time, patience and the necessary pace'},
 {key:'strength',pattern:/protection|protecteur|refuge|roc|ancrage|force|lion|phare|soutien|clarte|lumiere|sagesse/,fr:'la protection, l’ancrage et la force disponible',en:'protection, grounding and available strength'},
 {key:'feeling',pattern:/amour|rose|flamme|emotion|ressenti|passion|sentiment|coeur|plaisir/,fr:'les sentiments, le désir et leur expression concrète',en:'feelings, desire and their concrete expression'},
 {key:'movement',pattern:/changement|mue|passage|detour|riviere|vague|galop|horizon|chemin|evolution|ascension|reset|progression/,fr:'le changement, le passage et la direction qui se dessine',en:'change, transition and the direction taking shape'},
 {key:'spiritual',pattern:/divin|karma|spirit|intuition|corbeau|chouette|aigle|serpent|signe|synchronic/,fr:'l’intuition, le sens symbolique et l’évolution intérieure',en:'intuition, symbolic meaning and inner development'},
 {key:'insight',pattern:/.*/,fr:'une prise de conscience qui éclaire autrement la situation',en:'an insight that sheds new light on the situation'}
];

function engineNormalize(value){
 return String(value||'').toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
}
function engineSource(c){
 if(!c)return '';
 return engineNormalize([c.name,c.definition,c.message,c.keywords].join(' '));
}
function enginePolarity(c){
 const category=engineNormalize(c?.category);
 if(category.indexOf('positive')>=0)return 1;
 if(category.indexOf('negative')>=0)return -1;
 return 0;
}
function engineStrength(c){
 const intensity=engineNormalize(c?.intensity);
 if(/majeure|tres forte/.test(intensity))return 4;
 if(/moyenne a forte|forte/.test(intensity))return 3;
 if(/moyenne|douce mais profonde|variable/.test(intensity))return 2;
 return 1;
}
function engineProfile(c){
 const source=engineSource(c);
 const title=engineNormalize(c?.name);
 const titleThemes=ENGINE_THEME_RULES.filter(rule=>rule.key!=='insight'&&rule.pattern.test(title));
 const sourceThemes=ENGINE_THEME_RULES.filter(rule=>rule.key!=='insight'&&rule.pattern.test(source)&&!titleThemes.some(match=>match.key===rule.key));
 const themes=titleThemes.concat(sourceThemes);
 if(!themes.length)themes.push(ENGINE_THEME_RULES[ENGINE_THEME_RULES.length-1]);
 return {card:c,themes:themes,primary:themes[0],polarity:enginePolarity(c),strength:engineStrength(c)};
}
function engineThemeLabel(theme,en){
 return theme?(en?theme.en:theme.fr):(en?'the central theme of the reading':'le thème central du tirage');
}
function enginePolarityLabel(value,en){
 if(en)return value>0?'constructive':value<0?'challenging':'context-dependent';
 return value>0?'constructive':value<0?'exigeante':'à relier au contexte';
}
function engineStrengthLabel(value,en){
 const labels=en?['','light','moderate','strong','major']:['','légère','modérée','forte','majeure'];
 return labels[value]||labels[2];
}
function enginePositionWeight(index,total){
 const weights={1:[1],3:[.45,.85,1.35],5:[.45,.35,.7,1.15,1.45]};
 return (weights[total]||[])[index]||1;
}
function engineDominantTheme(profiles){
 const scores={};
 profiles.forEach((profile,index)=>{
  profile.themes.forEach((theme,themeIndex)=>{
   const share=themeIndex===0?1:.2;
   scores[theme.key]=(scores[theme.key]||0)+profile.strength*enginePositionWeight(index,profiles.length)*share;
  });
 });
 const key=Object.keys(scores).sort((a,b)=>scores[b]-scores[a])[0]||'insight';
 return ENGINE_THEME_RULES.find(rule=>rule.key===key)||ENGINE_THEME_RULES[ENGINE_THEME_RULES.length-1];
}
function engineOutcome(profile,en){
 const key=profile?.primary?.key||'insight';
 const fr={
  separation:'La direction demande d’accepter une distance ou une fin de cycle avant de conclure à une reprise.',
  truth:'La suite dépend d’une vérité dite clairement et d’une confiance reconstruite par des faits.',
  block:'Le mouvement reste conditionné par la résolution concrète du frein identifié.',
  bond:'Un rapprochement reste possible si la réciprocité apparaît dans les actes.',
  opening:'Une étape nouvelle devient envisageable, sans que sa forme soit encore fixée.',
  choice:'La suite se joue dans une décision qui met fin à l’entre-deux.',
  past:'Le passé revient pour être compris ou transformé, pas nécessairement pour être répété.',
  time:'L’évolution est progressive et demande de respecter un rythme de maturation.',
  strength:'Une position plus claire et mieux ancrée peut rétablir l’équilibre.',
  feeling:'Le sentiment compte, mais il doit prendre une forme observable pour devenir une évolution.',
  movement:'Un changement de direction prépare une étape différente.',
  spiritual:'L’essentiel est ici la compréhension intérieure avant la manifestation extérieure.',
  insight:'La suite invite à regarder la situation avec une compréhension nouvelle.'
 };
 const english={
  separation:'The direction calls for accepting distance or the end of a cycle before inferring a return.',
  truth:'What follows depends on clear truth and trust rebuilt through observable actions.',
  block:'Progress remains conditional on resolving the obstacle in concrete terms.',
  bond:'Rapprochement remains possible if reciprocity becomes visible in actions.',
  opening:'A new chapter becomes possible, although its form is not yet fixed.',
  choice:'The next stage turns on a decision that ends the uncertainty.',
  past:'The past returns to be understood or transformed, not necessarily repeated.',
  time:'Development is gradual and needs to respect a period of maturation.',
  strength:'A clearer and more grounded position can restore balance.',
  feeling:'Feelings matter, but they need observable expression to become a real development.',
  movement:'A change of direction prepares a different chapter.',
  spiritual:'Inner understanding comes before outward manifestation here.',
  insight:'The next stage calls for a new understanding of the situation.'
 };
 return (en?english:fr)[key]||(en?english.insight:fr.insight);
}
function engineTrend(cards,profiles,dominant){
 const en=state.lang==='en';
 let score=0,maximum=0;
 profiles.forEach((profile,index)=>{
  const weight=enginePositionWeight(index,profiles.length)*profile.strength;
  score+=profile.polarity*weight;
  maximum+=weight;
 });
 score=maximum?score/maximum:0;
 const first=profiles[0]?.polarity||0,last=profiles[profiles.length-1]?.polarity||0;
 let key='mixed';
 if(profiles.length>1&&first<0&&last>0)key='improving';
 else if(profiles.length>1&&first>0&&last<0)key='caution';
 else if(score>.2)key='opening';
 else if(score<-.2)key='constraint';
 const fr={
  improving:'La dynamique va d’une difficulté vers une ouverture. Le mouvement est encourageant, mais il demande encore des actes cohérents pour se confirmer.',
  caution:'Une ouverture existe au départ, mais la fin du tirage impose de la prudence et une clarification avant d’aller plus loin.',
  opening:'La tendance est plutôt constructive : une possibilité se dégage, à condition de soutenir ce mouvement par des choix et des faits concordants.',
  constraint:'La tendance reste contrainte : le tirage met d’abord en avant ce qui bloque, se termine ou doit être regardé avec lucidité.',
  mixed:'La tendance est nuancée et conditionnelle : des forces opposées coexistent, et la suite dépendra de ce qui se traduira réellement dans les actes.'
 };
 const english={
  improving:'The movement goes from difficulty toward an opening. It is encouraging, but still needs consistent actions to be confirmed.',
  caution:'An opening exists at first, but the end of the spread calls for caution and clarification before moving further.',
  opening:'The trend is broadly constructive: a possibility is emerging, provided it is supported by consistent choices and facts.',
  constraint:'The trend remains constrained: the spread primarily highlights what is blocked, ending or in need of clear-eyed attention.',
  mixed:'The trend is nuanced and conditional: opposing forces coexist, and the outcome depends on what becomes real through actions.'
 };
 return {key:key,score:score,dominant:dominant,essential:(en?english:fr)[key]};
}
function engineSharedTheme(a,b){
 return a.themes.find(theme=>b.themes.some(other=>other.key===theme.key))||null;
}
function engineInteractionType(a,b,shared){
 if(a.polarity<0&&b.polarity>0)return 'transformation';
 if(a.polarity>0&&b.polarity<0)return 'contradiction';
 if(shared)return 'confirmation';
 if(a.polarity!==0&&a.polarity===b.polarity)return 'reinforcement';
 return 'nuance';
}
function engineInteractions(cards,profiles){
 if(cards.length<2)return [];
 const results=[],seen=new Set();
 function add(i,j){
  if(i===j||i<0||j<0||i>=cards.length||j>=cards.length)return;
  if(i>j){const swap=i;i=j;j=swap;}
  const id=i+'-'+j;
  if(seen.has(id))return;
  const shared=engineSharedTheme(profiles[i],profiles[j]);
  results.push({i:i,j:j,shared:shared,type:engineInteractionType(profiles[i],profiles[j],shared)});
  seen.add(id);
 }
 if(cards.length===5)add(1,2);
 add(0,cards.length-1);
 const pairs=[];
 for(let i=0;i<cards.length;i++)for(let j=i+1;j<cards.length;j++){
  const shared=engineSharedTheme(profiles[i],profiles[j]);
  let priority=(shared?20:0)+profiles[i].strength+profiles[j].strength;
  if(profiles[i].polarity!==0&&profiles[j].polarity!==0&&profiles[i].polarity!==profiles[j].polarity)priority+=10;
  pairs.push({i:i,j:j,priority:priority});
 }
 pairs.sort((a,b)=>b.priority-a.priority).forEach(pair=>{if(results.length<3)add(pair.i,pair.j);});
 return results.slice(0,3);
}
function engineInteractionText(interaction,cards,profiles,en){
 const a=readingEscape(cardName(cards[interaction.i])),b=readingEscape(cardName(cards[interaction.j]));
 const theme=engineThemeLabel(interaction.shared,en);
 const labels=en?{confirmation:'Confirmation',reinforcement:'Reinforcement',contradiction:'Contradiction',transformation:'Transformation',nuance:'Nuance'}:{confirmation:'Confirmation',reinforcement:'Renforcement',contradiction:'Contradiction',transformation:'Transformation',nuance:'Nuance'};
 let sentence='';
 if(en){
  if(interaction.type==='confirmation')sentence=a+' and '+b+' echo each other around '+theme+'.';
  else if(interaction.type==='reinforcement')sentence=a+' and '+b+' give this direction greater weight in the spread.';
  else if(interaction.type==='contradiction')sentence=a+' opens one direction, while '+b+' introduces a contrary movement. Neither card cancels the other: this tension is central.';
  else if(interaction.type==='transformation')sentence='The movement from '+a+' toward '+b+' describes a shift from difficulty to a possible opening.';
  else sentence=a+' gives '+b+' a more conditional meaning that depends on the wider spread.';
 }else{
  if(interaction.type==='confirmation')sentence=a+' et '+b+' se répondent autour de '+theme+'.';
  else if(interaction.type==='reinforcement')sentence=a+' et '+b+' donnent davantage de poids à cette direction dans le tirage.';
  else if(interaction.type==='contradiction')sentence=a+' ouvre une direction, tandis que '+b+' introduit un mouvement contraire. Aucune carte n’annule l’autre : cette tension est centrale.';
  else if(interaction.type==='transformation')sentence='Le passage de '+a+' vers '+b+' décrit une transformation : la difficulté laisse place à une ouverture possible.';
  else sentence=a+' nuance '+b+' et demande de relier leur sens à l’ensemble du tirage.';
 }
 return '<b>'+labels[interaction.type]+' :</b> '+sentence;
}
function enginePositionModifier(profile,index,total,en){
 if(total===1)return en?'As the essential insight, it concentrates the central answer and must be read in direct relation to the question.':'Comme éclairage essentiel, elle concentre la réponse centrale et doit être reliée directement à la question.';
 if(total===3){
  if(index===0)return en?'In the Before position, it describes the background that still influences the present.':'Dans la position Avant, elle décrit l’arrière-plan qui influence encore le présent.';
  if(index===1)return en?'In the Now position, it identifies the active reality of the situation.':'Dans la position Maintenant, elle désigne la réalité active de la situation.';
  return (en?'In the Momentum position, it carries more weight in the direction of the reading. ':'Dans la position Élan, elle pèse davantage sur la direction du tirage. ')+engineOutcome(profile,en);
 }
 if(index===0)return en?'At the Origin, it shows what established the situation and should not be mistaken for its final outcome.':'À l’Origine, elle montre ce qui a installé la situation et ne doit pas être confondue avec son issue.';
 if(index===1){
  if(profile.polarity>0)return en?'As the Obstacle, its constructive potential appears present but not yet fully available.':'Dans l’Obstacle, son potentiel constructif semble présent mais pas encore pleinement accessible.';
  if(profile.polarity<0)return en?'As the Obstacle, it names a real difficulty that the rest of the spread must answer.':'Dans l’Obstacle, elle nomme une difficulté réelle à laquelle le reste du tirage doit répondre.';
  return en?'As the Obstacle, it identifies the uncertain point that still needs clarification.':'Dans l’Obstacle, elle désigne le point encore ambigu qui demande à être clarifié.';
 }
 if(index===2){
  if(profile.polarity<0)return en?'As the Strength, the resource is not the difficulty itself, but the ability to recognise it, set a boundary and act clearly.':'Dans la Force, la ressource n’est pas la difficulté elle-même, mais la capacité à la reconnaître, à poser une limite et à agir clairement.';
  return en?'As the Strength, it becomes the support on which the situation can rely.':'Dans la Force, elle devient l’appui sur lequel la situation peut réellement s’appuyer.';
 }
 if(index===3)return (en?'In the Evolution position, it shows what is beginning to change. ':'Dans l’Évolution, elle montre ce qui commence à changer. ')+engineOutcome(profile,en);
 return (en?'In the Synthesis position, it has the greatest weight in the final direction. ':'Dans la Synthèse, elle possède le poids le plus important dans la direction finale. ')+engineOutcome(profile,en);
}
function engineCardMeaning(c,en){
 if(en)return cardField(c,'meaning')||cardField(c,'definition')||engineThemeLabel(engineProfile(c).primary,true);
 return domainReading(c)||c.meaning||c.definition||engineThemeLabel(engineProfile(c).primary,false);
}
function enginePositionReading(c,profile,index,total,en){
 const positions=(en?POSITIONS_EN:POSITIONS_FR)[total];
 const position=positions?.[index]?.[0]||(en?'Position':'Position');
 const meta=(en?'Symbolic strength ':'Force symbolique ')+profile.strength+'/4 · '+(en?'polarity ':'polarité ')+enginePolarityLabel(profile.polarity,en);
 return '<div class="story-step"><b>'+readingEscape(position)+' — '+readingEscape(cardName(c))+'</b><p>'+readingEscape(engineCardMeaning(c,en))+'</p><p>'+enginePositionModifier(profile,index,total,en)+'</p><span class="reading-meta">'+meta+'</span></div>';
}
function engineStoryParagraphs(analysis,en){
 const cards=analysis.cards,profiles=analysis.profiles;
 const name=index=>readingEscape(cardName(cards[index]));
 const theme=index=>engineThemeLabel(profiles[index]?.primary,en);
 const subject=readingSubject(readingContext(),en);
 if(cards.length===1){
  return [en?'For '+subject+', '+name(0)+' places '+theme(0)+' at the centre of the consultation. '+engineOutcome(profiles[0],true):'Pour '+subject+', '+name(0)+' place '+theme(0)+' au centre de la consultation. '+engineOutcome(profiles[0],false)];
 }
 if(cards.length===3){
  return [
   en?'The story begins with '+name(0)+', which roots '+subject+' in '+theme(0)+'. In the present, '+name(1)+' brings '+theme(1)+' to the foreground.':'L’histoire commence avec '+name(0)+', qui inscrit '+subject+' dans '+theme(0)+'. Au présent, '+name(1)+' fait passer au premier plan '+theme(1)+'.',
   en?'The movement toward '+name(2)+' changes the perspective and directs the story toward '+theme(2)+'. '+engineOutcome(profiles[2],true):'Le mouvement vers '+name(2)+' change la perspective et oriente le récit vers '+theme(2)+'. '+engineOutcome(profiles[2],false)
  ];
 }
 return [
  en?'At the root of '+subject+', '+name(0)+' establishes '+theme(0)+'. The obstacle, '+name(1)+', shows that this starting point cannot develop without confronting '+theme(1)+'.':'À la racine de '+subject+', '+name(0)+' installe '+theme(0)+'. L’obstacle, '+name(1)+', montre que ce point de départ ne peut évoluer sans rencontrer '+theme(1)+'.',
  en?'The strength of '+name(2)+' offers '+theme(2)+'. This resource answers the obstacle, while '+name(3)+' begins to move the situation toward '+theme(3)+'.':'La force de '+name(2)+' apporte '+theme(2)+'. Cette ressource répond à l’obstacle, tandis que '+name(3)+' commence à déplacer la situation vers '+theme(3)+'.',
  en?'Finally, '+name(4)+' gathers the whole spread around '+theme(4)+'. '+engineOutcome(profiles[4],true):'Enfin, '+name(4)+' rassemble l’ensemble du tirage autour de '+theme(4)+'. '+engineOutcome(profiles[4],false)
 ];
}
function engineAnalyze(cards){
 const profiles=cards.map(engineProfile);
 const dominant=engineDominantTheme(profiles);
 const analysis={cards:cards,profiles:profiles,dominant:dominant};
 analysis.interactions=engineInteractions(cards,profiles);
 analysis.trend=engineTrend(cards,profiles,dominant);
 analysis.story=engineStoryParagraphs(analysis,state.lang==='en');
 return analysis;
}
function storyInterpretation(cards){
 if(!cards.length)return '';
 const en=state.lang==='en',analysis=engineAnalyze(cards);
 const question=readingEscape(state.question||(en?'Open question':'Question ouverte'));
 const domain=readingEscape(en?(DOMAIN_EN[state.domain]||state.domain):state.domain);
 let html='<div class="story-reading" data-engine-version="'+INTERPRETATION_ENGINE_VERSION+'">';
 html+='<div class="reading-context"><b>'+(en?'Question':'Question')+' :</b> « '+question+' »<br><b>'+(en?'Area':'Domaine')+' :</b> '+domain+'</div>';
 html+='<h3>'+(en?'Reading each position':'Lecture de chaque position')+'</h3>';
 html+=cards.map((card,index)=>enginePositionReading(card,analysis.profiles[index],index,cards.length,en)).join('');
 if(analysis.interactions.length){
  html+='<h4>'+(en?'Connections, confirmations and contradictions':'Relations, confirmations et contradictions')+'</h4><ul class="reading-relations">';
  html+=analysis.interactions.map(item=>'<li>'+engineInteractionText(item,cards,analysis.profiles,en)+'</li>').join('');
  html+='</ul>';
 }
 html+='<h3>'+(en?'The story told by your cards':'L’histoire racontée par vos cartes')+'</h3>';
 html+=analysis.story.map(paragraph=>'<p>'+paragraph+'</p>').join('');
 html+='<div class="essential-trend"><h4>'+(en?'The essential trend':'La tendance essentielle')+'</h4><p>'+analysis.trend.essential+'</p></div></div>';
 return html;
}
function engineFocusPlanets(themeKey){
 const map={
  separation:['Saturne','Vénus'],truth:['Mercure','Saturne'],block:['Saturne','Mars'],
  bond:['Vénus','Lune'],opening:['Jupiter','Uranus'],choice:['Mercure','Saturne'],
  past:['Lune','Saturne'],time:['Saturne','Lune'],strength:['Mars','Saturne'],
  feeling:['Vénus','Lune'],movement:['Uranus','Jupiter'],spiritual:['Neptune','Lune'],
  insight:['Soleil','Lune']
 };
 return map[themeKey]||map.insight;
}
function engineNatalParagraph(a,analysis,en){
 const focus=engineFocusPlanets(analysis.dominant.key);
 const placements=focus.filter(planet=>a.planets&&Number.isFinite(a.planets[planet])).map(planet=>{
  return '<b>'+readingEscape(planetName(planet))+' '+readingEscape(en?'in':'en')+' '+readingEscape(signName(zodiac(a.planets[planet]).sign))+'</b>';
 });
 const core=(en?'Your Sun in ':'Votre Soleil en ')+'<b>'+readingEscape(signName(a.sun.sign))+'</b> '+(en?'describes your conscious direction, while your Moon in ':'décrit votre manière consciente de vous orienter, tandis que votre Lune en ')+'<b>'+readingEscape(signName(a.moon.sign))+'</b> '+(en?'shows how the situation resonates emotionally.':'montre comment la situation résonne émotionnellement.');
 const asc=a.asc?(' '+(en?'Your Ascendant in ':'Votre Ascendant en ')+'<b>'+readingEscape(signName(a.asc.sign))+'</b> '+(en?'adds the way you instinctively approach it.':'ajoute votre manière instinctive de l’aborder.')):'';
 const activation=placements.length?(' '+(en?'The dominant card theme symbolically activates ':'Le thème dominant des cartes active symboliquement ')+placements.join(en?' and ':' et ')+'.'):'';
 return core+asc+activation;
}
function engineAspectTone(name){
 if(name==='trigone'||name==='sextile')return 'support';
 if(name==='carré'||name==='opposition')return 'challenge';
 return 'intensify';
}
function engineRelevantTransits(a,analysis){
 const focus=engineFocusPlanets(analysis.dominant.key);
 const all=transitData(a);
 const relevant=all.filter(hit=>focus.includes(hit.tr)||focus.includes(hit.na));
 return (relevant.length?relevant:all).slice(0,3);
}
function engineTransitParagraph(a,analysis,en){
 const hits=engineRelevantTransits(a,analysis);
 if(!hits.length)return en?'No close major transit is detected by this simplified model. The sky therefore nuances the reading through its general climate rather than through a single trigger.':'Aucun transit majeur serré n’est détecté par ce modèle simplifié. Le ciel nuance donc le tirage par son climat général plutôt que par un déclencheur unique.';
 return hits.map(hit=>{
  const tone=engineAspectTone(hit.name);
  const link=(en?'The transit of ':'Le transit de ')+'<b>'+readingEscape(planetName(hit.tr))+'</b> '+(en?'in ':'en ')+'<b>'+readingEscape(aspectName(hit.name))+'</b> '+(en?'to your ':'à votre ')+'<b>'+readingEscape(planetName(hit.na))+'</b>';
  if(en){
   if(tone==='support')return link+' symbolically facilitates expression of the theme.';
   if(tone==='challenge')return link+' complicates it and calls for adjustment, patience or clarification.';
   return link+' intensifies it without deciding the outcome.';
  }
  if(tone==='support')return link+' facilite symboliquement l’expression du thème.';
  if(tone==='challenge')return link+' le complique et demande ajustement, patience ou clarification.';
  return link+' l’intensifie sans décider de l’issue.';
 }).join(' ');
}
function engineConvergenceParagraph(a,analysis,en){
 const interactions=analysis.interactions;
 const confirmations=interactions.filter(item=>item.type==='confirmation'||item.type==='reinforcement').length;
 const tensions=interactions.filter(item=>item.type==='contradiction').length;
 if(!a){
  if(en)return 'Without a prepared birth chart, the clearest convergence comes from the cards themselves: '+confirmations+' confirmation(s) and '+tensions+' contradiction(s). The card trend remains the primary guide.';
  return 'Sans profil astral préparé, la convergence la plus claire vient des cartes elles-mêmes : '+confirmations+' confirmation(s) et '+tensions+' contradiction(s). La tendance du tirage reste le guide principal.';
 }
 const hits=engineRelevantTransits(a,analysis);
 const supportive=hits.filter(hit=>engineAspectTone(hit.name)==='support').length;
 const challenging=hits.filter(hit=>engineAspectTone(hit.name)==='challenge').length;
 const dominant=engineThemeLabel(analysis.dominant,en);
 if(en){
  if(supportive&&analysis.trend.score>0)return 'Cards and transits converge around '+dominant+'. This reinforces the symbolic climate of opening, but observable actions remain necessary for confirmation.';
  if(challenging&&analysis.trend.score>0)return 'The cards show an opening around '+dominant+', while the transits add friction. The result is a possible but slower and more conditional development.';
  if(supportive&&analysis.trend.score<0)return 'The sky provides some support, but the cards remain constrained around '+dominant+'. The transit does not erase the obstacle named by the spread.';
  if(challenging&&analysis.trend.score<0)return 'Cards and transits both call for caution around '+dominant+'. This convergence strengthens the need for clarity, without proving that a specific event will occur.';
  return 'The astrological climate mainly nuances the card theme of '+dominant+'. It describes how the situation may be experienced, not a fixed outcome.';
 }
 if(supportive&&analysis.trend.score>0)return 'Les cartes et les transits convergent autour de '+dominant+'. Cette convergence renforce symboliquement le climat d’ouverture, mais des actes observables restent nécessaires pour la confirmer.';
 if(challenging&&analysis.trend.score>0)return 'Les cartes montrent une ouverture autour de '+dominant+', tandis que les transits ajoutent une tension. L’évolution reste possible, mais plus lente et plus conditionnelle.';
 if(supportive&&analysis.trend.score<0)return 'Le ciel apporte un soutien, mais les cartes restent contraintes autour de '+dominant+'. Le transit n’efface pas l’obstacle nommé par le tirage.';
 if(challenging&&analysis.trend.score<0)return 'Les cartes et les transits invitent ensemble à la prudence autour de '+dominant+'. Cette convergence renforce le besoin de clarté sans prouver qu’un événement précis se produira.';
 return 'Le climat astrologique nuance surtout le thème des cartes autour de '+dominant+'. Il décrit la manière dont la situation peut être vécue, et non une issue fixée d’avance.';
}
function engineComplementarySentence(en){
 const parts=[];
 if(state.relation){
  const name=readingEscape(cardName(state.relation));
  const meaning=readingEscape(cardField(state.relation,'definition'));
  parts.push(en?'The Relationship card <b>'+name+'</b> identifies the role or type of connection to consider: '+meaning+' It does not identify a specific person by itself.':'La carte Relation <b>'+name+'</b> précise le rôle ou le type de lien à considérer : '+meaning+' Elle n’identifie pas à elle seule une personne précise.');
 }
 if(state.date){
  const name=readingEscape(cardName(state.date));
  const meaning=readingEscape(cardField(state.date,'definition'));
  parts.push(en?'The Timing card <b>'+name+'</b> suggests '+meaning+' This is a symbolic window rather than a guaranteed deadline.':'La carte Datation <b>'+name+'</b> suggère '+meaning+' Cette fenêtre reste symbolique et ne constitue pas une échéance garantie.');
 }
 return parts.join(' ');
}
function literalSynthesis(a){
 const en=state.lang==='en',analysis=engineAnalyze(state.draw||[]);
 if(!analysis.cards.length)return '';
 const stories=analysis.story.slice();
 const firstStory=stories.shift()||'';
 const secondStory=stories.join(' ')||analysis.trend.essential;
 const complement=engineComplementarySentence(en);
 const question=readingEscape(state.question||(en?'Open question':'Question ouverte'));
 const domain=readingEscape(en?(DOMAIN_EN[state.domain]||state.domain):state.domain);
 let html='<div class="story-reading" data-engine-version="'+INTERPRETATION_ENGINE_VERSION+'">';
 html+='<h3>'+(en?'Cristariva synthesis':'La synthèse de Cristariva')+'</h3>';
 html+='<div class="reading-context"><b>'+(en?'Question':'Question')+' :</b> « '+question+' »<br><b>'+(en?'Area':'Domaine')+' :</b> '+domain+'</div>';
 html+='<p>'+firstStory+'</p>';
 html+='<p>'+secondStory+(complement?' '+complement:'')+'</p>';
 if(a){
  html+='<h4>'+(en?'What do the planets say?':'Que disent les planètes ?')+'</h4>';
  html+='<p>'+engineNatalParagraph(a,analysis,en)+'</p>';
  html+='<p>'+engineTransitParagraph(a,analysis,en)+'</p>';
 }else{
  html+='<p class="muted">'+(en?'The birth chart has not been added; this synthesis is therefore based on the cards and their interactions.':'Le profil astral n’a pas été ajouté ; cette synthèse repose donc sur les cartes et leurs interactions.')+'</p>';
 }
 html+='<h4>'+(en?'Convergences':'Convergences')+'</h4>';
 html+='<p>'+engineConvergenceParagraph(a,analysis,en)+'</p>';
 html+='<div class="essential-trend"><h4>'+(en?'The essential trend':'La tendance essentielle')+'</h4><p>'+analysis.trend.essential+'</p></div></div>';
 return html;
}

function renderSynthesis(){
 if(!state.draw.length)return;
 const box=$('#synthesis');
 box.innerHTML=literalSynthesis(state.astro);
 box.classList.remove('hidden');
}

(function installInterpretationEngineStyles(){
 if(document.getElementById('cristariva-engine-v2-styles'))return;
 const style=document.createElement('style');
 style.id='cristariva-engine-v2-styles';
 style.textContent='.story-reading .story-step b{color:#6b4b1f}.story-reading h4{font:1.08rem Georgia,serif;margin:1.35em 0 .45em;color:#17324d}.story-reading .reading-context{padding:11px 13px;border-radius:12px;background:#fff;border:1px solid #e1d5c3}.story-reading .reading-meta{display:block;margin-top:7px;color:#6d7580;font-size:.78rem;line-height:1.45}.story-reading .reading-relations{margin:.45em 0 0;padding-left:1.2em}.story-reading .reading-relations li{margin:.55em 0;line-height:1.6}.story-reading .essential-trend{margin-top:16px;padding:16px 17px;border-radius:14px;background:#17324d;color:#f9f3e8}.story-reading .essential-trend h4{color:#f0d49c;margin:0 0 7px}.story-reading .essential-trend p{margin:0;color:#f9f3e8}';
 document.head.appendChild(style);
})();
