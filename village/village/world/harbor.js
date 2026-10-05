// «الميناء»: منطقة الوحدة الثالثة (الهندسة) على البحر شرق السوق، تُفتح بإنهاء الوحدة الثانية
import { rr, shade } from '../core/util.js';
import { ar } from '../core/util.js';
export const GATE2_X = 2300, SEA_X = 2930;
export const PIER_Y = [305, 605, 905];
export const CRATES = { x: 2620, y: 452 };
export const FRAMES = { x: 2380, y: 96, w: 180, h: 112 }, FRAME_TABLE = { x: 2470, y: 282 };
export const GIFTS = { x: 2600, y: 96, w: 180, h: 112 }, GIFT_TABLE = { x: 2690, y: 282 };
export const BOATHOUSE = { x: 2380, y: 740, w: 200, h: 120 }, ROOF_TABLE = { x: 2480, y: 910 };
export const FISH = { x: 2960, y: 1000, cell: 40, n: 5 }, FISH_STAND = { x: 2900, y: 1120 };
export const POOL = { x: 2380, y: 1050, w: 170, h: 120 }, POOL_STAND = { x: 2465, y: 1206 };
export const MILL = { x: 2690, y: 1160 }, MILL_STAND = { x: 2690, y: 1222 };
export const BEACH = { ox: 2600, oy: 1560, u: 40, xr: 5, yr: 3 };

