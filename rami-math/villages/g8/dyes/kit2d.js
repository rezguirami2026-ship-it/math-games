// مصبغة الألوان في العرض العادي بأدوات العالم المفتوح: أحواض الصبغ الملوّنة بحوافها الحجرية وصبّاغين حولها، وقناة الماء بجسرها، وحبال التجفيف
// بأقمشة طويلة تتموج، وتعاونية النسيج، ومحل الطلاء بعلبه، ومخزن الجملة بسقفه المعدني وصناديقه، وأكشاك الدروس، ونصب عجلة الألوان في الدوّار.
import { pattern, building3d, box3d, minaret, leanAt, stall, palmCached, streetLamp, signboard, upright, boxShadow, blobShadow, stoneBox, sidrCached, bench, bunting, elev, kiosk3d } from '../../../world/art.js';
import { houseItems2D, houseSmoke2D } from '../../houses.js';
import { paintStreets, streetItems2D, birds2D } from '../../street.js';

const GOLD = '#FACC15', FLAGS = ['#DC2626', '#FACC15', '#2563EB', '#16A34A', '#7C3AED'];
export function kit2d(D) {
  const { YARD, TOP } = D, W = D.size.w, H = D.size.h, C = D.CANAL, St = D.STORE;
  function ground(g, x0, y0, w, h) {
    g.fillStyle = '#E6CFA2'; g.fillRect(x0, y0, w, h); g.fillStyle = pattern(g, 'sand'); g.fillRect(x0, y0, w, h);
    g.fillStyle = '#C9A26E'; g.fillRect(0, 0, W, TOP); g.fillStyle = 'rgba(120,80,40,.25)'; for (let x = 0; x < W; x += 80) { g.beginPath(); g.moveTo(x, TOP); g.lineTo(x + 40, TOP - 50 - (x % 160 ? 10 : 0)); g.lineTo(x + 80, TOP); g.fill(); }
    const paver = (x, y, w2, h2, col = '#E2D3B5') => { g.fillStyle = col; g.fillRect(x, y, w2, h2); g.fillStyle = pattern(g, 'pavers'); g.globalAlpha = .5; g.fillRect(x, y, w2, h2); g.globalAlpha = 1; g.strokeStyle = '#B9A47E'; g.lineWidth = 3; g.strokeRect(x, y, w2, h2); };
    // أرض المصبغة: طين مدكوك حول الأحواض، وبلاط في الشرق، وممشى
    g.fillStyle = '#D9B98A'; g.fillRect(130, 150, 580, 400); g.fillStyle = pattern(g, 'soil'); g.globalAlpha = .35; g.fillRect(130, 150, 580, 400); g.globalAlpha = 1;
    paver(720, 150, 1620, 420, '#E8DCC2'); paver(140, D.PROM.y0, 2190, D.PROM.y1 - D.PROM.y0, '#D8C3A0'); paver(290, D.PROM.y1, 160, YARD - D.PROM.y1, '#D8C3A0');
    g.fillStyle = '#9BC46A'; [[150, 690, 260, 100], [800, 690, 220, 100], [1860, 700, 300, 90]].forEach(([x, y, a, b]) => { g.fillRect(x, y, a, b); g.strokeStyle = '#7A6A4E'; g.lineWidth = 3; g.strokeRect(x, y, a, b); });
    // الأحواض: حافة حجرية وصبغ بلونه وبقع حولها
    D.VATS.forEach(([x, y, r, col]) => { g.fillStyle = 'rgba(70,40,15,.18)'; g.beginPath(); g.ellipse(x + 6, y + 8, r + 10, (r + 10) * .8, 0, 0, 7); g.fill();
      g.fillStyle = '#CDB48E'; g.beginPath(); g.arc(x, y, r + 9, 0, 7); g.fill(); g.strokeStyle = '#8C7352'; g.lineWidth = 3; g.stroke();
      g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.arc(x + 4, y + 4, r - 4, 0, 7); g.fill(); g.fillStyle = col; g.beginPath(); g.arc(x - 2, y - 2, r - 7, 0, 7); g.fill();
      g.fillStyle = col; g.globalAlpha = .25; for (let q = 0; q < 4; q++) { const a = q * 1.7 + x; g.beginPath(); g.arc(x + Math.cos(a) * (r + 18), y + Math.sin(a) * (r + 14), 5, 0, 7); g.fill(); } g.globalAlpha = 1; });
    // قناة الماء وجسرها
    g.fillStyle = '#7C6A52'; g.fillRect(C.x0, C.y - 16, C.x1 - C.x0, 32); g.fillStyle = '#3B82C4'; g.fillRect(C.x0 + 4, C.y - 11, C.x1 - C.x0 - 8, 22);
    g.fillStyle = '#B08A5A'; g.fillRect(C.x1 - 78, C.y - 20, 70, 40); g.strokeStyle = '#7A5A30'; g.lineWidth = 2; for (let x = C.x1 - 74; x < C.x1 - 10; x += 10) { g.beginPath(); g.moveTo(x, C.y - 20); g.lineTo(x, C.y + 20); g.stroke(); }
    // أرض المخزن
    g.fillStyle = '#9CA3AF'; g.fillRect(St.x - 20, St.y + St.h, St.w + 40, 140); g.fillStyle = pattern(g, 'asphalt'); g.globalAlpha = .5; g.fillRect(St.x - 20, St.y + St.h, St.w + 40, 140); g.globalAlpha = 1;
    D.stations.forEach(s => paver(s.x - 70, s.y - 30, 140, 110, '#EADBC0'));
    paintStreets(g, D.STREET, W, H);
    D.HOMES.forEach(Hm => { Hm.parts.forEach(b => boxShadow(g, b.x, b.y, b.w, b.h, b.H || 96)); Hm.walls.forEach(q => boxShadow(g, q.x, q.y, q.w, q.h, 26)); });
    boxShadow(g, D.MOSQUE.x, D.MOSQUE.y, D.MOSQUE.w, D.MOSQUE.h, 84);
    [D.COOP, D.PAINT].forEach(b => boxShadow(g, b.x, b.y, b.w, b.h, b.H)); boxShadow(g, St.x, St.y, St.w, St.h, St.H);
    D.stations.forEach(s => boxShadow(g, s.x - 52, s.y - 56, 104, 24, 70));
  }
  // تموج الماء في القناة والأحواض
  const groundLive = (c, t) => { c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = 2; for (let x = C.x0 + 10; x < C.x1 - 90; x += 34) { const o = (t * 30) % 34; c.beginPath(); c.moveTo(x + o, C.y - 2); c.lineTo(x + o + 12, C.y - 2); c.stroke(); }
    D.VATS.forEach(([x, y, r], k) => { c.strokeStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(x + Math.sin(t + k) * 6, y - 4, r * .4, r * .12, 0, 0, 7); c.stroke(); }); };
  const items = t => {
    const out = [], k = D.kit;
    // حبال التجفيف: أعمدة خشبية وأقمشة طويلة تتموج
    D.LINES.forEach(([a, b, y], j) => { [a, (a + b) / 2, b].forEach(x => out.push({ x, y, draw: c => upright(c, x, y, cc => { cc.fillStyle = '#7A4A22'; cc.fillRect(x - 3, y - 130, 6, 130); cc.fillRect(x - 12, y - 132, 24, 5); }) }));
      out.push({ x: (a + b) / 2, y: y + 1, draw: c => upright(c, (a + b) / 2, y + 1, cc => { cc.strokeStyle = '#57534E'; cc.lineWidth = 1.5; cc.beginPath(); cc.moveTo(a, y - 126); cc.quadraticCurveTo((a + b) / 2, y - 112, b, y - 126); cc.stroke();
        for (let q = 0; q < 9; q++) { const x = a + 20 + q * (b - a - 40) / 8, top = y - 124 + Math.sin(Math.PI * (x - a) / (b - a)) * 12, len = 70 + (q % 3) * 10, sw = Math.sin(k.t * 2 + q + j) * 5;
          cc.fillStyle = D.VATS[(q + j * 3) % 12][3]; cc.beginPath(); cc.moveTo(x - 14, top); cc.lineTo(x + 14, top); cc.quadraticCurveTo(x + 16 + sw, top + len / 2, x + 14 + sw, top + len); cc.lineTo(x - 14 + sw, top + len); cc.quadraticCurveTo(x - 16 + sw, top + len / 2, x - 14, top); cc.fill();
          cc.fillStyle = 'rgba(0,0,0,.12)'; cc.fillRect(x + 4 + sw * .5, top, 4, len); } }) }); });
    out.push({ x: D.COOP.x + D.COOP.w / 2, y: D.COOP.y + D.COOP.h, draw: c => building3d(c, 'g8dycoop', D.COOP) });
    out.push({ x: D.PAINT.x + D.PAINT.w / 2, y: D.PAINT.y + D.PAINT.h, draw: c => { building3d(c, 'g8dypaint', D.PAINT);
      upright(c, D.PAINT.x + D.PAINT.w / 2, D.PAINT.y + D.PAINT.h + 2, cc => { for (let q = 0; q < 7; q++) { const x = D.PAINT.x + 22 + q * 34, y = D.PAINT.y + D.PAINT.h + 2; cc.fillStyle = FLAGS[q % 5]; cc.fillRect(x - 11, y - 22, 22, 22); cc.fillStyle = '#E5E7EB'; cc.fillRect(x - 11, y - 25, 22, 4); cc.strokeStyle = '#475569'; cc.lineWidth = 1; cc.strokeRect(x - 11, y - 22, 22, 22); } }); } });
    // مخزن الجملة: جدران معدنية مموجة وسقف مقوّس وباب لفّاف
    out.push({ x: St.x + St.w / 2, y: St.y + St.h, draw: c => box3d(c, 'g8dystore', St, '#94A3B8',
      cc => { cc.fillStyle = '#CBD5E1'; cc.fillRect(St.x, St.y - St.H, St.w, St.h); cc.strokeStyle = '#64748B'; cc.lineWidth = 2; for (let x = St.x + 12; x < St.x + St.w; x += 24) { cc.beginPath(); cc.moveTo(x, St.y - St.H); cc.lineTo(x, St.y - St.H + St.h); cc.stroke(); } cc.strokeRect(St.x, St.y - St.H, St.w, St.h); },
      cc => { const yb = St.y + St.h, yt = yb - St.H; cc.fillStyle = '#E2E8F0'; cc.fillRect(St.x, yt, St.w, St.H); cc.strokeStyle = 'rgba(71,85,105,.35)'; cc.lineWidth = 2; for (let x = St.x + 8; x < St.x + St.w; x += 12) { cc.beginPath(); cc.moveTo(x, yt); cc.lineTo(x, yb); cc.stroke(); }
        cc.fillStyle = '#64748B'; cc.fillRect(St.x + St.w / 2 - 60, yb - 84, 120, 84); cc.strokeStyle = '#475569'; for (let y = yb - 80; y < yb; y += 7) { cc.beginPath(); cc.moveTo(St.x + St.w / 2 - 60, y); cc.lineTo(St.x + St.w / 2 + 60, y); cc.stroke(); }
        cc.fillStyle = '#0F766E'; cc.fillRect(St.x, yt, St.w, 24); cc.fillStyle = '#FFF'; cc.font = '900 16px Cairo'; cc.textAlign = 'center'; cc.direction = 'rtl'; cc.fillText('📦 مخزن الجملة', St.x + St.w / 2, yt + 17); cc.strokeStyle = '#334155'; cc.lineWidth = 1.2; cc.strokeRect(St.x, yt, St.w, St.H); }) });
    D.CRATES.forEach(([x, y], i) => out.push({ x, y, draw: c => stoneBox(c, x - 26, y - 22, 52, 22, 34 + (i % 2) * 14, ['#A16207', '#7C3AED', '#0F766E'][i % 3], false) }));
    D.stations.forEach(s => out.push({ x: s.x, y: s.y - 32, draw: c => kiosk3d(c, 'g8dy' + s.id, { x: s.x, y: s.y, col: s.col, sign: `${s.icon} ${s.label}` }, [s.col, GOLD, '#FFFFFF', '#7C3AED']) }));
    D.STALLS.forEach(([x, y, col]) => out.push({ x, y, draw: c => stall(c, x, y, col) }));
    D.BANNERS.flat().forEach(([x, y]) => out.push({ x, y, draw: c => upright(c, x, y, cc => { cc.fillStyle = '#64748B'; cc.fillRect(x - 2.5, y - 124, 5, 124); cc.fillStyle = GOLD; cc.beginPath(); cc.arc(x, y - 126, 5, 0, 7); cc.fill(); }) }));
    const L = { building3d, stoneBox, sidrCached, palmCached, bench, upright, leanAt };
    D.HOMES.forEach((Hm, i) => out.push(...houseItems2D(Hm, L, 'g8dy' + i, t)));
    out.push(...streetItems2D(D.life, D.STREET, { upright, bench, signboard }, t));
    const M = D.MOSQUE, N2 = D.MINARET;
    out.push({ x: M.x + M.w / 2, y: M.y + M.h, draw: c => { building3d(c, 'g8dymosque', M); const { lx, ly } = leanAt(M.x + M.w / 2, M.y + M.h); c.save(); c.translate(lx * M.H, -M.H * (1 - ly)); minaret(c, 'g8dyminaret', N2.x, N2.y, N2.s, N2.H); c.restore(); } });
    D.PALMS.forEach(([x, y, s]) => out.push({ x, y, draw: c => palmCached(c, x, y, s, false, t) }));
    D.LAMPS.forEach(([x, y]) => out.push({ x, y, draw: c => streetLamp(c, x, y, t, false) }));
    // نصب عجلة الألوان في الدوّار: قرص بستة ألوان يدور ببطء على عمود
    const R = D.RING; out.push({ x: R.x, y: R.y + 20, draw: c => upright(c, R.x, R.y + 20, cc => { const y = R.y + 20; cc.fillStyle = '#E7E5E4'; cc.beginPath(); cc.ellipse(R.x, y - 12, 56, 18, 0, 0, 7); cc.fill(); cc.fillStyle = '#A8A29E'; cc.fillRect(R.x - 56, y - 12, 112, 8);
      cc.fillStyle = '#57534E'; cc.fillRect(R.x - 4, y - 70, 8, 58); const cy = y - 104, rr = 40, cols = ['#DC2626', '#F97316', '#FACC15', '#16A34A', '#2563EB', '#7C3AED'];
      cols.forEach((col, q) => { const a1 = k.t * .3 + q * Math.PI / 3; cc.fillStyle = col; cc.beginPath(); cc.moveTo(R.x, cy); cc.ellipse(R.x, cy, rr, rr, 0, a1, a1 + Math.PI / 3); cc.closePath(); cc.fill(); });
      cc.fillStyle = '#FFF'; cc.beginPath(); cc.arc(R.x, cy, 8, 0, 7); cc.fill(); cc.strokeStyle = '#44403C'; cc.lineWidth = 2; cc.beginPath(); cc.arc(R.x, cy, rr, 0, 7); cc.stroke(); }) });
    out.push({ x: R.x, y: YARD - 40, draw: c => upright(c, R.x, YARD - 40, cc => { cc.fillStyle = '#7C3AED'; cc.fillRect(R.x - 98, YARD - 170, 12, 130); cc.fillRect(R.x + 86, YARD - 170, 12, 130); cc.fillRect(R.x - 106, YARD - 178, 212, 14);
      for (let q = 0; q < 9; q++) { cc.fillStyle = FLAGS[q % 5]; cc.beginPath(); cc.arc(R.x - 96 + q * 24, YARD - 171, 4, 0, 7); cc.fill(); }
      signboard(cc, R.x, YARD - 142, '🎨 مصبغة الألوان'); }) });
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
