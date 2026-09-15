/* CRISTARIVA — synthèse finale sensible au domaine v3.6.7 */
const CRISTARIVA_SYNTHESIS_FRENCH_FIX_VERSION='3.6.7';
const cr367Legacy=typeof cr362GlobalSynthesis==='function'?cr362GlobalSynthesis:null;
function cr367Esc(v){try{return typeof cr362Esc==='function'?cr362Esc(v):String(v||'');}catch(e){return String(v||'');}}
function cr367Cap(v){const s=String(v||'').trim();return s?s.charAt(0).toUpperCase()+s.slice(1):'';}
function cr367Scope(){const d=String(state?.domain||'').toLowerCase();if(/général|general|spirit/.test(d))return'general';if(/profession|projet|work/.test(d))return'work';return'relation';}

function cr367GeneralThread(cards){
  const n=(cards||[]).map(c=>String(c?.name||'').toLowerCase()),p=[];
  if(n.some(x=>/éveil|eveil/.test(x)))p.push('une prise de conscience plus fine paraît déjà engagée');
  if(n.some(x=>/ancrage/.test(x)))p.push('elle demande maintenant à être traduite dans le quotidien et dans des choix concrets');
  if(n.some(x=>/rythme|cycle/.test(x)))p.push('la suite semble devoir respecter votre propre cadence plutôt que chercher une réponse immédiate');
  if(n.some(x=>/origine/.test(x)))p.push('une partie de la réponse se trouve dans ce qui vous a construit en profondeur');
  if(n.some(x=>/retour|passé|passe/.test(x)))p.push('un ancien thème revient surtout pour être compris autrement');
  if(n.some(x=>/percée|percee|ouverture/.test(x)))p.push('un verrou peut céder et rendre la direction plus lisible');
  return p.length?cr367Cap(p.join(' ; '))+'.':'Le tirage décrit surtout une évolution intérieure qui cherche à devenir plus consciente et plus concrète.';
}

function cr367GeneralRelation(){
  const id=Number(state?.relation?.id||0);if(!id)return'';
  let t='une personne ou un contexte extérieur peut apporter un élément utile à votre cheminement';
  if([96,108].includes(id))t='un ami, un confident ou une relation de confiance peut servir de relais';
  else if([97,101].includes(id))t='la famille ou un proche peut constituer un repère important';
  else if([102,112].includes(id))t='un ancien contact ou une situation du passé peut retrouver une utilité nouvelle';
  else if(id===103)t='le cadre professionnel quotidien peut devenir un terrain concret d’application';
  else if(id===104)t='une personne en position d’autorité ou de responsabilité peut influencer la mise en œuvre';
  else if(id===110)t='un projet, un réseau ou une activité professionnelle peut devenir le terrain où cette orientation prend forme';
  else if(id===114)t='un mentor, un conseiller ou une personne ressource peut jouer un rôle de transmission';
  else if(id===115)t='un intermédiaire ou un réseau peut ouvrir l’accès à une opportunité utile';
  else if(id===111)t='la distance peut vous obliger à élargir votre perspective ou à changer de cadre';
  else if(id===107)t='la comparaison ou la concurrence peut vous aider à clarifier ce qui compte réellement pour vous';
  else if(id===99)t='une responsabilité de protection ou de soin peut jouer un rôle structurant';
  else if(id===109)t='une personne, une activité ou une possibilité très attirante peut révéler ce qui vous motive profondément';
  else if([98,100,105,106,113].includes(id))t='une personne de votre environnement, connue ou nouvelle, peut apporter une impulsion ou un éclairage utile sans que la question devienne sentimentale';
  return `La carte Relation est ici un contexte complémentaire : ${t}.`;
}

