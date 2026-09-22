/* CRISTARIVA — correctif Tarot divinatoire 2026-09-22 */
(function(){
'use strict';
const FR={1:'Le Passage Secret',2:'La Flamme Retrouvée',3:'Le Messager de Minuit',4:'Les Deux Chemins',5:'Le Masque qui Tombe',6:'La Promesse',7:'L’Éclipse',8:'Le Fil Invisible',9:'La Porte Ouverte',10:'Le Retour'};
const EN={1:'The Secret Passage',2:'The Rekindled Flame',3:'The Midnight Messenger',4:'The Two Paths',5:'The Falling Mask',6:'The Promise',7:'The Eclipse',8:'The Invisible Thread',9:'The Open Door',10:'The Return'};
function repair(card){if(!card||card.oracle!=='tarot')return card;const id=Number(card.id);card.name=FR[id]||card.name;if(card.en)card.en.name=EN[id]||card.en.name;const p=`./cards/tarot/${String(id).padStart(3,'0')}.webp?v=20260922c`;card.image=p;card.imageEn=p;return card;}
function repairAll(){try{if(window.TAROT_DATA){(TAROT_DATA.main||[]).forEach(repair);(TAROT_DATA.all||[]).forEach(repair);}if(window.state){(state.draw||[]).forEach(repair);repair(state.relation);repair(state.date);}}catch(e){}}
if(typeof window.cr363Title==='function'){const prev=window.cr363Title;window.cr363Title=function(card){if(card?.oracle==='tarot'){repair(card);return state?.lang==='en'?(card.en?.name||card.name):card.name;}return prev(card);};}
if(typeof window.cardName==='function'){const prev=window.cardName;window.cardName=function(card){if(card?.oracle==='tarot'){repair(card);return state?.lang==='en'?(card.en?.name||card.name):card.name;}return prev(card);};}
repairAll();
document.addEventListener('click',()=>setTimeout(repairAll,0),true);
document.addEventListener('change',()=>setTimeout(repairAll,0),true);
window.CR_TAROT_HOTFIX_VERSION='2026.09.22c';
})();
