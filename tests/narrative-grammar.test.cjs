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
test('Triangle retains its three poles in every position, domain, language and spread size',()=>{
  const triangle=decks.amour.find(c=>c.name==='Triangle');
  assert.ok(triangle);
  for(const oracle of Object.keys(decks))for(const domain of ['Sentimental','Relations','Professionnelle / Projet','Général / spirituel'])for(const lang of ['fr','en'])for(const n of [1,2,3,4,5,7]){
    const cards=Array(n).fill(decks.amour.find(c=>c.name==='Amitié'));
    cards[n-1]=triangle;
    Object.assign(state,{oracle,domain,lang,draw:cards,tarotReversed:[]});
    const text=prose(window.CR_UNIVERSAL_FLUID_STORY(cards));
    assert.match(text,lang==='fr'?/trois pôles|trois-pôles|à trois pôles/:/three competing poles/);
    assert.match(window.CR_UNIVERSAL_ROLE_SUMMARY(triangle,'outcome',lang==='en'),lang==='fr'?/trois pôles/:/three competing poles/);
    assert.doesNotMatch(text,/\bTriangle\b/);
    assertNarrativeCleanliness(text,cards);
  }
  const cards=['Amitié','Attirance réciproque','Triangle'].map(name=>decks.amour.find(c=>c.name===name));
  Object.assign(state,{oracle:'amour',domain:'Sentimental',lang:'fr',question:'KINYA',draw:cards});
  const text=prose(window.CR_UNIVERSAL_FLUID_STORY(cards));
  assert.match(text,/lien amical/);assert.match(text,/désir qui circulent des deux côtés/);
  assert.match(text,/relation parallèle/);assert.match(text,/ne permet pas d’affirmer/);
  for(let i=0;i<3;i++){
    state.draw=cards.map((c,j)=>j===i?triangle:decks.amour.find(c=>c.name==='Amitié'));
    assert.match(prose(window.CR_UNIVERSAL_FLUID_STORY(state.draw)),/trois pôles|autre personne/);
  }
});
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
    assertNarrativeCleanliness(text,state.draw);
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
    assertNarrativeCleanliness(text,state.draw);
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
function assertNarrativeCleanliness(text,cards){
  // Source-grounded paraphrases may retain a useful clause. Do not delete it
  // merely because it overlaps the catalogue: that loses semantic coverage.
  assert.doesNotMatch(text,/Sur le plan général,|Dans le cadre relationnel,|@ |undefined/);
}

