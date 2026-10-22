# Final supplied October 21 patch

Applied the owner's `madhuban-codex-final.zip` mail patch to `site-sections-oct21` from `origin/gh-pages` d0388b6. Nine supplied commits applied cleanly. All 16 delivered site/config files match the ZIP byte for byte. The README's stated 21-commit count differs from the actual nine messages in the patch.

Validated at 390x844 and 1280x800 in desktop Chrome using native Metal WebGL:
- 12 showroom chapters, five explainers opening/closing, nine builder selections, item previews and routed WhatsApp draft.
- Door, horn, wheels, paint and inside hotspots found on real meshes and actual click events asserted in both viewports (`final-results.json`). The updated desktop car is lower than the old test's scan limit; test scanning now covers 90% of viewport height.
- No page exceptions, console errors or failed local resources in the full showroom flow (`results.json`).
- Lower sections: all four shop jobs, lightbox, enquiry preview updating with car/service, and no horizontal document overflow at either size. Screenshots are local evidence in /tmp/mm-final-evidence and verification's existing screenshot paths.
- Consent accept/reject/reload, seven attribution cases, Save-Data, no-WebGL and reduced motion (`privacy-results.json`).
- Original board images and fonts unchanged. Complete consent script, routing/attribution helpers and lead submission functions are unchanged from production. Inline script syntax and diff whitespace passed.
- Car file reduced from 2,518,104 to 2,209,948 bytes; indexed triangle count remains 213,195.

No claim about measured real-iPhone FPS, cold-load speed or heating. The new phone-upload workflow was inspected but not exercised with an owner's photo/video in this run.

The GitHub connector could not create a PR (integration permission 403). Owner explicitly requested merge into gh-pages; deployment uses a direct Git merge instead. Prior experimental section branch remains separate.
