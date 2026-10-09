// محرّك المغامرات: عالم مستقل من بلاطات يُستكشف بالمشي (نقر/أسهم)، شخصيات وحوارات، أدوات، ألغاز (رافعات، صناديق على
// ألواح ضغط، أبواب وأقفال، شجيرات تُقص وصخور تُكسر)، حراس بمخروط رؤية (إن رآك تعود بهدوء لآخر نقطة آمنة — لا عقاب ولا مؤقت)،
// ظلام وأضواء، نجوم مخفية، وحفظ كامل للتقدّم. القصص بيانات + سكربتات صغيرة في adventure/stories/*.
import { T, THEMES, SOLID_TILES, drawTile, drawSoft, drawWaterFx, drawTree, drawThing, drawCone } from './art.js';
import { drawHuman } from '../character/human.js';
import { heroLookWorn } from '../ui/wardrobe.js';
import { game } from '../core/state.js';
import { bus } from '../core/events.js';
import { sfx, thunder } from '../core/sound.js';
import { ar } from '../core/util.js';
import { createAdv3D } from './render3d.js';
import { gfx, WEAK } from '../ui/hud.js';
import { webglOK } from '../renderer3d/index.js';

const SOLID_KINDS = new Set(['npc', 'chest', 'block', 'gate', 'door', 'sign', 'fire', 'beacon', 'cage', 'tent', 'crates', 'barrel', 'boat', 'well', 'lever', 'banner', 'house', 'rot', 'tablet', 'crystal', 'beam', 'fence', 'pillar']);
const ACT_KINDS = new Set(['npc', 'chest', 'lever', 'sign', 'door', 'gate', 'cage', 'beacon', 'boat', 'fire', 'safe', 'block', 'well', 'tent', 'banner', 'house', 'rot', 'tablet', 'crystal', 'animal', 'pillar', 'site', 'beam']);
const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const wait = ms => new Promise(r => setTimeout(r, ms));

export const advRec = id => { const s = game.state; s.adventures = s.adventures || {}; return (s.adventures[id] = s.adventures[id] || { done: false, plays: 0, best: 0, st: null }); };

