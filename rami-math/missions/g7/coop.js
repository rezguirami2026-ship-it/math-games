// الصف السابع — سوق الكسور والاحتمالات (الوحدة ١١ في كتاب الفصل الثاني: الكسور ٢، والوحدة ١٢: الاحتمالات).
// تسع محطات بين أكشاك الجمعية: ميزان البهارات، وكوبونات الجمعية، وصناديق العصير، وتقطيع الكعك، ووصفات الجمعية،
// ثم مقياس الحظ (مؤشر من ٠ إلى ١) وعجلة الجوائز وسحب الكرات وتجربة المكعب. الجولات من missions/g7/kit.js.
import { ar } from '../../core/util.js';
import { dec } from '../bench.js';
import { mission, R, shuf, opts } from './kit.js';
import { spinner, COLOR_NAMES } from '../../content/chData.js';
import { fr, frs, mx } from '../../content/g7/challenges4.js';
import { WORDS, likeWord } from '../../content/g7/challenges7.js';

/* المحطات: خمس من أماكن محطات الخامس، وأربع جديدة (فُحصت بالتصادم) */
export const ST7C = {
  spices: { x: 1210, y: 3620 },     // جمال: ميزان البهارات
  coupons: { x: 950, y: 3620 },   // سعود: كوبونات الجمعية
  juice: { x: 690, y: 3620 },      // لطيفة: صناديق العصير
  cakes: { x: 430, y: 3620 },      // لطيفة: تقطيع الكعك
  recipes: { x: 1470, y: 3620 },    // حصة: وصفات الجمعية
  luck: { x: 1150, y: 4290 },      // رقية: مقياس الحظ
  prizes: { x: 800, y: 4250 },    // حصة: عجلة الجوائز
  balls: { x: 424, y: 4198 },     // سعود: سحب الكرات
  dice: { x: 1700, y: 4250 }       // رقية: تجربة المكعب
};
const N = ar, D = dec;
const big = s => `<div class="g7big">${s}</div>`;
const svg = s => `<div class="g7svg">${s}</div>`;
const gcd = (a, b) => b ? gcd(b, a % b) : a, lcm = (a, b) => a * b / gcd(a, b);
const PAIRS = [[2, 3], [3, 4], [2, 5], [4, 6], [3, 5], [4, 5], [3, 8], [2, 6], [5, 6]];

/* ═══ ١١-١ جمع الكسور والأعداد الكسرية وطرحها — «ميزان البهارات» ═══ */
export const addSubFrac7b = mission({
  id: 'addSubFrac7b', giver: 'jamal', st: ST7C.spices, key: 'spices', label: '🌶️ ميزان البهارات', icon: '🌶️', bg: '#B0476A', side: 1,
  intro: n => [{ who: 'jamal', text: `أهلاً يا ${n}! أخلط البهارات بأعداد كسرية من الكيلوغرامات، والزبائن ينتظرون.` },
    { who: 'jamal', text: 'اجمع الأعداد الكاملة معاً، والكسور معاً بعد توحيد مقاماتها؛ وفي الطرح قد نستلف واحداً.' }],
  goal: '🌶️ زِن خلطات بهارات جمال', end: 'الخلطات موزونة بدقة! الكاملة مع الكاملة، والكسور بمقام مشترك.',
  make() {
    const [b, d] = shuf(PAIRS)[0], a = R(1, b - 1), c = R(1, d - 1), w1 = R(1, 4), w2 = R(1, 3), L = lcm(b, d), n = (w1 + w2) * L + a * L / b + c * L / d;
    const e = shuf([4, 6, 8])[0], v1 = R(3, 6), v2 = R(1, 2), p = R(1, e - 2), q = R(p + 1, e - 1), m = (v1 * e + p) - (v2 * e + q);
    const [g, h] = shuf(PAIRS)[0], x = R(1, g - 1), y = R(1, h - 1), M = lcm(g, h);
    return [{ t: 'pick', a, b, c, d, w1, w2, opts: opts(mx(n, L), [mx(n + L, L), `${N(w1 + w2)} و${fr(a + c, b + d)}`, mx(n - 1, L), mx(n + 1, L)]), ans: mx(n, L) },
      { t: 'pick', e, v1, v2, p, q, opts: opts(mx(m, e), [mx(m + e, e), `${N(v1 - v2)} و${fr(q - p, e)}`, mx(m + 1, e), mx(m - 1, e)]), ans: mx(m, e) },
      { t: 'kp', g, h, x, y, M, ans: x * M / g + y * M / h, dot: false }];
  },
  view(r) {
    if (r.w1) return { text: `خلطة فيها ${N(r.w1)} و${fr(r.a, r.b)} كغم كمون و${N(r.w2)} و${fr(r.c, r.d)} كغم كزبرة. كم كيلوغراماً الخلطة؟`, visual: big(`${N(r.w1)} و${fr(r.a, r.b)} + ${N(r.w2)} و${fr(r.c, r.d)}`), hint: `اجمع الكاملين، ثم الكسرين بعد تحويلهما إلى المقام ${N(lcm(r.b, r.d))}.` };
    if (r.v1) return { text: `في الكيس ${N(r.v1)} و${fr(r.p, r.e)} كغم فلفل، باع جمال ${N(r.v2)} و${fr(r.q, r.e)} كغم. كم بقي؟`, visual: big(`${N(r.v1)} و${fr(r.p, r.e)} − ${N(r.v2)} و${fr(r.q, r.e)}`), hint: `${fr(r.p, r.e)} أصغر من ${fr(r.q, r.e)}: استلف ١ = ${fr(r.e, r.e)} من العدد الكامل ثم اطرح.` };
    return { text: `ملعقة بهار وزنها ${fr(r.x, r.g)} أوقية وأخرى ${fr(r.y, r.h)} أوقية. اكتب المجموع بالمقام ${N(r.M)}:`, visual: big(`${fr(r.x, r.g)} + ${fr(r.y, r.h)} = ${fr('؟', r.M)}`), hint: `حوّل كل كسر إلى المقام ${N(r.M)}، ثم اجمع البسطين.`, bad: v => v === r.x + r.y ? 'جمعتَ البسطين قبل توحيد المقامين.' : null };
  }
});

