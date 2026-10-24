// مصنع التغليف في العرض العادي بأدوات العالم المفتوح: قاعة كبيرة بأبواب ونوافذ علوية ومدخنة يتصاعد دخانها، سير إنتاج تتحرك عليه صناديق
// مطوية من شبكات ملوّنة، رصيف تحميل، منصّات صناديق، رافعة شوكية، خزان ماء، مختبر القصّ، وحديقة ببحيرة وبطّ، ونصب المكعب في الدوّار.
import { FLAGS, pattern, building3d, minaret, leanAt, stall, palmCached, streetLamp, signboard, upright, boxShadow, INK, stoneBox, sidrCached, bench, roundTower, bunting, elev, shade } from '../../../world/art.js';
import { houseItems2D, houseSmoke2D } from '../../houses.js';
import { paintStreets, streetItems2D, birds2D } from '../../street.js';

const BOXC = ['#E11D48', '#F59E0B', '#16A34A', '#2563EB', '#7C3AED', '#0EA5E9'];
export function kit2d(D) {
  const { YARD, TOP } = D, W = D.size.w, H = D.size.h, P = D.POND;
  function ground(g, x0, y0, w, h) {
    g.fillStyle = '#E3C796'; g.fillRect(x0, y0, w, h); g.fillStyle = pattern(g, 'sand'); g.fillRect(x0, y0, w, h);
    // تلال الحافة الشمالية
    g.fillStyle = '#C9A26E'; g.fillRect(0, 0, W, TOP); g.fillStyle = 'rgba(120,80,40,.25)'; for (let x = 0; x < W; x += 60) { g.beginPath(); g.moveTo(x, TOP); g.lineTo(x + 30, TOP - 40 - (x % 120 ? 20 : 0)); g.lineTo(x + 60, TOP); g.fill(); }
    // ساحة المصنع: خرسانة بخطوط ممرات صفراء ومواقف مرقّمة
    g.fillStyle = '#CFCAC0'; g.fillRect(0, TOP, W, YARD - TOP); g.fillStyle = pattern(g, 'asphalt'); g.globalAlpha = .22; g.fillRect(0, TOP, W, YARD - TOP); g.globalAlpha = 1;
    g.strokeStyle = '#FACC15'; g.lineWidth = 5; g.setLineDash([26, 16]); [[0, 700, W, 700], [600, TOP + 20, 600, YARD - 30]].forEach(([a, b, c, d]) => { g.beginPath(); g.moveTo(a, b); g.lineTo(c, d); g.stroke(); }); g.setLineDash([]);
    g.fillStyle = 'rgba(250,204,21,.35)'; for (let k = 0; k < 6; k++) g.fillRect(1700 + k * 100, 650, 80, 6);
    paintStreets(g, D.STREET, W, H);
    // الحديقة والبحيرة بضفة رملية وقصب
    g.fillStyle = '#E8D6A8'; g.beginPath(); g.ellipse(P.x, P.y, P.rx + 16, P.ry + 12, 0, 0, 7); g.fill();
    const wg = g.createRadialGradient(P.x, P.y, 10, P.x, P.y, P.rx); wg.addColorStop(0, '#4FB3E8'); wg.addColorStop(1, '#2B86C5'); g.fillStyle = wg; g.beginPath(); g.ellipse(P.x, P.y, P.rx, P.ry, 0, 0, 7); g.fill();
    g.strokeStyle = '#3F7A2E'; g.lineWidth = 2; for (let k = 0; k < 40; k++) { const a = k / 40 * Math.PI * 2, x = P.x + Math.cos(a) * (P.rx + 4), y = P.y + Math.sin(a) * (P.ry + 4); g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.sin(k) * 4, y - 14); g.stroke(); }
    // ظلال
    D.HOMES.forEach(Hm => { Hm.parts.forEach(b => boxShadow(g, b.x, b.y, b.w, b.h, b.H || 96)); Hm.walls.forEach(q => boxShadow(g, q.x, q.y, q.w, q.h, 26)); });
    [D.MOSQUE, D.HALL, D.LAB].forEach(b => boxShadow(g, b.x, b.y, b.w, b.h, b.H || 96));
    if (FLAGS.three) { g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.ellipse(P.x, P.y, P.rx - 2, P.ry - 2, 0, 0, 7); g.fill(); g.globalCompositeOperation = 'source-over'; }   // ماء حقيقي في المجسّم
  }
  const groundLive = (c, t) => { c.fillStyle = 'rgba(255,255,255,.45)'; for (let k = 0; k < 14; k++) { const a = k * 1.7 + t * .2, x = P.x + Math.cos(a) * P.rx * .6, y = P.y + Math.sin(a * 1.3) * P.ry * .5; c.fillRect(x, y, 14, 2); } };
  const box = (c, x, y, s, col) => { c.fillStyle = col; c.fillRect(x - s / 2, y - s, s, s); c.fillStyle = shade(col, 18); c.beginPath(); c.moveTo(x - s / 2, y - s); c.lineTo(x - s / 2 + 6, y - s - 6); c.lineTo(x + s / 2 + 6, y - s - 6); c.lineTo(x + s / 2, y - s); c.fill();
    c.fillStyle = shade(col, -25); c.beginPath(); c.moveTo(x + s / 2, y - s); c.lineTo(x + s / 2 + 6, y - s - 6); c.lineTo(x + s / 2 + 6, y - 6); c.lineTo(x + s / 2, y); c.fill(); c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 1; c.strokeRect(x - s / 2, y - s, s, s); c.fillStyle = '#FDE68A'; c.fillRect(x - 2, y - s, 4, s); };
  const items = t => {
    const out = [], Hl = D.HALL, B = D.BELT;
    out.push({ x: Hl.x + Hl.w / 2, y: Hl.y + Hl.h, draw: c => building3d(c, 'g8hall', { ...Hl, wall: '#E2E8F0', door: '#EA580C', style: 'shop', sign: 'مصنع التغليف' }) });
    out.push({ x: D.LAB.x + D.LAB.w / 2, y: D.LAB.y + D.LAB.h, draw: c => building3d(c, 'g8lab', { ...D.LAB, wall: '#FDE68A', door: '#1E3A8A', style: 'shop', sign: 'مختبر القصّ' }) });
    const Ch = D.CHIMNEY; out.push({ x: Ch.x, y: Ch.y + 200, draw: c => { const { lx, ly } = leanAt(Hl.x + Hl.w / 2, Hl.y + Hl.h); c.save(); c.translate(lx * Hl.H, -Hl.H * (1 - ly)); roundTower(c, Ch.x, Ch.y, Ch.r, Ch.H, '#B91C1C');
      for (let k = 0; k < 6; k++) { const u = (t * .25 + k / 6) % 1; c.fillStyle = `rgba(230,230,230,${.55 * (1 - u)})`; c.beginPath(); c.arc(Ch.x + u * 40 + Math.sin(t + k) * 6, Ch.y - Ch.H - u * 120, 14 + u * 22, 0, 7); c.fill(); } c.restore(); } });
    const Tw = D.TOWERW; out.push({ x: Tw.x, y: Tw.y, draw: c => upright(c, Tw.x, Tw.y, cc => { cc.strokeStyle = '#64748B'; cc.lineWidth = 6; [-30, 30].forEach(o => { cc.beginPath(); cc.moveTo(Tw.x + o, Tw.y); cc.lineTo(Tw.x + o * .6, Tw.y - Tw.H + 60); cc.stroke(); });
      cc.fillStyle = '#38BDF8'; cc.beginPath(); cc.ellipse(Tw.x, Tw.y - Tw.H + 40, Tw.r, 14, 0, 0, 7); cc.fill(); cc.fillRect(Tw.x - Tw.r, Tw.y - Tw.H, Tw.r * 2, 40); cc.fillStyle = '#7DD3FC'; cc.beginPath(); cc.ellipse(Tw.x, Tw.y - Tw.H, Tw.r, 14, 0, 0, 7); cc.fill();
      cc.fillStyle = '#FFF'; cc.font = '900 14px Cairo'; cc.textAlign = 'center'; cc.fillText('💧', Tw.x, Tw.y - Tw.H + 26); }) });
    // سير الإنتاج: قاعدة وأسطوانات وصناديق تتقدّم
    out.push({ x: (B.x0 + B.x1) / 2, y: B.y + 10, draw: c => { c.fillStyle = '#3F3F46'; c.fillRect(B.x0, B.y - 30, B.x1 - B.x0, 26); c.fillStyle = '#52525B'; for (let x = B.x0 + ((t * 40) % 24); x < B.x1; x += 24) c.fillRect(x, B.y - 28, 12, 22);
      c.fillStyle = '#71717A'; for (let x = B.x0 + 10; x < B.x1; x += 120) c.fillRect(x, B.y - 4, 8, 16);
      D.fac.boxes.forEach((u, k) => box(c, B.x0 + 20 + u * (B.x1 - B.x0 - 40), B.y - 26, 30, BOXC[k % 6])); } });
    D.PALLETS.forEach(([x, y], k) => out.push({ x, y, draw: c => { c.fillStyle = '#9A6A3E'; c.fillRect(x - 32, y - 6, 64, 8); for (let j = 0; j < 3; j++) box(c, x - 16 + (j % 2) * 32, y - 6 - (j > 1 ? 30 : 0), 30, BOXC[(k + j) % 6]); } }));
    out.push({ x: D.DOCK.x, y: D.DOCK.y + D.DOCK.h, draw: c => { stoneBox(c, D.DOCK.x, D.DOCK.y, D.DOCK.w, D.DOCK.h, 30, '#94A3B8', false); } });
    const F = D.fac.fork; out.push({ y: F.y, draw: c => upright(c, F.x, F.y, cc => { cc.save(); cc.translate(F.x, F.y); const d = Math.cos(F.ang || 0) >= 0 ? 1 : -1; cc.scale(d, 1);
      cc.fillStyle = 'rgba(0,0,0,.22)'; cc.beginPath(); cc.ellipse(0, 2, 30, 8, 0, 0, 7); cc.fill(); cc.fillStyle = '#FACC15'; cc.fillRect(-24, -30, 36, 26); cc.fillStyle = '#1F2937'; cc.fillRect(-20, -48, 4, 20); cc.fillRect(4, -48, 4, 20); cc.fillRect(-20, -50, 28, 4);
      cc.fillStyle = '#374151'; cc.fillRect(14, -50, 4, 46); cc.fillRect(14, -6, 20, 3); box(cc, 26, -9, 22, '#2563EB'); cc.fillStyle = '#111'; [-16, 6].forEach(o => { cc.beginPath(); cc.arc(o, -3, 6, 0, 7); cc.fill(); }); cc.restore(); }) });
    // البطّ في البحيرة
    D.fac.ducks.forEach((ph, k) => { const a = D.fac.t * .15 + ph, x = P.x + Math.cos(a) * P.rx * .55, y = P.y + Math.sin(a) * P.ry * .45; out.push({ y, draw: c => { c.fillStyle = k % 2 ? '#F8FAFC' : '#A16207'; c.beginPath(); c.ellipse(x, y - 4, 10, 6, 0, 0, 7); c.fill(); c.beginPath(); c.arc(x + 8 * (Math.sin(a) > 0 ? -1 : 1), y - 11, 4.5, 0, 7); c.fill(); c.fillStyle = '#F59E0B'; c.fillRect(x + 11 * (Math.sin(a) > 0 ? -1 : 1) - 2, y - 11, 4, 2); } }); });
    D.STALLS.forEach(([x, y, col]) => out.push({ x, y, draw: c => stall(c, x, y, col) }));
    const A = { building3d, stoneBox, sidrCached, palmCached, bench, upright, leanAt };
    D.HOMES.forEach((Hm, i) => out.push(...houseItems2D(Hm, A, 'g8ph' + i, t)));
    out.push(...streetItems2D(D.life, D.STREET, { upright, bench, signboard }, t));
    const M = D.MOSQUE, N = D.MINARET;
    out.push({ x: M.x + M.w / 2, y: M.y + M.h, draw: c => { building3d(c, 'g8pmosque', M); const { lx, ly } = leanAt(M.x + M.w / 2, M.y + M.h); c.save(); c.translate(lx * M.H, -M.H * (1 - ly)); minaret(c, 'g8pminaret', N.x, N.y, N.s, N.H); c.restore(); } });
    D.PALMS.forEach(([x, y, s]) => out.push({ x, y, draw: c => palmCached(c, x, y, s, false, t) }));
    D.LAMPS.forEach(([x, y]) => out.push({ x, y, draw: c => streetLamp(c, x, y, t, false) }));
    // نصب المكعب العملاق ونصف شبكته المفتوحة في جزيرة الدوّار
    const R = D.RING; out.push({ x: R.x, y: R.y + 14, draw: c => upright(c, R.x, R.y + 14, cc => { box(cc, R.x - 10, R.y + 10, 64, '#F59E0B'); [[44, '#E11D48'], [-46, '#2563EB']].forEach(([o, col]) => { cc.fillStyle = col; cc.globalAlpha = .9; cc.fillRect(R.x + o - 14, R.y - 50, 28, 56); cc.globalAlpha = 1; }); }) });
    out.push({ x: 1150, y: YARD - 40, draw: c => upright(c, 1150, YARD - 40, cc => { cc.fillStyle = '#EA580C'; cc.fillRect(1052, YARD - 170, 12, 130); cc.fillRect(1236, YARD - 170, 12, 130); cc.fillRect(1044, YARD - 178, 212, 14); signboard(cc, 1150, YARD - 142, '📦 مصنع التغليف'); }) });
    return out;
  };
  const over = (c, t) => { D.HOMES.forEach(Hm => houseSmoke2D(Hm, c, t)); birds2D(c, D.life, D.STREET, t); bunting(c, elev(1024, 1000, 110), elev(1276, 1000, 110), 26, 11, ['#EA580C', '#FFFFFF', '#2563EB', '#16A34A'], t); };
  function station(c, s, t, st) {
    const done = st && st.doneIds && st.doneIds[s.id];
    if (s.kind === 'fold') upright(c, s.x, s.y, cc => { cc.fillStyle = '#475569'; cc.fillRect(s.x - 40, s.y - 60, 80, 56); cc.fillStyle = '#F59E0B'; const k = (Math.sin(t * 2) + 1) / 2; cc.fillRect(s.x - 30, s.y - 50, 60 * (1 - k * .5), 24); cc.fillStyle = '#E11D48'; cc.fillRect(s.x - 30 + 60 * (1 - k * .5), s.y - 50, 18, 24 * (1 - k)); signboard(cc, s.x, s.y - 90, '📦 خط الطيّ'); });
    else if (s.kind === 'lab') upright(c, s.x, s.y, cc => { cc.fillStyle = '#F8FAFC'; cc.fillRect(s.x - 40, s.y - 40, 80, 36); cc.strokeStyle = '#1E3A8A'; cc.lineWidth = 3; cc.beginPath(); cc.moveTo(s.x - 30, s.y - 10); cc.lineTo(s.x + 30, s.y - 10); cc.lineTo(s.x, s.y - 36); cc.closePath(); cc.stroke(); signboard(cc, s.x, s.y - 70, '📐 مختبر الزوايا'); });
    else if (s.kind === 'belts') upright(c, s.x, s.y, cc => { [-14, 14].forEach(o => { cc.fillStyle = '#52525B'; cc.fillRect(s.x - 60, s.y - 20 + o, 120, 10); }); cc.strokeStyle = '#0EA5E9'; cc.lineWidth = 6; cc.beginPath(); cc.moveTo(s.x + 30, s.y - 50); cc.lineTo(s.x - 30, s.y + 10); cc.stroke(); signboard(cc, s.x, s.y - 80, '⚙️ سيور الإنتاج'); });
    if (done) { c.fillStyle = '#16A34A'; c.beginPath(); c.arc(s.x + 60, s.y - 40, 15, 0, 7); c.fill(); c.fillStyle = '#fff'; c.font = '900 18px Cairo'; c.textAlign = 'center'; c.fillText('✓', s.x + 60, s.y - 34); }
  }
  return { ground, groundLive, items, over, station };
}
