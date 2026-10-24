// ٤-٤ قسمة الكسور — «تعبئة العلب»: حلوى القِدر تُعبّأ في علب سعة كل منها كسر من الكيلوغرام. الطالب يحدد عدد العلب (ويظهر القِدر
// والعلب بعد التثبيت: فائض أو نقص)، ويختار مقلوب الكسر، ويقسم عدداً على كسر وكسراً على كسر وعدداً كسرياً على عدد كسري.
// التحدي: ٨ أسئلة من 8Nf2 (الكتاب ص٦٩–٧١).
import { mission } from '../../mission.js';
import { N, R, fr, mx, fx, gcd, fOk, fBad, fEq } from '../../math.js';
import { choice, num, tf } from '../../../missions/challenge.js';
import { kitchen, fracC, mixC, valC, jar, pot, say } from './art.js';

const who = { name: 'نورة صاحبة المعمل', face: '🧕🏽', id: 'noura' };
const pf = (b0, b1) => { for (let t = 0; t < 60; t++) { const b = R(b0, b1), a = R(1, b - 1); if (gcd(a, b) === 1) return [a, b]; } return [2, 3]; };
const red = (n, d) => { const g = gcd(n, d); return [n / g, d / g]; };
const LIDS = ['#DC2626', '#2563EB', '#16A34A', '#F59E0B', '#7C3AED'];

function draw(g, w, h, t, S) {
  const r = S.r ? S.r.data : {}; kitchen(g, w, h, h * .7);
  if (r.mode === 'jars') {   // القِدر وعلب صغيرة: تظهر بعد التثبيت (فائض في القدر أو علب فارغة)
    const n = r.tried || 0, full = Math.min(n, r.ans), left = Math.max(0, r.ans - n);
    pot(g, w * .16, h * .84, 52, left > 0 || !n ? 1 : 0, t); say(g, `${N(r.W)} كغ`, w * .16, h * .42, 18, '#7A2E12');
    fracC(g, r.a, r.b, w * .5, h * .14, 24, '#7A2E12'); say(g, 'كغ في كل علبة', w * .5, h * .3, 14, '#64748B');
    const cols = 10, jw = Math.min(26, (w * .62) / cols - 6);
    for (let k = 0; k < Math.min(n, 40); k++) { const x = w * .34 + (k % cols) * (jw + 6) + jw / 2, y = h * .52 + Math.floor(k / cols) * (jw * 1.5 + 12); jar(g, x, y, jw, jw * 1.3, k < full ? 1 : 0, LIDS[k % 5]); }
    if (n) say(g, left > 0 ? `بقي في القِدر حلوى لـ ${N(left)} ${left === 1 ? 'علبة' : left === 2 ? 'علبتين' : left <= 10 ? 'علب' : 'علبة'}` : n > r.ans ? `${N(n - r.ans)} ${n - r.ans === 1 ? 'علبة فارغة' : 'علب فارغة'}!` : 'امتلأت العلب وفرغ القِدر ✓', w * .62, h * .96, 15, left > 0 || n > r.ans ? '#B91C1C' : '#15803D');
  } else {   // لوح العملية: القسمة ثم قلب الكسر وضربه (بعد الحل)
    pot(g, w * .12, h * .86, 34, 1, t);
    g.fillStyle = '#1F3A2E'; g.fillRect(w * .2, h * .08, w * .72, h * .56); g.strokeStyle = '#A16207'; g.lineWidth = 7; g.strokeRect(w * .2, h * .08, w * .72, h * .56);
    const y = h * .26, s = 26, L = w * .76, Rr = w * .38, col = '#FDE68A';
    const term = (v, x, yy) => v[0] === 'n' ? say(g, N(v[1]), x, yy + 10, 30, col) : v[0] === 'f' ? fracC(g, v[1], v[2], x, yy, s, col) : mixC(g, v[1], v[2], v[3], x, yy, s, col);
    term(r.A, L, y); say(g, '÷', w * .56, y + 8, 28, col); term(r.B, Rr, y);
    if (S.done && r.flip) { term(r.A, L, y + h * .22); say(g, '×', w * .56, y + h * .22 + 8, 28, '#86EFAC'); fracC(g, r.flip[0], r.flip[1], Rr, y + h * .22, s, '#86EFAC'); }
    if (S.done && r.rd) { say(g, '=', w * .26, y + h * .22 + 8, 26, '#86EFAC'); }
    if (S.done && r.rd) valC(g, r.rn, r.rd, w * .5, h * .78, 26, '#15803D');
  }
  if (S.pulse > 0) { g.strokeStyle = `rgba(34,197,94,${S.pulse})`; g.lineWidth = 6; g.strokeRect(4, 4, w - 8, h - 8); }
}

