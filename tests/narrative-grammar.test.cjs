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
test('reported emergence spread preserves the final beginning and its relationship domain',()=>{
  const cards=['Complexité','Communication','Éveil','Équité','Éclosion'].map(name=>decks.cristariva.find(c=>c.name===name));
  assert.ok(cards.every(Boolean));
  Object.assign(state,{oracle:'cristariva',domain:'Sentimental',lang:'fr',question:'Quelles décisions concrètes Kinya va-t-il prendre ?',draw:cards,tarotReversed:[]});
  const body=prose(window.CR_UNIVERSAL_FLUID_STORY(cards));
  for(const word of ['sentiments mêlés','conversation claire','prise de conscience des sentiments','attention, des efforts et des compromis','confiance naissante','sentiment reconnu','proximité nouvelle'])assert.ok(body.includes(word),word);
  assert.doesNotMatch(body,/ralentissement|surcharge|monde intérieur|Rien ne semble entièrement figé|Kinya/);
  for(const domain of ['Sentimental','Relations','Professionnelle / Projet','Général / spirituel'])for(const lang of ['fr','en'])for(const n of [1,3,5]){
    Object.assign(state,{domain,lang,draw:cards.slice(0,n-1).concat(cards[4])});
    const text=prose(window.CR_UNIVERSAL_FLUID_STORY(state.draw));
    assert.match(text,lang==='fr'?/commence|apparition/:/beginning|emergence/);
    noCopy(text,state.draw);
    assert.ok(window.CR_UNIVERSAL_ROLE_SUMMARY(cards[4],'outcome',lang==='en').length>50);
  }
});
test('reported soulmate spread retains mutual desire, loyalty, encounter and companionship',()=>{
  const cards=['Âme sœur','Fidélité','Attirance réciproque','Rencontre','Complicité'].map(name=>decks.amour.find(c=>c.name===name));
  assert.ok(cards.every(Boolean));
  Object.assign(state,{oracle:'amour',domain:'Sentimental',lang:'fr',question:'Mon impatience à trouver mon bonheur sentimental',draw:cards,tarotReversed:[]});
  const body=prose(window.CR_UNIVERSAL_FLUID_STORY(cards));
  for(const idea of [/familiarité profonde/,/respect des engagements/,/désir qui circulent des deux côtés/,/nouveau contact/,/échanges spontanés/])assert.match(body,idea);
  assert.doesNotMatch(body,/Au départ|compétences complémentaires|déséquilibre encore non résolu|attachement réel/);
  assert.match(body,/sans supposer qu’une relation existe déjà/);
  assert.match(body,/ne permet pas de conclure à une infidélité/);
  for(const n of [1,3,5])for(const card of cards){
    state.draw=Array(n).fill(card);
    const text=prose(window.CR_UNIVERSAL_FLUID_STORY(state.draw));
    noCopy(text,state.draw);
    assert.doesNotMatch(text,/Au départ|compétences complémentaires/);
    assert.ok(window.CR_UNIVERSAL_ROLE_SUMMARY(card,'outcome',false));
  }
});
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
test('friendship as the final card remains explicitly friendship, not collaboration',()=>{
  const cards=['Liberté','Union','Seconde chance','Karma','Amitié'].map(name=>decks.amour.find(c=>c.name===name));
  assert.ok(cards.every(Boolean));
  Object.assign(state,{oracle:'amour',domain:'Sentimental',lang:'fr',question:'Mon avenir amoureux ?',draw:cards,tarotReversed:[]});
  const body=prose(window.CR_UNIVERSAL_FLUID_STORY(cards));
  assert.match(body,/amitié au premier plan/);assert.match(body,/pas encore une promesse de couple/);
  assert.match(body,/ancien schéma relationnel/);assert.match(body,/engagement assumé/);
  assert.doesNotMatch(body,/collaboration effective|comment chacun peut contribuer/);
  noCopy(body,cards);
  state.lang='en';
  assert.match(prose(window.CR_UNIVERSAL_FLUID_STORY(cards)),/friendship/);
});
test('the last card supplies a developed conclusion for three and five cards',()=>{
  const deck=decks.amour;
  for(const n of [3,5]){
    const names=n===5?['Intimité','Plaisir','Évolution','Âme jumelle','Tendresse']:['Intimité','Évolution','Tendresse'];
    const cards=names.map(name=>deck.find(c=>c.name===name));assert.ok(cards.every(Boolean));
    Object.assign(state,{oracle:'amour',domain:'Sentimental',lang:'fr',question:'Ce qui mérite de durer entre nous ?',draw:cards,tarotReversed:[]});
    const body=prose(window.CR_UNIVERSAL_FLUID_STORY(cards));
    assert.match(body,/douceur entre vous/);assert.match(body,/sans pression/);assert.match(body,/respecté dans son rythme/);
    const conclusion=body.slice(body.toLowerCase().indexOf('ce qui mérite de durer'));
    assert.ok(conclusion.split(/\s+/).length>=65,conclusion);
    noCopy(body,cards);
    const changed=[...cards.slice(0,-1),deck.find(c=>c.name==='Rupture')];
    const alternative=prose(window.CR_UNIVERSAL_FLUID_STORY(changed));
    assert.doesNotMatch(alternative,/douceur entre vous/);
    assert.match(alternative,/séparation/);
  }
});
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
  assert.doesNotMatch(body,/Les élans et les ressources précédents|C’est le fil décisif|Les ouvertures précédentes/);
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
    assert.ok(html.includes(`data-story-engine="universal-fluid-${window.CR_UNIVERSAL_FLUID_STORY_VERSION}"`));
  }
});


