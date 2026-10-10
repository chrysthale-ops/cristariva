const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {spawnSync}=require('node:child_process');

const root=path.join(__dirname,'..');
const entryPath=path.join(root,'cloudflare','worker-entry.mjs');
const configPath=path.join(root,'cloudflare','wrangler.jsonc');
const clientPath=path.join(root,'groq-hybrid-story.js');
const entry=fs.readFileSync(entryPath,'utf8');
const config=JSON.parse(fs.readFileSync(configPath,'utf8'));
const client=fs.readFileSync(clientPath,'utf8');

test('admin worker entry is syntactically valid',()=>{
  const checked=spawnSync(process.execPath,['--check',entryPath],{encoding:'utf8'});
  assert.equal(checked.status,0,checked.stderr||checked.stdout);
});

test('wrangler deploys the observability entry with durable metrics storage',()=>{
  assert.equal(config.main,'worker-entry.mjs');
  assert.deepEqual(config.durable_objects.bindings,[{name:'ADMIN_METRICS',class_name:'AdminMetrics'}]);
  assert.ok(config.migrations.some(m=>m.new_sqlite_classes?.includes('AdminMetrics')));
});

test('admin metrics stay private behind a bearer secret without persisting the token',()=>{
  assert.match(entry,/ADMIN_TOKEN/);
  assert.match(entry,/Authorization/);
  assert.match(entry,/Bearer /);
  assert.match(entry,/status:401/);
  assert.doesNotMatch(entry,/localStorage/);
  assert.doesNotMatch(entry,/sessionStorage/);
});

test('observability stores aggregate and sanitized technical diagnostics only',()=>{
  assert.match(entry,/privacy:'aggregate_and_sanitized_diagnostics'/);
  assert.doesNotMatch(entry,/CF-Connecting-IP/);
  assert.doesNotMatch(entry,/card(?:s)?Text|questionText|contextText/i);
  assert.match(entry,/recentErrors/);
  assert.match(entry,/requestId/);
  assert.match(entry,/durationMs/);
  assert.match(entry,/provider/);
  assert.match(entry,/code/);
  assert.match(entry,/RECENT_ERROR_LIMIT = 50/);
  assert.match(entry,/RECENT_REQUEST_LIMIT = 100/);
});

test('site access telemetry sends no visitor payload and does not add an engine fetch',()=>{
  assert.match(client,/telemetry\/access/);
  assert.match(client,/navigator\.sendBeacon/);
  const telemetryLine=client.split('\n').find(line=>line.includes("telemetry/access"));
  assert.ok(telemetryLine);
  assert.doesNotMatch(telemetryLine,/fetch\(|headers:|location|userAgent|cookie/i);
  assert.match(telemetryLine,/sendBeacon\(endpoint\+'telemetry\/access',''\)/);
});

test('dashboard separates activity, technical health and diagnosis',()=>{
  assert.match(entry,/Activité CRISTARIVA/);
  assert.match(entry,/Santé technique/);
  assert.match(entry,/Taux de succès technique/);
  assert.match(entry,/Échantillon/);
  assert.match(entry,/Diagnostic automatique/);
  assert.match(entry,/Incidents récents/);
  assert.match(entry,/Rejets qualité/);
  assert.match(entry,/Accès sur 30 jours/);
  assert.match(entry,/Demandes sur 30 jours/);
  assert.match(entry,/Lectures réussies sur 30 jours/);
  assert.match(entry,/siteAccesses/);
  assert.match(entry,/successfulReadings/);
  assert.match(entry,/qualityRejected/);
});

test('dashboard exposes recent latency median and p95 from bounded technical samples',()=>{
  assert.match(entry,/medianLatencyMs/);
  assert.match(entry,/p95LatencyMs/);
  assert.match(entry,/recentLatencySamples/);
  assert.match(entry,/Latence médiane récente/);
  assert.match(entry,/Latence P95 récente/);
  assert.match(entry,/percentile\(recentDurations,50\)/);
  assert.match(entry,/percentile\(recentDurations,95\)/);
});

test('incident diagnosis can filter rate limits, provider, quality and other errors',()=>{
  assert.match(entry,/data-filter=\"rate_limit\"/);
  assert.match(entry,/data-filter=\"provider_unavailable\"/);
  assert.match(entry,/data-filter=\"quality\"/);
  assert.match(entry,/data-filter=\"other\"/);
  assert.match(entry,/Limite \/ quota/);
  assert.match(entry,/Fournisseur indisponible/);
  assert.match(entry,/Exception Worker/);
});

test('incident table separates CRISTARIVA diagnosis from source code',()=>{
  assert.match(entry,/Diagnostic CRISTARIVA/);
  assert.match(entry,/Code source/);
  assert.match(entry,/Lecture des incidents/);
  assert.match(entry,/statut HTTP lorsqu'il est explicite/);
  assert.match(entry,/sourceCategory\(code\)/);
  assert.match(entry,/isClassificationMismatch/);
  assert.match(entry,/incidentInterpretation/);
});

test('HTTP 429 keeps rate-limit diagnosis while surfacing contradictory source codes',()=>{
  assert.match(entry,/Number\(e\.status\)===429&&e\.category==='rate_limit'/);
  assert.match(entry,/HTTP 429 prioritaire/);
  assert.match(entry,/Codes source divergents/);
  assert.match(entry,/mismatchCount/);
  assert.match(entry,/⚠ Divergence/);
  assert.match(entry,/provider_unavailable:'provider_unavailable'/);
});

test('dashboard prepares billing without processing payments',()=>{
  assert.match(entry,/transactions/);
  assert.match(entry,/revenueCents/);
  assert.match(entry,/Aucun paiement n'est traité par cette version/);
  assert.doesNotMatch(entry,/stripe|paypal|card_number|payment_intent/i);
});
