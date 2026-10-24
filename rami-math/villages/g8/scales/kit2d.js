// ميناء الموازين في العرض العادي بأدوات العالم المفتوح (world/art.js): بحر بموجات ومراسٍ خشبية وقوارب تتهادى، رصيف حجري وكورنيش،
// سوق سمك بأكشاك، مستودع وبرج مراقبة، ساحة حاويات ملوّنة برافعة جسرية، والقرية الحديثة (houses.js) وشوارعها (street.js).
import { FLAGS, pattern, building3d, minaret, leanAt, stall, palmCached, streetLamp, signboard, upright, boxShadow, shade, INK, stoneBox, sidrCached, bench, roundTower, bunting, elev } from '../../../world/art.js';
import { houseItems2D, houseSmoke2D } from '../../houses.js';
import { paintStreets, streetItems2D, birds2D } from '../../street.js';

export function kit2d(D) {
  const { SEA, QUAY, YARD } = D, W = D.size.w, H = D.size.h;
  function ground(g, x0, y0, w, h) {
    g.fillStyle = '#E3C796'; g.fillRect(x0, y0, w, h); g.fillStyle = pattern(g, 'sand'); g.fillRect(x0, y0, w, h);
    // البحر بعمق متدرج
    const sea = g.createLinearGradient(0, 0, 0, SEA); sea.addColorStop(0, '#1C6EA4'); sea.addColorStop(1, '#3FA2D9'); g.fillStyle = sea; g.fillRect(0, 0, W, SEA + 6);
    g.fillStyle = 'rgba(255,255,255,.18)'; for (let i = 0; i < 300; i++) { const x = (i * 97) % W, y = (i * 53) % SEA; g.fillRect(x, y, 22, 2); }
    // الرصيف الحجري والكورنيش
    g.fillStyle = '#A8A29E'; g.fillRect(0, SEA, W, QUAY - SEA); g.strokeStyle = '#78716C'; g.lineWidth = 2; for (let x = 0; x < W; x += 46) g.strokeRect(x, SEA, 46, QUAY - SEA);
    g.fillStyle = '#E7DCC8'; g.fillRect(0, QUAY, W, 70); g.fillStyle = pattern(g, 'pavers'); g.fillRect(0, QUAY, W, 70);
    g.fillStyle = '#0EA5E9'; for (let x = 0; x < W; x += 28) g.fillRect(x, QUAY - 3, 14, 3);   // حافة الكورنيش
    // منطقة الميناء: خرسانة بخطوط صفراء
    g.fillStyle = '#C9C3B6'; g.fillRect(0, QUAY + 70, W, YARD - QUAY - 70); g.fillStyle = pattern(g, 'asphalt'); g.globalAlpha = .25; g.fillRect(0, QUAY + 70, W, YARD - QUAY - 70); g.globalAlpha = 1;
    g.strokeStyle = '#FACC15'; g.lineWidth = 4; g.setLineDash([24, 16]); g.beginPath(); g.moveTo(0, YARD - 30); g.lineTo(W, YARD - 30); g.stroke(); g.setLineDash([]);
    // قضبان الرافعة الجسرية
    g.strokeStyle = '#6B7280'; g.lineWidth = 4; [D.CRANE.x0, D.CRANE.x1].forEach(x => { g.beginPath(); g.moveTo(x, QUAY + 80); g.lineTo(x, YARD - 40); g.stroke(); });
    // المراسي الخشبية
    D.PIERS.forEach(([x, wd, top]) => { g.fillStyle = '#9A6A3E'; g.fillRect(x, top, wd, QUAY - top); g.strokeStyle = '#6A4428'; g.lineWidth = 2; for (let y = top; y < QUAY; y += 12) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + wd, y); g.stroke(); } g.fillStyle = '#5C3A20'; for (let y = top; y < SEA; y += 60) { g.fillRect(x - 5, y, 6, 6); g.fillRect(x + wd - 1, y, 6, 6); } });
    paintStreets(g, D.STREET, W, H);
    D.HOMES.forEach(Hm => { Hm.parts.forEach(b => boxShadow(g, b.x, b.y, b.w, b.h, b.H || 96)); Hm.walls.forEach(q => boxShadow(g, q.x, q.y, q.w, q.h, 26)); });
    boxShadow(g, D.MOSQUE.x, D.MOSQUE.y, D.MOSQUE.w, D.MOSQUE.h, D.MOSQUE.H); boxShadow(g, D.WAREHOUSE.x, D.WAREHOUSE.y, D.WAREHOUSE.w, D.WAREHOUSE.h, D.WAREHOUSE.H);
    D.STACKS.forEach(s => boxShadow(g, s.x, s.y, s.w, s.h, 46 * s.n));
    if (FLAGS.three) g.clearRect(0, 0, W, SEA - 4);   // في العرض المجسّم: البحر الحقيقي يظهر من تحت الأرض
  }
  // موج متحرك ولمعان على البحر (كل إطار)
  const groundLive = (c, t) => { c.fillStyle = 'rgba(255,255,255,.35)'; for (let k = 0; k < 60; k++) { const x = ((k * 173 + t * 30) % (W + 60)) - 30, y = 20 + (k * 61) % (SEA - 40); c.fillRect(x, y + Math.sin(t * 2 + k) * 2, 16, 2); } };
  const boat = (c, x, y, col, t, k) => { const bob = Math.sin(t * 1.6 + k) * 3; c.save(); c.translate(x, y + bob);
    c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(4, 10, 46, 10, 0, 0, 7); c.fill();
    c.fillStyle = col; c.beginPath(); c.moveTo(-46, -4); c.quadraticCurveTo(0, 18, 46, -4); c.lineTo(38, -14); c.lineTo(-40, -14); c.closePath(); c.fill(); c.strokeStyle = INK; c.lineWidth = 1.2; c.stroke();
    c.fillStyle = '#FFFDF6'; c.fillRect(-40, -18, 80, 5); c.fillStyle = '#F8FAFC'; c.fillRect(-10, -36, 26, 22); c.fillStyle = '#93C5FD'; c.fillRect(-6, -32, 18, 8); c.restore(); };
  const crane = (c, t) => { const { x0, x1, y } = D.CRANE, top = y - 250, tr = x0 + (x1 - x0) * (.5 + .4 * Math.sin(t * .4));
    c.fillStyle = '#F59E0B'; [x0, x1].forEach(x => { c.fillRect(x - 9, top, 18, y - top + 120); c.strokeStyle = '#B45309'; c.lineWidth = 2; for (let yy = top + 20; yy < y + 110; yy += 26) { c.beginPath(); c.moveTo(x - 9, yy); c.lineTo(x + 9, yy + 18); c.stroke(); } });
    c.fillRect(x0 - 30, top - 10, x1 - x0 + 60, 22); c.fillStyle = '#B45309'; c.fillRect(tr - 22, top + 12, 44, 18); c.strokeStyle = '#374151'; c.lineWidth = 2; c.beginPath(); c.moveTo(tr, top + 30); c.lineTo(tr, top + 120 + Math.sin(t) * 10); c.stroke();
    c.fillStyle = '#2563EB'; c.fillRect(tr - 34, top + 120 + Math.sin(t) * 10, 68, 26); c.strokeStyle = 'rgba(0,0,0,.3)'; c.strokeRect(tr - 34, top + 120 + Math.sin(t) * 10, 68, 26); };
  const items = t => {
    const out = [];
    D.BOATS.forEach((b, k) => out.push({ y: b.y, draw: c => boat(c, b.x, b.y, b.c, t, k) }));
    out.push({ y: 330, draw: c => boat(c, D.boatLife.sail.x, 330, '#0F766E', t, 9) });
    D.STACKS.forEach((s, k) => out.push({ x: s.x + s.w / 2, y: s.y + s.h, draw: c => { for (let j = 0; j < s.n; j++) { c.save(); c.translate(0, -j * 44); stoneBox(c, s.x, s.y, s.w, s.h, 44, [s.col, '#0EA5E9', '#F59E0B'][(j + k) % 3], false); c.restore(); } } }));
    out.push({ x: (D.CRANE.x0 + D.CRANE.x1) / 2, y: D.CRANE.y + 120, draw: c => crane(c, t) });
    const Wh = D.WAREHOUSE; out.push({ x: Wh.x + Wh.w / 2, y: Wh.y + Wh.h, draw: c => { building3d(c, 'g8wh', { ...Wh, wall: '#CBD5E1', door: '#1E3A8A', style: 'shop', sign: 'المستودع' }); } });
    const Tw = D.TOWER; out.push({ x: Tw.x, y: Tw.y, draw: c => { roundTower(c, Tw.x, Tw.y, Tw.r, Tw.H, '#F1F5F9'); c.fillStyle = '#38BDF8'; c.fillRect(Tw.x - Tw.r + 6, Tw.y - Tw.H - 4, Tw.r * 2 - 12, 26); c.fillStyle = '#DC2626'; c.fillRect(Tw.x - 3, Tw.y - Tw.H - 46, 6, 40); c.beginPath(); c.arc(Tw.x, Tw.y - Tw.H - 48, 6 + Math.sin(t * 4), 0, 7); c.fill(); } });
    D.MARKET.forEach(([x, y, col]) => out.push({ x, y, draw: c => stall(c, x, y, col) }));
    D.STALLS.forEach(([x, y, col]) => out.push({ x, y, draw: c => stall(c, x, y, col) }));
    const A = { building3d, stoneBox, sidrCached, palmCached, bench, upright, leanAt };
    D.HOMES.forEach((Hm, i) => out.push(...houseItems2D(Hm, A, 'g8sh' + i, t)));
    out.push(...streetItems2D(D.life, D.STREET, { upright, bench, signboard }, t));
    const M = D.MOSQUE, N = D.MINARET;
    out.push({ x: M.x + M.w / 2, y: M.y + M.h, draw: c => { building3d(c, 'g8smosque', M); const { lx, ly } = leanAt(M.x + M.w / 2, M.y + M.h); c.save(); c.translate(lx * M.H, -M.H * (1 - ly)); minaret(c, 'g8sminaret', N.x, N.y, N.s, N.H); c.restore(); } });
    D.PALMS.forEach(([x, y, s]) => out.push({ x, y, draw: c => palmCached(c, x, y, s, false, t) }));
    D.LAMPS.forEach(([x, y]) => out.push({ x, y, draw: c => streetLamp(c, x, y, t, false) }));
    // نصب المرساة في جزيرة الدوّار
    const R = D.RING; out.push({ x: R.x, y: R.y + 10, draw: c => upright(c, R.x, R.y + 10, cc => { cc.strokeStyle = '#334155'; cc.lineWidth = 9; cc.lineCap = 'round'; cc.beginPath(); cc.moveTo(R.x, R.y - 90); cc.lineTo(R.x, R.y); cc.moveTo(R.x - 26, R.y - 70); cc.lineTo(R.x + 26, R.y - 70); cc.stroke();
      cc.beginPath(); cc.arc(R.x, R.y - 30, 34, .15 * Math.PI, .85 * Math.PI); cc.stroke(); cc.beginPath(); cc.arc(R.x, R.y - 98, 10, 0, 7); cc.stroke(); cc.lineCap = 'butt'; }) });
    // قوس الميناء فوق الشارع
    out.push({ x: 1150, y: YARD - 30, draw: c => upright(c, 1150, YARD - 30, cc => { cc.fillStyle = '#0E7490'; cc.fillRect(1052, YARD - 160, 12, 130); cc.fillRect(1236, YARD - 160, 12, 130); cc.fillRect(1044, YARD - 168, 212, 14); signboard(cc, 1150, YARD - 132, '⚓ ميناء الموازين'); }) });
    return out;
  };
  const over = (c, t) => { D.HOMES.forEach(Hm => houseSmoke2D(Hm, c, t)); birds2D(c, D.life, D.STREET, t);
    bunting(c, elev(1024, 1000, 110), elev(1276, 1000, 110), 26, 11, ['#0EA5E9', '#FFFFFF', '#F59E0B', '#0F766E'], t); };
  function station(c, s, t, st) {
    const done = st && st.doneIds && st.doneIds[s.id];
    if (s.kind === 'scale') upright(c, s.x, s.y, cc => { cc.fillStyle = '#9CA3AF'; cc.beginPath(); cc.ellipse(s.x, s.y - 52, 40, 10, 0, 0, 7); cc.fill(); cc.fillStyle = '#4B5563'; cc.fillRect(s.x - 34, s.y - 48, 68, 48);
      cc.fillStyle = '#052E16'; cc.fillRect(s.x - 26, s.y - 40, 52, 22); cc.fillStyle = '#4ADE80'; cc.font = '900 13px Cairo'; cc.textAlign = 'center'; cc.fillText('٠٫٦ كغ', s.x, s.y - 24); signboard(cc, s.x, s.y - 80, '⚖️ ميزان السمك'); });
    else if (s.kind === 'printer') upright(c, s.x, s.y, cc => { cc.fillStyle = '#374151'; cc.fillRect(s.x - 30, s.y - 44, 60, 40); cc.fillStyle = '#FFFDF6'; cc.fillRect(s.x - 18, s.y - 8, 36, 14); signboard(cc, s.x, s.y - 70, '🏷️ ملصقات الشحنات'); });
    else if (s.kind === 'crane') upright(c, s.x, s.y, cc => signboard(cc, s.x, s.y - 60, '🏗️ رافعة الحاويات'));
    else if (s.kind === 'tower') upright(c, s.x, s.y, cc => signboard(cc, s.x, s.y - 40, '🗼 برج المراقبة'));
    if (done) { c.fillStyle = '#16A34A'; c.beginPath(); c.arc(s.x + 60, s.y - 40, 15, 0, 7); c.fill(); c.fillStyle = '#fff'; c.font = '900 18px Cairo'; c.textAlign = 'center'; c.fillText('✓', s.x + 60, s.y - 34); }
  }
  return { ground, groundLive, items, over, station };
}
