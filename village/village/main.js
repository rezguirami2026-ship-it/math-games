// نقطة الدخول: تربط الأنظمة ببعضها، واللعبة كلها تسير على ترتيب دروس المنهج
import { game, fresh, upgrade, CARRY_MAX, TREE_COST } from './core/state.js';
import { bus } from './core/events.js';
import { ar, clamp } from './core/util.js';
import { createEngine } from './core/engine.js';
import { loadSave, saveSoon, saveNow, wipeSave } from './save/save.js';
import { createPlayer, updatePlayer } from './player/player.js';
import { findPath } from './world/nav.js';
import { drawHuman } from './character/human.js';
import { WORLD, PILE, SIGNAL, TREE_SPOTS, FARM, HOUSES, WAREHOUSE, ROADS, SOUTH, staticColliders, drawGround, drawFarm, drawPalm, staticDrawables } from './world/village.js';
import { makeTrucks, truckColliders, drawTruck, drawPile, drawSignal, drawSpot, updateFx, drawFx, moveAlong, say, bubble } from './world/entities.js';
import { makeNpcs, npcVisible, updateNpc, drawNpc } from './npc/npc.js';
import { CHAPTER, introLines, npcLines } from './story/dialogues.js';
import * as convoy from './missions/convoy.js';
import { plant } from './missions/planting.js';
import * as tanks from './missions/tanks.js';
import { SHOP, openCounter, drawShop, drawGarden } from './missions/shop.js';
import { UNIT1, POND } from './missions/unit1.js';
import { UNIT2 } from './missions/unit2.js';
import { UNIT3 } from './missions/unit3.js';
import { UNIT4 } from './missions/unit4.js';
import { T2U1 } from './missions/t2u1.js';
import { T2U2 } from './missions/t2u2.js';
import { T2U3 } from './missions/t2u3.js';
import { T2U4 } from './missions/t2u4.js';
import { T2U5 } from './missions/t2u5.js';
import { workshopColliders, drawWorkshopGround, workshopDrawables, STAGE } from './world/workshop.js';
import { caravanColliders, drawCaravanGround, caravanDrawables } from './world/caravan.js';
import { coopColliders, drawCoopGround, coopDrawables } from './world/coop.js';
import { festivalColliders, drawFestivalGround, festivalDrawables } from './world/festival.js';
import { fortColliders, drawFortGround, fortDrawables } from './world/fort.js';
import { harborColliders, drawHarborGround, harborDrawables } from './world/harbor.js';
import { marketColliders, drawMarketGround, marketDrawables } from './world/market.js';
import * as quests from './missions/quests.js';
import { LESSONS, UNITS } from './content/lessons.js';
import { openWardrobe, heroLookWorn } from './ui/wardrobe.js';
import { unlock } from './achievements/achievements.js';
import { hud } from './ui/hud.js';
import { screens } from './ui/screens.js';

const eng = createEngine(document.getElementById('game'), WORLD);
let W = null;
const npcPos = id => { const n = W.npcs.find(n => n.id === id); return { x: n.x, y: n.y - 30 }; };

