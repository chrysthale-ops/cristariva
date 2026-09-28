const {test}=require('node:test');
const assert=require('node:assert/strict');
const {parseDate,displayDate}=require('../date-entry.js');
test('saisie directe et conversion pour les calculs',()=>{
 assert.equal(parseDate('5/3/1987'),'1987-03-05');
 assert.equal(parseDate('05.03.1987'),'1987-03-05');
 assert.equal(displayDate('1987-03-05'),'05/03/1987');
 assert.equal(parseDate('31/02/1987'),null);
 assert.equal(parseDate('29/02/2000'),'2000-02-29');
 assert.equal(parseDate('29/02/1900'),null);
});
test('l’aide ajoute les séparateurs pendant la frappe',()=>{
 const {formatTyping}=require('../date-entry.js');
 assert.equal(formatTyping('05'),'05/');
 assert.equal(formatTyping('0503'),'05/03/');
 assert.equal(formatTyping('05031987'),'05/03/1987');
 assert.equal(formatTyping('05/',true),'05');
 assert.equal(formatTyping('05/03/1987'),'05/03/1987');
});
