// «ساحة المهرجان»: منطقة الفصل الدراسي الثاني جنوب القلعة، تُفتح بإنهاء الفصل الأول
import { rr, shade, ar } from '../core/util.js';
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
    ...PALMS6.map(p => ({ x: p.x - 8, y: p.y - 8, w: 16, h: 10 }))
  ];
  if (!open) c.push({ x: GATE4.x0, y: WALL4_Y - 4, w: GATE4.x1 - GATE4.x0, h: 20 });
  return c;
}
export function drawFestivalGround(ctx, t) {
  ctx.fillStyle = '#F0DFB6'; ctx.fillRect(0, WALL4_Y, 2930, 900);
  ctx.fillStyle = '#E6D09C'; for (let x = 40; x < 2900; x += 120) for (let y = WALL4_Y + 40; y < 3480; y += 120) { ctx.beginPath(); ctx.arc(x + ((y / 120) % 2) * 60, y, 3, 0, 7); ctx.fill(); }
  ctx.fillStyle = '#C9B48E'; rr(ctx, GATE4.x0 - 30, WALL4_Y + 12, GATE4.x1 - GATE4.x0 + 60, 60, 8); ctx.fill();
  // حبال الزينة
  for (let k = 0; k < 4; k++) { const y0 = 2640 + k * 0, x0 = 120 + k * 720; ctx.strokeStyle = '#8B5A2B'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(x0 + 300, y0 + 40, x0 + 600, y0); ctx.stroke();
    for (let i = 1; i < 10; i++) { const x = x0 + i * 60, y = y0 + 40 * (1 - Math.pow((i - 5) / 5, 2)) * .9; ctx.fillStyle = ['#E85D75', '#FFC23D', '#1FC8B5', '#9C6BFF'][i % 4]; ctx.beginPath(); ctx.moveTo(x - 7, y); ctx.lineTo(x + 7, y); ctx.lineTo(x, y + 12); ctx.fill(); } }
  // الحقل الدائري (المخطط الدائري)
  ctx.fillStyle = '#B98B5E'; ctx.beginPath(); ctx.arc(PIEFIELD.x, PIEFIELD.y, PIEFIELD.r, 0, 7); ctx.fill(); ctx.strokeStyle = '#8B6A43'; ctx.lineWidth = 3; ctx.stroke();
  // أرض بيت الضيافة: شبكة أمتار
  const G = GUEST; ctx.fillStyle = '#D9C49A'; rr(ctx, G.x, G.y, G.w, G.h, 10); ctx.fill();
  ctx.strokeStyle = 'rgba(90,60,30,.18)'; ctx.lineWidth = 1; for (let x = G.x; x <= G.x + G.w; x += 20) { ctx.beginPath(); ctx.moveTo(x, G.y); ctx.lineTo(x, G.y + G.h); ctx.stroke(); } for (let y = G.y; y <= G.y + G.h; y += 20) { ctx.beginPath(); ctx.moveTo(G.x, y); ctx.lineTo(G.x + G.w, y); ctx.stroke(); }
}
export function festivalDrawables(open, t) {
  const out = [{ y: WALL4_Y + 12, draw: c => wall(c, open) }];
  out.push({ y: KITCHEN.y + KITCHEN.h, draw: c => building(c, KITCHEN, '#F3D9C6', 'مطبخ المهرجان', t) });
  out.push({ y: CALLS.y + CALLS.h, draw: c => { building(c, CALLS, '#DCE6F0', 'مركز الاتصالات', t); for (let i = 0; i < 4; i++) { const x = CALLS.x + 50 + i * 66, y = CALLS.y + 62; c.fillStyle = '#FFFDF6'; c.beginPath(); c.arc(x, y, 13, 0, 7); c.fill(); c.strokeStyle = '#2A1B66'; c.lineWidth = 2; c.stroke(); c.beginPath(); c.moveTo(x, y); c.lineTo(x + 7 * Math.cos(t / 3 + i * 2), y + 7 * Math.sin(t / 3 + i * 2)); c.moveTo(x, y); c.lineTo(x, y - 9); c.stroke(); } } });
  out.push({ y: TOWER.y, draw: c => { const x = TOWER.x, y = TOWER.y; c.fillStyle = '#D2B47E'; c.fillRect(x - 32, y - 200, 64, 200); c.fillStyle = shade('#D2B47E', 12); c.beginPath(); c.moveTo(x - 40, y - 200); c.lineTo(x, y - 250); c.lineTo(x + 40, y - 200); c.fill();
    c.fillStyle = '#FFFDF6'; c.beginPath(); c.arc(x, y - 160, 24, 0, 7); c.fill(); c.strokeStyle = '#2A1B66'; c.lineWidth = 3; c.stroke(); c.beginPath(); c.moveTo(x, y - 160); c.lineTo(x + 14 * Math.cos(t / 2), y - 160 + 14 * Math.sin(t / 2)); c.moveTo(x, y - 160); c.lineTo(x, y - 176); c.stroke();
    c.fillStyle = '#7A4F2A'; rr(c, x - 14, y - 44, 28, 44, 10); c.fill(); } });
  [[ST6.graph, 'لوح الرحلة'], [ST6.survey, 'لوح الاستبيان']].forEach(([s, t2]) => out.push({ y: s.y - 50, draw: c => { c.fillStyle = '#7D5A36'; c.fillRect(s.x - 44, s.y - 52, 5, 36); c.fillRect(s.x + 39, s.y - 52, 5, 36); c.fillStyle = '#2F4F3F'; rr(c, s.x - 50, s.y - 104, 100, 56, 6); c.fill();
    c.strokeStyle = '#fff'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(s.x - 38, s.y - 58); c.lineTo(s.x - 38, s.y - 96); c.moveTo(s.x - 38, s.y - 58); c.lineTo(s.x + 40, s.y - 58); c.stroke();
    if (t2 === 'لوح الرحلة') { c.strokeStyle = '#FFC23D'; c.beginPath(); c.moveTo(s.x - 38, s.y - 58); c.lineTo(s.x + 34, s.y - 92); c.stroke(); } else { c.fillStyle = '#FFC23D'; [16, 28, 10].forEach((h, i) => c.fillRect(s.x - 28 + i * 22, s.y - 58 - h, 14, h)); }
    c.fillStyle = '#FFFDF6'; rr(c, s.x - 42, s.y - 128, 84, 20, 5); c.fill(); c.fillStyle = '#5B4636'; c.font = '900 11px Cairo, sans-serif'; c.textAlign = 'center'; c.fillText(t2, s.x, s.y - 114); } }));
  out.push({ y: ST6.spinner.y - 50, draw: c => { const s = ST6.spinner; c.fillStyle = '#9B6B3D'; c.fillRect(s.x - 56, s.y - 120, 6, 70); c.fillRect(s.x + 50, s.y - 120, 6, 70);
    for (let k = 0; k < 7; k++) { c.fillStyle = k % 2 ? '#F4E3B8' : '#E85D75'; c.fillRect(s.x - 62 + k * 17.7, s.y - 136, 17.7, 18); }
    c.save(); c.translate(s.x, s.y - 86); c.rotate(t * .8); for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#2F6FB2' : '#E2475C'; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 26, i * Math.PI / 4, (i + 1) * Math.PI / 4); c.fill(); } c.restore();
    c.fillStyle = '#2A1B66'; c.beginPath(); c.moveTo(s.x, s.y - 112); c.lineTo(s.x - 5, s.y - 122); c.lineTo(s.x + 5, s.y - 122); c.fill(); c.fillStyle = '#B07A3B'; rr(c, s.x - 50, s.y - 56, 100, 16, 3); c.fill(); } });
  PALMS6.forEach(p => out.push({ y: p.y, draw: c => { c.fillStyle = '#8D6238'; for (let i = 0; i < 6; i++) { c.beginPath(); c.ellipse(p.x, p.y - 4 - i * 7, 4.5, 4, 0, 0, 7); c.fill(); } c.strokeStyle = '#2E8B47'; c.lineWidth = 5; c.lineCap = 'round'; for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * .55; c.beginPath(); c.moveTo(p.x, p.y - 44); c.quadraticCurveTo(p.x + Math.cos(a) * 14, p.y - 50 + Math.sin(a) * 14, p.x + Math.cos(a) * 24, p.y - 40 + Math.sin(a) * 16); c.stroke(); } c.fillStyle = '#C46A1E'; c.beginPath(); c.arc(p.x - 3, p.y - 42, 2.5, 0, 7); c.arc(p.x + 3, p.y - 41, 2.5, 0, 7); c.fill(); } }));
  [ST5.scale, ST5.recipe].forEach(s => out.push({ y: s.y - 20, draw: c => { c.fillStyle = '#8B5A2B'; rr(c, s.x - 30, s.y - 40, 60, 16, 3); c.fill(); c.fillStyle = '#6B4520'; c.fillRect(s.x - 26, s.y - 24, 5, 8); c.fillRect(s.x + 21, s.y - 24, 5, 8); } }));
  return out;
}
function building(c, b, wall, sign, t) {
  const fh = 36, rh = b.h - fh;
  c.fillStyle = 'rgba(60,35,10,.16)'; c.fillRect(b.x + 6, b.y + b.h - 2, b.w, 8);
  c.fillStyle = shade(wall, -22); c.fillRect(b.x, b.y + rh, b.w, fh); c.fillStyle = shade(wall, 12); c.fillRect(b.x, b.y, b.w, rh);
  c.fillStyle = '#7A4F2A'; rr(c, b.x + b.w / 2 - 16, b.y + rh + 6, 32, fh - 6, 8); c.fill();
  c.fillStyle = '#FFFDF6'; rr(c, b.x + b.w / 2 - 60, b.y + 14, 120, 24, 6); c.fill(); c.fillStyle = '#5B4636'; c.font = '900 13px Cairo, sans-serif'; c.textAlign = 'center'; c.fillText(sign, b.x + b.w / 2, b.y + 31);
  if (sign === 'مطبخ المهرجان') { c.fillStyle = 'rgba(255,255,255,.55)'; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(b.x + b.w - 40 + Math.sin(t + i) * 4, b.y - 10 - ((t * 20 + i * 14) % 40), 6 + i * 2, 0, 7); c.fill(); } }
}
function wall(c, open) {
  c.fillStyle = '#C9B48E';
  [[0, GATE4.x0], [GATE4.x1, 2930]].forEach(([a, b]) => { c.fillRect(a, WALL4_Y, b - a, 12); for (let x = a; x < b; x += 18) c.fillRect(x, WALL4_Y - 4, 8, 18); });
  c.fillStyle = '#B79F74'; c.fillRect(GATE4.x0 - 20, WALL4_Y - 30, 24, 44); c.fillRect(GATE4.x1 - 4, WALL4_Y - 30, 24, 44);
  c.fillStyle = '#FFFDF6'; rr(c, (GATE4.x0 + GATE4.x1) / 2 - 70, WALL4_Y - 64, 140, 26, 7); c.fill();
  c.fillStyle = '#5B4636'; c.font = '900 14px Cairo, sans-serif'; c.textAlign = 'center'; c.fillText(open ? 'ساحة المهرجان ↓' : 'ساحة المهرجان 🔒', (GATE4.x0 + GATE4.x1) / 2, WALL4_Y - 46);
  if (!open) for (let i = 0; i < 7; i++) { c.fillStyle = i % 2 ? '#fff' : '#E2475C'; c.fillRect(GATE4.x0 + i * 14.3, WALL4_Y - 2, 14.3, 14); }
}
