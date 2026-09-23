/* CRISTARIVA — synthèse générale fluide v3.8
   Transforme la synthèse du domaine Général / spirituel en réponse continue
   à la question, sans exposer la mécanique du tirage (début, centre, issue,
   première/dernière carte, etc.).
   Supprime aussi les répétitions mécaniques de « Il est ici question… »
   dans les récits affichés.
*/
const CRISTARIVA_FLUID_SYNTHESIS_VERSION='3.8';

(function(){
  'use strict';

  function family(card){
    try{if(typeof cr363GeneralFamily==='function')return cr363GeneralFamily(card);}catch(e){}
    return 'neutral';
  }

  function middle(cards){
    try{if(typeof cr363GeneralMiddle==='function')return cr363GeneralMiddle(cards);}catch(e){}
    if(!Array.isArray(cards)||cards.length<3)return null;
    return cards[Math.floor(cards.length/2)]||null;
  }

  function opening(card){
    const map={
      tension:'une tension ou un frein demande d’abord à être reconnu sans être amplifié',
      distance:'un besoin de recul ou de protection modifie actuellement votre manière d’aborder la situation',
      choice:'une orientation cherche à se préciser : quelque chose demande à être choisi, hiérarchisé ou assumé',
      past:'un élément déjà connu continue d’influencer le présent et demande à être regardé autrement',
      clarity:'un besoin de compréhension plus nette se fait sentir, avec la nécessité de distinguer les faits des suppositions',
      change:'une transformation est déjà engagée et rend difficile le maintien de l’ancien fonctionnement',
      opening:'une possibilité nouvelle devient plus visible et crée un mouvement d’ouverture',
      stability:'le besoin de retrouver un axe plus stable et plus cohérent devient prioritaire',
      feeling:'les émotions et ce qui est réellement ressenti prennent une place importante dans la situation',
      inner:'une compréhension intérieure plus fine cherche à émerger avant toute décision extérieure',
      time:'le rythme devient essentiel : la situation semble demander de progresser sans précipiter les étapes',
      neutral:'un élément important de la situation demande à être regardé avec davantage d’attention'
    };
    return map[family(card)]||map.neutral;
  }

  function transition(card){
    if(!card)return'';
    const map={
      tension:'Une résistance ou une contradiction peut toutefois ralentir ce mouvement ; mieux vaut la comprendre que chercher à la contourner.',
      distance:'Un besoin de distance vient toutefois filtrer ce mouvement et aide à distinguer ce qui mérite réellement d’être poursuivi.',
      choice:'Cette évolution conduit ensuite à un choix plus net, car rester entre plusieurs directions entretient surtout l’incertitude.',
      past:'Ce mouvement réactive en parallèle quelque chose du passé, qui gagne à être compris sans être reproduit automatiquement.',
      clarity:'La situation devient progressivement plus lisible lorsque les mots, les faits ou une information précise remplacent les suppositions.',
      change:'Cette dynamique entraîne aussi un changement de cadre ou de regard qui ne permet plus de continuer exactement comme auparavant.',
      opening:'Une possibilité constructive accompagne ce mouvement et peut devenir un véritable levier si elle trouve une traduction concrète.',
      stability:'La progression passe alors par davantage de stabilité, de continuité et de cohérence dans les choix.',
      feeling:'Les émotions deviennent également déterminantes ; elles gagnent à être reconnues sans être prises à elles seules pour des certitudes.',
      inner:'Cette évolution invite aussi à ajuster votre perception intérieure avant de tirer une conclusion définitive.',
      time:'Le rythme reste un facteur important : ce qui évolue a besoin de temps pour devenir suffisamment clair.',
      neutral:'Un autre élément vient nuancer cette évolution et empêche de réduire la situation à une seule lecture.'
    };
    return map[family(card)]||map.neutral;
  }

  function conclusion(card){
    const map={
      tension:'La suite dépendra surtout de la manière dont ce point de friction pourra être apaisé et clarifié, sans forcer une résolution prématurée.',
      distance:'La suite devient plus lisible lorsque l’espace nécessaire est respecté et que chacun des éléments peut retrouver sa juste place.',
      choice:'La situation devrait gagner en cohérence dès qu’une direction sera réellement privilégiée et assumée.',
      past:'Ce qui revient du passé semble surtout demander à être transformé afin de ne pas reproduire exactement le même scénario.',
      clarity:'La suite devrait devenir plus lisible à mesure qu’une parole, un constat ou une information précise permettra de sortir des suppositions.',
      change:'La dynamique conduit vers une forme nouvelle ; avancer suppose donc d’accepter que la suite ne reproduise pas exactement l’équilibre précédent.',
      opening:'Une possibilité constructive peut maintenant progresser ou se débloquer si elle est concrètement saisie.',
      stability:'La tendance va vers davantage de consolidation, avec moins de dispersion et plus de continuité dans les choix.',
      feeling:'La suite dépendra de la manière dont les émotions pourront trouver une expression concrète, équilibrée et cohérente.',
      inner:'La compréhension qui se dégage peut modifier votre manière d’agir ou de choisir avant même qu’un événement extérieur ne change réellement la situation.',
      time:'L’évolution paraît progressive : le bon rythme compte davantage ici qu’une réponse immédiate ou spectaculaire.',
      neutral:'La situation reste ouverte, mais les prochains faits devraient permettre d’en préciser plus nettement la direction.'
    };
    return map[family(card)]||map.neutral;
  }

  function fluidThread(cards){
    if(!Array.isArray(cards)||!cards.length)return'';
    const first=opening(cards[0]);
    if(cards.length===1)return first.charAt(0).toUpperCase()+first.slice(1)+'.';
    const pivot=transition(middle(cards));
    return (first.charAt(0).toUpperCase()+first.slice(1)+'. '+pivot).trim();
  }

  function fluidOutcome(cards){
    if(!Array.isArray(cards)||!cards.length)return'';
    return conclusion(cards[cards.length-1]);
  }

  try{
    if(typeof cr367GeneralThread==='function')cr367GeneralThread=fluidThread;
    if(typeof cr367GeneralOutcome==='function')cr367GeneralOutcome=fluidOutcome;
  }catch(e){}

  function articleAfterQuestion(raw){
    const a=String(raw||'').toLowerCase().replace("'",'’');
    if(a==='d’un')return'un';
    if(a==='d’une')return'une';
    if(a==='de la')return'la';
    if(a==='du')return'le';
    if(a==='des')return'des';
    if(a==='de l’')return'l’';
    return raw;
  }

  function varyQuestionOpeners(root){
    try{
      if(!root)return;
      let occurrence=0;
      const openers=[
        'Le tirage évoque',
        'La suite fait apparaître',
        'Cette dynamique met en lumière',
        'Un autre aspect concerne'
      ];
      const scopes=root.matches?.('.story-continuous')?[root]:[...root.querySelectorAll('.story-continuous')];
      for(const scope of scopes){
        const walker=document.createTreeWalker(scope,NodeFilter.SHOW_TEXT);
        while(walker.nextNode()){
          const node=walker.currentNode;
          if(node.parentElement?.closest('b,strong,a,code'))continue;
          const before=node.textContent;
          const after=before.replace(/\bIl est ici question\s+(d[’']un|d[’']une|de la|du|des|de l[’'])\s+/gi,function(_,article){
            const opener=openers[occurrence%openers.length];
            occurrence++;
            return opener+' '+articleAfterQuestion(article)+' ';
          });
          if(after!==before)node.textContent=after;
        }
      }
    }catch(e){}
  }

  function installStoryWordingGuard(){
    const reading=document.getElementById('reading');
    if(!reading||reading.__cristarivaQuestionOpenerGuard)return;
    reading.__cristarivaQuestionOpenerGuard=true;
    varyQuestionOpeners(reading);
    const observer=new MutationObserver(function(){varyQuestionOpeners(reading);});
    observer.observe(reading,{childList:true,subtree:true,characterData:true});
  }

  installStoryWordingGuard();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installStoryWordingGuard,{once:true});

  /* Rafraîchit immédiatement une synthèse déjà affichée. */
  try{
    if(typeof renderSynthesis==='function'&&state?.draw?.length)renderSynthesis();
  }catch(e){}
})();
