// Grade the same sunset photo into a Jerusalem night: deep blue sky, stone lit warm.
const sharp = require('sharp');
const [, , src, out] = process.argv;
(async () => {
  const { data, info } = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, C = 3;
  const lum = (i) => 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
  // Skyline per column: first strong vertical change below the upper sky.
  const sky = new Int32Array(W);
  for (let x = 0; x < W; x++) {
    let y0 = Math.round(H * .2);
    for (let y = y0; y < H * .45; y++) {
      const a = lum((y * W + x) * C), b = lum(((y + 2) * W + x) * C);
      const r = data[((y + 2) * W + x) * C], g = data[((y + 2) * W + x) * C + 1];
      if (Math.abs(a - b) > 14 || (r - g < 25 && b < 120 && y > H * .28)) { sky[x] = y + 4; break; }
      sky[x] = y;
    }
  }
  // Light smoothing that keeps towers: running min over 3 columns.
  const sk = Int32Array.from(sky, (v, x) => Math.min(v, sky[Math.max(0, x - 1)], sky[Math.min(W - 1, x + 1)]));
  const o = Buffer.alloc(W * H * C);
  const ss = (a, b, v) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
  const mix = (a, b, t) => a + (b - a) * t;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * C, L = lum(i) / 255, s = sk[x];
    let R, G, B;
    if (y < s - 1) {
      // Night sky: near-black navy at the top, deep blue toward the horizon, a faint amber haze from the city lights.
      const t = Math.min(1, y / (H * .33));
      R = mix(3, 12, t ** 1.6); G = mix(6, 22, t ** 1.6); B = mix(16, 50, t ** 1.4);
      const glow = ss(H * .12, H * .335, y) ** 2.2;
      R = mix(R, 66, glow * .6); G = mix(G, 50, glow * .55); B = mix(B, 30, glow * .5);
    } else {
      // City: dark blue stone at night; only the brighter stone picks up warm street light.
      const depth = ss(H * .58, H * .92, y); // foreground hill stays darker
      const lit = ss(.2, .7, L) ** 1.4 * (1 - depth * .8);
      R = mix(L * 40 + 6, Math.min(255, 40 + L * 300), lit);
      G = mix(L * 48 + 9, Math.min(222, 26 + L * 205), lit);
      B = mix(L * 80 + 18, Math.min(140, 10 + L * 92), lit);
      const k = 1 - depth * .4; R *= k; G *= k; B *= k;
      // Old City walls are floodlit warm at night.
      const u = x / W * 1920, v = y / H * 1062;
      const wallTop = 574 - (u - 240) * (26 / 1680), wallBot = 690 - (u - 240) * (95 / 1680);
      if (u > 150 && v > wallTop - 6 && v < wallBot) {
        const f = ss(wallTop - 4, wallTop + 22, v) * (1 - ss(wallBot - 40, wallBot, v)) * ss(150, 300, u);
        const up = .55 + .45 * ss(wallTop, wallBot, v);            // lights shine up from the base
        const wl = f * up * ss(.16, .5, L) * .85;
        R = mix(R, Math.min(255, 120 + L * 260), wl); G = mix(G, Math.min(230, 80 + L * 180), wl); B = mix(B, Math.min(150, 30 + L * 80), wl);
      }
      // The gold Dome, lit.
      const dx = (u - 960) / 38, dy = (v - 470) / 27;
      if (dx * dx + dy * dy < 1) {
        const f = 1 - (dx * dx + dy * dy) ** 2;
        R = mix(R, Math.min(255, 150 + L * 260), f); G = mix(G, Math.min(235, 105 + L * 190), f); B = mix(B, Math.min(140, 30 + L * 70), f);
      }
    }
    o[i] = Math.min(255, R); o[i + 1] = Math.min(255, G); o[i + 2] = Math.min(255, B);
  }
  // City lights and a few stars, baked into the photo.
  const pts = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, '../data/night-lights.json'), 'utf8')).slice(0, 900);
  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const sc = W / 1920;
  const dots = pts.map(([px, py]) => {
    const r = (.9 + rnd() * 1.6) * sc, warm = rnd() > .15, a = (.55 + rnd() * .45).toFixed(2);
    const c = warm ? 'url(#w)' : 'url(#c)';
    return `<circle cx="${(px * W).toFixed(1)}" cy="${(py * H).toFixed(1)}" r="${(r * 3.4).toFixed(1)}" fill="${c}" opacity="${a}"/>`;
  }).join('');
  const stars = Array.from({ length: 90 }, () => `<circle cx="${(rnd() * W).toFixed(1)}" cy="${(rnd() * H * .26).toFixed(1)}" r="${((.4 + rnd() * .7) * sc).toFixed(2)}" fill="#fff" opacity="${(.25 + rnd() * .5).toFixed(2)}"/>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs>
    <radialGradient id="w"><stop offset="0" stop-color="#fff6dc"/><stop offset=".22" stop-color="#ffc878"/><stop offset=".5" stop-color="#ffb060" stop-opacity=".25"/><stop offset="1" stop-color="#ffa050" stop-opacity="0"/></radialGradient>
    <radialGradient id="c"><stop offset="0" stop-color="#ffffff"/><stop offset=".22" stop-color="#dfe8ff"/><stop offset=".5" stop-color="#c8d6ff" stop-opacity=".22"/><stop offset="1" stop-color="#c8d6ff" stop-opacity="0"/></radialGradient>
    <radialGradient id="d"><stop offset="0" stop-color="#ffd890" stop-opacity=".55"/><stop offset="1" stop-color="#ffc070" stop-opacity="0"/></radialGradient>
  </defs>${stars}${dots}<ellipse cx="${958 * sc}" cy="${468 * sc}" rx="${95 * sc}" ry="${62 * sc}" fill="url(#d)"/></svg>`;
  const base = await sharp(o, { raw: { width: W, height: H, channels: 3 } }).png().toBuffer();
  await sharp(base).composite([{ input: Buffer.from(svg), blend: 'screen' }]).webp({ quality: 84 }).toFile(out);
  console.log('ok', W, H);
})();
