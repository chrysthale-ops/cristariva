/* CRISTARIVA — dates de pics astrologiques distinctes v3.9.8
   Deux moments significatifs ne doivent pas être affichés le même jour.
   Pour les périodes finies, le moteur recherche le meilleur second pic sur
   une autre date ; pour les fenêtres spéciales, il supprime les doublons de jour. */
const CRISTARIVA_UNIQUE_PEAK_DATES_VERSION='3.9.8';

(function(){
  if(typeof cr37RelevantWindows!=='function')return;

  const previousRelevant=cr37RelevantWindows;

  function dayKey(date){
    const d=new Date(date);
    if(!Number.isFinite(d.getTime()))return '';
    const y=d.getFullYear();
    const m=String(d.getMonth()+1).padStart(2,'0');
    const day=String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  }

  function isSpecialWindow(window){
    const id=Number((window?.card||state?.date)?.id||0);
    return id===129||id===130||!window?.end;
  }

  function finiteDistinctWindows(a,theme,window,intent){
    if(typeof cr37AllTransitWindows!=='function'||typeof cr37QuestionWeight!=='function')return previousRelevant(a,theme,window,intent);

    const all=cr37AllTransitWindows(a,theme,window);
    const ranked=all.map(h=>({hit:h,weight:cr37QuestionWeight(h,intent)}))
      .filter(x=>x.weight>=5||x.hit.priority>=2)
      .sort((a,b)=>
        b.weight-a.weight ||
        (b.hit.priority||0)-(a.hit.priority||0) ||
        (a.hit.bestOrb||99)-(b.hit.bestOrb||99) ||
        (b.hit.points||0)-(a.hit.points||0)
      );

    const unique=[];
    const seenAspect=new Set();
    for(const item of ranked){
      const h=item.hit;
      const key=[h.tr,h.name,h.na,+new Date(h.first),+new Date(h.last)].join('|');
      if(seenAspect.has(key))continue;
      seenAspect.add(key);
      unique.push(h);
    }

    const limit=typeof cr38WindowLimit==='function'?cr38WindowLimit(window):2;
    const selected=[];
    const usedDates=new Set();
    const usedTransit=new Set();

    for(const h of unique){
      if(selected.length>=limit)break;
      const date=dayKey(h.bestDate);
      if(!date||usedDates.has(date)||usedTransit.has(h.tr))continue;
      selected.push(h);
      usedDates.add(date);
      usedTransit.add(h.tr);
    }

    if(selected.length<limit){
      for(const h of unique){
        if(selected.length>=limit)break;
        if(selected.includes(h))continue;
        const date=dayKey(h.bestDate);
        if(!date||usedDates.has(date))continue;
        selected.push(h);
        usedDates.add(date);
      }
    }

    return selected.sort((a,b)=>new Date(a.bestDate)-new Date(b.bestDate));
  }

  cr37RelevantWindows=function(a,theme,window,intent){
    if(isSpecialWindow(window)){
      const hits=previousRelevant(a,theme,window,intent)||[];
      const usedDates=new Set();
      return hits.filter(h=>{
        const key=dayKey(h.bestDate);
        if(!key||usedDates.has(key))return false;
        usedDates.add(key);
        return true;
      });
    }
    return finiteDistinctWindows(a,theme,window,intent);
  };

  if(typeof cr362Timing==='function'&&typeof cr37WindowsText==='function'){
    cr362Timing=function(a,en=false){return cr37WindowsText(a,en);};
  }

  const out=document.getElementById('astroResult');
  if(out&&state?.astro&&typeof formatAstroResult==='function')out.innerHTML=formatAstroResult();
  if(typeof renderSynthesis==='function')renderSynthesis();
})();

/* CRISTARIVA — intégration de Pluton v4.2
   Pluton est ajouté au calcul natal et aux transits, puis garanti juste avant
   chaque rendu du thème astral afin d'éviter qu'une ancienne session l'omette. */
const CRISTARIVA_PLUTO_ASTROLOGY_VERSION='4.2';

