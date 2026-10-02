const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../universal-fluid-story-v6.3.js'),'utf8');
function reading(cards,domain='Sentimental',question='Mes possibilités',lang='fr',oracle='cristariva'){
  const state={domain,question,lang,oracle,draw:[]};
  const window={addEventListener(){}};
  const document={addEventListener(){},getElementById(){return null}};
  const context={state,window,document};
  vm.createContext(context);vm.runInContext(source,context);
  return window.CR_UNIVERSAL_FLUID_STORY(cards);
}
function prose(html){return html.match(/<p class="story-continuous">([\s\S]*?)<\/p>/)[1];}
test('the reported ambiguity, conflict and commitment reading forms a coherent arc',()=>{
  const cards=['Triangle amoureux','Conflit','Engagement'].map(name=>({name}));
  const text=prose(reading(cards));
  assert.match(text,/ambiguïté sentimentale/);
  assert.match(text,/désaccords peuvent éclater/);
  assert.match(text,/engagement plus concret/);
  assert.ok(text.indexOf('ambiguïté')<text.indexOf('désaccords'));
  assert.ok(text.indexOf('désaccords')<text.indexOf('engagement'));
  assert.doesNotMatch(text,/(?:Au départ|Aujourd’hui|À partir de là),\s*(?:signale|parle|indique)/i);
  assert.doesNotMatch(text,/Triangle amoureux|\bConflit\b/i);
});
test('all draw lengths and domains use complete narrative sentences',()=>{
  const names=['Impasse','Incompatibilité','Communication','Transformation','Équilibre'];
  for(const domain of ['Sentimental','Relations','Professionnelle / Projet','Général / spirituel'])
    for(const length of [1,2,3,4,5]){
      const text=prose(reading(names.slice(0,length).map(name=>({name,keywords:name})),domain));
      assert.ok(text.length>65,`${domain} / ${length}`);
      assert.doesNotMatch(text,/(?:^|[.!?]\s+)(?:signale|parle|indique|montre|invite)\s/i);
      assert.doesNotMatch(text,/\b(?:Impasse|Incompatibilité|Communication|Transformation|Équilibre)\b/i);
    }
});
test('question is escaped and English story remains in English',()=>{
  const html=reading([{name:'Conflit',en:{name:'Conflict',keywords:'conflict'}}],'Relations','Me & <toi>');
  assert.match(html,/Me &amp; &lt;toi&gt;/);
  const english=prose(reading([{name:'Conflit',en:{name:'Conflict',keywords:'conflict'}}],'Relations','My future','en'));
  assert.match(english,/progress|direction|situation/i);
  assert.doesNotMatch(english,/\b(?:Au départ|La suite)\b/);
});
test('five tarot cards follow their own meanings and end on the concrete synthesis',()=>{
  const cards=[
    {name:'Huit de Coupes',keywords:'quête, détachement',definition:'Une situation ne nourrit plus suffisamment malgré l’attachement.'},
    {name:'Neuf de Coupes',keywords:'plaisir, satisfaction',definition:'Un désir peut se concrétiser.'},
    {name:'Neuf d’Épées',keywords:'anxiété, inquiétude',definition:'Une pensée tourne en boucle et amplifie la peur.'},
    {name:'Le Pendu',keywords:'pause, attente',definition:'La progression se suspend afin qu’un autre point de vue devienne possible.'},
    {name:'As de Deniers',keywords:'opportunité, stabilité',definition:'Une possibilité concrète se présente.'}
  ];
  const text=prose(reading(cards,'Général / spirituel','Connecter Cristariva aux événements du monde'));
  for(const term of ['Cristariva aux événements du monde','confort','inquiétudes','perspective','possibilité concrète'])assert.match(text,new RegExp(term,'i'));
  assert.ok(text.indexOf('confort')<text.indexOf('inquiétudes'));
  assert.ok(text.indexOf('inquiétudes')<text.indexOf('perspective'));
  assert.ok(text.indexOf('perspective')<text.indexOf('possibilité concrète'));
  assert.doesNotMatch(text,/Dans l’ensemble|progression continue plutôt qu’une succession|Le récit commence dans une période de transition/);
  assert.doesNotMatch(text,/Huit de Coupes|Neuf de Coupes|Le Pendu|As de Deniers/);
});
test('the same spread changes with the actual card in a position',()=>{
  const surrounding=[{name:'Blocage',keywords:'obstacle'},null,{name:'Transformation',keywords:'changement'}];
  const satisfying=prose(reading(surrounding.map(c=>c||{name:'Neuf de Coupes'})));
  const illusory=prose(reading(surrounding.map(c=>c||{name:'Sept de Coupes'})));
  assert.match(satisfying,/satisfaction recherchée/);
  assert.match(illusory,/réduire les options/);
  assert.notEqual(satisfying,illusory);
  assert.doesNotMatch(illusory,/Dans l’ensemble/);
});
test('every deck, domain and spread format uses the shared narrative without a stock conclusion',()=>{
  const cards=[
    {name:'Départ',keywords:'éloignement, choix',definition:'Une situation ne convient plus.'},
    {name:'Illusion',keywords:'illusion, projections',definition:'Plusieurs options séduisent.'},
    {name:'Clarté',keywords:'vérité, décision',definition:'Une mise au clair devient possible.'},
    {name:'Pause',keywords:'suspension, recul',definition:'Une pause change le regard.'},
    {name:'Possibilité',keywords:'opportunité, base matérielle',definition:'Une occasion concrète se présente.'}
  ];
  for(const oracle of ['cristariva','amour','tarot'])
    for(const domain of ['Vue d’ensemble','Sentimental','Relations','Professionnelle / Projet','Décision','Chemin personnel','Spiritualité'])
      for(const length of [1,3,5]){
        const text=prose(reading(cards.slice(0,length),domain,'Comment avancer ?', 'fr',oracle));
        assert.ok(text.length>65,`${oracle} / ${domain} / ${length}`);
        assert.doesNotMatch(text,/Dans l’ensemble|succession de significations isolées/,`${oracle} / ${domain} / ${length}`);
        if(length===5)assert.match(text,/possibilité concrète|possibilité se présente/i);
      }
});
test('the reported Tarot cross spread develops all five card positions and its news question',()=>{
  const cards=[
    {name:'Trois d’Épées',category:'Blessure',keywords:'peine, séparation, vérité douloureuse, blessure',definition:'Une douleur affective ou une vérité difficile demande à être regardée.'},
    {name:'Dix de Bâtons',category:'Charge',keywords:'responsabilité, surcharge, effort, poids',definition:'Le poids devient excessif si tout repose sur une seule personne.'},
    {name:'Valet de Coupes',category:'Sensibilité',keywords:'message, intuition, tendresse, nouveauté',definition:'Un message sensible et une intuition nouvelle invitent à ouvrir le cœur.'},
    {name:'Roi de Coupes',category:'Maîtrise',keywords:'maturité émotionnelle, calme, compassion, équilibre',definition:'Il maîtrise ses émotions sans les nier.'},
    {name:'Le Chariot',category:'Mouvement',keywords:'avancée, volonté, direction, maîtrise',definition:'La situation gagne en vitesse lorsqu’une direction nette est choisie.'}
  ];
  const story=prose(reading(cards,'Général / spirituel',"ouverture de cristariva à l'actualité",'fr','tarot'));
  assert.ok(story.split(/\s+/).length>=170,'the cross spread should develop the five distinct positions');
  for(const phrase of ['blessure','tout porter','regard sensible','attitude stable','ligne éditoriale','direction précise'])assert.match(story,new RegExp(phrase,'i'));
  assert.ok(story.indexOf('blessure')<story.indexOf('tout porter'));
  assert.ok(story.indexOf('tout porter')<story.indexOf('regard sensible'));
  assert.ok(story.indexOf('attitude stable')<story.indexOf('direction précise'));
  assert.doesNotMatch(story,/Une prise de conscience a commencé|Une attente trop longue|mise au clair des faits et des attentes|La suite reste ouverte et devrait se préciser/);
  assert.doesNotMatch(story,/Trois d’Épées|Dix de Bâtons|Valet de Coupes|Roi de Coupes|Le Chariot/);
});
test('a five-card spread with a shared theme varies its implications without a grammar break',()=>{
  const cards=Array.from({length:5},(_,i)=>({name:`Voile ${i}`,category:'Ambiguïté',keywords:'incertitude'}));
  const story=prose(reading(cards,'Spiritualité','Quel chemin choisir ?'));
  assert.ok(story.split(/\s+/).length>=140);
  assert.match(story,/demander les précisions/);
  assert.match(story,/vérifier les informations nouvelles/);
  assert.doesNotMatch(story,/de éclaircir|de identifier|de accueillir|de éviter/);
});


