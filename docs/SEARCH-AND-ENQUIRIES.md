# Search and installation enquiry work, 22 October 2026

## Delivered

- Reworked eight existing service/location URLs, keeping existing URLs and incoming links intact. Corrected unsupported/conflicting prices, removed unconfirmed model/package promises and standardised business details.
- Added services.html and dedicated mats, PPF and ceramic-coating pages. These are three distinct services, not copies with substituted city names. The Raj Nagar Extension page explicitly says fitting happens at GT Road, not an invented branch.
- Three new practical guides: dashcam installation checklist, PPF versus ceramic coating and Android-screen buying checklist. Six guides are discoverable from the blog. Existing article URLs/publication dates are retained.
- Linked all services from a static HTML hub and the homepage. Added guides to the homepage and menu. Added seven new canonical URLs to the sitemap. Excluded the prototype exploration page from indexing.
- Retained one H1 and appropriate Service, Article and breadcrumb JSON-LD; visible service FAQs match their FAQ markup. No promise of FAQ stars or rich results.
- Self-hosted Rozha One/Mukta on service and blog pages. These landing pages do not load the 3D engine or external fonts.
- Added persistent mobile call/WhatsApp actions, directions, hours, quote requirements and explicit installation-availability messages. The shop must confirm a time; clicking a button is not a confirmed booking.
- Reused the exact production homepage contact routing, attribution and analytics-consent implementation for search pages. Existing actual routing sends WhatsApp to the dedicated WhatsApp line and calls to the primary shop line for all channels, with different source tags. This differs from the old brief's routing description; this change deliberately preserves production routing rather than silently changing phone destinations.
- Added consent-gated call_click, whatsapp_click and directions_click events to search pages. Parameters contain page path and button location, never phone, name, car or message content. Privacy notice updated.

## Measurement status

No Search Console, GA4 or Business Profile data was available to establish a baseline. Windsor.ai was discovered and suggested, but its account check returned not connected. No claim of additional visitors, ranking improvement, calls or confirmed bookings is made.

The search engine's site: query produced no useful site results in this audit. That is NOT proof of Google deindexing. Verify indexing using the actual Search Console property.

With account access, pull Sep 24 to Oct 21 against Aug 27 to Sep 23 (28 days each):

| Stage | Source | Measure | Current baseline |
|---|---|---|---|
| Discovery | Search Console | Non-brand impressions/clicks by query and landing page, CTR, position | Not available |
| Website visits | GA4 | Organic sessions and engaged sessions by landing page | Not available |
| Contact intent | GA4 | call_click and whatsapp_click events, by page | Not available |
| Local discovery | Business Profile | Website clicks, call clicks, directions | Not available |
| Qualified leads | Shop records | Enquiries needing a real product/service quote | Not available |
| Bookings | Shop records | Installation slots actually confirmed by staff | Not available |
| Sales | Shop records | Completed jobs from those enquiries | Not available |

A telephone-button click is not proof of an answered call. A WhatsApp click is not proof of a sent message. Do not call either a sale or confirmed appointment. GA4 excludes visitors who reject analytics; account for that when reading totals.

## Required account work

1. Connect Windsor.ai, then the correct Madhuban Search Console, GA4 and Business Profile accounts. Do not select the unrelated Madhave Steels listing. If using the native Google interfaces, use the same verified properties.
2. In Search Console, inspect indexing/canonical status and submit https://madhubanmotors.com/sitemap.xml. Inspect the new services and guide URLs. Do not claim submission or indexing until confirmed.
3. In GA4, inspect DebugView/Realtime after accepting consent, confirm event delivery, then decide which contact-intent events should be key events. Do not count all click events as bookings. No GA4 admin settings changed in this release.
4. Audit Business Profile name/address/hours, primary category, relevant services, website link and existing product entries. Keep the real business name without added search keywords. Draft and review specific changes against the existing listing before publication. No external posts, reviews or listing edits were sent in this run.
5. Publish genuine job photos with descriptive captions, keep stock/service details current, and ask actual customers for honest reviews without incentives or review gating. Staff should log confirmed installations separately from enquiries.

## Next measurement decisions

- Review weekly after sufficient data accumulates; use 28-day comparisons for the overall trend.
- Impressions without clicks: inspect the actual query/page match and title before changing it.
- Relevant clicks without qualified enquiries: inspect the mobile page, price/scope, contact action and staff response.
- Enquiries without bookings: record the reason (availability, stock, budget, unanswered call) before creating more content.
- Add further articles from genuine repeated customer questions or Search Console queries. No mass city-page expansion, bought links or invented reviews.

## Basis

Google recommends useful people-first content and crawlable internal links: https://developers.google.com/search/docs/essentials
Local visibility also depends on accurate Business Profile information, relevance, distance and prominence: https://support.google.com/business/answer/7091
Sitemap submission assists discovery; it does not guarantee indexing: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap

## Validation

verification/search/results.json records 38 page/viewport checks (19 URLs at 390x844 and 1280x800), no horizontal overflow, one H1, correct canonicals, parseable schema, routed WhatsApp actions, chosen self-hosted fonts and zero local failures/page exceptions. Additional tests cover paid attribution across navigation and consent-gated contact events. Sitemap/file-link audit covers all 22 sitemap URLs. Existing homepage privacy/attribution/fallback suite passed.

The full homepage regression also passed at both sizes: 12 chapters, five explainer flows, nine builder choices and all five real-mesh hotspots; no page exceptions, console errors or failed local resources. Showroom engine/model/board/font assets are unchanged by this work. This is implementation evidence, not a ranking or lead-growth result.
