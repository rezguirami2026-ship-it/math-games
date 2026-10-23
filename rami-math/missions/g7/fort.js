// الصف السابع — حصن الزوايا (الوحدة ٥ في الكتاب: الزوايا، والوحدة ٦: الكسور ١).
// اثنتا عشرة محطة بين الأسوار: أبراج الرماية، ومنجنيق يُرفع ذراعه على المنقلة، وبوابة الزوايا، وجسر الحبال المتوازية،
// ثم الكسور في حياة الحصن: الخرائط والمؤونة والأرغفة وخليط الطين والمخزن وساعة الرمل والسلّم وخيام الحرس.
import { ar } from '../../core/util.js';
import { dec } from '../bench.js';
import { mission, R, shuf, opts } from './kit.js';
import { ang, parallel, deg, sectVal } from '../../content/g7/geo7.js';
import { triangle, fan, protractor } from '../../content/chGeo.js';
import { fr, frs, mx } from '../../content/g7/challenges4.js';

/* المحطات: خمس من أماكن محطات الخامس، وسبع جديدة في الساحة الشرقية بين القلعة وسور المهرجان (فُحصت بالتصادم واللقطات: غرب الحصن مزدحم بالمباني) */
export const ST7F = {
  towers: { x: 292, y: 1870 },    // حمدان: أبراج الرماية
  bridge: { x: 1610, y: 2220 },    // حمدان: جسر الحبال
  ladder: { x: 1550, y: 2470 },    // حمدان: سلّم الأسوار
  gate: { x: 440, y: 2148 },      // منى: بوابة الزوايا
  clay: { x: 1850, y: 2200 },      // منى: خليط الطين
  maps: { x: 560, y: 2235 },      // زيد: خرائط الأقسام
  store: { x: 1850, y: 2450 },     // زيد: مخزن القلعة
  rations: { x: 2150, y: 2480 },   // عائشة: حصص المؤونة
  loaves: { x: 2150, y: 2270 },   // عائشة: أرغفة الحرس
  sand: { x: 1210, y: 2250 },     // فهد: ساعة الرمل
  catapult: { x: 2450, y: 2300 }, // فهد: منجنيق القلعة
  tents: { x: 2450, y: 2540 }     // فهد: خيام الحرس
};
const N = ar, D = dec;
const ltr = s => `<span class="ltr" dir="ltr">${s}</span>`;
const svg = s => `<div class="g7svg">${s}</div>`;
const big = s => `<div class="g7big">${s}</div>`;
const gcd = (a, b) => b ? gcd(b, a % b) : a, lcm = (a, b) => a * b / gcd(a, b);
const LET = ['أ', 'ب', 'ج', 'د', 'هـ', 'س', 'ص', 'ع', 'ل', 'م'];
const KIND = t => t < 90 ? 'حادة' : t === 90 ? 'قائمة' : t < 180 ? 'منفرجة' : 'منعكسة';
const two = () => { for (let t = 0; t < 40; t++) { const b = R(3, 10), d = R(3, 10), a = R(1, b - 1), c = R(1, d - 1); if (b !== d && a * d !== c * b) return [a, b, c, d]; } return [2, 3, 3, 4]; };

/* ═══ ٥-١ تسمية الزوايا وتقديرها — «أبراج الرماية» ═══ */
export const nameAngles7 = mission({
  id: 'nameAngles7', giver: 'hamdan', st: ST7F.towers, key: 'towers', label: '🏹 أبراج الرماية', icon: '🏹', bg: '#8B5A2B',
  intro: n => [{ who: 'hamdan', text: `أهلاً يا ${n}! الرماة يحتاجون أسماء الزوايا بين الأبراج، وتقدير قياسها قبل الرمي.` },
    { who: 'hamdan', text: 'نسمّي الزاوية بثلاثة حروف، والحرف الأوسط رأسها. ونقارن قياسها بالقائمة ٩٠° والمستقيمة ١٨٠°.' }],
  goal: '🏹 سمِّ زوايا أبراج حمدان وقدّرها', end: 'الرماة يعرفون زواياهم الآن! الرأس في وسط الاسم، والقائمة والمستقيمة مرجع التقدير.',
  make() {
    const [p, v, q] = shuf(LET).slice(0, 3), t0 = R(3, 15) * 10, t1 = shuf([R(3, 8) * 10, R(10, 17) * 10, R(19, 34) * 10])[0], t2 = shuf([R(2, 8), R(10, 16), R(20, 33)])[0] * 10;
    return [{ t: 'pick', p, v, q, th: t0, opts: opts(`∠${p}${v}${q}`, [`∠${v}${p}${q}`, `∠${p}${q}${v}`, `∠${q}${p}${v}`]), ans: `∠${p}${v}${q}` },
      { t: 'pick', th: t1, rot: R(0, 3) * 20, opts: ['حادة', 'قائمة', 'منفرجة', 'منعكسة'], ans: KIND(t1) },
      { t: 'pick', th: t2, opts: opts(deg(t2), [deg(Math.min(t2 + 50, 350)), deg(Math.max(10, t2 - 50)), deg(t2 > 180 ? t2 - 120 : t2 + 120)]), ans: deg(t2) }];
  },
  view(r) {
    if (r.p) return { text: 'الحبلان من البرج يصنعان زاوية. ما اسمها؟', visual: svg(ang(r.th, { pts: [r.p, r.v, r.q] })), hint: 'الحرف الأوسط في اسم الزاوية يجب أن يكون رأسها: النقطة التي يلتقي عندها الحبلان.' };
    if (r.rot != null) return { text: 'ما نوع زاوية الرمي المرسومة؟', visual: svg(ang(r.th, { rot: r.rot })), hint: 'قارن بالزاوية القائمة (ركن الورقة) وبالخط المستقيم: أصغر من القائمة حادة، وبين القائمة والمستقيم منفرجة، وأكبر من المستقيم منعكسة.' };
    return { text: 'قدّر قياس الزاوية بين البرجين (لأقرب ١٠°):', visual: svg(ang(r.th, { lab: '؟' })), hint: 'هل الزاوية أصغر من ٩٠° أم بين ٩٠° و١٨٠° أم أكبر من ١٨٠°؟ ابدأ من ذلك.' };
  }
});

