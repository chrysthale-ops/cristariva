/* Sens des 78 arcanes renversés. Une inversion nuance l'énergie de la carte :
   blocage, excès ou intériorisation, sans annoncer mécaniquement son contraire. */
(function(){
  'use strict';
  const rows=[
    [1,"L'élan vers l'inconnu manque encore de repères ; ralentir évite de confondre liberté et fuite.","The leap into the unknown lacks a clear bearing; slowing down helps distinguish freedom from escape."],
    [2,"Les ressources existent, mais la dispersion ou le doute empêchent encore de les mettre en œuvre.","The resources are there, yet distraction or self-doubt keeps them from being put to use."],
    [3,"Une intuition se brouille quand le silence devient retrait ; il faut vérifier ce qui reste caché.","Intuition becomes clouded when silence turns into withdrawal; check what remains hidden."],
    [4,"La créativité et le soin s'épuisent si tout repose sur une seule personne ; retrouver ses besoins compte aussi.","Creativity and care run thin when one person carries everything; personal needs also deserve attention."],
    [5,"Un cadre trop rigide bloque l'initiative ; l'autorité gagne à écouter avant d'imposer.","An overly rigid framework blocks initiative; authority needs to listen before imposing."],
    [6,"Une règle ou un conseil reçu ne correspond plus entièrement à la situation ; exercer son jugement devient nécessaire.","An inherited rule or piece of advice no longer fits the situation; independent judgment is needed."],
    [7,"L'hésitation retarde un choix affectif ou personnel ; clarifier ses valeurs aide à sortir de l'entre-deux.","Indecision delays a personal or emotional choice; clarifying values can break the stalemate."],
    [8,"La volonté d'avancer se heurte à des directions contraires ; reprendre la maîtrise du rythme précède l'action.","The drive to move forward meets conflicting directions; regain control of the pace before acting."],
    [9,"Un déséquilibre ou un jugement hâtif fausse l'évaluation ; réexaminer les faits rétablit l'équité.","An imbalance or hasty judgment distorts the picture; reviewing the facts restores fairness."],
    [10,"La solitude cesse d'éclairer lorsqu'elle devient isolement ; un échange fiable peut rouvrir la réflexion.","Solitude stops bringing insight when it becomes isolation; a trusted conversation can reopen reflection."],
    [11,"Un cycle semble se répéter ou résister au changement ; agir sur ce qui dépend de soi rompt l'inertie.","A cycle seems to repeat or resist change; acting on what is within reach breaks the inertia."],
    [12,"La force s'épuise dans le contrôle ou la retenue ; une patience active vaut mieux qu'un bras de fer.","Strength is drained by overcontrol or restraint; active patience serves better than a contest of wills."],
    [13,"L'attente n'apporte plus de recul si elle sert à éviter une décision ; changer de regard demande un geste concret.","Waiting no longer brings perspective if it avoids a decision; a new outlook needs a practical step."],
    [14,"Une transition nécessaire est retenue par l'attachement à l'ancien ; laisser partir une forme ouvre la suivante.","A needed transition is held back by attachment to the old; releasing one form makes room for the next."],
    [15,"Les ajustements ne circulent plus librement ; retrouver un échange mesuré aide à sortir de l'excès.","Adjustments are no longer flowing freely; measured exchange can bring an excess back into balance."],
    [16,"Une attirance ou une habitude risque de prendre le pouvoir ; reconnaître sa dépendance rend le choix possible.","An attraction or habit may be taking control; naming the dependency makes choice possible again."],
    [17,"Une structure fissurée est encore maintenue par peur de la rupture ; réparer exige d'en voir la fragilité réelle.","A cracked structure is being kept in place for fear of upheaval; repair begins by seeing its true weakness."],
    [18,"L'espoir existe mais peine à être reçu ; des gestes modestes peuvent restaurer la confiance progressivement.","Hope is present but hard to accept; small, steady actions can rebuild trust gradually."],
    [19,"Les impressions et les peurs se mélangent ; attendre des faits évite de prendre une projection pour une certitude.","Impressions and fears are blending together; wait for facts before treating a projection as certainty."],
    [20,"Une joie ou une réussite reste partiellement voilée ; éclaircir les attentes aide à la partager sans pression.","Joy or success is partly obscured; clarifying expectations makes it easier to share without pressure."],
    [21,"Un appel au changement est entendu mais encore différé ; répondre suppose d'accepter le bilan du passé.","A call to change has been heard but postponed; responding means facing what the past has shown."],
    [22,"L'achèvement paraît proche mais un détail reste ouvert ; intégrer cette étape vaut mieux que forcer la clôture.","Completion seems close but one piece remains unresolved; integrate it before forcing closure."],
    [23,"L'inspiration s'éparpille avant de devenir action ; choisir un premier geste redonne de la prise.","Inspiration scatters before becoming action; choosing a first step restores momentum."],
    [24,"La planification tourne en rond ; une priorité claire permet enfin de choisir une direction.","Planning is circling without progress; one clear priority allows a direction to be chosen."],
    [25,"Une expansion espérée tarde à porter ses fruits ; réviser l'attente et les moyens évite la frustration.","Expected expansion is slow to bear fruit; revising expectations and resources eases frustration."],
    [26,"Une réussite ou un moment de stabilité reste difficile à célébrer ; consolider le cadre permet de l'habiter.","A success or stable moment is hard to celebrate; strengthening its foundations makes it easier to enjoy."],
    [27,"La concurrence se transforme en agitation stérile ; définir un terrain commun apaise les rivalités.","Competition has turned into unproductive noise; defining common ground can ease the rivalry."],
    [28,"La recherche de reconnaissance détourne de ce qui compte ; mesurer le succès autrement rend l'élan plus juste.","The pursuit of recognition distracts from what matters; a different measure of success restores direction."],
    [29,"Tenir sa position coûte trop d'énergie si chaque échange devient un combat ; choisir ses limites aide.","Defending a position costs too much when every exchange becomes a fight; choose which boundaries matter."],
    [30,"Des nouvelles ou des décisions se précipitent sans coordination ; ralentir évite les malentendus.","News or decisions are moving too quickly without coordination; slowing down prevents misunderstandings."],
    [31,"La prudence protège mais peut devenir fermeture ; distinguer danger réel et fatigue permet de souffler.","Caution protects but can become a wall; separating real danger from exhaustion creates room to breathe."],
    [32,"La charge devient excessive ; déléguer ou simplifier est nécessaire avant de poursuivre.","The burden has become excessive; delegate or simplify before carrying on."],
    [33,"Une idée prometteuse manque encore de constance ; l'essayer concrètement fera la différence.","A promising idea still lacks follow-through; testing it in practice will make the difference."],
    [34,"L'impatience pousse à agir avant de mesurer les conséquences ; canaliser l'ardeur préserve l'objectif.","Impatience pushes action ahead of judgment; directing that fire protects the goal."],
    [35,"La confiance se fragilise derrière une apparence assurée ; retrouver sa voix créative demande moins de comparaison.","Confidence is wavering beneath a bold appearance; creativity returns when comparison loosens its grip."],
    [36,"Une vision forte devient trop directive ; partager la décision aide le projet à tenir dans le temps.","A strong vision has become too controlling; sharing decisions helps the project last."],
    [37,"Une émotion nouvelle a du mal à circuler ; reconnaître ce qui est ressenti précède son expression.","A new feeling is struggling to flow; acknowledge it before trying to express it."],
    [38,"La réciprocité semble inégale ; un dialogue honnête révèle ce que chacun peut offrir.","Reciprocity feels uneven; an honest conversation reveals what each person can offer."],
    [39,"Un soutien existe mais le partage s'est déséquilibré ; retrouver une place juste pour chacun importe.","Support is present but sharing has become uneven; each person needs room to take part."],
    [40,"Le retrait protège d'une déception mais risque de masquer une possibilité ; regarder de nouveau sans se forcer.","Withdrawal shields disappointment but may hide an opportunity; look again without forcing yourself."],
    [41,"Le regret prend toute la place ; accueillir la perte permet ensuite de voir les liens encore vivants.","Regret fills the view; making space for grief can reveal connections that remain alive."],
    [42,"La nostalgie embellit ou alourdit le passé ; revenir au présent clarifie ce qui peut réellement renaître.","Nostalgia idealizes or weighs down the past; returning to the present clarifies what can truly revive."],
    [43,"Trop de possibilités entretiennent la projection ; une vérification concrète sépare désir et réalité.","Too many possibilities feed projection; one practical check separates desire from reality."],
    [44,"Un départ nécessaire est retardé par l'attachement ; nommer ce qui manque rend le choix plus libre.","A needed departure is delayed by attachment; naming what is missing makes the choice freer."],
    [45,"La satisfaction reste difficile à éprouver malgré les acquis ; ajuster ses attentes redonne de la gratitude.","Satisfaction remains elusive despite real gains; adjusting expectations makes gratitude possible again."],
    [46,"L'image d'un bonheur partagé cache peut-être des besoins tus ; parler vrai restaure la proximité.","The picture of shared happiness may hide unspoken needs; honest words restore closeness."],
    [47,"Un geste tendre ou un message reste retenu ; avancer avec simplicité évite la peur d'être mal compris.","A tender gesture or message is being held back; simplicity helps ease the fear of being misunderstood."],
    [48,"Une invitation séduit mais manque encore de suite concrète ; observer la constance des actes.","An invitation is appealing but lacks concrete follow-through; watch for consistency in actions."],
    [49,"L'empathie se change en absorption des émotions d'autrui ; préserver ses limites aide à rester disponible.","Empathy is turning into absorption of others' feelings; boundaries keep care sustainable."],
    [50,"Le calme apparent masque des émotions contenues ; les exprimer avec mesure rétablit l'équilibre.","An outward calm hides bottled feelings; expressing them with care restores balance."],
    [51,"Une vérité se présente mais la décision reste confuse ; trier les faits avant de trancher.","A truth is emerging but the decision remains unclear; sort the facts before deciding."],
    [52,"L'hésitation protège d'un conflit immédiat mais prolonge le statu quo ; une parole claire devient nécessaire.","Indecision avoids immediate conflict but prolongs the stalemate; a clear conversation is needed."],
    [53,"Une blessure demande encore du temps ; nier la peine retarde la possibilité de guérir.","A wound still needs time; denying the pain delays the possibility of healing."],
    [54,"Le repos est interrompu ou repoussé ; s'accorder une vraie pause rend la pensée plus claire.","Rest has been interrupted or postponed; a genuine pause can clear the mind."],
    [55,"Vouloir avoir le dernier mot entretient une victoire amère ; sortir du rapport de force apaise le conflit.","Needing the last word keeps a bitter victory alive; stepping out of the power struggle eases tension."],
    [56,"La transition reste inachevée tant qu'une ancienne inquiétude accompagne chaque pas ; avancer progressivement.","The transition stays unfinished while old worries follow every step; move forward gradually."],
    [57,"La discrétion risque de devenir évitement ; une stratégie honnête vaut mieux qu'un détour permanent.","Discretion is slipping into avoidance; an honest strategy serves better than endless detours."],
    [58,"Les limites semblent absolues alors qu'une marge de choix revient ; vérifier les contraintes réelles.","The limits feel absolute although some choice is returning; check which constraints are real."],
    [59,"Les pensées tournent encore autour du pire ; demander du soutien aide à retrouver une mesure juste.","Thoughts keep circling the worst outcome; seeking support can restore perspective."],
    [60,"Une fin pénible se prolonge par crainte de tourner la page ; reconnaître l'épuisement ouvre la suite.","A painful ending is prolonged by fear of moving on; acknowledging exhaustion opens the next chapter."],
    [61,"La vigilance vire à la méfiance ; vérifier l'information évite de prêter des intentions aux autres.","Alertness is becoming suspicion; checking information prevents assumptions about others' motives."],
    [62,"La franchise se transforme en précipitation ; choisir le bon moment donne plus de portée aux paroles.","Directness has become haste; choosing the right moment gives words more impact."],
    [63,"La lucidité se durcit en distance ; garder des limites sans fermer le dialogue restaure l'équilibre.","Clarity is hardening into distance; keep boundaries without closing the conversation."],
    [64,"La raison devient rigide ou autoritaire ; confronter son analyse à d'autres points de vue affine le jugement.","Reason has become rigid or authoritative; testing the analysis against other views sharpens judgment."],
    [65,"Une occasion concrète est là mais reste inexploitée ; vérifier les moyens et poser un premier acte.","A tangible opportunity is present but underused; assess the resources and take a first step."],
    [66,"Plusieurs priorités ne tiennent plus ensemble ; simplifier l'organisation soulage la pression.","Several priorities no longer fit together; simplifying the plan eases the pressure."],
    [67,"Le travail d'équipe se grippe faute de rôle clair ; reconnaître chaque contribution rétablit la coopération.","Teamwork is stalling without clear roles; recognizing each contribution restores cooperation."],
    [68,"La sécurité devient contrôle ; desserrer la prise permet de protéger sans enfermer.","Security has become control; easing the grip allows protection without confinement."],
    [69,"Le manque de ressources semble isoler ; accepter une aide concrète peut rouvrir le passage.","Scarcity feels isolating; accepting practical help can open a way forward."],
    [70,"Donner ou recevoir crée une dette implicite ; clarifier les attentes rend l'échange plus équitable.","Giving or receiving creates an unspoken debt; clarifying expectations makes the exchange fairer."],
    [71,"L'attente d'un résultat use la patience ; faire un bilan réaliste indique quoi poursuivre ou ajuster.","Waiting for a result is wearing patience thin; an honest review shows what to continue or adjust."],
    [72,"L'effort répété perd son sens sans recul ; améliorer la méthode vaut mieux que travailler davantage.","Repeated effort loses meaning without reflection; improve the method instead of simply working harder."],
    [73,"L'autonomie est solide mais peut se transformer en isolement ; partager les acquis n'enlève rien.","Independence is strong but can become isolation; sharing what has been gained takes nothing away."],
    [74,"La stabilité familiale ou matérielle demande un entretien réel ; une apparence de sécurité ne suffit pas.","Family or material stability needs active care; the appearance of security is not enough."],
    [75,"Une possibilité d'apprendre ou de bâtir reste au stade de l'idée ; un engagement modeste l'ancre.","A chance to learn or build remains only an idea; a modest commitment grounds it."],
    [76,"La prudence ralentit désormais le progrès ; garder la fiabilité tout en acceptant un ajustement.","Caution is now slowing progress; keep the reliability while allowing an adjustment."],
    [77,"Le soin apporté aux autres épuise les réserves ; préserver ses ressources fait partie de la stabilité.","Caring for others is draining reserves; preserving personal resources is part of stability."],
    [78,"La réussite matérielle risque de se réduire au contrôle ; partager la responsabilité redonne du sens aux acquis.","Material success risks becoming control; sharing responsibility gives those gains meaning again."]
  ];
  const meanings=Object.fromEntries(rows.map(([id,fr,en])=>[id,Object.freeze({fr,en})]));
  if(rows.length!==78||Object.keys(meanings).length!==78)throw new Error('78 sens renversés requis');
  window.CR_TAROT_REVERSED=Object.freeze(meanings);
  window.crTarotReversedSentence=function(card,role,en){
    const meaning=meanings[Number(card?.id)]?.[en?'en':'fr'];
    if(!meaning)return '';
    const lead=(en?{
      origin:'At the outset, ',obstacle:'The present difficulty is this: ',resource:'A useful point of support appears here: ',
      evolution:'The situation is now shifting: ',movement:'The situation is now shifting: ',outcome:'For what comes next, '
    }:{
      origin:'Au départ, ',obstacle:'La difficulté actuelle apparaît ici : ',resource:'Un appui reste possible : ',
      evolution:'La situation évolue ainsi : ',movement:'La situation évolue ainsi : ',outcome:'Pour la suite, '
    })[role]||'';
    return lead+meaning.charAt(0).toLocaleLowerCase(en?'en':'fr')+meaning.slice(1);
  };
})();
