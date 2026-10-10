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

test('admin metrics stay private behind a bearer secret',()=>{
  assert.match(entry,/ADMIN_TOKEN/);
  assert.match(entry,/Authorization/);
  assert.match(entry,/Bearer /);
  assert.match(entry,/status:401/);
  assert.doesNotMatch(entry,/localStorage/);
  assert.match(entry,/sessionStorage/);
});

test('observability stores aggregate technical data only',()=>{
  assert.match(entry,/privacy:'aggregate_only'/);
  assert.doesNotMatch(entry,/CF-Connecting-IP/);
  assert.doesNotMatch(entry,/card(?:s)?Text|questionText|contextText/i);
  assert.match(entry,/recentErrors/);
  assert.match(entry,/requestId/);
});

test('site access telemetry sends no visitor payload and does not add an engine fetch',()=>{
  assert.match(client,/telemetry\/access/);
  assert.match(client,/navigator\.sendBeacon/);
  const telemetryLine=client.split('\n').find(line=>line.includes("telemetry/access"));
  assert.ok(telemetryLine);
  assert.doesNotMatch(telemetryLine,/fetch\(|headers:|location|userAgent|cookie/i);
  assert.match(telemetryLine,/sendBeacon\(endpoint\+'telemetry\/access',''\)/);
});

test('dashboard separates activity and technical health with 30 day indicators',()=>{
  assert.match(entry,/Activité CRISTARIVA/);
  assert.match(entry,/Santé technique/);
  assert.match(entry,/Taux de réussite/);
  assert.match(entry,/Rejets qualité/);
  assert.match(entry,/Accès sur 30 jours/);
  assert.match(entry,/Demandes sur 30 jours/);
  assert.match(entry,/Lectures réussies sur 30 jours/);
  assert.match(entry,/siteAccesses/);
  assert.match(entry,/successfulReadings/);
  assert.match(entry,/qualityRejected/);
});

test('dashboard prepares billing without processing payments',()=>{
  assert.match(entry,/transactions/);
  assert.match(entry,/revenueCents/);
  assert.match(entry,/Aucun paiement n'est traité par cette version/);
  assert.doesNotMatch(entry,/stripe|paypal|card_number|payment_intent/i);
});
