// ٧-٢ نتائج الاحتمالات المرجحة بالتساوي — «كشك البطاقات»: فريدة تكتب حروف كلمة على بطاقات مقلوبة ويسحب الزائر واحدة عشوائياً.
// الاحتمال = عدد النتائج المطلوبة ÷ عدد كل النتائج المرجحة بالتساوي: حرف من الكلمة وليس الحرف، وحجر النرد، وشبكة أعداد الكشك،
// وتقويم شهر المهرجان، وكيس بالونات بأعداد مختلفة. البطاقات تنقلب بعد الحل. التحدي: ٨ أسئلة من 8Db2 (الكتاب ص١١٨–١٢٠).
import { mission } from '../../mission.js';
import { N, R, fr, gcd, fEq } from '../../math.js';
import { choice, num, tf } from '../../../missions/challenge.js';
import { ar } from '../../../core/util.js';
import { fairBg, say, glow, card, numGrid, face, PINK, GREEN, BLUE } from './art.js';

const who = { name: 'فريدة صاحبة الكشك', face: '🃏', id: 'farida' };
const pick = a => a[Math.floor(Math.random() * a.length)];
// كلمات المهرجان: حرف واحد على الأقل يتكرر (ليكون الاحتمال أكبر من واحد على العدد)
const WORDS = ['مهرجان', 'الألعاب', 'بالونات', 'الدوامة', 'احتمالات', 'رياضيات', 'الموسوعة', 'مسابقات', 'العجلة', 'الحلويات', 'المسرح', 'تذاكر', 'الفائزون', 'الأرجوحة'];
const letters = w => [...w];
const DAYS = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
const BAL = [['حمراء', '#EF4444'], ['زرقاء', '#3B82F6'], ['خضراء', '#22C55E'], ['صفراء', '#FACC15'], ['بنفسجية', '#A855F7']];
const SAY_TOTAL = 'كم نتيجة ممكنة كلها؟ وهل لكل منها الفرصة نفسها؟';

/* جولة كسر: الجواب k/n بأي صورة مكافئة، والرد على المقلوب وعلى «عدم الحدوث» */
const fq = (q, k, n, hint, data, extra = '') => ({ q, input: { type: 'frac' }, sol: { w: 0, n: k, d: n }, ok: v => fEq(v, k, n), hint,
  bad: v => fEq(v, n - k, n) ? 'هذا احتمال الحالة الأخرى! أعد قراءة المطلوب.' : v && v.n === n && v.d === k ? 'قلبت الكسر: عدد النتائج المطلوبة في البسط، وعدد كل النتائج في المقام.' : v && v.d && v.d !== n && !fEq(v, k, n) ? `هل في المقام عدد كل النتائج؟ ${extra}` : '',
  good: `${fr(k, n)}${gcd(k, n) > 1 ? ` = ${fr(k / gcd(k, n), n / gcd(k, n))}` : ''}`, data: { ...data, k, n } });

