/* CRISTARIVA — synthèse générale reformulée v3.6.6
   La conclusion finale conserve les idées des analyses précédentes mais
   les réécrit avec un autre vocabulaire, d'autres enchaînements et une
   formulation réellement synthétique. */
const CRISTARIVA_SYNTHESIS_FRENCH_FIX_VERSION='3.6.7';
const cr366LegacyGlobalSynthesis=typeof cr362GlobalSynthesis==='function'?cr362GlobalSynthesis:null;

function cr366Esc(v){try{return typeof cr362Esc==='function'?cr362Esc(v):String(v||'');}catch(e){return String(v||'');}}

function cr366RelationIdea(){
  const id=Number(state?.relation?.id||0),intent=typeof cr33Intent==='function'?cr33Intent():{};
  const fr={
    96:'la proximité semble devoir s’installer d’abord sur un terrain amical avant de pouvoir gagner en profondeur',
    97:'les attaches familiales ou un cadre déjà connu paraissent peser fortement sur la suite',
    98:'la dynamique peut évoluer vers une véritable place de partenaire si cette orientation se confirme dans les faits',
    99:'une responsabilité de protection, de famille ou d’enfant semble compter dans la manière dont la situation se construit',
    100:'une personne encore nouvelle dans votre histoire pourrait prendre progressivement davantage de place',
    101:'la relation semble surtout structurée par une proximité fraternelle ou très familière',
    102:'un élément affectif du passé paraît susceptible de refaire surface sous une forme renouvelée',
    103:'le cadre professionnel ou quotidien pourrait jouer un rôle important dans la naissance ou l’évolution des échanges',
    104:'une personne occupant une position d’autorité ou de responsabilité semble particulièrement concernée',
    105:'quelqu’un déjà aperçu ou légèrement connu pourrait devenir plus important à mesure que les échanges se développent',
    106:'la situation paraît ouvrir la porte à une personne qui n’est pas encore clairement identifiée',
    107:'la comparaison, la concurrence ou une rivalité peuvent compliquer une dynamique qui aurait autrement davantage d’espace pour évoluer',
    108:'la confiance et la confidence semblent constituer le terrain principal sur lequel la proximité peut s’approfondir',
    109:'l’attirance semble être le point de départ, avant que la nature réelle de la relation ne se précise',
    110:'la rencontre ou l’évolution pourrait naître d’un contexte pratique, professionnel ou de réseau avant de prendre une portée plus personnelle',
    111:'une forme de distance paraît faire partie de la situation dès le départ et devra être intégrée à son évolution',
    112:'un lien ancien pourrait reprendre place dans votre vie, mais selon des modalités différentes de celles du passé',
    113:'une personne déjà sensible à votre présence pourrait devenir plus explicite dans sa manière de se manifester',
    114:'une personne qui conseille, transmet ou sert de repère pourrait jouer un rôle déterminant',
    115:'une présentation, un intermédiaire ou une mise en relation semble pouvoir provoquer le mouvement attendu'
  };
  if(fr[id])return fr[id];
  if(intent.past)return 'quelque chose d’ancien ou d’inachevé semble revenir dans le champ actuel';
  if(intent.newPerson)return 'une présence nouvelle paraît pouvoir entrer progressivement dans la situation';
  if(intent.work)return 'le développement semble devoir passer par un cadre concret, professionnel ou lié à un projet';
  if(intent.sexual)return 'une dimension d’attirance physique semble importante, mais elle ne prend sens que si elle est réciproque';
  return 'la situation paraît pouvoir gagner en netteté à mesure que les faits se précisent';
}

