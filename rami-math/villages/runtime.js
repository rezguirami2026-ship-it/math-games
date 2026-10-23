// تشغيل قرية: الحركة (نقر أو أسهم)، الاقتراب من المحطات، الشريط العلوي، والتبديل الحي بين العرضين.
// def من ملف القرية (villages/gN/<القرية>/index.js)، وhooks من التطبيق: onStation(st) يفتح مهمة الدرس، onExit() يعود للخريطة.
import { buildGrid } from './grid.js';
import { createView2D } from './view2d.js';
import { ar } from '../core/util.js';
import { sfx, ambience, musicTick } from '../core/sound.js';

const want3D = () => { try { return localStorage.getItem('ramimath_3d') !== '0' && !/[?&]2d=1/.test(location.search); } catch (e) { return true; } };
const setWant3D = v => { try { localStorage.setItem('ramimath_3d', v ? '1' : '0'); } catch (e) {} };
const quality = () => { try { return localStorage.getItem('ramimath_q') || 'auto'; } catch (e) { return 'auto'; } };

export async function runVillage(root, def, hooks) {
  const grid = buildGrid(def);
  const st = {
    hero: { x: def.start.x, y: def.start.y, dir: 'down', dir2d: 'down', phase: 0, moving: false, anim: null, animT: 0 },
    look: hooks.look(), goal: null, dest: null, path: [], busy: false
  };
  if (hooks.pos && !grid.blocked(hooks.pos.x, hooks.pos.y)) { st.hero.x = hooks.pos.x; st.hero.y = hooks.pos.y; }
  if (def.blockers) def.blockers(grid, hooks);   // أبواب وعوائق تتبع التقدّم

  root.innerHTML = `<canvas class="vcv"></canvas>
    <div class="vtop"><button class="vbtn" data-a="map" aria-label="خريطة القرى">🗺️</button>
      <div class="vtitle"><b>${def.icon} ${def.name}</b><small>${def.unitTitle}</small><div class="vdots"></div></div>
      <div class="vpill" data-gems>💎 <b>٠</b></div>
      <button class="vbtn" data-a="view" aria-label="تبديل العرض"></button></div>
    <div class="vobj"></div>
    <div class="vzoom"><button class="vbtn" data-z="1" aria-label="تقريب">＋</button><button class="vbtn" data-z="-1" aria-label="تبعيد">－</button></div>
    <div class="vact"></div>`;
  const $ = s => root.querySelector(s);
  let view = null, is3D = false, alive = true, raf = 0;
  async function setView(three) {
    const z = view ? view.zoomV : 1;
    if (view) view.dispose();
    const old = root.querySelector('.vcv'), fresh = document.createElement('canvas'); fresh.className = 'vcv'; old.replaceWith(fresh);   // لوحة جديدة: سياق 2D وWebGL لا يجتمعان على لوحة واحدة
    view = null; is3D = false;
    if (three) {
      try {
        const m = await import('./view3d.js');
        if (m.webglOK()) { const q = quality(); view = m.createView3D(fresh, grid, def, { quality: q === 'low' ? 'low' : 'high' }); is3D = true; }
      } catch (e) { console.error('[قرية الخير] تعذّر العرض ثلاثي الأبعاد للقرية، نرجع للعادي', e); }
    }
    if (!view) view = createView2D(fresh, grid, def);
    view.zoom(z); bindInput(fresh);
    $('[data-a=view]').textContent = is3D ? '🧊 مجسّم' : '🗺️ عادي';
    $('[data-a=view]').title = is3D ? 'العرض ثلاثي الأبعاد — اضغط للعرض العادي' : 'العرض العادي — اضغط للعرض ثلاثي الأبعاد';
  }
  // ── الإدخال: نقرة تمشي إلى المكان (أو المحطة)، والأسهم تمشي مباشرة، والعجلة/الأزرار للتقريب
  const keys = {};
  const onKey = e => { const k = { ArrowLeft: 'l', ArrowRight: 'r', ArrowUp: 'u', ArrowDown: 'd', a: 'l', d: 'r', w: 'u', s: 'd' }[e.key]; if (!k || st.busy) return; keys[k] = e.type === 'keydown'; if (e.type === 'keydown') { st.path = []; e.preventDefault(); } };
  addEventListener('keydown', onKey); addEventListener('keyup', onKey);
  function bindInput(c) {
    c.addEventListener('pointerup', e => {
      if (st.busy || !alive) return;
      const p = view.pick(e.clientX, e.clientY); if (!p) return;
      const s = (def.stations || []).find(s => Math.hypot(s.x - p.x, s.y - p.y) < .9);   // نقرة على محطة: نمشي إلى جانبها
      const to = s ? stand(s) : p, path = grid.findPath(st.hero, to);
      if (!path.length) return;
      st.path = path; st.dest = { x: to.x, y: to.y, k: 1 }; st.arrive = s || null; sfx('pick');
    });
    c.addEventListener('wheel', e => { e.preventDefault(); view.zoom(view.zoomV * (e.deltaY < 0 ? 1.1 : .9)); }, { passive: false });
  }
  const stand = s => { const a = s.stand || { x: s.x, y: s.y + 1 }; return grid.blocked(a.x, a.y) ? { x: s.x + .5, y: s.y + 1.2 } : a; };
  root.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.z) view.zoom(view.zoomV * (b.dataset.z === '1' ? 1.15 : .87));
    if (b.dataset.a === 'view') { setWant3D(!is3D); setView(!is3D); }
    if (b.dataset.a === 'map' && !st.busy) exit();
    if (b.dataset.go && !st.busy) { const s = (def.stations || []).find(s => s.id === b.dataset.go); if (s) openStation(s); }
  });
  const onResize = () => view && view.resize(); addEventListener('resize', onResize);

  async function openStation(s) {
    st.busy = true; st.path = []; act(null);
    try { await hooks.onStation(s, api); } catch (e) { console.error('[قرية الخير] محطة', s.id, e); }
    st.busy = false; refresh();
  }
  // ── الحالة الظاهرة: الدرس الحالي، النقاط، وزر المحطة القريبة
  let actKey = '';
  function act(s) {
    const k = s ? s.id : ''; if (k === actKey) return; actKey = k;
    $('.vact').innerHTML = s ? `<button class="vgo" data-go="${s.id}">${s.icon || '▶'} ${s.label}</button>` : '';
  }
  function refresh() {
    const info = hooks.progress();
    st.goal = info.goal; st.look = hooks.look(); st.doneIds = Object.fromEntries(info.lessons.filter(l => l.done).map(l => [l.id, 1]));
    $('.vdots').innerHTML = info.lessons.map(l => `<i class="${l.done ? 'on' : l.id === info.goal ? 'cur' : ''}" title="${l.title}"></i>`).join('');
    $('.vobj').innerHTML = info.text || '';
    $('[data-gems] b').textContent = ar(info.gems);
  }
  const api = { st, grid, refresh, open: id => { const s = (def.stations || []).find(s => s.id === id); if (s && !st.busy) openStation(s); }, talk: (who, lines) => hooks.talk(who, lines, (x, y, h) => view.project(x, y, h)), get view() { return view; }, sfx };

  // ── حلقة اللعب
  let last = performance.now(), saveT = 0;
  function loop(now) {
    if (!alive) return;
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    const h = st.hero; let mx = 0, my = 0;
    if (!st.busy) {
      // الأسهم بالنسبة للشاشة (الكاميرا مائلة ٤٥°): اليمين على الشاشة = +س −ص في الشبكة
      const kx = (keys.r ? 1 : 0) - (keys.l ? 1 : 0), ky = (keys.d ? 1 : 0) - (keys.u ? 1 : 0);
      if (kx || ky) { mx = kx + ky; my = ky - kx; const n = Math.hypot(mx, my); mx /= n; my /= n; }
      else if (st.path.length) {
        const p = st.path[0], dx = p.x - h.x, dy = p.y - h.y, d = Math.hypot(dx, dy);
        if (d < .08) { st.path.shift(); if (!st.path.length && st.arrive) { const s = st.arrive; st.arrive = null; if (s.id === st.goal || hooks.canOpen(s)) openStation(s); } }
        else { mx = dx / d; my = dy / d; }
      }
    }
    const sp = 3.1 * dt; let moved = 0;
    if (mx || my) {
      const nx = h.x + mx * sp, ny = h.y + my * sp;
      if (!grid.blocked(nx, ny)) { h.x = nx; h.y = ny; moved = sp; }
      else if (!grid.blocked(nx, h.y)) { h.x = nx; moved = sp * Math.abs(mx); }
      else if (!grid.blocked(h.x, ny)) { h.y = ny; moved = sp * Math.abs(my); }
      else st.path = [];
      // اتجاه الرسم العادي من اتجاه الحركة على الشاشة
      const sx = mx - my, sy = mx + my;
      h.dir2d = Math.abs(sx) > Math.abs(sy) * .8 ? (sx > 0 ? 'right' : 'left') : (sy > 0 ? 'down' : 'up');
    }
    h.moving = moved > .001; h.phase += moved * 48 * .17;
    if (st.dest) { st.dest.k -= dt * 1.4; if (st.dest.k <= 0) st.dest = null; }
    // زر المحطة القريبة
    const near = !st.busy && (def.stations || []).find(s => Math.hypot(s.x - h.x, s.y - h.y) < 1.7 && (s.id === st.goal || hooks.canOpen(s)));
    act(near || null);
    if (def.update) def.update(dt, st, api);
    try { view.frame(st); } catch (e) { console.error('[قرية الخير] رسم القرية', e); }
    ambience(def.ambience || 'village', dt); musicTick(def.music || 'village');
    if ((saveT += dt) > 3) { saveT = 0; hooks.savePos({ x: h.x, y: h.y }); }
    raf = requestAnimationFrame(loop);
  }
  function exit() {
    alive = false; cancelAnimationFrame(raf); hooks.savePos({ x: st.hero.x, y: st.hero.y });
    removeEventListener('keydown', onKey); removeEventListener('keyup', onKey); removeEventListener('resize', onResize);
    if (view) view.dispose(); root.innerHTML = ''; hooks.onExit();
  }
  await setView(want3D());
  refresh();
  raf = requestAnimationFrame(loop);
  if (def.enter) def.enter(api, hooks);
  return api;
}
