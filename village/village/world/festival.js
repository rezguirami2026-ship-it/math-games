// «ساحة المهرجان»: منطقة الفصل الدراسي الثاني جنوب القلعة، تُفتح بإنهاء الفصل الأول
// الرسم بأسلوب القرية (world/art.js): بوابة مشتركة، مبانٍ مجسّمة، برج ساعة، ألواح، كشك الدوّار، وحبال زينة معلّقة
import { rr, shade, ar } from '../core/util.js';
import { INK, PAL, SUN, pattern, sprite, boxShadow, blobShadow, building3d, box3d, palmCached, gateEW, gateEWShadows, workTable, signboard, leanAt, elev, stall, bench, shrub, solid } from './art.js';
export const WALL4_Y = 2600, GATE4 = { x0: 1190, x1: 1290 };
export const KITCHEN = { x: 360, y: 2680, w: 440, h: 150 };
export const ST5 = { scale: { x: 480, y: 2876 }, recipe: { x: 680, y: 2876 }, clock: { x: 1100, y: 2904 }, calls: { x: 1550, y: 2856 }, guest: { x: 2200, y: 2944 } };
export const TOWER = { x: 1100, y: 2860 };
export const CALLS = { x: 1400, y: 2690, w: 300, h: 120 };
export const GUEST = { x: 2000, y: 2690, w: 400, h: 200 };
// الوحدة ٢ (البيانات) في الجزء الجنوبي من الساحة
export const ST6 = { graph: { x: 420, y: 3196 }, pie: { x: 800, y: 3266 }, harvest: { x: 1160, y: 3266 }, survey: { x: 1660, y: 3196 }, spinner: { x: 2350, y: 3266 } };
export const PIEFIELD = { x: 800, y: 3150, r: 72 };
export const PALMS6 = [1060, 1110, 1160, 1210, 1260].map(x => ({ x, y: 3150 }));
export const VISITORS = [[1450, 3070], [1560, 3330], [1720, 3060], [1830, 3400], [1960, 3110], [2060, 3330], [1500, 3230], [1890, 3240]].map(([x, y]) => ({ x, y }));
export function festivalColliders(open) {
  const c = [
    { x: 0, y: WALL4_Y, w: GATE4.x0, h: 12 }, { x: GATE4.x1, y: WALL4_Y, w: 2930 - GATE4.x1, h: 12 },
    { x: KITCHEN.x, y: KITCHEN.y + 10, w: KITCHEN.w, h: KITCHEN.h - 6 }, { x: TOWER.x - 34, y: TOWER.y - 60, w: 68, h: 60 },
    { x: CALLS.x, y: CALLS.y + 10, w: CALLS.w, h: CALLS.h - 6 }, { x: GUEST.x, y: GUEST.y, w: GUEST.w, h: GUEST.h - 30 },
    { x: ST5.scale.x - 30, y: ST5.scale.y - 34, w: 60, h: 14 }, { x: ST5.recipe.x - 30, y: ST5.recipe.y - 34, w: 60, h: 14 },
    { x: ST6.graph.x - 50, y: ST6.graph.y - 70, w: 100, h: 20 }, { x: ST6.survey.x - 50, y: ST6.survey.y - 70, w: 100, h: 20 }, { x: ST6.spinner.x - 60, y: ST6.spinner.y - 120, w: 120, h: 70 },
    ...PALMS6.map(p => ({ x: p.x - 8, y: p.y - 8, w: 16, h: 10 })),
    ...PALMS_X.map(p => solid.trunk(p.x, p.y)), ...STALLS.map(([x, y]) => solid.stall(x, y)), ...BENCHES.map(([x, y]) => solid.bench(x, y)), ...SHRUBS.map(([x, y]) => solid.shrub(x, y)),
    ...BUNTING.flatMap(([x1, x2, y]) => [solid.post(x1, y), solid.post(x2, y)])
  ];
  if (!open) c.push({ x: GATE4.x0, y: WALL4_Y - 4, w: GATE4.x1 - GATE4.x0, h: 20 });
  return c;
}
const H_K = 88, H_C = 84, TW = { s: 64, H: 190 };
const PALMS_X = [{ x: 150, y: 2960 }, { x: 1320, y: 2700 }, { x: 2600, y: 2760 }, { x: 2700, y: 3150 }, { x: 260, y: 3420 }, { x: 1050, y: 3420 }];
// حبال الرايات: [x1, x2, y، ارتفاع الطرفين]
const BUNTING = [[200, 760, 2900, 70], [870, 1360, 2980, 70], [1420, 2280, 2960, 70], [460, 1300, 3330, 60]];
// زينة بلا تصادم في أطراف الساحة: بسطات المهرجان ومقاعد وشجيرات
const STALLS = [[2560, 3000, '#E85D75'], [2600, 3380, '#2F6FB2'], [620, 3420, '#2E8B57'], [1700, 3420, '#9C6BFF']];
const BENCHES = [[960, 3010], [1240, 3010], [1500, 3430], [2450, 3430]];
const SHRUBS = [[300, 3000], [2480, 2950], [1380, 3420], [2200, 3430], [900, 3430]];

