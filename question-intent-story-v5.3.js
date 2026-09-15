/* CRISTARIVA — récit guidé par l'intention de la question v5.3
   Pour les questions centrées sur les envies, désirs, souhaits ou aspirations,
   la question prime sur le vocabulaire générique du domaine de lecture. */
const CRISTARIVA_QUESTION_INTENT_STORY_VERSION='5.3';

function cr53Esc(value){
  try{return typeof cr52Esc==='function'?cr52Esc(value):typeof cr51Esc==='function'?cr51Esc(value):String(value??'');}
  catch(e){return String(value??'');}
}
function cr53Question(){return String(state?.question||'').replace(/\s+/g,' ').trim();}
function cr53IsDesireQuestion(q=cr53Question()){
  return /\b(envie\w*|désir\w*|desir\w*|souhait\w*|aspiration\w*|attente\w*|ce que je veux|ce que j['’]aimerais|want\w*|wish\w*|desire\w*|aspiration\w*)\b/i.test(String(q||''));
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
      if(/origin|family|begin|past|root|child/.test(hay))return 'your current desires are partly rooted in older experiences, early emotional models or needs formed long before the present situation';
      if(/joy|pleasure|happ/.test(hay))return 'what you want is strongly connected with the need to feel alive, light and genuinely pleased by what you are moving toward';
      return 'the first card points to what has been shaping your desires beneath the surface';
    }
    if(role==='obstacle'){
      if(/joy|pleasure|happ/.test(hay))return 'the difficulty may be to distinguish a deep desire from the attraction of what feels pleasant, reassuring or exciting in the moment';
      if(/fear|block|delay|stagn|doubt/.test(hay))return 'fear or hesitation can make it harder to admit what you really want or to move toward it clearly';
      if(/promise|illusion|lie|deceit|false/.test(hay))return 'part of the obstacle is the risk of confusing what is hoped for with what is genuinely possible or supported by facts';
      return 'the second card shows what can blur, postpone or complicate the recognition of what you really want';
    }
    if(role==='resource'){
      if(/promise|illusion|lie|deceit|false/.test(hay))return 'your strongest resource is discernment: your desires become clearer when you test promises, projections and imagined outcomes against what is actually happening';
      if(/truth|integr|honest|clear/.test(hay))return 'clarity and honesty about your real motivations help separate a genuine desire from a passing reaction';
      if(/joy|pleasure|happ/.test(hay))return 'pleasure itself becomes useful information when it is treated as a clue rather than as proof that something is right for you';
      return 'this card shows what can help you sort essential desires from impulses, fears or projections';
    }
    if(role==='evolution'){
      if(/break|percee|percée|opening|move|decision|unlock/.test(hay))return 'your desires can become easier to name and act on; something previously blocked may finally turn into a decision, an initiative or a clear expression of what you want';
      if(/change|transform|renew|birth/.test(hay))return 'what you want is changing form and may become more precise as an old expectation gives way to a more current desire';
      return 'the evolution points toward a clearer and more concrete relationship with what you want';
    }
    if(role==='outcome'){
      if(/integr|honest|coher|respect|trust/.test(hay))return 'the desires most likely to matter are those that remain consistent with your values, limits and sense of self-respect';
      if(/joy|pleasure|happ/.test(hay))return 'the final direction favours desires that bring genuine satisfaction rather than only temporary excitement';
      if(/truth|clear/.test(hay))return 'the synthesis asks you to keep only what still feels true once fantasy, pressure and expectation are removed';
      return 'the synthesis helps identify which desires remain coherent once the whole situation is considered';
    }
    return 'one aspect of what you want becomes clearer';
  }

  if(role==='origin'){
    if(/origine|famille|début|debut|passé|passe|racine|enfance/.test(hay))return 'vos envies actuelles prennent en partie racine dans des expériences anciennes, des modèles affectifs précoces ou des besoins construits bien avant la situation présente';
    if(/joie|plaisir|bonheur/.test(hay))return 'ce que vous désirez est fortement lié au besoin de retrouver de la joie, de la légèreté et un sentiment d’élan vivant';
    return 'la première carte montre ce qui nourrit vos envies en profondeur, avant même leur formulation consciente';
  }
  if(role==='obstacle'){
    if(/joie|plaisir|bonheur/.test(hay))return 'l’obstacle peut être de confondre une envie profonde avec l’attrait de ce qui procure immédiatement du plaisir, du réconfort ou de l’excitation';
    if(/peur|bloc|retard|stagn|doute/.test(hay))return 'une peur ou une hésitation peut compliquer la reconnaissance de ce que vous voulez réellement ou retarder le moment de l’assumer';
    if(/promesse|illusion|mensonge|tromper|fausse/.test(hay))return 'une partie de la difficulté consiste à distinguer ce que vous espérez de ce qui est réellement possible et confirmé par les faits';
    return 'la deuxième carte montre ce qui peut brouiller, freiner ou compliquer la reconnaissance de vos envies réelles';
  }
  if(role==='resource'){
    if(/promesse|illusion|mensonge|tromper|fausse/.test(hay))return 'votre force réside dans le discernement : vos envies deviennent plus claires lorsque vous confrontez promesses, projections et scénarios imaginés à ce qui se réalise réellement';
    if(/vérité|verite|intégr|integr|honnêt|honnet|clair/.test(hay))return 'la lucidité sur vos motivations permet de distinguer une envie authentique d’une réaction passagère ou d’une projection';
    if(/joie|plaisir|bonheur/.test(hay))return 'le plaisir devient une information utile s’il est considéré comme un indice de ce qui vous attire, et non comme la preuve qu’une voie vous convient forcément';
    return 'cette carte indique ce qui peut vous aider à trier vos envies essentielles des impulsions, des peurs ou des projections';
  }
  if(role==='evolution'){
    if(/percée|percee|débloc|debloc|ouverture|mouvement|décision|decision|conversation|rapprochement/.test(hay))return 'vos envies peuvent devenir plus faciles à nommer et à assumer : ce qui restait bloqué peut se transformer en décision, en initiative ou en expression plus directe de ce que vous voulez';
    if(/transformation|renouveau|naissance|changement/.test(hay))return 'ce que vous voulez est en train de changer de forme et peut devenir plus précis à mesure qu’une ancienne attente laisse place à une envie plus actuelle';
    return 'l’évolution va vers une relation plus claire et plus concrète avec ce que vous désirez réellement';
  }
  if(role==='outcome'){
    if(/intégr|integr|honnêt|honnet|cohér|coher|respect|fiable|confiance/.test(hay))return 'les envies qui ont le plus de valeur sont celles qui restent cohérentes avec vos valeurs, vos limites et le respect que vous vous devez';
    if(/joie|plaisir|bonheur/.test(hay))return 'la synthèse favorise les envies capables d’apporter une satisfaction réelle plutôt qu’une excitation seulement passagère';
    if(/vérité|verite|clair/.test(hay))return 'la synthèse vous conduit vers ce qui reste vrai une fois retirées les projections, les pressions et les attentes extérieures';
    return 'la synthèse permet de discerner les envies qui restent cohérentes lorsque l’ensemble du tirage est considéré';
  }
  return 'un aspect de ce que vous voulez devient plus clair';
}

