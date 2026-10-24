// رسوم مشتركة لمشاهد دروس «مطبخ الحلوى»: جدار المطبخ ومنضدته، الكسر المكدّس والعدد الكسري على القماش (العدد الصحيح يساراً)،
// صحن الحلوى الدائري بقطاعاته، القارورة المدرّجة، علبة الحلوى، والقِدر النحاسي ببخاره.
import { N } from '../../math.js';

export const HALWA = '#7A2E12', HALWA2 = '#A8481E', COPPER = '#B87333', COPPER2 = '#E0A060';

/* جدار مطبخ دافئ بزخرفة، ومنضدة خشبية أسفل المشهد (y0: أعلى المنضدة) */
export function kitchen(g, w, h, y0 = h * .62) {
  const wg = g.createLinearGradient(0, 0, 0, y0); wg.addColorStop(0, '#FFF4DE'); wg.addColorStop(1, '#F7DDB0'); g.fillStyle = wg; g.fillRect(0, 0, w, y0);
  g.strokeStyle = 'rgba(180,120,60,.18)'; g.lineWidth = 2;
  for (let x = 20; x < w; x += 56) { g.beginPath(); g.moveTo(x, 18); g.lineTo(x + 14, 32); g.lineTo(x, 46); g.lineTo(x - 14, 32); g.closePath(); g.stroke(); }
  const tg = g.createLinearGradient(0, y0, 0, h); tg.addColorStop(0, '#B7793F'); tg.addColorStop(1, '#8A5528'); g.fillStyle = tg; g.fillRect(0, y0, w, h - y0);
  g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(0, y0, w, 5); g.strokeStyle = 'rgba(60,30,10,.2)'; g.lineWidth = 1;
  for (let y = y0 + 22; y < h; y += 22) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
}

/* كسر مكدّس على القماش، (x, y) منتصف خط الكسر؛ يعيد عرضه */
export function fracC(g, a, b, x, y, s = 26, col = '#1E2433') {
  g.font = `900 ${s}px Cairo`; g.textAlign = 'center'; g.direction = 'ltr'; const ta = N(a), tb = N(b), wd = Math.max(g.measureText(ta).width, g.measureText(tb).width) + 8;
  g.fillStyle = col; g.fillText(ta, x, y - s * .18); g.fillText(tb, x, y + s * .92); g.fillRect(x - wd / 2, y - 1.5, wd, 3); return wd;
}
/* عدد كسري: العدد الصحيح يسار الكسر، (x, y) منتصف المجموع */
export function mixC(g, wh, a, b, x, y, s = 26, col = '#1E2433') {
  g.font = `900 ${s * 1.25}px Cairo`; const tw = g.measureText(N(wh)).width; g.font = `900 ${s}px Cairo`;
  const fw = Math.max(g.measureText(N(a)).width, g.measureText(N(b)).width) + 8, tot = tw + 6 + fw;
  g.font = `900 ${s * 1.25}px Cairo`; g.textAlign = 'center'; g.direction = 'ltr'; g.fillStyle = col; g.fillText(N(wh), x - tot / 2 + tw / 2, y + s * .42);
  fracC(g, a, b, x + tot / 2 - fw / 2, y, s, col); return tot;
}
/* القيمة a/b مكتوبة كما في الكتاب: عدد صحيح، أو كسر، أو عدد كسري */
export function valC(g, a, b, x, y, s = 26, col = '#1E2433') {
  if (a % b === 0) { g.font = `900 ${s * 1.25}px Cairo`; g.textAlign = 'center'; g.direction = 'ltr'; g.fillStyle = col; g.fillText(N(a / b), x, y + s * .42); return; }
  return a > b ? mixC(g, Math.floor(a / b), a % b, b, x, y, s, col) : fracC(g, a, b, x, y, s, col);
}

/* صحن نحاسي دائري فيه d قطاعاً، أول n منها حلوى، والباقي مأخوذ؛ k > 1 يرسم حدود القطع الكبرى كل k قطاعات
   (خضراء إن قسم k البسط والمقام معاً، وحمراء حيث تقطع الحلوى) */
export function dish(g, cx, cy, r, d, n, k = 1, t = 0) {
  g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(cx + 6, cy + r * .9, r * 1.1, r * .22, 0, 0, 7); g.fill();
  const cg = g.createRadialGradient(cx - r * .3, cy - r * .3, 4, cx, cy, r * 1.15); cg.addColorStop(0, COPPER2); cg.addColorStop(1, '#8A4F1F');
  g.fillStyle = cg; g.beginPath(); g.arc(cx, cy, r * 1.12, 0, 7); g.fill(); g.fillStyle = '#F3E3C8'; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill();
  const a0 = -Math.PI / 2, da = Math.PI * 2 / d;
  for (let i = 0; i < n; i++) { const hg = g.createRadialGradient(cx, cy, 2, cx, cy, r); hg.addColorStop(0, HALWA2); hg.addColorStop(1, HALWA); g.fillStyle = hg;
    g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, r - 2, a0 + i * da, a0 + (i + 1) * da); g.closePath(); g.fill(); }
  g.fillStyle = 'rgba(255,255,255,.18)'; for (let i = 0; i < n; i += 2) { const a = a0 + (i + .5) * da; g.beginPath(); g.arc(cx + Math.cos(a) * r * .6, cy + Math.sin(a) * r * .6, 2.5, 0, 7); g.fill(); }   // لوز وفستق
  g.strokeStyle = 'rgba(80,40,10,.35)'; g.lineWidth = d > 40 ? .8 : 1.4;
  for (let i = 0; i < d; i++) { const a = a0 + i * da; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); g.stroke(); }
  if (k > 1 && d % k === 0) {
    const good = n % k === 0;
    for (let i = 0; i < d; i += k) { const a = a0 + i * da; g.strokeStyle = '#F8FAFC'; g.lineWidth = 5; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); g.stroke(); }
    if (!good) { const i = Math.floor(n / k) * k, a1 = a0 + i * da, a2 = a0 + (i + k) * da; g.strokeStyle = `rgba(220,38,38,${.6 + Math.sin(t * 6) * .3})`; g.lineWidth = 6; g.beginPath(); g.arc(cx, cy, r + 4, a1, a2); g.stroke(); }
  } else if (k > 1) { g.strokeStyle = `rgba(220,38,38,${.6 + Math.sin(t * 6) * .3})`; g.lineWidth = 6; g.beginPath(); g.arc(cx, cy, r + 4, 0, 7); g.stroke(); }
  g.strokeStyle = '#6B3A14'; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke();
}

