import {access} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {resolve,join} from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
export const projects=['.','templates/coffee-astro','tools/assets'];
export function parseOptions(args){
 if(args.some(a=>!['--install','--all'].includes(a))||new Set(args).size!==args.length||args.includes('--all')&&!args.includes('--install'))throw Error('Usage: npm run setup [-- --install [--all]]');
 return {install:args.includes('--install'),all:args.includes('--all')};
}
export function nodeSupported(version){
 const match=/^v?(\d+)\.(\d+)\.(\d+)$/.exec(version);
 if(!match)return false;
 const [major,minor,patch]=match.slice(1).map(Number);
 return major>22||major===22&&(minor>23||minor===23&&patch>=4);
}
export function setupPlan({all=false}={}){
 return [
  {label:'Verify exact lockfiles',type:'node',args:['scripts/release-check.mjs']},
  {label:'Enforce license policy',type:'node',args:['scripts/security-shield.mjs','--stable']},
  ...projects.map(p=>({label:'Audit '+p,type:'npm',args:['--prefix',p,'audit','--package-lock-only','--audit-level=low']})),
  ...(all?projects:['.']).map(p=>({label:'Install '+p,type:'npm',args:['--prefix',p,'ci','--no-audit']}))
 ];
}
export async function runSetup(args,base=root){
 const options=parseOptions(args);
 if(!nodeSupported(process.version))throw Error('Use Node 22.23.4+ or a compatible newer release; Node 22/24 LTS recommended.');
 for(const p of projects)for(const f of ['package.json','package-lock.json'])await access(join(base,p,f));
 const plan=setupPlan(options);
 console.log('CineWeb3D setup | Node '+process.version+' | '+(options.install?'explicit installation':'plan only; no installs or network requests'));
 for(const step of plan)console.log(step.label+': '+step.type+' '+step.args.join(' '));
 if(!options.install){console.log('Run npm run setup -- --install for the web core, or npm run setup -- --install --all for all npm projects.');return;}
 const npm=process.env.npm_execpath;
 if(!npm)throw Error('Use npm run setup -- --install (npm entry point required)');
 for(const step of plan){
  const r=spawnSync(process.execPath,step.type==='npm'?[npm,...step.args]:step.args,{cwd:base,stdio:'inherit',shell:false});
  if(r.error)throw r.error;
  if(r.status!==0)throw Error(step.label+' failed: '+(r.status??r.signal));
 }
 console.log('Installed requested npm projects. No Blender, FFmpeg, browsers, drivers or AI model weights were installed by this script.');
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url)try{await runSetup(process.argv.slice(2));}catch(e){console.error('Setup:',e.message);process.exitCode=1;}
