import {readFile, writeFile, mkdir, mkdtemp, rm, link, stat} from 'node:fs/promises';
import {resolve, dirname, join} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {parseArgs} from 'node:util';
import {createHash} from 'node:crypto';
const root=fileURLToPath(new URL('../',import.meta.url));
const tools=join(root,'tools/assets');
const require=createRequire(join(tools,'package.json'));
const MAX=100*1024*1024;
export const profiles=Object.freeze({ cinematic:{texture:2048,ratio:1}, balanced:{texture:1024,ratio:1}, economy:{texture:512,ratio:.65} });
export function inspectGLB(bytes){
 if(!Buffer.isBuffer(bytes)||bytes.length<20||bytes.length>MAX||bytes.toString('ascii',0,4)!=='glTF'||bytes.readUInt32LE(4)!==2||bytes.readUInt32LE(8)!==bytes.length)throw Error('Invalid GLB header or input limit');
 let offset=12,doc,bin=false;
 while(offset<bytes.length){if(offset+8>bytes.length)throw Error('Truncated chunk header');const n=bytes.readUInt32LE(offset),type=bytes.readUInt32LE(offset+4);offset+=8;if(n%4||offset+n>bytes.length)throw Error('Invalid chunk length');if(!doc){if(type!==0x4e4f534a||n>16*1024*1024)throw Error('Invalid JSON chunk');doc=JSON.parse(bytes.toString('utf8',offset,offset+n));}else{if(type!==0x004e4942||bin)throw Error('Unexpected GLB chunk');bin=true;}offset+=n;}
 if(doc?.asset?.version!=='2.0'||!Array.isArray(doc.meshes)||!doc.meshes.length)throw Error('Expected glTF 2.0 meshes');
 for(const list of [doc.buffers??[],doc.images??[]]){if(!Array.isArray(list)||list.some(v=>Object.hasOwn(v,'uri')))throw Error('Only self-contained GLB resources are accepted');}
 const extensions=doc.extensionsUsed??[];
 if(!Array.isArray(extensions)||extensions.some(x=>typeof x!=='string'))throw Error('Invalid extensions');
 return {bytes:bytes.length,meshes:doc.meshes.length,animations:doc.animations?.length??0,cameras:doc.cameras?.length??0,animationChannels:(doc.animations??[]).map(a=>a.channels?.length??0),textures:doc.textures?.length??0,extensions,required:doc.extensionsRequired??[]};
}
async function readModel(path){if((await stat(path)).size>MAX)throw Error('Input exceeds 100 MiB safety limit');const bytes=await readFile(path);return {bytes,info:inspectGLB(bytes)};}
export function ensureRuntime(info){const unsupported=['KHR_texture_basisu','KHR_texture_avif','KHR_meshopt_compression'];if(info.extensions.some(x=>unsupported.includes(x)))throw Error('Unsupported compression for this release; use PNG/JPEG/WebP and EXT_meshopt_compression or Draco');}
export function checkPreservation(before,after){if(after.meshes!==before.meshes||after.cameras!==before.cameras||after.animations!==before.animations||JSON.stringify(after.animationChannels)!==JSON.stringify(before.animationChannels))throw Error('Mesh, camera or animation structure changed');}
export function commands(profile,codec,hasTextures){const p=profiles[profile];if(!Object.hasOwn(profiles,profile)||!['meshopt','draco','none'].includes(codec))throw Error('Invalid profile or codec');const out=[];if(p.ratio<1)out.push(['simplify','--ratio',String(p.ratio),'--error','0.001']);if(hasTextures)out.push(['resize','--width',String(p.texture),'--height',String(p.texture)]);if(codec!=='none')out.push([codec]);return out;}
export async function validate(bytes,validator){const api=validator??require('gltf-validator');const report=await api.validateBytes(new Uint8Array(bytes),{format:'glb',maxIssues:0,externalResourceFunction:()=>Promise.reject(Error('External resource forbidden'))});if(report.issues?.numErrors!==0)throw Error(`Khronos validation failed: ${report.issues?.numErrors??'unknown'} errors`);return report;}
function runTransform(args){const cli=join(tools,'node_modules/@gltf-transform/cli/bin/cli.js');execFileSync(process.execPath,[cli,...args],{stdio:'inherit',timeout:180000});}
function budgetBytes(mib){if(!Number.isFinite(mib)||mib<=0||mib>50)throw Error('Budget must be >0 and <=50 MiB');return Math.floor(mib*1024*1024);}
export async function optimize({source,dest,profile='balanced',codec='meshopt',maxMiB=2,validator,transform=runTransform}){
 const budget=budgetBytes(maxMiB);const original=await readModel(source);ensureRuntime(original.info);await validate(original.bytes,validator);
 const plan=commands(profile,codec,original.info.textures>0);await mkdir(dirname(dest),{recursive:true});const stage=await mkdtemp(join(dirname(dest),'.asset-'));
 try{let input=join(stage,'source.glb');await writeFile(input,original.bytes);for(const [i,[cmd,...flags]] of plan.entries()){const output=join(stage,`step-${i}.glb`);await transform([cmd,input,output,...flags]);input=output;}
  let candidate=await readModel(input);ensureRuntime(candidate.info);checkPreservation(original.info,candidate.info);let report=await validate(candidate.bytes,validator);let usedOriginal=false;
  if(candidate.bytes.length>=original.bytes.length){candidate=original;input=join(stage,'source.glb');report=await validate(candidate.bytes,validator);usedOriginal=true;}
  if(candidate.bytes.length>budget)throw Error('Model exceeds budget after optimization; review profile or source');
  const summary={profile,codecRequested:codec,usedOriginal,before:original.info,after:candidate.info,savedBytes:original.bytes.length-candidate.bytes.length,sha256:createHash('sha256').update(candidate.bytes).digest('hex'),warnings:report.issues.numWarnings??0,warningMessages:(report.issues.messages??[]).filter(m=>m.severity===1).slice(0,30),validation:report.validatorVersion??'Khronos'};
  // Atomic, exclusive output; no source overwrite. Report is emitted to stdout.
  await link(input,dest);return summary;
 }finally{await rm(stage,{recursive:true,force:true});}
}
export async function publish({source,dest=join(root,'public/models/coffee.glb'),maxMiB=2,validator,requireScene=true}){
 const limit=budgetBytes(maxMiB);const model=await readModel(source);ensureRuntime(model.info);if(requireScene&&(!model.info.animations||!model.info.cameras))throw Error('Blender scene needs animation and camera');if(model.bytes.length>limit)throw Error('GLB exceeds budget');const report=await validate(model.bytes,validator);await mkdir(dirname(dest),{recursive:true});const stage=await mkdtemp(join(dirname(dest),'.publish-'));
 try{const file=join(stage,'model.glb');await writeFile(file,model.bytes);await link(file,dest);}finally{await rm(stage,{recursive:true,force:true});}
 return {...model.info,warnings:report.issues.numWarnings??0,sha256:createHash('sha256').update(model.bytes).digest('hex')};
}
async function main(){const [action,...args]=process.argv.slice(2);const {values,positionals}=parseArgs({args,allowPositionals:true,options:{profile:{type:'string',default:'balanced'},codec:{type:'string',default:'meshopt'},'max-mib':{type:'string',default:'2'}}});const [source,dest]=positionals;if(!source||!['inspect','validate','optimize','publish'].includes(action)||positionals.length!==(action==='optimize'?2:1))throw Error('Usage: smart-assets.mjs inspect|validate|publish input.glb OR optimize input.glb output.glb [--profile balanced --codec meshopt --max-mib 2]');let result;if(action==='inspect')result=(await readModel(resolve(source))).info;else if(action==='validate'){const model=await readModel(resolve(source));ensureRuntime(model.info);result=await validate(model.bytes);}else if(action==='optimize')result=await optimize({source:resolve(source),dest:resolve(dest),profile:values.profile,codec:values.codec,maxMiB:Number(values['max-mib'])});else result=await publish({source:resolve(source),maxMiB:Number(values['max-mib'])});console.log(JSON.stringify(result,null,2));}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url)main().catch(e=>{console.error(`Smart Asset Engine: ${e.message}`);process.exitCode=1;});
