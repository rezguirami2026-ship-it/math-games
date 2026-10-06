// المحرك: حلقة اللعب، الكاميرا، اللمس ولوحة المفاتيح. لا يعرف شيئاً عن القصة أو الرياضيات.
import { clamp } from './util.js';
export function createEngine(canvas, world) {
  const ctx = canvas.getContext('2d');
  const E = { ctx, world, w: 0, h: 0, dpr: 1, zoom: 1, cam: { x: world.w / 2, y: world.h / 2 }, focus: null, follow: null, keys: {}, onTap: null, t: 0, running: false,
    lead: { x: 0, y: 0 }, punch: 0, quake: 0 };
  let light = null, vignette = null;
  function resize() {
    E.dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    E.w = canvas.clientWidth; E.h = canvas.clientHeight;
    canvas.width = Math.round(E.w * E.dpr); canvas.height = Math.round(E.h * E.dpr);
    // التقريب: البطل نحو ١٥٪ من ارتفاع الشاشة، مع رؤية ٣٣٠ وحدة عرضاً على الأقل في الهاتف
    E.zoom = clamp(Math.min(E.w / 330, E.h / 470), 1, 2);
    // طبقة الضوء: شمس دافئة من أعلى اليسار، وظل بارد خفيف في الزاوية المقابلة، وتعتيم الأطراف لتركيز النظر
    light = ctx.createLinearGradient(0, 0, E.w, E.h);
    light.addColorStop(0, 'rgba(255,214,150,.16)'); light.addColorStop(.5, 'rgba(255,214,150,0)'); light.addColorStop(1, 'rgba(40,30,90,.14)');
    const r = Math.hypot(E.w, E.h) / 2;
    vignette = ctx.createRadialGradient(E.w / 2, E.h * .48, r * .45, E.w / 2, E.h * .48, r * 1.05);
    vignette.addColorStop(0, 'rgba(30,18,10,0)'); vignette.addColorStop(1, 'rgba(30,18,10,.34)');
  }
  window.addEventListener('resize', resize); resize();
  const z = () => E.zoom * (1 + E.punch * .06);
  E.toWorld = (sx, sy) => ({ x: (sx - E.w / 2) / z() + E.cam.x, y: (sy - E.h / 2) / z() + E.cam.y });
  E.toScreen = (x, y) => { const r = canvas.getBoundingClientRect(); return { x: r.left + (x - E.cam.x) * z() + E.w / 2, y: r.top + (y - E.cam.y) * z() + E.h / 2 }; };   // لفقاعات الكلام فوق الرؤوس
  canvas.addEventListener('pointerdown', e => { if (!E.onTap) return; const r = canvas.getBoundingClientRect(); E.onTap(E.toWorld(e.clientX - r.left, e.clientY - r.top)); });
  const KEYS = { ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right', ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down' };
  window.addEventListener('keydown', e => { const k = KEYS[e.key]; if (k && !(e.target && e.target.tagName === 'INPUT')) { E.keys[k] = true; e.preventDefault(); } });
  window.addEventListener('keyup', e => { const k = KEYS[e.key]; if (k) E.keys[k] = false; });
  E.snap = p => { E.cam.x = p.x; E.cam.y = p.y - 46; E.lead.x = E.lead.y = 0; };
  E.kick = (k = 1) => { E.punch = Math.max(E.punch, k); };            // نبضة تقريب قصيرة عند إنجاز
  E.shake = (k = 1) => { E.quake = Math.max(E.quake, k); };           // اهتزاز خفيف عند صدمة
  let prev = null;
  E.run = (update, render) => {
    E.update = update; E.render = render;
    if (E.running) return; E.running = true;
    let last = performance.now();
    const frame = now => {
      const dt = Math.min(.05, (now - last) / 1000); last = now; E.t += dt;
      try { E.update(dt); } catch (err) { if (!E._errU) { E._errU = 1; console.error('update', err); } }   // خطأ واحد لا يوقف اللعبة
      const tgt = E.focus || E.follow;
      if (tgt) {
        // النظر للأمام: الكاميرا تسبق البطل قليلاً في اتجاه حركته
        if (!E.focus && prev && dt > 0) { const vx = (tgt.x - prev.x) / dt, vy = (tgt.y - prev.y) / dt, k = Math.min(1, dt * 2.2); E.lead.x += (clamp(vx * .32, -70, 70) - E.lead.x) * k; E.lead.y += (clamp(vy * .26, -50, 50) - E.lead.y) * k; }
        prev = { x: tgt.x, y: tgt.y };
        const k = Math.min(1, dt * (E.focus ? 2.4 : 4.5));
        E.cam.x += (tgt.x + (E.focus ? 0 : E.lead.x) - E.cam.x) * k; E.cam.y += (tgt.y - 46 + (E.focus ? 0 : E.lead.y) - E.cam.y) * k;
      }
      E.punch = Math.max(0, E.punch - dt * 2.4); E.quake = Math.max(0, E.quake - dt * 3);
      const Z = z(), hw = E.w / 2 / Z, hh = E.h / 2 / Z;
      E.cam.x = clamp(E.cam.x, hw, Math.max(hw, world.w - hw)); E.cam.y = clamp(E.cam.y, hh, Math.max(hh, world.h - hh));
      const qx = E.quake ? (Math.random() - .5) * 6 * E.quake : 0, qy = E.quake ? (Math.random() - .5) * 6 * E.quake : 0;
      ctx.setTransform(E.dpr, 0, 0, E.dpr, 0, 0); ctx.fillStyle = '#E6CF9E'; ctx.fillRect(0, 0, E.w, E.h);
      ctx.setTransform(E.dpr * Z, 0, 0, E.dpr * Z, E.dpr * (E.w / 2 - E.cam.x * Z + qx), E.dpr * (E.h / 2 - E.cam.y * Z + qy));
      try { E.render(ctx, { x: E.cam.x - hw, y: E.cam.y - hh, w: hw * 2, h: hh * 2 }, E.t); } catch (err) { if (!E._errR) { E._errR = 1; console.error('render', err); } }
      ctx.setTransform(E.dpr, 0, 0, E.dpr, 0, 0);   // طبقة الضوء والتعتيم فوق العالم كله
      ctx.fillStyle = light; ctx.fillRect(0, 0, E.w, E.h); ctx.fillStyle = vignette; ctx.fillRect(0, 0, E.w, E.h);
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };
  return E;
}
