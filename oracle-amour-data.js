/* CRISTARIVA — Oracle Amour, édition corrigée septembre 2026. */
(function(){'use strict';
const imgs=window.AMOUR_IMAGES||{}, rows=window.AMOUR_CARD_DATA||[];
const all=rows.map(r=>{const [id,name,category,definition,keywords]=r,group=id<=60?'main':id<=70?'relation':'dating';const c={id,name,category,definition,keywords,group,oracle:'amour',image:imgs[id]||'',imageEn:imgs[id]||'',meaning:definition,message:definition,reading_relationnel:definition,reading_professionnel:definition,reading_spirituel:definition,intensity:''};c.en={name,definition,category,keywords,intensity:'',meaning:definition,message:definition,reading_relationnel:definition,reading_professionnel:definition,reading_spirituel:definition};return c});
window.AMOUR_DATA={main:all.filter(c=>c.group==='main'),relation:all.filter(c=>c.group==='relation'),dating:all.filter(c=>c.group==='dating')};
})();
