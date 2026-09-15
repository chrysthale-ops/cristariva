/* CRISTARIVA — portrait natal littéraire v3.4.1
   Version compacte : phrases plus naturelles, moins de qualificatifs en cascade. */
const CRISTARIVA_NATAL_PROFILE_VERSION='3.4.1';

const CR34_SIGN_PROFILE={
  'Bélier':{
    core:'spontané et entreprenant',
    strength:'le courage d’agir, la franchise et la capacité à repartir vite',
    weak:'l’impatience, les réactions trop immédiates et la difficulté à temporiser',
    identity:'Vous avez besoin d’agir, de décider et de sentir que les choses avancent.',
    emotion:'un besoin d’émotions franches et de réactions spontanées',
    appearance:'une présence vive et directe',
    mind:'votre pensée va droit au but et décide rapidement',
    relation:'vous appréciez les liens francs, vivants et sans ambiguïté',
    action:'vous passez facilement de l’idée à l’action',
    growth:'votre confiance grandit lorsque vous osez prendre l’initiative',
    effort:'vous progressez en vous donnant un objectif clair à atteindre',
    freedom:'vous avez besoin de garder une réelle marge d’action',
    ideal:'votre imagination se nourrit de défis et de perspectives nouvelles',
    transform:'les changements importants vous poussent à repartir sur de nouvelles bases'
  },
  'Taureau':{
    core:'stable et constant',
    strength:'la constance, la loyauté et le sens du réel',
    weak:'la résistance au changement, l’entêtement et le besoin de sécurité',
    identity:'Vous recherchez ce qui est fiable, concret et capable de durer.',
    emotion:'un besoin profond de stabilité et de repères affectifs',
    appearance:'une présence calme et posée',
    mind:'vous réfléchissez de façon concrète et prenez le temps de vérifier',
    relation:'vous recherchez des liens solides et rassurants',
    action:'vous avancez avec constance plutôt qu’avec précipitation',
    growth:'votre confiance grandit lorsque vous voyez vos efforts porter leurs fruits',
    effort:'vous construisez votre solidité par la patience et la régularité',
    freedom:'vous changez surtout lorsque la nouvelle direction vous paraît sûre',
    ideal:'votre imagination reste liée à ce qui peut réellement prendre forme',
    transform:'vous traversez les changements en cherchant rapidement de nouveaux repères'
  },
  'Gémeaux':{
    core:'curieux et adaptable',
    strength:'l’adaptabilité, la vivacité d’esprit et le talent pour communiquer',
    weak:'la dispersion, l’instabilité et la difficulté à rester longtemps sur une seule direction',
    identity:'Vous avez besoin de comprendre, d’échanger et de rester stimulé intellectuellement.',
    emotion:'un besoin de mettre des mots sur ce que vous ressentez',
    appearance:'une présence vive et accessible',
    mind:'votre pensée est mobile et fait rapidement des liens entre les idées',
    relation:'vous avez besoin d’échanges, de curiosité et de complicité',
    action:'vous agissez plus facilement lorsque la situation reste stimulante',
    growth:'votre confiance grandit lorsque vous apprenez ou découvrez quelque chose de nouveau',
    effort:'vous gagnez en solidité lorsque vous concentrez votre attention',
    freedom:'vous avez besoin de mouvement et de variété',
    ideal:'votre imagination fonctionne par associations, idées et possibilités',
    transform:'les changements vous conduisent souvent à revoir votre façon de penser'
  },
  'Cancer':{
    core:'sensible et protecteur',
    strength:'l’empathie, la mémoire affective et la capacité à protéger',
    weak:'l’hypersensibilité, le repli et la difficulté à lâcher certaines blessures',
    identity:'Vous êtes très sensible aux liens, aux ambiances et au sentiment de sécurité.',
    emotion:'un besoin fort de sécurité émotionnelle et de proximité',
    appearance:'une présence douce et prudente',
    mind:'vous comprenez souvent une situation à partir de ce qu’elle vous fait ressentir',
    relation:'vous recherchez des liens chaleureux dans lesquels la confiance peut s’installer',
    action:'vous vous mobilisez surtout pour protéger ce qui compte à vos yeux',
    growth:'votre confiance grandit lorsque vous vous sentez soutenu et entouré',
    effort:'vous avancez mieux lorsque vous pouvez donner du sens affectif à vos efforts',
    freedom:'vous avez besoin d’évoluer sans perdre complètement vos repères',
    ideal:'votre imaginaire est nourri par la mémoire et la vie intérieure',
    transform:'les changements profonds vous amènent à redéfinir ce qui vous sécurise'
  },
  'Lion':{
    core:'chaleureux et affirmé',
    strength:'le rayonnement, la générosité et la confiance créative',
    weak:'la susceptibilité, le besoin de reconnaissance et une certaine difficulté à céder',
    identity:'Vous avez besoin d’exprimer pleinement votre personnalité et d’être reconnu pour ce que vous apportez.',
    emotion:'un besoin d’affection claire et de chaleur dans les liens',
    appearance:'une présence expressive et visible',
    mind:'vous pensez avec assurance lorsque vous pouvez défendre une idée qui vous tient à cœur',
    relation:'vous recherchez des liens chaleureux où l’admiration et la loyauté comptent',
    action:'vous agissez avec énergie lorsque vous pouvez prendre votre place',
    growth:'votre confiance grandit lorsque vous osez montrer vos talents',
    effort:'vous tenez mieux dans la durée lorsque votre engagement a du sens pour vous',
    freedom:'vous avez besoin de créer et de décider sans vous sentir diminué',
    ideal:'votre imagination cherche à donner de l’ampleur à ce que vous ressentez',
    transform:'les remises en question vous poussent à retrouver une expression plus authentique de vous-même'
  },
  'Vierge':{
    core:'observateur et méthodique',
    strength:'le discernement, la fiabilité et le sens du détail',
    weak:'l’autocritique, l’inquiétude et une tendance à vouloir trop contrôler les détails',
    identity:'Vous cherchez à comprendre, organiser et améliorer ce qui vous entoure.',
    emotion:'un besoin de comprendre ce que vous ressentez avant de l’exprimer',
    appearance:'une présence discrète et attentive',
    mind:'vous analysez les situations avec précision avant de vous prononcer',
    relation:'vous accordez de l’importance à la fiabilité et aux gestes concrets',
    action:'vous avancez avec méthode et cherchez l’efficacité',
    growth:'votre confiance grandit lorsque vous constatez que votre méthode fonctionne',
    effort:'vous construisez votre solidité grâce à la rigueur et à l’expérience',
    freedom:'vous changez plus facilement lorsque la nouvelle organisation vous paraît cohérente',
    ideal:'votre imagination reste lucide et cherche à distinguer le possible du souhaitable',
    transform:'les changements vous conduisent à revoir vos habitudes et vos priorités'
  },
  'Balance':{
    core:'diplomate et relationnel',
    strength:'le tact, le sens de la justice et la capacité à créer de l’harmonie',
    weak:'l’hésitation, l’évitement du conflit et la difficulté à trancher lorsqu’un choix déplaît',
    identity:'Vous avez besoin d’équilibre, de dialogue et de relations harmonieuses.',
    emotion:'un besoin d’harmonie et de réciprocité dans les liens',
    appearance:'une présence sociable et conciliante',
    mind:'vous pesez les différents points de vue avant de conclure',
    relation:'vous recherchez l’équilibre et une vraie qualité d’échange',
    action:'vous agissez plus facilement lorsqu’un accord semble possible',
    growth:'votre confiance grandit lorsque vous créez des liens utiles et équilibrés',
    effort:'vous gagnez en solidité lorsque vous assumez clairement vos choix',
    freedom:'vous avez besoin d’évoluer sans perdre le sens du lien',
    ideal:'votre imagination recherche naturellement l’harmonie',
    transform:'les crises vous obligent surtout à redéfinir vos équilibres relationnels'
  },
  'Scorpion':{
    core:'intense et lucide',
    strength:'la profondeur, la résistance et la capacité de transformation',
    weak:'la méfiance, l’excès de contrôle et la difficulté à oublier certaines blessures',
    identity:'Vous vivez les choses en profondeur et accordez une grande importance à la confiance.',
    emotion:'des émotions fortes que vous ne montrez pas toujours immédiatement',
    appearance:'une présence réservée et magnétique',
    mind:'vous cherchez ce qui se cache derrière les apparences',
    relation:'vous recherchez des liens profonds où la confiance est essentielle',
    action:'vous agissez avec intensité lorsqu’un enjeu vous paraît important',
    growth:'votre confiance grandit lorsque vous transformez une difficulté en force',
    effort:'vous faites preuve d’une grande endurance lorsque vous avez décidé de tenir',
    freedom:'vous avez besoin de garder la maîtrise de ce que vous révélez et de ce que vous choisissez',
    ideal:'votre intuition est fine et repère facilement les non-dits',
    transform:'les périodes de crise deviennent souvent des étapes de transformation profonde'
  },
  'Sagittaire':{
    core:'ouvert et indépendant',
    strength:'l’optimisme, la vision d’ensemble et l’élan vers de nouvelles possibilités',
    weak:'l’impatience face aux contraintes, l’excès de confiance et le besoin de liberté',
    identity:'Vous avez besoin d’espace, de sens et de perspectives nouvelles.',
    emotion:'un besoin de mouvement et de liberté pour rester intérieurement vivant',
    appearance:'une présence ouverte et spontanée',
    mind:'vous pensez en termes de possibilités et de vision d’ensemble',
    relation:'vous appréciez les liens qui laissent respirer et qui ouvrent de nouveaux horizons',
    action:'vous vous mobilisez facilement pour un projet qui élargit vos perspectives',
    growth:'votre confiance grandit lorsque vous pouvez explorer et apprendre',
    effort:'vous tenez mieux dans la durée lorsque vous comprenez le sens de ce que vous faites',
    freedom:'vous avez besoin de conserver votre autonomie',
    ideal:'votre imagination se projette volontiers vers l’avenir',
    transform:'les changements importants vous poussent à chercher un nouveau sens à votre trajectoire'
  },
  'Capricorne':{
    core:'structuré et persévérant',
    strength:'la persévérance, le sérieux et la capacité à tenir un cap',
    weak:'la dureté envers soi-même, la retenue émotionnelle et le pessimisme lorsqu’une situation semble bloquée',
    identity:'Vous avancez mieux lorsque vous pouvez construire quelque chose de solide et durable.',
    emotion:'des sentiments profonds que vous avez tendance à contenir',
    appearance:'une présence réservée et fiable',
    mind:'vous réfléchissez de façon structurée et gardez le sens des priorités',
    relation:'vous accordez de la valeur à la loyauté et à la continuité',
    action:'vous avancez avec patience et détermination',
    growth:'votre confiance grandit lorsque vos efforts produisent des résultats concrets',
    effort:'vous construisez votre solidité par la discipline et la constance',
    freedom:'vous changez surtout lorsque la nouvelle direction paraît viable',
    ideal:'votre imagination cherche une forme utile et réalisable',
    transform:'les changements vous poussent à reconstruire sur des bases plus solides'
  },
  'Verseau':{
    core:'indépendant et original',
    strength:'l’inventivité, l’autonomie et la capacité à penser autrement',
    weak:'la distance émotionnelle, l’imprévisibilité et le refus des contraintes trop fortes',
    identity:'Vous avez besoin de liberté de pensée et d’une manière personnelle d’aborder les situations.',
    emotion:'un besoin de recul et d’autonomie intérieure',
    appearance:'une présence singulière et indépendante',
    mind:'vous aimez envisager les choses autrement et remettre les habitudes en question',
    relation:'vous recherchez des liens libres, sincères et stimulants intellectuellement',
    action:'vous agissez mieux lorsque vous pouvez suivre votre propre logique',
    growth:'votre confiance grandit lorsque vous innovez ou sortez d’un cadre devenu trop étroit',
    effort:'vous progressez lorsque vous acceptez de donner une continuité à vos idées',
    freedom:'vous avez un fort besoin d’indépendance',
    ideal:'votre imagination se nourrit d’idées nouvelles et de futurs possibles',
    transform:'les changements vous conduisent à vous détacher de ce qui ne vous correspond plus'
  },
  'Poissons':{
    core:'intuitif et réceptif',
    strength:'l’intuition, la compassion et la richesse de l’imaginaire',
    weak:'la perméabilité émotionnelle, l’idéalisation et la difficulté à poser des limites nettes',
    identity:'Vous fonctionnez beaucoup à l’intuition et percevez facilement les ambiances comme les émotions des autres.',
    emotion:'un besoin de douceur, de sécurité affective et d’un climat émotionnel apaisé',
    appearance:'une présence douce et réceptive',
    mind:'votre pensée fonctionne beaucoup par intuition et par impressions',
    relation:'vous recherchez des liens sensibles dans lesquels vous pouvez vous sentir compris',
    action:'vous agissez fortement en fonction de votre ressenti',
    growth:'votre confiance grandit lorsque vous donnez une forme concrète à votre intuition',
    effort:'vous gagnez en solidité lorsque vous structurez ce qui vous tient à cœur',
    freedom:'vous avez besoin de préserver une vraie liberté intérieure',
    ideal:'votre imagination est riche et peut parfois idéaliser ce qui reste incertain',
    transform:'les changements profonds vous poussent à mieux distinguer intuition et projection'
  }
};

