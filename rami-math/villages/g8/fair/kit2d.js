// مهرجان الألعاب في العرض العادي بأدوات العالم المفتوح: المسرح بأضوائه، والدوّامة بخيولها، والعجلة الدوّارة، والخيمة المخططة،
// وبرج الأرجوحة، وأكشاك الدروس بمظلاتها، وعربات الحلوى والبالونات وحبال الرايات، ونصب حجري النرد في الدوّار.
import { pattern, building3d, minaret, leanAt, stall, palmCached, streetLamp, signboard, upright, boxShadow, blobShadow, stoneBox, sidrCached, bench, bunting, elev, kiosk3d, balloons } from '../../../world/art.js';
import { houseItems2D, houseSmoke2D } from '../../houses.js';
import { paintStreets, streetItems2D, birds2D } from '../../street.js';
import { die2d } from './art.js';

const PINK = '#DB2777', GOLD = '#FACC15', FLAGS = [PINK, '#FFFFFF', '#2563EB', GOLD, '#16A34A'];
export function kit2d(D) {
  const { YARD, TOP } = D, W = D.size.w, H = D.size.h, C = D.CAROUSEL, Wh = D.WHEEL, Tn = D.TENT, Sw = D.SWING, St = D.STAGE;
  function ground(g, x0, y0, w, h) {
    g.fillStyle = '#E6CFA2'; g.fillRect(x0, y0, w, h); g.fillStyle = pattern(g, 'sand'); g.fillRect(x0, y0, w, h);
    g.fillStyle = '#C9A26E'; g.fillRect(0, 0, W, TOP); g.fillStyle = 'rgba(120,80,40,.25)'; for (let x = 0; x < W; x += 80) { g.beginPath(); g.moveTo(x, TOP); g.lineTo(x + 40, TOP - 50 - (x % 160 ? 10 : 0)); g.lineTo(x + 80, TOP); g.fill(); }
    // أرض المهرجان: عشب مقصوص، وممشى مبلّط شرقي غربي وممرات إلى الأكشاك
    g.fillStyle = '#9BC46A'; g.fillRect(120, 150, 2220, 670); g.fillStyle = 'rgba(60,110,40,.12)'; for (let x = 120; x < 2340; x += 60) g.fillRect(x, 150, 30, 670);
    const paver = (x, y, w2, h2) => { g.fillStyle = '#E2D3B5'; g.fillRect(x, y, w2, h2); g.fillStyle = pattern(g, 'pavers'); g.globalAlpha = .5; g.fillRect(x, y, w2, h2); g.globalAlpha = 1; g.strokeStyle = '#B9A47E'; g.lineWidth = 3; g.strokeRect(x, y, w2, h2); };
    paver(140, D.PROM.y0, 2190, D.PROM.y1 - D.PROM.y0); paver(290, D.PROM.y1, 160, YARD - D.PROM.y1); D.stations.forEach(s => paver(s.x - 70, s.y - 30, 140, 110));
    paver(St.x - 10, St.y + St.h, St.w + 20, 40); paver(Wh.x - 150, Wh.y - 10, 300, D.PROM.y0 - Wh.y + 10);
    // أرضيات الألعاب: مطاط ملوّن تحت الدوّامة والأرجوحة
    [[C.x, C.y, C.r + 22, '#F9A8D4'], [Sw.x, Sw.y, Sw.r + 26, '#93C5FD']].forEach(([x, y, r, col]) => { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 4; g.beginPath(); g.arc(x, y, r - 8, 0, 7); g.stroke(); });
    g.fillStyle = '#D9C9A8'; g.beginPath(); g.arc(Tn.x, Tn.y, Tn.r + 18, 0, 7); g.fill();
    paintStreets(g, D.STREET, W, H);
    D.HOMES.forEach(Hm => { Hm.parts.forEach(b => boxShadow(g, b.x, b.y, b.w, b.h, b.H || 96)); Hm.walls.forEach(q => boxShadow(g, q.x, q.y, q.w, q.h, 26)); });
    boxShadow(g, D.MOSQUE.x, D.MOSQUE.y, D.MOSQUE.w, D.MOSQUE.h, 84); boxShadow(g, St.x, St.y, St.w, St.h, 120);
    D.stations.forEach(s => boxShadow(g, s.x - 52, s.y - 56, 104, 24, 70));
    blobShadow(g, Tn.x, Tn.y, Tn.r, 200); blobShadow(g, C.x, C.y, C.r, 120); blobShadow(g, Sw.x, Sw.y, 30, Sw.H);
    g.fillStyle = 'rgba(70,42,20,.16)'; g.beginPath(); g.ellipse(Wh.x + 70, Wh.y + 20, Wh.r * .9, 28, 0, 0, 7); g.fill();
  }
  // أضواء المسرح تجري على أرضه
  const groundLive = (c, t) => {
    [[0, '#FDE047'], [1.7, '#F472B6'], [3.4, '#60A5FA']].forEach(([o, col]) => { const x = St.x + St.w / 2 + Math.sin(t * .9 + o) * St.w * .38; c.fillStyle = col; c.globalAlpha = .28; c.beginPath(); c.ellipse(x, St.y + St.h + 20, 34, 14, 0, 0, 7); c.fill(); c.globalAlpha = 1; });
  };
  const lift = (c, x, y, h2, f) => { const { lx, ly } = leanAt(x, y); c.save(); c.translate(lx * h2, -h2 * (1 - ly)); f(); c.restore(); };
  const items = t => {
    const out = [], k = D.kit;
    // المسرح: منصة وخلفية بستارة وعارضة أضواء ملونة تومض
    out.push({ x: St.x + St.w / 2, y: St.y + St.h, draw: c => { stoneBox(c, St.x, St.y, St.w, St.h, 34, '#7C3AED', false);
      upright(c, St.x + St.w / 2, St.y + 10, cc => { const y = St.y + 10 - 34, x0 = St.x + 10, x1 = St.x + St.w - 10; cc.fillStyle = '#7F1D1D'; cc.fillRect(x0, y - 110, x1 - x0, 110);
        for (let x = x0; x < x1; x += 18) { cc.fillStyle = 'rgba(0,0,0,.18)'; cc.fillRect(x, y - 110, 6, 110); }
        cc.fillStyle = '#B91C1C'; cc.beginPath(); cc.moveTo(x0, y - 110); cc.quadraticCurveTo(x0 + 40, y - 60, x0 + 10, y); cc.lineTo(x0, y); cc.fill(); cc.beginPath(); cc.moveTo(x1, y - 110); cc.quadraticCurveTo(x1 - 40, y - 60, x1 - 10, y); cc.lineTo(x1, y); cc.fill();
        cc.fillStyle = '#334155'; cc.fillRect(x0 - 10, y - 128, x1 - x0 + 20, 10); cc.fillRect(x0 - 10, y - 128, 8, 128); cc.fillRect(x1 + 2, y - 128, 8, 128);
        for (let q = 0; q < 9; q++) { const on = Math.sin(k.t * 4 + q * 1.3) > -.2; cc.fillStyle = on ? FLAGS[q % 5] : '#475569'; cc.beginPath(); cc.arc(x0 + 8 + q * (x1 - x0 - 16) / 8, y - 114, 6, 0, 7); cc.fill(); }
        signboard(cc, St.x + St.w / 2, y - 140, '🎤 مسرح المهرجان'); }); } });
    // الدوّامة: منصة دائرية، أعمدة بخيول تصعد وتنزل وتدور، وسقف مخروطي مخطط
    out.push({ x: C.x, y: C.y + C.r * .5, draw: c => upright(c, C.x, C.y + C.r * .5, cc => { const by = C.y + C.r * .2, ry = C.r * .42, a0 = k.t * .6;
      cc.fillStyle = '#BE185D'; cc.beginPath(); cc.ellipse(C.x, by, C.r, ry, 0, 0, 7); cc.fill(); cc.fillStyle = '#FBCFE8'; cc.beginPath(); cc.ellipse(C.x, by - 8, C.r, ry, 0, 0, 7); cc.fill();
      cc.fillStyle = '#F9A8D4'; cc.fillRect(C.x - 10, by - 130, 20, 122);
      const horses = Array.from({ length: 8 }, (_, q) => { const a = a0 + q * Math.PI / 4; return { a, x: C.x + Math.cos(a) * C.r * .78, y: by - 8 + Math.sin(a) * ry * .78, q }; }).sort((p, q) => p.y - q.y);
      horses.forEach(h => { const bob = Math.sin(k.t * 3 + h.q * 1.7) * 8, hy = h.y - 52 + bob; cc.strokeStyle = '#FDE68A'; cc.lineWidth = 3; cc.beginPath(); cc.moveTo(h.x, h.y); cc.lineTo(h.x, by - 120); cc.stroke();
        const dir = Math.sin(h.a) > 0 ? -1 : 1; cc.fillStyle = ['#FFFFFF', '#FDE68A', '#BAE6FD', '#FBCFE8'][h.q % 4]; cc.beginPath(); cc.ellipse(h.x, hy, 17, 9, 0, 0, 7); cc.fill(); cc.beginPath(); cc.ellipse(h.x + dir * 15, hy - 10, 6, 10, dir * .5, 0, 7); cc.fill();
        cc.strokeStyle = '#7C2D12'; cc.lineWidth = 2; cc.stroke(); cc.fillStyle = FLAGS[h.q % 5]; cc.fillRect(h.x - 6, hy - 9, 12, 5); });
      const rt = by - 128; for (let q = 0; q < 12; q++) { const a1 = q / 12 * Math.PI * 2, a2 = (q + 1) / 12 * Math.PI * 2; cc.fillStyle = q % 2 ? '#FFFFFF' : PINK; cc.beginPath(); cc.moveTo(C.x, rt - 70); cc.lineTo(C.x + Math.cos(a1) * C.r * 1.05, rt + Math.sin(a1) * ry * 1.05); cc.lineTo(C.x + Math.cos(a2) * C.r * 1.05, rt + Math.sin(a2) * ry * 1.05); cc.closePath(); cc.fill(); }
      cc.fillStyle = '#9D174D'; cc.beginPath(); cc.ellipse(C.x, rt, C.r * 1.05, ry * 1.05, 0, 0, Math.PI); cc.lineTo(C.x - C.r * 1.05, rt + 10); cc.ellipse(C.x, rt + 10, C.r * 1.05, ry * 1.05, 0, Math.PI, 0, true); cc.fill();
      for (let q = 0; q < 14; q++) { const a = q / 14 * Math.PI; cc.fillStyle = Math.sin(k.t * 5 + q) > 0 ? GOLD : '#FFF7D6'; cc.beginPath(); cc.arc(C.x + Math.cos(a) * C.r, rt + 5 + Math.sin(a) * ry, 3, 0, 7); cc.fill(); }
      cc.fillStyle = GOLD; cc.fillRect(C.x - 2, rt - 96, 4, 28); cc.beginPath(); cc.moveTo(C.x + 2, rt - 96); cc.lineTo(C.x + 22, rt - 90); cc.lineTo(C.x + 2, rt - 84); cc.fill(); }) });
    // العجلة الدوّارة: ساقان مائلتان، وطوق بأضلاع يدور، وعربات معلقة تبقى قائمة
    out.push({ x: Wh.x, y: Wh.y, draw: c => upright(c, Wh.x, Wh.y, cc => { const hx = Wh.x, hy = Wh.y - Wh.hub, R = Wh.r, a0 = k.t * .18;
      cc.strokeStyle = '#475569'; cc.lineWidth = 9; [-1, 1].forEach(s => { cc.beginPath(); cc.moveTo(hx + s * 110, Wh.y); cc.lineTo(hx, hy); cc.stroke(); });
      cc.strokeStyle = '#E2E8F0'; cc.lineWidth = 6; cc.beginPath(); cc.arc(hx, hy, R, 0, 7); cc.stroke(); cc.strokeStyle = '#94A3B8'; cc.lineWidth = 2; cc.beginPath(); cc.arc(hx, hy, R - 14, 0, 7); cc.stroke();
      for (let q = 0; q < 16; q++) { const a = a0 + q * Math.PI / 8; cc.strokeStyle = 'rgba(203,213,225,.9)'; cc.lineWidth = 2; cc.beginPath(); cc.moveTo(hx, hy); cc.lineTo(hx + Math.cos(a) * R, hy + Math.sin(a) * R); cc.stroke();
        cc.fillStyle = Math.sin(k.t * 3 + q) > 0 ? GOLD : '#FFFBEB'; cc.beginPath(); cc.arc(hx + Math.cos(a) * R, hy + Math.sin(a) * R, 3.5, 0, 7); cc.fill(); }
      for (let q = 0; q < 8; q++) { const a = a0 + q * Math.PI / 4, gx = hx + Math.cos(a) * R, gy = hy + Math.sin(a) * R; cc.strokeStyle = '#334155'; cc.lineWidth = 2; cc.beginPath(); cc.moveTo(gx, gy); cc.lineTo(gx, gy + 12); cc.stroke();
        cc.fillStyle = FLAGS[q % 5] === '#FFFFFF' ? '#F97316' : FLAGS[q % 5]; cc.beginPath(); cc.roundRect(gx - 15, gy + 12, 30, 22, 6); cc.fill(); cc.fillStyle = 'rgba(255,255,255,.75)'; cc.fillRect(gx - 11, gy + 15, 22, 7); }
      cc.fillStyle = '#1E293B'; cc.beginPath(); cc.arc(hx, hy, 12, 0, 7); cc.fill(); cc.fillStyle = GOLD; cc.beginPath(); cc.arc(hx, hy, 5, 0, 7); cc.fill();
      cc.fillStyle = '#64748B'; cc.fillRect(hx - 120, Wh.y - 16, 240, 16); signboard(cc, hx, Wh.y - 28, '🎡 العجلة الدوّارة'); }) });
    // الخيمة الكبيرة: جدار أسطواني بخطوط حمراء وبيضاء وسقف مخروطي ورايات
    out.push({ x: Tn.x, y: Tn.y + Tn.r * .45, draw: c => upright(c, Tn.x, Tn.y + Tn.r * .45, cc => { const by = Tn.y + Tn.r * .42, ry = Tn.r * .42, R = Tn.r, wallH = 80, top = by - wallH;
      for (let q = 0; q < 16; q++) { const a1 = q / 16 * Math.PI, a2 = (q + 1) / 16 * Math.PI, x1 = Tn.x + Math.cos(a1) * R, x2 = Tn.x + Math.cos(a2) * R; cc.fillStyle = q % 2 ? '#FFFFFF' : '#DC2626';
        cc.beginPath(); cc.moveTo(x1, by + Math.sin(a1) * ry - ry); cc.lineTo(x2, by + Math.sin(a2) * ry - ry); cc.lineTo(x2, top + Math.sin(a2) * ry - ry); cc.lineTo(x1, top + Math.sin(a1) * ry - ry); cc.closePath(); cc.fill(); }
      cc.fillStyle = '#1F2937'; cc.beginPath(); cc.moveTo(Tn.x - 24, by); cc.lineTo(Tn.x - 24, by - 54); cc.quadraticCurveTo(Tn.x, by - 70, Tn.x + 24, by - 54); cc.lineTo(Tn.x + 24, by); cc.fill();
      const peak = top - ry - 150; for (let q = 0; q < 16; q++) { const a1 = q / 16 * Math.PI, a2 = (q + 1) / 16 * Math.PI; cc.fillStyle = q % 2 ? '#FEE2E2' : '#B91C1C'; cc.beginPath(); cc.moveTo(Tn.x, peak); cc.lineTo(Tn.x + Math.cos(a1) * R * 1.04, top + Math.sin(a1) * ry - ry); cc.lineTo(Tn.x + Math.cos(a2) * R * 1.04, top + Math.sin(a2) * ry - ry); cc.closePath(); cc.fill(); }
      cc.fillStyle = GOLD; cc.fillRect(Tn.x - 2, peak - 40, 4, 40); cc.beginPath(); cc.moveTo(Tn.x + 2, peak - 40); cc.lineTo(Tn.x + 26 + Math.sin(k.t * 3) * 3, peak - 33); cc.lineTo(Tn.x + 2, peak - 26); cc.fill();
      signboard(cc, Tn.x, top - ry + 26, '🎪 الخيمة الكبيرة'); }) });
    // برج الأرجوحة: عمود بقرص علوي يدور، وكراسٍ معلقة بسلاسل تتسع مع الدوران
    out.push({ x: Sw.x, y: Sw.y + 4, draw: c => upright(c, Sw.x, Sw.y + 4, cc => { const top = Sw.y - Sw.H, a0 = k.t * 1.1, out2 = Sw.r * (.9 + Math.sin(k.t * .4) * .08), ry = .38;
      const chairs = Array.from({ length: 10 }, (_, q) => { const a = a0 + q * Math.PI / 5; return { a, q, z: Math.sin(a) }; }).sort((p, q) => p.z - q.z);
      const chair = h => { const tx = Sw.x + Math.cos(h.a) * Sw.r * .45, ty = top + 22 + Math.sin(h.a) * Sw.r * .45 * ry, cx = Sw.x + Math.cos(h.a) * out2, cy = top + 92 + Math.sin(h.a) * out2 * ry;
        cc.strokeStyle = '#64748B'; cc.lineWidth = 1.5; cc.beginPath(); cc.moveTo(tx, ty); cc.lineTo(cx, cy); cc.stroke(); cc.fillStyle = FLAGS[h.q % 5] === '#FFFFFF' ? '#F97316' : FLAGS[h.q % 5]; cc.fillRect(cx - 7, cy, 14, 9); };
      chairs.filter(h => h.z < 0).forEach(chair);
      cc.fillStyle = '#CBD5E1'; cc.fillRect(Sw.x - 7, top, 14, Sw.H); cc.fillStyle = '#2563EB'; cc.beginPath(); cc.ellipse(Sw.x, top + 18, Sw.r * .5, Sw.r * .5 * ry, 0, 0, 7); cc.fill(); cc.fillStyle = GOLD; cc.beginPath(); cc.ellipse(Sw.x, top + 12, Sw.r * .5, Sw.r * .5 * ry, 0, 0, 7); cc.fill();
      cc.fillStyle = PINK; cc.beginPath(); cc.moveTo(Sw.x, top - 30); cc.lineTo(Sw.x - Sw.r * .5, top + 12); cc.lineTo(Sw.x + Sw.r * .5, top + 12); cc.fill();
      chairs.filter(h => h.z >= 0).forEach(chair); }) });
    // أكشاك الدروس
    D.stations.forEach(s => out.push({ x: s.x, y: s.y - 32, draw: c => kiosk3d(c, 'g8fair' + s.id, { x: s.x, y: s.y, col: s.col, sign: `${s.icon} ${s.label}` }, [s.col, GOLD, '#FFFFFF', '#2563EB']) }));
    D.STALLS.forEach(([x, y, col]) => out.push({ x, y, draw: c => stall(c, x, y, col) }));
    D.STRINGS.flat().forEach(([x, y]) => out.push({ x, y, draw: c => upright(c, x, y, cc => { cc.fillStyle = '#64748B'; cc.fillRect(x - 2.5, y - 124, 5, 124); cc.fillStyle = GOLD; cc.beginPath(); cc.arc(x, y - 126, 5, 0, 7); cc.fill(); }) }));
    D.BALLOONS.forEach(([x, y], i) => out.push({ x, y, draw: c => upright(c, x, y, cc => { balloons(cc, x, y - 30, i ? ['#F43F5E', GOLD, '#22C55E', '#3B82F6', '#A855F7'] : [PINK, '#38BDF8', GOLD, '#F97316', '#22C55E'], t, 70); cc.fillStyle = '#7C4A1E'; cc.fillRect(x - 12, y - 30, 24, 30); cc.fillStyle = '#334155'; cc.beginPath(); cc.arc(x - 9, y - 2, 4, 0, 7); cc.arc(x + 9, y - 2, 4, 0, 7); cc.fill(); }) }));
    const A = { building3d, stoneBox, sidrCached, palmCached, bench, upright, leanAt };
    D.HOMES.forEach((Hm, i) => out.push(...houseItems2D(Hm, A, 'g8fr' + i, t)));
    out.push(...streetItems2D(D.life, D.STREET, { upright, bench, signboard }, t));
    const M = D.MOSQUE, N = D.MINARET;
    out.push({ x: M.x + M.w / 2, y: M.y + M.h, draw: c => { building3d(c, 'g8frmosque', M); const { lx, ly } = leanAt(M.x + M.w / 2, M.y + M.h); c.save(); c.translate(lx * M.H, -M.H * (1 - ly)); minaret(c, 'g8frminaret', N.x, N.y, N.s, N.H); c.restore(); } });
    D.PALMS.forEach(([x, y, s]) => out.push({ x, y, draw: c => palmCached(c, x, y, s, false, t) }));
    D.LAMPS.forEach(([x, y]) => out.push({ x, y, draw: c => streetLamp(c, x, y, t, false) }));
    // نصب النردين: قاعدة دائرية وحجرا نرد كبيران، أحدهما مائل على حافته
    const R = D.RING; out.push({ x: R.x, y: R.y + 20, draw: c => upright(c, R.x, R.y + 20, cc => { const y = R.y + 20; cc.fillStyle = '#E7E5E4'; cc.beginPath(); cc.ellipse(R.x, y - 12, 56, 18, 0, 0, 7); cc.fill(); cc.fillStyle = '#A8A29E'; cc.fillRect(R.x - 56, y - 12, 112, 8);
      die2d(cc, R.x - 30, y - 18, 44, 5, 3, 0); die2d(cc, R.x + 28, y - 30, 40, 6, 2, .35); }) });
    out.push({ x: R.x, y: YARD - 40, draw: c => upright(c, R.x, YARD - 40, cc => { cc.fillStyle = PINK; cc.fillRect(R.x - 98, YARD - 170, 12, 130); cc.fillRect(R.x + 86, YARD - 170, 12, 130); cc.fillRect(R.x - 106, YARD - 178, 212, 14);
      for (let q = 0; q < 9; q++) { cc.fillStyle = Math.sin(k.t * 4 + q) > 0 ? GOLD : '#FFF7D6'; cc.beginPath(); cc.arc(R.x - 96 + q * 24, YARD - 171, 3.5, 0, 7); cc.fill(); }
      signboard(cc, R.x, YARD - 142, '🎡 مهرجان الألعاب'); }) });
    return out;
  };
  const over = (c, t) => { D.HOMES.forEach(Hm => houseSmoke2D(Hm, c, t)); birds2D(c, D.life, D.STREET, t);
    D.STRINGS.forEach(([a, b], i) => bunting(c, elev(a[0], a[1], 120), elev(b[0], b[1], 120), 28, 12, FLAGS.slice(i % 2).concat(FLAGS.slice(0, i % 2)), t));
    bunting(c, elev(254, 1000, 110), elev(506, 1000, 110), 26, 11, FLAGS, t); };
  function station(c, s, t, st) {
    const done = st && st.doneIds && st.doneIds[s.id];
    if (done) { c.fillStyle = '#16A34A'; c.beginPath(); c.arc(s.x + 64, s.y - 60, 15, 0, 7); c.fill(); c.fillStyle = '#fff'; c.font = '900 18px Cairo'; c.textAlign = 'center'; c.fillText('✓', s.x + 64, s.y - 54); }
  }
  return { ground, groundLive, items, over, station };
}
