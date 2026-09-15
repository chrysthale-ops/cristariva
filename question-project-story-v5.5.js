/* CRISTARIVA — récit centré sur les projets + finition narrative globale v5.7
   Les trois domaines suivent la même règle : interpréter directement la situation,
   sans commenter les cartes, les positions ou les étapes du tirage. */
const CRISTARIVA_PROJECT_STORY_VERSION='5.7';

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
function cr57Cap(s){s=String(s||'').trim();return s?s.charAt(0).toLocaleUpperCase()+s.slice(1):'';}

function cr55ProjectClause(card,role,en=false){
  const hay=cr55Hay(card,en);
  if(en){
    if(/patience|wait|delay|matur|validation|learning|timing/.test(hay))return role==='origin'
      ?'your projects have required time to mature, and that slower pace has helped separate what is solid from what was still premature'
      :'progress depends more on respecting the right timing than on forcing a result before the conditions are ready';
    if(/eclos|éclos|emerg|blossom|opportunity|signs? of progress|begin.*produce/.test(hay))return 'something that had been preparing in the background is beginning to take shape, with the first concrete signs that an idea, opportunity or collaboration can really develop';
    if(/mutation|transform|structur|new role|sector|organisation|model/.test(hay))return role==='outcome'
      ?'the next phase is not simply an acceleration but a structural change: your projects may evolve through a new role, a different organisation, another field or a revised way of working'
      :'the situation is entering a deeper reorganisation that changes the way the project itself is structured';
    if(/peace|calm|stabil|clarif|conflict/.test(hay))return role==='origin'
      ?'your projects need a calmer and more stable base so priorities can be clarified without forcing the pace'
      :'a calmer framework helps you sort priorities and make more measured decisions';
    if(/refus|reject|denied|refuse|not accepted|block|obstacle/.test(hay))return 'a refusal, constraint or closed door does not necessarily end the project, but it does require you to revise the route, proposal or conditions before moving forward';
    if(/passion|motivation|creative|creativity|enthusiasm|engagement/.test(hay))return role==='outcome'
      ?'motivation and creative drive return; the project can regain momentum if that energy is channelled into clear priorities and concrete action'
      :'motivation becomes a real resource, provided enthusiasm is organised rather than scattered';
    if(/success|recognition|progress|opening|opportunity/.test(hay))return 'a real opening is appearing and can become useful if it is translated into a concrete next step';
    if(/choice|decision|direction/.test(hay))return 'a clear decision is needed to determine which project deserves priority and which direction should be pursued';
    return role==='origin'?'your projects are emerging from a phase that has already shaped their current priorities':role==='outcome'?'a clearer and more concrete direction can now turn intention into real movement':'the situation is changing and redefining the conditions needed for progress';
  }

  if(/patience|attente|délai|delai|matur|validation|apprentissage|timing/.test(hay))return role==='origin'
    ?'vos projets ont eu besoin de temps pour mûrir ; cette lenteur a permis de distinguer ce qui pouvait réellement tenir de ce qui était encore prématuré'
    :'la progression dépend davantage du bon moment et de la maturation des conditions que d’une accélération forcée';
  if(/éclosion|eclosion|éclos|eclos|émerg|emerg|commence enfin|signes concrets/.test(hay))return 'ce qui se préparait jusque-là en arrière-plan commence à prendre forme : une idée, une opportunité ou une collaboration montre des signes concrets de développement';
  if(/mutation|transformation structurelle|nouveau rôle|nouveau role|secteur|organisation|modèle|modele/.test(hay))return role==='outcome'
    ?'la suite ne correspond pas seulement à une accélération, mais à une transformation plus profonde : vos projets peuvent changer de rôle, de cadre, de secteur, d’organisation ou de manière de fonctionner'
    :'la situation entre dans une réorganisation plus profonde qui modifie la structure même du projet';
  if(/paix|calme|stabil|clarif|conflit/.test(hay))return role==='origin'
    ?'vos projets ont besoin d’une base plus calme et plus stable afin de clarifier les priorités sans forcer le rythme'
    :'un cadre plus apaisé vous aide à remettre les priorités dans l’ordre et à décider avec davantage de recul';
  if(/refus|rejet|refusé|refuse|non retenu|non accept|bloc|obstacle/.test(hay))return 'un refus, une contrainte ou une porte qui se ferme ne condamne pas forcément le projet, mais oblige à revoir la voie choisie, la proposition ou les conditions avant de poursuivre';
  if(/passion|motivation|créativ|creativ|enthousias|engagement/.test(hay))return role==='outcome'
    ?'l’énergie, la créativité et l’envie de vous investir reviennent ; vos projets peuvent retrouver un véritable élan si cette force est canalisée vers des priorités claires et des actions concrètes'
    :'la motivation devient une ressource importante, à condition d’organiser l’enthousiasme au lieu de le disperser';
  if(/succès|succes|reconnaissance|progress|ouverture|opportun/.test(hay))return 'une ouverture réelle apparaît et peut devenir utile si elle est rapidement traduite en étape concrète';
  if(/choix|décision|decision|direction/.test(hay))return 'un choix clair devient nécessaire pour déterminer quel projet mérite la priorité et quelle direction doit être réellement poursuivie';
  return role==='origin'?'vos projets sortent d’une phase qui a déjà façonné leurs priorités actuelles':role==='outcome'?'une orientation plus claire et plus concrète peut désormais transformer l’intention en mouvement réel':'la situation évolue et redéfinit les conditions nécessaires pour avancer';
}

