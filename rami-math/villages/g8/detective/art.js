// رسوم مشتركة لمشاهد دروس «مكتب المحقق»: لوح الأدلة الفلّيني بدبابيس وخيوط حمراء، وبطاقة دليل، ومصباح المكتب، وخط الأعداد بمجموعة الحل
// (طرف بدائرة مفتوحة أو مغلقة وشعاع)، وشاهدان بفقاعتي كلام، وخزنة بقفلين. ما يُطلب حسابه يبقى «؟» حتى يحلّ الطالب (S.done).
import { N } from '../../math.js';
export const INKC = '#2B2118', RED = '#B91C1C', NAVY = '#1E3A8A', GOLD = '#FACC15', GREEN = '#15803D';

/* خلفية المكتب: جدار خشبي داكن، ولوح فلّين بدبابيس وخيوط، وضوء مصباح دائري */
export function officeBg(g, w, h, t = 0) {
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#F5EBDD'); gr.addColorStop(1, '#E7D3B5'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(120,80,40,.08)'; for (let x = 0; x < w; x += 46) g.fillRect(x, 0, 2, h);
  const lg = g.createRadialGradient(w * .5, h * .05, 10, w * .5, h * .05, h * .9); lg.addColorStop(0, 'rgba(255,240,190,.45)'); lg.addColorStop(1, 'rgba(255,240,190,0)'); g.fillStyle = lg; g.fillRect(0, 0, w, h);
  g.fillStyle = '#334155'; g.beginPath(); g.moveTo(w * .5 - 30, 0); g.lineTo(w * .5 + 30, 0); g.lineTo(w * .5 + 18, 16); g.lineTo(w * .5 - 18, 16); g.fill(); g.fillStyle = '#FEF3C7'; g.beginPath(); g.arc(w * .5, 18, 6 + Math.sin(t * 2) * .4, 0, 7); g.fill();
}
export function say(g, txt, x, y, s = 16, col = INKC, wt = 800) { g.font = `${wt} ${s}px Cairo`; g.textAlign = 'center'; g.direction = 'rtl'; g.fillStyle = col; g.fillText(txt, x, y); }
export const glow = (g, w, h, S) => { if (S.pulse > 0) { g.strokeStyle = `rgba(34,197,94,${S.pulse})`; g.lineWidth = 6; g.strokeRect(4, 4, w - 8, h - 8); } };
/* لوح فلّين بإطار خشبي */
export function cork(g, x, y, w, h) { g.fillStyle = '#6B4320'; g.beginPath(); g.roundRect(x - 8, y - 8, w + 16, h + 16, 8); g.fill(); g.fillStyle = '#C8955A'; g.fillRect(x, y, w, h); g.fillStyle = 'rgba(90,50,20,.18)'; for (let k = 0; k < 140; k++) { const px = x + (k * 73 % w), py = y + (k * 151 % h); g.fillRect(px, py, 2, 2); } }
/* بطاقة دليل مثبتة بدبوس، فيها سطر أو سطران */
export function note(g, x, y, w, h, lines, { col = '#FFFBEB', tilt = 0, pin = RED, hl = false } = {}) {
  g.save(); g.translate(x + w / 2, y + h / 2); g.rotate(tilt); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(-w / 2 + 3, -h / 2 + 4, w, h); g.fillStyle = hl ? '#DCFCE7' : col; g.fillRect(-w / 2, -h / 2, w, h);
  if (hl) { g.strokeStyle = GREEN; g.lineWidth = 3; g.strokeRect(-w / 2, -h / 2, w, h); }
  g.fillStyle = pin; g.beginPath(); g.arc(0, -h / 2 + 7, 5, 0, 7); g.fill();
  lines.forEach((l, k) => say(g, l, 0, -h / 2 + 30 + k * 24 + (lines.length === 1 ? (h - 50) / 2 : 0), Math.min(19, w / 9), INKC, 900)); g.restore();
}
/* خيط أحمر بين نقطتين (مرتخٍ قليلاً) */
export function thread(g, a, b) { g.strokeStyle = 'rgba(185,28,28,.8)'; g.lineWidth = 2; g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo((a[0] + b[0]) / 2, Math.max(a[1], b[1]) + 18, b[0], b[1]); g.stroke(); }
/* خط الأعداد من lo إلى hi، ومجموعة الحل sol = { v, closed, right } (أو null) */
export function numLine(g, x, y, w, lo, hi, sol, { step = 1, col = NAVY, label = 1 } = {}) {
  const X = v => x + (v - lo) / (hi - lo) * w;
  g.strokeStyle = '#334155'; g.lineWidth = 3; g.beginPath(); g.moveTo(x - 14, y); g.lineTo(x + w + 14, y); g.stroke();
  [[x - 14, -1], [x + w + 14, 1]].forEach(([xx, d]) => { g.fillStyle = '#334155'; g.beginPath(); g.moveTo(xx + d * 8, y); g.lineTo(xx - d * 2, y - 6); g.lineTo(xx - d * 2, y + 6); g.fill(); });
  for (let v = lo; v <= hi + 1e-9; v += step) { const xx = X(v); g.lineWidth = 2; g.beginPath(); g.moveTo(xx, y - 7); g.lineTo(xx, y + 7); g.stroke(); if (Math.round(v / step) % label === 0) say(g, N(Math.round(v * 100) / 100), xx, y + 28, 14, '#334155'); }
  if (!sol) return; const sx = X(Math.max(lo, Math.min(hi, sol.v))), ex = sol.right ? x + w + 10 : x - 10;
  g.strokeStyle = col; g.lineWidth = 5; g.beginPath(); g.moveTo(sx, y - 16); g.lineTo(ex, y - 16); g.stroke(); g.fillStyle = col; const d = sol.right ? 1 : -1; g.beginPath(); g.moveTo(ex + d * 10, y - 16); g.lineTo(ex - d * 2, y - 23); g.lineTo(ex - d * 2, y - 9); g.fill();
  g.lineWidth = 3; g.fillStyle = sol.closed ? col : '#FFFFFF'; g.beginPath(); g.arc(sx, y - 16, 8, 0, 7); g.fill(); g.stroke();
}
/* شاهد بفقاعة كلام */
export function witness(g, x, y, s, col, txt) {
  g.fillStyle = col; g.beginPath(); g.arc(x, y - s * 1.3, s * .42, 0, 7); g.fill(); g.beginPath(); g.moveTo(x - s * .6, y); g.quadraticCurveTo(x, y - s * 1.3, x + s * .6, y); g.fill();
  g.fillStyle = '#FFFFFF'; g.strokeStyle = '#94A3B8'; g.lineWidth = 2; const bw = Math.max(120, txt.length * 9), bx = x - bw / 2, by = y - s * 2.6;
  g.beginPath(); g.roundRect(bx, by, bw, 34, 12); g.fill(); g.stroke(); g.beginPath(); g.moveTo(x - 6, by + 34); g.lineTo(x, by + 44); g.lineTo(x + 6, by + 34); g.fill(); say(g, txt, x, by + 23, 15, INKC, 900);
}
/* خزنة بقفلين: قيمتا س وص على القرصين (أو «؟») */
export function safe(g, cx, cy, s, a, b, open = false) {
  g.fillStyle = '#374151'; g.beginPath(); g.roundRect(cx - s, cy - s * .8, s * 2, s * 1.6, 12); g.fill(); g.fillStyle = '#4B5563'; g.beginPath(); g.roundRect(cx - s * .9, cy - s * .7, s * 1.8, s * 1.4, 10); g.fill();
  [[-.45, 'س', a], [.45, 'ص', b]].forEach(([o, l, v]) => { const x = cx - o * s; g.fillStyle = '#9CA3AF'; g.beginPath(); g.arc(x, cy, s * .32, 0, 7); g.fill(); g.fillStyle = '#E5E7EB'; g.beginPath(); g.arc(x, cy, s * .24, 0, 7); g.fill(); say(g, v, x, cy + 7, 18, NAVY, 900); say(g, l, x, cy - s * .42, 15, '#F9FAFB', 900); });
  if (open) { g.fillStyle = 'rgba(250,204,21,.35)'; g.beginPath(); g.roundRect(cx - s, cy - s * .8, s * 2, s * 1.6, 12); g.fill(); }
}
