/* CRISTARIVA — toutes les fenêtres astrologiques pertinentes v3.7
   Identifie, sur toute la période définie par la carte Datation, les fenêtres
   susceptibles d'avoir un impact sur la question posée et les cite dans la synthèse. */
const CRISTARIVA_PERIOD_WINDOWS_VERSION='3.7';

function cr37AllTransitWindows(a,theme,window){
  if(!a||!window?.card)return [];
  const natal=a.planets||{};
  const transiting=['Jupiter','Saturne','Uranus','Neptune','Mars','Vénus'];
  const natalPlanets=['Soleil','Lune','Mercure','Vénus','Mars'];
  const focus=typeof cr3FocusPlanets==='function'?cr3FocusPlanets(theme?.key||'insight'):[];

  if(!window.end){
    const sky=planetLongitudes(window.start),hits=[];
    try{
      for(const tr of transiting)for(const na of natalPlanets){
        if(!Number.isFinite(sky[tr])||!Number.isFinite(natal[na]))continue;
        const q=aspect(sky[tr],natal[na]);
        if(!q||q.orb>6)continue;
        hits.push({tr,na,...q,tone:cr3TransitTone(q.name),first:new Date(window.start),last:new Date(window.start),bestDate:new Date(window.start),bestOrb:q.orb,priority:(focus.includes(tr)||focus.includes(na))?2:0,points:1});
      }
    }catch(e){}
    return hits.sort((x,y)=>x.bestOrb-y.bestOrb);
  }

  const dates=cr3SampleDates(window),segments=[],active={};
  dates.forEach((date,di)=>{
    const sky=planetLongitudes(date),seen=new Set();
    transiting.forEach(tr=>natalPlanets.forEach(na=>{
      if(!Number.isFinite(sky[tr])||!Number.isFinite(natal[na]))return;
      const q=aspect(sky[tr],natal[na]);
      if(!q||q.orb>6)return;
      const baseKey=`${tr}|${q.name}|${na}`;
      const priority=(focus.includes(tr)||focus.includes(na))?2:0;
      seen.add(baseKey);
      let seg=active[baseKey];
      if(!seg){
        seg={key:baseKey,tr,na,name:q.name,tone:cr3TransitTone(q.name),first:new Date(date),last:new Date(date),bestDate:new Date(date),bestOrb:q.orb,priority,points:1,lastIndex:di};
        active[baseKey]=seg;segments.push(seg);
      }else if(di-seg.lastIndex<=1){
        seg.last=new Date(date);seg.lastIndex=di;seg.points++;
        if(q.orb<seg.bestOrb){seg.bestOrb=q.orb;seg.bestDate=new Date(date);}
        seg.priority=Math.max(seg.priority,priority);
      }else{
        const next={key:baseKey+'#'+di,tr,na,name:q.name,tone:cr3TransitTone(q.name),first:new Date(date),last:new Date(date),bestDate:new Date(date),bestOrb:q.orb,priority,points:1,lastIndex:di};
        active[baseKey]=next;segments.push(next);
      }
    }));
    Object.keys(active).forEach(k=>{if(!seen.has(k)&&active[k].lastIndex<di-1)delete active[k];});
  });
  return segments;
}

function cr37QuestionWeight(hit,intent){
  const tr=hit.tr,na=hit.na;
  const relation=!!(intent?.couple||intent?.sexual||String(state?.domain||'').toLowerCase().includes('relation'));
  let w=(hit.priority||0)*2;
  if(hit.bestOrb<=2)w+=2;else if(hit.bestOrb<=4)w+=1;

  if(relation){
    if(['Vénus','Mars'].includes(tr))w+=5;
    if(['Vénus','Mars','Lune','Mercure'].includes(na))w+=4;
    if(['Jupiter','Saturne','Uranus','Neptune'].includes(tr)&&['Vénus','Lune','Mars','Mercure'].includes(na))w+=3;
    if(na==='Soleil')w+=1;
  }
  if(intent?.sexual){
    if(['Vénus','Mars'].includes(tr))w+=6;
    if(['Vénus','Mars'].includes(na))w+=5;
    if(tr==='Uranus'&&['Vénus','Mars'].includes(na))w+=3;
  }
  if(intent?.newPerson){
    if(['Uranus','Jupiter','Vénus'].includes(tr))w+=4;
    if(['Vénus','Soleil','Lune'].includes(na))w+=2;
  }
  if(intent?.past){
    if(['Saturne','Vénus','Neptune'].includes(tr))w+=3;
    if(['Vénus','Lune','Mercure'].includes(na))w+=2;
  }
  if(intent?.work){
    if(['Jupiter','Saturne','Mars','Uranus'].includes(tr))w+=5;
    if(['Soleil','Mercure','Mars'].includes(na))w+=4;
    if(na==='Vénus')w+=1;
  }
  if(intent?.spiritual){
    if(['Neptune','Uranus','Jupiter','Saturne'].includes(tr))w+=5;
    if(['Lune','Soleil','Mercure'].includes(na))w+=3;
  }
  return w;
}

