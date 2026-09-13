import re
from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')

block=r'''/* CRISTARIVA — synthèse concise et fluide v10 */
function finalTextBlob(c){
 return [c?.name,c?.definition,c?.meaning,c?.message,c?.reading_relationnel,c?.reading_professionnel,c?.reading_spirituel].filter(Boolean).join(' ').toLocaleLowerCase();
}
function finalContext(){
 const q=(state.question||'').toLocaleLowerCase();
 if(/\b(mon|notre)\s+couple\b|\bcouple\b|\bconjoint\b|\bmari\b|\bépoux\b|\bépouse\b|\bpartenaire actuel/.test(q))return 'couple';
 const f=preciseQuestionFocus();
 if(['love','return','sex','contact'].includes(f))return 'love';
 if(f==='work')return 'work';
 if(f==='money')return 'money';
 if(f==='spirit')return 'spirit';
 return 'general';
}
function finalSemanticKey(c){
 const x=finalTextBlob(c);
 if(/projection|projeter|idéalisation/.test(x))return 'projection';
 if(/jalous|rival|possess|comparaison|concurrence/.test(x))return 'jealousy';
 if(/réconcili|pardon|reprise de dialogue|rapprochement après|retour du lien|se retrouver/.test(x))return 'reconcile';
 if(/pensée persistante|ancien thème|se répète|répét|dans le passé|souvenir|ancien schéma|ancien lien/.test(x))return 'past';
 if(/non[- ]?dit|secret|silence|cach|masque|déni|pas exprimé|n’est pas exprimé|n'est pas exprimé|ambigu/.test(x))return 'hidden';
 if(/patience|retard|attente|délai|plus de temps|lent|stagnation|quinze jours/.test(x))return 'delay';
 if(/lien sensible|émotion profonde|ressenti|sensibilité|inquiétude intime|fluctu|changeant/.test(x))return 'emotion';
 if(/rupture|séparation|éloignement|refus|rejet|fin de cycle|abandon|impasse/.test(x))return 'separation';
 if(/connexion|union|réciproc|engagement|amour|harmonie|partenaire|lien commun|forme commune/.test(x))return 'bond';
 if(/vérité|sincérit|aveu|clarif|révélation|mise au point|dire les choses/.test(x))return 'truth';
 if(/naissance|reset|renouveau|nouveau départ|mise en route|commencement|nouvelle possibilité/.test(x))return 'new';
 if(/libération|revirement|transition|changement|évolution|mouvement|débloc/.test(x))return 'change';
 if(/choix|décision|trancher/.test(x))return 'choice';
 if(/force|maîtrise|équilibre|protection|sagesse|alignement|stabilis/.test(x))return 'strength';
 if(/joie|bonheur|plaisir|succès|favorable|abondance/.test(x))return 'positive';
 if(/travail|work place|collègue|chef|patron|profession|projet/.test(x))return 'work';
 if(/argent|dépense|pauvreté|matériel|financ|abondance/.test(x))return 'money';
 if(/spirit|intuition|karma|divin|éveil|âme|protection/.test(x))return 'spirit';
 return 'neutral';
}
function finalRoleSentence(c,role,en){
 const k=finalSemanticKey(c),ctx=finalContext();
 const fr={
  origin:{
   projection:'La situation est marquée par des attentes ou des interprétations qui demandent encore à être confirmées par les faits.',jealousy:'La confiance semble déjà fragilisée par la comparaison, la jalousie ou la peur de perdre sa place.',reconcile:'Un rapprochement ou une reprise du dialogue est déjà possible.',past:'Un sujet ancien continue d’influencer les échanges.',hidden:'Quelque chose reste difficile à exprimer clairement.',delay:'La situation évolue plus lentement que souhaité.',emotion:'Le lien reste très chargé émotionnellement.',separation:'Une distance ou une fermeture pèse encore sur la relation.',bond:'Le lien reste présent et conserve une possibilité de rapprochement.',truth:'Un besoin de vérité ou de clarification devient central.',new:'Une nouvelle phase commence à se dessiner.',change:'La situation est déjà engagée dans une phase de changement.',choice:'Une décision importante devient difficile à éviter.',strength:'La situation cherche surtout à retrouver plus de stabilité.',positive:'La dynamique de départ est plutôt favorable.',work:'Le contexte professionnel joue un rôle important dans la situation.',money:'Les questions matérielles pèsent sur l’équilibre actuel.',spirit:'L’intuition et le ressenti occupent une place importante.',neutral:'La situation est encore en train de se définir.'
  },
  obstacle:{
   projection:'Le principal risque est de prêter à l’autre des intentions ou des sentiments qui ne sont pas encore confirmés par ses actes.',jealousy:'La jalousie, la comparaison ou la peur d’un tiers fragilisent la confiance.',reconcile:'Le rapprochement reste fragile tant que l’ancien problème n’est pas réellement corrigé.',past:'Le passé revient facilement dans les échanges et empêche d’avancer librement.',hidden:'Des non-dits entretiennent l’incertitude et empêchent encore de savoir clairement ce que chacun ressent ou veut.',delay:'L’attente et le manque de mouvement peuvent finir par peser.',emotion:'Les réactions émotionnelles peuvent amplifier les doutes ou les malentendus.',separation:'La distance ou la fermeture actuelle freine nettement l’évolution.',bond:'Le lien existe, mais il ne suffit pas à résoudre les difficultés de fond.',truth:'Le manque de clarté empêche encore une lecture simple de la situation.',new:'Le changement peut déstabiliser avant d’apporter une amélioration.',change:'L’instabilité rend difficile la construction de repères solides.',choice:'L’hésitation entretient le blocage.',strength:'Un contrôle trop important peut empêcher l’expression spontanée de ce qui est ressenti.',positive:'L’optimisme peut conduire à minimiser une difficulté qui demande pourtant d’être traitée.',work:'Les contraintes professionnelles compliquent la disponibilité ou les échanges.',money:'Les tensions matérielles peuvent alimenter le stress.',spirit:'Le ressenti peut devenir trompeur s’il n’est pas confronté aux faits.',neutral:'Un point reste encore trop flou pour permettre une évolution simple.'
  },
  resource:{
   projection:'Le retour aux faits et à des échanges simples peut rétablir une vision plus juste.',jealousy:'Une réassurance claire et des comportements cohérents peuvent restaurer la confiance.',reconcile:'Une reprise du dialogue, des excuses ou un geste d’apaisement peuvent réellement rouvrir l’échange.',past:'Le fait de distinguer le présent de l’ancien problème peut aider à sortir de la répétition.',hidden:'Une parole plus directe peut débloquer une partie importante de la situation.',delay:'Le temps peut jouer en faveur d’un apaisement, à condition de ne pas forcer le rythme.',emotion:'L’écoute et le calme peuvent transformer une forte sensibilité en meilleure compréhension mutuelle.',separation:'Respecter la distance actuelle peut éviter d’aggraver la fermeture.',bond:'Le lien lui-même reste un point d’appui s’il s’accompagne d’actes réciproques.',truth:'Une mise au point honnête peut remettre la relation sur des bases plus simples.',new:'Accepter une manière différente de fonctionner peut ouvrir une nouvelle phase.',change:'Le changement devient utile s’il permet d’abandonner un schéma devenu lourd.',choice:'Une décision claire peut remettre du mouvement.',strength:'Le calme, la maîtrise et une attitude stable peuvent aider à rétablir l’équilibre.',positive:'La confiance et l’ouverture peuvent soutenir l’évolution.',work:'Une meilleure organisation peut réduire les tensions liées au travail.',money:'Un cadre matériel plus clair peut soulager une partie du stress.',spirit:'L’intuition peut être utile lorsqu’elle reste reliée à des faits concrets.',neutral:'Un échange plus simple et plus concret peut aider à faire évoluer la situation.'
  },
  movement:{
   projection:'La situation peut devenir plus lisible à mesure que les suppositions laissent place à des faits.',jealousy:'Les tensions peuvent diminuer si la confiance est rétablie.',reconcile:'Le lien peut progressivement retrouver davantage de proximité.',past:'Une ancienne dynamique peut enfin perdre de son influence.',hidden:'Les non-dits peuvent commencer à se lever.',delay:'L’évolution reste progressive plutôt qu’immédiate.',emotion:'Les émotions restent fortes, mais elles peuvent devenir plus faciles à comprendre et à exprimer.',separation:'Une prise de distance peut se poursuivre avant qu’une nouvelle position soit possible.',bond:'Un rapprochement peut se construire progressivement.',truth:'La situation devrait gagner en clarté.',new:'Un nouveau fonctionnement peut s’installer.',change:'Une tension peut se relâcher et permettre de sortir d’un ancien schéma.',choice:'Une décision peut faire basculer la situation dans une nouvelle phase.',strength:'L’équilibre peut revenir progressivement.',positive:'La tendance devient plus ouverte et plus constructive.',work:'La situation peut évoluer à mesure que le contexte professionnel se stabilise.',money:'L’apaisement matériel peut améliorer le climat général.',spirit:'Une compréhension plus profonde peut émerger.',neutral:'La situation peut évoluer, mais de manière encore progressive.'
  },
  outcome:{
   projection:'La suite dépendra surtout de la capacité à distinguer les attentes des faits.',jealousy:'La suite dépendra surtout d’un retour à la confiance et de la capacité à distinguer les faits des peurs.',reconcile:'La tendance va vers un rapprochement, à condition que les nouveaux gestes soient plus solides que les anciens problèmes.',past:'La relation peut avancer si elle cesse de rejouer le même scénario.',hidden:'La suite dépendra d’une parole plus claire et de la levée des non-dits.',delay:'L’évolution reste possible, mais elle ne paraît pas immédiate.',emotion:'La relation reste sensible ; son évolution dépendra de la manière dont les émotions seront exprimées et accueillies.',separation:'La tendance reste plutôt à la prise de distance tant que les blocages ne sont pas résolus.',bond:'La tendance va vers un rapprochement ou une définition plus claire du lien.',truth:'La situation devrait devenir plus claire à mesure que chacun exprime plus directement sa position.',new:'Un nouveau départ est possible si les anciens réflexes ne reprennent pas le dessus.',change:'La situation peut réellement changer si l’ancien fonctionnement est abandonné.',choice:'La suite dépend maintenant d’une décision claire.',strength:'Une stabilisation est possible si chacun reste cohérent dans ses actes.',positive:'La tendance générale est favorable, mais elle demande encore à être confirmée par des faits.',work:'L’issue dépendra beaucoup de la manière dont les contraintes professionnelles sont gérées.',money:'L’évolution restera liée à la résolution des tensions matérielles.',spirit:'La compréhension intérieure peut progresser, mais les faits doivent rester le point de repère.',neutral:'La situation peut évoluer, mais elle demande encore des faits concrets pour confirmer sa direction.'
  }
 };
 const enMap={
  past:{origin:'An old issue is still influencing the situation.',obstacle:'The past is still interfering with the present.',resource:'Separating the present from the old pattern can help.',movement:'The old pattern can gradually lose its influence.',outcome:'Progress depends on no longer repeating the same pattern.'},
  hidden:{origin:'Something is still difficult to express clearly.',obstacle:'Unspoken issues are maintaining uncertainty.',resource:'More direct communication can unlock the situation.',movement:'The unspoken issues can begin to clear.',outcome:'The next step depends on clearer communication.'},
  delay:{origin:'The situation is moving more slowly than hoped.',obstacle:'Waiting is becoming part of the difficulty.',resource:'Time can help if the pace is not forced.',movement:'The development remains gradual rather than immediate.',outcome:'Progress is possible, but it does not look immediate.'},
  jealousy:{origin:'Trust already seems fragile.',obstacle:'Jealousy, comparison or fear of a third party can weaken trust.',resource:'Clear reassurance and consistent behaviour can restore confidence.',movement:'Tension can ease if trust returns.',outcome:'The next step depends mainly on rebuilding trust.'},
  bond:{origin:'The bond remains present.',obstacle:'The bond alone is not enough to solve the underlying difficulty.',resource:'Reciprocal actions can strengthen the connection.',movement:'A gradual rapprochement can develop.',outcome:'The overall direction favours greater closeness or a clearer definition of the bond.'},
  neutral:{origin:'The situation is still taking shape.',obstacle:'One point remains too unclear.',resource:'A simpler and more concrete exchange can help.',movement:'The situation can evolve gradually.',outcome:'Concrete facts are still needed to confirm the direction.'}
 };
 if(en){const m=enMap[k]||enMap.neutral;return m[role]||enMap.neutral[role];}
 return (fr[role]&&fr[role][k])||fr[role].neutral;
}
function finalRelationDetail(en){
 if(!state.relation)return '';
 const id=state.relation.id,ctx=finalContext();
 if(ctx==='couple'){
  const fr={96:'L’entourage amical peut jouer un rôle secondaire.',97:'Un contexte familial peut influencer l’équilibre du couple.',98:'Le tirage reste centré sur votre partenaire et votre relation.',99:'Une question liée à un enfant ou à une responsabilité familiale peut peser sur l’équilibre du couple.',100:'Un élément nouveau ou une rencontre peut modifier l’environnement du couple.',101:'Un proche de type fraternel peut intervenir dans le contexte.',102:'Un élément lié au passé affectif peut encore influencer la situation.',103:'Le travail ou un collègue peut avoir une influence indirecte.',104:'Une contrainte ou une décision professionnelle peut avoir un effet indirect sur le couple.',105:'Une connaissance périphérique peut intervenir dans le contexte.',106:'Un élément extérieur encore mal identifié peut intervenir, sans devenir le centre de votre relation.',107:'Une influence extérieure ou un sentiment de rivalité peut intervenir.',108:'Une confidence ou une personne de confiance peut jouer un rôle.',109:'Une attirance extérieure, réelle ou redoutée, peut perturber l’équilibre.',110:'Un contexte professionnel extérieur peut intervenir.',111:'La distance ou l’absence physique pèse sur l’évolution du couple.',112:'Un ancien lien peut encore avoir une influence indirecte.',113:'Le regard ou l’intérêt d’une autre personne peut créer une tension secondaire.',114:'L’avis d’une personne de référence peut influencer une décision.',115:'Une tierce personne ou un message transmis peut faciliter — ou compliquer — la communication.'};
  return en?'An outside factor may also influence the relationship.':(fr[id]||'Un élément extérieur peut aussi influencer la situation.');
 }
 const fr={96:'Une relation amicale joue un rôle important.',97:'Un lien familial est particulièrement concerné.',98:'La situation concerne directement un partenaire.',99:'Un enfant ou une responsabilité liée à un enfant intervient dans la situation.',100:'Une nouvelle rencontre peut jouer un rôle.',101:'Un lien fraternel ou très proche intervient.',102:'Une ancienne relation affective reste influente.',103:'Un collègue intervient dans la situation.',104:'Une personne en position de décision joue un rôle.',105:'Une connaissance périphérique intervient.',106:'Une personne encore inconnue peut entrer dans la situation.',107:'Une rivalité ou une concurrence intervient.',108:'Une personne de confiance joue un rôle.',109:'Une forte attirance intervient sans que le lien soit encore établi.',110:'Un contact professionnel intervient.',111:'La distance fait partie intégrante du lien.',112:'Un ancien lien revient dans le champ de la question.',113:'Un intérêt ou une admiration peut être présent en arrière-plan.',114:'Une personne de référence ou de conseil joue un rôle.',115:'Une tierce personne sert d’intermédiaire.'};
 return en?'A complementary relationship factor also plays a role.':(fr[id]||'Un lien complémentaire joue aussi un rôle.');
}
function finalTimingDetail(en){
 if(!state.date)return '';
 const id=state.date.id;
 const fr={116:'Les premiers signes peuvent apparaître très rapidement.',117:'Un premier changement peut apparaître dans les trois jours.',118:'Un premier changement peut devenir visible dans la semaine.',119:'Les premiers changements pourraient devenir visibles autour d’une quinzaine de jours.',120:'L’évolution peut devenir plus nette d’ici environ trois semaines.',121:'L’évolution se situe plutôt autour d’un mois.',122:'La situation demande environ six semaines pour mûrir.',123:'L’évolution se situe plutôt autour de deux mois.',124:'Le changement se place plutôt dans un horizon de trois mois.',125:'La situation demande un temps plus long, autour de six mois.',126:'La maturation peut s’étendre sur environ neuf mois.',127:'L’évolution s’inscrit dans un cycle long, proche d’un an.',128:'La saison suivante marque le prochain repère important.',129:'Le délai dépend d’un déclencheur concret : message, décision, rencontre ou changement de situation.',130:'Aucune échéance fiable ne se dégage encore.'};
 const enMap={116:'The first signs may appear very soon.',117:'A first change may appear within three days.',118:'A first change may become visible within a week.',119:'The first changes may become visible in about two weeks.',120:'The development may become clearer within about three weeks.',121:'The timing points more toward about one month.',122:'The situation may need around six weeks to mature.',123:'The timing points more toward about two months.',124:'The change sits in a horizon of about three months.',125:'The situation needs a longer period, around six months.',126:'The maturation may extend over about nine months.',127:'The development belongs to a longer cycle, close to one year.',128:'The next season marks the next meaningful time point.',129:'The timing depends on a concrete trigger.',130:'No reliable deadline stands out yet.'};
 return en?(enMap[id]||'The timing remains symbolic.'):(fr[id]||'Le rythme reste symbolique et demande à être confirmé par les faits.');
}
function finalAstroDetail(en){
 if(!state.astro)return '';
 const sig=relevantAstroSignals(state.astro);
 if(!sig.length)return '';
 const k=sig[0].key;
 const fr={opening:'Le contexte actuel favorise plutôt l’ouverture et de nouvelles possibilités.',maturation:'Le contexte actuel demande surtout patience et consolidation.',change:'Le contexte actuel pousse au changement, avec un risque d’instabilité.',sensitivity:'Le contexte actuel accentue la sensibilité : mieux vaut vérifier les impressions par des faits.',action:'Le contexte actuel pousse à agir, mais sans précipiter les décisions.',bond:'Le contexte actuel favorise plutôt le rapprochement et la recherche d’accord.',insight:'Le contexte actuel aide surtout à clarifier ce qui se joue.'};
 const em={opening:'The current climate supports openness and new possibilities.',maturation:'The current climate mainly calls for patience and consolidation.',change:'The current climate pushes for change, with some instability.',sensitivity:'The current climate heightens sensitivity, so impressions should be checked against facts.',action:'The current climate encourages action without rushing decisions.',bond:'The current climate supports rapprochement and agreement.',insight:'The current climate mainly helps clarify what is happening.'};
 return en?(em[k]||em.insight):(fr[k]||fr.insight);
}
function finalLead(en){
 const ctx=finalContext();
 if(en){if(ctx==='couple')return 'In your relationship, ';if(ctx==='love')return 'In your emotional life, ';if(ctx==='work')return 'In your professional life, ';if(ctx==='money')return 'On the material side, ';if(ctx==='spirit')return 'On your personal and spiritual path, ';return 'In the situation you are asking about, ';}
 if(ctx==='couple')return 'Dans votre couple, ';
 if(ctx==='love')return 'Dans votre vie affective, ';
 if(ctx==='work')return 'Sur le plan professionnel, ';
 if(ctx==='money')return 'Sur le plan matériel, ';
 if(ctx==='spirit')return 'Dans votre cheminement personnel et spirituel, ';
 return 'Dans la situation que vous interrogez, ';
}
function finalLowerFirst(s){s=String(s||'').trim();return s?s.charAt(0).toLocaleLowerCase()+s.slice(1):s;}
function literaryFinalSynthesis(){
 const cards=state.draw||[];
 if(!cards.length)return '';
 const en=state.lang==='en';
 let p1='',p2='';
 if(cards.length===1){
  const a=finalRoleSentence(cards[0],'outcome',en);
  p1=finalLead(en)+finalLowerFirst(a);
 }else if(cards.length===3){
  const a=finalRoleSentence(cards[0],'origin',en),b=finalRoleSentence(cards[1],'obstacle',en),c=finalRoleSentence(cards[2],'outcome',en);
  p1=finalLead(en)+finalLowerFirst(a)+' '+b;
  p2=c;
 }else{
  const a=finalRoleSentence(cards[0],'origin',en),b=finalRoleSentence(cards[1],'obstacle',en),c=finalRoleSentence(cards[2],'resource',en),d=finalRoleSentence(cards[3],'movement',en),e=finalRoleSentence(cards[4],'outcome',en);
  p1=finalLead(en)+finalLowerFirst(a)+' '+b;
  p2=c+' '+d+' '+e;
 }
 const extras=[finalRelationDetail(en),finalTimingDetail(en),finalAstroDetail(en)].filter(Boolean);
 let p3='';
 if(extras.length)p3=extras.join(' ');
 const question=state.question?`<p class="reading-question">${en?'Question':'Question'} : « ${readingEscape(state.question)} »</p>`:'';
 return `<div class="reading final-literary"><h3>${en?'Final synthesis':'Synthèse finale'}</h3>${question}<p>${p1}</p>${p2?`<p>${p2}</p>`:''}${p3?`<p>${p3}</p>`:''}</div>`;
}
'''

