/** Bounded, page-local cache for explicitly public static assets. No service worker. */
const MiB=1024*1024;
const limits={glb:50*MiB,json:64*1024};
function abortError(){return new DOMException('Resource request aborted','AbortError');}
function cacheLifetime(headers,ttl){
 const directives=(headers.get('cache-control')||'').toLowerCase();
 if(/(?:^|,)\s*(?:no-store|no-cache|private)(?:\s*[=,]|\s*$)/.test(directives)||headers.get('vary')||/no-cache/i.test(headers.get('pragma')||''))return 0;
 const age=/(?:^|,)\s*max-age\s*=\s*"?(\d+)"?/.exec(directives);
 // Require explicit public freshness; the browser handles other HTTP caching.
 if(!age||!/(?:^|,)\s*public\s*(?:,|$)/.test(directives))return 0;
 const remaining=Number(age[1])*1000-Math.max(0,Number(headers.get('age'))||0)*1000;
 return Math.max(0,Math.min(ttl,remaining));
}
async function readBounded(response,limit){
 const declared=response.headers.get('content-length');if(declared!==null&&Number(declared)>limit){await response.body?.cancel();throw Error('Resource exceeds byte limit');}
 if(!response.body){const data=await response.arrayBuffer();if(data.byteLength>limit)throw Error('Resource exceeds byte limit');return data;}
 const reader=response.body.getReader();const chunks=[];let size=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit){await reader.cancel();throw Error('Resource exceeds byte limit');}chunks.push(value);}}finally{reader.releaseLock();}
 const output=new Uint8Array(size);let offset=0;for(const chunk of chunks){output.set(chunk,offset);offset+=chunk.byteLength;}return output.buffer;
}
export function createResourceCache({baseURL,fetcher=globalThis.fetch,now=Date.now,maxBytes=8*MiB,maxEntries=16,ttlMs=5*60*1000}={}){
 const origin=new URL(baseURL).origin,entries=new Map(),pending=new Map();let bytes=0;const counts={hits:0,misses:0,joined:0,evictions:0};
 function resolve(input,kind){const url=new URL(input,baseURL);if(!limits[kind]||url.origin!==origin||!['http:','https:'].includes(url.protocol)||url.username||url.password||!url.pathname.toLowerCase().endsWith('.'+kind))throw Error('Only local static GLB/JSON assets are permitted');url.hash='';return url.href;}
 function remove(key){const item=entries.get(key);if(item){bytes-=item.data.byteLength;entries.delete(key);}}
 function save(key,data,lifetime){if(!lifetime||data.byteLength>maxBytes||maxEntries<1)return;remove(key);entries.set(key,{data,expires:now()+lifetime});bytes+=data.byteLength;while(bytes>maxBytes||entries.size>maxEntries){remove(entries.keys().next().value);counts.evictions++;}}
 function get(input,kind,{signal,priority='auto'}={}){
  if(signal?.aborted)return Promise.reject(abortError());let key;try{key=resolve(input,kind);}catch(error){return Promise.reject(error);}
  const item=entries.get(key);if(item&&item.expires>now()){counts.hits++;entries.delete(key);entries.set(key,item);return Promise.resolve(item.data.slice(0));}remove(key);
  let job=pending.get(key);if(job?.controller.signal.aborted){pending.delete(key);job=null;}
  if(job){counts.joined++;}else{
   counts.misses++;const controller=new AbortController();job={controller,users:0};const current=job;pending.set(key,job);
   job.promise=(async()=>{const response=await fetcher(key,{credentials:'omit',redirect:'error',cache:'default',signal:controller.signal,priority});if(!response.ok||response.status!==200)throw Error(`Resource unavailable (${response.status})`);const data=await readBounded(response,limits[kind]);if(controller.signal.aborted)throw abortError();save(key,data,cacheLifetime(response.headers,ttlMs));return data;})().finally(()=>{if(pending.get(key)===current)pending.delete(key);});
  }
  const active=job;active.users++;
  return new Promise((resolve,reject)=>{let done=false;function finish(){if(done)return false;done=true;signal?.removeEventListener('abort',cancel);active.users--;return true;}function cancel(){if(!finish())return;if(!active.users)active.controller.abort();reject(abortError());}signal?.addEventListener('abort',cancel,{once:true});active.promise.then(data=>{if(finish())resolve(data.slice(0));},error=>{if(finish())reject(error);});if(signal?.aborted)cancel();});
 }
 return {get,async json(url,options){return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(await get(url,'json',options)));},clear(){for(const job of pending.values())job.controller.abort();pending.clear();entries.clear();bytes=0;},stats(){for(const [key,item] of entries)if(item.expires<=now())remove(key);return {...counts,entries:entries.size,bytes,pending:pending.size};}};
}
export function canPrefetch({hidden=false,saveData=false,effectiveType='',reducedMotion=false}={}){return !hidden&&!saveData&&!reducedMotion&&!['slow-2g','2g','3g'].includes(effectiveType);}
let shared;
export function browserResourceCache(){return shared??=createResourceCache({baseURL:location.href});}
