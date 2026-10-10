// «مهمة الموسم»: في عيد الفطر وعيد الأضحى واليوم الوطني تتزيّن القرية تلقائياً بالتاريخ، وتظهر مهمة احتفالية خاصة
// (٥ جولات من الدروس المنجزة، بلا مؤقت) مرة واحدة في كل موسم من كل عام. الجائزة: عيدية ٢٠ 💎 وزينة الموسم في ساحة البئر.
import { game } from '../core/state.js';
import { bus } from '../core/events.js';
import { sfx, cheer } from '../core/sound.js';
import { ar } from '../core/util.js';
import { LESSONS } from '../content/lessons.js';
import { seasonNow, SEASONS } from '../core/season.js';
import { runChallenge, pickN } from './challenge.js';
import { sheetOpen, sheetClose, btn } from './bench.js';
import { addGems, DECOR } from '../world/decor.js';
import * as quests from './quests.js';

const MISSION = {
  eid: { who: 'salem', title: '🎉 مهمة العيد: عيدية القرية', story: 'العيد في قرية الخير! أهل القرية يوزّعون العيدية على من يحل ألغازهم الاحتفالية.', prize: 'eidStar' },
  adha: { who: 'shaikha', title: '🐑 مهمة عيد الأضحى', story: 'عيد الأضحى المبارك: ساعد الجدة شيخة في تجهيز ضيافة العيد بحل ألغازها.', prize: 'eidStar' },
  national: { who: 'azzan', title: '🎆 مهمة اليوم الوطني', story: 'القرية تحتفل باليوم الوطني المجيد! أكمل ألغاز الاحتفال لتنال نُصُب الخنجر العُماني.', prize: 'khanjar' }
};
export const season = () => seasonNow();
const key = k => `${k}-${new Date().getFullYear()}`;
export const seasonDone = k => !!((game.state.seasons || {})[key(k)]);

export function seasonCard() {
  const k = season(); if (!k) return '';
  const S = SEASONS[k], M = MISSION[k], done = seasonDone(k);
  return `<button class="act qseason ${done ? 'done' : ''}" data-season="1">${M.title} ${done ? '✓' : ''}<small>${done ? `${S.greet} أنجزتها هذا العام` : `${S.greet} عيدية ٢٠ 💎 وزينة خاصة`}</small></button>`;
}
export function openSeason(W, MODS) {
  const k = season(); if (!k) return;
  const S = SEASONS[k], M = MISSION[k], d0 = DECOR.find(x => x.id === M.prize);
  const ls = LESSONS.filter(l => quests.isDone(l.id) && MODS[l.id] && MODS[l.id].challenge);
  if (!ls.length) { sheetOpen(`<div class="chEnd"><div class="chTreasure">${S.icon}</div><h3>${S.greet}</h3><p class="muted">أنجز أول درس لتشارك في ${M.title.replace(/^\S+ /, '')}.</p><button class="act" id="acEnd">حسناً</button></div>`); btn('acEnd', () => sheetClose()); return; }
  if (seasonDone(k)) { sheetOpen(`<div class="chEnd"><div class="chTreasure">${S.icon}</div><h3>${S.greet}</h3><p class="chGot">أنجزتَ ${M.title.replace(/^\S+ /, '')} هذا العام ✓</p><p class="muted">زينة الموسم في ساحة البئر تذكّرك به: ${d0.icon} ${d0.name}.</p><button class="act" id="acEnd">رجوع</button></div>`); btn('acEnd', () => sheetClose()); return; }
  const intro = () => {
    sheetOpen(`<div class="chEnd acIntro seasonIntro"><div class="chTreasure">${S.icon}</div><h3>${M.title}</h3><p>${M.story}</p>
      <p class="muted">٥ جولات من دروسك، بلا مؤقت. الجائزة: عيدية ٢٠ 💎 و«${d0.icon} ${d0.name}» في ساحة البئر.</p>
      <button class="act big go" id="acGo">ابدأ ${S.icon}</button><button class="act ghost" id="acBack">لاحقاً</button></div>`);
    document.querySelector('#panel .sheet').classList.add('chSheet');
    btn('acBack', () => sheetClose()); btn('acGo', start);
  };
  const start = () => {
    const items = []; for (let t = 0; items.length < 5 && t < 30; t++) { const l = pickN(ls, 1)[0], it = pickN(MODS[l.id].challenge.make(), 1)[0]; if (it) { it.src = l.id; items.push(it); } }
    const d = { ch: { items, i: 0, firstTry: 0, tries: 0, gems: 0, streak: 0 } }; game.state.seasonRun = d;
    runChallenge(W, d, { id: 'season', who: M.who, title: M.title, make: () => items, scene: () => `<div class="acSeason">${S.cols.map((c, i) => `<i style="--c:${c};--d:${i * .2}s"></i>`).join('')}<b>${S.icon}</b></div>`,
      exit: () => { delete game.state.seasonRun; bus.emit('save'); },
      onDone: (stars, C) => {
        delete game.state.seasonRun; const s = game.state; s.seasons = s.seasons || {}; s.seasons[key(k)] = Date.now();
        s.decor = s.decor || {}; const first = !s.decor[M.prize]; if (first) s.decor[M.prize] = Date.now();
        addGems(20); bus.emit('save'); sfx('win'); cheer('fanfare');
        sheetOpen(`<div class="chEnd"><div class="chDance"><i>${S.icon}</i><span>🎉</span><span>🎊</span></div><h3>${S.greet}</h3><p class="chGot">عيديتك: +٢٠ 💎</p>
          ${first ? `<p class="chGot">🎁 زينة جديدة في ساحة البئر: ${d0.icon} ${d0.name}</p>` : ''}<p class="muted">أجبت ${ar(C.firstTry)} من ${ar(C.items.length)} من المحاولة الأولى. كل عام وأنت بخير!</p>
          <button class="act big go" id="acEnd">${first ? 'لنرَ الزينة! 👀' : 'رائع!'}</button></div>`);
        document.querySelector('#panel .sheet').classList.add('chSheet');
        btn('acEnd', () => { sheetClose(); if (first) bus.emit('decorShow', M.prize); });
      } });
  };
  intro();
}
