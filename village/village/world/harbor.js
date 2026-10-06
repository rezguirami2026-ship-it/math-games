// «الميناء»: منطقة الوحدة الثالثة (الهندسة) على البحر شرق السوق، تُفتح بإنهاء الوحدة الثانية
// الرسم بأسلوب القرية (world/art.js): بحر بعمق وأمواج، أرصفة خشبية، سفن داو عُمانية، مبانٍ مجسّمة، وشاطئ الإحداثيات
import { rr, shade, ar } from '../core/util.js';
import { FLAGS, INK, PAL, SUN, pattern, sprite, boxShadow, blobShadow, building3d, palmCached, gateNS, wallNSItems, gateNSShadows, workTable, signboard, box3d, solid } from './art.js';
import { crate3d } from './entities.js';
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
    { x: POOL.x, y: POOL.y, w: POOL.w, h: POOL.h }, { x: MILL.x - 22, y: MILL.y - 30, w: 44, h: 34 },
    ...PALMS_H.map(p => solid.trunk(p.x, p.y))
  ];
  if (!open) c.push({ x: GATE2_X - 4, y: 594, w: 20, h: 92 });
  return c;
}
const H_B = 88, LIGHTHOUSE = { x: 2848, y: 40, s: 34, H: 150 };
const PALMS_H = [{ x: 2860, y: 230 }, { x: 2870, y: 760 }, { x: 2350, y: 470 }, { x: 2850, y: 1420 }, { x: 2360, y: 1330 }];
export const SHIP_COLS = ['#C0392B', '#2F6FB2', '#2E8B57'];   // ألوان السفن جزء من درس تمييز الأشكال (الحمراء للمثلثات...)

