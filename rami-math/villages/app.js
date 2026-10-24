// تطبيق الصفين الثامن والتاسع: عالم متصل كالصفوف ٥–٧ (world.js): قرية لكل وحدة من وحدات الكتاب متجاورة على الطريق الكبير، وبينها بوابات،
// و«خريطة القرى» للانتقال السريع إلى قرية مفتوحة.
// يستعمل من اللعبة: شاشات البداية والبطل واختيار الصف (ui/screens.js)، الحفظ لكل صف (save/save.js)، الأصوات، والجواهر.
// كل قرية في مجلدها villages/g<الصف>/<القرية>/index.js، ومجسّماتها تُبنى حين يقترب البطل منها.
import { GRADE, gradeAsked, gradeChosen, rememberGrade, markGradeAsked } from '../content/grade.js';
import { UNITS, LESSONS } from '../content/lessons.js';
import { screens, heroLook } from '../ui/screens.js';
import { loadSave, saveNow, wipeSave } from '../save/save.js';
import { fresh, upgrade, game } from '../core/state.js';
import { ar } from '../core/util.js';
import { sfx } from '../core/sound.js';
import { addGems } from '../world/decor.js';
import { runVillage } from './runtime.js';
import { openHub } from './hub.js';
import { composeWorld } from './world.js';

const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'villages/villages.css'; document.head.append(css);
const $ = id => document.getElementById(id);
let root = null;

/* التقدّم: الدروس المنجزة في state.quests.done (نفس شكل الصفوف الأخرى)، والقرية مفتوحة إذا انتهت كل دروس القرية قبلها */
export const unitLessons = u => LESSONS.filter(l => l.u === u);
export const isDone = id => !!(game.state && game.state.quests.done[id]);
export const unitDone = u => unitLessons(u).every(l => isDone(l.id));
const PREVIEW = /[?&]open=1/.test(location.search);   // معاينة المعلم: كل القرى ومغامراتها مفتوحة
export const unitOpen = u => u === 0 || unitDone(u - 1) || PREVIEW;
export const starsOf = id => ((game.state.quests.data || {})[id] || {}).stars || 0;
const save = () => saveNow(game.state);

function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.remove('on'); void t.offsetWidth; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), 3000); }

/* حوار: فقاعة فوق المتكلم تتبعه، والضغط في أي مكان يتقدم سطراً. where(): موضعه على الشاشة */
function talk(who, lines, where) {
  return new Promise(res => {
    document.querySelectorAll('.vtalk').forEach(x => x.remove());   // لا فقاعتان معاً أبداً
    const el = document.createElement('div'); el.className = 'vtalk'; document.body.append(el);
    let i = 0, raf = 0;
    const show = () => { const l = lines[i]; el.innerHTML = `<b>${l.who || who.name}</b><p>${l.t}</p><span class="vnext">◀</span>`; sfx('pick'); };
    const place = () => { const p = where ? where() : null; if (p) { el.style.left = Math.max(12, Math.min(innerWidth - el.offsetWidth - 12, p.x - el.offsetWidth / 2)) + 'px'; el.style.top = Math.max(70, p.y - el.offsetHeight - 18) + 'px'; el.style.bottom = 'auto'; el.classList.add('anch'); } raf = requestAnimationFrame(place); };
    const next = e => { e.preventDefault(); if (++i >= lines.length) { cancelAnimationFrame(raf); el.remove(); removeEventListener('pointerdown', next, true); res(); } else show(); };
    show(); place(); setTimeout(() => addEventListener('pointerdown', next, true), 250);
  });
}

/* العالم المتصل: كل القرى المبنية متجاورة على الطريق الكبير (world.js)، وبينها أودية وأسوار ببوابات تُفتح بإنهاء الوحدة */
const built = u => unitLessons(u).some(l => l.ready);
async function loadWorld() {
  const list = [];
  for (let u = 0; u < UNITS.length && built(u); u++) {
    try { list.push({ u, def: (await import(`./g${GRADE}/${UNITS[u].village}/index.js`)).default }); } catch (e) { console.error('[قرية الخير] تحميل القرية', UNITS[u].village, e); break; }
  }
  return composeWorld(list.map((e, i) => ({ ...e, next: UNITS[e.u + 1] ? { name: UNITS[e.u + 1].name, icon: UNITS[e.u + 1].icon, built: !!list[i + 1] } : null })));
}

