// شوارع القرى الحديثة وحياتها (الصفان ٨ و٩) في العرضين: طرق إسفلت بخطوط وأرصفة بحواف ملوّنة وممرات مشاة ودوّار،
// عشب وأحواض زهور، فلج يجري تعبره جسور، سيارات تسير وتقف للمشاة وشاحنة المنجم، أطفال يلعبون الكرة، دراجة، جلسة قهوة،
// نافورة، لافتات اتجاهات، صناديق بريد، قطط وطيور وماعز. L: مخطط الشوارع من ملف القرية (بوحدات العالم المفتوح).
import { pattern, shade } from '../world/art.js';

const rnd = (x, y, k = 0) => { const s = Math.sin(x * 127.1 + y * 311.7 + k * 74.7) * 43758.5453; return s - Math.floor(s); };
const CAR_COLS = ['#E11D48', '#2563EB', '#F8FAFC', '#16A34A', '#F59E0B', '#7C3AED', '#0EA5E9', '#1F2937'];

/* ── الأرض: عشب، شوارع، أرصفة، ممرات مشاة، دوّار، ملعب، فلج وجسوره ── */
export function paintStreets(g, L, W, H) {
  const { road, blvd, ring } = L;
  // العشب: أخضر بدرجات وخصل
  g.fillStyle = '#9CC46A'; g.fillRect(0, L.grassTop, W, H - L.grassTop);
  for (let i = 0; i < 2600; i++) { const x = rnd(i, 31) * W, y = L.grassTop + rnd(i, 32) * (H - L.grassTop); g.fillStyle = i % 3 ? 'rgba(70,120,40,.28)' : 'rgba(210,235,150,.35)'; g.fillRect(x, y, 2, 4 + rnd(i, 33) * 4); }
  const edge = g.createLinearGradient(0, L.grassTop - 30, 0, L.grassTop + 30); edge.addColorStop(0, 'rgba(156,196,106,0)'); edge.addColorStop(1, 'rgba(156,196,106,1)'); g.fillStyle = edge; g.fillRect(0, L.grassTop - 30, W, 60);
  // أحواض الزهور
  (L.beds || []).forEach(([x, y, w, h]) => { g.fillStyle = '#6B4A2E'; g.fillRect(x, y, w, h); g.strokeStyle = '#E7E5E4'; g.lineWidth = 4; g.strokeRect(x, y, w, h);
    for (let i = 0; i < w * h / 70; i++) { const fx = x + 5 + rnd(x + i, y, 1) * (w - 10), fy = y + 5 + rnd(x, y + i, 2) * (h - 10); g.fillStyle = '#3F8A3A'; g.beginPath(); g.arc(fx, fy, 4, 0, 7); g.fill(); g.fillStyle = ['#E11D48', '#F59E0B', '#A855F7', '#F472B6', '#FDE047'][i % 5]; g.beginPath(); g.arc(fx + 1, fy - 1, 2.2, 0, 7); g.fill(); } });
  // الملعب: عشب مخطط وخطوط بيضاء
  if (L.pitch) { const [x, y, w, h] = L.pitch; for (let k = 0; k < 8; k++) { g.fillStyle = k % 2 ? '#5FA83E' : '#6BB848'; g.fillRect(x + k * w / 8, y, w / 8, h); }
    g.strokeStyle = '#FFFFFF'; g.lineWidth = 3; g.strokeRect(x + 4, y + 4, w - 8, h - 8); g.beginPath(); g.moveTo(x + w / 2, y + 4); g.lineTo(x + w / 2, y + h - 4); g.stroke(); g.beginPath(); g.arc(x + w / 2, y + h / 2, 22, 0, 7); g.stroke(); }
  const side = (x, y, w, h) => { g.fillStyle = '#D6CFC4'; g.fillRect(x, y, w, h); g.fillStyle = pattern(g, 'pavers'); g.fillRect(x, y, w, h); };
  const curb = (x0, y0, x1, y1) => { const L2 = Math.hypot(x1 - x0, y1 - y0), n = Math.ceil(L2 / 14); for (let k = 0; k < n; k++) { const a = k / n, b = Math.min(1, (k + 1) / n); g.strokeStyle = k % 2 ? '#FFFFFF' : '#DC2626'; g.lineWidth = 4; g.beginPath(); g.moveTo(x0 + (x1 - x0) * a, y0 + (y1 - y0) * a); g.lineTo(x0 + (x1 - x0) * b, y0 + (y1 - y0) * b); g.stroke(); } };
  const asph = (x, y, w, h) => { g.fillStyle = '#4B5563'; g.fillRect(x, y, w, h); g.fillStyle = pattern(g, 'asphalt'); g.fillRect(x, y, w, h); };
  // الأرصفة ثم الإسفلت
  side(0, road.y0 - road.sw, W, road.y1 - road.y0 + road.sw * 2); side(blvd.x0 - blvd.sw, blvd.top, blvd.x1 - blvd.x0 + blvd.sw * 2, blvd.bottom - blvd.top);
  g.fillStyle = '#D6CFC4'; g.beginPath(); g.arc(ring.x, ring.y, ring.r + 16, 0, 7); g.fill();
  asph(0, road.y0, W, road.y1 - road.y0); asph(blvd.x0, blvd.top, blvd.x1 - blvd.x0, blvd.bottom - blvd.top);
  g.fillStyle = '#4B5563'; g.beginPath(); g.arc(ring.x, ring.y, ring.r, 0, 7); g.fill(); g.fillStyle = pattern(g, 'asphalt'); g.fill();
  // الحواف (بيضاء وحمراء)
  curb(0, road.y0, ring.x - ring.r, road.y0); curb(ring.x + ring.r, road.y0, W, road.y0); curb(0, road.y1, ring.x - ring.r, road.y1); curb(ring.x + ring.r, road.y1, W, road.y1);
  curb(blvd.x0, blvd.top, blvd.x0, ring.y - ring.r); curb(blvd.x1, blvd.top, blvd.x1, ring.y - ring.r); curb(blvd.x0, ring.y + ring.r, blvd.x0, blvd.bottom); curb(blvd.x1, ring.y + ring.r, blvd.x1, blvd.bottom);
  // خطوط الطريق المتقطعة
  g.strokeStyle = '#F8FAFC'; g.lineWidth = 3; g.setLineDash([22, 18]);
  [[0, ring.x - ring.r - 10], [ring.x + ring.r + 10, W]].forEach(([a, b]) => { g.beginPath(); g.moveTo(a, (road.y0 + road.y1) / 2); g.lineTo(b, (road.y0 + road.y1) / 2); g.stroke(); });
  [[blvd.top, ring.y - ring.r - 10], [ring.y + ring.r + 10, blvd.bottom]].forEach(([a, b]) => { g.beginPath(); g.moveTo((blvd.x0 + blvd.x1) / 2, a); g.lineTo((blvd.x0 + blvd.x1) / 2, b); g.stroke(); });
  g.setLineDash([]); g.strokeStyle = 'rgba(248,250,252,.8)'; g.beginPath(); g.arc(ring.x, ring.y, (ring.r + ring.island) / 2, 0, 7); g.setLineDash([16, 14]); g.stroke(); g.setLineDash([]);
  // الجزيرة الوسطى: عشب وزهور وحافة حجرية
  g.fillStyle = '#E7E5E4'; g.beginPath(); g.arc(ring.x, ring.y, ring.island + 6, 0, 7); g.fill(); g.fillStyle = '#7DB356'; g.beginPath(); g.arc(ring.x, ring.y, ring.island, 0, 7); g.fill();
  for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2, rr = ring.island - 12; g.fillStyle = ['#E11D48', '#F59E0B', '#F472B6', '#FDE047'][i % 4]; g.beginPath(); g.arc(ring.x + Math.cos(a) * rr, ring.y + Math.sin(a) * rr, 4, 0, 7); g.fill(); }
  // ممرات المشاة
  (L.zebras || []).forEach(([x, y, w, h, vert]) => { g.fillStyle = '#F8FAFC'; if (vert) for (let k = 0; k < h; k += 14) g.fillRect(x, y + k, w, 8); else for (let k = 0; k < w; k += 14) g.fillRect(x + k, y, 8, h); });
  // الفلج: قناة حجرية وماء أزرق، والجسور الخشبية (وجسر السيارات إسفلت)
  if (L.falaj) { const { y, h } = L.falaj; g.fillStyle = '#A8A29E'; g.fillRect(0, y - 5, W, h + 10); g.fillStyle = '#3B82C4'; g.fillRect(0, y, W, h); g.fillStyle = 'rgba(255,255,255,.25)'; for (let x = 0; x < W; x += 30) g.fillRect(x, y + 4 + (x % 60 ? 6 : 0), 14, 2);
    L.falaj.bridges.forEach(([a, b]) => { if (b - a > 120) { asph(a, y - 6, b - a, h + 12); return; } g.fillStyle = '#8B5A33'; g.fillRect(a, y - 8, b - a, h + 16); g.strokeStyle = '#5C3A20'; g.lineWidth = 2; for (let x = a + 6; x < b; x += 8) { g.beginPath(); g.moveTo(x, y - 8); g.lineTo(x, y + h + 8); g.stroke(); } }); }
}
/* الماء الجاري في الفلج (يُرسم فوق الأرض كل إطار في العرض العادي) */
export function falajLive(c, L, W, t) {
  if (!L.falaj) return; const { y, h } = L.falaj; c.fillStyle = 'rgba(255,255,255,.35)';
  for (let x = (t * 40) % 50 - 50; x < W; x += 50) { if (L.falaj.bridges.some(([a, b]) => x > a - 10 && x < b)) continue; c.fillRect(x, y + h * .35, 16, 2); c.fillRect(x + 22, y + h * .7, 10, 2); }
}

