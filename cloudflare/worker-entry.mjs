import coreWorker from './groq-worker.mjs';

const ALLOWED_ORIGINS = new Set(['https://cristariva.netlify.app','https://chrysthale-ops.github.io']);
const DAY_MS = 86400000;
const HISTORY_DAYS = 60;
const RECENT_ERROR_LIMIT = 50;
const RECENT_REQUEST_LIMIT = 100;

const emptyTotals = () => ({
  siteAccesses: 0,
  apiRequests: 0,
  successfulReadings: 0,
  anomalies: 0,
  rateLimited: 0,
  providerUnavailable: 0,
  qualityRejected: 0,
  transactions: 0,
  revenueCents: 0,
  latencyMsTotal: 0,
  latencySamples: 0
});

const emptyDay = () => ({siteAccesses:0,apiRequests:0,successfulReadings:0,anomalies:0,rateLimited:0,providerUnavailable:0,qualityRejected:0});
const isoDay = ts => new Date(ts).toISOString().slice(0,10);

function percentile(values,p) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a,b)=>a-b);
  const index = Math.max(0,Math.ceil((p/100)*sorted.length)-1);
  return Math.round(sorted[index]);
}

export class AdminMetrics {
  constructor(ctx) {
    this.ctx = ctx;
  }

  async fetch(request) {
    const url = new URL(request.url);
    if (request.method === 'POST' && url.pathname === '/record') {
      const event = await request.json();
      await this.record(event);
      return new Response(null,{status:204});
    }
    if (request.method === 'GET' && url.pathname === '/summary') {
      const state = await this.ctx.storage.get('state') || {totals:emptyTotals(),daily:{},recentErrors:[],recentRequests:[]};
      return Response.json(this.publicSummary(state));
    }
    return Response.json({error:'not_found'},{status:404});
  }

  async record(event) {
    const state = await this.ctx.storage.get('state') || {totals:emptyTotals(),daily:{},recentErrors:[],recentRequests:[]};
    state.totals = {...emptyTotals(),...state.totals};
    state.daily ||= {};
    state.recentErrors ||= [];
    state.recentRequests ||= [];
    const now = Number.isFinite(event.ts) ? event.ts : Date.now();
    const dayKey = isoDay(now);
    const day = state.daily[dayKey] = {...emptyDay(),...(state.daily[dayKey]||{})};

    if (event.kind === 'site_access') {
      state.totals.siteAccesses += 1;
      day.siteAccesses += 1;
    }
    if (event.kind === 'api_request') {
      state.totals.apiRequests += 1;
      day.apiRequests += 1;
      if (event.success) {
        state.totals.successfulReadings += 1;
        day.successfulReadings += 1;
      }
      if (Number.isFinite(event.durationMs)) {
        state.totals.latencyMsTotal += Math.max(0,event.durationMs);
        state.totals.latencySamples += 1;
      }
      state.recentRequests.unshift({
        at:new Date(now).toISOString(),
        status:Number(event.status)||0,
        success:Boolean(event.success),
        category:String(event.category||'unknown').slice(0,80),
        provider:String(event.provider||'groq').slice(0,40),
        durationMs:Number.isFinite(event.durationMs)?Math.max(0,Math.round(event.durationMs)):null
      });
      state.recentRequests = state.recentRequests.slice(0,RECENT_REQUEST_LIMIT);
      if (!event.success) {
        state.totals.anomalies += 1;
        day.anomalies += 1;
        if (event.category === 'rate_limit') { state.totals.rateLimited += 1; day.rateLimited += 1; }
        if (event.category === 'provider_unavailable') { state.totals.providerUnavailable += 1; day.providerUnavailable += 1; }
        if (event.category === 'quality') { state.totals.qualityRejected += 1; day.qualityRejected += 1; }
        state.recentErrors.unshift({
          at:new Date(now).toISOString(),
          status:Number(event.status)||0,
          category:String(event.category||'unknown').slice(0,80),
          provider:String(event.provider||'groq').slice(0,40),
          durationMs:Number.isFinite(event.durationMs)?Math.max(0,Math.round(event.durationMs)):null,
          code:String(event.code||'').slice(0,80),
          requestId:String(event.requestId||'').slice(0,80)
        });
        state.recentErrors = state.recentErrors.slice(0,RECENT_ERROR_LIMIT);
      }
    }

    const cutoff = Date.now() - HISTORY_DAYS * DAY_MS;
    for (const key of Object.keys(state.daily)) {
      if (new Date(key+'T00:00:00Z').getTime() < cutoff) delete state.daily[key];
    }
    await this.ctx.storage.put('state',state);
  }

