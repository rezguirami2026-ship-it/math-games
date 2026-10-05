// «طريق القافلة»: منطقة وحدة القياس (٢) في الفصل الثاني جنوب سوق الجمعية، تُفتح بإنهاء وحدة العدد
import { rr, shade } from '../core/util.js';
export const WALL6_Y = 4500, GATE6 = { x0: 1190, x1: 1290 };
export const ST8 = {
  fuel: { x: 380, y: 4790, sign: 'محطة الوقود', col: '#C0392B' }, signs: { x: 800, y: 4790, sign: 'دليل القافلة', col: '#8B5A2B' },
  flights: { x: 1240, y: 4790, sign: 'مطار الواحة', col: '#2F6FB2' }, century: { x: 1680, y: 4790, sign: 'جدار القرن', col: '#7B3F98' },
  rects: { x: 2120, y: 4790, sign: 'بستان وفاء', col: '#2E8B57' }, oasis: { x: 1240, y: 5230, sign: 'أرض الواحة', col: '#1FC8B5' }
};
export const OASIS = { x: 1240, y: 5100 };
export function caravanColliders(open) {
  const c = [{ x: 0, y: WALL6_Y, w: GATE6.x0, h: 12 }, { x: GATE6.x1, y: WALL6_Y, w: 2930 - GATE6.x1, h: 12 },
    { x: OASIS.x - 120, y: OASIS.y - 50, w: 240, h: 90 }];
  Object.values(ST8).forEach(s => c.push({ x: s.x - 52, y: s.y - 56, w: 104, h: 24 }));
  if (!open) c.push({ x: GATE6.x0, y: WALL6_Y - 4, w: GATE6.x1 - GATE6.x0, h: 20 });
  return c;
}
export function drawCaravanGround(ctx, t) {
  ctx.fillStyle = '#E8CF97'; ctx.fillRect(0, WALL6_Y, 2930, 1000);
  ctx.fillStyle = '#DDBF80'; for (let i = 0; i < 40; i++) { const x = (i * 337) % 2900, y = WALL6_Y + 60 + (i * 191) % 900; ctx.beginPath(); ctx.ellipse(x, y, 60, 14, 0, 0, 7); ctx.fill(); }   // كثبان
  ctx.fillStyle = '#B9A07A'; ctx.fillRect(0, 4880, 2930, 44); ctx.fillStyle = '#FFF4D6'; for (let x = 20; x < 2930; x += 90) ctx.fillRect(x, 4900, 44, 4);   // طريق القافلة
  ctx.fillStyle = '#C9B48E'; rr(ctx, GATE6.x0 - 30, WALL6_Y + 12, GATE6.x1 - GATE6.x0 + 60, 60, 8); ctx.fill();
  // المدرج والواحة
  ctx.fillStyle = '#7D8597'; ctx.fillRect(1060, 4600, 360, 40); ctx.fillStyle = '#fff'; for (let x = 1070; x < 1410; x += 40) ctx.fillRect(x, 4618, 22, 4);
  ctx.fillStyle = '#3FA9F5'; ctx.beginPath(); [[-110, 0], [-70, -40], [0, -48], [80, -34], [118, 4], [70, 36], [-20, 40], [-90, 30]].forEach(([dx, dy], i) => i ? ctx.lineTo(OASIS.x + dx, OASIS.y + dy) : ctx.moveTo(OASIS.x + dx, OASIS.y + dy)); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.3)'; for (let i = 0; i < 4; i++) ctx.fillRect(OASIS.x - 60 + i * 34 + (t * 10 % 20), OASIS.y - 8 + (i % 2) * 14, 18, 3);
}
export function caravanDrawables(open, t) {
  const out = [{ y: WALL6_Y + 12, draw: c => wall(c, open) }];
  Object.values(ST8).forEach(s => out.push({ y: s.y - 32, draw: c => stall(c, s) }));
  out.push({ y: 4640, draw: c => { const x = 1180 + Math.sin(t / 3) * 4, y = 4620; c.fillStyle = '#F4F1E8'; rr(c, x - 50, y - 10, 100, 20, 10); c.fill(); c.fillStyle = '#2F6FB2'; c.fillRect(x - 46, y - 3, 92, 4); c.fillStyle = '#E8EEF3'; c.beginPath(); c.moveTo(x - 10, y); c.lineTo(x - 30, y - 36); c.lineTo(x + 6, y); c.fill(); c.beginPath(); c.moveTo(x - 10, y); c.lineTo(x - 30, y + 36); c.lineTo(x + 6, y); c.fill(); } });
  [[ST8.fuel.x - 90, 4800], [ST8.fuel.x + 90, 4800]].forEach(([x, y]) => out.push({ y, draw: c => { c.fillStyle = '#C0392B'; rr(c, x - 10, y - 44, 20, 44, 4); c.fill(); c.fillStyle = '#fff'; c.fillRect(x - 6, y - 38, 12, 10); } }));
  [[-150, 5080], [150, 5090], [-60, 5150], [80, 5150]].forEach(([dx, y]) => out.push({ y, draw: c => palm(c, OASIS.x + dx, y, t) }));
  return out;
}
function palm(c, x, y, t) {
  c.fillStyle = '#8D6238'; for (let i = 0; i < 7; i++) { c.beginPath(); c.ellipse(x + Math.sin(i * .4) * 2, y - 4 - i * 8, 5, 4.5, 0, 0, 7); c.fill(); }
  c.strokeStyle = '#2E8B47'; c.lineWidth = 5; c.lineCap = 'round'; for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * .55 + Math.sin(t + i) * .03; c.beginPath(); c.moveTo(x, y - 58); c.quadraticCurveTo(x + Math.cos(a) * 16, y - 64 + Math.sin(a) * 16, x + Math.cos(a) * 28, y - 52 + Math.sin(a) * 18); c.stroke(); }
}
function stall(c, s) {
  const x = s.x, y = s.y - 32;
  c.fillStyle = 'rgba(60,35,10,.18)'; c.fillRect(x - 54, y, 108, 8);
  c.fillStyle = '#9B6B3D'; c.fillRect(x - 50, y - 70, 6, 70); c.fillRect(x + 44, y - 70, 6, 70);
  for (let k = 0; k < 6; k++) { c.fillStyle = k % 2 ? '#F4E3B8' : s.col; c.fillRect(x - 56 + k * 18.7, y - 86, 18.7, 18); }
  c.fillStyle = shade(s.col, -20); c.fillRect(x - 56, y - 70, 112, 4); c.fillStyle = '#B07A3B'; rr(c, x - 50, y - 24, 100, 24, 3); c.fill();
  c.fillStyle = '#FFFDF6'; rr(c, x - 50, y - 116, 100, 24, 6); c.fill(); c.fillStyle = '#5B4636'; c.font = '900 12px Cairo, sans-serif'; c.textAlign = 'center'; c.fillText(s.sign, x, y - 99);
}
function wall(c, open) {
  c.fillStyle = '#C9B48E';
  [[0, GATE6.x0], [GATE6.x1, 2930]].forEach(([a, b]) => { c.fillRect(a, WALL6_Y, b - a, 12); for (let x = a; x < b; x += 18) c.fillRect(x, WALL6_Y - 4, 8, 18); });
  c.fillStyle = '#B79F74'; c.fillRect(GATE6.x0 - 20, WALL6_Y - 30, 24, 44); c.fillRect(GATE6.x1 - 4, WALL6_Y - 30, 24, 44);
  c.fillStyle = '#FFFDF6'; rr(c, (GATE6.x0 + GATE6.x1) / 2 - 64, WALL6_Y - 64, 128, 26, 7); c.fill();
  c.fillStyle = '#5B4636'; c.font = '900 14px Cairo, sans-serif'; c.textAlign = 'center'; c.fillText(open ? 'طريق القافلة ↓' : 'طريق القافلة 🔒', (GATE6.x0 + GATE6.x1) / 2, WALL6_Y - 46);
  if (!open) for (let i = 0; i < 7; i++) { c.fillStyle = i % 2 ? '#fff' : '#E2475C'; c.fillRect(GATE6.x0 + i * 14.3, WALL6_Y - 2, 14.3, 14); }
}