/* ── الحياة: تهيئة وتحديث (السيارات، الأطفال والكرة، الدراجة، الماعز، الطيور) ── */
export function lifeInit(L) {
  const S = { cars: [], kids: [], ball: null, bike: null, goats: [], birds: { a: 0 }, sitters: [] };
  const { road, ring } = L, mid = (road.y0 + road.y1) / 2, off = (road.y1 - road.y0) / 4;
  for (let k = 0; k < 4; k++) S.cars.push({ lane: k % 2 ? -1 : 1, x: k * 700 + 100, col: CAR_COLS[k], v: 0, max: 105 + k * 8, kind: 'ring' });
  S.mid = mid; S.off = off;
  if (L.shuttles) L.shuttles.forEach((sh, k) => S.cars.push({ kind: 'shuttle', sh, phase: 'up', y: sh.from, wait: k * 3, col: sh.col, truck: sh.truck, v: 0 }));
  if (L.pitch) { const [x, y, w, h] = L.pitch; S.ball = { x: x + w / 2, y: y + h / 2, vx: 0, vy: 0 };
    ['#DC2626', '#2563EB', '#DC2626', '#2563EB'].forEach((c, k) => S.kids.push({ ai: 1, look: { kind: k === 2 ? 'girl' : 'boy', skin: ['#C68A5B', '#B5835A', '#D9A57A', '#A8764E'][k], robe: c, accent: '#FFFFFF' }, x: x + w * (.25 + .5 * (k % 2)), y: y + h * (.3 + .4 * (k >> 1)), dir: 'down', moving: false, phase: 0 })); }
  if (L.bike) S.bike = { ai: 1, look: { kind: 'boy', skin: '#B5835A', robe: '#0EA5E9', accent: '#FFFFFF' }, x: L.bike.x0, y: L.bike.y, d: 1, dir: 'right', moving: false, phase: 0, bike: true };
  (L.goats || []).forEach(([x, y]) => S.goats.push({ x, y, tx: x, ty: y, t: 0, dir: 1 }));
  (L.sitters || []).forEach(s => S.sitters.push({ ai: 1, look: s.look, x: s.x, y: s.y, dir: s.dir, moving: false, phase: 0, anim: 'talk', sit: true }));
  return S;
}
function ringY(S, L, x, lane) {   // مسار السيارة على الطريق العرضي، ويلتف حول الدوّار (يمين الطريق: المتجهة شرقاً في الجنوب)
  const R = (L.ring.r + L.ring.island) / 2, dx = x - L.ring.x;
  return Math.abs(dx) >= R ? S.mid + lane * S.off : L.ring.y + lane * Math.max(S.off, Math.sqrt(R * R - dx * dx));
}
export function lifeUpdate(S, L, st, dt, W) {
  const h = st.hero, near = (x, y, r) => Math.hypot(h.x - x, h.y - y) < r;
  // السيارات على الطريق العرضي: تقف إن كان البطل أو سيارة أمامها
  S.cars.filter(c => c.kind === 'ring').forEach(c => {
    const ax = c.x + c.lane * 60, ay = ringY(S, L, ax, c.lane), blocked = near(ax, ay, 46) || S.cars.some(o => o !== c && o.kind === 'ring' && o.lane === c.lane && (o.x - c.x) * c.lane > 0 && (o.x - c.x) * c.lane < 110);
    c.v += ((blocked ? 0 : c.max) - c.v) * Math.min(1, dt * (blocked ? 6 : 1.2)); c.x += c.v * c.lane * dt;
    if (c.x > W + 200) { c.x = -200; c.col = CAR_COLS[Math.floor(Math.random() * CAR_COLS.length)]; } if (c.x < -200) { c.x = W + 200; c.col = CAR_COLS[Math.floor(Math.random() * CAR_COLS.length)]; }
    const y = ringY(S, L, c.x, c.lane), y2 = ringY(S, L, c.x + c.lane * 4, c.lane); c.y = y; c.ang = Math.atan2(y2 - y, c.lane * 4);
  });
  // ذهاب وإياب على الشارع الرئيسي (شاحنة المنجم والسيارة الجنوبية)
  S.cars.filter(c => c.kind === 'shuttle').forEach(c => {
    const sh = c.sh; if (c.wait > 0) { c.wait -= dt; c.v = 0; } else {
      const up = c.phase === 'up', tgt = up ? sh.to : sh.from, x = up ? sh.xUp : sh.xDown, dirY = Math.sign(tgt - c.y), blocked = near(x, c.y + dirY * 55, 44);
      c.v += ((blocked ? 0 : 80) - c.v) * Math.min(1, dt * (blocked ? 6 : 1.2)); c.y += dirY * c.v * dt; c.x = x; c.ang = dirY < 0 ? -Math.PI / 2 : Math.PI / 2;
      if ((tgt - c.y) * dirY <= 0) { c.y = tgt; c.phase = up ? 'down' : 'up'; c.wait = 3 + Math.random() * 3; }
    } });
  // الأطفال والكرة: يركضون نحوها ويركلونها نحو المرمى المقابل
  if (S.ball) { const [px, py, pw, ph] = L.pitch, b = S.ball; b.x += b.vx * dt; b.y += b.vy * dt; b.vx *= .985; b.vy *= .985;
    if (b.x < px + 12 || b.x > px + pw - 12) { b.vx *= -1; b.x = Math.max(px + 12, Math.min(px + pw - 12, b.x)); } if (b.y < py + 10 || b.y > py + ph - 10) { b.vy *= -1; b.y = Math.max(py + 10, Math.min(py + ph - 10, b.y)); }
    S.kids.forEach((k, i) => { const chase = i === Math.floor(S.t2 || 0) % 4 || Math.hypot(b.x - k.x, b.y - k.y) < 90, tx = chase ? b.x : px + pw * (.25 + .5 * (i % 2)), ty = chase ? b.y : py + ph * (.3 + .4 * (i >> 1));
      const dx = tx - k.x, dy = ty - k.y, d = Math.hypot(dx, dy), sp = 120 * dt; k.moving = d > 6;
      if (k.moving) { k.x += dx / d * Math.min(sp, d); k.y += dy / d * Math.min(sp, d); k.phase += Math.min(sp, d) * .17; k.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'); }
      if (Math.hypot(b.x - k.x, b.y - k.y) < 14) { const goal = i % 2 ? px + 10 : px + pw - 10; b.vx = (goal - b.x) * .9 + (Math.random() - .5) * 60; b.vy = (Math.random() - .5) * 160; } });
    S.t2 = (S.t2 || 0) + dt * .25; }
  // الدراجة على الرصيف
  if (S.bike) { const k = S.bike, B = L.bike; k.x += k.d * 95 * dt; k.moving = true; k.phase += 95 * dt * .1; k.dir = k.d > 0 ? 'right' : 'left'; if (k.x > B.x1 || k.x < B.x0) { k.d *= -1; k.x = Math.max(B.x0, Math.min(B.x1, k.x)); } }
  // الماعز ترعى: تمشي قليلاً ثم تقف
  S.goats.forEach(g => { g.t -= dt; if (g.t <= 0) { g.t = 2 + Math.random() * 4; const [x0, y0, x1, y1] = L.goatArea; g.tx = x0 + Math.random() * (x1 - x0); g.ty = y0 + Math.random() * (y1 - y0); }
    const dx = g.tx - g.x, dy = g.ty - g.y, d = Math.hypot(dx, dy); if (d > 3) { g.x += dx / d * 22 * dt; g.y += dy / d * 22 * dt; g.dir = dx > 0 ? 1 : -1; g.walk = (g.walk || 0) + dt * 8; } });
  S.birds.a += dt * .25;
  st.walkersExtra = [...S.kids, ...(S.bike ? [S.bike] : []), ...S.sitters];
}

/* ── العرض العادي: عناصر قائمة (سيارات، كرة، مرمى، نافورة، لافتات، بريد، مقاعد، جلسة، قطط، ماعز) وطيور فوقها ── */
export function streetItems2D(S, L, A, t) {
  const { upright, bench, signboard } = A, out = [];
  const car = (c, x, y, ang, col, truck) => { c.save(); c.translate(x, y);
    c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(4, 6, truck ? 40 : 32, 13, ang, 0, 7); c.fill();
    c.rotate(ang); const Lh = truck ? 76 : 58, Wd = 28;
    c.fillStyle = '#1F2937'; [[-Lh * .32, -Wd / 2 - 2], [Lh * .32, -Wd / 2 - 2], [-Lh * .32, Wd / 2 - 3], [Lh * .32, Wd / 2 - 3]].forEach(([a, b]) => c.fillRect(a - 6, b, 12, 5));
    c.fillStyle = col; c.beginPath(); c.roundRect(-Lh / 2, -Wd / 2, Lh, Wd, 7); c.fill(); c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 1.2; c.stroke();
    if (truck) { c.fillStyle = '#9C7B58'; c.fillRect(-Lh / 2 + 4, -Wd / 2 + 3, Lh * .55, Wd - 6); c.fillStyle = '#7A6B5C'; for (let k = 0; k < 6; k++) { c.beginPath(); c.arc(-Lh / 2 + 10 + k * 7, -3 + (k % 2) * 6, 4, 0, 7); c.fill(); } c.fillStyle = '#93C5FD'; c.fillRect(Lh * .2, -Wd / 2 + 4, 10, Wd - 8); }
    else { c.fillStyle = shade(col, -18); c.beginPath(); c.roundRect(-Lh * .25, -Wd / 2 + 3, Lh * .5, Wd - 6, 5); c.fill(); c.fillStyle = '#93C5FD'; c.fillRect(Lh * .18, -Wd / 2 + 4, 7, Wd - 8); c.fillRect(-Lh * .3, -Wd / 2 + 4, 5, Wd - 8); }
    c.fillStyle = '#FDE68A'; c.fillRect(Lh / 2 - 3, -Wd / 2 + 3, 3, 5); c.fillRect(Lh / 2 - 3, Wd / 2 - 8, 3, 5); c.restore(); };
  S.cars.forEach(cr => out.push({ y: cr.y + 10, draw: c => car(c, cr.x, cr.y - 10, cr.ang || 0, cr.col, cr.truck) }));
  if (S.ball) { const b = S.ball; out.push({ y: b.y, draw: c => { c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(b.x + 2, b.y + 2, 6, 3, 0, 0, 7); c.fill(); c.fillStyle = '#FFF'; c.beginPath(); c.arc(b.x, b.y - 5, 5, 0, 7); c.fill(); c.fillStyle = '#111'; c.beginPath(); c.arc(b.x - 1, b.y - 6, 1.8, 0, 7); c.fill(); } });
    const [px, py, pw, ph] = L.pitch; [px + 6, px + pw - 6].forEach(gx => out.push({ y: py + ph / 2 + 30, draw: c => upright(c, gx, py + ph / 2 + 30, cc => { cc.strokeStyle = '#FFF'; cc.lineWidth = 4; cc.beginPath(); cc.moveTo(gx, py + ph / 2 + 30); cc.lineTo(gx, py + ph / 2 - 34); cc.lineTo(gx, py + ph / 2 - 30 - 4); cc.moveTo(gx, py + ph / 2 - 34); cc.lineTo(gx + (gx < px + pw / 2 ? 10 : -10), py + ph / 2 - 40); cc.stroke(); cc.strokeStyle = 'rgba(255,255,255,.5)'; cc.lineWidth = 1; for (let k = 0; k < 6; k++) { cc.beginPath(); cc.moveTo(gx, py + ph / 2 - 30 + k * 10); cc.lineTo(gx + (gx < px + pw / 2 ? -12 : 12), py + ph / 2 - 26 + k * 10); cc.stroke(); } }) })); }
  (L.fountains || []).forEach(([x, y, r]) => out.push({ x, y: y + r * .5, draw: c => { c.fillStyle = '#D6D3D1'; c.beginPath(); c.ellipse(x, y, r, r * .5, 0, 0, 7); c.fill(); c.fillStyle = '#A8A29E'; c.fillRect(x - r, y - 12, r * 2, 12); c.fillStyle = '#E7E5E4'; c.beginPath(); c.ellipse(x, y - 12, r, r * .5, 0, 0, 7); c.fill();
    c.fillStyle = '#60A5FA'; c.beginPath(); c.ellipse(x, y - 12, r - 6, r * .5 - 4, 0, 0, 7); c.fill(); c.fillStyle = '#D6D3D1'; c.fillRect(x - 5, y - 46, 10, 34);
    for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2, u = (t * .9 + k * .1) % 1; c.strokeStyle = `rgba(191,219,254,${.9 - u * .6})`; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y - 48); c.quadraticCurveTo(x + Math.cos(a) * r * .5, y - 70, x + Math.cos(a) * r * .75 * u + Math.cos(a) * 6, y - 14 + Math.sin(a) * r * .3); c.stroke(); } } }));
  (L.signs || []).forEach(s => out.push({ x: s.x, y: s.y, draw: c => upright(c, s.x, s.y, cc => { cc.fillStyle = '#6B7280'; cc.fillRect(s.x - 3, s.y - 96, 6, 96); s.lines.forEach((ln, k) => { const yy = s.y - 92 + k * 22, w = 96; cc.fillStyle = ['#15803D', '#1D4ED8', '#B45309'][k % 3]; cc.beginPath(); cc.roundRect(s.x - w / 2, yy, w, 18, 4); cc.fill(); cc.fillStyle = '#FFF'; cc.font = '800 11px Cairo'; cc.textAlign = 'center'; cc.direction = 'rtl'; cc.fillText(ln, s.x, yy + 13); }); }) }));
  (L.mailboxes || []).forEach(([x, y, col]) => out.push({ x, y, draw: c => upright(c, x, y, cc => { cc.fillStyle = '#6B7280'; cc.fillRect(x - 2, y - 34, 4, 34); cc.fillStyle = col; cc.beginPath(); cc.roundRect(x - 9, y - 46, 18, 14, 4); cc.fill(); cc.fillStyle = '#FFF'; cc.fillRect(x - 6, y - 41, 12, 2); }) }));
  (L.benches || []).forEach(([x, y]) => out.push({ x, y, draw: c => bench(c, x, y) }));
  (L.rugs || []).forEach(([x, y]) => out.push({ y: y - 30, draw: c => { c.fillStyle = '#9E2B25'; c.fillRect(x - 46, y - 24, 92, 48); c.strokeStyle = '#E3B04B'; c.lineWidth = 3; c.strokeRect(x - 40, y - 18, 80, 36); c.fillStyle = '#1F4E79'; c.fillRect(x - 10, y - 8, 20, 16);
    c.fillStyle = '#C9A227'; c.beginPath(); c.ellipse(x, y + 2, 7, 9, 0, 0, 7); c.fill(); c.fillRect(x - 2, y - 12, 4, 6); c.fillStyle = '#FFF'; [[-16, 10], [14, 10]].forEach(([a, b]) => { c.fillRect(x + a - 3, y + b - 4, 6, 6); }); } }));
  (L.cats || []).forEach(([x, y, hh], k) => out.push({ x, y: y + .3, draw: c => upright(c, x, y, cc => { const yy = y - hh, tw = Math.sin(t * 2 + k) * 4; cc.fillStyle = ['#F59E0B', '#1F2937', '#E5E7EB'][k % 3]; cc.beginPath(); cc.ellipse(x, yy - 6, 9, 6, 0, 0, 7); cc.fill(); cc.beginPath(); cc.arc(x + 8, yy - 12, 5, 0, 7); cc.fill(); cc.beginPath(); cc.moveTo(x + 5, yy - 15); cc.lineTo(x + 6, yy - 20); cc.lineTo(x + 9, yy - 16); cc.moveTo(x + 9, yy - 16); cc.lineTo(x + 11, yy - 20); cc.lineTo(x + 12, yy - 14); cc.fill(); cc.strokeStyle = cc.fillStyle; cc.lineWidth = 2.5; cc.beginPath(); cc.moveTo(x - 8, yy - 6); cc.quadraticCurveTo(x - 16, yy - 14 + tw, x - 14, yy - 22 + tw); cc.stroke(); }) }));
  S.goats.forEach(g => out.push({ y: g.y, draw: c => upright(c, g.x, g.y, cc => { const x = g.x, y = g.y, d = g.dir || 1, s = Math.sin(g.walk || 0) * 2; cc.fillStyle = 'rgba(0,0,0,.2)'; cc.beginPath(); cc.ellipse(x, y + 1, 14, 4, 0, 0, 7); cc.fill();
    cc.strokeStyle = '#3F3F46'; cc.lineWidth = 2.5; [[-7, s], [7, -s]].forEach(([a, b]) => { cc.beginPath(); cc.moveTo(x + a, y - 12); cc.lineTo(x + a + b, y); cc.stroke(); });
    cc.fillStyle = '#F5F5F4'; cc.beginPath(); cc.ellipse(x, y - 16, 13, 8, 0, 0, 7); cc.fill(); cc.fillStyle = '#78716C'; cc.beginPath(); cc.ellipse(x + d * 12, y - 24, 6, 5, 0, 0, 7); cc.fill(); cc.strokeStyle = '#57534E'; cc.lineWidth = 1.5; cc.beginPath(); cc.moveTo(x + d * 11, y - 28); cc.lineTo(x + d * 8, y - 34); cc.stroke(); }) }));
  return out;
}
export function birds2D(c, S, L, t) {   // سرب طيور يدور فوق القرية
  for (let k = 0; k < 7; k++) { const a = S.birds.a + k * .12, x = L.birdC[0] + Math.cos(a) * 700 + (k % 3) * 20, y = L.birdC[1] - 300 + Math.sin(a) * 260 + (k >> 1) * 14, f = Math.sin(t * 9 + k) * 5;
    c.strokeStyle = 'rgba(40,40,50,.75)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 8, y - f); c.quadraticCurveTo(x - 3, y - 3, x, y); c.quadraticCurveTo(x + 3, y - 3, x + 8, y - f); c.stroke(); }
}
/* الدراجة تحت الطفل (تُرسم قبل الشخص) */
export function bike2D(c, k) { const x = k.x, y = k.y, d = k.d || 1, sp = (k.phase || 0) * 2; c.strokeStyle = '#111827'; c.lineWidth = 2.5; [[-14, 0], [14, 0]].forEach(([a]) => { c.beginPath(); c.arc(x + a, y - 9, 9, 0, 7); c.stroke(); });
  c.strokeStyle = '#0EA5E9'; c.lineWidth = 3; c.beginPath(); c.moveTo(x - 14 * d, y - 9); c.lineTo(x - 2 * d, y - 22); c.lineTo(x + 10 * d, y - 22); c.lineTo(x + 14 * d, y - 9); c.moveTo(x - 2 * d, y - 22); c.lineTo(x, y - 9); c.lineTo(x - 14 * d, y - 9); c.stroke(); c.strokeStyle = '#111827'; c.beginPath(); c.moveTo(x + 10 * d, y - 22); c.lineTo(x + 10 * d, y - 30); c.stroke();
  c.fillStyle = '#374151'; c.beginPath(); c.arc(x + Math.cos(sp) * 4, y - 9 + Math.sin(sp) * 4, 2, 0, 7); c.fill(); }

/* ── العرض المجسّم ── */
export function streetBuild3D(THREE, S, L, lib) {
  const { Parts, box, material, signMesh, bench } = lib, g = new THREE.Group(), P = new Parts(), ticks = [];
  // الفلج: ماء يلمع، وجسور خشبية
  if (L.falaj) { const { y, h } = L.falaj, water = new THREE.Mesh(new THREE.PlaneGeometry(L.W, h), new THREE.MeshStandardMaterial({ color: '#3B82C4', roughness: .15, metalness: .2, transparent: true, opacity: .9 }));
    water.rotation.x = -Math.PI / 2; water.position.set(L.W / 2, 1.2, y + h / 2); g.add(water); ticks.push(t => { water.material.color.setHSL(.58, .55, .48 + Math.sin(t * 2) * .03); });
    L.falaj.bridges.forEach(([a, b]) => { if (b - a > 120) return; P.add(material('wood', '#8B5A33'), box(b - a, 5, h + 18, (a + b) / 2, 4, y + h / 2)); [a + 2, b - 2].forEach(x => P.add(material('wood', '#5C3A20'), box(3, 18, h + 18, x, 12, y + h / 2))); }); }
  // النافورة
  const sprays = [];
  (L.fountains || []).forEach(([x, y, r]) => { P.add(material('stone', '#D6D3D1'), new THREE.CylinderGeometry(r, r + 2, 14, 24).translate(x, 7, y)); P.add(material('stone', '#E7E5E4'), new THREE.CylinderGeometry(6, 8, 46, 12).translate(x, 23, y)); P.add(material('stone', '#E7E5E4'), new THREE.CylinderGeometry(16, 10, 6, 16).translate(x, 46, y));
    const wtr = new THREE.Mesh(new THREE.CylinderGeometry(r - 5, r - 5, 1, 24), new THREE.MeshStandardMaterial({ color: '#60A5FA', roughness: .1, transparent: true, opacity: .85 })); wtr.position.set(x, 13, y); g.add(wtr);
    for (let k = 0; k < 14; k++) { const m = new THREE.Mesh(new THREE.SphereGeometry(2.4, 6, 5), new THREE.MeshStandardMaterial({ color: '#DBEAFE', transparent: true, opacity: .8 })); g.add(m); sprays.push({ m, x, y, r, k }); } });
  ticks.push(t => sprays.forEach(s => { const u = (t * .9 + s.k / 14) % 1, a = s.k / 14 * Math.PI * 2; s.m.position.set(s.x + Math.cos(a) * s.r * .75 * u, 50 + 30 * u - 60 * u * u, s.y + Math.sin(a) * s.r * .75 * u); }));
  // لافتات الاتجاهات وصناديق البريد والمقاعد والجلسة والمرمى
  (L.signs || []).forEach(s => { P.add(material('metal', '#6B7280'), new THREE.CylinderGeometry(3, 3, 100, 8).translate(s.x, 50, s.y)); s.lines.forEach((ln, k) => { const m = signMesh(ln, 12); m.position.set(s.x, 92 - k * 20, s.y + 3); g.add(m); }); });
  (L.mailboxes || []).forEach(([x, y, col]) => { P.add(material('metal', '#6B7280'), box(4, 34, 4, x, 17, y)); P.add(material('flat', col), box(18, 14, 12, x, 40, y)); });
  (L.benches || []).forEach(([x, y]) => bench(P, x, y));
  (L.rugs || []).forEach(([x, y]) => { P.add(material('flat', '#9E2B25'), box(92, 1.5, 48, x, 1, y)); P.add(material('flat', '#E3B04B'), box(80, 1.6, 36, x, 1.2, y)); P.add(material('flat', '#9E2B25'), box(74, 1.7, 30, x, 1.4, y)); P.add(material('metal', '#C9A227', { rough: .3, metal: .9 }), new THREE.SphereGeometry(7, 10, 8).translate(x, 8, y)); });
  if (L.pitch) { const [px, py, pw, ph] = L.pitch; [px + 6, px + pw - 6].forEach(gx => { [-30, 30].forEach(o => P.add(material('flat', '#FFFFFF'), box(4, 40, 4, gx, 20, py + ph / 2 + o))); P.add(material('flat', '#FFFFFF'), box(4, 4, 64, gx, 40, py + ph / 2)); }); }
  (L.cats || []).forEach(([x, y, hh], k) => { const c = ['#F59E0B', '#1F2937', '#E5E7EB'][k % 3]; P.add(material('flat', c), new THREE.SphereGeometry(8, 10, 8).scale(1.3, .8, .8).translate(x, hh * 1.38 * .26 + 42, y)); P.add(material('flat', c), new THREE.SphereGeometry(5, 10, 8).translate(x + 10, hh * 1.38 * .26 + 48, y)); });
  g.add(P.build());
  // السيارات والكرة والماعز والطيور: مجسّمات تتحرك
  const carMesh = (col, truck) => { const cg = new THREE.Group(), Q = new Parts(), Lh = truck ? 76 : 58;
    Q.add(material('metal', col, { rough: .35, metal: .5 }), box(Lh, 16, 28, 0, 14, 0)); Q.add(material('metal', truck ? '#1F2937' : col, { rough: .35, metal: .5 }), box(truck ? 22 : 32, 14, 24, truck ? Lh / 2 - 14 : -2, 29, 0));
    Q.add(material('flat', '#93C5FD', { rough: .1 }), box(truck ? 2 : 2, 10, 20, truck ? Lh / 2 - 2.5 : 14, 29, 0)); if (truck) Q.add(material('flat', '#9C7B58'), box(Lh * .55, 10, 24, -Lh * .2, 26, 0));
    [[-Lh * .32, -14], [Lh * .32, -14], [-Lh * .32, 14], [Lh * .32, 14]].forEach(([a, b]) => Q.add(material('flat', '#111827'), new THREE.CylinderGeometry(7, 7, 5, 12).rotateX(Math.PI / 2).translate(a, 7, b)));
    cg.add(Q.build()); return cg; };
  const cars = S.cars.map(c => { const m = carMesh(c.col, c.truck); g.add(m); return { c, m, col: c.col }; });
  let ball = null; if (S.ball) { ball = new THREE.Mesh(new THREE.SphereGeometry(5, 12, 10), material('flat', '#FFFFFF')); g.add(ball); }
  const goats = S.goats.map(() => { const q = new Parts(); q.add(material('flat', '#F5F5F4'), new THREE.SphereGeometry(13, 10, 8).scale(1.2, .7, .7).translate(0, 18, 0)); q.add(material('flat', '#78716C'), new THREE.SphereGeometry(6, 8, 6).translate(14, 26, 0)); [[-7, -5], [7, -5], [-7, 5], [7, 5]].forEach(([a, b]) => q.add(material('flat', '#3F3F46'), box(3, 12, 3, a, 6, b))); const m = q.build(); g.add(m); return m; });
  const birds = []; for (let k = 0; k < 7; k++) { const b = new THREE.Mesh(new THREE.ConeGeometry(4, 16, 3), material('flat', '#27272A')); b.rotation.z = Math.PI / 2; g.add(b); birds.push(b); }
  return { group: g, update(t) {
    ticks.forEach(f => f(t));
    cars.forEach(o => { if (o.col !== o.c.col) { g.remove(o.m); o.m = carMesh(o.c.col, o.c.truck); g.add(o.m); o.col = o.c.col; } o.m.position.set(o.c.x, 0, o.c.y); o.m.rotation.y = -(o.c.ang || 0); });
    if (ball) ball.position.set(S.ball.x, 5, S.ball.y);
    goats.forEach((m, k) => { const q = S.goats[k]; m.position.set(q.x, Math.abs(Math.sin(q.walk || 0)) * 1.5, q.y); m.rotation.y = q.dir > 0 ? 0 : Math.PI; });
    birds.forEach((b, k) => { const a = S.birds.a + k * .12; b.position.set(L.birdC[0] + Math.cos(a) * 700 + (k % 3) * 20, 320 + Math.sin(t * 2 + k) * 6, L.birdC[1] + Math.sin(a) * 260 + (k >> 1) * 14); b.rotation.y = -a; b.scale.y = .6 + .4 * Math.abs(Math.sin(t * 9 + k)); });
  } };
}
