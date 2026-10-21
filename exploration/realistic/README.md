# Realistic car and focused homepage study

Open `/realistic-preview.html`. This is a separate, unchosen preview on `realistic-car-layout-study`. The original homepage and interactive concept-car showroom remain available at `/`; production has not changed.

## First stage delivered

- A generated photorealistic Indian-market-style sedan in a warm fitting bay, without manufacturer emblems. It is a raster visualization with category hotspots, not a new rotatable 3D car.
- A tan-and-black Nappa-style upholstery fitting study emphasizing seams, quilting, headrests and seat shape.
- The owner's original board remains an unchanged separate asset above the car.
- One shared width/alignment system, restrained red actions, warm neutral highlights, calmer section spacing and a phone-first hero.
- Focused sequence: hero/car; upgrade categories; upholstery detail; one actual-work gallery; one quote form and aggregate review link; existing FAQs and visit details.
- Excluded from the visible preview: the 12-chapter showroom, scrolling category/brand ticker, repeated service-card grid, duplicate phone/gallery presentations, separate story block, lengthy duplicate enquiry form, repeated review cards, generic pricing cards and final repeated quote banner. Business history and review proof are retained in smaller useful positions.
- Added five upgrade reference choices and three category hotspots. Selections can be added to the quote. Car details and interests produce a WhatsApp draft through the existing helper.
- The original route definitions/helper and analytics-consent logic are retained. No car details or new personal information is stored.

The legacy sections remain hidden in this independent study so existing shared scripts/routing can be reused safely. A selected production layout should consolidate the markup and remove those unused scripts instead of shipping the prototype structure unchanged. The hidden showroom does not download Three.js or the GLB in this view, as checked in the browser.

## Brand direction and confirmation

The owner confirmed Qubo in this conversation. Qubo's official range is linked in the preview. Exact model/front-rear kit remains open.

The owner clarified Nappa as the upholstery material/finish direction. “Highway” is not being treated as a confirmed supplier. The generated interior is a design study, not proof of actual material composition or a customer's installation.

- Blaupunkt: speaker direction. Exact model, grille, cone, tweeter and crossover references next.
- myTVS: Android player direction. Exact unit, fascia, physical controls and mounted UI references next.
- Qubo: confirmed brand; exact model, mount, casing, front/rear kit and power route next.
- Nappa upholstery: match the shop's material sample, colour, stitching and patterns to the car seats.
- LED: OSRAM is an official example to review, not an assertion of shop stock or fitment. Use whichever confirmed brand/model the shop sells. No wattage or brightness figures were invented.

This pass does not disguise generic geometry as exact branded equipment. Brand names/reference links are a review aid; product-accurate visuals still need the selected model references.

## Official references checked

- [Blaupunkt India speakers](https://www.blaupunkt.com/en-in/product-category/automotive-c_ind-2/incar-entertainment-c_ind/speakers-c_ind)
- [myTVS Android players](https://mytvs.com/collections/smart-android-player)
- [Qubo dashcams](https://www.quboworld.com/collections/dashcams)
- [OSRAM automotive lighting reference](https://www.osram.com/am/night-breaker-led.jsp)

These manufacturer pages verify product categories/brand spelling, not Madhuban's inventory, quotations or authorization for reuse of their product photography.

## Next stages, in order

1. Review the car silhouette, colour, environment and compact layout shown here. Keep this as a visible reference while developing the interactive asset.
2. Obtain a consistent front/side/rear/interior reference set for the chosen unbranded sedan or a shop-owned car. A single image does not establish correct geometry or an interior.
3. Generate or model the car asset, then inspect it. Separate doors, wheels, glass, painted body and cabin; correct topology, scale and panel seams. Include a proper right-hand-drive interior. A single fused AI mesh is insufficient for the requested opening doors and accessory demonstrations.
4. Create PBR paint, rubber, glass, seat and trim materials. Bake detail and produce a lightweight GLB with compressed geometry/textures. Confirm usage rights and preserve any required credits.
5. Add each confirmed product using actual selected-product reference photos. Build one accurate product at a time: screen first, dashcam second, speakers third, upholstery, then lights. Do not simply paste logos onto unrelated shapes.
6. Make model-specific anchors/camera shots. Check fascia fit, dashcam cable and mounting, door speaker placement/damping, upholstery seams and lamp/beam representation. Preserve builder selections and existing lead routing.
7. Add the film/coating demonstrations to the chosen realistic model after those assets work. Coating remains a liquid application/buff/cure process; PPF is the separate physical film.
8. Compare a lightweight mobile render against the cinematic version. Instance repeated details, limit transmission/shadow/bloom cost, pause off-screen animation, and test actual iPhone Safari heat, battery and scroll feel.
9. Rebuild only the chosen page structure cleanly, preserve structured data/canonical links/consent/lead attribution, and create a reviewable deployment candidate. Nothing in this study is auto-deployed.

## Verification

`check.cjs` checks 390×844 and 1280×800: visible sections, one H1, no horizontal overflow, five product selectors and add-to-quote actions, image hotspots, WhatsApp draft/car/source tag, no car details in session storage, no analytics before consent, and no Three.js download for this image-led preview. `results.json` contains the browser results. Screenshots are local and ignored by Git.

The generated hero and interior WebP files together are about 328 KB. Source PNGs are kept beside them. No FPS improvement or genuine 3D car conversion is claimed.

## Image provenance

Generated with the built-in image-generation tool, not Gemini or the CLI. Original generated images were copied into `assets/studies/` and encoded as WebP without changing their composition. Full generation prompts are in `prompts.md`.
