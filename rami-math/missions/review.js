// المراجعة الذكية: كل سؤال يخطئ فيه الطالب من المحاولة الأولى يُسجَّل بدرسه ومهارته (المخرج)،
// ثم يعود في «مهمة اليوم» بسؤال جديد من النوع نفسه بعد يوم، فإن أجاب صحيحاً عاد بعد ٣ أيام ثم ٧، وبعدها تُعدّ المهارة متقنة.
// الخطأ في المراجعة يعيدها إلى البداية بهدوء (بلا عقاب). السجل صغير: ٤٠ مهارة على الأكثر.
import { game } from '../core/state.js';
import { LESSONS } from '../content/lessons.js';

const DAY = 864e5, GAP = [1, 3, 7], MAX = 40, IDS = new Set(LESSONS.map(l => l.id));
export const reviews = () => (game.state.review = game.state.review || {});
const key = (lesson, out) => `${lesson}|${out || '_'}`;
export const parse = k => { const [l, o] = k.split('|'); return { l, o: o === '_' ? null : o }; };

/* خطأ من المحاولة الأولى: تُجدول المهارة للمراجعة غداً */
export function miss(lesson, out) {
  if (!IDS.has(lesson)) return;
  const R = reviews(), k = key(lesson, out), e = R[k] || (R[k] = { n: 0, b: 0 });
  e.n++; e.b = 0; e.due = Date.now() + DAY;
  const ks = Object.keys(R); if (ks.length > MAX) { ks.sort((a, b) => R[b].due - R[a].due); delete R[ks[0]]; }   // الأبعد موعداً يخرج أولاً
}
/* إجابة صحيحة لمهارة مسجّلة: تتقدم خطوة إن حان موعدها (المراجعة في يوم لاحق لا في الجلسة نفسها). تعيد 'up' أو 'mastered' */
export function hit(lesson, out, first) {
  const R = reviews(), k = key(lesson, out), e = R[k]; if (!e) return null;
  if (!first) { e.b = 0; e.due = Date.now() + DAY; return null; }
  if (Date.now() < e.due - DAY / 2) return null;
  e.b++; if (e.b >= GAP.length) { delete R[k]; game.state.mastered = (game.state.mastered || 0) + 1; return 'mastered'; }
  e.due = Date.now() + GAP[e.b] * DAY; return 'up';
}
/* المهارات التي حان موعد مراجعتها، الأقدم أولاً */
export const dueList = (now = Date.now()) => Object.entries(reviews()).filter(([, e]) => e.due <= now).sort((a, b) => a[1].due - b[1].due).map(([k, e]) => Object.assign(parse(k), { k, e }));
export const pendingOf = lesson => Object.keys(reviews()).filter(k => k.startsWith(lesson + '|')).length;

/* سؤال جديد من مهارة المراجعة: من مولّد الدرس نفسه، ويُفضَّل ما له المخرج نفسه */
export function reviewItem(r, MODS) {
  const ch = MODS[r.l] && MODS[r.l].challenge; if (!ch) return null;
  let pool = []; for (let t = 0; t < 4 && !pool.length; t++) { const all = ch.make().filter(it => it.type !== 'memory'); pool = all.filter(it => (it.out || null) === r.o); if (t === 3 && !pool.length) pool = all; }
  const it = pool[Math.floor(Math.random() * pool.length)]; if (!it) return null;
  return Object.assign(it, { src: r.l, rv: 1 });
}
