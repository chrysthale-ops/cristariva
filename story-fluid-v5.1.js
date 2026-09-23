/* CRISTARIVA — récit fluide global v5.30
   Le récit final synthétise les cartes au lieu de recopier leurs définitions.
   Il s'appuie sur les mots-clés, la tonalité, la position et la question.
*/
const CRISTARIVA_FLUID_STORY_VERSION='5.30';

function cr51Esc(value){
  try{return typeof readingEscape==='function'?readingEscape(String(value??'')):String(value??'').replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  catch(e){return String(value??'');}
}
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
function cr51Meaning(card,scope,en=false){
  return cr51Esc(String(cr51Field(card,scope,en)||'').replace(/\s+/g,' ').trim());
}
function cr51Scope(){
  const focus=typeof preciseQuestionFocus==='function'?preciseQuestionFocus():'life';
  try{if(typeof cn5Scope==='function')return cn5Scope(focus);}catch(e){}
  const d=String(state?.domain||'').toLowerCase(),q=String(state?.question||'').toLowerCase();
  if(/profession|travail|emploi|projet|carri|business|work|career|job/.test(d+' '+q))return 'work';
  if(/relation|amour|couple|sentiment|romant|sex|intimit|rencontr|love|partner|retour|recontact/.test(d+' '+q))return 'relation';
  return 'spirit';
}
function cr51Norm(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();}
function cr51Tone(card,en=false){
  const loc=en?(card?.en||{}):(card||{});
  const raw=cr51Norm(loc.category||card?.category||'');
  if(/negativ|diffic|rupture|blocage|tension/.test(raw))return 'negative';
  if(/nuanc|mixed|ambival|contrast/.test(raw))return 'nuanced';
  if(/positiv|favorable|construct/.test(raw))return 'positive';
  const fam=cr51Family(card,en);
  if(fam==='tension'||fam==='ambiguity')return 'negative';
  if(fam==='opening'||fam==='bond'||fam==='ground'||fam==='movement')return 'positive';
  return 'nuanced';
}
function cr51Keywords(card,en=false){
  const loc=en?(card?.en||{}):(card||{});
  const raw=String(loc.keywords||card?.keywords||'').trim();
  let parts=raw.split(/[,;|]/).map(x=>x.trim()).filter(Boolean);
  const seen=new Set();
  parts=parts.filter(x=>{const k=cr51Norm(x);if(!k||seen.has(k))return false;seen.add(k);return true;});
  if(!parts.length){
    const fam=cr51Family(card,en);
    const fallback=en?{
      past:['unfinished history','memory'],tension:['tension','resistance'],bond:['connection','reciprocity'],insight:['clarity','understanding'],movement:['movement','initiative'],change:['change','transition'],ground:['stability','balance'],ambiguity:['uncertainty','hesitation'],opening:['opening','possibility'],neutral:['evolution']
    }:{
      past:['passé','mémoire'],tension:['tension','résistance'],bond:['lien','réciprocité'],insight:['clarté','compréhension'],movement:['élan','initiative'],change:['changement','transition'],ground:['stabilité','équilibre'],ambiguity:['incertitude','hésitation'],opening:['ouverture','possibilité'],neutral:['évolution']
    };
    parts=fallback[fam]||fallback.neutral;
  }
  return parts.slice(0,3);
}
function cr51Join(items,en=false){
  const a=(items||[]).filter(Boolean);
  if(!a.length)return en?'the situation':'la situation';
  if(a.length===1)return a[0];
  if(a.length===2)return a[0]+(en?' and ':' et ')+a[1];
  return a.slice(0,-1).join(', ')+(en?' and ':' et ')+a[a.length-1];
}
function cr51QuestionIntent(q){
  const s=cr51Norm(q);
  if(/retour|revenir|revient|reprendre|reprise|recontact|contact|retrouver|reconciliation|reconcil/.test(s))return 'return';
  if(/avenir|suite|evolution|devenir|futur/.test(s))return 'future';
  if(/pense|sentiment|ressent|aime|amour|crush/.test(s))return 'feelings';
  if(/travail|emploi|carriere|projet|business|profession/.test(s))return 'work';
  return 'general';
}
function cr51Variant(card,role){
  const seed=Number(card?.id||0)+String(role||'').split('').reduce((a,c)=>a+c.charCodeAt(0),0);
  return Math.abs(seed)%3;
}
function cr51StageFrench(card,role,scope){
  const k=cr51Join(cr51Keywords(card,false),false),tone=cr51Tone(card,false),v=cr51Variant(card,role);
  const relation={
    origin:{
      positive:[`Au départ, le lien s’est construit sur ${k}, ce qui montre qu’un socle favorable a déjà existé.`,`Dans ce qui précède la situation actuelle, ${k} ont constitué les points les plus porteurs du lien.`,`À l’origine de la dynamique, ${k} ont donné au lien une base qui pouvait soutenir un rapprochement.`],
      nuanced:[`Au départ, ${k} ont installé une dynamique contrastée, avec du potentiel mais aussi des ajustements à trouver.`,`Ce qui précède montre surtout ${k} : le lien n’était ni complètement fermé ni réellement stabilisé.`,`À l’origine, ${k} ont créé une situation intermédiaire, capable d’évoluer mais encore irrégulière.`],
      negative:[`Au départ, ${k} ont fragilisé le lien et limité ce qui pouvait réellement se construire.`,`Dans le passé récent du lien, ${k} ont pesé davantage que les éléments favorables.`,`À l’origine de la difficulté, ${k} ont créé une distance ou un déséquilibre qu’il reste à dépasser.`]
    },
    evolution:{
      positive:[`Aujourd’hui, ${k} prennent davantage de place et rendent possible un échange plus naturel si l’élan reste partagé.`,`Dans le présent, ${k} soutiennent une dynamique plus simple, plus fluide et plus réciproque.`,`Actuellement, ${k} peuvent faciliter un rapprochement, à condition que les gestes suivent réellement l’intention.`],
      nuanced:[`Aujourd’hui, ${k} montrent que le lien bouge encore, mais qu’il cherche sa forme et son rythme.`,`Dans le présent, ${k} traduisent une évolution possible, sans que tout soit encore fixé.`,`Actuellement, ${k} créent une dynamique intermédiaire : quelque chose évolue, mais demande encore des ajustements.`],
      negative:[`Aujourd’hui, ${k} restent le point sensible et freinent encore une reprise stable du lien.`,`Dans le présent, ${k} montrent ce qui continue d’empêcher le lien de se déployer librement.`,`Actuellement, ${k} dominent encore la dynamique et rendent le rapprochement plus difficile à installer.`]
    },
    outcome:{
      positive:[`Pour la suite, ${k} ouvrent une voie plus favorable, à condition de laisser la relation se construire sans la forcer.`,`L’élan à venir met ${k} au premier plan : la suite peut gagner en qualité si chacun respecte la place de l’autre.`,`La direction qui se dessine valorise ${k}; elle invite à construire autrement plutôt qu’à répéter l’ancien fonctionnement.`],
      nuanced:[`Pour la suite, ${k} suggèrent une évolution possible, mais dépendante de la manière dont chacun trouve sa place.`,`L’élan à venir repose sur ${k} : la situation peut évoluer, mais elle ne se stabilisera pas toute seule.`,`La direction reste ouverte autour de ${k}; elle demande un nouveau réglage du lien plutôt qu’un retour automatique au passé.`],
      negative:[`Pour la suite, ${k} indiquent qu’un changement réel sera nécessaire avant qu’un rapprochement durable puisse s’installer.`,`L’élan à venir reste freiné par ${k}; une reprise ne pourrait tenir qu’en modifiant profondément cette dynamique.`,`La direction actuelle laisse ${k} comme obstacle principal : sans évolution concrète, le lien risque de reproduire ses difficultés.`]
    },
    obstacle:{
      positive:[`Un point de vigilance apparaît pourtant autour de ${k} : ce potentiel doit rester concret et partagé.`,`La difficulté n’est pas l’absence de potentiel, mais la manière de transformer ${k} en actes réguliers.`,`Même favorable, ${k} peut devenir fragile si l’un des deux porte seul la relation.`],
      nuanced:[`La difficulté se concentre autour de ${k}, qui peuvent aussi bien aider le lien que le maintenir dans l’entre-deux.`,`Le principal point de tension concerne ${k}, encore trop instables pour donner une direction nette.`,`Ce qui complique la situation tient à ${k}, qui demandent d’être clarifiés plutôt que laissés dans l’ambiguïté.`],
      negative:[`L’obstacle principal se situe dans ${k}, qui entretiennent la distance ou la tension.`,`Ce qui bloque le plus le lien reste ${k}; tant que cela domine, le rapprochement demeure fragile.`,`La difficulté centrale vient de ${k}, qui empêchent encore une relation plus sereine de s’installer.`]
    },
    resource:{
      positive:[`Le meilleur point d’appui se trouve dans ${k}, qui peuvent redonner au lien une base plus saine.`,`Pour avancer, ${k} constituent la ressource la plus constructive du tirage.`,`Ce qui peut réellement aider la relation passe par ${k}, à traduire en gestes simples et cohérents.`],
      nuanced:[`La ressource consiste à mieux utiliser ${k}, sans les idéaliser ni les écarter.`,`Un appui existe dans ${k}, à condition d’en faire quelque chose de concret.`,`Pour sortir de l’entre-deux, ${k} peuvent servir de point d’appui s’ils sont clarifiés.`],
      negative:[`La ressource vient du fait de reconnaître clairement ${k}, afin de ne plus les laisser diriger la relation.`,`Le point d’appui consiste à regarder ${k} en face et à changer ce qui peut l’être.`,`Pour avancer, il faut surtout ne plus minimiser ${k} et en tirer une limite claire.`]
    }
  };
  const work={
    origin:{positive:[`Au départ, ${k} ont donné une base solide au projet.`,`La situation s’est d’abord appuyée sur ${k}.`,`À l’origine, ${k} ont créé des conditions plutôt favorables.`],nuanced:[`Au départ, ${k} ont créé une situation encore incomplète.`,`La base du projet repose sur ${k}, avec plusieurs ajustements à prévoir.`,`À l’origine, ${k} ont installé une dynamique encore irrégulière.`],negative:[`Au départ, ${k} ont freiné le projet.`,`La difficulté initiale vient surtout de ${k}.`,`À l’origine, ${k} ont limité la progression.`]},
    evolution:{positive:[`Aujourd’hui, ${k} soutiennent une progression plus nette.`,`Dans le présent, ${k} rendent l’avancée plus concrète.`,`Actuellement, ${k} renforcent la dynamique du projet.`],nuanced:[`Aujourd’hui, ${k} montrent une progression encore en réglage.`,`Dans le présent, ${k} demandent des choix plus précis.`,`Actuellement, ${k} laissent plusieurs scénarios ouverts.`],negative:[`Aujourd’hui, ${k} freinent encore l’avancée.`,`Dans le présent, ${k} restent les principaux points de blocage.`,`Actuellement, ${k} compliquent la progression du projet.`]},
    outcome:{positive:[`Pour la suite, ${k} ouvrent une perspective constructive.`,`La direction à venir s’appuie favorablement sur ${k}.`,`La suite peut se consolider autour de ${k}.`],nuanced:[`Pour la suite, ${k} demandent encore des arbitrages.`,`La direction reste ouverte autour de ${k}.`,`La suite dépendra de la manière dont ${k} seront gérés.`],negative:[`Pour la suite, ${k} exigent une correction de trajectoire.`,`La direction actuelle reste freinée par ${k}.`,`La suite demande de résoudre ${k} avant d’espérer une progression stable.`]},
    obstacle:{positive:[`Le point de vigilance concerne ${k}, qui doivent rester concrets.`,`La difficulté est de transformer ${k} en résultats.`,`Le potentiel de ${k} doit être structuré pour devenir utile.`],nuanced:[`L’obstacle tient à ${k}, encore insuffisamment clarifiés.`,`La difficulté se concentre autour de ${k}.`,`Le projet reste hésitant autour de ${k}.`],negative:[`L’obstacle principal vient de ${k}.`,`Ce qui bloque le plus reste ${k}.`,`La difficulté centrale concerne ${k}.`]},
    resource:{positive:[`${k} constituent le meilleur levier pour avancer.`,`Le point d’appui le plus solide se trouve dans ${k}.`,`Pour progresser, la ressource principale reste ${k}.`],nuanced:[`${k} peuvent devenir utiles s’ils sont mieux structurés.`,`Un levier existe dans ${k}, à clarifier.`,`La ressource passe par une meilleure utilisation de ${k}.`],negative:[`La ressource consiste à traiter directement ${k}.`,`Pour avancer, il faut d’abord réduire l’effet de ${k}.`,`Le point d’appui vient d’une gestion plus lucide de ${k}.`]}
  };
  const spirit={
    origin:{positive:[`Au départ, ${k} ont constitué un point d’appui intérieur.`,`La dynamique s’est d’abord organisée autour de ${k}.`,`À l’origine, ${k} ont ouvert une compréhension utile.`],nuanced:[`Au départ, ${k} ont créé une phase de transition.`,`La dynamique initiale s’est construite autour de ${k}, encore difficiles à équilibrer.`,`À l’origine, ${k} ont installé une période d’ajustement.`],negative:[`Au départ, ${k} ont créé une tension intérieure.`,`La difficulté initiale s’est organisée autour de ${k}.`,`À l’origine, ${k} ont pesé sur la situation.`]},
    evolution:{positive:[`Aujourd’hui, ${k} deviennent plus accessibles et soutiennent l’évolution.`,`Dans le présent, ${k} offrent une compréhension plus claire.`,`Actuellement, ${k} permettent de retrouver un axe plus constructif.`],nuanced:[`Aujourd’hui, ${k} montrent une évolution encore en cours.`,`Dans le présent, ${k} demandent surtout de l’observation et du discernement.`,`Actuellement, ${k} indiquent une phase de transition plutôt qu’une réponse définitive.`],negative:[`Aujourd’hui, ${k} restent ce qui brouille le plus la situation.`,`Dans le présent, ${k} entretiennent encore la tension.`,`Actuellement, ${k} demandent d’être reconnus avant de pouvoir avancer.`]},
    outcome:{positive:[`Pour la suite, ${k} ouvrent une direction plus sereine.`,`La direction à venir valorise ${k}.`,`La suite peut gagner en cohérence grâce à ${k}.`],nuanced:[`Pour la suite, ${k} demandent encore du temps et de l’ajustement.`,`La direction reste ouverte autour de ${k}.`,`La suite dépendra surtout de la manière dont ${k} seront intégrés.`],negative:[`Pour la suite, ${k} indiquent ce qui doit être transformé en priorité.`,`La direction actuelle reste freinée par ${k}.`,`La suite demande de sortir de ${k} avant de retrouver davantage de clarté.`]},
    obstacle:{positive:[`Le point de vigilance est de ne pas idéaliser ${k}.`,`La difficulté est de garder ${k} ancrés dans le réel.`,`Même favorables, ${k} doivent être confrontés aux faits.`],nuanced:[`L’obstacle tient à ${k}, encore difficiles à interpréter clairement.`,`La difficulté se concentre autour de ${k}.`,`Ce qui complique la situation vient de ${k}, qui demandent plus de recul.`],negative:[`L’obstacle principal vient de ${k}.`,`Ce qui brouille le plus la situation reste ${k}.`,`La difficulté centrale se situe dans ${k}.`]},
    resource:{positive:[`${k} constituent le meilleur point d’appui pour avancer.`,`La ressource principale se trouve dans ${k}.`,`Pour retrouver de la cohérence, ${k} peuvent servir de guide.`],nuanced:[`${k} peuvent devenir un appui s’ils sont mieux compris.`,`La ressource passe par une lecture plus lucide de ${k}.`,`Un point d’appui existe dans ${k}, à clarifier.`],negative:[`La ressource consiste à reconnaître ${k} sans les laisser tout envahir.`,`Pour avancer, il faut réduire l’emprise de ${k}.`,`Le point d’appui vient d’une mise à distance plus claire de ${k}.`]}
  };
  const bank=scope==='work'?work:scope==='relation'?relation:spirit;
  const arr=bank?.[role]?.[tone]||bank?.[role]?.nuanced||[];
  return arr[v%Math.max(arr.length,1)]||'';
}
function cr51StageEnglish(card,role,scope){
  const k=cr51Join(cr51Keywords(card,true),true),tone=cr51Tone(card,true),v=cr51Variant(card,role);
  const positive={origin:[`At first, ${k} gave the situation a constructive base.`,`The earlier dynamic was supported by ${k}.`,`Initially, ${k} created useful common ground.`],evolution:[`Now, ${k} are becoming more visible and support a more constructive evolution.`,`At present, ${k} make the situation easier to develop.`,`Currently, ${k} strengthen the most promising part of the situation.`],outcome:[`Going forward, ${k} open a more constructive direction.`,`The next phase gives more importance to ${k}.`,`The direction ahead can grow around ${k}.`],obstacle:[`The point of caution is to turn ${k} into something concrete.`,`The difficulty is making ${k} consistent in practice.`,`Even with potential, ${k} need to be sustained by actions.`],resource:[`${k} provide the strongest resource for moving forward.`,`The best support comes from ${k}.`,`Progress is most likely to come through ${k}.`]};
  const nuanced={origin:[`At first, ${k} created a mixed and still unsettled dynamic.`,`The earlier situation revolved around ${k}, without fully stabilising.`,`Initially, ${k} left several possibilities open.`],evolution:[`Now, ${k} show movement, but not yet a fixed outcome.`,`At present, ${k} point to an evolution that still needs adjustment.`,`Currently, ${k} keep the situation open rather than settled.`],outcome:[`Going forward, ${k} suggest a possible evolution that still depends on how the situation is handled.`,`The next phase remains open around ${k}.`,`The direction ahead depends on how ${k} are integrated.`],obstacle:[`The main difficulty lies around ${k}, which are still unclear.`,`The obstacle is the unresolved nature of ${k}.`,`What complicates the situation most is ${k}.`],resource:[`${k} can become useful if they are clarified.`,`A resource exists in ${k}, but it needs structure.`,`The best support comes from understanding ${k} more clearly.`]};
  const negative={origin:[`At first, ${k} weakened the situation or limited what could develop.`,`The earlier difficulty was driven by ${k}.`,`Initially, ${k} carried more weight than the favourable factors.`],evolution:[`Now, ${k} remain the main source of friction.`,`At present, ${k} still slow the situation down.`,`Currently, ${k} continue to make progress harder.`],outcome:[`Going forward, ${k} show what must change before the situation can stabilise.`,`The next phase remains constrained by ${k}.`,`The direction ahead requires a real change around ${k}.`],obstacle:[`The main obstacle comes from ${k}.`,`What blocks progress most is ${k}.`,`The central difficulty remains ${k}.`],resource:[`The resource lies in addressing ${k} directly.`,`Moving forward requires reducing the impact of ${k}.`,`The best support comes from facing ${k} clearly.`]};
  const bank=tone==='positive'?positive:tone==='negative'?negative:nuanced;
  const arr=bank[role]||bank.evolution;
  return arr[v%arr.length];
}
function cr51FinalFrench(cards,scope,q){
  const tones=cards.map(c=>cr51Tone(c,false));
  const pos=tones.filter(x=>x==='positive').length,neg=tones.filter(x=>x==='negative').length;
  const intent=cr51QuestionIntent(q),variant=Math.abs(String(q||'').length+cards.reduce((a,c)=>a+Number(c?.id||0),0))%3;
  if(scope==='relation'&&intent==='return'){
    if(neg>=Math.ceil(cards.length/2))return [`Pour la question d’un retour, l’ensemble suggère qu’une reprise ne pourrait être solide qu’après un changement réel de la dynamique actuelle.`,`Concernant un retour, le tirage met surtout l’accent sur ce qui doit changer avant qu’un rapprochement puisse tenir dans la durée.`,`L’ensemble ne décrit pas un simple retour en arrière : il indique qu’une reprise demanderait de transformer les points de tension qui ont déjà fragilisé le lien.`][variant];
    if(pos>=Math.ceil(cards.length/2)&&neg===0)return [`Pour la question d’un retour, l’ensemble suggère moins de reprendre exactement l’ancienne relation que de créer une nouvelle manière d’être en lien, plus réciproque, plus naturelle et respectueuse de l’espace de chacun.`,`Concernant un retour, la dynamique paraît surtout inviter à renouer autrement : en conservant ce qui rapproche, tout en évitant de recréer les anciens déséquilibres.`,`Le tirage ne parle pas d’un retour à l’identique. Il décrit plutôt la possibilité d’un nouveau cadre relationnel, plus simple, plus partagé et moins contraignant.`][variant];
    return [`Pour la question d’un retour, l’ensemble laisse une possibilité d’évolution, mais celle-ci dépend surtout d’un nouvel équilibre entre rapprochement, clarté et respect du rythme de chacun.`,`Concernant un retour, la dynamique reste ouverte : ce qui compte n’est pas seulement de reprendre contact, mais de voir si le lien peut fonctionner autrement qu’avant.`,`Le tirage suggère qu’un retour éventuel aurait surtout du sens s’il s’accompagne d’une nouvelle manière de communiquer et de se positionner dans le lien.`][variant];
  }
  if(scope==='relation'){
    if(neg>pos)return [`Dans l’ensemble, le tirage insiste davantage sur ce qui doit être clarifié ou transformé avant qu’une évolution relationnelle puisse devenir stable.`,`La dynamique générale montre qu’un mouvement reste possible, mais qu’il passe d’abord par la résolution des tensions qui dominent encore le lien.`,`L’ensemble demande surtout de regarder la qualité réelle de la réciprocité avant d’interpréter les signes de rapprochement comme une évolution acquise.`][variant];
    if(pos>neg)return [`Dans l’ensemble, la dynamique est constructive, mais elle gagne à être confirmée par des gestes réciproques et une évolution concrète du lien.`,`Le fil général est plutôt favorable : il met cependant l’accent sur la qualité des actes, du dialogue et de la place laissée à chacun.`,`L’ensemble décrit une évolution possible vers davantage de fluidité, à condition que l’investissement reste partagé.`][variant];
    return [`Dans l’ensemble, la situation reste ouverte : elle contient à la fois des possibilités de rapprochement et des ajustements encore nécessaires.`,`Le fil général est nuancé : quelque chose peut évoluer, mais la relation demande encore de trouver un fonctionnement plus clair et plus équilibré.`,`L’ensemble ne ferme pas la situation, mais montre qu’elle doit encore se préciser dans les faits.`][variant];
  }
  if(scope==='work'){
    if(neg>pos)return [`Dans l’ensemble, la priorité est de corriger les blocages avant d’accélérer le projet.`,`Le fil général invite d’abord à sécuriser les points faibles avant de chercher une nouvelle expansion.`,`L’ensemble montre que la progression dépend davantage d’un réajustement précis que d’un simple effort supplémentaire.`][variant];
    if(pos>neg)return [`Dans l’ensemble, la dynamique soutient une progression concrète, à condition de transformer les possibilités en décisions et en actions.`,`Le fil général est constructif : la suite dépend surtout de la capacité à organiser et consolider ce qui fonctionne déjà.`,`L’ensemble montre un potentiel d’avancée qui gagnera à être structuré avec des choix clairs.`][variant];
    return [`Dans l’ensemble, la situation professionnelle reste ouverte et demande encore quelques arbitrages avant de se stabiliser.`,`Le fil général montre une évolution possible, mais encore dépendante de plusieurs ajustements.`,`L’ensemble invite à préciser la direction avant d’engager davantage de ressources.`][variant];
  }
  if(neg>pos)return [`Dans l’ensemble, le message principal est de reconnaître ce qui crée encore de la tension avant de chercher une réponse définitive.`,`Le fil général invite d’abord à clarifier les zones de tension plutôt qu’à forcer une conclusion.`,`L’ensemble montre que le prochain mouvement utile passe par une meilleure compréhension de ce qui bloque encore.`][variant];
  if(pos>neg)return [`Dans l’ensemble, le tirage décrit une évolution constructive, à laisser se confirmer progressivement dans les faits.`,`Le fil général va vers davantage de cohérence et d’ouverture, sans demander de précipiter la suite.`,`L’ensemble suggère un mouvement favorable qui gagnera à être accompagné avec discernement et simplicité.`][variant];
  return [`Dans l’ensemble, la situation reste en transition et demande encore de l’observation avant de prendre une forme plus nette.`,`Le fil général reste ouvert : plusieurs éléments évoluent encore et méritent d’être lus ensemble plutôt que séparément.`,`L’ensemble décrit une phase intermédiaire, davantage tournée vers l’ajustement que vers une conclusion définitive.`][variant];
}
function cr51FinalEnglish(cards,scope,q){
  const tones=cards.map(c=>cr51Tone(c,true)),pos=tones.filter(x=>x==='positive').length,neg=tones.filter(x=>x==='negative').length;
  const intent=cr51QuestionIntent(q);
  if(scope==='relation'&&intent==='return'){
    if(neg>=Math.ceil(cards.length/2))return 'For the question of a return, the reading suggests that a lasting reconnection would require a real change in the current dynamic.';
    if(pos>=Math.ceil(cards.length/2)&&neg===0)return 'For the question of a return, the reading points less to recreating the old relationship than to finding a new, more reciprocal and less restrictive way of relating.';
    return 'For the question of a return, the situation remains open, but any reconnection would need a different balance between closeness, clarity and personal space.';
  }
  if(neg>pos)return 'Overall, the reading focuses first on what still needs to be clarified or changed before the situation can become stable.';
  if(pos>neg)return 'Overall, the dynamic is constructive, but it still needs to be confirmed through consistent actions and real reciprocity.';
  return 'Overall, the situation remains open and still requires adjustment before it can take a clearer form.';
}
function storyInterpretation(cards){
  if(!Array.isArray(cards)||!cards.length)return '';
  const en=state?.lang==='en',scope=cr51Scope(),q=String(state?.question||'').trim();
  const question=q?`<p class="reading-question">${en?'Your question':'Votre question'} : « ${cr51Esc(q)} »</p>`:'';
  const chosen=cards.length===1?cards.slice(0,1):cards.length===3?cards.slice(0,3):cards.slice(0,5);
  const roles=chosen.length===1?['origin']:chosen.length===3?['origin','evolution','outcome']:['origin','obstacle','resource','evolution','outcome'];
  const parts=chosen.map((c,i)=>en?cr51StageEnglish(c,roles[i],scope):cr51StageFrench(c,roles[i],scope));
  if(chosen.length>1)parts.push(en?cr51FinalEnglish(chosen,scope,q):cr51FinalFrench(chosen,scope,q));
  const story=parts.filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
  return `<div class="story-reading" data-story-engine="${CRISTARIVA_FLUID_STORY_VERSION}"><h3>${en?'The story told by your cards':'L’histoire racontée par vos cartes'}</h3>${question}<p class="story-continuous">${cr51Esc(story)}</p></div>`;
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