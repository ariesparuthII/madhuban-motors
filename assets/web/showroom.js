/* Madhuban Motors cinematic showroom.
   One sticky WebGL stage; chapters scroll over it and drive the camera.
   - Studio rig: overhead light bars that also live in the environment map,
     so the reflections on the paint match the lights you see.
   - Wet floor (desktop), bloom, and the real shopfront board as the back wall.
   - Each accessory chapter shows the real part in place; dashcam, seats and
     mats can "go inside" to a short explainer. */

import { buildParts } from './studio3d-parts.js?v=finish4';

import { buildShopBoard } from './showroom-board.js?v=finish4';

const ROOT = document.getElementById('showroom');

// Camera presets per chapter (car space, metres). rot = car yaw.
const SHOTS = {
  hero:    { cam: [6.6, 1.2, 8.0], look: [0, 0.7, 0.2], rot: -0.42, fov: 32, spin: 0.25 },
  legacy:  { cam: [-5.8, 1.1, 1.2], look: [0, 0.6, 0], rot: 0.15, fov: 30, spin: 0.3 },
  screen:  { cam: [-0.12, 1.22, 0.38], look: [0.34, 0.84, 1.0], rot: 0, fov: 44, part: 'screen', inside: true },
  dashcam: { cam: [0.32, 1.3, 1.45], look: [0.07, 1.04, 0.36], rot: 0, fov: 38, part: 'dashcam', inside: true, dive: [0.095, 1.055, 0.43] },
  audio:   { cam: [2.4, 2.9, -5.7], look: [0, 0.65, -1.2], rot: 0, fov: 38, part: 'audio' },
  seats:   { cam: [2.2, 1.95, 0.9], look: [0.2, 0.55, -0.1], rot: 0, fov: 44, part: 'seats', dive: [0.3, 0.6, -0.1] },
  mats:    { cam: [0.9, 2.3, 0.9], look: [0.1, 0.1, 0.4], rot: 0, fov: 48, part: 'mats', dive: [0.1, 0.12, 0.4] },
  lights:  { cam: [2.3, 0.9, 6.2], look: [0, 0.45, 2.2], rot: 0, fov: 34, part: 'lights', dark: true },
  ppf:     { cam: [2.8, 2.4, 5.5], look: [0, 0.65, 1.0], rot: 0, fov: 34, part: 'ppf', dive: [0, 0.75, 2.0] },
  coating: { cam: [-3.2, 3.0, 4.5], look: [0, 0.65, 0.6], rot: 0, fov: 36, part: 'coating', dive: [-0.3, 0.95, 0.6] },
  film:    { cam: [-4.9, 1.4, -0.9], look: [0, 0.8, 0], rot: 0, fov: 32, part: 'film', panelRight: true },
  car:     { cam: [-5.4, 1.25, 3.6], look: [0, 0.55, 0], rot: -0.2, fov: 30, spin: 0.4 }
};
const PAINTS = { red: 0xDA291C, graphite: 0x2b2d31, pearl: 0xe9e6df, yellow: 0xE8C500 };

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const smooth = t => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;

function wa(msg) {
  return window.getMMWhatsAppUrl(msg);
}
function track(name, params) { try { window.gtag && window.gtag('event', name, params || {}); } catch (e) {} }

