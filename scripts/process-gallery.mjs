// Turns raw phone photos/videos dropped in assets/gallery/inbox/ into web-ready
// files and adds them to assets/gallery/gallery.json (newest first).
//   inbox/seat-covers/creta-black-red.jpg  -> service "Seat covers", title "Creta black red"
//   inbox/any-name.mp4                     -> short muted video + poster
import { readdir, readFile, writeFile, mkdir, rm, stat } from 'node:fs/promises';
import { join, extname, basename, dirname, relative } from 'node:path';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';

const ROOT = new URL('..', import.meta.url).pathname;
const INBOX = join(ROOT, 'assets/gallery/inbox');
const OUT = join(ROOT, 'assets/gallery/photos');
const JSON_PATH = join(ROOT, 'assets/gallery/gallery.json');
const IMG = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif']);
const VID = new Set(['.mp4', '.mov', '.m4v', '.webm']);
const SERVICES = { 'seat-covers': 'Seat covers', interior: 'Interior', mats: 'Mats', 'android-screen': 'Android screen',
  'sound-system': 'Sound system', dashcam: 'Dashcam', lights: 'Lights', 'sun-film': 'Sun film', ppf: 'PPF', 'ceramic-coating': 'Ceramic coating' };

const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'job';
const titleFrom = s => { const t = s.replace(/[-_]+/g, ' ').replace(/\b(img|vid|dsc|pxl|whatsapp image|whatsapp video)\b/gi, '').replace(/\d{6,}/g, '').trim();
  return t ? t[0].toUpperCase() + t.slice(1) : 'New job at the shop'; };

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true }).catch(() => [])) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...await walk(p)); else if (!e.name.startsWith('.')) out.push(p);
  }
  return out;
}

const data = JSON.parse(await readFile(JSON_PATH, 'utf8'));
await mkdir(OUT, { recursive: true });
const stamp = new Date().toISOString().slice(0, 10);
let added = 0;

for (const file of await walk(INBOX)) {
  const ext = extname(file).toLowerCase(), name = basename(file, extname(file));
  const folder = relative(INBOX, dirname(file)).split('/')[0];
  const service = SERVICES[folder] || 'Shop work';
  const base = `${stamp}-${slug(name)}-${Math.random().toString(36).slice(2, 6)}`;
  try {
    if (IMG.has(ext)) {
      const dest = join(OUT, base + '.webp');
      const img = sharp(file).rotate();                     // fix phone orientation
      const meta = await img.metadata();
      await img.resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
        .normalise({ lower: 1, upper: 99 })                 // lift dull phone shots
        .modulate({ brightness: 1.03, saturation: 1.08 })
        .sharpen({ sigma: 0.8 })
        .webp({ quality: 82 }).toFile(dest);
      const portrait = (meta.height || 1) >= (meta.width || 1);
      data.items.unshift({ type: 'photo', src: 'assets/gallery/photos/' + base + '.webp', title: titleFrom(name),
        text: 'Fitted at Madhuban Motors, GT Road', service, car: '', fit: portrait ? 'cover' : 'contain' });
    } else if (VID.has(ext)) {
      const dest = join(OUT, base + '.mp4'), poster = join(OUT, base + '.webp'), tmp = join(OUT, base + '.jpg');
      execFileSync('ffmpeg', ['-y', '-i', file, '-t', '20', '-an', '-vf', "scale='if(gt(iw,ih),1280,-2)':'if(gt(iw,ih),-2,1280)',eq=contrast=1.04:saturation=1.08",
        '-c:v', 'libx264', '-preset', 'slow', '-crf', '28', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', dest], { stdio: 'inherit' });
      execFileSync('ffmpeg', ['-y', '-ss', '1', '-i', dest, '-frames:v', '1', tmp], { stdio: 'inherit' });
      await sharp(tmp).webp({ quality: 80 }).toFile(poster); await rm(tmp);
      data.items.unshift({ type: 'video', src: 'assets/gallery/photos/' + base + '.mp4', poster: 'assets/gallery/photos/' + base + '.webp',
        title: titleFrom(name), text: 'Fitted at Madhuban Motors, GT Road', service, car: '', fit: 'cover' });
    } else { console.log('skip (not a photo/video):', file); continue; }
    await rm(file); added++;
    console.log('added', relative(ROOT, file), '->', service);
  } catch (e) { console.error('failed', file, e.message); }
}

data.items = data.items.slice(0, 40);                     // keep the gallery light
await writeFile(JSON_PATH, JSON.stringify(data, null, 2) + '\n');
console.log(`${added} new item(s)`);
