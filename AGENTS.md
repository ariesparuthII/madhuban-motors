# AGENTS.md: Madhuban Motors website

Read this whole file before you touch the repo. It is the brief for madhubanmotors.com: who the business is, what the owner wants, what has been built, and the rules that keep the site honest and working.

---

## 1. The business

- **Name:** Madhuban Motors ("मधुबन" in Hindi). Car care and car accessories shop with fitting/installation.
- **Where:** Shop No. 8 & 8A, Bhatia Building, Model Town, GT Road, near Opulent Mall, Ghaziabad, Uttar Pradesh. Serves Ghaziabad, Noida, Delhi, Bulandshahr and the wider Delhi NCR.
- **Since:** 1989 on GT Road. Founded by Vivek Paruthi, known as "Bitoo Bhaiya" in the market. Three generations. Rule from day one: source it right, fit it right, stand behind the work.
- **Proof points used on the site:** 4.6★ from 402+ Google reviews, 2.5 lakh+ customers served, myTVS authorised partner, authorised dealer for brands such as JBL, Sony, Pioneer, Blaupunkt, harman/kardon, AURA, Infinity, 3M, Llumar.
- **Hours on the site:** Mon, Wed to Sun 10:00 AM to 8:00 PM. Tuesday closed.
- **Phones:** organic/default traffic routes to +91 99114 43751. Paid traffic routes WhatsApp/call to +91 97183 73751 (see section 5). Do not hardcode new numbers; use the routing helper.
- **What they sell and fit:** Android touchscreens, car audio (speakers, tweeters, woofers, amplifiers, active/passive bass tubes, DSP, damping sheets, wiring kits), dashcams (front/rear, hidden hardwiring), reverse cameras, parking sensors, GPS trackers, seat covers (leatherette, fabric, bucket fit), steering covers, 7D/coir/rubber mats, LED headlamps and fog lamps, ambient lighting, horns, sun film, PPF (paint protection film), ceramic coating.
- **Pricing style:** fitting/labour is always included, never extra. Owner prefers ₹X,999 style prices in ads and offers. "Starting from" prices currently on the site: seat covers ₹2,500, mats ₹1,800, dashcam ₹2,000, Android screen ₹8,000, car audio ₹5,000 (custom builds ₹1 to 2 lakh), sun film ₹4,000. PPF, coating and LED lights are "price depends on your car" until the owner gives numbers.
- **Not part of this business:** "Madhave Steels" shares the owner's Google Business Profile account but is unrelated. Never mix it into Madhuban Motors content, listings or schema.

## 2. The owner and how to work with him

- Owner's name is Aries (Aum Brahm Chaitanya). He runs the business remotely from Canada, so the site has to sell on its own and push people to WhatsApp.
- Reply in English or Roman-script Hinglish, even when the owner speaks Hindi or Punjabi. This is his explicit ongoing preference.
- He talks in casual Delhi Hinglish. Reply to him in plain, friendly Hinglish when chatting. Site copy stays in simple English (Hindi only for the "मधुबन" wordmark unless he asks).
- **He hates AI-sounding copy.** No "trusted partner", "we appreciate your support", "look forward to serving you", "elevate", "seamless", "unparalleled". Write like a shop owner talking to a customer.
- **Never use em dashes (—)** in anything written for him or on the site.
- He judges by screenshots on his iPhone. Always check phone width (about 390 to 430 px) first, then desktop.
- He wants bold, cinematic, "gaand faad" design, not a WordPress or template look. He reacts badly to generic fonts, empty space, things overlapping, and anything that looks fake.

## 3. Repo and deploy