/* ═══ ١١-٢ استخدام الكسور مع الكميات — «كوبونات الجمعية» ═══ */
export const fracQty7b = mission({
  id: 'fracQty7b', giver: 'saud', st: ST7C.coupons, key: 'coupons', label: '🎟️ كوبونات الجمعية', icon: '🎟️', bg: '#2E8B57', side: 1,
  intro: n => [{ who: 'saud', text: `يا ${n}! الجمعية توزّع كوبونات وقماشاً وحبالاً بكسور من الكميات.` },
    { who: 'saud', text: 'كسر الكمية: اضرب في البسط واقسم على المقام، والناتج قد يكون عدداً كسرياً.' }],
  goal: '🎟️ احسب كوبونات سعود', end: 'كل زبون أخذ حصته! كسر الكمية قد يكون عدداً كاملاً أو كسرياً.',
  make() {
    const d = shuf([3, 4, 5, 8])[0], n = R(1, d - 1); let Q = R(5, 13); if ((Q * n) % d === 0) Q++;
    const d2 = R(3, 9), n2 = R(1, d2 - 1), Q2 = d2 * R(3, 12), [a, b] = shuf([[3, 4], [1, 4], [2, 5], [3, 5], [1, 8], [3, 8]])[0], k = R(1, 3);
    return [{ t: 'kp', n: n2, d: d2, Q: Q2, ans: Q2 / d2 * n2, dot: false }, { t: 'pick', n, d, Q, opts: opts(mx(Q * n, d), [mx(Q * d, n), mx(Q, d), mx(Q * n + 1, d), mx(Q * n, d + 1)]), ans: mx(Q * n, d) }, { t: 'kp', a, b, k, ans: k * 1000 * a / b, dot: false }];
  },
  view(r) {
    if (r.k) return { text: `كوبون: ${fr(r.a, r.b)} من <b>${N(r.k)}</b> كغم من الأرز مجاناً. كم غراماً؟`, visual: big(`${fr(r.a, r.b)} × ${N(r.k * 1000)} غم`), hint: 'حوّل الكيلوغرامات إلى غرامات (× ١٠٠٠)، ثم خذ الكسر.' };
    if (r.t === 'kp') return { text: `في الجمعية <b>${N(r.Q)}</b> كوبوناً، و${fr(r.n, r.d)} منها لكبار السن. كم كوبوناً لهم؟`, visual: big(`${fr(r.n, r.d)} من ${N(r.Q)}`), hint: 'اقسم على المقام، ثم اضرب في البسط.', bad: v => v === r.Q / r.d ? `هذا ${fr(1, r.d)} فقط: اضرب في البسط.` : null };
    return { text: `لفّة قماش طولها <b>${N(r.Q)}</b> أمتار، تبيع الجمعية ${fr(r.n, r.d)} منها. كم متراً؟`, visual: big(`${fr(r.n, r.d)} من ${N(r.Q)}`), hint: 'اضرب الكمية في البسط، ثم اقسم على المقام واكتب الباقي كسراً.' };
  }
});