/* ═══ ٥-٢ قياسات الزوايا — «منجنيق القلعة» (يرفع الذراع على المنقلة، ثم الزاوية المنعكسة) ═══ */
export const measureAngles7 = mission({
  id: 'measureAngles7', giver: 'fahad', st: ST7F.catapult, key: 'catapult', label: '🎯 منجنيق القلعة', icon: '🎯', bg: '#2E8B57', side: 1,
  intro: n => [{ who: 'fahad', text: `يا ${n}! المنجنيق يصيب الهدف حين نرفع ذراعه بالزاوية الصحيحة تماماً.` },
    { who: 'fahad', text: 'مركز المنقلة على الرأس، والذراع الأولى على الصفر، ثم نتابع التدريج نفسه.' }],
  goal: '🎯 صوّب منجنيق فهد', end: 'أصاب المنجنيق كل الأهداف! المنقلة تقيس حتى ١٨٠°، والمنعكسة = ٣٦٠° − الصغرى.',
  make() {
    const a = R(3, 8) * 10 + R(0, 1) * 5, b = R(10, 17) * 10 + R(0, 1) * 5, c = R(4, 15) * 10;
    return [{ t: 'dial', s: 0, st: [10, 5], lo: 0, hi: 180, ans: a }, { t: 'dial', s: 0, st: [10, 5], lo: 0, hi: 180, ans: b }, { t: 'kp', c, ans: 360 - c, dot: false }];
  },
  view(r, d) {
    if (r.t === 'kp') return { text: `ذراع المنجنيق والأرض بينهما زاوية صغرى قياسها كما على المنقلة. ما قياس <b>الزاوية المنعكسة</b> حول الرأس نفسه؟`, visual: svg(protractor(r.c)), hint: `اقرأ الزاوية الصغرى على المنقلة أولاً، ثم: الزاويتان معاً دورة كاملة ٣٦٠°.`, bad: v => v === r.c ? 'هذه الزاوية الصغرى نفسها: المطلوب المنعكسة (أكبر من ١٨٠°).' : v === 180 - r.c ? 'قرأتَ التدريج الآخر للمنقلة، وما زال المطلوب المنعكسة.' : null };
    return { text: `ارفع ذراع المنجنيق حتى تصير الزاوية <b>${deg(r.ans)}</b> (${KIND(r.ans)}).`, visual: svg(protractor(d.k / 1000)), unit: '°', show: v => N(v), label: '🎯 أطلق',
      hint: 'اقرأ التدريج الذي يبدأ بالصفر من جهة الذراع الأولى.', bad: v => v === 180 - r.ans ? 'قرأتَ التدريج الآخر للمنقلة: ابدأ من الصفر عند الذراع الأولى.' : (v < 90) !== (r.ans < 90) ? `المطلوب زاوية ${KIND(r.ans)}، وذراعك الآن تصنع زاوية ${KIND(v || 1)}.` : null };
  }
});

