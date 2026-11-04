/* Diwali offer 2026 (3 to 10 Nov): one file runs the whole offer.

   TO UPDATE THE "LEFT" COUNT: change `booked` below to the number of
   confirmed Diwali bookings so far, commit, and deploy to gh-pages.
   The site then shows "Only X of 50 left" (it says "First 50 bookings
   only" until 5 bookings are in, so it never shows a dead-looking 50/50).

   What it adds while the offer is live:
   - the offer boxes in the page ([data-mm-offer]), restyled to read clearly
   - a floating diya button on every page that opens the full offer
   - a string of twinkling Diwali lights under the nav, and on the homepage
     small fireworks and a phuljhadi near the diya, kept out of the car's way
   - "DIWALI OFFER:" at the start of every WhatsApp message (see mmOfferTag)

   Everything turns itself off after the last booking day (India time) or
   when every slot is booked. Nothing is stored in the visitor's browser.
   Motion stops for visitors who ask for reduced motion. */
(function () {
  var OFFER = {
    tag: 'DIWALI OFFER:',
    startsAt: '2026-11-03T00:00:00+05:30',
    endsAt: '2026-11-10T23:59:59+05:30',       // last day to book (Bhai Dooj), India time
    bookBy: '10 Nov',
    fitBy: '30 Nov',
    slots: 50,
    booked: 0,                                 // <- UPDATE: confirmed Diwali bookings so far
    // Gift ladder by bill size (fitting included). Each step adds a gift.
    tiers: [
      { min: 6999, gift: 'Premium microfiber cloth + car perfume' },
      { min: 12999, gift: 'Microfiber cloth + car perfume + dashboard murti' }
    ],
    // Shown with the offer: shop numbers to call or WhatsApp
    phones: ['+91 99114 43751', '+91 97183 73751', '+91 93116 22345']
  };
  var T = OFFER.tiers;

  function slotsLeft() { return Math.max(0, OFFER.slots - OFFER.booked); }
  function isLive() {
    var t = Date.now();
    return slotsLeft() > 0 && t >= Date.parse(OFFER.startsAt) && t <= Date.parse(OFFER.endsAt);
  }
  function rupees(n) { return '₹' + Math.round(n).toLocaleString('en-IN'); }

  // Read by getMMWhatsAppUrl in index.html and search-contact.js.
  window.mmOfferTag = function () { return isLive() ? OFFER.tag : ''; };
  if (!isLive()) return;

  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var DIYA_SVG =
    '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">' +
    '<g class="mm-flame"><path d="M24 6c4.5 6 6 9.5 6 13a6 6 0 0 1-12 0c0-3.5 1.5-7 6-13z" fill="url(#mmFlame)"/></g>' +
    '<path d="M5 27h38c-1.5 8-9.5 14-19 14S6.5 35 5 27z" fill="url(#mmBowl)"/>' +
    '<path d="M5 27h38" stroke="#FFE08A" stroke-width="2" stroke-linecap="round"/>' +
    '<circle cx="15" cy="33" r="1.6" fill="#FFE08A"/><circle cx="24" cy="35" r="1.6" fill="#FFE08A"/><circle cx="33" cy="33" r="1.6" fill="#FFE08A"/>' +
    '</svg>';

  var DEFS = '<svg width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true" focusable="false">' +
    '<defs><radialGradient id="mmFlame" cx="50%" cy="70%" r="60%"><stop offset="0" stop-color="#FFFBE0"/>' +
    '<stop offset=".45" stop-color="#FFD24A"/><stop offset="1" stop-color="#FF7A1A"/></radialGradient>' +
    '<linearGradient id="mmBowl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F0A23A"/>' +
    '<stop offset="1" stop-color="#9C3D12"/></linearGradient></defs>' + +
    '</svg>';

  var CSS = [
    '.mm-offer[hidden],.mm-sheet[hidden],.mm-ribbon[hidden]{display:none!important}',
    /* Offer box: solid dark ground, gold edge, big readable text */
    '.mm-offer{position:relative;display:grid;gap:8px;margin:0 0 18px;padding:24px 18px 16px;max-width:48ch;',
    'background:#170C05;border:1.5px solid #E8B44A;border-radius:14px;color:#fff;text-align:left;',
    'box-shadow:0 0 0 4px rgba(232,180,74,.10),0 10px 30px rgba(0,0,0,.45);font-family:"Mukta",system-ui,sans-serif}',
    '.mm-offer::before{content:"";position:absolute;left:14px;right:14px;top:9px;height:6px;border-radius:3px;',
    'background:radial-gradient(circle,#FFD24A 0 2.2px,transparent 2.8px) 0 50%/16px 6px repeat-x,',
    'radial-gradient(circle,#FF5A3C 0 2.2px,transparent 2.8px) 8px 50%/16px 6px repeat-x;',
    'animation:mmTwinkle 1.6s steps(2,jump-none) infinite}',
    '.mm-offer__eyebrow{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:700;line-height:1.25;',
    'letter-spacing:.08em;text-transform:uppercase;color:#FFD24A}',
    '.mm-offer__eyebrow svg{flex:none;width:26px;height:26px}',
    '.mm-offer__main{font-size:20px;font-weight:700;line-height:1.35;color:#fff}',
    '.mm-offer__sub,.mm-offer__nudge{font-size:18px;font-weight:500;line-height:1.45;color:#FFF3DC}',
    '.mm-offer__sub b,.mm-offer__nudge b{color:#FFD24A;font-weight:700}',
    '.mm-phones a{color:#FFD24A;font-weight:700;text-decoration:none;white-space:nowrap}',
    '.mm-offer__meta{font-size:15.5px;line-height:1.45;color:#E9DCC6;border-top:1px solid rgba(232,180,74,.28);padding-top:9px;margin-top:2px}',
    '.sr-panel--build .mm-offer{margin:-2px 0 18px}',
    '.mm-ladder{display:grid;gap:6px}',
    '.mm-tier{display:flex;align-items:baseline;gap:10px;font-size:18px;line-height:1.35;color:#fff}',
    '.mm-tier small{flex:none;min-width:92px;font-size:16px;font-weight:700;color:#FFD24A;font-variant-numeric:tabular-nums}',
    '.mm-tier span{font-weight:600}',
    '.hero .mm-offer{margin:24px 0 0;max-width:54ch}',
    /* Hero ribbon: one line so the car stays clear */
    '.mm-ribbon{display:inline-flex;align-items:center;gap:10px;margin:2px 0 18px;padding:9px 16px 9px 10px;',
    'background:#170C05;border:1.5px solid #E8B44A;border-radius:999px;color:#fff;cursor:pointer;',
    'font:700 16px/1.2 "Mukta",system-ui,sans-serif;text-align:left;max-width:100%;',
    'box-shadow:0 0 18px rgba(232,180,74,.25);animation:srIn 1s cubic-bezier(.2,.8,.2,1) .9s both}',
    '.mm-ribbon svg{flex:none;width:30px;height:30px}',
    '.mm-ribbon span{min-width:0}',
    '.mm-ribbon b{color:#FFD24A;white-space:nowrap}',
    '.mm-ribbon:hover{border-color:#FFD24A}',
    '.mm-ribbon:focus-visible,.mm-diya:focus-visible,.mm-sheet button:focus-visible,.mm-sheet a:focus-visible{outline:2px solid #FFF200;outline-offset:3px}',
    /* Floating diya button */
    '.mm-diya{position:fixed;z-index:9990;right:calc(18px + env(safe-area-inset-right,0px));bottom:calc(24px + env(safe-area-inset-bottom,0px));',
    'display:flex;align-items:center;gap:8px;padding:6px 14px 6px 6px;border-radius:999px;cursor:pointer;',
    'background:#170C05;border:1.5px solid #E8B44A;color:#FFD24A;font:700 15px/1 "Mukta",system-ui,sans-serif;',
    'box-shadow:0 0 0 0 rgba(255,210,74,.55),0 8px 24px rgba(0,0,0,.5);animation:mmGlow 2.4s ease-out infinite}',
    '.mm-diya svg{width:44px;height:44px}',
    '.mm-flame{transform-origin:24px 22px;animation:mmFlicker .9s ease-in-out infinite alternate}',
    'body.mm-sheet-open .mm-diya{opacity:0;pointer-events:none}',
    '@media (max-width:767px){.mm-diya{right:calc(12px + env(safe-area-inset-right,0px));bottom:calc(72px + env(safe-area-inset-bottom,0px));padding:5px}',
    '.mm-diya span{display:none}.mm-diya svg{width:46px;height:46px}}',
    'body.mm-has-search-bar .mm-diya{bottom:calc(24px + env(safe-area-inset-bottom,0px))}',
    '@media (max-width:767px){body.mm-has-search-bar .mm-diya{bottom:calc(92px + env(safe-area-inset-bottom,0px))}}',
    /* Offer sheet */
    '.mm-sheet{position:fixed;inset:0;z-index:100001;display:flex;align-items:center;justify-content:center;padding:20px;',
    'background:rgba(0,0,0,.72);font-family:"Mukta",system-ui,sans-serif}',
    '.mm-sheet__card{position:relative;width:min(460px,100%);max-height:calc(100% - 20px);overflow:auto;',
    'background:#170C05;border:1.5px solid #E8B44A;border-radius:18px;padding:30px 22px 22px;color:#fff;',
    'box-shadow:0 0 60px rgba(232,180,74,.22);display:grid;gap:14px}',
    '.mm-sheet__card::before{content:"";position:absolute;left:18px;right:18px;top:12px;height:7px;',
    'background:radial-gradient(circle,#FFD24A 0 2.6px,transparent 3.2px) 0 50%/18px 7px repeat-x,',
    'radial-gradient(circle,#FF5A3C 0 2.6px,transparent 3.2px) 9px 50%/18px 7px repeat-x;animation:mmTwinkle 1.6s steps(2,jump-none) infinite}',
    '.mm-sheet h2{font:400 clamp(30px,7vw,38px)/1.05 "Rozha One",Georgia,serif;color:#fff;margin:4px 0 0;text-wrap:balance}',
    '.mm-sheet ul{list-style:none;margin:0;padding:0;display:grid;gap:10px}',
    '.mm-sheet li.mm-tier{display:grid;gap:2px;padding:12px 14px;border-radius:12px;background:rgba(255,210,74,.08);border:1px solid rgba(232,180,74,.3)}',
    '.mm-sheet li small{font-size:14px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#FFD24A}',
    '.mm-sheet li span{font-size:19px;font-weight:700;line-height:1.35;color:#fff}',
    '.mm-sheet__meta{font-size:16px;line-height:1.5;color:#E9DCC6;margin:0}',
    '.mm-sheet__cta{display:flex;flex-wrap:wrap;gap:10px}',
    '.mm-sheet__cta a,.mm-sheet__cta button{flex:1 1 180px;display:inline-flex;align-items:center;justify-content:center;min-height:50px;',
    'padding:12px 18px;border-radius:10px;font:700 17px/1.1 "Mukta",system-ui,sans-serif;text-decoration:none;cursor:pointer}',
    '.mm-sheet__wa{background:#16A34A;color:#fff;border:0}',
    '.mm-sheet__alt{background:transparent;color:#FFD24A;border:1.5px solid #E8B44A}',
    '.mm-sheet__x{position:absolute;right:10px;top:22px;width:40px;height:40px;border-radius:50%;border:1px solid rgba(232,180,74,.45);',
    'background:#170C05;color:#fff;font:400 24px/1 system-ui,sans-serif;cursor:pointer}',
    '@media (max-width:560px){.mm-sheet{align-items:flex-end;padding:0}.mm-sheet__card{width:100%;border-radius:20px 20px 0 0;',
    'padding-bottom:calc(22px + env(safe-area-inset-bottom,0px));border-bottom:0}}',
    /* Effects canvas */
    '.mm-fx{pointer-events:none}',
    '.mm-fx--page{position:fixed;inset:0;width:100%;height:100%;z-index:-1}',
    '.mm-fx--hero{position:absolute;inset:0;width:100%;height:100%;z-index:0}',
    '@keyframes mmTwinkle{0%{opacity:1;filter:brightness(1.15)}50%{opacity:.55;filter:brightness(.8)}100%{opacity:1}}',
    '@keyframes mmFlicker{from{transform:scale(1,1) rotate(-2deg)}to{transform:scale(.9,1.08) rotate(2deg)}}',
    '@keyframes mmGlow{0%{box-shadow:0 0 0 0 rgba(255,210,74,.5),0 8px 24px rgba(0,0,0,.5)}70%,100%{box-shadow:0 0 0 14px rgba(255,210,74,0),0 8px 24px rgba(0,0,0,.5)}}',
    '@media (prefers-reduced-motion:reduce){.mm-offer::before,.mm-sheet__card::before,.mm-flame,.mm-diya,.mm-ribbon{animation:none}}'
  ].join('');

  function slotsText() {
    return OFFER.booked < 5
      ? 'First ' + OFFER.slots + ' bookings only.'
      : 'Only ' + slotsLeft() + ' of ' + OFFER.slots + ' left.';
  }

  function nudgeHTML() {
    return 'Work of <b>' + rupees(T[0].min) + '+</b>: free premium microfiber cloth and car perfume. <b>' + rupees(T[1].min) +
      '+</b>: both of those plus a dashboard murti (Ganesh ji, Ram ji, Krishna ji, your choice).';
  }

  function phonesHTML() {
    return 'Call or WhatsApp: ' + OFFER.phones.map(function (n) {
      return '<a href="tel:' + n.replace(/[^\d+]/g, '') + '">' + n.replace('+91 ', '') + '</a>';
    }).join(' &middot; ');
  }

  function ladderHTML(tag) {
    var out = '';
    var what = ['Premium microfiber cloth + car perfume', 'Microfiber cloth + car perfume + dashboard murti (Ganesh ji, Ram ji, Krishna ji, your choice)'];
    for (var i = 0; i < T.length; i++) {
      out += '<' + tag + ' class="mm-tier"><small>Work of ' + rupees(T[i].min) + '+</small><span>' + (what[i] || T[i].gift) + '</span></' + tag + '>';
    }
    return out;
  }

  function waUrl(msg) {
    return typeof window.getMMWhatsAppUrl === 'function'
      ? window.getMMWhatsAppUrl(msg)
      : 'https://wa.me/919911443751?text=' + encodeURIComponent(OFFER.tag + ' ' + msg);
  }

  /* ---------- Offer sheet ---------- */
  var sheet, lastFocus;
  function buildSheet() {
    var onHome = !!document.getElementById('showroom');
    sheet = document.createElement('div');
    sheet.className = 'mm-sheet';
    sheet.hidden = true;
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    sheet.setAttribute('aria-labelledby', 'mmSheetTitle');
    sheet.innerHTML =
      '<div class="mm-sheet__card">' +
      '<button type="button" class="mm-sheet__x" aria-label="Close">&times;</button>' +
      '<span class="mm-offer__eyebrow">' + DIYA_SVG + 'Diwali offer &middot; 3 to ' + OFFER.bookBy + '</span>' +
      '<h2 id="mmSheetTitle">Free gifts with your booking</h2>' +
      '<p class="mm-sheet__meta">Book between 3 Nov and ' + OFFER.bookBy + '.</p>' +
      '<ul>' +
      ladderHTML('li') +
      '</ul>' +
      '<p class="mm-sheet__meta">' + slotsText() + ' Fitting any day till ' + OFFER.fitBy +
      '. Gift on fitting day, one per car. Fitting is included in every price.</p>' +
      '<p class="mm-sheet__meta mm-phones">' + phonesHTML() + '</p>' +
      '<div class="mm-sheet__cta">' +
      '<a class="mm-sheet__wa" target="_blank" rel="noopener" href="#">Book on WhatsApp</a>' +
      (onHome
        ? '<button type="button" class="mm-sheet__alt" data-mm-go-build>Build my list</button>'
        : '<a class="mm-sheet__alt" href="/#build">Build my list</a>') +
      '</div></div>';
    document.body.appendChild(sheet);

    var wa = sheet.querySelector('.mm-sheet__wa');
    wa.addEventListener('click', function () {
      wa.href = waUrl('Hi, I want to book the Diwali offer for my car.');
      try { window.gtag && window.gtag('event', 'diwali_offer_whatsapp'); } catch (e) {}
    });
    wa.href = waUrl('Hi, I want to book the Diwali offer for my car.');
    sheet.querySelector('.mm-sheet__x').addEventListener('click', closeSheet);
    sheet.addEventListener('click', function (e) { if (e.target === sheet) closeSheet(); });
    var go = sheet.querySelector('[data-mm-go-build]');
    if (go) go.addEventListener('click', function () {
      closeSheet();
      var ch = document.getElementById('build') || document.querySelector('.sr-ch[data-ch="car"]');
      if (ch) window.scrollTo({ top: ch.getBoundingClientRect().top + window.scrollY, behavior: reduced ? 'auto' : 'smooth' });
    });
    document.addEventListener('keydown', function (e) {
      if (sheet.hidden) return;
      if (e.key === 'Escape') { closeSheet(); return; }
      if (e.key === 'Tab') {
        var f = sheet.querySelectorAll('button,a[href]');
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }
  function openSheet() {
    lastFocus = document.activeElement;
    sheet.hidden = false;
    document.body.classList.add('mm-sheet-open');
    sheet.querySelector('.mm-sheet__wa').focus();
    try { window.gtag && window.gtag('event', 'diwali_offer_open'); } catch (e) {}
  }
  function closeSheet() {
    sheet.hidden = true;
    document.body.classList.remove('mm-sheet-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* ---------- Lights and fireworks (behind the content) ----------
     Hand-written canvas effects, no library. Two layers:
     - page layer: a fixed canvas BEHIND every section (z-index -1, over the stars),
     - hero layer: inside the 3D showroom, above the car scene but under the text.
     Fireworks: a rocket climbs with a spark trail, then bursts as a peony, a gold
     willow, a ring or crackling glitter. Lights: warm ladi strands with soft glow. */
  function makeFx(host, opts) {
    var c = document.createElement('canvas');
    c.setAttribute('aria-hidden', 'true');
    c.className = 'mm-fx ' + (opts.cls || '');
    if (opts.before) host.insertBefore(c, opts.before); else host.appendChild(c);
    var g = c.getContext('2d'); if (!g) return null;
    var W = 0, H = 0, dpr = 1, rockets = [], parts = [], strands = [], nextBurst = 0;
    var PAL = [['#FFD27A', '#FFF1C9'], ['#FF5A3C', '#FFC2A8'], ['#FF9A2E', '#FFE2A8'], ['#FFFFFF', '#FFE9B8'], ['#E8B84A', '#FFF6D8']];

    function measure() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      var r = opts.box ? opts.box() : { width: innerWidth, height: innerHeight };
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
      // Ladi: a few strands hanging from the top, longer at the edges, like a shop front
      strands = [];
      var n = W < 700 ? 5 : 9;
      for (var i = 0; i < n; i++) {
        var u = n === 1 ? .5 : i / (n - 1), edge = Math.abs(u - .5) * 2;
        var x = 10 + u * (W - 20), len = (opts.short ? .12 : .2) * H * (0.35 + edge * edge);
        var bulbs = [], step = W < 700 ? 13 : 16;
        for (var y = 6; y < len; y += step) bulbs.push({ y: y, ph: Math.random() * 6.28 });
        strands.push({ x: x, sway: Math.random() * 6.28, bulbs: bulbs });
      }
    }

    function zone() { return opts.zone ? opts.zone(W, H) : { x0: .1, x1: .9, y0: .12, y1: .45 }; }
    function launch() {
      var z = zone(), tx = W * (z.x0 + Math.random() * (z.x1 - z.x0)), ty = H * (z.y0 + Math.random() * (z.y1 - z.y0));
      var x0 = tx + (Math.random() - .5) * W * .06, y0 = Math.min(H + 10, ty + H * (opts.rise || .45)), T = 34 + Math.random() * 10;
      rockets.push({ x: x0, y: y0, vx: (tx - x0) / T, vy: (ty - y0) / T, t: 0, T: T, tx: tx, ty: ty });
    }
    function explode(x, y) {
      var kind = Math.random(), pal = PAL[(Math.random() * PAL.length) | 0];
      var big = Math.min(W, H) < 500 ? .8 : 1.35;
      if (kind < .35) {          // peony: round, colour fading to warm white
        for (var i = 0; i < 90; i++) { var a = Math.random() * 6.283, v = (1.2 + Math.random() * 2.6) * big;
          parts.push(P(x, y, Math.cos(a) * v, Math.sin(a) * v, pal[0], pal[1], 1.7, .012, .04, false)); }
      } else if (kind < .6) {    // gold willow: long drooping golden trails
        for (var j = 0; j < 70; j++) { var b = Math.random() * 6.283, w = (.8 + Math.random() * 1.9) * big;
          parts.push(P(x, y, Math.cos(b) * w, Math.sin(b) * w, '#E8B84A', '#FFE7A6', 1.3, .006, .06, false)); }
      } else if (kind < .8) {    // ring
        var rot = Math.random() * 6.283;
        for (var k = 0; k < 64; k++) { var d = rot + k / 64 * 6.283, s = 2.9 * big;
          parts.push(P(x, y, Math.cos(d) * s, Math.sin(d) * s * .62, pal[0], pal[1], 1.6, .014, .03, false)); }
      } else {                   // glitter that crackles as it falls
        for (var m = 0; m < 80; m++) { var e = Math.random() * 6.283, q = (1 + Math.random() * 2.4) * big;
          parts.push(P(x, y, Math.cos(e) * q, Math.sin(e) * q, '#FFF6D8', '#FFD27A', 1.2, .011, .045, true)); }
      }
    }
    function P(x, y, vx, vy, c1, c2, r, decay, grav, glitter) {
      return { x: x, y: y, vx: vx, vy: vy, c1: c1, c2: c2, r: r, life: 1, decay: decay * (0.8 + Math.random() * .4), grav: grav, glitter: glitter };
    }

    function drawLadi(t) {
      for (var i = 0; i < strands.length; i++) {
        var s = strands[i], sx = s.x + Math.sin(t * .6 + s.sway) * 1.5, last = s.bulbs.length ? s.bulbs[s.bulbs.length - 1].y : 0;
        g.globalCompositeOperation = 'source-over';
        g.globalAlpha = .35; g.strokeStyle = '#3a2a14'; g.lineWidth = 1;
        g.beginPath(); g.moveTo(s.x, 0); g.lineTo(sx, last); g.stroke();
        g.globalCompositeOperation = 'lighter';
        for (var j = 0; j < s.bulbs.length; j++) {
          var b = s.bulbs[j], k = j / Math.max(1, s.bulbs.length), x = s.x + (sx - s.x) * k;
          var on = reduced ? .8 : .45 + .55 * Math.pow(Math.max(0, Math.sin(t * 1.6 - j * .55 + b.ph * .2)), 2);
          var glow = g.createRadialGradient(x, b.y, 0, x, b.y, 9);
          glow.addColorStop(0, 'rgba(255,214,140,' + (.55 * on) + ')'); glow.addColorStop(1, 'rgba(255,170,60,0)');
          g.globalAlpha = 1; g.fillStyle = glow; g.beginPath(); g.arc(x, b.y, 9, 0, 6.283); g.fill();
          g.fillStyle = 'rgba(255,244,214,' + (.5 + .5 * on) + ')'; g.beginPath(); g.arc(x, b.y, 1.6, 0, 6.283); g.fill();
        }
      }
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    }

    function step(now) {
      var t = now / 1000;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      // fade the last frame instead of wiping it: gives every spark a soft trail
      g.clearRect(0, 0, W, H);   // full clear every frame: no ghost smudges
      if (!reduced && opts.fireworks && now > nextBurst && rockets.length < 3 && parts.length < 700 && (!opts.active || opts.active())) {
        launch(); nextBurst = now + 1400 + Math.random() * 2200;
      }
      g.globalCompositeOperation = 'lighter';
      for (var i = rockets.length - 1; i >= 0; i--) {
        var r = rockets[i]; r.t++; r.x += r.vx; r.y += r.vy;
        g.globalAlpha = .9; g.fillStyle = '#FFE2A8'; g.beginPath(); g.arc(r.x, r.y, 1.6, 0, 6.283); g.fill();
        g.globalAlpha = .35; g.strokeStyle = '#FFB347'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(r.x - r.vx * 6, r.y - r.vy * 6); g.lineTo(r.x, r.y); g.stroke();
        if (Math.random() < .7) parts.push(P(r.x, r.y, (Math.random() - .5) * .4, .3 + Math.random() * .5, '#FFB347', '#FFE2A8', .9, .05, .02, false));
        if (r.t >= r.T) { explode(r.x, r.y); rockets.splice(i, 1); }
      }
      for (var j = parts.length - 1; j >= 0; j--) {
        var p = parts[j];
        p.vx *= .975; p.vy = p.vy * .975 + p.grav; p.x += p.vx; p.y += p.vy; p.life -= p.decay;
        if (p.life <= 0 || p.y > H + 20) { parts.splice(j, 1); continue; }
        var a = p.life > .3 ? 1 : p.life / .3;
        if (p.glitter && p.life < .55 && Math.random() < .5) a *= .15;   // crackle
        var col = p.life > .55 ? p.c1 : p.c2, tl = p.grav > .05 ? 9 : 5;
        g.globalAlpha = a * .55; g.strokeStyle = col; g.lineWidth = p.r * .9;
        g.beginPath(); g.moveTo(p.x - p.vx * tl, p.y - p.vy * tl); g.lineTo(p.x, p.y); g.stroke();
        g.globalAlpha = a; g.fillStyle = col;
        g.beginPath(); g.arc(p.x, p.y, p.r * (.6 + p.life * .5), 0, 6.283); g.fill();
      }
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
      if (opts.ladi) drawLadi(t);
    }

    measure();
    addEventListener('resize', measure);
    return { step: step, el: c };
  }

  function startFx() {
    var layers = [];
    var stage = document.querySelector('.sr-sticky');
    var heroCh = document.querySelector('.sr-ch[data-ch="hero"]') || document.querySelector('.sr-ch');
    var heroVisible = function () {
      if (!heroCh) return false;
      var r = heroCh.getBoundingClientRect(); return r.bottom > innerHeight * .25 && r.top < innerHeight * .75;
    };
    var phone = function () { return innerWidth < 768; };
    if (stage) {
      // Hero: inside the 3D scene, under the scrim and text, sky above the board
      var hero = makeFx(stage, {
        cls: 'mm-fx--hero', before: stage.querySelector('.sr-scrim'), fireworks: true, ladi: false, rise: .14,
        box: function () { return stage.getBoundingClientRect(); },
        active: heroVisible,
        zone: function (W, H) { return phone() ? { x0: .08, x1: .92, y0: .1, y1: .17 } : { x0: .5, x1: .95, y0: .1, y1: .26 }; }
      });
      if (hero) layers.push(hero);
    }
    // Page: behind every section, over the starfield, for the rest of the scroll
    var page = makeFx(document.body, {
      cls: 'mm-fx--page', fireworks: true, ladi: true, short: true,
      active: function () { return !stage || !heroVisible(); },
      zone: function () { return { x0: .06, x1: .94, y0: .1, y1: .5 }; }
    });
    if (page) layers.push(page);

    var raf = 0, lastFrame = 0;
    function loop(now) {
      raf = requestAnimationFrame(loop);
      if (now - lastFrame < 30) return;
      lastFrame = now;
      for (var i = 0; i < layers.length; i++) layers[i].step(now);
    }
    if (reduced) { layers.forEach(function (l) { l.step(performance.now()); }); return; }
    raf = requestAnimationFrame(loop);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
      else if (!raf) raf = requestAnimationFrame(loop);
    });
  }

  function init() {
    var style = document.createElement('style');
    style.id = 'mm-offer-css';
    style.textContent = CSS;
    document.head.appendChild(style);
    var defsHolder = document.createElement('div');
    defsHolder.innerHTML = DEFS;
    document.body.insertBefore(defsHolder.firstChild, document.body.firstChild);
    if (document.querySelector('.search-contact-bar')) document.body.classList.add('mm-has-search-bar');

    // Fill the placeholders: <div data-mm-offer="page|build" hidden></div>
    var eyebrow = '<span class="mm-offer__eyebrow">' + DIYA_SVG + '<span>Diwali offer &middot; 3 to ' + OFFER.bookBy + '</span></span>';
    var meta = '<span class="mm-offer__meta">' + slotsText() + ' Fitting any day till ' + OFFER.fitBy + '. Gift on fitting day, one per car.</span>' +
      '<span class="mm-offer__meta mm-phones">' + phonesHTML() + '</span>';
    document.querySelectorAll('[data-mm-offer]').forEach(function (el) {
      if (el.children.length) return;
      el.classList.add('mm-offer');
      el.innerHTML = el.getAttribute('data-mm-offer') === 'build'
        ? eyebrow + '<span class="mm-offer__nudge" data-mm-offer-nudge aria-live="polite"></span>' + meta
        : eyebrow + '<strong class="mm-offer__main">Free gifts on your Diwali booking</strong>' +
          '<span class="mm-ladder">' + ladderHTML('span') + '</span>' + meta;
    });
    // Homepage hero: one slim ribbon, so the car stays clear.
    var heroCtas = document.querySelector('.sr-panel--hero .sr-ctas');
    if (heroCtas && !document.querySelector('[data-mm-offer-open]')) {
      var rb = document.createElement('button');
      rb.type = 'button';
      rb.className = 'mm-ribbon';
      rb.setAttribute('data-mm-offer-open', '');
      rb.innerHTML = DIYA_SVG + '<span>Diwali offer: free gifts on ' + rupees(T[0].min) + '+ work <b>See offer &rsaquo;</b></span>';
      heroCtas.parentNode.insertBefore(rb, heroCtas);
    }

    var fills = { bookBy: OFFER.bookBy, fitBy: OFFER.fitBy, slots: slotsText() };
    document.querySelectorAll('[data-mm-offer-fill]').forEach(function (el) {
      var key = el.getAttribute('data-mm-offer-fill');
      if (fills[key]) el.textContent = fills[key];
    });
    document.querySelectorAll('.mm-offer__eyebrow i').forEach(function (i) {
      var s = document.createElement('span'); s.innerHTML = DIYA_SVG; i.replaceWith(s.firstChild);
    });
    document.querySelectorAll('[data-mm-offer]').forEach(function (el) { el.hidden = false; });

    buildSheet();
    document.querySelectorAll('[data-mm-offer-open]').forEach(function (b) {
      b.hidden = false;
      b.addEventListener('click', openSheet);
    });

    var diya = document.createElement('button');
    diya.type = 'button';
    diya.className = 'mm-diya';
    diya.setAttribute('aria-label', 'See the Diwali offer');
    diya.innerHTML = DIYA_SVG + '<span>Diwali offer</span>';
    diya.addEventListener('click', openSheet);
    document.body.appendChild(diya);

    // Builder: show the two gift segments (no running total, prices are shared on WhatsApp).
    var nudge = document.querySelector('[data-mm-offer-nudge]');
    if (nudge) nudge.innerHTML = nudgeHTML();

    startFx();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
