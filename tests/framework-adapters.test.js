import {test} from 'node:test';import assert from 'node:assert/strict';
import {mountAstroExperience} from '../src/adapters/astro.js';
test('Astro adapter cleans up once before navigation and removes its listener',()=>{let handler,disposed=0,removed=0;const doc={addEventListener:(n,f)=>{assert.equal(n,'astro:before-swap');handler=f},removeEventListener:(n,f)=>{assert.equal(n,'astro:before-swap');assert.equal(f,handler);removed++}};const cleanup=mountAstroExperience({doc,mount:()=>()=>{disposed++}});handler();cleanup();assert.equal(disposed,1);assert.equal(removed,1)});