function cr367GeneralOutcome(cards){
  let k='neutral';try{if(typeof finalSemanticKey==='function')k=finalSemanticKey(cards[cards.length-1]);}catch(e){}
  const m={delay:'Cette orientation semble devoir mûrir progressivement plutôt que se révéler d’un seul coup.',spirit:'Le tirage met l’accent sur une évolution de conscience et sur une autre manière de comprendre votre trajectoire.',choice:'La réponse passe par un choix assumé plutôt que par le maintien de plusieurs directions concurrentes.',truth:'La compréhension devient plus nette à mesure que vous nommez ce qui vous anime réellement.',new:'Un nouveau chapitre paraît s’ouvrir dans votre manière de donner du sens à votre parcours.',change:'Un changement de repères semble nécessaire pour faire émerger une direction plus juste.',work:'Le travail ou un projet peut devenir un terrain concret d’application de ce que vous cherchez à construire.',positive:'Le mouvement général favorise une clarification et une mise en œuvre plus concrète.',neutral:'La direction se précisera lorsque ce qui est compris intérieurement commencera à se traduire dans des choix concrets.'};
  return m[k]||m.neutral;
}

function cr367GeneralNatal(a){
  if(!a||typeof cr34BigThree!=='function')return'';
  try{const b=cr34BigThree(a,false),s=b?.sun||'',m=b?.moon||'',asc=b?.asc||'';
    const sm={'Poissons':'une sensibilité intuitive très réceptive','Bélier':'un besoin d’initiative et de mouvement','Taureau':'une recherche de continuité et de solidité','Gémeaux':'une curiosité qui avance par compréhension et échanges','Cancer':'une forte sensibilité à ce qui nourrit et sécurise','Lion':'un besoin d’expression personnelle et de création','Vierge':'une recherche d’utilité et de cohérence concrète','Balance':'une recherche d’équilibre et de justesse','Scorpion':'un besoin d’aller au fond des choses et de transformer','Sagittaire':'une quête de sens et d’élargissement','Capricorne':'un besoin de construire sur des bases durables','Verseau':'un besoin d’autonomie et d’originalité'};
    const mm={'Taureau':'un besoin intérieur d’assises stables et tangibles','Bélier':'un besoin de franchise et d’élan','Gémeaux':'un besoin de mettre l’expérience en mots','Cancer':'un besoin de sécurité émotionnelle','Lion':'un besoin de chaleur et de reconnaissance','Vierge':'un besoin de comprendre et d’ordonner ce qui est ressenti','Balance':'un besoin d’harmonie','Scorpion':'une vie intérieure profonde et intense','Sagittaire':'un besoin d’espace et de liberté','Capricorne':'un besoin de structure','Verseau':'un besoin d’autonomie intérieure','Poissons':'un besoin de douceur et de sens'};
    const atext=asc==='Vierge'?' Votre manière d’avancer vous pousse en plus à vérifier, organiser et rendre les choses praticables.':'';
    return `Votre thème réunit ${sm[s]||'une recherche personnelle de sens'} et ${mm[m]||'un besoin intérieur de cohérence'}.${atext} Pour une question d’orientation, ce qui vous correspond durablement doit donc à la fois résonner intérieurement et pouvoir prendre une forme réelle dans votre vie.`;
  }catch(e){return'';}}

function cr367PickHit(a){
  if(!a||!state?.date)return null;try{const i=cr33Intent(),t=cr3DominantTheme(state.draw||[],false),w=cr3TimingWindow(state.date,cr3ReadingMoment(),false);let h=typeof cr37RelevantWindows==='function'?cr37RelevantWindows(a,t,w,i)||[]:[];if(h[0])return h[0];const p=cr3PeriodSummary(a,t,w,false);return cr33BestWindow(p,i);}catch(e){return null;}}
function cr367Timing(a,general=false){
  const h=cr367PickHit(a);if(!h)return'';const d=cr3Date(h.bestDate,false),asp=String(h.name||'').toLowerCase(),tr=String(h.tr||''),na=String(h.na||''),adj=['Lune','Vénus'].includes(na)?'natale':'natal',co=asp==='conjonction'?'avec':'à';
  const gm={'Jupiter':'élargit le champ des possibles et renforce la confiance pour explorer une direction plus vaste','Vénus':'aide à reconnaître ce qui correspond davantage à vos valeurs et à vos attirances profondes','Mars':'renforce l’élan pour agir, décider ou donner une forme concrète à ce qui vous mobilise','Saturne':'favorise la structuration et le tri entre ce qui peut durer et ce qui reste fragile','Uranus':'peut ouvrir une voie inattendue ou vous aider à sortir d’un cadre devenu trop étroit','Neptune':'accentue la perception intuitive et la quête de sens'};
  const rm={'Jupiter':'favorise un climat plus ouvert et plus confiant','Vénus':'met davantage en valeur l’agrément et la qualité des échanges','Mars':'donne plus d’élan pour exprimer ou décider','Saturne':'invite à consolider ce qui mérite de durer','Uranus':'peut provoquer une ouverture inattendue','Neptune':'accentue la sensibilité tout en demandant de rester attentif aux projections'};
  const eff=(general?gm:rm)[h.tr]||'met davantage en relief les enjeux de cette période';
  return `${general?'Autour du':'Côté calendrier, le passage le plus porteur se situe autour du'} ${d}${general?',':' ;'} le ${asp} de ${tr} ${co} votre ${na} ${adj} ${eff}.`;
}

