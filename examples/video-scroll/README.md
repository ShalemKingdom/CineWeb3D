# Video scroll example
Use a scroll section taller than the viewport (e.g. 300vh) containing a sticky wrapper (position: sticky; top: 0; height: 100vh). Add a muted playsinline video with poster and preload=metadata; keep the video controls available for reduced motion. Import attachVideoScroll from ../../src/video-scroll.js and pass video and section elements. Call returned cleanup when unmounting. Use your licensed local clip; no assets bundled. Browser validation pending.

The controller retains only the newest requested progress while the media element is seeking. It applies that request on `seeked`; reduced motion clears pending work and leaves native controls available. Real codec/keyframe seek latency varies; test your own clip.

Alpha 4: use the local [Smart Video Engine](../../docs/optimization-step-4.md) to generate variants and a manifest. The optional `index.html` example is served by Vite in development at `/examples/video-scroll/index.html`; no asset is loaded until the visitor selects scroll or manual playback. Review and copy the completed directory to `public/media/coffee/` before use. The example is not an additional production entry. No video is bundled.

See [Smart Cache Engine](../../docs/optimization-step-5.md) for intent-based manifest prefetch and production cache headers.
