// رسوم تحديات الهندسة (الوحدة ٣): أشكال مضلعة صغيرة، شبكات، مثلثات وزوايا، منقلة، وشبكة إحداثيات بأربعة أرباع.
// المجسمات تُرسم بـ drawSolid من مهمة العالم نفسها عبر <canvas data-draw="solid"> (تملؤها missions/challenge.js بعد العرض).
import { ar } from '../core/util.js';
import { DRAW } from '../missions/challenge.js';
import { drawSolid } from '../missions/unit3.js';

const INK = '#2A1B66', ACC = '#E2475C', FILL = '#9CC9F5';
const T = (x, y, s, o = {}) => `<text x="${x}" y="${y}" text-anchor="${o.a || 'middle'}" font-size="${o.fs || 12}" font-weight="900" fill="${o.c || INK}" font-family="Cairo,sans-serif" direction="ltr">${s}</text>`;
const poly = (P, o = {}) => `<polygon points="${P.map(p => p.map(v => +v.toFixed(1)).join(',')).join(' ')}" fill="${o.fill || FILL}" stroke="${o.stroke || INK}" stroke-width="${o.sw || 2.2}" ${o.dash ? 'stroke-dasharray="4 3"' : ''} stroke-linejoin="round"/>`;
export const sg = n => n < 0 ? '⁦−' + ar(-n) + '⁩' : ar(n);
export const pt = (x, y) => `(${sg(x)}، ${sg(y)})`;   // كما في مهمة الإحداثيات

/* أيقونة شكل ثنائي الأبعاد (للخيارات والبطاقات) */
const ngon = (n, r = 22, rot = -Math.PI / 2, jitter = 0) => Array.from({ length: n }, (_, i) => { const a = rot + i * 2 * Math.PI / n, rr = r * (1 - jitter * Math.random()); return [28 + rr * Math.cos(a), 28 + rr * Math.sin(a)]; });
export function shape(kind, o = {}) {
  const S = b => `<svg viewBox="0 0 56 56" class="chShape">${b}</svg>`;
  const P = {
    triangle: [[28, 6], [50, 48], [6, 48]], square: [[10, 10], [46, 10], [46, 46], [10, 46]], rect: [[4, 16], [52, 16], [52, 40], [4, 40]],
    rhombus: [[28, 4], [48, 28], [28, 52], [8, 28]], para: [[16, 14], [52, 14], [40, 42], [4, 42]], trap: [[18, 12], [38, 12], [52, 44], [4, 44]],
    kite: [[28, 4], [44, 20], [28, 52], [12, 20]], right: [[8, 8], [8, 48], [48, 48]]
  }[kind];
  if (P) return S(poly(P));
  if (/^n\d+$/.test(kind)) return S(poly(ngon(+kind.slice(1), 22, -Math.PI / 2, o.irregular ? .35 : 0)));
  if (kind === 'circle') return S(`<circle cx="28" cy="28" r="22" fill="${FILL}" stroke="${INK}" stroke-width="2.2"/>`);
  if (kind === 'semi') return S(`<path d="M6 38 A22 22 0 0 1 50 38 Z" fill="${FILL}" stroke="${INK}" stroke-width="2.2"/>`);
  if (kind === 'open') return S(`<polyline points="8,46 14,10 42,8 50,40" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>`);
  if (kind === 'curved') return S(`<path d="M10 46 L10 10 L30 10 Q54 28 30 46 Z" fill="${FILL}" stroke="${INK}" stroke-width="2.2"/>`);
  if (kind === 'star') return S(poly(Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 10 : 24; return [28 + r * Math.cos(a), 30 + r * Math.sin(a)]; })));
  return '';
}

/* مجسّم يرسمه drawSolid: t = 'prism' | 'pyr'، n = أضلاع القاعدة */
export const solid = (t, n) => `<canvas class="chSolid" width="220" height="170" data-draw="solid" data-t="${t}" data-n="${n}"></canvas>`;
DRAW.solid = cv => { const r = 2, c = cv.getContext('2d'); cv.style.width = cv.width + 'px'; cv.style.height = cv.height + 'px'; cv.width *= r; cv.height *= r; c.scale(r, r); drawSolid(c, { t: cv.dataset.t, n: +cv.dataset.n }, 110, 130); };

