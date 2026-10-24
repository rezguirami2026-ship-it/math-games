// رسوم مشتركة لمشاهد دروس «دار الفسيفساء»: خلفية جدار مزخرف ببلاط نجمي، ونص، ومضلع منتظم أو غير منتظم بزواياه المعلَّمة، وقِطع
// البلاط حول رأس واحد، ومثلث قائم بأضلاعه، وسلّم على حائط. ما يُطلب حسابه يبقى «؟» حتى يحلّ الطالب (S.done).
import { N } from '../../math.js';
export const INKC = '#2B2118', TEAL = '#0F766E', NAVY = '#1E3A8A', GOLD = '#D97706';
export const deg = v => `${N(v)}°`;

/* خلفية الدار: جدار جصّي، وشريط بلاط نجمي ثماني بالأزرق والذهبي */
export function tileBg(g, w, h, t = 0) {
  g.fillStyle = '#FAF5EA'; g.fillRect(0, 0, w, h);
  const s = 34; for (let y = h - s * 1.6; y < h; y += s) for (let x = (y / s % 2) * s / 2 - s; x < w + s; x += s) { g.save(); g.translate(x, y); g.fillStyle = (Math.round(x / s + y / s) % 2) ? '#1E3A8A' : '#0F766E'; g.globalAlpha = .18; g.beginPath(); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4 + Math.PI / 8, r = k % 2 ? s * .22 : s * .45; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill(); g.restore(); }
  g.globalAlpha = 1; g.fillStyle = 'rgba(217,119,6,.1)'; g.fillRect(0, 0, w, 10);
}
export function say(g, txt, x, y, s = 16, col = INKC, wt = 800) { g.font = `${wt} ${s}px Cairo`; g.textAlign = 'center'; g.direction = 'rtl'; g.fillStyle = col; g.fillText(txt, x, y); }
export const glow = (g, w, h, S) => { if (S.pulse > 0) { g.strokeStyle = `rgba(34,197,94,${S.pulse})`; g.lineWidth = 6; g.strokeRect(4, 4, w - 8, h - 8); } };
/* مضلع منتظم بعدد أضلاع n في دائرة نصف قطرها r، ومُعلَّم زاوية داخلية (أو خارجية مع امتداد الضلع) */
export function regular(g, cx, cy, r, n, { fill = '#BFDBFE', lab = '', ext = '', rot = -Math.PI / 2 } = {}) {
  const P = Array.from({ length: n }, (_, k) => [cx + Math.cos(rot + k * 2 * Math.PI / n) * r, cy + Math.sin(rot + k * 2 * Math.PI / n) * r]);
  g.fillStyle = fill; g.strokeStyle = NAVY; g.lineWidth = 3; g.beginPath(); P.forEach(([x, y], k) => k ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill(); g.stroke();
  const [a, b, c] = [P[n - 1], P[0], P[1]];
  if (lab) { const a1 = Math.atan2(a[1] - b[1], a[0] - b[0]), a2 = Math.atan2(c[1] - b[1], c[0] - b[0]); g.strokeStyle = GOLD; g.lineWidth = 2; g.beginPath(); g.arc(b[0], b[1], 22, Math.min(a1, a2), Math.max(a1, a2)); g.stroke(); say(g, lab, b[0], b[1] + 40, 15, GOLD, 900); }
  if (ext) { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy); g.strokeStyle = '#DC2626'; g.setLineDash([6, 4]); g.lineWidth = 2; g.beginPath(); g.moveTo(b[0], b[1]); g.lineTo(b[0] + dx / L * 60, b[1] + dy / L * 60); g.stroke(); g.setLineDash([]); say(g, ext, b[0] + dx / L * 40 + 14, b[1] + dy / L * 40 - 8, 15, '#DC2626', 900); }
  return P;
}
/* مضلع بنقاط معطاة وزوايا معلَّمة نصاً عند كل رأس (أو «؟») */
export function poly(g, P, labs = [], { fill = '#FEF3C7' } = {}) {
  g.fillStyle = fill; g.strokeStyle = NAVY; g.lineWidth = 3; g.beginPath(); P.forEach(([x, y], k) => k ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill(); g.stroke();
  const cx = P.reduce((s, p) => s + p[0], 0) / P.length, cy = P.reduce((s, p) => s + p[1], 0) / P.length;
  P.forEach(([x, y], k) => { if (!labs[k]) return; const dx = cx - x, dy = cy - y, L = Math.hypot(dx, dy); say(g, labs[k], x + dx / L * 30, y + dy / L * 30 + 5, 14, labs[k].includes('؟') ? '#DC2626' : NAVY, 900); });
}
/* قِطع بلاط حول رأس واحد: لكل زاوية قطاع بلونه وقياسه */
export function vertex(g, cx, cy, r, angs, cols = ['#1E3A8A', '#0F766E', '#D97706', '#DB2777', '#7C3AED', '#16A34A']) {
  let a = -Math.PI / 2; angs.forEach((v, k) => { const b = a + v * Math.PI / 180; g.fillStyle = cols[k % cols.length]; g.globalAlpha = .8; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, r, a, b); g.closePath(); g.fill(); g.globalAlpha = 1; g.strokeStyle = '#FFF'; g.lineWidth = 2; g.stroke();
    const m = (a + b) / 2; say(g, deg(v), cx + Math.cos(m) * r * .62, cy + Math.sin(m) * r * .62 + 5, 13, '#FFFFFF', 900); a = b; });
  g.strokeStyle = '#94A3B8'; g.setLineDash([4, 4]); g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke(); g.setLineDash([]);
}
/* مثلث قائم (القائمة في الركن الأيمن السفلي) بأطوال الأضلاع نصاً */
export function rightTri(g, x, y, w, h, la, lb, lc) {
  g.fillStyle = '#FDE68A'; g.strokeStyle = '#92400E'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y + h); g.lineTo(x + w, y + h); g.lineTo(x + w, y); g.closePath(); g.fill(); g.stroke();
  g.strokeStyle = '#92400E'; g.lineWidth = 2; g.strokeRect(x + w - 16, y + h - 16, 16, 16);
  say(g, lb, x + w / 2, y + h + 22, 16, NAVY, 900); say(g, la, x + w + 30, y + h / 2 + 5, 16, NAVY, 900); say(g, lc, x + w / 2 - 22, y + h / 2 - 10, 16, '#DC2626', 900);
}
