// Bakes assets/map/*.geojson (DataV.GeoAtlas, https://datav.aliyun.com/portal/school/atlas/area_selector)
// plus the neighbouring countries (assets/map/world-countries-50m.json) into china-map.js: pre-projected, simplified SVG paths so the phone never parses GeoJSON.
// Also bakes assets/map/cities/<adcode>.geojson (DataV <adcode>_full.json) into china-cities.js,
// which the page loads only when the player zooms in far enough to need city boundaries.
// Re-run after replacing the source data: node scripts/build-china-map.cjs
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const provinces = JSON.parse(fs.readFileSync(path.join(root, 'assets/map/china-provinces.geojson'), 'utf8'));
const outline = JSON.parse(fs.readFileSync(path.join(root, 'assets/map/china-outline.geojson'), 'utf8'));

// Albers equal-area conic, the usual projection for maps of China.
const rad = Math.PI / 180, lon0 = 105, p1 = 25 * rad, p2 = 47 * rad;
const n = (Math.sin(p1) + Math.sin(p2)) / 2, C = Math.cos(p1) ** 2 + 2 * n * Math.sin(p1), rho0 = Math.sqrt(C) / n;
const albers = ([lng, lat]) => {
  const rho = Math.sqrt(C - 2 * n * Math.sin(lat * rad)) / n, t = n * (lng - lon0) * rad;
  return [rho * Math.sin(t), rho0 - rho * Math.cos(t)];
};

const W = 2000, PAD = 24, TOL = 1.1, INSET_W = 236; // the inset sits right of the mainland, clear of Taiwan
const MAIN_MIN_LAT = 17.8; // South China Sea islands go to the inset, as on standard maps.
const ringsOf = geometry => geometry.type === 'Polygon' ? geometry.coordinates : geometry.coordinates.flat();
const maxLat = ring => Math.max(...ring.map(p => p[1]));
const jd = provinces.features.find(f => String(f.properties.adcode).endsWith('_JD'));
const provinceFeatures = provinces.features.filter(f => f !== jd);

let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
for (const f of provinceFeatures) for (const ring of ringsOf(f.geometry)) {
  if (maxLat(ring) < MAIN_MIN_LAT) continue;
  for (const [x, y] of ring.map(albers)) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
}
const k = (W - PAD * 2 - INSET_W + 60) / (maxX - minX), H = Math.round((maxY - minY) * k + PAD * 2);
const toMain = p => { const [x, y] = albers(p); return [(x - minX) * k + PAD, (maxY - y) * k + PAD]; };

function simplify(points, tol) {
  if (points.length < 4) return points;
  const keep = new Uint8Array(points.length); keep[0] = keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop(), [ax, ay] = points[a], [bx, by] = points[b];
    const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1;
    let far = -1, best = tol;
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs((points[i][0] - ax) * dy - (points[i][1] - ay) * dx) / len;
      if (d > best) { best = d; far = i; }
    }
    if (far > 0) { keep[far] = 1; stack.push([a, far], [far, b]); }
  }
  return points.filter((_, i) => keep[i]);
}
const area = pts => Math.abs(pts.reduce((s, [x, y], i) => { const [nx, ny] = pts[(i + 1) % pts.length]; return s + x * ny - nx * y; }, 0) / 2);
// Relative integer path: "M12 34l3-1 ..." keeps the file small.
function encode(rings, project, minArea, tol = TOL) {
  let d = '';
  for (const ring of rings) {
    // Rings are closed, so split in two before Douglas–Peucker.
    const projected = ring.map(project), mid = projected.length >> 1;
    const pts = [...simplify(projected.slice(0, mid + 1), tol), ...simplify(projected.slice(mid), tol).slice(1)].map(([x, y]) => [Math.round(x), Math.round(y)])
      .filter((p, i, all) => !i || p[0] !== all[i - 1][0] || p[1] !== all[i - 1][1]);
    if (pts.length < 3 || area(pts) < minArea) continue;
    d += `M${pts[0][0]} ${pts[0][1]}l`;
    for (let i = 1; i < pts.length; i++) {
      const dx = pts[i][0] - pts[i - 1][0], dy = pts[i][1] - pts[i - 1][1];
      d += (i > 1 && dx >= 0 ? ' ' : '') + dx + (dy >= 0 ? ' ' : '') + dy;
    }
    d += 'z';
  }
  return d;
}
const shortName = name => name.replace(/(壮族|回族|维吾尔)?自治区|特别行政区|省|市$/g, '');
const mainRings = geometry => ringsOf(geometry).filter(ring => maxLat(ring) >= MAIN_MIN_LAT);

const out = {
  w: W, h: H,
  proj: { lon0, n, C, rho0, k, minX, maxY, pad: PAD },
  outline: encode(outline.features.flatMap(f => mainRings(f.geometry)), toMain, 40, 1.4),
  provinces: provinceFeatures.map(f => {
    const [lx, ly] = toMain(f.properties.centroid || f.properties.center);
    // Macau is tiny at this scale: keep it rather than dropping it with the islets.
    return { name: shortName(f.properties.name), d: encode(mainRings(f.geometry), toMain, f.properties.adcode === 820000 ? .2 : 6), lx: Math.round(lx), ly: Math.round(ly) };
  }).filter(p => p.d),
  dashes: encode(mainRings(jd.geometry), toMain, 0, .6)
};

