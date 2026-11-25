import test from 'node:test';import assert from 'node:assert/strict';import {selectVideoProfile} from '../src/modules/video-profile.js';
const variants={mobile:{file:'mobile.mp4'},desktop:{file:'desktop.mp4'}};
test('small screen chooses mobile',()=>assert.equal(selectVideoProfile(variants,{width:500}),variants.mobile));
test('large screen chooses desktop',()=>assert.equal(selectVideoProfile(variants,{width:1400}),variants.desktop));
test('data saver and slower connections prefer mobile',()=>{assert.equal(selectVideoProfile(variants,{width:1400,saveData:true}),variants.mobile);assert.equal(selectVideoProfile(variants,{width:1400,effectiveType:'3g'}),variants.mobile);});
test('reduced motion disables automatic video selection but permits explicit user action',()=>{assert.equal(selectVideoProfile(variants,{width:1400,reducedMotion:true}),null);assert.equal(selectVideoProfile(variants,{width:1400,reducedMotion:true,explicit:true}),variants.desktop);});
test('single variant and missing variants handled',()=>{assert.equal(selectVideoProfile({desktop:variants.desktop},{width:500}),variants.desktop);assert.equal(selectVideoProfile({},{}),null);});
