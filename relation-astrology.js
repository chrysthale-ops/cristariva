/* CRISTARIVA — chargeur Android/Web + finition narrative finale v5.22, 23 septembre 2026.
   - charge l’astrologie relationnelle et la cohérence de période ;
   - charge l’Oracle Amour et le Tarot divinatoire ;
   - filtre les cartes Relation selon le domaine et la question sans bloquer le tirage ;
   - corrige en dernier ressort les phrases sans sujet dans le récit ;
   - supprime les amorces mécaniques avec « alors » ;
   - conserve une progression avant / maintenant / élan pour les tirages à 3 cartes.
*/
(function(){
  'use strict';

  function loadScript(src,marker,force){
    return new Promise(function(resolve,reject){
      if(!force){
        const exists=[...document.scripts].some(function(s){
          return (marker&&s.dataset&&s.dataset.cristariva===marker)||
            (s.src&&s.src.indexOf(src.split('?')[0].replace('./',''))!==-1);
        });
        if(exists)return resolve();
      }
      const el=document.createElement('script');
      el.src=src;
      el.async=false;
      if(marker)el.dataset.cristariva=marker;
      el.onload=resolve;
      el.onerror=function(){reject(new Error('Impossible de charger '+src));};
      document.body.appendChild(el);
    });
  }

  loadScript('./relation-astrology-core-v1.4.js?v=1.4','relation-astrology-core')
    .then(function(){
      return loadScript('./relation-period-consistency-v1.5.js?v=1.6','relation-period-consistency-v1.6',false);
    })
    .catch(function(e){console.error('CRISTARIVA astrologie relationnelle',e);});

  loadScript('./synthesis-fluid-v3.7.js?v=3.7','synthesis-fluid-v3.7',false)
    .catch(function(e){console.error('CRISTARIVA synthèse fluide',e);});

  const LOVE_SCRIPTS=[
    './oracle-amour-data.js?v=20260918-pdf80',
    './oracle-amour-card62-fix.js?v=20260919-card62',
    './oracle-amour-integration.js?v=20260918-pdf80',
    './oracle-amour-compat.js?v=20260918-pdf80'
  ];

  async function ensureOracleAmour(){
    if(window.__CRISTARIVA_LOVE_DIRECT_BOOTSTRAP__)return window.__CRISTARIVA_LOVE_DIRECT_BOOTSTRAP__;
    window.__CRISTARIVA_LOVE_DIRECT_BOOTSTRAP__=(async function(){
      const hasSentimental=function(){return !!document.querySelector('#domain option[value="Sentimental"]');};
      if(window.AMOUR_DATA&&hasSentimental())return true;
      for(const src of LOVE_SCRIPTS){
        try{await loadScript(src,'love-'+src.split('/').pop().split('?')[0],false);}
        catch(e){console.error('CRISTARIVA Oracle Amour',e);}
      }
      if(window.AMOUR_DATA&&!hasSentimental()){
        try{await loadScript('./oracle-amour-integration.js?v=20260918-pdf80-repair','love-integration-repair',true);}
        catch(e){console.error('CRISTARIVA réparation Sentimental',e);}
      }
      return !!(window.AMOUR_DATA&&hasSentimental());
    })();
    return window.__CRISTARIVA_LOVE_DIRECT_BOOTSTRAP__;
  }

  /* Filtrage contextuel des cartes Relation — Grand Oracle, Oracle Amour et Tarot. */
  const REL_EXCLUDE={
    relations:new Set([103,104,110]),
    love:new Set([97,99,101,103,104,110,114]),
    work:new Set([97,99,101,102,109]),
    social:new Set([103,104,109,110]),
    general:new Set([103,104,109,110])
  };

  function relNorm(value){
    return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  }

  function relationQuestion(){
    return String((typeof state==='object'&&state?.question)||document.querySelector('#question')?.value||'').trim();
  }

  function questionTone(question){
    const q=relNorm(question);
    if(/\b(amour|amoureux|amoureuse|sentimental|romance|couple|crush|attirance|desir|sexualite|sexuel|partenaire amoureux|ex[- ]?partenaire|love|romantic|romance)\b/.test(q))return 'love';
    if(/\b(travail|emploi|profession|professionnel|projet|entreprise|societe|carriere|client|recruteur|recrutement|manager|responsable|collegue|work|job|career|business|project)\b/.test(q))return 'work';
    if(/\b(famille|familial|parent|pere|mere|enfant|fils|fille|frere|soeur|ami|amie|amitie|social|family|parent|child|brother|sister|friend|friendship)\b/.test(q))return 'social';
    return '';
  }

  function relationContext(){
    const domain=String((typeof state==='object'&&state?.domain)||document.querySelector('#domain')?.value||'');
    const d=relNorm(domain);
    const tone=questionTone(relationQuestion());
    if(d.includes('sentimental'))return 'love';
    if(d.includes('profession'))return 'work';
    if(d.includes('relations'))return tone==='love'?'love':tone==='social'?'social':'relations';
    if(d.includes('tarot')){
      if(tone)return tone;
      try{
        if(typeof cr51Scope==='function'){
          const scope=cr51Scope();
          if(scope==='work')return 'work';
          if(scope==='relation')return 'relations';
        }
      }catch(e){}
      return 'general';
    }
    return 'general';
  }

  function isGrandRelationArray(arr){
    if(!Array.isArray(arr)||!arr.length)return false;
    if(typeof DATA==='object'&&Array.isArray(DATA?.relation)&&arr===DATA.relation)return true;
    return arr.every(function(c){return c&&c.group==='relation'&&Number(c.id)>=96&&Number(c.id)<=115;});
  }

  function isLoveRelationArray(arr){
    if(!Array.isArray(arr)||!arr.length)return false;
    if(window.AMOUR_DATA&&Array.isArray(window.AMOUR_DATA.relation)&&arr===window.AMOUR_DATA.relation)return true;
    return arr.every(function(c){return c&&c.oracle==='amour'&&c.group==='relation'&&Number(c.id)>=61&&Number(c.id)<=70;});
  }

  function filteredGrandRelations(arr){
    const context=relationContext();
    const excluded=REL_EXCLUDE[context]||REL_EXCLUDE.general;
    const filtered=arr.filter(function(card){return !excluded.has(Number(card.id));});
    return filtered.length?filtered:arr;
  }

  function filteredLoveRelations(arr){
    const domain=relNorm((typeof state==='object'&&state?.domain)||document.querySelector('#domain')?.value||'');
    if(domain.includes('sentimental'))return arr;
    if(domain.includes('relations')){
      const keep=new Set([62,65,70]);
      if(questionTone(relationQuestion())==='love')keep.add(69);
      const subset=arr.filter(function(card){return keep.has(Number(card.id));});
      return subset.length?subset:arr;
    }
    if(typeof DATA==='object'&&Array.isArray(DATA?.relation))return filteredGrandRelations(DATA.relation);
    return arr;
  }

  function installRelationDomainFilter(){
    try{
      if(typeof window.rand!=='function')return false;
      if(window.rand.__cristarivaRelationFilter)return true;
      const baseRand=window.rand;
      const wrapped=function(arr,n){
        let pool=arr;
        try{
          if(isLoveRelationArray(arr))pool=filteredLoveRelations(arr);
          else if(isGrandRelationArray(arr))pool=filteredGrandRelations(arr);
        }catch(e){pool=arr;}
        return baseRand.call(this,pool,n);
      };
      wrapped.__cristarivaRelationFilter=true;
      wrapped.__cristarivaRelationFilterVersion='2026.09.23-v2';
      window.rand=wrapped;
      return true;
    }catch(e){console.error('CRISTARIVA filtre Relation',e);return false;}
  }

  function updateRelationFilterUI(){
    try{
      const btn=document.querySelector('#relationBtn');
      if(!btn)return;
      const domain=relNorm((typeof state==='object'&&state?.domain)||document.querySelector('#domain')?.value||'');
      const text=btn.previousElementSibling;
      const en=typeof state==='object'&&state?.lang==='en';
      if(domain.includes('sentimental')&&window.AMOUR_DATA?.relation){
        btn.disabled=false;
        if(text)text.textContent=en?'One of the 10 Love Oracle Relationship cards to clarify the person or type of bond.':'Une carte parmi les 10 cartes Relation de l’Oracle Amour pour préciser la personne ou le type de lien.';
        return;
      }
      btn.disabled=false;
      const count=(typeof DATA==='object'&&Array.isArray(DATA?.relation))?filteredGrandRelations(DATA.relation).length:20;
      if(text)text.textContent=en?`One card among ${count} context-appropriate Relationship cards.`:`Une carte parmi ${count} cartes Relation adaptées au domaine et à la question.`;
    }catch(e){}
  }

  function bindRelationFilterUI(){
    if(window.__CRISTARIVA_RELATION_FILTER_UI__)return;
    window.__CRISTARIVA_RELATION_FILTER_UI__=true;
    const domain=document.querySelector('#domain');
    const question=document.querySelector('#question');
    domain?.addEventListener('change',function(){setTimeout(updateRelationFilterUI,0);});
    question?.addEventListener('input',updateRelationFilterUI);
    question?.addEventListener('change',updateRelationFilterUI);
    document.querySelector('#drawBtn')?.addEventListener('click',function(){setTimeout(updateRelationFilterUI,0);});
  }

  function polishRepeatedStoryOpeners(html){
    try{
      if(!html||state.lang==='en')return html;
      const tpl=document.createElement('template');
      tpl.innerHTML=String(html);
      for(const p of tpl.content.querySelectorAll('.story-continuous')){
        const walker=document.createTreeWalker(p,NodeFilter.SHOW_TEXT);
        while(walker.nextNode()){
          const node=walker.currentNode;
          if(node.parentElement.closest('b,strong,a,code'))continue;
          const match=node.textContent.match(/^(\s*)([\s\S]*?)(\s*)$/);
          let s=match[2];
          if(!s)continue;
          s=s.replace(/\balors\b(?!\s+que\b)\s*/gi,'')
            .replace(/\bune évolution où\s+place\b/gi,'une évolution qui place');
          if(typeof cr51NarrativizeFrenchStart==='function')s=cr51NarrativizeFrenchStart(s);
          s=s.replace(/\s+([,.])/g,'$1').replace(/,\s*,/g,', ').replace(/\s{2,}/g,' ');
          node.textContent=match[1]+s+match[3];
        }
      }
      const root=tpl.content.querySelector('.story-reading');
      if(root)root.dataset.storyEngine='5.22';
      return tpl.innerHTML;
    }catch(e){return html;}
  }

  function threeCardPolarity(card){
    const raw=String(card?.category||'').toLowerCase();
    if(raw.includes('positive'))return 1;
    if(raw.includes('négative')||raw.includes('negative'))return -1;
    return 0;
  }

  function threeCardClause(card){
    try{
      const scope=typeof cr51Scope==='function'?cr51Scope():'relation';
      if(typeof cr51Meaning==='function')return String(cr51Meaning(card,scope,false)||'').trim();
    }catch(e){}
    try{
      const d=String(state?.domain||'').toLowerCase();
      const raw=d.includes('profession')?card?.reading_professionnel:d.includes('relation')?card?.reading_relationnel:card?.reading_spirituel;
      const value=String(raw||card?.meaning||card?.definition||'').trim();
      return typeof cr51Esc==='function'?cr51Esc(value):value;
    }catch(e){return '';}
  }

  function threeCardClean(text){
    return String(text||'')
      .replace(/\balors\b(?!\s+que\b)/gi,'')
      .replace(/\s+/g,' ')
      .replace(/\s+([,.;:!?])/g,'$1')
      .trim();
  }

  function threeCardLowerFirst(text){
    const s=String(text||'').trim();
    return s?s.charAt(0).toLocaleLowerCase()+s.slice(1):s;
  }

  function threeCardOpening(text){return 'Au départ, '+threeCardLowerFirst(threeCardClean(text));}
  function threeCardPresent(text){return 'Aujourd’hui, '+threeCardLowerFirst(threeCardClean(text));}
  function threeCardMomentum(text,previousCard,currentCard){
    const before=threeCardPolarity(previousCard),after=threeCardPolarity(currentCard);
    const transition=before<0&&after>0?'Pourtant, ':before>0&&after<0?'Cependant, ':'À partir de là, ';
    return transition+threeCardLowerFirst(threeCardClean(text));
  }

  function enforceThreeCardArc(html,cards){
    try{
      if(!html||state.lang==='en'||!Array.isArray(cards)||cards.length!==3)return html;
      const tpl=document.createElement('template');
      tpl.innerHTML=String(html);
      const p=tpl.content.querySelector('.story-continuous');
      if(!p)return html;
      const first=threeCardClause(cards[0]),present=threeCardClause(cards[1]),momentum=threeCardClause(cards[2]);
      if(!first||!present||!momentum)return html;
      p.innerHTML=[threeCardOpening(first),threeCardPresent(present),threeCardMomentum(momentum,cards[1],cards[2])].join(' ');
      return tpl.innerHTML;
    }catch(e){return html;}
  }

  let installedBase=null;
  function installStoryPolish(){
    try{
      if(typeof window.storyInterpretation!=='function')return false;
      if(window.storyInterpretation.__cristarivaFinalPolish520)return true;
      const base=window.storyInterpretation;
      installedBase=base;
      const wrapped=function(cards){
        let html=base.apply(this,arguments);
        html=enforceThreeCardArc(html,cards);
        return polishRepeatedStoryOpeners(html);
      };
      wrapped.__cristarivaFinalPolish520=true;
      window.storyInterpretation=wrapped;
      window.interpretation=function(cards){return window.storyInterpretation(cards);};
      if(typeof state!=='undefined'&&Array.isArray(state.draw)&&state.draw.length){
        const target=document.getElementById('reading');
        if(target&&/L’histoire racontée par vos cartes|The story told by your cards/.test(target.textContent||'')){
          target.innerHTML=window.storyInterpretation(state.draw);
        }
      }
      return true;
    }catch(e){console.error('CRISTARIVA finition narrative',e);return false;}
  }

  installStoryPolish();

  async function ensureTarot(){
    if(window.__CRISTARIVA_TAROT_READY__)return true;
    try{
      await loadScript('./tarot-divinatoire-data.js?v=20260922-tarot32','tarot-divinatoire-data',false);
      await loadScript('./tarot-divinatoire-integration.js?v=20260922-tarot32','tarot-divinatoire-integration',false);
      return !!window.__CRISTARIVA_TAROT_READY__;
    }catch(e){console.error('CRISTARIVA Tarot divinatoire',e);return false;}
  }

  async function boot(){
    await ensureOracleAmour();
    if(typeof window.storyInterpretation==='function'&&window.storyInterpretation!==installedBase){installStoryPolish();}
    await ensureTarot();
    installRelationDomainFilter();
    bindRelationFilterUI();
    updateRelationFilterUI();
    setTimeout(installStoryPolish,50);
    setTimeout(installStoryPolish,250);
    setTimeout(updateRelationFilterUI,250);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