function cr366OutcomeIdea(cards){
  if(!Array.isArray(cards)||!cards.length)return '';
  let key='neutral';
  try{if(typeof finalSemanticKey==='function')key=finalSemanticKey(cards[cards.length-1]);}catch(e){}
  const fr={
    projection:'La prudence consiste surtout à ne pas confondre ce qui est réellement en train de se construire avec ce que l’imagination pourrait lui ajouter trop vite.',
    jealousy:'La suite gagnera en qualité si la confiance prend le dessus sur les comparaisons, les inquiétudes ou la peur de perdre sa place.',
    reconcile:'Un rapprochement reste envisageable, mais il aura davantage de valeur s’il crée une nouvelle façon d’être ensemble au lieu de reproduire l’ancien scénario.',
    past:'Le passé reste influent, sans pour autant devoir imposer sa forme à ce qui peut maintenant émerger.',
    hidden:'Tout ne semble pas encore visible ; la signification réelle de la situation devrait se dévoiler progressivement.',
    delay:'La suite paraît demander du temps : l’évolution se ferait davantage par consolidation progressive que par accélération soudaine.',
    emotion:'L’intensité ressentie compte, mais elle gagnera à laisser suffisamment d’espace aux faits pour préciser ce qui existe réellement.',
    separation:'Une réserve ou une distance demeure et peut ralentir le passage vers quelque chose de plus concret.',
    bond:'Le potentiel existe, mais sa solidité dépendra surtout de la continuité et de la réciprocité observables.',
    truth:'La situation devrait devenir plus simple à comprendre lorsque les intentions seront exprimées sans détour.',
    new:'Ce qui s’ouvre semble davantage annoncer un nouveau chapitre qu’une répétition exacte de ce qui a déjà été vécu.',
    change:'La dynamique peut vous conduire vers une forme de relation différente de celle que vous aviez d’abord imaginée.',
    choice:'La situation prendra une direction plus nette lorsqu’une décision ou un positionnement clair remplacera l’entre-deux.',
    strength:'Ce qui pourra durer reposera surtout sur la régularité, la fiabilité et l’accord entre ce qui est dit et ce qui est fait.',
    positive:'Le climat général reste encourageant, à condition que les possibilités entrevues trouvent ensuite une traduction concrète.',
    work:'Les conditions pratiques et l’organisation autour de la situation auront un poids réel dans son évolution.',
    money:'La stabilité matérielle jouera un rôle non négligeable dans la possibilité de donner davantage de place à cette situation.',
    spirit:'Cette expérience peut produire autant un changement de regard intérieur qu’un événement extérieur.',
    neutral:'La suite reste ouverte et prendra surtout sa forme à partir de la qualité réelle des prochains échanges.'
  };
  return fr[key]||fr.neutral;
}

function cr366NatalLens(a){
  if(!a||typeof cr34BigThree!=='function')return '';
  try{
    const big=cr34BigThree(a,false),sun=big?.sun||'',moon=big?.moon||'';
    const sunMap={
      'Bélier':'un tempérament qui cherche à agir franchement et à sentir que les choses avancent',
      'Taureau':'une personnalité qui privilégie la continuité, la fiabilité et ce qui peut durer',
      'Gémeaux':'une grande mobilité d’esprit et un besoin de comprendre par l’échange',
      'Cancer':'une forte sensibilité aux climats affectifs et au sentiment de sécurité',
      'Lion':'un besoin d’exprimer pleinement ce qui vous anime et d’être reconnu pour ce que vous apportez',
      'Vierge':'un regard attentif, analytique et soucieux de cohérence concrète',
      'Balance':'une recherche d’équilibre, de dialogue et d’harmonie dans les interactions',
      'Scorpion':'une manière intense de vivre les situations et une attention particulière à la confiance',
      'Sagittaire':'un besoin d’espace, de sens et de perspectives capables d’ouvrir l’horizon',
      'Capricorne':'une personnalité qui avance mieux lorsqu’elle peut construire sur des bases solides',
      'Verseau':'un fort besoin d’autonomie intellectuelle et de liberté dans votre façon de choisir',
      'Poissons':'une grande réceptivité aux ambiances, aux émotions et aux signaux subtils'
    };
    const moonMap={
      'Bélier':'des réactions affectives spontanées et un besoin de franchise émotionnelle',
      'Taureau':'un besoin marqué de sécurité, de continuité et de repères affectifs tangibles',
      'Gémeaux':'le besoin de comprendre vos émotions en les mettant en mots',
      'Cancer':'une recherche forte de proximité et de sécurité émotionnelle',
      'Lion':'un besoin d’affection explicite, de chaleur et de reconnaissance',
      'Vierge':'le besoin de comprendre et d’ordonner ce que vous ressentez avant de l’exprimer',
      'Balance':'une recherche de réciprocité et d’équilibre dans la vie affective',
      'Scorpion':'une vie émotionnelle profonde, intense et rarement superficielle',
      'Sagittaire':'un besoin de mouvement et de liberté pour conserver votre élan intérieur',
      'Capricorne':'des sentiments profonds qui demandent du temps avant de se montrer pleinement',
      'Verseau':'le besoin de conserver une part d’autonomie et de recul dans vos émotions',
      'Poissons':'un besoin de douceur, d’apaisement et de compréhension émotionnelle'
    };
    const identity=sunMap[sun]||'une sensibilité personnelle qui vous fait réagir fortement à ce qui vous entoure';
    const emotion=moonMap[moon]||'un besoin de sécurité affective suffisamment clair pour vous sentir en confiance';
    return `Votre thème associe ${identity} à ${emotion}. Cette combinaison peut vous faire pressentir rapidement qu’un échange possède un potentiel, tout en vous rendant plus serein lorsque ce ressenti est confirmé par des comportements réguliers et concrets.`;
  }catch(e){return '';}
}

