/** Explicit opt-in only. No network endpoint, cookies or analytics by default. */
export async function observeVitals(report,{enabled=false}={}){if(!enabled)return false;if(typeof report!=='function')throw TypeError('A reporting callback is required');const {onLCP,onINP,onCLS}=await import('web-vitals');onLCP(report);onINP(report);onCLS(report);return true;}
