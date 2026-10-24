// ١١-٣ معادلة الخط المستقيم ص = م س + جـ — «إشارات المسارات»: الحَكَم سيف يكتب على كل مسار معادلته: م معامل س وهو الميل،
// وجـ الجزء المقطوع من محور الصادات. الميل والمقطع من المعادلة، والمستقيم الموازي المار بنقطة، وأي معادلة لهذا الرسم، والمستقيمات المتوازية،
// ونقطة على المستقيم. التحدي: ٨ أسئلة من 8As1 (الكتاب ص٥٣–٥٤).
import { mission } from '../../mission.js';
import { N, R, eq } from '../../math.js';
import { choice, num, tf } from '../../../missions/challenge.js';
import { duneBg, say, glow, plane, pt } from './art.js';

const who = { name: 'الحَكَم سيف', face: '⛷️', id: 'saif' };
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuf = a => a.map(v => [Math.random(), v]).sort((p, q) => p[0] - q[0]).map(x => x[1]);
// المعادلة ص = م س + جـ كما يكتبها الكتاب (م = ١ لا يُكتب، والحد الثابت بإشارته)
export const yeq = (m, c) => `ص = ${m === 0 ? '' : `${m < 0 ? '−' : ''}${Math.abs(m) === 1 ? '' : N(Math.abs(m))}س`}${c === 0 ? (m === 0 ? N(0) : '') : m === 0 ? N(c) : c > 0 ? ` + ${N(c)}` : ` − ${N(-c)}`}`;
const MM = [1, 2, 3, -1, -2, -3, .5, -.5, 1.5, -1.5, 4];

function draw(g, w, h, t, S) {
  const r = S.r ? S.r.data : {}; duneBg(g, w, h, t);
  const s = Math.min(w * .55, h * .78), x = w * .5 - s / 2, y = h * .1;
  const show = (r.lines || []).filter(L => !L.after || S.done);
  plane(g, x, y, s, -6, 6, { lines: show, pts: (r.pts || []).filter(p => !p.after || S.done) });
  (r.tags || []).forEach((tg, k) => say(g, tg, w * .5, h * .94 - k * 22, 16, k ? '#1E3A8A' : '#7C3AED', 900));
  glow(g, w, h, S);
}

function make(i) {
  if (i === 0 || i === 1) { const m = pick(MM), c = R(-5, 5, true), k = i;
    return { q: `معادلة المسار ${yeq(m, c)}. ما ${k ? 'الجزء المقطوع من محور الصادات' : 'ميل المسار'}؟`, input: { type: 'num', neg: true, dot: true }, sol: k ? c : m, ok: v => eq(v, k ? c : m),
      hint: k ? 'ما قيمة ص حين يكون س = ٠؟' : 'في الصورة ص = م س + جـ: أي عدد هو م؟', bad: v => eq(v, k ? m : c) ? (k ? 'هذا الميل.' : 'هذا المقطع، والميل معامل س.') : eq(v, -(k ? c : m)) ? 'راجع الإشارة.' : '',
      good: k ? `جـ = ${N(c)}` : `م = ${N(m)}`, data: { lines: [{ m, c }], pts: [{ p: [0, c], l: `${pt(0, c)}`, col: '#EA580C', after: k }], tags: [yeq(m, c)] } }; }
  if (i === 2) { let m, p, c2; do { m = pick([1, 2, 3, -1, -2, -3]); p = [R(-3, 3), R(-4, 4)]; c2 = p[1] - m * p[0]; } while (Math.abs(c2) > 6 || c2 === 0);
    const c1 = c2 === 3 ? 1 : 3;
    return { q: `معادلة مسار ${yeq(m, c1)}. ما معادلة المسار الموازي له المار بالنقطة ${pt(...p)}؟ اكتب الميل ثم المقطع.`, input: { type: 'blanks', tpl: 'م = {} ، جـ = {}', neg: true }, sol: [m, c2], ok: v => v[0] === m && v[1] === c2,
      hint: 'المستقيمان المتوازيان لهما الميل نفسه. عوّض بالنقطة في ص = م س + جـ لتجد جـ.', bad: v => v[0] !== m ? 'المتوازيان لهما الميل نفسه.' : v[1] === c1 ? 'هذا مقطع المسار الأول: عوّض بالنقطة.' : 'عوّض: ' + N(p[1]) + ' = ' + N(m) + ' × ' + N(p[0]) + ' + جـ',
      good: yeq(m, c2), data: { lines: [{ m, c: c1, col: '#1E3A8A' }, { m, c: c2, after: 1 }], pts: [{ p, l: pt(...p) }], tags: [yeq(m, c1)] } }; }
  if (i === 3) { const m = pick([1, 2, -1, -2, .5, -.5]), c = R(-4, 4, true), right = yeq(m, c), opts = shuf([right, yeq(-m, c), yeq(m, -c), yeq(c, m)].filter((v, k, A) => A.indexOf(v) === k));
    return { q: 'أي معادلة لهذا المسار؟', input: { type: 'pick', opts }, ok: v => opts[v] === right,
      hint: 'أين يقطع المستقيم محور الصادات؟ وهل يصعد أم ينزل؟ وكم؟', bad: () => 'تحقق من المقطع أولاً ثم من الميل وإشارته.',
      good: right, data: { lines: [{ m, c }], tags: [] } }; }
  if (i === 4) { const m = pick([2, -1, 3, .5]), c = R(-3, 3), right = `${yeq(m, c)} و ${yeq(m, c + 4)}`, opts = shuf([right, `${yeq(m, c)} و ${yeq(-m, c + 4)}`, `${yeq(m, c)} و ${yeq(m + 1, c)}`]);
    return { q: 'أي زوج من المسارات متوازيان؟', input: { type: 'pick', opts }, ok: v => opts[v] === right,
      hint: 'ما الذي يجب أن يتساوى في المستقيمين المتوازيين؟', bad: () => 'المتوازيان لهما الميل نفسه، ويختلف المقطع.',
      good: right, data: { lines: [{ m, c, after: 1 }, { m, c: c + 4, after: 1, col: '#1E3A8A' }], tags: [] } }; }
  const m = pick(MM), c = R(-5, 5), x0 = R(-4, 4, true), y0 = m * x0 + c;
  return { q: `معادلة المسار ${yeq(m, c)}. ما قيمة ص عند النقطة التي فيها س = ${N(x0)}؟`, input: { type: 'num', neg: true, dot: true }, sol: y0, ok: v => eq(v, y0),
    hint: 'عوّض بقيمة س في المعادلة، واحسب بترتيب العمليات.', bad: v => eq(v, m + x0 + c) ? 'م س تعني م × س.' : '',
    good: `ص = ${N(m)} × ${N(x0)} + ${N(c)} = ${N(y0)}`, data: { lines: [{ m, c }], pts: [{ p: [x0, y0], l: pt(x0, y0), col: '#EA580C', after: 1 }], tags: [yeq(m, c)] } };
}

