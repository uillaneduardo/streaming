const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root=path.join(__dirname,'..','apps','web');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const js=fs.readFileSync(path.join(root,'app.js'),'utf8');
const css=fs.readFileSync(path.join(root,'styles.css'),'utf8');
assert.match(html,/href="\.\/styles\.css"/);
assert.match(html,/src="\.\/app\.js"/);
assert.match(html,/id="app"/);
assert.match(js,/\/api\/v1\/public\/bootstrap/);
assert.match(js,/let homeView='grid'/);
assert.match(js,/catalogView=/);
assert.match(js,/function studioPage\(/);
assert.match(js,/function watchPage\(/);
assert.match(js,/function homeSwitch\(/);
assert.match(css,/home-episodes/);
assert.ok(!html.includes('<style>') && !html.includes('<script>'));
const files=fs.readdirSync(path.join(root,'assets')).filter(x=>x.endsWith('.svg'));
assert.equal(files.length,24);
for(const file of files){
 const svg=fs.readFileSync(path.join(root,'assets',file),'utf8');
 assert.match(svg,/<svg/);assert.match(svg,/<\/svg>/);
}
for(const filename of ['orbital-poster.svg','atlas-poster.svg','mares-poster.svg','lendas-poster.svg','cidade-poster.svg','orbital-banner.svg','episode-01.svg','episode-14.svg']) assert.ok(files.includes(filename),'missing '+filename);
console.log('OK: UI oficial preservada, home em grade, navegação e 24 imagens locais');
