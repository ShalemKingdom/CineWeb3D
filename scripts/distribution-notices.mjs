import {readFile,writeFile,mkdir,readdir,lstat} from 'node:fs/promises';
import {join,resolve,relative,basename} from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const decoderFiles={
 'draco/gltf/draco_decoder.js':'7c84b0be2aa46407df9f3f3371d574dc165b55f8',
 'draco/gltf/draco_decoder.wasm':'469904ebcb7b83523db73913a19c349528105ff8',
 'draco/gltf/draco_wasm_wrapper.js':'43f15568384c84f9506cd86fc4a8736e1ba2ec1f',
 'meshopt_decoder.module.js':'a9bd05fe7b1ff20acf46fcc3031818119a851358'
};
export function gitBlobHash(data){return createHash('sha1').update('blob '+data.length+'\0').update(data).digest('hex');}
const sha=data=>createHash('sha256').update(data).digest('hex');
const readJson=async p=>JSON.parse(await readFile(p,'utf8'));
async function walk(dir){const paths=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=join(dir,e.name);if(e.isSymbolicLink())throw Error('Symlink in distribution: '+p);if(e.isDirectory())paths.push(...await walk(p));else if(e.isFile())paths.push(p);}return paths;}
async function packageNotice(base,project,name,output){
 const folder=join(base,project,'node_modules',name),manifest=await readJson(join(folder,'package.json')),lock=await readJson(join(base,project,'package-lock.json')),entry=lock.packages['node_modules/'+name];
 if(!entry||entry.version!==manifest.version||entry.license!==manifest.license||manifest.name!==name)throw Error('Unverified installed package: '+name);
 const notices=[];
 for(const e of await readdir(folder,{withFileTypes:true})){
  if(!e.isFile()||! /^(licen[cs]e|copying|notice|copyright)(?:[._-].*)?$/i.test(e.name))continue;
  const data=await readFile(join(folder,e.name)),dest=name.replaceAll('/','_')+'-'+manifest.version+'-'+e.name;
  await writeFile(join(output,dest),data);
  notices.push({file:dest,sha256:sha(data)});
 }
 if(!notices.length)throw Error('Missing license notice: '+name);
 return {name,version:manifest.version,license:manifest.license,notices};
}
export async function distributionNotices(base=root,kind='vite'){
 if(!['vite','astro'].includes(kind))throw Error('Unknown distribution');
 const dist=join(base,kind==='vite'?'dist':'templates/coffee-astro/dist');
 if(!(await lstat(dist)).isDirectory())throw Error('Missing distribution directory');
 const output=join(dist,'licenses');await mkdir(output,{recursive:true});
 const packages=[];
 for(const name of ['three','animejs','lenis','web-vitals'])packages.push(await packageNotice(base,'.',name,output));
 if(kind==='vite')packages.push(await packageNotice(base,'.','vite',output));
 else for(const name of ['astro','tailwindcss','vite'])packages.push(await packageNotice(base,'templates/coffee-astro',name,output));
 const files=await walk(dist),byHash=new Map();
 for(const f of files){if(f.startsWith(output+'/'))continue;const bytes=await readFile(f);const h=gitBlobHash(bytes);const list=byHash.get(h)||[];list.push(relative(dist,f));byHash.set(h,list);}
 const decoders=[];
 for(const [path,expected] of Object.entries(decoderFiles)){
  const data=await readFile(join(base,'node_modules/three/examples/jsm/libs',path));
  if(gitBlobHash(data)!==expected)throw Error('Unreviewed decoder bytes: '+path);
  const emitted=byHash.get(expected)||[];
  if(path.startsWith('draco/')&&!emitted.length)throw Error('Decoder asset not found unchanged: '+path);
  decoders.push({path,upstreamGitBlob:expected,sha256:sha(data),emitted,kind:path.startsWith('draco/')?'standalone-asset':'bundled-module'});
 }
 for(const name of ['meshoptimizer-0.22-MIT.txt','draco-Apache-2.0.txt'])await writeFile(join(output,name),await readFile(join(base,'licenses',name)));
 await writeFile(join(output,'CineWeb3D-MIT.txt'),await readFile(join(base,'LICENSE')));
 const notice={distribution:kind,packages,decoders,notes:['Three.js r181 shipped decoder bytes verified by upstream git blob hashes. Draco glTF builds track its glTF extension branch; exact Draco release not established. Meshopt source header identifies version 0.22.','Astro/Tailwind/Vite notices are included conservatively, not a claim that every tool is shipped.','No node_modules, AI weights or native Sharp libraries are intended for distribution. Final bundle and media rights still require release review.']};
 await writeFile(join(output,'NOTICE.json'),JSON.stringify(notice,null,2)+'\n');
 await writeFile(join(output,'README.txt'),'CineWeb3D third-party notices\nSee NOTICE.json for package versions, sources, decoder hashes and license filenames.\nDraco: https://github.com/google/draco (Apache-2.0); meshoptimizer 0.22: https://github.com/zeux/meshoptimizer (MIT).\n');
 const report=join(base,'reports','distribution-notices');await mkdir(report,{recursive:true});await writeFile(join(report,kind+'.json'),JSON.stringify(notice,null,2)+'\n');
 console.log('Distribution notices:',kind,packages.length,'packages;',decoders.length,'verified decoder sources');
 return notice;
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url)await distributionNotices(root,process.argv[2]||'vite');