// Four pastel colours so neighbouring provinces never share one (adjacency = shared border vertices).
{
  const shown = out.provinces.map(p => provinceFeatures.find(f => shortName(f.properties.name) === p.name));
  const keyed = shown.map(f => new Set(mainRings(f.geometry).flat().map(([a, b]) => a.toFixed(3) + ',' + b.toFixed(3))));
  const adj = keyed.map((set, i) => keyed.map((other, j) => { if (i === j) return false; let shared = 0; for (const key of set) if (other.has(key) && ++shared > 2) return true; return false; }));
  const colour = new Array(keyed.length).fill(-1), order = keyed.map((_, i) => i).sort((a, b) => adj[b].filter(Boolean).length - adj[a].filter(Boolean).length);
  const solve = k => { if (k === order.length) return true; const i = order[k]; for (let c = 0; c < 4; c++) { if (adj[i].some((on, j) => on && colour[j] === c)) continue; colour[i] = c; if (solve(k + 1)) return true; } colour[i] = -1; return false; };
  if (!solve(0)) throw new Error('four-colouring failed');
  out.provinces.forEach((p, i) => { p.c = colour[i]; });
}

// South China Sea inset, bottom-right, same projection at a smaller scale.
const win = { w: 106.8, e: 122.6, s: 2.8, n: 24.6 };
const corners = [];
for (let lng = win.w; lng <= win.e + 1e-9; lng += (win.e - win.w) / 8) for (const lat of [win.s, win.n]) corners.push(albers([lng, lat]));
const ix0 = Math.min(...corners.map(p => p[0])), ix1 = Math.max(...corners.map(p => p[0]));
const iy0 = Math.min(...corners.map(p => p[1])), iy1 = Math.max(...corners.map(p => p[1]));
const insetW = INSET_W, ik = insetW / (ix1 - ix0), insetH = Math.round((iy1 - iy0) * ik);
const inset = { x: W - insetW - PAD, y: H - insetH - PAD, w: insetW, h: insetH };
const toInset = p => { const [x, y] = albers(p); return [inset.x + (x - ix0) * ik, inset.y + (iy1 - y) * ik]; };
const inWindow = ring => ring.some(([lng, lat]) => lng > win.w - 3 && lng < win.e + 3 && lat > win.s - 3 && lat < win.n + 3);
out.inset = {
  ...inset,
  land: encode(provinceFeatures.flatMap(f => ringsOf(f.geometry)).filter(inWindow), toInset, .4, .8),
  dashes: encode(ringsOf(jd.geometry), toInset, 0, .4)
};

// Neighbouring countries, grey context under the provinces (Natural Earth 1:50m via world-atlas@2,
// public domain: assets/map/world-countries-50m.json). China itself stays in the layer so any sliver
// between the two datasets reads as land; the DataV provinces are painted over it.
{
  const world = JSON.parse(fs.readFileSync(path.join(root, 'assets/map/world-countries-50m.json'), 'utf8'));
  const { scale: [sx, sy], translate: [tx, ty] } = world.transform;
  const arcs = world.arcs.map(a => { let x = 0, y = 0; return a.map(([dx, dy]) => [(x += dx) * sx + tx, (y += dy) * sy + ty]); });
  const arc = i => i < 0 ? arcs[~i].slice().reverse() : arcs[i];
  const ring = ids => ids.flatMap((i, n) => n ? arc(i).slice(1) : arc(i));
  const polygons = g => g.type === 'Polygon' ? [g.arcs] : g.type === 'MultiPolygon' ? g.arcs : [];
  // Far enough around the mainland to fill the letterbox of a portrait phone at the widest zoom.
  const EXT = 1100, box = { x0: -EXT, y0: -EXT, x1: W + EXT, y1: H + EXT };
  const nearby = r => r.some(([lng, lat]) => lng > 45 && lng < 170 && lat > -15 && lat < 82);
  // Sutherland–Hodgman against the four sides of the box, in map units.
  const clip = pts => [[0, box.x0, 1], [0, box.x1, -1], [1, box.y0, 1], [1, box.y1, -1]].reduce((input, [axis, edge, dir]) => {
    const out = [], inside = p => (p[axis] - edge) * dir >= 0;
    input.forEach((cur, i) => {
      const prev = input[(i + input.length - 1) % input.length];
      if (inside(cur) !== inside(prev)) { const t = (edge - prev[axis]) / (cur[axis] - prev[axis]); out.push([prev[0] + (cur[0] - prev[0]) * t, prev[1] + (cur[1] - prev[1]) * t]); }
      if (inside(cur)) out.push(cur);
    });
    return out;
  }, pts);
  const rings = world.objects.countries.geometries.flatMap(polygons).flat().map(ring)
    .filter(nearby).map(r => clip(r.map(toMain))).filter(r => r.length > 2);
  out.world = encode(rings, p => p, 30, 1.6);
  // Country names, grey and small; only ones that land inside the baked area. Small countries (1) wait for a closer zoom.
  out.nations = [
    ['俄罗斯', 108, 58.5], ['蒙古', 103, 46.6], ['哈萨克斯坦', 79, 47.6], ['吉尔吉斯斯坦', 74.8, 41.6, 1], ['塔吉克斯坦', 71, 38.8, 1],
    ['阿富汗', 66, 34], ['巴基斯坦', 69.5, 29], ['印度', 78.5, 22], ['尼泊尔', 83.8, 28.3, 1], ['不丹', 90.4, 27.4, 1], ['孟加拉国', 90.2, 23.9, 1],
    ['缅甸', 95.9, 21.5], ['老挝', 102.6, 19.6], ['越南', 107.9, 14.3], ['泰国', 101, 15.5], ['柬埔寨', 104.9, 12.6, 1],
    ['马来西亚', 102.2, 4], ['朝鲜', 126.9, 40.2], ['韩国', 128, 36.3], ['日本', 138.5, 36.8], ['菲律宾', 122.2, 12.3]
  ].map(([name, lng, lat, small = 0]) => { const [x, y] = toMain([lng, lat]); return [name, Math.round(x), Math.round(y), small]; })
    .filter(([, x, y]) => x > box.x0 + 60 && x < box.x1 - 60 && y > box.y0 + 30 && y < box.y1 - 30);
}

