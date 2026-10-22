/* Accessory props for the 3D Upgrade Studio.
   Every prop is built from simple geometry plus canvas textures, so it adds
   no download weight. Positions are in the car model's own space (metres,
   +z = front of car, +x = left side). Swap these anchors if the car model
   changes. */

export function buildParts(T, carRoot, logoTex, rayTools) {
  const builders = {};
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
  builders.dashcam = () => {
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

  };

  /* ---------- 2. Floating Android screen ---------- */
  builders.screen = () => {
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
    // No light inside parts: adding a light recompiles every material in the scene.
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

  };

  /* ---------- 3. Audio: fitted doors and an opening, lined boot ---------- */
  builders.audio = () => {
  {
    const g = group('audio');
    g.position.y = .16; // Raised, lined false floor clears the concept car's rear sill.
    carRoot.updateMatrixWorld(true);
    const coneTex = canvasTex(256, 256, (c, w) => {
      const r = c.createRadialGradient(w / 2, w / 2, 8, w / 2, w / 2, w / 2);
      r.addColorStop(0, '#252525'); r.addColorStop(.2, '#111'); r.addColorStop(.25, '#454545'); r.addColorStop(.85, '#202020'); r.addColorStop(1, '#111');
      c.fillStyle = r; c.fillRect(0, 0, w, w);
      c.strokeStyle = 'rgba(255,255,255,.08)';
      for (let i = 0; i < 20; i++) { c.beginPath(); c.arc(w / 2, w / 2, 40 + i * 3.6, 0, 7); c.stroke(); }
    });
    const coneMat = new T.MeshStandardMaterial({ map: coneTex, roughness: 0.65 });
    const carpet = new T.MeshStandardMaterial({ color: 0x292a2c, roughness: .95 });
    const speakers = [], mounts = [];
    [[0.94, 1, 'BodyDoorLColor1'], [-0.94, -1, 'BodyDoorRColor1']].forEach(([x, side, name]) => {
      const door = byName[name]; if (!door) return;
      const mount = new T.Group(); mount.name = 'audio-door-speaker-' + name;
      const backing = new T.Mesh(new T.CylinderGeometry(.104, .104, .026, 40), black);
      backing.rotation.x = Math.PI / 2;
      const ring = new T.Mesh(new T.TorusGeometry(.09, .009, 10, 40), satin);
      const cone = new T.Mesh(new T.CircleGeometry(.086, 40), coneMat);
      cone.position.z = .017; ring.position.z = .019;
      const tweeter = new T.Mesh(new T.SphereGeometry(.022, 16, 10), satin);
      tweeter.position.set(0, .19, .01);
      mount.add(backing, ring, cone, tweeter);
      mount.position.set(x, .43, .65); mount.rotation.y = -side * Math.PI / 2;
      carRoot.add(mount); carRoot.updateMatrixWorld(true);
      // Preserve the fitted position, then inherit every door movement.
      door.attach(mount); mount.visible = false;
      mounts.push(mount); speakers.push(cone);
    });

    // Reuse this concept car's rear glazing/inner hatch as a hinged lid.
    // Separate only the central upper rear-body triangles, retaining the fenders.
    const hatch = new T.Group(); hatch.name = 'audio-boot-hinge';
    hatch.position.set(0, 1.08, -.55); carRoot.add(hatch);
    const rear = byName.BodyRearPanelsColor1;
    let rearMesh = null, closedGeometry = null, openGeometry = null;
    if (rear) rear.traverse(o => { if (o.isMesh && /^Paint 1/.test(o.material && o.material.name || '')) rearMesh = o; });
    if (rearMesh) {
      closedGeometry = rearMesh.geometry;
      const geo = closedGeometry.index ? closedGeometry.toNonIndexed() : closedGeometry.clone();
      const pos = geo.attributes.position, decoded = new Float32Array(pos.count * 3);
      for (let i = 0; i < pos.count; i++) { decoded[i * 3] = pos.getX(i); decoded[i * 3 + 1] = pos.getY(i); decoded[i * 3 + 2] = pos.getZ(i); }
      geo.setAttribute('position', new T.BufferAttribute(decoded, 3));
      const relative = new T.Matrix4().copy(carRoot.matrixWorld).invert().multiply(rearMesh.matrixWorld);
      const keep = [], lift = [], centre = new T.Vector3(), v = new T.Vector3();
      for (let i = 0; i < pos.count; i += 3) {
        centre.set(0, 0, 0);
        for (let j = 0; j < 3; j++) { v.fromBufferAttribute(geo.attributes.position, i + j).applyMatrix4(relative); centre.add(v); }
        centre.multiplyScalar(1 / 3);
        const lid = Math.abs(centre.x) < .68 && centre.y > .57 && centre.z < -.7 && centre.z > -1.85;
        (lid ? lift : keep).push(i, i + 1, i + 2);
      }
      openGeometry = geo.clone(); openGeometry.setIndex(keep);
      hatch.userData.cutTriangles = lift.length / 3;
    }
    ['BodyRearwindow', 'InteriorRearHatch'].forEach(name => { const part = byName[name]; if (part) hatch.attach(part); });
    hatch.userData.open = 0;
    const box = (w, h, d, x, y, z, material = carpet) => {
      const m = new T.Mesh(new T.BoxGeometry(w, h, d), material); m.position.set(x, y, z); g.add(m); return m;
    };
    box(.045, .045, 1.05, -.68, .74, -1.30, black);
    box(.045, .045, 1.05, .68, .74, -1.30, black);
    box(1.36, .045, .045, 0, .61, -1.83, black);
    box(1.30, .04, .98, 0, .46, -1.30).name = 'audio-boot-floor';
    box(.035, .20, .98, -.66, .56, -1.30);
    box(.035, .20, .98, .66, .56, -1.30);
    box(1.30, .18, .035, 0, .55, -1.80);
    box(1.30, .28, .035, 0, .60, -.81);

    // Bass tube rests on the carpet. Its cone faces out of the boot.
    // Light ripples that pulse out from the cones on every beat.
    const waveMat = () => new T.MeshBasicMaterial({ color: 0xff7a2a, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide, toneMapped: false });
    const waves = [];
    speakers.forEach(cone => { const w = new T.Mesh(new T.RingGeometry(.088, .1, 48), waveMat()); w.position.copy(cone.position); w.position.z += .004; w.userData.grow = 1.6; cone.parent.add(w); waves.push(w); });
    const tube = new T.Mesh(new T.CylinderGeometry(.16, .16, .57, 40), carpet);
    tube.rotation.x = Math.PI / 2; tube.position.set(-.28, .64, -1.34); tube.name = 'audio-bass-tube'; g.add(tube);
    const subCone = new T.Mesh(new T.CircleGeometry(.135, 40), coneMat);
    subCone.rotation.y = Math.PI; subCone.position.set(-.28, .64, -1.627); g.add(subCone);
    { const w = new T.Mesh(new T.RingGeometry(.137, .155, 48), waveMat()); w.rotation.y = Math.PI; w.position.set(-.28, .64, -1.632); w.userData.grow = 1.8; g.add(w); waves.push(w); }
    const subRing = new T.Mesh(new T.TorusGeometry(.139, .009, 10, 40), satin);
    subRing.rotation.y = Math.PI; subRing.position.set(-.28, .64, -1.63); g.add(subRing);
    [-1.49, -1.18].forEach(z => box(.34, .025, .045, -.28, .485, z, black));
    // Amp is bolted to a low board beside the tube, not suspended above it.
    box(.40, .025, .48, .35, .493, -1.30, black);
    const amp = new T.Group(); amp.name = 'audio-amplifier';
    amp.add(new T.Mesh(new T.BoxGeometry(.34, .045, .40), new T.MeshStandardMaterial({ color: 0x858b93, metalness: .65, roughness: .38 })));
    for (let i = 0; i < 9; i++) { const fin = new T.Mesh(new T.BoxGeometry(.008, .015, .37), satin); fin.position.set(-.145 + i * .036, .029, 0); amp.add(fin); }
    amp.position.set(.35, .53, -1.30); g.add(amp);
    [[.20, -1.48], [.50, -1.48], [.20, -1.12], [.50, -1.12]].forEach(([x, z]) => {
      const screw = new T.Mesh(new T.CylinderGeometry(.008, .008, .008, 8), chrome); screw.position.set(x, .51, z); g.add(screw);
    });
    const cable = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([
      new T.Vector3(.49, .515, -1.12), new T.Vector3(.57, .49, -1.06), new T.Vector3(.57, .49, -.9), new T.Vector3(-.28, .49, -.9), new T.Vector3(-.28, .55, -1.06)
    ]), 28, .006, 6), new T.MeshStandardMaterial({ color: 0x6d1c15, roughness: .8 }));
    g.add(cable);
    parts.audio = {
      group: g,
      show() { mounts.forEach(m => m.visible = true); if (rearMesh && openGeometry) rearMesh.geometry = openGeometry;  },
      hide() { mounts.forEach(m => m.visible = false); if (rearMesh) rearMesh.geometry = closedGeometry; hatch.rotation.x = 0; hatch.userData.open = 0;  },
      update(dt, now) {
        hatch.userData.open += (1 - hatch.userData.open) * Math.min(1, dt * 4);
        hatch.rotation.x = hatch.userData.open * 1.10;
        // Beat at 120 BPM: a sharp kick, then decay. Cones push out, a ring of
        // light ripples off each speaker so you can see the bass hit.
        const phase = ((now / 500) % 1 + 1) % 1, kick = Math.exp(-phase * 7) * (now ? 1 : 0);
        subCone.position.z = -1.627 - kick * .014;
        speakers.forEach(cone => cone.position.z = .017 + kick * .008);
        waves.forEach(w => {
          const t = phase; w.scale.setScalar(1 + t * w.userData.grow);
          w.material.opacity = (1 - t) * .55 * (now ? 1 : 0);
        });
      }
    };
  }

  };

  /* ---------- 4. Seat covers: quilted texture swap ---------- */
  builders.seats = () => {
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

  };

  /* ---------- 5. Floor mats: 7D mat texture ---------- */
  builders.mats = () => {
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

  };

  /* ---------- 6. Lights: beams + fog lamps ---------- */
  builders.lights = () => {
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

  };

  /* ---------- 7. Sun film: tint the side and rear glass ---------- */
  builders.film = () => {
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

  // Small shop emblem, seated on the bonnet like a manufacturer badge.
  if (logoTex) {
    const anchor = sampleTop(0, 2.05);
    if (anchor) {
      const badge = new T.Mesh(new T.PlaneGeometry(.22, .11), new T.MeshBasicMaterial({ map: logoTex, transparent: true, depthWrite: false, toneMapped: false }));
      badge.name = 'madhuban-bonnet-badge';
      badge.position.copy(anchor.p).addScaledVector(anchor.n, .009);
      badge.lookAt(badge.position.clone().add(anchor.n)); carRoot.add(badge);
    }
  }
  // Ghost only the painted skin, leaving the fitted product easy to read.
  const skin = [...new Set(bodyMeshes.map(m => m.material).filter(m => /^Paint 1/.test(m.name)))];
  const skinState = skin.map(m => ({ opacity: m.opacity, transparent: m.transparent, depthWrite: m.depthWrite }));
  let protectionFocus = 0;

  /* ---------- 8. PPF: stone chips bounce off the film ---------- */
  builders.ppf = () => {
  {
    const g = group('ppf');
    const hits = [];
    for (let i = 0; i < 26; i++) {
      const s2 = sampleTop(-0.7 + Math.random() * 1.4, 1.55 + Math.random() * 0.75);
      if (s2) hits.push(s2);
    }
    // A single fitted film surface, sampled from the bonnet geometry.
    const sheenMat = new T.MeshBasicMaterial({ color: 0x71d4ff, transparent: true, opacity: .16, depthWrite: false, side: T.DoubleSide });
    const points = [], indices = [], rows = 13, cols = 11;
    for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
      const h = sampleTop(-.65 + col * .13, 1.15 + row * .09);
      points.push(h ? h.p.clone().addScaledVector(h.n, .014) : null);
    }
    for (let row = 0; row < rows - 1; row++) for (let col = 0; col < cols - 1; col++) {
      const a = row * cols + col, b = a + 1, c = a + cols, d = c + 1;
      if ([a,b,c,d].every(i => points[i])) indices.push(a,c,b,b,c,d);
    }
    const filmGeo = new T.BufferGeometry();
    filmGeo.setAttribute('position', new T.Float32BufferAttribute(points.flatMap(p => p ? [p.x,p.y,p.z] : [0,0,0]), 3));
    filmGeo.setIndex(indices); filmGeo.computeVertexNormals();
    const fittedFilm = new T.Mesh(filmGeo, sheenMat); fittedFilm.name = 'ppf-fitted-layer'; g.add(fittedFilm);
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
      show: () => { sheenMat.opacity = 0.16; },
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
        sheenMat.opacity = 0.16 + Math.sin(performance.now() / 700) * 0.035;
      }
    };
  }

  };

  /* ---------- 9. Ceramic coating: water beads and extra gloss ---------- */
  builders.coating = () => {
  {
    const g = group('coating');
    const beadGeo = new T.SphereGeometry(1, 14, 10);
    const beadMat = new T.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.02, metalness: 0, transmission: 0, thickness: 0.01, ior: 1.33, transparent: true, opacity: 0.85, clearcoat: 1 });
    const beads = [];
    for (let i = 0; i < 90; i++) {
      const z = -1.6 + Math.random() * 3.9, x = -0.9 + Math.random() * 1.8;
      const h = sampleTop(x, z); if (!h || h.n.y < 0.55) continue;
      const b = new T.Mesh(beadGeo, beadMat);
      const r = 0.006 + Math.random() * 0.012;
      b.scale.set(r, r * 0.6, r); b.position.copy(h.p).addScaledVector(h.n, r * 0.45);
      beads.push({ b, base: b.position.clone(), n: h.n, r, slide: Math.random() < 0.3 ? 0 : -1, v: 0 });
    }
    // All water beads share one GPU draw instead of one draw per bead.
    const beadLayer = new T.InstancedMesh(beadGeo, beadMat, beads.length);
    beadLayer.frustumCulled = false; g.add(beadLayer);
    function syncBeads() {
      beads.forEach(({b}, i) => { b.updateMatrix(); beadLayer.setMatrixAt(i, b.matrix); });
      beadLayer.instanceMatrix.needsUpdate = true;
    }
    syncBeads();
    // A travelling highlight shows where the coating is applied.
    const coatMat = new T.MeshBasicMaterial({ color: 0x86e6ff, transparent: true, opacity: .4, depthWrite: false, blending: T.AdditiveBlending });
    const coatPads = [];
    const coatPose = new T.Object3D();
    for (let z = .5; z < 2.3; z += .13) for (let x = -.65; x < .7; x += .13) {
      const h = sampleTop(x, z); if (!h || h.n.y < .4) continue;
      const position = h.p.clone().addScaledVector(h.n, .012);
      coatPose.position.copy(position); coatPose.lookAt(position.clone().add(h.n));
      coatPads.push({ position, quaternion: coatPose.quaternion.clone(), z });
    }
    const coatLayer = new T.InstancedMesh(new T.CircleGeometry(.09, 8), coatMat, coatPads.length);
    coatLayer.frustumCulled = false; g.add(coatLayer);
    const paints = bodyMeshes.map(m => m.material).filter((m, i, a) => a.indexOf(m) === i && /^Paint 1/.test(m.name));
    const orig = paints.map(m => ({ r: m.roughness, c: m.clearcoatRoughness }));
    parts.coating = {
      group: g,
      show: () => paints.forEach(m => { m.roughness = 0.12; if ('clearcoatRoughness' in m) m.clearcoatRoughness = 0.0; }),
      hide: () => paints.forEach((m, i) => { m.roughness = orig[i].r; if ('clearcoatRoughness' in m) m.clearcoatRoughness = orig[i].c; }),
      update: (dt) => {
        const sweep = (performance.now() % 3600) / 3600 * 2.6 + .2;
        coatPads.forEach(({position,quaternion,z}, i) => {
          coatPose.position.copy(position); coatPose.quaternion.copy(quaternion);
          coatPose.scale.setScalar(Math.max(.001, 1 - Math.abs(z - sweep) / .35));
          coatPose.updateMatrix(); coatLayer.setMatrixAt(i, coatPose.matrix);
        }); coatLayer.instanceMatrix.needsUpdate = true;
        beads.forEach(o => {
          if (o.slide < 0) return;
          o.slide += dt; o.v = Math.min(0.5, o.v + dt * 0.4);
          // roll off: down the surface toward the edge
          o.b.position.x += Math.sign(o.base.x || 1) * o.v * dt;
          o.b.position.y -= o.v * dt * 0.4;
          if (o.slide > 2.2) { o.slide = 0; o.v = 0; o.b.position.copy(o.base); }
        });
        syncBeads();
      }
    };
  }

  };

  /* ---------- door opening (for seats / audio / mats) ---------- */
  const doorL = byName.BodyDoorLColor1;
  const doorBase = doorL ? doorL.quaternion.clone() : null;
  const doorR = byName.BodyDoorRColor1;
  const doorRBase = doorR ? doorR.quaternion.clone() : null;
  let doorRT = 0;
  let doorT = 0, doorTarget = 0;
  // roof + glass fade for cabin views
  const collect = names => { const out = []; names.forEach(n => { const o = byName[n]; if (o) o.traverse(m => { if (m.isMesh) out.push(m); }); }); return out; };
  const HIDE = {
    roof: collect(['BodyRoofPanel', 'InteriorRearHatch', 'BodyRearwindow', 'InteriorCage', 'InteriorPillar', 'BodyWindowsRearSides']),
    bootTrim: collect(['Engine', 'InteriorRearPanels', 'InteriorCage', 'InteriorPillar']),
    glass: collect(['BodyWindshield', 'BodyWindshieldWipers', 'BodyWindshieldWipersBase'])
  };
  const HIDE_FOR = { dashcam: ['glass'], screen: ['roof', 'glass'], audio: ['bootTrim'], seats: ['roof', 'glass'], mats: ['roof', 'glass'] };

  /* ---------- public API ---------- */
  let current = null;
  const OPEN_DOOR = { seats: 1, audio: 1, mats: 1 };
  let surfacePrepared = false;
  function prepare(key) {
    if ((key === 'ppf' || key === 'coating') && !surfacePrepared && rayTools) {
      rayTools.speedUpSurfaceSampling(bodyMeshes); rc.firstHitOnly = true; surfacePrepared = true;
    }
    if (key && !parts[key] && builders[key]) {
      carRoot.updateMatrixWorld(true); inv.copy(carRoot.matrixWorld).invert(); builders[key]();
    }
  }
  return {
    prepare,
    groupOf: key => parts[key] && parts[key].group,
    show(key) {
      if (current && parts[current]) { const p = parts[current]; p.group.visible = false; p.hide && p.hide(); }
      prepare(key);
      current = key;
      doorTarget = OPEN_DOOR[key] ? 1 : 0;
      const hidden = new Set((HIDE_FOR[key] || []).flatMap(h => HIDE[h]));
      new Set(Object.values(HIDE).flat()).forEach(m => { m.visible = !hidden.has(m); });
      if (key && parts[key]) {
        const p = parts[key]; p.group.visible = true; p.group.userData.t = 0; p.show && p.show();
      }
    },
    toggleDoor() { doorTarget = doorTarget > 0.5 ? 0 : 1; return doorTarget > 0.5; },
    update(dt, now) {
      protectionFocus += (((current === 'ppf' || current === 'coating') ? 1 : 0) - protectionFocus) * Math.min(1, dt * 5);
      skin.forEach((m, i) => {
        const active = protectionFocus > .002;
        if (m.transparent !== (active || skinState[i].transparent)) { m.transparent = active || skinState[i].transparent; m.needsUpdate = true; }
        m.opacity = skinState[i].opacity * (1 - protectionFocus * .64);
        m.depthWrite = active ? false : skinState[i].depthWrite;
      });
      if (current && parts[current]) {
        const p = parts[current], gr = p.group;
        gr.userData.t = Math.min(1, gr.userData.t + dt * 2.2);
        const e = 1 - Math.pow(1 - gr.userData.t, 3);
        gr.scale.setScalar(current === 'audio' ? 1 : 0.001 + e * 0.999);
        p.update && p.update(dt, now);
      }
      if (doorR && doorRBase) {
        doorRT += ((current === 'audio' ? 1 : 0) - doorRT) * Math.min(1, dt * 4);
        doorR.quaternion.copy(doorRBase).multiply(new T.Quaternion().setFromAxisAngle(DOOR_AXIS, -doorRT * DOOR_ANGLE));
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
