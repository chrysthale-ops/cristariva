/* CRISTARIVA — synthèse générale reformulée v3.6.6
   La conclusion finale conserve les idées des analyses précédentes mais
   les réécrit avec un autre vocabulaire, d'autres enchaînements et une
   formulation réellement synthétique. */
const CRISTARIVA_SYNTHESIS_FRENCH_FIX_VERSION='3.6.6';
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

function cr366GlobalSynthesis(a){
  const en=typeof cr362En==='function'?cr362En():state?.lang==='en';
  if(en&&cr366LegacyGlobalSynthesis)return cr366LegacyGlobalSynthesis(a);
  const cards=state?.draw||[];
  if(!cards.length)return '';
  const q=(state?.question||'').trim();
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
