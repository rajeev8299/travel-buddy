import fs from 'node:fs';
const base='http://localhost:3200';
const manifest=JSON.parse(fs.readFileSync('web/.next/prerender-manifest.json','utf8'));
const fixture=JSON.parse(fs.readFileSync('qa/api-results.json','utf8')).fixtures;
const paths=new Set([...Object.keys(manifest.routes).filter(p=>!p.startsWith('/_')),'/blog',`/blog/${fixture.slug}`,'/blog/author/qa-travel-author','/blog/tag/qa-test','/blog/category/plan-your-trip','/blog/qa-browser-rich-article-draft','/blog/qa-admin-authored-article','/blog/preview','/admin','/admin/login','/author','/contact','/booking','/not-a-real-page','/places/temples/not-a-place','/index.html']);
const results=[];const localLinks=new Set();let queue=[...paths];
async function inspect(p){try{const r=await fetch(base+p);const html=await r.text();const title=html.match(/<title>([\s\S]*?)<\/title>/)?.[1];const h1=[...html.matchAll(/<h1(?:\s[^>]*)?>/g)].length;const canonical=html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/)?.[1];const robots=html.match(/<meta[^>]+name="robots"[^>]+content="([^"]+)"/)?.[1];const errors=/Application error:|Internal Server Error/.test(html);for(const m of html.matchAll(/<a\b[^>]*href="([^"#]+)"/g)){const u=m[1].replaceAll('&amp;','&');if(u.startsWith('/')&&!u.startsWith('//'))localLinks.add(u.split('?')[0]);}results.push({path:p,status:r.status,title,h1,canonical,robots,errors,bytes:html.length});}catch(e){results.push({path:p,error:e.message});}}
async function worker(){while(queue.length){const p=queue.shift();await inspect(p);}}
await Promise.all(Array.from({length:4},worker));
queue=[...localLinks].filter(p=>!paths.has(p));await Promise.all(Array.from({length:4},worker));
fs.writeFileSync('qa/page-results.json',JSON.stringify({base,results},null,2));
console.log(JSON.stringify({total:results.length,statusCounts:results.reduce((a,r)=>(a[r.status??'error']=(a[r.status??'error']||0)+1,a),{}),non200:results.filter(r=>r.status!==200),missingH1:results.filter(r=>r.status===200&&r.title&&r.h1!==1).map(r=>({path:r.path,h1:r.h1})),errors:results.filter(r=>r.errors)},null,2));
