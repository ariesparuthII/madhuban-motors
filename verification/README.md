# 3D showroom integration verification

Tested locally in Chrome at 390 × 844 and 1280 × 800. Headless WebGL checks establish rendering and interaction correctness, not real iPhone animation speed.

## Integration

- Started `upgrade-3d-showroom-reviewed` from main `2657622`.
- Integrated all PR #2 commits through `0dbde5e` before applying the archive.
- The archive's mail patch failed at commit 3 because it lacked usable ancestor information. Aborted that application and used its documented `files/` alternative.
- Three-way merged `index.html` against original main and PR #2. Resolved the old upgrade-selector conflict in favour of the replacement showroom builder. Retained PR #2 WebP references, image dimensions and FAQ schema, plus every change to its other pages.
- Added the supplied 3D engine, accessory props, five explainers, exact board textures, concept model, self-hosted fonts and required licences. Excluded obsolete, unreferenced first-pass `studio3d.js` and `studio3d.css`.

## Corrections after applying the archive

- Excluded showroom headings from the older section-reveal animation, which otherwise left them invisible.
- Increased portrait exterior camera distance, with extra distance for the builder. Kept hero board below the fixed navigation.
- Reserved space above the mobile builder and clipped the moving canvas before the active text panel to prevent scene/text overlap.
- Hid the redundant floating quote button while in the showroom; retained the bottom WhatsApp/Call bar.
- Kept the model attribution visible on phones and used 16px car-input text to prevent iOS focus zoom.
- Removed legacy Google font requests and mapped legacy homepage type styles to the supplied Rozha One and Mukta files. Font files themselves are unchanged.
- Delayed the dive scroll lock until its overlay opens and added a bounded handoff so slow rendering cannot strand a click. Escape cancels pending dives, closing restores focus, and Tab stays in the explainer.
- Raised explainers above the fixed contact bar, allowed safe-area padding, and froze decorative/explainer animation for reduced motion.
- Cancelled drag state on pointer cancellation and ignored vertical swipes as car clicks.
- Kept a remaining selected item's preview when deselecting the most recent builder chip. Added initial pressed states and named chapter-navigation buttons.
- Removed the showroom's hardcoded WhatsApp fallback; its CTAs call the existing routing helper.
- Used the PR's WebP still-image fallback and replaced homepage em dashes with plain punctuation.

## Results

`results.json`: each viewport completed 12 chapters, 5 explainer open/close flows and 9 builder selections. Each chip selected its corresponding 3D part. The total for all priced items was ₹23,300, with `+` for lights, PPF and coating that need a quote. The generated WhatsApp draft included all nine items, the total, sample Hyundai Creta 2023 and `[Source: ORG]`. Deselecting coating retained PPF's preview. Door, horn/headlight, wheel, paint and glass hotspots were found by raycasting the actual model and clicked.

No browser exceptions, console errors or local asset HTTP failures were recorded in the complete two-viewport pass. `final-results.json` records the final framing and actual click-event checks after the last camera/floater corrections.

`privacy-results.json`: no analytics request or `gtag` before consent, none after rejection and reload, and the GA script requested only after acceptance. External analytics requests were intercepted in the test. Seven attribution cases covered organic, Google UTM, Meta UTM, gclid, gbraid, wbraid and fbclid. Save-Data did not load the Three.js bundle. No-WebGL explainers and static reduced-motion explainers worked.

`static-results.json`: existing route definitions/helper and analytics-consent script compared byte-for-byte against PR #2; supplied board implementation/textures and all font files matched the ZIP. One H1, AutoPartsStore and FAQ schema retained. Every content image has alt text and dimensions; the pre-existing empty lightbox image receives its source when opened.

The brief's routing description differs from the actual supplied code. Existing code sends all WhatsApp traffic to +91 97183 73751 and all calls to +91 99114 43751, with distinct attribution tags. That behavior is preserved.

## Reproduce

Serve the repository at `http://localhost:8000`. With Node, Playwright and Chrome available, run `node verification/browser-check.cjs`, `node verification/privacy-check.cjs` and `node verification/framing-check.cjs`. If Playwright is installed outside normal module resolution, set `MM_PLAYWRIGHT` to its package path. The diagnostic scene access is injected only into the test browser's response, never shipped to visitors. WhatsApp clicks are prevented from navigating, and analytics requests are intercepted.

PNG files at this folder's root are local visual evidence. Selected before/after images are committed in `evidence/`; “before” means the applied archive before the corrections above.

## iPhone Safari checklist

1. Open the preview or local LAN address in a fresh private tab. On the same Wi-Fi as the serving Mac, use `http://10.0.0.179:8000` while the server is running. The Mac's LAN address can change.
2. Check the full board, car edges, copy and bottom contact bar in portrait. Scroll all 12 chapters slowly, then quickly. Rotate to landscape and back.
3. Open dashcam, seat, mat, PPF and coating explainers. Check captions and close each with Back to the car. Background scrolling should resume.
4. Tap the car's door, bumper/headlights, wheels, body and windscreen. Check door movement, horn/flash, wheel spin, colour change and dashboard jump. Confirm a vertical swipe does not trigger a click. Sound depends on iOS audio settings.
5. Toggle all nine builder chips on and off. Check part previews and totals. Enter a car model, scroll to Send my list, and check the WhatsApp draft and destination before sending.
6. Try `?utm_source=google&utm_campaign=iphone-test&utm_content=car-a` and check the GGL campaign/creative tag. Use another private tab for organic attribution.
7. Reject analytics, reload and check the site still works. Use a separate fresh private tab to accept. Try iOS Reduce Motion and Low Power Mode, and repeat a short mobile-data load.
8. Judge animation smoothness and device heating on the actual phone. Those are not established by the desktop headless checks.
