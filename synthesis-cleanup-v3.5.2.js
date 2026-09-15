/* CRISTARIVA — synthèse générale autonome v3.6.3
   La synthèse finale ne répète plus les lectures précédentes : elle répond directement
   à la question, relie le tirage, le profil natal et le rythme, sans recopier leurs formulations. */
const CRISTARIVA_GLOBAL_SYNTHESIS_VERSION='3.6.3';

function cr362En(){try{return typeof cr3En==='function'?cr3En():state?.lang==='en';}catch(e){return false;}}
function cr362Esc(v){try{return typeof cr3Escape==='function'?cr3Escape(v):String(v||'');}catch(e){return String(v||'');}}

function cr362RelationAnswer(en=false){
  const id=Number(state?.relation?.id||0);
  const intent=typeof cr33Intent==='function'?cr33Intent():{};
  const fr={
    96:'le prochain lien semble d’abord se construire sur un registre amical, avec une proximité qui peut s’approfondir si la confiance s’installe',
    97:'la situation paraît fortement influencée par la famille, les attaches ou un cadre de proximité déjà existant',
    98:'la dynamique va vers un lien de couple ou un partenariat affectif susceptible de prendre une place importante',
    99:'une responsabilité, un enfant ou une question de protection semble jouer un rôle déterminant dans la rencontre ou son évolution',
    100:'une personne nouvelle semble entrer dans votre histoire, sans cadre relationnel encore fixé',
    101:'un lien fraternel ou une proximité de type frère-sœur paraît structurer la relation',
    102:'la situation semble ramener une personne du passé ou un ancien lien qui n’a pas totalement disparu',
    103:'la rencontre semble liée au travail quotidien ou à un environnement de collègues',
    104:'la personne concernée paraît liée à une position d’autorité, de décision ou de responsabilité',
    105:'le lien semble commencer avec quelqu’un déjà croisé ou connu de façon légère, avant de pouvoir prendre davantage de relief',
    106:'la prochaine rencontre semble concerner quelqu’un encore inconnu, qui entre progressivement dans votre champ',
    107:'la relation peut se construire dans un climat de concurrence, de comparaison ou de rivalité qu’il faudra dépasser',
    108:'le lien paraît d’abord fondé sur la confiance, l’écoute et la confidence, avant toute autre évolution',
    109:'une attirance marquée semble précéder la construction réelle du lien',
    110:'la prochaine rencontre semble devoir naître d’un contexte concret — travail, projet, réseau ou mise en relation — plutôt que d’un cadre sentimental préparé d’avance',
    111:'la distance, géographique ou relationnelle, semble faire partie du lien dès le départ',
    112:'un ancien lien peut reprendre une place dans votre histoire sous une forme différente',
    113:'une personne attirée par vous pourrait se manifester plus clairement',
    114:'la rencontre semble passer par une personne qui transmet, conseille ou sert de repère',
    115:'un intermédiaire, une présentation ou une mise en relation semble jouer le rôle de déclencheur'
  };
  const enMap={
    96:'the next bond seems likely to begin as friendship and deepen if trust grows',98:'the dynamic points toward a meaningful romantic partnership',100:'a new person appears likely to enter your story without a fixed relationship label at first',102:'the situation seems to bring back a person or bond from the past',103:'the encounter appears connected with the everyday workplace or colleagues',106:'the next encounter seems to involve someone not yet identified',109:'strong attraction appears before the bond is fully defined',110:'the next encounter seems likely to arise through work, a project, a network or a professional introduction rather than an overtly romantic setting',112:'a former bond may return in a different form',113:'someone already attracted to you may become more visible',115:'an introduction or intermediary seems likely to trigger the encounter'
  };
  if(en&&enMap[id])return enMap[id];
  if(!en&&fr[id])return fr[id];
  if(en){
    if(intent.past)return 'the question seems to reopen a bond or situation connected with the past';
    if(intent.newPerson)return 'a new person appears likely to enter the situation';
    if(intent.work)return 'the answer seems to emerge through a concrete professional context';
    if(intent.sexual)return 'the situation points toward a possible physical rapprochement, provided attraction is mutual';
    return 'the situation appears to be moving toward a clearer and more concrete form';
  }
  if(intent.past)return 'la question semble rouvrir un lien ou une situation appartenant au passé';
  if(intent.newPerson)return 'une personne nouvelle semble devoir entrer dans la situation';
  if(intent.work)return 'la réponse paraît se dessiner dans un contexte professionnel concret';
  if(intent.sexual)return 'la situation laisse entrevoir un rapprochement physique possible, à condition que l’attirance soit réciproque';
  return 'la situation semble évoluer vers une forme plus claire et plus concrète';
}