function cr53DesireStory(cards,en=false){
  const roles=cards.length===1?['outcome']:
    cards.length===3?['origin','evolution','outcome']:
    ['origin','obstacle','resource','evolution','outcome'];
  const clauses=cards.slice(0,roles.length).map((c,i)=>cr53DesireClause(c,roles[i],en));
  if(en){
    if(cards.length===1)return `This card focuses directly on what you want. ${clauses[0].charAt(0).toUpperCase()+clauses[0].slice(1)}.`;
    if(cards.length===3)return `Your cards describe the movement of your desires rather than a relationship in itself. At first, ${clauses[0]}. Then, ${clauses[1]}. Finally, ${clauses[2]}. The reading therefore clarifies where your desires come from, how they are changing and which of them remain truly aligned with you.`;
    return `Your cards tell a coherent story about your desires. At first, ${clauses[0]}. The main obstacle is that ${clauses[1]}. Your strongest support is that ${clauses[2]}. From there, ${clauses[3]}. Finally, ${clauses[4]}. The overall reading is therefore about clarifying what you truly want and separating it from habit, immediate attraction or projection.`;
  }
  if(cards.length===1)return `Cette carte éclaire directement ce que vous désirez. ${clauses[0].charAt(0).toUpperCase()+clauses[0].slice(1)}.`;
  if(cards.length===3)return `Vos cartes décrivent l’évolution de vos envies plutôt qu’un lien en lui-même. Au départ, ${clauses[0]}. Puis, ${clauses[1]}. Enfin, ${clauses[2]}. Le tirage précise ainsi d’où viennent vos envies, comment elles évoluent et lesquelles restent réellement alignées avec vous.`;
  return `Vos cartes racontent une histoire cohérente autour de vos envies. Au départ, ${clauses[0]}. L’obstacle principal est que ${clauses[1]}. Votre force réside dans le fait que ${clauses[2]}. À partir de là, ${clauses[3]}. Enfin, ${clauses[4]}. Le tirage parle donc avant tout de la clarification de ce que vous voulez réellement, en séparant le désir profond de l’habitude, de l’attrait immédiat ou de la projection.`;
}

const cr53BaseStoryInterpretation=typeof storyInterpretation==='function'?storyInterpretation:null;
if(cr53BaseStoryInterpretation){
  storyInterpretation=function(cards){
    if(!Array.isArray(cards)||!cards.length)return '';
    const q=cr53Question(),en=state?.lang==='en';
    if(cr53IsDesireQuestion(q)){
      const question=`<p class="reading-question">${en?'Your question':'Votre question'} : « ${cr53Esc(q)} »</p>`;
      const story=cr53DesireStory(cards,en).replace(/\s+/g,' ').trim();
      return `<div class="story-reading" data-story-engine="${CRISTARIVA_QUESTION_INTENT_STORY_VERSION}"><h3>${en?'The story told by your cards':'L’histoire racontée par vos cartes'}</h3>${question}<p class="story-continuous">${story}</p></div>`;
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