/* ═══ ١١-٣ ضرب عدد صحيح في كسر — «صناديق العصير» ═══ */
export const wholeTimesFrac7 = mission({
  id: 'wholeTimesFrac7', giver: 'latifa', st: ST7C.juice, key: 'juice', label: '🧃 صناديق العصير', icon: '🧃', bg: '#F28C28', side: -1,
  intro: n => [{ who: 'latifa', text: `أهلاً يا ${n}! في كل صندوق كسر من لتر العصير، وعندي صناديق كثيرة.` },
    { who: 'latifa', text: 'عدد × كسر: اضرب العدد في البسط واحتفظ بالمقام، ثم حوّل إلى عدد كسري أو كامل.' }],
  goal: '🧃 احسب عصير لطيفة', end: 'العصير محسوب! العدد يُضرب في البسط، والمقام يبقى.',
  make() {
    const d = shuf([3, 4, 5, 6, 8])[0], n = R(1, d - 1); let k = R(2, 9); if ((k * n) % d === 0) k++;
    const d2 = R(3, 6), n2 = R(1, d2 - 1), k2 = d2 * R(2, 5), d3 = shuf([3, 4, 5])[0], n3 = R(1, d3 - 1), k3 = R(3, 9);
    return [{ t: 'kp', n: n3, d: d3, k: k3, ans: k3 * n3, dot: false }, { t: 'pick', n, d, k, opts: opts(mx(k * n, d), [mx(k * d, n), mx(k + n, d), fr(k * n, k * d), mx(k * n + 1, d)]), ans: mx(k * n, d) }, { t: 'kp', n: n2, d: d2, k: k2, ans: k2 * n2 / d2, dot: false, whole: 1 }];
  },
  view(r) {
    if (r.whole) return { text: `${N(r.k)} صندوقاً، في كل منها ${fr(r.n, r.d)} لتر. كم لتراً كاملاً العصير كله؟`, visual: big(`${N(r.k)} × ${fr(r.n, r.d)}`), hint: 'اضرب العدد في البسط ثم اقسم على المقام.' };
    if (r.opts) return { text: `${N(r.k)} صناديق، في كل منها ${fr(r.n, r.d)} لتر. كم لتراً العصير كله (عدداً كسرياً)؟`, visual: big(`${N(r.k)} × ${fr(r.n, r.d)}`), hint: 'اضرب في البسط والمقام يبقى، ثم حوّل الكسر غير الاعتيادي إلى عدد كسري.' };
    return { text: `${N(r.k)} صناديق، في كل منها ${fr(r.n, r.d)} لتر. اكتب الكمية كلها كسراً بالمقام ${N(r.d)}:`, visual: big(`${N(r.k)} × ${fr(r.n, r.d)} = ${fr('؟', r.d)}`), hint: 'العدد × البسط، والمقام يبقى كما هو.', bad: v => v === r.k * r.d ? 'ضربتَ في المقام: الضرب في البسط فقط.' : null };
  }
});

