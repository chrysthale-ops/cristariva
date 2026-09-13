import re
from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')

block=r'''/* CRISTARIVA — synthèse finale littéraire v7 */
function finalCleanText(text,c){
 let x=String(text||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
 x=x.replace(/^(Dans une relation|Dans le cadre relationnel|Sur le plan relationnel|Dans le travail|Dans le cadre professionnel(?: ou d’un projet)?|Sur le plan professionnel|Sur le plan général|Sur le plan intérieur|Dans le cadre spirituel ou général|Pour votre question)[, ]+/i,'');
 const name=(c&&c.name)?c.name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'):'';
 if(name){
  x=x.replace(new RegExp('^'+name+'\\s+(?:indique|montre|signifie|parle de|invite à|confronte à|favorise|annonce|rappelle|ouvre|décrit)\\s*','i'),'');
  x=x.replace(new RegExp('^'+name+'\\s*[:—-]\\s*','i'),'');
 }
 x=x.replace(/^(Cette carte|Elle)\s+(?:indique|montre|signifie|parle de|invite à|rappelle|favorise|annonce|décrit)\s+/i,'');
 if(name)x=x.replace(new RegExp('^'+name+'\\s+(?:indique|montre|signifie|parle de|invite à|confronte à|favorise|annonce|rappelle|ouvre|décrit)\\s*','i'),'');
 x=x.replace(/^En clair\s*:\s*/i,'');
 return x.trim();
}
function finalLower(s){return s?s.charAt(0).toLocaleLowerCase()+s.slice(1):s;}
function finalEnsureStop(s){s=String(s||'').trim();return !s?s:/[.!?…]$/.test(s)?s:s+'.';}
function finalCardText(c,focus,en){return finalCleanText(preciseReading(c,focus,en),c);}
function finalConclusionText(cards,focus,en){return finalCleanText(preciseGeneralConclusion(cards,focus,en),null).replace(/^La synthèse\s+(?:ouvre donc|reste|ne ferme pas la situation, mais elle)\s*/i,'').trim();}
function finalRelationText(en){
 if(!state.relation)return '';
 const rel=state.relation;
 return en?(RELATION_SYNTHESIS_EN[rel.id]||cardField(rel,'definition')):(RELATION_SYNTHESIS_FR[rel.id]||cardField(rel,'definition'));
}
function finalDatingText(en){
 if(!state.date)return '';
 const d=state.date;
 return en?(DATING_SYNTHESIS_EN[d.id]||cardField(d,'definition')):(DATING_SYNTHESIS_FR[d.id]||cardField(d,'definition'));
}
function finalAstralText(en){
 if(!state.astro)return '';
 const sig=relevantAstroSignals(state.astro);
 if(!sig.length)return en?'The current climate does not add a strong pressure of its own; it mainly leaves room for the movement already described to mature.':'Le climat du moment n’ajoute pas de pression dominante ; il laisse surtout la dynamique déjà décrite mûrir à son propre rythme.';
 const a=sig[0],b=sig[1];
 if(en)return `The current climate adds ${a.en}${b?`, while another influence brings ${b.en}`:''}.`;
 return `Le climat du moment ajoute ${a.fr}${b?`, tandis qu’une autre tendance apporte ${b.fr}`:''}.`;
}
function literaryFinalSynthesis(){
 const cards=state.draw||[];
 if(!cards.length)return '';
 const en=state.lang==='en',focus=preciseQuestionFocus();
 const subject=preciseSubject(focus,en);
 const t=cards.map(c=>finalCardText(c,focus,en));
 let story='';
 if(en){
  if(cards.length===1){
   story=`Regarding ${subject}, ${finalLower(t[0])}`;
  }else if(cards.length===3){
   story=`Regarding ${subject}, the situation begins in a context where ${finalLower(t[0])} At present, ${finalLower(t[1])} The movement now tends toward a stage where ${finalLower(t[2])}`;
  }else{
   story=`Regarding ${subject}, the story begins in a context where ${finalLower(t[0])} Yet this movement meets a real resistance: ${finalLower(t[1])} What keeps the situation from becoming fixed is the possibility of using the available resource consciously rather than passively: ${finalLower(t[2])} From there, the next phase suggests that ${finalLower(t[3])} The overall direction then leads toward a situation in which ${finalLower(t[4])}`;
  }
 }else{
  if(cards.length===1){
   story=`Concernant ${subject}, ${finalLower(t[0])}`;
  }else if(cards.length===3){
   story=`Concernant ${subject}, la situation s’inscrit d’abord dans un contexte où ${finalLower(t[0])} Aujourd’hui, ${finalLower(t[1])} Le mouvement qui se dessine conduit progressivement vers une étape où ${finalLower(t[2])}`;
  }else{
   story=`Concernant ${subject}, l’histoire commence dans un contexte où ${finalLower(t[0])} Pourtant, ce mouvement rencontre une résistance réelle : ${finalLower(t[1])} La situation n’est cependant pas figée, car un point d’appui existe si cette énergie est utilisée consciemment plutôt que simplement subie : ${finalLower(t[2])} À partir de là, l’évolution laisse entrevoir que ${finalLower(t[3])} Au terme de ce mouvement, la tendance générale conduit vers une situation où ${finalLower(t[4])}`;
  }
 }
 story=finalEnsureStop(story);
 let p2='';
 const rel=finalRelationText(en),date=finalDatingText(en),astro=finalAstralText(en);
 if(en){
  if(rel)p2+=`This development seems to concern mainly ${finalLower(rel)} `;
  if(date)p2+=`Its rhythm is placed ${finalLower(date)} `;
  if(astro)p2+=astro+' ';
 }else{
  if(rel)p2+=`Cette évolution semble concerner surtout ${finalLower(rel)} `;
  if(date)p2+=`Sur le plan du rythme, elle se situe ${finalLower(date)} `;
  if(astro)p2+=astro+' ';
 }
 p2=finalEnsureStop(p2);
 let verdict=finalConclusionText(cards,focus,en);
 if(!en&&focus==='sex')verdict=verdict.replace(/^la perspective sexuelle/i,'La perspective intime');
 const conclusion=en?`Taken as a whole, ${finalLower(verdict)}`:`Pris dans son ensemble, ${finalLower(verdict)}`;
 const question=state.question?`<p class="reading-question">${en?'Question':'Question'} : « ${readingEscape(state.question)} »</p>`:'';
 return `<div class="reading final-literary"><h3>${en?'Final synthesis':'Synthèse finale'}</h3>${question}<p>${story}</p>${p2?`<p>${p2}</p>`:''}<p class="conclusion">${finalEnsureStop(conclusion)}</p></div>`;
}
'''

marker='function renderSynthesis(){'
idx=s.find(marker)
if idx<0: raise SystemExit('renderSynthesis not found')
if 'synthèse finale littéraire v7' in s:
    s,n=re.subn(r'/\* CRISTARIVA — synthèse finale littéraire v7 \*/.*?(?=function renderSynthesis\(\))',lambda m:block+'\n',s,count=1,flags=re.S)
    if n!=1: raise SystemExit(f'literary block replacements: {n}')
else:
    s=s[:idx]+block+s[idx:]

new_render=r'''function renderSynthesis(){
 if(!state.draw.length)return;
 $('#synthesis').innerHTML=literaryFinalSynthesis();
}'''
s,n=re.subn(r'function renderSynthesis\(\)\{.*?\n\}',lambda m:new_render,s,count=1,flags=re.S)
if n!=1: raise SystemExit(f'renderSynthesis replacements: {n}')

p.write_text(s,encoding='utf-8')

sw=Path('service-worker.js')
w=sw.read_text(encoding='utf-8')
w=re.sub(r"const CACHE_NAME='[^']+';","const CACHE_NAME='cristariva-modele-a-v17-20260913-synthese-litteraire-fluide';",w,count=1)
sw.write_text(w,encoding='utf-8')
