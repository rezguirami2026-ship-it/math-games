// رسوم «تحدي الشخصية» (SVG/HTML صغيرة تُعرض فوق السؤال عبر item.art): مسطرة، إبريق قياس، ساعة عقارب، جدول زمني، تقويم، أشكال على شبكة.
// كل الأعداد بالأرقام الهندية عبر ar()، والوقت الرقمي يبقى من اليسار إلى اليمين.
import { ar } from '../core/util.js';

// النص عربي (من اليمين): a:'start' = يبدأ النص من x متجهاً يميناً بعيداً عن الشكل، و a:'end' = ينتهي عند x
const INK = '#2A1B66', ACC = '#E2475C', T = (x, y, s, o = {}) => `<text x="${x}" y="${y}" direction="rtl" text-anchor="${({ start: 'end', end: 'start' })[o.a] || 'middle'}" font-size="${o.fs || 12}" font-weight="${o.fw || 900}" fill="${o.c || INK}" font-family="Cairo,sans-serif">${s}</text>`;
export const pad2 = n => (n < 10 ? '0' : '') + n;
export const clock24 = (h, m) => `<span class="ltr" dir="ltr">${ar(pad2(h))}:${ar(pad2(m))}</span>`;   // ١٤:٠٥
export const dec = v => ar(String(+(+v).toFixed(3))).replace('.', '٫');