/* ═══ ١١-٤ قسمة عدد صحيح على كسر — «تقطيع الكعك» ═══ */
export const wholeDivFrac7 = mission({
  id: 'wholeDivFrac7', giver: 'latifa', st: ST7C.cakes, key: 'cakes', label: '🎂 تقطيع الكعك', icon: '🎂', bg: '#E85D75', side: 1,
  intro: n => [{ who: 'latifa', text: `يا ${n}! أقطّع الكعك قطعاً متساوية، وكل قطعة كسر من كعكة.` },
    { who: 'latifa', text: 'كم قطعة؟ قسمة عدد صحيح على كسر: اقلب الكسر واضرب.' }],
  goal: '🎂 قطّع كعك لطيفة', end: 'الكعك مقطّع بالتساوي! القسمة على كسر = الضرب في مقلوبه.',
  make() {
    const k = R(2, 9), d = R(2, 8), d2 = R(3, 9), n2 = R(2, d2 - 1), k2 = n2 * R(2, 6), [n3, d3] = shuf([[2, 3], [3, 4], [2, 5], [3, 5], [4, 5], [3, 8]])[0]; let k3 = R(2, 9); if ((k3 * d3) % n3 === 0) k3++;
    return [{ t: 'kp', k, d, ans: k * d, dot: false }, { t: 'kp', k: k2, n: n2, d: d2, ans: k2 * d2 / n2, dot: false }, { t: 'pick', k: k3, n: n3, d: d3, opts: opts(mx(k3 * d3, n3), [mx(k3 * n3, d3), mx(k3 * d3, n3 + 1), fr(n3, k3 * d3), mx(k3 * d3 + 1, n3)]), ans: mx(k3 * d3, n3) }];
  },
  view(r) {
    if (!r.n) return { text: `عند لطيفة <b>${N(r.k)}</b> كعكات، تقطع كل كعكة قطعاً حجم كل منها ${fr(1, r.d)} كعكة. كم قطعة؟`, visual: big(`${N(r.k)} ÷ ${fr(1, r.d)}`), hint: `في كل كعكة ${N(r.d)} قطع.`, bad: v => v === r.k + r.d ? 'جمعتَ: في كل كعكة ' + N(r.d) + ' قطع، والكعكات ' + N(r.k) + '.' : null };
    if (r.opts) return { text: `<b>${N(r.k)}</b> كعكات، والحصة ${fr(r.n, r.d)} كعكة. كم حصة (عدداً كسرياً)؟`, visual: big(`${N(r.k)} ÷ ${fr(r.n, r.d)}`), hint: 'اقلب الكسر واضرب، ثم حوّل إلى عدد كسري.' };
    return { text: `<b>${N(r.k)}</b> كعكات، وحصة كل ضيف ${fr(r.n, r.d)} كعكة. كم ضيفاً يأخذ حصته؟`, visual: big(`${N(r.k)} ÷ ${fr(r.n, r.d)} = ${N(r.k)} × ${fr(r.d, r.n)}`), hint: 'اقلب الكسر واضرب: العدد × المقام ÷ البسط.', bad: v => v === r.k * r.n / r.d ? 'ضربتَ في الكسر نفسه: اقلبه أولاً.' : null };
  }
});

/* ═══ ١١-٥ ضرب الكسور وقسمتها — «وصفات الجمعية» ═══ */
export const mulDivFrac7 = mission({
  id: 'mulDivFrac7', giver: 'hessa', st: ST7C.recipes, key: 'recipes', label: '📜 وصفات الجمعية', icon: '📜', bg: '#7B3F98', side: 1,
  intro: n => [{ who: 'hessa', text: `يا ${n}! وصفات الجمعية مكتوبة بالكسور، ونريد نصفها أو ثلثها، أو نعرف كم مرة يتسع الكوب.` },
    { who: 'hessa', text: 'ضرب كسرين: البسط × البسط والمقام × المقام. وقسمتهما: اقلب الثاني واضرب.' }],
  goal: '📜 عدّل وصفات حصة', end: 'الوصفات مضبوطة! «من» تعني الضرب، والقسمة على كسر تعني الضرب في مقلوبه.',
  make() {
    const [a, b] = shuf([[1, 2], [2, 3], [3, 4], [1, 3], [3, 5]])[0], k = shuf([2, 3, 4])[0], [c, d] = shuf([[1, 4], [3, 4], [2, 3], [4, 5], [5, 6]])[0], [e, g] = shuf([[1, 2], [3, 4], [2, 3], [5, 6]])[0], [h, i] = shuf([[1, 4], [1, 3], [1, 6], [1, 8]])[0];
    return [{ t: 'pick', a, b, k, opts: opts(frs(a, b * k), [fr(a, b + k), frs(a * k, b), fr(1, b * k + 1), fr(a, b)]), ans: frs(a, b * k) },
      { t: 'pick', c, d, a: e, b: g, opts: opts(frs(e * c, g * d), [fr(e + c, g + d), frs(e * d, g * c), fr(e * c, g + d)]), ans: frs(e * c, g * d), mul: 1 },
      { t: 'pick', e, g, h, i, opts: opts(mx(e * i, g * h), [frs(e * h, g * i), mx(g * h, e * i), mx(e * i + 1, g * h)]), ans: mx(e * i, g * h) }];
  },
  view(r) {
    if (r.k) return { text: `وصفة الهريس تحتاج ${fr(r.a, r.b)} كوب سمن. تريد حصة ${fr(1, r.k)} الوصفة. كم كوباً من السمن؟`, visual: big(`${fr(1, r.k)} × ${fr(r.a, r.b)}`), hint: '«من» تعني الضرب: البسط × البسط والمقام × المقام.' };
    if (r.mul) return { text: `في الكيس ${fr(r.c, r.d)} كغم سكر، والوصفة تأخذ ${fr(r.a, r.b)} ما في الكيس. كم كيلوغراماً؟`, visual: big(`${fr(r.a, r.b)} × ${fr(r.c, r.d)}`), hint: 'اضرب البسطين والمقامين، ثم بسّط.' };
    return { text: `في الإبريق ${fr(r.e, r.g)} لتر حليب، وكل فنجان ${fr(r.h, r.i)} لتر. كم فنجاناً تملأ؟`, visual: big(`${fr(r.e, r.g)} ÷ ${fr(r.h, r.i)}`), hint: 'اقلب الكسر الثاني ثم اضرب.' };
  }
});

