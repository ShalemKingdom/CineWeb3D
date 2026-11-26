import {createScrollEngine} from './modules/scroll.js';
import {createVideoSeek} from './modules/video-seek.js';
/** Optional scroll-driven video. Pass the shared engine to avoid duplicate Lenis instances. */
export function attachVideoScroll(video, section, engine) {
 if(!video||!section)throw TypeError('Video and section required');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const own=!engine;engine??=createScrollEngine({reduced,smooth:false});
 const seek=createVideoSeek(video,{onError:error=>console.warn('Video seek unavailable',error)});
 let unsubscribe,disposed=false;
 function setup(){
  unsubscribe?.();unsubscribe=undefined;
  const active=!reduced.matches&&Number.isFinite(video.duration)&&video.duration>0&&video.readyState>=1;
  seek.setActive(false);if(!active)return;
  video.pause();seek.setActive(true);unsubscribe=engine.subscribe(section,p=>seek.request(p));
 }
 function pauseForMotion(){if(reduced.matches)video.pause();setup();}
 video.addEventListener('loadedmetadata',setup);video.addEventListener('durationchange',setup);reduced.addEventListener('change',pauseForMotion);setup();
 return ()=>{if(disposed)return;disposed=true;unsubscribe?.();seek.destroy();if(own)engine.destroy();video.removeEventListener('loadedmetadata',setup);video.removeEventListener('durationchange',setup);reduced.removeEventListener('change',pauseForMotion);};
}
