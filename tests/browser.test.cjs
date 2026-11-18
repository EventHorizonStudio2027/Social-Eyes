// Run with: npm install --no-save playwright && npx playwright install chromium
// Then: node tests/browser.test.cjs
// Exercises real browser DOM, SVG rendering, local persistence, and mobile layout.
const assert=require('node:assert/strict');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png'};
const server=http.createServer((req,res)=>{
  let pathname;
  try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400).end();return}
  const target=path.resolve(root,'.'+pathname);
  if(target!==root&&!target.startsWith(root+path.sep)){res.writeHead(403).end();return}
  const file=target===root?path.join(root,'index.html'):target;
  fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end();return}res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data)});
});
async function main(){
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const port=server.address().port;
 const browser=await chromium.launch({headless:true});
 try{
  for(const viewport of [{width:390,height:844},{width:1280,height:800}]){
   const page=await browser.newPage({viewport});
   const errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   await page.goto('http://127.0.0.1:'+port+'/index.html#profile');
   await page.waitForSelector('#character-render svg');
   assert.equal(await page.locator('#character-render svg').count(),1,'Avatar SVG exists');
   assert.equal(await page.locator('#character-render .avatar-eye').count(),2,'Two eyes rendered');
   assert.equal(await page.locator('#character-render [data-nose]').count(),1,'Nose rendered');
   assert.equal(await page.locator('#character-render [data-mouth]').count(),1,'Mouth rendered');
   const before=await page.locator('#character-render svg').evaluate(el=>el.outerHTML);
   await page.locator('[data-creator-category="Head shape"][data-creator-option="1"]').click();
   const after=await page.locator('#character-render svg').evaluate(el=>el.outerHTML);
   assert.notEqual(after,before,'Changing head shape changes avatar');
   await page.locator('#creator-undo').click();
   assert.equal(await page.locator('#character-render svg').evaluate(el=>el.outerHTML),before,'Undo restores prior SVG');
   await page.locator('#creator-categories details').filter({has:page.locator('summary', {hasText:'Eye shape'})}).locator('summary').click();
   await page.locator('[data-creator-category="Eye shape"][data-creator-option="2"]').click();
   assert.equal(await page.locator('#character-render [data-eye-style="2"]').count(),2,'Eye selection updates both eyes');
   // Exercise every modular face and hairstyle choice in the real browser.
   for(const category of ['Head shape','Eye shape','Eyebrows','Nose','Mouth','Hairstyle']){
    const detail=page.locator('#creator-categories details').filter({has:page.locator('summary',{hasText:category})});
    if(!(await detail.evaluate(node=>node.open)))await detail.locator('summary').click();
    const seen=new Set();
    for(let option=0;option<10;option++){
     await detail.locator('[data-creator-category="'+category+'"][data-creator-option="'+option+'"]').click();
     const svg=await page.locator('#character-render svg').evaluate(el=>el.outerHTML);
     assert.match(svg,/<svg[\s>]/,'Valid avatar SVG');
     seen.add(svg);
    }
    assert.equal(seen.size,10,category+' must have ten visibly distinct SVG states');
   }
   // Cross-category composition checks: verify all face parts remain mounted
   // while head, hair, complexion, and accessories change together.
   const combinations=[
    {'Head shape':0,'Hairstyle':9,'Eye shape':4,'Eyebrows':7,'Nose':3,'Mouth':8,'Complexion':5,'Accessories':1},
    {'Head shape':8,'Hairstyle':2,'Eye shape':9,'Eyebrows':2,'Nose':9,'Mouth':1,'Complexion':2,'Accessories':6},
    {'Head shape':4,'Hairstyle':6,'Eye shape':0,'Eyebrows':9,'Nose':5,'Mouth':6,'Complexion':8,'Accessories':3}
   ];
   for(const combo of combinations){
    for(const [category,option] of Object.entries(combo)){
     const detail=page.locator('#creator-categories details').filter({has:page.locator('summary',{hasText:category})});
     if(!(await detail.evaluate(node=>node.open)))await detail.locator('summary').click();
     await detail.locator('[data-creator-category="'+category+'"][data-creator-option="'+option+'"]').click();
    }
    assert.equal(await page.locator('#character-render .avatar-eye').count(),2,'Both eyes survive mixed customization');
    assert.equal(await page.locator('#character-render [data-nose]').count(),1,'Nose survives mixed customization');
    assert.equal(await page.locator('#character-render [data-mouth]').count(),1,'Mouth survives mixed customization');
    const geometry=await page.locator('#character-render svg').evaluate(el=>el.outerHTML);
    assert.doesNotMatch(geometry,/NaN|undefined|Infinity/,'Combined avatar contains valid numeric geometry');
    for(const [category,option] of Object.entries(combo)){
     const button=page.locator('[data-creator-category="'+category+'"][data-creator-option="'+option+'"]');
     assert.equal(await button.getAttribute('aria-pressed'),'true','Selection state remains accurate for '+category);
    }
   }
   // Restore eye style 2 before verifying saved persistence.
   await page.locator('[data-creator-category="Eye shape"][data-creator-option="2"]').click();
   await page.locator('#creator-save').click();
   await page.reload();
   await page.waitForSelector('#character-render svg');
   assert.equal(await page.locator('#character-render [data-eye-style="2"]').count(),2,'Saved avatar persists after reload');
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+2);
   assert.equal(overflow,false,'No page-level horizontal overflow');
   assert.deepEqual(errors,[],'No browser JavaScript exceptions');
   await page.close();
  }
  process.stdout.write('PASS browser avatar interactions, persistence, mobile and desktop rendering\\n');
 }finally{await browser.close()}
}
main().catch(error=>{console.error(error);process.exitCode=1}).finally(()=>server.close());
