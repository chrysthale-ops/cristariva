/* CRISTARIVA — ancrage du récit dans la question v5.2.1
   La question n'est plus seulement affichée au-dessus du récit : elle devient son fil conducteur.
   Les questions courtes de type « mes blessures » reçoivent une narration réellement contextualisée.

   v5.2.1 : la narration générale supprime les amorces mécaniques du type
   « Cela… », « La carte… » et les phrases sans sujet comme « Peut réveiller… »
   avant d'ajouter « Concernant… », afin d'obtenir un récit continu et naturel. */
const CRISTARIVA_QUESTION_CONTEXT_STORY_VERSION='5.2.1';

function cr52Esc(value){
  try{return typeof cr51Esc==='function'?cr51Esc(value):String(value??'');}catch(e){return String(value??'');}
}
function cr52RawQuestion(){return String(state?.question||'').replace(/\s+/g,' ').trim();}
function cr52PlainQuestion(){return cr52RawQuestion().toLowerCase();}
function cr52IsWoundQuestion(q=cr52PlainQuestion()){
  return /\b(blessur\w*|trauma\w*|traumatis\w*|souffr\w*|guér\w*|guer\w*|cicatric\w*)\b/i.test(q);
}
function cr52TopicFromQuestion(q=cr52RawQuestion(),en=false){
  const raw=String(q||'').trim();
  if(!raw)return '';
  const short=raw.split(/\s+/).length<=7&&!/[?]/.test(raw)&&!/\b(vais|va|allez|sera|seront|est-ce|comment|pourquoi|quand|dois|peux|peut|will|how|why|when|should|can)\b/i.test(raw);
  if(!short)return '';
  if(en)return raw.replace(/^my\b/i,'your');
  return raw
    .replace(/^mes\b/i,'vos')
    .replace(/^mon\b/i,'votre')
    .replace(/^ma\b/i,'votre')
    .replace(/^moi\b/i,'vous');
}

/* Finition réservée au récit général avant l'ajout du contexte de la question.
   On décrit directement la situation au lieu de commenter la carte elle-même. */
function cr52PolishGeneralStory(html,en=false){
  if(en)return html;
  try{
    const tpl=document.createElement('template');
    tpl.innerHTML=String(html||'');
    const p=tpl.content.querySelector('.story-continuous');
    if(!p)return html;
    let s=String(p.innerHTML||'').replace(/\s+/g,' ').trim();
    const boundary='(^|[.!?;:]\\s+)';
    s=s
      .replace(new RegExp(boundary+'Cela\\s+évoque\\s+','gi'),(m,b)=>b+'On perçoit alors ')
      .replace(new RegExp(boundary+'Cela\\s+aide\\s+à\\s+','gi'),(m,b)=>b+'Cette dynamique aide à ')
      .replace(new RegExp(boundary+'Cela\\s+met\\s+en\\s+lumière\\s+','gi'),(m,b)=>b+'La situation fait alors apparaître ')
      .replace(new RegExp(boundary+'Cela\\s+met\\s+en\\s+évidence\\s+','gi'),(m,b)=>b+'La situation fait alors apparaître ')
      .replace(new RegExp(boundary+'Cela\\s+invite\\s+à\\s+','gi'),(m,b)=>b+'L’enjeu est alors de ')
      .replace(new RegExp(boundary+'Cela\\s+indique\\s+','gi'),(m,b)=>b+'La suite laisse alors entrevoir ')
      .replace(new RegExp(boundary+'Cela\\s+montre\\s+','gi'),(m,b)=>b+'La situation fait apparaître ')
      .replace(new RegExp(boundary+'Cela\\s+signale\\s+','gi'),(m,b)=>b+'Un élément important apparaît alors : ')
      .replace(new RegExp(boundary+'Cela\\s+favorise\\s+','gi'),(m,b)=>b+'Cette évolution peut favoriser ')
      .replace(new RegExp(boundary+'Cela\\s+parle\\s+de\\s+','gi'),(m,b)=>b+'Cette évolution fait ressortir ')
      .replace(new RegExp(boundary+'Cela\\s+','gi'),(m,b)=>b+'La situation ')
      .replace(new RegExp(boundary+'Peut\\s+réveiller\\s+','gi'),(m,b)=>b+'La situation peut réveiller ')
      .replace(new RegExp(boundary+'Peut\\s+réactiver\\s+','gi'),(m,b)=>b+'La situation peut réactiver ')
      .replace(new RegExp(boundary+'Peut\\s+faire\\s+ressurgir\\s+','gi'),(m,b)=>b+'La situation peut faire ressurgir ')
      .replace(new RegExp(boundary+'(?:La|Cette)\\s+carte\\s+invite\\s+à\\s+','gi'),(m,b)=>b+'L’enjeu est alors de ')
      .replace(new RegExp(boundary+'(?:La|Cette)\\s+carte\\s+met\\s+en\\s+lumière\\s+','gi'),(m,b)=>b+'La situation fait alors apparaître ')
      .replace(new RegExp(boundary+'(?:La|Cette)\\s+carte\\s+(?:indique|montre|évoque|souligne|signale)\\s+','gi'),(m,b)=>b+'La situation ')
      .replace(new RegExp(boundary+'(?:La|Cette)\\s+carte\\s+','gi'),(m,b)=>b+'La situation ');
    p.innerHTML=s;
    const root=tpl.content.querySelector('.story-reading');
    if(root)root.dataset.storyEngine=CRISTARIVA_QUESTION_CONTEXT_STORY_VERSION;
    return tpl.innerHTML;
  }catch(e){return html;}
}