function cr366TransitEffect(hit){
  if(!hit)return '';
  const support={
    'Jupiter':'favorise un climat plus ouvert, confiant et réceptif aux possibilités',
    'Vénus':'met davantage en valeur l’agrément, l’attirance et la qualité des échanges',
    'Mars':'donne plus d’élan pour exprimer, décider ou mettre quelque chose en mouvement',
    'Saturne':'aide à consolider ce qui mérite de durer en demandant patience et réalisme',
    'Uranus':'peut provoquer une ouverture inattendue, un changement de rythme ou une surprise libératrice',
    'Neptune':'accentue la sensibilité, l’intuition et la perception de ce qui reste implicite'
  };
  const challenge={
    'Jupiter':'peut amplifier les attentes et demander davantage de mesure avant de tirer des conclusions',
    'Vénus':'peut rendre les attentes affectives plus sensibles et demander un meilleur équilibre',
    'Mars':'peut accroître l’impatience ou pousser à agir avant que tout soit suffisamment clair',
    'Saturne':'rappelle les limites, les délais ou les conditions qu’il faut accepter avant d’avancer',
    'Uranus':'peut introduire de l’imprévu et rendre la situation moins facile à stabiliser immédiatement',
    'Neptune':'peut brouiller les repères et rendre nécessaire une distinction plus nette entre intuition et projection'
  };
  return (hit.tone==='challenge'?challenge:support)[hit.tr]||'met davantage en relief les enjeux de cette période';
}

function cr366Timing(a){
  if(!a||!state?.date)return '';
  try{
    const intent=typeof cr33Intent==='function'?cr33Intent():{};
    const theme=typeof cr3DominantTheme==='function'?cr3DominantTheme(state.draw||[],false):null;
    const window=typeof cr3TimingWindow==='function'?cr3TimingWindow(state.date,cr3ReadingMoment(),false):null;
    let hits=[];
    if(window&&typeof cr37RelevantWindows==='function')hits=cr37RelevantWindows(a,theme,window,intent)||[];
    let hit=hits[0]||null;
    if(!hit&&window&&typeof cr3PeriodSummary==='function'&&typeof cr33BestWindow==='function'){
      const period=cr3PeriodSummary(a,theme,window,false);
      hit=cr33BestWindow(period,intent);
    }
    if(!hit)return 'Le calendrier astrologique reste trop diffus pour faire d’une date précise le repère principal de la conclusion.';
    const date=typeof cr3Date==='function'?cr3Date(hit.bestDate,false):'';
    const aspect=String(hit.name||'').toLowerCase(),tr=String(hit.tr||''),na=String(hit.na||'');
    const adjective=['Lune','Vénus'].includes(na)?'natale':'natal';
    const connector=aspect==='conjonction'?'avec':'à';
    return `Côté calendrier, le passage le plus porteur se situe autour du ${date}. Le ${aspect} de ${tr} ${connector} votre ${na} ${adjective} ${cr366TransitEffect(hit)}.`;
  }catch(e){return '';}
}

function cr367Scope(){
  const d=String(state?.domain||'').toLowerCase();
  if(/général|general|spirit/.test(d))return 'general';
  if(/profession|projet|work/.test(d))return 'work';
  return 'relation';
}

