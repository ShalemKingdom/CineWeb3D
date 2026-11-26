import {browserResourceCache} from './resource-cache.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {AnimationMixer,LoopOnce,LoadingManager} from 'three';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {DRACOLoader} from 'three/addons/loaders/DRACOLoader.js';

/** Optional same-origin loader. Model and decoder files must be reviewed and self-contained. */
export async function loadBlenderModel(url='/models/coffee.glb',{signal,decoderPath='/cineweb3d/draco/'}={}){
 const origin=location.origin,decoder=new URL(decoderPath,location.href);
 if(decoder.origin!==origin||!['http:','https:'].includes(decoder.protocol)||decoder.username||decoder.password||decoder.search||decoder.hash||!decoder.pathname.endsWith('/'))throw Error('Decoder path must be a same-origin directory');
 const allowed=new Set(['draco_decoder.js','draco_decoder.wasm','draco_wasm_wrapper.js'].map(x=>new URL(x,decoder).href));
 const manager=new LoadingManager().setURLModifier(path=>{if(path.startsWith('blob:')||path.startsWith('data:'))return path;const asset=new URL(path,location.href);if(!allowed.has(asset.href))throw Error('External GLB resources are not permitted');return asset.href;});
 const draco=new DRACOLoader(manager).setDecoderPath(decoder.href).setWorkerLimit(2);let gltf;
 try{const bytes=await browserResourceCache().get(url,'glb',{signal});if(signal?.aborted)throw new DOMException('Aborted','AbortError');gltf=await new GLTFLoader(manager).setMeshoptDecoder(MeshoptDecoder).setDRACOLoader(draco).parseAsync(bytes,new URL('.',new URL(url,location.href)).href);}finally{draco.dispose();}
 const root=gltf.scene,mixer=new AnimationMixer(root),clip=gltf.animations.find(c=>c.duration>0),action=clip?mixer.clipAction(clip):null;
 if(action){action.setLoop(LoopOnce,1);action.clampWhenFinished=true;action.play();action.paused=true;}
 let disposed=false;function dispose(){if(disposed)return;disposed=true;mixer.stopAllAction();mixer.uncacheRoot(root);root.removeFromParent();const geometries=new Set(),materials=new Set(),textures=new Set();root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of (Array.isArray(o.material)?o.material:[o.material]))if(m)materials.add(m);});for(const m of materials){for(const v of Object.values(m))if(v?.isTexture)textures.add(v);m.dispose();}for(const t of textures)t.dispose();for(const g of geometries)g.dispose();}
 if(signal?.aborted){dispose();throw new DOMException('Aborted','AbortError');}
 return {root,cameras:gltf.cameras,duration:clip?.duration||0,seek(progress){if(disposed||!action)return;action.enabled=true;action.time=Math.max(0,Math.min(1,Number.isFinite(progress)?progress:0))*clip.duration;mixer.update(0);},dispose};
}
