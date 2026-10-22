/* The real Madhuban Motors shopfront as the showroom's back wall: the actual
   board cut out of the shop's day and night photos (it lights up with the
   studio), over a warm-lit shop opening drawn on a canvas. */

export async function buildShopBoard(T, logoImg, base = 'assets/web/') {
  const SERIF = '"Rozha One", Georgia, serif', SANS = '"Mukta", Arial, sans-serif';
  const group = new T.Group();
  const mats = [];

  function panel(w, h, cw, ch, draw, opts = {}) {
    const c = document.createElement('canvas'); c.width = cw; c.height = ch;
    const g = c.getContext('2d'); draw(g, cw, ch);
    const tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace; tex.anisotropy = 8;
    const m = new T.MeshBasicMaterial({ map: tex, transparent: !!opts.transparent, toneMapped: false, fog: false, depthWrite: !opts.transparent });
    m.userData.gain = opts.gain || 1; mats.push(m);
    const mesh = new T.Mesh(new T.PlaneGeometry(w, h), m);
    group.add(mesh); return mesh;
  }

  // 1. Shop opening: a real accessories showroom seen through the glass
  const open = panel(5.2, 2.5, 2048, 984, (g, w, h) => {
    // back wall: dark charcoal with a warm wash from the ceiling spots
    const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#1b1a1c'); bg.addColorStop(.7, '#121113'); bg.addColorStop(1, '#0a0a0b');
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    // ceiling: slim LED line + downlights with soft cones
    g.fillStyle = '#f4f1ea'; g.fillRect(w * .08, 26, w * .84, 6);
    for (let i = 0; i < 6; i++) {
      const x = w * (.12 + i * .152);
      const cone = g.createRadialGradient(x, 40, 6, x, 260, 330);
      cone.addColorStop(0, 'rgba(255,226,170,.55)'); cone.addColorStop(1, 'rgba(255,226,170,0)');
      g.fillStyle = cone; g.beginPath(); g.moveTo(x - 30, 40); g.lineTo(x + 30, 40); g.lineTo(x + 260, h * .8); g.lineTo(x - 260, h * .8); g.closePath(); g.fill();
      g.fillStyle = '#fff6e0'; g.beginPath(); g.arc(x, 44, 14, 0, 6.283); g.fill();
    }
    // glass shelves with white LED edges, stocked with products
    const shelfY = [300, 520, 740];
    const seed = n => { const x = Math.sin(n * 91.7) * 43758.5453; return x - Math.floor(x); };
    shelfY.forEach((y, row) => {
      for (let x = 140; x < w - 160;) {
        const k = seed(x * 0.37 + row * 7.1), kind = Math.floor(k * 5);
        if (kind === 0) {            // speaker on a stand
          const r = 46 + k * 22; g.fillStyle = '#0d0d0f'; g.fillRect(x, y - r * 2 - 10, r * 2, r * 2 + 10);
          g.fillStyle = '#2b2b2f'; g.beginPath(); g.arc(x + r, y - r - 5, r * .82, 0, 6.283); g.fill();
          g.fillStyle = '#c9302a'; g.beginPath(); g.arc(x + r, y - r - 5, r * .3, 0, 6.283); g.fill();
          x += r * 2 + 34;
        } else if (kind === 1) {     // android screen showing a map-blue UI
          const sw = 150, sh = 92; g.fillStyle = '#050608'; g.fillRect(x, y - sh - 14, sw, sh);
          const sc = g.createLinearGradient(x, y - sh, x + sw, y); sc.addColorStop(0, '#1f6fd1'); sc.addColorStop(1, '#0c2c55');
          g.fillStyle = sc; g.fillRect(x + 7, y - sh - 7, sw - 14, sh - 14);
          g.fillStyle = 'rgba(255,255,255,.8)'; g.fillRect(x + 18, y - sh + 4, 40, 8); g.fillRect(x + 18, y - sh + 20, 70, 6);
          x += sw + 34;
        } else if (kind === 2) {     // dashcam boxes
          for (let j = 0; j < 3; j++) { g.fillStyle = j % 2 ? '#1e1e22' : '#e8e4da'; g.fillRect(x + j * 46, y - 60, 40, 60); g.fillStyle = '#c9302a'; g.fillRect(x + j * 46, y - 18, 40, 6); }
          x += 3 * 46 + 30;
        } else if (kind === 3) {     // rolled seat-cover leather, black and tan
          for (let j = 0; j < 3; j++) { g.fillStyle = ['#151517', '#8a5a33', '#2d2d31'][j]; g.beginPath(); g.ellipse(x + 34 + j * 70, y - 34, 32, 34, 0, 0, 6.283); g.fill();
            g.strokeStyle = 'rgba(255,255,255,.15)'; g.lineWidth = 3; g.beginPath(); g.arc(x + 34 + j * 70, y - 34, 18, 0, 6.283); g.stroke(); }
          x += 3 * 70 + 30;
        } else {                     // amplifier with fins
          g.fillStyle = '#1a1a1d'; g.fillRect(x, y - 54, 170, 54);
          g.fillStyle = '#333338'; for (let f = 0; f < 10; f++) g.fillRect(x + 8 + f * 16, y - 50, 8, 46);
          g.fillStyle = '#ff3b2f'; g.fillRect(x + 150, y - 46, 8, 8);
          x += 170 + 34;
        }
      }
      g.fillStyle = 'rgba(210,230,240,.18)'; g.fillRect(90, y, w - 180, 10);         // glass
      g.fillStyle = 'rgba(255,255,255,.9)'; g.fillRect(90, y + 10, w - 180, 3);      // LED edge
      const glow = g.createLinearGradient(0, y + 13, 0, y + 70); glow.addColorStop(0, 'rgba(255,255,255,.18)'); glow.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = glow; g.fillRect(90, y + 13, w - 180, 57);
    });
    // floor tiles with a soft shine
    const fl = g.createLinearGradient(0, h * .82, 0, h); fl.addColorStop(0, '#2a2725'); fl.addColorStop(1, '#141312');
    g.fillStyle = fl; g.fillRect(0, h * .82, w, h * .18);
    g.strokeStyle = 'rgba(255,255,255,.06)'; g.lineWidth = 2; for (let x = 0; x < w; x += 170) { g.beginPath(); g.moveTo(x, h * .82); g.lineTo(x - 60, h); g.stroke(); }
    // glass doors: frames and a faint reflection streak
    g.fillStyle = 'rgba(0,0,0,.85)'; g.fillRect(0, 0, 30, h); g.fillRect(w - 30, 0, 30, h); g.fillRect(w / 2 - 10, 0, 20, h);
    const refl = g.createLinearGradient(0, 0, w, h); refl.addColorStop(.25, 'rgba(255,255,255,0)'); refl.addColorStop(.32, 'rgba(255,255,255,.07)'); refl.addColorStop(.4, 'rgba(255,255,255,0)');
    g.fillStyle = refl; g.fillRect(0, 0, w, h);
  }, { gain: 1.0 });
  open.position.set(0, 1.09, 0);

  // 2-4. The real board, cut out from the shop's own photos: day version as
  // the base, the lit night version fades in when the studio powers on.
  const loader = new T.TextureLoader();
  const load = url => new Promise(res => loader.load(url, t => { t.colorSpace = T.SRGBColorSpace; t.anisotropy = 16; t.generateMipmaps = true; t.minFilter = T.LinearMipmapLinearFilter || t.minFilter; res(t); }, undefined, () => res(null)));
  const [dayTex, nightTex] = await Promise.all([load(base + 'board-day.webp'), load(base + 'board-night.webp')]);
  const BW = 8.6, BH = BW * 620 / 1600;
  const dayMat = new T.MeshBasicMaterial({ map: dayTex, transparent: true, toneMapped: false, fog: false, depthWrite: false });
  const nightMat = new T.MeshBasicMaterial({ map: nightTex, transparent: true, toneMapped: false, fog: false, depthWrite: false, opacity: 0 });
  const dayMesh = new T.Mesh(new T.PlaneGeometry(BW, BH), dayMat);
  const nightMesh = new T.Mesh(new T.PlaneGeometry(BW, BH), nightMat);
  dayMesh.position.set(0, 2.34 + BH / 2 - 0.05, 0.04); nightMesh.position.set(0, 2.34 + BH / 2 - 0.05, 0.05);
  dayMesh.renderOrder = 1; nightMesh.renderOrder = 2;
  if (dayTex) group.add(dayMesh); if (nightTex) group.add(nightMesh);

  // 5. The building around it, so the board sits on a real facade
  const wall = new T.Mesh(new T.PlaneGeometry(10, 7.2), new T.MeshStandardMaterial({ color: 0x08080a, roughness: 0.9 }));
  wall.position.set(0, 3.6, -0.06); group.add(wall);
  const sideL = new T.Mesh(new T.BoxGeometry(0.35, 2.5, 0.35), new T.MeshStandardMaterial({ color: 0x2a2626, roughness: 0.8 }));
  sideL.position.set(-2.78, 1.09, 0.1); group.add(sideL);
  const sideR = sideL.clone(); sideR.position.x = 2.78; group.add(sideR);
  const warm = new T.PointLight(0xffb35c, 0, 9, 1.6); warm.position.set(0, 1.4, 1.6); // Photo and shelf panels are unlit; no point-light pass is needed.

  return {
    group,
    // Exact photo bounds for responsive camera framing.
    face: nightMesh,
    setPower(v) {
      mats.forEach(m => m.color.setScalar(v * m.userData.gain)); warm.intensity = 18 * v;
      dayMat.color.setScalar(0.25 + 0.35 * v); nightMat.opacity = v; nightMat.color.setScalar(1.05);
    }
  };
}
