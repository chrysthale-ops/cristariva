/* CRISTARIVA — récit centré sur les projets + finition narrative globale v5.9
   Le récit interprète la situation directement : il ne récite pas les définitions,
   ne cite pas les noms des cartes et évite les répétitions mécaniques.

   v5.9 : la finition globale élimine aussi les phrases elliptiques issues des
   définitions (« Peut révéler… », « Peut montrer… », « Peut indiquer… »,
   « Demande… ») afin que chaque proposition soit une vraie phrase narrative. */
const CRISTARIVA_PROJECT_STORY_VERSION='5.9';

function cr55Question(){return String(state?.question||'').replace(/\s+/g,' ').trim();}
function cr55Esc(v){try{return typeof cr53Esc==='function'?cr53Esc(v):typeof cr51Esc==='function'?cr51Esc(v):String(v??'');}catch(e){return String(v??'');}}
function cr55IsProjectQuestion(q=cr55Question()){
  try{if(typeof cr51Scope==='function'&&cr51Scope()==='work')return true;}catch(e){}
  const s=String(q||'').toLowerCase();
  return /\b(projet\w*|objectif\w*|réalisation\w*|realisation\w*|entreprise|activité\s+professionnelle|activite\s+professionnelle|lancement|candidature|carrière|carriere|idée\w*|idee\w*|concept\w*|invention\w*|initiative\w*|création\w*|creation\w*)\b/i.test(s);
}
function cr55Hay(card,en=false){
  if(typeof cr53Hay==='function')return cr53Hay(card,en);
  const name=en?(card?.en?.name||card?.name||''):(card?.name||'');
  const loc=en?(card?.en||{}):(card||{});
  const text=loc.reading_professionnel||loc.meaning||loc.definition||'';
  return (String(name)+' '+String(text)).toLowerCase();
}
function cr57Cap(s){s=String(s||'').trim();return s?s.charAt(0).toLocaleUpperCase()+s.slice(1):'';}

