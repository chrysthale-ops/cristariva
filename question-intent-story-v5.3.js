/* CRISTARIVA — récit guidé par l'intention de la question v5.4
   La question prime sur le vocabulaire brut du domaine :
   - envies / désirs : le récit parle de ce que le consultant veut vraiment ;
   - étapes / trajectoire de vie : les cartes deviennent des phases successives,
     même lorsque le domaine choisi est Relations. */
const CRISTARIVA_QUESTION_INTENT_STORY_VERSION='5.4';

function cr53Esc(value){
  try{return typeof cr52Esc==='function'?cr52Esc(value):typeof cr51Esc==='function'?cr51Esc(value):String(value??'');}
  catch(e){return String(value??'');}
}
function cr53Question(){return String(state?.question||'').replace(/\s+/g,' ').trim();}
function cr53IsDesireQuestion(q=cr53Question()){
  return /\b(envie\w*|désir\w*|desir\w*|souhait\w*|aspiration\w*|attente\w*|ce que je veux|ce que j['’]aimerais|want\w*|wish\w*|desire\w*|aspiration\w*)\b/i.test(String(q||''));
}
function cr54IsLifeStageQuestion(q=cr53Question()){
  const s=String(q||'').toLowerCase();
  return /\b(prochaine?s?\s+étape?s?|étape?s?\s+de\s+(?:ma|la)\s+vie|suite\s+de\s+ma\s+vie|avenir\s+de\s+ma\s+vie|chemin\s+de\s+vie|trajectoire|parcours\s+de\s+vie|évolution\s+de\s+ma\s+vie)\b/i.test(s);
}
function cr53CardName(card,en=false){return String(en?(card?.en?.name||card?.name||''):(card?.name||''));}
function cr53CardText(card,en=false){
  try{
    const scope=typeof cr51Scope==='function'?cr51Scope():'spirit';
    const loc=en?(card?.en||{}):(card||{});
    const text=scope==='work'?(loc.reading_professionnel||loc.meaning||loc.definition||''):
      scope==='relation'?(loc.reading_relationnel||loc.meaning||loc.definition||''):
      (loc.reading_spirituel||loc.meaning||loc.definition||'');
    return String(text||'').replace(/\s+/g,' ').trim();
  }catch(e){return '';}
}
function cr53Hay(card,en=false){return (cr53CardName(card,en)+' '+cr53CardText(card,en)).toLowerCase();}

function cr53DesireClause(card,role,en=false){
  const hay=cr53Hay(card,en);
  if(en){
    if(role==='origin'){
      if(/origin|family|begin|past|root|child/.test(hay))return 'your current desires are partly rooted in older experiences or needs formed before the present situation';
      if(/joy|pleasure|happ/.test(hay))return 'what you want is strongly connected with the need to feel alive, light and genuinely pleased by what you are moving toward';
      return 'the first card points to what has been shaping your desires beneath the surface';
    }
    if(role==='obstacle'){
      if(/joy|pleasure|happ/.test(hay))return 'it may be difficult to distinguish a deep desire from the attraction of what feels pleasant or reassuring in the moment';
      if(/fear|block|delay|stagn|doubt/.test(hay))return 'fear or hesitation can make it harder to admit what you really want';
      if(/promise|illusion|lie|deceit|false/.test(hay))return 'part of the difficulty is separating what is hoped for from what is genuinely possible';
      return 'something can still blur or postpone the recognition of what you really want';
    }
    if(role==='resource'){
      if(/promise|illusion|lie|deceit|false/.test(hay))return 'discernment is your strongest resource: compare promises and projections with what is actually happening';
      if(/truth|integr|honest|clear/.test(hay))return 'clarity about your motivations helps separate a genuine desire from a passing reaction';
      return 'this card shows what helps you sort essential desires from impulse or projection';
    }
    if(role==='evolution'){
      if(/break|percee|percée|opening|move|decision|unlock/.test(hay))return 'your desires can become easier to name and act on, turning something previously blocked into a clearer decision or initiative';
      if(/change|transform|renew|birth/.test(hay))return 'what you want is changing form and becoming more precise';
      return 'the evolution points toward a clearer understanding of what you truly want';
    }
    if(role==='outcome'){
      if(/integr|honest|coher|respect|trust/.test(hay))return 'the desires that matter most are those that remain consistent with your values and self-respect';
      if(/joy|pleasure|happ/.test(hay))return 'the final direction favours desires that bring genuine satisfaction rather than only temporary excitement';
      return 'the synthesis helps identify which desires remain coherent once the whole situation is considered';
    }
    return 'one aspect of what you want becomes clearer';
  }
  if(role==='origin'){
    if(/origine|famille|début|debut|passé|passe|racine|enfance/.test(hay))return 'vos envies actuelles prennent en partie racine dans des expériences anciennes ou des besoins construits avant la situation présente';
    if(/joie|plaisir|bonheur/.test(hay))return 'ce que vous désirez est fortement lié au besoin de retrouver de la joie, de la légèreté et un sentiment d’élan vivant';
    return 'la première carte montre ce qui nourrit vos envies en profondeur';
  }
  if(role==='obstacle'){
    if(/joie|plaisir|bonheur/.test(hay))return 'il peut être difficile de distinguer une envie profonde de l’attrait de ce qui procure immédiatement du plaisir ou du réconfort';
    if(/peur|bloc|retard|stagn|doute/.test(hay))return 'une peur ou une hésitation peut compliquer la reconnaissance de ce que vous voulez réellement';
    if(/promesse|illusion|mensonge|tromper|fausse/.test(hay))return 'une partie de la difficulté consiste à distinguer ce que vous espérez de ce qui est réellement possible';
    return 'quelque chose peut encore brouiller ou freiner la reconnaissance de vos envies réelles';
  }
  if(role==='resource'){
    if(/promesse|illusion|mensonge|tromper|fausse/.test(hay))return 'le discernement devient votre meilleur appui : vos envies se clarifient lorsque vous confrontez les projections à ce qui se réalise réellement';
    if(/vérité|verite|intégr|integr|honnêt|honnet|clair/.test(hay))return 'la lucidité sur vos motivations permet de distinguer une envie authentique d’une réaction passagère';
    return 'vous disposez d’un point d’appui pour trier vos envies essentielles des impulsions ou des projections';
  }
  if(role==='evolution'){
    if(/percée|percee|débloc|debloc|ouverture|mouvement|décision|decision|conversation|rapprochement/.test(hay))return 'vos envies peuvent devenir plus faciles à nommer et à assumer : ce qui restait bloqué peut se transformer en décision ou en initiative';
    if(/transformation|renouveau|naissance|changement/.test(hay))return 'ce que vous voulez change de forme et devient progressivement plus précis';
    return 'vous avancez vers une compréhension plus claire et plus concrète de ce que vous désirez réellement';
  }
  if(role==='outcome'){
    if(/intégr|integr|honnêt|honnet|cohér|coher|respect|fiable|confiance/.test(hay))return 'les envies qui ont le plus de valeur sont celles qui restent cohérentes avec vos valeurs, vos limites et le respect que vous vous devez';
    if(/joie|plaisir|bonheur/.test(hay))return 'la synthèse favorise les envies capables d’apporter une satisfaction réelle plutôt qu’une excitation passagère';
    return 'la synthèse permet de discerner les envies qui restent cohérentes lorsque l’ensemble du tirage est considéré';
  }
  return 'un aspect de ce que vous voulez devient plus clair';
}

function cr53DesireStory(cards,en=false){
  const roles=cards.length===1?['outcome']:cards.length===3?['origin','evolution','outcome']:['origin','obstacle','resource','evolution','outcome'];
  const clauses=cards.slice(0,roles.length).map((c,i)=>cr53DesireClause(c,roles[i],en));
  if(en){
    if(cards.length===1)return `This card focuses directly on what you want. ${clauses[0].charAt(0).toUpperCase()+clauses[0].slice(1)}.`;
    if(cards.length===3)return `Your cards describe the movement of your desires rather than a relationship in itself. At first, ${clauses[0]}. Then, ${clauses[1]}. Finally, ${clauses[2]}.`;
    return `Your cards tell a coherent story about your desires. At first, ${clauses[0]}. Then, ${clauses[1]}. What helps you most is this: ${clauses[2]}. From there, ${clauses[3]}. Finally, ${clauses[4]}.`;
  }
  if(cards.length===1)return `Cette carte éclaire directement ce que vous désirez. ${clauses[0].charAt(0).toUpperCase()+clauses[0].slice(1)}.`;
  if(cards.length===3)return `Vos cartes décrivent l’évolution de vos envies, et non un lien en lui-même. Au départ, ${clauses[0]}. Puis, ${clauses[1]}. Enfin, ${clauses[2]}.`;
  return `Vos cartes racontent une histoire cohérente autour de vos envies. Au départ, ${clauses[0]}. Ensuite, ${clauses[1]}. Votre meilleur appui apparaît alors : ${clauses[2]}. À partir de là, ${clauses[3]}. Enfin, ${clauses[4]}.`;
}

function cr54LifeStageClause(card,role,en=false){
  const hay=cr53Hay(card,en);
  if(en){
    if(/marker|reference|anchor|stability|regular|limit|stable/.test(hay))return role==='origin'?'the first stage is about recovering reliable bearings and deciding what deserves to remain stable in your life':'a clearer framework gives you firmer bearings for what comes next';
    if(/connection|contact|exchange|complicity|understood|closer/.test(hay))return 'the next phase opens through meaningful exchanges and a stronger sense of connection with others; in the relationship area, this can be one of the ways your life starts moving again';
    if(/heal|repair|peace|soothe|soft/.test(hay))return 'the movement ahead is one of emotional repair: what has been strained can gradually lose its weight and leave more room for calm, confidence and a lighter way forward';
    if(/change|transform|renew|birth|reset/.test(hay))return 'a new stage asks you to leave an older pattern behind and reorganise your life around what is becoming more relevant now';
    if(/choice|decision|direction/.test(hay))return 'the next stage becomes clearer through a decision that gives your trajectory a more definite direction';
    if(/joy|pleasure|happ/.test(hay))return 'a lighter stage can emerge, with more room for pleasure, spontaneity and experiences that restore momentum';
    if(/fear|block|delay|stagn/.test(hay))return 'this stage first asks you to work through what still slows or restrains you before the next movement can fully take shape';
    return role==='origin'?'the cards first point to the foundations from which the next chapter of your life is beginning':role==='outcome'?'the final card shows the quality your next stage is moving toward':'the middle card describes the transition currently reshaping the next part of your path';
  }
  if(/repère|repere|ancrage|stabil|régular|regular|limite|cadre|fiable/.test(hay))return role==='origin'?'la première étape consiste à retrouver des repères fiables et à préciser ce qui mérite désormais de rester stable dans votre vie':'un cadre plus clair vous redonne des points d’appui solides pour aborder la suite';
  if(/connexion|contact|échange|echange|complicit|compris|rapproch/.test(hay))return 'la phase suivante s’ouvre par des échanges plus significatifs et une plus grande disponibilité aux autres ; dans le domaine relationnel, ces contacts peuvent être l’un des moteurs de votre évolution, sans résumer à eux seuls toute la suite de votre vie';
  if(/guérison|guerison|répar|repar|apais|douceur|paix/.test(hay))return 'l’élan qui suit va vers une réparation émotionnelle : ce qui a été éprouvant peut perdre progressivement de son poids et laisser davantage de place à l’apaisement, à la confiance et à une manière plus légère d’avancer';
  if(/transformation|changement|renouveau|naissance|reset/.test(hay))return 'une nouvelle étape vous invite à laisser derrière vous un ancien fonctionnement pour réorganiser votre vie autour de ce qui devient maintenant plus juste ou plus actuel';
  if(/choix|décision|decision|direction/.test(hay))return 'la prochaine étape se précise à travers un choix capable de donner une direction plus nette à votre trajectoire';
  if(/joie|plaisir|bonheur/.test(hay))return 'une phase plus légère peut s’ouvrir, avec davantage de place pour le plaisir, la spontanéité et les expériences qui redonnent de l’élan';
  if(/peur|bloc|retard|stagn/.test(hay))return 'cette étape demande d’abord de traverser ce qui vous freine encore avant que la suite puisse réellement prendre forme';
  return role==='origin'?'les cartes montrent d’abord les bases à partir desquelles le prochain chapitre de votre vie commence à se construire':role==='outcome'?'la dernière carte indique la qualité vers laquelle la prochaine phase de votre vie cherche à évoluer':'la carte centrale décrit la transition qui façonne actuellement la suite de votre parcours';
}

function cr54LifeStageStory(cards,en=false){
  const roles=cards.length===1?['outcome']:cards.length===3?['origin','evolution','outcome']:['origin','obstacle','resource','evolution','outcome'];
  const clauses=cards.slice(0,roles.length).map((c,i)=>cr54LifeStageClause(c,roles[i],en));
  if(en){
    if(cards.length===1)return `This card describes the tone of your next life stage. ${clauses[0].charAt(0).toUpperCase()+clauses[0].slice(1)}.`;
    if(cards.length===3)return `Your cards describe three successive movements in the next part of your life. First, ${clauses[0]}. Then, ${clauses[1]}. Finally, ${clauses[2]}. The relationship domain indicates where some of these changes may be experienced, but it does not reduce your whole life path to a relationship story.`;
    return `Your cards describe a sequence of life stages. First, ${clauses[0]}. Then, ${clauses[1]}. A resource appears: ${clauses[2]}. From there, ${clauses[3]}. Finally, ${clauses[4]}.`;
  }
  if(cards.length===1)return `Cette carte décrit la tonalité de votre prochaine étape de vie. ${clauses[0].charAt(0).toUpperCase()+clauses[0].slice(1)}.`;
  if(cards.length===3)return `Vos cartes décrivent trois mouvements successifs dans la prochaine partie de votre vie. D’abord, ${clauses[0]}. Ensuite, ${clauses[1]}. Enfin, ${clauses[2]}. Le domaine relationnel indique ici l’un des terrains où ces changements peuvent se manifester, mais il ne réduit pas l’ensemble de votre trajectoire à une histoire de lien.`;
  return `Vos cartes décrivent une succession d’étapes dans votre vie. D’abord, ${clauses[0]}. Ensuite, ${clauses[1]}. Un point d’appui apparaît alors : ${clauses[2]}. À partir de là, ${clauses[3]}. Enfin, ${clauses[4]}.`;
}

const cr53BaseStoryInterpretation=typeof storyInterpretation==='function'?storyInterpretation:null;
if(cr53BaseStoryInterpretation){
  storyInterpretation=function(cards){
    if(!Array.isArray(cards)||!cards.length)return '';
    const q=cr53Question(),en=state?.lang==='en';
    let story='';
    if(cr54IsLifeStageQuestion(q))story=cr54LifeStageStory(cards,en);
    else if(cr53IsDesireQuestion(q))story=cr53DesireStory(cards,en);
    if(story){
      const question=`<p class="reading-question">${en?'Your question':'Votre question'} : « ${cr53Esc(q)} »</p>`;
      return `<div class="story-reading" data-story-engine="${CRISTARIVA_QUESTION_INTENT_STORY_VERSION}"><h3>${en?'The story told by your cards':'L’histoire racontée par vos cartes'}</h3>${question}<p class="story-continuous">${story.replace(/\s+/g,' ').trim()}</p></div>`;
    }
    return cr53BaseStoryInterpretation(cards);
  };
  interpretation=function(cards){return storyInterpretation(cards);};
}

(function cr53Refresh(){
  try{
    if(state?.draw?.length){
      const candidates=['reading','interpretation','readingResult','story','result'];
      for(const id of candidates){
        const el=document.getElementById(id);
        if(el&&/L’histoire racontée par vos cartes|The story told by your cards/.test(el.textContent||'')){el.innerHTML=storyInterpretation(state.draw);break;}
      }
    }
  }catch(e){}
})();
