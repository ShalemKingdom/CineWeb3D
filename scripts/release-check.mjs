import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
export const projects=['.','templates/coffee-astro','tools/assets'];
const load=async p=>JSON.parse(await readFile(p,'utf8'));
// GHSA-p4f5-76q4-ffq7: reject affected Vite release lines, including Astro's transitive Vite.
export function affectedVite(version){const m=/^(\d+)\.(\d+)\.(\d+)$/.exec(version??'');if(!m)return true;const [major,minor,patch]=m.slice(1).map(Number);if(major===4||major===5)return true;if(major===6)return minor<4||(minor===4&&patch<6);if(major===7)return minor<3||(minor===3&&patch<8);if(major===8)return (minor===0)||(minor===1&&patch<7)||(minor===2&&patch<5)||(minor===3&&patch<7);return false;}
export function validIntegrity(value){
 if(typeof value!=='string')return false;
 return value.trim().split(/\s+/).some(token=>{const m=/^(sha256|sha384|sha512)-([A-Za-z0-9+/]+={0,2})$/.exec(token);if(!m)return false;const bytes=Buffer.from(m[2],'base64');return bytes.length===({sha256:32,sha384:48,sha512:64}[m[1]])&&bytes.toString('base64')===m[2];});
}
export function inspectLock(manifest,lock){
 const errors=[];const packages=lock?.packages;const top=packages?.[''];
 if(![2,3].includes(lock?.lockfileVersion)||!top)return {errors:['Missing npm lockfile packages or unsupported lockfile version'],inventory:[]};
 if(top.name!==manifest.name||top.version!==manifest.version)errors.push('Root name/version mismatch');
 for(const section of ['dependencies','devDependencies','optionalDependencies']){const a=manifest[section]??{},b=top[section]??{};for(const k of new Set([...Object.keys(a),...Object.keys(b)])){if(a[k]!==b[k])errors.push(`Lock mismatch: ${section}/${k}`);if(a[k]&& !packages[`node_modules/${k}`])errors.push(`Missing direct package: ${k}`);}}
 const inventory=[];
 for(const [path,p] of Object.entries(packages)){if(!path)continue;if(p.link||!p.version||!p.integrity||!validIntegrity(p.integrity)||!/^https:\/\/registry\.npmjs\.org\//.test(p.resolved??''))errors.push(`Unverified registry origin/integrity: ${path}`);const pathName=path.split('node_modules/').at(-1);const name=p.name??pathName;const blocked=n=>n.toLowerCase()==='gsap'||n.toLowerCase().startsWith('@gsap/');if(blocked(name)||blocked(pathName))errors.push(`Restricted dependency: ${name}`);if((name==='vite'||pathName==='vite')&&affectedVite(p.version))errors.push(`Vite requires patched release (GHSA-p4f5-76q4-ffq7): ${p.version}`);inventory.push({path,name,version:p.version??null,license:p.license??null,dev:p.dev===true,optional:p.optional===true,review:!p.license||!/^(MIT|Apache-2\.0|BSD-[23]-Clause|ISC|0BSD|Zlib)$/.test(p.license)});}
 return {errors,inventory};
}
export async function checkAll(base=root){const result=[];for(const project of projects){const folder=join(base,project);try{const manifest=await load(join(folder,'package.json'));const lock=await load(join(folder,'package-lock.json'));result.push({project,...inspectLock(manifest,lock)});}catch(e){result.push({project,errors:[e.code==='ENOENT'?'Missing package-lock.json or package.json':e.message],inventory:[]});}}return result;}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){const results=await checkAll();const ok=results.every(x=>!x.errors.length);const report={lockfilesPass:ok,licenseReviewRequired:true,notice:'License declarations are an inventory, not legal clearance. Review actual license files, exceptions and bundled assets.',projects:results};const out=join(root,'reports','release-inventory.json');await mkdir(dirname(out),{recursive:true});await writeFile(out,JSON.stringify(report,null,2)+'\n');for(const r of results)console.log(`${r.project}: ${r.errors.length?r.errors.join('; '):'lock passed'} (${r.inventory.length} resolved packages)`);console.log('Inventory: reports/release-inventory.json');if(!ok)process.exitCode=1;}
