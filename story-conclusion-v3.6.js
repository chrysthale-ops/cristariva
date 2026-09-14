/* CRISTARIVA — conclusion littéraire du tirage v3.6.1
   Ajoute à « L’histoire racontée par vos cartes » une conclusion globale
   sans citer ni répéter le nom des cartes, et verrouille les 3 domaines validés. */
const CRISTARIVA_STORY_CONCLUSION_VERSION='3.6.1';

function cr36En(){return state?.lang==='en';}
function cr36NormalizeDomains(){
  const select=document.getElementById('domain');
  if(!select)return;
  const values=['Relations','Professionnelle / Projet','Général / spirituel'];
  const labels=cr36En()?['Relationships','Professional / Project','General / Spiritual']:values;
  const current=values.includes(state?.domain)?state.domain:(values.includes(select.value)?select.value:'Relations');
  select.innerHTML=values.map((value,i)=>`<option value="${value}">${labels[i]}</option>`).join('');
  select.value=current;
  if(typeof state==='object'&&state)state.domain=current;
}
function cr36Category(card){
  const raw=(card?.category||'').toLowerCase();
  if(raw.includes('positive'))return 1;
  if(raw.includes('négative')||raw.includes('negative'))return -1;
  return 0;
}
function cr36Semantic(card){
  try{return typeof finalSemanticKey==='function'?finalSemanticKey(card):'neutral';}catch(e){return 'neutral';}
}
function cr36Arc(cards,en=false){
  const vals=cards.map(cr36Category),pos=vals.filter(v=>v>0).length,neg=vals.filter(v=>v<0).length;
  const first=vals[0]||0,last=vals[vals.length-1]||0;
  if(en){
    if(first<0&&last>0)return 'The story begins in a difficult or uncertain climate, but it does not remain there: the movement gradually opens toward a more constructive possibility.';
    if(first>0&&last<0)return 'An initially encouraging movement becomes more demanding as the story unfolds, suggesting that enthusiasm alone will not be enough to carry the situation through.';
    if(pos>=Math.max(2,neg+2))return 'A coherent current runs through the spread: despite the necessary adjustments, the story tends to open rather than close.';
    if(neg>=Math.max(2,pos+2))return 'The story tightens around a real difficulty: progress cannot be forced and first requires a change in the conditions surrounding the situation.';
    return 'The story is more nuanced than a simple yes or no: openings and restraints alternate, showing a situation that is still being shaped.';
  }
  if(first<0&&last>0)return 'L’histoire part d’un climat difficile ou incertain, mais elle ne s’y enferme pas : le mouvement s’ouvre progressivement vers une possibilité plus constructive.';
  if(first>0&&last<0)return 'Un élan d’abord encourageant devient plus exigeant au fil du tirage : l’envie ou l’espoir ne suffiront pas, à eux seuls, à conduire la situation jusqu’à son aboutissement.';
  if(pos>=Math.max(2,neg+2))return 'Un courant cohérent traverse le tirage : malgré les ajustements nécessaires, l’histoire tend davantage à s’ouvrir qu’à se refermer.';
  if(neg>=Math.max(2,pos+2))return 'Le récit se resserre autour d’une difficulté réelle : l’évolution ne peut pas être forcée et suppose d’abord que les conditions de la situation changent.';
  return 'Le récit est plus nuancé qu’une réponse simplement positive ou négative : ouvertures et retenues alternent, montrant une situation encore en train de se construire.';
}
function cr36Outcome(cards,en=false){
  const key=cr36Semantic(cards[cards.length-1]);
  const fr={
    projection:'La véritable issue viendra lorsque ce qui est espéré ou redouté pourra être distingué de ce qui se manifeste réellement.',
    jealousy:'La suite dépend surtout d’un retour à la confiance et d’une lecture plus apaisée de ce qui est réellement en jeu.',
    reconcile:'Le tirage laisse ainsi entrevoir un rapprochement possible, à condition que la reprise repose sur quelque chose de plus solide qu’auparavant.',
    past:'Ce qui appartient au passé peut encore peser, mais l’histoire invite surtout à ne plus reproduire exactement le même scénario.',
    hidden:'La situation paraît devoir passer par davantage de vérité et de clarté avant de pouvoir prendre une forme stable.',
    delay:'L’histoire ne semble pas close, mais elle demande du temps : ce qui doit évoluer paraît devoir mûrir plutôt que se précipiter.',
    emotion:'L’issue reste étroitement liée à la manière dont les émotions seront reconnues, exprimées et accueillies.',
    separation:'À ce stade, le mouvement va davantage vers la prise de distance que vers une concrétisation immédiate.',
    bond:'Le lien conserve une possibilité d’évolution, mais sa réalité devra se vérifier dans des gestes réciproques et continus.',
    truth:'Le tirage conduit vers une clarification : ce qui restait ambigu paraît devoir devenir plus simple à comprendre et à nommer.',
    new:'Une nouvelle phase peut réellement commencer, à condition de ne pas reconstruire l’avenir avec les anciens réflexes.',
    change:'La situation semble capable de changer de nature ; l’essentiel sera d’accepter que la suite ne ressemble pas exactement à ce qui existait avant.',
    choice:'Le récit aboutit à un point de décision : la suite dépend moins de l’attente que d’un choix clairement assumé.',
    strength:'Une stabilisation paraît possible si la situation reste conduite avec constance, calme et cohérence.',
    positive:'La tendance finale demeure favorable : quelque chose peut se concrétiser, à condition que l’ouverture se confirme dans la réalité.',
    work:'La suite paraît surtout dépendre des conditions concrètes, des décisions et de l’organisation autour de la situation.',
    money:'L’évolution reste liée à un rééquilibrage matériel ou pratique qui doit d’abord retrouver davantage de stabilité.',
    spirit:'Au-delà des événements immédiats, ce tirage décrit surtout une prise de conscience qui peut modifier durablement votre manière d’aborder la situation.',
    neutral:'La direction n’est pas encore totalement figée : la suite se précisera à mesure que les faits donneront une forme plus nette à ce qui est en train d’évoluer.'
  };
  const enMap={
    projection:'The real outcome will emerge when hopes or fears can be separated from what is actually unfolding.',
    jealousy:'The next stage depends mainly on rebuilding trust and seeing the situation more calmly.',
    reconcile:'The spread therefore leaves room for renewed closeness, provided the new beginning rests on firmer ground than before.',
    past:'The past still has weight, but the story mainly asks not to repeat the same pattern again.',
    hidden:'The situation seems to require more truth and clarity before it can settle into a stable form.',
    delay:'The story does not look closed, but it needs time: what is changing seems to require maturation rather than haste.',
    emotion:'The outcome remains closely tied to how emotions are recognised, expressed and received.',
    separation:'For now, the movement leans more toward distance than immediate fulfilment.',
    bond:'The bond still has room to develop, but its reality will need to be confirmed through reciprocal and consistent actions.',
    truth:'The spread leads toward clarification: what remained ambiguous is likely to become easier to understand and name.',
    new:'A genuinely new phase can begin, provided the future is not rebuilt with the same old reflexes.',
    change:'The situation appears capable of changing in nature; the key is accepting that what follows may not resemble what existed before.',
    choice:'The story reaches a decision point: what comes next depends less on waiting than on a clearly assumed choice.',
    strength:'Greater stability appears possible if the situation is handled with consistency, calm and coherence.',
    positive:'The final tendency remains favourable: something can take shape if the opening is confirmed in reality.',
    work:'What follows appears to depend mainly on concrete conditions, decisions and organisation around the situation.',
    money:'The development remains linked to a practical or material rebalancing that first needs more stability.',
    spirit:'Beyond immediate events, this spread mainly describes an awareness that may durably change the way you approach the situation.',
    neutral:'The direction is not completely fixed yet: the next stage will become clearer as facts give a more definite shape to what is evolving.'
  };
  return (en?enMap:fr)[key]||(en?enMap.neutral:fr.neutral);
}
function cr36LiteraryConclusion(cards,en=cr36En()){
  if(!Array.isArray(cards)||!cards.length)return '';
  return `${cr36Arc(cards,en)} ${cr36Outcome(cards,en)}`;
}
function cr36AppendSummary(html,cards){
  if(!html||!Array.isArray(cards)||!cards.length||html.includes('cr36-story-conclusion'))return html;
  const en=cr36En(),conclusion=cr36LiteraryConclusion(cards,en);
  if(!conclusion)return html;
  const text=typeof readingEscape==='function'?readingEscape(conclusion):conclusion;
  const block=`<div class="conclusion cr36-story-conclusion"><strong>${en?'In summary':'En résumé'}</strong><p>${text}</p></div>`;
  const i=html.lastIndexOf('</div>');
  return i>=0?html.slice(0,i)+block+html.slice(i):html+block;
}

(function(){
  cr36NormalizeDomains();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',cr36NormalizeDomains,{once:true});
  if(typeof storyInterpretation!=='function')return;
  const previous=storyInterpretation;
  storyInterpretation=function(cards){return cr36AppendSummary(previous(cards),cards);};
  if(typeof interpretation==='function')interpretation=function(cards){return storyInterpretation(cards);};
  if(typeof renderCards==='function'&&state?.draw?.length)renderCards();
})();
