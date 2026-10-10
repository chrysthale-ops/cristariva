const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const root = path.join(__dirname, '..');
async function guards(){
  return import(pathToFileURL(path.join(root,'cloudflare','worker-entry-v6.mjs')).href);
}

const input={question:'Kinya va-t-il me recontacter ?',context:'',domain:'Sentimental'};

test('une temporalité récente ne peut pas être inventée par une carte',async()=>{
  const g=await guards();
  assert.equal(g.hasUnsupportedTemporalClaim("Le contexte initial est marqué par une récente prise d'autonomie.",input),true);
  assert.equal(g.hasUnsupportedTemporalClaim("Le tirage évoque une dynamique d'autonomie sans la dater.",input),false);
});

test('le moteur ne prête pas une envie, une crainte ou une intention non fournie',async()=>{
  const g=await guards();
  assert.equal(g.hasInventedMentalState("L'envie d'établir de nouveau un lien n'est pas encore pleinement engagée.",input),true);
  assert.equal(g.hasInventedMentalState("Cette empreinte peut encourager le désir de renouer et la crainte de répéter les mêmes blessures.",input),true);
  assert.equal(g.hasInventedMentalState("Kinya pourrait envisager un rapprochement si les conditions précédentes sont apaisées.",input),true);
  assert.equal(g.hasInventedMentalState("Cette tension peut freiner l'initiative de l'autre.",input),true);
  assert.equal(g.hasInventedMentalState("Le tirage montre un lien émotionnel sans permettre d'en déduire les intentions de Kinya.",input),false);
});

test('la sincérité ou la mise au point ne deviennent pas des conditions causales du recontact',async()=>{
  const g=await guards();
  assert.equal(g.hasInventedContactMechanism("Cette perspective dépend surtout d'une communication sincère.",input),true);
  assert.equal(g.hasInventedContactMechanism("La perspective reste fragile et dépend d'une mise au point claire des échanges.",input),true);
  assert.equal(g.hasInventedContactMechanism("La réouverture du dialogue demeure possible, toutefois conditionnée à une communication véritablement ouverte.",input),true);
  assert.equal(g.hasInventedContactMechanism("La sincérité pourrait qualifier la nature d'un éventuel échange sans garantir qu'il aura lieu.",input),false);
});

test('la structure ne doit pas révéler les cartes les unes après les autres',async()=>{
  const g=await guards();
  assert.equal(g.hasVisibleCardSequence("Le contexte initial évoque une distance. Par ailleurs, une empreinte émotionnelle demeure. Enfin, la sincérité invite à la clarté."),true);
  assert.equal(g.hasVisibleCardSequence("Cette situation évoque un travail régulier. En revanche, une tension apparaît. Par ailleurs, la prudence domine. Dans cette dynamique, une ouverture affective reste possible. Finalement, une recherche de stabilité se dessine."),true);
  assert.equal(g.hasVisibleCardSequence("Le tirage combine distance, empreinte émotionnelle et besoin de clarté dans une même dynamique."),false);
});

test('une carte de stabilité ne devient pas une promesse de relation stable',async()=>{
  const g=await guards();
  assert.equal(g.hasUnsupportedStableOutcome("Finalement, l'issue tend vers une relation marquée par la sécurité et la concrétisation d'un lien stable, à condition que les obstacles soient dépassés.",input),true);
  assert.equal(g.hasUnsupportedStableOutcome("La stabilité peut qualifier la tonalité d'un éventuel lien sans permettre d'en annoncer l'issue.",input),false);
});

test('une synthèse prudente reste acceptée',async()=>{
  const g=await guards();
  const safe="Un recontact reste possible sans être présenté comme probable ou imminent. L'ensemble combine autonomie, empreinte émotionnelle et clarté, sans permettre d'en déduire les intentions de l'autre personne ni les conditions d'un éventuel message.";
  assert.equal(g.badNarrativeReason(safe,input),'');
});