function cr367GeneralCardThread(cards){
  const names=(cards||[]).map(c=>String(c?.name||'').toLowerCase());
  const parts=[];
  if(names.some(n=>/éveil|eveil/.test(n)))parts.push('une prise de conscience plus fine semble déjà engagée');
  if(names.some(n=>/ancrage/.test(n)))parts.push('elle demande maintenant à être traduite dans la vie quotidienne, les choix et les faits');
  if(names.some(n=>/rythme|cycle/.test(n)))parts.push('la suite gagne à respecter votre propre rythme plutôt qu’à chercher une réponse immédiate et définitive');
  if(names.some(n=>/origine/.test(n)))parts.push('une partie de la réponse semble se trouver dans ce qui vous a construit en profondeur');
  if(names.some(n=>/retour|passé|passe/.test(n)))parts.push('un thème ancien revient surtout pour être compris autrement et réintégré à votre trajectoire');
  if(names.some(n=>/percée|percee|ouverture/.test(n)))parts.push('un verrou peut céder et rendre la direction plus claire');
  if(parts.length)return cr365Cap?cr365Cap(parts.join(' ; '))+'.':parts.join(' ; ')+'.';
  return 'Le tirage décrit surtout une évolution intérieure qui cherche à devenir plus consciente, plus cohérente et plus concrète.';
}

function cr367GeneralRelationContext(){
  const id=Number(state?.relation?.id||0);
  if(!id)return '';
  const map={
    96:'un ami, un cercle amical ou une relation de confiance peut servir de relais dans cette évolution',
    97:'la famille, les racines ou l’entourage proche peuvent constituer un contexte important pour comprendre ou faire avancer cette question',
    98:'un partenaire ou une collaboration suivie peut aider à donner une forme concrète à ce qui se dessine',
    99:'une responsabilité envers un enfant, une personne à protéger ou un engagement de soin peut jouer un rôle structurant',
    100:'une personne nouvelle peut apporter un regard, une information ou une impulsion utile sans que la question devienne pour autant sentimentale',
    101:'un frère, une sœur ou une relation fraternelle peut servir de point de repère ou de soutien',
    102:'une personne ou une situation du passé peut revenir comme élément de compréhension ou comme point de comparaison',
    103:'le milieu professionnel quotidien peut fournir un cadre concret où cette orientation prend forme',
    104:'une personne en position d’autorité, de direction ou de responsabilité peut influencer la mise en œuvre de cette évolution',
    105:'une connaissance déjà présente dans votre environnement peut jouer un rôle plus utile ou plus révélateur qu’il n’y paraît',
    106:'une personne encore inconnue peut introduire une perspective nouvelle, sans que cela implique nécessairement une relation affective',
    107:'un contexte de comparaison, de concurrence ou de rivalité peut vous obliger à clarifier ce qui compte réellement pour vous',
    108:'une personne de confiance ou un confident peut vous aider à mettre des mots sur ce que vous cherchez',
    109:'une personne, une activité ou une possibilité qui exerce une forte attraction peut agir comme révélateur de ce qui vous motive profondément',
    110:'un projet, un réseau, une activité professionnelle ou une mise en relation concrète peut devenir le terrain où cette orientation trouve une application réelle',
    111:'la distance — géographique, sociale ou symbolique — peut vous obliger à élargir votre perspective ou à changer de cadre',
    112:'un ancien contact ou une ancienne situation peut retrouver une utilité nouvelle dans votre cheminement',
    113:'une personne déjà attentive à vous peut offrir un appui, un retour ou une occasion utile à votre progression',
    114:'un conseiller, un enseignant, un mentor ou une personne ressource peut jouer un rôle de transmission important',
    115:'un intermédiaire, une présentation ou un réseau peut ouvrir l’accès à une personne, un projet ou une opportunité utile'
  };
  const text=map[id]||'une personne ou un contexte extérieur peut apporter un élément utile à la compréhension de cette question';
  return `La carte Relation intervient ici comme un contexte complémentaire : ${text}.`;
}

