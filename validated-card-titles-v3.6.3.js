/* CRISTARIVA — verrou des titres courts validés v3.6.4
   Garantit les titres français validés des 130 cartes dans le catalogue,
   les tirages et « L’histoire racontée par vos cartes », y compris si une
   ancienne page PWA a conservé des intitulés poétiques en mémoire.

   v3.6.4 : ajoute une lecture sémantique étendue pour la synthèse générale afin
   d’éviter qu’un grand nombre de tirages différents retombent sur le même texte
   neutre par défaut.
*/
const CRISTARIVA_VALIDATED_TITLES_VERSION='3.6.4';
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

/* -------------------------------------------------------------------------
   Synthèse générale — diversification sémantique v3.6.9
   Le précédent moteur général ne reconnaissait explicitement que quelques
   titres (Éveil, Ancrage, Rythme, Origines, Retour, Percée...). Tous les autres
   tirages retombaient sur deux phrases neutres identiques. Cette couche classe
   l’ensemble des cartes principales en familles de sens et utilise séparément
   le début, le cœur et l’issue du tirage.
--------------------------------------------------------------------------- */
const CRISTARIVA_GENERAL_SYNTHESIS_VARIETY_VERSION='3.6.9';

function cr363GeneralBlob(card){
  return [card?.name,card?.definition,card?.meaning,card?.message,card?.reading_spirituel]
    .filter(Boolean).join(' ').toLocaleLowerCase();
}
function cr363GeneralFamily(card){
  const x=cr363GeneralBlob(card);
  if(/trahison|tempête|tempete|dépendance|dependance|peur|emprise|blocage|dissimulation|conflit|opposition|mensonge|jalousie|désillusion|desillusion|complexité|complexite|manipulation|instabilité|instabilite|fausse promesse|projection|épuisement|epuisement|impasse/.test(x))return'tension';
  if(/éloignement|eloignement|incompatibilité|incompatibilite|échec|echec|\bfin\b|perte|refus|abandon|indifférence|indifference|rupture|rejet|juste distance|retard/.test(x))return'distance';
  if(/direction|\bcap\b|choix|\bvoie\b|intégrité|integrite|repère|repere|perspective|vision/.test(x))return'choice';
  if(/échos|echos|regrets|mémoire|memoire|origines|retour|passé|passe|empreinte/.test(x))return'past';
  if(/indice|transmission|clarté|clarte|communication|écoute|ecoute|sincérité|sincerite|\bsigne\b/.test(x))return'clarity';
  if(/transformation|transition|mutation|libération|liberation|envol|progression/.test(x))return'change';
  if(/joie|bonheur|succès|succes|percée|percee|éclosion|eclosion|renouveau|naissance|potentiel|providence|opportunité|opportunite/.test(x))return'opening';
  if(/stabilité|stabilite|équité|equite|paix|ancrage|maîtrise|maitrise/.test(x))return'stability';
  if(/émotions|emotions|amour|union|cohésion|cohesion|soutien|réconciliation|reconciliation|connexion|réciprocité|reciprocite|passion|appartenance/.test(x))return'feeling';
  if(/lune|intuition|guérison|guerison|protection|introspection|éveil|eveil|sagesse/.test(x))return'inner';
  if(/rythme|échéance|echeance|patience|cycles|détour|detour/.test(x))return'time';
  return'neutral';
}
function cr363GeneralMiddle(cards){
  if(!Array.isArray(cards)||cards.length<3)return null;
  const middle=cards.slice(1,-1);
  const priority=['tension','distance','choice','past','clarity','change','opening','stability','feeling','inner','time'];
  for(const family of priority){const found=middle.find(c=>cr363GeneralFamily(c)===family);if(found)return found;}
  return middle[Math.floor(middle.length/2)]||middle[0]||null;
}
function cr363GeneralOrigin(card){
  const family=cr363GeneralFamily(card),name=String(card?.name||'').trim();
  const map={
    tension:'Le climat de départ est marqué par une tension ou un frein qui demande d’abord à être identifié sans l’amplifier.',
    distance:'Le tirage part d’un besoin de recul, de protection ou de détachement qui modifie la manière d’aborder la situation.',
    choice:'Le point de départ met déjà la question de l’orientation au premier plan : quelque chose demande à être choisi, hiérarchisé ou assumé.',
    past:'Un élément ancien, un souvenir ou un schéma déjà connu continue d’influencer la manière dont la situation est vécue aujourd’hui.',
    clarity:'Le tirage s’ouvre sur un besoin de compréhension plus nette, de parole précise ou d’information qui permette de mieux lire ce qui se joue.',
    change:'Une transformation est déjà engagée : l’ancien fonctionnement perd de sa place et oblige à regarder autrement la suite.',
    opening:'Une énergie d’ouverture domine le début du tirage et rend une possibilité nouvelle plus visible qu’auparavant.',
    stability:'Le besoin de retrouver un axe stable, fiable et cohérent constitue le socle principal de la situation.',
    feeling:'La tonalité de départ est fortement émotionnelle : ce qui est ressenti, partagé ou recherché dans le lien prend beaucoup de place.',
    inner:'Le début du tirage invite surtout à écouter ce qui se passe intérieurement avant de chercher une réponse uniquement dans les événements extérieurs.',
    time:'Le rythme est d’emblée essentiel : la situation ne semble pas demander une réponse immédiate mais une progression au bon tempo.',
    neutral:name?`Le thème de « ${name} » donne la tonalité de départ et mérite d’être replacé dans les faits concrets de la situation.`:'Le point de départ demande encore à être précisé par les faits.'
  };
  return map[family]||map.neutral;
}
function cr363GeneralPivot(card){
  if(!card)return'';
  const family=cr363GeneralFamily(card),name=String(card?.name||'').trim();
  const map={
    tension:'Au cœur du tirage, une résistance ou une contradiction demande à être traversée plutôt que contournée.',
    distance:'Au centre de la dynamique, la distance sert de filtre : elle peut protéger, clarifier ou révéler ce qui mérite réellement d’être poursuivi.',
    choice:'Le mouvement dépend ensuite d’une décision plus nette ; rester entre plusieurs directions entretient surtout l’incertitude.',
    past:'Le point sensible se situe dans ce qui revient du passé : l’enjeu est d’en comprendre l’influence sans le reproduire automatiquement.',
    clarity:'Le cœur de la situation demande davantage de clarté ; les mots, les faits ou une information précise peuvent modifier la compréhension d’ensemble.',
    change:'La dynamique centrale est celle d’un changement de cadre, de regard ou de fonctionnement qui ne permet plus de continuer exactement comme avant.',
    opening:'Une possibilité constructive apparaît au centre du tirage et peut devenir un levier si elle reçoit une traduction concrète.',
    stability:'Ce qui peut faire évoluer la situation est la recherche d’un équilibre plus stable, moins soumis aux réactions immédiates.',
    feeling:'Les émotions deviennent le véritable moteur du tirage ; elles gagnent à être reconnues sans être confondues avec une certitude sur les événements.',
    inner:'Le cœur du tirage ramène à une compréhension intérieure plus fine, comme si la situation demandait d’abord un ajustement de perception.',
    time:'La progression se joue dans le rythme : accélérer artificiellement risquerait de masquer ce qui est encore en train de mûrir.',
    neutral:name?`Au centre du tirage, « ${name} » introduit une nuance spécifique qui modifie la lecture du point de départ.`:'Au centre du tirage, un élément nouveau vient nuancer la première impression.'
  };
  return map[family]||map.neutral;
}
function cr363GeneralThreadV2(cards){
  if(!Array.isArray(cards)||!cards.length)return'';
  const first=cr363GeneralOrigin(cards[0]);
  if(cards.length===1)return first;
  const pivot=cr363GeneralPivot(cr363GeneralMiddle(cards));
  return [first,pivot].filter(Boolean).join(' ');
}
function cr363GeneralOutcomeV2(cards){
  if(!Array.isArray(cards)||!cards.length)return'';
  const last=cards[cards.length-1],family=cr363GeneralFamily(last),name=String(last?.name||'').trim();
  const map={
    tension:'La direction finale demande donc surtout de réduire la tension, de clarifier le point de friction et de ne pas forcer une résolution avant que ce frein soit réellement compris.',
    distance:'La dernière tonalité reste celle du recul ou de la limite : la suite paraît plus lisible lorsque l’espace nécessaire est respecté.',
    choice:'La synthèse conduit à une décision : la situation gagnera en cohérence dès qu’une direction sera réellement privilégiée.',
    past:'La dernière carte maintient le passé dans le champ, mais davantage comme une matière à comprendre et transformer que comme un scénario à répéter.',
    clarity:'L’issue va vers davantage de lisibilité : une parole, un constat ou une information plus nette devrait permettre de sortir des suppositions.',
    change:'La direction finale confirme un changement réel ; la suite demande d’accepter une forme nouvelle plutôt que de restaurer exactement l’ancien équilibre.',
    opening:'La fin du tirage ouvre une possibilité constructive : quelque chose peut progresser, se débloquer ou prendre davantage de place si cette ouverture est concrètement saisie.',
    stability:'La direction finale recherche la consolidation : moins de dispersion, davantage de continuité et des choix plus cohérents avec ce qui peut réellement durer.',
    feeling:'La synthèse reste centrée sur le ressenti et la qualité du lien ; la suite dépendra de la manière dont ces émotions trouvent une expression concrète et équilibrée.',
    inner:'La conclusion est avant tout intérieure : le principal mouvement est une prise de conscience susceptible de modifier ensuite votre manière d’agir ou de choisir.',
    time:'La dernière carte confirme une évolution progressive : le bon rythme compte davantage ici qu’une réponse immédiate ou spectaculaire.',
    neutral:name?`La dernière carte, « ${name} », donne une direction spécifique au tirage ; sa portée devra maintenant être vérifiée dans les faits plutôt que remplacée par une conclusion générale.`:'La direction finale reste ouverte et devra être confirmée par les faits.'
  };
  return map[family]||map.neutral;
}

/* Les fonctions de la synthèse générale sont déjà définies lorsque ce fichier
   est chargé. Les réaffecter ici suffit : cr367GlobalSynthesis les appelle au
   moment où l’utilisateur demande la synthèse. */
try{
  if(typeof cr367GeneralThread==='function')cr367GeneralThread=cr363GeneralThreadV2;
  if(typeof cr367GeneralOutcome==='function')cr367GeneralOutcome=cr363GeneralOutcomeV2;
}catch(e){}
