// Holy City Desk (the back end) → src/data/properties.json.
// The desk is now where listings are edited; Grist is kept only as a backup.
//
// Usage:
//   node scripts/import-desk.mjs --dir <export dir> [--assets <dir>]
// <export dir>/properties/<id>.json  — one file per property, as exported from the desk's database
// <assets dir>/<asset id>.<ext>       — photos uploaded in the desk (downloaded from its asset store)
//
// Existing photos are referenced as "photos/<hash>" and already live in public/photos.
// New uploads are resized to public/photos/<hash>-800|1600.webp like the Grist importer does.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { featureHe, typeHe, neighborhoodHe } from '../src/lib/glossary.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'src/data/properties.json');
const PHOTO_DIR = path.join(ROOT, 'public/photos');
const args = process.argv.slice(2);
const arg = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : null);
const DIR = arg('--dir');
const ASSETS = arg('--assets');
if (!DIR) { console.error('Pass --dir <export dir>'); process.exit(1); }

const slugify = (s) => String(s || '').trim().toLowerCase().replace(/["'’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
const esc = (s) => String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const toHtml = (d = {}) => {
  const paras = String(d.body || '').split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean);
  return [d.lead && `<p class="lead">${esc(d.lead)}</p>`, ...paras.map((x) => `<p>${esc(x).replace(/\n/g, '<br>')}</p>`), d.note && `<p class="note">${esc(d.note)}</p>`]
    .filter(Boolean).join('');
};

let assetFiles = [];
if (ASSETS) { try { assetFiles = await fs.readdir(ASSETS); } catch {} }
async function photoPath(ph) {
  if (ph.src) return '/' + ph.src.replace(/^\/+/, '');
  if (!ph.asset) return null;
  const id = 'd' + crypto.createHash('sha1').update(ph.asset).digest('hex').slice(0, 11);
  const lg = path.join(PHOTO_DIR, `${id}-1600.webp`);
  try { await fs.access(lg); return `/photos/${id}`; } catch {}
  const file = assetFiles.find((f) => f.startsWith(ph.asset));
  if (!file) { console.warn(`  ! photo ${ph.asset} not downloaded — skipped`); return null; }
  const img = sharp(path.join(ASSETS, file)).rotate();
  await fs.mkdir(PHOTO_DIR, { recursive: true });
  await img.clone().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 80 }).toFile(lg);
  await img.clone().resize({ width: 800, withoutEnlargement: true }).webp({ quality: 76 }).toFile(path.join(PHOTO_DIR, `${id}-800.webp`));
  return `/photos/${id}`;
}

let geo = {};
try { geo = JSON.parse(await fs.readFile(path.join(ROOT, 'data/geocode.json'), 'utf8')); } catch {}

const files = (await fs.readdir(path.join(DIR, 'properties'))).filter((f) => f.endsWith('.json'));
const props = [];
for (const f of files) {
  const d = JSON.parse(await fs.readFile(path.join(DIR, 'properties', f), 'utf8'));
  const id = Number(d.id);
  const photos = (await Promise.all((d.photos || []).map(photoPath))).filter(Boolean);
  props.push({
    id,
    slug: d.slug || `${slugify(d.title?.en)}-${id}`,
    display: d.show !== false,
    offMarket: (d.state || 'available') !== 'available',
    newProject: !!d.newProject,
    featured: !!d.featured,
    date: d.date || new Date().toISOString().slice(0, 10),
    status: d.deal || 'sale',
    price: d.price || null,
    prevPrice: d.prevPrice && d.price && d.prevPrice > d.price ? d.prevPrice : null,   // shows a "Price reduced" badge
    bedrooms: d.bedrooms ?? null,
    rooms: d.rooms ?? (d.bedrooms ? d.bedrooms + 1 : null),
    sizeSqm: d.sizeSqm ?? null,
    balconySqm: d.balconySqm ?? null,
    floor: d.floor ?? null,
    floorTo: d.floorTo ?? null,   // duplexes: top floor (shown as "3–4")
    type: { en: d.type || '', he: typeHe[d.type] || '' },
    neighborhood: { en: d.neighborhood || '', he: neighborhoodHe[d.neighborhood] || d.neighborhoodHe || '' },
    street: { en: d.street?.en || '', he: d.street?.he || '' },
    title: { en: d.title?.en || '', he: d.title?.he || d.title?.en || '' },
    description: { en: toHtml(d.description?.en), he: toHtml(d.description?.he) },
    features: (d.features || []).map((en) => ({ en, he: featureHe[en] || en })),
    cover: photos[0] || null,
    gallery: photos,
    video: d.video || null,
    project: d.project || null,
    unit: d.unit ? { en: d.unit.en || '', he: d.unit.he || d.unit.en || '' } : null,
    geo: d.geo || geo[id] || null,
  });
}
// New-project buildings: one page per project, listing its apartments.
const projects = [];
let pfiles = [];
try { pfiles = (await fs.readdir(path.join(DIR, 'projects'))).filter((f) => f.endsWith('.json')); } catch {}
for (const f of pfiles) {
  const d = JSON.parse(await fs.readFile(path.join(DIR, 'projects', f), 'utf8'));
  if (d.show === false) continue;
  const photos = (await Promise.all((d.photos || []).map(photoPath))).filter(Boolean);
  projects.push({
    slug: d.slug || f.replace(/\.json$/, ''),
    name: { en: d.name?.en || '', he: d.name?.he || d.name?.en || '' },
    neighborhood: { en: d.neighborhood || '', he: neighborhoodHe[d.neighborhood] || '' },
    street: { en: d.street?.en || '', he: d.street?.he || '' },
    delivery: { en: d.delivery?.en || '', he: d.delivery?.he || '' },
    condition: { en: d.condition?.en || '', he: d.condition?.he || '' },
    description: { en: toHtml(d.description?.en), he: toHtml(d.description?.he) },
    cover: photos[0] || null,
    gallery: photos,
    geo: d.geo || null,
    // Building explorer: the render with clickable floor bands (positions in % of the photo).
    explorer: d.explorer?.photo ? { ...d.explorer, photo: await photoPath(d.explorer.photo) } : null,
  });
}
await fs.writeFile(path.join(ROOT, 'src/data/projects.json'), JSON.stringify(projects, null, 2));

props.sort((a, b) => (b.date || '').localeCompare(a.date || '') || a.id - b.id);
await fs.writeFile(OUT, JSON.stringify(props, null, 2));
// The desk now holds the corrections, so nothing is layered on top any more.
await fs.writeFile(path.join(ROOT, 'src/data/overrides.json'), '{}\n');
const map = Object.fromEntries(props.filter((p) => p.display).map((p) => [p.id, p.slug]));
await fs.writeFile(path.join(ROOT, 'public/property_details.html'), `<!doctype html><html><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Redirecting</title>
<script>var m=${JSON.stringify(map)};var q=new URLSearchParams(location.search);var s=m[q.get('id')];location.replace(s?'/properties/'+s+'/':'/properties/');</script></head><body><a href="/properties/">Properties</a></body></html>\n`);
const missing = props.filter((p) => p.display && !p.geo).map((p) => p.id);
console.log(`Wrote ${props.length} properties, ${projects.length} project(s) (${props.filter((p) => p.display).length} visible) → src/data/properties.json`);
if (missing.length) console.log(`  Not on the map yet (add to data/geocode.json): ${missing.join(', ')}`);
