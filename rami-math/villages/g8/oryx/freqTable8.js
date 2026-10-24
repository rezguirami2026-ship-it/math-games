// ١٥-١ استخدام الجدول التكراري — «سجلّ الوزن»: الحارسة سلمى تزن صغار المها وتسجّلها في جدول تكراري بفئات متساوية المدى (٦٠ < ك ≤ ٧٠):
// في أي فئة تقع قيمة على حدّها، وتكرار كل فئة من قائمة الأوزان (فراغات للفئات)، والمجموع، وأكثر الفئات تكراراً، والجدول المزدوج للذكور والإناث.
// التحدي: ٨ أسئلة من 8Dc1 (الكتاب ص١٠٧–١٠٨).
import { mission } from '../../mission.js';
import { N, R } from '../../math.js';
import { choice, num, tf } from '../../../missions/challenge.js';
import { plainBg, say, glow, cls, OLIVE } from './art.js';

const who = { name: 'الحارسة سلمى', face: '👩🏽‍🌾', id: 'salma8' };
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuf = a => a.map(v => [Math.random(), v]).sort((p, q) => p[0] - q[0]).map(x => x[1]);
const CL = [[10, 20], [20, 30], [30, 40], [40, 50]];
const classOf = v => CL.findIndex(([a, b]) => v > a && v <= b);

function draw(g, w, h, t, S) {
  const r = S.r ? S.r.data : {}; plainBg(g, w, h, t);
  g.fillStyle = 'rgba(255,255,255,.95)'; g.beginPath(); g.roundRect(w * .05, h * .38, w * .9, h * .56, 14); g.fill(); g.strokeStyle = OLIVE; g.lineWidth = 3; g.stroke();
  say(g, '📒 ' + (r.title || 'سجلّ الوزن'), w * .5, h * .46, 17, OLIVE, 900);
  if (r.vals) { const n = r.vals.length, per = Math.ceil(n / 2), cw = w * .82 / per; r.vals.forEach((v, k) => say(g, N(v), w * .91 - (k % per + .5) * cw, h * .56 + Math.floor(k / per) * 26, 15, '#334155', 800)); }
  if (r.rows) r.rows.forEach(([a, b], k) => { const y = h * (r.vals ? .7 : .55) + k * 22; say(g, a, w * .66, y, 14, '#334155', 800); say(g, S.done || b !== '؟' ? (b === '؟' ? r.fill[k] : b) : '؟', w * .3, y, 14, b === '؟' ? '#DC2626' : '#334155', 900); });
  glow(g, w, h, S);
}

function make(i) {
  if (i === 0) { const [a, b] = pick(CL), v = a === CL[0][0] ? b : pick([a, b]), right = classOf(v);   // ١٠ نفسها خارج الفئات
    const opts = CL.map(([p, q]) => cls(p, q));
    return { q: `وزن مهاة صغيرة ${N(v)} كغم. في أي فئة تُسجَّل؟`, input: { type: 'pick', opts }, ok: x => x === right,
      hint: 'الرمز < يعني «أكبر من» دون مساواة، و≤ يعني «أصغر من أو يساوي». هل العدد نفسه داخل الفئة؟', bad: () => 'انتبه لحدّي الفئة: أيهما يشمل العدد وأيهما لا يشمله؟',
      good: `${N(v)} ← ${opts[right]}`, data: { title: 'فئة الوزن', rows: CL.map(([p, q], k) => [cls(p, q), k === right ? '✓' : '']) } }; }
  if (i === 1 || i === 2) { let vals; do vals = Array.from({ length: 16 }, () => R(11, 50)); while (CL.some((_, k) => !vals.some(v => classOf(v) === k)));
    const fr = CL.map((_, k) => vals.filter(v => classOf(v) === k).length);
    if (i === 1) return { q: 'سجّلت سلمى أوزان ١٦ مهاة صغيرة. اكتب تكرار كل فئة.', input: { type: 'blanks', tpl: CL.map(([a, b]) => `${cls(a, b)}: {}`).join(' ، ') }, sol: fr, ok: x => x.every((f, k) => f === fr[k]),
      hint: 'خذ الأوزان واحداً واحداً وضع علامة عدّ في فئته. تحقق: المجموع ١٦.', bad: x => x.reduce((a, b) => a + b, 0) !== 16 ? `مجموع تكراراتك ${N(x.reduce((a, b) => a + b, 0))}: يجب أن يكون ١٦.` : 'المجموع صحيح لكن بعض الأوزان في غير فئتها: انتبه للحدود.',
      good: fr.map(N).join(' ، '), data: { title: 'أوزان المها', vals, rows: CL.map(([a, b], k) => [cls(a, b), '؟']), fill: fr.map(N) } };
    const top = fr.indexOf(Math.max(...fr)); if (fr.filter(f => f === fr[top]).length > 1) return make(2);
    return { q: 'من أوزان المها الستة عشر، أي فئة لها أكبر تكرار؟', input: { type: 'pick', opts: CL.map(([a, b]) => cls(a, b)) }, ok: x => x === top,
      hint: 'عدّ الأوزان في كل فئة، ثم قارن.', bad: () => 'عدّ مرة أخرى بعلامات العدّ.', good: `${cls(...CL[top])}: ${N(fr[top])}`, data: { title: 'أكثر فئة', vals, rows: CL.map(([a, b], k) => [cls(a, b), k === top ? '؟' : '']), fill: CL.map((_, k) => k === top ? N(fr[k]) : '') } }; }
  if (i === 3) { const fr = CL.map(() => R(2, 9)), tot = fr.reduce((a, b) => a + b, 0);
    return { q: `جدول أطوال قرون المها بالسنتيمتر: التكرارات ${fr.map(N).join(' و')} للفئات الأربع. كم مهاة قيست قرونها؟`, input: { type: 'num' }, sol: tot, ok: x => x === tot,
      hint: 'كل مهاة في فئة واحدة فقط: ماذا تفعل بالتكرارات؟', bad: () => '', good: `${fr.map(N).join(' + ')} = ${N(tot)}`, data: { title: 'أطوال القرون', rows: [...CL.map(([a, b], k) => [cls(a, b, 'ط'), N(fr[k])]), ['الإجمالي', '؟']], fill: [...fr.map(N), N(tot)] } }; }
  if (i === 4) { const m = [R(3, 12), R(3, 12)], f = [R(3, 12), R(3, 12)], k = R(0, 3), Q = [['الذكور البالغين', m[0]], ['الذكور الصغار', m[1]], ['الإناث البالغات', f[0]], ['الإناث الصغيرات', f[1]]][k];
    return { q: `جدول مزدوج للمها في الحظيرة: الذكور ${N(m[0] + m[1])} منها ${N(m[0])} بالغة، والإناث ${N(f[0] + f[1])} منها ${N(f[0])} بالغة. كم عدد ${Q[0]}؟`, input: { type: 'num' }, sol: Q[1], ok: x => x === Q[1],
      hint: 'ارسم الجدول المزدوج: صفان (ذكور وإناث) وعمودان (بالغ وصغير). أي خانة المطلوبة؟', bad: x => x === m[0] + m[1] || x === f[0] + f[1] ? 'هذا إجمالي صف كامل.' : '',
      good: `${Q[0]}: ${N(Q[1])}`, data: { title: 'جدول مزدوج', rows: [['ذكور: بالغ / صغير', `${N(m[0])} / ${k === 1 ? '؟' : N(m[1])}`], ['إناث: بالغة / صغيرة', `${N(f[0])} / ${k === 3 ? '؟' : N(f[1])}`]], fill: [`${N(m[0])} / ${N(m[1])}`, `${N(f[0])} / ${N(f[1])}`] } }; }
  const [a, b] = pick(CL), right = `${N(a)} < ك ≤ ${N(b)}`, opts = shuf([right, `${N(a)} ≤ ك ≤ ${N(b)}`, `${N(a)} < ك < ${N(b)}`, `${N(a)} ≤ ك < ${N(b)}`]);
  return { q: `فئة تبدأ بعد ${N(a)} كغم وتشمل ${N(b)} كغم نفسها. كيف تُكتب بالرموز؟`, input: { type: 'pick', opts }, ok: x => opts[x] === right,
    hint: 'هل العدد الأول من الفئة؟ وهل العدد الثاني منها؟ اختر الرمز المناسب لكل طرف.', bad: () => '< لا تشمل العدد، و≤ تشمله.', good: right, data: { title: 'كتابة الفئة', rows: [[right, '']] } };
}

