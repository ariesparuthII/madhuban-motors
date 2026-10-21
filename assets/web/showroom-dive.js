/* "Go inside" explainers for the showroom: short looping 2D animations that
   show WHY an accessory matters. Pure canvas, no video files. */

const TAU = Math.PI * 2;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const seg = (t, a, b) => clamp((t - a) / (b - a));

export const DIVES = {
  dashcam: {
    title: 'Inside the dashcam',
    length: 11,
    captions: [
      [0, 'Normal evening on GT Road. The dashcam records every second.'],
      [3.2, 'A bike cuts in. The car ahead brakes hard.'],
      [5.2, 'Impact. The G-sensor locks the clip so it can’t be overwritten.'],
      [7.4, 'Time, speed and number plate on record. Claim settled, no argument.']
    ],
    draw: drawDashcam
  },
  seats: {
    title: 'Why seat covers',
    length: 10,
    captions: [
      [0, 'Factory fabric soaks up everything.'],
      [2.6, 'One spilled chai and the stain stays for good.'],
      [5.2, 'With a fitted cover, it wipes straight off.'],
      [7.6, 'Original seats stay new. Better resale later.']
    ],
    draw: drawSeats
  },
  mats: {
    title: 'Why proper mats',
    length: 10,
    captions: [
      [0, 'Monsoon. Mud and water come in on every shoe.'],
      [2.8, 'Plain carpet soaks it up. It smells, then it rots.'],
      [5.4, 'A 7D mat with raised edges holds it all in.'],
      [7.8, 'Lift it out, wash it, put it back. Floor stays dry.']
    ],
    draw: drawMats
  },
  ppf: {
    title: 'Inside the paint',
    length: 10,
    captions: [
      [0, 'Your paint is thinner than a sheet of paper.'],
      [1.4, 'Highway stones hit the bonnet at speed.'],
      [3.6, 'Without film the chip goes down to metal. Then rust starts.'],
      [5.8, 'PPF takes the hit instead. Light scratches heal in the sun.']
    ],
    draw: drawPPF
  },
  coating: {
    title: 'Why ceramic coating',
    length: 10,
    captions: [
      [0, 'Rain on plain paint spreads out and dries in dirty spots.'],
      [3.4, 'A ceramic coat makes water bead up into tight drops.'],
      [5.6, 'The drops roll off and carry the dust with them.'],
      [7.8, 'Easier washing, deeper gloss, less fading.']
    ],
    draw: drawCoating
  }
};

