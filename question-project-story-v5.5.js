/* CRISTARIVA — finition narrative globale v5.20
   Corrige les amorces sans sujet et supprime les répétitions mécaniques.
   Le sens et l'ordre des cartes sont conservés.
   v5.20 : toutes les phrases commencent par un sujet grammatical explicite. */
const CRISTARIVA_PROJECT_STORY_VERSION='5.20';

function cr55Question(){return String(state?.question||'').replace(/\s+/g,' ').trim();}
function cr55Esc(v){try{return typeof cr53Esc==='function'?cr53Esc(v):typeof cr51Esc==='function'?cr51Esc(v):String(v??'');}catch(e){return String(v??'');}}
function cr55IsProjectQuestion(q=cr55Question()){
  try{if(typeof cr51Scope==='function'&&cr51Scope()==='work')return true;}catch(e){}
  return /\b(projet\w*|objectif\w*|réalisation\w*|realisation\w*|entreprise|activité\s+professionnelle|activite\s+professionnelle|lancement|candidature|carrière|carriere|idée\w*|idee\w*|concept\w*|invention\w*|initiative\w*|création\w*|creation\w*)\b/i.test(String(q||''));
}
function cr55Hay(card,en=false){
  if(typeof cr53Hay==='function')return cr53Hay(card,en);
  const l=en?(card?.en||{}):(card||{});
  return String((en?(card?.en?.name||card?.name):card?.name)||'')+' '+String(l.reading_professionnel||l.meaning||l.definition||'');
}
function cr57Cap(s){s=String(s||'').trim();return s?s.charAt(0).toLocaleUpperCase()+s.slice(1):'';}
function cr57LowerFirst(s){s=String(s||'');return s?s.charAt(0).toLocaleLowerCase()+s.slice(1):s;}

function cr55ProjectClause(card,role,en=false){
  const h=cr55Hay(card,en).toLowerCase();
  if(en){
    if(/block|delay|refus|reject|impasse|fear|pressure|constraint/.test(h))return 'a concrete obstacle still needs to be identified and handled before the project can move forward naturally';
    if(/support|protect|providence|help|ally|opportun|success|progress/.test(h))return 'a useful opening or support can help the project move from intention to a more concrete stage';
    if(/choice|decision|direction|path/.test(h))return 'a clearer choice is needed so that effort is concentrated on the direction that matters most';
    if(/transform|change|renew|birth|eclos|emerg/.test(h))return 'the project is changing form and beginning to reveal a more workable way forward';
    if(/patience|timing|matur|wait/.test(h))return 'progress depends on respecting the right timing rather than forcing a result before the conditions are ready';
    return role==='outcome'?'the next step becomes clearer when the idea is translated into a concrete and coherent action':'the situation is redefining the conditions needed for the project to advance';
  }
  if(/bloc|retard|refus|rejet|impasse|peur|pression|contrainte/.test(h))return 'un obstacle concret doit encore être identifié et traité avant que le projet puisse avancer naturellement';
  if(/soutien|protection|providence|aide|allié|allie|opportun|succès|succes|progress/.test(h))return 'une ouverture ou un soutien utile peut aider le projet à passer de l’intention à une étape plus concrète';
  if(/choix|décision|decision|direction|cap|orientation/.test(h))return 'un choix plus clair devient nécessaire afin de concentrer les efforts sur la direction réellement prioritaire';
  if(/transformation|mutation|changement|renouveau|naissance|éclos|eclos|émerg|emerg/.test(h))return 'le projet change de forme et commence à révéler une manière plus concrète d’avancer';
  if(/patience|attente|délai|delai|matur|timing/.test(h))return 'la progression dépend davantage du bon moment que d’une accélération forcée avant que les conditions soient prêtes';
  return role==='outcome'?'la prochaine étape devient plus claire lorsque l’idée se transforme en action concrète et cohérente':'la situation redéfinit progressivement les conditions nécessaires pour faire avancer le projet';
}
function cr55ProjectStory(cards,en=false){
  const roles=cards.length===1?['outcome']:cards.length===3?['origin','evolution','outcome']:['origin','obstacle','resource','evolution','outcome'];
  const out=[];
  for(let i=0;i<Math.min(cards.length,roles.length);i++){
    const t=cr55ProjectClause(cards[i],roles[i],en),k=t.toLowerCase().replace(/[^a-zà-ÿ0-9]+/g,' ').trim();
    if(k&&!out.some(x=>x.k===k))out.push({k,t:cr57Cap(t)});
  }
  return out.map(x=>x.t).join('. ')+(out.length?'.':'');
}

