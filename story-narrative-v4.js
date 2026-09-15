/* CRISTARIVA — moteur narratif littéraire v5.0
   Le récit ne juxtapose plus les définitions des cartes : il relie les cinq positions
   en une histoire continue, adaptée au domaine et à la question. Tous les noms des
   cartes tirées sont systématiquement mis en évidence en gras. */
const CRISTARIVA_STORY_ENGINE_VERSION='5.0';

function cn5Esc(value){
  try{return typeof readingEscape==='function'?readingEscape(String(value??'')):String(value??'').replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  catch(e){return String(value??'');}
}
function cn5Rx(value){return String(value||'').replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
function cn5RawName(card,en=false){return String(en?(card?.en?.name||card?.name||''):(card?.name||''));}
function cn5Name(card,en=false){return `<strong>${cn5Esc(cn5RawName(card,en))}</strong>`;}
function cn5Scope(focus){
  const d=String(state?.domain||'').toLocaleLowerCase();
  const q=String(state?.question||'').toLocaleLowerCase();
  if(focus==='work'||focus==='money'||/profession|travail|emploi|carri[eè]re|projet|business|work|career|job/.test(d+' '+q))return 'work';
  if(['love','return','contact','sex'].includes(focus)||/relation|amour|couple|sentiment|romant|sexual|sexuel|intimit|love|partner/.test(d+' '+q))return 'relation';
  return 'spirit';
}
function cn5Field(card,scope,en=false){
  const loc=en?(card?.en||{}):(card||{});
  if(scope==='work')return loc.reading_professionnel||loc.meaning||loc.definition||'';
  if(scope==='relation')return loc.reading_relationnel||loc.meaning||loc.definition||'';
  return loc.reading_spirituel||loc.meaning||loc.definition||'';
}
function cn5Definition(card,scope,en=false){
  const loc=en?(card?.en||{}):(card||{});
  let text=String(loc.definition||cn5Field(card,scope,en)||'').replace(/\s+/g,' ').trim();
  if(!text)return en?'the situation is still taking shape':'la situation est encore en train de se définir';
  text=text.replace(/^(?:Dans (?:une relation|le travail|le cadre [^,]+)|Sur le plan [^,]+),\s*/i,'');
  text=text.replace(/^(?:In (?:a relationship|the workplace|the professional context|the relational context|the spiritual context)|On (?:a general|an inner|a spiritual) level),\s*/i,'');
  const raw=cn5RawName(card,en);
  if(raw){
    text=text.replace(new RegExp('^'+cn5Rx(raw)+'\\s*(?:indique|montre|parle|rappelle|invite|demande|signale|met|représente|ramène|force|favorise|peut)?\\s*(?:que|à|de)?\\s*','i'),'');
  }
  const sentences=text.match(/[^.!?]+[.!?]?/g)||[text];
  text=sentences.slice(0,1).join(' ').trim();
  if(raw){
    const rx=new RegExp(cn5Rx(raw),'gi');
    const pieces=[];let last=0,m;
    while((m=rx.exec(text))){
      pieces.push(cn5Esc(text.slice(last,m.index)));
      pieces.push(`<strong>${cn5Esc(m[0])}</strong>`);
      last=m.index+m[0].length;
    }
    pieces.push(cn5Esc(text.slice(last)));
    return pieces.join('').replace(/\s+([,.;!?])/g,'$1').trim();
  }
  return cn5Esc(text);
}
function cn5Family(card,en=false){
  const n=cn5RawName(card,en).toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  if(/origine|memoire|regret|empreinte|ancien|passe|retour|cycle|ex\b/.test(n))return 'past';
  if(/tempete|conflit|rupture|trahison|blocage|impasse|perte|echec|peur|rejet|refus|opposition|instabilite|epuisement|abandon|mensonge|manipulation|emprise|desillusion|incompatibilite|fausse promesse|eloignement/.test(n))return 'tension';
  if(/amour|union|connexion|reciprocite|cohesion|soutien|joie|bonheur|paix|reconciliation|sincerite|appartenance|passion/.test(n))return 'bond';
  if(/clarte|communication|ecoute|indice|signe|intuition|vision|perspective|eveil|lune|transmission/.test(n))return 'insight';
  if(/direction|cap\b|voie|progression|choix|opportunite|percee|envol|rythme/.test(n))return 'movement';
  if(/naissance|renouveau|transformation|mutation|eclosion|transition|liberation/.test(n))return 'change';
  if(/stabilite|ancrage|integrite|sagesse|maitrise|equite|juste distance|protection|guerison|patience|repere/.test(n))return 'ground';
  if(/projection|dissimulation|complexite|detour|dependance|jalousie|indifference/.test(n))return 'ambiguity';
  if(/succes|plaisir|abondance|providence/.test(n))return 'opening';
  return 'neutral';
}
function cn5Sentence(text){
  const s=String(text||'').trim();
  if(!s)return '';
  return /[.!?]$/.test(s)?s:s+'.';
}
function cn5QuestionKind(scope,q){
  const s=String(q||'').toLocaleLowerCase();
  if(scope==='spirit'&&/ange|anges|gardien|gardiens|guide|guides|protection|protege|protégé|soutien|spirituel|spirituelle/.test(s))return 'spiritual-support';
  if(scope==='relation'&&/sex|sexuel|sexuelle|intimit|desir|désir|physique/.test(s))return 'sexual';
  if(scope==='relation')return 'relation';
  if(scope==='work')return 'work';
  return 'spirit';
}
function cn5Opening(scope,q,en=false){
  const kind=cn5QuestionKind(scope,q);
  if(en){
    if(kind==='spiritual-support')return 'This reading presents the support you are asking about as a form of guidance that unfolds through a sequence of inner shifts rather than as one isolated sign.';
    if(kind==='sexual')return 'The cards describe a developing situation in which attraction, trust and concrete actions need to unfold in sequence rather than all at once.';
    if(kind==='relation')return 'The reading tells the story of a bond that changes through several stages, with each card altering what the previous one seemed to promise.';
    if(kind==='work')return 'The reading describes a project or professional situation that evolves by stages, where each step changes the conditions of the next one.';
    return 'The cards describe an inner path whose meaning becomes clearer as one stage leads into the next.';
  }
  if(kind==='spiritual-support')return 'Ce tirage présente le soutien que vous interrogez comme un accompagnement qui se révèle par étapes, plutôt que comme un signe unique et isolé.';
  if(kind==='sexual')return 'Le tirage raconte une situation qui se construit par étapes, où l’attirance, la confiance et les actes concrets doivent trouver leur place les uns après les autres.';
  if(kind==='relation')return 'Le tirage raconte l’évolution d’un lien en plusieurs temps : chaque carte transforme ce que la précédente semblait annoncer et fait avancer l’histoire.';
  if(kind==='work')return 'Le tirage raconte un projet ou une situation professionnelle qui avance par étapes, chacune modifiant les conditions de la suivante.';
  return 'Le tirage raconte un chemin intérieur dont le sens se précise progressivement, à mesure qu’une étape en entraîne une autre.';
}
function cn5Lead(card,role,en=false){
  const f=cn5Family(card,en),name=cn5Name(card,en);
  if(en){
    const map={
      origin:{past:`The story first turns toward the past with ${name}`,tension:`The story opens under the pressure of ${name}`,bond:`The story begins with a need for connection carried by ${name}`,insight:`The first light comes from ${name}`,movement:`The story begins with movement through ${name}`,change:`The story starts at a turning point marked by ${name}`,ground:`The starting point seeks stability through ${name}`,ambiguity:`At first, ${name} makes the situation harder to read`,opening:`The story opens with a favourable current through ${name}`,neutral:`The story begins with ${name}`},
      obstacle:{past:`The movement then turns back toward what came before with ${name}`,tension:`But ${name} interrupts the initial movement`,bond:`The difficulty becomes relational through ${name}`,insight:`The real complication becomes clearer through ${name}`,movement:`The obstacle concerns direction and timing through ${name}`,change:`The obstacle is that ${name} is already changing the situation`,ground:`What slows the story is the need for firmer ground shown by ${name}`,ambiguity:`The story becomes less straightforward with ${name}`,opening:`Even the apparent opening created by ${name} introduces a condition`,neutral:`The movement then meets ${name}`},
      resource:{past:`The resource comes from revisiting what has already been lived through ${name}`,tension:`Paradoxically, ${name} becomes the place where the tension can be recognised and worked through`,bond:`The point of support appears through the connection shown by ${name}`,insight:`The turning point comes from understanding what ${name} reveals`,movement:`The story regains momentum through ${name}`,change:`The resource is the capacity to change carried by ${name}`,ground:`The most solid point of support is ${name}`,ambiguity:`The resource is to look directly at the uncertainty shown by ${name}`,opening:`The story finds a genuine opening through ${name}`,neutral:`The point of support comes through ${name}`},
      evolution:{past:`From there, ${name} brings an earlier thread back into the present`,tension:`From there, ${name} raises the intensity`,bond:`From there, ${name} draws the situation toward greater connection`,insight:`From there, ${name} changes the way the situation is understood`,movement:`Little by little, ${name} puts the story back in motion`,change:`From there, ${name} makes the story shift into a new phase`,ground:`From there, ${name} restores a clearer axis`,ambiguity:`From there, ${name} keeps part of the situation open and unresolved`,opening:`From there, ${name} creates a more favourable development`,neutral:`From there, ${name} changes the direction of the story`},
      outcome:{past:`The final scene returns once more to what came before through ${name}`,tension:`The ending gains intensity through ${name}`,bond:`The story ends by concentrating on the bond through ${name}`,insight:`The conclusion becomes clearer through ${name}`,movement:`The final card gives the story a direction through ${name}`,change:`The story ends on a clear turning point with ${name}`,ground:`The ending seeks a firmer and more coherent position through ${name}`,ambiguity:`The ending remains partly open because of ${name}`,opening:`The final card opens the situation through ${name}`,neutral:`The story reaches its conclusion with ${name}`}
    };
    return map[role]?.[f]||map[role]?.neutral||name;
  }
  const map={
    origin:{past:`L’histoire se tourne d’abord vers le passé avec ${name}`,tension:`L’histoire s’ouvre sous la pression de ${name}`,bond:`L’histoire commence par un besoin de lien porté par ${name}`,insight:`La première lumière vient de ${name}`,movement:`L’histoire se met en marche avec ${name}`,change:`L’histoire commence sur un tournant marqué par ${name}`,ground:`Le point de départ cherche un appui solide avec ${name}`,ambiguity:`Dès le départ, ${name} rend la situation plus difficile à lire`,opening:`L’histoire s’ouvre sur un courant favorable avec ${name}`,neutral:`L’histoire commence avec ${name}`},
    obstacle:{past:`Le mouvement se retourne ensuite vers ce qui précède avec ${name}`,tension:`Mais ${name} vient casser l’élan initial`,bond:`La difficulté prend une dimension relationnelle avec ${name}`,insight:`La véritable complication devient plus lisible avec ${name}`,movement:`Le frein porte sur la direction ou le rythme avec ${name}`,change:`L’obstacle tient au fait que ${name} transforme déjà la situation`,ground:`Ce qui ralentit l’histoire est le besoin d’un terrain plus solide, montré par ${name}`,ambiguity:`Le récit devient moins simple avec ${name}`,opening:`Même l’ouverture portée par ${name} introduit une condition`,neutral:`Le mouvement rencontre ensuite ${name}`},
    resource:{past:`Le point d’appui vient de ce qui a déjà été vécu, à travers ${name}`,tension:`Paradoxalement, ${name} devient l’endroit où la tension peut être reconnue puis traversée`,bond:`Le point d’appui apparaît dans le lien montré par ${name}`,insight:`Le tournant vient de ce que ${name} permet de comprendre`,movement:`Le récit retrouve de l’élan grâce à ${name}`,change:`La ressource est la capacité de changement portée par ${name}`,ground:`Le point d’appui le plus solide se trouve dans ${name}`,ambiguity:`La ressource consiste à regarder en face l’incertitude montrée par ${name}`,opening:`Le récit trouve une véritable ouverture avec ${name}`,neutral:`Le point d’appui vient de ${name}`},
    evolution:{past:`À partir de là, ${name} ramène un fil ancien dans le présent`,tension:`À partir de là, ${name} fait monter l’intensité`,bond:`À partir de là, ${name} rapproche la situation d’un lien plus vivant`,insight:`À partir de là, ${name} change la manière de comprendre ce qui se joue`,movement:`Peu à peu, ${name} remet l’histoire en mouvement`,change:`À partir de là, ${name} fait basculer le récit dans une nouvelle phase`,ground:`À partir de là, ${name} redonne un axe plus clair`,ambiguity:`À partir de là, ${name} maintient une part d’incertitude`,opening:`À partir de là, ${name} ouvre une évolution plus favorable`,neutral:`À partir de là, ${name} modifie la direction de l’histoire`},
    outcome:{past:`La dernière scène ramène encore une fois vers le passé avec ${name}`,tension:`La conclusion gagne en intensité avec ${name}`,bond:`Le récit se termine en concentrant l’enjeu sur le lien avec ${name}`,insight:`La conclusion devient plus lisible avec ${name}`,movement:`La dernière carte donne une direction nette au récit avec ${name}`,change:`L’histoire se termine sur un véritable tournant avec ${name}`,ground:`La fin du récit cherche une position plus stable et plus cohérente avec ${name}`,ambiguity:`La conclusion reste en partie ouverte à cause de ${name}`,opening:`La dernière carte ouvre la situation avec ${name}`,neutral:`L’histoire arrive à sa conclusion avec ${name}`}
  };
  return map[role]?.[f]||map[role]?.neutral||name;
}
function cn5Closing(scope,q,finalCard,en=false){
  const kind=cn5QuestionKind(scope,q),family=cn5Family(finalCard,en),name=cn5Name(finalCard,en);
  if(en){
    if(kind==='spiritual-support'){
      if(family==='tension')return `In the symbolic logic of this reading, the support you ask about does not remove every upheaval: with ${name}, it seems to work by bringing buried material to the surface, helping you recover your inner axis while you move through it.`;
      if(family==='ground')return `In the symbolic logic of this reading, the support you ask about takes the form of an inner anchor: ${name} points toward steadiness, discernment and a position you can remain faithful to.`;
      return `In the symbolic logic of this reading, the support you ask about appears less as an external intervention than as a sequence that helps you recognise what matters and move through the next stage with greater awareness.`;
    }
    if(kind==='relation'||kind==='sexual'){
      if(family==='tension')return `The story therefore does not promise an effortless outcome: ${name} shows that what happens next depends on how the tension is handled in real exchanges and actions.`;
      return `The story therefore points toward a bond that must become real through mutual actions; the final meaning lies in what is actually built between the people involved.`;
    }
    if(kind==='work')return `Taken as a whole, the reading describes a process rather than a single event: the outcome will depend on how each stage is converted into a concrete decision or action.`;
    return `Taken as a whole, the reading describes a transformation in which the meaning does not come from one card alone, but from the way each stage prepares the next.`;
  }
  if(kind==='spiritual-support'){
    if(family==='tension')return `Dans la logique symbolique de ce tirage, le soutien que vous interrogez n’efface donc pas nécessairement le bouleversement : avec ${name}, il semble plutôt agir en faisant remonter ce qui doit être compris, afin de vous aider à retrouver votre axe pendant la traversée.`;
    if(family==='ground')return `Dans la logique symbolique de ce tirage, le soutien que vous interrogez prend la forme d’un ancrage intérieur : ${name} renvoie à davantage de stabilité, de discernement et de fidélité à ce qui vous paraît juste.`;
    return `Dans la logique symbolique de ce tirage, le soutien que vous interrogez apparaît moins comme une intervention extérieure spectaculaire que comme une succession d’étapes qui vous aident à reconnaître ce qui compte et à avancer avec davantage de conscience.`;
  }
  if(kind==='relation'||kind==='sexual'){
    if(family==='tension')return `Le récit ne promet donc pas une issue parfaitement fluide : ${name} montre que la suite dépendra surtout de la manière dont cette tension sera traversée dans les échanges et les actes réels.`;
    return `Le récit conduit donc vers un lien qui devra se rendre concret par des actes réciproques ; le sens final se jouera dans ce qui sera réellement construit entre les personnes concernées.`;
  }
  if(kind==='work')return `Pris dans son ensemble, le tirage décrit moins un événement isolé qu’un processus : l’issue dépendra de la manière dont chaque étape sera transformée en décision ou en action concrète.`;
  return `Pris dans son ensemble, le tirage raconte une transformation : le sens ne vient pas d’une carte prise séparément, mais de la manière dont chaque étape prépare la suivante.`;
}
function cn5FiveCardStory(cards,scope,q,en=false){
  const [a,b,c,d,e]=cards;
  const ea=cn5Sentence(cn5Definition(a,scope,en)),eb=cn5Sentence(cn5Definition(b,scope,en)),ec=cn5Sentence(cn5Definition(c,scope,en)),ed=cn5Sentence(cn5Definition(d,scope,en)),ee=cn5Sentence(cn5Definition(e,scope,en));
  if(en){
    return `${cn5Opening(scope,q,true)} ${cn5Lead(a,'origin',true)}: ${ea} Very quickly, that first scene reveals what resists it. ${cn5Lead(b,'obstacle',true)}: ${eb} This is precisely where the reading looks for a resource rather than an immediate solution. ${cn5Lead(c,'resource',true)}: ${ec} Once that support is found, the dynamic can genuinely change. ${cn5Lead(d,'evolution',true)}: ${ed} The final movement is therefore not a repetition of the starting point, but its consequence. ${cn5Lead(e,'outcome',true)}: ${ee} ${cn5Closing(scope,q,e,true)}`;
  }
  return `${cn5Opening(scope,q,false)} ${cn5Lead(a,'origin',false)} : ${ea} Très vite, ce premier décor révèle ce qui lui résiste. ${cn5Lead(b,'obstacle',false)} : ${eb} C’est précisément à cet endroit que le tirage cherche une ressource plutôt qu’une issue immédiate. ${cn5Lead(c,'resource',false)} : ${ec} Une fois cet appui retrouvé, la dynamique peut réellement changer. ${cn5Lead(d,'evolution',false)} : ${ed} Le dernier mouvement n’est donc pas une répétition du point de départ, mais sa conséquence. ${cn5Lead(e,'outcome',false)} : ${ee} ${cn5Closing(scope,q,e,false)}`;
}
function cn5ThreeCardStory(cards,scope,q,en=false){
  const [a,b,c]=cards;
  const ea=cn5Sentence(cn5Definition(a,scope,en)),eb=cn5Sentence(cn5Definition(b,scope,en)),ec=cn5Sentence(cn5Definition(c,scope,en));
  if(en)return `${cn5Opening(scope,q,true)} ${cn5Lead(a,'origin',true)}: ${ea} ${cn5Lead(b,'evolution',true)}: ${eb} What began as a starting condition therefore becomes a movement. ${cn5Lead(c,'outcome',true)}: ${ec} ${cn5Closing(scope,q,c,true)}`;
  return `${cn5Opening(scope,q,false)} ${cn5Lead(a,'origin',false)} : ${ea} ${cn5Lead(b,'evolution',false)} : ${eb} Ce qui n’était qu’un point de départ devient donc un mouvement. ${cn5Lead(c,'outcome',false)} : ${ec} ${cn5Closing(scope,q,c,false)}`;
}
function cn5OneCardStory(card,scope,q,en=false){
  const essence=cn5Sentence(cn5Definition(card,scope,en));
  if(en)return `${cn5Opening(scope,q,true)} ${cn5Name(card,true)} becomes the central scene of the reading: ${essence} Everything in the answer turns around this one movement.`;
  return `${cn5Opening(scope,q,false)} ${cn5Name(card,false)} devient la scène centrale du tirage : ${essence} Toute la réponse se concentre autour de ce mouvement.`;
}

function storyInterpretation(cards){
  if(!Array.isArray(cards)||!cards.length)return '';
  const en=state?.lang==='en';
  const q=String(state?.question||'').trim();
  const focus=typeof preciseQuestionFocus==='function'?preciseQuestionFocus():'life';
  const scope=cn5Scope(focus);
  let story='';
  if(cards.length===1)story=cn5OneCardStory(cards[0],scope,q,en);
  else if(cards.length===3)story=cn5ThreeCardStory(cards,scope,q,en);
  else story=cn5FiveCardStory(cards.slice(0,5),scope,q,en);
  const question=q?`<p class="reading-question">${en?'Your question':'Votre question'} : « ${cn5Esc(q)} »</p>`:'';
  return `<div class="story-reading" data-story-engine="${CRISTARIVA_STORY_ENGINE_VERSION}"><h3>${en?'The story told by your cards':'L’histoire racontée par vos cartes'}</h3>${question}<p class="story-continuous">${story}</p></div>`;
}
function interpretation(cards){return storyInterpretation(cards);}
