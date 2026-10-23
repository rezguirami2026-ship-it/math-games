// بيوت القرى الحديثة الملوّنة (الصفان ٨ و٩): من مواصفة قصيرة يبني البيت بأحد أربعة أشكال وحياته حوله، ويرسمه في العرضين.
// الأشكال: villa (بيت بطابقين وحديقة أمامية بسور منخفض وبوابة)، L (جسم وجناح بارز وركن جلوس)، step (طابق علوي متراجع)،
// court (بيت خلفي وفناء بسورين وبوابة ونخلة). والحياة: أشجار، أصص زهور، مظلة مخططة فوق الباب، مقعد، دخان من المطبخ.
// spec = { x, y, w, h, kind, wall, door, seed } — x, y ركن الأرض الأيسر العلوي بوحدات العالم المفتوح.
export const WALLS = ['#F6D5C3', '#D7EBDD', '#D6E6F5', '#FBE6B0', '#EBD9F2', '#F8EFE2', '#FAD9D9', '#DDEFE9'];
export const TRIMS = ['#2F6FB2', '#C2410C', '#0F766E', '#7C3AED', '#B45309', '#BE185D'];

export function composeHouse(s) {
  const r = k => { const v = Math.sin((s.seed || s.x * 7 + s.y) * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); };
  const wall = s.wall || WALLS[Math.floor(r(1) * WALLS.length)], trim = s.door || TRIMS[Math.floor(r(2) * TRIMS.length)];
  const base = { wall, door: trim, mud: false, ac: r(3) > .4 ? 1 : 0, tank: r(4) > .3 ? 1 : 0, dish: r(5) > .7 ? 1 : 0 };
  const out = { parts: [], uppers: [], walls: [], gates: [], balconies: [], trees: [], pots: [], awnings: [], benches: [], smoke: [], solids: [] };
  const { x, y, w, h } = s, front = y + h;
  const pot = (px, py) => out.pots.push({ x: px, y: py, col: ['#E11D48', '#F59E0B', '#A855F7', '#F97316'][Math.floor(r(px) * 4)] });
  if (s.kind === 'villa') {   // بيت بطابقين، وحديقة أمامية عمقها ٧٠ يحيطها سور منخفض بفتحة بوابة في الوسط
    out.parts.push({ ...base, x, y, w, h, H: 150 });
    const gy = front + 70, gap = 46;
    out.walls.push({ x: x - 6, y: front, w: 10, h: 70 }, { x: x + w - 4, y: front, w: 10, h: 70 }, { x: x - 6, y: gy - 10, w: w / 2 - gap / 2 + 6, h: 10 }, { x: x + w / 2 + gap / 2, y: gy - 10, w: w / 2 - gap / 2 + 4, h: 10 });
    out.gates.push({ x: x + w / 2, y: gy - 5, gap, col: trim }); out.balconies.push({ x: x + w / 2, y: front, w: Math.min(110, w * .55), H: 150, col: trim });
    out.trees.push({ x: x + 26, y: gy - 22, kind: r(6) > .5 ? 'sidr' : 'palm', s: .8 });
    pot(x + w / 2 - 34, front + 14); pot(x + w / 2 + 34, front + 14); pot(x + w - 24, gy - 18);
    out.awnings.push({ x: x + w / 2, y: front, w: 64, col: trim });
  } else if (s.kind === 'L') {   // جسم رئيسي وجناح بارز جنوباً على اليمين، وفي الركن مقعد وشجرة
    const mw = Math.round(w * .62), ww = w - mw, wh = Math.round(h * 1.35);
    out.parts.push({ ...base, x, y, w: mw, h, H: 104 }, { ...base, wall: s.wall2 || WALLS[(WALLS.indexOf(wall) + 3) % WALLS.length], x: x + mw, y, w: ww, h: wh, H: 120, ac: 0, tank: 0 });
    out.benches.push({ x: x + mw - 40, y: front + 34 }); out.trees.push({ x: x + 30, y: front + 40, kind: 'sidr', s: .75 });
    pot(x + mw - 10, front + 10); pot(x + mw - 70, front + 10);
    out.awnings.push({ x: x + mw / 2, y: front, w: 58, col: trim });
  } else if (s.kind === 'step') {   // طابق أرضي كامل، وفوقه طابق متراجع إلى الخلف على اليسار، وعلى السطح الأمامي جلسة
    out.parts.push({ ...base, x, y, w, h, H: 92, tank: 0 });
    out.uppers.push({ ...base, wall: WALLS[(WALLS.indexOf(wall) + 2) % WALLS.length], x: x + 8, y: y + 6, w: Math.round(w * .55), h: Math.round(h * .55), H: 70, baseH: 92, ac: 1 });
    out.balconies.push({ x: x + w * .62, y: front, w: w * .5, H: 92, col: trim, roof: true });   // درابزين جلسة السطح الأمامي
    pot(x + 20, front + 12); pot(x + w - 20, front + 12); out.trees.push({ x: x + w + 34, y: front - 6, kind: 'palm', s: .85 });
    out.awnings.push({ x: x + w / 2, y: front, w: 60, col: trim });
  } else {   // court: بيت في الخلف، وفناء أمامه بسورين جانبيين وسور أمامي ببوابة، ونخلة في الفناء
    const hh = Math.round(h * .55), cy = y + hh;
    out.parts.push({ ...base, x, y, w, h: hh, H: 110 });
    out.walls.push({ x: x - 4, y: cy, w: 10, h: h - hh + 10 }, { x: x + w - 6, y: cy, w: 10, h: h - hh + 10 }, { x: x - 4, y: front, w: w / 2 - 26, h: 10 }, { x: x + w / 2 + 22, y: front, w: w / 2 - 18, h: 10 });
    out.gates.push({ x: x + w / 2 - 2, y: front + 5, gap: 44, col: trim });
    out.trees.push({ x: x + w * .72, y: cy + (h - hh) * .6, kind: 'palm', s: .8 }); out.benches.push({ x: x + w * .3, y: cy + (h - hh) * .55 });
    pot(x + w / 2 - 30, cy + 12); pot(x + w / 2 + 30, cy + 12);
  }
  if (r(7) > .35) { const p = out.parts[0]; out.smoke.push({ x: p.x + p.w * .78, y: p.y + 14, h: (p.H || 96) * 1.0 + 8 }); }
  out.parts.forEach(p => out.solids.push({ x: p.x, y: p.y, w: p.w, h: p.h }));
  out.walls.forEach(q => out.solids.push({ x: q.x, y: q.y, w: q.w, h: q.h }));
  return out;
}