function cr34SignProfile(sign){
  return CR34_SIGN_PROFILE[sign]||{
    core:'nuancé',strength:'la capacité d’adaptation',weak:'une tendance à hésiter lorsque plusieurs besoins s’opposent',
    identity:'Votre personnalité reste difficile à réduire à une seule tendance.',emotion:'un besoin émotionnel nuancé',appearance:'une présence personnelle',
    mind:'votre pensée s’adapte au contexte',relation:'vous recherchez des liens équilibrés',action:'vous adaptez votre manière d’agir à la situation',
    growth:'votre confiance grandit avec l’expérience',effort:'vous consolidez vos acquis avec le temps',freedom:'vous avez besoin de garder une part d’autonomie',
    ideal:'votre imagination reste sensible au contexte',transform:'les changements vous amènent à redéfinir vos priorités'
  };
}
function cr34PlanetSign(a,p){const v=a?.planets?.[p];return Number.isFinite(v)?zodiac(v).sign:null;}
function cr34AllPlanetNames(a){return ['Soleil','Lune','Mercure','Vénus','Mars','Jupiter','Saturne','Uranus','Neptune','Pluton'].filter(p=>Number.isFinite(a?.planets?.[p]));}
function cr34AllPlacements(a){return cr34AllPlanetNames(a).map(p=>({planet:p,sign:cr34PlanetSign(a,p),lon:a.planets[p]}));}

