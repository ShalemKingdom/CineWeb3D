import {diagnosticSession} from './diagnostics.js';
import {scheduleEnhancement} from './progressive-load.js';
import {detectMode} from './performance.js';

/** Mount the existing semantic experience and return an idempotent cleanup function. */
export function mountExperience({doc=document,host=window,loadBlenderModel=null}={}){
 const canvas=doc.querySelector('#scene'),poster=doc.querySelector('#scene-poster'),select=doc.querySelector('#quality'),status=doc.querySelector('#quality-status');
 if(!canvas||!poster||!select||!status)throw Error('CineWeb3D scene requires scene, poster, quality and status elements');
 const es=doc.documentElement.lang==='es',msg=(en,sp)=>es?sp:en,reduced=host.matchMedia('(prefers-reduced-motion: reduce)');let scene=null,revision=0,selected='auto',ready=false,interacted=false,destroyed=false,disposeDiagnostics=null;
 const displayMode=mode=>es&&canvas.hasAttribute('data-coffee-lab')?({cinematic:'cinematográfica',balanced:'equilibrada',accessible:'accesible',lite:'ligera',economy:'económica'}[mode]||mode):mode;
 function fallback(message){canvas.hidden=true;poster.classList.remove('enhanced');status.textContent=message;}
 async function apply(){if(destroyed)return;const id=++revision;scene?.destroy();scene=null;if(selected==='auto'&&host.innerWidth<1024&&!interacted&&!reduced.matches&&!navigator.connection?.saveData){fallback(msg('Auto: scroll to activate 3D. Static illustration.','Automática: desplázate para activar el 3D. Ilustración estática.'));return;}const mode=detectMode(selected);fallback(msg(`Visual quality: ${mode}. Static illustration.`,`Calidad visual: ${displayMode(mode)}. Ilustración estática.`));diagnosticSession()?.quality(mode);if(!ready||doc.hidden||mode==='accessible'||mode==='lite')return;
  try{const {mountScene}=await import('../main.js');if(destroyed||id!==revision||doc.hidden)return;scene=mountScene(canvas,mode,()=>{if(destroyed)return;revision++;scene?.destroy();scene=null;fallback(msg('3D unavailable. Static illustration shown.','3D no disponible. Se muestra la ilustración estática.'));},tier=>{if(!destroyed&&id===revision)status.textContent=msg(`Visual quality: ${tier}. Interactive 3D.`,`Calidad visual: ${displayMode(tier)}. 3D interactivo.`);},loadBlenderModel);canvas.hidden=false;poster.classList.add('enhanced');}catch(e){if(!destroyed&&id===revision){diagnosticSession()?.issue('bootstrap');fallback(msg('3D unavailable. Static illustration shown.','3D no disponible. Se muestra la ilustración estática.'));console.warn(e);}}}
 function activate(){if(interacted)return;interacted=true;host.removeEventListener('scroll',activate);if(ready&&selected==='auto')apply();}
 function change(){selected=select.value;interacted=true;host.removeEventListener('scroll',activate);apply();}
 function visibility(){if(!doc.hidden&&ready&&!scene)apply();}
 host.addEventListener('scroll',activate,{passive:true});select.addEventListener('change',change);reduced.addEventListener('change',apply);navigator.connection?.addEventListener?.('change',apply);doc.addEventListener('visibilitychange',visibility);
 const cancel=scheduleEnhancement({host,doc,poster:poster.querySelector('img'),start:()=>{ready=true;apply();}});
 const diagnosticButton=doc.querySelector('#diagnostic-toggle');
 async function diagnostics(){diagnosticButton.disabled=true;try{const {mountDiagnosticPanel}=await import('./diagnostic-panel.js');if(destroyed)return;disposeDiagnostics=mountDiagnosticPanel({button:diagnosticButton,output:doc.querySelector('#diagnostic-output'),host,doc});diagnosticButton.disabled=false;diagnosticButton.click();}catch{if(!destroyed){diagnosticButton.disabled=false;doc.querySelector('#diagnostic-output').hidden=false;doc.querySelector('#diagnostic-output').textContent='Diagnostics unavailable.';}}}
 diagnosticButton?.addEventListener('click',diagnostics,{once:true});
 return ()=>{if(destroyed)return;destroyed=true;revision++;cancel();scene?.destroy();scene=null;disposeDiagnostics?.();host.removeEventListener('scroll',activate);select.removeEventListener('change',change);reduced.removeEventListener('change',apply);navigator.connection?.removeEventListener?.('change',apply);doc.removeEventListener('visibilitychange',visibility);diagnosticButton?.removeEventListener('click',diagnostics);canvas.hidden=true;poster.classList.remove('enhanced');};
}
