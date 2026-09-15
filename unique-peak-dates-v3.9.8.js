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

    // 1. Priorité à une planète différente ET une date différente.
    for(const h of unique){
      if(selected.length>=limit)break;
      const date=dayKey(h.bestDate);
      if(!date||usedDates.has(date)||usedTransit.has(h.tr))continue;
      selected.push(h);
      usedDates.add(date);
      usedTransit.add(h.tr);
    }

    // 2. Si nécessaire, accepter la même planète, mais jamais la même date.
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
