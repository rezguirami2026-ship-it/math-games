// «السوق الأسبوعي»: منطقة الوحدة الثانية (القياس) شرق القرية، تُفتح بوابتها بعد إنهاء الوحدة الأولى
// الرسم بأسلوب القرية نفسه (world/art.js): مبنى مجسّم، ملعب بعشب، محطة حافلات بمظلة، ساحة مرصوفة، وأرض حظيرة
import { rr, shade } from '../core/util.js';
import { INK, PAL, SUN, boxShadow, blobShadow, signboard, pattern, sprite, building3d, leanAt, palmCached, shrub, gateNS, gateNSShadows, stall } from './art.js';
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
const H_CARP = 90, CANOPY_H = 70;
const PALMS_M = [{ x: 1560, y: 470 }, { x: 2280, y: 110 }, { x: 1575, y: 1090 }, { x: 2285, y: 905 }, { x: 1830, y: 1120 }];
const FLOOD = [[FIELD.x - 10, FIELD.y - 4], [FIELD.x + FIELD.w + 10, FIELD.y - 4], [FIELD.x - 10, FIELD.y + FIELD.h + 8], [FIELD.x + FIELD.w + 10, FIELD.y + FIELD.h + 8]];

/* ── الأرضيات (من ذاكرة الصور): الملعب، موقف الحافلات، الساحة، وأرض الحظيرة ── */
export function drawMarketGround(ctx) {
  marketShadows(ctx);
  const F = FIELD;
  sprite(ctx, 'mk-field', F.x - 14, F.y - 14, F.w + 28, F.h + 28, c => {
    c.fillStyle = shade(PAL.stone, 6); rr(c, F.x - 10, F.y - 10, F.w + 20, F.h + 20, 12); c.fill();   // حافة حجرية
    c.fillStyle = 'rgba(70,40,15,.25)'; rr(c, F.x - 10, F.y + F.h + 4, F.w + 20, 6, 3); c.fill();
    c.fillStyle = pattern(c, 'grass'); rr(c, F.x, F.y, F.w, F.h, 8); c.fill();
    c.save(); rr(c, F.x, F.y, F.w, F.h, 8); c.clip();
    for (let i = 0; i < 8; i++) if (i % 2) { c.fillStyle = 'rgba(255,255,255,.07)'; c.fillRect(F.x + i * F.w / 8, F.y, F.w / 8, F.h); }   // خطوط القصّ
    const g = c.createLinearGradient(F.x, F.y, F.x + F.w, F.y + F.h); g.addColorStop(0, 'rgba(255,240,180,.12)'); g.addColorStop(1, 'rgba(20,40,10,.14)'); c.fillStyle = g; c.fillRect(F.x, F.y, F.w, F.h);
    c.restore();
    c.strokeStyle = INK; c.lineWidth = 1; rr(c, F.x - 10, F.y - 10, F.w + 20, F.h + 20, 12); c.stroke();
  });
  // موقف الحافلات: إسفلت بخطوط المواقف وحروفها مرسومة على الأرض، ورصيف المحطة المرتفع
  sprite(ctx, 'mk-station', STATION.x - 30, STATION.y - 8, STATION.w + 70, 210, c => {
    c.fillStyle = pattern(c, 'asphalt'); rr(c, STATION.x - 20, STATION.y + 52, STATION.w + 40, 140, 10); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 2;
    BAYS.forEach(b => { c.strokeRect(b.x - 48, b.y - 24, 96, 82); c.fillStyle = 'rgba(255,215,90,.85)'; c.font = '900 22px Cairo, sans-serif'; c.textAlign = 'center'; c.fillText(b.id, b.x, b.y + 46); });
    c.fillStyle = PAL.curb; c.fillRect(STATION.x - 6, STATION.y, STATION.w + 12, 44); c.fillStyle = pattern(c, 'pavers'); c.fillRect(STATION.x - 6, STATION.y, STATION.w + 12, 40);
    c.fillStyle = shade(PAL.curb, -30); c.fillRect(STATION.x - 6, STATION.y + 40, STATION.w + 12, 7); c.fillStyle = '#E2B04B'; c.fillRect(STATION.x - 6, STATION.y + 36, STATION.w + 12, 3);   // حافة الرصيف وخط التحذير
    c.strokeStyle = INK; c.lineWidth = 1; c.strokeRect(STATION.x - 6, STATION.y, STATION.w + 12, 47);
  });
  const S = SQUARE;
  sprite(ctx, 'mk-square', S.x - 8, S.y - 8, S.w + 16, S.h + 16, c => {
    c.fillStyle = shade(PAL.stone, -16); rr(c, S.x - 4, S.y - 2, S.w + 8, S.h + 8, 16); c.fill();
    c.fillStyle = pattern(c, 'pavers'); rr(c, S.x, S.y, S.w, S.h, 14); c.fill();
    const cx = S.x + S.w / 2, cy = S.y + S.h / 2 - 10;   // نجمة ثمانية مرصوفة في الوسط
    c.fillStyle = 'rgba(184,97,62,.55)'; c.beginPath(); for (let k = 0; k < 16; k++) { const r = k % 2 ? 22 : 40, a = k * Math.PI / 8; c.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r * .62); } c.closePath(); c.fill();
    c.strokeStyle = 'rgba(80,50,20,.4)'; c.lineWidth = 1.2; c.stroke();
    c.strokeStyle = INK; c.lineWidth = 1; rr(c, S.x, S.y, S.w, S.h, 14); c.stroke();
  });
  const P = PEN, W2 = P.cell * P.n;
  sprite(ctx, 'mk-pen', P.x - 14, P.y - 14, W2 + 28, W2 + 50, c => {
    c.fillStyle = shade('#B38B5E', -10); rr(c, P.x - 10, P.y - 10, W2 + 20, W2 + 20, 10); c.fill();
    c.fillStyle = pattern(c, 'soil'); rr(c, P.x - 6, P.y - 6, W2 + 12, W2 + 12, 8); c.fill();
    c.fillStyle = 'rgba(230,200,150,.35)'; c.fillRect(P.x, P.y, W2, W2);
    c.strokeStyle = 'rgba(70,45,25,.35)'; c.lineWidth = 1;   // شبكة الأمتار: جزء من رياضيات الدرس
    for (let i = 0; i <= P.n; i++) { c.beginPath(); c.moveTo(P.x + i * P.cell, P.y); c.lineTo(P.x + i * P.cell, P.y + W2); c.moveTo(P.x, P.y + i * P.cell); c.lineTo(P.x + W2, P.y + i * P.cell); c.stroke(); }
    [[P.x - 8, P.y - 8], [P.x + W2 + 4, P.y - 8], [P.x - 8, P.y + W2 + 4], [P.x + W2 + 4, P.y + W2 + 4]].forEach(([x, y]) => { c.fillStyle = PAL.wood; c.fillRect(x, y, 5, 5); });
    signboard(c, P.x + W2 / 2, P.y + W2 + 26, 'أرض الحظيرة — كل مربع ١ م');
  });
  FLOOD.forEach(([x, y]) => { ctx.strokeStyle = SUN.color; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + SUN.dx * 110, y + SUN.dy * 110); ctx.stroke(); });
  PALMS_M.forEach(p => blobShadow(ctx, p.x, p.y, 26, 80));
  boxShadow(ctx, STATION.x, STATION.y - 4, STATION.w, 30, CANOPY_H);
  boxShadow(ctx, CARP.x, CARP.y, CARP.w, CARP.h, H_CARP);
}

