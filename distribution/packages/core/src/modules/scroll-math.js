import {clamp01} from './cinematic.js';
export function sectionProgress(top, height, viewport) {
  if (![top,height,viewport].every(Number.isFinite)) return 0;
  const distance=height-viewport;
  return distance>0 ? clamp01(-top/distance) : (top<=0?1:0);
}