/* ── كل درس جاهز له وحدة تعرف كيف يُلعب ── */
const shopMod = lesson => ({
  id: lesson, giver: 'naser',
  intro: n => lesson === 'multiplyStrategies'
    ? [{ who: 'naser', text: `حيّاك يا ${n}! أهل القرية يشترون بالجملة هذا الأسبوع: كميات كبيرة وأسعار صغيرة.` },
       { who: 'naser', text: 'احسبها بذكاء: ضاعف وانصف حتى يسهل الحساب، ثم ادفع المبلغ بالضبط.' }]
    : [{ who: 'naser', text: `أهلاً يا ${n}! أهل القرية يحتاجون أدوات الزراعة، وكل طلب فيه أصناف مختلفة.` },
       { who: 'naser', text: 'اجمع أسعار الأصناف المكتوبة على اللوحة، وادفع المجموع بالضبط.' }],
  onStart: W => openCounter(W, lesson), resume: W => openCounter(W, lesson),
  goal: () => '🏪 ادفع للعم ناصر المبلغ بالضبط', target: () => npcPos('naser')
});
const MODS = Object.assign({}, UNIT1, UNIT2, UNIT3, UNIT4, T2U1, T2U2, T2U3, T2U4, T2U5, {
  multiplyStrategies: shopMod('multiplyStrategies'),
  decimalAdd: shopMod('decimalAdd'),
  division1: {
    id: 'division1', giver: 'salem',
    intro: n => [
      { who: 'salem', text: `حان يوم القافلة يا ${n}! المزرعة تنتظر البذور وأدوات الري.` },
      { who: 'salem', text: `في المستودع ${ar(27)} صندوقاً، ولدينا ${ar(6)} شاحنات وعربة صغيرة.` },
      { who: 'salem', text: 'كل شاحنة تحمل العدد نفسه، وما يتبقى بعد التوزيع يذهب في العربة الصغيرة. ثم اضغط إشارة الانطلاق.' }
    ],
    onStart: () => { const m = game.state.missions.convoy; if (m.status !== 'done') m.status = 'active'; },
    goal: () => { const m = game.state.missions.convoy; return m.pile || game.state.carry ? '🚚 وزّع الصناديق على الشاحنات بالتساوي، والباقي للعربة' : '🚦 أطلق القافلة من الإشارة'; },
    target: () => { const s = game.state, m = s.missions.convoy; if (m.pile === 0 && s.carry === 0) return { x: SIGNAL.x, y: SIGNAL.y - 40 }; if (s.carry === 0) return { x: PILE.x, y: PILE.y - 20 }; return { x: W.trucks[3].x - 46, y: W.trucks[3].y - 14 }; }
  },
  decimalFractions: {
    id: 'decimalFractions', giver: 'umkhalid',
    intro: n => [
      { who: 'umkhalid', text: `الفلج يجري يا ${n}، لكن خزانات البيوت فارغة.` },
      { who: 'umkhalid', text: 'على لوحة كل خزان الجزء الذي يجب أن يمتلئ: كسر أو عدد عشري أو نسبة مئوية. الخزان مقسّم عشرة أقسام.' }
    ],
    onStart: () => { tanks.setup(); game.state.missions.tanks.status = 'active'; },
    goal: () => '💧 املأ كل خزان بالقدر المكتوب على لوحته',
    target: () => { const T = game.state.missions.tanks, k = T.done.findIndex(v => !v); return k >= 0 ? { x: tanks.TANKS[k].x, y: tanks.TANKS[k].y - 40 } : null; }
  }
});
const cur = () => quests.current();
const ALLMODS = () => Object.values(UNIT1).concat(Object.values(UNIT2), Object.values(UNIT3), Object.values(UNIT4), Object.values(T2U1), Object.values(T2U2), Object.values(T2U3), Object.values(T2U4), Object.values(T2U5));
const allDone = () => LESSONS.every(l => quests.isDone(l.id));
const unitDone = u => LESSONS.filter(l => l.u <= u).every(l => quests.isDone(l.id));   // الوحدة وكل ما قبلها
const curMod = () => { const c = cur(); return c && c.ready && MODS[c.id] ? MODS[c.id] : null; };
/* المناطق المسوّرة: بوابة كل منطقة تُفتح بإنهاء الوحدة u (رقمها في UNITS)، ورسالة الفتح في UNITS[u].opens */
const REGIONS = [
  { u: 0, walls: marketColliders, draw: open => marketDrawables(open) },        // السوق الأسبوعي
  { u: 1, walls: harborColliders, draw: harborDrawables },                      // الميناء
  { u: 2, walls: fortColliders, draw: fortDrawables },                          // القلعة
  { u: 3, walls: festivalColliders, draw: festivalDrawables },                  // ساحة المهرجان (نهاية الفصل الأول)
  { u: 5, walls: coopColliders, draw: open => coopDrawables(open) },            // سوق الجمعية
  { u: 6, walls: caravanColliders, draw: caravanDrawables },                    // طريق القافلة
  { u: 7, walls: workshopColliders, draw: (open, t) => workshopDrawables(open, t, allDone()) }   // ورشة البنّاء
];
/* حالة البوابات والجدران تُحسب عند إنهاء درس فقط، لا في كل إطار ولا في كل خطوة من إيجاد الطريق */
let gates = null, walls = null;
const gateState = () => gates || (gates = REGIONS.map(r => unitDone(r.u)));
const resetGates = () => { gates = null; walls = null; };
function wallRects() {   // كل العوائق الثابتة؛ البركة عائق إلا أثناء القفز على حجارتها
  if (walls && walls.stones === W.stones) return walls.list;
  const g = gateState();
  const list = W.statics.concat(...REGIONS.map((r, i) => r.walls(g[i])), W.stones ? [] : [{ x: POND.x, y: POND.y, w: POND.w, h: POND.h }]);
  walls = { stones: W.stones, list };
  return list;
}
/* الأخطاء لا تُخفى: كل خطأ يُسجَّل في الكونسول مرة واحدة لكل موضع ودرس، واللعبة تكمل */
const reported = new Set();
function report(where, id, err) {
  const k = where + ':' + id; if (reported.has(k)) return; reported.add(k);
  console.error(`[قرية الخير] ${where} — ${id}`, err);
}

