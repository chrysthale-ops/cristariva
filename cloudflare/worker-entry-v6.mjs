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
  return /(?:ne sera probable que si|ne deviendra probable que si|a condition que)[^.!?]{0,180}(?:clarif|decision|choix|message|echange|position)|(?:messages?|echanges?)[^.!?]{0,120}(?:sont|seraient) necessaires?[^.!?]{0,120}(?:contact|recontact|lien)|(?:decision|choix)[^.!?]{0,140}(?:determinera|decidera)[^.!?]{0,100}(?:contact|recontact|rapprochement)|(?:seule?|uniquement)[^.!?]{0,120}(?:communication|message|echange|decision|choix)[^.!?]{0,160}(?:pourra|pourrait|permettra|permettrait)[^.!?]{0,80}(?:declencher|determiner|provoquer|rendre possible)[^.!?]{0,100}(?:contact|recontact|reprise)/.test(value);
}

function hasUnsupportedPresentState(text, input = {}) {
  const facts = factsOf(input);
  const value = normalize(text);
  const suppliedPause = /(?:silence|pause|retrait|distance|sans nouvelles|plus de nouvelles|ne me contacte|ne me recontacte)/.test(facts);
  if (suppliedPause) return false;
  return /(?:actuellement|en ce moment|a present)[^.!?]{0,120}(?:pause|silence|retrait|distance|coupure)|(?:silence|pause|retrait|distance) present(?:e)?\b/.test(value);
}

function hasInventedMentalState(text, input = {}) {
  const facts = factsOf(input);
  const value = normalize(text);
  const suppliedReflection = /(?:reflech|ressourc|prendre du recul|besoin de recul|se repose|repos)/.test(facts);
  if (suppliedReflection) return false;
  return /(?:chacun|kinya|il|elle|l'autre personne|la personne)[^.!?]{0,90}(?:se retire|prend du recul|reste en retrait)[^.!?]{0,100}(?:pour|afin de)[^.!?]{0,40}(?:reflech|ressourc|faire le point)|(?:kinya|il|elle|l'autre personne|la personne)[^.!?]{0,100}(?:reflechit|se ressource|fait le point|prend le temps de reflechir)/.test(value);
}

function hasSelfWorkReturnLever(text, input = {}) {
  if (!isReturnQuestion(input)) return false;
  const value = normalize(text);
  return /(?:travail(?: soutenu)? sur (?:soi|vous-meme)|travail personnel|developpement personnel|guerison personnelle|en travaillant sur (?:soi|vous-meme))[^.!?]{0,180}(?:renforce|stabilise|favorise|rouvre|ouvre|permet|facilite)[^.!?]{0,100}(?:lien|contact|recontact|retour|rapprochement|reprise)/.test(value);
}

function badNarrativeReason(text, input) {
  if (hasInventedTriangle(text, input)) return 'invented_triangle';
  if (hasUnsupportedPresentState(text, input)) return 'unsupported_present_state';
  if (hasInventedMentalState(text, input)) return 'invented_mental_state';
  if (hasSelfWorkReturnLever(text, input)) return 'self_work_return_lever';
  if (hasInventedContactMechanism(text, input)) return 'invented_contact_mechanism';
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
  hasInventedMentalState,
  hasSelfWorkReturnLever,
  badNarrativeReason
};
