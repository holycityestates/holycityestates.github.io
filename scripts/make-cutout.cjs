// Cut the sky out of the hero photo (city with a transparent sky), so text can sit behind the skyline.
const sharp = require('sharp');
const [, , src, out] = process.argv;
(async () => {
  const { data, info } = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, C = 3;
  const lum = (i) => 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
  // Per column: walk down the sky until a pixel (and the few below it) clearly differs from the sky colour just above.
  const px = (x, y) => { const i = (y * W + x) * C; return [data[i], data[i + 1], data[i + 2]]; };
  const dist = (p, q) => Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]) + Math.abs(p[2] - q[2]);
  const st = Math.max(1, Math.round(H / 530));
  const sky = new Float32Array(W);
  for (let x = 0; x < W; x++) {
    sky[x] = H * .45;
    for (let y = Math.round(H * .18); y < H * .45; y++) {
      const ref = px(x, y - 3 * st);
      const T = 70, c = px(x, y);
      if (c[0] > 235 && c[1] > 170 && c[0] + c[1] + c[2] > 560) continue;   // the sun and its glare are sky
      if (dist(px(x, y), ref) > T && dist(px(x, y + 3 * st), ref) > T && dist(px(x, Math.min(H - 1, y + 7 * st)), ref) > T) { sky[x] = y + st; break; }
    }
  }
  // Median over 5 columns removes one-pixel spikes but keeps real towers.
  const med = Float32Array.from(sky, (_, x) => { const w = []; for (let j = -2; j <= 2; j++) w.push(sky[Math.min(W - 1, Math.max(0, x + j))]); return w.sort((a, b) => a - b)[2]; });
  sky.set(med);
  // Sun glare: a tall "building" that is really bright orange sky drops back to the surrounding roofline.
  const wide = Float32Array.from(sky, (_, x) => { const w = []; for (let j = -60 * st; j <= 60 * st; j += 3 * st) w.push(sky[Math.min(W - 1, Math.max(0, x + j))]); return w.sort((a, b) => a - b)[Math.floor(w.length / 2)]; });
  for (let x = 0; x < W; x++) {
    const y = Math.round(sky[x] + 4 * st), c = px(x, Math.min(H - 1, y));
    if (wide[x] - sky[x] > 30 * st && c[0] > 215 && c[1] > 140 && c[0] - c[2] > 60) sky[x] = wide[x];
  }
  const o = Buffer.alloc(W * H * 4);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x), s = Math.min(sky[x], sky[Math.max(0, x - 1)], sky[Math.min(W - 1, x + 1)]);
    o[i * 4] = data[i * 3]; o[i * 4 + 1] = data[i * 3 + 1]; o[i * 4 + 2] = data[i * 3 + 2];
    o[i * 4 + 3] = Math.max(0, Math.min(255, (y - s + 1.5) * 255 / 2.5)); // ~2px soft edge
  }
  await sharp(o, { raw: { width: W, height: H, channels: 4 } }).webp({ quality: 84, alphaQuality: 90 }).toFile(out);
  console.log('ok', W, H);
})();
