/* CRISTARIVA — reformulation finale autonome v3.6.6
   Cette couche est chargée après les moteurs de synthèse précédents.
   Elle conserve leurs idées, mais reconstruit la conclusion avec un
   vocabulaire distinct et sans réutiliser mot pour mot les analyses. */
const CRISTARIVA_FINAL_PARAPHRASE_VERSION='3.6.6';

function cr366Timing(a,en=false){
  if(!a||!state?.date)return '';
  try{
    const intent=typeof cr33Intent==='function'?cr33Intent():{};
    const theme=typeof cr3DominantTheme==='function'?cr3DominantTheme(state.draw||[],en):null;
    const window=typeof cr3TimingWindow==='function'?cr3TimingWindow(state.date,cr3ReadingMoment(),en):null;
    let hits=[];
    if(window&&typeof cr37RelevantWindows==='function')hits=cr37RelevantWindows(a,theme,window,intent)||[];
    let hit=hits[0]||null;
    if(!hit&&window&&typeof cr3PeriodSummary==='function'&&typeof cr33BestWindow==='function'){
      const period=cr3PeriodSummary(a,theme,window,en);
      hit=cr33BestWindow(period,intent);
    }
    if(!hit){
      return en
        ?'The astrological timing stays too diffuse to make one date the main landmark of the conclusion.'
        :'Le calendrier astrologique reste trop diffus pour faire d’une date précise le repère principal de la conclusion.';
    }
    const date=typeof cr3Date==='function'?cr3Date(hit.bestDate,en):'';
    if(en){
      const aspect=typeof cr37AspectLabel==='function'?cr37AspectLabel(hit,true):`${hit.tr} ${hit.name} natal ${hit.na}`;
      return `From a timing perspective, the clearest landmark falls around ${date}. ${aspect} creates the most noticeable shift in the period without repeating the earlier transit description.`;
    }
    const aspect=String(hit.name||'').toLowerCase();
    const tr=String(hit.tr||'').replace(/^./,c=>c.toUpperCase());
    const na=String(hit.na||'').replace(/^./,c=>c.toUpperCase());
    const adjective=['Lune','Vénus'].includes(na)?'natale':'natal';
    const connector=aspect==='conjonction'?'avec':'à';
    const effect=typeof cr365TransitEffect==='function'?cr365TransitEffect(hit,false):'met davantage en relief les enjeux de cette période';
    return `Côté calendrier, le passage le plus porteur se situe autour du ${date}. Le ${aspect} de ${tr} ${connector} votre ${na} ${adjective} ${effect}.`;
  }catch(e){return '';}
}

function cr366EnglishSynthesis(a){
  const cards=state?.draw||[];
  if(!cards.length)return '';
  const q=(state?.question||'').trim();
  const esc=typeof cr362Esc==='function'?cr362Esc:(v=>String(v||''));
  const answer=typeof cr362RelationAnswer==='function'?cr362RelationAnswer(true):'the situation is moving toward a clearer form';
  const nuance=typeof cr362OutcomeNuance==='function'?cr362OutcomeNuance(cards,true):'';
  const natal=typeof cr363NatalLens==='function'?cr363NatalLens(a,true):'';
  const timing=cr366Timing(a,true);
  const lead=q?`For “${esc(q)}”, ${answer}.`:`${answer.charAt(0).toUpperCase()+answer.slice(1)}.`;
  const text=[lead,nuance,natal,timing].filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
  return `<div class="story-reading cr3-global cr362-global" data-global-synthesis="${CRISTARIVA_FINAL_PARAPHRASE_VERSION}"><h3>CRISTARIVA — final consultation</h3><p>${text}</p></div>`;
}

function cr366GlobalSynthesis(a){
  const en=typeof cr362En==='function'?cr362En():state?.lang==='en';
  const cards=state?.draw||[];
  if(!cards.length)return '';
  if(en)return cr366EnglishSynthesis(a);
  const q=(state?.question||'').trim();
  const esc=typeof cr362Esc==='function'?cr362Esc:(v=>String(v||''));
  const answer=typeof cr365RelationIdea==='function'?cr365RelationIdea(false):(typeof cr362RelationAnswer==='function'?cr362RelationAnswer(false):'la situation gagne progressivement en netteté');
  const nuance=typeof cr365OutcomeIdea==='function'?cr365OutcomeIdea(cards,false):(typeof cr362OutcomeNuance==='function'?cr362OutcomeNuance(cards,false):'');
  const natal=typeof cr365NatalLens==='function'?cr365NatalLens(a,false):(typeof cr363NatalLens==='function'?cr363NatalLens(a,false):'');
  const timing=cr366Timing(a,false);
  const lead=q?`Pour « ${esc(q)} », ${answer}.`:`${answer.charAt(0).toUpperCase()+answer.slice(1)}.`;
  const text=[lead,nuance,natal,timing].filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
  return `<div class="story-reading cr3-global cr362-global" data-global-synthesis="${CRISTARIVA_FINAL_PARAPHRASE_VERSION}"><h3>CRISTARIVA — synthèse générale</h3><p>${text}</p></div>`;
}

cr362GlobalSynthesis=cr366GlobalSynthesis;
if(typeof cr33GlobalSynthesis==='function')cr33GlobalSynthesis=cr366GlobalSynthesis;
if(typeof cr3Synthesis==='function')cr3Synthesis=function(a){return cr366GlobalSynthesis(a);};
if(typeof renderSynthesis==='function'){
  renderSynthesis=function(){
    if(!state?.draw?.length)return;
    const box=document.getElementById('synthesis');
    if(box)box.innerHTML=cr366GlobalSynthesis(state.astro||null);
  };
  renderSynthesis();
}
