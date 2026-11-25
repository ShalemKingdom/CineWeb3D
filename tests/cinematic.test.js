import test from 'node:test';
import assert from 'node:assert/strict';
import {clamp01, qualityProfile, cinematicPose, videoTime} from '../src/modules/cinematic.js';
test('progress bounds and invalid input',()=>{ assert.equal(clamp01(-1),0); assert.equal(clamp01(2),1); assert.equal(clamp01(NaN),0); });
test('mobile and reduced motion budgets',()=>{assert.equal(qualityProfile(360).particles,36); assert.equal(qualityProfile(1200,true).motion,false);assert.equal(qualityProfile(1200).pixelRatio,1.5);});
test('camera and exploded view midpoint',()=>{assert.equal(cinematicPose(.5).cameraZ,5.5);assert.equal(cinematicPose(.5).explosion,1);assert.equal(cinematicPose(0).rotation,0);});
test('video seeks within duration',()=>{assert.equal(videoTime(1,10),9.999);assert.equal(videoTime(.5,10),5);assert.equal(videoTime(1,NaN),0);assert.equal(videoTime(1,.0001),0);});
