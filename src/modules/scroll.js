import Lenis from 'lenis';
import {createScrollRuntime} from './scroll-runtime.js';
/** One engine per page. Native scrolling when reduced motion is requested. */
export function createScrollEngine({reduced=matchMedia('(prefers-reduced-motion: reduce)'),smooth=true}={}) {
 return createScrollRuntime({host:window,doc:document,reduced,smooth,
  makeLenis:()=>new Lenis({autoRaf:false}),
  makeObserver:typeof ResizeObserver==='undefined'?undefined:callback=>new ResizeObserver(callback)});
}
