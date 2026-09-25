const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {JSDOM, ResourceLoader, VirtualConsole} = require('jsdom');

const root = path.join(__dirname, '..');
const BASE = 'https://cristariva.test/cristariva/';
const PLACE = {
  name: 'Ville Test',
  admin1: 'Région Test',
  country: 'France',
  latitude: 48.58,
  longitude: 7.75,
  timezone: 'Europe/Paris'
};

function localPath(url) {
  const u = new URL(url, BASE);
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

function fakeResponse(body) {
  return {
    ok: true,
    status: 200,
    json: async () => body,
    text: async () => JSON.stringify(body)
  };
}

async function waitFor(check, message, timeout = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (check()) return;
    await new Promise(resolve => setTimeout(resolve, 20));
  }
  assert.fail(message);
}

function change(window, element) {
  element.dispatchEvent(new window.Event('change', {bubbles: true}));
}

function submit(window, form) {
  form.dispatchEvent(new window.Event('submit', {bubbles: true, cancelable: true}));
}

test('matrice complète Domaine × Oracle : tirage, Relation, Datation, astrologies et synthèse', async () => {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', error => {
    if (!/canvas/i.test(String(error.message || error))) errors.push(String(error.message || error));
  });
  virtualConsole.on('error', (...args) => errors.push(args.map(String).join(' ')));

  const dom = new JSDOM(fs.readFileSync(path.join(root, 'index.html'), 'utf8'), {
    url: BASE,
    runScripts: 'dangerously',
    resources: new LocalResources(),
    virtualConsole,
    beforeParse(window) {
      window.HTMLElement.prototype.scrollIntoView = () => {};
      window.HTMLDialogElement.prototype.showModal = function() { this.open = true; };
      window.HTMLDialogElement.prototype.close = function() { this.open = false; };
      window.URL.createObjectURL = () => 'blob:cristariva-test';
      window.URL.revokeObjectURL = () => {};
      window.Image = class {
        set src(value) { this._src = value; queueMicrotask(() => this.onload?.()); }
        get src() { return this._src; }
      };
      if (window.HTMLCanvasElement) {
        window.HTMLCanvasElement.prototype.getContext = () => ({clearRect(){}, drawImage(){}});
        window.HTMLCanvasElement.prototype.toDataURL = () => 'data:image/webp;base64,UklGRg==';
      }
      window.fetch = async input => {
        const url = String(input);
        if (url.startsWith('https://geocoding-api.open-meteo.com/')) {
          return fakeResponse({results: [PLACE]});
        }
        const file = localPath(url);
        if (!file || !fs.existsSync(file)) {
          return {ok: false, status: 404, json: async () => ({}), text: async () => ''};
        }
        return {
          ok: true,
          status: 200,
          json: async () => JSON.parse(fs.readFileSync(file, 'utf8')),
          text: async () => fs.readFileSync(file, 'utf8')
        };
      };
    }
  });

  const w = dom.window;
  try {
    await new Promise(resolve => w.addEventListener('load', resolve, {once: true}));
    await waitFor(
      () => w.TAROT_DATA?.main?.length === 78 &&
        String(w.CR_TAROT_INTEGRATION_VERSION || '').includes('tarot78'),
      'Le module Tarot 78 doit être chargé',
      10000
    );
    await waitFor(
      () => {
        try {
          return !!w.document.querySelector('#relationAstroForm') &&
            !!w.document.querySelector('#relationAstroEnabled');
        } catch {
          return false;
        }
      },
      'Le module d’astrologie relationnelle doit être chargé',
      10000
    );

    const state = w.eval('state');
    assert.ok(Object.prototype.hasOwnProperty.call(state, 'relationAstro'),
      'L’état de l’astrologie relationnelle doit être initialisé');
    state.lang = 'fr';
    w.applyLanguage();

    const domains = [
      'Sentimental',
      'Relations',
      'Professionnelle / Projet',
      'Général / spirituel'
    ];
    const oracles = ['cristariva', 'amour', 'tarot'];
    const matrix = domains.flatMap(domain => oracles.map(oracle => ({domain, oracle})));
    assert.equal(matrix.length, 12, 'la matrice doit couvrir les 12 scénarios possibles');

    const domainSelect = w.document.querySelector('#domain');
    const oracleSelect = w.document.querySelector('#oracleChoice');
    const loveOption = oracleSelect.querySelector('option[value="amour"]');
    const question = w.document.querySelector('#question');
    const relationBtn = w.document.querySelector('#relationBtn');
    const dateBtn = w.document.querySelector('#dateBtn');
    const drawBtn = w.document.querySelector('#drawBtn');
    const synthesisBtn = w.document.querySelector('#synthesisBtn');
    const synthesis = w.document.querySelector('#synthesis');

    for (const scenario of matrix) {
      const {domain, oracle} = scenario;
      const sentimental = domain === 'Sentimental';
      const expectedOracle = oracle === 'amour' && !sentimental ? 'cristariva' : oracle;
      const label = `${domain} × ${oracle}`;

      domainSelect.value = domain;
      change(w, domainSelect);
      assert.equal(loveOption.disabled, !sentimental, `${label} : disponibilité de l’Oracle sentimental`);

      oracleSelect.value = oracle;
      change(w, oracleSelect);
      if (oracle === 'amour' && sentimental) {
        await waitFor(() => !!w.AMOUR_DATA, `${label} : chargement Oracle sentimental`);
      }

      assert.equal(state.domain, domain, `${label} : domaine actif`);
      assert.equal(state.oracle, expectedOracle, `${label} : oracle effectif`);
      if (oracle === 'amour' && !sentimental) {
        assert.equal(oracleSelect.value, 'cristariva', `${label} : repli automatique vers Oracle CRISTARIVA`);
      }

      question.value = `Non-régression ${label}`;
      state.format = '3';
      drawBtn.click();
      assert.equal(state.draw.length, 3, `${label} : tirage principal`);
      assert.equal(new Set(state.draw.map(card => card.id)).size, 3, `${label} : cartes distinctes`);
      if (expectedOracle === 'tarot') assert.ok(state.draw.every(card => card.oracle === 'tarot'), `${label} : Tarot utilisé`);
      if (expectedOracle === 'amour') assert.ok(state.draw.every(card => card.oracle === 'amour'), `${label} : Oracle sentimental utilisé`);
      if (expectedOracle === 'cristariva') assert.ok(state.draw.every(card => card.oracle !== 'tarot' && card.oracle !== 'amour'), `${label} : Oracle CRISTARIVA utilisé`);
      assert.ok(w.document.querySelector('#reading').textContent.length > 40, `${label} : interprétation principale`);

      relationBtn.click();
      dateBtn.click();
      assert.ok(state.relation, `${label} : carte Relation`);
      assert.ok(state.date, `${label} : carte Datation`);
      assert.ok(w.document.querySelector('#relationResult img'), `${label} : illustration Relation`);
      assert.ok(w.document.querySelector('#dateResult img'), `${label} : illustration Datation`);

      state.astro = null;
      w.document.querySelector('#birthdate').value = '1990-01-15';
      w.document.querySelector('#birthtime').value = '12:00';
      w.document.querySelector('#birthplace').value = 'Ville Test';
      w.document.querySelector('#astroBtn').click();
      await waitFor(() => !!state.astro, `${label} : profil astrologique du consultant`);
      assert.equal(state.astro.birthTimezone, 'Europe/Paris', `${label} : fuseau natal consultant`);
      assert.ok(w.document.querySelector('#astroResult').textContent.length > 60, `${label} : rendu astrologique consultant`);

      const enabled = w.document.querySelector('#relationAstroEnabled');
      if (enabled.checked) {
        enabled.checked = false;
        change(w, enabled);
      }
      enabled.checked = true;
      change(w, enabled);
      w.document.querySelector('#relationBirthdate').value = '1992-06-10';
      w.document.querySelector('#relationBirthtime').value = '08:30';
      w.document.querySelector('#relationBirthplace').value = 'Ville Test';
      submit(w, w.document.querySelector('#relationAstroForm'));
      await waitFor(() => !!state.relationAstro, `${label} : profil astrologique relationnel`);
      assert.equal(state.relationAstro.birthTimezone, 'Europe/Paris', `${label} : fuseau natal relation`);
      assert.ok(w.document.querySelector('#relationAstroResult').textContent.length > 60, `${label} : rendu astrologique relationnel`);

      synthesis.classList.add('hidden');
      synthesis.innerHTML = '';
      synthesisBtn.click();
      assert.ok(!synthesis.classList.contains('hidden'), `${label} : synthèse affichée`);
      assert.ok(synthesis.textContent.length > 120, `${label} : synthèse renseignée`);
      assert.doesNotMatch(synthesis.textContent, /undefined|\[object Object\]/, `${label} : synthèse propre`);
      assert.ok(synthesis.querySelector('.cr-cross-analysis'), `${label} : analyses croisées astrologiques intégrées à la synthèse`);
    }

    assert.equal(matrix.filter(x => x.oracle === 'amour' && x.domain !== 'Sentimental').length, 3, 'les 3 scénarios Oracle sentimental hors Sentimental sont explicitement testés comme interdits');
    assert.deepEqual(errors, [], `aucune erreur JavaScript silencieuse : ${errors.join(' | ')}`);
  } finally {
    dom.window.close();
  }
});
