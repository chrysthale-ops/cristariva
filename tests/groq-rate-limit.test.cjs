const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const worker=fs.readFileSync(path.join(root,'cloudflare','groq-worker.mjs'),'utf8');
const config=JSON.parse(fs.readFileSync(path.join(root,'cloudflare','wrangler.jsonc'),'utf8'));

test('Groq HTTP 429 is exposed as rate_limit with provider source metadata',()=>{
  assert.match(worker,/response\.status===429/);
  assert.match(worker,/error:'rate_limit',rateLimitSource:'groq'/);
  assert.doesNotMatch(worker,/status:response\.status===429\?429:502,error:'provider_unavailable'/);
});

test('Groq 429 may retry once when retry-after is short enough',()=>{
  assert.match(worker,/parseRetryAfter/);
  assert.match(worker,/retryAfterMs>0&&first\.retryAfterMs<=5000/);
  assert.match(worker,/await sleep\(first\.retryAfterMs\)/);
  assert.match(worker,/retried=true/);
});

test('Groq quota metadata is preserved for diagnosis',()=>{
  assert.match(worker,/x-ratelimit-remaining-requests/);
  assert.match(worker,/x-ratelimit-remaining-tokens/);
  assert.match(worker,/x-ratelimit-reset-requests/);
  assert.match(worker,/x-ratelimit-reset-tokens/);
  assert.match(worker,/retryAfterMs/);
});

test('Cloudflare limiter exposes its own source on HTTP 429',()=>{
  assert.match(worker,/Response\.json\(\{error:'rate_limit',rateLimitSource:'cloudflare',retried:false\},\{status:429\}\)/);
});

test('Cloudflare limiter allows 18 requests per minute in production and preview',()=>{
  assert.equal(config.ratelimits[0].simple.limit,18);
  assert.equal(config.ratelimits[0].simple.period,60);
  assert.equal(config.previews.ratelimits[0].simple.limit,18);
  assert.equal(config.previews.ratelimits[0].simple.period,60);
});