function cr34BigThree(a,en=cr3En()){
  const sun=a.sun?.sign||cr34PlanetSign(a,'Soleil');
  const moon=a.moon?.sign||cr34PlanetSign(a,'Lune');
  const asc=a.asc?.sign||null;
  return {sun,moon,asc};
}

function cr34PlanetClause(a,p){
  const sign=cr34PlanetSign(a,p);if(!sign)return '';
  const sp=cr34SignProfile(sign),safe=cr3Escape(sign);
  const map={
    Mercure:`Avec <b>Mercure en ${safe}</b>, ${cr3Escape(sp.mind)}.`,
    'Vénus':`Avec <b>Vénus en ${safe}</b>, ${cr3Escape(sp.relation)}.`,
    Mars:`Avec <b>Mars en ${safe}</b>, ${cr3Escape(sp.action)}.`,
    Jupiter:`Avec <b>Jupiter en ${safe}</b>, ${cr3Escape(sp.growth)}.`,
    Saturne:`Avec <b>Saturne en ${safe}</b>, ${cr3Escape(sp.effort)}.`,
    Uranus:`Avec <b>Uranus en ${safe}</b>, ${cr3Escape(sp.freedom)}.`,
    Neptune:`Avec <b>Neptune en ${safe}</b>, ${cr3Escape(sp.ideal)}.`,
    Pluton:`Avec <b>Pluton en ${safe}</b>, ${cr3Escape(sp.transform)}.`
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
  if(big.sun&&big.moon&&big.sun===big.moon)f.push(`Votre Soleil et votre Lune se trouvent dans le même signe, ${big.sun}. Votre volonté consciente et votre vie émotionnelle parlent donc largement le même langage.`);
  if(big.asc&&big.sun&&big.asc===big.sun)f.push(`Votre Ascendant renforce directement votre Soleil en ${big.sun}. Ce que vous êtes au fond et ce que vous montrez spontanément aux autres se ressemblent fortement.`);
  else if(big.asc&&big.moon&&big.asc===big.moon)f.push(`Votre Ascendant reprend le signe de votre Lune, ${big.moon}. Votre sensibilité transparaît donc assez facilement dans votre comportement.`);
  const bigElements=[big.sun,big.moon,big.asc].filter(Boolean).map(s=>CR3_SIGN_META?.[s]?.element).filter(Boolean);
  if(bigElements.length>=2){const counts={};bigElements.forEach(e=>counts[e]=(counts[e]||0)+1);const top=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0];if(top&&top[1]>=2)f.push(`Le trio Soleil–Lune–Ascendant insiste sur l’élément ${top[0]}. Cette tonalité pèse donc davantage dans votre façon instinctive de fonctionner.`);}
  if(d.sign&&d.sign[1]>=3)f.push(`Le signe ${d.sign[0]} est particulièrement présent dans votre thème. Sa tonalité ${cr34SignProfile(d.sign[0]).core} devient une signature importante de votre personnalité.`);
  if(d.element&&d.total>=5&&d.element[1]>=Math.ceil(d.total*0.45))f.push(`L’élément ${d.element[0]} domine nettement l’ensemble du thème et agit comme une toile de fond permanente.`);
  const personal=new Set(['Soleil','Lune','Mercure','Vénus','Mars']);
  const exact=tight.find(x=>personal.has(x.x)||personal.has(x.y));
  if(exact){const label=typeof cr31AspectLabel==='function'?cr31AspectLabel(exact,false):`${exact.x} et ${exact.y}`;const effect=CR31_ASPECT_EFFECT?.[exact.name]?.fr||'forment une dynamique forte';f.push(`Une dynamique natale serrée relie ${exact.x} et ${exact.y} (${exact.orb.toFixed(1)}°). ${label} ${effect}.`);}
  return f.slice(0,3);
}