/* ═══ ٥-٣ حل مسائل الزوايا — «بوابة الزوايا» (على خط، في مثلث، حول نقطة) ═══ */
export const angleProblems7 = mission({
  id: 'angleProblems7', giver: 'muna', st: ST7F.gate, key: 'gate', label: '🚪 بوابة الزوايا', icon: '🚪', bg: '#5E4A8E', side: 1,
  intro: n => [{ who: 'muna', text: `أهلاً يا ${n}! بوابة المتحف القديمة تُفتح بأقفال زوايا: كل قفل يحتاج زاوية مجهولة.` },
    { who: 'muna', text: 'على الخط المستقيم ١٨٠°، وفي المثلث ١٨٠°، وحول النقطة ٣٦٠°.' }],
  goal: '🚪 افتح أقفال بوابة منى', end: 'انفتحت البوابة! كل زاوية مجهولة وجدتها من مجموع معروف.',
  make() {
    const a = R(5, 31) * 5, A = R(35, 75), B = R(35, 70), x = R(6, 12) * 10, y = R(5, 11) * 10 + 5, z = R(4, 9) * 10;
    return [{ t: 'kp', a: a === 90 ? 95 : a, ans: 180 - (a === 90 ? 95 : a), dot: false }, { t: 'kp', A, B, ans: 180 - A - B, dot: false }, { t: 'kp', x, y, z, ans: 360 - x - y - z, dot: false }];
  },
  view(r) {
    if (r.a) return { text: 'القفل الأول: زاويتان على خط مستقيم. ما قياس س؟', visual: svg(fan([r.a, 180 - r.a], [deg(r.a), 'س'], true)), hint: 'الزوايا على خط مستقيم مجموعها ١٨٠°.', bad: v => v === 360 - r.a ? 'هذا لدورة كاملة: الزاويتان هنا على خط مستقيم.' : null };
    if (r.A) return { text: 'القفل الثاني: مثلث على البوابة. ما قياس الزاوية س؟', visual: svg(triangle([r.A, r.B, r.ans], [deg(r.A), deg(r.B), 'س'])), hint: 'زوايا المثلث الثلاث مجموعها ١٨٠°.', bad: v => v === 360 - r.A - r.B ? 'مجموع زوايا المثلث ١٨٠° لا ٣٦٠°.' : null };
    return { text: 'القفل الأخير: أربع زوايا حول نقطة. ما قياس س؟', visual: svg(fan([r.x, r.y, r.z, r.ans], [deg(r.x), deg(r.y), deg(r.z), 'س'])), hint: 'الزوايا حول نقطة مجموعها ٣٦٠°.', bad: v => v === 180 - r.x - r.y - r.z || v === Math.abs(180 - r.x - r.y - r.z) ? 'الزوايا هنا حول نقطة (دورة كاملة) لا على خط.' : null };
  }
});

/* ═══ ٥-٤ الخطوط المتوازية — «جسر الحبال» ═══ */
const REL = ['متناظرتان', 'متبادلتان', 'متقابلتان بالرأس'];
export const parallelLines7 = mission({
  id: 'parallelLines7', giver: 'hamdan', st: ST7F.bridge, key: 'bridge', label: '🌉 جسر الحبال', icon: '🌉', bg: '#1F7A4D', side: 1,
  intro: n => [{ who: 'hamdan', text: `يا ${n}! جسر الحبال فوق الخندق: حبلان متوازيان يقطعهما حبل مائل.` },
    { who: 'hamdan', text: 'المتناظرتان في الموضع نفسه عند التقاطعين، والمتبادلتان بين الحبلين على جانبي القاطع: كلتاهما متساويتان.' }],
  goal: '🌉 شدّ جسر حبال حمدان', end: 'الجسر مشدود وآمن! المتناظرة والمتبادلة والمتقابلة بالرأس كلها متساوية.',
  make() {
    const k = R(0, 2), q = shuf(['tr', 'tl', 'bl', 'br'])[0], p0 = R(0, 1);
    const pair = k === 0 ? [{ p: 0, q }, { p: 1, q }] : k === 1 ? (R(0, 1) ? [{ p: 0, q: 'bl' }, { p: 1, q: 'tr' }] : [{ p: 0, q: 'br' }, { p: 1, q: 'tl' }]) : [{ p: p0, q: 'tr' }, { p: p0, q: 'bl' }];
    const t1 = R(10, 15) * 5, q1 = shuf(['tr', 'tl', 'bl', 'br'])[0], t2 = R(20, 26) * 5, a2 = R(0, 1) ? ['bl', 'tr'] : ['br', 'tl'];
    return [{ t: 'pick', th: R(11, 15) * 5, pair, opts: REL.slice(), ans: REL[k] }, { t: 'kp', th: t1, q: q1, ans: sectVal(t1, q1), dot: false }, { t: 'kp', th: t2, a: a2, ans: sectVal(t2, a2[0]), dot: false }];
  },
  view(r) {
    if (r.pair) return { text: 'ما العلاقة بين الزاويتين س وص على الجسر؟', visual: svg(parallel(r.th, [{ ...r.pair[0], lab: 'س' }, { ...r.pair[1], lab: 'ص', col: '#1E4FBF' }])), hint: 'هل الزاويتان عند التقاطع نفسه؟ هل هما في الموضع نفسه؟ أم بين الحبلين على جانبي القاطع؟' };
    if (r.q) return { text: 'الحبلان متوازيان. ما قياس الزاوية س؟', visual: svg(parallel(r.th, [{ p: 0, q: r.q, lab: deg(r.ans) }, { p: 1, q: r.q, lab: 'س', col: '#1E4FBF' }])), hint: 'الزاويتان في الموضع نفسه عند التقاطعين: متناظرتان.', bad: v => v === 180 - r.ans ? 'هذه المجاورة على الخط: الزاويتان هنا متناظرتان.' : null };
    return { text: 'الحبلان متوازيان. ما قياس الزاوية س؟', visual: svg(parallel(r.th, [{ p: 0, q: r.a[0], lab: deg(r.ans) }, { p: 1, q: r.a[1], lab: 'س', col: '#1E4FBF' }])), hint: 'الزاويتان بين الحبلين على جانبي القاطع: متبادلتان.', bad: v => v === 180 - r.ans ? 'المتبادلتان متساويتان، لا مجموعهما ١٨٠°.' : null };
  }
});

