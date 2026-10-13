// Run against a running server: node tests/http-smoke.mjs
import assert from 'node:assert/strict';
const origin=process.env.TEST_ORIGIN || 'http://127.0.0.1:3000';
const api=process.env.TEST_API_ORIGIN || 'http://127.0.0.1:8017';
const products=await (await fetch(`${api}/api/products/`)).json();
assert.equal(products.length,10,'The approved seed catalogue must remain intact');
const paths=['/','/products','/faq','/contact','/privacy',...products.map(p=>`/products/${p.slug}`)];
const titles=new Set();
for(const path of paths){
  // A crawler user agent forces blocking metadata so head tags can be inspected.
  const response=await fetch(origin+path,{headers:{'User-Agent':'Googlebot'}});
  assert.equal(response.status,200,path);
  const html=await response.text();
  const title=html.match(/<title>(.*?)<\/title>/)?.[1];
  assert.ok(title,path+' title');assert.ok(!titles.has(title),'duplicate title: '+title);titles.add(title);
  assert.match(html,/<meta name="description" content="[^"]+"/);
  assert.ok(html.includes(`rel="canonical" href="${origin}${path==='/'?'':path}`),path+' canonical');
  assert.match(html,/<meta property="og:image"/);assert.match(html,/<meta name="twitter:card"/);
  assert.equal((html.match(/<h1(?: |>)/g)||[]).length,1,path+' one H1');
  assert.ok(!/<meta name="robots" content="[^"]*noindex/.test(html),path+' indexable');
  for(const match of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs))JSON.parse(match[1]);
  console.log('PASS',path);
}
const sitemap=await (await fetch(origin+'/sitemap.xml')).text();
for(const path of paths)assert.ok(sitemap.includes(origin+path) || path==='/');
assert.ok(!sitemap.includes('/admin'));
const robots=await (await fetch(origin+'/robots.txt')).text();assert.ok(robots.includes('Disallow: /admin/'));assert.ok(robots.includes(origin+'/sitemap.xml'));
assert.equal((await fetch(origin+'/products/not-a-real-product')).status,404);
assert.equal((await fetch(origin+'/api/enquiry',{method:'POST',headers:{Origin:'https://other.invalid','Content-Type':'application/json'},body:'{}'})).status,403);
assert.equal((await fetch(origin+'/api/enquiry',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:'{}'})).status,400);
console.log('PASS sitemap, robots, unknown product and enquiry origin/validation');
