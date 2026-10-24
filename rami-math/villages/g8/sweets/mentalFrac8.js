// ٤-٥ التعامل مع الكسور ذهنياً — «دكّان الحلوى»: زبائن يقفون عند الطاولة واحداً بعد الآخر، ولكل زبون طلب يُحسب في الذهن.
// على الرف ثلاث علب كُتب على كل منها كسر، والطالب يناول الزبون العلبة الصحيحة (جمع وطرح وضرب وقسمة ذهنياً ثم مسألة لفظية).
// التحدي: ٨ أسئلة من 8Nc2 (الكتاب ص٧٢–٧٤).
import { mission } from '../../mission.js';
import { N, R, fr, mx, fx, gcd, lcm } from '../../math.js';
import { choice, num, tf } from '../../../missions/challenge.js';
import { kitchen, jar, fracC, valC, say } from './art.js';

const who = { name: 'حمد صاحب الدكّان', face: '🧔🏽', id: 'hamad' };
const pf = (b0, b1) => { for (let t = 0; t < 60; t++) { const b = R(b0, b1), a = R(1, b - 1); if (gcd(a, b) === 1) return [a, b]; } return [1, 2]; };
const red = (n, d) => { const g = gcd(n, d); return [n / g, d / g]; };
const LOOKS = [['#0F766E', '#C68A5B'], ['#7C3AED', '#B5835A'], ['#BE185D', '#D2A07A'], ['#1D4ED8', '#A8764E'], ['#B45309', '#C99A72']];

/* الزبون: شخص بسيط يتقدم إلى الطاولة، وفقاعة طلبه */
function customer(g, x, y, look, t) {
  const [robe, skin] = look, bob = Math.sin(t * 3) * 2;
  g.fillStyle = 'rgba(0,0,0,.15)'; g.beginPath(); g.ellipse(x, y + 4, 26, 7, 0, 0, 7); g.fill();
  g.fillStyle = robe; g.beginPath(); g.moveTo(x - 24, y); g.lineTo(x - 18, y - 70 + bob); g.lineTo(x + 18, y - 70 + bob); g.lineTo(x + 24, y); g.closePath(); g.fill();
  g.fillStyle = skin; g.beginPath(); g.arc(x, y - 86 + bob, 17, 0, 7); g.fill(); g.fillStyle = '#F8FAFC'; g.beginPath(); g.arc(x, y - 96 + bob, 17, Math.PI, 0); g.fill();
  g.strokeStyle = '#1E2433'; g.lineWidth = 2; g.beginPath(); g.arc(x, y - 82 + bob, 7, .2, Math.PI - .2); g.stroke();
  g.fillStyle = '#1E2433'; [-6, 6].forEach(o => { g.beginPath(); g.arc(x + o, y - 88 + bob, 2, 0, 7); g.fill(); });
}

function draw(g, w, h, t, S) {
  const r = S.r ? S.r.data : {}; kitchen(g, w, h, h * .66);
  // رف خلف الطاولة عليه علب ملونة للزينة
  g.fillStyle = '#92400E'; g.fillRect(w * .04, h * .2, w * .92, 8); for (let k = 0; k < 9; k++) jar(g, w * .08 + k * w * .105, h * .2, 22, 28, .4 + (k % 3) * .3, ['#DC2626', '#2563EB', '#16A34A'][k % 3]);
  const enter = Math.min(1, S.anim * 1.5), cx = w * .1 - (1 - enter) * w * .2;
  customer(g, cx, h * .64, LOOKS[r.look || 0], t);
  // فقاعة الطلب
  g.fillStyle = '#FFFFFF'; g.strokeStyle = '#CBD5E1'; g.lineWidth = 2; const bx = w * .36, by = h * .27, bw = w * .28, bh = h * .3;
  g.beginPath(); g.roundRect(bx - bw / 2, by, bw, bh, 14); g.fill(); g.stroke(); g.beginPath(); g.moveTo(bx - bw / 2 + 10, by + bh - 20); g.lineTo(cx + 26, h * .5); g.lineTo(bx - bw / 2 + 30, by + bh - 6); g.fill();
  if (r.expr) { const [A, op, B] = r.expr, y = by + bh * .45;
    const put = (v, x) => typeof v === 'number' ? say(g, N(v), x, y + 10, 26, '#1E2433') : fracC(g, v[0], v[1], x, y, 22);
    put(A, bx + bw * .28); say(g, op, bx, y + 8, 24, '#B45309'); put(B, bx - bw * .28); }
  else say(g, r.short || '', bx, by + bh * .55, 15, '#1E2433');
  // الطاولة والعلب الثلاث للاختيار
  g.fillStyle = '#7C4A1E'; g.fillRect(w * .55, h * .62, w * .43, 14);
  (r.opts || []).forEach((o, k) => { const x = w * .62 + k * w * .14, lift = S.done && k === r.right ? -Math.min(30, S.t % 1 * 30) : 0;
    jar(g, x, h * .62 + lift, 44, 56, 1, ['#DC2626', '#2563EB', '#16A34A'][k]); g.fillStyle = '#FFFBEB'; g.fillRect(x - 24, h * .62 - 50 + lift, 48, 40); valC(g, o[0], o[1], x, h * .62 - 32 + lift, 14, '#1E2433'); });
  if (S.pulse > 0) { g.strokeStyle = `rgba(34,197,94,${S.pulse})`; g.lineWidth = 6; g.strokeRect(4, 4, w - 8, h - 8); }
}

