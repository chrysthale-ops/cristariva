/* CRISTARIVA — narration universelle fluide v6.3
   Dernière couche commune à tous les oracles et au tarot.
   Règles : aucun nom de carte dans le récit, aucune liste brute de mots-clés,
   narration continue, transitions variées, prise en charge de tout nombre de cartes.
*/
(function(){
'use strict';
const VERSION='6.44';

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
  // The selected domain is authoritative; a question must not change it.
  const d=norm(state?.domain||'');
  if(/profession|travail|projet|work|career/.test(d))return 'work';
  if(/sentiment|relation|romantic|love/.test(d))return 'relation';
  if(/general|spirit/.test(d))return 'life';
  return 'life';
}
function theme(card,en=false){
  const title=norm((en?card?.en?.name:card?.name)||card?.name);
  if(!card?._themePass){
    const primary={name:card?.name,keywords:card?.keywords,_themePass:true,en:{name:card?.en?.name,keywords:card?.en?.keywords}};
    const key=theme(primary,en);
    if(key!=='neutral')return key;
  }
  if(/triangle|triangul|troisieme personne|rivalit/.test(title))return 'ambiguity';
  if(/dispute|querelle|conflit|altercation/.test(title))return 'conflict';
  if(/engagement|promesse|officialisation|construction/.test(title))return 'ground';
  if(/communication|dialogue|parole|conversation|clarification|communication|dialog/.test(title))return 'insight';
  if(/impasse|incompatibil|blocage|obstacle|rupture|conflit|trahison|infidelit|betrayal|deadlock/.test(title))return 'tension';
  if(/silence|retrait|absence de reponse|non dit/.test(title))return 'ambiguity';
  if(/alignement|coherence|accord/.test(title))return 'ground';
  if(/desir|attirance|passion/.test(title))return 'movement';
  if(/projet a deux|avenir commun|vie commune/.test(title))return 'bond';
  const h=title+' '+hay(card,en);
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
  // A title and explicit keywords express the symbol. Incidental words in
  // prose (including negations and comparisons) must never override them.
  if(!card?._semanticPass){
    const primary={...card,_semanticPass:true,definition:'',meaning:'',category:'',en:{...card?.en,definition:'',meaning:'',category:''}};
    const titled=motif({...primary,keywords:'',en:{...primary.en,keywords:''}},enMode);
    if(titled)return titled;
    const keyed=motif(primary,enMode);
    if(keyed)return keyed;
  }

  const exact={malentendu:'misunderstanding',misunderstanding:'misunderstanding',sincerite:'honesty',sincerity:'honesty',honesty:'honesty',plaisir:'pleasure',pleasure:'pleasure',retour:'return',return:'return',patience:'patience',fidelite:'loyalty',loyalty:'loyalty',faithfulness:'loyalty','attirance reciproque':'mutualAttraction','mutual attraction':'mutualAttraction',rencontre:'encounter',meeting:'encounter',complicite:'companionship',complicity:'companionship',soulmate:'soulmate','ame soeur':'soulmate'};
  if(exact[name])return exact[name];

  // Keep these symbols distinct from loss, speed and generic adjustment.
  if(/^(signe|sign|signs)$/.test(name))return 'synchronicity';
  if(/^(regrets|regret)$/.test(name))return 'regrets';
  if(/^(echeance|deadline)$/.test(name))return 'deadline';
  if(/^(intuition)$/.test(name))return 'intuition';
  if(/^(eveil|awakening)$/.test(name))return 'awakening';

  if(/^(destin|destiny|fate)$/.test(name))return 'destiny';
  if(/seconde chance|deuxieme chance|second chance/.test(name))return 'retry';
  if(/tentation|temptation/.test(name))return 'temptation';
  if(/^(alignement|alignment)$/.test(name))return 'alignment';
  if(/^(rupture|breakup|break-up|separation)$/.test(name))return 'separation';
  if(/^(bonheur|happiness)$/.test(name))return 'happiness';
  if(/^(lien amoureux|romantic bond|love bond)$/.test(name))return 'romantic';
  if(/^(evolution|development|growth)$/.test(name))return 'change';
  if(/^(protection)$/.test(name))return 'ground';
  if(/^(tendresse|tenderness)$/.test(name))return 'tenderness';
  if(/^(intimite|intimacy)$/.test(name))return 'intimacy';
  if(/^(ame jumelle|twin soul|twin flame)$/.test(name))return 'mirror';
  if(/^(amitie|friendship)$/.test(name))return 'friendship';
  if(/^(union)$/.test(name))return 'union';
  if(/^(karma)$/.test(name))return 'patterns';
  // Love-oracle titles whose exact symbolic meaning must survive broad keyword classification.
  if(/^(secret)$/.test(name))return 'secret';
  if(/^(ame soeur|soulmate|soul mate)$/.test(name))return 'soulmate';
  if(/^(transformation)$/.test(name))return 'transformation';
  if(/^(coup de foudre|love at first sight)$/.test(name))return 'lightning';
  if(/^(silence)$/.test(name))return 'silence';
  const k=norm([local?.name,local?.category,local?.keywords,local?.definition||local?.meaning].filter(Boolean).join(' '));
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
  if(/cooperation|soutien|entraide|equipe|partage|collaboration/.test(k))return 'cooperation';
  if(/regle|conseil|jugement|evaluation|tradition/.test(k))return 'insight';
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

/* These readings preserve each symbol and its position without generic padding.
   They also feed the concise role summary, so both outputs agree. */
// Preserve the actual symbol before broad theme classification, in every role.
function exactRoleMeaning(card,role,enMode){
  const key=norm(card?.name).replace(/œ/g,'oe')==='ame soeur'?'soulmate':motif(card,false), sc=scope();
  const concepts={
    soulmate:['la recherche d’une familiarité profonde, d’une compréhension mutuelle et d’une compatibilité affective','the search for deep familiarity, mutual understanding and emotional compatibility'],
    loyalty:['la constance, la loyauté et le respect des engagements','constancy, loyalty and respect for commitments'],
    mutualAttraction:['un intérêt et un désir qui circulent des deux côtés','interest and desire shared by both people'],
    encounter:['l’ouverture d’un nouveau contact ou un rapprochement significatif','a new contact or a meaningful rapprochement'],
    companionship:['une compréhension naturelle, des échanges spontanés et le plaisir d’être ensemble','natural understanding, spontaneous exchanges and enjoyment of being together'],
    misunderstanding:['un décalage entre ce qui a été exprimé et ce qui a été compris','a gap between what was expressed and what was understood'],
    honesty:['des paroles authentiques et des intentions cohérentes avec les actes','honest words and intentions consistent with actions'],
    pleasure:sc==='relation'?['la joie de partager des moments agréables, la sensualité et la légèreté','the joy of enjoyable shared moments, sensuality and lightness']:['le plaisir et le bien-être que cette expérience peut apporter','the enjoyment and wellbeing this experience can bring'],
    return:sc==='relation'?['la réapparition possible d’un contact ou d’une histoire affective du passé','the possible reappearance of a contact or an emotional connection from the past']:['la reprise possible d’un contact, d’un sujet ou d’une situation du passé','the possible return of a contact, issue or situation from the past'],
    patience:['une progression lente qui demande du temps et ne peut pas être forcée','slow progress that takes time and cannot be forced']
  };
  if(!concepts[key])return '';
  const idea=concepts[key][enMode?1:0];
  const lead=enMode?{
    origin:`The situation is rooted in ${idea}.`,obstacle:`The unresolved challenge concerns ${idea}.`,resource:`You can draw strength from ${idea}.`,evolution:`The next development points towards ${idea}.`,outcome:`Taken together, the spread calls for attention to ${idea}.`
  }:{
    origin:`La situation trouve son origine dans ${idea}.`,obstacle:`Le point à résoudre concerne ${idea}.`,resource:`Vous pouvez vous appuyer sur ${idea}.`,evolution:`La suite laisse entrevoir ${idea}.`,outcome:`L’ensemble du tirage met l’accent sur ${idea}.`
  };
  const actions={
    soulmate:['Ce besoin de proximité donne son sens à votre attente, sans supposer qu’une relation existe déjà ni promettre un lien parfait.','This need for closeness gives meaning to your hopes without assuming a relationship already exists or promising a perfect bond.'],
    loyalty:[role==='obstacle'?'La difficulté est de savoir si les engagements et les comportements seront cohérents dans la durée ; cette position ne permet pas de conclure à une infidélité.':'La confiance se construit par la continuité des comportements et le respect des engagements.','Trust requires consistent behaviour and respected commitments; an obstacle position does not establish infidelity.'],
    mutualAttraction:['Cette réciprocité peut faciliter le rapprochement ; elle demande encore à se traduire en initiatives et en choix partagés.','This reciprocity can support closeness when it becomes shared initiatives and choices.'],
    encounter:['Un échange, une première rencontre ou une redécouverte pourrait faire évoluer votre vie affective, sans fixer de date précise.','An exchange, a first meeting or a rediscovery could change your emotional life without setting a precise date.'],
    companionship:['La perspective repose sur l’humour, la coopération et une proximité vécue simplement au quotidien.','The outlook rests on humour, cooperation and simple everyday closeness.'],
    misunderstanding:['Vérifier les paroles et les faits permettrait de ne pas décider à partir d’une interprétation erronée.','Checking words and facts would help avoid decisions based on a mistaken interpretation.'],
    honesty:[role==='obstacle'?'Une franchise encore difficile à établir ou à recevoir empêche de savoir sur quoi compter ; un échange ouvert reste nécessaire.':'Exprimer clairement les attentes et vérifier leur cohérence avec les comportements permettrait de savoir sur quoi compter.','Clear expectations and openness about intentions need to be checked against behaviour.'],
    pleasure:[role==='obstacle'?'La recherche de satisfaction immédiate risque de détourner l’attention de ce qui demande à être réglé.':'Ce qui vous fait du bien constitue un appui réel, sans suffire à garantir un engagement durable.','Enjoyment can offer real support, though immediate satisfaction does not establish lasting commitment.'],
    return:['Une reprise ne garantit pas que les difficultés anciennes soient résolues : il faudra observer ce qui fonctionne réellement autrement.','Renewed contact does not establish that old difficulties have been resolved; look for what actually works differently.'],
    patience:[role==='obstacle'?'L’attente risque de figer la situation si elle remplace les échanges ou les décisions nécessaires.':'Laisser du temps permettrait d’observer des changements réels, sans suspendre vos propres choix à une promesse de résultat.','Allow time to observe real changes without putting your own choices on hold for a promised outcome.']
  };
  return (lead[role]||lead.outcome)+' '+actions[key][enMode?1:0];
}

function faithfulSymbol(card,role,enMode){
  const exact=exactRoleMeaning(card,role,enMode);
  if(exact)return exact;
  const key=motif(card,false);
  const readings={
    synchronicity:{
      origin:['Des coïncidences ou des motifs qui se répètent ont attiré votre attention et nourri votre recherche de sens. Ils ouvrent une réflexion sur ce que vous vivez, sans constituer à eux seuls une réponse certaine.','Coincidences or recurring patterns have drawn your attention and prompted a search for meaning. They invite reflection on your experience without providing a certain answer on their own.'],
      obstacle:['Chercher un message dans chaque coïncidence peut brouiller votre compréhension. Le discernement consiste à laisser une place au sens symbolique sans lui faire dire ce que vous espérez entendre.','Looking for a message in every coincidence can cloud your understanding. Discernment means allowing symbolic meaning without making it confirm what you hope to hear.'],
      resource:['Les motifs qui se répètent peuvent vous aider à repérer ce qui mérite votre attention. Les rapprocher de votre expérience concrète donne un appui à votre réflexion.','Recurring patterns can help you notice what deserves attention. Relating them to your actual experience supports your reflection.'],
      evolution:['Votre attention aux coïncidences et aux répétitions peut s’affiner. Leur sens se précise en les confrontant à votre vécu plutôt qu’en recherchant une confirmation systématique.','Your attention to coincidences and repetitions may become more sensitive. Their meaning becomes clearer through lived experience rather than a constant search for confirmation.'],
      outcome:['Le fil du tirage invite à observer les répétitions porteuses de sens tout en gardant votre discernement. Elles peuvent éclairer votre cheminement, sans décider à votre place.','The spread invites attention to meaningful repetitions while retaining discernment. They may illuminate your path without deciding for you.']
    },
    regrets:{
      origin:['Votre recherche actuelle prend racine dans ce que vous auriez voulu vivre ou choisir autrement. Revenir sur cette expérience peut vous aider à comprendre ce qui compte encore pour vous.','Your present search is rooted in what you wish you had experienced or chosen differently. Revisiting that experience may help clarify what still matters to you.'],
      obstacle:['Ce cheminement reste freiné par ce que vous auriez voulu faire autrement. Rejouer le passé entretient l’hésitation ; en tirer une décision pour le présent vous permettrait de retrouver une marge de choix.','This process is held back by what you wish you had done differently. Replaying the past sustains hesitation; turning its lessons into a present decision can restore room for choice.'],
      resource:['Votre expérience passée peut devenir un appui si vous en tirez un enseignement précis. Ce que vous souhaiteriez changer vous aide à choisir différemment maintenant.','Past experience can support you when you draw a clear lesson from it. What you wish to change can help you choose differently now.'],
      evolution:['Des choix anciens peuvent revenir à votre esprit. Leur utilité sera de vous conduire à une réponse présente, plutôt que de prolonger le scénario de ce qui aurait pu être.','Earlier choices may return to mind. Their value lies in helping you respond now rather than extending the story of what might have been.'],
      outcome:['L’essentiel est de transformer ce que vous auriez voulu vivre autrement en choix actuel. Le passé apporte un enseignement ; il ne doit pas retenir toute votre attention au détriment de ce qui reste à vivre.','The central task is to turn what you wish had been different into a present choice. The past offers a lesson without needing to take all your attention away from what remains to be lived.']
    },
    deadline:{
      origin:['Une étape arrivée à son terme, ou une décision devenue nécessaire, a déclenché votre réflexion. Ce passage demande de reconnaître ce qui doit être achevé avant d’ouvrir la suite.','A stage reaching its end, or a decision becoming necessary, has prompted your reflection. This passage asks you to recognize what needs completion before moving on.'],
      obstacle:['Une clôture ou une décision reste en suspens et retarde la suite. Préciser ce qui doit être terminé vous aiderait à sortir de cette attente.','An unfinished closure or decision is delaying the next step. Clarifying what needs completion can help you move beyond waiting.'],
      resource:['Un terme à respecter ou une décision à prendre vous offre un point d’appui concret. Achever ce qui est resté en suspens peut libérer l’espace nécessaire à une nouvelle étape.','An endpoint to respect or a decision to make offers concrete support. Completing what remains pending can make room for a new stage.'],
      evolution:['Le cheminement vous rapproche d’un moment où il faudra conclure ou décider. Préparer cette clôture permet de franchir le passage avec davantage de conscience.','The process brings you closer to a point of closure or decision. Preparing that ending can help you cross into the next stage more consciously.'],
      outcome:['La direction du tirage demande de mener une étape à son terme. Une clôture ou une décision claire ouvre la suite, sans que cela permette de fixer une date précise.','The direction of the spread calls for bringing a stage to completion. Clear closure or a decision opens what follows without establishing a precise date.']
    },
    intuition:{
      origin:['Un ressenti intérieur a éveillé votre questionnement. L’écouter avec attention, tout en distinguant perception, désir et projection, permet de mieux comprendre ce qui vous traverse.','An inner feeling has prompted your questioning. Listening carefully while distinguishing perception, desire and projection can clarify your experience.'],
      obstacle:['La difficulté tient à la distinction entre ce que vous percevez et ce que vous souhaitez. Un ressenti mérite d’être écouté, puis confronté à votre expérience avant de devenir une certitude.','The difficulty lies in distinguishing what you perceive from what you wish for. A feeling deserves attention and comparison with experience before becoming a certainty.'],
      resource:['Votre écoute intérieure constitue une ressource. Elle devient plus fiable lorsque vous prenez le temps de distinguer un ressenti calme d’un désir pressant ou d’une projection.','Inner listening is a resource. It becomes more reliable when you distinguish a calm feeling from an urgent wish or a projection.'],
      evolution:['Votre écoute intérieure peut devenir plus fine. L’enjeu est de reconnaître ce que vous percevez réellement, sans le confondre avec vos désirs ou vos projections.','Your inner listening may become more sensitive. The task is to recognize what you actually perceive without confusing it with desires or projections.'],
      outcome:['La suite invite à vous appuyer sur une écoute intérieure attentive et discernante. Vos ressentis peuvent orienter votre réflexion, en restant ouverts à ce que l’expérience vient confirmer ou corriger.','The direction ahead invites attentive and discerning inner listening. Feelings can guide reflection while remaining open to what experience confirms or corrects.']
    },
    awakening:{
      origin:['Une sensibilité accrue ou une prise de conscience a ouvert votre exploration intérieure. Vous commencez à percevoir votre expérience avec davantage de finesse.','Heightened sensitivity or awareness has opened an inner exploration. You are beginning to perceive your experience more closely.'],
      obstacle:['Une sensibilité nouvelle peut être difficile à accueillir ou à comprendre. Prendre le temps de l’intégrer vous aiderait à ne pas exiger immédiatement une explication à chaque ressenti.','New sensitivity can be difficult to receive or understand. Giving it time to settle can help you avoid demanding an immediate explanation for every feeling.'],
      resource:['Une conscience plus fine de ce que vous vivez soutient votre cheminement. Cette ouverture vous aide à explorer votre monde intérieur et à reconnaître ce qui change dans votre perception.','A finer awareness of your experience supports your path. This opening helps you explore your inner world and recognize changes in perception.'],
      evolution:['Une conscience plus fine de vos réactions et de vos ressentis peut se développer. Cette ouverture se construit en intégrant progressivement ce que votre exploration intérieure vous apprend.','A finer awareness of reactions and feelings may develop. This opening grows through gradual integration of what inner exploration teaches you.'],
      outcome:['L’ensemble dessine une ouverture de conscience et une sensibilité plus fine. Votre exploration intérieure peut vous aider à mieux percevoir ce que vous vivez et à l’intégrer à vos choix quotidiens.','The overall picture suggests greater awareness and sensitivity. Inner exploration may help you perceive your experience more clearly and integrate it into everyday choices.']
    }
  };
  return readings[key]?.[role]?.[enMode?1:0]||'';
}

function distinctiveFr(card,role,sc){
  const m=motif(card,false);
  const project=sc==='work';
  const stages={
    secret:{
      origin:'Le point de départ est marqué par ce qui demeure caché ou retenu. Des sentiments, des intentions ou une part de la situation peuvent exister sans être exprimés ouvertement, ce qui rend l’histoire difficile à lire dès son origine.',
      obstacle:'Le non-dit devient ici un obstacle : ce qui est caché ou protégé empêche de savoir sur quoi le lien peut réellement s’appuyer.',
      resource:'Ce qui n’a pas encore été dit peut devenir une ressource si cela trouve enfin une forme d’expression sincère, sans forcer ce qui doit rester intime.',
      evolution:'Une part encore secrète de la situation continue d’influencer son évolution ; le mouvement dépend de ce qui pourra réellement sortir du non-dit.',
      outcome:'La synthèse conserve une part cachée : tout n’est pas disponible ou exprimé, et l’histoire reste donc partiellement ouverte tant que ces éléments ne deviennent pas plus lisibles.'
    },
    soulmate:{
      origin:'Le lien s’est construit avec un fort sentiment de familiarité, de compréhension ou d’évidence. Cette impression donne beaucoup de poids à l’histoire, sans suffire à elle seule à définir ce que les deux personnes peuvent réellement construire.',
      obstacle:'Le principal obstacle vient précisément de l’impression d’évidence ou de connexion exceptionnelle. Ressentir une grande proximité peut nourrir beaucoup d’attentes ; pourtant, la profondeur ressentie ne garantit ni la réciprocité, ni la disponibilité, ni la possibilité concrète de former un couple.',
      resource:'Le sentiment d’une compréhension profonde peut soutenir le lien lorsqu’il aide chacun à se montrer avec sincérité, sans transformer cette résonance en certitude sur l’avenir.',
      evolution:'La sensation d’une connexion particulièrement forte prend davantage de place. Elle peut rapprocher, mais sa valeur se mesure à la manière dont elle est vécue et partagée dans les faits.',
      outcome:'Le tirage se termine sur l’importance d’une connexion ressentie comme exceptionnelle. Cette intensité donne du sens au lien, mais elle ne décide pas à elle seule de sa forme ni de sa durée.'
    },
    transformation:{
      origin:'Une mutation profonde est déjà engagée : une ancienne manière d’aimer ou de vivre la situation commence à perdre sa place.',
      obstacle:'Le changement devient difficile lorsqu’une ancienne dynamique continue d’être retenue alors qu’elle ne correspond plus à ce qui est en train d’émerger.',
      resource:'La force du tirage réside dans une transformation profonde. Elle permet de quitter d’anciens schémas et d’aborder les sentiments autrement, avec une manière nouvelle de se positionner et de comprendre le lien.',
      evolution:'La relation ou la vie affective change de forme en profondeur. Ce qui existait auparavant ne peut pas simplement être reconduit à l’identique.',
      outcome:'La synthèse annonce une transformation plutôt qu’un retour exact à l’ancien fonctionnement : la suite demande une autre manière de vivre les sentiments et le lien.'
    },
    lightning:{
      origin:'L’histoire prend naissance dans une attirance immédiate et très vive, avec l’impression que quelque chose s’impose rapidement.',
      obstacle:'L’intensité d’un élan immédiat peut devenir déstabilisante si elle est prise pour une certitude avant que le lien ait eu le temps de se construire.',
      resource:'Une attraction puissante redonne de l’élan et peut réveiller la vie affective, à condition de ne pas confondre intensité et stabilité.',
      evolution:'L’évolution s’accélère brusquement : une rencontre ou un rapprochement peut provoquer une émotion très forte et donner le sentiment que tout se remet en mouvement. Cet élan est réel dans le récit, mais il doit encore montrer ce qu’il peut devenir avec le temps.',
      outcome:'La synthèse est celle d’un élan amoureux soudain et puissant. Quelque chose peut se déclencher rapidement, mais la force du départ ne permet pas encore de savoir quelle forme durable cette histoire prendra.'
    },
    silence:{
      origin:'Le point de départ est marqué par une absence de réponse ou une communication interrompue. Le lien existe dans un espace où ce qui n’est pas dit pèse autant que ce qui est exprimé.',
      obstacle:'Le silence devient le frein principal : l’absence de réponse ou le retrait empêche de savoir clairement ce qui est ressenti et laisse la relation sans direction partagée.',
      resource:'Le silence peut offrir un temps de recul lorsqu’il n’est pas utilisé pour fuir la relation ; il permet alors de laisser retomber la pression avant une éventuelle reprise des échanges.',
      evolution:'La dynamique entre dans une phase de retrait ou de communication suspendue. Après ce qui a précédé, le mouvement ralentit et laisse davantage de place à l’attente qu’à l’action.',
      outcome:'La dernière étape est marquée par le silence : après les mouvements précédents, une absence de réponse, un retrait ou une communication interrompue laisse la situation en suspens. Ce silence peut correspondre à une hésitation, à une protection ou à une prise de distance, mais le tirage ne permet pas de choisir arbitrairement entre ces possibilités. Il ne constitue donc ni une clarification ni une conclusion définitive : il laisse l’histoire ouverte, avec une incertitude réelle sur ce qui sera exprimé ensuite.'
    },
    friendship:{
      origin:'Un lien amical, fait d’écoute et de confiance, constitue le point de départ. Cette proximité offre une place dans la vie de l’autre, sans que sa nature soit nécessairement amoureuse.',
      obstacle:'Le décalage peut tenir à la place donnée au lien : une proximité amicale peut être vécue comme une promesse sentimentale alors que les attentes ne sont pas encore partagées. Nommer cette différence aiderait à vous situer.',
      resource:'La confiance amicale et l’écoute constituent un appui réel. Elles permettent de parler plus librement de vos attentes sans faire dépendre la valeur du lien d’une évolution amoureuse.',
      evolution:'Le lien prend une forme plus amicale, centrée sur la confiance, les échanges et le soutien mutuel. Des sentiments pourraient évoluer, mais cette proximité ne permet pas à elle seule de conclure à la formation d’un couple.',
      outcome:'La conclusion du tirage met l’amitié au premier plan : un lien de confiance, d’écoute et de soutien paraît être la forme de proximité à privilégier. Pour votre avenir amoureux, cela peut représenter une base affective importante, mais pas encore une promesse de couple. Une évolution sentimentale reste possible si elle devient désirée et exprimée de part et d’autre ; elle ne découle pas automatiquement de la complicité. La direction actuelle consiste donc à reconnaître la valeur du lien amical tout en clarifiant la place que chacun souhaite lui donner.'
    },
    union:{
      origin:'Le désir de faire route ensemble a donné une forme plus concrète à vos attentes. Vous cherchez une place reconnue dans le lien, au-delà des seuls échanges ou de l’attirance.',
      obstacle:'Le passage à un couple ou à un engagement assumé constitue ici le point difficile. Les sentiments ne suffisent pas si vos envies de vous unir, votre disponibilité ou le rythme souhaité restent différents.',
      resource:'Un engagement partagé peut donner un cadre à vos sentiments. La possibilité de décider ensemble et de reconnaître votre place respective offre une base pour construire.',
      evolution:'Le lien peut prendre une forme plus assumée, avec un choix concret de faire route ensemble. Cette étape demande que l’engagement soit voulu et porté par les deux personnes.',
      outcome:'La direction du tirage est celle d’une union plus concrète : donner au lien une place visible et choisir de construire ensemble. Cette perspective devient solide lorsque les intentions sont partagées et se traduisent par un engagement réciproque.'
    },
    patterns:{
      origin:'Un ancien schéma relationnel a marqué votre façon d’entrer dans cette histoire. Ce qui se répète mérite d’être reconnu pour distinguer le désir présent des habitudes du passé.',
      obstacle:'La répétition d’une ancienne dynamique peut vous ramener aux mêmes attentes et aux mêmes déceptions. Le frein se situe dans ce mécanisme, qui risque de guider vos réactions malgré l’envie de changer.',
      resource:'Comprendre ce qui se répète vous rend une liberté de choix. Vous pouvez utiliser cette expérience pour reconnaître plus tôt les limites et répondre autrement.',
      evolution:'L’étape qui se dessine remet un ancien schéma relationnel en lumière. Une nouvelle tentative risque de reproduire le passé si les attentes, les limites et les façons de réagir restent identiques ; reconnaître ce mécanisme ouvre la possibilité de changer réellement la suite.',
      outcome:'Le fil central est de sortir d’un schéma qui se répète. La suite dépend moins du retour d’une situation familière que de votre capacité à choisir une réponse nouvelle et à ne plus accepter les mêmes déséquilibres.'
    },
    freedom:{
      origin:'Votre vie affective part d’un besoin d’espace et d’autonomie. Vous cherchez un lien dans lequel vous pouvez rester vous-même, sans perdre votre liberté pour conserver une proximité.',
      obstacle:'Des attentes trop contraignantes peuvent rendre le rapprochement difficile. Trouver une place pour chacun demande de respecter les besoins d’indépendance sans laisser l’autre dans une attente indéfinie.',
      resource:'Votre autonomie vous aide à choisir le lien plutôt qu’à le subir. Cet espace personnel permet de vous rapprocher sans faire dépendre tout votre équilibre de la relation.',
      evolution:'Le lien évolue en laissant davantage de place à l’espace personnel. Cette respiration peut soutenir une proximité plus libre si les besoins de chacun sont compris.',
      outcome:'La suite gagne à préserver votre liberté et celle de l’autre. Un lien durable demande une proximité choisie, où chacun peut conserver ses repères sans transformer l’attachement en contrainte.'
    },
    tenderness:{
      origin:'Une proximité douce, faite d’attentions et de gestes rassurants, a donné au lien une valeur particulière. Cette expérience explique le besoin de vous sentir accueilli sans avoir à forcer votre place.',
      obstacle:'La douceur peut manquer si les attentes deviennent pressantes ou si les besoins restent tus. Prendre soin du lien demande aussi de pouvoir dire ce qui vous touche sans craindre une réaction dure.',
      resource:'La bienveillance et les petites attentions offrent un appui pour traverser les incertitudes. Une présence attentive peut rendre le dialogue plus sûr, sans exiger une réponse immédiate.',
      evolution:'Le lien peut évoluer par des gestes plus doux et une attention plus personnelle. Cette proximité se construit dans la manière de vous accueillir mutuellement, au-delà de l’intensité du désir.',
      outcome:'Ce qui mérite de durer, c’est la douceur entre vous : les attentions sincères, les gestes rassurants et la possibilité de vous rapprocher sans pression. Le désir et l’intensité peuvent ouvrir une étape, mais la qualité de cette étape se mesure surtout à la façon dont vous prenez soin l’un de l’autre. La suite la plus nourrissante serait une proximité où chacun se sent accueilli, libre de dire ce qu’il ressent et respecté dans son rythme.'
    },
    intimacy:{
      origin:'Une proximité intime, émotionnelle ou physique, donne à votre histoire une profondeur particulière. Ce qui vous a rapprochés tient à la confiance et à la possibilité de vous montrer plus vulnérables, au-delà de la séduction.',
      obstacle:'La proximité peut devenir difficile si la vulnérabilité expose à une attente trop forte. Vous ouvrir demande un espace sûr, où ce qui est confié reste respecté.',
      resource:'La confiance déjà partagée peut aider à aborder ce qui reste délicat. Elle offre un espace pour parler plus personnellement et reconnaître les besoins de chacun.',
      evolution:'Le rapprochement peut gagner en profondeur lorsque chacun accepte de se montrer plus authentiquement. La confiance devient alors aussi importante que l’attirance.',
      outcome:'La direction profonde du tirage est celle d’une intimité plus confiante. Ce qui peut durer repose sur la sécurité émotionnelle, le respect de votre espace privé et la possibilité de vous montrer tels que vous êtes.'
    },
    mirror:{
      origin:'Une attraction intense et un sentiment de vous reconnaître dans l’autre ont donné de la force à cette histoire. Cette résonance a aussi pu rendre vos fragilités plus sensibles.',
      obstacle:'L’intensité du lien peut amplifier les attentes et les réactions. Le sentiment de vous reconnaître l’un dans l’autre ne règle pas à lui seul les désaccords ou les différences de disponibilité.',
      resource:'Ce que l’autre réveille en vous peut aider à comprendre vos propres besoins. Cette lucidité devient une force lorsqu’elle permet de répondre autrement aux anciennes blessures.',
      evolution:'Une forte résonance entre vous peut remettre les sentiments au premier plan. Ce rapprochement agit aussi comme un miroir : il rend visibles vos besoins et vos fragilités, et demande de la maturité pour trouver un équilibre.',
      outcome:'La suite se joue dans votre capacité à donner un cadre plus mûr à une attraction intense. Le lien peut être marquant, mais ce sont vos choix réciproques et votre manière de traverser les difficultés qui lui donneront une stabilité.'
    },
    romantic:{
      origin:'Votre question prend racine dans un attachement amoureux : le désir de proximité affective donne à cette histoire une portée qui dépasse un simple échange amical.',
      obstacle:'La dimension amoureuse du lien soulève des attentes qui peuvent être difficiles à accorder. Le désir de proximité mérite d’être exprimé pour comprendre ce que chacun souhaite réellement vivre.',
      resource:'La dimension amoureuse constitue ici une force : la tendresse et le désir de proximité peuvent soutenir un dialogue plus personnel. Cet appui gagne en solidité lorsque chacun peut dire la place qu’il souhaite donner au lien.',
      evolution:'L’évolution se situe dans le registre amoureux : l’attachement, les sentiments et le désir de proximité affective prennent davantage de place. Cette orientation ouvre une possibilité de rapprochement sentimental, dont la réciprocité et la forme concrète restent à éclaircir entre vous.',
      outcome:'L’ensemble du tirage met en avant la nature amoureuse du lien. Il ouvre une perspective affective, sans fixer à lui seul la durée de la relation ni confirmer les intentions de chacun.'
    },
    alignment:{
      origin:'Vous avez cherché à faire correspondre vos choix à ce que vous ressentez vraiment. Ce besoin de cohérence explique pourquoi une réponse incertaine ou des gestes contradictoires ne peuvent plus vous satisfaire.',
      obstacle:'Un décalage entre vos attentes et les actes posés fragilise votre direction. Chercher l’accord à tout prix risquerait de vous éloigner de ce qui compte pour vous.',
      resource:'Vous pouvez vous appuyer sur une vision plus claire de vos besoins. Elle vous aide à reconnaître les propositions qui vous conviennent et à poser vos limites avec davantage de calme.',
      evolution:'Vos décisions se rapprochent de vos besoins réels. Cette cohérence change votre manière de répondre : vous cherchez moins à maintenir une apparence d’accord qu’à vivre quelque chose de juste.',
      outcome:'La suite gagne en cohérence lorsque vos choix traduisent vos besoins réels. Une direction devient plus solide si vous pouvez la vivre sans vous renier.'
    },
    separation:{
      origin:'Une coupure a changé les repères sur lesquels vous comptiez. Elle laisse une histoire à comprendre, mais elle a aussi rendu impossible de continuer exactement comme auparavant.',
      obstacle:'La séparation ou la fin d’un ancien fonctionnement reste le point difficile à traverser. Le désir de retrouver ce qui existait ne suffit pas encore à résoudre ce qui vous a éloignés.',
      resource:'Reconnaître la coupure vous rend une marge de choix. Vous pouvez distinguer ce qui mérite encore une tentative de ce qui vous retient dans une attente douloureuse.',
      evolution:'Aujourd’hui, une coupure ou la fin d’un ancien fonctionnement occupe le premier plan. Même si l’attachement demeure, un rapprochement demanderait de traiter ce qui vous a éloignés et de construire un échange différent.',
      outcome:'Une fin ou une séparation marque la direction actuelle. Elle invite à protéger votre équilibre et à laisser une éventuelle reprise dépendre de changements réels.'
    },
    happiness:{
      origin:'Des moments heureux ont donné à cette histoire une valeur particulière. Leur souvenir nourrit votre désir de retrouver une vie où vous vous sentez pleinement à votre place.',
      obstacle:'L’envie de retrouver le bonheur peut rendre difficile de voir ce qui manque aujourd’hui. Préserver une image heureuse ne devrait pas vous faire accepter une réalité qui vous blesse.',
      resource:'Ce qui vous apporte une joie réelle devient un repère précieux. Vous pouvez vous appuyer sur ces expériences pour choisir ce qui nourrit votre vie plutôt que la seule attente d’un résultat.',
      evolution:'Une place plus grande se libère pour la joie et la satisfaction. Cette amélioration prend corps dans des expériences où vous vous sentez accueilli et libre d’être vous-même.',
      outcome:'La direction qui s’ouvre est plus lumineuse et laisse une place à l’épanouissement. Ce mieux-être peut venir d’un lien renouvelé, mais aussi d’une manière de retrouver votre équilibre sans rester suspendu à une seule issue.'
    },
    destiny:{
      origin:'Une rencontre ou un tournant marquant a laissé une empreinte qui donne encore du poids à votre question.',
      obstacle:'Le sentiment que tout serait déjà écrit risque de faire attendre un signe au lieu de choisir votre réponse.',
      resource:'Ce qui a profondément compté pour vous aide à reconnaître la direction que vous souhaitez réellement prendre.',
      evolution:'Un tournant donne une portée nouvelle à vos choix ; vous gardez la possibilité de répondre autrement.',
      outcome:'La suite pourrait prendre une importance particulière dans votre parcours, sans vous retirer la liberté de choisir.'
    },
    retry:{
      origin:'Une première tentative n’a pas clos l’histoire ; le désir de reprendre autrement reste présent.',
      obstacle:'Recommencer sans modifier ce qui avait échoué ferait courir le risque de retrouver les mêmes difficultés.',
      resource:'L’expérience passée vous permet de savoir ce qui doit changer pour rendre une nouvelle tentative plus solide.',
      evolution:'Une possibilité de reprendre ce qui semblait interrompu se présente maintenant, en construisant autrement cette nouvelle étape.',
      outcome:'Une nouvelle tentative reste envisageable si elle s’accompagne de changements réels plutôt que de la seule envie de retrouver le passé.'
    },
    temptation:{
      origin:'Un désir puissant ou une possibilité séduisante a bousculé vos repères et ouvert cette question.',
      obstacle:'L’attrait immédiat peut faire oublier une limite ou une conséquence qui comptera ensuite.',
      resource:'Reconnaître votre désir vous aide à choisir consciemment la place que vous souhaitez lui donner.',
      evolution:'Une envie plus forte pousse à franchir un pas ; prendre le temps d’en mesurer les conséquences protège votre choix.',
      outcome:'L’attirance peut donner l’impulsion de la prochaine étape, mais sa force ne suffit pas à garantir ce qui pourra durer.'
    },
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
  let text=stages[m]?.[role]||'';
  if(sc!=='relation')text=text.replace('ce qui vous a éloignés','ce qui a conduit à cette interruption').replace('un rapprochement','une reprise').replace('d’un lien renouvelé','d’une nouvelle orientation').replace('l’attachement demeure','l’envie de poursuivre demeure');
  if(sc==='work')text=text.replace('Une rencontre ou un tournant marquant','Une occasion ou un tournant professionnel marquant').replace('L’attirance','L’attrait d’une proposition').replace('retrouver le passé','relancer le projet précédent').replace('un échange différent','un fonctionnement différent');
  if(sc==='life')text=text.replace('Une rencontre ou un tournant marquant','Une expérience ou un tournant marquant').replace('L’attirance','L’envie d’explorer une autre voie');
  return text;
}
function developFr(card,role){
  const actions={
    friendship:'reconnaître la nature amicale du lien et clarifier toute attente sentimentale',union:'vérifier que l’engagement est souhaité de part et d’autre',patterns:'reconnaître le schéma relationnel qui se répète pour choisir autrement',
    tenderness:'préserver la douceur et les attentions sans imposer de pression',intimacy:'préserver la confiance et la sécurité émotionnelle',mirror:'donner un cadre mûr à cette résonance intense',
    romantic:'clarifier la place des sentiments amoureux et la proximité souhaitée par chacun',
    alignment:'faire correspondre vos décisions à vos besoins réels',separation:'reconnaître ce qui s’est terminé et ce qui pourrait être reconstruit',happiness:'choisir ce qui nourrit une joie durable',
    destiny:'choisir votre réponse à ce tournant marquant',retry:'reprendre autrement ce qui avait échoué',temptation:'mesurer les conséquences du désir avant de lui donner suite',
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
    origin:`Vous pouvez ${action}.`,
    obstacle:`La difficulté demande ${de}${action}.`,
    resource:`Vous pouvez ${action}.`,
    evolution:`Vous pourrez ${action}.`,
    outcome:`Il s’agit ${de}${action}.`
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
function semanticEn(card,role,sc,i){
  const actions={
    friendship:'recognise the friendship at the heart of the bond without assuming that it promises a romantic relationship',union:'check that commitment is genuinely wanted by both people',patterns:'recognise the recurring relationship pattern and choose a different response',
    tenderness:'preserve kindness, reassuring gestures and closeness without pressure',intimacy:'build emotional safety and respect the vulnerability you share',mirror:'give an intense mutual resonance a mature and balanced framework',
    romantic:'clarify the romantic feelings and the emotional closeness each person wants',
    alignment:'bring your choices into line with what you genuinely need',separation:'acknowledge the break and establish what would need to change before rebuilding',happiness:'make room for lasting fulfilment without tying it to a single outcome',
    destiny:'choose your response to a turning point that has particular meaning for you',
    retry:'make a fresh attempt while changing what caused the earlier setback',
    temptation:'weigh a compelling desire against its consequences before acting',
    heartbreak:'recognise the hurt without letting it decide everything',burden:'share the responsibilities and reduce the load',
    sensitivity:'follow a gentle opening with consistent actions',composure:'express what matters calmly',direction:'choose a clear course before accelerating',
    departure:'decide what is worth leaving behind',contentment:'check whether satisfaction also meets the deeper need',
    anxiety:'separate the feared scenarios from established facts',pause:'use the pause to reconsider the next step',
    tangible:'turn the available opportunity into something workable',disenchantment:'reassess what is still available before dismissing it',
    illusion:'choose an option that can actually be tested',loss:'acknowledge the loss while making use of what remains',
    conflict:'address the disagreement directly',ambiguity:'clarify what remains unspoken',cooperation:'agree on how each person can contribute',
    insight:'make the decision with clearer information',freedom:'leave room for independence',movement:'give the momentum a sustainable direction',
    change:'put the new approach into practice',ground:'build on what is dependable'
  };
  const action=actions[motif(card,false)||theme(card,false)];
  if(!action)return en(card,role,sc,i);
  const place=sc==='work'?'the project':sc==='relation'?'the connection':'your next step';
  return {
    origin:`What set ${place} in motion explains why you now need to ${action}.`,
    obstacle:`Progress could falter if you do not ${action} before carrying on.`,
    resource:`You have a useful opening here: you can ${action} and make it a point of support.`,
    evolution:`A shift becomes possible as you begin to ${action} in practice.`,
    outcome:`The direction ahead depends on your willingness to ${action}, with attention to what the earlier steps have revealed.`
  }[role];
}
function tarotMixedPart(card,role,sc,i,enMode){
  // Use meaning only to identify a motif. Never emit catalogue sentences.
  return enMode?semanticEn(card,role,sc,i):
    distinctiveFr(card,role,sc)||preciseFr(card,role)||fr(card,role,sc,i);
}
function reversedPart(card,role,sc,i,enMode){
  const raw=window.CR_TAROT_REVERSED?.[card.id]?.fr||'';
  const symbolic={id:card.id,name:'',keywords:raw,definition:'',en:{name:'',keywords:raw}};
  let part=tarotMixedPart(symbolic,role,sc,i,enMode);
  // A reversal is a different dynamic, not a mechanical opposite.
  if(Number(card.id)===6)part=enMode
    ?'You can reassess the advice you have followed in light of what you actually need.'
    :'Vous pouvez réexaminer les conseils suivis jusqu’ici à la lumière de ce dont vous avez réellement besoin.';
  const adjustment=enMode?'This calls for an adjustment.':'Un réajustement est nécessaire.';
  return part+' '+adjustment;
}
function sourceSentences(cards,enMode){
  const values=[];
  for(const card of cards){
    for(const local of [card,card.en||{}])
      for(const field of ['definition','meaning','reading_relationnel','reading_professionnel','reading_spirituel'])
        values.push(local[field]||'');
    values.push(window.CR_TAROT_REVERSED?.[card.id]?.[enMode?'en':'fr']||'');
  }
  return values.flatMap(v=>String(v).match(/[^.!?;]+[.!?;]?/g)||[]).map(v=>norm(v).replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim()).filter(v=>v.split(' ').length>=7);
}
function withoutCatalogue(text,sources){
  return (String(text).match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[]).filter(sentence=>{
    const clean=norm(sentence).replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
    return !sources.some(source=>clean.includes(source)||source.includes(clean));
  }).join(' ').trim();
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
  const enMode=state.lang==='en', chosen=cards.slice(), r=roles(chosen.length);
  const reversedAt=i=>state.oracle==='tarot'&&state.draw?.[i]===chosen[i]&&state.tarotReversed?.[i]===true;
  const sc=scope();
  const q=String(state.question||'').trim();
  const parts=chosen.map((card,i)=>{
    const faithful=!reversedAt(i)?faithfulSymbol(card,r[i],enMode):'';
    let part='';
    if(faithful){
      part=faithful;
    }else if(reversedAt(i)){
      part=reversedPart(card,r[i],sc,i,enMode);
    }else if(state.oracle==='tarot'){
      part=groundedText(tarotMixedPart(card,r[i],sc,i,enMode),card,enMode);
    }else if(enMode){
      /* The card definition stays in the card commentary. The story must
         interpret the card's role in the spread instead of paraphrasing it. */
      part=semanticEn(card,r[i],sc,i);
    }else{
      /* Prefer a distinctive symbolic motif, then a role-specific reading,
         then the broad thematic fallback. Never reuse the displayed
         definition here: that would merely duplicate the card commentary. */
      part=distinctiveFr(card,r[i],sc)||preciseFr(card,r[i])||fr(card,r[i],sc,i);
    }
    const sources=sourceSentences(chosen,enMode);
    part=withoutCatalogue(part,sources);
    if(!part)part=enMode?semanticEn(card,r[i],sc,i):fr(card,r[i],sc,i);
    return roleGrounded(withoutCatalogue(part,sources),r[i],enMode);
  }).filter(Boolean);
  const seen=new Set();
  const narrative=parts.join(' ').match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[];
  let body=narrative.filter(s=>{const key=norm(s).replace(/^(cependant|enfin|un element determinant apparait neanmoins|la situation evolue ensuite)\s*[:,]?\s*/,'').trim();if(seen.has(key))return false;seen.add(key);return true;}).join(' ').replace(/\s+/g,' ').trim();
  if(sc==='relation'&&/retour|revenir|revienne|return|come back/.test(norm(q))&&chosen.some(c=>motif(c,false)==='separation')){
    body+=' '+(enMode?'For the return you are asking about, the break remains a real issue: renewed contact would need mutual willingness and a different way of relating. A favourable direction does not by itself confirm that this person will come back.':'Concernant le retour que vous évoquez, la coupure reste donc un élément central : une reprise demanderait une volonté partagée et une autre manière de vivre le lien. Une direction favorable ne suffit pas, à elle seule, à confirmer le retour de cette personne.');
  }
  const question=q?`<p class="reading-question">${enMode?'Your question':'Votre question'} : « ${esc(q)} »</p>`:'';
  return `<div class="story-reading" data-story-engine="universal-fluid-${VERSION}"><h3>${enMode?'The story told by your cards':'L’histoire racontée par vos cartes'}</h3>${question}<p class="story-continuous">${esc(body)}</p></div>`;
}

storyInterpretation=build;
interpretation=build;
window.CR_UNIVERSAL_FLUID_STORY=build;
window.CR_UNIVERSAL_FLUID_STORY_VERSION=VERSION;
// The final consultation uses concise implications, rather than copying the
// catalogue or reproducing the developed story paragraph.
window.CR_UNIVERSAL_ROLE_SUMMARY=function(card,role,enMode){
  role=role==='movement'?'evolution':role;
  const i=state.draw.indexOf(card),reversed=state.oracle==='tarot'&&state.tarotReversed?.[i]===true;
  const semantic=reversed?{id:card.id,name:'',keywords:window.CR_TAROT_REVERSED?.[card.id]?.fr||''}:card;
  let text=faithfulSymbol(semantic,role,enMode)||(enMode?semanticEn(semantic,role,scope(),i):developFr(semantic,role));
  if(!text)text=enMode?en(semantic,role,scope(),i):fr(semantic,role,scope(),i);
  return withoutCatalogue(text,sourceSentences(state.draw,enMode));
};

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