function challenge() {
  const items = [];
  items.push(choice('الفئة ٦٣ < ك ≤ ٦٥ تعني أن الكتلة:', 'أكبر من ٦٣ وأصغر من أو تساوي ٦٥', ['أكبر من أو تساوي ٦٣ وأصغر من ٦٥', 'بين ٦٣ و٦٥ دون الطرفين', 'تساوي ٦٣ أو ٦٥'], 'اقرأ الرمزين.', '8Dc1'));
  items.push(choice('في أي فئة تُسجَّل الكتلة ٧٠ كغم؟', '٦٠ < ك ≤ ٧٠', ['٧٠ < ك ≤ ٨٠', 'في الفئتين', 'لا تُسجَّل'], '≤ تشمل ٧٠.', '8Dc1'));
  items.push(num('تكرارات الفئات: ٣ و٨ و٦ و٣. كم القيم كلها؟', 20, 'اجمع.', '8Dc1'));
  items.push(tf('الجدول المزدوج يسجّل مجموعتين أو أكثر من البيانات المنفصلة.', true, 'صفوف وأعمدة.', '8Dc1', 'مثل الذكور والإناث.'));
  items.push(tf('في الجدول التكراري بفئات متساوية المدى، يكون مدى الفئات مختلفاً.', false, 'ماذا تعني متساوية؟', '8Dc1', 'كل الفئات بالطول نفسه.'));
  items.push(num('كم قيمة من القيم ٦٢، ٦٦، ٧٠، ٧١، ٧٤ تقع في الفئة ٦٠ < ك ≤ ٧٠؟', 3, '٧٠ داخلها.', '8Dc1'));
  items.push(choice('الغرض من عمود علامات العدّ:', 'تسجيل كل قيمة قبل حساب التكرار', ['حساب المتوسط', 'رسم المخطط', 'ترتيب الفئات'], '|||| لكل قيمة.', '8Dc1'));
  items.push(num('جدول مزدوج: الذكور ٩ منهم ٤ صغار. كم ذكراً بالغاً؟', 5, '٩ − ٤.', '8Dc1'));
  return items.sort(() => Math.random() - .5);
}

export default mission({
  title: 'سجلّ الوزن', icon: '📒', who, rounds: 6, make, draw,
  intro: ['أهلاً بك في محمية المها! أنا سلمى، أزن صغار المها كل أسبوع.', 'الأوزان كثيرة ومتصلة… فأجمعها في فئات متساوية المدى في جدول تكراري. انتبه لحدّ كل فئة!'],
  outro: ['ممتاز! السجل منظم وكل وزن في فئته.', 'تحدي الجدول التكراري.'],
  challenge: { title: 'تحدي الجدول التكراري', make: challenge }
});
export const ROUNDS = 6;
export { make, challenge };
