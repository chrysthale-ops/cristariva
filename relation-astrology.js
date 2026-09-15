/* Optional astrology for the person represented by the Relationship card.
   The natal and transit engines are shared; the consultant's state is never swapped.
   v1.1 adds two cross-analyses after the general synthesis when both birth charts exist. */
(function () {
  'use strict';
  const section = document.getElementById('relationAstroSection');
  if (!section || typeof cr3AstroMarkup !== 'function') return;
  const el = id => document.getElementById(id);
  const enabled = el('relationAstroEnabled');
  const form = el('relationAstroForm');
  const result = el('relationAstroResult');
  const suggestions = el('relationPlaceSuggestions');
  const fields = ['relationBirthdate', 'relationBirthtime', 'relationBirthplace'];
  let chosenPlace = null, revision = 0, searchRevision = 0, timer = null, busy = false;
  let boundRelation = null;
  state.relationAstro = null;
  const en = () => state.lang === 'en';
  const text = (fr, english) => en() ? english : fr;

  const crossStyle = document.createElement('style');
  crossStyle.textContent = `
    .cr-cross-analysis{margin-top:18px;padding:18px 20px;border:1px solid rgba(138,100,46,.22);border-radius:16px;background:rgba(255,255,255,.38)}
    .cr-cross-analysis h3{margin:.1rem 0 .8rem;font-family:Georgia,serif;font-size:1.18rem}
    .cr-cross-analysis h4{margin:1rem 0 .35rem;font-size:.98rem;color:var(--ink,#172033)}
    .cr-cross-analysis ul{margin:.35rem 0 .2rem 1.1rem;padding:0}
    .cr-cross-analysis li{margin:.52rem 0;line-height:1.58}
    .cr-cross-analysis .cr-cross-note{margin:.65rem 0 0;font-size:.88rem;color:#68717c;line-height:1.5}
    .cr-cross-analysis + .cr-cross-analysis{margin-top:12px}
  `;
  document.head.appendChild(crossStyle);

  // Only authored natal prose is converted, never the question, card labels or input.
  function thirdPerson(prose) {
    const verbs = {
      acceptez:'accepte', accordez:'accorde', adaptez:'adapte', agissez:'agit',
      aimez:'aime', analysez:'analyse', apportez:'apporte', apprenez:'apprend',
      appréciez:'apprécie', arrivez:'arrive', assumez:'assume', avancez:'avance',
      avez:'a', changez:'change', cherchez:'cherche', choisissez:'choisit',
      comprenez:'comprend', concentrez:'concentre', consolidez:'consolide',
      constatez:'constate', construisez:'construit', créez:'crée', donnez:'donne',
      faites:'fait', fonctionnez:'fonctionne', gagnez:'gagne', innovez:'innove',
      montrez:'montre', mobilisez:'mobilise', osez:'ose', passez:'passe', pensez:'pense',
      pesez:'pèse', pouvez:'peut', prenez:'prend', progressez:'progresse',
      recherchez:'recherche', ressentez:'ressent', réfléchissez:'réfléchit',
      réagissez:'réagit', révélez:'révèle', savez:'sait', sentez:'sent',
      souhaitez:'souhaite', structurez:'structure', tenez:'tient', transformez:'transforme',
      traversez:'traverse', vivez:'vit', voyez:'voit', voulez:'veut', êtes:'est',
      affirmez:'affirme', poursuivez:'poursuit'
    };
    const feminine = new Set(['Lune','personnalité','sensibilité','volonté','vie','manière','façon',
      'confiance','pensée','solidité','capacité','liberté','présence','attitude','trajectoire',
      'méthode','place','position']);
    let s = String(prose)
      .replace(/vous-même/g, 'elle-même')
      .replace(/\b(Votre|votre)\s+((?:<[^>]+>\s*)*)([\wÀ-ÿ’]+)/g, (_, possessive, tags, noun) => {
        let word = feminine.has(noun) ? 'sa' : 'son';
        if (possessive === 'Votre') word = word.charAt(0).toUpperCase() + word.slice(1);
        return word + ' ' + tags + noun;
      })
      .replace(/\b(Vos|vos)\b/g, m => m === 'Vos' ? 'Ses' : 'ses');
    const conjugations = Object.keys(verbs).join('|');
    s = s.replace(new RegExp('\\b([Vv]ous) (vous )?(ne )?(' + conjugations + ')\\b', 'g'),
      (_, subject, reflexive, negative, verb) => `${subject === 'Vous' ? 'Elle' : 'elle'} ${reflexive ? 'se ' : ''}${negative ? (verb === 'avez' || verb === 'êtes' ? 'n’' : 'ne ') : ''}${verbs[verb]}`);
    s = s.replace(/\bvous (détacher|mettre|prononcer|sentir|attacher|autoriser|censurer|exprimer|voir)\b/g, 'se $1')
      .replace(/\bvous (amènent|conduisent|entoure|obligent|poussent|pousser|rendre|sécurise|touche|engagent|attire)\b/g, 'la $1')
      .replace(/\bvous\b/g, 'lui')
      .replace(/la (amènent|entoure|obligent|engagent|attire)/g, 'l’$1')
      .replace(/se (autoriser|exprimer)/g, 's’$1')
      .replace(/rester complètement passif/g, 'rester complètement passive')
      .replace(/se sent aimé/g, 'se sent aimée')
      .replace(/se sent soutenu et entouré/g, 'se sent soutenue et entourée')
      .replace(/intérieurement vivant/g, 'intérieurement vivante')
      .replace(/son propre logique/g, 'sa propre logique')
      .replace(/\bque elle\b/g, 'qu’elle')
      .replace(/\blorsque elle\b/g, 'lorsqu’elle')
      .replace(/\bles vôtres\b/g, 'les siens');
    s = s.replace(new RegExp('\\b(' + conjugations + ')\\b', 'g'), verb => verbs[verb]);
    return s;
  }

  function thirdPersonNatal(html) {
    return thirdPerson(html);
  }

  function currentProfile() {
    return enabled.checked && boundRelation === state.relation ? state.relationAstro : null;
  }

  function relationMarkup(a) {
    // Shared rendering retains the complete natal portrait, Pluto, the Timing card,
    // the limit on peaks and all existing special handling of the Trigger card.
    const template = document.createElement('template');
    template.innerHTML = cr3AstroMarkup(a);
    const natal = template.content.querySelector('.cr3-astro-part');
    if (natal) natal.innerHTML = thirdPersonNatal(natal.innerHTML);
    const heading = natal?.querySelector('h4');
    if (heading) heading.textContent = text('La personnalité astrologique de cette personne', 'This person’s astrological personality');
    if (!a.birthTimeKnown && natal) {
      const note = document.createElement('p');
      note.className = 'muted';
      note.textContent = text('Heure inconnue : calcul à midi local, sans Ascendant. La position de la Lune reste indicative.', 'Unknown time: calculated at local noon, without an Ascendant. The Moon’s position remains approximate.');
      natal.prepend(note);
    }
    const scope = document.createElement('p');
    scope.className = 'cr3-period-label';
    scope.textContent = text('Thème de la personne associée à la carte Relation « ', 'Birth chart of the person associated with the Relationship card “') + cardName(state.relation) + text(' ». Les transits ci-dessous sont calculés sur son thème natal.', '”. The transits below are calculated against their birth chart.');
    return scope.outerHTML + template.innerHTML;
  }

  function relationSynthesis(a) {
    const big = cr34BigThree(a, false);
    const sun = cr34SignProfile(big.sun), moon = cr34SignProfile(big.moon);
    const lead = text('Pour la personne associée à « ', 'For the person associated with “') + cardName(state.relation) + text(' », ', '”, ');
    let natal;
    if (en()) {
      const data = cr3NatalData(a);
      natal = `their ${cr3Sign(big.sun, true)} Sun and ${cr3Sign(big.moon, true)} Moon suggest a ${CR3_ELEMENT_TEXT[data.dominantElement]?.en || 'nuanced'} temperament.`;
    } else {
      natal = `son Soleil en ${big.sun} évoque un tempérament ${sun.core}. Sa Lune en ${big.moon} traduit ${thirdPerson(moon.emotion)}.`;
    }
    const timing = state.date ? cr37WindowsText(a, en()) : '';
    return `<p class="cr-relation-synthesis">${cr3Escape(lead + natal)}${timing ? ' ' + cr3Escape(text('Sur son thème, ', 'In their chart, ') + timing.charAt(0).toLowerCase() + timing.slice(1)) : ''}</p>`;
  }

  const CROSS_PLANETS = ['Soleil','Lune','Mercure','Vénus','Mars','Jupiter','Saturne'];
  const PERSONAL_PLANETS = ['Soleil','Lune','Mercure','Vénus','Mars'];
  const TRANSIT_PLANETS = ['Jupiter','Saturne','Uranus','Neptune','Mars','Vénus'];
  const SUPPORT_ASPECTS = new Set(['trigone','sextile']);
  const CHALLENGE_ASPECTS = new Set(['carré','opposition']);
  const CONJUNCTION_SUPPORT = new Set([
    'Lune|Vénus','Soleil|Lune','Soleil|Vénus','Mercure|Mercure','Vénus|Mars','Vénus|Vénus','Lune|Jupiter','Soleil|Jupiter','Vénus|Jupiter'
  ]);

  function canonicalPair(a, b) {
    return [a, b].sort((x, y) => CROSS_PLANETS.indexOf(x) - CROSS_PLANETS.indexOf(y)).join('|');
  }

  function natalCrossTone(a, b, aspectName) {
    if (SUPPORT_ASPECTS.has(aspectName)) return 'support';
    if (CHALLENGE_ASPECTS.has(aspectName)) return 'challenge';
    if (aspectName === 'conjonction' && CONJUNCTION_SUPPORT.has(canonicalPair(a, b))) return 'support';
    return 'intensify';
  }

  function natalCrossScore(hit) {
    const weight = {Soleil:4,Lune:6,Mercure:5,'Vénus':7,Mars:6,Jupiter:3,Saturne:4};
    let score = (weight[hit.a] || 0) + (weight[hit.b] || 0) + Math.max(0, 8 - hit.orb);
    if (hit.tone === 'support' || hit.tone === 'challenge') score += 3;
    if (hit.name === 'conjonction') score += 2;
    return score;
  }

  function natalCrossAspects(consultant, relation) {
    const cp = consultant?.planets || {}, rp = relation?.planets || {}, hits = [];
    for (const a of CROSS_PLANETS) for (const b of CROSS_PLANETS) {
      if (!Number.isFinite(cp[a]) || !Number.isFinite(rp[b])) continue;
      const q = aspect(cp[a], rp[b]);
      if (!q || q.orb > 6) continue;
      const hit = {a,b,name:q.name,orb:q.orb,tone:natalCrossTone(a,b,q.name)};
      hit.score = natalCrossScore(hit);
      hits.push(hit);
    }
    return hits.sort((x, y) => y.score - x.score || x.orb - y.orb);
  }

  function possessiveForPlanet(planet) {
    return ['Lune','Vénus'].includes(planet) ? 'sa' : 'son';
  }

  function natalCrossLabel(hit) {
    if (en()) return `your ${cr3Planet(hit.a, true)} ${cr3Aspect(hit.name, true)} their ${cr3Planet(hit.b, true)} (orb ${hit.orb.toFixed(1)}°)`;
    return `votre ${cr3Planet(hit.a, false)} ${cr3Aspect(hit.name, false)} ${possessiveForPlanet(hit.b)} ${cr3Planet(hit.b, false)} (orbe ${hit.orb.toFixed(1)}°)`;
  }

  function relationshipArea(a, b) {
    const pair = new Set([a,b]);
    if (pair.has('Vénus') && pair.has('Mars')) return text('l’attirance, le désir et la manière de se rapprocher', 'attraction, desire and the way closeness develops');
    if (pair.has('Lune') && pair.has('Vénus')) return text('la tendresse, l’attachement et la sécurité affective', 'tenderness, attachment and emotional safety');
    if (pair.has('Soleil') && pair.has('Lune')) return text('l’accord entre volonté personnelle et sensibilité', 'the fit between personal direction and emotional sensitivity');
    if (pair.has('Mercure')) return text('la communication, la compréhension et les décisions', 'communication, understanding and decisions');
    if (pair.has('Saturne')) return text('la durée, les limites, les responsabilités et le rythme de construction', 'durability, boundaries, responsibilities and the pace of building');
    if (pair.has('Jupiter')) return text('l’ouverture, la confiance et l’encouragement mutuel', 'openness, confidence and mutual encouragement');
    if (pair.has('Mars')) return text('l’initiative, la réaction et le désir', 'initiative, reaction and desire');
    if (pair.has('Vénus')) return text('l’affectivité, les valeurs et l’attirance', 'affection, values and attraction');
    if (pair.has('Lune')) return text('la sensibilité et les réactions émotionnelles', 'sensitivity and emotional reactions');
    return text('la manière dont les deux personnalités se répondent', 'the way the two personalities respond to one another');
  }

  function natalCrossMeaning(hit) {
    const area = relationshipArea(hit.a, hit.b);
    if (hit.tone === 'support') return text(`cet aspect peut faciliter ${area}`, `this aspect can support ${area}`);
    if (hit.tone === 'challenge') return text(`cet aspect peut créer des décalages ou des ajustements autour de ${area}`, `this aspect can create mismatches or adjustments around ${area}`);
    return text(`cet aspect intensifie ${area} sans être, à lui seul, favorable ou défavorable`, `this aspect intensifies ${area} without being favourable or unfavourable on its own`);
  }

  function fallbackTransitHits(profile) {
    const natal = profile?.planets || {}, at = cr3ReadingMoment(), sky = planetLongitudes(at), hits = [];
    for (const tr of TRANSIT_PLANETS) for (const na of PERSONAL_PLANETS) {
      if (!Number.isFinite(sky[tr]) || !Number.isFinite(natal[na])) continue;
      const q = aspect(sky[tr], natal[na]);
      if (!q || q.orb > 6) continue;
      hits.push({tr,na,name:q.name,orb:q.orb,bestOrb:q.orb,tone:cr3TransitTone(q.name),first:new Date(at),last:new Date(at),bestDate:new Date(at),priority:0,points:1});
    }
    return hits;
  }

  function profileTransitHits(profile) {
    if (!profile) return [];
    try {
      if (state.date && typeof cr37RelevantWindows === 'function') {
        const intent = cr33Intent();
        const theme = cr3DominantTheme(state.draw || [], en());
        const window = cr3TimingWindow(state.date, cr3ReadingMoment(), en());
        return cr37RelevantWindows(profile, theme, window, intent) || [];
      }
    } catch (_) {}
    return fallbackTransitHits(profile);
  }

  function dateValue(value) {
    const d = value instanceof Date ? value : new Date(value);
    return Number.isFinite(+d) ? +d : 0;
  }

  function windowsNear(a, b) {
    const a0 = dateValue(a.first || a.bestDate), a1 = dateValue(a.last || a.bestDate);
    const b0 = dateValue(b.first || b.bestDate), b1 = dateValue(b.last || b.bestDate);
    if (!a0 || !b0) return false;
    if (Math.max(a0, b0) <= Math.min(a1 || a0, b1 || b0)) return true;
    return Math.abs(dateValue(a.bestDate) - dateValue(b.bestDate)) <= 21 * 86400000;
  }

  function transitPairTone(a, b) {
    if (a.tone === 'challenge' || b.tone === 'challenge') return 'challenge';
    if (a.tone === 'support' && b.tone === 'support') return 'support';
    if (a.tone === 'support' || b.tone === 'support') return 'support';
    return 'intensify';
  }

  function transitPairScore(pair) {
    const a = pair.a, b = pair.b;
    const days = Math.abs(dateValue(a.bestDate) - dateValue(b.bestDate)) / 86400000;
    let score = Math.max(0, 12 - Math.min(days, 12));
    score += Math.max(0, 6 - (a.bestOrb ?? a.orb ?? 6));
    score += Math.max(0, 6 - (b.bestOrb ?? b.orb ?? 6));
    if (a.tr === b.tr) score += 5;
    if (pair.tone === 'support' || pair.tone === 'challenge') score += 3;
    if (['Lune','Mercure','Vénus','Mars'].includes(a.na)) score += 2;
    if (['Lune','Mercure','Vénus','Mars'].includes(b.na)) score += 2;
    return score;
  }

  function sharedTransitPairs(consultant, relation) {
    const left = profileTransitHits(consultant), right = profileTransitHits(relation), pairs = [];
    for (const a of left) for (const b of right) {
      if (!windowsNear(a, b)) continue;
      const pair = {a,b,tone:transitPairTone(a,b)};
      pair.score = transitPairScore(pair);
      pairs.push(pair);
    }
    return pairs.sort((x, y) => y.score - x.score || dateValue(x.a.bestDate) - dateValue(y.a.bestDate));
  }

  function sharedWhen(pair) {
    const da = dateValue(pair.a.bestDate), db = dateValue(pair.b.bestDate);
    if (!da || !db) return text('sur une même phase de la période', 'during the same phase of the period');
    const delta = Math.abs(da - db) / 86400000;
    if (delta <= 3) {
      const mid = new Date((da + db) / 2);
      return text(`autour du ${cr3Date(mid, false)}`, `around ${cr3Date(mid, true)}`);
    }
    const first = new Date(Math.min(da, db)), last = new Date(Math.max(da, db));
    return text(`entre le ${cr3Date(first, false)} et le ${cr3Date(last, false)}`, `between ${cr3Date(first, true)} and ${cr3Date(last, true)}`);
  }

  function ownedNatalPlanet(planet, owner) {
    if (en()) return owner === 'consultant' ? `your ${cr3Planet(planet, true)}` : `their ${cr3Planet(planet, true)}`;
    if (owner === 'consultant') return `votre ${cr3Planet(planet, false)}`;
    return `${possessiveForPlanet(planet)} ${cr3Planet(planet, false)}`;
  }

  function transitHitLabel(hit, owner) {
    return `${cr3Planet(hit.tr, en())} ${cr3Aspect(hit.name, en())} ${ownedNatalPlanet(hit.na, owner)}`;
  }

  function transitPairLabel(pair) {
    return `${sharedWhen(pair)} — ${transitHitLabel(pair.a, 'consultant')} ; ${transitHitLabel(pair.b, 'relation')}`;
  }

  function transitPairMeaning(pair) {
    const aArea = relationshipArea(pair.a.na, pair.a.tr);
    const bArea = relationshipArea(pair.b.na, pair.b.tr);
    if (pair.tone === 'support') {
      return text(`les deux thèmes reçoivent dans la même phase des activations plutôt fluides ; cela peut faciliter un rapprochement, notamment par ${aArea} et ${bArea}`, `both charts receive relatively fluid activations in the same phase; this can make rapprochement easier, especially through ${aArea} and ${bArea}`);
    }
    if (pair.tone === 'challenge') {
      return text(`au moins l’un des deux thèmes reçoit une activation de tension dans cette même phase ; cela peut accentuer un décalage, une réserve ou un besoin d’ajustement autour de ${aArea} et ${bArea}`, `at least one chart receives a challenging activation in the same phase; this can heighten mismatch, reserve or a need for adjustment around ${aArea} and ${bArea}`);
    }
    return text(`les deux thèmes sont fortement activés au même moment, sans direction relationnelle univoque`, `both charts are strongly activated at the same time, without a single relational direction`);
  }

  function uniqueTop(items, keyFn, max) {
    const seen = new Set(), out = [];
    for (const item of items) {
      const key = keyFn(item);
      if (seen.has(key)) continue;
      seen.add(key); out.push(item);
      if (out.length >= max) break;
    }
    return out;
  }

  function listHtml(items, emptyText, labelFn, meaningFn, max = 3) {
    const chosen = uniqueTop(items, labelFn, max);
    if (!chosen.length) return `<p class="cr-cross-note">${cr3Escape(emptyText)}</p>`;
    return `<ul>${chosen.map(item => `<li><b>${cr3Escape(labelFn(item))}</b> — ${cr3Escape(meaningFn(item))}.</li>`).join('')}</ul>`;
  }

  function natalCrossAnalysis(consultant, relation) {
    const hits = natalCrossAspects(consultant, relation);
    const supports = hits.filter(h => h.tone === 'support');
    const challenges = hits.filter(h => h.tone === 'challenge');
    const relationLabel = state.relation ? cardName(state.relation) : text('la relation tirée', 'the drawn relationship');
    const timeNote = (!consultant.birthTimeKnown || !relation.birthTimeKnown)
      ? `<p class="cr-cross-note">${cr3Escape(text('Lorsqu’une heure de naissance est inconnue, les aspects impliquant la Lune restent plus indicatifs et l’Ascendant n’est pas utilisé dans cette comparaison.', 'When a birth time is unknown, Moon aspects remain more approximate and the Ascendant is not used in this comparison.'))}</p>`
      : '';
    return `<section class="cr-cross-analysis cr-cross-natal">
      <h3>${cr3Escape(text('Analyse croisée 1 · Les deux thèmes de naissance', 'Cross-analysis 1 · Both birth charts'))}</h3>
      <p>${cr3Escape(text(`Cette analyse compare votre thème natal à celui de la personne associée à « ${relationLabel} » afin d’isoler ce qui rapproche naturellement les deux fonctionnements et ce qui peut créer davantage d’écart.`, `This analysis compares your natal chart with that of the person associated with “${relationLabel}” to isolate what naturally brings the two styles closer and what can create more distance.`))}</p>
      <h4>${cr3Escape(text('Aspects remarquables', 'Notable aspects'))}</h4>
      ${listHtml(hits, text('Aucun aspect inter-thèmes suffisamment serré ne ressort parmi les planètes principales.', 'No sufficiently tight inter-chart aspect stands out among the main planets.'), natalCrossLabel, natalCrossMeaning, 4)}
      <h4>${cr3Escape(text('Points de rapprochement', 'Rapprochement factors'))}</h4>
      ${listHtml(supports, text('Aucun facteur harmonique majeur supplémentaire n’est détecté avec l’orbe retenu.', 'No additional major harmonious factor is detected within the selected orb.'), natalCrossLabel, natalCrossMeaning, 3)}
      <h4>${cr3Escape(text('Points d’éloignement', 'Distancing factors'))}</h4>
      ${listHtml(challenges, text('Aucun aspect de tension majeur n’est détecté avec l’orbe retenu.', 'No major challenging aspect is detected within the selected orb.'), natalCrossLabel, natalCrossMeaning, 3)}
      ${timeNote}
    </section>`;
  }

  function transitCrossAnalysis(consultant, relation) {
    const pairs = sharedTransitPairs(consultant, relation);
    const supports = pairs.filter(p => p.tone === 'support');
    const challenges = pairs.filter(p => p.tone === 'challenge');
    const periodText = state.date
      ? text('sur la période définie par la carte Datation', 'over the period defined by the Timing card')
      : text('au moment du tirage', 'at the time of the reading');
    return `<section class="cr-cross-analysis cr-cross-transits">
      <h3>${cr3Escape(text('Analyse croisée 2 · Les transits sur les deux thèmes', 'Cross-analysis 2 · Transits across both charts'))}</h3>
      <p>${cr3Escape(text(`Cette analyse recherche les activations planétaires qui touchent les deux thèmes dans une même phase ${periodText}. Elle met en évidence les moments où les deux dynamiques peuvent converger ou, au contraire, se trouver davantage en décalage.`, `This analysis looks for planetary activations affecting both charts during the same phase ${periodText}. It highlights moments when the two dynamics may converge or, conversely, become more out of step.`))}</p>
      <h4>${cr3Escape(text('Aspects remarquables', 'Notable aspects'))}</h4>
      ${listHtml(pairs, text('Aucune activation simultanée suffisamment nette n’est détectée sur les deux thèmes.', 'No sufficiently clear simultaneous activation is detected across both charts.'), transitPairLabel, transitPairMeaning, 4)}
      <h4>${cr3Escape(text('Points de rapprochement', 'Rapprochement factors'))}</h4>
      ${listHtml(supports, text('Aucune fenêtre commune de soutien suffisamment nette n’est détectée.', 'No sufficiently clear shared supportive window is detected.'), transitPairLabel, transitPairMeaning, 3)}
      <h4>${cr3Escape(text('Points d’éloignement', 'Distancing factors'))}</h4>
      ${listHtml(challenges, text('Aucune fenêtre commune de tension suffisamment nette n’est détectée.', 'No sufficiently clear shared challenging window is detected.'), transitPairLabel, transitPairMeaning, 3)}
    </section>`;
  }

  function crossAnalysesMarkup(consultant, relation) {
    return natalCrossAnalysis(consultant, relation) + transitCrossAnalysis(consultant, relation);
  }

  // Extend every normal synthesis refresh, while preserving the consultant's reading.
  // The two cross-analyses are deliberately conditional: both natal profiles must exist.
  const originalRenderSynthesis = renderSynthesis;
  renderSynthesis = function () {
    originalRenderSynthesis.apply(this, arguments);
    const relation = currentProfile(), consultant = state.astro, box = el('synthesis');
    if (!relation || !consultant || !state.draw?.length || !box) return;
    box.querySelectorAll('.cr-cross-analysis').forEach(node => node.remove());
    const target = box.querySelector('.cr3-global');
    const markup = crossAnalysesMarkup(consultant, relation);
    if (target) target.insertAdjacentHTML('afterend', markup);
    else box.insertAdjacentHTML('beforeend', markup);
  };

  function refreshSynthesis() {
    if (!el('synthesis').classList.contains('hidden')) renderSynthesis();
  }

  function refresh() {
    section.querySelectorAll('[data-relation-fr]').forEach(node => {
      node.textContent = node.getAttribute(en() ? 'data-relation-en' : 'data-relation-fr');
    });
    el('relationBirthplace').placeholder = text('Commencez à écrire une ville', 'Start typing a city');
    el('relationAstroFields').hidden = !enabled.checked;
    el('relationAstroContext').textContent = state.relation
      ? text('Carte Relation tirée : ', 'Relationship card drawn: ') + cardName(state.relation)
      : text('Tirez une carte Relation pour préciser la personne concernée.', 'Draw a Relationship card to identify the person concerned.');
    el('relationAstroBtn').disabled = busy || !enabled.checked || !state.relation;
    el('relationAstroRemove').hidden = !currentProfile();
    if (currentProfile()) {
      result.style.display = 'block';
      result.innerHTML = relationMarkup(currentProfile());
    }
  }

  function invalidate() {
    revision++;
    busy = false;
    state.relationAstro = null;
    boundRelation = null;
    result.innerHTML = '';
    result.style.display = 'none';
    refresh();
    refreshSynthesis();
  }

  function hideSuggestions() {
    searchRevision++;
    clearTimeout(timer);
    suggestions.hidden = true;
    suggestions.replaceChildren();
  }

  function showPlaces(places) {
    suggestions.replaceChildren();
    suggestions.hidden = false;
    if (!places.length) {
      suggestions.textContent = text('Aucun lieu trouvé. Ajoutez le pays ou la région.', 'No place found. Add the country or region.');
      return;
    }
    places.forEach(place => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'btn';
      button.textContent = placeLabel(place);
      button.addEventListener('click', () => {
        chosenPlace = place;
        el('relationBirthplace').value = placeLabel(place);
        hideSuggestions();
        invalidate();
      });
      suggestions.append(button);
    });
  }

  el('relationBirthplace').addEventListener('input', () => {
    chosenPlace = null;
    hideSuggestions();
    const query = el('relationBirthplace').value.trim(), search = searchRevision;
    if (query.length < 3) return;
    timer = setTimeout(async () => {
      try {
        const places = await geocodeMany(query);
        if (search !== searchRevision || !enabled.checked) return;
        showPlaces(places);
      } catch (_) {
        if (search !== searchRevision) return;
        suggestions.textContent = text('La recherche de lieux est indisponible. Vérifiez votre connexion et réessayez.', 'Place search is unavailable. Check your connection and try again.');
        suggestions.hidden = false;
      }
    }, 300);
  });
  el('relationBirthplace').addEventListener('keydown', event => {
    if (event.key === 'Escape') hideSuggestions();
    if (event.key === 'ArrowDown' && !suggestions.hidden) {
      event.preventDefault();
      suggestions.querySelector('button')?.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!el('relationPlaceField').contains(event.target)) hideSuggestions();
  });
  fields.forEach(id => el(id).addEventListener('input', invalidate));
  enabled.addEventListener('change', () => { hideSuggestions(); invalidate(); });
  el('relationAstroRemove').addEventListener('click', () => {
    enabled.checked = false;
    chosenPlace = null;
    fields.forEach(id => { el(id).value = ''; });
    hideSuggestions();
    invalidate();
    enabled.focus();
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    invalidate();
    if (!enabled.checked || !state.relation) return;
    const request = revision, relation = state.relation;
    const date = el('relationBirthdate').value, clock = el('relationBirthtime').value;
    const place = el('relationBirthplace').value.trim();
    const isCurrent = () => request === revision && enabled.checked && relation === state.relation;
    busy = true;
    refresh();
    result.style.display = 'block';
    result.textContent = text('Calcul et interprétation de son thème natal…', 'Calculating and interpreting their birth chart…');
    try {
      if (!date || !place) throw Error('required');
      let g = chosenPlace;
      if (!g) {
        const places = await geocodeMany(place);
        if (!isCurrent()) return;
        if (places.length !== 1) { showPlaces(places); throw Error('select-place'); }
        g = places[0];
      }
      if (!g.timezone || !Number.isFinite(g.latitude) || !Number.isFinite(g.longitude)) throw Error('birth-timezone');
      const birth = birthInstant(date, clock, g.timezone);
      if (birth > new Date()) throw Error('birth-date');
      const planets = planetLongitudes(birth);
      if (!isCurrent()) return;
      state.relationAstro = {
        birthplace:placeLabel(g), birthUTC:birth.toISOString(), birthTimezone:g.timezone,
        birthTimeKnown:!!clock, planets, sun:zodiac(planets.Soleil), moon:zodiac(planets.Lune),
        asc:clock ? zodiac(ascendant(birth, g.latitude, g.longitude)) : null,
        dominant:astroThemes(planets), now:planetLongitudes(cr3ReadingMoment())
      };
      boundRelation = relation;
      hideSuggestions();
      refreshSynthesis();
    } catch (error) {
      if (!isCurrent()) return;
      const messages = {
        required:['Ajoutez au minimum sa date et son lieu de naissance.', 'Add at least their birth date and birthplace.'],
        'select-place':['Choisissez le lieu de naissance dans les suggestions.', 'Choose the birthplace from the suggestions.'],
        'birth-date':['Vérifiez la date de naissance : elle doit être valide et passée.', 'Check the birth date: it must be valid and in the past.'],
        'birth-time':['Vérifiez l’heure de naissance.', 'Check the birth time.'],
        'birth-timezone':['Le fuseau horaire du lieu est indisponible. Choisissez une ville dans les suggestions.', 'The birthplace’s time zone is unavailable. Choose a city in the suggestions.'],
        'birth-time-gap':['Cette heure locale n’a pas existé lors du changement d’heure. Vérifiez l’heure de naissance.', 'This local time did not exist during the clock change. Check the birth time.'],
        'birth-time-ambiguous':['L’heure saisie est ambiguë lors du changement d’heure. Vérifiez l’heure de naissance.', 'This birth time is ambiguous during the clock change. Check the birth time.']
      };
      const message = messages[error.message] || ['Le lieu n’a pas pu être identifié. Vérifiez votre connexion et réessayez.', 'The birthplace could not be identified. Check your connection and try again.'];
      result.innerHTML = `<p role="alert">${cr3Escape(text(...message))}</p>`;
    } finally {
      if (isCurrent()) { busy = false; refresh(); }
    }
  });

  el('relationBtn').addEventListener('click', () => { hideSuggestions(); invalidate(); });
  el('dateBtn').addEventListener('click', () => { refresh(); refreshSynthesis(); });
  el('drawBtn').addEventListener('click', () => {
    // A new question may concern another person even if the same card remains visible.
    hideSuggestions();
    invalidate();
  });
  el('langBtn').addEventListener('click', () => { hideSuggestions(); refresh(); refreshSynthesis(); });
  refresh();
})();