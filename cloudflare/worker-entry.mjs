import coreWorker from './groq-worker.mjs';

const ALLOWED_ORIGINS = new Set(['https://cristariva.netlify.app','https://chrysthale-ops.github.io']);
const DAY_MS = 86400000;
const HISTORY_DAYS = 60;

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
      const state = await this.ctx.storage.get('state') || {totals:emptyTotals(),daily:{},recentErrors:[]};
      return Response.json(this.publicSummary(state));
    }
    return Response.json({error:'not_found'},{status:404});
  }

  async record(event) {
    const state = await this.ctx.storage.get('state') || {totals:emptyTotals(),daily:{},recentErrors:[]};
    state.totals = {...emptyTotals(),...state.totals};
    state.daily ||= {};
    state.recentErrors ||= [];
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
          requestId:String(event.requestId||'').slice(0,80)
        });
        state.recentErrors = state.recentErrors.slice(0,50);
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
        transactions:totals.transactions,
        revenueCents:totals.revenueCents
      },
      daily,
      recentErrors:state.recentErrors||[],
      privacy:'aggregate_only'
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
:root{color-scheme:dark;--bg:#071321;--panel:#0d2035;--gold:#c7a86b;--text:#f5f1e8;--muted:#a9b4c3;--bad:#ef8c8c;--good:#8ed6b0}*{box-sizing:border-box}body{margin:0;font-family:system-ui,-apple-system,Segoe UI,sans-serif;background:radial-gradient(circle at 80% 0,#183755 0,#071321 45%);color:var(--text);min-height:100vh}main{max-width:1180px;margin:auto;padding:34px 22px 60px}h1{font-family:Georgia,serif;letter-spacing:.08em;color:var(--gold);margin:0}header p{color:var(--muted);margin:.4rem 0 1.8rem}.login,.panel,.card{background:rgba(13,32,53,.88);border:1px solid rgba(199,168,107,.32);border-radius:18px;box-shadow:0 18px 50px #0005}.login{padding:20px;display:flex;gap:10px;align-items:end;margin-bottom:22px}.login label{flex:1;color:var(--muted);font-size:.9rem}.login input{width:100%;margin-top:7px;padding:12px;border-radius:10px;border:1px solid #496077;background:#06111d;color:white}.login button,button{padding:12px 18px;border-radius:10px;border:1px solid var(--gold);background:var(--gold);color:#102034;font-weight:700;cursor:pointer}.status{min-height:24px;color:var(--muted)}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.card{padding:18px}.card span{display:block;color:var(--muted);font-size:.82rem}.card strong{font-size:1.8rem;display:block;margin-top:7px}.good{color:var(--good)}.bad{color:var(--bad)}.panel{padding:20px;margin-top:16px}.panel h2{font-size:1rem;color:var(--gold);margin-top:0}.bars{display:flex;align-items:end;gap:5px;height:145px;border-bottom:1px solid #365067;padding-top:12px}.bar{flex:1;min-width:5px;background:#5f86aa;border-radius:4px 4px 0 0;position:relative}.bar:hover:after{content:attr(data-tip);position:absolute;bottom:100%;left:50%;transform:translateX(-50%);background:#020912;padding:5px 7px;border-radius:5px;white-space:nowrap;font-size:.72rem}.errors{width:100%;border-collapse:collapse}.errors th,.errors td{text-align:left;border-bottom:1px solid #294158;padding:9px 6px;font-size:.86rem}.errors th{color:var(--muted)}.future{opacity:.72}@media(max-width:800px){.grid{grid-template-columns:repeat(2,1fr)}.login{display:block}.login button{margin-top:10px;width:100%}}@media(max-width:470px){.grid{grid-template-columns:1fr}}
</style></head><body><main><header><h1>CRISTARIVA</h1><p>Plateforme d'administration — activité, fiabilité et préparation de la facturation</p></header>
<section class="login"><label>Jeton administrateur<input id="token" type="password" autocomplete="current-password" placeholder="ADMIN_TOKEN"></label><button id="connect">Afficher les données</button></section><div id="status" class="status"></div>
<section id="dashboard" hidden><div class="grid"><div class="card"><span>Accès enregistrés</span><strong id="access">—</strong></div><div class="card"><span>Demandes au moteur</span><strong id="requests">—</strong></div><div class="card"><span>Lectures réussies</span><strong id="success" class="good">—</strong></div><div class="card"><span>Anomalies</span><strong id="errors" class="bad">—</strong></div><div class="card"><span>Limites atteintes</span><strong id="limited">—</strong></div><div class="card"><span>Indisponibilités fournisseur</span><strong id="provider">—</strong></div><div class="card"><span>Latence moyenne du Worker</span><strong id="latency">—</strong></div><div class="card future"><span>Transactions (préparation)</span><strong id="transactions">0</strong></div></div>
<div class="panel"><h2>Activité des 30 derniers jours</h2><div id="bars" class="bars"></div></div>
<div class="panel"><h2>Anomalies récentes — aucune question, contexte ou adresse IP n'est conservé</h2><div style="overflow:auto"><table class="errors"><thead><tr><th>Date</th><th>Statut</th><th>Catégorie</th><th>Identifiant</th></tr></thead><tbody id="errorRows"></tbody></table></div></div>
<div class="panel future"><h2>Facturation — préparée pour une évolution ultérieure</h2><p>Transactions : <b id="billingTransactions">0</b> · Chiffre d'affaires suivi : <b id="revenue">0,00 €</b>. Aucun paiement n'est traité par cette version.</p></div></section>
<script>
const q=id=>document.getElementById(id);const fmt=n=>new Intl.NumberFormat('fr-FR').format(n||0);const money=c=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format((c||0)/100);
async function load(){const token=q('token').value.trim();if(!token){q('status').textContent='Saisissez le jeton administrateur.';return}sessionStorage.setItem('cristariva-admin-token',token);q('status').textContent='Chargement…';try{const r=await fetch('/admin/metrics',{headers:{Authorization:'Bearer '+token},cache:'no-store'});if(!r.ok)throw new Error(r.status===401?'Jeton refusé.':'Erreur '+r.status);const d=await r.json(),t=d.totals;q('access').textContent=fmt(t.siteAccesses);q('requests').textContent=fmt(t.apiRequests);q('success').textContent=fmt(t.successfulReadings);q('errors').textContent=fmt(t.anomalies);q('limited').textContent=fmt(t.rateLimited);q('provider').textContent=fmt(t.providerUnavailable);q('latency').textContent=fmt(t.averageLatencyMs)+' ms';q('transactions').textContent=fmt(t.transactions);q('billingTransactions').textContent=fmt(t.transactions);q('revenue').textContent=money(t.revenueCents);const days=(d.daily||[]).slice(-30),max=Math.max(1,...days.map(x=>x.apiRequests));q('bars').innerHTML=days.map(x=>'<div class="bar" style="height:'+Math.max(2,Math.round(x.apiRequests/max*100))+'%" data-tip="'+x.date+' : '+x.apiRequests+'"></div>').join('');q('errorRows').innerHTML=(d.recentErrors||[]).map(e=>'<tr><td>'+e.at.replace('T',' ').slice(0,19)+'</td><td>'+e.status+'</td><td>'+e.category+'</td><td>'+e.requestId+'</td></tr>').join('')||'<tr><td colspan="4">Aucune anomalie enregistrée.</td></tr>';q('dashboard').hidden=false;q('status').textContent='Données actualisées à '+new Date(d.generatedAt).toLocaleString('fr-FR')+'.';}catch(e){q('dashboard').hidden=true;q('status').textContent=e.message}}
q('connect').addEventListener('click',load);q('token').addEventListener('keydown',e=>{if(e.key==='Enter')load()});const saved=sessionStorage.getItem('cristariva-admin-token');if(saved){q('token').value=saved;load()}
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
      const task = recordMetric(env,{kind:'api_request',success:false,status:500,category:'worker_exception',durationMs,requestId});
      if (ctx?.waitUntil) ctx.waitUntil(task); else await task;
      return Response.json({error:'temporarily_unavailable',requestId},{status:500,headers:{'Cache-Control':'no-store','X-Cristariva-Request-Id':requestId}});
    }

    if (request.method === 'POST') {
      let payload = null;
      try { payload = await response.clone().json(); } catch {}
      const durationMs = Date.now()-started;
      const category = categoryFrom(response.status,payload);
      const success = response.ok;
      const log = {event:'cristariva_request',requestId,status:response.status,category,durationMs};
      (success ? console.info : console.warn)(JSON.stringify(log));
      const task = recordMetric(env,{kind:'api_request',success,status:response.status,category,durationMs,requestId});
      if (ctx?.waitUntil) ctx.waitUntil(task); else await task;
    }
    return withRequestId(response,requestId);
  }
};
