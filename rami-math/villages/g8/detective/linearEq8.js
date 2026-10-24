// ١٠-١ حل المعادلات الخطية — «لوح الأدلة»: المحقق فهد يعلّق المعادلات على لوح الفلّين. الطالب يختار العملية التالية خطوة خطوة
// (فك الأقواس، الطرح من الطرفين، القسمة) فتتحول المعادلة أمامه كما في حل الكتاب، ثم يحل معادلات بإشارات سالبة، وبحل كسري،
// ويكتشف الخطأ في واجب مهند. التحدي: ٨ أسئلة من 8Ae9 (الكتاب ص٣٢–٣٣).
import { mission } from '../../mission.js';
import { N, R, P, gcd, fEq, fx, tm, ex } from '../../math.js';
import { choice, num, tf } from '../../../missions/challenge.js';
import { officeBg, say, glow, cork, note, thread } from './art.js';

const who = { name: 'المحقق فهد', face: '🕵🏽‍♂️', id: 'fahad' };
const pick = a => a[Math.floor(Math.random() * a.length)];
const V = () => pick(['س', 'ص', 'ع', 'م']);
const shuf = a => a.map(v => [Math.random(), v]).sort((p, q) => p[0] - q[0]).map(x => x[1]);
// خطوة: معادلتها، وخياراتها (الصحيح أولاً ثم يُخلط)، ونص الخطأ لكل خيار خاطئ
const step = (eq, right, wrongs) => { const opts = shuf([right, ...wrongs]); return { eq, opts, ok: opts.indexOf(right) }; };
const addTxt = (k, v = '') => k > 0 ? `اطرح ${N(k)}${v} من الطرفين` : `أضف ${N(-k)}${v} إلى الطرفين`;

function draw(g, w, h, t, S) {
  const r = S.r ? S.r.data : {}; officeBg(g, w, h, t);
  cork(g, w * .06, h * .1, w * .88, h * .78);
  say(g, '📌 ' + (r.title || 'لوح الأدلة'), w * .5, h * .2, 18, '#7C2D12', 900);
  const lines = r.lines || [], n = lines.length, done = S.done ? n : Math.min(n, (S.v || 0) + 1);
  const cw = Math.min(w * .26, 220), ch = 66;
  for (let k = 0; k < done; k++) { const x = w * .88 - cw - (k % 3) * (cw + w * .03), y = h * .27 + Math.floor(k / 3) * (ch + 16);
    note(g, x, y, cw, ch, [lines[k]], { tilt: ((k * 37) % 7 - 3) * .01, hl: S.done && k === n - 1 });
    if (k) { const px = w * .88 - cw - ((k - 1) % 3) * (cw + w * .03), py = h * .27 + Math.floor((k - 1) / 3) * (ch + 16); thread(g, [px + cw / 2, py + 8], [x + cw / 2, y + 8]); } }
  if (r.answer) say(g, S.done ? r.answer : r.ask || '؟', w * .5, h * .84, 20, S.done ? '#15803D' : '#7C2D12', 900);
  glow(g, w, h, S);
}