/* ---------------- PPF cross-section ---------------- */
function drawPPF(c, w, h, t) {
  c.fillStyle = '#0d0e10'; c.fillRect(0, 0, w, h);
  const half = w / 2, base = h * 0.66;
  const layers = [['Metal', '#6d7178', 46], ['Primer', '#a9a49a', 14], ['Colour', '#b01e0a', 22], ['Clear coat', 'rgba(255,255,255,.28)', 12]];
  [0, 1].forEach(side => {
    const x0 = side * half + 30, x1 = side * half + half - 30;
    let y = base;
    layers.forEach(([name, col, th]) => {
      c.fillStyle = col; c.fillRect(x0, y - th, x1 - x0, th);
      if (side === 0) { c.fillStyle = 'rgba(232,228,220,.55)'; c.font = '600 12px sans-serif'; c.fillText(name, x0 + 6, y - th / 2 + 4); }
      y -= th;
    });
    if (side === 1) {
      const heal = seg(t, 6.6, 8.2);
      c.fillStyle = 'rgba(140,210,255,.35)'; c.fillRect(x0, y - 18, x1 - x0, 18);
      c.fillStyle = 'rgba(232,228,220,.75)'; c.font = '600 12px sans-serif'; c.fillText('PPF film', x0 + 6, y - 5);
      // dent in the film that heals
      const dent = seg(t, 2.6, 3.0) * (1 - heal);
      if (dent > 0) { c.fillStyle = '#0d0e10'; c.beginPath(); c.ellipse((x0 + x1) / 2, y - 18, 22, 9 * dent, 0, 0, Math.PI); c.fill(); }
      if (t > 6.2 && t < 8.6) { // sun
        c.fillStyle = 'rgba(255,214,90,.9)'; c.beginPath(); c.arc(x1 - 40, 70, 22, 0, TAU); c.fill();
        c.strokeStyle = 'rgba(255,214,90,.5)'; c.lineWidth = 3;
        for (let k = 0; k < 8; k++) { const a = k / 8 * TAU + t; c.beginPath(); c.moveTo(x1 - 40 + Math.cos(a) * 30, 70 + Math.sin(a) * 30); c.lineTo(x1 - 40 + Math.cos(a) * 42, 70 + Math.sin(a) * 42); c.stroke(); }
      }
    } else {
      const chip = seg(t, 2.6, 3.0);
      if (chip > 0) {
        c.fillStyle = '#0d0e10'; c.beginPath(); c.moveTo((x0 + x1) / 2 - 26, y); c.lineTo((x0 + x1) / 2 - 8, base - 46 + 4); c.lineTo((x0 + x1) / 2 + 10, base - 46 + 2); c.lineTo((x0 + x1) / 2 + 28, y); c.closePath(); c.fill();
        const rust = seg(t, 4.2, 6.5);
        if (rust > 0) { c.fillStyle = `rgba(150,72,24,${rust})`; c.beginPath(); c.ellipse((x0 + x1) / 2, base - 44, 18 + rust * 26, 6, 0, 0, TAU); c.fill(); }
      }
    }
    // stone
    const st = seg(t, 1.4, 2.8);
    if (st > 0 && st < 1) {
      const sx = side * half + half * 0.15 + st * half * 0.35, sy = 40 + st * (base - 160);
      c.fillStyle = '#8a8378'; c.beginPath(); c.arc(sx, sy, 10, 0, TAU); c.fill();
    }
    if (t > 2.8 && t < 4) { // bounce
      const b = seg(t, 2.8, 4);
      c.fillStyle = `rgba(138,131,120,${1 - b})`; c.beginPath(); c.arc((x0 + x1) / 2 + b * 120, base - 140 - b * 140, 9, 0, TAU); c.fill();
    }
  });
  c.strokeStyle = 'rgba(255,255,255,.12)'; c.beginPath(); c.moveTo(half, 30); c.lineTo(half, h - 30); c.stroke();
  heading(c, 30, 'No film', '#c9a67a'); heading(c, half + 30, 'With PPF', '#fff200');
}

/* ---------------- Ceramic coating ---------------- */
function drawCoating(c, w, h, t) {
  c.fillStyle = '#0c0d10'; c.fillRect(0, 0, w, h);
  const half = w / 2;
  [0, 1].forEach(side => {
    const x0 = side * half + 30, x1 = side * half + half - 30, y = h * 0.6;
    // glossy red panel
    const g = c.createLinearGradient(0, y, 0, y + 60);
    g.addColorStop(0, side ? '#e2402c' : '#9c2618'); g.addColorStop(1, '#5a0f08');
    c.fillStyle = g; c.fillRect(x0, y, x1 - x0, 60);
    if (side) { c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(x0, y + 4, x1 - x0, 5); }
    // rain
    const rain = t < 9;
    if (rain) {
      c.fillStyle = 'rgba(170,200,230,.8)';
      for (let k = 0; k < 14; k++) {
        const rx = x0 + ((k * 73) % (x1 - x0)), ry = ((t * 320 + k * 47) % (y - 40)) + 20;
        c.fillRect(rx, ry, 2, 12);
      }
    }
    if (!side) {
      // sheeting water, then dirty spots
      const wet = seg(t, 0.8, 3.0), dry = seg(t, 5.5, 8.0);
      c.fillStyle = `rgba(150,180,210,${.45 * wet * (1 - dry)})`; c.fillRect(x0, y - 6, (x1 - x0) * wet, 8);
      if (dry > 0) {
        c.fillStyle = `rgba(200,190,170,${dry * .8})`;
        for (let k = 0; k < 12; k++) { c.beginPath(); c.ellipse(x0 + 20 + k * (x1 - x0 - 40) / 11, y + 10 + (k % 3) * 12, 9, 5, 0, 0, TAU); c.fill(); }
      }
    } else {
      // beads that roll off
      for (let k = 0; k < 9; k++) {
        const born = 1 + k * 0.35, age = t - born; if (age < 0) continue;
        const roll = Math.max(0, age - 2.0);
        const bx = x0 + 30 + k * (x1 - x0 - 60) / 8 + roll * roll * 120, by = y - 9 + (roll > 0 ? roll * 6 : 0);
        if (bx > x1 + 20) continue;
        const r = 9;
        const bg = c.createRadialGradient(bx - 3, by - 3, 1, bx, by, r);
        bg.addColorStop(0, 'rgba(255,255,255,.95)'); bg.addColorStop(.4, 'rgba(180,215,245,.6)'); bg.addColorStop(1, 'rgba(120,160,200,.25)');
        c.fillStyle = bg; c.beginPath(); c.arc(bx, by, r, 0, TAU); c.fill();
        if (roll === 0 && age > 0.5) { c.fillStyle = 'rgba(110,90,70,.8)'; c.beginPath(); c.arc(bx + 2, by + 3, 2, 0, TAU); c.fill(); }
      }
    }
  });
  c.strokeStyle = 'rgba(255,255,255,.12)'; c.beginPath(); c.moveTo(half, 30); c.lineTo(half, h - 30); c.stroke();
  heading(c, 30, 'Plain paint', '#c9a67a'); heading(c, half + 30, 'Ceramic coated', '#fff200');
}

