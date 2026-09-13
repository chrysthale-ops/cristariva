import re
from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')

block=r'''/* CRISTARIVA — synthèse finale narrative v8 */
function finalStripHtml(text){return String(text||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();}
function finalEscapeRegExp(x){return String(x||'').replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
function finalCap(s){s=String(s||'').trim();return s?s.charAt(0).toLocaleUpperCase()+s.slice(1):s;}
function finalLower(s){s=String(s||'').trim();return s?s.charAt(0).toLocaleLowerCase()+s.slice(1):s;}
function finalEnsureStop(s){s=String(s||'').trim();return !s?s:/[.!?…]$/.test(s)?s:s+'.';}
function finalNormalizeIdea(text,c,en){
 let x=finalStripHtml(text);
 x=x.replace(/^(Dans une relation|Dans le cadre relationnel|Sur le plan relationnel|Dans le travail|Dans le cadre professionnel(?: ou d’un projet)?|Sur le plan professionnel|Sur le plan général|Sur le plan intérieur|Dans le cadre spirituel ou général|Pour votre question)[, ]+/i,'');
 const name=c?.name?finalEscapeRegExp(c.name):'';
 if(name)x=x.replace(new RegExp('^'+name+'\\b\\s*(?::|—|-|,)?\\s*','i'),'');
 x=x.replace(/^(Cette carte|Elle)\s+(?:indique|montre|signifie|parle de|invite à|rappelle|favorise|annonce|décrit)\s+/i,'');
 x=x.replace(/^En clair\s*:\s*/i,'');
 x=x.replace(/^que\s+/i,'');
 x=x.replace(/^qu[’'](?=[aeiouyhàâäéèêëîïôöùûü])/i,'');
 x=x.replace(/^avertit que\s+/i,en?'there is a risk that ':'il existe un risque que ');
 x=x.replace(/^(indique|montre|signifie|décrit) que\s+/i,'');
 x=x.replace(/^peut indiquer\s+/i,'');
 x=x.replace(/^invite à\s+/i,en?'it becomes important to ':'il devient important de ');
 return x.trim();
}
function finalIdea(c,focus,en){return finalNormalizeIdea(preciseReading(c,focus,en),c,en);}
function finalSentenceLead(lead,idea){return finalEnsureStop(`${lead}${finalLower(idea)}`);}
function finalRelationSentence(en){
 if(!state.relation)return '';
 const rel=state.relation;
 const raw=en?(RELATION_SYNTHESIS_EN[rel.id]||cardField(rel,'definition')):(RELATION_SYNTHESIS_FR[rel.id]||cardField(rel,'definition'));
 return en?finalEnsureStop(`The relationship involved seems to concern mainly ${finalLower(raw)}`):finalEnsureStop(`Le lien concerné semble surtout se rapporter à ${finalLower(raw)}`);
}
function finalDatingSentence(en){
 if(!state.date)return '';
 const d=state.date;
 const raw=en?(DATING_SYNTHESIS_EN[d.id]||cardField(d,'definition')):(DATING_SYNTHESIS_FR[d.id]||cardField(d,'definition'));
 return en?finalEnsureStop(`As for timing, the development is placed ${finalLower(raw)}`):finalEnsureStop(`Quant au rythme, l’évolution se situe ${finalLower(raw)}`);
}
function finalAstralSentences(en){
 if(!state.astro)return '';
 const sig=relevantAstroSignals(state.astro);
 if(!sig.length)return en?'The current climate does not impose a strong additional pressure; it mainly leaves room for the situation to mature at its own pace.':'Le climat du moment n’impose pas de pression supplémentaire marquée ; il laisse surtout à la situation le temps de mûrir à son propre rythme.';
 const a=sig[0],b=sig[1];
 if(en){
  let out=`The current climate supports the reading through ${a.en}.`;
  if(b)out+=` At the same time, another influence brings ${b.en}.`;
  return out;
 }
 let out=`Le climat du moment accompagne cette évolution par ${a.fr}.`;
 if(b)out+=` Dans le même temps, une autre tendance apporte ${b.fr}.`;
 return out;
}
function finalVerdict(cards,focus,en){
 let raw=finalStripHtml(preciseGeneralConclusion(cards,focus,en)).replace(/^En clair\s*:\s*/i,'').trim();
 if(en)return finalEnsureStop(`Taken as a whole, ${finalLower(raw)}`);
 if(/^La synthèse ouvre donc\s+/i.test(raw))return finalEnsureStop(raw.replace(/^La synthèse ouvre donc\s+/i,'Dans l’ensemble, le tirage ouvre '));
 if(/^La synthèse reste restrictive\s*:/i.test(raw))return finalEnsureStop(raw.replace(/^La synthèse reste restrictive\s*:/i,'Dans l’ensemble, la tendance reste restrictive :'));
 if(/^La synthèse ne ferme pas la situation, mais elle\s+/i.test(raw))return finalEnsureStop(raw.replace(/^La synthèse ne ferme pas la situation, mais elle\s+/i,'Dans l’ensemble, la situation n’est pas fermée, mais elle '));
 if(/^La synthèse\s+/i.test(raw))return finalEnsureStop(raw.replace(/^La synthèse\s+/i,'Dans l’ensemble, le tirage '));
 return finalEnsureStop(`Dans l’ensemble, ${finalLower(raw)}`);
}
function literaryFinalSynthesis(){
 const cards=state.draw||[];
 if(!cards.length)return '';
 const en=state.lang==='en',focus=preciseQuestionFocus(),subject=preciseSubject(focus,en);
 const ideas=cards.map(c=>finalIdea(c,focus,en));
 let p1='',p2='';
 if(en){
  if(cards.length===1){
   p1=finalSentenceLead(`Regarding ${subject}, one central idea stands out: `,ideas[0]);
  }else if(cards.length===3){
   p1=finalSentenceLead(`Regarding ${subject}, the situation begins with a first reality: `,ideas[0])+' '+finalSentenceLead('At present, another element becomes central: ',ideas[1]);
   p2=finalSentenceLead('The direction now taking shape suggests that ',ideas[2]);
  }else{
   p1=finalSentenceLead(`Regarding ${subject}, the situation begins with a first reality: `,ideas[0])+' '+finalSentenceLead('A genuine obstacle nevertheless remains: ',ideas[1]);
   p2=finalSentenceLead('There is still a point of support capable of changing the balance: ',ideas[2])+' '+finalSentenceLead('From there, the situation can move toward a new stage: ',ideas[3])+' '+finalSentenceLead('In the longer movement, the direction becomes clearer: ',ideas[4]);
  }
 }else{
  if(cards.length===1){
   p1=finalSentenceLead(`Concernant ${subject}, une idée centrale se dégage : `,ideas[0]);
  }else if(cards.length===3){
   p1=finalSentenceLead(`Concernant ${subject}, la situation part d’un premier constat : `,ideas[0])+' '+finalSentenceLead('Aujourd’hui, un autre élément devient central : ',ideas[1]);
   p2=finalSentenceLead('La direction qui se dessine désormais suggère que ',ideas[2]);
  }else{
   p1=finalSentenceLead(`Concernant ${subject}, la situation part d’un premier constat : `,ideas[0])+' '+finalSentenceLead('Un obstacle réel demeure toutefois : ',ideas[1]);
   p2=finalSentenceLead('Tout n’est pas bloqué pour autant. Un point d’appui peut encore modifier l’équilibre : ',ideas[2])+' '+finalSentenceLead('À partir de là, la situation peut entrer dans une nouvelle phase : ',ideas[3])+' '+finalSentenceLead('Sur l’ensemble du mouvement, la direction devient plus lisible : ',ideas[4]);
  }
 }
 const details=[finalRelationSentence(en),finalDatingSentence(en),finalAstralSentences(en)].filter(Boolean).join(' ');
 const verdict=finalVerdict(cards,focus,en);
 const question=state.question?`<p class="reading-question">${en?'Question':'Question'} : « ${readingEscape(state.question)} »</p>`:'';
 return `<div class="reading final-literary"><h3>${en?'Final synthesis':'Synthèse finale'}</h3>${question}<p>${p1}</p>${p2?`<p>${p2}</p>`:''}${details?`<p>${details}</p>`:''}<p class="conclusion">${verdict}</p></div>`;
}
'''

if 'synthèse finale narrative v8' in s:
    s,n=re.subn(r'/\* CRISTARIVA — synthèse finale narrative v8 \*/.*?(?=function renderSynthesis\(\))',lambda m:block+'\n',s,count=1,flags=re.S)
elif 'synthèse finale littéraire v7' in s:
    s,n=re.subn(r'/\* CRISTARIVA — synthèse finale littéraire v7 \*/.*?(?=function renderSynthesis\(\))',lambda m:block+'\n',s,count=1,flags=re.S)
    if n!=1: raise SystemExit(f'literary block replacements: {n}')
else:
    idx=s.find('function renderSynthesis(){')
    if idx<0: raise SystemExit('renderSynthesis not found')
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
w=re.sub(r"const CACHE_NAME='[^']+';","const CACHE_NAME='cristariva-modele-a-v18-20260913-synthese-narrative-grammaire';",w,count=1)
sw.write_text(w,encoding='utf-8')
