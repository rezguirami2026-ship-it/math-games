// ٤-٢ جمع الكسور وطرحها — «قوارير ماء الورد»: قارورتان مدرّجتان بتدريجين مختلفين تُصبّان في قارورة الخلط، ولا يُقرأ المجموع
// إلا بتدريج مشترك (المضاعف المشترك الأصغر). جمع وطرح كسور، ثم أعداد كسرية (مع الاستلاف في الطرح)، ومثال مناقض لقول هلال.
// التحدي: ٨ أسئلة من 8Nf2 (الكتاب ص٦٣–٦٥).
import { mission } from '../../mission.js';
import { N, R, fr, mx, fx, gcd, lcm, fOk, fBad, fEq } from '../../math.js';
import { choice, num, tf, order } from '../../../missions/challenge.js';
import { kitchen, flask, fracC, mixC, valC, say } from './art.js';

const who = { name: 'مريم صانعة ماء الورد', face: '👩🏽‍🌾', id: 'maryam' };
/* كسر فعلي a/b في أبسط صورة، والمقام بين b0 وb1 */
const pf = (b0, b1, not = 0) => { for (let t = 0; t < 60; t++) { const b = R(b0, b1), a = R(1, b - 1); if (gcd(a, b) === 1 && b !== not) return [a, b]; } return [1, 2]; };
/* مقامان مختلفان مضاعفهما المشترك الأصغر ≤ cap ولا يساوي حاصل ضربهما دائماً */
const two = (cap = 40) => { for (let t = 0; t < 80; t++) { const [a, b] = pf(2, 12), [c, e] = pf(2, 12, b); if (lcm(b, e) <= cap && b !== e) return { a, b, c, e }; } return { a: 3, b: 4, c: 4, e: 7 }; };
const show = (n, d) => { const g = gcd(n, d); return [n / g, d / g]; };

function draw(g, w, h, t, S) {
  const r = S.r ? S.r.data : {}; kitchen(g, w, h, h * .8); const base = h * .78;
  if (r.mode === 'pick') {   // قول هلال على لوح
    g.fillStyle = '#FFFDF6'; g.fillRect(w * .1, h * .1, w * .8, h * .5); g.strokeStyle = '#F472B6'; g.lineWidth = 4; g.strokeRect(w * .1, h * .1, w * .8, h * .5);
    say(g, r.claim, w * .5, h * .3, 17, '#831843'); say(g, '— ' + r.who, w * .5, h * .44, 15, '#64748B'); return;
  }
  const fh = h * .48, L = lcm(r.b, r.e);
  if (r.mode === 'mix') {   // أعداد كسرية: قوارير ممتلئة للعدد الصحيح وقارورة جزئية
    [[w * .8, r.W1, r.a, r.b, '#F472B6'], [w * .2, r.W2, r.c, r.e, '#C084FC']].forEach(([x, W, a, b, col]) => {
      for (let k = 0; k < W; k++) flask(g, x - 34 + (k % 4) * 22, base - 6 - Math.floor(k / 4) * 54, 18, 46, 1, 1, col);
      flask(g, x + 40, base, 34, fh * .6, a / b, b, col); mixC(g, W, a, b, x, h * .14, 24, '#831843'); });
    say(g, r.op === 1 ? '+' : '−', w * .5, h * .2, 34, '#1E2433');
    if (S.done) { g.fillStyle = 'rgba(255,255,255,.85)'; g.fillRect(w * .33, h * .32, w * .34, h * .26); valC(g, r.rn, r.rd, w * .5, h * .44, 26, '#15803D'); }
    return;
  }
  flask(g, w * .82, base, 52, fh, r.a / r.b, r.b, '#F472B6'); fracC(g, r.a, r.b, w * .82, h * .12, 24, '#831843');
  flask(g, w * .18, base, 52, fh, r.c / r.e, r.e, '#C084FC'); fracC(g, r.c, r.e, w * .18, h * .12, 24, '#6B21A8');
  say(g, r.op === 1 ? '+' : '−', w * .5, h * .14, 30, '#1E2433');
  // قارورة الخلط (سعتها لتران): تدريجها مشترك يظهر بعد الحل
  const res = r.rn / r.rd, lv = S.done ? res / 2 * Math.min(1, S.anim * 1.4) : 0;
  flask(g, w * .5, base, 86, fh * 1.15, lv, S.done ? L * 2 : 2, '#FB7185'); say(g, 'لتر واحد', w * .5 + 78, base - (fh * 1.15 - 10) / 2 + 5, 13, '#64748B');
  if (S.done) valC(g, r.rn, r.rd, w * .5, h * .3, 22, '#15803D');
  if (S.pulse > 0) { g.strokeStyle = `rgba(34,197,94,${S.pulse})`; g.lineWidth = 6; g.strokeRect(4, 4, w - 8, h - 8); }
}