function cr367GeneralOutcome(cards){
  if(!Array.isArray(cards)||!cards.length)return '';
  let key='neutral';
  try{if(typeof finalSemanticKey==='function')key=finalSemanticKey(cards[cards.length-1]);}catch(e){}
  const map={
    projection:'La réponse demande de distinguer clairement intuition, idéal et réalité concrète afin de ne pas donner trop vite un sens définitif à ce qui reste encore ouvert.',
    jealousy:'Les comparaisons avec les autres risquent surtout de détourner l’attention de votre propre direction.',
    reconcile:'L’enjeu semble moins de revenir en arrière que de réintégrer une ancienne expérience avec une compréhension nouvelle.',
    past:'Le passé apporte un matériau utile, mais il ne doit pas décider à lui seul de la direction présente.',
    hidden:'Une part de la réponse n’est pas encore complètement visible et devrait se préciser à mesure que l’expérience avance.',
    delay:'Cette orientation paraît devoir mûrir progressivement plutôt que se révéler d’un seul coup.',
    emotion:'Le ressenti est important, mais il gagne à être traduit en décisions et en repères concrets.',
    separation:'Une prise de distance peut être nécessaire pour retrouver une direction plus personnelle.',
    bond:'Les personnes qui vous entourent peuvent compter, mais elles servent surtout de miroir ou de soutien à votre propre cheminement.',
    truth:'La compréhension devrait devenir plus nette à mesure que vous nommez plus précisément ce qui vous anime et ce que vous refusez.',
    new:'Le tirage ouvre vers une phase nouvelle où votre manière de donner du sens à votre parcours peut évoluer.',
    change:'Un changement de repères semble nécessaire pour faire émerger une direction plus juste pour vous.',
    choice:'La réponse passe par un choix assumé plutôt que par le maintien de plusieurs directions concurrentes.',
    strength:'Ce qui mérite d’être poursuivi se reconnaîtra surtout à sa capacité à rester cohérent et viable dans la durée.',
    positive:'Le mouvement général est favorable à une clarification et à une mise en œuvre plus concrète.',
    work:'Le travail, l’organisation ou un projet peuvent devenir un terrain d’application important de ce que vous cherchez à construire.',
    money:'Les conditions matérielles comptent surtout comme support permettant à une orientation intérieure de devenir réalisable.',
    spirit:'Le tirage met l’accent sur une évolution de conscience et sur une manière différente de comprendre votre place ou votre trajectoire.',
    neutral:'La direction se précisera surtout lorsque ce qui est compris intérieurement commencera à se traduire dans des choix concrets.'
  };
  return map[key]||map.neutral;
}

