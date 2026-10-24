// مزارع الأفلاج في العرض العادي بأدوات العالم المفتوح: أم الفلج ببكرتها، وساقية الفلج الحجرية يجري ماؤها إلى الشريعة ثم الفروع،
// والأثر (مزولة يدور ظلها)، والجابية الدائرية، وحقول البرسيم، والحارة القديمة ببيوت الطين وبرجها، والبيدر، وبيتا الزراعة
// النصف أسطوانيين، والخزّانات الأسطوانية، وبيت المضخة، وبرج المراقبة، ونصب الجرّة في الدوّار.
import { pattern, building3d, minaret, leanAt, stall, palmCached, streetLamp, signboard, upright, boxShadow, blobShadow, stoneBox, sidrCached, bench, bunting, elev, roundTower, stoneWell } from '../../../world/art.js';
import { houseItems2D, houseSmoke2D } from '../../houses.js';
import { paintStreets, streetItems2D, birds2D } from '../../street.js';

const GREEN = '#15803D', WATER = '#3B82C4', STONE = '#A8A29E';
export function kit2d(D) {
  const { YARD, TOP } = D, W = D.size.w, H = D.size.h, J = D.JABIA;
  function ground(g, x0, y0, w, h) {
    g.fillStyle = '#E6CFA2'; g.fillRect(x0, y0, w, h); g.fillStyle = pattern(g, 'sand'); g.fillRect(x0, y0, w, h);
    g.fillStyle = '#C9A26E'; g.fillRect(0, 0, W, TOP); g.fillStyle = 'rgba(120,80,40,.25)'; for (let x = 0; x < W; x += 80) { g.beginPath(); g.moveTo(x, TOP); g.lineTo(x + 40, TOP - 50 - (x % 160 ? 10 : 0)); g.lineTo(x + 80, TOP); g.fill(); }
    // تربة المزارع الغربية وظل البستان
    g.fillStyle = '#C9A879'; g.fillRect(130, 330, 1080, 470); g.fillStyle = pattern(g, 'soil'); g.globalAlpha = .55; g.fillRect(130, 330, 1080, 470); g.globalAlpha = 1;
    // حقول البرسيم: أخضر بخطوط زراعة
    D.PLOTS.forEach(([x, y, w2, h2], i) => { g.fillStyle = i % 2 ? '#7FB24A' : '#8CBD52'; g.fillRect(x, y, w2, h2); g.strokeStyle = 'rgba(40,90,30,.35)'; g.lineWidth = 2;
      for (let yy = y + 8; yy < y + h2; yy += 12) { g.beginPath(); g.moveTo(x + 4, yy); g.lineTo(x + w2 - 4, yy); g.stroke(); } g.strokeStyle = '#8B6B47'; g.lineWidth = 4; g.strokeRect(x, y, w2, h2); });
    // البيدر: أرض دائرية مرصوصة بقش
    const B = D.BAIDAR; g.fillStyle = '#D9BE8A'; g.beginPath(); g.ellipse(B.x, B.y, B.r, B.r, 0, 0, 7); g.fill(); g.strokeStyle = '#A8865A'; g.lineWidth = 6; g.stroke();
    g.strokeStyle = 'rgba(234,179,8,.5)'; g.lineWidth = 2; for (let k = 0; k < 40; k++) { const a = k * 2.4, r = 10 + (k * 13) % (B.r - 14); g.beginPath(); g.moveTo(B.x + Math.cos(a) * r, B.y + Math.sin(a) * r); g.lineTo(B.x + Math.cos(a + .3) * (r + 8), B.y + Math.sin(a + .3) * (r + 8)); g.stroke(); }
    // أرض المزرعة الحديثة (حصى)
    g.fillStyle = '#D8C7A6'; g.fillRect(1450, 480, 860, 300); g.fillStyle = pattern(g, 'pavers'); g.globalAlpha = .25; g.fillRect(1450, 480, 860, 300); g.globalAlpha = 1;
    // ساقية الفلج: حافة حجرية وماء
    const seg = (wd, col) => { g.strokeStyle = col; g.lineWidth = wd; g.lineCap = 'square'; D.CH.forEach(([a, b, c, d]) => { g.beginPath(); g.moveTo(a, b); g.lineTo(c, d); g.stroke(); }); g.lineCap = 'butt'; };
    seg(26, '#8F887F'); seg(22, STONE); seg(12, WATER);
    // الجابية: حلقة حجرية وماء
    g.fillStyle = '#8F887F'; g.beginPath(); g.arc(J.x, J.y, J.r + 12, 0, 7); g.fill(); g.fillStyle = STONE; g.beginPath(); g.arc(J.x, J.y, J.r + 8, 0, 7); g.fill();
    g.fillStyle = '#2F6FAE'; g.beginPath(); g.arc(J.x, J.y, J.r, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.arc(J.x - 18, J.y - 16, J.r * .45, 0, 7); g.fill();
    // الشريعة: مصطبة حجرية عند التفرّع
    g.fillStyle = '#B9B2A8'; g.fillRect(D.SHARIA.x - 34, D.SHARIA.y - 26, 68, 52); g.strokeStyle = '#7C756C'; g.lineWidth = 3; g.strokeRect(D.SHARIA.x - 34, D.SHARIA.y - 26, 68, 52);
    g.fillStyle = WATER; g.fillRect(D.SHARIA.x - 22, D.SHARIA.y - 14, 44, 28);
    paintStreets(g, D.STREET, W, H);
    D.HOMES.forEach(Hm => { Hm.parts.forEach(b => boxShadow(g, b.x, b.y, b.w, b.h, b.H || 96)); Hm.walls.forEach(q => boxShadow(g, q.x, q.y, q.w, q.h, 26)); });
    [D.MOSQUE, D.PUMP, ...D.OLD].forEach(b => boxShadow(g, b.x, b.y, b.w, b.h, b.H || 96)); D.GREEN.forEach(b => boxShadow(g, b.x, b.y, b.w, b.h, 60));
    boxShadow(g, D.BASIN.x, D.BASIN.y, D.BASIN.w, D.BASIN.h, 26);
    blobShadow(g, D.FORT.x, D.FORT.y, D.FORT.r, D.FORT.H); blobShadow(g, D.WATCH.x, D.WATCH.y, D.WATCH.r, D.WATCH.H); D.TANKS.forEach(([x, y, r, h2]) => blobShadow(g, x, y, r, h2));
  }
  // الماء الجاري: لمعات تتحرك مع اتجاه الجريان، وتموّج الجابية
  const groundLive = (c, t) => {
    c.fillStyle = 'rgba(255,255,255,.55)';
    D.CH.forEach(([a, b, x1, y1]) => { const L = Math.hypot(x1 - a, y1 - b), ux = (x1 - a) / L, uy = (y1 - b) / L; for (let s = (t * 46) % 40; s < L; s += 40) { const x = a + ux * s, y = b + uy * s; c.fillRect(x - (ux ? 5 : 1), y - (uy ? 5 : 1), ux ? 10 : 2, uy ? 10 : 2); } });
    c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 2; for (let k = 0; k < 3; k++) { const u = (t * .25 + k / 3) % 1; c.beginPath(); c.arc(J.x, J.y, J.r * u, 0, 7); c.stroke(); }
    // ظل الأثر يدور ببطء (دور الماء بين المزارع)
    const a = -Math.PI * .9 + ((t * .03) % 1) * Math.PI * .8, dl = D.DIAL; c.strokeStyle = 'rgba(40,30,20,.45)'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(dl.x, dl.y); c.lineTo(dl.x + Math.cos(a) * 60, dl.y + Math.sin(a) * 28 + 20); c.stroke(); c.lineCap = 'butt';
  };
  const lift = (c, x, y, h2, f) => { const { lx, ly } = leanAt(x, y); c.save(); c.translate(lx * h2, -h2 * (1 - ly)); f(); c.restore(); };
  const items = t => {
    const out = [], k = D.kit;
    // الحارة القديمة: بيوت طين وبرج
    D.OLD.forEach((b, i) => out.push({ x: b.x + b.w / 2, y: b.y + b.h, draw: c => building3d(c, 'g8afold' + i, b) }));
    const F = D.FORT; out.push({ x: F.x, y: F.y + 20, draw: c => { roundTower(c, F.x, F.y, F.r, F.H, '#C8A273'); lift(c, F.x, F.y, F.H, () => { c.fillStyle = '#B08A5C'; for (let q = 0; q < 8; q++) { const a = q / 8 * Math.PI * 2; c.fillRect(F.x + Math.cos(a) * F.r * .9 - 5, F.y + Math.sin(a) * F.r * .4 - 12, 10, 12); } }); } });
    // أم الفلج: بئر حجرية ببكرة ودلو يصعد وينزل
    const S = D.SRC; out.push({ x: S.x, y: S.y + 14, draw: c => upright(c, S.x, S.y + 14, cc => { stoneWell(cc, S.x, S.y + 14, S.r, t); const by = S.y - 30 + Math.sin(k.t * .9) * 10; cc.strokeStyle = '#5C3A20'; cc.lineWidth = 1.5; cc.beginPath(); cc.moveTo(S.x, S.y - 26); cc.lineTo(S.x, by); cc.stroke(); cc.fillStyle = '#8B5A33'; cc.fillRect(S.x - 6, by, 12, 10); }) });
    out.push({ x: S.x - 70, y: S.y - 30, draw: c => upright(c, S.x - 70, S.y - 30, cc => signboard(cc, S.x - 70, S.y - 70, '💧 أم الفلج')) });
    // الأثر: عمود المزولة وحجارة الدور
    const dl = D.DIAL; out.push({ x: dl.x, y: dl.y, draw: c => { for (let q = 0; q < 5; q++) { const a = -Math.PI * .9 + q * Math.PI * .2; c.fillStyle = '#9C948A'; c.beginPath(); c.ellipse(dl.x + Math.cos(a) * 66, dl.y + Math.sin(a) * 30 + 20, 7, 4, 0, 0, 7); c.fill(); }
      upright(c, dl.x, dl.y, cc => { cc.fillStyle = '#6B4520'; cc.fillRect(dl.x - 3, dl.y - 70, 6, 70); cc.fillStyle = '#4A2F15'; cc.fillRect(dl.x - 5, dl.y - 74, 10, 6); }); } });
    // الشريعة: ألواح خشبية تقسم الماء
    const Sh = D.SHARIA; out.push({ x: Sh.x, y: Sh.y + 26, draw: c => upright(c, Sh.x, Sh.y + 26, cc => { cc.fillStyle = '#7A4A2A'; [[-30, 0], [30, 0], [0, 26]].forEach(([dx, dy]) => cc.fillRect(Sh.x + dx - 3, Sh.y + dy - 20, 6, 22)); cc.fillStyle = '#9C948A'; cc.fillRect(Sh.x - 36, Sh.y - 28, 72, 8); }) });
    // الجابية: حافة حجرية منخفضة أمامية
    out.push({ x: J.x, y: J.y + J.r, draw: c => upright(c, J.x, J.y + J.r, cc => { cc.strokeStyle = '#8F887F'; cc.lineWidth = 12; cc.beginPath(); cc.arc(J.x, J.y - 4, J.r + 6, .15, Math.PI - .15); cc.stroke(); cc.strokeStyle = STONE; cc.lineWidth = 6; cc.beginPath(); cc.arc(J.x, J.y - 10, J.r + 6, .15, Math.PI - .15); cc.stroke(); }) });
    // حوض السقي: صندوق حجري بماء
    const Bs = D.BASIN; out.push({ x: Bs.x + Bs.w / 2, y: Bs.y + Bs.h, draw: c => { stoneBox(c, Bs.x, Bs.y, Bs.w, Bs.h, 26, '#CBB892', false); lift(c, Bs.x + Bs.w / 2, Bs.y + Bs.h, 26, () => { c.fillStyle = WATER; c.fillRect(Bs.x + 8, Bs.y + 6, Bs.w - 16, Bs.h - 14); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(Bs.x + 14 + (k.t * 20) % (Bs.w - 40), Bs.y + 14, 18, 3); }); } });
    // بيتا الزراعة نصف الأسطوانيين: سقف منحنٍ شفاف بأضلاع ونباتات تحته
    D.GREEN.forEach((b, i) => out.push({ x: b.x + b.w / 2, y: b.y + b.h, draw: c => upright(c, b.x + b.w / 2, b.y + b.h, cc => { const Hh = 62, yb = b.y + b.h;
      cc.fillStyle = 'rgba(226,240,232,.92)'; cc.beginPath(); cc.moveTo(b.x, yb); cc.lineTo(b.x, b.y + Hh * .2); cc.quadraticCurveTo(b.x, b.y - Hh, b.x + 20, b.y - Hh); cc.lineTo(b.x + b.w - 20, b.y - Hh); cc.quadraticCurveTo(b.x + b.w, b.y - Hh, b.x + b.w, b.y + Hh * .2); cc.lineTo(b.x + b.w, yb); cc.closePath(); cc.fill();
      cc.fillStyle = 'rgba(255,255,255,.55)'; cc.fillRect(b.x + 10, b.y - Hh + 8, b.w - 20, 14);
      cc.fillStyle = 'rgba(200,225,210,.95)'; cc.beginPath(); cc.moveTo(b.x, yb); cc.lineTo(b.x, yb - Hh * .55); cc.quadraticCurveTo(b.x + b.w / 2, yb - Hh * 1.15, b.x + b.w, yb - Hh * .55); cc.lineTo(b.x + b.w, yb); cc.closePath(); cc.fill();
      cc.strokeStyle = 'rgba(100,116,139,.6)'; cc.lineWidth = 1.5; for (let x = b.x + 30; x < b.x + b.w; x += 30) { cc.beginPath(); cc.moveTo(x, yb); cc.lineTo(x, b.y - Hh + 4); cc.stroke(); }
      for (let x = b.x + 20; x < b.x + b.w - 10; x += 26) { cc.fillStyle = i ? '#16A34A' : '#65A30D'; cc.beginPath(); cc.arc(x, yb - 10, 7, 0, 7); cc.fill(); if (i) { cc.fillStyle = '#DC2626'; cc.beginPath(); cc.arc(x + 3, yb - 12, 2.5, 0, 7); cc.fill(); } }
      cc.fillStyle = '#1F2937'; cc.fillRect(b.x + b.w / 2 - 12, yb - 34, 24, 34); }) }));
    // الخزّانات الأسطوانية بسلّم
    D.TANKS.forEach(([x, y, r, h2], i) => out.push({ x, y: y + r * .4, draw: c => upright(c, x, y + r * .4, cc => { const by = y + r * .3, top = by - h2, ry = r * .42, g = cc.createLinearGradient(x - r, 0, x + r, 0); g.addColorStop(0, '#CBD5E1'); g.addColorStop(.35, '#F1F5F9'); g.addColorStop(1, '#64748B');
      cc.fillStyle = g; cc.beginPath(); cc.moveTo(x - r, top); cc.lineTo(x - r, by); cc.ellipse(x, by, r, ry, 0, Math.PI, 0, true); cc.lineTo(x + r, top); cc.closePath(); cc.fill();
      cc.strokeStyle = 'rgba(71,85,105,.35)'; cc.lineWidth = 1; for (let yy = top + 26; yy < by; yy += 26) { cc.beginPath(); cc.ellipse(x, yy, r, ry, 0, 0, Math.PI); cc.stroke(); }
      cc.fillStyle = '#E2E8F0'; cc.beginPath(); cc.ellipse(x, top, r, ry, 0, 0, 7); cc.fill(); cc.strokeStyle = '#64748B'; cc.stroke();
      cc.strokeStyle = '#475569'; cc.lineWidth = 2; [-8, 8].forEach(o => { cc.beginPath(); cc.moveTo(x + r * .55 + o, by + 4); cc.lineTo(x + r * .55 + o, top + 6); cc.stroke(); }); for (let yy = top + 14; yy < by; yy += 12) { cc.beginPath(); cc.moveTo(x + r * .55 - 8, yy); cc.lineTo(x + r * .55 + 8, yy); cc.stroke(); }
      cc.fillStyle = '#0F766E'; cc.font = '900 16px Cairo'; cc.textAlign = 'center'; cc.fillText('💧' + ['١', '٢', '٣'][i], x - 8, top + h2 * .45); }) }));
    out.push({ x: D.PUMP.x + D.PUMP.w / 2, y: D.PUMP.y + D.PUMP.h, draw: c => building3d(c, 'g8afpump', { ...D.PUMP, wall: '#E7E2D5', door: '#1D4ED8', style: 'shop', sign: 'بيت المضخة' }) });
    const Wt = D.WATCH; out.push({ x: Wt.x, y: Wt.y + 20, draw: c => { roundTower(c, Wt.x, Wt.y, Wt.r, Wt.H, '#D2B48C'); lift(c, Wt.x, Wt.y, Wt.H, () => { c.fillStyle = '#B91C1C'; c.fillRect(Wt.x - 2, Wt.y - 60, 4, 50); c.fillStyle = '#16A34A'; c.beginPath(); c.moveTo(Wt.x + 2, Wt.y - 60); c.lineTo(Wt.x + 30 + Math.sin(k.t * 3) * 3, Wt.y - 52); c.lineTo(Wt.x + 2, Wt.y - 44); c.fill(); }); } });
    // كومة قش على حافة البيدر
    const B = D.BAIDAR; out.push({ x: B.x + B.r - 20, y: B.y + 20, draw: c => upright(c, B.x + B.r - 20, B.y + 20, cc => { cc.fillStyle = '#EAB308'; cc.beginPath(); cc.ellipse(B.x + B.r - 20, B.y + 10, 30, 22, 0, Math.PI, 0); cc.fill(); cc.fillStyle = 'rgba(161,98,7,.4)'; cc.fillRect(B.x + B.r - 46, B.y + 4, 52, 3); }) });
    D.STALLS.forEach(([x, y, col]) => out.push({ x, y, draw: c => stall(c, x, y, col) }));
    const A = { building3d, stoneBox, sidrCached, palmCached, bench, upright, leanAt };
    D.HOMES.forEach((Hm, i) => out.push(...houseItems2D(Hm, A, 'g8af' + i, t)));
    out.push(...streetItems2D(D.life, D.STREET, { upright, bench, signboard }, t));
    const M = D.MOSQUE, N = D.MINARET;
    out.push({ x: M.x + M.w / 2, y: M.y + M.h, draw: c => { building3d(c, 'g8afmosque', M); const { lx, ly } = leanAt(M.x + M.w / 2, M.y + M.h); c.save(); c.translate(lx * M.H, -M.H * (1 - ly)); minaret(c, 'g8afminaret', N.x, N.y, N.s, N.H); c.restore(); } });
    D.PALMS.forEach(([x, y, s]) => out.push({ x, y, draw: c => palmCached(c, x, y, s, false, t) }));
    D.LAMPS.forEach(([x, y]) => out.push({ x, y, draw: c => streetLamp(c, x, y, t, false) }));
    // نصب الجرّة: جرّة فخارية مائلة تصبّ الماء في حوض
    const R = D.RING; out.push({ x: R.x, y: R.y + 20, draw: c => upright(c, R.x, R.y + 20, cc => { const y = R.y + 20; cc.fillStyle = '#E7E5E4'; cc.beginPath(); cc.ellipse(R.x, y - 12, 46, 16, 0, 0, 7); cc.fill(); cc.fillStyle = WATER; cc.beginPath(); cc.ellipse(R.x, y - 14, 38, 11, 0, 0, 7); cc.fill();
      cc.fillStyle = '#9A7B4F'; cc.fillRect(R.x + 20, y - 90, 10, 78);
      cc.save(); cc.translate(R.x + 10, y - 110); cc.rotate(-.9); cc.fillStyle = '#B4643C'; cc.beginPath(); cc.ellipse(0, 0, 26, 34, 0, 0, 7); cc.fill(); cc.fillStyle = '#8C4A2B'; cc.fillRect(-9, -46, 18, 14); cc.strokeStyle = '#F5D0A9'; cc.lineWidth = 3; cc.beginPath(); cc.moveTo(-22, -6); cc.lineTo(22, -6); cc.stroke(); cc.restore();
      cc.strokeStyle = 'rgba(96,165,250,.85)'; cc.lineWidth = 6; cc.beginPath(); cc.moveTo(R.x - 22, y - 122); cc.quadraticCurveTo(R.x - 30, y - 70, R.x - 10, y - 16); cc.stroke();
      for (let q = 0; q < 5; q++) { const u = (k.t * 1.2 + q / 5) % 1; cc.fillStyle = `rgba(191,219,254,${1 - u})`; cc.beginPath(); cc.arc(R.x - 10 + Math.cos(q * 1.3) * u * 26, y - 16 - Math.sin(u * Math.PI) * 8, 2.5, 0, 7); cc.fill(); } }) });
    out.push({ x: R.x, y: YARD - 40, draw: c => upright(c, R.x, YARD - 40, cc => { cc.fillStyle = GREEN; cc.fillRect(R.x - 98, YARD - 170, 12, 130); cc.fillRect(R.x + 86, YARD - 170, 12, 130); cc.fillRect(R.x - 106, YARD - 178, 212, 14); signboard(cc, R.x, YARD - 142, '💧 مزارع الأفلاج'); }) });
    return out;
  };
  const over = (c, t) => { D.HOMES.forEach(Hm => houseSmoke2D(Hm, c, t)); birds2D(c, D.life, D.STREET, t);
    bunting(c, elev(1914, 1000, 110), elev(2166, 1000, 110), 26, 11, [GREEN, '#FFFFFF', '#B91C1C', '#FACC15'], t); };
  function station(c, s, t, st) {
    const done = st && st.doneIds && st.doneIds[s.id];
    upright(c, s.x, s.y, cc => {
      cc.fillStyle = '#D8CBB0'; cc.fillRect(s.x - 34, s.y - 26, 68, 22); cc.strokeStyle = '#8F887F'; cc.lineWidth = 2; cc.strokeRect(s.x - 34, s.y - 26, 68, 22);
      const y = s.y - 30; cc.fillStyle = GREEN; cc.font = '900 22px "Noto Color Emoji", "Segoe UI Emoji", sans-serif'; cc.textAlign = 'center'; cc.fillText(s.icon, s.x, y - 4);
      signboard(cc, s.x, s.y - 84, `${s.icon} ${s.label}`);
    });
    if (done) { c.fillStyle = '#16A34A'; c.beginPath(); c.arc(s.x + 60, s.y - 40, 15, 0, 7); c.fill(); c.fillStyle = '#fff'; c.font = '900 18px Cairo'; c.textAlign = 'center'; c.fillText('✓', s.x + 60, s.y - 34); }
  }
  return { ground, groundLive, items, over, station };
}
