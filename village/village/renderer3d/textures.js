// خامات مولّدة بالكود عند التحميل (لا ملفات صور): لون + خريطة نتوء (normal) + خشونة متفاوتة.
// كل خامة تُرسم مرة واحدة في canvas وتُحفظ، فحجم التحميل لا يزيد.
import * as THREE from '../lib/three/three.module.min.js';

const cache = new Map();
let MAX_ANISO = 4;
export const setAniso = a => { MAX_ANISO = a; };

/* مولّد عشوائي ثابت البذرة: الخامة نفسها في كل مرة */
function rng(seed) { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }

/* ضجيج قيمي متدرج (مستويات متعددة) على شبكة دورية حتى تتكرر الخامة بلا خطوط */
function noiseField(size, seed, octaves = 4, base = 8) {
  const R = rng(seed), out = new Float32Array(size * size);
  let amp = 1, total = 0;
  for (let o = 0, cells = base; o < octaves; o++, cells *= 2, amp *= .5) {
    const g = new Float32Array(cells * cells); for (let i = 0; i < g.length; i++) g[i] = R();
    const cs = size / cells;
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const gx = x / cs, gy = y / cs, x0 = Math.floor(gx) % cells, y0 = Math.floor(gy) % cells, x1 = (x0 + 1) % cells, y1 = (y0 + 1) % cells;
      let fx = gx - Math.floor(gx), fy = gy - Math.floor(gy); fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
      const a = g[y0 * cells + x0], b = g[y0 * cells + x1], c = g[y1 * cells + x0], d = g[y1 * cells + x1];
      out[y * size + x] += amp * (a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy);
    }
    total += amp;
  }
  for (let i = 0; i < out.length; i++) out[i] /= total;
  return out;
}

/* خريطة نتوء من خريطة ارتفاع (فروق مركزية، دورية) */
function normalCanvas(h, size, strength) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const x = c.getContext('2d'), img = x.createImageData(size, size), d = img.data;
  for (let j = 0; j < size; j++) for (let i = 0; i < size; i++) {
    const l = h[j * size + (i - 1 + size) % size], r = h[j * size + (i + 1) % size], u = h[((j - 1 + size) % size) * size + i], dn = h[((j + 1) % size) * size + i];
    let nx = (l - r) * strength, ny = (u - dn) * strength, nz = 1; const len = Math.hypot(nx, ny, nz); nx /= len; ny /= len; nz /= len;
    const k = (j * size + i) * 4; d[k] = (nx * .5 + .5) * 255; d[k + 1] = (ny * .5 + .5) * 255; d[k + 2] = (nz * .5 + .5) * 255; d[k + 3] = 255;
  }
  x.putImageData(img, 0, 0); return c;
}

function tex(canvas, srgb, repeat) {
  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = MAX_ANISO;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) t.repeat.set(repeat, repeat);
  return t;
}
const hex = c => new THREE.Color(c);