/* ═══ ٦-١ تبسيط الكسور — «خرائط الأقسام» ═══ */
export const simplify7 = mission({
  id: 'simplify7', giver: 'zaid', st: ST7F.maps, key: 'maps', label: '🗺️ خرائط الأقسام', icon: '🗺️', bg: '#C9971C', side: 1,
  intro: n => [{ who: 'zaid', text: `أهلاً يا ${n}! أرسم خرائط الحصن مقسّمة أجزاءً، والكسور عليها كبيرة ومزعجة.` },
    { who: 'zaid', text: 'نبسّط الكسر بقسمة بسطه ومقامه على العامل المشترك الأكبر، فيبقى الكسر نفسه بأعداد أصغر.' }],
  goal: '🗺️ بسّط كسور خرائط زيد', end: 'الخرائط واضحة الآن! الكسر المبسّط يساوي الأصلي تماماً.',
  make() {
    const g = R(3, 8), [a, b] = shuf([[1, 2], [2, 3], [3, 4], [1, 3], [2, 5], [3, 5], [4, 5], [1, 4]])[0], d2 = R(5, 9), n2 = R(2, d2 - 1), k2 = R(2, 5);
    const d3 = shuf([3, 4, 5])[0], n3 = R(1, d3 - 1), ks = shuf([2, 3, 4, 5, 6]).slice(0, 2), L = shuf([...ks.map(k => fr(n3 * k, d3 * k)), fr(n3 + 1, d3 + 1), fr(n3 * 2, d3 * 3), fr(n3 * 3 + 1, d3 * 3)]);
    return [{ t: 'kp', n: a * g, d: b * g, ans: g, dot: false }, { t: 'kp', n: n2 * k2, d: d2 * k2, d0: d2 / gcd(n2, d2), ans: n2 / gcd(n2, d2), dot: false },
      { t: 'multi', n: n3, d: d3, opts: L, ok: ks.map(k => fr(n3 * k, d3 * k)) }];
  },
  view(r) {
    if (r.d0) return { text: `على خريطة البرج الشمالي: ${fr(r.n, r.d)}. اكتبه في أبسط صورة: ${fr('؟', r.d0)}`, visual: big(`${fr(r.n, r.d)} = ${fr('؟', r.d0)}`), hint: 'قسمتَ المقام على عدد: اقسم البسط على العدد نفسه.' };
    if (r.ok) return { text: `أي الخرائط تساوي ${fr(r.n, r.d)} من الحصن؟ اختر كل كسر مكافئ.`, visual: big(fr(r.n, r.d)), hint: 'بسّط كل كسر: هل يصير مثل الكسر المطلوب؟', bad: g => g.length < r.ok.length ? 'بقي كسر مكافئ لم تختره.' : null };
    return { text: `على الخريطة ${fr(r.n, r.d)} من الأرض للبستان. ما <b>العامل المشترك الأكبر</b> للبسط والمقام؟`, visual: big(fr(r.n, r.d)), hint: `اكتب عوامل ${N(r.n)} وعوامل ${N(r.d)}، ثم اختر أكبر عامل مشترك بينهما.`, bad: v => r.n % v === 0 && r.d % v === 0 ? 'هذا عامل مشترك، لكن يوجد عامل مشترك أكبر منه.' : null };
  }
});

/* ═══ ٦-٢ مقارنة الكسور — «حصص المؤونة» ═══ */
export const compareFrac7 = mission({
  id: 'compareFrac7', giver: 'aisha', st: ST7F.rations, key: 'rations', label: '🍯 حصص المؤونة', icon: '🍯', bg: '#B0476A', side: 1,
  intro: n => [{ who: 'aisha', text: `يا ${n}! أوزّع المؤونة على الحرّاس، وكل واحد يقول إن حصة غيره أكبر!` },
    { who: 'aisha', text: 'لنقارن الكسرين: نكتبهما بالمقام نفسه، ثم نقارن البسطين.' }],
  goal: '🍯 قارن حصص مؤونة عائشة', end: 'عرف كل حارس حصته بالعدل! المقام المشترك يجعل المقارنة سهلة.',
  make() {
    const [a, b, c, d] = two(), b2 = R(3, 6), k = R(2, 4), a2 = R(1, b2 - 1), F = [], seen = new Set();
    for (let t = 0; F.length < 3 && t < 60; t++) { const dd = R(3, 10), nn = R(1, dd - 1), v = Math.round(nn / dd * 1e6); if (seen.has(v)) continue; seen.add(v); F.push([nn, dd]); }
    const top = F.reduce((m, x) => x[0] / x[1] > m[0] / m[1] ? x : m);
    return [{ t: 'pick', a, b, c, d, opts: ['>', '<', '='], ans: a / b > c / d ? '>' : '<' }, { t: 'kp', a: a2, b: b2, L: b2 * k, ans: a2 * k, dot: false },
      { t: 'pick', F, opts: F.map(x => fr(x[0], x[1])), ans: fr(top[0], top[1]) }];
  },
  view(r) {
    if (r.c) return { text: `حصة سالم ${fr(r.a, r.b)} كيس، وحصة ماجد ${fr(r.c, r.d)} كيس. ضع العلامة: ${ltr(`${fr(r.a, r.b)} ؟ ${fr(r.c, r.d)}`)}`, visual: big(ltr(`${fr(r.a, r.b)} ☐ ${fr(r.c, r.d)}`)), hint: `اكتب الكسرين بالمقام ${N(lcm(r.b, r.d))}، ثم قارن البسطين.`, cls: 'ltr' };
    if (r.L) return { text: `لنقارن، اكتب ${fr(r.a, r.b)} بالمقام ${N(r.L)}:`, visual: big(`${fr(r.a, r.b)} = ${fr('؟', r.L)}`), hint: `ضُرب المقام في ${N(r.L / r.b)}، فاضرب البسط في العدد نفسه.` };
    return { text: 'ثلاثة أكياس تمر لم تُفتح بعد. أي كيس فيه <b>أكبر</b> حصة؟', visual: big('🧺🧺🧺'), hint: 'قارن كل كسر بالنصف، ثم وحّد المقامات للمتقاربة.' };
  }
});

