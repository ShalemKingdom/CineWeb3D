import test from 'node:test';
import assert from 'node:assert/strict';
import {parseOptions,nodeSupported,setupPlan} from '../scripts/setup.mjs';
test('setup is plan-only by default',()=>assert.deepEqual(parseOptions([]),{install:false,all:false}));
test('install requires explicit flag and rejects arbitrary arguments',()=>{assert.deepEqual(parseOptions(['--install','--all']),{install:true,all:true});for(const args of [['--all'],['--install','--force'],['--install','--install']])assert.throws(()=>parseOptions(args));});
test('full suite Node minimum is enforced',()=>{for(const v of ['v20.0.0','v22.23.3','bad'])assert.equal(nodeSupported(v),false);for(const v of ['v22.23.4','v22.24.0','v24.0.0'])assert.equal(nodeSupported(v),true);});
test('all three audits precede any installation',()=>{for(const all of [false,true]){const p=setupPlan({all});assert.equal(p.filter(s=>s.args.includes('audit')).length,3);assert.equal(p.filter(s=>s.args.includes('ci')).length,all?3:1);assert.ok(p.findIndex(s=>s.args.includes('ci'))>p.map(s=>s.args.includes('audit')).lastIndexOf(true));assert.equal(p[0].args[0],'scripts/release-check.mjs');assert.equal(p[1].args[0],'scripts/security-shield.mjs');}});
