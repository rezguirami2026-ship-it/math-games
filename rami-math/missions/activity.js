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
import { track } from '../core/ops.js';
import { dueList, reviewItem } from './review.js';
import { addGems } from '../world/decor.js';

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

/* ── مغامرة ختام الوحدة: تُفتح بعد إنهاء كل دروس الوحدة. ١٠ جولات من دروس الوحدة كلها داخل قصة، ومكافأة كبيرة ── */
const FINALE = [
  { who: 'salem', title: 'مهرجان قرية الخير', story: 'القرية تحتفل! جهّز المهرجان بحل ألغاز الأعداد التي تعلمتها.', scene: 'balloons' },
  { who: 'abdullah', title: 'السوق الكبير', story: 'يوم السوق الكبير: القياسات والمواعيد كلها بين يديك.', scene: 'camel' },
  { who: 'saif', title: 'سفينة الأشكال', story: 'سفينة كبيرة تنتظر في الميناء: حمّلها بالهندسة الصحيحة.', scene: 'tower' },
  { who: 'azzan', title: 'حصن الأرقام', story: 'افتح أبواب الحصن العظيم واحداً واحداً بالحساب.', scene: 'tower' },
  { who: 'safiya', title: 'وليمة المهرجان', story: 'وليمة كبيرة لأهل الساحة: قِس وزن واحسب كالطهاة.', scene: 'balloons' },
  { who: 'yaqoob', title: 'معرض الإحصاء', story: 'معرض الساحة يحتاج من يقرأ البيانات ويتنبأ.', scene: 'balloons' },
  { who: 'jamal', title: 'كنز الجمعية', story: 'خزينة الجمعية مقفلة بألغاز الكسور والنسب.', scene: 'tower' },
  { who: 'sultan', title: 'القافلة الكبرى', story: 'القافلة الكبرى تعبر الصحراء: كن دليلها.', scene: 'camel' },
  { who: 'jaber', title: 'تاج الكريستال', story: 'اصنع تاج الكريستال من الأشكال والزوايا.', scene: 'tower' }
];
export const finaleRec = u => { const s = game.state; s.finales = s.finales || {}; return (s.finales[u] = s.finales[u] || { plays: 0, best: 0 }); };
export const finaleOpen = u => LESSONS.filter(l => l.u === u).every(l => quests.isDone(l.id));
export function openFinale(W, u, MODS) {
  if (!finaleOpen(u)) return;
  const F = FINALE[u] || FINALE[0], sc = SCENES[F.scene], R = finaleRec(u), ls = LESSONS.filter(l => l.u === u && MODS[l.id] && MODS[l.id].challenge);
  const intro = () => {
    sheetOpen(`<div class="chEnd acIntro finaleIntro"><div class="chTreasure">👑</div><h3>مغامرة الختام: ${F.title}</h3><p>${F.story}</p>
      <p class="muted">١٠ جولات من كل دروس الوحدة، بلا مؤقت. المكافأة: ٥٠ 💚 و١٠ 💎${R.best ? ` — أفضل نتيجة: ${'★'.repeat(R.best)}${'☆'.repeat(3 - R.best)}` : ''}</p>
      <button class="act big go" id="acGo">ابدأ المغامرة 👑</button><button class="act ghost" id="acBack">رجوع</button></div>`);
    document.querySelector('#panel .sheet').classList.add('chSheet');
    btn('acBack', () => sheetClose()); btn('acGo', start);
  };
  const start = () => {
    const items = []; for (let k = 0; items.length < 10 && k < 40; k++) { const l = ls[k % ls.length], pool = MODS[l.id].challenge.make(); const it = pool[Math.floor(Math.random() * pool.length)]; if (it) { it.src = l.id; items.push(it); } }
    const d = { ch: { items: pickN(items, 10), i: 0, firstTry: 0, tries: 0, gems: 0, streak: 0 } };
    R.run = d; track('adventure_started', 'unit' + (u + 1));
    runChallenge(W, d, { id: 'finale' + u, who: F.who, title: `👑 ${F.title}`, make: () => items, scene: sc.draw,
      exit: () => { delete R.run; bus.emit('save'); },
      onDone: (stars, C) => {
        delete R.run; R.plays++; R.best = Math.max(R.best, stars); track('adventure_completed', 'unit' + (u + 1));
        game.state.good += 50; addGems(10); bus.emit('good'); bus.emit('save'); sfx('win');
        sheetOpen(`<div class="chEnd"><div class="chTreasure">👑</div><div class="chStars">${[1, 2, 3].map(k => `<span class="${k <= stars ? 'on' : ''}">★</span>`).join('')}</div>
          <h3>أتممتَ ${F.title}!</h3><p class="chGot">+٥٠ 💚 و+١٠ 💎</p><p class="muted">أجبت ${ar(C.firstTry)} من ${ar(C.items.length)} من المحاولة الأولى.</p>
          <button class="act big go" id="acAgain">العب مرة أخرى 🔁</button><button class="act ghost" id="acEnd">رجوع إلى العالم</button></div>`);
        document.querySelector('#panel .sheet').classList.add('chSheet');
        btn('acAgain', start); btn('acEnd', () => sheetClose());
      } });
  };
  intro();
}