/* Dernière passe narrative : les couches précédentes peuvent ajouter un sujet
   grammatical correct mais trop répétitif. Ici, on varie ces sujets sans
   modifier la valeur divinatoire, l'ordre ni le contenu des cartes. */
function cr57VarySituationSubjects(text){
  let out=String(text||'');
  const b='(^|[.!?;:]\\s+)';
  const r=(p,repl)=>{
    out=out.replace(new RegExp(b+p,'gi'),(m,x)=>{
      const value=/[;:]\\s+$/.test(x)?cr57LowerFirst(repl):repl;
      return x+value;
    });
  };

  /* Cas composés et tournures très fréquentes. */
  r("La situation\\s+ne\\s+parle\\s+pas\\s+forcément\\s+d[’']un\\s+blocage\\s*:\\s*la\\s+situation\\s+indique\\s+plutôt\\s+qu[’']il\\s+faut\\s+",'Il n’est pas forcément question d’un blocage : il s’agit plutôt de ');
  r("La situation\\s+indique\\s+plutôt\\s+qu[’']il\\s+faut\\s+",'Il s’agit plutôt de ');
  r('La situation\\s+ne\\s+parle\\s+pas\\s+forcément\\s+de\\s+','Il n’est pas forcément question de ');
  r("La suite\\s+annonce\\s+l[’']ouverture\\s+d[’']",'L’évolution annonce l’ouverture d’');
  r('La suite\\s+fait\\s+apparaître\\s+un\\s+lien\\s+particulièrement\\s+significatif','Ce lien apparaît alors comme particulièrement significatif');
  r('La situation\\s+signale\\s+une\\s+rencontre\\s+susceptible\\s+de\\s+','Une rencontre se dessine, susceptible de ');
  r('La situation\\s+invite\\s+à\\s+','Il faut alors ');
  r("La situation\\s+demande\\s+d[’']",'Il faut alors ');
  r('La situation\\s+demande\\s+de\\s+','Il faut alors ');

  /* Formulations relationnelles : on privilégie des phrases qui racontent. */
  r('La situation\\s+désigne\\s+','On reconnaît ici ');
  r('La situation\\s+est\\s+un\\s+indicateur\\s+fort\\s*:\\s*','Un indicateur fort se dégage : ');
  r('La situation\\s+se\\s+vérifie\\s+','Ce constat se vérifie ');
  r("La situation\\s+montre\\s+qu[’']",'On voit alors qu’');
  r('La situation\\s+décrit\\s+une\\s+période\\s+où\\s+','Une période s’installe, durant laquelle ');
  r('La situation\\s+évoque\\s+','On perçoit aussi ');
  r("La situation\\s+parle\\s+d[’']",'Il est ici question d’');
  r('La situation\\s+parle\\s+de\\s+','Il est ici question de ');
  r('La situation\\s+peut\\s+annoncer\\s+','Cela peut annoncer ');
  r('La situation\\s+peut\\s+indiquer\\s+','On peut alors entrevoir ');
  r('La situation\\s+montre\\s+','On voit alors ');
  r('La situation\\s+indique\\s+','Un autre élément apparaît : ');
  r('La situation\\s+révèle\\s+','Un aspect important apparaît : ');
  r('La situation\\s+décrit\\s+','Cette étape met en lumière ');
  r('La situation\\s+associe\\s+','Cette dynamique associe ');
  r('La situation\\s+oriente\\s+vers\\s+','Le mouvement s’oriente vers ');
  r('La situation\\s+oriente\\s+','Cette évolution oriente ');
  r('La situation\\s+pousse\\s+','Cette dynamique pousse ');
  r('La situation\\s+appelle\\s+','L’évolution appelle ');
  r('La situation\\s+dévoile\\s+','Un nouvel aspect se dévoile : ');
  r('La situation\\s+présente\\s+','Un nouvel élément apparaît : ');
  r('La situation\\s+maintient\\s+','Ce mouvement maintient ');

  r('La suite\\s+fait\\s+apparaître\\s+','Un nouvel élément apparaît : ');
  let announceIndex=0;
  out=out.replace(new RegExp(b+'La suite\\s+annonce\\s+','gi'),(m,x)=>{
    const choices=['Le mouvement fait apparaître ','Un nouveau tournant annonce ','L’évolution laisse entrevoir '];
    let value=choices[(announceIndex++)%choices.length];
    if(/[;:]\\s+$/.test(x))value=cr57LowerFirst(value);
    return x+value;
  });
  r('La suite\\s+laisse\\s+entrevoir\\s+','On entrevoit alors ');
  r('La suite\\s+laisse\\s+apparaître\\s+','La progression laisse peu à peu apparaître ');
  r('La suite\\s+révèle\\s+','Un nouvel aspect se révèle : ');
  r('La suite\\s+confirme\\s+','Ce qui suit confirme ');
  r('La suite\\s+ouvre\\s+','L’évolution ouvre ');
  r('La suite\\s+indique\\s+','Le mouvement devient plus lisible : ');
  r('La suite\\s+dévoile\\s+','Un autre aspect se dévoile : ');

  /* Filet de sécurité : aucune série de phrases ne doit rester scandée par
     le même sujet générique. Les variantes tournent dans l'ordre du récit. */
  let situationIndex=0,suiteIndex=0;
  const situationSubjects=['Cette dynamique','Ce mouvement','Ce qui se joue ici','À ce stade, la dynamique'];
  const suiteSubjects=['L’évolution','Ce qui suit','Le mouvement','La progression'];
  out=out.replace(new RegExp(b+'La situation\\b','gi'),(m,x)=>{
    let value=situationSubjects[(situationIndex++)%situationSubjects.length];
    if(/[;:]\\s+$/.test(x))value=cr57LowerFirst(value);
    return x+value;
  });
  out=out.replace(new RegExp(b+'La suite\\b','gi'),(m,x)=>{
    let value=suiteSubjects[(suiteIndex++)%suiteSubjects.length];
    if(/[;:]\\s+$/.test(x))value=cr57LowerFirst(value);
    return x+value;
  });

  return out;
}

