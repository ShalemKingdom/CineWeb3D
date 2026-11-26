import {readFile,stat} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const allowed={goal:['showcase','contact','catalog'],category:['coffee','product','service'],language:['es','en'],style:['coffee','midnight','light'],experience:['auto','static','procedural','glb','video','local-ai']};
const keys=['brand',...Object.keys(allowed),'assets','notes','localBackend'];
function record(v){return v!==null&&typeof v==='object'&&!Array.isArray(v);}
function text(v,max){return typeof v==='string'&&v.trim().length>0&&v.length<=max&&!/[\u0000-\u001f\u007f]/.test(v);}
function validPath(p,kind){
 const extensions={image:/\.(svg|png|jpe?g|webp|avif)$/i,glb:/\.glb$/i,video:/\.(mp4|mov|webm|mkv)$/i};
 return typeof p==='string'&&p.length<=240&&/^(public|generated|inputs)\/[a-zA-Z0-9_.\/-]+$/.test(p)&&p.split('/').every(s=>s&&s!=='.'&&s!=='..'&&!s.startsWith('.'))&&extensions[kind]?.test(p);
}
export function planBrief(b){
 if(!record(b)||Object.keys(b).some(k=>!keys.includes(k)))throw Error('Unknown brief field or invalid object');
 if(!text(b.brand,100))throw Error('Invalid brand');
 for(const [k,v] of Object.entries(allowed))if(!v.includes(b[k]))throw Error('Invalid '+k);
 if(b.notes!==undefined&&!text(b.notes,500))throw Error('Invalid notes');
 if(!Array.isArray(b.assets)||b.assets.length>12)throw Error('Invalid assets');
 const paths=new Set();
 for(const a of b.assets){
  if(!record(a)||Object.keys(a).length!==3||Object.keys(a).some(k=>!['kind','path','rights'].includes(k))||!['image','glb','video'].includes(a.kind)||!validPath(a.path,a.kind)||!['approved','unknown'].includes(a.rights)||paths.has(a.path))throw Error('Invalid or duplicate asset');
  paths.add(a.path);
 }
 if(b.experience==='local-ai'? !['wan','comfy','blender'].includes(b.localBackend):b.localBackend!==undefined)throw Error('Invalid localBackend');
 const approved=kind=>b.assets.some(a=>a.kind===kind&&a.rights==='approved');
 let route=b.experience;
 if(route==='auto')route=approved('glb')?'glb':approved('video')?'video':b.category==='coffee'?'coffee-procedural':'static';
 if(route==='procedural')route=b.category==='coffee'?'coffee-procedural':'custom-procedural';
 const blockers=[];
 if(route==='glb'&&!approved('glb'))blockers.push('Approved local GLB required; use original static fallback meanwhile.');
 if(route==='video'&&!approved('video'))blockers.push('Approved local video required; use original static fallback meanwhile.');
 if(route==='local-ai')blockers.push('Explicit local backend authorization and hardware/model/license preflight required; planning only.');
 if(b.assets.some(a=>a.rights==='unknown'))blockers.push('Exclude all unapproved assets until rights are verified.');
 const refs={static:'docs/optimization-step-7.md','coffee-procedural':'docs/commercial-showcase.md','custom-procedural':'docs/optimization-step-2.md',glb:'docs/optimization-step-3.md',video:'docs/optimization-step-4.md','local-ai':'docs/optimization-step-8.md'};
 return {schemaVersion:1,mode:'plan-only',brand:b.brand,language:b.language,goal:b.goal,style:b.style,route,backend:route==='local-ai'?b.localBackend:null,blockers,approvedAssets:b.assets.filter(a=>a.rights==='approved'),excludedAssets:b.assets.filter(a=>a.rights!=='approved').map(a=>a.path),references:[refs[route],'docs/security-license-shield.md','docs/seo-performance-shield.md'],stages:['Confirm scope and business facts','Author semantic page and static fallback','Implement selected enhancement after prerequisites','Validate rights and asset budgets','Run security, build, browser, accessibility and SEO gates','Report evidence and limitations'],checks:['npm run release:check','npm run security:stable','npm run validate:local','npm run build','npm run build:astro','npm run test:e2e','npm run seo:check','npm run quality'],budgets:{initialMobileKiB:256,modelMiB:2,posterKiB:200,mobileVideoMiB:2,desktopVideoMiB:5},publication:'disabled; preview noindex',executionAuthorized:false};
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
 try{const args=process.argv.slice(2);if(args.length!==1)throw Error('Usage: director-plan.mjs brief.json');const p=args[0],info=await stat(p);if(!info.isFile()||info.size>65536)throw Error('Expected JSON file <=64 KiB');const bytes=await readFile(p);if(bytes.length>65536)throw Error('Brief too large');console.log(JSON.stringify(planBrief(JSON.parse(bytes.toString('utf8'))),null,2));}
 catch(e){console.error('Director plan:',e.message);process.exitCode=1;}
}
