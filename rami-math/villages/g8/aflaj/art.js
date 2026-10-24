// رسوم مشتركة لمشاهد دروس «مزارع الأفلاج»: خلفية مزرعة، نص، سلّم تحويل الوحدات، دائرة بنصف قطرها أو قطرها، ومجسّمات مائلة
// (منشور بأي مقطع عرضي، وأسطوانة) بأطوال مكتوبة. الأطوال المطلوبة تُكتب «؟» حتى يحلّ الطالب (S.done).
export const INKC = '#2B2118', WATER = '#3B82C4', TEAL = '#0F766E', SOIL = '#8B6B47';

/* خلفية المزرعة: سماء فاتحة، ونخيل بعيد، وأرض */
export function farmBg(g, w, h, t = 0) {
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#DDF1FB'); gr.addColorStop(.62, '#F4EBD7'); gr.addColorStop(1, '#E3CFA6'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(47,138,58,.18)'; for (let x = 20; x < w; x += 70) { const y = h * .6; g.fillRect(x, y - 40, 4, 40); g.beginPath(); g.ellipse(x + 2, y - 44, 22, 9, Math.sin(t + x) * .1, 0, 7); g.fill(); }
}
export function say(g, txt, x, y, s = 16, col = INKC) { g.font = `800 ${s}px Cairo`; g.textAlign = 'center'; g.direction = 'rtl'; g.fillStyle = col; g.fillText(txt, x, y); }
export const glow = (g, w, h, S) => { if (S.pulse > 0) { g.strokeStyle = `rgba(34,197,94,${S.pulse})`; g.lineWidth = 6; g.strokeRect(4, 4, w - 8, h - 8); } };

/* سلّم التحويل كما في الكتاب: وحدات من الكبرى (يميناً) إلى الصغرى، وبين كل اثنتين معامل يُكتب «؟» حتى يُعرف.
   units: ['م²', 'سم²', 'ملم²']، facs: ['١٠٠٠٠', '١٠٠']، show: أي المعاملات ظاهرة، hl: الوحدتان المطلوبتان */
export function ladder(g, x, y, w, units, facs, show = [], hl = []) {
  const n = units.length, bw = Math.min(86, w / (n * 1.6)), gap = (w - n * bw) / (n - 1);
  units.forEach((u, i) => { const bx = x + w - bw - i * (bw + gap); g.fillStyle = hl.includes(i) ? '#FEF3C7' : '#FFFFFF'; g.strokeStyle = hl.includes(i) ? '#F59E0B' : '#94A3B8'; g.lineWidth = 3;
    g.beginPath(); g.roundRect(bx, y, bw, 42, 10); g.fill(); g.stroke(); say(g, u, bx + bw / 2, y + 29, 19);
    if (i < n - 1) { const ax = bx - 6, bx2 = bx - gap + 6; g.strokeStyle = TEAL; g.lineWidth = 2.5; g.beginPath(); g.moveTo(ax, y + 14); g.lineTo(bx2, y + 14); g.stroke(); g.beginPath(); g.moveTo(bx2 + 8, y + 9); g.lineTo(bx2, y + 14); g.lineTo(bx2 + 8, y + 19); g.stroke();
      g.strokeStyle = '#B45309'; g.beginPath(); g.moveTo(bx2, y + 30); g.lineTo(ax, y + 30); g.stroke(); g.beginPath(); g.moveTo(ax - 8, y + 25); g.lineTo(ax, y + 30); g.lineTo(ax - 8, y + 35); g.stroke();
      const f = show.includes(i) ? facs[i] : '؟'; say(g, '× ' + f, (ax + bx2) / 2, y + 8, 14, TEAL); say(g, '÷ ' + f, (ax + bx2) / 2, y + 52, 14, '#B45309'); } });
}

