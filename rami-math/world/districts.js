// أحياء الصف السابع في العرض العادي: سور منخفض مزخرف بألوان الحي، وبوابة مقوّسة بمصراعين ولافتة باسمه، وراياته، ومَعْلم يدل على وحدته.
// البيانات في content/g7/districts.js (عبر content/districts.js). السور والبوابة في 3D مجسّمان (renderer3d/districts.js)؛ المَعالم والرايات
// عناصر قائمة ثنائية الأبعاد تُرسم في العرضين. لا شيء هنا يُرسم للصفين الخامس والسادس (DISTRICTS فارغة).
import { shade, rr } from '../core/util.js';
import { FLAGS, INK, sprite, stoneBox3d, signboard, bunting, elev } from './art.js';
import { DISTRICTS } from '../content/districts.js';

const FH = 30, PCOL = '#E6D7B8';   // ارتفاع سور الحي ولون جصّه
export const DGATES = DISTRICTS.filter(d => d.gate);
export const gateCenter = d => d.gate.ew !== undefined ? { x: (d.gate.g0 + d.gate.g1) / 2, y: d.gate.ew } : { x: d.gate.ns, y: (d.gate.g0 + d.gate.g1) / 2 };

/* ── التصادم: قطعتا السور، والممر مسدود حتى تُفتح البوابة؛ والمَعْلم قاعدة صغيرة ── */
export function districtColliders(d, open) {
  const g = d.gate, out = [];
  if (g.ew !== undefined) {
    out.push({ x: g.a, y: g.ew, w: g.g0 - g.a, h: 12 }, { x: g.g1, y: g.ew, w: g.z - g.g1, h: 12 });
    if (!open) out.push({ x: g.g0, y: g.ew, w: g.g1 - g.g0, h: 12 });
  } else {
    out.push({ x: g.ns, y: g.a, w: 12, h: g.g0 - g.a }, { x: g.ns, y: g.g1, w: 12, h: g.z - g.g1 });
    if (!open) out.push({ x: g.ns, y: g.g0, w: 12, h: g.g1 - g.g0 });
  }
  return out;
}
export const landmarkColliders = () => DISTRICTS.filter(d => d.at).map(d => ({ x: d.at[0] - 30, y: d.at[1] - 14, w: 60, h: 20 }));

