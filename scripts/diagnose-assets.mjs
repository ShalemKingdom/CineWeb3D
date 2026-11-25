import {readdir,stat} from 'node:fs/promises';
import {resolve,relative} from 'node:path';
import {pathToFileURL} from 'node:url';
import {assetKind,defaultBudgets} from '../src/modules/diagnostics.js';
export async function auditAssets(root,{budgets=defaultBudgets}={}){
 const base=resolve(root),files=[],skipped=[];if(!(await stat(base)).isDirectory())throw Error('Expected a directory');
 async function walk(dir){for(const e of (await readdir(dir,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){const p=resolve(dir,e.name),name=relative(base,p);if(e.isSymbolicLink()){skipped.push(name);continue;}if(e.isDirectory()){await walk(p);continue;}if(!e.isFile())continue;const kind=assetKind(e.name);if(kind==='other')continue;const bytes=(await stat(p)).size,limit=kind==='video'&&/(^|[/\\])mobile\.mp4$/i.test(name)?budgets.mobileVideo:budgets[kind];files.push({path:name,kind,bytes,limit,overBudget:Number.isFinite(limit)&&bytes>limit});}}
 await walk(base);return {root:base,assets:files.length,totalBytes:files.reduce((n,f)=>n+f.bytes,0),overBudget:files.filter(f=>f.overBudget).length,skippedSymlinks:skipped,files};
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){try{const args=process.argv.slice(2);if(args.filter(a=>a!=='--strict').length>1)throw Error('Usage: diagnose-assets.mjs [directory] [--strict]');const report=await auditAssets(args.find(a=>a!=='--strict')||'public');console.log(JSON.stringify(report,null,2));if(args.includes('--strict')&&report.overBudget)process.exitCode=1;}catch(e){console.error(e.message);process.exitCode=2;}}
