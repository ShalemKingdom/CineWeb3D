import {readFile,readdir,stat,mkdir,writeFile} from 'node:fs/promises';
import {join,relative} from 'node:path';
import {chromium} from '@playwright/test';
import {buildSeo,sitemapXml,robotsText} from '../src/modules/seo.js';
const seo=buildSeo({siteUrl:process.env.SITE_URL,indexable:process.env.SITE_INDEXABLE==='true'});
if(process.env.SITE_INDEXABLE==='true'&&!seo.canonical)throw Error('Indexable build requires SITE_URL');
const roots=['dist','templates/coffee-astro/dist'];
const errors=[],reports=[];
async function htmlFiles(dir){const result=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=join(dir,e.name);if(e.isDirectory()&&e.name!=='licenses')result.push(...await htmlFiles(p));else if(e.isFile()&&e.name.endsWith('.html'))result.push(p);}return result;}
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage();
 for(const dir of roots){
  for(const path of await htmlFiles(dir)){
   const root=relative(dir,path)==='index.html',expected=root?seo.robots:'noindex,follow';
   const html=await readFile(path,'utf8');
   const data=await page.evaluate(html=>{
    const d=new DOMParser().parseFromString(html,'text/html');
    const values=(q,a)=>[...d.querySelectorAll(q)].map(e=>e.getAttribute(a));
    const texts=q=>[...d.querySelectorAll(q)].map(e=>e.textContent.trim());
    const schemas=[...d.querySelectorAll('script[type="application/ld+json"]')].map(e=>{try{return JSON.parse(e.textContent)}catch{return null}});
    return {lang:d.documentElement.lang,title:texts('head title'),descriptions:values('meta[name="description"]','content'),robots:values('meta[name="robots"]','content'),canonical:values('link[rel="canonical"]','href'),ogUrl:values('meta[property="og:url"]','content'),viewport:values('meta[name="viewport"]','content'),h1:texts('h1'),main:d.querySelectorAll('main').length,images:[...d.images].map(i=>({src:i.getAttribute('src'),alt:i.getAttribute('alt'),width:i.getAttribute('width'),height:i.getAttribute('height')})),schemas};
   },html);
   const check=(ok,msg)=>{if(!ok)errors.push(path+': '+msg);};
   check(Boolean(data.lang),'missing document language');check(data.title.length===1&&Boolean(data.title[0]),'expected one nonempty title');check(data.descriptions.length===1&&Boolean(data.descriptions[0]),'expected one description');check(data.robots.length===1&&data.robots[0]===expected,'incorrect robots');check(data.viewport.length===1,'missing or duplicate viewport');check(data.h1.length===1&&Boolean(data.h1[0]),'expected one H1');check(data.main===1,'expected one main');check(data.images.every(i=>i.alt!==null),'missing image alt attribute');
   if(root){check(data.canonical.length===(seo.canonical?1:0)&&(!seo.canonical||data.canonical[0]===seo.canonical),'canonical mismatch');if(seo.canonical){check(data.ogUrl.length===1&&data.ogUrl[0]===seo.canonical,'Open Graph URL mismatch');check(data.schemas.length===1&&data.schemas[0]?.url===seo.canonical&&data.schemas[0]?.['@type']==='WebPage','WebPage structured data mismatch');}check(data.images.filter(i=>i.src?.includes('coffee-poster')).every(i=>Number(i.width)>0&&Number(i.height)>0),'hero poster dimensions missing');}
   else check(data.canonical.length===0,'demo routes must not declare production canonical');
   check(data.schemas.every(Boolean),'invalid JSON-LD');
   reports.push({path,expected,...data});
  }
  if(await readFile(join(dir,'robots.txt'),'utf8')!==robotsText(seo))errors.push(dir+': robots.txt mismatch');
  if(seo.robots==='index,follow'){if(await readFile(join(dir,'sitemap.xml'),'utf8')!==sitemapXml([seo.canonical]))errors.push(dir+': sitemap mismatch');}
  else {try{await stat(join(dir,'sitemap.xml'));errors.push(dir+': preview sitemap must not exist');}catch(e){if(e.code!=='ENOENT')throw e;}}
 }
}finally{await browser.close();}
await mkdir('reports/seo-shield',{recursive:true});
await writeFile('reports/seo-shield/'+(seo.robots==='index,follow'?'indexable':'preview')+'.json',JSON.stringify({mode:seo.robots,pages:reports,errors},null,2)+'\n');
console.log('SEO Shield:',reports.length,'HTML pages;',errors.length,'errors');for(const e of errors)console.error(e);if(errors.length)process.exitCode=1;
