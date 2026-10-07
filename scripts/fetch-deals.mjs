// Real registered sales from the Israel Tax Authority (via GovMap) → src/data/deals.json.
// For each sale listing: recent apartment sales within ~250 m, plus the neighborhood's
// median price per m² over the last 12 months. Run before building; if GovMap is down,
// the previous deals.json is kept.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'src/data/deals.json');
const API = 'https://www.govmap.gov.il/api/real-estate';
const props = JSON.parse(await fs.readFile(path.join(ROOT, 'src/data/properties.json'), 'utf8'));

const get = async (url) => {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (HolyCity site build)', Accept: 'application/json' }, signal: AbortSignal.timeout(25000) });
      if (r.ok) return await r.json();
    } catch {}
    await new Promise((res) => setTimeout(res, 1200 * (i + 1)));
  }
  return null;
};
// GovMap takes Web-Mercator metres.
const merc = (lat, lng) => [Math.round(lng * 20037508.34 / 180), Math.round(Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180) * 20037508.34 / 180)];
const FLOORS = { 'מרתף': -1, 'קרקע': 0, 'עמודים': 0, 'ראשונה': 1, 'שניה': 2, 'שנייה': 2, 'שלישית': 3, 'רביעית': 4, 'חמישית': 5, 'שישית': 6, 'שביעית': 7, 'שמינית': 8, 'תשיעית': 9, 'עשירית': 10 };
const isHome = (d) => d.propertyTypeDescription === 'דירה' || /דירה|פנטהאוז|דופלקס|קוטג|בית/.test(d.dealNatureDescription || '');
const clean = (d) => ({
  date: d.dealDate?.slice(0, 10),
  price: d.dealAmount,
  m2: d.assetArea,
  rooms: d.assetRoomNum || null,
  floor: FLOORS[d.floorNo] ?? (/^\d+$/.test(d.floorNo || '') ? +d.floorNo : null),
  kind: d.dealNatureDescription || '',
  street: d.streetNameHeb ? { he: `${d.streetNameHeb}${d.houseNum ? ' ' + d.houseNum : ''}`, en: d.streetNameEng ? `${d.houseNum ? d.houseNum + ' ' : ''}${d.streetNameEng}` : '' } : null,
  hood: d.neighborhood || '',
  id: d.dealId,
});
const ok = (d) => d.price > 300000 && d.m2 >= 20 && d.m2 <= 600 && d.price / d.m2 > 8000 && d.price / d.m2 < 250000;
const median = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null; };

const now = new Date();
const since = (months) => { const d = new Date(now); d.setMonth(d.getMonth() - months); return d.toISOString().slice(0, 10); };

let prev = {};
try { prev = JSON.parse(await fs.readFile(OUT, 'utf8')); } catch {}
const out = { updated: now.toISOString().slice(0, 10), source: 'Israel Tax Authority via GovMap', listings: {}, hoods: {} };
const hoodDeals = {};
const polyCache = {};

const targets = props.filter((p) => p.display && !p.offMarket && p.status === 'sale' && p.geo && !p.geo.approx);
for (const p of targets) {
  const [x, y] = merc(p.geo.lat, p.geo.lng);
  const polys = (await get(`${API}/deals/${x},${y}/250`)) || [];
  let deals = [];
  for (const poly of polys.slice(0, 25)) {
    const id = poly.polygon_id;
    polyCache[id] ??= ((await get(`${API}/street-deals/${id}?limit=40&start_date=${since(36)}`))?.data || []);
    deals.push(...polyCache[id]);
  }
  const homes = [...new Map(deals.filter(isHome).map(clean).filter(ok).map((d) => [d.id, d])).values()]
    .sort((a, b) => b.date.localeCompare(a.date));
  out.listings[p.id] = homes.slice(0, 20);
  // Neighborhood figures: one request per neighborhood, from the nearest parcel.
  const hoodName = homes[0]?.hood;
  if (hoodName && !hoodDeals[hoodName] && polys[0]) {
    const nd = await get(`${API}/neighborhood-deals/${polys[0].polygon_id}?limit=1500&start_date=${since(12)}`);
    hoodDeals[hoodName] = (nd?.data || []).filter(isHome).map(clean).filter(ok);
  }
  if (hoodName) out.listings[p.id].hood = hoodName;
  process.stdout.write('.');
}
// Neighborhoods we work in (and their neighbours), for the price-per-m² comparison.
const AREAS = [['Talbiya', 31.7716, 35.2178], ['Rehavia', 31.7744, 35.2105], ['City Center', 31.7811, 35.2163], ['Mamilla', 31.7779, 35.2239],
  ['German Colony', 31.7642, 35.2196], ['Old Katamon', 31.7647, 35.2111], ['Baka', 31.7590, 35.2240], ['Nachlaot', 31.7840, 35.2080],
  ['Yemin Moshe', 31.7720, 35.2262], ['Shaarei Chesed', 31.7780, 35.2100], ['Mahane Yehuda', 31.7865, 35.2125], ['Arnona', 31.7470, 35.2240]];
