/** Adaptive render budgets, independent of browser and Three.js. */
export const renderTiers = Object.freeze(['economy', 'balanced', 'cinematic']);
const profiles = Object.freeze({
 economy: Object.freeze({pixelRatio:.8,maxPixels:750_000,particles:0,segments:24,shadows:false}),
 balanced: Object.freeze({pixelRatio:1.2,maxPixels:1_500_000,particles:48,segments:40,shadows:false}),
 cinematic: Object.freeze({pixelRatio:1.5,maxPixels:2_500_000,particles:100,segments:64,shadows:true})
});
export function renderBudget(tier){return profiles[tier]??profiles.economy;}
export function effectivePixelRatio({tier,width,height,devicePixelRatio=1,maxDimension=Infinity}){
 const p=renderBudget(tier), w=Math.max(1,Number.isFinite(width)?width:1),h=Math.max(1,Number.isFinite(height)?height:1);
 const dpr=Number.isFinite(devicePixelRatio)&&devicePixelRatio>0?devicePixelRatio:1;
 return Math.min(dpr,p.pixelRatio,Math.sqrt(p.maxPixels/(w*h)),maxDimension/Math.max(w,h));
}
/** Consecutive active-frame windows, hysteresis and cooldown; not a GPU benchmark. */
export function createQualityController({ceiling='cinematic',onChange=()=>{},windowSize=12,downFps=36,upFps=52}={}){
 const max=Math.max(0,renderTiers.indexOf(ceiling));let level=max, samples=[],bad=0,good=0,cooldown=0,lastFps=null;
 function reset(){samples=[];bad=good=0;lastFps=null;}
 function sample(ms){
  if(!Number.isFinite(ms)||ms<=0||ms>250){reset();return;}
  samples.push(ms);if(samples.length<windowSize)return;
  lastFps=1000/(samples.reduce((a,b)=>a+b,0)/samples.length);samples=[];
  if(cooldown){cooldown--;bad=good=0;return;}
  if(lastFps<downFps){bad++;good=0;}else if(lastFps>upFps){good++;bad=0;}else{good=bad=0;}
  let next=level;if(bad>=2&&level>0)next--;else if(good>=3&&level<max)next++;
  if(next!==level){level=next;bad=good=0;cooldown=2;onChange(renderTiers[level],lastFps);}
 }
 return {sample,reset,get tier(){return renderTiers[level];},get fps(){return lastFps;}};
}
/** Coalesces render requests. No autonomous RAF loop; samples active bursts only. */
export function createRenderScheduler({requestFrame,cancelFrame,now,draw,onInterval=()=>{},onIdle=()=>{},maxGap=250}){
 let frame=null,disposed=false,visible=true,lastRequest=null,lastFrame=null;
 function reset(){lastRequest=lastFrame=null;onIdle();}
 function tick(timestamp){
  frame=null;if(disposed||!visible)return;
  if(lastFrame!==null){const delta=timestamp-lastFrame;if(delta>0&&delta<=maxGap)onInterval(delta);else onIdle();}
  if(disposed||!visible)return;lastFrame=timestamp;draw();
 }
 function request(){if(disposed||!visible)return;const time=now();if(lastRequest===null||time-lastRequest>maxGap)reset();lastRequest=time;if(frame===null)frame=requestFrame(tick);}
 function stop(){if(frame!==null)cancelFrame(frame);frame=null;reset();}
 return {request,reset,setVisible(value){visible=Boolean(value);if(!visible)stop();else reset();},destroy(){if(disposed)return;disposed=true;stop();}};
}
