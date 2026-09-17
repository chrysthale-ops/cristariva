/* CRISTARIVA — compatibilité complète Oracle Amour avec les moteurs existants */
(function(){'use strict';
  const LOVE_DOMAIN='Sentimental';
  const isLoveCard=c=>c&&c.oracle==='amour';
  const isLoveDating=c=>isLoveCard(c)&&c.group==='dating';

  function addDays(date,n){const d=new Date(date);d.setDate(d.getDate()+n);return d;}
  function addMonths(date,n){const d=new Date(date);d.setMonth(d.getMonth()+n);return d;}
  function addYears(date,n){const d=new Date(date);d.setFullYear(d.getFullYear()+n);return d;}

  /* Les cartes Datation de l'Oracle Amour pilotent les mêmes analyses astrologiques. */
  if(typeof cr3TimingWindow==='function'){
    const previousTimingWindow=cr3TimingWindow;
    cr3TimingWindow=function(card,readingMoment,en=false){
      if(!isLoveDating(card))return previousTimingWindow(card,readingMoment,en);
      const start=new Date(readingMoment||new Date());
      let end=null;
      switch(Number(card.id)){
        case 72:end=addDays(start,7);break;
        case 73:end=addDays(start,15);break;
        case 74:end=addMonths(start,1);break;
        case 75:end=addMonths(start,2);break;
        case 76:end=addMonths(start,3);break;
        case 77:end=addMonths(start,6);break;
        case 78:end=addYears(start,1);break;
        case 79:end=addYears(start,2);break;
        case 71:case 80:default:end=null;
      }
      const label=en?`Timing card: ${card.en?.name||card.name}`:`Carte Datation : ${card.name}`;
      return {card,start,end,label};
    };
  }

  /* Les garde-fous de datation existants travaillent historiquement avec les IDs 116–130.
     On leur présente donc un ID équivalent sans modifier la carte affichée. */
  if(typeof cr37RelevantWindows==='function'){
    const previousRelevantWindows=cr37RelevantWindows;
    const equivalentId={71:129,72:118,73:119,74:121,75:123,76:124,77:125,78:127,79:127,80:130};
    cr37RelevantWindows=function(a,theme,window,intent){
      const card=window?.card;
      if(!isLoveDating(card))return previousRelevantWindows(a,theme,window,intent);
      const mapped={...card,id:equivalentId[Number(card.id)]||card.id};
      return previousRelevantWindows(a,theme,{...window,card:mapped},intent);
    };
  }

  /* Le domaine Sentimental est traité comme relationnel par les pondérations astrologiques. */
  if(typeof cr33Intent==='function'){
    const previousIntent=cr33Intent;
    cr33Intent=function(){
      const out=previousIntent();
      if(state?.domain===LOVE_DOMAIN){
        out.couple=true;
        const id=Number(state?.relation?.id||0);
        if(id===62)out.newPerson=true;
        if(id===61||id===65)out.past=true;
        out.relationId=id;
      }
      return out;
    };
  }

  if(typeof cr33ExpectedDevelopment==='function'){
    const previousExpected=cr33ExpectedDevelopment;
    cr33ExpectedDevelopment=function(intent,en=false){
      if(state?.domain!==LOVE_DOMAIN)return previousExpected(intent,en);
      const id=Number(state?.relation?.id||0);
      const fr={
        61:'une évolution concernant un ex-partenaire, à confirmer par les actes présents',
        62:'l’entrée ou l’évolution d’une personne nouvelle dans votre vie sentimentale',
        63:'une attirance qui peut devenir plus concrète si elle est réciproque',
        64:'l’évolution possible d’une amitié vers un registre amoureux',
        65:'une réactivation ou une clarification concernant une personne du passé',
        66:'une évolution du partenariat sentimental actuellement vécu',
        67:'une évolution d’un lien amoureux marqué par la distance',
        68:'une clarification ou une évolution d’une relation tenue discrète ou secrète',
        69:'une évolution dépendant de la disponibilité réelle de la personne concernée',
        70:'une clarification du statut d’une relation encore non définie'
      };
      const eng={
        61:'a development involving a former partner, to be confirmed by present actions',
        62:'the arrival or development of a new person in your love life',
        63:'an attraction becoming more concrete if it is reciprocal',
        64:'a friendship potentially developing into a romantic bond',
        65:'renewed contact or clarification involving someone from the past',
        66:'a development in the current romantic partnership',
        67:'a development in a long-distance love relationship',
        68:'clarification or development in a private or secret relationship',
        69:'a development dependent on the other person’s real availability',
        70:'clarification of a relationship whose status is not yet defined'
      };
      return (en?eng:fr)[id]||previousExpected(intent,en);
    };
  }

  if(typeof cr32QuestionLink==='function'){
    const previousQuestionLink=cr32QuestionLink;
    cr32QuestionLink=function(ctx,en=false){
      if(ctx?.domain!==LOVE_DOMAIN)return previousQuestionLink(ctx,en);
      const q=ctx.q?`« ${typeof cr3Escape==='function'?cr3Escape(ctx.q):ctx.q} »`:'';
      return en
        ?`For the love question ${q}, the period is read through attraction, feelings, reciprocity, communication, commitment and the concrete choices made by the people involved.`
        :`Pour la question sentimentale ${q}, la période se lit à travers l’attirance, les sentiments, la réciprocité, la communication, l’engagement et les choix concrets des personnes concernées.`;
    };
  }

  /* Rafraîchit les zones déjà rendues après l'installation des adaptations. */
  try{
    if(state?.astro&&typeof formatAstroResult==='function'){
      const out=document.getElementById('astroResult');
      if(out)out.innerHTML=formatAstroResult();
    }
    if(typeof renderSynthesis==='function'&&state?.draw?.length)renderSynthesis();
  }catch(e){}
})();
