# Fitted audio setup, local review

The audio speakers previously belonged to a free-standing accessory group. They now inherit their respective door transforms, including door opening. Both doors open for the audio view. Audio equipment no longer uses the growing/scaling part entrance animation; only the speaker cone excursion moves.

The audio chapter and builder preview use a rear/boot camera. The roof remains intact. The existing rear window/inner hatch hinges open over a central rear-body aperture, leaving the rear quarter panels in place. The original rear engine/bracing/inner trim is hidden only for this view so it does not cover the fitted equipment. This is an illustrative boot conversion of the existing concept-car asset, not a new production vehicle model. The normal rear-body geometry is restored when audio is deselected.

A raised, carpet-lined false floor in the boot bay supports the rear-facing bass tube, which rests on the floor, and a separate mounting board supports the finned amplifier beside it. Low-profile mounts and routed cable replace the suspended amp and exposed long wire. The existing cabin light is repositioned into the boot for the audio view, making the equipment visible without adding another light or shadow pass.

Checks in `check.cjs` cover 390×844 and 1280×800 using the light rendering profile: door parents/visibility, open hatch and nonempty lid geometry, tube-floor contact, restoration on leaving audio, and the builder Sound chip with the existing ₹5,000 starting total. The initial full interaction results are in `interaction-results-before-final-framing.json`. Later full-flow reruns hit headless-browser locator timeouts, so final framing was checked independently with `visual-check.cjs`; `visual-results.json` confirms the current door attachments, hidden rear engine, open hatch and tube/floor contact at both sizes. Local screenshots are ignored by Git. Real-device appearance and performance remain review checks.

This change and the ceiling restoration are local pending the owner's visual review. They have not been pushed. Fonts, exact board assets, lead routing and analytics consent are unchanged.
