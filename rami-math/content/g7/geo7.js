// رسوم هندسة الصف السابع (SVG) لمهام حصن الزوايا والكسور وتحدياته: زاوية بحروف رؤوسها (حتى المنعكسة)، وخطان متوازيان يقطعهما قاطع.
// الحروف عربية والأرقام هندية؛ الزاوية تُقاس عكس عقارب الساعة من الذراع الأفقية اليمنى.
import { ar } from '../../core/util.js';
const INK = '#2A1B66', ACC = '#E2475C', rad = d => d * Math.PI / 180;
const T = (x, y, s, fs = 13, c = INK) => `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" font-size="${fs}" font-weight="900" fill="${c}" font-family="Cairo,sans-serif">${s}</text>`;
const P = (c, a, r) => [c[0] + Math.cos(rad(a)) * r, c[1] - Math.sin(rad(a)) * r];
/* قوس من الزاوية a1 إلى a2 (عكس عقارب الساعة) */
const arc = (c, a1, a2, r, col = ACC) => { const [x1, y1] = P(c, a1, r), [x2, y2] = P(c, a2, r), big = (a2 - a1 + 360) % 360 > 180 ? 1 : 0;
  return `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} A${r} ${r} 0 ${big} 0 ${x2.toFixed(1)} ${y2.toFixed(1)}" fill="none" stroke="${col}" stroke-width="2"/>`; };
export const deg = v => `${ar(v)}°`;
/* زاوية بين ذراعين: theta (٠–٣٦٠)، pts = [طرف الذراع الأفقية، الرأس، طرف الذراع الأخرى]، lab نص داخل القوس، rot تدوير الشكل كله */
export function ang(theta, { pts = null, lab = '', rot = 0 } = {}) {
  const c = [130, 100], L = 82, a1 = rot, a2 = rot + theta, e1 = P(c, a1, L), e2 = P(c, a2, L);
  let s = `<line x1="${c[0]}" y1="${c[1]}" x2="${e1[0].toFixed(1)}" y2="${e1[1].toFixed(1)}" stroke="${INK}" stroke-width="3"/><line x1="${c[0]}" y1="${c[1]}" x2="${e2[0].toFixed(1)}" y2="${e2[1].toFixed(1)}" stroke="${INK}" stroke-width="3"/>`;
  s += theta === 90 ? (() => { const q = [P(c, a1, 16), P([P(c, a1, 16)[0], P(c, a1, 16)[1]], a2, 16), P(c, a2, 16)]; return `<path d="M${q[0][0].toFixed(1)} ${q[0][1].toFixed(1)} L${q[1][0].toFixed(1)} ${q[1][1].toFixed(1)} L${q[2][0].toFixed(1)} ${q[2][1].toFixed(1)}" fill="none" stroke="${ACC}" stroke-width="2"/>`; })() : arc(c, a1, a2, theta > 180 ? 22 : 28);
  if (lab) { const [x, y] = P(c, rot + theta / 2, theta > 180 ? 40 : theta < 40 ? 56 : 46); s += T(x, y + 5, lab, 14, ACC); }
  if (pts) { const q1 = P(c, a1, L + 12), q2 = P(c, a2, L + 12), v = P(c, rot + theta / 2 + 180, 16); s += T(q1[0], q1[1] + 5, pts[0], 15) + T(v[0], v[1] + 5, pts[1], 15) + T(q2[0], q2[1] + 5, pts[2], 15); }
  return `<svg viewBox="20 0 220 200" class="chLine" style="max-width:220px">${s}<circle cx="${c[0]}" cy="${c[1]}" r="3.5" fill="${INK}"/></svg>`;
}
/* خطان متوازيان أفقيان يقطعهما قاطع يميل theta عن الخط. marks = [{p: ٠ للعلوي أو ١ للسفلي، q: 'tr'|'tl'|'bl'|'br'، lab}]
   tr = فوق الخط يمين القاطع (= theta)، tl = فوق يسار (١٨٠ − theta)، bl = تحت يسار (= theta)، br = تحت يمين (١٨٠ − theta) */
