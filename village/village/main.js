// نقطة الدخول: تربط الأنظمة ببعضها. المنطق في وحداته، والواجهة فوق الحالة.
import { game, newState, CARRY_MAX, TREE_COST } from './core/state.js';
import { bus } from './core/events.js';
import { ar, clamp } from './core/util.js';
import { createEngine } from './core/engine.js';
import { loadSave, saveSoon, saveNow, wipeSave } from './save/save.js';
import { createPlayer, updatePlayer } from './player/player.js';
import { findPath } from './world/nav.js';
import { drawHuman } from './character/human.js';
import { WORLD, PILE, SIGNAL, TREE_SPOTS, FARM, HOUSES, WAREHOUSE, ROADS, staticColliders, drawGround, drawFarm, drawPalm, staticDrawables, inView } from './world/village.js';
import { makeTrucks, truckColliders, drawTruck, drawPile, drawSignal, drawSpot, updateFx, drawFx, moveAlong, say } from './world/entities.js';
import { makeNpcs, npcVisible, updateNpc, drawNpc } from './npc/npc.js';
import { CHAPTER, introLines, npcLines, objective } from './story/dialogues.js';
import * as convoy from './missions/convoy.js';
import { plant } from './missions/planting.js';
import { unlock } from './achievements/achievements.js';
import { hud } from './ui/hud.js';
import { screens, heroLook } from './ui/screens.js';

const eng = createEngine(document.getElementById('game'), WORLD);
let W = null;

function boot() {
  const saved = loadSave();
  screens.title(saved, {
    onContinue: () => start(saved, false),
    onNew: hero => { wipeSave(); start(newState(hero), true); }
  });
}

async function start(state, fresh) {
  game.state = state;
  W = buildWorld(state);
  hud.init({ drawMini });
  hud.show(true); hud.good(); hud.objective(objective(state));
  eng.snap(W.player); eng.follow = W.player;
  eng.onTap = onTap;
  eng.run(update, render);
  saveNow(state);
  if (!state.story.introDone) {
    await screens.chapter(CHAPTER.n, CHAPTER.title);
    await hud.dialog(introLines(state.hero.name), people());
    state.story.introDone = true; saveNow(state);
  }
}

function buildWorld(st) {
  const w = { player: createPlayer(st), trucks: makeTrucks(st), npcs: makeNpcs(), signalGreen: !!st.world.delivered, tapMark: null, savedAt: 0 };
  w.statics = staticColliders();
  w.talk = (id, lines) => hud.dialog(lines, people());
  w.camFollow = target => { eng.focus = target || null; };
  return w;
}
const hero = () => Object.assign(heroLook(game.state.hero), { name: game.state.hero.name });
function people() {
  const P = { narrator: { name: 'الراوي' } };
  W.npcs.forEach(n => { P[n.id] = n; });
  P.hero = hero();
  return P;
}

/* ── التصادم ── */
function blocked(x, y) {
  if (x < 12 || y < 30 || x > WORLD.w - 12 || y > WORLD.h - 8) return true;
  const r = 9, rects = W.statics.concat(truckColliders(W.trucks));
  return rects.some(b => x > b.x - r && x < b.x + b.w + r && y > b.y - r && y < b.y + b.h + r);
}

