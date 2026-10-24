// رسوم مشتركة لمشاهد دروس «ميزان الخوارزمي»: رقّ مخطوطة بإطار زخرفي، ميزان ذو كفتين، لوح حجري، وكتابة عبارة جبرية على القماش
// (أجزاء نصية وقوى { b, e } عبر drawMath، من اليمين إلى اليسار كما في الكتاب).
import { drawMath } from '../../math.js';

export const INKC = '#3B2412', GOLD = '#B8860B', TEAL = '#0F766E';

/* خلفية المكتبة: رقّ دافئ بإطار من نجوم ثمانية */
export function parchment(g, w, h) {
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#FBF1D9'); gr.addColorStop(1, '#F1DDB0'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(184,134,11,.35)'; g.lineWidth = 2; g.strokeRect(8, 8, w - 16, h - 16);
  for (let x = 24; x < w; x += 48) [16, h - 16].forEach(y => star(g, x, y, 6, 'rgba(15,118,110,.35)'));
}
export function star(g, x, y, r, col) { g.fillStyle = col; g.beginPath(); for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8, rr = k % 2 ? r * .55 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.fill(); }

/* عبارة على القماش: segs أجزاء من اليمين إلى اليسار (نص أو { b, e } قوة) */
export const expr = (g, segs, x, y, s = 24, col = INKC) => { g.fillStyle = col; g.direction = 'rtl'; drawMath(g, segs, x, y, s); };
export function say(g, txt, x, y, s = 16, col = INKC) { g.font = `800 ${s}px Cairo`; g.textAlign = 'center'; g.direction = 'rtl'; g.fillStyle = col; g.fillText(txt, x, y); }

/* ميزان ذو كفتين: tilt بين −١ و١ (موجب: الكفة اليمنى أثقل)، وعلى كل كفة نص (عبارة) */
export function balance(g, cx, cy, tilt, left, right, s = 1) {
  const a = tilt * .22, L = 150 * s;
  g.fillStyle = '#7C5A2E'; g.fillRect(cx - 8, cy, 16, 120 * s); g.fillRect(cx - 50 * s, cy + 116 * s, 100 * s, 10);
  g.save(); g.translate(cx, cy); g.rotate(a); g.fillStyle = GOLD; g.fillRect(-L, -5, L * 2, 10); g.restore();
  g.fillStyle = GOLD; g.beginPath(); g.arc(cx, cy, 10, 0, 7); g.fill();
  [[-1, left], [1, right]].forEach(([sd, segs]) => { const px = cx + sd * L * Math.cos(a), py = cy + sd * L * Math.sin(a);
    g.strokeStyle = '#8B6914'; g.lineWidth = 2; g.beginPath(); g.moveTo(px, py); g.lineTo(px - 46 * s, py + 60 * s); g.moveTo(px, py); g.lineTo(px + 46 * s, py + 60 * s); g.stroke();
    g.fillStyle = '#D4A017'; g.beginPath(); g.ellipse(px, py + 62 * s, 58 * s, 12 * s, 0, 0, 7); g.fill();
    if (segs) expr(g, segs, px, py + 50 * s, 22 * s); });
}

/* لوح حجري بإطار، يُكتب عليه */
export function slab(g, x, y, w, h, col = '#E7DCC6') { g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(x + 5, y + 6, w, h); g.fillStyle = col; g.fillRect(x, y, w, h); g.strokeStyle = GOLD; g.lineWidth = 3; g.strokeRect(x + 4, y + 4, w - 8, h - 8); }

/* مستطيل بأطوال مكتوبة على أضلاعه (top/bottom/left/right نصوص أو قوى) */
export function rectLabeled(g, x, y, w, h, lab, fill = 'rgba(15,118,110,.12)') {
  g.fillStyle = fill; g.fillRect(x, y, w, h); g.strokeStyle = TEAL; g.lineWidth = 4; g.strokeRect(x, y, w, h);
  if (lab.top) expr(g, lab.top, x + w / 2, y - 10, 20); if (lab.bottom) expr(g, lab.bottom, x + w / 2, y + h + 26, 20);
  if (lab.left) { g.save(); g.translate(x - 14, y + h / 2); g.rotate(-Math.PI / 2); expr(g, lab.left, 0, 0, 20); g.restore(); }
  if (lab.right) { g.save(); g.translate(x + w + 14, y + h / 2); g.rotate(Math.PI / 2); expr(g, lab.right, 0, 0, 20); g.restore(); }
}