function draw(g, w, h, t, S) {
  const r = S.r ? S.r.data : {}; fairBg(g, w, h, t);
  if (r.mode === 'cards') {   // البطاقات مقلوبة، وبعد الحل تنكشف ويضيء المطلوب
    const L = r.cards, n = L.length, cw = Math.min(64, (w * .9) / n - 8), ch = cw * 1.35, x0 = w / 2 + (n * (cw + 8)) / 2;
    L.forEach((l, k) => card(g, x0 - (k + 1) * (cw + 8), h * .3, cw, ch, l, { up: S.done, hl: S.done && r.hl(l), col: PINK }));
    say(g, `كلمة من ${ar(n)} بطاقات: «${r.word}»`, w / 2, h * .2, 17, '#9D174D');
    if (S.done) say(g, `${r.what} = ${ar(r.k)} من ${ar(r.n)}`, w / 2, h * .3 + ch + 40, 19, GREEN);
  } else if (r.mode === 'die') {
    for (let k = 1; k <= 6; k++) { const s = Math.min(58, w * .11), x = w / 2 + 3 * (s + 10) - k * (s + 10); face(g, x, h * .36, s, k, S.done && r.hl(k) ? '#DCFCE7' : '#FFFFFF'); }
    say(g, 'حجر نرد ذو ستة أوجه، متكافئ الفرص', w / 2, h * .24, 17, '#334155'); if (S.done) say(g, `${r.what} = ${ar(r.k)} من ٦`, w / 2, h * .78, 19, GREEN);
  } else if (r.mode === 'grid') {
    say(g, `شبكة أعداد الكشك (${ar(r.rows)} صفوف و${ar(r.cols)} أعمدة)`, w / 2, h * .13, 16, '#334155');
    numGrid(g, w * .12, h * .18, w * .76, h * .62, r.rows, r.cols, (a, b) => ar(a * r.cols + b + 1), (a, b) => S.done && r.hl(a, b));
    if (S.done) say(g, `${ar(r.k)} من ${ar(r.n)}`, w / 2, h * .92, 18, GREEN);
  } else if (r.mode === 'cal') {   // تقويم الشهر: الأعمدة أيام الأسبوع من اليمين
    say(g, `شهر المهرجان (${ar(r.days)} يوماً)`, w / 2, h * .1, 16, '#334155'); const cw = w * .8 / 7, ch = Math.min(28, h * .11), x0 = w * .9, y0 = h * .14;
    DAYS.forEach((d, k) => say(g, d, x0 - (k + .5) * cw, y0 + ch * .7, Math.min(13, cw * .22), '#7C2D12'));
    for (let d = 1; d <= r.days; d++) { const p = r.first + d - 1, c = p % 7, rw = Math.floor(p / 7) + 1, on = S.done && r.hl(c), x = x0 - (c + 1) * cw, y = y0 + rw * ch;
      g.fillStyle = on ? '#DCFCE7' : '#FFFFFF'; g.fillRect(x + 1, y + 1, cw - 2, ch - 2); say(g, ar(d), x + cw / 2, y + ch * .72, Math.min(14, ch * .55), on ? '#14532D' : '#1E2433'); }
  } else if (r.mode === 'bag') {   // كيس البالونات وجدول الأعداد
    g.fillStyle = '#A16207'; g.beginPath(); g.moveTo(w * .2, h * .32); g.quadraticCurveTo(w * .12, h * .86, w * .3, h * .86); g.quadraticCurveTo(w * .48, h * .86, w * .4, h * .32); g.closePath(); g.fill();
    r.bag.forEach(([nm, col, c], k) => { for (let q = 0; q < Math.min(c, 4); q++) { g.fillStyle = col; g.beginPath(); g.ellipse(w * (.22 + k * .045) + q * 4, h * (.3 - q * .06), 9, 11, 0, 0, 7); g.fill(); } });
    const x0 = w * .9, cw = w * .4 / r.bag.length; r.bag.forEach(([nm, col, c], k) => { const x = x0 - (k + 1) * cw, on = S.done && r.hl(k); g.fillStyle = on ? '#DCFCE7' : '#FFFFFF'; g.beginPath(); g.roundRect(x + 3, h * .34, cw - 6, h * .36, 10); g.fill();
      g.fillStyle = col; g.beginPath(); g.arc(x + cw / 2, h * .45, 9, 0, 7); g.fill(); say(g, nm, x + cw / 2, h * .56, 13); say(g, ar(c), x + cw / 2, h * .66, 19, BLUE); });
    if (S.done) say(g, `${ar(r.k)} من ${ar(r.n)}`, w * .7, h * .84, 19, GREEN);
  }
  glow(g, w, h, S);
}

