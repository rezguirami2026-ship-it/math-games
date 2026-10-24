// ١٣-٢ استخدام الإحصاء — «نشرة الطقس»: المذيع منصور يختار أنسب مقياس لكل خبر: المنوال للأكثر حدوثاً، والوسيط حين توجد قيم متطرفة،
// والوسط الحسابي حين لا توجد، والمدى لانتشار البيانات؛ وأثر تصحيح قراءة خاطئة، وأي مجموعتين أكثر تنوعاً. التحدي: ٨ أسئلة من 8Dp1 (الكتاب ص٨٥–٨٦).
import { mission } from '../../mission.js';
import { N, R, eq } from '../../math.js';
import { choice, num, tf } from '../../../missions/challenge.js';
import { skyBg, say, glow, readings, SKY } from './art.js';

const who = { name: 'مذيع النشرة منصور', face: '🎙️', id: 'mansour' };
const pick = a => a[Math.floor(Math.random() * a.length)];
const sorted = a => a.slice().sort((x, y) => x - y);
const median = a => { const s = sorted(a), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
const OPTS = ['المنوال', 'الوسيط', 'الوسط الحسابي', 'المدى'];

function draw(g, w, h, t, S) {
  const r = S.r ? S.r.data : {}; skyBg(g, w, h, t);
  g.fillStyle = '#0F172A'; g.beginPath(); g.roundRect(w * .06, h * .34, w * .88, h * .46, 14); g.fill(); g.fillStyle = '#DC2626'; g.fillRect(w * .06, h * .34, w * .2, 26); say(g, 'نشرة الطقس', w * .16, h * .34 + 19, 14, '#FFFFFF', 900);
  say(g, r.title || '', w * .6, h * .34 + 19, 15, '#E2E8F0', 900);
  if (r.vals) readings(g, w * .1, h * .46, w * .8, r.vals, { hl: S.done ? r.hl || [] : [], unit: '' });
  say(g, S.done ? r.ans : r.ask || '', w * .5, h * .74, 17, S.done ? '#86EFAC' : '#FDE68A', 900);
  glow(g, w, h, S);
}
const pickQ = (q, right, data, hint, badTxt) => ({ q, input: { type: 'pick', opts: OPTS }, ok: v => v === right, hint, bad: v => badTxt[v] || 'فكّر: ماذا يريد الخبر أن يعرف عن البيانات؟', good: `${OPTS[right]}`, data: { ...data, ans: `الأنسب: ${OPTS[right]}` } });

function make(i) {
  if (i === 0) { const [what, vals] = pick([['اتجاه الرياح الأكثر هبوباً هذا الشهر', ['شمال', 'غرب', 'شمال', 'شرق', 'شمال', 'جنوب', 'غرب']], ['مقاس المظلات الأكثر بيعاً في المحطة', [36, 38, 40, 38, 42, 38, 40]], ['نوع الطقس الأكثر تكراراً في أبريل', ['مشمس', 'غائم', 'مشمس', 'ممطر', 'مشمس', 'مشمس', 'غائم']]]);
    return pickQ(`يريد منصور أن يذيع ${what}. أي مقياس يختار؟`, 0, { title: what, vals: vals.map(v => typeof v === 'number' ? v : v), ask: 'أي مقياس؟' }, 'هل يريد قيمة متوسطة أم القيمة الأكثر حدوثاً؟', { 1: 'الوسيط قيمة وسطى، والخبر عن الأكثر حدوثاً.', 2: 'الوسط الحسابي لا يصلح للبيانات غير العددية أو الأكثر تكراراً.', 3: 'المدى يقيس الانتشار لا الأكثر حدوثاً.' }); }
  if (i === 1) { let vals; do { vals = Array.from({ length: 9 }, () => R(16, 24)); vals[R(0, 8)] = R(38, 45); } while (new Set(vals).size < 6);
    return pickQ('أعمار فريق المحطة في الرسم، وبينهم المدير الأكبر سناً بكثير. أي متوسط يصف عمر الفريق أفضل؟', 1, { title: 'أعمار فريق المحطة', vals, ask: 'أي متوسط؟', hl: [] }, 'هل توجد قيمة متطرفة؟ أي المتوسطات يتأثر بها كثيراً؟', { 0: 'المنوال قد لا يكون في الوسط أصلاً.', 2: 'الوسط الحسابي يتأثر كثيراً بالقيمة المتطرفة.', 3: 'المدى ليس متوسطاً.' }); }
  if (i === 2) { let vals; do { vals = Array.from({ length: 8 }, () => R(10, 30)); vals[R(0, 7)] = R(60, 90); } while (median(vals) % .5); const m = median(vals);
    return { q: `سرعات الرياح في ثمانية أيام: ${vals.map(N).join('، ')}، وفي أحدها عاصفة. ما الوسيط؟`, input: { type: 'num', dot: true }, sol: m, ok: v => eq(v, m),
      hint: 'رتّب القراءات: عددها زوجي، فخذ القيمتين الوسطيين وأوجد متوسطهما.', bad: v => eq(v, vals.reduce((a, b) => a + b, 0) / 8) ? 'هذا الوسط الحسابي.' : '',
      good: `الوسيط ${N(m)}، ولم تؤثر فيه العاصفة`, data: { title: 'سرعات الرياح', vals: sorted(vals), hl: [3, 4], ask: 'الوسيط = ؟', ans: `الوسيط = ${N(m)}` } }; }
  if (i === 3) { let a, b; do { a = Array.from({ length: 6 }, () => R(20, 30)); b = Array.from({ length: 6 }, () => R(10, 42)); } while (Math.max(...b) - Math.min(...b) - (Math.max(...a) - Math.min(...a)) < 6);
    const sw = Math.random() < .5, [p, q] = sw ? [b, a] : [a, b], more = sw ? 0 : 1;
    return { q: `درجات الحرارة في مدينتين لستة أيام: الأولى ${p.map(N).join('، ')} والثانية ${q.map(N).join('، ')}. أي المدينتين درجات حرارتها أكثر تنوعاً؟`, input: { type: 'pick', opts: ['الأولى', 'الثانية'] }, ok: v => v === more,
      hint: 'أي مقياس يصف التنوع أو الانتشار؟ احسبه للمدينتين.', bad: () => 'قارن المدى: الأكبر − الأصغر لكل مدينة.',
      good: `المدى: ${N(Math.max(...p) - Math.min(...p))} و${N(Math.max(...q) - Math.min(...q))}`, data: { title: 'مدينتان', vals: p, ask: 'أيهما أكثر تنوعاً؟', ans: `الأكثر تنوعاً: ${['الأولى', 'الثانية'][more]}` } }; }
  if (i === 4) { return pickQ('تغيّرت قراءة واحدة فقط من قراءات الأسبوع وبقي ترتيبها في الوسط كما هو. أي مقياس يتغيّر حتماً؟', 2, { title: 'قراءة تغيّرت', ask: 'أي مقياس يتغيّر؟' }, 'أي المقاييس يعتمد على كل قيمة من القيم؟', { 0: 'المنوال قد لا يتغيّر.', 1: 'الوسيط قد لا يتغيّر إن بقي ترتيب الوسط.', 3: 'المدى لا يتغيّر إلا إن تغيّرت أكبر قيمة أو أصغرها.' }); }
  let vals, n = 8; do vals = Array.from({ length: n }, () => R(10, 35)); while (vals.reduce((a, b) => a + b, 0) % n);
  const wrongV = pick([35, 25, 31]), rightV = Number(String(wrongV).split('').reverse().join('')), k = R(0, n - 1); vals[k] = wrongV; const sum = vals.reduce((a, b) => a + b, 0), fixed = (sum - wrongV + rightV) / n;
  return { q: `قراءات ثمانية أيام مجموعها ${N(sum)}، واكتُشف أن القراءة ${N(wrongV)} صحيحها ${N(rightV)}. ما الوسط الحسابي الصحيح؟`, input: { type: 'num', dot: true }, sol: fixed, ok: v => eq(v, fixed),
    hint: 'كيف يتغير المجموع حين تصحح القراءة؟ ثم اقسم على عدد الأيام.', bad: v => eq(v, sum / n) ? 'هذا الوسط قبل التصحيح.' : '',
    good: `(${N(sum)} − ${N(wrongV)} + ${N(rightV)}) ÷ ٨ = ${N(fixed)}`, data: { title: 'تصحيح قراءة', vals, ask: 'الوسط الصحيح = ؟', ans: `الوسط = ${N(fixed)}` } };
}

function challenge() {
  const items = [];
  items.push(choice('لمعرفة مقاس الحذاء الأكثر بيعاً نستعمل:', 'المنوال', ['الوسط الحسابي', 'المدى', 'الوسيط'], 'الأكثر حدوثاً.', '8Dp1'));
  items.push(choice('في بيانات فيها قيمة متطرفة كبيرة، أنسب متوسط غالباً:', 'الوسيط', ['الوسط الحسابي', 'المدى', 'المجموع'], 'أيها لا يتأثر كثيراً بالمتطرف؟', '8Dp1'));
  items.push(choice('لوصف انتشار البيانات نستعمل:', 'المدى', ['المنوال', 'الوسيط', 'الوسط الحسابي'], 'الأكبر − الأصغر.', '8Dp1'));
  items.push(tf('يتأثر الوسط الحسابي بكل قيمة في البيانات.', true, 'هو المجموع ÷ العدد.', '8Dp1', 'تغيّر أي قيمة يغيّر المجموع.'));
  items.push(tf('الوسيط يتغير كثيراً إذا أضفنا قيمة متطرفة جداً.', false, 'جرّب مثالاً.', '8Dp1', 'يتحرك قليلاً فقط.'));
  items.push(num('أعمار: ١٦، ١٧، ١٨، ١٨، ١٩، ٢٠، ٢٠، ٢١، ٢١، ٣٢، ٤١. ما الوسيط؟', 20, 'القيمة السادسة.', '8Dp1'));
  { const [a, b] = [R(10, 20), R(30, 45)]; items.push(num(`أكبر قراءة ${N(b)} وأصغر قراءة ${N(a)}. ما المدى؟`, b - a, 'الفرق.', '8Dp1')); }
  items.push(choice('أرباح تجار: ٢٣٠٠٠ و٢٦٠٠٠ و٢٩٠٠٠ و٣٠٠٠٠ و٥٩٠٠٠. أنسب متوسط:', 'الوسيط', ['المنوال', 'المدى', 'أكبر قيمة'], 'هل توجد قيمة بعيدة؟', '8Dp1'));
  return items.sort(() => Math.random() - .5);
}

export default mission({
  title: 'نشرة الطقس', icon: '🎙️', who, rounds: 6, make, draw,
  intro: ['أنا منصور، مذيع نشرة الطقس. كل خبر يحتاج رقماً واحداً يلخّص البيانات.', 'لكن أي رقم؟ المنوال أم الوسيط أم الوسط الحسابي؟ أم المدى؟ الاختيار الصحيح يجعل الخبر صادقاً!'],
  outro: ['ممتاز! النشرة جاهزة، وكل رقم في مكانه.', 'تحدي استخدام الإحصاء.'],
  challenge: { title: 'تحدي اختيار المقياس', make: challenge }
});
export const ROUNDS = 6;
export { make, challenge };
