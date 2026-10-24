// ٥-٢ تبسيط العبارات الجبرية — «رفوف المخطوطات»: أمينة المكتبة تجمع المخطوطات المكررة في رفوف. ضرب القوى بالحرف نفسه يجمع
// الأسس، وقسمتها تطرحها، والمعاملات تُضرب وتُقسم كالمعتاد. الطالب يملأ قالب الناتج (المعامل والأس)، ويكتشف خطأ سعيد.
// التحدي: ٨ أسئلة من 8Ae5 (الكتاب ص٨٠–٨١).
import { mission } from '../../mission.js';
import { N, R, pw, tm } from '../../math.js';
import { choice, num, tf, multi } from '../../../missions/challenge.js';
import { parchment, slab, expr, say, TEAL } from './art.js';

const who = { name: 'أمينة المكتبة ليلى', face: '👩🏽‍🏫', id: 'layla' };
const V = ['س', 'ص', 'ع', 'م', 'ل'];
const seg = (c, v, e) => [c === 1 ? '' : N(c), { b: v, e: N(e) }].filter(Boolean);   // حد للقماش: «٣ع٤»
const blankPw = v => `<span class="mq-pw">${v}<sup>{}</sup></span>`;

function draw(g, w, h, t, S) {
  const r = S.r ? S.r.data : {}; parchment(g, w, h);
  // رفان من المخطوطات: عدد اللفائف = الأس (حتى ١٠)
  [[w * .74, r.e1], [w * .3, r.e2]].forEach(([x, e], k) => { if (e == null) return; g.fillStyle = '#7C4A1E'; g.fillRect(x - 90, h * .52, 180, 8);
    for (let j = 0; j < Math.min(e, 10); j++) { const sx = x - 80 + j * 17; g.fillStyle = k ? '#FDE68A' : '#FCD5B5'; g.fillRect(sx, h * .52 - 40, 13, 40); g.fillStyle = k ? '#B45309' : '#9A3412'; g.fillRect(sx, h * .52 - 40, 13, 4); g.fillRect(sx, h * .52 - 4, 13, 4); } });
  if (r.segs) { slab(g, w * .12, h * .62, w * .76, h * .3); expr(g, r.segs, w * .5, h * .8, 26); }
  if (S.done && r.res) expr(g, r.res, w * .5, h * .2, 26, TEAL);
  if (r.err) { slab(g, w * .12, h * .1, w * .76, h * .34, '#FFFDF6'); say(g, 'واجب سعيد', w * .5, h * .18, 15, '#64748B'); expr(g, r.err, w * .5, h * .34, 26, '#B91C1C'); }
  if (S.pulse > 0) { g.strokeStyle = `rgba(34,197,94,${S.pulse})`; g.lineWidth = 6; g.strokeRect(4, 4, w - 8, h - 8); }
}

function make(i) {
  const v = V[R(0, 4)];
  if (i <= 1) { const mul = i === 0, B = R(2, 6), A = mul ? R(2, 7) : B + R(2, 6);
    return { q: `بسّط: ${pw(v, A)} ${mul ? '×' : '÷'} ${pw(v, B)}`, input: { type: 'blanks', tpl: blankPw(v) }, sol: [mul ? A + B : A - B], ok: x => x[0] === (mul ? A + B : A - B),
      hint: mul ? 'عند ضرب قوتين بالحرف نفسه: ماذا تفعل بالأسين؟' : 'عند قسمة قوتين بالحرف نفسه: ماذا تفعل بالأسين؟',
      bad: x => x[0] === (mul ? A * B : Math.round(A / B)) ? (mul ? 'ضربتَ الأسين: في الضرب نجمعهما.' : 'قسمتَ الأسين: في القسمة نطرحهما.') : '', good: 'أحسنت!',
      data: { e1: A, e2: B, segs: [{ b: v, e: N(A) }, mul ? ' × ' : ' ÷ ', { b: v, e: N(B) }], res: [{ b: v, e: N(mul ? A + B : A - B) }] } }; }
  if (i === 2) { const c1 = R(2, 6), c2 = R(2, 8), a = R(2, 6), b = R(2, 5);
    return { q: `بسّط: ${tm(c1, v, a)} × ${tm(c2, v, b)}`, input: { type: 'blanks', tpl: `{}${blankPw(v)}` }, sol: [c1 * c2, a + b], ok: x => x[0] === c1 * c2 && x[1] === a + b,
      hint: 'اضرب الأعداد معاً، ثم تعامل مع الأسين.', bad: x => x[0] === c1 + c2 ? 'المعاملان يُضربان لا يُجمعان.' : x[1] === a * b ? 'الأسّان يُجمعان في الضرب.' : '', good: `أحسنت! ${tm(c1 * c2, v, a + b)}`,
      data: { e1: a, e2: b, segs: [...seg(c1, v, a), ' × ', ...seg(c2, v, b)], res: seg(c1 * c2, v, a + b) } }; }
  if (i === 3) { const q = R(2, 5), c2 = R(2, 6), b = R(2, 6), d = R(1, 4), a = b + d;
    return { q: `بسّط: ${tm(q * c2, v, a)} ÷ ${tm(c2, v, b)}`, input: { type: 'blanks', tpl: d === 1 ? `{}${v}` : `{}${blankPw(v)}` }, sol: d === 1 ? [q] : [q, d], ok: x => x[0] === q && (d === 1 || x[1] === d),
      hint: 'اقسم العددين، ثم اطرح الأسين.', bad: x => x[0] === q * c2 - c2 ? 'المعاملان يُقسمان لا يُطرحان.' : '', good: d === 1 ? `أحسنت! والقوة الأولى تُكتب ${v} وحدها.` : 'أحسنت!',
      data: { e1: a, e2: b, segs: [...seg(q * c2, v, a), ' ÷ ', ...seg(c2, v, b)], res: d === 1 ? [`${N(q)}${v}`] : seg(q, v, d) } }; }
  // خطأ سعيد: ضرب الأسين بدل جمعهما، أو جمع المعاملين، أو صحيح
  const a = R(2, 5), b = R(2, 5), kind = R(0, 2), c1 = R(2, 5), c2 = R(2, 5);
  const shown = kind === 0 ? [c1 * c2, a * b] : kind === 1 ? [c1 + c2, a + b] : [c1 * c2, a + b];
  if (kind === 0 && a * b === a + b) return make(4);
  if (kind === 1 && c1 + c2 === c1 * c2) return make(4);
  const opts = ['إجابته صحيحة', 'ضرب الأسين بدل أن يجمعهما', 'جمع المعاملين بدل أن يضربهما'], right = [1, 2, 0][kind];
  return { q: `كتب سعيد: ${tm(c1, v, a)} × ${tm(c2, v, b)} = ${tm(shown[0], v, shown[1])}. ما رأيك؟`, input: { type: 'pick', opts }, ok: k => k === right,
    hint: 'تحقّق من المعامل ومن الأس كلٌّ على حدة.', bad: () => 'احسب الناتج بنفسك أولاً ثم قارن.', good: kind === 2 ? 'أحسنت! إجابته صحيحة.' : `أحسنت! الصحيح ${tm(c1 * c2, v, a + b)}.`,
    data: { err: [...seg(c1, v, a), ' × ', ...seg(c2, v, b), ' = ', ...seg(shown[0], v, shown[1])] } };
}