function cr55ProjectClause(card,role,en=false){
  const hay=cr55Hay(card,en);
  if(en){
    if(/complex|dependenc|several actors|several constraints|multiple factors/.test(hay))return role==='outcome'
      ?'the idea can move forward, but its success depends on putting several constraints, people or dependencies in the right order rather than trying to solve everything at once'
      :'several constraints or dependencies overlap, so the project becomes clearer when the issues are separated and handled in a logical order';
    if(/providence|protect|support|ally|help|guidance/.test(hay))return 'useful support or a protective circumstance can redirect the project away from a poor option and make the next step safer';
    if(/refus|reject|denied|refuse|not accepted|closed door/.test(hay))return role==='origin'
      ?'an initial limit or negative response may have forced you to rethink how the idea is presented, validated or brought to life'
      :'a limit or negative response does not end the idea, but it does require an adjustment to the route, proposal or conditions';
    if(/indefin|uncertain|unclear|ambigu/.test(hay))return 'part of the outcome remains open, so the next concrete decision matters more than trying to fix the result too early';
    if(/patience|wait|delay|matur|validation|learning|timing/.test(hay))return role==='origin'
      ?'the idea has needed time to mature, and that slower pace has helped separate what is solid from what was still premature'
      :'progress depends more on respecting the right timing than on forcing a result before the conditions are ready';
    if(/eclos|éclos|emerg|blossom|begin.*produce|birth|new start/.test(hay))return 'something that had been preparing in the background is beginning to take shape, with the first concrete signs that the idea can really develop';
    if(/mutation|transform|structur|new role|sector|organisation|model/.test(hay))return role==='outcome'
      ?'the next phase involves a deeper change in structure, method or positioning rather than a simple acceleration'
      :'the project is entering a deeper reorganisation that changes the way it needs to be structured';
    if(/peace|calm|stabil|clarif/.test(hay))return 'a calmer and more stable framework makes it easier to sort priorities and decide without scattering your effort';
    if(/passion|motivation|creative|creativity|enthusiasm|engagement/.test(hay))return role==='outcome'
      ?'creative drive can restore momentum if it is channelled into clear priorities and concrete action'
      :'motivation is a real resource, provided enthusiasm is organised rather than scattered';
    if(/success|recognition|progress|opening|opportunity/.test(hay))return 'a real opening is appearing and can become useful if it is translated into a concrete next step';
    if(/choice|decision|direction/.test(hay))return 'a clear decision is needed to determine which idea deserves priority and which direction should actually be pursued';
    return role==='origin'?'the idea is emerging from a phase that has already shaped its current priorities':role==='outcome'?'a clearer and more concrete direction can now turn the idea into real movement':'the situation is changing and redefining the conditions needed for progress';
  }

  if(/complex|dépendance|dependance|plusieurs\s+(?:acteurs|facteurs|contraintes)|contraintes.*ordre logique/.test(hay))return role==='outcome'
    ?'l’idée peut avancer, mais sa concrétisation demande d’ordonner les contraintes, les interlocuteurs et les dépendances au lieu de vouloir tout résoudre en même temps'
    :'plusieurs paramètres se croisent ; le projet devient plus lisible lorsque les problèmes sont séparés et traités dans un ordre logique';
  if(/providence|protection|soutien|allié|allie|aide|guidance/.test(hay))return 'un soutien utile ou une circonstance protectrice peuvent vous détourner d’une mauvaise option et sécuriser davantage la prochaine étape';
  if(/refus|rejet|refusé|refuse|non retenu|non accept|porte fermée/.test(hay))return role==='origin'
    ?'une première limite ou une réponse défavorable a pu vous obliger à repenser la manière de présenter, faire valider ou concrétiser votre idée'
    :'une limite ou une réponse défavorable ne condamne pas l’idée, mais impose d’ajuster la voie choisie, la proposition ou les conditions';
  if(/indéfini|indefini|incert|ambigu/.test(hay))return 'une part du résultat reste ouverte ; la prochaine décision concrète compte donc davantage qu’une conclusion fixée trop tôt';
  if(/patience|attente|délai|delai|matur|validation|apprentissage|timing/.test(hay))return role==='origin'
    ?'l’idée a eu besoin de temps pour mûrir ; cette lenteur a permis de distinguer ce qui pouvait réellement tenir de ce qui était encore prématuré'
    :'la progression dépend davantage du bon moment et de la maturation des conditions que d’une accélération forcée';
  if(/éclosion|eclosion|éclos|eclos|émerg|emerg|commence enfin|signes concrets|naissance|nouveau départ/.test(hay))return 'ce qui se préparait jusque-là en arrière-plan commence à prendre forme et montre les premiers signes concrets d’un développement possible';
  if(/mutation|transformation structurelle|nouveau rôle|nouveau role|secteur|organisation|modèle|modele/.test(hay))return role==='outcome'
    ?'la suite passe par une transformation plus profonde du cadre, de la méthode ou du positionnement plutôt que par une simple accélération'
    :'le projet entre dans une réorganisation plus profonde qui modifie sa structure et sa manière de fonctionner';
  if(/paix|calme|stabil|clarif/.test(hay))return 'un cadre plus apaisé et plus stable permet de remettre les priorités dans l’ordre et de décider sans disperser vos efforts';
  if(/passion|motivation|créativ|creativ|enthousias|engagement/.test(hay))return role==='outcome'
    ?'la créativité et l’envie de vous investir peuvent redonner un véritable élan si elles sont canalisées vers des priorités claires et des actions concrètes'
    :'la motivation devient une ressource importante, à condition d’organiser l’enthousiasme au lieu de le disperser';
  if(/succès|succes|reconnaissance|progress|ouverture|opportun/.test(hay))return 'une ouverture réelle apparaît et peut devenir utile si elle est rapidement traduite en étape concrète';
  if(/choix|décision|decision|direction/.test(hay))return 'un choix clair devient nécessaire pour déterminer quelle idée mérite la priorité et quelle direction doit être réellement poursuivie';
  return role==='origin'?'l’idée sort d’une phase qui a déjà façonné ses priorités actuelles':role==='outcome'?'une orientation plus claire et plus concrète peut désormais transformer l’idée en mouvement réel':'la situation évolue et redéfinit les conditions nécessaires pour avancer';
}

