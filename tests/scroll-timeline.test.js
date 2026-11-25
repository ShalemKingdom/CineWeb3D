import test from 'node:test';
import assert from 'node:assert/strict';
import {sectionProgress} from '../src/modules/scroll-math.js';
import {createTimelineModel} from '../src/modules/timeline.js';
test('scroll progress is reversible and bounded',()=>{assert.equal(sectionProgress(-500,2000,1000),.5);assert.equal(sectionProgress(20,2000,1000),0);assert.equal(sectionProgress(-1200,2000,1000),1);});
test('short sections and invalid dimensions',()=>{assert.equal(sectionProgress(1,100,500),0);assert.equal(sectionProgress(0,100,500),1);assert.equal(sectionProgress(NaN,100,500),0);});
test('timeline samples and reverses',()=>{const t=createTimelineModel([{id:'camera',keys:[{time:0,value:7},{time:1000,value:5}]}]);assert.equal(t.duration,1000);assert.equal(t.sample(750).camera,5.5);assert.equal(t.sample(250).camera,6.5);assert.equal(t.sample(-1).camera,7);assert.equal(t.sample(2000).camera,5);assert.deepEqual(createTimelineModel(t.toJSON()).sample(500),{camera:6});});
test('timeline rejects duplicate or invalid keyframes',()=>{assert.throws(()=>createTimelineModel([{id:'x',keys:[{time:0,value:0},{time:0,value:1}]}]));assert.throws(()=>createTimelineModel([{id:'x',keys:[]} ]));});