function cr55ProjectStory(cards,en=false){
  const roles=cards.length===1?['outcome']:cards.length===3?['origin','evolution','outcome']:['origin','obstacle','resource','evolution','outcome'];
  const clauses=cards.slice(0,roles.length).map((c,i)=>cr55ProjectClause(c,roles[i],en)).filter(Boolean);
  return clauses.map(cr57Cap).join('. ')+(clauses.length?'.':'');
}

function cr57PolishStoryHtml(html,en=false){
  try{
    const tpl=document.createElement('template');
    tpl.innerHTML=String(html||'');
    const p=tpl.content.querySelector('.story-continuous');
    if(!p)return html;
    let s=p.innerHTML;
    if(en){
      s=s
        .replace(/Your cards (?:tell|describe)[^.]*\.\s*/gi,'')
        .replace(/This card (?:focuses|describes)[^.]*\.\s*/gi,'')
        .replace(/\bAt first,\s*/gi,'')
        .replace(/\bThen,\s*/gi,'')
        .replace(/\bFrom there,\s*/gi,'')
        .replace(/\bFinally,\s*/gi,'');
    }else{
      s=s
        .replace(/Vos cartes racontent une seule histoire autour de vos blessures\.\s*/gi,'')
        .replace(/Vos cartes racontent une histoire cohérente autour de vos envies\.\s*/gi,'')
        .replace(/Vos cartes décrivent l’évolution de vos envies, et non un lien en lui-même\.\s*/gi,'Vos envies se précisent à travers plusieurs dimensions. ')
        .replace(/Vos cartes décrivent trois mouvements successifs dans la prochaine partie de votre vie\.\s*/gi,'La prochaine partie de votre vie fait apparaître plusieurs évolutions complémentaires. ')
        .replace(/Vos cartes décrivent une succession d’étapes de vie\.\s*/gi,'Votre trajectoire évolue autour de plusieurs enjeux complémentaires. ')
        .replace(/Vos cartes décrivent la manière dont une blessure ancienne continue de s’organiser dans le présent\.\s*/gi,'Une blessure ancienne peut encore influencer le présent. ')
        .replace(/Cette carte éclaire directement ce que vous désirez\.\s*/gi,'')
        .replace(/Cette carte décrit la tonalité de votre prochaine étape de vie\.\s*/gi,'')
        .replace(/La carte parle donc moins d’une blessure figée que d’un mécanisme qui peut être reconnu puis progressivement transformé\./gi,'Il s’agit moins d’une blessure figée que d’un mécanisme qui peut être reconnu puis progressivement transformé.')
        .replace(/la première carte montre ce qui nourrit vos envies en profondeur/gi,'vos envies sont aussi nourries par des besoins plus profonds')
        .replace(/les cartes montrent d’abord les bases à partir desquelles le prochain chapitre de votre vie commence à se construire/gi,'le prochain chapitre de votre vie se construit sur des bases qui deviennent plus lisibles')
        .replace(/la dernière carte indique la qualité vers laquelle la prochaine phase de votre vie cherche à évoluer/gi,'la prochaine phase de votre vie s’oriente vers une qualité plus nette')
        .replace(/la carte centrale décrit la transition qui façonne actuellement la suite de votre parcours/gi,'une transition façonne actuellement la suite de votre parcours')
        .replace(/\bAu départ,\s*/gi,'')
        .replace(/\bDès le début,\s*/gi,'')
        .replace(/\bPuis,\s*/gi,'')
        .replace(/\bEnsuite,\s*/gi,'')
        .replace(/\bÀ partir de là,\s*/gi,'')
        .replace(/\bEnfin,\s*/gi,'')
        .replace(/Votre meilleur appui apparaît alors\s*:\s*/gi,'Votre meilleur appui tient à ceci : ');
    }
    s=s.replace(/\s+/g,' ').replace(/>\s+</g,'><').trim();
    // Restaurer une majuscule après suppression d'une charnière narrative.
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
