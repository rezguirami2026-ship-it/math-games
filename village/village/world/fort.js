// «القلعة»: منطقة الوحدة الرابعة (الأعداد ٢) جنوب القرية خلف سور، تُفتح بإنهاء الوحدة الثالثة
import { rr, shade } from '../core/util.js';
export const WALL_Y = 1712, GATE3 = { x0: 1190, x1: 1290 };
export const BW = { x0: 420, x1: 1580, y: 1830 };                       // ممشى الجسر = خط الأعداد
export const MOAT = { x: 380, y: 1852, w: 1240, h: 58 };
export const CASTLE = { x: 1750, y: 1760, w: 600, h: 280 };
export const B4 = {                                                       // مبانٍ ومحطات
  museum: { x: 300, y: 1960, w: 180, h: 100, wall: '#E3D3B5', sign: 'المتحف' },
  gold: { x: 560, y: 1960, w: 180, h: 100, wall: '#F1E1B0', sign: 'دار الذهب' },
  kitchen: { x: 820, y: 1960, w: 180, h: 100, wall: '#F3D9C6', sign: 'مطبخ الحلوى' },
  grain: { x: 300, y: 2250, w: 180, h: 100, wall: '#E6D2A8', sign: 'مخزن الحبوب' },
  roof: { x: 960, y: 2250, w: 180, h: 100, wall: '#EAD8BC', sign: 'بيت مراد' }
};
export const ST4 = {
  museum: { x: 390, y: 2096 }, gold: { x: 650, y: 2096 }, kitchen: { x: 910, y: 2096 }, trip: { x: 1110, y: 2100 },
  well: { x: 1430, y: 2124 }, bells: { x: 2430, y: 1884 }, change: { x: 2610, y: 2104 },
  grain: { x: 390, y: 2388 }, conveyor: { x: 700, y: 2392 }, roof: { x: 1050, y: 2388 }, pack: { x: 1360, y: 2392 }, gate: { x: 2050, y: 2092 }
};
export function fortColliders(open) {
  const c = [
    { x: 0, y: WALL_Y, w: GATE3.x0, h: 12 }, { x: GATE3.x1, y: WALL_Y, w: 2930 - GATE3.x1, h: 12 },
    { x: MOAT.x, y: MOAT.y, w: MOAT.w, h: MOAT.h }, { x: CASTLE.x, y: CASTLE.y, w: CASTLE.w, h: CASTLE.h },
    ...Object.values(B4).map(b => ({ x: b.x, y: b.y + 10, w: b.w, h: b.h - 6 })),
    { x: ST4.well.x - 26, y: ST4.well.y - 52, w: 52, h: 36 }, { x: 2360, y: 1770, w: 40, h: 60 }, { x: 2460, y: 1770, w: 40, h: 60 },
    { x: ST4.trip.x - 40, y: ST4.trip.y - 44, w: 80, h: 22 }, { x: ST4.change.x - 40, y: ST4.change.y - 44, w: 80, h: 22 },
    { x: ST4.conveyor.x - 110, y: ST4.conveyor.y - 50, w: 220, h: 26 }, { x: ST4.pack.x - 30, y: ST4.pack.y - 54, w: 60, h: 30 }
  ];
  if (!open) c.push({ x: GATE3.x0, y: WALL_Y - 4, w: GATE3.x1 - GATE3.x0, h: 20 });
  return c;
}
export function drawFortGround(ctx, t) {
  ctx.fillStyle = '#E3CD98'; ctx.fillRect(0, WALL_Y, 2930, 2600 - WALL_Y);   // أرض القلعة أدكن قليلاً
  ctx.fillStyle = '#3FA0E0'; rr(ctx, MOAT.x, MOAT.y, MOAT.w, MOAT.h, 20); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.25)'; for (let i = 0; i < 16; i++) ctx.fillRect(MOAT.x + 30 + i * 75 + (t * 16 % 30), MOAT.y + 22 + (i % 2) * 14, 24, 3);
  ctx.fillStyle = '#A9743F'; ctx.fillRect(BW.x0 - 20, BW.y - 14, BW.x1 - BW.x0 + 40, 28);
  ctx.strokeStyle = '#7A4F2A'; ctx.lineWidth = 1.2; for (let x = BW.x0 - 20; x < BW.x1 + 20; x += 14) { ctx.beginPath(); ctx.moveTo(x, BW.y - 14); ctx.lineTo(x, BW.y + 14); ctx.stroke(); }
  ctx.fillStyle = '#C9B48E'; rr(ctx, GATE3.x0 - 30, WALL_Y + 12, GATE3.x1 - GATE3.x0 + 60, 70, 8); ctx.fill();
}
export function fortDrawables(open, t) {
  const out = [{ y: WALL_Y + 12, draw: c => wall(c, open) }, { y: CASTLE.y + CASTLE.h, draw: c => castle(c, t) }];
  Object.values(B4).forEach(b => out.push({ y: b.y + b.h, draw: c => building(c, b) }));
  out.push({ y: ST4.well.y - 16, draw: c => { const w = ST4.well; c.fillStyle = '#A99878'; c.beginPath(); c.ellipse(w.x, w.y - 34, 26, 14, 0, 0, 7); c.fill(); c.fillStyle = '#2B2418'; c.beginPath(); c.ellipse(w.x, w.y - 34, 19, 9, 0, 0, 7); c.fill(); c.strokeStyle = '#7B6A4E'; c.lineWidth = 3; c.beginPath(); c.moveTo(w.x - 26, w.y - 34); c.lineTo(w.x - 26, w.y - 76); c.lineTo(w.x + 26, w.y - 76); c.lineTo(w.x + 26, w.y - 34); c.stroke(); } });
  [[2380, '#C0392B'], [2480, '#2F6FB2']].forEach(([x, col]) => out.push({ y: 1830, draw: c => { c.fillStyle = '#C9B48E'; c.fillRect(x - 20, 1770, 40, 60); c.fillStyle = shade('#C9B48E', -20); c.fillRect(x - 20, 1770, 40, 8); c.fillStyle = col; c.beginPath(); c.moveTo(x - 12, 1762); c.lineTo(x + 12, 1762); c.lineTo(x + 8, 1740); c.lineTo(x - 8, 1740); c.closePath(); c.fill(); c.fillStyle = '#FFC23D'; c.beginPath(); c.arc(x, 1792, 9, Math.PI, 0); c.fill(); } }));
  [[ST4.trip, '#2E8B57'], [ST4.change, '#7B3F98']].forEach(([s, col]) => out.push({ y: s.y - 22, draw: c => { c.fillStyle = '#9B6B3D'; c.fillRect(s.x - 40, s.y - 84, 5, 62); c.fillRect(s.x + 35, s.y - 84, 5, 62); for (let k = 0; k < 5; k++) { c.fillStyle = k % 2 ? '#F4E3B8' : col; c.fillRect(s.x - 44 + k * 17.6, s.y - 96, 17.6, 16); } c.fillStyle = '#B07A3B'; rr(c, s.x - 40, s.y - 44, 80, 22, 3); c.fill(); } }));
  out.push({ y: ST4.conveyor.y - 24, draw: c => { const s = ST4.conveyor; c.fillStyle = '#5E6B78'; rr(c, s.x - 110, s.y - 50, 220, 26, 6); c.fill(); c.fillStyle = '#3B4452'; for (let i = 0; i < 11; i++) c.fillRect(s.x - 104 + ((i * 20 + t * 30) % 210), s.y - 46, 3, 18); } });
  out.push({ y: ST4.pack.y - 24, draw: c => { const s = ST4.pack; c.fillStyle = '#C98A3A'; rr(c, s.x - 30, s.y - 54, 60, 30, 6); c.fill(); c.fillStyle = '#FFE7A0'; rr(c, s.x - 20, s.y - 48, 40, 12, 3); c.fill(); } });
  return out;
}
function building(c, b) {
  const fh = 34, rh = b.h - fh;
  c.fillStyle = 'rgba(60,35,10,.16)'; c.fillRect(b.x + 6, b.y + b.h - 2, b.w, 8);
  c.fillStyle = shade(b.wall, -22); c.fillRect(b.x, b.y + rh, b.w, fh); c.fillStyle = shade(b.wall, 12); c.fillRect(b.x, b.y, b.w, rh);
  c.fillStyle = shade(b.wall, -4); for (let x = b.x; x < b.x + b.w - 8; x += 16) { c.beginPath(); c.moveTo(x, b.y + rh); c.lineTo(x + 8, b.y + rh - 7); c.lineTo(x + 16, b.y + rh); c.fill(); }
  c.fillStyle = '#7A4F2A'; rr(c, b.x + b.w / 2 - 14, b.y + rh + 6, 28, fh - 6, 8); c.fill();
  c.fillStyle = '#FFFDF6'; rr(c, b.x + b.w / 2 - 50, b.y + 16, 100, 24, 6); c.fill(); c.fillStyle = '#5B4636'; c.font = '900 13px Cairo, sans-serif'; c.textAlign = 'center'; c.fillText(b.sign, b.x + b.w / 2, b.y + 33);
}
function castle(c, t) {
  const K = CASTLE, wallC = '#D2B47E';
  c.fillStyle = 'rgba(60,35,10,.2)'; c.fillRect(K.x + 10, K.y + K.h - 4, K.w, 14);
  c.fillStyle = shade(wallC, -18); c.fillRect(K.x, K.y + 120, K.w, K.h - 120);
  c.fillStyle = wallC; c.fillRect(K.x, K.y + 60, K.w, 70);
  for (let x = K.x; x < K.x + K.w; x += 30) { c.fillStyle = shade(wallC, 10); c.fillRect(x, K.y + 46, 18, 16); }
  [[K.x + 40, 0], [K.x + K.w - 40, 0], [K.x + K.w / 2, -30]].forEach(([x, dy]) => { c.fillStyle = shade(wallC, -8); c.beginPath(); c.arc(x, K.y + 120 + dy, 44, Math.PI, 0); c.fill(); c.fillRect(x - 44, K.y + 120 + dy, 88, K.h - 120 - dy); c.fillStyle = shade(wallC, 14); for (let k = -2; k <= 2; k++) c.fillRect(x + k * 17 - 6, K.y + 64 + dy, 12, 16); });
  c.fillStyle = '#5B3A1E'; rr(c, K.x + K.w / 2 - 34, K.y + K.h - 90, 68, 90, 30); c.fill();
  c.fillStyle = '#C0392B'; c.fillRect(K.x + K.w / 2 - 2, K.y - 30, 4, 50); c.beginPath(); c.moveTo(K.x + K.w / 2 + 2, K.y - 30); c.lineTo(K.x + K.w / 2 + 36 + Math.sin(t * 3) * 3, K.y - 20); c.lineTo(K.x + K.w / 2 + 2, K.y - 10); c.fill();
}
function wall(c, open) {
  c.fillStyle = '#C9B48E';
  [[0, GATE3.x0], [GATE3.x1, 2930]].forEach(([a, b]) => { c.fillRect(a, WALL_Y, b - a, 12); for (let x = a; x < b; x += 18) c.fillRect(x, WALL_Y - 4, 8, 18); });
  c.fillStyle = '#B79F74'; c.fillRect(GATE3.x0 - 20, WALL_Y - 30, 24, 44); c.fillRect(GATE3.x1 - 4, WALL_Y - 30, 24, 44);
  c.fillStyle = '#FFFDF6'; rr(c, (GATE3.x0 + GATE3.x1) / 2 - 56, WALL_Y - 64, 112, 26, 7); c.fill();
  c.fillStyle = '#5B4636'; c.font = '900 14px Cairo, sans-serif'; c.textAlign = 'center'; c.fillText(open ? 'القلعة ↓' : 'القلعة 🔒', (GATE3.x0 + GATE3.x1) / 2, WALL_Y - 46);
  if (!open) for (let i = 0; i < 7; i++) { c.fillStyle = i % 2 ? '#fff' : '#E2475C'; c.fillRect(GATE3.x0 + i * 14.3, WALL_Y - 2, 14.3, 14); }
}
