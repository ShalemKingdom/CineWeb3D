import {diagnosticSession} from './modules/diagnostics.js';
import {scheduleEnhancement} from './modules/progressive-load.js';
import {detectMode} from './modules/performance.js';
const canvas=document.querySelector('#scene'),poster=document.querySelector('#scene-poster'),select=document.querySelector('#quality'),status=document.querySelector('#quality-status');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');let scene=null,revision=0,selected='auto',ready=false,interacted=false;
function fallback(message){canvas.hidden=true;poster.classList.remove('enhanced');status.textContent=message;}
async function apply(){const id=++revision;scene?.destroy();scene=null;if(selected==='auto'&&innerWidth<1024&&!interacted&&!reduced.matches&&!navigator.connection?.saveData){fallback('Auto: scroll to activate 3D. Static illustration.');return;}const mode=detectMode(selected);fallback(`Visual quality: ${mode}. Static illustration.`);diagnosticSession()?.quality(mode);if(!ready||document.hidden||mode==='accessible'||mode==='lite')return;
 try{const {mountScene}=await import('./main.js');if(id!==revision||document.hidden)return;scene=mountScene(canvas,mode,()=>{revision++;scene?.destroy();scene=null;fallback('3D unavailable. Static illustration shown.');},tier=>{if(id===revision)status.textContent=`Visual quality: ${tier}. Interactive 3D.`;});canvas.hidden=false;poster.classList.add('enhanced');}catch(e){if(id===revision){diagnosticSession()?.issue('bootstrap');fallback('3D unavailable. Static illustration shown.');console.warn(e);}}}
function activate(){if(interacted)return;interacted=true;window.removeEventListener('scroll',activate);if(ready&&selected==='auto')apply();}
window.addEventListener('scroll',activate,{passive:true});
select.addEventListener('change',()=>{selected=select.value;interacted=true;window.removeEventListener('scroll',activate);apply();});reduced.addEventListener('change',apply);navigator.connection?.addEventListener?.('change',apply);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&ready&&!scene)apply();});
scheduleEnhancement({host:window,doc:document,poster:poster.querySelector('img'),start:()=>{ready=true;apply();}});

const diagnosticButton=document.querySelector("#diagnostic-toggle");
if(diagnosticButton)diagnosticButton.addEventListener("click",async()=>{diagnosticButton.disabled=true;try{const {mountDiagnosticPanel}=await import("./modules/diagnostic-panel.js");mountDiagnosticPanel({button:diagnosticButton,output:document.querySelector("#diagnostic-output")});diagnosticButton.disabled=false;diagnosticButton.click();}catch{diagnosticButton.disabled=false;document.querySelector("#diagnostic-output").hidden=false;document.querySelector("#diagnostic-output").textContent="Diagnostics unavailable.";}},{once:true});
