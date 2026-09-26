/* CRISTARIVA — finition narrative globale v5.20
   Corrige les amorces sans sujet et supprime les répétitions mécaniques.
   Le sens et l'ordre des cartes sont conservés.
   v5.20 : toutes les phrases commencent par un sujet grammatical explicite. */
const CRISTARIVA_PROJECT_STORY_VERSION='5.21';

function cr55Question(){return String(state?.question||'').replace(/\s+/g,' ').trim();}
function cr55Esc(v){try{return typeof cr53Esc==='function'?cr53Esc(v):typeof cr51Esc==='function'?cr51Esc(v):String(v??'');}catch(e){return String(v??'');}}
function cr55IsProjectQuestion(q=cr55Question()){
  try{if(typeof cr51Scope==='function'&&cr51Scope()==='work')return true;}catch(e){}
  return /\b(projet\w*|objectif\w*|réalisation\w*|realisation\w*|entreprise|activité\s+professionnelle|activite\s+professionnelle|lancement|candidature|carrière|carriere|idée\w*|idee\w*|concept\w*|invention\w*|initiative\w*|création\w*|creation\w*)\b/i.test(String(q||''));
}
function cr55Hay(card,en=false){
  if(typeof cr53Hay==='function')return cr53Hay(card,en);
  const l=en?(card?.en||{}):(card||{});
  return String((en?(card?.en?.name||card?.name):card?.name)||'')+' '+String(l.reading_professionnel||l.meaning||l.definition||'');
}
function cr57Cap(s){s=String(s||'').trim();return s?s.charAt(0).toLocaleUpperCase()+s.slice(1):'';}
function cr57LowerFirst(s){s=String(s||'');return s?s.charAt(0).toLocaleLowerCase()+s.slice(1):s;}