function cr34ElementSentence(element){
  const map={
    Feu:'La dominante Feu renforce votre besoin d’agir, d’oser et de vous mettre en mouvement.',
    Terre:'La dominante Terre renforce votre besoin de concret et de repères fiables.',
    Air:'La dominante Air renforce votre besoin d’échanges, de compréhension et de recul.',
    Eau:'La dominante Eau renforce votre sensibilité et votre manière intuitive d’aborder les situations.'
  };
  return map[element]||'';
}

function cr34CharacterText(a){
  const {sun,moon,asc}=cr34BigThree(a,false),s=cr34SignProfile(sun),m=cr34SignProfile(moon),ac=asc?cr34SignProfile(asc):null,d=cr34Dominance(a);
  let t=`Votre personnalité est marquée par un <b>Soleil en ${cr3Escape(sun||'signe non déterminé')}</b>. ${cr3Escape(s.identity)} `;
  if(moon)t+=`Votre <b>Lune en ${cr3Escape(moon)}</b> traduit ${cr3Escape(m.emotion)}. `;
  if(asc)t+=`Votre <b>Ascendant ${cr3Escape(asc)}</b> vous donne ${cr3Escape(ac.appearance)}. `;
  else t+=`L’heure de naissance ne permet pas de déterminer l’Ascendant avec fiabilité. `;
  if(d.element)t+=cr34ElementSentence(d.element[0]);
  return t;
}

