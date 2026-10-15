// Shared data for the homepage option sections (demo). Real listings only.
import { visible, L, img, ils, href, propNo } from '../../lib/i18n.js';
export const live = visible.filter((p) => !p.offMarket);
const notProject = live.filter((p) => !p.newProject);
export const featured = [...notProject.filter((p) => p.featured), ...notProject.filter((p) => !p.featured && p.price)].slice(0, 6);
// One photo per home (the Kapach homes share renders)
export const uniqPics = [...new Map(live.filter((p) => p.cover).map((p) => [p.cover, p])).values()];
export const hoods = Object.values(live.reduce((m, p) => {
  const k = p.neighborhood?.en; if (!k) return m;
  m[k] ??= { name: p.neighborhood, count: 0, homes: [] };
  m[k].count++; if (p.cover && !m[k].homes.some((h) => h.cover === p.cover)) m[k].homes.push(p);
  return m;
}, {})).sort((a, b) => b.count - a.count);
export { L, img, ils, href, propNo };
