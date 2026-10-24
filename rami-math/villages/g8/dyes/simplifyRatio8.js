// ٩-١ تبسيط النسب — «أحواض الصبغ»: الصبّاغ غالب يكتب وصفات ألوانه بكميات كبيرة، والطالب يخلطها في الحوض بأبسط نسبة بزرّي + و−:
// نسبة بحدين، ونسبة بثلاثة حدود، وكميتان بوحدتين مختلفتين (تُحوّلان أولاً)، وكسور عشرية (تُضرب في ١٠)، ورأي سارة في نسبة المربى.
// لون الحوض يتبع خليط الطالب، والوصفة الكاملة تظهر بعد الحل. التحدي: ٨ أسئلة (الكتاب ص١٦–١٨).
import { mission } from '../../mission.js';
import { N, R, gcd } from '../../math.js';
import { choice, num, tf } from '../../../missions/challenge.js';
import { dyeBg, say, glow, vat, partsBar, mixCol, ratio, TEAL } from './art.js';

const who = { name: 'الصبّاغ غالب', face: '👳🏽‍♂️', id: 'ghalib' };
const pick = a => a[Math.floor(Math.random() * a.length)];
const g3 = a => a.reduce((x, y) => gcd(x, y));
const simp = a => { const g = g3(a); return a.map(v => v / g); };
const same = (v, a) => v.length === a.length && v.every((x, k) => x === a[k]);
const prop = (v, a) => v.length === a.length && v.every((x, k) => x * a[0] === a[k] * v[0]);
const DYES = [['أحمر', '#DC2626'], ['أبيض', '#F8FAFC'], ['أزرق', '#2563EB'], ['أصفر', '#FACC15'], ['أسود', '#1F2937']];
const PAIRS = [[0, 1], [2, 1], [3, 0], [2, 3], [0, 4], [3, 1]];

function draw(g, w, h, t, S) {
  const r = S.r ? S.r.data : {}; dyeBg(g, w, h, t);
  const cols = r.cols || ['#DC2626', '#F8FAFC'], parts = S.done ? r.sol : (S.v && S.v.some(x => x) ? S.v : null);
  say(g, '🎨 ' + (r.title || 'وصفة الصبغ'), w * .5, h * .16, 18, TEAL, 900);
  g.fillStyle = '#FFFBEB'; g.beginPath(); g.roundRect(w * .52, h * .22, w * .42, h * .42, 14); g.fill(); g.strokeStyle = '#B45309'; g.lineWidth = 3; g.stroke();
  (r.lines || []).forEach((l, k) => say(g, l, w * .73, h * .32 + k * 26, 16, '#7C2D12', 900));
  vat(g, w * .26, h * .62, Math.min(w * .17, h * .22), parts ? mixCol(parts, cols) : '#D6D3D1', t, parts ? ratio(parts) : '؟');
  if (parts) partsBar(g, w * .1, h * .8, w * .8, parts, cols, r.names || []);
  glow(g, w, h, S);
}
const mixIn = (names, cols, max = 12) => ({ type: 'mix', parts: names.map((n, k) => ({ name: n, col: cols[k] })), min: 1, max });
const okMix = sol => v => same(v, sol);
const badMix = sol => v => prop(v, sol) ? 'النسبة صحيحة! هل يمكن قسمة الحدود كلها على عدد آخر؟' : 'هل يبقى الخليط باللون نفسه؟ قسّم الكميتين على العدد نفسه.';

