/* CRISTARIVA — dates de pics astrologiques distinctes v4.0
   Deux moments significatifs ne doivent pas être affichés le même jour.
   Pour les périodes finies, le moteur recherche le meilleur second pic sur
   une autre date ; pour les fenêtres spéciales, il supprime les doublons de jour. */
const CRISTARIVA_UNIQUE_PEAK_DATES_VERSION='4.0';

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
    /* IMPORTANT : previousRelevant contient le garde-fou chargé juste avant
       ce module. Pour les cartes Datation finies (sauf « Immédiat »), il
       exclut déjà le jour civil du tirage, affine le minimum d’orbe et ne
       conserve que de vrais pics futurs. On ne recalcule donc plus ici la
       sélection à partir des transits bruts, car cela annulait ce garde-fou. */
    const hits=previousRelevant(a,theme,window,intent)||[];
    const limit=typeof cr38WindowLimit==='function'?cr38WindowLimit(window):2;
    const selected=[];
    const usedDates=new Set();
    const usedTransit=new Set();

    for(const h of hits){
      if(selected.length>=limit)break;
      const date=dayKey(h.bestDate);
      if(!date||usedDates.has(date)||usedTransit.has(h.tr))continue;
      selected.push(h);
      usedDates.add(date);
      usedTransit.add(h.tr);
    }

    if(selected.length<limit){
      for(const h of hits){
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

/* CRISTARIVA — formulation nuancée des impacts de transit v4.3
   Remplace les verbes génériques répétés par une formulation propre à chaque planète. */
const CRISTARIVA_TRANSIT_LANGUAGE_VERSION='4.3';
(function(){
  if(typeof cr37ImpactText!=='function')return;
  const previousImpact=cr37ImpactText;
  const fr={
    Jupiter:{support:'favorise l’ouverture, renforce la confiance et élargit le champ des possibilités',challenge:'invite à ajuster le niveau de confiance et à évaluer les possibilités avec davantage de mesure',active:'amplifie l’ouverture, la confiance et le besoin d’élargir les possibilités'},
    Saturne:{support:'aide à consolider les limites utiles, la patience et la construction dans la durée',challenge:'demande davantage de patience, de réalisme et de solidité dans ce qui se construit',active:'accentue les questions de cadre, de responsabilité et de construction durable'},
    Uranus:{support:'favorise un changement libérateur et l’ouverture à une direction nouvelle',challenge:'bouscule les repères et peut provoquer des changements brusques, des revirements ou un besoin pressant de liberté',active:'accélère les changements, le besoin de liberté et les retournements de situation'},
    Neptune:{support:'renforce l’intuition et la réceptivité, à condition de garder un lien clair avec les faits',challenge:'rend plus délicate la distinction entre intuition, idéalisation et zones floues',active:'accentue l’intuition, l’imaginaire et la sensibilité aux zones encore indécises'},
    Mars:{support:'donne davantage d’élan au désir, à l’initiative et au passage à l’action',challenge:'rend les initiatives plus vives et demande de canaliser l’impatience ou les réactions trop rapides',active:'accentue le désir, l’initiative et la volonté de passer à l’action'},
    'Vénus':{support:'favorise l’attirance, le rapprochement et la recherche d’harmonie',challenge:'questionne l’équilibre entre attirance, attentes affectives et recherche d’harmonie',active:'met davantage l’accent sur l’attirance, le lien et le besoin d’harmonie'},
    Pluton:{support:'favorise une transformation profonde, la régénération et une reconstruction durable',challenge:'met au premier plan les rapports de force, les résistances au changement et les transformations devenues difficiles à différer',active:'intensifie les transformations profondes, la régénération et les changements de direction décisifs'}
  };
  const eng={
    Jupiter:{support:'encourages openness, strengthens confidence and broadens the range of possibilities',challenge:'calls for confidence and possibilities to be reassessed with greater measure',active:'amplifies openness, confidence and the need to broaden possibilities'},
    Saturne:{support:'helps consolidate useful boundaries, patience and long-term construction',challenge:'calls for more patience, realism and solidity in what is being built',active:'emphasises structure, responsibility and long-term construction'},
    Uranus:{support:'encourages liberating change and a new direction',challenge:'shakes up existing reference points and may bring abrupt changes, reversals or an urgent need for freedom',active:'accelerates change, the need for freedom and reversals of direction'},
    Neptune:{support:'strengthens intuition and receptivity, provided they remain connected to facts',challenge:'makes it more difficult to distinguish intuition, idealisation and ambiguity',active:'heightens intuition, imagination and sensitivity to what remains unclear'},
    Mars:{support:'gives more momentum to desire, initiative and action',challenge:'makes initiatives more forceful and calls for impatience or overly quick reactions to be channelled',active:'heightens desire, initiative and the urge to act'},
    'Vénus':{support:'favours attraction, rapprochement and the search for harmony',challenge:'questions the balance between attraction, emotional expectations and the search for harmony',active:'places greater emphasis on attraction, bonding and the need for harmony'},
    Pluton:{support:'supports deep transformation, regeneration and lasting reconstruction',challenge:'brings power dynamics, resistance to change and unavoidable transformations to the foreground',active:'intensifies deep transformation, regeneration and decisive changes of direction'}
  };

  cr37ImpactText=function(hit,intent,en=false){
    const set=(en?eng:fr)[hit?.tr];
    if(!set)return previousImpact(hit,intent,en);
    const key=hit?.tone==='support'?'support':hit?.tone==='challenge'?'challenge':'active';
    let text=set[key];
    if(intent?.sexual&&(['Vénus','Mars'].includes(hit?.tr)||['Vénus','Mars'].includes(hit?.na))){
      text+=en
        ?'; this period may affect attraction, desire or initiative, but it does not establish another person’s consent'
        :' ; cette période peut agir sur l’attirance, le désir ou l’initiative, sans permettre de déduire le consentement d’une autre personne';
    }
    return text;
  };

  try{
    const out=document.getElementById('astroResult');
    if(out&&state?.astro&&typeof formatAstroResult==='function')out.innerHTML=formatAstroResult();
    if(typeof renderSynthesis==='function')renderSynthesis();
  }catch(e){}
})();
