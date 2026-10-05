// «السوق الأسبوعي»: منطقة الوحدة الثانية (القياس) شرق القرية، تُفتح بوابتها بعد إنهاء الوحدة الأولى
import { rr, shade } from '../core/util.js';
import { INK, stoneBox, boxShadow, signboard } from './art.js';
export const GATE_X = 1500;
export const CARP = { x: 1580, y: 140, w: 200, h: 120 }, BENCH = { x: 1700, y: 332 };
export const FIELD = { x: 1880, y: 140, w: 380, h: 300 }, BOARD = { x: 1990, y: 478 };
export const STATION = { x: 1620, y: 712, w: 340, h: 60 }, TIMETABLE = { x: 2010, y: 760 };
export const BAYS = [{ id: 'أ', x: 1690, y: 832 }, { id: 'ب', x: 1800, y: 832 }, { id: 'ج', x: 1910, y: 832 }];
export const SQUARE = { x: 1980, y: 960, w: 280, h: 200 }, CAL = { x: 2120, y: 1012 };
export const PEN = { x: 1640, y: 1180, cell: 32, n: 10 };

export function marketColliders(open) {
  const c = [
    { x: GATE_X, y: 0, w: 12, h: 594 }, { x: GATE_X, y: 686, w: 12, h: 1014 },
    { x: CARP.x, y: CARP.y + 10, w: CARP.w, h: CARP.h - 6 },
    { x: BENCH.x - 34, y: BENCH.y - 14, w: 68, h: 16 },
    { x: STATION.x, y: STATION.y, w: STATION.w, h: 30 },
    { x: TIMETABLE.x - 30, y: TIMETABLE.y - 10, w: 60, h: 12 },
    { x: CAL.x - 44, y: CAL.y - 10, w: 88, h: 12 },
    { x: SQUARE.x + 10, y: SQUARE.y + 150, w: 80, h: 24 }, { x: SQUARE.x + 180, y: SQUARE.y + 150, w: 80, h: 24 }
  ];
  if (!open) c.push({ x: GATE_X - 4, y: 594, w: 20, h: 92 });   // حاجز البوابة
  return c;
}
/* الأرضيات: الملعب والساحة وأرض الحظيرة */
export function drawMarketGround(ctx) {
  marketShadows(ctx);
  const F = FIELD;
  ctx.fillStyle = '#6DBF5B'; rr(ctx, F.x, F.y, F.w, F.h, 10); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.06)'; for (let i = 0; i < 8; i++) if (i % 2) ctx.fillRect(F.x + i * F.w / 8, F.y, F.w / 8, F.h);
  ctx.fillStyle = '#D9C9A3'; rr(ctx, SQUARE.x, SQUARE.y, SQUARE.w, SQUARE.h, 14); ctx.fill();
  ctx.fillStyle = '#CDBB92'; for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) if ((i + j) % 2) ctx.fillRect(SQUARE.x + 20 + i * 40, SQUARE.y + 20 + j * 34, 40, 34);
  const P = PEN, S = P.cell * P.n;
  ctx.fillStyle = '#C9B07A'; rr(ctx, P.x - 8, P.y - 8, S + 16, S + 16, 10); ctx.fill();
  ctx.strokeStyle = 'rgba(90,60,30,.22)'; ctx.lineWidth = 1;
  for (let i = 0; i <= P.n; i++) { ctx.beginPath(); ctx.moveTo(P.x + i * P.cell, P.y); ctx.lineTo(P.x + i * P.cell, P.y + S); ctx.moveTo(P.x, P.y + i * P.cell); ctx.lineTo(P.x + S, P.y + i * P.cell); ctx.stroke(); }
  ctx.fillStyle = '#5B4636'; ctx.font = '900 13px Cairo, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('أرض الحظيرة — كل مربع ١ م', P.x + S / 2, P.y + S + 22);
  ctx.fillStyle = '#C9B48E'; for (let x = GATE_X + 24; x < 2300; x += 70) ctx.fillRect(x, 703, 28, 6);
}
/* المباني والأشياء القائمة (لها عمق) */
export function marketDrawables(open) {
  const out = [];
  out.push({ y: 700, draw: c => drawWall(c, open) });
  out.push({ y: CARP.y + CARP.h, draw: c => building(c, CARP, '#E6D2B0', 'ورشة النجار مبارك') });
  out.push({ y: BENCH.y, draw: c => { c.fillStyle = '#8B5A2B'; rr(c, BENCH.x - 34, BENCH.y - 22, 68, 16, 3); c.fill(); c.fillStyle = '#6B4520'; c.fillRect(BENCH.x - 30, BENCH.y - 6, 5, 8); c.fillRect(BENCH.x + 25, BENCH.y - 6, 5, 8); c.fillStyle = '#D9A066'; rr(c, BENCH.x - 26, BENCH.y - 30, 52, 8, 2); c.fill(); } });
  out.push({ y: BOARD.y, draw: c => { c.fillStyle = '#7D5A36'; c.fillRect(BOARD.x - 2, BOARD.y - 34, 4, 34); c.fillStyle = '#2F4F3F'; rr(c, BOARD.x - 24, BOARD.y - 60, 48, 30, 4); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(BOARD.x - 16, BOARD.y - 44); c.lineTo(BOARD.x + 14, BOARD.y - 48); c.stroke(); } });
  out.push({ y: STATION.y + 30, draw: c => { c.fillStyle = '#9AA5B8'; rr(c, STATION.x, STATION.y, STATION.w, 34, 6); c.fill(); c.fillStyle = '#7D889C'; c.fillRect(STATION.x, STATION.y + 26, STATION.w, 8);
    c.fillStyle = '#FFFDF6'; rr(c, STATION.x + STATION.w / 2 - 60, STATION.y + 4, 120, 20, 5); c.fill(); c.fillStyle = '#2A1B66'; c.font = '900 13px Cairo, sans-serif'; c.textAlign = 'center'; c.fillText('محطة الحافلات', STATION.x + STATION.w / 2, STATION.y + 19);
    BAYS.forEach(b => { c.fillStyle = '#FFC23D'; rr(c, b.x - 13, b.y - 26, 26, 22, 5); c.fill(); c.fillStyle = '#3A2400'; c.font = '900 14px Cairo, sans-serif'; c.fillText(b.id, b.x, b.y - 10); }); } });
  out.push({ y: TIMETABLE.y, draw: c => { c.fillStyle = '#4A4F63'; c.fillRect(TIMETABLE.x - 24, TIMETABLE.y - 30, 4, 30); c.fillRect(TIMETABLE.x + 20, TIMETABLE.y - 30, 4, 30); c.fillStyle = '#1E2433'; rr(c, TIMETABLE.x - 32, TIMETABLE.y - 70, 64, 44, 5); c.fill();
    c.fillStyle = '#FFC23D'; for (let i = 0; i < 3; i++) c.fillRect(TIMETABLE.x - 24, TIMETABLE.y - 62 + i * 12, 48, 4); } });
  out.push({ y: CAL.y, draw: c => { c.fillStyle = '#7D5A36'; c.fillRect(CAL.x - 40, CAL.y - 30, 5, 30); c.fillRect(CAL.x + 35, CAL.y - 30, 5, 30); c.fillStyle = '#F4E3B8'; rr(c, CAL.x - 48, CAL.y - 92, 96, 64, 6); c.fill();
    c.fillStyle = '#C0392B'; c.fillRect(CAL.x - 48, CAL.y - 92, 96, 14); c.fillStyle = '#fff'; c.font = '900 10px Cairo, sans-serif'; c.textAlign = 'center'; c.fillText('تقويم المهرجان', CAL.x, CAL.y - 81);
    c.fillStyle = '#C9A46B'; for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) c.fillRect(CAL.x - 40 + i * 17, CAL.y - 72 + j * 13, 13, 9); } });
  [[SQUARE.x + 50, '#2E8B57'], [SQUARE.x + 220, '#C0392B']].forEach(([x, col]) => out.push({ y: SQUARE.y + 174, draw: c => stall(c, x, SQUARE.y + 174, col) }));
  return out;
}
function building(c, b, wall, sign) {
  const fh = 34, rh = b.h - fh;
  c.fillStyle = 'rgba(60,35,10,.16)'; c.fillRect(b.x + 6, b.y + b.h - 2, b.w, 8);
  c.fillStyle = shade(wall, -22); c.fillRect(b.x, b.y + rh, b.w, fh);
  c.fillStyle = shade(wall, 14); c.fillRect(b.x, b.y, b.w, rh);
  c.fillStyle = '#8B5A2B'; rr(c, b.x + b.w / 2 - 14, b.y + rh + 6, 28, fh - 6, 6); c.fill();
  c.fillStyle = '#FFFDF6'; rr(c, b.x + b.w / 2 - 62, b.y + 16, 124, 24, 6); c.fill();
  c.fillStyle = '#5B4636'; c.font = '900 13px Cairo, sans-serif'; c.textAlign = 'center'; c.fillText(sign, b.x + b.w / 2, b.y + 33);
}
function stall(c, x, y, col) {
  c.fillStyle = '#9B6B3D'; c.fillRect(x - 38, y - 52, 5, 52); c.fillRect(x + 33, y - 52, 5, 52);
  for (let k = 0; k < 5; k++) { c.fillStyle = k % 2 ? '#F4E3B8' : col; c.fillRect(x - 42 + k * 16.8, y - 66, 16.8, 16); }
  c.fillStyle = '#B07A3B'; rr(c, x - 38, y - 22, 76, 22, 3); c.fill();
}
/* سور السوق: سور حجري بارتفاع وشُرَف على طوله، وبرجان عند البوابة، وعارضة خشبية تُرفع حين تُفتح البوابة */
// السور والبرجان منخفضان بما يكفي ليبقى ممر البوابة ظاهراً (في منظور ثلاثة أرباع، ما جنوب الطريق يحجب الطريق خلفه)
const WALLC = '#CDB58C', WALL_H = 40, TOWER_H = 58;
const TOWERS = [{ x: GATE_X - 8, y: 556, w: 28, d: 40 }, { x: GATE_X - 8, y: 690, w: 28, d: 32 }];
function nsWall(c, x, a, b) {   // سور يمتد شمالاً وجنوباً: سطحه العلوي بشُرَف، ووجهه الجنوبي عند نهايته
  const H = WALL_H;
  c.fillStyle = shade(WALLC, 8); c.fillRect(x, a - H, 12, b - a);
  c.fillStyle = 'rgba(80,50,20,.18)'; c.fillRect(x + 8, a - H, 4, b - a);
  for (let y = a + 4; y < b - 10; y += 16) { c.fillStyle = shade(WALLC, 16); c.fillRect(x, y - H - 7, 12, 8); c.fillStyle = shade(WALLC, -14); c.fillRect(x, y - H + 1, 12, 6); c.strokeStyle = INK; c.lineWidth = .6; c.strokeRect(x, y - H - 7, 12, 14); }
  c.fillStyle = shade(WALLC, -10); c.fillRect(x, b - H, 12, H);
  c.strokeStyle = 'rgba(80,55,30,.3)'; c.lineWidth = .8; for (let y = b - H + 8; y < b; y += 8) { c.beginPath(); c.moveTo(x, y); c.lineTo(x + 12, y); c.stroke(); }
  c.strokeStyle = INK; c.lineWidth = 1; c.strokeRect(x, a - H, 12, b - a + H);
}
function drawWall(c, open) {
  nsWall(c, GATE_X, 0, 556); nsWall(c, GATE_X, 722, 1700);
  TOWERS.forEach(t => stoneBox(c, t.x, t.y, t.w, t.d, TOWER_H, WALLC));
  // العارضة فوق كل شيء ليبقى حال البوابة واضحاً: خشب بأطواق نحاسية، تعترض الطريق أو ترتفع بجانب البرج
  c.save(); c.translate(GATE_X + 6, 600);
  if (open) c.rotate(-1.35);
  c.fillStyle = 'rgba(70,42,20,.22)'; if (!open) c.fillRect(6, 4, 8, 82);
  c.fillStyle = '#8A5A30'; rr(c, -4, 0, 8, 84, 3); c.fill(); c.fillStyle = '#A9743F'; c.fillRect(-4, 0, 3, 84);
  c.fillStyle = '#D9A23A'; [10, 40, 70].forEach(y => c.fillRect(-4.5, y, 9, 4));
  c.strokeStyle = INK; c.lineWidth = .9; rr(c, -4, 0, 8, 84, 3); c.stroke();
  c.restore();
  // لافتة البوابة مثبتة على وجه البرج الشمالي
  signboard(c, GATE_X + 6, TOWERS[0].y + TOWERS[0].d - TOWER_H + 22, open ? 'السوق الأسبوعي ←' : 'السوق الأسبوعي 🔒');
}
/* ظلال السور والبرجين على الأرض */
export function marketShadows(ctx) {
  boxShadow(ctx, GATE_X, 0, 12, 556, WALL_H); boxShadow(ctx, GATE_X, 722, 12, 978, WALL_H);
  TOWERS.forEach(t => boxShadow(ctx, t.x, t.y, t.w, t.d, TOWER_H));
}
