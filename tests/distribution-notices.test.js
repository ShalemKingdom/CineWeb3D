import test from 'node:test';
import assert from 'node:assert/strict';
import {gitBlobHash} from '../scripts/distribution-notices.mjs';
test('matches canonical Git blob hash for empty content',()=>assert.equal(gitBlobHash(Buffer.alloc(0)),'e69de29bb2d1d6434b8b29ae775ad8c2e48c5391'));
test('decoder hash changes when binary changes',()=>assert.notEqual(gitBlobHash(Buffer.from([1,2,3])),gitBlobHash(Buffer.from([1,2,4]))));
