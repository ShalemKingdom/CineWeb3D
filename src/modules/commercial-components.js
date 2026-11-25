import {escapeHtml as e} from './seo.js';
const themes=new Set(['coffee','midnight','light']);
const ident=/^[a-z][a-z0-9-]*$/;
function text(value){if(typeof value!=='string'||!value.trim())throw Error('Nonempty text required');return e(value);}
function id(value){if(typeof value!=='string'||!ident.test(value))throw Error('Invalid section ID');return value;}
export function safeLink(value){
 if(typeof value!=='string'||/[\s\u0000-\u001f\\]/.test(value))throw Error('Invalid link');
 if(/^#[a-z][a-z0-9-]*$/.test(value)||/^\/(?!\/)[a-zA-Z0-9_./-]*(?:#[a-z][a-z0-9-]*)?$/.test(value)){
  if(value.split(/[\/#]/).includes('..'))throw Error('Invalid path');return e(value);
 }
 let url;try{url=new URL(value);}catch{throw Error('Invalid link');}
 if(url.protocol!=='https:'||url.username||url.password)throw Error('Only HTTPS external links allowed');return e(url.href);
}
export function action({label,href},secondary=false){return `<a class="cw-button${secondary?' cw-button--secondary':''}" href="${safeLink(href)}">${text(label)}</a>`;}
export function image({src,alt,width,height},hero=false){
 if(!/^\/[a-zA-Z0-9_./-]+\.(svg|png|webp|avif|jpe?g)$/i.test(src)||src.includes('..')||src.startsWith('//'))throw Error('Local image required');
 if(![width,height].every(n=>Number.isInteger(n)&&n>0&&n<=8192))throw Error('Invalid image dimensions');
 return `<img src="${e(src)}" alt="${text(alt)}" width="${width}" height="${height}" ${hero?'fetchpriority="high"':'loading="lazy"'} decoding="async">`;
}
export function navigation({brand,links,quality=false}){return `<header class="cw-header"><a class="cw-brand" href="#content">${text(brand)}</a><nav aria-label="Primary navigation">${links.map(l=>`<a href="${safeLink(l.href)}">${text(l.label)}</a>`).join('')}</nav>${quality?`<div class="mode"><label for="quality">Visual quality</label><select id="quality"><option value="auto">Auto</option><option value="cinematic">Cinematic</option><option value="balanced">Balanced</option><option value="lite">Lite</option><option value="accessible">Accessible / static</option></select></div>`:''}</header>`;}
export function hero(data,scene=false){return `<section class="cw-hero" aria-labelledby="hero-title"><div class="cw-copy"><p class="cw-kicker">${text(data.eyebrow)}</p><h1 id="hero-title">${text(data.title)}</h1><p>${text(data.description)}</p><div class="cw-actions">${action(data.primary)}${data.secondary?action(data.secondary,true):''}</div>${scene?'<p id="quality-status" role="status">Static illustration available.</p>':''}</div><figure class="cw-visual${scene?' poster':''}"${scene?' id="scene-poster"':''}>${image(data.image,true)}<figcaption>${text(data.caption)}</figcaption></figure>${scene?'<canvas id="scene" hidden aria-hidden="true"></canvas>':''}</section>`;}
export function gallery({title,description,items}){return `<section id="products" class="cw-section" aria-labelledby="products-title"><p class="cw-kicker">Collection</p><h2 id="products-title">${text(title)}</h2><p>${text(description)}</p><div class="cw-grid">${items.map(item=>`<article class="cw-card">${image(item.image)}<div class="cw-card-copy"><h3>${text(item.title)}</h3><p>${text(item.description)}</p>${item.action?action(item.action,true):''}</div></article>`).join('')}</div></section>`;}
export function story({title,chapters}){return `<section id="story" class="cw-section" aria-labelledby="story-title"><p class="cw-kicker">Storytelling</p><h2 id="story-title">${text(title)}</h2><ol class="cw-story">${chapters.map(ch=>`<li><h3>${text(ch.title)}</h3><p>${text(ch.description)}</p></li>`).join('')}</ol></section>`;}
export function faq(items){return `<section id="faq" class="cw-section" aria-labelledby="faq-title"><h2 id="faq-title">Frequently asked questions</h2>${items.map(item=>`<details class="cw-faq"><summary>${text(item.question)}</summary><p>${text(item.answer)}</p></details>`).join('')}</section>`;}
export function conversion(data){return `<section id="contact" class="cw-section cw-convert" aria-labelledby="contact-title"><h2 id="contact-title">${text(data.title)}</h2><p>${text(data.description)}</p><div class="cw-actions">${action(data.primary)}${data.secondary?action(data.secondary,true):''}</div></section>`;}
export function renderCommercial(data){
 if(!themes.has(data.theme))throw Error('Unknown design theme');id(data.slug);
 const scene=data.scene===true;
 return `<!doctype html>\n<html lang="en" class="cw-theme-${data.theme}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${text(data.title)}</title><meta name="description" content="${text(data.description)}"><meta name="robots" content="noindex,follow"><meta property="og:title" content="${text(data.title)}"><meta property="og:description" content="${text(data.description)}"><meta property="og:type" content="website"><meta name="twitter:card" content="summary"><link rel="stylesheet" href="/src/style.css"><link rel="stylesheet" href="/src/commercial.css"></head><body class="cw-page"><a class="skip" href="#content">Skip to content</a>${navigation({brand:data.brand,links:data.links,quality:scene})}<main id="content">${hero(data.hero,scene)}${gallery(data.gallery)}${story(data.story)}${faq(data.faq)}${conversion(data.conversion)}</main><footer class="cw-footer"><p>${text(data.footer)} · <a href="#content">Back to top</a></p><a href="/">CineWeb3D engine demo</a></footer>${scene?'<script type="module" src="/src/bootstrap.js"></script>':''}</body></html>\n`;
}
