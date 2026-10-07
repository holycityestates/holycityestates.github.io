import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Free OpenStreetMap tiles (no key needed); softened to the site's warm palette in CSS (.leaflet-tile-pane).
const TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

function baseMap(el, opts = {}) {
  const map = L.map(el, { zoomControl: false, scrollWheelZoom: false, attributionControl: true, ...opts });
  L.tileLayer(TILES, { attribution: ATTR, maxZoom: 19 }).addTo(map);
  L.control.zoom({ position: document.dir === 'rtl' ? 'topleft' : 'topright' }).addTo(map);
  // Wheel zoom only after the visitor clicks into the map, so page scrolling isn't hijacked.
  map.on('click focus', () => map.scrollWheelZoom.enable());
  map.on('mouseout', () => map.scrollWheelZoom.disable());
  return map;
}

// A pin's label: the price, or "count · lowest-listed price" when several listings share a building.
const pinIcon = (items) => L.divIcon({ className: 'pin-wrap', html: `<span class="pin">${esc(items.length > 1 ? `${items.length} · ${items[0].label}` : items[0].label)}</span>`, iconSize: null });

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/** Full map page: price pins, grouped when several listings share a building. */
export function mountMap() {
  const el = document.getElementById('map');
  const data = JSON.parse(document.getElementById('pins')?.textContent || '[]');
  if (!el || !data.length) return;
  const map = baseMap(el);

  const groups = new Map();
  for (const p of data) {
    const k = `${p.lat.toFixed(4)},${p.lng.toFixed(4)}`;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(p);
  }

  const markers = [];
  for (const items of groups.values()) {
    const first = items[0];
    const icon = pinIcon(items);
    const m = L.marker([first.lat, first.lng], { icon, riseOnHover: true }).addTo(map);
    const view = document.documentElement.lang === 'he' ? 'לצפייה בנכס' : 'View property';
    // One listing: a small property card. Several in one building: a compact list.
    const html = items.length === 1
      ? items.map((p) => `<a class="pop-card" href="${p.url}">${p.photo ? `<span class="pop-ph"><img src="${esc(p.photo)}" alt=""></span>` : ''}<span class="pop-bd"><em>${esc(p.hood)}</em><strong>${esc(p.title)}</strong><span class="pop-ft"><b>${esc(p.price)}</b><i>${view}</i></span></span></a>`).join('')
      : `<div class="pops">${items.map((p) => `<a class="pop" href="${p.url}">${p.photo ? `<img src="${esc(p.photo)}" alt="">` : ''}<span><em>${esc(p.hood)}</em><strong>${esc(p.title)}</strong><b>${esc(p.price)}</b></span></a>`).join('')}</div>`;
    // The pin is drawn above its point, so the pop-up opens above the pin rather than on top of it.
    m.bindPopup(html, { className: 'hc-pop', maxWidth: 290, minWidth: 290, closeButton: true, autoPanPadding: [40, 60], offset: [0, -34] });
    m.items = items;
    markers.push(m);
  }
  map.fitBounds(L.latLngBounds(data.map((p) => [p.lat, p.lng])).pad(0.15), { maxZoom: 15 });

  // Card ↔ pin highlighting
  const cards = [...document.querySelectorAll('.map-card-wrap')];
  const markerFor = (id) => markers.find((m) => m.items.some((p) => p.id === id));
  cards.forEach((c) => {
    const m = markerFor(+c.dataset.id);
    c.addEventListener('mouseenter', () => m?.getElement()?.classList.add('is-hot'));
    c.addEventListener('mouseleave', () => m?.getElement()?.classList.remove('is-hot'));
  });
  markers.forEach((m) => {
    m.on('mouseover', () => m.items.forEach((p) => document.querySelector(`.map-card-wrap[data-id="${p.id}"]`)?.classList.add('is-hot')));
    m.on('mouseout', () => cards.forEach((c) => c.classList.remove('is-hot')));
    m.on('click', () => {
      const c = document.querySelector(`.map-card-wrap[data-id="${m.items[0].id}"]`);
      if (c && window.matchMedia('(min-width: 901px)').matches) c.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  });

  // Search filters apply to pins and cards together; the map refits to what's left.
  const form = document.getElementById('map-filters');
  const apply = () => {
    const f = Object.fromEntries(new FormData(form));
    const shown = new Set();
    cards.forEach((c) => {
      const d = c.querySelector('.card').dataset;
      const [bDeal, bMax] = (f.budget || '').split(':');
      const ok = (!f.status || d.status === f.status) &&
        (!f.neighborhood || d.neighborhood === f.neighborhood) &&
        (!f.beds || +d.beds >= +f.beds) &&
        (!f.budget || (d.status === bDeal && +d.price > 0 && +d.price <= +bMax));
      c.hidden = !ok;
      if (ok) shown.add(+c.dataset.id);
    });
    const visible = markers.filter((m) => m.items.some((p) => shown.has(p.id)));
    markers.forEach((m) => {
      if (!visible.includes(m)) { m.remove(); return; }
      // a shared building's pin counts and prices only the listings that match the search
      const match = m.items.filter((p) => shown.has(p.id));
      m.setIcon(pinIcon(match)); m.addTo(map);
    });
    document.getElementById('map-count').textContent = shown.size;
    document.getElementById('map-empty').hidden = shown.size > 0;
    if (visible.length) map.flyToBounds(L.latLngBounds(visible.map((m) => m.getLatLng())).pad(0.2), { maxZoom: 16, duration: 0.6 });
  };
  form?.addEventListener('change', apply);
  form?.querySelector('[data-search-go]')?.addEventListener('click', () => document.querySelector('.map-page').scrollIntoView({ behavior: 'smooth' }));
}

/** Small map on a property page: a soft circle for the area, not the exact door. */
export function mountMiniMap(el) {
  if (!el) return;
  const lat = +el.dataset.lat, lng = +el.dataset.lng;
  const map = baseMap(el, { dragging: !L.Browser.mobile, tap: false });
  map.setView([lat, lng], 15);
  L.circle([lat, lng], { radius: el.dataset.approx === 'true' ? 400 : 160, color: '#a8853f', weight: 1.5, fillColor: '#c9a862', fillOpacity: 0.22 }).addTo(map);
}