/* لون من ارتفاع: يمزج لونين حسب الضجيج، مع بقع وتشققات اختيارية */
function colorCanvas(size, paint) { const c = document.createElement('canvas'); c.width = c.height = size; paint(c.getContext('2d'), size); return c; }
function shadeImage(ctx, size, h, c1, c2, contrast = 1) {
  const img = ctx.getImageData(0, 0, size, size), d = img.data, A = hex(c1), B = hex(c2);
  for (let i = 0; i < size * size; i++) {
    const v = Math.min(1, Math.max(0, (h[i] - .5) * contrast + .5)), k = i * 4, m = d[k + 3] / 255;
    const r = (A.r + (B.r - A.r) * v) * 255, g = (A.g + (B.g - A.g) * v) * 255, b = (A.b + (B.b - A.b) * v) * 255;
    d[k] = d[k] * (1 - m) + r * m; d[k + 1] = d[k + 1] * (1 - m) + g * m; d[k + 2] = d[k + 2] * (1 - m) + b * m; d[k + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}

/* ── الجص الطيني: سطح متموج ناعم، بقع، وشقوق دقيقة ── */
function plasterSet(tint, seed) {
  const S = 256, h = noiseField(S, seed, 5, 4);
  const R = rng(seed + 9);
  const col = colorCanvas(S, (x, s) => {
    x.fillStyle = '#fff'; x.fillRect(0, 0, s, s);
    shadeImage(x, s, h, new THREE.Color(tint).offsetHSL(0, .02, .06).getStyle(), new THREE.Color(tint).offsetHSL(0, .03, -.08).getStyle(), 1.6);
    x.globalAlpha = .18; for (let i = 0; i < 60; i++) { x.fillStyle = R() < .5 ? '#ffffff' : '#7a5a3a'; x.beginPath(); x.arc(R() * s, R() * s, 1 + R() * 3, 0, 7); x.fill(); }
    x.globalAlpha = .22; x.strokeStyle = '#6b4c30'; x.lineWidth = .7;
    for (let i = 0; i < 6; i++) { let px = R() * s, py = R() * s; x.beginPath(); x.moveTo(px, py); for (let k = 0; k < 5; k++) { px += (R() - .5) * 18; py += R() * 12; x.lineTo(px, py); } x.stroke(); }
    x.globalAlpha = 1;
  });
  return { map: tex(col, true), normalMap: tex(normalCanvas(h, S, 2.2)), roughness: .92 };
}

/* ── حجر مقطوع: مداميك بفواصل ── */
function stoneSet(tint, seed) {
  const S = 256, h0 = noiseField(S, seed, 4, 8), h = new Float32Array(S * S), R = rng(seed);
  const rows = 8, rh = S / rows, offs = Array.from({ length: rows }, () => R() * 40);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const r = Math.floor(y / rh), bw = 48, bx = (x + offs[r] + (r % 2) * 24) % bw, by = y % rh;
    const edge = Math.min(bx, bw - bx, by, rh - by), mortar = edge < 2.2 ? 0 : Math.min(1, edge / 6);
    h[y * S + x] = mortar * (.55 + h0[y * S + x] * .45);
  }
  const col = colorCanvas(S, (x, s) => { x.fillStyle = '#fff'; x.fillRect(0, 0, s, s); shadeImage(x, s, h, new THREE.Color(tint).offsetHSL(0, 0, -.22).getStyle(), new THREE.Color(tint).offsetHSL(0, .02, .05).getStyle(), 1.1); });
  return { map: tex(col, true), normalMap: tex(normalCanvas(h, S, 3.5)), roughness: .95 };
}

/* ── خشب بألواح وعروق ── */
function woodSet(tint, seed) {
  const S = 256, R = rng(seed), h = new Float32Array(S * S), n = noiseField(S, seed, 3, 4);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const plank = x % 32, gap = plank < 1.5 ? 0 : 1, grain = .5 + .5 * Math.sin((y * .08 + n[y * S + x] * 9 + Math.floor(x / 32) * 3));
    h[y * S + x] = gap * (.55 + grain * .3 + n[y * S + x] * .15);
  }
  const col = colorCanvas(S, (x, s) => { x.fillStyle = '#fff'; x.fillRect(0, 0, s, s); shadeImage(x, s, h, new THREE.Color(tint).offsetHSL(0, 0, -.2).getStyle(), new THREE.Color(tint).offsetHSL(0, .03, .08).getStyle(), 1.3); });
  return { map: tex(col, true), normalMap: tex(normalCanvas(h, S, 2.5)), roughness: .78 };
}

/* ── رمل: حبيبات وتموجات ريح خفيفة ── */
function sandSet(seed) {
  const S = 256, n = noiseField(S, seed, 5, 4), h = new Float32Array(S * S), R = rng(seed);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) h[y * S + x] = n[y * S + x] * .8 + .2 * (.5 + .5 * Math.sin((x * .9 + y * .35) * .25 + n[y * S + x] * 6));
  const col = colorCanvas(S, (x, s) => { x.fillStyle = '#fff'; x.fillRect(0, 0, s, s); shadeImage(x, s, h, '#d9bd8b', '#f0dcb0', 1.2);
    x.globalAlpha = .5; for (let i = 0; i < 900; i++) { x.fillStyle = R() < .5 ? '#c9a46e' : '#fff3d6'; x.fillRect(R() * s, R() * s, 1, 1); } x.globalAlpha = 1; });
  return { map: tex(col, true), normalMap: tex(normalCanvas(h, S, 1.6)), roughness: 1 };
}

