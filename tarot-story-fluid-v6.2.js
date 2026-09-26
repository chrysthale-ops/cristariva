/* CRISTARIVA — Tarot : récit fluide sans noms de cartes — v6.2
   Transforme les significations en narration continue au lieu d'afficher
   une succession de fiches ou de mots-clés. Les noms restent visibles
   sur les cartes tirées et dans leurs fiches, mais pas dans le récit. */
(function(){
  'use strict';

  const VERSION='6.2';
  const previousStory=typeof storyInterpretation==='function'?storyInterpretation:null;

  function esc(value){
    try{return typeof readingEscape==='function'?readingEscape(String(value??'')):String(value??'').replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
    catch(e){return String(value??'');}
  }
  function norm(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();}
  function cardText(card){return norm([card?.category,card?.keywords,card?.definition,card?.meaning,card?.reading_professionnel,card?.reading_relationnel,card?.reading_spirituel].filter(Boolean).join(' '));}
  function tone(card){
    const h=cardText(card);
    if(/precar|exclusion|diffic|manque|echec|bloc|retard|refus|rejet|rupture|conflit|peur|perte|impasse|isolement|epuis|contrainte|crise/.test(h))return 'negative';
    if(/reuss|succes|reconnaissance|cooper|harmon|stabil|opportun|abond|progres|construction|maitrise|espoir|soutien|protection|union|reciproc|joie|bonheur/.test(h))return 'positive';
    return 'nuanced';
  }
  function has(card,re){return re.test(cardText(card));}
  function scope(){
    const d=norm(state?.domain||'');
    if(/profession|projet|travail|carri|emploi/.test(d))return 'work';
    if(/sentiment|relation/.test(d))return 'relation';
    return 'spirit';
  }

  function workStage(card,role){
    const t=tone(card);
    const stable=has(card,/stabil|patrimoine|duree|heritage|secur|structure|continu|ancrage/);
    const coop=has(card,/cooper|equipe|savoir-faire|qualite|reconnaissance|collabor|equite/);
    const lack=has(card,/precar|exclusion|diffic|manque|fragil|soutien|aide/);
    const skill=has(card,/travail|apprentissage|precision|repetition|maitrise|competence|serieux|methode/);
    const opportunity=has(card,/opportun|commencement|lancement|initiative|creation|nouveau|debut/);
    const choice=has(card,/choix|decision|direction|orientation|priorite|equilibre|organisation/);

    if(role==='origin'){
      if(stable)return 'Au départ, le projet s’appuie sur une recherche de stabilité et de continuité. Les bases déjà réunies peuvent devenir durables si elles sont consolidées avec méthode plutôt que considérées comme définitivement acquises.';
      if(coop)return 'Au départ, la qualité du travail partagé et la complémentarité des compétences constituent le socle le plus solide. Le projet avance mieux lorsqu’il repose sur une organisation claire et sur des contributions reconnues.';
      if(lack)return 'Le projet part d’une période plus fragile, marquée par des moyens limités ou par le sentiment de devoir avancer avec peu de marge. Cette contrainte explique une partie des hésitations actuelles, sans condamner pour autant la suite.';
      if(opportunity)return 'Le point de départ contient une possibilité concrète à développer. L’enjeu n’est pas de multiplier les pistes, mais de transformer l’ouverture disponible en première étape réellement réalisable.';
      if(skill)return 'Le projet s’est construit par le travail, l’apprentissage et la régularité. Sa force vient moins d’un effet spectaculaire que de ce qui a déjà été patiemment acquis et perfectionné.';
      return 'Au départ, le projet possède une base identifiable, mais celle-ci demande encore à être organisée pour devenir pleinement exploitable. Ce qui existe déjà sert surtout de point d’appui à la prochaine étape.';
    }
    if(role==='obstacle'){
      if(lack)return 'La difficulté principale concerne les ressources disponibles ou le sentiment de ne pas disposer d’assez de soutien. Il devient important de distinguer un manque réellement bloquant d’une fragilité temporaire qui peut être compensée.';
      if(choice)return 'Le principal frein tient à la dispersion des priorités. Tant que plusieurs directions restent en concurrence, une part de l’énergie du projet se perd au lieu de soutenir une progression nette.';
      if(stable)return 'Le point de vigilance vient d’un besoin de sécurité devenu trop rigide. Protéger les acquis reste utile, mais pas au prix d’une immobilité qui empêcherait le projet de s’adapter.';
      if(t==='negative')return 'Une difficulté concrète ralentit l’avancée et demande d’être traitée avant de chercher à accélérer. La progression dépend ici davantage de la résolution de ce point précis que d’un effort supplémentaire.';
      return 'L’obstacle est moins une impossibilité qu’une exigence de cohérence. Le projet a besoin d’un cadre plus net pour que les efforts engagés produisent des résultats lisibles.';
    }
    if(role==='resource'){
      if(coop)return 'Le meilleur levier réside dans la coopération, la qualité du travail et la mise en commun des compétences. Une aide bien choisie ou un partage plus clair des responsabilités peut faire gagner en solidité.';
      if(skill)return 'La ressource la plus fiable est le savoir-faire déjà acquis. La régularité, la précision et l’amélioration progressive offrent davantage de prise qu’une accélération improvisée.';
      if(stable)return 'Le projet peut s’appuyer sur ce qui est déjà stable : expérience, ressources, cadre ou acquis. En sécurisant ce socle, il devient plus facile d’ouvrir une nouvelle étape sans repartir de zéro.';
      if(opportunity)return 'Une ouverture concrète peut servir de relance. Elle devient réellement utile si elle est rapidement traduite en action, en rendez-vous, en décision ou en résultat mesurable.';
      return 'Une marge de manœuvre existe et peut être mobilisée de façon concrète. Le projet gagne à utiliser ce qui est déjà disponible avant de chercher de nouvelles ressources ailleurs.';
    }
    if(role==='evolution'){
      if(coop)return 'Aujourd’hui, la dynamique devient plus favorable grâce à la coopération, à la reconnaissance du travail accompli ou à une meilleure répartition des rôles. Cette évolution peut rendre le projet plus visible et plus crédible.';
      if(stable)return 'À ce stade, le projet cherche surtout à consolider ses acquis. L’évolution est moins spectaculaire que structurante : elle vise à rendre les résultats plus réguliers et la base plus durable.';
      if(opportunity)return 'Un nouvel élan se dessine et ouvre une possibilité plus concrète. La progression dépendra de la rapidité avec laquelle cette ouverture sera transformée en étape réelle plutôt qu’en simple intention.';
      if(choice)return 'La situation demande maintenant de hiérarchiser les priorités. Une direction plus nette peut alléger la dispersion et rendre l’avancée beaucoup plus lisible.';
      if(t==='negative')return 'L’évolution traverse une phase plus exigeante. Un ralentissement ou une contrainte oblige à ajuster la méthode avant de pouvoir retrouver un rythme plus fluide.';
      return 'Le projet entre dans une phase d’ajustement où la direction devient progressivement plus lisible. Les prochains résultats dépendront surtout de la cohérence entre les objectifs annoncés et les actions réellement engagées.';
    }
    if(role==='outcome'){
      if(lack)return 'La suite demande davantage de vigilance sur les moyens disponibles. Une période de fragilité, de manque ou de difficulté matérielle peut ralentir le mouvement ; elle n’efface pas ce qui a été construit, mais invite à sécuriser les ressources et à rechercher les soutiens utiles.';
      if(stable)return 'La tendance finale va vers une consolidation. Le projet peut gagner en stabilité et en durée si les acquis sont protégés sans empêcher les adaptations encore nécessaires.';
      if(coop)return 'La suite devient plus constructive lorsque le travail est partagé, reconnu et organisé autour de compétences complémentaires. La réussite paraît alors liée à la qualité de la coopération autant qu’à l’idée elle-même.';
      if(opportunity)return 'Une possibilité concrète reste ouverte pour la suite. Elle peut devenir un véritable nouveau départ si elle est accompagnée d’une décision claire et d’une mise en œuvre suffisamment structurée.';
      if(t==='negative')return 'La conclusion reste prudente : une difficulté doit encore être traversée avant de parler d’aboutissement. Le projet n’est pas nécessairement fermé, mais il demande une correction concrète plutôt qu’une simple poursuite à l’identique.';
      return 'La suite reste ouverte, avec une progression possible à condition de conserver un cap clair. L’issue dépend moins d’un événement unique que de la manière dont les prochaines décisions renforceront ou fragiliseront ce qui existe déjà.';
    }
    return '';
  }

  function relationStage(card,role){
    const t=tone(card);
    const closeness=has(card,/union|reciproc|amour|attir|connexion|harmon|joie|bonheur|partage/);
    const distance=has(card,/eloign|distance|rejet|refus|rupture|indiffer|isolement|separation/);
    const clarity=has(card,/communication|sincer|verite|decision|choix|clarte|equilibre/);
    if(role==='origin')return closeness?'Au départ, le lien repose sur une proximité réelle ou sur une capacité de rapprochement qui donne du poids à la relation. Cette base explique pourquoi la situation continue d’occuper une place importante.':distance?'Le point de départ est marqué par une distance, une réserve ou une fragilité qui a limité la spontanéité du lien. La suite dépend donc de ce qui peut réellement changer dans cette dynamique.':'Au départ, la relation s’inscrit dans une dynamique encore nuancée, où l’attachement et les réserves coexistent. Ce mélange explique une partie de l’incertitude actuelle.';
    if(role==='obstacle')return distance?'Le principal frein vient d’une distance ou d’une fermeture qui doit être regardée telle qu’elle se manifeste dans les faits. La relation ne peut évoluer durablement sans modification concrète de ce point.':clarity?'La difficulté tient surtout au manque de clarté sur les intentions, les attentes ou la place de chacun. Une parole plus nette devient nécessaire pour sortir de l’interprétation.':'Le point de tension se situe dans la manière dont le lien fonctionne aujourd’hui. Il demande moins de supposer les sentiments que d’observer la réciprocité, les initiatives et la disponibilité réelle.';
    if(role==='resource')return closeness?'La ressource du lien se trouve dans ce qui rapproche réellement : qualité des échanges, confiance, désir partagé ou gestes réciproques. C’est cette dimension concrète qui peut remettre la relation en mouvement.':clarity?'La meilleure ressource est une clarification simple et directe. Une parole honnête peut réduire l’ambiguïté et permettre à chacun de se positionner plus librement.':'Une possibilité d’évolution existe si chacun retrouve une marge de choix et si les attentes deviennent plus réalistes. Le lien gagne alors en souplesse et en lisibilité.';
    if(role==='evolution')return closeness?'Le climat devient progressivement plus ouvert et plus chaleureux. Un rapprochement peut prendre forme s’il se confirme par des initiatives mutuelles plutôt que par de simples signes isolés.':distance?'L’évolution reste irrégulière et peut comporter encore du retrait ou de la distance. Il faut donc regarder la continuité des actes avant de conclure à un véritable changement.':'La dynamique se transforme, mais elle n’a pas encore trouvé sa forme définitive. Les prochains échanges permettront surtout de voir si cette évolution devient réellement partagée.';
    if(role==='outcome')return distance?'La suite reste prudente : une limite ou une distance demeure importante et doit être respectée. Toute reprise supposerait un changement observable dans la disponibilité et dans la manière de construire le lien.':closeness?'La tendance finale est plus ouverte au rapprochement, à condition que l’élan soit réciproque et suffisamment régulier pour devenir une réalité relationnelle.':'La suite n’est pas complètement fixée. Elle dépendra surtout de la clarté des intentions et de la capacité des deux personnes à transformer le lien en actes cohérents.';
    return t==='positive'?'Une ouverture se dessine.':'La situation demande encore du discernement.';
  }

  function spiritStage(card,role){
    const t=tone(card);
    if(role==='origin')return t==='negative'?'Au départ, une difficulté ou une remise en question a obligé à regarder la situation autrement. Cette phase a surtout servi à faire apparaître ce qui ne pouvait plus continuer de la même manière.':'Au départ, une base intérieure relativement solide permet d’aborder la situation avec davantage de recul. Ce qui a déjà été compris ou acquis sert maintenant de point d’appui.';
    if(role==='obstacle')return t==='negative'?'Le principal défi consiste à ne pas laisser une peur, une perte ou une difficulté définir toute la suite. Ce point demande d’être reconnu clairement avant de pouvoir être dépassé.':'Le défi vient d’un équilibre encore à trouver entre intuition, désir et réalité. Une compréhension juste demande de ne pas aller plus vite que ce que les faits permettent.';
    if(role==='resource')return t==='positive'?'Une ressource importante est déjà disponible : confiance, discernement, créativité ou capacité de transformation. En l’utilisant concrètement, la situation peut retrouver du mouvement.':'La ressource consiste surtout à observer avec lucidité ce qui se répète et à modifier la réponse donnée à cette dynamique.';
    if(role==='evolution')return t==='negative'?'L’évolution passe par une phase de réajustement qui peut sembler plus lente ou plus inconfortable. Elle prépare néanmoins une compréhension plus précise de ce qui doit changer.':'Une compréhension nouvelle commence à émerger. Elle permet de regarder la situation avec plus de cohérence et d’envisager une direction différente de celle suivie jusque-là.';
    if(role==='outcome')return t==='negative'?'La synthèse invite à ne pas forcer une issue qui n’est pas encore mûre. La suite se construit d’abord par l’acceptation d’une limite et par un changement de positionnement.':'La tendance finale ouvre vers une intégration plus sereine de l’expérience. Ce qui a été traversé peut devenir un repère utile pour choisir la prochaine étape avec davantage de conscience.';
    return '';
  }

  function conclusion(cards,sc){
    const tones=cards.map(tone),last=tones[tones.length-1],neg=tones.filter(x=>x==='negative').length,pos=tones.filter(x=>x==='positive').length;
    if(sc==='work'){
      if(last==='negative')return 'Dans l’ensemble, le projet conserve des points d’appui, mais son issue dépend d’abord de la manière dont la prochaine difficulté sera gérée. Il vaut mieux consolider les moyens et les soutiens avant de chercher à accélérer.';
      if(pos>neg)return 'Dans l’ensemble, la dynamique reste constructive : le projet peut avancer si les acquis sont consolidés et si les prochaines décisions restent concrètes, organisées et adaptées aux ressources disponibles.';
      return 'Dans l’ensemble, le projet évolue par étapes plutôt que d’un seul mouvement. Sa solidité se vérifiera dans la capacité à ajuster les moyens, les priorités et le rythme au fur et à mesure.';
    }
    if(sc==='relation'){
      if(last==='negative')return 'Dans l’ensemble, la relation demande de prendre au sérieux les limites actuelles. Une évolution resterait possible seulement si les actes modifient réellement ce qui crée aujourd’hui la distance ou l’incertitude.';
      if(pos>neg)return 'Dans l’ensemble, le mouvement est plus ouvert que fermé, mais sa réalité se vérifiera dans la réciprocité, la continuité des échanges et la place concrètement accordée au lien.';
      return 'Dans l’ensemble, le lien reste en évolution et ne se résume pas à un oui ou à un non immédiat. Les prochains faits permettront surtout de distinguer une transformation réelle d’une simple fluctuation.';
    }
    return last==='negative'?'Dans l’ensemble, la situation demande encore un réajustement avant de pouvoir se stabiliser. La difficulté finale sert surtout à montrer ce qui doit être traité avec davantage de lucidité.':'Dans l’ensemble, le tirage décrit une progression vers davantage de cohérence. La suite dépendra surtout de la manière dont cette compréhension nouvelle sera traduite dans les choix concrets.';
  }

  function fluidTarotStory(cards){
    if(!Array.isArray(cards)||!cards.length)return '';
    const q=String(state?.question||'').trim();
    const chosen=cards.slice(0,5);
    const roles=chosen.length===1?['outcome']:chosen.length===3?['origin','evolution','outcome']:['origin','obstacle','resource','evolution','outcome'];
    const sc=scope();
    const stageFn=sc==='work'?workStage:sc==='relation'?relationStage:spiritStage;
    const parts=chosen.map((card,i)=>stageFn(card,roles[i]||'evolution')).filter(Boolean);
    if(chosen.length>1)parts.push(conclusion(chosen,sc));
    const question=q?`<p class="reading-question">Votre question : « ${esc(q)} »</p>`:'';
    return `<div class="story-reading" data-story-engine="tarot-fluid-${VERSION}"><h3>L’histoire racontée par vos cartes</h3>${question}<p class="story-continuous">${parts.join(' ')}</p></div>`;
  }

  if(previousStory){
    storyInterpretation=function(cards){
      if(typeof window.CR_UNIVERSAL_FLUID_STORY==='function')return window.CR_UNIVERSAL_FLUID_STORY(cards);
      if(state?.oracle==='tarot'&&state?.lang!=='en')return fluidTarotStory(cards);
      return previousStory(cards);
    };
    interpretation=function(cards){return storyInterpretation(cards);};
  }

  window.CR_TAROT_STORY_FLUID_VERSION=VERSION;
  try{
    if(state?.oracle==='tarot'&&state?.draw?.length){
      const reading=document.getElementById('reading');
      if(reading)reading.innerHTML=fluidTarotStory(state.draw);
    }
  }catch(e){}
})();
