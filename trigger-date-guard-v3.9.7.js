/* CRISTARIVA — garde-fou date du tirage pour Déclencheur v3.9.7
   La carte Déclencheur ne doit jamais présenter le jour civil du tirage
   comme moment astrologique significatif. Seuls les pics strictement
   postérieurs au jour du tirage peuvent être retenus. */
const CRISTARIVA_TRIGGER_DATE_GUARD_VERSION='3.9.7';

(function(){
  if(typeof cr37RelevantWindows!=='function')return;

  function cr397IsTrigger(window){
    const card=window?.card||state?.date;
    return Number(card?.id||0)===129;
  }

  function cr397NextCalendarDay(date){
    const d=new Date(date);
    return new Date(d.getFullYear(),d.getMonth(),d.getDate()+1,0,0,0,0);
  }

  function cr397FutureTriggerWindows(a,theme,window,intent){
    if(typeof cr395TriggerTransitWindows!=='function'||typeof cr395IsLocalPeak!=='function')return [];
    const all=cr395TriggerTransitWindows(a,theme,window);
    const cutoff=cr397NextCalendarDay(window.start);
    const ranked=all.map(h=>({hit:h,weight:cr37QuestionWeight(h,intent)}))
      .filter(x=>x.weight>=5||x.hit.priority>=2)
      .filter(x=>new Date(x.hit.bestDate)>=cutoff)
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
      const key=[h.tr,h.name,h.na,+new Date(h.bestDate)].join('|');
      if(seen.has(key))continue;
      seen.add(key);
      selected.push(h);
      if(selected.length>=2)break;
    }
    return selected;
  }

  const previousRelevant=cr37RelevantWindows;
  cr37RelevantWindows=function(a,theme,window,intent){
    if(!cr397IsTrigger(window))return previousRelevant(a,theme,window,intent);
    return cr397FutureTriggerWindows(a,theme,window,intent);
  };

  if(typeof cr362Timing==='function'&&typeof cr37WindowsText==='function'){
    cr362Timing=function(a,en=false){return cr37WindowsText(a,en);};
  }

  const out=document.getElementById('astroResult');
  if(out&&state?.astro&&typeof formatAstroResult==='function')out.innerHTML=formatAstroResult();
  if(typeof renderSynthesis==='function')renderSynthesis();
})();
