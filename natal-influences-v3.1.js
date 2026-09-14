/* CRISTARIVA — enrichissement des influences natales v3.1
   Donne un nom explicite à chaque influence planétaire et interprète les aspects natals. */
const CRISTARIVA_NATAL_INFLUENCES_VERSION='3.1';

const CR31_SIGN_STYLE={
  'Bélier':{fr:'directe, spontanée et conquérante',en:'direct, spontaneous and pioneering'},
  'Taureau':{fr:'stable, concrète et persévérante',en:'steady, concrete and persistent'},
  'Gémeaux':{fr:'curieuse, mobile et communicative',en:'curious, mobile and communicative'},
  'Cancer':{fr:'sensible, protectrice et instinctive',en:'sensitive, protective and instinctive'},
  'Lion':{fr:'chaleureuse, créative et affirmée',en:'warm, creative and self-expressive'},
  'Vierge':{fr:'analytique, précise et pragmatique',en:'analytical, precise and pragmatic'},
  'Balance':{fr:'relationnelle, diplomate et soucieuse d’équilibre',en:'relational, diplomatic and balance-seeking'},
  'Scorpion':{fr:'intense, lucide et profondément transformatrice',en:'intense, perceptive and deeply transformative'},
  'Sagittaire':{fr:'ouverte, expansive et orientée vers le sens',en:'open, expansive and meaning-oriented'},
  'Capricorne':{fr:'structurée, ambitieuse et patiente',en:'structured, ambitious and patient'},
  'Verseau':{fr:'indépendante, originale et tournée vers l’avenir',en:'independent, original and future-oriented'},
  'Poissons':{fr:'intuitive, imaginative et réceptive',en:'intuitive, imaginative and receptive'}
};

const CR31_PLANET_DOMAIN={
  'Mercure':{fr:['Pensée & communication','Fonction mentale'],en:['Mind & communication','Mental function']},
  'Vénus':{fr:['Liens & valeurs','Fonction affective'],en:['Bonds & values','Affective function']},
  'Mars':{fr:['Élan & action','Fonction d’action'],en:['Drive & action','Action function']},
  'Jupiter':{fr:['Expansion & confiance','Fonction d’expansion'],en:['Growth & confidence','Expansion function']},
  'Saturne':{fr:['Structure & limites','Fonction de structuration'],en:['Structure & limits','Structuring function']}
};

