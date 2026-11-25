# AI Director — multimedia recipe / Receta multimedia

The agent is the director, not a bundled AI service. Ask for the product, branding, target platform, owned/reference assets, and whether generation may use local compute. Use the following storyboard as a starting point, not an automatic execution authorization.

| Scene | Visual direction | Asset | Scroll | Fallback |
|---|---|---|---|---|
| 01 | Warm studio, slow camera push toward product | 2–4 second silent clip or Blender scene | 0–40% | Product poster |
| 02 | Detail and soft reveal | Optimized still or 3D model | 40–80% | Accessible HTML description |
| 03 | Product benefit and action | HTML heading and CTA | 80–100% | Same HTML |

1. Run `npm run multimedia:check`; inspect GPU, tools and model rights. Never infer readiness from a GPU name alone.
2. Pick a provider: `wan` for official TI2V-5B, `comfy` for a reviewed local graph, `blender` for the configurable coffee scene, or `user` for supplied media. Use procedural 3D/static artwork if no external producer is available.
3. Write a local prompt, keep private data out of it, prepare the command documented in step 8. First run plan (no execution). Request explicit authorization before heavy generation or rendering.
4. Execute only the chosen backend. Do not automatically switch to a paid API or install models. Review output, source hash and visual quality. Optimize GLB separately.
5. Integrate only approved web variants. Test mobile, reduced motion, keyboard navigation, static fallback and actual scroll playback. Report simulated tests separately from real generation.

Example prompt: Premium ceramic coffee cup, warm amber studio light, restrained slow camera dolly, clean background, stable product shape, no text or logos. Keep a matching static poster.
