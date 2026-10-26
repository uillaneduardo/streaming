const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

const initial=read('apps/api/sql/001_initial.sql');
const fixture=read('tests/fixtures/demo-catalog.sql');
const migration=read('scripts/migrate.sh');
const compose=read('compose.yml');
const web=read('apps/web/app.js');
const deploy=read('scripts/deploy-verify.sh');

assert.match(initial,/CREATE TABLE IF NOT EXISTS series /);
assert.doesNotMatch(initial,/\bINSERT\s+(?:IGNORE\s+)?INTO\s+(?:teams|series|seasons|episodes|banners|home_sections)\b/i,
 'Schema migration must not reintroduce sample catalogue rows');
for(const table of ['teams','series','seasons','episodes','banners','home_sections']){
 assert.match(fixture,new RegExp('INSERT IGNORE INTO '+table+'\\b'),
  'CI demo fixture is missing table '+table);
}
assert.match(migration,/CREATE TABLE IF NOT EXISTS schema_migrations/);
assert.match(migration,/legacy_tables.*"7"/,'Old production schemas must be baselined');
assert.match(migration,/digest.*sha256sum/);
assert.match(migration,/recorded.*digest/,'Immutable migration checksums enforced');
assert.match(compose,/scripts\/migrate\.sh:.*cenalivre-migrate:ro/,
 'Production migrator must run tracking script');
assert.doesNotMatch(compose,/for sql in \/migrations\/\*\.sql/,'Do not replay migrations blindly');
assert.match(web,/let publicData=hosted\?emptyState\(\):db/);
assert.match(web,/studioData=\{\.\.\.emptyState\(\),\.\.\.payload/);
assert.doesNotMatch(web,/studioData=\{\.\.\.initial\(\)/);
assert.match(web,/if\(hosted\)return;/,'Hosted app must not write offline demo data');
assert.match(deploy,/docker compose run --rm migrate/,'Deploy must invoke migration runner');
console.log('OK: schema/fixtures separated, migrations tracked, hosted demo fallback disabled');