function cr367GeneralNatalLens(a){
  if(!a||typeof cr34BigThree!=='function')return '';
  try{
    const big=cr34BigThree(a,false),sun=big?.sun||'',moon=big?.moon||'',asc=big?.asc||'';
    const sunMap={
      'Bélier':'un besoin d’avancer par l’action et l’initiative',
      'Taureau':'une recherche de stabilité, de continuité et de résultats tangibles',
      'Gémeaux':'un besoin de comprendre, d’explorer et de relier les idées entre elles',
      'Cancer':'une forte sensibilité à ce qui nourrit, protège et donne un sentiment d’appartenance',
      'Lion':'un besoin d’exprimer votre singularité et de créer quelque chose qui porte votre marque',
      'Vierge':'une recherche d’utilité, de cohérence et d’amélioration concrète',
      'Balance':'une recherche d’équilibre, de justice et de qualité dans les interactions',
      'Scorpion':'un besoin d’aller au fond des choses et de transformer ce qui ne peut plus rester en l’état',
      'Sagittaire':'une recherche de sens, d’élargissement et de perspectives nouvelles',
      'Capricorne':'un besoin de bâtir quelque chose de solide, structuré et durable',
      'Verseau':'un besoin d’autonomie, d’originalité et de contribution à quelque chose de plus large',
      'Poissons':'une forte réceptivité intuitive et une attention spontanée aux dimensions sensibles ou symboliques de l’existence'
    };
    const moonMap={
      'Bélier':'des besoins émotionnels qui réclament franchise et mouvement',
      'Taureau':'un besoin intérieur de stabilité, de continuité et de preuves concrètes',
      'Gémeaux':'un besoin de mettre les expériences en mots pour mieux les comprendre',
      'Cancer':'un besoin de sécurité émotionnelle et de continuité affective',
      'Lion':'un besoin de chaleur, de reconnaissance et d’expression personnelle',
      'Vierge':'un besoin d’ordonner et de comprendre ce que vous ressentez',
      'Balance':'un besoin d’harmonie et de juste équilibre avec votre environnement',
      'Scorpion':'une vie intérieure intense qui cherche des expériences profondes plutôt que superficielles',
      'Sagittaire':'un besoin de liberté, d’espace et de perspectives pour rester intérieurement vivant',
      'Capricorne':'un besoin de structure et de maîtrise avant de vous engager pleinement',
      'Verseau':'un besoin d’autonomie intérieure et de recul',
      'Poissons':'un besoin de douceur, de sens et de résonance émotionnelle'
    };
    const ascMap={
      'Vierge':'Votre manière d’avancer vous pousse en outre à vérifier, organiser et rendre les choses praticables.',
      'Bélier':'Votre manière d’avancer vous pousse en outre à tester rapidement les possibilités par l’action.',
      'Taureau':'Votre manière d’avancer vous pousse en outre à privilégier ce qui peut durer et se stabiliser.',
      'Gémeaux':'Votre manière d’avancer vous pousse en outre à apprendre, échanger et multiplier les angles de vue.',
      'Cancer':'Votre manière d’avancer vous pousse en outre à protéger ce qui a une valeur affective pour vous.',
      'Lion':'Votre manière d’avancer vous pousse en outre à assumer davantage votre expression personnelle.',
      'Balance':'Votre manière d’avancer vous pousse en outre à rechercher un équilibre juste entre vous et les autres.',
      'Scorpion':'Votre manière d’avancer vous pousse en outre à approfondir et à ne pas vous satisfaire d’une réponse superficielle.',
      'Sagittaire':'Votre manière d’avancer vous pousse en outre à élargir votre horizon et à chercher une direction porteuse de sens.',
      'Capricorne':'Votre manière d’avancer vous pousse en outre à structurer progressivement ce que vous voulez construire.',
      'Verseau':'Votre manière d’avancer vous pousse en outre à préserver votre indépendance et votre originalité.',
      'Poissons':'Votre manière d’avancer vous pousse en outre à suivre ce qui résonne intérieurement avant de lui donner une forme concrète.'
    };
    const identity=sunMap[sun]||'une manière personnelle de chercher du sens et de donner une direction à votre parcours';
    const emotion=moonMap[moon]||'un besoin intérieur de cohérence et de sécurité';
    const ascText=ascMap[asc]||'';
    return `Votre thème combine ${identity} avec ${emotion}. ${ascText} Pour une question de sens ou d’orientation, ce mélange suggère que ce qui vous correspond durablement doit à la fois résonner intérieurement et pouvoir prendre une forme concrète dans votre vie.`.replace(/\s+/g,' ').trim();
  }catch(e){return '';}
}

function cr367GeneralTransitEffect(hit){
  if(!hit)return '';
  const support={
    'Jupiter':'élargit le champ des possibles et peut renforcer la confiance nécessaire pour explorer une direction plus vaste',
    'Vénus':'aide à reconnaître ce qui correspond davantage à vos valeurs, à vos goûts et à ce qui vous attire naturellement',
    'Mars':'renforce l’élan nécessaire pour agir, décider ou donner une forme concrète à ce qui vous mobilise intérieurement',
    'Saturne':'favorise la structuration, la discipline et le tri entre ce qui peut durer et ce qui reste trop fragile',
    'Uranus':'peut ouvrir une voie inattendue ou vous aider à sortir d’un cadre devenu trop étroit',
    'Neptune':'accentue la perception intuitive, la quête de sens et l’attention aux dimensions moins visibles de votre expérience'
  };
  const challenge={
    'Jupiter':'peut pousser à voir trop grand ou trop vite et demande de vérifier ce qui est réellement soutenable',
    'Vénus':'peut rendre plus difficile la distinction entre ce qui plaît immédiatement et ce qui correspond réellement à vos valeurs',
    'Mars':'peut créer de l’impatience et demande de transformer l’élan en action ciblée plutôt qu’en dispersion',
    'Saturne':'met en évidence les limites ou les responsabilités qui doivent être intégrées avant de poursuivre',
    'Uranus':'peut déstabiliser les repères habituels avant qu’une nouvelle direction devienne claire',
    'Neptune':'peut brouiller la frontière entre intuition, idéal et projection et demande davantage de vérification concrète'
  };
  return (hit.tone==='challenge'?challenge:support)[hit.tr]||'met davantage en relief la direction à donner à cette période';
}

