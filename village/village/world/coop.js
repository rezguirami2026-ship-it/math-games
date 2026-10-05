// «سوق الجمعية»: منطقة وحدة العدد (الفصل الثاني) جنوب ساحة المهرجان، تُفتح بإنهاء وحدة البيانات
import { rr, shade } from '../core/util.js';
export const WALL5_Y = 3500, GATE5 = { x0: 1190, x1: 1290 };
// صفّان من الأكشاك: لكل درس كشك بلافتة ولون
export const ST7 = {
  vault: { x: 360, y: 3730, sign: 'خزينة الجمعية', col: '#5E6B78' }, roman: { x: 640, y: 3730, sign: 'لوح الرومان', col: '#8E3B5E' },
  grocery: { x: 920, y: 3730, sign: 'بقالة سعود', col: '#2E8B57' }, fish: { x: 1200, y: 3730, sign: 'سوق السمك', col: '#2F6FB2' },
  pairs: { x: 1480, y: 3730, sign: 'لعبة العشرات', col: '#C98A3A' }, machine: { x: 1760, y: 3730, sign: 'آلة الأقواس', col: '#7B3F98' },
  cakes: { x: 360, y: 4090, sign: 'كعك لطيفة', col: '#E85D75' }, sale: { x: 640, y: 4090, sign: 'تخفيضات العيد', col: '#C0392B' },
  mix: { x: 920, y: 4090, sign: 'خلطات شمسة', col: '#E3B04B' }, choco: { x: 1200, y: 4090, sign: 'شوكولاتة ريا', col: '#6B4520' },
  barrels: { x: 1480, y: 4090, sign: 'براميل حميد', col: '#1F4E79' }
};
export function coopColliders(open) {
  const c = [{ x: 0, y: WALL5_Y, w: GATE5.x0, h: 12 }, { x: GATE5.x1, y: WALL5_Y, w: 2930 - GATE5.x1, h: 12 }];
  Object.values(ST7).forEach(s => c.push({ x: s.x - 52, y: s.y - 56, w: 104, h: 24 }));
  if (!open) c.push({ x: GATE5.x0, y: WALL5_Y - 4, w: GATE5.x1 - GATE5.x0, h: 20 });
  return c;
}
export function drawCoopGround(ctx) {
  ctx.fillStyle = '#EBD9AE'; ctx.fillRect(0, WALL5_Y, 2930, 1000);
  ctx.fillStyle = '#E0CB98'; for (let x = 0; x < 2930; x += 80) for (let y = WALL5_Y + 20; y < 4500; y += 80) if ((x / 80 + y / 80) % 2 < 1) ctx.fillRect(x, y, 80, 80);
  ctx.fillStyle = '#C9B48E'; rr(ctx, GATE5.x0 - 30, WALL5_Y + 12, GATE5.x1 - GATE5.x0 + 60, 60, 8); ctx.fill();
}
export function coopDrawables(open) {
  const out = [{ y: WALL5_Y + 12, draw: c => wall(c, open) }];
  Object.values(ST7).forEach(s => out.push({ y: s.y - 32, draw: c => stall(c, s) }));
  return out;
}
function stall(c, s) {
  const x = s.x, y = s.y - 32;
  c.fillStyle = 'rgba(60,35,10,.18)'; c.fillRect(x - 54, y, 108, 8);
  c.fillStyle = '#9B6B3D'; c.fillRect(x - 50, y - 70, 6, 70); c.fillRect(x + 44, y - 70, 6, 70);
  for (let k = 0; k < 6; k++) { c.fillStyle = k % 2 ? '#F4E3B8' : s.col; c.fillRect(x - 56 + k * 18.7, y - 86, 18.7, 18); }
  c.fillStyle = shade(s.col, -20); c.fillRect(x - 56, y - 70, 112, 4);
  c.fillStyle = '#B07A3B'; rr(c, x - 50, y - 24, 100, 24, 3); c.fill();
  c.fillStyle = '#FFFDF6'; rr(c, x - 50, y - 116, 100, 24, 6); c.fill(); c.fillStyle = '#5B4636'; c.font = '900 12px Cairo, sans-serif'; c.textAlign = 'center'; c.fillText(s.sign, x, y - 99);
}
function wall(c, open) {
  c.fillStyle = '#C9B48E';
  [[0, GATE5.x0], [GATE5.x1, 2930]].forEach(([a, b]) => { c.fillRect(a, WALL5_Y, b - a, 12); for (let x = a; x < b; x += 18) c.fillRect(x, WALL5_Y - 4, 8, 18); });
  c.fillStyle = '#B79F74'; c.fillRect(GATE5.x0 - 20, WALL5_Y - 30, 24, 44); c.fillRect(GATE5.x1 - 4, WALL5_Y - 30, 24, 44);
  c.fillStyle = '#FFFDF6'; rr(c, (GATE5.x0 + GATE5.x1) / 2 - 64, WALL5_Y - 64, 128, 26, 7); c.fill();
  c.fillStyle = '#5B4636'; c.font = '900 14px Cairo, sans-serif'; c.textAlign = 'center'; c.fillText(open ? 'سوق الجمعية ↓' : 'سوق الجمعية 🔒', (GATE5.x0 + GATE5.x1) / 2, WALL5_Y - 46);
  if (!open) for (let i = 0; i < 7; i++) { c.fillStyle = i % 2 ? '#fff' : '#E2475C'; c.fillRect(GATE5.x0 + i * 14.3, WALL5_Y - 2, 14.3, 14); }
}