/* ── سور الحي شرقاً وغرباً: جصّ فاتح، شريط بلون الحي بمعيّنات، وأعمدة بتيجان كل ١٢٠ ── */
function fenceEW(c, x0, x1, Y, col) {
  const yb = Y + 12, yt = yb - FH;
  c.fillStyle = shade(PCOL, 10); c.fillRect(x0, Y - FH, x1 - x0, 12);
  const g = c.createLinearGradient(0, yt, 0, yb); g.addColorStop(0, shade(PCOL, 4)); g.addColorStop(1, shade(PCOL, -16)); c.fillStyle = g; c.fillRect(x0, yt, x1 - x0, FH);
  c.fillStyle = col; c.fillRect(x0, yt + 8, x1 - x0, 7);
  c.fillStyle = '#FFF6E2'; for (let x = x0 + 10; x < x1 - 4; x += 20) { c.beginPath(); c.moveTo(x, yt + 9); c.lineTo(x + 3, yt + 11.5); c.lineTo(x, yt + 14); c.lineTo(x - 3, yt + 11.5); c.closePath(); c.fill(); }
  c.strokeStyle = 'rgba(80,55,30,.3)'; c.lineWidth = 1; c.strokeRect(x0, yt, x1 - x0, FH);
  for (let x = x0 + 60 - (x0 % 120 + 120) % 120 + 120; x < x1 - 8; x += 120) {   // أعمدة بمسافات ثابتة في العالم كله
    c.fillStyle = shade(PCOL, -6); c.fillRect(x - 5, yt - 8, 10, FH + 8); c.fillStyle = shade(PCOL, 14); c.fillRect(x - 6, yt - 12, 12, 5);
    c.fillStyle = col; c.beginPath(); c.arc(x, yt - 14, 3, 0, 7); c.fill(); c.strokeStyle = INK; c.lineWidth = .8; c.strokeRect(x - 5, yt - 8, 10, FH + 8);
  }
}
/* شمالاً وجنوباً (سور ساحة المهرجان): سطح السور يمتد على طوله، والوجه الأمامي عند طرفه الجنوبي */
function fenceNS(c, X, a, b, col) {
  c.fillStyle = shade(PCOL, 10); c.fillRect(X, a - FH, 12, b - a);
  c.fillStyle = col; c.fillRect(X + 3, a - FH, 6, b - a);
  c.fillStyle = 'rgba(80,50,20,.18)'; c.fillRect(X + 9, a - FH, 3, b - a);
  for (let y = a + 60; y < b - 20; y += 120) { c.fillStyle = shade(PCOL, 14); c.fillRect(X - 2, y - FH - 6, 16, 10); c.fillStyle = col; c.beginPath(); c.arc(X + 6, y - FH - 8, 3, 0, 7); c.fill(); }
  const g = c.createLinearGradient(0, b - FH, 0, b); g.addColorStop(0, shade(PCOL, 2)); g.addColorStop(1, shade(PCOL, -16)); c.fillStyle = g; c.fillRect(X, b - FH, 12, FH);
  c.strokeStyle = 'rgba(80,55,30,.3)'; c.lineWidth = 1; c.strokeRect(X, a - FH, 12, b - a);
}
const label = (d, open) => open ? `${d.icon} ${d.name}` : `${d.name} 🔒`;
const leafPaint = (c, x, y, w, h, col) => {
  const g = c.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, '#9C6438'); g.addColorStop(1, '#6E4524'); c.fillStyle = g; c.fillRect(x, y, w, h);
  c.fillStyle = col; c.fillRect(x, y + h * .42, w, 5); c.strokeStyle = 'rgba(40,20,10,.45)'; c.lineWidth = 1; c.strokeRect(x, y, w, h);
};
/* البوابة المقوّسة: عمودان، قوس بلون الحي فوق الممر، ومصراعان ينفتحان (open رقم بين ٠ و١ أثناء الحركة) */
function archEW(c, d, k) {
  const g = d.gate, Y = g.ew, yb = Y + 12, col = d.cols[0], dh = 40, half = (g.g1 - g.g0) / 2;
  if (!k) { leafPaint(c, g.g0, yb - dh, half, dh, col); leafPaint(c, g.g0 + half, yb - dh, half, dh, col); c.fillStyle = '#3D3A3A'; c.fillRect(g.g0 + half - 3, yb - 22, 6, 9); }
  else { const lw = Math.max(9, half * Math.cos(k * Math.PI / 2)); leafPaint(c, g.g0 - 3 * k, yb - dh, lw, dh, col); leafPaint(c, g.g1 + 3 * k - lw, yb - dh, lw, dh, col); }
  [g.g0 - 22, g.g1].forEach((x, i) => stoneBox3d(c, `dgp${d.b}-${i}`, x, Y - 14, 22, 28, 64, PCOL));
  const cx = (g.g0 + g.g1) / 2, top = Y - 64;   // القوس: نصف دائرة بلون الحي بإطار ذهبي
  c.fillStyle = col; c.beginPath(); c.moveTo(g.g0 - 22, top + 14); c.lineTo(g.g0 - 22, top); c.quadraticCurveTo(cx, top - 46, g.g1 + 22, top); c.lineTo(g.g1 + 22, top + 14); c.quadraticCurveTo(cx, top - 30, g.g0 - 22, top + 14); c.closePath(); c.fill();
  c.strokeStyle = '#E3B04B'; c.lineWidth = 2; c.stroke(); c.strokeStyle = INK; c.lineWidth = .8; c.stroke();
  signboard(c, cx, top - 18, label(d, k > 0));
}
function archNS(c, d, k) {
  const g = d.gate, X = g.ns, col = d.cols[0];
  [g.g0 - 18, g.g1].forEach((y, i) => stoneBox3d(c, `dgp${d.b}-${i}`, X - 6, y, 24, 18, 64, PCOL));
  c.save(); c.translate(X + 6, g.g0 - 50); c.rotate(-1.35 * k);   // عارضة بلون الحي تُرفع
  c.fillStyle = col; rr(c, -4, 0, 8, g.g1 - g.g0 + 4, 3); c.fill(); c.fillStyle = '#FFF6E2'; for (let y = 12; y < g.g1 - g.g0; y += 22) c.fillRect(-4.5, y, 9, 6);
  c.strokeStyle = INK; c.lineWidth = .9; rr(c, -4, 0, 8, g.g1 - g.g0 + 4, 3); c.stroke(); c.restore();
  signboard(c, X + 6, g.g0 - 92, label(d, k > 0));
}
/* عناصر الرسم لبوابة حيّ وسوره (لا شيء في 3D: هناك مجسّمات) */
export function districtGateItems(d, open, t) {
  if (FLAGS.three) return [];
  const g = d.gate, k = open === true ? 1 : +open || 0, col = d.cols[0], out = [];
  if (g.ew !== undefined) {
    for (let x = g.a; x < g.g0 - 22; x += 600) { const x1 = Math.min(x + 600, g.g0 - 22); out.push({ y: g.ew + 12, draw: c => sprite(c, `dfe${d.b}-${x}`, x - 2, g.ew - FH - 22, x1 - x + 4, FH + 40, q => fenceEW(q, x, x1, g.ew, col)) }); }
    for (let x = g.g1 + 22; x < g.z; x += 600) { const x1 = Math.min(x + 600, g.z); out.push({ y: g.ew + 12, draw: c => sprite(c, `dfe${d.b}-${x}`, x - 2, g.ew - FH - 22, x1 - x + 4, FH + 40, q => fenceEW(q, x, x1, g.ew, col)) }); }
    out.push({ y: g.ew + 13, draw: c => archEW(c, d, k) });
  } else {
    [[g.a, g.g0 - 18], [g.g1 + 18, g.z]].forEach(([a, b]) => { for (let y = a; y < b; y += 300) { const y1 = Math.min(y + 300, b); out.push({ y: y1, draw: c => sprite(c, `dfn${d.b}-${y}`, g.ns - 4, y - FH - 16, 20, y1 - y + FH + 18, q => fenceNS(q, g.ns, y, y1, col)) }); } });
    out.push({ y: g.g1 + 18, draw: c => archNS(c, d, k) });
  }
  return out;
}

