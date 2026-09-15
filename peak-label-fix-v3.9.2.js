/* CRISTARIVA — correctifs narratifs et numérotation des pics v3.9.6 */
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
      /* Les récits relationnels commencent directement par la première carte :
         l'annonce générique d'une évolution « par étapes » est supprimée. */
      if(scope==='relation'||isAdviceQuestion(en))return '';
      return previousOpening(scope,en);
    };
  }
})();

/* CRISTARIVA — Indéfini : pics prospectifs réels v3.9.6 */
(function(){
  function cr396IsIndefinite(window){
    const card=window?.card||state?.date;
    return Number(card?.id||0)===130;
  }

  function cr396FutureIndefiniteWindows(a,theme,window,intent){
    if(typeof cr395TriggerTransitWindows!=='function'||typeof cr395IsLocalPeak!=='function')return [];
    const all=cr395TriggerTransitWindows(a,theme,window);
    const start=new Date(window.start);
    const nextDay=new Date(start.getTime()+12*60*60*1000);
    const ranked=all.map(h=>({hit:h,weight:cr37QuestionWeight(h,intent)}))
      .filter(x=>x.weight>=5||x.hit.priority>=2)
      .filter(x=>x.hit.bestDate>nextDay)
      .filter(x=>(x.hit.bestOrb??99)<=1.25&&cr395IsLocalPeak(a,x.hit,x.hit.bestDate))
      .sort((a,b)=>
        a.hit.bestDate-b.hit.bestDate ||
        b.weight-a.weight ||
        (b.hit.priority||0)-(a.hit.priority||0) ||
        (a.hit.bestOrb||99)-(b.hit.bestOrb||99)
      );

    const seen=new Set(),selected=[];
    for(const item of ranked){
      const h=item.hit;
      const key=[h.tr,h.name,h.na,+h.bestDate].join('|');
      if(seen.has(key))continue;
      seen.add(key);
      selected.push(h);
      break;
    }
    return selected;
  }

  const previousRelevant=typeof cr37RelevantWindows==='function'?cr37RelevantWindows:null;
  if(previousRelevant){
    cr37RelevantWindows=function(a,theme,window,intent){
      if(!cr396IsIndefinite(window))return previousRelevant(a,theme,window,intent);
      return cr396FutureIndefiniteWindows(a,theme,window,intent);
    };
  }

  const previousWindowsText=typeof cr37WindowsText==='function'?cr37WindowsText:null;
  if(previousWindowsText){
    cr37WindowsText=function(a,en=false){
      if(!a||!state?.date)return '';
      const window=cr3TimingWindow(state.date,cr3ReadingMoment(),en);
      if(!cr396IsIndefinite(window))return previousWindowsText(a,en);
      const intent=cr33Intent(),theme=cr3DominantTheme(state.draw||[],en);
      const relevant=cr37RelevantWindows(a,theme,window,intent);
      if(!relevant.length){
        return en
          ?'The Indefinite Timing card does not justify turning the reading date into a significant astrological moment. No sufficiently clear question-relevant planetary peak stands out immediately after the reading.'
          :'La carte Datation Indéfini ne justifie pas de transformer la date du tirage en moment astrologique significatif. Aucun pic planétaire suffisamment net et pertinent pour votre question ne ressort immédiatement après le tirage.';
      }
      return relevant.map((h,i)=>cr38PeakSentence(h,i,en)).join(' ');
    };
  }

  const previousIntegrated=typeof cr33IntegratedPeriodNarrative==='function'?cr33IntegratedPeriodNarrative:null;
  if(previousIntegrated){
    cr33IntegratedPeriodNarrative=function(a,en=cr3En()){
      if(!state?.date)return previousIntegrated(a,en);
      const window=cr3TimingWindow(state.date,cr3ReadingMoment(),en);
      if(!cr396IsIndefinite(window))return previousIntegrated(a,en);
      const intent=cr33Intent(),theme=cr3DominantTheme(state.draw||[],en);
      const relevant=cr37RelevantWindows(a,theme,window,intent),period={hits:relevant};
      const q=(state.question||'').trim();
      const dateName=typeof cr33CardLabel==='function'?cr33CardLabel(state.date,en):(state.date?.name||'');
      const overall=typeof cr33OverallTone==='function'?cr33OverallTone(period,intent,en):'';
      const intro=en
        ?`${q?`For your question “${cr3Escape(q)}”, `:''}the Timing card <b>${cr3Escape(dateName)}</b> does not set a reliable deadline. Astrology therefore looks for the next genuinely significant activation after the reading rather than treating the reading date itself as a peak.${overall?` ${overall}`:''}`
        :`${q?`Pour votre question « ${cr3Escape(q)} », `:''}la carte Datation <b>${cr3Escape(dateName)}</b> ne fixe pas d’échéance fiable. L’astrologie recherche donc le prochain point d’activation réellement significatif après le tirage, au lieu de considérer la date du tirage elle-même comme un pic.${overall?` ${overall}`:''}`;
      return `<div class="cr33-integrated cr37-integrated cr396-indefinite"><p>${intro}</p>${cr37WindowsMarkup(a,en)}</div>`;
    };
  }

  if(typeof cr362Timing==='function'){
    cr362Timing=function(a,en=false){return cr37WindowsText(a,en);};
  }

  const out=document.getElementById('astroResult');
  if(out&&state?.astro&&typeof formatAstroResult==='function')out.innerHTML=formatAstroResult();
  if(typeof renderSynthesis==='function')renderSynthesis();
})();