function boot() {
  const saved = loadSave();
  screens.title(saved, { onContinue: () => start(saved), onNew: hero => { wipeSave(); start(fresh(hero)); }, onRestore: s => { saveNow(s); start(s); } });
}
async function start(state) {
  game.state = upgrade(state);
  W = buildWorld(state); resetGates();
  hud.init({ drawMini, questLog });
  hud.show(true); hud.good(); hud.objective(objective());
  eng.snap(W.player); eng.follow = W.player; eng.onTap = onTap;
  eng.run(update, render);
  saveNow(state);
  if (!state.story.introDone) {
    await screens.chapter(CHAPTER.n, CHAPTER.title);
    await hud.dialog(introLines(state.hero.name), people());
    state.story.introDone = true; saveNow(state);
  }
}
function buildWorld(st) {
  const w = { player: createPlayer(st), trucks: makeTrucks(st), npcs: makeNpcs(), signalGreen: !!st.world.delivered, tapMark: null, savedAt: 0, stones: false };
  w.statics = staticColliders().concat(
    [{ x: SHOP.x - 66, y: SHOP.y - 40, w: 132, h: 40 }],
    tanks.TANKS.map(t => ({ x: t.x - 16, y: t.y - 12, w: 32, h: 14 })),
    [{ x: convoy.VAN.x - 26, y: convoy.VAN.y - 18, w: 52, h: 20 }]
  );
  w.talk = (id, lines) => hud.dialog(lines, people());
  w.camFollow = target => { eng.focus = target || null; };
  w.toast = msg => hud.toast(msg);
  w.chapter = (n, title) => screens.chapter(n, title);
  return w;
}
const hero = () => Object.assign(heroLookWorn(game.state), { name: game.state.hero.name });
const HERO_DOOR = { x: HOUSES[2].x + HOUSES[2].w / 2, y: HOUSES[2].y + HOUSES[2].h + 14 };
function people() { const P = { narrator: { name: 'الراوي' }, pax: W.paxInfo || { name: 'مسافر', kind: 'man' } }; W.npcs.forEach(n => { P[n.id] = n; }); P.hero = hero(); return P; }

/* ── التصادم: البركة لا تُعبر إلا على الحجارة ── */
function blocked(x, y) {
  if (x < 12 || y < 30 || x > WORLD.w - 12 || y > WORLD.h - 8) return true;
  const r = 9, hit = b => x > b.x - r && x < b.x + b.w + r && y > b.y - r && y < b.y + b.h + r;
  return wallRects().some(hit) || truckColliders(W.trucks).some(hit);   // الشاحنات تتحرك فتُفحص كل مرة
}

