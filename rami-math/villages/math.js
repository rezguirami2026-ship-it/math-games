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
/* عملية تُقرأ من اليمين إلى اليسار: op(5, '+', -3) = «٥ + (٣−)» */
export const op = (...parts) => parts.map(p => typeof p === 'number' ? P(p) : p).join(' ');
/* عدد عشوائي صحيح [a, b] (بلا الصفر إن طُلب) */
export const R = (a, b, noZero = false) => { for (let k = 0; k < 40; k++) { const v = a + Math.floor(Math.random() * (b - a + 1)); if (!noZero || v) return v; } return b || 1; };
/* عدد عشري بمنزلة واحدة في [a, b] (لا يكون صحيحاً) */
export const R1 = (a, b) => { for (let k = 0; k < 40; k++) { const v = R(a * 10, b * 10) / 10; if (v % 1) return v; } return a + .5; };
/* مقارنة الأعداد العشرية دون أخطاء التقريب */
export const eq = (a, b) => Math.round(a * 1000) === Math.round(b * 1000);