/* جولة: ثلاث علب، واحدة صحيحة واثنتان بأخطاء شائعة (مختلفة القيمة) */
function round(q, right, wrongs, hint, bad, data) {
  const key = ([n, d]) => n * 1000 / d, seen = new Set([key(right)]), W = [];
  wrongs.forEach(v => { const r = red(...v); if (r[1] > 0 && r[0] > 0 && !seen.has(key(r)) && W.length < 2) { seen.add(key(r)); W.push(r); } });
  for (let k = 2; W.length < 2; k++) { const r = red(right[0] + k, right[1] + 1); if (!seen.has(key(r))) { seen.add(key(r)); W.push(r); } }
  const opts = [right, ...W].sort(() => Math.random() - .5), ri = opts.indexOf(right);
  return { q, input: { type: 'pick', opts: opts.map(([n, d], k) => `${['🔴', '🔵', '🟢'][k]} ${fx(n, d)}`) }, ok: k => k === ri,
    hint, bad, good: 'أحسنت! حسبتَها في ذهنك.', data: { ...data, opts, right: ri, look: R(0, 4) } };
}

function make(i) {
  if (i === 0) { for (let t = 0; t < 60; t++) { const [a, b] = pf(2, 6), m = R(2, 3), [c] = pf(b * m, b * m), e = b * m; if (gcd(c, e) === 1) { const r = red(a * m + c, e);
    return round(`الزبون يريد ${fr(a, b)} كغ من حلوى الزعفران و${fr(c, e)} كغ من حلوى الهيل. ناوله العلبة التي فيها المجموع.`, r, [[a + c, b + e], [a + c, e], [a * c, b * e]], `في ذهنك: حوّل ${fr(a, b)} إلى أجزاء من ${N(e)}.`, () => 'اجمع بعد توحيد المقام: هل وحّدته؟', { expr: [[a, b], '+', [c, e]] }); } } }
  if (i === 1) { for (let t = 0; t < 60; t++) { const [a, b] = pf(2, 7), [c, e] = pf(2, 7); if (b !== e && a / b > c / e && lcm(b, e) <= 30) { const L = lcm(b, e), r = red(a * L / b - c * L / e, L);
    return round(`معه ${fr(a, b)} كغ، وأكل منها أطفاله ${fr(c, e)} كغ في الطريق. كم بقي؟ ناوله علبة بالباقي نفسه ليتذكّر!`, r, [[a - c, Math.abs(b - e) || 1], [a - c, L], [a * e - c * b + 1, L]], 'ما المقام المشترك الأصغر؟ ثم اطرح البسطين في ذهنك.', () => 'هل طرحتَ المقامين؟ وحّدهما أولاً.', { expr: [[a, b], '−', [c, e]] }); } } }
  if (i === 2) { const [a, b] = pf(2, 6), W = b * R(2, 6);
    return round(`طلبية لـ ${N(W)} ضيفاً، و${fr(a, b)} الضيوف يريدون حلوى بالمكسرات. كم ضيفاً منهم؟`, [W / b * a, 1], [[W * a, 1], [W / a | 0 || 1, 1], [W - a, 1]], 'اقسم على المقام ثم اضرب في البسط.', () => 'هل قسمتَ على المقام أولاً؟', { expr: [W, '×', [a, b]] }); }
  if (i === 3) { for (let t = 0; t < 60; t++) { const [a, b] = pf(2, 7), [c, e] = pf(2, 9); if (gcd(a, c) > 1 || gcd(b, e) > 1) { const r = red(a * e, b * c);
    return round(`عنده ${fr(a, b)} كغ، ويريد علباً كل منها ${fr(c, e)} كغ. كم علبة؟ (${fr(a, b)} ÷ ${fr(c, e)})`, r, [[a * c, b * e], [b * c, a * e]], 'في ذهنك: اقلب الكسر الثاني، واحذف قبل الضرب.', () => 'أي الكسرين قلبتَ؟', { expr: [[a, b], '÷', [c, e]] }); } } }
  // مسألة لفظية: كسران معلومان والباقي
  const ctx = R(0, 2), [a, b] = pf(2, 5), [c, e] = pf(3, 8), L = lcm(b, e), restN = L - a * L / b - c * L / e;
  if (restN <= 0) return make(4);
  const r = red(restN, L), T = [['في فريق السلة', 'من أمريكا', 'من أفريقيا', 'من آسيا', 'اللاعبين'], ['في علبة البسكويت', 'بالشوكولاتة', 'بالزبدة', 'بجوز الهند', 'البسكويت'], ['في صينية الحلوى', 'بالزعفران', 'بالتمر', 'بالورد', 'القطع']][ctx];
  return round(`${T[0]}: ${fr(a, b)} ${T[4]} ${T[1]}، و${fr(c, e)} ${T[2]}، والباقي ${T[3]}. ما الكسر الذي يمثل ${T[3]}؟`, r, [[1 * L - a - c, L], [a + c, b + e], red(a * L / b + c * L / e, L)],
    'اجمع الكسرين المعلومين أولاً… ثم كم يبقى من الواحد الصحيح؟', () => 'هل طرحتَ المجموع من الواحد الصحيح؟', { short: `${T[4]} ${T[3]}: ؟` });
}