export const SECT = { tr: [0, 1], tl: [1, 2], bl: [2, 3], br: [3, 4] };
export function parallel(theta, marks = []) {
  const ys = [62, 142], k = 1 / Math.tan(rad(theta)), X = y => 160 + (102 - y) * k, top = 14, bot = 190;
  let s = ys.map(y => `<line x1="14" y1="${y}" x2="306" y2="${y}" stroke="${INK}" stroke-width="2.5"/><path d="M60 ${y - 6} L68 ${y} L60 ${y + 6}" fill="none" stroke="${INK}" stroke-width="2"/>`).join('');
  s += `<line x1="${X(top).toFixed(1)}" y1="${top}" x2="${X(bot).toFixed(1)}" y2="${bot}" stroke="#1F7A4D" stroke-width="2.5"/>`;
  marks.forEach(m => {
    const c = [X(ys[m.p]), ys[m.p]], b = [0, theta, 180, 180 + theta, 360], [i, j] = SECT[m.q], r = m.lab && m.lab.length > 3 ? 22 : 20;
    s += arc(c, b[i], b[j], r, m.col || ACC);
    const [x, y] = P(c, (b[i] + b[j]) / 2, (b[j] - b[i]) < 50 ? 44 : 34); s += T(x, y + 5, m.lab, 13, m.col || ACC);
  });
  return `<svg viewBox="0 0 320 204" class="chLine" style="max-width:300px">${s}</svg>`;
}
/* قيمة زاوية في قطاع بمعلومية theta */
export const sectVal = (theta, q) => (q === 'tr' || q === 'bl') ? theta : 180 - theta;

/* ── أشكال المساحة (ساحة المساحات والنسب): القياسات مكتوبة بجانبها، والارتفاع خط متقطع بعلامة قائمة ── */
const svgBox = (s, h = 180) => `<svg viewBox="0 0 320 ${h}" class="chLine" style="max-width:300px">${s}</svg>`;
const dash = (x1, y1, x2, y2) => `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${ACC}" stroke-width="2" stroke-dasharray="5 4"/>`;
const sq = (x, y, dx = 1) => `<path d="M${(x + 9 * dx).toFixed(1)} ${y} L${(x + 9 * dx).toFixed(1)} ${y - 9} L${x.toFixed(1)} ${y - 9}" fill="none" stroke="${ACC}" stroke-width="1.6"/>`;
const poly = (P, fill) => `<polygon points="${P.map(p => p.map(v => v.toFixed(1)).join(',')).join(' ')}" fill="${fill}" stroke="${INK}" stroke-width="2.5"/>`;
/* مثلث: القاعدة b والارتفاع h، ورأسه فوق نقطة على بُعد off من طرف القاعدة (off = 0 مثلث قائم) */
export function tri(b, h, { off = .35, unit = 'سم', hl = null } = {}) {
  const k = Math.min(230 / b, 120 / h), x0 = 160 - b * k / 2, y0 = 146, ax = x0 + off * b * k, ay = y0 - h * k;
  return svgBox(poly([[x0, y0], [x0 + b * k, y0], [ax, ay]], '#FFE3A3') + dash(ax, ay, ax, y0) + sq(ax, y0) + T(160, y0 + 22, `${hl ?? ar(b)} ${unit}`, 14) + T(ax + (off > .5 ? -26 : 28), (ay + y0) / 2 + 5, `${ar(h)} ${unit}`, 13, ACC));
}
/* متوازي أضلاع: القاعدة b والارتفاع h */
export function para(b, h, unit = 'سم') {
  const k = Math.min(190 / b, 120 / h), s = Math.min(50, h * k * .5), x0 = 160 - (b * k + s) / 2, y0 = 146, yt = y0 - h * k;
  return svgBox(poly([[x0, y0], [x0 + b * k, y0], [x0 + b * k + s, yt], [x0 + s, yt]], '#C9E4FF') + dash(x0 + s, yt, x0 + s, y0) + sq(x0 + s, y0) + T(x0 + b * k / 2, y0 + 22, `${ar(b)} ${unit}`, 14) + T(x0 + s + 26, (yt + y0) / 2 + 5, `${ar(h)} ${unit}`, 13, ACC));
}
/* شبه منحرف: الضلعان المتوازيان a (أعلى) وb (أسفل) والارتفاع h */
export function trap(a, b, h, unit = 'سم') {
  const k = Math.min(230 / Math.max(a, b), 110 / h), y0 = 146, yt = y0 - h * k, xb = 160 - b * k / 2, xa = 160 - a * k / 2;
  return svgBox(poly([[xb, y0], [xb + b * k, y0], [xa + a * k, yt], [xa, yt]], '#D8F0C8') + dash(xa, yt, xa, y0) + sq(xa, y0) + T(160, y0 + 22, `${ar(b)} ${unit}`, 14) + T(160, yt - 8, `${ar(a)} ${unit}`, 14) + T(xa + 24, (yt + y0) / 2 + 5, `${ar(h)} ${unit}`, 13, ACC), 176);
}
/* دائرة: part = 'r' (نصف قطر) أو 'd' (قطر) أو 'c' (المحيط) أو 'o' (المركز)، وlab نص على الجزء */
export function circ(part, lab = '') {
  const c = [160, 92], r = 72, a = rad(-25);
  let s = `<circle cx="${c[0]}" cy="${c[1]}" r="${r}" fill="#FFF1D6" stroke="${part === 'c' ? ACC : INK}" stroke-width="${part === 'c' ? 5 : 2.5}"/>`;
  if (part === 'r') s += `<line x1="${c[0]}" y1="${c[1]}" x2="${(c[0] + Math.cos(a) * r).toFixed(1)}" y2="${(c[1] - Math.sin(a) * r).toFixed(1)}" stroke="${ACC}" stroke-width="3.5"/>` + T(c[0] + 38, c[1] + 26, lab, 14, ACC);
  if (part === 'd') s += `<line x1="${c[0] - r}" y1="${c[1]}" x2="${c[0] + r}" y2="${c[1]}" stroke="${ACC}" stroke-width="3.5"/>` + T(c[0] + 30, c[1] - 8, lab, 14, ACC);
  if (part === 'c' && lab) s += T(c[0], c[1] - r - 8, lab, 14, ACC);
  s += `<circle cx="${c[0]}" cy="${c[1]}" r="${part === 'o' ? 6 : 3.5}" fill="${part === 'o' ? ACC : INK}"/>`;
  return svgBox(s, 180);
}

