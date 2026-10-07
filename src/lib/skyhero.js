// Homepage opener. Layers share one "cover" fit, so the word can sit exactly behind the photo's rooftops.
const hero = document.querySelector('[data-sky-hero]');
if (hero) {
  const IW = 1688, IH = 932, ROOF = 0.345;          // photo size and the height of its roofline
  const stage = hero.querySelector('.sh-stage');
  const word = hero.querySelector('.sh-word');
  const content = hero.querySelector('.sh-content');
  const night = hero.querySelectorAll('.sh-n');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ss = (a, b, v) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
  let rest = 0, risen = reduce, ticking = false;

  const place = () => {
    const w = stage.clientWidth, h = stage.clientHeight, k = Math.max(w / IW, h / IH);
    const roof = (h - IH * k) / 2 + ROOF * IH * k;
    word.style.top = '0px';
    const wh = word.getBoundingClientRect().height;
    // Lower part of the letters stays behind the buildings (Hebrew letters sit higher in their line, so less is hidden).
    rest = roof - wh * (document.documentElement.lang === 'he' ? 0.98 : 0.8);
    word.style.top = `${rest}px`;
  };
  const frame = () => {
    ticking = false;
    const r = hero.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - stage.clientHeight)));
    if (risen) word.style.transform = `translateY(${-p * Math.max(24, Math.min(rest - 110, 90))}px)`;
    const n = ss(0.18, 0.8, p);
    night.forEach((el) => (el.style.opacity = n));
    const out = ss(0.04, 0.22, p);
    content.style.opacity = 1 - out;
    content.style.transform = `translateY(${out * -24}px)`;
    content.style.pointerEvents = out > 0.6 ? 'none' : '';
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };

  place();
  if (!reduce) {
    word.classList.add('sh-hidden');
    word.getBoundingClientRect();
    setTimeout(() => {
      word.classList.remove('sh-hidden');
      setTimeout(() => { risen = true; word.classList.add('sh-risen'); frame(); }, 2400);
    }, 300);
  }
  frame();
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => { place(); frame(); });
  document.fonts?.ready.then(() => { place(); frame(); });
  // Night photos load lazily; start fetching them once the page is idle so the fade is ready.
  (window.requestIdleCallback || setTimeout)(() => night.forEach((im) => (im.loading = 'eager')));
}