function challenge() {
  const items = [], used = new Set(), fresh = f => { for (let k = 0; k < 60; k++) { const v = f(); const s = JSON.stringify(v); if (!used.has(s)) { used.add(s); return v; } } return f(); };
  { const b = fresh(() => R(3, 6)), e = b * 2; items.push(choice(`ذهنياً: ${fr(1, b)} + ${fr(1, e)} =`, fx(3, e), [fr(2, b + e), fr(1, b * e), fr(2, e)], `${fr(1, b)} = ؟/${N(e)}`, '8Nc2')); }
  { const [a, b] = fresh(() => pf(3, 8)), W = b * R(2, 9); items.push(num(`ذهنياً: ${fr(a, b)} × ${N(W)} =`, W / b * a, 'اقسم على المقام ثم اضرب في البسط.', '8Nc2')); }
  { const b = fresh(() => R(2, 9)), k = R(2, 4); items.push(num(`ذهنياً: ${fr(1, b)} ÷ ${fr(1, b * k)} =`, k, 'كم مرة يدخل الكسر الصغير في الكبير؟', '8Nc2')); }
  { const b = fresh(() => R(3, 9)); items.push(choice(`ذهنياً: ${fr(1, 2)} − ${fr(1, b)} =`, fx(b - 2, 2 * b), [fr(1, 2 + b), fr(1, 2 * b), fr(b - 1, 2 * b)], 'وحّد المقامين في ذهنك.', '8Nc2')); }
  { const [a, b] = fresh(() => pf(3, 6)), [c, e] = pf(3, 6); items.push(choice(`في السينما ${fr(a, b)} المشاهدين أطفال، و${fr(c, e)} الأطفال بنات. ما كسر البنات من كل المشاهدين؟`, fx(a * c, b * e), [fx(a * e + c * b, b * e), fr(a + c, b + e), fx(c, e)].filter(x => x !== fx(a * c, b * e)), '«كسر من كسر» يعني الضرب.', '8Nc2')); }
  items.push(tf(`${fr(3, 4)} + ${fr(3, 8)} = ${mx(1, 1, 8)} ذهنياً بتحويل ${fr(3, 4)} إلى ${fr(6, 8)}.`, true, 'حوّل ثم اجمع.', '8Nc2', '٦/٨ + ٣/٨ = ٩/٨ = ١ ١/٨.'));
  items.push(tf(`${fr(4, 5)} − ${fr(3, 4)} = ${fr(1, 20)}`, true, 'المقام المشترك ٢٠.', '8Nc2', '١٦/٢٠ − ١٥/٢٠ = ١/٢٠.'));
  items.push(tf(`${fr(2, 3)} × ${fr(6, 7)} = ${fr(12, 21)} وهو في أبسط صورة.`, false, 'هل يمكن الحذف بين ٦ و٣ قبل الضرب؟', '8Nc2', 'بالحذف: ٢/١ × ٢/٧ = ٤/٧.'));
  return items.sort(() => Math.random() - .5);
}

export default mission({
  title: 'دكّان الحلوى', icon: '🏪', who, rounds: 5, make, draw,
  intro: ['الدكّان مزدحم قبل العيد، والزبائن مستعجلون!', 'احسب طلب كل زبون في ذهنك، وناوله العلبة الصحيحة.'],
  outro: ['خدمتَ كل الزبائن بسرعة ودقة.', 'لنختبر الحساب الذهني بأسئلة متنوعة.'],
  challenge: { title: 'تحدي الكسور ذهنياً', make: challenge }
});
export { make, challenge };
