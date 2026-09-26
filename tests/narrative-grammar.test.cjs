const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../universal-fluid-story-v6.3.js'),'utf8');
function reading(cards,domain='Sentimental',question='Mes possibilités',lang='fr'){
  const state={domain,question,lang,draw:[]};
  const window={addEventListener(){}};
  const document={addEventListener(){},getElementById(){return null}};
  const context={state,window,document};
  vm.createContext(context);vm.runInContext(source,context);
  return window.CR_UNIVERSAL_FLUID_STORY(cards);
}
function prose(html){return html.match(/<p class="story-continuous">([\s\S]*?)<\/p>/)[1];}
test('the reported ambiguity, conflict and commitment reading forms a coherent arc',()=>{
  const cards=['Triangle amoureux','Conflit','Engagement'].map(name=>({name}));
  const text=prose(reading(cards));
  assert.match(text,/ambiguïté sentimentale/);
  assert.match(text,/désaccords peuvent éclater/);
  assert.match(text,/engagement plus concret/);
  assert.ok(text.indexOf('ambiguïté')<text.indexOf('désaccords'));
  assert.ok(text.indexOf('désaccords')<text.indexOf('engagement'));
  assert.doesNotMatch(text,/(?:Au départ|Aujourd’hui|À partir de là),\s*(?:signale|parle|indique)/i);
  assert.doesNotMatch(text,/Triangle amoureux|\bConflit\b/i);
});
test('all draw lengths and domains use complete narrative sentences',()=>{
  const names=['Impasse','Incompatibilité','Communication','Transformation','Équilibre'];
  for(const domain of ['Sentimental','Relations','Professionnelle / Projet','Général / spirituel'])
    for(const length of [1,2,3,4,5]){
      const text=prose(reading(names.slice(0,length).map(name=>({name,keywords:name})),domain));
      assert.ok(text.length>65,`${domain} / ${length}`);
      assert.doesNotMatch(text,/(?:^|[.!?]\s+)(?:signale|parle|indique|montre|invite)\s/i);
      assert.doesNotMatch(text,/\b(?:Impasse|Incompatibilité|Communication|Transformation|Équilibre)\b/i);
    }
});
test('question is escaped and English story remains in English',()=>{
  const html=reading([{name:'Conflit',en:{name:'Conflict',keywords:'conflict'}}],'Relations','Me & <toi>');
  assert.match(html,/Me &amp; &lt;toi&gt;/);
  const english=prose(reading([{name:'Conflit',en:{name:'Conflict',keywords:'conflict'}}],'Relations','My future','en'));
  assert.match(english,/progress|direction|situation/i);
  assert.doesNotMatch(english,/\b(?:Au départ|La suite)\b/);
});
