// «نشاط الدرس»: لعبة اختيارية قصيرة بعد إنهاء الدرس — ٦ جولات بأعداد جديدة من مولّد تحدي الدرس نفسه، داخل مشهد يتقدم مع كل إجابة.
// تُفتح من «رحلة الدروس» في الخريطة. لا مؤقت ولا عقاب، والخروج متاح دائماً. تحفظ أفضل نجوم في game.state.activities[id].
import { ar } from '../core/util.js';
import { sfx } from '../core/sound.js';
import { game } from '../core/state.js';
import { bus } from '../core/events.js';
import { LESSONS } from '../content/lessons.js';
import { runChallenge, pickN } from './challenge.js';
import { sheetOpen, sheetClose, btn } from './bench.js';
import * as quests from './quests.js';

const ROUNDS = 6;
const BLOCK = ['#E2475C', '#FFC23D', '#3FA3F5', '#2E9E5B', '#8E6CF6', '#F08A24'];
/* المشاهد: كل مشهد يرسم التقدم i من n */
export const SCENES = {
  tower: { name: 'برج القرية', icon: '🏗️', goal: 'كل إجابة صحيحة تضيف طابقاً إلى البرج',
    draw: (i, n) => `<div class="acTower">${Array.from({ length: n }, (_, k) => `<i class="${k < i ? 'on' : ''}${k === i - 1 ? ' new' : ''}" style="--c:${BLOCK[k % BLOCK.length]};--w:${170 - k * 18}px"></i>`).join('')}<b>${i >= n ? '🚩' : '🏗️'}</b></div>` },
  camel: { name: 'رحلة الجمل', icon: '🐪', goal: 'كل إجابة صحيحة تقرّب الجمل من الواحة',
    draw: (i, n) => `<div class="acCamel"><span class="oasis">🌴</span><span class="camel" style="inset-inline-end:${4 + i / n * 76}%">🐪</span>${Array.from({ length: n }, (_, k) => `<em class="${k < i ? 'on' : ''}" style="inset-inline-end:${10 + (k + .5) / n * 76}%"></em>`).join('')}</div>` },
  balloons: { name: 'بالونات المهرجان', icon: '🎈', goal: 'كل إجابة صحيحة تنفخ بالوناً حتى تطير السلة',
    draw: (i, n) => `<div class="acBalloons${i >= n ? ' fly' : ''}"><div class="bl">${Array.from({ length: n }, (_, k) => `<i class="${k < i ? 'on' : ''}${k === i - 1 ? ' new' : ''}" style="--c:${BLOCK[k % BLOCK.length]}"></i>`).join('')}</div><span class="basket">🧺</span></div>` }
};
const sceneOf = id => { const l = LESSONS.find(x => x.id === id); return ['tower', 'camel', 'balloons'][(l ? l.u : 0) % 3]; };
export const rec = id => { const s = game.state; s.activities = s.activities || {}; return (s.activities[id] = s.activities[id] || { plays: 0, best: 0 }); };
export const hasActivity = (id, mod) => !!(mod && mod.challenge) && quests.isDone(id);

export function openActivity(W, id, mod) {
  if (!hasActivity(id, mod)) return;
  const sc = SCENES[sceneOf(id)], ch = mod.challenge, R = rec(id);
  const intro = () => {
    sheetOpen(`<div class="chEnd acIntro"><div class="chTreasure">${sc.icon}</div><h3>نشاط: ${sc.name}</h3><p>${LESSONS.find(l => l.id === id).title}</p>
      <p class="muted">${sc.goal}. ${ar(ROUNDS)} جولات بأعداد جديدة، بلا مؤقت. تستطيع الخروج متى شئت.</p>
      ${R.plays ? `<p class="chGot">لعبته ${ar(R.plays)} ${R.plays === 1 ? 'مرة' : R.plays === 2 ? 'مرتين' : 'مرات'} — أفضل نتيجة: ${'★'.repeat(R.best)}${'☆'.repeat(3 - R.best)}</p>` : ''}
      <button class="act big go" id="acGo">ابدأ ${sc.icon}</button><button class="act ghost" id="acBack">رجوع</button></div>`);
    document.querySelector('#panel .sheet').classList.add('chSheet');
    btn('acBack', () => sheetClose()); btn('acGo', start);
  };
  const start = () => {
    const d = { ch: { items: pickN(ch.make(), ROUNDS), i: 0, firstTry: 0, tries: 0, gems: 0, streak: 0 } };
    R.run = d;   // للاختبار: الجولات الحالية
    runChallenge(W, d, { id, who: ch.who, title: `${sc.icon} ${sc.name}`, make: ch.make, scene: sc.draw,
      exit: () => { delete R.run; bus.emit('save'); },
      onDone: (stars, C) => {
        delete R.run; R.plays++; const better = stars > R.best; R.best = Math.max(R.best, stars);
        const qd = quests.data(id); qd.stars = Math.max(qd.stars || 0, stars);
        const pts = 5 + stars * 5; game.state.good += pts; bus.emit('good'); bus.emit('save'); sfx('win');
        sheetOpen(`<div class="chEnd"><div class="chTreasure">${sc.icon}</div><div class="chStars">${[1, 2, 3].map(k => `<span class="${k <= stars ? 'on' : ''}">★</span>`).join('')}</div>
          <h3>${stars === 3 ? 'إتقان كامل!' : 'أحسنت!'}</h3><p class="chGot">+${ar(pts)} 💚 نقاط خير</p>
          <p class="muted">أجبت ${ar(C.firstTry)} من ${ar(C.items.length)} من المحاولة الأولى.${better && R.plays > 1 ? ' 🎉 أفضل نتيجة لك في هذا النشاط!' : ''}</p>
          <button class="act big go" id="acAgain">العب مرة أخرى 🔁</button><button class="act ghost" id="acEnd">رجوع إلى العالم</button></div>`);
        document.querySelector('#panel .sheet').classList.add('chSheet');
        btn('acAgain', start); btn('acEnd', () => sheetClose());
      } });
  };
  intro();
}
