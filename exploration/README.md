# Showroom design exploration

This is an unchosen design study on `explore-showroom-options`, based on the verified 3D integration branch. Open `/exploration.html`. Production, board assets, existing routing and consent logic are unchanged.

## Working previews

- Three palettes: Signal red, Warm workshop, Night steel.
- Three type hierarchies using the existing self-hosted Rozha One and Mukta files. No new font dependency.
- Independent film shade (black/smoke, green, neutral) and film construction (ceramic, metallic, dyed) selectors. The diagram is illustrative, not a product specification or a claim that all these products are stocked.
- Film-fitting animation and reset.
- Ceramic application, buffing, curing and water-beading stages. Play, pause, restart and scrub controls. Coating is shown as a liquid process, not a thick PPF sheet. Timing and visible layer thickness are illustrative.
- Current showroom rendering at `/?quality=cinematic` and an opt-in lighter profile at `/?quality=light`.
- Lower-page proposals for vehicle selection, real installation examples and the shop visit.

## Rendering experiment

The light profile uses a pixel-ratio ceiling of 1, disables bloom/postprocessing, shadow rendering and the desktop reflector, and reduces dust points to 64. Car geometry, board, camera/navigation, accessory previews, builder and lead routing remain shared with the cinematic profile. The original profile remains the default. This reduces rendering work by construction; it does not establish a particular FPS improvement on an iPhone.

Next optimization candidates, if the lighter look is preferred: instance the many individual coating droplets; render only on demand for static/reduced-motion states; throttle animated screen textures; cache active-panel measurements between scroll/resize events; use a measured frame-time budget to adjust quality. Do not add a scroll-smoothing library as a substitute for fixing GPU workload.

## Candidate direction

My recommendation to preview with the owner: Signal red hero, mixed type hierarchy (Rozha hero, Mukta section headings), and warmer photo-led lower sections. Reduce repeated bright-yellow highlights. Keep one red WhatsApp action and a persistent contact bar. Let visitors skip showroom chapters and reach accessories/quote quickly. A photo-first entrance with optional 3D is a separate layout proposal, not an implemented homepage mode.

Suggested lower-page sequence: car selection; accessory groups; actual shop work; fitting/pricing facts; existing reviews; visit information. Do not invent vehicle labels, installation details, performance figures or film availability.

## GitHub sources reviewed

- [Three.js transmission example](https://github.com/mrdoob/three.js/blob/dev/examples/webgl_materials_physical_transmission.html): physical-material controls for glass/transmission and the distinction from simple transparency. The site already uses its supplied Three.js bundle.
- [pmndrs/postprocessing](https://github.com/pmndrs/postprocessing): its EffectPass combines effects to reduce pass chaining. Potential later bloom alternative, not installed in this experiment.
- [Lenis](https://github.com/darkroomengineering/lenis): scroll synchronization and smoothing. Its documented Safari/Low Power Mode limits and touch caveats make native iPhone scrolling a sensible baseline. Not installed.
- [Motion](https://github.com/motiondivision/motion): native JavaScript UI transitions and scroll-linked effects. Candidate for small selection/gallery transitions, not a solution to high 3D rendering cost. Not installed.

No external repository code was copied into the new demo. Film and coating previews use custom SVG/canvas code. Libraries were evaluated from their primary documentation, not all integrated or benchmarked against one another.

## Checks

Run `node exploration/check.cjs` with Playwright and Chrome installed. An alternate Playwright package location may be specified with `MM_PLAYWRIGHT`.

The check exercises all palette/type/shade/technology controls, film fitting/reset, four coating stages, play/pause, and horizontal overflow at 390 × 844 and 1280 × 800. It then loads both rendering profiles at both sizes, checks their actual renderer configuration, opens/closes the coating explainer and tests a film builder chip. Diagnostics are injected only in the test browser response. Results are in `test-results.json`.

Real iPhone Safari scroll feel, touch behavior, animation speed, device temperature and battery cost still require device comparison. No design has been approved or deployed.