function heading(c, x, text, col) {
  c.font = '800 15px sans-serif'; const tw = c.measureText(text).width;
  c.fillStyle = 'rgba(0,0,0,.5)'; roundRect(c, x, 20, tw + 28, 34, 17); c.fill();
  c.fillStyle = col; c.fillText(text, x + 14, 42);
}

/* ---------------- Dashcam POV ---------------- */
function drawDashcam(c, w, h, t) {
  const shakeT = seg(t, 5.2, 5.9);
  const shake = shakeT > 0 && shakeT < 1 ? (1 - shakeT) * 14 : 0;
  c.save();
  c.translate((Math.random() - .5) * shake, (Math.random() - .5) * shake);
  const hy = h * 0.46;                        // horizon
  // dusk sky
  const sky = c.createLinearGradient(0, 0, 0, hy);
  sky.addColorStop(0, '#1d2a44'); sky.addColorStop(.7, '#b5624a'); sky.addColorStop(1, '#f0a35e');
  c.fillStyle = sky; c.fillRect(-20, -20, w + 40, hy + 20);
  // GT Road skyline: shop boards and buildings
  c.fillStyle = '#1b1414';
  let x = -20; let i = 0;
  while (x < w + 20) {
    const bw = 40 + ((i * 53) % 70), bh = 30 + ((i * 37) % 90);
    c.fillRect(x, hy - bh, bw, bh);
    if (i % 3 === 0) { c.fillStyle = i % 2 ? '#da291c' : '#fff200'; c.fillRect(x + 6, hy - bh + 8, bw - 12, 8); c.fillStyle = '#1b1414'; }
    x += bw + 4; i++;
  }
  // ground either side of the road
  const gr = c.createLinearGradient(0, hy, 0, h); gr.addColorStop(0, '#3a3128'); gr.addColorStop(1, '#1d1915');
  c.fillStyle = gr; c.fillRect(-20, hy, w + 40, h - hy + 20);
  // road
  c.fillStyle = '#26272b'; c.beginPath(); c.moveTo(w * .47, hy); c.lineTo(w * .53, hy); c.lineTo(w * 1.25, h); c.lineTo(-w * .25, h); c.closePath(); c.fill();
  // lane dashes moving toward camera (slow down after impact)
  const speed = t < 5.2 ? 1 : Math.max(0, 1 - (t - 5.2) * 1.2);
  c.fillStyle = '#e9e4d8';
  const phase = (t * 1.7 * speed) % 1;
  for (let k = 0; k < 9; k++) {
    const z1 = (k + phase) / 9, z2 = (k + phase + .45) / 9;
    const y1 = hy + (h - hy) * z1 * z1, y2 = hy + (h - hy) * z2 * z2;
    const wd1 = 2 + z1 * z1 * 22, wd2 = 2 + z2 * z2 * 22;
    c.beginPath(); c.moveTo(w / 2 - wd1 / 2, y1); c.lineTo(w / 2 + wd1 / 2, y1); c.lineTo(w / 2 + wd2 / 2, y2); c.lineTo(w / 2 - wd2 / 2, y2); c.fill();
  }
  // car ahead: approaches when it brakes
  const brake = seg(t, 3.6, 5.2);
  const carS = 0.42 + ease(brake) * 0.55;
  const cw = w * 0.24 * carS, ch = cw * 0.62, cx = w * 0.5 - cw / 2, cy = hy + (h - hy) * (0.12 + carS * 0.42) - ch;
  c.fillStyle = '#d9d6cf'; roundRect(c, cx, cy, cw, ch, cw * .08); c.fill();
  c.fillStyle = '#5b6b78'; roundRect(c, cx + cw * .12, cy + ch * .06, cw * .76, ch * .32, cw * .05); c.fill();
  const lit = t > 3.6;
  c.fillStyle = lit ? '#ff2a1a' : '#7a1b14';
  if (lit) { c.shadowColor = '#ff2a1a'; c.shadowBlur = 30; }
  c.fillRect(cx + cw * .04, cy + ch * .5, cw * .2, ch * .14); c.fillRect(cx + cw * .76, cy + ch * .5, cw * .2, ch * .14);
  c.shadowBlur = 0;
  c.fillStyle = '#fafafa'; c.fillRect(cx + cw * .34, cy + ch * .68, cw * .32, ch * .16);
  c.fillStyle = '#111'; c.font = `700 ${Math.max(8, cw * .07)}px sans-serif`; c.textAlign = 'center';
  c.fillText('UP 14 •• ••••', cx + cw / 2, cy + ch * .8); c.textAlign = 'left';
  c.fillStyle = '#111'; c.fillRect(cx + cw * .08, cy + ch, cw * .14, ch * .1); c.fillRect(cx + cw * .78, cy + ch, cw * .14, ch * .1);
  // bike cutting in from the left
  const b = seg(t, 2.8, 4.6);
  if (b > 0 && b < 1) {
    const bx = -w * .1 + ease(b) * w * .58, by = hy + (h - hy) * (0.35 - b * 0.12);
    const bs = 1.4 - b * .7;
    c.fillStyle = '#0f0f10';
    c.beginPath(); c.arc(bx, by, 16 * bs, 0, TAU); c.arc(bx + 50 * bs, by, 16 * bs, 0, TAU); c.fill();
    c.fillRect(bx, by - 28 * bs, 50 * bs, 14 * bs);
    c.fillStyle = '#da291c'; c.beginPath(); c.arc(bx + 22 * bs, by - 44 * bs, 11 * bs, 0, TAU); c.fill();
  }
  // impact flash
  if (shakeT > 0 && shakeT < 1) { c.fillStyle = `rgba(255,255,255,${(1 - shakeT) * .5})`; c.fillRect(0, 0, w, h); }
  c.restore();

  // ---- dashcam UI overlay ----
  c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(0, 0, w, 44); c.fillRect(0, h - 40, w, 40);
  c.fillStyle = Math.floor(t * 2) % 2 ? '#ff2a1a' : '#5a0e09'; c.beginPath(); c.arc(24, 22, 8, 0, TAU); c.fill();
  c.fillStyle = '#fff'; c.font = '700 16px ui-monospace, monospace'; c.fillText('REC  1080p  30fps', 40, 28);
  const secs = 41 + Math.floor(t * 1);
  const kmh = t < 5.2 ? 38 + Math.round(Math.sin(t) * 2) : Math.max(0, Math.round(38 - (t - 5.2) * 30));
  c.textAlign = 'right'; c.fillText(`20/10/2026  18:42:${String(secs % 60).padStart(2, '0')}`, w - 18, 28); c.textAlign = 'left';
  c.fillText(`${kmh} km/h   GPS 28.67N 77.42E`, 18, h - 14);
  if (t > 5.2) {
    const a = clamp((t - 5.2) * 3);
    c.fillStyle = `rgba(218,41,28,${a})`; roundRect(c, w / 2 - 150, 58, 300, 40, 8); c.fill();
    c.fillStyle = `rgba(255,255,255,${a})`; c.font = '800 17px ui-monospace, monospace'; c.textAlign = 'center';
    c.fillText('G-SENSOR  •  EVENT LOCKED', w / 2, 84); c.textAlign = 'left';
  }
  if (t > 7.4) {
    // evidence boxes around the plate and the bike
    const a = clamp((t - 7.4) * 2);
    c.strokeStyle = `rgba(255,242,0,${a})`; c.lineWidth = 3; c.setLineDash([10, 6]);
    c.strokeRect(cx + cw * .3, cy + ch * .64, cw * .4, ch * .24); c.setLineDash([]);
    c.fillStyle = `rgba(255,242,0,${a})`; c.font = '700 14px sans-serif';
    c.fillText('Number plate captured', cx + cw * .3, cy + ch * .64 - 8);
  }
}

