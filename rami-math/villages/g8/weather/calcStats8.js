// ١٣-١ حساب الإحصاء — «لوح القراءات»: الراصدة ريم تسجّل قراءات المحطة: ترتيب القراءات بالنقر، والوسيط (القيمة الوسطى بعد الترتيب)،
// والوسط الحسابي (المجموع ÷ العدد)، والمدى (الأكبر − الأصغر)، والمنوال من جدول تكراري، والوسط الحسابي من جدول تكراري.
// القيمة المطلوبة «؟» حتى يحلّ الطالب. التحدي: ٨ أسئلة من 8Dp1 (الكتاب ص٨٢–٨٣).
import { mission } from '../../mission.js';
import { N, R, eq } from '../../math.js';
import { choice, num, tf } from '../../../missions/challenge.js';
import { skyBg, say, glow, readings, freqTable, SKY } from './art.js';

const who = { name: 'الراصدة ريم', face: '👩🏽‍🔬', id: 'reem' };
const pick = a => a[Math.floor(Math.random() * a.length)];
const r1 = v => Math.round(v * 10) / 10;
const sorted = a => a.slice().sort((x, y) => x - y);
const median = a => { const s = sorted(a), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
const KINDS = [['درجات الحرارة الصغرى', '°س', 14, 30], ['سرعة الرياح', 'كم/س', 5, 40], ['الرطوبة', '٪', 20, 90], ['درجات الحرارة العظمى', '°س', 28, 46]];
const list = (n, lo, hi) => Array.from({ length: n }, () => R(lo, hi));

function draw(g, w, h, t, S) {
  const r = S.r ? S.r.data : {}; skyBg(g, w, h, t); say(g, '📋 ' + (r.title || 'لوح القراءات'), w * .5, h * .38, 18, SKY, 900);
  if (r.vals) { const order = S.done && r.sortShow ? sorted(r.vals) : (r.seq && S.v && S.v.length ? S.v.map(k => r.vals[k]) : r.vals); readings(g, w * .06, h * .45, w * .88, order, { unit: r.unit, hl: S.done && r.hlMid ? r.hlMid(order) : [] }); }
  if (r.table) freqTable(g, w * .08, h * .5, w * .84, r.table.head, r.table.vals, r.table.freqs, r.table);
  say(g, S.done ? r.ans : r.ask || '', w * .5, h * .9, 18, S.done ? '#15803D' : '#7C2D12', 900);
  glow(g, w, h, S);
}

function make(i) {
  const [what, unit, lo, hi] = pick(KINDS);
  if (i === 0) { const n = pick([7, 8, 9]), vals = list(n, lo, hi), labs = vals.map(N);
    return { q: `رتّب قراءات ${what} لهذا الأسبوع من الأصغر إلى الأكبر.`, input: { type: 'seq', items: labs }, sol: vals.map((v, k) => [v, k]).sort((a, b) => a[0] - b[0]).map(x => x[1]), ok: v => v.every((k, j) => !j || vals[v[j - 1]] <= vals[k]),
      hint: 'ابحث عن أصغر قراءة أولاً، ثم التي تليها… وانتبه للقراءات المتكررة.', bad: () => 'بعض القراءات ليست في مكانها: هل كل قراءة أكبر من التي قبلها أو تساويها؟',
      good: `بالترتيب: ${sorted(vals).map(N).join('، ')}`, data: { vals, unit, seq: 1, sortShow: 1, ask: 'رتّب القراءات', ans: `الوسيط ${N(median(vals))}`, hlMid: o => o.length % 2 ? [(o.length - 1) / 2] : [o.length / 2 - 1, o.length / 2], title: what } }; }
  if (i === 1) { const n = pick([7, 9, 11]), vals = list(n, lo, hi), m = median(vals);
    return { q: `قراءات ${what} في ${N(n)} ${n > 10 ? 'يوماً' : 'أيام'}: ${vals.map(N).join('، ')}. ما الوسيط؟`, input: { type: 'num' }, sol: m, ok: v => v === m,
      hint: 'رتّب القراءات أولاً. أي قراءة تقع في الوسط تماماً؟', bad: v => v === vals[(n - 1) / 2] ? 'هذه القيمة الوسطى قبل الترتيب: رتّب أولاً.' : '',
      good: `بعد الترتيب القيمة الوسطى ${N(m)}`, data: { vals, unit, sortShow: 1, hlMid: o => [(o.length - 1) / 2], ask: 'الوسيط = ؟', ans: `الوسيط = ${N(m)}`, title: what } }; }
  if (i === 2) { let vals, n; do { n = pick([5, 6, 8]); vals = list(n, lo, hi); } while (vals.reduce((a, b) => a + b, 0) % n); const mean = vals.reduce((a, b) => a + b, 0) / n;
    return { q: `قراءات ${what}: ${vals.map(N).join('، ')}. ما الوسط الحسابي؟`, input: { type: 'num', calc: true }, sol: mean, ok: v => eq(v, mean),
      hint: 'اجمع القراءات كلها، ثم اقسم على عددها.', bad: v => v === median(vals) ? 'هذا الوسيط: الوسط الحسابي من المجموع.' : v === vals.reduce((a, b) => a + b, 0) ? 'هذا المجموع: اقسم على عدد القراءات.' : '',
      good: `${N(vals.reduce((a, b) => a + b, 0))} ÷ ${N(n)} = ${N(mean)}`, data: { vals, unit, ask: 'الوسط الحسابي = ؟', ans: `الوسط الحسابي = ${N(mean)}`, title: what } }; }
  if (i === 3) { const vals = list(pick([6, 7, 8]), lo, hi), rg = Math.max(...vals) - Math.min(...vals);
    return { q: `قراءات ${what}: ${vals.map(N).join('، ')}. ما المدى؟`, input: { type: 'num' }, sol: rg, ok: v => v === rg,
      hint: 'ما أكبر قراءة؟ وما أصغرها؟ والمدى الفرق بينهما.', bad: v => v === Math.max(...vals) ? 'هذه أكبر قراءة فقط.' : '',
      good: `${N(Math.max(...vals))} − ${N(Math.min(...vals))} = ${N(rg)}`, data: { vals, unit, ask: 'المدى = ؟', ans: `المدى = ${N(rg)}`, title: what } }; }
  const days = [0, 1, 2, 3, 4, 5, 6]; let fr; do fr = days.map(() => R(1, 9)); while (new Set(fr).size < 6 || fr.filter(f => f === Math.max(...fr)).length > 1);
  const total = fr.reduce((a, b) => a + b, 0), mode = days[fr.indexOf(Math.max(...fr))], mean = r1(days.reduce((s, d, k) => s + d * fr[k], 0) / total);
  if (i === 4) return { q: `يبين الجدول عدد أيام سقوط الأمطار في شهر يناير على مدار ${N(total)} سنة. ما المنوال؟`, input: { type: 'num' }, sol: mode, ok: v => v === mode,
    hint: 'المنوال هو القيمة الأكثر تكراراً: أي عمود في صف التكرار هو الأكبر؟ واقرأ القيمة فوقه.', bad: v => v === Math.max(...fr) ? 'هذا أكبر تكرار، والمنوال القيمة التي لها هذا التكرار.' : '',
    good: `المنوال ${N(mode)} لأن تكراره ${N(Math.max(...fr))}`, data: { table: { head: 'أيام سقوط الأمطار في يناير', vals: days, freqs: fr, h1: 'الأيام', h2: 'عدد السنين' }, ask: 'المنوال = ؟', ans: `المنوال = ${N(mode)} أيام`, title: 'جدول المطر' } };
  return { q: `يبين الجدول عدد أيام سقوط الأمطار في شهر يناير على مدار ${N(total)} سنة. ما الوسط الحسابي لعدد أيام المطر لأقرب منزلة عشرية؟`, input: { type: 'num', dot: true, calc: true }, sol: mean, ok: v => eq(v, mean),
    hint: 'اضرب كل عدد أيام في تكراره واجمع النواتج، ثم اقسم على مجموع التكرارات.', bad: v => eq(v, r1(days.reduce((a, b) => a + b, 0) / 7)) ? 'لا تنسَ الضرب في التكرارات.' : eq(v, r1(total / 7)) ? 'قسمت مجموع التكرارات: اضرب كل قيمة في تكرارها أولاً.' : '',
    good: `${N(days.reduce((s, d, k) => s + d * fr[k], 0))} ÷ ${N(total)} ≈ ${N(mean)}`, data: { table: { head: 'أيام سقوط الأمطار في يناير', vals: days, freqs: fr, h1: 'الأيام', h2: 'عدد السنين' }, ask: 'الوسط الحسابي = ؟', ans: `الوسط الحسابي ≈ ${N(mean)}`, title: 'جدول المطر' } };
}

function challenge() {
  const items = [], used = new Set(), fresh = f => { for (let k = 0; k < 60; k++) { const x = f(); const s = JSON.stringify(x); if (!used.has(s)) { used.add(s); return x; } } return f(); };
  { const v = fresh(() => list(7, 10, 40)); items.push(num(`ما وسيط القراءات: ${v.map(N).join('، ')}؟`, median(v), 'رتّب ثم خذ الوسطى.', '8Dp1')); }
  { const v = fresh(() => { let a; do a = list(5, 10, 40); while (a.reduce((x, y) => x + y, 0) % 5); return a; }); items.push(num(`ما الوسط الحسابي للقراءات: ${v.map(N).join('، ')}؟`, v.reduce((a, b) => a + b, 0) / 5, 'المجموع ÷ العدد.', '8Dp1')); }
  { const v = fresh(() => list(6, 10, 45)); items.push(num(`ما مدى القراءات: ${v.map(N).join('، ')}؟`, Math.max(...v) - Math.min(...v), 'الأكبر − الأصغر.', '8Dp1')); }
  items.push(choice('القيمة الأكثر تكراراً في مجموعة بيانات هي:', 'المنوال', ['الوسيط', 'الوسط الحسابي', 'المدى'], 'أي مقياس يعتمد على التكرار؟', '8Dp1'));
  items.push(tf('المدى نوع من أنواع المتوسط.', false, 'ماذا يقيس المدى؟', '8Dp1', 'المدى يقيس تباعد القيم لا متوسطها.'));
  items.push(tf('وسيط ٤ قيم مرتبة هو متوسط القيمتين الوسطيين.', true, 'لا توجد قيمة وسطى واحدة.', '8Dp1', 'نجمع الوسطيين ونقسم على ٢.'));
  items.push(num('عدد الخرز في القلادات: ٢٥ خرزة تكرارها ٣٤، و٣٠ خرزة تكرارها ٤٨، و٣٥ خرزة تكرارها ٦١. ما المنوال؟', 35, 'أكبر تكرار.', '8Dp1'));
  { const v = fresh(() => { const a = list(4, 10, 30); return a; }); items.push(num(`ما وسيط القراءات: ${v.map(N).join('، ')}؟`, median(v), 'رتّب وخذ متوسط الوسطيين.', '8Dp1', { dot: true })); }
  return items.sort(() => Math.random() - .5);
}

export default mission({
  title: 'لوح القراءات', icon: '📋', who, rounds: 6, make, draw,
  intro: ['أهلاً بك في محطة الأرصاد! أنا ريم، أسجّل الحرارة والرياح والرطوبة كل يوم.', 'القراءات كثيرة… لكن الإحصاء يلخّصها: الوسيط والوسط الحسابي والمنوال، والمدى لتباعدها.'],
  outro: ['رائع! لوح القراءات صار ملخّصاً بالأرقام.', 'تحدي حساب الإحصاء.'],
  challenge: { title: 'تحدي الإحصاء', make: challenge }
});
export const ROUNDS = 6;
export { make, challenge };
