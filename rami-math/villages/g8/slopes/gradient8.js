// ١١-٢ ميل الخط المستقيم — «لوحة الميل»: المدرّب خليل يكتب ميل كل منحدر على لوحته. الميل = التغيّر في ص ÷ التغيّر في س:
// من مثلث قائم على الشبكة، ومن نقطتين بالقانون، والميل السالب (يميل للأسفل من اليسار إلى اليمين)، وأي المنحدرين أشد، ورسم منحدر بميل معلوم.
// مثلث الميل يظهر بعد الحل. التحدي: ٨ أسئلة من 8As1 (الكتاب ص٥٠–٥١).
import { mission } from '../../mission.js';
import { N, R, eq, fr } from '../../math.js';
import { choice, num, tf } from '../../../missions/challenge.js';
import { duneBg, say, glow, plane, pt } from './art.js';

const who = { name: 'المدرّب خليل', face: '🏂', id: 'khalil' };
const pick = a => a[Math.floor(Math.random() * a.length)];
const MS = [[1, 2], [-1, 2], [2, 1], [-2, 1], [3, 1], [-3, 1], [1, 1], [-1, 1], [3, 2], [-3, 2], [1, 4], [-1, 4]];   // [التغيّر في ص، التغيّر في س]
const two = (lo, hi) => { let a, dy, dx, k; do { [dy, dx] = pick(MS); k = R(1, 3); a = [R(lo, hi), R(lo, hi)]; } while (a[0] + dx * k > hi || a[1] + dy * k > hi || a[1] + dy * k < lo); return [a, [a[0] + dx * k, a[1] + dy * k], dy / dx]; };

function draw(g, w, h, t, S) {
  const r = S.r ? S.r.data : {}; duneBg(g, w, h, t);
  const s = Math.min(w * .55, h * .78), x = w * .5 - s / 2, y = h * .1;
  plane(g, x, y, s, r.lo ?? -6, r.hi ?? 6, { pts: (r.pts || []).map(p => ({ p, l: pt(...p) })), segs: r.seg ? [[r.seg[0], r.seg[1]]] : [], lines: r.lines || [], tri: S.done && r.seg ? r.seg : null, lab: r.lab || 1 });
  if (S.done && r.ans) say(g, r.ans, w * .5, h * .95, 17, '#15803D', 900);
  glow(g, w, h, S);
}
const mTxt = m => N(Math.round(m * 1000) / 1000);

