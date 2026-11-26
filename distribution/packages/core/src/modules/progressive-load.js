/** Wait for the static poster (success or failure), then yield to idle, and never start in a hidden tab. */
export function scheduleEnhancement({host,doc,poster,start,timeout=1500}){
 let ended=false,scheduled=false,posterReady=false,idleId=null,timer=null,deadline=null;
 const clear=()=>{if(idleId!==null)host.cancelIdleCallback?.(idleId);if(timer!==null)host.clearTimeout(timer);if(deadline!==null)host.clearTimeout(deadline);idleId=timer=deadline=null;};
 const detach=()=>{doc.removeEventListener('visibilitychange',visibility);poster?.removeEventListener('load',ready);poster?.removeEventListener('error',ready);};
 function run(){scheduled=false;idleId=timer=null;if(ended||doc.hidden)return;ended=true;clear();detach();start();}
 function schedule(){if(ended||scheduled||!posterReady||doc.hidden)return;scheduled=true;if(host.requestIdleCallback)idleId=host.requestIdleCallback(run,{timeout});else timer=host.setTimeout(run,100);}
 function ready(){if(ended)return;posterReady=true;if(deadline!==null)host.clearTimeout(deadline);deadline=null;poster?.removeEventListener('load',ready);poster?.removeEventListener('error',ready);schedule();}
 function visibility(){if(doc.hidden){if(idleId!==null)host.cancelIdleCallback?.(idleId);if(timer!==null)host.clearTimeout(timer);idleId=timer=null;scheduled=false;}else schedule();}
 doc.addEventListener('visibilitychange',visibility);
 if(!poster||poster.complete)ready();else{poster.addEventListener('load',ready);poster.addEventListener('error',ready);deadline=host.setTimeout(ready,timeout);}
 return ()=>{if(ended)return;ended=true;clear();detach();};
}
