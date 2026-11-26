import {mountExperience} from './modules/bootstrap-controller.js';
const loadBlenderModel=(...args)=>import('./modules/blender-model.js').then(m=>m.loadBlenderModel(...args));
mountExperience({loadBlenderModel});
