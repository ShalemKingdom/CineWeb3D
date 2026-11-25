/** Serializable numeric tracks, milliseconds. Linear interpolation; runtime-independent. */
export function createTimelineModel(tracks){
 if(!Array.isArray(tracks))throw TypeError('tracks must be an array');
 const ids=new Set();
 const data=tracks.map(({id,keys})=>{if(typeof id!=='string'||!id||ids.has(id)||!Array.isArray(keys)||!keys.length)throw TypeError('invalid track');ids.add(id);let last=-1;const copy=keys.map(({time,value})=>{if(!Number.isFinite(time)||time<0||time<=last||!Number.isFinite(value))throw TypeError('invalid keyframe');last=time;return {time,value};});return {id,keys:copy};});
 const duration=Math.max(0,...data.map(t=>t.keys.at(-1).time));
 return {duration, sample(time){if(!Number.isFinite(time))throw TypeError('invalid time');return Object.fromEntries(data.map(({id,keys})=>{let a=keys[0];for(const b of keys.slice(1)){if(time<=b.time){const p=Math.max(0,(time-a.time)/(b.time-a.time));return [id,a.value+(b.value-a.value)*p];}a=b;}return [id,a.value];}));},toJSON(){return structuredClone(data);}};
}