function cr34IntegratedPlanets(a){
  const personal=['Mercure','Vénus','Mars'].map(p=>cr34PlanetClause(a,p)).filter(Boolean);
  const slow=['Jupiter','Saturne','Uranus','Neptune','Pluton'].map(p=>cr34PlanetClause(a,p)).filter(Boolean);
  let html='';
  if(personal.length)html+=`<p>${personal.join(' ')}</p>`;
  if(slow.length)html+=`<p>${slow.join(' ')}</p>`;
  return html;
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
  .cr34-portrait{padding:18px 2px 4px;line-height:1.72}.cr34-portrait h5,.cr34-balance h5,.cr34-special h5{font:1.08rem Georgia,serif;color:#6b4b1f;margin:.2rem 0 .55rem}.cr34-portrait p{margin:.58rem 0}
  .cr34-balance{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:15px 0}.cr34-balance>div{padding:15px;border-radius:14px;background:#f3eee6}.cr34-balance p{margin:0;line-height:1.65}
  .cr34-special{margin-top:16px;padding:16px 18px;border-radius:14px;background:#17324d;color:#f9f3e8}.cr34-special h5{color:#f0d49c}.cr34-special p{margin:.65rem 0;line-height:1.68}
  @media(max-width:800px){.cr34-big3,.cr34-balance{grid-template-columns:1fr}.cr34-pillar{min-height:0}}
  `;
  document.head.appendChild(style);
  const out=document.getElementById('astroResult');if(out&&state.astro)out.innerHTML=formatAstroResult();
  if(typeof renderSynthesis==='function')renderSynthesis();
})();