/* مسطرة من ٠ إلى cm سنتيمتر: arrow = موضع سهم (سم)، seg = [من، إلى] خط ملوّن فوقها */
export function ruler({ cm = 10, arrow = null, seg = null } = {}) {
  const x0 = 14, W = 292, k = W / cm, y = 44; let s = `<svg viewBox="0 0 320 ${seg ? 92 : 84}" class="chLine">`;
  if (seg) s += `<line x1="${x0 + seg[0] * k}" y1="20" x2="${x0 + seg[1] * k}" y2="20" stroke="${ACC}" stroke-width="5" stroke-linecap="butt"/><line x1="${x0 + seg[0] * k}" y1="14" x2="${x0 + seg[0] * k}" y2="${y}" stroke="${ACC}" stroke-dasharray="2 2"/><line x1="${x0 + seg[1] * k}" y1="14" x2="${x0 + seg[1] * k}" y2="${y}" stroke="${ACC}" stroke-dasharray="2 2"/>`;
  s += `<rect x="4" y="${y}" width="312" height="34" rx="4" fill="#F7DE8F" stroke="#B8902E"/>`;
  for (let i = 0; i <= cm * 10; i++) { const x = x0 + i * k / 10, L = i % 10 === 0 ? 13 : i % 5 === 0 ? 9 : 5; s += `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + L}" stroke="${INK}" stroke-width="${i % 10 ? .7 : 1.2}"/>`; if (i % 10 === 0) s += T(x, y + 27, ar(i / 10), { fs: 11 }); }
  if (arrow != null) s += `<path d="M${x0 + arrow * k} ${y - 2} l-7 -14 h14z" fill="${ACC}"/>`;
  return s + '</svg>';
}
/* إبريق قياس حتى max مل، مستوى السائل level مل */
export function jug({ max = 1000, step = 100, level }) {
  const top = 14, bot = 150, H = bot - top, y = v => bot - v / max * H; let s = `<svg viewBox="0 0 215 165" class="chJug">`;
  s += `<rect x="60" y="${y(level)}" width="80" height="${bot - y(level)}" fill="#7CC4F5" opacity=".85"/><path d="M60 ${top - 6} V${bot} H140 V${top - 6}" fill="none" stroke="${INK}" stroke-width="3"/>`;
  for (let v = step; v <= max; v += step) s += `<line x1="140" y1="${y(v)}" x2="${v % (step * 2) ? 128 : 122}" y2="${y(v)}" stroke="${INK}" stroke-width="1.4"/>` + (v % (step * 2) === 0 ? T(150, y(v) + 4, ar(v), { a: "start", fs: 12 }) : '');
  for (let v = step / 2; v < max; v += step) s += `<line x1="140" y1="${y(v)}" x2="133" y2="${y(v)}" stroke="${INK}" stroke-width=".8"/>`;
  return s + T(30, 90, 'مل', { fs: 13 }) + '</svg>';
}
/* ساعة عقارب */
export function analog(h, m) {
  const c = 70, hr = (h % 12 + m / 60) * 30 * Math.PI / 180, mn = m * 6 * Math.PI / 180; let s = `<svg viewBox="0 0 140 140" class="chClock"><circle cx="${c}" cy="${c}" r="64" fill="#FFFDF6" stroke="${INK}" stroke-width="4"/>`;
  for (let i = 0; i < 60; i++) { const a = i * 6 * Math.PI / 180, r1 = i % 5 ? 58 : 54; s += `<line x1="${c + Math.sin(a) * r1}" y1="${c - Math.cos(a) * r1}" x2="${c + Math.sin(a) * 61}" y2="${c - Math.cos(a) * 61}" stroke="${INK}" stroke-width="${i % 5 ? .8 : 2}"/>`; }
  for (let i = 1; i <= 12; i++) { const a = i * 30 * Math.PI / 180; s += T(c + Math.sin(a) * 45, c - Math.cos(a) * 45 + 5, ar(i), { fs: 14 }); }
  s += `<line x1="${c}" y1="${c}" x2="${c + Math.sin(hr) * 32}" y2="${c - Math.cos(hr) * 32}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><line x1="${c}" y1="${c}" x2="${c + Math.sin(mn) * 50}" y2="${c - Math.cos(mn) * 50}" stroke="${ACC}" stroke-width="3" stroke-linecap="round"/><circle cx="${c}" cy="${c}" r="4" fill="${INK}"/>`;
  return s + '</svg>';
}
/* جدول زمني: rows = [[اسم المحطة، [دقائق منذ منتصف الليل لكل رحلة]]] */
export function timetable(head, rows) {
  const cell = t => clock24(Math.floor(t / 60), t % 60);
  return `<table class="chTable"><tr><th>المحطة</th>${head.map(h => `<th>${h}</th>`).join('')}</tr>${rows.map(([n, ts]) => `<tr><th>${n}</th>${ts.map(t => `<td>${cell(t)}</td>`).join('')}</tr>`).join('')}</table>`;
}
/* تقويم شهر: first = يوم بداية الشهر (٠ الأحد … ٦ السبت)، days = عدد أيامه، marks = أيام مظللة */
export const WEEK = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
export function calendar(name, first, days, marks = []) {
  const cells = []; for (let i = 0; i < first; i++) cells.push('<td></td>');
  for (let d = 1; d <= days; d++) cells.push(`<td class="${marks.includes(d) ? 'mk' : ''}">${ar(d)}</td>`);
  while (cells.length % 7) cells.push('<td></td>');
  const rows = []; for (let i = 0; i < cells.length; i += 7) rows.push(`<tr>${cells.slice(i, i + 7).join('')}</tr>`);
  return `<table class="chCal"><caption>${name}</caption><tr>${WEEK.map(w => `<th>${w.replace('ال', '').slice(0, 5)}</th>`).join('')}</tr>${rows.join('')}</table>`;
}
/* مستطيل بأبعاده، أو شكل L (مستطيل W×H قُصّ من زاويته العليا اليسرى w×h) */
export function rect(W, H, unit = 'م') {
  const k = Math.min(200 / W, 110 / H), w = W * k, h = H * k, x = 160 - w / 2, y = 14;
  return `<svg viewBox="0 0 320 ${h + 46}" class="chLine"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#CDEBC4" stroke="${INK}" stroke-width="2.5"/>
    ${T(160, y + h + 20, `${ar(W)} ${unit}`, { fs: 14 })}${T(x + w + 8, y + h / 2 + 5, `${ar(H)} ${unit}`, { fs: 14, a: 'start' })}</svg>`;
}
export function lshape(W, H, w, h, unit = 'م') {
  const k = Math.min(200 / W, 120 / H), X = 160 - W * k / 2, Y = 26, p = (a, b) => `${X + a * k},${Y + b * k}`;
  return `<svg viewBox="0 0 320 ${H * k + 58}" class="chLine"><polygon points="${p(w, 0)} ${p(W, 0)} ${p(W, H)} ${p(0, H)} ${p(0, h)} ${p(w, h)}" fill="#CDEBC4" stroke="${INK}" stroke-width="2.5"/>
    ${T(X + W / 2 * k, Y + H * k + 20, `${ar(W)} ${unit}`, { fs: 13 })}${T(X + W * k + 6, Y + H / 2 * k + 5, `${ar(H)} ${unit}`, { fs: 13, a: 'start' })}
    ${T(X + (w + W) / 2 * k, Y - 7, `${ar(W - w)} ${unit}`, { fs: 13 })}${T(X - 6, Y + (h + H) / 2 * k + 5, `${ar(H - h)} ${unit}`, { fs: 13, a: 'end' })}</svg>`;
}
/* شكل غير منتظم على شبكة: full = خلايا كاملة [[c,r]]، half = خلايا نصفية [[c,r,اتجاه]] */
export function gridShape(cols, rows, full, half) {
  const s = 24, X = 160 - cols * s / 2; let g = `<svg viewBox="0 0 320 ${rows * s + 8}" class="chLine">`;
  full.forEach(([c, r]) => g += `<rect x="${X + c * s}" y="${4 + r * s}" width="${s}" height="${s}" fill="#8FD18A"/>`);
  half.forEach(([c, r, d]) => { const x = X + c * s, y = 4 + r * s, P = [[x, y], [x + s, y], [x + s, y + s], [x, y + s]]; P.splice(d, 1); g += `<polygon points="${P.map(q => q.join(',')).join(' ')}" fill="#8FD18A"/>`; });
  for (let c = 0; c <= cols; c++) g += `<line x1="${X + c * s}" y1="4" x2="${X + c * s}" y2="${4 + rows * s}" stroke="#9AA3B8" stroke-width=".8"/>`;
  for (let r = 0; r <= rows; r++) g += `<line x1="${X}" y1="${4 + r * s}" x2="${X + cols * s}" y2="${4 + r * s}" stroke="#9AA3B8" stroke-width=".8"/>`;
  return g + '</svg>';
}
/* خط أعداد من lo إلى hi بعلامات كل step، وسهم عند v (labels: أي العلامات تُكتب) */
export function nline(lo, hi, v, step, every = 1) {
  const x = t => 20 + (t - lo) / (hi - lo) * 280, sgn = n => ar(n); let s = `<svg viewBox="0 0 320 72" class="chLine"><line x1="14" y1="40" x2="306" y2="40" stroke="${INK}" stroke-width="3"/>`;
  for (let t = lo, i = 0; t <= hi + 1e-9; t += step, i++) { s += `<line x1="${x(t)}" y1="32" x2="${x(t)}" y2="48" stroke="${INK}" stroke-width="2"/>`; if (i % every === 0) s += `<text x="${x(t)}" y="66" text-anchor="middle" font-size="12" font-weight="900" fill="${INK}" font-family="Cairo,sans-serif" direction="ltr">${sgn(+t.toFixed(3)).replace('.', '٫')}</text>`; }
  return s + (v != null ? `<path d="M${x(v)} 30 l-7 -14 h14z" fill="${ACC}"/>` : '') + '</svg>';
}
/* ميزان بقرص دائري من ٠ إلى max كغم، كل كيلوغرام ١٠ أقسام، والمؤشر عند v */
export function dial(max, v) {
  const c = [110, 110], r = 88, ang = t => (-120 + t / max * 240) * Math.PI / 180; let s = `<svg viewBox="0 0 220 200" class="chClock" style="width:180px;height:165px"><circle cx="110" cy="110" r="100" fill="#FFFDF6" stroke="${INK}" stroke-width="4"/>`;
  for (let i = 0; i <= max * 10; i++) { const a = ang(i / 10), r1 = i % 10 ? (i % 5 ? 80 : 76) : 70; s += `<line x1="${c[0] + Math.sin(a) * r1}" y1="${c[1] - Math.cos(a) * r1}" x2="${c[0] + Math.sin(a) * r}" y2="${c[1] - Math.cos(a) * r}" stroke="${INK}" stroke-width="${i % 10 ? .9 : 2.2}"/>`; if (i % 10 === 0) s += T(c[0] + Math.sin(a) * 56, c[1] - Math.cos(a) * 56 + 5, ar(i / 10), { fs: 15 }); }
  const a = ang(v); return s + T(110, 160, 'كغم', { fs: 13 }) + `<line x1="110" y1="110" x2="${c[0] + Math.sin(a) * 84}" y2="${c[1] - Math.cos(a) * 84}" stroke="${ACC}" stroke-width="3.5" stroke-linecap="round"/><circle cx="110" cy="110" r="6" fill="${ACC}"/></svg>`;
}
