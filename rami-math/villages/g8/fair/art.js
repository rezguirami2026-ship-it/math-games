// رسوم مشتركة لمشاهد دروس «مهرجان الألعاب» ونصب القرية: خلفية المهرجان، ونص، وحجر نرد بنقاطه، وبطاقة، وشريط الاحتمال من ٠ إلى ١،
// وشبكة أعداد، وتقويم شهر، ودوّار بأقسام متساوية، وعملة، وجدول نتائج، وأعمدة تكرار. ما يُطلب حسابه يبقى «؟» حتى يحلّ الطالب (S.done).
import { N } from '../../math.js';
import { ar } from '../../../core/util.js';
export const INKC = '#2B2118', PINK = '#DB2777', BLUE = '#2563EB', GREEN = '#16A34A', GOLD = '#FACC15';

/* خلفية المهرجان: سماء، وعجلة دوّارة بعيدة، ورايات، وأرض */
export function fairBg(g, w, h, t = 0) {
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#DCEFFB'); gr.addColorStop(.62, '#FBEFF5'); gr.addColorStop(1, '#EED9C0'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  const cx = w * .9, cy = h * .3, R = h * .22; g.strokeStyle = 'rgba(219,39,119,.16)'; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.stroke();
  for (let q = 0; q < 8; q++) { const a = t * .2 + q * Math.PI / 4; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); g.stroke(); }
  const cols = [PINK, '#FFFFFF', BLUE, GOLD, GREEN]; g.strokeStyle = 'rgba(60,40,30,.3)'; g.lineWidth = 1; g.beginPath(); g.moveTo(0, 10); g.quadraticCurveTo(w / 2, 34, w, 10); g.stroke();
  for (let q = 0; q < 16; q++) { const u = (q + .5) / 16, x = u * w, y = 10 + Math.sin(Math.PI * u) * 24 * (1 - Math.abs(.5 - u) * .2); g.fillStyle = cols[q % 5]; g.globalAlpha = .55; g.beginPath(); g.moveTo(x - 9, y); g.lineTo(x + 9, y); g.lineTo(x, y + 14 + Math.sin(t * 3 + q) * 1.5); g.fill(); g.globalAlpha = 1; }
}
export function say(g, txt, x, y, s = 16, col = INKC) { g.font = `800 ${s}px Cairo`; g.textAlign = 'center'; g.direction = 'rtl'; g.fillStyle = col; g.fillText(txt, x, y); }
export const glow = (g, w, h, S) => { if (S.pulse > 0) { g.strokeStyle = `rgba(34,197,94,${S.pulse})`; g.lineWidth = 6; g.strokeRect(4, 4, w - 8, h - 8); } };

