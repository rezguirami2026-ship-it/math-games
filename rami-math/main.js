// نقطة الدخول: تربط الأنظمة ببعضها، واللعبة كلها تسير على ترتيب دروس المنهج
import { game, fresh, upgrade, CARRY_MAX, TREE_COST } from './core/state.js';
import { bus } from './core/events.js';
import { ambience, sfx } from './core/sound.js';
import { ar, clamp } from './core/util.js';
import { createEngine } from './core/engine.js';
import { loadSave, saveSoon, saveNow, wipeSave, PREVIEW } from './save/save.js';
import { createPlayer, updatePlayer } from './player/player.js';
import { findPath } from './world/nav.js';
import { drawHuman, heightOf } from './character/human.js';
import { WORLD, PILE, SIGNAL, TREE_SPOTS, FARM, HOUSES, WAREHOUSE, ROADS, SOUTH, SCHOOL, staticColliders, drawGround, drawFarm, drawPalm, staticDrawables, ramadanDecor } from './world/village.js';
import { makeTrucks, truckColliders, drawTruck, drawPile, drawSignal, drawSpot, updateFx, drawFx, moveAlong, say, bubble, sparkle, dust } from './world/entities.js';
import { makeNpcs, npcVisible, updateNpc, drawNpc } from './npc/npc.js';
import { updateKids, kidsItems, kidsPeople3d } from './world/school.js';
import { CHAPTER, introLines, npcLines } from './story/dialogues.js';
import * as convoy from './missions/convoy.js';
import { plant } from './missions/planting.js';
import * as tanks from './missions/tanks.js';
import { SHOP, GARDEN, openCounter, drawShop, drawShopBack, drawGarden } from './missions/shop.js';
import { UNIT1, POND, ORCH } from './missions/unit1.js';
import { stage2 } from './missions/challenge.js';
import { openActivity, hasActivity } from './missions/activity.js';
import { levelOf } from './core/levels.js';
import { BADGES, checkBadges } from './achievements/badges.js';
import { CH as CH1 } from './content/challenges1.js';
import { CH as CH2 } from './content/challenges2.js';
import { CH as CH3 } from './content/challenges3.js';
import { CH as CH4 } from './content/challenges4.js';
import { CH as CH5 } from './content/challenges5.js';
import { CH as CH6 } from './content/challenges6.js';
import { CH as CH7 } from './content/challenges7.js';
import { CH as CH8 } from './content/challenges8.js';
import { CH as CH9 } from './content/challenges9.js';
import { UNIT2 } from './missions/unit2.js';
import { UNIT3 } from './missions/unit3.js';
import { UNIT4 } from './missions/unit4.js';
import { T2U1 } from './missions/t2u1.js';
import { T2U2 } from './missions/t2u2.js';
import { T2U3 } from './missions/t2u3.js';
import { T2U4 } from './missions/t2u4.js';
import { T2U5 } from './missions/t2u5.js';
import { workshopColliders, drawWorkshopGround, workshopDrawables, STAGE } from './world/workshop.js';
import { signboard, upright, CAM, SEASON, FLAGS, bigSign } from './world/art.js';
import { ramadanOn } from './core/season.js';
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
import { hud, gfx } from './ui/hud.js';
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
  { u: 0, walls: marketColliders, draw: (open, t) => marketDrawables(open, t) },        // السوق الأسبوعي
  { u: 1, walls: harborColliders, draw: harborDrawables },                      // الميناء
  { u: 2, walls: fortColliders, draw: fortDrawables },                          // القلعة
  { u: 3, walls: festivalColliders, draw: festivalDrawables },                  // ساحة المهرجان (نهاية الفصل الأول)
  { u: 5, walls: coopColliders, draw: coopDrawables },                        // سوق الجمعية
  { u: 6, walls: caravanColliders, draw: caravanDrawables },                    // طريق القافلة
  { u: 7, walls: workshopColliders, draw: (open, t) => workshopDrawables(open, t, allDone()) }   // ورشة البنّاء
];
/* حالة البوابات والجدران تُحسب عند إنهاء درس فقط، لا في كل إطار ولا في كل خطوة من إيجاد الطريق */
let gates = null, walls = null;
const gateState = () => gates || (gates = REGIONS.map(r => unitDone(r.u)));
const resetGates = () => { gates = null; walls = null; };
/* لحظة فتح البوابة: تنتظر حتى تظهر البوابة على الشاشة، ثم ينفتح المصراعان في ١٫٤ ثانية مع شرر وصوت */
const GATE_PTS = [{ x: 1506, y: 640 }, { x: 2306, y: 640 }, { x: 1240, y: 1712 }, { x: 1240, y: 2600 }, { x: 1240, y: 3500 }, { x: 1240, y: 4500 }, { x: 1240, y: 5500 }];
const gateAnim = { pending: {}, at: {} };
function gateOpenness(i, open, view) {
  if (!open) return 0;
  const p = GATE_PTS[i], seen = p.x > view.x + 20 && p.x < view.x + view.w - 20 && p.y > view.y + 60 && p.y < view.y + view.h - 40;
  if (gateAnim.pending[i]) { if (!seen) return 0; delete gateAnim.pending[i]; gateAnim.at[i] = performance.now(); sfx('gate'); sparkle(p.x, p.y - 50, 16, '#FFC23D'); eng.shake(.4); }
  if (gateAnim.at[i]) { const k = (performance.now() - gateAnim.at[i]) / 1400; if (k < 1) return Math.max(.001, 1 - Math.pow(1 - k, 3)); delete gateAnim.at[i]; dust(p.x - 30, p.y + 14); dust(p.x + 30, p.y + 14); }
  return 1;
}
/* المناطق للافتة الاسم: الحدود بالأسوار، والاسم يطابق place في UNITS */
const AREAS = [
  { id: 'village', icon: '🏡', name: 'قرية الخير', in: (x, y) => y < 1712 && x < 1500 },
  { id: 'market', icon: '🛒', name: 'السوق الأسبوعي', in: (x, y) => y < 1712 && x < 2300 },
  { id: 'harbor', icon: '⚓', name: 'الميناء', in: (x, y) => y < 1712 },
  { id: 'fort', icon: '🏰', name: 'القلعة', in: (x, y) => y < 2600 },
  { id: 'festival', icon: '🎪', name: 'ساحة المهرجان', in: (x, y) => y < 3500 },
  { id: 'coop', icon: '🏪', name: 'سوق الجمعية', in: (x, y) => y < 4500 },
  { id: 'caravan', icon: '🐪', name: 'طريق القافلة', in: (x, y) => y < 5500 },
  { id: 'workshop', icon: '🛠️', name: 'ورشة البنّاء', in: () => true }
];
const areaSub = a => { const us = UNITS.filter(u => u.place === a.name); return us.length ? `الفصل ${us[0].term === 1 ? 'الأول' : 'الثاني'} · ` + us.map(u => `الوحدة ${ar(u.n)}: ${u.title}`).join(' · ') : ''; };
function areaCheck(dt) {   // يتغير الاسم بعد ثبات اللاعب في المنطقة الجديدة نصف ثانية (لا وميض عند الحدود)
  const pl = W.player, a = AREAS.find(r => r.in(pl.x, pl.y)), s = game.state;
  if (a === W.area) { W.areaT = 0; return; }
  if (a !== W.areaCand) { W.areaCand = a; W.areaT = 0; return; }
  if ((W.areaT += dt) < .5) return;
  W.area = a; W.areaT = 0;
  const v = s.world.visited = s.world.visited || {}, isNew = !v[a.id] && a.id !== 'village';
  v[a.id] = 1; bus.emit('save');
  hud.region(a.icon, a.name, areaSub(a), isNew); sfx(isNew ? 'newRegion' : 'region');
  if (isNew) sparkle(pl.x, pl.y - 50, 20);
}
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
  if (PREVIEW) {   // معاينة للمعلم: كل الدروس منتهية والبوابات مفتوحة، بحفظ منفصل
    const s = loadSave() || (() => { const p = fresh({ name: 'زائر', kind: 'boy', skin: '#DDA779', color: '#2F6FB2' }); p.story.introDone = true; LESSONS.forEach(l => { p.quests.done[l.id] = Date.now(); }); p.missions.convoy.status = 'done'; p.world.delivered = Date.now(); return p; })();
    start(s); setTimeout(() => hud.toast('👁️ وضع المعاينة: كل البوابات مفتوحة، ولا يتأثر تقدّم الطلاب'), 1500); return;
  }
  const saved = loadSave();
  screens.title(saved, { onContinue: () => start(saved), onNew: hero => { wipeSave(); start(fresh(hero)); }, onRestore: s => { saveNow(s); start(s); } });
}
async function start(state) {
  game.state = upgrade(state);
  W = buildWorld(state); resetGates();
  hud.init({ drawMini, questLog, anchor: speakerAnchor, activity: id => openActivity(W, id, MODS[id]) });
  hud.show(true); hud.good(); hud.level(); hud.objective(objective());
  if (state.levelSeen == null) state.levelSeen = levelOf(state).n;   // الحفظ القديم: يبدأ من مستواه الحالي بلا احتفال
  eng.snap(W.player); eng.follow = W.player; eng.onTap = onTap; eng.state = () => game.state;
  if (want3d()) await init3D();
  eng.run(update, render);
  saveNow(state);
  if (!state.story.introDone) {
    await screens.chapter(CHAPTER.n, CHAPTER.title);
    await hud.dialog(introLines(state.hero.name), people());
    state.story.introDone = true; saveNow(state);
  }
}
/* ── العرض ثلاثي الأبعاد (renderer3d): يُحمَّل فقط عند طلبه، ويرجع إلى الرسم الحالي إن لم يدعم الجهاز WebGL أو فشل التحميل ── */
const V3D = 'نسخة 3D · ٢٨';   // تُعرض في شاشة التحميل وفي الزاوية: للتأكد أن المتصفح حمّل آخر نسخة
const want3d = () => gfx.d3();
function loadingScreen() {
  const el = document.createElement('div'); el.className = 'load3d';
  el.innerHTML = '<div class="lbox"><b>🏡 قرية الخير</b><small>تجهيز العالم ثلاثي الأبعاد…</small><div class="lbar"><i></i></div><small class="lver">' + V3D + '</small></div>';
  document.body.appendChild(el); const bar = el.querySelector('i');
  return { set: k => { bar.style.width = Math.round(k * 100) + '%'; }, done: () => { el.classList.add('out'); setTimeout(() => el.remove(), 500); } };
}
/* الجودة التلقائية: تقيس الإطارات ٥ ثوانٍ بعد بدء اللعب؛ إن قلّت عن ٢٦ في الثانية تنخفض الجودة وحدها (وتعود لاحقاً من زر الحقيبة) */
function autoQuality() {
  eng.l3.setQuality('high'); let n = 0, t0 = 0;
  const tick = now => { if (!t0) t0 = now; n++; if (now - t0 < 5000) return requestAnimationFrame(tick); const fps = n * 1000 / (now - t0);
    if (fps < 26 && (localStorage.getItem('ramimath_q') || 'auto') === 'auto') { eng.l3.setQuality('low'); hud.toast('⚙️ خُفّضت جودة الرسوم تلقائياً لتبقى اللعبة سلسة على هذا الجهاز'); } };
  setTimeout(() => requestAnimationFrame(tick), 2500);
}
async function init3D() {
  let load = null;
  try {
    const R = await import('./renderer3d/index.js');
    if (!R.webglOK()) { setTimeout(() => hud.toast('⚠️ هذا الجهاز لا يدعم العرض ثلاثي الأبعاد (WebGL)، فتعمل النسخة العادية'), 800); return; }
    load = loadingScreen(); FLAGS.three = true;
    try { await Promise.race([document.fonts.load('900 88px Cairo', 'مستودع الطرود ٠١٢٣'), new Promise(r => setTimeout(r, 2500))]); } catch (e) {}   // لافتات المباني تُقاس بخط Cairo نفسه (وإلا قُصّ النص)
    let q = 'auto'; try { q = localStorage.getItem('ramimath_q') || 'auto'; } catch (e) {}   // تلقائية: تبدأ عالية وتنخفض وحدها إن كان الجهاز بطيئاً
    eng.l3 = await R.create3D({ quality: q === 'low' ? 'low' : 'high', world: WORLD, paintGround: paintStaticGround, onProgress: k => load.set(k) });
    eng.l3.ground = paintDynamicGround; eng.l3.people = people3d; eng.l3.gates = () => W.gateK; eng.l3.allDone = allDone; eng.l3.ramadan = () => SEASON.ramadan; eng.l3.signal = () => W.signalGreen;
    eng.l3.vehicles = () => { const s = game.state, m = s.missions.convoy, out = W.trucks.map(tr => ({ id: 't' + tr.i, x: tr.x, y: tr.y, load: m.loads[tr.i], covered: tr.covered, shake: tr.shake, sag: tr.sag }));
      if (quests.isStarted('division1') || quests.isDone('division1')) out.push({ id: 'van', x: convoy.VAN.x, y: convoy.VAN.y, load: m.van || 0, covered: !!s.world.delivered, s: .72 }); return out; };
    gfx.onQ = v => { if (v !== 'auto') eng.l3.setQuality(v); else autoQuality(); };
    if (q === 'auto') autoQuality();
    const tag = document.createElement('div'); tag.className = 'ver3d'; tag.textContent = V3D; document.body.appendChild(tag);
  } catch (e) { console.error('[قرية الخير] تعذّر العرض ثلاثي الأبعاد، نكمل بالرسم الحالي', e); setTimeout(() => hud.toast('⚠️ تعذّر تشغيل العرض ثلاثي الأبعاد على هذا الجهاز: ' + (e && e.message || e).toString().slice(0, 60)), 800); FLAGS.three = false; eng.l3 = null; const c = document.getElementById('game3d'); if (c) c.remove(); }
  if (load) load.done();
}
/* الأرض الثابتة لقطع الأرض في 3D: نفس رسم الأرض ثنائي الأبعاد (الطرق والساحات والحقول) */
function paintStaticGround(ctx, v) {
  drawGround(ctx, v);
  const near = (x0, y0, x1, y1) => v.x < x1 + 60 && v.x + v.w > x0 - 60 && v.y < y1 + 60 && v.y + v.h > y0 - 60;
  const t = 0;
  if (near(1500, 0, 2930, 1750)) drawMarketGround(ctx);
  if (near(2290, 0, 3400, 6600)) drawHarborGround(ctx, t);
  if (near(0, 1600, 2930, 2620)) drawFortGround(ctx, t);
  if (near(0, 2580, 2930, 3520)) drawFestivalGround(ctx, t);
  if (near(0, 3480, 2930, 4520)) drawCoopGround(ctx);
  if (near(0, 4480, 2930, 5520)) drawCaravanGround(ctx, t);
  if (near(0, 5480, 2930, 6600)) drawWorkshopGround(ctx);
}
/* الأرض المتغيرة: كل ما كان يُرسم على الأرض فوق الطبقة الثابتة (المزرعة، البركة، رسومات الدروس، علامة النقر) */
function paintGroundLayer(ctx, t) {
  const s = game.state, now = Date.now();
  drawFarm(ctx, s.world.delivered ? clamp((now - s.world.delivered) / 2600, 0, 1) : 0, t);
  TREE_SPOTS.forEach((sp, i) => drawSpot(ctx, sp, s.world.delivered && !s.world.trees[i]));
  drawGarden(ctx, quests.isDone('decimalAdd'));
  const mods = ALLMODS().filter(md => quests.isStarted(md.id) || quests.isDone(md.id));
  if (!mods.includes(UNIT1.sequences)) UNIT1.sequences.ground(ctx, {}, false, false, t);   // البركة والبستان جزء من العالم دائماً
  if (!mods.includes(UNIT1.factorsMultiples)) UNIT1.factorsMultiples.ground(ctx, {}, false, false, t);
  mods.forEach(md => { const d = quests.data(md.id), done = quests.isDone(md.id); try { if (md.ground) md.ground(ctx, d, !done, done, t); } catch (e) { report('رسم الأرض', md.id, e); } });
  if (W.tapMark) { const k = W.tapMark.t / .6; ctx.strokeStyle = `rgba(255,255,255,${1 - k})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(W.tapMark.x, W.tapMark.y, 8 + k * 16, 4 + k * 7, 0, 0, 7); ctx.stroke(); }
}
function paintDynamicGround(ctx) { paintGroundLayer(ctx, eng.t); }
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
/* موضع فقاعة الكلام على الشاشة: فوق رأس المتكلم. الراوي ومن هو خارج الشاشة: لا موضع (سطر أسفل الشاشة) */
function speakerAnchor(who, person) {
  if (who === 'narrator' || !W) return null;
  const p = who === 'hero' ? Object.assign({}, hero(), { x: W.player.x, y: W.player.y }) : person;
  if (!p || p.x === undefined) return null;
  const s = eng.toScreen(p.x, p.y, heightOf(p) + 6);
  return s.x < 0 || s.x > innerWidth || s.y < 40 || s.y > innerHeight ? null : s;
}
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
  if (mod && mod.challenge && quests.isStarted(c.id) && quests.data(c.id).chStage === 2)   // المرحلة الثانية: تحدي الشخصية (يُستأنف من أي مكان)
    return [{ key: 'challenge', label: '🎯 ' + mod.challenge.title, kind: 'go', run: () => stage2(W, quests.data(c.id), mod) }];
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
  if (mod.challenge && quests.data(c.id).chStage === 2) return '🎯 ' + mod.challenge.title + ': اضغط الزر لتكمل أسئلته';
  try { return mod.goal(quests.data(c.id)); } catch (e) { report('الهدف', c.id, e); return '🎯 ' + c.mission; }   // نص الهدف لا يُوقف اللعبة أبداً
}
function objectiveTarget() {
  const c = cur(), mod = curMod();
  if (mod) { try { if (mod.challenge && quests.isStarted(c.id) && quests.data(c.id).chStage === 2) return null; return quests.isStarted(c.id) ? mod.target(quests.data(c.id), W) : npcPos(c.giver); } catch (e) { report('سهم الهدف', c.id, e); return null; } }
  if (!c) return { x: STAGE.x, y: STAGE.y - 40 };   // بعد الدروس كلها: السهم إلى منصة التخرّج
  const s = game.state, i = s.world.trees.findIndex(v => !v);
  return s.world.delivered && i >= 0 ? { x: TREE_SPOTS[i].x, y: TREE_SPOTS[i].y } : null;
}

/* ── حركات البطل: كل مؤثر صوتي يحرّك البطل حركته (التقاط، وضع، احتفال، انحناء) ── */
const ANIMS = { pick: ['pickup', .35], drop: ['place', .35], win: ['celebrate', 1.1], plant: ['pickup', .6], good: ['interact', .4] };
bus.on('sfx', k => {
  const a = ANIMS[k]; if (!W) return;
  if (a) W.player.anim = { name: a[0], t: 0, dur: a[1] };
  const p = W.player;   // إحساس اللعب: كل فعل مهم له أثر في العالم
  if (k === 'pick' || k === 'drop') dust(p.x, p.y);
  if (k === 'win') { eng.kick(1); sparkle(p.x, p.y - 40, 18); }
  if (k === 'good') sparkle(p.x, p.y - 50, 6);
  if (k === 'plant') sparkle(p.x, p.y - 10, 10, '#7CC36B');
  if (k === 'cough') eng.shake(.5);
});
const routeLeft = pl => { if (!pl.target) return 0; let d = Math.hypot(pl.target.x - pl.x, pl.target.y - pl.y); (pl.route || []).forEach((p, i, r) => { if (i) d += Math.hypot(p.x - r[i - 1].x, p.y - r[i - 1].y); }); return d; };

/* ── التحديث ── */
function update(dt) {
  updateKids(dt);   // طلاب المدرسة يلعبون
  const s = game.state, pl = W.player;
  pl.speed = routeLeft(pl) > 280 ? 215 : 150;   // يجري في الطرق الطويلة ويمشي قرب الهدف
  if (pl.anim && (pl.anim.t += dt / pl.anim.dur) >= 1) pl.anim = null;
  if (!W.stones && (!game.busy || pl.target)) updatePlayer(pl, dt, game.busy ? {} : eng.keys, blocked);
  W.npcs.forEach(n => { if (npcVisible(n, s)) updateNpc(n, dt, pl, blocked); });
  W.trucks.forEach(t => moveAlong(t, dt, 230));
  { const c = cur(), md = curMod(); if (md && md.update && quests.isStarted(c.id)) try { md.update(dt, W, quests.data(c.id)); } catch (e) { report('التحديث', c.id, e); } }
  updateFx(dt);
  if (!W.stones) areaCheck(dt);
  // شبكة أمان: انشغال بلا حوار ولا لوحة ولا شاشة لأكثر من ١٥ ثانية يعني خللاً؛ نحرّر اللاعب ونسجّل الخطأ
  const uiOpen = ['dialog', 'panel', 'screen'].some(id => document.getElementById(id).classList.contains('on'));
  if (game.busy && !uiOpen && !W.stones) { if ((W.busyT = (W.busyT || 0) + dt) > 15) { game.busy = false; W.busyT = 0; report('انشغال عالق', cur() ? cur().id : '-', new Error('game.busy بقي true بلا نافذة مفتوحة')); } } else W.busyT = 0;
  ambience(W.area ? W.area.id : 'village', dt);   // أصوات المنطقة: ريح، موج، همهمة، طيور، أجراس…
  if (W.tapMark) { W.tapMark.t += dt; if (W.tapMark.t > .6) W.tapMark = null; }
  hud.actions(currentActions());
  W.savedAt += dt;
  if (W.savedAt > 2) { W.savedAt = 0; if (!W.stones) s.player = { x: Math.round(pl.x), y: Math.round(pl.y), dir: pl.dir }; saveSoon(s); }
}

/* ── الرسم ── */
function render(ctx, view, t) {
  if (eng.l3) return render3d(ctx, view, t);
  CAM.x = view.x + view.w / 2; CAM.y = view.y + view.h / 2;   // منظور الكاميرا: ما ارتفع يبتعد عن مركز الشاشة
  SEASON.ramadan = ramadanOn(); eng.mood = SEASON.ramadan ? 'dusk' : 'day';   // أجواء رمضان: غروب دافئ وفوانيس
  const s = game.state, m = s.missions.convoy, now = Date.now(), c = cur();
  drawGround(ctx, view);
  // أرض المناطق: فقط ما يقترب من الشاشة (الظلال تمتد قليلاً جنوباً وشرقاً)
  const near = (x0, y0, x1, y1) => view.x < x1 + 260 && view.x + view.w > x0 - 260 && view.y < y1 + 260 && view.y + view.h > y0 - 260;
  if (near(1500, 0, 2930, 1750)) drawMarketGround(ctx);
  if (near(2290, 0, 3400, 6600)) drawHarborGround(ctx, t);
  if (near(0, 1600, 2930, 2620)) drawFortGround(ctx, t);
  if (near(0, 2580, 2930, 3520)) drawFestivalGround(ctx, t);
  if (near(0, 3480, 2930, 4520)) drawCoopGround(ctx);
  if (near(0, 4480, 2930, 5520)) drawCaravanGround(ctx, t);
  if (near(0, 5480, 2930, 6600)) drawWorkshopGround(ctx);
  const mw = W.tapMark; W.tapMark = null; paintGroundLayer(ctx, t); W.tapMark = mw;   // علامة النقر تُرسم بعد العناصر
  const list = worldItems(view, t, false);
  ordered(ctx, list);
  heroExtras(ctx);
  if (W.tapMark) { const k = W.tapMark.t / .6; ctx.strokeStyle = `rgba(255,255,255,${1 - k})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(W.tapMark.x, W.tapMark.y, 8 + k * 16, 4 + k * 7, 0, 0, 7); ctx.stroke(); }
  ramadanDecor(ctx, view, t);
  drawFx(ctx);
  drawGuide(ctx, view, t);
}
/* العرض ثلاثي الأبعاد: المشهد رُسم في canvas الخلفي؛ هنا العناصر القائمة (الشخصيات، أدوات الدروس، الفقاعات) فوقه */
function render3d(ctx, view, t) {
  const L = eng.l3, dpr = eng.dpr, setT = m => ctx.setTransform(dpr * m[0], dpr * m[1], dpr * m[2], dpr * m[3], dpr * m[4], dpr * m[5]);
  SEASON.ramadan = ramadanOn(); eng.mood = SEASON.ramadan ? 'dusk' : 'day';
  const list = worldItems(view, t, true);
  // يُرسم فقط ما أمام الكاميرا وبمقياس معقول: الصفوف خلف الكاميرا أو قريبة منها جداً كانت تُرسم مقلوبة وضخمة (مستطيلات كبيرة تتحرك على الشاشة)
  const ok = m => m[0] > 0 && m[3] > 0 && m[0] < 4 && m[3] < 4 && isFinite(m[4]) && isFinite(m[5]), V = L.view;
  list.filter(d => !V || (d.y > V.y - 400 && d.y < V.y + V.h + 260)).sort((a, b) => a.y - b.y).forEach(d => { const m = L.itemTransform(d.y); if (!ok(m)) return; setT(m); d.draw(ctx); });
  setT(L.itemTransform(W.player.y)); heroExtras(ctx);
  drawFx(ctx);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); drawMarks3d(ctx, t); drawGuide3d(ctx, t);
}
/* السهم إلى الهدف على حافة الشاشة (بإحداثيات الشاشة في 3D) */
function drawGuide3d(ctx, t) {
  if (game.busy || W.stones) return;
  const g = objectiveTarget(); if (!g) return;
  const p = eng.l3.project(g.x, g.y, 0), m = 46, W2 = eng.w, H2 = eng.h;
  if (p.x > m && p.x < W2 - m && p.y > m + 90 && p.y < H2 - m - 70) return;
  const cx = W2 / 2, cy = H2 / 2, a = Math.atan2(p.y - cy, p.x - cx), rx = W2 / 2 - m, ry = H2 / 2 - m - 70, k = Math.min(rx / Math.abs(Math.cos(a) || 1e-6), ry / Math.abs(Math.sin(a) || 1e-6));
  ctx.save(); ctx.translate(cx + Math.cos(a) * k, cy + Math.sin(a) * k); ctx.rotate(a); const pz = 1 + Math.sin(t * 6) * .08; ctx.scale(pz * 1.3, pz * 1.3);
  ctx.fillStyle = '#FFC23D'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(18, 0); ctx.lineTo(-10, -13); ctx.lineTo(-4, 0); ctx.lineTo(-10, 13); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
}
/* كل العناصر القائمة في العالم (مرتبة لاحقاً حسب y). three: المباني المحوّلة تُرسم مجسّمة فتُستثنى هنا */
function worldItems(view, t, three) {
  const s = game.state, m = s.missions.convoy, now = Date.now(), c = cur();
  const mods = ALLMODS().filter(md => quests.isStarted(md.id) || quests.isDone(md.id));
  const g = gateState();
  const gk = REGIONS.map((r, i) => gateOpenness(i, g[i], view)); W.gateK = gk;   // انفتاح البوابات (يقرؤه العرض ثلاثي الأبعاد أيضاً)
  const list = staticDrawables(s, t, W.player, { three }).concat(...REGIONS.map((r, i) => r.draw(gk[i], t))).filter(d => d.y > view.y - 60 && d.y < view.y + view.h + 200);
  mods.forEach(md => { const d = quests.data(md.id), done = quests.isDone(md.id); try { if (md.draw) list.push(...md.draw(d, t, !done, done)); } catch (e) { report('الرسم', md.id, e); } });
  TREE_SPOTS.forEach((sp, i) => { const pt = s.world.trees[i]; if (pt) { const k = clamp((now - pt) / 2200, .05, 1); list.push({ y: sp.y, x: sp.x, draw: cc => drawPalm(cc, sp.x, sp.y, .2 + .8 * easeOut(k), false, t) }); } });
  if (!three) W.trucks.forEach(tr => list.push({ y: tr.y + 4, x: tr.x, draw: cc => drawTruck(cc, tr, m.loads[tr.i], convoyActive()) }));
  else if (convoyActive()) W.trucks.forEach(tr => list.push({ y: tr.y + 4, draw: cc => bubble(cc, tr.x - 10, tr.y - 78, ar(m.loads[tr.i]), tr.flash ? '#E2475C' : '#2A1B66') }));   // في 3D: الشاحنة مجسّمة، والرقم فوقها
  if (convoyActive()) list.push({ y: PILE.y, x: PILE.x, draw: cc => drawPile(cc, m.pile) });
  if ((quests.isStarted('division1') || quests.isDone('division1')) && !three) list.push({ y: convoy.VAN.y + 4, x: convoy.VAN.x, draw: cc => drawVan(cc, m.van || 0) });
  else if ((quests.isStarted('division1') || quests.isDone('division1')) && convoyActive()) list.push({ y: convoy.VAN.y + 4, draw: cc => bubble(cc, convoy.VAN.x - 6, convoy.VAN.y - 56, ar(m.van || 0), '#7B3F98') });
  if (!three) list.push({ y: SIGNAL.y, x: SIGNAL.x, draw: cc => drawSignal(cc, W.signalGreen) });
  const T = s.missions.tanks, tanksOn = quests.isStarted('decimalFractions') || quests.isDone('decimalFractions');
  if (tanksOn) tanks.TANKS.forEach((tk, i) => list.push({ y: tk.y, x: tk.x, draw: cc => tanks.drawTank(cc, i, T.levels[i], T.targets ? T.targets[i] : { t: 'd', s: '؟' }, T.done[i], t) }));
  tanks.TANKS.forEach((tk, i) => { if (T.done[i]) { const hs = HOUSES[tk.house]; list.push({ y: hs.y + hs.h + 9, draw: cc => tanks.drawFlowers(cc, hs) }); } });
  if (!three) list.push({ y: SHOP.y - 42, x: SHOP.x, draw: cc => drawShopBack(cc) }, { y: SHOP.y, x: SHOP.x, draw: cc => drawShop(cc) });
  if (three) {   // لافتات أماكن ثابتة كانت مرسومة على الأرض: قائمة وواضحة في 3D
    const O = ORCH, W2 = O.cell * O.n, G = GARDEN;
    list.push({ y: O.y - 14, x: O.x + W2 / 2, draw: cc => bigSign(cc, O.x + W2 / 2, O.y - 14, 'بستان العم حمد', { fs: 18, h: 30, bg: '#2E7D5B', line: '#FFE7A0' }) },
      { y: G.y + G.h + 20, x: G.x + G.w / 2, draw: cc => bigSign(cc, G.x + G.w / 2, G.y + G.h + 20, quests.isDone('decimalAdd') ? 'حديقة المدرسة 🌼' : 'حديقة المدرسة', { fs: 18, h: 26, bg: '#B0476A', line: '#FFE7A0' }) });
  }
  if (!three) list.push({ y: HERO_DOOR.y - 13, draw: cc => signboard(cc, HERO_DOOR.x + 52, HERO_DOOR.y - 66, '🚪 خزانة البطل') });   // لافتة على جدار بيت البطل (في 3D على الواجهة نفسها)
  const giverMark = n => c && c.ready && MODS[c.id] && c.giver === n.id && !quests.isStarted(c.id) ? '!' : null;
  // الشخصيات خارج الشاشة لا تُرسم (كانت كلها تُرسم في كل إطار)
  list.push(...kidsItems(drawNpc, view, three));
  if (!three) W.npcs.filter(n => npcVisible(n, s) && n.x > view.x - 60 && n.x < view.x + view.w + 60 && n.y > view.y - 20 && n.y < view.y + view.h + 110).forEach(n => list.push({ y: n.y, x: n.x, lean: .5, draw: cc => drawNpc(cc, n, giverMark(n)) }));   // في 3D: الشخصيات مجسّمة (people3d)
  const pl = W.player, mod = curMod(), hand = mod && mod.hand && c && quests.isStarted(c.id) ? mod.hand(quests.data(c.id)) : null;
  const pa = pl.anim ? pl.anim.name : pl.moving ? (pl.speed > 160 ? 'run' : 'walk') : 'idle';
  if (!three) list.push({ y: pl.y, x: pl.x, lean: .5, draw: cc => drawHuman(cc, Object.assign(hero(), { x: pl.x, y: pl.y, dir: pl.dir, phase: pl.phase, moving: pl.moving, carry: hand ? Math.min(hand.n, 6) : s.carry, bend: pl.act === 'plant', anim: pa, animT: pl.anim ? pl.anim.t : 0 })) });
  return list;
}
/* الشخصيات للعرض ثلاثي الأبعاد: البطل وأهل القرية القريبون من الرؤية، بمظهرهم وحالتهم (قراءة فقط) */
function people3d() {
  const s = game.state, v = eng.l3.view, pl = W.player, c = cur(), mod = curMod(), hand = mod && mod.hand && c && quests.isStarted(c.id) ? mod.hand(quests.data(c.id)) : null;
  const H = Object.assign({ id: 'hero' }, hero()), out = [{ id: 'hero', look: H, lookKey: JSON.stringify(H), faceCam: true, x: pl.x, y: pl.y, moving: pl.moving, phase: pl.phase, run: pl.speed > 160, dir: pl.dir,
    anim: pl.act === 'plant' ? 'pickup' : pl.anim ? pl.anim.name : null, animT: pl.act === 'plant' ? .5 : pl.anim ? pl.anim.t : 0, carry: hand ? Math.min(hand.n, 6) : s.carry }];
  W.npcs.forEach(n => { if (npcVisible(n, s) && n.x > v.x - 80 && n.x < v.x + v.w + 80 && n.y > v.y - 60 && n.y < v.y + v.h + 80)
    out.push({ id: n.id, look: n, lookKey: n.id, x: n.x, y: n.y, moving: n.moving, phase: n.phase, dir: n.dir, anim: n.anim && !n.moving ? n.anim.name : null, animT: n.anim ? n.anim.t : 0, carry: 0, face: Math.hypot(n.x - pl.x, n.y - pl.y) < 150 ? pl : null }); });
  out.push(...kidsPeople3d(v));   // طلاب المدرسة
  return out;
}
/* علامة المهمة فوق رأس من ينتظر البطل (فوق المجسّم، على الشاشة) */
function drawMarks3d(ctx, t) {
  const c = cur(); if (!c || !c.ready || !MODS[c.id] || quests.isStarted(c.id)) return;
  const n = W.npcs.find(x => x.id === c.giver); if (!n || !npcVisible(n, game.state)) return;
  const p = eng.l3.project(n.x, n.y, heightOf(n) + 22 + Math.sin(t * 3) * 3);
  ctx.save(); ctx.translate(p.x, p.y); ctx.shadowColor = 'rgba(0,0,0,.3)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 2;
  ctx.fillStyle = '#FFC23D'; ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(11, 0); ctx.lineTo(0, 14); ctx.lineTo(-11, 0); ctx.closePath(); ctx.fill();
  ctx.shadowColor = 'transparent'; ctx.strokeStyle = '#FFF6E2'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#3A2400'; ctx.font = '900 15px Cairo, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('!', 0, 1);
  ctx.restore();
}
const ordered = (ctx, list) => list.sort((a, b) => a.y - b.y).forEach(d => d.x !== undefined ? upright(ctx, d.x, d.y, d.draw, d.lean) : d.draw(ctx));   // القائم يميل مع منظور الكاميرا
function heroExtras(ctx) {   // ما في يد البطل: لافتة العدد، ورسم الدرس الخاص
  const pl = W.player, c = cur(), mod = curMod(), hand = mod && mod.hand && c && quests.isStarted(c.id) ? mod.hand(quests.data(c.id)) : null;
  if (hand && hand.label && hand.label.trim()) bubble(ctx, pl.x, pl.y - 78 - Math.min(hand.n, 6) * 8, hand.label, '#2A1B66');
  if (mod && mod.handDraw && c && quests.isStarted(c.id)) try { mod.handDraw(ctx, pl.x, pl.y - 112, quests.data(c.id)); } catch (e) { report('ما في اليد', c.id, e); }
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
  x.fillStyle = '#D9C6A0'; HOUSES.concat(SOUTH, [SCHOOL]).forEach(b => x.fillRect(b.x, b.y, b.w, b.h));
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
      ${ls.map(l => { const st = quests.isDone(l.id) ? 'done' : (c && c.id === l.id ? 'now' : 'next'); const stars = quests.data(l.id).stars || 0, act = st === 'done' && hasActivity(l.id, MODS[l.id]);
        return `<div class="qrow ${st}"><span>${st === 'done' ? '✅' : st === 'now' ? '▶️' : '🔒'}</span><div><b>${l.title}${stars ? ` <em class="qstars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</em>` : ''}</b><small>${l.mission}${l.ready ? '' : ' (قريباً)'}</small></div>${act ? `<button class="act qact" data-act="${l.id}">🎲 نشاط</button>` : ''}</div>`; }).join('')}</div>`;
  }).join('');
}

bus.on('save', () => { if (game.state) saveSoon(game.state); });
bus.on('good', () => hud.good());
bus.on('save', () => { if (game.state) checkBadges(unlock); });
bus.on('save', () => {   // الارتقاء: يُحتفل به مرة واحدة حين تصبح اللعبة حرة
  if (!game.state || !W) return; const L = hud.level(); if (L.n <= (game.state.levelSeen || 1)) return;
  game.state.levelSeen = L.n; sfx('win');
  const show = () => { if (game.busy || document.getElementById('panel').classList.contains('on')) return setTimeout(show, 600); hud.panel('levelup'); };
  setTimeout(show, 900);
});
bus.on('mission', () => hud.objective(objective()));
bus.on('achievement', a => setTimeout(() => hud.toast(`${a.icon} ${a.id && a.id.startsWith('b_') ? 'وسام جديد' : 'إنجاز جديد'}: ${a.name}`), 400));
Object.entries(Object.assign({}, CH1, CH2, CH3, CH4, CH5, CH6, CH7, CH8, CH9)).forEach(([id, c]) => { if (MODS[id]) MODS[id].challenge = c; });
quests.gate.has = id => !!(MODS[id] && MODS[id].challenge);
bus.on('challenge', id => {   // انتهت مهمة العالم: يُفتح التحدي وحده بعد آخر حوار
  const go = () => { if (!W || game.busy) return setTimeout(go, 300);
    const c = cur(); if (c && c.id === id && quests.data(id).chStage === 2) stage2(W, quests.data(id), MODS[id]); };
  setTimeout(go, 500);
});
bus.on('lessonDone', id => {
  const before = gateState().slice(); resetGates();   // قد تُفتح بوابة الآن: حركتها تبدأ حين تظهر على الشاشة
  gateState().forEach((o, i) => { if (o && !before[i]) gateAnim.pending[i] = true; });
  const l = LESSONS.find(x => x.id === id); setTimeout(() => hud.toast(`✅ أنجزت درس «${l.title}»`), 1200);
  if (LESSONS.filter(x => x.u === l.u).every(x => quests.isDone(x.id))) {   // اكتملت الوحدة: إنجازاتها ورسائل فتح البوابة
    const u = UNITS[l.u];
    u.ach.forEach(a => unlock(a));
    u.opens.forEach(([ms, msg]) => setTimeout(() => hud.toast(msg), ms));
  }
  if (allDone()) { unlock('all69'); setTimeout(() => hud.toast('🎓 أكملتَ الدروس الـ٦٩ كلها! اذهب إلى منصة التخرّج'), 4500); }
  if (id === 'mixedNumbers') setTimeout(() => hud.toast('💧 أم خالد تنتظرك في القرية: خزانات البيوت عطشى!'), 3500);   // الدرس التالي في القرية لا في السوق
});
window.__game = { get state() { return game.state; }, get W() { return W; }, eng, game, quests, MODS, activity: id => openActivity(W, id, MODS[id]), findPath: (a, b) => findPath(a.x, a.y, b.x, b.y, blocked) };
boot();
