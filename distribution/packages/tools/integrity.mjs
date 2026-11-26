#!/usr/bin/env node
import {createHash} from 'node:crypto';
import {readFile,writeFile,lstat} from 'node:fs/promises';
import {basename,resolve} from 'node:path';
const [command,artifact,manifest]=process.argv.slice(2);
try{
 if(!['create','verify'].includes(command)||!artifact||!manifest||process.argv.length!==5)throw Error('usage: portable-integrity.mjs create|verify ARTIFACT MANIFEST');
 const path=resolve(artifact),stat=await lstat(path);if(!stat.isFile()||stat.isSymbolicLink())throw Error('artifact must be a regular file');
 const sha256=createHash('sha256').update(await readFile(path)).digest('hex');
 if(command==='create'){await writeFile(resolve(manifest),JSON.stringify({schema:1,artifact:basename(path),size:stat.size,sha256},null,2)+'\n',{flag:'wx'});console.log('SHA-256 manifest created; authenticate it independently before relying on it.');}
 else {const expected=JSON.parse(await readFile(resolve(manifest),'utf8'));if(expected.schema!==1||expected.artifact!==basename(path)||expected.size!==stat.size||expected.sha256!==sha256)throw Error('checksum verification failed');console.log('SHA-256 verified against supplied manifest.');}
}catch(e){console.error('portable-integrity: '+e.message);process.exitCode=1;}
