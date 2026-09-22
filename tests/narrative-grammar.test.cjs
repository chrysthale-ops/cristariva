// Run the actual page and its successive narrative wrappers, including async loaders.
const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM,ResourceLoader,VirtualConsole}=require('jsdom');
const root=path.resolve(process.env.CRISTARIVA_TEST_ROOT||path.join(__dirname,'..'));
class LocalResources extends ResourceLoader {
  fetch(url){
    const u=new URL(url);
    if(u.origin!=='https://cristariva.test')return null;
    const file=path.join(root,decodeURIComponent(u.pathname).replace(/^\/cristariva\//,''));
    return Promise.resolve(fs.readFileSync(file));
  }
}
let dom,w,state,data,love;
const errors=[];
before(async()=>{
  const console=new VirtualConsole();
  console.on('jsdomError',e=>errors.push(e.message));
  console.on('error',(...a)=>errors.push(a.map(String).join(' ')));
  dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{
    url:'https://cristariva.test/cristariva/',runScripts:'dangerously',resources:new LocalResources(),virtualConsole:console,
    beforeParse(window){window.HTMLElement.prototype.scrollIntoView=()=>{};}
  });
  w=dom.window;
  await new Promise(r=>w.addEventListener('load',r,{once:true}));
  await w.__CRISTARIVA_LOVE_DIRECT_BOOTSTRAP__;
  await new Promise(r=>setTimeout(r,300));
  state=w.eval('state');data=w.eval('DATA');love=w.AMOUR_DATA;
});
after(()=>dom?.window.close());
function story(cards,domain='Relations',question='Une question ouverte ?',lang='fr'){
  Object.assign(state,{domain,question,lang,draw:cards});
  const tpl=w.document.createElement('template');tpl.innerHTML=w.storyInterpretation(cards);
  return tpl.content;
}
function prose(fragment){return fragment.querySelector('.story-continuous').textContent;}
const bare=/(?:^|[.!?;:]\s+|(?:Au départ|Aujourd’hui|À partir de là|Pourtant|Cependant|Puis|Enfin),\s+)(?:(?:ne\s+|n[’'])\s*)?(?:alerte|avertit|peut|doit|fait|place|positionne|conduit|représente|symbolise|exprime|valorise|encourage|invite|demande|conseille|apprend|enseigne|relie|renvoie|situe|accompagne|interroge|confronte|indique|montre|révèle|signale|annonce|ouvre|signifie|décrit|rappelle|souligne|favorise|parle|confirme|traduit)\s/iu;
const inverted=/(?:^|[.!?;:]\s+)(?:(?:Puis|Enfin|Ensuite|Peu à peu|À ce stade|Plus loin),?\s+)?(?:s[’']ouvre|se dessine|se profile|apparaît)\s/iu;
function complete(text,label){assert.doesNotMatch(text,bare,label);assert.doesNotMatch(text,inverted,label);assert.doesNotMatch(text,/évolution où place|va vers (?:peut|place)|de identifier|de accepter|la situation s[’']ouvre un cycle/iu,label);}

test('the reported three-card reading keeps complete clauses and their order',()=>{
  const cards=[84,76,56].map(id=>data.main.find(c=>c.id===id));
  const result=story(cards,'Relations','Ma prochaine rencontre sexuelle');
  const text=prose(result);
  assert.match(text,/Au départ, la situation alerte sur une influence qui contourne le consentement/);
  assert.match(text,/Aujourd’hui, la situation peut indiquer un nouveau départ/);
  assert.match(text,/À partir de là, la situation peut indiquer reprise du lien/);
  assert.ok(text.indexOf('consentement')<text.indexOf('nouveau départ'));
  assert.ok(text.indexOf('nouveau départ')<text.indexOf('reprise du lien'));
  assert.equal(result.querySelector('.story-reading').dataset.storyEngine,'5.20');
  complete(text);
});

test('the three-card arc never strips a subject, predicate, or subordinate clause',()=>{
  const cards=[
    {name:'Alpha',reading_relationnel:'Représente un schéma ancien qui influence encore les choix.'},
    {name:'Bêta',reading_relationnel:'Indique qu’une décision reste possible.'},
    {name:'Gamma',reading_relationnel:'Ouvre une possibilité qui reste fragile.'}
  ];
  const text=prose(story(cards));
  assert.match(text,/Au départ, la situation représente un schéma ancien qui influence encore les choix\./);
  assert.match(text,/Aujourd’hui, la situation indique qu’une décision reste possible\./);
  assert.match(text,/À partir de là, la suite ouvre une possibilité qui reste fragile\./);
  complete(text);
});

test('the reported love reading starts every sentence with an explicit subject',()=>{
  const cards=[1,30,29,56,20].map(id=>love.main.find(c=>c.id===id));
  const result=story(cards,'Sentimental','Meilleur créneau pour avancer dans le domaine sentimental');
  const text=prose(result);
  complete(text);
  assert.match(text,/L’évolution annonce l’ouverture d’un nouveau lien/);
  assert.match(text,/Le mouvement fait apparaître une période de difficulté/);
  assert.match(text,/Cette dynamique signale une situation organisée autour de trois pôles/);
  assert.match(text,/Cette étape met en lumière une proximité profonde/);
  assert.match(text,/L’évolution ouvre un cycle sentimental neuf/);
  assert.equal(result.querySelector('.story-reading').dataset.storyEngine,'5.20');
});

test('the correction covers every card at every position in 1-, 3- and 5-card readings',t=>{
  let count=0;
  for(const [deck,domains] of [[data,['Relations','Professionnelle / Projet','Général / spirituel']],[love,['Sentimental']]]){
    for(const domain of domains)for(const n of [1,3,5])for(const card of deck.main)for(let slot=0;slot<n;slot++){
      const cards=Array.from({length:n},(_,i)=>deck.main[(i+10)%deck.main.length]);cards[slot]=card;
      const text=prose(story(cards,domain));
      complete(text,`${domain} / ${n} / position ${slot+1} / ${card.id} ${card.name}`);
      count++;
    }
  }
  assert.equal(count,(95*3+60)*9);
  t.diagnostic(`${count} generated readings checked`);
});

test('special question routes and short questions keep subjects in every format',()=>{
  for(const question of ['Ma prochaine rencontre sexuelle','Mon prochain crush','Mes blessures','Mes désirs','La prochaine étape de ma vie','Mon projet']){
    for(const n of [1,3,5])for(const deck of [data,love]){
      const cards=[84,76,56,28,48].slice(0,n).map((id,i)=>deck.main.find(c=>c.id===id)||deck.main[i]);
      const result=story(cards,deck===love?'Sentimental':'Relations',question);
      complete(prose(result),`${question} / ${n}`);
      assert.ok(result.querySelector('.reading-question').textContent.includes(question));
    }
  }
});

test('sentence completion handles punctuation, prefixes and negation without changing complete prose',()=>{
  for(const prefix of ['', 'Au départ, ', 'Aujourd’hui, ', 'À partir de là, ', 'Cependant, ', 'Pourtant, ', 'Puis, ']){
    for(const clause of ['alerte sur une influence.','peut révéler une tension.','ne peut pas imposer un choix.','n’invite pas à agir.','conseille de identifier le blocage.']){
      const out=w.cr51NarrativizeFrenchStart(prefix+clause);
      complete(out);
      assert.equal(w.cr51NarrativizeFrenchStart(out),out);
    }
  }
  assert.equal(w.cr51NarrativizeFrenchStart('Une limite apparaît ; peut être respectée.'),'Une limite apparaît ; la situation peut être respectée.');
  assert.equal(w.cr51NarrativizeFrenchStart('Un indice ressort : alerte sur une influence.'),'Un indice ressort : la situation alerte sur une influence.');
  assert.equal(w.cr51NarrativizeFrenchStart('La confiance s’installe. Une personne peut hésiter.'),'La confiance s’installe. Une personne peut hésiter.');
  assert.equal(w.cr51NarrativizeFrenchStart('La période couvre 1.5 mois.'),'La période couvre 1.5 mois.');
  assert.equal(w.cr51NarrativizeFrenchStart('Confronte à une décision.'),'La situation vous confronte à une décision.');
  assert.equal(w.cr51NarrativizeFrenchStart('Puis s’ouvre un cycle sentimental neuf.'),'Cette évolution ouvre un cycle sentimental neuf.');
  assert.equal(w.cr51NarrativizeFrenchStart('Se dessine une proximité profonde.'),'La situation fait apparaître une proximité profonde.');
  assert.equal(w.cr51NarrativizeFrenchStart('À ce stade apparaît une difficulté.'),'La situation fait apparaître une difficulté.');
});

test('card names inside words and existing subjects are preserved',()=>{
  assert.equal(w.cr51StripLeadingCardName('La confiance grandit.',{name:'Confiance'}),'La confiance grandit.');
  assert.equal(w.cr51StripLeadingCardName('La confiance, une fois acquise, renforce le lien.',{name:'Confiance'}),'La confiance, une fois acquise, renforce le lien.');
  assert.equal(w.cr51StripLeadingCardName('Retournement possible.',{name:'Retour'}),'Retournement possible.');
  assert.equal(w.cr51StripLeadingCardName('Retour : Peut rouvrir le dialogue.',{name:'Retour'}),'Peut rouvrir le dialogue.');
  assert.equal(w.cr51StripLeadingCardName('Retour peut rouvrir le dialogue.',{name:'Retour'}),'peut rouvrir le dialogue.');
  assert.equal(w.cr51StripLeadingCardName('Le simple retour du passé se précise.',{name:'Retour'}),'Le simple retour du passé se précise.');
});

test('question text, HTML entities and emphasis survive every polishing pass',()=>{
  const question='Ma vie alors & <demain>';
  const result=story([data.main[0]],'Relations',question);
  assert.ok(result.querySelector('.reading-question').textContent.includes(question));
  assert.equal(result.querySelector('.story-continuous b').textContent,'votre vie alors & <demain>');
  assert.equal(result.querySelector('demain'),null);
  const c={name:'Test',reading_relationnel:"Peut indiquer 'oui' & 'non' selon les circonstances."};
  const text=prose(story([c,c,c]));
  assert.match(text,/'oui' & 'non'/);
  assert.doesNotMatch(text,/&#39|&amp/);
});

test('French corrections do not alter English clauses and complementary cards remain usable',()=>{
  // Some legacy translations already contain French: use explicit English fixtures
  // to check that this grammar change never adds a French subject or transition.
  for(const n of [1,3,5]){
    const cards=Array.from({length:n},(_,i)=>({name:`Fixture ${i}`,en:{name:`Fixture ${i}`,reading_relationnel:'A clear conversation can open a new possibility.'}}));
    const result=story(cards,'Relations','My next encounter','en');
    assert.match(result.querySelector('h3').textContent,/The story told by your cards/);
    assert.doesNotMatch(prose(result),/Au départ|Aujourd’hui|À partir de là|La situation/);
  }
  state.lang='fr';
  for(const deck of [data,love])for(const group of ['relation','dating'])for(const card of deck[group]){
    const text=prose(story([card],deck===love?'Sentimental':'Relations'));
    complete(text,`${group} / ${card.id}`);
    assert.ok(w.cardHTML(card,group).includes('card'));
  }
});

test('actual draw buttons use the final correction for both oracles and all formats',()=>{
  state.lang='fr';
  const select=w.document.querySelector('#domain');
  for(const domain of ['Relations','Professionnelle / Projet','Général / spirituel','Sentimental'])for(const n of [1,3,5]){
    select.value=domain;select.dispatchEvent(new w.Event('change'));
    state.format=n;w.document.querySelector('#question').value='Ma prochaine rencontre';
    w.document.querySelector('#drawBtn').click();
    assert.equal(state.draw.length,n);
    const el=w.document.querySelector('#reading .story-reading');
    assert.equal(el.dataset.storyEngine,'5.20');
    complete(el.querySelector('.story-continuous').textContent);
    if(domain==='Sentimental')assert.ok(state.draw.every(c=>c.oracle==='amour'));
    w.document.querySelector('#relationBtn').click();assert.ok(state.relation);
    w.document.querySelector('#dateBtn').click();assert.ok(state.date);
  }
  assert.deepEqual(errors,[]);
});

test('the PWA update references exist and request the fixed scripts',()=>{
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  const sw=fs.readFileSync(path.join(root,'service-worker.js'),'utf8');
  assert.match(html,/service-worker\.js\?v=[\w.-]+/);
  assert.match(sw,/const CACHE_NAME='cristariva-[^']+'/);
  for(const script of ['story-fluid-v5.1.js','question-project-story-v5.5.js','relation-astrology.js']){
    assert.ok(html.includes(`${script}?v=`));assert.ok(sw.includes(`'./${script}'`));
  }
  assert.ok(sw.includes(`'./question-context-story-v5.2.js'`));
  const shell=sw.match(/const SHELL=([\s\S]*?);/)[1];
  for(const [,url] of shell.matchAll(/['"]([^'"]+)['"]/g))assert.ok(fs.existsSync(path.join(root,url.split('?')[0])),url);
});