async function enterVillage(u, o = {}) {
  const U = UNITS[u];
  if (!built(u)) { toast(`🚧 ${U.icon} ${U.name}: قيد البناء، تُفتح قريباً`); return openMap(); }
  const W = await loadWorld(), R0 = W.regions.find(R => R.u === u);
  if (!R0) { toast(`🚧 ${U.icon} ${U.name}: قيد البناء، تُفتح قريباً`); return openMap(); }
  const st = game.state, vs = st.vil;
  W.start = { x: R0.def.start.x + R0.ox, y: R0.def.start.y };
  const pos = o.pos && o.pos.x >= 0 && o.pos.x < W.size.w ? o.pos : null;
  W._cur = W.regionAt(pos ? pos.x : W.start.x);
  const cur = () => (W._cur || R0).u;
  vs.at = UNITS[cur()].village; save();
  root.className = 'vroot on';
  W.name = U.name; W.icon = U.icon; W.unitTitle = `الوحدة ${ar(U.n)}: ${U.title}`;
  window.__villages.world = W;
  window.__villages.api = await runVillage(root, W, {
    look: () => heroLook(st.hero),
    pos,
    savePos: p => { vs.wpos = p; save(); },
    progress: () => {
      const u = cur(), V = UNITS[u], D = W.regions.find(R => R.u === u).def, ls = unitLessons(u), next = ls.find(l => !isDone(l.id));   // معرّف المحطة = معرّف درسها
      const goal = next && W.stations.some(s => s.id === next.id) ? next.id : null;
      return { title: `${V.icon} ${V.name}`, sub: `الوحدة ${ar(V.n)}: ${V.title}`, lessons: ls.map(l => ({ id: l.id, title: l.title, done: isDone(l.id) })), goal,
        adv: D.adventure && (unitDone(u) || PREVIEW) ? ((vs.adv || {})[V.village] ? '🗺️ ' + '★'.repeat(vs.adv[V.village].stars) : '🗺️ المغامرة') : '',
        gems: st.gems || 0, text: next ? `🎯 ${next.mission || next.title}` : `🏅 أنهيتَ دروس ${V.name} كلها! البوابة شرقاً تنتظرك` };
    },
    onRegion: u => { vs.at = UNITS[u].village; save(); toast(`${UNITS[u].icon} ${UNITS[u].name}`); },
    gateState: (u, C) => ({ open: C.built && (unitDone(u) || PREVIEW), seen: !!(vs.gates || {})[UNITS[u].village] }),
    gateSeen: (u, C) => { (vs.gates = vs.gates || {})[UNITS[u].village] = 1; save(); toast(`🚪 فُتحت البوابة إلى ${C.label}!`); },
    gateLocked: (u, C) => toast(C.built ? `🔒 تُفتح البوابة إلى ${C.label} حين تنهي دروس ${UNITS[u].name}` : `🚧 ${C.label}: قيد البناء، تُفتح قريباً`),
    canOpen: s => isDone(s.id),   // المحطات المنجزة تُعاد للتدرّب
    onStation: async (s, api) => {
      const u = s._u, V = UNITS[u], D = s._R.def, L = LESSONS.find(l => l.id === s.id), play = D.lessons && D.lessons[s.id];
      if (!play) { toast(`🚧 «${L ? L.mission || L.title : s.label}»: المهمة قيد البناء`); return; }
      const m = await play();
      const wasDone = unitDone(u);
      await m.default(api, { lesson: L, state: st, done: stars => { st.quests.done[L.id] = st.quests.done[L.id] || Date.now(); const d = (st.quests.data[L.id] = st.quests.data[L.id] || {}); d.stars = Math.max(d.stars || 0, stars || 1); save(); } });
      if (!wasDone && unitDone(u)) toast(D.adventure ? `🎉 أنهيتَ ${V.name}! انتظرتك مغامرة (🗺️ في الأعلى)، والبوابة شرقاً فُتحت` : `🎉 أنهيتَ ${V.name}! البوابة شرقاً فُتحت`);
    },
    talk: (who, lines, proj) => { const p = W.people.find(p => p.id === who.id && p._u === cur()); return talk(who, lines, p ? () => proj(p.x, p.y, 92) : null); },
    adventure: async () => {   // مغامرة القرية الحالية: تُحفظ أفضل نجومها، وجواهرها تُضاف
      const V = UNITS[cur()], D = W.regions.find(R => R.u === cur()).def, m = await D.adventure();
      st._save = save; await new Promise(res => m.playAdventure({ state: st, onDone: r => { if (r) { const a = (vs.adv = vs.adv || {}), old = a[V.village] || { stars: 0 }; a[V.village] = { stars: Math.max(old.stars, r.stars), gems: r.gems }; save(); } res(); } }));
    },
    onExit: () => { openMap(); }
  });
}

function openMap() {
  root.className = 'vroot on';
  openHub(root, { units: UNITS, grade: GRADE, state: game.state, unitOpen, unitDone, unitLessons, isDone, starsOf, enter: u => { sfx('pick'); enterVillage(u); } });
}

import('../core/events.js').then(m => m.bus.on('save', () => game.state && save()));   // المغامرات تحفظ تقدّمها عبر bus
function start(state) {
  game.state = upgrade(state);
  const s = game.state; s.grade = GRADE; s.vil = s.vil || {};
  $('hud').style.display = 'none'; $('game').style.display = 'none';
  document.body.classList.add('v89');   // مظهر الصفين ٨ و٩ (villages.css): يشمل لوحة التحدي المشتركة
  root = document.createElement('div'); root.className = 'vroot'; document.body.insertBefore(root, $('dialog'));
  save();
  const at = UNITS.findIndex(U => U.village === s.vil.at);
  if (at >= 0 && unitOpen(at)) enterVillage(at, { pos: s.vil.wpos }); else openMap();
}

function boot() {
  const saved = loadSave();
  if (!gradeAsked()) {
    if (navigator.webdriver && !/[?&]gradepick=1/.test(location.search)) { if (!gradeChosen()) rememberGrade(GRADE); }
    else { screens.grade(() => { rememberGrade(GRADE); markGradeAsked(); boot(); }); return; }
  }
  screens.title(saved, { onContinue: () => start(saved), onNew: hero => { wipeSave(); start(fresh(hero)); }, onRestore: s => { saveNow(s); start(s); } });
}
window.__villages = { get state() { return game.state; }, enter: enterVillage, map: openMap, UNITS, LESSONS };
boot();
