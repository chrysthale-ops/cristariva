const {test}=require('node:test');
const assert=require('node:assert/strict');
const {parseTime,formatTyping}=require('../time-entry.js');
test('saisie directe des heures et limites',()=>{
 assert.equal(parseTime('0930'),'09:30');
 assert.equal(parseTime('9:30'),'09:30');
 assert.equal(parseTime('23:59'),'23:59');
 assert.equal(parseTime('24:00'),null);
 assert.equal(parseTime('12:60'),null);
 assert.equal(parseTime(''),null);
});
test('aide à la saisie progressive',()=>{
 assert.equal(formatTyping('09'),'09:');
 assert.equal(formatTyping('0930'),'09:30');
 assert.equal(formatTyping('09:',true),'09');
 assert.equal(formatTyping('09:30'),'09:30');
});