function make(i) {
  if (i === 0) { const [a, b, m] = two(-5, 4);
    return { q: 'ما ميل منحدر التزلج المرسوم؟', input: { type: 'num', neg: true, dot: true }, sol: m, ok: v => eq(v, m),
      hint: 'ارسم مثلثاً قائماً وتره جزء من المستقيم: كم يتغيّر ص؟ وكم يتغيّر س؟ ثم اقسم.', bad: v => eq(v, -m) ? 'راجع الإشارة: هل يصعد المستقيم أم ينزل من اليسار إلى اليمين؟' : eq(v, 1 / m) ? 'قلبت القسمة: التغيّر في ص فوق.' : '',
      good: `الميل = ${mTxt(m)}`, data: { seg: [a, b], pts: [a, b], ans: `الميل = ${mTxt(m)}` } }; }
  if (i === 1) { const [a, b, m] = two(-8, 8);
    return { q: `يمر المنحدر بالنقطتين ${pt(...a)} و${pt(...b)}. ما ميله؟`, input: { type: 'num', neg: true, dot: true }, sol: m, ok: v => eq(v, m),
      hint: `الميل = (ص٢ − ص١) ÷ (س٢ − س١). اطرح بالترتيب نفسه في البسط والمقام.`, bad: v => eq(v, -m) ? 'انتبه للترتيب في الطرح: النقطة نفسها أولاً في البسط والمقام.' : eq(v, 1 / m) ? 'التغيّر في ص في البسط.' : '',
      good: `(${N(b[1])} − ${N(a[1])}) ÷ (${N(b[0])} − ${N(a[0])}) = ${mTxt(m)}`, data: { seg: [a, b], pts: [a, b], lo: -10, hi: 10, lab: 2, ans: `الميل = ${mTxt(m)}` } }; }
  if (i === 2) { let A, B, m; do [A, B, m] = two(-5, 5); while (m > 0);
    return { q: 'هذا منحدر نازل. اختر وصف ميله.', input: { type: 'pick', opts: ['ميل موجب', 'ميل سالب', 'الميل صفر'] }, ok: v => v === 1,
      hint: 'اقرأ من اليسار إلى اليمين: هل يصعد المستقيم أم ينزل؟', bad: v => v === 2 ? 'الميل صفر لمستقيم أفقي.' : 'المستقيم الذي ميله موجب يصعد من اليسار إلى اليمين.',
      good: `ميل سالب = ${mTxt(m)}`, data: { seg: [A, B], pts: [A, B], ans: `الميل = ${mTxt(m)}` } }; }
  if (i === 3) { let p1, p2; do { p1 = pick(MS); p2 = pick(MS); } while (Math.abs(p1[0] / p1[1]) === Math.abs(p2[0] / p2[1]) || p1[0] < 0 || p2[0] < 0);
    const m1 = p1[0] / p1[1], m2 = p2[0] / p2[1], steep = m1 > m2 ? 0 : 1;
    return { q: `منحدر الهضبة ميله ${mTxt(m1)}، ومنحدر الوادي ميله ${mTxt(m2)}. أيهما أشد انحداراً؟`, input: { type: 'pick', opts: ['منحدر الهضبة', 'منحدر الوادي'] }, ok: v => v === steep,
      hint: 'الميل الأكبر يعني ارتفاعاً أكبر لكل خطوة أفقية واحدة.', bad: () => 'قارن قيمتي الميل: أيهما أكبر؟',
      good: `${mTxt(Math.max(m1, m2))} > ${mTxt(Math.min(m1, m2))}`, data: { lines: [{ m: m1, c: 0, col: '#EA580C' }, { m: m2, c: 0, col: '#1E3A8A' }], ans: `الأشد ميله ${mTxt(Math.max(m1, m2))}` } }; }
  if (i === 4) { const [dy, dx] = pick(MS), m = dy / dx, a = [R(-4, 0), dy > 0 ? R(-4, 0) : R(0, 4)];
    return { q: `يريد خليل منحدراً تجريبياً ميله ${dx === 1 ? N(dy) : (dy < 0 ? '−' : '') + fr(Math.abs(dy), dx)} يمر بالنقطة ${pt(...a)}. انقر نقطتين على المنحدر.`, input: { type: 'grid', x0: -6, x1: 6, y0: -6, y1: 6, n: 2, given: [[...a, '']] }, sol: [a, [a[0] + dx, a[1] + dy]], ok: v => { const [[x1, y1], [x2, y2]] = v; return x1 !== x2 && eq((y2 - y1) / (x2 - x1), m) && eq(y1 - a[1], m * (x1 - a[0])); },
      hint: 'من النقطة المعطاة: كم خطوة يميناً وكم خطوة أعلى أو أسفل يعطيك الميل؟', bad: v => { const [[x1, y1], [x2, y2]] = v; return x1 !== x2 && eq((y2 - y1) / (x2 - x1), m) ? 'الميل صحيح، لكن المستقيم لا يمر بالنقطة المعطاة.' : x1 !== x2 && eq((y2 - y1) / (x2 - x1), -m) ? 'الميل معكوس الإشارة.' : 'تحقق من الميل: التغيّر في ص ÷ التغيّر في س.'; },
      good: `ميله ${mTxt(m)}`, data: { pts: [a], ans: `الميل = ${mTxt(m)}`, lines: [] } }; }
  const [a, b, m] = two(0, 8), opts = [mTxt(m), mTxt(-m), mTxt(1 / m), mTxt(b[1] - a[1])].filter((v, k, A) => A.indexOf(v) === k), sh = opts.map(v => [Math.random(), v]).sort((p, q) => p[0] - q[0]).map(x => x[1]);
  return { q: `قال صديقك إن ميل الخط بين ${pt(...a)} و${pt(...b)} يساوي ${mTxt(1 / m)}. ما الميل الصحيح؟`, input: { type: 'pick', opts: sh }, ok: v => sh[v] === mTxt(m),
    hint: 'هل قسم صديقك التغيّر في ص على التغيّر في س، أم العكس؟', bad: () => 'الميل = التغيّر في ص ÷ التغيّر في س.',
    good: `الميل = ${mTxt(m)}`, data: { seg: [a, b], pts: [a, b], lo: 0, hi: 10, lab: 2, ans: `الميل = ${mTxt(m)}` } };
}

