// ٩-٢ المشاركة بالنسب — «تعاونية النسيج»: ميساء توزّع أرباح التعاونية وتكاليفها بنسبة محددة بخطوات الكتاب: مجموع الأجزاء، فقيمة
// الجزء الواحد، فنصيب كل شخص، ثم التحقق. أنصبة ثلاثة (فاتورة بثلاثة فراغات)، ونصيب واحد، والفرق بين نصيبين، والكل من نصيب معروف،
// والتوزيع بساعات العمل، وتغيّر النسبة. أكياس النقود تبقى «؟» حتى يحلّ الطالب. التحدي: ٨ أسئلة من 8Nf5 (الكتاب ص١٩–٢٠).
import { mission } from '../../mission.js';
import { N, R } from '../../math.js';
import { choice, num, tf } from '../../../missions/challenge.js';
import { dyeBg, say, glow, partsBar, bag, ratio, riyal, TEAL } from './art.js';

const who = { name: 'ميساء مديرة التعاونية', face: '👩🏽‍🦱', id: 'maysa' };
const pick = a => a[Math.floor(Math.random() * a.length)];
const NAMES = [['محمود', 'حمزة', 'عمر'], ['محسن', 'باسم', 'عمار'], ['مازن', 'علي', 'كمال'], ['سلمى', 'هند', 'ريم'], ['سعيد', 'حسين', 'أشرف']];
const COLS = ['#DC2626', '#2563EB', '#16A34A', '#F59E0B'];
const sum = a => a.reduce((x, y) => x + y, 0);
const r3 = () => { let s; do s = [R(1, 6), R(1, 6), R(1, 6)]; while (new Set(s).size < 3); return s; };

function draw(g, w, h, t, S) {
  const r = S.r ? S.r.data : {}; dyeBg(g, w, h, t);
  say(g, '🧶 ' + (r.title || 'أرباح التعاونية'), w * .5, h * .16, 18, TEAL, 900);
  if (r.total != null) say(g, r.total, w * .5, h * .27, 17, '#7C2D12', 900);
  const n = (r.parts || []).length;
  (r.names || []).forEach((nm, k) => { const x = w * .9 - (k + .5) * w * .8 / n; bag(g, x, h * .58, Math.min(80, w * .8 / n * .7), S.done || (r.known && r.known[k] != null) ? (r.known && r.known[k] != null ? r.known[k] : r.ans[k]) : '؟', COLS[k]); say(g, nm, x, h * .64, 15, '#334155', 900); });
  if (r.parts) partsBar(g, w * .1, h * .72, w * .8, r.parts, COLS.slice(0, n), [], { hh: 24 });
  say(g, `النسبة ${ratio(r.parts || [])}`, w * .5, h * .93, 16, TEAL, 900);
  glow(g, w, h, S);
}

