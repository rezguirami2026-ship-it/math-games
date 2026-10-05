// قرية الخير: تخطيط العالم ورسمه. المزرعة والنخيل تتغير حسب حالة العالم.
import { rng, shade, mix, rr, lerp, clamp } from '../core/util.js';

export const WORLD = { w: 1500, h: 1150 };
export const ROADS = [{ x: 0, y: 600, w: 1500, h: 80 }, { x: 700, y: 0, w: 70, h: 600 }];
export const HOUSES = [
  { x: 830, y: 150, w: 170, h: 120, wall: '#F1E3C6', door: '#8B5A2B' },
  { x: 1060, y: 110, w: 190, h: 140, wall: '#EED8B8', door: '#2F6FB2' },
  { x: 1300, y: 170, w: 150, h: 120, wall: '#F3E6CC', door: '#8B5A2B' },
  { x: 860, y: 330, w: 150, h: 110, wall: '#EFDDBF', door: '#3F8E5E' },
  { x: 1240, y: 340, w: 180, h: 120, wall: '#F1E1C2', door: '#8B5A2B' },
  { x: 110, y: 80, w: 200, h: 130, wall: '#EFDDBF', door: '#8B5A2B' },
  { x: 400, y: 110, w: 170, h: 120, wall: '#F3E6CC', door: '#2F6FB2' }
];
export const WAREHOUSE = { x: 110, y: 300, w: 300, h: 170 };
export const WELL = { x: 1110, y: 470, r: 24 };
export const PILE = { x: 262, y: 528 };
export const PARK = Array.from({ length: 6 }, (_, i) => ({ x: 150 + i * 92, y: 770 }));
export const SIGNAL = { x: 690, y: 770 };
export const FARM = { x: 880, y: 760, w: 570, h: 330 };
export const FARM_PARK = Array.from({ length: 6 }, (_, i) => ({ x: 930 + i * 86, y: 722 }));
export const TREE_SPOTS = [{ x: 860, y: 548 }, { x: 990, y: 552 }, { x: 1190, y: 548 }];
const PALMS = [{ x: 55, y: 560 }, { x: 610, y: 515 }, { x: 1470, y: 560 }, { x: 40, y: 1010 }, { x: 640, y: 1090 }, { x: 590, y: 300 }, { x: 640, y: 420 }, { x: 1470, y: 110 }];
const FARM_PALMS = [{ x: 905, y: 1080 }, { x: 1440, y: 1080 }, { x: 1440, y: 800 }, { x: 1170, y: 1085 }];

/* المصادمات: مستطيلات لا يعبرها البطل */
export function staticColliders() {
  const pad = 2;
  return [
    ...HOUSES.map(b => ({ x: b.x - pad, y: b.y + 10, w: b.w + pad * 2, h: b.h - 6 })),
    { x: WAREHOUSE.x, y: WAREHOUSE.y + 10, w: WAREHOUSE.w, h: WAREHOUSE.h - 6 },
    { x: WELL.x - WELL.r, y: WELL.y - WELL.r, w: WELL.r * 2, h: WELL.r * 2 },
    { x: SIGNAL.x - 5, y: SIGNAL.y - 6, w: 10, h: 10 }
  ];
}

/* ── الأرض والطرق (تُرسم أولاً) ── */
const R = rng(7), SPECKS = Array.from({ length: 520 }, () => ({ x: R() * WORLD.w, y: R() * WORLD.h, r: 1 + R() * 2.2, c: R() < .5 ? '#D9C08A' : '#F4E6C2' }));
export function drawGround(ctx, view) {
  ctx.fillStyle = '#EAD6A6'; ctx.fillRect(0, 0, WORLD.w, WORLD.h);
  SPECKS.forEach(s => { if (inView(view, s.x, s.y, 4)) { ctx.fillStyle = s.c; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill(); } });
  ROADS.forEach(r => {
    ctx.fillStyle = '#D8C49B'; ctx.fillRect(r.x - 6, r.y - 6, r.w + 12, r.h + 12);   // الرصيف
    ctx.fillStyle = '#5E6274'; ctx.fillRect(r.x, r.y, r.w, r.h);
  });
  ctx.fillStyle = '#F4F1E6';
  for (let x = 20; x < WORLD.w; x += 70) if (!(x > 690 && x < 780)) ctx.fillRect(x, 638, 36, 4);
  for (let y = 20; y < 600; y += 70) ctx.fillRect(733, y, 4, 36);
  // ساحة الانتظار أمام المستودع والشاحنات
  ctx.fillStyle = '#CDB88E'; rr(ctx, 110, 488, 300, 70, 10); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.05)'; rr(ctx, 100, 720, 590, 100, 12); ctx.fill();
  ctx.strokeStyle = '#ffffffaa'; ctx.lineWidth = 2;
  PARK.forEach(p => { ctx.strokeRect(p.x - 40, p.y - 34, 80, 56); });
}
export function inView(v, x, y, m) { return x > v.x - m && x < v.x + v.w + m && y > v.y - m && y < v.y + v.h + m; }

