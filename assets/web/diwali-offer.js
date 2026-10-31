/* Diwali offer 2026: one file runs the whole offer.

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
    startsAt: '2026-10-30T00:00:00+05:30',
    endsAt: '2026-11-10T23:59:59+05:30',       // last day to book (Bhai Dooj), India time
    bookBy: '10 Nov',
    fitBy: '30 Nov',
    slots: 50,
    booked: 0,                                 // <- UPDATE: confirmed Diwali bookings so far
    // Gift ladder by bill size (fitting included). Each step adds a gift.
    tiers: [
      { min: 2000, gift: 'Premium microfiber cloth' },
      { min: 3000, gift: 'Car perfume' },
      { min: 5000, gift: 'Dashboard Ganesh ji' }
    ]
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
    '#mmDiwaliFx{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:95}',
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

  function nudgeHTML(total) {
    if (total <= 0) {
      return 'Free gifts from <b>' + rupees(T[0].min) + '</b>: premium microfiber cloth. <b>' + rupees(T[1].min) +
        '+</b> adds a car perfume, <b>' + rupees(T[2].min) + '+</b> adds a dashboard Ganesh ji.';
    }
    if (total < T[0].min) return 'Add <b>' + rupees(T[0].min - total) + '</b> more for a free premium microfiber cloth.';
    if (total < T[1].min) return 'Premium microfiber cloth free. Add <b>' + rupees(T[1].min - total) + '</b> more for a car perfume too.';
    if (total < T[2].min) return 'Microfiber cloth and car perfume free. Add <b>' + rupees(T[2].min - total) + '</b> more for a dashboard Ganesh ji too.';
    return 'This list gets <b>all 3 gifts</b>: premium microfiber cloth, car perfume and dashboard Ganesh ji.';
  }

  function ladderHTML(tag) {
    var out = '';
    for (var i = 0; i < T.length; i++) {
      var what = ['Premium microfiber cloth', 'Microfiber + car perfume', 'All 3, with dashboard Ganesh ji'][i] || T[i].gift;
      out += '<' + tag + ' class="mm-tier"><small>Bill ' + rupees(T[i].min) + '+</small><span>' + what + '</span></' + tag + '>';
    }
    return out;
  }

  function readTotal(el) {
    var digits = ((el && el.textContent) || '').split('+')[0].replace(/[^\d]/g, '');
    return digits ? parseInt(digits, 10) : 0;
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
      '<span class="mm-offer__eyebrow">' + DIYA_SVG + 'Diwali offer &middot; Book by ' + OFFER.bookBy + '</span>' +
      '<h2 id="mmSheetTitle">Free gifts with your booking</h2>' +
      '<ul>' +
      ladderHTML('li') +
      '</ul>' +
      '<p class="mm-sheet__meta">' + slotsText() + ' Fitting any day till ' + OFFER.fitBy +
      '. Gift on fitting day, one per car. Fitting is included in every price.</p>' +
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

  /* ---------- Lights and fireworks ---------- */
  function startFx(withFireworks) {
    var c = document.createElement('canvas');
    c.id = 'mmDiwaliFx';
    c.setAttribute('aria-hidden', 'true');
    document.body.appendChild(c);
    var g = c.getContext('2d');
    if (!g) return;
    var W = 0, H = 0, dpr = 1, bulbs = [], parts = [], nextBurst = 0, navBottom = 0, diyaBox = null;
    var COLORS = ['#FFD24A', '#FF5A3C', '#FFF3C4', '#FF8A1A', '#7CFF9B', '#FF6FB5', '#8FD8FF'];
    var BULB = ['#FFD24A', '#FF5A3C', '#FFB347', '#FFF3C4', '#FF7A1A'];

    function measure() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = innerWidth; H = innerHeight;
      c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
      var nav = document.getElementById('mainNav') || document.querySelector('nav.nav');
      navBottom = nav ? Math.max(0, nav.getBoundingClientRect().bottom) : 0;
      var d = document.querySelector('.mm-diya');
      diyaBox = d ? d.getBoundingClientRect() : null;
      // Jhalar: two sagging strings across the top, a bulb every ~22px
      bulbs = [];
      var span = W < 700 ? 2 : 4, seg = W / span;
      for (var s = 0; s < span; s++) {
        var n = Math.max(6, Math.round(seg / 22));
        for (var i = 0; i <= n; i++) {
          var t = i / n, x = s * seg + t * seg;
          bulbs.push({ x: x, y: 3 + Math.sin(t * Math.PI) * (W < 700 ? 9 : 13), c: BULB[(i + s) % BULB.length], ph: (i * 0.9 + s) % 6.28, sp: 2 + (i % 3) });
        }
      }
    }

    function drawLights(t) {
      var y0 = navBottom;
      g.lineWidth = 1;
      g.strokeStyle = 'rgba(60,40,20,.9)';
      g.beginPath();
      for (var i = 0; i < bulbs.length; i++) {
        var b = bulbs[i];
        if (i === 0 || bulbs[i - 1].x > b.x) g.moveTo(b.x, y0 + b.y); else g.lineTo(b.x, y0 + b.y);
      }
      g.stroke();
      for (var j = 0; j < bulbs.length; j++) {
        var bb = bulbs[j];
        var on = reduced ? 1 : 0.35 + 0.65 * Math.max(0, Math.sin(t * bb.sp + bb.ph));
        var yy = y0 + bb.y + 4;
        g.globalAlpha = 0.35 * on;
        g.fillStyle = bb.c;
        g.beginPath(); g.arc(bb.x, yy, 6, 0, 6.283); g.fill();
        g.globalAlpha = 0.6 + 0.4 * on;
        g.beginPath(); g.arc(bb.x, yy, 2.4, 0, 6.283); g.fill();
      }
      g.globalAlpha = 1;
    }

    // Fireworks burst only in "sky" zones: the top band on desktop, the side
    // edges on phones, so they never land on the car or the main text.
    function burst() {
      var phone = W < 768, x, y;
      if (phone) {
        x = Math.random() < 0.5 ? W * (0.06 + Math.random() * 0.12) : W * (0.82 + Math.random() * 0.12);
        y = navBottom + 40 + Math.random() * H * 0.28;
      } else {
        // Above the shop board, right of the headline.
        x = W * (0.44 + Math.random() * 0.5);
        y = navBottom + 36 + Math.random() * H * 0.11;
      }
      var col = COLORS[(Math.random() * COLORS.length) | 0], col2 = COLORS[(Math.random() * COLORS.length) | 0];
      var n = phone ? 34 : 54, sp = phone ? 1.6 : 2.3;
      for (var i = 0; i < n; i++) {
        var a = (i / n) * 6.283 + Math.random() * 0.2, v = sp * (0.55 + Math.random() * 0.6);
        parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, decay: 0.012 + Math.random() * 0.01, c: i % 3 ? col : col2, r: 1.6, trail: true });
      }
    }

    // Phuljhadi: a small spray of sparks from the floating diya.
    function sparkle() {
      if (!diyaBox || document.body.classList.contains('mm-sheet-open')) return;
      var x = diyaBox.left + 30, y = diyaBox.top + 6;
      for (var i = 0; i < 2; i++) {
        var a = -Math.PI / 2 + (Math.random() - 0.5) * 1.6, v = 0.8 + Math.random() * 1.6;
        parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, decay: 0.035 + Math.random() * 0.03, c: Math.random() < 0.6 ? '#FFF3C4' : '#FFD24A', r: 1.1, trail: false });
      }
    }

    function step(now) {
      var t = now / 1000;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, W, H);
      drawLights(t);
      if (!reduced) {
        if (withFireworks && now > nextBurst && parts.length < 420) {
          burst();
          nextBurst = now + 1800 + Math.random() * 2200;
        }
        if (Math.random() < 0.6) sparkle();
        g.globalCompositeOperation = 'lighter';
        for (var i = parts.length - 1; i >= 0; i--) {
          var p = parts[i];
          p.vx *= 0.985; p.vy = p.vy * 0.985 + 0.028;
          var px = p.x, py = p.y;
          p.x += p.vx; p.y += p.vy; p.life -= p.decay;
          if (p.life <= 0) { parts.splice(i, 1); continue; }
          g.globalAlpha = Math.min(1, p.life * 1.2) * 0.85;
          g.strokeStyle = g.fillStyle = p.c;
          if (p.trail) {
            g.lineWidth = p.r; g.beginPath(); g.moveTo(px - p.vx * 3, py - p.vy * 3); g.lineTo(p.x, p.y); g.stroke();
          }
          g.beginPath(); g.arc(p.x, p.y, p.r * (p.trail && p.life < 0.3 ? 0.6 : 1), 0, 6.283); g.fill();
        }
        g.globalAlpha = 1;
        g.globalCompositeOperation = 'source-over';
      }
    }

    var raf = 0, lastFrame = 0;
    function loop(now) {
      raf = requestAnimationFrame(loop);
      if (now - lastFrame < 30) return; // about 30 fps is plenty for lights
      lastFrame = now;
      step(now);
    }
    measure();
    addEventListener('resize', measure);
    addEventListener('scroll', function () {
      var nav = document.getElementById('mainNav') || document.querySelector('nav.nav');
      navBottom = nav ? Math.max(0, nav.getBoundingClientRect().bottom) : 0;
      if (reduced) step(performance.now());
    }, { passive: true });
    if (reduced) { step(performance.now()); return; }
    nextBurst = performance.now() + 900;
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
    var eyebrow = '<span class="mm-offer__eyebrow">' + DIYA_SVG + '<span>Diwali offer &middot; Book by ' + OFFER.bookBy + '</span></span>';
    var meta = '<span class="mm-offer__meta">' + slotsText() + ' Fitting any day till ' + OFFER.fitBy + '. Gift on fitting day, one per car.</span>';
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
      rb.innerHTML = DIYA_SVG + '<span>Diwali offer: free gifts from ' + rupees(T[0].min) + ' <b>See offer &rsaquo;</b></span>';
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

    // Builder: tell people how far they are from the bigger gift.
    var nudge = document.querySelector('[data-mm-offer-nudge]');
    var totalEl = document.querySelector('.sr-total b');
    if (nudge && totalEl) {
      var update = function () { nudge.innerHTML = nudgeHTML(readTotal(totalEl)); };
      update();
      new MutationObserver(update).observe(totalEl, { childList: true, characterData: true, subtree: true });
    }

    startFx(!!document.getElementById('showroom'));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
