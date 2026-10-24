// رسوم مشتركة لمشاهد دروس «سوق العروض»: خلفية السوق بأقواسه وفوانيسه، ونص، وبطاقة سعر معلّقة، وشريط النسبة من ٠٪ إلى ١٠٠٪ بقطعه،
// ولوحة استبيان بعمودين، وفاتورة، وسيارة المعرض، وسهم التغيّر. ما يُطلب حسابه يبقى «؟» حتى يحلّ الطالب (S.done).
import { N } from '../../math.js';
export const INKC = '#2B2118', ORANGE = '#EA580C', TEAL = '#0F766E', RED = '#DC2626', GOLD = '#FACC15', GREEN = '#16A34A';
export const pc = v => `${N(v)}٪`;
export const rial = v => `${N(v)} ريال`;

/* خلفية السوق: سماء دافئة، وأقواس السوق المسقوف بفوانيس معلقة، وأرضية بلاط */
export function souqBg(g, w, h, t = 0) {
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#FDF4E3'); gr.addColorStop(.7, '#F7E6CC'); gr.addColorStop(1, '#E9D2AE'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  const n = Math.max(3, Math.round(w / 170)), aw = w / n;
  for (let k = 0; k < n; k++) { const x = k * aw; g.fillStyle = 'rgba(180,120,60,.13)'; g.beginPath(); g.moveTo(x, h * .62); g.lineTo(x, h * .2); g.quadraticCurveTo(x + aw / 2, h * .02, x + aw, h * .2); g.lineTo(x + aw, h * .62); g.lineTo(x + aw - 10, h * .62); g.lineTo(x + aw - 10, h * .22); g.quadraticCurveTo(x + aw / 2, h * .07, x + 10, h * .22); g.lineTo(x + 10, h * .62); g.fill();
    const lx = x + aw / 2, ly = h * .14 + Math.sin(t * 1.4 + k) * 2; g.strokeStyle = 'rgba(90,60,30,.35)'; g.lineWidth = 1; g.beginPath(); g.moveTo(lx, h * .06); g.lineTo(lx, ly); g.stroke();
    g.fillStyle = ['#F59E0B', '#EF4444', '#10B981'][k % 3]; g.globalAlpha = .5; g.beginPath(); g.ellipse(lx, ly + 8, 7, 10, 0, 0, 7); g.fill(); g.globalAlpha = 1; }
  g.fillStyle = 'rgba(150,100,50,.08)'; for (let x = 0; x < w; x += 40) g.fillRect(x, h * .62, 20, h * .38);
}
export function say(g, txt, x, y, s = 16, col = INKC, wt = 800) { g.font = `${wt} ${s}px Cairo`; g.textAlign = 'center'; g.direction = 'rtl'; g.fillStyle = col; g.fillText(txt, x, y); }
export const glow = (g, w, h, S) => { if (S.pulse > 0) { g.strokeStyle = `rgba(34,197,94,${S.pulse})`; g.lineWidth = 6; g.strokeRect(4, 4, w - 8, h - 8); } };
export const board = (g, x, y, w, h, col = '#7C2D12') => { g.fillStyle = 'rgba(0,0,0,.12)'; g.beginPath(); g.roundRect(x + 4, y + 5, w, h, 16); g.fill(); g.fillStyle = '#FFFBF3'; g.beginPath(); g.roundRect(x, y, w, h, 16); g.fill(); g.strokeStyle = col; g.lineWidth = 4; g.stroke(); };

