/** Pure functions for cinematic scroll and quality budgets. */
export function clamp01(x) { return Number.isFinite(x) ? Math.min(1, Math.max(0, x)) : 0; }
export function qualityProfile(width, reduced = false) {
  return width < 768 || reduced ? { pixelRatio: 1, particles: 36, motion: !reduced } : { pixelRatio: 1.5, particles: 100, motion: true };
}
export function cinematicPose(progress) {
  const p = clamp01(progress);
  return { rotation: p * Math.PI * 2, cameraZ: 7 - 1.5 * Math.sin(p * Math.PI), explosion: Math.sin(p * Math.PI) };
}
export function videoTime(progress, duration) {
  return Number.isFinite(duration) && duration > 0 ? Math.min(Math.max(0, duration - .001), clamp01(progress) * duration) : 0;
}
