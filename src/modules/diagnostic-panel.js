import {startDiagnosticSession,stopDiagnosticSession} from './diagnostics.js';
import {browserResourceCache} from './resource-cache.js';
/** Only activated by a visitor/developer; no storage, network, polling or RAF. */
export function mountDiagnosticPanel({button,output,host=window,doc=document}){
 let session=null,observers=[],seen=new WeakSet(),startedAt=0,loadEnd=0;
 function ingest(entries){for(const e of entries){if(seen.has(e))continue;seen.add(e);session?.resource(e,{initialPhase:loadEnd>0&&e.responseEnd<=loadEnd});}}
 function render(){if(!session)return;session.cacheStats(browserResourceCache().stats());output.textContent=JSON.stringify(session.report(),null,2);}
 function stop(){for(const o of observers)o.disconnect();observers=[];stopDiagnosticSession();session=null;output.textContent='';output.hidden=true;button.textContent='Start local diagnostics';button.setAttribute('aria-pressed','false');}
 function start(){session=startDiagnosticSession();seen=new WeakSet();startedAt=host.performance.now();const nav=host.performance.getEntriesByType('navigation')[0];loadEnd=nav?.loadEventEnd||0;if(nav)ingest([nav]);
 // Use buffered observer OR snapshot, not both (avoid duplicate entries).
 try{const o=new host.PerformanceObserver(list=>ingest(list.getEntries()));o.observe({type:'resource',buffered:true});observers.push(o);}catch{ingest(host.performance.getEntriesByType('resource'));session.issue('observer');}
 if(host.PerformanceObserver?.supportedEntryTypes?.includes('longtask')){try{const o=new host.PerformanceObserver(list=>{for(const e of list.getEntries())if(e.startTime>=startedAt)session?.issue('long-task');});o.observe({type:'longtask'});observers.push(o);}catch{session.issue('observer');}}
 output.hidden=false;button.textContent='Stop local diagnostics';button.setAttribute('aria-pressed','true');render();}
 const toggle=()=>session?stop():start();button.addEventListener('click',toggle);const refresh=doc.querySelector('#diagnostic-refresh');refresh?.addEventListener('click',render);host.addEventListener('pagehide',stop);return ()=>{stop();button.removeEventListener('click',toggle);refresh?.removeEventListener('click',render);host.removeEventListener('pagehide',stop);};
}