function make(i) {
  const v = V();
  if (i === 0) { let a, b, c, x; do { a = R(2, 6); c = R(1, a + 4); b = R(-9, 9, true); x = R(-9, 9, true); } while (c === a || a - c === 1 || a * b === 0);
    const d = a * (x + b) - c * x, ab = a * b, k = a - c;
    const st = [step(`${N(a)}(${ex([1, v], [b])}) = ${ex([c, v], [d])}`, 'اضرب خارج الأقواس', [`${addTxt(b)} داخل القوس فقط`, `اقسم الطرفين على ${N(c)}`]),
      step(`${ex([a, v], [ab])} = ${ex([c, v], [d])}`, addTxt(c, v), [`${addTxt(c, v).replace('الطرفين', 'الطرف الأيمن فقط')}`, `اضرب الطرفين في ${v}`]),
      step(`${ex([k, v], [ab])} = ${N(d)}`, addTxt(ab), [`${addTxt(ab).replace('الطرفين', 'الطرف الأيسر فقط')}`, `اقسم الطرفين على ${N(Math.abs(ab))}`]),
      step(`${tm(k, v)} = ${N(d - ab)}`, `اقسم الطرفين على ${N(k)}`, [addTxt(k), `اضرب الطرفين في ${N(k)}`])];
    return { q: `حلّ المعادلة ${st[0].eq} خطوة خطوة.`, input: { type: 'steps', steps: st, final: `${v} = ${N(x)}` }, sol: st.map(s => s.ok), ok: a2 => a2.length === st.length && a2.every((q, j) => q === st[j].ok),
      hint: 'ما الذي يمنعك من جمع الحدود المتشابهة الآن؟ تخلّص منه أولاً، ثم اجمع الحدود التي فيها المجهول في طرف واحد.', bad: a2 => { const j = a2.length - 1; return j === 0 ? 'الأقواس أولاً: كل ما داخلها مضروب في العدد خارجها.' : j === 1 ? 'ما تفعله بطرف تفعله بالطرف الآخر.' : j === 2 ? 'أبقِ المجهول وحده: أي عدد يجب أن يختفي من طرفه؟' : 'المجهول مضروب في عدد: ما العملية العكسية للضرب؟'; },
      good: `${v} = ${N(x)}`, data: { title: 'معادلة بأقواس', lines: [...st.map(s => s.eq), `${v} = ${N(x)}`] } }; }
  if (i === 1) { let a, b, c, d, x; do { a = R(2, 9); c = R(1, 9); b = R(-12, 12, true); x = R(-8, 8, true); } while (a - c < 2 || b === 0);
    d = (a - c) * x + b; const k = a - c;
    const st = [step(`${ex([a, v], [b])} = ${ex([c, v], [d])}`, addTxt(c, v), [`اقسم الطرفين على ${N(a)}`, `${addTxt(c, v).replace('الطرفين', 'الطرف الأيمن فقط')}`]),
      step(`${ex([k, v], [b])} = ${N(d)}`, addTxt(b), [`${addTxt(b).replace('الطرفين', 'الطرف الأيسر فقط')}`, `اقسم الطرفين على ${N(Math.abs(b))}`]),
      step(`${tm(k, v)} = ${N(d - b)}`, `اقسم الطرفين على ${N(k)}`, [addTxt(k), `اضرب الطرفين في ${N(k)}`])];
    return { q: `حلّ المعادلة ${st[0].eq} خطوة خطوة.`, input: { type: 'steps', steps: st, final: `${v} = ${N(x)}` }, sol: st.map(s => s.ok), ok: a2 => a2.length === st.length && a2.every((q, j) => q === st[j].ok),
      hint: 'المجهول في الطرفين: كيف تجمعه في طرف واحد؟', bad: a2 => { const j = a2.length - 1; return j === 0 ? 'اجمع حدود المجهول في طرف واحد أولاً، وبالعملية نفسها في الطرفين.' : j === 1 ? 'ما تفعله بطرف تفعله بالطرف الآخر.' : 'ما العملية العكسية للضرب؟'; },
      good: `${v} = ${N(x)}`, data: { title: 'المجهول في الطرفين', lines: [...st.map(s => s.eq), `${v} = ${N(x)}`] } }; }
  if (i === 2) { let a, k, x; do { a = R(8, 20); k = R(2, 5); x = R(-6, 12, true); } while (a - k * x === 0);
    const r = a - k * x, eq = `${N(a)} − ${tm(k, v)} = ${N(r)}`;
    return { q: `حلّ المعادلة ${eq}`, input: { type: 'num', neg: true }, sol: x, ok: q => q === x,
      hint: `أين المجهول؟ وما الذي يحدث إن أضفت ${tm(k, v)} إلى الطرفين؟`, bad: q => q === -x ? 'راجع الإشارة: عوّض جوابك في المعادلة وتحقق.' : '',
      good: `${v} = ${N(x)}`, data: { title: 'إشارة سالبة', lines: [eq], answer: `${v} = ${N(x)}`, ask: `${v} = ؟` } }; }
  if (i === 3) { let k, m, x; do { k = R(2, 6); m = R(-6, 9, true); x = R(-6, 10, true); } while (x === m || k * (x - m) === 0);
    const n = k * (x - m), eq = `${N(k)}(${ex([1, v], [-m])}) = ${N(n)}`;
    return { q: `حلّ المعادلة ${eq}`, input: { type: 'num', neg: true }, sol: x, ok: q => q === x,
      hint: 'يمكنك فك الأقواس أولاً، أو قسمة الطرفين على العدد خارجها. أيهما أسرع هنا؟', bad: q => q === n / k ? `هذه قيمة ما داخل القوس، لا قيمة ${v}.` : '',
      good: `${v} = ${N(x)}`, data: { title: 'قوس وعدد خارجه', lines: [eq], answer: `${v} = ${N(x)}`, ask: `${v} = ؟` } }; }
  if (i === 4) { let a, b, c, d; do { a = R(2, 7); c = R(1, 6); b = R(-15, 15); d = R(-20, 25); } while (d <= b || (d - b) % (a + c) === 0 || d - b > 60);
    const n = d - b, m = a + c, eq = `${ex([a, v], [b])} = ${ex([d], [-c, v])}`, g2 = gcd(n, m);
    return { q: `حلّ المعادلة ${eq} واكتب الجواب في صورة كسر.`, input: { type: 'frac', mixed: true }, sol: { w: Math.floor(n / g2 / (m / g2)), n: (n / g2) % (m / g2), d: m / g2 }, ok: q => fEq(q, n, m),
      hint: 'اجمع حدود المجهول في طرف والأعداد في الطرف الآخر. هل القسمة الأخيرة تعطي عدداً كاملاً؟', bad: q => fEq(q, m, n) ? 'قلبت الكسر: ما الذي يُقسم على ماذا؟' : '',
      good: `${tm(m, v)} = ${N(n)} ← ${v} = ${fx(n, m)}`, data: { title: 'حل كسري', lines: [eq, `${tm(m, v)} = ${N(n)}`], answer: `${v} = ${fx(n, m)}`, ask: `${v} = ؟` } }; }
  // واجب مهند: سطر واحد فيه خطأ
  const k0 = R(2, 4), b0 = R(2, 9), c0 = R(4, 9);
  const L = [`${N(k0)}(س + ${N(b0)}) = ${N(c0)}(${N(c0 + 2)} − س)`, `${tm(k0, 'س')} + ${N(k0 * b0)} = ${N(c0 * (c0 + 2))} − ${tm(c0, 'س')}`, `${tm(k0 + c0, 'س')} + ${N(k0 * b0)} = ${N(c0 * (c0 + 2))}`, `${tm(k0 + c0, 'س')} = ${N(c0 * (c0 + 2) - k0 * b0)}`];
  const errAt = R(1, 3), bad2 = L.slice(); if (errAt === 1) bad2[1] = `${tm(k0, 'س')} + ${N(b0)} = ${N(c0 * (c0 + 2))} − ${tm(c0, 'س')}`; else if (errAt === 2) bad2[2] = `${tm(Math.abs(k0 - c0) || 1, 'س')} + ${N(k0 * b0)} = ${N(c0 * (c0 + 2))}`; else bad2[3] = `${tm(k0 + c0, 'س')} = ${N(c0 * (c0 + 2) + k0 * b0)}`;
  const opts = ['السطر الثاني', 'السطر الثالث', 'السطر الرابع'];
  return { q: 'هذا جزء من واجب مهند، وفي أحد أسطره خطأ. في أي سطر الخطأ؟', input: { type: 'pick', opts }, ok: q => q === errAt - 1,
    hint: 'قارن كل سطر بالذي قبله: ما العملية التي أجراها؟ وهل أجراها على الحدود كلها وعلى الطرفين؟', bad: () => 'هذا السطر صحيح: انتقل منه إلى الذي بعده.',
    good: `الصحيح: ${L[errAt]}`, data: { title: 'واجب مهند', lines: bad2, answer: `الخطأ في ${opts[errAt - 1]}`, ask: 'أين الخطأ؟' } };
}

