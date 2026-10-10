// «هدف الأسبوع»: أنجز ٥ تحديات في الأسبوع (تحدي درس، نشاط، خبير، مهمة اليوم، مغامرة ختام) لتنال ٣٠ 💎 و٢٠ 💚.
// الأسبوع يبدأ يوم الأحد. بلا عقاب: ما فات لا يُخصم، والأسبوع الجديد يبدأ من الصفر بهدوء.
import { game } from '../core/state.js';
import { bus } from '../core/events.js';
import { cheer } from '../core/sound.js';
import { ar } from '../core/util.js';
import { addGems } from '../world/decor.js';
export const GOAL = 5, REWARD = 30;
export function weekKey(t = Date.now()) { const d = new Date(t); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - d.getDay()); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; }
export function weekRec() {
  const s = game.state, k = weekKey(); let w = s.weekly;
  if (!w || w.k !== k) w = s.weekly = { k, n: 0, got: false, wins: (w && w.wins) || 0 };
  return w;
}
/* يُستدعى عند إنهاء أي تحدٍّ */
export function weeklyTick() {
  const w = weekRec(); if (w.got) return;
  w.n = Math.min(GOAL, w.n + 1);
  if (w.n >= GOAL) {
    w.got = true; w.wins++; game.state.good = (game.state.good || 0) + 20; bus.emit('good');
    setTimeout(() => { cheer('fanfare'); addGems(REWARD); bus.emit('toast', `🏆 أنجزتَ هدف الأسبوع: ${ar(GOAL)} تحديات! +${ar(REWARD)} 💎 و+٢٠ 💚`); }, 900);
  } else setTimeout(() => bus.emit('toast', `🎯 هدف الأسبوع: ${ar(w.n)} من ${ar(GOAL)} تحديات`), 900);
  bus.emit('save');
}
const DAYS_LEFT = () => { const d = new Date(); return 7 - d.getDay(); };
export function weeklyCard() {
  const w = weekRec(), left = DAYS_LEFT();
  return `<div class="qweek ${w.got ? 'done' : ''}"><b>🎯 هدف الأسبوع: أنجز ${ar(GOAL)} تحديات</b><div class="qwBar">${Array.from({ length: GOAL }, (_, i) => `<i class="${i < w.n ? 'on' : ''}">${i < w.n ? '⭐' : ''}</i>`).join('')}<em>🏆</em></div>
    <small>${w.got ? `✓ أنجزته! عُد الأحد لهدف جديد${w.wins > 1 ? `، حققته ${ar(w.wins)} أسابيع` : ''}` : `${ar(w.n)} من ${ar(GOAL)}، الجائزة ${ar(REWARD)} 💎، ${left === 1 ? 'آخر يوم في الأسبوع' : `باقي ${ar(left)} أيام`}`}</small></div>`;
}
