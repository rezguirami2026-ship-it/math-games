// مكتب المحقق في العرض العادي بأدوات العالم المفتوح: مكتب المحقق بطابقين ومصباح أزرق يومض، ومقهى الشهود بطاولتين ومظلتين، والمحكمة بأعمدتها
// وجملونها، ومتحف القرية، وبرج المراقبة بكشافه الدوّار، وساحة الشريط الأصفر حول قاعدة الجرّة الفارغة، ونصب العدسة المكبّرة في الدوّار.
import { pattern, building3d, minaret, leanAt, stall, palmCached, streetLamp, signboard, upright, boxShadow, blobShadow, stoneBox, sidrCached, bench, bunting, elev, kiosk3d, roundTower } from '../../../world/art.js';
import { houseItems2D, houseSmoke2D } from '../../houses.js';
import { paintStreets, streetItems2D, birds2D } from '../../street.js';

const GOLD = '#FACC15', NAVY = '#1E3A8A', FLAGS = [NAVY, '#FFFFFF', '#B45309', GOLD, '#15803D'];
export function kit2d(D) {
  const { YARD, TOP } = D, W = D.size.w, H = D.size.h, T = D.TOWER, Sc = D.SCENE, Co = D.COURT;
  function ground(g, x0, y0, w, h) {
    g.fillStyle = '#E6CFA2'; g.fillRect(x0, y0, w, h); g.fillStyle = pattern(g, 'sand'); g.fillRect(x0, y0, w, h);
    g.fillStyle = '#C9A26E'; g.fillRect(0, 0, W, TOP); g.fillStyle = 'rgba(120,80,40,.25)'; for (let x = 0; x < W; x += 80) { g.beginPath(); g.moveTo(x, TOP); g.lineTo(x + 40, TOP - 50 - (x % 160 ? 10 : 0)); g.lineTo(x + 80, TOP); g.fill(); }
    const paver = (x, y, w2, h2, col = '#E2D3B5') => { g.fillStyle = col; g.fillRect(x, y, w2, h2); g.fillStyle = pattern(g, 'pavers'); g.globalAlpha = .5; g.fillRect(x, y, w2, h2); g.globalAlpha = 1; g.strokeStyle = '#B9A47E'; g.lineWidth = 3; g.strokeRect(x, y, w2, h2); };
    // الحي القديم: حجارة مرصوفة رمادية وممرات
    paver(130, 150, 2210, 670, '#D6CFC2'); g.fillStyle = 'rgba(80,70,60,.08)'; for (let y = 160; y < 810; y += 22) for (let x = 140 + (y % 44 ? 11 : 0); x < 2330; x += 44) g.fillRect(x, y, 20, 10);
    paver(140, D.PROM.y0, 2190, D.PROM.y1 - D.PROM.y0, '#CBBFA8'); paver(290, D.PROM.y1, 160, YARD - D.PROM.y1, '#CBBFA8');
    paver(Co.x + 40, Co.y + Co.h, Co.w - 80, 40, '#F5F5F4');
    g.fillStyle = '#9BC46A'; [[150, 690, 260, 100], [800, 690, 220, 100], [1860, 700, 300, 90]].forEach(([x, y, a, b]) => { g.fillRect(x, y, a, b); g.strokeStyle = '#7A6A4E'; g.lineWidth = 3; g.strokeRect(x, y, a, b); });
    // ساحة الشريط الأصفر: أرضية بعلامات الطباشير وآثار أقدام
    g.fillStyle = '#E5E0D6'; g.fillRect(Sc.x, Sc.y, Sc.w, Sc.h); g.strokeStyle = '#FFFFFF'; g.lineWidth = 3; g.setLineDash([8, 6]); g.strokeRect(Sc.x + 70, Sc.y + 40, 100, 70); g.setLineDash([]);
    for (let k = 0; k < 7; k++) { const fx = Sc.x + 60 + k * 26, fy = Sc.y + Sc.h - 20 - (k % 2) * 12; g.fillStyle = 'rgba(60,40,20,.35)'; g.beginPath(); g.ellipse(fx, fy, 6, 10, -.4, 0, 7); g.fill(); }
    g.fillStyle = 'rgba(70,40,15,.18)'; D.TABLES.forEach(([x, y]) => { g.beginPath(); g.ellipse(x + 10, y + 6, 34, 12, 0, 0, 7); g.fill(); });
    D.stations.forEach(s => paver(s.x - 70, s.y - 30, 140, 110, '#E2D9C6'));
    paintStreets(g, D.STREET, W, H);
    D.HOMES.forEach(Hm => { Hm.parts.forEach(b => boxShadow(g, b.x, b.y, b.w, b.h, b.H || 96)); Hm.walls.forEach(q => boxShadow(g, q.x, q.y, q.w, q.h, 26)); });
    boxShadow(g, D.MOSQUE.x, D.MOSQUE.y, D.MOSQUE.w, D.MOSQUE.h, 84);
    [D.HQ, D.CAFE, Co, D.MUSEUM].forEach(b => boxShadow(g, b.x, b.y, b.w, b.h, b.H)); blobShadow(g, T.x, T.y, T.r, T.H);
    D.stations.forEach(s => boxShadow(g, s.x - 52, s.y - 56, 104, 24, 70));
  }
  // شعاع كشاف البرج يمسح الأرض
  const groundLive = (c, t) => { const a = t * .7, L = 260; c.fillStyle = 'rgba(254,249,195,.22)'; c.beginPath(); c.moveTo(T.x, T.y - 10); c.arc(T.x, T.y - 10, L, a - .18, a + .18); c.closePath(); c.fill(); };
  const items = t => {
    const out = [], k = D.kit;
    out.push({ x: D.HQ.x + D.HQ.w / 2, y: D.HQ.y + D.HQ.h, draw: c => { building3d(c, 'g8dthq', D.HQ);
      upright(c, D.HQ.x + 40, D.HQ.y + D.HQ.h, cc => { const on = Math.sin(k.t * 5) > 0, y = D.HQ.y + D.HQ.h - D.HQ.H - 14; cc.fillStyle = '#334155'; cc.fillRect(D.HQ.x + 36, y + 6, 8, 12); cc.fillStyle = on ? '#3B82F6' : '#1E3A8A'; cc.beginPath(); cc.arc(D.HQ.x + 40, y, 9, 0, 7); cc.fill();
        if (on) { cc.fillStyle = 'rgba(59,130,246,.25)'; cc.beginPath(); cc.arc(D.HQ.x + 40, y, 22, 0, 7); cc.fill(); } }); } });
    out.push({ x: D.CAFE.x + D.CAFE.w / 2, y: D.CAFE.y + D.CAFE.h, draw: c => building3d(c, 'g8dtcafe', D.CAFE) });
    D.TABLES.forEach(([x, y], i) => out.push({ x, y, draw: c => upright(c, x, y, cc => { cc.fillStyle = '#78350F'; cc.fillRect(x - 2, y - 70, 4, 70); cc.fillStyle = '#A16207'; cc.beginPath(); cc.ellipse(x, y - 22, 22, 7, 0, 0, 7); cc.fill(); cc.fillRect(x - 2, y - 22, 4, 22);
      [-1, 1].forEach(sd => { cc.fillStyle = '#57534E'; cc.fillRect(x + sd * 26 - 6, y - 16, 12, 16); });
      for (let q = 0; q < 8; q++) { cc.fillStyle = q % 2 ? '#FFFFFF' : (i ? '#1E3A8A' : '#B45309'); cc.beginPath(); cc.moveTo(x, y - 86); const a1 = Math.PI + q * Math.PI / 8, a2 = a1 + Math.PI / 8; cc.lineTo(x + Math.cos(a1) * 40, y - 66 + Math.sin(a1) * -10); cc.lineTo(x + Math.cos(a2) * 40, y - 66 + Math.sin(a2) * -10); cc.closePath(); cc.fill(); } }) }));
    // المحكمة: مبنى وأعمدة أمامية وجملون وميزان
    out.push({ x: Co.x + Co.w / 2, y: Co.y + Co.h + 2, draw: c => { building3d(c, 'g8dtcourt', Co);
      upright(c, Co.x + Co.w / 2, Co.y + Co.h + 2, cc => { const yb = Co.y + Co.h + 2; for (let q = 0; q < 6; q++) { const x = Co.x + 30 + q * (Co.w - 60) / 5; cc.fillStyle = '#FAFAF9'; cc.fillRect(x - 8, yb - 126, 16, 126); cc.fillStyle = 'rgba(0,0,0,.1)'; cc.fillRect(x + 3, yb - 126, 5, 126); cc.fillStyle = '#D6D3D1'; cc.fillRect(x - 11, yb - 132, 22, 8); cc.fillRect(x - 11, yb - 6, 22, 6); }
        cc.fillStyle = '#E7E5E4'; cc.beginPath(); cc.moveTo(Co.x + 10, yb - 132); cc.lineTo(Co.x + Co.w / 2, yb - 164); cc.lineTo(Co.x + Co.w - 10, yb - 132); cc.fill(); cc.strokeStyle = '#A8A29E'; cc.lineWidth = 1.5; cc.stroke();
        const sx = Co.x + Co.w / 2, sy = yb - 146; cc.strokeStyle = '#A16207'; cc.lineWidth = 2; cc.beginPath(); cc.moveTo(sx, sy - 10); cc.lineTo(sx, sy + 6); cc.moveTo(sx - 14, sy - 6); cc.lineTo(sx + 14, sy - 6); cc.stroke(); [-14, 14].forEach(o => { cc.beginPath(); cc.arc(sx + o, sy, 5, 0, Math.PI); cc.stroke(); }); }); } });
    out.push({ x: D.MUSEUM.x + D.MUSEUM.w / 2, y: D.MUSEUM.y + D.MUSEUM.h, draw: c => building3d(c, 'g8dtmuseum', D.MUSEUM) });
    // برج المراقبة: برج دائري بشرفة وكشاف
    out.push({ x: T.x, y: T.y, draw: c => upright(c, T.x, T.y, cc => { roundTower(cc, T.x, T.y, T.r, T.H, '#D6CFC2'); const top = T.y - T.H; cc.fillStyle = '#57534E'; cc.beginPath(); cc.ellipse(T.x, top, T.r + 10, (T.r + 10) * .42, 0, 0, 7); cc.fill();
      cc.fillStyle = NAVY; cc.beginPath(); cc.moveTo(T.x - T.r - 6, top - 6); cc.lineTo(T.x, top - 50); cc.lineTo(T.x + T.r + 6, top - 6); cc.fill(); const a = k.t * .7; cc.fillStyle = '#FEF9C3'; cc.beginPath(); cc.arc(T.x + Math.cos(a) * 8, top - 14, 7, 0, 7); cc.fill(); }) });
    // الشريط الأصفر وقاعدة الجرّة الفارغة
    out.push({ x: Sc.x + 120, y: Sc.y + 110, draw: c => upright(c, Sc.x + 120, Sc.y + 110, cc => { cc.fillStyle = '#A8A29E'; cc.fillRect(Sc.x + 98, Sc.y + 60, 44, 50); cc.fillStyle = '#D6D3D1'; cc.fillRect(Sc.x + 92, Sc.y + 54, 56, 8); signboard(cc, Sc.x + 120, Sc.y + 40, '❓ الجرّة المسروقة'); }) });
    [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([a, b]) => { const x = Sc.x + a * Sc.w, y = Sc.y + b * Sc.h; out.push({ x, y, draw: c => upright(c, x, y, cc => { cc.fillStyle = '#F97316'; cc.beginPath(); cc.moveTo(x - 8, y); cc.lineTo(x, y - 40); cc.lineTo(x + 8, y); cc.fill(); cc.fillStyle = '#FFF'; cc.fillRect(x - 4, y - 24, 8, 5); }) }); });
    D.stations.forEach(s => out.push({ x: s.x, y: s.y - 32, draw: c => kiosk3d(c, 'g8dt' + s.id, { x: s.x, y: s.y, col: s.col, sign: `${s.icon} ${s.label}` }, [s.col, GOLD, '#FFFFFF', NAVY]) }));
    D.STALLS.forEach(([x, y, col]) => out.push({ x, y, draw: c => stall(c, x, y, col) }));
    D.BANNERS.flat().forEach(([x, y]) => out.push({ x, y, draw: c => upright(c, x, y, cc => { cc.fillStyle = '#64748B'; cc.fillRect(x - 2.5, y - 124, 5, 124); cc.fillStyle = GOLD; cc.beginPath(); cc.arc(x, y - 126, 5, 0, 7); cc.fill(); }) }));
    const L = { building3d, stoneBox, sidrCached, palmCached, bench, upright, leanAt };
    D.HOMES.forEach((Hm, i) => out.push(...houseItems2D(Hm, L, 'g8dt' + i, t)));
    out.push(...streetItems2D(D.life, D.STREET, { upright, bench, signboard }, t));
    const M = D.MOSQUE, N2 = D.MINARET;
    out.push({ x: M.x + M.w / 2, y: M.y + M.h, draw: c => { building3d(c, 'g8dtmosque', M); const { lx, ly } = leanAt(M.x + M.w / 2, M.y + M.h); c.save(); c.translate(lx * M.H, -M.H * (1 - ly)); minaret(c, 'g8dtminaret', N2.x, N2.y, N2.s, N2.H); c.restore(); } });
    D.PALMS.forEach(([x, y, s]) => out.push({ x, y, draw: c => palmCached(c, x, y, s, false, t) }));
    D.LAMPS.forEach(([x, y]) => out.push({ x, y, draw: c => streetLamp(c, x, y, t, false) }));
    // نصب العدسة المكبّرة في الدوّار
    const R = D.RING; out.push({ x: R.x, y: R.y + 20, draw: c => upright(c, R.x, R.y + 20, cc => { const y = R.y + 20; cc.fillStyle = '#E7E5E4'; cc.beginPath(); cc.ellipse(R.x, y - 12, 56, 18, 0, 0, 7); cc.fill(); cc.fillStyle = '#A8A29E'; cc.fillRect(R.x - 56, y - 12, 112, 8);
      cc.strokeStyle = '#78350F'; cc.lineWidth = 12; cc.lineCap = 'round'; cc.beginPath(); cc.moveTo(R.x + 22, y - 20); cc.lineTo(R.x - 4, y - 70); cc.stroke(); cc.lineCap = 'butt';
      cc.strokeStyle = '#A16207'; cc.lineWidth = 9; cc.fillStyle = 'rgba(186,230,253,.55)'; cc.beginPath(); cc.arc(R.x - 20, y - 104, 36, 0, 7); cc.fill(); cc.stroke(); cc.strokeStyle = 'rgba(255,255,255,.8)'; cc.lineWidth = 3; cc.beginPath(); cc.arc(R.x - 26, y - 110, 18, 3.6, 4.6); cc.stroke(); }) });
    out.push({ x: R.x, y: YARD - 40, draw: c => upright(c, R.x, YARD - 40, cc => { cc.fillStyle = NAVY; cc.fillRect(R.x - 98, YARD - 170, 12, 130); cc.fillRect(R.x + 86, YARD - 170, 12, 130); cc.fillRect(R.x - 106, YARD - 178, 212, 14);
      for (let q = 0; q < 9; q++) { cc.fillStyle = Math.sin(k.t * 3 + q) > 0 ? GOLD : '#FFF7D6'; cc.beginPath(); cc.arc(R.x - 96 + q * 24, YARD - 171, 3.5, 0, 7); cc.fill(); }
      signboard(cc, R.x, YARD - 142, '🔎 مكتب المحقق'); }) });
    return out;
  };
  // الشريط الأصفر حول الساحة يتموج، وحبال الرايات
  const over = (c, t) => { D.HOMES.forEach(Hm => houseSmoke2D(Hm, c, t)); birds2D(c, D.life, D.STREET, t);
    const P = [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]].map(([a, b]) => elev(Sc.x + a * Sc.w, Sc.y + b * Sc.h, 30));
    for (let q = 0; q < 4; q++) { const [ax, ay] = P[q], [bx, by] = P[q + 1]; c.strokeStyle = '#FACC15'; c.lineWidth = 5; c.beginPath(); c.moveTo(ax, ay); c.quadraticCurveTo((ax + bx) / 2, (ay + by) / 2 + 6 + Math.sin(t * 2 + q) * 2, bx, by); c.stroke();
      c.strokeStyle = '#111827'; c.lineWidth = 5; c.setLineDash([6, 10]); c.stroke(); c.setLineDash([]); }
    D.BANNERS.forEach(([a, b], i) => bunting(c, elev(a[0], a[1], 120), elev(b[0], b[1], 120), 26, 12, FLAGS.slice(i % 2).concat(FLAGS.slice(0, i % 2)), t));
    bunting(c, elev(254, 1000, 110), elev(506, 1000, 110), 26, 11, FLAGS, t); };
  function station(c, s, t, st) {
    const done = st && st.doneIds && st.doneIds[s.id];
    if (done) { c.fillStyle = '#16A34A'; c.beginPath(); c.arc(s.x + 64, s.y - 60, 15, 0, 7); c.fill(); c.fillStyle = '#fff'; c.font = '900 18px Cairo'; c.textAlign = 'center'; c.fillText('✓', s.x + 64, s.y - 54); }
  }
  return { ground, groundLive, items, over, station };
}
