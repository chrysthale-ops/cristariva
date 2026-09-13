import re
from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')

block=r'''/* CRISTARIVA — synthèse finale narrative v9 */
function finalStripHtml(text){return String(text||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();}
function finalEscapeRegExp(x){return String(x||'').replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
function finalCap(s){s=String(s||'').trim();return s?s.charAt(0).toLocaleUpperCase()+s.slice(1):s;}
function finalLower(s){s=String(s||'').trim();return s?s.charAt(0).toLocaleLowerCase()+s.slice(1):s;}
function finalEnsureStop(s){s=String(s||'').trim();return !s?s:/[.!?…]$/.test(s)?s:s+'.';}
function finalNoStop(s){return String(s||'').trim().replace(/[.!?…]+$/,'').trim();}
function finalNormalizeIdea(text,c,en){
 let x=finalStripHtml(text);
 x=x.replace(/^(Dans une relation|Dans le cadre relationnel|Sur le plan relationnel|Dans le travail|Dans le cadre professionnel(?: ou d’un projet)?|Sur le plan professionnel|Sur le plan général|Sur le plan intérieur|Dans le cadre spirituel ou général|Pour votre question)[, ]+/i,'');
 const name=c?.name?finalEscapeRegExp(c.name):'';
 if(name)x=x.replace(new RegExp('^'+name+'\\b\\s*(?::|—|-|,)?\\s*','i'),'');
 x=x.replace(/^En clair\s*:\s*/i,'');
 x=x.replace(/^que\s+/i,'');
 x=x.replace(/^qu[’'](?=[aeiouyhàâäéèêëîïôöùûü])/i,'');
 x=x.replace(/^avertit que l[’']on peut\s+/i,en?'there is a risk of ':'il existe un risque d’');
 x=x.replace(/^avertit que\s+/i,en?'there is a risk that ':'il existe un risque que ');
 x=x.replace(/^(Cette carte|Elle)\s+peut indiquer\s+/i,'');
 x=x.replace(/^(Cette carte|Elle)\s+(?:indique|montre|signifie|parle de|rappelle|favorise|annonce|décrit)\s+/i,'');
 x=x.replace(/^(indique|montre|signifie|décrit) que\s+/i,'');
 x=x.replace(/^peut indiquer\s+/i,'');
 x=x.replace(/^invite à\s+/i,en?'it becomes important to ':'il devient important de ');
 return x.trim();
}
function finalIdea(c,focus,en){return finalNormalizeIdea(preciseReading(c,focus,en),c,en);}
function finalIdeaParts(idea){
 const parts=String(idea||'').match(/[^.!?…]+[.!?…]?/g)||[];
 return parts.map(x=>x.trim()).filter(Boolean);
}
function finalRoleText(lead,idea,referent,en){
 const parts=finalIdeaParts(idea);
 if(!parts.length)return '';
 let out=finalEnsureStop(`${lead}${finalLower(finalNoStop(parts[0]))}`);
 for(const raw of parts.slice(1)){
  let q=finalNoStop(raw);
  if(en){
   q=q.replace(/^It\b/i,referent);
   q=q.replace(/^This card\b/i,referent);
  }else{
   q=q.replace(/^Elle\b/i,referent);
   q=q.replace(/^Cette carte\b/i,referent);
  }
  out+=' '+finalEnsureStop(finalCap(q));
 }
 return out;
}
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
  let out=`The current climate supports this development through ${a.en}.`;
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
   p1=finalRoleText(`Regarding ${subject}, one central idea stands out: `,ideas[0],'This situation',true);
  }else if(cards.length===3){
   p1=finalRoleText(`Regarding ${subject}, the situation begins with a first reality: `,ideas[0],'This situation',true)+' '+finalRoleText('At present, another element becomes central: ',ideas[1],'This element',true);
   p2=finalRoleText('The direction now taking shape is clearer: ',ideas[2],'This development',true);
  }else{
   p1=finalRoleText(`Regarding ${subject}, the situation begins with a first reality: `,ideas[0],'This situation',true)+' '+finalRoleText('A genuine obstacle nevertheless remains: ',ideas[1],'This risk',true);
   p2=finalRoleText('Not everything is blocked. A point of support can still change the balance: ',ideas[2],'This possibility',true)+' '+finalRoleText('From there, the situation can enter a new phase: ',ideas[3],'This development',true)+' '+finalRoleText('Across the movement as a whole, the direction becomes clearer: ',ideas[4],'This dynamic',true);
  }
 }else{
  if(cards.length===1){
   p1=finalRoleText(`Concernant ${subject}, une idée centrale se dégage : `,ideas[0],'Cette situation',false);
  }else if(cards.length===3){
   p1=finalRoleText(`Concernant ${subject}, la situation part d’un premier constat : `,ideas[0],'Cette situation',false)+' '+finalRoleText('Aujourd’hui, un autre élément devient central : ',ideas[1],'Cet élément',false);
   p2=finalRoleText('La direction qui se dessine devient alors plus claire : ',ideas[2],'Cette évolution',false);
  }else{
   p1=finalRoleText(`Concernant ${subject}, la situation part d’un premier constat : `,ideas[0],'Cette situation',false)+' '+finalRoleText('Un obstacle réel demeure toutefois : ',ideas[1],'Ce risque',false);
   p2=finalRoleText('Tout n’est pas bloqué pour autant. Un point d’appui peut encore modifier l’équilibre : ',ideas[2],'Cette possibilité',false)+' '+finalRoleText('À partir de là, la situation peut entrer dans une nouvelle phase : ',ideas[3],'Cette évolution',false)+' '+finalRoleText('Sur l’ensemble du mouvement, la direction devient plus lisible : ',ideas[4],'Cette dynamique',false);
  }
 }
 const details=[finalRelationSentence(en),finalDatingSentence(en),finalAstralSentences(en)].filter(Boolean).join(' ');
 const verdict=finalVerdict(cards,focus,en);
 const question=state.question?`<p class="reading-question">${en?'Question':'Question'} : « ${readingEscape(state.question)} »</p>`:'';
 return `<div class="reading final-literary"><h3>${en?'Final synthesis':'Synthèse finale'}</h3>${question}<p>${p1}</p>${p2?`<p>${p2}</p>`:''}${details?`<p>${details}</p>`:''}<p class="conclusion">${verdict}</p></div>`;
}
'''

if 'synthèse finale narrative v9' in s:
    s,n=re.subn(r'/\* CRISTARIVA — synthèse finale narrative v9 \*/.*?(?=function renderSynthesis\(\))',lambda m:block+'\n',s,count=1,flags=re.S)
elif 'synthèse finale narrative v8' in s:
    s,n=re.subn(r'/\* CRISTARIVA — synthèse finale narrative v8 \*/.*?(?=function renderSynthesis\(\))',lambda m:block+'\n',s,count=1,flags=re.S)
    if n!=1: raise SystemExit(f'narrative block replacements: {n}')
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
w=re.sub(r"const CACHE_NAME='[^']+';","const CACHE_NAME='cristariva-modele-a-v19-20260913-synthese-narrative-fluide';",w,count=1)
sw.write_text(w,encoding='utf-8')
