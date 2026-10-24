// ١١-٤ الرسم البياني للخط المستقيم — «رسّام المسارات»: المهندسة دانة ترسم المسارات الجديدة. يرسم الطالب المستقيم بنقر نقطتين عليه،
// ويعيد ترتيب معادلة مثل ٢ص − ٣س + ٤ = ٠ إلى الصورة ص = م س + جـ ليعرف ميلها، ويكمل جدول القيم، ويميّز الصور المختلفة لمعادلة واحدة.
// المستقيم الصحيح يظهر بعد الحل. التحدي: ٨ أسئلة من 8As1 (الكتاب ص٥٥–٥٦).
import { mission } from '../../mission.js';
import { N, R, eq, tm } from '../../math.js';
import { choice, num, tf } from '../../../missions/challenge.js';
import { duneBg, say, glow, plane, pt } from './art.js';
import { yeq } from './lineEq8.js';

const who = { name: 'المهندسة دانة', face: '👷🏽‍♀️', id: 'dana' };
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuf = a => a.map(v => [Math.random(), v]).sort((p, q) => p[0] - q[0]).map(x => x[1]);
const onLine = (m, c) => v => { const [[x1, y1], [x2, y2]] = v; return x1 !== x2 && eq(y1, m * x1 + c) && eq(y2, m * x2 + c); };
const lineBad = (m, c) => v => { const [[x1, y1], [x2, y2]] = v; if (x1 === x2) return 'المستقيم الرأسي ليس من هذه الصورة.'; const k = (y2 - y1) / (x2 - x1); return eq(k, m) ? 'الميل صحيح، لكن هل يقطع محور الصادات في المكان الصحيح؟' : eq(y1, m * x1 + c) || eq(y2, m * x2 + c) ? 'إحدى النقطتين صحيحة: عوّض لتجد الأخرى.' : 'عوّض بقيمة س في المعادلة لتجد ص لكل نقطة.'; };
const twoPts = (m, c) => [0, 1, -1, 2, -2, 3, -3, 4, -4].map(x => [x, m * x + c]).filter(([x, y]) => Number.isInteger(y) && Math.abs(y) <= 6).slice(0, 2);   // نقطتان على المستقيم داخل الشبكة
const sgn = v => v < 0 ? ` − ${N(-v)}` : ` + ${N(v)}`;

function draw(g, w, h, t, S) {
  const r = S.r ? S.r.data : {}; duneBg(g, w, h, t);
  const s = Math.min(w * .55, h * .78), x = w * .5 - s / 2, y = h * .1;
  plane(g, x, y, s, -6, 6, { lines: S.done && r.line ? [r.line] : [], pts: S.done && r.tpts ? r.tpts.map(p => ({ p, l: pt(...p), col: '#EA580C' })) : [] });
  if (r.tag) say(g, r.tag, w * .5, h * .95, 17, '#7C3AED', 900);
  glow(g, w, h, S);
}

