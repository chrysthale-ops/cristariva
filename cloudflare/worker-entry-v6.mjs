import worker, { AdminMetrics } from './worker-entry.mjs';

export { AdminMetrics };

const normalize = value => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[’‘]/g, "'");

function hasExplicitThirdPartyFact(input = {}) {
  const facts = normalize(`${input.question || ''} ${input.context || ''}`);
  return /(?:tierce personne|troisieme personne|3e personne|relation parallele|triangle amoureux|rivalite|amant|maitresse|autre relation|autre partenaire)/.test(facts);
}

function hasInventedTriangle(text, input = {}) {
  if (hasExplicitThirdPartyFact(input)) return false;
  const value = normalize(text);
  return /(?:dynamique triangulaire|relation triangulaire|tierce personne|troisieme personne|relation parallele|interets paralleles|rivalite(?: amoureuse)?|qui occupe quelle place)/.test(value);
}

function hasInventedContactMechanism(text, input = {}) {
  const facts = normalize(`${input.question || ''} ${input.context || ''}`);
  const returnQuestion = /\b(?:retour|revenir|revienne|recontact\w*|renouer|contact|return|come back)\b/.test(facts);
  if (!returnQuestion) return false;
  const value = normalize(text);
  return /(?:ne sera probable que si|ne deviendra probable que si|a condition que)[^.!?]{0,180}(?:clarif|decision|choix|message|echange|position)|(?:messages?|echanges?)[^.!?]{0,120}(?:sont|seraient) necessaires?[^.!?]{0,120}(?:contact|recontact|lien)|(?:decision|choix)[^.!?]{0,140}(?:determinera|decidera)[^.!?]{0,100}(?:contact|recontact|rapprochement)/.test(value);
}

function badNarrativeReason(text, input) {
  if (hasInventedTriangle(text, input)) return 'invented_triangle';
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

export { hasInventedTriangle, hasInventedContactMechanism, badNarrativeReason };