/* ── ما يمكن النقر عليه ── */
const convoyActive = () => !!cur() && cur().id === 'division1' && quests.isStarted('division1') && game.state.missions.convoy.status === 'active';
function interactables() {
  const s = game.state, out = [];
  W.npcs.filter(n => npcVisible(n, s)).forEach(n => out.push({ x: n.x, y: n.y - 26, hit: 36, approach: { x: n.x, y: n.y + 26 }, arrive: () => talkTo(n) }));
  if (convoyActive()) {
    out.push({ x: PILE.x, y: PILE.y - 22, hit: 50, approach: { x: PILE.x, y: PILE.y + 36 } });
    W.trucks.forEach(t => out.push({ x: t.x, y: t.y - 14, hit: 42, approach: { x: t.x, y: t.y - 54 } }));
    out.push({ x: convoy.VAN.x, y: convoy.VAN.y - 14, hit: 36, approach: { x: convoy.VAN.x, y: convoy.VAN.y + 26 } });
    out.push({ x: SIGNAL.x, y: SIGNAL.y - 40, hit: 34, approach: { x: SIGNAL.x - 28, y: SIGNAL.y + 24 } });
  }
  if (s.world.delivered) TREE_SPOTS.forEach((sp, i) => { if (!s.world.trees[i]) out.push({ x: sp.x, y: sp.y - 10, hit: 32, approach: { x: sp.x, y: sp.y + 28 } }); });
  const c = cur(), mod = curMod();
  if (mod && mod.taps && quests.isStarted(c.id)) mod.taps(quests.data(c.id)).filter(t => t.approach).forEach(t => out.push(t));
  out.push({ x: HERO_DOOR.x, y: HERO_DOOR.y - 30, hit: 40, approach: { x: HERO_DOOR.x, y: HERO_DOOR.y + 10 }, arrive: () => openWardrobe() });
  return out;
}
function onTap(p) {
  if (game.busy) return;
  const c = cur(), mod = curMod();
  if (W.stones && mod && mod.taps) {   // أثناء عبور البركة: النقر على الحجر يعني القفز
    const st = mod.taps(quests.data(c.id)).filter(t => t.stone !== undefined).map(t => ({ t, d: Math.hypot(t.x - p.x, t.y - p.y) })).filter(o => o.d < o.t.hit).sort((a, b) => a.d - b.d)[0];
    if (st) mod.jump(W, quests.data(c.id), st.t.stone);
    return;
  }
  const hit = interactables().map(it => ({ it, d: Math.hypot(it.x - p.x, it.y - p.y) })).filter(o => o.d < o.it.hit).sort((a, b) => a.d - b.d)[0];
  const pl = W.player, dest = hit ? hit.it.approach : { x: p.x, y: p.y };
  const route = findPath(pl.x, pl.y, dest.x, dest.y, blocked);
  if (!route.length) { say(pl.x, pl.y - 80, 'لا طريق إلى هناك', '#B7791F', 1200); return; }
  pl.route = route; pl.target = route[0]; pl.onArrive = (hit && hit.it.arrive) || null;
  W.tapMark = { x: dest.x, y: dest.y, t: 0 };
}