test('all decks, domains and spread sizes avoid automatic padding and transitions',()=>{
  for(const [oracle,deck] of Object.entries(decks))for(const domain of ['Sentimental','Relationnel','Professionnel / Projet','Général / spirituel'])for(const lang of ['fr','en'])for(const count of [1,2,3,4,5,7]){
    const cards=deck.slice(0,count);
    Object.assign(state,{oracle,domain,lang,question:'',draw:cards,tarotReversed:[]});
    const body=prose(window.CR_UNIVERSAL_FLUID_STORY(cards));
    assert.doesNotMatch(body,/Ce point de départ explique pourquoi|Cet appui prend tout son sens|Le changement se vérifiera dans la capacité|C’est le fil décisif|Les élans et les ressources précédents|Un élément déterminant apparaît néanmoins|La situation évolue ensuite|This is the deciding thread|The earlier impulses and resources/);
    assert.ok(body.length>0);
  }
});


test('misunderstanding, honesty, pleasure, return and patience survive every role and format',()=>{
  const cards=['Malentendu','Sincérité','Plaisir','Retour','Patience'].map(name=>decks.amour.find(c=>c.name===name));
  assert.ok(cards.every(Boolean));
  for(const oracle of Object.keys(decks))for(const domain of ['Sentimental','Relationnel','Professionnel / projet','Général / spirituel'])for(const lang of ['fr','en'])for(const count of [1,2,3,4,5,7])for(const card of cards){
    const draw=Array(count).fill(card);
    Object.assign(state,{oracle,domain,lang,question:'',draw,tarotReversed:[]});
    const body=prose(window.CR_UNIVERSAL_FLUID_STORY(draw));
    const expected=lang==='fr'?{'Malentendu':/compris/,'Sincérité':/authentiques/,'Plaisir':/plaisir|agréables/,'Retour':/réapparition|reprise/,'Patience':/progression lente/}:{'Malentendu':/understood/,'Sincérité':/honest/,'Plaisir':/enjoy/,'Retour':/reappearance|return/,'Patience':/slow progress/};
    assert.match(body,expected[card.name]);
    assert.doesNotMatch(body,/prise de conscience|déséquilibre encore non résolu|configuration encore/);
  }
  Object.assign(state,{oracle:'amour',domain:'Sentimental',lang:'fr',question:'Privilégier une nouvelle rencontre ou attendre une évolution ?',draw:cards,tarotReversed:[]});
  const body=prose(window.CR_UNIVERSAL_FLUID_STORY(cards));
  assert.match(body,/origine.*compris/);assert.match(body,/point à résoudre.*authentiques/);
  assert.match(body,/appuyer.*sensualité/);assert.match(body,/suite.*réapparition/);
  assert.match(body,/ensemble.*progression lente/);assert.doesNotMatch(body,/garantit.*retour de/);
});
