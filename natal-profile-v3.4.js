/* CRISTARIVA — portrait natal littéraire v3.4
   Met le Soleil, la Lune et l'Ascendant au premier plan, puis construit
   un portrait global : caractère, forces, fragilités et particularités du thème. */
const CRISTARIVA_NATAL_PROFILE_VERSION='3.4';

const CR34_SIGN_PROFILE={
  'Bélier':{core:'spontané, franc, volontaire et porté vers l’initiative',strength:'le courage d’agir, la franchise et la capacité à repartir vite',weak:'l’impatience, les réactions trop immédiates et la difficulté à temporiser',emotion:'des émotions directes, rapides et difficiles à dissimuler',appearance:'une présence énergique, vive et entreprenante'},
  'Taureau':{core:'stable, concret, sensuel et attaché à ce qui peut durer',strength:'la constance, la loyauté et le sens du réel',weak:'la résistance au changement, l’entêtement et le besoin de sécurité',emotion:'un besoin profond de stabilité, de fidélité et de repères affectifs',appearance:'une présence calme, rassurante et posée'},
  'Gémeaux':{core:'curieux, mobile, sociable et stimulé par les idées',strength:'l’adaptabilité, la vivacité d’esprit et le talent pour communiquer',weak:'la dispersion, l’instabilité et la difficulté à rester longtemps sur une seule direction',emotion:'un besoin de comprendre et de verbaliser ce qui est ressenti',appearance:'une présence vive, curieuse et facilement accessible'},
  'Cancer':{core:'sensible, protecteur, intuitif et très réceptif à l’ambiance',strength:'l’empathie, la mémoire affective et la capacité à protéger',weak:'l’hypersensibilité, le repli et la difficulté à lâcher certaines blessures',emotion:'une vie intérieure intense, attachée aux liens et à la sécurité émotionnelle',appearance:'une présence douce, prudente et attentive'},
  'Lion':{core:'chaleureux, créatif, fier et désireux d’exprimer pleinement sa personnalité',strength:'le rayonnement, la générosité et la confiance créative',weak:'la susceptibilité, le besoin de reconnaissance et une certaine difficulté à céder',emotion:'un besoin d’être aimé avec chaleur, loyauté et démonstration',appearance:'une présence forte, expressive et naturellement visible'},
  'Vierge':{core:'observateur, précis, pragmatique et soucieux d’améliorer ce qui peut l’être',strength:'le discernement, la fiabilité et le sens du détail',weak:'l’autocritique, l’inquiétude et une tendance à vouloir trop contrôler les détails',emotion:'des émotions analysées avant d’être pleinement exprimées',appearance:'une présence discrète, attentive et maîtrisée'},
  'Balance':{core:'relationnel, diplomate, sensible à l’équilibre et au regard de l’autre',strength:'le tact, le sens de la justice et la capacité à créer de l’harmonie',weak:'l’hésitation, l’évitement du conflit et la difficulté à trancher lorsqu’un choix déplaît',emotion:'un besoin d’harmonie, de réciprocité et de dialogue dans les liens',appearance:'une présence sociable, élégante et conciliante'},
  'Scorpion':{core:'intense, lucide, secret et profondément engagé lorsqu’il accorde sa confiance',strength:'la profondeur, la résistance et la capacité de transformation',weak:'la méfiance, l’excès de contrôle et la difficulté à oublier certaines blessures',emotion:'des émotions puissantes, rarement superficielles et vécues avec intensité',appearance:'une présence magnétique, réservée et difficile à lire immédiatement'},
  'Sagittaire':{core:'ouvert, enthousiaste, indépendant et orienté vers le sens et l’exploration',strength:'l’optimisme, la vision d’ensemble et l’élan vers de nouvelles possibilités',weak:'l’impatience face aux contraintes, l’excès de confiance et le besoin de liberté',emotion:'un besoin d’espace, de mouvement et de sens pour rester intérieurement vivant',appearance:'une présence ouverte, spontanée et volontiers expansive'},
  'Capricorne':{core:'structuré, responsable, ambitieux et attentif à construire dans la durée',strength:'la persévérance, le sérieux et la capacité à tenir un cap',weak:'la dureté envers soi-même, la retenue émotionnelle et le pessimisme lorsqu’une situation semble bloquée',emotion:'des sentiments profonds mais souvent contenus ou protégés',appearance:'une présence réservée, fiable et maîtrisée'},
  'Verseau':{core:'indépendant, original, cérébral et attiré par ce qui sort des cadres habituels',strength:'l’inventivité, l’autonomie et la capacité à penser autrement',weak:'la distance émotionnelle, l’imprévisibilité et le refus des contraintes trop fortes',emotion:'un besoin de liberté intérieure et de recul avant de se livrer complètement',appearance:'une présence singulière, indépendante et parfois déroutante'},
  'Poissons':{core:'intuitif, imaginatif, empathique et très sensible aux atmosphères',strength:'l’intuition, la compassion et la richesse de l’imaginaire',weak:'la perméabilité émotionnelle, l’idéalisation et la difficulté à poser des limites nettes',emotion:'une grande réceptivité, avec des sentiments subtils, profonds et parfois difficiles à définir',appearance:'une présence douce, réceptive et légèrement insaisissable'}
};

