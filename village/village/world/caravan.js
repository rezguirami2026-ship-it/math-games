// «طريق القافلة»: منطقة وحدة القياس (٢) في الفصل الثاني جنوب سوق الجمعية، تُفتح بإنهاء وحدة العدد
// الرسم بأسلوب القرية: كثبان، طريق إسفلتي، مدرج وطائرة، واحة بنخيل، ومحطة وقود
import { rr, shade } from '../core/util.js';
import { FLAGS, box3d, INK, PAL, pattern, sprite, kiosk3d, kioskShadow, gateEW, gateEWShadows, palmCached, blobShadow, upright, shrub, solid } from './art.js';
export const WALL6_Y = 4500, GATE6 = { x0: 1190, x1: 1290 };
export const ST8 = {
  fuel: { x: 380, y: 4790, sign: 'محطة الوقود', col: '#C0392B' }, signs: { x: 800, y: 4790, sign: 'دليل القافلة', col: '#8B5A2B' },
  flights: { x: 1240, y: 4790, sign: 'مطار الواحة', col: '#2F6FB2' }, century: { x: 1680, y: 4790, sign: 'جدار القرن', col: '#7B3F98' },
  rects: { x: 2120, y: 4790, sign: 'بستان وفاء', col: '#2E8B57' }, oasis: { x: 1240, y: 5230, sign: 'أرض الواحة', col: '#1FC8B5' }
};
export const OASIS = { x: 1240, y: 5100 };
/* ميناء حاويات على الساحل: رصيف، صفوف حاويات بممرات بينها، ورافعة جسرية على حافة الماء (والسفينة في البحر) */
export const PORT = { x: 2300, y: 4980, w: 630, h: 470 };
export const STACKS = [[2340, 5030, 3, '#C0392B'], [2520, 5030, 2, '#2F6FB2'], [2340, 5150, 2, '#2E8B57'], [2520, 5150, 4, '#E3B04B'], [2340, 5270, 4, '#7B3F98'], [2520, 5270, 1, '#D35400'], [2340, 5370, 2, '#16A085'], [2520, 5370, 3, '#5E6874']];   // [x, y, الطبقات, اللون] كل كومة حاويتان متجاورتان
export const CRANE = { x: 2800, y: 5200, span: 180 };
const portColliders = () => STACKS.map(([x, y]) => ({ x, y, w: 150, h: 74 })).concat([[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => ({ x: CRANE.x + a * 70 - 6, y: CRANE.y + b * CRANE.span / 2 - 6, w: 12, h: 12 })));
export function caravanColliders(open) {
  const c = [{ x: 0, y: WALL6_Y, w: GATE6.x0, h: 12 }, { x: GATE6.x1, y: WALL6_Y, w: 2930 - GATE6.x1, h: 12 },
    { x: OASIS.x - 120, y: OASIS.y - 50, w: 240, h: 90 }];
  Object.values(ST8).forEach(s => c.push({ x: s.x - 52, y: s.y - 56, w: 104, h: 24 }));
  c.push(...portColliders());
  c.push(...PALMS.map(p => solid.trunk(p.x, p.y)), ...PUMPS.map(x => solid.pump(x, 4800)), ...OSHRUBS.map(([x, y]) => solid.shrub(x, y, 12)));
  if (!open) c.push({ x: GATE6.x0, y: WALL6_Y - 4, w: GATE6.x1 - GATE6.x0, h: 20 });
  return c;
}
const GOODS = { fuel: ['#C0392B', '#3D3A3A', '#E3B04B'], signs: ['#8B5A2B', '#F2E6C9', '#2F6B73'], flights: ['#2F6FB2', '#F4F1E8', '#E3B04B'], century: ['#7B3F98', '#F2E6C9', '#C9971C'], rects: ['#2E8B57', '#7FB24A', '#C46A1E'], oasis: ['#1FC8B5', '#2E8B57', '#E3B04B'] };
const OPTS = [[-110, 0], [-70, -40], [0, -48], [80, -34], [118, 4], [70, 36], [-20, 40], [-90, 30]];
const DUNES = Array.from({ length: 34 }, (_, i) => [(i * 337) % 2900, WALL6_Y + 60 + (i * 191) % 900]).filter(([x, y]) => !(y > 4840 && y < 4960) && !(Math.abs(x - 1240) < 220 && y > 4560 && y < 4660) && !(Math.abs(x - OASIS.x) < 220 && Math.abs(y - OASIS.y) < 110));
const PUMPS = [ST8.fuel.x - 90, ST8.fuel.x + 90];
const OSHRUBS = [[OASIS.x - 160, 5130], [OASIS.x + 165, 5120], [OASIS.x - 95, 5168]];
const PALMS = [[-150, 5080], [150, 5090], [-240, 5110], [235, 5100], [-190, 5030], [190, 5020]].map(([dx, y]) => ({ x: OASIS.x + dx, y }))
  .concat([{ x: 180, y: 4650 }, { x: 2500, y: 4650 }, { x: 420, y: 5150 }, { x: 2000, y: 5300 }]);   // (الساحل الجنوبي الشرقي صار ميناءً)
function oasisPath(c, k) {   // حافة ناعمة: منحنيات بين منتصفات الأضلاع
  const P = OPTS.map(([dx, dy]) => [OASIS.x + dx * k, OASIS.y + dy * k]), n = P.length, m = i => [(P[i % n][0] + P[(i + 1) % n][0]) / 2, (P[i % n][1] + P[(i + 1) % n][1]) / 2];
  c.beginPath(); c.moveTo(...m(0)); for (let i = 1; i <= n; i++) c.quadraticCurveTo(P[i % n][0], P[i % n][1], ...m(i)); c.closePath();
}
export function drawCaravanGround(ctx, t) {
  gateEWShadows(ctx, WALL6_Y, GATE6.x0, GATE6.x1);
  // كثبان: تلال رملية بوجه مضاء وظل ناعم
  DUNES.forEach(([x, y]) => { ctx.fillStyle = 'rgba(160,110,50,.13)'; ctx.beginPath(); ctx.ellipse(x + 10, y + 6, 66, 15, 0, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(255,240,200,.25)'; ctx.beginPath(); ctx.ellipse(x - 6, y - 2, 50, 10, 0, 0, 7); ctx.fill(); });
  // طريق القافلة: إسفلت بحافتين وخط متقطع
  ctx.fillStyle = shade(PAL.stone, -10); ctx.fillRect(0, 4874, 2930, 56);
  ctx.fillStyle = pattern(ctx, 'asphalt'); ctx.fillRect(0, 4880, 2930, 44);
  ctx.fillStyle = '#FFF4D6'; for (let x = 20; x < 2930; x += 90) ctx.fillRect(x, 4900, 44, 4);
  ctx.fillStyle = pattern(ctx, 'pavers'); ctx.fillRect(GATE6.x0 - 10, WALL6_Y + 12, GATE6.x1 - GATE6.x0 + 20, 70);   // ممر البوابة
  // المدرج
  ctx.fillStyle = shade(PAL.stone, -10); ctx.fillRect(1054, 4594, 372, 52);
  ctx.fillStyle = pattern(ctx, 'asphalt'); ctx.fillRect(1060, 4600, 360, 40);
  ctx.fillStyle = '#fff'; for (let x = 1090; x < 1390; x += 40) ctx.fillRect(x, 4618, 22, 4); [1064, 1404].forEach(x => { for (let k = 0; k < 5; k++) ctx.fillRect(x, 4604 + k * 7, 12, 3); });
  // الواحة: حافة عشبية، ماء بتدرج، وبريق يتحرك
  sprite(ctx, 'oasis', OASIS.x - 150, OASIS.y - 75, 300, 150, c => {
    c.fillStyle = PAL.leafDark; oasisPath(c, 1.22); c.fill(); c.fillStyle = pattern(c, 'grass'); oasisPath(c, 1.16); c.fill();
    c.fillStyle = '#C9B48E'; oasisPath(c, 1.04); c.fill();
    const g = c.createRadialGradient(OASIS.x, OASIS.y, 10, OASIS.x, OASIS.y, 120); g.addColorStop(0, '#1F7FB8'); g.addColorStop(1, '#4FB8E8'); c.fillStyle = g; oasisPath(c, 1); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 2; oasisPath(c, .97); c.stroke(); c.strokeStyle = INK; c.lineWidth = 1; oasisPath(c, 1.22); c.stroke();
  });
  ctx.fillStyle = 'rgba(255,255,255,.45)'; for (let i = 0; i < 5; i++) { const k = (t * .25 + i * .2) % 1; ctx.globalAlpha = Math.sin(k * Math.PI) * .8; ctx.fillRect(OASIS.x - 70 + i * 30 + k * 16, OASIS.y - 14 + (i % 3) * 12, 16, 2.5); } ctx.globalAlpha = 1;
  // ساحة محطة الوقود
  ctx.fillStyle = pattern(ctx, 'pavers'); rr(ctx, ST8.fuel.x - 140, 4740, 280, 90, 10); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1; rr(ctx, ST8.fuel.x - 140, 4740, 280, 90, 10); ctx.stroke();
  Object.values(ST8).forEach(s => kioskShadow(ctx, s));
  // رصيف الميناء: خرسانة بفواصل، خطوط صفراء للممرات، وحافة على الماء
  const P = PORT; ctx.fillStyle = '#B9B4A8'; ctx.fillRect(P.x, P.y, P.w, P.h);
  ctx.strokeStyle = 'rgba(70,65,60,.25)'; ctx.lineWidth = 1; for (let x = P.x; x < P.x + P.w; x += 60) { ctx.beginPath(); ctx.moveTo(x, P.y); ctx.lineTo(x, P.y + P.h); ctx.stroke(); } for (let y = P.y; y < P.y + P.h; y += 60) { ctx.beginPath(); ctx.moveTo(P.x, y); ctx.lineTo(P.x + P.w, y); ctx.stroke(); }
  ctx.fillStyle = '#E3B04B'; STACKS.forEach(([x, y]) => { ctx.fillRect(x - 6, y - 6, 162, 3); ctx.fillRect(x - 6, y + 77, 162, 3); });
  ctx.fillStyle = '#3D3A3A'; ctx.fillRect(P.x + P.w - 10, P.y, 10, P.h);
  PALMS.forEach(p => blobShadow(ctx, p.x, p.y, 22, 70));
  const px = 1180 + Math.sin(t / 3) * 4; ctx.fillStyle = 'rgba(40,30,20,.18)'; ctx.beginPath(); ctx.ellipse(px + 6, 4632, 46, 9, 0, 0, 7); ctx.fill();   // ظل الطائرة
}
export function caravanDrawables(open, t) {
  const out = [{ y: WALL6_Y + 12, draw: c => gateEW(c, 'caravangate', WALL6_Y, GATE6.x0, GATE6.x1, open, 'طريق القافلة') }];
  Object.entries(ST8).forEach(([k, s]) => out.push({ y: s.y - 32, draw: c => kiosk3d(c, k, s, GOODS[k]) }));
  out.push({ y: 4626, x: 1180, draw: c => plane(c, 1180 + Math.sin(t / 3) * 4, 4612) });
  if (!FLAGS.three) STACKS.forEach(([x, y, n, col], i) => out.push({ y: y + 74, draw: c => box3d(c, 'stack' + i, { x, y, w: 150, h: 74, H: 26 * n }, col, r => { r.fillStyle = col; r.fillRect(x, y - 26 * n, 150, 74); }, f => { f.fillStyle = col; f.fillRect(x, y + 74 - 26 * n, 150, 26 * n); f.fillStyle = 'rgba(0,0,0,.2)'; for (let k = x + 6; k < x + 150; k += 8) f.fillRect(k, y + 74 - 26 * n, 2, 26 * n); }) }));   // البديل ثنائي الأبعاد للحاويات
  PUMPS.forEach(x => out.push({ y: 4800, x, draw: c => pump(c, x, 4800) }));
  PALMS.forEach(p => out.push({ y: p.y, draw: c => palmCached(c, p.x, p.y, 1, false, t) }));
  OSHRUBS.forEach(([x, y]) => out.push({ y, draw: c => shrub(c, x, y, 12, false) }));
  return out;
}
function plane(c, x, y) {   // طائرة صغيرة متوقفة على المدرج (منظر علوي مائل)
  c.fillStyle = '#D9E2EA'; c.beginPath(); c.moveTo(x - 6, y); c.lineTo(x - 30, y - 38); c.lineTo(x - 18, y - 38); c.lineTo(x + 14, y); c.closePath(); c.fill(); c.strokeStyle = INK; c.lineWidth = .8; c.stroke();
  const g = c.createLinearGradient(0, y - 11, 0, y + 11); g.addColorStop(0, '#FFFFFF'); g.addColorStop(1, '#C9D3DC'); c.fillStyle = g; rr(c, x - 52, y - 10, 104, 20, 10); c.fill(); c.stroke();
  c.fillStyle = '#2F6FB2'; c.fillRect(x - 48, y - 2, 94, 4); c.fillStyle = '#3E5A66'; for (let k = 0; k < 6; k++) { c.beginPath(); c.arc(x - 26 + k * 10, y - 4, 1.8, 0, 7); c.fill(); }
  c.fillStyle = '#2A3F5F'; c.beginPath(); c.moveTo(x + 52, y - 4); c.quadraticCurveTo(x + 46, y - 9, x + 40, y - 8); c.lineTo(x + 40, y - 2); c.closePath(); c.fill();
  c.fillStyle = '#C0392B'; c.beginPath(); c.moveTo(x - 50, y - 6); c.lineTo(x - 60, y - 22); c.lineTo(x - 50, y - 22); c.lineTo(x - 40, y - 6); c.closePath(); c.fill(); c.strokeStyle = INK; c.stroke();
  c.fillStyle = '#BCC7D0'; c.beginPath(); c.moveTo(x - 6, y); c.lineTo(x - 30, y + 30); c.lineTo(x - 18, y + 30); c.lineTo(x + 14, y); c.closePath(); c.fill(); c.strokeStyle = INK; c.stroke();
}
function pump(c, x, y) {   // مضخة وقود: قاعدة، جسم بشاشة، وخرطوم
  c.fillStyle = PAL.stone; c.fillRect(x - 16, y - 6, 32, 8); c.strokeStyle = INK; c.lineWidth = .8; c.strokeRect(x - 16, y - 6, 32, 8);
  const g = c.createLinearGradient(x - 11, 0, x + 11, 0); g.addColorStop(0, '#E2564A'); g.addColorStop(1, '#A82F24'); c.fillStyle = g; rr(c, x - 11, y - 50, 22, 46, 4); c.fill(); c.stroke();
  c.fillStyle = '#E8F4F0'; c.fillRect(x - 7, y - 44, 14, 10); c.fillStyle = '#1FA05A'; c.fillRect(x - 5, y - 41, 10, 2); c.fillStyle = '#FFF'; c.fillRect(x - 11, y - 26, 22, 3);
  c.strokeStyle = '#2B2B2B'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 11, y - 30); c.quadraticCurveTo(x + 20, y - 18, x + 14, y - 8); c.stroke(); c.fillStyle = '#3D3A3A'; c.fillRect(x + 10, y - 34, 5, 8);
}
