// رسوم مشتركة لمشاهد دروس «محطة الأرصاد»: سماء متغيرة بغيوم تتحرك وشمس، ونص، ولوح قراءات ببطاقات، وجدول تكراري، ومقياس المدى،
// ومروحة قياس الرياح. ما يُطلب حسابه يبقى «؟» حتى يحلّ الطالب (S.done).
import { N } from '../../math.js';
export const INKC = '#2B2118', SKY = '#0369A1', TEAL = '#0F766E', ORANGE = '#EA580C';

export function skyBg(g, w, h, t = 0) {
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#BAE6FD'); gr.addColorStop(.75, '#E0F2FE'); gr.addColorStop(1, '#D9C9A8'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(250,204,21,.8)'; g.beginPath(); g.arc(w * .1, h * .12, 22, 0, 7); g.fill();
  for (let k = 0; k < 4; k++) { const x = ((t * 12 + k * w / 3) % (w + 160)) - 80, y = h * (.1 + k % 2 * .08); g.fillStyle = 'rgba(255,255,255,.85)'; [[0, 0, 22], [20, -8, 18], [38, 0, 20]].forEach(([a, b, r]) => { g.beginPath(); g.arc(x + a, y + b, r, 0, 7); g.fill(); }); }
  // مروحة الرياح (أكواب تدور) في الركن
  const cx = w * .92, cy = h * .2; g.strokeStyle = '#475569'; g.lineWidth = 3; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx, cy + h * .3); g.stroke();
  for (let k = 0; k < 3; k++) { const a = t * 4 + k * 2.09; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * 20, cy + Math.sin(a) * 7); g.stroke(); g.fillStyle = '#F97316'; g.beginPath(); g.arc(cx + Math.cos(a) * 20, cy + Math.sin(a) * 7, 5, 0, 7); g.fill(); }
}
export function say(g, txt, x, y, s = 16, col = INKC, wt = 800) { g.font = `${wt} ${s}px Cairo`; g.textAlign = 'center'; g.direction = 'rtl'; g.fillStyle = col; g.fillText(txt, x, y); }
export const glow = (g, w, h, S) => { if (S.pulse > 0) { g.strokeStyle = `rgba(34,197,94,${S.pulse})`; g.lineWidth = 6; g.strokeRect(4, 4, w - 8, h - 8); } };
/* بطاقات القراءات في صف (من اليمين)، وتُضاء البطاقات المحددة */
export function readings(g, x, y, w, vals, { hl = [], unit = '', mid = null } = {}) {
  const n = vals.length, cw = Math.min(64, w / n), x0 = x + (w - cw * n) / 2;
  vals.forEach((v, k) => { const cx = x0 + n * cw - (k + 1) * cw; const on = hl.includes(k); g.fillStyle = on ? '#DCFCE7' : '#FFFFFF'; g.strokeStyle = on ? '#16A34A' : '#94A3B8'; g.lineWidth = on ? 3 : 1.5; g.beginPath(); g.roundRect(cx + 3, y, cw - 6, 46, 8); g.fill(); g.stroke(); say(g, typeof v === 'number' ? N(v) : v, cx + cw / 2, y + 30, Math.min(18, cw * .34), on ? '#14532D' : INKC, 900); });
  if (unit) say(g, unit, x + w / 2, y + 66, 13, '#64748B');
}
/* جدول تكراري أفقي: صف القيم وصف التكرارات */
export function freqTable(g, x, y, w, head, vals, freqs, { h1 = 'القيمة', h2 = 'التكرار' } = {}) {
  const n = vals.length + 1, cw = w / n, rh = 34;
  [[h1, vals], [h2, freqs]].forEach(([hd, row], r) => { const yy = y + r * rh; g.fillStyle = '#FEF3C7'; g.fillRect(x + w - cw, yy, cw, rh); g.strokeStyle = '#D6D3D1'; g.strokeRect(x + w - cw, yy, cw, rh); say(g, hd, x + w - cw / 2, yy + 23, 12, '#7C2D12', 900);
    row.forEach((v, k) => { const xx = x + w - (k + 2) * cw; g.fillStyle = '#FFFFFF'; g.fillRect(xx, yy, cw, rh); g.strokeRect(xx, yy, cw, rh); say(g, typeof v === 'number' ? N(v) : v, xx + cw / 2, yy + 23, 14, INKC, 800); }); });
  if (head) say(g, head, x + w / 2, y - 12, 15, SKY, 900);
}