function cr55ProjectTheme(card,en=false){
  const h=cr55Hay(card,en).toLowerCase();
  if(/tempête|tempete|crise|surcharge|conflit|imprévu|imprevu|urgence|turbulence|storm|crisis|overload/.test(h))return 'crisis';
  if(/vision|stratég|strateg|anticip|objectif à long terme|objectif a long terme|long terme|planification|planning/.test(h))return 'strategy';
  if(/rejet|refus|écart|ecart|candidature.*écart|candidature.*ecart|rejection|refusal/.test(h))return 'rejection';
  if(/désillusion|desillusion|déception|deception|illusion|ne correspond pas|disillusion|disappoint/.test(h))return 'disillusion';
  if(/paix|apais|calme|stabilis|diminution des conflits|peace|calm/.test(h))return 'peace';
  if(/connexion|réseau|reseau|coopér|cooper|association|collaboration|partenariat|network|connection/.test(h))return 'connection';
  if(/éveil|eveil|clarté|clarte|compréhension|comprehension|prise de conscience|lucid|insight|clarity/.test(h))return 'insight';
  if(/transformation|mutation|changement|renouveau|naissance|éclos|eclos|émerg|emerg|change|renew/.test(h))return 'change';
  if(/patience|attente|délai|delai|matur|timing|wait/.test(h))return 'timing';
  if(/soutien|protection|providence|aide|allié|allie|opportun|succès|succes|progress|support|opportun|success/.test(h))return 'support';
  if(/choix|décision|decision|direction|cap|orientation|choice|decision|direction/.test(h))return 'choice';
  if(/bloc|retard|impasse|peur|pression|contrainte|obstacle|block|delay|fear|pressure|constraint/.test(h))return 'block';
  return 'neutral';
}
function cr55ProjectMessage(card,en=false){
  const l=en?(card?.en||{}):(card||{});
  return String(l.message||'').replace(/\s+/g,' ').trim();
}
function cr55ProjectClause(card,role,en=false){
  const t=cr55ProjectTheme(card,en),msg=cr55ProjectMessage(card,en);
  if(en){
    const bank={
      origin:{
        crisis:"The starting point still carries the effects of a turbulent period. Pressure, conflict or an unexpected event may have forced quick reactions, so the next decisions benefit from being made with more distance than before.",
        strategy:"The project began with a broad vision and a need to look ahead. That perspective is useful, but it now has to be translated into a sequence of concrete priorities.",
        rejection:"The starting point includes a refusal or an option that did not open as expected. Rather than defining the whole project, that setback can help clarify which direction is no longer worth pursuing.",
        disillusion:"The project starts from a gap between what was expected and what proved realistic. This calls for a more factual reading of what is still viable.",
        peace:"The starting point is calmer and more stable than before. This creates room to review choices without acting under pressure.",
        connection:"The project has been shaped by useful contacts, cooperation or a network that can influence what happens next.",
        insight:"The starting point contains an important realization that changes the way the project should be understood.",
        change:"The project is already changing form. An older approach is becoming less suitable and a different way forward is beginning to emerge.",
        timing:"The project starts in a phase where timing matters. Progress depends on respecting the right sequence instead of trying to accelerate every step.",
        support:"The starting point contains support or an opening that can be used as a real base for progress.",
        choice:"The project is already asking for a clearer direction. Several options may exist, but not all deserve the same level of effort.",
        block:"The project begins with a concrete limitation that still influences current decisions.",
        neutral:"The starting point is still being reorganized. The situation is not fixed, but it needs a clearer framework before the next move."
      },
      obstacle:{
        crisis:"The main difficulty is the risk of remaining in emergency mode. If pressure continues to dictate the pace, it becomes harder to distinguish what is urgent from what is actually important.",
        strategy:"The obstacle is not a lack of ideas, but the distance between a long-term vision and the decision that must be made now. The project needs a narrower priority so that strategy becomes actionable.",
        rejection:"A refusal, closed door or discarded proposal is the main point of resistance. The challenge is to accept the information it brings without turning it into a verdict on the whole project.",
        disillusion:"The obstacle comes from an expectation that no longer matches reality. Progress requires letting go of the original image so that the project can be judged on what is actually available.",
        peace:"Too much caution can become an obstacle if avoiding tension also prevents necessary decisions. Calm is useful only if it still allows clear choices.",
        connection:"The project may depend too heavily on other people, contacts or agreements. Cooperation helps, but the direction still needs to remain clear even if one connection changes.",
        insight:"The difficulty is that a realization has not yet been turned into a concrete decision. Understanding the situation is only useful if it changes what is done next.",
        change:"The obstacle lies in resisting a change that has already begun. Trying to preserve the old form may consume more energy than adapting the project.",
        timing:"The main difficulty is impatience or a timetable that is too tight. Some steps need more maturation before they can support the next one.",
        support:"Help may exist, but it can remain ineffective if the project has not clearly defined what support is actually needed.",
        choice:"The obstacle is dispersion between several directions. A decision is needed to stop dividing effort between options that cannot all remain priorities.",
        block:"A concrete constraint still needs to be identified and handled before progress can become more fluid.",
        neutral:"The main difficulty is still insufficiently defined. Clarifying what truly limits progress is more useful than trying to push harder in every direction."
      },
      resource:{
        crisis:"The strength lies in the ability to react, reorganize and regain control after a difficult phase. Experience gained under pressure can now be used more calmly and selectively.",
        strategy:"The strongest resource is the ability to take a broader view and connect present choices with a longer-term goal.",
        rejection:"Paradoxically, a refusal can become a useful filter. What is ruled out helps reduce dispersion and can redirect effort toward an option with better foundations.",
        disillusion:"The resource is realism. Seeing what no longer matches expectations makes it possible to stop investing energy in an image and focus on what remains workable.",
        peace:"The best support is a calmer environment that allows decisions to be made without unnecessary confrontation or haste.",
        connection:"Useful contacts, cooperation or a well-chosen partnership can become a real lever for the project.",
        insight:"A clearer understanding of the situation is the main resource. It helps separate assumptions from facts and makes the next decision more precise.",
        change:"The strength lies in the ability to transform the project instead of defending a form that no longer fits.",
        timing:"Patience and sequencing are assets here. Respecting the right moment can prevent a premature decision from weakening the project.",
        support:"A genuine opening, ally or support can help move the project from intention to a more concrete stage.",
        choice:"The resource is the ability to choose a direction and concentrate effort instead of keeping every option open.",
        block:"The strength lies in identifying the exact obstacle. Once it is named, the project becomes easier to reorganize around it.",
        neutral:"The resource comes from a more deliberate and flexible way of approaching the situation, with attention to what can be acted on now."
      },
      evolution:{
        crisis:"The evolution points toward leaving emergency mode behind. The project becomes more manageable when reactions give way to deliberate choices and a clearer order of priorities.",
        strategy:"The next phase asks for a clearer plan, with a long-term direction translated into short, verifiable steps.",
        rejection:"The evolution may include letting go of an option that is not opening. That can free time and energy for a more realistic direction.",
        disillusion:"The project moves through a return to reality. An offer, role, promise or expectation may prove different from what was imagined, but that clarification can prevent a larger mistake later.",
        peace:"The evolution tends toward stabilization, fewer conflicts and a calmer way of deciding what comes next.",
        connection:"The project can evolve through networking, cooperation or the meeting of two ideas that strengthen each other.",
        insight:"A decisive understanding can change the strategy, the objective or the way the work is organized.",
        change:"The project is entering a genuine transformation. The old approach loses relevance while a more workable form begins to take shape.",
        timing:"Progress remains gradual. The next step becomes stronger if it is prepared rather than forced.",
        support:"The evolution is helped by a useful opening or support that makes a more concrete stage possible.",
        choice:"The project now needs a clearer choice so that effort is concentrated on the direction that matters most.",
        block:"The evolution remains slowed until the limiting point is treated directly rather than bypassed.",
        neutral:"The project continues to redefine the conditions needed for progress and is moving toward a more concrete next step."
      },
      outcome:{
        crisis:"The final direction is not to keep fighting the same emergency, but to restore a level of control that allows decisions to become deliberate again.",
        strategy:"The synthesis favors a clearer hierarchy of priorities and a plan that connects immediate action with the longer-term goal.",
        rejection:"The synthesis asks you to take a refusal or closed option seriously, while using it to redirect rather than immobilize the project.",
        disillusion:"The outcome favors a realistic repositioning: the project becomes stronger when it is based on what is actually available rather than on the original expectation.",
        peace:"The synthesis points toward stabilization, reduced tension and a calmer environment in which decisions can be clarified without forcing them.",
        connection:"The outcome remains constructive when cooperation is concrete, reciprocal and aligned with the real objective of the project.",
        insight:"The synthesis emphasizes a new understanding that should now be converted into a practical decision.",
        change:"The final direction is a real change of form rather than a simple return to the previous way of working.",
        timing:"The outcome remains open, but it depends on respecting the right sequence and allowing the project enough time to mature.",
        support:"The synthesis keeps an opening available and suggests using the support that is genuinely present rather than waiting for ideal conditions.",
        choice:"The final point is a decision: one direction needs to become clearly more important than the others.",
        block:"The outcome stays conditional on resolving the main constraint before expecting the project to move naturally.",
        neutral:"The next step becomes clearer when the intention is translated into a concrete, coherent and verifiable action."
      }
    };
    let s=(bank[role]?.[t]||bank[role]?.neutral||'').trim();
    if(msg&&(role==='resource'||role==='outcome'))s+=' '+msg;
    return s;
  }

  const bank={
    origin:{
      crisis:"Le point de départ porte encore la trace d’une période agitée. Une crise, une surcharge, un conflit ou un imprévu a pu obliger à réagir vite ; les prochaines décisions gagnent donc à être prises avec davantage de recul qu’auparavant.",
      strategy:"Le projet s’est construit autour d’une vision assez large et d’un besoin d’anticiper. Cette capacité à voir loin reste utile, mais elle doit maintenant être traduite en priorités plus concrètes.",
      rejection:"Le point de départ comprend un refus ou une option qui ne s’est pas ouverte comme prévu. Ce contretemps ne résume pas tout le projet, mais il aide à repérer la direction qui ne mérite plus autant d’énergie.",
      disillusion:"Le projet part d’un décalage entre ce qui était attendu et ce qui s’est révélé réellement possible. Il devient nécessaire de regarder ce qui reste viable sans essayer de sauver à tout prix l’image initiale.",
      peace:"Le point de départ est plus calme et plus stable qu’auparavant. Ce climat crée de meilleures conditions pour revoir les choix sans décider sous pression.",
      connection:"Le projet s’est appuyé sur des contacts, une coopération ou un réseau qui ont déjà influencé sa trajectoire. La qualité de ces liens reste un élément à prendre en compte dans la suite.",
      insight:"Une prise de conscience importante modifie déjà la manière de comprendre le projet. Ce nouveau regard peut servir de base à des décisions plus précises.",
      change:"Le projet a déjà commencé à changer de forme. Une ancienne manière d’avancer devient moins adaptée et une autre façon de construire la suite commence à émerger.",
      timing:"Le point de départ montre que le calendrier compte autant que l’idée elle-même. Certaines étapes demandent encore d’être respectées avant de pouvoir engager la suivante.",
      support:"Une ouverture, un appui ou une aide utile existe déjà dans le contexte. Cela peut constituer une base réelle pour avancer, à condition de l’utiliser concrètement.",
      choice:"Le projet demande déjà un cap plus clair. Plusieurs directions peuvent rester possibles, mais elles ne méritent pas toutes le même niveau d’effort.",
      block:"Une contrainte concrète influence encore le projet dès son point de départ. La comprendre précisément est plus utile que de chercher à avancer malgré elle.",
      neutral:"Le point de départ reste en cours de réorganisation. Rien n’est figé, mais le projet a besoin d’un cadre plus clair avant d’engager la prochaine décision."
    },
    obstacle:{
      crisis:"La difficulté principale est le risque de rester dans un fonctionnement d’urgence. Tant que la pression impose le rythme, il devient difficile de distinguer ce qui est réellement prioritaire de ce qui exige seulement une réaction immédiate.",
      strategy:"L’obstacle n’est pas le manque d’idées, mais l’écart entre une vision à long terme et la décision qu’il faut prendre maintenant. Le projet a besoin d’une priorité plus étroite pour que la stratégie devienne réellement applicable.",
      rejection:"Le principal frein prend la forme d’un refus, d’une porte fermée ou d’une proposition écartée. L’enjeu est d’accepter l’information contenue dans cette réponse sans en faire un jugement global sur tout le projet.",
      disillusion:"Le frein vient d’une attente qui ne correspond plus tout à fait à la réalité. Avancer suppose de renoncer à l’image initiale pour juger le projet à partir de ce qui est effectivement disponible.",
      peace:"La recherche d’apaisement peut devenir un obstacle si elle conduit à éviter une décision nécessaire. Le calme reste utile à condition qu’il n’empêche pas de trancher ce qui doit l’être.",
      connection:"Le projet peut dépendre trop fortement d’un contact, d’un accord ou d’un partenaire. La coopération aide, mais la direction doit rester lisible même si l’un de ces liens évolue.",
      insight:"La difficulté vient du fait qu’une compréhension nouvelle n’a pas encore été transformée en décision concrète. Comprendre davantage ne suffit pas si rien ne change ensuite dans l’action.",
      change:"L’obstacle réside dans la résistance à une transformation déjà engagée. Vouloir conserver exactement l’ancienne forme peut consommer davantage d’énergie que l’adaptation elle-même.",
      timing:"Le principal frein tient à l’impatience ou à un calendrier trop serré. Certaines étapes ont encore besoin de maturer avant de pouvoir soutenir la suivante.",
      support:"Une aide peut être disponible sans être vraiment utile si le besoin n’a pas été défini. Il faut préciser ce qui doit être soutenu avant de multiplier les appuis.",
      choice:"Le frein vient de la dispersion entre plusieurs directions. Une décision devient nécessaire pour éviter de partager l’énergie entre des options qui ne peuvent pas toutes rester prioritaires.",
      block:"Un obstacle concret doit encore être identifié et traité avant que le projet puisse retrouver un mouvement plus naturel.",
      neutral:"Le principal frein reste encore mal défini. Clarifier ce qui limite réellement l’avancée est plus utile que de pousser davantage dans toutes les directions."
    },
    resource:{
      crisis:"La force disponible réside dans la capacité à réagir, réorganiser et reprendre le contrôle après une phase difficile. L’expérience acquise sous pression peut maintenant être utilisée avec davantage de calme et de discernement.",
      strategy:"La meilleure ressource est la capacité à prendre de la hauteur et à relier les décisions présentes à un objectif de plus long terme.",
      rejection:"Paradoxalement, un refus peut devenir un filtre utile. Ce qui est écarté aide à réduire la dispersion et peut réorienter les efforts vers une option mieux fondée.",
      disillusion:"La ressource principale est le réalisme. Voir ce qui ne correspond plus aux attentes permet de cesser d’investir dans une image et de concentrer l’énergie sur ce qui reste réellement exploitable.",
      peace:"Le meilleur appui est un climat plus calme, qui permet de décider sans confrontation inutile ni précipitation.",
      connection:"Les contacts utiles, la coopération ou un partenariat bien choisi peuvent devenir un véritable levier pour le projet.",
      insight:"Une compréhension plus nette de la situation constitue la ressource centrale. Elle aide à séparer les suppositions des faits et rend la prochaine décision plus précise.",
      change:"La force réside dans la capacité à transformer le projet au lieu de défendre une forme qui ne correspond plus à la situation actuelle.",
      timing:"La patience et le respect des étapes deviennent ici des atouts. Attendre le bon moment peut éviter qu’une décision prématurée fragilise la suite.",
      support:"Une ouverture, un allié ou un soutien réellement disponible peut aider le projet à passer de l’intention à une étape plus concrète.",
      choice:"La ressource est la capacité à choisir une direction et à concentrer l’effort, plutôt qu’à maintenir toutes les options ouvertes.",
      block:"La force consiste à identifier le verrou exact. Une fois nommé, le projet peut être réorganisé autour de cette contrainte au lieu de la subir.",
      neutral:"La ressource vient d’une manière plus consciente et plus souple d’aborder la situation, en privilégiant ce qui peut réellement être mis en œuvre maintenant."
    },
    evolution:{
      crisis:"L’évolution va vers une sortie progressive du mode d’urgence. Le projet devient plus maîtrisable lorsque les réactions immédiates laissent place à des choix délibérés et à un ordre de priorités plus clair.",
      strategy:"La suite demande un plan plus lisible, dans lequel la direction à long terme se traduit par des étapes courtes, concrètes et vérifiables.",
      rejection:"L’évolution peut passer par l’abandon d’une option qui ne s’ouvre pas. Ce renoncement libère du temps et de l’énergie pour une direction plus réaliste.",
      disillusion:"L’évolution passe par un retour au réel. Un projet, un poste, une promesse ou une attente peut se révéler différent de ce qui avait été imaginé, mais cette clarification peut éviter une erreur plus importante par la suite.",
      peace:"La dynamique évolue vers davantage de stabilité, moins de conflits et une manière plus calme de décider ce qui doit suivre.",
      connection:"Le projet peut progresser grâce au réseau, à la coopération ou au rapprochement de deux idées qui se renforcent mutuellement.",
      insight:"Une compréhension décisive peut modifier la stratégie, l’objectif ou la manière même d’organiser le travail.",
      change:"Le projet entre dans une transformation réelle. L’ancien fonctionnement perd de sa pertinence tandis qu’une forme plus praticable commence à se dessiner.",
      timing:"La progression reste graduelle. La prochaine étape sera plus solide si elle est préparée plutôt que forcée.",
      support:"L’évolution est facilitée par une ouverture ou un soutien utile qui permet d’atteindre une étape plus concrète.",
      choice:"Un choix plus clair devient nécessaire afin de concentrer les efforts sur la direction réellement prioritaire.",
      block:"L’évolution reste freinée tant que le point limitant n’est pas traité directement au lieu d’être contourné.",
      neutral:"Le projet continue de redéfinir les conditions nécessaires à son avancée et se dirige vers une prochaine étape plus concrète."
    },
    outcome:{
      crisis:"La direction finale n’est pas de rester dans la même urgence, mais de retrouver assez de maîtrise pour que les décisions redeviennent choisies plutôt que subies.",
      strategy:"La synthèse favorise une hiérarchie plus claire des priorités et un plan qui relie l’action immédiate à l’objectif de fond.",
      rejection:"La synthèse demande de prendre au sérieux une option fermée ou un refus, tout en l’utilisant pour réorienter le projet plutôt que pour l’immobiliser.",
      disillusion:"La direction finale privilégie un repositionnement réaliste : le projet devient plus solide lorsqu’il s’appuie sur ce qui existe réellement plutôt que sur l’attente initiale.",
      peace:"La synthèse va vers une stabilisation de l’ambiance, une diminution des tensions et un contexte plus favorable pour clarifier les décisions sans les brusquer.",
      connection:"La suite reste constructive si la coopération devient concrète, réciproque et réellement alignée sur l’objectif du projet.",
      insight:"La synthèse met l’accent sur une compréhension nouvelle qui doit maintenant être transformée en décision pratique.",
      change:"La direction finale passe par un véritable changement de forme plutôt que par un simple retour à l’ancien fonctionnement.",
      timing:"La suite reste ouverte, mais elle dépend du respect des étapes et du temps nécessaire à la maturation du projet.",
      support:"La synthèse maintient une ouverture et invite à utiliser les appuis réellement présents plutôt qu’à attendre des conditions idéales.",
      choice:"Le point final est une décision : une direction doit devenir clairement plus importante que les autres.",
      block:"La synthèse reste conditionnée par la résolution du principal frein avant d’attendre une progression plus naturelle.",
      neutral:"La prochaine étape devient plus claire lorsque l’intention se transforme en action concrète, cohérente et vérifiable."
    }
  };
  let s=(bank[role]?.[t]||bank[role]?.neutral||'').trim();
  if(msg&&(role==='resource'||role==='outcome'))s+=' '+msg;
  return s;
}
function cr55ProjectSynthesis(cards,en=false){
  const themes=cards.map(c=>cr55ProjectTheme(c,en));
  if(en){
    let s="Overall, the reading suggests a sequence rather than a single decisive move: clarify what has been destabilized, identify the real priority, use setbacks as information, and only then commit to the next concrete step.";
    if(themes.includes('peace'))s+=" The final direction favors a calmer and more stable way of deciding, with less pressure and more attention to what can actually be sustained.";
    else if(themes.includes('insight'))s+=" The decisive point is to turn the new understanding into a practical choice rather than leaving it at the level of reflection.";
    else if(themes.includes('change'))s+=" The project becomes stronger by accepting a real change of form instead of trying to restore the previous configuration.";
    return s;
  }
  let s="Dans l’ensemble, le tirage conseille une progression par étapes plutôt qu’une décision unique prise dans l’urgence : clarifier ce qui a été déstabilisé, identifier la priorité réelle, utiliser les contretemps comme des informations, puis seulement engager l’action suivante.";
  if(themes.includes('peace'))s+=" La direction finale favorise une manière plus calme et plus stable de décider, avec moins de pression et davantage d’attention à ce qui peut réellement tenir dans la durée.";
  else if(themes.includes('insight'))s+=" Le point décisif consiste à transformer la compréhension acquise en choix pratique, afin que l’analyse débouche réellement sur une nouvelle manière d’agir.";
  else if(themes.includes('change'))s+=" Le projet devient plus solide en acceptant un véritable changement de forme plutôt qu’en cherchant à rétablir exactement l’ancien fonctionnement.";
  return s;
}
function cr55ProjectStory(cards,en=false){
  const roles=cards.length===1?['outcome']:cards.length===3?['origin','evolution','outcome']:['origin','obstacle','resource','evolution','outcome'];
  const parts=[];
  for(let i=0;i<Math.min(cards.length,roles.length);i++){
    const t=cr55ProjectClause(cards[i],roles[i],en);
    if(t)parts.push(t);
  }
  if(cards.length>=3)parts.push(cr55ProjectSynthesis(cards.slice(0,roles.length),en));
  return parts.join(' ').replace(/\s+/g,' ').trim();
}

