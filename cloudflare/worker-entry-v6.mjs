import worker, { AdminMetrics } from './worker-entry.mjs';

export { AdminMetrics };

const normalize = value => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[’‘]/g, "'");

const factsOf = input => normalize(`${input?.question || ''} ${input?.context || ''}`);
const isReturnQuestion = input => /\b(?:retour|revenir|revienne|recontact\w*|renouer|contact|return|come back)\b/.test(factsOf(input));

function hasExplicitThirdPartyFact(input = {}) {
  const facts = factsOf(input);
  return /(?:tierce personne|troisieme personne|3e personne|relation parallele|triangle amoureux|rivalite|amant|maitresse|autre relation|autre partenaire|avec une autre personne|en couple avec)/.test(facts);
}

function hasInventedTriangle(text, input = {}) {
  if (hasExplicitThirdPartyFact(input)) return false;
  let value = normalize(text);
  value = value.replace(/(?:sans (?:pour autant )?(?:permettre d'|pouvoir )?affirmer|ne permet(?:tent)? pas d'affirmer)[^.!?]{0,100}(?:tierce personne|troisieme personne|relation parallele|rivalite)/g, '');
  return /(?:dynamique triangulaire|relation triangulaire|tierce personne|troisieme personne|relation parallele|interets paralleles|rivalite(?: amoureuse)?|qui occupe quelle place)/.test(value);
}

function hasInventedContactMechanism(text, input = {}) {
  if (!isReturnQuestion(input)) return false;
  const value = normalize(text);
  return /(?:ne sera probable que si|ne deviendra probable que si|a condition que|depend(?: surtout)? d'|conditionn(?:e|ee|es|ees) a)[^.!?]{0,180}(?:mise au point|clarif|sincer|authenti|communication|decision|choix|message|echange|position)|(?:perspective|possibilite|retour|recontact|reouverture|reprise du contact)[^.!?]{0,120}(?:depend|conditionn)[^.!?]{0,180}(?:mise au point|clarif|sincer|authenti|communication|message|echange)|(?:messages?|echanges?|communication)[^.!?]{0,120}(?:sont|seraient|est|serait) necessaires?[^.!?]{0,120}(?:contact|recontact|lien)|(?:decision|choix)[^.!?]{0,140}(?:determinera|decidera)[^.!?]{0,100}(?:contact|recontact|rapprochement)|(?:seule?|uniquement)[^.!?]{0,120}(?:communication|message|echange|decision|choix)[^.!?]{0,160}(?:pourra|pourrait|permettra|permettrait)[^.!?]{0,80}(?:declencher|determiner|provoquer|rendre possible)[^.!?]{0,100}(?:contact|recontact|reprise)|sans (?:cet|un) echange[^.!?]{0,100}(?:contact|recontact)[^.!?]{0,80}(?:absent|improbable|bloque)/.test(value);
}

function hasUnsupportedPresentState(text, input = {}) {
  const facts = factsOf(input);
  const value = normalize(text);
  const suppliedPause = /(?:silence|pause|retrait|distance|sans nouvelles|plus de nouvelles|ne me contacte|ne me recontacte)/.test(facts);
  if (suppliedPause) return false;
  return /(?:actuellement|en ce moment|a present)[^.!?]{0,120}(?:pause|silence|retrait|distance|coupure)|(?:silence|pause|retrait|distance) present(?:e)?\b/.test(value);
}

function hasUnsupportedTemporalClaim(text, input = {}) {
  const facts = factsOf(input);
  if (/(?:recent|derniers? jours|derniere semaine|ces derniers temps)/.test(facts)) return false;
  const value = normalize(text);
  return /(?:recent(?:e|ement)?|ces derniers temps|dernierement)[^.!?]{0,100}(?:autonomie|distance|retrait|changement|prise de recul|separation|rapprochement)|(?:autonomie|distance|retrait|changement|prise de recul|separation|rapprochement)[^.!?]{0,100}(?:recent(?:e|ement)?|ces derniers temps|dernierement)/.test(value);
}

function hasInventedMentalState(text, input = {}) {
  const facts = factsOf(input);
  const value = normalize(text);
  const suppliedReflection = /(?:reflech|ressourc|prendre du recul|besoin de recul|se repose|repos)/.test(facts);
  if (!suppliedReflection && /(?:chacun|kinya|il|elle|l'autre personne|la personne)[^.!?]{0,90}(?:se retire|prend du recul|reste en retrait)[^.!?]{0,100}(?:pour|afin de)[^.!?]{0,40}(?:reflech|ressourc|faire le point)|(?:kinya|il|elle|l'autre personne|la personne)[^.!?]{0,100}(?:reflechit|se ressource|fait le point|prend le temps de reflechir)/.test(value)) return true;

  const suppliedIntent = /(?:envie|desir|crainte|peur|espoir|souhaite|veut|voudrait|intention|blessure|initiative)/.test(facts);
  if (suppliedIntent) return false;
  return /(?:l'envie|le desir|la volonte|l'intention)[^.!?]{0,120}(?:renouer|revenir|retablir|reprendre|etablir de nouveau|rapproch)|(?:crainte|peur|espoir)[^.!?]{0,120}(?:repetition|blessure|rapprochement|retour)|(?:kinya|il|elle|l'autre personne|la personne)[^.!?]{0,120}(?:(?:pourrait|pourra|peut)\s+)?(?:envisager|souhaiter|vouloir|desirer|craindre|esperer)[^.!?]{0,120}(?:contact|recontact|renouer|rapproch|relation)|(?:frein|bloqu)[^.!?]{0,120}(?:initiative|demarche)[^.!?]{0,40}(?:de kinya|de l'autre|de la personne)/.test(value);
}

function hasSelfWorkReturnLever(text, input = {}) {
  if (!isReturnQuestion(input)) return false;
  const value = normalize(text);
  return /(?:travail(?: soutenu)? sur (?:soi|vous-meme)|travail personnel|developpement personnel|guerison personnelle|en travaillant sur (?:soi|vous-meme))[^.!?]{0,180}(?:renforce|stabilise|favorise|rouvre|ouvre|permet|facilite)[^.!?]{0,100}(?:lien|contact|recontact|retour|rapprochement|reprise)/.test(value);
}

function hasUnsupportedStableOutcome(text, input = {}) {
  if (!isReturnQuestion(input)) return false;
  const value = normalize(text);
  return /(?:l'issue|la synthese|la dynamique finale)[^.!?]{0,100}(?:tend|mene|conduit|aboutit)[^.!?]{0,160}(?:relation|lien)[^.!?]{0,100}(?:stable|durable|concret)|(?:concretisation|construction)[^.!?]{0,80}(?:d'un|du) lien[^.!?]{0,80}(?:stable|durable)[^.!?]{0,120}(?:a condition que|si les obstacles)/.test(value);
}

function hasVisibleCardSequence(text) {
  const value = normalize(text);
  const hasInitialCue = /\b(?:contexte|energie|situation) initial(?:e)?\b|\bau depart\b|\bdans un premier temps\b/.test(value);
  const middleCues = value.match(/(?:^|[.!?]\s+)(?:en revanche|par ailleurs|ensuite|puis|cependant|dans cette dynamique)\b/g) || [];
  const hasFinalCue = /(?:^|[.!?]\s+)(?:enfin|finalement|en definitive)\b/.test(value);
  return (hasInitialCue && hasFinalCue && middleCues.length >= 1) || (hasFinalCue && middleCues.length >= 3);
}

function badNarrativeReason(text, input) {
  if (hasInventedTriangle(text, input)) return 'invented_triangle';
  if (hasUnsupportedPresentState(text, input)) return 'unsupported_present_state';
  if (hasUnsupportedTemporalClaim(text, input)) return 'unsupported_temporal_claim';
  if (hasInventedMentalState(text, input)) return 'invented_mental_state';
  if (hasSelfWorkReturnLever(text, input)) return 'self_work_return_lever';
  if (hasInventedContactMechanism(text, input)) return 'invented_contact_mechanism';
  if (hasUnsupportedStableOutcome(text, input)) return 'unsupported_stable_outcome';
  if (hasVisibleCardSequence(text)) return 'visible_card_sequence';
  return '';
}

export default {
  async fetch(request, env, ctx) {
    let input = null;
    if (request.method === 'POST') {
      try { input = await request.clone().json(); } catch {}
    }

    const response = await worker.fetch(request, env, ctx);
    if (!input || !response.ok) return response;

    let payload = null;
    try { payload = await response.clone().json(); } catch { return response; }
    if (!payload || typeof payload.text !== 'string') return response;

    const reason = badNarrativeReason(payload.text, input);
    if (!reason) return response;

    const headers = new Headers(response.headers);
    headers.set('Content-Type', 'application/json');
    headers.set('Cache-Control', 'no-store');
    return new Response(JSON.stringify({ error: 'quality', reason: 'external_grounding', detail: reason }), {
      status: 502,
      headers
    });
  }
};

export {
  hasInventedTriangle,
  hasInventedContactMechanism,
  hasUnsupportedPresentState,
  hasUnsupportedTemporalClaim,
  hasInventedMentalState,
  hasSelfWorkReturnLever,
  hasUnsupportedStableOutcome,
  hasVisibleCardSequence,
  badNarrativeReason
};
