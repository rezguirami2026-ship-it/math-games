// ٤-٣ ضرب الكسور — «وصفة الجدة»: بطاقة الوصفة على الجدار تُضاعَف أو تُجزّأ بالكسور. الطالب يأخذ كسراً من كمية، ويختار العدد
// الذي يحذف به عاملاً مشتركاً قبل الضرب (تظهر الشطبات بعد التثبيت)، ويضرب كسرين وعددين كسريين، ويجد «كسراً من الباقي».
// التحدي: ٨ أسئلة من 8Nf2 (الكتاب ص٦٦–٦٨).
import { mission } from '../../mission.js';
import { N, R, fr, mx, fx, gcd, fOk, fBad, fEq } from '../../math.js';
import { choice, num, tf } from '../../../missions/challenge.js';
import { kitchen, fracC, mixC, valC, pot, say } from './art.js';

const who = { name: 'الطاهي سالم', face: '👨🏽‍🍳', id: 'salim' };
const pf = (b0, b1) => { for (let t = 0; t < 60; t++) { const b = R(b0, b1), a = R(1, b - 1); if (gcd(a, b) === 1) return [a, b]; } return [2, 3]; };
const red = (n, d) => { const g = gcd(n, d); return [n / g, d / g]; };

/* بطاقة الوصفة: ورقة معلّقة وعليها العملية من اليمين إلى اليسار */
function card(g, w, h) { g.save(); g.translate(w * .5, h * .06); g.rotate(-.01); g.fillStyle = '#FFFBEB'; g.fillRect(-w * .38, 0, w * .76, h * .5); g.strokeStyle = '#D97706'; g.lineWidth = 3; g.strokeRect(-w * .38, 0, w * .76, h * .5);
  g.fillStyle = '#DC2626'; g.beginPath(); g.arc(0, 6, 7, 0, 7); g.fill(); g.restore(); }
function strike(g, x, y, v, s) { g.strokeStyle = '#DC2626'; g.lineWidth = 3; g.beginPath(); g.moveTo(x - s * .45, y + s * .1); g.lineTo(x + s * .45, y - s * .7); g.stroke(); say(g, N(v), x + s * .55, y - s * .75, s * .6, '#DC2626'); }

function draw(g, w, h, t, S) {
  const r = S.r ? S.r.data : {}; kitchen(g, w, h, h * .72);
  pot(g, w * .14, h * .86, 40, 1, t);
  if (r.mode === 'sack') {   // كيس سكر وكسر منه
    card(g, w, h); say(g, `الوصفة: ${r.what}`, w * .5, h * .16, 16, '#92400E');
    fracC(g, r.a, r.b, w * .64, h * .3, 28, '#92400E'); say(g, '×', w * .5, h * .36, 26, '#1E2433'); say(g, `${N(r.W)} ${r.unit}`, w * .36, h * .37, 24, '#1E2433');
    g.fillStyle = '#F5F5F4'; g.beginPath(); g.moveTo(w * .7, h * .9); g.lineTo(w * .66, h * .64); g.quadraticCurveTo(w * .76, h * .58, w * .86, h * .64); g.lineTo(w * .82, h * .9); g.closePath(); g.fill(); g.strokeStyle = '#A8A29E'; g.lineWidth = 2; g.stroke();
    say(g, r.unit === 'كغ' ? 'سكر' : 'هيل', w * .76, h * .8, 16, '#57534E');
    if (S.done) valC(g, r.rn, r.rd, w * .5, h * .49, 22, '#15803D');
  } else if (r.mode === 'cancel' || r.mode === 'prod' || r.mode === 'mixed' || r.mode === 'rest') {
    card(g, w, h); say(g, r.title, w * .5, h * .14, 15, '#92400E');
    const s = 28, y = h * .32;
    if (r.mode === 'mixed') { mixC(g, r.W1, r.a, r.b, w * .66, y, s, '#1E2433'); say(g, '×', w * .5, y + 8, 26, '#1E2433'); mixC(g, r.W2, r.c, r.e, w * .34, y, s, '#1E2433'); }
    else {
      fracC(g, r.a, r.b, w * .64, y, s, '#1E2433'); say(g, '×', w * .5, y + 8, 26, '#1E2433'); fracC(g, r.c, r.e, w * .36, y, s, '#1E2433');
      const k = r.mode === 'cancel' ? r.tried : S.done ? 1 : 0;
      if (r.mode === 'cancel' && k > 1 && r.a % k === 0 && r.e % k === 0) { strike(g, w * .64, y, r.a / k, s); strike(g, w * .36, y + s * .92, r.e / k, s); }
      else if (r.mode === 'cancel' && k > 1) say(g, `${N(k)} لا يقسم العددين معاً`, w * .5, h * .5, 15, '#B91C1C');
      if (r.mode !== 'cancel' && S.done) { const g1 = gcd(r.a, r.e), g2 = gcd(r.c, r.b); if (g1 > 1) { strike(g, w * .64, y, r.a / g1, s); strike(g, w * .36, y + s * .92, r.e / g1, s); } if (g2 > 1) { strike(g, w * .36, y, r.c / g2, s); strike(g, w * .64, y + s * .92, r.b / g2, s); } }
    }
    if (S.done && r.rd) { say(g, '=', w * .2, y + 8, 26, '#15803D'); valC(g, r.rn, r.rd, w * .2 - 4, y + 60, 22, '#15803D'); }
  }
  if (S.pulse > 0) { g.strokeStyle = `rgba(34,197,94,${S.pulse})`; g.lineWidth = 6; g.strokeRect(4, 4, w - 8, h - 8); }
}