function cr37RelevantWindows(a,theme,window,intent){
  const all=cr37AllTransitWindows(a,theme,window);
  const relevant=all.map(h=>({hit:h,weight:cr37QuestionWeight(h,intent)}))
    .filter(x=>x.weight>=5||x.hit.priority>=2)
    .sort((a,b)=>a.hit.first-b.hit.first||b.weight-a.weight||a.hit.bestOrb-b.hit.bestOrb)
    .map(x=>x.hit);
  const seen=new Set();
  return relevant.filter(h=>{
    const key=[h.tr,h.name,h.na,+h.first,+h.last].join('|');
    if(seen.has(key))return false;
    seen.add(key);return true;
  });
}

function cr37AspectLabel(hit,en=false){
  return `${cr3Planet(hit.tr,en)} ${cr3Aspect(hit.name,en)} ${cr3Planet(hit.na,en)}${en?' natal':' natal'}`;
}

function cr37WhenText(hit,en=false){
  const base=cr33WindowText(hit,en);
  const days=Math.abs((hit.last-hit.first)/86400000);
  if(days<1.2)return base;
  const peak=en?`peak around ${cr3Date(hit.bestDate,true)}`:`pic autour du ${cr3Date(hit.bestDate,false)}`;
  return `${base} (${peak})`;
}

function cr37ImpactText(hit,intent,en=false){
  const trFr={Jupiter:'l’ouverture, la confiance et les possibilités',Saturne:'les limites, la patience et la construction durable',Uranus:'les changements soudains, la liberté et les retournements',Neptune:'l’intuition, l’idéalisation et les zones floues',Mars:'le désir, l’initiative et le passage à l’action','Vénus':'l’attirance, le lien et l’harmonie'};
  const naFr={Soleil:'votre positionnement personnel',Lune:'vos réactions émotionnelles',Mercure:'la communication et les décisions','Vénus':'l’affectivité et l’attirance',Mars:'le désir et la capacité d’action'};
  const trEn={Jupiter:'openness, confidence and possibilities',Saturne:'limits, patience and long-term construction',Uranus:'sudden change, freedom and reversals',Neptune:'intuition, idealisation and ambiguity',Mars:'desire, initiative and action','Vénus':'attraction, bonding and harmony'};
  const naEn={Soleil:'your personal direction',Lune:'your emotional reactions',Mercure:'communication and decisions','Vénus':'affection and attraction',Mars:'desire and capacity to act'};
  const trArea=(en?trEn:trFr)[hit.tr]||cr3Planet(hit.tr,en);
  const naArea=(en?naEn:naFr)[hit.na]||cr3Planet(hit.na,en);
  if(en){
    const verb=hit.tone==='support'?'can support':hit.tone==='challenge'?'can put pressure on':'can strongly activate';
    let text=`${verb} ${trArea} in relation to ${naArea}`;
    if(intent?.sexual&&(['Vénus','Mars'].includes(hit.tr)||['Vénus','Mars'].includes(hit.na)))text+='; this may affect attraction, desire or initiative, but it does not establish another person’s consent';
    return text;
  }
  const verb=hit.tone==='support'?'peut soutenir':hit.tone==='challenge'?'peut mettre sous tension':'peut activer fortement';
  let text=`${verb} ${trArea} en lien avec ${naArea}`;
  if(intent?.sexual&&(['Vénus','Mars'].includes(hit.tr)||['Vénus','Mars'].includes(hit.na)))text+=' ; cette fenêtre peut donc agir sur l’attirance, le désir ou l’initiative, sans permettre de déduire le consentement d’une autre personne';
  return text;
}

