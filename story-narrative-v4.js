/* CRISTARIVA — moteur narratif continu v4.0
   Remplace l'ancienne succession de définitions par un récit unique
   où chaque carte modifie la dynamique créée par la précédente. */
const CRISTARIVA_STORY_ENGINE_VERSION='4.0';

function cn4Name(card){
  try{return readingEscape(cardName(card));}catch(e){return String(card?.name||'');}
}
function cn4Body(text){
  let s=String(text||'').replace(/\s+/g,' ').trim().replace(/[.!?]\s*$/,'');
  if(!s)return '';
  return s.charAt(0).toLocaleLowerCase()+s.slice(1);
}
function cn4Role(card,role,en){
  try{
    if(typeof finalRoleSentence==='function')return cn4Body(finalRoleSentence(card,role,en));
  }catch(e){}
  try{
    if(typeof readingClause==='function')return cn4Body(readingClause(card,en));
  }catch(e){}
  return en?'the situation is still taking shape':'la situation est encore en train de se définir';
}
function cn4Subject(focus,en){
  try{
    if(typeof preciseSubject==='function')return preciseSubject(focus,en);
  }catch(e){}
  return en?'this situation':'cette situation';
}
function cn4Arc(first,last,en){
  let a='neutral',z='neutral';
  try{
    if(typeof finalSemanticKey==='function'){a=finalSemanticKey(first);z=finalSemanticKey(last);}
  }catch(e){}
  if(en){
    if(['separation','hidden','delay'].includes(a)&&['bond','reconcile','positive','new'].includes(z))return 'The movement is therefore not a simple continuation of the starting point: the spread describes a genuine change of atmosphere.';
    if(['bond','positive','new'].includes(a)&&['separation','hidden','delay'].includes(z))return 'The story therefore becomes more cautious than its opening suggested, because the final direction introduces a limit, distance or slower pace.';
    if(a===z&&a!=='neutral')return 'The same underlying theme remains present from beginning to end, which gives the spread a particularly coherent direction.';
    return 'Taken together, the cards describe a progression rather than a collection of separate messages.';
  }
  if(['separation','hidden','delay'].includes(a)&&['bond','reconcile','positive','new'].includes(z))return 'Le mouvement n’est donc pas une simple prolongation du point de départ : le tirage raconte un véritable changement d’atmosphère.';
  if(['bond','positive','new'].includes(a)&&['separation','hidden','delay'].includes(z))return 'L’histoire devient donc plus prudente que ne le laissait penser son ouverture, car la direction finale introduit une limite, une distance ou un rythme plus lent.';
  if(a===z&&a!=='neutral')return 'Le même thème profond reste présent du début à la fin, ce qui donne au tirage une direction particulièrement cohérente.';
  return 'Pris ensemble, ces éléments décrivent une progression : chaque carte transforme le sens de celle qui la précède.';
}

function storyInterpretation(cards){
  if(!cards||!cards.length)return '';
  const en=state.lang==='en';
  const n=cards.length;
  const focus=typeof preciseQuestionFocus==='function'?preciseQuestionFocus():'life';
  const subject=cn4Subject(focus,en);
  const strong=cn4Name;
  let story='';

  if(n===1){
    const a=cards[0];
    const central=cn4Role(a,'origin',en);
    if(en){
      story=`For ${subject}, <strong>${strong(a)}</strong> sets the tone of the reading: ${central}. Rather than announcing an isolated event, this card describes the dynamic that now deserves the most attention.`;
    }else{
      story=`Pour ${subject}, <strong>${strong(a)}</strong> donne la tonalité centrale du tirage : ${central}. Plus qu’un événement isolé, cette carte décrit la dynamique qui mérite maintenant le plus d’attention.`;
    }
  }else if(n===3){
    const [a,b,c]=cards;
    const before=cn4Role(a,'origin',en);
    const now=cn4Role(b,'origin',en);
    const outcome=cn4Role(c,'outcome',en);
    if(en){
      story=`The story begins with <strong>${strong(a)}</strong>: ${before}. What was only the background then becomes clearer in the present through <strong>${strong(b)}</strong>: ${now}. From there, <strong>${strong(c)}</strong> does not merely add a third meaning; it shows what this combination is leading toward: ${outcome}. ${cn4Arc(a,c,true)}`;
    }else{
      story=`L’histoire s’ouvre avec <strong>${strong(a)}</strong> : ${before}. Ce qui n’était encore que le décor se précise ensuite dans le présent avec <strong>${strong(b)}</strong> : ${now}. À partir de là, <strong>${strong(c)}</strong> n’ajoute pas simplement un troisième sens ; elle montre ce que la rencontre des deux premières cartes est en train de produire : ${outcome}. ${cn4Arc(a,c,false)}`;
    }
  }else{
    const [a,b,c,d,e]=cards;
    const origin=cn4Role(a,'origin',en);
    const obstacle=cn4Role(b,'obstacle',en);
    const resource=cn4Role(c,'resource',en);
    const movement=cn4Role(d,'movement',en);
    const outcome=cn4Role(e,'outcome',en);
    if(en){
      story=`For ${subject}, <strong>${strong(a)}</strong> first establishes the starting atmosphere: ${origin}. This movement then meets <strong>${strong(b)}</strong>, which changes the course of the story because ${obstacle}. The spread does not stop at that tension: with <strong>${strong(c)}</strong>, a way of responding appears, since ${resource}. That shift allows <strong>${strong(d)}</strong> to show what begins to move next: ${movement}. <strong>${strong(e)}</strong> finally gathers the whole sequence into one direction: ${outcome}. ${cn4Arc(a,e,true)}`;
    }else{
      story=`Pour ${subject}, <strong>${strong(a)}</strong> installe d’abord l’atmosphère de départ : ${origin}. Ce mouvement rencontre ensuite <strong>${strong(b)}</strong>, qui change le cours de l’histoire parce que ${obstacle}. Le tirage ne s’arrête pourtant pas à cette tension : avec <strong>${strong(c)}</strong>, une manière d’y répondre apparaît, puisque ${resource}. Ce déplacement permet alors à <strong>${strong(d)}</strong> de montrer ce qui commence réellement à bouger : ${movement}. <strong>${strong(e)}</strong> rassemble enfin toute la séquence dans une même direction : ${outcome}. ${cn4Arc(a,e,false)}`;
    }
  }

  const question=state.question?`<p class="reading-question">${en?'Your question':'Votre question'} : « ${readingEscape(state.question)} »</p>`:'';
  return `<div class="story-reading"><h3>${en?'The story told by your cards':'L’histoire racontée par vos cartes'}</h3>${question}<p class="story-continuous">${story}</p></div>`;
}
function interpretation(cards){return storyInterpretation(cards);}
