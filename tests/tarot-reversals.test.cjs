const {test, before, after} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {JSDOM, ResourceLoader, VirtualConsole} = require('jsdom');
const root = path.join(__dirname, '..');

class LocalResources extends ResourceLoader {
  fetch(url) {
    const u = new URL(url);
    if (u.origin !== 'https://cristariva.test') return null;
    const file = path.join(root, decodeURIComponent(u.pathname).replace(/^\/cristariva\//, ''));
    return fs.existsSync(file) ? Promise.resolve(fs.readFileSync(file)) : null;
  }
}

let dom, w, state;
const errors=[];
before(async () => {
  const console=new VirtualConsole();
  console.on('jsdomError',e => { if (!/canvas/i.test(String(e.message||e))) errors.push(String(e.message||e)); });
  console.on('error',(...args) => errors.push(args.map(String).join(' ')));
  dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{
    url:'https://cristariva.test/cristariva/',runScripts:'dangerously',resources:new LocalResources(),virtualConsole:console,
    beforeParse(window) {
      window.HTMLElement.prototype.scrollIntoView=()=>{};
      window.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
      window.HTMLDialogElement.prototype.close=function(){this.open=false;};
      window.fetch=async () => ({ok:false,status:404,text:async()=>''});
      window.URL.createObjectURL=()=> 'blob:test';
      window.URL.revokeObjectURL=()=>{};
      window.Image=class {set src(v){this._src=v;queueMicrotask(()=>this.onload?.());}get src(){return this._src;}};
      window.HTMLCanvasElement.prototype.getContext=()=>({clearRect(){},drawImage(){}});
      window.HTMLCanvasElement.prototype.toDataURL=()=> 'data:image/webp;base64,UklGRg==';
    }
  });
  w=dom.window;
  await new Promise(resolve => w.addEventListener('load',resolve,{once:true}));
  for(let n=0;n<250 && !(w.CR_TAROT_HOTFIX_VERSION && w.TAROT_DATA?.main?.length===78);n++)
    await new Promise(resolve=>setTimeout(resolve,20));
  assert.equal(w.TAROT_DATA?.main?.length,78);
  state=w.eval('state');
});
after(()=>dom?.window.close());

function setDeck(deck){
  const el=w.document.querySelector('#oracleChoice');el.value=deck;
  el.dispatchEvent(new w.Event('change',{bubbles:true}));
}
function draw(count,random){
  state.format=String(count);
  const old=w.Math.random;
  w.Math.random=random;
  try{w.document.querySelector('#drawBtn').click();}finally{w.Math.random=old;}
}

test('the tarot option is deck-specific and all 78 cards have distinct bilingual meanings',()=>{
  assert.equal(w.document.querySelector('#tarotReversalOption').hidden,true);
  setDeck('tarot');
  assert.equal(w.document.querySelector('#tarotReversalOption').hidden,false);
  const entries=w.CR_TAROT_REVERSED;
  assert.equal(Object.keys(entries).length,78);
  assert.equal(Object.keys(w.CR_TAROT_REVERSED_NOTES).length,78);
  for(const card of w.TAROT_DATA.main){
    assert.ok(entries[card.id].fr.length>35,card.name);
    assert.ok(entries[card.id].en.length>35,card.en.name);
    assert.ok(w.CR_TAROT_REVERSED_NOTES[card.id].fr.length>45,card.name);
    assert.ok(w.CR_TAROT_REVERSED_NOTES[card.id].en.length>45,card.en.name);
  }
  assert.notEqual(entries[23].fr,entries[24].fr);
  assert.match(entries[44].fr,/départ nécessaire/);
});

test('opt-in controls orientation, visible card and narrative for 1, 3 and 5 positions',()=>{
  state.lang='fr';w.applyLanguage();
  w.document.querySelector('#question').value='Que dois-je comprendre de ce projet ?';
  const option=w.document.querySelector('#tarotAllowReversals');
  option.checked=false;draw(1,()=>0);
  assert.equal(state.tarotReversed[0],false);
  assert.equal(w.document.querySelectorAll('#drawCards .tarot-reversed').length,0);
  option.checked=true;
  draw(1,()=>0);
  assert.equal(state.tarotReversed[0],true);
  const card=state.draw[0];
  assert.match(w.document.querySelector('#drawCards').textContent,/Renversée/);
  assert.ok(w.document.querySelector('#drawCards').textContent.includes(w.CR_TAROT_REVERSED[card.id].fr));
  assert.ok(w.document.querySelector('#reading').textContent.toLowerCase().includes(w.CR_TAROT_REVERSED[card.id].fr.toLowerCase()));
  assert.ok(!w.document.querySelector('#reading .story-continuous').textContent.includes(card.name));
  w.renderSynthesis();
  assert.ok(w.document.querySelector('#synthesis').textContent.toLowerCase().includes(w.CR_TAROT_REVERSED[card.id].fr.toLowerCase()),w.document.querySelector('#synthesis').textContent);

  for(const count of [3,5]){
    let calls=0;
    draw(count,()=> (++calls<=77?0.8:(calls%2?0.2:0.8)));
    assert.equal(state.draw.length,count);
    assert.equal(state.tarotReversed.length,count);
    assert.ok(state.tarotReversed.some(Boolean));
    assert.ok(state.tarotReversed.some(v=>!v));
    assert.equal(w.document.querySelectorAll('#drawCards .tarot-reversed').length,state.tarotReversed.filter(Boolean).length);
    for(let i=0;i<count;i++)if(state.tarotReversed[i]){
      const meaning=w.CR_TAROT_REVERSED[state.draw[i].id].fr;
      assert.ok(w.document.querySelector('#reading').textContent.toLowerCase().includes(meaning.toLowerCase()));
    }
    w.renderSynthesis();
    assert.ok(w.document.querySelector('#synthesis').textContent.length>100);
  }
});

test('language preserves orientations and switching back to an oracle clears them',()=>{
  state.lang='en';w.applyLanguage();
  assert.equal(w.document.querySelector('#tarotReversalLabel').textContent,'Allow reversed cards');
  const index=state.tarotReversed.findIndex(Boolean);
  const meaning=w.CR_TAROT_REVERSED[state.draw[index].id].en;
  assert.ok(w.document.querySelectorAll('#drawCards .tarot-reversed').length>0);
  assert.ok(w.document.querySelector('#drawCards').textContent.includes(meaning));
  assert.ok(w.document.querySelector('#reading').textContent.toLowerCase().includes(meaning.toLowerCase()));
  w.renderSynthesis();
  assert.ok(w.document.querySelector('#synthesis').textContent.toLowerCase().includes(meaning.toLowerCase()));
  setDeck('cristariva');
  assert.equal(w.document.querySelector('#tarotReversalOption').hidden,true);
  assert.equal(state.tarotReversed.length,0);
  draw(1,()=>0);
  assert.equal(w.document.querySelectorAll('#drawCards .tarot-reversed').length,0);
  assert.deepEqual(errors,[]);
});

test('final synthesis opens for a three-card draw with an upright middle card',()=>{
  setDeck('tarot');
  state.lang='fr';w.applyLanguage();
  w.document.querySelector('#tarotAllowReversals').checked=true;
  draw(3,()=>0);
  state.tarotReversed=[true,false,true];
  const synthesis=w.document.querySelector('#synthesis');
  synthesis.classList.add('hidden');
  synthesis.textContent='';
  w.document.querySelector('#synthesisBtn').click();
  assert.equal(synthesis.classList.contains('hidden'),false);
  assert.ok(synthesis.textContent.toLowerCase().includes(w.CR_TAROT_REVERSED[state.draw[0].id].fr.toLowerCase()));
  assert.ok(synthesis.textContent.toLowerCase().includes(w.CR_TAROT_REVERSED[state.draw[2].id].fr.toLowerCase()));
  assert.deepEqual(errors,[]);
});

test('a mixed Tarot cross spread tells the reported story at length without position formulas',()=>{
  setDeck('tarot');
  state.domain='Général / spirituel';
  state.question='tarot inversé';
  state.lang='fr';
  const cards=[48,66,1,28,50].map(id=>w.TAROT_DATA.main.find(card=>card.id===id));
  state.draw=cards;
  state.tarotReversed=[true,true,true,false,false];
  const story=w.CR_UNIVERSAL_FLUID_STORY(cards);
  const fragment=w.document.createElement('div');
  fragment.innerHTML=story.match(/<p class="story-continuous">([\s\S]*?)<\/p>/)[1];
  const prose=fragment.textContent;
  assert.ok(prose.split(/\s+/).length>=170,prose);
  assert.ok(prose.indexOf('Une invitation a réveillé')<prose.indexOf('Cette incertitude'));
  assert.ok(prose.indexOf('Cette incertitude')<prose.indexOf('L’envie de prendre'));
  assert.match(prose,/reconnaissance méritée/);
  assert.match(prose,/attention réelle aux émotions/);
  assert.doesNotMatch(prose,/Au départ|La difficulté actuelle apparaît ici|Un appui reste possible|Pour la suite|Le changement se vérifiera/);
  for(const card of cards)assert.ok(!prose.includes(card.name),card.name);

  state.lang='en';
  fragment.innerHTML=w.CR_UNIVERSAL_FLUID_STORY(cards).match(/<p class="story-continuous">([\s\S]*?)<\/p>/)[1];
  const english=fragment.textContent;
  assert.ok(english.split(/\s+/).length>=160,english);
  assert.match(english,/lasting place|later actions/);
  assert.doesNotMatch(english,/At the outset|The present difficulty is this|For what comes next|Au départ/);

  state.lang='fr';
  state.draw=[31,58,53,70,75].map(id=>w.TAROT_DATA.main.find(card=>card.id===id));
  state.tarotReversed=[true,true,true,true,true];
  fragment.innerHTML=w.CR_UNIVERSAL_FLUID_STORY(state.draw).match(/<p class="story-continuous">([\s\S]*?)<\/p>/)[1];
  assert.ok(fragment.textContent.split(/\s+/).length>=135,fragment.textContent);
  assert.doesNotMatch(fragment.textContent,/Au départ|La difficulté actuelle|Un appui reste possible|Pour la suite/);
  assert.deepEqual(errors,[]);
});

test('every upright Tarot card keeps its own subject in a mixed reading without naming the card',()=>{
  setDeck('tarot');
  state.domain='Général / spirituel';
  state.question='Comment avancer ?';
  const reversed=w.TAROT_DATA.main.find(card=>card.id===48);
  const closing=w.TAROT_DATA.main.find(card=>card.id===66);
  state.tarotReversed=[true,false,true];
  const fragment=w.document.createElement('div');
  for(const card of w.TAROT_DATA.main){
    state.draw=[reversed,card,closing];
    for(const lang of ['fr','en']){
      state.lang=lang;
      fragment.innerHTML=w.CR_UNIVERSAL_FLUID_STORY(state.draw).match(/<p class="story-continuous">([\s\S]*?)<\/p>/)[1];
      const prose=fragment.textContent;
      assert.ok(prose.length>230,`${card.id} ${lang}`);
      assert.ok(!prose.includes(lang==='en'?card.en.name:card.name),`${card.id} ${lang}: ${prose}`);
      assert.doesNotMatch(prose,/Au départ|At the outset|Un appui reste possible|A useful point of support appears here/);
    }
  }
});
