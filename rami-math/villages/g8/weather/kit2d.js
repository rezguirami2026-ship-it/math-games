// محطة الأرصاد في العرض العادي بأدوات العالم المفتوح: مبنى المحطة، وقبة الرادار على برجها بهوائي يدور، وحديقة الأجهزة المسيّجة (صندوق الأجهزة
// الأبيض بفتحاته، ومقياس المطر، ومروحة الرياح بأكوابها الدوّارة، وكيس الرياح يتمايل)، وبرج الإطلاق بمنطاده يتمايل، واستوديو النشرة، ونصب ميزان الحرارة.
import { pattern, building3d, minaret, leanAt, stall, palmCached, streetLamp, signboard, upright, boxShadow, blobShadow, stoneBox, sidrCached, bench, bunting, elev, kiosk3d } from '../../../world/art.js';
import { houseItems2D, houseSmoke2D } from '../../houses.js';
import { paintStreets, streetItems2D, birds2D } from '../../street.js';

const SKY = '#0369A1', GOLD = '#FACC15', FLAGS = [SKY, '#FFFFFF', '#F59E0B', '#DC2626', '#0F766E'];
export function kit2d(D) {
  const { YARD, TOP } = D, W = D.size.w, H = D.size.h, G = D.GARDEN, Rd = D.RADAR, Tw = D.TOWER;
  function ground(g, x0, y0, w, h) {
    g.fillStyle = '#E6CFA2'; g.fillRect(x0, y0, w, h); g.fillStyle = pattern(g, 'sand'); g.fillRect(x0, y0, w, h);
    g.fillStyle = '#C9A26E'; g.fillRect(0, 0, W, TOP);
    const paver = (x, y, w2, h2, col = '#E2D3B5') => { g.fillStyle = col; g.fillRect(x, y, w2, h2); g.fillStyle = pattern(g, 'pavers'); g.globalAlpha = .5; g.fillRect(x, y, w2, h2); g.globalAlpha = 1; g.strokeStyle = '#B9A47E'; g.lineWidth = 3; g.strokeRect(x, y, w2, h2); };
    paver(130, 150, 2210, 670, '#E5E1D8'); paver(140, D.PROM.y0, 2190, D.PROM.y1 - D.PROM.y0, '#D4CDBF'); paver(290, D.PROM.y1, 160, YARD - D.PROM.y1, '#D4CDBF');
    g.fillStyle = '#86B85A'; g.fillRect(G.x, G.y, G.w, G.h); g.fillStyle = 'rgba(40,90,30,.12)'; for (let x = G.x; x < G.x + G.w; x += 40) g.fillRect(x, G.y, 20, G.h);
    g.fillStyle = '#CBD5E1'; g.beginPath(); g.arc(Tw.x, Tw.y, 70, 0, 7); g.fill(); g.strokeStyle = '#F8FAFC'; g.lineWidth = 4; g.beginPath(); g.arc(Tw.x, Tw.y, 54, 0, 7); g.stroke(); g.fillStyle = '#F8FAFC'; g.font = '900 34px Cairo'; g.textAlign = 'center'; g.fillText('H', Tw.x, Tw.y + 12);
    D.stations.forEach(s => paver(s.x - 70, s.y - 30, 140, 110, '#E2DED4'));
    paintStreets(g, D.STREET, W, H);
    D.HOMES.forEach(Hm => { Hm.parts.forEach(b => boxShadow(g, b.x, b.y, b.w, b.h, b.H || 96)); Hm.walls.forEach(q => boxShadow(g, q.x, q.y, q.w, q.h, 26)); });
    boxShadow(g, D.MOSQUE.x, D.MOSQUE.y, D.MOSQUE.w, D.MOSQUE.h, 84); [D.STATION, D.STUDIO].forEach(b => boxShadow(g, b.x, b.y, b.w, b.h, b.H)); blobShadow(g, Rd.x, Rd.y, Rd.r * .6, Rd.H + Rd.r);
    D.stations.forEach(s => boxShadow(g, s.x - 52, s.y - 56, 104, 24, 70));
  }
  const items = t => {
    const out = [], k = D.kit;
    out.push({ x: D.STATION.x + D.STATION.w / 2, y: D.STATION.y + D.STATION.h, draw: c => building3d(c, 'g8westation', D.STATION) });
    out.push({ x: D.STUDIO.x + D.STUDIO.w / 2, y: D.STUDIO.y + D.STUDIO.h, draw: c => { building3d(c, 'g8westudio', D.STUDIO);
      upright(c, D.STUDIO.x + D.STUDIO.w / 2, D.STUDIO.y + D.STUDIO.h, cc => { const x = D.STUDIO.x + D.STUDIO.w / 2, y = D.STUDIO.y + D.STUDIO.h - D.STUDIO.H - 6; cc.fillStyle = '#0F172A'; cc.fillRect(x - 60, y - 54, 120, 54); cc.fillStyle = '#38BDF8'; cc.fillRect(x - 54, y - 48, 108, 42); cc.fillStyle = GOLD; cc.beginPath(); cc.arc(x - 30, y - 30, 9 + Math.sin(k.t * 2), 0, 7); cc.fill(); cc.fillStyle = '#FFF'; cc.beginPath(); cc.arc(x + 10, y - 24, 12, 0, 7); cc.arc(x + 24, y - 26, 10, 0, 7); cc.fill(); }); } });
    // قبة الرادار على برجها وهوائي يدور
    out.push({ x: Rd.x, y: Rd.y, draw: c => upright(c, Rd.x, Rd.y, cc => { cc.fillStyle = '#94A3B8'; cc.fillRect(Rd.x - 22, Rd.y - Rd.H, 44, Rd.H); cc.fillStyle = '#F8FAFC'; cc.beginPath(); cc.arc(Rd.x, Rd.y - Rd.H - 10, Rd.r * .62, Math.PI, 0); cc.fill(); cc.beginPath(); cc.ellipse(Rd.x, Rd.y - Rd.H - 10, Rd.r * .62, 10, 0, 0, Math.PI); cc.fill();
      cc.strokeStyle = '#CBD5E1'; cc.lineWidth = 1.5; for (let q = 1; q < 4; q++) { cc.beginPath(); cc.ellipse(Rd.x, Rd.y - Rd.H - 10, Rd.r * .62 * q / 4, Rd.r * .6, 0, Math.PI, 0); cc.stroke(); }
      const a = k.t * 1.5; cc.strokeStyle = '#475569'; cc.lineWidth = 3; cc.beginPath(); cc.moveTo(Rd.x, Rd.y - Rd.H - Rd.r * .62 - 10); cc.lineTo(Rd.x + Math.cos(a) * 18, Rd.y - Rd.H - Rd.r * .62 - 24); cc.stroke(); }) });
    // سياج حديقة الأجهزة
    for (let x = G.x; x <= G.x + G.w; x += 52) [G.y, G.y + G.h].forEach(y => out.push({ x, y, draw: c => upright(c, x, y, cc => { cc.fillStyle = '#F8FAFC'; cc.fillRect(x - 2, y - 30, 4, 30); cc.fillRect(x - 2, y - 26, 52, 3); cc.fillRect(x - 2, y - 12, 52, 3); }) }));
    // صندوق الأجهزة الأبيض بفتحات
    const Sc = D.SCREEN; out.push({ x: Sc.x, y: Sc.y + 10, draw: c => upright(c, Sc.x, Sc.y + 10, cc => { cc.fillStyle = '#E5E7EB'; cc.fillRect(Sc.x - 4, Sc.y - 40, 8, 50); cc.fillStyle = '#FFFFFF'; cc.fillRect(Sc.x - 30, Sc.y - 90, 60, 52); cc.strokeStyle = '#94A3B8'; cc.lineWidth = 1.5; for (let y = Sc.y - 84; y < Sc.y - 40; y += 6) { cc.beginPath(); cc.moveTo(Sc.x - 26, y); cc.lineTo(Sc.x + 26, y + 3); cc.stroke(); } cc.fillStyle = '#CBD5E1'; cc.fillRect(Sc.x - 34, Sc.y - 96, 68, 8); }) });
    // مقياس المطر
    const Ga = D.GAUGE; out.push({ x: Ga.x, y: Ga.y, draw: c => upright(c, Ga.x, Ga.y, cc => { cc.fillStyle = '#64748B'; cc.fillRect(Ga.x - 10, Ga.y - 48, 20, 48); cc.fillStyle = '#93C5FD'; cc.fillRect(Ga.x - 6, Ga.y - 20 - Math.sin(k.t * .5) * 4, 12, 18 + Math.sin(k.t * .5) * 4); cc.fillStyle = '#334155'; cc.beginPath(); cc.ellipse(Ga.x, Ga.y - 48, 14, 4, 0, 0, 7); cc.fill(); }) });
    // مروحة الرياح وأكوابها
    const V = D.VANE; out.push({ x: V.x, y: V.y, draw: c => upright(c, V.x, V.y, cc => { cc.fillStyle = '#475569'; cc.fillRect(V.x - 2, V.y - 110, 4, 110); for (let q = 0; q < 3; q++) { const a = k.t * 5 + q * 2.09; const ex = V.x + Math.cos(a) * 24, ey = V.y - 110 + Math.sin(a) * 8; cc.strokeStyle = '#475569'; cc.lineWidth = 2; cc.beginPath(); cc.moveTo(V.x, V.y - 110); cc.lineTo(ex, ey); cc.stroke(); cc.fillStyle = '#F97316'; cc.beginPath(); cc.arc(ex, ey, 6, 0, 7); cc.fill(); } }) });
    // كيس الرياح
    const So = D.SOCK; out.push({ x: So.x, y: So.y, draw: c => upright(c, So.x, So.y, cc => { cc.fillStyle = '#475569'; cc.fillRect(So.x - 2, So.y - 90, 4, 90); const sw = Math.sin(k.t * 2) * 6; for (let q = 0; q < 5; q++) { cc.fillStyle = q % 2 ? '#FFFFFF' : '#F97316'; const x0 = So.x + 2 + q * 11, w0 = 11; cc.beginPath(); cc.moveTo(x0, So.y - 90 + q * 1.2 + sw * q / 5); cc.lineTo(x0 + w0, So.y - 90 + (q + 1) * 1.2 + sw * (q + 1) / 5); cc.lineTo(x0 + w0, So.y - 76 - (q + 1) * 1.2 + sw * (q + 1) / 5); cc.lineTo(x0, So.y - 76 - q * 1.2 + sw * q / 5); cc.fill(); } }) });
    // برج الإطلاق ومنطاد الرصد مربوطاً بحبل
    out.push({ x: Tw.x, y: Tw.y + 4, draw: c => upright(c, Tw.x, Tw.y + 4, cc => { cc.strokeStyle = '#64748B'; cc.lineWidth = 4; [[-28], [28]].forEach(([a]) => { cc.beginPath(); cc.moveTo(Tw.x + a, Tw.y); cc.lineTo(Tw.x + a * .3, Tw.y - Tw.H); cc.stroke(); }); for (let y = Tw.y - 30; y > Tw.y - Tw.H; y -= 30) { cc.lineWidth = 2; cc.beginPath(); cc.moveTo(Tw.x - 26 * (y - Tw.y + Tw.H) / Tw.H - 8, y); cc.lineTo(Tw.x + 26 * (y - Tw.y + Tw.H) / Tw.H + 8, y); cc.stroke(); }
      const bx = Tw.x + Math.sin(k.t * .8) * 14, by = Tw.y - Tw.H - 90 + Math.sin(k.t * 1.3) * 6; cc.strokeStyle = '#334155'; cc.lineWidth = 1.2; cc.beginPath(); cc.moveTo(Tw.x, Tw.y - Tw.H); cc.lineTo(bx, by + 40); cc.stroke();
      cc.fillStyle = '#F8FAFC'; cc.beginPath(); cc.ellipse(bx, by, 34, 40, 0, 0, 7); cc.fill(); cc.strokeStyle = '#CBD5E1'; cc.lineWidth = 2; cc.stroke(); cc.fillStyle = '#F97316'; cc.fillRect(bx - 6, by + 44, 12, 10); }) });
    D.stations.forEach(s => out.push({ x: s.x, y: s.y - 32, draw: c => kiosk3d(c, 'g8we' + s.id, { x: s.x, y: s.y, col: s.col, sign: `${s.icon} ${s.label}` }, [s.col, GOLD, '#FFFFFF', SKY]) }));
    D.STALLS.forEach(([x, y, col]) => out.push({ x, y, draw: c => stall(c, x, y, col) }));
    D.BANNERS.flat().forEach(([x, y]) => out.push({ x, y, draw: c => upright(c, x, y, cc => { cc.fillStyle = '#64748B'; cc.fillRect(x - 2.5, y - 124, 5, 124); cc.fillStyle = GOLD; cc.beginPath(); cc.arc(x, y - 126, 5, 0, 7); cc.fill(); }) }));
    const L = { building3d, stoneBox, sidrCached, palmCached, bench, upright, leanAt };
    D.HOMES.forEach((Hm, i) => out.push(...houseItems2D(Hm, L, 'g8we' + i, t)));
    out.push(...streetItems2D(D.life, D.STREET, { upright, bench, signboard }, t));
    const M = D.MOSQUE, N2 = D.MINARET;
    out.push({ x: M.x + M.w / 2, y: M.y + M.h, draw: c => { building3d(c, 'g8wemosque', M); const { lx, ly } = leanAt(M.x + M.w / 2, M.y + M.h); c.save(); c.translate(lx * M.H, -M.H * (1 - ly)); minaret(c, 'g8weminaret', N2.x, N2.y, N2.s, N2.H); c.restore(); } });
    D.PALMS.forEach(([x, y, s]) => out.push({ x, y, draw: c => palmCached(c, x, y, s, false, t) }));
    D.LAMPS.forEach(([x, y]) => out.push({ x, y, draw: c => streetLamp(c, x, y, t, false) }));
    // نصب ميزان الحرارة العملاق
    const R = D.RING; out.push({ x: R.x, y: R.y + 20, draw: c => upright(c, R.x, R.y + 20, cc => { const y = R.y + 20; cc.fillStyle = '#E7E5E4'; cc.beginPath(); cc.ellipse(R.x, y - 12, 56, 18, 0, 0, 7); cc.fill(); cc.fillStyle = '#A8A29E'; cc.fillRect(R.x - 56, y - 12, 112, 8);
      cc.fillStyle = '#F8FAFC'; cc.beginPath(); cc.roundRect(R.x - 12, y - 150, 24, 130, 12); cc.fill(); cc.strokeStyle = '#94A3B8'; cc.lineWidth = 2; cc.stroke(); cc.fillStyle = '#DC2626'; const lv = 60 + Math.sin(k.t * .3) * 10; cc.fillRect(R.x - 5, y - 30 - lv, 10, lv); cc.beginPath(); cc.arc(R.x, y - 22, 16, 0, 7); cc.fill();
      cc.fillStyle = '#334155'; for (let q = 0; q < 6; q++) cc.fillRect(R.x + 12, y - 40 - q * 18, 8, 2); }) });
    out.push({ x: R.x, y: YARD - 40, draw: c => upright(c, R.x, YARD - 40, cc => { cc.fillStyle = SKY; cc.fillRect(R.x - 98, YARD - 170, 12, 130); cc.fillRect(R.x + 86, YARD - 170, 12, 130); cc.fillRect(R.x - 106, YARD - 178, 212, 14);
      for (let q = 0; q < 9; q++) { cc.fillStyle = FLAGS[q % 5]; cc.beginPath(); cc.arc(R.x - 96 + q * 24, YARD - 171, 4, 0, 7); cc.fill(); }
      signboard(cc, R.x, YARD - 142, '🌦️ محطة الأرصاد'); }) });
    return out;
  };
  const over = (c, t) => { D.HOMES.forEach(Hm => houseSmoke2D(Hm, c, t)); birds2D(c, D.life, D.STREET, t);
    D.BANNERS.forEach(([a, b], i) => bunting(c, elev(a[0], a[1], 120), elev(b[0], b[1], 120), 26, 12, FLAGS.slice(i % 2).concat(FLAGS.slice(0, i % 2)), t));
    bunting(c, elev(254, 1000, 110), elev(506, 1000, 110), 26, 11, FLAGS, t); };
  function station(c, s, t, st) {
    const done = st && st.doneIds && st.doneIds[s.id];
    if (done) { c.fillStyle = '#16A34A'; c.beginPath(); c.arc(s.x + 64, s.y - 60, 15, 0, 7); c.fill(); c.fillStyle = '#fff'; c.font = '900 18px Cairo'; c.textAlign = 'center'; c.fillText('✓', s.x + 64, s.y - 54); }
  }
  return { ground, items, over, station };
}
