// منحدرات التزلج في العرض العادي بأدوات العالم المفتوح: كثبان رملية عالية بظلالها وتموجات الريح، ومسارات تزلج خشبية تنزل من قممها
// بمتزلجين ينزلقون، ومصعد كراسٍ بكابل وكراسٍ تتحرك، واستراحة المنتجع، وبرج الإنقاذ برايته، وأكشاك الدروس، ونصب «ص = م س + جـ» في الدوّار.
import { pattern, building3d, minaret, leanAt, stall, palmCached, streetLamp, signboard, upright, boxShadow, blobShadow, stoneBox, sidrCached, bench, bunting, elev, kiosk3d } from '../../../world/art.js';
import { houseItems2D, houseSmoke2D } from '../../houses.js';
import { paintStreets, streetItems2D, birds2D } from '../../street.js';

const GOLD = '#FACC15', FLAGS = ['#0369A1', '#FFFFFF', '#F59E0B', '#DC2626', '#15803D'];
export function kit2d(D) {
  const { YARD, TOP } = D, W = D.size.w, H = D.size.h, L = D.LIFT;
  const duneH = (x, y) => { let h = 0; D.DUNES.forEach(([dx, dy, w, d, H2]) => { const u = (x - dx) / w, v = (y - dy) / d; if (u > 0 && u < 1 && v > -.2 && v < 1.6) h = Math.max(h, H2 * Math.sin(Math.PI * u) * Math.max(0, 1 - Math.max(0, v - .5) / 1.1)); }); return h; };
  const liftPt = k => [L.x0 + (L.x1 - L.x0) * k, L.y0 + (L.y1 - L.y0) * k];
  function ground(g, x0, y0, w, h) {
    g.fillStyle = '#E9CFA0'; g.fillRect(x0, y0, w, h); g.fillStyle = pattern(g, 'sand'); g.fillRect(x0, y0, w, h);
    g.fillStyle = '#D9AE6A'; g.fillRect(0, 0, W, TOP);
    // رمل المنتجع بتموجات الريح، وممشى خشبي، وأرضيات المحطات
    g.fillStyle = '#EBC98C'; g.fillRect(120, 140, 2220, 690); g.strokeStyle = 'rgba(150,100,40,.18)'; g.lineWidth = 2;
    for (let y = 160; y < 820; y += 18) { g.beginPath(); for (let x = 120; x < 2340; x += 30) g.lineTo(x, y + Math.sin(x / 60 + y) * 4); g.stroke(); }
    const deck = (x, y, w2, h2) => { g.fillStyle = '#B98A55'; g.fillRect(x, y, w2, h2); g.strokeStyle = '#8A6136'; g.lineWidth = 2; for (let xx = x; xx < x + w2; xx += 14) { g.beginPath(); g.moveTo(xx, y); g.lineTo(xx, y + h2); g.stroke(); } g.strokeRect(x, y, w2, h2); };
    deck(140, D.PROM.y0, 2190, D.PROM.y1 - D.PROM.y0); deck(290, D.PROM.y1, 160, YARD - D.PROM.y1);
    D.stations.forEach(s => deck(s.x - 70, s.y - 30, 140, 110));
    // ظلال الكثبان على الأرض (نحو الأسفل يميناً)
    D.DUNES.forEach(([x, y, w2, d, H2]) => { g.fillStyle = 'rgba(120,70,20,.16)'; g.beginPath(); g.ellipse(x + w2 / 2 + H2 * .35, y + d + 20, w2 * .5, d * .35, 0, 0, 7); g.fill(); });
    paintStreets(g, D.STREET, W, H);
    D.HOMES.forEach(Hm => { Hm.parts.forEach(b => boxShadow(g, b.x, b.y, b.w, b.h, b.H || 96)); Hm.walls.forEach(q => boxShadow(g, q.x, q.y, q.w, q.h, 26)); });
    boxShadow(g, D.MOSQUE.x, D.MOSQUE.y, D.MOSQUE.w, D.MOSQUE.h, 84); boxShadow(g, D.LODGE.x, D.LODGE.y, D.LODGE.w, D.LODGE.h, D.LODGE.H); blobShadow(g, D.RESCUE.x, D.RESCUE.y, 26, 150);
    D.stations.forEach(s => boxShadow(g, s.x - 52, s.y - 56, 104, 24, 70));
  }
  const items = t => {
    const out = [], k = D.kit;
    // الكثبان: كتل رملية مرتفعة بوجه مضاء وآخر في الظل وخطوط ريح
    D.DUNES.forEach(([x, y, w2, d, H2], j) => out.push({ x: x + w2 / 2, y: y + d, draw: c => upright(c, x + w2 / 2, y + d, cc => {
      const base = y + d, top = base - H2; cc.fillStyle = '#E9C07A'; cc.beginPath(); cc.moveTo(x, base); cc.bezierCurveTo(x + w2 * .25, top - 10, x + w2 * .45, top - 20, x + w2 * .55, top); cc.bezierCurveTo(x + w2 * .7, top + 20, x + w2 * .85, base - H2 * .2, x + w2, base); cc.closePath(); cc.fill();
      cc.fillStyle = 'rgba(160,100,40,.28)'; cc.beginPath(); cc.moveTo(x + w2 * .55, top); cc.bezierCurveTo(x + w2 * .7, top + 20, x + w2 * .85, base - H2 * .2, x + w2, base); cc.lineTo(x + w2 * .6, base); cc.closePath(); cc.fill();
      cc.strokeStyle = 'rgba(255,240,200,.6)'; cc.lineWidth = 2; for (let q = 1; q < 4; q++) { cc.beginPath(); cc.moveTo(x + w2 * .1 * q, base - H2 * .15 * q); cc.quadraticCurveTo(x + w2 * .3, top + H2 * .3 * q, x + w2 * .52, top + H2 * .25 * q); cc.stroke(); } }) }));
    // مسارات التزلج: ألواح خشبية من القمة إلى القاعدة، ومتزلج ينزلق
    D.RUNS.forEach(([x1, y1, x2, y2, col], j) => out.push({ x: x2, y: y2 + 2, draw: c => { const h1 = 120, [tx, ty] = elev(x1, y1, h1), [bx, by] = [x2, y2], nx = -(by - ty), ny = bx - tx, ln = Math.hypot(nx, ny), ox = nx / ln * 16, oy = ny / ln * 16;
      c.fillStyle = '#C08A4E'; c.beginPath(); c.moveTo(tx - ox, ty - oy); c.lineTo(tx + ox, ty + oy); c.lineTo(bx + ox, by + oy); c.lineTo(bx - ox, by - oy); c.closePath(); c.fill();
      c.strokeStyle = col; c.lineWidth = 3; c.beginPath(); c.moveTo(tx - ox, ty - oy); c.lineTo(bx - ox, by - oy); c.moveTo(tx + ox, ty + oy); c.lineTo(bx + ox, by + oy); c.stroke();
      c.strokeStyle = 'rgba(90,55,25,.4)'; c.lineWidth = 1; for (let q = 1; q < 14; q++) { const u = q / 14, px = tx + (bx - tx) * u, py = ty + (by - ty) * u; c.beginPath(); c.moveTo(px - ox, py - oy); c.lineTo(px + ox, py + oy); c.stroke(); }
      const u = (k.t * .18 + j * .27) % 1, sx = tx + (bx - tx) * u, sy = ty + (by - ty) * u; c.fillStyle = col; c.fillRect(sx - 9, sy - 3, 18, 5); c.fillStyle = ['#F97316', '#2563EB', '#16A34A', '#DB2777'][j % 4]; c.beginPath(); c.arc(sx, sy - 14, 6, 0, 7); c.fill(); c.fillRect(sx - 4, sy - 10, 8, 8);
      signboard(c, bx, by + 22, `الميل ${['٠٫٥', '١', '٢', '١٫٥'][j % 4]}`); } }));
    // أعمدة مصعد الكراسي
    for (let q = 0; q < L.n; q++) { const [x, y] = liftPt(q / (L.n - 1)), hh = 110 + duneH(x, y) * .8; out.push({ x, y, draw: c => upright(c, x, y, cc => { cc.fillStyle = '#475569'; cc.fillRect(x - 4, y - hh, 8, hh); cc.fillRect(x - 18, y - hh - 4, 36, 6); }) }); }
    out.push({ x: D.LODGE.x + D.LODGE.w / 2, y: D.LODGE.y + D.LODGE.h, draw: c => building3d(c, 'g8sllodge', D.LODGE) });
    // برج الإنقاذ: أرجل خشبية ومنصة وسقف ورايتان
    const Rs = D.RESCUE; out.push({ x: Rs.x, y: Rs.y, draw: c => upright(c, Rs.x, Rs.y, cc => { cc.strokeStyle = '#8A6136'; cc.lineWidth = 6; [[-20, -14], [20, -14]].forEach(([a]) => { cc.beginPath(); cc.moveTo(Rs.x + a, Rs.y); cc.lineTo(Rs.x + a * .6, Rs.y - 110); cc.stroke(); });
      cc.lineWidth = 3; cc.beginPath(); cc.moveTo(Rs.x - 18, Rs.y - 30); cc.lineTo(Rs.x + 14, Rs.y - 80); cc.moveTo(Rs.x + 18, Rs.y - 30); cc.lineTo(Rs.x - 14, Rs.y - 80); cc.stroke();
      cc.fillStyle = '#DC2626'; cc.fillRect(Rs.x - 26, Rs.y - 140, 52, 30); cc.fillStyle = '#FFF'; cc.fillRect(Rs.x - 4, Rs.y - 136, 8, 22); cc.fillRect(Rs.x - 11, Rs.y - 129, 22, 8);
      cc.fillStyle = '#B91C1C'; cc.beginPath(); cc.moveTo(Rs.x - 32, Rs.y - 140); cc.lineTo(Rs.x, Rs.y - 162); cc.lineTo(Rs.x + 32, Rs.y - 140); cc.fill();
      cc.fillStyle = GOLD; cc.fillRect(Rs.x - 1, Rs.y - 194, 2, 32); cc.beginPath(); cc.moveTo(Rs.x + 1, Rs.y - 194); cc.lineTo(Rs.x + 22 + Math.sin(k.t * 3) * 3, Rs.y - 187); cc.lineTo(Rs.x + 1, Rs.y - 180); cc.fill(); }) });
    D.stations.forEach(s => out.push({ x: s.x, y: s.y - 32, draw: c => kiosk3d(c, 'g8sl' + s.id, { x: s.x, y: s.y, col: s.col, sign: `${s.icon} ${s.label}` }, [s.col, GOLD, '#FFFFFF', '#0369A1']) }));
    D.STALLS.forEach(([x, y, col]) => out.push({ x, y, draw: c => stall(c, x, y, col) }));
    D.BANNERS.flat().forEach(([x, y]) => out.push({ x, y, draw: c => upright(c, x, y, cc => { cc.fillStyle = '#64748B'; cc.fillRect(x - 2.5, y - 124, 5, 124); cc.fillStyle = GOLD; cc.beginPath(); cc.arc(x, y - 126, 5, 0, 7); cc.fill(); }) }));
    const Lb = { building3d, stoneBox, sidrCached, palmCached, bench, upright, leanAt };
    D.HOMES.forEach((Hm, i) => out.push(...houseItems2D(Hm, Lb, 'g8sl' + i, t)));
    out.push(...streetItems2D(D.life, D.STREET, { upright, bench, signboard }, t));
    const M = D.MOSQUE, N2 = D.MINARET;
    out.push({ x: M.x + M.w / 2, y: M.y + M.h, draw: c => { building3d(c, 'g8slmosque', M); const { lx, ly } = leanAt(M.x + M.w / 2, M.y + M.h); c.save(); c.translate(lx * M.H, -M.H * (1 - ly)); minaret(c, 'g8slminaret', N2.x, N2.y, N2.s, N2.H); c.restore(); } });
    D.PALMS.forEach(([x, y, s]) => out.push({ x, y, draw: c => palmCached(c, x, y, s, false, t) }));
    D.LAMPS.forEach(([x, y]) => out.push({ x, y, draw: c => streetLamp(c, x, y, t, false) }));
    // نصب الدوّار: لوح شبكة مائل عليه مستقيم ونقطتان
    const R = D.RING; out.push({ x: R.x, y: R.y + 20, draw: c => upright(c, R.x, R.y + 20, cc => { const y = R.y + 20; cc.fillStyle = '#E7E5E4'; cc.beginPath(); cc.ellipse(R.x, y - 12, 56, 18, 0, 0, 7); cc.fill(); cc.fillStyle = '#A8A29E'; cc.fillRect(R.x - 56, y - 12, 112, 8);
      cc.fillStyle = '#F8FAFC'; cc.fillRect(R.x - 44, y - 120, 88, 88); cc.strokeStyle = '#CBD5E1'; cc.lineWidth = 1; for (let q = 0; q <= 8; q++) { cc.beginPath(); cc.moveTo(R.x - 44 + q * 11, y - 120); cc.lineTo(R.x - 44 + q * 11, y - 32); cc.moveTo(R.x - 44, y - 120 + q * 11); cc.lineTo(R.x + 44, y - 120 + q * 11); cc.stroke(); }
      cc.strokeStyle = '#475569'; cc.lineWidth = 2; cc.strokeRect(R.x - 44, y - 120, 88, 88); cc.strokeStyle = '#0369A1'; cc.lineWidth = 4; cc.beginPath(); cc.moveTo(R.x - 40, y - 40); cc.lineTo(R.x + 40, y - 112); cc.stroke();
      cc.fillStyle = '#EA580C'; [[-18, -60], [18, -92]].forEach(([a, b]) => { cc.beginPath(); cc.arc(R.x + a, y + b, 4, 0, 7); cc.fill(); }); cc.fillStyle = '#57534E'; cc.fillRect(R.x - 3, y - 32, 6, 20); }) });
    out.push({ x: R.x, y: YARD - 40, draw: c => upright(c, R.x, YARD - 40, cc => { cc.fillStyle = '#0369A1'; cc.fillRect(R.x - 98, YARD - 170, 12, 130); cc.fillRect(R.x + 86, YARD - 170, 12, 130); cc.fillRect(R.x - 106, YARD - 178, 212, 14);
      for (let q = 0; q < 9; q++) { cc.fillStyle = FLAGS[q % 5]; cc.beginPath(); cc.arc(R.x - 96 + q * 24, YARD - 171, 4, 0, 7); cc.fill(); }
      signboard(cc, R.x, YARD - 142, '🏂 منحدرات التزلج'); }) });
    return out;
  };
  // كابل المصعد والكراسي المتحركة، وحبال الرايات
  const over = (c, t) => { D.HOMES.forEach(Hm => houseSmoke2D(Hm, c, t)); birds2D(c, D.life, D.STREET, t);
    const tops = Array.from({ length: L.n }, (_, q) => { const [x, y] = liftPt(q / (L.n - 1)); return elev(x, y, 110 + duneH(x, y) * .8); });
    c.strokeStyle = '#334155'; c.lineWidth = 2; c.beginPath(); tops.forEach(([x, y], q) => q ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke();
    for (let q = 0; q < 7; q++) { const u = (D.kit.t * .04 + q / 7) % 1, seg = Math.min(L.n - 2, Math.floor(u * (L.n - 1))), f = u * (L.n - 1) - seg, [ax, ay] = tops[seg], [bx, by] = tops[seg + 1], x = ax + (bx - ax) * f, y = ay + (by - ay) * f;
      c.strokeStyle = '#475569'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 18); c.stroke(); c.fillStyle = FLAGS[q % 5] === '#FFFFFF' ? '#F59E0B' : FLAGS[q % 5]; c.fillRect(x - 9, y + 18, 18, 8); c.fillRect(x - 9, y + 10, 3, 10); }
    D.BANNERS.forEach(([a, b], i) => bunting(c, elev(a[0], a[1], 120), elev(b[0], b[1], 120), 26, 12, FLAGS.slice(i % 2).concat(FLAGS.slice(0, i % 2)), t));
    bunting(c, elev(254, 1000, 110), elev(506, 1000, 110), 26, 11, FLAGS, t); };
  function station(c, s, t, st) {
    const done = st && st.doneIds && st.doneIds[s.id];
    if (done) { c.fillStyle = '#16A34A'; c.beginPath(); c.arc(s.x + 64, s.y - 60, 15, 0, 7); c.fill(); c.fillStyle = '#fff'; c.font = '900 18px Cairo'; c.textAlign = 'center'; c.fillText('✓', s.x + 64, s.y - 54); }
  }
  return { ground, items, over, station };
}
