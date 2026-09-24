/* CRISTARIVA — construction idempotente du Tarot 78 cartes à partir des 56 arcanes mineurs. */
(function(){
'use strict';
if(!window.TAROT_DATA||!Array.isArray(window.TAROT_DATA.main))return;

/* Plusieurs chargeurs de compatibilité peuvent encore se croiser sur un ancien
   navigateur/PWA. On déduplique donc systématiquement les mineurs par numéro
   avant de construire le jeu : 22 majeurs + 56 mineurs, jamais 134 cartes. */
const sourceRows=Array.isArray(window.CR_TAROT_MINOR_ROWS)?window.CR_TAROT_MINOR_ROWS:[];
const rows=[...new Map(
  sourceRows
    .filter(r=>Array.isArray(r)&&Number(r[0])>=23&&Number(r[0])<=78)
    .map(r=>[Number(r[0]),r])
).values()].sort((a,b)=>Number(a[0])-Number(b[0]));

/* Ne jamais remplacer un Tarot valide par un état intermédiaire pendant que
   les quatre familles sont encore en cours de chargement. */
if(rows.length!==56){
  console.warn('CRISTARIVA Tarot 78 : construction différée, '+rows.length+'/56 arcanes mineurs disponibles.');
  return;
}

const minors=rows.map(r=>{
  const[id,rawName,category,intensity,keywords,definition,message,suit,rank,enName,enCategory,enIntensity,enKeywords,enDefinition,enMessage]=r;
  const name=suit==='Épées'?String(rawName).replace(' de Épées',' d’Épées'):rawName;
  let rel,work,spirit;
  if(suit==='Bâtons'){
    rel=`Dans une relation, ${name} met en avant ${keywords}. La dynamique se juge à la manière dont cet élan devient réciproque, clair et durable.`;
    work=`Dans le travail ou un projet, ${name} met en avant ${keywords}. La carte demande de transformer l’énergie disponible en action organisée et mesurable.`;
    spirit=`Sur le plan général ou spirituel, ${name} invite à reconnaître comment ${keywords} orientent actuellement votre manière d’avancer.`;
  }else if(suit==='Coupes'){
    rel=`Dans une relation, ${name} met directement en jeu ${keywords}. Les émotions doivent être lues avec les actes, la réciprocité et la disponibilité réelle.`;
    work=`Dans le travail ou un projet, ${name} montre comment ${keywords} influencent l’ambiance, la motivation et la qualité des échanges.`;
    spirit=`Sur le plan général ou spirituel, ${name} demande d’écouter ${keywords} sans confondre ressenti, intuition et certitude.`;
  }else if(suit==='Épées'){
    rel=`Dans une relation, ${name} met en lumière ${keywords}. La progression dépend surtout de la clarté des faits, des paroles et des limites.`;
    work=`Dans le travail ou un projet, ${name} attire l’attention sur ${keywords}. Une décision plus nette ou une stratégie mieux définie peut devenir nécessaire.`;
    spirit=`Sur le plan général ou spirituel, ${name} aide à distinguer ${keywords} afin de retrouver une pensée plus libre et plus lucide.`;
  }else{
    rel=`Dans une relation, ${name} interroge la dimension concrète du lien à travers ${keywords} : présence, engagement, ressources et continuité.`;
    work=`Dans le travail ou un projet, ${name} est directement lié à ${keywords}. Il invite à juger la situation sur ses résultats, ses ressources et sa solidité.`;
    spirit=`Sur le plan général ou spirituel, ${name} rappelle que l’évolution intérieure doit aussi s’incarner dans le réel à travers ${keywords}.`;
  }
  const image=(window.CR_TAROT_MINOR_IMAGES&&window.CR_TAROT_MINOR_IMAGES[id])||'';
  return{id,name,category,intensity,keywords,definition,meaning:definition,message,reading_tarot:definition,reading_relationnel:rel,reading_professionnel:work,reading_spirituel:spirit,group:'main',oracle:'tarot',arcana:'minor',suit,rank,image,imageEn:image,en:{name:enName,category:enCategory,intensity:enIntensity,keywords:enKeywords,definition:enDefinition,meaning:enDefinition,message:enMessage,reading_tarot:enDefinition,reading_relationnel:enDefinition,reading_professionnel:enDefinition,reading_spirituel:enDefinition}};
});
const majors=window.TAROT_DATA.main
  .filter(c=>Number(c.id)>=1&&Number(c.id)<=22)
  .sort((a,b)=>Number(a.id)-Number(b.id));
if(majors.length!==22){
  console.warn('CRISTARIVA Tarot 78 : construction différée, '+majors.length+'/22 arcanes majeurs disponibles.');
  return;
}
const cards=majors.concat(minors);
window.TAROT_DATA={main:cards,all:cards};
window.CR_TAROT_IDENTITIES=Object.freeze(Object.fromEntries(cards.map(c=>[Number(c.id),Object.freeze({name:c.name,enName:c.en?.name||c.name,image:c.image,imageEn:c.imageEn||c.image})])));
window.CR_TAROT_DIVINATOIRE_VERSION='2026.09.24-tarot78-idempotent';
window.CR_TAROT_MINOR_COUNT=minors.length;
})();