test('reported relation spread avoids repeated generic experience wording',()=>{
  const cards=[
    {id:69,name:'Introspection',reading_relationnel:'Dans une relation, Introspection montre qu’une personne réfléchit à ce qu’elle ressent, à ses limites ou à la forme de lien qu’elle souhaite. Cela peut créer un temps de retrait sans signifier automatiquement désintérêt.'},
    {id:7,name:'Tempête',reading_relationnel:'Dans une relation, Tempête décrit une période où les émotions et les tensions deviennent difficiles à contenir. Elle peut annoncer une dispute, un choc ou une remise à plat nécessaire.'},
    {id:71,name:'Désillusion',reading_relationnel:'Dans une relation, Désillusion montre qu’une attente, une promesse ou une représentation de l’autre ne correspond pas entièrement à la réalité. Elle demande de regarder le lien tel qu’il est.'},
    {id:52,name:'Mémoire',reading_relationnel:'Dans une relation, Mémoire montre qu’un souvenir partagé ou une ancienne blessure continue de colorer le lien actuel. Elle peut soutenir la nostalgie comme raviver une méfiance.'},
    {id:12,name:'Bonheur',reading_relationnel:'Dans le cadre relationnel, elle peut indiquer une relation qui apporte chaleur, confiance et sentiment d’évidence. Elle favorise les retrouvailles heureuses, la tendresse ou la construction d’un climat affectif sécurisant.'}
  ];
  const text=prose(reading(cards,'Relations','Energie du jour'));
  assert.doesNotMatch(text,/Cette expérience/i);
  assert.doesNotMatch(text,/La difficulté à examiner concerne cet aspect|Vous pouvez trouver un appui dans cette possibilité/i);
  for(const term of ['réfléchit','tensions','attente','souvenir','chaleur'])assert.match(text,new RegExp(term,'i'));
  assert.match(text,/Cependant,/);
  assert.match(text,/Un élément déterminant apparaît néanmoins/);
  assert.match(text,/Enfin, la synthèse/i);
});


