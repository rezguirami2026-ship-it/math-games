// رسوم مشتركة لمشاهد دروس «محمية المها»: خلفية سهل المحمية بالسدر والكثبان ومها ترعى، ونص، ومخطط تكراري بأعمدة متلاصقة (للبيانات المتصلة)
// أو منفصلة، ومضلع تكراري بنقاط المنتصف، ورسم بياني خطي. ما يُطلب حسابه يبقى «؟» حتى يحلّ الطالب (S.done).
import { N } from '../../math.js';
export const INKC = '#2B2118', OLIVE = '#4D7C0F', SAND = '#D4A373', BROWN = '#7C2D12';

export function plainBg(g, w, h, t = 0) {
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#E0F2FE'); gr.addColorStop(.45, '#FEF3C7'); gr.addColorStop(1, '#E9C98F'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = '#D9B57A'; g.beginPath(); g.moveTo(0, h * .32); for (let x = 0; x <= w; x += 30) g.lineTo(x, h * .3 - Math.sin(x / 70) * 10); g.lineTo(w, h * .4); g.lineTo(0, h * .4); g.fill();
  for (let k = 0; k < 3; k++) { const x = ((t * 8 + k * w / 3) % (w + 60)) - 30, y = h * .3; g.fillStyle = '#F8FAFC'; g.beginPath(); g.ellipse(x, y - 8, 12, 6, 0, 0, 7); g.fill(); g.fillRect(x - 9, y - 4, 2, 8); g.fillRect(x + 7, y - 4, 2, 8); g.strokeStyle = '#334155'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x + 10, y - 12); g.lineTo(x + 16, y - 26); g.moveTo(x + 12, y - 12); g.lineTo(x + 19, y - 25); g.stroke(); }
}
export function say(g, txt, x, y, s = 16, col = INKC, wt = 800) { g.font = `${wt} ${s}px Cairo`; g.textAlign = 'center'; g.direction = 'rtl'; g.fillStyle = col; g.fillText(txt, x, y); }
export const glow = (g, w, h, S) => { if (S.pulse > 0) { g.strokeStyle = `rgba(34,197,94,${S.pulse})`; g.lineWidth = 6; g.strokeRect(4, 4, w - 8, h - 8); } };
/* محاور الرسم: الفئات على المحور الأفقي (من اليسار كما في الكتاب)، والتكرار رأسياً حتى M */
export function axes(g, x, y, w, h, M, labels, { yl = 'التكرار', title = '' } = {}) {
  g.fillStyle = 'rgba(255,255,255,.95)'; g.fillRect(x - 36, y - 26, w + 50, h + 64);
  const step = M <= 10 ? 1 : M <= 20 ? 2 : 5; g.strokeStyle = '#E2E8F0'; g.lineWidth = 1; g.font = '700 11px Cairo'; g.fillStyle = '#334155'; g.textAlign = 'right';
  for (let v = 0; v <= M; v += step) { const yy = y + h - v / M * h; g.beginPath(); g.moveTo(x, yy); g.lineTo(x + w, yy); g.stroke(); g.fillText(N(v), x - 5, yy + 4); }
  g.strokeStyle = '#334155'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + h); g.lineTo(x + w, y + h); g.stroke();
  const n = labels.length; labels.forEach((l, k) => say(g, l, x + (k + .5) * w / n, y + h + 18, 11, '#334155', 700));
  if (title) say(g, title, x + w / 2, y - 8, 13, OLIVE, 900); g.save(); g.translate(x - 28, y + h / 2); g.rotate(-Math.PI / 2); say(g, yl, 0, 0, 11, '#475569'); g.restore();
  return { X: k => x + (k + .5) * w / n, Y: v => y + h - v / M * h, bw: w / n };
}
export function bars(g, A, freqs, { col = OLIVE, gap = 0, hide = -1 } = {}) {
  freqs.forEach((f, k) => { if (f == null) return; const x = A.X(k) - A.bw / 2 + gap, w = A.bw - gap * 2, y = A.Y(f); g.fillStyle = k === hide ? 'rgba(148,163,184,.4)' : col; g.fillRect(x, y, w, A.Y(0) - y); g.strokeStyle = '#FFFFFF'; g.lineWidth = 1.5; g.strokeRect(x, y, w, A.Y(0) - y); });
}
export function polyline(g, A, freqs, col = '#DC2626') {
  g.strokeStyle = col; g.lineWidth = 3; g.beginPath(); freqs.forEach((f, k) => k ? g.lineTo(A.X(k), A.Y(f)) : g.moveTo(A.X(k), A.Y(f))); g.stroke();
  freqs.forEach((f, k) => { g.fillStyle = col; g.beginPath(); g.arc(A.X(k), A.Y(f), 4.5, 0, 7); g.fill(); });
}
/* فئة: «أ < ك ≤ ب» بالرموز كما في الكتاب */
export const cls = (a, b, v = 'ك') => `${N(a)} < ${v} ≤ ${N(b)}`;
