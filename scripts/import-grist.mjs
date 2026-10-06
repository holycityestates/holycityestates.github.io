// Pulls listings from Grist (or a saved Grist export) and writes a clean
// src/data/properties.json that the site is built from.
//
// Live Grist:   GRIST_API_KEY=... GRIST_DOC_ID=... [GRIST_TABLE=Properties] [GRIST_SERVER=https://docs.getgrist.com] node scripts/import-grist.mjs
// Saved export: node scripts/import-grist.mjs --file path/to/data.json
//
// Photos may be either URLs (legacy Free Image links) or Grist attachments.
// Every photo is downloaded once and converted to fast WebP files in
// public/photos/<id>-800.webp and -1600.webp, so the site hosts its own images.
// Pass --no-photos to skip downloading (keeps original URLs).

import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { featureHe, typeHe, neighborhoodHe } from '../src/lib/glossary.js';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'src/data/properties.json');
const PHOTO_DIR = path.join(ROOT, 'public/photos');

const args = process.argv.slice(2);
const fileArg = args.includes('--file') ? args[args.indexOf('--file') + 1] : null;
const noPhotos = args.includes('--no-photos');
const { GRIST_API_KEY, GRIST_DOC_ID, GRIST_TABLE = 'Properties', GRIST_SERVER = 'https://docs.getgrist.com' } = process.env;

async function grist(p) {
  const res = await fetch(`${GRIST_SERVER}/api/docs/${GRIST_DOC_ID}${p}`, {
    headers: { Authorization: `Bearer ${GRIST_API_KEY}` },
  });
  if (!res.ok) throw new Error(`Grist ${p}: ${res.status} ${await res.text()}`);
  return res;
}

async function loadRecords() {
  if (fileArg) return JSON.parse(await fs.readFile(fileArg, 'utf8')).records;
  if (!GRIST_API_KEY || !GRIST_DOC_ID) throw new Error('Set GRIST_API_KEY and GRIST_DOC_ID, or pass --file');
  return (await (await grist(`/tables/${GRIST_TABLE}/records`)).json()).records;
}

const STATUS = { Sale: 'sale', Rent: 'rent', 'Short Term': 'short-term' };
const clean = (s) => (typeof s === 'string' ? s.trim() : s ?? '');
const list = (v) => (Array.isArray(v) && v[0] === 'L' ? v.slice(1) : Array.isArray(v) ? v : []);
const slugify = (s) =>
  clean(s).toLowerCase().replace(/["'’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

// Extract every image URL from free text (handles links fused without a newline).
function urlsFrom(text) {
  const found = String(text || '').match(/https?:\/\/.+?\.(?:jpe?g|png|webp|gif)/gi) || [];
  return [...new Set(found)];
}

// Returns photo *sources*: {url} for links, {att} for Grist attachments.
function photoSources(value) {
  const ids = list(value).filter((x) => typeof x === 'number');
  if (ids.length) return ids.map((att) => ({ key: `att-${att}`, att }));
  return urlsFrom(value).map((url) => ({ key: url, url }));
}

const done = new Map();
async function optimize(src) {
  if (done.has(src.key)) return done.get(src.key);
  const fallback = src.url || null;
  if (noPhotos || (src.att && !GRIST_API_KEY)) { done.set(src.key, fallback); return fallback; }
  const id = crypto.createHash('sha1').update(src.key).digest('hex').slice(0, 12);
  const base = `/photos/${id}`;
  const lg = path.join(PHOTO_DIR, `${id}-1600.webp`);
  try {
    await fs.access(lg);
  } catch {
    try {
      let buf;
      if (src.att) buf = Buffer.from(await (await grist(`/attachments/${src.att}/download`)).arrayBuffer());
      else if (src.url.startsWith('/') || src.url.startsWith('file:')) buf = await fs.readFile(src.url.replace(/^file:\/\//, ''));
      else {
        const r = await fetch(src.url);
        if (!r.ok) throw new Error(`${r.status}`);
        buf = Buffer.from(await r.arrayBuffer());
      }
      await fs.mkdir(PHOTO_DIR, { recursive: true });
      const img = sharp(buf).rotate();
      await img.clone().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 80 }).toFile(lg);
      await img.clone().resize({ width: 800, withoutEnlargement: true }).webp({ quality: 76 }).toFile(path.join(PHOTO_DIR, `${id}-800.webp`));
    } catch (e) {
      console.warn(`  ! photo failed (${src.key}): ${e.message} — keeping original link`);
      done.set(src.key, fallback);
      return fallback;
    }
  }
  done.set(src.key, base);
  return base;
}

async function photos(value) {
  const out = [];
  for (const src of photoSources(value)) {
    const r = await optimize(src);
    if (r) out.push(r);
  }
  return out;
}

const records = await loadRecords();
const props = [];
for (const { id, fields: f } of records) {
  if (!f || !clean(f.Name)) continue;
  const gallery = await photos(f.Image_Gallery);
  const coverList = await photos(f.Img_Urls);
  const cover = coverList[0] || gallery[0] || null;
  const features = list(f.FeaturesStr).map((en, i) => ({ en: clean(en), he: featureHe[clean(en)] || clean(list(f.Features_Hebrew)[i]) }));
  const typeEn = clean(f.Property_TypeStr);
  const hoodEn = clean(f.Neighborhood_Names);
  const beds = Number(f.Number_of_Bedrooms) || null;
  const status = STATUS[clean(f.Property_StatusStr)] || 'sale';
  const price = Number(f.Price) || 0;
  props.push({
    id,
    slug: `${slugify(f.Name)}-${id}`,
    display: !!f.Display,
    offMarket: !!f.Sold_or_Rented,
    newProject: !!f.New_Project,
    featured: !!f.Popular_Properties,
    date: clean(f.DateStr),
    status,
    price: price > 1 ? price : null, // 0/1 were used as "call for price"
    bedrooms: beds,
    // Israeli listings count rooms (bedrooms + living room). Use Grist's Rooms column if present.
    rooms: Number(f.Rooms) || (beds ? beds + 1 : null),
    sizeSqm: Number(f.Property_Size) || null,
    floor: f.Floor ?? null,
    type: { en: typeEn, he: typeHe[typeEn] || clean(f.Property_Type_Hebrew) },
    neighborhood: { en: hoodEn, he: neighborhoodHe[hoodEn] || clean(f.Neighborhood_Hebrew) },
    street: { en: clean(f.Street1), he: clean(f.Street1_Hebrew) },
    title: { en: clean(f.Name), he: clean(f.Name_Hebrew) },
    description: { en: clean(f.About), he: clean(f.About_Hebrew) },
    features,
    cover,
    gallery: [...new Set([cover, ...gallery].filter(Boolean))],
    video: clean(f.VideoUrl) || null,
  });
}

props.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
await fs.mkdir(path.dirname(OUT), { recursive: true });
await fs.writeFile(OUT, JSON.stringify(props, null, 2));
// Old site links (property_details.html?id=33) → redirect to the new property page.
const map = Object.fromEntries(props.filter((p) => p.display).map((p) => [p.id, p.slug]));
await fs.writeFile(path.join(ROOT, 'public/property_details.html'), `<!doctype html><html><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Redirecting</title>
<script>var m=${JSON.stringify(map)};var q=new URLSearchParams(location.search);var s=m[q.get('id')];location.replace(s?'/properties/'+s+'/':'/properties/');</script></head><body><a href="/properties/">Properties</a></body></html>\n`);
console.log(`Wrote ${props.length} properties (${props.filter((p) => p.display).length} visible) → src/data/properties.json`);
