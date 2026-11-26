import {mountExperience} from '../modules/bootstrap-controller.js';
/** Mount after the DOM exists; dispose before an Astro client-side swap. */
export function mountAstroExperience({doc=document,mount=mountExperience,...options}={}){let disposed=false;const stop=mount({doc,...options});function dispose(){if(disposed)return;disposed=true;doc.removeEventListener('astro:before-swap',dispose);stop();}doc.addEventListener('astro:before-swap',dispose,{once:true});return dispose;}