const CR31_PLANET_SIGN_NAMES={
  Mercure:{
    'Bélier':['Pensée rapide et franche','Fast, direct thinking'],'Taureau':['Pensée concrète et constante','Concrete, steady thinking'],'Gémeaux':['Pensée vive et polyvalente','Quick, versatile thinking'],'Cancer':['Pensée intuitive et mémorielle','Intuitive, memory-led thinking'],'Lion':['Pensée créative et expressive','Creative, expressive thinking'],'Vierge':['Pensée analytique et précise','Analytical, precise thinking'],'Balance':['Pensée diplomatique et relationnelle','Diplomatic, relational thinking'],'Scorpion':['Pensée pénétrante et stratégique','Penetrating, strategic thinking'],'Sagittaire':['Pensée globale et visionnaire','Broad, visionary thinking'],'Capricorne':['Pensée structurée et méthodique','Structured, methodical thinking'],'Verseau':['Pensée indépendante et inventive','Independent, inventive thinking'],'Poissons':['Pensée intuitive et imagée','Intuitive, imaginative thinking']
  },
  'Vénus':{
    'Bélier':['Affectivité spontanée et passionnée','Spontaneous, passionate affection'],'Taureau':['Affectivité fidèle et sensorielle','Loyal, sensual affection'],'Gémeaux':['Affectivité curieuse et légère','Curious, light affection'],'Cancer':['Affectivité tendre et protectrice','Tender, protective affection'],'Lion':['Affectivité généreuse et démonstrative','Generous, demonstrative affection'],'Vierge':['Affectivité discrète et attentive','Discreet, attentive affection'],'Balance':['Affectivité harmonieuse et partenariale','Harmonious, partnership-oriented affection'],'Scorpion':['Affectivité intense et fusionnelle','Intense, all-or-nothing affection'],'Sagittaire':['Affectivité libre et enthousiaste','Free, enthusiastic affection'],'Capricorne':['Affectivité réservée et durable','Reserved, enduring affection'],'Verseau':['Affectivité indépendante et atypique','Independent, unconventional affection'],'Poissons':['Affectivité romantique et empathique','Romantic, empathic affection']
  },
  Mars:{
    'Bélier':['Action directe et combative','Direct, assertive action'],'Taureau':['Action patiente et tenace','Patient, tenacious action'],'Gémeaux':['Action mobile et nerveuse','Quick, agile action'],'Cancer':['Action protectrice et émotionnelle','Protective, emotional action'],'Lion':['Action fière et créative','Proud, creative action'],'Vierge':['Action précise et efficace','Precise, efficient action'],'Balance':['Action négociée et stratégique','Negotiated, strategic action'],'Scorpion':['Action intense et déterminée','Intense, determined action'],'Sagittaire':['Action expansive et aventureuse','Expansive, adventurous action'],'Capricorne':['Action disciplinée et ambitieuse','Disciplined, ambitious action'],'Verseau':['Action indépendante et innovante','Independent, innovative action'],'Poissons':['Action intuitive et indirecte','Intuitive, indirect action']
  },
  Jupiter:{
    'Bélier':['Confiance par l’initiative','Confidence through initiative'],'Taureau':['Expansion par la stabilité','Growth through stability'],'Gémeaux':['Expansion par les échanges','Growth through exchange'],'Cancer':['Expansion par l’attachement','Growth through belonging'],'Lion':['Expansion par la créativité','Growth through creativity'],'Vierge':['Expansion par la maîtrise','Growth through mastery'],'Balance':['Expansion par les alliances','Growth through alliances'],'Scorpion':['Expansion par la transformation','Growth through transformation'],'Sagittaire':['Expansion par l’ouverture','Growth through openness'],'Capricorne':['Expansion par l’ambition','Growth through ambition'],'Verseau':['Expansion par l’innovation','Growth through innovation'],'Poissons':['Expansion par l’intuition','Growth through intuition']
  },
  Saturne:{
    'Bélier':['Apprentissage de la maîtrise de l’impulsion','Learning disciplined initiative'],'Taureau':['Construction lente et solide','Slow, solid construction'],'Gémeaux':['Rigueur de pensée et de parole','Discipline in thought and speech'],'Cancer':['Maîtrise de la vulnérabilité','Mastery of vulnerability'],'Lion':['Construction de la confiance en soi','Building self-confidence'],'Vierge':['Exigence, méthode et perfectionnement','Discipline, method and refinement'],'Balance':['Responsabilité dans les liens','Responsibility in relationships'],'Scorpion':['Maîtrise de l’intensité et du contrôle','Mastery of intensity and control'],'Sagittaire':['Structuration des croyances et des projets','Structuring beliefs and projects'],'Capricorne':['Sens aigu du devoir et de la durée','Strong sense of duty and endurance'],'Verseau':['Structuration d’une pensée indépendante','Structuring independent thought'],'Poissons':['Donner des limites au sensible','Giving boundaries to sensitivity']
  }
};

function cr31PlanetInfluence(planet,sign,en=cr3En()){
  const name=CR31_PLANET_SIGN_NAMES[planet]?.[sign];
  const style=CR31_SIGN_STYLE[sign]?.[en?'en':'fr']||'';
  const title=name?.[en?1:0] || (en?`${cr3Planet(planet,true)} in ${cr3Sign(sign,true)}`:`${planet} en ${sign}`);
  let text='';
  if(en){
    if(planet==='Mercure')text=`This creates a ${style} way of processing information, speaking and making decisions.`;
    if(planet==='Vénus')text=`This gives attraction, attachment and personal values a ${style} tone.`;
    if(planet==='Mars')text=`This makes the way you assert yourself, desire and act more ${style}.`;
    if(planet==='Jupiter')text=`This gives growth, confidence and opportunity a ${style} expression.`;
    if(planet==='Saturne')text=`This makes effort, responsibility, boundaries and long-term construction more ${style}.`;
  }else{
    if(planet==='Mercure')text=`Cette position donne à votre manière de penser, de parler et de décider une tonalité ${style}.`;
    if(planet==='Vénus')text=`Cette position donne à l’attachement, à l’attirance et à vos valeurs une tonalité ${style}.`;
    if(planet==='Mars')text=`Cette position donne à votre manière d’affirmer vos besoins, de désirer et d’agir une tonalité ${style}.`;
    if(planet==='Jupiter')text=`Cette position donne à la confiance, à l’expansion et aux opportunités une tonalité ${style}.`;
    if(planet==='Saturne')text=`Cette position donne à l’effort, aux responsabilités, aux limites et à la construction dans le temps une tonalité ${style}.`;
  }
  return {title,text};
}

