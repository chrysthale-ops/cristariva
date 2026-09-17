from pathlib import Path
import re
root=Path('.')
# index loader
index=root/'index.html'; html=index.read_text(encoding='utf-8')
loader='<script src="./oracle-amour-data.js?v=1.0"></script>\n<script src="./oracle-amour-integration.js?v=1.0"></script>\n'
if 'oracle-amour-integration.js' not in html:
    html=html.replace('</body>',loader+'</body>',1)
index.write_text(html,encoding='utf-8')
# PWA / Android cache update
sw=root/'service-worker.js'; s=sw.read_text(encoding='utf-8')
s=re.sub(r"const APP_VERSION='[^']+';", "const APP_VERSION='2026.09.17-56';", s, count=1)
s=re.sub(r"const CACHE_NAME='[^']+';", "const CACHE_NAME='cristariva-v56-20260917-oracle-amour';", s, count=1)
m=re.search(r"const SHELL=\[(.*?)\];",s,re.S)
if not m: raise SystemExit('SHELL introuvable')
body=m.group(1)
for a in ['./oracle-amour-data.js','./oracle-amour-integration.js']:
    q="'"+a+"'"
    if q not in body: body+=','+q
s=s[:m.start(1)]+body+s[m.end(1):]
# force refresh for love modules
if 'oracle-amour-data|oracle-amour-integration' not in s:
    marker="  if(/\\/(interpretation-engine-v2|"
    love="  if(/\\/(oracle-amour-data|oracle-amour-integration)\\.js$/.test(url.pathname)){\n    event.respondWith(fetch(request,{cache:'reload'}).then(response=>{\n      if(response.ok){const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(request,copy));}\n      return response;\n    }).catch(()=>caches.match(request,{ignoreSearch:true})));\n    return;\n  }\n\n"
    if marker in s: s=s.replace(marker,love+marker,1)
sw.write_text(s,encoding='utf-8')
assert 'oracle-amour-integration.js' in index.read_text(encoding='utf-8')
assert 'cristariva-v56-20260917-oracle-amour' in sw.read_text(encoding='utf-8')
print('Integration Oracle Amour installée.')
