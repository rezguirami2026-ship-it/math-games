// ١٠-٤ حل معادلتين آنياً بالحذف — «الخزنة ذات القفلين»: الخبيرة ندى تفتح الخزنة بجمع المعادلتين أو طرحهما لحذف أحد المجهولين
// (يُحذف الحد حين يكون ناتج جمع معاملَيه أو طرحهما صفراً): هل نجمع أم نطرح؟ ثم الحل بالجمع، والحل بالطرح، وخطوات الحذف، والقيمة الثانية،
// ومسألة الأقلام والدفاتر. قرصا الخزنة «؟» حتى يحلّ الطالب. التحدي: ٨ أسئلة من 8Ae10 (الكتاب ص٣٩–٤٠).
import { mission } from '../../mission.js';
import { N, R, tm, ex } from '../../math.js';
import { choice, num, tf } from '../../../missions/challenge.js';
import { officeBg, say, glow, safe, note } from './art.js';

const who = { name: 'خبيرة الخزائن ندى', face: '👩🏽‍🔧', id: 'nada' };
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuf = a => a.map(v => [Math.random(), v]).sort((p, q) => p[0] - q[0]).map(x => x[1]);
const E = (a, b, c) => `${ex([a, 'س'], [b, 'ص'])} = ${N(c)}`;

function draw(g, w, h, t, S) {
  const r = S.r ? S.r.data : {}; officeBg(g, w, h, t);
  say(g, '🔐 ' + (r.title || 'الخزنة ذات القفلين'), w * .5, h * .12, 18, '#1E3A8A', 900);
  (r.eqs || []).forEach((e, k) => note(g, w * .1 + k * w * .42, h * .2, w * .38, 60, [e], { tilt: k ? .02 : -.02, col: k ? '#ECFEFF' : '#FFFBEB' }));
  safe(g, w * .5, h * .68, Math.min(84, w * .12), S.done ? N(r.x) : '؟', S.done ? N(r.y) : '؟', !!S.done);
  glow(g, w, h, S);
}
const two = () => ({ type: 'blanks', tpl: 'س = {} ، ص = {}', neg: true });
// معادلتان بمعامل ص نفسه (فنطرح) أو بمعاملين متعاكسين (فنجمع)
function sys(add) { let a, c, b, x, y; do { a = R(1, 6); c = R(1, 6); b = R(1, 4); x = R(-6, 9, true); y = R(-6, 9, true); } while (a === c || (add && a + c === 0) || Math.abs(a * x + b * y) > 60); return { a, b, c, d: add ? -b : b, x, y, e1: a * x + b * y, e2: c * x + (add ? -b : b) * y }; }