/* ── ما يمكن التفاعل معه الآن ── */
function interactables() {
  const s = game.state, m = s.missions.convoy, out = [];
  W.npcs.filter(n => npcVisible(n, s)).forEach(n => out.push({ kind: 'npc', ref: n, x: n.x, y: n.y - 26, hit: 36, approach: { x: n.x, y: n.y + 26 }, arrive: () => talkTo(n) }));
  out.push({ kind: 'pile', x: PILE.x, y: PILE.y - 22, hit: 50, approach: { x: PILE.x, y: PILE.y + 36 } });
  if (!s.world.delivered) W.trucks.forEach(t => out.push({ kind: 'truck', ref: t, x: t.x, y: t.y - 14, hit: 42, approach: { x: t.x, y: t.y - 54 } }));
  out.push({ kind: 'signal', x: SIGNAL.x, y: SIGNAL.y - 40, hit: 34, approach: { x: SIGNAL.x - 28, y: SIGNAL.y + 24 } });
  TREE_SPOTS.forEach((sp, i) => { if (!s.world.trees[i]) out.push({ kind: 'spot', i, x: sp.x, y: sp.y - 10, hit: 32, approach: { x: sp.x, y: sp.y + 28 } }); });
  return out;
}
function onTap(p) {
  if (game.busy) return;
  const hit = interactables().map(it => ({ it, d: Math.hypot(it.x - p.x, it.y - p.y) })).filter(o => o.d < o.it.hit).sort((a, b) => a.d - b.d)[0];
  const pl = W.player, dest = hit ? hit.it.approach : { x: p.x, y: p.y };
  const route = findPath(pl.x, pl.y, dest.x, dest.y, blocked);
  if (!route.length) { say(pl.x, pl.y - 80, 'لا طريق إلى هناك', '#B7791F', 1200); return; }
  pl.route = route; pl.target = route[0]; pl.onArrive = hit && hit.it.arrive || null;
  W.tapMark = { x: dest.x, y: dest.y, t: 0 };
}
async function talkTo(n) {
  const s = game.state, lines = npcLines(n.id, s, s.hero.name);
  if (!lines.length || game.busy) return;
  n.talking = true; await hud.dialog(lines, people()); n.talking = false;
  s.talked[n.id] = 1;
  if (n.id === 'salem' && s.missions.convoy.status === 'new') { s.missions.convoy.status = 'active'; bus.emit('mission'); }
  if (['salem', 'umkhalid', 'yousef', 'hamad'].every(id => s.talked[id])) unlock('friend');
  bus.emit('save');
}
function nearest(list, r) { const p = W.player; let best = null, bd = r; list.forEach(o => { const d = Math.hypot(o.x - p.x, o.y - p.y); if (d < bd) { bd = d; best = o; } }); return best; }
function currentActions() {
  if (game.busy) return [];
  const s = game.state, m = s.missions.convoy, out = [];
  const npc = nearest(W.npcs.filter(n => npcVisible(n, s)), 72);
  if (npc) out.push({ key: npc.id, label: `💬 ${npc.name}`, run: () => talkTo(npc) });
  if (m.status === 'active') {
    if (nearest([{ x: PILE.x, y: PILE.y + 20 }], 80)) {
      out.push({ label: '📦 احمل صندوقاً', run: () => convoy.pick(W), disabled: m.pile <= 0 || s.carry >= CARRY_MAX });
      if (s.carry) out.push({ label: '↩ أعِد صندوقاً', kind: 'ghost', run: () => convoy.putBack(W) });
    }
    const t = nearest(W.trucks.map(t => ({ x: t.x, y: t.y - 40, t })), 64);
    if (t) {
      const k = 'truck' + t.t.i;
      out.push({ key: k, label: '⬇ ضع في الشاحنة', run: () => convoy.load(W, t.t.i), disabled: !s.carry });
      if (m.loads[t.t.i] && s.carry < CARRY_MAX) out.push({ key: k, label: '⬆ خذ منها', kind: 'ghost', run: () => convoy.unload(W, t.t.i) });
    }
    if (nearest([{ x: SIGNAL.x - 20, y: SIGNAL.y + 10 }], 70)) out.push({ label: '🚦 أطلق القافلة', kind: 'go', run: () => convoy.launch(W) });
  } else if (m.status === 'new' && nearest([{ x: PILE.x, y: PILE.y + 20 }], 80)) {
    out.push({ label: '📦 الصناديق مقفلة — تحدّث مع العم سالم', kind: 'ghost', run: () => say(PILE.x, PILE.y - 120, 'العم سالم ينتظرك عند الشاحنات', '#2A1B66') });
  }
  if (s.world.delivered) {
    const sp = nearest(TREE_SPOTS.map((p, i) => ({ x: p.x, y: p.y + 10, i })).filter(o => !s.world.trees[o.i]), 66);
    if (sp) out.push({ key: 'spot' + sp.i, label: s.good >= TREE_COST ? `🌱 ازرع نخلة (${ar(TREE_COST)} 💚)` : `🌱 تحتاج ${ar(TREE_COST)} 💚`, kind: 'green', run: () => plant(W, sp.i), disabled: s.good < TREE_COST });
  }
  return out;
}

