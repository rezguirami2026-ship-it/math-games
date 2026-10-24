// رسوم مشتركة لمشاهد دروس «منحدرات التزلج»: خلفية كثبان التزلج على الرمل بمنحدر ومصعد كراسٍ، ونص، ومستوى إحداثي بنقاط وقطع ومستقيمات
// (المحور السيني يزداد يميناً كما في الكتاب)، ومثلث الميل. ما يُطلب حسابه يبقى «؟» حتى يحلّ الطالب (S.done).
import { N } from '../../math.js';
export const INKC = '#2B2118', SKY = '#0EA5E9', SAND = '#E9C46A', ORANGE = '#EA580C', PURPLE = '#7C3AED';
export const pt = (x, y) => `(${N(x)}، ${N(y)})`;

/* خلفية المنتجع: سماء، وكثبان متدرجة، ومنحدر تزلج بلوح ينزلق، ومصعد كراسٍ بكابل */
export function duneBg(g, w, h, t = 0) {
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#BAE6FD'); gr.addColorStop(.55, '#FDE7C3'); gr.addColorStop(1, '#E9C46A'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  [[.62, '#F4D58D', .5], [.72, '#E9C46A', .8], [.84, '#D4A84F', 1]].forEach(([yy, col, k], j) => { g.fillStyle = col; g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += 20) g.lineTo(x, h * yy - Math.sin(x / w * 5 + j * 2) * h * .06 * k); g.lineTo(w, h); g.closePath(); g.fill(); });
  g.strokeStyle = 'rgba(71,85,105,.35)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(w * .05, h * .58); g.lineTo(w * .95, h * .18); g.stroke();
  for (let k = 0; k < 5; k++) { const u = ((t * .05 + k / 5) % 1), x = w * .05 + u * w * .9, y = h * .58 - u * h * .4; g.strokeStyle = 'rgba(71,85,105,.4)'; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 12); g.stroke(); g.fillStyle = ['#EF4444', '#3B82F6', '#F59E0B'][k % 3]; g.globalAlpha = .45; g.fillRect(x - 6, y + 12, 12, 6); g.globalAlpha = 1; }
}
export function say(g, txt, x, y, s = 16, col = INKC, wt = 800) { g.font = `${wt} ${s}px Cairo`; g.textAlign = 'center'; g.direction = 'rtl'; g.fillStyle = col; g.fillText(txt, x, y); }
export const glow = (g, w, h, S) => { if (S.pulse > 0) { g.strokeStyle = `rgba(34,197,94,${S.pulse})`; g.lineWidth = 6; g.strokeRect(4, 4, w - 8, h - 8); } };
/* مستوى إحداثي في مربع (x, y, s): المدى [lo, hi] للمحورين، ونقاط { p: [س، ص], l, col }، وقطع [[أ], [ب]]، ومستقيمات { m, c, col } */
export function plane(g, x, y, s, lo, hi, { pts = [], segs = [], lines = [], tri = null, lab = 1 } = {}) {
  const k = s / (hi - lo), X = v => x + (v - lo) * k, Y = v => y + s - (v - lo) * k;
  g.fillStyle = 'rgba(255,255,255,.92)'; g.fillRect(x - 6, y - 6, s + 12, s + 12);
  g.strokeStyle = '#E2E8F0'; g.lineWidth = 1; for (let v = lo; v <= hi; v++) { g.beginPath(); g.moveTo(X(v), y); g.lineTo(X(v), y + s); g.stroke(); g.beginPath(); g.moveTo(x, Y(v)); g.lineTo(x + s, Y(v)); g.stroke(); }
  g.strokeStyle = '#475569'; g.lineWidth = 2; g.beginPath(); g.moveTo(X(lo), Y(0)); g.lineTo(X(hi), Y(0)); g.moveTo(X(0), Y(lo)); g.lineTo(X(0), Y(hi)); g.stroke();
  g.font = '700 11px Cairo'; g.textAlign = 'center'; g.fillStyle = '#475569'; for (let v = lo; v <= hi; v++) { if (!v || v % lab) continue; g.fillText(N(v), X(v), Y(0) + 13); g.fillText(N(v), X(0) - 10, Y(v) + 4); }
  say(g, 'س', X(hi) - 6, Y(0) - 6, 13, '#475569'); say(g, 'ص', X(0) + 10, Y(hi) + 12, 13, '#475569');
  g.save(); g.beginPath(); g.rect(x, y, s, s); g.clip();
  lines.forEach(({ m, c, col = PURPLE, dash }) => { g.strokeStyle = col; g.lineWidth = 3; if (dash) g.setLineDash([7, 5]); g.beginPath(); g.moveTo(X(lo), Y(m * lo + c)); g.lineTo(X(hi), Y(m * hi + c)); g.stroke(); g.setLineDash([]); });
  segs.forEach(([a, b, col = '#1E3A8A']) => { g.strokeStyle = col; g.lineWidth = 3; g.beginPath(); g.moveTo(X(a[0]), Y(a[1])); g.lineTo(X(b[0]), Y(b[1])); g.stroke(); });
  if (tri) { const [a, b] = tri; g.strokeStyle = ORANGE; g.lineWidth = 2.5; g.setLineDash([5, 4]); g.beginPath(); g.moveTo(X(a[0]), Y(a[1])); g.lineTo(X(b[0]), Y(a[1])); g.lineTo(X(b[0]), Y(b[1])); g.stroke(); g.setLineDash([]); }
  g.restore();
  pts.forEach(({ p, l, col = '#1E3A8A' }) => { g.fillStyle = col; g.beginPath(); g.arc(X(p[0]), Y(p[1]), 5.5, 0, 7); g.fill(); if (l) say(g, l, X(p[0]) + 14, Y(p[1]) - 8, 13, col, 900); });
  return { X, Y };
}