export function harborColliders(open) {
  const c = [
    { x: GATE2_X, y: 0, w: 12, h: 594 }, { x: GATE2_X, y: 686, w: 12, h: 1014 },
    { x: SEA_X, y: 0, w: 400, h: 6600 },   // البحر يمتد على الحافة الشرقية كلها فلا يُلتف حول الأسوار
    { x: FRAMES.x, y: FRAMES.y + 10, w: FRAMES.w, h: FRAMES.h - 6 }, { x: GIFTS.x, y: GIFTS.y + 10, w: GIFTS.w, h: GIFTS.h - 6 },
    { x: FRAME_TABLE.x - 30, y: FRAME_TABLE.y - 14, w: 60, h: 16 }, { x: GIFT_TABLE.x - 30, y: GIFT_TABLE.y - 14, w: 60, h: 16 },
    { x: BOATHOUSE.x, y: BOATHOUSE.y + 30, w: BOATHOUSE.w, h: BOATHOUSE.h - 30 }, { x: ROOF_TABLE.x - 30, y: ROOF_TABLE.y - 14, w: 60, h: 16 },
    { x: POOL.x, y: POOL.y, w: POOL.w, h: POOL.h }, { x: MILL.x - 22, y: MILL.y - 30, w: 44, h: 34 }
  ];
  if (!open) c.push({ x: GATE2_X - 4, y: 594, w: 20, h: 92 });
  return c;
}
export function drawHarborGround(ctx, t) {
  // الرمل الأفتح قرب البحر، ثم البحر بأمواجه
  ctx.fillStyle = '#F1E2B8'; ctx.fillRect(SEA_X - 140, 0, 140, 1700);
  ctx.fillStyle = '#2F8FD8'; ctx.fillRect(SEA_X, 1700, 400, 4900);
  ctx.fillStyle = '#2F8FD8'; ctx.fillRect(SEA_X, 0, 400, 1700);
  ctx.fillStyle = 'rgba(255,255,255,.22)';
  for (let y = 20; y < 6500; y += 46) for (let x = SEA_X + 20; x < 3200; x += 90) ctx.fillRect(x + ((t * 18 + y) % 40), y, 30, 3);
  ctx.fillStyle = 'rgba(255,255,255,.5)'; for (let y = 0; y < 6500; y += 24) ctx.fillRect(SEA_X - 4 + Math.sin(t * 2 + y) * 3, y, 6, 14);
  // الأرصفة
  PIER_Y.forEach(y => { ctx.fillStyle = '#9B6B3D'; ctx.fillRect(SEA_X - 30, y - 16, 120, 32); ctx.strokeStyle = '#6B4520'; ctx.lineWidth = 1.5; for (let x = SEA_X - 30; x < SEA_X + 90; x += 12) { ctx.beginPath(); ctx.moveTo(x, y - 16); ctx.lineTo(x, y + 16); ctx.stroke(); } });
  ctx.fillStyle = '#9B6B3D'; ctx.fillRect(SEA_X - 30, FISH_STAND.y - 14, 40, 28);
  // بركة المرايا
  ctx.fillStyle = '#7CC8F0'; rr(ctx, POOL.x, POOL.y, POOL.w, POOL.h, 16); ctx.fill();
  ctx.strokeStyle = '#B79F74'; ctx.lineWidth = 6; rr(ctx, POOL.x, POOL.y, POOL.w, POOL.h, 16); ctx.stroke();
  // شاطئ الإحداثيات: محوران وشبكة مرسومة على الرمل
  const B = BEACH;
  ctx.fillStyle = '#F4E6C2'; rr(ctx, B.ox - B.xr * B.u - 24, B.oy - B.yr * B.u - 24, (2 * B.xr) * B.u + 48, (2 * B.yr) * B.u + 48, 14); ctx.fill();
  ctx.strokeStyle = 'rgba(120,90,50,.28)'; ctx.lineWidth = 1;
  for (let i = -B.xr; i <= B.xr; i++) { ctx.beginPath(); ctx.moveTo(B.ox + i * B.u, B.oy - B.yr * B.u); ctx.lineTo(B.ox + i * B.u, B.oy + B.yr * B.u); ctx.stroke(); }
  for (let j = -B.yr; j <= B.yr; j++) { ctx.beginPath(); ctx.moveTo(B.ox - B.xr * B.u, B.oy + j * B.u); ctx.lineTo(B.ox + B.xr * B.u, B.oy + j * B.u); ctx.stroke(); }
  ctx.strokeStyle = '#7A4F2A'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(B.ox - B.xr * B.u - 14, B.oy); ctx.lineTo(B.ox + B.xr * B.u + 14, B.oy); ctx.moveTo(B.ox, B.oy + B.yr * B.u + 14); ctx.lineTo(B.ox, B.oy - B.yr * B.u - 14); ctx.stroke();
  ctx.fillStyle = '#7A4F2A'; ctx.font = '900 12px Cairo, sans-serif'; ctx.textAlign = 'center';
  for (let i = -B.xr; i <= B.xr; i++) if (i) ctx.fillText(i < 0 ? '−' + ar(-i) : ar(i), B.ox + i * B.u, B.oy + 16);
  for (let j = -B.yr; j <= B.yr; j++) if (j) ctx.fillText(j < 0 ? '−' + ar(-j) : ar(j), B.ox - 14, B.oy - j * B.u + 4);
  ctx.font = '900 14px Cairo, sans-serif'; ctx.fillText('س', B.ox + B.xr * B.u + 24, B.oy + 5); ctx.fillText('ص', B.ox, B.oy - B.yr * B.u - 22);
}
export function harborDrawables(open, t) {
  const out = [];
  out.push({ y: 700, draw: c => gateWall(c, open) });
  [[FRAMES, '#DDE6EE', 'ورشة الهياكل'], [GIFTS, '#F3D9E2', 'دكان الهدايا']].forEach(([b, wall, sign]) => out.push({ y: b.y + b.h, draw: c => building(c, b, wall, sign) }));
  [FRAME_TABLE, GIFT_TABLE, ROOF_TABLE].forEach(tb => out.push({ y: tb.y, draw: c => { c.fillStyle = '#8B5A2B'; rr(c, tb.x - 30, tb.y - 22, 60, 16, 3); c.fill(); c.fillStyle = '#6B4520'; c.fillRect(tb.x - 26, tb.y - 6, 5, 8); c.fillRect(tb.x + 21, tb.y - 6, 5, 8); } }));
  PIER_Y.forEach((y, i) => out.push({ y: y + 40, draw: c => ship(c, SEA_X + 120, y + 10, ['#C0392B', '#2F6FB2', '#2E8B57'][i]) }));
  out.push({ y: CRATES.y, draw: c => { c.fillStyle = '#C9B48E'; rr(c, CRATES.x - 40, CRATES.y - 12, 80, 22, 6); c.fill(); } });
  return out;
}
export function ship(c, x, y, col) {
  c.fillStyle = 'rgba(0,30,60,.25)'; c.beginPath(); c.ellipse(x, y + 6, 70, 14, 0, 0, 7); c.fill();
  c.fillStyle = col; c.beginPath(); c.moveTo(x - 70, y - 24); c.lineTo(x + 70, y - 24); c.lineTo(x + 54, y + 6); c.lineTo(x - 54, y + 6); c.closePath(); c.fill();
  c.fillStyle = '#F4F1E8'; c.fillRect(x - 70, y - 30, 140, 7);
  c.fillStyle = '#7D5A36'; c.fillRect(x + 20, y - 92, 4, 64);
  c.fillStyle = '#F4F1E8'; c.beginPath(); c.moveTo(x + 24, y - 90); c.lineTo(x + 24, y - 36); c.lineTo(x + 62, y - 40); c.closePath(); c.fill();
}
function building(c, b, wall, sign) {
  const fh = 34, rh = b.h - fh;
  c.fillStyle = 'rgba(60,35,10,.16)'; c.fillRect(b.x + 6, b.y + b.h - 2, b.w, 8);
  c.fillStyle = shade(wall, -22); c.fillRect(b.x, b.y + rh, b.w, fh);
  c.fillStyle = shade(wall, 10); c.fillRect(b.x, b.y, b.w, rh);
  c.fillStyle = '#5E6B78'; rr(c, b.x + b.w / 2 - 14, b.y + rh + 6, 28, fh - 6, 6); c.fill();
  c.fillStyle = '#FFFDF6'; rr(c, b.x + b.w / 2 - 54, b.y + 16, 108, 24, 6); c.fill();
  c.fillStyle = '#5B4636'; c.font = '900 13px Cairo, sans-serif'; c.textAlign = 'center'; c.fillText(sign, b.x + b.w / 2, b.y + 33);
}
function gateWall(c, open) {
  const X = GATE2_X;
  c.fillStyle = '#C9B48E';
  [[0, 594], [686, 1700]].forEach(([a, b]) => { c.fillRect(X, a, 12, b - a); for (let y = a; y < b; y += 18) c.fillRect(X - 3, y, 18, 8); });
  c.fillStyle = '#B79F74'; c.fillRect(X - 6, 560, 24, 40); c.fillRect(X - 6, 680, 24, 40);
  c.fillStyle = '#FFFDF6'; rr(c, X - 62, 520, 136, 26, 7); c.fill();
  c.fillStyle = '#5B4636'; c.font = '900 14px Cairo, sans-serif'; c.textAlign = 'center'; c.fillText(open ? 'الميناء ←' : 'الميناء 🔒', X + 6, 538);
  if (!open) { for (let i = 0; i < 6; i++) { c.fillStyle = i % 2 ? '#fff' : '#E2475C'; c.fillRect(X - 2, 600 + i * 14, 16, 14); } }
  else { c.save(); c.translate(X + 6, 600); c.rotate(-1.2); for (let i = 0; i < 6; i++) { c.fillStyle = i % 2 ? '#fff' : '#E2475C'; c.fillRect(-4, -i * 14, 8, 14); } c.restore(); }
}
