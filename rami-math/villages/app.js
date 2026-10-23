// تطبيق الصفين الثامن والتاسع: «خريطة القرى» (قرية مستقلة لكل وحدة من وحدات الكتاب) بدل العالم المفتوح.
// يستعمل من اللعبة: شاشات البداية والبطل واختيار الصف (ui/screens.js)، الحفظ لكل صف (save/save.js)، الأصوات، والجواهر.
// كل قرية في مجلدها villages/g<الصف>/<القرية>/index.js وتُحمَّل فقط عند دخولها.
import { GRADE, gradeAsked, gradeChosen, rememberGrade, markGradeAsked } from '../content/grade.js';
import { UNITS, LESSONS } from '../content/lessons.js';
import { screens, heroLook } from '../ui/screens.js';
import { loadSave, saveNow, wipeSave } from '../save/save.js';
import { fresh, upgrade, game } from '../core/state.js';
import { ar } from '../core/util.js';
import { sfx } from '../core/sound.js';
import { runVillage } from './runtime.js';
import { openHub } from './hub.js';

const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'villages/villages.css'; document.head.append(css);
const $ = id => document.getElementById(id);
let root = null;

/* التقدّم: الدروس المنجزة في state.quests.done (نفس شكل الصفوف الأخرى)، والقرية مفتوحة إذا انتهت كل دروس القرية قبلها */
export const unitLessons = u => LESSONS.filter(l => l.u === u);
export const isDone = id => !!(game.state && game.state.quests.done[id]);
export const unitDone = u => unitLessons(u).every(l => isDone(l.id));
export const unitOpen = u => u === 0 || unitDone(u - 1) || /[?&]open=1/.test(location.search);
export const starsOf = id => ((game.state.quests.data || {})[id] || {}).stars || 0;
const save = () => saveNow(game.state);

function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.remove('on'); void t.offsetWidth; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), 3000); }

/* حوار: فقاعة فوق المتكلم تتبعه، والضغط في أي مكان يتقدم سطراً. where(): موضعه على الشاشة */
function talk(who, lines, where) {
  return new Promise(res => {
    const el = document.createElement('div'); el.className = 'vtalk'; document.body.append(el);
    let i = 0, raf = 0;
    const show = () => { const l = lines[i]; el.innerHTML = `<b>${l.who || who.name}</b><p>${l.t}</p><span class="vnext">◀</span>`; sfx('pick'); };
    const place = () => { const p = where ? where() : null; if (p) { el.style.left = Math.max(12, Math.min(innerWidth - el.offsetWidth - 12, p.x - el.offsetWidth / 2)) + 'px'; el.style.top = Math.max(70, p.y - el.offsetHeight - 18) + 'px'; el.classList.add('anch'); } raf = requestAnimationFrame(place); };
    const next = e => { e.preventDefault(); if (++i >= lines.length) { cancelAnimationFrame(raf); el.remove(); removeEventListener('pointerdown', next, true); res(); } else show(); };
    show(); place(); setTimeout(() => addEventListener('pointerdown', next, true), 250);
  });
}

async function enterVillage(u) {
  const U = UNITS[u];
  let mod;
  try { mod = await import(`./g${GRADE}/${U.village}/index.js`); }
  catch (e) { toast(`🚧 ${U.icon} ${U.name}: قيد البناء، تُفتح قريباً`); return openMap(); }
  const def = mod.default, st = game.state, vs = st.vil;
  vs.at = U.village; save();
  root.className = 'vroot on';
  window.__villages.api = await runVillage(root, { ...def, name: U.name, icon: U.icon, unitTitle: `الوحدة ${ar(U.n)}: ${U.title}` }, {
    look: () => heroLook(st.hero),
    pos: (vs.pos || {})[U.village],
    savePos: p => { (vs.pos = vs.pos || {})[U.village] = p; save(); },
    progress: () => {
      const ls = unitLessons(u), cur = ls.find(l => !isDone(l.id));   // معرّف المحطة = معرّف درسها
      const goal = cur && (def.stations || []).some(s => s.id === cur.id) ? cur.id : null;
      return { lessons: ls.map(l => ({ id: l.id, title: l.title, done: isDone(l.id) })), goal,
        gems: st.gems || 0, text: cur ? `🎯 ${cur.mission || cur.title}` : `🏅 أنهيتَ دروس ${U.name} كلها!` };
    },
    canOpen: s => isDone(s.id),   // المحطات المنجزة تُعاد للتدرّب
    onStation: async (s, api) => {
      const L = LESSONS.find(l => l.id === s.id), play = def.lessons && def.lessons[s.id];
      if (!play) { toast(`🚧 «${L ? L.mission || L.title : s.label}»: المهمة قيد البناء`); return; }
      const m = await play();
      await m.default(api, { lesson: L, state: st, done: stars => { st.quests.done[L.id] = st.quests.done[L.id] || Date.now(); const d = (st.quests.data[L.id] = st.quests.data[L.id] || {}); d.stars = Math.max(d.stars || 0, stars || 1); save(); } });
    },
    talk: (who, lines, proj) => talk(who, lines, who.at ? () => proj(who.at.x, who.at.y, 90) : null),
    onExit: () => { vs.at = null; save(); openMap(); }
  });
}

function openMap() {
  root.className = 'vroot on';
  openHub(root, { units: UNITS, grade: GRADE, state: game.state, unitOpen, unitDone, unitLessons, isDone, starsOf, enter: u => { sfx('pick'); enterVillage(u); } });
}

function start(state) {
  game.state = upgrade(state);
  const s = game.state; s.grade = GRADE; s.vil = s.vil || {};
  $('hud').style.display = 'none'; $('game').style.display = 'none';
  root = document.createElement('div'); root.className = 'vroot'; document.body.insertBefore(root, $('dialog'));
  save();
  const at = UNITS.findIndex(U => U.village === s.vil.at);
  if (at >= 0 && unitOpen(at)) enterVillage(at); else openMap();
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