function make(i) {
  if (i === 0) { let m, c; do { m = pick([1, 2, -1, -2, .5, -.5, 3]); c = R(-3, 3); } while (Math.abs(c) > 3);
    return { q: `ارسم المسار ${yeq(m, c)}: انقر نقطتين تقعان عليه.`, input: { type: 'grid', x0: -6, x1: 6, y0: -6, y1: 6, n: 2 }, sol: twoPts(m, c), ok: onLine(m, c), bad: lineBad(m, c),
      hint: 'اختر قيمة سهلة للعدد س مثل ٠، واحسب ص. ثم قيمة أخرى.', good: yeq(m, c), data: { line: { m, c }, tag: yeq(m, c) } }; }
  if (i === 1) { const [a, b] = pick([[2, 3], [2, 1], [3, 6], [2, 5], [4, 2], [2, -3], [4, -6]]), d = R(-8, 8, true), m = b / a, c = -d / a;
    const eqTxt = `${tm(a, 'ص')}${b < 0 ? ' + ' + tm(-b, 'س') : ' − ' + tm(b, 'س')}${sgn(d)} = ٠`;
    return { q: `معادلة مسار جديد ${eqTxt}. أعد ترتيبها في الصورة ص = م س + جـ. ما ميل المسار؟`, input: { type: 'num', neg: true, dot: true }, sol: m, ok: v => eq(v, m),
      hint: 'اجعل ص وحدها في طرف: انقل الحدود الأخرى إلى الطرف الآخر، ثم اقسم على معامل ص.', bad: v => eq(v, b) ? `لا تنس قسمة الطرفين على ${N(a)}.` : eq(v, -m) ? 'عند النقل إلى الطرف الآخر تتغير الإشارة.' : '',
      good: `${tm(a, 'ص')} = ${tm(b, 'س')}${sgn(-d)} ← ص = ${N(m)}س${sgn(c)}`, data: { line: { m, c }, tag: eqTxt } }; }
  if (i === 2) { const m = pick([1.5, 2, -2, .5, -1, 3]), c = R(-3, 3), xs = [0, 2, -2].filter(x => Number.isInteger(m * x + c)), ys = xs.map(x => m * x + c);
    return { q: `أكمل جدول القيم للمسار ${yeq(m, c)} عند س = ${xs.map(N).join(' ، ')}.`, input: { type: 'blanks', tpl: xs.map(x => `س = ${N(x)}: ص = {}`).join(' ، '), neg: true }, sol: ys, ok: v => v.every((y, k) => y === ys[k]),
      hint: 'عوّض بكل قيمة للعدد س في المعادلة: الضرب أولاً ثم الجمع.', bad: v => v.some((y, k) => y === -ys[k] && y) ? 'راجع الإشارات.' : '',
      good: xs.map((x, k) => pt(x, ys[k])).join(' ، '), data: { line: { m, c }, tpts: xs.map((x, k) => [x, ys[k]]), tag: yeq(m, c) } }; }
  if (i === 3) { const m = pick([-2, -3, 2, 3]), c = R(1, 5);
    const forms = [`ص${m > 0 ? ' − ' : ' + '}${tm(Math.abs(m), 'س')} = ${N(c)}`, `ص${m > 0 ? ' + ' : ' − '}${tm(Math.abs(m), 'س')} = ${N(c)}`, `ص = ${N(c)}${m > 0 ? ' − ' : ' + '}${tm(Math.abs(m), 'س')}`, `ص${m > 0 ? ' − ' : ' + '}${tm(Math.abs(m), 'س')} = ${N(-c)}`];
    const ok0 = forms[0], opts = shuf(forms);
    return { q: `أي معادلة تصف المسار نفسه ${yeq(m, c)}؟`, input: { type: 'pick', opts }, ok: v => opts[v] === ok0,
      hint: 'انقل حد س إلى الطرف الأيسر في المعادلة المعطاة: ماذا تصبح إشارته؟', bad: () => 'عند نقل حد إلى الطرف الآخر تتغير إشارته، ويبقى كل شيء آخر.',
      good: ok0, data: { line: { m, c }, tag: yeq(m, c) } }; }
  if (i === 4) { const k = pick([2, 3, 4]), m = pick([1, 2, -1, 3]), c = R(-4, 5, true), eqTxt = `${tm(k, 'ص')} = ${k * m < 0 ? '−' : ''}${tm(Math.abs(k * m), 'س')}${sgn(k * c)}`;
    return { q: `معادلة المسار ${eqTxt}. ما الجزء المقطوع من محور الصادات؟`, input: { type: 'num', neg: true }, sol: c, ok: v => v === c,
      hint: `اقسم الطرفين على ${N(k)} لتصير ص وحدها.`, bad: v => v === k * c ? `لا تنس القسمة على ${N(k)}.` : '',
      good: `ص = ${yeq(m, c).slice(4)}`, data: { line: { m, c }, tag: eqTxt } }; }
  const [a, b] = pick([[1, 1], [2, 1], [1, 2], [3, 1]]), m = -a / b; let c; do c = R(-4, 4); while (!Number.isInteger(2 * m + c) || Math.abs(c) > 4); const d = b * c;
  const eqTxt = `${tm(a, 'س')} + ${tm(b, 'ص')} = ${N(d)}`;
  return { q: `ارسم المسار ${eqTxt}: انقر نقطتين تقعان عليه.`, input: { type: 'grid', x0: -6, x1: 6, y0: -6, y1: 6, n: 2 }, sol: twoPts(m, c), ok: onLine(m, c), bad: lineBad(m, c),
    hint: 'ضع س = ٠ واحسب ص، ثم ضع قيمة أخرى للعدد س. أو أعد الترتيب إلى ص = م س + جـ.', good: yeq(m, c), data: { line: { m, c }, tag: eqTxt } };
}

