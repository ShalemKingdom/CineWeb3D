import {browserResourceCache,canPrefetch} from './modules/resource-cache.js';
import {selectVideoProfile} from './modules/video-profile.js';
import {attachVideoScroll} from './video-scroll.js';
/** User-initiated progressive enhancement. Manifest must be a trusted same-origin local asset. */
export async function mountSmartVideo(video,section,manifestUrl,{engine,scroll=true}={}){
 const url=new URL(manifestUrl,location.href);
 if(url.origin!==location.origin)throw new Error('Use a local video manifest');
 const manifest=await browserResourceCache().json(url);
 if(manifest.version!==1||manifest.purpose!=='scroll')throw new Error('Unsupported video manifest');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const connection=navigator.connection;
 const variant=selectVideoProfile(manifest.variants,{width:innerWidth,saveData:connection?.saveData,effectiveType:connection?.effectiveType,reducedMotion:reduced.matches,explicit:true});
 if(!variant||!['mobile.mp4','desktop.mp4'].includes(variant.file)||manifest.poster?.file!=='poster.jpg')throw new Error('Invalid video assets');
 video.pause();video.muted=true;video.playsInline=true;video.controls=true;video.preload='metadata';video.poster=new URL('poster.jpg',url).href;
 video.src=new URL(variant.file,url).href;
 const detach=scroll?attachVideoScroll(video,section,engine):()=>{};
 return ()=>{detach();video.pause();video.removeAttribute('src');video.load();};
}

/** Only prefetch the small manifest on user intent; never prefetch a video. */
export function prefetchVideoManifest(url,{signal}={}){
 const connection=navigator.connection;
 if(!canPrefetch({hidden:document.hidden,saveData:connection?.saveData,effectiveType:connection?.effectiveType,reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches}))return Promise.resolve(null);
 return browserResourceCache().json(url,{signal,priority:'low'});
}
