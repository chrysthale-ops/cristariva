const {test, before, after} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {JSDOM, ResourceLoader, VirtualConsole} = require('jsdom');
const root = path.join(__dirname, '..');

function localPath(url) {
  const u = new URL(url, 'https://cristariva.test/cristariva/');
  if (u.origin !== 'https://cristariva.test') return null;
  return path.join(root, decodeURIComponent(u.pathname).replace(/^\/cristariva\//, ''));
}
class LocalResources extends ResourceLoader {
  fetch(url) {
    const file = localPath(url);
    if (!file || !fs.existsSync(file)) return null;
    return Promise.resolve(fs.readFileSync(file));
  }
}
let dom, w, state, cards;
const errors = [];

before(async () => {
  const console = new VirtualConsole();
  console.on('jsdomError', e => {
    /* jsdom ne dessine pas réellement les canvas : les erreurs de rendu sont
       neutralisées ci-dessous, toute autre erreur reste significative. */
    if (!/canvas/i.test(String(e.message || e))) errors.push(e.message);
  });
  console.on('error', (...args) => errors.push(args.map(String).join(' ')));
  dom = new JSDOM(fs.readFileSync(path.join(root, 'index.html'), 'utf8'), {
    url:'https://cristariva.test/cristariva/', runScripts:'dangerously', resources:new LocalResources(), virtualConsole:console,
    beforeParse(window) {
      window.HTMLElement.prototype.scrollIntoView = () => {};
      window.HTMLDialogElement.prototype.showModal = function() {this.open = true;};
      window.HTMLDialogElement.prototype.close = function() {this.open = false;};
      window.fetch = async input => {
        const file = localPath(String(input));
        if (!file || !fs.existsSync(file)) return {ok:false, status:404, text:async()=>''};
        return {ok:true, status:200, text:async()=>fs.readFileSync(file, 'utf8')};
      };
      window.URL.createObjectURL = () => 'blob:cristariva-test';
      window.URL.revokeObjectURL = () => {};
      window.Image = class {
        set src(value) { this._src=value; queueMicrotask(()=>this.onload?.()); }
        get src() { return this._src; }
      };
      if (window.HTMLCanvasElement) {
        window.HTMLCanvasElement.prototype.getContext = () => ({clearRect(){}, drawImage(){}});
        window.HTMLCanvasElement.prototype.toDataURL = () => 'data:image/webp;base64,UklGRg==';
      }
    }
  });
  w = dom.window;
  await new Promise(resolve => w.addEventListener('load', resolve, {once:true}));
  for (let attempt = 0; attempt < 250; attempt++) {
    if (w.TAROT_DATA?.main?.length === 78 && String(w.CR_TAROT_INTEGRATION_VERSION||'').includes('tarot78')) break;
    await new Promise(resolve => setTimeout(resolve, 20));
  }
  assert.equal(w.TAROT_DATA?.main?.length, 78, 'the final Tarot 78 loader completes');
  assert.match(String(w.CR_TAROT_INTEGRATION_VERSION||''), /tarot78/, 'the 78-card integration is active');
  state = w.eval('state'); cards = w.TAROT_DATA.main;
});
after(() => dom?.window.close());

function domain(value) {
  const select = w.document.querySelector('#domain');
  select.value = value;
  select.dispatchEvent(new w.Event('change', {bubbles:true}));
}
function oracle(value) {
  const select = w.document.querySelector('#oracleChoice');
  select.value = value;
  select.dispatchEvent(new w.Event('change', {bubbles:true}));
}
async function waitForLove() {
  for (let attempt=0; attempt<100 && !w.AMOUR_DATA; attempt++) await new Promise(resolve=>setTimeout(resolve,20));
  assert.ok(w.AMOUR_DATA, 'Oracle sentimental loaded');
}

test('the final live loader exposes all 78 Tarot cards with stable identities', () => {
  assert.deepEqual(Array.from(cards, c => c.id), Array.from({length:78}, (_,i) => i+1));
  assert.equal(cards[0].name, 'Le Mat');
  assert.equal(cards[21].name, 'Le Monde');
  assert.equal(cards[22].name, 'As de Bâtons');
  assert.equal(cards[77].name, 'Roi de Deniers');
  assert.equal(cards.filter(c => c.arcana === 'minor').length, 56);
  assert.equal(w.CR_TAROT_MINOR_COUNT, 56);
  assert.equal(w.document.querySelectorAll('[data-tarot-card-id]').length, 78);
  for (const c of cards) {
    assert.equal(c.oracle, 'tarot');
    if (c.id <= 22) {
      const image = path.join(root, c.image.split('?')[0]);
      assert.ok(fs.existsSync(image), c.image);
      assert.equal(fs.readFileSync(image).toString('ascii', 8, 12), 'WEBP');
    } else {
      assert.match(c.image, /^data:image\/webp;base64,/, `minor ${c.id} has a generated image`);
    }
    for (const local of [c,c.en]) for (const key of ['name','definition','message','reading_relationnel','reading_professionnel','reading_spirituel']) {
      assert.ok(local[key]?.length > 2, `${c.id}: ${key}`);
      assert.doesNotMatch(local[key], /\uFFFD/);
    }
  }
});

test('Tarot titles survive the grand oracle title pass and language changes', () => {
  state.draw = cards;
  w.cr363ApplyTitles();
  state.draw = cards.slice(0,3);
  state.format = '3';
  for (const lang of ['fr','en']) {
    state.lang = lang; w.applyLanguage();
    for (const card of cards) {
      const identity = w.CR_TAROT_IDENTITIES[card.id];
      assert.equal(card.name, identity.name);
      assert.equal(w.cardName(card), lang === 'en' ? identity.enName : identity.name);
      assert.equal(w.cardImage(card), identity.image);
    }
  }
  state.lang = 'fr'; w.applyLanguage();
});

test('one, three and five card draws use Tarot 78 and keep complementary readings', () => {
  domain('Professionnelle / Projet'); oracle('tarot');
  w.document.querySelector('#question').value = 'Quelle évolution pour mon projet ?';
  for (const count of [1,3,5]) {
    state.format = String(count);
    w.document.querySelector('#drawBtn').click();
    assert.equal(state.draw.length, count);
    assert.equal(new Set(state.draw.map(c => c.id)).size, count);
    assert.ok(state.draw.every(c => c.oracle === 'tarot'));
    assert.ok(state.draw.every(c => c.id >= 1 && c.id <= 78));
    assert.equal(w.document.querySelectorAll('#drawCards img').length, count);
    assert.ok(w.document.querySelector('#reading').textContent.includes('Quelle évolution pour mon projet'));
    assert.doesNotMatch(w.document.querySelector('#reading').textContent, /undefined|\[object Object\]/);
    for (const c of state.draw) assert.ok(w.preciseReading(c, 'Professionnelle / Projet', false).length > 20);
    w.document.querySelector('#relationBtn').click();
    w.document.querySelector('#dateBtn').click();
    assert.ok(state.relation && state.date);
    assert.ok(w.document.querySelector('#relationResult img'));
    assert.ok(w.document.querySelector('#dateResult img'));
    w.renderSynthesis();
    assert.ok(w.document.querySelector('#synthesis').textContent.length > 100);
  }
});

test('every Tarot catalogue card opens its matching bilingual definition and picture', () => {
  for (const lang of ['fr','en']) {
    state.lang = lang; w.applyLanguage();
    for (const card of cards) {
      w.document.querySelector(`[data-tarot-card-id="${card.id}"]`).click();
      const local = lang === 'en' ? card.en : card;
      assert.equal(w.document.querySelector('#cardDialogTitle').textContent, local.name);
      assert.ok(w.document.querySelector('#cardDialogBody').textContent.includes(local.definition));
      assert.equal(w.document.querySelector('#cardDialogBody img').getAttribute('src'), card.image);
      w.document.querySelector('#cardDialog').close();
    }
  }
});

test('new domain labels are visible while legacy technical values remain compatible', async () => {
  state.lang='fr'; w.applyLanguage();
  const select=w.document.querySelector('#domain');
  const expected=[
    ['Sentimental','Sentimental'],
    ['Relations','Relationnel'],
    ['Professionnelle / Projet','Professionnel / projet'],
    ['Général / spirituel','Général / spirituel']
  ];
  assert.deepEqual(Array.from(select.options, o=>[o.value,o.textContent]), expected);
  const body=w.document.querySelector('#cardDialogBody');
  body.innerHTML='<div class="card-detail-row"><h4>Lecture — Relations</h4></div><div class="card-detail-row"><h4>Lecture — Professionnelle / Projet</h4></div>';
  await new Promise(resolve=>setTimeout(resolve,0));
  assert.deepEqual(Array.from(body.querySelectorAll('h4'), n=>n.textContent), ['Lecture — Relationnel','Lecture — Professionnel / projet']);
});

test('all 9 allowed domain × oracle combinations keep the previous reading functions', async () => {
  state.lang='fr'; w.applyLanguage();
  const allowed=[
    ['Sentimental','cristariva'],
    ['Sentimental','amour'],
    ['Sentimental','tarot'],
    ['Relations','cristariva'],
    ['Relations','tarot'],
    ['Professionnelle / Projet','cristariva'],
    ['Professionnelle / Projet','tarot'],
    ['Général / spirituel','cristariva'],
    ['Général / spirituel','tarot']
  ];
  w.document.querySelector('#question').value='Test de non-régression';
  for (const [d,o] of allowed) {
    domain(d);
    const loveOption=w.document.querySelector('#oracleChoice option[value="amour"]');
    assert.equal(loveOption.disabled, d!=='Sentimental', `${d}: love availability`);
    oracle(o);
    if (o==='amour') await waitForLove();
    assert.equal(state.domain,d);
    assert.equal(state.oracle,o);
    assert.equal(state.draw.length,0,'switching selector clears the previous draw');
    assert.equal(state.relation,null);
    assert.equal(state.date,null);
    state.format='1';
    w.document.querySelector('#drawBtn').click();
    assert.equal(state.draw.length,1,`${d} × ${o}: main draw`);
    if (o==='tarot') assert.ok(state.draw.every(c=>c.oracle==='tarot'));
    if (o==='amour') assert.ok(state.draw.every(c=>c.oracle==='amour'));
    if (o==='cristariva') assert.ok(state.draw.every(c=>c.oracle!=='tarot'&&c.oracle!=='amour'));
    assert.ok(w.document.querySelector('#reading').textContent.length>30,`${d} × ${o}: story`);
    w.document.querySelector('#relationBtn').click();
    w.document.querySelector('#dateBtn').click();
    assert.ok(state.relation && state.date,`${d} × ${o}: relation and timing`);
    w.renderSynthesis();
    assert.ok(w.document.querySelector('#synthesis').textContent.length>80,`${d} × ${o}: synthesis`);
  }
  assert.deepEqual(errors, []);
});
