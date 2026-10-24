// رسوم مشتركة لمشاهد دروس «مضمار السباق»: خلفية المضمار بحاراته ومدرّجه، ونص، ورسم بياني للمسافة والزمن بخطوط متصلة (لشخص أو أكثر)،
// ولوح حساب السرعة (مثلث ف ع ن). ما يُطلب حسابه يبقى «؟» حتى يحلّ الطالب (S.done).
import { N } from '../../math.js';
export const INKC = '#2B2118', RED = '#DC2626', BLUE = '#2563EB', GREEN = '#16A34A';

export function trackBg(g, w, h, t = 0) {
  g.fillStyle = '#DBEAFE'; g.fillRect(0, 0, w, h * .3); g.fillStyle = '#94A3B8'; g.fillRect(0, h * .22, w, h * .1); for (let x = 0; x < w; x += 14) { g.fillStyle = ['#F87171', '#60A5FA', '#FBBF24', '#34D399'][(x / 14) % 4 | 0]; g.globalAlpha = .55; g.beginPath(); g.arc(x + 7, h * .25, 4, 0, 7); g.fill(); } g.globalAlpha = 1;
  g.fillStyle = '#C2410C'; g.fillRect(0, h * .32, w, h * .68); g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 2; for (let k = 1; k < 6; k++) { g.beginPath(); g.moveTo(0, h * .32 + k * h * .11); g.lineTo(w, h * .32 + k * h * .11); g.stroke(); }
  const x = (t * 60) % (w + 40) - 20; g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(x, h * .39, 5, 0, 7); g.fill(); g.fillRect(x - 3, h * .39 + 4, 6, 10);
}
export function say(g, txt, x, y, s = 16, col = INKC, wt = 800) { g.font = `${wt} ${s}px Cairo`; g.textAlign = 'center'; g.direction = 'rtl'; g.fillStyle = col; g.fillText(txt, x, y); }
export const glow = (g, w, h, S) => { if (S.pulse > 0) { g.strokeStyle = `rgba(34,197,94,${S.pulse})`; g.lineWidth = 6; g.strokeRect(4, 4, w - 8, h - 8); } };
/* رسم المسافة والزمن: محورا [0, X] و[0, Y] بتدريج، وخطوط متصلة { pts: [[ز، ف]…], col, lab } */
export function dtGraph(g, x, y, w, h, X, Y, lines, { xs = 1, ys = 1, xl = 'الزمن', yl = 'المسافة', mark = null } = {}) {
  g.fillStyle = 'rgba(255,255,255,.95)'; g.fillRect(x - 40, y - 14, w + 56, h + 50);
  const PX = v => x + v / X * w, PY = v => y + h - v / Y * h;
  g.strokeStyle = '#E2E8F0'; g.lineWidth = 1; for (let v = 0; v <= X + 1e-9; v += xs) { g.beginPath(); g.moveTo(PX(v), y); g.lineTo(PX(v), y + h); g.stroke(); } for (let v = 0; v <= Y + 1e-9; v += ys) { g.beginPath(); g.moveTo(x, PY(v)); g.lineTo(x + w, PY(v)); g.stroke(); }
  g.strokeStyle = '#334155'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + h); g.lineTo(x + w, y + h); g.stroke();
  g.font = '700 11px Cairo'; g.fillStyle = '#334155'; g.textAlign = 'center'; for (let v = 0; v <= X + 1e-9; v += xs) g.fillText(N(Math.round(v * 100) / 100), PX(v), y + h + 14); g.textAlign = 'right'; for (let v = ys; v <= Y + 1e-9; v += ys) g.fillText(N(Math.round(v * 100) / 100), x - 5, PY(v) + 4);
  say(g, xl, x + w / 2, y + h + 32, 12, '#475569'); g.save(); g.translate(x - 30, y + h / 2); g.rotate(-Math.PI / 2); say(g, yl, 0, 0, 12, '#475569'); g.restore();
  lines.forEach(({ pts, col = RED, lab }) => { g.strokeStyle = col; g.lineWidth = 3.5; g.beginPath(); pts.forEach(([a, b], k) => k ? g.lineTo(PX(a), PY(b)) : g.moveTo(PX(a), PY(b))); g.stroke(); if (lab) { const [a, b] = pts[pts.length - 1]; say(g, lab, PX(a) - 4, PY(b) - 8, 13, col, 900); } });
  if (mark) { g.fillStyle = '#F59E0B'; g.beginPath(); g.arc(PX(mark[0]), PY(mark[1]), 7, 0, 7); g.fill(); g.strokeStyle = '#FFF'; g.lineWidth = 2; g.stroke(); }
}
/* مثلث السرعة: ف أعلى، وع × ن أسفل */
export function sdt(g, cx, cy, s, hl = '') {
  g.fillStyle = '#7C3AED'; g.beginPath(); g.moveTo(cx, cy - s); g.lineTo(cx + s * .9, cy + s * .55); g.lineTo(cx - s * .9, cy + s * .55); g.closePath(); g.fill(); g.strokeStyle = '#FFF'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx - s * .55, cy); g.lineTo(cx + s * .55, cy); g.moveTo(cx, cy); g.lineTo(cx, cy + s * .55); g.stroke();
  say(g, 'ف', cx, cy - s * .3, s * .32, hl === 'ف' ? '#FDE047' : '#FFFFFF', 900); say(g, 'ع', cx + s * .3, cy + s * .38, s * .3, hl === 'ع' ? '#FDE047' : '#FFFFFF', 900); say(g, 'ن', cx - s * .3, cy + s * .38, s * .3, hl === 'ن' ? '#FDE047' : '#FFFFFF', 900);
}
