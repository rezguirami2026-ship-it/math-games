// ٥-٨ فك ناتج عبارتين خطيتين — «حديقة جابر»: البستاني جابر يقسم حوض زهور مستطيلاً طوله (س + أ) وعرضه (س + ب) إلى أربعة أحواض:
// مربع س٢، ومستطيلان أس وبس، ومستطيل صغير أب. الطالب يكتب معامل س والحد الثابت بعد الفك والتبسيط (بإشارات سالبة أيضاً)،
// ويكتشف خطأ (س + أ)٢ = س٢ + أ٢. التحدي: ٨ أسئلة من 8Ae11 (الكتاب ص٩٥–٩٧).
import { mission } from '../../mission.js';
import { N, R, pw } from '../../math.js';
import { choice, tf, num } from '../../../missions/challenge.js';
import { parchment, expr, say, TEAL } from './art.js';

const who = { name: 'البستاني جابر', face: '👨🏽‍🌾', id: 'jaber' };
const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(x => x[1]);
const br = (v, a) => `(${v} ${a < 0 ? '−' : '+'} ${N(Math.abs(a))})`;
const quad = (v, b, c) => `${pw(v, 2)}${b ? ` ${b < 0 ? '−' : '+'} ${Math.abs(b) === 1 ? '' : N(Math.abs(b))}${v}` : ''}${c ? ` ${c < 0 ? '−' : '+'} ${N(Math.abs(c))}` : ''}`;

function draw(g, w, h, t, S) {
  const r = S.r ? S.r.data : {}; parchment(g, w, h);
  if (r.a == null) { if (r.err) { g.fillStyle = '#FFFDF6'; g.fillRect(w * .1, h * .25, w * .8, h * .4); say(g, 'دفتر جابر', w * .5, h * .34, 15, '#64748B'); expr(g, r.err, w * .5, h * .52, 24, '#B91C1C'); } return; }
  // نموذج المساحة: الطول س + |أ|، والعرض س + |ب| (القيم السالبة تُظلَّل أحمر)
  const X = w * .2, Y = h * .14, sx = w * .34, sy = h * .5, ax = Math.min(w * .22, Math.abs(r.a) * 14 + 26), by = Math.min(h * .26, Math.abs(r.b) * 9 + 22);
  const cells = [[X, Y, sx, sy, '#BBF7D0', [{ b: r.v, e: N(2) }]], [X + sx, Y, ax, sy, r.a < 0 ? '#FECACA' : '#FDE68A', [`${N(r.a)}${r.v}`]], [X, Y + sy, sx, by, r.b < 0 ? '#FECACA' : '#FDE68A', [`${N(r.b)}${r.v}`]], [X + sx, Y + sy, ax, by, r.a * r.b < 0 ? '#FECACA' : '#BFDBFE', [N(r.a * r.b)]]];
  cells.forEach(([x, y, ww, hh, col, lab], k) => { g.fillStyle = col; g.fillRect(x, y, ww, hh); g.strokeStyle = '#3F6212'; g.lineWidth = 3; g.strokeRect(x, y, ww, hh); if (S.done || k === 0) expr(g, lab, x + ww / 2, y + hh / 2 + 8, k === 3 ? 16 : 20, k === 0 ? '#14532D' : TEAL); });
  expr(g, [r.v], X + sx / 2, Y - 8, 18); expr(g, [N(r.a)], X + sx + ax / 2, Y - 8, 18); expr(g, [r.v], X - 14, Y + sy / 2 + 6, 18); expr(g, [N(r.b)], X - 14, Y + sy + by / 2 + 6, 18);
  if (S.pulse > 0) { g.strokeStyle = `rgba(34,197,94,${S.pulse})`; g.lineWidth = 6; g.strokeRect(4, 4, w - 8, h - 8); }
}

