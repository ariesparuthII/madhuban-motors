# Cinematic lighting pass

The owner rejected the image-led redesign and requested the existing cinematic showroom with better lighting. This branch starts from `explore-showroom-options`, not the rejected realistic-page branch.

Changes are limited to the showroom engine's lighting/material response:

- Wider, lower-intensity overhead environment panels and slightly blurred environment reflections.
- Warm key light, stronger neutral fill and a restrained cool directional rim instead of the strong red point light.
- Much less red in the environment and no bright red floor pool.
- Slightly rougher paint/clearcoat highlights, less mirror-like floor reflection, lower bloom and a quieter turntable ring/dust treatment.
- Smooth sequential power-on instead of random flickering.
- Small exposure lift; the dark headlight chapter and interior lighting behavior remain in place.

No scene geometry, camera presets, layout, fonts, board files, lead-routing code or consent code changed. No extra shadow-casting light was added.

Chrome checks at 390×844 and 1280×800 passed: ready WebGL scene, all twelve chapter states, all nine builder picks (₹23,300 +), and the coating explainer open/close. No page exceptions or console errors. Results are in `results.json`.

`check.cjs` exercises these checks against before/after code. `stills.cjs` separately waits at least 100 rendered frames before capturing hero comparisons, avoiding misleading captures during initial shader compilation/camera easing. Both scripts use Playwright/Chrome; set MM_PLAYWRIGHT if its package is outside normal module resolution. The comparison baseline is `explore-showroom-options`.

Screenshots are local and ignored by Git. Real iPhone animation smoothness remains a device check. Production is unchanged.

## Local ceiling review, not pushed

The owner asked to restore the visible overhead detailing-bay lights before the next push. A lightweight perspective LED ceiling graphic now occupies the clear area above the headline on desktop and above the board on phones. It is decorative, pointer-transparent and hidden in accessory close-ups. Mobile hero framing moves the board/car down slightly to leave a gap below the fixtures. The existing 3D lighting and board assets remain unchanged from the preceding lighting pass. This local revision has not been pushed.

Board framing follow-up: the hero camera now projects all four original sign-photo corners and fits them inside a safe region below the ceiling fixtures. The photo itself is unchanged. Chrome checks at 390×844 and 1280×800 confirmed all corners within the viewport (phone x29–372, y118–251; desktop x654–1174, y174–377), with no page exceptions. Screenshots inspected locally. Changes remain unpushed.
