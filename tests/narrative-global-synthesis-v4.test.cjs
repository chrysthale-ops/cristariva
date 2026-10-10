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
    {index:0,name:'Transmission',role:'origin',meaning:'Une parole importante ou un héritage affectif peut influencer le lien.',local:'',reversed:false},
    {index:1,name:'Conflit',role:'obstacle',meaning:'Une divergence ou une tension peut freiner le rapprochement.',local:'',reversed:false},
    {index:2,name:'Guérison',role:'resource',meaning:'Une possibilité d’apaisement ou de réparation émotionnelle.',local:'',reversed:false},
    {index:3,name:'Réciprocité',role:'evolution',meaning:'Un échange plus équilibré suppose une participation des deux côtés.',local:'',reversed:false},
    {index:4,name:'Repère',role:'outcome',meaning:'La suite se lit dans la régularité, la parole donnée ou une limite claire.',local:'',reversed:false}
  ]
};

test('le moteur interdit les conditions causales inventées pour un recontact',()=>{
  const text='La perspective d’un retour dépend surtout d’une résolution mutuelle du conflit qui freine actuellement le lien.';
  const issues=quality.editorialIssues(text,input);
  assert.ok(issues.includes('invented_return_condition'));
  assert.equal(quality.validate(text,input),'invented_return_condition');
});

test('le moteur refuse les faits relationnels non fournis par la question',()=>{
  const text='Une tension ou un affrontement non résolu renforce le blocage, rendant chaque tentative de prise de contact incertaine. Sans cet équilibre, l’initiative restera bloquée.';
  const issues=quality.editorialIssues(text,input);
  assert.ok(issues.includes('invented_contact_history'));
  assert.ok(issues.includes('invented_return_condition'));
});

test('le moteur détecte encore une lecture carte par carte déguisée',()=>{
  const text='En parallèle, la tension pèse sur le lien. Une énergie de guérison se manifeste. L’évolution du tirage souligne ensuite la réciprocité. Finalement, ce qui émergera sera un repère clair.';
  assert.ok(quality.editorialIssues(text,input).includes('card_by_card_flow'));
});

test('une synthèse globale nuancée reste acceptée',()=>{
  const text='Un recontact de Kinya ne paraît pas immédiat, mais le tirage ne montre pas non plus une fermeture définitive. La dynamique d’ensemble suggère surtout une difficulté à rétablir facilement l’échange, tout en laissant une possibilité d’apaisement. Un contact reste donc envisageable, mais faiblement soutenu à ce stade ; s’il survenait, sa portée dépendrait surtout de la qualité et de la régularité des échanges observables, sans que cela suffise à annoncer une reprise durable du lien.';
  assert.equal(quality.validate(text,input),'');
});

test('les instructions exigent une synthèse non séquentielle',()=>{
  assert.match(quality.system,/never turn a symbolic conflict, tension, healing process or reciprocity requirement into a factual prerequisite/i);
  assert.match(quality.system,/reader should not be able to map each sentence back to Origine, Obstacle, Force, Évolution and Synthèse/i);
  assert.match(quality.rewriteGuidance,/supposed conflict being resolved/i);
});
