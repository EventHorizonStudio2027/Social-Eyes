#!/usr/bin/env node
/** Dependency-free audit of the legacy web avatar art modules and integration. */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(resolve(root,path),'utf8');
const files = ['avatar-heads.js','avatar-eyes.js','avatar-face-parts.js','avatar-hair.js'];
const sandbox = { window: {} };
vm.createContext(sandbox);
const failures=[];
const check=(name,fn)=>{try{fn();console.log('PASS '+name)}catch(e){failures.push(name);console.error('FAIL '+name+': '+e.message)}};
for(const file of files) check('load '+file,()=>vm.runInContext(read('assets/'+file),sandbox,{timeout:1000,filename:file}));
const w=sandbox.window;
const html=read('index.html'),js=read('assets/app.js');
const modules=[
 ['heads',w.SocialEyesHeadShapes,'names','path'],
 ['eyes',w.SocialEyesEyes,'names','pair'],
 ['hair',w.SocialEyesHair,'names','render']
];
for(const [label,mod,names,renderer] of modules) check(label+' exposes 10 variants',()=>{
 if(!mod || !Array.isArray(mod[names]) || mod[names].length!==10 || typeof mod[renderer]!=='function') throw Error('missing or incomplete module');
 if(new Set(mod[names]).size!==10) throw Error('duplicate labels');
});
check('facial parts expose ten options per category',()=>{
 const m=w.SocialEyesFaceParts;
 if(!m)throw Error('missing facial part module');
 for(const key of ['browNames','noseNames','mouthNames']){
  if(!Array.isArray(m[key])||m[key].length!==10||new Set(m[key]).size!==10)throw Error(key+' incomplete');
 }
});
check('avatar modules load before renderer',()=>{
 for(const file of files) {
  const a=html.indexOf('assets/'+file),b=html.indexOf('assets/app.js');
  if(a<0||b<0||a>=b)throw Error(file+' not loaded before app.js');
 }
});
check('creator supports saved looks, backup, restore and export',()=>{
 for(const id of ['creator-lookbook','creator-backup','creator-restore-file','creator-export-png'])
  if(!html.includes('id="'+id+'"'))throw Error('missing '+id);
 for(const symbol of ['renderLookbook','normalizeLook','social-eyes-avatar-backup'])
  if(!js.includes(symbol))throw Error('missing '+symbol);
});
console.log(JSON.stringify({audit:'web avatar source integration',checks:files.length+modules.length+3,failed:failures.length,verifiedNativeIntegration:false,verifiedVisualQuality:false}));
if(failures.length)process.exitCode=1;
