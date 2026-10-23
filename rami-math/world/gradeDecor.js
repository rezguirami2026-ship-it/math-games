// زينة الصف: عند مدخل كل منطقة (داخل البوابة) ساريتان برايتين بشعار المنطقة وألوان الصف، وحبل رايات بينهما.
// الأسماء والرموز والألوان من content/places.js؛ السادس بلا زينة إضافية (عالمه كما عرفه طلابه). عناصر قائمة تُرسم في العرضين.
import { INK, bunting, elev } from './art.js';
import { placeIcon, GRADE_COLS } from '../content/places.js';
import { WALL_Y, GATE3 } from './fort.js';
import { WALL4_Y, GATE4 } from './festival.js';
import { WALL6_Y as DATA_Y, GATE6 as DATA_G } from './datayard.js';
import { WALL5_Y, GATE5 } from './coop.js';
import { WALL6_Y as CAR_Y, GATE6 as CAR_G } from './caravan.js';
import { WALL7_Y, GATE7 } from './workshop.js';
import { GATE_X } from './market.js';
import { GATE2_X } from './harbor.js';

const H = 92;   // ارتفاع السارية
/* [المنطقة، السارية الأولى، الثانية]: داخل البوابة بقليل، على جانبي الممر */
const ew = (id, Y, g) => [id, [g.x0 - 70, Y + 46], [g.x1 + 70, Y + 46]];
const ns = (id, X) => [id, [X + 64, 556], [X + 64, 730]];
const SPOTS = [ns('market', GATE_X), ns('harbor', GATE2_X), ew('fort', WALL_Y, GATE3), ew('festival', WALL4_Y, GATE4),
  ew('datayard', DATA_Y, DATA_G), ew('coop', WALL5_Y, GATE5), ew('caravan', CAR_Y, CAR_G), ew('workshop', WALL7_Y, GATE7)];

function pole(c, x, y, icon, col, t, k) {
  c.fillStyle = 'rgba(60,35,10,.22)'; c.beginPath(); c.ellipse(x + 6, y + 2, 10, 4, 0, 0, 7); c.fill();
  c.fillStyle = '#8A8F98'; c.fillRect(x - 2, y - H, 4, H); c.fillStyle = '#FFC23D'; c.beginPath(); c.arc(x, y - H - 2, 3.5, 0, 7); c.fill();
  const w = Math.sin(t * 3 + k) * 3, top = y - H + 4;   // راية ترفرف بشعار المنطقة
  c.fillStyle = col; c.strokeStyle = INK; c.lineWidth = 1;
  c.beginPath(); c.moveTo(x + 2, top); c.quadraticCurveTo(x + 22, top - 4 + w, x + 42, top + w); c.lineTo(x + 42, top + 28 + w); c.quadraticCurveTo(x + 22, top + 24 - w, x + 2, top + 28); c.closePath(); c.fill(); c.stroke();
  c.font = '15px "Segoe UI Emoji", sans-serif'; c.textAlign = 'center'; c.fillText(icon, x + 22, top + 19 + w * .5);
}
/* عناصر الرسم القريبة من الشاشة */
export function gradeDecor(view, t) {
  if (!GRADE_COLS) return [];
  const out = [];
  SPOTS.forEach(([id, a, b], i) => {
    if (Math.max(a[1], b[1]) < view.y - 140 || Math.min(a[1], b[1]) > view.y + view.h + 200 || Math.max(a[0], b[0]) < view.x - 140 || Math.min(a[0], b[0]) > view.x + view.w + 140) return;
    const icon = placeIcon(id), [c1, c2] = GRADE_COLS;
    out.push({ y: a[1], x: a[0], draw: c => pole(c, a[0], a[1], icon, c1, t, i) }, { y: b[1], x: b[0], draw: c => pole(c, b[0], b[1], icon, c2, t, i + 1) });
    out.push({ y: Math.max(a[1], b[1]) + 1, draw: c => bunting(c, elev(a[0], a[1], H - 6), elev(b[0], b[1], H - 6), 18, 9, GRADE_COLS, t) });
  });
  return out;
}
