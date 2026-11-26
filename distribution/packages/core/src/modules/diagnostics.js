/** Local-only, bounded diagnostic sessions. No analytics or autonomous frame loop. */
export const defaultBudgets=Object.freeze({model:2*1024**2,image:200*1024,video:5*1024**2,mobileVideo:2*1024**2,initialTransfer:1024**2,minFps:30,slowFrame:50});
export function assetKind(path=''){
 const p=String(path).split(/[?#]/)[0].toLowerCase();
 if(/\.(glb|gltf)$/.test(p))return 'model';if(/\.(png|jpe?g|webp|avif|svg|gif)$/.test(p))return 'image';if(/\.(mp4|webm|mov)$/.test(p))return 'video';return 'other';
}
export function createDiagnostics({budgets=defaultBudgets,maxResources=256,maxFrames=120}={}){
 const limits={...defaultBudgets,...budgets},frames=[],resources=new Map(),issues=new Map();let transfer=0,initial=0,unknown=0,duplicates=0,overflow=0,resourceCount=0,initialKnown=0,initialUnknown=0,tier=null,gpu=null,cache=null,active=true;
 const num=n=>Number.isFinite(n)&&n>=0?n:null;
 function issue(code){if(active&&['render','context-lost','model','bootstrap','video','observer','long-task'].includes(code))issues.set(code,(issues.get(code)||0)+1);}
 function frame(ms){if(!active||!Number.isFinite(ms)||ms<=0||ms>250)return;frames.push(ms);if(frames.length>maxFrames)frames.shift();}
 function resource(entry,{initialPhase=false}={}){
  if(!active)return;resourceCount++;const size=num(entry.encodedBodySize),wire=num(entry.transferSize),decoded=num(entry.decodedBodySize);
  if(wire>0){transfer+=wire;if(initialPhase){initial+=wire;initialKnown++;}}else if(!(size>0||decoded>0)){unknown++;if(initialPhase)initialUnknown++;}
  // Keep keys internal, HTTP(S) only; never include URLs in reports.
  let key;try{const u=new URL(entry.name);if(!['http:','https:'].includes(u.protocol))return;key=u.origin+u.pathname+u.search;}catch{return;}
  const old=resources.get(key);if(old){old.requests++;if(wire>0&&old.wire>0)duplicates++;old.wire+=wire||0;old.size=Math.max(old.size,size||0);return;}
  if(resources.size>=maxResources){overflow++;return;}
  const kind=assetKind(key);const limit=kind==='video'&&/\/mobile\.mp4(?:\?|$)/i.test(key)?limits.mobileVideo:limits[kind];resources.set(key,{kind,limit,size:size||0,wire:wire||0,requests:1});
 }
 function report(){const avg=frames.length?frames.reduce((a,b)=>a+b,0)/frames.length:null;const fps=avg?Math.round(1000/avg*10)/10:null;const sorted=[...frames].sort((a,b)=>a-b);const groups={};let overBudget=0;for(const r of resources.values()){const g=groups[r.kind]??={count:0,encodedBytes:0,largestBytes:0};g.count++;g.encodedBytes+=r.size;g.largestBytes=Math.max(g.largestBytes,r.size);if(r.limit&&r.size>r.limit)overBudget++;}
 const recommendations=[];if(fps!==null&&frames.length>=12&&fps<limits.minFps)recommendations.push('Lower render quality; reduce shadows and geometry.');if(overBudget)recommendations.push('Optimize oversized models, images or videos with the asset/video engines.');if(initial>limits.initialTransfer)recommendations.push('Reduce initial transferred bytes; defer noncritical resources.');if(duplicates)recommendations.push('Review repeated network transfers and cache headers.');if(issues.size)recommendations.push('Review diagnostic events and verify fallback behavior.');if(unknown||overflow)recommendations.push('Resource timing is incomplete; verify with browser network tools.');
 return {active,tier,activeFrames:frames.length,fps,frameP95Ms:sorted.length?Math.round(sorted[Math.ceil(sorted.length*.95)-1]*10)/10:null,slowFrames:frames.filter(n=>n>limits.slowFrame).length,resources:{observed:resourceCount,tracked:resources.size,overflow,knownTransferBytes:transfer,initialKnownTransferBytes:initial,initialKnown,initialUnknown,unknownSizeEntries:unknown,repeatedTransfers:duplicates,overBudget,groups},gpu,cache,events:Object.fromEntries(issues),recommendations};}
 return {frame,resource,issue,quality(value){if(active&&['economy','balanced','cinematic','lite','accessible'].includes(value))tier=value;},graphics(value){if(active)gpu=Object.fromEntries(['geometries','textures','drawCalls','triangles','pixels'].map(k=>[k,num(value[k])]));},cacheStats(value){if(active)cache=Object.fromEntries(['hits','misses','joined','evictions','entries','bytes','pending'].map(k=>[k,num(value[k])]));},report,stop(){active=false;resources.clear();frames.length=0;gpu=cache=null;}};
}
let current=null;
export function diagnosticSession(){return current;}
export function startDiagnosticSession(options){current?.stop();return current=createDiagnostics(options);}
export function stopDiagnosticSession(){current?.stop();current=null;}