/* نقاط وجه حجر النرد n في مربع (x, y) طوله s */
export function pips(g, x, y, s, n, col = INKC) {
  const P = { 1: [[.5, .5]], 2: [[.25, .25], [.75, .75]], 3: [[.25, .25], [.5, .5], [.75, .75]], 4: [[.25, .25], [.75, .25], [.25, .75], [.75, .75]], 5: [[.25, .25], [.75, .25], [.5, .5], [.25, .75], [.75, .75]], 6: [[.25, .22], [.75, .22], [.25, .5], [.75, .5], [.25, .78], [.75, .78]] }[n] || [];
  g.fillStyle = n === 1 ? '#DC2626' : col; P.forEach(([a, b]) => { g.beginPath(); g.arc(x + a * s, y + b * s, s * .09, 0, 7); g.fill(); });
}
/* حجر نرد مجسّم صغير: وجهه العلوي top ووجهه الأمامي front، قاعدته عند (x, by)، tilt ميل */
export function die2d(g, x, by, s, top, front, tilt = 0) {
  g.save(); g.translate(x, by); g.rotate(tilt); const d = s * .42;
  g.fillStyle = '#F8FAFC'; g.strokeStyle = '#64748B'; g.lineWidth = 2; g.beginPath(); g.roundRect(-s / 2, -s, s, s, s * .14); g.fill(); g.stroke(); pips(g, -s / 2, -s, s, front);
  g.fillStyle = '#E2E8F0'; g.beginPath(); g.moveTo(-s / 2, -s); g.lineTo(-s / 2 + d * .6, -s - d); g.lineTo(s / 2 + d * .6, -s - d); g.lineTo(s / 2, -s); g.closePath(); g.fill(); g.stroke();
  // نقاط الوجه العلوي على متوازي الأضلاع: u عبر الوجه، وv من الأمام إلى الخلف
  g.save(); g.transform(s, 0, d * .6, -d, -s / 2, -s); g.translate(0, 1); g.scale(1, -1); g.lineWidth = .02; pips(g, 0, 0, 1, top); g.restore();
  g.restore();
}
/* وجه نرد مسطح (لجداول النتائج والآلة) */
export function face(g, x, y, s, n, col = '#FFFFFF') { g.fillStyle = col; g.strokeStyle = '#94A3B8'; g.lineWidth = 2; g.beginPath(); g.roundRect(x, y, s, s, s * .16); g.fill(); g.stroke(); pips(g, x, y, s, n); }
/* بطاقة: مقلوبة (ظهر مزخرف) أو مكشوفة بنصها، مع إطار مضيء إن hl */
export function card(g, x, y, w, h, txt, { up = true, hl = false, col = PINK } = {}) {
  g.fillStyle = 'rgba(0,0,0,.12)'; g.beginPath(); g.roundRect(x + 3, y + 4, w, h, 8); g.fill();
  if (!up) { g.fillStyle = col; g.beginPath(); g.roundRect(x, y, w, h, 8); g.fill(); g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 2; g.beginPath(); g.roundRect(x + 4, y + 4, w - 8, h - 8, 6); g.stroke(); g.fillStyle = 'rgba(255,255,255,.5)'; g.font = `900 ${w * .45}px Cairo`; g.textAlign = 'center'; g.fillText('؟', x + w / 2, y + h * .66); return; }
  g.fillStyle = hl ? '#DCFCE7' : '#FFFFFF'; g.strokeStyle = hl ? GREEN : '#CBD5E1'; g.lineWidth = hl ? 3 : 2; g.beginPath(); g.roundRect(x, y, w, h, 8); g.fill(); g.stroke();
  say(g, txt, x + w / 2, y + h * .66, Math.min(w * .6, h * .5), hl ? '#14532D' : INKC);
}
/* شريط الاحتمال من ٠ إلى ١: جزء الحدث (p) ملوّن، والباقي «لا يحدث» (q، أو «؟» حتى يُحل) */
export function probBar(g, x, y, w, p, { q = null, labP = '', labQ = '', colP = PINK, colQ = BLUE } = {}) {
  const hh = 34; g.fillStyle = '#F1F5F9'; g.beginPath(); g.roundRect(x, y, w, hh, 10); g.fill();
  const wp = w * Math.max(0, Math.min(1, p)); g.fillStyle = colP; g.beginPath(); g.roundRect(x + w - wp, y, wp, hh, [0, 10, 10, 0]); g.fill();
  if (q != null) { const wq = w * Math.max(0, Math.min(1, q)); g.fillStyle = colQ; g.globalAlpha = .75; g.beginPath(); g.roundRect(x + w - wp - wq, y, wq, hh, [10, 0, 0, 10]); g.fill(); g.globalAlpha = 1; }
  g.strokeStyle = '#475569'; g.lineWidth = 2; g.beginPath(); g.roundRect(x, y, w, hh, 10); g.stroke();
  for (let k = 0; k <= 10; k++) { const xx = x + w - w * k / 10; g.beginPath(); g.moveTo(xx, y + hh); g.lineTo(xx, y + hh + (k % 5 ? 5 : 10)); g.stroke(); }
  say(g, '٠', x + w, y + hh + 26, 15); say(g, '١', x, y + hh + 26, 15); say(g, N(.5), x + w / 2, y + hh + 26, 13, '#64748B');
  if (labP) say(g, labP, x + w - wp / 2, y + hh * .68, 15, '#FFFFFF');
  if (labQ) say(g, labQ, x + (w - wp) / 2, y + hh * .68, 15, q != null ? '#FFFFFF' : '#475569');
}
/* شبكة أعداد (صفوف × أعمدة) تُقرأ من اليمين، وتُضاء الخلايا المطلوبة بعد الحل */
export function numGrid(g, x, y, w, h, rows, cols, lab, hl = () => false) {
  const cw = w / cols, ch = h / rows;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const cx = x + w - (c + 1) * cw, cy = y + r * ch, on = hl(r, c);
    g.fillStyle = on ? '#DCFCE7' : '#FFFFFF'; g.strokeStyle = on ? GREEN : '#CBD5E1'; g.lineWidth = on ? 2.5 : 1.5; g.fillRect(cx + 1, cy + 1, cw - 2, ch - 2); g.strokeRect(cx + 1, cy + 1, cw - 2, ch - 2);
    say(g, lab(r, c), cx + cw / 2, cy + ch * .68, Math.min(16, ch * .55), on ? '#14532D' : INKC); }
}
/* دوّار بأقسام متساوية (labels) وسهم يدور */
export function spinner(g, cx, cy, r, labels, cols, ang = 0) {
  const n = labels.length;
  labels.forEach((l, k) => { const a1 = -Math.PI / 2 + k * 2 * Math.PI / n, a2 = a1 + 2 * Math.PI / n; g.fillStyle = cols[k % cols.length]; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, r, a1, a2); g.closePath(); g.fill(); g.strokeStyle = '#FFFFFF'; g.lineWidth = 2; g.stroke();
    const am = (a1 + a2) / 2; say(g, l, cx + Math.cos(am) * r * .62, cy + Math.sin(am) * r * .62 + 6, Math.min(20, r * .3), '#FFFFFF'); });
  g.strokeStyle = '#334155'; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke();
  g.save(); g.translate(cx, cy); g.rotate(ang); g.fillStyle = '#1E293B'; g.beginPath(); g.moveTo(0, -r * .85); g.lineTo(7, 0); g.lineTo(-7, 0); g.closePath(); g.fill(); g.restore();
  g.fillStyle = GOLD; g.beginPath(); g.arc(cx, cy, 7, 0, 7); g.fill();
}
/* عملة: صورة (ص) أو كتابة (ك) */
export function coin(g, cx, cy, r, side) { g.fillStyle = '#E5B53A'; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill(); g.strokeStyle = '#A16207'; g.lineWidth = 3; g.stroke(); g.beginPath(); g.arc(cx, cy, r * .78, 0, 7); g.stroke(); say(g, side, cx, cy + r * .3, r * .85, '#78350F'); }
/* جدول نتائج مرسوم: عناوين الأعمدة والصفوف وقيمة كل خلية (أو «؟»)، وتضاء خلايا hl */
export function outTable(g, x, y, w, h, rows, cols, val, hl = () => false, off = () => false) {
  const nc = cols.length + 1, nr = rows.length + 1, cw = w / nc, ch = h / nr;
  const at = (r, c) => [x + w - (c + 1) * cw, y + r * ch];
  cols.forEach((l, c) => { const [cx, cy] = at(0, c + 1); g.fillStyle = '#FEF3C7'; g.fillRect(cx + 1, cy + 1, cw - 2, ch - 2); say(g, l, cx + cw / 2, cy + ch * .68, Math.min(15, ch * .55), '#7C2D12'); });
  rows.forEach((l, r) => { const [cx, cy] = at(r + 1, 0); g.fillStyle = '#FEF3C7'; g.fillRect(cx + 1, cy + 1, cw - 2, ch - 2); say(g, l, cx + cw / 2, cy + ch * .68, Math.min(15, ch * .55), '#7C2D12'); });
  rows.forEach((_, r) => cols.forEach((_, c) => { const [cx, cy] = at(r + 1, c + 1), on = hl(r, c), o = off(r, c);
    g.fillStyle = o ? '#F1F5F9' : on ? '#DCFCE7' : '#FFFFFF'; g.strokeStyle = on ? GREEN : '#CBD5E1'; g.lineWidth = on ? 2 : 1; g.fillRect(cx + 1, cy + 1, cw - 2, ch - 2); g.strokeRect(cx + 1, cy + 1, cw - 2, ch - 2);
    say(g, o ? '×' : val(r, c), cx + cw / 2, cy + ch * .68, Math.min(14, ch * .55), o ? '#94A3B8' : on ? '#14532D' : INKC); }));
}
/* أعمدة التكرار: لكل نتيجة عمود بارتفاع تكراره (يكبر مع anim) وتكراره فوقه */
export function freqBars(g, x, y, w, h, labels, freqs, { max = null, anim = 1, col = '#7C3AED', line = null } = {}) {
  const n = labels.length, bw = w / n, M = max || Math.max(1, ...freqs);
  g.strokeStyle = '#94A3B8'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y + h); g.lineTo(x + w, y + h); g.stroke();
  labels.forEach((l, k) => { const bx = x + w - (k + 1) * bw, bh = h * freqs[k] / M * anim; g.fillStyle = col; g.beginPath(); g.roundRect(bx + bw * .18, y + h - bh, bw * .64, bh, [6, 6, 0, 0]); g.fill();
    say(g, l, bx + bw / 2, y + h + 18, 14); if (anim >= 1) say(g, ar(freqs[k]), bx + bw / 2, y + h - bh - 6, 13, col); });
  if (line != null) { const ly = y + h - h * line / M; g.strokeStyle = '#F59E0B'; g.setLineDash([6, 5]); g.beginPath(); g.moveTo(x, ly); g.lineTo(x + w, ly); g.stroke(); g.setLineDash([]); }
}
