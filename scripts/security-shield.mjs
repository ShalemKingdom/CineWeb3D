import {readFile,writeFile,mkdir,readdir,lstat,realpath} from 'node:fs/promises';
import {join,resolve,relative,sep} from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {projects,checkAll} from './release-check.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const permissive=new Set(['MIT','Apache-2.0','BSD-2-Clause','BSD-3-Clause','ISC','0BSD','Zlib','BlueOak-1.0.0','PSF-2.0','CC0-1.0','(MIT OR CC0-1.0)']);
const nativeLicenses=new Set(['LGPL-3.0-or-later','Apache-2.0 AND LGPL-3.0-or-later','Apache-2.0 AND LGPL-3.0-or-later AND MIT']);
export function classify(project,p,{stable=false}={}){
 const runtime=project==='.'&&!p.dev;
 if(permissive.has(p.license))return {status:'allowed',scope:runtime?'browser-runtime':'tooling'};
 if(!runtime&&p.license==='MPL-2.0'&&(/^(?:@axe-core\/playwright|axe-core|lightningcss(?:-[a-z0-9-]+)?)$/.test(p.name)))return {status:'notice-required',scope:'tooling'};
 if(!runtime&&nativeLicenses.has(p.license)&&/^@img\/sharp-(?:libvips-[a-z0-9-]+|wasm32|win32-[a-z0-9-]+)$/.test(p.name))return {status:'notice-required',scope:'tooling-native'};
 if(!stable&&project==='.'&&p.dev&&p.name==='sentry'&&p.version==='0.50.0'&&p.license==='FSL-1.1-Apache-2.0')return {status:'sandbox-exception',scope:'tooling',reason:'Lighthouse transitive dependency; no redistribution; remove or resolve before stable'};
 return {status:'blocked',scope:runtime?'browser-runtime':'tooling',reason:'Unapproved, restricted or missing license'};
}
export function safePackagePath(path){
 return typeof path==='string'&&/^(?:node_modules\/(?:@[a-zA-Z0-9_.-]+\/)?[a-zA-Z0-9_.-]+)(?:\/node_modules\/(?:@[a-zA-Z0-9_.-]+\/)?[a-zA-Z0-9_.-]+)*$/.test(path)&&!path.split('/').some(x=>x==='.'||x==='..');
}
const load=async p=>JSON.parse(await readFile(p,'utf8'));
const hash=b=>createHash('sha256').update(b).digest('hex');
async function collectInstalled(base,project,p,out){
 if(!safePackagePath(p.path))throw Error('Unsafe package path: '+p.path);
 const folder=join(base,project,p.path),projectRoot=await realpath(join(base,project));
 let actual;
 try{actual=await realpath(folder);}catch(e){if(e.code==='ENOENT')return {status:p.optional?'optional-not-installed':'missing',files:[]};throw e;}
 if(!actual.startsWith(projectRoot+sep)||!(await lstat(folder)).isDirectory())throw Error('Package path escapes project or is not a directory: '+p.path);
 const manifest=await load(join(folder,'package.json'));
 const files=[];
 for(const entry of await readdir(folder,{withFileTypes:true})){
  if(!entry.isFile()||! /^(licen[cs]e|copying|notice|copyright)(?:[._-].*)?$/i.test(entry.name))continue;
  const full=join(folder,entry.name),info=await lstat(full);
  if(info.size>2*1024*1024)throw Error('Oversized license file: '+p.path);
  const data=await readFile(full),sha256=hash(data);
  const dest=join(out,'texts',sha256+'.txt');
  await mkdir(join(out,'texts'),{recursive:true});await writeFile(dest,data);
  files.push({name:entry.name,sha256,artifact:relative(out,dest)});
 }
 const matches=manifest.name===p.name&&manifest.version===p.version&&manifest.license===p.license;
 return {status:!matches?'metadata-mismatch':files.length?'collected':'no-top-level-notice',actual:{name:manifest.name,version:manifest.version,license:manifest.license??null},files};
}
export async function runShield(base=root,{stable=false,installed=false}={}){
 const out=join(base,'reports','security-shield');await mkdir(out,{recursive:true});
 const checked=await checkAll(base),entries=[],errors=[];
 for(const project of checked){
  errors.push(...project.errors.map(e=>project.project+': '+e));
  for(const p of project.inventory){
   const policy=classify(project.project,p,{stable});
   if(policy.status==='blocked')errors.push(project.project+': '+p.name+'@'+p.version+' '+p.license);
   let evidence=null;
   if(installed){
    try{evidence=await collectInstalled(base,project.project,p,out);}
    catch(e){evidence={status:'error',reason:e.message,files:[]};}
    if(['missing','error','metadata-mismatch'].includes(evidence.status)||(policy.scope==='browser-runtime'&&evidence.status!=='collected'))errors.push(project.project+': '+p.path+' license evidence '+evidence.status);
   }
   entries.push({project:project.project,...p,...policy,evidence});
  }
 }
 const counts={};for(const e of entries)counts[e.status]=(counts[e.status]??0)+1;
 const report={mode:stable?'stable':'sandbox',passed:errors.length===0,counts,errors,entries,manualReviewRequired:true,limitations:'Declared and installed license evidence is not legal clearance; review nested notices, decoder binaries, final distributions, external programs and model/media rights.'};
 await writeFile(join(out,'inventory.json'),JSON.stringify(report,null,2)+'\n');
 console.log('Security & License Shield:',JSON.stringify({mode:report.mode,counts,errors}));
 return report;
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
 const args=process.argv.slice(2);
 if(args.some(a=>!['--stable','--installed'].includes(a)))throw Error('Unknown option');
 const result=await runShield(root,{stable:args.includes('--stable'),installed:args.includes('--installed')});
 if(!result.passed)process.exitCode=1;
}