export function drawFestivalGround(ctx, t) {
  gateEWShadows(ctx, WALL4_Y, GATE4.x0, GATE4.x1);
  // أرض الساحة: بلاط واسع حول برج الساعة، وممر من البوابة
  sprite(ctx, 'fest-plaza', 860, WALL4_Y + 10, 520, 360, c => {
    c.fillStyle = shade(PAL.stone, -14); rr(c, 870, WALL4_Y + 20, 500, 340, 26); c.fill();
    c.fillStyle = pattern(c, 'pavers'); rr(c, 874, WALL4_Y + 14, 492, 336, 24); c.fill();
    const cx = TOWER.x, cy = TOWER.y + 30; c.fillStyle = 'rgba(184,97,62,.5)'; c.beginPath(); for (let k = 0; k < 16; k++) { const r = k % 2 ? 40 : 70, a = k * Math.PI / 8; c.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r * .6); } c.closePath(); c.fill();
    c.strokeStyle = INK; c.lineWidth = 1; rr(c, 874, WALL4_Y + 14, 492, 336, 24); c.stroke();
  });
  // الحقل الدائري (المخطط الدائري): تربة بحافة حجرية، والدرس يرسم قطاعاته
  sprite(ctx, 'piefield', PIEFIELD.x - 84, PIEFIELD.y - 84, 168, 176, c => {
    const P = PIEFIELD; c.fillStyle = shade(PAL.stone, -30); c.beginPath(); c.ellipse(P.x, P.y + 6, P.r + 8, P.r + 8, 0, 0, 7); c.fill();
    c.fillStyle = PAL.stone; c.beginPath(); c.arc(P.x, P.y, P.r + 8, 0, 7); c.fill();
    c.fillStyle = pattern(c, 'soil'); c.beginPath(); c.arc(P.x, P.y, P.r, 0, 7); c.fill();
    c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.arc(P.x, P.y, P.r + 8, 0, 7); c.stroke();
  });
  // أرض بيت الضيافة: بلاطة إسمنتية بشبكة أمتار (جزء من رياضيات الدرس)
  const G = GUEST;
  sprite(ctx, 'guestlot', G.x - 8, G.y - 8, G.w + 16, G.h + 16, c => {
    c.fillStyle = '#CFC3AC'; rr(c, G.x - 4, G.y - 4, G.w + 8, G.h + 8, 10); c.fill();
    c.strokeStyle = 'rgba(90,70,40,.22)'; c.lineWidth = 1; for (let x = G.x; x <= G.x + G.w; x += 20) { c.beginPath(); c.moveTo(x, G.y); c.lineTo(x, G.y + G.h); c.stroke(); } for (let y = G.y; y <= G.y + G.h; y += 20) { c.beginPath(); c.moveTo(G.x, y); c.lineTo(G.x + G.w, y); c.stroke(); }
    c.strokeStyle = INK; rr(c, G.x - 4, G.y - 4, G.w + 8, G.h + 8, 10); c.stroke();
  });
  boxShadow(ctx, KITCHEN.x, KITCHEN.y, KITCHEN.w, KITCHEN.h, H_K); boxShadow(ctx, CALLS.x, CALLS.y, CALLS.w, CALLS.h, H_C);
  boxShadow(ctx, TOWER.x - TW.s / 2, TOWER.y - TW.s, TW.s, TW.s, TW.H);
  PALMS_X.concat(PALMS6).forEach(p => blobShadow(ctx, p.x, p.y, 22, 70));
  BUNTING.forEach(([x1, x2, y, h]) => [x1, x2].forEach(x => blobShadow(ctx, x, y, 5, h)));
}
/* الرسم على واجهة مبنى مجسّم بالميل نفسه (ساعات المدن، ساعة البرج) */
function onFacade(c, x, yb, draw) { const { lx, ly } = leanAt(x, yb); c.save(); c.translate(x, yb); c.transform(1, 0, -lx, 1 - ly, 0, 0); c.translate(-x, -yb); draw(c); c.restore(); }
function clockFace(c, x, y, r, a1, a2) {
  c.fillStyle = '#FFFDF6'; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.strokeStyle = '#2A1B66'; c.lineWidth = 2; c.stroke();
  c.fillStyle = '#2A1B66'; for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; c.fillRect(x + Math.cos(a) * (r - 4) - .8, y + Math.sin(a) * (r - 4) - .8, 1.6, 1.6); }
  c.lineCap = 'round'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a1) * r * .5, y + Math.sin(a1) * r * .5); c.stroke();
  c.strokeStyle = '#C0392B'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a2) * r * .78, y + Math.sin(a2) * r * .78); c.stroke();
}
export function festivalDrawables(open, t) {
  const out = [{ y: WALL4_Y + 12, draw: c => gateEW(c, 'festgate', WALL4_Y, GATE4.x0, GATE4.x1, open, 'ساحة المهرجان') }];
  out.push({ y: KITCHEN.y + KITCHEN.h, draw: c => {
    building3d(c, 'fest-kitchen', Object.assign({}, KITCHEN, { H: H_K, wall: '#F1DCC8', door: '#B8613E', sign: 'مطبخ المهرجان', ac: 1, tank: 1 }));
    const { lx, ly } = leanAt(KITCHEN.x + KITCHEN.w / 2, KITCHEN.y + KITCHEN.h), cx = KITCHEN.x + KITCHEN.w - 50 + lx * (H_K + 30), cy = KITCHEN.y + 30 - (H_K + 30) * (1 - ly);
    c.fillStyle = '#B5A58A'; c.fillRect(cx - 8, cy, 16, 30); c.strokeStyle = INK; c.lineWidth = 1; c.strokeRect(cx - 8, cy, 16, 30);   // مدخنة
    c.fillStyle = 'rgba(255,255,255,.6)'; for (let i = 0; i < 4; i++) { const k = ((t * .5 + i * .25) % 1); c.globalAlpha = .7 * (1 - k); c.beginPath(); c.arc(cx + Math.sin(t + i) * 6 + k * 10, cy - 6 - k * 50, 5 + k * 9, 0, 7); c.fill(); } c.globalAlpha = 1;
  } });
  out.push({ y: CALLS.y + CALLS.h, draw: c => {
    building3d(c, 'fest-calls', Object.assign({}, CALLS, { H: H_C, wall: '#DCE4EA', door: '#2F6B73', sign: 'مركز الاتصالات', style: 'shop', dish: 1 }));
    onFacade(c, CALLS.x, CALLS.y + CALLS.h, f => { for (let i = 0; i < 4; i++) { if (i === 1 || i === 2) continue; clockFace(f, CALLS.x + 46 + i * 70, CALLS.y + CALLS.h - 52, 13, i * 1.7 - 1.2, t / 3 + i * 2); } });
  } });
  out.push({ y: TOWER.y, draw: c => clockTower(c, t) });
  [[ST6.graph, 'لوح الرحلة', 'line'], [ST6.survey, 'لوح الاستبيان', 'bars']].forEach(([s, label, kind]) => out.push({ y: s.y - 50, x: s.x, draw: c => board(c, s, label, kind) }));
  out.push({ y: ST6.spinner.y - 50, x: ST6.spinner.x, draw: c => spinnerStall(c, ST6.spinner, t) });
  PALMS6.forEach(p => out.push({ y: p.y, draw: c => palmCached(c, p.x, p.y, .85, false, t) }));
  PALMS_X.forEach(p => out.push({ y: p.y, draw: c => palmCached(c, p.x, p.y, 1, false, t) }));
  [[ST5.scale, 'scale'], [ST5.recipe, 'recipe']].forEach(([s, k]) => out.push({ y: s.y - 20, x: s.x, draw: c => { workTable(c, s.x, s.y - 18); kitchenProp(c, s.x, s.y - 50, k); } }));
  STALLS.forEach(([x, y, col]) => out.push({ y, draw: c => stall(c, x, y, col) }));
  BENCHES.forEach(([x, y]) => out.push({ y, draw: c => bench(c, x, y) }));
  SHRUBS.forEach(([x, y]) => out.push({ y, draw: c => shrub(c, x, y, 14, true) }));
  BUNTING.forEach(([x1, x2, y, h]) => [x1, x2].forEach(x => out.push({ y, x, draw: c => { c.fillStyle = PAL.wood; c.fillRect(x - 2, y - h, 4, h); c.strokeStyle = INK; c.lineWidth = .7; c.strokeRect(x - 2, y - h, 4, h); } })));   // أعمدة الحبال
  BUNTING.forEach(([x1, x2, y, h]) => out.push({ y: y + 40, draw: c => bunting(c, elev(x1, y, h), elev(x2, y, h), t) }));   // معلّقة في الهواء: تُرسم بعد ما تحتها
  return out;
}
function clockTower(c, t) {   // برج الساعة: مجسّم بسقف هرمي، وساعة حية على وجهه
  const x = TOWER.x - TW.s / 2, y = TOWER.y - TW.s;
  box3d(c, 'clocktower', { x, y, w: TW.s, h: TW.s, H: TW.H }, '#D2B47E', r => {
    const ry = y - TW.H; r.fillStyle = '#B8613E'; r.beginPath(); r.moveTo(x - 6, ry + TW.s + 4); r.lineTo(x + TW.s / 2, ry - 40); r.lineTo(x + TW.s + 6, ry + TW.s + 4); r.closePath(); r.fill(); r.strokeStyle = INK; r.lineWidth = 1; r.stroke();
    r.fillStyle = 'rgba(0,0,0,.18)'; r.beginPath(); r.moveTo(x + TW.s / 2, ry - 40); r.lineTo(x + TW.s + 6, ry + TW.s + 4); r.lineTo(x + TW.s / 2, ry + TW.s + 4); r.closePath(); r.fill();
    r.fillStyle = '#E3B04B'; r.beginPath(); r.arc(x + TW.s / 2, ry - 44, 4, 0, 7); r.fill();
  }, f => {
    const yb = TOWER.y, yt = yb - TW.H;
    const g = f.createLinearGradient(x, 0, x + TW.s, 0); g.addColorStop(0, '#DCC08C'); g.addColorStop(1, '#B89A66'); f.fillStyle = g; f.fillRect(x, yt, TW.s, TW.H);
    f.strokeStyle = 'rgba(80,55,30,.22)'; f.lineWidth = .8; for (let yy = yt + 10; yy < yb; yy += 10) { f.beginPath(); f.moveTo(x, yy); f.lineTo(x + TW.s, yy); f.stroke(); }
    f.fillStyle = '#6E4524'; f.beginPath(); f.moveTo(x + 18, yb); f.lineTo(x + 18, yb - 30); f.arc(x + 32, yb - 30, 14, Math.PI, 0); f.lineTo(x + 46, yb); f.closePath(); f.fill();
    f.fillStyle = '#3E5A66'; [yt + 90, yt + 120].forEach(wy => { f.beginPath(); f.moveTo(x + 27, wy + 14); f.lineTo(x + 27, wy + 5); f.arc(x + 32, wy + 5, 5, Math.PI, 0); f.lineTo(x + 37, wy + 14); f.fill(); });
    f.strokeStyle = INK; f.lineWidth = 1.1; f.strokeRect(x, yt, TW.s, TW.H);
  }, 60);
  onFacade(c, x, TOWER.y, f => clockFace(f, TOWER.x, TOWER.y - TW.H + 40, 22, t / 24, t / 2));
}
function board(c, s, label, kind) {   // لوح بيانات خشبي على قائمين
  c.fillStyle = PAL.wood; c.fillRect(s.x - 44, s.y - 52, 5, 36); c.fillRect(s.x + 39, s.y - 52, 5, 36);
  c.fillStyle = PAL.woodLight; rr(c, s.x - 54, s.y - 108, 108, 64, 5); c.fill(); c.fillStyle = '#2F4F3F'; c.fillRect(s.x - 50, s.y - 104, 100, 56);
  c.strokeStyle = '#fff'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(s.x - 38, s.y - 58); c.lineTo(s.x - 38, s.y - 96); c.moveTo(s.x - 38, s.y - 58); c.lineTo(s.x + 40, s.y - 58); c.stroke();
  if (kind === 'line') { c.strokeStyle = '#FFC23D'; c.beginPath(); c.moveTo(s.x - 38, s.y - 58); c.lineTo(s.x + 34, s.y - 92); c.stroke(); }
  else { c.fillStyle = '#FFC23D'; [16, 28, 10].forEach((h, i) => c.fillRect(s.x - 28 + i * 22, s.y - 58 - h, 14, h)); }
  c.strokeStyle = INK; c.lineWidth = 1; rr(c, s.x - 54, s.y - 108, 108, 64, 5); c.stroke();
  signboard(c, s.x, s.y - 120, label);
}
function spinnerStall(c, s, t) {   // كشك الدوّار: قائمان، مظلة مخططة، ودولاب يدور
  c.fillStyle = 'rgba(70,42,20,.22)'; c.fillRect(s.x - 54, s.y - 48, 116, 8);
  [s.x - 56, s.x + 50].forEach(px => { c.fillStyle = PAL.wood; c.fillRect(px, s.y - 124, 6, 76); });
  for (let k = 0; k < 7; k++) { c.fillStyle = k % 2 ? '#F2E6C9' : '#E85D75'; c.beginPath(); c.moveTo(s.x - 64 + k * 18.3, s.y - 140); c.lineTo(s.x - 64 + (k + 1) * 18.3, s.y - 140); c.lineTo(s.x - 64 + (k + 1) * 18.3, s.y - 122); c.quadraticCurveTo(s.x - 64 + (k + .5) * 18.3, s.y - 116, s.x - 64 + k * 18.3, s.y - 122); c.closePath(); c.fill(); }
  c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(s.x - 64, s.y - 140); c.lineTo(s.x + 64, s.y - 140); c.stroke();
  c.save(); c.translate(s.x, s.y - 86); c.rotate(t * .8); for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#2F6FB2' : '#E2475C'; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 27, i * Math.PI / 4, (i + 1) * Math.PI / 4); c.fill(); } c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, 27, 0, 7); c.stroke(); c.restore();
  c.fillStyle = '#E3B04B'; c.beginPath(); c.arc(s.x, s.y - 86, 4, 0, 7); c.fill();
  c.fillStyle = '#2A1B66'; c.beginPath(); c.moveTo(s.x, s.y - 112); c.lineTo(s.x - 5, s.y - 122); c.lineTo(s.x + 5, s.y - 122); c.fill();
  c.fillStyle = PAL.woodLight; c.fillRect(s.x - 52, s.y - 58, 104, 8); c.fillStyle = '#7A4A2A'; c.fillRect(s.x - 52, s.y - 50, 104, 10); c.strokeStyle = INK; c.strokeRect(s.x - 52, s.y - 58, 104, 18);
}
function kitchenProp(c, x, y, k) {   // ميزان بكفتين، أو دفتر وصفات مفتوح
  if (k === 'scale') { c.strokeStyle = '#5E6874'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y + 6); c.lineTo(x, y - 12); c.moveTo(x - 16, y - 10); c.lineTo(x + 16, y - 10); c.stroke(); c.fillStyle = '#A9B4BF'; [-16, 16].forEach(d => { c.beginPath(); c.ellipse(x + d, y - 2, 8, 3, 0, 0, 7); c.fill(); }); return; }
  c.fillStyle = '#F2E6C9'; c.beginPath(); c.moveTo(x - 16, y); c.lineTo(x, y + 3); c.lineTo(x + 16, y); c.lineTo(x + 16, y - 10); c.lineTo(x, y - 7); c.lineTo(x - 16, y - 10); c.closePath(); c.fill(); c.strokeStyle = INK; c.lineWidth = .8; c.stroke();
  c.strokeStyle = 'rgba(80,60,40,.5)'; c.beginPath(); c.moveTo(x - 12, y - 6); c.lineTo(x - 3, y - 4); c.moveTo(x + 3, y - 4); c.lineTo(x + 12, y - 6); c.stroke();
}
function bunting(c, a, b, t) {   // حبل رايات مثلثة ملوّنة يتأرجح قليلاً
  const sag = 26 + Math.sin(t * 1.2 + a[0]) * 2, n = Math.max(6, Math.round((b[0] - a[0]) / 34));
  const pt = u => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u + Math.sin(Math.PI * u) * sag];
  c.strokeStyle = 'rgba(70,45,25,.8)'; c.lineWidth = 1.1; c.beginPath(); for (let k = 0; k <= 24; k++) { const [x, y] = pt(k / 24); k ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
  const cols = ['#E85D75', '#FFC23D', '#1FC8B5', '#9C6BFF', '#2F6FB2'];
  for (let k = 1; k < n; k++) { const [x, y] = pt(k / n); c.fillStyle = cols[k % 5]; c.beginPath(); c.moveTo(x - 7, y); c.lineTo(x + 7, y); c.lineTo(x, y + 13); c.closePath(); c.fill(); c.strokeStyle = 'rgba(0,0,0,.15)'; c.lineWidth = .6; c.stroke(); }
  [a, b].forEach(([x, y]) => { c.fillStyle = PAL.wood; c.fillRect(x - 2, y, 4, 4); });
}
