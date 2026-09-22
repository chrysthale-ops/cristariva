/* CRISTARIVA — correctif Tarot divinatoire 2026-09-22
   Corrige les titres du Tarot afin qu'ils ne soient pas remplacés par
   les titres du grand oracle qui utilisent les mêmes numéros.
   Préserve les 32 identités et leurs illustrations WebP.
*/
(function(){
  'use strict';

  function repair(card){
    if(!card||card.oracle!=='tarot')return card;
    const identity=window.CR_TAROT_IDENTITIES?.[Number(card.id)];
    if(identity){card.name=identity.name;if(card.en)card.en.name=identity.enName;card.image=identity.image;card.imageEn=identity.imageEn;}
    return card;
  }

  function repairAll(){
    try {
      if(window.TAROT_DATA){
        (TAROT_DATA.main||[]).forEach(repair);
        (TAROT_DATA.all||[]).forEach(repair);
      }
      if(window.state){
        (state.draw||[]).forEach(repair);
        repair(state.relation);
        repair(state.date);
      }
    } catch(e) {}
  }

  // Le verrou des titres du grand oracle ne doit jamais renommer une carte Tarot.
  if(typeof window.cr363Title === 'function'){
    const previous = window.cr363Title;
    window.cr363Title = function(card){
      if(card?.oracle === 'tarot'){
        repair(card);
        return state?.lang === 'en' ? (card.en?.name || card.name) : card.name;
      }
      return previous(card);
    };
  }

  if(typeof window.cardName === 'function'){
    const previousCardName = window.cardName;
    window.cardName = function(card){
      if(card?.oracle === 'tarot'){
        repair(card);
        return state?.lang === 'en' ? (card.en?.name || card.name) : card.name;
      }
      return previousCardName(card);
    };
  }

  repairAll();
  document.addEventListener('click', () => setTimeout(repairAll, 0), true);
  document.addEventListener('change', () => setTimeout(repairAll, 0), true);
  window.CR_TAROT_HOTFIX_VERSION = '2026.09.22-tarot32';
})();
