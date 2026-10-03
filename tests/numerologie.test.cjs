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
test('fenêtre de Datation traverse les années et respecte les cartes sans date',()=>{
 const anchor=new Date(2026,11,28);
 const w=n.period({id:119},anchor);
 assert.deepEqual(n.monthsInRange(w),[{year:2026,month:12},{year:2027,month:1}]);
 assert.equal(n.period({id:129},anchor),null);
 assert.equal(n.period({id:128},anchor),null);
 assert.equal(n.personalMonth('1990-07-11',2027,1),3);
});
