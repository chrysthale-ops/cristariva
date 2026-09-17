/* CRISTARIVA — Oracle Amour, édition corrigée septembre 2026. */
(function(){'use strict';
function fallbackImage(id,name){
  const n=String(id).padStart(2,'0');
  const safe=String(name||'CRISTARIVA').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[m]));
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="768" viewBox="0 0 512 768"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#27122e"/><stop offset=".5" stop-color="#8b4058"/><stop offset="1" stop-color="#e69a76"/></linearGradient></defs><rect width="512" height="768" rx="28" fill="url(#g)"/><rect x="22" y="22" width="468" height="724" rx="22" fill="none" stroke="#f0d49c" stroke-width="3"/><text x="256" y="100" text-anchor="middle" fill="#f0d49c" font-family="Georgia,serif" font-size="28">CRISTARIVA</text><text x="256" y="145" text-anchor="middle" fill="#fff2e5" font-family="Georgia,serif" font-size="20">ORACLE AMOUR</text><text x="256" y="370" text-anchor="middle" fill="#fff" font-size="92">♡</text><text x="256" y="560" text-anchor="middle" fill="#fff" font-family="Georgia,serif" font-size="30">${safe}</text><text x="256" y="665" text-anchor="middle" fill="#f0d49c" font-family="Georgia,serif" font-size="24">CARTE ${n}</text></svg>`;
  return 'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg);
}
const imgs=window.AMOUR_IMAGES||{}, rows=window.AMOUR_CARD_DATA||[];
const all=rows.map(r=>{const [id,name,category,definition,keywords]=r,group=id<=60?'main':id<=70?'relation':'dating';const image=imgs[id]||fallbackImage(id,name);const c={id,name,category,definition,keywords,group,oracle:'amour',image,imageEn:image,meaning:definition,message:definition,reading_relationnel:definition,reading_professionnel:definition,reading_spirituel:definition,intensity:''};c.en={name,definition,category,keywords,intensity:'',meaning:definition,message:definition,reading_relationnel:definition,reading_professionnel:definition,reading_spirituel:definition};return c});
window.AMOUR_DATA={main:all.filter(c=>c.group==='main'),relation:all.filter(c=>c.group==='relation'),dating:all.filter(c=>c.group==='dating')};
})();
