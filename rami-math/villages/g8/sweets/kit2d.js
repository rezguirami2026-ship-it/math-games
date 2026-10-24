// مطبخ الحلوى في العرض العادي بأدوات العالم المفتوح: بيت الحلوى، قدور نحاسية تغلي على الحطب بمجاديف تتحرك وبخار، بستان نخيل
// بمسطاح تمر، حديقة ورد بأحواض حجرية، مقطرة ماء الورد بجرارها وأنبوبها النحاسي، مناحل ونحل، دكّان الحلوى، ونصب الدلّة في الدوّار.
import { pattern, building3d, minaret, leanAt, stall, palmCached, streetLamp, signboard, upright, boxShadow, blobShadow, stoneBox, sidrCached, bench, bunting, lanternString, elev, shrub } from '../../../world/art.js';
import { houseItems2D, houseSmoke2D } from '../../houses.js';
import { paintStreets, streetItems2D, birds2D } from '../../street.js';

const HALWA = '#7A2E12', COPPER = '#B87333', LIDS = ['#DC2626', '#2563EB', '#16A34A', '#F59E0B', '#7C3AED'];
export function kit2d(D) {
  const { YARD, TOP } = D, W = D.size.w, H = D.size.h;
  function ground(g, x0, y0, w, h) {
    g.fillStyle = '#E8CF9E'; g.fillRect(x0, y0, w, h); g.fillStyle = pattern(g, 'sand'); g.fillRect(x0, y0, w, h);
    g.fillStyle = '#C9A26E'; g.fillRect(0, 0, W, TOP); g.fillStyle = 'rgba(120,80,40,.25)'; for (let x = 0; x < W; x += 70) { g.beginPath(); g.moveTo(x, TOP); g.lineTo(x + 35, TOP - 46 - (x % 140 ? 16 : 0)); g.lineTo(x + 70, TOP); g.fill(); }
    // تربة البستان المروية وسواقيها
    g.fillStyle = '#B98B5A'; g.fillRect(60, TOP + 40, 560, 380); g.fillStyle = pattern(g, 'soil'); g.fillRect(60, TOP + 40, 560, 380);
    g.strokeStyle = '#4F86C6'; g.lineWidth = 5; [[60, 260], [60, 370]].forEach(([a, y]) => { g.beginPath(); g.moveTo(a, y); g.lineTo(620, y); g.stroke(); });
    // مسطاح التمر: حصير سعف وتمر يجفّ
    D.MATS.forEach(([x, y, w2, h2], k) => { g.fillStyle = '#D9B86C'; g.fillRect(x, y, w2, h2); g.strokeStyle = 'rgba(120,80,30,.35)'; g.lineWidth = 1; for (let xx = x + 6; xx < x + w2; xx += 8) { g.beginPath(); g.moveTo(xx, y); g.lineTo(xx, y + h2); g.stroke(); }
      for (let i = 0; i < 90; i++) { const px = x + 8 + ((i * 37 + k * 11) % (w2 - 16)), py = y + 6 + ((i * 23) % (h2 - 12)); g.fillStyle = i % 3 ? '#7C2D12' : '#A16207'; g.beginPath(); g.ellipse(px, py, 3.4, 2.2, i, 0, 7); g.fill(); } });
    // ساحة المطبخ: بلاط حجري، وحديقة الورد بتربة رطبة
    g.fillStyle = '#DCCBB0'; g.fillRect(680, 440, 760, 220); g.fillStyle = pattern(g, 'pavers'); g.globalAlpha = .55; g.fillRect(680, 440, 760, 220); g.globalAlpha = 1;
    g.fillStyle = '#9C7A55'; g.fillRect(1560, TOP + 60, 760, 330); g.fillStyle = pattern(g, 'soilWet'); g.globalAlpha = .6; g.fillRect(1560, TOP + 60, 760, 330); g.globalAlpha = 1;
    paintStreets(g, D.STREET, W, H);
    // ظلال
    D.HOMES.forEach(Hm => { Hm.parts.forEach(b => boxShadow(g, b.x, b.y, b.w, b.h, b.H || 96)); Hm.walls.forEach(q => boxShadow(g, q.x, q.y, q.w, q.h, 26)); });
    [D.MOSQUE, D.HOUSE, D.STILL, D.SHOP].forEach(b => boxShadow(g, b.x, b.y, b.w, b.h, b.H || 96));
    D.POTS.forEach(([x, y]) => blobShadow(g, x, y, 36, 40)); D.GROVE.forEach(([x, y]) => blobShadow(g, x, y, 14, 120));
  }
  const groundLive = () => {};
  const pot2 = (c, x, y, k, t) => {   // قدر نحاسي على موقد حجري بحطب ونار، ومجداف يدور، وبخار
    c.fillStyle = '#78716C'; c.beginPath(); c.ellipse(x, y, 42, 14, 0, 0, 7); c.fill();
    for (let i = 0; i < 5; i++) { const f = (Math.sin(t * 9 + i * 2 + k) + 1) / 2; c.fillStyle = i % 2 ? '#F97316' : '#FACC15'; c.beginPath(); c.moveTo(x - 26 + i * 13, y - 2); c.quadraticCurveTo(x - 22 + i * 13, y - 16 - f * 10, x - 18 + i * 13, y - 2); c.fill(); }
    const gr = c.createLinearGradient(x - 38, 0, x + 38, 0); gr.addColorStop(0, '#8A4F1F'); gr.addColorStop(.35, '#E0A060'); gr.addColorStop(1, '#7A4318');
    c.fillStyle = gr; c.beginPath(); c.moveTo(x - 38, y - 44); c.quadraticCurveTo(x - 42, y - 8, x, y - 6); c.quadraticCurveTo(x + 42, y - 8, x + 38, y - 44); c.closePath(); c.fill();
    c.fillStyle = '#5B2A0E'; c.beginPath(); c.ellipse(x, y - 44, 38, 11, 0, 0, 7); c.fill(); c.fillStyle = '#A8481E'; c.beginPath(); c.ellipse(x, y - 43, 33, 8, 0, 0, 7); c.fill();
    const a = t * 1.6 + k; c.strokeStyle = '#7C4A1E'; c.lineWidth = 4; c.beginPath(); c.moveTo(x + Math.cos(a) * 16, y - 44 + Math.sin(a) * 4); c.lineTo(x + Math.cos(a) * 22 + 10, y - 98); c.stroke();
    for (let i = 0; i < 4; i++) { const u = (t * .3 + i / 4 + k * .1) % 1; c.fillStyle = `rgba(255,255,255,${.45 * (1 - u)})`; c.beginPath(); c.arc(x - 12 + i * 8 + Math.sin(t + i) * 6, y - 56 - u * 80, 9 + u * 14, 0, 7); c.fill(); }
  };
  const jar2 = (c, x, y, s, col) => { c.fillStyle = 'rgba(226,232,240,.85)'; c.fillRect(x - s / 2, y - s * 1.3, s, s * 1.3); c.fillStyle = HALWA; c.fillRect(x - s / 2 + 2, y - s * 1.1, s - 4, s * 1.1 - 2); c.fillStyle = col; c.fillRect(x - s / 2 - 2, y - s * 1.3 - 5, s + 4, 6); };
  const items = t => {
    const out = [], Hh = D.HOUSE, S = D.STILL;
    out.push({ x: Hh.x + Hh.w / 2, y: Hh.y + Hh.h, draw: c => building3d(c, 'g8sweetHouse', { ...Hh, wall: '#F5E6C8', door: '#7C2D12', style: 'shop', sign: 'بيت الحلوى' }) });
    out.push({ x: S.x + S.w / 2, y: S.y + S.h, draw: c => building3d(c, 'g8still', { ...S, wall: '#FBCFE8', door: '#9D174D', style: 'shop', sign: 'مقطرة الورد' }) });
    out.push({ x: D.SHOP.x + D.SHOP.w / 2, y: D.SHOP.y + D.SHOP.h, draw: c => building3d(c, 'g8shop', { ...D.SHOP, wall: '#FDE68A', door: '#B45309', style: 'shop', sign: 'دكّان الحلوى' }) });
    D.POTS.forEach(([x, y], k) => out.push({ x, y, draw: c => upright(c, x, y, cc => pot2(cc, x, y, k, t)) }));
    // الحطب بجانب القدور
    out.push({ x: 1390, y: 500, draw: c => upright(c, 1390, 500, cc => { for (let k = 0; k < 6; k++) { cc.fillStyle = k % 2 ? '#7C4A1E' : '#92400E'; cc.fillRect(1360 + (k % 3) * 4, 500 - 10 - k * 8, 60, 9); cc.fillStyle = '#E7C9A0'; cc.beginPath(); cc.arc(1420 + (k % 3) * 4, 500 - 6 - k * 8, 4.5, 0, 7); cc.fill(); } }) });
    // نخيل البستان
    D.GROVE.forEach(([x, y, s]) => out.push({ x, y, draw: c => palmCached(c, x, y, s, false, t) }));
    // أحواض الورد: حافة حجرية وشجيرات بزهور وردية
    D.ROSES.forEach((b, j) => out.push({ x: b.x + b.w / 2, y: b.y + b.h, draw: c => { stoneBox(c, b.x, b.y, b.w, b.h, 12, '#D6C7AE', false); for (let x = b.x + 22; x < b.x + b.w - 10; x += 34) shrub(c, x, b.y + b.h - 6, 14 + ((x + j) % 3), j % 2 ? '#F472B6' : '#E11D48'); } }));
    // جرار التقطير الفخارية على النار وأنبوب نحاسي إلى قارورة الاستقبال
    D.JARS.forEach(([x, y], k) => out.push({ x, y, draw: c => upright(c, x, y, cc => { for (let i = 0; i < 3; i++) { cc.fillStyle = i % 2 ? '#F97316' : '#FACC15'; cc.beginPath(); cc.moveTo(x - 12 + i * 12, y); cc.quadraticCurveTo(x - 8 + i * 12, y - 14 - Math.sin(t * 8 + i) * 4, x - 4 + i * 12, y); cc.fill(); }
      cc.fillStyle = '#B45309'; cc.beginPath(); cc.ellipse(x, y - 30, 26, 24, 0, 0, 7); cc.fill(); cc.fillStyle = '#92400E'; cc.fillRect(x - 8, y - 62, 16, 12); cc.strokeStyle = COPPER; cc.lineWidth = 4; cc.beginPath(); cc.moveTo(x, y - 60); cc.quadraticCurveTo(x + 30, y - 78, x + 44, y - 30); cc.stroke();
      cc.fillStyle = 'rgba(244,114,182,.7)'; cc.fillRect(x + 36, y - 30, 16, 26); cc.strokeStyle = '#94A3B8'; cc.lineWidth = 2; cc.strokeRect(x + 36, y - 30, 16, 26);
      const u = (t * .6 + k * .5) % 1; cc.fillStyle = '#F472B6'; cc.beginPath(); cc.arc(x + 44, y - 32 + u * 6, 2, 0, 7); cc.fill(); }) }));
    // المناحل والنحل
    D.HIVES.forEach(([x, y], k) => out.push({ x, y, draw: c => upright(c, x, y, cc => { for (let j = 0; j < 3; j++) { cc.fillStyle = j % 2 ? '#F59E0B' : '#FBBF24'; cc.fillRect(x - 20, y - 12 - j * 14, 40, 14); cc.strokeStyle = 'rgba(120,53,15,.5)'; cc.lineWidth = 1; cc.strokeRect(x - 20, y - 12 - j * 14, 40, 14); }
      cc.fillStyle = '#78350F'; cc.fillRect(x - 24, y - 56, 48, 6); cc.fillStyle = '#1F2937'; cc.fillRect(x - 5, y - 8, 10, 4);
      for (let i = 0; i < 5; i++) { const a = t * (2 + i * .3) + i * 1.3 + k, bx = x + Math.cos(a) * (20 + i * 4), by = y - 40 + Math.sin(a * 1.4) * 14; cc.fillStyle = '#FACC15'; cc.beginPath(); cc.ellipse(bx, by, 3, 2, 0, 0, 7); cc.fill(); cc.fillStyle = '#111827'; cc.fillRect(bx - .5, by - 2, 1.5, 4); } }) }));
    // طاولة التعبئة وعلبها الملونة
    const Tb = D.TABLE; out.push({ x: Tb.x + Tb.w / 2, y: Tb.y + Tb.h, draw: c => upright(c, Tb.x + Tb.w / 2, Tb.y + Tb.h, cc => { cc.fillStyle = '#92400E'; cc.fillRect(Tb.x, Tb.y + 6, Tb.w, 10); cc.fillStyle = '#78350F'; [6, Tb.w - 12].forEach(o => cc.fillRect(Tb.x + o, Tb.y + 16, 6, 24));
      for (let k = 0; k < 6; k++) jar2(cc, Tb.x + 14 + k * 20, Tb.y + 6, 14, LIDS[k % 5]); }) });
    D.STALLS.forEach(([x, y, col]) => out.push({ x, y, draw: c => stall(c, x, y, col) }));
    const A = { building3d, stoneBox, sidrCached, palmCached, bench, upright, leanAt };
    D.HOMES.forEach((Hm, i) => out.push(...houseItems2D(Hm, A, 'g8sw' + i, t)));
    out.push(...streetItems2D(D.life, D.STREET, { upright, bench, signboard }, t));
    const M = D.MOSQUE, N = D.MINARET;
    out.push({ x: M.x + M.w / 2, y: M.y + M.h, draw: c => { building3d(c, 'g8swmosque', M); const { lx, ly } = leanAt(M.x + M.w / 2, M.y + M.h); c.save(); c.translate(lx * M.H, -M.H * (1 - ly)); minaret(c, 'g8swminaret', N.x, N.y, N.s, N.H); c.restore(); } });
    D.PALMS.forEach(([x, y, s]) => out.push({ x, y, draw: c => palmCached(c, x, y, s, false, t) }));
    D.LAMPS.forEach(([x, y]) => out.push({ x, y, draw: c => streetLamp(c, x, y, t, false) }));
    // نصب الدلّة العملاقة وفناجينها في جزيرة الدوّار
    const R = D.RING; out.push({ x: R.x, y: R.y + 20, draw: c => upright(c, R.x, R.y + 20, cc => dallah(cc, R.x, R.y + 20, 1)) });
    // قوس المطبخ فوق الشارع الكبير
    out.push({ x: R.x, y: YARD - 40, draw: c => upright(c, R.x, YARD - 40, cc => { cc.fillStyle = '#B45309'; cc.fillRect(R.x - 98, YARD - 170, 12, 130); cc.fillRect(R.x + 86, YARD - 170, 12, 130); cc.fillRect(R.x - 106, YARD - 178, 212, 14); signboard(cc, R.x, YARD - 142, '🍯 مطبخ الحلوى'); }) });
    return out;
  };
  const over = (c, t) => { D.HOMES.forEach(Hm => houseSmoke2D(Hm, c, t)); birds2D(c, D.life, D.STREET, t);
    bunting(c, elev(634, 1000, 110), elev(886, 1000, 110), 26, 11, ['#B45309', '#FFFFFF', '#DB2777', '#16A34A'], t); lanternString(c, elev(700, 660, 90), elev(1440, 660, 90), 24, 9, t); };
  function station(c, s, t, st) {
    const done = st && st.doneIds && st.doneIds[s.id];
    upright(c, s.x, s.y, cc => {
      if (s.kind === 'dish') { cc.fillStyle = '#92400E'; cc.fillRect(s.x - 36, s.y - 30, 72, 26); cc.fillStyle = COPPER; cc.beginPath(); cc.ellipse(s.x, s.y - 34, 30, 10, 0, 0, 7); cc.fill(); cc.fillStyle = HALWA; cc.beginPath(); cc.moveTo(s.x, s.y - 34); cc.ellipse(s.x, s.y - 34, 24, 7, 0, 0, Math.PI * 1.5); cc.fill(); }
      else if (s.kind === 'rose') { [-16, 0, 16].forEach((o, k) => { cc.fillStyle = ['#F472B6', '#FBCFE8', '#DB2777'][k]; cc.globalAlpha = .8; cc.fillRect(s.x + o - 6, s.y - 34, 12, 30); cc.globalAlpha = 1; cc.strokeStyle = '#94A3B8'; cc.lineWidth = 2; cc.strokeRect(s.x + o - 6, s.y - 34, 12, 30); }); }
      else if (s.kind === 'pot') { cc.fillStyle = '#FFFBEB'; cc.fillRect(s.x - 26, s.y - 60, 52, 40); cc.strokeStyle = '#D97706'; cc.lineWidth = 2; cc.strokeRect(s.x - 26, s.y - 60, 52, 40); cc.fillStyle = '#B45309'; for (let k = 0; k < 4; k++) cc.fillRect(s.x - 18, s.y - 52 + k * 8, k % 2 ? 26 : 36, 3); cc.fillStyle = '#78350F'; cc.fillRect(s.x - 3, s.y - 20, 6, 20); }
      else if (s.kind === 'jars') { for (let k = 0; k < 3; k++) jar2(cc, s.x - 20 + k * 20, s.y - 4, 15, LIDS[k]); }
      else if (s.kind === 'shop') { cc.fillStyle = '#7C2D12'; cc.fillRect(s.x - 34, s.y - 26, 68, 22); for (let k = 0; k < 3; k++) jar2(cc, s.x - 20 + k * 20, s.y - 26, 13, LIDS[k + 2]); }
      signboard(cc, s.x, s.y - 84, `${s.icon} ${s.label}`);
    });
    if (done) { c.fillStyle = '#16A34A'; c.beginPath(); c.arc(s.x + 60, s.y - 40, 15, 0, 7); c.fill(); c.fillStyle = '#fff'; c.font = '900 18px Cairo'; c.textAlign = 'center'; c.fillText('✓', s.x + 60, s.y - 34); }
  }
  return { ground, groundLive, items, over, station };
}

