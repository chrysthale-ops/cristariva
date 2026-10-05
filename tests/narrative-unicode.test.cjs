const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
function engine(){
 const state={oracle:'cristariva',lang:'fr',domain:'Sentimental',question:'Kinya',draw:[],tarotReversed:[]};
 const window={addEventListener(){}};
 const document={addEventListener(){},getElementById(){return null;}};
 const context=vm.createContext({state,window,document});
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../universal-fluid-story-v6.3.js'),'utf8'),context);
 return {state,window};
}
test('French accented words survive pronoun replacement in every narrative role',()=>{
 const {state,window}=engine();
 for(const word of ['réelle','irréelle','réelles','réellement','re\u0301elle','éternelle','professionnelle']){
  const card={id:999,name:'Indice',reading_relationnel:`Dans une relation, Indice évoque une intention ${word}. Elle demande de vérifier les paroles et les faits.`,en:{}};
  state.draw=[card];
  for(const role of ['origin','obstacle','resource','evolution','outcome']){
   const text=window.CR_UNIVERSAL_ROLE_SUMMARY(card,role,false);
   assert.ok(text.includes(word),`${word}: ${text}`);
   assert.doesNotMatch(text,/récette|réCette|re\u0301cette/);
   assert.doesNotMatch(text,/(?:^|[.!?] )Elle /);
  }
 }
});
test('reported three-card reading preserves intention réelle and retains all positions',()=>{
 const {state,window}=engine();
 const cards=[
  {id:72,name:'Complexité',reading_relationnel:'Dans une relation, Complexité peut signaler sentiments mêlés, contraintes extérieures, histoire passée, distance ou statut ambigu. Une seule explication ne suffit pas.'},
  {id:999,name:'Indice',reading_relationnel:'Dans une relation, Indice attire l’attention sur un comportement ou une parole qui renseigne sur l’intention réelle de l’autre. Il faut l’examiner avec les autres cartes avant d’en tirer une conclusion.'},
  {id:998,name:'Écoute',reading_relationnel:'Dans une relation, Écoute indique que la qualité du lien dépend de la capacité à recevoir ce que l’autre dit réellement, sans immédiatement interpréter, corriger ou se défendre.'}
 ];
 state.draw=cards;
 const html=window.CR_UNIVERSAL_FLUID_STORY(cards);
 assert.match(html,/sentiments mêlés/);
 assert.match(html,/intention réelle de l’autre/);
 assert.match(html,/recevoir ce que l’autre dit réellement/);
 assert.doesNotMatch(html,/récette situation/);
});