function make(i) {
  if (i === 0) { const [a, b] = pf(3, 9), W = R(0, 1) ? b * R(2, Math.min(8, Math.floor(48 / a))) : R(2, 9) * 2 + 1, [rn, rd] = red(W * a, b), kg = R(0, 1), what = kg ? 'السكر' : 'الهيل المطحون';
    return { q: `الوصفة الكبيرة تحتاج ${N(W)} ${kg ? 'كغ' : 'ملعقة'} من ${what}، والجدة تطبخ ${fr(a, b)} الوصفة فقط. كم ${kg ? 'كغ' : 'ملعقة'} تحتاج؟`,
      input: { type: 'frac', mixed: true }, ok: v => fOk(v, rn, rd), hint: `${fr(a, b)} من العدد تعني: اقسمه على المقام واضرب في البسط. هل يقبل العدد القسمة على المقام؟`,
      bad: v => fBad(v, rn, rd) || (fEq(v, W * b, a) ? 'هذه قسمة على الكسر لا ضرب فيه.' : ''), good: 'أحسنت! حذف العوامل المشتركة يجعل الضرب أسهل.', data: { mode: 'sack', a, b, W, unit: kg ? 'كغ' : 'ملعقة', what, rn, rd } }; }
  if (i === 1) {   // اختيار العدد الذي يُحذف به قبل الضرب
    for (let t = 0; t < 80; t++) { const k = R(2, 7), a = k * R(1, 4), e = k * R(2, 5), b = R(a + 1, a + 9), c = R(1, e - 1); if (gcd(a, e) === k && gcd(a, b) === 1 && gcd(c, e) === 1 && gcd(c, b) === 1 && a < b) {
      const D = { mode: 'cancel', a, b, c, e, k, title: 'قبل الضرب: احذف عاملاً مشتركاً' };
      return { q: `في ${fr(a, b)} × ${fr(c, e)}: بسط الكسر الأول ${N(a)} ومقام الثاني ${N(e)}. ما <b>أكبر</b> عدد تقسمهما عليه قبل الضرب؟`,
        input: { type: 'dial', min: 1, max: 12, start: 1 }, ok: v => { D.tried = v; return v === k; },
        hint: 'ما الأعداد التي تقسم الاثنين معاً؟ اختر أكبرها.', bad: v => v === 1 ? 'القسمة على ١ لا تحذف شيئاً.' : a % v === 0 && e % v === 0 ? 'يقسمهما فعلاً، لكن يوجد عدد أكبر.' : '',
        good: `أحسنت! ${N(a)} ÷ ${N(k)} = ${N(a / k)}، و${N(e)} ÷ ${N(k)} = ${N(e / k)}.`, data: D }; } }
  }
  if (i <= 2) {   // كسران مع حذف متقاطع
    for (let t = 0; t < 120; t++) { const [a, b] = pf(2, 12), [c, e] = pf(2, 16); if ((gcd(a, e) > 1 || gcd(c, b) > 1) && red(a * c, b * e)[1] <= 40) { const [rn, rd] = red(a * c, b * e);
      return { q: `حصة كل ضيف ${fr(c, e)} صحن، وأكل الضيف ${fr(a, b)} حصته. ما الكسر الذي أكله من الصحن؟ (${fr(a, b)} × ${fr(c, e)})`, input: { type: 'frac', mixed: true }, ok: v => fOk(v, rn, rd),
        hint: 'قبل الضرب: هل يوجد بسط ومقام (من الكسرين) لهما عامل مشترك؟ احذفه أولاً.', bad: v => fBad(v, rn, rd) || (fEq(v, a * e, b * c) ? 'هذه قسمة: في الضرب نضرب البسط في البسط والمقام في المقام.' : ''),
        good: 'أحسنت! الحذف قبل الضرب يعطي أبسط صورة مباشرة.', data: { mode: 'prod', a, b, c, e, rn, rd, title: 'نصيب الضيف' } }; } }
  }
  if (i === 3) { const [a, b] = pf(2, 6), [c, e] = pf(2, 6), W1 = R(1, 3), W2 = R(1, 3), [rn, rd] = red((W1 * b + a) * (W2 * e + c), b * e);
    return { q: `صينية الحلوى طولها ${mx(W1, a, b)} شبر، والجدة تريد صينية أطول ${mx(W2, c, e)} مرة. كم شبراً طول الصينية الجديدة؟ (${mx(W1, a, b)} × ${mx(W2, c, e)})`,
      input: { type: 'frac', mixed: true }, ok: v => fOk(v, rn, rd), hint: 'هل نضرب الأعداد الصحيحة وحدها والكسور وحدها؟ جرّب تحويل كل عدد كسري إلى كسر غير فعلي أولاً.',
      bad: v => fBad(v, rn, rd) || (fEq(v, W1 * W2 * b * e + a * c, b * e) ? 'ضربتَ الأجزاء منفصلة: حوّل العددين إلى كسرين غير فعليين ثم اضرب.' : ''), good: 'أحسنت! التحويل إلى كسور غير فعلية ثم الحذف ثم الضرب.', data: { mode: 'mixed', a, b, c, e, W1, W2, rn, rd, title: 'صينية أطول' } }; }
  // كسر من الباقي (طريقة فهد): أكل الضيوف p/q وأكل جابر c/e من الباقي
  for (let t = 0; t < 80; t++) { const [p, q] = pf(3, 10), [c, e] = pf(2, 8), a = q - p, b = q; if ((gcd(a, e) > 1 || gcd(c, b) > 1 || R(0, 2) === 0) && red(a * c, b * e)[1] <= 48) { const [rn, rd] = red(a * c, b * e);
    return { q: `أكل الضيوف ${fr(p, q)} الكعكة، ثم أكل جابر ${fr(c, e)} ما تبقّى منها. ما الكسر الذي أكله جابر من الكعكة كلها؟`, input: { type: 'frac', mixed: true }, ok: v => fOk(v, rn, rd),
      hint: 'كم بقي من الكعكة أولاً؟ ثم ما «كسر من الباقي»: جمع أم ضرب؟', bad: v => fBad(v, rn, rd) || (fEq(v, p * c, q * e) ? 'هذا كسر مما أكله الضيوف، لا من الباقي.' : ''),
      good: 'أحسنت! أوجدتَ الباقي ثم ضربته في الكسر.', data: { mode: 'rest', a, b, c, e, rn, rd, title: `الباقي ${N(a)} من ${N(b)}، وجابر أكل ${N(c)} من ${N(e)} منه` } }; } }
  return make(0);
}