patterns=[
 r'/\* CRISTARIVA — synthèse finale narrative v9 \*/.*?(?=function renderSynthesis\(\))',
 r'/\* CRISTARIVA — synthèse finale narrative v8 \*/.*?(?=function renderSynthesis\(\))',
 r'/\* CRISTARIVA — synthèse finale littéraire v7 \*/.*?(?=function renderSynthesis\(\))'
]
replaced=False
for pat in patterns:
    s,n=re.subn(pat,lambda m:block+'\n',s,count=1,flags=re.S)
    if n:
        replaced=True
        break
if not replaced:
    idx=s.find('function renderSynthesis(){')
    if idx<0: raise SystemExit('renderSynthesis not found')
    s=s[:idx]+block+s[idx:]

new_render=r'''function renderSynthesis(){
 if(!state.draw.length)return;
 $('#synthesis').innerHTML=literaryFinalSynthesis();
}'''
s,n=re.subn(r'function renderSynthesis\(\)\{.*?\n\}',lambda m:new_render,s,count=1,flags=re.S)
if n!=1: raise SystemExit(f'renderSynthesis replacements: {n}')

p.write_text(s,encoding='utf-8')

sw=Path('service-worker.js')
w=sw.read_text(encoding='utf-8')
w=re.sub(r"const CACHE_NAME='[^']+';","const CACHE_NAME='cristariva-modele-a-v20-20260913-synthese-concise';",w,count=1)
sw.write_text(w,encoding='utf-8')