- Repo: `github.com/ariesparuthII/madhuban-motors`. Static site, no build step. Plain HTML/CSS/JS, ES modules for the 3D code.
- Dev happens on `main`. Production (madhubanmotors.com) is served from the `gh-pages` branch by GitHub Pages with a custom domain (`CNAME`). Netlify is connected only for PR preview deploys.
- PR #2 (`seo-fixes-oct2`: H1 fix on builder page, image width/height, WebP, FAQ/breadcrumb schema, blog author bios) also edits `index.html`. Merge it before or carefully alongside the 3D upgrade.
- Other pages: `builder.html`, service/locality landing pages (`car-audio-system-ghaziabad.html`, `android-screen-fitting-ghaziabad.html`, `dashcam-installation-ghaziabad.html`, `car-seat-covers-ghaziabad.html`, `car-led-lights-ghaziabad.html`, `car-horns-ghaziabad.html`, `car-sun-film-ghaziabad.html`, `car-accessories-raj-nagar-extension.html`), `blog/`, `privacy.html`, `sitemap.xml`, `robots.txt`. Keep internal links, sitemap and canonical tags in sync when you add or rename pages.

## 4. Current homepage (3D showroom upgrade, branch `upgrade-3d-studio`)

One sticky full-screen WebGL stage (`#showroom`) with chapters that scroll over it. Files:

| File | Job |
|---|---|
| `index.html` | `#showroom` section replaces the old hero, 3D studio, upgrade selector and stats strip. Lower sections (services bento, "Fitted at our shop" gallery, enquiry form, story, reviews, gallery, pricing, FAQ, CTA, visit, footer) kept and restyled. |
| `assets/web/showroom.js` | three.js engine: studio light bars that also live in the env map (so reflections match the lights), reflector floor on desktop, bloom, dust, the real shop board on the back wall, scroll-driven camera per chapter, click-the-car actions, builder picks that fly the camera to the part, "go inside" dive transitions. |
| `assets/web/studio3d-parts.js` | Accessory props placed in the car (car space, metres, +z = front, +x = car's left): dashcam behind mirror with glowing cable and pulses, live Android UI screen, door speakers, bass tube + amp, quilted seat covers, 7D mats, headlight beams, PPF stone chips, ceramic coating water beads, film tint, door opening. |
| `assets/web/showroom-dive.js` | "Go inside" canvas explainers: dashcam POV accident on GT Road with G-sensor event lock, seat cover chai spill, monsoon mats, PPF paint cross-section with stone chip vs film, ceramic coating beading. |
| `assets/web/showroom-board.js`, `board-day.webp`, `board-night.webp` | The owner's actual shop board, cut out of his own day and night photos and aligned. Day version shows first; the lit night version fades in as the studio lights power on. Owner wants this exact board kept. |
| `assets/web/showroom.css`, `assets/web/upgrade-2026.css` | Showroom styles and the dark restyle of the rest of the page. |
| `assets/fonts/` | Self-hosted **Rozha One** (headings + Hindi wordmark) and **Mukta** (body). Owner picked these. Do not switch back to Google-hosted or generic fonts. |
| `assets/vendor/three/three-bundle.min.js` | three.js r186 bundle (GLTFLoader, Meshopt, RoomEnvironment, EffectComposer, UnrealBloom, OutputPass, Reflector). |
| `assets/3d/concept-car.glb` | Placeholder car. "Car Concept" by Eric Chadwick, © Darmstadt Graphics Group, CC BY 4.0, logos removed, compressed. Keep the visible credit while this model is used. |

Chapters, in order: hero (मधुबन / Madhuban Motors, WhatsApp CTA, 4.6★, 2.5 lakh+, 3 generations, "Click the car" hint), Since 1989, Android screen, Dashcam, Sound, Seat covers, Mats, Lights, PPF, Coating, Sun film, Build your upgrade.

Interactions the owner asked for and must keep working:
- Clicking the car: door opens/closes, headlight or bumper flashes lights and honks (WebAudio), wheels spin, body cycles paint colour, glass jumps inside to the dashboard. Hover tooltip plus a click pulse.
- "Go inside" buttons on dashcam, seats, mats, PPF and coating open the full-screen explainer.
- **Build your upgrade:** picking an item shows that exact part on the car and moves the camera to it (mats from above, audio with the door open, dashcam with the glowing cable), updates a live "starting total", and "Send my list on WhatsApp" sends the picked items, total and car to WhatsApp.
- Layout: on desktop the car sits in the right half and text on the left. On phones the shop board fills the top of the screen, the car sits under it, and the text is below. Framing uses a measured view offset (`calibrateOffset`), not a hard-coded sign. Light bars sit high so they never cross the board.

Old first-pass files `assets/web/studio3d.js` and `assets/web/studio3d.css` are no longer referenced and can be deleted.

## 5. Lead routing and privacy (do not break)

- All WhatsApp links go through `getMMWhatsAppUrl(message)` in `index.html`. It picks the number, adds a source tag such as `[Source: ORG]` or `[Source: GGL | cmp:... | cr:...]`, and is used by the showroom CTAs via `data-wa`. Never build `wa.me` links by hand in new code.
- Paid sessions (`utm_source=google|meta`, `gclid`, `gbraid`, `wbraid`, `fbclid`) route to the paid number and store only channel, sanitised campaign and creative in `sessionStorage`. No names, phones or car details are stored in the browser.
- Analytics (GA4 `G-674BE5JN8Q`, Meta Pixel scaffold) load only after the visitor accepts analytics in the privacy banner. Showroom events (`showroom_click`, `showroom_pick`, `showroom_dive`, `showroom_whatsapp`) go through `gtag` only when it exists.
- If you change what is collected or tracked, update `privacy.html`.

## 6. Hard rules

1. **No fake content.** Never invent reviews, review names, ratings, customer counts, awards, prices or offers. Use only the numbers in section 1 or what the owner gives you.
2. **No secrets in the repo.** Never paste API keys or tokens, and never copy anyone else's keys from GitHub or elsewhere. Lead endpoints must not need a secret in client code.
3. **Licences.** Only use 3D models, fonts, images and code with a licence that allows it, and keep required credits. No logos or branded car models you have no right to use. The shop board photos are the owner's own.
4. **Performance.** The 3D loads only when the showroom is near the viewport, has a still-image fallback (no WebGL or Save-Data), respects `prefers-reduced-motion`, and caps pixel ratio. Keep the GLB small (meshopt/WebP via gltf-transform) and lazy-load anything heavy.
5. **Mobile first.** Nothing may overlap the car, the board or the CTAs on a 390 px wide phone. Bottom WhatsApp/Call bar must stay usable.
6. **Things that silently break:** `html` and `body` use `overflow-x: clip` (not `hidden`) or `position: sticky` stops working. Overlays must use `[hidden]{display:none}` and `pointer-events:none` where they should not catch clicks. Guard any `getElementById` you observe with a null check.
7. **SEO:** keep one `<h1>` per page, the LocalBusiness/FAQ/breadcrumb schema, alt text, `width`/`height` on images, sitemap and canonical URLs correct.
8. Copy: plain English, short sentences, no em dashes, no AI clichés, prices in ₹ with Indian number formatting (₹1,800, 2.5 lakh).

## 7. Open work the owner wants next

1. **Indian car.** Replace the sports concept car with Indian-looking cars. Plan: owner makes GLBs for free with TRELLIS or Hunyuan3D-2 on Hugging Face from his own photos (luxury sedan like Skoda Superb / Honda City / Verna, and an SUV like Creta / XUV700 / Fortuner, plate hidden). Then build **car swapping in Build your upgrade**: the red hero car stays, and choosing a brand or body type swaps the car (Honda/Skoda/VW to sedan, Hyundai/Tata/Mahindra/Kia/MG/Toyota to SUV, Maruti to hatch when available). Each model needs its own part anchors and camera shots.
2. **Shop video** (10 to 15 seconds, night, lights on, a car being fitted) as a background in the story section, once the owner shares it.
3. **PPF and ceramic coating prices** when the owner provides them.
4. Merge PR #2 and this branch, then deploy to `gh-pages`. Test on a real iPhone (headless Chrome without a GPU is far too slow to judge animation).
5. Continuing SEO: Google Business Profile, locality pages, realistic local backlinks (no fantasy asks like a guaranteed Forbes link).

## 8. How to verify a change

- Serve locally (`python3 -m http.server`) and check `/` at 390x844 and 1280x800.
- Scroll through every showroom chapter, open each "Go inside" explainer, tap every builder chip, click the car's door, headlight, wheel and body.
- Confirm WhatsApp links include the source tag, and that nothing loads analytics before consent.
- No console errors. Share before/after screenshots with the owner.