function challenge() {
  const items = [], used = new Set(), fresh = f => { for (let k = 0; k < 60; k++) { const x = f(); const s = JSON.stringify(x); if (!used.has(s)) { used.add(s); return x; } } return f(); };
  { const [m, c] = fresh(() => [pick(MM), R(-9, 9, true)]); items.push(num(`ما ميل المستقيم ${yeq(m, c)}؟`, m, 'معامل س.', '8As1', { neg: true, dot: true })); }
  { const [m, c] = fresh(() => [pick(MM), R(-9, 9, true)]); items.push(num(`ما الجزء المقطوع من محور الصادات للمستقيم ${yeq(m, c)}؟`, c, 'الحد الثابت.', '8As1', { neg: true, dot: true })); }
  { const [m, c] = fresh(() => [pick([2, 3, -1]), R(1, 6)]); items.push(choice(`المستقيم الموازي للمستقيم ${yeq(m, c)}:`, yeq(m, c + 2), [yeq(-m, c), yeq(m + 1, c), yeq(c, m)], 'الميل نفسه.', '8As1')); }
  items.push(tf('ميل المستقيم ص = ٣س − ١٥ يساوي ٣−.', false, 'معامل س؟', '8As1', 'الميل ٣ والمقطع ١٥−.'));
  items.push(tf('المستقيمات ص = ٠٫٥س و ص = ٠٫٥س + ٣ و ص = ٠٫٥س − ٢ متوازية.', true, 'قارن الميول.', '8As1', 'كلها ميلها ٠٫٥.'));
  { const [m, p] = fresh(() => [pick([2, 3, -2]), [R(1, 4), R(2, 9)]]); items.push(num(`مستقيم ميله ${N(m)} ويمر بالنقطة ${pt(...p)}. ما الجزء المقطوع من محور الصادات؟`, p[1] - m * p[0], 'عوّض بالنقطة في ص = م س + جـ.', '8As1', { neg: true })); }
  { const [m, c, x0] = fresh(() => [pick([2, 3, -1]), R(-3, 5), R(1, 5)]); items.push(num(`النقطة (${N(x0)}، ص) تقع على المستقيم ${yeq(m, c)}. ما ص؟`, m * x0 + c, 'عوّض بقيمة س.', '8As1', { neg: true })); }
  items.push(choice('في المعادلة ص = م س + جـ، الحرف جـ هو:', 'الجزء المقطوع من محور الصادات', ['الميل', 'الجزء المقطوع من محور السينات', 'نقطة المنتصف'], 'ما قيمة ص حين س = ٠؟', '8As1'));
  return items.sort(() => Math.random() - .5);
}

export default mission({
  title: 'إشارات المسارات', icon: '🪧', who, rounds: 6, make, draw,
  intro: ['أنا الحَكَم سيف. على رأس كل مسار لوحة فيها معادلته.', 'من المعادلة ص = م س + جـ أعرف كل شيء: م يخبرني بالميل، وجـ أين يبدأ المسار عند محور الصادات.'],
  outro: ['رائع! صارت كل لوحة تطابق مسارها.', 'تحدي معادلة الخط المستقيم.'],
  challenge: { title: 'تحدي المعادلة', make: challenge }
});
export const ROUNDS = 6;
export { make, challenge };