function cr367RelationLead(){
  const id=Number(state?.relation?.id||0);const raw=typeof cr362RelationAnswer==='function'?cr362RelationAnswer(false):'la situation gagne progressivement en netteté';
  const map={109:'l’attirance paraît ouvrir la dynamique avant que la relation ne trouve sa forme',110:'un cadre pratique, professionnel ou de réseau pourrait ouvrir la voie avant que la dimension personnelle ne se précise',113:'une personne déjà réceptive à votre présence pourrait se montrer plus clairement',102:'un élément du passé semble susceptible de revenir dans le présent sous une autre forme',112:'un ancien lien pourrait reprendre place, mais sur des bases différentes',106:'une personne encore inconnue pourrait entrer progressivement dans la situation',100:'une présence nouvelle pourrait prendre progressivement davantage de place'};
  return map[id]||raw;
}
function cr367RelationNatal(a){if(!a||typeof cr34BigThree!=='function')return'';try{const b=cr34BigThree(a,false),s=b?.sun,m=b?.moon;return `Votre thème associe ${s==='Poissons'?'une perception très intuitive des ambiances':'une sensibilité personnelle marquée'} à ${m==='Taureau'?'un besoin d’assises affectives stables':'un besoin de repères émotionnels clairs'}. Vous pouvez ainsi ressentir rapidement le potentiel d’un échange, tout en ayant besoin que les faits lui donnent ensuite une consistance réelle.`;}catch(e){return'';}}

function cr367GlobalSynthesis(a){
  const en=typeof cr362En==='function'?cr362En():state?.lang==='en';if(en&&cr367Legacy)return cr367Legacy(a);
  const cards=state?.draw||[];if(!cards.length)return'';const q=(state?.question||'').trim();
  let parts=[];
  if(cr367Scope()==='general'){
    const core=cr367GeneralThread(cards);parts=[q?`Pour « ${cr367Esc(q)} », ${core.charAt(0).toLowerCase()+core.slice(1)}`:core,cr367GeneralOutcome(cards),cr367GeneralRelation(),cr367GeneralNatal(a),cr367Timing(a,true)];
  }else{
    const lead=cr367RelationLead();parts=[q?`Pour « ${cr367Esc(q)} », ${lead}.`:`${cr367Cap(lead)}.`,typeof cr362OutcomeNuance==='function'?cr362OutcomeNuance(cards,false):'',cr367RelationNatal(a),cr367Timing(a,false)];
  }
  const text=parts.filter(Boolean).join(' ').replace(/\s+/g,' ').trim();return `<div class="story-reading cr3-global cr362-global" data-global-synthesis="${CRISTARIVA_SYNTHESIS_FRENCH_FIX_VERSION}"><h3>CRISTARIVA — synthèse générale</h3><p>${text}</p></div>`;
}
cr362GlobalSynthesis=cr367GlobalSynthesis;if(typeof cr33GlobalSynthesis==='function')cr33GlobalSynthesis=cr367GlobalSynthesis;if(typeof cr3Synthesis==='function')cr3Synthesis=a=>cr367GlobalSynthesis(a);if(typeof renderSynthesis==='function'){renderSynthesis=function(){if(!state?.draw?.length)return;const b=document.getElementById('synthesis');if(b)b.innerHTML=cr367GlobalSynthesis(state.astro||null);};renderSynthesis();}
