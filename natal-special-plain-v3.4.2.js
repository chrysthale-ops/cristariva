/* CRISTARIVA — particularités du thème en langage simple v3.4.2
   Remplace le vocabulaire astrologique abstrait par des explications concrètes. */
const CRISTARIVA_NATAL_SPECIAL_PLAIN_VERSION='3.4.2';

function cr342ElementText(element){
  const map={
    Feu:'Vous réagissez souvent en agissant vite. Vous avez besoin d’élan, de mouvement et de sentir que vous pouvez prendre des initiatives.',
    Terre:'Vous avez besoin de concret, de stabilité et de preuves. Avant de vous sentir en confiance, vous cherchez à savoir sur quoi vous pouvez réellement compter.',
    Air:'Vous avez besoin de comprendre, de parler et d’échanger. Mettre les choses en mots vous aide à prendre du recul et à décider.',
    Eau:'Vous êtes très sensible à l’ambiance et aux émotions. Votre ressenti intervient souvent avant l’analyse rationnelle d’une situation.'
  };
  return map[element]||'';
}

function cr342PairKey(a,b){return [a,b].sort().join('|');}

function cr342AspectText(x,y,name){
  const pair=cr342PairKey(x,y);
  const easy=name==='trigone'||name==='sextile'||name==='conjonction';
  const specific={
    'Mercure|Soleil': easy
      ? 'Vous avez tendance à penser et à parler en accord avec ce que vous êtes. Vos idées vous engagent personnellement : cela donne de la conviction, mais peut aussi rendre plus difficile de changer d’avis.'
      : 'Ce que vous pensez et ce que vous voulez ne vont pas toujours dans le même sens. Vous pouvez avoir besoin de temps avant de trouver les mots qui correspondent vraiment à votre position.',
    'Lune|Soleil': easy
      ? 'Ce que vous voulez et ce dont vous avez besoin intérieurement vont souvent dans le même sens. Vos décisions sont donc plus faciles à assumer lorsqu’elles correspondent aussi à votre ressenti.'
      : 'Vos envies et vos besoins émotionnels peuvent parfois tirer dans deux directions différentes. Vous pouvez savoir ce que vous voulez tout en ressentant autre chose.',
    'Soleil|Vénus': easy
      ? 'Votre manière d’aimer est étroitement liée à votre identité. Vous avez besoin que vos relations respectent qui vous êtes vraiment et la place que vous souhaitez prendre.'
      : 'Ce que vous voulez pour vous-même et ce que vous recherchez dans une relation peuvent parfois entrer en conflit. Vous avez alors besoin de trouver un équilibre entre vos choix personnels et le lien.',
    'Mars|Soleil': easy
      ? 'Quand vous savez ce que vous voulez, vous pouvez passer rapidement à l’action. Votre volonté et votre énergie avancent généralement dans la même direction.'
      : 'Vous pouvez parfois agir avant d’avoir complètement clarifié ce que vous voulez, ou au contraire savoir ce que vous voulez sans réussir à agir immédiatement.',
    'Lune|Mercure': easy
      ? 'Vous arrivez assez facilement à mettre des mots sur ce que vous ressentez. Vos émotions nourrissent directement votre façon de réfléchir et de communiquer.'
      : 'Vous pouvez ressentir une chose et en penser une autre. Dans les moments chargés émotionnellement, il peut être difficile d’expliquer clairement ce qui se passe en vous.',
    'Lune|Vénus': easy
      ? 'Votre besoin d’affection et votre façon de vous attacher sont très liés. Vous recherchez surtout des relations dans lesquelles vous vous sentez aimé et en sécurité.'
      : 'Vous pouvez être attiré par une relation qui ne vous apporte pas immédiatement la sécurité émotionnelle dont vous avez besoin.',
    'Lune|Mars': easy
      ? 'Vos émotions déclenchent rapidement votre envie d’agir. Quand quelque chose vous touche, vous avez du mal à rester complètement passif.'
      : 'Vos réactions peuvent être rapides lorsque vous êtes touché émotionnellement. Il est parfois utile de laisser retomber l’émotion avant d’agir.',
    'Mercure|Saturne': easy
      ? 'Vous réfléchissez sérieusement avant de parler ou de décider. Cela favorise la prudence et la rigueur, mais peut aussi vous pousser à trop douter de vos propres idées.'
      : 'Vous pouvez parfois vous censurer ou craindre de mal vous exprimer. La confiance dans votre jugement se construit surtout avec l’expérience.',
    'Mars|Vénus': easy
      ? 'Ce qui vous attire et votre manière d’aller vers l’autre sont assez cohérents. Quand le désir est présent, vous savez généralement le montrer ou agir en conséquence.'
      : 'L’attirance et la manière d’agir ne suivent pas toujours le même rythme. Vous pouvez ressentir fortement quelque chose sans savoir immédiatement comment l’exprimer.',
    'Jupiter|Soleil': easy
      ? 'Vous avez plus facilement confiance lorsque vous pouvez viser plus grand et croire à une possibilité d’évolution. L’enthousiasme peut devenir un vrai moteur.'
      : 'Vous pouvez parfois hésiter entre rester raisonnable et voir plus grand. L’enjeu est de garder de l’ambition sans surestimer ce qui est possible.',
    'Saturne|Soleil': easy
      ? 'Vous prenez vos responsabilités au sérieux et cherchez à construire quelque chose de solide. Vous pouvez cependant être exigeant avec vous-même.'
      : 'Vous pouvez parfois avoir l’impression de devoir faire vos preuves avant de vous autoriser à avancer. La confiance se construit chez vous par l’expérience et la persévérance.',
    'Mercure|Neptune': easy
      ? 'Votre pensée fait une grande place à l’intuition et à l’imagination. Vous pouvez comprendre une ambiance très vite, même avant d’avoir tous les faits.'
      : 'Votre intuition est forte, mais elle peut parfois se mélanger à vos attentes ou à vos craintes. Vérifier les faits vous aide à savoir ce qui est réellement solide.',
    'Lune|Neptune': easy
      ? 'Vous êtes très réceptif aux ambiances et aux émotions des autres. Cette sensibilité nourrit l’intuition, mais peut aussi vous rendre plus perméable au climat autour de vous.'
      : 'Vous ressentez beaucoup de choses, mais il peut être difficile de savoir immédiatement ce qui vous appartient et ce qui vient de l’ambiance ou des autres.',
    'Pluton|Soleil': easy
      ? 'Vous vivez certaines décisions de manière très entière. Quand vous changez de direction, ce changement peut transformer profondément votre façon de vous voir.'
      : 'Vous pouvez connaître des périodes où le besoin de garder le contrôle s’oppose à la nécessité de changer. Ces moments vous obligent souvent à redéfinir ce qui compte vraiment pour vous.'
  };
  if(specific[pair])return specific[pair];

  const meanings={
    Soleil:'ce que vous voulez et la manière dont vous affirmez qui vous êtes',
    Lune:'vos émotions et votre besoin de sécurité',
    Mercure:'votre façon de penser et de communiquer',
    Vénus:'votre manière de vous attacher et ce qui vous attire',
    Mars:'votre manière d’agir et de défendre vos besoins',
    Jupiter:'votre confiance et votre envie d’élargir vos possibilités',
    Saturne:'votre sens des responsabilités et vos limites',
    Uranus:'votre besoin de liberté et de changement',
    Neptune:'votre intuition, votre imagination et votre idéal',
    Pluton:'votre manière de vivre les changements profonds'
  };
  const a=meanings[x]||x,b=meanings[y]||y;
  if(easy)return `Deux aspects de votre personnalité sont fortement liés : ${a} et ${b}. Dans la vie quotidienne, ils ont tendance à se soutenir et à se déclencher ensemble.`;
  return `Deux besoins importants peuvent parfois se contredire : ${a} et ${b}. Vous avancez mieux lorsque vous prenez le temps de les concilier au lieu d’en privilégier un systématiquement.`;
}