// Orientation labels. The five challenge destinations are deliberately absent.
const cities = [
  ['北京', 116.40, 39.90, 1], ['上海', 121.47, 31.23, 1], ['广州', 113.26, 23.13, 1], ['成都', 104.07, 30.57, 1],
  ['西安', 108.94, 34.34, 1], ['武汉', 114.30, 30.59, 1], ['昆明', 102.83, 24.88, 1], ['拉萨', 91.12, 29.65, 1],
  ['乌鲁木齐', 87.62, 43.83, 1], ['哈尔滨', 126.64, 45.76, 1], ['兰州', 103.83, 36.06, 1], ['台北', 121.56, 25.04, 1],
  ['呼和浩特', 111.75, 40.84, 2], ['重庆', 106.55, 29.56, 2], ['南京', 118.80, 32.06, 2], ['杭州', 120.16, 30.27, 2],
  ['长沙', 112.94, 28.23, 2], ['郑州', 113.63, 34.75, 2], ['沈阳', 123.43, 41.80, 2], ['南宁', 108.37, 22.82, 2],
  ['贵阳', 106.63, 26.65, 2], ['西宁', 101.78, 36.62, 2], ['银川', 106.23, 38.49, 2], ['济南', 117.00, 36.65, 2],
  ['福州', 119.30, 26.08, 2], ['南昌', 115.86, 28.68, 2], ['合肥', 117.23, 31.82, 2], ['太原', 112.55, 37.87, 2],
  ['石家庄', 114.51, 38.04, 2], ['长春', 125.32, 43.82, 2], ['海口', 110.20, 20.04, 2], ['天津', 117.20, 39.13, 2]
];
// level 0 = national capital (always named); 1 = provincial capitals (named once zoomed in).
out.labels = cities.map(([name, lng, lat]) => { const [x, y] = toMain([lng, lat]); return [name, Math.round(x), Math.round(y), name === '北京' ? 0 : 1]; });
out.proj = Object.fromEntries(Object.entries(out.proj).map(([key, v]) => [key, Number(v.toPrecision(10))]));

const js = `/* Generated by scripts/build-china-map.cjs from DataV.GeoAtlas boundaries. Do not edit by hand. */\nwindow.CHINA_MAP=${JSON.stringify(out)};\n`;
fs.writeFileSync(path.join(root, 'china-map.js'), js);
console.log(`china-map.js ${(js.length / 1024).toFixed(1)} KB · ${W}×${H} · inset ${insetW}×${insetH}`);

// City (prefecture-level) boundaries, grouped per province. Municipalities and SARs stay whole;
// DataV has no city breakdown for Taiwan.
const cityDir = path.join(root, 'assets/map/cities');
const cityLayer = fs.readdirSync(cityDir).filter(file => file.endsWith('.geojson')).sort().map(file => {
  const data = JSON.parse(fs.readFileSync(path.join(cityDir, file), 'utf8'));
  const adcode = Number(file.replace('.geojson', ''));
  const province = provinceFeatures.find(f => f.properties.adcode === adcode);
  return { p: shortName(province.properties.name), cities: data.features.map(c => [c.properties.name, encode(mainRings(c.geometry), toMain, 3, .9)]).filter(([, d]) => d) };
});
const cityJs = `/* Generated by scripts/build-china-map.cjs from DataV.GeoAtlas boundaries. Loaded on demand. */
window.CHINA_CITIES=${JSON.stringify(cityLayer)};
`;
fs.writeFileSync(path.join(root, 'china-cities.js'), cityJs);
console.log(`china-cities.js ${(cityJs.length / 1024).toFixed(1)} KB · ${cityLayer.reduce((n, p) => n + p.cities.length, 0)} cities`);
