// «سوق الجمعية»: منطقة وحدة العدد (الفصل الثاني) جنوب ساحة المهرجان، تُفتح بإنهاء وحدة البيانات
// الرسم بأسلوب القرية: سوق مبلّط بصفّين من الأكشاك المجسّمة، وحبال فوانيس بين الصفّين
import { rr, shade } from '../core/util.js';
import { INK, PAL, pattern, kiosk3d, kioskShadow, gateEW, gateEWShadows, palmCached, blobShadow, lanternString, elev, bench, shrub, stoneWell, solid } from './art.js';
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
  c.push(...PALMS.map(p => solid.trunk(p.x, p.y)), ...BENCHES.map(([x, y]) => solid.bench(x, y)), ...SHRUBS.map(([x, y]) => solid.shrub(x, y)), solid.well(WELL.x, WELL.y, 22),
    ...LANTERNS.flatMap(([a, b, y]) => [solid.post(a, y), solid.post(b, y)]));
  if (!open) c.push({ x: GATE5.x0, y: WALL5_Y - 4, w: GATE5.x1 - GATE5.x0, h: 20 });
  return c;
}
// بضاعة كل كشك (ألوان على الرفوف)
const GOODS = {
  vault: ['#E3B04B', '#C9A227', '#A9B4BF'], roman: ['#8E3B5E', '#F2E6C9', '#5E6B78'], grocery: ['#C46A1E', '#4E7A34', '#E3B04B', '#B8413A'],
  fish: ['#7CA6C8', '#A9B4BF', '#5E86A8'], pairs: ['#E85D75', '#FFC23D', '#1FC8B5', '#9C6BFF'], machine: ['#7B3F98', '#E3B04B', '#2F6FB2'],
  cakes: ['#F2C6D0', '#E85D75', '#F4E3B8'], sale: ['#C0392B', '#FFC23D', '#2F6FB2', '#2E8B57'], mix: ['#E3B04B', '#C46A1E', '#8B5A2B'],
  choco: ['#6B4520', '#8B5A2B', '#3E2414'], barrels: ['#1F4E79', '#5E86A8', '#8B5A2B']
};
const FLOOR = { x: 250, y: 3610, w: 1620, h: 560 };
const PALMS = [{ x: 2050, y: 3700 }, { x: 2250, y: 3900 }, { x: 2100, y: 4150 }, { x: 2550, y: 3720 }, { x: 2650, y: 4100 }, { x: 140, y: 3900 }, { x: 2400, y: 4380 }, { x: 700, y: 4400 }];
const LANTERNS = [[300, 1000, 3880], [1000, 1820, 3880]];
const WELL = { x: 2380, y: 4040 };
const BENCHES = [[1990, 3800], [1990, 4000], [600, 4250], [1400, 4250]];
const SHRUBS = [[230, 3640], [1890, 3640], [230, 4180], [1890, 4180]];
export function drawCoopGround(ctx) {
  gateEWShadows(ctx, WALL5_Y, GATE5.x0, GATE5.x1);
  const F = FLOOR;   // أرض السوق: بلاط بحافة حجرية وممر أوسط أفتح
  ctx.fillStyle = shade(PAL.stone, -16); rr(ctx, F.x - 6, F.y - 2, F.w + 12, F.h + 10, 16); ctx.fill();
  ctx.fillStyle = pattern(ctx, 'pavers'); rr(ctx, F.x, F.y - 6, F.w, F.h + 6, 14); ctx.fill();
  ctx.fillStyle = 'rgba(255,245,220,.22)'; ctx.fillRect(F.x, 3820, F.w, 120);
  ctx.strokeStyle = INK; ctx.lineWidth = 1; rr(ctx, F.x, F.y - 6, F.w, F.h + 6, 14); ctx.stroke();
  ctx.fillStyle = pattern(ctx, 'pavers'); ctx.fillRect(GATE5.x0 - 10, WALL5_Y + 12, GATE5.x1 - GATE5.x0 + 20, F.y - WALL5_Y - 12);   // ممر البوابة
  Object.values(ST7).forEach(s => kioskShadow(ctx, s));
  PALMS.forEach(p => blobShadow(ctx, p.x, p.y, 22, 70));
  LANTERNS.forEach(([a, b, y]) => [a, b].forEach(x => blobShadow(ctx, x, y, 5, 80)));
}
export function coopDrawables(open, t) {
  const out = [{ y: WALL5_Y + 12, draw: c => gateEW(c, 'coopgate', WALL5_Y, GATE5.x0, GATE5.x1, open, 'سوق الجمعية') }];
  Object.entries(ST7).forEach(([k, s]) => out.push({ y: s.y - 32, draw: c => kiosk3d(c, k, s, GOODS[k]) }));
  PALMS.forEach(p => out.push({ y: p.y, draw: c => palmCached(c, p.x, p.y, 1, false, t) }));
  LANTERNS.forEach(([a, b, y]) => [a, b].forEach(x => out.push({ y, x, draw: c => { c.fillStyle = PAL.wood; c.fillRect(x - 2, y - 80, 4, 80); c.strokeStyle = INK; c.lineWidth = .7; c.strokeRect(x - 2, y - 80, 4, 80); } })));
  BENCHES.forEach(([x, y]) => out.push({ y, draw: c => bench(c, x, y) }));
  SHRUBS.forEach(([x, y]) => out.push({ y, draw: c => shrub(c, x, y, 14, true) }));
  out.push({ y: WELL.y, x: WELL.x, draw: c => stoneWell(c, WELL.x, WELL.y, 22, t) });
  LANTERNS.forEach(([a, b, y]) => out.push({ y: y + 40, draw: c => lanternString(c, elev(a, y, 80), elev(b, y, 80), 30, 14, t) }));   // معلّقة: تُرسم بعد ما تحتها
  return out;
}
