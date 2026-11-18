// Run with: node tests/smoke.test.cjs
// Dependency-free static smoke checks; not a substitute for browser interaction tests.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'assets/app.css'),'utf8');
const js=fs.readFileSync(path.join(root,'assets/app.js'),'utf8');
const headModule=fs.readFileSync(path.join(root,'assets/avatar-heads.js'),'utf8');
const avatarModuleScope={};new Function('window',headModule)(avatarModuleScope);
const headShapes=avatarModuleScope.SocialEyesHeadShapes;
const eyeModule=fs.readFileSync(path.join(root,'assets/avatar-eyes.js'),'utf8');
new Function('window',eyeModule)(avatarModuleScope);
const eyeShapes=avatarModuleScope.SocialEyesEyes;
const faceModule=fs.readFileSync(path.join(root,'assets/avatar-face-parts.js'),'utf8');
new Function('window',faceModule)(avatarModuleScope);
const faceParts=avatarModuleScope.SocialEyesFaceParts;
const hairModule=fs.readFileSync(path.join(root,'assets/avatar-hair.js'),'utf8');
new Function('window',hairModule)(avatarModuleScope);
const hairstyles=avatarModuleScope.SocialEyesHair;
const checks=[
  ['Displayed facial labels match actual artwork',()=>{
    for(const [category,names] of [
      ['Head shape',headShapes.names],
      ['Eye shape',eyeShapes.names],
      ['Eyebrows',faceParts.browNames],
      ['Nose',faceParts.noseNames],
      ['Mouth',faceParts.mouthNames],
      ['Hairstyle',hairstyles.names]
    ]){
      const literal=JSON.stringify(category)+':'+JSON.stringify([...names]);
      assert.ok(js.includes(literal),category+' labels must match art module');
    }
  }],
  ['Complexion is layered under brows, eyes, nose, and mouth',()=>{
    const start=js.indexOf("function avatarSvg()");
    const end=js.indexOf("function creatorKeyboard",start);
    const renderer=js.slice(start,end);
    assert.ok(renderer.includes("+complexion+topHair+''+browMarkup"),'Complexion must render before facial features');
    assert.ok(!renderer.includes("+complexion+facialHair+accessories"),'Complexion must not cover face details');
  }],
  ['Creator category headers expose current selection',()=>{
    assert.match(js,/querySelectorAll\("#creator-categories \.creator-group"\)/);
    assert.match(js,/small\.textContent=selected\.getAttribute\("title"\)/);
  }],
  ['Eye colors stay within natural human shades',()=>{
    assert.doesNotMatch(js,/"Eye color":\[[^\]]*(?:Violet|Purple|Red|Teal)/);
    assert.doesNotMatch(js,/eyeColors=\[[^;]*#9563d3/);
  }],

  ['Hairstyle module parses',()=>new Function(hairModule)],
  ['Hair loads before main renderer',()=>assert.ok(html.indexOf('avatar-hair.js')<html.indexOf('app.js'))],
  ['Ten distinct modular hairstyles',()=>{assert.equal(hairstyles.names.length,10);const styles=hairstyles.names.map((_,i)=>hairstyles.render(i,48,'#442c2c'));assert.equal(new Set(styles.map(x=>x.front+'|'+x.back)).size,10);assert.ok(styles.every(x=>typeof x.front==='string'&&typeof x.back==='string'))}],
  ['Hairstyles are integrated into avatar',()=>assert.match(js,/SocialEyesHair\.render\(/)],

  ['Face-parts module parses',()=>new Function(faceModule)],
  ['Face parts load before renderer',()=>assert.ok(html.indexOf('avatar-face-parts.js')<html.indexOf('app.js'))],
  ['Thirty distinct facial feature variants',()=>{
    for(const [names,draw] of [
      [faceParts.browNames,i=>faceParts.eyebrow(i,133,105,'#332322')],
      [faceParts.noseNames,i=>faceParts.nose(i,150,124)],
      [faceParts.mouthNames,i=>faceParts.mouth(i,150,151,19)]
    ]){assert.equal(names.length,10);assert.equal(new Set(names.map((_,i)=>draw(i))).size,10)}
  }],
  ['Face layers integrated',()=>{for(const method of ['eyebrow','nose','mouth'])assert.ok(js.includes('SocialEyesFaceParts.'+method))}],

  ['Eye module parses',()=>new Function(eyeModule)],
  ['Eye layer loads before main renderer',()=>assert.ok(html.indexOf('avatar-eyes.js')<html.indexOf('app.js'))],
  ['Ten distinct human eye pairs',()=>{assert.equal(eyeShapes.names.length,10);const shapes=eyeShapes.names.map((_,i)=>eyeShapes.pair(i,150,117,17,'#548ac1',0));assert.equal(new Set(shapes).size,10);assert.ok(shapes.every(svg=>!svg.includes('eyebrow')))}],
  ['Eye component is used by avatar renderer',()=>assert.match(js,/SocialEyesEyes\.pair\(/)],
  ['Head module parses',()=>new Function(headModule)],
  ['Head module loads before app',()=>assert.ok(html.indexOf('avatar-heads.js')<html.indexOf('app.js'))],
  ['Ten original head paths are distinct',()=>{assert.equal(headShapes.names.length,10);const paths=headShapes.names.map((_,i)=>headShapes.path(i,150,82,52,62));assert.equal(new Set(paths).size,10);assert.ok(paths.every(p=>p.endsWith('Z')))}],
  ['Avatar renderer uses shared head module',()=>assert.match(js,/SocialEyesHeadShapes\.path\(head,150,top,headW,headH\)/)],

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
  ['Hair geometry covers ten styles',()=>{for(let i=0;i<10;i++)assert.match(hairModule,new RegExp('case '+i+':'))}],
  ['Reduced motion supported',()=>assert.match(css,/prefers-reduced-motion/)],
  ['Color swatches styled',()=>assert.match(css,/\.creator-swatch/)],
  ['Facial geometry variants',()=>{for(const key of ['headContours','SocialEyesFaceParts.eyebrow','SocialEyesFaceParts.nose','SocialEyesFaceParts.mouth'])assert.ok(js.includes(key),key)}],
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