function make(i) {
  const names = pick(NAMES);
  if (i === 0) { const p = r3(), u = R(5, 40), T = sum(p) * u, sh = p.map(v => v * u);
    return { q: `قسّم ${riyal(T)} بين ${names.join(' و')} بالنسبة ${ratio(p)} على الترتيب.`, input: { type: 'blanks', tpl: `${names[0]}: {} ، ${names[1]}: {} ، ${names[2]}: {}` }, sol: sh, ok: v => v.every((x, k) => x === sh[k]),
      hint: 'كم جزءاً في النسبة كلها؟ وكم قيمة الجزء الواحد؟', bad: v => sum(v) === T ? 'المجموع صحيح، لكن هل وزّعت بحسب النسبة؟' : v.every((x, k) => x === p[k] * Math.round(T / 3) / p[k]) ? 'لم تُقسم بالتساوي: لكل شخص عدد من الأجزاء.' : 'تحقق: هل مجموع الأنصبة يساوي المبلغ كله؟',
      good: `${N(T)} ÷ ${N(sum(p))} = ${N(u)} للجزء ← ${sh.map(N).join(' ، ')}`, data: { title: 'توزيع المبلغ', total: `${N(T)} ريال`, names, parts: p, ans: sh.map(N) } }; }
  if (i === 1) { const p = r3(), u = R(6, 30), T = sum(p) * u, k = R(0, 2);
    return { q: `يتشارك ${names.join(' و')} في فاتورة الكهرباء بالنسبة ${ratio(p)}. الفاتورة ${riyal(T)}. كم ريالاً يدفع ${names[k]}؟`, input: { type: 'num' }, sol: p[k] * u, ok: v => v === p[k] * u,
      hint: 'ما قيمة الجزء الواحد؟ وكم جزءاً لـ' + names[k] + '؟', bad: v => v === Math.round(T / 3) ? 'لم يُقسم المبلغ بالتساوي.' : v === u ? 'هذه قيمة الجزء الواحد فقط.' : '',
      good: `${N(T)} ÷ ${N(sum(p))} × ${N(p[k])} = ${N(p[k] * u)}`, data: { title: 'فاتورة الكهرباء', total: `${N(T)} ريال`, names, parts: p, ans: p.map(v => N(v * u)) } }; }
  if (i === 2) { const p = r3(), u = R(10, 30), T = sum(p) * u; let a, b; do { a = R(0, 2); b = R(0, 2); } while (a === b || p[a] === p[b]); const [hi, lo] = p[a] > p[b] ? [a, b] : [b, a];
    const G = ['الرجال', 'النساء', 'الأطفال'];
    return { q: `في نادي القرية رجال ونساء وأطفال بالنسبة ${ratio(p)}، وعدد الأعضاء كلهم ${N(T)}. بكم يزيد عدد ${G[hi]} على عدد ${G[lo]}؟`, input: { type: 'num' }, sol: (p[hi] - p[lo]) * u, ok: v => v === (p[hi] - p[lo]) * u,
      hint: 'كم عضواً في الجزء الواحد؟ والفرق كم جزءاً؟', bad: v => v === p[hi] * u ? `هذا عدد ${G[hi]} كله.` : v === p[hi] - p[lo] ? 'هذا الفرق بالأجزاء لا بالأعضاء.' : '',
      good: `${N(u)} × (${N(p[hi])} − ${N(p[lo])}) = ${N((p[hi] - p[lo]) * u)}`, data: { title: 'أعضاء النادي', total: `الأعضاء: ${N(T)}`, names: G, parts: p, ans: p.map(v => N(v * u)) } }; }
  if (i === 3) { const p = r3(), u = R(11, 90), k = R(0, 2), T = sum(p) * u;
    return { q: `اشترى ${names.join(' و')} لوحة ودفعوا بالنسبة ${ratio(p)}. دفع ${names[k]} ${riyal(p[k] * u)}. كم ثمن اللوحة؟`, input: { type: 'num' }, sol: T, ok: v => v === T,
      hint: `كم جزءاً دفع ${names[k]}؟ فكم قيمة الجزء الواحد؟ وكم جزءاً في الثمن كله؟`, bad: v => v === p[k] * u * 3 ? 'لم يدفعوا بالتساوي.' : '',
      good: `${N(p[k] * u)} ÷ ${N(p[k])} = ${N(u)} ← ${N(u)} × ${N(sum(p))} = ${N(T)}`, data: { title: 'ثمن اللوحة', total: 'الثمن: ؟', names, parts: p, ans: p.map(v => N(v * u)), known: p.map((v, j) => j === k ? N(v * u) : null) } }; }
  if (i === 4) { const nm = ['سعيد', 'حسين', 'أشرف', 'حسام']; let hrs; do hrs = [R(3, 9), R(3, 9), R(3, 9), R(3, 9)]; while (new Set(hrs).size < 3); const u = R(5, 40), T = sum(hrs) * u, k = R(0, 3);
    return { q: `أرباح مشروع ${riyal(T)} تُوزّع بنسبة ساعات العمل: ${nm.map((x, j) => `${x} ${N(hrs[j])} ساعات`).join('، ')}. كم ريالاً ربح ${nm[k]}؟`, input: { type: 'num' }, sol: hrs[k] * u, ok: v => v === hrs[k] * u,
      hint: 'كم ساعة عملوا جميعاً؟ وكم ربح الساعة الواحدة؟', bad: v => v === T / 4 ? 'الأرباح ليست بالتساوي بل بالساعات.' : v === u ? 'هذا ربح الساعة الواحدة.' : '',
      good: `${N(T)} ÷ ${N(sum(hrs))} × ${N(hrs[k])} = ${N(hrs[k] * u)}`, data: { title: 'أرباح المشروع', total: `${N(T)} ريال`, names: nm, parts: hrs, ans: hrs.map(v => N(v * u)) } }; }
  let p1, p2, u; do { p1 = r3(); p2 = r3(); u = R(4, 12); } while (sum(p1) !== sum(p2) || p1.every((v, j) => v === p2[j]));
  const T = sum(p1) * u, G = ['بالحليب', 'البيضاء', 'الداكنة'], sh = p2.map(v => v * u);
  return { q: `في علبة ${N(T)} قطعة شوكولاتة بالحليب وبيضاء وداكنة كانت بالنسبة ${ratio(p1)}، ثم تغيّرت النسبة إلى ${ratio(p2)} والعدد كما هو. كم قطعة من كل نوع الآن؟`, input: { type: 'blanks', tpl: `${G[0]}: {} ، ${G[1]}: {} ، ${G[2]}: {}` }, sol: sh, ok: v => v.every((x, k) => x === sh[k]),
    hint: 'أي النسبتين هي النسبة الآن؟ وكم قطعة في الجزء الواحد؟', bad: v => v.every((x, k) => x === p1[k] * u) ? 'هذه الأعداد بالنسبة القديمة.' : 'تحقق من أن المجموع يساوي عدد القطع كله.',
    good: `${N(T)} ÷ ${N(sum(p2))} = ${N(u)} ← ${sh.map(N).join(' ، ')}`, data: { title: 'علبة الشوكولاتة', total: `القطع: ${N(T)}`, names: G, parts: p2, ans: sh.map(N) } };
}