function make(i) {
  if (i === 0) { const [a, b] = pick(PAIRS); let s; do s = [R(1, 9), R(1, 9)]; while (gcd(s[0], s[1]) !== 1 || s[0] === s[1]); const k = pick([25, 50, 100, 125, 150, 20, 40]), q = s.map(v => v * k);
    return { q: `وصفة غالب: ${N(q[0])} مل صبغ ${DYES[a][0]} مع ${N(q[1])} مل صبغ ${DYES[b][0]}. اخلطها في الحوض بأبسط نسبة.`, input: mixIn([DYES[a][0], DYES[b][0]], [DYES[a][1], DYES[b][1]]), sol: s, ok: okMix(s),
      hint: 'ما أكبر عدد يقسم الكميتين معاً؟', bad: badMix(s), good: `${ratio(q)} = ${ratio(s)}`, data: { cols: [DYES[a][1], DYES[b][1]], names: [DYES[a][0], DYES[b][0]], sol: s, lines: [`${DYES[a][0]}: ${N(q[0])} مل`, `${DYES[b][0]}: ${N(q[1])} مل`], title: 'وصفة بلونين' } }; }
  if (i === 1) { let s; do s = [R(1, 7), R(1, 7), R(1, 7)]; while (g3(s) !== 1 || new Set(s).size < 3); const k = R(2, 9), q = s.map(v => v * k), ids = pick([[0, 3, 2], [2, 1, 3], [0, 1, 4], [3, 2, 0]]);
    return { q: `صبغ أخضر زيتي: ${N(q[0])} لتر ${DYES[ids[0]][0]} و${N(q[1])} لتر ${DYES[ids[1]][0]} و${N(q[2])} لتر ${DYES[ids[2]][0]}. اخلطه بأبسط نسبة.`, input: mixIn(ids.map(j => DYES[j][0]), ids.map(j => DYES[j][1])), sol: s, ok: okMix(s),
      hint: 'ما أكبر عدد يقسم الكميات الثلاث كلها؟', bad: badMix(s), good: `${ratio(q)} = ${ratio(s)}`, data: { cols: ids.map(j => DYES[j][1]), names: ids.map(j => DYES[j][0]), sol: s, lines: ids.map((j, n) => `${DYES[j][0]}: ${N(q[n])} لتر`), title: 'وصفة بثلاثة ألوان' } }; }
  if (i === 2) { const U = pick([['لتر', 'مل', 1000], ['كغم', 'غم', 1000], ['دقيقة', 'ثانية', 60], ['ساعة', 'دقيقة', 60], ['م', 'سم', 100]]); let s, A, B; do { s = [R(1, 9), R(1, 9)]; A = R(1, 3); B = A * U[2] * s[1] / s[0]; } while (gcd(s[0], s[1]) !== 1 || s[0] === s[1] || B % 1 || B >= A * U[2] * 3 || B < 5);
    const [a, b] = pick(PAIRS);
    return { q: `اكتب النسبة ${N(A)} ${U[0]} : ${N(B)} ${U[1]} بأبسط صورة.`, input: mixIn(['الحد الأول', 'الحد الثاني'], [DYES[a][1], DYES[b][1]], 20), sol: s, ok: okMix(s),
      hint: 'هل الكميتان بالوحدة نفسها؟ حوّل أولاً ثم بسّط.', bad: v => same(v, simp([A, B])) ? 'حوّل الوحدتين إلى وحدة واحدة أولاً.' : badMix(s)(v), good: `${N(A * U[2])} ${U[1]} : ${N(B)} ${U[1]} = ${ratio(s)}`, data: { cols: [DYES[a][1], DYES[b][1]], names: [DYES[a][0], DYES[b][0]], sol: s, lines: [`${N(A)} ${U[0]}`, `${N(B)} ${U[1]}`], title: 'وحدتان مختلفتان' } }; }
  if (i === 3) { let s, k; do { s = [R(1, 9), R(1, 9)]; k = pick([.5, .2, .3, .4, .6, .25, .15]); } while (gcd(s[0], s[1]) !== 1 || s[0] === s[1] || (s[0] * k * 10) % 1 || (s[1] * k * 10) % 1);
    const q = s.map(v => Math.round(v * k * 100) / 100), [a, b] = pick(PAIRS);
    return { q: `في وصفة صغيرة ${N(q[0])} لتر ${DYES[a][0]} و${N(q[1])} لتر ${DYES[b][0]}. اخلطها بأبسط نسبة بأعداد كاملة.`, input: mixIn([DYES[a][0], DYES[b][0]], [DYES[a][1], DYES[b][1]]), sol: s, ok: okMix(s),
      hint: 'كيف تتخلص من الفاصلة العشرية في الحدين معاً؟ ثم بسّط.', bad: badMix(s), good: `${ratio(q)} = ${ratio(q.map(v => Math.round(v * 100)))} = ${ratio(s)}`, data: { cols: [DYES[a][1], DYES[b][1]], names: [DYES[a][0], DYES[b][0]], sol: s, lines: [`${DYES[a][0]}: ${N(q[0])} لتر`, `${DYES[b][0]}: ${N(q[1])} لتر`], title: 'كسور عشرية' } }; }
  if (i === 4) { let o, su; do { o = R(3, 15) * 50; su = R(1, 4) * 500; } while (gcd(o, su) === o || o === su);
    const s = simp([o, su]), wrong = simp([o, su / 1000]), claim = pick([[2, 1], [1, 2], s]), right = same(claim, s);
    const opts = ['نعم، النسبة صحيحة', `لا، النسبة ${ratio(s)}`, `لا، النسبة ${ratio(s.slice().reverse())}`];
    const ans = right ? 0 : 1; if (same(s, s.slice().reverse())) opts[2] = `لا، النسبة ${ratio(wrong)}`;
    return { q: `وصفة مربى البرتقال: ${N(o)} غم برتقال و${N(su / 1000)} كغم سكر. تقول سارة: نسبة البرتقال إلى السكر ${ratio(claim)}. هل سارة على صواب؟`, input: { type: 'pick', opts: [...new Set(opts)] }, ok: v => v === ans,
      hint: 'هل الكميتان بالوحدة نفسها؟ وأي الكميتين تُكتب أولاً؟', bad: () => right ? 'حوّل الكيلوغرامات إلى غرامات ثم بسّط وقارن.' : 'حوّل ثم بسّط: هل تطابق نسبة سارة؟',
      good: `${N(o)} غم : ${N(su)} غم = ${ratio(s)}`, data: { cols: ['#F97316', '#F8FAFC'], names: ['برتقال', 'سكر'], sol: s, lines: [`برتقال: ${N(o)} غم`, `سكر: ${N(su / 1000)} كغم`], title: 'مربى البرتقال' } }; }
  let s; do s = [R(1, 9), R(1, 9)]; while (gcd(s[0], s[1]) !== 1 || s[0] === s[1]); const k = R(11, 30), q = s.map(v => v * k), [a, b] = pick(PAIRS);
  return { q: `صبغ ${N(q[0])} ثوباً باللون ${DYES[a][0]} و${N(q[1])} ثوباً باللون ${DYES[b][0]}. ما أبسط نسبة لعدد الثياب الأولى إلى الثانية؟`, input: mixIn([DYES[a][0], DYES[b][0]], [DYES[a][1], DYES[b][1]]), sol: s, ok: okMix(s),
    hint: 'جرّب القسمة على عامل مشترك، ثم على آخر حتى لا تستطيع.', bad: badMix(s), good: `${ratio(q)} = ${ratio(s)}`, data: { cols: [DYES[a][1], DYES[b][1]], names: [DYES[a][0], DYES[b][0]], sol: s, lines: [`${DYES[a][0]}: ${N(q[0])} ثوباً`, `${DYES[b][0]}: ${N(q[1])} ثوباً`], title: 'ثياب اليوم' } };
}

