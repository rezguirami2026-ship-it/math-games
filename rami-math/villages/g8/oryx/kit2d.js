// محمية المها في العرض العادي بأدوات العالم المفتوح: مركز الزوار، وحظيرة المها المسيّجة بأرض رملية وأشجار الغاف ومها بيضاء بقرون طويلة تمشي وترعى،
// وحوض الماء، وبرج المراقبة الخشبي برايته، ومشتل الغاف بصفوف شتلاته، وأكشاك الدروس، ونصب المهاة في الدوّار.
import { pattern, building3d, minaret, leanAt, stall, palmCached, streetLamp, signboard, upright, boxShadow, blobShadow, stoneBox, sidrCached, bench, bunting, elev, kiosk3d } from '../../../world/art.js';
import { houseItems2D, houseSmoke2D } from '../../houses.js';
import { paintStreets, streetItems2D, birds2D } from '../../street.js';

const OLIVE = '#4D7C0F', GOLD = '#FACC15', FLAGS = [OLIVE, '#FFFFFF', '#B45309', GOLD, '#0F766E'];
/* مهاة عربية: جسم أبيض وأرجل بجوارب داكنة ووجه بقناع ووقرنان مستقيمان طويلان؛ dir اتجاهها، ph طور المشي */
export function oryx2d(c, x, y, s = 1, dir = 1, ph = 0) {
  c.save(); c.translate(x, y); c.scale(dir * s, s);
  c.fillStyle = 'rgba(40,25,10,.2)'; c.beginPath(); c.ellipse(0, 0, 22, 6, 0, 0, 7); c.fill();
  [[-14, 0], [-8, 1], [8, 0], [14, 1]].forEach(([lx, o]) => { const sw = Math.sin(ph + o * 3) * 3; c.strokeStyle = '#F5F5F4'; c.lineWidth = 3; c.beginPath(); c.moveTo(lx, -18); c.lineTo(lx + sw, -6); c.stroke(); c.strokeStyle = '#44403C'; c.beginPath(); c.moveTo(lx + sw, -6); c.lineTo(lx + sw, 0); c.stroke(); });
  c.fillStyle = '#FAFAF9'; c.beginPath(); c.ellipse(0, -24, 20, 9, 0, 0, 7); c.fill(); c.strokeStyle = '#D6D3D1'; c.lineWidth = 1; c.stroke();
  c.fillStyle = '#FAFAF9'; c.beginPath(); c.moveTo(14, -28); c.lineTo(22, -40); c.lineTo(28, -38); c.lineTo(20, -24); c.fill();
  c.fillStyle = '#FAFAF9'; c.beginPath(); c.ellipse(27, -42, 6, 5, .3, 0, 7); c.fill(); c.fillStyle = '#292524'; c.fillRect(25, -45, 6, 3);
  c.strokeStyle = '#292524'; c.lineWidth = 1.8; c.beginPath(); c.moveTo(25, -46); c.lineTo(16, -72); c.moveTo(28, -46); c.lineTo(20, -72); c.stroke();
  c.fillStyle = '#44403C'; c.beginPath(); c.moveTo(-20, -26); c.lineTo(-26, -14); c.lineTo(-22, -14); c.fill(); c.restore();
}
export function kit2d(D) {
  const { YARD, TOP } = D, W = D.size.w, H = D.size.h, P = D.PEN, Nu = D.NURSERY, Wt = D.WATCH, Tr = D.TROUGH;
  const oryxAt = (k, t) => { const [x0, y0] = D.ORYX[k], a = t * .15 + k * 1.7, x = x0 + Math.sin(a) * 40, y = y0 + Math.cos(a * .7) * 18; return [x, y, Math.cos(a) >= 0 ? 1 : -1]; };
  function ground(g, x0, y0, w, h) {
    g.fillStyle = '#E6CFA2'; g.fillRect(x0, y0, w, h); g.fillStyle = pattern(g, 'sand'); g.fillRect(x0, y0, w, h);
    g.fillStyle = '#C9A26E'; g.fillRect(0, 0, W, TOP);
    const paver = (x, y, w2, h2, col = '#E2D3B5') => { g.fillStyle = col; g.fillRect(x, y, w2, h2); g.fillStyle = pattern(g, 'pavers'); g.globalAlpha = .5; g.fillRect(x, y, w2, h2); g.globalAlpha = 1; g.strokeStyle = '#B9A47E'; g.lineWidth = 3; g.strokeRect(x, y, w2, h2); };
    paver(140, D.PROM.y0, 2190, D.PROM.y1 - D.PROM.y0, '#D6C7A6'); paver(290, D.PROM.y1, 160, YARD - D.PROM.y1, '#D6C7A6');
    g.fillStyle = '#E9CE98'; g.fillRect(P.x, P.y, P.w, P.h); g.fillStyle = 'rgba(120,160,60,.25)'; for (let k = 0; k < 60; k++) { g.beginPath(); g.arc(P.x + (k * 131) % P.w, P.y + (k * 67) % P.h, 6 + k % 5, 0, 7); g.fill(); }
    g.fillStyle = '#7A5A30'; g.fillRect(Tr.x, Tr.y, Tr.w, Tr.h); g.fillStyle = '#3B82C4'; g.fillRect(Tr.x + 4, Tr.y + 4, Tr.w - 8, Tr.h - 8);
    g.fillStyle = '#B98A55'; g.fillRect(Nu.x, Nu.y, Nu.w, Nu.h); for (let r = 0; r < 5; r++) for (let q = 0; q < 12; q++) { g.fillStyle = '#4D7C0F'; g.beginPath(); g.arc(Nu.x + 24 + q * 42, Nu.y + 26 + r * 44, 6 + (q + r) % 3 * 2, 0, 7); g.fill(); }
    D.stations.forEach(s => paver(s.x - 70, s.y - 30, 140, 110, '#E2D6BC'));
    paintStreets(g, D.STREET, W, H);
    D.HOMES.forEach(Hm => { Hm.parts.forEach(b => boxShadow(g, b.x, b.y, b.w, b.h, b.H || 96)); Hm.walls.forEach(q => boxShadow(g, q.x, q.y, q.w, q.h, 26)); });
    boxShadow(g, D.MOSQUE.x, D.MOSQUE.y, D.MOSQUE.w, D.MOSQUE.h, 84); boxShadow(g, D.CENTER.x, D.CENTER.y, D.CENTER.w, D.CENTER.h, D.CENTER.H); blobShadow(g, Wt.x, Wt.y, 30, Wt.H);
    D.stations.forEach(s => boxShadow(g, s.x - 52, s.y - 56, 104, 24, 70));
  }
  const groundLive = (c, t) => { c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(Tr.x + 10 + (t * 20) % 80, Tr.y + 12); c.lineTo(Tr.x + 24 + (t * 20) % 80, Tr.y + 12); c.stroke(); };
  const items = t => {
    const out = [], k = D.kit;
    out.push({ x: D.CENTER.x + D.CENTER.w / 2, y: D.CENTER.y + D.CENTER.h, draw: c => building3d(c, 'g8orcenter', D.CENTER) });
    // سياج الحظيرة: أعمدة وأسلاك
    for (let x = P.x; x <= P.x + P.w; x += 60) [P.y, P.y + P.h].forEach(y => out.push({ x, y, draw: c => upright(c, x, y, cc => { cc.fillStyle = '#7A5A30'; cc.fillRect(x - 2.5, y - 34, 5, 34); cc.strokeStyle = '#78716C'; cc.lineWidth = 1; [-28, -18, -8].forEach(o => { cc.beginPath(); cc.moveTo(x, y + o); cc.lineTo(x + 60, y + o); cc.stroke(); }); }) }));
    for (let y = P.y; y <= P.y + P.h; y += 60) [P.x, P.x + P.w].forEach(x => out.push({ x, y, draw: c => upright(c, x, y, cc => { cc.fillStyle = '#7A5A30'; cc.fillRect(x - 2.5, y - 34, 5, 34); }) }));
    D.GHAF.forEach(([x, y], i) => out.push({ x, y, draw: c => sidrCached(c, x, y, 1.15, t) }));
    D.ORYX.forEach((_, j) => out.push({ get x() { return oryxAt(j, k.t)[0]; }, get y() { return oryxAt(j, k.t)[1]; }, draw: c => { const [x, y, d] = oryxAt(j, k.t); upright(c, x, y, cc => oryx2d(cc, x, y, 1, d, k.t * 4 + j), .5); } }));
    // برج المراقبة
    out.push({ x: Wt.x, y: Wt.y, draw: c => upright(c, Wt.x, Wt.y, cc => { cc.strokeStyle = '#8A6136'; cc.lineWidth = 6; [-22, 22].forEach(a => { cc.beginPath(); cc.moveTo(Wt.x + a, Wt.y); cc.lineTo(Wt.x + a * .6, Wt.y - Wt.H); cc.stroke(); }); cc.lineWidth = 3; for (let y = Wt.y - 30; y > Wt.y - Wt.H; y -= 34) { cc.beginPath(); cc.moveTo(Wt.x - 20, y); cc.lineTo(Wt.x + 20, y - 26); cc.stroke(); }
      cc.fillStyle = '#B98A55'; cc.fillRect(Wt.x - 30, Wt.y - Wt.H - 30, 60, 30); cc.fillStyle = '#4D7C0F'; cc.beginPath(); cc.moveTo(Wt.x - 36, Wt.y - Wt.H - 30); cc.lineTo(Wt.x, Wt.y - Wt.H - 56); cc.lineTo(Wt.x + 36, Wt.y - Wt.H - 30); cc.fill();
      cc.fillStyle = GOLD; cc.fillRect(Wt.x - 1, Wt.y - Wt.H - 90, 2, 34); cc.beginPath(); cc.moveTo(Wt.x + 1, Wt.y - Wt.H - 90); cc.lineTo(Wt.x + 22 + Math.sin(k.t * 3) * 3, Wt.y - Wt.H - 83); cc.lineTo(Wt.x + 1, Wt.y - Wt.H - 76); cc.fill(); }) });
    D.stations.forEach(s => out.push({ x: s.x, y: s.y - 32, draw: c => kiosk3d(c, 'g8or' + s.id, { x: s.x, y: s.y, col: s.col, sign: `${s.icon} ${s.label}` }, [s.col, GOLD, '#FFFFFF', OLIVE]) }));
    D.STALLS.forEach(([x, y, col]) => out.push({ x, y, draw: c => stall(c, x, y, col) }));
    D.BANNERS.flat().forEach(([x, y]) => out.push({ x, y, draw: c => upright(c, x, y, cc => { cc.fillStyle = '#64748B'; cc.fillRect(x - 2.5, y - 124, 5, 124); cc.fillStyle = GOLD; cc.beginPath(); cc.arc(x, y - 126, 5, 0, 7); cc.fill(); }) }));
    const L = { building3d, stoneBox, sidrCached, palmCached, bench, upright, leanAt };
    D.HOMES.forEach((Hm, i) => out.push(...houseItems2D(Hm, L, 'g8or' + i, t)));
    out.push(...streetItems2D(D.life, D.STREET, { upright, bench, signboard }, t));
    const M = D.MOSQUE, N2 = D.MINARET;
    out.push({ x: M.x + M.w / 2, y: M.y + M.h, draw: c => { building3d(c, 'g8ormosque', M); const { lx, ly } = leanAt(M.x + M.w / 2, M.y + M.h); c.save(); c.translate(lx * M.H, -M.H * (1 - ly)); minaret(c, 'g8orminaret', N2.x, N2.y, N2.s, N2.H); c.restore(); } });
    D.PALMS.forEach(([x, y, s]) => out.push({ x, y, draw: c => palmCached(c, x, y, s, false, t) }));
    D.LAMPS.forEach(([x, y]) => out.push({ x, y, draw: c => streetLamp(c, x, y, t, false) }));
    const R = D.RING; out.push({ x: R.x, y: R.y + 20, draw: c => upright(c, R.x, R.y + 20, cc => { const y = R.y + 20; cc.fillStyle = '#E7E5E4'; cc.beginPath(); cc.ellipse(R.x, y - 12, 56, 18, 0, 0, 7); cc.fill(); cc.fillStyle = '#A8A29E'; cc.fillRect(R.x - 56, y - 12, 112, 8); oryx2d(cc, R.x, y - 14, 1.6, 1, 0); }) });
    out.push({ x: R.x, y: YARD - 40, draw: c => upright(c, R.x, YARD - 40, cc => { cc.fillStyle = OLIVE; cc.fillRect(R.x - 98, YARD - 170, 12, 130); cc.fillRect(R.x + 86, YARD - 170, 12, 130); cc.fillRect(R.x - 106, YARD - 178, 212, 14);
      for (let q = 0; q < 9; q++) { cc.fillStyle = FLAGS[q % 5]; cc.beginPath(); cc.arc(R.x - 96 + q * 24, YARD - 171, 4, 0, 7); cc.fill(); }
      signboard(cc, R.x, YARD - 142, '🦌 محمية المها'); }) });
    return out;
  };
  const over = (c, t) => { D.HOMES.forEach(Hm => houseSmoke2D(Hm, c, t)); birds2D(c, D.life, D.STREET, t);
    D.BANNERS.forEach(([a, b], i) => bunting(c, elev(a[0], a[1], 120), elev(b[0], b[1], 120), 26, 12, FLAGS.slice(i % 2).concat(FLAGS.slice(0, i % 2)), t));
    bunting(c, elev(254, 1000, 110), elev(506, 1000, 110), 26, 11, FLAGS, t); };
  function station(c, s, t, st) {
    const done = st && st.doneIds && st.doneIds[s.id];
    if (done) { c.fillStyle = '#16A34A'; c.beginPath(); c.arc(s.x + 64, s.y - 60, 15, 0, 7); c.fill(); c.fillStyle = '#fff'; c.font = '900 18px Cairo'; c.textAlign = 'center'; c.fillText('✓', s.x + 64, s.y - 54); }
  }
  return { ground, groundLive, items, over, station };
}
