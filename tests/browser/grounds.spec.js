import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const url='/examples/the-grounds/';
test('Grounds concept remains readable without JavaScript, noindex and responsive',async({browser},info)=>{
 const context=await browser.newContext({javaScriptEnabled:false,viewport:info.project.name==='mobile'?{width:393,height:851}:{width:1440,height:900}});
 try{const page=await context.newPage();await page.goto(url);await expect(page.locator('html')).toHaveAttribute('lang','es');await expect(page.getByRole('heading',{level:1})).toHaveText(/Tu lugarde paz\./);await expect(page.locator('meta[name=robots]')).toHaveAttribute('content','noindex,follow');await expect(page.locator('#scene')).toBeHidden();await expect(page.locator('#scene-poster img')).toBeVisible();await expect(page.locator('.g-card')).toHaveCount(3);await page.keyboard.press('Tab');await expect(page.locator('.skip')).toBeFocused();await page.locator('a[href="#visit"]').first().click();await expect(page.locator('#visit')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();}finally{await context.close();}
});
test('Grounds reduced motion, accessible content and screenshots',async({page},info)=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(url);await expect(page.locator('#quality-status')).toContainText('accessible');await expect(page.locator('#scene')).toBeHidden();const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();expect(result.violations).toEqual([]);
 await page.screenshot({path:info.outputPath('grounds-static.png'),fullPage:true,animations:'disabled'});
});
test('Grounds scoped 3D loads and responds to scroll, then returns to static',async({page},info)=>{
 await page.goto(url);const supported=await page.evaluate(()=>{const gl=document.createElement('canvas').getContext('webgl2');const ok=Boolean(gl);gl?.getExtension('WEBGL_lose_context')?.loseContext();return ok;});test.skip(!supported,'WebGL2 unavailable');
 await page.locator('#quality').selectOption('balanced');const canvas=page.locator('#scene');await expect(canvas).toBeVisible({timeout:15000});await expect(canvas).toHaveAttribute('data-model','procedural');await expect.poll(()=>canvas.evaluate(c=>c.width*c.height)).toBeLessThanOrEqual(1500000);
 expect(await canvas.evaluate(c=>{const a=c.getBoundingClientRect(),b=c.parentElement.getBoundingClientRect();return Math.abs(a.width-b.width)<2&&Math.abs(a.height-b.height)<2;})).toBeTruthy();
 await expect(canvas).toHaveAttribute('data-progress',/\d\.\d{3}/);if(info.project.name==='desktop'){const first=await canvas.getAttribute('data-progress');await page.evaluate(()=>scrollTo(0,220));await expect.poll(()=>canvas.getAttribute('data-progress')).not.toBe(first);}
 await page.locator('.g-stage').screenshot({path:info.outputPath('grounds-3d.png'),animations:'disabled'});
 await page.locator('#quality').selectOption('accessible');await expect(canvas).toBeHidden();await expect(page.locator('#scene-poster img')).toBeVisible();
});
