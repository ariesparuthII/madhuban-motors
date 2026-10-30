/* Diwali offer 2026: one file runs the whole offer.

   TO UPDATE THE "LEFT" COUNT: change `booked` below to the number of
   confirmed Diwali bookings so far, commit, and deploy to gh-pages.
   The site then shows "Only X of 50 left" (it says "First 50 bookings
   only" until 5 bookings are in, so it never shows a dead-looking 50/50).

   Everything turns itself off after the last booking day (India time) or
   when every slot is booked: the offer boxes stay hidden and WhatsApp
   messages stop carrying the DIWALI OFFER tag. Nothing is stored in the
   visitor's browser. */
(function () {
  var OFFER = {
    tag: 'DIWALI OFFER:',                      // added to the start of every WhatsApp message while live
    startsAt: '2026-10-30T00:00:00+05:30',
    endsAt: '2026-11-10T23:59:59+05:30',       // last day to book (Bhai Dooj), India time
    bookBy: '10 Nov',
    fitBy: '30 Nov',
    slots: 50,
    booked: 0,                                 // <- UPDATE: confirmed Diwali bookings so far
    bigBill: 15000                             // bill size that also gets the dashboard Ganesh ji
  };

  function slotsLeft() { return Math.max(0, OFFER.slots - OFFER.booked); }

  function isLive() {
    var t = Date.now();
    return slotsLeft() > 0 && t >= Date.parse(OFFER.startsAt) && t <= Date.parse(OFFER.endsAt);
  }

  function rupees(n) { return '₹' + Math.round(n).toLocaleString('en-IN'); }

  // Read by getMMWhatsAppUrl in index.html and search-contact.js.
  window.mmOfferTag = function () { return isLive() ? OFFER.tag : ''; };

  if (!isLive()) return;

  var CSS = [
    '.mm-offer[hidden]{display:none!important}',
    '.mm-offer{display:grid;gap:5px;margin:0 0 18px;padding:14px 16px 13px;max-width:46ch;',
    'border:1px solid rgba(255,242,0,.32);border-left:3px solid #FFF200;border-radius:2px;',
    'background:linear-gradient(100deg,rgba(255,242,0,.10),rgba(218,41,28,.12));color:#fff;text-align:left}',
    '.mm-offer__eyebrow{display:flex;align-items:center;gap:8px;font-size:11.5px;font-weight:700;line-height:1.2;',
    'letter-spacing:.14em;text-transform:uppercase;color:#FFF200}',
    '.mm-offer__eyebrow i{flex:none;width:7px;height:7px;border-radius:50%;background:#FFF200;',
    'box-shadow:0 0 10px rgba(255,242,0,.8);animation:mmOfferPulse 2s ease-in-out infinite}',
    '.mm-offer__main{font-size:17px;font-weight:700;line-height:1.35;color:#fff}',
    '.mm-offer__sub,.mm-offer__nudge{font-size:15px;font-weight:500;line-height:1.45;color:rgba(232,228,220,.9)}',
    '.mm-offer__nudge b{color:#FFF200;font-weight:700}',
    '.mm-offer__meta{font-size:12.5px;line-height:1.45;color:rgba(232,228,220,.66)}',
    '.sr-panel--hero .mm-offer{animation:srIn 1s cubic-bezier(.2,.8,.2,1) .9s both;margin:4px 0 18px}',
    '.sr-panel--build .mm-offer{margin:-4px 0 18px}',
    '.hero .mm-offer{margin:22px 0 0;max-width:52ch;border-radius:14px}',
    '@keyframes mmOfferPulse{0%,100%{opacity:1}50%{opacity:.35}}',
    '@media (max-width:480px){.mm-offer{padding:12px 14px 11px}.mm-offer__main{font-size:16px}.mm-offer__sub,.mm-offer__nudge{font-size:14.5px}}',
    '@media (prefers-reduced-motion:reduce){.mm-offer__eyebrow i,.sr-panel--hero .mm-offer{animation:none}}'
  ].join('');

  function slotsText() {
    return OFFER.booked < 5
      ? 'First ' + OFFER.slots + ' bookings only.'
      : 'Only ' + slotsLeft() + ' of ' + OFFER.slots + ' left.';
  }

  function nudgeHTML(total) {
    if (total >= OFFER.bigBill) {
      return 'This list gets a free car perfume, microfiber cloth <b>and a dashboard Ganesh ji</b>.';
    }
    if (total > 0) {
      return 'Car perfume and microfiber cloth free. Add <b>' + rupees(OFFER.bigBill - total) +
        '</b> more for a free dashboard Ganesh ji too.';
    }
    return 'Free car perfume and microfiber cloth with every booking. ' +
      rupees(OFFER.bigBill) + '+ also gets a dashboard Ganesh ji.';
  }

  function readTotal(el) {
    var digits = ((el && el.textContent) || '').split('+')[0].replace(/[^\d]/g, '');
    return digits ? parseInt(digits, 10) : 0;
  }

  function init() {
    var style = document.createElement('style');
    style.id = 'mm-offer-css';
    style.textContent = CSS;
    document.head.appendChild(style);

    var fills = { bookBy: OFFER.bookBy, fitBy: OFFER.fitBy, bigBill: rupees(OFFER.bigBill), slots: slotsText() };
    document.querySelectorAll('[data-mm-offer-fill]').forEach(function (el) {
      var key = el.getAttribute('data-mm-offer-fill');
      if (fills[key]) el.textContent = fills[key];
    });
    document.querySelectorAll('[data-mm-offer]').forEach(function (el) { el.hidden = false; });

    // Builder: tell people how far they are from the bigger gift.
    var nudge = document.querySelector('[data-mm-offer-nudge]');
    var totalEl = document.querySelector('.sr-total b');
    if (nudge && totalEl) {
      var update = function () { nudge.innerHTML = nudgeHTML(readTotal(totalEl)); };
      update();
      new MutationObserver(update).observe(totalEl, { childList: true, characterData: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
