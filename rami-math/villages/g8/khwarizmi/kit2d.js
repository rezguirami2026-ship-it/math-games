// ميزان الخوارزمي في العرض العادي بأدوات العالم المفتوح: دار الحكمة بقبتين ورواق مقوّس، مرصد النجوم برجاً بقبة ومنظار، الميزان
// الكبير يتمايل في الساحة، حديقة رباعية بأحواض ونافورة وسواقٍ، مدرسة بألواح، ورشة صناديق، جناح ساعة الماء، ونصب ذات الحلق في الدوّار.
import { pattern, building3d, minaret, leanAt, stall, palmCached, streetLamp, signboard, upright, boxShadow, blobShadow, stoneBox, sidrCached, bench, bunting, lanternString, elev, shrub, roundTower, dome } from '../../../world/art.js';
import { houseItems2D, houseSmoke2D } from '../../houses.js';
import { paintStreets, streetItems2D, birds2D } from '../../street.js';

const GOLD = '#C8961E', TEAL = '#0F766E';
export function kit2d(D) {
  const { YARD, TOP } = D, W = D.size.w, H = D.size.h, G = D.GARDEN;
  function ground(g, x0, y0, w, h) {
    g.fillStyle = '#E6CFA2'; g.fillRect(x0, y0, w, h); g.fillStyle = pattern(g, 'sand'); g.fillRect(x0, y0, w, h);
    g.fillStyle = '#C9A26E'; g.fillRect(0, 0, W, TOP); g.fillStyle = 'rgba(120,80,40,.25)'; for (let x = 0; x < W; x += 80) { g.beginPath(); g.moveTo(x, TOP); g.lineTo(x + 40, TOP - 50 - (x % 160 ? 10 : 0)); g.lineTo(x + 80, TOP); g.fill(); }
    // ساحة دار الحكمة: بلاط حجري بنجمة ثمانية حول الميزان
    g.fillStyle = '#E2D3B8'; g.fillRect(140, 400, 1300, 330); g.fillStyle = pattern(g, 'pavers'); g.globalAlpha = .5; g.fillRect(140, 400, 1300, 330); g.globalAlpha = 1;
    g.strokeStyle = 'rgba(15,118,110,.45)'; g.lineWidth = 4; [0, Math.PI / 4].forEach(a => { g.beginPath(); for (let k = 0; k < 4; k++) { const b = a + k * Math.PI / 2; g.lineTo(D.BAL.x + Math.cos(b) * 120, D.BAL.y + 40 + Math.sin(b) * 60); } g.closePath(); g.stroke(); });
    // الحديقة الرباعية: عشب وممران متقاطعان وسواقٍ
    g.fillStyle = '#8DBB5E'; g.fillRect(G.x, G.y, G.w, G.h); g.fillStyle = '#E2D3B8'; g.fillRect(G.x + G.w / 2 - 20, G.y, 40, G.h); g.fillRect(G.x, G.y + G.h / 2 - 20, G.w, 40);
    g.fillStyle = '#4FA3D9'; g.fillRect(G.x + G.w / 2 - 6, G.y, 12, G.h); g.fillRect(G.x, G.y + G.h / 2 - 6, G.w, 12);
    paintStreets(g, D.STREET, W, H);
    D.HOMES.forEach(Hm => { Hm.parts.forEach(b => boxShadow(g, b.x, b.y, b.w, b.h, b.H || 96)); Hm.walls.forEach(q => boxShadow(g, q.x, q.y, q.w, q.h, 26)); });
    [D.MOSQUE, D.LIB, D.SCHOOL, D.SHOP].forEach(b => boxShadow(g, b.x, b.y, b.w, b.h, b.H || 96));
    blobShadow(g, D.OBS.x, D.OBS.y, D.OBS.r, D.OBS.H); blobShadow(g, D.BAL.x, D.BAL.y, 50, 120);
  }
  const groundLive = (c, t) => { c.fillStyle = 'rgba(255,255,255,.5)'; for (let k = 0; k < 6; k++) { const u = (t * .3 + k / 6) % 1; c.fillRect(G.x + G.w / 2 - 3, G.y + u * G.h, 6, 2); c.fillRect(G.x + u * G.w, G.y + G.h / 2 - 1, 2, 2); } };
  const domeOn = (c, b, cx, r) => { const { lx, ly } = leanAt(b.x + b.w / 2, b.y + b.h); c.save(); c.translate(lx * b.H, -b.H * (1 - ly)); dome(c, cx, b.y + b.h * .55, r); c.restore(); };
  const items = t => {
    const out = [], L = D.LIB, O = D.OBS, B = D.BAL, k = D.kit;
    out.push({ x: L.x + L.w / 2, y: L.y + L.h, draw: c => { building3d(c, 'g8lib', { ...L, wall: '#F3E9D2', door: '#0F766E', style: 'shop', sign: 'دار الحكمة' }); domeOn(c, L, L.x + 140, 54); domeOn(c, L, L.x + L.w - 140, 54); } });
    // رواق مقوّس أمام دار الحكمة
    out.push({ x: L.x + L.w / 2, y: L.y + L.h + 40, draw: c => upright(c, L.x + L.w / 2, L.y + L.h + 40, cc => { const y = L.y + L.h + 40; cc.fillStyle = '#E9DCC2'; cc.fillRect(L.x + 10, y - 86, L.w - 20, 16);
      for (let x = L.x + 20; x < L.x + L.w - 20; x += 64) { cc.fillStyle = '#E9DCC2'; cc.fillRect(x, y - 72, 10, 72); cc.strokeStyle = '#B49A74'; cc.lineWidth = 3; cc.beginPath(); cc.arc(x + 37, y - 70, 27, Math.PI, 0); cc.stroke(); } cc.fillRect(L.x + L.w - 30, y - 72, 10, 72); }) });
    // المرصد: برج دائري بقبة ومنظار نحاسي
    out.push({ x: O.x, y: O.y + 20, draw: c => { roundTower(c, O.x, O.y, O.r, O.H, '#DCC9A3'); const { lx, ly } = leanAt(O.x, O.y); c.save(); c.translate(lx * O.H, -O.H * (1 - ly)); dome(c, O.x, O.y + 8, O.r * .8);
      c.strokeStyle = '#B87333'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(O.x + 10, O.y - O.r * .9); c.lineTo(O.x + 62, O.y - O.r * 1.8); c.stroke(); c.lineCap = 'butt'; c.restore(); } });
    // الميزان الكبير: قاعدة، عمود، وعاتق يتمايل بكفّتين
    out.push({ x: B.x, y: B.y + 30, draw: c => upright(c, B.x, B.y + 30, cc => { const a = Math.sin(k.t * .8) * .06, y = B.y + 30; cc.fillStyle = '#9A7B4F'; cc.fillRect(B.x - 40, y - 14, 80, 14); cc.fillStyle = GOLD; cc.fillRect(B.x - 6, y - 150, 12, 136);
      cc.save(); cc.translate(B.x, y - 150); cc.rotate(a); cc.fillRect(-110, -6, 220, 12); cc.restore();
      [-1, 1].forEach(s => { const px = B.x + s * 110 * Math.cos(a), py = y - 150 + s * 110 * Math.sin(a); cc.strokeStyle = '#8B6914'; cc.lineWidth = 2; cc.beginPath(); cc.moveTo(px, py); cc.lineTo(px - 30, py + 60); cc.moveTo(px, py); cc.lineTo(px + 30, py + 60); cc.stroke(); cc.fillStyle = GOLD; cc.beginPath(); cc.ellipse(px, py + 62, 38, 9, 0, 0, 7); cc.fill(); });
      cc.beginPath(); cc.arc(B.x, y - 156, 12, 0, 7); cc.fill(); }) });
    // الحديقة: أحواض بشجيرات مزهرة ونافورة
    D.BEDS.forEach((b, j) => out.push({ x: b.x + b.w / 2, y: b.y + b.h, draw: c => { stoneBox(c, b.x, b.y, b.w, b.h, 12, '#D6C7AE', false); for (let x = b.x + 22; x < b.x + b.w - 10; x += 32) for (let y = b.y + 34; y < b.y + b.h; y += 38) shrub(c, x, y, 13, ['#F472B6', '#FACC15', '#A855F7', '#EF4444'][j]); } }));
    out.push({ x: G.x + G.w / 2, y: G.y + G.h / 2 + 20, draw: c => upright(c, G.x + G.w / 2, G.y + G.h / 2 + 20, cc => { const x = G.x + G.w / 2, y = G.y + G.h / 2 + 20; cc.fillStyle = '#E7E5E4'; cc.beginPath(); cc.ellipse(x, y - 10, 34, 13, 0, 0, 7); cc.fill(); cc.fillStyle = '#4FA3D9'; cc.beginPath(); cc.ellipse(x, y - 12, 28, 9, 0, 0, 7); cc.fill();
      cc.fillStyle = '#E7E5E4'; cc.fillRect(x - 4, y - 40, 8, 30); for (let q = 0; q < 6; q++) { const u = (k.t * .8 + q / 6) % 1; cc.fillStyle = `rgba(147,197,253,${1 - u})`; cc.beginPath(); cc.arc(x + Math.cos(q) * u * 22, y - 42 + u * 30 - Math.sin(u * Math.PI) * 14, 2.5, 0, 7); cc.fill(); } }) });
    out.push({ x: D.SCHOOL.x + D.SCHOOL.w / 2, y: D.SCHOOL.y + D.SCHOOL.h, draw: c => { building3d(c, 'g8school', { ...D.SCHOOL, wall: '#FDE8C8', door: '#1E3A8A', style: 'shop', sign: 'المدرسة' }); domeOn(c, D.SCHOOL, D.SCHOOL.x + D.SCHOOL.w / 2, 40); } });
    out.push({ x: D.SHOP.x + D.SHOP.w / 2, y: D.SHOP.y + D.SHOP.h, draw: c => building3d(c, 'g8boxshop', { ...D.SHOP, wall: '#EAD9BF', door: '#9D174D', style: 'shop', sign: 'ورشة الصناديق' }) });
    // صناديق خشبية مكدّسة أمام الورشة
    out.push({ x: 2010, y: 690, draw: c => upright(c, 2010, 690, cc => { [[0, 0], [34, 0], [17, -30]].forEach(([dx, dy]) => { cc.fillStyle = '#B8834A'; cc.fillRect(1993 + dx, 660 + dy, 32, 30); cc.strokeStyle = '#7C4A1E'; cc.lineWidth = 2; cc.strokeRect(1993 + dx, 660 + dy, 32, 30); cc.beginPath(); cc.moveTo(1993 + dx, 660 + dy); cc.lineTo(2025 + dx, 690 + dy); cc.stroke(); }); }) });
    // جناح ساعة الماء: أربعة أعمدة وقبة صغيرة وإناء
    const C = D.CLOCK; out.push({ x: C.x, y: C.y + 20, draw: c => upright(c, C.x, C.y + 20, cc => { const y = C.y + 20; cc.fillStyle = '#E9DCC2'; [-34, 26].forEach(o => cc.fillRect(C.x + o, y - 90, 8, 90)); cc.fillRect(C.x - 40, y - 100, 80, 12);
      cc.fillStyle = '#B87333'; cc.beginPath(); cc.ellipse(C.x, y - 40, 22, 10, 0, 0, 7); cc.fill(); const d = (k.t * 1.5) % 1; cc.fillStyle = '#38BDF8'; cc.beginPath(); cc.arc(C.x, y - 88 + d * 40, 3, 0, 7); cc.fill(); dome(cc, C.x, y - 100, 34); }) });
    D.STALLS.forEach(([x, y, col]) => out.push({ x, y, draw: c => stall(c, x, y, col) }));
    const A = { building3d, stoneBox, sidrCached, palmCached, bench, upright, leanAt };
    D.HOMES.forEach((Hm, i) => out.push(...houseItems2D(Hm, A, 'g8kh' + i, t)));
    out.push(...streetItems2D(D.life, D.STREET, { upright, bench, signboard }, t));
    const M = D.MOSQUE, N = D.MINARET;
    out.push({ x: M.x + M.w / 2, y: M.y + M.h, draw: c => { building3d(c, 'g8khmosque', M); const { lx, ly } = leanAt(M.x + M.w / 2, M.y + M.h); c.save(); c.translate(lx * M.H, -M.H * (1 - ly)); minaret(c, 'g8khminaret', N.x, N.y, N.s, N.H); c.restore(); } });
    D.PALMS.forEach(([x, y, s]) => out.push({ x, y, draw: c => palmCached(c, x, y, s, false, t) }));
    D.LAMPS.forEach(([x, y]) => out.push({ x, y, draw: c => streetLamp(c, x, y, t, false) }));
    // نصب ذات الحلق: حلقات نحاسية متقاطعة تدور على قاعدة
    const R = D.RING; out.push({ x: R.x, y: R.y + 20, draw: c => upright(c, R.x, R.y + 20, cc => { const y = R.y + 20; cc.fillStyle = '#E7E5E4'; cc.fillRect(R.x - 34, y - 16, 68, 16); cc.fillStyle = '#9A7B4F'; cc.fillRect(R.x - 5, y - 60, 10, 46);
      const cy = y - 112; cc.strokeStyle = GOLD; cc.lineWidth = 6; cc.beginPath(); cc.arc(R.x, cy, 52, 0, 7); cc.stroke(); cc.lineWidth = 4; cc.beginPath(); cc.ellipse(R.x, cy, 52, 16, 0, 0, 7); cc.stroke();
      cc.strokeStyle = TEAL; cc.beginPath(); cc.ellipse(R.x, cy, Math.abs(Math.cos(k.t * .7)) * 52 + 2, 52, 0, 0, 7); cc.stroke(); cc.strokeStyle = '#B87333'; cc.beginPath(); cc.ellipse(R.x, cy, 52, Math.abs(Math.sin(k.t * .5)) * 40 + 4, .5, 0, 7); cc.stroke();
      cc.fillStyle = '#FDE68A'; cc.beginPath(); cc.arc(R.x, cy, 9, 0, 7); cc.fill(); }) });
    out.push({ x: R.x, y: YARD - 40, draw: c => upright(c, R.x, YARD - 40, cc => { cc.fillStyle = TEAL; cc.fillRect(R.x - 98, YARD - 170, 12, 130); cc.fillRect(R.x + 86, YARD - 170, 12, 130); cc.fillRect(R.x - 106, YARD - 178, 212, 14); signboard(cc, R.x, YARD - 142, '📜 ميزان الخوارزمي'); }) });
    return out;
  };
  const over = (c, t) => { D.HOMES.forEach(Hm => houseSmoke2D(Hm, c, t)); birds2D(c, D.life, D.STREET, t);
    bunting(c, elev(1534, 1000, 110), elev(1786, 1000, 110), 26, 11, [TEAL, '#FFFFFF', GOLD, '#1E3A8A'], t); lanternString(c, elev(1100, 560, 90), elev(1400, 560, 90), 20, 7, t); };
  function station(c, s, t, st) {
    const done = st && st.doneIds && st.doneIds[s.id];
    upright(c, s.x, s.y, cc => {
      cc.fillStyle = '#E9DCC2'; cc.fillRect(s.x - 34, s.y - 26, 68, 22); cc.strokeStyle = '#B49A74'; cc.lineWidth = 2; cc.strokeRect(s.x - 34, s.y - 26, 68, 22);
      const y = s.y - 30; cc.fillStyle = TEAL; cc.font = '900 22px "Noto Color Emoji", "Segoe UI Emoji", sans-serif'; cc.textAlign = 'center'; cc.fillText(s.icon, s.x, y - 4);
      signboard(cc, s.x, s.y - 84, `${s.icon} ${s.label}`);
    });
    if (done) { c.fillStyle = '#16A34A'; c.beginPath(); c.arc(s.x + 60, s.y - 40, 15, 0, 7); c.fill(); c.fillStyle = '#fff'; c.font = '900 18px Cairo'; c.textAlign = 'center'; c.fillText('✓', s.x + 60, s.y - 34); }
  }
  return { ground, groundLive, items, over, station };
}