function make(i) {
  if (i === 0) { for (let t = 0; t < 80; t++) { const [a, b] = pf(2, 6), q = R(2, 9), W = a * q; if (W * b / a <= 30 && W >= 2) { const ans = W * b / a, D = { mode: 'jars', a, b, W, ans };
    return { q: `في القِدر ${N(W)} كغ من الحلوى، وكل علبة تتسع لـ ${fr(a, b)} كغ. كم علبة نملأ؟ (${N(W)} ÷ ${fr(a, b)})`, input: { type: 'dial', min: 1, max: 40, start: 1 },
      ok: v => { D.tried = v; return v === ans; }, hint: `كم علبة في كل كيلوغرام واحد؟ ثم في ${N(W)} كغ؟`,
      bad: v => v < ans ? 'ما زالت حلوى في القِدر.' : 'لا تكفي الحلوى لكل هذه العلب.', good: `أحسنت! ${N(W)} ÷ ${fr(a, b)} = ${N(W)} × ${fr(b, a)} = ${N(ans)}.`, data: D }; } } }
  if (i === 1) { let [a, b] = pf(3, 9); if (a === 1) a = b - 1; const opts = [fr(b, a), fr(a, b), fr(b, a * 2), fr(a * 2, b)].sort(() => Math.random() - .5);
    return { q: `القسمة على ${fr(a, b)} تساوي الضرب في:`, input: { type: 'pick', opts }, ok: k => opts[k] === fr(b, a),
      hint: `كم ${fr(a, b)} في الواحد الصحيح؟`, bad: k => opts[k] === fr(a, b) ? 'الضرب في الكسر نفسه يعطي ناتجاً مختلفاً عن القسمة عليه.' : '', good: 'أحسنت! نقلب الكسر الثاني ونضرب.', data: { mode: 'board', A: ['n', 1], B: ['f', a, b], flip: [b, a], rn: b, rd: a } }; }
  if (i === 2) { for (let t = 0; t < 80; t++) { const [a, b] = pf(2, 9), W = R(5, 30); if (a > 1 && (W * b) % a !== 0 && W * b / a < 60) { const [rn, rd] = red(W * b, a);
    return { q: `${N(W)} كغ من الحلوى تُعبّأ في علب، كل علبة ${fr(a, b)} كغ. كم علبة تمتلئ؟`, input: { type: 'frac', mixed: true }, ok: v => fOk(v, rn, rd),
      hint: 'اقلب الكسر الثاني ثم اضرب. هل يمكن الحذف قبل الضرب؟', bad: v => fBad(v, rn, rd) || (fEq(v, W * a, b) ? 'ضربتَ في الكسر نفسه: في القسمة نقلبه أولاً.' : ''),
      good: 'أحسنت! والجزء الكسري علبة غير ممتلئة.', data: { mode: 'board', A: ['n', W], B: ['f', a, b], flip: [b, a], rn, rd } }; } } }
  if (i === 3) { let a, b, c, e; do { [a, b] = pf(2, 9); [c, e] = pf(2, 9); } while (red(a * e, b * c)[1] > 40); const [rn, rd] = red(a * e, b * c);
    return { q: `علبة الهدايا تتسع لـ ${fr(c, e)} كغ، ومعنا ${fr(a, b)} كغ. كم علبة نملأ؟ (${fr(a, b)} ÷ ${fr(c, e)})`, input: { type: 'frac', mixed: true }, ok: v => fOk(v, rn, rd),
      hint: 'أي الكسرين نقلب؟ وهل يوجد عامل مشترك نحذفه بعد القلب؟', bad: v => fBad(v, rn, rd) || (fEq(v, b * c, a * e) ? 'قلبتَ الكسر الأول: نقلب المقسوم عليه (الثاني) فقط.' : fEq(v, a * c, b * e) ? 'هذا ضرب: اقلب الكسر الثاني أولاً.' : ''),
      good: 'أحسنت! قلب الكسر وضربه.', data: { mode: 'board', A: ['f', a, b], B: ['f', c, e], flip: [e, c], rn, rd } }; }
  let a, b, c, e, W1, W2, A, B; do { [a, b] = pf(2, 6); [c, e] = pf(2, 6); W1 = R(1, 4); W2 = R(1, 3); A = W1 * b + a; B = W2 * e + c; } while (red(A * e, b * B)[1] > 40);
  const [rn, rd] = red(A * e, b * B);
  return { q: `${mx(W1, a, b)} كغ من الحلوى في علب كل منها ${mx(W2, c, e)} كغ. كم علبة؟ (${mx(W1, a, b)} ÷ ${mx(W2, c, e)})`, input: { type: 'frac', mixed: true }, ok: v => fOk(v, rn, rd),
    hint: 'حوّل العددين الكسريين إلى كسرين غير فعليين أولاً، ثم اقلب واضرب.', bad: v => fBad(v, rn, rd) || (fEq(v, b * B, A * e) ? 'قلبتَ الكسر الأول: نقلب الثاني فقط.' : ''),
    good: 'أحسنت! وتتحقق بضرب الناتج في المقسوم عليه.', data: { mode: 'board', A: ['m', W1, a, b], B: ['m', W2, c, e], flip: [e, B], rn, rd } };
}

