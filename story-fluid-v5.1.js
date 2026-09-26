/* CRISTARIVA — récit fluide global v5.30
   Le récit final synthétise les cartes au lieu de recopier leurs définitions.
   Il s'appuie sur les mots-clés, la tonalité, la position et la question.
*/
const CRISTARIVA_FLUID_STORY_VERSION='5.31';

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
function cr51NarrativeFamily(card,en=false){
  const fam=cr51Family(card,en);
  const map={
    past:'past', tension:'tension', bond:'bond', insight:'insight',
    movement:'movement', change:'change', ground:'ground',
    ambiguity:'ambiguity', opening:'opening', neutral:'neutral'
  };
  return map[fam]||'neutral';
}
function cr51Pick(arr,card,role){
  const a=Array.isArray(arr)?arr:[];
  if(!a.length)return '';
  return a[cr51Variant(card,role)%a.length];
}
function cr51StageFrench(card,role,scope){
  const fam=cr51NarrativeFamily(card,false);
  const tone=cr51Tone(card,false);

  const common={
    origin:{
      tension:[
        "Au départ, quelque chose semble avoir ralenti l’évolution de la situation, comme si un obstacle, une hésitation ou une difficulté à décider avait maintenu les choses en suspens.",
        "La situation paraît d’abord avoir traversé une phase de ralentissement, avec l’impression qu’un élément empêchait d’avancer aussi librement qu’espéré."
      ],
      ambiguity:[
        "Au départ, la situation semble s’être installée dans une forme d’incertitude, avec des signaux difficiles à interpréter et une direction encore peu claire.",
        "La première impression est celle d’un entre-deux : quelque chose existe, mais sans parvenir encore à trouver une forme vraiment définie."
      ],
      opening:[
        "Au départ, une ouverture semble s’être créée, apportant une possibilité nouvelle ou l’impression qu’un autre chemin devenait envisageable.",
        "La situation paraît avoir commencé sur une note d’ouverture, avec un potentiel réel qui demandait encore à se confirmer."
      ],
      bond:[
        "Au départ, un lien important semble avoir servi de point d’ancrage et donné du sens à ce qui allait suivre.",
        "La première dynamique évoque un attachement ou une proximité qui a constitué la base de la situation."
      ],
      change:[
        "Au départ, une période de transition semble déjà avoir été engagée, comme si une ancienne manière de vivre la situation arrivait à son terme.",
        "La situation paraît s’être ouverte dans un contexte de changement, avec la nécessité de laisser évoluer ce qui ne pouvait plus rester identique."
      ],
      neutral:[
        "Au départ, la situation semble avoir traversé une phase d’ajustement qui a préparé progressivement la suite.",
        "La première étape évoque surtout une période où les choses se mettaient en place sans être encore totalement définies."
      ]
    },
    obstacle:{
      tension:[
        "Ce qui complique aujourd’hui le chemin tient surtout à une résistance encore présente, qu’elle vienne des circonstances, des peurs ou d’une difficulté à agir clairement.",
        "La difficulté principale semble venir d’un frein qui continue d’entretenir l’attente ou la tension."
      ],
      ambiguity:[
        "Le point le plus délicat reste le manque de clarté : tant que certaines intentions ou certains ressentis demeurent flous, il est difficile de savoir dans quelle direction avancer.",
        "L’obstacle semble surtout venir de ce qui reste indécis ou ambigu, laissant trop de place aux suppositions."
      ],
      movement:[
        "Le mouvement lui-même peut devenir déstabilisant s’il est trop rapide ou irrégulier ; il demande à être accompagné par des choix plus posés.",
        "La difficulté vient moins de l’absence d’élan que de sa rapidité, qui peut rendre la situation difficile à stabiliser."
      ],
      past:[
        "Une partie du frein semble encore liée à ce qui appartient au passé et continue d’influencer la manière de vivre la situation présente.",
        "Ce qui a déjà été vécu pèse encore sur la suite et peut empêcher d’aborder pleinement la situation avec un regard neuf."
      ],
      neutral:[
        "La difficulté tient surtout à ce qui n’a pas encore trouvé sa juste place et demande à être mieux compris avant d’aller plus loin.",
        "Le principal frein semble venir d’un déséquilibre encore non résolu, plus que d’une fermeture définitive."
      ]
    },
    resource:{
      change:[
        "La meilleure ressource réside dans la capacité à accepter une transformation réelle, plutôt que de chercher à conserver exactement ce qui existait auparavant.",
        "Un changement profond peut devenir un véritable point d’appui, à condition de l’accueillir comme une évolution plutôt que comme une perte."
      ],
      insight:[
        "La situation peut progresser grâce à une compréhension plus lucide de ce qui se joue réellement, sans chercher à forcer une réponse immédiate.",
        "Le meilleur appui vient d’un regard plus clair sur les faits, les émotions et les limites de chacun."
      ],
      ground:[
        "Ce qui peut le mieux soutenir la suite est de retrouver une base plus stable, plus simple et plus concrète.",
        "La ressource principale consiste à avancer avec davantage de stabilité, en privilégiant ce qui est réellement solide."
      ],
      bond:[
        "Le lien lui-même peut devenir une ressource s’il repose sur une présence sincère, une écoute mutuelle et une implication réellement partagée.",
        "Ce qui peut aider vient de la qualité du lien, à condition qu’il reste équilibré et nourri des deux côtés."
      ],
      opening:[
        "Une nouvelle possibilité peut servir de point d’appui si elle est accueillie sans précipitation et laissée libre d’évoluer naturellement.",
        "La situation bénéficie d’une ouverture qui peut permettre d’envisager la suite autrement."
      ],
      neutral:[
        "La ressource se trouve dans une manière plus consciente et plus souple d’aborder la situation, sans chercher à tout définir immédiatement.",
        "Ce qui peut aider est de laisser émerger une réponse plus claire à partir de faits concrets et d’un positionnement plus serein."
      ]
    },
    evolution:{
      movement:[
        "Désormais, quelque chose recommence à bouger. Une impulsion nouvelle peut relancer la situation, à condition de ne pas confondre vitesse et profondeur.",
        "La dynamique actuelle retrouve du mouvement et peut ouvrir une nouvelle étape, mais elle demande encore à être consolidée."
      ],
      change:[
        "Peu à peu, une transformation se dessine. La manière de vivre, de comprendre ou d’aborder la situation semble évoluer vers quelque chose de différent.",
        "La situation entre dans une phase de mutation : certaines anciennes habitudes perdent de leur importance et laissent place à une autre manière d’avancer."
      ],
      opening:[
        "Aujourd’hui, une ouverture devient plus visible et permet d’envisager la suite avec davantage de souplesse.",
        "La dynamique actuelle laisse apparaître une possibilité nouvelle, encore fragile mais suffisamment présente pour modifier la perspective."
      ],
      ground:[
        "La situation cherche maintenant davantage de stabilité et d’équilibre, comme si le besoin de construire sur des bases plus sûres devenait prioritaire.",
        "L’évolution actuelle pousse vers quelque chose de plus posé, plus cohérent et plus respectueux des besoins réels."
      ],
      ambiguity:[
        "Pour l’instant, l’évolution reste réelle mais encore difficile à définir complètement. Tout n’a pas encore pris une forme stable.",
        "Quelque chose évolue, mais la direction exacte n’est pas encore entièrement fixée et demande encore un peu de temps."
      ],
      neutral:[
        "La dynamique évolue progressivement, sans rupture brutale, et semble conduire vers une nouvelle manière de considérer la situation.",
        "Un déplacement s’opère peu à peu, invitant à regarder la situation autrement qu’au début du tirage."
      ]
    },
    outcome:{
      ambiguity:[
        "Pour la suite, tout n’est pas encore complètement éclairci. Certaines intentions, émotions ou informations peuvent rester difficiles à exprimer ou à comprendre.",
        "La suite conserve une part d’incertitude, notamment autour de ce qui n’est pas encore formulé ouvertement."
      ],
      tension:[
        "Pour avancer durablement, il faudra probablement lever un frein encore présent plutôt que prolonger la situation telle qu’elle fonctionne aujourd’hui.",
        "La suite dépendra surtout de la capacité à dépasser ce qui continue de créer de la tension ou de la retenue."
      ],
      opening:[
        "La suite semble pouvoir s’ouvrir progressivement, sans exiger de tout savoir immédiatement. L’essentiel sera de laisser la situation révéler sa véritable direction.",
        "Une possibilité nouvelle se dessine pour la suite, à condition de ne pas la forcer et de rester attentif à ce qui se confirme réellement."
      ],
      ground:[
        "La direction la plus constructive consiste à privilégier ce qui apporte de la stabilité, de la cohérence et un sentiment d’équilibre durable.",
        "La suite gagnera à se construire sur des bases simples et solides plutôt que sur des impressions passagères."
      ],
      change:[
        "La suite semble surtout annoncer un nouveau chapitre : ce qui viendra ne pourra probablement pas être une simple répétition de ce qui existait auparavant.",
        "La direction qui se dessine passe par un véritable changement de cadre ou de manière d’avancer."
      ],
      neutral:[
        "La suite reste ouverte et paraît devoir se préciser progressivement, au rythme des choix et des événements à venir.",
        "Rien ne semble entièrement figé : la direction se construira surtout à partir de ce qui sera réellement vécu et exprimé."
      ]
    }
  };

  const relationOverrides={
    origin:{
      tension:[
        "Une période de ralentissement semble avoir marqué la vie affective, comme si quelque chose avait empêché les sentiments ou la relation d’évoluer pleinement.",
        "Sur le plan sentimental, la situation paraît d’abord avoir été freinée par une attente, une hésitation ou une difficulté à faire avancer le lien."
      ],
      bond:[
        "Au départ, un attachement réel semble avoir donné au lien sa force et son importance.",
        "La relation semble s’être construite autour d’une proximité ou d’un attachement qui a compté sincèrement."
      ]
    },
    obstacle:{
      movement:[
        "Une émotion très vive ou un rapprochement soudain peut bouleverser l’équilibre. L’intensité est réelle, mais elle demande du temps pour révéler sa profondeur.",
        "Ce qui déstabilise le plus peut être la force soudaine d’une attirance ou d’un élan, capable d’accélérer les choses avant qu’elles aient trouvé leur équilibre."
      ]
    },
    resource:{
      change:[
        "Une transformation profonde peut permettre de sortir des anciens schémas et d’aborder les sentiments d’une manière plus juste et plus consciente.",
        "Le meilleur point d’appui vient de la capacité à faire évoluer la relation ou sa manière d’aimer, plutôt que de répéter ce qui ne fonctionne plus."
      ]
    },
    evolution:{
      ground:[
        "Peu à peu, le besoin d’une relation plus équilibrée se fait sentir, avec davantage de respect pour l’espace, le rythme et l’identité de chacun.",
        "L’évolution actuelle invite à trouver un équilibre entre proximité et liberté, afin que chacun puisse rester lui-même dans le lien."
      ]
    },
    outcome:{
      ambiguity:[
        "Tout n’est cependant pas encore complètement éclairci. Certains sentiments, certaines intentions ou certaines vérités peuvent rester discrets ou difficiles à exprimer.",
        "La suite garde une part de non-dit : quelque chose semble encore devoir être révélé ou formulé avant que la relation puisse être pleinement comprise."
      ]
    }
  };

  const bank=(scope==='relation'&&relationOverrides?.[role]?.[fam]) ? relationOverrides[role][fam]
    : common?.[role]?.[fam] || common?.[role]?.[tone] || common?.[role]?.neutral || [];
  return cr51Pick(bank,card,role);
}
function cr51StageEnglish(card,role,scope){
  const fam=cr51NarrativeFamily(card,true);
  const common={
    origin:{
      tension:["At first, the situation seems to have been slowed by a blockage, hesitation or difficulty moving forward.","The story begins with a period of delay, as though something kept the situation from developing freely."],
      ambiguity:["At first, the situation seems to have settled into uncertainty, with no fully clear direction.","The opening stage feels unresolved, with something present but not yet clearly defined."],
      change:["The story begins in a period of transition, as though an older pattern was already starting to change."],
      neutral:["At first, the situation appears to have been in a period of adjustment, preparing the ground for what followed."]
    },
    obstacle:{
      tension:["The main difficulty comes from a resistance that is still present and continues to slow progress.","What complicates the situation most is a lingering blockage that keeps things in suspense."],
      ambiguity:["The main difficulty is the lack of clarity; some intentions or feelings still seem hard to read.","The obstacle lies in what remains uncertain or unspoken."],
      movement:["A sudden burst of emotion or momentum can be powerful, but its speed can also make the situation harder to stabilise."],
      neutral:["The main difficulty lies in something that has not yet found its proper place or meaning."]
    },
    resource:{
      change:["The strongest resource is the ability to accept a real transformation instead of trying to preserve the past unchanged.","A genuine change of perspective can become the key to moving forward."],
      insight:["Clearer understanding and a more lucid view of the facts can help the situation progress."],
      ground:["The best support comes from rebuilding on a steadier, simpler and more concrete foundation."],
      neutral:["The most useful resource is a calmer, more conscious way of approaching the situation."]
    },
    evolution:{
      movement:["Now, something begins to move again. A fresh impulse can reopen the situation, provided speed is not confused with depth."],
      change:["Gradually, a transformation is taking shape and the way the situation is understood or lived is beginning to change."],
      ground:["The situation is now moving toward greater balance and stability."],
      ambiguity:["Something is changing, but the exact direction is not fully settled yet."],
      neutral:["The dynamic is evolving gradually and invites a different way of looking at the situation."]
    },
    outcome:{
      ambiguity:["Going forward, not everything is fully clear yet. Some feelings, intentions or information may still remain unspoken.","The next phase still contains uncertainty around what has not yet been openly expressed."],
      tension:["For lasting progress, an unresolved source of tension will probably need to be addressed rather than carried forward unchanged."],
      change:["The direction ahead points to a new chapter rather than a simple repetition of the past."],
      ground:["The most constructive direction is the one that brings greater stability, coherence and balance."],
      neutral:["The future remains open and is likely to become clearer through what is actually lived, chosen and expressed."]
    }
  };
  return cr51Pick(common?.[role]?.[fam]||common?.[role]?.neutral||[],card,role);
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