function challenge() {
  const items = [], used = new Set(), fresh = f => { for (let k = 0; k < 60; k++) { const v = f(); const s = JSON.stringify(v); if (!used.has(s)) { used.add(s); return v; } } return f(); };
  { const [a, b] = fresh(() => pf(3, 9)), W = b * R(3, 12); items.push(num(`${fr(a, b)} × ${N(W)} =`, W / b * a, 'اقسم العدد على المقام أولاً ثم اضرب في البسط.', '8Nf2')); }
  { const [a, b] = fresh(() => pf(3, 9)), [c, e] = pf(3, 9), [rn, rd] = red(a * c, b * e), right = fx(rn, rd);
    items.push(choice(`${fr(a, b)} × ${fr(c, e)} =`, right, [fr(a + c, b + e), fr(a * e, b * c), fr(a * c, b + e)].filter(x => x !== right), 'البسط في البسط والمقام في المقام، مع الحذف أولاً.', '8Nf2')); }
  { const k = fresh(() => R(2, 6)), a = k * R(1, 3), e = k * R(2, 4); items.push(num(`في ${fr(a, a + 1)} × ${fr(1, e)}، ما أكبر عدد تحذفه من ${N(a)} و${N(e)}؟`, gcd(a, e), 'ما أكبر عدد يقسم الاثنين معاً؟', '8Nf2')); }
  { const W1 = fresh(() => R(1, 3)); items.push(num(`حوّل ${mx(W1, 1, 2)} إلى كسر غير فعلي مقامه ${N(2)}. ما بسطه؟`, W1 * 2 + 1, 'اضرب العدد الصحيح في المقام وأضف البسط.', '8Nf2')); }
  items.push(tf(`إذا ضربتُ كسراً في نفسه فالناتج دائماً أقل من الكسر الذي بدأتُ به.`, false, 'جرّب كسراً غير فعلي، مثل ٣/٢.', '8Nf2', 'مثال مناقض: ٣/٢ × ٣/٢ = ٩/٤ = ٢ ١/٤ وهو أكبر من ٣/٢.'));
  items.push(tf(`ضرب عدد في كسر فعلي يعطي ناتجاً أصغر من العدد.`, true, 'ماذا يعني أخذ جزء من العدد؟', '8Nf2', 'مثلاً ٢/٣ × ١٨ = ١٢ وهو أصغر من ١٨.'));
  { const [p, q] = fresh(() => pf(3, 8)), [rn, rd] = red((q - p) * 1, q * 2); items.push(choice(`أكلنا ${fr(p, q)} الفطيرة، ثم أكل أخي نصف الباقي. ما الكسر الذي أكله أخي من الفطيرة؟`, fr(rn, rd), [fr(p, q * 2), fr(q - p, q), fr(1, 2)].filter(x => x !== fr(rn, rd)), 'الباقي أولاً، ثم نصفه.', '8Nf2')); }
  { items.push(choice('لحساب ٢/٧ × ١٤/١٥ بسهولة، نبدأ بـ:', 'قسمة ١٤ و٧ على ٧', ['ضرب ٢ في ١٤ أولاً', 'جمع البسطين', 'قلب الكسر الثاني'], 'أي بسط ومقام لهما عامل مشترك؟', '8Nf2')); }
  return items.sort(() => Math.random() - .5);
}

export default mission({
  title: 'وصفة الجدة', icon: '🥄', who, rounds: 5, make, draw,
  intro: ['وصفة الجدة للحلوى العُمانية مكتوبة لقِدر كبير جداً.', 'نحتاج أجزاء منها بالكسور… والحيلة: احذف العوامل المشتركة قبل أن تضرب!'],
  outro: ['ممتاز! قِدر الحلوى يغلي بالمقادير الصحيحة.', 'لنختبر ضرب الكسور بأسئلة متنوعة.'],
  challenge: { title: 'تحدي ضرب الكسور', make: challenge }
});
export { make, challenge };