function challenge() {
  const items = [], used = new Set(), fresh = f => { for (let k = 0; k < 60; k++) { const v = f(); const s = JSON.stringify(v); if (!used.has(s)) { used.add(s); return v; } } return f(); };
  { const [a, b] = fresh(() => pf(2, 6)), q = R(2, 8); items.push(num(`${N(a * q)} ÷ ${fr(a, b)} =`, q * b, 'اقلب الكسر واضرب، واحذف قبل الضرب.', '8Nf2')); }
  { const [a, b] = fresh(() => pf(2, 9)); items.push(choice(`مقلوب الكسر ${fr(a, b)} هو:`, fr(b, a), [fr(a, b), fr(1, b), fr(b, a + b)], 'المقلوب: ضرب الكسر فيه يعطي ١.', '8Nf2')); }
  { let [a, b] = fresh(() => pf(3, 9)), [c, e] = pf(3, 9); if (a * e === b * c) [c, e] = [1, e + 1];
    const right = fx(a * e, b * c); items.push(choice(`${fr(a, b)} ÷ ${fr(c, e)} =`, right, [fx(a * c, b * e), fx(b * c, a * e), fr(a + c, b + e)].filter((x, j, A) => x !== right && A.indexOf(x) === j), 'اقلب الكسر الثاني فقط ثم اضرب.', '8Nf2')); }
  { const [a, b] = fresh(() => pf(2, 7)), [c, e] = pf(2, 7); items.push(tf(`للتحقق من ${fr(a, b)} ÷ ${fr(c, e)}، نضرب الناتج في ${fr(c, e)} فنحصل على ${fr(a, b)}.`, true, 'القسمة عكس الضرب.', '8Nf2', 'هذه طريقة مريم: العملية العكسية.')); }
  items.push(tf(`إذا قسمتُ عدداً كسرياً على عدد كسري آخر فالناتج دائماً عدد كسري.`, false, 'جرّب قسمة عدد كسري على نفسه، أو على عدد أكبر منه.', '8Nf2', 'مثال مناقض: ١ ١/٢ ÷ ١ ١/٢ = ١، و١ ١/٢ ÷ ٤ ١/٢ = ١/٣.'));
  items.push(tf(`القسمة على كسر فعلي تعطي ناتجاً أكبر من المقسوم.`, true, 'كم نصفاً في ٣؟', '8Nf2', 'مثلاً ٣ ÷ ١/٢ = ٦.'));
  { const [a, b] = fresh(() => pf(2, 5)), W = R(1, 3); items.push(num(`نحوّل ${mx(W, a, b)} إلى كسر غير فعلي قبل القسمة. ما بسطه؟`, W * b + a, 'العدد الصحيح × المقام + البسط.', '8Nf2')); }
  { const q = fresh(() => R(3, 9)); items.push(num(`كم علبة سعتها ${fr(1, 4)} كغ نملأ من ${N(q)} كغ؟`, q * 4, 'كم ربعاً في الكيلوغرام الواحد؟', '8Nf2')); }
  return items.sort(() => Math.random() - .5);
}

export default mission({
  title: 'تعبئة العلب', icon: '🫙', who, rounds: 5, make, draw,
  intro: ['طلبيات العيد كثيرة! الحلوى في القدور، والعلب بأحجام مختلفة.', 'كم علبة نملأ؟ هنا تفيدنا قسمة الكسور: نقلب الكسر ونضرب.'],
  outro: ['امتلأت العلب كلها وصُفّت على الرفوف.', 'لنختبر قسمة الكسور بأسئلة متنوعة.'],
  challenge: { title: 'تحدي قسمة الكسور', make: challenge }
});
export { make, challenge };