function make(i) {
  if (i === 0) { const add = Math.random() < .5, s = sys(add);
    return { q: `لحذف ص من المعادلتين ${E(s.a, s.b, s.e1)} و ${E(s.c, s.d, s.e2)}، هل نجمعهما أم نطرح إحداهما من الأخرى؟`, input: { type: 'pick', opts: ['نجمع المعادلتين', 'نطرح إحداهما من الأخرى'] }, ok: v => v === (add ? 0 : 1),
      hint: 'انظر إلى معاملي ص: متى يكون الناتج صفراً، بالجمع أم بالطرح؟', bad: () => add ? 'بالطرح يصير معامل ص ضعفاً لا صفراً.' : 'بالجمع يصير معامل ص ضعفاً لا صفراً.',
      good: add ? `${N(s.b)} + (${N(s.d)}) = ٠` : `${N(s.b)} − ${N(s.d)} = ٠`, data: { title: 'نجمع أم نطرح؟', eqs: [E(s.a, s.b, s.e1), E(s.c, s.d, s.e2)], x: s.x, y: s.y } }; }
  if (i === 1) { let x, y; do { x = R(-9, 20); y = R(-9, 20); } while (x === y || !x || !y);
    return { q: `حلّ المعادلتين الآنيتين بالحذف: س + ص = ${N(x + y)} و س − ص = ${N(x - y)}`, input: two(), sol: [x, y], ok: v => v[0] === x && v[1] === y,
      hint: 'اجمع المعادلتين: ماذا يحدث للحدين ص و−ص؟', bad: v => v[0] === x ? 'س صحيحة! عوّض بها لتجد ص.' : '',
      good: `٢س = ${N(2 * x)} ← س = ${N(x)} ، ص = ${N(y)}`, data: { title: 'بالجمع', eqs: [`س + ص = ${N(x + y)}`, `س − ص = ${N(x - y)}`], x, y } }; }
  if (i === 2) { const s = sys(false);
    return { q: `حلّ المعادلتين الآنيتين: ${E(s.a, s.b, s.e1)} و ${E(s.c, s.d, s.e2)}`, input: two(), sol: [s.x, s.y], ok: v => v[0] === s.x && v[1] === s.y,
      hint: 'معامل ص واحد في المعادلتين: اطرح الثانية من الأولى. ماذا يبقى؟', bad: v => v[0] === s.x ? 'س صحيحة! عوّض بها في إحدى المعادلتين.' : '',
      good: `${tm(s.a - s.c, 'س')} = ${N(s.e1 - s.e2)} ← س = ${N(s.x)} ، ص = ${N(s.y)}`, data: { title: 'بالطرح', eqs: [E(s.a, s.b, s.e1), E(s.c, s.d, s.e2)], x: s.x, y: s.y } }; }
  if (i === 3) { let s; do s = sys(false); while (s.a <= s.c);
    const k = s.a - s.c, step = (eq, right, wrongs) => { const opts = shuf([right, ...wrongs]); return { eq, opts, ok: opts.indexOf(right) }; };
    const st = [step(`${E(s.a, s.b, s.e1)}  و  ${E(s.c, s.d, s.e2)}`, 'اطرح المعادلة الثانية من الأولى', ['اجمع المعادلتين', `اقسم الأولى على ${N(s.a)}`]),
      step(`${tm(k, 'س')} = ${N(s.e1 - s.e2)}`, `اقسم الطرفين على ${N(k)}`, [`اطرح ${N(k)} من الطرفين`, `اضرب الطرفين في ${N(k)}`]),
      step(`س = ${N(s.x)}`, `عوّض س = ${N(s.x)} في إحدى المعادلتين`, ['انتهى الحل', `عوّض ص = ${N(s.x)}`])];
    return { q: 'افتح الخزنة بالحذف خطوة خطوة.', input: { type: 'steps', steps: st, final: `ص = ${N(s.y)}` }, sol: st.map(q => q.ok), ok: v => v.length === st.length && v.every((q, j) => q === st[j].ok),
      hint: 'أي العمليتين تجعل حد ص يختفي؟', bad: v => ['انظر إلى معاملي ص: متى يصير الفرق صفراً؟', 'العملية العكسية للضرب.', 'وجدت س فقط: بقيت ص!'][v.length - 1] || '',
      good: `س = ${N(s.x)} ، ص = ${N(s.y)}`, data: { title: 'خطوات الحذف', eqs: [E(s.a, s.b, s.e1), E(s.c, s.d, s.e2)], x: s.x, y: s.y } }; }
  if (i === 4) { const s = sys(true);
    return { q: `حلّ المعادلتين الآنيتين: ${E(s.a, s.b, s.e1)} و ${E(s.c, s.d, s.e2)}. ما قيمة ص؟`, input: { type: 'num', neg: true }, sol: s.y, ok: v => v === s.y,
      hint: 'احذف ص أولاً لتجد س، ثم عوّض بقيمة س.', bad: v => v === s.x ? 'هذه قيمة س، والسؤال عن ص.' : '',
      good: `س = ${N(s.x)} ← ص = ${N(s.y)}`, data: { title: 'القيمة الثانية', eqs: [E(s.a, s.b, s.e1), E(s.c, s.d, s.e2)], x: s.x, y: s.y } }; }
  let pen, bk, a, c; do { pen = R(2, 9) * 50; bk = R(2, 12) * 50; a = R(2, 5); c = R(1, 4); } while (a === c || pen === bk);
  const n = R(1, 3), t1 = n * pen + a * bk, t2 = n * pen + c * bk;
  const pens = k => k === 1 ? 'قلم واحد' : k === 2 ? 'قلمان' : `${N(k)} أقلام`, books = k => k === 1 ? 'دفتر واحد' : k === 2 ? 'دفتران' : `${N(k)} دفاتر`;
  return { q: `${pens(n)} و${books(a)} بـ ${N(t1)} بيسة، و${pens(n)} و${books(c)} بـ ${N(t2)} بيسة. إذا كان س ثمن القلم وص ثمن الدفتر بالبيسة، فكم كلٌّ منهما؟`, input: { type: 'blanks', tpl: 'س = {} ، ص = {}' }, sol: [pen, bk], ok: v => v[0] === pen && v[1] === bk,
    hint: 'عدد الأقلام نفسه في المعادلتين: اطرح لتحذف س أولاً.', bad: v => v[1] === bk ? 'ص صحيحة! عوّض بها لتجد س.' : '',
    good: `${tm(a - c, 'ص')} = ${N(t1 - t2)} ← ص = ${N(bk)} ، س = ${N(pen)}`, data: { title: 'الأقلام والدفاتر', eqs: [E(n, a, t1), E(n, c, t2)], x: pen, y: bk } };
}

