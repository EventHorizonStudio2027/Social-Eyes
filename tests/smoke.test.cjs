// Run with: node tests/smoke.test.cjs
// Dependency-free static smoke checks; not a substitute for browser interaction tests.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'assets/app.css'),'utf8');
const js=fs.readFileSync(path.join(root,'assets/app.js'),'utf8');
const checks=[
  ['HTML loads extracted styles',()=>assert.match(html,/href="\.\/assets\/app\.css"/)],
  ['HTML loads extracted script',()=>assert.match(html,/src="\.\/assets\/app\.js"/)],
  ['JavaScript parses',()=>new Function(js)],
  ['Avatar creator mounts',()=>assert.match(html,/id="creator-categories"/)],
  ['Three saved-look slots mount',()=>assert.match(html,/id="creator-lookbook"/)],
  ['Backup control mounts',()=>assert.match(html,/id="creator-backup"/)],
  ['Restore input mounts',()=>assert.match(html,/id="creator-restore-file"/)],
  ['PNG export mounts',()=>assert.match(html,/id="creator-export-png"/)],
  ['Lookbook implementation exists',()=>assert.match(js,/function renderLookbook\(/)],
  ['Backup format validation exists',()=>assert.match(js,/social-eyes-avatar-backup/)],
  ['Hair geometry covers ten styles',()=>{for(let i=0;i<10;i++)assert.match(js,new RegExp('case '+i+':'))}],
  ['Reduced motion supported',()=>assert.match(css,/prefers-reduced-motion/)],
  ['Color swatches styled',()=>assert.match(css,/\.creator-swatch/)],
  ['Facial geometry variants',()=>{for(const key of ['browTypes','noseTypes','mouthTypes','headContours','eyeOutline'])assert.ok(js.includes(key),key)}],
  ['Lookbook restore validates data',()=>assert.match(js,/function normalizeLook\(/)],
  ['Avatar data clearing control',()=>{assert.match(html,/id="creator-clear-data"/);assert.match(js,/localStorage\.removeItem\(lookbookKey\)/)}],
  ['Backup file size limited',()=>assert.match(js,/file\.size>100000/)],
  ['Venue dialog has accessible heading',()=>{assert.match(html,/id="venue-dialog"[^>]*aria-labelledby="venue-dialog-title"/);assert.match(html,/id="venue-dialog-close"/)}],
  ['Venue save and wave persistence',()=>{assert.match(js,/sceneStoreKey/);assert.match(js,/waveStoreKey/);assert.match(js,/function saveDemoIds/)}],
  ['Venue details have no live-data claims',()=>assert.match(html,/fictional preview venue/)],
  ['Venue dialog is responsive',()=>assert.match(css,/\.venue-dialog::backdrop/)],
  ['No inline application script',()=>assert.doesNotMatch(html,/<script>([\s\S]*?)<\/script>/)],
];
let failed=0;
for(const [name,fn] of checks){try{fn();process.stdout.write('PASS '+name+'\n')}catch(err){failed++;process.stderr.write('FAIL '+name+': '+err.message+'\n')}}
process.stdout.write((checks.length-failed)+'/'+checks.length+' smoke checks passed\n');
if(failed)process.exitCode=1;
