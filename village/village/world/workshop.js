// «ورشة البنّاء»: منطقة الوحدة الأخيرة (الهندسة) جنوب طريق القافلة، ومنصة التخرّج بعد الدروس الـ٦٩
// الرسم بأسلوب القرية: ساحة ببلاط مزخرف، أكشاك مجسّمة، ومنصة خشبية بخلفية ولافتة وزينة
import { rr, shade } from '../core/util.js';
import { FLAGS, INK, PAL, pattern, kiosk3d, kioskShadow, gateEW, gateEWShadows, palmCached, blobShadow, boxShadow, box3d, lanternString, elev, shrub, workTable, solid } from './art.js';
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
  c.push(...PALMS.map(p => solid.trunk(p.x, p.y)), ...POLES.map(([x, y]) => solid.post(x, y)), ...WSHRUBS.map(([x, y]) => solid.shrub(x, y)), ...TABLES.map(([x, y]) => solid.table(x, y)));
  if (!open) c.push({ x: GATE7.x0, y: WALL7_Y - 4, w: GATE7.x1 - GATE7.x0, h: 20 });
  return c;
}
const GOODS = { tiles: ['#2F6FB2', '#F2E6C9', '#7CA6C8'], flag: ['#C0392B', '#F4F1E8', '#2E8B57'], protractor: ['#E3B04B', '#A9B4BF', '#5E6874'], crates: ['#8B5A2B', '#C9A06A', '#6E4524'], crystals: ['#B794F4', '#7CC8F0', '#7B3F98'] };
const COURT = { x: 260, y: 5610, w: 1960, h: 260 };
const PALMS = [{ x: 150, y: 5700 }, { x: 2350, y: 5700 }, { x: 2600, y: 6000 }, { x: 900, y: 6250 }, { x: 1580, y: 6250 }, { x: 300, y: 6200 }, { x: 2200, y: 6300 }];
export const ST = { x: STAGE.x - 160, y: STAGE.y - 70, w: 320, h: 60, H: 24 };
export const POLES = [[STAGE.x - 330, 6120], [STAGE.x + 330, 6120]];
const WSHRUBS = [[STAGE.x - 200, 6200], [STAGE.x + 200, 6200], [COURT.x - 30, 5900], [COURT.x + COURT.w + 30, 5900]];
export const TABLES = [[1000, 5960, 'roof'], [1480, 5960, 'frames']];
export function drawWorkshopGround(ctx) {
  gateEWShadows(ctx, WALL7_Y, GATE7.x0, GATE7.x1);
  // ساحة الورشة: بلاط بنقش معيّنات داخل إطار حجري
  const C = COURT; ctx.fillStyle = shade(PAL.stone, -16); rr(ctx, C.x - 6, C.y - 2, C.w + 12, C.h + 10, 16); ctx.fill();
  ctx.fillStyle = pattern(ctx, 'pavers'); rr(ctx, C.x, C.y - 6, C.w, C.h + 6, 14); ctx.fill();
  ctx.strokeStyle = 'rgba(184,97,62,.28)'; ctx.lineWidth = 1.2;
  for (let x = C.x + 40; x < C.x + C.w - 40; x += 120) { const y = C.y + C.h / 2 + 30; ctx.beginPath(); ctx.moveTo(x, y - 22); ctx.lineTo(x + 30, y); ctx.lineTo(x, y + 22); ctx.lineTo(x - 30, y); ctx.closePath(); ctx.stroke(); }
  ctx.strokeStyle = INK; ctx.lineWidth = 1; rr(ctx, C.x, C.y - 6, C.w, C.h + 6, 14); ctx.stroke();
  ctx.fillStyle = pattern(ctx, 'pavers'); ctx.fillRect(GATE7.x0 - 10, WALL7_Y + 12, GATE7.x1 - GATE7.x0 + 20, C.y - WALL7_Y - 12);   // ممر البوابة
  // سجادة حمراء من الساحة إلى منصة التخرّج
  ctx.fillStyle = '#8E2A22'; ctx.fillRect(STAGE.x - 34, C.y + C.h, 68, STAGE.y - 10 - C.y - C.h + 10); ctx.fillStyle = '#B8413A'; ctx.fillRect(STAGE.x - 28, C.y + C.h, 56, STAGE.y - 10 - C.y - C.h + 10);
  ctx.fillStyle = '#E3B04B'; ctx.fillRect(STAGE.x - 28, C.y + C.h, 3, STAGE.y - C.y - C.h); ctx.fillRect(STAGE.x + 25, C.y + C.h, 3, STAGE.y - C.y - C.h);
  Object.values(ST9).forEach(s => kioskShadow(ctx, s));
  boxShadow(ctx, ST.x, ST.y, ST.w, ST.h, ST.H + 60);
  PALMS.forEach(p => blobShadow(ctx, p.x, p.y, 22, 70));
}
export function workshopDrawables(open, t, allDone) {
  const out = FLAGS.three ? [] : [{ y: WALL7_Y + 12, draw: c => gateEW(c, 'workgate', WALL7_Y, GATE7.x0, GATE7.x1, open, 'ورشة البنّاء') }];   // في 3D: البوابة مجسّمة
  if (!FLAGS.three) Object.entries(ST9).forEach(([k, s]) => out.push({ y: s.y - 32, draw: c => kiosk3d(c, k, s, GOODS[k]) }));
  if (!FLAGS.three) out.push({ y: STAGE.y - 10, draw: c => stage(c, t, allDone) });
  if (!FLAGS.three) PALMS.forEach(p => out.push({ y: p.y, draw: c => palmCached(c, p.x, p.y, 1, false, t) }));
  if (!FLAGS.three) POLES.forEach(([x, y]) => out.push({ y, x, draw: c => { c.fillStyle = PAL.wood; c.fillRect(x - 2, y - 90, 4, 90); c.strokeStyle = INK; c.lineWidth = .7; c.strokeRect(x - 2, y - 90, 4, 90); } }));
  if (!FLAGS.three) out.push({ y: STAGE.y + 1, draw: c => { const [a, b] = POLES; lanternString(c, elev(a[0], a[1], 90), elev(STAGE.x - 146, ST.y, ST.H + 120), 22, 6, t); lanternString(c, elev(STAGE.x + 146, ST.y, ST.H + 120), elev(b[0], b[1], 90), 22, 6, t); } });
  if (!FLAGS.three) WSHRUBS.forEach(([x, y]) => out.push({ y, draw: c => shrub(c, x, y, 14, true) }));
  if (!FLAGS.three) TABLES.forEach(([x, y, k]) => out.push({ y, x, draw: c => workTable(c, x, y, k) }));
  return out;
}
function stage(c, t, allDone) {   // منصة التخرّج: خشب مجسّم، خلفية بقائمين ولافتة، وقصاصات احتفال عند إكمال الدروس
  const x = STAGE.x, y = STAGE.y, ry = ST.y - ST.H;
  box3d(c, 'stage' + (allDone ? '|done' : ''), ST, '#8B5A2B', r => {
    r.fillStyle = '#A9743F'; r.fillRect(ST.x, ry, ST.w, ST.h); r.strokeStyle = 'rgba(70,40,15,.35)'; r.lineWidth = .8; for (let yy = ry + 8; yy < ry + ST.h; yy += 8) { r.beginPath(); r.moveTo(ST.x, yy); r.lineTo(ST.x + ST.w, yy); r.stroke(); }
    r.strokeStyle = INK; r.lineWidth = 1; r.strokeRect(ST.x, ry, ST.w, ST.h);
    // الخلفية: قائمان ولوح عريض بقوس عُماني
    r.fillStyle = PAL.wood; r.fillRect(x - 150, ry - 120, 8, 124); r.fillRect(x + 142, ry - 120, 8, 124);
    r.fillStyle = allDone ? '#1F7A4A' : '#3F4C59'; r.beginPath(); r.moveTo(x - 150, ry - 70); r.lineTo(x - 150, ry - 128); r.quadraticCurveTo(x, ry - 168, x + 150, ry - 128); r.lineTo(x + 150, ry - 70); r.closePath(); r.fill(); r.strokeStyle = '#E3B04B'; r.lineWidth = 2; r.stroke();
    r.fillStyle = '#fff'; r.font = '900 15px Cairo, sans-serif'; r.textAlign = 'center'; r.direction = 'rtl'; r.fillText(allDone ? '🎓 مبارك! أكملتَ الدروس الـ٦٩' : 'منصة التخرّج — تنتظر بطل الدروس كلها', x, ry - 100);
    r.strokeStyle = INK; r.lineWidth = 1; r.strokeRect(x - 150, ry - 120, 8, 124); r.strokeRect(x + 142, ry - 120, 8, 124);
  }, f => {
    const yb = ST.y + ST.h, g = f.createLinearGradient(0, yb - ST.H, 0, yb); g.addColorStop(0, '#9C6438'); g.addColorStop(1, '#6E4524'); f.fillStyle = g; f.fillRect(ST.x, yb - ST.H, ST.w, ST.H);
    f.fillStyle = '#8E2A22'; for (let k = 0; k < 16; k++) { f.beginPath(); f.moveTo(ST.x + k * 20, yb - ST.H); f.lineTo(ST.x + (k + 1) * 20, yb - ST.H); f.quadraticCurveTo(ST.x + k * 20 + 10, yb - ST.H + 14, ST.x + k * 20, yb - ST.H); f.fill(); }
    f.fillStyle = '#A9743F'; f.fillRect(x - 40, yb - 12, 80, 6); f.fillRect(x - 46, yb - 6, 92, 6);   // درجات
    f.strokeStyle = INK; f.lineWidth = 1.1; f.strokeRect(ST.x, yb - ST.H, ST.w, ST.H);
  }, 180);
  if (allDone) for (let i = 0; i < 24; i++) { const a = i * 2.39 + t, r = 30 + ((t * 40 + i * 13) % 90); c.fillStyle = ['#E85D75', '#FFC23D', '#1FC8B5', '#9C6BFF'][i % 4]; c.fillRect(x + Math.cos(a) * r * 1.6, y - 260 + Math.sin(a) * r * .6, 6, 6); }
}

export const R3D = { kiosks: Object.entries(ST9).map(([k, s]) => Object.assign({ goods: GOODS[k] }, s)), palms: PALMS, shrubs: WSHRUBS.map(([x, y]) => [x, y, '#D9478C', 14]), gateEW: [WALL7_Y, GATE7.x0, GATE7.x1, 'ورشة البنّاء'] };
