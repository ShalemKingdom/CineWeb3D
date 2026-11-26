import {mountExperience} from '../modules/bootstrap-controller.js';
/** Call only in a client effect and return the cleanup from that effect. */
export function mountNextExperience(options){return mountExperience(options);}
