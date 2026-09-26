/* CRISTARIVA — narration universelle fluide v6.3
   Dernière couche commune à tous les oracles et au tarot.
   Règles : aucun nom de carte dans le récit, aucune liste brute de mots-clés,
   narration continue, transitions variées, prise en charge de tout nombre de cartes.
*/
(function(){
'use strict';
const VERSION='6.6';

function esc(v){
  try{return typeof readingEscape==='function'?readingEscape(String(v??'')):String(v??'').replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  catch(e){return String(v??'');}
}
function norm(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
function hay(card,en=false){
  const l=en?(card?.en||{}):(card||{});
  return norm([
    l.category, l.keywords, l.definition, l.meaning,
    l.reading_professionnel, l.reading_relationnel, l.reading_spirituel,
    card?.category, card?.keywords
  ].filter(Boolean).join(' '));
}
function scope(){
  const d=norm(state?.domain||''),q=norm(state?.question||'');
  if(/profession|travail|emploi|carriere|projet|business|work|career|job|money|argent|finance/.test(d+' '+q))return 'work';
  if(/relation|amour|couple|sentiment|romant|intimit|rencontr|love|partner|retour|recontact/.test(d+' '+q))return 'relation';
  return 'life';
}
function theme(card,en=false){
  const title=norm((en?card?.en?.name:card?.name)||card?.name);
  if(/triangle|triangul|troisieme personne|rivalit/.test(title))return 'triangle';
  if(/dispute|querelle|conflit|altercation/.test(title))return 'conflict';
  if(/engagement|promesse|officialisation|construction/.test(title))return 'commitment';
  if(/communication|dialogue|parole|conversation|clarification|communication|dialog/.test(title))return 'insight';
  if(/impasse|incompatibil|blocage|obstacle|rupture|conflit|betrayal|deadlock/.test(title))return 'tension';
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
function conclusion(cards,sc,enMode){
  const themes=cards.map(c=>theme(c,enMode));
  const last=themes[themes.length-1];
  if(enMode){
    if(last==='ambiguity')return "Overall, the reading describes a real evolution, but some clarity is still needed before the direction can be fully understood.";
    if(last==='tension')return "Overall, progress remains possible, but it depends on changing what is still creating resistance.";
    return "Overall, the reading describes a gradual evolution rather than a series of separate meanings, with each stage preparing the next.";
  }
  if(sc==='relation'){
    if(last==='ambiguity')return "Dans l’ensemble, le tirage raconte une évolution affective réelle, mais une part de clarté manque encore pour comprendre pleinement la direction du lien.";
    if(last==='tension')return "Dans l’ensemble, une évolution reste possible, mais elle dépend d’un changement concret dans ce qui entretient encore la distance ou la tension.";
    return "Dans l’ensemble, le récit montre une progression affective : ce qui semblait figé peut évoluer, à condition que la suite se confirme dans les faits et respecte l’équilibre de chacun.";
  }
  if(sc==='work'){
    if(last==='tension')return "Dans l’ensemble, le projet peut continuer d’avancer, mais la prochaine étape consiste d’abord à résoudre le point qui limite encore sa progression.";
    return "Dans l’ensemble, le tirage décrit une progression qui se construit étape après étape, en consolidant ce qui fonctionne avant d’engager la suite.";
  }
  if(last==='ambiguity')return "Dans l’ensemble, la situation évolue réellement, même si tout n’est pas encore suffisamment clair pour en tirer une conclusion définitive.";
  if(last==='tension')return "Dans l’ensemble, le prochain mouvement utile consiste surtout à transformer ce qui freine encore la situation.";
  return "Dans l’ensemble, le tirage raconte une progression continue plutôt qu’une succession de significations isolées : chaque étape éclaire la suivante et donne peu à peu sa cohérence au récit.";
}
function workExpansion(cards,enMode=false){
  if(!Array.isArray(cards)||cards.length<5)return '';
  const th=cards.slice(0,5).map(c=>theme(c,enMode));
  if(enMode){
    let s="For the next decisions, it is useful to separate three things: what still belongs to the previous difficulty, what can genuinely support progress now, and what must be abandoned because it no longer matches reality.";
    if(th[0]==='tension'||th[1]==='tension')s+=" The reading therefore discourages decisions made under pressure and favors a more deliberate pace.";
    if(th[2]==='tension')s+=" Even a refusal or limitation can become useful when it helps eliminate an unsuitable option and sharpen the direction.";
    if(th[3]==='change'||th[3]==='insight')s+=" The evolution becomes constructive when the lesson is converted into a practical adjustment rather than remaining only an observation.";
    if(th[4]==='ground')s+=" The final movement favors stabilization and a calmer environment in which choices can be made with more confidence.";
    return s;
  }
  let s="Pour les prochaines décisions, il est utile de distinguer trois choses : ce qui appartient encore à la difficulté précédente, ce qui peut réellement soutenir l’avancée maintenant, et ce qu’il faut accepter d’abandonner parce que cela ne correspond plus à la réalité.";
  if(th[0]==='tension'||th[1]==='tension')s+=" Le tirage déconseille donc les choix pris sous pression et invite à retrouver un rythme plus posé avant de trancher.";
  if(th[2]==='tension')s+=" Même un refus ou une limite peut devenir utile s’il permet d’écarter une option mal adaptée et de rendre la direction plus nette.";
  if(th[3]==='change'||th[3]==='insight')s+=" L’évolution devient constructive lorsque ce qui a été compris se transforme en ajustement concret, plutôt qu’en simple constat.";
  if(th[4]==='ground')s+=" Le mouvement final favorise la stabilisation et un cadre plus calme, dans lequel les choix peuvent être faits avec davantage de confiance.";
  return s;
}
function build(cards){
  if(!Array.isArray(cards)||!cards.length)return '';
  const chosen=cards.slice(0,12), r=roles(chosen.length), sc=scope(), enMode=state?.lang==='en';
  const q=String(state?.question||'').replace(/\s+/g,' ').trim();
  const themes=chosen.map(c=>theme(c,enMode));
  const clarifyingCommitment=chosen.length===3&&sc==='relation'&&themes[0]==='triangle'&&themes[1]==='conflict'&&themes[2]==='commitment';
  const stuckThenClarity=chosen.length===3&&themes[0]==='tension'&&themes[1]==='tension'&&themes[2]==='insight';
  const parts=clarifyingCommitment?(enMode?[
    'The situation begins with uncertainty about where each person stands. Several ties or competing wishes may be making it difficult to choose a clear direction.',
    'That uncertainty is now bringing tension into the open. An honest conversation could clarify what each person wants, even if it is uncomfortable.',
    'If the positions become clear, a more concrete commitment may become possible. Its strength will depend on shared decisions and lasting actions, not on promises alone.'
  ]:[
    'La situation semble d’abord marquée par une ambiguïté sentimentale : plusieurs liens, plusieurs directions ou des sentiments contradictoires rendent difficile de savoir quelle place chacun souhaite prendre.',
    'Cette incertitude arrive maintenant à un point de tension. Des désaccords peuvent éclater, mais leur expression peut aussi permettre de clarifier les attentes et de sortir du non-dit.',
    'Une fois les positions établies, la possibilité d’un engagement plus concret apparaît. Sa solidité dépendra de choix partagés et d’actes durables, au-delà des seules promesses.'
  ]):stuckThenClarity?(enMode?[
    'The earlier difficulty suggests that the route taken has stopped offering a workable answer. The present situation brings the mismatch into focus: continuing to force it could require giving up something essential.',
    'The next step is to put the difficulty into clear words, distinguish what can be discussed from what cannot be compromised, and see whether a different way forward is possible. The cards point to a conversation and a choice, rather than a guaranteed outcome.'
  ]:[
    'Une difficulté ancienne semble avoir épuisé la voie suivie jusqu’ici. Ce qui coince aujourd’hui n’est peut-être pas un simple manque d’efforts : certaines attentes ou façons d’avancer ne s’accordent plus, et insister risque de demander trop de renoncements.',
    'La suite invite à nommer clairement le désaccord, à distinguer ce qui peut se négocier de ce qui compte vraiment pour vous, puis à regarder si une autre voie est possible. Le tirage suggère une mise au clair et un choix, sans promettre une issue précise.'
  ]):chosen.map((c,i)=>enMode?en(c,r[i]||'evolution',sc,i):fr(c,r[i]||'evolution',sc,i)).filter(Boolean);
  if(chosen.length>1&&!stuckThenClarity&&!clarifyingCommitment)parts.push(conclusion(chosen,sc,enMode));
  if(sc==='work'&&chosen.length>=5){
    const extra=workExpansion(chosen,enMode);
    if(extra)parts.push(extra);
  }
  const question=q?`<p class="reading-question">${enMode?'Your question':'Votre question'} : « ${esc(q)} »</p>`:'';
  return `<div class="story-reading" data-story-engine="universal-fluid-${VERSION}"><h3>${enMode?'The story told by your cards':'L’histoire racontée par vos cartes'}</h3>${question}<p class="story-continuous">${esc(parts.join(' ').replace(/\s+/g,' ').trim())}</p></div>`;
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
