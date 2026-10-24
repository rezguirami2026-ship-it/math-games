// دار الفسيفساء في العرض العادي بأدوات العالم المفتوح: ورشة البلاط وفرن الطين بدخانه، والدار الكبيرة وفناؤها المبلّط بنجوم ثمانية
// ونوافذ زجاج ملوّن تبرق، والقبة المزخرفة، والجدار المرمَّم بسقالته، والنافورة الثمانية بمائها، ونصب النجمة الثمانية في الدوّار.
import { pattern, building3d, box3d, minaret, leanAt, stall, palmCached, streetLamp, signboard, upright, boxShadow, blobShadow, stoneBox, sidrCached, bench, bunting, elev, kiosk3d } from '../../../world/art.js';
import { houseItems2D, houseSmoke2D } from '../../houses.js';
import { paintStreets, streetItems2D, birds2D } from '../../street.js';

const GOLD = '#D97706', NAVY = '#1E3A8A', TEAL = '#0F766E', FLAGS = [NAVY, '#FFFFFF', GOLD, TEAL, '#DB2777'];
const star8 = (g, x, y, r, c1, c2) => { g.fillStyle = c1; g.beginPath(); for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8 + Math.PI / 16, rr = k % 2 ? r * .45 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.fill(); g.fillStyle = c2; g.beginPath(); g.arc(x, y, r * .28, 0, 7); g.fill(); };
export function kit2d(D) {
  const { YARD, TOP } = D, W = D.size.w, H = D.size.h, C = D.COURT, F = D.FOUNT8, Wr = D.WALLR, K = D.KILN;
  function ground(g, x0, y0, w, h) {
    g.fillStyle = '#E6CFA2'; g.fillRect(x0, y0, w, h); g.fillStyle = pattern(g, 'sand'); g.fillRect(x0, y0, w, h);
    g.fillStyle = '#C9A26E'; g.fillRect(0, 0, W, TOP);
    const paver = (x, y, w2, h2, col = '#E2D3B5') => { g.fillStyle = col; g.fillRect(x, y, w2, h2); g.fillStyle = pattern(g, 'pavers'); g.globalAlpha = .5; g.fillRect(x, y, w2, h2); g.globalAlpha = 1; g.strokeStyle = '#B9A47E'; g.lineWidth = 3; g.strokeRect(x, y, w2, h2); };
    paver(130, 150, 2210, 670, '#EFE6D2'); paver(140, D.PROM.y0, 2190, D.PROM.y1 - D.PROM.y0, '#DCCBA8'); paver(290, D.PROM.y1, 160, YARD - D.PROM.y1, '#DCCBA8');
    // الفناء: نجوم ثمانية بالأزرق والذهبي على أرضية بيضاء، وإطار
    g.fillStyle = '#FFFBF2'; g.fillRect(C.x, C.y, C.w, C.h); for (let y = C.y + 24; y < C.y + C.h; y += 46) for (let x = C.x + 24 + ((y - C.y) / 46 % 2) * 23; x < C.x + C.w; x += 46) star8(g, x, y, 18, (x + y) % 3 ? NAVY : TEAL, GOLD);
    g.strokeStyle = NAVY; g.lineWidth = 6; g.strokeRect(C.x + 3, C.y + 3, C.w - 6, C.h - 6);
    // النافورة الثمانية: حوض ثماني بماء
    const oct = (r, fill) => { g.fillStyle = fill; g.beginPath(); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4 + Math.PI / 8; g.lineTo(F.x + Math.cos(a) * r, F.y + Math.sin(a) * r); } g.closePath(); g.fill(); };
    oct(F.r + 10, '#94A3B8'); oct(F.r, '#38BDF8'); oct(F.r * .35, '#E2E8F0');
    g.fillStyle = 'rgba(70,40,15,.25)'; g.beginPath(); g.arc(K.x + 8, K.y + 6, K.r, 0, 7); g.fill();
    D.stations.forEach(s => paver(s.x - 70, s.y - 30, 140, 110, '#E8DCC2'));
    // نجمة النصب على أرض الدوّار
    star8(g, D.RING.x, D.RING.y, 60, 'rgba(30,58,138,.35)', 'rgba(217,119,6,.5)');
    paintStreets(g, D.STREET, W, H);
    D.HOMES.forEach(Hm => { Hm.parts.forEach(b => boxShadow(g, b.x, b.y, b.w, b.h, b.H || 96)); Hm.walls.forEach(q => boxShadow(g, q.x, q.y, q.w, q.h, 26)); });
    boxShadow(g, D.MOSQUE.x, D.MOSQUE.y, D.MOSQUE.w, D.MOSQUE.h, 84); [D.WORK, D.DAR, D.DOME].forEach(b => boxShadow(g, b.x, b.y, b.w, b.h, b.H)); boxShadow(g, Wr.x, Wr.y, Wr.w, Wr.h, Wr.H);
    D.stations.forEach(s => boxShadow(g, s.x - 52, s.y - 56, 104, 24, 70));
  }
  // ماء النافورة يتموج ونافورتها الصغيرة
  const groundLive = (c, t) => { c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 2; for (let k = 0; k < 3; k++) { const r = ((t * 14 + k * 14) % 42) + 8; c.beginPath(); c.arc(F.x, F.y, r, 0, 7); c.stroke(); } };
  const items = t => {
    const out = [], k = D.kit;
    out.push({ x: D.WORK.x + D.WORK.w / 2, y: D.WORK.y + D.WORK.h, draw: c => building3d(c, 'g8mswork', D.WORK) });
    // فرن الطين: قبة طينية بفتحة متوهجة ودخان
    out.push({ x: K.x, y: K.y + K.r * .4, draw: c => upright(c, K.x, K.y + K.r * .4, cc => { cc.fillStyle = '#B45309'; cc.beginPath(); cc.ellipse(K.x, K.y, K.r, K.r * .95, 0, Math.PI, 0); cc.lineTo(K.x + K.r, K.y + K.r * .4); cc.lineTo(K.x - K.r, K.y + K.r * .4); cc.closePath(); cc.fill();
      cc.fillStyle = `rgba(251,146,60,${.7 + Math.sin(k.t * 6) * .2})`; cc.beginPath(); cc.ellipse(K.x, K.y + 10, 12, 14, 0, Math.PI, 0); cc.fill(); cc.fillRect(K.x - 12, K.y + 10, 24, 14);
      for (let q = 0; q < 3; q++) { const u = (k.t * .4 + q / 3) % 1; cc.fillStyle = `rgba(120,113,108,${.4 * (1 - u)})`; cc.beginPath(); cc.arc(K.x + Math.sin(u * 5 + q) * 8, K.y - K.r - u * 60, 8 + u * 10, 0, 7); cc.fill(); } }) });
    out.push({ x: D.DAR.x + D.DAR.w / 2, y: D.DAR.y + D.DAR.h, draw: c => { building3d(c, 'g8msdar', D.DAR);
      upright(c, D.DAR.x + D.DAR.w / 2, D.DAR.y + D.DAR.h, cc => { for (let q = 0; q < 4; q++) { const x = D.DAR.x + 60 + q * (D.DAR.w - 120) / 3, y = D.DAR.y + D.DAR.h - 98; cc.fillStyle = ['#2563EB', '#DB2777', '#16A34A', '#F59E0B'][q]; cc.globalAlpha = .7 + Math.sin(k.t * 2 + q) * .2; cc.beginPath(); cc.moveTo(x - 14, y + 30); cc.lineTo(x - 14, y); cc.quadraticCurveTo(x, y - 18, x + 14, y); cc.lineTo(x + 14, y + 30); cc.fill(); cc.globalAlpha = 1; cc.strokeStyle = '#FFF'; cc.lineWidth = 1.5; cc.stroke(); } }); } });
    // القبة المزخرفة: مبنى وقبة مخططة بنجمة في الوسط
    const Dm = D.DOME; out.push({ x: Dm.x + Dm.w / 2, y: Dm.y + Dm.h, draw: c => { building3d(c, 'g8msdome', Dm); const { lx, ly } = leanAt(Dm.x + Dm.w / 2, Dm.y + Dm.h); c.save(); c.translate(lx * Dm.H, -Dm.H * (1 - ly));
      const cx = Dm.x + Dm.w / 2, cy = Dm.y + Dm.h / 2 - Dm.H, R = Dm.w * .32; c.fillStyle = '#0F766E'; c.beginPath(); c.ellipse(cx, cy, R, R * .9, 0, Math.PI, 0); c.fill(); c.strokeStyle = '#FDE68A'; c.lineWidth = 2; for (let q = 1; q < 6; q++) { c.beginPath(); c.ellipse(cx, cy, R * q / 6, R * .9, 0, Math.PI, 0); c.stroke(); }
      star8(c, cx, cy - R * .55, 12, GOLD, '#FFF'); c.restore(); } });
    // الجدار المرمَّم: حجارة قديمة نصفها مكسو ببلاط جديد، وسقالة بأعمدة وألواح
    out.push({ x: Wr.x + Wr.w / 2, y: Wr.y + Wr.h, draw: c => { stoneBox(c, Wr.x, Wr.y, Wr.w, Wr.h, Wr.H, '#D6C4A0', true);
      upright(c, Wr.x + Wr.w / 2, Wr.y + Wr.h + 30, cc => { const yb = Wr.y + Wr.h + 30; for (let q = 0; q < 5; q++) { const x = Wr.x + 30 + q * 90; cc.fillStyle = '#78716C'; cc.fillRect(x - 3, yb - 170, 6, 170); }
        [60, 115, 160].forEach(hh => { cc.fillStyle = '#B98A55'; cc.fillRect(Wr.x + 24, yb - hh, 372, 8); });
        cc.strokeStyle = '#78716C'; cc.lineWidth = 2; for (let q = 0; q < 4; q++) { const x = Wr.x + 30 + q * 90; cc.beginPath(); cc.moveTo(x, yb - 60); cc.lineTo(x + 90, yb - 115); cc.stroke(); } }); } });
    D.stations.forEach(s => out.push({ x: s.x, y: s.y - 32, draw: c => kiosk3d(c, 'g8ms' + s.id, { x: s.x, y: s.y, col: s.col, sign: `${s.icon} ${s.label}` }, [s.col, GOLD, '#FFFFFF', NAVY]) }));
    D.STALLS.forEach(([x, y, col]) => out.push({ x, y, draw: c => stall(c, x, y, col) }));
    D.BANNERS.flat().forEach(([x, y]) => out.push({ x, y, draw: c => upright(c, x, y, cc => { cc.fillStyle = '#64748B'; cc.fillRect(x - 2.5, y - 124, 5, 124); cc.fillStyle = GOLD; cc.beginPath(); cc.arc(x, y - 126, 5, 0, 7); cc.fill(); }) }));
    // نافورة الماء الصاعد في وسط الحوض
    out.push({ x: F.x, y: F.y, draw: c => upright(c, F.x, F.y, cc => { cc.fillStyle = '#CBD5E1'; cc.fillRect(F.x - 6, F.y - 34, 12, 34); for (let q = 0; q < 6; q++) { const a = q * Math.PI / 3 + k.t, u = (k.t * 1.5 + q / 6) % 1; cc.fillStyle = `rgba(186,230,253,${1 - u})`; cc.beginPath(); cc.arc(F.x + Math.cos(a) * u * 26, F.y - 40 - Math.sin(u * Math.PI) * 24, 3, 0, 7); cc.fill(); } }) });
    const L = { building3d, stoneBox, sidrCached, palmCached, bench, upright, leanAt };
    D.HOMES.forEach((Hm, i) => out.push(...houseItems2D(Hm, L, 'g8ms' + i, t)));
    out.push(...streetItems2D(D.life, D.STREET, { upright, bench, signboard }, t));
    const M = D.MOSQUE, N2 = D.MINARET;
    out.push({ x: M.x + M.w / 2, y: M.y + M.h, draw: c => { building3d(c, 'g8msmosque', M); const { lx, ly } = leanAt(M.x + M.w / 2, M.y + M.h); c.save(); c.translate(lx * M.H, -M.H * (1 - ly)); minaret(c, 'g8msminaret', N2.x, N2.y, N2.s, N2.H); c.restore(); } });
    D.PALMS.forEach(([x, y, s]) => out.push({ x, y, draw: c => palmCached(c, x, y, s, false, t) }));
    D.LAMPS.forEach(([x, y]) => out.push({ x, y, draw: c => streetLamp(c, x, y, t, false) }));
    // نصب النجمة الثمانية: نجمة قائمة على قاعدة
    const R = D.RING; out.push({ x: R.x, y: R.y + 20, draw: c => upright(c, R.x, R.y + 20, cc => { const y = R.y + 20; cc.fillStyle = '#E7E5E4'; cc.beginPath(); cc.ellipse(R.x, y - 12, 56, 18, 0, 0, 7); cc.fill(); cc.fillStyle = '#A8A29E'; cc.fillRect(R.x - 56, y - 12, 112, 8); cc.fillStyle = '#57534E'; cc.fillRect(R.x - 4, y - 50, 8, 40); star8(cc, R.x, y - 92, 44, NAVY, GOLD); }) });
    out.push({ x: R.x, y: YARD - 40, draw: c => upright(c, R.x, YARD - 40, cc => { cc.fillStyle = NAVY; cc.fillRect(R.x - 98, YARD - 170, 12, 130); cc.fillRect(R.x + 86, YARD - 170, 12, 130); cc.fillRect(R.x - 106, YARD - 178, 212, 14);
      for (let q = 0; q < 9; q++) { cc.fillStyle = q % 2 ? GOLD : TEAL; cc.beginPath(); cc.arc(R.x - 96 + q * 24, YARD - 171, 4, 0, 7); cc.fill(); }
      signboard(cc, R.x, YARD - 142, '🔷 دار الفسيفساء'); }) });
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