function challenge() {
  const items = [], used = new Set(), fresh = f => { for (let k = 0; k < 60; k++) { const x = f(); const s = JSON.stringify(x); if (!used.has(s)) { used.add(s); return x; } } return f(); };
  { const [a, b, k] = fresh(() => pick([[1, 2, 250], [3, 5, 4], [2, 3, 12], [5, 3, 8]])); items.push(choice(`بسّط النسبة ${ratio([a * k, b * k])}`, ratio([a, b]), [ratio([b, a]), ratio([a * 2, b * 2]), ratio([a + 1, b])].filter((x, i, A) => A.indexOf(x) === i && x !== ratio([a, b])), 'اقسم الحدين على العامل المشترك الأكبر.', '8Nf5')); }
  { const [a, b, c, k] = fresh(() => pick([[2, 5, 4, 6], [1, 2, 3, 5], [3, 2, 1, 4], [4, 3, 2, 3]])); items.push(choice(`بسّط النسبة ${ratio([a * k, b * k, c * k])}`, ratio([a, b, c]), [ratio([c, b, a]), ratio([a * 2, b * 2, c * 2]), ratio([a, b, c + 1])], 'اقسم الحدود الثلاثة على العدد نفسه.', '8Nf5')); }
  { const [m, cm] = fresh(() => pick([[2, 50], [1, 25], [3, 75], [1, 20]])); items.push(choice(`بسّط النسبة ${N(m)} م : ${N(cm)} سم`, ratio(simp([m * 100, cm])), [ratio(simp([m, cm])), ratio([m * 100, cm]), ratio(simp([cm, m * 100]))], 'حوّل الأمتار إلى سنتيمترات أولاً.', '8Nf5')); }
  { const [a, b] = fresh(() => pick([[0.5, 2], [1.5, 3], [0.6, 3.6], [1.2, 2.4]])); const s = simp([a * 10, b * 10]); items.push(num(`النسبة ${ratio([a, b])} في أبسط صورة هي ١ : ؟`, s[1] / s[0], 'اضرب في ١٠ ثم بسّط.', '8Nf5')); }
  items.push(tf('النسبة ٤ : ٦ في أبسط صورة هي ٢ : ٣.', true, 'اقسم على ٢.', '8Nf5', 'العامل المشترك الأكبر ٢.'));
  items.push(tf('لتبسيط النسبة ٣٦ ثانية : ١ دقيقة نقسم ٣٦ على ١ مباشرة.', false, 'هل الوحدتان متماثلتان؟', '8Nf5', 'نحوّل الدقيقة إلى ٦٠ ثانية: ٣٦ : ٦٠ = ٣ : ٥.'));
  { const [d, h] = fresh(() => pick([[2, 18], [1, 8], [4, 24], [3, 12]])); const s = simp([d * 24, h]); items.push(choice(`بسّط النسبة ${N(d)} يوم : ${N(h)} ساعة`, ratio(s), [ratio(simp([d, h])), ratio([s[1], s[0]]), ratio([d * 24, h])].filter(x => x !== ratio(s)), 'كم ساعة في اليوم؟', '8Nf5')); }
  { const [a, b] = fresh(() => pick([[500, 250], [800, 200], [600, 900], [150, 450]])); const s = simp([a, b]); items.push(num(`نسبة الدقيق إلى الزبدة ${ratio([a, b])}. إذا كُتبت بأبسط صورة ${N(s[0])} : ن فما ن؟`, s[1], 'اقسم على العامل المشترك الأكبر.', '8Nf5')); }
  return items.sort(() => Math.random() - .5);
}

export default mission({
  title: 'أحواض الصبغ', icon: '🎨', who, rounds: 6, make, draw,
  intro: ['أهلاً بك في المصبغة! أنا غالب، أصبغ الأقمشة منذ أربعين سنة.', 'وصفاتي مكتوبة بكميات كبيرة، لكن الحوض يحتاج أبسط نسبة. ما دامت النسبة نفسها يبقى اللون نفسه!'],
  outro: ['رائع! كل وصفة صارت بأبسط نسبة واللون لم يتغير.', 'الآن تحدٍّ في تبسيط النسب.'],
  challenge: { title: 'تحدي تبسيط النسب', make: challenge }
});
export const ROUNDS = 6;
export { make, challenge };
