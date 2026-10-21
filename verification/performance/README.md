Performance pass after the opening-image fix

Measured CPU bottleneck: eager buildParts took 5,208.8ms in the desktop headless baseline. The final lazy factory took 26.4ms in the same test harness. These are accessory construction measurements, not real-phone load times. Raw profiles are retained. Baseline rendering reported zero draw calls, so its overall/GPU load timing is not a valid rendering comparison and is not used to claim an overall speed percentage. Final profile confirms a live WebGL context, 86 draw calls and 75,461 visible triangles in the exterior hero. The machine/browser load varies; first GPU compilation is still nonzero. Real iPhone FPS and cold-network timings remain to be measured.

Changes:
- Same licensed car, simplified with meshoptimizer while preserving all 105 nodes and door transforms: 213,195 → 96,211 total triangles; 2,518,104 → 1,629,132 bytes. Original model retained as the source. The visible model credit remains.
- Accessory factories build only on demand. PPF/coating raycasts and the audio hatch adaptation no longer run before the hero. No hidden product GPU programs are compiled at startup.
- Default lean rendering on phone and desktop: no live floor reflection, bloom or refraction prepass. Metallic paint still uses the studio environment; shader work uses Standard materials instead of Physical for the car. ?quality=cinematic retains the optional full bundle/effect passes.
- Hidden cabin/engine geometry stays out of exterior rendering and is restored for accessory views, including PPF/coating transparency. Part-specific hide rules still apply afterward.
- Compile visible GPU programs in batches and yield between batches. Keep the static board/car opening visible until the first frame renders. Idle rendering capped around 30fps; active scrolling/dragging runs at display cadence.
- Removed postprocessing-only exports from the normal bundle: 838,487 → 709,039 bytes, with the existing three.js licence retained. showroom-entry.js is the reproducible export entry. Rebuild with esbuild, bundle/minify/ESM/es2022, legalComments=eof.
- Lazy-import Go inside explainers. Defer 13 below-fold background photos with a 350px observer margin. Their dimensions/gradients remain, avoiding layout shifts.
- Shop-board photos, fonts, wordmark, routing helper and consent logic retained.

Asset optimizer: optimize-model.mjs uses @gltf-transform/core, @gltf-transform/extensions, @gltf-transform/functions and meshoptimizer. Run with input and output GLB paths. Dependencies are build-time tools only and are not loaded by visitors.

Validation: protection checks passed at 390×844 and 1280×800: PPF/coating transparency, restoration on film, both lazy-loaded explainers, all nine builder chips, badge presence, one H1, parseable schema, no page exceptions and no analytics before consent. Audio geometry checks passed with the simplified car at both sizes. Final hero rendered with the lean bundle and the board remained fully visible in the inspected capture. Inline scripts and both ES modules passed syntax checks. Near-next chapter preparation is scheduled during idle time rather than at startup. Versioned showroom/parts URLs avoid stale module caches.
