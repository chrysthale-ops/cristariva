const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const root = path.join(__dirname, '..');

async function guards(){
  return import(pathToFileURL(path.join(root,'cloudflare','worker-entry-v6.mjs')).href);
}

const input={
  question:'Kinya va-t-il me recontacter ?',
  context:'',
  domain:'Sentimental'
};

test('Triangle ne prouve pas une tierce personne ou une rivalité', async()=>{
  const g=await guards();
  const bad="Le contexte révèle une dynamique triangulaire où une tierce personne ou une rivalité crée de l'incertitude.";
  assert.equal(g.hasInventedTriangle(bad,input),true);
  const safe="Le tirage évoque plusieurs directions possibles sans permettre d'affirmer l'existence d'une tierce personne.";
  assert.equal(g.hasInventedTriangle(safe,input),false);
});

test('un fait utilisateur explicite autorise la mention dune tierce personne', async()=>{
  const g=await guards();
  const contextual={...input,context:'Il est actuellement en couple avec une autre personne.'};
  assert.equal(g.hasInventedTriangle('Une tierce personne peut peser sur la situation.',contextual),false);
});

test('Communication et Choix ne deviennent pas des conditions causales du recontact', async()=>{
  const g=await guards();
  assert.equal(g.hasInventedContactMechanism("Il ne sera probable que si les positions se clarifient.",input),true);
  assert.equal(g.hasInventedContactMechanism("Des messages explicites sont nécessaires pour que le lien se définisse et qu'un contact reprenne.",input),true);
  assert.equal(g.hasInventedContactMechanism("Une décision consciente déterminera si un nouveau contact s'établira.",input),true);
  assert.equal(g.hasInventedContactMechanism("Seule une communication fondée sur des faits précis pourra déclencher une reprise du contact.",input),true);
  assert.equal(g.hasInventedContactMechanism("Le tirage laisse le contact possible mais ne permet pas d'annoncer qu'il aura lieu.",input),false);
});

test('une carte de pause ne crée pas un état actuel non fourni', async()=>{
  const g=await guards();
  assert.equal(g.hasUnsupportedPresentState("Actuellement, la situation se caractérise par une pause silencieuse.",input),true);
  assert.equal(g.hasUnsupportedPresentState("Une dynamique de retenue pèse sur le tirage sans établir un silence réel.",input),false);
  const contextual={...input,context:'Nous sommes sans nouvelles depuis plusieurs semaines.'};
  assert.equal(g.hasUnsupportedPresentState("Actuellement, une période de silence pèse sur le lien.",contextual),false);
});

test('le moteur ne prête pas une réflexion ou un ressourcement à Kinya', async()=>{
  const g=await guards();
  assert.equal(g.hasInventedMentalState("Chacun semble se retirer pour réfléchir et se ressourcer.",input),true);
  assert.equal(g.hasInventedMentalState("Kinya prend du recul pour faire le point.",input),true);
  assert.equal(g.hasInventedMentalState("Le tirage évoque une retenue sans permettre de connaître ce que Kinya pense.",input),false);
});

test('le travail sur soi ne devient pas un levier causal du retour', async()=>{
  const g=await guards();
  assert.equal(g.hasSelfWorkReturnLever("En poursuivant un travail soutenu sur soi-même, on renforce progressivement la stabilité du lien.",input),true);
  assert.equal(g.hasSelfWorkReturnLever("Un travail personnel peut aider à mieux vivre l'attente, sans déterminer le choix de Kinya.",input),false);
});

test('wrangler active le garde-fou v6',()=>{
  const wrangler=fs.readFileSync(path.join(root,'cloudflare','wrangler.jsonc'),'utf8');
  assert.match(wrangler,/"main"\s*:\s*"worker-entry-v6\.mjs"/);
});
