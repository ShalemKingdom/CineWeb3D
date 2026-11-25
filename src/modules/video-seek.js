import {videoTime} from './cinematic.js';
/** Latest target wins; at most one in-flight seek, no polling loop. */
export function createVideoSeek(video,{epsilon=.035,onError=()=>{}}={}) {
 let pending=null,active=true,disposed=false;
 function flush(){
  if(disposed||!active||pending===null||video.seeking||!Number.isFinite(video.duration)||video.duration<=0||video.readyState<1)return;
  const p=pending;pending=null;const time=videoTime(p,video.duration);
  const tolerance=(p===0||p===1)?Math.min(.001,epsilon):epsilon;
  if(Math.abs(video.currentTime-time)<=tolerance)return;
  try{video.currentTime=time;}catch(error){onError(error);}
 }
 video.addEventListener('seeked',flush);video.addEventListener('loadedmetadata',flush);video.addEventListener('durationchange',flush);
 return {
  request(progress){if(disposed||!active)return;pending=Number.isFinite(progress)?Math.max(0,Math.min(1,progress)):0;flush();},
  setActive(value){if(disposed)return;active=Boolean(value);if(!active)pending=null;else flush();},
  destroy(){if(disposed)return;disposed=true;pending=null;video.removeEventListener('seeked',flush);video.removeEventListener('loadedmetadata',flush);video.removeEventListener('durationchange',flush);}
 };
}
