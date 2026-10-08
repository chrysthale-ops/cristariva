const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
test('the 288 catalogue cards have complete bilingual WebP thumbnails and reduce downloads',()=>{
 const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'catalog-thumbnails-data.js'),'utf8'),context);
 const data=context.window.CR_CATALOG_THUMBNAILS;
 for(const [deck,count] of [['cristariva',130],['amour',80],['tarot',78]]){
  assert.equal(Object.keys(data.decks[deck]).length,count);
  for(let id=1;id<=count;id++)for(const lang of ['fr','en']){
   const card=data.decks[deck][id][lang];assert.ok(card.width<=320&&card.height<=500);
   assert.match(card.src,new RegExp('/'+deck+'/'+String(id).padStart(3,'0')+'-[a-f0-9]{16}\\.webp$'));
   const bytes=fs.readFileSync(path.join(root,card.src));assert.equal(bytes.subarray(0,4).toString(),'RIFF');assert.equal(bytes.subarray(8,12).toString(),'WEBP');assert.ok(bytes.length>1000&&bytes.length<80000);
  }
  assert.ok(data.metrics[deck].thumbnail_bytes<data.metrics[deck].source_bytes*.1);
 }
});
