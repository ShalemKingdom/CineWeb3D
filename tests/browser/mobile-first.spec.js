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
