// الكتابة الرياضية للصفين الثامن والتاسع كما في كتاب الطالب (انظر CLAUDE.md «القرى»):
// الأرقام هندية، والسالب «٢٠−» (neg)، والكسر العشري بالفاصلة «٫»، والقوة RTL والأس أعلى يسار الأساس،
// والجذر بعلامة معكوسة على يمين العدد وخط فوقه ودليل الجذر التكعيبي في زاويتها، والكسر مكدّس.
import { ar, neg } from '../core/util.js';

/* عدد بأي إشارة وأي كسر عشري: N(-3.5) = «٣٫٥−» */
export const N = v => { const r = Math.round(v * 1000) / 1000; const s = ar(String(Math.abs(r))).replace('.', '٫'); return r < 0 ? neg(s) : s; };
/* عدد داخل عملية: السالب بين قوسين كما في الكتاب «(٥−)» */
export const P = v => v < 0 ? `(${N(v)})` : N(v);
/* القوة: pw(3, 4) = ٣ أُس ٤، والأساس السالب بين قوسين */
export const pw = (b, e) => `<span class="mq-pw">${typeof b === 'number' ? P(b) : b}<sup>${typeof e === 'number' ? N(e) : e}</sup></span>`;
/* الجذر: rt(85) تربيعي، rt(64, 3) تكعيبي */
export const rt = (v, k = 2) => `<span class="mq-rt"><span class="mq-rad">${k === 3 ? '<i>٣</i>' : ''}√</span><span class="mq-ov">${typeof v === 'number' ? N(v) : v}</span></span>`;
/* الكسر المكدّس */
export const fr = (a, b) => `<span class="mq-fr"><span>${typeof a === 'number' ? N(a) : a}</span><span>${typeof b === 'number' ? N(b) : b}</span></span>`;
/* العدد الكسري كما في الكتاب: العدد الصحيح يساراً والكسر يمينه «٢ ١/٥» */
export const mx = (w, a, b) => `<span class="mq-mx" dir="ltr">${N(w)} ${fr(a, b)}</span>`;
/* الكسور (الوحدة ٤ للصف الثامن): القاسم المشترك الأكبر، والمضاعف المشترك الأصغر */
export const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
export const lcm = (a, b) => a / gcd(a, b) * b;
/* الكسر a/b في أبسط صورة وعدداً كسرياً إن أمكن: «٣ ٨/٩» أو «٢٠/٦٣» أو «١٢» */
export const fx = (a, b) => { const g = gcd(a, b); a /= g; b /= g; if (b === 1) return N(a); return a > b ? mx(Math.floor(a / b), a % b, b) : fr(a, b); };
/* جواب لوحة الكسر { w, n, d }: قيمته تساوي a/b؟ */
export const fEq = (v, a, b) => !!v && v.d > 0 && (v.w * v.d + v.n) * b === a * v.d;
/* وفي أبسط صورة: بلا عامل مشترك، والجزء الكسري أقل من الواحد (عدد كسري إن زاد على الواحد) */
export const fOk = (v, a, b) => fEq(v, a, b) && (v.n === 0 ? true : gcd(v.n, v.d) === 1 && v.n < v.d);
/* رد على جواب قيمته صحيحة وصورته غير مكتملة (وإلا نص فارغ) */
export const fBad = (v, a, b) => !fEq(v, a, b) ? '' : v.n && gcd(v.n, v.d) > 1 ? 'القيمة صحيحة! لكن هل للبسط والمقام عامل مشترك بعد؟' : v.n >= v.d ? 'القيمة صحيحة! لكن البسط أكبر من المقام: اكتبه عدداً كسرياً.' : '';
/* الجبر (الوحدة ٥ للصف الثامن) كما في الكتاب: حد = معامل ثم حرف ثم أسه أعلى يساره: tm(3, 'س', 2) = «٣س٢»، والمعامل ١ لا يُكتب */
export const tm = (c, v = '', e = 1) => `${Math.abs(c) === 1 && v ? '' : N(Math.abs(c))}${v ? (e === 1 ? v : pw(v, e)) : ''}`;
/* عبارة من حدود [معامل، حرف، أس] تُقرأ من اليمين: ex([2, 'س'], [-5]) = «٢س − ٥» (الحدود الصفرية تُحذف) */
export const ex = (...T) => T.filter(t => t[0]).map((t, i) => (i ? (t[0] < 0 ? ' − ' : ' + ') : (t[0] < 0 ? '−' : '')) + tm(...t)).join('') || N(0);
/* عملية تُقرأ من اليمين إلى اليسار: op(5, '+', -3) = «٥ + (٣−)» */
export const op = (...parts) => parts.map(p => typeof p === 'number' ? P(p) : p).join(' ');
/* عدد عشوائي صحيح [a, b] (بلا الصفر إن طُلب) */
export const R = (a, b, noZero = false) => { for (let k = 0; k < 40; k++) { const v = a + Math.floor(Math.random() * (b - a + 1)); if (!noZero || v) return v; } return b || 1; };
/* عدد عشري بمنزلة واحدة في [a, b] (لا يكون صحيحاً) */
export const R1 = (a, b) => { for (let k = 0; k < 40; k++) { const v = R(a * 10, b * 10) / 10; if (v % 1) return v; } return a + .5; };
/* مقارنة الأعداد العشرية دون أخطاء التقريب */
export const eq = (a, b) => Math.round(a * 1000) === Math.round(b * 1000);
/* كتابة عبارة رياضية على القماش من اليمين إلى اليسار: أجزاء نصية، و{ b, e } قوة (الأس صغير أعلى يسار الأساس). (x, y) منتصف السطر */
export function drawMath(g, segs, x, y, size = 24) {
  const big = `900 ${size}px Cairo`, small = `900 ${Math.round(size * .6)}px Cairo`;
  const wOf = s => { if (typeof s === 'string') { g.font = big; return g.measureText(s).width; } g.font = big; const wb = g.measureText(s.b).width; g.font = small; return wb + g.measureText(s.e).width + 2; };
  const tot = segs.reduce((a, s) => a + wOf(s), 0); let cx = x + tot / 2; const ta = g.textAlign; g.textAlign = 'right';
  segs.forEach(s => { if (typeof s === 'string') { g.font = big; g.fillText(s, cx, y); cx -= wOf(s); } else { g.font = big; const wb = g.measureText(s.b).width; g.fillText(s.b, cx, y); g.font = small; g.fillText(s.e, cx - wb - 1, y - size * .42); cx -= wOf(s); } });
  g.textAlign = ta;
}
