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
  assert.equal(g.hasInventedMentalState("Le tirage montre un lien émotionnel sans permettre d'en déduire les intentions de Kinya.",input),false);
});

test('la sincérité ne devient pas une condition causale du recontact',async()=>{
  const g=await guards();
  assert.equal(g.hasInventedContactMechanism("Cette perspective dépend surtout d'une communication sincère.",input),true);
  assert.equal(g.hasInventedContactMechanism("La réouverture du dialogue demeure possible, toutefois conditionnée à une communication véritablement ouverte.",input),true);
  assert.equal(g.hasInventedContactMechanism("La sincérité pourrait qualifier la nature d'un éventuel échange sans garantir qu'il aura lieu.",input),false);
});

test('la structure ne doit pas révéler les cartes les unes après les autres',async()=>{
  const g=await guards();
  assert.equal(g.hasVisibleCardSequence("Le contexte initial évoque une distance. Par ailleurs, une empreinte émotionnelle demeure. Enfin, la sincérité invite à la clarté."),true);
  assert.equal(g.hasVisibleCardSequence("Le tirage combine distance, empreinte émotionnelle et besoin de clarté dans une même dynamique."),false);
});

test('une synthèse prudente reste acceptée',async()=>{
  const g=await guards();
  const safe="Un recontact reste possible sans être présenté comme probable ou imminent. L'ensemble combine autonomie, empreinte émotionnelle et clarté, sans permettre d'en déduire les intentions de l'autre personne ni les conditions d'un éventuel message.";
  assert.equal(g.badNarrativeReason(safe,input),'');
});
