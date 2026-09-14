/* CRISTARIVA — nettoyage de la conclusion globale v3.5.2
   Supprime la phrase méthodologique finale de la synthèse générale. */
(function(){
  if(typeof cr33GlobalSynthesis!=='function') return;
  const previous=cr33GlobalSynthesis;
  cr33GlobalSynthesis=function(a){
    let html=previous(a);
    if(!html) return html;
    html=html.replace(/\s*Pris ensemble, les trois éclairages forment une seule réponse cohérente\s*:\s*la direction indiquée par les cartes, votre manière personnelle de vivre la situation et les moments les plus réceptifs de la période se renforcent ou se tempèrent mutuellement\.\s*La conclusion porte donc sur la tendance d’ensemble, et non sur la répétition des trois lectures\./g,'');
    html=html.replace(/\s*Taken together, the three analyses form one coherent answer\s*:\s*the direction suggested by the cards, your personal way of experiencing the situation and the more receptive moments of the period reinforce or temper one another\.\s*The conclusion is therefore an overall tendency, not a repetition of the three readings\./g,'');
    return html;
  };
  if(typeof cr3Synthesis==='function') cr3Synthesis=function(a){return cr33GlobalSynthesis(a);};
  if(typeof renderSynthesis==='function'){
    renderSynthesis=function(){
      if(!state.draw?.length)return;
      const box=document.getElementById('synthesis');
      if(box)box.innerHTML=cr33GlobalSynthesis(state.astro||null);
    };
  }
  if(typeof renderSynthesis==='function')renderSynthesis();
})();
