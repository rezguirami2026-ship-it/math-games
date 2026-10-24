// رسوم مشتركة لمشاهد دروس «مصبغة الألوان»: خلفية المصبغة بأقمشة معلّقة تتموج، ونص، وحوض صبغ بلون الخليط، وشريط أجزاء النسبة،
// وأكياس نقود للمشاركة، وميزان بضاعة، وبطاقة سعر. ما يُطلب حسابه يبقى «؟» حتى يحلّ الطالب (S.done).
import { N } from '../../math.js';
export const INKC = '#2B2118', TEAL = '#0F766E', PURPLE = '#7C3AED', GOLD = '#FACC15';
export const ratio = a => a.map(v => typeof v === 'number' ? N(v) : v).join(' : ');

/* خلفية المصبغة: جدار طيني، وحبال عليها أقمشة مصبوغة تتموج */
export function dyeBg(g, w, h, t = 0) {
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#FBF1E1'); gr.addColorStop(.7, '#F3E1C4'); gr.addColorStop(1, '#E4C9A0'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  const cols = ['#DC2626', '#2563EB', '#FACC15', '#16A34A', '#7C3AED', '#F97316'], n = Math.max(4, Math.round(w / 90));
  g.strokeStyle = 'rgba(90,60,30,.4)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, 14); g.quadraticCurveTo(w / 2, 30, w, 14); g.stroke();
  for (let k = 0; k < n; k++) { const x = (k + .5) * w / n, y = 14 + Math.sin(Math.PI * (k + .5) / n) * 14, cw = w / n * .62, ch = h * .2;
    g.fillStyle = cols[k % cols.length]; g.globalAlpha = .28; g.beginPath(); g.moveTo(x - cw / 2, y);
    for (let q = 0; q <= 6; q++) { const yy = y + ch * q / 6; g.lineTo(x - cw / 2 + Math.sin(t * 2 + k + q) * 2, yy); }
    g.lineTo(x + cw / 2 + Math.sin(t * 2 + k + 6) * 2, y + ch); for (let q = 6; q >= 0; q--) g.lineTo(x + cw / 2 + Math.sin(t * 2 + k + q) * 2, y + ch * q / 6); g.closePath(); g.fill(); g.globalAlpha = 1; }
}
export function say(g, txt, x, y, s = 16, col = INKC, wt = 800) { g.font = `${wt} ${s}px Cairo`; g.textAlign = 'center'; g.direction = 'rtl'; g.fillStyle = col; g.fillText(txt, x, y); }
export const glow = (g, w, h, S) => { if (S.pulse > 0) { g.strokeStyle = `rgba(34,197,94,${S.pulse})`; g.lineWidth = 6; g.strokeRect(4, 4, w - 8, h - 8); } };
const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
/* لون الخليط: متوسط الألوان بأوزان الأجزاء */
export function mixCol(parts, cols) { const T = parts.reduce((a, b) => a + b, 0) || 1, c = [0, 0, 0]; parts.forEach((p, k) => hex(cols[k]).forEach((v, i) => { c[i] += v * p / T; })); return `rgb(${c.map(Math.round).join(',')})`; }
/* حوض صبغ خشبي فيه سائل بلون col، يتموج */
export function vat(g, cx, by, r, col, t = 0, label = '') {
  g.fillStyle = 'rgba(0,0,0,.15)'; g.beginPath(); g.ellipse(cx + 6, by + 4, r * 1.05, r * .28, 0, 0, 7); g.fill();
  g.fillStyle = '#8B5A2B'; g.beginPath(); g.moveTo(cx - r, by - r * 1.1); g.lineTo(cx - r * .88, by); g.quadraticCurveTo(cx, by + r * .3, cx + r * .88, by); g.lineTo(cx + r, by - r * 1.1); g.closePath(); g.fill();
  g.strokeStyle = '#5B3A1A'; g.lineWidth = 4; [.3, .75].forEach(u => { g.beginPath(); g.moveTo(cx - r * (1 - u * .12), by - r * 1.1 * (1 - u)); g.quadraticCurveTo(cx, by - r * 1.1 * (1 - u) + r * .3, cx + r * (1 - u * .12), by - r * 1.1 * (1 - u)); g.stroke(); });
  g.fillStyle = '#6B4320'; g.beginPath(); g.ellipse(cx, by - r * 1.1, r, r * .3, 0, 0, 7); g.fill();
  g.fillStyle = col; g.beginPath(); g.ellipse(cx, by - r * 1.06, r * .9, r * .25, 0, 0, 7); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 2; g.beginPath(); g.ellipse(cx + Math.sin(t * 1.5) * r * .2, by - r * 1.06, r * .3, r * .07, 0, 0, 7); g.stroke();
  if (label) say(g, label, cx, by + r * .55, 15, '#5B3A1A', 900);
}
/* شريط أجزاء النسبة: لكل جزء مربع بلون صاحبه، من اليمين */
export function partsBar(g, x, y, w, parts, cols, names = [], { hh = 30, vals = null } = {}) {
  const T = parts.reduce((a, b) => a + b, 0) || 1, u = w / T; let xx = x + w;
  parts.forEach((p, k) => { for (let q = 0; q < p; q++) { xx -= u; g.fillStyle = cols[k]; g.fillRect(xx + 1, y, u - 2, hh); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 1; g.strokeRect(xx + 1, y, u - 2, hh); }
    const mid = xx + p * u / 2; if (names[k]) say(g, names[k], mid, y + hh + 20, 14, '#334155'); if (vals && vals[k] != null) say(g, vals[k], mid, y + hh + 40, 15, cols[k] === '#FACC15' ? '#A16207' : cols[k], 900); });
}
/* كيس نقود بقيمته (أو «؟») */
export function bag(g, cx, by, s, txt, col = '#B45309') {
  g.fillStyle = 'rgba(0,0,0,.14)'; g.beginPath(); g.ellipse(cx + 3, by, s * .6, s * .15, 0, 0, 7); g.fill();
  g.fillStyle = col; g.beginPath(); g.moveTo(cx - s * .18, by - s * 1.02); g.quadraticCurveTo(cx - s * .62, by - s * .5, cx - s * .5, by - s * .08); g.quadraticCurveTo(cx, by + s * .05, cx + s * .5, by - s * .08); g.quadraticCurveTo(cx + s * .62, by - s * .5, cx + s * .18, by - s * 1.02); g.closePath(); g.fill();
  g.fillStyle = '#78350F'; g.fillRect(cx - s * .22, by - s * 1.08, s * .44, s * .1);
  say(g, txt, cx, by - s * .38, Math.min(18, s * .3), '#FFFBEB', 900);
}
/* بطاقة سعر صغيرة */
export function price(g, x, y, l1, l2, col = TEAL) { g.fillStyle = col; g.beginPath(); g.roundRect(x - 62, y, 124, 54, 10); g.fill(); say(g, l1, x, y + 22, 14, '#FFFFFF'); say(g, l2, x, y + 45, 17, '#FFFFFF', 900); }
/* «ريال» بعد العدد بتمييزه: ٣–١٠ ريالات، ١١–٩٩ ريالاً، وغيرها ريال */
export const riyal = n => { const m = Math.round(n) % 100; return `${N(n)} ${n % 1 ? 'ريال' : m >= 3 && m <= 10 ? 'ريالات' : m >= 11 ? 'ريالاً' : 'ريال'}`; };
