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

/* CRISTARIVA — fusion des pics voisins au message redondant v4.4 */
const CRISTARIVA_ADJACENT_TRANSIT_MERGE_VERSION='4.4';
(function(){
  if(typeof cr37WindowsText!=='function'||typeof cr37RelevantWindows!=='function'||typeof cr38PeakSentence!=='function')return;
  const previousWindowsText=cr37WindowsText;

  function daysBetween(a,b){
    const da=new Date(a),db=new Date(b);
    if(!Number.isFinite(da.getTime())||!Number.isFinite(db.getTime()))return Infinity;
    return Math.abs(db-da)/86400000;
  }

  function targetFocus(hit,en=false){
    const fr={
      Soleil:'le positionnement personnel, la confiance et la manière de rayonner',
      Lune:'la sensibilité, les réactions émotionnelles et le besoin de sécurité',
      Mercure:'les échanges, la communication et les décisions',
      'Vénus':'les sentiments, l’attirance et la manière de créer du lien',
      Mars:'le désir, l’initiative et le passage à l’action'
    };
    const eng={
      Soleil:'personal direction, confidence and self-expression',
      Lune:'emotional sensitivity, reactions and the need for security',
      Mercure:'communication, exchanges and decisions',
      'Vénus':'feelings, attraction and the way bonds are formed',
      Mars:'desire, initiative and action'
    };
    return (en?eng:fr)[hit?.na]||(en?'the natal point involved':'le point natal concerné');
  }

  function venusSupportDetail(hit,continuation,en=false){
    if(hit?.tr!=='Vénus'||hit?.tone!=='support')return '';
    const fr={
      Mercure:continuation?'prolonge cet élan en facilitant les échanges, l’expression des sentiments et la recherche d’accord':'facilite les échanges, l’expression des sentiments et la recherche d’accord',
      Soleil:continuation?'prolonge cet élan en renforçant l’attraction, la chaleur relationnelle et l’envie de rapprochement':'renforce l’attraction, la chaleur relationnelle et l’envie de rapprochement',
      Lune:continuation?'prolonge cet élan en adoucissant le climat émotionnel et en favorisant la proximité affective':'adoucit le climat émotionnel et favorise la proximité affective',
      'Vénus':continuation?'prolonge cet élan en accentuant la réceptivité affective, l’attirance et le besoin d’harmonie':'accentue la réceptivité affective, l’attirance et le besoin d’harmonie',
      Mars:continuation?'prolonge cet élan en rapprochant attirance, désir et envie d’agir':'rapproche attirance, désir et envie d’agir'
    };
    const eng={
      Mercure:continuation?'extends this momentum by easing communication, emotional expression and the search for agreement':'eases communication, emotional expression and the search for agreement',
      Soleil:continuation?'extends this momentum by strengthening attraction, warmth and the wish to grow closer':'strengthens attraction, warmth and the wish to grow closer',
      Lune:continuation?'extends this momentum by softening the emotional climate and encouraging closeness':'softens the emotional climate and encourages closeness',
      'Vénus':continuation?'extends this momentum by increasing emotional receptivity, attraction and the need for harmony':'increases emotional receptivity, attraction and the need for harmony',
      Mars:continuation?'extends this momentum by bringing attraction, desire and initiative closer together':'brings attraction, desire and initiative closer together'
    };
    return (en?eng:fr)[hit?.na]||'';
  }

  function detailedEffect(hit,continuation,en=false){
    const venus=venusSupportDetail(hit,continuation,en);
    if(venus)return venus;
    const impact=typeof cr37ImpactText==='function'?cr37ImpactText(hit,cr33Intent(),en):'';
    const focus=targetFocus(hit,en);
    if(en){
      if(continuation)return `continues the same movement, with greater emphasis on ${focus}`;
      return impact?`${impact}, especially through ${focus}`:`places particular emphasis on ${focus}`;
    }
    if(continuation)return `prolonge la même dynamique en mettant davantage l’accent sur ${focus}`;
    return impact?`${impact}, avec un effet plus direct sur ${focus}`:`met particulièrement l’accent sur ${focus}`;
  }

  function groupIntro(group,en=false){
    const first=group[0],last=group[group.length-1];
    const from=cr3Date(first.bestDate,en),to=cr3Date(last.bestDate,en);
    if(en){
      if(first.tone==='support')return `A single supportive sequence develops between ${from} and ${to}.`;
      if(first.tone==='challenge')return `A single more demanding sequence is concentrated between ${from} and ${to}.`;
      return `A single strong activation sequence develops between ${from} and ${to}.`;
    }
    if(first.tone==='support')return `Une même dynamique favorable se dessine entre le ${from} et le ${to}.`;
    if(first.tone==='challenge')return `Une même phase plus exigeante se concentre entre le ${from} et le ${to}.`;
    return `Une même phase d’activation marquée se dessine entre le ${from} et le ${to}.`;
  }

  function groupText(group,en=false){
    const parts=[groupIntro(group,en)];
    group.forEach((hit,index)=>{
      const date=cr3Date(hit.bestDate,en);
      const aspect=cr37AspectLabel(hit,en);
      let lead='';
      if(en)lead=index===0?`On ${date}`:(daysBetween(group[index-1].bestDate,hit.bestDate)<=1.25?'The following day':`On ${date}`);
      else lead=index===0?`Le ${date}`:(daysBetween(group[index-1].bestDate,hit.bestDate)<=1.25?'Dès le lendemain':`Le ${date}`);
      parts.push(`${lead}, ${aspect} ${detailedEffect(hit,index>0,en)}.`);
    });
    return parts.join(' ');
  }

  cr37WindowsText=function(a,en=false){
    if(!a||!state?.date)return previousWindowsText(a,en);
    let relevant=[];
    try{
      const intent=cr33Intent(),theme=cr3DominantTheme(state.draw||[],en),window=cr3TimingWindow(state.date,cr3ReadingMoment(),en);
      relevant=(cr37RelevantWindows(a,theme,window,intent)||[]).slice().sort((x,y)=>new Date(x.bestDate)-new Date(y.bestDate));
    }catch(e){return previousWindowsText(a,en);}
    if(relevant.length<2)return previousWindowsText(a,en);

    const blocks=[];
    let momentIndex=0;
    for(let i=0;i<relevant.length;){
      const group=[relevant[i]];
      let j=i+1;
      while(j<relevant.length){
        const prev=group[group.length-1],next=relevant[j];
        const close=daysBetween(prev.bestDate,next.bestDate)<=2.25;
        if(!close||next.tr!==group[0].tr||next.tone!==group[0].tone)break;
        group.push(next);j++;
      }
      if(group.length>1){
        blocks.push(groupText(group,en));
        momentIndex++;
        i=j;
      }else{
        blocks.push(cr38PeakSentence(relevant[i],momentIndex,en));
        momentIndex++;
        i++;
      }
    }
    return blocks.join(' ');
  };

  if(typeof cr362Timing==='function')cr362Timing=function(a,en=false){return cr37WindowsText(a,en);};
})();