// العرض العادي للقرية بلغة العالم المفتوح البصرية نفسها (world/art.js): منظور علوي مائل، والمباني صناديق بجدار حقيقي
// تميل حسب موضعها من الكاميرا (CAM)، والنخيل والشخصيات قائمة تميل معها. الأرض تُرسم مرة في قطع ٥١٢ وتُنسخ.
// يقرأ الحالة فقط: ما في القرية يأتي من kit2d في ملفها (ground, items, station, over).
import { CAM, FLAGS, upright } from '../world/art.js';
import { drawHuman } from '../character/human.js';
import { bike2D } from './street.js';

const CH = 512, TEEN = 1.18;   // شخصيات الصف الثامن أكبر من شخصيات العالم المفتوح

export function createView2D(canvas, grid, def) {
  FLAGS.three = false;
  const ctx = canvas.getContext('2d'), M = def.mood, kit = def.kit2d(def);
  const chunks = new Map();
  const chunk = (cx, cy) => { const k = cx + ',' + cy; let c = chunks.get(k); if (c) return c;
    c = document.createElement('canvas'); c.width = c.height = CH; const g = c.getContext('2d'); g.translate(-cx * CH, -cy * CH); kit.ground(g, cx * CH, cy * CH, CH, CH); chunks.set(k, c); return c; };
  let dpr = 1, vw = 0, vh = 0, zoom = 1;
  const cam = { x: def.start.x, y: def.start.y - 120, ready: false };
  function resize() { dpr = Math.min(devicePixelRatio || 1, 2); vw = canvas.clientWidth || innerWidth; vh = canvas.clientHeight || innerHeight; canvas.width = vw * dpr; canvas.height = vh * dpr; }
  resize();
  const Zb = () => (vw < vh ? vw / 640 : vw / 1250) * zoom;   // مقدار ما يُرى: نحو ١٢٥٠ بكسلاً عرضاً على الحاسوب
  let t = 0, last = performance.now();
  const person = (c, look, x, y, o) => upright(c, x, y, cc => { cc.save(); cc.globalAlpha = .26; cc.fillStyle = '#3A2410'; cc.beginPath(); cc.ellipse(x, y, 17 * TEEN, 7 * TEEN, 0, 0, 7); cc.fill(); cc.restore(); drawHuman(cc, { ...look, x, y, s: TEEN, ...o }); }, .5);

  function frame(st) {
    const now = performance.now(), dt = Math.min(.05, (now - last) / 1000); last = now; t += dt;
    const Z = Zb(), h = st.hero;
    const halfW = vw / 2 / Z, halfH = vh / 2 / Z, gx = Math.max(halfW, Math.min(grid.W - halfW, h.x)), gy = Math.max(halfH, Math.min(grid.H - halfH, h.y - 40));
    if (!cam.ready) { cam.x = gx; cam.y = gy; cam.ready = true; }
    const k = 1 - Math.exp(-dt * 4); cam.x += (gx - cam.x) * k; cam.y += (gy - cam.y) * k;
    CAM.x = cam.x; CAM.y = cam.y; FLAGS.three = false;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = M.sky2d || '#CFE6F7'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    const tx = vw / 2 - cam.x * Z, ty = vh / 2 - cam.y * Z;
    ctx.setTransform(dpr * Z, 0, 0, dpr * Z, dpr * tx, dpr * ty);
    const L = cam.x - halfW - 40, R = cam.x + halfW + 40, T = cam.y - halfH - 60, B = cam.y + halfH + 260;
    for (let cy = Math.max(0, Math.floor(T / CH)); cy <= Math.min(Math.ceil(grid.H / CH) - 1, Math.floor(B / CH)); cy++)
      for (let cx = Math.max(0, Math.floor(L / CH)); cx <= Math.min(Math.ceil(grid.W / CH) - 1, Math.floor(R / CH)); cx++) ctx.drawImage(chunk(cx, cy), 0, 0, CH, CH, cx * CH - .5, cy * CH - .5, CH + 1, CH + 1);   // تداخل نصف بكسل: لا خط بين القطع
    if (chunks.size > 80) chunks.forEach((c, k) => { if (Math.abs(+k.split(',')[0] * CH - cam.x) > 5000) chunks.delete(k); });   // العالم المتصل: تُنسى القطع البعيدة
    if (kit.groundLive) kit.groundLive(ctx, t, st);
    // قائمة الرسم مرتبة بالعمق (أسفل الأرضية)
    const list = kit.items(t, st).filter(i => i.x == null || (i.x > L - 300 && i.x < R + 300 && i.y > T - 60 && i.y < B + 300));
    (def.stations || []).forEach(s => list.push({ y: s.y, draw: c => kit.station(c, s, t, st) }));
    (def.people || []).forEach(q => { const dx = h.x - q.x, dy = h.y - q.y, near = Math.hypot(dx, dy) < 160;
      const dir = !near ? (q.dir || 'down') : Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
      list.push({ y: q.y, draw: c => person(c, q.look, q.x, q.y, { dir, anim: st.talking === q.id ? 'talk' : null, animT: (t * .8) % 1 }) }); });
    (st.walkers || []).concat(st.walkersExtra || []).forEach(w => list.push({ y: w.y, draw: c => { if (w.bike) upright(c, w.x, w.y, cc => bike2D(cc, w)); person(c, w.look, w.x, w.bike ? w.y - 12 : w.y, { dir: w.dir, moving: w.bike ? false : w.moving, phase: w.phase, anim: w.anim, animT: (t * .8) % 1 }); } }));
    list.push({ y: h.y + .1, draw: c => person(c, st.look, h.x, h.y, { dir: h.dir2d || 'down', phase: h.phase, moving: h.moving, anim: h.anim || (h.run && h.moving ? 'run' : null), animT: h.animT }) });
    list.sort((a, b) => a.y - b.y).forEach(i => { try { i.draw(ctx); } catch (e) { if (!frame.err) { frame.err = 1; console.error('[قرية الخير] رسم عنصر في القرية', e && e.stack || e); } } });
    if (kit.over) kit.over(ctx, t, st);
    // دائرة الوجهة وعلامة المحطة الحالية
    if (st.dest && st.dest.k > 0) { ctx.save(); ctx.globalAlpha = st.dest.k; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(st.dest.x, st.dest.y, 16 * (1.6 - st.dest.k * .6), 8 * (1.6 - st.dest.k * .6), 0, 0, 7); ctx.stroke(); ctx.restore(); }
    const goal = st.goalPt;   // فوق صاحب الدرس الحالي، أو البوابة بعد إنهاء الدروس (runtime.js)
    if (goal) {
      const a = M.accent || '#FFC94A', y = goal.y - (goal.mh || 150) + Math.sin(t * 2.4) * 6, w = 12 * (.75 + .25 * Math.cos(t * 1.6));
      ctx.save(); ctx.globalAlpha = .55 + .3 * Math.sin(t * 3); ctx.strokeStyle = a; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(goal.x, goal.y + 6, 44, 18, 0, 0, 7); ctx.stroke(); ctx.restore();
      ctx.save(); ctx.shadowColor = a; ctx.shadowBlur = 18; ctx.fillStyle = a; ctx.beginPath(); ctx.moveTo(goal.x, y - 18); ctx.lineTo(goal.x + w, y); ctx.lineTo(goal.x, y + 18); ctx.lineTo(goal.x - w, y); ctx.closePath(); ctx.fill(); ctx.restore();
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  const inv = (cx, cy) => { const b = canvas.getBoundingClientRect(), Z = Zb(); return { x: (cx - b.left - vw / 2) / Z + cam.x, y: (cy - b.top - vh / 2) / Z + cam.y }; };
  return { kind: '2d', frame, pick: inv, resize,
    project: (x, y, hh = 0) => { const b = canvas.getBoundingClientRect(), Z = Zb(); return { x: b.left + vw / 2 + (x - cam.x) * Z, y: b.top + vh / 2 + (y - hh - cam.y) * Z }; },
    dispose() { chunks.clear(); }, zoom: z => { zoom = Math.min(1.9, Math.max(.55, z)); }, get zoomV() { return zoom; } };
}
