import {test,expect} from '@playwright/test';
test('mobile automatic 3D waits for intent; manual selection still works',async({page},info)=>{
 test.skip(info.project.name!=='mobile','Mobile-specific policy');
 await page.goto('/');
 await expect(page.locator('#quality-status')).toContainText('scroll to activate 3D');
 await page.waitForTimeout(1700);
 await expect(page.locator('#scene')).toBeHidden();
 await expect(page.locator('#scene-poster img')).toBeVisible();
 const supported=await page.evaluate(()=>Boolean(document.createElement('canvas').getContext('webgl2')));
 test.skip(!supported,'No WebGL2');
 await page.locator('#quality').selectOption('balanced');
 await expect(page.locator('#scene')).toBeVisible({timeout:15000});
 await page.locator('#quality').selectOption('accessible');
 await expect(page.locator('#scene')).toBeHidden();
});

test('mobile scroll activates automatic 3D without fetching media on initial view',async({page},info)=>{
 test.skip(info.project.name!=='mobile','Mobile-specific policy');
 const media=[];
 page.on('request',r=>{if(/\.(glb|mp4|webm)(?:\?|$)/i.test(r.url()))media.push(r.url());});
 await page.goto('/');
 await expect(page.locator('#quality-status')).toContainText('scroll to activate 3D');
 await expect(page.locator('#scene')).toBeHidden();
 expect(media).toEqual([]);
 const bytes=await page.evaluate(()=>performance.getEntriesByType('resource').reduce((sum,r)=>sum+(r.transferSize||0),0));
 expect(bytes).toBeLessThan(256*1024);
 const supported=await page.evaluate(()=>Boolean(document.createElement('canvas').getContext('webgl2')));
 test.skip(!supported,'No WebGL2');
 await page.evaluate(()=>window.scrollTo(0,Math.min(300,document.documentElement.scrollHeight-innerHeight)));
 await expect(page.locator('#scene')).toBeVisible({timeout:15000});
 await page.locator('#quality').selectOption('accessible');
 await expect(page.locator('#scene')).toBeHidden();
});