function make(i) {
  if (i <= 1) {   // بطاقات حروف كلمة
    let word, L, rep; do { word = pick(WORDS); L = letters(word); const cnt = {}; L.forEach(c => { cnt[c] = (cnt[c] || 0) + 1; }); rep = Object.keys(cnt).filter(c => cnt[c] > 1 || i === 1); } while (!rep.length);
    const x = pick(rep), k = L.filter(c => c === x).length, n = L.length;
    if (i === 0) return fq(`كتبت فريدة حروف كلمة «${word}» على ${ar(n)} بطاقات منفصلة وقلبتها. تُسحب بطاقة عشوائياً. ما احتمال أن يكون عليها الحرف (${x})؟`, k, n,
      'كم بطاقة عليها هذا الحرف؟ وكم بطاقة كلها؟ هل لكل بطاقة الفرصة نفسها؟', { mode: 'cards', cards: L, word, hl: c => c === x, what: `بطاقات (${x})` }, 'عدّ البطاقات كلها.');
    return fq(`تُسحب بطاقة عشوائياً من بطاقات كلمة «${word}». ما احتمال ألا يكون عليها الحرف (${x})؟`, n - k, n,
      'كم بطاقة ليس عليها هذا الحرف؟ أو: احسب احتمال أن يكون عليها ثم اطرحه من ١.', { mode: 'cards', cards: L, word, hl: c => c !== x, what: `ليست (${x})` });
  }
  if (i === 2) {   // حجر النرد
    const T = pick([['أصغر من ٥', v => v < 5], ['أكبر من ٢', v => v > 2], ['عدداً زوجياً', v => v % 2 === 0], ['ليس مضاعفاً للعدد ٣', v => v % 3 !== 0], ['ليس ٦', v => v !== 6], ['عدداً أولياً', v => [2, 3, 5].includes(v)], ['٥ أو ٦', v => v >= 5]]);
    const k = [1, 2, 3, 4, 5, 6].filter(T[1]).length;
    return fq(`يرمي زائر حجر نرد ذا ستة أوجه متكافئ الفرص. ما احتمال أن يكون العدد ${T[0]}؟`, k, 6, 'اكتب الأعداد الستة، وعُدّ منها ما يحقق الشرط.', { mode: 'die', hl: T[1], what: T[0] });
  }
  if (i === 3) {   // شبكة الأعداد
    const rows = R(3, 5), cols = R(5, 8), n = rows * cols, m = R(0, 3);
    const T = [['في الصف السفلي', (a) => a === rows - 1, cols], ['في العمود الأول من اليمين', (a, b) => b === 0, rows], ['ليس في آخر عمودين من اليسار', (a, b) => b < cols - 2, rows * (cols - 2)], ['مضاعفاً للعدد ٥', (a, b) => (a * cols + b + 1) % 5 === 0, Math.floor(n / 5)]][m];
    return fq(`يختار الكشك عدداً عشوائياً من شبكة فيها الأعداد من ١ إلى ${ar(n)} في ${ar(rows)} صفوف و${ar(cols)} أعمدة. ما احتمال أن يكون العدد ${T[0]}؟`, T[2], n,
      'كم عدداً في الشبكة كلها؟ وكم منها يحقق الشرط؟', { mode: 'grid', rows, cols, hl: T[1] });
  }
  if (i === 4) {   // تقويم الشهر
    const days = pick([30, 31]), first = R(0, 6), d = R(0, 6), two = Math.random() < .4, d2 = (d + 1) % 7;
    const cnt = c => Array.from({ length: days }, (_, j) => (first + j) % 7).filter(x => x === c).length, k = cnt(d) + (two ? cnt(d2) : 0);
    return fq(`يُختار يوم عشوائياً من شهر المهرجان، وفيه ${ar(days)} يوماً، لعرض الألعاب النارية. ما احتمال أن يكون يوم ${DAYS[d]}${two ? ` أو ${DAYS[d2]}` : ''}؟`, k, days,
      'انظر إلى عمود اليوم في التقويم: كم مرة يتكرر في الشهر؟', { mode: 'cal', days, first, hl: c => c === d || (two && c === d2) });
  }
  // كيس البالونات
  const bag = BAL.slice(0, R(3, 5)).map(([nm, col]) => [nm, col, R(1, 9)]), n = bag.reduce((s, b) => s + b[2], 0), j = R(0, bag.length - 1), m = R(0, 2);
  const j2 = (j + 1) % bag.length, T = [[`${bag[j][0]}`, [j]], [`ليست ${bag[j][0]}`, bag.map((_, q) => q).filter(q => q !== j)], [`${bag[j][0]} أو ${bag[j2][0]}`, [j, j2]]][m], k = T[1].reduce((s, q) => s + bag[q][2], 0);
  return fq(`في كيس الجوائز بالونات بالأعداد المبيّنة في الجدول. يُسحب بالون عشوائياً. ما احتمال أن تكون البالونة ${T[0]}؟`, k, n,
    'كل بالونة لها الفرصة نفسها: كم بالونة في الكيس كله؟ وكم منها تحقق المطلوب؟', { mode: 'bag', bag, hl: q => T[1].includes(q) }, 'اجمع أعداد البالونات كلها.');
}