function challenge() {
  const items = [], used = new Set(), fresh = f => { for (let k = 0; k < 60; k++) { const x = f(); const s = JSON.stringify(x); if (!used.has(s)) { used.add(s); return x; } } return f(); };
  { const [x, y] = fresh(() => [R(2, 15), R(1, 9)]); items.push(num(`س + ص = ${N(x + y)} و س − ص = ${N(x - y)}. ما س؟`, x, 'اجمع المعادلتين.', '8Ae10', { neg: true })); }
  { const s = fresh(() => sys(false)); items.push(num(`${E(s.a, s.b, s.e1)} و ${E(s.c, s.d, s.e2)}. ما س؟`, s.x, 'اطرح لحذف ص.', '8Ae10', { neg: true })); }
  { const s = fresh(() => sys(true)); items.push(choice(`لحذف ص من ${E(s.a, s.b, s.e1)} و ${E(s.c, s.d, s.e2)}:`, 'نجمع المعادلتين', ['نطرح المعادلتين', 'نضرب المعادلتين'], 'معاملا ص متعاكسان.', '8Ae10')); }
  items.push(tf('المعامل هو العدد الذي يُضرب في المتغير.', true, 'في ٥س ما المعامل؟', '8Ae10', 'في ٥س المعامل ٥.'));
  items.push(tf('في المعادلتين ٥س + ص = ٢٧ و ٢س + ص = ٦ نجمع لحذف ص.', false, 'ما ناتج جمع ص و ص؟', '8Ae10', 'نطرح: ٣س = ٢١.'));
  { const [x, y] = fresh(() => [R(2, 9), R(-5, 5, true)]); items.push(num(`٥س + ص = ${N(5 * x + y)} و ٢س + ص = ${N(2 * x + y)}. ما ص؟`, y, 'اطرح لتجد س ثم عوّض.', '8Ae10', { neg: true })); }
  { const [x, y] = fresh(() => [R(1, 8), R(1, 8)]); items.push(choice(`حل المعادلتين ٢س + ص = ${N(2 * x + y)} و س − ص = ${N(x - y)}:`, `(${N(x)}، ${N(y)})`, [`(${N(y)}، ${N(x)})`, `(${N(x + 1)}، ${N(y - 2)})`, `(${N(x)}، ${N(-y)})`], 'اجمع لحذف ص.', '8Ae10')); }
  { const [x, y] = fresh(() => [R(2, 12), R(1, 9)]); items.push(num(`٣س + ٢ص = ${N(3 * x + 2 * y)} و ٣س − ٢ص = ${N(3 * x - 2 * y)}. ما س؟`, x, 'اجمع لحذف ص.', '8Ae10', { neg: true })); }
  return items.sort(() => Math.random() - .5);
}

export default mission({
  title: 'الخزنة ذات القفلين', icon: '🔐', who, rounds: 6, make, draw,
  intro: ['أنا ندى، خبيرة الخزائن. هذه الخزنة لها قفلان، ولكل قفل رقم مجهول.', 'المعادلتان معاً تكشفان الرقمين: نجمعهما أو نطرحهما فيختفي أحد المجهولين!'],
  outro: ['طَق! انفتح القفلان.', 'تحدي الحل بالحذف.'],
  challenge: { title: 'تحدي الحذف', make: challenge }
});
export const ROUNDS = 6;
export { make, challenge };