export function drawHarborGround(ctx, t) {
  gateNSShadows(ctx, GATE2_X);
  // الرمل الرطب قرب البحر يغمق تدريجياً
  const sg = ctx.createLinearGradient(SEA_X - 150, 0, SEA_X, 0); sg.addColorStop(0, 'rgba(240,226,184,0)'); sg.addColorStop(.6, 'rgba(240,226,184,.9)'); sg.addColorStop(1, '#C9B183');
  ctx.fillStyle = sg; ctx.fillRect(SEA_X - 150, 0, 150, 6600);
  // البحر: ضحل فيروزي عند الشاطئ ثم أزرق عميق، بأمواج تتحرك
  const wg = ctx.createLinearGradient(SEA_X, 0, SEA_X + 270, 0); wg.addColorStop(0, '#46B7C9'); wg.addColorStop(.35, '#2B8FC2'); wg.addColorStop(1, '#1D5F99');
  ctx.fillStyle = wg; ctx.fillRect(SEA_X, 0, 400, 6600);
  ctx.strokeStyle = 'rgba(255,255,255,.28)'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
  for (let y = 20; y < 6500; y += 46) for (let x = SEA_X + 28; x < 3200; x += 90) { const o = (t * 18 + y) % 40, xx = x + o; ctx.beginPath(); ctx.moveTo(xx, y); ctx.quadraticCurveTo(xx + 10, y - 4, xx + 22, y); ctx.stroke(); }
  // زبد الموج على الشاطئ
  ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.beginPath(); ctx.moveTo(SEA_X - 6, 0);
  for (let y = 0; y <= 6600; y += 30) ctx.lineTo(SEA_X - 4 + Math.sin(t * 1.8 + y * .05) * 4, y);
  ctx.lineTo(SEA_X + 6, 6600); for (let y = 6600; y >= 0; y -= 30) ctx.lineTo(SEA_X + 7 + Math.sin(t * 1.8 + y * .05 + 1) * 3, y); ctx.closePath(); ctx.fill();
  // الأرصفة الخشبية: ألواح وحافة أمامية وأعمدة في الماء
  PIER_Y.forEach((y, i) => sprite(ctx, 'pier' + i, SEA_X - 40, y - 24, 140, 56, c => pier(c, SEA_X - 34, y - 16, 124, 32)));
  sprite(ctx, 'pier-fish', FISH_STAND.x - 4, FISH_STAND.y - 22, 64, 48, c => pier(c, SEA_X - 32, FISH_STAND.y - 14, 44, 28));
  // بركة المرايا: إطار حجري مرتفع وماء صافٍ
  sprite(ctx, 'pool', POOL.x - 10, POOL.y - 10, POOL.w + 20, POOL.h + 26, c => {
    c.fillStyle = shade(PAL.stone, -28); rr(c, POOL.x - 6, POOL.y - 2, POOL.w + 12, POOL.h + 12, 18); c.fill();
    c.fillStyle = PAL.stone; rr(c, POOL.x - 6, POOL.y - 6, POOL.w + 12, POOL.h + 12, 18); c.fill();
    const g = c.createLinearGradient(POOL.x, POOL.y, POOL.x + POOL.w, POOL.y + POOL.h); g.addColorStop(0, '#9ED8F0'); g.addColorStop(1, '#3E9CC9');
    c.fillStyle = g; rr(c, POOL.x + 2, POOL.y + 2, POOL.w - 4, POOL.h - 4, 14); c.fill();
    c.fillStyle = 'rgba(255,255,255,.3)'; c.beginPath(); c.ellipse(POOL.x + 50, POOL.y + 30, 34, 8, -.2, 0, 7); c.fill();
    c.strokeStyle = INK; c.lineWidth = 1; rr(c, POOL.x - 6, POOL.y - 6, POOL.w + 12, POOL.h + 12, 18); c.stroke();
  });
  // شاطئ الإحداثيات: رمل مدكوك، شبكة (جزء من رياضيات الدرس)، ومحوران من حبال بين أوتاد
  const B = BEACH, X0 = B.ox - B.xr * B.u, Y0 = B.oy - B.yr * B.u, GW = 2 * B.xr * B.u, GH = 2 * B.yr * B.u;
  sprite(ctx, 'beach', X0 - 50, Y0 - 50, GW + 100, GH + 100, c => {
    c.fillStyle = '#EAD9AE'; rr(c, X0 - 26, Y0 - 26, GW + 52, GH + 52, 16); c.fill();
    c.fillStyle = pattern(c, 'sand'); c.globalAlpha = .5; rr(c, X0 - 26, Y0 - 26, GW + 52, GH + 52, 16); c.fill(); c.globalAlpha = 1;
    c.strokeStyle = 'rgba(120,90,50,.3)'; c.lineWidth = 1;
    for (let i = -B.xr; i <= B.xr; i++) { c.beginPath(); c.moveTo(B.ox + i * B.u, Y0); c.lineTo(B.ox + i * B.u, Y0 + GH); c.stroke(); }
    for (let j = -B.yr; j <= B.yr; j++) { c.beginPath(); c.moveTo(X0, B.oy + j * B.u); c.lineTo(X0 + GW, B.oy + j * B.u); c.stroke(); }
    const rope = (x1, y1, x2, y2) => { c.strokeStyle = '#6E4A2E'; c.lineWidth = 3.2; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); c.strokeStyle = '#B08350'; c.lineWidth = 1.4; c.setLineDash([3, 3]); c.stroke(); c.setLineDash([]); };
    rope(X0 - 14, B.oy, X0 + GW + 14, B.oy); rope(B.ox, Y0 + GH + 14, B.ox, Y0 - 14);
    [[X0 - 16, B.oy], [X0 + GW + 16, B.oy], [B.ox, Y0 - 16], [B.ox, Y0 + GH + 16]].forEach(([x, y]) => { c.fillStyle = PAL.wood; c.fillRect(x - 2.5, y - 10, 5, 12); c.fillStyle = PAL.woodLight; c.fillRect(x - 2.5, y - 10, 5, 2); });
    c.fillStyle = '#6E4A2E'; c.font = '900 12px Cairo, sans-serif'; c.textAlign = 'center';
    for (let i = -B.xr; i <= B.xr; i++) if (i) c.fillText(i < 0 ? '−' + ar(-i) : ar(i), B.ox + i * B.u, B.oy + 17);
    for (let j = -B.yr; j <= B.yr; j++) if (j) c.fillText(j < 0 ? '−' + ar(-j) : ar(j), B.ox - 15, B.oy - j * B.u + 4);
    c.font = '900 15px Cairo, sans-serif'; c.fillText('س', X0 + GW + 30, B.oy + 5); c.fillText('ص', B.ox, Y0 - 28);
  });
  // ساحة الشحن أمام الصناديق
  sprite(ctx, 'dock', CRATES.x - 70, CRATES.y - 34, 140, 56, c => { c.fillStyle = '#CFC3AC'; rr(c, CRATES.x - 62, CRATES.y - 26, 124, 44, 6); c.fill(); c.strokeStyle = 'rgba(110,100,85,.35)'; c.lineWidth = 1; for (let x = CRATES.x - 50; x < CRATES.x + 60; x += 24) { c.beginPath(); c.moveTo(x, CRATES.y - 26); c.lineTo(x, CRATES.y + 18); c.stroke(); } });
  [FRAMES, GIFTS].forEach(b => boxShadow(ctx, b.x, b.y, b.w, b.h, H_B));
  boxShadow(ctx, LIGHTHOUSE.x, LIGHTHOUSE.y, LIGHTHOUSE.s, LIGHTHOUSE.s, LIGHTHOUSE.H);
  PALMS_H.forEach(p => blobShadow(ctx, p.x, p.y, 26, 80));
}
function pier(c, x, y, w, h) {   // رصيف خشبي: أعمدة في الماء، وجه أمامي، وألواح بفواصل
  c.fillStyle = '#4E3420'; for (let px = x + 6; px < x + w; px += 26) c.fillRect(px, y + h, 5, 14);
  c.fillStyle = 'rgba(255,255,255,.35)'; for (let px = x + 6; px < x + w; px += 26) c.fillRect(px - 2, y + h + 12, 9, 2);
  c.fillStyle = '#7A4F2C'; c.fillRect(x, y + h, w, 6);
  c.fillStyle = '#A9763F'; c.fillRect(x, y, w, h);
  c.strokeStyle = 'rgba(60,35,15,.45)'; c.lineWidth = 1; for (let px = x + 12; px < x + w; px += 12) { c.beginPath(); c.moveTo(px, y); c.lineTo(px, y + h); c.stroke(); }
  c.fillStyle = 'rgba(255,240,200,.18)'; c.fillRect(x, y, w, 3);
  c.strokeStyle = INK; c.lineWidth = 1; c.strokeRect(x, y, w, h + 6);
  c.fillStyle = '#3D3A3A'; [x + w - 8, x + 8].forEach(px => { c.beginPath(); c.arc(px, y + 5, 2.6, 0, 7); c.fill(); });   // أعمدة ربط الحبال
}
export function harborDrawables(open, t) {
  const out = [];
  if (!FLAGS.three) out.push({ y: 700, draw: c => gateNS(c, 'htower', GATE2_X, open, 'الميناء') }, ...wallNSItems('htower', GATE2_X));
  if (!FLAGS.three) out.push({ y: FRAMES.y + FRAMES.h, draw: c => building3d(c, 'frames', Object.assign({}, FRAMES, { H: H_B, wall: '#DCE4EA', door: '#2F6B73', sign: 'ورشة الهياكل', ac: 1 })) });
  if (!FLAGS.three) out.push({ y: GIFTS.y + GIFTS.h, draw: c => building3d(c, 'gifts', Object.assign({}, GIFTS, { H: H_B, wall: '#F1DCE0', door: '#9E3B5F', sign: 'دكان الهدايا', tank: 1 })) });
  if (!FLAGS.three) [[FRAME_TABLE, 'frames'], [GIFT_TABLE, 'gifts'], [ROOF_TABLE, 'roof']].forEach(([tb, k]) => out.push({ y: tb.y, x: tb.x, draw: c => workTable(c, tb.x, tb.y, k) }));
  if (!FLAGS.three) PIER_Y.forEach((y, i) => out.push({ y: y + 40, x: SEA_X + 120, draw: c => dhow(c, SEA_X + 118, y + 12 + Math.sin(t * 1.4 + i * 2) * 1.6, SHIP_COLS[i], t + i) }));
  if (!FLAGS.three) out.push({ y: CRATES.y + 10, x: CRATES.x, draw: c => { [[-46, 0], [-30, 0], [-38, -10], [36, 0], [50, 0]].forEach(([dx, dy]) => crate3d(c, CRATES.x + dx, CRATES.y + 10 + dy, 14, 10)); c.fillStyle = '#2F6B73'; rr(c, CRATES.x + 14, CRATES.y - 14, 16, 22, 3); c.fill(); c.strokeStyle = INK; c.lineWidth = .8; c.stroke(); } });
  if (!FLAGS.three) out.push({ y: LIGHTHOUSE.y + LIGHTHOUSE.s, draw: c => lighthouse(c, t) });
  if (!FLAGS.three) PALMS_H.forEach(p => out.push({ y: p.y, draw: c => palmCached(c, p.x, p.y, 1, false, t) }));
  if (!FLAGS.three) out.push({ y: 1400, x: 2820, draw: c => umbrella(c, 2820, 1400) });
  return out;
}
/* سفينة داو عُمانية: بدن خشبي منحنٍ بمؤخرة مرتفعة، حزام بلون الفريق، صارٍ مائل وشراع مثلث (لاتيني) */
function dhow(c, x, y, col, t) {
  c.fillStyle = 'rgba(0,30,60,.28)'; c.beginPath(); c.ellipse(x + 4, y + 8, 76, 13, 0, 0, 7); c.fill();
  c.fillStyle = 'rgba(255,255,255,.45)'; c.beginPath(); c.ellipse(x - 70, y + 4, 10, 3, 0, 0, 7); c.fill();
  // البدن
  c.beginPath(); c.moveTo(x - 82, y - 26); c.quadraticCurveTo(x - 40, y + 10, x + 30, y + 8); c.lineTo(x + 66, y - 4); c.lineTo(x + 70, y - 34); c.lineTo(x - 82, y - 26); c.closePath();
  const g = c.createLinearGradient(0, y - 30, 0, y + 10); g.addColorStop(0, '#B58450'); g.addColorStop(1, '#6E4A2A'); c.fillStyle = g; c.fill(); c.strokeStyle = INK; c.lineWidth = 1.2; c.stroke();
  c.strokeStyle = 'rgba(50,30,15,.35)'; c.lineWidth = 1; for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(x - 76 + k * 4, y - 26 + k * 6); c.quadraticCurveTo(x - 30, y - 6 + k * 4, x + 66, y - 30 + k * 7); c.stroke(); }
  c.fillStyle = col; c.beginPath(); c.moveTo(x - 80, y - 25); c.lineTo(x + 69, y - 33); c.lineTo(x + 68, y - 26); c.lineTo(x - 74, y - 18); c.closePath(); c.fill();   // حزام اللون
  c.fillStyle = '#C69A62'; c.fillRect(x - 70, y - 33, 132, 6); c.strokeStyle = INK; c.lineWidth = .8; c.strokeRect(x - 70, y - 33, 132, 6);   // سطح السفينة
  c.fillStyle = '#E8D9B8'; c.fillRect(x + 34, y - 52, 28, 20); c.fillStyle = '#9C6438'; c.fillRect(x + 32, y - 55, 32, 5); c.strokeStyle = INK; c.strokeRect(x + 34, y - 52, 28, 20);   // غرفة القيادة
  c.fillStyle = '#3E6E85'; c.fillRect(x + 40, y - 47, 6, 6); c.fillRect(x + 50, y - 47, 6, 6);
  // الصاري المائل والشراع
  const sway = Math.sin(t * 1.3) * .02;
  c.save(); c.translate(x - 6, y - 32); c.rotate(-.12 + sway);
  c.strokeStyle = '#5E3B20'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -92); c.stroke();
  c.strokeStyle = '#5E3B20'; c.lineWidth = 2; c.beginPath(); c.moveTo(-48, -40); c.lineTo(34, -104); c.stroke();
  c.beginPath(); c.moveTo(-46, -41); c.quadraticCurveTo(10, -60, 32, -102); c.lineTo(22, -6); c.closePath();
  const sg = c.createLinearGradient(-40, 0, 30, 0); sg.addColorStop(0, '#FFFBF0'); sg.addColorStop(1, '#D9CDB4'); c.fillStyle = sg; c.fill(); c.strokeStyle = INK; c.lineWidth = 1; c.stroke();
  c.strokeStyle = col; c.lineWidth = 4; c.beginPath(); c.moveTo(-30, -44); c.quadraticCurveTo(10, -50, 26, -40); c.stroke();
  c.fillStyle = col; c.beginPath(); c.moveTo(34, -104); c.lineTo(50, -100); c.lineTo(36, -96); c.closePath(); c.fill();   // راية
  c.restore();
}
function lighthouse(c, t) {   // منارة الميناء: برج مخطط مجسّم، ومصباح يدور ضوءه
  const L = LIGHTHOUSE;
  box3d(c, 'lighthouse', { x: L.x, y: L.y, w: L.s, h: L.s, H: L.H }, '#EFE8DA', r => {
    const ry = L.y - L.H; r.fillStyle = '#3D3A3A'; r.fillRect(L.x - 4, ry - 4, L.s + 8, L.s + 8);
    r.fillStyle = '#FFE7A0'; r.fillRect(L.x + 6, ry + 6, L.s - 12, L.s - 12); r.fillStyle = '#C0392B'; r.beginPath(); r.moveTo(L.x - 2, ry); r.lineTo(L.x + L.s / 2, ry - 18); r.lineTo(L.x + L.s + 2, ry); r.closePath(); r.fill(); r.strokeStyle = INK; r.lineWidth = 1; r.stroke();
  }, f => {
    const yb = L.y + L.s, yt = yb - L.H;
    for (let k = 0; k < 5; k++) { f.fillStyle = k % 2 ? '#C0392B' : '#F4EFE6'; f.fillRect(L.x, yt + k * L.H / 5, L.s, L.H / 5); }
    const g = f.createLinearGradient(L.x, 0, L.x + L.s, 0); g.addColorStop(0, 'rgba(255,255,255,.18)'); g.addColorStop(1, 'rgba(0,0,0,.2)'); f.fillStyle = g; f.fillRect(L.x, yt, L.s, L.H);
    f.fillStyle = '#5E3B20'; f.fillRect(L.x + L.s / 2 - 5, yb - 18, 10, 18); f.strokeStyle = INK; f.lineWidth = 1.1; f.strokeRect(L.x, yt, L.s, L.H);
  }, 30);
}
function umbrella(c, x, y) {   // مظلة شاطئ وكرسيان
  c.fillStyle = 'rgba(70,42,20,.2)'; c.beginPath(); c.ellipse(x + 14, y + 4, 30, 9, 0, 0, 7); c.fill();
  c.fillStyle = '#F2F0EA'; [[x - 20, y - 2], [x + 10, y + 2]].forEach(([px, py]) => { c.fillRect(px, py - 6, 20, 6); c.fillStyle = '#2F8F86'; c.fillRect(px, py - 9, 20, 3); c.fillStyle = '#F2F0EA'; });
  c.strokeStyle = '#7A4A2A'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 2, y - 52); c.stroke();
  for (let k = 0; k < 6; k++) { c.fillStyle = k % 2 ? '#F2E6C9' : '#E85D45'; c.beginPath(); c.moveTo(x - 2, y - 58); c.arc(x - 2, y - 52, 30, Math.PI + k * Math.PI / 6, Math.PI + (k + 1) * Math.PI / 6); c.closePath(); c.fill(); }
  c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.arc(x - 2, y - 52, 30, Math.PI, 0); c.stroke();
}

export const R3D = { buildings: [Object.assign({}, FRAMES, { H: H_B, wall: '#DCE4EA', door: '#2F6B73', sign: 'ورشة الهياكل', ac: 1 }), Object.assign({}, GIFTS, { H: H_B, wall: '#F1DCE0', door: '#9E3B5F', sign: 'دكان الهدايا', tank: 1 })],
  palms: PALMS_H, lighthouse: LIGHTHOUSE, gateNS: GATE2_X };