/* ═══ ٦-٣ الكسور غير الاعتيادية والأعداد الكسرية — «أرغفة الحرس» ═══ */
export const improperMixed7 = mission({
  id: 'improperMixed7', giver: 'aisha', st: ST7F.loaves, key: 'loaves', label: '🍞 أرغفة الحرس', icon: '🍞', bg: '#B5651D', side: 1,
  intro: n => [{ who: 'aisha', text: `يا ${n}! خبزتُ أرغفة وقطّعتها أرباعاً وأثلاثاً، وأريد أن أعرف كم رغيفاً كاملاً عندي.` },
    { who: 'aisha', text: 'كم مقاماً في البسط؟ ذلك عدد الأرغفة الكاملة، والباقي كسر رغيف.' }],
  goal: '🍞 احسب أرغفة عائشة', end: 'الأرغفة محسوبة! الكسر غير الاعتيادي والعدد الكسري وجهان للكمية نفسها.',
  make() {
    const q = R(9, 23), d = shuf([3, 5, 6, 8])[0], n = d * R(1, 3) + R(1, d - 1), w = Math.floor(n / d), rr = n % d, d3 = shuf([3, 4, 5, 6])[0], w3 = R(2, 5), r3 = R(1, d3 - 1);
    return [{ t: 'kp', q, ans: Math.floor(q / 4), dot: false }, { t: 'pick', n, d, opts: opts(mx(n, d), [`${N(w + 1)} و${fr(rr, d)}`, `${N(rr)} و${fr(w, d)}`, `${N(w)} و${fr(rr, n)}`]), ans: mx(n, d) },
      { t: 'kp', w: w3, r: r3, d: d3, ans: w3 * d3 + r3, dot: false }];
  },
  view(r) {
    if (r.q) return { text: `على الصينية <b>${N(r.q)}</b> ربع رغيف. كم رغيفاً <b>كاملاً</b> يمكن أن تكوّن منها؟`, visual: big(`${N(r.q)} × ${fr(1, 4)}`), hint: 'كل ٤ أرباع رغيف كامل: كم أربعة في العدد؟ (والباقي لا يكفي لرغيف كامل).' };
    if (r.n) return { text: `بقي من الخبز ${fr(r.n, r.d)} رغيف. اكتبه عدداً كسرياً:`, visual: big(fr(r.n, r.d)), hint: `كم مرة يدخل ${N(r.d)} في ${N(r.n)}؟ ذلك العدد الكامل، والباقي بسط الكسر.` };
    return { text: `طلب الحرّاس ${N(r.w)} و${fr(r.r, r.d)} رغيف. كم قطعة (${fr(1, r.d)} رغيف) تقطع عائشة؟`, visual: big(`${N(r.w)} و${fr(r.r, r.d)} = ${fr('؟', r.d)}`), hint: 'اضرب العدد الكامل في المقام، ثم أضف البسط.', bad: v => v === r.w + r.r ? 'جمعتَ العدد الكامل والبسط فقط: كل رغيف كامل فيه ' + N(r.d) + ' قطع.' : null };
  }
});

