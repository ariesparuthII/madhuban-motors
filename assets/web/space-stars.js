/* Space backdrop for the whole page: twinkling stars, slow drift, the odd shooting star.
   One fixed canvas behind everything. Static when reduced motion is on. */
(function () {
  const c = document.createElement('canvas');
  c.id = 'mmStars'; c.setAttribute('aria-hidden', 'true');
  document.body.prepend(c);
  const g = c.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0, H = 0, dpr = 1, stars = [], shoot = null, nextShoot = 0, last = 0;
  function build() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    c.width = W * dpr; c.height = H * dpr; c.style.width = W + 'px'; c.style.height = H + 'px';
    const n = Math.round(W * H / (W < 700 ? 2600 : 2100));
    stars = Array.from({ length: n }, () => {
      const big = Math.random() < .06;
      return { x: Math.random() * W, y: Math.random() * H * 1.6, r: big ? 1.1 + Math.random() * .9 : .35 + Math.random() * .6,
        a: big ? .75 : .25 + Math.random() * .45, tw: .6 + Math.random() * 2.2, ph: Math.random() * 6.3,
        warm: Math.random() < .18, depth: .02 + Math.random() * .08 };
    });
  }
  function draw(now) {
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    const sy = scrollY, t = now / 1000;
    for (const s of stars) {
      let y = (s.y - sy * s.depth) % (H * 1.6); if (y < 0) y += H * 1.6; if (y > H) continue;
      const tw = reduced ? 1 : .55 + .45 * Math.sin(t * s.tw + s.ph);
      g.globalAlpha = s.a * tw;
      g.fillStyle = s.warm ? '#ffe9c4' : '#ffffff';
      g.beginPath(); g.arc(s.x, y, s.r, 0, 6.283); g.fill();
      if (s.r > 1.2) { g.globalAlpha = s.a * tw * .18; g.beginPath(); g.arc(s.x, y, s.r * 3.2, 0, 6.283); g.fill(); }
    }
    if (!reduced) {
      if (!shoot && now > nextShoot) {
        shoot = { x: Math.random() * W * .7 + W * .2, y: Math.random() * H * .4, vx: -(420 + Math.random() * 260), vy: 160 + Math.random() * 120, life: 0 };
        nextShoot = now + 7000 + Math.random() * 9000;
      }
      if (shoot) {
        const dt = Math.min(.05, (now - last) / 1000); shoot.life += dt; shoot.x += shoot.vx * dt; shoot.y += shoot.vy * dt;
        const a = Math.max(0, 1 - shoot.life / .9), len = .16;
        const grad = g.createLinearGradient(shoot.x, shoot.y, shoot.x - shoot.vx * len, shoot.y - shoot.vy * len);
        grad.addColorStop(0, `rgba(255,255,255,${a})`); grad.addColorStop(1, 'rgba(255,255,255,0)');
        g.globalAlpha = 1; g.strokeStyle = grad; g.lineWidth = 1.4; g.beginPath(); g.moveTo(shoot.x, shoot.y);
        g.lineTo(shoot.x - shoot.vx * len, shoot.y - shoot.vy * len); g.stroke();
        if (a <= 0) shoot = null;
      }
    }
    g.globalAlpha = 1; last = now;
  }
  let raf = 0, lastFrame = 0;
  function loop(now) { raf = requestAnimationFrame(loop); if (now - lastFrame < 33) return; lastFrame = now; draw(now); }
  build(); nextShoot = performance.now() + 3000;
  if (reduced) { draw(0); addEventListener('scroll', () => draw(0), { passive: true }); }
  else raf = requestAnimationFrame(loop);
  addEventListener('resize', () => { build(); if (reduced) draw(0); });
  document.addEventListener('visibilitychange', () => { if (reduced) return; if (document.hidden) cancelAnimationFrame(raf); else raf = requestAnimationFrame(loop); });
})();