/* علامات العدّ (حزم خماسية: أربعة خطوط يقطعها خامس)، لورقة جمع البيانات */
export function tally(n) {
  let s = '', x = 6;
  for (let g = 0; g < Math.ceil(n / 5); g++) {
    const k = Math.min(5, n - g * 5);
    for (let i = 0; i < Math.min(k, 4); i++) s += `<line x1="${x + i * 7}" y1="4" x2="${x + i * 7}" y2="30" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`;
    if (k === 5) s += `<line x1="${x - 4}" y1="26" x2="${x + 25}" y2="8" stroke="${ACC}" stroke-width="2.4" stroke-linecap="round"/>`;
    x += 40;
  }
  return `<svg viewBox="0 0 ${Math.max(40, x)} 34" class="chTally" style="height:30px;direction:ltr">${s}</svg>`;
}
/* خصائص الأشكال (أيقونات content/chGeo.js shape): [الاسم، خطوط التماثل، رتبة التماثل الدوراني] */
export const SYM = { square: ['مربع', 4, 4], rect: ['مستطيل', 2, 2], rhombus: ['معين', 2, 2], para: ['متوازي أضلاع', 0, 2], trap: ['شبه منحرف متطابق الساقين', 1, 1],
  kite: ['طائرة ورقية', 1, 1], triangle: ['مثلث متطابق الضلعين', 1, 1], n3: ['مثلث متطابق الأضلاع', 3, 3], n5: ['خماسي منتظم', 5, 5], n6: ['سداسي منتظم', 6, 6], n8: ['ثماني منتظم', 8, 8] };

