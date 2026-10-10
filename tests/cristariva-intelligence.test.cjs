const test=require('node:test');
const assert=require('node:assert/strict');

global.CR_RELATION_CONTEXT=require('../relation-context.js');
const intelligence=require('../cristariva-intelligence.js');

test('detecte une reprise avec une personne connue et recommande une lecture approfondie',()=>{
  const p=intelligence.adaptivePlan('Mon ex va-t-il reprendre contact avec moi ?');
  assert.equal(p.domain,'Sentimental');
  assert.equal(p.intent,'return');
  assert.equal(p.relation.kind,'known');
  assert.ok(p.relation.roles.includes('ex'));
  assert.equal(p.recommendedFormat,5);
});

test('respecte le domaine choisi explicitement par utilisateur',()=>{
  const p=intelligence.adaptivePlan("J'attends un appel de Kinya",'il est en silence radio','Sentimental');
  assert.equal(p.domain,'Sentimental');
  assert.equal(p.intent,'return');
  assert.equal(p.relation.kind,'known');
  assert.equal(p.recommendedFormat,5);
});

test('une personne nommee avec silence radio est consideree comme deja connue',()=>{
  const p=intelligence.questionProfile("J'attends un appel de Kinya",'il est en silence radio','Sentimental');
  assert.equal(p.relation.kind,'known');
  assert.ok(p.reasons.includes('named_known_person'));
});

test('un prenom sujet dune question de recontact est une personne deja connue',()=>{
  const p=intelligence.questionProfile('Kinya va-t-il me recontacter ?','','Sentimental');
  assert.equal(p.domain,'Sentimental');
  assert.equal(p.intent,'return');
  assert.equal(p.relation.kind,'known');
  assert.ok(p.reasons.includes('known_person'));
  assert.equal(p.recommendedFormat,5);
});

test('detecte un contexte professionnel connu',()=>{
  const p=intelligence.questionProfile('Que pense mon collègue de mon projet professionnel ?');
  assert.equal(p.domain,'Professionnelle / Projet');
  assert.equal(p.relation.kind,'known');
  assert.ok(p.relation.roles.includes('colleague'));
});

test('detecte une nouvelle rencontre sans la transformer en personne connue',()=>{
  const p=intelligence.adaptivePlan('Vais-je faire une nouvelle rencontre amoureuse prochainement ?');
  assert.equal(p.domain,'Sentimental');
  assert.equal(p.intent,'new_relation');
  assert.equal(p.relation.kind,'new');
  assert.equal(p.recommendedFormat,3);
});

test('la convergence forte exige plusieurs reflets allant dans le même sens',()=>{
  const c=intelligence.convergence([
    {label:'Cartes',text:'Une ouverture favorable et un rapprochement constructif.'},
    {label:'Astrologie',text:'Une période favorable soutient le rapprochement et la confiance.'}
  ]);
  assert.equal(c.level,'strong');
  assert.equal(c.direction,'positive');
});

test('des reflets opposés restent explicitement contradictoires',()=>{
  const c=intelligence.convergence([
    {label:'Cartes',text:'Ouverture favorable, confiance et rapprochement.'},
    {label:'Astrologie',text:'Blocage, distance et tension freinent la situation.'}
  ]);
  assert.equal(c.level,'weak');
  assert.equal(c.direction,'mixed');
});

test('la datation astrologique calculée prime sur la datation symbolique sans devenir une garantie',()=>{
  const t=intelligence.timingSummary({symbolic:'dans trois semaines',astrology:'fenêtre du 12 au 19 octobre'});
  assert.equal(t.status,'astrological');
  assert.match(t.text,/12 au 19 octobre/);
  assert.match(t.disclaimer,/not a guaranteed/i);
});

test('le suivi local est plafonné et compare deux étapes sans produire de probabilité',()=>{
  const data=new Map();
  const storage={getItem:k=>data.has(k)?data.get(k):null,setItem:(k,v)=>data.set(k,v)};
  const first=intelligence.saveHistory(storage,{id:'1',question:'Évolution de ma relation avec X ?',direction:'positive',summary:'première lecture'});
  assert.equal(first.saved,true);
  const previous=intelligence.previousForQuestion(storage,'Évolution de ma relation avec X ?');
  assert.equal(previous.id,'1');
  assert.deepEqual(intelligence.compareHistory(previous,{direction:'negative'}),{status:'changed',from:'positive',to:'negative'});
  const c=intelligence.crossReflections({question:'Évolution de ma relation avec X ?',cards:'ouverture favorable',astrology:'confiance et rapprochement'});
  assert.equal(Object.hasOwn(c.convergence,'probability'),false);
});