  publicSummary(state) {
    const totals = {...emptyTotals(),...(state.totals||{})};
    const averageLatencyMs = totals.latencySamples ? Math.round(totals.latencyMsTotal / totals.latencySamples) : 0;
    const recentDurations = (state.recentRequests||[]).map(item=>item?.durationMs).filter(Number.isFinite);
    const daily = Object.entries(state.daily||{}).sort(([a],[b])=>a.localeCompare(b)).map(([date,values])=>({date,...emptyDay(),...values}));
    return {
      generatedAt:new Date().toISOString(),
      totals:{
        siteAccesses:totals.siteAccesses,
        apiRequests:totals.apiRequests,
        successfulReadings:totals.successfulReadings,
        anomalies:totals.anomalies,
        rateLimited:totals.rateLimited,
        providerUnavailable:totals.providerUnavailable,
        qualityRejected:totals.qualityRejected,
        averageLatencyMs,
        medianLatencyMs:percentile(recentDurations,50),
        p95LatencyMs:percentile(recentDurations,95),
        recentLatencySamples:recentDurations.length,
        transactions:totals.transactions,
        revenueCents:totals.revenueCents
      },
      daily,
      recentErrors:(state.recentErrors||[]).slice(0,RECENT_ERROR_LIMIT),
      privacy:'aggregate_and_sanitized_diagnostics'
    };
  }
}

function metricsStub(env) {
  if (!env.ADMIN_METRICS) return null;
  return env.ADMIN_METRICS.get(env.ADMIN_METRICS.idFromName('global'));
}

async function recordMetric(env,event) {
  const stub = metricsStub(env);
  if (!stub) return;
  try {
    await stub.fetch('https://admin-metrics.internal/record',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...event,ts:Date.now()})});
  } catch (error) {
    console.warn(JSON.stringify({event:'metrics_write_failed',name:error?.name||'Error'}));
  }
}

