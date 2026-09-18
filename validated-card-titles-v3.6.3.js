/* CRISTARIVA — verrou des titres courts validés v3.6.3
   Garantit les titres français validés des 130 cartes dans le catalogue,
   les tirages et « L’histoire racontée par vos cartes », y compris si une
   ancienne page PWA a conservé des intitulés poétiques en mémoire. */
const CRISTARIVA_VALIDATED_TITLES_VERSION='3.6.3';
const CR363_SHORT_TITLES={
1:'Direction',2:'Trahison',3:'Joie',4:'Éloignement',5:'Émotions',6:'Indice',7:'Tempête',8:'Échos',9:'Équité',10:'Transmission',
11:'Incompatibilité',12:'Bonheur',13:'Échec',14:'Lune',15:'Rythme',16:'Stabilité',17:'Dépendance',18:'Guérison',19:'Amour',20:'Échéance',
21:'Union',22:'Clarté',23:'Communication',24:'Regrets',25:'Cap',26:'Fin',27:'Paix',28:'Emprise',29:'Succès',30:'Écoute',
31:'Peur',32:'Percée',33:'Perte',34:'Intuition',35:'Perspective',36:'Blocage',37:'Cohésion',38:'Soutien',39:'Patience',40:'Transformation',
41:'Dissimulation',42:'Maîtrise',43:'Éclosion',44:'Détour',45:'Cycles',46:'Sincérité',47:'Réconciliation',48:'Refus',49:'Libération',50:'Envol',
51:'Abandon',52:'Mémoire',53:'Indifférence',54:'Conflit',55:'Transition',56:'Renouveau',57:'Origines',58:'Passion',59:'Choix',60:'Projection',
61:'Appartenance',62:'Opposition',63:'Ancrage',64:'Rupture',65:'Mensonge',66:'Repère',67:'Jalousie',68:'Protection',69:'Introspection',70:'Rejet',
71:'Désillusion',72:'Complexité',73:'Connexion',74:'Épuisement',75:'Impasse',76:'Naissance',77:'Intégrité',78:'Voie',79:'Fausse promesse',80:'Empreinte',
81:'Réciprocité',82:'Signe',83:'Instabilité',84:'Manipulation',85:'Progression',86:'Juste distance',87:'Retard',88:'Vision',89:'Éveil',90:'Retour',
91:'Sagesse',92:'Mutation',93:'Potentiel',94:'Providence',95:'Opportunité',96:'Ami(e)',97:'Parent',98:'Partenaire',99:'Enfant',100:'Rencontre',
101:'Frère / Sœur',102:'Ex',103:'Collègue',104:'Responsable',105:'Connaissance',106:'Inconnu(e)',107:'Rival(e)',108:'Confident(e)',109:'Crush',110:'Contact pro',
111:'À distance',112:'Ancien lien',113:'Admirateur',114:'Mentor',115:'Intermédiaire',116:'Immédiat',117:'3 jours',118:'1 semaine',119:'15 jours',120:'3 semaines',
121:'1 mois',122:'6 semaines',123:'2 mois',124:'3 mois',125:'6 mois',126:'9 mois',127:'1 an',128:'Saison prochaine',129:'Déclencheur',130:'Indéfini'
};
function cr363Title(card){return card?(card.oracle==='amour'?(card.name||''):(CR363_SHORT_TITLES[Number(card.id)]||card.name||'')):'';}
function cr363ApplyTitles(){
  try{
    if(typeof DATA==='object'&&DATA){
      ['main','relation','dating'].forEach(group=>{
        if(Array.isArray(DATA[group]))DATA[group].forEach(card=>{const title=CR363_SHORT_TITLES[Number(card.id)];if(title)card.name=title;});
      });
    }
    if(typeof state==='object'&&state){
      if(Array.isArray(state.draw))state.draw.forEach(card=>{if(card?.oracle==='amour')return;const title=CR363_SHORT_TITLES[Number(card.id)];if(title)card.name=title;});
      ['relation','date'].forEach(key=>{const card=state[key];if(card?.oracle==='amour')return;const title=CR363_SHORT_TITLES[Number(card?.id)];if(card&&title)card.name=title;});
    }
  }catch(e){}
}
cr363ApplyTitles();
if(typeof cardName==='function'){
  const cr363PreviousCardName=cardName;
  cardName=function(card){
    if(!card)return '';
    if(!state||state.lang!=='en')return cr363Title(card);
    return cr363PreviousCardName(card);
  };
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{
  cr363ApplyTitles();
  if(typeof renderCards==='function'&&state?.draw?.length)renderCards();
},{once:true});
else if(typeof renderCards==='function'&&state?.draw?.length)renderCards();