/* ═══ ١٢-١ مقياس الاحتمال — «مقياس الحظ» (مؤشر من ٠ إلى ١) ═══ */
const scale = v => `<div class="g7scale"><div class="bar">${[0, .25, .5, .75, 1].map(t => `<i style="left:${t * 100}%"></i>`).join('')}<b style="left:${v * 100}%">▼</b></div><div class="lab"><span>مستحيل ٠</span><span>متساوي ٠٫٥</span><span>مؤكد ١</span></div></div>`;
export const probScale7 = mission({
  id: 'probScale7', giver: 'ruqaya', st: ST7C.luck, key: 'luck', label: '🎯 مقياس الحظ', icon: '🎯', bg: '#E2475C', side: 1,
  intro: n => [{ who: 'ruqaya', text: `أهلاً يا ${n}! في كشك الحظ صناديق كرات، ونضع لكل سحبة سهماً على مقياس الاحتمال.` },
    { who: 'ruqaya', text: 'المستحيل ٠ والمؤكد ١، وبينهما: غير مرجّح، ومتساوي الفرص ٠٫٥، ومرجّح.' }],
  goal: '🎯 ضع أسهم مقياس رقية', end: 'المقياس صحيح! كل احتمال عدد من ٠ إلى ١.',
  make() {
    const n = 10, k = shuf([0, 2, 3, 4, 6, 7, 8, 10])[0], k2 = R(1, 9), w = likeWord(k, n);
    return [{ t: 'pick', n, k, opts: WORDS.slice(), ans: w }, { t: 'dial', k: k2, s: k2 === 5 ? 0 : .5, st: [.1], lo: 0, hi: 1, ans: k2 / 10 },
      { t: 'pick', team: 1, opts: ['الفريق الأول', 'الفريق الثاني'], ans: 'الفريق الثاني' }];
  },
  view(r, d) {
    if (r.team) return { text: 'احتمال فوز الفريق الأول <b>٢٥٪</b>، واحتمال فوز الفريق الثاني <b>٢/٣</b>. أي الفريقين أرجح للفوز؟', visual: scale(.25) + scale(2 / 3), hint: '٢٥٪ = ٠٫٢٥، و٢/٣ ≈ ٠٫٦٧: أيهما أقرب إلى ١؟' };
    if (r.t === 'dial') return { text: `في الصندوق ١٠ كرات، منها <b>${N(r.k)}</b> حمراء. حرّك السهم إلى احتمال سحب كرة حمراء.`, visual: scale(d.k / 1000), label: '🎯 ثبّت السهم', hint: 'الاحتمال = الحمراء ÷ كل الكرات.' };
    return { text: `في الصندوق <b>${N(r.n)}</b> كرات، منها <b>${N(r.k)}</b> حمراء. صِف فرصة سحب كرة حمراء:`, visual: big('🔴'.repeat(Math.min(r.k, 10)) + '⚪'.repeat(r.n - r.k)), hint: 'قارن عدد الحمراء بنصف عدد الكرات: صفر مستحيل، والكل مؤكد.' };
  }
});

