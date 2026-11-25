import {readFile,writeFile,rm} from 'node:fs/promises';
import {buildSeo,escapeHtml,sitemapXml,robotsText,jsonLd} from '../src/modules/seo.js';
const seo=buildSeo({siteUrl:process.env.SITE_URL,indexable:process.env.SITE_INDEXABLE==='true'});
const tags=[`<meta name="robots" content="${seo.robots}">`];
if(seo.canonical){tags.push(`<link rel="canonical" href="${escapeHtml(seo.canonical)}">`,`<meta property="og:url" content="${escapeHtml(seo.canonical)}">`);tags.push(`<script type="application/ld+json">${jsonLd({'@context':'https://schema.org','@type':'WebPage',name:seo.title,description:seo.description,url:seo.canonical})}</script>`);}
// Social preview image is opt-in: provide a real, public, share-compatible raster asset.
if(process.env.SOCIAL_IMAGE_URL){const image=new URL(process.env.SOCIAL_IMAGE_URL);if(image.protocol!=='https:')throw Error('Social image must be HTTPS');tags.push(`<meta property="og:image" content="${escapeHtml(image.href)}">`,`<meta name="twitter:image" content="${escapeHtml(image.href)}">`);}
const file='dist/index.html';let html=await readFile(file,'utf8');const original=/<meta\s+name=["']robots["']\s+content=["']noindex,follow["']\s*\/?>/i;if(!original.test(html))throw Error('Missing safe robots marker');html=html.replace(original,()=>tags.join('\n'));await writeFile(file,html);await writeFile('dist/robots.txt',robotsText(seo));if(seo.robots==='index,follow')await writeFile('dist/sitemap.xml',sitemapXml([seo.canonical]));else await rm('dist/sitemap.xml',{force:true});
console.log('SEO:',seo.robots,seo.canonical??'(no public domain configured)');
