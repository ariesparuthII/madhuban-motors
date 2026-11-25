# Save every website enquiry to a Google Sheet

The homepage enquiry form and the quick quote popup already call `sendLead()` before they open WhatsApp. It does nothing until `window.MM_LEAD_CONFIG.endpoint` in `index.html` has a URL. These steps give it one. They are free and take about 15 minutes.

## 1. Make the sheet

1. Open Google Sheets with the shop's Google account and create a sheet called **Website leads**.
2. Go to **Extensions > Apps Script**, delete what is there, and paste this:

```js
const SHEET = 'Leads';
const FIELDS = ['submittedAt','form','name','phone','car','service','services','message',
  'marketingConsent','leadChannel','campaign','creative','source'];

function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SHEET) || ss.insertSheet(SHEET);
  if (sh.getLastRow() === 0) sh.appendRow(FIELDS);
  let d = {};
  try { d = JSON.parse(e.postData.contents || '{}'); } catch (err) { return out(); }
  // Basic spam guard: needs a phone number with at least 10 digits.
  const digits = String(d.phone || '').replace(/\D/g, '');
  if (digits.length < 10) return out();
  sh.appendRow(FIELDS.map(k => {
    const v = d[k];
    return Array.isArray(v) ? v.join(', ') : String(v == null ? '' : v).slice(0, 500);
  }));
  return out();
}
function out() { return ContentService.createTextOutput('ok'); }
```

3. Click **Deploy > New deployment**. For the type pick **Web app**, set Execute as **Me** and Who has access **Anyone**, then click **Deploy** and allow access.
4. Copy the **Web app URL**. It starts with `https://script.google.com/macros/s/`.

## 2. Turn it on

Send the URL to Claude, or paste it in `index.html`:

```js
window.MM_LEAD_CONFIG = {
  endpoint: 'https://script.google.com/macros/s/XXXX/exec'
};
```

The URL is not a secret. It can only add rows to that sheet, and the shop is the only one who can read the sheet.

## 3. Check it

Fill the quick quote form on the live site with your own number. A new row should appear in **Leads** within a few seconds, even if you close WhatsApp without sending.

Optional: in the sheet, use **Extensions > Apps Script > Triggers** or **Notification settings** to get an email when a row is added.
