# Repository and license catalog / Catálogo
Reviewed 2026-11-25. Selection by usefulness and modularity, not a measured benchmark or star ranking. Upstream-level preliminary review, not an audit of installed artifacts. Verify exact tags, notices, dependencies and assets before release. No third-party source or weights vendored.

| Module | Official repository | License / evidence status | Integration |
|---|---|---|---|
| Core | https://github.com/mrdoob/three.js | MIT, upstream | declared |
| React | https://github.com/pmndrs/react-three-fiber | MIT, upstream | optional |
| Helpers/materials | https://github.com/pmndrs/drei | MIT, upstream | optional |
| Scroll | https://github.com/darkroomengineering/lenis | MIT, upstream | wired; browser validation pending |
| Effects | https://github.com/pmndrs/postprocessing | Zlib in upstream package.json; historical MIT notices | optional |
| Physics | https://github.com/pmndrs/react-three-rapier | MIT, upstream LICENSE | optional React |
| AR | https://github.com/google/model-viewer | Apache-2.0, upstream LICENSE | optional |
| Audio | https://github.com/goldfire/howler.js | MIT, upstream | optional |
| Audio synthesis | https://github.com/Tonejs/Tone.js | MIT, upstream | optional |
| Optimization | https://github.com/donmccurdy/glTF-Transform | MIT, upstream | external CLI |
| Camera editor | https://github.com/theatre-js/theatre | Apache-2.0 / AGPL terms by component/version; verify exact package | gated |
| Video | https://github.com/Wan-Video/Wan2.2 | Apache-2.0, model guide https://docs.comfy.org/tutorials/video/wan/wan2_2 | external |
| Image/video | https://github.com/Comfy-Org/ComfyUI | GPL-3.0, upstream | external |
| Media | https://github.com/FFmpeg/FFmpeg | LGPL-2.1+ or GPL depending build, https://ffmpeg.org/legal.html | external |
| 3D production | https://github.com/blender/blender | GPL, exact release and components vary; https://developer.blender.org/docs/handbook/guidelines/license_headers/ | external |
| Studio layout | https://github.com/GrapesJS/grapesjs | BSD-3-Clause expected; exact license pending | planned |
| Studio controls | https://github.com/pmndrs/leva | MIT expected; exact license pending | planned |
| State | https://github.com/pmndrs/zustand | MIT expected; exact license pending | planned |
| Build | https://github.com/vitejs/vite | MIT, upstream | declared |
| Animation | https://github.com/juliangarnier/anime | MIT, upstream; exact installed version pending | wired; browser validation pending |
| Alternate animation | https://github.com/motiondivision/motion | MIT expected; exact version pending | planned |
| Alternate scroll | https://github.com/michalsnik/aos | MIT expected; exact version pending | planned |
| Alternate scroll | https://github.com/jlmakes/scrollreveal | GPL/commercial terms expected; pending | gated |
| Alternate scroll | https://github.com/locomotivemtl/locomotive-scroll | MIT expected; exact version pending | planned |
| Spring animation | https://github.com/pmndrs/react-spring | MIT, exact version pending | optional planned |
| Tween | https://github.com/tweenjs/tween.js | MIT, exact version pending | optional planned |
| Draco | https://github.com/google/draco | Apache-2.0, verify release | optional planned |
| Meshoptimizer | https://github.com/zeux/meshoptimizer | MIT, verify release | optional planned |
| Basis Universal | https://github.com/BinomialLLC/basis_universal | Apache-2.0, verify release | optional planned |

Prefer one animation and one scroll system per page. Use native Web Audio or Howler, not both unless justified. Blender and ComfyUI run separately, not bundled. FFmpeg build and codec rights need review. Model weights, custom nodes, fonts, HDRIs, photos and music have independent rights. No implied blanket MIT coverage.

## v0.4.0 additions (7 repositories, 36 total)
Preliminary upstream license labels; exact version and transitive audit remains pending.

| Module | Official repository | License | Integration |
|---|---|---|---|
| Static template | https://github.com/withastro/astro | MIT | optional template source |
| Design | https://github.com/tailwindlabs/tailwindcss | MIT | optional Astro template |
| Quality | https://github.com/GoogleChrome/lighthouse-ci | Apache-2.0 | dev config |
| Images | https://github.com/lovell/sharp | Apache-2.0 | optional script, dev dependency |
| Metrics | https://github.com/GoogleChrome/web-vitals | Apache-2.0 | opt-in API |
| Browser testing | https://github.com/microsoft/playwright | Apache-2.0 | dev config |
| Accessibility | https://github.com/dequelabs/axe-core | MPL-2.0 | automated browser tests |

## v0.6.0-alpha.3 (37 repositories)
| Module | Official repository | License | Integration |
|---|---|---|---|
| Validation | https://github.com/KhronosGroup/glTF-Validator | Apache-2.0 (npm package upstream) | optional tooling; real execution pending |

glTF Transform CLI, Meshoptimizer and Draco now have optional pipeline code and Three.js decoder wiring. Basis/KTX2 remains planned, not accepted by the current publication gate. See optimization-step-3.md.