test('reported Complexité Projection Trahison Conflit Dissimulation spread stays grammatical',()=>{
  const cards=[
    {id:72,name:'Complexité',reading_relationnel:'Dans une relation, Complexité peut signaler sentiments mêlés, contraintes extérieures, histoire passée, distance ou statut ambigu. Une seule explication ne suffit pas.'},
    {id:60,name:'Projection',reading_relationnel:'Dans une relation, Projection avertit que l’on peut attribuer à l’autre des sentiments, intentions ou promesses qui ne sont pas encore confirmés par ses actes.'},
    {id:2,name:'Trahison',reading_relationnel:'Dans une relation, Trahison signale une blessure de confiance : mensonge, double jeu, promesse rompue ou sentiment d’avoir été trompé. La suite dépend d’une clarification réelle, pas seulement d’excuses.'},
    {id:54,name:'Conflit',reading_relationnel:'Dans une relation, Conflit annonce ou décrit une confrontation : reproches, divergence de besoins, colère ou lutte pour faire reconnaître sa position.'},
    {id:41,name:'Dissimulation',reading_relationnel:'Dans une relation, Dissimulation indique qu’un sentiment, une intention, une information ou une autre réalité n’est pas exprimé clairement. Elle demande de ne pas confondre silence et transparence.'}
  ];
  const text=prose(reading(cards,'Relations','le suite du projet'));
  assert.match(text,/La situation évolue ensuite : l’évolution fait apparaître une confrontation/i);
  assert.match(text,/Il convient de ne pas confondre silence et transparence/i);
  assert.doesNotMatch(text,/il est question d[’']?ou décrit/i);
  assert.doesNotMatch(text,/Vous pouvez ne pas confondre/i);
});


test('reported Tempete Juste distance Paix Direction Trahison spread avoids il est question repetition',()=>{
  const cards=[
    {id:7,name:'Tempête',reading_relationnel:'Dans une relation, Tempête décrit une période où les émotions et les tensions deviennent difficiles à contenir. Elle peut annoncer une dispute, un choc ou une remise à plat nécessaire.'},
    {id:86,name:'Juste distance',reading_relationnel:'Dans une relation, Juste distance indique qu’un lien fonctionne mieux lorsque chacun dispose d’espace, de limites et d’un rythme respectés. Trop de proximité comme trop de retrait peuvent déséquilibrer la relation.'},
    {id:27,name:'Paix',reading_relationnel:'Dans le cadre relationnel, elle indique une détente, une trêve, une parole apaisée ou la possibilité de sortir d’un rapport de force. Elle favorise la douceur plutôt que l’insistance.'},
    {id:1,name:'Direction',reading_relationnel:'Dans une relation, Direction montre qu’un cap se précise. Elle parle d’un lien qui doit choisir sa trajectoire : rapprochement, redéfinition ou prise de distance selon les cartes voisines.'},
    {id:2,name:'Trahison',reading_relationnel:'Dans une relation, Trahison signale une blessure de confiance : mensonge, double jeu, promesse rompue ou sentiment d’avoir été trompé. La suite dépend d’une clarification réelle, pas seulement d’excuses.'}
  ];
  const text=prose(reading(cards,'Sentimental','kinya'));
  assert.doesNotMatch(text,/Il est question de|Il est question d[’']/i);
  for(const term of ['émotions','espace','détente','trajectoire','blessure de confiance'])assert.match(text,new RegExp(term,'i'));
  assert.match(text,/Cependant,/);
  assert.match(text,/Un élément déterminant apparaît néanmoins/);
  assert.match(text,/La situation évolue ensuite/);
  assert.match(text,/Enfin,/);
});
