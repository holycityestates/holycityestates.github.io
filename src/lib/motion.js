// Motion layer with one consistent language: every reveal is the same fade-up.
// Also: scroll progress line, small cursor dot, tap ripples, header-on-scroll, and a
// photo-expand transition when opening a property. Everything is skipped for reduced-motion
// users, and content is fully visible if this script never runs.
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const root = document.documentElement;
const he = root.lang === 'he';

// ---------- Header turns solid after scrolling past the top ----------
const header = document.querySelector('.site-header');
const onScroll = () => header?.classList.toggle('scrolled', window.scrollY > 40);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

if (!reduce) {
  root.classList.add('motion');

  // ---------- Scroll progress hairline ----------
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.appendChild(bar);

  // ---------- Scroll reveals: one fade-up for everything ----------
  // Whatever comes into view together follows in reading order, 90ms apart,
  // so a row of cards always flows the same way instead of popping at random.
  const targets = [...document.querySelectorAll(
    '.section-head, .section > .wrap > h2, .page-head h1, .card, .project, .hood, .service, .svc, .quote, .duo-card, .about-split > div, .facts, .block, .contact-card, .filters, .map-filters, .cta-inner > *, .detail-head > div > :not(h1), .detail-head .detail-price, .mosaic-item:not(:first-child)'
  )].filter((el, i, all) => !all.some((o) => o !== el && o.contains(el)));
  const STEP = 90, MAX = 5;
  const show = (els) => {
    els.sort((x, y) => {
      const a = x.getBoundingClientRect(), b = y.getBoundingClientRect();
      if (Math.abs(a.top - b.top) > 24) return a.top - b.top;
      return he ? b.left - a.left : a.left - b.left;
    }).forEach((el, i) => {
      el.style.setProperty('--d', `${Math.min(i, MAX) * STEP}ms`);
      el.classList.add('in');
      setTimeout(() => el.style.removeProperty('--d'), 1400);
    });
  };
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        const batch = entries.filter((e) => e.isIntersecting).map((e) => e.target);
        batch.forEach((el) => io.unobserve(el));
        if (batch.length) show(batch);
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 })
    : null;
  targets.forEach((el) => { el.setAttribute('data-reveal', ''); io ? io.observe(el) : el.classList.add('in'); });
  // Safety net: never leave anything hidden.
  setTimeout(() => targets.forEach((el) => el.classList.add('in')), 5000);

  // ---------- Scroll-linked: progress line and the hero easing away ----------
  const heroImg = document.querySelector('.hero-media img');
  const heroContent = document.querySelector('.hero-content');
  let ticking = false;
  const frame = () => {
    ticking = false;
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    if (heroImg) heroImg.style.setProperty('--py', `${Math.min(y, 900) * 0.2}px`);
    if (heroContent) heroContent.style.setProperty('--hero-out', Math.min(1, y / (innerHeight * 0.75)).toFixed(3));
  };
  const onFrame = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  window.addEventListener('scroll', onFrame, { passive: true });
  window.addEventListener('resize', onFrame, { passive: true });
  frame();

  // ---------- Cursor: small gold dot; becomes a "View" tag over properties ----------
  if (fine) {
    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    dot.innerHTML = `<i></i><span>${he ? 'לצפייה' : 'View'}<b aria-hidden="true">${he ? '←' : '→'}</b></span>`;
    document.body.appendChild(dot);
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, shown = false;
    window.addEventListener('pointermove', (e) => {
      x = e.clientX; y = e.clientY;
      if (!shown) { shown = true; rx = x; ry = y; dot.classList.add('on'); }
      const t = e.target.closest?.('.card, .project, .hood, .mosaic-item, .pop');
      const a = e.target.closest?.('a, button, select, label, input, textarea');
      const dark = e.target.closest?.('.hero, .duo, .cta, .site-footer, .section-tint:has(.projects), .site-header.transparent');
      dot.classList.toggle('view', !!t);
      dot.classList.toggle('link', !t && !!a);
      dot.classList.toggle('on-dark', !!dark);
    }, { passive: true });
    document.addEventListener('pointerleave', () => { dot.classList.remove('on'); shown = false; });
    window.addEventListener('pointerdown', () => dot.classList.add('press'));
    window.addEventListener('pointerup', () => dot.classList.remove('press'));
    const loop = () => {
      rx += (x - rx) * 0.35; ry += (y - ry) * 0.35;
      dot.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      requestAnimationFrame(loop);
    };
    loop();

  }

  // ---------- Opening a property: card presses in, its photo flies into the gallery ----------
  const crossDocVT = 'CSSViewTransitionRule' in window;
  document.addEventListener('click', (e) => {
    const card = e.target.closest?.('a.card, a.project');
    if (!card || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || card.target === '_blank') return;
    card.classList.add('opening');
    const media = card.querySelector('.card-media') || card;
    if (crossDocVT) {
      // The property page names its first gallery photo the same, so the browser morphs one into the other.
      media.style.viewTransitionName = 'prop-photo';
      card.querySelector('.card-title, .project-label strong')?.style.setProperty('view-transition-name', 'prop-title');
      return;
    }
    // Fallback: a short gold curtain, then navigate.
    e.preventDefault();
    const veil = document.createElement('div');
    veil.className = 'page-veil';
    document.body.appendChild(veil);
    setTimeout(() => (location.href = card.href), 450);
  });
  // Coming back with the Back button: clear any leftover transition names.
  window.addEventListener('pageshow', () => {
    document.querySelectorAll('.opening').forEach((c) => c.classList.remove('opening'));
    document.querySelectorAll('[style*="view-transition-name"]').forEach((el) => (el.style.viewTransitionName = ''));
    document.querySelectorAll('.page-veil').forEach((v) => v.remove());
  });

  // ---------- Tap ripple (touch) ----------
  document.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'touch') return;
    const el = e.target.closest('.btn, .card, .seg span, .seg button, .main-nav a, .project, .hood, .chip-link');
    if (!el) return;
    const r = el.getBoundingClientRect();
    const s = document.createElement('span');
    s.className = 'ripple';
    const size = Math.max(r.width, r.height) * 1.4;
    s.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    el.style.overflow = el.matches('.card') ? '' : 'hidden';
    (el.matches('.card') ? el.querySelector('.card-media') : el)?.appendChild(s);
    s.addEventListener('animationend', () => s.remove());
  }, { passive: true });

  // ---------- Images fade in as they load ----------
  document.querySelectorAll('main img').forEach((im) => {
    if (im.complete) return;
    im.classList.add('loading');
    im.addEventListener('load', () => im.classList.remove('loading'), { once: true });
    im.addEventListener('error', () => im.classList.remove('loading'), { once: true });
  });
}
