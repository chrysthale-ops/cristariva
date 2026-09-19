/* CRISTARIVA — correction visuelle carte 62 de l'Oracle Amour, 19 septembre 2026. */
(function(){
  'use strict';
  if(!window.AMOUR_DATA) return;
  const card=(window.AMOUR_DATA.relation||[]).find(c=>Number(c.id)===62);
  if(!card) return;
  const corrected='./cards/amour/062.webp?v=20260919-final';
  card.image=corrected;
  card.imageEn=corrected;
})();