function challenge() {
  const items = [], used = new Set(), fresh = f => { for (let k = 0; k < 60; k++) { const x = f(); const s = JSON.stringify(x); if (!used.has(s)) { used.add(s); return x; } } return f(); };
  { const [a, b] = fresh(() => [R(2, 9), R(2, 9)]); items.push(num(`${pw('س', a)} × ${pw('س', b)} = س أسّها:`, a + b, 'في الضرب نجمع الأسس.', '8Ae5')); }
  { const [a, b] = fresh(() => [R(8, 14), R(2, 7)]); items.push(num(`${pw('ص', a)} ÷ ${pw('ص', b)} = ص أسّها:`, a - b, 'في القسمة نطرح الأسس.', '8Ae5')); }
  { const [c1, c2, a, b] = fresh(() => [R(2, 6), R(2, 6), R(2, 5), R(2, 5)]); items.push(choice(`${tm(c1, 'ع', a)} × ${tm(c2, 'ع', b)} =`, tm(c1 * c2, 'ع', a + b), [tm(c1 + c2, 'ع', a + b), tm(c1 * c2, 'ع', a * b), tm(c1 + c2, 'ع', a * b)], 'اضرب المعاملين واجمع الأسين.', '8Ae5')); }
  { const [q, c, b, d] = fresh(() => [R(2, 5), R(2, 4), R(2, 5), R(2, 4)]); items.push(choice(`${tm(q * c, 'م', b + d)} ÷ ${tm(c, 'م', b)} =`, tm(q, 'م', d), [tm(q + c, 'م', d), tm(q, 'م', b + d + b), tm(q * c, 'م', d)], 'اقسم المعاملين واطرح الأسين.', '8Ae5')); }
  items.push(tf(`${pw('س', 3)} × ${pw('س', 4)} = ${pw('س', 12)}`, false, 'هل نضرب الأسين أم نجمعهما؟', '8Ae5', 'الصحيح س أسّها ٧.'));
  items.push(tf(`${tm(12, 'م', 9)} ÷ ${tm(6, 'م', 8)} = ٢م`, true, 'اقسم ١٢ على ٦، واطرح الأسين.', '8Ae5', '٩ − ٨ = ١، وم أسّها ١ تُكتب م.'));
  { const [a, b] = fresh(() => [R(2, 4), R(2, 4)]), good = [`${pw('ل', a)} × ${pw('ل', b)}`, `${pw('ل', a + b + 2)} ÷ ${pw('ل', 2)}`]; items.push(multi(`أي العبارات الآتية تساوي ${pw('ل', a + b)}؟ (اختر كل الصحيح)`, [...good, `${pw('ل', a)} + ${pw('ل', b)}`, `${pw('ل', a * b)} × ل`], x => good.includes(x), 'اجمع الأسس في الضرب واطرحها في القسمة. والجمع؟', '8Ae5')); }
  { const [c, a] = fresh(() => [R(2, 9), R(2, 6)]); items.push(num(`في ${tm(c, 'س', a)} × ${tm(c, 'س', a)}، ما المعامل في الناتج؟`, c * c, 'اضرب المعاملين.', '8Ae5')); }
  return items.sort(() => Math.random() - .5);
}

export default mission({
  title: 'رفوف المخطوطات', icon: '📜', who, rounds: 5, make, draw,
  intro: ['في المكتبة مخطوطات كثيرة مكررة، ونريد ترتيبها في رفوف مختصرة.', 'قوانين الأسس تعمل مع الحروف كما عملت مع الأعداد!'],
  outro: ['صارت الرفوف مرتبة والعبارات مبسطة.', 'لنختبر التبسيط بأسئلة متنوعة.'],
  challenge: { title: 'تحدي تبسيط العبارات', make: challenge }
});
export { make, challenge };
