import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {renderCommercial} from '../src/modules/commercial-components.js';
import {presets} from '../templates/commercial/presets.js';
const args=process.argv.slice(2);if(args.some(a=>a!=='--check'))throw Error('Usage: generate-commercial.mjs [--check]');
for(const preset of presets){const html=renderCommercial(preset);const dir=new URL(`../examples/${preset.slug}/`,import.meta.url);const path=new URL('index.html',dir);if(args.includes('--check')){if(await readFile(path,'utf8')!==html)throw Error(`Generated page out of date: ${preset.slug}`);}else{await mkdir(dir,{recursive:true});await writeFile(path,html);}console.log(`${preset.slug}: ${args.includes('--check')?'verified':'generated'}`);}
