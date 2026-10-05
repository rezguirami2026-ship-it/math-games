// قرية الخير: تخطيط العالم ورسمه. المزرعة والبئر والنخيل تتغير حسب حالة العالم.
// الرسم بأسلوب 2.5D مشترك (world/art.js): مبانٍ بجدران وأسطح، ظلال نحو الأسفل يميناً، أرصفة بحواف، وأنسجة مواد.
import { rng, shade, mix, rr, clamp } from '../core/util.js';
import { PAL, SUN, INK, pattern, sprite, boxShadow, blobShadow, building, palm, palmCached, shrub, streetLamp, bench, signboard } from './art.js';

export const WORLD = { w: 3200, h: 6500 };   // القرية في الشمال، ثم السوق والميناء شرقاً، والقلعة والمهرجان والجمعية والقافلة والورشة جنوباً
export const ROADS = [{ x: 0, y: 600, w: 2930, h: 80 }, { x: 700, y: 0, w: 70, h: 600 }];
export const HOUSES = [
  { x: 830, y: 150, w: 170, h: 120, wall: '#EFE3CC', door: '#7A4A2A', tank: 1, ac: 1 },
  { x: 1060, y: 110, w: 190, h: 140, wall: '#EAD6B6', door: '#2F6B73', dish: 1, stair: 1 },
  { x: 1300, y: 170, w: 150, h: 120, wall: '#F0E6D4', door: '#7A4A2A', tank: 1 },
  { x: 860, y: 330, w: 150, h: 110, wall: '#ECDABF', door: '#3F7A55', ac: 1 },
  { x: 1240, y: 340, w: 180, h: 120, wall: '#EFE0C6', door: '#7A4A2A', tank: 1, dish: 1 },
  { x: 110, y: 80, w: 200, h: 130, wall: '#EBD9C2', door: '#7A4A2A', stair: 1, ac: 1 },
  { x: 400, y: 110, w: 170, h: 120, wall: '#F0E6D4', door: '#2F6B73', tank: 1 }
];
export const WAREHOUSE = { x: 110, y: 300, w: 300, h: 170 };
export const WELL = { x: 1110, y: 470, r: 24 };
export const PILE = { x: 262, y: 528 };
export const PARK = Array.from({ length: 6 }, (_, i) => ({ x: 150 + i * 92, y: 770 }));
export const SIGNAL = { x: 690, y: 770 };
export const FARM = { x: 880, y: 760, w: 570, h: 330 };
export const FARM_PARK = Array.from({ length: 6 }, (_, i) => ({ x: 930 + i * 86, y: 722 }));
export const TREE_SPOTS = [{ x: 860, y: 548 }, { x: 990, y: 552 }, { x: 1190, y: 548 }];
export const SOUTH = [
  { x: 420, y: 1180, w: 180, h: 100, wall: '#E9D8BC', door: '#9E3B2F', sign: 'مكتب البريد', ac: 1 },
  { x: 1120, y: 1180, w: 180, h: 100, wall: '#E2D2B6', door: '#4E5A66', sign: 'ورشة راشد', tank: 1 }
];
const PALMS = [{ x: 55, y: 560 }, { x: 610, y: 515 }, { x: 1470, y: 560 }, { x: 40, y: 1010 }, { x: 640, y: 1090 }, { x: 590, y: 300 }, { x: 640, y: 420 }, { x: 1470, y: 110 }, { x: 40, y: 1500 }, { x: 1460, y: 1450 }, { x: 380, y: 1600 }, { x: 1180, y: 1620 }];
const FARM_PALMS = [{ x: 905, y: 1080 }, { x: 1440, y: 1080 }, { x: 1440, y: 800 }, { x: 1170, y: 1085 }];
const H_HOUSE = 96, H_WARE = 104, H_SOUTH = 90;
// تفاصيل الشارع: إنارة على الرصيف الشمالي، شجيرات جهنمية أمام البيوت، مقعد في ساحة البئر، ولافتة إرشاد عند التقاطع
const LAMPS = [{ x: 40, y: 594 }, { x: 612, y: 594 }, { x: 870, y: 594 }, { x: 1220, y: 594 }, { x: 790, y: 300 }];
const SHRUBS = [{ x: 838, y: 282, f: '#D9478C' }, { x: 992, y: 282, f: null }, { x: 1068, y: 262, f: '#D9478C' }, { x: 1308, y: 302, f: '#E8A33D' }, { x: 868, y: 452, f: null }, { x: 1248, y: 472, f: '#D9478C' }, { x: 118, y: 222, f: '#D9478C' }, { x: 560, y: 242, f: null }];

