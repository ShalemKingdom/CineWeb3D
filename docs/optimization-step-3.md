# Smart Asset Engine / Motor inteligente de recursos (alpha.3)

Optional offline build-time tooling. No paid service, CDN, GPU or model download required by the web runtime. The initial installation requires npm connectivity. Install separately; the root runtime dependencies are unchanged.

## Usage / Uso

```sh
npm run assets:setup
npm run assets:inspect -- generated/blender/coffee/scene.glb
npm run assets:validate -- generated/blender/coffee/scene.glb
npm run assets:optimize -- generated/blender/coffee/scene.glb generated/blender/coffee/web.glb --profile balanced --codec meshopt --max-mib 2
npm run blender:publish -- generated/blender/coffee/web.glb
npm run dev
```

Open `/?model=blender`, select a 3D mode. Generated GLB is ignored by Git; explicitly review before deployment. Publication will not overwrite an existing model; remove/backup it yourself when replacing. Model-only optimization works on other self-contained GLB files; the demo publish gate expects a Blender scene with cameras and animation. Source remains untouched. The default 2 MiB is a configurable build budget, not a measured download or FPS result.

| Profile | Max PNG/JPEG texture dimension | Geometry simplification target |
|---|---:|---:|
| cinematic | 2048 | none |
| balanced | 1024 | none |
| economy | 512 | retain 65% subject to 0.001 error bound |

Choose `--codec meshopt` (default), `--codec draco` or `--codec none`. The CLI uses discrete transforms, not a blanket optimizer that might merge/remove scene objects. Meshopt/Draco quantization, simplification and texture resizing can alter appearance. Inspect the visual result, animations, camera and materials; count/channel checks are not equivalent to semantic equivalence. No automatic multi-LOD swapping or KTX2/Basis decoding in this release. PNG/JPEG resize does not transcode to WebP; existing WebP textures can remain. If optimized candidate is no smaller, the original is retained if within budget; report explicitly identifies that case.

## Validation and safety / Validación y seguridad

- Structural inspection of GLB v2, length/chunk checks, self-contained resources only (no external URI), 100 MiB input limit.
- Khronos validator on source and result; errors block publication, warnings are reported and must be reviewed. The validator may not fully cover every extension.
- Mesh/camera/animation counts and channels preserved; enforce size budget; SHA-256 and byte delta reported. Review visual fidelity manually.
- Atomic exclusive publication and staging cleanup. No original overwrite. Treat inputs as trusted or sandbox them; parsing is not a complete security sandbox.
- The browser adapter configures Meshopt and local Draco assets from installed Three.js, only in the optional imported model chunk. No third-party CDN. Unsupported KTX2/AVIF/KHR meshopt compression is rejected for this alpha.
- `npm test` exercises local logic with synthetic data and mocked validator/codec. Run the manual Blender smoke workflow to exercise real export, CLI, validator and Chromium. Also test Draco separately with `--codec draco`, and inspect whether the report used the original. Validate both codecs with representative models before release. Keep the exact tool lockfile after verified installation. No real compression or visual fidelity proven here.

Upstream references: https://gltf-transform.dev/cli ; https://github.com/KhronosGroup/glTF-Validator/tree/main/node ; https://threejs.org/docs/pages/GLTFLoader.html . The isolated tools manifest pins versions selected from upstream metadata; npm resolution and license audit remain pending.