/* دائرة: نصف قطر أو قطر مكتوب، ونصف دائرة إن half */
export function circleFig(g, cx, cy, r, { lab = '', diam = false, half = false, fill = 'rgba(59,130,196,.35)', t = 0 } = {}) {
  g.fillStyle = fill; g.strokeStyle = '#64748B'; g.lineWidth = 6; g.beginPath(); if (half) { g.arc(cx, cy, r, Math.PI, 0); g.closePath(); } else g.arc(cx, cy, r, 0, 7); g.fill(); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 2; for (let k = 0; k < 3; k++) { const a = t * .6 + k * 2.1, rr = r * (.35 + k * .18); g.beginPath(); g.arc(cx, cy, rr, a, a + .9); g.stroke(); }
  g.strokeStyle = '#B45309'; g.lineWidth = 3; g.setLineDash([7, 5]); g.beginPath(); g.moveTo(diam || half ? cx - r : cx, cy); g.lineTo(cx + r, cy); g.stroke(); g.setLineDash([]);
  g.fillStyle = '#B45309'; g.beginPath(); g.arc(cx, cy, 4, 0, 7); g.fill();
  if (lab) say(g, lab, diam || half ? cx : cx + r / 2, cy + 22, 17, '#B45309');
}

/* منشور مائل: poly مقطع عرضي بالبكسل (حول 0,0 والمحور ص لأسفل)، يمتد عمقاً بالمتجه (dx, dy). المقطع الأمامي مظلل */
export function prismFig(g, cx, cy, poly, dx, dy, { col = '#D6C7AE', face = 'rgba(15,118,110,.35)', labs = [] } = {}) {
  const P = poly.map(([x, y]) => [cx + x, cy + y]), Q = P.map(([x, y]) => [x + dx, y + dy]);
  g.lineJoin = 'round'; g.strokeStyle = '#475569'; g.lineWidth = 2.5;
  P.forEach((p, i) => { const a = p, b = P[(i + 1) % P.length], c = Q[(i + 1) % Q.length], d = Q[i]; g.fillStyle = col; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.lineTo(...c); g.lineTo(...d); g.closePath(); g.fill(); g.stroke(); });
  g.fillStyle = col; g.beginPath(); Q.forEach((q, i) => i ? g.lineTo(...q) : g.moveTo(...q)); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = face; g.beginPath(); P.forEach((p, i) => i ? g.lineTo(...p) : g.moveTo(...p)); g.closePath(); g.fill(); g.stroke();
  labs.forEach(([txt, x, y, c]) => say(g, txt, cx + x, cy + y, 16, c || INKC));
}

/* أسطوانة قائمة: نصف قطر r وارتفاع h بالبكسل، والماء داخلها بنسبة lv */
export function cylFig(g, cx, by, r, h, { lv = 0, col = '#CBD5E1', labR = '', labH = '' } = {}) {
  const ry = r * .3, top = by - h, gr = g.createLinearGradient(cx - r, 0, cx + r, 0); gr.addColorStop(0, '#94A3B8'); gr.addColorStop(.35, col); gr.addColorStop(1, '#64748B');
  g.fillStyle = gr; g.fillRect(cx - r, top, r * 2, h); g.beginPath(); g.ellipse(cx, by, r, ry, 0, 0, Math.PI); g.fill();
  if (lv > 0) { g.fillStyle = 'rgba(59,130,196,.35)'; g.fillRect(cx - r, by - h * lv, r * 2, h * lv); }
  g.fillStyle = '#E2E8F0'; g.strokeStyle = '#475569'; g.lineWidth = 2.5; g.beginPath(); g.ellipse(cx, top, r, ry, 0, 0, 7); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(cx - r, top); g.lineTo(cx - r, by); g.ellipse(cx, by, r, ry, 0, Math.PI, 0, true); g.lineTo(cx + r, top); g.stroke();
  g.strokeStyle = '#B45309'; g.lineWidth = 3; g.setLineDash([6, 4]); g.beginPath(); g.moveTo(cx, top); g.lineTo(cx + r, top); g.stroke(); g.setLineDash([]);
  if (labR) say(g, labR, cx + r / 2, top - 8, 16, '#B45309');
  if (labH) { g.strokeStyle = TEAL; g.lineWidth = 2; g.beginPath(); g.moveTo(cx + r + 14, top); g.lineTo(cx + r + 14, by); g.stroke(); say(g, labH, cx + r + 46, top + h / 2, 16, TEAL); }
}