/* ═══ ٦-٤ جمع الكسور وطرحها — «خليط الطين» ═══ */
const PAIRS = [[2, 3], [3, 4], [2, 5], [4, 6], [3, 5], [4, 5], [2, 7], [3, 8], [2, 6], [4, 8]];
export const addSubFrac7 = mission({
  id: 'addSubFrac7', giver: 'muna', st: ST7F.clay, key: 'clay', label: '🧱 خليط الطين', icon: '🧱', bg: '#A9743F', side: 1,
  intro: n => [{ who: 'muna', text: `يا ${n}! نرمّم سور المتحف بخليط من الطين والرمل والتبن، بكسور من الدلو.` },
    { who: 'muna', text: 'لا نجمع كسرين ولا نطرحهما قبل أن يصير لهما المقام نفسه.' }],
  goal: '🧱 اخلط طين منى بدقة', end: 'الخليط متوازن والسور متين! وحّد المقامات ثم اجمع البسوط أو اطرحها.',
  make() {
    const d = R(5, 11), a = R(1, d - 2), b = R(1, d - 1 - a), [p, q] = shuf(PAIRS)[0], x = R(1, p - 1), y = R(1, q - 1), L = lcm(p, q), s = x * L / p + y * L / q;
    let [u, v] = shuf(PAIRS)[0], m = R(1, u - 1), k = R(1, v - 1); if (m / u <= k / v) { [m, u, k, v] = [k, v, m, u]; if (m / u === k / v) { m = 1; u = 2; k = 1; v = 4; } }
    const L2 = lcm(u, v), df = m * L2 / u - k * L2 / v;
    return [{ t: 'kp', a, b, d, ans: a + b, dot: false }, { t: 'pick', x, p, y, q, opts: opts(mx(s, L), [fr(x + y, p + q), mx(s + 1, L), fr(x + y, L), fr(x * y, p * q)]), ans: mx(s, L) },
      { t: 'pick', m, u, k, v, opts: opts(frs(df, L2), [fr(Math.abs(m - k) || 1, Math.abs(u - v) || 1), frs(df + 1, L2), fr(m + k, L2), fr(m + k, u + v)]), ans: frs(df, L2) }];
  },
  view(r) {
    if (r.b) return { text: `في الدلو ${fr(r.a, r.d)} طين، وأضافت منى ${fr(r.b, r.d)} رمل. كم صار في الدلو؟`, visual: big(`${fr(r.a, r.d)} + ${fr(r.b, r.d)} = ${fr('؟', r.d)}`), hint: 'المقامان متساويان: اجمع البسطين فقط، والمقام يبقى كما هو.', bad: v => v === r.a * r.b ? 'هذا ضرب: المطلوب جمع البسطين.' : null };
    if (r.p) return { text: `خلطت منى ${fr(r.x, r.p)} دلو من الطين و${fr(r.y, r.q)} دلو من الرمل. كم دلواً الخليط؟`, visual: big(`${fr(r.x, r.p)} + ${fr(r.y, r.q)}`), hint: `حوّل الكسرين إلى المقام ${N(lcm(r.p, r.q))}، ثم اجمع البسطين.` };
    return { text: `كان عندها ${fr(r.m, r.u)} دلو من التبن، واستعملت ${fr(r.k, r.v)} دلو. كم بقي؟`, visual: big(`${fr(r.m, r.u)} − ${fr(r.k, r.v)}`), hint: `حوّل الكسرين إلى المقام ${N(lcm(r.u, r.v))}، ثم اطرح البسطين.` };
  }
});

/* ═══ ٦-٥ استخدام الكسور مع الكميات — «مخزن القلعة» ═══ */
export const fracQuantity7 = mission({
  id: 'fracQuantity7', giver: 'zaid', st: ST7F.store, key: 'store', label: '🏺 مخزن القلعة', icon: '🏺', bg: '#7A5A2E',
  intro: n => [{ who: 'zaid', text: `يا ${n}! نجهّز مخزن القلعة للشتاء، وكل حصة كسرٌ من كمية.` },
    { who: 'zaid', text: 'كسر الكمية: اقسم الكمية على المقام، ثم اضرب في البسط.' }],
  goal: '🏺 جهّز مخزن زيد', end: 'المخزن جاهز للشتاء! الكسر من كمية قسمة على المقام ثم ضرب في البسط.',
  make() {
    const d = shuf([3, 4, 5, 6, 8])[0], n = R(1, d - 1), Q = d * R(4, 12), d2 = shuf([3, 4, 5])[0], n2 = R(1, d2 - 1), k = d2 * R(2, 4), [p, Q3] = shuf([[10, R(13, 49) * 10], [25, R(5, 30) * 4], [50, R(11, 99) * 2], [20, R(5, 40) * 5], [75, R(5, 25) * 4]])[0];
    return [{ t: 'kp', n, d, Q, ans: Q / d * n, dot: false }, { t: 'kp', n: n2, d: d2, k, ans: k * n2 / d2, dot: false }, { t: 'kp', p, Q: Q3, ans: p * Q3 / 100, dot: false }];
  },
  view(r) {
    if (r.p) return { text: `في المخزن <b>${N(r.Q)}</b> كيلوغراماً من التمر، و<b>${N(r.p)}٪</b> منها للحرّاس. كم كيلوغراماً للحرّاس؟`, visual: big(`${N(r.p)}٪ من ${N(r.Q)}`), hint: `${N(r.p)}٪ تعني ${N(r.p)} من كل ١٠٠: اقسم على ١٠٠ ثم اضرب في ${N(r.p)}.` };
    if (r.k) return { text: `يأخذ كل حارس ${fr(r.n, r.d)} كيلوغرام من الأرز، والحرّاس <b>${N(r.k)}</b>. كم كيلوغراماً يأخذون معاً؟`, visual: big(`${N(r.k)} × ${fr(r.n, r.d)}`), hint: 'ضرب عدد في كسر = الكسر من ذلك العدد: اقسم على المقام ثم اضرب في البسط.' };
    return { text: `في المخزن <b>${N(r.Q)}</b> جرّة ماء، و${fr(r.n, r.d)} منها للمطبخ. كم جرّة للمطبخ؟`, visual: big(`${fr(r.n, r.d)} من ${N(r.Q)}`), hint: 'اقسم الكمية على المقام، ثم اضرب في البسط.', bad: v => v === r.Q / r.d ? `هذا ${fr(1, r.d)} فقط: اضرب في البسط ${N(r.n)}.` : null };
  }
});