function challenge() {
  const items = [], used = new Set(), fresh = f => { for (let k = 0; k < 60; k++) { const x = f(); const s = JSON.stringify(x); if (!used.has(s)) { used.add(s); return x; } } return f(); };
  const F = (k, n) => { const g = gcd(k, n); return fr(k / g, n / g); };
  { const word = fresh(() => pick(WORDS)), L = letters(word), x = L[0], k = L.filter(c => c === x).length; items.push(choice(`حروف كلمة «${word}» على بطاقات، تُسحب واحدة عشوائياً. احتمال الحرف (${x}):`, F(k, L.length), [F(L.length - k, L.length), fr(1, k + 1 === L.length ? L.length + 1 : k + 1), fr(L.length, k)], 'عدد بطاقات الحرف ÷ عدد البطاقات كلها.', '8Db2')); }
  { const T = fresh(() => pick([['أصغر من ٣', 2], ['أكبر من ٤', 2], ['فردياً', 3], ['ليس ١', 5], ['أصغر من ٦', 5]])); items.push(choice(`يُرمى حجر نرد ذو ستة أوجه. احتمال أن يكون العدد ${T[0]}:`, F(T[1], 6), [F(6 - T[1], 6), fr(1, T[1] + 1), fr(T[1], 5)], 'ست نتائج مرجحة بالتساوي.', '8Db2')); }
  items.push(choice('يختار شخص شهراً من السنة عشوائياً. احتمال أن يكون يوليو:', fr(1, 12), [fr(1, 30), fr(1, 7), fr(7, 12)], 'كم شهراً في السنة؟', '8Db2'));
  { const n = fresh(() => R(4, 9)); items.push(num(`يكوّن الحاسوب رقماً عشوائياً من ٠ إلى ٩. كم نتيجة مرجحة بالتساوي هناك؟`, 10, 'لا تنسَ الصفر.', '8Db2')); }
  { const r = fresh(() => [R(2, 6), R(2, 6)]); items.push(choice(`كيس فيه ${ar(r[0])} بالونات حمراء و${ar(r[1])} زرقاء. احتمال سحب بالونة زرقاء:`, F(r[1], r[0] + r[1]), [F(r[1], r[0]), F(r[0], r[0] + r[1]), fr(1, 2)].filter(x => x !== F(r[1], r[0] + r[1])), 'المقام عدد البالونات كلها.', '8Db2')); }
  items.push(tf('«عشوائياً» تعني أن لكل نتيجة الفرصة نفسها في الاختيار.', true, 'ماذا يعني أن تختار دون أن تنظر؟', '8Db2', 'كل البطاقات لها احتمالات متساوية.'));
  items.push(tf('احتمال سحب الحرف (خ) من بطاقات كلمة «رياضيات» يساوي ٠.', true, 'هل الحرف (خ) في الكلمة؟', '8Db2', 'نتيجة مستحيلة احتمالها صفر.'));
  items.push(tf('عند رمي حجر نرد، احتمال العدد ٢ أكبر من احتمال العدد ٦.', false, 'هل حجر النرد متكافئ الفرص؟', '8Db2', 'لكل وجه الاحتمال نفسه ١ من ٦.'));
  return items.sort(() => Math.random() - .5);
}

export default mission({
  title: 'كشك البطاقات', icon: '🃏', who, rounds: 6, make, draw,
  intro: ['أنا فريدة، صاحبة كشك البطاقات. أكتب حروف كلمة على بطاقات، وأقلبها، ويسحب الزائر واحدة دون أن ينظر.', 'لكل بطاقة الفرصة نفسها. فالاحتمال = عدد النتائج المطلوبة ÷ عدد كل النتائج.'],
  outro: ['أحسنت! صرت تعرف فرصة كل بطاقة قبل أن تُسحب.', 'لنختبر النتائج المرجحة بالتساوي بأسئلة متنوعة.'],
  challenge: { title: 'تحدي الفرص المتساوية', make: challenge }
});
export const ROUNDS = 6;
export { make, challenge };
