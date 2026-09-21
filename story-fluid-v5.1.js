/* CRISTARIVA — récit fluide global v5.20
   Même exigence de narration dans les trois domaines :
   interpréter la situation sans commenter les cartes, les positions ou les étapes du tirage.

   v5.20 : conserve les propositions complètes, ajoute un sujet aux amorces
   définitionnelles et répare les anciennes inversions sans sujet initial.
*/
const CRISTARIVA_FLUID_STORY_VERSION='5.20';

function cr51Esc(value){
  try{return typeof readingEscape==='function'?readingEscape(String(value??'')):String(value??'').replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  catch(e){return String(value??'');}
}
function cr51Rx(value){return String(value||'').replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
function cr51RawName(card,en=false){return String(en?(card?.en?.name||card?.name||''):(card?.name||''));}
function cr51Family(card,en=false){
  try{if(typeof cn5Family==='function')return cn5Family(card,en);}catch(e){}
  return 'neutral';
}
function cr51Field(card,scope,en=false){
  try{if(typeof cn5Field==='function')return cn5Field(card,scope,en);}catch(e){}
  const loc=en?(card?.en||{}):(card||{});
  if(scope==='work')return loc.reading_professionnel||loc.meaning||loc.definition||'';
  if(scope==='relation')return loc.reading_relationnel||loc.meaning||loc.definition||'';
  return loc.reading_spirituel||loc.meaning||loc.definition||'';
}
function cr51Replacement(card,en=false){
  const f=cr51Family(card,en);
  if(en){
    return {past:'what comes back from the past',tension:'this tension',bond:'the bond',insight:'this new understanding',movement:'the movement',change:'the change underway',ground:'a steadier inner position',ambiguity:'the uncertainty',opening:'the opening',neutral:'this element'}[f]||'this element';
  }
  return {past:'ce qui revient du passé',tension:'cette tension',bond:'le lien',insight:'cette prise de conscience',movement:'le mouvement',change:'la transformation en cours',ground:'un repère intérieur plus stable',ambiguity:'l’incertitude',opening:'l’ouverture',neutral:'cet élément'}[f]||'cet élément';
}

/* Une seule règle grammaticale sert aux définitions et au récit final.
   La liste décrit les prédicats réellement employés par les deux oracles.
   Un sujet existant et ses compléments restent toujours ensemble. */
const CR51_FRENCH_VERBS='accompagne|accroît|accroit|aide|alerte|amène|amene|annonce|apporte|apprend|associe|attire|avertit|capte|choisit|concerne|conduit|confirme|confronte|conseille|convient|correspond|crée|cree|décrit|decrit|demande|désigne|designe|dévoile|devoile|dit|doit|donne|encourage|enseigne|est|évoque|evoque|exprime|fait|favorise|force|freine|illustre|incite|indique|interroge|invite|maintient|marque|met|montre|nécessite|necessite|oblige|offre|oriente|ouvre|parle|permet|peut|place|positionne|pousse|préserve|preserve|présente|presente|privilégie|privilegie|protège|protege|ramène|ramene|rappelle|réduit|reduit|relie|renforce|renvoie|représente|represente|révèle|revele|signale|signifie|situe|souligne|soutient|suggère|suggere|suppose|symbolise|traduit|transforme|valorise';
const CR51_FRENCH_PREDICATE=new RegExp('^(?:(?:ne\\s+|n[’\'])(?:se\\s+|s[’\'])?|(?:se\\s+|s[’\']))?(?:'+CR51_FRENCH_VERBS+')(?=\\s|$)','i');

function cr51LowerFirst(s){s=String(s||'').trim();return s?s.charAt(0).toLocaleLowerCase()+s.slice(1):'';}
function cr51CapFirst(s){s=String(s||'').trim();return s?s.charAt(0).toLocaleUpperCase()+s.slice(1):'';}

function cr51StripLeadingCardName(text,card,en=false){
  const raw=cr51RawName(card,en).trim(),source=String(text||'').trim();
  if(!raw)return source;
  const article=en?'(?:(?:the|a|an)\\s+)?':"(?:(?:le|la|les|un|une)\\s+|l[’'])?";
  // Un titre autonome doit être suivi d'un séparateur, jamais d'un morceau de mot.
  const heading=new RegExp('^'+article+cr51Rx(raw)+'\\s*(?::\\s*|[—–]\\s+)','i');
  if(heading.test(source))return source.replace(heading,'').trim();
  const named=new RegExp('^'+cr51Rx(raw)+'\\s+','i');
  if(named.test(source)){
    const rest=source.replace(named,'');
    if(!en&&CR51_FRENCH_PREDICATE.test(rest))return rest;
  }
  return source;
}

function cr51NarrativizeFrenchSentence(sentence){
  let s=String(sentence||'').trim();
  if(!s)return s;

  /* Les anciennes passes stylistiques pouvaient produire « Puis s’ouvre… »,
     « Se dessine… » ou « À ce stade apparaît… ». Un préfixe verbal ne doit
     jamais être pris pour un sujet : on reconstruit une proposition complète. */
  const inverted=s.match(/^(?:(?:Puis|Enfin|Ensuite|Peu à peu|À ce stade|Plus loin),?\s+)?(s[’']ouvre|se dessine|se profile|apparaît)\s+(?:alors\s+)?(.+)$/i);
  if(inverted){
    const rest=cr51LowerFirst(inverted[2]);
    if(/^s[’']ouvre$/i.test(inverted[1]))return cr51CapFirst('cette évolution ouvre '+rest);
    if(/^se profile$/i.test(inverted[1]))return cr51CapFirst('l’évolution laisse entrevoir '+rest);
    return cr51CapFirst('la situation fait apparaître '+rest);
  }

  // Le connecteur n'est pas le sujet : la proposition qui le suit reste complète.
  const lead=s.match(/^((?:(?:Au départ|Aujourd[’']hui|À partir de là|Cependant|Pourtant|Puis|Enfin|Ensuite|Peu à peu|Dans cette dynamique|À ce stade|En parallèle|Dans (?:une relation|le travail|le cadre [^,]+)|Sur le plan [^,]+),\s*|,\s*))(.+)$/i);
  if(lead)return lead[1]+cr51LowerFirst(cr51NarrativizeFrenchSentence(lead[2]));

  // On remplace le sujet de la fiche, jamais le verbe ni son complément.
  const withoutCardSubject=s.replace(/^(?:(?:cette|la)\s+carte|elle|cela)\s+/i,'');
  if(CR51_FRENCH_PREDICATE.test(withoutCardSubject)){
    s=cr51LowerFirst(withoutCardSubject);
    if(/^(?:confronte|apprend|enseigne)\s+à\s+/i.test(s))s='vous '+s;
    const subject=/^(?:annonce|apporte|ouvre)\s/.test(s)?'La suite ':
      /^(?:exprime|favorise|valorise|encourage|renforce|protège|préserve)\s/.test(s)?'Cette dynamique ':'La situation ';
    s=subject+s;
  }else if(withoutCardSubject!==s)s='La situation '+withoutCardSubject;
  return cr51CapFirst(s)
    .replace(/\bde\s+([aeiouyàâäéèêëîïôöùûüœ])/gi,'d’$1');
}

function cr51NarrativizeFrenchStart(text){
  const source=String(text||'').trim();
  // Les points-virgules et deux-points peuvent aussi introduire une proposition.
  // On conserve la ponctuation et les nombres décimaux.
  const parts=source.split(/([.!?;:]+(?:\s+|$))/);
  return parts.map((part,i)=>{
    if(i%2)return /^[;:!?]/.test(part)?' '+part:part;
    const rewritten=cr51NarrativizeFrenchSentence(part);
    const continuation=i>0&&/^[;:]/.test(parts[i-1]);
    return continuation&&/^[a-zà-ÿ]/.test(part.trim())?cr51LowerFirst(rewritten):rewritten;
  }).join('').trim();
}

function cr51NarrativeCleanup(text,en=false){
  let s=String(text||'').replace(/\s+/g,' ').trim();
  if(!s)return s;
  if(!en){
    s=s
      .replace(/\bsimplece\b/gi,'simple ce')
      .replace(/\bcecet\b/gi,'cet')
      .replace(/\bcequi\b/gi,'ce qui')
      .replace(/\bquecela\b/gi,'que cela')
      .replace(/\bdu passé\s+du passé\b/gi,'du passé')
      .replace(/\bde la relation\s+de la relation\b/gi,'de la relation');
  }
  return s;
}

function cr51Meaning(card,scope,en=false){
  let text=String(cr51Field(card,scope,en)||'').replace(/\s+/g,' ').trim();
  if(!text)return en?'The situation is still taking shape.':'La situation est encore en train de se définir.';
  text=text.replace(/^(?:Dans (?:une relation|le travail|le cadre [^,]+)|Sur le plan [^,]+),\s*/i,'');
  text=text.replace(/^(?:In (?:a relationship|the workplace|the professional context|the relational context|the spiritual context)|On (?:a general|an inner|a spiritual) level),\s*/i,'');

  /* Important : le nom de la carte n'est supprimé que s'il sert d'en-tête au
     début du texte. Il n'est plus remplacé lorsqu'il fait partie du sens de la
     phrase. */
  text=cr51StripLeadingCardName(text,card,en);

  if(!en){
    text=cr51NarrativizeFrenchStart(text);
  }else{
    text=text.replace(/^(?:it|this card)\s+/i,'this ');
  }
  text=cr51NarrativeCleanup(text,en).replace(/^\s*[:;,.—-]+\s*/,'').trim();
  if(text&&!/[.!?]$/.test(text))text+='.';
  if(text)text=cr51CapFirst(text);
  return cr51Esc(text);
}
function cr51Scope(){
  const focus=typeof preciseQuestionFocus==='function'?preciseQuestionFocus():'life';
  try{if(typeof cn5Scope==='function')return cn5Scope(focus);}catch(e){}
  const d=String(state?.domain||'').toLowerCase(),q=String(state?.question||'').toLowerCase();
  if(/profession|travail|emploi|projet|carri|business|work|career|job/.test(d+' '+q))return 'work';
  if(/relation|amour|couple|sentiment|romant|sex|intimit|rencontr|love|partner/.test(d+' '+q))return 'relation';
  return 'spirit';
}
function cr51Opening(){return '';}
function cr51Bridge(role,family,en=false){
  if(en){
    const map={
      origin:{past:'An older thread still shapes the situation.',tension:'A pressure needs to be acknowledged.',bond:'Connection already matters here.',insight:'A clearer understanding is emerging.',movement:'A need to move forward is present.',change:'A real transition is underway.',ground:'A steadier position is becoming possible.',ambiguity:'Part of the situation remains difficult to read.',opening:'A genuine possibility is present.',neutral:''},
      obstacle:{past:'Something unfinished from the past complicates matters.',tension:'A resistance needs to be faced.',bond:'The difficulty lies in how the connection is experienced.',insight:'Another truth makes the situation more complex.',movement:'Pace or direction becomes the main difficulty.',change:'Change itself creates the difficulty.',ground:'More stability is needed.',ambiguity:'Uncertainty complicates the situation.',opening:'The opening comes with a condition.',neutral:''},
      resource:{past:'Understanding what remains active from the past becomes useful.',tension:'Facing the tension directly becomes a resource.',bond:'What can genuinely be shared becomes supportive.',insight:'Greater clarity becomes the main resource.',movement:'Momentum can return.',change:'Accepting the transition becomes useful.',ground:'A steadier position becomes supportive.',ambiguity:'Looking directly at uncertainty helps.',opening:'A constructive opening becomes possible.',neutral:''},
      evolution:{past:'Something familiar or unfinished returns to the present.',tension:'The emotional or practical intensity increases.',bond:'The relationship becomes more tangible.',insight:'Your understanding of the situation changes.',movement:'The situation regains momentum.',change:'A genuinely new phase begins.',ground:'A clearer inner axis returns.',ambiguity:'Part of the situation remains unresolved.',opening:'The evolution becomes more favourable.',neutral:''},
      outcome:{past:'An older theme remains important.',tension:'A real point of resistance remains.',bond:'The quality and reality of the connection become decisive.',insight:'The situation becomes clearer through a different understanding.',movement:'A more definite direction emerges.',change:'A genuine turning point appears.',ground:'Greater stability and coherence become possible.',ambiguity:'Part of the outcome remains open.',opening:'A clearer opening appears.',neutral:''}
    };
    return map[role]?.[family]||'';
  }
  const map={
    origin:{past:'Un élément ancien continue d’influencer la situation.',tension:'Une tension mérite d’être reconnue.',bond:'La qualité du lien compte déjà fortement.',insight:'Une compréhension plus claire commence à émerger.',movement:'Un besoin d’avancer est présent.',change:'Une véritable transition est engagée.',ground:'Une position plus stable devient possible.',ambiguity:'Une part de la situation reste difficile à lire.',opening:'Une possibilité réelle est présente.',neutral:''},
    obstacle:{past:'Quelque chose d’inachevé dans le passé complique la situation.',tension:'Une résistance demande à être affrontée.',bond:'La difficulté tient à la manière dont le lien est vécu.',insight:'Un autre aspect de la situation en révèle la complexité.',movement:'Le rythme ou la direction devient l’enjeu principal.',change:'Le changement lui-même crée la difficulté.',ground:'Davantage de stabilité devient nécessaire.',ambiguity:'L’incertitude complique la situation.',opening:'Cette ouverture comporte une condition.',neutral:''},
    resource:{past:'Comprendre ce qui reste actif du passé devient utile.',tension:'Regarder la tension en face devient un point d’appui.',bond:'Ce qui peut réellement être partagé devient une ressource.',insight:'La clarté devient le principal point d’appui.',movement:'Un nouvel élan devient possible.',change:'Accepter la transition devient une ressource.',ground:'Une position plus stable devient un appui.',ambiguity:'Regarder directement l’incertitude aide à avancer.',opening:'Une ouverture constructive devient possible.',neutral:''},
    evolution:{past:'Un élément familier ou inachevé revient dans le présent.',tension:'L’intensité émotionnelle ou concrète augmente.',bond:'La relation devient plus tangible.',insight:'Votre compréhension de la situation se transforme.',movement:'La situation retrouve de l’élan.',change:'Une phase véritablement nouvelle commence.',ground:'Un axe intérieur plus clair se réinstalle.',ambiguity:'Une part de la situation reste en suspens.',opening:'L’évolution devient plus favorable.',neutral:''},
    outcome:{past:'Un thème ancien reste important.',tension:'Une résistance réelle demeure.',bond:'La qualité et la réalité du lien deviennent déterminantes.',insight:'La situation s’éclaire sous un angle différent.',movement:'Une direction plus nette se dessine.',change:'Un véritable tournant se présente.',ground:'Davantage de stabilité et de cohérence deviennent possibles.',ambiguity:'Une part de l’issue reste ouverte.',opening:'Une ouverture plus claire apparaît.',neutral:''}
  };
  return map[role]?.[family]||'';
}
function cr51Closing(){return '';}

function storyInterpretation(cards){
  if(!Array.isArray(cards)||!cards.length)return '';
  const en=state?.lang==='en',scope=cr51Scope(),q=String(state?.question||'').trim();
  const question=q?`<p class="reading-question">${en?'Your question':'Votre question'} : « ${cr51Esc(q)} »</p>`:'';
  let story='';

  const addMeaning=(c,role)=>{
    const bridge=scope==='spirit'?'':cr51Bridge(role,cr51Family(c,en),en);
    const meaning=cr51Meaning(c,scope,en);
    if(bridge)story+=' '+bridge;
    if(meaning)story+=' '+meaning;
  };

  if(cards.length===1){
    addMeaning(cards[0],'origin');
  }else if(cards.length===3){
    const roles=['origin','evolution','outcome'];
    cards.slice(0,3).forEach((c,i)=>addMeaning(c,roles[i]));
  }else{
    const roles=['origin','obstacle','resource','evolution','outcome'];
    cards.slice(0,5).forEach((c,i)=>addMeaning(c,roles[i]));
  }

  story=cr51NarrativeCleanup(story,en).replace(/\.\s+([a-zà-ÿ])/g,(m,c)=>'. '+c.toLocaleUpperCase()).trim();
  return `<div class="story-reading" data-story-engine="${CRISTARIVA_FLUID_STORY_VERSION}"><h3>${en?'The story told by your cards':'L’histoire racontée par vos cartes'}</h3>${question}<p class="story-continuous">${story}</p></div>`;
}
function interpretation(cards){return storyInterpretation(cards);}

(function cr51Refresh(){
  try{
    if(state?.draw?.length){
      const candidates=['interpretation','readingResult','story','result'];
      for(const id of candidates){
        const el=document.getElementById(id);
        if(el&&/L’histoire racontée par vos cartes|The story told by your cards/.test(el.textContent||'')){el.innerHTML=storyInterpretation(state.draw);break;}
      }
    }
  }catch(e){}
})();