function challenge() {
  const items = [], used = new Set(), fresh = f => { for (let k = 0; k < 60; k++) { const x = f(); const s = JSON.stringify(x); if (!used.has(s)) { used.add(s); return x; } } return f(); };
  { const [a, b, m] = fresh(() => two(-6, 6)); items.push(num(`ما ميل المستقيم المار بالنقطتين ${pt(...a)} و${pt(...b)}؟`, m, 'التغيّر في ص ÷ التغيّر في س.', '8As1', { neg: true, dot: true })); }
  { const [a, b, m] = fresh(() => two(0, 8)); items.push(choice(`ميل المستقيم المار بالنقطتين ${pt(...a)} و${pt(...b)}:`, mTxt(m), [mTxt(-m), mTxt(1 / m), mTxt(m + 1)], 'احسب الفرقين.', '8As1')); }
  items.push(tf('المستقيم الذي ميله سالب ينزل من اليسار إلى اليمين.', true, 'تخيّل ميل ١−.', '8As1', 'كلما زاد س نقص ص.'));
  items.push(tf('ميل المستقيم المار بالنقطتين (٠، ٥) و(٦، ٢) يساوي ٢.', false, 'احسب (٢ − ٥) ÷ (٦ − ٠).', '8As1', 'الميل ٠٫٥−.'));
  items.push(choice('المستقيم الأفقي ميله:', 'صفر', ['واحد', 'سالب', 'كبير جداً'], 'كم يتغيّر ص على مستقيم أفقي؟', '8As1'));
  { const [m1, m2] = fresh(() => pick([[2, .5], [3, 1.5], [1, .25], [4, 2]])); items.push(choice(`مستقيمان ميلاهما ${N(m1)} و${N(m2)}. الأشد انحداراً ميله:`, N(m1), [N(m2), 'متساويان'], 'الميل الأكبر أشد.', '8As1')); }
  { const [dy, dx] = fresh(() => pick(MS)); items.push(num(`في مثلث الميل: التغيّر في ص يساوي ${N(dy)} والتغيّر في س يساوي ${N(dx)}. ما الميل؟`, dy / dx, 'اقسم.', '8As1', { neg: true, dot: true })); }
  { const [a, b] = fresh(() => [[R(0, 3), R(0, 3)], [R(5, 8), R(5, 8)]]); items.push(num(`ما ميل المستقيم المار بـ ${pt(...a)} و${pt(...b)}؟`, Math.round((b[1] - a[1]) / (b[0] - a[0]) * 1000) / 1000, 'التغيّر في ص ÷ التغيّر في س.', '8As1', { dot: true })); }
  return items.sort(() => Math.random() - .5);
}

export default mission({
  title: 'لوحة الميل', icon: '📐', who, rounds: 6, make, draw,
  intro: ['أنا خليل، مدرّب التزلج. المبتدئ يبدأ بالمنحدر اللطيف، والخبير بالشديد.', 'أكتب ميل كل منحدر على لوحته: كم يرتفع أو ينخفض لكل خطوة أفقية؟'],
  outro: ['أحسنت! صارت لوحات الميل كلها صحيحة.', 'تحدي ميل الخط المستقيم.'],
  challenge: { title: 'تحدي الميل', make: challenge }
});
export const ROUNDS = 6;
export { make, challenge };
