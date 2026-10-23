// العرض العادي للقرية: متساوي القياس (٤٥° مثل كاميرا العرض ثلاثي الأبعاد)، يقرأ نموذج grid.js والحالة فقط.
// الأرض تُرسم مرة في صورة واحدة، وكل جدار يُرسم مرة في صورة صغيرة ثم يُنسخ (رسم خفيف على الأجهزة الضعيفة)،
// والجدران والمعالم والبطل تُرتَّب بالعمق فيختفي البطل خلف ما أمامه. القرى المظلمة (mood.dark) تُضاء بمصابيحها.
import { drawHuman } from '../character/human.js';

export const TW = 64, TH = 32, HZ = 30;   // عرض البلاطة وارتفاعها على الشاشة، وارتفاع وحدة الجدار
export const iso = (x, y) => ({ x: (x - y) * TW / 2, y: (x + y) * TH / 2 });

export function createView2D(canvas, grid, def) {
  const ctx = canvas.getContext('2d'), M = def.mood;
  const kit = def.kit2d({ TW, TH, HZ, iso });
  const ox = grid.H * TW / 2 + TW, oy = HZ * 4;   // إزاحة صورة الأرض حتى لا يخرج شيء عن حدودها
  // ١. الأرض: صورة واحدة
  const floor = document.createElement('canvas');
  floor.width = (grid.W + grid.H) * TW / 2 + TW * 2; floor.height = (grid.W + grid.H) * TH / 2 + oy + TH * 2;
  const fc = floor.getContext('2d');
  if (kit.init) kit.init(grid);
  grid.cells.forEach(c => { if (!c.wall) { const p = iso(c.x, c.y); kit.floor(fc, c, ox + p.x, oy + p.y); } });
  if (kit.floorOver) kit.floorOver(fc, grid, (x, y) => { const p = iso(x, y); return { x: ox + p.x, y: oy + p.y }; });
  // ٢. صور الجدران: تُرسم عند أول ظهور
  const wallImg = new Map();
  const wallSprite = c => {
    if (wallImg.has(c)) return wallImg.get(c);
    const h = (c.h || 1) * HZ, cv = document.createElement('canvas'); cv.width = TW + 4; cv.height = TH + h + 6;
    const g = cv.getContext('2d'), by = h + 2 + TH / 2; kit.wall(g, c, TW / 2 + 2, by, grid);   // (cx, by): مركز قاعدة البلاطة في الصورة
    const s = { cv, dx: -TW / 2 - 2, dy: -by }; wallImg.set(c, s); return s;
  };
  const walls = grid.cells.filter(c => c.wall && kit.wall);
  const items = (def.props || []).map((p, i) => ({ id: 'p' + i, p }));

  let dpr = 1, vw = 0, vh = 0, zoom = 1;
  const cam = { x: 0, y: 0, ready: false };
  const shade = document.createElement('canvas'), sh = shade.getContext('2d');
  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2); vw = canvas.clientWidth || innerWidth; vh = canvas.clientHeight || innerHeight;
    canvas.width = vw * dpr; canvas.height = vh * dpr; shade.width = canvas.width / 2; shade.height = canvas.height / 2;
  }
  resize();
  const baseZ = () => (vw < vh ? .85 : 1.05) * zoom;
  let t = 0, last = performance.now();

  function frame(st) {
    const now = performance.now(), dt = Math.min(.05, (now - last) / 1000); last = now; t += dt;
    const hp = iso(st.hero.x, st.hero.y), Z = baseZ();
    if (!cam.ready) { cam.x = hp.x; cam.y = hp.y; cam.ready = true; }
    const k = 1 - Math.exp(-dt * 5); cam.x += (hp.x - cam.x) * k; cam.y += (hp.y - cam.y - 20) * k;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = M.sky2d || M.sky; ctx.fillRect(0, 0, canvas.width, canvas.height);
    const tx = vw / 2 - cam.x * Z, ty = vh / 2 - cam.y * Z;
    ctx.setTransform(dpr * Z, 0, 0, dpr * Z, dpr * tx, dpr * ty);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(floor, -ox, -oy);
    // حدود الشاشة بإحداثيات الرسم (لرسم ما يظهر فقط)
    const L = -tx / Z - TW, R = (vw - tx) / Z + TW, T = -ty / Z - TH, B = (vh - ty) / Z + HZ * 6;
    const list = [];
    for (const c of walls) { const p = iso(c.x + .5, c.y + .5); if (p.x < L || p.x > R || p.y < T || p.y > B) continue; list.push({ d: c.x + c.y + 1, draw: () => { const s = wallSprite(c); ctx.drawImage(s.cv, p.x + s.dx, p.y + s.dy); } }); }
    for (const it of items) { const p = iso(it.p.x, it.p.y); if (p.x < L || p.x > R || p.y < T || p.y > B) continue; list.push({ d: it.p.x + it.p.y + (it.p.depth || 0), draw: () => kit.prop(ctx, it.p, p.x, p.y, t, st) }); }
    for (const s of def.stations || []) { const p = iso(s.x, s.y); list.push({ d: s.x + s.y, draw: () => kit.station(ctx, s, p.x, p.y, t, st) }); }
    for (const q of def.people || []) { const p = iso(q.x, q.y); if (p.x < L || p.x > R || p.y < T || p.y > B) continue;
      const dx = st.hero.x - q.x, dy = st.hero.y - q.y, near = Math.hypot(dx, dy) < 3.2, sx = dx - dy, sy = dx + dy;
      const dir = !near ? 'down' : Math.abs(sx) > Math.abs(sy) * .8 ? (sx > 0 ? 'right' : 'left') : (sy > 0 ? 'down' : 'up');
      list.push({ d: q.x + q.y, draw: () => { ctx.save(); ctx.globalAlpha = .28; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(p.x, p.y, 15, 7, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        drawHuman(ctx, { ...q.look, x: p.x, y: p.y, dir, anim: st.talking === q.id ? 'talk' : null, animT: (t * .8) % 1, s: .82 }); } }); }
    list.push({ d: st.hero.x + st.hero.y + .01, draw: () => {
      ctx.save(); ctx.globalAlpha = .28; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(hp.x, hp.y, 15, 7, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      drawHuman(ctx, { ...st.look, x: hp.x, y: hp.y, dir: st.hero.dir2d || 'down', phase: st.hero.phase, moving: st.hero.moving, anim: st.hero.anim, animT: st.hero.animT, s: .82 });
    } });
    list.sort((a, b) => a.d - b.d).forEach(i => i.draw());
    // دائرة الوجهة
    if (st.dest && st.dest.k > 0) { const p = iso(st.dest.x, st.dest.y); ctx.save(); ctx.globalAlpha = st.dest.k; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(p.x, p.y, 14 * (1.6 - st.dest.k * .6), 7 * (1.6 - st.dest.k * .6), 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
    // علامة المحطة الحالية: معين مضيء يطفو
    const goal = st.goal && (def.stations || []).find(s => s.id === st.goal);
    if (goal) {
      const p = iso(goal.x, goal.y), y = p.y - 92 + Math.sin(t * 2.4) * 5, a = M.accent || '#FFD54A';
      ctx.save(); ctx.globalAlpha = .45 + .25 * Math.sin(t * 3); ctx.strokeStyle = a; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(p.x, p.y, 30, 15, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      const w = 9 * (.75 + .25 * Math.cos(t * 1.6));
      ctx.save(); ctx.shadowColor = a; ctx.shadowBlur = 16; ctx.fillStyle = a; ctx.beginPath(); ctx.moveTo(p.x, y - 13); ctx.lineTo(p.x + w, y); ctx.lineTo(p.x, y + 13); ctx.lineTo(p.x - w, y); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.moveTo(p.x, y - 13); ctx.lineTo(p.x + w * .5, y - 2); ctx.lineTo(p.x, y); ctx.closePath(); ctx.fill(); ctx.restore();
    }
    // الإضاءة: ظلام القرى المظلمة تخترقه المصابيح ومصباح البطل
    if (M.dark) {
      const sz = shade.width, sy = shade.height, hs = .5;
      sh.setTransform(1, 0, 0, 1, 0, 0); sh.globalCompositeOperation = 'source-over'; sh.clearRect(0, 0, sz, sy);
      sh.fillStyle = M.dark; sh.fillRect(0, 0, sz, sy); sh.globalCompositeOperation = 'destination-out';
      const toS = (x, y) => { const p = iso(x, y); return { x: (p.x * Z + tx) * dpr * hs, y: (p.y * Z + ty) * dpr * hs }; };
      const hole = (x, y, r, a) => { const p = toS(x, y), rr = r * Z * dpr * hs, g = sh.createRadialGradient(p.x, p.y, 0, p.x, p.y, rr); g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(1, 'rgba(0,0,0,0)'); sh.fillStyle = g; sh.fillRect(p.x - rr, p.y - rr, rr * 2, rr * 2); };
      hole(st.hero.x, st.hero.y, 210, .95);
      (kit.lights ? kit.lights(def, st) : []).forEach(l => hole(l.x, l.y, l.r || 150, (l.a ?? .9) * (1 + .05 * Math.sin(t * 7 + l.x))));
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(shade, 0, 0, canvas.width, canvas.height);
      if (kit.glow) { ctx.setTransform(dpr * Z, 0, 0, dpr * Z, dpr * tx, dpr * ty); ctx.globalCompositeOperation = 'lighter'; kit.glow(ctx, def, t, st, iso); ctx.globalCompositeOperation = 'source-over'; }
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  function pick(cx, cy) {
    const b = canvas.getBoundingClientRect(), Z = baseZ(), tx = vw / 2 - cam.x * Z, ty = vh / 2 - cam.y * Z;
    const wx = (cx - b.left - tx) / Z, wy = (cy - b.top - ty) / Z;
    return { x: (wx / (TW / 2) + wy / (TH / 2)) / 2, y: (wy / (TH / 2) - wx / (TW / 2)) / 2 };
  }
  function project(x, y, h = 0) { const b = canvas.getBoundingClientRect(), Z = baseZ(), p = iso(x, y); return { x: b.left + vw / 2 + (p.x - cam.x) * Z, y: b.top + vh / 2 + (p.y - h * .6 - cam.y) * Z }; }
  return { kind: '2d', frame, pick, project, resize, dispose() { wallImg.clear(); }, zoom: z => { zoom = Math.min(1.8, Math.max(.6, z)); }, get zoomV() { return zoom; } };
}
