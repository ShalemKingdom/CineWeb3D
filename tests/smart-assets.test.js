import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readFile,readdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {inspectGLB,commands,ensureRuntime,checkPreservation,validate,optimize,publish} from '../scripts/smart-assets.mjs';
const doc={asset:{version:'2.0'},meshes:[{}],animations:[{channels:[{}]}],cameras:[{}]};
function glb(data=doc,padding=0){let raw=Buffer.from(JSON.stringify({...data,extras:{padding:'x'.repeat(padding)}}));let n=Math.ceil(raw.length/4)*4;let b=Buffer.alloc(20+n,32);b.write('glTF');b.writeUInt32LE(2,4);b.writeUInt32LE(b.length,8);b.writeUInt32LE(n,12);b.writeUInt32LE(0x4e4f534a,16);raw.copy(b,20);return b;}
const validator={validateBytes:async()=>({issues:{numErrors:0,numWarnings:0}})};
async function fixture(fn){let dir=await mkdtemp(join(tmpdir(),'cineasset-'));try{let source=join(dir,'source.glb'),dest=join(dir,'out.glb');await writeFile(source,glb(doc,300));await fn(source,dest,dir);}finally{await rm(dir,{recursive:true,force:true});}}
test('GLB structure and counts',()=>{assert.equal(inspectGLB(glb()).meshes,1);assert.equal(inspectGLB(glb()).animations,1);});
test('rejects broken header and truncated chunks',()=>{assert.throws(()=>inspectGLB(Buffer.from('bad')));let b=glb();b.writeUInt32LE(999,12);assert.throws(()=>inspectGLB(b),/chunk length/);});
test('blocks external resource references',()=>{assert.throws(()=>inspectGLB(glb({...doc,images:[{uri:'https://x.invalid'}]})),/self-contained/);});
test('balanced profile does not simplify',()=>{assert.deepEqual(commands('balanced','meshopt',true),[['resize','--width','1024','--height','1024'],['meshopt']]);});
test('economy profile selects constrained simplification',()=>{assert.deepEqual(commands('economy','draco',false),[['simplify','--ratio','0.65','--error','0.001'],['draco']]);assert.throws(()=>commands('constructor','meshopt',false));});
test('unsupported runtime extensions are rejected',()=>assert.throws(()=>ensureRuntime({extensions:['KHR_texture_basisu']}),/Unsupported/));
test('animation channel loss is detected',()=>assert.throws(()=>checkPreservation(inspectGLB(glb()),inspectGLB(glb({...doc,animations:[]}))),/structure changed/));
test('validator errors fail closed',async()=>{await assert.rejects(validate(glb(),{validateBytes:async()=>({issues:{numErrors:2}})}),/2 errors/);});
test('optimization publishes smaller validated candidate, preserving source',()=>fixture(async(source,dest)=>{const r=await optimize({source,dest,validator,transform:async([cmd,input,output])=>writeFile(output,glb(doc,0))});assert.ok(r.savedBytes>0);assert.equal(r.usedOriginal,false);assert.deepEqual(await readFile(source),glb(doc,300));assert.deepEqual(await readFile(dest),glb());}));
test('larger candidate falls back to original',()=>fixture(async(source,dest)=>{const r=await optimize({source,dest,validator,transform:async([cmd,input,output])=>writeFile(output,glb(doc,500))});assert.equal(r.usedOriginal,true);assert.deepEqual(await readFile(dest),await readFile(source));}));
test('budget rejection leaves no partial output',()=>fixture(async(source,dest,dir)=>{await assert.rejects(optimize({source,dest,maxMiB:.00001,validator,transform:async([cmd,input,output])=>writeFile(output,glb())}),/budget/);assert.deepEqual(await readdir(dir),['source.glb']);}));
test('transform errors clean staging directory',()=>fixture(async(source,dest,dir)=>{await assert.rejects(optimize({source,dest,validator,transform:async()=>{throw Error('tool failed');}}),/tool failed/);assert.deepEqual(await readdir(dir),['source.glb']);}));
test('publish validates and refuses overwrite',()=>fixture(async(source,dest)=>{await publish({source,dest,validator});await assert.rejects(publish({source,dest,validator}),{code:'EEXIST'});assert.deepEqual(await readFile(dest),await readFile(source));}));
test('publish rejects scene without camera',()=>fixture(async(source,dest)=>{await writeFile(source,glb({...doc,cameras:[]}));await assert.rejects(publish({source,dest,validator}),/camera/);}));