/* دلّة قهوة عُمانية عملاقة بفنجانين على قاعدة (نصب الدوّار) */
function dallah(c, x, y, s) {
  c.fillStyle = '#E7E5E4'; c.fillRect(x - 46 * s, y - 14 * s, 92 * s, 14 * s); c.fillStyle = '#D6D3D1'; c.fillRect(x - 46 * s, y - 14 * s, 92 * s, 4 * s);
  const gr = c.createLinearGradient(x - 30 * s, 0, x + 30 * s, 0); gr.addColorStop(0, '#A16207'); gr.addColorStop(.4, '#FDE68A'); gr.addColorStop(1, '#854D0E');
  c.fillStyle = gr; c.beginPath(); c.moveTo(x - 30 * s, y - 14 * s); c.quadraticCurveTo(x - 38 * s, y - 60 * s, x - 14 * s, y - 70 * s); c.lineTo(x - 10 * s, y - 100 * s); c.lineTo(x + 10 * s, y - 100 * s); c.lineTo(x + 14 * s, y - 70 * s); c.quadraticCurveTo(x + 38 * s, y - 60 * s, x + 30 * s, y - 14 * s); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(x - 10 * s, y - 100 * s); c.quadraticCurveTo(x, y - 124 * s, x + 10 * s, y - 100 * s); c.fill(); c.beginPath(); c.arc(x, y - 128 * s, 5 * s, 0, 7); c.fill();
  c.strokeStyle = '#A16207'; c.lineWidth = 6 * s; c.beginPath(); c.moveTo(x - 24 * s, y - 46 * s); c.quadraticCurveTo(x - 52 * s, y - 70 * s, x - 56 * s, y - 104 * s); c.stroke();   // المنقار
  c.beginPath(); c.moveTo(x + 22 * s, y - 30 * s); c.quadraticCurveTo(x + 46 * s, y - 60 * s, x + 12 * s, y - 92 * s); c.stroke();   // المقبض
  [[-58, '#F8FAFC'], [58, '#F8FAFC']].forEach(([o, col]) => { c.fillStyle = col; c.beginPath(); c.moveTo(x + o * s - 12 * s, y - 30 * s); c.lineTo(x + o * s + 12 * s, y - 30 * s); c.lineTo(x + o * s + 8 * s, y - 14 * s); c.lineTo(x + o * s - 8 * s, y - 14 * s); c.closePath(); c.fill(); c.fillStyle = '#B45309'; c.fillRect(x + o * s - 12 * s, y - 31 * s, 24 * s, 3 * s); });
}