/* ── العرض العادي: عناصر قائمة مرتبة بالعمق (y أسفل الأرضية) ── */
export function houseItems2D(H, A, key, t) {
  const { building3d, stoneBox, sidrCached, palmCached, bench, upright, leanAt } = A, out = [];
  H.parts.forEach((p, i) => out.push({ x: p.x + p.w / 2, y: p.y + p.h, draw: c => building3d(c, key + 'p' + i, p) }));
  H.uppers.forEach((u, i) => { const host = H.parts[0]; out.push({ x: u.x + u.w / 2, y: host.y + host.h + .5, draw: c => { const { lx, ly } = leanAt(host.x + host.w / 2, host.y + host.h); c.save(); c.translate(lx * u.baseH, -u.baseH * (1 - ly)); building3d(c, key + 'u' + i, u); c.restore(); } }); });
  H.walls.forEach(q => out.push({ x: q.x + q.w / 2, y: q.y + q.h, draw: c => stoneBox(c, q.x, q.y, q.w, q.h, 26, H.parts[0].wall, false) }));
  H.gates.forEach(gt => out.push({ x: gt.x, y: gt.y + 6, draw: c => upright(c, gt.x, gt.y + 6, cc => {   // عمودان أبيضان بتاجين وفانوسين، ومصراعان ملوّنان مفتوحان
    [-1, 1].forEach(sd => { const px = gt.x + sd * (gt.gap / 2 + 7); cc.fillStyle = '#FFFFFF'; cc.fillRect(px - 7, gt.y - 48, 14, 54); cc.strokeStyle = 'rgba(0,0,0,.25)'; cc.strokeRect(px - 7, gt.y - 48, 14, 54);
      cc.fillStyle = gt.col; cc.fillRect(px - 9, gt.y - 54, 18, 7); cc.fillStyle = '#FFD27A'; cc.beginPath(); cc.arc(px, gt.y - 62, 5, 0, 7); cc.fill(); cc.strokeStyle = '#7A4A2A'; cc.lineWidth = 1.5; cc.stroke();
      cc.fillStyle = gt.col; cc.beginPath(); cc.moveTo(px - sd * 7, gt.y - 2); cc.lineTo(px - sd * 7 - sd * 16, gt.y + 6); cc.lineTo(px - sd * 7 - sd * 16, gt.y - 30); cc.lineTo(px - sd * 7, gt.y - 38); cc.closePath(); cc.fill(); }); }) }));
  H.balconies.forEach(bl => out.push({ x: bl.x, y: bl.y + .4, draw: c => upright(c, bl.x, bl.y, cc => {   // شرفة بدرابزين أبيض وقوائم ملوّنة على واجهة الطابق العلوي
    const y0 = bl.y - (bl.roof ? bl.H + 4 : bl.H * .62), x0 = bl.x - bl.w / 2;
    if (!bl.roof) { cc.fillStyle = 'rgba(255,255,255,.95)'; cc.fillRect(x0 - 4, y0 + 18, bl.w + 8, 6); }
    cc.strokeStyle = '#FFFFFF'; cc.lineWidth = 3; cc.beginPath(); cc.moveTo(x0, y0); cc.lineTo(x0 + bl.w, y0); cc.stroke();
    cc.strokeStyle = bl.col; cc.lineWidth = 2; for (let k = 0; k <= bl.w; k += 9) { cc.beginPath(); cc.moveTo(x0 + k, y0); cc.lineTo(x0 + k, y0 + 18); cc.stroke(); } }) }));
  H.trees.forEach(tr => out.push({ x: tr.x, y: tr.y, draw: c => tr.kind === 'sidr' ? sidrCached(c, tr.x, tr.y, tr.s, t) : palmCached(c, tr.x, tr.y, tr.s, false, t) }));
  H.benches.forEach(b => out.push({ x: b.x, y: b.y, draw: c => bench(c, b.x, b.y) }));
  H.pots.forEach(p => out.push({ x: p.x, y: p.y, draw: c => upright(c, p.x, p.y, cc => {   // أصيص فخاري وشجيرة مزهرة
    cc.fillStyle = 'rgba(70,42,20,.22)'; cc.beginPath(); cc.ellipse(p.x, p.y + 2, 10, 4, 0, 0, 7); cc.fill();
    cc.fillStyle = '#C2703D'; cc.beginPath(); cc.moveTo(p.x - 8, p.y - 14); cc.lineTo(p.x + 8, p.y - 14); cc.lineTo(p.x + 6, p.y); cc.lineTo(p.x - 6, p.y); cc.closePath(); cc.fill();
    cc.fillStyle = '#3F8A3A'; cc.beginPath(); cc.arc(p.x, p.y - 20, 10, 0, 7); cc.fill(); cc.fillStyle = p.col; [[-5, -24], [4, -26], [0, -18], [6, -19], [-6, -17]].forEach(([a, b]) => { cc.beginPath(); cc.arc(p.x + a, p.y + b, 2.6, 0, 7); cc.fill(); }); }) }));
  H.awnings.forEach(a => out.push({ x: a.x, y: a.y + .6, draw: c => upright(c, a.x, a.y, cc => {   // مظلة قماشية مخططة فوق الباب
    const y0 = a.y - 74, n = 6, sw = a.w / n;
    for (let k = 0; k < n; k++) { cc.fillStyle = k % 2 ? '#FFFFFF' : a.col; cc.beginPath(); cc.moveTo(a.x - a.w / 2 + k * sw, y0); cc.lineTo(a.x - a.w / 2 + (k + 1) * sw, y0); cc.lineTo(a.x - a.w / 2 + (k + 1) * sw + 3, y0 + 16); cc.lineTo(a.x - a.w / 2 + k * sw + 3, y0 + 16); cc.closePath(); cc.fill(); }
    cc.strokeStyle = 'rgba(0,0,0,.25)'; cc.lineWidth = 1; cc.strokeRect(a.x - a.w / 2, y0, a.w + 3, 16); }) }));
  return out;
}
/* دخان المطابخ: يُرسم فوق كل شيء */
export function houseSmoke2D(H, c, t) {
  H.smoke.forEach(s => { for (let k = 0; k < 5; k++) { const u = ((t * .35 + k / 5) % 1), x = s.x + Math.sin(t + k) * 6 + u * 14, y = s.y - s.h - u * 70; c.fillStyle = `rgba(245,245,245,${.5 * (1 - u)})`; c.beginPath(); c.arc(x, y, 6 + u * 12, 0, 7); c.fill(); } });
}