/* ── المستوى الإحداثي بالأرباع الأربعة (ورشة الرسوم والمجسمات): نقاط بحروف، وخطوط رأسية س = ك أو أفقية ص = ك أو مائلة ص = م س + ج ── */
export function plane({ n = 5, pts = [], lines = [] } = {}) {
  const s = 22, O = n * s + 16, X = x => O + x * s, Y = y => O - y * s, W = 2 * O, lab = v => ar(v).replace(/[⁦⁩]/g, '');
  let g = `<svg viewBox="0 0 ${W} ${W}" class="chGrid" style="max-width:270px">`;
  for (let i = -n; i <= n; i++) g += `<line x1="${X(i)}" y1="${Y(-n)}" x2="${X(i)}" y2="${Y(n)}" stroke="#D5DBE8"/><line x1="${X(-n)}" y1="${Y(i)}" x2="${X(n)}" y2="${Y(i)}" stroke="#D5DBE8"/>`;
  g += `<line x1="${X(-n) - 6}" y1="${Y(0)}" x2="${X(n) + 6}" y2="${Y(0)}" stroke="${INK}" stroke-width="2"/><line x1="${X(0)}" y1="${Y(-n) + 6}" x2="${X(0)}" y2="${Y(n) - 6}" stroke="${INK}" stroke-width="2"/>`;
  for (let i = -n; i <= n; i++) if (i) g += T(X(i), Y(0) + 14, lab(i), 9) + T(X(0) - 10, Y(i) + 4, lab(i), 9);
  g += T(X(n) + 4, Y(0) - 6, 'س', 11, ACC) + T(X(0) + 10, Y(n) + 2, 'ص', 11, ACC);
  lines.forEach(L => {
    let p1, p2;
    if (L.x != null) { p1 = [L.x, -n]; p2 = [L.x, n]; } else if (L.y != null) { p1 = [-n, L.y]; p2 = [n, L.y]; }
    else { const xs = []; for (let x = -n; x <= n; x += .05) { const y = L.m * x + L.c; if (y >= -n - 1e-9 && y <= n + 1e-9) xs.push(x); } if (!xs.length) return; p1 = [xs[0], L.m * xs[0] + L.c]; p2 = [xs[xs.length - 1], L.m * xs[xs.length - 1] + L.c]; }
    g += `<line x1="${X(p1[0]).toFixed(1)}" y1="${Y(p1[1]).toFixed(1)}" x2="${X(p2[0]).toFixed(1)}" y2="${Y(p2[1]).toFixed(1)}" stroke="${L.col || ACC}" stroke-width="3"/>`;
    if (L.l) g += T(X(p2[0]) + (L.x != null ? 14 : -8), Y(p2[1]) + (L.y != null ? -6 : 14), L.l, 12, L.col || ACC);
  });
  pts.forEach(p => { g += `<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="4.5" fill="${p.c || ACC}"/>` + (p.l ? T(X(p.x) + 10, Y(p.y) - 7, p.l, 13, p.c || ACC) : ''); });
  return g + '</svg>';
}
/* متوازي مستطيلات بأبعاده (مسقط مائل): ط × ع × ر */
export function cuboid(l, w, h, unit = 'سم') {
  const k = Math.min(150 / (l + w * .5), 110 / (h + w * .5)), L = l * k, Wd = w * k * .5, H = h * k, x0 = 50, y0 = 150;
  const f = [[x0, y0], [x0 + L, y0], [x0 + L, y0 - H], [x0, y0 - H]], top = [[x0, y0 - H], [x0 + L, y0 - H], [x0 + L + Wd, y0 - H - Wd], [x0 + Wd, y0 - H - Wd]], side = [[x0 + L, y0], [x0 + L + Wd, y0 - Wd], [x0 + L + Wd, y0 - H - Wd], [x0 + L, y0 - H]];
  return svgBox(poly(f, '#FFE3A3') + poly(top, '#FFF1D6') + poly(side, '#F2C76E') + T(x0 + L / 2, y0 + 20, `${ar(l)} ${unit}`, 13) + T(x0 - 6 - 16, y0 - H / 2 + 4, `${ar(h)} ${unit}`, 13) + T(x0 + L + Wd / 2 + 26, y0 - Wd / 2 + 8, `${ar(w)} ${unit}`, 13), 180);
}
