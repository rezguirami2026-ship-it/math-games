// المحرك: حلقة اللعب، الكاميرا، اللمس ولوحة المفاتيح. لا يعرف شيئاً عن القصة أو الرياضيات.
import { clamp } from './util.js';
export function createEngine(canvas, world) {
  const ctx = canvas.getContext('2d');
  const E = { ctx, world, w: 0, h: 0, dpr: 1, zoom: 1, cam: { x: world.w / 2, y: world.h / 2 }, focus: null, follow: null, keys: {}, onTap: null, t: 0, running: false,
    lead: { x: 0, y: 0 }, punch: 0, quake: 0 };
  let light = null, vignette = null, dusk = null, duskVig = null;
  E.mood = 'day';   // 'dusk' لأجواء رمضان: غروب دافئ
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
    // الغروب: ضوء برتقالي دافئ في الأعلى، وبنفسجي هادئ في الأسفل، والعالم يبقى واضحاً للعب
    dusk = ctx.createLinearGradient(0, 0, 0, E.h);
    dusk.addColorStop(0, 'rgba(255,150,70,.20)'); dusk.addColorStop(.55, 'rgba(200,90,90,.10)'); dusk.addColorStop(1, 'rgba(60,40,120,.26)');
    duskVig = ctx.createRadialGradient(E.w / 2, E.h * .48, r * .4, E.w / 2, E.h * .48, r * 1.05);
    duskVig.addColorStop(0, 'rgba(25,15,40,0)'); duskVig.addColorStop(1, 'rgba(25,15,40,.45)');
  }
  window.addEventListener('resize', resize); resize();
  const z = () => E.zoom * (1 + E.punch * .06);
  // E.l3: طبقة العرض ثلاثية الأبعاد إن وُجدت (renderer3d)؛ عندها يمر النقر والإسقاط عبر كاميرتها
  E.toWorld = (sx, sy) => E.l3 ? E.l3.pick(sx, sy) : ({ x: (sx - E.w / 2) / z() + E.cam.x, y: (sy - E.h / 2) / z() + E.cam.y });
  E.toScreen = (x, y, h) => { const r = canvas.getBoundingClientRect(); if (E.l3) { const p = E.l3.project(x, y, h || 0); return { x: r.left + p.x, y: r.top + p.y }; } return { x: r.left + (x - E.cam.x) * z() + E.w / 2, y: r.top + (y - (h || 0) - E.cam.y) * z() + E.h / 2 }; };   // لفقاعات الكلام فوق الرؤوس
  /* اللمس: نقرة = امشِ إلى هناك (كما بالفأرة)، وسحب الإصبع = عصا تحكم افتراضية يمشي البطل باتجاهها ما دام الإصبع على الشاشة */
  const tapAt = (cx, cy) => { if (!E.onTap) return; const r = canvas.getBoundingClientRect(); E.onTap(E.toWorld(cx - r.left, cy - r.top)); };
  const stick = { id: null, x: 0, y: 0, drag: false, n: 0 }, ui = document.createElement('div'); ui.className = 'stick'; ui.innerHTML = '<i></i>'; document.body.appendChild(ui);
  const knob = ui.firstChild, R = 56;
  const stickOff = () => { stick.id = null; stick.drag = false; E.keys.vx = E.keys.vy = 0; ui.classList.remove('on'); };
  canvas.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse') return tapAt(e.clientX, e.clientY);
    stick.n++; if (stick.id !== null || stick.n > 1) { stickOff(); return; }   // إصبعان = تقريب الكاميرا، لا حركة
    stick.id = e.pointerId; stick.x = e.clientX; stick.y = e.clientY; stick.drag = false;
    try { canvas.setPointerCapture(e.pointerId); } catch (er) {}
  });
  canvas.addEventListener('pointermove', e => {
    if (e.pointerId !== stick.id) return;
    let dx = e.clientX - stick.x, dy = e.clientY - stick.y; const d = Math.hypot(dx, dy);
    if (!stick.drag && d > 14) { stick.drag = true; ui.style.left = stick.x + 'px'; ui.style.top = stick.y + 'px'; ui.classList.add('on'); }
    if (!stick.drag) return;
    const k = Math.min(1, d / R); dx /= d || 1; dy /= d || 1;
    E.keys.vx = dx * Math.max(.35, k); E.keys.vy = dy * Math.max(.35, k);
    knob.style.transform = `translate(${dx * k * R}px, ${dy * k * R}px)`;
  });
  const up = e => { if (e.pointerType !== 'mouse') stick.n = Math.max(0, stick.n - 1); if (e.pointerId !== stick.id) return; const wasDrag = stick.drag; stickOff(); if (!wasDrag && e.type === 'pointerup') tapAt(e.clientX, e.clientY); };
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
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
      if (E.l3) {   // ثلاثي الأبعاد: المشهد في canvas خلفي، وهذا الـcanvas شفاف يرسم فوقه الشخصيات وعناصر الدروس
        let v = null; try { v = E.l3.frame(E, E.t, E.state()); } catch (err) { if (!E._err3) { E._err3 = 1; console.error('render3d', err); } }
        ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.setTransform(E.dpr, 0, 0, E.dpr, 0, 0);
        try { E.render(ctx, v || E.l3.view, E.t); } catch (err) { if (!E._errR) { E._errR = 1; console.error('render', err); } }
        requestAnimationFrame(frame); return;
      }
      const qx = E.quake ? (Math.random() - .5) * 6 * E.quake : 0, qy = E.quake ? (Math.random() - .5) * 6 * E.quake : 0;
      ctx.setTransform(E.dpr, 0, 0, E.dpr, 0, 0); ctx.fillStyle = '#E6CF9E'; ctx.fillRect(0, 0, E.w, E.h);
      ctx.setTransform(E.dpr * Z, 0, 0, E.dpr * Z, E.dpr * (E.w / 2 - E.cam.x * Z + qx), E.dpr * (E.h / 2 - E.cam.y * Z + qy));
      try { E.render(ctx, { x: E.cam.x - hw, y: E.cam.y - hh, w: hw * 2, h: hh * 2 }, E.t); } catch (err) { if (!E._errR) { E._errR = 1; console.error('render', err); } }
      ctx.setTransform(E.dpr, 0, 0, E.dpr, 0, 0);   // طبقة الضوء والتعتيم فوق العالم كله
      const dk = E.mood === 'dusk';
      ctx.fillStyle = dk ? dusk : light; ctx.fillRect(0, 0, E.w, E.h); ctx.fillStyle = dk ? duskVig : vignette; ctx.fillRect(0, 0, E.w, E.h);
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };
  return E;
}