function cr41PlutoHelio(d){
  const S=rad(norm(50.03+0.033459652*d));
  const P=rad(norm(238.95+0.003968789*d));
  const lon=238.9508+0.00400703*d
    -19.799*Math.sin(P)+19.848*Math.cos(P)
    +0.897*Math.sin(2*P)-4.956*Math.cos(2*P)
    +0.610*Math.sin(3*P)+1.211*Math.cos(3*P)
    -0.341*Math.sin(4*P)-0.190*Math.cos(4*P)
    +0.128*Math.sin(5*P)-0.034*Math.cos(5*P)
    -0.038*Math.sin(6*P)+0.031*Math.cos(6*P)
    +0.020*Math.sin(S-P)-0.010*Math.cos(S-P);
  const lat=-3.9082
    -5.453*Math.sin(P)-14.975*Math.cos(P)
    +3.527*Math.sin(2*P)+1.673*Math.cos(2*P)
    -1.051*Math.sin(3*P)+0.328*Math.cos(3*P)
    +0.179*Math.sin(4*P)-0.292*Math.cos(4*P)
    +0.019*Math.sin(5*P)+0.100*Math.cos(5*P)
    -0.031*Math.sin(6*P)-0.026*Math.cos(6*P)
    +0.011*Math.cos(S-P);
  const r=40.72+6.68*Math.sin(P)+6.90*Math.cos(P)
    -1.18*Math.sin(2*P)-0.03*Math.cos(2*P)
    +0.15*Math.sin(3*P)-0.14*Math.cos(3*P);
  const lr=rad(norm(lon)),br=rad(lat);
  return {x:r*Math.cos(lr)*Math.cos(br),y:r*Math.sin(lr)*Math.cos(br),z:r*Math.sin(br)};
}

const cr41BasePlanetLongitudes=typeof planetLongitudes==='function'?planetLongitudes:null;
if(cr41BasePlanetLongitudes){
  planetLongitudes=function(date){
    const out=cr41BasePlanetLongitudes(date);
    try{
      const d=jd(date)-2451543.5;
      const earth=helio(ORB.Terre,d);
      const pluto=cr41PlutoHelio(d);
      out.Pluton=norm(deg(Math.atan2(pluto.y+earth.y,pluto.x+earth.x)));
    }catch(e){}
    return out;
  };
}

try{if(typeof CR3_PLANET_EN==='object')CR3_PLANET_EN.Pluton='Pluto';}catch(e){}

function cr41PlutoTransitWindows(a,theme,window){
  if(!a||!window?.card)return [];
  const natal=a.planets||{},tr='Pluton';
  const natalPlanets=['Soleil','Lune','Mercure','Vénus','Mars'];
  const focus=typeof cr3FocusPlanets==='function'?cr3FocusPlanets(theme?.key||'insight'):[];
  const addHit=(date,na,q,priority)=>({tr,na,...q,tone:cr3TransitTone(q.name),first:new Date(date),last:new Date(date),bestDate:new Date(date),bestOrb:q.orb,priority,points:1});

  if(!window.end){
    const sky=planetLongitudes(window.start),hits=[];
    for(const na of natalPlanets){
      if(!Number.isFinite(sky.Pluton)||!Number.isFinite(natal[na]))continue;
      const q=aspect(sky.Pluton,natal[na]);
      if(!q||q.orb>4)continue;
      hits.push(addHit(window.start,na,q,(focus.includes('Pluton')||focus.includes(na))?2:0));
    }
    return hits;
  }

  const dates=cr3SampleDates(window),segments=[],active={};
  dates.forEach((date,di)=>{
    const sky=planetLongitudes(date),seen=new Set();
    natalPlanets.forEach(na=>{
      if(!Number.isFinite(sky.Pluton)||!Number.isFinite(natal[na]))return;
      const q=aspect(sky.Pluton,natal[na]);
      if(!q||q.orb>4)return;
      const key=`Pluton|${q.name}|${na}`;
      const priority=(focus.includes('Pluton')||focus.includes(na))?2:0;
      seen.add(key);
      let seg=active[key];
      if(!seg){
        seg=addHit(date,na,q,priority);seg.key=key;seg.lastIndex=di;active[key]=seg;segments.push(seg);
      }else if(di-seg.lastIndex<=1){
        seg.last=new Date(date);seg.lastIndex=di;seg.points++;
        if(q.orb<seg.bestOrb){seg.bestOrb=q.orb;seg.bestDate=new Date(date);}
        seg.priority=Math.max(seg.priority,priority);
      }else{
        const next=addHit(date,na,q,priority);next.key=key+'#'+di;next.lastIndex=di;active[key]=next;segments.push(next);
      }
    });
    Object.keys(active).forEach(k=>{if(!seen.has(k)&&active[k].lastIndex<di-1)delete active[k];});
  });
  return segments;
}