/* ═══ ١٢-٢ نتائج الاحتمالات — «عجلة الجوائز» ═══ */
export const outcomes7 = mission({
  id: 'outcomes7', giver: 'hessa', st: ST7C.prizes, key: 'prizes', label: '🎡 عجلة الجوائز', icon: '🎡', bg: '#C98A3A', side: 1,
  intro: n => [{ who: 'hessa', text: `يا ${n}! عجلة الجوائز مقسّمة أجزاءً متساوية، وأريد أن أعرف فرصة كل جائزة.` },
    { who: 'hessa', text: 'حين تتساوى الفرص: الاحتمال = عدد النتائج المطلوبة ÷ عدد كل النتائج.' }],
  goal: '🎡 احسب فرص عجلة حصة', end: 'العجلة عادلة! عُدّ النتائج المطلوبة واقسم على كل النتائج.',
  make() {
    const n = R(5, 8), k = R(1, n - 2), ci = R(0, 4), E = shuf([['عدد زوجي', 3], ['عدد أكبر من ٤', 2], ['عدد أولي', 3], ['عدد أقل من ٣', 2]])[0], m = R(2, 5);
    return [{ t: 'pick', n, k, ci, opts: opts(frs(k, n), [fr(k, n - k), frs(n - k, n), fr(1, k), fr(k, n + 1)]), ans: frs(k, n) }, { t: 'pick', E, opts: opts(frs(E[1], 6), [fr(E[1], 5), frs(6 - E[1], 6), fr(E[1] + 1, 6)]), ans: frs(E[1], 6) }, { t: 'kp', m, ans: 2 * m, dot: false }];
  },
  view(r) {
    if (r.ci != null) { const c = COLOR_NAMES[r.ci], o = COLOR_NAMES[(r.ci + 1) % 5];
      return { text: `العجلة ${N(r.n)} أجزاء متساوية. ما احتمال أن تقف على <b>${c[0]}</b> (جائزة كبرى)؟`, visual: svg(spinner([[c[0], r.k, c[1]], [o[0], r.n - r.k, o[1]]])), hint: 'عُدّ الأجزاء بهذا اللون، واقسم على كل الأجزاء.' }; }
    if (r.E) return { text: `في لعبة النرد: من يرمي <b>${r.E[0]}</b> يفوز. ما احتمال الفوز؟`, visual: big('🎲'), hint: 'اكتب نتائج النرد الست، وعُدّ ما يحقق الشرط منها.' };
    return { text: `عجلة صغيرة فيها <b>${N(r.m)}</b> ألوان، ومعها قطعة نقود. كم نتيجة ممكنة حين ندير العجلة ونرمي القطعة؟`, visual: big('🎡 + 🪙'), hint: 'كل لون مع «صورة»، وكل لون مع «كتابة»: ارسم جدولاً.', bad: v => v === r.m + 2 ? 'جمعتَ: كل لون يمكن أن يأتي مع وجهَي القطعة كليهما.' : null };
  }
});

/* ═══ ١٢-٣ الأحداث المتنافية — «سحب الكرات» ═══ */
const EXC = [['كرة حمراء', 'كرة زرقاء', 1], ['حلوى بنكهة الليمون', 'حلوى صفراء', 0], ['ورقة من فئة ٥ ريالات', 'ورقة من فئة ٢٠ ريالاً أو أكثر', 1], ['ورقة من فئة ٥ ريالات', 'ورقة من فئة ١٠ ريالات أو أقل', 0], ['عدد زوجي على النرد', 'عدد أكبر من ٤ على النرد', 0], ['العدد ١ على النرد', 'عدد زوجي على النرد', 1]];
export const exclusive7 = mission({
  id: 'exclusive7', giver: 'saud', st: ST7C.balls, key: 'balls', label: '🎱 سحب الكرات', icon: '🎱', bg: '#1F4E79', side: -1,
  intro: n => [{ who: 'saud', text: `يا ${n}! في مسابقة الجمعية نسحب كرة أو ورقة واحدة، ولكل سحبة أحداث ممكنة.` },
    { who: 'saud', text: 'الحدثان المتنافيان لا يمكن أن يحدثا معاً في السحبة نفسها.' }],
  goal: '🎱 أدر مسابقة سحب سعود', end: 'المسابقة عادلة! المتنافيان لا تجمعهما نتيجة واحدة.',
  make() {
    const [x, y, ex] = shuf(EXC)[0], a = R(2, 6), b = R(2, 6), c = R(2, 5), T = a + b + c, all = ['أحمر', 'أزرق', 'أصفر'], L = shuf([...all, 'أخضر', 'أبيض']);
    return [{ t: 'pick', x, y, col: 1, opts: ['متنافيان: لا يحدثان معاً', 'غير متنافيين: يمكن أن يحدثا معاً'], ans: ex ? 'متنافيان: لا يحدثان معاً' : 'غير متنافيين: يمكن أن يحدثا معاً' },
      { t: 'multi', opts: L, ok: all }, { t: 'pick', a, b, c, opts: opts(frs(a, T), [fr(a, b + c), frs(b + c, T), fr(a, T + 1)]), ans: frs(a, T) }];
  },
  view(r) {
    if (r.x) return { text: `نسحب مرة واحدة: «<b>${r.x}</b>» و«<b>${r.y}</b>». هل الحدثان متنافيان؟`, visual: big('🤔'), hint: 'ابحث عن نتيجة واحدة تحقق الحدثين معاً: إن وُجدت فهما غير متنافيين.' };
    if (r.ok) return { text: 'في الكيس كرات حمراء وزرقاء وصفراء فقط. اختر كل النتائج الممكنة لسحبة واحدة:', visual: big('🔴🔵🟡'), hint: 'النتائج الممكنة هي ألوان الكرات الموجودة في الكيس فقط.', bad: g => g.length < 3 ? 'بقي لون موجود في الكيس لم تختره.' : null };
    return { text: `في الكيس ${N(r.a)} كرات حمراء و${N(r.b)} زرقاء و${N(r.c)} صفراء. ما احتمال سحب كرة حمراء؟`, visual: big('🔴'.repeat(r.a) + '🔵'.repeat(r.b) + '🟡'.repeat(r.c)), hint: 'عدد الحمراء ÷ عدد كل الكرات.' };
  }
});

