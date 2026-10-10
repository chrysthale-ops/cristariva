const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM}=require('jsdom');
const source=fs.readFileSync('tarot-title-image-hotfix.js','utf8');
const compact=source.slice(source.indexOf('  function compactTarotReversalOption(){'),source.indexOf('  function scheduleCompactTarotReversalOption(){'));
for(const existingRow of [false,true])test(`format heading stays before choices with existing row=${existingRow}`,()=>{
 const dom=new JSDOM(`<section id="tirage"><div class="panel"><div class="cr-reading-controls"><div class="reading-fields"></div><h3 data-i18n="s37">Format</h3><div class="cr-immersive-spread-grid"></div><div id="tarotReversalOption" hidden><label>Renversées</label><small id="tarotReversalHint">Conseil</small></div><div class="actions"></div></div></div></section>`,{runScripts:'outside-only'});
 const d=dom.window.document;
 if(existingRow){const row=d.createElement('div');row.id='crFormatReversalRow';d.querySelector('.panel').appendChild(row);row.append(d.querySelector('h3'),d.getElementById('tarotReversalOption'));}
 dom.window.eval(compact+';compactTarotReversalOption();compactTarotReversalOption();');
 const controls=d.querySelector('.cr-reading-controls');
 assert.deepEqual([...controls.children].map(n=>n.id||n.className),['reading-fields','crFormatReversalRow','cr-immersive-spread-grid','actions']);
 assert.equal(d.querySelectorAll('[data-i18n="s37"]').length,1);
 assert.equal(d.getElementById('tarotReversalOption').parentElement.id,'crFormatReversalRow');
 assert.equal(d.getElementById('tarotReversalOption').hidden,true);
 dom.window.close();
});