/* Dernière passe narrative : les couches précédentes peuvent ajouter un sujet
   grammatical correct mais trop répétitif. Ici, on varie ces sujets sans
   modifier la valeur divinatoire, l'ordre ni le contenu des cartes. */
function cr57VarySituationSubjects(text){
  let out=String(text||'');
  const b='(^|[.!?;:]\\s+)';
  const r=(p,repl)=>{
    out=out.replace(new RegExp(b+p,'gi'),(m,x)=>{
      const value=/[;:]\\s+$/.test(x)?cr57LowerFirst(repl):repl;
      return x+value;
    });
  };

  /* Cas composés et tournures très fréquentes. */
  r("La situation\\s+ne\\s+parle\\s+pas\\s+forcément\\s+d[’']un\\s+blocage\\s*:\\s*la\\s+situation\\s+indique\\s+plutôt\\s+qu[’']il\\s+faut\\s+",'Il n’est pas forcément question d’un blocage : il s’agit plutôt de ');
  r("La situation\\s+indique\\s+plutôt\\s+qu[’']il\\s+faut\\s+",'Il s’agit plutôt de ');
  r('La situation\\s+ne\\s+parle\\s+pas\\s+forcément\\s+de\\s+','Il n’est pas forcément question de ');
  r("La suite\\s+annonce\\s+l[’']ouverture\\s+d[’']",'L’évolution annonce l’ouverture d’');
  r('La suite\\s+fait\\s+apparaître\\s+un\\s+lien\\s+particulièrement\\s+significatif','Ce lien apparaît alors comme particulièrement significatif');
  r('La situation\\s+signale\\s+une\\s+rencontre\\s+susceptible\\s+de\\s+','Une rencontre se dessine, susceptible de ');
  r('La situation\\s+invite\\s+à\\s+','Il faut alors ');
  r("La situation\\s+demande\\s+d[’']",'Il faut alors ');
  r('La situation\\s+demande\\s+de\\s+','Il faut alors ');

  /* Formulations relationnelles : on privilégie des phrases qui racontent. */
  r('La situation\\s+désigne\\s+','On reconnaît ici ');
  r('La situation\\s+est\\s+un\\s+indicateur\\s+fort\\s*:\\s*','Un indicateur fort se dégage : ');
  r('La situation\\s+se\\s+vérifie\\s+','Ce constat se vérifie ');
  r("La situation\\s+montre\\s+qu[’']",'On voit alors qu’');
  r('La situation\\s+décrit\\s+une\\s+période\\s+où\\s+','Une période s’installe, durant laquelle ');
  r('La situation\\s+évoque\\s+','On perçoit aussi ');
  r("La situation\\s+parle\\s+d[’']",'Il est ici question d’');
  r('La situation\\s+parle\\s+de\\s+','Il est ici question de ');
  r('La situation\\s+peut\\s+annoncer\\s+','Cela peut annoncer ');
  r('La situation\\s+peut\\s+indiquer\\s+','On peut alors entrevoir ');
  r('La situation\\s+montre\\s+','On voit alors ');
  r('La situation\\s+indique\\s+','Un autre élément apparaît : ');
  r('La situation\\s+révèle\\s+','Un aspect important apparaît : ');
  r('La situation\\s+décrit\\s+','Cette étape met en lumière ');
  r('La situation\\s+associe\\s+','Cette dynamique associe ');
  r('La situation\\s+oriente\\s+vers\\s+','Le mouvement s’oriente vers ');
  r('La situation\\s+oriente\\s+','Cette évolution oriente ');
  r('La situation\\s+pousse\\s+','Cette dynamique pousse ');
  r('La situation\\s+appelle\\s+','L’évolution appelle ');
  r('La situation\\s+dévoile\\s+','Un nouvel aspect se dévoile : ');
  r('La situation\\s+présente\\s+','Un nouvel élément apparaît : ');
  r('La situation\\s+maintient\\s+','Ce mouvement maintient ');

  r('La suite\\s+fait\\s+apparaître\\s+','Un nouvel élément apparaît : ');
  let announceIndex=0;
  out=out.replace(new RegExp(b+'La suite\\s+annonce\\s+','gi'),(m,x)=>{
    const choices=['Le mouvement fait apparaître ','Un nouveau tournant annonce ','L’évolution laisse entrevoir '];
    let value=choices[(announceIndex++)%choices.length];
    if(/[;:]\\s+$/.test(x))value=cr57LowerFirst(value);
    return x+value;
  });
  r('La suite\\s+laisse\\s+entrevoir\\s+','On entrevoit alors ');
  r('La suite\\s+laisse\\s+apparaître\\s+','La progression laisse peu à peu apparaître ');
  r('La suite\\s+révèle\\s+','Un nouvel aspect se révèle : ');
  r('La suite\\s+confirme\\s+','Ce qui suit confirme ');
  r('La suite\\s+ouvre\\s+','L’évolution ouvre ');
  r('La suite\\s+indique\\s+','Le mouvement devient plus lisible : ');
  r('La suite\\s+dévoile\\s+','Un autre aspect se dévoile : ');

  /* Filet de sécurité : aucune série de phrases ne doit rester scandée par
     le même sujet générique. Les variantes tournent dans l'ordre du récit. */
  let situationIndex=0,suiteIndex=0;
  const situationSubjects=['Cette dynamique','Ce mouvement','Ce qui se joue ici','À ce stade, la dynamique'];
  const suiteSubjects=['L’évolution','Ce qui suit','Le mouvement','La progression'];
  out=out.replace(new RegExp(b+'La situation\\b','gi'),(m,x)=>{
    let value=situationSubjects[(situationIndex++)%situationSubjects.length];
    if(/[;:]\\s+$/.test(x))value=cr57LowerFirst(value);
    return x+value;
  });
  out=out.replace(new RegExp(b+'La suite\\b','gi'),(m,x)=>{
    let value=suiteSubjects[(suiteIndex++)%suiteSubjects.length];
    if(/[;:]\\s+$/.test(x))value=cr57LowerFirst(value);
    return x+value;
  });

  return out;
}