function cr34SignProfile(sign){return CR34_SIGN_PROFILE[sign]||{core:'nuancé et complexe',strength:'la capacité d’adaptation',weak:'une tendance à hésiter lorsque plusieurs besoins s’opposent',emotion:'une sensibilité nuancée',appearance:'une présence personnelle difficile à réduire à une seule étiquette'};}
function cr34PlanetSign(a,p){const v=a?.planets?.[p];return Number.isFinite(v)?zodiac(v).sign:null;}
function cr34AllPlanetNames(a){return ['Soleil','Lune','Mercure','Vénus','Mars','Jupiter','Saturne','Uranus','Neptune','Pluton'].filter(p=>Number.isFinite(a?.planets?.[p]));}
function cr34AllPlacements(a){return cr34AllPlanetNames(a).map(p=>({planet:p,sign:cr34PlanetSign(a,p),lon:a.planets[p]}));}

function cr34BigThree(a,en=cr3En()){
  const sun=a.sun?.sign||cr34PlanetSign(a,'Soleil');
  const moon=a.moon?.sign||cr34PlanetSign(a,'Lune');
  const asc=a.asc?.sign||null;
  if(en)return {sun,moon,asc};
  return {sun,moon,asc};
}

function cr34PlanetClause(a,p){
  const sign=cr34PlanetSign(a,p);if(!sign)return '';
  const sp=cr34SignProfile(sign);
  const map={
    Mercure:`Votre pensée et votre manière de communiquer prennent une coloration ${sp.core}. Cela influence directement votre façon d’analyser une situation, de parler et de décider.`,
    'Vénus':`Dans les liens et les valeurs, vous recherchez une qualité ${sp.core}. Cette position colore la manière dont vous vous attachez, ce qui vous attire et ce qui vous paraît précieux dans une relation.`,
    Mars:`Votre manière d’agir, de défendre vos besoins et de poursuivre un désir est plutôt ${sp.core}. Elle montre comment votre énergie se mobilise lorsqu’il faut passer de l’intention à l’action.`,
    Jupiter:`Votre confiance grandit surtout lorsque vous pouvez exprimer un fonctionnement ${sp.core}. C’est l’un des ressorts de votre capacité à élargir vos possibilités et à croire en une évolution favorable.`,
    Saturne:`Votre sens de l’effort et de la responsabilité se construit sur un mode ${sp.core}. Cette position montre aussi le domaine intérieur où vous pouvez être le plus exigeant avec vous-même avant d’acquérir une véritable solidité.`,
    Uranus:`Votre besoin d’indépendance et de renouvellement possède une tonalité ${sp.core}. Il peut vous pousser à rompre avec une situation devenue trop étroite ou trop prévisible.`,
    Neptune:`Votre imaginaire, votre intuition et votre rapport à l’idéal prennent une forme ${sp.core}. Cela augmente la finesse de perception mais peut aussi accentuer l’idéalisation lorsque les faits sont encore incertains.`,
    Pluton:`Votre manière de traverser les crises, les remises en question et les transformations profondes est ${sp.core}. Cette position donne de l’intensité aux périodes où vous devez abandonner une ancienne façon d’être pour en construire une autre.`
  };
  return map[p]||'';
}