/* ── مواد جاهزة: كل مادة تُنشأ مرة واحدة وتُشارَك ── */
export function material(kind, tint = '#ffffff', opts = {}) {
  const key = kind + '|' + tint + '|' + JSON.stringify(opts);
  if (cache.has(key)) return cache.get(key);
  let m;
  const seed = [...key].reduce((a, c) => a * 31 + c.charCodeAt(0) >>> 0, 7);
  if (kind === 'plaster') { const s = plasterSet(tint, seed); m = new THREE.MeshStandardMaterial({ map: s.map, normalMap: s.normalMap, normalScale: new THREE.Vector2(.6, .6), roughness: s.roughness, metalness: 0 }); }
  else if (kind === 'stone') { const s = stoneSet(tint, seed); m = new THREE.MeshStandardMaterial({ map: s.map, normalMap: s.normalMap, normalScale: new THREE.Vector2(.9, .9), roughness: s.roughness }); }
  else if (kind === 'wood') { const s = woodSet(tint, seed); m = new THREE.MeshStandardMaterial({ map: s.map, normalMap: s.normalMap, normalScale: new THREE.Vector2(.7, .7), roughness: s.roughness }); }
  else if (kind === 'sand') { const s = sandSet(seed); m = new THREE.MeshStandardMaterial({ map: s.map, normalMap: s.normalMap, roughness: 1 }); }
  else if (kind === 'metal') m = new THREE.MeshStandardMaterial({ color: tint, roughness: opts.rough ?? .45, metalness: opts.metal ?? .75 });
  else m = new THREE.MeshStandardMaterial({ color: tint, roughness: opts.rough ?? .85, metalness: 0, ...(opts.emissive ? { emissive: opts.emissive, emissiveIntensity: opts.ei ?? 1 } : {}) });
  if (opts.repeat && m.map) { [m.map, m.normalMap].forEach(t => t && t.repeat.set(opts.repeat[0], opts.repeat[1])); }
  cache.set(key, m);
  return m;
}

/* أوراق النخيل والشجر: نصل بوريقات على خلفية شفافة */
export function frondTexture() {
  if (cache.has('frond')) return cache.get('frond');
  const c = document.createElement('canvas'); c.width = 128; c.height = 512; const x = c.getContext('2d');
  x.clearRect(0, 0, 128, 512);
  x.strokeStyle = '#6b7a2e'; x.lineWidth = 5; x.beginPath(); x.moveTo(64, 512); x.quadraticCurveTo(66, 260, 64, 0); x.stroke();
  for (let i = 0; i < 46; i++) {
    const y = 500 - i * 10.6, len = 58 * Math.sin(Math.PI * Math.min(1, (i + 3) / 46)) + 6;
    [-1, 1].forEach(sd => {
      const g = x.createLinearGradient(64, y, 64 + sd * len, y - 30); g.addColorStop(0, '#3f6b25'); g.addColorStop(1, i % 3 ? '#7fae45' : '#6a9a3a');
      x.strokeStyle = g; x.lineWidth = 4.2; x.lineCap = 'round'; x.beginPath(); x.moveTo(64, y); x.quadraticCurveTo(64 + sd * len * .5, y - 8, 64 + sd * len, y - 26); x.stroke();
    });
  }
  const t = tex(c, true); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; cache.set('frond', t); return t;
}
/* نقش هندسي عُماني (للأفاريز فوق الأبواب) */
export function bandTexture(color = '#E9D9B8') {
  const key = 'band' + color; if (cache.has(key)) return cache.get(key);
  const c = document.createElement('canvas'); c.width = 256; c.height = 32; const x = c.getContext('2d');
  x.fillStyle = color; x.fillRect(0, 0, 256, 32);
  x.strokeStyle = 'rgba(110,70,35,.55)'; x.lineWidth = 2;
  for (let i = 0; i < 16; i++) { const cx = i * 16 + 8; x.beginPath(); x.moveTo(cx - 7, 16); x.lineTo(cx, 6); x.lineTo(cx + 7, 16); x.lineTo(cx, 26); x.closePath(); x.stroke(); x.fillStyle = 'rgba(110,70,35,.35)'; x.fillRect(cx - 1.5, 14.5, 3, 3); }
  x.fillStyle = 'rgba(110,70,35,.4)'; x.fillRect(0, 2, 256, 1.5); x.fillRect(0, 28.5, 256, 1.5);
  const t = tex(c, true); cache.set(key, t); return t;
}
/* مشربية: شبكة خشبية مفرّغة (شفافة) */
export function latticeTexture() {
  if (cache.has('lattice')) return cache.get('lattice');
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  x.clearRect(0, 0, 128, 128); x.strokeStyle = '#6b4424'; x.lineWidth = 5;
  for (let i = -128; i < 256; i += 18) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 128, 128); x.stroke(); x.beginPath(); x.moveTo(i + 128, 0); x.lineTo(i, 128); x.stroke(); }
  x.strokeStyle = '#4a2c14'; x.lineWidth = 8; x.strokeRect(0, 0, 128, 128);
  const t = tex(c, true); cache.set('lattice', t); return t;
}
