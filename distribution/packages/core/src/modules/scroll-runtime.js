import {sectionProgress} from './scroll-math.js';

/** Demand-driven scroll scheduler. Browser services are injected for deterministic tests. */
export function createScrollRuntime({host,doc,reduced,smooth=true,makeLenis,makeObserver}) {
 const entries=new Set(), observed=new Map();
 let lenis, frame=null, disposed=false, dirty=true, clock=0, lastTime=null;
 let offVirtual,offScroll;
 const cancel=()=>{if(frame!==null)host.cancelAnimationFrame(frame);frame=null;lastTime=null;};
 const wake=()=>{if(!disposed&&!doc.hidden&&entries.size&&frame===null)frame=host.requestAnimationFrame(tick);};
 const invalidate=()=>{dirty=true;wake();};
 const observer=makeObserver?.(invalidate);
 function tick(time){
  frame=null;if(disposed||doc.hidden||!entries.size)return;
  // A bounded monotonic clock avoids a large Lenis time step after an idle/hidden interval.
  const delta=lastTime===null?16.667:Math.max(0,Math.min(50,time-lastTime));
  lastTime=time;clock+=delta;
  const moving=lenis?.isScrolling==='smooth';
  if(lenis)lenis.raf(clock);
  if(dirty||moving){
   dirty=false;
   // Batch geometry reads before subscriber writes to avoid forced layout per subscriber.
   const updates=[];const height=host.innerHeight;
   for(const entry of entries){const r=entry.section.getBoundingClientRect();const p=sectionProgress(r.top,r.height,height);if(entry.last!==p)updates.push([entry,p]);}
   for(const [entry,p] of updates){if(disposed||!entries.has(entry))continue;entry.last=p;entry.callback(p);}
  }
  if(dirty||lenis?.isScrolling==='smooth')wake();
  if(frame===null)lastTime=null;
 }
 function releaseLenis(){offVirtual?.();offScroll?.();offVirtual=offScroll=undefined;lenis?.destroy();lenis=undefined;}
 function configure(){
  releaseLenis();clock=0;lastTime=null;
  if(smooth&&!reduced.matches&&entries.size&&makeLenis){
   lenis=makeLenis();
   // virtual-scroll fires before Lenis starts the smoothing animation; wake the next frame.
   offVirtual=lenis.on('virtual-scroll',wake);offScroll=lenis.on('scroll',invalidate);
  }
  invalidate();
 }
 const visibility=()=>{if(doc.hidden)cancel();else invalidate();};
 host.addEventListener('scroll',invalidate,{passive:true});host.addEventListener('resize',invalidate,{passive:true});
 host.addEventListener('pageshow',invalidate);doc.addEventListener('visibilitychange',visibility);reduced.addEventListener('change',configure);
 if(doc.body)observer?.observe(doc.body);
 return {
  subscribe(section,callback){
   if(disposed)throw Error('Scroll engine disposed');if(!section||typeof callback!=='function')throw TypeError('section and callback required');
   const entry={section,callback};entries.add(entry);
   const count=observed.get(section)||0;observed.set(section,count+1);if(!count)observer?.observe(section);
   if(entries.size===1)configure();else invalidate();
   return ()=>{if(!entries.delete(entry))return;const n=observed.get(section)-1;if(n){observed.set(section,n);}else{observed.delete(section);if(section!==doc.body)observer?.unobserve(section);}if(!entries.size){cancel();releaseLenis();}};
  },
  refresh:invalidate,
  destroy(){if(disposed)return;disposed=true;cancel();releaseLenis();observer?.disconnect();entries.clear();observed.clear();host.removeEventListener('scroll',invalidate);host.removeEventListener('resize',invalidate);host.removeEventListener('pageshow',invalidate);doc.removeEventListener('visibilitychange',visibility);reduced.removeEventListener('change',configure);}
 };
}