function cr52CardText(card,en=false){
  try{
    const scope=typeof cr51Scope==='function'?cr51Scope():'spirit';
    const loc=en?(card?.en||{}):(card||{});
    let text=scope==='work'?(loc.reading_professionnel||loc.meaning||loc.definition||''):
      scope==='relation'?(loc.reading_relationnel||loc.meaning||loc.definition||''):
      (loc.reading_spirituel||loc.meaning||loc.definition||'');
    return String(text||'').replace(/\s+/g,' ').trim();
  }catch(e){return '';}
}
function cr52WoundClause(card,role,en=false){
  const raw=cr52CardText(card,en),name=String(en?(card?.en?.name||card?.name||''):(card?.name||'')).toLowerCase();
  const hay=(name+' '+raw).toLowerCase();
  if(en){
    if(/depend|attachment|habit/.test(hay))return 'these wounds can remain active through attachments, habits or needs that have become difficult to loosen, reducing your freedom to choose differently';
    if(/cycle|repeat|echo|pattern/.test(hay))return 'they tend to reactivate through familiar cycles, which means the present may be touching an older pattern rather than creating an entirely new pain';
    if(/return|past|memory|regret/.test(hay))return 'something from the past is returning to awareness, not necessarily to be repeated, but to be understood from a different place';
    if(/fear|anx|worr/.test(hay))return 'fear still protects a sensitive point and can make an old wound feel current even before the facts confirm danger';
    if(/betray|lie|trust/.test(hay))return 'a wound around trust appears central and asks to be separated from what is actually happening now';
    if(/abandon|reject|loss|separation/.test(hay))return 'a wound linked to absence, rejection or loss still influences the way safety and closeness are experienced';
    if(/heal|peace|release|liberat/.test(hay))return 'a process of repair becomes possible when the wound is no longer treated only as something to avoid, but as something that can be understood and released';
    if(/transform|renew|birth|opening/.test(hay))return 'the wound is entering a phase where it can change meaning and stop organising the present in exactly the same way';
    return raw?`this card shows another way the wound is still active: ${raw.charAt(0).toLowerCase()+raw.slice(1)}`:'another layer of the wound is becoming visible';
  }
  if(/dépend|depend|attachement|habitude/.test(hay))return 'ces blessures peuvent rester actives à travers des attachements, des habitudes ou des besoins devenus difficiles à desserrer, au point de réduire votre liberté de choisir autrement';
  if(/cycle|répét|echo|écho|schéma/.test(hay))return 'elles tendent à se réactiver par cycles : le présent peut donc réveiller un scénario déjà connu plutôt que créer une blessure entièrement nouvelle';
  if(/retour|passé|mémoire|regret/.test(hay))return 'quelque chose du passé revient à la conscience, non pour être forcément rejoué, mais pour être compris depuis une position différente';
  if(/peur|angoiss|inquiét/.test(hay))return 'la peur continue de protéger un point sensible et peut donner à une ancienne blessure l’impression d’être encore actuelle avant même que les faits ne confirment un danger';
  if(/trahison|mensonge|confiance/.test(hay))return 'une blessure de confiance semble centrale et demande de distinguer ce qui appartient à l’histoire ancienne de ce qui se passe réellement aujourd’hui';
  if(/abandon|rejet|perte|rupture|séparation/.test(hay))return 'une blessure liée à l’absence, au rejet ou à la perte continue d’influencer votre manière de vivre la sécurité et la proximité';
  if(/guérison|guerison|paix|libération|liberation/.test(hay))return 'un processus de réparation devient possible dès lors que la blessure n’est plus seulement évitée, mais comprise, apaisée et progressivement libérée';
  if(/transformation|renouveau|naissance|ouverture/.test(hay))return 'la blessure entre dans une phase où elle peut changer de sens et cesser d’organiser le présent exactement comme auparavant';
  const clean=raw
    .replace(/^(Dans le cadre spirituel ou général|Sur le plan intérieur|Sur le plan général|Dans le cadre général ou spirituel|Dans le cadre spirituel),?\s*/i,'')
    .replace(new RegExp('^'+String(card?.name||'').replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\s*','i'),'');
  return clean?`une autre facette de ces blessures apparaît : ${clean.charAt(0).toLowerCase()+clean.slice(1).replace(/[.]$/,'')}`:'une autre facette de ces blessures devient visible';
}
function cr52WoundStory(cards,en=false){
  const clauses=cards.map((c,i)=>cr52WoundClause(c,i===0?'origin':i===cards.length-1?'outcome':'evolution',en));
  if(en){
    if(cards.length===1)return `Your question is really about how this wound is still operating now. ${clauses[0]}. The card therefore points less to a fixed injury than to a mechanism that can be recognised and gradually changed.`;
    if(cards.length===3)return `Your cards tell one coherent story about your wounds. At first, ${clauses[0]}. Then, ${clauses[1]}. Finally, ${clauses[2]}. Taken together, the reading suggests that the wound is not simply a memory of the past: it is a pattern that can still reactivate in the present, but whose repetition also makes it easier to recognise and understand differently.`;
    return `Your cards describe how an old wound is still organised in the present. ${clauses.map((x,i)=>`${i===0?'At first':i===clauses.length-1?'Finally':'Then'}, ${x}`).join('. ')}. The overall story is therefore about recognising the pattern, what reactivates it and what can gradually change its hold on the present.`;
  }
  if(cards.length===1)return `Votre question porte ici sur la manière dont cette blessure agit encore aujourd’hui. ${clauses[0].charAt(0).toUpperCase()+clauses[0].slice(1)}. La carte parle donc moins d’une blessure figée que d’un mécanisme qui peut être reconnu puis progressivement transformé.`;
  if(cards.length===3)return `Vos cartes racontent une seule histoire autour de vos blessures. Au départ, ${clauses[0]}. Puis, ${clauses[1]}. Enfin, ${clauses[2]}. Ensemble, elles montrent que la blessure n’est pas seulement un souvenir du passé : elle fonctionne encore comme un schéma susceptible de se réactiver dans le présent, mais cette répétition permet aussi de mieux l’identifier et de commencer à la comprendre autrement.`;
  return `Vos cartes décrivent la manière dont une blessure ancienne continue de s’organiser dans le présent. ${clauses.map((x,i)=>`${i===0?'Au départ':i===clauses.length-1?'Enfin':'Puis'}, ${x}`).join('. ')}. L’histoire d’ensemble porte donc sur le repérage du schéma, ce qui le réactive et ce qui peut progressivement réduire son emprise sur le présent.`;
}

const cr52BaseStoryInterpretation=typeof storyInterpretation==='function'?storyInterpretation:null;
if(cr52BaseStoryInterpretation){
  storyInterpretation=function(cards){
    if(!Array.isArray(cards)||!cards.length)return '';
    const q=cr52RawQuestion(),en=state?.lang==='en';
    if(cr52IsWoundQuestion(q)){
      const question=`<p class="reading-question">${en?'Your question':'Votre question'} : « ${cr52Esc(q)} »</p>`;
      const story=cr52WoundStory(cards,en).replace(/\s+/g,' ').trim();
      return `<div class="story-reading" data-story-engine="${CRISTARIVA_QUESTION_CONTEXT_STORY_VERSION}"><h3>${en?'The story told by your cards':'L’histoire racontée par vos cartes'}</h3>${question}<p class="story-continuous">${story}</p></div>`;
    }
    const html=cr52PolishGeneralStory(cr52BaseStoryInterpretation(cards),en);
    if(!q||en)return html;
    const topic=cr52TopicFromQuestion(q,false);
    if(!topic)return html;
    const tpl=document.createElement('template');tpl.innerHTML=html;
    const p=tpl.content.querySelector('.story-continuous');
    if(p&&!p.textContent.toLowerCase().includes(topic.toLowerCase())){
      p.innerHTML=`Concernant <b>${cr52Esc(topic)}</b>, `+p.innerHTML.charAt(0).toLowerCase()+p.innerHTML.slice(1);
    }
    const root=tpl.content.querySelector('.story-reading');if(root)root.dataset.storyEngine=CRISTARIVA_QUESTION_CONTEXT_STORY_VERSION;
    return tpl.innerHTML;
  };
  interpretation=function(cards){return storyInterpretation(cards);};
}

(function cr52Refresh(){
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