/* CRISTARIVA — narration universelle fluide v6.3
   Dernière couche commune à tous les oracles et au tarot.
   Règles : aucun nom de carte dans le récit, aucune liste brute de mots-clés,
   narration continue, transitions variées, prise en charge de tout nombre de cartes.
*/
(function(){
'use strict';
const VERSION='6.23';

function esc(v){
  try{return typeof readingEscape==='function'?readingEscape(String(v??'')):String(v??'').replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  catch(e){return String(v??'');}
}
function norm(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
function hay(card,en=false){
  const l=en?(card?.en||{}):(card||{});
  return norm([
    l.category, l.keywords, l.definition||l.meaning,
    card?.category, card?.keywords
  ].filter(Boolean).join(' '));
}
function scope(){
  const d=norm(state?.domain||''),q=norm(state?.question||'');
  if(/profession|travail|emploi|carriere|projet|business|work|career|job|money|argent|finance/.test(d+' '+q))return 'work';
  if(/relation|amour|couple|sentiment|romant|intimit|rencontr|love|partner|retour|recontact/.test(d+' '+q))return 'relation';
  if(/site|cristariva|plateforme|entreprise/.test(q)&&/actualite|ouverture|fonctionnalite|creation|developpement|integrer|connecter|relier/.test(q))return 'work';
  return 'life';
}
function theme(card,en=false){
  const title=norm((en?card?.en?.name:card?.name)||card?.name);
  if(/triangle|triangul|troisieme personne|rivalit/.test(title))return 'triangle';
  if(/dispute|querelle|conflit|altercation/.test(title))return 'conflict';
  if(/engagement|promesse|officialisation|construction/.test(title))return 'commitment';
  if(/communication|dialogue|parole|conversation|clarification|communication|dialog/.test(title))return 'insight';
  if(/impasse|incompatibil|blocage|obstacle|rupture|conflit|trahison|infidelit|betrayal|deadlock/.test(title))return 'tension';
  if(/silence|retrait|absence de reponse|non dit/.test(title))return 'ambiguity';
  if(/alignement|coherence|accord/.test(title))return 'ground';
  if(/desir|attirance|passion/.test(title))return 'movement';
  if(/projet a deux|avenir commun|vie commune/.test(title))return 'bond';
  const h=hay(card,en);
  if(/secret|cache|non dit|dissim|mystere|ambigu|incert|hesit|flou|doute|unknown|uncertain|hidden/.test(h))return 'ambiguity';
  if(/liberte|autonom|independan|espace|distance saine|freedom|autonomy|independence/.test(h))return 'freedom';
  if(/transformation|mutation|changement|renouveau|renaissance|transition|change|transform|renew/.test(h))return 'change';
  if(/coup de foudre|fulguran|passion|attir|elan|impulsion|rapid|surprise|movement|momentum|attraction/.test(h))return 'movement';
  if(/bloc|obstacle|retard|refus|rejet|rupture|conflit|peur|impasse|isolement|contrainte|tension|stagn|block|delay|fear|conflict/.test(h))return 'tension';
  if(/stabil|equilibre|secur|ancr|structure|durable|solid|stability|balance|security/.test(h))return 'ground';
  if(/union|reciproc|amour|lien|connexion|partage|harmon|soutien|cooper|relation|bond|connection|support|harmony/.test(h))return 'bond';
  if(/clarte|comprehension|verite|prise de conscience|lucid|discern|clarity|understanding|truth|insight/.test(h))return 'insight';
  if(/opportun|ouverture|possibil|nouveau depart|commencement|chance|opening|opportunity|possibility/.test(h))return 'opening';
  if(/travail|methode|competence|apprentissage|effort|precision|work|skill|method|learning/.test(h))return 'effort';
  return 'neutral';
}
function roles(n){
  if(n<=1)return ['outcome'];
  if(n===2)return ['origin','outcome'];
  if(n===3)return ['origin','evolution','outcome'];
  if(n===4)return ['origin','obstacle','evolution','outcome'];
  if(n===5)return ['origin','obstacle','resource','evolution','outcome'];
  const out=['origin','obstacle','resource'];
  while(out.length<n-1)out.push('evolution');
  out.push('outcome');
  return out;
}
function pick(arr,card,i){
  if(!arr?.length)return '';
  const seed=(Number(card?.id)||0)+i*7;
  return arr[Math.abs(seed)%arr.length];
}
/* Read the distinctive idea of a card before falling back to broad themes.
   The minor arcana's domain readings are formulaic, so use their actual
   definition/keywords; otherwise a generic word such as "relation" would
   drown out the card's own meaning. */
function motif(card,enMode){
  const local=enMode?(card?.en||card):card;
  const name=norm(local?.name||card?.name);
  const k=norm([local?.category,local?.keywords].filter(Boolean).join(' '));
  const details=norm(local?.definition||local?.meaning||'');
  if(/trois d.?epees|three of swords/.test(name))return 'heartbreak';
  if(/dix de batons|ten of wands/.test(name))return 'burden';
  if(/valet de coupes|page of cups/.test(name))return 'sensitivity';
  if(/roi de coupes|king of cups/.test(name))return 'composure';
  if(/le chariot|the chariot/.test(name))return 'direction';
  if(/huit de coupes|eight of cups/.test(name))return 'departure';
  if(/neuf de coupes|nine of cups/.test(name))return 'contentment';
  if(/neuf d.?epees|nine of swords/.test(name))return 'anxiety';
  if(/le pendu|the hanged man/.test(name))return 'pause';
  if(/as de deniers|ace of pentacles/.test(name))return 'tangible';
  if(/quatre de coupes|lassitude|insatisfaction|desenchant/.test(name+' '+k))return 'disenchantment';
  if(/sept de coupes|illusion|projection|fantasm/.test(name+' '+k))return 'illusion';
  if(/blessure|peine|chagrin|heartbreak|hurt/.test(k))return 'heartbreak';
  if(/surcharge|responsabilite|fardeau|poids|overload|burden/.test(k))return 'burden';
  if(/maturite emotionnelle|compassion|maitrise des emotions|emotional maturity/.test(k))return 'composure';
  if(/tendresse|message sensible|intuition nouvelle|tenderness/.test(k))return 'sensitivity';
  if(/volonte|direction|avancee|willpower|forward motion/.test(k))return 'direction';
  if(/\bpause\b|suspension|lacher.prise|renversement|recul|\brepos\b/.test(k))return 'pause';
  if(/rumination|angoiss|anxiet|insomn|pensee.*boucle/.test(k))return 'anxiety';
  if(/quitter|eloignement|depart|detachement|prendre de la distance/.test(k))return 'departure';
  if(/satisfaction|plaisir|desir.*concret|accomplissement/.test(k))return 'contentment';
  if(/opportunite|ressource.*concret|base materielle|commencement/.test(k))return 'tangible';
  if(/deuil|perte|regret|deception/.test(k))return 'loss';
  if(/conflit|dispute|desaccord|querelle/.test(k))return 'conflict';
  if(/secret|ambiguite|non.dit|incertitude/.test(k))return 'ambiguity';
  if(/cooperation|soutien|entraide|equipe|partage/.test(k))return 'cooperation';
  if(/verite|clarte|lucidite|discernement|communication|dialogue/.test(k))return 'insight';
  if(/liberte|autonomie|independance/.test(k))return 'freedom';
  if(/\belan\b|passion|rapidite|mouvement|impulsion/.test(k))return 'movement';
  if(/transformation|mutation|renouveau|transition/.test(k))return 'change';
  if(/stabilite|securite|ancrage|structure/.test(k))return 'ground';
  /* Older oracle cards sometimes have no category or keywords. Read the
     definition only in that case; its incidental words must not override a
     more precise label such as "surcharge" or "sensibilité". */
  if(!k&&details){
    if(/blessure|douleur affective/.test(details))return 'heartbreak';
    if(/surcharge|accumulation de responsabilites/.test(details))return 'burden';
    if(/maturite emotionnelle|maitrise ses emotions/.test(details))return 'composure';
    if(/message sensible|geste tendre/.test(details))return 'sensitivity';
    if(/direction nette|conduire.*objectif/.test(details))return 'direction';
  }
  return '';
}
function distinctiveFr(card,role,sc){
  const m=motif(card,false);
  const project=sc==='work';
  const stages={
    heartbreak:{
      origin:'Une blessure ou une vérité douloureuse marque le point de départ. Elle mérite d’être regardée sans détour, car l’ignorer rendrait la suite moins juste et moins lisible.',
      obstacle:'La douleur peut devenir un frein si elle pousse à éviter les faits ou à interpréter chaque geste à travers la blessure passée. Il faut lui donner une place sans la laisser décider de tout.',
      resource:'Reconnaître ce qui a blessé permet de distinguer la réalité présente de la peur de revivre la même chose. Cette lucidité aide à poser une limite plus claire.',
      evolution:'La situation évolue lorsque cette vérité difficile est enfin nommée. Il devient alors possible de répondre autrement au lieu de rester prisonnier de la blessure.',
      outcome:'La suite demande de reconnaître la blessure et de choisir ce qui peut réellement être réparé. Cette étape ouvre un chemin plus honnête, sans promettre l’effacement immédiat de la douleur.'
    },
    burden:{
      origin:'La situation part d’un cumul de responsabilités qui a progressivement absorbé l’énergie disponible. Ce qui semblait encore tenable mérite maintenant d’être simplifié.',
      obstacle:'Le principal risque est de vouloir tout porter à la fois. Même une direction prometteuse peut s’épuiser si les tâches, les attentes ou les décisions reposent sur une seule personne.',
      resource:'La charge déjà assumée montre une capacité réelle à tenir l’effort. Cette force devient plus utile lorsque les priorités sont hiérarchisées et que le poids peut être partagé.',
      evolution:'La progression exige de réduire la surcharge, de répartir les responsabilités ou de renoncer à certaines tâches. Sans cet allègement, l’élan risque de s’user.',
      outcome:'La suite reste possible, mais elle devra être soutenable. Choisir ce qui compte et alléger le reste donnera plus de portée aux efforts déjà engagés.'
    },
    sensitivity:{
      origin:'Une intuition, un message ou un geste sensible a ouvert la situation. Cet élan mérite d’être entendu, tout en laissant aux faits le temps de confirmer son importance.',
      obstacle:'Un signe touchant peut être interprété trop vite comme une certitude. La prudence consiste à accueillir ce qu’il éveille sans lui attribuer une portée qu’il n’a pas encore.',
      resource:'Un regard sensible, une intuition nouvelle ou un échange sincère constitue ici un point d’appui. Cette attention rend la réponse plus humaine, si elle reste liée aux intentions réelles.',
      evolution:'Une parole plus douce ou une intuition fraîche modifie progressivement le climat. Ce mouvement gagne à être suivi de gestes cohérents pour prendre corps.',
      outcome:'La suite peut commencer par un message, une invitation ou un geste d’ouverture. Sa valeur se mesurera à la manière dont cet élan sensible sera accueilli et prolongé.'
    },
    composure:{
      origin:'Une attitude calme a permis de contenir des émotions intenses sans les étouffer. Cette maîtrise offre un point de départ plus stable pour comprendre ce qui se joue.',
      obstacle:'La recherche de calme peut devenir un frein si elle empêche d’exprimer ce qui compte vraiment. Garder la maîtrise ne devrait pas conduire à taire les besoins.',
      resource:'La capacité à accueillir les émotions sans être dirigé par elles peut soutenir la décision. Elle permet de répondre avec bienveillance tout en gardant les faits en vue.',
      evolution:'L’étape suivante consiste à garder une attitude stable et bienveillante malgré l’intensité des émotions. Ce recul aide à choisir une réponse mesurée plutôt qu’à réagir dans l’urgence.',
      outcome:'La direction la plus solide passe par une parole calme et une attention réelle aux émotions en présence. Elle permet de décider sans nier ce qui est ressenti.'
    },
    direction:{
      origin:'Une volonté d’avancer donne son impulsion à la situation. Encore faut-il définir le cap pour que les énergies disponibles ne partent pas dans plusieurs directions.',
      obstacle:'La précipitation ou la dispersion peut affaiblir un mouvement pourtant réel. Un choix de direction est nécessaire avant d’accélérer.',
      resource:'La capacité à rassembler plusieurs forces autour d’un objectif précis peut devenir décisive. Elle transforme l’élan en mouvement coordonné.',
      evolution:'La situation prend de la vitesse lorsqu’un cap clair est choisi. Les initiatives gagnent alors à rester cohérentes avec cet objectif plutôt qu’à se multiplier sans lien.',
      outcome:project?'La synthèse ouvre sur une avancée possible, à condition de choisir une direction précise et de concentrer les moyens sur une première étape réalisable. L’élan devient utile lorsqu’il sert un cap tenu dans la durée.':'La synthèse invite à choisir une direction nette, puis à conduire les forces disponibles vers ce même objectif. Une avancée est possible si la volonté s’accompagne d’actes coordonnés.'
    }
  };
  return stages[m]?.[role]||'';
}
function developFr(card,role){
  const actions={
    departure:'nommer ce qui ne nourrit plus la situation',contentment:'vérifier ce qui apporte une satisfaction durable',
    anxiety:'séparer les inquiétudes des faits établis',pause:'utiliser le recul pour revoir les hypothèses',
    tangible:'donner une forme concrète à la possibilité entrevue',disenchantment:'réévaluer ce qui existe avant de le quitter',
    illusion:'faire le tri entre désir et possibilité réelle',loss:'reconnaître la perte sans négliger ce qui reste',
    conflict:'traiter le désaccord dans des termes précis',ambiguity:'éclaircir ce qui demeure incertain',
    cooperation:'définir comment chacun peut contribuer',insight:'mettre les faits et les attentes en mots',
    freedom:'définir la place nécessaire à l’autonomie',movement:'transformer l’élan en actions cohérentes',
    change:'identifier ce qui doit effectivement changer',ground:'consolider les bases avant de poursuivre',
    heartbreak:'reconnaître la douleur sans la laisser tout gouverner',burden:'alléger et répartir la charge',
    sensitivity:'écouter les émotions et vérifier les intentions',composure:'garder une réponse calme et lucide',
    direction:'choisir un cap avant d’accélérer',
    triangle:'clarifier la place et les attentes de chacun',commitment:'traduire la promesse en actes durables',
    tension:'identifier le frein exact',bond:'vérifier la qualité du lien et du soutien',
    opening:'choisir une première possibilité réaliste',effort:'poursuivre un travail régulier et vérifiable',
    neutral:'préciser ce qui change réellement dans la situation'
  };
  const key=motif(card,false)||theme(card,false);
  const byRole={
    ambiguity:{origin:'repérer ce qui manque encore à la compréhension',obstacle:'demander les précisions qui font défaut',resource:'poser une question simple et vérifiable',evolution:'vérifier les informations nouvelles',outcome:'éviter de conclure avant d’avoir les faits essentiels'},
    tension:{origin:'reconnaître la cause du ralentissement',obstacle:'traiter ce qui bloque concrètement',resource:'définir une marge de manœuvre',evolution:'modifier la réponse apportée à la difficulté',outcome:'résoudre le point qui demeure ouvert'},
    change:{origin:'comprendre pourquoi l’ancien cadre ne convient plus',obstacle:'laisser de la place à un fonctionnement nouveau',resource:'utiliser les acquis dans un cadre différent',evolution:'mettre en pratique le changement envisagé',outcome:'choisir ce qui mérite de durer dans la nouvelle étape'}
  };
  const action=byRole[key]?.[role]||actions[key];
  if(!action)return '';
  const de=/^[aeiouyàâäéèêëîïôöùûü]/i.test(action)?'d’':'de ';
  return {
    origin:`Ce point de départ explique pourquoi il faudra ${action} avant d’aller plus loin.`,
    obstacle:`Le mouvement risque de rester freiné tant qu’il n’est pas possible ${de}${action}.`,
    resource:`Cet appui prend tout son sens s’il permet ${de}${action}.`,
    evolution:`Le changement se vérifiera dans la capacité à ${action}.`,
    outcome:`La prochaine étape consisterait à ${action}.`
  }[role]||'';
}
function preciseFr(card,role){
  const m=motif(card,false);
  const stages={
    origin:{
      departure:'Au départ, quelque chose ne répond plus assez aux attentes pour continuer exactement comme avant. Prendre de la distance permet de chercher une direction plus juste.',
      contentment:'Une satisfaction réelle constitue le point de départ, même si elle ne répond peut-être pas à tous les besoins.',
      anxiety:'La situation prend racine dans des inquiétudes qui ont fini par peser davantage que les faits établis.',
      pause:'Un temps d’arrêt a déjà modifié la façon de regarder la situation.',
      tangible:'Une possibilité concrète existe dès le départ, mais elle reste à développer.',
      disenchantment:'Une insatisfaction ancienne montre que poursuivre par habitude ne suffit plus.',
      loss:'Une déception passée continue de peser, sans effacer toutes les possibilités encore présentes.',
      illusion:'Plusieurs pistes séduisantes ont ouvert la réflexion, sans qu’un choix ferme ait encore été fait.',
      conflict:'Un désaccord ou une tension ancienne a placé la situation sur un terrain fragile.',
      ambiguity:'La situation s’est développée dans un manque de clarté qui rend encore les intentions difficiles à lire.',
      cooperation:'Un soutien ou un travail partagé a donné une première assise à la situation.',
      insight:'Une prise de conscience a commencé à modifier la manière de comprendre la situation.'
    },
    obstacle:{
      contentment:'Le confort d’une solution séduisante peut toutefois masquer ce qui manque en profondeur. Il faut vérifier qu’elle répond au besoin réel.',
      departure:'Le risque est de s’éloigner sans avoir défini ce que l’on cherche à retrouver ailleurs.',
      anxiety:'Les inquiétudes peuvent donner à chaque difficulté une ampleur qu’elle n’a pas encore dans les faits.',
      pause:'Une attente trop longue pourrait devenir une manière de repousser la décision nécessaire.',
      tangible:'Les moyens matériels ou pratiques restent à réunir pour que l’idée puisse prendre forme.',
      disenchantment:'La lassitude peut faire écarter trop vite une possibilité qui mérite encore d’être examinée.',
      illusion:'L’attrait de plusieurs options complique le choix de celle qui peut réellement aboutir.',
      cooperation:'Compter sur une coopération agréable ne suffit pas si les rôles et les attentes restent flous.',
      conflict:'Un désaccord persistant absorbe l’énergie qui pourrait faire avancer la situation.',
      ambiguity:'Ce qui reste tu ou incertain empêche de choisir une direction en connaissance de cause.',
      ground:'Le besoin de tout sécuriser peut figer une situation qui demande encore de la souplesse.'
    },
    resource:{
      anxiety:'Les inquiétudes deviennent utiles lorsqu’elles aident à nommer les risques précis et à distinguer les faits des scénarios redoutés.',
      departure:'La prise de distance aide à reconnaître ce qui ne convient plus et à choisir une autre voie.',
      contentment:'Le désir de mieux vivre la situation donne une raison concrète de poursuivre, à condition d’en préciser les besoins.',
      pause:'Un peu de recul permet de revoir les hypothèses avant de décider.',
      tangible:'Une ressource déjà disponible peut servir de premier appui concret.',
      illusion:'Faire le tri entre les envies et les possibilités réelles aide à retrouver une direction.',
      conflict:'Le désaccord peut révéler le point précis qui demande à être traité.',
      loss:'Reconnaître ce qui a été perdu permet aussi de voir ce qui reste disponible.',
      cooperation:'Un soutien précis ou des compétences complémentaires peuvent aider à franchir l’étape suivante.',
      insight:'Une mise au clair des faits et des attentes fournit le meilleur point d’appui.',
      ambiguity:'Nommer ce qui reste incertain permet de poser les bonnes questions avant de décider.'
    },
    evolution:{
      pause:'La suite demande un temps d’observation et un changement de perspective. Forcer l’issue maintenant risquerait de faire manquer ce que cette pause révèle.',
      anxiety:'Le mouvement ralentit tant que les craintes occupent toute la place ; vérifier les faits permet de retrouver une marge de choix.',
      departure:'Une prise de distance se dessine, afin de laisser place à une direction qui corresponde mieux aux attentes.',
      contentment:'La satisfaction recherchée devient plus accessible si elle répond aussi aux besoins profonds.',
      tangible:'L’idée commence à trouver une forme concrète grâce à une première ressource ou à une action réalisable.',
      illusion:'Le moment vient de réduire les options et d’éprouver la piste la plus réaliste.',
      disenchantment:'Le recul aide à distinguer une vraie impasse d’une fatigue passagère.',
      cooperation:'Les échanges ou les compétences partagées peuvent désormais faire avancer la situation.',
      conflict:'Le désaccord doit être traité directement pour que la situation retrouve du mouvement.',
      ambiguity:'Une partie de la situation se précise, mais les éléments encore incertains demandent à être vérifiés.',
      insight:'Une parole plus claire ou un fait nouveau aide à choisir la direction suivante.'
    },
    outcome:{
      tangible:'Une possibilité concrète se présente finalement. Elle pourrait prendre la forme d’une ressource, d’un projet ou d’une première réalisation, à condition d’être réellement mise en œuvre.',
      pause:'La prochaine étape consiste à changer de point de vue avant de relancer l’action.',
      anxiety:'La suite dépend de la capacité à confronter les craintes aux faits avant d’en tirer une conclusion.',
      departure:'Une nouvelle direction devient possible en acceptant de quitter ce qui ne nourrit plus la situation.',
      contentment:'Une satisfaction est envisageable si elle correspond aux attentes profondes et se confirme dans les faits.',
      illusion:'La suite demande de choisir une possibilité réalisable parmi celles qui séduisent.',
      disenchantment:'La réponse passe par une réévaluation de ce qui existe déjà, avant de chercher ailleurs.',
      loss:'La suite commence par reconnaître la perte, puis par utiliser ce qui reste encore accessible.',
      cooperation:'La suite prend davantage de consistance si le soutien disponible devient une collaboration effective.',
      insight:'Une clarification rend possible une décision plus nette ; sa portée dépendra de ce qui sera fait ensuite.',
      conflict:'La suite exige de résoudre le désaccord plutôt que de poursuivre en l’ignorant.',
      ambiguity:'La direction reste ouverte tant que les intentions ou les faits essentiels n’ont pas été éclaircis.'
    }
  };
  return stages[role]?.[m]||'';
}
function questionLead(q,sc){
  if(sc==='relation'||!q||q.length>125)return '';
  const action=q.replace(/[?.!]+$/,'').trim();
  if(/^(connecter|relier|integrer|intégrer|ouvrir|developper|développer|créer|creer|lancer|construire|faire évoluer)\s+\S/i.test(action))
    return `Pour ${action.charAt(0).toLowerCase()+action.slice(1)}, `;
  const noun=norm(action);
  if(/^(ouverture|evolution|integration|creation)\s+(de|du|des|d')/.test(noun))return `Pour l’${action.charAt(0).toLowerCase()+action.slice(1)}, `;
  if(/^developpement\s+(de|du|des|d')/.test(noun))return `Pour le ${action.charAt(0).toLowerCase()+action.slice(1)}, `;
  return '';
}
function contextFr(q,sc,cards){
  const focus=norm(q);
  const motifs=cards.map(c=>motif(c,false));
  if(sc==='work'&&/cristariva|site|plateforme/.test(focus)&&/actualite|evenements du monde/.test(focus)
    &&motifs.includes('burden')&&motifs.includes('direction'))
    return 'Pour intégrer l’actualité, une ligne éditoriale choisie aiderait à traiter les faits avec sensibilité, à limiter le nombre de sujets suivis et à tenir un rythme que le site peut soutenir dans la durée.';
  return '';
}
function fr(card,role,sc,i){
  const t=theme(card,false);
  const generic={
    origin:{
      tension:["Le récit s’ouvre sur une période de ralentissement, comme si quelque chose avait empêché la situation d’évoluer aussi librement qu’espéré.","Au départ, une forme de blocage ou d’hésitation semble avoir maintenu la situation dans l’attente."],
      ambiguity:["Au départ, la situation paraît s’être installée dans un entre-deux, avec plusieurs éléments encore difficiles à comprendre clairement.","Le début du récit évoque une période où la direction restait incertaine et où tout n’était pas encore suffisamment lisible."],
      change:["Le récit commence dans une période de transition, comme si une ancienne manière de vivre la situation arrivait progressivement à son terme.","Au départ, un changement était déjà en train de se préparer, même si sa forme n’était pas encore complètement visible."],
      bond:["Le point de départ repose sur un lien, un attachement ou un soutien qui a donné du poids à la situation.","Au commencement, une proximité ou une connexion importante semble avoir constitué le socle de ce qui allait suivre."],
      opening:["Le récit s’ouvre sur une possibilité nouvelle, encore fragile mais suffisamment présente pour modifier la perspective.","Au départ, une ouverture semble avoir rendu envisageable une évolution qui ne l’était pas auparavant."],
      ground:["La situation part d’un besoin de stabilité et de repères plus solides.","Au départ, l’enjeu principal semble avoir été de retrouver une base plus sûre et plus équilibrée."],
      neutral:["Le récit commence par une phase d’ajustement, durant laquelle les choses se mettent progressivement en place.","Au départ, la situation se construit encore et prépare la transition vers une étape plus claire."]
    },
    obstacle:{
      tension:["La difficulté principale vient d’un frein encore présent, qui demande à être reconnu plutôt que contourné.","Ce qui complique le chemin tient surtout à une résistance, une peur ou une contrainte qui continue de ralentir l’évolution."],
      ambiguity:["Le point le plus délicat reste le manque de clarté : certaines intentions ou informations demeurent difficiles à interpréter.","L’obstacle se situe surtout dans ce qui reste flou ou non formulé, laissant trop de place aux suppositions."],
      movement:["L’intensité ou la rapidité du mouvement peut elle-même devenir déstabilisante si elle précède une véritable stabilisation.","Le défi consiste à ne pas confondre un élan très fort avec une évolution déjà construite dans la durée."],
      freedom:["Le besoin d’espace ou d’indépendance peut créer un décalage s’il n’est pas compris ou respecté de part et d’autre.","La difficulté consiste à trouver une juste distance, sans transformer le besoin de liberté en éloignement subi."],
      neutral:["Le principal frein vient d’un déséquilibre encore non résolu, plus que d’une fermeture définitive.","Quelque chose demande encore à être clarifié avant que la situation puisse avancer avec davantage de fluidité."]
    },
    resource:{
      change:["La meilleure ressource réside dans la capacité à accepter une transformation réelle plutôt que de chercher à préserver exactement l’ancien fonctionnement.","Un changement profond peut devenir le véritable point d’appui, à condition d’être accueilli comme une évolution et non comme une perte."],
      insight:["La situation peut progresser grâce à une compréhension plus lucide de ce qui se joue réellement.","Le meilleur appui vient d’un regard plus clair sur les faits, les émotions et les limites de chacun."],
      ground:["Ce qui peut le mieux soutenir la suite est de retrouver une base plus stable, plus simple et plus concrète.","La ressource principale consiste à renforcer ce qui est fiable avant de chercher à aller plus vite."],
      bond:["Le lien, le soutien ou la coopération peuvent devenir une vraie ressource s’ils reposent sur une implication sincère et partagée.","Ce qui aide le plus vient de la qualité des échanges et de la capacité à construire ensemble plutôt qu’à avancer séparément."],
      opening:["Une nouvelle possibilité peut servir de point d’appui si elle est accueillie sans précipitation.","Une ouverture existe et peut permettre d’envisager la suite autrement, à condition de la traduire progressivement dans les faits."],
      effort:["La ressource la plus solide vient de la régularité, du savoir-faire et de ce qui peut être construit pas à pas.","L’avancée dépend moins d’un coup d’éclat que d’un effort cohérent et suffisamment constant."],
      neutral:["La ressource se trouve dans une manière plus consciente et plus souple d’aborder la situation.","Ce qui peut aider est de laisser émerger une réponse plus claire à partir de faits concrets et d’un positionnement plus serein."]
    },
    evolution:{
      movement:["Désormais, quelque chose recommence à bouger. Un nouvel élan peut relancer la situation, mais il demande encore à être consolidé.","La dynamique retrouve du mouvement et ouvre une nouvelle étape, sans que tout soit pour autant déjà stabilisé."],
      change:["Peu à peu, une transformation se dessine. La manière de vivre ou de comprendre la situation évolue vers quelque chose de différent.","La situation entre dans une phase de mutation où certaines anciennes habitudes perdent de leur importance."],
      freedom:["L’évolution actuelle invite à laisser davantage de place à l’autonomie, au choix personnel et à une respiration plus naturelle.","Peu à peu, la situation cherche un équilibre dans lequel chacun peut conserver son espace sans rompre le lien."],
      ground:["La dynamique se dirige vers davantage de stabilité et de cohérence.","À ce stade, le besoin de construire sur des bases plus sûres devient plus important que la recherche d’un résultat rapide."],
      bond:["La situation devient plus favorable à un rapprochement, à une coopération ou à des échanges plus nourris.","Une qualité de lien plus présente commence à modifier l’équilibre général et peut soutenir la suite."],
      ambiguity:["Quelque chose évolue, mais la direction exacte n’est pas encore entièrement fixée.","Le mouvement est réel, même si tout n’a pas encore pris une forme suffisamment claire pour parler de stabilité."],
      opening:["Une possibilité nouvelle devient plus visible et permet d’envisager la suite avec davantage de souplesse.","La dynamique actuelle laisse apparaître une ouverture qui peut changer progressivement la perspective."],
      effort:["La progression se fait maintenant de manière plus concrète, par étapes successives plutôt que par un changement spectaculaire.","L’évolution repose surtout sur la continuité des efforts et sur la capacité à transformer les intentions en actes."],
      neutral:["Un déplacement s’opère progressivement et invite à considérer la situation autrement qu’au début.","La dynamique continue d’évoluer, sans rupture brutale, vers une configuration encore en train de se préciser."]
    },
    outcome:{
      ambiguity:["Tout n’est cependant pas encore complètement éclairci. Certaines intentions, émotions ou informations peuvent rester discrètes ou difficiles à exprimer.","La suite conserve une part de non-dit ou d’incertitude qui devra progressivement être levée pour comprendre la direction réelle."],
      tension:["Pour avancer durablement, il faudra probablement dépasser un frein encore présent plutôt que prolonger la situation telle qu’elle fonctionne aujourd’hui.","La suite dépend surtout de la capacité à transformer ce qui continue de créer de la tension ou de la retenue."],
      change:["La direction qui se dessine annonce un nouveau chapitre plutôt qu’une simple répétition de ce qui existait auparavant.","La suite semble passer par un véritable changement de cadre ou de manière d’avancer."],
      freedom:["La suite gagne à se construire avec davantage de liberté et de respect du rythme de chacun.","La direction la plus juste semble être celle qui préserve l’autonomie sans empêcher un engagement sincère."],
      ground:["La direction la plus constructive consiste à privilégier ce qui apporte de la stabilité, de la cohérence et un équilibre durable.","La suite paraît demander moins d’intensité immédiate et davantage de bases solides."],
      bond:["La suite peut favoriser un lien plus présent et plus partagé, à condition qu’il se confirme concrètement dans les actes.","La direction devient plus relationnelle et constructive si l’implication reste réellement réciproque."],
      opening:["Une possibilité nouvelle se dessine pour la suite, à condition de ne pas la forcer et de rester attentif à ce qui se confirme réellement.","La suite paraît pouvoir s’ouvrir progressivement, sans exiger que tout soit défini immédiatement."],
      effort:["La suite dépendra surtout de la continuité des actions et de la capacité à consolider ce qui a déjà été entrepris.","L’issue se construira davantage par la régularité et la méthode que par un événement unique."],
      neutral:["La suite reste ouverte et devrait se préciser progressivement au rythme des choix et des événements à venir.","Rien ne semble entièrement figé : la direction se construira surtout à partir de ce qui sera réellement vécu et exprimé."]
    }
  };

  const rel={
    origin:{
      tension:["Une période de ralentissement semble avoir marqué la vie affective, comme si quelque chose avait empêché les sentiments ou la relation d’évoluer pleinement."],
      bond:["Au départ, un attachement réel semble avoir donné au lien sa force et son importance."]
    },
    obstacle:{
      movement:["Une émotion très vive ou un rapprochement soudain peut bouleverser l’équilibre. L’intensité est réelle, mais elle demande du temps pour révéler sa profondeur."]
    },
    resource:{
      change:["Une transformation profonde peut permettre de sortir des anciens schémas et d’aborder les sentiments d’une manière plus juste et plus consciente."]
    },
    evolution:{
      freedom:["Peu à peu, le besoin d’une relation plus équilibrée se fait sentir, avec davantage de respect pour l’espace, le rythme et l’identité de chacun."]
    },
    outcome:{
      ambiguity:["Tout n’est cependant pas encore complètement éclairci. Certains sentiments, certaines intentions ou certaines vérités peuvent rester discrets ou difficiles à exprimer."]
    }
  };

  const work={
    origin:{
      tension:["Le projet semble avoir traversé une phase de ralentissement ou de contrainte qui a limité sa progression initiale."],
      effort:["Le projet s’est construit sur un travail progressif, de l’apprentissage et des efforts déjà engagés."],
      opening:["Le point de départ contient une possibilité concrète qui demande encore à être structurée."]
    },
    obstacle:{
      tension:["Une difficulté concrète ralentit encore l’avancée et mérite d’être traitée avant de chercher à accélérer."],
      ambiguity:["Le principal frein vient d’un manque de visibilité sur les priorités ou la direction à retenir."]
    },
    resource:{
      effort:["La ressource la plus fiable reste le savoir-faire déjà acquis et la capacité à avancer avec méthode."],
      bond:["La coopération, l’aide ou la complémentarité des compétences peuvent apporter un soutien déterminant."]
    },
    evolution:{
      effort:["Le projet progresse maintenant par étapes concrètes et gagne à privilégier la régularité plutôt que la précipitation."],
      opening:["Une nouvelle possibilité se dessine et peut devenir un véritable levier si elle est transformée en action concrète."]
    },
    outcome:{
      ground:["La suite va vers une consolidation, à condition de protéger les acquis tout en conservant suffisamment de souplesse."],
      tension:["Avant de parler d’aboutissement, une difficulté devra encore être résolue de manière concrète."]
    }
  };

  let arr;
  if(sc==='relation'&&rel?.[role]?.[t])arr=rel[role][t];
  else if(sc==='work'&&work?.[role]?.[t])arr=work[role][t];
  else arr=generic?.[role]?.[t]||generic?.[role]?.neutral||[];
  return pick(arr,card,i);
}
function en(card,role,sc,i){
  const t=theme(card,true);
  const bank={
    origin:{
      tension:["The story begins with a period of delay, as though something kept the situation from developing freely."],
      ambiguity:["At first, the situation seems to have settled into uncertainty, without a fully clear direction."],
      change:["The story begins in a period of transition, with an older pattern gradually losing its place."],
      bond:["At first, an important connection or source of support seems to have given the situation its foundation."],
      opening:["The story opens with a new possibility that still needs time to take shape."],
      neutral:["At first, the situation appears to have been in a period of adjustment."]
    },
    obstacle:{
      tension:["The main difficulty comes from a resistance or constraint that is still slowing progress."],
      ambiguity:["The main obstacle is a lack of clarity around what has not yet been fully expressed."],
      movement:["The strength or speed of the momentum can itself be destabilising if it arrives before real stability."],
      neutral:["The main difficulty lies in something that still needs to be understood more clearly."]
    },
    resource:{
      change:["The strongest resource is the ability to accept real transformation instead of preserving the past unchanged."],
      insight:["Clearer understanding and a more lucid view of the facts can help the situation move forward."],
      ground:["The best support comes from rebuilding on a steadier and more concrete foundation."],
      bond:["Connection, cooperation or mutual support can become a genuine resource when the involvement is shared."],
      neutral:["The most useful resource is a calmer and more conscious way of approaching the situation."]
    },
    evolution:{
      movement:["Now, something begins to move again. A fresh impulse can reopen the situation, although it still needs to be consolidated."],
      change:["Gradually, a transformation is taking shape and the way the situation is understood or lived is beginning to change."],
      freedom:["The current evolution calls for more autonomy, personal space and freedom of choice."],
      ground:["The dynamic is moving toward greater stability and coherence."],
      ambiguity:["Something is changing, but the exact direction is not fully settled yet."],
      opening:["A new possibility is becoming more visible and is beginning to change the perspective."],
      neutral:["The dynamic is evolving gradually toward a form that is still taking shape."]
    },
    outcome:{
      ambiguity:["Going forward, not everything is fully clear yet. Some feelings, intentions or information may still remain unspoken."],
      tension:["For lasting progress, an unresolved source of tension will probably need to be addressed rather than carried forward unchanged."],
      change:["The direction ahead points to a new chapter rather than a simple repetition of the past."],
      freedom:["The next phase is best built with greater freedom and respect for each person’s pace."],
      ground:["The most constructive direction is the one that brings greater stability, coherence and balance."],
      opening:["A new possibility remains open, provided it is allowed to develop without being forced."],
      neutral:["The future remains open and is likely to become clearer through what is actually lived and expressed."]
    }
  };
  return pick(bank?.[role]?.[t]||bank?.[role]?.neutral||[],card,i);
}
/* Ouvertures narratives des mineurs : leur définition commence souvent par
   le nom de la carte. Le récit exprime le même sens sans le citer. */
const tarotOpeners=Object.fromEntries([
  [23,'Une énergie créative cherche une forme concrète avant que son élan ne s’épuise.','Creative energy is seeking a practical form before its momentum fades.'],
  [24,'Un horizon plus vaste oblige à choisir entre le connu et une expansion préparée avec soin.','A wider horizon calls for a choice between the familiar and carefully prepared expansion.'],
  [25,'Ce qui a été entrepris commence à produire des effets hors du contrôle immédiat.','What has been set in motion is beginning to bear fruit beyond immediate control.'],
  [26,'Une étape déjà construite offre un espace de stabilité et de réussite partagée.','A step already built offers room for stability and shared achievement.'],
  [27,'Des volontés différentes se confrontent et peuvent stimuler le mouvement ou disperser les forces.','Different aims are meeting and may spur progress or scatter the available energy.'],
  [28,'Un effort devient visible et peut recevoir la reconnaissance qu’il mérite.','An effort is becoming visible and may receive deserved recognition.'],
  [29,'Une position acquise demande à être défendue sans faire de chaque échange un combat.','An established position needs protection without turning every exchange into a battle.'],
  [30,'L’immobilité commence à céder et demande de se préparer à un rythme plus vif.','The standstill begins to give way and calls for readiness for a quicker pace.'],
  [31,'Une fatigue réelle coexiste avec la capacité de tenir encore une limite importante.','Real fatigue coexists with the strength to protect an important boundary.'],
  [32,'Les responsabilités accumulées commencent à peser sur la direction poursuivie.','Accumulated responsibilities are beginning to weigh on the chosen direction.'],
  [33,'Une curiosité vive ouvre la voie à un essai ou à une nouvelle stimulante.','Lively curiosity opens the way to an experiment or encouraging news.'],
  [34,'Une passion pousse à agir vite, avec le risque de perdre le cap en chemin.','Passion urges swift action, with a risk of losing direction along the way.'],
  [35,'Une assurance chaleureuse rend l’initiative plus visible et plus communicative.','Warm confidence makes initiative more visible and easier to share.'],
  [36,'Une vision assumée peut entraîner d’autres personnes si elle laisse aussi une place à leur contribution.','A clear vision can bring others along when it leaves room for their contribution.'],
  [37,'Une émotion nouvelle cherche à circuler et à ouvrir une disponibilité plus grande.','A new feeling is looking for room to move and greater openness.'],
  [38,'Deux sensibilités cherchent un accord dans lequel chacune puisse être reconnue.','Two people or perspectives seek an agreement in which both can be acknowledged.'],
  [39,'La joie partagée et le soutien de proches redonnent de l’élan au lien.','Shared joy and support from others bring fresh energy to the connection.'],
  [40,'Une lassitude passagère rend moins visible une possibilité pourtant encore présente.','Passing weariness is obscuring a possibility that is still there.'],
  [41,'Une perte retient l’attention, mais elle n’efface pas les liens qui demeurent.','A loss commands attention without erasing the ties that remain.'],
  [42,'Un souvenir, une personne ou une ancienne habitude revient dans le présent.','A memory, a person, or an old habit returns to the present.'],
  [43,'Plusieurs possibilités séduisantes se présentent sans offrir encore de choix vérifié.','Several appealing possibilities appear before any one has been tested.'],
  [44,'Ce qui retenait autrefois ne nourrit plus assez pour justifier de rester sans questionner la suite.','What once held things together no longer nourishes them enough to stay without question.'],
  [45,'Un désir peut se réaliser et procurer une satisfaction réelle, sans résoudre tous les autres besoins.','A wish may come true and bring real satisfaction without meeting every other need.'],
  [46,'Une harmonie affective peut trouver une place durable dans un groupe, un foyer ou un lien choisi.','Emotional harmony may find a lasting place in a group, a home, or a chosen bond.'],
  [47,'Un message sensible, un geste tendre ou une intuition nouvelle cherche à être accueilli.','A sensitive message, a tender gesture, or a new intuition seeks a response.'],
  [48,'Une proposition ou une invitation avance avec un élan qui mérite d’être éprouvé dans les actes.','An offer or invitation moves forward with an impulse that still needs to be tested in action.'],
  [49,'Une écoute profonde rend les émotions des autres plus lisibles, sans devoir les porter à leur place.','Deep attention makes others’ feelings easier to understand without carrying them in their place.'],
  [50,'La maîtrise des émotions permet de rester présent sans nier ce qui est ressenti.','Emotional steadiness allows one to remain present without denying what is felt.'],
  [51,'Une vérité devient plus nette et rend possible une parole ou une décision claire.','A truth comes into sharper focus, allowing a clear word or decision.'],
  [52,'Une décision reste suspendue tant que deux positions semblent impossibles à départager.','A decision remains suspended while two positions seem impossible to reconcile.'],
  [53,'Une douleur affective ou une vérité difficile demande à être regardée sans détour.','Emotional pain or a difficult truth needs to be faced directly.'],
  [54,'Une pause utile protège la clarté d’esprit après une période de tension.','A necessary pause protects clarity after a period of strain.'],
  [55,'Un conflit peut coûter plus cher que la victoire qu’il semblait promettre.','A conflict may cost more than the victory it seemed to promise.'],
  [56,'Un passage hors d’une période difficile commence même si toutes les réponses ne sont pas encore là.','A passage out of a difficult period begins before every answer is known.'],
  [57,'La discrétion ou la stratégie devient utile si elle ne sert pas à éviter la vérité.','Discretion or strategy helps when it does not become a way to avoid the truth.'],
  [58,'Des contraintes ou des peurs donnent l’impression d’être enfermé dans une seule lecture possible.','Constraints or fears make one narrow reading of events feel inescapable.'],
  [59,'Une pensée répétée amplifie l’inquiétude au-delà de ce que les faits établissent.','A recurring thought magnifies worry beyond what the facts establish.'],
  [60,'Une manière de poursuivre arrive à sa limite et demande qu’une fin soit reconnue.','One way of carrying on has reached its limit and calls for an ending to be acknowledged.'],
  [61,'Une vigilance curieuse cherche des faits avant de tirer des conclusions.','Curious vigilance looks for facts before drawing conclusions.'],
  [62,'Une décision franche accélère les échanges, mais doit encore laisser de la place à l’écoute.','A direct decision quickens the exchange while still needing to leave room to listen.'],
  [63,'Une lucidité indépendante permet de poser des limites sans perdre la dimension humaine.','Independent clarity makes it possible to set boundaries without losing humanity.'],
  [64,'Une pensée structurée soutient une décision qui résiste mieux à l’impulsion du moment.','Structured thought supports a decision that can outlast the impulse of the moment.'],
  [65,'Une possibilité concrète apparaît dans les ressources, le travail ou la vie matérielle.','A tangible opportunity appears among resources, work, or material circumstances.'],
  [66,'Plusieurs priorités réclament le même temps et appellent une organisation soutenable.','Several priorities compete for the same time and call for a sustainable plan.'],
  [67,'Un savoir-faire partagé et une coopération réelle donnent forme à ce qui se construit.','Shared skill and genuine cooperation give shape to what is being built.'],
  [68,'Le désir de préserver ses acquis crée une base sûre, à condition de ne pas tout figer.','The wish to protect what has been gained creates security if it does not freeze everything in place.'],
  [69,'Un manque matériel ou un sentiment d’exclusion rend l’aide disponible plus difficile à voir.','Material scarcity or a feeling of exclusion makes available help harder to see.'],
  [70,'Les ressources circulent mieux lorsque donner et recevoir préservent la dignité de chacun.','Resources move more freely when giving and receiving preserve everyone’s dignity.'],
  [71,'Un investissement demande du temps avant de montrer pleinement ce qu’il peut produire.','An investment needs time before its full results can be seen.'],
  [72,'Un travail régulier affine peu à peu le geste, la méthode et la confiance.','Regular work gradually refines skill, method, and confidence.'],
  [73,'Une autonomie s’est construite avec le temps, l’effort et des choix tenus.','Independence has grown through time, effort, and sustained choices.'],
  [74,'Une stabilité dépasse l’individu et touche la famille, la transmission ou une structure durable.','Stability extends beyond one person into family, continuity, or a lasting structure.'],
  [75,'Une occasion modeste invite à apprendre et à poser les bases d’une réalisation future.','A modest opportunity invites learning and the foundations of a future achievement.'],
  [76,'Une progression lente mais régulière donne sa force à une démarche fiable.','Slow but steady progress lends strength to a dependable approach.'],
  [77,'Le soin du quotidien et le sens pratique peuvent rendre les ressources plus solides.','Daily care and practical judgment can make resources more secure.'],
  [78,'Une réussite matérielle fondée sur l’expérience demande une gestion responsable.','Material success grounded in experience calls for responsible stewardship.']
].map(([id,fr,en])=>[id,{fr,en}]));
function tarotMixedPart(card,role,sc,i,enMode){
  const id=Number(card.id);
  /* Ces deux arcanes ont un second énoncé de catalogue qui répète le premier.
     Leur prolongement conserve le sens sans répéter sujet et verbe. */
  if(id===28)return enMode
    ?'An effort can become visible and receive recognition. The praise has value when it reflects work actually done, while leaving room to see what still needs care.'
    :'Un effort peut devenir visible et recevoir une reconnaissance méritée. Celle-ci a d’autant plus de valeur qu’elle reflète un travail accompli, sans faire oublier ce qui demande encore de l’attention.';
  if(id===29)return enMode
    ?'An established position needs protection without turning every exchange into a fight. Outside pressure is real, but choosing which boundaries matter helps preserve energy for what is essential.'
    :'Une position acquise demande à être défendue sans faire de chaque échange un combat. La pression extérieure existe, mais choisir les limites qui comptent évite de disperser ses forces.';
  if(id===50)return enMode
    ?'Emotional steadiness makes it possible to stay present without denying what is felt. A calm conversation can then hold even intense feelings without letting them make every decision.'
    :'La maîtrise des émotions permet de rester présent sans nier ce qui est ressenti. Une parole calme peut accueillir des sentiments intenses sans leur laisser décider seuls de la suite.';
  const local=enMode?(card.en||{}):card;
  const definition=String(local.definition||local.meaning||'');
  const title=String(local.name||card.name||'');
  const sentences=definition.match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[];
  const opening=tarotOpeners[Number(card.id)]?.[enMode?'en':'fr'];
  if(opening){
    let tail=sentences.slice(1).join(' ').trim();
    const court=/^(?:Valet|Cavalier|Reine|Roi|Page|Knight|Queen|King)\b/.test(card.name)||/^(?:Page|Knight|Queen|King)\b/.test(card.en?.name||'');
    if(enMode)tail=tail.replace(/^(?:It|He|She)\s+/i,court?'This approach ':'This development ');
    else if(!/^Il peut être nécessaire\b/.test(tail))tail=tail.replace(/^(?:Il|Elle)\s+/i,court?'Cette attitude ':'Cela ');
    return [opening,tail&&!tail.includes(title)?tail:''].filter(Boolean).join(' ');
  }
  if(sentences.length){
    const clean=sentences.filter(sentence=>!sentence.includes(title)).join(' ').trim();
    if(clean){
      const spiritual=String(local.reading_spirituel||'').trim();
      if(id<=22&&spiritual&&!spiritual.includes(title)&&norm(spiritual)!==norm(clean))return clean+' '+spiritual;
      return clean;
    }
  }
  let part=enMode?en(card,role,sc,i):distinctiveFr(card,role,sc)||preciseFr(card,role)||fr(card,role,sc,i);
  part=part.replace(/^(?:Au départ,?\s*|At first,?\s*)/i,'')
    .replace(/^Le récit (?:commence|s’ouvre) (?:sur|dans) /i,'')
    .replace(/^The story (?:begins|opens) with /i,'');
  return part?part.charAt(0).toLocaleUpperCase(enMode?'en':'fr')+part.slice(1):'';
}
/* Les cartouches restent des sens autonomes. Le récit prend dans chaque carte
   une tension et une piste de réponse, puis relie les positions entre elles. */
function tarotMixedNarrative(cards,cardRoles,enMode,reversedAt,sc){
  const key=enMode?'en':'fr';
  const details=cards.map((card,i)=>{
    if(!reversedAt(i))return {card,reversed:false,body:tarotMixedPart(card,cardRoles[i]||'evolution',sc,i,enMode)};
    const meaning=window.CR_TAROT_REVERSED?.[card.id]?.[key]||'';
    const note=window.CR_TAROT_REVERSED_NOTES?.[card.id]?.[key]||'';
    const halves=meaning.split(/\s*;\s*/);
    return {card,reversed:true,observation:halves[0],response:halves.slice(1).join('; '),note};
  });
  const full=d=>d.reversed?[d.observation,d.response].filter(Boolean).join(enMode?'; ':' ; ').replace(/\.?$/,'.'):d.body;
  if(details.length===1){
    const d=details[0];
    return [full(d),d.reversed?d.note:''].filter(Boolean);
  }
  const out=[];
  const first=details[0];
  out.push(full(first));
  if(first.reversed&&first.note&&Number(first.card.id)!==10)out.push(first.note);
  for(let i=1;i<details.length;i++){
    const d=details[i],role=cardRoles[i]||'evolution';
    if(i===1||i===details.length-1||(role==='evolution'&&details.length>=5)){
      const link=tarotPairLink(details[i-1].card,d.card,enMode);
      if(link)out.push(link);
    }
    out.push(full(d));
    if(role==='obstacle'&&!d.reversed){
      const nuance=tarotUprightObstacle(d.card,enMode);
      if(nuance)out.push(nuance);
    }
    if(d.reversed&&d.note&&(i<details.length-1||details.length>=5)&&Number(d.card.id)!==10)out.push(d.note);
  }
  return out;
}
function tarotUprightObstacle(card,enMode){
  const t=theme(card,enMode);
  if(['tension','ambiguity','conflict','heartbreak','loss'].includes(t))return '';
  const id=Number(card.id);
  if(id<=22)return '';
  if(id>=65)return enMode
    ?'Protecting what already works can also leave too little room to try another way forward.'
    :'Préserver ce qui fonctionne déjà peut aussi laisser trop peu de place à une autre manière d’avancer.';
  if(id>=51)return enMode
    ?'Even a useful analysis can stall a choice if it hardens before the facts have been tested.'
    :'Même une analyse utile peut retenir le choix si elle se fige avant que les faits aient été éprouvés.';
  if(id>=37)return enMode
    ?'A genuine feeling still needs room for the other person’s response rather than deciding the direction alone.'
    :'Un sentiment réel a encore besoin de laisser place à la réponse de l’autre, au lieu de décider seul de la direction.';
  if(id>=23)return enMode
    ?'An encouraging impulse can still scatter the effort if it has no clear direction.'
    :'Un élan encourageant peut néanmoins disperser les efforts s’il ne trouve pas de direction claire.';
  return '';
}
function tarotPairLink(previous,current,enMode){
  const family=card=>card.id<=22?'major':card.id<=36?'wands':card.id<=50?'cups':card.id<=64?'swords':'pentacles';
  const a=family(previous),b=family(current);
  if(a===b)return '';
  const fr={
    'cups:pentacles':'Ce qui se ressent doit aussi trouver une place dans les contraintes concrètes.',
    'pentacles:cups':'Les contraintes concrètes finissent par peser sur ce qui peut être vécu et partagé.',
    'major:wands':'Une direction intérieure se précise au contact des gestes réellement posés.',
    'wands:major':'L’élan d’agir soulève une question qui dépasse le seul résultat immédiat.',
    'wands:cups':'Une avancée visible ne dit pas encore comment les émotions pourront être accueillies.',
    'cups:wands':'Ce qui touche demande maintenant à se traduire dans les actes.',
    'swords:pentacles':'Une décision claire doit également tenir compte des moyens disponibles.',
    'pentacles:swords':'Les faits du quotidien rendent plus urgente la mise au clair des choix.',
    'swords:cups':'Une parole juste doit aussi laisser de la place à ce qui est ressenti.',
    'cups:swords':'Ce qui est ressenti gagnerait à être nommé avec précision.',
    'major:cups':'Cette question plus profonde rejoint aussi la manière de vivre les émotions.',
    'cups:major':'L’émotion présente ouvre sur une question plus large de direction.',
    'major:pentacles':'Une direction personnelle se mesure aussi à ce qu’elle permet dans le quotidien.',
    'pentacles:major':'Les limites du quotidien invitent à revoir la direction prise.',
    'wands:pentacles':'L’énergie du moment a besoin d’une place réelle dans le quotidien.',
    'pentacles:wands':'Une base concrète peut donner une portée nouvelle à l’initiative.',
    'major:swords':'Ce qui se joue en profondeur demande aussi des mots et des choix clairs.',
    'swords:major':'La décision visible engage également une orientation plus personnelle.',
    'wands:swords':'L’envie d’agir demande encore à être éclairée par les faits.',
    'swords:wands':'Une pensée claire ne portera ses fruits que si elle trouve un geste juste.'
  };
  const en={
    'cups:pentacles':'What is felt also needs a real place among everyday demands.',
    'pentacles:cups':'Practical demands shape what can actually be felt and shared.',
    'major:wands':'An inner direction becomes clearer through actions actually taken.',
    'wands:major':'The urge to act raises a question larger than an immediate result.',
    'wands:cups':'Visible progress does not yet say how feelings will be received.',
    'cups:wands':'What matters emotionally now needs to find expression in action.',
    'swords:pentacles':'A clear decision must also account for the resources available.',
    'pentacles:swords':'Everyday facts make it more urgent to clarify the choice.',
    'swords:cups':'Clear words must also make room for what is felt.',
    'cups:swords':'What is felt would benefit from being named more precisely.',
    'major:cups':'The deeper question also reaches into how feelings are lived.',
    'cups:major':'The present feeling opens onto a larger question of direction.',
    'major:pentacles':'A personal direction also needs to work in everyday life.',
    'pentacles:major':'Everyday limits invite a closer look at the direction taken.',
    'wands:pentacles':'The current energy needs a real place in daily life.',
    'pentacles:wands':'A practical foundation can give new reach to an initiative.',
    'major:swords':'What runs deeper also calls for clear words and choices.',
    'swords:major':'The visible decision also carries a more personal direction.',
    'wands:swords':'The wish to act still needs to be informed by facts.',
    'swords:wands':'Clear thought bears fruit when it finds a fitting action.'
  };
  return (enMode?en:fr)[a+':'+b]||'';
}
/* Keep the selected domain's actual meaning; never infer it from polarity or
   incidental keywords. Removing a title must preserve a grammatical subject. */
function groundedText(raw,card,enMode){
  let text=String(raw||'').trim();
  const title=enMode?(card.en?.name||card.name):card.name;
  const quote=s=>String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  text=text.replace(/^(?:Sur le plan [^,]+|Dans le cadre [^,]+|Dans une relation|Dans le travail),?\s*/i,'');
  if(title)text=text.replace(new RegExp('(^|[.!?]\\s+)(?:«\\s*)?'+quote(title)+'(?:\\s*»)?(?=\\s|[,;:])','gi'),'$1Cette lecture');
  text=text.replace(/(^|[.!?]\s+)(?:cette carte|la carte|cette lecture|elle)\s+(?:vous\s+)?/gi,'$1@ ');
  const replacements=[
    [/^@ demande de ne pas /i,'Il convient de ne pas '],
    [/^@ (?:invite à|demande de|encourage à) /i,'Vous pouvez '],
    [/^@ (?:rappelle|montre|indique|signale|enseigne) qu[’']/i,''],
    [/^@ (?:rappelle|montre|indique|signale|enseigne) que /i,''],
    [/^@ confirme qu[’']/i,''],
    [/^@ confirme que /i,''],
    [/^@ confirme /i,'Les faits confirment '],
    [/^@ (?:annonce|signale|indique|décrit|évoque|représente|désigne|symbolise|exprime|marque)(?: ou (?:annonce|signale|indique|décrit|évoque|représente|désigne|symbolise|exprime|marque))? /i,'Cela révèle '],
    [/^@ parle de (?=(?:un|une|le|la|les|des)\b|l[’'])/i,'Cela révèle '],
    [/^@ parle d[’'](?=(?:un|une|le|la|les|des)\b|l[’'])/i,'Cela révèle '],
    [/^@ parle de /i,'Cela fait état de '],
    [/^@ parle d[’']/i,'Cela fait état d’'],
    [/^@ met en lumière /i,'Cela révèle '],
    [/^@ peut marquer /i,'Vous pouvez traverser '],
    [/^@ aide à /i,'Vous pouvez '],
    [/^@ oblige à /i,'Il devient nécessaire de '],
    [/^@ parle d[’']/i,'Cela révèle '],
    [/^@ demande d[’']/i,'Il est nécessaire d’'],
    [/^@ /i,'Cela ']
  ];
  return (text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[]).map(sentence=>{
    let s=sentence.trim().replace(/^(?:Au départ|Aujourd’hui|À partir de là|Pour la suite|At first|Initially),?\s*/i,'');
    s=s.replace(/^(?=(?:Indique|Désigne|Annonce|Représente|Signale|Évoque|Symbolise|Met|Parle|Montre|Place|Décrit|Exprime|Rappelle|Favorise|Ouvre|Fait|Invite|Avertit|Confirme)\b)/,'@ ');
    for(const [pattern,replacement] of replacements)s=s.replace(pattern,replacement);
    s=s.replace(/;\s*(?:la carte|elle) invite à /gi,' ; vous pouvez ');
    s=s.replace(/^Cela (Favorise|Ouvre|Fait|Place|Montre|Rappelle|Invite|Avertit)\b/,(m,v)=>'Cela '+v.charAt(0).toLocaleLowerCase()+v.slice(1));
    s=s.replace(/Vous pouvez se /g,'Il est possible de se ').replace(/, et que /g,', et ');
    return s?s.charAt(0).toLocaleUpperCase()+s.slice(1):'';
  }).join(' ');
}
function groundedPart(card,enMode){
  const local=enMode?(card.en||{}):card;
  const d=norm(state.domain);
  const field=/profession|projet|work|career/.test(d)?'reading_professionnel':/general|spirit/.test(d)?'reading_spirituel':'reading_relationnel';
  const precise={
    Vision:'Votre intuition vous aide à envisager une direction et à replacer les événements dans une perspective plus large.',
    Lune:'L’écoute de votre monde intérieur prend une place particulière : vos émotions, vos rêves ou certaines coïncidences peuvent éclairer progressivement ce qui vous échappait. Prenez le temps d’observer ce que vous ressentez avant d’agir.',
    Bonheur:'Une harmonie intérieure peut se nourrir de gratitude et d’une attention à ce qui vous fait déjà du bien. Vous pouvez accueillir ces moments heureux sans attendre que tout soit parfait.'
  };
  if(!enMode&&state.oracle==='cristariva'&&field==='reading_spirituel'&&precise[card.name])return precise[card.name];
  const raw=local[field]||local.meaning||local.definition||'';
  return groundedText(raw,card,enMode);
}

function roleGrounded(text,role,enMode){
  const firstLead=enMode
    ?{origin:'The situation',obstacle:'The difficulty',resource:'This strength',evolution:'The development',outcome:'The overall picture'}
    :{origin:'La situation',obstacle:'La difficulté',resource:'Cette force',evolution:'L’évolution',outcome:'La synthèse'};
  const firstReveal=enMode
    ?{origin:'The situation highlights',obstacle:'The difficulty reveals',resource:'This strength brings',evolution:'The development brings out',outcome:'The overall picture highlights'}
    :{origin:'La situation met en lumière',obstacle:'L’obstacle met en évidence',resource:'Cette force apporte',evolution:'L’évolution fait apparaître',outcome:'La synthèse met en évidence'};
  const continuationReveal=enMode
    ?{origin:'This situation also shows',obstacle:'This tension also shows',resource:'This strength also supports',evolution:'This development also highlights',outcome:'This perspective also underlines'}
    :{origin:'Cette situation souligne aussi',obstacle:'Cette tension souligne aussi',resource:'Cette force soutient aussi',evolution:'Cette dynamique souligne',outcome:'Cette perspective souligne aussi'};
  let introduced=false;
  const source=String(text||'');
  return source.replace(/\b(?:Cela révèle|Cela|This experience)\b/g,(match,offset)=>{
    const before=source.slice(0,offset).trim();
    const continuation=introduced||Boolean(before);
    introduced=true;
    if(/révèle/i.test(match)){
      return (continuation?continuationReveal:firstReveal)[role]||(enMode?'The situation highlights':'La situation met en lumière');
    }
    if(continuation)return enMode?'It':'Elle';
    return firstLead[role]||(enMode?'The situation':'La situation');
  });
}

function build(cards){
  if(!Array.isArray(cards)||!cards.length)return '';
  const enMode=state.lang==='en', chosen=cards.slice(0,12), r=roles(chosen.length);
  const reversedAt=i=>state.oracle==='tarot'&&state.draw?.[i]===chosen[i]&&state.tarotReversed?.[i]===true;
  const sc=scope();
  const parts=chosen.map((card,i)=>{
    let part='';
    if(reversedAt(i)){
      part=groundedText(window.CR_TAROT_REVERSED?.[card.id]?.[enMode?'en':'fr']||'',card,enMode);
    }else if(state.oracle==='tarot'){
      part=groundedText(tarotMixedPart(card,r[i],sc,i,enMode),card,enMode);
    }else if(enMode){
      /* The card definition stays in the card commentary. The story must
         interpret the card's role in the spread instead of paraphrasing it. */
      part=en(card,r[i],sc,i);
    }else{
      /* Prefer a distinctive symbolic motif, then a role-specific reading,
         then the broad thematic fallback. Never reuse the displayed
         definition here: that would merely duplicate the card commentary. */
      part=distinctiveFr(card,r[i],sc)||preciseFr(card,r[i])||fr(card,r[i],sc,i);
    }
    return roleGrounded(part,r[i],enMode);
  }).filter(Boolean);
  // Position affects the reading, but transitions should read as one story.
  if(chosen.length===5&&parts.length===5){
    const lower=s=>s?s.charAt(0).toLocaleLowerCase()+s.slice(1):s;
    parts[1]=(enMode?'However, ':'Cependant, ')+lower(parts[1]);
    parts[2]=(enMode?'A determining element nevertheless emerges: ':'Un élément déterminant apparaît néanmoins : ')+lower(parts[2]);
    parts[3]=(enMode?'The situation then evolves: ':'La situation évolue ensuite : ')+lower(parts[3]);
    parts[4]=(enMode?'Finally, ':'Enfin, ')+lower(parts[4]);
  }
  const seen=new Set();
  const narrative=parts.join(' ').match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[];
  let body=narrative.filter(s=>{const key=norm(s).trim();if(seen.has(key))return false;seen.add(key);return true;}).join(' ').replace(/\s+/g,' ').trim();
  const q=String(state.question||'').trim();
  const question=q?`<p class="reading-question">${enMode?'Your question':'Votre question'} : « ${esc(q)} »</p>`:'';
  return `<div class="story-reading" data-story-engine="universal-fluid-${VERSION}"><h3>${enMode?'The story told by your cards':'L’histoire racontée par vos cartes'}</h3>${question}<p class="story-continuous">${esc(body)}</p></div>`;
}

storyInterpretation=build;
interpretation=build;
window.CR_UNIVERSAL_FLUID_STORY=build;
window.CR_UNIVERSAL_FLUID_STORY_VERSION=VERSION;

function refresh(){
  try{
    if(!state?.draw?.length)return;
    for(const id of ['reading','interpretation','readingResult','story','result']){
      const el=document.getElementById(id);
      if(el&&/L’histoire racontée par vos cartes|The story told by your cards/.test(el.textContent||'')){
        el.innerHTML=build(state.draw);
        break;
      }
    }
  }catch(e){}
}
try{refresh();}catch(e){}
window.addEventListener('pageshow',refresh);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refresh();});
})();

