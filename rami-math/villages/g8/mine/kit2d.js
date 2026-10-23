// منجم الأعماق في العرض العادي (متساوي القياس): نفس عناصر kit3d.js مرسومة بالقماش، والضوء من أعلى اليسار.
// floor(ctx, خلية, sx, sy): (sx, sy) رأس معين البلاطة العلوي. wall(g, خلية, cx, by): مركز قاعدة البلاطة في صورة الجدار.
// prop/station(ctx, عنصر, x, y): موضعه على الأرض. lights(): ثقوب الضوء في ظلام المنجم، وglow(): توهج يُجمع فوق الظلام.

export function kit2d({ TW, TH, HZ }) {
  const rnd = (x, y, k = 0) => { const s = Math.sin(x * 127.1 + y * 311.7 + k * 74.7) * 43758.5453; return s - Math.floor(s); };
  const dia = (g, x, y, w = TW, h = TH) => { g.beginPath(); g.moveTo(x, y); g.lineTo(x + w / 2, y + h / 2); g.lineTo(x, y + h); g.lineTo(x - w / 2, y + h / 2); g.closePath(); };
  const mix = (a, b, k) => { const p = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16)), A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(',')})`; };
  const isoBox = (g, x, y, w, d, h, top, left, right) => {   // صندوق صغير قاعدته معين w×d (بالبكسل) وارتفاعه h
    const a = { x, y: y - d / 2 }, b = { x: x + w / 2, y }, c = { x, y: y + d / 2 }, e = { x: x - w / 2, y };
    g.fillStyle = left; g.beginPath(); g.moveTo(e.x, e.y); g.lineTo(c.x, c.y); g.lineTo(c.x, c.y - h); g.lineTo(e.x, e.y - h); g.fill();
    g.fillStyle = right; g.beginPath(); g.moveTo(c.x, c.y); g.lineTo(b.x, b.y); g.lineTo(b.x, b.y - h); g.lineTo(c.x, c.y - h); g.fill();
    g.fillStyle = top; g.beginPath(); g.moveTo(a.x, a.y - h); g.lineTo(b.x, b.y - h); g.lineTo(c.x, c.y - h); g.lineTo(e.x, e.y - h); g.fill();
  };
  const glowDot = (g, x, y, r, c, a = 1) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, c); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.globalAlpha = a; g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); g.globalAlpha = 1; };
  const crystal = (g, x, y, c, s, t) => {
    [[0, 0, 30, 0], [10, 3, 20, .35], [-9, 2, 17, -.3], [4, 6, 13, .15]].forEach(([dx, dy, h, tilt]) => {
      const bx = x + dx * s, by = y + dy * s, hh = h * s, w = 6 * s, tx = bx + tilt * hh * .6;
      g.fillStyle = mix(c, '#FFFFFF', .35); g.beginPath(); g.moveTo(bx - w, by); g.lineTo(tx, by - hh); g.lineTo(bx, by + 2); g.fill();
      g.fillStyle = mix(c, '#000000', .25); g.beginPath(); g.moveTo(bx, by + 2); g.lineTo(tx, by - hh); g.lineTo(bx + w, by); g.fill();
    });
  };
  return {
    floor(g, c, sx, sy) {
      const k = rnd(c.x, c.y);
      if (c.floor === 'chasm') {   // هوّة: ظلام بحافة وتوهج أزرق عميق
        dia(g, sx, sy); g.fillStyle = '#05060B'; g.fill();
        const gr = g.createRadialGradient(sx, sy + TH / 2, 2, sx, sy + TH / 2, TW * .6); gr.addColorStop(0, 'rgba(42,108,255,.55)'); gr.addColorStop(1, 'rgba(42,108,255,0)'); g.fillStyle = gr; dia(g, sx, sy); g.fill();
        return;
      }
      if (c.floor === 'planks') {
        dia(g, sx, sy); g.fillStyle = mix('#7B5232', '#A0703F', k); g.fill();
        g.save(); dia(g, sx, sy); g.clip(); g.strokeStyle = 'rgba(40,22,10,.55)'; g.lineWidth = 1.2;
        for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(sx - TW / 2 + i * TW / 8, sy + TH / 2 - i * TH / 8); g.lineTo(sx + i * TW / 8, sy + TH - i * TH / 8); g.stroke(); }
        g.restore(); return;
      }
      dia(g, sx, sy); g.fillStyle = mix('#5E564D', '#7A7064', k); g.fill();
      g.fillStyle = 'rgba(0,0,0,.18)'; for (let i = 0; i < 4; i++) { const px = sx + (rnd(c.x, c.y, i) - .5) * TW * .6, py = sy + TH / 2 + (rnd(c.x, c.y, i + 9) - .5) * TH * .5; g.beginPath(); g.ellipse(px, py, 3, 1.5, 0, 0, 7); g.fill(); }
      if (c.floor === 'rail') {   // عوارض وقضيبان على امتداد النفق
        const ew = c.railX ?? true;
        g.save(); dia(g, sx, sy); g.clip();
        const cx = sx, cy = sy + TH / 2, ux = ew ? TW / 2 : -TW / 2, uy = TH / 2;   // اتجاه النفق على الشاشة
        g.strokeStyle = '#5A3A22'; g.lineWidth = 5;
        for (let i = -1; i <= 1; i++) { const ox = cx + ux * i * .33, oy = cy + uy * i * .33; g.beginPath(); g.moveTo(ox - uy * .55 * (ew ? -1 : 1), oy - ux * .275 * (ew ? -1 : 1)); g.lineTo(ox + uy * .55 * (ew ? -1 : 1), oy + ux * .275 * (ew ? -1 : 1)); g.stroke(); }
        g.strokeStyle = '#A9ADB5'; g.lineWidth = 2;
        for (const o of [-.22, .22]) { const px = -uy * o * (ew ? -1 : 1) * 1.6, py = ux * o * .5 * (ew ? -1 : 1) * 1.6; g.beginPath(); g.moveTo(cx - ux + px, cy - uy + py); g.lineTo(cx + ux + px, cy + uy + py); g.stroke(); }
        g.restore();
      }
    },
    init(grid) {   // قبل الرسم: اتجاه السكة من جيرانها
      grid.cells.forEach(c => { if (c.floor === 'rail') c.railX = grid.at(c.x + 1, c.y)?.floor === 'rail' || grid.at(c.x - 1, c.y)?.floor === 'rail'; });
    },
    wall(g, c, cx, by) {
      const h = (c.h || 1) * HZ + (rnd(c.x, c.y) - .5) * 8, k = rnd(c.x, c.y, 2);
      const top = by - TH / 2 - h;
      // الوجه الأيسر (مضاء) والأيمن (ظل) والسطح
      g.fillStyle = mix('#6E6358', '#857868', k); g.beginPath(); g.moveTo(cx - TW / 2, by); g.lineTo(cx, by + TH / 2); g.lineTo(cx, by + TH / 2 - h); g.lineTo(cx - TW / 2, by - h); g.fill();
      g.fillStyle = mix('#3E3630', '#4E443C', k); g.beginPath(); g.moveTo(cx, by + TH / 2); g.lineTo(cx + TW / 2, by); g.lineTo(cx + TW / 2, by - h); g.lineTo(cx, by + TH / 2 - h); g.fill();
      dia(g, cx, top); g.fillStyle = mix('#211D19', '#2C2621', k); g.fill();
      // شقوق وطبقات صخرية على الوجهين
      g.strokeStyle = 'rgba(0,0,0,.28)'; g.lineWidth = 1;
      for (let i = 0; i < 3; i++) { const y = by - h * (.25 + i * .25); g.beginPath(); g.moveTo(cx - TW / 2, y + (rnd(c.x, i) - .5) * 4); g.lineTo(cx, y + TH / 2 + (rnd(c.y, i) - .5) * 4); g.lineTo(cx + TW / 2, y + (rnd(c.x + c.y, i) - .5) * 4); g.stroke(); }
      g.strokeStyle = 'rgba(255,240,220,.12)'; g.beginPath(); g.moveTo(cx - TW / 2, by - h); g.lineTo(cx, top + TH); g.stroke();
    },
    prop(g, p, x, y, t) {
      if (p.kind === 'lamp') {
        g.fillStyle = '#5A3A22'; g.fillRect(x - 2, y - 60, 4, 60); g.fillRect(x - 2, y - 60, 16, 4);
        g.fillStyle = '#3A3A40'; g.fillRect(x + 9, y - 58, 9, 4);
        glowDot(g, x + 13, y - 50, 12, '#FFE3A0'); g.fillStyle = '#FFD27A'; g.beginPath(); g.arc(x + 13, y - 50, 4, 0, 7); g.fill();
      } else if (p.kind === 'beam') {
        const ax = p.axis === 'x', dx = ax ? TW / 2 : TW / 2, dy = ax ? TH / 2 : -TH / 2;
        g.fillStyle = '#6A4428';
        const L = { x: x - (ax ? TW / 2 : TW / 2) * (ax ? 1 : 1), y: y - (ax ? TH / 2 : -TH / 2) }, R = { x: x + dx, y: y + dy };
        g.fillRect(L.x - 3, L.y - 62, 6, 62); g.fillRect(R.x - 3, R.y - 62, 6, 62);
        g.strokeStyle = '#7A5030'; g.lineWidth = 8; g.beginPath(); g.moveTo(L.x - 3, L.y - 62); g.lineTo(R.x + 3, R.y - 62); g.stroke();
      } else if (p.kind === 'cart') {
        isoBox(g, x, y - 4, 30, 18, 16, '#5C4033', '#8C8F96', '#5F6168');
        g.fillStyle = p.ore; g.beginPath(); g.ellipse(x, y - 22, 12, 6, 0, 0, 7); g.fill();
        g.fillStyle = '#222'; [[-10, 2], [10, 2], [-4, 6], [14, -2]].forEach(([a, b]) => { g.beginPath(); g.arc(x + a, y + b - 2, 3, 0, 7); g.fill(); });
      } else if (p.kind === 'crystal') {
        crystal(g, x, y, p.c, p.s || 1, t);
      } else if (p.kind === 'barrel') {
        g.fillStyle = '#6A4428'; g.fillRect(x - 9, y - 22, 18, 20); g.beginPath(); g.ellipse(x, y - 2, 9, 4, 0, 0, 7); g.fill();
        g.fillStyle = '#8B5E34'; g.beginPath(); g.ellipse(x, y - 22, 9, 4, 0, 0, 7); g.fill(); g.fillStyle = '#5F6168'; g.fillRect(x - 9, y - 18, 18, 2); g.fillRect(x - 9, y - 8, 18, 2);
      } else if (p.kind === 'ore') {
        for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? p.c : '#4A403A'; g.beginPath(); g.ellipse(x + (rnd(p.x, i) - .5) * 26, y - 4 - (i > 3 ? 7 : 0) + (rnd(p.y, i) - .5) * 8, 7, 5, 0, 0, 7); g.fill(); }
      }
    },
    station(g, s, x, y, t, st) {
      const done = st && st.doneIds && st.doneIds[s.id];
      if (s.kind === 'elevator') {   // قفص المصعد بأعمدته وبكرته ولوحة الطوابق
        g.strokeStyle = '#8C8F96'; g.lineWidth = 3;
        for (const [a, b] of [[-22, 0], [22, 0], [0, -12], [0, 12]]) { g.beginPath(); g.moveTo(x + a, y + b); g.lineTo(x + a, y + b - 104); g.stroke(); }
        g.fillStyle = '#7B5232'; g.beginPath(); g.moveTo(x - 22, y); g.lineTo(x, y - 12); g.lineTo(x + 22, y); g.lineTo(x, y + 12); g.fill();
        g.fillStyle = '#B88A2E'; g.beginPath(); g.arc(x, y - 112, 8, 0, 7); g.fill(); g.strokeStyle = '#2B2118'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y - 104); g.lineTo(x, y - 20); g.stroke();
        g.fillStyle = '#2B2118'; g.fillRect(x + 24, y - 64, 22, 26); g.fillStyle = '#FF9F43'; g.fillRect(x + 27, y - 61, 16, 20);
      } else if (s.kind === 'crystals') {
        isoBox(g, x, y, 64, 30, 14, '#3A322C', '#6E6358', '#3E3630');
        [[-20, '#5FD3FF', 9], [0, '#B28CFF', 13], [20, '#7CF5C8', 17]].forEach(([dx, c, sz]) => isoBox(g, x + dx, y - 14 - (dx === 0 ? 2 : 0), sz * 1.5, sz * .75, sz, mix(c, '#FFFFFF', .3), c, mix(c, '#000000', .3)));
      } else if (s.kind === 'doubler') {
        g.fillStyle = '#4E463E'; g.beginPath(); g.ellipse(x, y, 30, 15, 0, 0, 7); g.fill(); g.fillStyle = '#7A7064'; g.beginPath(); g.ellipse(x, y - 6, 30, 15, 0, 0, 7); g.fill();
        g.strokeStyle = '#D4A537'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y - 6, 27, 13, 0, 0, 7); g.stroke();
        const cy = y - 46 + Math.sin(t * 2) * 4, w = 9 * (.7 + .3 * Math.cos(t * 1.2));
        g.fillStyle = '#FFB347'; g.beginPath(); g.moveTo(x, cy - 14); g.lineTo(x + w, cy); g.lineTo(x, cy + 14); g.lineTo(x - w, cy); g.fill();
      } else if (s.kind === 'gate') {
        isoBox(g, x - 30, y + 15, 22, 22, 110, '#2C2621', '#6E6358', '#3E3630'); isoBox(g, x + 30, y - 15, 22, 22, 110, '#2C2621', '#6E6358', '#3E3630');
        g.fillStyle = '#3E3A36'; g.beginPath(); g.moveTo(x - 22, y + 11); g.lineTo(x + 22, y - 11); g.lineTo(x + 22, y - 111); g.lineTo(x - 22, y - 89); g.fill();
        g.fillStyle = '#4E443C'; g.beginPath(); g.moveTo(x - 42, y - 85); g.lineTo(x + 42, y - 127); g.lineTo(x + 42, y - 112); g.lineTo(x - 42, y - 70); g.fill();
        [[-9, -70], [9, -79], [-9, -40], [9, -49]].forEach(([a, b]) => { g.fillStyle = '#FFC94A'; g.beginPath(); g.ellipse(x + a, y + b, 6, 7, -.45, 0, 7); g.fill(); });
      }
      if (done) { g.fillStyle = '#16A34A'; g.beginPath(); g.arc(x, y - 130, 11, 0, 7); g.fill(); g.fillStyle = '#fff'; g.font = '900 14px Cairo'; g.textAlign = 'center'; g.fillText('✓', x, y - 125); }
    },
    lights(def) {
      const L = [];
      (def.props || []).forEach(p => { if (p.kind === 'lamp') L.push({ x: p.x, y: p.y, r: 170, a: .95 }); if (p.kind === 'crystal') L.push({ x: p.x, y: p.y, r: 120, a: .7 }); });
      (def.stations || []).forEach(s => L.push({ x: s.x, y: s.y, r: 130, a: .75 }));
      return L;
    },
    glow(g, def, t, st, iso) {
      (def.props || []).forEach(p => {
        const q = iso(p.x, p.y);
        if (p.kind === 'lamp') glowDot(g, q.x + 13, q.y - 50, 46, 'rgba(255,170,80,.55)', .9 + .1 * Math.sin(t * 9 + p.x));
        if (p.kind === 'crystal') glowDot(g, q.x, q.y - 16, 44, p.c + '88', .7 + .2 * Math.sin(t * 1.7 + p.x * 3));
      });
    }
  };
}