function cr57PolishFrenchNarrative(s){
  let out=String(s||''),describeIndex=0;
  const b='(^|[.!?]\\s+)';
  const r=(p,repl)=>{out=out.replace(new RegExp(b+p,'gi'),(m,x)=>x+repl);};

  out=out.replace(/Cette dimension prend davantage de place\s*:\s*d[’']attention/gi,'Cette dimension accorde davantage de place à l’attention')
    .replace(/Cette dimension prend davantage de place\s*:\s*douceur,\s*d[’']attention\s+et\s+de\s+gestes/gi,'La relation accorde davantage de place à la douceur, à l’attention et aux gestes');

  r('Fait\\s+apparaître\\s+','Un nouvel élément apparaît : ');
  r('Fait\\s+ressortir\\s+','Un autre aspect ressort alors : ');
  r('Peut\\s+révéler\\s+','Une prise de conscience peut alors faire émerger ');
  r("Peut\\s+montrer\\s+la\\s+crainte\\s+d[’']être\\s+",'Une crainte peut également apparaître : celle d’être ');
  r('Peut\\s+montrer\\s+','Un autre aspect apparaît alors : ');
  r('Peut\\s+indiquer\\s+','On peut alors entrevoir ');
  r('Peut\\s+annoncer\\s+','Un nouvel élément peut alors apparaître : ');
  r('Peut\\s+traduire\\s+','Cela peut traduire ');
  r('Peut\\s+favoriser\\s+','Cette évolution peut favoriser ');
  r('Peut\\s+signaler\\s+','Cette intensité peut alors signaler ');
  r('Met\\s+en\\s+évidence\\s+','Un point important se dégage : ');
  r('Parle\\s+de\\s+','La lecture met l’accent sur ');
  r('Demande\\s+','Cette étape demande ');
  r('Relie\\s+','Cette étape relie ');
  r('Associe\\s+','Cette dynamique associe ');
  r('Soutient\\s+','Cette évolution soutient ');
  r('Confirme\\s+','Ce qui suit confirme ');
  r('Exprime\\s+','Cette étape exprime ');
  r('Rappelle\\s+','Cette lecture rappelle ');
  r('Décrit\\s+','Cette étape met en lumière ');
  r('Révèle\\s+','Un aspect important apparaît : ');
  r('Montre\\s+','On voit alors ');
  r('Traduit\\s+','Cette étape traduit ');
  r('Représente\\s+','Cette étape correspond à ');
  r('Évoque\\s+','Un autre élément se dégage autour de ');
  r('Marque\\s+','Cette phase marque ');
  r('Indique\\s+','Un autre élément apparaît : ');
  r('Signale\\s+','Un signal apparaît : ');
  r('Invite\\s+','Cette évolution invite ');
  r('Favorise\\s+','Cette évolution favorise ');
  r('Valorise\\s+','La lecture valorise ');
  r('Encourage\\s+','L’évolution encourage ');
  r('Renforce\\s+','Cela renforce ');
  r('Permet\\s+','Cette évolution permet ');
  r('Préserve\\s+','Cela préserve ');
  r('Protège\\s+','Cela protège ');
  r('Oriente\\s+','Cette évolution oriente ');
  r('Pousse\\s+','Cette dynamique pousse ');
  r('Appelle\\s+','L’évolution appelle ');
  r('Dévoile\\s+','Un autre aspect se dévoile : ');
  r('Présente\\s+','Un nouvel élément apparaît : ');
  r('Apporte\\s+','Un nouvel élément apporte ');
  r('Crée\\s+','Cette évolution crée ');
  r('Maintient\\s+','Ce mouvement maintient ');
  r('Accroît\\s+','Cela accroît ');
  r('Réduit\\s+','Cela réduit ');
  r('Aide\\s+à\\s+','Cette évolution aide à ');
  r('Ouvre\\s+','Cette évolution ouvre ');
  r('Annonce\\s+','Cette évolution annonce ');
  r('Souligne\\s+','L’attention se porte alors sur ');

  const desc=['Un point important apparaît : ','La lecture met ensuite en lumière ','À ce stade, on distingue '];
  out=out.replace(/Le tirage décrit\s+/gi,()=>desc[(describeIndex++)%desc.length])
    .replace(/Le tirage parle moins de\s+/gi,'Il est ici moins question de ')
    .replace(/Le tirage parle surtout de\s+/gi,'La lecture met surtout l’accent sur ')
    .replace(/Le tirage parle de\s+/gi,'La lecture met l’accent sur ')
    .replace(/On voit alors se dessiner\s+/gi,'La situation laisse peu à peu apparaître ')
    .replace(/On voit se dessiner\s+/gi,'La situation laisse peu à peu apparaître ')
    .replace(/Cette dynamique fait apparaître\s+/gi,'Un autre élément apparaît : ')
    .replace(/Cette dynamique traduit\s+/gi,'Cela traduit ')
    .replace(/Cette dynamique valorise\s+/gi,'La lecture valorise ')
    .replace(/Cette dynamique favorise\s+/gi,'Cette évolution favorise ')
    .replace(/\s+([,.])/g,'$1')
    .replace(/\s*([;:!?])\s*/g,' $1 ')
    .replace(/\s{2,}/g,' ');

  out=cr57VarySituationSubjects(out);
  return out.trim();
}

function cr57PolishStoryHtml(html,en=false){
  try{
    const tpl=document.createElement('template');
    tpl.innerHTML=String(html||'');
    const p=tpl.content.querySelector('.story-continuous');
    if(!p)return html;
    const walker=document.createTreeWalker(p,NodeFilter.SHOW_TEXT);
    while(walker.nextNode()){
      const node=walker.currentNode;
      if(node.parentElement.closest('b,strong,a,code'))continue;
      const match=node.textContent.match(/^(\s*)([\s\S]*?)(\s*)$/);
      let s=match[2];
      if(!s)continue;
      if(!en)s=cr57PolishFrenchNarrative(s);
      s=s.replace(/(^|[.!?]\s+)([a-zà-ÿ])/g,(m,a,c)=>a+c.toLocaleUpperCase());
      node.textContent=match[1]+s+match[3];
    }
    const root=tpl.content.querySelector('.story-reading');
    if(root)root.dataset.storyEngine=CRISTARIVA_PROJECT_STORY_VERSION;
    return tpl.innerHTML;
  }catch(e){return html;}
}

const cr55BaseStoryInterpretation=typeof storyInterpretation==='function'?storyInterpretation:null;
if(cr55BaseStoryInterpretation){
  storyInterpretation=function(cards){
    if(!Array.isArray(cards)||!cards.length)return '';
    const q=cr55Question(),en=state?.lang==='en';
    let html;
    if(cr55IsProjectQuestion(q)){
      const question=`<p class="reading-question">${en?'Your question':'Votre question'} : « ${cr55Esc(q)} »</p>`;
      html=`<div class="story-reading" data-story-engine="${CRISTARIVA_PROJECT_STORY_VERSION}"><h3>${en?'The story told by your cards':'L’histoire racontée par vos cartes'}</h3>${question}<p class="story-continuous">${cr55ProjectStory(cards,en)}</p></div>`;
    }else html=cr55BaseStoryInterpretation(cards);
    return cr57PolishStoryHtml(html,en);
  };
  interpretation=function(cards){return storyInterpretation(cards);};
}

(function cr55Refresh(){
  try{
    if(state?.draw?.length){
      for(const id of ['reading','interpretation','readingResult','story','result']){
        const el=document.getElementById(id);
        if(el&&/L’histoire racontée par vos cartes|The story told by your cards/.test(el.textContent||'')){el.innerHTML=storyInterpretation(state.draw);break;}
      }
    }
  }catch(e){}
})();
