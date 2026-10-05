// المحرك: حلقة اللعب، الكاميرا، اللمس ولوحة المفاتيح. لا يعرف شيئاً عن القصة أو الرياضيات.
import { clamp } from './util.js';
export function createEngine(canvas, world) {
  const ctx = canvas.getContext('2d');
  const E = { ctx, world, w: 0, h: 0, dpr: 1, zoom: 1, cam: { x: world.w / 2, y: world.h / 2 }, focus: null, follow: null, keys: {}, onTap: null, t: 0, running: false };
  function resize() {
    E.dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    E.w = canvas.clientWidth; E.h = canvas.clientHeight;
    canvas.width = Math.round(E.w * E.dpr); canvas.height = Math.round(E.h * E.dpr);
    E.zoom = clamp(Math.min(E.w / 370, E.h / 600), .95, 1.5);
  }
  window.addEventListener('resize', resize); resize();
  E.toWorld = (sx, sy) => ({ x: (sx - E.w / 2) / E.zoom + E.cam.x, y: (sy - E.h / 2) / E.zoom + E.cam.y });
  canvas.addEventListener('pointerdown', e => { if (!E.onTap) return; const r = canvas.getBoundingClientRect(); E.onTap(E.toWorld(e.clientX - r.left, e.clientY - r.top)); });
  const KEYS = { ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right', ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down' };
  window.addEventListener('keydown', e => { const k = KEYS[e.key]; if (k && !(e.target && e.target.tagName === 'INPUT')) { E.keys[k] = true; e.preventDefault(); } });
  window.addEventListener('keyup', e => { const k = KEYS[e.key]; if (k) E.keys[k] = false; });
  E.snap = p => { E.cam.x = p.x; E.cam.y = p.y - 40; };
  E.run = (update, render) => {
    E.update = update; E.render = render;
    if (E.running) return; E.running = true;
    let last = performance.now();
    const frame = now => {
      const dt = Math.min(.05, (now - last) / 1000); last = now; E.t += dt;
      try { E.update(dt); } catch (err) { if (!E._errU) { E._errU = 1; console.error('update', err); } }   // خطأ واحد لا يوقف اللعبة
      const tgt = E.focus || E.follow;
      if (tgt) { const k = Math.min(1, dt * (E.focus ? 2.4 : 5)); E.cam.x += (tgt.x - E.cam.x) * k; E.cam.y += (tgt.y - 40 - E.cam.y) * k; }
      const hw = E.w / 2 / E.zoom, hh = E.h / 2 / E.zoom;
      E.cam.x = clamp(E.cam.x, hw, Math.max(hw, world.w - hw)); E.cam.y = clamp(E.cam.y, hh, Math.max(hh, world.h - hh));
      ctx.setTransform(E.dpr, 0, 0, E.dpr, 0, 0); ctx.fillStyle = '#EAD6A6'; ctx.fillRect(0, 0, E.w, E.h);
      ctx.setTransform(E.dpr * E.zoom, 0, 0, E.dpr * E.zoom, E.dpr * (E.w / 2 - E.cam.x * E.zoom), E.dpr * (E.h / 2 - E.cam.y * E.zoom));
      try { E.render(ctx, { x: E.cam.x - hw, y: E.cam.y - hh, w: hw * 2, h: hh * 2 }, E.t); } catch (err) { if (!E._errR) { E._errR = 1; console.error('render', err); } }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };
  return E;
}