function cr362OutcomeNuance(cards,en=false){
  if(!Array.isArray(cards)||!cards.length)return '';
  let key='neutral';
  try{if(typeof finalSemanticKey==='function')key=finalSemanticKey(cards[cards.length-1]);}catch(e){}
  const fr={
    projection:'Le point décisif sera de distinguer ce qui est réellement en train de naître de ce que l’on pourrait trop vite projeter sur la situation.',
    jealousy:'La qualité du lien dépendra surtout de la confiance qui pourra s’installer, sans laisser les comparaisons ou les inquiétudes prendre toute la place.',
    reconcile:'Quelque chose peut se rapprocher ou se renouer, mais seulement si la nouvelle dynamique ne reproduit pas l’ancienne.',
    past:'Le passé reste présent en arrière-plan, mais il ne doit pas dicter à lui seul la forme de ce qui vient.',
    hidden:'La rencontre ou l’évolution de ce lien demandera un peu de temps avant de révéler clairement ce qu’il peut réellement devenir.',
    delay:'Le mouvement existe, mais il paraît devoir se construire progressivement plutôt que se précipiter.',
    emotion:'La force émotionnelle sera importante ; le véritable enjeu sera de laisser le lien se définir sans l’enfermer trop tôt dans une attente.',
    separation:'La distance ou la réserve restent encore fortes et peuvent retarder une concrétisation.',
    bond:'Le potentiel du lien paraît réel, mais il devra se confirmer par une réciprocité visible et régulière.',
    truth:'La situation devrait devenir plus lisible à mesure que les intentions et les attentes seront exprimées plus clairement.',
    new:'Ce qui se présente a vocation à ouvrir une phase nouvelle plutôt qu’à reproduire exactement un scénario ancien.',
    change:'La rencontre peut modifier vos repères habituels et vous conduire vers une forme de relation différente de celle imaginée au départ.',
    choice:'Le lien prendra sa véritable direction lorsqu’un choix ou une position claire cessera de laisser la situation dans l’entre-deux.',
    strength:'La solidité viendra surtout de la constance, du calme et de la cohérence entre les paroles et les actes.',
    positive:'L’ensemble reste ouvert et plutôt favorable, à condition que cette possibilité trouve une confirmation concrète dans la réalité.',
    work:'Les circonstances pratiques, professionnelles ou organisationnelles joueront un rôle déterminant dans la manière dont la situation se développera.',
    money:'Le contexte matériel devra être suffisamment stable pour que la relation ou le projet puisse prendre une place plus nette.',
    spirit:'Cette rencontre semble autant porteuse d’une prise de conscience que d’un événement extérieur : elle peut modifier votre manière de regarder la situation.',
    neutral:'La direction reste encore ouverte : c’est la manière dont les premiers échanges évolueront qui donnera réellement sa forme au lien.'
  };
  const enMap={
    delay:'The movement is present, but it seems more likely to build gradually than to rush forward.',bond:'The potential of the bond looks real, but it will need visible and consistent reciprocity.',truth:'The situation should become clearer as intentions and expectations are expressed more directly.',new:'What is emerging seems more likely to open a new phase than repeat an old pattern.',change:'The encounter may change your usual bearings and lead toward a form of relationship different from what you first imagined.',choice:'The bond will find its real direction when a clear choice ends the in-between phase.',positive:'The overall direction remains open and rather favourable, provided the possibility is confirmed in real life.',neutral:'The direction is still open; the first exchanges will determine the true shape of the bond.'
  };
  return en?(enMap[key]||enMap.neutral):(fr[key]||fr.neutral);
}

