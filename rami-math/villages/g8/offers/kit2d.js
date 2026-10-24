// سوق العروض في العرض العادي بأدوات العالم المفتوح: دكاكين السوق المسقوف ورواق أقواسه، وبرج الساعة بعقربين يدوران، ومعرض السيارات
// الزجاجي وسياراته، وبنك السوق بأعمدته، وأكشاك الدروس، وبسطات الفاكهة، وحبال لافتات التخفيضات، ونصب «٪» في الدوّار.
import { pattern, building3d, box3d, minaret, leanAt, stall, palmCached, streetLamp, signboard, upright, boxShadow, blobShadow, stoneBox, sidrCached, bench, bunting, elev, kiosk3d } from '../../../world/art.js';
import { houseItems2D, houseSmoke2D } from '../../houses.js';
import { paintStreets, streetItems2D, birds2D } from '../../street.js';
import { car } from './art.js';

const ORANGE = '#EA580C', GOLD = '#FACC15', FLAGS = [ORANGE, '#FFFFFF', '#DC2626', GOLD, '#0F766E'];
export function kit2d(D) {
  const { YARD, TOP } = D, W = D.size.w, H = D.size.h, A = D.ARCADE, T = D.TOWER, Sh = D.SHOWROOM, B = D.BANK;
  function ground(g, x0, y0, w, h) {
    g.fillStyle = '#E6CFA2'; g.fillRect(x0, y0, w, h); g.fillStyle = pattern(g, 'sand'); g.fillRect(x0, y0, w, h);
    g.fillStyle = '#C9A26E'; g.fillRect(0, 0, W, TOP); g.fillStyle = 'rgba(120,80,40,.25)'; for (let x = 0; x < W; x += 80) { g.beginPath(); g.moveTo(x, TOP); g.lineTo(x + 40, TOP - 50 - (x % 160 ? 10 : 0)); g.lineTo(x + 80, TOP); g.fill(); }
    // أرض السوق: بلاط حجري كبير، وأحواض عشب صغيرة، وممشى شرقي غربي، وساحة البرج
    const paver = (x, y, w2, h2, col = '#E2D3B5') => { g.fillStyle = col; g.fillRect(x, y, w2, h2); g.fillStyle = pattern(g, 'pavers'); g.globalAlpha = .5; g.fillRect(x, y, w2, h2); g.globalAlpha = 1; g.strokeStyle = '#B9A47E'; g.lineWidth = 3; g.strokeRect(x, y, w2, h2); };
    paver(130, 150, 2210, 670, '#E8DCC2');
    g.fillStyle = '#9BC46A'; [[150, 700, 300, 90], [800, 690, 200, 100], [1880, 700, 300, 90]].forEach(([x, y, a, b]) => { g.fillRect(x, y, a, b); g.strokeStyle = '#7A6A4E'; g.lineWidth = 3; g.strokeRect(x, y, a, b); });
    paver(140, D.PROM.y0, 2190, D.PROM.y1 - D.PROM.y0, '#D8C3A0'); paver(290, D.PROM.y1, 160, YARD - D.PROM.y1, '#D8C3A0');
    // ساحة البرج: دائرة بلاط بنقش نجمي
    g.fillStyle = '#F1E4CB'; g.beginPath(); g.arc(T.x, T.y - T.s / 2, 150, 0, 7); g.fill(); g.strokeStyle = '#C8A876'; g.lineWidth = 4; g.stroke();
    g.strokeStyle = 'rgba(160,120,70,.35)'; g.lineWidth = 2; for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8; g.beginPath(); g.moveTo(T.x + Math.cos(a) * 40, T.y - T.s / 2 + Math.sin(a) * 40); g.lineTo(T.x + Math.cos(a) * 145, T.y - T.s / 2 + Math.sin(a) * 145); g.stroke(); }
    // ساحة السيارات أمام المعرض: إسفلت وخطوط مواقف
    g.fillStyle = '#5B6270'; g.fillRect(Sh.x, Sh.y + Sh.h, Sh.w, 170); g.fillStyle = pattern(g, 'asphalt'); g.fillRect(Sh.x, Sh.y + Sh.h, Sh.w, 170);
    g.strokeStyle = '#F8FAFC'; g.lineWidth = 3; for (let x = Sh.x + 10; x <= Sh.x + Sh.w; x += 130) { g.beginPath(); g.moveTo(x, Sh.y + Sh.h + 70); g.lineTo(x, Sh.y + Sh.h + 165); g.stroke(); }
    D.stations.forEach(s => paver(s.x - 70, s.y - 30, 140, 110, '#EADBC0'));
    paver(B.x + B.w / 2 - 70, B.y + B.h, 140, 40, '#F1F5F9');
    paintStreets(g, D.STREET, W, H);
    D.HOMES.forEach(Hm => { Hm.parts.forEach(b => boxShadow(g, b.x, b.y, b.w, b.h, b.H || 96)); Hm.walls.forEach(q => boxShadow(g, q.x, q.y, q.w, q.h, 26)); });
    boxShadow(g, D.MOSQUE.x, D.MOSQUE.y, D.MOSQUE.w, D.MOSQUE.h, 84);
    D.SHOPS.forEach(s => boxShadow(g, s.x, s.y, s.w, s.h, s.H)); boxShadow(g, A.x0, A.y, A.x1 - A.x0, A.d, A.H);
    boxShadow(g, T.x - T.s / 2, T.y - T.s, T.s, T.s, T.H); boxShadow(g, Sh.x, Sh.y, Sh.w, Sh.h, Sh.H); boxShadow(g, B.x, B.y, B.w, B.h, B.H);
    D.stations.forEach(s => boxShadow(g, s.x - 52, s.y - 56, 104, 24, 70));
    D.CARS.forEach(([x, y]) => { g.fillStyle = 'rgba(30,30,40,.25)'; g.beginPath(); g.ellipse(x + 10, y + 2, 64, 14, 0, 0, 7); g.fill(); });
  }
  // ضوء دوّار على منصة السيارة الوسطى
  const groundLive = (c, t) => { const [x, y] = D.CARS[1]; c.strokeStyle = 'rgba(250,204,21,.55)'; c.lineWidth = 4; c.beginPath(); c.ellipse(x, y - 4, 74, 22, 0, t * 1.2, t * 1.2 + 2.2); c.stroke(); };
  const items = t => {
    const out = [], k = D.kit;
    // دكاكين السوق
    D.SHOPS.forEach((s, i) => out.push({ x: s.x + s.w / 2, y: s.y + s.h, draw: c => building3d(c, 'g8of' + i, s) }));
    // رواق الأقواس أمام الدكاكين: صفّ أقواس بفتحاتها وسقف مسطح وشُرَف
    out.push({ x: (A.x0 + A.x1) / 2, y: A.y + A.d, draw: c => box3d(c, 'g8ofarcade', { x: A.x0, y: A.y, w: A.x1 - A.x0, h: A.d, H: A.H }, '#E9D3AE',
      cc => { cc.fillStyle = '#EBD7B4'; cc.fillRect(A.x0, A.y - A.H, A.x1 - A.x0, A.d); cc.fillStyle = pattern(cc, 'plaster'); cc.fillRect(A.x0, A.y - A.H, A.x1 - A.x0, A.d); cc.strokeStyle = '#7A5A30'; cc.lineWidth = 1.2; cc.strokeRect(A.x0, A.y - A.H, A.x1 - A.x0, A.d); },
      cc => { const yb = A.y + A.d, yt = yb - A.H, n = 7, aw = (A.x1 - A.x0) / n; cc.beginPath(); cc.rect(A.x0, yt, A.x1 - A.x0, A.H);
        for (let q = 0; q < n; q++) { const x = A.x0 + q * aw + 12, ww = aw - 24; cc.moveTo(x, yb); cc.lineTo(x, yt + 40); cc.quadraticCurveTo(x + ww / 2, yt + 6, x + ww, yt + 40); cc.lineTo(x + ww, yb); cc.closePath(); }
        cc.fillStyle = '#EED9B6'; cc.fill('evenodd'); cc.fillStyle = pattern(cc, 'plaster'); cc.fill('evenodd'); cc.strokeStyle = '#7A5A30'; cc.lineWidth = 1.2; cc.stroke();
        cc.fillStyle = '#C2410C'; cc.fillRect(A.x0, yt, A.x1 - A.x0, 7); for (let x = A.x0; x < A.x1; x += 18) { cc.fillStyle = '#EBD7B4'; cc.fillRect(x, yt - 9, 10, 9); }
        signboard(cc, (A.x0 + A.x1) / 2, yt + 18, '🏷️ السوق المسقوف'); }) });
    // برج الساعة: برج حجري بساعة على وجهه وقبة صغيرة، وعقربان يدوران
    out.push({ x: T.x, y: T.y, draw: c => { box3d(c, 'g8oftower', { x: T.x - T.s / 2, y: T.y - T.s, w: T.s, h: T.s, H: T.H }, '#E8D2A8',
      cc => { cc.fillStyle = '#0F766E'; cc.beginPath(); cc.arc(T.x, T.y - T.s / 2 - T.H, T.s * .42, 0, 7); cc.fill(); cc.fillStyle = GOLD; cc.beginPath(); cc.arc(T.x, T.y - T.s / 2 - T.H, 5, 0, 7); cc.fill(); },
      cc => { const yb = T.y, yt = yb - T.H, x = T.x - T.s / 2; cc.fillStyle = '#EAD5AE'; cc.fillRect(x, yt, T.s, T.H); cc.fillStyle = pattern(cc, 'plaster'); cc.fillRect(x, yt, T.s, T.H);
        for (let y = yt + 20; y < yb; y += 22) { cc.fillStyle = 'rgba(120,80,40,.12)'; cc.fillRect(x, y, T.s, 2); }
        cc.fillStyle = '#FFFBEB'; cc.beginPath(); cc.arc(T.x, yt + 34, 20, 0, 7); cc.fill(); cc.strokeStyle = '#7C2D12'; cc.lineWidth = 3; cc.stroke();
        for (let q = 0; q < 12; q++) { const a = q * Math.PI / 6; cc.fillStyle = '#7C2D12'; cc.fillRect(T.x + Math.cos(a) * 15 - 1, yt + 34 + Math.sin(a) * 15 - 1, 2.5, 2.5); }
        cc.fillStyle = '#3B2A1E'; cc.beginPath(); cc.moveTo(T.x - 9, yb); cc.lineTo(T.x - 9, yb - 30); cc.quadraticCurveTo(T.x, yb - 40, T.x + 9, yb - 30); cc.lineTo(T.x + 9, yb); cc.fill();
        cc.strokeStyle = '#7A5A30'; cc.lineWidth = 1.2; cc.strokeRect(x, yt, T.s, T.H); });
      const { lx, ly } = leanAt(T.x, T.y), hE = T.H * (1 - ly), cy = T.y - hE + 34 * (1 - ly), cx = T.x + lx * (T.H - 34);
      c.strokeStyle = '#1C1917'; c.lineCap = 'round'; c.lineWidth = 2.5; const a1 = k.t * .05 - Math.PI / 2, a2 = k.t * .6 - Math.PI / 2;
      c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a1) * 9, cy + Math.sin(a1) * 9); c.stroke(); c.lineWidth = 1.6; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a2) * 14, cy + Math.sin(a2) * 14); c.stroke(); c.lineCap = 'butt'; } });
    // معرض السيارات الزجاجي
    out.push({ x: Sh.x + Sh.w / 2, y: Sh.y + Sh.h, draw: c => box3d(c, 'g8ofshow', Sh, '#CBD5E1',
      cc => { cc.fillStyle = '#E2E8F0'; cc.fillRect(Sh.x, Sh.y - Sh.H, Sh.w, Sh.h); cc.fillStyle = '#94A3B8'; cc.fillRect(Sh.x + 20, Sh.y - Sh.H + 20, 60, 40); cc.fillRect(Sh.x + Sh.w - 90, Sh.y - Sh.H + 30, 50, 30); cc.strokeStyle = '#475569'; cc.lineWidth = 1.2; cc.strokeRect(Sh.x, Sh.y - Sh.H, Sh.w, Sh.h); },
      cc => { const yb = Sh.y + Sh.h, yt = yb - Sh.H; const gr = cc.createLinearGradient(0, yt, 0, yb); gr.addColorStop(0, '#BFDBFE'); gr.addColorStop(1, '#60A5FA'); cc.fillStyle = gr; cc.fillRect(Sh.x, yt, Sh.w, Sh.H);
        cc.fillStyle = 'rgba(255,255,255,.35)'; for (let x = Sh.x + 20; x < Sh.x + Sh.w; x += 70) { cc.beginPath(); cc.moveTo(x, yb); cc.lineTo(x + 30, yt + 24); cc.lineTo(x + 44, yt + 24); cc.lineTo(x + 14, yb); cc.fill(); }
        cc.strokeStyle = '#334155'; cc.lineWidth = 4; for (let x = Sh.x; x <= Sh.x + Sh.w; x += Sh.w / 6) { cc.beginPath(); cc.moveTo(x, yt); cc.lineTo(x, yb); cc.stroke(); }
        cc.fillStyle = '#1E293B'; cc.fillRect(Sh.x, yt, Sh.w, 22); cc.fillStyle = '#F8FAFC'; cc.font = '900 15px Cairo'; cc.textAlign = 'center'; cc.direction = 'rtl'; cc.fillText('🚗 معرض السيارات', Sh.x + Sh.w / 2, yt + 16);
        cc.strokeStyle = '#1E293B'; cc.lineWidth = 1.2; cc.strokeRect(Sh.x, yt, Sh.w, Sh.H); }) });
    D.CARS.forEach(([x, y, col], i) => out.push({ x, y, draw: c => upright(c, x, y, cc => { car(cc, x, y, .62, col, 0); if (i === 1) { cc.fillStyle = ORANGE; cc.beginPath(); cc.roundRect(x - 26, y - 70, 52, 22, 6); cc.fill(); cc.fillStyle = '#FFF'; cc.font = '900 13px Cairo'; cc.textAlign = 'center'; cc.fillText('−١٠٪', x, y - 54); } }) }));
    // بنك السوق: مبنى بطابقين وأعمدة أمامية وشعار
    out.push({ x: B.x + B.w / 2, y: B.y + B.h + 2, draw: c => { building3d(c, 'g8ofbank', B);
      upright(c, B.x + B.w / 2, B.y + B.h + 2, cc => { const yb = B.y + B.h + 2; for (let q = 0; q < 6; q++) { const x = B.x + 24 + q * (B.w - 48) / 5; cc.fillStyle = '#F8FAFC'; cc.fillRect(x - 7, yb - 118, 14, 118); cc.fillStyle = 'rgba(0,0,0,.12)'; cc.fillRect(x + 3, yb - 118, 4, 118); cc.fillStyle = '#CBD5E1'; cc.fillRect(x - 10, yb - 124, 20, 8); cc.fillRect(x - 10, yb - 6, 20, 6); }
        cc.fillStyle = '#E2E8F0'; cc.beginPath(); cc.moveTo(B.x + 8, yb - 124); cc.lineTo(B.x + B.w / 2, yb - 150); cc.lineTo(B.x + B.w - 8, yb - 124); cc.fill(); cc.strokeStyle = '#94A3B8'; cc.lineWidth = 1.5; cc.stroke();
        cc.fillStyle = '#0F766E'; cc.beginPath(); cc.arc(B.x + B.w / 2, yb - 133, 8, 0, 7); cc.fill(); }); } });
    // أكشاك الدروس
    D.stations.forEach(s => out.push({ x: s.x, y: s.y - 32, draw: c => kiosk3d(c, 'g8of' + s.id, { x: s.x, y: s.y, col: s.col, sign: `${s.icon} ${s.label}` }, [s.col, GOLD, '#FFFFFF', '#16A34A']) }));
    D.STALLS.forEach(([x, y, col]) => out.push({ x, y, draw: c => stall(c, x, y, col) }));
    D.BANNERS.flat().forEach(([x, y]) => out.push({ x, y, draw: c => upright(c, x, y, cc => { cc.fillStyle = '#64748B'; cc.fillRect(x - 2.5, y - 124, 5, 124); cc.fillStyle = GOLD; cc.beginPath(); cc.arc(x, y - 126, 5, 0, 7); cc.fill(); }) }));
    const L = { building3d, stoneBox, sidrCached, palmCached, bench, upright, leanAt };
    D.HOMES.forEach((Hm, i) => out.push(...houseItems2D(Hm, L, 'g8of' + i, t)));
    out.push(...streetItems2D(D.life, D.STREET, { upright, bench, signboard }, t));
    const M = D.MOSQUE, N2 = D.MINARET;
    out.push({ x: M.x + M.w / 2, y: M.y + M.h, draw: c => { building3d(c, 'g8ofmosque', M); const { lx, ly } = leanAt(M.x + M.w / 2, M.y + M.h); c.save(); c.translate(lx * M.H, -M.H * (1 - ly)); minaret(c, 'g8ofminaret', N2.x, N2.y, N2.s, N2.H); c.restore(); } });
    D.PALMS.forEach(([x, y, s]) => out.push({ x, y, draw: c => palmCached(c, x, y, s, false, t) }));
    D.LAMPS.forEach(([x, y]) => out.push({ x, y, draw: c => streetLamp(c, x, y, t, false) }));
    // نصب «٪» في الدوّار: قاعدة ودائرتان وخط مائل
    const R = D.RING; out.push({ x: R.x, y: R.y + 20, draw: c => upright(c, R.x, R.y + 20, cc => { const y = R.y + 20; cc.fillStyle = '#E7E5E4'; cc.beginPath(); cc.ellipse(R.x, y - 12, 56, 18, 0, 0, 7); cc.fill(); cc.fillStyle = '#A8A29E'; cc.fillRect(R.x - 56, y - 12, 112, 8);
      cc.strokeStyle = ORANGE; cc.lineWidth = 14; cc.lineCap = 'round'; cc.beginPath(); cc.moveTo(R.x - 26, y - 24); cc.lineTo(R.x + 26, y - 120); cc.stroke(); cc.lineCap = 'butt';
      cc.lineWidth = 9; cc.beginPath(); cc.arc(R.x - 24, y - 98, 15, 0, 7); cc.stroke(); cc.beginPath(); cc.arc(R.x + 24, y - 44, 15, 0, 7); cc.stroke(); }) });
    out.push({ x: R.x, y: YARD - 40, draw: c => upright(c, R.x, YARD - 40, cc => { cc.fillStyle = '#C2410C'; cc.fillRect(R.x - 98, YARD - 170, 12, 130); cc.fillRect(R.x + 86, YARD - 170, 12, 130); cc.fillRect(R.x - 106, YARD - 178, 212, 14);
      for (let q = 0; q < 9; q++) { cc.fillStyle = Math.sin(k.t * 3 + q) > 0 ? GOLD : '#FFF7D6'; cc.beginPath(); cc.arc(R.x - 96 + q * 24, YARD - 171, 3.5, 0, 7); cc.fill(); }
      signboard(cc, R.x, YARD - 142, '🏷️ سوق العروض'); }) });
    return out;
  };
  // حبال لافتات التخفيضات: رايات ولافتة «تخفيضات» تتأرجح في منتصف كل حبل
  const over = (c, t) => { D.HOMES.forEach(Hm => houseSmoke2D(Hm, c, t)); birds2D(c, D.life, D.STREET, t);
    D.BANNERS.forEach(([a, b], i) => { const A2 = elev(a[0], a[1], 120), B2 = elev(b[0], b[1], 120); bunting(c, A2, B2, 26, 12, FLAGS.slice(i % 2).concat(FLAGS.slice(0, i % 2)), t);
      const mx = (A2[0] + B2[0]) / 2, my = (A2[1] + B2[1]) / 2 + 26; c.save(); c.translate(mx, my); c.rotate(Math.sin(t * 1.6 + i) * .05); c.fillStyle = '#DC2626'; c.beginPath(); c.roundRect(-48, 4, 96, 26, 8); c.fill(); c.strokeStyle = '#FFF'; c.lineWidth = 2; c.stroke();
        c.fillStyle = '#FFF'; c.font = '900 15px Cairo'; c.textAlign = 'center'; c.direction = 'rtl'; c.fillText(['تخفيضات ٥٠٪', 'عروض اليوم', 'خصم ٢٥٪', 'اشترِ ٣ بسعر ٢'][i % 4], 0, 23); c.restore(); });
    bunting(c, elev(254, 1000, 110), elev(506, 1000, 110), 26, 11, FLAGS, t); };
  function station(c, s, t, st) {
    const done = st && st.doneIds && st.doneIds[s.id];
    if (done) { c.fillStyle = '#16A34A'; c.beginPath(); c.arc(s.x + 64, s.y - 60, 15, 0, 7); c.fill(); c.fillStyle = '#fff'; c.font = '900 18px Cairo'; c.textAlign = 'center'; c.fillText('✓', s.x + 64, s.y - 54); }
  }
  return { ground, groundLive, items, over, station };
}
