import test from 'node:test';
import assert from 'node:assert/strict';
import {siteOrigin,buildSeo} from '../src/modules/seo.js';
test('public DNS HTTPS origin accepted but local and literal addresses rejected',()=>{assert.equal(siteOrigin('https://example.com/'),'https://example.com');for(const x of ['http://example.com','https://localhost','https://127.0.0.1','https://192.168.1.1','https://[::1]','https://host.local','https://example.com/path','https://user@example.com'])assert.throws(()=>siteOrigin(x));});
test('indexing remains explicit even when a domain is configured',()=>{assert.equal(buildSeo({siteUrl:'https://example.com'}).robots,'noindex,follow');assert.equal(buildSeo({siteUrl:'https://example.com',indexable:true}).robots,'index,follow');});
test('unsafe canonical paths rejected',()=>{for(const path of ['//other.com/','/a?x=1','/a#hash','/\\other.com'])assert.throws(()=>buildSeo({siteUrl:'https://example.com',path}));});