/* شبكة مربعات (شبكات المكعب): cells = [[عمود، صف]]، labels اختيارية لكل خلية */
export function net(cells, labels, s = 16) {
  const xs = cells.map(c => c[0]), ys = cells.map(c => c[1]), x0 = Math.min(...xs), y0 = Math.min(...ys), W = (Math.max(...xs) - x0 + 1) * s, H = (Math.max(...ys) - y0 + 1) * s;
  return `<svg viewBox="-2 -2 ${W + 4} ${H + 4}" class="chNet" style="width:${W + 4}px">${cells.map(([c, r], i) => `<rect x="${(c - x0) * s}" y="${(r - y0) * s}" width="${s}" height="${s}" fill="#FFE3A3" stroke="${INK}" stroke-width="1.4"/>${labels ? T((c - x0 + .5) * s, (r - y0 + .5) * s + 5, labels[i], { fs: s * .6 }) : ''}`).join('')}</svg>`;
}
// شبكات المكعب: كل ترتيبات ١-٤-١ صحيحة، ومعها الدرج ٣-٣ والدرج ٢-٢-٢. والخاطئة معروفة.
export function cubeNet() { const a = Math.floor(Math.random() * 4), b = Math.floor(Math.random() * 4), k = Math.random();
  if (k < .75) return [[0, 1], [1, 1], [2, 1], [3, 1], [a, 0], [b, 2]];
  return k < .88 ? [[0, 0], [1, 0], [2, 0], [2, 1], [3, 1], [4, 1]] : [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2], [3, 2]]; }
export const BAD_NETS = [
  [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]],              // مستطيل ٢ × ٣
  [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [0, 1]],              // خمسة في صف
  [[0, 1], [1, 1], [2, 1], [3, 1], [1, 2], [2, 2]],              // مربع ٢ × ٢ داخلها
  [[0, 1], [1, 1], [2, 1], [3, 1], [0, 0], [3, 0]],              // الجناحان في الجهة نفسها عند الطرفين
  [[0, 1], [1, 1], [2, 1], [3, 1], [1, 0], [2, 0]],              // مربع ٢ × ٢
  [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0]]               // ستة في صف
];
/* شبكات مجسمات أخرى (رسم مبسط) */
export function solidNet(kind) {
  const s = 26, R = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#FFE3A3" stroke="${INK}" stroke-width="1.6"/>`, Tr = P => poly(P, { fill: '#FFE3A3', sw: 1.6 });
  let b = '', vb = '0 0 200 120';
  if (kind === 'triPrism') b = R(40, 40, 39, s) + R(79, 40, 39, s) + R(118, 40, 39, s) + Tr([[79, 40], [118, 40], [98.5, 8]]) + Tr([[79, 66], [118, 66], [98.5, 98]]);
  if (kind === 'sqPyr') b = R(80, 40, 40, 40) + Tr([[80, 40], [120, 40], [100, 6]]) + Tr([[80, 80], [120, 80], [100, 114]]) + Tr([[80, 40], [80, 80], [46, 60]]) + Tr([[120, 40], [120, 80], [154, 60]]);
  if (kind === 'tetra') { b = Tr([[60, 100], [140, 100], [100, 30]]) + Tr([[60, 100], [100, 30], [20, 30]]) + Tr([[140, 100], [100, 30], [180, 30]]) + Tr([[60, 100], [140, 100], [100, 170]]); vb = '0 20 200 160'; }
  if (kind === 'cuboid') b = R(20, 40, 30, 26) + R(50, 40, 50, 26) + R(100, 40, 30, 26) + R(130, 40, 50, 26) + R(50, 14, 50, 26) + R(50, 66, 50, 26);
  if (kind === 'cylinder') { b = R(50, 34, 100, 50) + `<circle cx="100" cy="17" r="17" fill="#FFE3A3" stroke="${INK}" stroke-width="1.6"/><circle cx="100" cy="101" r="17" fill="#FFE3A3" stroke="${INK}" stroke-width="1.6"/>`; }
  return `<svg viewBox="${vb}" class="chLine" style="max-width:260px">${b}</svg>`;
}

