/* CRISTARIVA — récit fluide sans noms de cartes v5.1
   Le récit transforme les cinq positions en une histoire continue.
   Les noms des cartes restent visibles dans le tirage, mais disparaissent du récit lui-même. */
const CRISTARIVA_FLUID_STORY_VERSION='5.1';

function cr51Esc(value){
  try{return typeof readingEscape==='function'?readingEscape(String(value??'')):String(value??'').replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  catch(e){return String(value??'');}
}
function cr51Rx(value){return String(value||'').replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
function cr51RawName(card,en=false){return String(en?(card?.en?.name||card?.name||''):(card?.name||''));}
function cr51Family(card,en=false){
  try{if(typeof cn5Family==='function')return cn5Family(card,en);}catch(e){}
  return 'neutral';
}
function cr51Field(card,scope,en=false){
  try{if(typeof cn5Field==='function')return cn5Field(card,scope,en);}catch(e){}
  const loc=en?(card?.en||{}):(card||{});
  if(scope==='work')return loc.reading_professionnel||loc.meaning||loc.definition||'';
  if(scope==='relation')return loc.reading_relationnel||loc.meaning||loc.definition||'';
  return loc.reading_spirituel||loc.meaning||loc.definition||'';
}
function cr51Replacement(card,en=false){
  const f=cr51Family(card,en);
  if(en){
    return {past:'what comes back from the past',tension:'this tension',bond:'the bond',insight:'this new understanding',movement:'the movement',change:'the change underway',ground:'a steadier inner position',ambiguity:'the uncertainty',opening:'the opening',neutral:'this element'}[f]||'this element';
  }
  return {past:'ce qui revient du passé',tension:'cette tension',bond:'le lien',insight:'cette prise de conscience',movement:'le mouvement',change:'la transformation en cours',ground:'un repère intérieur plus stable',ambiguity:'l’incertitude',opening:'l’ouverture',neutral:'cet élément'}[f]||'cet élément';
}
function cr51Meaning(card,scope,en=false){
  let text=String(cr51Field(card,scope,en)||'').replace(/\s+/g,' ').trim();
  if(!text)return en?'The situation is still taking shape.':'La situation est encore en train de se définir.';
  text=text.replace(/^(?:Dans (?:une relation|le travail|le cadre [^,]+)|Sur le plan [^,]+),\s*/i,'');
  text=text.replace(/^(?:In (?:a relationship|the workplace|the professional context|the relational context|the spiritual context)|On (?:a general|an inner|a spiritual) level),\s*/i,'');

  const raw=cr51RawName(card,en);
  if(raw){
    const repl=cr51Replacement(card,en);
    const art=en?'(?:the|a|an)?\\s*':'(?:le|la|les|l[’\']|un|une|du|des|de la)?\\s*';
    try{text=text.replace(new RegExp('\\b'+art+cr51Rx(raw)+'\\b','gi'),repl);}catch(e){}
  }

  if(!en){
    text=text
      .replace(/^choisit\b/i,'vous conduit à choisir')
      .replace(/^invite\s+à\b/i,'vous invite à')
      .replace(/^demande\s+de\b/i,'vous demande de')
      .replace(/^demande\s+à\b/i,'vous demande à')
      .replace(/^aide\s+à\b/i,'vous aide à')
      .replace(/^rappelle\b/i,'vous rappelle')
      .replace(/^montre\b/i,'la situation montre')
      .replace(/^indique\b/i,'cela indique')
      .replace(/^parle\b/i,'cela parle')
      .replace(/^met\b/i,'cela met')
      .replace(/^favorise\b/i,'cela favorise')
      .replace(/^ramène\b/i,'cela ramène')
      .replace(/^force\b/i,'cela oblige');
  }
  text=text.replace(/^\s*[:;,.—-]+\s*/,'').trim();
  if(text&&!/[.!?]$/.test(text))text+='.';
  if(text)text=text.charAt(0).toLocaleUpperCase()+text.slice(1);
  return cr51Esc(text);
}
function cr51Scope(){
  const focus=typeof preciseQuestionFocus==='function'?preciseQuestionFocus():'life';
  try{if(typeof cn5Scope==='function')return cn5Scope(focus);}catch(e){}
  const d=String(state?.domain||'').toLowerCase(),q=String(state?.question||'').toLowerCase();
  if(/profession|travail|emploi|projet|carri|business|work|career|job/.test(d+' '+q))return 'work';
  if(/relation|amour|couple|sentiment|romant|sex|intimit|rencontr|love|partner/.test(d+' '+q))return 'relation';
  return 'spirit';
}
function cr51Opening(scope,en=false){
  const q=String(state?.question||'').toLowerCase();
  if(en){
    if(scope==='relation')return /meet|encounter|new person/.test(q)?'The coming encounters seem to unfold as a sequence rather than as one immediate certainty. What matters is how one stage prepares the next.':'The relationship story develops in stages, with each movement changing the meaning of what came before.';
    if(scope==='work')return 'The situation develops through a sequence of practical shifts rather than one single decisive event.';
    return 'The reading describes an inner movement that becomes clearer as one stage leads naturally into the next.';
  }
  if(scope==='relation')return /rencontr|nouvel|nouveau|prochain/.test(q)?'Les prochaines rencontres semblent se dessiner par étapes plutôt que sous la forme d’une évidence immédiate. Ce qui compte surtout est la manière dont chaque mouvement prépare le suivant.':'La situation relationnelle semble évoluer par étapes, chacune modifiant progressivement le sens de ce qui précède.';
  if(scope==='work')return 'La situation semble avancer par étapes successives : chaque mouvement prépare le suivant et modifie peu à peu les conditions de la suite.';
  return 'Le tirage décrit un mouvement intérieur qui se précise progressivement, chaque étape préparant naturellement la suivante.';
}
function cr51Bridge(role,family,en=false){
  if(en){
    const map={
      origin:{past:'At first, an older thread still shapes the situation.',tension:'The story begins in a climate that is already under pressure.',bond:'At first, the need for connection is central.',insight:'At first, a clearer understanding begins to emerge.',movement:'The story starts with a need to move forward.',change:'The starting point is already a turning point.',ground:'At first, you approach the situation with more distance and steadiness.',ambiguity:'At first, the situation is not completely readable.',opening:'The story begins with a genuine opening.',neutral:'At first, one element sets the tone for everything that follows.'},
      obstacle:{past:'Very quickly, however, something unfinished from the past complicates that first movement.',tension:'That first direction soon meets resistance.',bond:'The first difficulty appears in the way the connection is experienced.',insight:'The complication becomes clearer as another truth comes into view.',movement:'The difficulty then concerns pace, direction or the next step.',change:'The obstacle is that the situation is already changing faster than expected.',ground:'What slows things down is the need to find firmer ground.',ambiguity:'The first movement soon becomes less straightforward.',opening:'Even this opening comes with a condition that cannot be ignored.',neutral:'Very quickly, however, another factor changes the balance.'},
      resource:{past:'The way forward then depends on understanding what is still active from the past.',tension:'The point of support comes from facing the tension instead of trying to bypass it.',bond:'The situation finds support in what can genuinely be shared or reciprocated.',insight:'The turning point comes from seeing more clearly what is really happening.',movement:'From there, the situation can regain momentum.',change:'The resource lies in accepting that a real transition is underway.',ground:'The most useful support is to recover a steadier and more coherent position.',ambiguity:'The way forward is to look directly at what remains uncertain.',opening:'A more constructive opening then becomes possible.',neutral:'A point of support then appears and changes the direction of the story.'},
      evolution:{past:'From there, something familiar or unfinished comes back into the present.',tension:'From there, the emotional or practical intensity rises.',bond:'From there, the situation moves toward a more tangible connection.',insight:'From there, the way you understand the situation changes.',movement:'Little by little, the story begins to move again.',change:'From there, the situation enters a genuinely new phase.',ground:'From there, a clearer inner axis is restored.',ambiguity:'From there, part of the situation remains unresolved.',opening:'From there, the situation becomes more favourable.',neutral:'From there, the direction of the story changes.'},
      outcome:{past:'The final movement brings an older theme back one last time.',tension:'The ending is not completely fluid and introduces a real point of resistance.',bond:'The final movement concentrates on the quality and reality of the connection.',insight:'The conclusion becomes clearer as the situation is understood differently.',movement:'The final movement gives the situation a more definite direction.',change:'The story ends at a genuine turning point.',ground:'The conclusion seeks something more stable, coherent and sustainable.',ambiguity:'The conclusion remains partly open because not everything is settled yet.',opening:'The final movement creates a clearer opening.',neutral:'The final movement gives the whole sequence its meaning.'}
    };
    return map[role]?.[family]||map[role]?.neutral||'';
  }
  const map={
    origin:{past:'Au départ, un fil ancien continue d’influencer la situation.',tension:'Dès le début, le climat porte déjà une tension qui ne peut pas être ignorée.',bond:'Au départ, le besoin de lien occupe une place centrale.',insight:'Au départ, une compréhension plus claire commence à émerger.',movement:'Le premier mouvement pousse déjà vers l’avant.',change:'Le point de départ est déjà un moment de bascule.',ground:'Vous abordez d’abord cette période avec davantage de recul et de stabilité intérieure.',ambiguity:'Au départ, la situation reste difficile à lire d’un seul regard.',opening:'Le récit s’ouvre sur une possibilité réelle.',neutral:'Au départ, un premier élément donne le ton à tout ce qui suit.'},
    obstacle:{past:'Très vite pourtant, quelque chose d’inachevé dans le passé vient compliquer ce premier mouvement.',tension:'Cette première direction rencontre rapidement une résistance.',bond:'La première difficulté se joue alors dans la manière dont le lien est vécu.',insight:'La complication devient plus lisible lorsqu’un autre aspect de la situation apparaît.',movement:'La difficulté porte ensuite sur le rythme, la direction ou la prochaine étape.',change:'L’obstacle tient au fait que la situation se transforme déjà plus vite que prévu.',ground:'Ce qui ralentit la suite est le besoin de retrouver un terrain plus solide.',ambiguity:'Très vite, ce premier mouvement devient moins simple qu’il n’y paraissait.',opening:'Même cette ouverture comporte une condition qu’il faudra prendre en compte.',neutral:'Très vite pourtant, un autre facteur vient modifier cet équilibre.'},
    resource:{past:'Pour avancer, il faut alors comprendre ce qui reste encore actif dans ce qui a déjà été vécu.',tension:'Le point d’appui consiste à regarder la tension en face plutôt qu’à chercher à la contourner.',bond:'La situation trouve alors son appui dans ce qui peut réellement être partagé ou réciproque.',insight:'Le tournant vient d’une compréhension plus précise de ce qui se joue réellement.',movement:'À partir de là, la situation peut retrouver de l’élan.',change:'La ressource consiste à accepter qu’une véritable transition soit déjà engagée.',ground:'Le point d’appui le plus utile est de retrouver une position plus stable et plus cohérente.',ambiguity:'Pour avancer, il devient nécessaire de regarder directement ce qui reste incertain.',opening:'Une ouverture plus constructive peut alors apparaître.',neutral:'Un point d’appui se dégage alors et change la direction du récit.'},
    evolution:{past:'C’est alors qu’un élément familier ou inachevé revient dans le présent.',tension:'À partir de là, l’intensité émotionnelle ou concrète augmente.',bond:'À partir de là, la situation se rapproche d’un lien plus tangible.',insight:'À partir de là, votre manière de comprendre la situation se transforme.',movement:'Peu à peu, l’histoire se remet réellement en mouvement.',change:'À partir de là, la situation entre dans une phase véritablement nouvelle.',ground:'À partir de là, un axe intérieur plus clair se réinstalle.',ambiguity:'À partir de là, une part de la situation reste encore en suspens.',opening:'À partir de là, l’évolution devient plus favorable.',neutral:'À partir de là, la direction de l’histoire change.'},
    outcome:{past:'Le dernier mouvement ramène une dernière fois un thème ancien au premier plan.',tension:'La conclusion n’est toutefois pas parfaitement fluide et fait apparaître une résistance réelle.',bond:'Le dernier mouvement concentre l’enjeu sur la qualité et la réalité du lien.',insight:'La conclusion devient plus claire à mesure que la situation est comprise autrement.',movement:'Le dernier mouvement donne une direction plus nette à la situation.',change:'L’histoire se termine sur un véritable tournant.',ground:'La conclusion cherche quelque chose de plus stable, plus cohérent et plus durable.',ambiguity:'La conclusion reste en partie ouverte, car tout n’est pas encore tranché.',opening:'Le dernier mouvement ouvre plus clairement la situation.',neutral:'Le dernier mouvement donne son sens à l’ensemble de la séquence.'}
  };
  return map[role]?.[family]||map[role]?.neutral||'';
}
function cr51Closing(scope,finalFamily,en=false){
  if(en){
    if(scope==='relation'){
      if(finalFamily==='tension')return 'The significant encounter suggested here therefore looks less like an effortless arrival than a bond that reveals what still needs to be clarified, negotiated or overcome before it can truly move forward.';
      if(finalFamily==='past')return 'The important encounter may therefore carry a strong sense of familiarity or reconnect you with something unfinished, but its value will depend on what is actually different this time.';
      if(finalFamily==='bond'||finalFamily==='opening')return 'The overall movement is favourable to a meaningful connection, provided what begins is confirmed by mutual and consistent actions.';
      return 'The significance of the encounter will therefore come less from the first impression than from what the connection gradually becomes in concrete terms.';
    }
    if(scope==='work')return finalFamily==='tension'?'Progress remains possible, but it will depend on how clearly the obstacles are identified and handled rather than on speed alone.':'The project can move forward if each stage is turned into a concrete decision rather than remaining only a possibility.';
    return finalFamily==='tension'?'The message is therefore not that every difficulty disappears, but that the upheaval itself can reveal what now needs to be understood or transformed.':'The final meaning lies in what this sequence helps you understand and integrate, rather than in one isolated sign.';
  }
  if(scope==='relation'){
    if(finalFamily==='tension')return 'La rencontre significative qui se dessine semble donc moins être une arrivée simple et immédiatement évidente qu’un lien capable de révéler ce qui doit encore être clarifié, négocié ou dépassé avant de pouvoir réellement avancer.';
    if(finalFamily==='past')return 'La rencontre importante peut ainsi porter une forte impression de familiarité ou réveiller quelque chose d’inachevé, mais sa valeur dépendra surtout de ce qui sera réellement différent cette fois-ci.';
    if(finalFamily==='bond'||finalFamily==='opening')return 'L’ensemble reste favorable à une rencontre qui peut compter, à condition que ce qui commence trouve ensuite une confirmation réciproque et régulière dans les actes.';
    return 'L’importance de la rencontre se jouera donc moins dans la première impression que dans ce que le lien deviendra progressivement dans la réalité.';
  }
  if(scope==='work')return finalFamily==='tension'?'La progression reste possible, mais elle dépendra davantage de la manière dont les obstacles seront identifiés et traités que de la vitesse d’exécution.':'Le projet peut avancer si chaque étape débouche sur une décision concrète plutôt que de rester à l’état de possibilité.';
  return finalFamily==='tension'?'Le message n’est donc pas que toute difficulté disparaît, mais que le bouleversement lui-même peut révéler ce qui demande désormais à être compris ou transformé.':'Le sens final se trouve surtout dans ce que cette succession d’étapes vous aide à comprendre et à intégrer, plutôt que dans un signe isolé.';
}

function storyInterpretation(cards){
  if(!Array.isArray(cards)||!cards.length)return '';
  const en=state?.lang==='en',scope=cr51Scope(),q=String(state?.question||'').trim();
  const question=q?`<p class="reading-question">${en?'Your question':'Votre question'} : « ${cr51Esc(q)} »</p>`:'';
  let story=cr51Opening(scope,en);

  if(cards.length===1){
    const c=cards[0],f=cr51Family(c,en);
    story+=' '+cr51Bridge('origin',f,en)+' '+cr51Meaning(c,scope,en)+' '+cr51Closing(scope,f,en);
  }else if(cards.length===3){
    const roles=['origin','evolution','outcome'];
    cards.slice(0,3).forEach((c,i)=>{story+=' '+cr51Bridge(roles[i],cr51Family(c,en),en)+' '+cr51Meaning(c,scope,en);});
    story+=' '+cr51Closing(scope,cr51Family(cards[2],en),en);
  }else{
    const roles=['origin','obstacle','resource','evolution','outcome'];
    cards.slice(0,5).forEach((c,i)=>{story+=' '+cr51Bridge(roles[i],cr51Family(c,en),en)+' '+cr51Meaning(c,scope,en);});
    story+=' '+cr51Closing(scope,cr51Family(cards[Math.min(4,cards.length-1)],en),en);
  }

  story=story.replace(/\s+/g,' ').replace(/\.\s+([a-zà-ÿ])/g,(m,c)=>'. '+c.toLocaleUpperCase()).trim();
  return `<div class="story-reading" data-story-engine="${CRISTARIVA_FLUID_STORY_VERSION}"><h3>${en?'The story told by your cards':'L’histoire racontée par vos cartes'}</h3>${question}<p class="story-continuous">${story}</p></div>`;
}
function interpretation(cards){return storyInterpretation(cards);}

(function cr51Refresh(){
  try{
    if(state?.draw?.length){
      const candidates=['interpretation','readingResult','story','result'];
      for(const id of candidates){
        const el=document.getElementById(id);
        if(el&&/L’histoire racontée par vos cartes|The story told by your cards/.test(el.textContent||'')){el.innerHTML=storyInterpretation(state.draw);break;}
      }
    }
  }catch(e){}
})();