/* ═══ ٦-٦ تحويل الكسور إلى كسور عشرية — «ساعة الرمل» ═══ */
const REC = [[1, 3, '٠٫٣٣٣...'], [2, 3, '٠٫٦٦٦...'], [1, 9, '٠٫١١١...'], [5, 9, '٠٫٥٥٥...'], [1, 6, '٠٫١٦٦...'], [4, 9, '٠٫٤٤٤...']];
export const fracToDec7 = mission({
  id: 'fracToDec7', giver: 'fahad', st: ST7F.sand, key: 'sand', label: '⏳ ساعة الرمل', icon: '⏳', bg: '#C2304A', side: 1,
  intro: n => [{ who: 'fahad', text: `أهلاً يا ${n}! ساعة الرمل تُقاس بكسور الساعة، لكن لوح الحرس يكتب بالأعداد العشرية.` },
    { who: 'fahad', text: 'الكسر قسمة: اقسم البسط على المقام. وإن تكرر الباقي فالعدد العشري دوري لا ينتهي.' }],
  goal: '⏳ اضبط ساعة رمل فهد', end: 'لوح الحرس صحيح! بعض الكسور تنتهي قسمتها، وبعضها عدد عشري دوري.',
  make() {
    const [n, d] = shuf([[3, 8], [5, 8], [7, 8], [1, 8], [7, 20], [9, 25], [13, 20], [3, 4], [2, 5]])[0], [a, b, s] = shuf(REC)[0], [x, y] = shuf([[3, 5], [4, 5], [1, 4], [3, 4], [7, 10], [9, 10]])[0];
    return [{ t: 'kp', n, d, ans: n / d }, { t: 'pick', a, b, opts: opts(s, [D(a / 10), D(+(a / b).toFixed(2) + .01), D(a + b / 10)]), ans: s },
      { t: 'pick', x, y, opts: opts(fr(x, y), [fr(y, x), fr(x, y * 10), fr(x + 1, y + 1)]), ans: fr(x, y) }];
  },
  view(r) {
    if (r.n) return { text: `مرّ ${fr(r.n, r.d)} ساعة منذ قلب الساعة. اكتبه عدداً عشرياً على اللوح.`, visual: big(`${fr(r.n, r.d)} = ${N(r.n)} ÷ ${N(r.d)}`), hint: 'اقسم البسط على المقام، وأضف أصفاراً بعد الفاصلة حتى تنتهي القسمة.' };
    if (r.b) return { text: `الحارس سهر ${fr(r.a, r.b)} الليلة. أي عدد عشري يساويه؟`, visual: big(`${N(r.a)} ÷ ${N(r.b)} = ؟`), hint: 'اقسم وراقب الباقي: إن تكرر الباقي نفسه تكرر الرقم في الناتج.' };
    return { text: `على اللوح: <b>${D(r.x / r.y)}</b> ساعة. أي كسر يساويه؟`, visual: big(D(r.x / r.y)), hint: 'اكتب العدد العشري على مقام ١٠ أو ١٠٠ ثم بسّط.' };
  }
});

/* ═══ ٦-٧ ترتيب الكسور — «سلّم الأسوار» ═══ */
function fracSet(k, lo = 3, hi = 10) { const L = [], seen = new Set(); for (let t = 0; L.length < k && t < 90; t++) { const d = R(lo, hi), n = R(1, d - 1), v = Math.round(n / d * 1e6); if (seen.has(v)) continue; seen.add(v); L.push([n, d]); } return L; }
export const orderFrac7 = mission({
  id: 'orderFrac7', giver: 'hamdan', st: ST7F.ladder, key: 'ladder', label: '🪜 سلّم الأسوار', icon: '🪜', bg: '#6B3FD0', side: 1,
  intro: n => [{ who: 'hamdan', text: `يا ${n}! درجات سلّم السور مكتوبة بكسور من ارتفاعه، واختلط ترتيبها.` },
    { who: 'hamdan', text: 'لنرتّبها: نوحّد المقامات، أو نحوّل كل كسر إلى عدد عشري.' }],
  goal: '🪜 رتّب درجات سلّم حمدان', end: 'السلّم مرتّب من الأسفل إلى الأعلى! المقام المشترك والعدد العشري يكشفان الترتيب.',
  make() {
    const A = fracSet(4), lab = x => fr(x[0], x[1]), v = x => x[0] / x[1], B = fracSet(2), x1 = R(11, 89) / 100, x2 = +(x1 + R(3, 9) / 100).toFixed(2), M = [...B.map(b => [lab(b), v(b)]), [D(x1), x1], [D(x2), x2]];
    const okM = new Set(M.map(m => Math.round(m[1] * 1e6))).size === 4 ? M : [[fr(1, 4), .25], ['٠٫٣', .3], [fr(3, 5), .6], ['٠٫٥٥', .55]];
    const C = fracSet(3, 4, 12), top = C.reduce((m, x) => v(x) > v(m) ? x : m);
    return [{ t: 'order', items: A.map(lab), want: A.slice().sort((p, q) => v(p) - v(q)).map(lab) }, { t: 'order', items: okM.map(m => m[0]), want: okM.slice().sort((p, q) => p[1] - q[1]).map(m => m[0]), mix: 1 },
      { t: 'pick', opts: C.map(lab), ans: lab(top), top: 1 }];
  },
  view(r) {
    if (r.top) return { text: 'أي درجة هي <b>الأعلى</b> في السلّم؟', visual: big('🪜'), hint: 'وحّد المقامات أو حوّل كل كسر إلى عدد عشري، ثم قارن.' };
    return { text: r.mix ? 'بعض الدرجات بالأعداد العشرية: رتّبها كلها من <b>الأدنى</b> إلى <b>الأعلى</b>.' : 'رتّب درجات السلّم من <b>الأدنى</b> إلى <b>الأعلى</b>.', visual: big('🪜'), hint: r.mix ? 'حوّل الكسور إلى أعداد عشرية بالقسمة، ثم قارن.' : 'اكتب الكسور بمقام مشترك، ثم رتّب البسوط.' };
  }
});

