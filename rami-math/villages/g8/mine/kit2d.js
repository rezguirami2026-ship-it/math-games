// منجم الأعماق في العرض العادي، بأدوات العالم المفتوح نفسها (world/art.js): بيوت عُمانية بجدار حقيقي، مسجد بقبة ومئذنة،
// أكشاك سوق، بئر، نخيل يتمايل، أعمدة إنارة، رايات فوق الشارع، وجبل بطبقات صخرية وأفواه كهوف وبوابة منحوتة، وساحة منجم بسكك وعربات.
// ground() يُرسم مرة في قطع (ويُستعمل نفسه أرضاً للعرض ثلاثي الأبعاد)، وitems() عناصر قائمة مرتبة بالعمق.
import { houseItems2D, houseSmoke2D } from '../../houses.js';
import { stoneBox, sidrCached, bench, pattern, sprite, building3d, minaret, leanAt, stall, stoneWell, palmCached, streetLamp, signboard, bunting, elev, upright, boxShadow, shade, INK } from '../../../world/art.js';

const rnd = (x, y, k = 0) => { const s = Math.sin(x * 127.1 + y * 311.7 + k * 74.7) * 43758.5453; return s - Math.floor(s); };
export function kit2d(D) {
  const { CLIFF, YARD } = D, W = D.size.w, H = D.size.h;
  // ── الأرض ──
  function ground(g, x0, y0, w, h) {
    g.fillStyle = '#E3C796'; g.fillRect(x0, y0, w, h); g.fillStyle = pattern(g, 'sand'); g.fillRect(x0, y0, w, h);
    // ساحة المنجم: تراب أغمق وحصى
    g.fillStyle = '#B99A72'; g.fillRect(0, CLIFF - 20, W, YARD - CLIFF + 20); g.fillStyle = pattern(g, 'soil'); g.globalAlpha = .7; g.fillRect(0, CLIFF - 20, W, YARD - CLIFF + 20); g.globalAlpha = 1;
    const fade = g.createLinearGradient(0, YARD - 40, 0, YARD + 40); fade.addColorStop(0, 'rgba(185,154,114,1)'); fade.addColorStop(1, 'rgba(185,154,114,0)'); g.fillStyle = fade; g.fillRect(0, YARD - 40, W, 80);
    for (let i = 0; i < 900; i++) { const x = rnd(i, 1) * W, y = CLIFF + rnd(i, 2) * (YARD - CLIFF); if (x < x0 - 10 || x > x0 + w + 10 || y < y0 - 10 || y > y0 + h + 10) continue; g.fillStyle = i % 3 ? 'rgba(90,70,50,.35)' : 'rgba(255,240,215,.4)'; g.beginPath(); g.ellipse(x, y, 2 + rnd(i, 3) * 3, 1.5 + rnd(i, 4) * 2, 0, 0, 7); g.fill(); }
    // الشارع الرئيسي من بوابة القرية إلى المنجم، والشارع العرضي في السوق، وساحة البئر المستديرة
    const paved = (x, y, w2, h2) => { g.fillStyle = '#CDB48C'; g.fillRect(x, y, w2, h2); g.fillStyle = pattern(g, 'pavers'); g.fillRect(x, y, w2, h2); g.strokeStyle = 'rgba(120,90,55,.35)'; g.lineWidth = 3; g.strokeRect(x, y, w2, h2); };
    paved(1040, YARD - 10, 220, H - YARD + 10); paved(980, 1180, 1000, 140);
    g.fillStyle = '#CDB48C'; g.beginPath(); g.arc(D.WELL.x, D.WELL.y - 10, 170, 0, 7); g.fill(); g.fillStyle = pattern(g, 'pavers'); g.fill(); g.strokeStyle = 'rgba(120,90,55,.4)'; g.lineWidth = 4; g.stroke();
    // حشائش تحت النخيل
    D.PALMS.forEach(([x, y]) => { g.fillStyle = 'rgba(92,140,60,.35)'; g.beginPath(); g.ellipse(x, y + 4, 40, 16, 0, 0, 7); g.fill(); });
    // السكك: عوارض خشبية وقضيبان
    D.RAILS.forEach(pts => { for (let k = 1; k < pts.length; k++) { const [ax, ay] = pts[k - 1], [bx, by] = pts[k], L = Math.hypot(bx - ax, by - ay), ux = (bx - ax) / L, uy = (by - ay) / L;
      g.strokeStyle = '#6A4428'; g.lineWidth = 6; for (let s = 0; s < L; s += 16) { const cx = ax + ux * s, cy = ay + uy * s; g.beginPath(); g.moveTo(cx - uy * 13, cy + ux * 13); g.lineTo(cx + uy * 13, cy - ux * 13); g.stroke(); }
      g.strokeStyle = '#8C9096'; g.lineWidth = 2.6; for (const o of [-8, 8]) { g.beginPath(); g.moveTo(ax - uy * o, ay + ux * o); g.lineTo(bx - uy * o, by + ux * o); g.stroke(); } } });
    // ظلال المباني على الأرض (العرض العادي؛ في المجسّم تأتي من الشمس)
    D.HOMES.forEach(Hm => { Hm.parts.forEach(b => boxShadow(g, b.x, b.y, b.w, b.h, b.H || 96)); Hm.walls.forEach(q => boxShadow(g, q.x, q.y, q.w, q.h, 26)); }); boxShadow(g, D.MOSQUE.x, D.MOSQUE.y, D.MOSQUE.w, D.MOSQUE.h, D.MOSQUE.H);
  }
  // ── الجبل: صورة واحدة محفوظة (طبقات صخرية، قمم مسننة، أفواه الكهوف، والبوابة الكبرى)
  function paintCliff(c) {
    const top = x => 40 + Math.sin(x * .006) * 30 + Math.sin(x * .021) * 18 - 80 * rnd(x, 1);   // خط القمم
    const gr = c.createLinearGradient(0, -120, 0, CLIFF); gr.addColorStop(0, '#C9A16E'); gr.addColorStop(.55, '#A9825A'); gr.addColorStop(1, '#8C6A48');
    c.beginPath(); c.moveTo(0, CLIFF); for (let x = 0; x <= W; x += 40) c.lineTo(x, top(x)); c.lineTo(W, CLIFF); c.closePath(); c.fillStyle = gr; c.fill();
    c.save(); c.clip();
    for (let k = 0; k < 9; k++) { const y = 80 + k * 40; c.strokeStyle = `rgba(90,60,35,${.18 + (k % 3) * .06})`; c.lineWidth = 2 + (k % 2); c.beginPath(); for (let x = 0; x <= W; x += 30) c.lineTo(x, y + Math.sin(x * .01 + k) * 8); c.stroke(); }
    for (let i = 0; i < 160; i++) { const x = rnd(i, 7) * W, y = 60 + rnd(i, 8) * (CLIFF - 80), r = 10 + rnd(i, 9) * 26; c.fillStyle = `rgba(${rnd(i, 3) > .5 ? '255,235,200' : '70,45,25'},${.12 + rnd(i, 4) * .12})`; c.beginPath(); c.moveTo(x - r, y); c.lineTo(x - r * .3, y - r * .7); c.lineTo(x + r * .6, y - r * .4); c.lineTo(x + r, y + r * .2); c.closePath(); c.fill(); }
    c.restore();
    c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); for (let x = 0; x <= W; x += 40) c.lineTo(x, top(x)); c.stroke();
    // قاعدة الجبل: صخور ساقطة
    for (let i = 0; i < 60; i++) { const x = rnd(i, 11) * W, r = 12 + rnd(i, 12) * 22, y = CLIFF - 4 + rnd(i, 13) * 10; c.fillStyle = shade('#9C7B58', -10 + rnd(i, 14) * 20); c.beginPath(); c.ellipse(x, y, r, r * .55, 0, Math.PI, 0); c.fill(); }
    // أفواه الكهوف: أقواس مظلمة بإطار خشبي وتوهج البلّور في الداخل
    D.CAVES.forEach(cv => {
      const x = cv.x, w = cv.w, hh = cv.id === 'gate' ? 210 : 160, y = CLIFF;
      c.fillStyle = '#2A1D14'; c.beginPath(); c.moveTo(x - w / 2, y); c.lineTo(x - w / 2, y - hh * .55); c.quadraticCurveTo(x, y - hh * 1.25, x + w / 2, y - hh * .55); c.lineTo(x + w / 2, y); c.closePath(); c.fill();
      if (cv.id !== 'gate') {
        const gl = c.createRadialGradient(x, y - 40, 4, x, y - 40, w * .6); gl.addColorStop(0, cv.id === 'crystal' ? 'rgba(95,211,255,.75)' : 'rgba(255,179,71,.75)'); gl.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = gl; c.fillRect(x - w, y - hh, w * 2, hh);
        c.strokeStyle = '#7A4A2A'; c.lineWidth = 9; c.beginPath(); c.moveTo(x - w / 2 + 6, y); c.lineTo(x - w / 2 + 6, y - hh * .62); c.lineTo(x + w / 2 - 6, y - hh * .62); c.lineTo(x + w / 2 - 6, y); c.stroke();
      } else {   // البوابة الكبرى: إطار حجري ومصراعان معدنيان بأربعة أقفال ذهبية
        c.fillStyle = '#7A6B5C'; c.fillRect(x - w / 2 - 22, y - hh * .98, 22, hh * .98); c.fillRect(x + w / 2, y - hh * .98, 22, hh * .98); c.fillRect(x - w / 2 - 30, y - hh - 6, w + 60, 26);
        c.fillStyle = '#4A443E'; c.fillRect(x - w / 2 + 4, y - hh * .9, w / 2 - 6, hh * .9); c.fillRect(x + 2, y - hh * .9, w / 2 - 6, hh * .9);
        c.strokeStyle = '#2B2724'; c.lineWidth = 3; for (let yy = y - hh * .8; yy < y; yy += 26) { c.beginPath(); c.moveTo(x - w / 2 + 4, yy); c.lineTo(x + w / 2 - 4, yy); c.stroke(); }
        [[-40, -130], [40, -130], [-40, -70], [40, -70]].forEach(([a, b]) => { c.fillStyle = '#FFC94A'; c.beginPath(); c.arc(x + a, y + b, 13, 0, 7); c.fill(); c.strokeStyle = '#A16207'; c.lineWidth = 3; c.stroke(); });
      }
    });
  }
  const cart = (c, x, y, ore) => { c.fillStyle = 'rgba(70,42,20,.25)'; c.beginPath(); c.ellipse(x, y + 4, 30, 9, 0, 0, 7); c.fill();
    c.fillStyle = '#5F6168'; c.beginPath(); c.moveTo(x - 28, y - 30); c.lineTo(x + 28, y - 30); c.lineTo(x + 22, y - 4); c.lineTo(x - 22, y - 4); c.closePath(); c.fill(); c.strokeStyle = INK; c.lineWidth = 1.2; c.stroke();
    c.fillStyle = ore; c.beginPath(); c.ellipse(x, y - 32, 24, 9, 0, Math.PI, 0); c.fill(); c.fillStyle = '#2B2B2F'; [-16, 16].forEach(o => { c.beginPath(); c.arc(x + o, y - 2, 6, 0, 7); c.fill(); }); };
  const orePile = (c, x, y, col) => { c.fillStyle = 'rgba(70,42,20,.22)'; c.beginPath(); c.ellipse(x, y + 4, 34, 11, 0, 0, 7); c.fill();
    for (let i = 0; i < 9; i++) { c.fillStyle = i % 3 ? shade(col, -10 + i * 3) : '#6E6256'; c.beginPath(); c.ellipse(x + (rnd(x, i) - .5) * 44, y - 6 - (i > 5 ? 14 : i > 2 ? 7 : 0) + (rnd(y, i) - .5) * 6, 10, 7, 0, 0, 7); c.fill(); } };
  // ── العناصر القائمة ──
  const items = (t) => {
    const out = [{ y: CLIFF, draw: c => sprite(c, 'g8mineCliff', 0, -180, W, CLIFF + 200, paintCliff) }];
    const A = { building3d, stoneBox, sidrCached, palmCached, bench, upright, leanAt };
    D.HOMES.forEach((Hm, i) => out.push(...houseItems2D(Hm, A, 'g8h' + i, t)));
    const M = D.MOSQUE, N = D.MINARET;   // المسجد بقبته (من نمطه)، والمئذنة على ركن سطحه منزاحة بارتفاعه كما في القرية الأصلية
    out.push({ x: M.x + M.w / 2, y: M.y + M.h, draw: c => { building3d(c, 'g8mosque', M); const { lx, ly } = leanAt(M.x + M.w / 2, M.y + M.h); c.save(); c.translate(lx * M.H, -M.H * (1 - ly)); minaret(c, 'g8minaret', N.x, N.y, N.s, N.H); c.restore(); } });
    D.STALLS.forEach(([x, y, col]) => out.push({ x, y, draw: c => stall(c, x, y, col) }));
    out.push({ x: D.WELL.x, y: D.WELL.y, draw: c => stoneWell(c, D.WELL.x, D.WELL.y, D.WELL.r, t) });
    D.PALMS.forEach(([x, y, s]) => out.push({ x, y, draw: c => palmCached(c, x, y, s, false, t) }));
    D.LAMPS.forEach(([x, y]) => out.push({ x, y, draw: c => streetLamp(c, x, y, t, false) }));
    D.CARTS.forEach(([x, y, col]) => out.push({ x, y, draw: c => upright(c, x, y, cc => cart(cc, x, y, col)) }));
    D.ORE.forEach(([x, y, col]) => out.push({ x, y, draw: c => orePile(c, x, y, col) }));
    // قوس مدخل المنجم فوق الشارع: قائمان ولافتة
    out.push({ x: 1150, y: YARD + 6, draw: c => upright(c, 1150, YARD + 6, cc => { cc.fillStyle = '#7A4A2A'; cc.fillRect(1052, YARD - 130, 12, 136); cc.fillRect(1236, YARD - 130, 12, 136); cc.fillRect(1044, YARD - 138, 212, 14); signboard(cc, 1150, YARD - 102, '⛏️ منجم الأعماق'); }) });
    return out;
  };
  // رايات ملوّنة فوق الشارع الرئيسي (تُرسم فوق كل شيء)
  const over = (c, t) => {
    D.HOMES.forEach(Hm => houseSmoke2D(Hm, c, t));
    bunting(c, elev(1065, 1010, 92), elev(1235, 1010, 92), 22, 9, ['#C2410C', '#FFC94A', '#0E7490', '#15803D'], t);
    bunting(c, elev(1065, 1470, 92), elev(1235, 1470, 92), 22, 9, ['#7C3AED', '#FFC94A', '#BE185D', '#0E7490'], t);
  };
  // ── المحطات ──
  function station(c, s, t, st) {
    const done = st && st.doneIds && st.doneIds[s.id];
    if (s.kind === 'elevator') upright(c, s.x, s.y, cc => {   // برج الرفع: هيكل خشبي مائل بدعامات، بكرة تدور، حبل، وقفص فوق البئر
      const x = s.x, y = s.y, Ht = 250;
      cc.fillStyle = '#2B2118'; cc.fillRect(x - 60, y - 55, 120, 50);
      cc.strokeStyle = '#7A4A2A'; cc.lineWidth = 9; cc.lineCap = 'round';
      [[-70, 0, -18, -Ht], [70, 0, 18, -Ht]].forEach(([a, b, c2, d]) => { cc.beginPath(); cc.moveTo(x + a, y + b); cc.lineTo(x + c2, y + d); cc.stroke(); });
      cc.lineWidth = 5; for (let k = 1; k < 5; k++) { const yy = y - Ht * k / 5, hw = 70 - 52 * k / 5; cc.beginPath(); cc.moveTo(x - hw, yy); cc.lineTo(x + hw, yy); cc.stroke(); if (k < 4) { cc.beginPath(); cc.moveTo(x - hw, yy); cc.lineTo(x + hw - 10, yy - Ht / 5); cc.stroke(); } }
      cc.lineCap = 'butt';
      cc.save(); cc.translate(x, y - Ht - 6); cc.rotate(t * 1.4); cc.strokeStyle = '#B88A2E'; cc.lineWidth = 6; cc.beginPath(); cc.arc(0, 0, 22, 0, 7); cc.stroke(); for (let k = 0; k < 4; k++) { cc.rotate(Math.PI / 4); cc.beginPath(); cc.moveTo(-22, 0); cc.lineTo(22, 0); cc.stroke(); } cc.restore();
      cc.strokeStyle = '#444'; cc.lineWidth = 2; cc.beginPath(); cc.moveTo(x, y - Ht - 6); cc.lineTo(x, y - 110); cc.stroke();
      cc.fillStyle = '#C9CED6'; cc.fillRect(x - 26, y - 110, 52, 58); cc.strokeStyle = '#4B5563'; cc.lineWidth = 3; cc.strokeRect(x - 26, y - 110, 52, 58);
      cc.lineWidth = 2; for (let k = -16; k <= 16; k += 8) { cc.beginPath(); cc.moveTo(x + k, y - 106); cc.lineTo(x + k, y - 56); cc.stroke(); }
      cc.fillStyle = '#FFC46B'; cc.beginPath(); cc.arc(x, y - 96, 4, 0, 7); cc.fill();
      signboard(cc, x + 92, y - 60, '🛗 مصعد المنجم');
    });
    else if (s.kind === 'crystals' || s.kind === 'doubler') upright(c, s.x, s.y, cc => {   // لافتة الكهف وبلّورات متوهجة عند فمه
      const col = s.kind === 'crystals' ? '#5FD3FF' : '#FFB347';
      [[-58, 1.1], [60, .9], [-30, .7]].forEach(([dx, k]) => { const x = s.x + dx, y = s.y + 10; cc.fillStyle = col; cc.globalAlpha = .85 + .15 * Math.sin(t * 2 + dx);
        [[0, 34], [9, 24], [-8, 20]].forEach(([o, hh]) => { cc.beginPath(); cc.moveTo(x + o - 6 * k, y); cc.lineTo(x + o, y - hh * k); cc.lineTo(x + o + 6 * k, y); cc.closePath(); cc.fill(); }); cc.globalAlpha = 1; });
      signboard(cc, s.x, s.y - 150, s.kind === 'crystals' ? '💎 كهف البلّور' : '✨ كهف التضاعف');
    });
    else if (s.kind === 'gate') upright(c, s.x, s.y, cc => signboard(cc, s.x, s.y - 236, '🚪 بوابة القوانين'));
    if (done) { c.fillStyle = '#16A34A'; c.beginPath(); c.arc(s.x + 70, s.y - 40, 15, 0, 7); c.fill(); c.fillStyle = '#fff'; c.font = '900 18px Cairo'; c.textAlign = 'center'; c.fillText('✓', s.x + 70, s.y - 34); }
  }
  return { ground, items, over, station };
}