function make(i) {
  const v = ['س', 'ص', 'ع'][R(0, 2)];
  if (i <= 3) {
    let a, b; if (i === 0) { a = R(1, 7); b = R(1, 7); } else if (i === 1) { a = R(3, 9); b = -R(1, 6); } else if (i === 2) { a = -R(1, 6); b = -R(1, 6); } else { a = R(2, 7) * (R(0, 1) ? 1 : -1); b = a; }
    if (a + b === 0) return make(i);
    const B = a + b, C = a * b, tpl = `${pw(v, 2)} + {}${v} + {}`;
    return { q: i === 3 ? `افكك وبسّط: ${br(v, a)}<sup>${N(2)}</sup>` : `افكك وبسّط: ${br(v, a)}${br(v, b)}`, input: { type: 'blanks', tpl, neg: true }, sol: [B, C], ok: x => x[0] === B && x[1] === C,
      hint: 'اضرب كل حد في القوس الأول في كل حد في القوس الثاني (أربعة حدود)، ثم اجمع الحدين المتشابهين.', bad: x => x[0] === B && x[1] === -C ? 'انتبه لإشارة الحد الثابت: سالب × سالب = ؟' : x[0] === 0 && x[1] === C ? 'نسيتَ الحدين الأوسطين.' : x[0] === a * b && x[1] === B ? 'معامل الحد الأوسط مجموع العددين، والحد الثابت حاصل ضربهما.' : '',
      good: `أحسنت! ${br(v, a)}${i === 3 ? '<sup>٢</sup>' : br(v, b)} = ${quad(v, B, C)}`, data: { a, b, v } }; }
  // الخطأ الشائع: (س + أ)٢ = س٢ + أ٢
  const a = R(2, 8), kind = R(0, 1), shown = kind ? quad(v, 0, a * a) : quad(v, 2 * a, a * a), opts = shuffle(['صحيح', 'خاطئ: نسيَ الحد الأوسط', 'خاطئ: الحد الثابت يجب أن يكون ' + N(2 * a)]);
  const right = kind ? 'خاطئ: نسيَ الحد الأوسط' : 'صحيح';
  return { q: `كتب جابر: ${br(v, a)}<sup>٢</sup> = ${shown}. ما رأيك؟`, input: { type: 'pick', opts }, ok: k => opts[k] === right,
    hint: `${br(v, a)}<sup>٢</sup> تعني ${br(v, a)}${br(v, a)}: افككها كاملة وقارن.`, bad: () => '', good: kind ? `أحسنت! الصحيح ${quad(v, 2 * a, a * a)}.` : 'أحسنت! فكٌّ صحيح.', data: { err: [{ b: `(${v} + ${N(a)})`, e: N(2) }, ' = ', { b: v, e: N(2) }, kind ? ` + ${N(a * a)}` : ` + ${N(2 * a)}${v} + ${N(a * a)}`] } };
}

function challenge() {
  const items = [], used = new Set(), fresh = f => { for (let k = 0; k < 60; k++) { const x = f(); const s = JSON.stringify(x); if (!used.has(s)) { used.add(s); return x; } } return f(); };
  { const [a, b] = fresh(() => [R(1, 6), R(1, 6)]); items.push(choice(`(س + ${N(a)})(س + ${N(b)}) =`, quad('س', a + b, a * b), [quad('س', a * b, a + b), quad('س', 0, a * b), quad('س', a + b, a + b)].filter(x => x !== quad('س', a + b, a * b)), 'أربعة حدود ثم اجمع المتشابهين.', '8Ae11')); }
  { const [a, b] = fresh(() => [R(3, 9), R(1, 2)]); items.push(num(`في فك (ص + ${N(a)})(ص − ${N(b)})، ما معامل ص؟`, a - b, 'اجمع معاملي الحدين الأوسطين بإشارتيهما.', '8Ae11')); }
  { const [a, b] = fresh(() => [R(2, 7), R(2, 7)]); items.push(num(`في فك (س − ${N(a)})(س − ${N(b)})، ما الحد الثابت؟`, a * b, 'سالب × سالب = موجب.', '8Ae11')); }
  items.push(tf(`(س + ٣)<sup>٢</sup> = ${quad('س', 0, 9)}`, false, 'افكك (س + ٣)(س + ٣).', '8Ae11', 'الصحيح س أسّها ٢ + ٦س + ٩.'));
  items.push(tf(`(س + ٢)(س + ٣) = ${quad('س', 5, 6)}`, true, 'اضرب كل حد في كل حد.', '8Ae11', 'س أسّها ٢ + ٣س + ٢س + ٦.'));
  items.push(choice('عند فك (س + أ)(س + ب) نحصل على عدد من الحدود قبل التبسيط:', N(4), [N(2), N(3), N(1)], 'كل حد من القوس الأول في كل حد من الثاني.', '8Ae11'));
  { const [a] = fresh(() => [R(2, 9)]); items.push(num(`في فك (ع + ${N(a)})<sup>٢</sup>، ما معامل ع؟`, 2 * a, 'الحد الأوسط يتكرر مرتين.', '8Ae11')); }
  { const [a, b] = fresh(() => [R(2, 6), R(2, 6)]); items.push(choice(`(م − ${N(a)})(م + ${N(b)}) =`, quad('م', b - a, -a * b), [quad('م', a - b || 1, -a * b), quad('م', b - a, a * b), quad('م', a + b, -a * b)].filter((x, j, A) => x !== quad('م', b - a, -a * b) && A.indexOf(x) === j), 'انتبه للإشارات في كل حاصل ضرب.', '8Ae11')); }
  return items.sort(() => Math.random() - .5);
}

export default mission({
  title: 'حديقة جابر', icon: '🌷', who, rounds: 5, make, draw,
  intro: ['حوض الزهور طوله (س + عدد) وعرضه (س + عدد آخر).', 'إن قسمته أربعة أحواض عرفتَ مساحته كلها… هذا هو فك القوسين!'],
  outro: ['زُرعت الأحواض الأربعة، وعرفتَ مساحة كل حوض.', 'لنختبر الفك بأسئلة متنوعة.'],
  challenge: { title: 'تحدي فك الأقواس', make: challenge }
});
export { make, challenge };
