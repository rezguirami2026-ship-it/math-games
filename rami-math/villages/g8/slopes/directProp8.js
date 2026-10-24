// ١١-٦ التناسب الطردي — «عدّاد التذاكر»: الصرّاف رامز يبيع تذاكر المصعد والعسل والكوابل. في التناسب الطردي يكون الرسم البياني مستقيماً يمر
// بنقطة الأصل، والصيغة ك = م × ل: الكلفة من الصيغة، وأي الصيغ تناسب طردي، والكمية من الكلفة (لأقرب منزلتين)، وآلة النسخ بالدقيقة،
// والزمن لعدد معلوم، والميل هو سعر الوحدة. التحدي: ٨ أسئلة من 8As5 (الكتاب ص٦١).
import { mission } from '../../mission.js';
import { N, R, eq } from '../../math.js';
import { choice, num, tf } from '../../../missions/challenge.js';
import { duneBg, say, glow, plane } from './art.js';

const who = { name: 'الصرّاف رامز', face: '🎟️', id: 'ramiz' };
const pick = a => a[Math.floor(Math.random() * a.length)];
const r2 = v => Math.round(v * 100) / 100, r3 = v => Math.round(v * 1000) / 1000;
const shuf = a => a.map(v => [Math.random(), v]).sort((p, q) => p[0] - q[0]).map(x => x[1]);

function draw(g, w, h, t, S) {
  const r = S.r ? S.r.data : {}; duneBg(g, w, h, t);
  const s = Math.min(w * .5, h * .72), x = w * .5 - s / 2, y = h * .12;
  plane(g, x, y, s, 0, 10, { lines: r.m != null ? [{ m: r.m * (r.scale || 1), c: 0 }] : [], lab: 2 });
  if (r.f) say(g, r.f, w * .5, h * .07, 17, '#7C3AED', 900);
  say(g, S.done ? r.ans : r.ask || '', w * .5, h * .95, 17, S.done ? '#15803D' : '#7C2D12', 900);
  glow(g, w, h, S);
}

function make(i) {
  if (i === 0) { const p = pick([2.85, 1.25, 6.2, 0.75, 3.4]), l = R(3, 40), ans = r3(p * l);
    return { q: `ثمن لتر العسل في كشك المنتجع ${N(p)} ريال، والصيغة ك = ${N(p)} ل حيث ك الكلفة بالريال ول عدد اللترات. كم ريالاً ثمن ${N(l)} لتراً؟`, input: { type: 'num', dot: true, calc: true }, sol: ans, ok: v => eq(v, ans),
      hint: 'عوّض بعدد اللترات مكان ل في الصيغة.', bad: v => eq(v, r3(l / p)) ? 'الصيغة تضرب لا تقسم.' : '',
      good: `ك = ${N(p)} × ${N(l)} = ${N(ans)}`, data: { f: `ك = ${N(p)} ل`, m: p, scale: .2, ask: `ل = ${N(l)} ← ك = ؟`, ans: `ك = ${N(ans)} ريال` } }; }
  if (i === 1) { const k = R(2, 9), right = `ص = ${N(k)}س`, opts = shuf([right, `ص = ${N(k)}س + ${N(R(1, 5))}`, `ص = ${N(k)} − س`, `ص = ${N(k)}`]);
    return { q: 'أي صيغة تمثل تناسباً طردياً بين س وص؟', input: { type: 'pick', opts }, ok: v => opts[v] === right,
      hint: 'رسم التناسب الطردي مستقيم يمر بنقطة الأصل: عوّض س = ٠، كم يصير ص؟', bad: () => 'عوّض س = ٠: هل يكون ص = ٠ أيضاً؟',
      good: right, data: { m: k, scale: .1, ask: 'أي صيغة؟', ans: right } }; }
  if (i === 2) { const p = pick([2.85, 1.35, 3.4, 2.4]); let c, k = 0; do c = R(5, 60) * 10; while (eq(r2(c / p), c / p) && ++k < 50); const ans = r2(c / p);
    return { q: `ثمن لتر العسل ${N(p)} ريال. كم لتراً يمكن شراؤها بمبلغ ${N(c)} ريال لأقرب منزلتين عشريتين؟`, input: { type: 'num', dot: true, calc: true }, sol: ans, ok: v => eq(v, ans),
      hint: 'عوّض بالكلفة مكان ك في ك = ' + N(p) + ' ل، ثم أوجد ل.', bad: v => eq(v, r2(c * p)) ? 'هنا تقسم الكلفة على سعر اللتر.' : '',
      good: `ل = ${N(c)} ÷ ${N(p)} ≈ ${N(ans)}`, data: { f: `ك = ${N(p)} ل`, m: p, scale: .2, ask: `ك = ${N(c)} ← ل = ؟`, ans: `ل ≈ ${N(ans)} لتر` } }; }
  if (i === 3) { const k = pick([12, 16, 20, 24]), d = pick([5, 7.5, 3, 4.5, 6]), ans = k * d;
    return { q: `تنسخ آلة التذاكر ${N(k)} تذكرة في الدقيقة. كم تذكرة تنسخ في ${N(d)} ${Number.isInteger(d) ? 'دقائق' : 'دقيقة'}؟`, input: { type: 'num', dot: true }, sol: ans, ok: v => eq(v, ans),
      hint: 'الصيغة ص = ' + N(k) + ' د. عوّض بعدد الدقائق.', bad: v => eq(v, k + d) ? 'العلاقة ضرب لا جمع.' : '',
      good: `ص = ${N(k)} × ${N(d)} = ${N(ans)}`, data: { f: `ص = ${N(k)} د`, m: k, scale: .05, ask: `د = ${N(d)} ← ص = ؟`, ans: `${N(ans)} تذكرة` } }; }
  if (i === 4) { const k = pick([16, 20, 24, 12]); let n; do n = R(5, 40) * 6; while (n % k === 0 || !eq(r2(n / k), n / k)); const ans = n / k;
    return { q: `تنسخ آلة التذاكر ${N(k)} تذكرة في الدقيقة. كم دقيقة تحتاج لنسخ ${N(n)} تذكرة؟`, input: { type: 'num', dot: true }, sol: ans, ok: v => eq(v, ans),
      hint: 'عوّض بعدد التذاكر مكان ص في ص = ' + N(k) + ' د، ثم أوجد د.', bad: v => eq(v, n * k) ? 'هنا تقسم لا تضرب.' : '',
      good: `د = ${N(n)} ÷ ${N(k)} = ${N(ans)}`, data: { f: `ص = ${N(k)} د`, m: k, scale: .05, ask: `ص = ${N(n)} ← د = ؟`, ans: `${N(ans)} دقيقة` } }; }
  const p = pick([6.2, 2.5, 4.8, 1.75]);
  return { q: `تكلفة كابل المصعد ${N(p)} ريال للمتر، والصيغة ك = ${N(p)} م. ما ميل الرسم البياني لهذه الصيغة؟`, input: { type: 'num', dot: true }, sol: p, ok: v => eq(v, p),
    hint: 'في الصورة ص = م س، الميل هو العدد المضروب في المتغير. ماذا يعني الميل هنا؟', bad: v => eq(v, 1 / p) ? 'الميل = الكلفة لكل متر.' : '',
    good: `الميل ${N(p)}: كلفة المتر الواحد`, data: { f: `ك = ${N(p)} م`, m: p, scale: .2, ask: 'الميل = ؟', ans: `الميل = ${N(p)}` } };
}

