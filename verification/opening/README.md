Opening performance fix

Removed the large MM hero loading poster. The old photograph remains in the lower story section. Responsive, compressed stills captured directly from the existing showroom show the exact board and car immediately (about 15 KB mobile / 44 KB desktop). The still stays until the first 3D frame has rendered; Save-Data/no-WebGL keeps this same board-and-car fallback.

Removed the 3.2-second dark intro. Model, logo and board downloads start before environment generation. Board generation no longer waits for fonts it does not use. Reused the smaller existing logo texture for the bonnet badge. Phones use the existing light renderer by default, avoiding bloom, real-time shadows and extra reflection passes; ?quality=cinematic remains available.

Validated the first screen at 390×844 and 1280×800 with Save-Data enabled: correct responsive image decoded and visible, no three.js download, wordmark intact. Inspected screenshots. JavaScript syntax and whitespace checks pass. No real-device loading-time or FPS claim is made.
