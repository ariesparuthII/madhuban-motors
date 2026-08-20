# Madhuban Motors website

Static website for `https://madhubanmotors.com`, hosted with GitHub Pages.

## Lead delivery

WhatsApp is the working enquiry path and remains the fallback. The website does not store names, phone numbers or vehicle details in browser storage.

### Paid-session contact routing

Organic/default website visits route WhatsApp and call actions to Papa at `+91 99114 43751`. A session arriving with `utm_source=google`, `utm_source=meta`, `gclid`, `gbraid`, `wbraid` or `fbclid` routes those actions to Aum at `+91 97183 73751`. The paid channel (`google` or `meta`) is stored in `sessionStorage` under `mm_lead_channel_v1` so it remains consistent only for that browser session.

For paid sessions only, `utm_campaign` and `utm_content` are sanitized to lowercase letters, numbers, `_` and `-`, capped at 64 characters, and stored for the same browser session as `mm_lead_campaign_v1` and `mm_lead_creative_v1`. No `utm_term`, click-ID value, arbitrary query value, visitor contact or vehicle information is stored. Prepared WhatsApp messages include a compact source tag such as `[Source: GGL | cmp:safety-aug | cr:g-safe-a]`; organic remains `[Source: ORG]`. The same channel/campaign/creative fields are included in the optional lead endpoint payload. The full and quick enquiry forms use the same routing helper. Meta ads that link directly to WhatsApp can use Aum's number in the ad destination without passing through the website.

An optional direct lead endpoint can be enabled in `index.html`:

```js
window.MM_LEAD_CONFIG = {
  endpoint: 'https://your-authorised-endpoint.example/leads'
};
```

The endpoint must:

- accept `POST` requests with a JSON body;
- use HTTPS;
- allow CORS requests from `https://madhubanmotors.com`;
- protect stored enquiry data with appropriate access controls and retention rules; and
- never require a secret to be embedded in this public repository.

Leave the value blank until a real endpoint has been selected and tested. Suitable implementations include an authenticated serverless function that writes to a business-owned CRM or sheet. Do not point the browser directly at a private CRM API that needs a secret.

## Privacy and analytics

Analytics is loaded only after a visitor accepts analytics. The only browser-persisted value is the visitor's analytics preference under `mm_privacy_preferences_v1`.

If analytics providers or enquiry handling change, update `privacy.html` before deployment.

## GitHub Pages HTTPS

`CNAME` already contains `madhubanmotors.com`. After DNS resolves correctly, a repository administrator must enable **Enforce HTTPS** under **Settings → Pages**. This is an external GitHub setting and cannot be enforced by files in this repository.

## Pre-deployment checks

1. Open the home page at desktop and mobile widths.
2. Confirm the privacy choice appears for a fresh browser profile.
3. Confirm analytics requests do not load after choosing **Necessary only**.
4. Submit test enquiries through both forms and verify the WhatsApp message.
5. If a lead endpoint is enabled, verify its CORS policy and direct delivery separately.
6. Test a fresh organic session and paid URLs such as `?gclid=test&utm_campaign=safety-aug&utm_content=g-safe-a` and `?fbclid=test&utm_campaign=interiors&utm_content=m-int-a`; confirm every WhatsApp/call action and both forms use the expected number and sanitized source tag.