/* بطاقة سعر معلّقة بخيط تتأرجح، وعليها سطران (والسطر الثاني قد يكون «؟») */
export function tag(g, x, y, w, h, l1, l2, { col = ORANGE, t = 0, strike = false } = {}) {
  const a = Math.sin(t * 1.8) * .04; g.save(); g.translate(x, y); g.rotate(a);
  g.strokeStyle = '#78716C'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, -26); g.lineTo(0, 0); g.stroke();
  g.fillStyle = 'rgba(0,0,0,.14)'; g.beginPath(); g.roundRect(-w / 2 + 3, 4, w, h, 10); g.fill();
  g.fillStyle = col; g.beginPath(); g.moveTo(-w / 2 + 14, 0); g.lineTo(w / 2 - 14, 0); g.lineTo(w / 2, 14); g.lineTo(w / 2, h); g.lineTo(-w / 2, h); g.lineTo(-w / 2, 14); g.closePath(); g.fill();
  g.fillStyle = '#FFF'; g.beginPath(); g.arc(0, 10, 4, 0, 7); g.fill();
  say(g, l1, 0, h * .48, Math.min(17, h * .26), '#FFFFFF'); say(g, l2, 0, h * .84, Math.min(22, h * .32), '#FFFFFF', 900);
  if (strike) { g.strokeStyle = '#FFFFFF'; g.lineWidth = 3; g.beginPath(); g.moveTo(-w * .32, h * .76); g.lineTo(w * .32, h * .7); g.stroke(); }
  g.restore();
}
/* شريط النسبة: الكل ١٠٠٪ (من اليمين)، وقطع ملوّنة متتالية (موجبة تضاف، سالبة تُطرح من آخرها مخططة) */
export function pctBar(g, x, y, w, parts = [], { hh = 34, lab = true } = {}) {
  g.fillStyle = '#F1F5F9'; g.beginPath(); g.roundRect(x, y, w, hh, 10); g.fill();
  let pos = 0; const cols = ['#F97316', '#0EA5E9', '#22C55E', '#A855F7', '#EAB308', '#EC4899'];
  parts.forEach((v, k) => { const a = Math.max(0, Math.min(100, pos)), b = Math.max(0, Math.min(100, pos + v)); const x0 = x + w - w * Math.max(a, b) / 100, ww = w * Math.abs(b - a) / 100;
    if (v > 0) { g.fillStyle = cols[k % cols.length]; g.fillRect(x0, y, ww, hh); g.strokeStyle = '#FFFFFF'; g.lineWidth = 2; g.strokeRect(x0, y, ww, hh); if (lab && ww > 34) say(g, pc(v), x0 + ww / 2, y + hh * .68, 14, '#FFFFFF'); }
    else { g.fillStyle = 'rgba(220,38,38,.35)'; g.fillRect(x0, y, ww, hh); g.strokeStyle = RED; g.lineWidth = 2; for (let q = x0; q < x0 + ww; q += 7) { g.beginPath(); g.moveTo(q, y + hh); g.lineTo(Math.min(q + 7, x0 + ww), y); g.stroke(); } }
    pos += v; });
  g.strokeStyle = '#475569'; g.lineWidth = 2; g.beginPath(); g.roundRect(x, y, w, hh, 10); g.stroke();
  for (let k = 0; k <= 10; k++) { const xx = x + w - w * k / 10; g.beginPath(); g.moveTo(xx, y + hh); g.lineTo(xx, y + hh + (k % 5 ? 5 : 10)); g.stroke(); }
  say(g, pc(0), x + w, y + hh + 26, 14); say(g, pc(100), x, y + hh + 26, 14); say(g, pc(50), x + w / 2, y + hh + 26, 12, '#64748B');
}
/* لوحة الاستبيان: عمودان (أو أكثر) بنسبة كل مجموعة، والنسبة «؟» حتى يحلّ */
export function survey(g, x, y, w, h, groups, { done = false, t = 1 } = {}) {
  board(g, x, y, w, h, TEAL); const n = groups.length, bw = w / n;
  groups.forEach((G, k) => { const cx = x + w - (k + .5) * bw, top = y + 44, bh = h - 110, v = Math.min(1, G.v / 100) * Math.min(1, t);
    say(g, G.name, cx, y + 30, 16, TEAL, 900);
    g.fillStyle = '#E2E8F0'; g.beginPath(); g.roundRect(cx - bw * .18, top, bw * .36, bh, 8); g.fill();
    if (done) { g.fillStyle = G.col || '#14B8A6'; g.beginPath(); g.roundRect(cx - bw * .18, top + bh * (1 - v), bw * .36, bh * v, 8); g.fill(); say(g, pc(G.v), cx, top + bh * (1 - v) - 6, 15, TEAL, 900); }
    else say(g, '؟', cx, top + bh / 2 + 10, 30, '#94A3B8', 900);
    say(g, G.l1, cx, y + h - 40, 13, '#334155'); say(g, G.l2 || '', cx, y + h - 18, 13, '#334155'); });
}
/* فاتورة بسطورها (ونجمة «؟» حيث المطلوب) */
export function receipt(g, x, y, w, rows, { title = 'فاتورة', t = 0 } = {}) {
  const h = 54 + rows.length * 30; g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(x + 4, y + 5, w, h);
  g.fillStyle = '#FFFFFF'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + w, y); g.lineTo(x + w, y + h); for (let q = 0; q <= 12; q++) g.lineTo(x + w - q * w / 12, y + h + (q % 2 ? 7 : 0)); g.closePath(); g.fill();
  say(g, '🧾 ' + title, x + w / 2, y + 30, 17, '#7C2D12', 900);
  rows.forEach(([a, b, hl], k) => { const yy = y + 60 + k * 30; g.strokeStyle = '#E7E5E4'; g.lineWidth = 1; g.setLineDash([3, 3]); g.beginPath(); g.moveTo(x + 12, yy + 8); g.lineTo(x + w - 12, yy + 8); g.stroke(); g.setLineDash([]);
    g.font = '700 15px Cairo'; g.direction = 'rtl'; g.textAlign = 'right'; g.fillStyle = '#44403C'; g.fillText(a, x + w - 14, yy);
    g.textAlign = 'left'; g.fillStyle = hl ? ORANGE : INKC; g.font = '900 16px Cairo'; g.fillText(b, x + 14, yy); });
}
/* سيارة المعرض (جانبية) بلون col */
export function car(g, x, y, s, col = '#2563EB', t = 0) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = 'rgba(0,0,0,.15)'; g.beginPath(); g.ellipse(0, 4, 92, 9, 0, 0, 7); g.fill();
  g.fillStyle = col; g.beginPath(); g.moveTo(-88, -10); g.lineTo(-84, -34); g.lineTo(-44, -38); g.lineTo(-22, -62); g.lineTo(34, -62); g.lineTo(58, -38); g.lineTo(86, -32); g.lineTo(90, -10); g.closePath(); g.fill();
  g.fillStyle = '#DBEAFE'; g.beginPath(); g.moveTo(-36, -40); g.lineTo(-18, -56); g.lineTo(4, -56); g.lineTo(4, -40); g.fill(); g.beginPath(); g.moveTo(10, -40); g.lineTo(10, -56); g.lineTo(30, -56); g.lineTo(48, -40); g.fill();
  g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(-80, -30, 160, 4); g.fillStyle = '#FDE68A'; g.fillRect(80, -28, 8, 7); g.fillStyle = '#FCA5A5'; g.fillRect(-88, -28, 6, 7);
  [-56, 56].forEach(wx => { g.fillStyle = '#1F2937'; g.beginPath(); g.arc(wx, -8, 15, 0, 7); g.fill(); g.fillStyle = '#9CA3AF'; g.beginPath(); g.arc(wx, -8, 7, 0, 7); g.fill(); g.strokeStyle = '#4B5563'; g.lineWidth = 2; for (let q = 0; q < 3; q++) { const a = t * 2 + q * 2.1; g.beginPath(); g.moveTo(wx, -8); g.lineTo(wx + Math.cos(a) * 7, -8 + Math.sin(a) * 7); g.stroke(); } });
  g.restore();
}
/* سهم التغيّر بين قيمتين: أخضر للزيادة وأحمر للانخفاض، وعليه النسبة (أو «؟») */
export function changeArrow(g, x0, x1, y, up, lab) {
  const col = up ? GREEN : RED; g.strokeStyle = col; g.lineWidth = 5; g.beginPath(); g.moveTo(x0, y); g.quadraticCurveTo((x0 + x1) / 2, y - 46, x1, y); g.stroke();
  const d = x1 > x0 ? -1 : 1; g.fillStyle = col; g.beginPath(); g.moveTo(x1, y); g.lineTo(x1 + d * 14, y - 12); g.lineTo(x1 + d * 16, y + 4); g.fill();
  g.fillStyle = '#FFFFFF'; g.beginPath(); g.roundRect((x0 + x1) / 2 - 46, y - 52, 92, 28, 14); g.fill(); g.strokeStyle = col; g.lineWidth = 2; g.stroke();
  say(g, (up ? '▲ ' : '▼ ') + lab, (x0 + x1) / 2, y - 32, 15, col, 900);
}
/* عملات وأوراق نقدية صغيرة مكدسة (للبنك والأرباح) */
export function cash(g, x, y, n, t = 0) {
  for (let k = 0; k < n; k++) { const yy = y - k * 5; g.fillStyle = k % 2 ? '#86EFAC' : '#4ADE80'; g.fillRect(x - 26, yy - 12, 52, 12); g.strokeStyle = '#15803D'; g.lineWidth = 1; g.strokeRect(x - 26, yy - 12, 52, 12); }
  g.fillStyle = '#FACC15'; g.beginPath(); g.arc(x + 34, y - 6, 9 + Math.sin(t * 3) * .5, 0, 7); g.fill(); g.strokeStyle = '#A16207'; g.stroke();
}
