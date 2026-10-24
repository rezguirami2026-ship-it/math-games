// ١٥-٤ تفسير الرسوم البيانية الخطية ورسمها — «سجل القطيع»: الباحث ناصر يسجّل عدد المها في المحمية شهراً بعد شهر بالرسم البياني الخطي:
// قراءة قيمة شهر، وأكبر زيادة بين شهرين متتاليين، والاتجاه العام، وأكبر قيمة، ورسم نقطة الشهر الأخير على الشبكة. التحدي: ٨ أسئلة من 8Pt5 (الكتاب ص١١٧–١١٨).
import { mission } from '../../mission.js';
import { N, R } from '../../math.js';
import { choice, num, tf } from '../../../missions/challenge.js';
import { plainBg, say, glow, axes, polyline } from './art.js';

const who = { name: 'الباحث ناصر', face: '🧑🏽‍🔬', id: 'nasser8' };
const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'];
const series = () => { let v = R(4, 8); return MONTHS.map(() => { const x = v; v = Math.max(1, Math.min(18, v + R(-2, 4))); return x; }); };

function draw(g, w, h, t, S) {
  const r = S.r ? S.r.data : {}; plainBg(g, w, h, t);
  const A = axes(g, w * .14, h * .44, w * .78, h * .44, 20, MONTHS, { yl: 'عدد المها', title: 'عدد المها في المحمية' });
  const v = r.hideLast && !S.done ? r.v.slice(0, -1) : r.v; polyline(g, A, v, '#4D7C0F');
  glow(g, w, h, S);
}

function make(i) {
  let v; do v = series(); while (new Set(v.slice(1).map((x, k) => x - v[k])).size < 3);
  if (i === 0) { const k = R(0, 5);
    return { q: `كم كان عدد المها في شهر ${MONTHS[k]}؟`, input: { type: 'num' }, sol: v[k], ok: x => x === v[k], hint: 'ابحث عن نقطة الشهر واقرأ ارتفاعها على المحور الرأسي.', bad: () => '', good: `${N(v[k])}`, data: { v } }; }
  if (i === 1) { const d = v.slice(1).map((x, k) => x - v[k]), k = d.indexOf(Math.max(...d)); if (d.filter(x => x === d[k]).length > 1 || d[k] <= 0) return make(1);
    return { q: 'بين أي شهرين متتاليين كانت أكبر زيادة في عدد المها؟', input: { type: 'pick', opts: MONTHS.slice(1).map((m, j) => `${MONTHS[j]} و${m}`) }, ok: x => x === k,
      hint: 'أين يصعد الخط بأشد ميل؟', bad: () => 'قارن الزيادة بين كل شهرين متتاليين.', good: `زاد ${N(d[k])} بين ${MONTHS[k]} و${MONTHS[k + 1]}`, data: { v } }; }
  if (i === 2) { const up = v[5] > v[0] + 2, down = v[5] < v[0] - 2, k = up ? 0 : down ? 1 : 2;
    return { q: 'ما الاتجاه العام لعدد المها خلال الأشهر الستة؟', input: { type: 'pick', opts: ['يزداد', 'يتناقص', 'يبقى تقريباً كما هو'] }, ok: x => x === k,
      hint: 'قارن بداية الخط بنهايته، ولا تهتم كثيراً بالتغيرات الصغيرة بينهما.', bad: () => 'انظر إلى الصورة العامة من البداية إلى النهاية.', good: ['يزداد', 'يتناقص', 'ثابت تقريباً'][k], data: { v } }; }
  if (i === 3) { const m = Math.max(...v), k = v.indexOf(m);
    return { q: 'ما أكبر عدد للمها سُجّل في هذه الأشهر؟', input: { type: 'num' }, sol: m, ok: x => x === m, hint: 'ابحث عن أعلى نقطة في الرسم.', bad: x => x === k + 1 ? 'هذا رقم الشهر: المطلوب العدد.' : '', good: `${N(m)} في ${MONTHS[k]}`, data: { v } }; }
  if (i === 4) { const d = v[5] - v[4];
    return { q: `كم تغيّر عدد المها بين ${MONTHS[4]} و${MONTHS[5]}؟ اكتب الزيادة موجبة والنقص سالباً.`, input: { type: 'num', neg: true }, sol: d, ok: x => x === d, hint: 'اطرح عدد الشهر الأول من عدد الشهر الثاني.', bad: x => x === -d && d ? 'راجع الإشارة: هل زاد أم نقص؟' : '', good: `${N(v[5])} − ${N(v[4])} = ${N(d)}`, data: { v } }; }
  return { q: `سُجّل في ${MONTHS[5]} ${N(v[5])} مها. انقر النقطة لترسمها على الرسم البياني.`, input: { type: 'grid', x0: 0, x1: 5, y0: 0, y1: 20, n: 1, segs: v.slice(0, 5).slice(1).map((y, k) => [[k, v[k]], [k + 1, y]]) }, sol: [[5, v[5]]], ok: x => x[0][0] === 5 && x[0][1] === v[5],
    hint: `ابحث عن عمود ${MONTHS[5]} على المحور الأفقي، ثم ارتفع إلى العدد.`, bad: x => x[0][0] !== 5 ? `هذا ليس عمود ${MONTHS[5]}.` : 'راجع الارتفاع على المحور الرأسي.', good: `(${MONTHS[5]}، ${N(v[5])})`, data: { v, hideLast: 1 } };
}