/* قارورة زجاجية مدرّجة: level من ٠ إلى ١، و marks عدد أقسام التدريج */
export function flask(g, x, y, w, h, level, marks, col = '#F472B6') {
  g.fillStyle = 'rgba(0,0,0,.15)'; g.beginPath(); g.ellipse(x + 4, y + 4, w * .6, 7, 0, 0, 7); g.fill();
  const lh = (h - 10) * Math.max(0, Math.min(1, level)); g.fillStyle = col; g.globalAlpha = .75; g.fillRect(x - w / 2 + 4, y - lh - 4, w - 8, lh); g.globalAlpha = 1;
  g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(x - w / 2 + 8, y - h + 8, 6, h - 16);
  g.strokeStyle = '#64748B'; g.lineWidth = 3; g.beginPath(); g.moveTo(x - w / 2, y - h); g.lineTo(x - w / 2, y); g.lineTo(x + w / 2, y); g.lineTo(x + w / 2, y - h); g.stroke();
  g.lineWidth = 1.5; for (let k = 1; k < marks; k++) { const yy = y - 4 - (h - 10) * k / marks; g.beginPath(); g.moveTo(x + w / 2 - (marks > 24 ? 6 : 12), yy); g.lineTo(x + w / 2, yy); g.stroke(); }
}

/* علبة حلوى (برطمان بغطاء) ممتلئة بنسبة fill */
export function jar(g, x, y, w, h, fill = 1, lid = '#DC2626') {
  g.fillStyle = 'rgba(0,0,0,.16)'; g.beginPath(); g.ellipse(x + 3, y + 2, w * .55, 5, 0, 0, 7); g.fill();
  g.fillStyle = 'rgba(226,232,240,.75)'; g.fillRect(x - w / 2, y - h, w, h); const fh = (h - 6) * fill; g.fillStyle = HALWA; g.fillRect(x - w / 2 + 3, y - 3 - fh, w - 6, fh);
  g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(x - w / 2 + 4, y - h + 4, 4, h - 8); g.strokeStyle = '#94A3B8'; g.lineWidth = 2; g.strokeRect(x - w / 2, y - h, w, h);
  g.fillStyle = lid; g.fillRect(x - w / 2 - 3, y - h - 8, w + 6, 9);
}

/* قِدر نحاسي على نار، بحلوى تغلي وبخار */
export function pot(g, x, y, r, level, t) {
  for (let k = 0; k < 5; k++) { const f = (Math.sin(t * 9 + k * 2) + 1) / 2; g.fillStyle = k % 2 ? '#F97316' : '#FACC15'; g.beginPath(); g.moveTo(x - r * .6 + k * r * .3, y + r * .55); g.quadraticCurveTo(x - r * .5 + k * r * .3, y + r * (.1 - f * .25), x - r * .4 + k * r * .3, y + r * .55); g.fill(); }
  const cg = g.createLinearGradient(x - r, 0, x + r, 0); cg.addColorStop(0, '#8A4F1F'); cg.addColorStop(.35, COPPER2); cg.addColorStop(1, '#7A4318');
  g.fillStyle = cg; g.beginPath(); g.moveTo(x - r, y - r * .5); g.quadraticCurveTo(x - r * 1.05, y + r * .45, x, y + r * .5); g.quadraticCurveTo(x + r * 1.05, y + r * .45, x + r, y - r * .5); g.closePath(); g.fill();
  g.fillStyle = '#5B2A0E'; g.beginPath(); g.ellipse(x, y - r * .5, r, r * .22, 0, 0, 7); g.fill();
  if (level > 0) { g.fillStyle = HALWA2; g.beginPath(); g.ellipse(x, y - r * .5 + 3, r * .9, r * .18, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(255,220,180,.5)'; for (let k = 0; k < 3; k++) { const u = (t * .8 + k / 3) % 1; g.beginPath(); g.arc(x - r * .4 + k * r * .4, y - r * .5, 3 + u * 3, 0, 7); g.fill(); } }
  g.fillStyle = 'rgba(255,255,255,.5)'; for (let k = 0; k < 4; k++) { const u = (t * .35 + k / 4) % 1; g.globalAlpha = .5 * (1 - u); g.beginPath(); g.arc(x - r * .3 + k * r * .2 + Math.sin(t + k) * 6, y - r * .7 - u * r * 1.4, 8 + u * 12, 0, 7); g.fill(); } g.globalAlpha = 1;
}

/* نص عربي على القماش */
export function say(g, txt, x, y, s = 16, col = '#1E2433', al = 'center') { g.font = `800 ${s}px Cairo`; g.textAlign = al; g.direction = 'rtl'; g.fillStyle = col; g.fillText(txt, x, y); }
