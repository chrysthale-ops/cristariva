const {test}=require('node:test');
const assert=require('node:assert/strict');
const quality=require('../story-quality.js');

test('the narrative rules keep an existing link distinct from a possible new encounter',()=>{
  assert.match(quality.system,/already-known link/i);
  assert.match(quality.system,/never silently merge them into one person/i);
  assert.match(quality.system,/l'un des partenaires/i);
});

test('unsupported partner wording is flagged when no partnership is supplied',()=>{
  const input={
    question:'mes futures rencontres',
    context:'',
    domain:'Sentimental',
    cards:[
      {name:'Amitié',local:'',meaning:'Lien fondé sur la confiance.'},
      {name:'Prise de recul',local:'',meaning:'Distance temporaire.'},
      {name:'Rencontre',local:'',meaning:'Ouverture à un nouveau lien.'}
    ]
  };
  const text="Une ouverture reste possible. Actuellement, l'un des partenaires semble prendre du recul pour clarifier ses attentes.";
  assert.ok(quality.editorialIssues(text,input).includes('unsupported_relationship_status'));
});

test('partner wording is not flagged when the user explicitly establishes a couple',()=>{
  const input={question:'Que devient notre couple ?',context:'Mon partenaire et moi prenons de la distance.',domain:'Sentimental',cards:[]};
  const text="L'un des partenaires peut avoir besoin de recul avant une clarification.";
  assert.ok(!quality.editorialIssues(text,input).includes('unsupported_relationship_status'));
});
