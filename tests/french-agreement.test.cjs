const {test}=require('node:test');
const assert=require('node:assert/strict');
const quality=require('../story-quality.js');

const input={lang:'fr',cards:[]};

test('rejects the feminine agreement for masculine attachement',()=>{
 const bad='Cette évolution peut demander de laisser derrière les anciennes attachements avant de construire un lien plus stable.';
 assert.deepEqual(quality.editorialIssues(bad),['french_agreement']);
 assert.equal(quality.validate(bad,input),'language');
});

test('accepts the correct masculine agreement for attachement',()=>{
 const good='Cette évolution peut demander de laisser derrière les anciens attachements avant de construire un lien plus stable.';
 assert.deepEqual(quality.editorialIssues(good),[]);
 assert.equal(quality.validate(good,input),'');
});
