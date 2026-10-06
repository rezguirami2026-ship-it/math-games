// «القلعة»: منطقة الوحدة الرابعة (الأعداد ٢) جنوب القرية خلف سور، تُفتح بإنهاء الوحدة الثالثة
// الرسم بأسلوب القرية (world/art.js): سور ببوابة خشبية، خندق، جسر خشبي هو خط الأعداد، قلعة عُمانية بأبراج مستديرة، ومحطات الدروس
import { rr, shade } from '../core/util.js';
import { INK, PAL, SUN, pattern, sprite, boxShadow, blobShadow, building3d, box3d, stoneBox3d, palmCached, gateEW, gateEWShadows, stall, roundTower, stoneWell, leanAt, upright, solid } from './art.js';
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
    { x: ST4.conveyor.x - 110, y: ST4.conveyor.y - 50, w: 220, h: 26 }, { x: ST4.pack.x - 30, y: ST4.pack.y - 54, w: 60, h: 30 },
    ...PALMS_F.map(p => solid.trunk(p.x, p.y))
  ];
  if (!open) c.push({ x: GATE3.x0, y: WALL_Y - 4, w: GATE3.x1 - GATE3.x0, h: 20 });
  return c;
}
export const H_B = 86; const CAST = '#D2B47E', K_H = 96;
const PALMS_F = [{ x: 200, y: 1800 }, { x: 1680, y: 2120 }, { x: 2560, y: 2300 }, { x: 160, y: 2480 }, { x: 1250, y: 2500 }];