function challenge() {
  const items = [], used = new Set(), fresh = f => { for (let k = 0; k < 60; k++) { const x = f(); const s = JSON.stringify(x); if (!used.has(s)) { used.add(s); return x; } } return f(); };
  { const [a, b, u] = fresh(() => [R(1, 5), R(1, 5), R(5, 20)]); if (a !== b) items.push(choice(`قسّم ${riyal((a + b) * u)} بنسبة ${ratio([a, b])}. النصيبان:`, ratio([a * u, b * u]), [ratio([b * u, a * u]), ratio([(a + b) * u / 2, (a + b) * u / 2]), ratio([a * u + 1, b * u - 1])], 'قيمة الجزء = المبلغ ÷ مجموع الأجزاء.', '8Nf5')); else items.push(num(`قسّم ${riyal(2 * a * u)} بنسبة ١ : ١. كم نصيب كل واحد؟`, a * u, 'نصفان متساويان.', '8Nf5')); }
  { const p = fresh(r3), u = R(5, 15); items.push(num(`قسّم ${N(sum(p) * u)} بالنسبة ${ratio(p)}. ما أكبر نصيب؟`, Math.max(...p) * u, 'اجمع الأجزاء ثم أوجد الجزء الواحد.', '8Nf5')); }
  { const p = fresh(r3); items.push(num(`في النسبة ${ratio(p)} كم جزءاً في المجموع؟`, sum(p), 'اجمع حدود النسبة.', '8Nf5')); }
  { const p = fresh(r3), u = R(4, 12); items.push(num(`بنسبة ${ratio(p)} كان النصيب الأول ${N(p[0] * u)}. كم المبلغ كله؟`, sum(p) * u, 'أوجد قيمة الجزء الواحد من النصيب الأول.', '8Nf5')); }
  items.push(tf('عند تقسيم مبلغ بنسبة ٢ : ٣ : ١ يأخذ صاحب الحد ٣ نصف المبلغ.', true, 'كم جزءاً من المجموع له؟', '8Nf5', '٣ من ٦ أجزاء = النصف.'));
  items.push(tf('عند تقسيم ٩٠ ريالاً بنسبة ١ : ٢ يأخذ كل واحد ٤٥ ريالاً.', false, 'هل النسبة ١ : ١؟', '8Nf5', 'الجزء ٣٠: ٣٠ و٦٠.'));
  { const p = fresh(r3), u = R(5, 12); const s2 = p.map(v => v * u); items.push(choice(`قسّم ${N(sum(p) * u)} بالنسبة ${ratio(p)}:`, ratio(s2), [ratio(s2.slice().reverse()), ratio(p), ratio(s2.map((v, j) => j ? v : v + u))], 'تحقق أن المجموع صحيح وأن الترتيب كالنسبة.', '8Nf5')); }
  { const [h1, h2, u] = fresh(() => [R(3, 6), R(3, 6), R(10, 30)]); items.push(num(`عمل خالد ${N(h1)} ساعات ويوسف ${N(h2)} ساعات، وتقاسما ${riyal((h1 + h2) * u)} بنسبة الساعات. كم نصيب خالد؟`, h1 * u, 'أوجد ربح الساعة الواحدة.', '8Nf5')); }
  return items.sort(() => Math.random() - .5);
}

export default mission({
  title: 'تعاونية النسيج', icon: '🧶', who, rounds: 6, make, draw,
  intro: ['أهلاً! أنا ميساء، أدير تعاونية النسيج في القرية.', 'نتقاسم الأرباح والفواتير بنسب، لا بالتساوي. ساعدني أعطِ كل واحد حقه.'],
  outro: ['عادل تماماً! كل نصيب بحسب أجزائه.', 'والآن تحدي المشاركة بالنسب.'],
  challenge: { title: 'تحدي المشاركة', make: challenge }
});
export const ROUNDS = 6;
export { make, challenge };