const cr41BaseAllTransitWindows=typeof cr37AllTransitWindows==='function'?cr37AllTransitWindows:null;
if(cr41BaseAllTransitWindows){
  cr37AllTransitWindows=function(a,theme,window){
    const base=cr41BaseAllTransitWindows(a,theme,window)||[];
    if(base.some(h=>h?.tr==='Pluton'))return base;
    return base.concat(cr41PlutoTransitWindows(a,theme,window));
  };
}

const cr41BaseQuestionWeight=typeof cr37QuestionWeight==='function'?cr37QuestionWeight:null;
if(cr41BaseQuestionWeight){
  cr37QuestionWeight=function(hit,intent){
    let w=cr41BaseQuestionWeight(hit,intent);
    if(hit?.tr==='Pluton'){
      w+=3;
      if(['Soleil','Lune'].includes(hit.na))w+=2;
      else if(['Mercure','Vénus','Mars'].includes(hit.na))w+=1;
      if((hit.bestOrb??99)<=1.5)w+=2;
      if(intent?.spiritual)w+=2;
      if(intent?.work&&['Soleil','Mars','Mercure'].includes(hit.na))w+=1;
      if(intent?.couple&&['Vénus','Lune','Mars'].includes(hit.na))w+=1;
    }
    return w;
  };
}

const cr41BaseImpactText=typeof cr37ImpactText==='function'?cr37ImpactText:null;
if(cr41BaseImpactText){
  cr37ImpactText=function(hit,intent,en=false){
    if(hit?.tr!=='Pluton')return cr41BaseImpactText(hit,intent,en);
    if(en){
      if(hit.tone==='support')return 'can support deep transformation, regeneration and lasting reconstruction';
      if(hit.tone==='challenge')return 'can put pressure on power dynamics, resistance to change and transformations that can no longer be postponed';
      return 'can strongly activate deep transformation, regeneration and a decisive change of direction';
    }
    if(hit.tone==='support')return 'peut soutenir une transformation profonde, la régénération et une reconstruction durable';
    if(hit.tone==='challenge')return 'peut mettre sous tension les rapports de force, les résistances au changement et les transformations qui ne peuvent plus être différées';
    return 'peut activer fortement une transformation profonde, la régénération et un changement de direction décisif';
  };
}

function cr41PatchAstroState(){
  try{
    if(!state?.astro?.birthUTC)return;
    if(!state.astro.planets)state.astro.planets={};
    if(!Number.isFinite(state.astro.planets.Pluton)){
      const birthSky=planetLongitudes(new Date(state.astro.birthUTC));
      if(Number.isFinite(birthSky?.Pluton))state.astro.planets.Pluton=birthSky.Pluton;
    }
    state.astro.now=planetLongitudes(new Date());
  }catch(e){}
}

const cr42BaseFormatAstroResult=typeof formatAstroResult==='function'?formatAstroResult:null;
if(cr42BaseFormatAstroResult){
  formatAstroResult=function(){
    cr41PatchAstroState();
    return cr42BaseFormatAstroResult.apply(this,arguments);
  };
}

(function cr42Refresh(){
  cr41PatchAstroState();
  try{
    const out=document.getElementById('astroResult');
    if(out&&state?.astro&&typeof formatAstroResult==='function')out.innerHTML=formatAstroResult();
    if(typeof renderSynthesis==='function')renderSynthesis();
  }catch(e){}
})();