/* ═══ ١٢-٤ تقدير الاحتمال — «تجربة المكعب» ═══ */
export const estimateProb7 = mission({
  id: 'estimateProb7', giver: 'ruqaya', st: ST7C.dice, key: 'dice', label: '🎲 تجربة المكعب', icon: '🎲', bg: '#5E6B78', side: -1,
  intro: n => [{ who: 'ruqaya', text: `يا ${n}! رمينا مكعب الأرقام مرات كثيرة وسجّلنا النتائج.` },
    { who: 'ruqaya', text: 'الاحتمال التجريبي = عدد مرات الحدث ÷ عدد المحاولات، ويقترب من النظري كلما كثرت المحاولات.' }],
  goal: '🎲 حلّل تجربة رقية', end: 'التجربة اكتملت! الاحتمال التجريبي تقدير، والمحاولات الكثيرة تقرّبه من النظري.',
  make() {
    const n = shuf([20, 25, 40, 50])[0], k = R(2, n - 2), m = shuf([60, 120, 300, 600])[0];
    return [{ t: 'pick', n, k, opts: opts(frs(k, n), [fr(n, k), frs(n - k, n), fr(k, n + k)]), ans: frs(k, n) }, { t: 'kp', m, ans: m / 6, dot: false },
      { t: 'pick', best: 1, opts: ['رمي المكعب ٢٠٠ مرة', 'رمي المكعب ٥ مرات', 'رمي المكعب مرة واحدة'], ans: 'رمي المكعب ٢٠٠ مرة' }];
  },
  view(r) {
    if (r.best) return { text: 'أي تجربة تعطي أفضل تقدير لاحتمال ظهور ٦؟', visual: big('🎲🎲🎲'), hint: 'المحاولات القليلة تتأثر بالصدفة كثيراً.' };
    if (r.m) return { text: `المكعب منتظم، ونريد رميه <b>${N(r.m)}</b> مرة. كم مرة نتوقع ظهور العدد ٦؟`, visual: big(`${fr(1, 6)} × ${N(r.m)}`), hint: 'الاحتمال النظري لكل وجه ١/٦: اضرب في عدد الرميات.' };
    return { text: `رُمي المكعب <b>${N(r.n)}</b> مرة، فظهر العدد ٦ <b>${N(r.k)}</b> مرة. ما الاحتمال التجريبي لظهور ٦؟`, visual: big('🎲 ⟵ ٦'), hint: 'عدد مرات ظهور ٦ ÷ عدد الرميات كلها، ثم بسّط.' };
  }
});

export const G7U7 = { addSubFrac7b, fracQty7b, wholeTimesFrac7, wholeDivFrac7, mulDivFrac7, probScale7, outcomes7, exclusive7, estimateProb7 };
