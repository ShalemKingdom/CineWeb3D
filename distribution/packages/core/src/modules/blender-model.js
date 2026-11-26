import {browserResourceCache} from './resource-cache.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {AnimationMixer, LoopOnce, LoadingManager} from 'three';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {DRACOLoader} from 'three/addons/loaders/DRACOLoader.js';
import dracoJS from 'three/addons/libs/draco/gltf/draco_decoder.js?url';
import dracoWasm from 'three/addons/libs/draco/gltf/draco_decoder.wasm?url';
import dracoWrapper from 'three/addons/libs/draco/gltf/draco_wasm_wrapper.js?url';

// Local asset only. The authored scene is optional and never fetched in Lite mode.
export async function loadBlenderModel(url = `${import.meta.env.BASE_URL}models/coffee.glb`, {signal}={}) {
 const decoderFiles={'draco_decoder.js':dracoJS,'draco_decoder.wasm':dracoWasm,'draco_wasm_wrapper.js':dracoWrapper};
 const manager=new LoadingManager().setURLModifier(path=>decoderFiles[path.split('/').pop()]??path);
 const draco=new DRACOLoader(manager).setWorkerLimit(2);
 let gltf;
 try{const data=await browserResourceCache().get(url,'glb',{signal});if(signal?.aborted)throw new DOMException('Aborted','AbortError');gltf=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).setDRACOLoader(draco).parseAsync(data,new URL('.',new URL(url,location.href)).href);}
 finally{draco.dispose();}
 const root=gltf.scene, mixer=new AnimationMixer(root);
 const clip=gltf.animations.find(c=>c.duration>0);
 const action=clip?mixer.clipAction(clip):null;
 if(action){action.setLoop(LoopOnce,1);action.clampWhenFinished=true;action.play();action.paused=true;}
 let disposed=false;
 return {root,cameras:gltf.cameras,duration:clip?.duration||0,
  seek(progress){if(disposed||!action)return;action.enabled=true;action.time=Math.max(0,Math.min(1,Number.isFinite(progress)?progress:0))*clip.duration;mixer.update(0);},
  dispose(){if(disposed)return;disposed=true;mixer.stopAllAction();mixer.uncacheRoot(root);root.removeFromParent();const geometries=new Set(),materials=new Set(),textures=new Set();root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of (Array.isArray(o.material)?o.material:[o.material]))if(m)materials.add(m);});for(const m of materials){for(const v of Object.values(m))if(v?.isTexture)textures.add(v);m.dispose();}for(const t of textures)t.dispose();for(const g of geometries)g.dispose();}
 };
}