/* ── المزرعة والفلج: جافة ثم تخضرّ (g من ٠ إلى ١) ── */
export function drawFarm(ctx, g, t) {
  const F = FARM;
  ctx.fillStyle = mix('#D9B985', '#9CCB72', g); rr(ctx, F.x, F.y, F.w, F.h, 14); ctx.fill();
  const cols = 5, rows = 3, pw = (F.w - 60) / cols, phh = (F.h - 70) / rows;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = F.x + 30 + c * pw, y = F.y + 50 + r * phh;
    ctx.fillStyle = mix('#B98B5E', '#6FA84B', g); rr(ctx, x + 4, y + 4, pw - 8, phh - 8, 8); ctx.fill();
    if (g < 1) {   // تشققات الأرض العطشى
      ctx.strokeStyle = `rgba(110,70,35,${.5 * (1 - g)})`; ctx.lineWidth = 1.2; ctx.beginPath();
      ctx.moveTo(x + 14, y + 16); ctx.lineTo(x + 30, y + 26); ctx.lineTo(x + 26, y + 40);
      ctx.moveTo(x + pw - 20, y + 14); ctx.lineTo(x + pw - 34, y + 30); ctx.stroke();
    }
    if (g > 0) {   // محاصيل تنمو
      const k = clamp((g - (c + r) * .05) * 1.4, 0, 1);
      for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) {
        const px = x + 16 + j * (pw - 32) / 3, py = y + 18 + i * (phh - 32) / 2;
        ctx.fillStyle = '#2E7D32'; ctx.beginPath(); ctx.arc(px, py, 4.2 * k, 0, 7); ctx.fill();
        ctx.fillStyle = '#66BB6A'; ctx.beginPath(); ctx.arc(px - 1, py - 1.5, 2.6 * k, 0, 7); ctx.fill();
      }
    }
  }
  // الفلج: قناة الماء على حافة المزرعة
  const fy = F.y + 22;
  ctx.fillStyle = '#B39265'; rr(ctx, F.x + 20, fy - 7, F.w - 40, 14, 7); ctx.fill();
  if (g > 0) {
    const len = (F.w - 48) * clamp(g * 1.3, 0, 1);
    ctx.fillStyle = '#4FB3E8'; rr(ctx, F.x + F.w - 24 - len, fy - 4, len, 8, 4); ctx.fill();
    ctx.fillStyle = '#BFE7FB';
    for (let x = F.x + F.w - 30; x > F.x + F.w - 24 - len; x -= 26) ctx.fillRect(x - ((t * 40) % 26), fy - 1, 9, 2);
  }
  // سياج
  ctx.strokeStyle = '#8B6A43'; ctx.lineWidth = 2.5; ctx.strokeRect(F.x + 4, F.y + 4, F.w - 8, F.h - 8);
  ctx.fillStyle = '#5B4636'; ctx.font = '900 15px Cairo, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(g > .5 ? 'مزرعة القرية 🌾' : 'مزرعة القرية — عطشى', F.x + F.w / 2, F.y + F.h - 12);
}

/* ── النخلة: نفس الرسم للزينة وللنخيل التي يزرعها اللاعب ── */
export function drawPalm(ctx, x, y, sc, dry, t) {
  if (sc <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.fillStyle = 'rgba(60,35,10,.2)'; ctx.beginPath(); ctx.ellipse(0, 0, 16, 5, 0, 0, 7); ctx.fill();
  for (let i = 0; i < 7; i++) { ctx.fillStyle = i % 2 ? '#8D6238' : '#A0723F'; ctx.beginPath(); ctx.ellipse(Math.sin(i * .5) * 2, -i * 7 - 4, 5.2, 4.5, 0, 0, 7); ctx.fill(); }
  const sway = Math.sin((t || 0) * 1.3 + x) * .05;
  const leaves = dry ? ['#B59A5A', '#C9AE6E'] : ['#2E8B47', '#4CAF50'];
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI / 2 + (i - 3) * .52 + sway;
    ctx.strokeStyle = leaves[i % 2]; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, -50);
    ctx.quadraticCurveTo(Math.cos(a) * 18, -50 + Math.sin(a) * 18 - 6, Math.cos(a) * 30, -50 + Math.sin(a) * 26 + (dry ? 14 : 6));
    ctx.stroke();
  }
  if (!dry) { ctx.fillStyle = '#C46A1E'; ctx.beginPath(); ctx.arc(-3, -46, 2.6, 0, 7); ctx.arc(3, -45, 2.6, 0, 7); ctx.fill(); }
  ctx.restore();
}

