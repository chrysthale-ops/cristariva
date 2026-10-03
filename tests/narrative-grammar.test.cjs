const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const source=read('universal-fluid-story-v6.3.js');
const state={domain:'Sentimental',question:'Ma prochaine étape ?',lang:'fr',oracle:'cristariva',draw:[],tarotReversed:[]};
const window={addEventListener(){}};
const document={addEventListener(){},getElementById(){return null}};
const context=vm.createContext({state,window,document});
vm.runInContext(source,context);
vm.runInContext(read('tarot-reversals.js'),context);
vm.runInContext(read('oracle-amour-data.js'),context);
vm.runInContext(read('tarot-divinatoire-data.js'),context);
for(const suit of ['batons','coupes','epees','deniers'])vm.runInContext(read('tarot-minors-data-'+suit+'.js'),context);
const base=JSON.parse(read('index.html').match(/^const DATA =(.+);$/m)[1]);
const minors=window.CR_TAROT_MINOR_ROWS.map(r=>({id:r[0],name:r[1],category:r[2],keywords:r[4],definition:r[5],en:{name:r[9],keywords:r[12],definition:r[13]}}));
const decks={cristariva:base.main,amour:window.AMOUR_DATA.main,tarot:[...window.TAROT_DATA.main.filter(c=>c.id<=22),...minors]};
test('Destin, Seconde chance and Tentation retain their meanings and their positions',()=>{
  const cards=['Destin','Seconde chance','Tentation'].map(name=>Object.values(decks).flat().find(c=>c.name===name));
  assert.ok(cards.every(Boolean));
  Object.assign(state,{oracle:'amour',domain:'Sentimental',lang:'fr',draw:cards,tarotReversed:[]});
  const body=prose(window.CR_UNIVERSAL_FLUID_STORY(cards));
  assert.match(body,/empreinte/);assert.match(body,/reprendre/);assert.match(body,/attirance/i);
  assert.doesNotMatch(body,/désaccord|choisir le cap/);
  for(let i=0;i<3;i++){
    const changed=cards.slice();changed[i]=decks.tarot.find(c=>c.name==='Le Chariot');
    assert.notEqual(prose(window.CR_UNIVERSAL_FLUID_STORY(changed)),body);
  }
  assert.notEqual(prose(window.CR_UNIVERSAL_FLUID_STORY([...cards].reverse())),body);
});
test('incidental contradictions in a definition cannot override a recognised title',()=>{
  for(const [oracle,deck] of Object.entries(decks))for(const name of ['Seconde chance','Tentation','Le Chariot','Trois d’Épées']){
    const card=deck.find(c=>c.name===name);if(!card)continue;
    Object.assign(state,{oracle,domain:'Sentimental',lang:'fr',draw:[card],tarotReversed:[false]});
    const expected=prose(window.CR_UNIVERSAL_FLUID_STORY([card]));
    const altered={...card,definition:'Volonté, conflit, deuil, perte, pause, surcharge.',meaning:''};
    assert.equal(prose(window.CR_UNIVERSAL_FLUID_STORY([altered])),expected);
  }
});
function prose(html){return html.match(/<p class="story-continuous">([\s\S]*?)<\/p>/)[1].replace(/&#39;/g,"'").replace(/&amp;/g,'&');}
function clean(text){return text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();}
function noCopy(text,cards){
  const body=clean(text);
  for(const card of cards){
    const originals=[card.definition,card.meaning,card.reading_relationnel,card.reading_professionnel,card.reading_spirituel,card.en?.definition,window.CR_TAROT_REVERSED[card.id]?.[state.lang]];
    for(const raw of originals.filter(Boolean))for(const sentence of raw.split(/[.!?;]/)){
      const c=clean(sentence);
      if(c.split(' ').length>=7)assert.ok(!body.includes(c),`Copied card ${card.name}: ${sentence}\n${text}`);
    }
  }
}
test('the reported five-card spread explicitly retains the romantic nature of the bond',()=>{
  const cards=['Sincérité','Doute','Protection','Lien amoureux','Évolution'].map(name=>decks.amour.find(c=>c.name===name));
  assert.ok(cards.every(Boolean));
  Object.assign(state,{oracle:'amour',domain:'Sentimental',lang:'fr',question:'Où en sommes-nous avec Alex ?',draw:cards,tarotReversed:[]});
  const body=prose(window.CR_UNIVERSAL_FLUID_STORY(cards));
  assert.match(body,/registre amoureux/);assert.match(body,/sentiments/);
  assert.doesNotMatch(body,/compétences complémentaires|choisir un cap avant d’accélérer/);
  noCopy(body,cards);
  state.lang='en';
  assert.match(prose(window.CR_UNIVERSAL_FLUID_STORY(cards)),/romantic feelings/);
});
test('alignment, breakup and happiness develop a connected answer about a return',()=>{
  const cards=['Alignement','Rupture','Bonheur'].map(name=>decks.amour.find(c=>c.name===name));
  assert.ok(cards.every(Boolean));
  Object.assign(state,{oracle:'amour',domain:'Sentimental',lang:'fr',question:'Le retour de quelqu’un dans ma vie ?',draw:cards,tarotReversed:[]});
  const body=prose(window.CR_UNIVERSAL_FLUID_STORY(cards));
  assert.ok(body.split(/\s+/).length>=150);
  assert.match(body,/coupure/);assert.match(body,/cohérence/);assert.match(body,/épanouissement/);
  assert.match(body,/volonté partagée/);assert.match(body,/ne suffit pas/);
  noCopy(body,cards);
});
test('every real card, deck, domain, language and supported format avoids catalogue sentences',()=>{
  assert.equal(decks.tarot.length,78);
  let count=0;
  for(const [oracle,deck] of Object.entries(decks))for(const domain of ['Sentimental','Relationnel','Professionnel / projet','Général / spirituel'])for(const lang of ['fr','en'])for(const n of [1,3,5])for(let i=0;i<deck.length;i++){
    Object.assign(state,{oracle,domain,lang,question:'Quel chemin choisir ?',draw:Array.from({length:n},(_,j)=>deck[(i+j)%deck.length]),tarotReversed:Array(n).fill(false)});
    const body=prose(window.CR_UNIVERSAL_FLUID_STORY(state.draw));
    assert.ok(body.length>45,`${oracle} ${domain} ${lang} ${n} ${i}`);
    noCopy(body,state.draw);
    assert.doesNotMatch(body,/Kinya|@ |undefined|\b(?:de éclaircir|de identifier|de accueillir|de éviter)\b/);
    count++;
  }
  assert.ok(count>5000);
});
test('all 78 reversals affect the story and final summary without repeating their displayed explanation',()=>{
  for(const card of decks.tarot)for(const lang of ['fr','en'])for(const n of [1,3,5]){
    Object.assign(state,{oracle:'tarot',domain:'Relationnel',lang,question:'Comment avancer ?',draw:[card,...decks.tarot.filter(c=>c!==card).slice(0,n-1)],tarotReversed:Array(n).fill(false)});
    const upright=prose(window.CR_UNIVERSAL_FLUID_STORY(state.draw));
    state.tarotReversed[0]=true;
    const reverse=prose(window.CR_UNIVERSAL_FLUID_STORY(state.draw));
    assert.notEqual(reverse,upright);
    noCopy(reverse,state.draw);
    const summary=window.CR_UNIVERSAL_ROLE_SUMMARY(card,n===1?'outcome':'origin',lang==='en');
    assert.ok(summary.length>20);
    noCopy(summary,[card]);
  }
});
test('selected domain is authoritative even when question mentions another domain',()=>{
  const card=decks.tarot.find(c=>c.id===8);
  Object.assign(state,{oracle:'tarot',draw:[card],tarotReversed:[false],lang:'fr',question:'Un projet avec mon partenaire ?',domain:'Général / spirituel'});
  const spiritual=prose(window.CR_UNIVERSAL_FLUID_STORY(state.draw));
  state.domain='Professionnel / projet';
  const professional=prose(window.CR_UNIVERSAL_FLUID_STORY(state.draw));
  assert.notEqual(spiritual,professional);
  assert.doesNotMatch(spiritual,/première étape réalisable/);
});
test('person questions never inject a remembered name; question is escaped and every input length is retained',()=>{
  Object.assign(state,{oracle:'tarot',draw:[decks.tarot.find(c=>c.id===6)],tarotReversed:[true],lang:'fr',domain:'Relationnel',question:'Que pense Alex de moi ?'});
  const body=prose(window.CR_UNIVERSAL_FLUID_STORY(state.draw));
  assert.doesNotMatch(body,/Kinya/);noCopy(body,state.draw);
  state.question='Me & <toi>';
  assert.match(window.CR_UNIVERSAL_FLUID_STORY(state.draw),/Me &amp; &lt;toi&gt;/);
  state.draw=decks.tarot.slice(0,14);state.tarotReversed=[];
  assert.ok(prose(window.CR_UNIVERSAL_FLUID_STORY(state.draw)).length>300);
});
test('five identical themes do not repeat complete sentences behind different transitions',()=>{
  Object.assign(state,{oracle:'cristariva',draw:Array.from({length:5},(_,i)=>({id:i,name:'Secret',keywords:'ambiguïté'})),tarotReversed:[],lang:'fr',domain:'Relationnel',question:'La suite ?'});
  const sentences=prose(window.CR_UNIVERSAL_FLUID_STORY(state.draw)).split(/[.!?]/).map(clean).filter(Boolean);
  assert.equal(new Set(sentences).size,sentences.length);
});

test('question intents share the same protected engine, including thoughts, dates and decisions',()=>{
  const questions=['Que pense Alex de moi ?','Que ressent Marie pour moi ?','Mon prochain crush ?','L’issue du projet ?','Quand aura lieu le retour ?','Quel message essaie-t-on de me transmettre ?','Mon avenir sentimental','Mes avancées d’aujourd’hui ?','Connecter Cristariva aux événements du monde','<script>alert(1)</script>'];
  for(const [oracle,deck] of Object.entries(decks))for(const domain of ['Sentimental','Relationnel','Professionnel / projet','Général / spirituel'])for(const lang of ['fr','en'])for(const n of [1,3,5])for(const question of questions){
    Object.assign(state,{oracle,domain,lang,question,draw:deck.slice(0,n),tarotReversed:Array(n).fill(oracle==='tarot')});
    const html=window.CR_UNIVERSAL_FLUID_STORY(state.draw);
    noCopy(prose(html),state.draw);
    assert.doesNotMatch(prose(html),/Kinya|Alex|Marie|<script>/);
    assert.match(html,/universal-fluid-6.28/);
  }
});