/* مثلث بزواياه: ang = [أ، ب، ج] بالدرجات، lab = نصوص تُكتب عند الزوايا */
export function triangle(ang, lab) {
  const [A, B] = ang, base = 220, rad = d => d * Math.PI / 180, x0 = 50, y0 = 130;
  const tA = Math.tan(rad(A)), tB = Math.tan(rad(B)), px = x0 + base * tB / (tA + tB), py = y0 - (px - x0) * tA;
  const P = [[x0, y0], [x0 + base, y0], [px, py]], sc = Math.min(1, 110 / (y0 - py)), Q = P.map(([x, y]) => [x, y0 - (y0 - y) * sc]);
  return `<svg viewBox="0 ${Math.min(...Q.map(q => q[1])) - 26} 320 ${y0 - Math.min(...Q.map(q => q[1])) + 40}" class="chLine">${poly(Q, { fill: '#FFF1D6' })}
    ${T(Q[0][0] + 26, Q[0][1] - 8, lab[0], { fs: 14, c: ACC })}${T(Q[1][0] - 26, Q[1][1] - 8, lab[1], { fs: 14, c: ACC })}${T(Q[2][0], Q[2][1] + 30, lab[2], { fs: 14, c: ACC })}</svg>`;
}
/* زاوية بين ذراعين على منقلة: theta بالدرجات، تُقاس من اليمين */
export function protractor(theta) {
  const c = [160, 140], r = 120, p = d => [c[0] + Math.cos(Math.PI - d * Math.PI / 180) * r, c[1] - Math.sin(Math.PI - d * Math.PI / 180) * r];
  let s = `<svg viewBox="20 6 280 150" class="chLine"><path d="M40 140 A120 120 0 0 1 280 140 Z" fill="#EAF6FF" stroke="${INK}" stroke-width="1.5"/>`;
  for (let d = 0; d <= 180; d += 5) { const a = Math.PI - d * Math.PI / 180, r1 = d % 10 ? 112 : 106; s += `<line x1="${c[0] + Math.cos(a) * r1}" y1="${c[1] - Math.sin(a) * r1}" x2="${c[0] + Math.cos(a) * r}" y2="${c[1] - Math.sin(a) * r}" stroke="${INK}" stroke-width="${d % 10 ? .6 : 1.1}"/>`;
    if (d % 30 === 0) { s += T(c[0] + Math.cos(a) * 94, c[1] - Math.sin(a) * 94 + 4, ar(d), { fs: 9 }) + T(c[0] + Math.cos(a) * 76, c[1] - Math.sin(a) * 76 + 4, ar(180 - d), { fs: 8, c: '#8A7A5A' }); } }
  // الذراع الأولى على خط الصفر (يسار)، والثانية عند theta
  const [x1, y1] = p(0), [x2, y2] = p(theta);
  return s + `<line x1="${c[0]}" y1="${c[1]}" x2="${x1}" y2="${y1}" stroke="${ACC}" stroke-width="3"/><line x1="${c[0]}" y1="${c[1]}" x2="${x2}" y2="${y2}" stroke="${ACC}" stroke-width="3"/><circle cx="${c[0]}" cy="${c[1]}" r="3" fill="${INK}"/></svg>`;
}
/* زوايا حول نقطة أو على خط مستقيم: ang = قياسات متتالية، lab = نصوصها */
export function fan(ang, lab, line = false) {
  const c = [160, line ? 110 : 85], r = 70; let a0 = line ? 180 : 90, s = `<svg viewBox="0 0 320 ${line ? 130 : 170}" class="chLine">`, rays = [];
  if (line) s += `<line x1="40" y1="${c[1]}" x2="280" y2="${c[1]}" stroke="${INK}" stroke-width="2.5"/>`;
  rays.push(a0); ang.forEach(d => { a0 -= d; rays.push(a0); });
  rays.forEach(d => { const a = d * Math.PI / 180; if (!line || (d !== 180 && d !== 0)) s += `<line x1="${c[0]}" y1="${c[1]}" x2="${c[0] + Math.cos(a) * r * 1.4}" y2="${c[1] - Math.sin(a) * r * 1.4}" stroke="${INK}" stroke-width="2.5"/>`; });
  ang.forEach((d, i) => { const m = (rays[i] + rays[i + 1]) / 2 * Math.PI / 180; s += T(c[0] + Math.cos(m) * r * .62, c[1] - Math.sin(m) * r * .62 + 5, lab[i], { fs: 13, c: ACC }); });
  return s + `<circle cx="${c[0]}" cy="${c[1]}" r="3.5" fill="${INK}"/></svg>`;
}