/* ── تحدي الخبير: يُفتح بعد ثلاث نجوم في الدرس. ٦ جولات من الأنواع التي لا تُخمَّن (كتابة، ترتيب، تصنيف، وصل، خط أعداد…)،
   والنجمة الذهبية 🌟 لمن يجيب ٥ من ٦ من المحاولة الأولى. بلا مؤقت ولا عقاب، والإعادة متاحة ── */
const HARD = ['num', 'build', 'order', 'sort', 'match', 'multi', 'line', 'memory', 'error'];
export const expertRec = id => { const s = game.state; s.expert = s.expert || {}; return (s.expert[id] = s.expert[id] || { plays: 0, gold: false }); };
export const expertOpen = id => (quests.data(id).stars || 0) >= 3;
export function openExpert(W, id, mod) {
  if (!mod || !mod.challenge || !expertOpen(id)) return;
  const ch = mod.challenge, R = expertRec(id), title = LESSONS.find(l => l.id === id).title;
  const intro = () => {
    sheetOpen(`<div class="chEnd acIntro expIntro"><div class="chTreasure">⚡</div><h3>تحدي الخبير</h3><p>${title}</p>
      <p class="muted">٦ جولات أصعب: لا اختيار من متعدد، بل كتابة وترتيب وتصنيف. أجب ٥ منها من المحاولة الأولى لتنال النجمة الذهبية 🌟</p>
      ${R.gold ? '<p class="chGot">🌟 نلتَ النجمة الذهبية في هذا الدرس</p>' : ''}<button class="act big go" id="acGo">ابدأ ⚡</button><button class="act ghost" id="acBack">رجوع</button></div>`);
    document.querySelector('#panel .sheet').classList.add('chSheet');
    btn('acBack', () => sheetClose()); btn('acGo', start);
  };
  const start = () => {
    let pool = []; for (let k = 0; k < 6 && pool.length < 12; k++) pool = pool.concat(ch.make().filter(it => HARD.includes(it.type)));
    const items = pickN(pool, 6), d = { ch: { items, i: 0, firstTry: 0, tries: 0, gems: 0, streak: 0 } };
    R.run = d;
    runChallenge(W, d, { id, who: ch.who, title: `⚡ تحدي الخبير`, make: () => items, scene: SCENES.tower.draw,
      exit: () => { delete R.run; bus.emit('save'); },
      onDone: (stars, C) => {
        delete R.run; R.plays++; const gold = C.firstTry >= 5, first = gold && !R.gold; if (gold) R.gold = true;
        addGems((gold ? 6 : 3)); bus.emit('save'); sfx('win');
        sheetOpen(`<div class="chEnd"><div class="chTreasure">${gold ? '🌟' : '⚡'}</div><h3>${gold ? 'النجمة الذهبية لك!' : 'تحدٍّ قوي، أحسنت!'}</h3>
          <p class="chGot">+${ar(gold ? 6 : 3)} 💎</p><p class="muted">أجبت ${ar(C.firstTry)} من ${ar(C.items.length)} من المحاولة الأولى.${gold ? (first ? ' 🎉 أول نجمة ذهبية في هذا الدرس!' : '') : ' تحتاج ٥ من ٦ للنجمة الذهبية — حاول مرة أخرى متى شئت.'}</p>
          <button class="act big go" id="acAgain">العب مرة أخرى 🔁</button><button class="act ghost" id="acEnd">رجوع إلى العالم</button></div>`);
        document.querySelector('#panel .sheet').classList.add('chSheet');
        btn('acAgain', start); btn('acEnd', () => sheetClose());
      } });
  };
  intro();
}

