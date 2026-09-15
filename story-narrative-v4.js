/* CRISTARIVA — moteur narratif continu v4.1
   Le récit utilise uniquement la lecture correspondant au domaine de la question.
   Il évite ainsi qu'un texte relationnel contamine une question professionnelle,
   et supprime toute phrase finale expliquant le fonctionnement du moteur. */
const CRISTARIVA_STORY_ENGINE_VERSION='4.1';

function cn4Name(card){
  try{return readingEscape(cardName(card));}catch(e){return String(card?.name||'');}
}
function cn4RawName(card,en){
  if(en&&card?.en?.name)return String(card.en.name);
  return String(card?.name||'');
}
function cn4Scope(focus){
  const d=String(state.domain||'').toLocaleLowerCase();
  const q=String(state.question||'').toLocaleLowerCase();
  if(focus==='work'||focus==='money'||/profession|travail|emploi|carri[eè]re|projet|work|career/.test(d+' '+q))return 'work';
  if(['love','return','contact','sex'].includes(focus)||/relation|amour|couple|sentiment|love/.test(d+' '+q))return 'relation';
  return 'spirit';
}
function cn4Field(card,scope,en){
  const loc=en?(card?.en||{}):card||{};
  if(scope==='work')return loc.reading_professionnel||loc.meaning||loc.definition||'';
  if(scope==='relation')return loc.reading_relationnel||loc.meaning||loc.definition||'';
  return loc.reading_spirituel||loc.meaning||loc.definition||'';
}
function cn4EscapeRx(s){return String(s||'').replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
function cn4ScopedSentence(card,scope,en){
  let s=String(cn4Field(card,scope,en)||'').replace(/\s+/g,' ').trim();
  if(!s){
    try{s=String(preciseReading(card,scope==='work'?'work':scope==='relation'?'love':'life',en)||'').trim();}catch(e){}
  }
  s=s.replace(/^(?:Dans (?:une relation|le travail|le cadre [^,]+)|Sur le plan [^,]+),\s*/i,'');
  s=s.replace(/^(?:In (?:a relationship|the workplace|the professional context|the relational context|the spiritual context)|On (?:a general|an inner|a spiritual) level),\s*/i,'');
  s=s.replace(/[.!?]\s*$/,'').trim();
  const raw=cn4RawName(card,en);
  const display=cn4Name(card);
  if(raw){
    const rx=new RegExp('^'+cn4EscapeRx(raw)+'\\b','i');
    if(rx.test(s))s=s.replace(rx,`<strong>${display}</strong>`);
    else if(s&&!/^<strong>/i.test(s))s=s.charAt(0).toLocaleLowerCase()+s.slice(1);
  }
  if(!s)return en?'the situation is still taking shape':'la situation est encore en train de se définir';
  return s;
}
function cn4Subject(focus,en){
  try{if(typeof preciseSubject==='function')return preciseSubject(focus,en);}catch(e){}
  return en?'this situation':'cette situation';
}
function cn4Noun(scope,en){
  if(en)return scope==='work'?'the project':scope==='relation'?'the relationship':'the situation';
  return scope==='work'?'le projet':scope==='relation'?'le lien':'la situation';
}

function storyInterpretation(cards){
  if(!cards||!cards.length)return '';
  const en=state.lang==='en';
  const n=cards.length;
  const focus=typeof preciseQuestionFocus==='function'?preciseQuestionFocus():'life';
  const scope=cn4Scope(focus);
  const subject=cn4Subject(focus,en);
  const noun=cn4Noun(scope,en);
  const sentence=c=>cn4ScopedSentence(c,scope,en);
  let story='';

  if(n===1){
    const central=sentence(cards[0]);
    story=en
      ?`For ${subject}, the central message is clear: ${central}. This is the main dynamic to watch now.`
      :`Pour ${subject}, le message central est clair : ${central}. C’est cette dynamique qui mérite maintenant le plus d’attention.`;
  }else if(n===3){
    const [a,b,c]=cards;
    const before=sentence(a), now=sentence(b), outcome=sentence(c);
    story=en
      ?`The story begins with ${before}. In the present, ${now}; this changes the meaning of the starting point and shows what ${noun} must now deal with. The third card gives the direction of travel: ${outcome}.`
      :`L’histoire commence avec ${before}. Dans le présent, ${now} ; cela modifie le sens du point de départ et montre ce que ${noun} doit maintenant intégrer. La troisième carte donne alors la direction de la suite : ${outcome}.`;
  }else{
    const [a,b,c,d,e]=cards;
    const origin=sentence(a), obstacle=sentence(b), resource=sentence(c), movement=sentence(d), outcome=sentence(e);
    story=en
      ?`At the start, ${origin}. But ${obstacle}; ${noun} therefore cannot move forward in the same way without taking this point into account. To get past that tension, ${resource}. This adjustment opens the next movement: ${movement}. Finally, the whole sequence leads to a practical direction: ${outcome}.`
      :`Au départ, ${origin}. Mais ${obstacle} ; ${noun} ne peut donc pas progresser de la même manière sans tenir compte de ce point. Pour dépasser cette tension, ${resource}. Ce réajustement ouvre alors le mouvement suivant : ${movement}. Enfin, toute la séquence conduit à une direction concrète : ${outcome}.`;
  }

  const question=state.question?`<p class="reading-question">${en?'Your question':'Votre question'} : « ${readingEscape(state.question)} »</p>`:'';
  return `<div class="story-reading"><h3>${en?'The story told by your cards':'L’histoire racontée par vos cartes'}</h3>${question}<p class="story-continuous">${story}</p></div>`;
}
function interpretation(cards){return storyInterpretation(cards);}