function cr37WindowsText(a,en=false){
  if(!a||!state?.date)return '';
  const intent=cr33Intent(),theme=cr3DominantTheme(state.draw||[],en),window=cr3TimingWindow(state.date,cr3ReadingMoment(),en);
  const relevant=cr37RelevantWindows(a,theme,window,intent);
  if(!relevant.length){
    if(!window.end)return en?'The Timing card has no fixed endpoint, and no clearly question-relevant planetary window is identifiable at the reading date.':'La carte Datation n’ayant pas de borne finale, aucune fenêtre planétaire clairement liée à votre question n’est identifiable au moment du tirage.';
    return en?'No distinct planetary window with a sufficiently clear link to the question is detected within the Timing-card period.':'Aucune fenêtre planétaire distincte présentant un lien suffisamment net avec votre question n’est détectée à l’intérieur de la période définie par la carte Datation.';
  }
  const parts=relevant.map(h=>`${cr37WhenText(h,en)} — ${cr37AspectLabel(h,en)} : ${cr37ImpactText(h,intent,en)}`);
  if(en){
    const intro=window.end?'Across the full period defined by the Timing card, the planetary windows that may affect your question are':'Because the Timing card has no fixed endpoint, the relevant planetary influences identifiable at the reading date are';
    return `${intro}: ${parts.join('; ')}.`;
  }
  const intro=window.end?'Sur toute la période définie par la carte Datation, les fenêtres astrologiques susceptibles d’avoir un impact sur votre question sont':'La carte Datation n’ayant pas de borne finale, les influences planétaires pertinentes identifiables au moment du tirage sont';
  return `${intro} : ${parts.join(' ; ')}.`;
}

function cr37WindowsMarkup(a,en=false){
  if(!a||!state?.date)return '';
  const intent=cr33Intent(),theme=cr3DominantTheme(state.draw||[],en),window=cr3TimingWindow(state.date,cr3ReadingMoment(),en);
  const relevant=cr37RelevantWindows(a,theme,window,intent);
  if(!relevant.length)return `<p class="cr37-none"><b>${en?'Relevant planetary windows':'Fenêtres astrologiques liées à la question'}</b> — ${cr37WindowsText(a,en)}</p>`;
  const items=relevant.map(h=>`<li><b>${cr3Escape(cr37WhenText(h,en))}</b> — <strong>${cr3Escape(cr37AspectLabel(h,en))}</strong> : ${cr3Escape(cr37ImpactText(h,intent,en))}.</li>`).join('');
  return `<div class="cr37-windows"><p><b>${en?'All planetary windows linked to your question':'Toutes les fenêtres astrologiques liées à votre question'}</b></p><ul>${items}</ul></div>`;
}

if(typeof cr33IntegratedPeriodNarrative==='function'){
  cr33IntegratedPeriodNarrative=function(a,en=cr3En()){
    if(!state.date)return `<div class="cr3-empty">${en?'Draw a Timing card to define the period covered by this reading.':'Tirez une carte Datation afin de définir la période couverte par cette lecture.'}</div>`;
    const intent=cr33Intent(),theme=cr3DominantTheme(state.draw||[],en),window=cr3TimingWindow(state.date,cr3ReadingMoment(),en);
    const relevant=cr37RelevantWindows(a,theme,window,intent),period={hits:relevant};
    const q=(state.question||'').trim();
    const dateName=typeof cr33CardLabel==='function'?cr33CardLabel(state.date,en):(state.date?.name||'');
    const overall=typeof cr33OverallTone==='function'?cr33OverallTone(period,intent,en):'';
    const intro=en
      ?`${q?`For your question “${cr3Escape(q)}”, `:''}the Timing card <b>${cr3Escape(dateName)}</b> defines the period examined. ${overall}`
      :`${q?`Pour votre question « ${cr3Escape(q)} », `:''}la carte Datation <b>${cr3Escape(dateName)}</b> définit la période examinée. ${overall}`;
    return `<div class="cr33-integrated cr37-integrated"><p>${intro}</p>${cr37WindowsMarkup(a,en)}</div>`;
  };
}

if(typeof cr362Timing==='function'){
  cr362Timing=function(a,en=false){return cr37WindowsText(a,en);};
}

(function cr37Refresh(){
  const style=document.createElement('style');
  style.textContent='.cr37-windows{margin-top:1rem}.cr37-windows p{margin-bottom:.45rem}.cr37-windows ul{margin:.35rem 0 .2rem 1.15rem;padding:0}.cr37-windows li{margin:.55rem 0;line-height:1.58}.cr37-none{line-height:1.65}';
  document.head.appendChild(style);
  const out=document.getElementById('astroResult');
  if(out&&state?.astro&&typeof formatAstroResult==='function')out.innerHTML=formatAstroResult();
  if(typeof renderSynthesis==='function')renderSynthesis();
})();