function challenge() {
  const items = [];
  items.push(choice('يُستعمل الرسم البياني الخطي غالباً لعرض:', 'تغيّر قيمة مع الزمن', ['أجزاء من كل', 'تكرار فئات منفصلة', 'ترتيب القيم'], 'الأشهر والسنوات.', '8Pt5'));
  items.push(choice('الجزء الصاعد بشدة في الرسم الخطي يعني:', 'زيادة كبيرة', ['نقصاً كبيراً', 'ثباتاً', 'توقفاً'], 'الصعود = زيادة.', '8Pt5'));
  items.push(tf('في الرسم الخطي يوضع الزمن عادة على المحور الأفقي.', true, 'الأشهر في الأسفل.', '8Pt5', 'والقيمة على الرأسي.'));
  items.push(tf('إذا نزل الخط من نقطة إلى التالية فالقيمة زادت.', false, 'ماذا يعني النزول؟', '8Pt5', 'النزول = نقص.'));
  items.push(num('عدد المها: يناير ٦، فبراير ٩. كم الزيادة؟', 3, '٩ − ٦.', '8Pt5'));
  items.push(num('عدد المها: مارس ١٢، أبريل ٨. اكتب التغيّر بإشارته.', -4, '٨ − ١٢.', '8Pt5', { neg: true }));
  items.push(choice('الاتجاه العام لقيم ٤، ٦، ٥، ٨، ٩، ١١:', 'يزداد', ['يتناقص', 'ثابت'], 'قارن البداية بالنهاية.', '8Pt5'));
  items.push(num('قيم: ٤، ٧، ٦، ١٠، ٩. ما أكبر قيمة؟', 10, 'أعلى نقطة.', '8Pt5'));
  return items.sort(() => Math.random() - .5);
}

export default mission({
  title: 'سجل القطيع', icon: '📉', who, rounds: 6, make, draw,
  intro: ['أنا ناصر، باحث المحمية. أعدّ المها كل شهر وأرسم العدد خطاً.', 'الخط يصعد حين يكبر القطيع وينزل حين يصغر… اقرأ معي قصة القطيع.'],
  outro: ['ممتاز! صرت تقرأ اتجاه القطيع من الخط.', 'تحدي الرسوم البيانية الخطية.'],
  challenge: { title: 'تحدي الرسم الخطي', make: challenge }
});
export const ROUNDS = 6;
export { make, challenge };