function cr362NatalLens(a,en=false){
  if(!a||typeof cr34BigThree!=='function'||typeof cr34SignProfile!=='function')return '';
  try{
    const big=cr34BigThree(a,false),sun=big?.sun?cr34SignProfile(big.sun):null,moon=big?.moon?cr34SignProfile(big.moon):null;
    if(en)return 'Your natal profile suggests that you may sense the potential of a bond quickly; letting the other person’s actions confirm that first impression will be especially important.';
    const core=(sun?.core||'sensible et réceptive').trim();
    const emotion=(moon?.emotion||'un besoin de repères affectifs solides').trim();
    return `Votre profil natal met en avant une personnalité ${core}, avec ${emotion}. Vous pouvez donc percevoir très vite le potentiel d’un lien ; dans cette situation, il sera particulièrement important de laisser les actes confirmer la première impression.`;
  }catch(e){return '';}
}

function cr362Timing(a,en=false){
  if(!a||!state?.date||typeof cr33Intent!=='function'||typeof cr3DominantTheme!=='function'||typeof cr3TimingWindow!=='function'||typeof cr3PeriodSummary!=='function'||typeof cr33BestWindow!=='function'||typeof cr33WindowText!=='function')return '';
  try{
    const intent=cr33Intent(),theme=cr3DominantTheme(state.draw||[],en),window=cr3TimingWindow(state.date,cr3ReadingMoment(),en),period=cr3PeriodSummary(a,theme,window,en),best=cr33BestWindow(period,intent);
    if(!best)return en?'The timing remains diffuse rather than concentrated in one clear moment.':'Le rythme reste diffus plutôt que concentré sur un moment unique.';
    const when=cr33WindowText(best,en);
    return en?`The first concrete signs may become easier to notice ${when}.`:`Les premiers signes concrets pourraient devenir plus faciles à percevoir ${when}.`;
  }catch(e){return '';}
}

function cr362Closing(en=false){
  const id=Number(state?.relation?.id||0),intent=typeof cr33Intent==='function'?cr33Intent():{};
  if(en){
    if(id===110)return 'In other words, the bond may begin for a practical reason before revealing a more personal meaning.';
    if(intent.newPerson)return 'The key will be less how the person appears than what develops after the first contact.';
    if(intent.past)return 'What matters will be whether the returning bond truly changes form rather than simply resumes where it stopped.';
    return 'The decisive element will be what takes shape in the exchanges, not the first label placed on the situation.';
  }
  if(id===110)return 'Autrement dit, le lien pourrait commencer pour une raison pratique avant de révéler une portée plus personnelle.';
  if(intent.newPerson)return 'Le point essentiel sera donc moins la manière dont cette personne apparaît que ce qui se construit après le premier contact.';
  if(intent.past)return 'L’essentiel sera de voir si ce lien revenu du passé change réellement de forme au lieu de reprendre exactement là où il s’était arrêté.';
  return 'Le véritable sens de la situation se jouera donc dans ce qui prendra corps au fil des échanges, plus que dans l’étiquette posée au départ.';
}

function cr362GlobalSynthesis(a){
  const en=cr362En(),cards=state?.draw||[];
  if(!cards.length)return '';
  const q=(state?.question||'').trim();
  const answer=cr362RelationAnswer(en),nuance=cr362OutcomeNuance(cards,en),natal=cr362NatalLens(a,en),timing=cr362Timing(a,en),closing=cr362Closing(en);
  const lead=en
    ? `${q?`For your question “${cr362Esc(q)}”, `:''}${answer.charAt(0).toUpperCase()+answer.slice(1)}.`
    : `${q?`À votre question « ${cr362Esc(q)} », `:''}${answer.charAt(0).toUpperCase()+answer.slice(1)}.`;
  const text=[lead,nuance,natal,timing,closing].filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
  return `<div class="story-reading cr3-global cr362-global" data-global-synthesis="${CRISTARIVA_GLOBAL_SYNTHESIS_VERSION}"><h3>${en?'CRISTARIVA — final consultation':'CRISTARIVA — synthèse générale'}</h3><p>${text}</p></div>`;
}

(function(){
  if(typeof cr33GlobalSynthesis==='function')cr33GlobalSynthesis=cr362GlobalSynthesis;
  if(typeof cr3Synthesis==='function')cr3Synthesis=function(a){return cr362GlobalSynthesis(a);};
  if(typeof renderSynthesis==='function'){
    renderSynthesis=function(){
      if(!state?.draw?.length)return;
      const box=document.getElementById('synthesis');
      if(box)box.innerHTML=cr362GlobalSynthesis(state.astro||null);
    };
    renderSynthesis();
  }
})();