export function runAdventure(def, onExit) {
  const R = advRec(def.id), S = R.st || (R.st = fresh()); S.tiles = S.tiles || {};
  function fresh() { return { area: def.start.area, x: def.start.x, y: def.start.y, flags: {}, inv: {}, ent: {}, cut: {}, tiles: {}, cp: { ...def.start }, stars: 0 }; }

  /* ── واجهة DOM ── */
  const root = document.createElement('div'); root.className = 'adv'; root.innerHTML = `
    <canvas class="advCv"></canvas><canvas class="advCv3" hidden></canvas><div class="advFade"></div><div class="advFlash"></div>
    <div class="advTop"><button class="advBtn advX" title="حفظ والخروج">✖</button>
      <div class="advTitle"><b>${esc(def.icon)} ${esc(def.title)}</b><span class="advGoal"></span></div>
      <div class="advStars">⭐ <b>٠</b>/${ar(def.stars || 0)}</div><button class="advBtn advLogB" title="سجل المهام">📜</button><button class="advBtn advHintB" title="تلميح">💡</button></div><div class="advLog" hidden></div>
    <div class="advInv"></div><button class="advAct" hidden>✋</button><div class="advToast"></div><div class="advWind" hidden></div>
    <div class="advDlg dialog caption"><canvas class="advFace" width="120" height="120"></canvas><div class="dbody"><b class="advWho"></b><p class="advTxt"></p><div class="advOpts"></div></div><span class="dnext">◀</span></div>`;
  document.body.appendChild(root);
  const cv = root.querySelector('.advCv'), ctx = cv.getContext('2d'), $ = s => root.querySelector(s);
  let r3 = null;   // العرض ثلاثي الأبعاد هو الافتراضي، والرسم ثنائي الأبعاد احتياط للأجهزة الضعيفة أو بلا WebGL
  try { if (webglOK() && !WEAK && gfx.d3()) { r3 = createAdv3D($('.advCv3')); $('.advCv3').hidden = false; cv.hidden = true; } } catch (e) { console.warn('[adv3d]', e); r3 = null; }
  let W = 0, H = 0, dpr = 1, Z = 1;
  function resize() { dpr = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
    Z = Math.max(.62, Math.min(1.5, Math.min(W / ((W < H ? 9 : 15) * T), H / ((W < H ? 13 : 10) * T)))); if (r3) r3.resize(W, H); }
  resize(); addEventListener('resize', resize);
  game.busy = true; bus.emit('pauseWorld', true);

  /* ── العالم الحالي ── */
  let area, map, ents, cam = { x: 0, y: 0 }, t = 0, fade = 0, locked = false, caught = null, done = false;
  const P = { x: S.x + .5, y: S.y + .5, dir: 'down', moving: false, phase: 0, path: null, onArrive: null, push: 0 };
  const key = (a, x, y) => a + ':' + x + ',' + y;
  function load(aId, x, y) {
    area = def.areas[aId]; S.area = aId; map = area.map.map(r => r.padEnd(area.map[0].length, '#'));
    ents = area.ents.map(e => { const o = Object.assign({}, e, S.ent[aId + ':' + e.id] || {}); if (o.kind === 'guard' || o.kind === 'hazard') { o.px = o.path[0][0]; o.py = o.path[0][1]; o.wp = 1 % o.path.length; o.ang = o.ang0 || 0; o.pause = 0; } if (o.follow) { o.fx = o.x + .5; o.fy = o.y + .5; } return o; });
    trail.length = 0;
    if (x != null) { P.x = x + .5; P.y = y + .5; } P.path = null; cam.x = P.x * T; cam.y = P.y * T;
    if (P.onArrive) { const f = P.onArrive; P.onArrive = null; f(); }   // انتقال لمنطقة أخرى أثناء المشي: الوصول تمّ
    if (area.enter) setTimeout(() => area.enter(A), 50);
  }
  const save = () => { S.x = Math.floor(P.x); S.y = Math.floor(P.y); bus.emit('save'); };
  const persist = (e, k) => { const s = (S.ent[S.area + ':' + e.id] = S.ent[S.area + ':' + e.id] || {}); k.forEach(f => { s[f] = e[f]; }); };
  const tileAt = (x, y) => { if (y < 0 || y >= map.length || x < 0 || x >= map[0].length) return '#'; const k = key(S.area, x, y), o = S.tiles[k]; if (o) return o; return S.cut[k] ? '.' : map[y][x]; };
  const entAt = (x, y, skip) => ents.find(e => e !== skip && !e.hidden && !e.got && footprint(e, x, y) && solidEnt(e)) || ents.find(e => e !== skip && !e.hidden && !e.got && footprint(e, x, y));
  const RANK = { npc: 0, house: 3, cage: 2 };   // عند التداخل: الشخص أولاً، ثم الباب/الرافعة، ثم المبنى
  const actAt = (x, y) => ents.filter(e => !e.hidden && !e.got && ACT_KINDS.has(e.kind) && footprint(e, x, y)).sort((a, b) => (RANK[a.kind] ?? 1) - (RANK[b.kind] ?? 1))[0];
  function footprint(e, x, y) {
    if (e.kind === 'house') return x >= e.x && x < e.x + (e.w || 3) && y <= e.y && y > e.y - (e.h || 2);
    if (e.kind === 'block') return x === e.x && y === e.y;
    return x === e.x && y === e.y;
  }
  const solidEnt = e => e && SOLID_KINDS.has(e.kind) && !e.follow && !((e.kind === 'gate' || e.kind === 'door' || e.kind === 'cage') && e.open);
  const blocked = (x, y, skip) => SOLID_TILES.has(tileAt(x, y)) || solidEnt(entAt(x, y, skip));
  const solidAt = (fx, fy) => blocked(Math.floor(fx), Math.floor(fy));

  /* ── واجهة السكربت ── */
  const items = def.items || {};
  const A = {
    def, S, get area() { return S.area; },
    flag: (k, v) => { if (v !== undefined) { S.flags[k] = v; goal(); save(); } return S.flags[k]; },
    has: (k, n = 1) => (S.inv[k] || 0) >= n, count: k => S.inv[k] || 0,
    give: (k, n = 1, quiet) => { S.inv[k] = (S.inv[k] || 0) + n; inv(); if (!quiet) toast(`${items[k] ? items[k].icon : '🎁'} حصلتَ على ${items[k] ? items[k].name : k}`); sfx('pick'); goal(); save(); },
    take: (k, n = 1) => { S.inv[k] = Math.max(0, (S.inv[k] || 0) - n); if (!S.inv[k]) delete S.inv[k]; inv(); save(); },
    itemIcon: k => items[k] ? items[k].icon : '🎁', symbols: def.symbols,
    ent: id => ents.find(e => e.id === id),
    set: (id, props) => { const e = A.ent(id); if (e) { Object.assign(e, props); persist(e, Object.keys(props)); } goal(); save(); },
    hide: id => A.set(id, { hidden: true }), show: id => A.set(id, { hidden: false }),
    pressed: e => !!ents.find(o => o.kind === 'block' && o.x === e.x && o.y === e.y) || (Math.floor(P.x) === e.x && Math.floor(P.y) === e.y),
    say, choose, toast, sfx, goal, save,
    shake: (k = 1) => { shakeK = Math.max(shakeK, k); },
    sparkle: (x, y, col) => burst(x * T + T / 2, y * T + T / 2, 16, col),
    cut: (x, y) => { S.cut[key(S.area, x, y)] = 1; burst(x * T + T / 2, y * T + T / 2, 14, '#7CC36B'); save(); },
    checkpoint: (x, y) => { S.cp = { area: S.area, x, y }; save(); },
    goto: async (aId, x, y) => { locked = true; await fadeTo(1); save(); load(aId, x, y); S.cp = { area: aId, x, y }; save(); await fadeTo(0); locked = false; goal(); },
    walkTo: (x, y) => new Promise(r => { P.path = route(x, y); P.onArrive = r; if (!P.path) r(); }),
    complete: () => finish(),
    hero: () => ({ x: Math.floor(P.x), y: Math.floor(P.y) }),
    star: () => { S.stars++; stars(); },
    // للاختبار الآلي: المشي إلى بلاطة أو إلى شيء والتفاعل معه
    goTile: (x, y) => new Promise(r => { P.path = route(x, y); if (!P.path) return r(false); if (!P.path.length) return r(true); P.onArrive = () => r(true); }),
    use: id => new Promise(r => { const e = A.ent(id); if (!e) return r(false); const ex = e.kind === 'house' ? e.x + Math.floor((e.w || 3) / 2) : e.x;
      const go = async () => { await interact(e); r(true); }; if (Math.abs(ex - Math.floor(P.x)) + Math.abs(e.y - Math.floor(P.y)) === 1) return go(); P.path = route(ex, e.y, true); if (!P.path) return r(false); P.onArrive = go; }),
    tp: (x, y) => { P.x = x + .5; P.y = y + .5; P.path = null; },
    tapTile: (x, y) => tapTile(x, y),
    tapEnt: id => { const e = A.ent(id); if (e) tapTile(e.kind === 'house' ? e.x + Math.floor((e.w || 3) / 2) : e.x, e.y); },   // كما ينقر اللاعب على الشيء
    busy: () => locked || !!caught || !!(P.path && P.path.length) || pushing,
    tileAt: (x, y) => tileAt(x, y),
    setTile: (x, y, ch) => { S.tiles[key(S.area, x, y)] = ch; tilesV++; save(); },
    follow: id => { const e = A.ent(id); if (!e) return; e.follow = true; e.fx = e.x + .5; e.fy = e.y + .5; persist(e, ['follow']); },
    unfollow: (id, x, y) => { const e = A.ent(id); if (!e) return; e.follow = false; if (x != null) { e.x = x; e.y = y; } e.fx = e.fy = null; persist(e, ['follow', 'x', 'y']); },
    near: (id, x0, y0, x1, y1) => { const e = A.ent(id); if (!e) return false; const ex = e.follow ? Math.floor(e.fx) : e.x, ey = e.follow ? Math.floor(e.fy) : e.y; return ex >= x0 && ex <= x1 && ey >= y0 && ey <= y1; },
    heroIn: (x0, y0, x1, y1) => { const x = Math.floor(P.x), y = Math.floor(P.y); return x >= x0 && x <= x1 && y >= y0 && y <= y1; },
    weather: w => { S.flags.weather = Object.assign({}, S.flags.weather || {}, w); save(); },
    beams: () => beams
  };
  let tilesV = 0;
  const trail = [];
  /* ── شعاع الضوء: ينطلق من مصدر، وتعكسه المرايا (rot بنمط mirror)، ويُضيء البلّورة التي يصلها ── */
  let beams = [];
  function traceBeams() {
    beams = []; ents.forEach(c => { if (c.kind === 'crystal') c.lit = false; });
    ents.filter(e => e.kind === 'beam' && !e.hidden && (!e.when || e.when(A))).forEach(src => {
      let x = src.x, y = src.y, d = src.dir || 0; const pts = [[x, y]];
      for (let i = 0; i < 60; i++) {
        x += [1, 0, -1, 0][d]; y += [0, 1, 0, -1][d];
        const m = ents.find(e => e.x === x && e.y === y && !e.hidden && (e.kind === 'rot' && e.style === 'mirror' || e.kind === 'crystal'));
        if (m && m.kind === 'crystal') { pts.push([x, y]); m.lit = true; break; }
        if (m) { pts.push([x, y]); d = (m.r % 2 === 0) ? [3, 2, 1, 0][d] : [1, 0, 3, 2][d]; continue; }
        if (SOLID_TILES.has(tileAt(x, y)) || solidEnt(entAt(x, y))) { pts.push([x - [1, 0, -1, 0][d] * .5, y - [0, 1, 0, -1][d] * .5]); break; }
      }
      if (pts.length === 1) pts.push([x, y]);
      pts.color = src.color; beams.push(pts);
    });
  }

  /* ── الحوار ── */
  const dlg = $('.advDlg'), face = $('.advFace'), fctx = face.getContext('2d');
  function drawFace(who) {
    fctx.setTransform(1, 0, 0, 1, 0, 0); fctx.clearRect(0, 0, 120, 120);
    const c = who === 'hero' ? heroLookWorn(game.state) : def.cast[who] && def.cast[who].look;
    face.hidden = !c; if (!c) return;
    fctx.setTransform(2.2, 0, 0, 2.2, 60, 192); drawHuman(fctx, Object.assign({}, c, { x: 0, y: 0, dir: 'down', anim: 'talk', animT: (t * 2) % 1 }));
  }
  function showLine(L) {
    const who = L.who || 'narrator', name = who === 'hero' ? game.state.hero.name : who === 'narrator' ? '' : (def.cast[who] || {}).name || '';
    $('.advWho').textContent = name; $('.advWho').hidden = !name; $('.advTxt').textContent = L.text; dlg.classList.toggle('narr', !name); drawFace(who); sfx('talk');
  }
  function say(lines) {
    return new Promise(res => {
      if (!lines || !lines.length) return res(); let i = 0; locked = true; dlg.classList.add('on'); $('.advOpts').innerHTML = ''; showLine(lines[0]);
      const next = e => { e.stopPropagation(); i++; if (i >= lines.length) { dlg.classList.remove('on'); dlg.onclick = null; locked = false; res(); } else showLine(lines[i]); };
      setTimeout(() => { dlg.onclick = next; }, 250);
    });
  }
  function choose(text, opts, who) {
    return new Promise(res => {
      locked = true; dlg.classList.add('on'); showLine({ who, text }); dlg.onclick = null;
      $('.advOpts').innerHTML = opts.map((o, i) => `<button class="act ghost" data-o="${i}">${esc(o)}</button>`).join('');
      $('.advOpts').querySelectorAll('[data-o]').forEach(b => b.onclick = e => { e.stopPropagation(); dlg.classList.remove('on'); $('.advOpts').innerHTML = ''; locked = false; res(+b.dataset.o); });
    });
  }
  let toastT = 0; function toast(msg) { const el = $('.advToast'); el.textContent = msg; el.classList.remove('on'); void el.offsetWidth; el.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('on'), 2600); }
  function inv() { $('.advInv').innerHTML = Object.keys(S.inv).map(k => `<span title="${esc(items[k] ? items[k].name : k)}">${items[k] ? items[k].icon : '🎁'}${S.inv[k] > 1 ? `<i>${ar(S.inv[k])}</i>` : ''}</span>`).join(''); }
  function stars() { $('.advStars b').textContent = ar(S.stars); }
  function goal() { const g = (def.goals || []).find(g => !g.done(A)); $('.advGoal').textContent = g ? '🎯 ' + g.text : '🎉 أكملتَ المغامرة!'; return g; }
  /* موضع هدف المهمة الحالية: في هذه المنطقة، أو المخرج المؤدي إلى منطقته */
  function goalAt() {
    const g = goal(); if (!g || !g.at) return null; const a = g.at(A); if (!a) return null;
    const ar2 = a.area || S.area; if (ar2 !== S.area) { const ex = ents.find(e => e.kind === 'exit' && e.to === ar2); return ex ? { x: ex.x, y: ex.y } : null; }
    if (a.id) { const e = A.ent(a.id); return e && !e.hidden ? { x: e.kind === 'house' ? e.x + Math.floor((e.w || 3) / 2) : e.x, y: e.y } : null; }
    return { x: a.x, y: a.y };
  }
  const fadeTo = v => new Promise(r => { const el = $('.advFade'); el.style.opacity = v; setTimeout(r, 380); });

  /* ── المسار (بحث عرضي على البلاطات) ── */
  function route(tx, ty, near) {
    const sx = Math.floor(P.x), sy = Math.floor(P.y), Wd = map[0].length, prev = new Map(), q = [[sx, sy]]; prev.set(sx + ',' + sy, null);
    const goal2 = (x, y) => near ? Math.abs(x - tx) + Math.abs(y - ty) === 1 : x === tx && y === ty;
    while (q.length) { const [x, y] = q.shift(); if (goal2(x, y)) { const p = []; let k = x + ',' + y; while (k) { const [a, b] = k.split(',').map(Number); p.unshift([a, b]); k = prev.get(k); } p.shift(); return p; }
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (prev.has(k) || nx < 0 || ny < 0 || nx >= Wd || ny >= map.length || blocked(nx, ny)) continue; prev.set(k, x + ',' + y); q.push([nx, ny]); } }
    return null;
  }

  /* ── التفاعل ── */
  async function interact(e) {
    if (!e || locked) return; const h0 = e.kind === 'house' ? e.x + Math.floor((e.w || 3) / 2) : e.x; const fx = h0 - Math.floor(P.x), fy = e.y - Math.floor(P.y);
    if (Math.abs(fx) >= Math.abs(fy)) P.dir = fx > 0 ? 'right' : 'left'; else P.dir = fy > 0 ? 'down' : 'up';
    if (e.kind === 'block') return e.to ? smartPush(e) : pushBlock(e, Math.sign(fx) * (Math.abs(fx) >= Math.abs(fy)), Math.sign(fy) * (Math.abs(fy) > Math.abs(fx)));
    const h = e.on_ || (area.on && area.on[e.id]);
    if (h) { locked = false; await h(A, e); return; }
    if (e.kind === 'sign' && e.text) return say([{ who: 'narrator', text: e.text }]);
    if (e.kind === 'lever') { A.set(e.id, { on: !e.on }); sfx('click'); if (area.onLever) area.onLever(A, e); return; }
    if (e.kind === 'rot') { A.set(e.id, { r: ((e.r || 0) + 1) % 4 }); sfx('click'); A.shake(.15); if (area.onRotate) area.onRotate(A, e); return; }
    if (e.kind === 'tablet') { const n = (def.symbols || ['🌙', '☀️', '⭐', '🌴']).length; A.set(e.id, { sym: ((e.sym || 0) + 1) % n }); sfx('click'); if (area.onTablet) area.onTablet(A, e); return; }
    if (e.kind === 'chest' && !e.open) { A.set(e.id, { open: true }); sfx('win'); if (e.item) A.give(e.item, e.n || 1); return; }
    if ((e.kind === 'door' || e.kind === 'gate') && !e.open) {
      if (e.needs && A.has(e.needs)) { if (e.consume) A.take(e.needs); A.set(e.id, { open: true }); sfx('gate'); toast(`🔓 فُتح ${e.name || 'الباب'}`); return; }
      return say([{ who: 'narrator', text: e.locked || 'مقفل… لا بد من طريقة لفتحه.' }]);
    }
  }
  /* صندوق له لوحة هدف: يمشي البطل خلفه ويدفعه خطوة بعد خطوة حتى يستقر عليها (ضغطة واحدة تكفي) */
  async function smartPush(b) {
    const pl = A.ent(b.to); if (!pl || pushing) return; pushing = true;
    try {
      for (let i = 0; i < 12 && !(b.x === pl.x && b.y === pl.y); i++) {
        const dx = Math.sign(pl.x - b.x), dy = dx ? 0 : Math.sign(pl.y - b.y), sx = b.x - dx, sy = b.y - dy;
        if (Math.floor(P.x) !== sx || Math.floor(P.y) !== sy) { const ok = await A.goTile(sx, sy); if (!ok || Math.floor(P.x) !== sx || Math.floor(P.y) !== sy) { toast('🚧 لا أستطيع الوقوف خلف الصندوق من هنا'); return; } }
        P.dir = dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up'; await wait(160);
        if (!pushBlock(b, dx, dy)) return; await wait(300);
      }
    } finally { pushing = false; }
  }
  let pushing = false;
  function pushBlock(b, dx, dy) {
    const nx = b.x + dx, ny = b.y + dy;
    if (!dx && !dy) return false;
    if (blocked(nx, ny, b) || ents.find(o => o.kind === 'block' && o.x === nx && o.y === ny)) { toast('🧱 لا يتحرك من هذه الجهة'); return false; }
    b.px = b.x; b.py = b.y; b.x = nx; b.y = ny; persist(b, ['x', 'y']); sfx('drop'); A.shake(.3); save(); goal();
    const pl = b.to && A.ent(b.to); if (pl && b.x === pl.x && b.y === pl.y) { burst(pl.x * T + T / 2, pl.y * T + T / 2, 18, '#FFD54A'); toast('✨ الصندوق على اللوحة!'); }
    return true;
  }
  function tapTo(sx, sy) {
    if (locked || caught) return;
    let wx = (sx - W / 2) / Z + cam.x, wy = (sy - H / 2) / Z + cam.y;
    if (r3) { const p = r3.pick(sx, sy); if (!p) return; wx = p.x; wy = p.y; }
    tapTile(Math.floor(wx / T), Math.floor(wy / T));
  }
  function tapTile(tx, ty) {   // نقرة على بلاطة (من الشاشة أو من الاختبار)
    if (locked || caught) return;
    const e = actAt(tx, ty) || actAt(tx, ty + 1);
    if (e) {
      const ex = e.kind === 'house' ? e.x + Math.floor((e.w || 3) / 2) : e.x, ey = e.y;
      if (Math.abs(ex - Math.floor(P.x)) + Math.abs(ey - Math.floor(P.y)) === 1) return interact(e);
      P.path = route(ex, ey, true); P.onArrive = () => interact(e); if (!P.path) toast('🚧 لا طريق إلى هناك الآن');
      mark = { x: ex, y: ey, t: 0 }; return;
    }
    if (blocked(tx, ty) && area.onSolid && (tileAt(tx, ty) === '"' || tileAt(tx, ty) === 'R')) {
      const act = () => area.onSolid(A, tx, ty, tileAt(tx, ty)); mark = { x: tx, y: ty, t: 0 };   // شوك أو صخرة: نمشي بجانبها ثم نستعمل الأداة
      if (Math.abs(tx - Math.floor(P.x)) + Math.abs(ty - Math.floor(P.y)) === 1) return act();
      P.path = route(tx, ty, true); P.onArrive = act; if (!P.path) toast('🚧 لا طريق إلى هناك الآن'); return;
    }
    if (blocked(tx, ty)) { const h = area.onSolid && area.onSolid(A, tx, ty, tileAt(tx, ty)); if (!h) toast(tileAt(tx, ty) === '"' ? '🌿 شجيرة شوك كثيفة… تحتاج أداة لقصّها' : tileAt(tx, ty) === 'R' ? '🪨 صخرة متشققة… تحتاج أداة لكسرها' : '🚧 لا يمكن المرور'); return; }
    P.path = route(tx, ty); P.onArrive = null; mark = { x: tx, y: ty, t: 0 }; if (!P.path) toast('🚧 لا طريق إلى هناك الآن');
  }
  let mark = null, userZoom = 1, pinch = 0, cine = S.flags._intro ? 1 : 0;   // تقريب/إبعاد الكاميرا: العجلة أو إصبعان
  cv.parentNode.addEventListener('wheel', e => { userZoom = Math.min(1.6, Math.max(.65, userZoom * (e.deltaY > 0 ? 1.08 : 1 / 1.08))); }, { passive: true });
  cv.parentNode.addEventListener('touchmove', e => { if (e.touches.length !== 2) { pinch = 0; return; } const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); if (pinch) userZoom = Math.min(1.6, Math.max(.65, userZoom * pinch / d)); pinch = d; }, { passive: true });
  [cv, $('.advCv3')].forEach(c => c.addEventListener('pointerdown', e => { e.preventDefault(); if (e.isPrimary !== false) tapTo(e.clientX, e.clientY); }));
  const keys = {};
  const kd = e => { if (!root.isConnected) return; keys[e.key] = true; if (e.key === ' ' || e.key === 'Enter' || e.key === 'e') { e.preventDefault(); if (dlg.classList.contains('on')) { if (dlg.onclick) dlg.onclick(e); } else doFront(); } if (e.key.startsWith('Arrow')) e.preventDefault(); };
  const ku = e => { keys[e.key] = false; };
  addEventListener('keydown', kd); addEventListener('keyup', ku);
  function front() { const x = Math.floor(P.x), y = Math.floor(P.y), d = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[P.dir];
    return actAt(x + d[0], y + d[1]) || [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([a, b]) => actAt(x + a, y + b)).find(Boolean); }
  const frontTile = () => { const d = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[P.dir], x = Math.floor(P.x) + d[0], y = Math.floor(P.y) + d[1], ch = tileAt(x, y); return (ch === '"' || ch === 'R') ? { x, y, ch } : null; };
  const doFront = () => { const f = front(); if (f) return interact(f); const ft = frontTile(); if (ft && area.onSolid) area.onSolid(A, ft.x, ft.y, ft.ch); };
  $('.advAct').onclick = e => { e.stopPropagation(); doFront(); };
  $('.advX').onclick = e => { e.stopPropagation(); exit(); };
  $('.advLogB').onclick = e => { e.stopPropagation(); const L = $('.advLog'); if (!L.hidden) { L.hidden = true; return; } const cur = goal();
    L.innerHTML = `<b>📜 مهام المغامرة</b>${(def.goals || []).map(g => { const d = g.done(A); return `<div class="${d ? 'ok' : g === cur ? 'now' : 'next'}"><i>${d ? '✅' : g === cur ? '🎯' : '⬜'}</i><span>${esc(g.text)}</span></div>`; }).join('')}<small>اضغط 📜 للإغلاق</small>`;
    L.hidden = false; L.onclick = ev => { ev.stopPropagation(); L.hidden = true; }; };
  $('.advHintB').onclick = e => { e.stopPropagation(); const g = goal(); say([{ who: 'narrator', text: '💡 ' + (g && g.hint ? g.hint : 'استكشف المكان وتحدّث مع الجميع.') }]); };

  /* ── الحراس: دورية ومخروط رؤية؛ إن رأوك تعود لآخر نقطة آمنة ── */
  function sees(g) {
    if (S.flags.invisible) return false;
    const dx = P.x - (g.px + .5), dy = P.y - (g.py + .5), d = Math.hypot(dx, dy); if (d > (g.range || 4)) return false;
    let da = Math.atan2(dy, dx) - g.ang; da = Math.atan2(Math.sin(da), Math.cos(da)); if (Math.abs(da) > (g.fov || .5)) return false;
    if (tileAt(Math.floor(P.x), Math.floor(P.y)) === ';') return false;   // مختبئ في العشب الطويل
    for (let k = .4; k < d; k += .25) { const x = Math.floor(g.px + .5 + dx / d * k), y = Math.floor(g.py + .5 + dy / d * k); if (SOLID_TILES.has(tileAt(x, y)) || solidEnt(entAt(x, y))) return false; }
    return true;
  }
  function touches(h) { return !S.flags.invisible && !h.hidden && Math.hypot(P.x - (h.px + .5), P.y - (h.py + .5)) < (h.r || .62); }
  function updGuard(g, dt) {
    if (g.hidden) return;
    if (g.spin) { g.ang += g.spin * dt; return; }   // زعيم/حارس ثابت يدير نظره
    if (g.path.length < 2) return;
    if (g.pause > 0) { g.pause -= dt; g.ang += Math.sin(t * 2) * dt * .9; return; }
    const [tx, ty] = g.path[g.wp], dx = tx - g.px, dy = ty - g.py, d = Math.hypot(dx, dy), sp = (g.speed || 1.4) * dt;
    if (d < sp) { g.px = tx; g.py = ty; g.wp = (g.wp + 1) % g.path.length; g.pause = g.wait || .9; }
    else { g.px += dx / d * sp; g.py += dy / d * sp; const ta = Math.atan2(dy, dx); let da = Math.atan2(Math.sin(ta - g.ang), Math.cos(ta - g.ang)); g.ang += da * Math.min(1, dt * 6); g.ph = (g.ph || 0) + sp * 4; }
  }
  async function getCaught(g) {
    caught = g; locked = true; P.path = null; sfx('cough'); A.shake(.6);
    await wait(700); toast(g.caughtMsg || '👀 رآك الحارس! تعود إلى آخر مخبأ آمن… حاول من جديد بهدوء.');
    await fadeTo(1); const cp = S.cp; if (cp.area !== S.area) load(cp.area, cp.x, cp.y); else { P.x = cp.x + .5; P.y = cp.y + .5; }
    ents.filter(e => e.kind === 'guard' || e.kind === 'hazard').forEach(e => { e.px = e.path[0][0]; e.py = e.path[0][1]; e.wp = 1 % e.path.length; e.pause = 1.2; });
    ents.filter(e => e.follow).forEach(e => { e.fx = P.x; e.fy = P.y; }); trail.length = 0;
    await fadeTo(0); caught = null; locked = false;
  }

  /* ── الريح: هبّات دورية تدفع البطل في المناطق المكشوفة، ويحميه جدار أو جسم صلب في جهة الريح. تحذير قبلها، ولا ضرر ── */
  let gust = 0, warned = false;
  function windStep(dt) {
    const w = area.wind, wx = $('.advWind'); if (!w || S.flags.nowind || (w.until && w.until(A))) { gust = 0; if (wx) wx.hidden = true; return; }
    const ph = t % w.period, active = ph < w.dur, warn = ph > w.period - 1.4; gust = active ? Math.sin(ph / w.dur * Math.PI) : 0;
    if (wx) { wx.hidden = !(active || warn); wx.textContent = active ? '💨 هبّة ريح! احتمِ خلف جدار' : '⚠️ هبّة ريح قادمة…'; }
    if (!active || locked || caught) return;
    const x = Math.floor(P.x), y = Math.floor(P.y), inZone = w.zones.some(([a, b, c, d]) => x >= a && x <= c && y >= b && y <= d);
    const shelter = blocked(x - Math.sign(w.dx), y - Math.sign(w.dy)) || blocked(x - Math.sign(w.dx), y) || blocked(x, y - Math.sign(w.dy));
    if (!inZone || shelter) return;
    if (!warned) { warned = true; toast('💨 الريح تدفعك! قف خلف جدار أو صخرة حتى تهدأ الهبّة'); }
    const sp = (w.force || 2.2) * gust * dt,   // الريح تدفع ولا تلغي المشي: يكمل البطل طريقه إلى هدفه
    r = .28, can = (x2, y2) => !solidAt(x2 - r, y2 - r * .6) && !solidAt(x2 + r, y2 - r * .6) && !solidAt(x2 - r, y2 + r * .6) && !solidAt(x2 + r, y2 + r * .6);
    if (can(P.x + w.dx * sp, P.y)) P.x += w.dx * sp; if (can(P.x, P.y + w.dy * sp)) P.y += w.dy * sp; shakeK = Math.max(shakeK, .12);
  }
  /* ── البرق في العاصفة: وميض أبيض واهتزاز خفيف كل بضع ثوانٍ (يتوقف حين تهدأ) ── */
  let boltT = 3;
  function lightning(dt) {
    const w = S.flags.weather || {}, on = area.rain && w.rain !== false; if (!on) return;
    boltT -= dt; if (boltT > 0) return; boltT = 5 + Math.random() * 5;
    const el = $('.advFlash'); el.classList.remove('on'); void el.offsetWidth; el.classList.add('on'); shakeK = Math.max(shakeK, .35); thunder();
  }
  /* ── من يتبع البطل (أهل يُقادون إلى الملجأ، أو ماعز تُعاد إلى الحظيرة): يمشون على أثره ── */
  function followStep(dt) {
    const L = trail[trail.length - 1]; if (!L || Math.hypot(L[0] - P.x, L[1] - P.y) > .25) { trail.push([P.x, P.y]); if (trail.length > 80) trail.shift(); }
    let i = 0; ents.forEach(e => { if (!e.follow || e.hidden) return; i++; const k = Math.max(0, trail.length - 1 - i * 4), tgt = trail[k] || [P.x, P.y];
      const dx = tgt[0] - e.fx, dy = tgt[1] - e.fy, d = Math.hypot(dx, dy); e.moving = d > .15; if (d > .05) { const sp = Math.min(d, 3.9 * dt); e.fx += dx / d * sp; e.fy += dy / d * sp; e.ph = (e.ph || 0) + sp * 4; e.face = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'); }
      if (d > 8) { e.fx = P.x; e.fy = P.y; } e.x = Math.floor(e.fx); e.y = Math.floor(e.fy); });
  }

  /* ── تأثيرات ── */
  const fx = []; let shakeK = 0;
  function burst(x, y, n, col) { for (let i = 0; i < n; i++) { const a = Math.random() * 7, s = 40 + Math.random() * 90; fx.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 60, life: .7 + Math.random() * .4, col: col || ['#FFD54A', '#FF7AB6', '#7CD6FF'][i % 3] }); } }

  /* ── الحلقة ── */
  let raf = 0, last = performance.now(), goalT = 0;
  function step(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now; t += dt;
    if (!locked && !caught) { update(dt); followStep(dt); }
    ents.forEach(e => { if (e.kind === 'guard') { updGuard(e, dt); if (!locked && !caught && sees(e)) getCaught(e); } if (e.kind === 'hazard') { updGuard(e, dt); if (!locked && !caught && touches(e)) getCaught(e); } if (e.kind === 'block' && e.px != null) { e.px += (e.x - e.px) * Math.min(1, dt * 14); e.py += (e.y - e.py) * Math.min(1, dt * 14); if (Math.abs(e.px - e.x) + Math.abs(e.py - e.y) < .01) { e.px = e.py = null; } } });
    if (area.tick) area.tick(A, dt);
    if (ents.some(e => e.kind === 'beam')) traceBeams();
    windStep(dt); lightning(dt);
    ents.forEach(e => { if ((e.kind === 'gate' || e.kind === 'door' || e.kind === 'cage') && !e.open && e.when && e.when(A)) { A.set(e.id, { open: true }); sfx('gate'); A.shake(.4); toast(e.openMsg || '🔓 انفتح شيء ما!'); } });
    for (let i = fx.length - 1; i >= 0; i--) { const p = fx[i]; p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 160 * dt; if (p.life <= 0) fx.splice(i, 1); }
    shakeK = Math.max(0, shakeK - dt * 2.5); if (cine < 1) cine += dt / 4.5;
    goalT -= dt; if (goalT <= 0) { goalT = .5; goal(); }   // الهدف يتحدّث وحده (مثلاً عند دخول مكان)
    if (r3) {
      cam.x += (P.x * T - cam.x) * Math.min(1, dt * 6); cam.y += (P.y * T - cam.y) * Math.min(1, dt * 6);
      r3.frame({ areaId: S.area, map, theme: area.theme, dark: (S.flags.weather && S.flags.weather.dark != null) ? S.flags.weather.dark : area.dark != null ? area.dark : THEMES[area.theme].night, tileAt, ents, P, t, A, caught,
        look: e => e.look || def.cast[e.who].look, itemIcon: A.itemIcon, pressed: A.pressed,
        heroLook: heroLookWorn(game.state), heroKey: JSON.stringify(heroLookWorn(game.state)), lantern: A.has('lantern'), goalAt: goalAt(),
        fx: fx.map(p => ({ x: p.x, y: p.y, h: Math.max(0, -p.vy * .1), col: p.col })), cam, zoom: Z / (W < H ? .9 : 1.1), userZoom, cine, shake: shakeK,
        tilesV, beams, symbols: def.symbols || ['🌙', '☀️', '⭐', '🌴'], wind: area.wind ? { gust, dx: area.wind.dx, dy: area.wind.dy, on: !(area.wind.until && area.wind.until(A)) } : null, weather: Object.assign({ rain: area.rain, sand: area.sand, fog: area.fog && !(area.fogUntil && area.fogUntil(A)) }, S.flags.weather || {}), defItems: items,
        cutList: () => Object.keys(S.cut).filter(k => k.startsWith(S.area + ':')).map(k => k.slice(S.area.length + 1)),
        canCut: k => { const [x, y] = k.split(',').map(Number), ch = map[y][x]; return (ch === '"' && A.has(def.cutTool || 'sickle')) || (ch === 'R' && A.has(def.breakTool || 'hammer')); } });
    } else draw();
    const f = front(), ft = !f && frontTile(); $('.advAct').hidden = !(f || ft) || locked; if (f) $('.advAct').textContent = f.kind === 'npc' || f.kind === 'animal' ? '💬' : f.kind === 'block' ? '👐' : f.kind === 'rot' ? '🔄' : '✋'; else if (ft) $('.advAct').textContent = ft.ch === '"' ? '🌾' : '🔨';
    raf = requestAnimationFrame(step);
  }
  function update(dt) {
    let vx = 0, vy = 0;
    if (keys.ArrowLeft || keys.a) vx--; if (keys.ArrowRight || keys.d) vx++; if (keys.ArrowUp || keys.w) vy--; if (keys.ArrowDown || keys.s) vy++;
    if (vx || vy) P.path = null;
    if (!vx && !vy && P.path && P.path.length) { const [tx, ty] = P.path[0], dx = tx + .5 - P.x, dy = ty + .5 - P.y, d = Math.hypot(dx, dy);
      if (d < .08) { P.path.shift(); if (!P.path.length) { P.path = null; const f = P.onArrive; P.onArrive = null; if (f) f(); } } else { vx = dx / d; vy = dy / d; } }
    const sp = 3.6 * dt, n = Math.hypot(vx, vy); P.moving = n > 0;
    if (n) { vx /= n; vy /= n; P.dir = Math.abs(vx) > Math.abs(vy) ? (vx > 0 ? 'right' : 'left') : (vy > 0 ? 'down' : 'up'); P.phase += sp * 3.2;
      const r = .28, can = (x, y) => !solidAt(x - r, y - r * .6) && !solidAt(x + r, y - r * .6) && !solidAt(x - r, y + r * .6) && !solidAt(x + r, y + r * .6);
      const nx = P.x + vx * sp, ny = P.y + vy * sp;
      if (can(nx, P.y)) P.x = nx; if (can(P.x, ny)) P.y = ny;
      // دفع صندوق بالمشي نحوه (لوحة المفاتيح)
      const cx = Math.floor(P.x), cy = Math.floor(P.y), d = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[P.dir], b = ents.find(e => e.kind === 'block' && e.x === cx + d[0] && e.y === cy + d[1]);
      const ft = frontTile(), held = keys.ArrowLeft || keys.ArrowRight || keys.ArrowUp || keys.ArrowDown || keys.a || keys.d || keys.w || keys.s;
      if (ft && !P.path && held) { P.cutT = (P.cutT || 0) + dt; if (P.cutT > .3) { P.cutT = 0; if (area.onSolid) area.onSolid(A, ft.x, ft.y, ft.ch); } } else P.cutT = 0;
      if (b && !P.path && (keys.ArrowLeft || keys.ArrowRight || keys.ArrowUp || keys.ArrowDown || keys.a || keys.d || keys.w || keys.s)) { P.push += dt; if (P.push > .22) { P.push = 0; pushBlock(b, d[0], d[1]); } } else P.push = 0;
    }
    // التقاط الأشياء والنجوم والمخارج
    const tx = Math.floor(P.x), ty = Math.floor(P.y);
    ents.forEach(e => { if (!e.hidden && e.step && Math.abs(e.x - tx) + Math.abs(e.y - ty) === 1 && e.step(A) && area.on && area.on[e.id]) area.on[e.id](A, e); });
    ents.forEach(e => {
      if (e.hidden || e.got || e.x !== tx || e.y !== ty) return;
      if (e.kind === 'star') { e.got = true; persist(e, ['got']); S.stars++; stars(); sfx('win'); burst(e.x * T + T / 2, e.y * T + T / 2, 22); toast(`⭐ نجمة مخفية! (${ar(S.stars)} من ${ar(def.stars)})`); save(); }
      if (e.kind === 'item') { e.got = true; persist(e, ['got']); A.give(e.item, e.n || 1); burst(e.x * T + T / 2, e.y * T + T / 2, 12); if (e.after) e.after(A); }
      if (e.kind === 'exit' && !locked) { if (e.when && !e.when(A)) { if (!e._warned) { e._warned = 1; say([{ who: 'narrator', text: e.locked || 'ليس بعد…' }]).then(() => setTimeout(() => { e._warned = 0; }, 1500)); } return; } A.goto(e.to, e.tx, e.ty); }
      if (e.kind === 'safe') { if (!S.cp || S.cp.x !== e.x || S.cp.y !== e.y) { A.checkpoint(e.x, e.y); toast('🔥 نقطة آمنة: إن رآك حارس تعود إلى هنا'); } }
      if (e.step && e.step(A) && area.on && area.on[e.id]) area.on[e.id](A, e);   // الوصول إلى الشيء يكفي (مثل إشعال الشعلة من النار)
      if (e.kind === 'trigger' && !S.flags['trig_' + e.id] && (!e.when || e.when(A))) { S.flags['trig_' + e.id] = 1; e.run(A); }
    });
  }
  function draw() {
    const dk = area.dark != null ? area.dark : THEMES[area.theme].night;
    cam.x += (P.x * T - cam.x) * .15; cam.y += (P.y * T - T * .4 - cam.y) * .15;
    const hw = W / 2 / Z, hh = H / 2 / Z, mw = map[0].length * T, mh = map.length * T;
    cam.x = Math.max(hw, Math.min(mw - hw, cam.x)); cam.y = Math.max(hh, Math.min(mh - hh, cam.y)); if (mw < hw * 2) cam.x = mw / 2; if (mh < hh * 2) cam.y = mh / 2;
    const q = shakeK ? (Math.random() - .5) * 8 * shakeK : 0;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.fillStyle = '#1A1420'; ctx.fillRect(0, 0, W, H);
    ctx.setTransform(dpr * Z, 0, 0, dpr * Z, dpr * (W / 2 - cam.x * Z + q), dpr * (H / 2 - cam.y * Z));
    const x0 = Math.max(0, Math.floor((cam.x - hw) / T) - 1), x1 = Math.min(map[0].length - 1, Math.ceil((cam.x + hw) / T) + 1), y0 = Math.max(0, Math.floor((cam.y - hh) / T) - 1), y1 = Math.min(map.length - 1, Math.ceil((cam.y + hh) / T) + 2);
    const sc = Math.round(Z * dpr * 4) / 4, list = [], soft = [];
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const ch = tileAt(x, y); drawTile(ctx, ch === ';' ? ',' : ch === '=' ? '.' : ch, area.theme, x, y, sc); if (ch === '_' || ch === '~' || ch === '=') soft.push([x, y, ch]); }
    drawSoft(ctx, soft, area.theme, t);
    soft.forEach(([x, y, ch]) => { if (ch === '~') drawWaterFx(ctx, x, y, t); if (ch === '=') drawTile(ctx, '=', area.theme, x, y, sc); });
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const ch = tileAt(x, y);
      if (ch === 'T') list.push({ y: (y + 1) * T, draw: () => drawTree(ctx, THEMES[area.theme].tree, x * T + T / 2, (y + 1) * T - 6, t, x * 3 + y) });
      if (ch === ';') list.push({ y: (y + 1) * T - 2, draw: () => grass(x, y) });
    }
    if (mark) { mark.t += .016; if (mark.t > .8) mark = null; else { ctx.strokeStyle = `rgba(255,255,255,${.8 - mark.t})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(mark.x * T + T / 2, mark.y * T + T * .7, 14 + mark.t * 20, 6 + mark.t * 8, 0, 0, 7); ctx.stroke(); } }
    ents.forEach(e => {
      if (e.hidden || (e.x < x0 - 3 || e.x > x1 + 3 || e.y < y0 - 1 || e.y > y1 + 3) && e.kind !== 'guard') return;
      if (e.kind === 'plate') { drawThing(ctx, e, t, A); return; }
      if (e.kind === 'guard') { ctx.save(); drawCone(ctx, e, caught === e); ctx.restore(); list.push({ y: (e.py + 1) * T - 4, draw: () => person(e.px, e.py, e.look, e.ang, !!e.pause, e.ph, caught === e ? '!' : null) }); return; }
      if (e.kind === 'npc') { const nx = e.follow ? e.fx - .5 : e.x, ny = e.follow ? e.fy - .5 : e.y; list.push({ y: (ny + 1) * T - 4, draw: () => person(nx, ny, e.look || def.cast[e.who].look, e.face, !e.moving, e.ph || 0, e.mark ? e.mark(A) : null) }); return; }
      if (e.kind === 'hazard' || e.kind === 'animal') { const hx = e.kind === 'hazard' ? e.px : e.follow ? e.fx - .5 : e.x, hy = e.kind === 'hazard' ? e.py : e.follow ? e.fy - .5 : e.y;
        list.push({ y: (hy + 1) * T - 4, draw: () => { ctx.font = '34px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif'; ctx.textAlign = 'center'; ctx.fillText({ crab: '🦀', scorpion: '🦂', goat: '🐐', camel: '🐪', boulder: '🪨' }[e.creature] || '❗', hx * T + T / 2, hy * T + T * .8); } }); return; }
      if (e.kind === 'exit' || e.kind === 'trigger' || e.kind === 'safe') { if (e.kind === 'safe') list.push({ y: (e.y + 1) * T - 8, draw: () => drawThing(ctx, Object.assign({}, e, { kind: 'fire' }), t, A) }); if (e.kind === 'exit' && e.arrow) arrow(e); return; }
      list.push({ y: (e.kind === 'block' && e.py != null ? e.py : e.y) * T + T - 2 + (e.kind === 'door' || e.kind === 'gate' || e.kind === 'cage' ? 1 : 0), draw: () => drawThing(ctx, e, t, A) });
    });
    list.push({ y: P.y * T + T * .35, draw: () => { const h = Object.assign({}, heroLookWorn(game.state), { x: P.x * T, y: P.y * T + T * .35, dir: P.dir, moving: P.moving, phase: P.phase, s: .95 }); ctx.fillStyle = 'rgba(40,25,10,.25)'; ctx.beginPath(); ctx.ellipse(h.x + 3, h.y, 13, 4, 0, 0, 7); ctx.fill(); drawHuman(ctx, h);
      if (tileAt(Math.floor(P.x), Math.floor(P.y)) === ';') grass(Math.floor(P.x), Math.floor(P.y), true); } });
    ents.forEach(b => { const pl = b.kind === 'block' && b.to && A.ent(b.to); if (!pl || (b.x === pl.x && b.y === pl.y)) return; ctx.save(); ctx.setLineDash([8, 8]); ctx.lineDashOffset = -t * 30; ctx.strokeStyle = 'rgba(255,214,90,.85)'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(b.x * T + T / 2, b.y * T + T * .7); ctx.lineTo(pl.x * T + T / 2, pl.y * T + T * .7); ctx.stroke(); ctx.restore(); });   // دليل: من الصندوق إلى لوحته
    beams.forEach(pts => { ctx.strokeStyle = pts.color || 'rgba(255,226,122,.9)'; ctx.lineWidth = 6; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x * T + T / 2, y * T + T / 2) : ctx.moveTo(x * T + T / 2, y * T + T / 2)); ctx.stroke(); });
    list.sort((a, b) => a.y - b.y).forEach(o => o.draw());
    fx.forEach(p => { ctx.globalAlpha = Math.min(1, p.life * 2); ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(p.x, p.y, 3.2, 0, 7); ctx.fill(); }); ctx.globalAlpha = 1;
    if (dk > .02) lighting(dk);
  }
  function grass(x, y, over) { ctx.fillStyle = over ? 'rgba(70,120,50,.92)' : '#5A8E3C'; for (let i = 0; i < 7; i++) { const gx = x * T + 4 + i * 6.5, gy = (y + 1) * T - 2, h = 20 + (i * 7 % 9) + Math.sin(t * 2 + i + x) * 2; ctx.beginPath(); ctx.moveTo(gx - 3, gy); ctx.lineTo(gx + Math.sin(t * 1.6 + i) * 3, gy - h); ctx.lineTo(gx + 3, gy); ctx.fill(); } }
  function arrow(e) { const b = Math.sin(t * 4) * 4; ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.font = '900 26px Cairo'; ctx.textAlign = 'center'; ctx.fillText(e.arrow, e.x * T + T / 2, e.y * T + T / 2 + b + 8); }
  function person(x, y, look, ang, idle, ph, markTxt) {
    const dir = typeof ang === 'string' ? ang : Math.abs(Math.cos(ang)) > Math.abs(Math.sin(ang)) ? (Math.cos(ang) > 0 ? 'right' : 'left') : (Math.sin(ang) > 0 ? 'down' : 'up');
    const h = Object.assign({}, look, { x: x * T + T / 2, y: y * T + T * .85, dir: dir || 'down', moving: !idle && ph > 0, phase: ph || 0, s: (look.s || 1) * .95 });
    ctx.fillStyle = 'rgba(40,25,10,.25)'; ctx.beginPath(); ctx.ellipse(h.x + 3, h.y, 13, 4, 0, 0, 7); ctx.fill(); drawHuman(ctx, h);
    if (markTxt) { const b = Math.sin(t * 5) * 3; ctx.fillStyle = markTxt === '!' ? '#E2475C' : '#FFC23D'; ctx.beginPath(); ctx.arc(h.x, h.y - 78 + b, 11, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = '900 15px Cairo'; ctx.textAlign = 'center'; ctx.fillText(markTxt, h.x, h.y - 72 + b); }
  }
  let lc = null;
  function lighting(dk) {
    if (!lc) lc = document.createElement('canvas'); if (lc.width !== cv.width || lc.height !== cv.height) { lc.width = cv.width; lc.height = cv.height; }
    const l = lc.getContext('2d'); l.setTransform(1, 0, 0, 1, 0, 0); l.globalCompositeOperation = 'source-over'; l.clearRect(0, 0, lc.width, lc.height);
    l.fillStyle = `rgba(14,10,40,${Math.min(.94, dk)})`; l.fillRect(0, 0, lc.width, lc.height); l.globalCompositeOperation = 'destination-out';
    const toS = (wx, wy) => [dpr * (W / 2 + (wx - cam.x) * Z), dpr * (H / 2 + (wy - cam.y) * Z)];
    const hole = (wx, wy, r) => { const [sx, sy] = toS(wx, wy), R = r * T * Z * dpr, g = l.createRadialGradient(sx, sy, R * .2, sx, sy, R); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)'); l.fillStyle = g; l.beginPath(); l.arc(sx, sy, R, 0, 7); l.fill(); };
    hole(P.x * T, P.y * T, A.has('lantern') || dk < .5 ? 3.4 : 1.7);
    ents.forEach(e => { if (e.hidden) return; if ((e.kind === 'fire' || e.kind === 'safe') && e.lit !== false) hole(e.x * T + T / 2, e.y * T + T / 2, 2.6); if (e.kind === 'beacon' && e.lit) hole(e.x * T + T / 2, e.y * T, 4); if (e.light) hole(e.x * T + T / 2, e.y * T + T / 2, e.light); if (e.kind === 'guard') hole(e.px * T + T / 2, e.py * T + T / 2, 1.3); });
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(lc, 0, 0);
    const [sx, sy] = toS(P.x * T, P.y * T); if (A.has('lantern') && dk > .5) { const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, 3.4 * T * Z * dpr); g.addColorStop(0, 'rgba(255,190,90,.16)'); g.addColorStop(1, 'rgba(255,190,90,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, cv.width, cv.height); }
  }

  /* ── النهاية والخروج ── */
  function cleanup() { if (r3) { try { r3.dispose(); } catch (e) {} } cancelAnimationFrame(raf); removeEventListener('resize', resize); removeEventListener('keydown', kd); removeEventListener('keyup', ku); root.remove(); game.busy = false; bus.emit('pauseWorld', false); }
  function exit() { save(); cleanup(); onExit && onExit({ done: false }); }
  async function finish() {
    if (done) return; done = true; locked = true;
    const first = !R.done, got = S.stars; R.done = true; R.plays++; R.best = Math.max(R.best, got); R.st = null;
    const rw = first ? def.rewards || [] : []; if (first && def.grant) def.grant(game.state);
    bus.emit('adventureDone', def.id); bus.emit('gems'); bus.emit('save'); sfx('win'); burst(P.x * T, P.y * T - 30, 60);
    const card = document.createElement('div'); card.className = 'advEnd'; card.innerHTML = `<div class="advEndCard"><div class="advEndIcon">${esc(def.icon)}</div><h2>${esc(def.title)}</h2><p class="advEndSub">أكملتَ المغامرة! 🎉</p>
      <div class="advEndStars">${'⭐'.repeat(got)}${'☆'.repeat(Math.max(0, (def.stars || 0) - got))}<small>${ar(got)} من ${ar(def.stars || 0)} نجوم مخفية</small></div>
      ${rw.length ? `<div class="advRw"><b>🎁 مكافآتك</b>${rw.map(r => `<span>${esc(r)}</span>`).join('')}</div>` : '<p class="muted">العب من جديد لتجد كل النجوم المخفية!</p>'}
      <button class="act big go" data-home>🏡 العودة إلى القرية</button><button class="act ghost" data-again>🔁 العب من جديد</button></div>`;
    root.appendChild(card);
    card.querySelector('[data-home]').onclick = e => { e.stopPropagation(); cleanup(); onExit && onExit({ done: true }); };
    card.querySelector('[data-again]').onclick = e => { e.stopPropagation(); cleanup(); runAdventure(def, onExit); };
  }

  load(S.area, S.x, S.y); inv(); stars(); goal(); raf = requestAnimationFrame(step); window.__adv = A;
  if (!S.flags._intro && def.intro) { S.flags._intro = 1; setTimeout(() => def.intro(A).then(goal), 400); }
  return A;
}
