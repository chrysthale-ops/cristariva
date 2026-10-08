const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');

test('Reflets : les 50 vignettes sont nettement plus légères et toutes les images sont présentes',()=>{
 let before=0,after=0;
 for(let i=1;i<=50;i++){
  const name=String(i).padStart(2,'0')+'.webp';
  const full=fs.readFileSync(path.join(root,'cards/reflets/v2',name));
  const small=fs.readFileSync(path.join(root,'cards/reflets/thumbs-v1',name));
  assert.equal(full.subarray(0,4).toString(),'RIFF',name);
  assert.equal(small.subarray(8,12).toString(),'WEBP',name);
  assert.ok(small.length<full.length*.3,name+' : réduction d’au moins 70 %');
  assert.ok(small.length<50000,name+' : moins de 50 Ko');
  before+=full.length;after+=small.length;
 }
 assert.ok(after<before*.22,'réduction globale d’au moins 78 %');
 assert.deepEqual(fs.readFileSync(path.join(root,'cards/reflets/v2/33.webp')),fs.readFileSync(path.join(root,'cards/reflets/v3/33.webp')));
});

test('Reflets : le cache évite un second téléchargement et survit à l’activation',async()=>{
 const handlers={},stores=new Map(),deleted=[];
 const imageCache='cristariva-reflets-images-v1';
 function open(name){
  if(!stores.has(name))stores.set(name,new Map());
  const store=stores.get(name);
  return {match:async req=>store.get(req.url)?.clone(),put:async(req,value)=>store.set(req.url,value)};
 }
 let downloads=0;
 const self={location:{origin:'https://cristariva.test'},addEventListener:(name,fn)=>handlers[name]=fn,clients:{claim:async()=>{},matchAll:async()=>[]}};
 const caches={open:async name=>open(name),keys:async()=>[...stores.keys()],delete:async name=>{deleted.push(name);return stores.delete(name);}};
 const context={self,caches,URL,Request,Response,fetch:async()=>{downloads++;return new Response('image',{status:200});}};
 vm.runInNewContext(fs.readFileSync(path.join(root,'service-worker.js'),'utf8'),context);
 async function get(file){let response;handlers.fetch({request:new Request('https://cristariva.test/cristariva/cards/'+file),respondWith:p=>response=p});return await response;}
 for(const file of ['reflets/thumbs-v1/03.webp','reflets/v2/05.webp','reflets/v3/33.webp','catalog-thumbs/v1/tarot/001-abcdef.webp']){
  const count=downloads;
  assert.equal(await (await get(file)).text(),'image');
  assert.equal(await (await get(file)).text(),'image');
  assert.equal(downloads,count+1,file);
 }
 stores.set('cristariva-v125-old',new Map());
 let activation;handlers.activate({waitUntil:p=>activation=p});await activation;
 assert.ok(deleted.includes('cristariva-v125-old'));
 assert.ok(!deleted.includes(imageCache));
 assert.ok(stores.has(imageCache));
 assert.ok(stores.has('cristariva-catalog-images-v1'));
 assert.ok(!deleted.includes('cristariva-catalog-images-v1'));
 const count=downloads;assert.equal(await (await get('reflets/thumbs-v1/03.webp')).text(),'image');assert.equal(downloads,count);
});