function cr367GeneralTiming(a){
  if(!a||!state?.date)return '';
  try{
    const intent=typeof cr33Intent==='function'?cr33Intent():{};
    const theme=typeof cr3DominantTheme==='function'?cr3DominantTheme(state.draw||[],false):null;
    const window=typeof cr3TimingWindow==='function'?cr3TimingWindow(state.date,cr3ReadingMoment(),false):null;
    let hits=[];
    if(window&&typeof cr37RelevantWindows==='function')hits=cr37RelevantWindows(a,theme,window,intent)||[];
    let hit=hits[0]||null;
    if(!hit&&window&&typeof cr3PeriodSummary==='function'&&typeof cr33BestWindow==='function')hit=cr33BestWindow(cr3PeriodSummary(a,theme,window,false),intent);
    if(!hit)return 'Le calendrier astrologique ne fait pas ressortir un repère suffisamment net pour en faire un élément central de la conclusion.';
    const date=typeof cr3Date==='function'?cr3Date(hit.bestDate,false):'';
    const aspect=String(hit.name||'').toLowerCase(),tr=String(hit.tr||''),na=String(hit.na||'');
    const adjective=['Lune','Vénus'].includes(na)?'natale':'natal';
    const connector=aspect==='conjonction'?'avec':'à';
    return `Autour du ${date}, le ${aspect} de ${tr} ${connector} votre ${na} ${adjective} ${cr367GeneralTransitEffect(hit)}.`;
  }catch(e){return '';}
}

function cr366GlobalSynthesis(a){
  const en=typeof cr362En==='function'?cr362En():state?.lang==='en';
  if(en&&cr366LegacyGlobalSynthesis)return cr366LegacyGlobalSynthesis(a);
  const cards=state?.draw||[];
  if(!cards.length)return '';
  const q=(state?.question||'').trim();
  if(cr367Scope()==='general'){
    const lead=q?`Pour « ${cr366Esc(q)} », ${cr367GeneralCardThread(cards).charAt(0).toLowerCase()+cr367GeneralCardThread(cards).slice(1)}`:cr367GeneralCardThread(cards);
    const text=[lead,cr367GeneralOutcome(cards),cr367GeneralRelationContext(),cr367GeneralNatalLens(a),cr367GeneralTiming(a)].filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
    return `<div class="story-reading cr3-global cr362-global" data-global-synthesis="${CRISTARIVA_SYNTHESIS_FRENCH_FIX_VERSION}"><h3>CRISTARIVA — synthèse générale</h3><p>${text}</p></div>`;
  }
  const text=[
    q?`Pour « ${cr366Esc(q)} », ${cr366RelationIdea()}.`:`${cr366RelationIdea().charAt(0).toUpperCase()+cr366RelationIdea().slice(1)}.`,
    cr366OutcomeIdea(cards),
    cr366NatalLens(a),
    cr366Timing(a)
  ].filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
  return `<div class="story-reading cr3-global cr362-global" data-global-synthesis="${CRISTARIVA_SYNTHESIS_FRENCH_FIX_VERSION}"><h3>CRISTARIVA — synthèse générale</h3><p>${text}</p></div>`;
}

cr362GlobalSynthesis=cr366GlobalSynthesis;
if(typeof cr33GlobalSynthesis==='function')cr33GlobalSynthesis=cr366GlobalSynthesis;
if(typeof cr3Synthesis==='function')cr3Synthesis=function(a){return cr366GlobalSynthesis(a);};
if(typeof renderSynthesis==='function'){
  renderSynthesis=function(){
    if(!state?.draw?.length)return;
    const box=document.getElementById('synthesis');
    if(box)box.innerHTML=cr366GlobalSynthesis(state.astro||null);
  };
  renderSynthesis();
}
