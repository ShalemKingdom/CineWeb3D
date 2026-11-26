import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
const script=resolve('scripts/portable-integrity.mjs');
const run=(...args)=>spawnSync(process.execPath,[script,...args],{encoding:'utf8'});
test('checksums reject a changed release artifact',async()=>{const dir=await mkdtemp(join(tmpdir(),'cine-integrity-'));try{const file=join(dir,'runtime.tgz'),manifest=join(dir,'checksums.json');await writeFile(file,'reviewed bytes');let r=run('create',file,manifest);assert.equal(r.status,0,r.stderr);r=run('verify',file,manifest);assert.equal(r.status,0,r.stderr);await writeFile(file,'changed bytes');r=run('verify',file,manifest);assert.notEqual(r.status,0);}finally{await rm(dir,{recursive:true,force:true});}});