/* المصادمات: مستطيلات لا يعبرها البطل (أرضية المباني كما هي، الرسم وحده تغيّر) */
export function staticColliders() {
  const pad = 2;
  return [
    ...HOUSES.concat(SOUTH).map(b => ({ x: b.x - pad, y: b.y + 10, w: b.w + pad * 2, h: b.h - 6 })),
    { x: WAREHOUSE.x, y: WAREHOUSE.y + 10, w: WAREHOUSE.w, h: WAREHOUSE.h - 6 },
    { x: WELL.x - WELL.r, y: WELL.y - WELL.r, w: WELL.r * 2, h: WELL.r * 2 },
    { x: SIGNAL.x - 5, y: SIGNAL.y - 6, w: 10, h: 10 }
  ];
}
export function inView(v, x, y, m) { return x > v.x - m && x < v.x + v.w + m && y > v.y - m && y < v.y + v.h + m; }
const boxInView = (v, x, y, w, h, m) => x + w > v.x - m && x < v.x + v.w + m && y + h > v.y - m && y < v.y + v.h + m;

/* ── الأرض (تُرسم أولاً): رمل بملمس وتفاوت، شوارع وأرصفة بحواف، ساحات، ثم ظلال المباني ── */
const R = rng(7), PATCHES = Array.from({ length: 70 }, () => ({ x: R() * 3000, y: R() * 1800, r: 40 + R() * 120, k: R() < .5 ? 'rgba(205,176,125,.35)' : 'rgba(244,228,192,.4)' }));
export function drawGround(ctx, view) {   // الأرض ثابتة: تُرسم في قطع ٥١٢×٥١٢ محفوظة، وتُنسخ في كل إطار
  const CH = 512;
  for (let cy = Math.floor(view.y / CH); cy * CH < view.y + view.h; cy++) for (let cx = Math.floor(view.x / CH); cx * CH < view.x + view.w; cx++)
    if (cx >= 0 && cy >= 0) sprite(ctx, `ground|${cx}|${cy}`, cx * CH, cy * CH, CH, CH, c => paintGround(c, { x: cx * CH, y: cy * CH, w: CH, h: CH }), 2);
}
function paintGround(ctx, view) {
  const v = view, m = 40;
  ctx.fillStyle = pattern(ctx, 'sand'); ctx.fillRect(v.x - m, v.y - m, v.w + 2 * m, v.h + 2 * m);
  PATCHES.forEach(p => { if (inView(v, p.x, p.y, p.r)) { const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r); g.addColorStop(0, p.k); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(p.x - p.r, p.y - p.r * .6, p.r * 2, p.r * 1.2); } });
  if (v.y > 1800) return;   // جنوب القرية: الأرض وحدها
  // ممرات ترابية مدكوكة نحو المباني الجنوبية والمزرعة
  ctx.strokeStyle = 'rgba(200,170,120,.55)'; ctx.lineWidth = 26; ctx.lineCap = 'round';
  [[[510, 700], [510, 1180]], [[1210, 700], [1210, 760]], [[1210, 1090], [1210, 1180]], [[300, 700], [230, 1000]]].forEach(([a, b]) => { ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); });
  // ساحة البئر: بلاط دائري يربط البيوت
  ctx.fillStyle = pattern(ctx, 'pavers'); ctx.beginPath(); ctx.ellipse(WELL.x, WELL.y + 10, 118, 72, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = shade(PAL.stone, -10); ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = pattern(ctx, 'pavers'); ctx.fillRect(1040, 270, 26, 140); ctx.fillRect(1230, 300, 30, 100);
  // ساحة المستودع: خرسانة ببقع زيت وآثار عجلات
  ctx.fillStyle = '#CFC3AC'; rr(ctx, 100, 468, 320, 120, 6); ctx.fill();
  ctx.strokeStyle = 'rgba(120,105,85,.35)'; ctx.lineWidth = 1; for (let x = 160; x < 420; x += 60) { ctx.beginPath(); ctx.moveTo(x, 470); ctx.lineTo(x, 586); ctx.stroke(); }
  ctx.fillStyle = 'rgba(60,55,50,.15)'; [[200, 520, 14], [330, 548, 10], [372, 500, 8]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.ellipse(x, y, r, r * .5, .3, 0, 7); ctx.fill(); });
  // موقف الشاحنات: إسفلت بخطوط مواقف
  ctx.fillStyle = pattern(ctx, 'asphalt'); rr(ctx, 100, 722, 600, 102, 8); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2; PARK.forEach(p => { ctx.beginPath(); ctx.moveTo(p.x - 46, p.y - 44); ctx.lineTo(p.x - 46, p.y + 22); ctx.stroke(); }); ctx.beginPath(); ctx.moveTo(PARK[5].x + 46, 726); ctx.lineTo(PARK[5].x + 46, 792); ctx.stroke();
  // الشوارع: أرصفة ببلاط، وحواف بارزة، وإسفلت، وخطوط
  const [H, V] = ROADS;
  ctx.fillStyle = pattern(ctx, 'pavers'); ctx.fillRect(0, H.y - 18, H.w, 18); ctx.fillRect(0, H.y + H.h, H.w, 18); ctx.fillRect(V.x - 18, 0, 18, H.y); ctx.fillRect(V.x + V.w, 0, 18, H.y);
  ctx.fillStyle = pattern(ctx, 'asphalt'); ctx.fillRect(H.x, H.y, H.w, H.h); ctx.fillRect(V.x, V.y, V.w, V.h);
  // حافة الرصيف: سطح فاتح، ووجه أمامي ظاهر على الرصيف الشمالي، وظل على الإسفلت
  const curbH = (x, y, w, face) => { ctx.fillStyle = PAL.curb; ctx.fillRect(x, y - 4, w, 4); ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fillRect(x, y - 4, w, 1); if (face) { ctx.fillStyle = shade(PAL.curb, -30); ctx.fillRect(x, y, w, 3); ctx.fillStyle = 'rgba(30,25,25,.25)'; ctx.fillRect(x, y + 3, w, 4); } };
  curbH(0, H.y, V.x, true); curbH(V.x + V.w, H.y, H.w - V.x - V.w, true); curbH(0, H.y + H.h + 4, H.w, false);
  ctx.fillStyle = PAL.curb; ctx.fillRect(V.x - 4, 0, 4, H.y); ctx.fillRect(V.x + V.w, 0, 4, H.y); ctx.fillStyle = 'rgba(30,25,25,.22)'; ctx.fillRect(V.x + V.w + 4, 0, 4, H.y - 4); ctx.fillRect(V.x, 0, 3, H.y);
  ctx.fillStyle = 'rgba(246,242,230,.85)';
  for (let x = 20; x < H.w; x += 70) if (!(x > 660 && x < 860)) ctx.fillRect(x, H.y + 38, 36, 4);
  for (let y = 20; y < H.y - 40; y += 70) ctx.fillRect(V.x + 33, y, 4, 36);
  ctx.fillStyle = 'rgba(246,242,230,.5)'; ctx.fillRect(0, H.y + 8, H.w, 2); ctx.fillRect(0, H.y + H.h - 10, H.w, 2);
  ctx.fillStyle = 'rgba(246,242,230,.9)';
  for (let k = 0; k < 7; k++) ctx.fillRect(784 + k * 11, H.y + 6, 6, H.h - 12);       // ممر مشاة نحو المزرعة
  for (let k = 0; k < 6; k++) ctx.fillRect(V.x + 6 + k * 10.5, H.y - 52, 6, 40);     // ممر مشاة عند التقاطع
  // ظلال الأجسام على الأرض (كلها من الشمس نفسها)
  HOUSES.forEach(b => { if (boxInView(v, b.x, b.y - H_HOUSE, b.w + 80, b.h + H_HOUSE + 40, 40)) boxShadow(ctx, b.x, b.y, b.w, b.h, H_HOUSE); });
  SOUTH.forEach(b => { if (boxInView(v, b.x, b.y - H_SOUTH, b.w + 80, b.h + H_SOUTH + 40, 40)) boxShadow(ctx, b.x, b.y, b.w, b.h, H_SOUTH); });
  boxShadow(ctx, WAREHOUSE.x, WAREHOUSE.y, WAREHOUSE.w, WAREHOUSE.h, H_WARE);
  PALMS.concat(FARM_PALMS).forEach(p => { if (inView(v, p.x, p.y, 90)) blobShadow(ctx, p.x, p.y, 26, 80); });
  LAMPS.forEach(p => { if (inView(v, p.x, p.y, 60)) { ctx.strokeStyle = SUN.color; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + SUN.dx * 62, p.y + SUN.dy * 62); ctx.stroke(); } });
  blobShadow(ctx, WELL.x, WELL.y + 6, 30, 40);
}

