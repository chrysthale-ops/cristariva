/* Vignettes de consultation uniquement ; les fiches et tirages gardent leurs images détaillées. */
(function(){
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 window.CR_CATALOG_IMAGE_HTML=function(card,deck,name,index,original){
  const lang=typeof state!=='undefined'&&state.lang==='en'?'en':'fr';
  const image=window.CR_CATALOG_THUMBNAILS?.decks?.[deck]?.[String(card.id)]?.[lang];
  const dimensions=image?` width="${image.width}" height="${image.height}"`:'';
  return `<img src="${esc(image?.src||original)}" alt="${esc(name)}"${dimensions} loading="${index<6?'eager':'lazy'}" decoding="async" fetchpriority="${index<2?'high':'auto'}">`;
 };
})();
