/* CRISTARIVA — récit centré sur les projets v5.5
   Quand la question porte sur un projet, des projets, des objectifs ou une réalisation,
   la question prime sur les amorces génériques et sur le vocabulaire brut des cartes. */
const CRISTARIVA_PROJECT_STORY_VERSION='5.5';

function cr55Question(){return String(state?.question||'').replace(/\s+/g,' ').trim();}
function cr55Esc(v){try{return typeof cr53Esc==='function'?cr53Esc(v):typeof cr51Esc==='function'?cr51Esc(v):String(v??'');}catch(e){return String(v??'');}}
function cr55IsProjectQuestion(q=cr55Question()){
  const s=String(q||'').toLowerCase();
  return /\b(projet\w*|objectif\w*|réalisation\w*|realisation\w*|entreprise|activité\s+professionnelle|activite\s+professionnelle|lancement|candidature|carrière|carriere)\b/i.test(s);
}
function cr55Hay(card,en=false){
  if(typeof cr53Hay==='function')return cr53Hay(card,en);
  const name=en?(card?.en?.name||card?.name||''):(card?.name||'');
  const loc=en?(card?.en||{}):(card||{});
  const text=loc.reading_professionnel||loc.meaning||loc.definition||'';
  return (String(name)+' '+String(text)).toLowerCase();
}

function cr55ProjectClause(card,role,en=false){
  const hay=cr55Hay(card,en);
  if(en){
    if(/peace|calm|stabil|clarif|conflict/.test(hay))return role==='origin'
      ?'your projects first need a calmer and more stable base, so priorities can be clarified without forcing the pace'
      :'a calmer framework helps you sort priorities and make more measured decisions';
    if(/refus|reject|denied|refuse|not accepted|block|obstacle/.test(hay))return 'the present stage contains a refusal, constraint or closed door; rather than ending the project, it asks you to revise the route, the proposal or the conditions before moving forward';
    if(/passion|motivation|creative|creativity|enthusiasm|engagement/.test(hay))return role==='outcome'
      ?'the next movement restores motivation and creative drive; the project can regain momentum if that energy is channelled into clear priorities and concrete action'
      :'motivation becomes a real resource, provided enthusiasm is organised rather than scattered';
    if(/success|recognition|progress|opening|opportunity/.test(hay))return 'the project gains room to progress, provided the opening is converted into a concrete next step';
    if(/delay|wait|stagn/.test(hay))return 'the project is not moving at full speed yet, so timing and preparation matter more than forcing immediate results';
    if(/choice|decision|direction/.test(hay))return 'a clear decision is needed to define which project deserves priority and which direction should be pursued';
    return role==='origin'?'the first card shows the conditions from which your projects are currently starting':role==='outcome'?'the final card shows what can give your projects their next concrete impulse':'the middle card shows what currently needs to be adjusted before the projects can move forward more freely';
  }

  if(/paix|calme|stabil|clarif|conflit/.test(hay))return role==='origin'
    ?'vos projets ont d’abord besoin d’une base plus calme et plus stable afin de clarifier les priorités sans forcer le rythme'
    :'un cadre plus apaisé vous aide à remettre les priorités dans l’ordre et à décider avec davantage de recul';
  if(/refus|rejet|refusé|refuse|non retenu|non accept|bloc|obstacle/.test(hay))return 'l’étape actuelle comporte un refus, une contrainte ou une porte qui se ferme ; cela ne condamne pas forcément le projet, mais oblige à revoir la voie choisie, la proposition ou les conditions avant de poursuivre';
  if(/passion|motivation|créativ|creativ|enthousias|engagement/.test(hay))return role==='outcome'
    ?'la suite redonne de l’énergie, de la créativité et l’envie de vous investir pleinement ; vos projets peuvent retrouver un véritable élan si cette force est canalisée vers des priorités claires et des actions concrètes'
    :'la motivation devient une ressource importante, à condition d’organiser l’enthousiasme au lieu de le disperser';
  if(/succès|succes|reconnaissance|progress|ouverture|opportun/.test(hay))return 'une possibilité d’avancée se présente, à condition de la transformer rapidement en étape concrète';
  if(/retard|attente|stagn/.test(hay))return 'le projet n’est pas encore dans sa phase la plus rapide ; la préparation et le bon timing comptent davantage qu’une accélération forcée';
  if(/choix|décision|decision|direction/.test(hay))return 'un choix clair devient nécessaire pour déterminer quel projet mérite la priorité et quelle direction doit être réellement poursuivie';
  return role==='origin'?'la première carte décrit les conditions à partir desquelles vos projets se construisent actuellement':role==='outcome'?'la dernière carte montre ce qui peut donner à vos projets leur prochaine impulsion concrète':'la carte centrale montre ce qui doit être ajusté maintenant pour permettre une avancée plus nette';
}

function cr55ProjectStory(cards,en=false){
  const roles=cards.length===1?['outcome']:cards.length===3?['origin','evolution','outcome']:['origin','obstacle','resource','evolution','outcome'];
  const clauses=cards.slice(0,roles.length).map((c,i)=>cr55ProjectClause(c,roles[i],en));
  if(en){
    if(cards.length===1)return `${clauses[0].charAt(0).toUpperCase()+clauses[0].slice(1)}.`;
    if(cards.length===3)return `At first, ${clauses[0]}. Right now, ${clauses[1]}. The direction ahead is clearer: ${clauses[2]}.`;
    return `At first, ${clauses[0]}. The main difficulty is that ${clauses[1]}. Your strongest support is this: ${clauses[2]}. From there, ${clauses[3]}. Finally, ${clauses[4]}.`;
  }
  if(cards.length===1)return `${clauses[0].charAt(0).toUpperCase()+clauses[0].slice(1)}.`;
  if(cards.length===3)return `Au départ, ${clauses[0]}. Aujourd’hui, ${clauses[1]}. La direction qui se dégage ensuite est plus nette : ${clauses[2]}.`;
  return `Au départ, ${clauses[0]}. La difficulté principale tient au fait que ${clauses[1]}. Votre meilleur point d’appui est alors le suivant : ${clauses[2]}. À partir de là, ${clauses[3]}. Enfin, ${clauses[4]}.`;
}

const cr55BaseStoryInterpretation=typeof storyInterpretation==='function'?storyInterpretation:null;
if(cr55BaseStoryInterpretation){
  storyInterpretation=function(cards){
    if(!Array.isArray(cards)||!cards.length)return '';
    const q=cr55Question(),en=state?.lang==='en';
    if(cr55IsProjectQuestion(q)){
      const question=`<p class="reading-question">${en?'Your question':'Votre question'} : « ${cr55Esc(q)} »</p>`;
      const story=cr55ProjectStory(cards,en).replace(/\s+/g,' ').trim();
      return `<div class="story-reading" data-story-engine="${CRISTARIVA_PROJECT_STORY_VERSION}"><h3>${en?'The story told by your cards':'L’histoire racontée par vos cartes'}</h3>${question}<p class="story-continuous">${story}</p></div>`;
    }
    return cr55BaseStoryInterpretation(cards);
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