function make(i) {
  if (i <= 1) { const P = two(), op = i === 0 ? 1 : -1;
    if (op === -1 && P.a / P.b < P.c / P.e) [P.a, P.b, P.c, P.e] = [P.c, P.e, P.a, P.b];
    const L = lcm(P.b, P.e), [rn, rd] = show(P.a * L / P.b + op * P.c * L / P.e, L);
    return { q: `${op === 1 ? 'تُصبّ القارورتان معاً في قارورة الخلط' : 'من القارورة الوردية يُصبّ قدر ما في البنفسجية'}: ${fr(P.a, P.b)} ${op === 1 ? '+' : '−'} ${fr(P.c, P.e)}. كم لتراً ${op === 1 ? 'في قارورة الخلط' : 'يبقى'}؟`,
      input: { type: 'frac', mixed: true }, ok: v => fOk(v, rn, rd),
      hint: 'القارورتان بتدريجين مختلفين: ما أصغر تدريج يناسب الاثنتين معاً؟ أعد كتابة كل كسر به.',
      bad: v => fBad(v, rn, rd) || (fEq(v, P.a + op * P.c, P.b + P.e) ? 'هل نجمع المقامات؟ وحّد التدريج أولاً ثم اجمع البسطين فقط.' : ''),
      good: `أحسنت! بالتدريج المشترك ${N(L)}.`, data: { mode: 'flask', ...P, op, rn, rd } }; }
  if (i <= 3) { const P = two(36), op = i === 2 ? 1 : -1; let W1 = R(2, 6), W2 = R(1, 4);
    if (op === -1) { W1 = W2 + R(1, 4); if (P.a / P.b > P.c / P.e) [P.a, P.b, P.c, P.e] = [P.c, P.e, P.a, P.b]; }   // الطرح بالاستلاف: الكسر الأول أصغر
    const L = lcm(P.b, P.e), tot = (W1 * P.b + P.a) * (L / P.b) + op * (W2 * P.e + P.c) * (L / P.e), [rn, rd] = show(tot, L);
    return { q: `${op === 1 ? 'جمعت مريم' : 'من'} ${mx(W1, P.a, P.b)} لتر ${op === 1 ? 'و' : 'باعت'} ${mx(W2, P.c, P.e)} لتر. ${op === 1 ? 'كم لتراً معها؟' : 'كم لتراً بقي؟'}`,
      input: { type: 'frac', mixed: true }, ok: v => fOk(v, rn, rd),
      hint: op === 1 ? 'اجمع الأعداد الصحيحة وحدها، والكسور وحدها بتدريج مشترك. هل صار مجموع الكسور أكبر من ١؟' : 'الكسر الأول أصغر من الثاني: كيف تستلف واحداً صحيحاً؟ أو حوّل العددين إلى كسرين غير فعليين.',
      bad: v => fBad(v, rn, rd), good: 'أحسنت! وتستطيع التحقق بالعملية العكسية.', data: { mode: 'mix', ...P, W1, W2, op, rn, rd } }; }
  // مثال مناقض: هلال (كسران مختلفان مجموعهما أكبر من ١) أو عائشة (كسران متساويان)
  const hil = R(0, 1), pairs = [];
  if (hil) { const s = [[1, 2, 1, 6], [1, 3, 1, 4], [1, 5, 2, 5], [1, 4, 1, 6], [2, 7, 1, 3], [1, 3, 2, 9]][R(0, 5)]; pairs.push({ p: s, ok: true }); [[3, 4, 2, 3], [5, 6, 1, 2], [4, 5, 3, 7], [7, 8, 1, 4]].sort(() => Math.random() - .5).slice(0, 2).forEach(x => pairs.push({ p: x, ok: false })); }
  else { const s = [[1, 3], [2, 5], [1, 4], [3, 8], [1, 6], [3, 7]][R(0, 5)]; pairs.push({ p: [...s, ...s], ok: true }); [[3, 4], [5, 6], [4, 5], [7, 9]].sort(() => Math.random() - .5).slice(0, 2).forEach(x => pairs.push({ p: [...x, ...x], ok: false })); }
  const sh = pairs.sort(() => Math.random() - .5);
  return { q: `${hil ? 'قال هلال' : 'قالت عائشة'}: «${hil ? 'إذا جمعتُ كسرين مختلفين' : 'إذا جمعتُ كسرين متساويين'} فالناتج دائماً أكبر من ١». أي مثال يناقض ${hil ? 'قوله' : 'قولها'}؟`,
    input: { type: 'pick', opts: sh.map(o => `${fr(o.p[0], o.p[1])} + ${fr(o.p[2], o.p[3])}`) }, ok: k => sh[k].ok,
    hint: 'المثال المناقض مثال واحد يجعل العبارة غير صحيحة: أي مجموع ليس أكبر من ١؟', bad: () => 'احسب هذا المجموع: هل هو أصغر من ١ فعلاً؟',
    good: 'أحسنت! يكفي مثال مناقض واحد لتوضيح أن العبارة خاطئة.', data: { mode: 'pick', claim: `«${hil ? 'كسران مختلفان' : 'كسران متساويان'}: المجموع دائماً أكبر من ١»`, who: hil ? 'هلال' : 'عائشة' } };
}

