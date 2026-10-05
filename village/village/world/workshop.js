// «ورشة البنّاء»: منطقة الوحدة الأخيرة (الهندسة) جنوب طريق القافلة، ومنصة التخرّج بعد الدروس الـ٦٩
import { rr, shade } from '../core/util.js';
export const WALL7_Y = 5500, GATE7 = { x0: 1190, x1: 1290 };
export const ST9 = {
  tiles: { x: 400, y: 5790, sign: 'بلاط حمود', col: '#2F6FB2' }, flag: { x: 820, y: 5790, sign: 'علم آمنة', col: '#C0392B' },
  protractor: { x: 1240, y: 5790, sign: 'منقلة محسن', col: '#E3B04B' }, crates: { x: 1660, y: 5790, sign: 'صناديق زينب', col: '#8B5A2B' },
  crystals: { x: 2080, y: 5790, sign: 'كريستال جابر', col: '#7B3F98' }
};
export const STAGE = { x: 1240, y: 6200 };
export function workshopColliders(open) {
  const c = [{ x: 0, y: WALL7_Y, w: GATE7.x0, h: 12 }, { x: GATE7.x1, y: WALL7_Y, w: 2930 - GATE7.x1, h: 12 }, { x: STAGE.x - 160, y: STAGE.y - 70, w: 320, h: 60 }];
  Object.values(ST9).forEach(s => c.push({ x: s.x - 52, y: s.y - 56, w: 104, h: 24 }));
  if (!open) c.push({ x: GATE7.x0, y: WALL7_Y - 4, w: GATE7.x1 - GATE7.x0, h: 20 });
  return c;
}
export function drawWorkshopGround(ctx) {
  ctx.fillStyle = '#E9DDBF'; ctx.fillRect(0, WALL7_Y, 2930, 1000);
  ctx.strokeStyle = 'rgba(120,95,60,.12)'; ctx.lineWidth = 1;
  for (let x = 0; x < 2930; x += 60) for (let y = WALL7_Y + 20; y < 6500; y += 60) { ctx.beginPath(); ctx.moveTo(x + 30, y); ctx.lineTo(x + 60, y + 30); ctx.lineTo(x + 30, y + 60); ctx.lineTo(x, y + 30); ctx.closePath(); ctx.stroke(); }   // بلاط مزخرف
  ctx.fillStyle = '#C9B48E'; rr(ctx, GATE7.x0 - 30, WALL7_Y + 12, GATE7.x1 - GATE7.x0 + 60, 60, 8); ctx.fill();
}
export function workshopDrawables(open, t, allDone) {
  const out = [{ y: WALL7_Y + 12, draw: c => wall(c, open) }];
  Object.values(ST9).forEach(s => out.push({ y: s.y - 32, draw: c => stall(c, s) }));
  out.push({ y: STAGE.y - 10, draw: c => stage(c, t, allDone) });
  return out;
}
function stage(c, t, allDone) {
  const x = STAGE.x, y = STAGE.y;
  c.fillStyle = 'rgba(60,35,10,.2)'; c.fillRect(x - 164, y - 8, 328, 12);
  c.fillStyle = '#8B5A2B'; c.fillRect(x - 160, y - 70, 320, 60); c.fillStyle = '#A9743F'; c.fillRect(x - 160, y - 70, 320, 10);
  c.fillStyle = '#7A4F2A'; c.fillRect(x - 150, y - 190, 8, 120); c.fillRect(x + 142, y - 190, 8, 120);
  c.fillStyle = allDone ? '#1FA05A' : '#5E6B78'; rr(c, x - 150, y - 196, 300, 40, 8); c.fill();
  c.fillStyle = '#fff'; c.font = '900 16px Cairo, sans-serif'; c.textAlign = 'center'; c.fillText(allDone ? '🎓 مبارك! أكملتَ الدروس الـ٦٩' : 'منصة التخرّج — تنتظر بطل الدروس كلها', x, y - 170);
  if (allDone) for (let i = 0; i < 24; i++) { const a = i * 2.39 + t, r = 30 + ((t * 40 + i * 13) % 90); c.fillStyle = ['#E85D75', '#FFC23D', '#1FC8B5', '#9C6BFF'][i % 4]; c.fillRect(x + Math.cos(a) * r * 1.6, y - 260 + Math.sin(a) * r * .6, 6, 6); }
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
  [[0, GATE7.x0], [GATE7.x1, 2930]].forEach(([a, b]) => { c.fillRect(a, WALL7_Y, b - a, 12); for (let x = a; x < b; x += 18) c.fillRect(x, WALL7_Y - 4, 8, 18); });
  c.fillStyle = '#B79F74'; c.fillRect(GATE7.x0 - 20, WALL7_Y - 30, 24, 44); c.fillRect(GATE7.x1 - 4, WALL7_Y - 30, 24, 44);
  c.fillStyle = '#FFFDF6'; rr(c, (GATE7.x0 + GATE7.x1) / 2 - 64, WALL7_Y - 64, 128, 26, 7); c.fill();
  c.fillStyle = '#5B4636'; c.font = '900 14px Cairo, sans-serif'; c.textAlign = 'center'; c.fillText(open ? 'ورشة البنّاء ↓' : 'ورشة البنّاء 🔒', (GATE7.x0 + GATE7.x1) / 2, WALL7_Y - 46);
  if (!open) for (let i = 0; i < 7; i++) { c.fillStyle = i % 2 ? '#fff' : '#E2475C'; c.fillRect(GATE7.x0 + i * 14.3, WALL7_Y - 2, 14.3, 14); }
}