function safeEqual(a,b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i=0;i<a.length;i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function adminAuthorized(request,env) {
  if (!env.ADMIN_TOKEN) return false;
  const value = request.headers.get('Authorization') || '';
  return value.startsWith('Bearer ') && safeEqual(value.slice(7),env.ADMIN_TOKEN);
}

function categoryFrom(status,payload) {
  const code = payload?.error || '';
  if (status === 429 || code === 'rate_limit') return 'rate_limit';
  if (code === 'provider_unavailable' || code === 'not_configured') return 'provider_unavailable';
  if (code === 'quality') return 'quality';
  if (code === 'coverage' || code === 'incomplete') return 'generation_incomplete';
  if (code === 'input' || code === 'json' || code === 'size') return 'invalid_request';
  if (code === 'origin') return 'origin_rejected';
  if (code === 'method') return 'method_rejected';
  return status >= 500 ? 'server_error' : status >= 400 ? 'client_error' : 'ok';
}

function withRequestId(response,requestId) {
  const headers = new Headers(response.headers);
  headers.set('X-Cristariva-Request-Id',requestId);
  return new Response(response.status===204?null:response.body,{status:response.status,statusText:response.statusText,headers});
}

function corsHeaders(origin) {
  const headers = {'Cache-Control':'no-store','Vary':'Origin'};
  if (ALLOWED_ORIGINS.has(origin)) headers['Access-Control-Allow-Origin'] = origin;
  return headers;
}

const ADMIN_HTML = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>CRISTARIVA — Administration</title>
<style>
:root{color-scheme:dark;--bg:#071321;--panel:#0d2035;--panel2:#071827;--gold:#c7a86b;--text:#f5f1e8;--muted:#a9b4c3;--bad:#ef8c8c;--good:#8ed6b0;--blue:#6d9bc3;--warning:#e8c17b}*{box-sizing:border-box}body{margin:0;font-family:system-ui,-apple-system,Segoe UI,sans-serif;background:radial-gradient(circle at 80% 0,#183755 0,#071321 45%);color:var(--text);min-height:100vh}main{max-width:1320px;margin:auto;padding:34px 22px 60px}h1{font-family:Georgia,serif;letter-spacing:.08em;color:var(--gold);margin:0}header p{color:var(--muted);margin:.4rem 0 1.8rem}.login,.panel,.card{background:rgba(13,32,53,.9);border:1px solid rgba(199,168,107,.32);border-radius:18px;box-shadow:0 18px 50px #0005}.login{padding:20px;display:flex;gap:10px;align-items:end;margin-bottom:22px}.login label{flex:1;color:var(--muted);font-size:.9rem}.login input{width:100%;margin-top:7px;padding:12px;border-radius:10px;border:1px solid #496077;background:#06111d;color:white}.login button,button{padding:12px 18px;border-radius:10px;border:1px solid var(--gold);background:var(--gold);color:#102034;font-weight:700;cursor:pointer}.status{min-height:24px;color:var(--muted)}.section-title{margin:22px 0 10px;color:var(--gold);font-size:.9rem;text-transform:uppercase;letter-spacing:.08em}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.card{padding:18px;min-height:130px}.card span{display:block;color:var(--muted);font-size:.82rem}.card strong{font-size:1.8rem;display:block;margin-top:7px}.card small{display:block;color:var(--muted);margin-top:5px;line-height:1.35}.card.actionable{cursor:pointer;transition:transform .15s,border-color .15s}.card.actionable:hover,.card.actionable:focus{transform:translateY(-2px);border-color:var(--gold);outline:none}.good{color:var(--good)}.bad{color:var(--bad)}.warning{color:var(--warning)}.panel{padding:20px;margin-top:16px}.panel h2{font-size:1rem;color:var(--gold);margin-top:0}.legend{display:flex;gap:18px;flex-wrap:wrap;color:var(--muted);font-size:.82rem;margin-bottom:10px}.legend i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:6px}.legend .access-dot{background:var(--gold)}.legend .request-dot{background:var(--blue)}.bars{display:flex;align-items:end;gap:5px;height:175px;border-bottom:1px solid #365067;padding-top:12px}.day{flex:1;min-width:7px;height:100%;display:flex;align-items:end;justify-content:center;gap:2px;position:relative}.bar{width:46%;min-height:2px;border-radius:4px 4px 0 0;position:relative}.bar.access{background:var(--gold)}.bar.request{background:var(--blue)}.day:hover:after{content:attr(data-tip);position:absolute;bottom:100%;left:50%;transform:translateX(-50%);background:#020912;padding:5px 7px;border-radius:5px;white-space:nowrap;font-size:.72rem;z-index:2}.summary{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:14px}.summary div{padding:12px;border-radius:12px;background:var(--panel2);border:1px solid #294158}.summary span{display:block;color:var(--muted);font-size:.78rem}.summary strong{display:block;margin-top:4px}.diagnostic{display:grid;grid-template-columns:1.25fr .75fr;gap:14px;align-items:start}.diagnostic-main{padding:16px;border-radius:14px;background:var(--panel2);border:1px solid #294158}.diagnostic-main strong{font-size:1.05rem}.diagnostic-main p{color:var(--muted);line-height:1.5;margin:.5rem 0 0}.diagnostic-kpis{display:grid;grid-template-columns:1fr;gap:8px}.diagnostic-kpis div{padding:11px 12px;background:var(--panel2);border:1px solid #294158;border-radius:11px}.diagnostic-kpis span{color:var(--muted);font-size:.78rem}.filters{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0 6px}.filter{padding:7px 10px;border-radius:999px;border:1px solid #496077;background:#071827;color:var(--muted);font-size:.78rem}.filter.active{border-color:var(--gold);color:#102034;background:var(--gold)}.errors{width:100%;border-collapse:collapse}.errors th,.errors td{text-align:left;border-bottom:1px solid #294158;padding:9px 6px;font-size:.84rem;white-space:nowrap;vertical-align:top}.errors th{color:var(--muted)}.errors td.detail,.errors td.interpretation{white-space:normal}.errors tr.mismatch td{background:rgba(232,193,123,.055)}.badge{display:inline-block;padding:3px 7px;border-radius:999px;background:#172d43;border:1px solid #365067;font-size:.74rem}.badge.alert{border-color:var(--warning);color:var(--warning);margin-right:6px}.interpretation{min-width:260px;max-width:390px;color:var(--muted);line-height:1.35}.future{opacity:.72}.privacy{color:var(--muted);font-size:.8rem;line-height:1.45;margin-top:12px}.classification-note{padding:11px 12px;background:var(--panel2);border:1px solid #294158;border-radius:11px;color:var(--muted);font-size:.82rem;line-height:1.45;margin:12px 0 0}@media(max-width:900px){.grid{grid-template-columns:repeat(2,1fr)}.diagnostic{grid-template-columns:1fr}.summary{grid-template-columns:1fr}}@media(max-width:800px){.login{display:block}.login button{margin-top:10px;width:100%}}@media(max-width:470px){.grid{grid-template-columns:1fr}}
</style></head><body><main><header><h1>CRISTARIVA</h1><p>Plateforme d'administration — activité, fiabilité, diagnostic et préparation de la facturation</p></header>
<section class="login"><label>Jeton administrateur<input id="token" type="password" autocomplete="off" placeholder="ADMIN_TOKEN"></label><button id="connect">Afficher les données</button></section><div id="status" class="status"></div>
<section id="dashboard" hidden>
<h2 class="section-title">Activité CRISTARIVA</h2><div class="grid"><div class="card"><span>Accès enregistrés</span><strong id="access">—</strong><small>Chargements comptabilisés</small></div><div class="card"><span>Demandes au moteur</span><strong id="requests">—</strong><small>Appels d'interprétation</small></div><div class="card"><span>Lectures réussies</span><strong id="success" class="good">—</strong></div><div class="card"><span>Taux de succès technique</span><strong id="successRate" class="good">—</strong><small id="successSample">Échantillon : —</small></div></div>
<h2 class="section-title">Santé technique</h2><div class="grid"><div class="card actionable" id="errorsCard" data-filter="all" role="button" tabindex="0"><span>Anomalies</span><strong id="errors" class="bad">—</strong><small>Cliquer pour afficher tous les incidents récents</small></div><div class="card actionable" id="qualityCard" data-filter="quality" role="button" tabindex="0"><span>Rejets qualité</span><strong id="quality">—</strong><small>Réponses écartées par le contrôle qualité</small></div><div class="card actionable" id="limitedCard" data-filter="rate_limit" role="button" tabindex="0"><span>Limites atteintes</span><strong id="limited">—</strong><small>Quotas ou limitation de fréquence</small></div><div class="card actionable" id="providerCard" data-filter="provider_unavailable" role="button" tabindex="0"><span>Indisponibilités fournisseur</span><strong id="provider">—</strong><small>Service IA indisponible ou non configuré</small></div><div class="card"><span>Latence moyenne du Worker</span><strong id="latency">—</strong><small>Toutes les mesures enregistrées</small></div><div class="card"><span>Latence médiane récente</span><strong id="medianLatency">—</strong><small id="latencySample">Sur les requêtes récentes</small></div><div class="card"><span>Latence P95 récente</span><strong id="p95Latency">—</strong><small>95 % des appels récents sont plus rapides</small></div><div class="card future"><span>Transactions (préparation)</span><strong id="transactions">0</strong></div></div>
<div class="panel"><h2>Diagnostic automatique</h2><div class="diagnostic"><div class="diagnostic-main"><strong id="diagnosticHeadline">Analyse en attente</strong><p id="diagnosticText">Chargez les données pour identifier la cause dominante des anomalies.</p></div><div class="diagnostic-kpis"><div><span>Anomalies / demandes</span><strong id="anomalyRate">—</strong></div><div><span>Échantillon technique</span><strong id="technicalSample">—</strong></div><div><span>Codes source divergents</span><strong id="mismatchCount">—</strong></div></div></div></div>
<div class="panel"><h2>Activité des 30 derniers jours</h2><div class="legend"><span><i class="access-dot"></i>Accès au site</span><span><i class="request-dot"></i>Demandes au moteur</span></div><div id="bars" class="bars"></div><div class="summary"><div><span>Accès sur 30 jours</span><strong id="access30">0</strong></div><div><span>Demandes sur 30 jours</span><strong id="requests30">0</strong></div><div><span>Lectures réussies sur 30 jours</span><strong id="success30">0</strong></div></div></div>
<div class="panel" id="incidents"><h2>Incidents récents</h2><div class="filters"><button class="filter active" data-filter="all">Tous</button><button class="filter" data-filter="rate_limit">Limites</button><button class="filter" data-filter="provider_unavailable">Fournisseur</button><button class="filter" data-filter="quality">Qualité</button><button class="filter" data-filter="other">Autres</button></div><div class="classification-note"><strong>Lecture des incidents :</strong> le <b>Diagnostic CRISTARIVA</b> est la classification retenue par l'application, en donnant priorité au statut HTTP lorsqu'il est explicite. Le <b>Code source</b> est conservé séparément pour comprendre ce qu'a renvoyé la couche fournisseur. Une divergence est signalée, mais elle ne remplace pas automatiquement le diagnostic.</div><div style="overflow:auto"><table class="errors"><thead><tr><th>Date</th><th>HTTP</th><th>Diagnostic CRISTARIVA</th><th>Fournisseur</th><th>Durée</th><th>Code source</th><th>Lecture</th><th>Identifiant</th></tr></thead><tbody id="errorRows"></tbody></table></div><p class="privacy">Diagnostic volontairement limité aux métadonnées techniques : aucune question, aucun contexte, aucune adresse IP, aucun jeton administrateur et aucune clé API ne sont conservés dans ces incidents. L'historique détaillé est borné aux 50 incidents les plus récents.</p></div>
<div class="panel future"><h2>Facturation — préparée pour une évolution ultérieure</h2><p>Transactions : <b id="billingTransactions">0</b> · Chiffre d'affaires suivi : <b id="revenue">0,00 €</b>. Aucun paiement n'est traité par cette version.</p></div></section>
<script>
const q=id=>document.getElementById(id);const fmt=n=>new Intl.NumberFormat('fr-FR').format(n||0);const money=c=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format((c||0)/100);const pct=(a,b)=>b?new Intl.NumberFormat('fr-FR',{maximumFractionDigits:1}).format(a/b*100)+' %':'—';const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const categoryLabel=c=>({rate_limit:'Limite / quota',provider_unavailable:'Fournisseur indisponible',quality:'Rejet qualité',generation_incomplete:'Génération incomplète',invalid_request:'Requête invalide',origin_rejected:'Origine refusée',method_rejected:'Méthode refusée',server_error:'Erreur serveur',client_error:'Erreur client',worker_exception:'Exception Worker'}[c]||c||'Inconnue');let incidents=[];
function sourceCategory(code){return ({rate_limit:'rate_limit',provider_unavailable:'provider_unavailable',not_configured:'provider_unavailable',quality:'quality',coverage:'generation_incomplete',incomplete:'generation_incomplete',input:'invalid_request',json:'invalid_request',size:'invalid_request',origin:'origin_rejected',method:'method_rejected'})[String(code||'')]||null}
function isClassificationMismatch(e){const source=sourceCategory(e.code);return Boolean(source&&source!==e.category)}
function incidentInterpretation(e){const mismatch=isClassificationMismatch(e),source=sourceCategory(e.code);if(mismatch&&Number(e.status)===429&&e.category==='rate_limit')return 'HTTP 429 prioritaire : CRISTARIVA classe cet incident en limite / quota. Le code source « '+(e.code||'—')+' » décrit la couche fournisseur et ne change pas ce diagnostic.';if(mismatch)return 'Diagnostic CRISTARIVA : '+categoryLabel(e.category)+'. Le code source correspond plutôt à « '+categoryLabel(source)+' » : divergence à vérifier.';if(e.category==='rate_limit')return 'La requête a été refusée par une limite de quota ou de fréquence.';if(e.category==='provider_unavailable')return 'Le fournisseur IA était indisponible ou non configuré.';if(e.category==='quality')return 'La réponse a été rejetée par le contrôle qualité.';if(e.category==='generation_incomplete')return 'La génération n’a pas produit une réponse complète exploitable.';return 'Incident technique classé « '+categoryLabel(e.category)+' ».'}
function diagnostic(t,rows){const requests=Number(t.apiRequests)||0,errors=Number(t.anomalies)||0,limited=Number(t.rateLimited)||0,provider=Number(t.providerUnavailable)||0,quality=Number(t.qualityRejected)||0,mismatches=(rows||[]).filter(isClassificationMismatch);q('anomalyRate').textContent=pct(errors,requests);q('technicalSample').textContent=fmt(requests)+' appel'+(requests>1?'s':'');q('mismatchCount').textContent=fmt(mismatches.length);if(!requests){q('diagnosticHeadline').textContent='Pas encore assez de données';q('diagnosticText').textContent='Aucun appel moteur n’est enregistré. Le diagnostic deviendra pertinent avec davantage de trafic.';return}if(!errors){q('diagnosticHeadline').textContent='Aucune anomalie détectée';q('diagnosticText').textContent='Les appels enregistrés ont abouti sans incident technique. Continuez à surveiller la tendance quand l’échantillon grandira.';return}if(limited===errors){q('diagnosticHeadline').textContent='Les anomalies proviennent actuellement des limites atteintes';q('diagnosticText').textContent=limited+' incident'+(limited>1?'s':'')+' sur '+errors+' correspond'+(limited>1?'ent':'')+' à une limitation de quota ou de fréquence.'+(mismatches.length?' '+mismatches.length+' incident'+(mismatches.length>1?'s':'')+' présente'+(mismatches.length>1?'nt':'')+' un code source différent ; pour un HTTP 429, le diagnostic Limite / quota reste prioritaire.':'');return}if(provider>=Math.max(limited,quality) && provider>0){q('diagnosticHeadline').textContent='L’indisponibilité du fournisseur est la cause dominante';q('diagnosticText').textContent='Priorité : vérifier l’état du fournisseur, sa configuration et la stratégie de repli avant d’incriminer l’interface CRISTARIVA.'+(mismatches.length?' '+mismatches.length+' divergence'+(mismatches.length>1?'s sont':' est')+' signalée'+(mismatches.length>1?'s':'')+' dans les codes source.':'');return}if(limited>=Math.max(provider,quality) && limited>0){q('diagnosticHeadline').textContent='Les limites de quota ou de fréquence dominent';q('diagnosticText').textContent='Priorité : contrôler les limites du compte fournisseur et la cadence des appels. Les incidents sont détaillés ci-dessous.'+(mismatches.length?' Les divergences de code source sont signalées séparément.':'');return}q('diagnosticHeadline').textContent='Les anomalies ont plusieurs causes';q('diagnosticText').textContent='Consultez les diagnostics CRISTARIVA et les codes source ci-dessous pour distinguer limites, indisponibilités, qualité et autres erreurs.'+(mismatches.length?' '+mismatches.length+' divergence'+(mismatches.length>1?'s demandent':' demande')+' une vérification.':'')}
function renderIncidents(filter){const known=new Set(['rate_limit','provider_unavailable','quality']);const rows=incidents.filter(e=>filter==='all'||(filter==='other'?!known.has(e.category):e.category===filter));q('errorRows').innerHTML=rows.map(e=>{const mismatch=isClassificationMismatch(e);return '<tr class="'+(mismatch?'mismatch':'')+'"><td>'+esc(new Date(e.at).toLocaleString('fr-FR'))+'</td><td>'+esc(e.status||'—')+'</td><td><span class="badge">'+esc(categoryLabel(e.category))+'</span></td><td>'+esc(e.provider||'groq')+'</td><td>'+esc(Number.isFinite(e.durationMs)?fmt(e.durationMs)+' ms':'—')+'</td><td class="detail">'+esc(e.code||'—')+'</td><td class="interpretation">'+(mismatch?'<span class="badge alert">⚠ Divergence</span>':'')+esc(incidentInterpretation(e))+'</td><td>'+esc(e.requestId||'—')+'</td></tr>'}).join('')||'<tr><td colspan="8">Aucun incident dans ce filtre.</td></tr>';document.querySelectorAll('.filter').forEach(b=>b.classList.toggle('active',b.dataset.filter===filter))}
function setFilter(filter){renderIncidents(filter);q('incidents').scrollIntoView({behavior:'smooth',block:'start'})}
document.querySelectorAll('.filter').forEach(b=>b.addEventListener('click',()=>setFilter(b.dataset.filter)));document.querySelectorAll('.card.actionable').forEach(card=>{const go=()=>setFilter(card.dataset.filter);card.addEventListener('click',go);card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}})});
async function load(){const token=q('token').value.trim();if(!token){q('status').textContent='Saisissez le jeton administrateur.';return}q('status').textContent='Chargement…';try{const r=await fetch('/admin/metrics',{headers:{Authorization:'Bearer '+token},cache:'no-store'});if(!r.ok)throw new Error(r.status===401?'Jeton refusé.':'Erreur '+r.status);const d=await r.json(),t=d.totals;q('access').textContent=fmt(t.siteAccesses);q('requests').textContent=fmt(t.apiRequests);q('success').textContent=fmt(t.successfulReadings);q('successRate').textContent=pct(t.successfulReadings,t.apiRequests);q('successSample').textContent='Échantillon : '+fmt(t.successfulReadings)+' réussite'+(t.successfulReadings>1?'s':'')+' sur '+fmt(t.apiRequests)+' appel'+(t.apiRequests>1?'s':'');q('errors').textContent=fmt(t.anomalies);q('quality').textContent=fmt(t.qualityRejected);q('limited').textContent=fmt(t.rateLimited);q('provider').textContent=fmt(t.providerUnavailable);q('latency').textContent=fmt(t.averageLatencyMs)+' ms';q('medianLatency').textContent=t.recentLatencySamples?fmt(t.medianLatencyMs)+' ms':'—';q('p95Latency').textContent=t.recentLatencySamples?fmt(t.p95LatencyMs)+' ms':'—';q('latencySample').textContent=t.recentLatencySamples?'Sur '+fmt(t.recentLatencySamples)+' requête'+(t.recentLatencySamples>1?'s':'')+' récente'+(t.recentLatencySamples>1?'s':''):'Aucun échantillon récent';q('transactions').textContent=fmt(t.transactions);q('billingTransactions').textContent=fmt(t.transactions);q('revenue').textContent=money(t.revenueCents);const days=(d.daily||[]).slice(-30),max=Math.max(1,...days.flatMap(x=>[x.siteAccesses,x.apiRequests]));q('bars').innerHTML=days.map(x=>'<div class="day" data-tip="'+esc(x.date)+' · '+fmt(x.siteAccesses)+' accès · '+fmt(x.apiRequests)+' demandes"><div class="bar access" style="height:'+Math.max(2,Math.round(x.siteAccesses/max*100))+'%"></div><div class="bar request" style="height:'+Math.max(2,Math.round(x.apiRequests/max*100))+'%"></div></div>').join('');const sum=key=>days.reduce((a,x)=>a+(Number(x[key])||0),0);q('access30').textContent=fmt(sum('siteAccesses'));q('requests30').textContent=fmt(sum('apiRequests'));q('success30').textContent=fmt(sum('successfulReadings'));incidents=Array.isArray(d.recentErrors)?d.recentErrors:[];renderIncidents('all');diagnostic(t,incidents);q('dashboard').hidden=false;q('status').textContent='Données actualisées à '+new Date(d.generatedAt).toLocaleString('fr-FR')+'.';}catch(e){q('dashboard').hidden=true;q('status').textContent=e.message}}
q('connect').addEventListener('click',load);q('token').addEventListener('keydown',e=>{if(e.key==='Enter')load()});
</script></main></body></html>`;

async function adminMetricsResponse(request,env) {
  if (!env.ADMIN_TOKEN) return Response.json({error:'admin_not_configured'},{status:503,headers:{'Cache-Control':'no-store'}});
  if (!adminAuthorized(request,env)) return Response.json({error:'unauthorized'},{status:401,headers:{'Cache-Control':'no-store','WWW-Authenticate':'Bearer'}});
  const stub = metricsStub(env);
  if (!stub) return Response.json({error:'metrics_not_configured'},{status:503,headers:{'Cache-Control':'no-store'}});
  const response = await stub.fetch('https://admin-metrics.internal/summary');
  return new Response(response.body,{status:response.status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
}

export default {
  async fetch(request,env,ctx) {
    const url = new URL(request.url);
    if (request.method === 'GET' && url.pathname === '/admin') {
      return new Response(ADMIN_HTML,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Frame-Options':'DENY','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'self'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'"}});
    }
    if (request.method === 'GET' && url.pathname === '/admin/metrics') return adminMetricsResponse(request,env);
    if (url.pathname === '/telemetry/access') {
      const origin = request.headers.get('Origin') || '';
      const headers = corsHeaders(origin);
      if (request.method === 'OPTIONS') {
        if (!ALLOWED_ORIGINS.has(origin)) return new Response(null,{status:403,headers});
        headers['Access-Control-Allow-Methods']='POST, OPTIONS';headers['Access-Control-Allow-Headers']='Content-Type';
        return new Response(null,{status:204,headers});
      }
      if (request.method !== 'POST' || !ALLOWED_ORIGINS.has(origin)) return Response.json({error:'origin'},{status:403,headers});
      const task = recordMetric(env,{kind:'site_access'});
      if (ctx?.waitUntil) ctx.waitUntil(task); else await task;
      return new Response(null,{status:204,headers});
    }

    const started = Date.now();
    const requestId = crypto.randomUUID();
    let response;
    try {
      response = await coreWorker.fetch(request,env,ctx);
    } catch (error) {
      const durationMs = Date.now()-started;
      console.error(JSON.stringify({event:'cristariva_request',requestId,status:500,category:'worker_exception',durationMs,name:error?.name||'Error'}));
      const task = recordMetric(env,{kind:'api_request',success:false,status:500,category:'worker_exception',provider:'worker',code:error?.name||'Error',durationMs,requestId});
      if (ctx?.waitUntil) ctx.waitUntil(task); else await task;
      return Response.json({error:'temporarily_unavailable',requestId},{status:500,headers:{'Cache-Control':'no-store','X-Cristariva-Request-Id':requestId}});
    }

    if (request.method === 'POST') {
      let payload = null;
      try { payload = await response.clone().json(); } catch {}
      const durationMs = Date.now()-started;
      const category = categoryFrom(response.status,payload);
      const success = response.ok;
      const code = String(payload?.error||'').slice(0,80);
      const log = {event:'cristariva_request',requestId,status:response.status,category,durationMs};
      (success ? console.info : console.warn)(JSON.stringify(log));
      const task = recordMetric(env,{kind:'api_request',success,status:response.status,category,provider:'groq',code,durationMs,requestId});
      if (ctx?.waitUntil) ctx.waitUntil(task); else await task;
    }
    return withRequestId(response,requestId);
  }
};