/* ---------------- Seat covers ---------------- */
function drawSeats(c, w, h, t) {
  c.fillStyle = '#121214'; c.fillRect(0, 0, w, h);
  const s = Math.min(w, h) / 520, ox = w / 2 - 150 * s, oy = h / 2 - 210 * s;
  const cover = ease(seg(t, 5.0, 6.0));
  // seat silhouette: backrest + cushion
  const fabric = '#7b6f62';
  function seat(fill) {
    c.fillStyle = fill;
    roundRect(c, ox + 40 * s, oy, 170 * s, 250 * s, 40 * s); c.fill();           // backrest
    roundRect(c, ox + 20 * s, oy + 250 * s, 260 * s, 90 * s, 30 * s); c.fill();  // cushion
    roundRect(c, ox + 75 * s, oy - 70 * s, 100 * s, 70 * s, 22 * s); c.fill();   // headrest
  }
  seat(fabric);
  // fabric texture
  c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 1;
  for (let y = 0; y < 340; y += 6) { c.beginPath(); c.moveTo(ox + 20 * s, oy + y * s); c.lineTo(ox + 280 * s, oy + y * s); c.stroke(); }
  // stain (before cover)
  const spill = seg(t, 2.6, 4.2);
  if (spill > 0) {
    c.fillStyle = `rgba(92,58,24,${.75 * (1 - cover)})`;
    c.beginPath(); c.ellipse(ox + 150 * s, oy + 295 * s, (20 + spill * 70) * s, (8 + spill * 24) * s, 0, 0, TAU); c.fill();
  }
  // cover slides down over the seat
  if (cover > 0) {
    c.save(); c.beginPath(); c.rect(0, 0, w, oy - 70 * s + cover * 420 * s); c.clip();
    seat('#18181a');
    // clip the quilting to the seat outline
    c.beginPath();
    c.roundRect ? (c.roundRect(ox + 40 * s, oy, 170 * s, 250 * s, 40 * s), c.roundRect(ox + 20 * s, oy + 250 * s, 260 * s, 90 * s, 30 * s), c.roundRect(ox + 75 * s, oy - 70 * s, 100 * s, 70 * s, 22 * s))
      : c.rect(ox + 20 * s, oy - 70 * s, 260 * s, 410 * s);
    c.clip();
    // diamond quilting + red stitch
    c.strokeStyle = '#da291c'; c.lineWidth = 2 * s; c.setLineDash([6 * s, 4 * s]);
    for (let k = -8; k < 12; k++) {
      c.beginPath(); c.moveTo(ox + k * 40 * s, oy - 70 * s); c.lineTo(ox + (k * 40 + 420) * s, oy + 350 * s); c.stroke();
      c.beginPath(); c.moveTo(ox + (k * 40 + 420) * s, oy - 70 * s); c.lineTo(ox + k * 40 * s, oy + 350 * s); c.stroke();
    }
    c.setLineDash([]); c.restore();
  }
  // chai cup tipping, then spilling (twice: on fabric and on cover)
  const pour = (t > 1.6 && t < 4.2) || (t > 6.2 && t < 7.6);
  const cupT = t < 5 ? seg(t, 1.6, 2.6) : seg(t, 6.2, 6.8);
  const cx = ox + 200 * s, cy = oy + 170 * s;
  c.save(); c.translate(cx, cy); c.rotate(-cupT * 1.6);
  c.fillStyle = '#f2ece2'; roundRect(c, -18 * s, -30 * s, 36 * s, 44 * s, 6 * s); c.fill();
  c.fillStyle = '#c6833e'; c.fillRect(-15 * s, -26 * s, 30 * s, 8 * s);
  c.restore();
  if (pour) {
    c.fillStyle = '#9a6332';
    for (let d = 0; d < 6; d++) { const yy = ((t * 260 + d * 30) % 120) * s; c.beginPath(); c.arc(cx - 50 * s - d * 3 * s, cy + yy, 4 * s, 0, TAU); c.fill(); }
  }
  // on the cover: beads that wipe away
  if (t > 6.6) {
    const a = 1 - seg(t, 7.0, 7.8);
    c.fillStyle = `rgba(160,110,60,${a})`;
    for (let d = 0; d < 7; d++) { c.beginPath(); c.arc(ox + (120 + d * 12) * s, oy + (292 + (d % 2) * 8) * s, 5 * s, 0, TAU); c.fill(); }
    if (t > 7.0 && t < 8.0) { // cloth wipe
      const wx = ox + (100 + seg(t, 7.0, 7.8) * 120) * s;
      c.fillStyle = '#fff200'; roundRect(c, wx - 26 * s, oy + 278 * s, 52 * s, 30 * s, 6 * s); c.fill();
    }
  }
  // labels
  label(c, w, h, t < 5 ? 'Without cover' : 'With a fitted cover', t < 5 ? '#c9a67a' : '#fff200');
}

