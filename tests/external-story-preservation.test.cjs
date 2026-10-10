const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM,ResourceLoader,VirtualConsole}=require('jsdom');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
class LocalResources extends ResourceLoader {
  fetch(url){
    const u=new URL(url);
    if(u.origin!=='https://cristariva.test')return null;
    const p=path.join(root,decodeURIComponent(u.pathname).replace(/^\/cristariva\//,''));
    return fs.existsSync(p)?Promise.resolve(fs.readFileSync(p)):null;
  }
}
const pause=ms=>new Promise(r=>setTimeout(r,ms));
test('Relation, Datation, visibility and late Tarot loading preserve the external narrative',async()=>{
  let requests=0;
  const good='Une clarification pourrait aider à envisager le lien avec davantage de recul.';
  const dom=new JSDOM(read('index.html'),{url:'https://cristariva.test/cristariva/',runScripts:'dangerously',resources:new LocalResources(),virtualConsole:new VirtualConsole(),beforeParse(w){
    w.HTMLElement.prototype.scrollIntoView=()=>{};
    w.AbortSignal=AbortSignal;
    w.fetch=async url=>{
      if(String(url).includes('workers.dev')){requests++;return {ok:true,status:200,json:async()=>({text:good})};}
      const u=new URL(String(url),'https://cristariva.test/cristariva/');
      const p=path.join(root,decodeURIComponent(u.pathname).replace(/^\/cristariva\//,''));
      return fs.existsSync(p)?{ok:true,text:async()=>read(path.relative(root,p))}:{ok:false,status:404,text:async()=>''};
    };
    w.HTMLCanvasElement.prototype.getContext=()=>({clearRect(){},drawImage(){}});
    w.HTMLCanvasElement.prototype.toDataURL=()=>'';
    w.URL.createObjectURL=()=>'';w.URL.revokeObjectURL=()=>{};
  }});
  const w=dom.window;
  try{
    await new Promise(r=>w.addEventListener('load',r,{once:true}));
    await pause(350);
    Object.defineProperty(w.document,'visibilityState',{configurable:true,value:'visible'});
    const state=w.eval('state');
    for(const oracle of ['cristariva','amour','tarot','reflets']){
      for(const lang of ['fr','en']){
        state.oracle=oracle;state.lang=lang;state.domain='Sentimental';state.question='Test '+oracle+' '+lang;
        w.document.querySelector('#question').value=state.question;
        state.draw=[{id:1,name:'Clarté',definition:'Clarification',reading_relationnel:'Clarification'}];
        state.tarotReversed=[];state.relation=null;
        const reading=w.document.querySelector('#reading');
        reading.innerHTML=w.interpretation(state.draw);
        // Even while the request is pending, lifecycle refreshes must not fall back.
        const pending=reading.firstElementChild;
        w.dispatchEvent(new w.Event('pageshow'));
        w.document.dispatchEvent(new w.Event('visibilitychange'));
        assert.equal(reading.firstElementChild,pending);
        for(let i=0;i<100&&reading.firstElementChild.dataset.storyEngine!=='external';i++)await pause(10);
        assert.equal(reading.firstElementChild.dataset.storyEngine,'external');
        const node=reading.firstElementChild,before=reading.innerHTML,count=requests;
        w.syncRelationContext();w.document.querySelector('#relationBtn').click();
        assert.ok(state.relation,oracle+' '+lang+' relationship draw');
        w.document.querySelector('#dateBtn').click();
        w.dispatchEvent(new w.Event('pageshow'));
        w.document.dispatchEvent(new w.Event('visibilitychange'));
        w.eval(read('tarot-story-fluid-v6.2.js'));
        await pause(30);
        assert.equal(reading.firstElementChild,node,oracle+' '+lang+' preserves the narrative node');
        assert.equal(reading.innerHTML,before);
        assert.equal(reading.querySelectorAll('.story-reading').length,1);
        assert.equal(requests,count,'no extra generation for complementary cards or lifecycle events');
      }
    }
  }finally{w.close();}
});

