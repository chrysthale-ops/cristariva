/* CRISTARIVA — correction française de la synthèse générale v3.6.4
   Évite les accords fragiles construits à partir de listes d'adjectifs,
   corrige la ponctuation après la question et supprime la conclusion générique superflue. */
const CRISTARIVA_SYNTHESIS_FRENCH_FIX_VERSION='3.6.4';

function cr363LowerInitialSentence(text){
  const s=String(text||'').trim();
  if(!s)return '';
  return s.charAt(0).toLowerCase()+s.slice(1);
}

function cr363NatalLens(a,en=false){
  if(!a||typeof cr34BigThree!=='function'||typeof cr34SignProfile!=='function')return '';
  try{
    if(en)return 'Your natal profile suggests that you may sense the potential of a bond quickly; letting the other person’s actions confirm that first impression will be especially important.';
    const big=cr34BigThree(a,false);
    const sun=big?.sun?cr34SignProfile(big.sun):null;
    const moon=big?.moon?cr34SignProfile(big.moon):null;
    const identity=cr363LowerInitialSentence(sun?.identity||'vous êtes attentif à ce que vous ressentez et à ce qui se passe autour de vous.');
    const emotion=String(moon?.emotion||'un besoin de repères affectifs solides').trim().replace(/[.!?]+$/,'');
    return `Votre profil natal montre que ${identity.replace(/[.!?]+$/,'')}. Sur le plan émotionnel, il souligne ${emotion}. Vous pouvez donc percevoir rapidement le potentiel d’un lien ; dans cette situation, il est préférable de laisser les actes confirmer votre première impression.`;
  }catch(e){return '';}
}

if(typeof cr362NatalLens==='function')cr362NatalLens=cr363NatalLens;

if(typeof cr362GlobalSynthesis==='function'){
  cr362GlobalSynthesis=function(a){
    const en=typeof cr362En==='function'?cr362En():state?.lang==='en';
    const cards=state?.draw||[];
    if(!cards.length)return '';
    const q=(state?.question||'').trim();
    const answer=cr362RelationAnswer(en),nuance=cr362OutcomeNuance(cards,en),natal=cr363NatalLens(a,en),timing=cr362Timing(a,en);
    const lead=en
      ? `${q?`For your question “${cr362Esc(q)}”, `:''}${answer}.`
      : `${q?`À votre question « ${cr362Esc(q)} », `:''}${answer}.`;
    const text=[lead,nuance,natal,timing].filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
    return `<div class="story-reading cr3-global cr362-global" data-global-synthesis="${CRISTARIVA_SYNTHESIS_FRENCH_FIX_VERSION}"><h3>${en?'CRISTARIVA — final consultation':'CRISTARIVA — synthèse générale'}</h3><p>${text}</p></div>`;
  };
  if(typeof cr33GlobalSynthesis==='function')cr33GlobalSynthesis=cr362GlobalSynthesis;
  if(typeof cr3Synthesis==='function')cr3Synthesis=function(a){return cr362GlobalSynthesis(a);};
  if(typeof renderSynthesis==='function'){
    renderSynthesis=function(){
      if(!state?.draw?.length)return;
      const box=document.getElementById('synthesis');
      if(box)box.innerHTML=cr362GlobalSynthesis(state.astro||null);
    };
    renderSynthesis();
  }
}