/* ── التحديث ── */
function update(dt) {
  const s = game.state, pl = W.player;
  if (!game.busy || pl.target) updatePlayer(pl, dt, game.busy ? {} : eng.keys, blocked);
  W.npcs.forEach(n => { if (npcVisible(n, s)) updateNpc(n, dt, pl, blocked); });
  W.trucks.forEach(t => moveAlong(t, dt, 230));
  updateFx(dt);
  if (W.tapMark) { W.tapMark.t += dt; if (W.tapMark.t > .6) W.tapMark = null; }
  hud.actions(currentActions());
  W.savedAt += dt;
  if (W.savedAt > 2) { W.savedAt = 0; s.player = { x: Math.round(pl.x), y: Math.round(pl.y), dir: pl.dir }; saveSoon(s); }
}

/* ── الرسم: الأرض، ثم كل ما له عمق مرتباً حسب y ── */
function render(ctx, view, t) {
  const s = game.state, m = s.missions.convoy, now = Date.now();
  drawGround(ctx, view);
  const g = s.world.delivered ? clamp((now - s.world.delivered) / 2600, 0, 1) : 0;
  drawFarm(ctx, g, t);
  TREE_SPOTS.forEach((sp, i) => drawSpot(ctx, sp, !s.world.trees[i]));
  const list = staticDrawables(s, t).filter(d => d.y > view.y - 60 && d.y < view.y + view.h + 200);
  TREE_SPOTS.forEach((sp, i) => { const pt = s.world.trees[i]; if (pt) { const k = clamp((now - pt) / 2200, .05, 1); list.push({ y: sp.y, draw: c => drawPalm(c, sp.x, sp.y, .2 + .8 * easeOut(k), false, t) }); } });
  W.trucks.forEach(tr => list.push({ y: tr.y + 4, draw: c => drawTruck(c, tr, m.loads[tr.i], m.status === 'active') }));
  if (!s.world.delivered) list.push({ y: PILE.y, draw: c => drawPile(c, m.pile) });
  list.push({ y: SIGNAL.y, draw: c => drawSignal(c, W.signalGreen) });
  W.npcs.filter(n => npcVisible(n, s)).forEach(n => list.push({ y: n.y, draw: c => drawNpc(c, n, n.id === 'salem' && m.status === 'new' ? '!' : null) }));
  const pl = W.player;
  list.push({ y: pl.y, draw: c => drawHuman(c, Object.assign(hero(), { x: pl.x, y: pl.y, dir: pl.dir, phase: pl.phase, moving: pl.moving, carry: s.carry, bend: pl.act === 'plant' })) });
  list.sort((a, b) => a.y - b.y).forEach(d => d.draw(ctx));
  if (W.tapMark) { const k = W.tapMark.t / .6; ctx.strokeStyle = `rgba(255,255,255,${1 - k})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(W.tapMark.x, W.tapMark.y, 8 + k * 16, 4 + k * 7, 0, 0, 7); ctx.stroke(); }
  drawFx(ctx);
  drawGuide(ctx, view, t);
}
const easeOut = k => 1 - Math.pow(1 - k, 3);
function objectiveTarget(s) {
  const m = s.missions.convoy;
  if (m.status === 'new') { const n = W.npcs.find(n => n.id === 'salem'); return { x: n.x, y: n.y - 30 }; }
  if (m.status === 'active') {
    if (m.pile === 0 && s.carry === 0) return { x: SIGNAL.x, y: SIGNAL.y - 40 };
    if (s.carry === 0) return { x: PILE.x, y: PILE.y - 20 };
    return { x: W.trucks[3].x - 46, y: W.trucks[3].y - 14 };
  }
  const i = s.world.trees.findIndex(v => !v); return i >= 0 ? { x: TREE_SPOTS[i].x, y: TREE_SPOTS[i].y } : null;
}
function drawGuide(ctx, view, t) {   // سهم على حافة الشاشة حين يكون الهدف خارجها
  if (game.busy) return;
  const g = objectiveTarget(game.state); if (!g) return;
  const m = 46, inside = g.x > view.x + m && g.x < view.x + view.w - m && g.y > view.y + m + 90 && g.y < view.y + view.h - m - 70;
  if (inside) return;
  const cx = view.x + view.w / 2, cy = view.y + view.h / 2, a = Math.atan2(g.y - cy, g.x - cx);
  const rx = view.w / 2 - m, ry = view.h / 2 - m - 70, k = Math.min(rx / Math.abs(Math.cos(a) || 1e-6), ry / Math.abs(Math.sin(a) || 1e-6));
  const x = cx + Math.cos(a) * k, y = cy + Math.sin(a) * k, pulse = 1 + Math.sin(t * 6) * .08;
  ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(pulse, pulse);
  ctx.fillStyle = '#FFC23D'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(18, 0); ctx.lineTo(-10, -13); ctx.lineTo(-4, 0); ctx.lineTo(-10, 13); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
}

/* ── خريطة مصغّرة للوحة 🗺️ ── */
function drawMini(c) {
  const x = c.getContext('2d'), sc = Math.min(c.width / WORLD.w, c.height / WORLD.h), s = game.state;
  x.fillStyle = '#EAD6A6'; x.fillRect(0, 0, c.width, c.height); x.save(); x.scale(sc, sc);
  x.fillStyle = '#5E6274'; ROADS.forEach(r => x.fillRect(r.x, r.y, r.w, r.h));
  x.fillStyle = s.world.delivered ? '#7CB35A' : '#C9A46B'; x.fillRect(FARM.x, FARM.y, FARM.w, FARM.h);
  x.fillStyle = '#D9C6A0'; HOUSES.forEach(b => x.fillRect(b.x, b.y, b.w, b.h));
  x.fillStyle = '#8FA0B5'; x.fillRect(WAREHOUSE.x, WAREHOUSE.y, WAREHOUSE.w, WAREHOUSE.h);
  x.fillStyle = '#F08A24'; W.trucks.forEach(t => x.fillRect(t.x - 38, t.y - 30, 76, 32));
  x.fillStyle = '#2E8B47'; TREE_SPOTS.forEach((sp, i) => { if (s.world.trees[i]) { x.beginPath(); x.arc(sp.x, sp.y, 22, 0, 7); x.fill(); } });
  x.fillStyle = '#FFC23D'; W.npcs.filter(n => npcVisible(n, s)).forEach(n => { x.beginPath(); x.arc(n.x, n.y, 20, 0, 7); x.fill(); });
  x.fillStyle = '#C2304A'; x.beginPath(); x.arc(W.player.x, W.player.y, 28, 0, 7); x.fill();
  x.restore();
}

bus.on('save', () => { if (game.state) saveSoon(game.state); });
bus.on('good', () => hud.good());
bus.on('mission', () => hud.objective(objective(game.state)));
bus.on('achievement', a => setTimeout(() => hud.toast(`${a.icon} إنجاز جديد: ${a.name}`), 400));
window.__game = { get state() { return game.state; }, get W() { return W; }, eng, game };
boot();
