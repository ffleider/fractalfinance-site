/* ════════════════════════════════════════════════════════════════════
   FOLIAGE ENGINE
   - Barnsley fern (a real mathematical fractal that grows a fern)
   - Parametric palm fronds for the layered jungle backdrop
   - Parallax, sway, scroll-reveal, nav
   ════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

  /* ── leaf lens shape pointing along +x from origin ── */
  function leafPath(len, wid) {
    return `M0 0 C ${len * 0.26} ${-wid}, ${len * 0.74} ${-wid}, ${len} 0 ` +
           `C ${len * 0.74} ${wid}, ${len * 0.26} ${wid}, 0 0 Z`;
  }

  /* ── parametric palm frond → svg markup ──
     Returns an <svg> string. Frond base sits at bottom-centre, tip near top. */
  function makeFrond(opts) {
    const o = Object.assign({
      w: 220, h: 340, leaflets: 13, color: '#2d6a4f',
      vein: 'rgba(0,0,0,0.18)', curve: 60, spread: 52, leafScale: 1, opacity: 1,
    }, opts);
    const W = o.w, H = o.h;
    const P0 = { x: W * 0.5, y: H * 0.98 };          // base
    const P1 = { x: W * 0.5 + o.curve, y: H * 0.42 };// control
    const P2 = { x: W * 0.5 + o.curve * 1.15, y: H * 0.04 }; // tip
    const bez = (t) => ({
      x: (1 - t) * (1 - t) * P0.x + 2 * (1 - t) * t * P1.x + t * t * P2.x,
      y: (1 - t) * (1 - t) * P0.y + 2 * (1 - t) * t * P1.y + t * t * P2.y,
    });
    let parts = [];
    // rachis (stem)
    parts.push(`<path d="M${P0.x} ${P0.y} Q ${P1.x} ${P1.y} ${P2.x} ${P2.y}" ` +
      `fill="none" stroke="${o.color}" stroke-width="3" stroke-linecap="round"/>`);
    const n = o.leaflets;
    for (let i = 1; i <= n; i++) {
      const t = 0.06 + (i / (n + 1)) * 0.92;
      const p = bez(t), p2 = bez(Math.min(0.999, t + 0.012));
      const tan = Math.atan2(p2.y - p.y, p2.x - p.x) * 180 / Math.PI;
      const taper = Math.sin(Math.PI * Math.min(1, t * 1.05));   // longest mid-frond
      const len = (18 + taper * (W * 0.34)) * o.leafScale;
      const wid = (4 + taper * 7) * o.leafScale;
      const d = leafPath(len, wid);
      // two leaflets, mirrored across the rachis
      parts.push(`<path d="${d}" fill="${o.color}" transform="translate(${p.x} ${p.y}) rotate(${tan - o.spread})"/>`);
      parts.push(`<path d="${d}" fill="${o.color}" transform="translate(${p.x} ${p.y}) rotate(${tan + o.spread})"/>`);
    }
    return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" ` +
      `xmlns="http://www.w3.org/2000/svg" style="opacity:${o.opacity}">${parts.join('')}</svg>`;
  }

  /* ── big single banana/monstera leaf → svg markup ── */
  function makeLeaf(opts) {
    const o = Object.assign({ w: 240, h: 300, color: '#1b3d2a', vein: 'rgba(0,0,0,0.18)', opacity: 1 }, opts);
    const W = o.w, H = o.h, cx = W / 2;
    const body = `M${cx} ${H * 0.98} C ${W * 0.04} ${H * 0.62}, ${W * 0.10} ${H * 0.16}, ${cx} ${H * 0.02} ` +
                 `C ${W * 0.90} ${H * 0.16}, ${W * 0.96} ${H * 0.62}, ${cx} ${H * 0.98} Z`;
    let veins = `<path d="M${cx} ${H * 0.96} L ${cx} ${H * 0.06}" stroke="${o.vein}" stroke-width="2.4" fill="none"/>`;
    for (let i = 1; i <= 6; i++) {
      const ty = H * (0.92 - i * 0.13);
      const sp = (1 - i / 8) * W * 0.4;
      veins += `<path d="M${cx} ${ty + H * 0.05} Q ${cx - sp * 0.5} ${ty} ${cx - sp} ${ty - H * 0.05}" stroke="${o.vein}" stroke-width="1.4" fill="none"/>`;
      veins += `<path d="M${cx} ${ty + H * 0.05} Q ${cx + sp * 0.5} ${ty} ${cx + sp} ${ty - H * 0.05}" stroke="${o.vein}" stroke-width="1.4" fill="none"/>`;
    }
    return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" ` +
      `xmlns="http://www.w3.org/2000/svg" style="opacity:${o.opacity}">` +
      `<path d="${body}" fill="${o.color}"/>${veins}</svg>`;
  }

  /* ════════════════════════════════════════════════════════════════
     BACKDROP — layered fronds with parallax
     ════════════════════════════════════════════════════════════════ */
  // corner-anchored frond presets per .sec-foliage[data-foliage]
  const PRESETS = {
    hero: [
      { c: 'bl', size: 380, rot: -12, tone: 'deep', depth: 0.05, op: 0.85 },
      { c: 'br', size: 440, rot: 14,  tone: 'deep', depth: 0.06, op: 0.85, flip: true },
      { c: 'br', size: 240, rot: 30,  tone: 'leaf', depth: 0.13, op: 0.8,  flip: true },
      { c: 'tr', size: 300, rot: 200, tone: 'leaf', depth: 0.09, op: 0.45 },
      { c: 'tl', size: 260, rot: 165, tone: 'deep', depth: 0.07, op: 0.45, flip: true },
    ],
    corners: [
      { c: 'bl', size: 320, rot: -14, tone: 'leaf', depth: 0.07, op: 0.5 },
      { c: 'tr', size: 290, rot: 196, tone: 'mid',  depth: 0.09, op: 0.4 },
    ],
    frame: [
      { c: 'bl', size: 250, rot: -18, tone: 'leaf', depth: 0.06, op: 0.42 },
      { c: 'br', size: 250, rot: 18,  tone: 'leaf', depth: 0.06, op: 0.42, flip: true },
      { c: 'tl', size: 190, rot: 162, tone: 'sage', depth: 0.08, op: 0.3, flip: true },
      { c: 'tr', size: 190, rot: 198, tone: 'sage', depth: 0.08, op: 0.3 },
    ],
    footer: [
      { c: 'br', size: 180, rot: 16, tone: 'leaf', depth: 0.04, op: 0.4, flip: true },
      { c: 'bl', size: 130, rot: -14, tone: 'mid', depth: 0.05, op: 0.32 },
    ],
  };

  let frondEntries = [];
  function buildBackdrop() {
    frondEntries = [];
    const T = {
      deep: css('--leaf-deep') || '#173524', leaf: css('--leaf') || '#2d6a4f',
      mid:  css('--leaf-mid')  || '#4a8568', sage: css('--sage') || '#7ba892',
    };
    document.querySelectorAll('.sec-foliage').forEach((layer) => {
      layer.innerHTML = '';
      const preset = PRESETS[layer.dataset.foliage] || PRESETS.corners;
      const host = layer.parentElement;
      preset.forEach((s, i) => {
        const v = s.c[0], h = s.c[1];
        const origin = (h === 'l' ? '0%' : '100%') + ' ' + (v === 'b' ? '100%' : '0%');
        const e = Math.round(s.size * 0.22);

        const outer = document.createElement('div');   // parallax (translateY)
        outer.className = 'frond';
        outer.style.width = s.size + 'px';
        if (h === 'l') outer.style.left = -e + 'px'; else outer.style.right = -e + 'px';
        if (v === 'b') outer.style.bottom = -e + 'px'; else outer.style.top = -e + 'px';

        const baseEl = document.createElement('div');   // static base rotation
        baseEl.className = 'frond-base';
        baseEl.style.setProperty('--origin', origin);
        baseEl.style.transform = `rotate(${s.rot}deg)` + (s.flip ? ' scaleX(-1)' : '');

        const swayEl = document.createElement('div');    // ambient sway
        swayEl.className = 'frond-sway living' + (i % 2 ? ' alt' : '');
        swayEl.style.setProperty('--origin', origin);
        swayEl.style.setProperty('--dur', (8 + (i % 4) * 1.5) + 's');
        swayEl.innerHTML = makeFrond({ w: s.size, h: s.size * 1.5, color: T[s.tone], opacity: s.op, leaflets: 14 });

        baseEl.appendChild(swayEl);
        outer.appendChild(baseEl);
        layer.appendChild(outer);
        frondEntries.push({ el: outer, depth: s.depth, host });
      });
    });
  }

  // parallax — drift each frond by its host section's position, scaled by depth
  let ticking = false;
  function parallax() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      frondEntries.forEach((f) => {
        const r = f.host.getBoundingClientRect();
        f.el.style.transform = `translateY(${r.top * f.depth}px)`;
      });
      ticking = false;
    });
  }

  /* ════════════════════════════════════════════════════════════════
     BARNSLEY FERN — the fractal that draws a fern
     ════════════════════════════════════════════════════════════════ */
  function growFern() {
    const canvas = document.getElementById('fern-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, dpr;

    function size() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = canvas.getBoundingClientRect();
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();

    const gold = css('--gold') || '#e0a458';
    const sage = css('--sage') || '#7ba892';
    const leaf = css('--leaf-mid') || '#4a8568';

    function lerpColor(a, b, t) {
      const pa = a.match(/\w\w/g).map((h) => parseInt(h, 16));
      const pb = b.match(/\w\w/g).map((h) => parseInt(h, 16));
      const c = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
      return `rgb(${c[0]},${c[1]},${c[2]})`;
    }
    const G = gold.replace('#', ''), S = sage.replace('#', ''), L = leaf.replace('#', '');

    // fern coords: x∈[-2.18,2.66], y∈[0,9.99]
    let x = 0, y = 0;
    const TOTAL = 62000, PER_FRAME = 1400;
    let drawn = 0;

    function map(px, py) {
      const sx = W * 0.5 + (px / 5.6) * W * 0.94;
      const sy = H - (py / 10.1) * H * 0.97 - H * 0.015;
      return [sx, sy];
    }

    function step() {
      for (let i = 0; i < PER_FRAME && drawn < TOTAL; i++, drawn++) {
        const r = Math.random();
        let nx, ny;
        if (r < 0.01) { nx = 0; ny = 0.16 * y; }
        else if (r < 0.86) { nx = 0.85 * x + 0.04 * y; ny = -0.04 * x + 0.85 * y + 1.6; }
        else if (r < 0.93) { nx = 0.20 * x - 0.26 * y; ny = 0.23 * x + 0.22 * y + 1.6; }
        else { nx = -0.15 * x + 0.28 * y; ny = 0.26 * x + 0.24 * y + 0.44; }
        x = nx; y = ny;
        const [sx, sy] = map(x, y);
        const t = Math.min(1, y / 10);                 // height → colour
        const col = t > 0.5 ? lerpColor(L, G, (t - 0.5) * 2) : lerpColor(S, L, t * 2);
        ctx.fillStyle = col;
        ctx.globalAlpha = 0.55 + t * 0.35;
        const s = 0.9 + t * 0.7;
        ctx.fillRect(sx, sy, s, s);
      }
      if (drawn < TOTAL) requestAnimationFrame(step);
    }
    // small delay so the fern "grows" after paint
    setTimeout(step, 250);

    let rT;
    if (window.__fernResize) window.removeEventListener('resize', window.__fernResize);
    window.__fernResize = () => {
      clearTimeout(rT);
      rT = setTimeout(() => { x = 0; y = 0; drawn = 0; ctx.clearRect(0, 0, W, H); size(); step(); }, 220);
    };
    window.addEventListener('resize', window.__fernResize);
  }

  /* ════════════════════════════════════════════════════════════════
     REVEAL + NAV
     ════════════════════════════════════════════════════════════════ */
  function reveals() {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });
    els.forEach((el) => io.observe(el));
    // ensure first paint reveals above-the-fold
    setTimeout(() => document.querySelectorAll('#inicio .reveal').forEach((el) => el.classList.add('visible')), 200);
  }

  function nav() {
    const n = document.querySelector('nav');
    if (!n) return;
    const onScroll = () => {
      const s = window.scrollY > 40;
      n.style.boxShadow = s ? '0 8px 30px rgba(8,18,12,0.35)' : 'none';
      n.style.background = s ? 'rgba(9,21,15,0.82)' : 'rgba(11,26,18,0.55)';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function init() {
    buildBackdrop();
    window.addEventListener('scroll', parallax, { passive: true });
    parallax();
    growFern();
    reveals();
    nav();
  }

  // allow the Tweaks panel to recolour everything after a palette swap
  window.FOLIAGE = {
    rebuild() {
      buildBackdrop();
      parallax();
      growFern();
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
