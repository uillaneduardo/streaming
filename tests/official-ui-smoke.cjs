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

for(const component of ['editorialPanel','editorialToolbar','editorialActions','editorialRows',
 'refreshEditorialPanel','openSectionEditor','persistSection','moveEditorialSection',
 'prepareEditorialOperation','runEditorialOperation']){
 assert.ok(js.includes('function '+component+'(')||js.includes('async function '+component+'('),
   'Missing editorial management '+component);
}
for(const marker of ['data-editorial-search','data-editorial-filter','data-editorial-row',
 'data-editorial-select-all','editorial-section-form','editorial-reschedule-form',
 'editorial-confirm','editorial-move','/api/v1/studio/calendar/reschedule',
 '/api/v1/studio/editorial/bulk','/api/v1/studio/sections/order']){
 assert.ok(js.includes(marker),'Missing editorial action '+marker);
}
assert.match(css,/\.admin \.modal \.form-grid\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/,
 'Modal has flexible form columns');
assert.match(css,/\.admin \.input,.admin \.select,.admin \.textarea/,
 'Inputs share improved padding and line height');
assert.match(css,/\.cms-panel-head/,'CMS actions responsive');
assert.match(css,/\.cms-table/,'CMS listing style present');
console.log('CMS, banners, editorial calendar and form spacing: OK');

for(const feature of ['function artworkImage(','function openSeriesArtwork(','series-artwork',
 'data-artwork-fallback','data-artwork-kind','hero-artwork-img',
 'poster-image','series-poster-wrap','home-episode-image','artwork-unavailable',
 'function studioIcon(','const studioIconShapes=',"studioIcon('images')"]){
 assert.ok(js.includes(feature),'Missing artwork/icon feature: '+feature);
}
for(const icon of ['layout-dashboard','clapperboard','layers','play','images','calendar-days',
 'panels-top-left','users','settings','external-link','log-out','menu','x','pencil','upload']){
 assert.ok(js.includes("'"+icon+"':")||js.includes("'"+icon+"'"),'Studio icon missing '+icon);
}
assert.match(css,/\.hero \.hero-artwork/,'Hero artwork geometry');
assert.match(css,/\.poster-img>\.poster-image/,'Posters must show real img tags');
assert.match(css,/\.artwork-unavailable/,'Unresolved broken files need a fallback');
assert.match(css,/\.studio-icon/,'Unified Studio icon style');
assert.ok(!js.includes('style="background-image:${heroImg(s.poster)}"'),
 'Series cards must not rely on empty CSS backgrounds');
console.log('Referências de mídias, fallback visual e ícones Studio: OK');

for(const part of [
 'function invitationList(','function inviteModal(','function invitePage(',
 'function createInvitation(','function acceptInvitation(',
 'function lookupInvite(','function revokeInvitation(',
 "if(route.parts[0]==='convite')",
 "if(action==='invite-open')",
 "if(action==='invite-copy')",
 "if(action==='invite-revoke')",
 "if(action==='invite-login')",
 "if(action==='invite-accept-existing')",
 '/api/v1/studio/invitations',
 '/api/v1/invitations/accept',
 '/api/v1/invitations/lookup'
]){
 assert.ok(js.includes(part),'Missing team invitation UI contract: '+part);
}
assert.ok(!js.includes("localStorage.setItem('invite"),
 'One-time invitation token must not be stored in localStorage');
console.log('M1 team invitations and secure acceptance UI contracts: OK');