/* ── العرض المجسّم ── */
export function houseGroup3D(THREE, H, L) {
  const { omaniHouse, Parts, box, material, sidrTree, palms, bench, SCALE_H } = L, g = new THREE.Group(), ticks = [];
  H.parts.forEach(p => g.add(omaniHouse(p)));
  H.uppers.forEach(u => { const up = omaniHouse(u); up.position.y = u.baseH * SCALE_H; g.add(up); });
  const P = new Parts(), wallM = material('plaster', H.parts[0].wall), capM = material('plaster', '#FFFFFF');
  H.walls.forEach(q => { P.add(wallM, box(q.w, 34, q.h, q.x + q.w / 2, 17, q.y + q.h / 2)); P.add(capM, box(q.w + 3, 4, q.h + 3, q.x + q.w / 2, 36, q.y + q.h / 2)); });
  H.benches.forEach(b => bench(P, b.x, b.y));
  const whiteM = material('plaster', '#FFFFFF'), lamps = [];
  H.gates.forEach(gt => [-1, 1].forEach(sd => { const px = gt.x + sd * (gt.gap / 2 + 7);
    P.add(whiteM, box(14, 58, 14, px, 29, gt.y)); P.add(material('flat', gt.col), box(18, 7, 18, px, 61, gt.y));
    const leaf = box(16, 40, 3, 0, 0, 0); leaf.rotateY(sd * .9); leaf.translate(px - sd * 14, 22, gt.y + 8); P.add(material('flat', gt.col, { rough: .5 }), leaf);
    lamps.push([px, 72, gt.y]); }));
  H.balconies.forEach(bl => { const y0 = (bl.roof ? bl.H + 4 : bl.H * .62) * SCALE_H, z = bl.y + (bl.roof ? -4 : 6), x0 = bl.x - bl.w / 2;
    if (!bl.roof) P.add(whiteM, box(bl.w + 8, 5, 16, bl.x, y0, z - 4));
    P.add(whiteM, box(bl.w, 3, 3, bl.x, y0 + 20, z + 3)); for (let k = 0; k <= bl.w; k += 9) P.add(material('flat', bl.col), box(2, 20, 2, x0 + k, y0 + 10, z + 3)); });
  H.pots.forEach(p => { P.add(material('flat', '#C2703D', { rough: .8 }), new THREE.CylinderGeometry(8, 6, 14, 10).translate(p.x, 7, p.y)); P.add(material('flat', '#3F8A3A'), new THREE.SphereGeometry(10, 10, 8).translate(p.x, 22, p.y)); [[-5, 4], [4, -3], [0, 6]].forEach(([a, b]) => P.add(material('flat', p.col), new THREE.SphereGeometry(3, 6, 5).translate(p.x + a, 28, p.y + b))); });
  H.awnings.forEach(a => { const n = 6, sw = a.w / n; for (let k = 0; k < n; k++) { const s = box(sw, 2, 20, a.x - a.w / 2 + sw * (k + .5), 0, 0); s.rotateX(.42); s.translate(0, 104, a.y + 8); P.add(material('flat', k % 2 ? '#FFFFFF' : a.col, { rough: .7 }), s); } });
  g.add(P.build());
  lamps.forEach(([lx, ly, lz]) => { const m = new THREE.Mesh(new THREE.SphereGeometry(5, 10, 8), new THREE.MeshStandardMaterial({ color: '#FFD27A', emissive: '#FFB347', emissiveIntensity: 1.2 })); m.position.set(lx, ly, lz); g.add(m); });
  const pl = H.trees.filter(t => t.kind === 'palm'); if (pl.length) g.add(palms(pl.map(t => ({ x: t.x, y: t.y, s: t.s }))));
  H.trees.filter(t => t.kind === 'sidr').forEach(t => g.add(sidrTree(t.x, t.y, t.s)));
  H.smoke.forEach(s => { const puffs = []; for (let k = 0; k < 5; k++) { const m = new THREE.Mesh(new THREE.SphereGeometry(7, 8, 6), new THREE.MeshStandardMaterial({ color: '#F5F5F5', transparent: true, opacity: .5, depthWrite: false })); g.add(m); puffs.push(m); }
    ticks.push(t => puffs.forEach((m, k) => { const u = (t * .35 + k / 5) % 1; m.position.set(s.x + Math.sin(t + k) * 6 + u * 14, s.h * 1.38 + u * 80, s.y); m.scale.setScalar(1 + u * 1.8); m.material.opacity = .5 * (1 - u); })); });
  return { group: g, tick: t => ticks.forEach(f => f(t)) };
}