/* ═══ ٦-٨ حساب الباقي — «خيام الحرس» (التقريب للأكبر أو للأصغر حسب الموقف) ═══ */
export const remainders7 = mission({
  id: 'remainders7', giver: 'fahad', st: ST7F.tents, key: 'tents', label: '⛺ خيام الحرس', icon: '⛺', bg: '#2F6FB2', side: 1,
  intro: n => [{ who: 'fahad', text: `يا ${n}! قافلة الحرس تخيّم الليلة خارج الحصن، والقسمة لا تنتهي دائماً بلا باقٍ.` },
    { who: 'fahad', text: 'الموقف يخبرك: هل الباقي يحتاج شيئاً إضافياً (نقرّب للأكبر)، أم لا يكفي لشيء كامل (نقرّب للأصغر)؟' }],
  goal: '⛺ وزّع حرّاس فهد على الخيام', end: 'نام الحرس كلهم في خيامهم! الباقي يُكتب كسراً، أو نقرّب حسب الموقف.',
  make() {
    const d = R(6, 9), n = d * R(4, 9) + R(1, d - 1), d2 = R(3, 8), n2 = d2 * R(5, 12) + R(1, d2 - 1), d3 = R(3, 9), q3 = R(2, 9), r3 = R(1, d3 - 1), n3 = d3 * q3 + r3;
    return [{ t: 'kp', n, d, ans: Math.ceil(n / d), dot: false }, { t: 'kp', n: n2, d: d2, ans: Math.floor(n2 / d2), dot: false, rope: 1 },
      { t: 'pick', n: n3, d: d3, opts: opts(mx(n3, d3), [`${N(q3)} و${fr(r3, n3)}`, `${N(r3)} و${fr(q3, d3)}`, `${N(q3 + 1)} و${fr(r3, d3)}`]), ans: mx(n3, d3) }];
  },
  view(r) {
    if (r.rope) return { text: `حبل الخيام طوله <b>${N(r.n)}</b> م، وكل خيمة تحتاج <b>${N(r.d)}</b> م. كم خيمة يكفيها الحبل؟`, visual: big(`${N(r.n)} ÷ ${N(r.d)}`), hint: 'الجزء الباقي من الحبل لا يكفي خيمة كاملة: قرّب للأصغر.', bad: v => v === Math.ceil(r.n / r.d) ? 'الحبل الباقي أقصر من حاجة خيمة كاملة: لا يكفي لها.' : null };
    if (r.opts) return { text: `قسّم فهد <b>${N(r.n)}</b> رغيفاً على <b>${N(r.d)}</b> حرّاس بالتساوي. كم رغيفاً لكل حارس؟ (عدداً كسرياً)`, visual: big(`${N(r.n)} ÷ ${N(r.d)}`), hint: 'الباقي يصير بسط الكسر، والمقسوم عليه (عدد الحرّاس) مقامه.' };
    return { text: `الحرّاس <b>${N(r.n)}</b>، وكل خيمة تتسع لـ <b>${N(r.d)}</b>. كم خيمة يحتاجون حتى لا يبقى أحد في العراء؟`, visual: big('⛺'.repeat(3)), hint: 'اقسم، ثم انظر إلى الباقي: الحرّاس الباقون يحتاجون خيمة أيضاً.', bad: v => v === Math.floor(r.n / r.d) ? 'بعض الحرّاس بقوا بلا خيمة! الباقي يحتاج خيمة أيضاً.' : null };
  }
});

export const G7U4 = { nameAngles7, measureAngles7, angleProblems7, parallelLines7, simplify7, compareFrac7, improperMixed7, addSubFrac7, fracQuantity7, fracToDec7, orderFrac7, remainders7 };