function challenge() {
  const items = [], used = new Set(), fresh = f => { for (let k = 0; k < 60; k++) { const x = f(); const s = JSON.stringify(x); if (!used.has(s)) { used.add(s); return x; } } return f(); };
  items.push(tf('الرسم البياني للتناسب الطردي مستقيم يمر بنقطة الأصل.', true, 'إذا كانت الكمية الأولى صفراً؟', '8As5', 'عند ٠ تكون الثانية ٠.'));
  items.push(tf('الصيغة ص = ٣س + ٢ تمثل تناسباً طردياً.', false, 'عوّض س = ٠.', '8As5', 'لا تمر بنقطة الأصل.'));
  { const [p, l] = fresh(() => [pick([2.85, 1.5, 4]), R(2, 20)]); items.push(num(`ك = ${N(p)} ل. ما ك عندما ل = ${N(l)}؟`, r3(p * l), 'عوّض.', '8As5', { dot: true })); }
  { const [k, n] = fresh(() => [pick([16, 20]), pick([80, 160, 240])]); items.push(num(`آلة تنسخ ${N(k)} صفحة في الدقيقة. كم دقيقة لنسخ ${N(n)} صفحة؟`, n / k, 'اقسم.', '8As5', { dot: true })); }
  { const p = fresh(() => pick([6.2, 2.5, 3.75])); items.push(choice(`ميل الرسم البياني للصيغة ك = ${N(p)} م:`, N(p), [N(r3(1 / p)), '٠', N(p + 1)], 'العدد المضروب في م.', '8As5')); }
  items.push(choice('أي الجداول يمثل تناسباً طردياً؟', 'س: ١، ٢، ٣ — ص: ٤، ٨، ١٢', ['س: ١، ٢، ٣ — ص: ٤، ٥، ٦', 'س: ١، ٢، ٣ — ص: ٣، ٢، ١', 'س: ١، ٢، ٣ — ص: ٥، ٩، ١٣'], 'هل ص ÷ س ثابت؟', '8As5'));
  { const [p, c] = fresh(() => [pick([2.5, 4, 1.25]), pick([50, 100, 200])]); items.push(num(`ك = ${N(p)} ل. كم ل عندما ك = ${N(c)}؟`, r3(c / p), 'اقسم الكلفة على السعر.', '8As5', { dot: true })); }
  { const k = fresh(() => pick([12, 16, 18])); items.push(num(`آلة تنسخ ${N(k)} صفحة في الدقيقة. كم صفحة في دقيقتين ونصف؟`, k * 2.5, 'دقيقتان ونصف = ٢٫٥.', '8As5', { dot: true })); }
  return items.sort(() => Math.random() - .5);
}

export default mission({
  title: 'عدّاد التذاكر', icon: '🎟️', who, rounds: 6, make, draw,
  intro: ['أنا رامز، صرّاف المنتجع. كل شيء عندي بسعر للوحدة.', 'لترين بضعف ثمن لتر، وثلاث دقائق بثلاثة أضعاف… هذا تناسب طردي، ورسمه مستقيم يبدأ من الصفر!'],
  outro: ['ممتاز! العدّاد يحسب كل شيء بالصيغة.', 'تحدي التناسب الطردي.'],
  challenge: { title: 'تحدي التناسب الطردي', make: challenge }
});
export const ROUNDS = 6;
export { make, challenge };