/* ── المزرعة: حقول غير منتظمة، فلج حجري يجري فيه الماء، ممرات، كوخ المضخة، وأدوات. g من ٠ (عطشى) إلى ١ (مرويّة) ── */
const FI = { x: FARM.x + 14, y: FARM.y + 14, w: FARM.w - 28, h: FARM.h - 28 };
const PLOTS = [   // الحقول: [x, y, w, h, نوع]
  [FI.x + 8, FI.y + 44, 238, 92, 'veg'], [FI.x + 280, FI.y + 44, 262, 92, 'alfalfa'],
  [FI.x + 8, FI.y + 166, 238, 128, 'mounds'], [FI.x + 280, FI.y + 166, 126, 128, 'young']
];
const CH_Y = FI.y + 18, CH_X = [FI.x + 262, FI.x + 418];   // القناة الرئيسة وفرعاها
export function drawFarm(ctx, g, t) {   // المزرعة من الذاكرة لكل مستوى ماء، ولمعة الماء الجاري حية فوقها
  const gq = Math.round(g * 20) / 20, F = FARM;
  sprite(ctx, 'farm|' + gq, F.x - 12, F.y - 34, F.w + 24, F.h + 46, c => paintFarm(c, gq));
  const flow = clamp(gq * 1.3, 0, 1);
  channelGlints(ctx, FI.x + 4, CH_Y, FI.w - 8, true, flow, t);
  CH_X.forEach((cx, i) => channelGlints(ctx, cx, CH_Y + 6, FI.h - 30, false, clamp(flow * 1.4 - .3 - i * .2, 0, 1), t));
}
function paintFarm(ctx, g) {
  const F = FARM, t = 0;
  // التربة: جافة متشققة ثم رطبة داكنة كلما وصل الماء
  ctx.fillStyle = mix('#D3B07E', '#B99566', g); rr(ctx, F.x, F.y, F.w, F.h, 10); ctx.fill();
  PLOTS.forEach(([x, y, w, h, kind], i) => {
    const wet = clamp(g * 1.6 - i * .15, 0, 1);
    ctx.fillStyle = pattern(ctx, 'soil'); rr(ctx, x, y, w, h, 8); ctx.fill();
    if (wet > 0) { ctx.globalAlpha = wet; ctx.fillStyle = pattern(ctx, 'soilWet'); rr(ctx, x, y, w, h, 8); ctx.fill(); ctx.globalAlpha = 1; }
    ctx.strokeStyle = 'rgba(70,45,25,.5)'; ctx.lineWidth = 2; rr(ctx, x, y, w, h, 8); ctx.stroke();
    if (wet < 1) {   // تشققات الأرض العطشى
      ctx.strokeStyle = `rgba(90,58,30,${.45 * (1 - wet)})`; ctx.lineWidth = 1; const Rr = rng(i + 3);
      for (let k = 0; k < 9; k++) { const cx = x + 12 + Rr() * (w - 24), cy = y + 10 + Rr() * (h - 20); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + 8 + Rr() * 8, cy + 4); ctx.lineTo(cx + 12, cy + 12); ctx.moveTo(cx + 8, cy + 4); ctx.lineTo(cx + 18, cy - 2); ctx.stroke(); }
    }
    crops(ctx, x, y, w, h, kind, clamp(g * 1.4 - i * .12, 0, 1), t);
  });
  // ركن العمل: أرض مدكوكة، كوخ المضخة وخزان، وأدوات
  const wx = FI.x + 418, wy = FI.y + 160;
  ctx.fillStyle = 'rgba(214,190,150,.9)'; rr(ctx, wx, wy, FI.x + FI.w - wx, FI.y + FI.h - wy, 8); ctx.fill();
  // الفلج: قناة حجرية؛ الماء يجري فيها تدريجياً من الشرق
  const flow = clamp(g * 1.3, 0, 1);
  channel(ctx, FI.x + 4, CH_Y, FI.w - 8, true, flow, t);
  CH_X.forEach((cx, i) => channel(ctx, cx, CH_Y + 6, FI.h - 30, false, clamp(flow * 1.4 - .3 - i * .2, 0, 1), t));
  // السور: جدار طيني منخفض بأعمدة، وبوابة مفتوحة نحو الطريق
  const gate = [F.x + F.w / 2 - 36, F.x + F.w / 2 + 36];
  const wallSeg = (x1, y1, x2, y2) => { ctx.strokeStyle = shade('#C8A877', -30); ctx.lineWidth = 7; ctx.lineCap = 'butt'; ctx.beginPath(); ctx.moveTo(x1, y1 + 2); ctx.lineTo(x2, y2 + 2); ctx.stroke(); ctx.strokeStyle = '#C8A877'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x1, y1 - 2); ctx.lineTo(x2, y2 - 2); ctx.stroke(); };
  wallSeg(F.x + 4, F.y + 4, gate[0], F.y + 4); wallSeg(gate[1], F.y + 4, F.x + F.w - 4, F.y + 4);
  wallSeg(F.x + 4, F.y + 4, F.x + 4, F.y + F.h - 4); wallSeg(F.x + F.w - 4, F.y + 4, F.x + F.w - 4, F.y + F.h - 4); wallSeg(F.x + 4, F.y + F.h - 4, F.x + F.w - 4, F.y + F.h - 4);
  ctx.fillStyle = '#B79766'; [gate[0], gate[1]].forEach(x => { ctx.fillRect(x - 5, F.y - 8, 10, 14); ctx.fillStyle = '#D6BA8A'; ctx.fillRect(x - 5, F.y - 10, 10, 4); ctx.fillStyle = '#B79766'; });
  signboard(ctx, F.x + F.w / 2, F.y - 18, g > .5 ? 'مزرعة القرية 🌾' : 'مزرعة القرية');
}
function channel(ctx, x, y, len, horiz, flow, t) {   // قناة الفلج: حجارة على الحافتين، وماء متدفق بقدر flow
  const W = 10;
  ctx.fillStyle = '#A88F6A'; horiz ? ctx.fillRect(x, y - W / 2 - 3, len, W + 6) : ctx.fillRect(x - W / 2 - 3, y, W + 6, len);
  ctx.fillStyle = '#7D6648'; horiz ? ctx.fillRect(x, y - W / 2, len, W) : ctx.fillRect(x - W / 2, y, W, len);
  ctx.fillStyle = 'rgba(255,255,255,.25)'; horiz ? ctx.fillRect(x, y - W / 2 - 3, len, 1.5) : ctx.fillRect(x - W / 2 - 3, y, 1.5, len);
  if (flow <= 0) return;
  const L = len * flow;
  ctx.fillStyle = PAL.water; horiz ? ctx.fillRect(x + len - L, y - W / 2 + 1.5, L, W - 3) : ctx.fillRect(x - W / 2 + 1.5, y, W - 3, L);
}
function channelGlints(ctx, x, y, len, horiz, flow, t) {   // لمعة الماء الجاري في الفلج
  if (flow <= 0) return;
  const L = len * flow; ctx.fillStyle = PAL.waterLight;
  for (let k = 0; k < L; k += 22) { const o = (t * 34 + k) % L; horiz ? ctx.fillRect(x + len - o - 7, y - 1, 7, 1.6) : ctx.fillRect(x - 1, y + o, 1.6, 7); }
}
function crops(ctx, x, y, w, h, kind, k, t) {   // المحاصيل تنمو بقدر k
  ctx.save(); rr(ctx, x, y, w, h, 8); ctx.clip();
  if (kind === 'alfalfa') {   // برسيم: بساط أخضر كثيف بصفوف
    if (k > 0) { ctx.globalAlpha = k; ctx.fillStyle = PAL.leaf; ctx.fillRect(x, y, w, h); ctx.globalAlpha = 1; }
    for (let r = 0; r < 7; r++) { const yy = y + 8 + r * 12; ctx.strokeStyle = k > 0 ? mix('#7C5A3A', PAL.leafLight, k) : 'rgba(110,75,45,.6)'; ctx.lineWidth = k > 0 ? 4 * k + 1 : 1.5; ctx.beginPath(); for (let xx = x + 6; xx < x + w - 6; xx += 6) ctx.lineTo(xx, yy + Math.sin(xx * .3 + t * 1.5) * k); ctx.stroke(); }
  } else {
    const rows = kind === 'mounds' ? 6 : kind === 'young' ? 6 : 5, gap = (h - 16) / rows;
    for (let r = 0; r < rows; r++) {
      const yy = y + 12 + r * gap;
      ctx.fillStyle = 'rgba(70,45,25,.4)'; ctx.fillRect(x + 6, yy + 5, w - 12, 3);   // الخط المحروث
      ctx.fillStyle = 'rgba(255,230,190,.18)'; ctx.fillRect(x + 6, yy + 2, w - 12, 2);
      if (k <= 0) continue;
      const step = kind === 'young' ? 14 : 18;
      for (let xx = x + 12 + (r % 2) * 6; xx < x + w - 10; xx += step) {
        const sz = (kind === 'young' ? 3.4 : 5.4) * k, sw = Math.sin(t * 1.6 + xx * .1) * .6 * k;
        ctx.fillStyle = PAL.leafDark; ctx.beginPath(); ctx.ellipse(xx + sw, yy + 3, sz, sz * .7, 0, 0, 7); ctx.fill();
        ctx.fillStyle = PAL.leaf; ctx.beginPath(); ctx.ellipse(xx - 1 + sw, yy + 1.4, sz * .75, sz * .55, 0, 0, 7); ctx.fill();
        if (kind === 'veg' && k > .8) { ctx.fillStyle = '#D9442E'; ctx.beginPath(); ctx.arc(xx + 2, yy + 3, 1.4, 0, 7); ctx.fill(); }   // طماطم ناضجة
      }
    }
  }
  ctx.restore();
}

