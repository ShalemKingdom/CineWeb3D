import {readFile,readdir,access} from 'node:fs/promises';
import {join} from 'node:path';
const canonical='.agents/skills/cineweb3d',mirror='skills/cineweb3d';
async function list(dir,prefix=''){const all=[];for(const e of await readdir(dir,{withFileTypes:true})){const n=join(prefix,e.name);if(e.isDirectory())all.push(...await list(join(dir,e.name),n));else if(e.isFile())all.push(n);else throw Error('Unexpected skill entry: '+n);}return all.sort();}
const paths=await list(canonical);if(JSON.stringify(paths)!==JSON.stringify(await list(mirror)))throw Error('Skill folder mismatch');
for(const p of paths){if(!(await readFile(join(canonical,p))).equals(await readFile(join(mirror,p))))throw Error('Skill copy differs: '+p);}
const skill=await readFile(join(canonical,'SKILL.md'),'utf8');if(!/^---\nname: cineweb3d\ndescription: [^\n]{1,1024}\n---\n/.test(skill))throw Error('Invalid front matter');
for(const m of skill.matchAll(/\]\((references\/[a-z-]+\.md)\)/g))await access(join(canonical,m[1]));
for(const p of ['AGENTS.md','scripts/director-plan.mjs','docs/security-license-shield.md','docs/seo-performance-shield.md','docs/commercial-showcase.md'])await access(p);
console.log('Skill verified:',paths.length,'files mirrored; manifest and references valid.');