function init() {
  const stage = ROOT.querySelector('.sr-stage');
  const chapters = [...ROOT.querySelectorAll('.sr-ch')];
  const rail = ROOT.querySelector('.sr-rail');
  const keys = chapters.map(ch => ch.dataset.ch);

  // Rail navigation
  chapters.forEach((ch, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.dataset.i = i; b.setAttribute('aria-label', ch.dataset.label); b.innerHTML = '<i></i><span>' + ch.dataset.label + '</span>';
    b.addEventListener('click', () => {
      const top = ch.getBoundingClientRect().top + scrollY;
      scrollTo({ top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
    rail.appendChild(b);
  });

  // WhatsApp CTAs carry the chapter + car
  const brand = ROOT.querySelector('#srBrand'), model = ROOT.querySelector('#srModel');
  const carText = () => [brand && brand.value, model && model.value.trim()].filter(Boolean).join(' ');
  ROOT.addEventListener('click', e => {
    const a = e.target.closest('a[data-wa]');
    if (!a) return;
    const car = carText();
    a.href = wa(a.dataset.wa + (car ? ' My car: ' + car + '.' : '') + ' (From the 3D showroom)');
    track('showroom_whatsapp', { item: a.dataset.item || 'general' });
  }, true);

  // Dive overlay
  const diveEl = ROOT.querySelector('.sr-dive');
  let dive = null, diveReady = null;
  const loadDive = () => diveReady || (diveReady = import('./showroom-dive.js').then(({createDivePlayer}) => (dive = createDivePlayer(diveEl))));
  let engine = null;
  let diveTrigger = null, divePending = false;
  const closeDive = () => { divePending = false; dive && dive.close(); engine && engine.diveOut(); document.body.classList.remove('sr-diving'); diveTrigger && diveTrigger.focus({ preventScroll: true }); };
  diveEl.querySelector('.sr-dive__close').addEventListener('click', closeDive);
  addEventListener('keydown', e => { if (e.key === 'Escape' && ((dive && dive.active) || divePending)) closeDive(); });
  ROOT.querySelectorAll('[data-dive]').forEach(btn => btn.addEventListener('click', async () => {
    const k = btn.dataset.dive;
    diveTrigger = btn; divePending = true;
    try { await loadDive(); } catch (e) { divePending = false; return; }
    if (!divePending) return;
    track('showroom_dive', { item: k });
    const go = () => { if (!divePending) return; divePending = false; document.body.classList.add('sr-diving'); dive.open(k); diveEl.querySelector('.sr-dive__close').focus(); };
    if (engine) { engine.diveIn(k, go); setTimeout(go, 900); } else go();
  }));

  diveEl.addEventListener('keydown', e => { if (e.key === 'Tab') { e.preventDefault(); diveEl.querySelector('.sr-dive__close').focus(); } });

  // Scroll -> chapter float
  let chapterF = 0;
  function readScroll() {
    const mid = innerHeight * 0.5;
    let f = 0;
    for (let i = 0; i < chapters.length; i++) {
      const r = chapters[i].getBoundingClientRect();
      if (r.top <= mid) f = i + clamp((mid - r.top) / Math.max(1, r.height));
    }
    chapterF = clamp(f - 0.5, 0, chapters.length - 1);
    const idx = Math.round(chapterF);
    rail.querySelectorAll('button').forEach((b, i) => b.classList.toggle('is-on', i === idx));
    chapters.forEach((ch, i) => ch.classList.toggle('is-on', i === idx));
    ROOT.dataset.chapter = keys[idx];
    engine && engine.prepare(keys[Math.min(idx + 1, keys.length - 1)]);
    const bounds = ROOT.getBoundingClientRect();
    document.body.classList.toggle('sr-viewing', bounds.top < innerHeight && bounds.bottom > 0);
  }
  addEventListener('scroll', readScroll, { passive: true });
  addEventListener('resize', readScroll); readScroll();

  // Package builder: picks preview on the car and build the WhatsApp message
  const picks = [...ROOT.querySelectorAll('.sr-pick')];
  const totalEl = ROOT.querySelector('.sr-total b');
  const send = ROOT.querySelector('.sr-send');
  function refreshBuild(lastKey) {
    const on = picks.filter(p => p.classList.contains('is-on'));
    const sum = on.reduce((a, p) => a + (+p.dataset.price || 0), 0);
    totalEl.textContent = '\u20b9' + sum.toLocaleString('en-IN') + (on.some(p => !+p.dataset.price) ? ' +' : '');
    const names = on.map(p => p.firstChild.textContent.trim());
    if (send) send.dataset.wa = names.length
      ? 'Hi, I want these for my car: ' + names.join(', ') + '. Starting total on the website: ' + totalEl.textContent + '.'
      : 'Hi, please suggest accessories and prices for my car.';
    engine && engine.preview(lastKey || (on.length ? on[on.length - 1].dataset.part : null));
  }
  picks.forEach(p => p.setAttribute('aria-pressed', 'false'));
  picks.forEach(p => p.addEventListener('click', () => {
    p.classList.toggle('is-on'); p.setAttribute('aria-pressed', p.classList.contains('is-on'));
    refreshBuild(p.classList.contains('is-on') ? p.dataset.part : null);
    track('showroom_pick', { item: p.dataset.part });
  }));

  // Paint swatches
  ROOT.querySelectorAll('.sr-swatch').forEach(b => b.addEventListener('click', () => {
    ROOT.querySelectorAll('.sr-swatch').forEach(x => x.classList.toggle('is-active', x === b));
    engine && engine.paint(PAINTS[b.dataset.paint]);
  }));

  // Boot WebGL when close to view
  if (navigator.connection && navigator.connection.saveData) { ROOT.classList.add('is-fallback'); return; }
  if (!('WebGL2RenderingContext' in window)) { ROOT.classList.add('is-fallback'); return; }
  const io = new IntersectionObserver(es => {
    if (!es.some(e => e.isIntersecting)) return;
    io.disconnect();
    boot(stage, { getF: () => chapterF, keys }).then(e => { engine = e; ROOT.classList.add('is-ready'); })
      .catch(err => { console.warn('[showroom]', err); ROOT.classList.add('is-fallback'); });
  }, { rootMargin: '400px 0px' });
  io.observe(ROOT);
}

async function boot(stage, ctx) {
  // Check support with the actual canvas and reuse its context. Never allocate
  // a throwaway second GPU context for the compatibility check.
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2', {antialias:true,powerPreference:'default'});
  if (!gl) throw new Error('WebGL2 unavailable');
  // Start the complete car download alongside the JS module, not after it.
  const modelBytes = fetch(stage.dataset.model || 'assets/3d/concept-car.glb').then(r => {
    if (!r.ok) throw new Error('Car download failed: ' + r.status);
    return r.arrayBuffer();
  });
  modelBytes.catch(() => {});
  const cinematic = new URLSearchParams(location.search).get('quality') === 'cinematic';
  const T = await import(cinematic ? '../vendor/three/three-bundle.min.js' : '../vendor/three/showroom-core-finish.min.js');
  const rayToolsReady = import('./surface-raycast.min.js');
  const small = matchMedia('(max-width: 900px)').matches;
  // Begin network work before generating the studio environment.
  const modelLoader = new T.GLTFLoader(); modelLoader.setMeshoptDecoder(T.MeshoptDecoder);
  const modelReady = modelBytes.then(bytes => modelLoader.parseAsync(bytes, 'assets/3d/'));
  modelReady.catch(() => {});
  const logoReady = new T.TextureLoader().loadAsync('assets/web/logo.webp').catch(() => null);
  const boardReady = buildShopBoard(T, null);

  // Opt-in exploration profile. Default rendering stays unchanged.
  const lightProfile = new URLSearchParams(location.search).get('quality') !== 'cinematic';
  ROOT.dataset.quality = lightProfile ? 'light' : 'cinematic';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const bar = stage.querySelector('.sr-loader i');

  const renderer = new T.WebGLRenderer({ canvas, context:gl, antialias:true, powerPreference:'default' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1.25 : 1.5));
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.06;
  renderer.shadowMap.enabled = !lightProfile;
  stage.prepend(renderer.domElement);

  const scene = new T.Scene();
  const BG = 0x060606;
  scene.background = new T.Color(BG);
  scene.fog = new T.Fog(BG, 12, 30);

  /* ---------- studio environment: the reflections ARE the light rig ---------- */
  const envScene = new T.Scene();
  envScene.background = new T.Color(0x050505);
  const bright = c => new T.MeshBasicMaterial({ color: c, side: T.DoubleSide });
  for (let i = -2; i <= 2; i++) {                       // overhead bars
    const m = new T.Mesh(new T.PlaneGeometry(0.65, 7.5), bright(new T.Color(1, 1, 1).multiplyScalar(2.7)));
    m.rotation.x = Math.PI / 2; m.position.set(i * 1.1, 4.5, 0); envScene.add(m);
  }
  const sideL = new T.Mesh(new T.PlaneGeometry(6, 2.2), bright(new T.Color(1, 0.97, 0.93).multiplyScalar(2.0)));
  sideL.position.set(-6, 1.6, 0); sideL.rotation.y = Math.PI / 2; envScene.add(sideL);
  const sideR = sideL.clone(); sideR.material = bright(new T.Color(0.86, 0.93, 1).multiplyScalar(1.6)); sideR.position.x = 6; sideR.rotation.y = -Math.PI / 2; envScene.add(sideR);
  const redStrip = new T.Mesh(new T.PlaneGeometry(10, 0.5), bright(new T.Color(0.5, 0.075, 0.045).multiplyScalar(1.2)));
  redStrip.position.set(0, 1.0, -7); envScene.add(redStrip);
  const pmrem = new T.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(envScene, 0.08).texture;
  scene.environmentIntensity = 0;   // ramps up in the intro

  /* ---------- visible light rig (matches the env bars) ---------- */
  const barMat = new T.MeshBasicMaterial({ color: new T.Color(1, 1, 1).multiplyScalar(3), toneMapped: false });
  const bars = [];
  for (let i = -2; i <= 2; i++) {
    const g = new T.Group();
    const housing = new T.Mesh(new T.BoxGeometry(0.16, 0.06, 3.6), new T.MeshStandardMaterial({ color: 0x111111, roughness: .4, metalness: .8 }));
    const tube = new T.Mesh(new T.BoxGeometry(0.1, 0.012, 3.4), barMat.clone());
    tube.position.y = -0.035; g.add(housing, tube);
    g.position.set(i * 1.1, 4.5, 0); scene.add(g); bars.push(tube);
    tube.material.color.setScalar(0);
  }
  const key = new T.DirectionalLight(0xfff4e6, 0);
  key.position.set(-3, 7, 4); key.castShadow = true;
  key.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
  Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 1, far: 15 });
  key.shadow.bias = -0.0004; key.shadow.radius = 4;
  scene.add(key);
  const rim = new T.DirectionalLight(0xc9deff, 0); rim.position.set(4, 4, -4); scene.add(rim);
  const fill = new T.HemisphereLight(0xb4bfce, 0x18130f, 0); scene.add(fill);
  const cabin = new T.PointLight(0xfff1dc, 0, 2.2, 1.5); cabin.position.set(0, 1.0, 0.5); // Added only when the visitor enters a cabin or fitment view.

  /* ---------- floor ---------- */
  let reflector = null;
  if (!small && !lightProfile) {
    reflector = new T.Reflector(new T.CircleGeometry(14, 64), {
      textureWidth: Math.round(innerWidth * 0.5), textureHeight: Math.round(innerHeight * 0.5), color: 0x777777
    });
    reflector.rotation.x = -Math.PI / 2; reflector.position.y = -0.165; scene.add(reflector);
  }
  const floor = new T.Mesh(new T.CircleGeometry(14, 64), new T.MeshStandardMaterial({
    color: 0x0b0b0c, roughness: 0.68, metalness: 0.12, transparent: !!reflector, opacity: reflector ? 0.93 : 1
  }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -0.16; floor.receiveShadow = true; scene.add(floor);
  // turntable ring
  const ring = new T.Mesh(new T.RingGeometry(3.05, 3.08, 128), new T.MeshBasicMaterial({ color: new T.Color(1, .95, 0), toneMapped: false, transparent: true, opacity: 0 }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = -0.155; scene.add(ring);

  /* ---------- dust in the light: slow ambient motion ---------- */
  const DUST = lightProfile ? 64 : small ? 220 : 520;
  const dGeo = new T.BufferGeometry(), dPos = new Float32Array(DUST * 3), dSeed = new Float32Array(DUST);
  for (let i = 0; i < DUST; i++) { dPos[i * 3] = (Math.random() - .5) * 9; dPos[i * 3 + 1] = Math.random() * 3; dPos[i * 3 + 2] = (Math.random() - .5) * 9; dSeed[i] = Math.random() * 100; }
  dGeo.setAttribute('position', new T.BufferAttribute(dPos, 3));
  const dust = new T.Points(dGeo, new T.PointsMaterial({ size: 0.018, color: 0xfff4dc, transparent: true, opacity: 0.0, depthWrite: false, blending: T.AdditiveBlending }));
  scene.add(dust);

  /* ---------- back wall sign: the MM logo ---------- */
  const [board, logoTex] = await Promise.all([boardReady, logoReady]);
  if (logoTex) logoTex.colorSpace = T.SRGBColorSpace;
  {
    const hc = SHOTS.hero.cam, dx = -hc[0], dz = -hc[2], len = Math.hypot(dx, dz);
    const bx = dx / len * 13, bz = dz / len * 13;
    board.group.position.set(bx, -0.16, bz);
    board.group.rotation.y = Math.atan2(hc[0] - bx, hc[2] - bz);
  }
  board.setPower(0); scene.add(board.group);
  const sign = null;

  /* ---------- car ---------- */
  const gltf = await modelReady;
  const car = new T.Group(); car.add(gltf.scene); scene.add(car);
  const paintMats = []; let headMat = null, tailMat = null;
  gltf.scene.traverse(o => {
    if (!o.isMesh) return;
    o.castShadow = !lightProfile;
    const m = o.material; if (!m) return;
    // Refraction renders the whole scene a second time. Tinted transparency
    // keeps the cabin visible without that extra full-car pass.
    if (m.transmission > 0) { m.transmission = 0; m.transparent = true; m.opacity = .22; m.depthWrite = false; }
    if (/^Paint/.test(m.name)) {
      // The source's 30x tiled metallic-flake normal map reads as dents at
      // phone sizes. Use the full body normals and a clean clearcoat instead.
      m.normalMap = null; m.aoMap = null;
      if ('iridescence' in m) m.iridescence = 0;
    }
    if (/^Paint 1/.test(m.name)) paintMats.push(m);
    if (m.name === 'Headlight') headMat = m;
    if (m.name === 'Brakelight') tailMat = m;
    if (m.envMapIntensity !== undefined) m.envMapIntensity = 1;
  });
  paintMats.forEach(m => { m.color.setHex(PAINTS.red); m.metalness = 0.45; m.roughness = 0.26; if ('clearcoat' in m) { m.clearcoat = 1; m.clearcoatRoughness = 0.1; } });
  if (headMat) { headMat.emissive = new T.Color(0xeaf2ff); headMat.emissiveIntensity = 0; }
  if (tailMat) { tailMat.emissive = new T.Color(0xff1a0a); tailMat.emissiveIntensity = 0; }
  const rayTools = await rayToolsReady;
  const parts = buildParts(T, car, logoTex, rayTools);

  /* ---------- post ---------- */
  const camera = new T.PerspectiveCamera(30, 1, 0.02, 60);
  let composer = null;
  if (!lightProfile) {
    composer = new T.EffectComposer(renderer);
    composer.addPass(new T.RenderPass(scene, camera));
    composer.addPass(new T.UnrealBloomPass(new T.Vector2(256, 256), small ? 0.2 : 0.3, 0.4, 1.05));
    composer.addPass(new T.OutputPass());
  }

  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false); if (composer) composer.setSize(w, h);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(stage); resize();

  /* ---------- intro: studio powers on ---------- */
  const t0 = performance.now();
  const INTRO = 0.01; // Show the fully lit showroom immediately.

  /* ---------- state ---------- */
  let visible = true, running = false, last = performance.now();
  let frameCost = 16, qualityFrames = 0;
  let paintFrom = null, paintTo = null, paintT = 1;
  let currentPart = undefined;
  let diveState = null; let previewKey = null;               // {key, t, target, done}
  const camPos = new T.Vector3(...SHOTS.hero.cam), camLook = new T.Vector3(...SHOTS.hero.look), tA = new T.Vector3(), tB = new T.Vector3(), lA = new T.Vector3(), lB = new T.Vector3();
  let curRot = SHOTS.hero.rot, curFov = 30, dark = 0, inside = 0;
  let dragRot = 0, dragVel = 0, dragging = false, lastX = 0, offX = 0, offY = 0, offSign = null;
  // measure which way a view offset moves the picture on this device
  function calibrateOffset(W, H) {
    const p = new T.Vector3(0, 0.6, 0);
    camera.clearViewOffset(); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
    const a = p.clone().project(camera);
    camera.setViewOffset(W, H, 40, 40, W, H); camera.updateProjectionMatrix();
    const b = p.clone().project(camera);
    camera.clearViewOffset(); camera.updateProjectionMatrix();
    // screen x grows right with ndc.x; screen y grows down with -ndc.y
    return { x: Math.sign(b.x - a.x) || 1, y: Math.sign(a.y - b.y) || 1 };
  }

  /* ---------- click the car: things happen ---------- */
  const ray = new T.Raycaster(), ptr = new T.Vector2();
  const tip = document.createElement('div'); tip.className = 'sr-tip'; tip.hidden = true; stage.appendChild(tip);
  const fx = stage.closest('.showroom');
  let downX = 0, downY = 0, moved = 0, flash = 0, wheelSpin = 0, hornCtx = null;
  const wheels = []; car.traverse(o => { if (/^Wheel(Front|Rear)[LR]$/.test(o.name)) wheels.push(o); });
  const ACTIONS = [
    [/Door/, 'door', 'Open the door'],
    [/Headlight|Signal|Bumper|Grill|Hood|Topgrill/, 'horn', 'Flash lights and honk'],
    [/Wheel|Rim|Tire|Brake|Disc/, 'wheels', 'Spin the wheels'],
    [/Windshield|Interior|Seat|Steering|Dash/, 'inside', 'Look inside'],
    [/Paint|Body|Panel|Pillar|Roof/, 'paint', 'Change the colour']
  ];
  function pick(e) {
    const r = renderer.domElement.getBoundingClientRect();
    ptr.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
    ray.setFromCamera(ptr, camera);
    const shown = o => { for (; o; o = o.parent) if (!o.visible) return false; return true; };
    const hit = ray.intersectObject(car, true).find(h => shown(h.object) && !/^part-/.test(h.object.parent && h.object.parent.name || ''));
    if (!hit) return null;
    let o = hit.object, names = '';
    while (o && o !== car) { names += ' ' + o.name + ' ' + (o.material && o.material.name || ''); o = o.parent; }
    const a = ACTIONS.find(([re]) => re.test(names));
    return a ? { key: a[1], label: a[2], point: hit.point } : null;
  }
  function honk() {
    try {
      hornCtx = hornCtx || new (window.AudioContext || window.webkitAudioContext)();
      const t = hornCtx.currentTime, out = hornCtx.createGain(), lp = hornCtx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 1800; out.gain.setValueAtTime(0, t);
      out.gain.linearRampToValueAtTime(0.18, t + 0.02); out.gain.setValueAtTime(0.18, t + 0.32); out.gain.linearRampToValueAtTime(0, t + 0.42);
      [415, 520].forEach(f => { const o = hornCtx.createOscillator(); o.type = 'square'; o.frequency.value = f; o.connect(lp); o.start(t); o.stop(t + 0.45); });
      lp.connect(out); out.connect(hornCtx.destination);
    } catch (e) {}
  }
  function act(a) {
    track('showroom_click', { action: a.key });
    if (a.key === 'door') parts.toggleDoor();
    else if (a.key === 'horn') { flash = 1; honk(); }
    else if (a.key === 'wheels') wheelSpin = 1;
    else if (a.key === 'paint') { const btns = [...fx.querySelectorAll('.sr-swatch')]; const cur = btns.findIndex(b => b.classList.contains('is-active')); if (btns.length) btns[(cur + 1) % btns.length].click(); }
    else if (a.key === 'inside') { const el = fx.querySelector('.sr-ch[data-ch="screen"]'); el && scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: 'smooth' }); }
    // a ring pulse where you clicked
    const v = a.point.clone().project(camera), r = renderer.domElement.getBoundingClientRect();
    const pulse = document.createElement('span'); pulse.className = 'sr-pulse';
    pulse.style.left = ((v.x + 1) / 2 * r.width) + 'px'; pulse.style.top = ((1 - v.y) / 2 * r.height) + 'px';
    stage.appendChild(pulse); setTimeout(() => pulse.remove(), 700);
  }
  stage.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; downX = e.clientX; downY = e.clientY; moved = 0; });
  addEventListener('pointermove', e => {
    if (dragging) { moved += Math.abs(e.clientX - lastX); dragVel = (e.clientX - lastX) * 0.006; dragRot += dragVel; lastX = e.clientX; }
    if (e.pointerType === 'mouse' && e.target === renderer.domElement && !dragging && performance.now() - (pick.last || 0) > 70) {
      pick.last = performance.now();
      const a = pick(e);
      renderer.domElement.style.cursor = a ? 'pointer' : 'grab';
      tip.hidden = !a;
      if (a) { const r = stage.getBoundingClientRect(); tip.textContent = a.label; tip.style.transform = `translate(${e.clientX - r.left + 16}px, ${e.clientY - r.top + 12}px)`; }
    }
  }, { passive: true });
  addEventListener('pointercancel', () => { dragging = false; dragVel = 0; });
  addEventListener('pointerup', e => {
    if (dragging && moved < 6 && Math.abs(e.clientY - downY) < 6 && e.target === renderer.domElement) { const a = pick(e); if (a) act(a); }
    dragging = false;
  });
  renderer.domElement.addEventListener('pointerleave', () => { tip.hidden = true; });

  new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) loop(); }).observe(stage);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) loop(); });

  function shotFor(f) {
    // in the builder, a picked upgrade takes the camera straight to that part
    if (ctx.keys[Math.round(f)] === 'car' && previewKey && SHOTS[previewKey]) return { A: SHOTS[previewKey], B: SHOTS[previewKey], k: 0, frac: 0 };
    const i = Math.floor(f), frac = f - i;
    const A = SHOTS[ctx.keys[i]] || SHOTS.hero, B = SHOTS[ctx.keys[Math.min(i + 1, ctx.keys.length - 1)]] || A;
    return { A, B, k: smooth(clamp((frac - 0.15) / 0.7)), frac };
  }

  let lastInteraction = performance.now();
  const wake = () => { lastInteraction = performance.now(); };
  addEventListener('scroll', wake, {passive:true});
  stage.addEventListener('pointerdown', wake, {passive:true});
  stage.addEventListener('pointermove', wake, {passive:true});
  let lastDraw = 0;
  let markFirstFrame;
  const firstFrame = new Promise(resolve => { markFirstFrame = resolve; });
  function loop() {
    if (running) return; running = true; last = performance.now();
    const tick = now => {
      if (!visible || document.hidden) { running = false; return; }
      // Judge active frames only. Our intentional idle cap must never be
      // mistaken for a slow device, and the car stays above a crisp 1.25 cap.
      if ((dragging || now - lastInteraction < 700) && now - last < 100) {
        frameCost += (now - last - frameCost) * .04;
        if (++qualityFrames >= 150 && frameCost > 32 && renderer.getPixelRatio() > 1.25) {
          renderer.setPixelRatio(1.25); if (composer) composer.setPixelRatio(1.25); resize();
        }
      }
      if (!dragging && now - lastInteraction > 700 && now - lastDraw < 32) { requestAnimationFrame(tick); return; }
      lastDraw = now;
      const dt = Math.min((now - last) / 1000, 0.05); last = now;
      const it = clamp((now - t0) / 1000 / INTRO);

      // Intro: soft sequential light ramp, without random flicker.
      bars.forEach((b, i) => {
        const on = clamp((it * 1.4 - i * 0.12) * 4);
        const flick = smooth(on);
        b.material.color.setScalar(2.4 * flick * (1 - dark * 0.85));
      });
      const lightsOn = smooth(clamp(it * 1.2 - 0.15));
      scene.environmentIntensity = 1.12 * lightsOn * (1 - dark * 0.8);
      key.intensity = 2.5 * lightsOn * (1 - dark * 0.9);
      fill.intensity = 0.55 * lightsOn;
      rim.intensity = 0.85 * smooth(clamp(it * 1.5 - 0.6)) * (1 - inside * 0.85) * (1 - dark * 0.8);
      ring.material.opacity = 0.16 * smooth(clamp(it * 2 - 1)) * (1 - inside);
      if (!reduced) { const a = dGeo.attributes.position.array; for (let i = 0; i < DUST; i++) { a[i * 3 + 1] += dt * 0.05 * (0.5 + (dSeed[i] % 1)); a[i * 3] += Math.sin(now / 3000 + dSeed[i]) * dt * 0.03; if (a[i * 3 + 1] > 3) a[i * 3 + 1] = 0; } dGeo.attributes.position.needsUpdate = true; }
      board.setPower(smooth(clamp(it * 1.6 - 0.7)) * (1 - inside * 0.7));

      // scroll-driven shot
      const f = ctx.getF();
      const { A, B, k, frac } = shotFor(f);
      tA.set(...A.cam).lerp(tB.set(...B.cam), k);
      lA.set(...A.look).lerp(lB.set(...B.look), k);
      const targetRot = lerp(A.rot + (A.spin || 0) * frac, B.rot, k);
      const targetFov = lerp(A.fov, B.fov, k);
      const near = Math.round(f);
      const S = (ctx.keys[near] === 'car' && previewKey && SHOTS[previewKey]) || SHOTS[ctx.keys[near]] || SHOTS.hero;
      dust.material.opacity += ((S.part ? 0 : 0.2 * lightsOn * (1 - inside)) - dust.material.opacity) * Math.min(1, dt * 4);
      dark += ((S.dark ? 1 : 0) - dark) * Math.min(1, dt * 3);
      inside += ((S.inside ? 1 : 0) - inside) * Math.min(1, dt * 3);
      if ((S.inside || ['audio','seats','mats'].includes(S.part)) && !cabin.parent) scene.add(cabin);
      if (S.part === 'audio') { cabin.position.set(0, 1.08, -1.4); cabin.intensity = 1.8; }
      else { cabin.position.set(0, 1.0, 0.5); cabin.intensity = 1.1 * inside + (S.part === 'seats' || S.part === 'mats' ? .45 : 0); }

      // portrait screens: pull exterior shots back so the car fits
      const asp = camera.aspect;
      const pull = S.part === 'audio' ? (asp < 1.4 ? 2.1 : 1.75) : S.inside || S.part === 'seats' || S.part === 'mats' ? 1 : (asp >= 1.4 ? 1 : Math.min(ctx.keys[Math.round(f)] === 'car' && !previewKey ? 3.2 : 2.35, 1.7 / asp));
      tA.sub(lA).multiplyScalar(pull).add(lA);

      // the intro also dollies in
      const introPull = 1 + (1 - smooth(it)) * 0.6;
      tA.sub(lA).multiplyScalar(introPull).add(lA);

      // dive: fly toward the part, then hand over to the 2D explainer
      if (diveState) {
        diveState.t = Math.min(1, diveState.t + dt * (diveState.out ? 2.5 : 1.6));
        const e = smooth(diveState.t);
        const tgt = tB.set(...diveState.target);
        const k2 = diveState.out ? 1 - e : e;
        tA.lerp(tgt, k2 * 0.92); lA.lerp(tgt, k2 * 0.5);
        if (!diveState.out && diveState.t >= 1 && !diveState.done) { diveState.done = true; diveState.cb && diveState.cb(); }
        if (diveState.out && diveState.t >= 1) diveState = null;
      }

      const ease = reduced ? 1 : 1 - Math.pow(0.004, dt);
      camPos.lerp(tA, ease); camLook.lerp(lA, ease);
      curRot += (targetRot - curRot) * ease;
      curFov += (targetFov - curFov) * ease;
      if (!dragging) { dragVel *= 0.9; dragRot += dragVel; if (!(S.spin)) dragRot *= 0.92; }
      car.rotation.y = curRot + dragRot;
      // part shots are framed with the car at rest; inside them the car follows the camera frame
      const ry = S.part ? car.rotation.y : 0;
      camera.position.copy(camPos).applyAxisAngle(T.Object3D.DEFAULT_UP, ry);
      camera.lookAt(tB.copy(camLook).applyAxisAngle(T.Object3D.DEFAULT_UP, ry));
      const W = stage.clientWidth, H = stage.clientHeight;
      // where the car should sit on screen: right half on desktop (text left),
      // upper-middle on phones (text below). Signs are measured, not assumed.
      const wantX = W > 900 ? (S.panelRight ? 0.3 : 0.7) : S.part === 'audio' ? .56 : .5;
      const panel = ROOT.querySelector('.sr-ch.is-on .sr-panel');
      const panelTop = panel ? panel.getBoundingClientRect().top : H * .5;
      const visualBottom = Math.max(70, Math.min(H * .57, panelTop - 18));
      // Keep the moving scene above phone copy, including the taller builder.
      renderer.domElement.style.clipPath = W > 900 ? '' : `inset(70px 0 ${Math.max(0, H - visualBottom)}px 0)`;
      const wantY = W > 900 ? 0.52 : ctx.keys[Math.round(f)] === 'hero' ? .375 : Math.max(.2, Math.min(.33, (90 + visualBottom) / 2 / H));
      if (!offSign) offSign = calibrateOffset(W, H);
      const tx = offSign.x * (wantX - 0.5) * W, ty = offSign.y * (wantY - 0.5) * H;
      offX += (tx - offX) * Math.min(1, dt * 3); offY += (ty - offY) * Math.min(1, dt * 3);
      camera.setViewOffset(W, H, offX, offY, W, H);
      camera.zoom = 1;
      camera.fov = curFov; camera.updateProjectionMatrix();
      // Fit the complete original sign inside the usable hero area. The board
      // sits behind the car, so centring the car alone can crop the sign.
      if (ctx.keys[near] === 'hero' && !diveState) {
        board.face.updateWorldMatrix(true, false);
        camera.updateMatrixWorld();
        const bounds = () => {
          const points = [[-4.3, -1.66625], [4.3, -1.66625], [-4.3, 1.66625], [4.3, 1.66625]]
            .map(([x, y]) => board.face.localToWorld(new T.Vector3(x, y, 0)).project(camera));
          return { left: Math.min(...points.map(p => (p.x + 1) * W / 2)),
            right: Math.max(...points.map(p => (p.x + 1) * W / 2)),
            top: Math.min(...points.map(p => (1 - p.y) * H / 2)),
            bottom: Math.max(...points.map(p => (1 - p.y) * H / 2)) };
        };
        const safe = { left: W > 900 ? W * .49 : 18, right: W - 18,
          top: W > 900 ? 174 : 118, bottom: W > 900 ? H * .59 : visualBottom - 12 };
        let b = bounds();
        camera.zoom = Math.min(1, (safe.right - safe.left) / (b.right - b.left),
          (safe.bottom - safe.top) / (b.bottom - b.top));
        camera.updateProjectionMatrix();
        b = bounds();
        const dx = b.left < safe.left ? safe.left - b.left : b.right > safe.right ? safe.right - b.right : 0;
        const dy = b.top < safe.top ? safe.top - b.top : b.bottom > safe.bottom ? safe.bottom - b.bottom : 0;
        camera.setViewOffset(W, H, offX - dx, offY - dy, W, H);
        camera.updateProjectionMatrix();
      }

      // parts follow the nearest chapter
      const want = S.part || null;
      if (want !== currentPart) { parts.show(want); currentPart = want; }
      parts.update(dt, reduced ? 0 : now);

      // lights chapter: headlights blaze, tail lights glow
      const lt = S.part === 'lights' ? 1 : 0;
      if (headMat) headMat.emissiveIntensity += ((0.6 + lt * 9) * lightsOn - headMat.emissiveIntensity) * Math.min(1, dt * 4);
      if (tailMat) tailMat.emissiveIntensity = 1.5 * lightsOn;
      if (flash > 0) { flash = Math.max(0, flash - dt * 1.6); if (headMat) headMat.emissiveIntensity = Math.max(headMat.emissiveIntensity, (Math.floor(flash * 8) % 2) * 12); }
      if (wheelSpin > 0) { wheelSpin = Math.max(0, wheelSpin - dt * 0.5); wheels.forEach(w => w.rotateX(dt * 18 * wheelSpin)); }

      if (paintT < 1 && paintTo) { paintT = Math.min(1, paintT + dt * 2.5); paintMats.forEach(m => m.color.copy(paintFrom).lerp(paintTo, paintT)); }
      if (reflector) reflector.visible = inside < 0.5;
      if (composer) composer.render(dt); else renderer.render(scene, camera);
      if (markFirstFrame) { markFirstFrame(); markFirstFrame = null; }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  // Let browsers compile GPU programs in parallel before the first draw.
  // The board-and-car still remains visible throughout this work.
  camera.position.copy(camPos); camera.lookAt(camLook);
  if (renderer.compileAsync) {
    scene.updateMatrixWorld(true);
    const opening = scene.clone(false);
    scene.traverseVisible(o => {
      if (!(o.isMesh || o.isPoints || o.isLight)) return;
      const item = o.clone(false); item.matrixAutoUpdate = false; item.matrix.copy(o.matrixWorld); opening.add(item);
    });
    await renderer.compileAsync(opening, camera);
  }
  loop();

  const prepared = new Set();
  const api = {
    prepare(key) {
      const part = SHOTS[key] && SHOTS[key].part;
      if (!part || prepared.has(part)) return;
      prepared.add(part);
      const run = () => parts.prepare(part);
      if ('requestIdleCallback' in window) requestIdleCallback(run, {timeout:1500});
      else setTimeout(run, 120);
    },
    paint(hex) { const c = new T.Color(hex); paintFrom = paintMats[0] ? paintMats[0].color.clone() : c; paintTo = c; paintT = 0; },
    diveIn(key, cb) {
      const S = SHOTS[key];
      if (!S || !S.dive || reduced) { cb(); return; }
      diveState = { key, t: 0, target: S.dive, cb, out: false };
    },
    diveOut() { if (diveState) { diveState.out = true; diveState.t = 0; } },
    preview(key) {
      previewKey = key;
      // Apply the selected fitting in the click itself; do not wait for the
      // next animation frame after a dive/scroll transition.
      if (ctx.keys[Math.round(ctx.getF())] === 'car') { parts.show(key); currentPart = key; }
      const bounds = stage.getBoundingClientRect();
      if (bounds.bottom > 0 && bounds.top < innerHeight && !document.hidden) { visible = true; lastInteraction = performance.now(); loop(); }
    }
  };
  await firstFrame;
  return api;
}

if (ROOT) init();
