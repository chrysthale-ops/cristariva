const {test}=require('node:test');
const assert=require('node:assert/strict');
const quality=require('../story-quality.js');

const input={
  lang:'fr',
  question:'Kinya va-t-il me recontacter ?',
  context:'',
  domain:'Sentimental',
  oracle:'cristariva',
  cards:[
    {index:0,name:'Attirance réciproque',role:'origin',meaning:"L’intérêt et le désir circulent des deux côtés.",local:'',reversed:false},
    {index:1,name:'Rupture',role:'evolution',meaning:'Une séparation, une cassure ou la fin d’une dynamique.',local:'',reversed:false},
    {index:2,name:'Fidélité',role:'outcome',meaning:'Loyauté, constance et respect des engagements affectifs.',local:'',reversed:false}
  ]
};

test('une séparation symbolique ne devient pas un fait actuel',()=>{
  const text='Il est envisageable que Kinya vous recontacte, toutefois la relation subit une séparation qui rend cette possibilité fragile.';
  assert.ok(quality.editorialIssues(text,input).includes('invented_relationship_state'));
  assert.equal(quality.validate(text,input),'invented_relationship_state');
});

test('la fidélité ne prouve pas des engagements existants',()=>{
  const text='Un contact reste possible, mais les engagements existants restent prépondérants et peuvent freiner un rapprochement.';
  assert.ok(quality.editorialIssues(text,input).includes('invented_commitment'));
  assert.equal(quality.validate(text,input),'invented_commitment');
});

test('une lecture trois cartes ne doit pas révéler avant maintenant élan',()=>{
  const text="L’énergie initiale montre une ouverture ; cependant une coupure limite l’échange ; en outre la fidélité devient le dernier repère.";
  assert.ok(quality.editorialIssues(text,input).includes('card_by_card_flow'));
});

test('une synthèse fusionnée et prudente reste acceptée',()=>{
  const text='Un recontact de Kinya reste envisageable, mais le tirage le soutient de manière fragile plutôt que franche. Une ouverture relationnelle est présente dans la symbolique, tandis qu’une dynamique de coupure limite la reprise d’échange. Un éventuel contact ne suffirait donc pas à annoncer une reprise durable : sa portée se lirait surtout dans la constance, la fiabilité et la régularité des échanges observables.';
  assert.equal(quality.validate(text,input),'');
});

test('les instructions distinguent fidélité symbolique et engagement réel',()=>{
  assert.match(quality.system,/Fidelity may describe constancy, loyalty, reliability or coherence/i);
  assert.match(quality.system,/do not expose the hidden Before → Now → Momentum order/i);
  assert.match(quality.rewriteGuidance,/Treat fidelity as symbolic constancy or reliability/i);
});
