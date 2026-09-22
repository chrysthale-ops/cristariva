/* CRISTARIVA — correctif Tarot divinatoire 2026-09-22
   Corrige les titres du Tarot afin qu'ils ne soient pas remplacés par
   les titres du grand oracle qui utilisent les mêmes numéros 1 à 10.
   Force également les 10 illustrations originales WebP.
*/
(function(){
  'use strict';

  const FR = {
    1:'Le Passage Secret',
    2:'La Flamme Retrouvée',
    3:'Le Messager de Minuit',
    4:'Les Deux Chemins',
    5:'Le Masque qui Tombe',
    6:'La Promesse',
    7:'L’Éclipse',
    8:'Le Fil Invisible',
    9:'La Porte Ouverte',
    10:'Le Retour'
  };
  const EN = {
    1:'The Secret Passage',
    2:'The Rekindled Flame',
    3:'The Midnight Messenger',
    4:'The Two Paths',
    5:'The Falling Mask',
    6:'The Promise',
    7:'The Eclipse',
    8:'The Invisible Thread',
    9:'The Open Door',
    10:'The Return'
  };

  function repair(card){
    if(!card || card.oracle!=='tarot') return card;
    const id = Number(card.id);
    card.name = FR[id] || card.name;
    if(card.en) card.en.name = EN[id] || card.en.name;
    const path = `./cards/tarot/${String(id).padStart(3,'0')}.webp?v=20260922b`;
    card.image = path;
    card.imageEn = path;
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
  window.CR_TAROT_HOTFIX_VERSION = '2026.09.22b';
})();