/* ---------------- Floor mats ---------------- */
function drawMats(c, w, h, t) {
  c.fillStyle = '#101012'; c.fillRect(0, 0, w, h);
  const s = Math.min(w, h) / 520, ox = w / 2 - 210 * s, oy = h / 2 - 150 * s;
  const mat = ease(seg(t, 5.0, 6.0));
  // carpet floor pan
  c.fillStyle = '#3d3a36'; roundRect(c, ox, oy, 420 * s, 300 * s, 30 * s); c.fill();
  c.strokeStyle = 'rgba(255,255,255,.04)';
  for (let y = 0; y < 300; y += 5) { c.beginPath(); c.moveTo(ox, oy + y * s); c.lineTo(ox + 420 * s, oy + y * s); c.stroke(); }
  // pedals for scale
  c.fillStyle = '#222'; roundRect(c, ox + 300 * s, oy + 20 * s, 40 * s, 70 * s, 6 * s); c.fill(); roundRect(c, ox + 240 * s, oy + 30 * s, 50 * s, 50 * s, 6 * s); c.fill();
  // mud and water spreading into carpet (before mat)
  const mud = seg(t, 1.0, 4.6);
  if (mud > 0) {
    const a = (1 - mat);
    c.fillStyle = `rgba(74,52,30,${.8 * a})`;
    for (let k = 0; k < 5; k++) { // footprints
      const px = ox + (90 + k * 50) * s, py = oy + (220 - k * 26) * s;
      if (mud > k / 5) { c.beginPath(); c.ellipse(px, py, 16 * s, 30 * s, -.4, 0, TAU); c.fill(); }
    }
    c.fillStyle = `rgba(60,90,120,${.45 * a})`;
    c.beginPath(); c.ellipse(ox + 180 * s, oy + 190 * s, (30 + mud * 120) * s, (16 + mud * 60) * s, 0, 0, TAU); c.fill();
  }
  // 7D mat drops in with raised edge
  if (mat > 0) {
    const lift = (1 - mat) * 60 * s;
    c.save(); c.globalAlpha = mat;
    c.fillStyle = '#111'; roundRect(c, ox + 14 * s, oy + 14 * s - lift, 392 * s, 272 * s, 26 * s); c.fill();
    c.fillStyle = '#c9a77a'; roundRect(c, ox + 28 * s, oy + 28 * s - lift, 364 * s, 244 * s, 20 * s); c.fill();
    c.fillStyle = '#b48d5c';
    for (let y = 0; y < 244; y += 26) for (let x = (y / 26 % 2) * 13; x < 364; x += 26) {
      const px = ox + (28 + x) * s, py = oy + (28 + y) * s - lift;
      c.beginPath(); c.moveTo(px + 13 * s, py + 2 * s); c.lineTo(px + 24 * s, py + 13 * s); c.lineTo(px + 13 * s, py + 24 * s); c.lineTo(px + 2 * s, py + 13 * s); c.closePath(); c.fill();
    }
    c.strokeStyle = '#da291c'; c.lineWidth = 2 * s; c.setLineDash([7 * s, 5 * s]);
    roundRect(c, ox + 36 * s, oy + 36 * s - lift, 348 * s, 228 * s, 16 * s); c.stroke(); c.setLineDash([]);
    c.restore();
    // mud stays on the mat, then gets lifted out
    if (t > 6.0) {
      const out = ease(seg(t, 7.8, 9.0));
      c.save(); c.translate(0, -out * 40 * s); c.globalAlpha = 1 - out * .6;
      c.fillStyle = 'rgba(74,52,30,.85)';
      for (let k = 0; k < 3; k++) { c.beginPath(); c.ellipse(ox + (130 + k * 60) * s, oy + (200 - k * 30) * s, 14 * s, 26 * s, -.4, 0, TAU); c.fill(); }
      c.restore();
    }
  }
  label(c, w, h, t < 5 ? 'Plain carpet' : '7D mat, raised edges', t < 5 ? '#9a8f84' : '#fff200');
}