function challenge() {
  const items = [], used = new Set(), fresh = f => { for (let k = 0; k < 60; k++) { const x = f(); const s = JSON.stringify(x); if (!used.has(s)) { used.add(s); return x; } } return f(); };
  items.push(choice('معادلة المستقيم ٢ص − ٣س + ٤ = ٠ في الصورة ص = م س + جـ هي:', 'ص = ١٫٥س − ٢', ['ص = ٣س − ٤', 'ص = ١٫٥س + ٢', 'ص = −١٫٥س − ٢'], 'اجعل ص وحدها ثم اقسم على ٢.', '8As1'));
  { const [m, c, x] = fresh(() => [pick([2, 3, -2]), R(-3, 4), R(1, 4)]); items.push(num(`في جدول قيم المستقيم ${yeq(m, c)}، ما قيمة ص عند س = ${N(x)}؟`, m * x + c, 'عوّض.', '8As1', { neg: true })); }
  items.push(tf('المعادلتان ص = ٣ − ٢س و ٢س + ص = ٣ تمثلان المستقيم نفسه.', true, 'أضف ٢س إلى الطرفين في الأولى.', '8As1', 'هما صورتان لمعادلة واحدة.'));
  items.push(tf('ميل المستقيم ٢ص = ٦س + ٨ يساوي ٦.', false, 'اقسم على ٢ أولاً.', '8As1', 'ص = ٣س + ٤، فالميل ٣.'));
  { const [k, c] = fresh(() => [pick([2, 3, 4]), R(1, 6)]); items.push(num(`ما الجزء المقطوع من محور الصادات للمستقيم ${tm(k, 'ص')} = ${tm(k, 'س')} + ${N(k * c)}؟`, c, 'اقسم على معامل ص.', '8As1')); }
  items.push(choice('لرسم مستقيم من معادلته تكفي:', 'نقطتان، والثالثة للتحقق', ['نقطة واحدة', 'عشر نقاط', 'الميل وحده'], 'كم نقطة تحدد مستقيماً؟', '8As1'));
  { const [a, b, d] = fresh(() => [pick([1, 2, 3]), 1, R(2, 8)]); items.push(num(`ما الجزء المقطوع من محور الصادات للمستقيم ${tm(a, 'س')} + ص = ${N(d)}؟`, d, 'ضع س = ٠.', '8As1')); }
  { const [m, c] = fresh(() => [pick([-2, -3, 2]), R(1, 5)]); items.push(choice(`النقطة التي تقع على المستقيم ${yeq(m, c)}:`, pt(1, m + c), [pt(1, m - c), pt(m + c, 1), pt(0, -c)], 'عوّض بإحداثيي النقطة.', '8As1')); }
  return items.sort(() => Math.random() - .5);
}

export default mission({
  title: 'رسّام المسارات', icon: '✏️', who, rounds: 6, make, draw,
  intro: ['أنا دانة، مهندسة المسارات. أخطط كل مسار جديد على الشبكة قبل أن نجهّزه.', 'المعادلة قد تأتي بأي صورة… أرتّبها، أختار نقطتين، وأرسم!'],
  outro: ['ممتاز! كل المسارات مرسومة بدقة.', 'تحدي الرسم البياني للخط المستقيم.'],
  challenge: { title: 'تحدي الرسم', make: challenge }
});
export const ROUNDS = 6;
export { make, challenge };
