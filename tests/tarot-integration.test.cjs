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
    return Promise.resolve(fs.readFileSync(path.join(root, decodeURIComponent(u.pathname).replace(/^\/cristariva\//, ''))));
  }
}
let dom, w, state, cards;
const errors = [];
before(async () => {
  const console = new VirtualConsole();
  console.on('jsdomError', e => errors.push(e.message));
  console.on('error', (...args) => errors.push(args.map(String).join(' ')));
  dom = new JSDOM(fs.readFileSync(path.join(root, 'index.html'), 'utf8'), {
    url:'https://cristariva.test/cristariva/', runScripts:'dangerously', resources:new LocalResources(), virtualConsole:console,
    beforeParse(window) {
      window.HTMLElement.prototype.scrollIntoView = () => {};
      window.HTMLDialogElement.prototype.showModal = function() {this.open = true;};
      window.HTMLDialogElement.prototype.close = function() {this.open = false;};
    }
  });
  w = dom.window;
  await new Promise(resolve => w.addEventListener('load', resolve, {once:true}));
  for (let attempt = 0; attempt < 100 && !w.__CRISTARIVA_TAROT_READY__; attempt++) {
    await new Promise(resolve => setTimeout(resolve, 20));
  }
  assert.equal(w.__CRISTARIVA_TAROT_READY__, true, 'real async loader completes');
  state = w.eval('state'); cards = w.TAROT_DATA.main;
});
after(() => dom?.window.close());
function domain(value) {
  const select = w.document.querySelector('#domain');
  select.value = value;
  select.dispatchEvent(new w.Event('change', {bubbles:true}));
}

test('the live loader exposes all 32 cards with preserved original identities', () => {
  assert.deepEqual(Array.from(cards, c => c.id), Array.from({length:32}, (_,i) => i+1));
  assert.equal(cards[0].name, 'Le Mat');
  assert.equal(cards[21].name, 'Le Monde');
  assert.equal(cards[22].name, 'Le Passage Secret');
  assert.equal(cards[31].name, 'Le Retour');
  assert.equal(w.document.querySelectorAll('[data-tarot-card-id]').length, 32);
  for (const c of cards) {
    assert.equal(c.oracle, 'tarot');
    const image = path.join(root, c.image.split('?')[0]);
    assert.ok(fs.existsSync(image), c.image);
    assert.equal(fs.readFileSync(image).toString('ascii', 8, 12), 'WEBP');
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

test('one, three and five card draws use Tarot cards and keep complementary readings', () => {
  domain('Tarot divinatoire');
  w.document.querySelector('#question').value = 'Quelle évolution pour mon projet ?';
  for (const count of [1,3,5]) {
    state.format = String(count);
    w.document.querySelector('#drawBtn').click();
    assert.equal(state.draw.length, count);
    assert.equal(new Set(state.draw.map(c => c.id)).size, count);
    assert.ok(state.draw.every(c => c.oracle === 'tarot'));
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

test('every catalogue card opens its matching bilingual definition and picture', () => {
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

test('switching back to other decks keeps their cards and clears complementary draws', () => {
  state.lang = 'fr'; w.applyLanguage();
  for (const value of ['Sentimental','Relations','Professionnelle / Projet','Général / spirituel']) {
    domain(value);
    assert.equal(state.relation, null); assert.equal(state.date, null);
    w.document.querySelector('#drawBtn').click();
    assert.ok(state.draw.every(c => c.oracle !== 'tarot'));
    if (value === 'Sentimental') assert.ok(state.draw.every(c => c.oracle === 'amour'));
  }
  assert.deepEqual(errors, []);
});