function cr34Dominance(a){
  const placements=cr34AllPlacements(a);
  const big=cr34BigThree(a,false);
  if(big.asc)placements.push({planet:'Ascendant',sign:big.asc});
  const elements={Feu:0,Terre:0,Air:0,Eau:0},modes={Cardinal:0,Fixe:0,Mutable:0},signs={};
  placements.forEach(x=>{const m=CR3_SIGN_META?.[x.sign];if(m){elements[m.element]++;modes[m.mode]++;}signs[x.sign]=(signs[x.sign]||0)+1;});
  const element=Object.entries(elements).sort((a,b)=>b[1]-a[1])[0];
  const mode=Object.entries(modes).sort((a,b)=>b[1]-a[1])[0];
  const sign=Object.entries(signs).sort((a,b)=>b[1]-a[1])[0];
  return {elements,modes,signs,element,mode,sign,total:placements.length};
}

function cr34AllTightAspects(a){
  const names=cr34AllPlanetNames(a),out=[];
  for(let i=0;i<names.length;i++)for(let j=i+1;j<names.length;j++){
    const x=names[i],y=names[j];
    try{const q=aspect(a.planets[x],a.planets[y]);if(q&&Number.isFinite(q.orb)&&q.orb<=2.2)out.push({x,y,...q});}catch(e){}
  }
  return out.sort((x,y)=>x.orb-y.orb);
}

function cr34SpecialFeatures(a){
  const f=[],big=cr34BigThree(a,false),d=cr34Dominance(a),tight=cr34AllTightAspects(a);
  if(big.sun&&big.moon&&big.sun===big.moon)f.push(`Votre Soleil et votre Lune se trouvent dans le même signe, ${big.sun}. Votre volonté consciente et votre vie émotionnelle parlent donc largement le même langage : vous pouvez paraître très cohérent et entier, mais aussi avoir plus de difficulté à prendre du recul lorsque vous êtes profondément engagé.`);
  if(big.asc&&big.sun&&big.asc===big.sun)f.push(`Votre Ascendant renforce directement votre Soleil en ${big.sun}. Ce que vous êtes au fond et ce que vous montrez spontanément aux autres se ressemblent fortement : votre personnalité est lisible, affirmée et relativement peu dissociée entre l’intérieur et l’extérieur.`);
  else if(big.asc&&big.moon&&big.asc===big.moon)f.push(`Votre Ascendant reprend le signe de votre Lune, ${big.moon}. Votre sensibilité transparaît plus facilement dans votre comportement qu’elle ne le fait chez beaucoup de personnes : vos réactions émotionnelles participent directement à l’image que vous donnez.`);
  const bigElements=[big.sun,big.moon,big.asc].filter(Boolean).map(s=>CR3_SIGN_META?.[s]?.element).filter(Boolean);
  if(bigElements.length>=2){const counts={};bigElements.forEach(e=>counts[e]=(counts[e]||0)+1);const top=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0];if(top&&top[1]>=2)f.push(`Deux${bigElements.length===3&&top[1]===3?' des trois piliers':' au moins'} du trio Soleil–Lune–Ascendant appartiennent à l’élément ${top[0]}. Cette cohérence renforce nettement votre manière instinctive de fonctionner et donne davantage de poids à cette tonalité dans votre caractère.`);}
  if(d.sign&&d.sign[1]>=3)f.push(`Le signe ${d.sign[0]} est particulièrement concentré dans votre thème (${d.sign[1]} facteurs majeurs disponibles). Cela accentue ses qualités mais aussi ses excès : les traits ${cr34SignProfile(d.sign[0]).core} deviennent une signature importante de votre personnalité.`);
  if(d.element&&d.total>=5&&d.element[1]>=Math.ceil(d.total*0.45))f.push(`L’élément ${d.element[0]} domine nettement l’ensemble du thème. Cette dominante agit comme une toile de fond permanente : elle renforce ${CR3_ELEMENT_TEXT?.[d.element[0]]?.fr||'une manière de fonctionner très marquée'} et peut parfois rendre les qualités des autres éléments moins spontanées.`);
  const personal=new Set(['Soleil','Lune','Mercure','Vénus','Mars']);
  const exact=tight.find(x=>personal.has(x.x)||personal.has(x.y));
  if(exact){const label=typeof cr31AspectLabel==='function'?cr31AspectLabel(exact,false):`${exact.x} et ${exact.y}`;const effect=CR31_ASPECT_EFFECT?.[exact.name]?.fr||'forment une dynamique très forte';f.push(`Une dynamique natale particulièrement serrée relie ${exact.x} et ${exact.y} (${exact.orb.toFixed(1)}°). Concrètement, ${label.toLowerCase()} ${effect}; cette interaction est assez forte pour devenir un trait récurrent de votre manière de réagir et de faire des choix.`);}
  return f.slice(0,3);
}

