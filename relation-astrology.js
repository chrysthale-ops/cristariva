/* Optional astrology for the person represented by the Relationship card.
   The natal and transit engines are shared; the consultant's state is never swapped. */
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

  // Extend every normal synthesis refresh, while preserving the consultant's reading.
  const originalRenderSynthesis = renderSynthesis;
  renderSynthesis = function () {
    originalRenderSynthesis.apply(this, arguments);
    const a = currentProfile(), box = el('synthesis');
    if (!a || !state.draw?.length || !box) return;
    const target = box.querySelector('.cr3-global') || box;
    target.insertAdjacentHTML('beforeend', relationSynthesis(a));
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
        'birth-timezone':['Le fuseau horaire du lieu est indisponible. Choisissez une ville dans les suggestions.', 'The birthplace’s time zone is unavailable. Choose a city from the suggestions.'],
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
  el('dateBtn').addEventListener('click', refresh);
  el('drawBtn').addEventListener('click', () => {
    // A new question may concern another person even if the same card remains visible.
    hideSuggestions();
    invalidate();
  });
  el('langBtn').addEventListener('click', () => { hideSuggestions(); refresh(); });
  refresh();
})();