test('friendship as the final card remains explicitly friendship, not collaboration',()=>{
  const cards=['Liberté','Union','Seconde chance','Karma','Amitié'].map(name=>decks.amour.find(c=>c.name===name));
  assert.ok(cards.every(Boolean));
  Object.assign(state,{oracle:'amour',domain:'Sentimental',lang:'fr',question:'Mon avenir amoureux ?',draw:cards,tarotReversed:[]});
  const body=prose(window.CR_UNIVERSAL_FLUID_STORY(cards));
  assert.match(body,/amitié au premier plan/);assert.match(body,/pas encore une promesse de couple/);
  assert.match(body,/ancien schéma relationnel/);assert.match(body,/engagement assumé/);
  assert.doesNotMatch(body,/collaboration effective|comment chacun peut contribuer/);
  assertNarrativeCleanliness(body,cards);
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
    assertNarrativeCleanliness(body,cards);
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
  assertNarrativeCleanliness(body,cards);
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
  assertNarrativeCleanliness(body,cards);
});
test('every real card, deck, domain, language and supported format avoids catalogue boilerplate',()=>{
  assert.equal(decks.tarot.length,78);
  let count=0;
  for(const [oracle,deck] of Object.entries(decks))for(const domain of ['Sentimental','Relationnel','Professionnel / projet','Général / spirituel'])for(const lang of ['fr','en'])for(const n of [1,3,5])for(let i=0;i<deck.length;i++){
    Object.assign(state,{oracle,domain,lang,question:'Quel chemin choisir ?',draw:Array.from({length:n},(_,j)=>deck[(i+j)%deck.length]),tarotReversed:Array(n).fill(false)});
    const body=prose(window.CR_UNIVERSAL_FLUID_STORY(state.draw));
    assert.ok(body.length>45,`${oracle} ${domain} ${lang} ${n} ${i}`);
    assertNarrativeCleanliness(body,state.draw);
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
    assertNarrativeCleanliness(reverse,state.draw);
    const summary=window.CR_UNIVERSAL_ROLE_SUMMARY(card,n===1?'outcome':'origin',lang==='en');
    assert.ok(summary.length>20);
    assertNarrativeCleanliness(summary,[card]);
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
  assert.doesNotMatch(body,/Kinya/);assertNarrativeCleanliness(body,state.draw);
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
    assertNarrativeCleanliness(prose(html),state.draw);
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

test('reported three-card readings retain the disappointment, potential, reversals and choice',()=>{
  const find=(deck,name)=>{const card=deck.find(c=>c.name===name);assert.ok(card,name);return card;};
  const cards=['Complexité','Échec','Potentiel'].map(name=>find(decks.cristariva,name));
  Object.assign(state,{oracle:'cristariva',domain:'Général / spirituel',lang:'fr',question:'Le message de mes guides',draw:cards,tarotReversed:[]});
  let body=prose(window.CR_UNIVERSAL_FLUID_STORY(cards));
  assert.match(body,/plusieurs/i);assert.match(body,/décevant|déception|échec/);assert.match(body,/grandir|ressources|possibilités/);
  assert.doesNotMatch(body,/Au départ|configuration encore|changement de cadre/);
  const tarot=['Tempérance','Dix de Épées','L’Amoureux'].map(name=>find(decks.tarot,name));
  Object.assign(state,{oracle:'tarot',domain:'Relations',draw:tarot,tarotReversed:[true,true,false]});
  body=prose(window.CR_UNIVERSAL_FLUID_STORY(tarot));
  assert.match(body,/excès|mesuré|ajustements/);assert.match(body,/fin pénible|épuisement|tourner la page/);assert.match(body,/choix|décision/);
  assert.doesNotMatch(body,/Au départ|Un réajustement est nécessaire|configuration encore/);
});

test('every reversal keeps its meaning in every position rather than classifying keywords',()=>{
  for(const card of decks.tarot)for(const lang of ['fr','en'])for(const domain of ['Relations','Professionnel / projet','Général / spirituel'])for(const role of ['origin','obstacle','resource','evolution','outcome']){
    Object.assign(state,{oracle:'tarot',lang,domain,draw:[card],tarotReversed:[true]});
    const summary=window.CR_UNIVERSAL_ROLE_SUMMARY(card,role,lang==='en');
    // The final implication (after the semicolon) must survive as well as the
    // difficulty. It contains the practical response unique to this reversal.
    const raw=window.CR_TAROT_REVERSED[card.id][lang];
    const action=raw.split(';')[1]||raw;
    const words=clean(action).split(' ').filter(w=>w.length>5);
    assert.ok(words.some(w=>clean(summary).includes(w)),`${card.name} ${lang} ${domain} ${role}: ${summary}`);
    assert.doesNotMatch(summary,/Un réajustement est nécessaire|This calls for an adjustment/);
  }
});

test('Kinya return: reversed initiative, present opening and final pause stay distinct',()=>{
 const cards=[33,20,54].map(id=>decks.tarot.find(c=>c.id===id));
 assert.ok(cards.every(Boolean));
 Object.assign(state,{oracle:'tarot',domain:'Sentimental',lang:'fr',question:'Le retour de kinya',draw:cards,tarotReversed:[true,false,false]});
 const body=prose(window.CR_UNIVERSAL_FLUID_STORY(cards));
 assert.match(body,/rapprochement.*constance/);
 assert.match(body,/échange plus chaleureux et plus clair/);
 assert.match(body,/pause.*repos.*silence/);
 assert.match(body,/ni un retour immédiat ni une reprise durable/);
 assert.doesNotMatch(body,/idée|promise|Dans le passé|Aujourd’hui|Pour l’avenir|joie partagée|confiance naissante/);
 for(const role of ['origin','obstacle','resource','evolution','outcome']){
  assert.match(window.CR_UNIVERSAL_ROLE_SUMMARY(cards[0],role,false),/rapprochement.*constance/);
 }
 state.tarotReversed=[false,false,false];
 assert.notEqual(prose(window.CR_UNIVERSAL_FLUID_STORY(cards)),body);
 state.tarotReversed=[true,false,true];
 assert.doesNotMatch(prose(window.CR_UNIVERSAL_FLUID_STORY(cards)),/ni un retour immédiat ni une reprise durable/);
 Object.assign(state,{domain:'Professionnelle / Projet',tarotReversed:[true,false,false]});
 assert.doesNotMatch(prose(window.CR_UNIVERSAL_FLUID_STORY(cards)),/Un élan de rapprochement|Concernant le retour/);
});
