const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const worker=fs.readFileSync(path.join(__dirname,'..','cloudflare','groq-worker.mjs'),'utf8');

test('Groq HTTP 429 is exposed as rate_limit, not provider_unavailable',()=>{
  assert.match(worker,/response\.status===429\?\{status:429,error:'rate_limit'\}:\{status:502,error:'provider_unavailable'\}/);
  assert.doesNotMatch(worker,/status:response\.status===429\?429:502,error:'provider_unavailable'/);
});

test('Cloudflare limiter also exposes rate_limit on HTTP 429',()=>{
  assert.match(worker,/Response\.json\(\{error:'rate_limit'\},\{status:429\}\)/);
});