/* ── عناصر لها عمق (تُرتّب مع الشخصيات حسب y) ── */
export function staticDrawables(state, t) {
  const out = [];
  HOUSES.forEach(b => out.push({ y: b.y + b.h, draw: c => drawHouse(c, b) }));
  out.push({ y: WAREHOUSE.y + WAREHOUSE.h, draw: c => drawWarehouse(c) });
  out.push({ y: WELL.y + WELL.r, draw: c => drawWell(c, state.world.delivered) });
  const green = state.world.delivered ? 1 : 0;
  PALMS.forEach(p => out.push({ y: p.y, draw: c => drawPalm(c, p.x, p.y, 1, false, t) }));
  FARM_PALMS.forEach(p => out.push({ y: p.y, draw: c => drawPalm(c, p.x, p.y, .95, !green, t) }));
  return out;
}
function drawHouse(ctx, b) {
  const fh = 34, ry = b.y, rh = b.h - fh;
  ctx.fillStyle = 'rgba(60,35,10,.16)'; ctx.fillRect(b.x + 6, b.y + b.h - 2, b.w, 8);
  ctx.fillStyle = shade(b.wall, -22); ctx.fillRect(b.x, ry + rh, b.w, fh);                    // الواجهة
  ctx.fillStyle = shade(b.wall, 14); ctx.fillRect(b.x, ry, b.w, rh);                          // السطح
  ctx.fillStyle = shade(b.wall, -6);
  for (let x = b.x; x < b.x + b.w - 8; x += 16) { ctx.beginPath(); ctx.moveTo(x, ry + rh); ctx.lineTo(x + 8, ry + rh - 7); ctx.lineTo(x + 16, ry + rh); ctx.fill(); }   // الشرفات
  ctx.fillStyle = b.door; rr(ctx, b.x + b.w / 2 - 9, ry + rh + 8, 18, fh - 8, 7); ctx.fill();
  ctx.fillStyle = '#6CA6C1';
  [b.x + 18, b.x + b.w - 34].forEach(x => { rr(ctx, x, ry + rh + 9, 16, 13, 6); ctx.fill(); });
}
function drawWarehouse(ctx) {
  const b = WAREHOUSE, fh = 46, rh = b.h - fh;
  ctx.fillStyle = 'rgba(60,35,10,.16)'; ctx.fillRect(b.x + 6, b.y + b.h - 2, b.w, 8);
  ctx.fillStyle = '#C9B48E'; ctx.fillRect(b.x, b.y + rh, b.w, fh);
  ctx.fillStyle = '#8FA0B5'; ctx.fillRect(b.x, b.y, b.w, rh);
  ctx.strokeStyle = '#7A8BA0'; ctx.lineWidth = 2;
  for (let x = b.x + 12; x < b.x + b.w; x += 18) { ctx.beginPath(); ctx.moveTo(x, b.y + 4); ctx.lineTo(x, b.y + rh - 4); ctx.stroke(); }
  ctx.fillStyle = '#6B7A90'; ctx.fillRect(b.x + 95, b.y + rh + 6, 110, fh - 6);
  ctx.strokeStyle = '#5A687D';
  for (let y = b.y + rh + 12; y < b.y + b.h; y += 7) { ctx.beginPath(); ctx.moveTo(b.x + 97, y); ctx.lineTo(b.x + 203, y); ctx.stroke(); }
  ctx.fillStyle = '#F4E3B8'; rr(ctx, b.x + 105, b.y + rh - 28, 90, 24, 6); ctx.fill();
  ctx.fillStyle = '#5B4636'; ctx.font = '900 14px Cairo, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('المستودع', b.x + 150, b.y + rh - 11);
}
function drawWell(ctx, full) {
  const w = WELL;
  ctx.fillStyle = '#A99878'; ctx.beginPath(); ctx.arc(w.x, w.y, w.r, 0, 7); ctx.fill();
  ctx.fillStyle = full ? '#3C8FCF' : '#5B4B35'; ctx.beginPath(); ctx.arc(w.x, w.y, w.r - 7, 0, 7); ctx.fill();
  ctx.strokeStyle = '#7B6A4E'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(w.x - w.r, w.y - 26); ctx.lineTo(w.x + w.r, w.y - 26); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(w.x - w.r + 3, w.y - 26); ctx.lineTo(w.x - w.r + 3, w.y); ctx.moveTo(w.x + w.r - 3, w.y - 26); ctx.lineTo(w.x + w.r - 3, w.y); ctx.stroke();
}
