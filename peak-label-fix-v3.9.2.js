/* CRISTARIVA — correctif de numérotation des pics astrologiques v3.9.2 */
(function(){
  if(typeof cr38PeakDate!=='function'||typeof cr37AspectLabel!=='function'||typeof cr37ImpactText!=='function')return;
  cr38PeakSentence=function(hit,index,en=false){
    const when=cr38PeakDate(hit,en);
    const aspect=cr37AspectLabel(hit,en);
    const impact=cr37ImpactText(hit,cr33Intent(),en);
    if(en){
      const leads=['A first significant point appears','A second significant point appears','A third significant point appears'];
      const lead=leads[index]||'Another significant point appears';
      return `${lead} ${when}: ${aspect} ${impact}.`;
    }
    const leads=['Un premier moment significatif ressort','Un deuxième moment ressort','Un troisième moment ressort'];
    const lead=leads[index]||'Un autre moment significatif ressort';
    return `${lead} ${when} : ${aspect} ${impact}.`;
  };
})();