function label(c, w, h, text, col) {
  c.font = '800 15px sans-serif'; const tw = c.measureText(text).width;
  c.fillStyle = 'rgba(0,0,0,.5)'; roundRect(c, 20, 20, tw + 28, 34, 17); c.fill();
  c.fillStyle = col; c.fillText(text, 34, 42);
}
function roundRect(c, x, y, w, h, r) {
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}

/* Player bound to the overlay DOM */
export function createDivePlayer(root) {
  const canvas = root.querySelector('canvas');
  const cap = root.querySelector('.sr-dive__cap');
  const ttl = root.querySelector('.sr-dive__title');
  const bar = root.querySelector('.sr-dive__bar i');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let active = null, start = 0, raf = 0;
  function size() {
    const r = canvas.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(r.width * d); canvas.height = Math.round(r.height * d);
  }
  function frame(now) {
    if (!active) return;
    const D = DIVES[active];
    const t = reduced ? D.length * .8 : ((now - start) / 1000) % D.length;
    const ctx = canvas.getContext('2d');
    const d = canvas.width / canvas.getBoundingClientRect().width;
    ctx.setTransform(d, 0, 0, d, 0, 0);
    D.draw(ctx, canvas.width / d, canvas.height / d, t);
    let line = D.captions[0][1];
    for (const [at, txt] of D.captions) if (t >= at) line = txt;
    if (cap.textContent !== line) cap.textContent = line;
    bar.style.width = (t / D.length * 100).toFixed(1) + '%';
    if (!reduced) raf = requestAnimationFrame(frame);
  }
  window.addEventListener('resize', () => { if (active) { size(); if (reduced) frame(performance.now()); } });
  return {
    open(key) {
      if (!DIVES[key]) return;
      active = key; ttl.textContent = DIVES[key].title;
      root.hidden = false; root.classList.add('is-open');
      size(); start = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
    },
    close() { active = null; cancelAnimationFrame(raf); root.classList.remove('is-open'); setTimeout(() => { if (!active) root.hidden = true; }, 400); },
    get active() { return active; }
  };
}