/* ── مهمة اليوم: ٣ جولات مراجعة من الدروس المنجزة، مرة واحدة كل يوم، بشخصية مختلفة. تُحسب الأيام المتتالية ── */
const dayKey = (d = new Date()) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
export const dailyRec = () => { const s = game.state; return (s.daily = s.daily || { last: null, streak: 0, best: 0, total: 0 }); };
export const dailyDone = () => dailyRec().last === dayKey();
export function openDaily(W, MODS) {
  const D = dailyRec(), done = LESSONS.filter(l => quests.isDone(l.id) && MODS[l.id] && MODS[l.id].challenge);
  if (!done.length) { sheetOpen(`<div class="chEnd"><div class="chTreasure">📅</div><h3>مهمة اليوم</h3><p class="muted">أنجز أول درس لتبدأ مهام المراجعة اليومية.</p><button class="act" id="acEnd">حسناً</button></div>`); btn('acEnd', () => sheetClose()); return; }
  if (dailyDone()) { sheetOpen(`<div class="chEnd"><div class="chTreasure">✅</div><h3>أنجزتَ مهمة اليوم!</h3><p class="chGot">🔥 ${ar(D.streak)} ${D.streak === 1 ? 'يوم' : 'أيام'} متتالية</p><p class="muted">عُد غداً لمهمة جديدة.</p><button class="act" id="acEnd">رجوع</button></div>`); btn('acEnd', () => sheetClose()); return; }
  const today = new Date(), seed = today.getDate() + today.getMonth() * 31, pick = done.slice().sort((a, b) => ((a.id.length * 7 + seed) % 13) - ((b.id.length * 7 + seed) % 13)).slice(0, 3);
  // المراجعة الذكية أولاً: مهارات أخطأ فيها الطالب وحان موعدها (حتى ٣)، ثم أسئلة من دروس منجزة لإكمال الجولات الثلاث
  const rv = dueList().filter(r => quests.isDone(r.l) && MODS[r.l] && MODS[r.l].challenge).slice(0, 3).map(r => reviewItem(r, MODS)).filter(Boolean);
  const items = rv.concat([0, 1, 2].map(k => { const l = pick[k % pick.length].id, it = pickN(MODS[l].challenge.make(), 1)[0]; it.src = l; return it; })).slice(0, 3),   // ثلاث جولات دائماً
    who = MODS[(rv[0] || {}).src || pick[0].id].challenge.who;
  const d = { ch: { items, i: 0, firstTry: 0, tries: 0, gems: 0, streak: 0 } }; D.run = d;
  runChallenge(W, d, { id: 'daily', who, title: '📅 مهمة اليوم', make: () => items, scene: SCENES.camel.draw,
    exit: () => { delete D.run; bus.emit('save'); },
    onDone: () => {
      delete D.run; const y = new Date(); y.setDate(y.getDate() - 1);
      D.streak = D.last === dayKey(y) ? D.streak + 1 : 1; D.best = Math.max(D.best, D.streak); D.total++; D.last = dayKey();
      addGems(8); bus.emit('save'); sfx('win');
      sheetOpen(`<div class="chEnd"><div class="chTreasure">📅</div><h3>أحسنت! أنجزتَ مهمة اليوم</h3><p class="chGot">+٨ 💎 · 🔥 ${ar(D.streak)} ${D.streak === 1 ? 'يوم' : 'أيام'} متتالية</p>
        ${rv.length ? `<p class="chGot">🔁 راجعتَ ${rv.length === 1 ? 'مهارة واحدة' : rv.length === 2 ? 'مهارتين' : ar(rv.length) + ' مهارات'} أخطأتَ فيها سابقاً</p>` : ''}<p class="muted">مراجعة: ${[...new Set(items.map(it => (LESSONS.find(l => l.id === it.src) || {}).title).filter(Boolean))].join('، ')}. عُد غداً لمهمة جديدة!</p><button class="act big go" id="acEnd">رائع!</button></div>`);
      document.querySelector('#panel .sheet').classList.add('chSheet'); btn('acEnd', () => sheetClose());
    } });
}