out.areas = [];
// GovMap's neighborhood names → how we show them.
const NAMES = { 'טלביה-קוממויות': ['Talbiya', 'טלביה'], 'עמק רפאים-המושבה הגרמנית': ['German Colony', 'המושבה הגרמנית'], 'רחביה': ['Rehavia', 'רחביה'],
  'זכרון משה': ['Zichron Moshe', 'זכרון משה'], 'גאולים-בקעה': ['Baka', 'בקעה'], 'קטמון הישנה': ['Old Katamon', 'קטמון הישנה'], 'מרכז העיר': ['City Center', 'מרכז העיר'],
  'מחנה יהודה': ['Mahane Yehuda', 'מחנה יהודה'], 'ארנונה': ['Arnona', 'ארנונה'], 'ממילא': ['Mamilla', 'ממילא'], 'ימין משה': ['Yemin Moshe', 'ימין משה'], 'נחלאות': ['Nachlaot', 'נחלאות'] };
for (const [en, lat, lng] of AREAS) {
  const [x, y] = merc(lat, lng);
  const polys = (await get(`${API}/deals/${x},${y}/150`)) || [];
  if (!polys[0]) continue;
  const nd = await get(`${API}/neighborhood-deals/${polys[0].polygon_id}?limit=1500&start_date=${since(12)}`);
  const list = (nd?.data || []).filter(isHome).map(clean).filter(ok).filter((d) => d.date >= since(12));
  const names = list.reduce((m, d) => (m[d.hood] = (m[d.hood] || 0) + 1, m), {});
  const he = Object.entries(names).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
  const nm = NAMES[he] || [en, he];
  if (list.length >= 8 && !out.areas.some((a) => a.key === he)) out.areas.push({ key: he, en: nm[0], he: nm[1], ppm: Math.round(median(list.map((d) => d.price / d.m2)) / 100) * 100, count: list.length });
  process.stdout.write('+');
}
out.areas.sort((a, b) => b.ppm - a.ppm);
for (const [name, list] of Object.entries(hoodDeals)) {
  const recent = list.filter((d) => d.date >= since(12));
  if (recent.length >= 8) out.hoods[name] = { ppm: Math.round(median(recent.map((d) => d.price / d.m2)) / 100) * 100, count: recent.length };
}
// Keep the hood name per listing outside the array (arrays lose extra keys in JSON), and drop sales far from the
// neighborhood's normal price per m² (family transfers, partial shares, mixed-use deals are registered as sales too).
for (const [id, arr] of Object.entries(out.listings)) {
  const med = (out.areas.find((a) => a.key === arr.hood) || out.hoods[arr.hood] || {}).ppm;
  const fair = med ? arr.filter((d) => d.price / d.m2 > med * 0.6 && d.price / d.m2 < med * 1.8) : [...arr];
  out.listings[id] = { hood: arr.hood || null, deals: fair.slice(0, 8) };
}

const total = Object.values(out.listings).reduce((n, l) => n + l.deals.length, 0);
if (!total && prev.listings) { console.log('\nGovMap returned nothing — keeping the previous deals.json'); process.exit(0); }
await fs.writeFile(OUT, JSON.stringify(out, null, 1));
console.log(`\nWrote deals for ${Object.keys(out.listings).length} listings (${total} sales), ${out.areas.length} neighborhoods → src/data/deals.json`);
