/** Choose once before loading; do not switch sources while a video is being scrubbed. */
export function selectVideoProfile(variants,{width=0,saveData=false,effectiveType='',reducedMotion=false,explicit=false}={}){
 if(reducedMotion&&!explicit)return null;
 const low=saveData||['slow-2g','2g','3g'].includes(effectiveType)||!Number.isFinite(width)||width<900;
 return (low?variants?.mobile:variants?.desktop)??(low?variants?.desktop:variants?.mobile)??null;
}