/* ── المباني والأشياء القائمة (لها عمق؛ ما له x يميل مع منظور الكاميرا) ── */
export function marketDrawables(open, t) {
  const out = [];
  out.push({ y: 700, draw: c => drawWall(c, open) });
  out.push({ y: CARP.y + CARP.h, draw: c => building3d(c, 'carp', { x: CARP.x, y: CARP.y, w: CARP.w, h: CARP.h, H: H_CARP, wall: '#E6D3B0', door: '#6E4524', sign: 'ورشة النجار مبارك', tank: 1, doorW: 46, doorH: 66 }) });
  out.push({ y: BENCH.y, x: BENCH.x, draw: c => workbench(c, BENCH.x, BENCH.y) });
  out.push({ y: BOARD.y, x: BOARD.x, draw: c => chalkboard(c, BOARD.x, BOARD.y) });
  FLOOD.forEach(([x, y]) => out.push({ y, x, draw: c => floodlight(c, x, y) }));
  out.push({ y: STATION.y + 30, draw: c => canopy(c) });
  BAYS.forEach(b => out.push({ y: b.y - 30, x: b.x - 52, draw: c => bayPost(c, b) }));
  out.push({ y: TIMETABLE.y, x: TIMETABLE.x, draw: c => timetable(c, TIMETABLE.x, TIMETABLE.y) });
  out.push({ y: CAL.y, x: CAL.x, draw: c => calendarBoard(c, CAL.x, CAL.y) });
  [[SQUARE.x + 50, '#2F6B73'], [SQUARE.x + 220, '#B8613E']].forEach(([x, col]) => out.push({ y: SQUARE.y + 174, x, draw: c => stall(c, x, SQUARE.y + 174, col) }));
  PALMS_M.forEach(p => out.push({ y: p.y, draw: c => palmCached(c, p.x, p.y, 1, false, t) }));
  [[1600, 470, '#D9478C'], [2270, 470, null], [1990, 1185, '#E8A33D']].forEach(([x, y, f]) => out.push({ y, x, draw: c => shrub(c, x, y, 9, f) }));
  return out;
}
function workbench(c, x, y) {   // طاولة نجار: سطح خشبي سميك، أرجل، منجلة، منشار، ونشارة على الأرض
  c.fillStyle = 'rgba(220,190,140,.8)'; c.beginPath(); c.ellipse(x + 6, y + 4, 40, 8, 0, 0, 7); c.fill();
  c.fillStyle = PAL.wood; [[-30, 0], [26, 0]].forEach(([dx]) => c.fillRect(x + dx, y - 20, 5, 20));
  c.fillStyle = PAL.woodLight; c.fillRect(x - 36, y - 34, 72, 12); c.fillStyle = shade(PAL.woodLight, -22); c.fillRect(x - 36, y - 22, 72, 6);
  c.strokeStyle = 'rgba(60,35,15,.3)'; c.lineWidth = .8; for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(x - 36, y - 34 + k * 3); c.lineTo(x + 36, y - 34 + k * 3); c.stroke(); }
  c.strokeStyle = INK; c.lineWidth = 1; c.strokeRect(x - 36, y - 34, 72, 18);
  c.fillStyle = '#5E6874'; c.fillRect(x - 34, y - 40, 10, 8);   // منجلة
  c.fillStyle = '#D9A066'; c.fillRect(x - 14, y - 38, 40, 4);   // لوح يُقطع
  c.fillStyle = '#A9B4BF'; c.beginPath(); c.moveTo(x + 6, y - 50); c.lineTo(x + 24, y - 40); c.lineTo(x + 20, y - 38); c.lineTo(x + 2, y - 48); c.closePath(); c.fill();   // منشار
  c.fillStyle = PAL.wood; c.fillRect(x + 1, y - 52, 6, 5);
}
function chalkboard(c, x, y) {   // سبورة المدرب على حامل ثلاثي
  c.strokeStyle = PAL.wood; c.lineWidth = 3; c.beginPath(); c.moveTo(x - 18, y); c.lineTo(x - 8, y - 66); c.moveTo(x + 18, y); c.lineTo(x + 8, y - 66); c.moveTo(x, y - 4); c.lineTo(x, y - 60); c.stroke();
  c.fillStyle = PAL.woodLight; rr(c, x - 28, y - 66, 56, 36, 3); c.fill();
  c.fillStyle = '#2F4F3F'; c.fillRect(x - 25, y - 63, 50, 30);
  c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 1.3; c.beginPath(); c.moveTo(x - 18, y - 46); c.lineTo(x + 16, y - 50); c.moveTo(x - 18, y - 40); c.lineTo(x + 6, y - 42); c.stroke();
  c.strokeStyle = INK; c.lineWidth = 1; c.strokeRect(x - 28, y - 66, 56, 36);
}
function floodlight(c, x, y) {   // عمود إضاءة الملعب
  c.fillStyle = '#4B4747'; c.fillRect(x - 2, y - 100, 4, 100); c.fillStyle = 'rgba(255,255,255,.2)'; c.fillRect(x - 2, y - 100, 1.4, 100);
  c.fillStyle = '#2E2B2B'; rr(c, x - 12, y - 112, 24, 14, 3); c.fill();
  c.fillStyle = '#FFF3C8'; for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(x - 7 + k * 7, y - 105, 2.6, 0, 7); c.fill(); }
}
function canopy(c) {   // مظلة المحطة: أعمدة وسقف مجسّم يميل مع الكاميرا، ومقعد تحتها
  const S = STATION, H = CANOPY_H, { lx, ly } = leanAt(S.x + S.w / 2, S.y + 30), dx = lx * H, hE = H * (1 - ly);
  c.fillStyle = PAL.wood; c.fillRect(S.x + 40, S.y + 18, 70, 5); c.fillRect(S.x + S.w - 120, S.y + 18, 70, 5);   // مقاعد
  c.fillStyle = '#3D3A3A'; [S.x + 44, S.x + 104, S.x + S.w - 116, S.x + S.w - 56].forEach(px => c.fillRect(px, S.y + 22, 3, 8));
  [S.x + 10, S.x + S.w / 2, S.x + S.w - 10].forEach(px => { c.strokeStyle = '#55595F'; c.lineWidth = 4; c.beginPath(); c.moveTo(px, S.y + 30); c.lineTo(px + dx, S.y + 30 - hE); c.stroke(); });
  c.save(); c.translate(dx, -hE);
  c.fillStyle = '#D9D4C8'; c.fillRect(S.x - 10, S.y - 14, S.w + 20, 40); c.fillStyle = 'rgba(0,0,0,.08)'; for (let k = 0; k < 9; k++) c.fillRect(S.x - 10 + k * (S.w + 20) / 9, S.y - 14, 2, 40);
  c.fillStyle = PAL.teal; c.fillRect(S.x - 10, S.y + 26, S.w + 20, 12);
  c.strokeStyle = INK; c.lineWidth = 1; c.strokeRect(S.x - 10, S.y - 14, S.w + 20, 52);
  signboard(c, S.x + S.w / 2, S.y + 32, 'محطة الحافلات');
  c.restore();
}
function bayPost(c, b) {   // عمود إشارة الرصيف بحرفه
  c.fillStyle = '#55595F'; c.fillRect(b.x - 53, b.y - 70, 3, 44);
  c.fillStyle = '#FFC23D'; rr(c, b.x - 62, b.y - 92, 22, 22, 5); c.fill(); c.strokeStyle = INK; c.lineWidth = 1; c.stroke();
  c.fillStyle = '#3A2400'; c.font = '900 14px Cairo, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(b.id, b.x - 51, b.y - 80); c.textBaseline = 'alphabetic';
}
function timetable(c, x, y) {   // لوحة مواعيد رقمية بإطار وعمودين
  c.fillStyle = '#4B4747'; c.fillRect(x - 26, y - 30, 4, 30); c.fillRect(x + 22, y - 30, 4, 30);
  c.fillStyle = '#2A2D35'; rr(c, x - 36, y - 76, 72, 50, 5); c.fill(); c.fillStyle = '#12151B'; c.fillRect(x - 31, y - 70, 62, 38);
  c.fillStyle = '#FFB938'; for (let i = 0; i < 3; i++) { c.fillRect(x - 26, y - 64 + i * 11, 22, 4); c.fillRect(x + 2, y - 64 + i * 11, 22, 4); }
  c.strokeStyle = INK; c.lineWidth = 1; rr(c, x - 36, y - 76, 72, 50, 5); c.stroke();
}
function calendarBoard(c, x, y) {   // لوحة إعلانات خشبية بسقف صغير (المسامير يرسمها الدرس فوقها)
  c.fillStyle = PAL.wood; c.fillRect(x - 42, y - 30, 5, 30); c.fillRect(x + 37, y - 30, 5, 30);
  c.fillStyle = shade(PAL.wood, -10); c.beginPath(); c.moveTo(x - 56, y - 92); c.lineTo(x, y - 106); c.lineTo(x + 56, y - 92); c.closePath(); c.fill(); c.strokeStyle = INK; c.lineWidth = 1; c.stroke();
  c.fillStyle = PAL.woodLight; rr(c, x - 50, y - 94, 100, 68, 4); c.fill();
  c.fillStyle = '#F2E6C9'; c.fillRect(x - 45, y - 89, 90, 58);
  c.fillStyle = '#B8413A'; c.fillRect(x - 45, y - 89, 90, 13); c.fillStyle = '#fff'; c.font = '900 10px Cairo, sans-serif'; c.textAlign = 'center'; c.fillText('تقويم المهرجان', x, y - 79);
  c.fillStyle = '#D6C39A'; for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) c.fillRect(x - 40 + i * 17, y - 72 + j * 13, 13, 9);
  c.strokeStyle = INK; c.lineWidth = 1; rr(c, x - 50, y - 94, 100, 68, 4); c.stroke();
}
/* سور السوق وبوابته: المكوّن المشترك في art.js */
function drawWall(c, open) { gateNS(c, 'tower', GATE_X, open, 'السوق الأسبوعي'); }
export function marketShadows(ctx) { gateNSShadows(ctx, GATE_X); }