/* ── الحديث: صاحب الدرس الحالي يعطي المهمة، والباقون يتحدثون عن حال القرية ── */
async function talkTo(n) {
  const s = game.state, c = cur(), mod = curMod();
  if (game.busy) return;
  if (c && mod && c.giver === n.id) {
    const d = quests.data(c.id);
    if (!quests.isStarted(c.id)) {
      const u = UNITS[c.u], firstOfUnit = LESSONS.filter(l => l.u === c.u)[0].id === c.id;
      if (firstOfUnit && c.u > 0) await screens.chapter(u.term, `الوحدة ${ar(u.n)}: ${u.title}`);
      n.talking = true; await hud.dialog(mod.intro(s.hero.name), people()); n.talking = false;
      if (mod.begin) mod.begin(d);
      quests.start(c.id);
      if (mod.onStart) mod.onStart(W, d);
      return;
    }
    if (mod.resume) return mod.resume(W);
    n.talking = true; await hud.dialog([{ who: n.id, text: 'المهمة تنتظرك: ' + mod.goal(d).replace(/^\S+\s/, '') }], people()); n.talking = false;
    return;
  }
  const lines = npcLines(n.id, s, s.hero.name);
  if (!lines.length) return;
  n.talking = true; await hud.dialog(lines, people()); n.talking = false;
  s.talked[n.id] = 1;
  if (['salem', 'umkhalid', 'yousef', 'hamad'].every(id => s.talked[id])) unlock('friend');
  bus.emit('save');
}
function nearest(list, r) { const p = W.player; let best = null, bd = r; list.forEach(o => { const d = Math.hypot(o.x - p.x, o.y - p.y); if (d < bd) { bd = d; best = o; } }); return best; }
function currentActions() {
  if (game.busy) return [];
  const s = game.state, m = s.missions.convoy, out = [], c = cur(), mod = curMod();
  if (W.stones && mod && mod.actions) return mod.actions(W, quests.data(c.id));
  const npc = nearest(W.npcs.filter(n => npcVisible(n, s)), 72);
  if (npc) out.push({ key: npc.id, label: `💬 ${npc.name}`, run: () => talkTo(npc) });
  if (mod && mod.actions && quests.isStarted(c.id)) out.push(...mod.actions(W, quests.data(c.id)));
  if (convoyActive()) {
    if (nearest([{ x: PILE.x, y: PILE.y + 20 }], 80)) {
      out.push({ key: 'pile', label: '📦 احمل صندوقاً', run: () => convoy.pick(W), disabled: m.pile <= 0 || s.carry >= CARRY_MAX });
      if (s.carry) out.push({ key: 'pile', label: '↩ أعِد صندوقاً', kind: 'ghost', run: () => convoy.putBack(W) });
    }
    const t = nearest(W.trucks.map(t => ({ x: t.x, y: t.y - 40, t })), 64);
    if (t) {
      const k = 'truck' + t.t.i;
      out.push({ key: k, label: '⬇ ضع في الشاحنة', run: () => convoy.load(W, t.t.i), disabled: !s.carry });
      if (m.loads[t.t.i] && s.carry < CARRY_MAX) out.push({ key: k, label: '⬆ خذ منها', kind: 'ghost', run: () => convoy.unload(W, t.t.i) });
    }
    if (nearest([{ x: convoy.VAN.x, y: convoy.VAN.y + 16 }], 52)) {
      out.push({ key: 'van', label: '⬇ ضع في العربة الصغيرة', run: () => convoy.loadVan(W), disabled: !s.carry });
      if (m.van && s.carry < CARRY_MAX) out.push({ key: 'van', label: '⬆ خذ من العربة', kind: 'ghost', run: () => convoy.unloadVan(W) });
    }
    if (nearest([{ x: SIGNAL.x - 20, y: SIGNAL.y + 10 }], 70)) out.push({ key: 'signal', label: '🚦 أطلق القافلة', kind: 'go', run: () => convoy.launch(W) });
  }
  const T = s.missions.tanks;
  if (c && c.id === 'decimalFractions' && T.status === 'active') {
    const tk = nearest(tanks.TANKS.map((t, i) => ({ x: t.x, y: t.y + 10, i })).filter(o => !T.done[o.i]), 70);
    if (tk) {
      const k = 'tank' + tk.i, lv = T.levels[tk.i];
      out.push({ key: k, label: '💧 اضخ (اضغط مطولاً)', hold: true, run: () => tanks.pump(W, tk.i, 1), disabled: lv >= 10 });
      out.push({ key: k, label: '↩ صرّف قليلاً', kind: 'ghost', run: () => tanks.pump(W, tk.i, -1), disabled: lv <= 0 });
      out.push({ key: k, label: '🔒 أغلق الصمام', kind: 'go', run: () => tanks.seal(W, tk.i), disabled: lv <= 0 });
    }
  }
  if (nearest([HERO_DOOR], 70)) out.push({ key: 'door', label: '🚪 خزانة البطل', run: () => openWardrobe() });
  if (s.world.delivered) {
    const sp = nearest(TREE_SPOTS.map((p, i) => ({ x: p.x, y: p.y + 10, i })).filter(o => !s.world.trees[o.i]), 66);
    if (sp) out.push({ key: 'spot' + sp.i, label: s.good >= TREE_COST ? `🌱 ازرع نخلة (${ar(TREE_COST)} 💚)` : `🌱 تحتاج ${ar(TREE_COST)} 💚`, kind: 'green', run: () => plant(W, sp.i), disabled: s.good < TREE_COST });
  }
  return out;
}

/* ── الهدف الحالي والسهم ── */
function objective() {
  const c = cur(), mod = curMod();
  if (!c) return '🎓 أكملتَ الدروس الـ٦٩ كلها! منصة التخرّج تنتظرك جنوب الورشة';
  if (!mod) return `✨ الوحدة ${ar(UNITS[c.u].n)} (${UNITS[c.u].title}) قريباً — ${c.mission}`;
  if (!quests.isStarted(c.id)) { const n = W.npcs.find(x => x.id === c.giver); return `💬 ${n ? n.name : ''} ينتظرك: «${c.mission}»`; }
  try { return mod.goal(quests.data(c.id)); } catch (e) { report('الهدف', c.id, e); return '🎯 ' + c.mission; }   // نص الهدف لا يُوقف اللعبة أبداً
}
function objectiveTarget() {
  const c = cur(), mod = curMod();
  if (mod) { try { return quests.isStarted(c.id) ? mod.target(quests.data(c.id), W) : npcPos(c.giver); } catch (e) { report('سهم الهدف', c.id, e); return null; } }
  if (!c) return { x: STAGE.x, y: STAGE.y - 40 };   // بعد الدروس كلها: السهم إلى منصة التخرّج
  const s = game.state, i = s.world.trees.findIndex(v => !v);
  return s.world.delivered && i >= 0 ? { x: TREE_SPOTS[i].x, y: TREE_SPOTS[i].y } : null;
}