/* ── النخلة: نفس الرسم للزينة وللنخيل التي يزرعها اللاعب ── */
export function drawPalm(ctx, x, y, sc, dry, t) { palm(ctx, x, y, sc, dry, t); }

/* ── عناصر لها عمق (تُرتّب مع الشخصيات حسب y). المبنى الذي يقف البطل خلفه يصبح شفافاً ── */
const behind = (pl, b, H) => pl && pl.x > b.x - 8 && pl.x < b.x + b.w + 8 && pl.y < b.y + b.h - 4 && pl.y > b.y - H - 10;
export function staticDrawables(state, t, pl) {
  const out = [];
  // المباني من الذاكرة: صورة واحدة لكل مبنى، وشفافة إن وقف البطل خلفها
  const cachedBox = (key, b, H, paint) => c => { const f = behind(pl, b, H); if (f) c.globalAlpha = .42; sprite(c, key, b.x - 14, b.y - H - 26, b.w + 28, b.h + H + 36, paint); c.globalAlpha = 1; };
  HOUSES.forEach((b, i) => out.push({ y: b.y + b.h, draw: cachedBox('house' + i, b, H_HOUSE, c => building(c, Object.assign({}, b, { H: H_HOUSE }), 0)) }));
  SOUTH.forEach((b, i) => out.push({ y: b.y + b.h, draw: cachedBox('south' + i, b, H_SOUTH, c => building(c, Object.assign({}, b, { H: H_SOUTH, style: 'shop' }), 0)) }));
  out.push({ y: WAREHOUSE.y + WAREHOUSE.h, draw: cachedBox('warehouse', WAREHOUSE, H_WARE, c => drawWarehouse(c, false)) });
  out.push({ y: WELL.y + WELL.r, draw: c => drawWell(c, state.world.delivered, t) });
  PALMS.forEach(p => out.push({ y: p.y, draw: c => palmCached(c, p.x, p.y, 1, false, t) }));
  FARM_PALMS.forEach(p => out.push({ y: p.y, draw: c => palmCached(c, p.x, p.y, .95, !state.world.delivered, t) }));
  LAMPS.forEach(p => out.push({ y: p.y, draw: c => streetLamp(c, p.x, p.y, t, false) }));
  SHRUBS.forEach(p => out.push({ y: p.y, draw: c => shrub(c, p.x, p.y, 9, p.f) }));
  out.push({ y: 548, draw: c => bench(c, 1196, 548) });
  out.push({ y: FI.y + 226, draw: c => farmShed(c, t, !!state.world.delivered) });
  out.push({ y: 586, draw: c => wayfinding(c, 784, 586) });
  return out;
}
function drawWarehouse(ctx, faded) {   // مستودع: سقف معدني مضلّع، جدار خرساني، باب لفّاف كبير، ورصيف تحميل
  const b = WAREHOUSE, H = H_WARE, x = b.x, w = b.w, yb = b.y + b.h, yt = yb - H, ry = b.y - H;
  if (faded) ctx.globalAlpha = .42;
  const g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, '#B9C2CC'); g.addColorStop(1, '#7E8996');
  ctx.fillStyle = g; ctx.fillRect(x, ry, w, b.h);
  for (let xx = x + 6; xx < x + w; xx += 12) { ctx.fillStyle = 'rgba(255,255,255,.28)'; ctx.fillRect(xx, ry + 2, 2, b.h - 4); ctx.fillStyle = 'rgba(40,50,60,.22)'; ctx.fillRect(xx + 5, ry + 2, 2, b.h - 4); }
  ctx.fillStyle = '#E7ECEF'; ctx.fillRect(x + w - 70, ry + 30, 40, 26); ctx.fillStyle = '#9AA5B1'; ctx.fillRect(x + w - 66, ry + 34, 32, 3);   // وحدة تهوية
  ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.strokeRect(x, ry, w, b.h);
  const wg = ctx.createLinearGradient(x, 0, x + w, 0); wg.addColorStop(0, '#D9D2C4'); wg.addColorStop(1, '#B5AC9C');
  ctx.fillStyle = wg; ctx.fillRect(x, yt, w, H);
  ctx.strokeStyle = 'rgba(110,100,85,.35)'; ctx.lineWidth = 1; for (let xx = x + 50; xx < x + w; xx += 50) { ctx.beginPath(); ctx.moveTo(xx, yt); ctx.lineTo(xx, yb - 8); ctx.stroke(); }
  ctx.fillStyle = '#E2B04B'; ctx.fillRect(x, yt + 6, w, 5); ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.fillRect(x, yt + 11, w, 2);   // شريط تحذيري
  // الباب اللفّاف
  const dx = x + 92, dw = 116, dh = 74;
  ctx.fillStyle = '#5E6874'; ctx.fillRect(dx - 5, yb - dh - 7, dw + 10, dh + 7);
  const dg = ctx.createLinearGradient(0, yb - dh, 0, yb); dg.addColorStop(0, '#9AA5B1'); dg.addColorStop(1, '#6E7A86');
  ctx.fillStyle = dg; ctx.fillRect(dx, yb - dh, dw, dh);
  ctx.strokeStyle = 'rgba(40,50,60,.35)'; for (let yy = yb - dh + 5; yy < yb; yy += 5) { ctx.beginPath(); ctx.moveTo(dx, yy); ctx.lineTo(dx + dw, yy); ctx.stroke(); }
  ctx.fillStyle = 'rgba(30,25,20,.25)'; ctx.fillRect(dx, yb - 14, dw, 14);   // عتمة الداخل تحت الباب نصف المفتوح
  ctx.fillStyle = PAL.wood; rr(ctx, x + 26, yb - 58, 30, 58, 3); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = .9; ctx.stroke();   // باب جانبي
  ctx.fillStyle = '#E3B04B'; ctx.beginPath(); ctx.arc(x + 50, yb - 30, 1.5, 0, 7); ctx.fill();
  ctx.fillStyle = '#A9A08E'; ctx.fillRect(x + w - 70, yb - 46, 44, 26); ctx.fillStyle = '#7FB2C8'; ctx.fillRect(x + w - 66, yb - 42, 36, 18);   // نافذة المكتب
  ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.strokeRect(x, yt, w, H);
  ctx.fillStyle = '#8F8676'; ctx.fillRect(x - 4, yb - 3, w + 8, 6);   // رصيف التحميل
  signboard(ctx, dx + dw / 2, yt + 26, 'المستودع');
  ctx.globalAlpha = 1;
}
function drawWell(ctx, full, t) {   // بئر حجرية بإطار خشبي وبكرة ودلو؛ تمتلئ وتخضرّ حولها حين يعود الماء
  const w = WELL, r = w.r + 4;
  if (full) { ctx.fillStyle = 'rgba(110,160,70,.45)'; ctx.beginPath(); ctx.ellipse(w.x, w.y + 8, r + 22, r * .55 + 12, 0, 0, 7); ctx.fill(); }
  // الجدار الأسطواني: وجه أمامي حجري ثم الحافة العلوية
  const top = w.y - 16;
  ctx.fillStyle = PAL.stoneDark; ctx.beginPath(); ctx.ellipse(w.x, w.y, r, r * .5, 0, 0, Math.PI); ctx.lineTo(w.x - r, top); ctx.ellipse(w.x, top, r, r * .5, 0, Math.PI, 0, true); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(60,40,20,.35)'; ctx.lineWidth = 1; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.ellipse(w.x, top + 5 + k * 5, r, r * .5, 0, .2, Math.PI - .2); ctx.stroke(); }
  for (let k = -3; k <= 3; k++) { ctx.beginPath(); ctx.moveTo(w.x + k * 7, top + r * .5 * Math.sqrt(1 - (k * 7 / r) ** 2) + (k % 2 ? 5 : 0)); ctx.lineTo(w.x + k * 7, top + r * .5 * Math.sqrt(1 - (k * 7 / r) ** 2) + (k % 2 ? 10 : 5)); ctx.stroke(); }
  ctx.fillStyle = PAL.stone; ctx.beginPath(); ctx.ellipse(w.x, top, r, r * .5, 0, 0, 7); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = full ? PAL.water : '#3B2E22'; ctx.beginPath(); ctx.ellipse(w.x, top + 1, r - 7, r * .5 - 4, 0, 0, 7); ctx.fill();
  if (full) { ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1; const k = (t * .8) % 1; ctx.beginPath(); ctx.ellipse(w.x, top + 1, (r - 9) * k, (r * .5 - 5) * k, 0, 0, 7); ctx.stroke(); }
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(w.x, w.y, r, r * .5, 0, 0, Math.PI); ctx.lineTo(w.x - r, top); ctx.stroke(); ctx.beginPath(); ctx.moveTo(w.x + r, w.y); ctx.lineTo(w.x + r, top); ctx.stroke();
  // الإطار الخشبي والبكرة والحبل والدلو
  ctx.lineCap = 'round';
  [[-r + 3, 1], [r - 3, -1]].forEach(([dx]) => { ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(w.x + dx, top + 2); ctx.lineTo(w.x + dx * .6, top - 40); ctx.stroke(); ctx.strokeStyle = PAL.woodLight; ctx.lineWidth = 3.4; ctx.beginPath(); ctx.moveTo(w.x + dx, top + 2); ctx.lineTo(w.x + dx * .6, top - 40); ctx.stroke(); });
  ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(w.x - r * .7, top - 40); ctx.lineTo(w.x + r * .7, top - 40); ctx.stroke(); ctx.strokeStyle = PAL.wood; ctx.lineWidth = 3.4; ctx.stroke();
  ctx.fillStyle = '#5B4A3A'; ctx.beginPath(); ctx.arc(w.x, top - 36, 4, 0, 7); ctx.fill();
  const by = top - 18 + Math.sin(t * 1.2) * 1.5;
  ctx.strokeStyle = '#8A6A44'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(w.x, top - 34); ctx.lineTo(w.x, by - 5); ctx.stroke();
  ctx.fillStyle = '#7A8792'; ctx.beginPath(); ctx.moveTo(w.x - 5, by - 5); ctx.lineTo(w.x + 5, by - 5); ctx.lineTo(w.x + 4, by + 3); ctx.lineTo(w.x - 4, by + 3); ctx.closePath(); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = .8; ctx.stroke();
  if (full) { ctx.fillStyle = PAL.water; ctx.fillRect(w.x - 4, by - 4.5, 8, 2); }
}
function farmShed(ctx, t, wet) {   // كوخ المضخة في ركن العمل: سقف صاج، خزان، عربة يد، وأكياس
  const x = FI.x + 440, y = FI.y + 180, w = 80, d = 46, H = 46;
  boxShadow(ctx, x, y, w, d, H);
  const yb = y + d, yt = yb - H;
  ctx.fillStyle = '#9AA5B1'; ctx.fillRect(x - 4, y - H - 2, w + 8, d + 4); for (let xx = x; xx < x + w; xx += 8) { ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(xx, y - H, 2, d); }
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x - 4, y - H - 2, w + 8, d + 4);
  ctx.fillStyle = '#D8C7A4'; ctx.fillRect(x, yt, w, H); ctx.fillStyle = pattern(ctx, 'plaster'); ctx.fillRect(x, yt, w, H);
  ctx.fillStyle = PAL.wood; rr(ctx, x + 10, yb - 32, 20, 32, 2); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = .8; ctx.stroke();
  ctx.fillStyle = '#5E6874'; ctx.beginPath(); ctx.arc(x + 56, yb - 18, 9, 0, 7); ctx.fill(); ctx.fillStyle = wet ? '#3BE07A' : '#C94A3A'; ctx.beginPath(); ctx.arc(x + 56, yb - 18, 2.4, 0, 7); ctx.fill();   // عدّاد المضخة: أحمر جاف، أخضر يعمل
  if (wet) { ctx.save(); ctx.translate(x + 56, yb - 18); ctx.rotate(t * 4); ctx.strokeStyle = '#E8ECEF'; ctx.lineWidth = 1.4; for (let k = 0; k < 3; k++) { ctx.rotate(2.09); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -7); ctx.stroke(); } ctx.restore(); }
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x, yt, w, H);
  // عربة يد وأكياس سماد
  const wx = x - 30, wy = yb + 10;
  ctx.fillStyle = 'rgba(70,42,20,.2)'; ctx.beginPath(); ctx.ellipse(wx + 8, wy + 2, 16, 4, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#2E6B9E'; ctx.beginPath(); ctx.moveTo(wx - 10, wy - 12); ctx.lineTo(wx + 10, wy - 12); ctx.lineTo(wx + 6, wy - 3); ctx.lineTo(wx - 7, wy - 3); ctx.closePath(); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = .8; ctx.stroke();
  ctx.fillStyle = '#26262F'; ctx.beginPath(); ctx.arc(wx - 8, wy - 1, 3, 0, 7); ctx.fill(); ctx.strokeStyle = '#6E5030'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(wx + 8, wy - 8); ctx.lineTo(wx + 20, wy - 2); ctx.stroke();
  [[x + w + 8, yb + 4], [x + w + 18, yb + 6]].forEach(([sx, sy]) => { ctx.fillStyle = '#E6DCC4'; rr(ctx, sx - 6, sy - 12, 12, 13, 3); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = .7; ctx.stroke(); ctx.fillStyle = '#4E7A34'; ctx.fillRect(sx - 3, sy - 8, 6, 3); });
}
function wayfinding(ctx, x, y) {   // لافتة إرشاد عند التقاطع
  ctx.fillStyle = '#4B4747'; ctx.fillRect(x - 1.5, y - 52, 3, 52);
  const arm = (yy, text, right, col) => { ctx.font = '900 10px Cairo, sans-serif'; const w = ctx.measureText(text).width + 16, x0 = right ? x : x - w; ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x0, yy - 7); ctx.lineTo(x0 + w - (right ? 0 : 0), yy - 7); right ? ctx.lineTo(x0 + w + 6, yy) : ctx.lineTo(x0 + w, yy); ctx.lineTo(x0 + w, yy + 7); ctx.lineTo(x0, yy + 7); right ? null : ctx.lineTo(x0 - 6, yy); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#F2E6C9'; ctx.lineWidth = 1; ctx.stroke(); ctx.fillStyle = '#FFF6E2'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, x0 + w / 2 + (right ? 2 : -2), yy + .5); ctx.textBaseline = 'alphabetic'; };
  arm(y - 46, 'المزرعة', true, '#3F7A55'); arm(y - 30, 'المستودع', false, PAL.teal);
}
