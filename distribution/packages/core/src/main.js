import {diagnosticSession} from './modules/diagnostics.js';
import * as THREE from 'three';
import {createTimeline} from 'animejs';
import {createScrollEngine} from './modules/scroll.js';
import {cinematicPose} from './modules/cinematic.js';
import {createQualityController,createRenderScheduler,effectivePixelRatio,renderBudget} from './modules/smart-render.js';

export function mountScene(canvas,mode,onLost,onQuality=()=>{}){
 const showcase=canvas.dataset.layout==='showcase', coffeeLab=canvas.hasAttribute('data-coffee-lab');
 const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:mode==='cinematic'}),scene=new THREE.Scene();
 const camera=new THREE.PerspectiveCamera(42,innerWidth/Math.max(1,innerHeight),.1,100);camera.position.set(0,2,7);camera.lookAt(0,0,0);
 const cup=new THREE.Group();scene.add(cup);
 const ceramic=new THREE.MeshStandardMaterial({color:0xe9d5b5,roughness:.34,side:THREE.DoubleSide});
 if(showcase)ceramic.color.setHex(0xf3e4ca);
 const coffeeMaterial=new THREE.MeshStandardMaterial({color:0x49230f});
 const profile=[[0,-.85],[.66,-.85],[.78,-.7],[.98,.8],[.91,.8],[.72,-.65],[0,-.65]].map(([x,y])=>new THREE.Vector2(x,y));
 const geometryCache=new Map();
 function geometrySet(segments){if(!geometryCache.has(segments))geometryCache.set(segments,[new THREE.LatheGeometry(profile,segments),new THREE.TorusGeometry(.48,.11,12,segments),new THREE.CircleGeometry(.88,segments)]);return geometryCache.get(segments);}
 const initial=renderBudget(mode),geometries=geometrySet(initial.segments);
 const body=new THREE.Mesh(geometries[0],ceramic),handle=new THREE.Mesh(geometries[1],ceramic),coffee=new THREE.Mesh(geometries[2],coffeeMaterial);
 handle.position.set(.94,0,0);coffee.rotation.x=-Math.PI/2;coffee.position.y=.71;cup.add(body,handle,coffee);
 const extras=[];
 if(showcase){
  const saucerGeometry=new THREE.CylinderGeometry(1.43,1.24,.12,48),saucerMaterial=new THREE.MeshStandardMaterial({color:0xd8c5a7,roughness:.48});
  const saucer=new THREE.Mesh(saucerGeometry,saucerMaterial);saucer.position.y=-.94;cup.add(saucer);extras.push(saucer);
  const beanGeometry=new THREE.SphereGeometry(1,12,8),beanMaterial=new THREE.MeshStandardMaterial({color:0x71432a,roughness:.8});
  for(let i=0;i<6;i++){const bean=new THREE.Mesh(beanGeometry,beanMaterial),angle=i*2.39996;bean.scale.set(.19,.095,.12);bean.position.set(Math.cos(angle)*1.75,coffeeLab?-.5+i*.3:-.84,Math.sin(angle)*1.75);bean.rotation.y=angle;cup.add(bean);extras.push(bean);}
 }
 scene.add(new THREE.HemisphereLight(0xffe8ce,0x302018,2));const key=new THREE.DirectionalLight(0xffd0a1,3);key.position.set(3,5,4);scene.add(key);
 key.shadow.mapSize.set(512,512);Object.assign(key.shadow.camera,{left:-4,right:4,top:4,bottom:-4,near:.5,far:20});key.shadow.camera.updateProjectionMatrix();key.shadow.normalBias=.025;
 const positions=new Float32Array(initial.particles*3);for(let i=0;i<initial.particles;i++){const a=i*2.39996,r=2.2+(i%7)*.13;positions.set([Math.cos(a)*r,((i%13)-6)*.25,Math.sin(a)*r],i*3);}
 const particleGeometry=new THREE.BufferGeometry();particleGeometry.setAttribute('position',new THREE.BufferAttribute(positions,3));const particles=new THREE.Points(particleGeometry,new THREE.PointsMaterial({color:0xe6ad72,size:.035,transparent:true,opacity:.65}));scene.add(particles);
 const state={progress:0};const timeline=createTimeline({autoplay:false}).add(state,{progress:[0,1],duration:1000,ease:'linear'});
 let disposed=false,lastProgress=0,blenderModel=null,inView=true;const modelRequest=new AbortController();
 const gl=renderer.getContext(), viewport=gl.getParameter(gl.MAX_VIEWPORT_DIMS),maxDimension=Math.min(renderer.capabilities.maxTextureSize,gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),viewport[0],viewport[1]);
 function size(){const width=Math.max(1,showcase?canvas.parentElement.clientWidth:innerWidth),height=Math.max(1,showcase?canvas.parentElement.clientHeight:innerHeight);renderer.setPixelRatio(effectivePixelRatio({tier:controller.tier,width,height,devicePixelRatio:window.devicePixelRatio,maxDimension}));renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();}
 function applyQuality(tier){
  const p=renderBudget(tier),g=geometrySet(p.segments);
  if(body.geometry!==g[0]){for(const mesh of [body,handle,coffee])mesh.geometry.dispose();[body.geometry,handle.geometry,coffee.geometry]=g;}
  particleGeometry.setDrawRange(0,Math.min(initial.particles,p.particles));particles.visible=p.particles>0;
  renderer.shadowMap.enabled=p.shadows;key.castShadow=p.shadows;
  for(const mesh of [body,handle,coffee]){mesh.castShadow=p.shadows;mesh.receiveShadow=p.shadows;mesh.material.needsUpdate=true;}
  // Imported models keep their authored geometry; only resolution and scene effects adapt.
  size();diagnosticSession()?.quality(tier);onQuality(tier);
 }
 const controller=createQualityController({ceiling:mode,onChange:applyQuality});
 const scheduler=createRenderScheduler({requestFrame:cb=>requestAnimationFrame(cb),cancelFrame:id=>cancelAnimationFrame(id),now:()=>performance.now(),draw:()=>{try{render();}catch(error){diagnosticSession()?.issue('render');console.warn('3D render failed; using static fallback.',error);onLost?.();}},onInterval:ms=>{try{diagnosticSession()?.frame(ms);controller.sample(ms);}catch(error){diagnosticSession()?.issue('render');console.warn('Quality update failed.',error);onLost?.();}},onIdle:()=>controller.reset()});
 function render(){if(disposed||document.hidden)return;timeline.seek(lastProgress*1000);const pose=cinematicPose(state.progress);cup.rotation.y=pose.rotation;cup.position.x=showcase?0:innerWidth>700?1.7:0;cup.position.y=showcase?0:innerWidth>700?0:-.8;camera.position.z=showcase?Math.max(6.5,pose.cameraZ):pose.cameraZ+(innerWidth<=700?1.4:0);if(coffeeLab){camera.position.x=Math.sin(state.progress*Math.PI)*.7;camera.position.y=2-state.progress*.8;extras.slice(1).forEach((bean,i)=>{bean.position.y=-.5+i*.3+Math.sin(state.progress*Math.PI*2+i)*.22;bean.rotation.z=state.progress*Math.PI+i*.3;});}if(showcase)canvas.dataset.progress=state.progress.toFixed(3);camera.lookAt(0,0,0);handle.position.x=.94+(showcase?0:pose.explosion*.55);if(blenderModel){blenderModel.root.position.copy(cup.position);blenderModel.seek(state.progress);}renderer.render(scene,camera);const diag=diagnosticSession();if(diag){diag.quality(controller.tier);diag.graphics({geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,pixels:canvas.width*canvas.height});}}
 const draw=progress=>{lastProgress=progress;scheduler.request();};
 const resize=()=>{scheduler.reset();size();scheduler.request();};
 const scroll=createScrollEngine();const unsub=scroll.subscribe(showcase?canvas.closest('.g-hero'):document.querySelector('main'),draw);
 const visibility=()=>{scheduler.setVisible(!document.hidden&&inView);if(!document.hidden&&inView){size();scheduler.request();}};
 const lost=event=>{event.preventDefault();diagnosticSession()?.issue('context-lost');onLost?.();};
 addEventListener('resize',resize);document.addEventListener('visibilitychange',visibility);canvas.addEventListener('webglcontextlost',lost);
 const observer=showcase&&typeof IntersectionObserver!=='undefined'?new IntersectionObserver(entries=>{inView=entries[0]?.isIntersecting??false;visibility();}):null;
 observer?.observe(canvas.parentElement);
 applyQuality(controller.tier);visibility();
 canvas.dataset.model="procedural";
 const useBlender=!showcase&&new URLSearchParams(location.search).get('model')==='blender';
 if(useBlender)import('./modules/blender-model.js').then(m=>m.loadBlenderModel(undefined,{signal:modelRequest.signal})).then(model=>{if(disposed){model.dispose();return;}blenderModel=model;scene.add(model.root);cup.visible=false;canvas.dataset.model="blender";scheduler.reset();scheduler.request();}).catch(e=>{if(!disposed){diagnosticSession()?.issue('model');console.warn('Blender GLB unavailable; using procedural cup.',e);}});
 return {get tier(){return controller.tier;},destroy(){if(disposed)return;disposed=true;modelRequest.abort();scheduler.destroy();observer?.disconnect();for(const geometry of new Set(extras.map(m=>m.geometry)))geometry.dispose();for(const material of new Set(extras.map(m=>m.material)))material.dispose();blenderModel?.dispose();unsub();scroll.destroy();timeline.cancel();removeEventListener('resize',resize);document.removeEventListener('visibilitychange',visibility);canvas.removeEventListener('webglcontextlost',lost);for(const set of geometryCache.values())for(const g of set)g.dispose();geometryCache.clear();particleGeometry.dispose();particles.material.dispose();ceramic.dispose();coffeeMaterial.dispose();key.shadow.dispose();renderer.dispose();}};
}
