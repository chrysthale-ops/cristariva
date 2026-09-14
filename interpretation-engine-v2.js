/* CRISTARIVA — moteur astrologique et synthèse intégrée v3.0
   Le moteur narratif du tirage reste celui intégré à index.html.
   Cette extension restructure « Que disent les planètes ? » et relie
   thème natal, période définie par la carte Datation et cartes tirées. */
const CRISTARIVA_ASTRO_ENGINE_VERSION='3.0';

function cr3Escape(value){
  if(typeof readingEscape==='function') return readingEscape(value);
  return String(value||'').replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function cr3En(){return state.lang==='en';}
function cr3Date(date,en=cr3En()){
  if(!(date instanceof Date)||Number.isNaN(date.getTime()))return '';
  return new Intl.DateTimeFormat(en?'en-GB':'fr-FR',{day:'numeric',month:'long',year:'numeric'}).format(date);
}
function cr3ShortDate(date,en=cr3En()){
  if(!(date instanceof Date)||Number.isNaN(date.getTime()))return '';
  return new Intl.DateTimeFormat(en?'en-GB':'fr-FR',{day:'numeric',month:'short',year:'numeric'}).format(date);
}
function cr3AddDays(date,days){const d=new Date(date);d.setDate(d.getDate()+days);return d;}
function cr3AddMonths(date,months){const d=new Date(date);const day=d.getDate();d.setDate(1);d.setMonth(d.getMonth()+months);const last=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();d.setDate(Math.min(day,last));return d;}
function cr3AddYears(date,years){const d=new Date(date);d.setFullYear(d.getFullYear()+years);return d;}

const CR3_SIGN_META={
  'Bélier':{element:'Feu',mode:'Cardinal'},'Taureau':{element:'Terre',mode:'Fixe'},'Gémeaux':{element:'Air',mode:'Mutable'},
  'Cancer':{element:'Eau',mode:'Cardinal'},'Lion':{element:'Feu',mode:'Fixe'},'Vierge':{element:'Terre',mode:'Mutable'},
  'Balance':{element:'Air',mode:'Cardinal'},'Scorpion':{element:'Eau',mode:'Fixe'},'Sagittaire':{element:'Feu',mode:'Mutable'},
  'Capricorne':{element:'Terre',mode:'Cardinal'},'Verseau':{element:'Air',mode:'Fixe'},'Poissons':{element:'Eau',mode:'Mutable'}
};
const CR3_ELEMENT_TEXT={
  Feu:{fr:'énergique, intuitif dans l’action et porté vers l’initiative',en:'energetic, action-oriented and naturally drawn to initiative'},
  Terre:{fr:'pragmatique, concret et attentif à ce qui peut durer',en:'pragmatic, concrete and attentive to what can last'},
  Air:{fr:'mental, relationnel et stimulé par les idées, les échanges et la compréhension',en:'mental, relational and stimulated by ideas, exchange and understanding'},
  Eau:{fr:'sensible, réceptif et attentif aux liens, aux émotions et aux nuances',en:'sensitive, receptive and attentive to bonds, emotions and nuance'}
};
const CR3_MODE_TEXT={
  Cardinal:{fr:'Vous avez tendance à initier, décider et mettre les choses en mouvement.',en:'You tend to initiate, decide and set things in motion.'},
  Fixe:{fr:'Vous cherchez la continuité, l’intensité et la stabilité avant de changer de cap.',en:'You seek continuity, intensity and stability before changing direction.'},
  Mutable:{fr:'Vous vous adaptez facilement et cherchez à comprendre comment évoluer avec les circonstances.',en:'You adapt readily and look for ways to evolve with circumstances.'}
};
const CR3_PROFILE_NAMES={
  'Feu|Cardinal':['Initiateur passionné','Passionate initiator'],'Feu|Fixe':['Rayonnant déterminé','Determined creator'],'Feu|Mutable':['Explorateur inspiré','Inspired explorer'],
  'Terre|Cardinal':['Bâtisseur pragmatique','Pragmatic builder'],'Terre|Fixe':['Gardien stable','Steady guardian'],'Terre|Mutable':['Analyste adaptable','Adaptable analyst'],
  'Air|Cardinal':['Médiateur initiateur','Initiating mediator'],'Air|Fixe':['Penseur indépendant','Independent thinker'],'Air|Mutable':['Communicant curieux','Curious communicator'],
  'Eau|Cardinal':['Protecteur intuitif','Intuitive protector'],'Eau|Fixe':['Intuitif profond','Deep intuitive'],'Eau|Mutable':['Réceptif imaginatif','Imaginative receiver']
};
const CR3_SIGN_EN={'Bélier':'Aries','Taureau':'Taurus','Gémeaux':'Gemini','Cancer':'Cancer','Lion':'Leo','Vierge':'Virgo','Balance':'Libra','Scorpion':'Scorpio','Sagittaire':'Sagittarius','Capricorne':'Capricorn','Verseau':'Aquarius','Poissons':'Pisces'};
const CR3_PLANET_EN={'Soleil':'Sun','Lune':'Moon','Mercure':'Mercury','Vénus':'Venus','Mars':'Mars','Jupiter':'Jupiter','Saturne':'Saturn','Uranus':'Uranus','Neptune':'Neptune'};
const CR3_ASPECT_EN={'conjonction':'conjunction','opposition':'opposition','trigone':'trine','carré':'square','sextile':'sextile'};
function cr3Sign(sign,en=cr3En()){return en?(CR3_SIGN_EN[sign]||sign):sign;}
function cr3Planet(name,en=cr3En()){return en?(CR3_PLANET_EN[name]||name):name;}
function cr3Aspect(name,en=cr3En()){return en?(CR3_ASPECT_EN[name]||name):name;}

function cr3NatalData(a){
  const placements=[];
  const add=(planet,lon)=>{if(Number.isFinite(lon)){const z=zodiac(lon);placements.push({planet,sign:z.sign,lon});}};
  ['Soleil','Lune','Mercure','Vénus','Mars','Jupiter','Saturne'].forEach(p=>add(p,a.planets?.[p]));
  if(a.asc?.sign) placements.push({planet:'Ascendant',sign:a.asc.sign,lon:null});
  const elements={Feu:0,Terre:0,Air:0,Eau:0},modes={Cardinal:0,Fixe:0,Mutable:0};
  placements.forEach(p=>{const m=CR3_SIGN_META[p.sign];if(m){elements[m.element]++;modes[m.mode]++;}});
  const dominantElement=Object.keys(elements).sort((x,y)=>elements[y]-elements[x])[0]||a.dominant||'Eau';
  const dominantMode=Object.keys(modes).sort((x,y)=>modes[y]-modes[x])[0]||'Mutable';
  const profile=CR3_PROFILE_NAMES[dominantElement+'|'+dominantMode]||['Profil nuancé','Nuanced profile'];
  return {placements,elements,modes,dominantElement,dominantMode,profile};
}
function cr3NatalAspects(a){
  const p=a.planets||{},pairs=[['Soleil','Lune'],['Soleil','Mercure'],['Soleil','Vénus'],['Soleil','Mars'],['Soleil','Saturne'],['Lune','Vénus'],['Lune','Mars'],['Mercure','Saturne'],['Vénus','Mars']];
  const out=[];
  pairs.forEach(([x,y])=>{if(Number.isFinite(p[x])&&Number.isFinite(p[y])){const q=aspect(p[x],p[y]);if(q)out.push({x,y,...q});}});
  return out.sort((x,y)=>x.orb-y.orb).slice(0,5);
}
function cr3TraitSentence(a,en=cr3En()){
  const d=cr3NatalData(a),sun=a.sun?.sign||zodiac(a.planets.Soleil).sign,moon=a.moon?.sign||zodiac(a.planets.Lune).sign;
  const toneSun=SIGN_TONE?.[sun]||'',toneMoon=SIGN_TONE?.[moon]||'';
  const asc=a.asc?.sign;
  if(en){
    const el=CR3_ELEMENT_TEXT[d.dominantElement]?.en||'';
    return `Your chart combines a <b>${cr3Sign(sun,true)} Sun</b>, a <b>${cr3Sign(moon,true)} Moon</b>${asc?` and a <b>${cr3Sign(asc,true)} Ascendant</b>`:''}. The dominant element is <b>${d.dominantElement}</b>: your general style is ${el}. ${CR3_MODE_TEXT[d.dominantMode]?.en||''}`;
  }
  return `Votre thème associe un <b>Soleil en ${cr3Sign(sun)}</b>, qui donne une expression ${cr3Escape(toneSun)}, à une <b>Lune en ${cr3Sign(moon)}</b>, qui colore la sensibilité d’une tonalité ${cr3Escape(toneMoon)}${asc?`, avec un <b>Ascendant ${cr3Sign(asc)}</b> qui influence votre manière spontanée d’entrer dans le monde`:''}. La dominante <b>${d.dominantElement}</b> décrit un tempérament ${CR3_ELEMENT_TEXT[d.dominantElement]?.fr||'nuancé'}. ${CR3_MODE_TEXT[d.dominantMode]?.fr||''}`;
}
function cr3PersonalityDetails(a,en=cr3En()){
  const p=a.planets||{},rows=[];
  const push=(title,text)=>rows.push(`<div class="cr3-trait"><b>${cr3Escape(title)}</b><span>${text}</span></div>`);
  const s=p.Mercure?zodiac(p.Mercure).sign:null,v=p.Vénus?zodiac(p.Vénus).sign:null,m=p.Mars?zodiac(p.Mars).sign:null;
  if(en){
    if(s)push('Mind & communication',`Mercury in <b>${cr3Sign(s,true)}</b> describes how you organise ideas, speak and decide.`);
    if(v)push('Bonds & values',`Venus in <b>${cr3Sign(v,true)}</b> colours attraction, attachment and what makes a relationship feel worthwhile.`);
    if(m)push('Drive & action',`Mars in <b>${cr3Sign(m,true)}</b> shows how you act, assert yourself and pursue desire.`);
  }else{
    if(s)push('Pensée & communication',`Mercure en <b>${cr3Sign(s)}</b> décrit votre manière d’organiser les idées, de communiquer et de prendre une décision.`);
    if(v)push('Liens & valeurs',`Vénus en <b>${cr3Sign(v)}</b> colore l’attachement, l’attirance et ce qui donne de la valeur à une relation.`);
    if(m)push('Élan & action',`Mars en <b>${cr3Sign(m)}</b> montre comment vous passez à l’action, affirmez vos besoins et poursuivez un désir.`);
  }
  return rows.join('');
}
function cr3NatalAspectsHtml(a,en=cr3En()){
  const items=cr3NatalAspects(a);
  if(!items.length)return '';
  const intro=en?'The most visible natal dynamics are':'Les dynamiques natales les plus visibles sont';
  return `<p class="cr3-aspects"><b>${intro} :</b> ${items.map(h=>`${cr3Planet(h.x,en)} ${cr3Aspect(h.name,en)} ${cr3Planet(h.y,en)} <span class="muted">(${h.orb.toFixed(1)}°)</span>`).join(' · ')}.</p>`;
}

function cr3ReadingMoment(){
  if(state.readingAt instanceof Date&&!Number.isNaN(state.readingAt.getTime()))return new Date(state.readingAt);
  const stored=sessionStorage.getItem('cristariva-reading-at');
  if(stored){const d=new Date(stored);if(!Number.isNaN(d.getTime()))return d;}
  const d=new Date();state.readingAt=d;return d;
}
function cr3NextSeasonEnd(start){
  const y=start.getFullYear();
  const boundaries=[new Date(y,2,20,12),new Date(y,5,21,12),new Date(y,8,22,12),new Date(y,11,21,12),new Date(y+1,2,20,12),new Date(y+1,5,21,12)];
  const nextIndex=boundaries.findIndex(d=>d>start);
  if(nextIndex<0)return cr3AddMonths(start,6);
  return boundaries[nextIndex+1]||cr3AddMonths(boundaries[nextIndex],3);
}
function cr3TimingWindow(card,start=cr3ReadingMoment(),en=cr3En()){
  if(!card)return {start,end:null,open:true,label:en?'No Timing card has been drawn yet.':'Aucune carte Datation n’a encore été tirée.',card:null};
  let end=null,open=false;
  switch(Number(card.id)){
    case 116:end=cr3AddDays(start,3);break;
    case 117:end=cr3AddDays(start,3);break;
    case 118:end=cr3AddDays(start,7);break;
    case 119:end=cr3AddDays(start,15);break;
    case 120:end=cr3AddDays(start,21);break;
    case 121:end=cr3AddMonths(start,1);break;
    case 122:end=cr3AddDays(start,42);break;
    case 123:end=cr3AddMonths(start,2);break;
    case 124:end=cr3AddMonths(start,3);break;
    case 125:end=cr3AddMonths(start,6);break;
    case 126:end=cr3AddMonths(start,9);break;
    case 127:end=cr3AddYears(start,1);break;
    case 128:end=cr3NextSeasonEnd(start);break;
    case 129:case 130:open=true;break;
    default:open=true;
  }
  const cardLabel=typeof cardName==='function'?cardName(card):(en?(card.en?.name||card.name):card.name);
  let label='';
  if(end)label=en?`From ${cr3Date(start,true)} to ${cr3Date(end,true)}, according to the “${cardLabel}” Timing card.`:`Du ${cr3Date(start)} au ${cr3Date(end)}, selon la carte Datation « ${cardLabel} ».`;
  else if(Number(card.id)===129)label=en?`The “${cardLabel}” card gives no fixed end date: the period remains open until the triggering event occurs.`:`La carte « ${cardLabel} » ne donne pas de date de fin fixe : la période reste ouverte jusqu’à l’événement déclencheur.`;
  else label=en?`The “${cardLabel}” card does not provide a reliable end date; no artificial astrological deadline is created.`:`La carte « ${cardLabel} » ne permet pas de fixer une fin fiable ; aucune échéance astrologique artificielle n’est ajoutée.`;
  return {start,end,open,label,card};
}
function cr3TransitTone(name){if(name==='trigone'||name==='sextile')return 'support';if(name==='carré'||name==='opposition')return 'challenge';return 'intensify';}
function cr3FocusPlanets(theme){
  const map={separation:['Saturne','Vénus'],truth:['Mercure','Saturne'],block:['Saturne','Mars'],bond:['Vénus','Lune'],opening:['Jupiter','Uranus'],choice:['Mercure','Saturne'],past:['Lune','Saturne'],time:['Saturne','Lune'],strength:['Mars','Saturne'],feeling:['Vénus','Lune'],movement:['Uranus','Jupiter'],spiritual:['Neptune','Lune'],insight:['Soleil','Lune']};
  return map[theme]||map.insight;
}
function cr3ThemeInfo(card,en=cr3En()){
  if(!card)return {key:'insight',label:en?'a new understanding':'une nouvelle compréhension'};
  try{const r=readingTheme(card);return {key:r[1],label:en?r[3]:r[2]};}catch(e){return {key:'insight',label:en?'a new understanding':'une nouvelle compréhension'};}
}
function cr3DominantTheme(cards,en=cr3En()){
  if(!cards?.length)return {key:'insight',label:en?'a new understanding':'une nouvelle compréhension'};
  const scores={};
  cards.forEach((c,i)=>{const t=cr3ThemeInfo(c,en);scores[t.key]=(scores[t.key]||0)+(i===cards.length-1?2:1);});
  const key=Object.keys(scores).sort((a,b)=>scores[b]-scores[a])[0];
  const match=[...cards].reverse().map(c=>cr3ThemeInfo(c,en)).find(t=>t.key===key);
  return match||cr3ThemeInfo(cards[cards.length-1],en);
}
function cr3SampleDates(window){
  if(!window.end)return [window.start];
  const days=Math.max(1,Math.ceil((window.end-window.start)/86400000));
  const step=days<=10?1:days<=35?2:days<=90?4:days<=180?7:14;
  const dates=[];
  for(let d=0;d<=days;d+=step)dates.push(cr3AddDays(window.start,d));
  if(dates[dates.length-1]<window.end)dates.push(new Date(window.end));
  return dates;
}
function cr3TransitWindows(a,theme,window){
  const focus=cr3FocusPlanets(theme?.key||'insight'),natal=a.planets||{},segments=[],active={};
  const dates=cr3SampleDates(window);
  const transiting=['Jupiter','Saturne','Uranus','Neptune','Mars','Vénus'];
  const natalPlanets=['Soleil','Lune','Mercure','Vénus','Mars'];
  dates.forEach((date,di)=>{
    const sky=planetLongitudes(date),seen=new Set();
    transiting.forEach(tr=>natalPlanets.forEach(na=>{
      if(!Number.isFinite(sky[tr])||!Number.isFinite(natal[na]))return;
      const q=aspect(sky[tr],natal[na]);if(!q||q.orb>6)return;
      const key=`${tr}|${q.name}|${na}`,priority=(focus.includes(tr)||focus.includes(na))?2:0;
      seen.add(key);
      let seg=active[key];
      if(!seg){seg={key,tr,na,name:q.name,tone:cr3TransitTone(q.name),first:new Date(date),last:new Date(date),bestDate:new Date(date),bestOrb:q.orb,priority,points:1,lastIndex:di};active[key]=seg;segments.push(seg);}
      else if(di-seg.lastIndex<=1){seg.last=new Date(date);seg.lastIndex=di;seg.points++;if(q.orb<seg.bestOrb){seg.bestOrb=q.orb;seg.bestDate=new Date(date);}seg.priority=Math.max(seg.priority,priority);}
      else{const next={key:key+'#'+di,tr,na,name:q.name,tone:cr3TransitTone(q.name),first:new Date(date),last:new Date(date),bestDate:new Date(date),bestOrb:q.orb,priority,points:1,lastIndex:di};active[key]=next;segments.push(next);}
    }));
    Object.keys(active).forEach(k=>{if(!seen.has(k)&&active[k].lastIndex<di-1)delete active[k];});
  });
  return segments.sort((x,y)=>y.priority-x.priority||x.bestOrb-y.bestOrb||y.points-x.points).slice(0,6);
}
function cr3TransitImpact(hit,en=cr3En()){
  const tr=cr3Planet(hit.tr,en),na=cr3Planet(hit.na,en),asp=cr3Aspect(hit.name,en);
  const theme=PLANET_MEANING?.[hit.tr]||'';
  if(en){
    if(hit.tone==='support')return `<b>${tr} ${asp} natal ${na}</b> supports a smoother expression of the themes involved.`;
    if(hit.tone==='challenge')return `<b>${tr} ${asp} natal ${na}</b> creates friction and asks for adjustment, patience or a clearer choice.`;
    return `<b>${tr} ${asp} natal ${na}</b> strongly activates the theme without fixing the outcome.`;
  }
  if(hit.tone==='support')return `<b>${tr} ${asp} ${na} natal</b> facilite une expression plus fluide du thème concerné${theme?` (${cr3Escape(theme)})`:''}.`;
  if(hit.tone==='challenge')return `<b>${tr} ${asp} ${na} natal</b> crée une tension dynamique : elle demande ajustement, patience ou clarification${theme?` autour de ${cr3Escape(theme)}`:''}.`;
  return `<b>${tr} ${asp} ${na} natal</b> active fortement le thème concerné sans décider à lui seul de l’issue.`;
}
function cr3RangeLabel(hit,en=cr3En()){
  if(Math.abs(hit.last-hit.first)<86400000*1.2)return en?`around ${cr3ShortDate(hit.bestDate,true)}`:`autour du ${cr3ShortDate(hit.bestDate)}`;
  return en?`${cr3ShortDate(hit.first,true)} → ${cr3ShortDate(hit.last,true)}`:`${cr3ShortDate(hit.first)} → ${cr3ShortDate(hit.last)}`;
}
function cr3PeriodSummary(a,theme,window,en=cr3En()){
  if(!window.card)return {hits:[],text:en?'Draw a Timing card first to define the period whose planetary influences should be studied.':'Tirez d’abord une carte Datation pour définir la période dont les influences planétaires doivent être étudiées.'};
  if(!window.end){
    const sky=planetLongitudes(window.start),hits=[];
    try{for(const tr of ['Jupiter','Saturne','Uranus','Neptune','Mars','Vénus'])for(const na of ['Soleil','Lune','Mercure','Vénus','Mars']){const q=aspect(sky[tr],a.planets[na]);if(q&&q.orb<=6)hits.push({tr,na,...q,tone:cr3TransitTone(q.name),first:window.start,last:window.start,bestDate:window.start,bestOrb:q.orb,priority:0,points:1});}}catch(e){}
    hits.sort((x,y)=>x.bestOrb-y.bestOrb);
    return {hits:hits.slice(0,4),text:en?'Because the Timing card has no fixed endpoint, only the sky at the start of the reading and the durable background influences are interpreted.':'La carte Datation n’ayant pas de borne finale, le ciel du début du tirage et les influences de fond durables sont interprétés, sans inventer de date de sortie.'};
  }
  const hits=cr3TransitWindows(a,theme,window);
  if(!hits.length)return {hits,text:en?'No close major transit is detected over this interval by the simplified model. The period is therefore read mainly through its general planetary climate.':'Aucun transit majeur serré n’est détecté sur cette fenêtre par le modèle simplifié. La période est donc lue surtout à travers son climat planétaire général.'};
  const support=hits.filter(h=>h.tone==='support').length,challenge=hits.filter(h=>h.tone==='challenge').length;
  let text='';
  if(en)text=support>challenge?'The interval contains more supportive than challenging markers among the selected major transits.':challenge>support?'The interval contains more adjustment points than easy-flow markers among the selected major transits.':'The interval mixes supportive phases with phases that require adjustment.';
  else text=support>challenge?'La période contient davantage de points d’appui que de tensions parmi les transits majeurs retenus.':challenge>support?'La période comporte davantage de phases d’ajustement que de phases fluides parmi les transits majeurs retenus.':'La période alterne des phases de soutien et des moments qui demandent davantage d’ajustement.';
  return {hits,text};
}

function cr3AstroMarkup(a){
  if(!a)return '';
  const en=cr3En(),d=cr3NatalData(a),window=cr3TimingWindow(state.date,cr3ReadingMoment(),en),theme=cr3DominantTheme(state.draw||[],en),period=cr3PeriodSummary(a,theme,window,en);
  const profileName=d.profile[en?1:0];
  let html=`<div class="cr3-astro" data-astro-engine="${CRISTARIVA_ASTRO_ENGINE_VERSION}">`;
  html+=`<section class="cr3-astro-part"><div class="cr3-kicker">${en?'1 · Birth chart':'1 · Thème astral à la naissance'}</div><h4>${en?'Personality and main character traits':'Personnalité et principaux traits de caractère'}</h4>`;
  html+=`<div class="cr3-profile"><div><span>${en?'Astrological personality type':'Type de personnalité astrologique'}</span><strong>${cr3Escape(profileName)}</strong></div><div><span>${en?'Dominant element':'Élément dominant'}</span><strong>${cr3Escape(d.dominantElement)}</strong></div><div><span>${en?'Dominant mode':'Mode dominant'}</span><strong>${cr3Escape(d.dominantMode)}</strong></div></div>`;
  html+=`<p>${cr3TraitSentence(a,en)}</p><div class="cr3-traits">${cr3PersonalityDetails(a,en)}</div>${cr3NatalAspectsHtml(a,en)}`;
  if(!a.birthTimeKnown)html+=`<p class="muted">${en?'Birth time is unknown: the Ascendant and house structure are not interpreted.':'L’heure de naissance est inconnue : l’Ascendant et la structure des maisons ne sont pas interprétés.'}</p>`;
  html+=`</section>`;
  html+=`<section class="cr3-astro-part"><div class="cr3-kicker">${en?'2 · Planetary influences during the reading period':'2 · Position des astres et influences sur la période du tirage'}</div><h4>${en?'From the reading to the Timing-card horizon':'Du moment du tirage jusqu’à l’horizon de la carte Datation'}</h4><p class="cr3-period-label">${cr3Escape(window.label)}</p>`;
  if(!state.date)html+=`<div class="cr3-empty">${en?'Draw a Timing card above; this second section will then analyse the whole corresponding period.':'Tirez une carte Datation ci-dessus : cette seconde partie analysera alors toute la période correspondante.'}</div>`;
  else{
    html+=`<p>${period.text}</p>`;
    if(period.hits.length){html+=`<div class="cr3-timeline">${period.hits.map(h=>`<div class="cr3-transit"><time>${cr3Escape(cr3RangeLabel(h,en))}</time><p>${cr3TransitImpact(h,en)}</p></div>`).join('')}</div>`;}
  }
  html+=`</section><p class="muted cr3-method">${en?'Tropical geocentric calculation using the simplified astronomical model already built into Cristariva. Astrology is used here as a symbolic reading framework, not as a guaranteed prediction.':'Calcul tropical géocentrique fondé sur le modèle astronomique simplifié déjà intégré à Cristariva. L’astrologie est utilisée comme cadre symbolique d’interprétation et non comme garantie qu’un événement précis se produira.'}</p></div>`;
  return html;
}

function cr3Polarity(card){const c=String(card?.category||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');if(c.includes('positive'))return 1;if(c.includes('negative'))return -1;return 0;}
function cr3Trend(cards,en=cr3En()){
  if(!cards?.length)return en?'The reading remains open.':'Le tirage reste ouvert.';
  let score=0,weight=0;cards.forEach((c,i)=>{const w=i===cards.length-1?2:1;score+=cr3Polarity(c)*w;weight+=w;});score/=Math.max(1,weight);
  if(en)return score>.2?'The card movement is broadly constructive, although its conditions still matter.':score<-.2?'The card movement is constrained and first asks for clarity about the obstacles.':'The cards describe a nuanced, conditional evolution rather than a single straight line.';
  return score>.2?'La dynamique des cartes est globalement constructive, tout en restant conditionnée par ce qui doit réellement se mettre en place.':score<-.2?'La dynamique des cartes reste contrainte et demande d’abord de regarder clairement les obstacles ou limites.':'Les cartes décrivent une évolution nuancée et conditionnelle plutôt qu’une trajectoire unique et automatique.';
}
function cr3CardReading(card,en=cr3En()){
  if(!card)return '';
  try{if(typeof preciseReading==='function')return preciseReading(card,typeof preciseQuestionFocus==='function'?preciseQuestionFocus():'life',en);}catch(e){}
  if(!en&&card.group==='main'&&typeof domainReading==='function')return domainReading(card)||card.definition||'';
  return en?(card.en?.definition||card.definition||''):(card.definition||'');
}
function cr3NarrativeBridge(a,cards,theme,window,period,en=cr3En()){
  const d=cr3NatalData(a),profile=d.profile[en?1:0],first=cards[0],last=cards[cards.length-1];
  const firstName=first?(typeof cardName==='function'?cardName(first):first.name):'',lastName=last?(typeof cardName==='function'?cardName(last):last.name):'';
  const strongest=period.hits[0];
  const timing=state.date?(typeof cardName==='function'?cardName(state.date):state.date.name):'';
  if(en){
    let s=`The cards move from <b>${cr3Escape(firstName)}</b> toward <b>${cr3Escape(lastName)}</b>, placing ${cr3Escape(theme.label)} at the centre of the question. Your natal profile — <b>${cr3Escape(profile)}</b> — describes the personal style through which you are likely to experience this story: ${CR3_ELEMENT_TEXT[d.dominantElement]?.en||'with a nuanced temperament'}. `;
    if(state.date)s+=`The Timing card <b>${cr3Escape(timing)}</b> defines the horizon studied by the planetary section. `;
    if(strongest)s+=`Within that interval, the clearest astrological marker is ${cr3TransitImpact(strongest,true)} `;
    else if(state.date)s+=`${period.text} `;
    s+=`In other words, the birth chart explains <i>how you tend to live the situation</i>, the transits describe <i>when the climate is more fluid or more demanding</i>, and the cards keep the main symbolic direction. ${cr3Trend(cards,true)}`;
    return s;
  }
  let s=`Les cartes conduisent de <b>${cr3Escape(firstName)}</b> vers <b>${cr3Escape(lastName)}</b> et placent ${cr3Escape(theme.label)} au cœur de la question. Votre thème natal — profil <b>${cr3Escape(profile)}</b> — décrit la manière personnelle dont vous êtes susceptible de vivre cette histoire : ${CR3_ELEMENT_TEXT[d.dominantElement]?.fr||'avec un tempérament nuancé'}. `;
  if(state.date)s+=`La carte Datation <b>${cr3Escape(timing)}</b> fixe l’horizon sur lequel le ciel est relu. `;
  if(strongest)s+=`À l’intérieur de cette période, le marqueur astrologique le plus net est le suivant : ${cr3TransitImpact(strongest,false)} `;
  else if(state.date)s+=`${period.text} `;
  s+=`Ainsi, le thème natal explique surtout <i>comment vous abordez et ressentez la situation</i>, les transits indiquent <i>à quels moments le climat est plus fluide ou plus exigeant</i>, tandis que les cartes conservent la direction symbolique principale. ${cr3Trend(cards,false)}`;
  return s;
}
function cr3Complement(en=cr3En()){
  const parts=[];
  if(state.relation){const n=typeof cardName==='function'?cardName(state.relation):state.relation.name;const def=en?(state.relation.en?.definition||state.relation.definition):state.relation.definition;parts.push(en?`The Relationship card <b>${cr3Escape(n)}</b> adds this relational role: ${cr3Escape(def)}.`:`La carte Relation <b>${cr3Escape(n)}</b> ajoute ce rôle dans l’histoire : ${cr3Escape(def)}.`);}
  if(state.date){const n=typeof cardName==='function'?cardName(state.date):state.date.name;parts.push(en?`The Timing card <b>${cr3Escape(n)}</b> is used here not only as a symbolic deadline, but as the actual interval over which the transits are examined.`:`La carte Datation <b>${cr3Escape(n)}</b> n’est plus seulement citée comme délai symbolique : elle définit réellement l’intervalle sur lequel les transits sont examinés.`);}
  return parts.join(' ');
}

function cr3Synthesis(a){
  const en=cr3En(),cards=state.draw||[];if(!cards.length)return '';
  const theme=cr3DominantTheme(cards,en),question=cr3Escape(state.question||(en?'Open question':'Question ouverte'));
  const domain=cr3Escape(en?(DOMAIN_EN?.[state.domain]||state.domain):state.domain);
  const first=cards[0],last=cards[cards.length-1],firstRead=cr3CardReading(first,en),lastRead=cards.length>1?cr3CardReading(last,en):'';
  let html=`<div class="story-reading cr3-global" data-astro-engine="${CRISTARIVA_ASTRO_ENGINE_VERSION}"><h3>${en?'Cristariva — global synthesis':'CRISTARIVA — synthèse générale'}</h3><div class="reading-context"><b>${en?'Question':'Question'} :</b> « ${question} »<br><b>${en?'Area':'Domaine'} :</b> ${domain}</div>`;
  html+=`<h4>${en?'What the cards are telling':'Ce que racontent les cartes'}</h4><p>${en?'The reading opens with':'Le récit s’ouvre avec'} <b>${cr3Escape(typeof cardName==='function'?cardName(first):first.name)}</b> : ${cr3Escape(firstRead)}${lastRead?` ${en?'Its direction is gathered by':'La direction se rassemble ensuite dans'} <b>${cr3Escape(typeof cardName==='function'?cardName(last):last.name)}</b> : ${cr3Escape(lastRead)}`:''}</p>`;
  const complement=cr3Complement(en);if(complement)html+=`<p>${complement}</p>`;
  if(a){
    const window=cr3TimingWindow(state.date,cr3ReadingMoment(),en),period=cr3PeriodSummary(a,theme,window,en);
    html+=`<h4>${en?'1 · Birth chart: how you live the question':'1 · Thème natal : votre manière de vivre la question'}</h4><p>${cr3TraitSentence(a,en)} ${en?'This profile does not change the meaning of the cards; it describes the personal lens through which their themes may resonate.':'Ce profil ne change pas le sens des cartes : il décrit le filtre personnel à travers lequel leurs thèmes peuvent résonner.'}</p>`;
    html+=`<h4>${en?'2 · Planetary period: the rhythm of the story':'2 · Période planétaire : le rythme de l’histoire'}</h4><p>${cr3Escape(window.label)} ${period.text}</p>`;
    if(period.hits.length)html+=`<p>${period.hits.slice(0,3).map(h=>`${cr3Escape(cr3RangeLabel(h,en))} : ${cr3TransitImpact(h,en)}`).join(' ')}</p>`;
    html+=`<div class="cr3-global-story"><h4>${en?'The combined story':'Le récit global'}</h4><p>${cr3NarrativeBridge(a,cards,theme,window,period,en)}</p></div>`;
  }else{
    html+=`<p class="muted">${en?'Add your birth data in “What do the planets say?” to incorporate both the natal personality profile and planetary influences over the Timing-card period.':'Ajoutez vos données de naissance dans « Que disent les planètes ? » pour intégrer à la synthèse à la fois le profil natal de personnalité et les influences planétaires sur toute la période de la carte Datation.'}</p>`;
  }
  html+=`</div>`;return html;
}

/* Override the two public rendering points used by index.html. */
formatAstroResult=function(){return state.astro?cr3AstroMarkup(state.astro):'';};
renderSynthesis=function(){if(!state.draw.length)return;const box=document.querySelector('#synthesis');if(!box)return;box.innerHTML=cr3Synthesis(state.astro);box.classList.remove('hidden');};

(function cr3Install(){
  const style=document.createElement('style');style.id='cristariva-astro-v3-styles';style.textContent=`
  #deepening .optional.cr3-layout{grid-template-columns:repeat(2,minmax(0,1fr));align-items:start}
  #deepening .cr3-astro-section{grid-column:1/-1;padding:clamp(20px,3vw,30px);border-color:#c9ab78;background:linear-gradient(180deg,#fff,#fbf6ed)}
  #deepening .cr3-astro-section>h3{font-size:1.55rem;margin-bottom:.35rem}
  #deepening .cr3-astro-section>.muted:first-of-type{max-width:850px}
  .cr3-astro{margin-top:18px;display:grid;gap:18px}.cr3-astro-part{padding:20px;border:1px solid #dfd2bf;border-radius:18px;background:#fff}
  .cr3-kicker{font-size:.76rem;letter-spacing:.12em;text-transform:uppercase;font-weight:800;color:#8a642e;margin-bottom:7px}.cr3-astro-part h4{font:1.35rem Georgia,serif;margin:.2rem 0 1rem;color:#17324d}
  .cr3-profile{display:grid;grid-template-columns:2fr 1fr 1fr;gap:10px;margin:0 0 16px}.cr3-profile>div{padding:13px;border-radius:13px;background:#f3eee6}.cr3-profile span{display:block;font-size:.73rem;color:#68717c;margin-bottom:4px}.cr3-profile strong{font-family:Georgia,serif;color:#17324d}
  .cr3-traits{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:14px 0}.cr3-trait{padding:13px;border-radius:13px;background:#edf2f6}.cr3-trait b{display:block;color:#6b4b1f;margin-bottom:5px}.cr3-trait span{font-size:.88rem;line-height:1.55}
  .cr3-aspects{line-height:1.65}.cr3-period-label{padding:11px 13px;border-radius:12px;background:#f7f0e5;border-left:4px solid #c89a58}.cr3-empty{padding:16px;border:1px dashed #c9ab78;border-radius:14px;background:#fffbf4;color:#6d5b43}
  .cr3-timeline{display:grid;gap:10px;margin-top:14px}.cr3-transit{display:grid;grid-template-columns:minmax(145px,.32fr) 1fr;gap:14px;padding:13px 15px;border-radius:13px;background:#edf2f6}.cr3-transit time{font-weight:800;color:#7b5725}.cr3-transit p{margin:0;line-height:1.55}.cr3-method{margin:0 4px}.cr3-global-story{margin-top:18px;padding:17px;border-radius:15px;background:#17324d;color:#f9f3e8}.cr3-global-story h4{color:#f0d49c!important;margin-top:0!important}.cr3-global-story p{margin-bottom:0}.cr3-global h4{font:1.08rem Georgia,serif;margin:1.35em 0 .45em;color:#17324d}
  @media(max-width:800px){#deepening .optional.cr3-layout{grid-template-columns:1fr}.cr3-profile,.cr3-traits{grid-template-columns:1fr}.cr3-transit{grid-template-columns:1fr;gap:5px}}
  `;document.head.appendChild(style);
  const astroBtn=document.getElementById('astroBtn'),dateBtn=document.getElementById('dateBtn'),drawBtn=document.getElementById('drawBtn'),langBtn=document.getElementById('langBtn');
  const astroOpt=astroBtn?.closest('.opt');if(astroOpt){astroOpt.classList.add('cr3-astro-section');astroOpt.parentElement?.classList.add('cr3-layout');}
  function localize(){
    if(!astroOpt)return;const en=cr3En(),h=astroOpt.querySelector('h3'),p=astroOpt.querySelector(':scope > p.muted');
    if(h){h.removeAttribute('data-i18n');h.textContent=en?'What do the planets say?':'Que disent les planètes ?';}
    if(p){p.removeAttribute('data-i18n');p.textContent=en?'Two connected readings: your birth-chart personality, then the planetary influences from the reading to the horizon defined by the Timing card.':'Deux lectures reliées : votre personnalité dans le thème natal, puis les influences planétaires depuis le tirage jusqu’à l’horizon défini par la carte Datation.';}
    if(astroBtn){astroBtn.removeAttribute('data-i18n');astroBtn.textContent=en?'Analyse my chart and the period':'Analyser mon thème et la période';}
  }
  localize();
  drawBtn?.addEventListener('click',()=>{const d=new Date();state.readingAt=d;sessionStorage.setItem('cristariva-reading-at',d.toISOString());});
  dateBtn?.addEventListener('click',()=>setTimeout(()=>{if(state.astro){const box=document.getElementById('astroResult');if(box){box.style.display='block';box.innerHTML=cr3AstroMarkup(state.astro);}}},0));
  langBtn?.addEventListener('click',()=>setTimeout(()=>{localize();if(state.astro){const box=document.getElementById('astroResult');if(box)box.innerHTML=cr3AstroMarkup(state.astro);}if(!document.getElementById('synthesis')?.classList.contains('hidden'))renderSynthesis();},0));
})();