export function drawFortGround(ctx, t) {
  // أرض القلعة: تراب مدكوك أدكن قليلاً، وطريق مرصوف من البوابة
  ctx.fillStyle = 'rgba(160,120,70,.16)'; ctx.fillRect(0, WALL_Y, 2930, 2600 - WALL_Y);
  ctx.fillStyle = pattern(ctx, 'pavers'); ctx.fillRect(GATE3.x0 - 10, WALL_Y + 12, GATE3.x1 - GATE3.x0 + 20, 128); ctx.fillRect(GATE3.x0 - 10, 2160, 600, 44);
  gateEWShadows(ctx, WALL_Y, GATE3.x0, GATE3.x1);
  // الخندق: حافتان حجريتان (الشمالية يظهر وجهها) وماء بتدرج وتموجات
  sprite(ctx, 'moat', MOAT.x - 10, MOAT.y - 12, MOAT.w + 20, MOAT.h + 26, c => {
    c.fillStyle = PAL.stone; rr(c, MOAT.x - 6, MOAT.y - 6, MOAT.w + 12, MOAT.h + 12, 22); c.fill();
    const g = c.createLinearGradient(0, MOAT.y, 0, MOAT.y + MOAT.h); g.addColorStop(0, '#1E6E9E'); g.addColorStop(1, '#3FA0D0');
    c.fillStyle = g; rr(c, MOAT.x, MOAT.y, MOAT.w, MOAT.h, 18); c.fill();
    c.fillStyle = shade(PAL.stone, -34); c.fillRect(MOAT.x + 14, MOAT.y, MOAT.w - 28, 10);   // وجه الحافة الشمالية داخل الخندق
    c.strokeStyle = INK; c.lineWidth = 1; rr(c, MOAT.x - 6, MOAT.y - 6, MOAT.w + 12, MOAT.h + 12, 22); c.stroke();
  });
  ctx.fillStyle = 'rgba(255,255,255,.3)'; for (let i = 0; i < 16; i++) ctx.fillRect(MOAT.x + 30 + i * 75 + (t * 16 % 30), MOAT.y + 26 + (i % 2) * 14, 22, 2);
  // الجسر = خط الأعداد: ألواح خشبية بعارضتين وأعمدة درابزين بحبال
  sprite(ctx, 'bridge', BW.x0 - 30, BW.y - 30, BW.x1 - BW.x0 + 60, 60, c => {
    c.fillStyle = '#5E3B20'; c.fillRect(BW.x0 - 20, BW.y + 12, BW.x1 - BW.x0 + 40, 6);
    c.fillStyle = '#A9763F'; c.fillRect(BW.x0 - 20, BW.y - 14, BW.x1 - BW.x0 + 40, 28);
    c.strokeStyle = 'rgba(60,35,15,.45)'; c.lineWidth = 1; for (let x = BW.x0 - 20; x < BW.x1 + 20; x += 14) { c.beginPath(); c.moveTo(x, BW.y - 14); c.lineTo(x, BW.y + 14); c.stroke(); }
    c.fillStyle = 'rgba(255,240,200,.18)'; c.fillRect(BW.x0 - 20, BW.y - 14, BW.x1 - BW.x0 + 40, 3);
    c.strokeStyle = INK; c.strokeRect(BW.x0 - 20, BW.y - 14, BW.x1 - BW.x0 + 40, 32);
    for (let x = BW.x0 - 16; x <= BW.x1 + 16; x += 80) { c.fillStyle = '#6E4524'; c.fillRect(x - 2, BW.y - 24, 4, 12); c.fillRect(x - 2, BW.y + 12, 4, 6); }
    c.strokeStyle = '#B08350'; c.lineWidth = 1.4; c.beginPath(); for (let x = BW.x0 - 16; x < BW.x1 + 16; x += 80) { c.moveTo(x, BW.y - 22); c.quadraticCurveTo(x + 40, BW.y - 17, x + 80, BW.y - 22); } c.stroke();
  });
  boxShadow(ctx, CASTLE.x, CASTLE.y, CASTLE.w, CASTLE.h, K_H);
  Object.values(B4).forEach(b => boxShadow(ctx, b.x, b.y, b.w, b.h, H_B));
  [2380, 2480].forEach(x => boxShadow(ctx, x - 20, 1770, 40, 60, 74));
  PALMS_F.forEach(p => blobShadow(ctx, p.x, p.y, 26, 80));
}
export function fortDrawables(open, t) {
  const out = [{ y: WALL_Y + 12, draw: c => gateEW(c, 'fortgate', WALL_Y, GATE3.x0, GATE3.x1, open, 'القلعة') }];
  out.push({ y: CASTLE.y + CASTLE.h, draw: c => castle(c, t) });
  Object.entries(B4).forEach(([k, b]) => out.push({ y: b.y + b.h, draw: c => building3d(c, 'fort-' + k, Object.assign({}, b, { H: H_B, door: k === 'gold' ? '#7A4A2A' : k === 'kitchen' ? '#B8613E' : '#6E4524', tank: k === 'kitchen' || k === 'roof', ac: k === 'museum' })) }));
  out.push({ y: ST4.well.y - 16, x: ST4.well.x, draw: c => stoneWell(c, ST4.well.x, ST4.well.y - 20, 26, t) });
  [[2380, '#C0392B'], [2480, '#2F6FB2']].forEach(([x, col]) => out.push({ y: 1830, x, draw: c => bellTower(c, x, col, t) }));
  [[ST4.trip, '#2E8B57'], [ST4.change, '#7B3F98']].forEach(([s, col]) => out.push({ y: s.y - 22, x: s.x, draw: c => stall(c, s.x, s.y - 22, col) }));
  out.push({ y: ST4.conveyor.y - 24, x: ST4.conveyor.x, draw: c => conveyor(c, ST4.conveyor, t) });
  out.push({ y: ST4.pack.y - 24, x: ST4.pack.x, draw: c => packer(c, ST4.pack, t) });
  PALMS_F.forEach(p => out.push({ y: p.y, draw: c => palmCached(c, p.x, p.y, 1, false, t) }));
  return out;
}
/* القلعة العُمانية: أسوار بشُرَف وبوابة مقوّسة، فناء في الأعلى، برج رئيسي، وبرجان مستديران عند الركنين الأماميين */
function castle(c, t) {
  const K = CASTLE;
  box3d(c, 'castle', { x: K.x, y: K.y, w: K.w, h: K.h, H: K_H }, CAST, r => {
    const ry = K.y - K_H;
    r.fillStyle = shade(CAST, 10); r.fillRect(K.x, ry, K.w, K.h);
    r.fillStyle = '#D9C49A'; r.fillRect(K.x + 18, ry + 18, K.w - 36, K.h - 36);   // الفناء
    r.fillStyle = 'rgba(80,50,20,.18)'; r.fillRect(K.x + 18, ry + 18, K.w - 36, 10); r.fillRect(K.x + 18, ry + 18, 10, K.h - 36);
    r.fillStyle = pattern(r, 'pavers'); r.globalAlpha = .45; r.fillRect(K.x + 30, ry + 30, K.w - 60, K.h - 60); r.globalAlpha = 1;
    r.strokeStyle = INK; r.lineWidth = 1.2; r.strokeRect(K.x, ry, K.w, K.h); r.strokeRect(K.x + 18, ry + 18, K.w - 36, K.h - 36);
  }, f => {
    const yb = K.y + K.h, yt = yb - K_H;
    const g = f.createLinearGradient(K.x, 0, K.x + K.w, 0); g.addColorStop(0, shade(CAST, 4)); g.addColorStop(1, shade(CAST, -16));
    f.fillStyle = g; f.fillRect(K.x, yt, K.w, K_H);
    f.strokeStyle = 'rgba(80,55,30,.22)'; f.lineWidth = .8;
    for (let yy = yt + 10, r = 0; yy < yb; yy += 10, r++) { f.beginPath(); f.moveTo(K.x, yy); f.lineTo(K.x + K.w, yy); f.stroke(); for (let xx = K.x + (r % 2 ? 9 : 18); xx < K.x + K.w; xx += 18) { f.beginPath(); f.moveTo(xx, yy - 10); f.lineTo(xx, yy); f.stroke(); } }
    f.fillStyle = '#3B2E22'; for (let x = K.x + 70; x < K.x + K.w - 60; x += 70) if (Math.abs(x - (K.x + K.w / 2)) > 60) f.fillRect(x - 2, yt + 30, 4, 14);   // مزاغل
    // البوابة الكبرى المقوّسة بباب خشبي ومسامير
    const gx = K.x + K.w / 2, gw = 70, gh = 78;
    f.fillStyle = shade(CAST, -26); f.beginPath(); f.moveTo(gx - gw / 2 - 8, yb); f.lineTo(gx - gw / 2 - 8, yb - gh + gw / 2); f.arc(gx, yb - gh + gw / 2, gw / 2 + 8, Math.PI, 0); f.lineTo(gx + gw / 2 + 8, yb); f.closePath(); f.fill();
    const dg = f.createLinearGradient(gx - gw / 2, 0, gx + gw / 2, 0); dg.addColorStop(0, '#8E5A30'); dg.addColorStop(1, '#5E3B20');
    f.fillStyle = dg; f.beginPath(); f.moveTo(gx - gw / 2, yb); f.lineTo(gx - gw / 2, yb - gh + gw / 2); f.arc(gx, yb - gh + gw / 2, gw / 2, Math.PI, 0); f.lineTo(gx + gw / 2, yb); f.closePath(); f.fill();
    f.fillStyle = '#E3B04B'; for (let r = 0; r < 5; r++) for (let k = -2; k <= 2; k++) { f.beginPath(); f.arc(gx + k * 12, yb - 12 - r * 12, 1.6, 0, 7); f.fill(); }
    f.strokeStyle = 'rgba(30,15,5,.5)'; f.lineWidth = 1.2; f.beginPath(); f.moveTo(gx, yb - gh); f.lineTo(gx, yb); f.stroke();
    f.fillStyle = 'rgba(70,40,15,.16)'; f.fillRect(K.x, yb - 8, K.w, 8);
    f.strokeStyle = INK; f.lineWidth = 1.2; f.strokeRect(K.x, yt, K.w, K_H);
    for (let x = K.x; x < K.x + K.w; x += 22) { f.fillStyle = shade(CAST, 12); f.fillRect(x + 2, yt - 10, 14, 10); f.strokeStyle = INK; f.lineWidth = .6; f.strokeRect(x + 2, yt - 10, 14, 10); }
  }, 120);
  // البرج الرئيسي داخل الفناء: يرتفع من مستوى الأسوار، ومعه العَلَم
  const { lx, ly } = leanAt(K.x + K.w / 2, K.y + K.h);
  c.save(); c.translate(lx * K_H, -K_H * (1 - ly));
  stoneBox3d(c, 'keep', K.x + K.w / 2 - 60, K.y + 70, 120, 90, 70, shade(CAST, -4));
  const fx = K.x + K.w / 2, fy = K.y + 160 - 70 - 90;
  c.strokeStyle = '#4B4747'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(fx, fy + 40); c.lineTo(fx, fy - 30); c.stroke();
  c.fillStyle = '#C0392B'; c.beginPath(); c.moveTo(fx + 1, fy - 30); c.quadraticCurveTo(fx + 20, fy - 26 + Math.sin(t * 3) * 3, fx + 38 + Math.sin(t * 3) * 3, fy - 22); c.quadraticCurveTo(fx + 20, fy - 16 + Math.sin(t * 3 + 1) * 3, fx + 1, fy - 12); c.fill();
  c.fillStyle = '#fff'; c.fillRect(fx + 1, fy - 30, 10, 18); c.fillStyle = '#2E8B57'; c.fillRect(fx + 11, fy - 16, 26, 4);
  c.restore();
  // البرجان المستديران عند الركنين الأماميين (يميلان مع الكاميرا)
  [K.x + 10, K.x + K.w - 10].forEach(x => upright(c, x, K.y + K.h + 10, cc => roundTower(cc, x, K.y + K.h + 10, 44, 130, CAST)));
}
function bellTower(c, x, col, t) {   // برج جرس صغير: عمودان وقوس وسقف بلون الفريق، وجرس يتأرجح
  c.fillStyle = shade(CAST, -6); c.fillRect(x - 20, 1770, 8, 60); c.fillRect(x + 12, 1770, 8, 60); c.fillStyle = shade(CAST, 8); c.fillRect(x - 22, 1762, 44, 10); c.fillRect(x - 22, 1822, 44, 8);
  c.strokeStyle = INK; c.lineWidth = 1; c.strokeRect(x - 22, 1762, 44, 68);
  c.fillStyle = col; c.beginPath(); c.moveTo(x - 26, 1762); c.lineTo(x, 1736); c.lineTo(x + 26, 1762); c.closePath(); c.fill(); c.stroke();
  c.save(); c.translate(x, 1774); c.rotate(Math.sin(t * 2.4) * .12);
  c.strokeStyle = '#5E3B20'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 6); c.stroke();
  c.fillStyle = '#E3B04B'; c.beginPath(); c.moveTo(-9, 22); c.quadraticCurveTo(-9, 6, 0, 6); c.quadraticCurveTo(9, 6, 9, 22); c.closePath(); c.fill(); c.strokeStyle = '#8A5A00'; c.stroke();
  c.fillStyle = '#8A5A00'; c.beginPath(); c.arc(0, 23, 2.4, 0, 7); c.fill();
  c.restore();
}
function conveyor(c, s, t) {   // سير ناقل: إطار معدني على أرجل، حزام داكن بأسطوانات تدور
  c.fillStyle = '#4B4F57'; [s.x - 100, s.x - 30, s.x + 40, s.x + 96].forEach(x => c.fillRect(x, s.y - 30, 5, 30));
  c.fillStyle = '#7E8996'; rr(c, s.x - 112, s.y - 52, 224, 14, 4); c.fill();
  c.fillStyle = '#2E333B'; c.fillRect(s.x - 108, s.y - 50, 216, 10);
  c.fillStyle = '#4E5560'; for (let i = 0; i < 11; i++) c.fillRect(s.x - 104 + ((i * 20 + t * 30) % 210), s.y - 49, 3, 8);
  c.fillStyle = '#9AA5B1'; c.fillRect(s.x - 112, s.y - 38, 224, 6); c.strokeStyle = INK; c.lineWidth = 1; c.strokeRect(s.x - 112, s.y - 52, 224, 20);
  [s.x - 112, s.x + 112].forEach(x => { c.fillStyle = '#5E6874'; c.beginPath(); c.arc(x, s.y - 45, 8, 0, 7); c.fill(); c.stroke(); });
}
function packer(c, s, t) {   // آلة التعبئة: صندوق معدني بنافذة ومؤشر وضوء
  c.fillStyle = 'rgba(70,42,20,.2)'; c.fillRect(s.x - 26, s.y - 24, 66, 6);
  c.fillStyle = '#C98A3A'; c.fillRect(s.x - 30, s.y - 76, 60, 10); c.fillStyle = '#B07430'; c.fillRect(s.x - 30, s.y - 66, 60, 42);
  c.fillStyle = '#FFE7A0'; rr(c, s.x - 20, s.y - 60, 40, 14, 3); c.fill(); c.fillStyle = '#3A2400'; c.fillRect(s.x - 16, s.y - 55, 32, 3);
  c.fillStyle = '#5E6874'; c.beginPath(); c.arc(s.x - 12, s.y - 34, 6, 0, 7); c.fill(); c.fillStyle = (t * 2 % 1) < .5 ? '#3BE07A' : '#1F7A44'; c.beginPath(); c.arc(s.x + 14, s.y - 34, 4, 0, 7); c.fill();
  c.strokeStyle = INK; c.lineWidth = 1; c.strokeRect(s.x - 30, s.y - 76, 60, 52);
}
