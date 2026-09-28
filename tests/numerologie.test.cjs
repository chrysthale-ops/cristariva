const {test}=require('node:test');
const assert=require('node:assert/strict');
const n=require('../numerologie.js');
test('dates et nombres maîtres',()=>{
 assert.equal(n.lifePath('2007-01-01'),11);
 assert.equal(n.lifePath('1990-07-11'),1);
 assert.throws(()=>n.lifePath('2026-02-30'),/Date invalide/);
});
test('nom, accents et ponctuation',()=>{
 assert.deepEqual(n.nameNumbers('Élodie Dupont'),n.nameNumbers('Elodie-Dupont'));
 assert.equal(n.nameNumbers('A').soul,1);
});
test('année et mois personnels',()=>{
 assert.equal(n.personalYear('1990-07-11',2026),1);
 assert.equal(n.personalMonth('1990-07-11',2026,1),2);
 assert.throws(()=>n.personalMonth('1990-07-11',2026,13),/Mois invalide/);
});