function challenge() {
  const items = [], used = new Set(), fresh = f => { for (let k = 0; k < 60; k++) { const v = f(); const s = JSON.stringify(v); if (!used.has(s)) { used.add(s); return v; } } return f(); };
  { const P = fresh(() => two(30)); items.push(num(`ما المضاعف المشترك الأصغر للمقامين في ${fr(P.a, P.b)} + ${fr(P.c, P.e)}؟`, lcm(P.b, P.e), 'ابدأ بمضاعفات المقام الأكبر: أيها يقبل القسمة على الآخر؟', '8Nf2')); }
  { const P = fresh(() => two(30)), L = lcm(P.b, P.e), right = fx(P.a * L / P.b + P.c * L / P.e, L); items.push(choice(`${fr(P.a, P.b)} + ${fr(P.c, P.e)} =`, right, [fr(P.a + P.c, P.b + P.e), fr(P.a + P.c, L), fr(P.a * P.c, P.b * P.e)].filter(x => x !== right), 'وحّد المقامات أولاً، ثم اجمع البسطين.', '8Nf2')); }
  { const [a, b] = fresh(() => pf(3, 9)), W = R(3, 8); items.push(num(`${mx(W, a, b)} = ؟/${N(b)}. ما البسط؟`, W * b + a, 'كم جزءاً في كل واحد صحيح؟ اضرب ثم أضف بسط الكسر.', '8Nf2')); }
  { const d = fresh(() => R(3, 9)), q = R(2, 6), n = d * q + R(1, d - 1); items.push(num(`حوّل ${fr(n, d)} إلى عدد كسري. ما العدد الصحيح فيه؟`, q, 'كم مرة يدخل المقام في البسط؟', '8Nf2')); }
  { const P = fresh(() => two(24)); const vals = [[P.a, P.b], [P.c, P.e], [1, 2]].filter((v, j, A) => A.findIndex(x => x[0] * v[1] === v[0] * x[1]) === j);
    if (vals.length === 3) items.push(order('رتّب الكسور من الأصغر إلى الأكبر:', vals.map(v => ({ label: fr(v[0], v[1]), v: v[0] / v[1] })), (x, y) => x.v - y.v, 'وحّد المقامات ثم قارن البسوط.', '8Nf2'));
    else items.push(tf(`${fr(1, 2)} + ${fr(1, 3)} = ${fr(5, 6)}`, true, 'وحّد المقامين إلى ٦.', '8Nf2', '٣/٦ + ٢/٦ = ٥/٦.')); }
  items.push(tf(`${fr(2, 3)} + ${fr(1, 4)} = ${fr(3, 7)}`, false, 'هل نجمع المقامات؟', '8Nf2', 'الصحيح ٨/١٢ + ٣/١٢ = ١١/١٢.'));
  items.push(tf(`في ${mx(6, 1, 3)} − ${mx(2, 4, 9)} نحتاج إلى الاستلاف لأن ${fr(1, 3)} أصغر من ${fr(4, 9)}.`, true, 'قارن ٣/٩ و٤/٩.', '8Nf2', '١/٣ = ٣/٩ وهي أصغر من ٤/٩، فنستلف واحداً.'));
  { const W1 = fresh(() => R(1, 3)), W2 = R(1, 3); items.push(num(`يصنع يوسف رفاً من قطعتين: ${mx(W1, 1, 4)} م و${mx(W2, 4, 5)} م. كم متراً صحيحاً كاملاً في الطول الكلي؟`, W1 + W2 + 1, 'اجمع الكسرين أولاً: هل يزيد مجموعهما على ١؟', '8Nf2')); }
  return items.sort(() => Math.random() - .5);
}

export default mission({
  title: 'قوارير ماء الورد', icon: '🌹', who, rounds: 5, make, draw,
  intro: ['ماء الورد الذي نقطّره في الجبل الأخضر يُقاس بقوارير مدرّجة.', 'لكن كل قارورة بتدريج مختلف… فكيف نعرف المجموع حين نخلطهما؟'],
  outro: ['أحسنت! صار تدريج قارورة الخلط يناسب كل القوارير.', 'لنختبر الجمع والطرح بأسئلة متنوعة.'],
  challenge: { title: 'تحدي جمع الكسور وطرحها', make: challenge }
});
export { make, challenge };