function cr34CharacterText(a){
  const {sun,moon,asc}=cr34BigThree(a,false),s=cr34SignProfile(sun),m=cr34SignProfile(moon),ac=asc?cr34SignProfile(asc):null,d=cr34Dominance(a);
  let t=`Votre personnalité s’organise d’abord autour d’un <b>Soleil en ${cr3Escape(sun||'signe non déterminé')}</b> : au cœur de votre caractère, vous êtes ${cr3Escape(s.core)}. `;
  if(moon)t+=`Votre <b>Lune en ${cr3Escape(moon)}</b> apporte ${cr3Escape(m.emotion)}. Elle décrit ce que vous ressentez avant même de l’expliquer et ce dont vous avez besoin pour vous sentir intérieurement en sécurité. `;
  if(asc)t+=`Votre <b>Ascendant ${cr3Escape(asc)}</b> donne à votre comportement visible ${cr3Escape(ac.appearance)}. Il nuance la première impression que vous produisez et la façon dont vous entrez spontanément dans les situations. `;
  else t+=`L’heure de naissance ne permettant pas de déterminer l’Ascendant avec fiabilité, la lecture de la personnalité s’appuie ici sur les autres facteurs du thème. `;
  if(d.element)t+=`Dans l’ensemble, la dominante ${cr3Escape(d.element[0])} donne une couleur générale ${cr3Escape(CR3_ELEMENT_TEXT?.[d.element[0]]?.fr||'très marquée')} à votre manière d’être.`;
  return t;
}

function cr34IntegratedPlanets(a){
  const parts=['Mercure','Vénus','Mars','Jupiter','Saturne','Uranus','Neptune','Pluton'].map(p=>cr34PlanetClause(a,p)).filter(Boolean);
  if(!parts.length)return '';
  return `<p>${parts.join(' ')}</p>`;
}

function cr34StrengthsWeaknesses(a){
  const {sun,moon,asc}=cr34BigThree(a,false),s=cr34SignProfile(sun),m=cr34SignProfile(moon),ac=asc?cr34SignProfile(asc):null,d=cr34Dominance(a);
  const strengths=[s.strength];if(moon&&m.strength!==s.strength)strengths.push(m.strength);if(ac&&ac.strength!==s.strength&&ac.strength!==m.strength)strengths.push(ac.strength);
  const weaknesses=[s.weak];if(moon&&m.weak!==s.weak)weaknesses.push(m.weak);if(ac&&ac.weak!==s.weak&&ac.weak!==m.weak)weaknesses.push(ac.weak);
  if(d.mode?.[0]==='Fixe')weaknesses.push('une tendance à maintenir une position longtemps, même lorsque la situation réclame davantage de souplesse');
  if(d.mode?.[0]==='Mutable')strengths.push('une bonne capacité d’adaptation lorsque les circonstances changent');
  if(d.mode?.[0]==='Cardinal')strengths.push('une aptitude naturelle à initier, décider et mettre les choses en mouvement');
  return `<div class="cr34-balance"><div><h5>Forces</h5><p>${strengths.slice(0,4).map(x=>cr3Escape(x)).join(' ; ')}.</p></div><div><h5>Faiblesses et points de vigilance</h5><p>${weaknesses.slice(0,4).map(x=>cr3Escape(x)).join(' ; ')}.</p></div></div>`;
}