/* ── المَعالم: نصب صغير في كل حي يدل على وحدته (يُرسم مرة ويُحفظ) ── */
const disc = (c, x, y, r, f, s = INK) => { c.fillStyle = f; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.strokeStyle = s; c.lineWidth = 1; c.stroke(); };
const panel = (c, x, y, w, h, f) => { c.fillStyle = f; rr(c, x, y, w, h, 4); c.fill(); c.strokeStyle = INK; c.lineWidth = 1.2; rr(c, x, y, w, h, 4); c.stroke(); };
const txt = (c, s, x, y, px, f = '#3A2A1A') => { c.direction = 'rtl'; c.font = `900 ${px}px Cairo, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = f; c.fillText(s, x, y); c.textBaseline = 'alphabetic'; };
const MARKS = {
  decimal(c, x, y, [a, b]) {   // خط أعداد قائم: من ٠ إلى ١ بأعشاره، وسهم عند ٠٫٧
    c.fillStyle = '#8A5A30'; c.fillRect(x - 3, y - 96, 6, 96);
    panel(c, x - 46, y - 92, 92, 34, '#FFF6E2'); c.strokeStyle = a; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 38, y - 70); c.lineTo(x + 38, y - 70); c.stroke();
    for (let i = 0; i <= 10; i++) { c.beginPath(); c.moveTo(x - 38 + i * 7.6, y - 70); c.lineTo(x - 38 + i * 7.6, y - (i % 5 ? 75 : 79)); c.stroke(); }
    txt(c, '٠', x - 38, y - 64, 8); txt(c, '١', x + 38, y - 64, 8);   // خط الأعداد من اليسار إلى اليمين
    c.fillStyle = b; c.strokeStyle = INK; c.beginPath(); c.moveTo(x + 15.2, y - 76); c.lineTo(x + 11.4, y - 86); c.lineTo(x + 19, y - 86); c.closePath(); c.fill(); c.stroke();
    txt(c, '٠٫٧', x + 15, y - 50, 13, a);
  },
  measure(c, x, y, [a]) {   // ميزان ذو كفتين ومسطرة مترية
    c.fillStyle = '#7A4A2A'; c.fillRect(x - 3, y - 84, 6, 84); c.fillRect(x - 40, y - 84, 80, 5);
    [-36, 36].forEach(dx => { c.strokeStyle = '#5A4A3A'; c.lineWidth = 1; c.beginPath(); c.moveTo(x + dx, y - 80); c.lineTo(x + dx - 10, y - 56); c.moveTo(x + dx, y - 80); c.lineTo(x + dx + 10, y - 56); c.stroke(); c.fillStyle = '#C9A55A'; c.beginPath(); c.ellipse(x + dx, y - 54, 14, 5, 0, 0, 7); c.fill(); c.strokeStyle = INK; c.stroke(); });
    disc(c, x, y - 87, 5, a); panel(c, x - 12, y - 48, 24, 46, '#F7D154');
    c.strokeStyle = INK; c.lineWidth = .8; for (let i = 0; i < 8; i++) { c.beginPath(); c.moveTo(x - 12, y - 44 + i * 5.5); c.lineTo(x - (i % 2 ? 6 : 2), y - 44 + i * 5.5); c.stroke(); }
  },
  angle(c, x, y, [a, b]) {   // منقلة كبيرة قائمة وذراع زاوية
    c.fillStyle = shade(a, 50); c.beginPath(); c.moveTo(x - 46, y - 18); c.arc(x, y - 18, 46, Math.PI, 0); c.closePath(); c.fill(); c.strokeStyle = INK; c.lineWidth = 1.2; c.stroke();
    c.strokeStyle = a; c.lineWidth = 1; for (let i = 0; i <= 18; i++) { const t = Math.PI + i * Math.PI / 18, r0 = i % 9 ? 40 : 34; c.beginPath(); c.moveTo(x + Math.cos(t) * r0, y - 18 + Math.sin(t) * r0); c.lineTo(x + Math.cos(t) * 46, y - 18 + Math.sin(t) * 46); c.stroke(); }
    c.strokeStyle = b; c.lineWidth = 4; c.beginPath(); c.moveTo(x, y - 18); c.lineTo(x + Math.cos(-2.2) * 52, y - 18 + Math.sin(-2.2) * 52); c.stroke();
    c.strokeStyle = b; c.lineWidth = 2; c.beginPath(); c.arc(x, y - 18, 16, -2.2, 0); c.stroke(); disc(c, x, y - 18, 4, b); txt(c, '°', x + 22, y - 30, 14, a);
  },
  fraction(c, x, y, [a, b]) {   // قرص مقسوم أثماناً، وقطعة منه خارجه
    c.fillStyle = '#8A5A30'; c.fillRect(x - 3, y - 40, 6, 40);
    for (let i = 0; i < 8; i++) { c.fillStyle = i < 5 ? a : '#FFF6E2'; c.beginPath(); c.moveTo(x, y - 64); c.arc(x, y - 64, 34, i * Math.PI / 4, (i + 1) * Math.PI / 4); c.closePath(); c.fill(); c.strokeStyle = INK; c.lineWidth = 1; c.stroke(); }
    txt(c, '٥', x + 52, y - 76, 12, a); c.fillStyle = INK; c.fillRect(x + 45, y - 68, 14, 2); txt(c, '٨', x + 52, y - 58, 12, a);
  },
  area(c, x, y, [a]) {   // لوح فسيفساء: مربعات وحدة مظللة جزئياً، وعليه «م²»
    c.fillStyle = '#8A5A30'; c.fillRect(x - 30, y - 20, 5, 20); c.fillRect(x + 25, y - 20, 5, 20);
    panel(c, x - 40, y - 96, 80, 78, '#FFF6E2');
    for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { c.fillStyle = (i < 3 && j < 2) ? a : shade(a, 70); c.fillRect(x - 34 + i * 17, y - 90 + j * 17, 16, 16); }
    txt(c, '٦ م²', x, y - 29, 11, shade(a, -20));
  },
  percent(c, x, y, [a]) {   // لوحة مئة مربع، ٣٥ منها ملوّنة، ورمز ٪ كبير
    c.fillStyle = '#7A4A2A'; c.fillRect(x - 3, y - 30, 6, 30);
    panel(c, x - 40, y - 108, 80, 80, '#FFFFFF');
    for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) { c.fillStyle = (j * 10 + i < 35) ? a : '#F1E6D6'; c.fillRect(x - 36 + i * 7.2, y - 104 + j * 7.2, 6.4, 6.4); }
    disc(c, x + 40, y - 108, 14, '#FFC23D'); txt(c, '٪', x + 40, y - 107, 15, a);
  },
  mirror(c, x, y, [a, b]) {   // فراشة من الشجيرات المشذّبة على خط تماثل
    c.fillStyle = '#5E8C3A'; c.fillRect(x - 3, y - 26, 6, 26);
    [-1, 1].forEach(s => { c.fillStyle = a; c.beginPath(); c.ellipse(x + s * 22, y - 66, 22, 18, s * .5, 0, 7); c.fill(); c.strokeStyle = INK; c.lineWidth = 1; c.stroke(); c.fillStyle = shade(a, 30); c.beginPath(); c.ellipse(x + s * 17, y - 40, 14, 11, -s * .4, 0, 7); c.fill(); c.stroke(); disc(c, x + s * 24, y - 68, 6, b); });
    c.fillStyle = '#4A3A2A'; rr(c, x - 4, y - 84, 8, 50, 4); c.fill();
    c.strokeStyle = '#C2304A'; c.lineWidth = 1.6; c.setLineDash([5, 4]); c.beginPath(); c.moveTo(x, y - 104); c.lineTo(x, y - 18); c.stroke(); c.setLineDash([]);
  },
  tally(c, x, y, [a]) {   // لوح استبيان بعلامات العدّ
    c.fillStyle = '#7A4A2A'; c.fillRect(x - 34, y - 26, 5, 26); c.fillRect(x + 29, y - 26, 5, 26);
    panel(c, x - 42, y - 98, 84, 74, '#24453A'); c.fillStyle = a; c.fillRect(x - 42, y - 98, 84, 14); txt(c, 'استبيان', x, y - 91, 9, '#FFF6E2');
    c.strokeStyle = '#FFF6E2'; c.lineWidth = 1.6;
    [[4, 1], [3, 0], [2, 1]].forEach(([n, five], r) => { const yy = y - 74 + r * 17; for (let g = 0; g < n; g++) { const gx = x - 32 + g * 18; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(gx + i * 3, yy - 6); c.lineTo(gx + i * 3, yy + 6); c.stroke(); } if (five || g < n - 1) { c.beginPath(); c.moveTo(gx - 2, yy + 4); c.lineTo(gx + 12, yy - 4); c.stroke(); } } });
  },
  fracbars(c, x, y, [a]) {   // جدار الكسور: الواحد، ونصفان، وثلاثة أثلاث، وأربعة أرباع
    c.fillStyle = '#7A4A2A'; c.fillRect(x - 36, y - 18, 5, 18); c.fillRect(x + 31, y - 18, 5, 18);
    [1, 2, 3, 4].forEach((n, r) => { for (let i = 0; i < n; i++) { const w = 76 / n; c.fillStyle = r % 2 ? shade(a, 40) : a; c.fillRect(x - 38 + i * w, y - 96 + r * 19, w, 17); c.strokeStyle = INK; c.lineWidth = 1; c.strokeRect(x - 38 + i * w, y - 96 + r * 19, w, 17); } });
    txt(c, '١', x, y - 87, 10, '#FFF6E2');
  },
  dice(c, x, y, [a, b]) {   // نردان كبيران ومؤشّر دوّار
    const die = (dx, dy, s, pips) => { c.fillStyle = '#FFFFFF'; rr(c, dx - s / 2, dy - s, s, s, 6); c.fill(); c.strokeStyle = INK; c.lineWidth = 1.2; rr(c, dx - s / 2, dy - s, s, s, 6); c.stroke(); c.fillStyle = shade('#FFFFFF', -14); c.fillRect(dx - s / 2 + 3, dy - 6, s - 6, 4); pips.forEach(([px, py]) => disc(c, dx + px * s / 4, dy - s / 2 + py * s / 4, 3.4, a, a)); };
    die(x - 22, y - 2, 38, [[-1, -1], [0, 0], [1, 1]]); die(x + 22, y - 6, 34, [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, 0]]);
    c.fillStyle = '#8A5A30'; c.fillRect(x - 2, y - 92, 4, 52);
    for (let i = 0; i < 4; i++) { c.fillStyle = [a, b, '#FFC23D', '#2BA5C9'][i]; c.beginPath(); c.moveTo(x, y - 100); c.arc(x, y - 100, 22, i * Math.PI / 2, (i + 1) * Math.PI / 2); c.closePath(); c.fill(); c.strokeStyle = INK; c.lineWidth = 1; c.stroke(); }
    c.strokeStyle = INK; c.lineWidth = 2.4; c.beginPath(); c.moveTo(x, y - 100); c.lineTo(x + 12, y - 114); c.stroke();
  },
  tag(c, x, y, [a, b]) {   // بطاقة سعر كبيرة: خصم ٢٥٪ والسعر بالعشريات
    c.fillStyle = '#8A5A30'; c.fillRect(x - 3, y - 40, 6, 40);
    c.fillStyle = a; c.beginPath(); c.moveTo(x - 44, y - 100); c.lineTo(x + 28, y - 100); c.lineTo(x + 46, y - 76); c.lineTo(x + 28, y - 52); c.lineTo(x - 44, y - 52); c.closePath(); c.fill(); c.strokeStyle = INK; c.lineWidth = 1.2; c.stroke();
    disc(c, x + 28, y - 76, 4, '#FFF6E2'); txt(c, '−٢٥٪', x - 8, y - 87, 13, b); txt(c, '٤٫٥ ر.ع', x - 8, y - 65, 10, '#FFF6E2');
  },
  pie(c, x, y, [a, b]) {   // مخطط دائري على حامل، وأعمدة صغيرة بجانبه
    c.fillStyle = '#8A5A30'; c.fillRect(x - 3, y - 44, 6, 44);
    const v = [.4, .25, .2, .15], cs = [a, b, '#FFC23D', '#1F8A5A']; let s = -Math.PI / 2;
    v.forEach((p, i) => { c.fillStyle = cs[i]; c.beginPath(); c.moveTo(x, y - 76); c.arc(x, y - 76, 34, s, s + p * 6.283); c.closePath(); c.fill(); c.strokeStyle = '#FFF6E2'; c.lineWidth = 1.5; c.stroke(); s += p * 6.283; });
    c.strokeStyle = INK; c.lineWidth = 1.2; c.beginPath(); c.arc(x, y - 76, 34, 0, 7); c.stroke();
    [14, 24, 18].forEach((h, i) => { c.fillStyle = cs[i]; c.fillRect(x + 40 + i * 9, y - h, 7, h); c.strokeStyle = INK; c.lineWidth = .8; c.strokeRect(x + 40 + i * 9, y - h, 7, h); });
  },
  formula(c, x, y, [a]) {   // سبّورة عليها صيغة بالحروف
    c.fillStyle = '#7A4A2A'; c.beginPath(); c.moveTo(x - 30, y); c.lineTo(x - 22, y - 50); c.lineTo(x - 18, y - 50); c.lineTo(x - 26, y); c.fill(); c.beginPath(); c.moveTo(x + 30, y); c.lineTo(x + 22, y - 50); c.lineTo(x + 18, y - 50); c.lineTo(x + 26, y); c.fill();
    panel(c, x - 46, y - 104, 92, 60, '#24453A'); c.strokeStyle = a; c.lineWidth = 3; rr(c, x - 46, y - 104, 92, 60, 4); c.stroke();
    txt(c, 'م = ط × ع', x, y - 84, 13, '#FFF6E2'); txt(c, '٢س + ٣', x, y - 62, 12, '#F7D154');
  },
  graph(c, x, y, [a, b]) {   // لوح إحداثيات: محوران وشبكة وخط مستقيم
    c.fillStyle = '#7A4A2A'; c.fillRect(x - 3, y - 24, 6, 24);
    panel(c, x - 42, y - 108, 84, 84, '#FFFFFF');
    c.strokeStyle = '#D6E4F0'; c.lineWidth = 1; for (let i = 1; i < 8; i++) { c.beginPath(); c.moveTo(x - 42 + i * 10.5, y - 104); c.lineTo(x - 42 + i * 10.5, y - 28); c.moveTo(x - 38, y - 108 + i * 10.5); c.lineTo(x + 38, y - 108 + i * 10.5); c.stroke(); }
    c.strokeStyle = '#3A2A1A'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x - 38, y - 66); c.lineTo(x + 38, y - 66); c.moveTo(x, y - 104); c.lineTo(x, y - 28); c.stroke();
    c.strokeStyle = a; c.lineWidth = 3; c.beginPath(); c.moveTo(x - 32, y - 34); c.lineTo(x + 32, y - 100); c.stroke(); disc(c, x + 10.5, y - 76.5, 3.4, b);
  },
  cubes(c, x, y, [a, b]) {   // متوازي مستطيلات من مكعبات وحدة (٣ × ٢ × ٢)
    const s = 16, cube = (cx, cy, f) => {
      c.fillStyle = f; c.fillRect(cx, cy - s, s, s); c.fillStyle = shade(f, 25); c.beginPath(); c.moveTo(cx, cy - s); c.lineTo(cx + 7, cy - s - 7); c.lineTo(cx + s + 7, cy - s - 7); c.lineTo(cx + s, cy - s); c.closePath(); c.fill();
      c.fillStyle = shade(f, -22); c.beginPath(); c.moveTo(cx + s, cy); c.lineTo(cx + s + 7, cy - 7); c.lineTo(cx + s + 7, cy - s - 7); c.lineTo(cx + s, cy - s); c.closePath(); c.fill();
      c.strokeStyle = INK; c.lineWidth = .8; c.strokeRect(cx, cy - s, s, s); };
    for (let k = 1; k >= 0; k--) for (let h = 0; h < 2; h++) for (let i = 0; i < 3; i++) cube(x - 26 + i * s + k * 7, y - 8 - h * s - k * 7, (i + h + k) % 2 ? a : b);
    panel(c, x - 30, y - 92, 60, 18, '#FFF6E2'); txt(c, 'ح = ١٢ سم³', x, y - 83, 9, shade(a, -30));
  }
};
const markItem = d => ({ y: d.at[1], x: d.at[0], draw: c => {
  const [x, y] = d.at; c.fillStyle = 'rgba(60,35,10,.22)'; c.beginPath(); c.ellipse(x + 8, y + 2, 40, 9, 0, 0, 7); c.fill();
  sprite(c, `dmark${d.b}`, x - 64, y - 130, 128, 146, q => { q.fillStyle = shade(PCOL, -8); rr(q, x - 34, y - 6, 68, 14, 4); q.fill(); q.strokeStyle = INK; q.lineWidth = 1; rr(q, x - 34, y - 6, 68, 14, 4); q.stroke(); MARKS[d.mark](q, x, y - 6, d.cols); });
} });
/* رايتان بشعار الحي وحبل رايات بألوانه عند مدخل كل حي ذي بوابة (من داخله) */
function pole(c, x, y, icon, col, t, k) {
  const H = 78; c.fillStyle = 'rgba(60,35,10,.22)'; c.beginPath(); c.ellipse(x + 5, y + 2, 9, 3.5, 0, 0, 7); c.fill();
  c.fillStyle = '#8A8F98'; c.fillRect(x - 2, y - H, 4, H); disc(c, x, y - H - 2, 3, '#FFC23D', '#FFC23D');
  const w = Math.sin(t * 3 + k) * 3, top = y - H + 4; c.fillStyle = col; c.strokeStyle = INK; c.lineWidth = 1;
  c.beginPath(); c.moveTo(x + 2, top); c.quadraticCurveTo(x + 20, top - 4 + w, x + 38, top + w); c.lineTo(x + 38, top + 26 + w); c.quadraticCurveTo(x + 20, top + 22 - w, x + 2, top + 26); c.closePath(); c.fill(); c.stroke();
  c.font = '14px "Segoe UI Emoji", sans-serif'; c.textAlign = 'center'; c.fillText(icon, x + 20, top + 18 + w * .5);
}
const poles = d => { const g = d.gate; if (g.ew !== undefined) return [[g.g0 - 60, g.ew + 40], [g.g1 + 60, g.ew + 40]]; return [[g.ns + 40, g.g0 - 40], [g.ns + 40, g.g1 + 50]]; };
export function districtDecor(view, t) {
  const out = [], vis = (x, y) => x > view.x - 160 && x < view.x + view.w + 160 && y > view.y - 60 && y < view.y + view.h + 220;
  DISTRICTS.forEach(d => {
    if (d.at && vis(...d.at)) out.push(markItem(d));
    if (!d.gate) return;
    const [a, b] = poles(d); if (!vis(...a) && !vis(...b)) return;
    out.push({ y: a[1], x: a[0], draw: c => pole(c, a[0], a[1], d.icon, d.cols[0], t, d.b) }, { y: b[1], x: b[0], draw: c => pole(c, b[0], b[1], d.icon, d.cols[0], t, d.b + 1) });
    out.push({ y: Math.max(a[1], b[1]) + 1, draw: c => bunting(c, elev(a[0], a[1], 72), elev(b[0], b[1], 72), 16, 8, [d.cols[0], d.cols[1], '#FFC23D'], t) });
  });
  return out;
}
