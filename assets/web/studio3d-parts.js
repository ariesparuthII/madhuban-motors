/* Accessory props for the 3D Upgrade Studio.
   Every prop is built from simple geometry plus canvas textures, so it adds
   no download weight. Positions are in the car model's own space (metres,
   +z = front of car, +x = left side). Swap these anchors if the car model
   changes. */

export function buildParts(T, carRoot) {
  const parts = {};          // key -> { group, onShow(t), onHide() }
  const tweens = [];         // per-frame easing jobs
  const byName = {};
  carRoot.traverse(o => { if (o.name) byName[o.name] = o; });

  /* ---------- shared materials ---------- */
  const black = new T.MeshStandardMaterial({ color: 0x0c0c0c, roughness: 0.45, metalness: 0.3 });
  const satin = new T.MeshStandardMaterial({ color: 0x1b1b1d, roughness: 0.6, metalness: 0.2 });
  const chrome = new T.MeshStandardMaterial({ color: 0xcfd2d6, roughness: 0.15, metalness: 1 });
  const redAccent = new T.MeshStandardMaterial({ color: 0xda291c, roughness: 0.35, metalness: 0.2, emissive: 0x3a0603 });
  const glassLens = new T.MeshPhysicalMaterial({ color: 0x0a1a2a, roughness: 0.05, metalness: 0.2, clearcoat: 1 });

  function group(key) {
    const g = new T.Group(); g.name = 'part-' + key; g.visible = false; g.userData.t = 0;
    carRoot.add(g); return g;
  }
  function canvasTex(w, h, draw) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4;
    t.userData.canvas = c; t.userData.draw = draw; return t;
  }
  function roundRect(g, x, y, w, h, r) {
    g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }

  /* ---------- 1. Dashcam behind the mirror ---------- */
  {
    const g = group('dashcam');
    // rear-view mirror
    const mirror = new T.Mesh(new T.BoxGeometry(0.24, 0.07, 0.025), satin);
    mirror.position.set(0, 1.0, 0.33); mirror.rotation.x = 0.12; g.add(mirror);
    const glassM = new T.Mesh(new T.PlaneGeometry(0.225, 0.058), new T.MeshStandardMaterial({ color: 0x9fb3c8, metalness: 1, roughness: 0.05 }));
    glassM.position.set(0, 1.0, 0.317); glassM.rotation.set(0.12, Math.PI, 0); g.add(glassM);
    const stem = new T.Mesh(new T.CylinderGeometry(0.008, 0.008, 0.08, 12), black);
    stem.position.set(0, 1.065, 0.33); g.add(stem);
    // dashcam body (sits ahead of the mirror, lens looking forward)
    const body = new T.Mesh(new T.BoxGeometry(0.085, 0.05, 0.04), black);
    body.position.set(0.075, 1.055, 0.38); body.rotation.x = 0.1; g.add(body);
    const lensRing = new T.Mesh(new T.CylinderGeometry(0.016, 0.016, 0.012, 32), chrome);
    lensRing.rotation.x = Math.PI / 2; lensRing.position.set(0.095, 1.055, 0.403); g.add(lensRing);
    const lens = new T.Mesh(new T.CircleGeometry(0.012, 32), glassLens);
    lens.position.set(0.095, 1.055, 0.4095); g.add(lens);
    // little screen on the back with a live "REC" view
    const camTex = canvasTex(256, 160, (c, w, h) => {
      const sky = c.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, '#5b7da3'); sky.addColorStop(.55, '#c9b28a'); sky.addColorStop(.56, '#3a3a3a'); sky.addColorStop(1, '#1d1d1d');
      c.fillStyle = sky; c.fillRect(0, 0, w, h);
      c.strokeStyle = '#f2f2f2'; c.lineWidth = 4; c.setLineDash([18, 14]);
      c.beginPath(); c.moveTo(w / 2, h); c.lineTo(w / 2, h * .57); c.stroke(); c.setLineDash([]);
      c.fillStyle = '#da291c'; c.beginPath(); c.arc(18, 18, 7, 0, 7); c.fill();
      c.fillStyle = '#fff'; c.font = 'bold 16px sans-serif'; c.fillText('REC', 32, 24);
      c.font = '13px sans-serif'; c.fillText('GT ROAD  1080p', 12, h - 12);
    });
    const scr = new T.Mesh(new T.PlaneGeometry(0.07, 0.04), new T.MeshBasicMaterial({ map: camTex, toneMapped: false }));
    scr.position.set(0.075, 1.055, 0.3595); scr.rotation.set(0.1, Math.PI, 0); g.add(scr);
    const led = new T.Mesh(new T.SphereGeometry(0.004, 12, 8), new T.MeshBasicMaterial({ color: 0xff2a1a }));
    led.position.set(0.11, 1.072, 0.36); g.add(led);
    // hidden wiring along the headliner and A-pillar
    const wirePath = new T.CatmullRomCurve3([
      new T.Vector3(0.115, 1.06, 0.37), new T.Vector3(0.3, 1.1, 0.25), new T.Vector3(0.62, 1.07, 0.35),
      new T.Vector3(0.78, 0.95, 0.75), new T.Vector3(0.75, 0.82, 1.05)]);
    const wire = new T.Mesh(new T.TubeGeometry(wirePath, 60, 0.0075, 8),
      new T.MeshBasicMaterial({ color: new T.Color(1, 0.95, 0).multiplyScalar(1.6), toneMapped: false }));
    g.add(wire);
    // a bright pulse runs along the cable so the hidden route is easy to follow
    const pulses = [0, 0.33, 0.66].map(o => {
      const m = new T.Mesh(new T.SphereGeometry(0.014, 12, 8), new T.MeshBasicMaterial({ color: new T.Color(1, 1, 0.7).multiplyScalar(3), toneMapped: false }));
      g.add(m); return { m, o };
    });
    parts.dashcam = { group: g, update: (dt, now) => {
      led.visible = Math.floor(now / 500) % 2 === 0;
      pulses.forEach(p => p.m.position.copy(wirePath.getPointAt(((now / 1800) + p.o) % 1)));
    } };
  }

  /* ---------- 2. Floating Android screen ---------- */
  let screenTex;
  {
    const g = group('screen');
    screenTex = canvasTex(1024, 600, (c, w, h, t = 0) => drawAndroid(c, w, h, t));
    const frame = new T.Mesh(new T.BoxGeometry(0.29, 0.175, 0.018), black);
    const panel = new T.Mesh(new T.PlaneGeometry(0.272, 0.159), new T.MeshBasicMaterial({ map: screenTex, toneMapped: false }));
    panel.position.z = -0.0095; panel.rotation.y = Math.PI;
    const holder = new T.Group(); holder.add(frame, panel);
    holder.position.set(0.36, 0.86, 1.0); holder.rotation.set(-0.22, 0, 0);
    // face the cabin: panel looks toward -z
    g.add(holder);
    const mount = new T.Mesh(new T.CylinderGeometry(0.012, 0.02, 0.08, 16), black);
    mount.position.set(0.36, 0.76, 1.03); g.add(mount);
    const base = new T.Mesh(new T.BoxGeometry(0.12, 0.012, 0.08), black);
    base.position.set(0.36, 0.72, 1.05); g.add(base);
    const glow = new T.PointLight(0x6fb3ff, 0.35, 0.9, 2); glow.position.set(0.36, 0.86, 0.85); g.add(glow);
    let acc = 0;
    parts.screen = {
      group: g,
      update: (dt, now) => {
        acc += dt; if (acc < 0.12) return; acc = 0;
        const c = screenTex.userData.canvas; drawAndroid(c.getContext('2d'), c.width, c.height, now / 1000); screenTex.needsUpdate = true;
      }
    };
  }

  function drawAndroid(c, w, h, t) {
    c.fillStyle = '#0d1117'; c.fillRect(0, 0, w, h);
    // status bar
    c.fillStyle = '#e8e8e8'; c.font = '600 22px sans-serif';
    const d = new Date(); c.fillText(String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'), 24, 34);
    c.textAlign = 'right'; c.fillText('4G  32°C', w - 24, 34); c.textAlign = 'left';
    // map tile (left)
    const mx = 20, my = 52, mw = 600, mh = 528;
    roundRect(c, mx, my, mw, mh, 22); c.save(); c.clip();
    c.fillStyle = '#1e2a33'; c.fillRect(mx, my, mw, mh);
    c.strokeStyle = '#2f3f4b'; c.lineWidth = 2;
    for (let i = 0; i < 14; i++) { c.beginPath(); c.moveTo(mx, my + i * 42); c.lineTo(mx + mw, my + i * 42 - 120); c.stroke(); }
    for (let i = 0; i < 10; i++) { c.beginPath(); c.moveTo(mx + i * 70, my); c.lineTo(mx + i * 70 + 90, my + mh); c.stroke(); }
    c.strokeStyle = '#46607a'; c.lineWidth = 16; c.beginPath(); c.moveTo(mx + 40, my + mh - 40); c.lineTo(mx + 300, my + 260); c.lineTo(mx + mw - 30, my + 120); c.stroke();
    c.strokeStyle = '#3b9cff'; c.lineWidth = 10; c.beginPath(); c.moveTo(mx + 300, my + mh); c.lineTo(mx + 300, my + 260); c.lineTo(mx + mw - 30, my + 120); c.stroke();
    const pulse = 10 + Math.sin(t * 4) * 3;
    c.fillStyle = 'rgba(59,156,255,.25)'; c.beginPath(); c.arc(mx + 300, my + 420, pulse + 12, 0, 7); c.fill();
    c.fillStyle = '#3b9cff'; c.beginPath(); c.arc(mx + 300, my + 420, 11, 0, 7); c.fill();
    c.fillStyle = 'rgba(13,17,23,.88)'; roundRect(c, mx + 16, my + 16, 360, 74, 16); c.fill();
    c.fillStyle = '#fff'; c.font = '700 26px sans-serif'; c.fillText('↱  GT Road, Ghaziabad', mx + 34, my + 52);
    c.fillStyle = '#9fb0bf'; c.font = '20px sans-serif'; c.fillText('400 m  ·  Madhuban Motors', mx + 34, my + 78);
    c.restore();
    // music card (right top)
    const rx = 640, rw = w - rx - 20;
    c.fillStyle = '#171d26'; roundRect(c, rx, 52, rw, 300, 22); c.fill();
    const art = c.createLinearGradient(rx + 24, 76, rx + 144, 196); art.addColorStop(0, '#da291c'); art.addColorStop(1, '#fff200');
    c.fillStyle = art; roundRect(c, rx + 24, 76, 120, 120, 14); c.fill();
    c.fillStyle = '#fff'; c.font = '700 26px sans-serif'; c.fillText('Bass Test', rx + 164, 118);
    c.fillStyle = '#9fb0bf'; c.font = '20px sans-serif'; c.fillText('JBL 4-way · DSP on', rx + 164, 150);
    // equaliser bars
    for (let i = 0; i < 18; i++) {
      const bh = 20 + Math.abs(Math.sin(t * 6 + i * 0.7)) * 70;
      c.fillStyle = i % 3 ? '#fff200' : '#da291c'; c.fillRect(rx + 24 + i * 18, 320 - bh, 11, bh);
    }
    // quick tiles
    const tiles = [['Camera', '#2a3442'], ['Phone', '#1e3a2a'], ['YouTube', '#3a1e1e'], ['Settings', '#2a2a2a']];
    tiles.forEach(([lbl, col], i) => {
      const tx = rx + (i % 2) * (rw / 2 + 4), ty = 368 + Math.floor(i / 2) * 108;
      c.fillStyle = col; roundRect(c, tx, ty, rw / 2 - 4, 100, 18); c.fill();
      c.fillStyle = '#fff'; c.font = '600 22px sans-serif'; c.fillText(lbl, tx + 20, ty + 58);
    });
  }

  /* ---------- 3. Audio: door speakers + boot bass tube & amp ---------- */
  {
    const g = group('audio');
    const coneTex = canvasTex(256, 256, (c, w) => {
      const r = c.createRadialGradient(w / 2, w / 2, 8, w / 2, w / 2, w / 2);
      r.addColorStop(0, '#3a3a3a'); r.addColorStop(.18, '#111'); r.addColorStop(.2, '#da291c'); r.addColorStop(.24, '#151515'); r.addColorStop(.85, '#202020'); r.addColorStop(.9, '#555'); r.addColorStop(1, '#111');
      c.fillStyle = r; c.fillRect(0, 0, w, w);
      c.strokeStyle = 'rgba(255,255,255,.06)'; for (let i = 0; i < 24; i++) { c.beginPath(); c.arc(w / 2, w / 2, 40 + i * 3.6, 0, 7); c.stroke(); }
    });
    const coneMat = new T.MeshStandardMaterial({ map: coneTex, roughness: 0.6 });
    const speakers = [];
    [[0.785, 1], [-0.785, -1]].forEach(([x, s]) => {
      const spk = new T.Group();
      const ring = new T.Mesh(new T.TorusGeometry(0.075, 0.009, 12, 48), chrome);
      const cone = new T.Mesh(new T.CircleGeometry(0.075, 48), coneMat);
      cone.position.z = 0.004; ring.position.z = 0.006;
      const tw = new T.Mesh(new T.SphereGeometry(0.02, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), chrome);
      tw.rotation.x = Math.PI / 2; tw.position.set(0, 0.16, 0.004);
      spk.add(cone, ring, tw);
      spk.position.set(x, 0.5, 0.35); spk.rotation.y = -s * Math.PI / 2;
      g.add(spk); speakers.push(cone);
    });
    // bass tube in the boot
    const tube = new T.Mesh(new T.CylinderGeometry(0.13, 0.13, 0.78, 40, 1, true), new T.MeshStandardMaterial({ color: 0x141414, roughness: 0.9, side: T.DoubleSide }));
    tube.rotation.z = Math.PI / 2; tube.position.set(0, 0.3, -0.98); g.add(tube);
    const capMat = new T.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.5 });
    const capL = new T.Mesh(new T.CircleGeometry(0.13, 40), capMat); capL.position.set(0.39, 0.3, -0.98); capL.rotation.y = Math.PI / 2; g.add(capL);
    const capR = capL.clone(); capR.position.x = -0.39; capR.rotation.y = -Math.PI / 2; g.add(capR);
    const subCone = new T.Mesh(new T.CircleGeometry(0.1, 40), coneMat);
    subCone.position.set(0, 0.3, -0.845); g.add(subCone);
    const subRing = new T.Mesh(new T.TorusGeometry(0.105, 0.012, 12, 48), chrome);
    subRing.position.set(0, 0.3, -0.843); g.add(subRing);
    // tube front face needs a flat panel for the woofer
    const face = new T.Mesh(new T.PlaneGeometry(0.5, 0.2), capMat); face.position.set(0, 0.3, -0.85); g.add(face);
    subCone.position.z = -0.846; subRing.position.z = -0.844;
    // amplifier with fins
    const amp = new T.Group();
    const ampBody = new T.Mesh(new T.BoxGeometry(0.34, 0.05, 0.2), new T.MeshStandardMaterial({ color: 0x2a2a2e, metalness: 0.8, roughness: 0.3 }));
    amp.add(ampBody);
    for (let i = 0; i < 9; i++) { const fin = new T.Mesh(new T.BoxGeometry(0.008, 0.02, 0.2), chrome); fin.position.set(-0.15 + i * 0.0375, 0.033, 0); amp.add(fin); }
    const badge = new T.Mesh(new T.BoxGeometry(0.12, 0.004, 0.03), redAccent); badge.position.set(0, 0.046, 0.07); amp.add(badge);
    amp.position.set(0, 0.47, -0.98); g.add(amp);
    // speaker wire
    g.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([
      new T.Vector3(0.17, 0.47, -0.98), new T.Vector3(0.45, 0.3, -0.8), new T.Vector3(0.7, 0.25, -0.3), new T.Vector3(0.78, 0.45, 0.3)]), 40, 0.004, 6),
      new T.MeshBasicMaterial({ color: 0xfff200 })));
    parts.audio = {
      group: g,
      update: (dt, now) => {
        const b = 1 + Math.max(0, Math.sin(now / 95)) * 0.06;
        subCone.scale.setScalar(b); speakers.forEach(s => s.scale.setScalar(1 + (b - 1) * 0.6));
      }
    };
  }

  /* ---------- 4. Seat covers: quilted texture swap ---------- */
  const seatMeshes = ['InteriorSeatsColor1'].map(n => byName[n]).filter(Boolean);
  const seatOrig = seatMeshes.map(m => m.material);
  const quiltTex = canvasTex(512, 512, (c, w) => {
    c.fillStyle = '#121212'; c.fillRect(0, 0, w, w);
    const s = 64;
    for (let y = -s; y < w + s; y += s) for (let x = -s; x < w + s; x += s) {
      const g2 = c.createRadialGradient(x + s / 2, y + s / 2, 4, x + s / 2, y + s / 2, s * .7);
      g2.addColorStop(0, '#2c2c2c'); g2.addColorStop(1, '#0d0d0d');
      c.fillStyle = g2; c.beginPath(); c.moveTo(x + s / 2, y); c.lineTo(x + s, y + s / 2); c.lineTo(x + s / 2, y + s); c.lineTo(x, y + s / 2); c.closePath(); c.fill();
    }
    c.strokeStyle = '#da291c'; c.lineWidth = 3; c.setLineDash([7, 5]);
    for (let i = -w; i < w * 2; i += s) {
      c.beginPath(); c.moveTo(i, 0); c.lineTo(i + w, w); c.stroke();
      c.beginPath(); c.moveTo(i + w, 0); c.lineTo(i, w); c.stroke();
    }
  });
  quiltTex.wrapS = quiltTex.wrapT = T.RepeatWrapping; quiltTex.repeat.set(3, 3);
  const quiltMat = new T.MeshStandardMaterial({ map: quiltTex, roughness: 0.55, metalness: 0.05, color: 0xffffff });
  parts.seats = {
    group: group('seats'),
    show: () => seatMeshes.forEach(m => { m.material = quiltMat; }),
    hide: () => seatMeshes.forEach((m, i) => { m.material = seatOrig[i]; })
  };

  /* ---------- 5. Floor mats: 7D mat texture ---------- */
  const matMesh = byName.InteriorFloormats;
  const matOrig = matMesh ? matMesh.material : null;
  const matTex = canvasTex(512, 512, (c, w) => {
    c.fillStyle = '#c9a77a'; c.fillRect(0, 0, w, w);
    const s = 42;
    for (let y = 0; y < w; y += s) for (let x = (y / s % 2) * s / 2; x < w; x += s) {
      c.fillStyle = '#b48d5c'; c.beginPath(); c.moveTo(x + s / 2, y + 4); c.lineTo(x + s - 4, y + s / 2); c.lineTo(x + s / 2, y + s - 4); c.lineTo(x + 4, y + s / 2); c.closePath(); c.fill();
    }
    c.strokeStyle = '#111'; c.lineWidth = 16; c.strokeRect(8, 8, w - 16, w - 16);
    c.strokeStyle = '#da291c'; c.lineWidth = 3; c.setLineDash([8, 6]); c.strokeRect(20, 20, w - 40, w - 40);
  });
  matTex.wrapS = matTex.wrapT = T.RepeatWrapping; matTex.repeat.set(2, 2);
  const matMat = new T.MeshStandardMaterial({ map: matTex, roughness: 0.85 });
  parts.mats = {
    group: group('mats'),
    show: () => { if (matMesh) matMesh.material = matMat; },
    hide: () => { if (matMesh) matMesh.material = matOrig; }
  };

  /* ---------- 6. Lights: beams + fog lamps ---------- */
  {
    const g = group('lights');
    const beamTex = canvasTex(64, 256, (c, w, h) => {
      const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(255,255,255,.9)');
      c.fillStyle = gr; c.fillRect(0, 0, w, h);
    });
    const beamMat = new T.MeshBasicMaterial({ map: beamTex, color: 0xdfeaff, transparent: true, opacity: 0.32, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide });
    [0.62, -0.62].forEach(x => {
      const beam = new T.Mesh(new T.ConeGeometry(0.75, 4.2, 32, 1, true), beamMat);
      beam.rotation.x = -Math.PI / 2 - 0.05; beam.position.set(x, 0.55, 2.2 + 2.1); g.add(beam);
      const fog = new T.Mesh(new T.CircleGeometry(0.045, 24), new T.MeshBasicMaterial({ color: 0xfff6cc, toneMapped: false }));
      fog.position.set(x * 0.95, 0.24, 2.36); g.add(fog);
    });
    const pool = new T.Mesh(new T.CircleGeometry(1.8, 48), new T.MeshBasicMaterial({ map: canvasTex(256, 256, (c, w) => {
      const r = c.createRadialGradient(w / 2, w / 2, 4, w / 2, w / 2, w / 2); r.addColorStop(0, 'rgba(220,235,255,.55)'); r.addColorStop(1, 'rgba(220,235,255,0)'); c.fillStyle = r; c.fillRect(0, 0, w, w);
    }), transparent: true, blending: T.AdditiveBlending, depthWrite: false }));
    pool.rotation.x = -Math.PI / 2; pool.scale.set(1.3, 1, 1); pool.position.set(0, -0.14, 4.4); g.add(pool);
    parts.lights = { group: g };
  }

  /* ---------- 7. Sun film: tint the side and rear glass ---------- */
  const filmNames = ['BodyDoorLWindow', 'BodyDoorRWindow', 'BodyWindowsRearSides', 'BodyRearwindow'];
  const filmMeshes = [];
  filmNames.forEach(n => { const o = byName[n]; if (o) o.traverse(m => { if (m.isMesh) filmMeshes.push(m); }); });
  const filmOrig = filmMeshes.map(m => m.material);
  const filmMat = new T.MeshPhysicalMaterial({ color: 0x0b0f14, roughness: 0.08, metalness: 0.4, transparent: true, opacity: 0.88, clearcoat: 1 });
  parts.film = {
    group: group('film'),
    show: () => filmMeshes.forEach(m => { m.material = filmMat; }),
    hide: () => filmMeshes.forEach((m, i) => { m.material = filmOrig[i]; })
  };

  /* ---------- surface sampling: real points on the body via raycasts ---------- */
  carRoot.updateMatrixWorld(true);
  const bodyMeshes = [];
  carRoot.traverse(o => { if (o.isMesh && o.material && /^Paint/.test(o.material.name || '')) bodyMeshes.push(o); });
  const rc = new T.Raycaster();
  const inv = new T.Matrix4().copy(carRoot.matrixWorld).invert();
  function sampleTop(x, z) {
    rc.set(new T.Vector3(x, 3, z).applyMatrix4(carRoot.matrixWorld), new T.Vector3(0, -1, 0).transformDirection(carRoot.matrixWorld));
    const hit = rc.intersectObjects(bodyMeshes, false)[0];
    if (!hit) return null;
    const n = hit.face ? hit.face.normal.clone().transformDirection(hit.object.matrixWorld).transformDirection(inv) : new T.Vector3(0, 1, 0);
    return { p: hit.point.clone().applyMatrix4(inv), n };
  }

  /* ---------- 8. PPF: stone chips bounce off the film ---------- */
  {
    const g = group('ppf');
    const hits = [];
    for (let i = 0; i < 26; i++) {
      const s2 = sampleTop(-0.7 + Math.random() * 1.4, 1.55 + Math.random() * 0.75);
      if (s2) hits.push(s2);
    }
    // a faint film sheen over the hood: small glossy quads on sampled points
    const sheenMat = new T.MeshBasicMaterial({ color: 0x9fd8ff, transparent: true, opacity: 0.0, blending: T.AdditiveBlending, depthWrite: false });
    const sheen = new T.Group(); g.add(sheen);
    hits.forEach(h => {
      const q = new T.Mesh(new T.CircleGeometry(0.16, 20), sheenMat);
      q.position.copy(h.p).addScaledVector(h.n, 0.004); q.lookAt(q.position.clone().add(h.n)); sheen.add(q);
    });
    const stoneGeo = new T.IcosahedronGeometry(0.018, 0);
    const stoneMat = new T.MeshStandardMaterial({ color: 0x8a8378, roughness: 1 });
    const sparkMat = new T.MeshBasicMaterial({ color: 0xfff6c8, transparent: true, toneMapped: false });
    const stones = [];
    for (let i = 0; i < 14; i++) {
      const st = new T.Mesh(stoneGeo, stoneMat); g.add(st);
      const sp = new T.Mesh(new T.RingGeometry(0.01, 0.03, 16), sparkMat.clone()); g.add(sp);
      stones.push({ st, sp, t: Math.random() * 1.6, h: hits[i % hits.length] });
    }
    parts.ppf = {
      group: g,
      show: () => { sheenMat.opacity = 0.05; },
      update: (dt) => {
        stones.forEach(o => {
          o.t += dt; const cyc = 1.6; if (o.t > cyc) { o.t -= cyc; o.h = hits[Math.floor(Math.random() * hits.length)]; }
          const t = o.t, hp = o.h.p, n = o.h.n;
          const start = new T.Vector3(hp.x + (Math.random() - .5) * .02, hp.y + 0.15, hp.z + 2.4);
          if (t < 0.45) { o.st.visible = true; o.st.position.lerpVectors(start, hp, t / 0.45); o.sp.visible = false; }
          else if (t < 1.1) {
            const k = (t - 0.45) / 0.65;
            o.st.position.copy(hp).addScaledVector(n, 0.02 + k * 0.5).add(new T.Vector3(0, -k * k * 0.6, k * 0.9));
            o.sp.visible = k < 0.4; o.sp.position.copy(hp).addScaledVector(n, 0.006); o.sp.lookAt(o.sp.position.clone().add(n));
            o.sp.scale.setScalar(1 + k * 6); o.sp.material.opacity = 1 - k / 0.4;
          } else { o.st.visible = false; o.sp.visible = false; }
          o.st.rotation.x += dt * 9; o.st.rotation.y += dt * 7;
        });
        sheenMat.opacity = 0.05 + Math.sin(performance.now() / 500) * 0.03;
      }
    };
  }

  /* ---------- 9. Ceramic coating: water beads and extra gloss ---------- */
  {
    const g = group('coating');
    const beadGeo = new T.SphereGeometry(1, 14, 10);
    const beadMat = new T.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.02, metalness: 0, transmission: 0.9, thickness: 0.01, ior: 1.33, transparent: true, opacity: 0.85, clearcoat: 1 });
    const beads = [];
    for (let i = 0; i < 220; i++) {
      const z = -1.6 + Math.random() * 3.9, x = -0.9 + Math.random() * 1.8;
      const h = sampleTop(x, z); if (!h || h.n.y < 0.55) continue;
      const b = new T.Mesh(beadGeo, beadMat);
      const r = 0.006 + Math.random() * 0.012;
      b.scale.set(r, r * 0.6, r); b.position.copy(h.p).addScaledVector(h.n, r * 0.45);
      g.add(b); beads.push({ b, base: b.position.clone(), n: h.n, r, slide: Math.random() < 0.3 ? 0 : -1, v: 0 });
    }
    const paints = bodyMeshes.map(m => m.material).filter((m, i, a) => a.indexOf(m) === i && /^Paint 1/.test(m.name));
    const orig = paints.map(m => ({ r: m.roughness, c: m.clearcoatRoughness }));
    parts.coating = {
      group: g,
      show: () => paints.forEach(m => { m.roughness = 0.12; if ('clearcoatRoughness' in m) m.clearcoatRoughness = 0.0; }),
      hide: () => paints.forEach((m, i) => { m.roughness = orig[i].r; if ('clearcoatRoughness' in m) m.clearcoatRoughness = orig[i].c; }),
      update: (dt) => {
        beads.forEach(o => {
          if (o.slide < 0) return;
          o.slide += dt; o.v = Math.min(0.5, o.v + dt * 0.4);
          // roll off: down the surface toward the edge
          o.b.position.x += Math.sign(o.base.x || 1) * o.v * dt;
          o.b.position.y -= o.v * dt * 0.4;
          if (o.slide > 2.2) { o.slide = 0; o.v = 0; o.b.position.copy(o.base); }
        });
      }
    };
  }

  /* ---------- door opening (for seats / audio / mats) ---------- */
  const doorL = byName.BodyDoorLColor1;
  const doorBase = doorL ? doorL.quaternion.clone() : null;
  let doorT = 0, doorTarget = 0;
  // roof + glass fade for cabin views
  const collect = names => { const out = []; names.forEach(n => { const o = byName[n]; if (o) o.traverse(m => { if (m.isMesh) out.push(m); }); }); return out; };
  const HIDE = {
    roof: collect(['BodyRoofPanel', 'InteriorRearHatch', 'BodyRearwindow', 'InteriorCage', 'InteriorPillar', 'BodyWindowsRearSides']),
    glass: collect(['BodyWindshield', 'BodyWindshieldWipers', 'BodyWindshieldWipersBase'])
  };
  const HIDE_FOR = { dashcam: ['glass'], screen: ['roof', 'glass'], audio: ['roof'], seats: ['roof', 'glass'], mats: ['roof', 'glass'] };

  /* ---------- public API ---------- */
  let current = null;
  const OPEN_DOOR = { seats: 1, audio: 1, mats: 1 };
  return {
    show(key) {
      if (current && parts[current]) { const p = parts[current]; p.group.visible = false; p.hide && p.hide(); }
      current = key;
      doorTarget = OPEN_DOOR[key] ? 1 : 0;
      Object.keys(HIDE).forEach(h => HIDE[h].forEach(m => { m.visible = !(HIDE_FOR[key] || []).includes(h); }));
      if (key && parts[key]) {
        const p = parts[key]; p.group.visible = true; p.group.userData.t = 0; p.show && p.show();
      }
    },
    toggleDoor() { doorTarget = doorTarget > 0.5 ? 0 : 1; return doorTarget > 0.5; },
    update(dt, now) {
      if (current && parts[current]) {
        const p = parts[current], gr = p.group;
        gr.userData.t = Math.min(1, gr.userData.t + dt * 2.2);
        const e = 1 - Math.pow(1 - gr.userData.t, 3);
        gr.scale.setScalar(0.001 + e * 0.999);
        p.update && p.update(dt, now);
      }
      if (doorL && doorBase) {
        doorT += (doorTarget - doorT) * Math.min(1, dt * 4);
        doorL.quaternion.copy(doorBase).multiply(new T.Quaternion().setFromAxisAngle(DOOR_AXIS, doorT * DOOR_ANGLE));
      }
    }
  };
}

// Door hinge in the door node's local space (found by test renders).
const DOOR_AXIS = { x: 0, y: 0, z: 1, isVector3: true };
const DOOR_ANGLE = -1.05;