/* شبكة إحداثيات من −n إلى n: pts = [{x,y,l}]، shapes = [{p:[[x,y]..], c, l, dash}]، mirror = {x:k} أو {y:k} */
export function grid({ n = 5, pts = [], shapes = [], mirror = null } = {}) {
  const s = 22, O = n * s + 14, X = x => O + x * s, Y = y => O - y * s, W = 2 * O; let g = `<svg viewBox="0 0 ${W} ${W}" class="chGrid">`;
  for (let i = -n; i <= n; i++) g += `<line x1="${X(i)}" y1="${Y(-n)}" x2="${X(i)}" y2="${Y(n)}" stroke="#D5DBE8" stroke-width="1"/><line x1="${X(-n)}" y1="${Y(i)}" x2="${X(n)}" y2="${Y(i)}" stroke="#D5DBE8" stroke-width="1"/>`;
  g += `<line x1="${X(-n) - 6}" y1="${Y(0)}" x2="${X(n) + 6}" y2="${Y(0)}" stroke="${INK}" stroke-width="2"/><line x1="${X(0)}" y1="${Y(-n) + 6}" x2="${X(0)}" y2="${Y(n) - 6}" stroke="${INK}" stroke-width="2"/>`;
  for (let i = -n; i <= n; i++) if (i) g += T(X(i), Y(0) + 13, sg(i).replace(/[⁦⁩]/g, ''), { fs: 9 }) + T(X(0) - 8, Y(i) + 3, sg(i).replace(/[⁦⁩]/g, ''), { fs: 9, a: 'end' });
  g += T(X(n) + 2, Y(0) - 6, 'س', { fs: 11, c: ACC }) + T(X(0) + 9, Y(n) + 2, 'ص', { fs: 11, c: ACC });
  if (mirror) g += mirror.x != null ? `<line x1="${X(mirror.x)}" y1="${Y(n) - 4}" x2="${X(mirror.x)}" y2="${Y(-n) + 4}" stroke="#2E9E5B" stroke-width="3" stroke-dasharray="6 4"/>` : `<line x1="${X(-n) - 4}" y1="${Y(mirror.y)}" x2="${X(n) + 4}" y2="${Y(mirror.y)}" stroke="#2E9E5B" stroke-width="3" stroke-dasharray="6 4"/>`;
  shapes.forEach(sh => { g += poly(sh.p.map(([x, y]) => [X(x), Y(y)]), { fill: sh.c || FILL, sw: 2, dash: sh.dash }); if (sh.l) { const cx = sh.p.reduce((a, q) => a + q[0], 0) / sh.p.length, cy = sh.p.reduce((a, q) => a + q[1], 0) / sh.p.length; g += T(X(cx), Y(cy) + 5, sh.l, { fs: 14 }); } });
  pts.forEach(p => { g += `<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="4.5" fill="${p.c || ACC}"/>` + (p.l ? T(X(p.x) + 9, Y(p.y) - 7, p.l, { fs: 13, c: p.c || ACC }) : ''); });
  return g + '</svg>';
}
