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

  // 1. Shop opening: warm interior with stocked shelves
  const open = panel(5.2, 2.5, 1024, 492, (g, w, h) => {
    const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#f6d9a6'); bg.addColorStop(1, '#8a5a2b');
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    for (let row = 0; row < 5; row++) {                       // shelves with boxes
      const y = 30 + row * 86;
      g.fillStyle = 'rgba(60,35,15,.55)'; g.fillRect(40, y + 70, w - 80, 6);
      for (let x = 50; x < w - 60; x += 26 + ((x * 7 + row * 13) % 22)) {
        const bw = 18 + ((x + row * 31) % 20), bh = 30 + ((x * 3 + row) % 34);
        const hue = ['#1d1d1f', '#c4302b', '#2a2f3a', '#e9e2d0', '#f2c230', '#3a3a3a'][(x + row) % 6];
        g.fillStyle = hue; g.fillRect(x, y + 70 - bh, bw, bh);
      }
    }
    g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(0, 0, 18, h); g.fillRect(w - 18, 0, 18, h); g.fillRect(w / 2 - 6, 0, 12, h); // glass door frames
    const v = g.createRadialGradient(w / 2, h * .2, 40, w / 2, h * .4, w * .7); v.addColorStop(0, 'rgba(255,255,255,0)'); v.addColorStop(1, 'rgba(0,0,0,.45)');
    g.fillStyle = v; g.fillRect(0, 0, w, h);
  }, { gain: 0.7 });
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
