/* Domaine et jeu sont deux choix indépendants dans l'espace de tirage. */
(function(){
  'use strict';
  const domain=document.querySelector('#domain');
  const oracle=document.querySelector('#oracleChoice');
  if(!domain||!oracle)return;
  const love=oracle.querySelector('[value="amour"]');
  function clearReading(){
    state.draw=[];state.relation=null;state.date=null;
    for(const id of ['drawCards','reading','relationResult','dateResult']){
      const node=document.getElementById(id);if(node)node.innerHTML='';
    }
    for(const id of ['results','deepening','synthesis'])document.getElementById(id)?.classList.add('hidden');
  }
  function refresh(){
    const sentimental=domain.value==='Sentimental';
    love.hidden=!sentimental;love.disabled=!sentimental;
    if(!sentimental&&oracle.value==='amour')oracle.value='cristariva';
    state.domain=domain.value;state.oracle=oracle.value;
    const en=state.lang==='en';
    document.getElementById('oracleChoiceLabel').textContent=en?'Choose an oracle':'Oracle à questionner';
    oracle.querySelector('[value="cristariva"]').textContent='Oracle CRISTARIVA';
    love.textContent=en?'CRISTARIVA Love Oracle':'Oracle sentimental CRISTARIVA';
    oracle.querySelector('[value="tarot"]').textContent=en?'CRISTARIVA Tarot':'Tarot CRISTARIVA';
  }
  domain.addEventListener('change',()=>{clearReading();refresh();});
  oracle.addEventListener('change',()=>{clearReading();refresh();});
  const originalApplyLanguage=applyLanguage;
  applyLanguage=function(){originalApplyLanguage();refresh();};
  refresh();
})();