function cr57PolishFrenchNarrative(s){
  let out=String(s||''),describeIndex=0;
  const b='(^|[.!?]\\s+)';
  const r=(p,repl)=>{out=out.replace(new RegExp(b+p,'gi'),(m,x)=>x+repl);};

  out=out.replace(/Cette dimension prend davantage de place\s*:\s*d[’']attention/gi,'Cette dimension accorde davantage de place à l’attention')
    .replace(/Cette dimension prend davantage de place\s*:\s*douceur,\s*d[’']attention\s+et\s+de\s+gestes/gi,'La relation accorde davantage de place à la douceur, à l’attention et aux gestes');

  r('Fait\\s+apparaître\\s+','Un nouvel élément apparaît : ');
  r('Fait\\s+ressortir\\s+','Un autre aspect ressort alors : ');
  r('Peut\\s+révéler\\s+','Une prise de conscience peut alors faire émerger ');
  r("Peut\\s+montrer\\s+la\\s+crainte\\s+d[’']être\\s+",'Une crainte peut également apparaître : celle d’être ');
  r('Peut\\s+montrer\\s+','Un autre aspect apparaît alors : ');
  r('Peut\\s+indiquer\\s+','On peut alors entrevoir ');
  r('Peut\\s+annoncer\\s+','Un nouvel élément peut alors apparaître : ');
  r('Peut\\s+traduire\\s+','Cela peut traduire ');
  r('Peut\\s+favoriser\\s+','Cette évolution peut favoriser ');
  r('Peut\\s+signaler\\s+','Cette intensité peut alors signaler ');
  r('Met\\s+en\\s+évidence\\s+','Un point important se dégage : ');
  r('Parle\\s+de\\s+','La lecture met l’accent sur ');
  r('Demande\\s+','Cette étape demande ');
  r('Relie\\s+','Cette étape relie ');
  r('Associe\\s+','Cette dynamique associe ');
  r('Soutient\\s+','Cette évolution soutient ');
  r('Confirme\\s+','Ce qui suit confirme ');
  r('Exprime\\s+','Cette étape exprime ');
  r('Rappelle\\s+','Cette lecture rappelle ');
  r('Décrit\\s+','Cette étape met en lumière ');
  r('Révèle\\s+','Un aspect important apparaît : ');
  r('Montre\\s+','On voit alors ');
  r('Traduit\\s+','Cette étape traduit ');
  r('Représente\\s+','Cette étape correspond à ');
  r('Évoque\\s+','Un autre élément se dégage autour de ');
  r('Marque\\s+','Cette phase marque ');
  r('Indique\\s+','Un autre élément apparaît : ');
  r('Signale\\s+','Un signal apparaît : ');
  r('Invite\\s+','Cette évolution invite ');
  r('Favorise\\s+','Cette évolution favorise ');
  r('Valorise\\s+','La lecture valorise ');
  r('Encourage\\s+','L’évolution encourage ');
  r('Renforce\\s+','Cela renforce ');
  r('Permet\\s+','Cette évolution permet ');
  r('Préserve\\s+','Cela préserve ');
  r('Protège\\s+','Cela protège ');
  r('Oriente\\s+','Cette évolution oriente ');
  r('Pousse\\s+','Cette dynamique pousse ');
  r('Appelle\\s+','L’évolution appelle ');
  r('Dévoile\\s+','Un autre aspect se dévoile : ');
  r('Présente\\s+','Un nouvel élément apparaît : ');
  r('Apporte\\s+','Un nouvel élément apporte ');
  r('Crée\\s+','Cette évolution crée ');
  r('Maintient\\s+','Ce mouvement maintient ');
  r('Accroît\\s+','Cela accroît ');
  r('Réduit\\s+','Cela réduit ');
  r('Aide\\s+à\\s+','Cette évolution aide à ');
  r('Ouvre\\s+','Cette évolution ouvre ');
  r('Annonce\\s+','Cette évolution annonce ');
  r('Souligne\\s+','L’attention se porte alors sur ');

  const desc=['Un point important apparaît : ','La lecture met ensuite en lumière ','À ce stade, on distingue '];
  out=out.replace(/Le tirage décrit\s+/gi,()=>desc[(describeIndex++)%desc.length])
    .replace(/Le tirage parle moins de\s+/gi,'Il est ici moins question de ')
    .replace(/Le tirage parle surtout de\s+/gi,'La lecture met surtout l’accent sur ')
    .replace(/Le tirage parle de\s+/gi,'La lecture met l’accent sur ')
    .replace(/On voit alors se dessiner\s+/gi,'La situation laisse peu à peu apparaître ')
    .replace(/On voit se dessiner\s+/gi,'La situation laisse peu à peu apparaître ')
    .replace(/Cette dynamique fait apparaître\s+/gi,'Un autre élément apparaît : ')
    .replace(/Cette dynamique traduit\s+/gi,'Cela traduit ')
    .replace(/Cette dynamique valorise\s+/gi,'La lecture valorise ')
    .replace(/Cette dynamique favorise\s+/gi,'Cette évolution favorise ')
    .replace(/\s+([,.])/g,'$1')
    .replace(/\s*([;:!?])\s*/g,' $1 ')
    .replace(/\s{2,}/g,' ');

  out=cr57VarySituationSubjects(out);
  return out.trim();
}

function cr57PolishStoryHtml(html,en=false){
  try{
    const tpl=document.createElement('template');
    tpl.innerHTML=String(html||'');
    const p=tpl.content.querySelector('.story-continuous');
    if(!p)return html;
    const walker=document.createTreeWalker(p,NodeFilter.SHOW_TEXT);
    while(walker.nextNode()){
      const node=walker.currentNode;
      if(node.parentElement.closest('b,strong,a,code'))continue;
      const match=node.textContent.match(/^(\s*)([\s\S]*?)(\s*)$/);
      let s=match[2];
      if(!s)continue;
      if(!en)s=cr57PolishFrenchNarrative(s);
      s=s.replace(/(^|[.!?]\s+)([a-zà-ÿ])/g,(m,a,c)=>a+c.toLocaleUpperCase());
      node.textContent=match[1]+s+match[3];
    }
    const root=tpl.content.querySelector('.story-reading');
    if(root)root.dataset.storyEngine=CRISTARIVA_PROJECT_STORY_VERSION;
    return tpl.innerHTML;
  }catch(e){return html;}
}

const cr55BaseStoryInterpretation=typeof storyInterpretation==='function'?storyInterpretation:null;
if(cr55BaseStoryInterpretation){
  storyInterpretation=function(cards){
    if(!Array.isArray(cards)||!cards.length)return '';
    const q=cr55Question(),en=state?.lang==='en';
    let html;
    if(cr55IsProjectQuestion(q)){
      const question=`<p class="reading-question">${en?'Your question':'Votre question'} : « ${cr55Esc(q)} »</p>`;
      html=`<div class="story-reading" data-story-engine="${CRISTARIVA_PROJECT_STORY_VERSION}"><h3>${en?'The story told by your cards':'L’histoire racontée par vos cartes'}</h3>${question}<p class="story-continuous">${cr55ProjectStory(cards,en)}</p></div>`;
    }else html=cr55BaseStoryInterpretation(cards);
    return cr57PolishStoryHtml(html,en);
  };
  interpretation=function(cards){return storyInterpretation(cards);};
}

(function cr55Refresh(){
  try{
    if(state?.draw?.length){
      for(const id of ['reading','interpretation','readingResult','story','result']){
        const el=document.getElementById(id);
        if(el&&/L’histoire racontée par vos cartes|The story told by your cards/.test(el.textContent||'')){el.innerHTML=storyInterpretation(state.draw);break;}
      }
    }
  }catch(e){}
})();
