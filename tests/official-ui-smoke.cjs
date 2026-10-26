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
assert.match(css,/\.form-surface-light \.input/);
assert.match(css,/\.auth-panel \.input/);
assert.match(js,/class="modal form-surface-light"/);
assert.match(js,/auth-panel form-surface-light/);
for(const type of ['series','teams','members','seasons','episodes'])assert.ok(js.includes("type==='"+type+"'"),'missing UI handler '+type);
assert.match(js,/\/api\/v1\/studio\/settings/);
assert.ok(!html.includes('<style>') && !html.includes('<script>'));
const files=fs.readdirSync(path.join(root,'assets')).filter(x=>x.endsWith('.svg'));
assert.equal(files.length,24);
for(const file of files){
 const svg=fs.readFileSync(path.join(root,'assets',file),'utf8');
 assert.match(svg,/<svg/);assert.match(svg,/<\/svg>/);
}
for(const filename of ['orbital-poster.svg','atlas-poster.svg','mares-poster.svg','lendas-poster.svg','cidade-poster.svg','orbital-banner.svg','episode-01.svg','episode-14.svg']) assert.ok(files.includes(filename),'missing '+filename);
console.log('OK: UI oficial preservada, home em grade, navegação e 24 imagens locais');

assert.match(js,/function openMediaPicker\(/);
assert.match(js,/function mediaAdmin\(/);
assert.match(js,/function mediaUploadModal\(/);
assert.match(js,/function mediaField\(/);
assert.match(js,/function updateMediaPicker\(/);
assert.match(js,/media-picker-file/);
assert.match(js,/media-tag-filter/);
assert.match(js,/upload-settings-form/);
assert.match(js,/el\.classList\.contains\('modal-backdrop'\)&&e\.target!==el/);
assert.match(js,/el\.classList\.contains\('media-picker-backdrop'\)&&e\.target!==el/);
assert.match(css,/\.media-picker-panel/);
assert.match(css,/\.media-grid/);
console.log('Mídias, seletor e política de fechamento de modal: OK');

assert.match(js,/function uploadInlineMedia\(/,'Inline form upload');
assert.match(js,/function uploadProgressRequest\(/,'Real upload progress handler');
assert.match(js,/new XMLHttpRequest\(\)/,'Browser upload progress events');
assert.match(js,/xhr\.upload\.onprogress/,'Upload progress feedback');
assert.match(js,/class="media-inline-thumb"/,'Thumbnail field');
assert.match(js,/class="media-inline-file"/,'Direct media file input');
assert.match(js,/media-tile-overlay/,'Thumbnail quick actions');
assert.match(js,/media-overlay-action/,'Edit and delete image actions');
for(const id of ['settings-identidade','settings-marca','settings-reproducao','settings-uploads','settings-seguranca']){
 assert.ok(js.includes(id),'missing settings category: '+id);
}
assert.match(css,/\.media-inline-card/);
assert.match(css,/\.media-tile-overlay/);
assert.match(css,/\.settings-category/);
const nginx=fs.readFileSync(path.join(root,'nginx.conf'),'utf8');
assert.match(nginx,/client_max_body_size 21m/,'Nginx upload limit must match API maximum');
console.log('Inline uploads, UX and reverse-proxy limit: OK');

assert.match(js,/frontendVersion=/,'Version status is rendered');
assert.match(js,/publicLoadState='error'/,'API failures show an error instead of stale demo data');
assert.match(js,/ensureYouTubeAPI\(/,'Official iframe API is used');
assert.match(js,/toggleYouTubePlayback\(/,'Minimal play pause control');
assert.match(js,/player-minimal-bar/,'Compact controls exist');
assert.match(js,/Próximo episódio/,'Next-episode action belongs to portal');
assert.match(css,/\.player-minimal-bar/,'Player stylesheet');
const dockerfile=fs.readFileSync(path.join(root,'Dockerfile'),'utf8');
assert.match(dockerfile,/version\.json/,'Image includes version manifest');
assert.match(dockerfile,/\?v=\$\{fingerprint\}/,'HTML uses fingerprinted assets');
assert.match(nginx,/Cache-Control "no-store, no-cache/,'Nginx must disable caching for app shell');
console.log('Version handshake, stale catalogue protection and player controls: OK');

for(const type of ['series','seasons','episodes']){
 assert.match(js,new RegExp("function "+type+"Admin\\(\\)"),type+' manager exists');
 assert.ok(js.includes("data-catalog-table"),'editorial table');
}
for(const action of ['delete-series','delete-season','delete-episode','catalog-confirm-delete','catalog-clear']){
 assert.ok(js.includes(action),'missing editorial action '+action);
}
assert.match(js,/data-catalog-search/);
assert.match(js,/data-catalog-filter/);
assert.match(js,/function refreshCatalogTable/);
assert.match(js,/function openCatalogDelete/);
assert.match(css,/\.catalog-toolbar/);
assert.match(css,/\.catalog-row-actions/);
for(const forbidden of ['homelab','MariaDB','Sessão autenticada','Docker']){
 assert.ok(!js.includes(forbidden),'Technical UI copy must not mention '+forbidden);
}
console.log('CRUD de séries, temporadas e episódios, filtros e copy limpa: OK');

for(const marker of ['catalogSelection','catalogCheckbox','data-bulk-row',
 'data-bulk-select-all','data-bulk-action','data-action="bulk-apply"',
 'bulk-confirm','function openBulkConfirmation','function performBulkOperation',
 'function syncCatalogSelection','catalogStatuses.seasons']){
 assert.ok(js.includes(marker),'Bulk Studio control missing: '+marker);
}
assert.match(css,/\.catalog-bulk-bar/,'Bulk toolbar styled');
assert.match(css,/\.catalog-checkbox/,'Selection styled');
assert.match(js,/\/api\/v1\/studio\/bulk/,'Bulk operations use backend');
console.log('Ações em lote, seleção filtrada e confirmação: OK');