function challenge() {
  const items = [], used = new Set(), fresh = f => { for (let k = 0; k < 60; k++) { const x = f(); const s = JSON.stringify(x); if (!used.has(s)) { used.add(s); return x; } } return f(); };
  { const [a, b, x] = fresh(() => [R(2, 6), R(1, 15), R(-5, 9, true)]); items.push(num(`حلّ المعادلة ${ex([a, 'س'], [b])} = ${N(a * x + b)}`, x, 'اطرح ثم اقسم.', '8Ae9', { neg: true })); }
  { const [a, x] = fresh(() => [R(2, 5), R(2, 9)]); items.push(num(`حلّ المعادلة ${N(a)}(س − ${N(3)}) = ${N(a * (x - 3))}`, x, 'اقسم الطرفين على العدد خارج القوس.', '8Ae9', { neg: true })); }
  { const [a, c, x] = fresh(() => [R(5, 9), R(1, 4), R(-6, 6, true)]); const b = R(1, 9), d = (a - c) * x + b; items.push(choice(`حل المعادلة ${ex([a, 'س'], [b])} = ${ex([c, 'س'], [d])} هو:`, `س = ${N(x)}`, [`س = ${N(-x)}`, `س = ${N(x + 1)}`, `س = ${N(d)}`], 'اجمع حدود س في طرف.', '8Ae9')); }
  { const [k, x] = fresh(() => [R(2, 4), R(3, 8)]); items.push(num(`حلّ المعادلة ${N(12)} − ${tm(k, 'ص')} = ${N(12 - k * x)}`, x, 'أضف حد ص إلى الطرفين.', '8Ae9', { neg: true })); }
  items.push(tf('في المعادلة ٢(س − ٥) = ٢ + ٨س، أول خطوة ممكنة هي فك الأقواس.', true, 'هل يمكن جمع الحدود قبل ذلك؟', '8Ae9', '٢س − ١٠ = ٢ + ٨س.'));
  items.push(tf('حل المعادلة ٤س + ٨ = ١٤ عدد كامل.', false, 'احسب: ٤س = ٦.', '8Ae9', 'س = ٦ ÷ ٤ = ١٫٥.'));
  { const [a, b] = fresh(() => pick([[3, 2], [5, 3], [7, 4]])); items.push(choice(`حل المعادلة ${tm(b, 'س')} = ${N(a)}:`, `س = ${N(a)} ÷ ${N(b)}`, [`س = ${N(a)} − ${N(b)}`, `س = ${N(a)} × ${N(b)}`, `س = ${N(b)} ÷ ${N(a)}`], 'العملية العكسية للضرب هي القسمة.', '8Ae9')); }
  { const x = fresh(() => R(-7, -1)); items.push(num(`حلّ المعادلة ٢(س + ٤) = ${N(2 * (x + 4))}`, x, 'اقسم على ٢ ثم اطرح ٤.', '8Ae9', { neg: true })); }
  return items.sort(() => Math.random() - .5);
}

export default mission({
  title: 'لوح الأدلة', icon: '📌', who, rounds: 6, make, draw,
  intro: ['أهلاً بك في مكتب المحقق! أنا فهد، وكل قضية عندي معادلة مجهولها هو السر.', 'لا أقفز إلى الجواب: أعلّق كل خطوة على اللوح وأربطها بخيط أحمر بالتي قبلها. اختر معي الخطوة الصحيحة.'],
  outro: ['ممتاز! خطوة صحيحة بعد خطوة… وانكشف المجهول.', 'تحدي حل المعادلات الخطية.'],
  challenge: { title: 'تحدي المعادلات', make: challenge }
});
export const ROUNDS = 6;
export { make, challenge };