function cr3PersonalityDetails(a,en=cr3En()){
  const p=a.planets||{},rows=[];
  const push=(planet,sign)=>{
    if(!sign)return;
    const domain=CR31_PLANET_DOMAIN[planet]?.[en?'en':'fr']||[cr3Planet(planet,en),''];
    const inf=cr31PlanetInfluence(planet,sign,en);
    rows.push(`<div class="cr3-trait"><b>${cr3Escape(domain[0])}</b><span><strong>${cr3Escape(inf.title)}</strong> — ${inf.text}</span></div>`);
  };
  ['Mercure','Vénus','Mars','Jupiter','Saturne'].forEach(planet=>{
    if(Number.isFinite(p[planet]))push(planet,zodiac(p[planet]).sign);
  });
  return rows.join('');
}

const CR31_ASPECT_CORE={
  'Soleil|Mercure':{fr:'Identité et pensée',en:'Identity and mind'},
  'Soleil|Vénus':{fr:'Identité et affectivité',en:'Identity and affection'},
  'Soleil|Mars':{fr:'Volonté et action',en:'Will and action'},
  'Soleil|Lune':{fr:'Volonté et sensibilité',en:'Will and sensitivity'},
  'Soleil|Saturne':{fr:'Identité et exigence',en:'Identity and discipline'},
  'Lune|Vénus':{fr:'Émotions et attachement',en:'Emotions and attachment'},
  'Lune|Mars':{fr:'Émotions et réaction',en:'Emotions and reaction'},
  'Mercure|Saturne':{fr:'Pensée et rigueur',en:'Mind and discipline'},
  'Vénus|Mars':{fr:'Désir et affectivité',en:'Desire and affection'}
};
const CR31_ASPECT_EFFECT={
  conjonction:{fr:'fonctionnent de manière très étroitement liée et se renforcent mutuellement',en:'operate very closely together and reinforce each other'},
  trigone:{fr:'coopèrent avec fluidité et constituent une ressource naturelle',en:'work together fluently and form a natural strength'},
  sextile:{fr:'se soutiennent facilement et offrent un potentiel qu’il est utile d’activer',en:'support each other readily and offer a potential worth activating'},
  carré:{fr:'créent une tension féconde qui demande des ajustements conscients',en:'create a productive tension that calls for conscious adjustment'},
  opposition:{fr:'tirent dans deux directions complémentaires qu’il faut apprendre à équilibrer',en:'pull in complementary directions that need to be balanced'}
};
function cr31AspectLabel(h,en=cr3En()){
  const key=`${h.x}|${h.y}`;
  const rev=`${h.y}|${h.x}`;
  const core=CR31_ASPECT_CORE[key]||CR31_ASPECT_CORE[rev]||{fr:`${h.x} et ${h.y}`,en:`${cr3Planet(h.x,true)} and ${cr3Planet(h.y,true)}`};
  return core[en?'en':'fr'];
}
function cr31AspectMeaning(h,en=cr3En()){
  const effect=CR31_ASPECT_EFFECT[h.name]?.[en?'en':'fr']||'';
  const label=cr31AspectLabel(h,en);
  if(en)return `<strong>${cr3Escape(label)}</strong>: ${effect}.`;
  return `<strong>${cr3Escape(label)}</strong> : ${effect}.`;
}
function cr3NatalAspectsHtml(a,en=cr3En()){
  const items=cr3NatalAspects(a);
  if(!items.length)return '';
  const intro=en?'The most visible natal dynamics are':'Les dynamiques natales les plus visibles sont';
  return `<div class="cr3-aspects"><p><b>${intro} :</b></p>${items.map(h=>`<div class="cr3-aspect-line"><b>${cr3Planet(h.x,en)} ${cr3Aspect(h.name,en)} ${cr3Planet(h.y,en)}</b> <span class="muted">(${h.orb.toFixed(1)}°)</span><br>${cr31AspectMeaning(h,en)}</div>`).join('')}</div>`;
}

(function cr31Refresh(){
  const style=document.createElement('style');
  style.textContent=`.cr3-trait span strong{display:block;margin:2px 0 3px;color:var(--ink,#2d2030)}.cr3-aspect-line{margin:.55rem 0;padding:.55rem .7rem;border-left:3px solid rgba(118,71,93,.28);background:rgba(255,255,255,.34);border-radius:0 8px 8px 0}.cr3-aspect-line .muted{font-weight:400}`;
  document.head.appendChild(style);
  const out=document.getElementById('astroResult');
  if(out&&state.astro&&typeof formatAstroResult==='function')out.innerHTML=formatAstroResult();
  if(typeof renderSynthesis==='function')renderSynthesis();
})();
