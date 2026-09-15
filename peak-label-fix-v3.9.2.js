/* CRISTARIVA — correctifs narratifs et numérotation des pics v3.9.3 */
(function(){
  /* Numérotation correcte des pics astrologiques. */
  if(typeof cr38PeakDate==='function'&&typeof cr37AspectLabel==='function'&&typeof cr37ImpactText==='function'){
    cr38PeakSentence=function(hit,index,en=false){
      const when=cr38PeakDate(hit,en);
      const aspect=cr37AspectLabel(hit,en);
      const impact=cr37ImpactText(hit,cr33Intent(),en);
      if(en){
        const leads=['A first significant point appears','A second significant point appears','A third significant point appears'];
        const lead=leads[index]||'Another significant point appears';
        return `${lead} ${when}: ${aspect} ${impact}.`;
      }
      const leads=['Un premier moment significatif ressort','Un deuxième moment ressort','Un troisième moment ressort'];
      const lead=leads[index]||'Un autre moment significatif ressort';
      return `${lead} ${when} : ${aspect} ${impact}.`;
    };
  }

  if(typeof cr51Bridge!=='function'||typeof cr51Meaning!=='function')return;

  const previousBridge=cr51Bridge;
  const previousMeaning=cr51Meaning;
  const previousOpening=typeof cr51Opening==='function'?cr51Opening:null;
  let adviceStep=0;
  let currentAdviceStep=0;

  function isAdviceQuestion(en=false){
    const q=String(state?.question||'').toLowerCase();
    if(en)return /\badvice\b|what should i do|how should i act|what do you recommend|recommendation/.test(q);
    return /\bconseil(?:s)?\b|que dois[- ]?je|que devrais[- ]?je|que faire|comment agir|comment dois[- ]?je|quelle attitude|quelles? recommandations?/.test(q);
  }

  function rawMeaning(card,scope,en=false){
    let text=String(typeof cr51Field==='function'?cr51Field(card,scope,en):'').replace(/\s+/g,' ').trim();
    if(!text)return '';
    text=text.replace(/^(?:Dans (?:une relation|le travail|le cadre [^,]+)|Sur le plan [^,]+),\s*/i,'');
    text=text.replace(/^(?:In (?:a relationship|the workplace|the professional context|the relational context|the spiritual context)|On (?:a general|an inner|a spiritual) level),\s*/i,'');
    const name=String(typeof cr51RawName==='function'?cr51RawName(card,en):'').trim();
    if(name){
      try{text=text.replace(new RegExp('^'+cr51Rx(name)+'\\s*[,—:-]?\\s*','i'),'');}catch(e){}
    }
    return text.trim();
  }

  function cap(text){
    text=String(text||'').trim();
    return text?text.charAt(0).toLocaleUpperCase()+text.slice(1):text;
  }

  function adviceMeaning(card,scope,index,en=false){
    let text=rawMeaning(card,scope,en);
    if(!text)return previousMeaning(card,scope,en);

    if(en){
      const leads=['The reading first advises you to ','It then invites you to ','Finally, it advises you to '];
      const lead=leads[index]||'It also advises you to ';
      text=text.replace(/^(?:this card\s+)?invites? you to\s+/i,'')
               .replace(/^asks? you to\s+/i,'')
               .replace(/^encourages? you to\s+/i,'');
      if(/^shows? what\s+/i.test(text))text='focus on what '+text.replace(/^shows? what\s+/i,'');
      return cr51Esc(cap(lead+text.replace(/[.!?]+$/,''))+'.');
    }

    const clean=text.replace(/[.!?]+$/,'').trim();
    const lead=['Le tirage vous conseille d’abord de ','Il vous invite ensuite à ','Enfin, il vous conseille de '][index]||'Il vous conseille aussi de ';

    let m=clean.match(/^(?:cette carte\s+)?invite à\s+(.+)$/i);
    if(m)return cr51Esc(cap(lead+m[1])+'.');

    m=clean.match(/^montre ce qui\s+(.+)$/i);
    if(m)return cr51Esc(cap(lead+'vous appuyer sur ce qui '+m[1])+'.');

    m=clean.match(/^(?:cette carte\s+)?(?:demande de|demande à|encourage à|aide à)\s+(.+)$/i);
    if(m)return cr51Esc(cap(lead+m[1])+'.');

    m=clean.match(/^(?:cette carte\s+)?rappelle\s+(.+)$/i);
    if(m){
      const prefix=index===0?'Gardez d’abord à l’esprit que ':index===1?'Gardez ensuite à l’esprit que ':'Enfin, gardez à l’esprit que ';
      return cr51Esc(cap(prefix+m[1])+'.');
    }

    if(/synchronicit/i.test(clean)&&/(signe|répétition|coïncidence)/i.test(clean)){
      const prefix=index===0?'Commencez par rester attentif':index===1?'Restez ensuite attentif':'Enfin, restez attentif';
      return cr51Esc(`${prefix} aux synchronicités et aux messages symboliques : les signes, les répétitions et les coïncidences porteuses de sens sont ici les éléments à observer.`);
    }

    m=clean.match(/^(?:cette carte\s+)?parle de\s+(.+)$/i);
    if(m)return cr51Esc(cap(lead+'tenir compte de '+m[1])+'.');

    m=clean.match(/^(?:cette carte\s+)?indique\s+(.+)$/i);
    if(m)return cr51Esc(cap(lead+'tenir compte du fait que '+m[1])+'.');

    return cr51Esc(cap(lead+'tenir compte de ce qui ressort ici : '+clean.charAt(0).toLocaleLowerCase()+clean.slice(1))+'.');
  }

  /* Une question de conseil doit recevoir une réponse directe, sans phrases de liaison génériques. */
  cr51Bridge=function(role,family,en=false){
    if(isAdviceQuestion(en)){
      if(role==='origin')adviceStep=0;
      currentAdviceStep=adviceStep++;
      return '';
    }
    /* L'amorce neutre « Au départ, un premier élément... » n'apporte rien au récit. */
    if(role==='origin'&&family==='neutral')return '';
    return previousBridge(role,family,en);
  };

  cr51Meaning=function(card,scope,en=false){
    if(!isAdviceQuestion(en))return previousMeaning(card,scope,en);
    return adviceMeaning(card,scope,currentAdviceStep,en);
  };

  if(previousOpening){
    cr51Opening=function(scope,en=false){
      if(isAdviceQuestion(en))return '';
      return previousOpening(scope,en);
    };
  }
})();