function cr34BigThreeHtml(a){
  const {sun,moon,asc}=cr34BigThree(a,false);
  const cards=[
    ['☉','Signe solaire',sun,sun?'Votre identité consciente, votre volonté et la direction que vous cherchez à donner à votre vie.':'Non déterminé'],
    ['☽','Signe lunaire',moon,moon?'Votre sensibilité, vos réactions instinctives et vos besoins émotionnels.':'Non déterminé'],
    ['↑','Ascendant',asc,asc?'Votre manière d’entrer dans le monde, l’image spontanée que vous donnez et votre style d’action immédiat.':'Heure de naissance nécessaire pour une lecture fiable.']
  ];
  return `<div class="cr34-big3">${cards.map(([icon,title,sign,desc])=>`<div class="cr34-pillar"><span class="cr34-symbol">${icon}</span><small>${title}</small><strong>${cr3Escape(sign||'—')}</strong><p>${cr3Escape(desc)}</p></div>`).join('')}</div>`;
}

function cr34NatalSection(a){
  const features=cr34SpecialFeatures(a);
  let html=`<div class="cr3-kicker">1 · Thème astral à la naissance</div><h4>Votre personnalité astrologique</h4>`;
  html+=cr34BigThreeHtml(a);
  html+=`<div class="cr34-portrait"><h5>Votre caractère</h5><p>${cr34CharacterText(a)}</p>${cr34IntegratedPlanets(a)}</div>`;
  html+=cr34StrengthsWeaknesses(a);
  if(features.length)html+=`<div class="cr34-special"><h5>Ce qui distingue particulièrement votre thème</h5>${features.map(x=>`<p>${x}</p>`).join('')}</div>`;
  return html;
}

const cr34PreviousAstroMarkup=cr3AstroMarkup;
cr3AstroMarkup=function(a){
  const html=cr34PreviousAstroMarkup(a);if(!a)return html;
  const tpl=document.createElement('template');tpl.innerHTML=html;
  const first=tpl.content.querySelector('.cr3-astro-part');
  if(first)first.innerHTML=cr34NatalSection(a);
  return tpl.innerHTML;
};
formatAstroResult=function(){return state.astro?cr3AstroMarkup(state.astro):'';};

(function cr34Refresh(){
  const style=document.createElement('style');
  style.textContent=`
  .cr34-big3{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:14px 0 20px}
  .cr34-pillar{position:relative;padding:18px;border-radius:16px;background:linear-gradient(145deg,#f8f1e7,#edf2f6);border:1px solid #dfd2bf;min-height:170px}
  .cr34-symbol{font:1.65rem Georgia,serif;color:#9b6b2d;display:block;margin-bottom:7px}.cr34-pillar small{display:block;color:#6d7580;text-transform:uppercase;letter-spacing:.08em;font-weight:800;font-size:.69rem}.cr34-pillar strong{display:block;font:1.45rem Georgia,serif;color:#17324d;margin:.22rem 0 .5rem}.cr34-pillar p{font-size:.86rem;line-height:1.55;margin:0;color:#4f5965}
  .cr34-portrait{padding:18px 2px 4px;line-height:1.78}.cr34-portrait h5,.cr34-balance h5,.cr34-special h5{font:1.08rem Georgia,serif;color:#6b4b1f;margin:.2rem 0 .55rem}.cr34-portrait p{margin:.65rem 0}
  .cr34-balance{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:15px 0}.cr34-balance>div{padding:15px;border-radius:14px;background:#f3eee6}.cr34-balance p{margin:0;line-height:1.65}
  .cr34-special{margin-top:16px;padding:16px 18px;border-radius:14px;background:#17324d;color:#f9f3e8}.cr34-special h5{color:#f0d49c}.cr34-special p{margin:.65rem 0;line-height:1.68}
  @media(max-width:800px){.cr34-big3,.cr34-balance{grid-template-columns:1fr}.cr34-pillar{min-height:0}}
  `;
  document.head.appendChild(style);
  const out=document.getElementById('astroResult');if(out&&state.astro)out.innerHTML=formatAstroResult();
  if(typeof renderSynthesis==='function')renderSynthesis();
})();