function cr34SpecialFeatures(a){
  const f=[],big=cr34BigThree(a,false),d=cr34Dominance(a),tight=cr34AllTightAspects(a);

  if(big.sun&&big.moon&&big.sun===big.moon){
    f.push(`Votre Soleil et votre Lune sont tous les deux en ${big.sun}. En clair, ce que vous voulez et ce dont vous avez besoin intérieurement vont souvent dans le même sens. Vous avez donc tendance à faire des choix que vous ressentez profondément comme étant les vôtres.`);
  }

  if(big.asc&&big.sun&&big.asc===big.sun){
    f.push(`Votre Soleil et votre Ascendant sont tous les deux en ${big.sun}. Cela signifie que l’image que vous donnez correspond assez bien à ce que vous êtes réellement : les autres comprennent généralement assez vite votre manière d’être.`);
  }else if(big.asc&&big.moon&&big.asc===big.moon){
    f.push(`Votre Lune et votre Ascendant sont tous les deux en ${big.moon}. Vos émotions se voient donc assez facilement dans votre attitude, même lorsque vous ne les exprimez pas directement.`);
  }

  let bigElement=null;
  const bigElements=[big.sun,big.moon,big.asc].filter(Boolean).map(s=>CR3_SIGN_META?.[s]?.element).filter(Boolean);
  if(bigElements.length>=2){
    const counts={};bigElements.forEach(e=>counts[e]=(counts[e]||0)+1);
    const top=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0];
    if(top&&top[1]>=2){
      bigElement=top[0];
      f.push(`Au moins deux de vos trois repères principaux — Soleil, Lune et Ascendant — sont en ${top[0]}. ${cr342ElementText(top[0])}`);
    }
  }

  if(d.sign&&d.sign[1]>=3){
    const profile=cr34SignProfile(d.sign[0]);
    const plain=profile?.identity||`Le signe ${d.sign[0]} est très présent dans votre thème.`;
    f.push(`Le signe ${d.sign[0]} revient plusieurs fois dans votre thème. Concrètement, ${plain.charAt(0).toLowerCase()+plain.slice(1)}`);
  }

  if(d.element&&d.total>=5&&d.element[1]>=Math.ceil(d.total*0.45)&&d.element[0]!==bigElement){
    f.push(`L’élément ${d.element[0]} est très présent dans l’ensemble de votre thème. ${cr342ElementText(d.element[0])}`);
  }

  const personal=new Set(['Soleil','Lune','Mercure','Vénus','Mars']);
  const exact=tight.find(x=>personal.has(x.x)||personal.has(x.y));
  if(exact){
    f.push(`${exact.x} et ${exact.y} sont très proches dans votre thème (${exact.orb.toFixed(1)}°). Concrètement, ${cr342AspectText(exact.x,exact.y,exact.name)}`);
  }

  return f.slice(0,3);
}

(function cr342Refresh(){
  const out=document.getElementById('astroResult');
  if(out&&state?.astro&&typeof formatAstroResult==='function')out.innerHTML=formatAstroResult();
  if(typeof renderSynthesis==='function')renderSynthesis();
})();
