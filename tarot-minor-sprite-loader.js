/* CRISTARIVA — 56 arcanes mineurs HD individuels — 2026-09-26. */
(function(){
'use strict';
if(window.CR_TAROT_MINOR_IMAGES_READY)return;
const BASE='./cards/tarot/cartes mineures HD/';
const FILES={
  23:"as_de_bâtons_au_crépuscule.png",
  24:"deux_de_bâtons_au_clair_de_lune.png",
  25:"trois_de_bâtons_au_crépuscule.png",
  26:"quatre_de_bâtons_au_crépuscule.png",
  27:"cinq_de_bâtons_au_crépuscule.png",
  28:"six_de_bâtons_au_bord_du_lac.png",
  29:"sept_de_bâtons_au_crépuscule.png",
  30:"huit_de_bâtons_au_crépuscule.png",
  31:"neuf_de_bâtons_au_clair_de_lune.png",
  32:"dix_de_bâtons_au_coucher_du_soleil.png",
  33:"valet_de_bâtons_au_crépuscule.png",
  34:"cavalier_de_bâtons_au_clair_de_lune.png",
  35:"reine_de_bâtons_au_crépuscule.png",
  36:"roi_de_bâtons_au_crépuscule.png",
  37:"as_de_coupes_au_lac_étoilé.png",
  38:"deux_de_coupes_au_crépuscule.png",
  39:"trois_de_coupes_au_coucher_du_soleil.png",
  40:"quatre_de_coupes_au_crépuscule.png",
  41:"cinq_de_coupes_au_crépuscule.png",
  42:"six_de_coupes_au_lac_d_or.png",
  43:"sept_de_coupes_célestes.png",
  44:"huit_de_coupes_sous_la_lune.png",
  45:"neuf_de_coupes_au_crépuscule.png",
  46:"dix_de_coupes_famille_sous_l_arc_doré.png",
  47:"valet_de_coupes_au_crépuscule.png",
  48:"cavalier_de_coupes_au_clair_de_lune.png",
  49:"reine_de_coupes_au_crépuscule.png",
  50:"roi_de_coupes_au_crépuscule.png",
  51:"as_d_épées_au_coucher_du_soleil.png",
  52:"deux_d_épées_au_crépuscule.png",
  53:"trois_d_épées_au_coucher_du_soleil.png",
  54:"quatre_d_épées_au_coucher_du_soleil.png",
  55:"cinq_d_épées_au_coucher_du_soleil.png",
  56:"six_d_épées_au_coucher_du_soleil.png",
  57:"sept_d_épées_au_crépuscule.png",
  58:"huit_d_épées_au_crépuscule_lacustre.png",
  59:"neuf_d_épées_au_crépuscule.png",
  60:"dix_d_épées_au_crépuscule.png",
  61:"valet_d_épées_au_crépuscule.png",
  62:"cavalier_d_épées_au_coucher_du_soleil.png",
  63:"reine_d_épées_au_crépuscule.png",
  64:"roi_d_épées_au_coucher_du_soleil.png",
  65:"as_de_deniers_au_manteau_cramoisi.png",
  66:"deux_de_deniers_au_crépuscule.png",
  67:"trois_de_deniers_au_coucher_du_soleil.png",
  68:"quatre_de_deniers_au_coucher_du_soleil.png",
  69:"cinq_de_deniers_au_coucher_du_soleil.png",
  70:"six_de_deniers_en_rouge_cramoisi.png",
  71:"sept_de_deniers_au_coucher_du_soleil.png",
  72:"huit_de_deniers_au_coucher_du_soleil.png",
  73:"neuf_de_deniers_cramoisi.png",
  74:"dix_de_deniers_en_rouge_cramoisi.png",
  75:"valet_de_deniers_au_coucher_du_soleil.png",
  76:"cavalier_de_deniers_au_coucher_du_soleil.png",
  77:"reine_de_deniers_au_coucher_du_soleil.png",
  78:"roi_de_deniers_au_coucher_du_soleil.png"
};
window.CR_TAROT_MINOR_IMAGES={};
for(const [id,file] of Object.entries(FILES)){
  window.CR_TAROT_MINOR_IMAGES[id]=BASE+file+'?v=20260926-minor-hd-r1';
}
const count=Object.keys(window.CR_TAROT_MINOR_IMAGES).filter(k=>Number(k)>=23&&Number(k)<=78).length;
if(count!==56)throw new Error('CRISTARIVA Tarot : '+count+'/56 illustrations mineures HD référencées.');
window.CR_TAROT_MINOR_SPRITE_INFO={count,source:'individual-hd-png',base:BASE,version:'2026.09.26-minor-hd-r1'};
window.CR_TAROT_MINOR_IMAGES_READY=Promise.resolve(window.CR_TAROT_MINOR_IMAGES);
})();