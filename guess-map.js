/* Map-pick for the location guess. The China map is pre-projected SVG (china-map.js);
   pan/zoom only rewrites transforms per frame: while zooming the already-rasterised SVG is
   GPU-scaled, and it is re-rendered at the exact size once the zoom settles. Labels and pins are
   a small set of absolutely positioned nodes, and nothing runs while the map is idle. City boundaries
   (china-cities.js) load only the first time the player zooms in far enough to see them. */
(() => {
  'use strict';
  const M = window.CHINA_MAP;
  const NS = 'http://www.w3.org/2000/svg';
  const rad = Math.PI / 180;
  const MAX_ZOOM = 10, TAP_SLOP = 7;
  const SETTLE_MS = 140;   // quiet time after the last zoom step before the SVG is re-rendered sharp
  const MAX_STRETCH = 3;   // re-render mid-gesture beyond this GPU scale, before it turns too blurry
  const WINDOW = .4;       // the SVG only draws the viewport plus this fraction of it on every side
  const EXT = M.ext;       // neighbouring countries are baked this far around the mainland
  const NAME_ZOOM = 1.9;   // provincial capitals get their names
  const CITY_ZOOM = 3.2;   // prefecture-level boundaries appear
  const KM_PER_UNIT = 6371 / M.proj.k;
  // Map data keys stay Chinese (hit-testing, data-p/data-c); only the drawn text is translated.
  // Latin labels run about half a CJK character's width per letter, which the collision boxes follow.
  const label = name => window.I18N.place(name);
  const labelWidth = (name, perChar) => window.I18N.isEn() ? label(name).length * perChar * .56 : name.length * perChar;
  const SMALL_PROVINCES = new Set(['北京', '天津', '上海', '香港', '澳门', '宁夏', '海南', '台湾']);
  const ease = t => t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const version = (document.currentScript?.src.match(/\?v=[^&]+/) || [''])[0];

  // Inverse / forward Albers (same constants the build script used).
  function toLatLng(x, y) {
    const { lon0, n, C, rho0, k, minX, maxY, pad } = M.proj;
    const px = (x - pad) / k + minX, py = maxY - (y - pad) / k;
    const rho = Math.hypot(px, rho0 - py), theta = Math.atan2(px, rho0 - py);
    const lat = Math.asin(Math.max(-1, Math.min(1, (C - (rho * n) ** 2) / (2 * n)))) / rad;
    return { lat, lng: lon0 + theta / n / rad };
  }
  function toXY(lat, lng) {
    const { lon0, n, C, rho0, k, minX, maxY, pad } = M.proj;
    const rho = Math.sqrt(C - 2 * n * Math.sin(lat * rad)) / n, t = n * (lng - lon0) * rad;
    return { x: (rho * Math.sin(t) - minX) * k + pad, y: (maxY - (rho0 - rho * Math.cos(t))) * k + pad };
  }
  const inInset = (x, y) => x >= M.inset.x && x <= M.inset.x + M.inset.w && y >= M.inset.y && y <= M.inset.y + M.inset.h;

  let cityData;
  function loadCities() {
    if (window.CHINA_CITIES) return Promise.resolve(window.CHINA_CITIES);
    cityData ||= new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `china-cities.js${version}`; script.async = true;
      script.onload = () => resolve(window.CHINA_CITIES);
      script.onerror = () => { cityData = null; reject(new Error('city layer unavailable')); };
      document.head.append(script);
    });
    return cityData;
  }

  // Which province and prefecture-level city contain a map point, whatever the current zoom.
  // Municipalities, SARs and Taiwan have no city breakdown: the province is the city.
  let hitCtx, provincePaths, cityPaths;
  async function locate({ x, y }) {
    hitCtx ||= document.createElement('canvas').getContext('2d');
    provincePaths ||= M.provinces.map(p => ({ name: p.name, path: new Path2D(p.d) }));
    const province = provincePaths.find(p => hitCtx.isPointInPath(p.path, x, y))?.name || '';
    if (!province) return { province: '', city: '' };
    const data = await loadCities().catch(() => null);
    const group = data?.find(p => p.p === province);
    if (!group) return { province, city: data ? province : '' };
    cityPaths ||= new Map();
    if (!cityPaths.has(province)) cityPaths.set(province, group.cities.map(([name, d]) => ({ name, path: new Path2D(d) })));
    return { province, city: cityPaths.get(province).find(c => hitCtx.isPointInPath(c.path, x, y))?.name || '' };
  }

  // Static markup, shared by the interactive map and the small result map.
  // Order: grey neighbouring countries → coastal glow → pastel provinces (white borders) → cities → crisp national outline.
  function svgMarkup({ viewBox = `0 0 ${M.w} ${M.h}`, extra = '', inset = true } = {}) {
    const i = M.inset;
    return `<svg class="gm-svg" xmlns="${NS}" viewBox="${viewBox}" aria-hidden="true" focusable="false">`
      + `<g class="gm-world">${M.world.map(d => `<path d="${d}"/>`).join('')}</g>`
      + `<path class="gm-glow" d="${M.outline}"/>`
      + `<g class="gm-land">${M.provinces.map(p => `<path data-p="${p.name}" class="c${p.c}" d="${p.d}"/>`).join('')}</g>`
      + `<path class="gm-outline" d="${M.outline}"/>`
      + `<path class="gm-dash" d="${M.dashes}"/>`
      + (inset ? `<g class="gm-inset"><clipPath id="gm-inset-clip"><rect x="${i.x}" y="${i.y}" width="${i.w}" height="${i.h}" rx="12"/></clipPath>`
        + `<rect class="gm-inset-bg" x="${i.x}" y="${i.y}" width="${i.w}" height="${i.h}" rx="12"/>`
        + `<g clip-path="url(#gm-inset-clip)"><path class="gm-inset-land" d="${i.land}"/><path class="gm-dash" d="${i.dashes}"/></g>`
        + `<text x="${i.x + i.w - 14}" y="${i.y + i.h - 16}" text-anchor="end">${label('南海诸岛')}</text></g>` : '')
      + `<path class="gm-pick"/>` + extra + `</svg>`;
  }
  const niceKm = [5, 10, 20, 50, 100, 200, 300, 500, 1000];

  class GuessMap {
    // insets() returns the space covered by the header and bottom card; re-read on every fit.
    // avoid: the challenge destinations ({name, lat, lng}); their labels are never drawn, so the map can't give the answer away.
    constructor(root, { onPick, onReject, insets = () => ({}), avoid = [] } = {}) {
      this.root = root; this.onPick = onPick; this.onReject = onReject;
      this.measure = insets; this.insets = { top: 0, bottom: 0 };
      this.z = 1; this.tx = 0; this.ty = 0; this.pin = null; this.locked = false; this.revealing = false;
      this.pointers = new Map(); this.frame = 0; this.anim = 0; this.lastScaleZ = 0; this.lastS = 0;
      root.classList.add('gm');
      const near = (x, y) => avoid.some(c => { const p = toXY(c.lat, c.lng); return Math.hypot(p.x - x, p.y - y) * KM_PER_UNIT < 40; });
      const secret = new Set(avoid.map(c => c.name));
      const provinces = M.provinces.map(p => `<span class="gm-prov${SMALL_PROVINCES.has(p.name) ? ' small' : ''}${secret.has(p.name) ? ' secret' : ''}">${label(p.name)}</span>`).join('');
      const capitals = M.labels.map(([name, x, y, level]) => `<span class="gm-cap${level === 0 ? ' national' : ''}${near(x, y) || secret.has(name) ? ' secret' : ''}"><b>${label(name)}</b></span>`).join('');
      // Map and labels are two composited layers: the map may be GPU-scaled mid-zoom, the labels never are.
      const nations = M.nations.map(([name, , , small]) => `<span class="gm-nation${small ? ' small' : ''}">${label(name)}</span>`).join('');
      root.innerHTML = `<div class="gm-plane">${svgMarkup({ extra: '<line class="gm-line" x1="0" y1="0" x2="0" y2="0"/>' })}</div>`
        + `<div class="gm-marks">${nations}${capitals}${provinces}<span class="gm-dist" hidden></span>`
        + `<span class="gm-pin guess" hidden><i></i></span><span class="gm-pin answer" hidden><i></i><em class="gm-tag"></em></span></div>`
        + `<div class="gm-overlay"><span class="gm-scale"><i></i><small></small></span></div>`;
      this.plane = root.querySelector('.gm-plane'); this.marks = root.querySelector('.gm-marks'); this.svg = root.querySelector('svg');
      this.line = root.querySelector('.gm-line'); this.pick = root.querySelector('.gm-pick');
      this.provs = [...root.querySelectorAll('.gm-prov')].map((el, i) => ({ el, x: M.provinces[i].lx, y: M.provinces[i].ly, small: SMALL_PROVINCES.has(M.provinces[i].name), w: labelWidth(M.provinces[i].name, 14) + 8 }));
      this.nations = [...root.querySelectorAll('.gm-nation')].map((el, i) => ({ el, x: M.nations[i][1], y: M.nations[i][2], small: !!M.nations[i][3], w: labelWidth(M.nations[i][0], 13.5) }));
      this.caps = [...root.querySelectorAll('.gm-cap')].map((el, i) => ({ el, x: M.labels[i][1], y: M.labels[i][2], w: labelWidth(M.labels[i][0], 11) + 10, secret: el.classList.contains('secret') }));
      this.guessEl = root.querySelector('.gm-pin.guess'); this.answerEl = root.querySelector('.gm-pin.answer');
      this.distEl = root.querySelector('.gm-dist'); this.scaleEl = root.querySelector('.gm-scale');
      this.handlers = {
        down: e => this.down(e), move: e => this.move(e), up: e => this.up(e),
        wheel: e => this.wheel(e), resize: () => this.fit(true)
      };
      root.addEventListener('pointerdown', this.handlers.down);
      root.addEventListener('pointermove', this.handlers.move);
      root.addEventListener('pointerup', this.handlers.up);
      root.addEventListener('pointercancel', this.handlers.up);
      root.addEventListener('wheel', this.handlers.wheel, { passive: false });
      this.observer = new ResizeObserver(this.handlers.resize); this.observer.observe(root);
      this.fit();
      // City boundaries are built (hidden) while the player looks at the map, not mid-zoom.
      this.idle = (window.requestIdleCallback || (f => setTimeout(f, 400)))(() => this.attachCities(), { timeout: 2000 });
    }
    destroy() {
      this.dead = true; this.revealing = false; this.clearGesture();
      cancelAnimationFrame(this.frame); cancelAnimationFrame(this.anim); clearTimeout(this.wheelEnd); clearTimeout(this.settleTimer); (window.cancelIdleCallback || clearTimeout)(this.idle); this.observer.disconnect();
      this.root.removeEventListener('pointerdown', this.handlers.down);
      this.root.removeEventListener('pointermove', this.handlers.move);
      this.root.removeEventListener('pointerup', this.handlers.up);
      this.root.removeEventListener('pointercancel', this.handlers.up);
      this.root.removeEventListener('wheel', this.handlers.wheel);
    }
    // Base size: the whole country fits between the header and the bottom card.
    fit(keepView) {
      const w = this.root.clientWidth, h = this.root.clientHeight;
      if (!w || !h) return;
      this.insets = { top: 0, bottom: 0, ...this.measure() };
      const availH = Math.max(120, h - this.insets.top - this.insets.bottom);
      const prev = this.base, base = Math.min((w - 16) / M.w, availH / M.h);
      this.base = base; this.vw = w; this.vh = h;
      if (keepView && prev) { this.tx = w / 2 - (w / 2 - this.tx) * base / prev; this.ty = h / 2 - (h / 2 - this.ty) * base / prev; }
      else { this.z = 1; this.tx = (w - M.w * base) / 2; this.ty = this.insets.top + (availH - M.h * base) / 2; }
      this.clamp(); this.apply();
    }
    remeasure() { this.insets = { top: 0, bottom: 0, ...this.measure() }; }
    clamp() {
      const s = this.base * this.z, mw = M.w * s, mh = M.h * s, slack = 60;
      const top = this.insets.top, bottom = this.vh - this.insets.bottom;
      const fitX = (this.vw - mw) / 2, fitY = top + (bottom - top - mh) / 2;
      this.tx = mw <= this.vw ? fitX : Math.min(slack, Math.max(this.vw - mw - slack, this.tx));
      this.ty = mh <= bottom - top ? fitY : Math.min(top + slack, Math.max(bottom - mh - slack, this.ty));
    }
    schedule() { if (!this.frame) this.frame = requestAnimationFrame(() => { this.frame = 0; this.apply(); }); }
    at(el, x, y) { const s = this.base * this.z; el.style.transform = `translate(${x * s}px,${y * s}px)`; }
    apply() {
      const s = this.base * this.z;
      // Re-rendering the SVG re-rasterises every province, city and neighbour path, too slow per frame.
      // Mid-zoom the rendered map is stretched instead and re-rendered once the zoom settles; a pan
      // only re-renders when it runs past the drawn window.
      if (!this.rs || s / this.rs > MAX_STRETCH || this.rs / s > MAX_STRETCH || !this.covers(s)) this.render(s);
      const k = s / this.rs, w = this.win;
      this.plane.style.transform = `translate3d(${this.tx + w.x0 * s}px,${this.ty + w.y0 * s}px,0)${k === 1 ? '' : ` scale(${k})`}`;
      this.marks.style.transform = `translate3d(${this.tx}px,${this.ty}px,0)`;
      this.updateScale();
      if (s === this.lastS) return; // pure pan: done
      this.lastS = s; this.placeMarks(s);
      clearTimeout(this.settleTimer);
      if (k !== 1) this.settleTimer = setTimeout(() => this.settle(), SETTLE_MS);
    }
    // The part of the map on screen, in map units, limited to what is baked.
    visible(s) {
      const x0 = -this.tx / s, y0 = -this.ty / s;
      return { x0: Math.max(-EXT, x0), y0: Math.max(-EXT, y0), x1: Math.min(M.w + EXT, x0 + this.vw / s), y1: Math.min(M.h + EXT, y0 + this.vh / s) };
    }
    covers(s) {
      const w = this.win, v = this.visible(s);
      return !!w && v.x0 >= w.x0 - .5 && v.y0 >= w.y0 - .5 && v.x1 <= w.x1 + .5 && v.y1 <= w.y1 + .5;
    }
    // Only the viewport plus a margin is drawn (viewBox + clip), so the raster cost is the same at
    // every zoom. Strokes stay hairline-crisp because the SVG is sized in CSS pixels, never scaled, once settled.
    render(s) {
      const mx = this.vw / s * WINDOW, my = this.vh / s * WINDOW, x0 = -this.tx / s, y0 = -this.ty / s;
      const w = { x0: Math.max(-EXT, x0 - mx), y0: Math.max(-EXT, y0 - my), x1: Math.min(M.w + EXT, x0 + this.vw / s + mx), y1: Math.min(M.h + EXT, y0 + this.vh / s + my) };
      this.rs = s; this.win = w;
      this.svg.setAttribute('viewBox', `${w.x0} ${w.y0} ${w.x1 - w.x0} ${w.y1 - w.y0}`);
      this.svg.style.width = `${(w.x1 - w.x0) * s}px`; this.svg.style.height = `${(w.y1 - w.y0) * s}px`;
    }
    settle() {
      if (this.dead) return;
      const s = this.base * this.z;
      if (s === this.rs) return;
      this.render(s); this.plane.style.transform = `translate3d(${this.tx + this.win.x0 * s}px,${this.ty + this.win.y0 * s}px,0)`;
    }
    placeMarks(s = this.base * this.z) {
      const named = this.z >= NAME_ZOOM, cities = this.z >= CITY_ZOOM;
      this.root.classList.toggle('named', named);
      this.root.classList.toggle('detail', this.z >= 2.2);
      this.root.classList.toggle('cities', cities && !!this.cityLayer);
      if (cities && !this.cityLayer) this.attachCities();
      for (const n of this.nations) this.at(n.el, n.x, n.y);
      for (const c of this.caps) this.at(c.el, c.x, c.y);
      const boxes = named ? this.declutter(s) : [], placed = [], latin = window.I18N.isEn();
      for (const p of this.provs) {
        if (p.small && this.z < 2.2) continue;
        this.at(p.el, p.x, p.y);
        // Once capitals are named, a province name that would sit on one gives way (cheap box test).
        const px = p.x * s, py = p.y * s;
        const clash = named && this.caps.some(c => { if (c.secret) return false; const cx = c.x * s; return Math.abs(c.y * s - py) < 16 && cx - 4 < px + p.w / 2 && cx + c.w > px - p.w / 2; })
          // English province names are two to three times wider than Chinese ones; later ones give way until zoomed in.
          || (latin && placed.some(b => px - p.w / 2 < b.x1 && px + p.w / 2 > b.x0 && py - 9 < b.y1 && py + 9 > b.y0));
        if (clash !== p.clash) { p.clash = clash; p.el.classList.toggle('clash', clash); }
        if (!clash) { const box = { x0: px - p.w / 2, x1: px + p.w / 2, y0: py - 9, y1: py + 9 }; boxes.push(box); placed.push(box); }
      }
      // Country names give way to any Chinese province or city name they would cover.
      for (const n of this.nations) {
        if (n.small && this.z < 2.2) continue;
        const nx = n.x * s, ny = n.y * s;
        const hush = boxes.some(b => nx - n.w / 2 < b.x1 && nx + n.w / 2 > b.x0 && ny - 9 < b.y1 && ny + 9 > b.y0);
        if (hush !== n.hush) { n.hush = hush; n.el.classList.toggle('hush', hush); }
      }
      if (this.pin) this.at(this.guessEl, this.pin.x, this.pin.y);
      if (this.answer) {
        this.at(this.answerEl, this.answer.x, this.answer.y);
        this.at(this.distEl, (this.answer.x + this.pin.x) / 2, (this.answer.y + this.pin.y) / 2);
        // Pins nearly on top of each other: the card already shows the distance.
        this.distEl.classList.toggle('tight', Math.hypot(this.answer.x - this.pin.x, this.answer.y - this.pin.y) * s < 80);
      }
    }
    // Capital names never overlap: in priority order each takes the right side, else the left, else hides.
    declutter(s) {
      const placed = [], hit = b => placed.some(o => b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0);
      for (const c of this.caps) if (!c.secret) placed.push({ x0: c.x * s - 4, x1: c.x * s + 4, y0: c.y * s - 4, y1: c.y * s + 4 });
      for (const c of this.caps) {
        if (c.secret) continue;
        const cx = c.x * s, cy = c.y * s, w = c.w - 6, y0 = cy - 8, y1 = cy + 8;
        const right = { x0: cx + 5, x1: cx + 5 + w, y0, y1 }, left = { x0: cx - 5 - w, x1: cx - 5, y0, y1 };
        const side = !hit(right) ? right : !hit(left) ? left : null;
        if (side) placed.push(side);
        const flip = side === left, hush = !side;
        if (flip !== c.flip) { c.flip = flip; c.el.classList.toggle('flip', flip); }
        if (hush !== c.hush) { c.hush = hush; c.el.classList.toggle('hush', hush); }
      }
      return placed;
    }
    // Live scale bar: a round distance that spans 40–110px at the current zoom.
    updateScale() {
      const top = this.vh - this.insets.bottom - 30;
      this.scaleEl.style.transform = `translate3d(16px,${top}px,0)`;
      if (this.z === this.lastScaleZ) return;
      this.lastScaleZ = this.z;
      const kmPerPx = KM_PER_UNIT / (this.base * this.z);
      const km = niceKm.find(v => v / kmPerPx >= 40) || niceKm.at(-1);
      this.scaleEl.firstChild.style.width = `${Math.round(km / kmPerPx)}px`;
      this.scaleEl.lastChild.textContent = `${km} km`;
    }
    attachCities() {
      if (this.cityRequested) return;
      this.cityRequested = true;
      loadCities().then(data => {
        if (this.dead) return;
        const markup = data.map(p => `<g data-p="${p.p}">${p.cities.map(([name, d]) => `<path data-c="${name}" d="${d}"/>`).join('')}</g>`).join('');
        this.svg.querySelector('.gm-land').insertAdjacentHTML('afterend', `<g class="gm-cities">${markup}</g>`);
        this.cityLayer = true; this.placeMarks();
      }).catch(() => { this.cityRequested = false; });
    }
    moving(on) { if (on !== this.isMoving) { this.isMoving = on; this.root.parentElement?.classList.toggle('moving', on); } }
    clearGesture() {
      clearTimeout(this.wheelEnd);
      for (const id of this.pointers.keys()) if (this.root.hasPointerCapture?.(id)) this.root.releasePointerCapture(id);
      this.pointers.clear(); this.gesture = this.pinch = null;
      this.root.classList.remove('dragging'); this.moving(false);
    }
    local(e) { const r = this.root.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    toMap(pt) { const s = this.base * this.z; return { x: (pt.x - this.tx) / s, y: (pt.y - this.ty) / s }; }
    zoomAt(pt, z) {
      const nz = Math.max(1, Math.min(MAX_ZOOM, z)), m = this.toMap(pt);
      this.z = nz; const s = this.base * nz;
      this.tx = pt.x - m.x * s; this.ty = pt.y - m.y * s; this.clamp(); this.schedule();
    }
    zoomBy(factor) {
      if (this.dead || this.revealing) return;
      const pt = { x: this.vw / 2, y: this.insets.top + (this.vh - this.insets.top - this.insets.bottom) / 2 };
      const from = { z: this.z, tx: this.tx, ty: this.ty };
      this.zoomAt(pt, this.z * factor);
      const to = { z: this.z, tx: this.tx, ty: this.ty };
      Object.assign(this, from); this.animate(to, 260);
    }
    animate(to, duration, done) {
      if (this.dead) return;
      cancelAnimationFrame(this.anim);
      const from = { z: this.z, tx: this.tx, ty: this.ty }, t0 = performance.now();
      if (reduced() || duration <= 0) { Object.assign(this, to); this.apply(); done?.(); return; }
      const step = now => {
        if (this.dead) return;
        const t = Math.min(1, (now - t0) / duration), e = ease(t);
        this.z = from.z + (to.z - from.z) * e; this.tx = from.tx + (to.tx - from.tx) * e; this.ty = from.ty + (to.ty - from.ty) * e;
        this.apply();
        if (t < 1) this.anim = requestAnimationFrame(step); else { this.anim = 0; done?.(); }
      };
      this.anim = requestAnimationFrame(step);
    }

    down(e) {
      if (this.dead || this.revealing || e.button > 0) return;
      cancelAnimationFrame(this.anim); this.anim = 0;
      this.root.setPointerCapture?.(e.pointerId);
      this.pointers.set(e.pointerId, this.local(e)); this.moving(true);
      if (this.pointers.size === 1) { this.gesture = { start: this.local(e), t: performance.now(), moved: false, last: this.local(e), lastT: performance.now(), vx: 0, vy: 0 }; }
      else { this.gesture.moved = true; this.pinch = this.pinchState(); }
    }
    pinchState() {
      const [a, b] = [...this.pointers.values()];
      return { dist: Math.hypot(a.x - b.x, a.y - b.y) || 1, mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, z: this.z, tx: this.tx, ty: this.ty };
    }
    move(e) {
      if (!this.pointers.has(e.pointerId)) return;
      const pt = this.local(e); this.pointers.set(e.pointerId, pt);
      const g = this.gesture; if (!g) return;
      if (this.pointers.size >= 2 && this.pinch) {
        const [a, b] = [...this.pointers.values()], p = this.pinch;
        const dist = Math.hypot(a.x - b.x, a.y - b.y), mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        const z = Math.max(1, Math.min(MAX_ZOOM, p.z * dist / p.dist)), s0 = this.base * p.z, s = this.base * z;
        const mx = (p.mid.x - p.tx) / s0, my = (p.mid.y - p.ty) / s0;
        this.z = z; this.tx = mid.x - mx * s; this.ty = mid.y - my * s; this.clamp(); this.schedule();
        return;
      }
      if (!g.moved && Math.hypot(pt.x - g.start.x, pt.y - g.start.y) < TAP_SLOP) return;
      if (!g.moved) this.root.classList.add('dragging');
      g.moved = true;
      const now = performance.now(), dt = Math.max(1, now - g.lastT);
      g.vx = (pt.x - g.last.x) / dt; g.vy = (pt.y - g.last.y) / dt;
      this.tx += pt.x - g.last.x; this.ty += pt.y - g.last.y; g.last = pt; g.lastT = now;
      this.clamp(); this.schedule();
    }
    up(e) {
      if (!this.pointers.has(e.pointerId)) return;
      this.pointers.delete(e.pointerId);
      const g = this.gesture;
      if (this.pointers.size === 1) { const [p] = this.pointers.values(); this.pinch = null; if (g) { g.last = p; g.lastT = performance.now(); g.vx = g.vy = 0; } return; }
      if (this.pointers.size) return;
      this.root.classList.remove('dragging'); this.pinch = null; this.gesture = null;
      if (!g) { this.moving(false); return; }
      if (!g.moved && e.type === 'pointerup' && performance.now() - g.t < 600) { this.moving(false); this.tap(e); return; }
      // Short glide after a flick; stops as soon as the speed is negligible.
      let { vx, vy } = g; if (performance.now() - g.lastT > 80 || reduced()) { this.moving(false); return; }
      let last = performance.now();
      const glide = now => {
        const dt = now - last; last = now; vx *= .92 ** (dt / 16); vy *= .92 ** (dt / 16);
        this.tx += vx * dt; this.ty += vy * dt; this.clamp(); this.apply();
        if (Math.hypot(vx, vy) > .02) this.anim = requestAnimationFrame(glide); else { this.anim = 0; this.moving(false); }
      };
      this.anim = requestAnimationFrame(glide);
    }
    wheel(e) {
      e.preventDefault();
      if (this.dead || this.revealing) return;
      cancelAnimationFrame(this.anim); this.anim = 0;
      this.moving(true); clearTimeout(this.wheelEnd); this.wheelEnd = setTimeout(() => this.moving(false), 180);
      this.zoomAt(this.local(e), this.z * Math.exp(-Math.max(-60, Math.min(60, e.deltaY)) * .004));
    }
    tap(e) {
      if (this.locked) return;
      const m = this.toMap(this.local(e));
      if (inInset(m.x, m.y) || m.x < 0 || m.y < 0 || m.x > M.w || m.y > M.h) { this.onReject?.(); return; }
      // The browser already knows which province (or city, once that layer shows) is under the finger.
      const hit = document.elementFromPoint(e.clientX, e.clientY);
      const cityPath = hit?.closest?.('path[data-c]'), provincePath = hit?.closest?.('[data-p]');
      this.setPin(m, provincePath?.dataset.p || '', cityPath?.dataset.c || '');
    }
    setPin(m, province, city = '') {
      this.pin = { x: m.x, y: m.y };
      this.svg.querySelector('.gm-land .picked')?.classList.remove('picked');
      const shape = province ? this.svg.querySelector(`.gm-land path[data-p="${province}"]`) : null; // tapped the sea or abroad: no shape
      shape?.classList.add('picked');
      const outline = (city && this.svg.querySelector(`path[data-c="${city}"]`)) || shape;
      if (outline) this.pick.setAttribute('d', outline.getAttribute('d')); else this.pick.removeAttribute('d');
      this.guessEl.hidden = false; this.at(this.guessEl, m.x, m.y);
      this.guessEl.classList.remove('drop'); void this.guessEl.offsetWidth; this.guessEl.classList.add('drop');
      navigator.vibrate?.(8);
      this.onPick?.({ ...toLatLng(m.x, m.y), x: m.x, y: m.y, province, city });
    }
    // Zoom so both pins sit comfortably inside the free area between the header and the card.
    frameFor(a, g) {
      const pinH = 72, top = this.insets.top + pinH, bottom = this.vh - this.insets.bottom - 46; // pin + name tag above it
      const left = 44, right = this.vw - 44; // zoom buttons fade out during the reveal
      const w = Math.max(80, right - left), h = Math.max(80, bottom - top);
      const minUnits = 140 / KM_PER_UNIT; // even a bull's-eye keeps ~140 km of context
      const dx = Math.max(Math.abs(a.x - g.x), minUnits), dy = Math.max(Math.abs(a.y - g.y), minUnits * h / w);
      const z = Math.max(1, Math.min(MAX_ZOOM, Math.min(w / dx, h / dy) / this.base));
      const s = this.base * z, cx = (a.x + g.x) / 2, cy = (a.y + g.y) / 2;
      if (z === 1) { const saved = { z: this.z, tx: this.tx, ty: this.ty }; this.z = 1; this.clamp(); const fit = { z: 1, tx: this.tx, ty: this.ty }; Object.assign(this, saved); return fit; }
      return { z, tx: (left + right) / 2 - cx * s, ty: (top + bottom) / 2 - cy * s };
    }
    // Frames guess and answer, draws the connecting line, drops the answer pin and labels.
    reveal(answer, { name = '', km } = {}, done) {
      if (this.dead || this.locked) return;
      // Keep framing and line drawing uninterrupted; pan/zoom resumes when both are complete.
      this.locked = true; this.revealing = true; this.clearGesture(); this.root.classList.add('revealed');
      const a = toXY(answer.lat, answer.lng), g = this.pin || a;
      this.line.setAttribute('x1', g.x); this.line.setAttribute('y1', g.y); this.line.setAttribute('x2', g.x); this.line.setAttribute('y2', g.y);
      this.answerEl.querySelector('.gm-tag').textContent = name;
      if (km !== undefined) this.distEl.textContent = `${km} km`;
      this.animate(this.frameFor(a, g), 760, () => {
        const t0 = performance.now(), dur = reduced() ? 0 : 520;
        const draw = now => {
          if (this.dead) return;
          const t = dur ? Math.min(1, (now - t0) / dur) : 1, e = ease(t);
          this.line.setAttribute('x2', g.x + (a.x - g.x) * e); this.line.setAttribute('y2', g.y + (a.y - g.y) * e);
          if (t < 1) { this.anim = requestAnimationFrame(draw); return; }
          this.anim = 0; this.answer = a; this.answerEl.hidden = false; this.answerEl.classList.add('drop');
          this.distEl.hidden = km === undefined; this.placeMarks(); this.revealing = false; done?.();
        };
        this.anim = requestAnimationFrame(draw);
      });
    }
  }

  // Small static map for the result page, cropped around both points.
  function snapshot(guess, answer) {
    const a = toXY(answer.lat, answer.lng), g = guess ? toXY(guess.lat, guess.lng) : a;
    const span = Math.max(Math.abs(a.x - g.x) * 1.7, Math.abs(a.y - g.y) * 1.7 * 1.6, 560), w = span, h = span / 1.6;
    // Neighbouring countries fill the margins, so the crop may extend past the mainland's edge.
    const x = Math.max(-240, Math.min(M.w - w + 240, (a.x + g.x) / 2 - w / 2)), y = Math.max(-200, Math.min(M.h - h + 200, (a.y + g.y) / 2 - h / 2));
    const r = w / 60, sw = w / 260;
    const extra = (guess ? `<line class="gm-line static" x1="${g.x}" y1="${g.y}" x2="${a.x}" y2="${a.y}" stroke-width="${sw}" stroke-dasharray="${sw * 3} ${sw * 2.4}"/>`
      + `<circle class="gm-dot guess" cx="${g.x}" cy="${g.y}" r="${r}" stroke-width="${sw * 1.3}"/>` : '')
      + `<circle class="gm-ring" cx="${a.x}" cy="${a.y}" r="${r * 2.2}"/><circle class="gm-dot answer" cx="${a.x}" cy="${a.y}" r="${r * 1.15}" stroke-width="${sw * 1.3}"/>`;
    // Labels are placed greedily so none overlap each other, the two dots or the country names.
    const fs = w / 34, gap = r * .9, inView = (lx, ly) => lx > x && lx < x + w && ly > y && ly < y + h;
    const placed = [[g.x, g.y, r * 1.4], [a.x, a.y, r * 2.2]].map(([cx, cy, rr]) => ({ x0: cx - rr, x1: cx + rr, y0: cy - rr, y1: cy + rr }));
    const hit = b => b.x0 < x || b.x1 > x + w || b.y0 < y || b.y1 > y + h || placed.some(o => b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0);
    const cities = M.labels.filter(([, lx, ly]) => inView(lx, ly) && Math.hypot(lx - a.x, ly - a.y) > r * 1.6 && Math.hypot(lx - g.x, ly - g.y) > r * 1.4);
    for (const [, lx, ly] of cities) placed.push({ x0: lx - r * .6, x1: lx + r * .6, y0: ly - r * .6, y1: ly + r * .6 });
    const labels = cities.map(([name, lx, ly]) => {
      const tw = labelWidth(name, fs), y0 = ly - fs * .62, y1 = ly + fs * .5;
      const right = { x0: lx + gap, x1: lx + gap + tw, y0, y1 }, left = { x0: lx - gap - tw, x1: lx - gap, y0, y1 };
      const side = !hit(right) ? right : !hit(left) ? left : null;
      if (side) placed.push(side);
      return `<circle class="gm-mini-city" cx="${lx}" cy="${ly}" r="${r * .45}"/>`
        + (side ? `<text class="gm-mini-label" x="${side.x0.toFixed(1)}" y="${(ly + fs * .36).toFixed(1)}" font-size="${fs.toFixed(1)}">${label(name)}</text>` : '');
    }).join('');
    const nations = M.nations.filter(([, lx, ly]) => inView(lx, ly)).map(([name, lx, ly]) => {
      const nw = labelWidth(name, fs * 1.1), b = { x0: lx - nw / 2, x1: lx + nw / 2, y0: ly - fs * .6, y1: ly + fs * .6 };
      if (hit(b)) return ''; placed.push(b);
      return `<text class="gm-mini-nation" x="${lx}" y="${(ly + fs * .35).toFixed(1)}" font-size="${fs.toFixed(1)}">${label(name)}</text>`;
    }).join('');
    const svg = svgMarkup({ viewBox: `${x.toFixed(1)} ${y.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`, extra: nations + labels + extra, inset: false });
    return guess?.province ? svg.replace(`data-p="${guess.province}" class="`, `data-p="${guess.province}" class="picked `) : svg;
  }

  window.GuessMap = GuessMap;
  window.GuessMap.snapshot = snapshot;
  window.GuessMap.toXY = toXY;
  window.GuessMap.locate = locate;
})();