/* ── التحديث ── */
function update(dt) {
  const s = game.state, pl = W.player;
  if (!W.stones && (!game.busy || pl.target)) updatePlayer(pl, dt, game.busy ? {} : eng.keys, blocked);
  W.npcs.forEach(n => { if (npcVisible(n, s)) updateNpc(n, dt, pl, blocked); });
  W.trucks.forEach(t => moveAlong(t, dt, 230));
  { const c = cur(), md = curMod(); if (md && md.update && quests.isStarted(c.id)) try { md.update(dt, W, quests.data(c.id)); } catch (e) { report('التحديث', c.id, e); } }
  updateFx(dt);
  if (W.tapMark) { W.tapMark.t += dt; if (W.tapMark.t > .6) W.tapMark = null; }
  hud.actions(currentActions());
  W.savedAt += dt;
  if (W.savedAt > 2) { W.savedAt = 0; if (!W.stones) s.player = { x: Math.round(pl.x), y: Math.round(pl.y), dir: pl.dir }; saveSoon(s); }
}

/* ── الرسم ── */
function render(ctx, view, t) {
  const s = game.state, m = s.missions.convoy, now = Date.now(), c = cur();
  drawGround(ctx, view);
  drawMarketGround(ctx);
  drawHarborGround(ctx, t);
  drawFortGround(ctx, t);
  drawFestivalGround(ctx, t);
  drawCoopGround(ctx);
  drawCaravanGround(ctx, t);
  drawWorkshopGround(ctx);
  drawFarm(ctx, s.world.delivered ? clamp((now - s.world.delivered) / 2600, 0, 1) : 0, t);
  TREE_SPOTS.forEach((sp, i) => drawSpot(ctx, sp, s.world.delivered && !s.world.trees[i]));
  drawGarden(ctx, quests.isDone('decimalAdd'));
  const mods = ALLMODS().filter(md => quests.isStarted(md.id) || quests.isDone(md.id));
  if (!mods.includes(UNIT1.sequences)) UNIT1.sequences.ground(ctx, {}, false, false, t);   // البركة والبستان جزء من العالم دائماً
  if (!mods.includes(UNIT1.factorsMultiples)) UNIT1.factorsMultiples.ground(ctx, {}, false, false, t);
  mods.forEach(md => { const d = quests.data(md.id), done = quests.isDone(md.id); try { if (md.ground) md.ground(ctx, d, !done, done, t); } catch (e) { report('رسم الأرض', md.id, e); } });
  const g = gateState();
  const list = staticDrawables(s, t).concat(...REGIONS.map((r, i) => r.draw(g[i], t))).filter(d => d.y > view.y - 60 && d.y < view.y + view.h + 200);
  mods.forEach(md => { const d = quests.data(md.id), done = quests.isDone(md.id); try { if (md.draw) list.push(...md.draw(d, t, !done, done)); } catch (e) { report('الرسم', md.id, e); } });
  TREE_SPOTS.forEach((sp, i) => { const pt = s.world.trees[i]; if (pt) { const k = clamp((now - pt) / 2200, .05, 1); list.push({ y: sp.y, draw: cc => drawPalm(cc, sp.x, sp.y, .2 + .8 * easeOut(k), false, t) }); } });
  W.trucks.forEach(tr => list.push({ y: tr.y + 4, draw: cc => drawTruck(cc, tr, m.loads[tr.i], convoyActive()) }));
  if (convoyActive()) list.push({ y: PILE.y, draw: cc => drawPile(cc, m.pile) });
  if (quests.isStarted('division1') || quests.isDone('division1')) list.push({ y: convoy.VAN.y + 4, draw: cc => drawVan(cc, m.van || 0) });
  list.push({ y: SIGNAL.y, draw: cc => drawSignal(cc, W.signalGreen) });
  const T = s.missions.tanks, tanksOn = quests.isStarted('decimalFractions') || quests.isDone('decimalFractions');
  if (tanksOn) tanks.TANKS.forEach((tk, i) => list.push({ y: tk.y, draw: cc => tanks.drawTank(cc, i, T.levels[i], T.targets ? T.targets[i] : { t: 'd', s: '؟' }, T.done[i], t) }));
  tanks.TANKS.forEach((tk, i) => { if (T.done[i]) { const hs = HOUSES[tk.house]; list.push({ y: hs.y + hs.h + 9, draw: cc => tanks.drawFlowers(cc, hs) }); } });
  list.push({ y: SHOP.y, draw: cc => drawShop(cc) });
  list.push({ y: HERO_DOOR.y - 13, draw: cc => bubble(cc, HERO_DOOR.x, HERO_DOOR.y - 58, '🚪 خزانة البطل', '#2A1B66') });
  const giverMark = n => c && c.ready && MODS[c.id] && c.giver === n.id && !quests.isStarted(c.id) ? '!' : null;
  W.npcs.filter(n => npcVisible(n, s)).forEach(n => list.push({ y: n.y, draw: cc => drawNpc(cc, n, giverMark(n)) }));
  const pl = W.player, mod = curMod(), hand = mod && mod.hand && c && quests.isStarted(c.id) ? mod.hand(quests.data(c.id)) : null;
  list.push({ y: pl.y, draw: cc => drawHuman(cc, Object.assign(hero(), { x: pl.x, y: pl.y, dir: pl.dir, phase: pl.phase, moving: pl.moving, carry: hand ? Math.min(hand.n, 6) : s.carry, bend: pl.act === 'plant' })) });
  list.sort((a, b) => a.y - b.y).forEach(d => d.draw(ctx));
  if (hand && hand.label && hand.label.trim()) bubble(ctx, pl.x, pl.y - 78 - Math.min(hand.n, 6) * 8, hand.label, '#2A1B66');
  if (mod && mod.handDraw && c && quests.isStarted(c.id)) try { mod.handDraw(ctx, pl.x, pl.y - 112, quests.data(c.id)); } catch (e) { report('ما في اليد', c.id, e); }
  if (W.tapMark) { const k = W.tapMark.t / .6; ctx.strokeStyle = `rgba(255,255,255,${1 - k})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(W.tapMark.x, W.tapMark.y, 8 + k * 16, 4 + k * 7, 0, 0, 7); ctx.stroke(); }
  drawFx(ctx);
  drawGuide(ctx, view, t);
}
function drawVan(ctx, load) {
  const v = convoy.VAN;
  ctx.save(); ctx.translate(v.x, v.y); ctx.scale(.72, .72); ctx.translate(-v.x, -v.y);
  drawTruck(ctx, { x: v.x, y: v.y, covered: !!game.state.world.delivered, sag: 0, flash: 0, shake: 0 }, load, false);
  ctx.restore();
  if (convoyActive()) bubble(ctx, v.x - 6, v.y - 44, ar(load), '#7B3F98');
}
const easeOut = k => 1 - Math.pow(1 - k, 3);
function drawGuide(ctx, view, t) {
  if (game.busy || W.stones) return;
  const g = objectiveTarget(); if (!g) return;
  const m = 46, inside = g.x > view.x + m && g.x < view.x + view.w - m && g.y > view.y + m + 90 && g.y < view.y + view.h - m - 70;
  if (inside) return;
  const cx = view.x + view.w / 2, cy = view.y + view.h / 2, a = Math.atan2(g.y - cy, g.x - cx);
  const rx = view.w / 2 - m, ry = view.h / 2 - m - 70, k = Math.min(rx / Math.abs(Math.cos(a) || 1e-6), ry / Math.abs(Math.sin(a) || 1e-6));
  ctx.save(); ctx.translate(cx + Math.cos(a) * k, cy + Math.sin(a) * k); ctx.rotate(a); const p = 1 + Math.sin(t * 6) * .08; ctx.scale(p, p);
  ctx.fillStyle = '#FFC23D'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(18, 0); ctx.lineTo(-10, -13); ctx.lineTo(-4, 0); ctx.lineTo(-10, 13); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
}

/* ── الخريطة المصغّرة وسجل الدروس ── */
function drawMini(cv) {
  const x = cv.getContext('2d'), sc = Math.min(cv.width / WORLD.w, cv.height / WORLD.h), s = game.state;
  x.fillStyle = '#EAD6A6'; x.fillRect(0, 0, cv.width, cv.height); x.save(); x.scale(sc, sc);
  x.fillStyle = '#5E6274'; ROADS.forEach(r => x.fillRect(r.x, r.y, r.w, r.h));
  x.fillStyle = s.world.delivered ? '#7CB35A' : '#C9A46B'; x.fillRect(FARM.x, FARM.y, FARM.w, FARM.h);
  x.fillStyle = '#3FA9F5'; x.fillRect(POND.x, POND.y, POND.w, POND.h);
  x.fillStyle = '#D9C6A0'; HOUSES.concat(SOUTH).forEach(b => x.fillRect(b.x, b.y, b.w, b.h));
  x.fillStyle = '#8FA0B5'; x.fillRect(WAREHOUSE.x, WAREHOUSE.y, WAREHOUSE.w, WAREHOUSE.h);
  x.fillStyle = '#FFC23D'; W.npcs.filter(n => npcVisible(n, s)).forEach(n => { x.beginPath(); x.arc(n.x, n.y, 20, 0, 7); x.fill(); });
  const g = objectiveTarget(); if (g) { x.fillStyle = '#2E9E5B'; x.beginPath(); x.arc(g.x, g.y, 30, 0, 7); x.fill(); }
  x.fillStyle = '#C2304A'; x.beginPath(); x.arc(W.player.x, W.player.y, 28, 0, 7); x.fill();
  x.restore();
}
function questLog() {
  const c = cur();
  return UNITS.map((u, ui) => {
    const ls = LESSONS.filter(l => l.u === ui), done = ls.filter(l => quests.isDone(l.id)).length;
    return `<div class="qunit"><b>${u.term === 1 ? 'الفصل الأول' : 'الفصل الثاني'} — الوحدة ${ar(u.n)}: ${u.title}</b><small>${u.place} — ${ar(done)} من ${ar(ls.length)}</small>
      ${ls.map(l => { const st = quests.isDone(l.id) ? 'done' : (c && c.id === l.id ? 'now' : 'next'); return `<div class="qrow ${st}"><span>${st === 'done' ? '✅' : st === 'now' ? '▶️' : '🔒'}</span><div><b>${l.title}</b><small>${l.mission}${l.ready ? '' : ' (قريباً)'}</small></div></div>`; }).join('')}</div>`;
  }).join('');
}

bus.on('save', () => { if (game.state) saveSoon(game.state); });
bus.on('good', () => hud.good());
bus.on('mission', () => hud.objective(objective()));
bus.on('achievement', a => setTimeout(() => hud.toast(`${a.icon} إنجاز جديد: ${a.name}`), 400));
bus.on('lessonDone', id => {
  resetGates();   // قد تُفتح بوابة الآن
  const l = LESSONS.find(x => x.id === id); setTimeout(() => hud.toast(`✅ أنجزت درس «${l.title}»`), 1200);
  if (LESSONS.filter(x => x.u === l.u).every(x => quests.isDone(x.id))) {   // اكتملت الوحدة: إنجازاتها ورسائل فتح البوابة
    const u = UNITS[l.u];
    u.ach.forEach(a => unlock(a));
    u.opens.forEach(([ms, msg]) => setTimeout(() => hud.toast(msg), ms));
  }
  if (allDone()) { unlock('all69'); setTimeout(() => hud.toast('🎓 أكملتَ الدروس الـ٦٩ كلها! اذهب إلى منصة التخرّج'), 4500); }
  if (id === 'mixedNumbers') setTimeout(() => hud.toast('💧 أم خالد تنتظرك في القرية: خزانات البيوت عطشى!'), 3500);   // الدرس التالي في القرية لا في السوق
});
window.__game = { get state() { return game.state; }, get W() { return W; }, eng, game, quests, MODS, findPath: (a, b) => findPath(a.x, a.y, b.x, b.y, blocked) };
boot();