function cr55ProjectStory(cards,en=false){
  const roles=cards.length===1?['outcome']:cards.length===3?['origin','evolution','outcome']:['origin','obstacle','resource','evolution','outcome'];
  const clauses=cards.slice(0,roles.length).map((c,i)=>cr55ProjectClause(c,roles[i],en)).filter(Boolean);
  const unique=[];
  for(const clause of clauses){
    const key=String(clause).toLowerCase().replace(/[^a-zà-ÿ0-9]+/g,' ').trim();
    if(key&&!unique.some(x=>x.key===key))unique.push({key,text:clause});
  }
  return unique.map(x=>cr57Cap(x.text)).join('. ')+(unique.length?'.':'');
}

function cr57PolishFrenchNarrative(s){
  let out=String(s||'');
  const boundary='(^|[.!?]\\s+)';
  out=out
    .replace(new RegExp(boundary+'Peut\\s+révéler\\s+','gi'),(m,b)=>b+'Une prise de conscience peut alors faire émerger ')
    .replace(new RegExp(boundary+"Peut\\s+montrer\\s+la\\s+crainte\\s+d[’']être\\s+",'gi'),(m,b)=>b+'Une crainte peut également apparaître : celle d’être ')
    .replace(new RegExp(boundary+'Peut\\s+montrer\\s+','gi'),(m,b)=>b+'Un autre aspect apparaît alors : ')
    .replace(new RegExp(boundary+'Peut\\s+indiquer\\s+','gi'),(m,b)=>b+'La suite laisse alors entrevoir ')
    .replace(new RegExp(boundary+'Peut\\s+annoncer\\s+','gi'),(m,b)=>b+'La suite peut alors faire apparaître ')
    .replace(new RegExp(boundary+'Peut\\s+traduire\\s+','gi'),(m,b)=>b+'Cette dynamique peut traduire ')
    .replace(new RegExp(boundary+'Peut\\s+favoriser\\s+','gi'),(m,b)=>b+'Cette évolution peut favoriser ')
    .replace(new RegExp(boundary+'Demande\\s+','gi'),(m,b)=>b+'La situation demande ')
    .replace(new RegExp(boundary+'Cela\\s+peut\\s+indiquer\\s+','gi'),(m,b)=>b+'La suite laisse alors entrevoir ')
    .replace(new RegExp(boundary+'Cela\\s+peut\\s+montrer\\s+','gi'),(m,b)=>b+'Un autre aspect apparaît alors : ')
    .replace(new RegExp(boundary+'Cela\\s+peut\\s+révéler\\s+','gi'),(m,b)=>b+'Une prise de conscience peut alors faire émerger ');
  return out;
}

function cr57PolishStoryHtml(html,en=false){
  try{
    const tpl=document.createElement('template');
    tpl.innerHTML=String(html||'');
    const p=tpl.content.querySelector('.story-continuous');
    if(!p)return html;
    let s=p.innerHTML.replace(/\s+/g,' ').replace(/>\s+</g,'><').trim();
    if(!en)s=cr57PolishFrenchNarrative(s);
    s=s.replace(/(^|\.\s+)([a-zà-ÿ])/g,(m,a,b)=>a+b.toLocaleUpperCase());
    p.innerHTML=s;
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
    let html='';
    if(cr55IsProjectQuestion(q)){
      const question=`<p class="reading-question">${en?'Your question':'Votre question'} : « ${cr55Esc(q)} »</p>`;
      const story=cr55ProjectStory(cards,en).replace(/\s+/g,' ').trim();
      html=`<div class="story-reading" data-story-engine="${CRISTARIVA_PROJECT_STORY_VERSION}"><h3>${en?'The story told by your cards':'L’histoire racontée par vos cartes'}</h3>${question}<p class="story-continuous">${story}</p></div>`;
    }else{
      html=cr55BaseStoryInterpretation(cards);
    }
    return cr57PolishStoryHtml(html,en);
  };
  interpretation=function(cards){return storyInterpretation(cards);};
}

(function cr55Refresh(){
  try{
    if(state?.draw?.length){
      const candidates=['reading','interpretation','readingResult','story','result'];
      for(const id of candidates){
        const el=document.getElementById(id);
        if(el&&/L’histoire racontée par vos cartes|The story told by your cards/.test(el.textContent||'')){el.innerHTML=storyInterpretation(state.draw);break;}
      }
    }
  }catch(e){}
})();
